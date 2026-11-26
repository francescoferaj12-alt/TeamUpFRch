begin;
-- Restrictive policies preserve existing row ownership and require a real,
-- confirmed, non-banned session, including requests with old signed JWTs.
create or replace function private.account_storage_active()
returns boolean language sql stable security definer set search_path=''
return private.profile_media_reader() is not null;

do $guard$
declare t text;
begin
 foreach t in array array['profiles','annonces','applications','career_experiences','coach_certificates','member_blocks','member_reports','message_conversations','messages','saved_annonce_searches'] loop
  execute format('create policy "Active confirmed session required" on public.%I as restrictive for all to authenticated using ((select private.account_storage_active())) with check ((select private.account_storage_active()))',t);
 end loop;
end $guard$;

grant execute on function private.profile_media_reader() to service_role;
create function private.moderation_content_visible(target uuid) returns boolean
language sql stable security definer set search_path=''
as $body$
 select coalesce((private.profile_media_reader()->>'admin')::boolean,false)
 or exists(select 1 from auth.users u where u.id=target and (u.banned_until is null or u.banned_until<=now()));
$body$;
revoke all on function private.moderation_content_visible(uuid) from public,anon;
grant execute on function private.moderation_content_visible(uuid) to authenticated,service_role;
create policy "Suspended authors are hidden" on public.annonces as restrictive for select to authenticated using(private.moderation_content_visible(author_id));
create policy "Suspended careers are hidden" on public.career_experiences as restrictive for select to authenticated using(private.moderation_content_visible(user_id));
create policy "Suspended certificates are hidden" on public.coach_certificates as restrictive for select to authenticated using(private.moderation_content_visible(coach_id));
create policy "Suspended profile media are hidden" on storage.objects as restrictive for select to authenticated using(
 bucket_id not in ('avatars','videos') or case when split_part(name,'/',1) ~* '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$' then private.moderation_content_visible(split_part(name,'/',1)::uuid) else false end
);

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
 AND EXISTS (SELECT 1 FROM auth.users u WHERE u.id=profiles.id AND (u.banned_until IS NULL OR u.banned_until<=now()))
 AND ((SELECT auth.jwt()->>'role')='service_role' OR (SELECT private.profile_media_reader()) IS NOT NULL);


create or replace function private.can_message(target uuid) returns boolean
language sql stable security definer set search_path=''
as $body$
 select private.account_storage_active()
 and exists(select 1 from auth.users u where u.id=target and (u.banned_until is null or u.banned_until<=now()))
 and not exists(select 1 from public.member_blocks where
 (blocker_id=(select auth.uid()) and blocked_id=target)
 or (blocked_id=(select auth.uid()) and blocker_id=target));
$body$;

create table public.member_moderation_events(
 id uuid primary key default gen_random_uuid(),
 target_id uuid not null references auth.users(id) on delete cascade,
 actor_id uuid references auth.users(id) on delete set null,
 report_id uuid references public.member_reports(id) on delete set null,
 action text not null check(action in ('block','unblock')),
 created_at timestamptz not null default now()
);
alter table public.member_moderation_events enable row level security;
revoke all on public.member_moderation_events from public,anon,authenticated,service_role;
grant select,insert on public.member_moderation_events to service_role;

-- Only the server can revoke another member's sessions, for the exact account
-- attached to an existing report. Neither client metadata nor body IDs authorize it.
create function private.revoke_reported_member_sessions(p_report uuid,p_target uuid,p_actor uuid)
returns boolean language plpgsql security definer set search_path=''
as $body$
begin
 if (select auth.jwt()->>'role') is distinct from 'service_role'
 or not exists(select 1 from auth.users where id=p_actor and email='teamupfr.ch@gmail.com' and email_confirmed_at is not null and (banned_until is null or banned_until<=now()))
 or not exists(select 1 from public.member_reports r join auth.users u on u.id=r.reported_id where r.id=p_report and r.reported_id=p_target and u.email is distinct from 'teamupfr.ch@gmail.com')
 then raise exception 'Forbidden moderation target' using errcode='42501'; end if;
 delete from auth.sessions where user_id=p_target;
 return true;
end $body$;
revoke all on function private.revoke_reported_member_sessions(uuid,uuid,uuid) from public,anon,authenticated,service_role;
grant usage on schema private to service_role;
grant execute on function private.revoke_reported_member_sessions(uuid,uuid,uuid) to service_role;
create function public.revoke_reported_member_sessions(p_report uuid,p_target uuid,p_actor uuid)
returns boolean language sql security invoker set search_path=''
return private.revoke_reported_member_sessions(p_report,p_target,p_actor);
revoke all on function public.revoke_reported_member_sessions(uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function public.revoke_reported_member_sessions(uuid,uuid,uuid) to service_role;

create function public.member_moderation_ready() returns boolean
language sql stable security invoker set search_path=''
as $body$
 select (select count(*)=10 from pg_catalog.pg_policy p join pg_catalog.pg_class c on c.oid=p.polrelid join pg_catalog.pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and p.polname='Active confirmed session required' and not p.polpermissive and c.relrowsecurity)
 and to_regclass('public.member_moderation_events') is not null
 and position('banned_until' in pg_get_viewdef('public.public_profiles'::regclass,true))>0;
$body$;
revoke all on function public.member_moderation_ready() from public,anon,authenticated;
grant execute on function public.member_moderation_ready() to service_role;
commit;
