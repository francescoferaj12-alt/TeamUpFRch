-- Phase 1: add the public read model while the current website still uses profiles.
-- Deploy the updated website BEFORE applying 20261111_private_profile_access.sql.
-- This view intentionally omits private email, birthdate, phone, notification
-- preferences, and onboarding state. Its owner can read profiles through RLS;
-- only the explicit projection and visibility filter below are public.
BEGIN;

CREATE OR REPLACE VIEW public.public_profiles
WITH (security_barrier = true, security_invoker = false)
AS
SELECT
  id, role, first_name, last_name, position, ligue, zone, age, foot,
  available, bio, club_name, avatar_url, goals, assists, matches, rating,
  created_at, genre, verified, strengths, video1_url, video2_url, video3_url,
  goals_prev, assists_prev, matches_prev, coach_experience, coach_diploma,
  coach_specialty, coach_availability, coach_categories, coach_philosophy,
  position_secondary, jersey_number, height_cm, level, club_website,
  club_instagram, club_facebook, club_whatsapp, club_phone_public,
  club_email_public, club_founded_year, club_teams_count, club_stadium_name,
  club_stadium_address, club_color_primary, club_color_secondary,
  club_categories, club_contact_role, aff_club_id, club_verification_status,
  club_verified_at
FROM public.profiles
WHERE hidden IS NOT TRUE
  AND (role IN ('player', 'coach') OR (role = 'club' AND club_verification_status = 'approved'));

-- Views can inherit broad default privileges and may be automatically updatable.
-- Public clients must never write through this view as its privileged owner.
REVOKE ALL ON public.public_profiles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.public_profiles TO anon, authenticated;
COMMIT;
