BEGIN;

-- Recipients may acknowledge messages, but never rewrite a sender's content.
REVOKE UPDATE ON public.messages FROM PUBLIC, anon, authenticated;
REVOKE UPDATE (id, sender_id, receiver_id, text, read, created_at, file_url, file_type, file_name)
  ON public.messages FROM PUBLIC, anon, authenticated;
GRANT UPDATE (read) ON public.messages TO authenticated;

-- An annonce owner can manage status/read markers, not change the applicant.
REVOKE UPDATE ON public.applications FROM PUBLIC, anon, authenticated;
REVOKE UPDATE (id, annonce_id, applicant_id, applicant_name, message, status, created_at, seen_by_owner)
  ON public.applications FROM PUBLIC, anon, authenticated;
GRANT UPDATE (status, seen_by_owner) ON public.applications TO authenticated;
REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.messages, public.applications FROM PUBLIC, anon, authenticated;

-- Public media downloads stay public. Listing the owner's objects is required
-- by Storage for the avatar/video upserts already used by the website.
CREATE POLICY "Owners can select their profile media"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id IN ('avatars', 'videos') AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);

ALTER POLICY "Authenticated users can upload avatars" ON storage.objects TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);
ALTER POLICY "Users can update own avatar" ON storage.objects TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);
ALTER POLICY avatars_upload_own ON storage.objects TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);
ALTER POLICY avatars_update_own ON storage.objects TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);
ALTER POLICY videos_upload_own ON storage.objects TO authenticated
  WITH CHECK (bucket_id = 'videos' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);
ALTER POLICY videos_update_own ON storage.objects TO authenticated
  USING (bucket_id = 'videos' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text)
  WITH CHECK (bucket_id = 'videos' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);

-- No message attachments existed before this migration. Store object paths,
-- never persistent public URLs, and authorize downloads for the two participants.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('message-files', 'message-files', false, 20971520,
  ARRAY['image/*','video/*','application/pdf','application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/zip','application/x-zip-compressed','application/octet-stream'])
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Members upload own message files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'message-files' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);
CREATE POLICY "Message participants read attachments"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'message-files' AND (
    (storage.foldername(name))[1] = (SELECT auth.uid())::text
    OR EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.file_url = storage.objects.name
        AND m.receiver_id = (SELECT auth.uid())
        AND m.sender_id::text = (storage.foldername(storage.objects.name))[1]
    )
  ));
CREATE POLICY "Members discard unsent attachments"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'message-files'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
    AND NOT EXISTS (SELECT 1 FROM public.messages m WHERE m.file_url = storage.objects.name));

ALTER POLICY "Users can send messages" ON public.messages TO authenticated
  WITH CHECK ((SELECT auth.uid()) = sender_id AND (
    file_url IS NULL OR (
      split_part(file_url, '/', 1) = (SELECT auth.uid())::text
      AND file_url ~ '^[0-9a-f-]{36}/[a-zA-Z0-9_-][a-zA-Z0-9._-]*$'
    )
  ));
COMMIT;
