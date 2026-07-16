BEGIN;

ALTER TABLE public.saved_jobs
    ALTER COLUMN job_posting_id DROP NOT NULL,
    ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'platform' NOT NULL,
    ADD COLUMN IF NOT EXISTS external_job_id TEXT,
    ADD COLUMN IF NOT EXISTS external_url TEXT,
    ADD COLUMN IF NOT EXISTS external_title TEXT,
    ADD COLUMN IF NOT EXISTS external_company TEXT,
    ADD COLUMN IF NOT EXISTS external_location TEXT,
    ADD COLUMN IF NOT EXISTS external_description TEXT;

ALTER TABLE public.saved_jobs
    DROP CONSTRAINT IF EXISTS saved_jobs_source_check,
    DROP CONSTRAINT IF EXISTS saved_jobs_identity_check;

ALTER TABLE public.saved_jobs
    ADD CONSTRAINT saved_jobs_source_check CHECK (source IN ('platform', 'adzuna')),
    ADD CONSTRAINT saved_jobs_identity_check CHECK (
        (source = 'platform' AND job_posting_id IS NOT NULL AND external_job_id IS NULL)
        OR
        (source = 'adzuna' AND job_posting_id IS NULL AND external_job_id IS NOT NULL
            AND external_url IS NOT NULL AND external_title IS NOT NULL)
    );

CREATE UNIQUE INDEX IF NOT EXISTS saved_jobs_user_external_unique
    ON public.saved_jobs (user_id, source, external_job_id)
    WHERE source = 'adzuna';

COMMIT;
