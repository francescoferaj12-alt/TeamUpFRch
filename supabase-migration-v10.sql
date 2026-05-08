-- ════════════════════════════════════════════════════════════════════════════
-- TeamUpFR — Migration v10
-- Backfill seen_by_owner so the candidatures badge stops returning.
--
-- Migration v8 added the RLS UPDATE policy but left the backfill commented out.
-- Existing rows that still have seen_by_owner = NULL or false cause queryApps()
-- in the Navbar to count them as unseen on every re-query (realtime INSERT,
-- session refresh, etc.), making the badge reappear even after the user visits
-- /candidatures.
--
-- This migration marks all existing applications as seen. The application code
-- will keep new rows in sync going forward via the v8 UPDATE policy.
-- ════════════════════════════════════════════════════════════════════════════

UPDATE applications
SET seen_by_owner = true
WHERE seen_by_owner IS NULL OR seen_by_owner = false;
