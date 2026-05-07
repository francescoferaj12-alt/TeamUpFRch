'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, Annonce, Profile } from '../../lib/supabase'
import { ligues, zones, positions } from '../../lib/data'
import { useAuth } from '../../lib/auth-context'

export default function AnnoncesPage() {
  const [annonces, setAnnonces] = useState<Annonce[]>([])
  const [loading, setLoading] = useState(true)
  const [filterLigue, setFilterLigue] = useState('')
  const [filterZone, setFilterZone] = useState('')
  const [filterPos, setFilterPos] = useState('')
  const [filterType, setFilterType] = useState('')
  const [query, setQuery] = useState('')
  const [postulerModal, setPostulerModal] = useState<Annonce | null>(null)
  const router = useRouter()
  const { profile: currentUser } = useAuth()

  useEffect(() => {
    supabase.from('annonces').select('*').eq('status', 'active').order('created_at', { ascending: false })
      .then(({ data }) => { setAnnonces(data || []); setLoading(false) })
  }, [])

  const filtered = useMemo(() => {
    return annonces.filter((a) => {
      if (filterLigue && a.ligue !== filterLigue) return false
      if (filterZone && a.zone !== filterZone) return false
      if (filterPos && a.position !== filterPos) return false
      if (filterType && a.author_type !== filterType) return false
      if (query) {
        const q = query.toLowerCase()
        if (!a.title.toLowerCase().includes(q) && !a.body.toLowerCase().includes(q) && !a.author_name.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [annonces, filterLigue, filterZone, filterPos, filterType, query])

  return (
    <>
      {/* HEADER */}
      <div style={{ background: 'linear-gradient(135deg, var(--blue-dark), var(--blue-mid))', padding: '2.5rem 1.5rem 1.5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div className="section-label" style={{ color: 'rgba(255,255,255,.6)' }}>Fil d'annonces</div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', color: '#fff', letterSpacing: 2, marginBottom: '.25rem' }}>
            Offres & <span style={{ color: 'var(--red-light)' }}>Recherches</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,.65)', fontSize: 14, marginBottom: '1.25rem' }}>
            Clubs, coachs et joueurs publient leurs besoins en temps réel
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Chercher une annonce, un club, une position…"
              style={{ flex: 1, background: 'rgba(255,255,255,.95)', border: 'none', borderRadius: 10, padding: '11px 16px', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
            />
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '.85rem 1.5rem', display: 'flex', gap: '.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={selectStyle}>
          <option value="">Tous les types</option>
          <option value="club">🏟️ Clubs</option>
          <option value="coach">🧑‍🏫 Coachs</option>
          <option value="player">👤 Joueurs</option>
        </select>
        <select value={filterLigue} onChange={(e) => setFilterLigue(e.target.value)} style={selectStyle}>
          <option value="">Toutes les ligues</option>
          {ligues.flatMap((g) => g.items).map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <select value={filterPos} onChange={(e) => setFilterPos(e.target.value)} style={selectStyle}>
          <option value="">Toutes positions</option>
          {positions.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filterZone} onChange={(e) => setFilterZone(e.target.value)} style={selectStyle}>
          <option value="">Toute la zone</option>
          {zones.map((z) => <option key={z} value={z}>{z}</option>)}
        </select>
        {(filterLigue || filterZone || filterPos || filterType) && (
          <button onClick={() => { setFilterLigue(''); setFilterZone(''); setFilterPos(''); setFilterType('') }}
            style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            ✕ Réinitialiser
          </button>
        )}
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>
          {loading ? 'Chargement…' : `${filtered.length} annonce${filtered.length !== 1 ? 's' : ''}`}
        </span>
        {currentUser?.role !== 'player' && (
          <Link href="/dashboard" className="btn btn-red btn-sm">+ Publier une annonce</Link>
        )}
      </div>

      {/* LIST */}
      <div className="wrap">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <div style={{ width: 40, height: 40, border: '4px solid var(--gray-light)', borderTopColor: 'var(--blue-bright)', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 1rem' }} />
            Chargement des annonces…
            <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', border: '2px dashed var(--border)', borderRadius: 16, marginTop: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚽</div>
            {annonces.length === 0
              ? <><div style={{ fontSize: 16, fontWeight: 600, marginBottom: '.5rem' }}>Aucune annonce publiée</div><div>Sois le premier à publier !</div></>
              : <div>Aucune annonce correspond à tes critères. Modifie les filtres.</div>
            }
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
            {filtered.map((a) => (
              <AnnonceCard
                key={a.id}
                annonce={a}
                currentUser={currentUser}
                onPostuler={() => {
                  if (!currentUser) { router.push('/login'); return }
                  setPostulerModal(a)
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* POSTULER MODAL */}
      {postulerModal && (
        <PostulerModal
          annonce={postulerModal}
          currentUser={currentUser!}
          onClose={() => setPostulerModal(null)}
          onSuccess={() => {
            setPostulerModal(null)
          }}
        />
      )}
    </>
  )
}

const selectStyle: React.CSSProperties = {
  background: 'var(--gray-bg)',
  border: '1.5px solid var(--border)',
  borderRadius: 100,
  padding: '6px 14px',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  outline: 'none',
  fontFamily: 'inherit'
}

function AnnonceCard({ annonce, currentUser, onPostuler }: { annonce: Annonce; currentUser: Profile | null; onPostuler: () => void }) {
  const typeEmoji = annonce.author_type === 'club' ? '🏟️' : annonce.author_type === 'coach' ? '🧑‍🏫' : '👤'
  const bgType = annonce.author_type === 'club' ? 'var(--green-bg)' : annonce.author_type === 'coach' ? '#fde8e8' : 'var(--blue-light)'
  const dateStr = new Date(annonce.created_at).toLocaleDateString('fr-CH', { day: 'numeric', month: 'short', year: 'numeric' })
  const canApply = currentUser && currentUser.role !== 'club'

  return (
    <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 4, bottom: 0, background: annonce.author_type === 'club' ? 'var(--green)' : annonce.author_type === 'coach' ? 'var(--red)' : 'var(--blue-bright)' }} />
      <div style={{ paddingLeft: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: bgType, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
            {typeEmoji}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>{annonce.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {annonce.author_name} · {dateStr}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {annonce.ligue && <span className="badge badge-blue">{annonce.ligue}</span>}
            {annonce.position && <span className="badge badge-amber">{annonce.position}</span>}
            {annonce.zone && <span className="badge badge-green">{annonce.zone}</span>}
          </div>
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--text-muted)', marginBottom: 14 }}>{annonce.body}</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {canApply ? (
            <button onClick={onPostuler} className="btn btn-red btn-sm">📋 Postuler</button>
          ) : !currentUser ? (
            <Link href="/login" className="btn btn-red btn-sm">📋 Postuler</Link>
          ) : null}
          <Link href="/messages" className="btn btn-ghost btn-sm">💬 Message</Link>
        </div>
      </div>
    </div>
  )
}

function PostulerModal({ annonce, currentUser, onClose, onSuccess }: { annonce: Annonce; currentUser: Profile; onClose: () => void; onSuccess: () => void }) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!message.trim()) { setError('Merci d\'écrire un message de motivation.'); return }
    setSending(true)
    setError('')
    const applicantName = currentUser.role === 'club'
      ? currentUser.club_name
      : `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || currentUser.email

    const { error: err } = await supabase.from('applications').insert({
      annonce_id: annonce.id,
      applicant_id: currentUser.id,
      applicant_name: applicantName,
      message: message.trim(),
      status: 'pending'
    })

    setSending(false)
    if (err) { setError('Erreur lors de la candidature. Réessaie.'); return }
    setDone(true)
    setTimeout(onSuccess, 2000)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '2rem', maxWidth: 500, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,.3)' }} onClick={(e) => e.stopPropagation()}>
        {done ? (
          <div style={{ textAlign: 'center', padding: '1.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', marginBottom: '.5rem' }}>Candidature envoyée !</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Tu peux suivre l'état dans <strong>Mes candidatures</strong>.</div>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', letterSpacing: 1, marginBottom: '.25rem' }}>
              📋 Postuler à cette annonce
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              {annonce.title} — {annonce.author_name}
            </div>
            <div className="field">
              <label className="field-label">Message de motivation</label>
              <textarea
                className="input"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Présente-toi brièvement, explique pourquoi tu es intéressé(e) et ce que tu peux apporter…"
              />
            </div>
            {error && <div style={{ color: 'var(--red)', fontSize: 13, marginBottom: '.75rem' }}>{error}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleSubmit} disabled={sending} className="btn btn-red" style={{ flex: 1, opacity: sending ? .7 : 1 }}>
                {sending ? '⏳ Envoi…' : '📤 Envoyer la candidature'}
              </button>
              <button onClick={onClose} className="btn btn-ghost">Annuler</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
