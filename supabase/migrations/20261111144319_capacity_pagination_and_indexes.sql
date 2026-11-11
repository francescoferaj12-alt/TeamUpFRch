-- Bound public directory payloads while keeping filtering/counts over the whole directory.
-- This uses the existing whitelisted public view; it never reads private profile columns.
create index if not exists member_reports_reported_id_idx on public.member_reports(reported_id);
create index if not exists messages_sender_history_idx on public.messages(sender_id,created_at desc,id desc);
create index if not exists messages_receiver_history_idx on public.messages(receiver_id,created_at desc,id desc);
create index if not exists messages_unread_receiver_idx on public.messages(receiver_id) where read is false;
create index if not exists annonces_active_created_idx on public.annonces(created_at desc,id desc) where status='active';
create index if not exists profiles_visible_created_idx on public.profiles(created_at desc,id) where hidden is not true;

create or replace function public.browse_public_profiles(p_filters jsonb default '{}'::jsonb,p_page integer default 0,p_size integer default 24)
returns jsonb language plpgsql stable security invoker set search_path='' as $$
declare patterns text[]; result jsonb;
begin
  if p_filters is null or p_page is null or p_size is null or jsonb_typeof(p_filters) <> 'object' or p_page < 0 or p_page > 100000 or p_size < 1 or p_size > 50 then
    raise exception 'Invalid directory page' using errcode='22023';
  end if;
  if p_filters ? 'queries' and (jsonb_typeof(p_filters->'queries') <> 'array' or jsonb_array_length(p_filters->'queries') > 64) then
    raise exception 'Invalid search terms' using errcode='22023';
  end if;
  select array_agg('%' || replace(replace(replace(value,E'\\',E'\\\\'),'%',E'\\%'),'_',E'\\_') || '%') into patterns
  from jsonb_array_elements_text(coalesce(p_filters->'queries','[]'::jsonb)) where length(value) between 1 and 120;
  with filtered as materialized (
    select p.id,p.age,p.role,p.first_name,p.last_name,p.position,p.ligue,p.zone,p.foot,p.available,p.bio,p.club_name,p.avatar_url,p.genre,p.verified,p.club_verification_status,p.created_at
    from public.public_profiles p
    where (coalesce(p_filters->>'exclude','')='' or p.id::text<>p_filters->>'exclude')
      and (coalesce(p_filters->>'ligue','')='' or p.ligue=p_filters->>'ligue')
      and (coalesce(p_filters->>'zone','')='' or p.zone=p_filters->>'zone')
      and (coalesce(p_filters->>'position','')='' or p.position=p_filters->>'position')
      and (coalesce(p_filters->>'genre','')='' or p.role='club' or p.genre=p_filters->>'genre')
      and (coalesce(p_filters->>'available','false')<>'true' or p.available is true)
      and (patterns is null or (coalesce(p.first_name,'') || ' ' || coalesce(p.last_name,'') || ' ' || coalesce(p.club_name,'') || ' ' || coalesce(p.position,'') || ' ' || coalesce(p.ligue,'') || ' ' || coalesce(p.zone,'')) ilike any(patterns))
  ), selected as materialized (
    select * from filtered where coalesce(p_filters->>'role','') in ('','all') or role=p_filters->>'role'
  ), page_rows as (
    select * from selected order by
      case when p_filters->>'sort'='name_asc' then lower(coalesce(club_name,first_name,'') || ' ' || coalesce(last_name,'')) end asc nulls last,
      case when p_filters->>'sort'='name_desc' then lower(coalesce(club_name,first_name,'') || ' ' || coalesce(last_name,'')) end desc nulls last,
      created_at desc nulls last,id
    limit p_size offset p_page*p_size
  )
  select jsonb_build_object(
    'items',(select coalesce(jsonb_agg(to_jsonb(r)),'[]'::jsonb) from page_rows r),
    'total',(select count(*) from selected),
    'counts',(select jsonb_build_object('all',count(*),'player',count(*) filter(where role='player'),'coach',count(*) filter(where role='coach'),'club',count(*) filter(where role='club')) from filtered),
    'clubStats',case when p_filters->>'clubStats'='true' then
      (select jsonb_build_object('total',count(*),'recruiting',count(*) filter(where available),'zones',count(distinct zone)) from public.public_profiles where role='club') else null end
  ) into result;
  return result;
end $$;
revoke all on function public.browse_public_profiles(jsonb,integer,integer) from public;
grant execute on function public.browse_public_profiles(jsonb,integer,integer) to anon,authenticated;
