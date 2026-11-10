BEGIN;
ALTER POLICY "Users can apply" ON public.applications TO authenticated
  WITH CHECK ((SELECT auth.uid()) = applicant_id AND status = 'pending' AND seen_by_owner IS NOT TRUE);
ALTER POLICY "Users can send messages" ON public.messages TO authenticated
  WITH CHECK ((SELECT auth.uid()) = sender_id AND read IS FALSE AND (
    file_url IS NULL OR (
      split_part(file_url, '/', 1) = (SELECT auth.uid())::text
      AND file_url ~ '^[0-9a-f-]{36}/[a-zA-Z0-9_-][a-zA-Z0-9._-]*$'
    )
  ));
COMMIT;
