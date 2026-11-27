create table public.community_posts(
 id uuid primary key default gen_random_uuid(),author_id uuid not null default auth.uid() references auth.users on delete cascade,
 body text not null default '' check(char_length(body)<=2000),
 media_kind text not null check(media_kind in ('image','video')),
 media_path text not null unique,
 created_at timestamptz not null default now(),
 check(media_path=author_id::text||'/'||id::text||case media_kind when 'image' then '/photo.jpg' else '/video.mp4' end));
create index community_posts_feed on public.community_posts(created_at desc,id desc);
create index community_posts_author on public.community_posts(author_id,created_at desc);
alter table public.community_posts enable row level security;
revoke all on public.community_posts from public,anon,authenticated;
grant select,insert(id,body,media_kind,media_path),delete on public.community_posts to authenticated;
create policy "Read visible publications" on public.community_posts for select to authenticated using(private.community_visible(author_id));
create policy "Publish own content" on public.community_posts for insert to authenticated with check(author_id=(select auth.uid()) and private.community_visible(author_id) and exists(select 1 from storage.objects o where o.bucket_id='community-media' and o.name=media_path));
create policy "Remove own publication" on public.community_posts for delete to authenticated using(author_id=(select auth.uid()) and (select private.account_storage_active()));
create function private.community_post_limit() returns trigger language plpgsql security definer set search_path='' as $$
begin
 perform pg_advisory_xact_lock(hashtextextended(new.author_id::text,42));
 if (select count(*) from public.community_posts where author_id=new.author_id and created_at>now()-interval '24 hours')>=5 then raise exception 'PUBLICATION_DAILY_LIMIT' using errcode='23514';end if;
 return new;
end $$;
revoke all on function private.community_post_limit() from public;
create trigger community_post_limit before insert on public.community_posts for each row execute function private.community_post_limit();

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('community-media','community-media',false,20971520,array['image/jpeg','video/mp4']) on conflict(id) do nothing;
create function private.community_upload_allowed(object_name text) returns boolean language sql stable security definer set search_path='' as $$
 select private.community_visible(auth.uid())
 and object_name ~ ('^'||auth.uid()::text||'/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/(photo[.]jpg|video[.]mp4)$')
 and (select count(*) from storage.objects where bucket_id='community-media' and (storage.foldername(name))[1]=auth.uid()::text and created_at>now()-interval '24 hours')<10
 and (select coalesce(sum((metadata->>'size')::bigint),0) from storage.objects where bucket_id='community-media' and (storage.foldername(name))[1]=auth.uid()::text)<104857600;
$$;
revoke all on function private.community_upload_allowed(text) from public;
grant execute on function private.community_upload_allowed(text) to authenticated;
create policy "Community upload" on storage.objects for insert to authenticated with check(bucket_id='community-media' and private.community_upload_allowed(name));
create policy "Community media members only" on storage.objects for select to authenticated using(bucket_id='community-media' and (select private.account_storage_active()) and ((storage.foldername(name))[1]=(select auth.uid())::text or exists(select 1 from public.community_posts p where p.media_path=name)));
create policy "Community media owner removal" on storage.objects for delete to authenticated using(bucket_id='community-media' and (storage.foldername(name))[1]=(select auth.uid())::text and (select private.account_storage_active()));

