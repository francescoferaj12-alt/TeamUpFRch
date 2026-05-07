'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, Profile, Application, Annonce } from '../../lib/supabase'

type AppWithAnnonce = Application & { annonce_title?: string; annonce_author?: string; annonce_ligue?: string }
type Status = 'all' | 'pending' | 'accepted' | 'rejected'

export default function CandidaturesPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      if (!data) { router.push('/login'); return }
      setProfile(data)
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ color: 'var(--text-muted)' }}>Chargement…</div>
    </div>
  )
  if (!profile) return null

  return profile.role === 'club' || profile.role === 'coach'
    ? <ClubView profile={profile} />
    : <PlayerView profile={profile} />
}

/* ── CLUB / COACH VIEW: see received applications ── */

function ClubView({ profile }: { profile: Profile }) {
  const [apps, setApps] = useState<AppWithAnnonce[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Status>('all')
  const [annonces, setAnnonces] = useState<Annonce[]>([])
  const [filterAnnonce, setFilterAnnonce] = useState('')

  useEffect(() => {
    supabase.from('annonces').select('*').eq('author_id', profile.id)
      .then(({ data }) => setAnnonces(data || []))

    supabase.from('applications')
      .select('*, annonces!inner(title, author_id, ligue)')
      .eq('annonces.author_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const mapped = (data || []).map((a: Application & { annonces: { title: string; ligue: string } }) => ({
          ...a,
          annonce_title: a.annonces?.title,
          annonce_ligue: a.annonces?.ligue
        }))
        setApps(mapped)
        setLoading(false)
      })
  }, [profile.id])

  async function updateStatus(id: string, status: 'pending' | 'accepted' | 'rejected') {
    await supabase.from('applications').update({ status }).eq('id', id)
    setApps((prev) => prev.map((a) => a.id === id ? { ...a, status } : a))
  }

  const counts = {
    all: apps.length,
    pending: apps.filter((a) => a.status === 'pending').length,
    accepted: apps.filter((a) => a.status === 'accepted').length,
    rejected: apps.filter((a) => a.status === 'rejected').length
  }

  const filtered = apps.filter((a) => {
    if (filter !== 'all' && a.status !== filter) return false
    if (filterAnnonce && a.annonce_id !== filterAnnonce) return false
    return true
  })

  return (
    <div className="wrap">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '.75rem' }}>
        <div>
          <div className="section-label">Gestion</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: 1 }}>Candidatures reçues</div>
        </div>
        <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="badge badge-amber">{counts.pending} en attente</span>
          <span className="badge badge-green">{counts.accepted} acceptées</span>
          <span className="badge badge-red">{counts.rejected} refusées</span>
          <Link href="/dashboard" className="btn btn-ghost btn-sm">← Dashboard</Link>
        </div>
      </div>

      {/* FILTERS */}
      <div style={{ display: 'flex', gap: 6, marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {(['all', 'pending', 'accepted', 'rejected'] as Status[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '6px 14px', borderRadius: 8, border: `1.5px solid ${filter === f ? 'var(--blue-bright)' : 'var(--border)'}`, background: filter === f ? 'var(--blue-light)' : '#fff', color: filter === f ? 'var(--blue-mid)' : 'var(--text-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            {f === 'all' ? `Toutes (${counts.all})` : f === 'pending' ? `⏳ En attente (${counts.pending})` : f === 'accepted' ? `✅ Acceptées (${counts.accepted})` : `❌ Refusées (${counts.rejected})`}
          </button>
        ))}
        {annonces.length > 0 && (
          <select value={filterAnnonce} onChange={(e) => setFilterAnnonce(e.target.value)}
            style={{ background: 'var(--gray-bg)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '6px 12px', fontSize: 13, fontFamily: 'inherit', outline: 'none' }}>
            <option value="">Toutes les annonces</option>
            {annonces.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
          </select>
        )}
      </div>

      {/* LIST */}
      {loading ? (
        <div style={{ color: 'var(--text-muted)', padding: '2rem 0' }}>Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          {apps.length === 0 ? 'Aucune candidature reçue pour l\'instant.' : 'Aucune candidature dans cette catégorie.'}
        </div>
      ) : (
        filtered.map((a) => (
          <div key={a.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', padding: '1.25rem', marginBottom: '.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '.5rem', marginBottom: '.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>👤</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{a.applicant_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Pour : {a.annonce_title} {a.annonce_ligue ? `· ${a.annonce_ligue}` : ''}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(a.created_at).toLocaleDateString('fr-CH', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
              </div>
              <StatusBadge status={a.status} />
            </div>

            <div style={{ background: 'var(--gray-bg)', borderRadius: 10, padding: '.65rem .85rem', fontSize: 13, fontStyle: 'italic', lineHeight: 1.6, marginBottom: '.75rem' }}>
              "{a.message}"
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {a.status === 'pending' && (
                <>
                  <button onClick={() => updateStatus(a.id, 'accepted')} className="btn btn-green btn-sm">✅ Accepter</button>
                  <button onClick={() => updateStatus(a.id, 'rejected')} className="btn btn-red btn-sm">❌ Refuser</button>
                  <Link href="/messages" className="btn btn-ghost btn-sm">💬 Message</Link>
                </>
              )}
              {a.status === 'accepted' && (
                <>
                  <Link href="/messages" className="btn btn-blue btn-sm">💬 Contacter</Link>
                  <button onClick={() => updateStatus(a.id, 'rejected')} className="btn btn-ghost btn-sm">↩ Annuler</button>
                </>
              )}
              {a.status === 'rejected' && (
                <button onClick={() => updateStatus(a.id, 'pending')} className="btn btn-ghost btn-sm">↩ Reconsidérer</button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

/* ── PLAYER VIEW: see own applications ── */

function PlayerView({ profile }: { profile: Profile }) {
  const [apps, setApps] = useState<AppWithAnnonce[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Status>('all')

  useEffect(() => {
    supabase.from('applications')
      .select('*, annonces(title, author_name, ligue, zone)')
      .eq('applicant_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const mapped = (data || []).map((a: Application & { annonces: { title: string; author_name: string; ligue: string } }) => ({
          ...a,
          annonce_title: a.annonces?.title,
          annonce_author: a.annonces?.author_name,
          annonce_ligue: a.annonces?.ligue
        }))
        setApps(mapped)
        setLoading(false)
      })
  }, [profile.id])

  const counts = {
    all: apps.length,
    pending: apps.filter((a) => a.status === 'pending').length,
    accepted: apps.filter((a) => a.status === 'accepted').length,
    rejected: apps.filter((a) => a.status === 'rejected').length
  }
  const filtered = filter === 'all' ? apps : apps.filter((a) => a.status === filter)

  return (
    <div className="wrap">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '.75rem' }}>
        <div>
          <div className="section-label">Mon parcours</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: 1 }}>Mes candidatures</div>
        </div>
        <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="badge badge-amber">{counts.pending} en attente</span>
          <span className="badge badge-green">{counts.accepted} acceptées</span>
          <Link href="/annonces" className="btn btn-blue btn-sm">+ Nouvelle candidature</Link>
        </div>
      </div>

      {/* FILTERS */}
      <div style={{ display: 'flex', gap: 6, marginBottom: '1rem', flexWrap: 'wrap' }}>
        {(['all', 'pending', 'accepted', 'rejected'] as Status[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '6px 14px', borderRadius: 8, border: `1.5px solid ${filter === f ? 'var(--blue-bright)' : 'var(--border)'}`, background: filter === f ? 'var(--blue-light)' : '#fff', color: filter === f ? 'var(--blue-mid)' : 'var(--text-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            {f === 'all' ? `Toutes (${counts.all})` : f === 'pending' ? `⏳ En attente (${counts.pending})` : f === 'accepted' ? `✅ Acceptées (${counts.accepted})` : `❌ Refusées (${counts.rejected})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          {apps.length === 0 ? (
            <>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📋</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: '.5rem' }}>Aucune candidature envoyée</div>
              <div style={{ fontSize: 14, marginBottom: '1.25rem' }}>Explore les annonces et postule à celles qui t'intéressent !</div>
              <Link href="/annonces" className="btn btn-blue">Voir les annonces →</Link>
            </>
          ) : 'Aucune candidature dans cette catégorie.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
          {filtered.map((a) => (
            <div key={a.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', padding: '1.25rem', borderLeft: `4px solid ${a.status === 'accepted' ? 'var(--green)' : a.status === 'rejected' ? 'var(--red)' : 'var(--amber)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '.5rem', marginBottom: '.65rem' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{a.annonce_title || 'Annonce'}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {a.annonce_author}{a.annonce_ligue ? ` · ${a.annonce_ligue}` : ''}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Envoyée le {new Date(a.created_at).toLocaleDateString('fr-CH', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </div>
              <div style={{ background: 'var(--gray-bg)', borderRadius: 8, padding: '.55rem .75rem', fontSize: 13, fontStyle: 'italic', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                "{a.message}"
              </div>
              {a.status === 'accepted' && (
                <div style={{ marginTop: '.75rem', background: 'var(--green-bg)', borderRadius: 8, padding: '.55rem .75rem', fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>
                  🎉 Candidature acceptée ! Contacte le club pour la suite.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    pending: { cls: 'badge-amber', label: '⏳ En attente' },
    accepted: { cls: 'badge-green', label: '✅ Acceptée' },
    rejected: { cls: 'badge-red', label: '❌ Refusée' }
  }
  const m = map[status] || map.pending
  return <span className={`badge ${m.cls}`} style={{ padding: '5px 12px', fontSize: 12 }}>{m.label}</span>
}
