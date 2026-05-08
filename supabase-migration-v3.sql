-- ════════════════════════════════════════════════════════════════════════════
-- TeamUpFR — Migration v3
-- Adds extended profile fields per role (player / coach / club).
-- Safe to re-run: uses IF NOT EXISTS.
-- ════════════════════════════════════════════════════════════════════════════

-- ── PLAYER extended ─────────────────────────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS position_secondary TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS jersey_number INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS height_cm INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS level TEXT;

-- ── COACH extended ──────────────────────────────────────────────────────────
-- Existing fields used as: coach_specialty=Rôle, coach_diploma=Licence UEFA,
-- coach_experience=Années d'expérience, coach_availability=Statut.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS coach_categories TEXT;   -- comma-separated
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS coach_philosophy TEXT;

-- ── CLUB extended ───────────────────────────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS club_founded_year INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS club_teams_count INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS club_stadium_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS club_stadium_address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS club_color_primary TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS club_color_secondary TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS club_categories TEXT;    -- comma-separated
