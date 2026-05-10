'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, Annonce, Profile, avatarSrc } from '../../lib/supabase'
import { ligues, zones, positions } from '../../lib/data'
import { useAuth } from '../../lib/auth-context'
import VerifiedBadge from '../../components/VerifiedBadge'

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
    supabase.from('annonces')
      .select('*, profiles!author_id(id, avatar_url, verified, hidden)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const visible = (data || []).filter((a: any) => !a.profiles?.hidden)
        setAnnonces(visible as Annonce[])
        setLoading(false)
      })
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

  const optSt = { background:'#061540' }

  return (
    <div style={{ background:'#030a24', minHeight:'100vh', color:'#fff' }}>
      <style>{`
        .ann-card:hover { border-color:rgba(230,57,70,.4) !important; background:rgba(255,255,255,.06) !important; }
        .ann-card { transition:border-color .2s,background .2s; }
        @keyframes spin{to{transform:rotate(360deg);}}
      `}</style>

      {/* HEADER */}
      <div style={{ background:'linear-gradient(180deg,#030a24 0%,#061540 100%)', padding:'2.5rem 1.5rem 1.5rem' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, color:'rgba(255,255,255,.4)', textTransform:'uppercase', marginBottom:'.5rem' }}>Fil d'annonces</div>
          <h1 style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'2.5rem', color:'#fff', letterSpacing:2, marginBottom:'.25rem' }}>
            Offres & <span style={{ color:'#e63946' }}>Recherches</span>
          </h1>
          <p style={{ color:'rgba(255,255,255,.5)', fontSize:14, marginBottom:'1.25rem' }}>
            Clubs, coachs et joueurs publient leurs besoins en temps réel
          </p>
          <div style={{ display:'flex', gap:8 }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Chercher une annonce, un club, une position…"
              style={{ flex:1, background:'rgba(255,255,255,.07)', border:'1.5px solid rgba(255,255,255,.12)', color:'#fff', borderRadius:10, padding:'11px 16px', fontSize:14, outline:'none', fontFamily:'inherit' }}
            />
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div style={{ background:'#061540', borderBottom:'1px solid rgba(255,255,255,.06)', padding:'.85rem 1.5rem', display:'flex', gap:'.75rem', flexWrap:'wrap', alignItems:'center' }}>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={selectStyle}>
          <option value="" style={optSt}>Tous les types</option>
          <option value="club" style={optSt}>🏟️ Clubs</option>
          <option value="coach" style={optSt}>🧑‍🏫 Coachs</option>
          <option value="player" style={optSt}>👤 Joueurs</option>
        </select>
        <select value={filterLigue} onChange={(e) => setFilterLigue(e.target.value)} style={selectStyle}>
          <option value="" style={optSt}>Toutes les ligues</option>
          {ligues.flatMap((g) => g.items).map((l) => <option key={l} value={l} style={optSt}>{l}</option>)}
        </select>
        <select value={filterPos} onChange={(e) => setFilterPos(e.target.value)} style={selectStyle}>
          <option value="" style={optSt}>Toutes positions</option>
          {positions.map((p) => <option key={p} value={p} style={optSt}>{p}</option>)}
        </select>
        <select value={filterZone} onChange={(e) => setFilterZone(e.target.value)} style={selectStyle}>
          <option value="" style={optSt}>Toute la zone</option>
          {zones.map((z) => <option key={z} value={z} style={optSt}>{z}</option>)}
        </select>
        {(filterLigue || filterZone || filterPos || filterType) && (
          <button onClick={() => { setFilterLigue(''); setFilterZone(''); setFilterPos(''); setFilterType('') }}
            style={{ background:'none', border:'none', color:'#e63946', fontSize:12, fontWeight:600, cursor:'pointer' }}>
            ✕ Réinitialiser
          </button>
        )}
        <span style={{ marginLeft:'auto', fontSize:13, color:'rgba(255,255,255,.4)' }}>
          {loading ? 'Chargement…' : `${filtered.length} annonce${filtered.length !== 1 ? 's' : ''}`}
        </span>
        {currentUser && (
          <Link href="/profil" style={{ background:'#e63946', color:'#fff', padding:'6px 14px', borderRadius:8, fontWeight:700, textDecoration:'none', fontSize:13 }}>+ Publier un post</Link>
        )}
        {!currentUser && (
          <Link href="/login" style={{ background:'#e63946', color:'#fff', padding:'6px 14px', borderRadius:8, fontWeight:700, textDecoration:'none', fontSize:13 }}>+ Publier un post</Link>
        )}
      </div>

      {/* LIST */}
      <div style={{ maxWidth:900, margin:'0 auto', padding:'1.5rem' }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:'4rem', color:'rgba(255,255,255,.4)' }}>
            <div style={{ width:40, height:40, border:'4px solid rgba(255,255,255,.1)', borderTopColor:'#e63946', borderRadius:'50%', animation:'spin .8s linear infinite', margin:'0 auto 1rem' }} />
            Chargement des annonces…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'4rem', color:'rgba(255,255,255,.4)', border:'2px dashed rgba(255,255,255,.1)', borderRadius:16, marginTop:'1.5rem' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'1rem' }}>⚽</div>
            {annonces.length === 0
              ? <><div style={{ fontSize:16, fontWeight:600, marginBottom:'.5rem', color:'#fff' }}>Aucune annonce publiée</div><div>Sois le premier à publier !</div></>
              : <div>Aucune annonce correspond à tes critères. Modifie les filtres.</div>
            }
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem', marginTop:'1.5rem' }}>
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
    </div>
  )
}

const selectStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,.07)',
  border: '1.5px solid rgba(255,255,255,.12)',
  color: '#fff',
  borderRadius: 100,
  padding: '6px 14px',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  outline: 'none',
  fontFamily: 'inherit'
}

function AnnonceCard({ annonce, currentUser, onPostuler }: { annonce: Annonce & { profiles?: { id: string; avatar_url?: string; verified?: boolean } }; currentUser: Profile | null; onPostuler: () => void }) {
  const typeEmoji = annonce.author_type === 'club' ? '🏟️' : annonce.author_type === 'coach' ? '🎽' : '⚽'
  const bgType = annonce.author_type === 'club' ? 'rgba(13,122,54,.2)' : annonce.author_type === 'coach' ? 'rgba(230,57,70,.15)' : 'rgba(26,111,212,.2)'
  const stripeColor = annonce.author_type === 'club' ? '#4cdb7a' : annonce.author_type === 'coach' ? '#e63946' : '#5b9eff'
  const dateStr = new Date(annonce.created_at).toLocaleDateString('fr-CH', { day: 'numeric', month: 'short', year: 'numeric' })
  const canApply = currentUser && currentUser.role !== 'club'
  const avatarUrl = annonce.profiles?.avatar_url
  const authorId = annonce.profiles?.id || annonce.author_id
  const initials = annonce.author_name.slice(0, 2).toUpperCase()

  return (
    <div className="ann-card" style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:16, padding:'1.5rem', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:0, left:0, width:4, bottom:0, background:stripeColor }} />
      <div style={{ paddingLeft:'1rem' }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:12, flexWrap:'wrap' }}>
          {/* Avatar */}
          <Link href={`/profil/${authorId}`} style={{ textDecoration:'none', flexShrink:0 }}>
            <div style={{ width:46, height:46, borderRadius:'50%', background:bgType, border:'2px solid rgba(255,255,255,.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize: avatarUrl ? 0 : 16, fontWeight:700, color:'#fff', overflow:'hidden', cursor:'pointer' }}>
              {avatarUrl
                ? <img src={avatarSrc(avatarUrl)!} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
                : (initials || typeEmoji)
              }
            </div>
          </Link>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontWeight:700, fontSize:16, marginBottom:2, color:'#fff' }}>{annonce.title}</div>
            <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
              <span style={{ fontSize:13, color:'rgba(255,255,255,.45)', display:'inline-flex', alignItems:'center' }}>
                {annonce.author_name}
                {annonce.profiles?.verified && <VerifiedBadge size={15} />}
                {' · '}{dateStr}
              </span>
              <Link href={`/profil/${authorId}`} style={{ fontSize:12, color:'#3a8cff', fontWeight:600, textDecoration:'none', background:'rgba(58,140,255,.1)', padding:'2px 9px', borderRadius:100 }}>
                Voir le profil →
              </Link>
            </div>
          </div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {annonce.ligue && <span style={{ background:'rgba(255,255,255,.08)', color:'rgba(255,255,255,.7)', borderRadius:100, padding:'2px 9px', fontSize:11, fontWeight:600 }}>{annonce.ligue}</span>}
            {annonce.position && <span style={{ background:'rgba(230,57,70,.12)', color:'#e67a80', borderRadius:100, padding:'2px 9px', fontSize:11, fontWeight:600 }}>{annonce.position}</span>}
            {annonce.zone && <span style={{ background:'rgba(76,219,122,.1)', color:'#4cdb7a', borderRadius:100, padding:'2px 9px', fontSize:11, fontWeight:600 }}>{annonce.zone}</span>}
          </div>
        </div>
        <p style={{ fontSize:14, lineHeight:1.65, color:'rgba(255,255,255,.55)', marginBottom:14 }}>{annonce.body}</p>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {canApply ? (
            <button onClick={onPostuler} style={{ background:'#e63946', color:'#fff', border:'none', borderRadius:8, padding:'7px 16px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>📋 Postuler</button>
          ) : !currentUser ? (
            <Link href="/login" style={{ background:'#e63946', color:'#fff', borderRadius:8, padding:'7px 16px', fontSize:13, fontWeight:700, textDecoration:'none' }}>📋 Postuler</Link>
          ) : null}
          {(!currentUser || currentUser.id !== annonce.author_id) && (
            <Link href={`/messages?partner=${annonce.author_id}`} style={{ background:'rgba(255,255,255,.07)', color:'rgba(255,255,255,.7)', border:'1px solid rgba(255,255,255,.1)', borderRadius:8, padding:'7px 16px', fontSize:13, fontWeight:700, textDecoration:'none' }}>💬 Message</Link>
          )}
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
    // Fire-and-forget: notify annonce author
    ;(async () => {
      try {
        const { data: author } = await supabase
          .from('profiles')
          .select('email,first_name,last_name,club_name,role,zone,notification_settings')
          .eq('id', annonce.author_id).single()
        if (!author?.email) return
        if (author.notification_settings?.newApplication === false) return
        const toName = author.role === 'club'
          ? (author.club_name || 'Club')
          : `${author.first_name || ''} ${author.last_name || ''}`.trim() || author.email
        await fetch('/api/send-application-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toEmail: author.email,
            toName,
            applicantName,
            applicantRole: currentUser.role,
            annonceTitle: annonce.title,
            applicantId: currentUser.id,
            annonceId: annonce.id,
            receiverZone: author.zone,
          }),
        })
      } catch {}
    })()
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.75)', backdropFilter:'blur(8px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }} onClick={onClose}>
      <div style={{ background:'#061540', border:'1px solid rgba(255,255,255,.1)', borderRadius:20, padding:'2rem', maxWidth:500, width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,.5)', color:'#fff' }} onClick={(e) => e.stopPropagation()}>
        {done ? (
          <div style={{ textAlign:'center', padding:'1.5rem' }}>
            <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>✅</div>
            <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.5rem', marginBottom:'.5rem' }}>Candidature envoyée !</div>
            <div style={{ color:'rgba(255,255,255,.5)', fontSize:14 }}>Tu peux suivre l'état dans <strong style={{ color:'#fff' }}>Mes candidatures</strong>.</div>
          </div>
        ) : (
          <>
            <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.4rem', letterSpacing:1, marginBottom:'.25rem' }}>
              📋 Postuler à cette annonce
            </div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,.45)', marginBottom:'1.25rem' }}>
              {annonce.title} — {annonce.author_name}
            </div>
            <div style={{ marginBottom:'1rem' }}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'rgba(255,255,255,.6)', marginBottom:6 }}>Message de motivation</label>
              <textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Présente-toi brièvement, explique pourquoi tu es intéressé(e) et ce que tu peux apporter…"
                style={{ width:'100%', background:'rgba(255,255,255,.07)', border:'1.5px solid rgba(255,255,255,.12)', color:'#fff', borderRadius:9, padding:'10px 14px', fontSize:14, outline:'none', fontFamily:'inherit', resize:'vertical', boxSizing:'border-box' }}
              />
            </div>
            {error && <div style={{ color:'#ff6b6b', fontSize:13, marginBottom:'.75rem' }}>{error}</div>}
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={handleSubmit} disabled={sending} style={{ flex:1, background:'#e63946', color:'#fff', border:'none', borderRadius:9, padding:'11px', fontSize:14, fontWeight:700, cursor:'pointer', opacity:sending?.7:1, fontFamily:'inherit' }}>
                {sending ? '⏳ Envoi…' : '📤 Envoyer la candidature'}
              </button>
              <button onClick={onClose} style={{ background:'rgba(255,255,255,.07)', color:'rgba(255,255,255,.7)', border:'1px solid rgba(255,255,255,.1)', borderRadius:9, padding:'11px 18px', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Annuler</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
