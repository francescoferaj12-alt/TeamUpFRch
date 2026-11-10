-- Phase 2: apply only AFTER deploying and checking the website that reads
-- public_profiles and sends application notifications using server credentials.
-- Inspect live policies and grants first. Existing write policies are preserved.
BEGIN;

DO $$
BEGIN
  IF to_regclass('public.public_profiles') IS NULL THEN
    RAISE EXCEPTION 'Apply the public_profiles view migration first';
  END IF;
END $$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users and designated admin can read profiles" ON public.profiles;
CREATE POLICY "Users and designated admin can read profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    (SELECT auth.uid()) = id
    OR (SELECT auth.jwt() ->> 'email') = 'teamupfr.ch@gmail.com'
  );

-- Restrictive policies also constrain any legacy permissive SELECT/ALL policies.
DROP POLICY IF EXISTS "Private profiles require owner or admin" ON public.profiles;
CREATE POLICY "Private profiles require owner or admin"
  ON public.profiles AS RESTRICTIVE FOR SELECT TO authenticated
  USING (
    (SELECT auth.uid()) = id
    OR (SELECT auth.jwt() ->> 'email') = 'teamupfr.ch@gmail.com'
  );

DROP POLICY IF EXISTS "Anonymous cannot read private profiles" ON public.profiles;
CREATE POLICY "Anonymous cannot read private profiles"
  ON public.profiles AS RESTRICTIVE FOR SELECT TO anon USING (false);

DROP POLICY IF EXISTS "Designated admin can update profiles" ON public.profiles;
CREATE POLICY "Designated admin can update profiles"
  ON public.profiles FOR UPDATE TO authenticated
  USING ((SELECT auth.jwt() ->> 'email') = 'teamupfr.ch@gmail.com')
  WITH CHECK ((SELECT auth.jwt() ->> 'email') = 'teamupfr.ch@gmail.com');

COMMIT;
