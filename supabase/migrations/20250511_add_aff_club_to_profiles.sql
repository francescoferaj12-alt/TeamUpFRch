-- Migration: Add AFF club reference to profiles
-- Run in Supabase SQL Editor

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS aff_club_id INTEGER REFERENCES aff_clubs(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_aff_club_id ON profiles(aff_club_id);

-- Existing club profiles are grandfathered: aff_club_id stays NULL
