-- Synthetic fixture test; never commits accounts, sessions or reports.
begin;

-- Only temporary synthetic Auth/profile/session rows are touched; all changes roll back.
select set_config('request.jwt.claims','{"role":"service_role"}',true);
insert into auth.users(id,email,role,aud,email_confirmed_at,created_at,updated_at) values
 ('00000000-0000-4000-8000-00000000ab01','teamupfr.ch+mod-viewer-fixture@gmail.com','authenticated','authenticated',now(),now(),now()),
 ('00000000-0000-4000-8000-00000000ab02','teamupfr.ch+mod-target-fixture@gmail.com','authenticated','authenticated',now(),now(),now());
insert into auth.sessions(id,user_id,created_at,updated_at) values
 ('00000000-0000-4000-8000-00000000ac01','00000000-0000-4000-8000-00000000ab01',now(),now()),
 ('00000000-0000-4000-8000-00000000ac02','00000000-0000-4000-8000-00000000ab02',now(),now());
insert into public.profiles(id,email,role,first_name,last_name,hidden) values
 ('00000000-0000-4000-8000-00000000ab01','teamupfr.ch+mod-viewer-fixture@gmail.com','player','Fixture','Viewer',false),
 ('00000000-0000-4000-8000-00000000ab02','teamupfr.ch+mod-target-fixture@gmail.com','player','Fixture','Target',false);
insert into public.annonces(id,author_id,author_name,author_type,title,body,status) values
 ('00000000-0000-4000-8000-00000000ad01','00000000-0000-4000-8000-00000000ab02','Fixture Target','player','Moderation fixture','Temporary content, rolled back','active');
insert into public.member_reports(id,reporter_id,reported_id,reason) values
 ('00000000-0000-4000-8000-00000000ae01','00000000-0000-4000-8000-00000000ab01','00000000-0000-4000-8000-00000000ab02','Temporary moderation test');
set local role service_role;
do $test$ begin
 if (select count(*) from public.public_profiles where id in ('00000000-0000-4000-8000-00000000ab01','00000000-0000-4000-8000-00000000ab02'))<>2 then raise exception 'Service directory compatibility failed'; end if;
 if not public.member_moderation_ready() then raise exception 'Readiness failed'; end if;
end $test$;
reset role;
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-00000000ab01","role":"authenticated","session_id":"00000000-0000-4000-8000-00000000ac01"}',true);
set local role authenticated;
do $test$ begin
 if (select count(*) from public.public_profiles where id='00000000-0000-4000-8000-00000000ab02')<>1 then raise exception 'Visible-member compatibility failed'; end if;
 insert into public.messages(sender_id,receiver_id,text) values('00000000-0000-4000-8000-00000000ab01','00000000-0000-4000-8000-00000000ab02','Normal fixture message');
end $test$;
reset role;
update auth.users set banned_until=now()+interval '100 years' where id='00000000-0000-4000-8000-00000000ab02';
set local role authenticated;
do $test$ begin
 if exists(select 1 from public.public_profiles where id='00000000-0000-4000-8000-00000000ab02') then raise exception 'Suspended profile visible'; end if;
 if exists(select 1 from public.annonces where id='00000000-0000-4000-8000-00000000ad01') then raise exception 'Suspended listing visible'; end if;
 begin
 insert into public.messages(sender_id,receiver_id,text) values('00000000-0000-4000-8000-00000000ab01','00000000-0000-4000-8000-00000000ab02','Must fail');
 raise exception 'Suspended receiver accepts messages';
 exception when insufficient_privilege then null; end;
 if has_function_privilege('authenticated','public.revoke_reported_member_sessions(uuid,uuid,uuid)','execute') then raise exception 'Revocation RPC exposed'; end if;
end $test$;
reset role;
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-00000000ab02","role":"authenticated","session_id":"00000000-0000-4000-8000-00000000ac02"}',true);
set local role authenticated;
do $test$ begin
 if public.profile_media_reader() is not null then raise exception 'Suspended session still active'; end if;
 if exists(select 1 from public.profiles where id='00000000-0000-4000-8000-00000000ab02') then raise exception 'Suspended JWT reads profile'; end if;
 begin
 insert into public.annonces(author_id,title,body) values('00000000-0000-4000-8000-00000000ab02','Must fail','Blocked old JWT');
 raise exception 'Suspended JWT can publish';
 exception when insufficient_privilege then null; end;
end $test$;
reset role;
select set_config('request.jwt.claims','{"role":"service_role"}',true);
select set_config('test.moderation_actor',(select id::text from auth.users where email='teamupfr.ch@gmail.com' and email_confirmed_at is not null),true);
set local role service_role;
do $test$ declare actor uuid:=current_setting('test.moderation_actor')::uuid; begin
 if actor is null then raise exception 'Real owner record missing'; end if;
 if not public.revoke_reported_member_sessions('00000000-0000-4000-8000-00000000ae01','00000000-0000-4000-8000-00000000ab02',actor) then raise exception 'Revocation failed'; end if;
 insert into public.member_moderation_events(target_id,actor_id,report_id,action) values('00000000-0000-4000-8000-00000000ab02',actor,'00000000-0000-4000-8000-00000000ae01','block');
end $test$;
reset role;
update auth.users set banned_until=null where id='00000000-0000-4000-8000-00000000ab02';
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-00000000ab02","role":"authenticated","session_id":"00000000-0000-4000-8000-00000000ac02"}',true);
set local role authenticated;
do $test$ begin
 if public.profile_media_reader() is not null then raise exception 'Unblock revives old session'; end if;
end $test$;
reset role;
rollback;
