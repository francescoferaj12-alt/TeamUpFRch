-- Migration v6: seen_by_owner for candidatures badge
ALTER TABLE applications ADD COLUMN IF NOT EXISTS seen_by_owner BOOLEAN DEFAULT false;
