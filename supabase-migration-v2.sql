-- ============================================
-- TeamUpFR — Migration v2: missing columns
-- Run ONCE in Supabase SQL editor.
-- ============================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birthdate TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS career TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_requested BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS strengths TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS video1_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS video2_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS video3_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS goals_prev INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS assists_prev INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS matches_prev INTEGER DEFAULT 0;

-- Also add type column to annonces if not present
ALTER TABLE annonces ADD COLUMN IF NOT EXISTS type TEXT;
