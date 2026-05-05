'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, Profile } from '../../lib/supabase'

const POSITIONS = ['Attaquant','Milieu offensif','Milieu défensif','Défenseur central','Défenseur latéral','Gardien']
const LIGUES = ['2ème Ligue','3ème Ligue','4ème Ligue','5ème Ligue','Junior A','Junior B','Junior C']
const ZONES = ['Fribourg-Ville','Gruyère','Broye','Glâne','Sensebezirk','Veveyse','Lac']

export default function ProfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const router = useRouter()

  // Editable fields
  const [bio, setBio] = useState('')
  const [position, setPosition] = useState('')
  const [ligue, setLigue] = useState('')
  const [zone, setZone] = useState('')
  const [foot, setFoot] = useState('')
  const [age, setAge] = useState('')
  const [available, setAvailable] = useState(true)

  useEffect(() => {
    async function load() {
      // Check session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      // Load profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (error || !data) { router.push('/login'); return }

      setProfile(data)
      setBio(data.bio || '')
      setPosition(data.position || '')
      setLigue(data.ligue || '')
      setZone(data.zone || '')
      setFoot(data.foot || 'Droit')
      setAge(data.age ? String(data.age) : '')
      setAvailable(data.available ?? true)
      setLoading(false)
    }
    load()
  }, [router])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  async function handleSave() {
    if (!profile) return
    setSaving(true)
    const { error } = await supabase.from('profiles').update({
      bio, position, ligue, zone, foot,
      age: age ? parseInt(age) : null,
      available
    }).eq('id', profile.id)

    if (!error) {
      setProfile({ ...profile, bio, position, ligue, zone, foot, age: age ? parseInt(age) : undefined, available })
      setSaveMsg('✅ Profil mis à jour !')
      setEditing(false)
      setTimeout(() => setSaveMsg(''), 3000)
    }
    setSaving(false)
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', flexDirection:'column', gap:'1rem' }}>
      <div style={{ width:40, height:40, border:'4px solid var(--gray-light)', borderTopColor:'var(--blue-bright)', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
      <div style={{ color:'var(--text-muted)', fontSize:14 }}>Chargement du profil…</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  if (!profile) return null

  const initials = `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase()
  const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
  const roleEmoji = profile.role === 'player' ? '⚽' : profile.role === 'coach' ? '🧑‍🏫' : '🏟️'
  const roleLabel = profile.role === 'player' ? 'Joueur' : profile.role === 'coach' ? 'Coach' : 'Club'

  return (
    <div className="wrap">

      {saveMsg && (
        <div style={{ background:'var(--green-bg)', border:'1px solid var(--green)', borderRadius:10, padding:'10px 16px', fontSize:14, color:'var(--green)', marginBottom:'1rem' }}>
          {saveMsg}
        </div>
      )}

      {/* HERO */}
      <div style={{ background:'linear-gradient(135deg, var(--blue-dark), var(--blue-mid))', borderRadius:20, padding:'2rem', marginBottom:'1.25rem', position:'relative', overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'flex-end', gap:'1.5rem', flexWrap:'wrap', position:'relative' }}>

          {/* AVATAR */}
          <div style={{ width:90, height:90, borderRadius:16, background:'linear-gradient(135deg,#3a8cff,#1a5fb4)', border:'3px solid rgba(255,255,255,.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:profile.avatar_url ? 0 : '2rem', fontWeight:700, color:'#fff', flexShrink:0, overflow:'hidden' }}>
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              : (initials || roleEmoji)
            }
          </div>

          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'2.2rem', color:'#fff', letterSpacing:1, lineHeight:1, marginBottom:4 }}>
              {fullName || profile.club_name || profile.email}
            </div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:'.75rem', alignItems:'center' }}>
              <span style={{ background:'rgba(255,255,255,.15)', padding:'3px 10px', borderRadius:100, fontSize:12, fontWeight:600, color:'rgba(255,255,255,.9)' }}>
                {roleEmoji} {profile.position || roleLabel}
              </span>
              {profile.foot && (
                <span style={{ background:'rgba(255,255,255,.15)', padding:'3px 10px', borderRadius:100, fontSize:12, fontWeight:600, color:'rgba(255,255,255,.9)' }}>
                  🦵 Pied {profile.foot.toLowerCase()}
                </span>
              )}
              {profile.age && (
                <span style={{ fontSize:13, color:'rgba(255,255,255,.6)' }}>{profile.age} ans · {profile.zone}</span>
              )}
            </div>
            <div style={{ display:'flex', gap:'.75rem', flexWrap:'wrap' }}>
              {profile.ligue && <span style={{ background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.2)', color:'rgba(255,255,255,.85)', fontSize:12, padding:'4px 12px', borderRadius:100 }}>🏆 {profile.ligue}</span>}
              <span style={{ background: profile.available ? 'rgba(13,122,54,.3)' : 'rgba(255,255,255,.1)', border:`1px solid ${profile.available ? 'rgba(13,122,54,.5)' : 'rgba(255,255,255,.2)'}`, color:'rgba(255,255,255,.95)', fontSize:12, padding:'4px 12px', borderRadius:100 }}>
                {profile.available ? '🟢 Disponible' : '⚪ Indisponible'}
              </span>
            </div>
          </div>

          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <button onClick={() => setEditing(!editing)} className="btn btn-red btn-sm">
              {editing ? '✕ Annuler' : '✏️ Modifier'}
            </button>
            <button onClick={handleLogout} className="btn btn-sm" style={{ background:'rgba(255,255,255,.15)', color:'#fff', border:'1px solid rgba(255,255,255,.3)' }}>
              🚪 Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* EDIT FORM */}
      {editing && (
        <div className="card" style={{ marginBottom:'1.25rem', border:'2px solid var(--blue-bright)' }}>
          <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.2rem', letterSpacing:1, marginBottom:'1rem' }}>
            ✏️ Modifier mon profil
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            {profile.role === 'player' && (
              <div className="field">
                <label className="field-label">Position</label>
                <select className="input" value={position} onChange={e => setPosition(e.target.value)}>
                  <option value="">—</option>
                  {POSITIONS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            )}
            {profile.role === 'player' && (
              <div className="field">
                <label className="field-label">Pied dominant</label>
                <select className="input" value={foot} onChange={e => setFoot(e.target.value)}>
                  <option>Droit</option><option>Gauche</option><option>Ambidextre</option>
                </select>
              </div>
            )}
            <div className="field">
              <label className="field-label">Ligue</label>
              <select className="input" value={ligue} onChange={e => setLigue(e.target.value)}>
                <option value="">—</option>
                {LIGUES.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="field-label">Zone</label>
              <select className="input" value={zone} onChange={e => setZone(e.target.value)}>
                <option value="">—</option>
                {ZONES.map(z => <option key={z}>{z}</option>)}
              </select>
            </div>
            {profile.role !== 'club' && (
              <div className="field">
                <label className="field-label">Âge</label>
                <input className="input" type="number" min="14" max="60" value={age} onChange={e => setAge(e.target.value)} />
              </div>
            )}
            <div className="field">
              <label className="field-label">Disponibilité</label>
              <select className="input" value={available ? 'oui' : 'non'} onChange={e => setAvailable(e.target.value === 'oui')}>
                <option value="oui">🟢 Disponible</option>
                <option value="non">⚪ Indisponible</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label className="field-label">Bio / Présentation</label>
            <textarea className="input" rows={3} value={bio} onChange={e => setBio(e.target.value)} placeholder="Présente-toi en quelques mots…" />
          </div>

          <button onClick={handleSave} disabled={saving} className="btn btn-blue" style={{ opacity: saving ? .7 : 1 }}>
            {saving ? '⏳ Sauvegarde…' : '💾 Sauvegarder les modifications'}
          </button>
        </div>
      )}

      {/* PROFILE GRID */}
      <div className="profile-grid">
        <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

          {/* BIO */}
          <div className="card">
            <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.2rem', letterSpacing:1, marginBottom:'1rem', paddingBottom:'.75rem', borderBottom:'1px solid var(--gray-light)' }}>
              📝 À propos
            </div>
            {profile.bio
              ? <p style={{ fontSize:14, color:'var(--text-muted)', lineHeight:1.7 }}>{profile.bio}</p>
              : <p style={{ fontSize:14, color:'var(--text-muted)', fontStyle:'italic' }}>
                  Aucune présentation. <button onClick={() => setEditing(true)} style={{ color:'var(--blue-bright)', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:14 }}>Ajoute-en une →</button>
                </p>
            }
          </div>

          {/* STATS */}
          <div className="card">
            <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.2rem', letterSpacing:1, marginBottom:'1rem', paddingBottom:'.75rem', borderBottom:'1px solid var(--gray-light)' }}>
              📊 Statistiques
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem' }}>
              {[
                { v: profile.goals ?? 0, k: 'Buts' },
                { v: profile.assists ?? 0, k: 'Assists' },
                { v: profile.matches ?? 0, k: 'Matchs' }
              ].map(s => (
                <div key={s.k} style={{ background:'var(--gray-bg)', borderRadius:12, padding:'1rem', textAlign:'center' }}>
                  <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'2rem', color:'var(--blue-mid)', lineHeight:1 }}>{s.v}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:1, marginTop:4 }}>{s.k}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:'.75rem', fontStyle:'italic' }}>
              Les stats seront mises à jour manuellement. Fonctionnalité complète bientôt.
            </p>
          </div>

          {/* HIGHLIGHTS */}
          <div className="card">
            <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.2rem', letterSpacing:1, marginBottom:'1rem', paddingBottom:'.75rem', borderBottom:'1px solid var(--gray-light)' }}>
              🎬 Highlights vidéo
            </div>
            <div style={{ background:'var(--gray-bg)', borderRadius:12, padding:'2rem', textAlign:'center', border:'2px dashed var(--gray-mid)' }}>
              <div style={{ fontSize:'2rem', marginBottom:'.5rem' }}>🎬</div>
              <div style={{ fontSize:14, color:'var(--text-muted)' }}>Upload de vidéos bientôt disponible</div>
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          <div className="card card-sm">
            {profile.available && (
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'var(--green-bg)', color:'var(--green)', fontSize:13, fontWeight:600, padding:'6px 14px', borderRadius:100, marginBottom:'1rem' }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:'var(--green)' }} />
                Disponible
              </div>
            )}
            <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.1rem', letterSpacing:1, marginBottom:'1rem' }}>ℹ️ Informations</div>
            {[
              ['Rôle', roleLabel],
              ['Email', profile.email],
              profile.age ? ['Âge', `${profile.age} ans`] : null,
              profile.foot ? ['Pied dominant', profile.foot] : null,
              profile.zone ? ['Zone', profile.zone] : null,
              profile.ligue ? ['Ligue', profile.ligue] : null,
              profile.position ? ['Position', profile.position] : null,
              profile.club_name ? ['Club', profile.club_name] : null,
            ].filter((item): item is [string, string] => Array.isArray(item)).map(([k, v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--gray-light)', fontSize:14 }}>
                <span style={{ color:'var(--text-muted)' }}>{k}</span>
                <span style={{ fontWeight:600, maxWidth:'60%', textAlign:'right', wordBreak:'break-all' }}>{v}</span>
              </div>
            ))}
          </div>

          <div className="card card-sm">
            <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.1rem', letterSpacing:1, marginBottom:'1rem' }}>🚀 Actions rapides</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <Link href="/recherche" className="btn btn-blue btn-sm btn-full" style={{ justifyContent:'center' }}>🔍 Rechercher des clubs</Link>
              <Link href="/messages" className="btn btn-ghost btn-sm btn-full" style={{ justifyContent:'center' }}>💬 Mes messages</Link>
              <Link href="/candidatures" className="btn btn-ghost btn-sm btn-full" style={{ justifyContent:'center' }}>📋 Mes candidatures</Link>
            </div>
          </div>

          <div className="card card-sm" style={{ background:'var(--blue-light)', border:'1px solid var(--blue-bright)' }}>
            <div style={{ fontSize:13, color:'var(--blue-mid)', fontWeight:600, marginBottom:'.5rem' }}>💡 Conseil</div>
            <div style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.6 }}>
              Un profil complet reçoit <strong>3x plus de contacts</strong>. Ajoute ta bio et ta disponibilité pour être visible !
            </div>
            <button onClick={() => setEditing(true)} className="btn btn-blue btn-sm" style={{ marginTop:'.75rem', width:'100%', justifyContent:'center' }}>
              Compléter mon profil →
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 1.25rem;
        }
        @media (max-width: 720px) {
          .profile-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}
