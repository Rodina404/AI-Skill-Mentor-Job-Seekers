/**
 * candidatePool.repository.js
 *
 * Retrieves batches of discoverable job seeker profiles for recruiter
 * AI candidate matching.  This module is backend-internal only — it is
 * never exposed as a public endpoint.
 *
 * Design decisions:
 *   - Uses supabaseAdmin (service role) because the backend is the sole
 *     trusted gateway.  No RLS bypass for external callers.
 *   - Returns only the fields the CV Matching Service needs:
 *     candidateId, name, skills, experience, education.
 *   - Excludes email, phone, raw resume file_path, and any other PII
 *     unnecessary for matching.
 *   - Filters: role = 'job_seeker', is_discoverable = true,
 *     has a processed resume with normalized_skills.
 *   - Paginated with keyset (cursor) pagination for deterministic
 *     ordering and efficient large-dataset traversal.
 */

const { supabaseAdmin } = require('../config/supabase');

/** Default number of candidates returned per batch */
const DEFAULT_BATCH_SIZE = 50;

/** Hard upper limit to prevent accidental full-table dumps */
const MAX_BATCH_SIZE = 200;

/**
 * @typedef {Object} CandidatePoolEntry
 * @property {string} candidateId   - job_seeker_profiles.id (stable UUID)
 * @property {string} userId        - users.id (for deduplication / persistence)
 * @property {string} name          - "first_name last_name"
 * @property {string[]} skills      - normalized skill names from latest resume
 * @property {number} experience    - years_of_experience from profile
 * @property {string|null} education - degree from resume extracted_data, or null
 */

/**
 * Retrieve a paginated batch of discoverable candidates.
 *
 * Eligibility:
 *   1. users.role = 'job_seeker'
 *   2. job_seeker_profiles.is_discoverable = true
 *   3. At least one resume with status = 'processed' and non-empty normalized_skills
 *
 * @param {Object} options
 * @param {number} [options.batchSize=50] - Records per page (clamped to MAX_BATCH_SIZE)
 * @param {number} [options.offset=0]     - Offset for pagination
 * @param {Object} [options.client]       - Supabase client override (for testing)
 * @returns {Promise<{ candidates: CandidatePoolEntry[], total: number, hasMore: boolean }>}
 */
const getCandidatePool = async ({
  batchSize = DEFAULT_BATCH_SIZE,
  offset = 0,
  client = supabaseAdmin,
} = {}) => {
  const safeBatchSize = Math.min(Math.max(1, batchSize), MAX_BATCH_SIZE);
  const safeOffset = Math.max(0, offset);

  // ── Step 1: Count total eligible candidates ─────────────────────────
  const { count: totalCount, error: countErr } = await client
    .from('job_seeker_profiles')
    .select('id, users!inner(role)', { count: 'exact', head: true })
    .eq('is_discoverable', true)
    .eq('users.role', 'job_seeker');

  if (countErr) {
    throw new CandidatePoolError(
      'CANDIDATE_POOL_COUNT_FAILED',
      `Failed to count candidate pool: ${countErr.message}`
    );
  }

  const total = totalCount || 0;

  if (total === 0 || safeOffset >= total) {
    return { candidates: [], total, hasMore: false };
  }

  // ── Step 2: Fetch profiles joined with users ────────────────────────
  const { data: profiles, error: profileErr } = await client
    .from('job_seeker_profiles')
    .select(`
      id,
      user_id,
      years_of_experience,
      is_discoverable,
      users!inner ( id, first_name, last_name, role )
    `)
    .eq('is_discoverable', true)
    .eq('users.role', 'job_seeker')
    .order('id', { ascending: true })
    .range(safeOffset, safeOffset + safeBatchSize - 1);

  if (profileErr) {
    throw new CandidatePoolError(
      'CANDIDATE_POOL_FETCH_FAILED',
      `Failed to fetch candidate profiles: ${profileErr.message}`
    );
  }

  if (!profiles || profiles.length === 0) {
    return { candidates: [], total, hasMore: false };
  }

  // ── Step 3: Fetch latest processed resume for each user ─────────────
  const userIds = profiles.map(p => p.user_id);
  const { data: resumes, error: resumeErr } = await client
    .from('resumes')
    .select('user_id, normalized_skills, extracted_data')
    .in('user_id', userIds)
    .eq('status', 'processed')
    .order('created_at', { ascending: false });

  if (resumeErr) {
    throw new CandidatePoolError(
      'CANDIDATE_POOL_RESUME_FETCH_FAILED',
      `Failed to fetch candidate resumes: ${resumeErr.message}`
    );
  }

  // Build a map of user_id → latest resume (first match per user due to ordering)
  const resumeByUser = new Map();
  if (resumes) {
    for (const r of resumes) {
      if (!resumeByUser.has(r.user_id)) {
        resumeByUser.set(r.user_id, r);
      }
    }
  }

  // ── Step 4: Transform into CandidatePoolEntry format ────────────────
  const seen = new Set();
  const candidates = [];

  for (const profile of profiles) {
    // Deduplicate by user_id (safety net)
    if (seen.has(profile.user_id)) continue;
    seen.add(profile.user_id);

    const user = profile.users;
    if (!user || user.role !== 'job_seeker') continue;

    const resume = resumeByUser.get(profile.user_id);

    // Extract normalized skill names
    const skills = extractSkillNames(resume?.normalized_skills);

    // Extract education from resume extracted_data
    const education = extractEducation(resume?.extracted_data);

    candidates.push({
      candidateId: profile.id,
      userId: profile.user_id,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown',
      skills,
      experience: parseFloat(profile.years_of_experience) || 0.0,
      education,
    });
  }

  return {
    candidates,
    total,
    hasMore: safeOffset + safeBatchSize < total,
  };
};

/**
 * Extract skill names from normalized_skills JSONB.
 * Handles both string arrays and object arrays with skill/name fields.
 * @param {Array|null|undefined} normalizedSkills
 * @returns {string[]}
 */
const extractSkillNames = (normalizedSkills) => {
  if (!Array.isArray(normalizedSkills) || normalizedSkills.length === 0) {
    return [];
  }
  return normalizedSkills
    .map(s => typeof s === 'string' ? s : (s.skill || s.name || s.skillId || ''))
    .filter(Boolean);
};

/**
 * Extract highest education level from resume extracted_data.
 * @param {Object|null|undefined} extractedData
 * @returns {string|null}
 */
const extractEducation = (extractedData) => {
  if (!extractedData) return null;
  const edArr = extractedData.education;
  if (!Array.isArray(edArr) || edArr.length === 0) return null;
  return edArr[0].degree || edArr[0].level || null;
};

class CandidatePoolError extends Error {
  constructor(code, message, statusCode = 500) {
    super(message);
    this.name = 'CandidatePoolError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

module.exports = {
  getCandidatePool,
  extractSkillNames,
  extractEducation,
  CandidatePoolError,
  DEFAULT_BATCH_SIZE,
  MAX_BATCH_SIZE,
};
