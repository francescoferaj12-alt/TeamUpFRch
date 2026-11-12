-- Previewed locally first. Apply only when the release is approved.
alter table public.annonces add column if not exists last_confirmed_at timestamptz;
update public.annonces set last_confirmed_at = created_at where last_confirmed_at is null;
alter table public.annonces alter column last_confirmed_at set default now();

create or replace function private.stamp_annonce_confirmation() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if TG_OP = 'INSERT' then
    NEW.last_confirmed_at := now();
  elsif NEW.last_confirmed_at is distinct from OLD.last_confirmed_at
    or (NEW.status = 'active' and OLD.status = 'closed')
    or NEW.title is distinct from OLD.title or NEW.body is distinct from OLD.body
    or NEW.ligue is distinct from OLD.ligue or NEW.zone is distinct from OLD.zone
    or NEW.position is distinct from OLD.position then
    NEW.last_confirmed_at := now();
  end if;
  return NEW;
end $$;
revoke all on function private.stamp_annonce_confirmation() from public;
grant execute on function private.stamp_annonce_confirmation() to authenticated, service_role;
create trigger stamp_annonce_confirmation before insert or update on public.annonces
  for each row execute function private.stamp_annonce_confirmation();
create index if not exists annonces_current_search_idx on public.annonces
  ((coalesce(last_confirmed_at, created_at))) where status = 'active';

create or replace function public.browse_annonces(p_filters jsonb default '{}'::jsonb,p_page integer default 0,p_size integer default 24)
returns jsonb language plpgsql stable security invoker set search_path='' as $$
declare patterns text[];
begin
  if p_filters is null or jsonb_typeof(p_filters)<>'object' or p_page is null or p_page not between 0 and 100000 or p_size is null or p_size not between 1 and 48 then raise exception 'Invalid listing page' using errcode='22023'; end if;
  if p_filters ? 'queries' and (jsonb_typeof(p_filters->'queries')<>'array' or jsonb_array_length(p_filters->'queries')>64) then raise exception 'Invalid search terms' using errcode='22023'; end if;
  select array_agg('%'||replace(replace(replace(value,E'\\',E'\\\\'),'%',E'\\%'),'_',E'\\_')||'%') into patterns from jsonb_array_elements_text(coalesce(p_filters->'queries','[]'::jsonb)) where length(value) between 1 and 120;
  return (with visible as materialized (
    select a.*,jsonb_build_object('id',p.id,'avatar_url',p.avatar_url,'verified',p.verified or p.club_verification_status='approved') as profiles
    from public.annonces a join public.public_profiles p on p.id=a.author_id where a.status='active' and coalesce(a.last_confirmed_at,a.created_at)>now()-interval '30 days'
  ), filtered as materialized (
    select * from visible a where (coalesce(p_filters->>'ligue','')='' or a.ligue=p_filters->>'ligue')
      and (coalesce(p_filters->>'zone','')='' or a.zone=p_filters->>'zone')
      and (coalesce(p_filters->>'position','')='' or a.position=p_filters->>'position')
      and (patterns is null or concat_ws(' ',a.title,a.body,a.author_name,a.position,a.ligue,a.zone) ilike any(patterns))
  ),selected as materialized(select * from filtered where coalesce(p_filters->>'author_type','')='' or author_type=p_filters->>'author_type'),page as(
    select * from selected order by created_at desc,id desc limit p_size offset p_page*p_size
  ) select jsonb_build_object('items',coalesce((select jsonb_agg(to_jsonb(p) order by created_at desc,id desc) from page p),'[]'::jsonb),'total',(select count(*) from selected),'counts',(select jsonb_build_object('',count(*),'club',count(*)filter(where author_type='club'),'coach',count(*)filter(where author_type='coach'),'player',count(*)filter(where author_type='player'))from filtered)));
end $$;
revoke all on function public.browse_annonces(jsonb,integer,integer) from public;
grant execute on function public.browse_annonces(jsonb,integer,integer) to authenticated;

revoke execute on function public.browse_annonces(jsonb,integer,integer) from anon;

create policy "Applications require a current search" on public.applications
as restrictive for insert to authenticated with check (
  exists(select 1 from public.annonces a where a.id = annonce_id and a.status = 'active'
    and coalesce(a.last_confirmed_at,a.created_at)>now()-interval '30 days')
);
