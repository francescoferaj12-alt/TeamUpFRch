-- These writes are rolled back; no member data or onboarding progress is retained.
begin;
do $$
declare member_id uuid; other_before jsonb;
begin
  select id into member_id from public.profiles where role = 'player' order by id limit 1;
  if member_id is null then raise exception 'Player fixture required'; end if;
  select coalesce(jsonb_agg(to_jsonb(c) order by c.id), '[]') into other_before
    from public.career_experiences c where user_id <> member_id;
  perform set_config('teamupfr.qa_other_career', other_before::text, true);
  perform set_config('request.jwt.claims', jsonb_build_object('sub',member_id,'role','authenticated')::text, true);
end $$;
set local role authenticated;
do $$
declare previous jsonb; blocked boolean := false; count_rows integer;
begin
  perform public.save_onboarding_career('[{"club_name":"transaction-only test","start_date":"2019-01-01","end_date":null,"is_current":true,"user_id":"00000000-0000-4000-8000-000000000001"}]');
  select count(*) into count_rows from public.career_experiences
    where user_id = auth.uid() and start_date = '2019-01-01' and end_date is null and is_current;
  if count_rows <> 1 then raise exception 'Career did not save'; end if;
  select coalesce(jsonb_agg(to_jsonb(c) order by c.id),'[]') into previous
    from public.career_experiences c where user_id = auth.uid();
  begin
    perform public.save_onboarding_career('[{"club_name":"valid first row","start_date":"2020-01-01"},{"club_name":"invalid second row","start_date":"2023-02-29"}]');
  exception when datetime_field_overflow then blocked := true;
  end;
  if not blocked then raise exception 'Invalid date was accepted'; end if;
  if previous <> (select coalesce(jsonb_agg(to_jsonb(c) order by c.id),'[]') from public.career_experiences c where user_id = auth.uid()) then
    raise exception 'Failed save changed the previous career';
  end if;
  if (select onboarding_step from public.profiles where id=auth.uid()) <> 3 then raise exception 'Progress did not save'; end if;
  perform public.save_onboarding_career('[]');
  if exists(select 1 from public.career_experiences where user_id=auth.uid()) then raise exception 'Empty replacement failed'; end if;
  if current_setting('teamupfr.qa_other_career')::jsonb <> (select coalesce(jsonb_agg(to_jsonb(c) order by c.id),'[]') from public.career_experiences c where user_id <> auth.uid()) then
    raise exception 'Another member was changed';
  end if;
end $$;
reset role;
set local role anon;
do $$ declare blocked boolean := false; begin
  begin perform public.save_onboarding_career('[]');
  exception when insufficient_privilege then blocked := true; end;
  if not blocked then raise exception 'Anonymous career write allowed'; end if;
end $$;
reset role;
select true as normalized_date_saved, true as failed_save_keeps_previous_career,
  true as empty_replacement_works, true as progress_saved,
  true as other_members_unchanged, true as anonymous_write_blocked;
rollback;
