-- Migration: Transactional Complete-Run Synchronization RPC
-- Date: 2026-08-07
-- Description: Executes complete-run candidate match synchronization within a SINGLE PostgreSQL transaction.
--              Upserts current evaluated candidates and deletes obsolete candidate match rows for the job.

CREATE OR REPLACE FUNCTION public.sync_recruiter_candidate_matches(
    p_job_id UUID,
    p_matches JSONB,
    p_calculated_at TIMESTAMP WITH TIME ZONE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_upsert_count INT := 0;
    v_delete_count INT := 0;
    v_evaluated_profile_ids UUID[];
BEGIN
    -- Validate job_id
    IF p_job_id IS NULL THEN
        RAISE EXCEPTION 'job_id is required for complete-run synchronization';
    END IF;

    -- Extract array of evaluated candidate profile UUIDs from JSONB payload
    SELECT ARRAY_AGG((elem->>'job_seeker_profile_id')::UUID)
    INTO v_evaluated_profile_ids
    FROM jsonb_array_elements(p_matches) AS elem
    WHERE elem->>'job_seeker_profile_id' IS NOT NULL;

    -- Case 1: Payload has evaluated candidates -> Upsert new matches & delete obsolete matches
    IF v_evaluated_profile_ids IS NOT NULL AND ARRAY_LENGTH(v_evaluated_profile_ids, 1) > 0 THEN
        -- Step A: Upsert evaluated candidates
        INSERT INTO public.candidate_matches (
            job_posting_id,
            job_seeker_profile_id,
            user_id,
            match_score,
            overall_score,
            matched_skills,
            missing_skills,
            calculated_at
        )
        SELECT 
            p_job_id,
            (elem->>'job_seeker_profile_id')::UUID,
            (elem->>'user_id')::UUID,
            COALESCE((elem->>'match_score')::INT, 0),
            COALESCE((elem->>'overall_score')::NUMERIC, 0.0),
            COALESCE(elem->'matched_skills', '[]'::jsonb),
            COALESCE(elem->'missing_skills', '[]'::jsonb),
            COALESCE(p_calculated_at, now())
        FROM jsonb_array_elements(p_matches) AS elem
        ON CONFLICT (job_posting_id, job_seeker_profile_id)
        DO UPDATE SET
            user_id = EXCLUDED.user_id,
            match_score = EXCLUDED.match_score,
            overall_score = EXCLUDED.overall_score,
            matched_skills = EXCLUDED.matched_skills,
            missing_skills = EXCLUDED.missing_skills,
            calculated_at = EXCLUDED.calculated_at;

        GET DIAGNOSTICS v_upsert_count = ROW_COUNT;

        -- Step B: Delete obsolete candidate matches for this job not in v_evaluated_profile_ids
        DELETE FROM public.candidate_matches
        WHERE job_posting_id = p_job_id
          AND NOT (job_seeker_profile_id = ANY(v_evaluated_profile_ids));

        GET DIAGNOSTICS v_delete_count = ROW_COUNT;

    -- Case 2: Complete run evaluated 0 candidates (empty pool) -> Clear all stored matches for this job
    ELSE
        DELETE FROM public.candidate_matches
        WHERE job_posting_id = p_job_id;

        GET DIAGNOSTICS v_delete_count = ROW_COUNT;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'upserted_count', v_upsert_count,
        'deleted_count', v_delete_count
    );
END;
$$;
