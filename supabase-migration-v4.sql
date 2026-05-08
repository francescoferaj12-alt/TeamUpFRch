-- ════════════════════════════════════════════════════════════════════════════
-- TeamUpFR — Migration v4
-- Adds file attachment columns to the messages table.
-- Safe to re-run: uses IF NOT EXISTS.
-- ════════════════════════════════════════════════════════════════════════════

ALTER TABLE messages ADD COLUMN IF NOT EXISTS file_url  TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS file_type TEXT;  -- 'image' | 'video' | 'file'
ALTER TABLE messages ADD COLUMN IF NOT EXISTS file_name TEXT;
