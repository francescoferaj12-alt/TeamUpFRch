-- Migration v9: make avatars storage bucket publicly readable
-- Root cause: the `avatars` bucket was private so getPublicUrl() URLs
-- returned 403 for any user other than the uploader.

-- 1. Make the bucket public (generates working public URLs)
UPDATE storage.buckets
  SET public = true
  WHERE id = 'avatars';

-- 2. Allow anyone to read objects from the avatars bucket (belt-and-suspenders)
DO $$
BEGIN
  CREATE POLICY "Avatars are publicly readable"
    ON storage.objects FOR SELECT
    USING ( bucket_id = 'avatars' );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. Allow authenticated users to upload their own avatar
DO $$
BEGIN
  CREATE POLICY "Authenticated users can upload avatars"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK ( bucket_id = 'avatars' );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4. Allow users to update/replace their own avatar
DO $$
BEGIN
  CREATE POLICY "Users can update own avatar"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING ( bucket_id = 'avatars' AND owner = auth.uid() );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 5. Allow users to delete their own avatar
DO $$
BEGIN
  CREATE POLICY "Users can delete own avatar"
    ON storage.objects FOR DELETE
    TO authenticated
    USING ( bucket_id = 'avatars' AND owner = auth.uid() );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
