-- Club verification system: status states, timestamps, rejection reason, email flag

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS club_verification_status TEXT
    CHECK (club_verification_status IN ('pending', 'approved', 'rejected'));

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS club_verified_at TIMESTAMPTZ;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS club_rejection_reason TEXT;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS club_email_is_professional BOOLEAN DEFAULT false;

-- Grandfather existing verified clubs into the new system
UPDATE profiles
  SET club_verification_status = 'approved',
      club_verified_at = COALESCE(updated_at, created_at)
  WHERE verified = true AND role = 'club';

-- New club registrations will start with club_verification_status = 'pending'
-- (set by the server-side create-profile API route)
