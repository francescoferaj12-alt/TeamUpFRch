-- Additive community features. No email provider, paid extension or public bucket.
alter table public.profiles add column availability_status text check (availability_status in ('settled','open','seeking'));
grant update(availability_status) on public.profiles to authenticated;
create function private.sync_player_availability() returns trigger language plpgsql set search_path='' as $$
begin
 if new.role='player' then
  if new.availability_status is distinct from old.availability_status then new.available:=new.availability_status in ('open','seeking');
  elsif new.available is distinct from old.available then new.availability_status:=case when new.available then 'seeking' else 'settled' end; end if;
 end if;
 return new;
end $$;
revoke all on function private.sync_player_availability() from public;
create trigger sync_player_availability before update on public.profiles for each row execute function private.sync_player_availability();
-- Preserve the existing sanitized view, append just the non-sensitive status.
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
    club_verified_at,
    availability_status
   FROM public.profiles
  WHERE hidden IS NOT TRUE AND ((role = ANY (ARRAY['player'::text, 'coach'::text])) OR role = 'club'::text AND club_verification_status = 'approved'::text)
 AND private.moderation_content_visible(profiles.id)
 AND ((SELECT auth.jwt()->>'role')='service_role' OR (SELECT private.profile_media_reader()) IS NOT NULL);
create function private.community_visible(target uuid) returns boolean language sql stable security definer set search_path='' as $$
 select private.account_storage_active() and exists(select 1 from public.public_profiles p where p.id=target)
 and not exists(select 1 from public.member_blocks b where (b.blocker_id=auth.uid() and b.blocked_id=target) or (b.blocker_id=target and b.blocked_id=auth.uid()));
$$;
revoke all on function private.community_visible(uuid) from public;
grant execute on function private.community_visible(uuid) to authenticated,service_role;

create table public.member_follows(
 follower_id uuid not null default auth.uid() references auth.users on delete cascade,
 followed_id uuid not null references auth.users on delete cascade,
 created_at timestamptz not null default now(), primary key(follower_id,followed_id),check(follower_id<>followed_id));
create index member_follows_target on public.member_follows(followed_id,follower_id);
alter table public.member_follows enable row level security;
revoke all on public.member_follows from public,anon,authenticated;
grant select,delete,insert(followed_id) on public.member_follows to authenticated;
create policy "Own follows" on public.member_follows for select to authenticated using(follower_id=(select auth.uid()) and (select private.account_storage_active()));
create policy "Follow visible members" on public.member_follows for insert to authenticated with check(follower_id=(select auth.uid()) and private.community_visible(followed_id) and private.community_visible(follower_id));
create policy "Unfollow" on public.member_follows for delete to authenticated using(follower_id=(select auth.uid()) and (select private.account_storage_active()));

