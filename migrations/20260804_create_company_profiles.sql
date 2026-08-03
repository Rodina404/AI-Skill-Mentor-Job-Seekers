BEGIN;

CREATE TABLE IF NOT EXISTS public.company_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    description TEXT,
    email TEXT,
    phone TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS company_profiles_recruiter_id_idx
    ON public.company_profiles (recruiter_id);

ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow recruiters to read their own company profile" ON public.company_profiles;
CREATE POLICY "Allow recruiters to read their own company profile"
    ON public.company_profiles FOR SELECT
    TO authenticated
    USING (recruiter_id = auth.uid());

DROP POLICY IF EXISTS "Allow recruiters to insert their own company profile" ON public.company_profiles;
CREATE POLICY "Allow recruiters to insert their own company profile"
    ON public.company_profiles FOR INSERT
    TO authenticated
    WITH CHECK (recruiter_id = auth.uid());

DROP POLICY IF EXISTS "Allow recruiters to update their own company profile" ON public.company_profiles;
CREATE POLICY "Allow recruiters to update their own company profile"
    ON public.company_profiles FOR UPDATE
    TO authenticated
    USING (recruiter_id = auth.uid())
    WITH CHECK (recruiter_id = auth.uid());

COMMIT;
