-- Read-only bridge for the same-origin media gateway. PostgREST verifies the
-- JWT, then this function verifies the exact live session and account state.
create or replace function private.profile_media_reader()
returns jsonb language sql stable security definer
set search_path = ''
as $$
  select jsonb_build_object('id',u.id,'admin',u.email='teamupfr.ch@gmail.com')
  from auth.users u join auth.sessions s on s.user_id=u.id
  where u.id=(select auth.uid())
    and s.id=nullif(auth.jwt()->>'session_id','')::uuid
    and (s.not_after is null or s.not_after>now())
    and (u.banned_until is null or u.banned_until<=now())
    and u.email_confirmed_at is not null;
$$;
revoke all on function private.profile_media_reader() from public,anon;
grant execute on function private.profile_media_reader() to authenticated;

create or replace function public.profile_media_reader()
returns jsonb language sql stable security invoker
set search_path = ''
return private.profile_media_reader();
revoke all on function public.profile_media_reader() from public,anon;
grant execute on function public.profile_media_reader() to authenticated;
