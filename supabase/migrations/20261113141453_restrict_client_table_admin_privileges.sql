-- End users need row-scoped CRUD, never table administration privileges.
-- No rows or RLS policies are changed. Service-role grants are untouched.
revoke truncate, references, trigger on all tables in schema public from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke truncate, references, trigger on tables from anon, authenticated;
