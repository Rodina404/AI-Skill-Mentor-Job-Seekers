-- Migration: Add Unique Constraint and Performance Indexes for Recruiter Candidate Matches
-- Date: 2026-08-07
-- Description: Ensures ONE current candidate_matches record per (job_posting_id, job_seeker_profile_id)
--              and adds index for ordering matches by score.

DO $$
DECLARE
    v_dup_count INT := 0;
BEGIN
    -- Check for historical duplicates before constraint creation
    SELECT COUNT(*) INTO v_dup_count
    FROM (
        SELECT job_posting_id, job_seeker_profile_id
        FROM public.candidate_matches
        GROUP BY job_posting_id, job_seeker_profile_id
        HAVING COUNT(*) > 1
    ) dups;

    IF v_dup_count > 0 THEN
        RAISE EXCEPTION 'Cannot add constraint candidate_matches_job_seeker_unique: Found % duplicate group(s) in candidate_matches. Migration aborted safely to prevent automatic data deletion. Run scripts/preflight_candidate_matches_duplicates.sql to inspect and reconcile duplicates before re-running migration.', v_dup_count;
    END IF;

    -- Add unique constraint if not present
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'candidate_matches_job_seeker_unique'
    ) THEN
        ALTER TABLE public.candidate_matches
        ADD CONSTRAINT candidate_matches_job_seeker_unique UNIQUE (job_posting_id, job_seeker_profile_id);
    END IF;
END $$;

-- Performance index for Recruiter Candidate Discovery queries:
-- Query: WHERE job_posting_id = ? ORDER BY match_score DESC
CREATE INDEX IF NOT EXISTS candidate_matches_posting_score_idx 
    ON public.candidate_matches(job_posting_id, match_score DESC);

-- Performance index for Candidate queries:
-- Query: WHERE job_seeker_profile_id = ?
CREATE INDEX IF NOT EXISTS candidate_matches_profile_idx 
    ON public.candidate_matches(job_seeker_profile_id);
