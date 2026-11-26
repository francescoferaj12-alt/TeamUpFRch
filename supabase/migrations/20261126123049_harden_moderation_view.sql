create or replace view public.public_profiles as
SELECT id,
    role,
    first_name,
    last_name,
    "position",
    ligue,
    zone,
    age,
    foot,
    available,
    bio,
    club_name,
    avatar_url,
    goals,
    assists,
    matches,
    rating,
    created_at,
    genre,
    verified,
    strengths,
    video1_url,
    video2_url,
    video3_url,
    goals_prev,
    assists_prev,
    matches_prev,
    coach_experience,
    coach_diploma,
    coach_specialty,
    coach_availability,
    coach_categories,
    coach_philosophy,
    position_secondary,
    jersey_number,
    height_cm,
    level,
    club_website,
    club_instagram,
    club_facebook,
    club_whatsapp,
    club_phone_public,
    club_email_public,
    club_founded_year,
    club_teams_count,
    club_stadium_name,
    club_stadium_address,
    club_color_primary,
    club_color_secondary,
    club_categories,
    club_contact_role,
    aff_club_id,
    club_verification_status,
    club_verified_at
   FROM public.profiles
  WHERE hidden IS NOT TRUE AND ((role = ANY (ARRAY['player'::text, 'coach'::text])) OR role = 'club'::text AND club_verification_status = 'approved'::text)
 AND private.moderation_content_visible(profiles.id)
 AND ((SELECT auth.jwt()->>'role')='service_role' OR (SELECT private.profile_media_reader()) IS NOT NULL);

create policy "Moderation audit is server only" on public.member_moderation_events as restrictive for all to authenticated using(false) with check(false);
create or replace function public.member_moderation_ready() returns boolean
language sql stable security invoker set search_path=''
as $ready$
 select (select count(*)=10 from pg_catalog.pg_policy p join pg_catalog.pg_class c on c.oid=p.polrelid join pg_catalog.pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and p.polname='Active confirmed session required' and not p.polpermissive and c.relrowsecurity)
 and to_regclass('public.member_moderation_events') is not null
 and position('moderation_content_visible' in pg_get_viewdef('public.public_profiles'::regclass,true))>0;
$ready$;
