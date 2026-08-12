const { supabaseAdmin } = require('../config/supabase');

/**
 * Custom Error Class for Recruiter Match Persistence
 */
class RecruiterMatchPersistenceError extends Error {
  constructor(code, message, statusCode = 500) {
    super(message);
    this.name = 'RecruiterMatchPersistenceError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Persists validated Recruiter AI Candidate Match results into Supabase.
 *
 * POLICY:
 * - COMPLETE run: Upserts all evaluated candidates and synchronizes (deletes obsolete candidates absent from new run).
 * - PARTIAL run: Does NOT overwrite or delete existing complete rankings in database. Returns persisted: false.
 *
 * @param {Object} params
 * @param {string} params.jobId - Job posting UUID
 * @param {Array<Object>} params.rankedCandidates - Array of validated ranked candidate objects from recruiter matching service
 * @param {string} params.completionStatus - 'complete' or 'partial'
 * @param {Object} [params.client] - Supabase client instance (defaults to supabaseAdmin)
 * @returns {Promise<Object>} Persistence summary result
 */
async function persistRecruiterMatches({ jobId, rankedCandidates = [], completionStatus = 'complete', client = supabaseAdmin }) {
  if (!jobId) {
    throw new RecruiterMatchPersistenceError('INVALID_JOB_ID', 'jobId is required for match persistence', 400);
  }

  // TASK 8: PARTIAL RUN POLICY
  // Partial runs must NOT overwrite stored complete rankings.
  if (completionStatus !== 'complete') {
    console.warn(`[RecruiterMatchPersistence] Skipping persistence for job ${jobId} because completionStatus is '${completionStatus}'`);
    return {
      success: true,
      persisted: false,
      reason: 'partial_run',
      candidateCount: rankedCandidates.length,
    };
  }

  const nowIso = new Date().toISOString();
  const validEvaluatedProfileIds = new Set();

  // Construct upsert payloads strictly from validated Phase 2.7 fields
  const upsertPayloads = (rankedCandidates || []).map((cand) => {
    const profileId = cand.candidateId; // Verified job_seeker_profiles.id
    if (!profileId || typeof profileId !== 'string') {
      throw new RecruiterMatchPersistenceError('INVALID_CANDIDATE_ID', `Invalid candidateId: ${profileId}`, 400);
    }

    validEvaluatedProfileIds.add(profileId);

    const matchScoreInt = Math.min(Math.max(0, Math.round(Number(cand.score || cand.matchScore || 0))), 100);

    return {
      job_posting_id: jobId,
      job_seeker_profile_id: profileId,
      user_id: cand.userId || null,
      match_score: matchScoreInt,
      overall_score: matchScoreInt / 100.0,
      matched_skills: Array.isArray(cand.matchingSkills) ? cand.matchingSkills : [],
      missing_skills: Array.isArray(cand.missingSkills) ? cand.missingSkills : [],
      calculated_at: nowIso,
    };
  });

  // TASK 2: FAIL-CLOSED RPC SYNCHRONIZATION
  // Complete-run synchronization MUST use sync_recruiter_candidate_matches RPC.
  // Zero non-atomic fallbacks allowed. If RPC fails, is missing, or returns an error, throw.
  if (typeof client.rpc !== 'function') {
    throw new RecruiterMatchPersistenceError(
      'RPC_UNAVAILABLE',
      'Transactional match synchronization RPC (sync_recruiter_candidate_matches) is missing from database client',
      500
    );
  }

  const { data: rpcRes, error: rpcErr } = await client.rpc('sync_recruiter_candidate_matches', {
    p_job_id: jobId,
    p_matches: upsertPayloads,
    p_calculated_at: nowIso,
  });

  if (rpcErr) {
    console.error('[RecruiterMatchPersistence] RPC execution error:', rpcErr.message);
    throw new RecruiterMatchPersistenceError(
      'RPC_SYNC_FAILED',
      `Complete-run match synchronization transaction failed: ${rpcErr.message}`,
      500
    );
  }

  if (!rpcRes || rpcRes.success !== true) {
    throw new RecruiterMatchPersistenceError(
      'RPC_SYNC_INVALID_RESPONSE',
      'Transactional match synchronization returned an invalid or unsuccessful response',
      500
    );
  }

  return {
    success: true,
    persisted: true,
    persistedCount: rpcRes.upserted_count !== undefined ? rpcRes.upserted_count : upsertPayloads.length,
    clearedObsoleteCount: rpcRes.deleted_count || 0,
    calculatedAt: nowIso,
  };
}

/**
 * Retrieves persisted candidate matches for a recruiter's job with staleness checks.
 *
 * @param {Object} params
 * @param {string} params.jobId - Job posting UUID
 * @param {string} params.recruiterId - Authenticated user UUID
 * @param {string} params.userRole - 'recruiter' or 'admin'
 * @param {number} [params.page=1]
 * @param {number} [params.limit=20]
 * @param {Object} [params.client]
 */
async function getPersistedCandidateMatches({ jobId, recruiterId, userRole = 'recruiter', page = 1, limit = 20, client = supabaseAdmin }) {
  if (!jobId) {
    throw new RecruiterMatchPersistenceError('INVALID_JOB_ID', 'jobId is required', 400);
  }

  // 1. Verify Job Ownership & get updated_at timestamp
  const { data: job, error: jobErr } = await client
    .from('job_postings')
    .select('id, title, recruiter_id, updated_at')
    .eq('id', jobId)
    .single();

  if (jobErr || !job) {
    throw new RecruiterMatchPersistenceError('JOB_NOT_FOUND', 'Job posting not found', 404);
  }

  if (userRole !== 'admin' && job.recruiter_id !== recruiterId) {
    throw new RecruiterMatchPersistenceError('FORBIDDEN', 'Access denied: You do not own this job posting', 403);
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (pageNum - 1) * pageSize;

  // 2. Fetch matches ordered by match_score DESC
  const { data: matches, error: matchErr, count } = await client
    .from('candidate_matches')
    .select(
      `
      id,
      job_posting_id,
      job_seeker_profile_id,
      user_id,
      match_score,
      overall_score,
      matched_skills,
      missing_skills,
      calculated_at,
      job_seeker_profiles!inner (
        id,
        years_of_experience,
        location,
        is_discoverable,
        updated_at,
        users!inner (
          first_name,
          last_name
        )
      )
    `,
      { count: 'exact' }
    )
    .eq('job_posting_id', jobId)
    .order('match_score', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (matchErr) {
    throw new RecruiterMatchPersistenceError('FETCH_MATCHES_FAILED', matchErr.message, 500);
  }

  // 3. Fetch latest resume timestamps for matched user_ids (TASK 5, 6, 7: Resume Staleness)
  const userIds = (matches || []).map((m) => m.user_id).filter(Boolean);
  const resumeCreatedAtByUser = new Map();

  if (userIds.length > 0) {
    try {
      const { data: resumes } = await client
        .from('resumes')
        .select('user_id, created_at, status')
        .in('user_id', userIds)
        .eq('status', 'processed')
        .order('created_at', { ascending: false });

      if (Array.isArray(resumes)) {
        for (const r of resumes) {
          if (!resumeCreatedAtByUser.has(r.user_id)) {
            resumeCreatedAtByUser.set(r.user_id, r.created_at ? new Date(r.created_at).getTime() : 0);
          }
        }
      }
    } catch (rErr) {
      console.warn('[RecruiterMatchPersistence] Resume timestamp fetch warning:', rErr.message);
    }
  }

  const jobUpdatedAt = job.updated_at ? new Date(job.updated_at).getTime() : 0;

  // 4. Process matches & compute staleness (TASK 7 & 8)
  const formattedMatches = (matches || []).map((m) => {
    const calcAtTime = m.calculated_at ? new Date(m.calculated_at).getTime() : 0;
    const profileUpdatedAt = m.job_seeker_profiles?.updated_at ? new Date(m.job_seeker_profiles.updated_at).getTime() : 0;
    const resumeCreatedAt = resumeCreatedAtByUser.get(m.user_id) || 0;

    // Staleness check:
    // Stale if Job updated after match, profile updated after match, resume created after match, or profile non-discoverable
    const isStale =
      jobUpdatedAt > calcAtTime ||
      profileUpdatedAt > calcAtTime ||
      resumeCreatedAt > calcAtTime ||
      m.job_seeker_profiles?.is_discoverable === false;

    const userObj = m.job_seeker_profiles?.users || {};

    return {
      matchId: m.id,
      candidateId: m.job_seeker_profile_id,
      userId: m.user_id,
      name: `${userObj.first_name || ''} ${userObj.last_name || ''}`.trim() || 'Job Seeker',
      score: m.match_score,
      matchScore: m.match_score,
      experience: m.job_seeker_profiles?.years_of_experience || 0,
      matchingSkills: Array.isArray(m.matched_skills) ? m.matched_skills : [],
      missingSkills: Array.isArray(m.missing_skills) ? m.missing_skills : [],
      calculatedAt: m.calculated_at,
      isStale,
    };
  });

  return {
    success: true,
    data: {
      jobId: job.id,
      jobTitle: job.title,
      totalMatches: count || formattedMatches.length,
      page: pageNum,
      limit: pageSize,
      matches: formattedMatches,
    },
  };
}

module.exports = {
  persistRecruiterMatches,
  getPersistedCandidateMatches,
  RecruiterMatchPersistenceError,
};
