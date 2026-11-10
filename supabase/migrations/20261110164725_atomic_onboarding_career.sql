-- Keep replacement and onboarding progress atomic; retain the caller's RLS.
create or replace function public.save_onboarding_career(experiences jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
  owner_role text;
  entry jsonb;
  starts date;
  ends date;
  current_club boolean;
begin
  if owner_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  -- Serialise repeated saves by the same account.
  select role into owner_role from public.profiles where id = owner_id for update;
  if owner_role is null or owner_role not in ('player', 'coach') then
    raise exception 'Career requires a player or coach profile' using errcode = '42501';
  end if;
  if experiences is null or jsonb_typeof(experiences) <> 'array' then
    raise exception 'Career must be an array' using errcode = '22023';
  end if;
  if jsonb_array_length(experiences) > 50 then
    raise exception 'Too many career entries' using errcode = '22023';
  end if;

  delete from public.career_experiences where user_id = owner_id;
  for entry in select value from jsonb_array_elements(experiences) loop
    if jsonb_typeof(entry) <> 'object'
      or nullif(btrim(entry->>'club_name'), '') is null
      or length(entry->>'club_name') > 200
      or coalesce(entry->>'start_date', '') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
      raise exception 'Invalid career entry' using errcode = '22023';
    end if;
    starts := (entry->>'start_date')::date;
    current_club := coalesce((entry->>'is_current')::boolean, false);
    ends := case when current_club then null else nullif(entry->>'end_date', '')::date end;
    if ends < starts then
      raise exception 'End date precedes start date' using errcode = '22023';
    end if;
    insert into public.career_experiences
      (user_id, club_name, league, position, coach_role, start_date, end_date, is_current)
    values
      (owner_id, btrim(entry->>'club_name'), nullif(entry->>'league',''),
       nullif(entry->>'position',''), nullif(entry->>'coach_role',''), starts, ends, current_club);
  end loop;
  update public.profiles set onboarding_step = 3 where id = owner_id;
end;
$$;

revoke all on function public.save_onboarding_career(jsonb) from public, anon;
grant execute on function public.save_onboarding_career(jsonb) to authenticated;
