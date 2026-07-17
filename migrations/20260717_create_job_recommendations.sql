BEGIN;

CREATE TABLE IF NOT EXISTS public.job_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommendation_session_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    job_posting_id UUID REFERENCES public.job_postings(id) ON DELETE SET NULL,
    rank INTEGER NOT NULL CHECK (rank > 0),
    source TEXT NOT NULL DEFAULT 'adzuna',
    external_job_id TEXT,
    title TEXT NOT NULL,
    company TEXT,
    description TEXT,
    posting_date TIMESTAMP WITH TIME ZONE,
    location TEXT,
    external_url TEXT,
    readiness_score NUMERIC NOT NULL CHECK (readiness_score BETWEEN 0 AND 1),
    recency_score NUMERIC NOT NULL CHECK (recency_score BETWEEN 0 AND 1),
    final_score NUMERIC NOT NULL CHECK (final_score BETWEEN 0 AND 1),
    extracted_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    raw_job JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT job_recommendations_session_rank_unique UNIQUE (recommendation_session_id, rank)
);

CREATE INDEX IF NOT EXISTS job_recommendations_user_created_idx
    ON public.job_recommendations (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS job_recommendations_session_idx
    ON public.job_recommendations (recommendation_session_id);

ALTER TABLE public.job_recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to read their own job recommendations" ON public.job_recommendations;
CREATE POLICY "Allow users to read their own job recommendations"
    ON public.job_recommendations FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Allow users to insert their own job recommendations" ON public.job_recommendations;
CREATE POLICY "Allow users to insert their own job recommendations"
    ON public.job_recommendations FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

COMMIT;
