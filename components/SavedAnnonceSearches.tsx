'use client'

import { useEffect, useState } from 'react'
import { footballLabel } from '../lib/football-labels'
import { useLang } from '../lib/lang-context'
import { supabase } from '../lib/supabase'

export type AnnonceFilters = {
  query: string
  ligue: string
  zone: string
  position: string
  author_type: string
}

type SavedSearch = AnnonceFilters & { id: string; email_alert: boolean }

export default function SavedAnnonceSearches({ userId, filters, apply }: {
  userId: string
  filters: AnnonceFilters
  apply: (filters: AnnonceFilters) => void
}) {
  const { lang } = useLang()
  const de = lang === 'de'
  const [searches, setSearches] = useState<SavedSearch[]>([])
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    let active = true
    supabase.from('saved_annonce_searches').select('id,query,ligue,zone,position,author_type,email_alert')
      .eq('owner_id', userId).order('created_at', { ascending: false })
      .then(({ data }) => { if (active && data) setSearches(data) })
    return () => { active = false }
  }, [userId])

  async function save() {
    setBusy(true)
    const { data, error } = await supabase.from('saved_annonce_searches')
      .insert({ ...filters, query: filters.query.trim() })
      .select('id,query,ligue,zone,position,author_type,email_alert').single()
    if (data) setSearches(items => [data, ...items.filter(item => item.id !== data.id)])
    setFeedback(error?.code === '23505'
      ? (de ? 'Diese Suche ist bereits gespeichert.' : 'Cette recherche est déjà enregistrée.')
      : error
      ? (de ? 'Speichern fehlgeschlagen.' : 'Impossible d’enregistrer la recherche.')
      : (de ? 'Suche gespeichert.' : 'Recherche enregistrée.'))
    setBusy(false)
  }

  async function remove(id: string) {
    setBusy(true)
    const { error } = await supabase.from('saved_annonce_searches').delete().eq('owner_id', userId).eq('id', id)
    if (!error) setSearches(items => items.filter(item => item.id !== id))
    setFeedback(error
      ? (de ? 'Löschen fehlgeschlagen.' : 'Impossible de supprimer la recherche.')
      : (de ? 'Suche gelöscht.' : 'Recherche supprimée.'))
    setBusy(false)
  }

  async function toggleAlert(search: SavedSearch) {
    setBusy(true)
    const { error } = await supabase.from('saved_annonce_searches')
      .update({ email_alert: !search.email_alert }).eq('owner_id', userId).eq('id', search.id)
    if (!error) setSearches(items => items.map(item => item.id === search.id
      ? { ...item, email_alert: !search.email_alert }
      : item))
    setFeedback(error
      ? (de ? 'E-Mail-Einstellung konnte nicht gespeichert werden.' : 'Impossible d’enregistrer le réglage e-mail.')
      : '')
    setBusy(false)
  }

  const typeLabels: Record<string, string> = {
    club: de ? 'Vereine' : 'Clubs',
    coach: de ? 'Trainer' : 'Entraîneurs',
    player: de ? 'Spieler' : 'Joueurs',
  }

  return (
    <details style={{ margin: '12px 0', fontSize: 13 }}>
      <summary style={{ cursor: 'pointer' }}>{de ? 'Gespeicherte Suchen' : 'Recherches enregistrées'}</summary>
      <div style={{ display: 'grid', gap: 8, justifyItems: 'start', padding: '8px 0' }}>
        <button type="button" className="an-reset" disabled={busy || !Object.values(filters).some(value => value.trim())} onClick={save}>
          {de ? 'Aktuelle Suche speichern' : 'Enregistrer cette recherche'}
        </button>
        {searches.length === 0 && <span>{de ? 'Noch keine gespeicherten Suchen.' : 'Aucune recherche enregistrée.'}</span>}
        {searches.map(search => {
          const label = [search.query, ...[search.ligue, search.zone, search.position].map(value => footballLabel(value, lang)), typeLabels[search.author_type]]
            .filter(Boolean).join(' · ')
          return (
            <div key={search.id} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" className="an-reset" onClick={() => apply(search)}>{label}</button>
              <label>
                <input type="checkbox" checked={search.email_alert} disabled={busy} onChange={() => toggleAlert(search)} />
                {de ? 'E-Mail bei neuen Treffern' : 'E-mail pour les nouvelles annonces'}
              </label>
              <button type="button" className="an-reset" disabled={busy} onClick={() => remove(search.id)}
                aria-label={de ? `Suche löschen: ${label}` : `Supprimer la recherche : ${label}`}>
                {de ? 'Löschen' : 'Supprimer'}
              </button>
            </div>
          )
        })}
        {feedback && <p role="status">{feedback}</p>}
      </div>
    </details>
  )
}
