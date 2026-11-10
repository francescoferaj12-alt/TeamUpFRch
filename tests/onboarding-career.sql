-- These writes are rolled back; no member data or onboarding progress is retained.
begin;
do $$
declare member_id uuid; other_member_id uuid; other_experience_id uuid; other_before jsonb;
begin
  select id into member_id from public.profiles where role = 'player' order by id limit 1;
  if member_id is null then raise exception 'Player fixture required'; end if;
  select id into other_member_id from public.profiles where id <> member_id order by id limit 1;
  if other_member_id is null then raise exception 'Second profile fixture required'; end if;
  insert into public.career_experiences (user_id, club_name, start_date)
    values (other_member_id, 'transaction-only second member', '2019-01-01')
    returning id into other_experience_id;
  select coalesce(jsonb_agg(to_jsonb(c) order by c.id), '[]') into other_before
    from public.career_experiences c where user_id <> member_id;
  perform set_config('teamupfr.qa_other_career', other_before::text, true);
  perform set_config('teamupfr.qa_other_experience_id', other_experience_id::text, true);
  perform set_config('request.jwt.claims', jsonb_build_object('sub',member_id,'role','authenticated')::text, true);
end $$;
set local role authenticated;
do $$
declare previous jsonb; blocked boolean := false; count_rows integer;
  kept_id uuid; submitted jsonb;
begin
  perform public.save_onboarding_career('[{"club_name":"transaction-only test","start_date":"2019-01-01","end_date":null,"is_current":true,"user_id":"00000000-0000-4000-8000-000000000001"}]');
  select count(*) into count_rows from public.career_experiences
    where user_id = auth.uid() and start_date = '2019-01-01' and end_date is null and is_current;
  if count_rows <> 1 then raise exception 'Career did not save'; end if;
  update public.career_experiences
    set goals = 8, description = 'transaction-only details', club_logo_url = 'https://example.com/logo.png'
    where user_id = auth.uid() returning id into kept_id;
  submitted := jsonb_build_array(jsonb_build_object(
    'id', kept_id, 'club_name', 'edited club', 'start_date', '2020-01-01'));
  perform public.save_onboarding_career(submitted);
  perform public.save_onboarding_career(submitted);
  if (select count(*) from public.career_experiences where user_id = auth.uid()) <> 1
    or not exists (select 1 from public.career_experiences
      where id = kept_id and user_id = auth.uid() and club_name = 'edited club'
        and start_date = '2020-01-01' and goals = 8
        and description = 'transaction-only details' and club_logo_url = 'https://example.com/logo.png') then
    raise exception 'Editing or retrying lost details or duplicated the career entry';
  end if;
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
  blocked := false;
  begin
    perform public.save_onboarding_career(submitted || submitted);
  exception when invalid_parameter_value then blocked := true;
  end;
  if not blocked then raise exception 'Duplicate IDs were accepted'; end if;
  blocked := false;
  begin
    perform public.save_onboarding_career(jsonb_build_array(jsonb_build_object(
      'id', current_setting('teamupfr.qa_other_experience_id'), 'club_name', 'foreign edit',
      'start_date', '2020-01-01')));
  exception when insufficient_privilege then blocked := true;
  end;
  if not blocked then raise exception 'Another member experience ID was accepted'; end if;
  if previous <> (select coalesce(jsonb_agg(to_jsonb(c) order by c.id),'[]') from public.career_experiences c where user_id = auth.uid()) then
    raise exception 'Rejected edit changed the previous career';
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
  true as other_members_unchanged, true as anonymous_write_blocked,
  true as details_preserved_after_retry, true as duplicate_ids_blocked, true as foreign_id_blocked;
rollback;
