-- The existing private subscriptions need these tables in the Realtime publication.
-- RLS continues to authorize every event for its recipient; no grants or policies change.
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='messages') then
    alter publication supabase_realtime add table public.messages;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='applications') then
    alter publication supabase_realtime add table public.applications;
  end if;
end $$;
