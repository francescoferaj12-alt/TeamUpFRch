-- Explicit column-level grants for aff_club_id
-- PostgREST may need these if table-level grants don't cover new columns
GRANT INSERT (aff_club_id) ON profiles TO anon;
GRANT UPDATE (aff_club_id) ON profiles TO anon;
GRANT INSERT (aff_club_id) ON profiles TO authenticated;
GRANT UPDATE (aff_club_id) ON profiles TO authenticated;
GRANT SELECT (aff_club_id) ON profiles TO anon, authenticated;
