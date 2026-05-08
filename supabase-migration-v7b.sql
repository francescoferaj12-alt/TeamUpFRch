-- Migration v7b: ensure all extended profile columns exist
-- Safe to run even if columns already exist (IF NOT EXISTS)

-- Player extended
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS position_secondary TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS jersey_number INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS height_cm INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS level TEXT;

-- Coach extended
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS coach_categories TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS coach_philosophy TEXT;

-- Club extended
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS club_founded_year INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS club_teams_count INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS club_stadium_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS club_stadium_address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS club_color_primary TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS club_color_secondary TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS club_categories TEXT;
