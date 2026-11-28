-- Coach status is authoritative; the shared flag powers directory filters/badges.
create function private.sync_coach_availability() returns trigger
language plpgsql set search_path='' as $$
begin
 if new.role='coach' then
  if new.coach_availability='Cherche un club' then new.available=true;
  elsif new.coach_availability in ('En poste actuellement','Pas disponible') then new.available=false;
  end if;
 end if;
 return new;
end $$;
revoke all on function private.sync_coach_availability() from public,anon,authenticated;
create trigger sync_coach_availability before insert or update of role,available,coach_availability
on public.profiles for each row execute function private.sync_coach_availability();
-- Correct contradictory existing flags without changing the chosen status.
update public.profiles set available=(coach_availability='Cherche un club')
where role='coach' and coach_availability in ('Cherche un club','En poste actuellement','Pas disponible')
and available is distinct from (coach_availability='Cherche un club');
