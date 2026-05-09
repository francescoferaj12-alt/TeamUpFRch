-- ════════════════════════════════════════════════════════════════════════════
-- TeamUpFR — Migration v8
-- Fixes the persistent notification badge bug.
--
-- Root cause: RLS policies for UPDATE on `messages` and `applications` are
-- missing or incomplete, so mark-as-read / mark-as-seen UPDATEs are silently
-- denied (PostgREST returns 0 rows updated, no error). The DB therefore keeps
-- the unread/unseen flag, and any future re-query (e.g. on Supabase JWT
-- TOKEN_REFRESHED, profile re-load, or new realtime INSERT) re-populates the
-- badge.
--
-- This migration adds:
--   1. `messages` UPDATE policy: receiver may mark as read (read=true).
--   2. `applications` UPDATE policy: annonce owner may update status AND
--      seen_by_owner. Re-creates the policy with an explicit WITH CHECK clause
--      so PostgREST validates the post-update row, not just the pre-update one.
--
-- Safe to re-run: each policy is wrapped in DO $$ … EXCEPTION WHEN
-- duplicate_object THEN NULL; END $$; — and the existing v1 applications
-- policy is dropped first so we can re-create it cleanly.
-- ════════════════════════════════════════════════════════════════════════════

-- ── 1. messages: allow receiver to mark messages as read ────────────────────
DO $$
BEGIN
  CREATE POLICY "Receiver can mark messages as read"
    ON messages
    FOR UPDATE
    USING (auth.uid() = receiver_id)
    WITH CHECK (auth.uid() = receiver_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── 2. applications: replace v1 update policy with one that has WITH CHECK ──
-- Drop the original (USING-only) policy if it exists; the new one covers
-- both `status` and `seen_by_owner` updates by the annonce owner.
DROP POLICY IF EXISTS "Annonce authors can update status" ON applications;

DO $$
BEGIN
  CREATE POLICY "Annonce authors can update applications"
    ON applications
    FOR UPDATE
    USING (
      auth.uid() IN (SELECT author_id FROM annonces WHERE id = annonce_id)
    )
    WITH CHECK (
      auth.uid() IN (SELECT author_id FROM annonces WHERE id = annonce_id)
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── 3. Backfill: clear stale unseen flags so existing rows don't keep the
--    badge stuck at 1 after the policy fix is deployed. The application code
--    will keep these in sync going forward. Comment out if you'd rather let
--    users naturally clear them by visiting /candidatures.
-- UPDATE applications SET seen_by_owner = true WHERE seen_by_owner IS NULL OR seen_by_owner = false;
