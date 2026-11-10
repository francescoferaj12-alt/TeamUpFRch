-- The previous trigger blocked verified changes even from the admin service,
-- but allowed users to change their own club approval status. Protect both paths.
BEGIN;
CREATE OR REPLACE FUNCTION public.profiles_block_protected_updates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  privileged boolean := COALESCE(
    auth.role() = 'service_role'
    OR (auth.uid() IS NOT NULL AND auth.jwt() ->> 'email' = 'teamupfr.ch@gmail.com'),
    false
  );
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NOT privileged THEN
      IF NEW.role NOT IN ('player', 'coach', 'club')
        OR NEW.email IS DISTINCT FROM (auth.jwt() ->> 'email') THEN
        RAISE EXCEPTION 'Profile identity does not match the account' USING ERRCODE = '42501';
      END IF;
      NEW.verified := false;
      NEW.club_verification_status := CASE WHEN NEW.role = 'club' THEN 'pending' ELSE NULL END;
      NEW.club_verified_at := NULL;
      NEW.club_rejection_reason := NULL;
    END IF;
    RETURN NEW;
  END IF;

  IF NOT privileged THEN
    IF NEW.id IS DISTINCT FROM OLD.id
      OR NEW.role IS DISTINCT FROM OLD.role
      OR NEW.email IS DISTINCT FROM OLD.email THEN
      RAISE EXCEPTION 'Profile identity cannot be self-updated' USING ERRCODE = '42501';
    END IF;
    IF NEW.verified IS DISTINCT FROM OLD.verified
      OR NEW.club_verification_status IS DISTINCT FROM OLD.club_verification_status
      OR NEW.club_verified_at IS DISTINCT FROM OLD.club_verified_at
      OR NEW.club_rejection_reason IS DISTINCT FROM OLD.club_rejection_reason THEN
      RAISE EXCEPTION 'Verification fields require an administrator' USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_protect_fields ON public.profiles;
CREATE TRIGGER profiles_protect_fields
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.profiles_block_protected_updates();
COMMIT;
