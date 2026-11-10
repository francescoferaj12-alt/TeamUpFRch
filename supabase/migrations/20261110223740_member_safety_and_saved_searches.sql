begin;

create table public.member_blocks (
  blocker_id uuid not null default auth.uid() references auth.users on delete cascade,
  blocked_id uuid not null references auth.users on delete cascade,
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);
create index member_blocks_blocked_id_idx on public.member_blocks (blocked_id);
alter table public.member_blocks enable row level security;
revoke all on public.member_blocks from public, anon, authenticated;
grant select, insert, delete on public.member_blocks to authenticated;
create policy "Members manage their own blocks" on public.member_blocks
  for all to authenticated using (blocker_id = (select auth.uid()))
  with check (blocker_id = (select auth.uid()));

create schema if not exists private;
create function private.can_message(target uuid) returns boolean
  language sql stable security definer set search_path = ''
as $$
  select not exists (
    select 1 from public.member_blocks
    where (blocker_id = (select auth.uid()) and blocked_id = target)
       or (blocked_id = (select auth.uid()) and blocker_id = target)
  );
$$;
revoke all on function private.can_message(uuid) from public, anon, authenticated;
grant execute on function private.can_message(uuid) to authenticated;

create policy "Blocks prevent new messages" on public.messages
  as restrictive for insert to authenticated
  with check (private.can_message(receiver_id));

create table public.member_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null default auth.uid() references auth.users on delete cascade,
  reported_id uuid not null references auth.users on delete cascade,
  reason text not null check (char_length(btrim(reason)) between 5 and 1000),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  check (reporter_id <> reported_id)
);
create unique index member_reports_one_open_per_pair on public.member_reports (reporter_id, reported_id) where reviewed_at is null;
alter table public.member_reports enable row level security;
revoke all on public.member_reports from public, anon, authenticated;
grant insert (reported_id, reason), select, update (reviewed_at) on public.member_reports to authenticated;
create policy "Members can submit reports" on public.member_reports
  for insert to authenticated with check (reporter_id = (select auth.uid()));
create policy "Administrator reads reports" on public.member_reports
  for select to authenticated using ((select auth.jwt() ->> 'email') = 'teamupfr.ch@gmail.com');
create policy "Administrator reviews reports" on public.member_reports
  for update to authenticated
  using ((select auth.jwt() ->> 'email') = 'teamupfr.ch@gmail.com')
  with check ((select auth.jwt() ->> 'email') = 'teamupfr.ch@gmail.com');

create table public.saved_annonce_searches (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users on delete cascade,
  query text not null default '' check (char_length(query) <= 120),
  ligue text not null default '' check (char_length(ligue) <= 100),
  zone text not null default '' check (char_length(zone) <= 100),
  position text not null default '' check (char_length(position) <= 100),
  email_alert boolean not null default false,
  author_type text not null default '' check (author_type in ('', 'club', 'coach', 'player')),
  created_at timestamptz not null default now(),
  unique (owner_id, query, ligue, zone, position, author_type),
  check (query <> '' or ligue <> '' or zone <> '' or position <> '' or author_type <> '')
);
alter table public.saved_annonce_searches enable row level security;
revoke all on public.saved_annonce_searches from public, anon, authenticated;
grant select, insert, delete, update (email_alert) on public.saved_annonce_searches to authenticated;
create policy "Members manage their saved searches" on public.saved_annonce_searches
  for all to authenticated using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

commit;
