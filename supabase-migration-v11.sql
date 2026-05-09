-- ════════════════════════════════════════════════════════════════════════════
-- TeamUpFR — Migration v11
-- Allow applicants to cancel (delete) their own pending applications.
--
-- The candidatures page now shows a "Annuler" button on the Envoyées tab.
-- Without this policy the DELETE is silently denied by RLS, so the row
-- disappears from the UI but remains in the database.
-- ════════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  CREATE POLICY "Applicants can delete own applications"
    ON applications
    FOR DELETE
    USING (auth.uid() = applicant_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
