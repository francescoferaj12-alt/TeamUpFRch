'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, Profile } from '../../lib/supabase'

const POSITIONS = ['Attaquant','Milieu offensif','Milieu défensif','Défenseur central','Défenseur latéral','Gardien']
const LIGUES = ['2ème Ligue','3ème Ligue','4ème Ligue','5ème Ligue','Junior A','Junior B','Junior C']
const ZONES = ['Fribourg-Ville','Gruyère','Broye','Glâne','Sensebezirk','Veveyse','Lac']
const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

function calcAge(birthdate?: string): number | null {
  if (!birthdate) return null
  const today = new Date()
  const birth = new Date(birthdate)
  let age = today.getFullYear() - birth.getFullYear()
  if (today.getMonth() - birth.getMonth() < 0 ||
      (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--
  return age
}

function parseBirthdate(birthdate?: string) {
  if (!birthdate) return { day: '', month: '', year: '' }
  const [y, m, d] = birthdate.split('-')
  return { day: String(parseInt(d)), month: String(parseInt(m)), year: y }
}

export default function ProfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const router = useRouter()

  const [bio, setBio] = useState('')
  const [position, setPosition] = useState('')
  const [ligue, setLigue] = useState('')
  const [zone, setZone] = useState('')
  const [foot, setFoot] = useState('')
  const [available, setAvailable] = useState(true)
  const [phone, setPhone] = useState('')
  const [career, setCareer] = useState('')
  const [birthDay, setBirthDay] = useState('')
  const [birthMonth, setBirthMonth] = useState('')
  const [birthYear, setBirthYear] = useState('')

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 55 }, (_, i) => currentYear - 14 - i)
  const days = Array.from({ length: 31 }, (_, i) => i + 1)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      let { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()

      // Auto-create profile row if missing (e.g., after Google OAuth signup)
      if (!data) {
        const meta = session.user.user_metadata || {}
        const newProfile = {
          id: session.user.id,
          email: session.user.email || '',
          role: (meta.role as string) || 'player',
          first_name: meta.first_name || meta.given_name || meta.full_name?.split(' ')[0] || '',
          last_name: meta.last_name || meta.family_name || meta.full_name?.split(' ').slice(1).join(' ') || '',
          available: true,
        }
        const { data: inserted } = await supabase.from('profiles').insert(newProfile).select().single()
        data = inserted
      }

      if (!data) { setLoading(false); return }

      setProfile(data)
      setBio(data.bio || '')
      setPosition(data.position || '')
      setLigue(data.ligue || '')
      setZone(data.zone || '')
      setFoot(data.foot || 'Droit')
      setAvailable(data.available ?? true)
      setPhone(data.phone || '')
      setCareer(data.career || '')
      const parsed = parseBirthdate(data.birthdate)
      setBirthDay(parsed.day)
      setBirthMonth(parsed.month)
      setBirthYear(parsed.year)
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
    const birthdate = birthDay && birthMonth && birthYear
      ? `${birthYear}-${birthMonth.padStart(2,'0')}-${birthDay.padStart(2,'0')}`
      : null
    const { error } = await supabase.from('profiles').update({
      bio, position, ligue, zone, foot,
      available,
      phone: phone || null,
      career: career || null,
      birthdate
    }).eq('id', profile.id)
    if (!error) {
      setProfile({ ...profile, bio, position, ligue, zone, foot, available, phone: phone || undefined, career: career || undefined, birthdate: birthdate || undefined })
      setSaveMsg('Profil mis à jour !')
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
  const roleEmoji = profile.role === 'player' ? '⚽' : profile.role === 'coach' ? '🎽' : '🏟️'
  const roleLabel = profile.role === 'player' ? 'Joueur' : profile.role === 'coach' ? 'Coach' : 'Club'
  const displayAge = calcAge(profile.birthdate)

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
                  Pied {profile.foot.toLowerCase()}
                </span>
              )}
              {displayAge && (
                <span style={{ fontSize:13, color:'rgba(255,255,255,.6)' }}>{displayAge} ans · {profile.zone}</span>
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
              {editing ? 'Annuler' : 'Modifier'}
            </button>
            <button onClick={handleLogout} className="btn btn-sm" style={{ background:'rgba(255,255,255,.15)', color:'#fff', border:'1px solid rgba(255,255,255,.3)' }}>
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* EDIT FORM */}
      {editing && (
        <div className="card" style={{ marginBottom:'1.25rem', border:'2px solid var(--blue-bright)' }}>
          <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.2rem', letterSpacing:1, marginBottom:'1rem' }}>
            Modifier mon profil
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
            <div className="field">
              <label className="field-label">Disponibilité</label>
              <select className="input" value={available ? 'oui' : 'non'} onChange={e => setAvailable(e.target.value === 'oui')}>
                <option value="oui">🟢 Disponible</option>
                <option value="non">⚪ Indisponible</option>
              </select>
            </div>
          </div>

          {profile.role !== 'club' && (
            <div className="field">
              <label className="field-label">Date de naissance</label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr 1fr', gap:8 }}>
                <select className="input" value={birthDay} onChange={e => setBirthDay(e.target.value)}>
                  <option value="">Jour</option>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select className="input" value={birthMonth} onChange={e => setBirthMonth(e.target.value)}>
                  <option value="">Mois</option>
                  {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
                <select className="input" value={birthYear} onChange={e => setBirthYear(e.target.value)}>
                  <option value="">Année</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          )}

          <div className="field">
            <label className="field-label">Téléphone (optionnel)</label>
            <input className="input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+41 79 000 00 00" />
          </div>

          <div className="field">
            <label className="field-label">Bio / Présentation</label>
            <textarea className="input" rows={3} value={bio} onChange={e => setBio(e.target.value)} placeholder="Présente-toi en quelques mots…" />
          </div>

          <div className="field">
            <label className="field-label">Parcours / Clubs précédents</label>
            <textarea className="input" rows={4} value={career} onChange={e => setCareer(e.target.value)} placeholder="2020-2022 · FC Bulle&#10;2022-2024 · FC Marly&#10;2024-présent · FC Fribourg" />
          </div>

          <button onClick={handleSave} disabled={saving} className="btn btn-blue" style={{ opacity: saving ? .7 : 1 }}>
            {saving ? 'Sauvegarde…' : 'Sauvegarder les modifications'}
          </button>
        </div>
      )}

      {/* PROFILE GRID */}
      <div className="profile-grid">
        <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

          {/* BIO */}
          <div className="card">
            <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.2rem', letterSpacing:1, marginBottom:'1rem', paddingBottom:'.75rem', borderBottom:'1px solid var(--gray-light)' }}>
              À propos
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
              Statistiques
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

          {/* CAREER HISTORY */}
          <div className="card">
            <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.2rem', letterSpacing:1, marginBottom:'1rem', paddingBottom:'.75rem', borderBottom:'1px solid var(--gray-light)' }}>
              Parcours
            </div>
            {profile.career ? (
              <div style={{ display:'flex', flexDirection:'column', gap:'.5rem' }}>
                {profile.career.split('\n').filter(Boolean).map((line, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'.5rem 0' }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--blue-bright)', flexShrink:0 }} />
                    <div style={{ fontSize:14, color:'var(--text-dark)' }}>{line}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize:14, color:'var(--text-muted)', fontStyle:'italic' }}>
                Aucun parcours renseigné. <button onClick={() => setEditing(true)} style={{ color:'var(--blue-bright)', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:14 }}>Ajouter mes clubs précédents →</button>
              </p>
            )}
          </div>

          {/* HIGHLIGHTS */}
          <div className="card">
            <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.2rem', letterSpacing:1, marginBottom:'1rem', paddingBottom:'.75rem', borderBottom:'1px solid var(--gray-light)' }}>
              Highlights vidéo
            </div>
            <div style={{ background:'var(--gray-bg)', borderRadius:12, padding:'2rem', textAlign:'center', border:'2px dashed var(--gray-mid)' }}>
              <div style={{ fontSize:14, color:'var(--text-muted)' }}>Upload de vidéos bientôt disponible (max 3 vidéos, 2 min, 100MB)</div>
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
            <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.1rem', letterSpacing:1, marginBottom:'1rem' }}>Informations</div>
            {[
              ['Rôle', roleLabel],
              ['Email', profile.email],
              displayAge ? ['Âge', `${displayAge} ans`] : null,
              profile.birthdate ? ['Naissance', new Date(profile.birthdate).toLocaleDateString('fr-CH', { day: 'numeric', month: 'long', year: 'numeric' })] : null,
              profile.foot ? ['Pied dominant', profile.foot] : null,
              profile.zone ? ['Zone', profile.zone] : null,
              profile.ligue ? ['Ligue', profile.ligue] : null,
              profile.position ? ['Position', profile.position] : null,
              profile.club_name ? ['Club', profile.club_name] : null,
              profile.phone ? ['Téléphone', profile.phone] : null,
            ].filter((item): item is [string, string] => Array.isArray(item)).map(([k, v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--gray-light)', fontSize:14 }}>
                <span style={{ color:'var(--text-muted)' }}>{k}</span>
                <span style={{ fontWeight:600, maxWidth:'60%', textAlign:'right', wordBreak:'break-all' }}>{v}</span>
              </div>
            ))}
          </div>

          <div className="card card-sm">
            <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.1rem', letterSpacing:1, marginBottom:'1rem' }}>Actions rapides</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <Link href="/recherche" className="btn btn-blue btn-sm btn-full" style={{ justifyContent:'center' }}>Rechercher des clubs</Link>
              <Link href="/messages" className="btn btn-ghost btn-sm btn-full" style={{ justifyContent:'center' }}>Mes messages</Link>
              <Link href="/candidatures" className="btn btn-ghost btn-sm btn-full" style={{ justifyContent:'center' }}>Mes candidatures</Link>
            </div>
          </div>

          <div className="card card-sm" style={{ background:'var(--blue-light)', border:'1px solid var(--blue-bright)' }}>
            <div style={{ fontSize:13, color:'var(--blue-mid)', fontWeight:600, marginBottom:'.5rem' }}>Conseil</div>
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
