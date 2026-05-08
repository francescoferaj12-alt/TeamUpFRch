'use client'

import { useState } from 'react'
import { supabase, Profile } from '../lib/supabase'

const LIGUES = ['2ème Ligue','3ème Ligue','4ème Ligue','5ème Ligue','Junior A','Junior B','Junior C']
const ZONES  = ['Fribourg-Ville','Gruyère','Broye','Glâne','Sensebezirk','Veveyse','Lac']

interface Props {
  profile: Profile
  onClose: () => void
  onSuccess: () => void
}

export default function PostModal({ profile, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [ligue, setLigue] = useState(profile.ligue || '')
  const [zone, setZone] = useState(profile.zone || '')
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState('')

  const authorName = profile.role === 'club'
    ? (profile.club_name || profile.email)
    : `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email

  async function handlePublish() {
    if (!body.trim()) { setError('Écris quelque chose avant de publier.'); return }
    setPublishing(true)
    setError('')
    const { error: err } = await supabase.from('annonces').insert({
      author_id: profile.id,
      author_name: authorName,
      author_type: profile.role,
      title: title.trim() || body.trim().slice(0, 60),
      body: body.trim(),
      ligue: ligue || null,
      position: profile.position || null,
      zone: zone || profile.zone || '',
      status: 'active',
    })
    setPublishing(false)
    if (err) { setError('Erreur lors de la publication. Réessaie.'); return }
    onSuccess()
  }

  const inpSt: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,.07)',
    border: '1.5px solid rgba(255,255,255,.12)', color: '#fff',
    borderRadius: 9, padding: '10px 14px', fontSize: 14,
    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  }
  const lblSt: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 600,
    color: 'rgba(255,255,255,.55)', marginBottom: 6,
  }
  const optSt = { background: '#061540' }

  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.8)', backdropFilter:'blur(8px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}
      onClick={onClose}
    >
      <div
        style={{ background:'#061540', border:'1px solid rgba(255,255,255,.1)', borderRadius:20, padding:'1.75rem', maxWidth:520, width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,.6)', color:'#fff' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:'1.25rem' }}>
          <div style={{ width:44, height:44, borderRadius:12, background:'linear-gradient(135deg,#e63946,#0a1f5c)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
            {profile.role === 'club' ? '🏟️' : profile.role === 'coach' ? '🎽' : '⚽'}
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:15 }}>{authorName}</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,.4)' }}>
              {profile.role === 'player' ? 'Joueur' : profile.role === 'coach' ? 'Coach' : 'Club'}
              {profile.zone ? ` · ${profile.zone}` : ''}
            </div>
          </div>
        </div>

        {/* Body — main text */}
        <div style={{ marginBottom:'1rem' }}>
          <textarea
            autoFocus
            rows={5}
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Quoi de neuf ? Partage ta recherche, ton annonce, ton message…&#10;&#10;Ex : « Je cherche un club pour la saison prochaine, disponible dès juin. »"
            style={{ ...inpSt, resize:'vertical' }}
          />
        </div>

        {/* Optional fields — collapsed into a row */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'1rem' }}>
          <div>
            <label style={lblSt}>Ligue (optionnel)</label>
            <select style={inpSt} value={ligue} onChange={e => setLigue(e.target.value)}>
              <option value="" style={optSt}>—</option>
              {LIGUES.map(l => <option key={l} value={l} style={optSt}>{l}</option>)}
            </select>
          </div>
          <div>
            <label style={lblSt}>Zone (optionnel)</label>
            <select style={inpSt} value={zone} onChange={e => setZone(e.target.value)}>
              <option value="" style={optSt}>—</option>
              {ZONES.map(z => <option key={z} value={z} style={optSt}>{z}</option>)}
            </select>
          </div>
        </div>

        {error && (
          <div style={{ background:'rgba(230,57,70,.12)', border:'1px solid rgba(230,57,70,.3)', borderRadius:9, padding:'9px 14px', fontSize:13, color:'#ff6b6b', marginBottom:'1rem' }}>
            {error}
          </div>
        )}

        <div style={{ display:'flex', gap:8 }}>
          <button
            onClick={handlePublish}
            disabled={publishing || !body.trim()}
            style={{ flex:1, background:'#e63946', color:'#fff', border:'none', borderRadius:9, padding:'12px', fontSize:14, fontWeight:700, cursor: publishing || !body.trim() ? 'not-allowed' : 'pointer', opacity: publishing || !body.trim() ? 0.6 : 1, fontFamily:'inherit' }}
          >
            {publishing ? '⏳ Publication…' : '📢 Publier'}
          </button>
          <button
            onClick={onClose}
            style={{ background:'rgba(255,255,255,.07)', color:'rgba(255,255,255,.7)', border:'1px solid rgba(255,255,255,.1)', borderRadius:9, padding:'12px 20px', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}
