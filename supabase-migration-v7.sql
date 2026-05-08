-- Migration v7: coach_certificates — proper table instead of JSON TEXT

CREATE TABLE IF NOT EXISTS coach_certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  year TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Migrate existing JSON data from profiles.coach_certificates
INSERT INTO coach_certificates (coach_id, name, year)
SELECT
  id AS coach_id,
  cert->>'name' AS name,
  NULLIF(cert->>'year', '') AS year
FROM profiles,
  jsonb_array_elements(coach_certificates::jsonb) AS cert
WHERE coach_certificates IS NOT NULL
  AND coach_certificates NOT IN ('[]', 'null', '')
  AND jsonb_typeof(coach_certificates::jsonb) = 'array'
ON CONFLICT DO NOTHING;

-- RLS
ALTER TABLE coach_certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coach_certs_select" ON coach_certificates FOR SELECT USING (true);
CREATE POLICY "coach_certs_insert" ON coach_certificates FOR INSERT WITH CHECK (auth.uid() = coach_id);
CREATE POLICY "coach_certs_delete" ON coach_certificates FOR DELETE USING (auth.uid() = coach_id);

-- Remove the old TEXT column from profiles
ALTER TABLE profiles DROP COLUMN IF EXISTS coach_certificates;
