-- ==========================================
-- Migration: Add is_discoverable column to job_seeker_profiles
-- Purpose: Allows job seekers to opt out of recruiter AI candidate discovery.
--          Defaults to TRUE so existing profiles are discoverable.
-- Safety: Non-breaking additive change. No existing column is modified.
-- Rollback: ALTER TABLE public.job_seeker_profiles DROP COLUMN IF EXISTS is_discoverable;
-- ==========================================

ALTER TABLE public.job_seeker_profiles
    ADD COLUMN IF NOT EXISTS is_discoverable BOOLEAN DEFAULT true NOT NULL;

COMMENT ON COLUMN public.job_seeker_profiles.is_discoverable
    IS 'When true, this job seeker profile is eligible for recruiter AI candidate discovery. Job seekers can opt out by setting this to false.';

-- Index for efficient filtering in candidate pool queries
CREATE INDEX IF NOT EXISTS idx_job_seeker_profiles_discoverable
    ON public.job_seeker_profiles (is_discoverable)
    WHERE is_discoverable = true;
