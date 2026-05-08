-- Migration v5: coach certificates column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS coach_certificates TEXT;
