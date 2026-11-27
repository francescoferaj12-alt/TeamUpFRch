create table public.member_notifications(
 id uuid primary key default gen_random_uuid(),recipient_id uuid not null references auth.users on delete cascade,
 actor_id uuid not null references auth.users on delete cascade,
 post_id uuid references public.community_posts on delete cascade,
 annonce_id uuid references public.annonces on delete cascade,
 created_at timestamptz not null default now(),read_at timestamptz,
 check(num_nonnulls(post_id,annonce_id)=1),check(actor_id<>recipient_id));
create unique index notification_post_once on public.member_notifications(recipient_id,post_id) where post_id is not null;
create unique index notification_annonce_once on public.member_notifications(recipient_id,annonce_id) where annonce_id is not null;
create index member_notifications_inbox on public.member_notifications(recipient_id,created_at desc,id desc);
create index member_notifications_unread on public.member_notifications(recipient_id) where read_at is null;
alter table public.member_notifications enable row level security;
revoke all on public.member_notifications from public,anon,authenticated;
grant select,update(read_at) on public.member_notifications to authenticated;
create policy "Read own live notifications" on public.member_notifications for select to authenticated using(recipient_id=(select auth.uid()) and private.community_visible(actor_id) and (post_id is not null or exists(select 1 from public.annonces a where a.id=annonce_id and a.status='active')));
create policy "Mark own notifications" on public.member_notifications for update to authenticated using(recipient_id=(select auth.uid()) and (select private.account_storage_active())) with check(recipient_id=(select auth.uid()) and (select private.account_storage_active()));
create function private.notify_member_followers() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if tg_table_name='annonces' and to_jsonb(new)->>'status'<>'active' then return new;end if;
 -- Fan-out is atomic with publication and idempotent. No client-supplied recipients.
 insert into public.member_notifications(recipient_id,actor_id,post_id,annonce_id)
 select f.follower_id,new.author_id,case when tg_table_name='community_posts' then new.id end,case when tg_table_name='annonces' then new.id end
 from public.member_follows f join public.profiles p on p.id=f.follower_id join auth.users u on u.id=f.follower_id
 where f.followed_id=new.author_id and p.hidden is not true and u.email_confirmed_at is not null and (u.banned_until is null or u.banned_until<=now())
 and not exists(select 1 from public.member_blocks b where (b.blocker_id=f.follower_id and b.blocked_id=f.followed_id) or (b.blocker_id=f.followed_id and b.blocked_id=f.follower_id))
 on conflict do nothing;
 return new;
end $$;
revoke all on function private.notify_member_followers() from public;
create trigger notify_post_followers after insert on public.community_posts for each row execute function private.notify_member_followers();
create trigger notify_annonce_followers after insert on public.annonces for each row execute function private.notify_member_followers();
create function private.remove_blocked_follows() returns trigger language plpgsql security definer set search_path='' as $$
begin
 delete from public.member_follows where (follower_id=new.blocker_id and followed_id=new.blocked_id) or (follower_id=new.blocked_id and followed_id=new.blocker_id);
 delete from public.member_notifications where (recipient_id=new.blocker_id and actor_id=new.blocked_id) or (recipient_id=new.blocked_id and actor_id=new.blocker_id);
 return new;
end $$;
revoke all on function private.remove_blocked_follows() from public;
create trigger remove_blocked_follows after insert on public.member_blocks for each row execute function private.remove_blocked_follows();

create function public.browse_community_feed(p_kind text default 'all',p_query text default '',p_page integer default 0,p_id uuid default null) returns jsonb language sql stable security invoker set search_path='' as $$
 with feed as (
 select 'annonce' as kind,a.id,a.created_at,to_jsonb(a) as content from public.annonces a where (p_id is null or a.id=p_id) and a.status='active' and coalesce(a.last_confirmed_at,a.created_at)>now()-interval '30 days' and p_kind in ('all','annonce') and private.community_visible(a.author_id) and (left(p_query,120)='' or a.title ilike '%'||left(p_query,120)||'%' or a.body ilike '%'||left(p_query,120)||'%')
 union all
 select 'publication',p.id,p.created_at,to_jsonb(p) from public.community_posts p where (p_id is null or p.id=p_id) and p_kind in ('all','publication') and (left(p_query,120)='' or p.body ilike '%'||left(p_query,120)||'%')
 ), page as (select * from feed order by created_at desc,id desc,kind limit 24 offset greatest(0,least(p_page,10000))*24)
 select jsonb_build_object('items',coalesce((select jsonb_agg(to_jsonb(page) order by created_at desc,id desc,kind) from page),'[]'::jsonb),'total',(select count(*) from feed));
$$;
revoke all on function public.browse_community_feed(text,text,integer,uuid) from public,anon;
grant execute on function public.browse_community_feed(text,text,integer,uuid) to authenticated;
