-- ============================================
-- TeamUpFR — Indexes & scaling tuning
-- Run ONCE in Supabase SQL editor.
-- ============================================

-- profiles: filter combinations from /recherche
CREATE INDEX IF NOT EXISTS idx_profiles_role           ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_ligue          ON profiles(ligue);
CREATE INDEX IF NOT EXISTS idx_profiles_zone           ON profiles(zone);
CREATE INDEX IF NOT EXISTS idx_profiles_position       ON profiles(position);
CREATE INDEX IF NOT EXISTS idx_profiles_available      ON profiles(available);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at     ON profiles(created_at DESC);
-- Trigram indexes for ilike search on names/club_name
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_profiles_first_name_trgm ON profiles USING gin (first_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_last_name_trgm  ON profiles USING gin (last_name  gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_club_name_trgm  ON profiles USING gin (club_name  gin_trgm_ops);

-- messages: inbox + unread badge + conversation thread
CREATE INDEX IF NOT EXISTS idx_messages_receiver_read   ON messages(receiver_id, read);
CREATE INDEX IF NOT EXISTS idx_messages_sender          ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_pair_created    ON messages(sender_id, receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_created ON messages(receiver_id, created_at DESC);

-- annonces: feed + my-annonces
CREATE INDEX IF NOT EXISTS idx_annonces_status_created ON annonces(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_annonces_author         ON annonces(author_id);
CREATE INDEX IF NOT EXISTS idx_annonces_ligue          ON annonces(ligue);
CREATE INDEX IF NOT EXISTS idx_annonces_zone           ON annonces(zone);

-- applications: my candidatures + received apps
CREATE INDEX IF NOT EXISTS idx_applications_annonce    ON applications(annonce_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant  ON applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_status     ON applications(status);

-- ============================================
-- Realtime: enable for messages table
-- (Supabase Dashboard → Database → Replication → enable for `messages`)
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
