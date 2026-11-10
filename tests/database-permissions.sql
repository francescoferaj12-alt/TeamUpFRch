-- Transaction-only fixtures: never send email or retain messages/objects.
BEGIN;
DO $$
DECLARE receiver uuid; sender uuid; stranger uuid; annonce uuid;
BEGIN
  SELECT id, author_id INTO annonce, receiver FROM public.annonces ORDER BY created_at LIMIT 1;
  SELECT p.id INTO sender FROM public.profiles p WHERE p.id <> receiver
    AND NOT EXISTS (SELECT 1 FROM public.applications a WHERE a.annonce_id = annonce AND a.applicant_id = p.id) LIMIT 1;
  SELECT id INTO stranger FROM public.profiles WHERE id NOT IN (sender, receiver) LIMIT 1;
  IF sender IS NULL OR receiver IS NULL OR stranger IS NULL THEN RAISE EXCEPTION 'Need three profiles and an annonce for rollback-only tests'; END IF;
  PERFORM set_config('teamupfr.qa_sender', sender::text, true);
  PERFORM set_config('teamupfr.qa_receiver', receiver::text, true);
  PERFORM set_config('teamupfr.qa_stranger', stranger::text, true);
  PERFORM set_config('teamupfr.qa_annonce', annonce::text, true);
  PERFORM set_config('teamupfr.qa_message', gen_random_uuid()::text, true);
  PERFORM set_config('teamupfr.qa_application', gen_random_uuid()::text, true);
  PERFORM set_config('teamupfr.qa_path', sender::text || '/' || gen_random_uuid()::text || '_audit.pdf', true);
  PERFORM set_config('teamupfr.qa_avatar', sender::text || '/' || gen_random_uuid()::text || '_audit.jpg', true);
  PERFORM set_config('request.jwt.claims', jsonb_build_object('sub',sender,'role','authenticated')::text, true);
END $$;
SET LOCAL ROLE authenticated;
DO $$ DECLARE blocked boolean := false; BEGIN
  BEGIN
    INSERT INTO public.applications (annonce_id,applicant_id,applicant_name,message,status) VALUES
      (current_setting('teamupfr.qa_annonce')::uuid,auth.uid(),'transaction-only audit','transaction-only audit','accepted');
  EXCEPTION WHEN insufficient_privilege THEN blocked := true; END;
  PERFORM set_config('teamupfr.qa_self_accept_blocked',blocked::text,true);
  blocked := false;
  BEGIN
    INSERT INTO public.messages (sender_id,receiver_id,text,read) VALUES
      (auth.uid(),current_setting('teamupfr.qa_receiver')::uuid,'transaction-only audit',true);
  EXCEPTION WHEN insufficient_privilege THEN blocked := true; END;
  PERFORM set_config('teamupfr.qa_fake_read_blocked',blocked::text,true);
END $$;
INSERT INTO storage.objects (bucket_id,name,owner) VALUES
  ('message-files',current_setting('teamupfr.qa_path'),auth.uid()),
  ('avatars',current_setting('teamupfr.qa_avatar'),auth.uid());
INSERT INTO public.messages (id,sender_id,receiver_id,text,file_url,file_type,file_name,read) VALUES
  (current_setting('teamupfr.qa_message')::uuid,auth.uid(),current_setting('teamupfr.qa_receiver')::uuid,'transaction-only audit',current_setting('teamupfr.qa_path'),'file','audit.pdf',false);
INSERT INTO public.applications (id,annonce_id,applicant_id,applicant_name,message,status) VALUES
  (current_setting('teamupfr.qa_application')::uuid,current_setting('teamupfr.qa_annonce')::uuid,auth.uid(),'transaction-only audit','transaction-only audit','pending');
DO $$ DECLARE n integer; blocked boolean := false; BEGIN
  UPDATE storage.objects SET updated_at = updated_at WHERE bucket_id='avatars' AND name=current_setting('teamupfr.qa_avatar');
  GET DIAGNOSTICS n = ROW_COUNT;
  PERFORM set_config('teamupfr.qa_media_replace',(n=1)::text,true);
  BEGIN
    INSERT INTO storage.objects (bucket_id,name,owner) VALUES ('avatars',current_setting('teamupfr.qa_receiver') || '/' || gen_random_uuid()::text || '.jpg',auth.uid());
  EXCEPTION WHEN insufficient_privilege THEN blocked := true; END;
  PERFORM set_config('teamupfr.qa_foreign_upload_blocked',blocked::text,true);
END $$;
RESET ROLE;
DO $$ BEGIN PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('teamupfr.qa_receiver'),'role','authenticated')::text,true); END $$;
SET LOCAL ROLE authenticated;
DO $$ DECLARE n integer; blocked boolean := false; BEGIN
  SELECT count(*) INTO n FROM storage.objects WHERE bucket_id='message-files' AND name=current_setting('teamupfr.qa_path');
  PERFORM set_config('teamupfr.qa_receiver_attachment',(n=1)::text,true);
  UPDATE public.messages SET read=true WHERE id=current_setting('teamupfr.qa_message')::uuid;
  GET DIAGNOSTICS n = ROW_COUNT;
  PERFORM set_config('teamupfr.qa_mark_read',(n=1)::text,true);
  BEGIN UPDATE public.messages SET text='tampered' WHERE id=current_setting('teamupfr.qa_message')::uuid;
  EXCEPTION WHEN insufficient_privilege THEN blocked := true; END;
  PERFORM set_config('teamupfr.qa_message_tampering_blocked',blocked::text,true);
  UPDATE public.applications SET status='accepted',seen_by_owner=true WHERE id=current_setting('teamupfr.qa_application')::uuid;
  GET DIAGNOSTICS n = ROW_COUNT;
  PERFORM set_config('teamupfr.qa_application_status',(n=1)::text,true);
  blocked := false;
  BEGIN UPDATE public.applications SET applicant_name='tampered' WHERE id=current_setting('teamupfr.qa_application')::uuid;
  EXCEPTION WHEN insufficient_privilege THEN blocked := true; END;
  PERFORM set_config('teamupfr.qa_application_tampering_blocked',blocked::text,true);
END $$;
RESET ROLE;
DO $$ BEGIN PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('teamupfr.qa_stranger'),'role','authenticated')::text,true); END $$;
SET LOCAL ROLE authenticated;
DO $$ DECLARE n integer; BEGIN
  SELECT count(*) INTO n FROM storage.objects WHERE bucket_id='message-files' AND name=current_setting('teamupfr.qa_path');
  PERFORM set_config('teamupfr.qa_stranger_attachment_blocked',(n=0)::text,true);
  SELECT count(*) INTO n FROM public.messages WHERE id=current_setting('teamupfr.qa_message')::uuid;
  PERFORM set_config('teamupfr.qa_stranger_message_blocked',(n=0)::text,true);
END $$;
RESET ROLE;
SELECT current_setting('teamupfr.qa_media_replace')::boolean AS owner_can_replace_media,
  current_setting('teamupfr.qa_self_accept_blocked')::boolean AS self_accepted_application_blocked,
  current_setting('teamupfr.qa_fake_read_blocked')::boolean AS fake_message_read_receipt_blocked,
  current_setting('teamupfr.qa_foreign_upload_blocked')::boolean AS foreign_upload_blocked,
  current_setting('teamupfr.qa_receiver_attachment')::boolean AS receiver_can_read_attachment,
  current_setting('teamupfr.qa_mark_read')::boolean AS receiver_can_mark_read,
  current_setting('teamupfr.qa_message_tampering_blocked')::boolean AS message_tampering_blocked,
  current_setting('teamupfr.qa_application_status')::boolean AS author_can_update_application_status,
  current_setting('teamupfr.qa_application_tampering_blocked')::boolean AS applicant_tampering_blocked,
  current_setting('teamupfr.qa_stranger_attachment_blocked')::boolean AS stranger_attachment_blocked,
  current_setting('teamupfr.qa_stranger_message_blocked')::boolean AS stranger_message_blocked;
ROLLBACK;
