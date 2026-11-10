-- Preserve details on retained experiences while saving the whole form atomically.
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
  experience_id uuid;
  saved_ids uuid[] := '{}';
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
    -- Older forms can still submit entries without an ID.
    experience_id := coalesce((entry->>'id')::uuid, gen_random_uuid());
    if experience_id = any(saved_ids) then
      raise exception 'Duplicate career entry' using errcode = '22023';
    end if;

    -- Edit only the fields shown by onboarding. Keep statistics, logo and description.
    insert into public.career_experiences as existing
      (id, user_id, club_name, league, position, coach_role, start_date, end_date, is_current)
    values
      (experience_id, owner_id, btrim(entry->>'club_name'), nullif(entry->>'league',''),
       nullif(entry->>'position',''), nullif(entry->>'coach_role',''), starts, ends, current_club)
    on conflict (id) do update set
      club_name = excluded.club_name,
      league = excluded.league,
      position = excluded.position,
      coach_role = excluded.coach_role,
      start_date = excluded.start_date,
      end_date = excluded.end_date,
      is_current = excluded.is_current
    where existing.user_id = owner_id;
    if not found then
      raise exception 'Career entry does not belong to this profile' using errcode = '42501';
    end if;
    saved_ids := array_append(saved_ids, experience_id);
  end loop;
  delete from public.career_experiences
    where user_id = owner_id and id <> all(saved_ids);
  update public.profiles set onboarding_step = 3 where id = owner_id;
end;
$$;

revoke all on function public.save_onboarding_career(jsonb) from public, anon;
grant execute on function public.save_onboarding_career(jsonb) to authenticated;
