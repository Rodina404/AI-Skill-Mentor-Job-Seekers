-- Preflight Query: Detect Duplicate Recruiter Candidate Matches
-- Description: Run this preflight query before applying candidate_matches_job_seeker_unique constraint.

SELECT 
    job_posting_id,
    job_seeker_profile_id,
    COUNT(*) AS duplicate_count,
    ARRAY_AGG(id) AS row_ids,
    MAX(calculated_at) AS latest_calculated_at,
    MIN(calculated_at) AS oldest_calculated_at
FROM public.candidate_matches
GROUP BY job_posting_id, job_seeker_profile_id
HAVING COUNT(*) > 1;
