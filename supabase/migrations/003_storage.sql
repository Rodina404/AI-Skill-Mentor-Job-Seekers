-- =============================================================================
-- 003_storage.sql
-- AI Skill Mentor – Supabase Storage: "resumes" bucket
-- Must be run AFTER 001 and 002.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- DASHBOARD INSTRUCTIONS (if Storage SQL is not available in your plan):
--
--  1. Open Supabase Dashboard → Storage → New bucket
--  2. Name:       resumes
--  3. Public:     NO  (keep private; files need signed URLs)
--  4. Click "Save".
--
--  Then add Storage Policies (Dashboard → Storage → Policies → resumes):
--
--  Policy A – INSERT (upload):
--    Name:      "Authenticated users upload to own folder"
--    Allowed:   INSERT
--    Target:    storage.objects
--    Using:     bucket_id = 'resumes'
--               AND auth.role() = 'authenticated'
--               AND (storage.foldername(name))[1] = auth.uid()::text
--
--  Policy B – SELECT (download):
--    Name:      "Users download own files only"
--    Allowed:   SELECT
--    Target:    storage.objects
--    Using:     bucket_id = 'resumes'
--               AND (storage.foldername(name))[1] = auth.uid()::text
--
--  Policy C – DELETE (optional, allow user to remove their own CV):
--    Name:      "Users delete own files only"
--    Allowed:   DELETE
--    Target:    storage.objects
--    Using:     bucket_id = 'resumes'
--               AND (storage.foldername(name))[1] = auth.uid()::text
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- SQL approach (works in Supabase projects that expose the storage schema)
-- ---------------------------------------------------------------------------

-- Create the private bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects (Supabase does this by default; safe to call)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Policy A: Authenticated users may INSERT files under their own user prefix
--           Path convention: resumes/{user_id}/{filename}
-- ---------------------------------------------------------------------------
CREATE POLICY "resumes: authenticated users upload to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'resumes'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- Policy B: Users may SELECT (download/view) only their own files
-- ---------------------------------------------------------------------------
CREATE POLICY "resumes: users select own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- Policy C: Users may DELETE their own files (e.g. replace CV)
-- ---------------------------------------------------------------------------
CREATE POLICY "resumes: users delete own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- NOTE on signed URLs in Node.js (use supabaseAdmin to bypass RLS):
--
--   const { data, error } = await supabaseAdmin.storage
--     .from('resumes')
--     .createSignedUrl(`${userId}/${filename}`, 3600); // 1-hour expiry
--
-- Upload from Node.js:
--   const { data, error } = await supabaseAdmin.storage
--     .from('resumes')
--     .upload(`${userId}/${filename}`, fileBuffer, { contentType: 'application/pdf' });
-- ---------------------------------------------------------------------------
