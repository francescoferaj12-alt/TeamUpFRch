-- Inbox summaries avoid repeatedly scanning every message in a member's history.
create table public.message_conversations (
  owner_id uuid not null references auth.users(id) on delete cascade,
  partner_id uuid not null references auth.users(id) on delete cascade,
  last_message_id uuid not null,
  last_message_at timestamptz not null,
  primary key(owner_id,partner_id)
);
alter table public.message_conversations enable row level security;
revoke all on public.message_conversations from anon,authenticated;
grant select on public.message_conversations to authenticated;
create policy "Members read their own inbox" on public.message_conversations for select to authenticated using(owner_id=(select auth.uid()));
create index message_conversations_partner_idx on public.message_conversations(partner_id);
create index message_conversations_latest_idx on public.message_conversations(owner_id,last_message_at desc,last_message_id desc);
create index messages_pair_history_idx on public.messages(sender_id,receiver_id,created_at desc,id desc);
create index messages_unread_pair_idx on public.messages(receiver_id,sender_id) where read is false;

-- No FK on last_message_id: the delete trigger recomputes the last remaining message.
create or replace function private.sync_message_conversations() returns trigger language plpgsql security definer set search_path='' as $$
declare member uuid; partner uuid; latest public.messages%rowtype;
begin
  if tg_op='INSERT' then
    insert into public.message_conversations(owner_id,partner_id,last_message_id,last_message_at)
      select distinct v.owner_id,v.partner_id,new.id,new.created_at
      from (values(new.sender_id,new.receiver_id),(new.receiver_id,new.sender_id)) v(owner_id,partner_id)
      order by v.owner_id
    on conflict(owner_id,partner_id) do update set last_message_id=excluded.last_message_id,last_message_at=excluded.last_message_at
      where (message_conversations.last_message_at,message_conversations.last_message_id)<(excluded.last_message_at,excluded.last_message_id);
    return new;
  end if;
  for member,partner in select distinct v.a,v.b from(values(old.sender_id,old.receiver_id),(old.receiver_id,old.sender_id))v(a,b) order by v.a loop
    -- Lock in the same owner order as inserts, including opposite-direction sends.
    perform 1 from public.message_conversations where owner_id=member and partner_id=partner for update;
    select m.* into latest from public.messages m
      where (m.sender_id=member and m.receiver_id=partner) or (m.sender_id=partner and m.receiver_id=member)
      order by m.created_at desc,m.id desc limit 1;
    if found then
      update public.message_conversations set last_message_id=latest.id,last_message_at=latest.created_at where owner_id=member and partner_id=partner;
    else
      delete from public.message_conversations where owner_id=member and partner_id=partner;
    end if;
  end loop;
  return old;
end $$;
revoke all on function private.sync_message_conversations() from public,anon,authenticated;
create trigger sync_message_conversations after insert or delete on public.messages for each row execute function private.sync_message_conversations();
insert into public.message_conversations(owner_id,partner_id,last_message_id,last_message_at)
select distinct on(owner_id,partner_id) owner_id,partner_id,id,created_at from (
  select sender_id owner_id,receiver_id partner_id,id,created_at from public.messages
  union all select receiver_id,sender_id,id,created_at from public.messages
) m order by owner_id,partner_id,created_at desc,id desc;

create or replace function public.message_inbox(p_query text default '',p_before timestamptz default null,p_before_id uuid default null,p_size integer default 30)
returns jsonb language plpgsql stable security invoker set search_path='' as $$
declare me uuid:=(select auth.uid()); pattern text;
begin
  if me is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if p_size is null or p_size not between 1 and 50 or length(coalesce(p_query,''))>120 or (p_before is null)<>(p_before_id is null) then raise exception 'Invalid inbox page' using errcode='22023'; end if;
  pattern:='%'||replace(replace(replace(coalesce(p_query,''),E'\\',E'\\\\'),'%',E'\\%'),'_',E'\\_')||'%';
  return (with rows as materialized (
    select c.partner_id as "partnerId", coalesce(nullif(case when p.role='club' then p.club_name else concat_ws(' ',p.first_name,p.last_name) end,''),'—') as "partnerName",
      coalesce(p.role,'') as "partnerRole",p.avatar_url as "partnerAvatar",m.text as "lastMessage",m.file_name as "lastFileName",
      c.last_message_at as "lastAt",c.last_message_id as "lastId",
      (select count(*) from public.messages u where u.receiver_id=me and u.sender_id=c.partner_id and u.read is false) as unread
    from public.message_conversations c join public.messages m on m.id=c.last_message_id
    left join public.public_profiles p on p.id=c.partner_id
    where c.owner_id=me and (p_before is null or (c.last_message_at,c.last_message_id)<(p_before,p_before_id))
      and (coalesce(p_query,'')='' or concat_ws(' ',p.first_name,p.last_name,p.club_name) ilike pattern)
    order by c.last_message_at desc,c.last_message_id desc limit p_size+1
  ), page as(select * from rows order by "lastAt" desc,"lastId" desc limit p_size)
  select jsonb_build_object('items',coalesce((select jsonb_agg(to_jsonb(p) order by "lastAt" desc,"lastId" desc) from page p),'[]'::jsonb),'hasMore',(select count(*)>p_size from rows)));
end $$;
revoke all on function public.message_inbox(text,timestamptz,uuid,integer) from public,anon;
grant execute on function public.message_inbox(text,timestamptz,uuid,integer) to authenticated;

create or replace function public.message_thread(p_partner uuid,p_before timestamptz default null,p_before_id uuid default null,p_size integer default 50)
returns jsonb language plpgsql stable security invoker set search_path='' as $$
declare me uuid:=(select auth.uid());
begin
  if me is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if p_partner is null or p_size is null or p_size not between 1 and 100 or (p_before is null)<>(p_before_id is null) then raise exception 'Invalid message page' using errcode='22023'; end if;
  return (with rows as materialized (
    select m.* from public.messages m where ((m.sender_id=me and m.receiver_id=p_partner) or (m.sender_id=p_partner and m.receiver_id=me))
      and (p_before is null or (m.created_at,m.id)<(p_before,p_before_id))
      order by m.created_at desc,m.id desc limit p_size+1
  ),page as(select * from rows order by created_at desc,id desc limit p_size)
  select jsonb_build_object('items',coalesce((select jsonb_agg(to_jsonb(p) order by created_at desc,id desc) from page p),'[]'::jsonb),'hasMore',(select count(*)>p_size from rows)));
end $$;
revoke all on function public.message_thread(uuid,timestamptz,uuid,integer) from public,anon;
grant execute on function public.message_thread(uuid,timestamptz,uuid,integer) to authenticated;

create or replace function public.browse_annonces(p_filters jsonb default '{}'::jsonb,p_page integer default 0,p_size integer default 24)
returns jsonb language plpgsql stable security invoker set search_path='' as $$
declare patterns text[];
begin
  if p_filters is null or jsonb_typeof(p_filters)<>'object' or p_page is null or p_page not between 0 and 100000 or p_size is null or p_size not between 1 and 48 then raise exception 'Invalid listing page' using errcode='22023'; end if;
  if p_filters ? 'queries' and (jsonb_typeof(p_filters->'queries')<>'array' or jsonb_array_length(p_filters->'queries')>64) then raise exception 'Invalid search terms' using errcode='22023'; end if;
  select array_agg('%'||replace(replace(replace(value,E'\\',E'\\\\'),'%',E'\\%'),'_',E'\\_')||'%') into patterns from jsonb_array_elements_text(coalesce(p_filters->'queries','[]'::jsonb)) where length(value) between 1 and 120;
  return (with visible as materialized (
    select a.*,jsonb_build_object('id',p.id,'avatar_url',p.avatar_url,'verified',p.verified or p.club_verification_status='approved') as profiles
    from public.annonces a join public.public_profiles p on p.id=a.author_id where a.status='active'
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
grant execute on function public.browse_annonces(jsonb,integer,integer) to anon,authenticated;

-- Hard per-file limit is enforced by Storage, including clients bypassing the UI.
-- Three active slots: <=60 MiB; up to three replacements: <=120 MiB temporarily.
update storage.buckets set file_size_limit=20971520,allowed_mime_types=array['video/*'] where id='videos';
create or replace function private.can_upload_profile_video(object_name text) returns boolean language plpgsql volatile security definer set search_path='' as $$
declare me uuid:=(select auth.uid()); files integer;
begin
  if me is null or split_part(object_name,'/',1)<>me::text or object_name !~ '^[0-9a-f-]{36}/video_[123]_[0-9a-f-]{36}\.[a-z0-9]{1,12}$' then return false; end if;
  perform pg_advisory_xact_lock(hashtextextended('profile-video:'||me::text,0));
  select count(*) into files from storage.objects where bucket_id='videos' and (storage.foldername(name))[1]=me::text;
  return files<6;
end $$;
revoke all on function private.can_upload_profile_video(text) from public,anon;
grant execute on function private.can_upload_profile_video(text) to authenticated;
-- Restrictive policy also constrains any existing permissive INSERT policy.
create policy "Profile video quota" on storage.objects as restrictive for insert to authenticated
  with check(bucket_id<>'videos' or private.can_upload_profile_video(name));
notify pgrst,'reload schema';
