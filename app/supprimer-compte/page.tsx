'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '../../lib/auth-context'
import { useLang } from '../../lib/lang-context'
import { supabase } from '../../lib/supabase'

export default function DeleteAccountPage() {
  const { session, authLoading } = useAuth()
  const { lang } = useLang()
  const de = lang === 'de'
  const word = de ? 'LÖSCHEN' : 'SUPPRIMER'
  const [confirmation, setConfirmation] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [reauth, setReauth] = useState(false)
  const [deleted, setDeleted] = useState(false)

  async function authenticateAgain() {
    setBusy(true)
    const { error } = await supabase.auth.signOut({ scope: 'local' })
    if (error) {
      setError(de ? 'Abmeldung fehlgeschlagen. Bitte versuche es erneut.' : 'Déconnexion impossible. Réessaie.')
      setBusy(false)
      return
    }
    window.location.assign('/login?redirect=%2Fsupprimer-compte')
  }

  async function removeAccount(event: React.FormEvent) {
    event.preventDefault()
    if (!session || busy || !acknowledged || confirmation.trim() !== word) return
    setBusy(true); setError(''); setReauth(false)
    try {
      const result = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ confirmation: 'DELETE' }),
      })
      const body = await result.json().catch(() => ({}))
      if (!result.ok || body.ok !== true) {
        if (body.error === 'REAUTHENTICATION_REQUIRED' || body.error === 'UNAUTHORIZED') {
          setReauth(true)
          throw new Error(de ? 'Melde dich zur Sicherheit erneut an und bestätige danach die Löschung.' : 'Pour ta sécurité, reconnecte-toi puis confirme à nouveau la suppression.')
        }
        if (body.error === 'OWNER_ACCOUNT_REQUIRES_SUPPORT') {
          throw new Error(de ? 'Das Hauptadministratorkonto muss über den Support verwaltet werden.' : 'Le compte administrateur principal doit être géré avec le support.')
        }
        if (body.error === 'UNAVAILABLE') {
          throw new Error(de ? 'Der Dienst ist vorübergehend nicht verfügbar. Es wurden keine Daten gelöscht.' : 'Le service est temporairement indisponible. Aucune donnée n’a été supprimée.')
        }
        if (body.error === 'CLEANUP_FAILED_ACCOUNT_LOCKED') {
          throw new Error(de ? 'Die Löschung wurde unterbrochen und das Konto vorübergehend gesperrt. Einige Dateien wurden möglicherweise entfernt. Kontaktiere teamupfr.ch@gmail.com.' : 'La suppression a été interrompue et le compte temporairement bloqué. Certains fichiers ont pu être retirés. Contacte teamupfr.ch@gmail.com.')
        }
        throw new Error(de ? 'Die Löschung wurde nicht abgeschlossen. Einige Dateien wurden möglicherweise entfernt. Versuche es erneut oder kontaktiere teamupfr.ch@gmail.com.' : 'La suppression n’est pas terminée. Certains fichiers ont pu être retirés. Réessaie ou contacte teamupfr.ch@gmail.com.')
      }
      setDeleted(true)
      await supabase.auth.signOut({ scope: 'local' })
    } catch (cause) {
      setError(cause instanceof Error && !(cause instanceof TypeError) ? cause.message : (de ? 'Verbindung unterbrochen. Prüfe deine Verbindung. Falls die Löschung bereits abgeschlossen wurde, ist eine erneute Anmeldung nicht mehr möglich.' : 'Connexion interrompue. Vérifie ton réseau. Si la suppression a déjà abouti, tu ne pourras plus te reconnecter.'))
    } finally { setBusy(false) }
  }

  return <section style={{ maxWidth: 700, margin: '0 auto', padding: '140px 24px 80px', color: '#fff', minHeight: '75vh' }}>
    <div style={{ padding: 'clamp(20px, 4vw, 36px)', border: '1px solid #ffffff26', borderRadius: 20, background: '#122344' }}>
      <h1 style={{ fontSize: 'clamp(26px, 5vw, 38px)', marginBottom: 20 }}>{deleted ? (de ? 'Konto gelöscht' : 'Compte supprimé') : (de ? 'Mein Konto löschen' : 'Supprimer mon compte')}</h1>
      {deleted ? <>
        <p role="status">{de ? 'Dein TeamUpFR-Konto und die zugehörigen Daten im aktiven Dienst wurden gelöscht.' : 'Ton compte TeamUpFR et les données associées dans le service actif ont été supprimés.'}</p>
        <Link className="btn btn-outline" href="/accueil">{de ? 'Zurück zum Video' : 'Revenir à la vidéo'}</Link>
      </> : <>
        <p style={{ lineHeight: 1.7 }}>{de ? 'Diese Aktion löscht dein Konto, dein Profil, deine Anzeigen, Bewerbungen, Nachrichten und auf TeamUpFR hochgeladenen Dateien. Sie kann nicht rückgängig gemacht werden.' : 'Cette action supprime ton compte, ton profil, tes annonces, candidatures, messages et fichiers chargés sur TeamUpFR. Elle est irréversible.'}</p>
        <p style={{ color: '#c7d1e3', lineHeight: 1.7 }}>{de ? 'Auf YouTube veröffentlichte Videos werden nicht von YouTube gelöscht. Technische Sicherungen und zwischengespeicherte Kopien folgen den Aufbewahrungsfristen der Anbieter.' : 'Les vidéos publiées sur YouTube ne sont pas supprimées de YouTube. Les sauvegardes techniques et copies en cache suivent les durées de conservation des prestataires.'}</p>
        {authLoading ? <p role="status">{de ? 'Wird geladen…' : 'Chargement…'}</p> : !session ? <>
          <p>{de ? 'Melde dich an, um die Löschung deines eigenen Kontos zu bestätigen. Bei Problemen hilft dir unser Support.' : 'Connecte-toi pour confirmer la suppression de ton propre compte. Si tu n’y arrives pas, notre support peut t’aider.'}</p>
          <Link className="btn btn-red" href="/login?redirect=%2Fsupprimer-compte">{de ? 'Anmelden' : 'Se connecter'}</Link>
        </> : <form onSubmit={removeAccount} style={{ display: 'grid', gap: 18, marginTop: 24 }}>
          <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', lineHeight: 1.6 }}>
            <input type="checkbox" checked={acknowledged} onChange={event => setAcknowledged(event.target.checked)} disabled={busy} style={{ minWidth: 22, height: 22, marginTop: 2 }} />
            {de ? 'Ich verstehe, dass mein Konto und meine Daten endgültig gelöscht werden.' : 'Je comprends que mon compte et mes données seront définitivement supprimés.'}
          </label>
          <label htmlFor="delete-confirmation">{de ? `Gib ${word} ein, um zu bestätigen.` : `Écris ${word} pour confirmer.`}</label>
          <input id="delete-confirmation" value={confirmation} onChange={event => setConfirmation(event.target.value)} autoComplete="off" autoCapitalize="characters" spellCheck={false} disabled={busy} style={{ minHeight: 48, width: '100%', boxSizing: 'border-box', background: '#09152f', color: '#fff', border: '1px solid #ffffff40', borderRadius: 10, padding: 12, fontSize: 16 }} />
          {error && <p role="alert" style={{ color: '#ffc0c0', lineHeight: 1.6 }}>{error}</p>}
          {reauth && <button type="button" className="btn btn-outline" onClick={authenticateAgain} disabled={busy}>{de ? 'Erneut anmelden' : 'Me reconnecter'}</button>}
          <button className="btn btn-red" type="submit" disabled={busy || !acknowledged || confirmation.trim() !== word} style={{ minHeight: 48, opacity: busy || !acknowledged || confirmation.trim() !== word ? 0.5 : 1 }}>{busy ? (de ? 'Löschung läuft…' : 'Suppression en cours…') : (de ? 'Mein Konto endgültig löschen' : 'Supprimer définitivement mon compte')}</button>
          <Link href="/profil" style={{ color: '#c7d1e3' }}>{de ? 'Abbrechen und zum Profil' : 'Annuler et revenir au profil'}</Link>
        </form>}
        <p style={{ marginTop: 28 }}><a href="mailto:teamupfr.ch@gmail.com" style={{ color: '#9fc1ff' }}>teamupfr.ch@gmail.com</a></p>
      </>}
    </div>
  </section>
}
