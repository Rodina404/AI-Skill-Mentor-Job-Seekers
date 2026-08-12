/**
 * recruiterMatching.service.js
 *
 * Orchestrates AI Candidate Discovery for Recruiter Job Postings:
 * 1. Validates job ownership and authorization.
 * 2. Loads job posting requirements.
 * 3. Retrieves eligible candidate pool (platform-wide Job Seekers).
 * 4. Batches candidates and calls cv_matching_service.
 * 5. Correlates AI match outputs with candidate identity (candidateId, userId).
 * 6. Performs global sorting across all batches.
 * 7. Handles errors, timeouts, and partial batch failures cleanly.
 */

const axios = require('axios');
const { supabaseAdmin } = require('../config/supabase');
const { getCandidatePool } = require('../repositories/candidatePool.repository');

const SERVICES = {
  matching: process.env.CV_MATCHING_URL || 'http://localhost:8003',
};

class RecruiterMatchingError extends Error {
  constructor(code, message, statusCode = 500, details = null) {
    super(message);
    this.name = 'RecruiterMatchingError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Execute AI candidate discovery and matching for a recruiter's job posting.
 *
 * @param {Object} params
 * @param {string} params.jobId - UUID of the job posting
 * @param {string} params.recruiterId - UUID of the authenticated user
 * @param {string} params.userRole - Role of the authenticated user ('recruiter' | 'admin')
 * @param {Object} [params.client] - Supabase client override (for testing)
 * @param {Function} [params.candidatePoolFn] - Candidate pool repository function override
 * @param {Function} [params.axiosPostFn] - Axios POST function override (for testing)
 * @param {number} [params.aiBatchSize=50] - Number of candidates per AI request batch
 * @returns {Promise<Object>} Formatted matching result
 */
const runRecruiterJobMatching = async ({
  jobId,
  recruiterId,
  userRole,
  client = supabaseAdmin,
  candidatePoolFn = getCandidatePool,
  axiosPostFn = axios.post,
  aiBatchSize = 50,
} = {}) => {
  // ── Step 1: Input Validation ─────────────────────────────────────────
  if (!jobId || typeof jobId !== 'string' || jobId.trim() === '') {
    throw new RecruiterMatchingError('INVALID_JOB_ID', 'jobId is required and must be a valid string', 400);
  }

  if (userRole !== 'recruiter' && userRole !== 'admin') {
    throw new RecruiterMatchingError('FORBIDDEN_ROLE', 'Forbidden: Recruiter or admin role required', 403);
  }

  // ── Step 2: Fetch Job Posting & Check Ownership ──────────────────────
  const { data: job, error: jobErr } = await client
    .from('job_postings')
    .select('*')
    .eq('id', jobId)
    .single();

  if (jobErr || !job) {
    throw new RecruiterMatchingError('JOB_NOT_FOUND', 'Job posting not found', 404);
  }

  if (userRole !== 'admin' && job.recruiter_id !== recruiterId) {
    throw new RecruiterMatchingError('FORBIDDEN_OWNERSHIP', 'Forbidden: You do not own this job posting', 403);
  }

  // ── Step 3: Construct AI Job Description Text ────────────────────────
  const requiredSkillsArr = Array.isArray(job.required_skills)
    ? job.required_skills
    : (typeof job.required_skills === 'string'
        ? (parseJsonArray(job.required_skills) || [])
        : []);

  const jobDescriptionParts = [
    job.title ? `Job Title: ${job.title}` : null,
    job.job_description || job.description || null,
    requiredSkillsArr.length > 0 ? `Required Skills: ${requiredSkillsArr.join(', ')}` : null,
    job.location ? `Location: ${job.location}` : null,
  ].filter(Boolean);

  const jobDescriptionText = jobDescriptionParts.join('\n\n');

  if (!jobDescriptionText || jobDescriptionText.trim() === '') {
    throw new RecruiterMatchingError(
      'INVALID_JOB_DESCRIPTION',
      'Job posting lacks sufficient description or required skills for AI matching',
      400
    );
  }

  // ── Step 4: Retrieve Candidate Pool Pages (Exhausts Pool) ────────────
  let allCandidates = [];
  let poolOffset = 0;
  const poolPageSize = 50;
  let hasMorePages = true;

  while (hasMorePages) {
    const poolResult = await candidatePoolFn({
      batchSize: poolPageSize,
      offset: poolOffset,
      client,
    });

    const pageCandidates = poolResult.candidates || [];
    if (pageCandidates.length === 0) break;

    allCandidates.push(...pageCandidates);
    poolOffset += pageCandidates.length;
    hasMorePages = Boolean(poolResult.hasMore);
  }

  // Deduplicate candidate pool entries by candidateId (safety net)
  const candidatePoolMap = new Map();
  for (const c of allCandidates) {
    if (c && c.candidateId && !candidatePoolMap.has(c.candidateId)) {
      candidatePoolMap.set(c.candidateId, c);
    }
  }
  const uniqueCandidatePool = Array.from(candidatePoolMap.values());
  const candidatesConsidered = uniqueCandidatePool.length;

  if (candidatesConsidered === 0) {
    return {
      success: true,
      data: {
        jobId: job.id,
        jobTitle: job.title,
        candidatesConsidered: 0,
        candidatesSuccessfullyEvaluated: 0,
        completionStatus: 'complete',
        calculatedAt: new Date().toISOString(),
        rankedCandidates: [],
      },
    };
  }

  // ── Step 5: Batch AI Microservice Calls ──────────────────────────────
  const aiBatches = chunkArray(uniqueCandidatePool, Math.min(Math.max(1, aiBatchSize), 100));
  const evaluatedCandidatesMap = new Map();
  let batchesSuccessful = 0;
  let batchesFailed = 0;
  const batchErrors = [];

  for (let i = 0; i < aiBatches.length; i++) {
    const batch = aiBatches[i];
    const submittedBatchMap = new Map(batch.map(c => [c.candidateId, c]));

    // Build strict CandidateInput projection for AI (no PII, no email/phone/resume URL)
    const aiCandidatesInput = batch.map(c => ({
      candidateId: c.candidateId,
      name: c.name || 'Unknown Candidate',
      skills: Array.isArray(c.skills) ? c.skills : [],
      experience: typeof c.experience === 'number' && !isNaN(c.experience) && isFinite(c.experience)
        ? Math.max(0, c.experience)
        : 0.0,
      education: c.education || null,
    }));

    const matchPayload = {
      jobId: job.id,
      jobDescription: jobDescriptionText,
      candidates: aiCandidatesInput,
    };

    try {
      const response = await axiosPostFn(
        `${SERVICES.matching}/match`,
        matchPayload,
        { timeout: 30000 }
      );

      const resData = response?.data;
      if (!resData || resData.success !== true || !resData.data || !Array.isArray(resData.data.rankedCandidates)) {
        const errMsg = resData?.error?.message || 'Invalid or unsuccessful AI match response shape';
        throw new Error(errMsg);
      }

      const aiRankedList = resData.data.rankedCandidates;
      let validCandidateCountInBatch = 0;

      // Correlate AI ranked list back to input batch candidates strictly by candidateId
      for (let rIdx = 0; rIdx < aiRankedList.length; rIdx++) {
        const aiResult = aiRankedList[rIdx];
        if (!aiResult) continue;

        // Identity Validation (TASK 6 & 7): Require explicit candidateId matching submitted batch
        const candidateId = aiResult.candidateId;
        if (!candidateId || typeof candidateId !== 'string' || candidateId.trim() === '') {
          console.warn('[RecruiterMatching] Rejecting AI candidate result: missing or invalid candidateId string');
          continue;
        }

        if (!submittedBatchMap.has(candidateId)) {
          console.warn(`[RecruiterMatching] Rejecting candidate ID ${candidateId}: not in submitted batch`);
          continue;
        }

        if (evaluatedCandidatesMap.has(candidateId)) {
          console.warn(`[RecruiterMatching] Rejecting candidate ID ${candidateId}: duplicate result in AI response`);
          continue;
        }

        const matchedPoolCandidate = submittedBatchMap.get(candidateId);
        const uId = matchedPoolCandidate.userId;

        // Strict Canonical Score Validation (TASK 4 & 5): Must be float in [0.0, 100.0]
        if (aiResult.score === null || aiResult.score === undefined) {
          console.warn(`[RecruiterMatching] Rejecting candidate ${candidateId}: score is null or undefined`);
          continue;
        }

        const rawScore = Number(aiResult.score);
        if (!Number.isFinite(rawScore) || isNaN(rawScore) || rawScore < 0.0 || rawScore > 100.0) {
          console.warn(`[RecruiterMatching] Rejecting candidate ${candidateId}: invalid score ${aiResult.score} outside canonical [0, 100] range`);
          continue;
        }

        // Canonical integer score conversion: Math.round(rawScore) without 0-1 multiplication heuristics
        const normalizedScore = Math.round(rawScore);

        const candidateEntry = {
          candidateId,
          userId: uId,
          name: matchedPoolCandidate.name || aiResult.name || 'Unknown Candidate',
          score: normalizedScore,
          matchScore: normalizedScore,
          experience: typeof aiResult.experience === 'number' && !isNaN(aiResult.experience) && isFinite(aiResult.experience)
            ? aiResult.experience
            : matchedPoolCandidate.experience,
          education: matchedPoolCandidate.education || null,
          skills: Array.isArray(aiResult.skills) ? aiResult.skills : matchedPoolCandidate.skills,
          matchingSkills: Array.isArray(aiResult.matching_skills) ? aiResult.matching_skills : [],
          missingSkills: Array.isArray(aiResult.missing_skills) ? aiResult.missing_skills : [],
          skillMatchCount: typeof aiResult.skill_match_count === 'number' ? aiResult.skill_match_count : 0,
          skillTotalRequired: typeof aiResult.skill_total_required === 'number' ? aiResult.skill_total_required : 0,
        };

        evaluatedCandidatesMap.set(candidateId, candidateEntry);
        validCandidateCountInBatch++;
      }

      if (aiRankedList.length > 0 && validCandidateCountInBatch === 0) {
        throw new Error('All candidate results in batch failed score or identity validation');
      }

      batchesSuccessful++;
    } catch (err) {
      batchesFailed++;
      const statusCode = err.response?.status;
      const errorDetail = err.response?.data?.detail || err.response?.data?.error?.message || err.message;
      batchErrors.push(`Batch ${i + 1}/${aiBatches.length} failed (${statusCode || 'network'}): ${errorDetail}`);
    }
  }

  // ── Step 6: Evaluate Partial Failure / Complete Failure ─────────────
  if (batchesSuccessful === 0) {
    throw new RecruiterMatchingError(
      'AI_MATCHING_SERVICE_FAILED',
      `CV Matching Service failed across all batches: ${batchErrors.join('; ')}`,
      502,
      { batchErrors }
    );
  }

  const completionStatus = batchesFailed > 0 ? 'partial' : 'complete';

  // ── Step 7: Global Ranking Across All Batches ───────────────────────
  const finalRankedCandidates = Array.from(evaluatedCandidatesMap.values());
  finalRankedCandidates.sort((a, b) => b.score - a.score);

  return {
    success: true,
    data: {
      jobId: job.id,
      jobTitle: job.title,
      candidatesConsidered,
      candidatesSuccessfullyEvaluated: finalRankedCandidates.length,
      completionStatus,
      calculatedAt: new Date().toISOString(),
      rankedCandidates: finalRankedCandidates,
      ...(batchErrors.length > 0 ? { batchErrors } : {}),
    },
  };
};

/** Helper to slice array into chunks */
const chunkArray = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

/** Helper to safely parse JSON array */
const parseJsonArray = (str) => {
  try {
    const val = JSON.parse(str);
    return Array.isArray(val) ? val : null;
  } catch {
    return null;
  }
};

module.exports = {
  runRecruiterJobMatching,
  RecruiterMatchingError,
  SERVICES,
};
