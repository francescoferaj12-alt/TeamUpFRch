-- Auth deletion cascades profile/member records. Storage requires explicit object
-- cleanup first. A temporary Auth ban closes the upload race during that cleanup,
-- including clients holding an already-issued access token.
create or replace function private.account_storage_active()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from auth.users u
    where u.id = (select auth.uid())
      and (u.banned_until is null or u.banned_until <= now())
  );
$$;
revoke all on function private.account_storage_active() from public, anon;
grant execute on function private.account_storage_active() to authenticated;

create policy "Active account required for storage access"
on storage.objects as restrictive
for all to authenticated
using ((select private.account_storage_active()))
with check ((select private.account_storage_active()));

-- Service-only readiness probe: the destructive API fails closed when its
-- required Storage guard has not yet been installed in a deployment.
create or replace function public.account_storage_deletion_ready()
returns boolean
language sql stable security invoker
set search_path = ''
as $$
  select exists (
    select 1 from pg_catalog.pg_policy
    where polrelid = 'storage.objects'::regclass
      and polname = 'Active account required for storage access'
      and not polpermissive
  );
$$;
revoke all on function public.account_storage_deletion_ready() from public, anon, authenticated;
grant execute on function public.account_storage_deletion_ready() to service_role;
