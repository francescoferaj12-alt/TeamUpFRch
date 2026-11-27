begin;
select set_config('request.jwt.claims','{"role":"service_role"}',true);
insert into auth.users(id,email,role,aud,email_confirmed_at,created_at,updated_at) values
('00000000-0000-4000-8000-00000000bb01','teamupfr.ch+social-fixture1@gmail.com','authenticated','authenticated',now(),now(),now()),
('00000000-0000-4000-8000-00000000bb02','teamupfr.ch+social-fixture2@gmail.com','authenticated','authenticated',now(),now(),now());
insert into auth.sessions(id,user_id,created_at,updated_at) values('00000000-0000-4000-8000-00000000bc01','00000000-0000-4000-8000-00000000bb01',now(),now()),('00000000-0000-4000-8000-00000000bc02','00000000-0000-4000-8000-00000000bb02',now(),now());
insert into public.profiles(id,email,role,first_name,last_name,hidden) values('00000000-0000-4000-8000-00000000bb01','teamupfr.ch+social-fixture1@gmail.com','player','Test','Follower',false),('00000000-0000-4000-8000-00000000bb02','teamupfr.ch+social-fixture2@gmail.com','player','Test','Publisher',false);
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-00000000bb01","role":"authenticated","session_id":"00000000-0000-4000-8000-00000000bc01"}',true);set local role authenticated;
insert into public.member_follows(followed_id) values('00000000-0000-4000-8000-00000000bb02');
do $$begin
 begin insert into public.member_follows(followed_id) values(auth.uid()); raise exception 'Self follow allowed'; exception when check_violation then null; end;
 begin insert into public.member_follows(followed_id) values('00000000-0000-4000-8000-00000000bb02'); raise exception 'Duplicate follow allowed'; exception when unique_violation then null; end;
end $$;
reset role;
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-00000000bb02","role":"authenticated","session_id":"00000000-0000-4000-8000-00000000bc02"}',true);set local role authenticated;
insert into storage.objects(bucket_id,name,metadata) values('community-media','00000000-0000-4000-8000-00000000bb02/00000000-0000-4000-8000-00000000bd01/photo.jpg','{"size":1024,"mimetype":"image/jpeg"}');
insert into public.community_posts(id,body,media_kind,media_path) values('00000000-0000-4000-8000-00000000bd01','Community fixture unique','image','00000000-0000-4000-8000-00000000bb02/00000000-0000-4000-8000-00000000bd01/photo.jpg');
-- Portable read/upload tokens cannot outlive member logout.
select set_config('storage.operation','storage.object.sign',true);
do $$begin if exists(select 1 from storage.objects where bucket_id='community-media') then raise exception 'Signed read URL allowed';end if;end $$;
select set_config('storage.operation','storage.object.sign_many',true);
do $$begin if exists(select 1 from storage.objects where bucket_id='community-media') then raise exception 'Batch signed URL allowed';end if;end $$;
select set_config('storage.operation','storage.object.sign_upload_url',true);
do $$begin begin insert into storage.objects(bucket_id,name,metadata) values('community-media','00000000-0000-4000-8000-00000000bb02/00000000-0000-4000-8000-00000000bd03/photo.jpg','{"size":1024}');raise exception 'Signed upload URL allowed';exception when insufficient_privilege then null;end;end $$;
select set_config('storage.operation','',true);
insert into public.annonces(id,author_id,title,body,author_name,author_type,status) values('00000000-0000-4000-8000-00000000be01',auth.uid(),'Community fixture unique','Temporary announcement','Fixture Publisher','player','active');
do $$begin
 if exists(select 1 from public.member_notifications) then raise exception 'Foreign inbox leaked';end if;
 begin insert into public.member_notifications(recipient_id,actor_id,post_id) values('00000000-0000-4000-8000-00000000bb01',auth.uid(),'00000000-0000-4000-8000-00000000bd01');raise exception 'Notification spoof allowed';exception when insufficient_privilege then null;end;
end $$;
reset role;
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-00000000bb01","role":"authenticated","session_id":"00000000-0000-4000-8000-00000000bc01"}',true);set local role authenticated;
do $$begin
 if (select count(*) from public.member_notifications)<>2 then raise exception 'Follower fanout failed';end if;
 if (public.browse_community_feed('all','Community fixture unique',0)->>'total')::int<>2 then raise exception 'Mixed feed failed';end if;
 if (public.browse_community_feed('publication','Community fixture unique',0)->>'total')::int<>1 then raise exception 'Publication filter failed';end if;
 if (public.browse_community_feed('annonce','',0,'00000000-0000-4000-8000-00000000be01')->>'total')::int<>1 then raise exception 'Annonce deep link failed';end if;
 if (select count(*) from public.community_posts where id='00000000-0000-4000-8000-00000000bd01')<>1 then raise exception 'Member cannot read';end if;
 delete from public.community_posts where id='00000000-0000-4000-8000-00000000bd01';
 if not exists(select 1 from public.community_posts where id='00000000-0000-4000-8000-00000000bd01') then raise exception 'Foreign deletion allowed';end if;
end $$;
update public.member_notifications set read_at=now() where read_at is null;
insert into public.member_blocks(blocked_id) values('00000000-0000-4000-8000-00000000bb02');
do $$begin
 if exists(select 1 from public.member_follows) then raise exception 'Block retains follow';end if;
 if exists(select 1 from public.member_notifications) then raise exception 'Block retains notifications';end if;
 if (public.browse_community_feed('all','Community fixture unique',0)->>'total')::int<>0 then raise exception 'Blocked content leaked';end if;
 begin insert into public.member_follows(followed_id) values('00000000-0000-4000-8000-00000000bb02');raise exception 'Blocked follow allowed';exception when insufficient_privilege then null;end;
end $$;
reset role;set local role anon;
do $$begin
 begin perform * from public.community_posts;raise exception 'Anonymous post read';exception when insufficient_privilege then null;end;
 begin perform * from public.member_notifications;raise exception 'Anonymous inbox read';exception when insufficient_privilege then null;end;
end $$;
reset role;
delete from auth.sessions where id='00000000-0000-4000-8000-00000000bc01';
set local role authenticated;
do $$begin
 if public.profile_media_reader() is not null then raise exception 'Revoked session live';end if;
 if (public.browse_community_feed('all','Community fixture unique',0)->>'total')::int<>0 then raise exception 'Revoked reader leaked';end if;
end $$;
reset role;select 'community_integration_passed' as result;
rollback;
