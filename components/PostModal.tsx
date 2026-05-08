'use client'

import { useState } from 'react'
import { supabase, Profile, Annonce } from '../lib/supabase'
import { liguesHomme, liguesFemme } from '../lib/data'

const ALL_LIGUE_GROUPS = [...liguesHomme, ...liguesFemme]
const ZONES  = ['Fribourg-Ville','Gruyère','Broye','Glâne','Sensebezirk','Veveyse','Lac']

interface Props {
  profile: Profile
  annonce?: Annonce        // if provided → edit mode
  onClose: () => void
  onSuccess: (a: Annonce) => void
}

export default function PostModal({ profile, annonce, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState(annonce?.title || '')
  const [body, setBody] = useState(annonce?.body || '')
  const [ligue, setLigue] = useState(annonce?.ligue || profile.ligue || '')
  const [zone, setZone] = useState(annonce?.zone || profile.zone || '')
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState('')

  const editing = !!annonce

  const authorName = profile.role === 'club'
    ? (profile.club_name || profile.email)
    : `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email

  async function handlePublish() {
    if (!title.trim()) { setError('Le titre est requis.'); return }
    if (!body.trim()) { setError('Le texte est requis.'); return }
    setPublishing(true)
    setError('')

    if (editing) {
      const { data, error: err } = await supabase
        .from('annonces')
        .update({ title: title.trim(), body: body.trim(), ligue: ligue || null, zone: zone || null })
        .eq('id', annonce!.id)
        .select()
        .single()
      setPublishing(false)
      if (err) { setError('Erreur lors de la modification.'); return }
      onSuccess(data)
    } else {
      const { data, error: err } = await supabase.from('annonces').insert({
        author_id: profile.id,
        author_name: authorName,
        author_type: profile.role,
        title: title.trim(),
        body: body.trim(),
        ligue: ligue || null,
        position: profile.position || null,
        zone: zone || profile.zone || '',
        status: 'active',
      }).select().single()
      setPublishing(false)
      if (err) { setError('Erreur lors de la publication. Réessaie.'); return }
      onSuccess(data)
    }
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
          <div style={{ width:44, height:44, borderRadius:'50%', overflow:'hidden', background:'linear-gradient(135deg,#e63946,#0a1f5c)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              : (profile.role === 'club' ? '🏟️' : profile.role === 'coach' ? '🎽' : '⚽')
            }
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:15 }}>{authorName}</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,.4)' }}>
              {profile.role === 'player' ? 'Joueur' : profile.role === 'coach' ? 'Coach' : 'Club'}
              {profile.zone ? ` · ${profile.zone}` : ''}
            </div>
          </div>
          <div style={{ marginLeft:'auto', fontSize:13, color:'rgba(255,255,255,.4)' }}>
            {editing ? '✏️ Modifier' : '📢 Nouveau post'}
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom:'0.75rem' }}>
          <label style={lblSt}>Titre</label>
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Ex: Je cherche un club pour la saison prochaine"
            style={inpSt}
          />
        </div>

        {/* Body */}
        <div style={{ marginBottom:'1rem' }}>
          <label style={lblSt}>Message</label>
          <textarea
            rows={4}
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Décris ta situation, tes attentes, ta disponibilité…"
            style={{ ...inpSt, resize:'vertical' }}
          />
        </div>

        {/* Optional fields */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'1rem' }}>
          <div>
            <label style={lblSt}>Ligue (optionnel)</label>
            <select style={inpSt} value={ligue} onChange={e => setLigue(e.target.value)}>
              <option value="" style={optSt}>—</option>
              {ALL_LIGUE_GROUPS.map(g => (
                <optgroup key={g.group} label={g.group} style={{ background: '#061540' }}>
                  {g.items.map(l => <option key={l} value={l} style={optSt}>{l}</option>)}
                </optgroup>
              ))}
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
            disabled={publishing || !title.trim() || !body.trim()}
            style={{ flex:1, background:'#e63946', color:'#fff', border:'none', borderRadius:9, padding:'12px', fontSize:14, fontWeight:700, cursor: publishing || !title.trim() || !body.trim() ? 'not-allowed' : 'pointer', opacity: publishing || !title.trim() || !body.trim() ? 0.6 : 1, fontFamily:'inherit' }}
          >
            {publishing ? '⏳ En cours…' : editing ? '💾 Enregistrer' : '📢 Publier'}
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
