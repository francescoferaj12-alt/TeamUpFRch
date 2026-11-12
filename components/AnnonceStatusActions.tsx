'use client'

import { useState } from 'react'
import { supabase, type Annonce } from '../lib/supabase'
import { useLang } from '../lib/lang-context'
import { annonceIsCurrent } from '../lib/annonce-lifecycle'

export default function AnnonceStatusActions({ annonce, onUpdated }: { annonce: Annonce; onUpdated: (annonce: Annonce) => void }) {
  const { lang } = useLang()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const closed = annonce.status === 'closed'
  const current = annonceIsCurrent(annonce)
  async function update(action: 'confirm' | 'close' | 'reopen') {
    setBusy(true); setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error()
      const response = await fetch(`/api/annonces/${annonce.id}/status`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ action }) })
      const body = await response.json()
      if (!response.ok || !body.annonce) throw new Error()
      onUpdated(body.annonce)
    } catch { setError(lang === 'de' ? 'Die Änderung wurde nicht gespeichert. Bitte versuche es erneut.' : 'La modification n’a pas été enregistrée. Réessaie.') }
    finally { setBusy(false) }
  }
  return <div className="annonce-status-actions">
    <span className={`listing-state ${closed ? 'closed' : current ? 'current' : 'stale'}`}>{closed ? (lang === 'de' ? 'Suche abgeschlossen' : 'Recherche terminée') : current ? (lang === 'de' ? 'Suche läuft' : 'Recherche en cours') : (lang === 'de' ? 'Bestätigung erforderlich' : 'À confirmer')}</span>
    {!closed && !current && <p>{lang === 'de' ? 'Diese Anzeige ist seit 30 Tagen nicht bestätigt und wird nicht mehr im Feed angezeigt.' : 'Sans confirmation depuis 30 jours, cette annonce n’apparaît plus dans le fil.'}</p>}
    <div className="listing-action-buttons">
      <button type="button" disabled={busy} onClick={() => update(closed ? 'reopen' : 'confirm')}>{busy ? '…' : closed ? (lang === 'de' ? 'Suche wieder öffnen' : 'Rouvrir la recherche') : (lang === 'de' ? 'Ich suche noch' : 'Je cherche toujours')}</button>
      {!closed && <button type="button" disabled={busy} onClick={() => update('close')}>{lang === 'de' ? 'Suche abschliessen' : 'Recherche terminée'}</button>}
    </div>
    {error && <p role="alert">{error}</p>}
  </div>
}
