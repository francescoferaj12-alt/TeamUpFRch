'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../../lib/auth-context'
import { useLang } from '../../lib/lang-context'
import { supabase } from '../../lib/supabase'
import { annonceIsCurrent } from '../../lib/annonce-lifecycle'
import AdminClubsPanel from '../../components/AdminClubsPanel'
import MemberReports from '../../components/MemberReports'

type Tab = 'overview' | 'clubs' | 'members' | 'annonces' | 'reports'
type Overview = { members: number; players: number; coaches: number; clubs: number; pendingClubs: number; currentAnnonces: number; staleAnnonces: number; closedAnnonces: number; openReports: number; applications: number; messages: number }
type DirectoryItem = { id: string; created_at: string; first_name?: string; last_name?: string; email?: string; club_name?: string; role?: string; verified?: boolean; hidden?: boolean; zone?: string; title?: string; body?: string; author_id?: string; author_name?: string; author_type?: string; status?: string; last_confirmed_at?: string | null }
const tabs: Tab[] = ['overview', 'clubs', 'members', 'annonces', 'reports']
const labels = { fr: { overview: 'Vue d’ensemble', clubs: 'Clubs à gérer', members: 'Membres', annonces: 'Annonces', reports: 'Signalements' }, de: { overview: 'Übersicht', clubs: 'Vereine verwalten', members: 'Mitglieder', annonces: 'Anzeigen', reports: 'Meldungen' } }

export default function AdminPage() { return <Suspense fallback={<p role="status">Chargement…</p>}><AdminWorkspace /></Suspense> }

function AdminWorkspace() {
  const { lang } = useLang()
  const de = lang === 'de'
  const { session, authLoading } = useAuth()
  const params = useSearchParams()
  const router = useRouter()
  const requested = params.get('tab') as Tab
  const tab: Tab = tabs.includes(requested) ? requested : 'overview'
  const [overview, setOverview] = useState<Overview | null>(null)
  const [error, setError] = useState(false)
  const [denied, setDenied] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [revision, setRevision] = useState(0)
  const token = session?.access_token
  const loadOverview = useCallback(async () => {
    if (!token) return
    setRefreshing(true); setError(false)
    try {
      const response = await fetch('/api/admin/overview', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
      if (response.status === 401 || response.status === 403) { setDenied(true); return }
      if (!response.ok) throw new Error()
      setOverview(await response.json()); setDenied(false)
    } catch { setError(true) }
    finally { setRefreshing(false) }
  }, [token])
  useEffect(() => { if (session?.user.email === 'teamupfr.ch@gmail.com') void loadOverview() }, [session?.user.email, loadOverview])
  const choose = (next: Tab) => router.replace(`/admin?tab=${next}`, { scroll: false })
  if (authLoading) return <div className="admin-workspace" role="status">{de ? 'Wird geladen…' : 'Chargement…'}</div>
  if (!session || session.user.email !== 'teamupfr.ch@gmail.com' || denied) return <div className="admin-workspace"><h1>{de ? 'Zugriff verweigert' : 'Accès refusé'}</h1><p>{de ? 'Dieser Bereich ist der Administration vorbehalten.' : 'Cet espace est réservé à l’administration.'}</p></div>
  const countCards = overview && [
    { title: de ? 'Mitglieder' : 'Membres inscrits', value: overview.members, target: 'members' as Tab },
    { title: de ? 'Vereine zu prüfen' : 'Clubs à valider', value: overview.pendingClubs, target: 'clubs' as Tab },
    { title: de ? 'Aktuelle Gesuche' : 'Recherches en cours', value: overview.currentAnnonces, target: 'annonces' as Tab },
    { title: de ? 'Offene Meldungen' : 'Signalements à traiter', value: overview.openReports, target: 'reports' as Tab },
  ]
  return <div className="admin-workspace">
    <header className="admin-workspace-head"><div><p className="admin-eyebrow">TEAMUPFR</p><h1>{de ? 'Administration' : 'Administration'}</h1><p>{de ? 'Vereine, Mitglieder und Aktivitäten an einem Ort.' : 'Clubs, membres et activité : tout au même endroit.'}</p></div><button type="button" className="btn btn-outline" disabled={refreshing} onClick={() => { void loadOverview(); setRevision(v => v + 1) }}>{de ? 'Aktualisieren' : 'Actualiser'}</button></header>
    <nav className="admin-workspace-tabs" aria-label={de ? 'Administration' : 'Administration'}>{tabs.map(key => <button type="button" key={key} aria-pressed={tab === key} onClick={() => choose(key)}>{labels[lang][key]}{key === 'clubs' && !!overview?.pendingClubs && <span>{overview.pendingClubs}</span>}</button>)}</nav>
    {error && <p role="alert" className="admin-error">{de ? 'Die Daten konnten nicht geladen werden. Bitte aktualisieren.' : 'Impossible de charger les données. Réessaie avec Actualiser.'}</p>}
    {!overview ? <p role="status">{de ? 'Wird geladen…' : 'Chargement du panneau…'}</p> : <>
      {tab === 'overview' && <>
        <div className="admin-count-grid">{countCards && countCards.map(card => <button key={card.title} type="button" onClick={() => choose(card.target)}><strong>{card.value}</strong><span>{card.title}</span></button>)}</div>
        <section className="admin-section"><h2>{de ? 'Als Nächstes erledigen' : 'À faire maintenant'}</h2><div className="admin-task-grid"><button type="button" onClick={() => choose('clubs')}><strong>{de ? 'Vereine prüfen' : 'Vérifier les clubs'}</strong><span>{overview.pendingClubs} {de ? 'offene Anfragen' : 'demandes en attente'}</span></button><button type="button" onClick={() => choose('annonces')}><strong>{de ? 'Gesuche aktuell halten' : 'Suivre les recherches'}</strong><span>{overview.staleAnnonces} {de ? 'Anzeigen zu bestätigen' : 'annonces à reconfirmer'}</span></button><button type="button" onClick={() => choose('reports')}><strong>{de ? 'Meldungen bearbeiten' : 'Traiter les signalements'}</strong><span>{overview.openReports} {de ? 'offene Meldungen' : 'signalements ouverts'}</span></button></div></section>
        <section className="admin-section"><h2>{de ? 'Die Community' : 'La communauté'}</h2><div className="admin-mini-stats"><p><strong>{overview.players}</strong>{de ? 'Spieler' : 'Joueurs'}</p><p><strong>{overview.coaches}</strong>{de ? 'Trainer' : 'Coachs'}</p><p><strong>{overview.clubs}</strong>{de ? 'Vereine' : 'Clubs'}</p><p><strong>{overview.closedAnnonces}</strong>{de ? 'Abgeschlossene Gesuche' : 'Recherches terminées'}</p><p><strong>{overview.applications}</strong>{de ? 'Bewerbungen' : 'Candidatures'}</p><p><strong>{overview.messages}</strong>{de ? 'Gesendete Nachrichten' : 'Messages échangés'}</p></div><p className="admin-muted">{de ? 'Die Nachrichten werden nur gezählt. Ihre privaten Inhalte werden hier nicht angezeigt.' : 'Les messages sont comptabilisés. Leur contenu privé n’est pas affiché ici.'}</p></section>
      </>}
      {tab === 'clubs' && <AdminClubsPanel key={revision} onChanged={() => void loadOverview()} />}
      {(tab === 'members' || tab === 'annonces') && <AdminDirectory key={`${tab}-${revision}`} type={tab} token={token!} onChanged={() => void loadOverview()} />}
      {tab === 'reports' && <section className="admin-section"><h2>{labels[lang].reports}</h2><MemberReports key={revision} /></section>}
    </>}
  </div>
}

function AdminDirectory({ type, token, onChanged }: { type: 'members' | 'annonces'; token: string; onChanged: () => void }) {
  const { lang } = useLang(); const de = lang === 'de'
  const [query, setQuery] = useState(''); const [filter, setFilter] = useState(''); const [page, setPage] = useState(0)
  const [items, setItems] = useState<DirectoryItem[]>([]); const [total, setTotal] = useState(0); const [loading, setLoading] = useState(true); const [error, setError] = useState(false); const [busy, setBusy] = useState<string | null>(null); const [retry, setRetry] = useState(0)
  useEffect(() => {
    const abort = new AbortController(); setLoading(true); setError(false)
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: query, page: String(page), [type === 'members' ? 'role' : 'state']: filter })
        const response = await fetch(`/api/admin/${type}?${params}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store', signal: abort.signal })
        if (!response.ok) throw new Error()
        const data = await response.json(); if (abort.signal.aborted) return
        setItems(data.items); setTotal(data.total); setLoading(false)
      } catch { if (!abort.signal.aborted) { setError(true); setLoading(false) } }
    }, 250)
    return () => { clearTimeout(timer); abort.abort() }
  }, [query, filter, page, token, type, retry])
  async function badge(item: DirectoryItem) {
    setBusy(item.id)
    try {
      const response = await fetch(`/api/admin/members/${item.id}/badge`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ verified: !item.verified }) })
      if (!response.ok) throw new Error()
      setItems(rows => rows.map(row => row.id === item.id ? { ...row, verified: !item.verified } : row)); onChanged()
    } catch { setError(true) }
    finally { setBusy(null) }
  }
  return <section className="admin-section"><h2>{labels[lang][type]}</h2><div className="admin-directory-filters"><input aria-label={de ? 'Suchen' : 'Rechercher'} placeholder={type === 'members' ? (de ? 'Name, E-Mail, Verein…' : 'Nom, email, club…') : (de ? 'Titel oder Verfasser…' : 'Titre ou auteur…')} value={query} onChange={e => { setQuery(e.target.value); setPage(0) }} /><select aria-label={de ? 'Filtern' : 'Filtrer'} value={filter} onChange={e => { setFilter(e.target.value); setPage(0) }}><option value="">{de ? 'Alle' : 'Tous'}</option>{(type === 'members' ? [['player', de ? 'Spieler' : 'Joueurs'], ['coach', de ? 'Trainer' : 'Coachs'], ['club', de ? 'Vereine' : 'Clubs']] : [['current', de ? 'Aktuell' : 'En cours'], ['stale', de ? 'Zu bestätigen' : 'À confirmer'], ['closed', de ? 'Abgeschlossen' : 'Terminées']]).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
    {error && <p role="alert">{de ? 'Die Aktion ist fehlgeschlagen.' : 'Impossible de terminer cette action.'} <button type="button" onClick={() => setRetry(n => n + 1)}>{de ? 'Erneut versuchen' : 'Réessayer'}</button></p>}
    {loading ? <p role="status">{de ? 'Wird geladen…' : 'Chargement…'}</p> : <><p className="admin-muted">{total} {de ? 'Ergebnisse' : 'résultats'}</p>{items.length === 0 && <p>{de ? 'Keine Ergebnisse.' : 'Aucun résultat.'}</p>}<div className="admin-directory-list">{items.map(item => <article key={item.id}>
      <div><h3>{type === 'members' ? item.club_name || `${item.first_name || ''} ${item.last_name || ''}`.trim() || item.email : item.title}</h3>{type === 'members' ? <><p>{item.email}</p><p className="admin-muted">{item.role === 'club' ? (de ? 'Verein' : 'Club') : item.role === 'coach' ? (de ? 'Trainer' : 'Coach') : (de ? 'Spieler' : 'Joueur')}{item.zone && ` · ${item.zone}`}{item.hidden && (de ? ' · Ausgeblendet' : ' · Masqué')}</p></> : <><p>{item.author_name} · {item.zone}</p><p className="admin-muted">{new Date(item.created_at).toLocaleDateString(de ? 'de-CH' : 'fr-CH')} · {item.status === 'closed' ? (de ? 'Abgeschlossen' : 'Recherche terminée') : annonceIsCurrent({ status: item.status || '', created_at: item.created_at, last_confirmed_at: item.last_confirmed_at }) ? (de ? 'Aktuell' : 'En cours') : (de ? 'Zu bestätigen' : 'À confirmer')}</p><p>{item.body}</p></>}</div>
      <div className="admin-row-actions"><Link href={type === 'members' && item.role === 'club' ? `/club/${item.id}` : `/profil/${item.author_id || item.id}`}>{de ? 'Profil öffnen' : 'Voir le profil'} →</Link>{type === 'members' && item.role !== 'club' && <button type="button" disabled={busy !== null} onClick={() => void badge(item)}>{busy === item.id ? '…' : item.verified ? (de ? 'Badge entfernen' : 'Retirer le badge') : (de ? 'Badge bestätigen' : 'Valider le badge')}</button>}{type === 'members' && item.role === 'club' && <Link href="/admin?tab=clubs">{de ? 'Verein verwalten' : 'Gérer le club'}</Link>}</div>
    </article>)}</div><div className="admin-pagination"><button type="button" disabled={page === 0} onClick={() => setPage(p => p - 1)}>{de ? 'Zurück' : 'Précédent'}</button><span>{page + 1} / {Math.max(1, Math.ceil(total / 25))}</span><button type="button" disabled={(page + 1) * 25 >= total} onClick={() => setPage(p => p + 1)}>{de ? 'Weiter' : 'Suivant'}</button></div></>}
  </section>
}
