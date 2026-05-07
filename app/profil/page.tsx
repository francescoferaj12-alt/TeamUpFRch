'use client'

import { useEffect, useState, useRef, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, Profile } from '../../lib/supabase'
import { useLang } from '../../lib/lang-context'
import { useAuth } from '../../lib/auth-context'
import { t, months, footDisplay, translateFoot, Lang } from '../../lib/translations'

const POSITIONS = ['Attaquant','Milieu offensif','Milieu défensif','Défenseur central','Défenseur latéral','Gardien']
const LIGUES = ['2ème Ligue','3ème Ligue','4ème Ligue','5ème Ligue','Junior A','Junior B','Junior C']
const ZONES = ['Fribourg-Ville','Gruyère','Broye','Glâne','Sensebezirk','Veveyse','Lac']

const STRENGTHS = [
  { key: 'fast',        fr: 'Rapide',             de: 'Schnell' },
  { key: 'technical',  fr: 'Technique',           de: 'Technisch' },
  { key: 'physical',   fr: 'Physique',            de: 'Körperlich' },
  { key: 'leadership', fr: 'Leadership',          de: 'Führungsstärke' },
  { key: 'vision',     fr: 'Vision du jeu',       de: 'Spielübersicht' },
  { key: 'shooting',   fr: 'Frappe puissante',    de: 'Schussstärke' },
  { key: 'dribbling',  fr: 'Dribble',             de: 'Dribbling' },
  { key: 'precise',    fr: 'Précis',              de: 'Präzise' },
  { key: 'defensive',  fr: 'Défensif',            de: 'Defensiv' },
  { key: 'offensive',  fr: 'Offensif',            de: 'Offensiv' },
  { key: 'hardworking',fr: 'Travailleur',         de: 'Fleissig' },
  { key: 'composed',   fr: 'Calme',               de: 'Ruhig' },
]

function strengthLabel(key: string, lang: Lang) {
  const s = STRENGTHS.find(x => x.key === key)
  if (!s) return key
  return s[lang]
}

function parseStrengths(raw?: string): string[] {
  if (!raw) return []
  return raw.split(',').map(s => s.trim()).filter(Boolean)
}

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

function getYouTubeEmbed(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be') return `https://www.youtube.com/embed/${u.pathname.slice(1)}`
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v')
      if (v) return `https://www.youtube.com/embed/${v}`
    }
    return null
  } catch { return null }
}

export default function ProfilPage() {
  const { lang } = useLang()
  const { session, profile: authProfile, authLoading, refreshProfile } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Edit form state
  const [bio, setBio] = useState('')
  const [position, setPosition] = useState('')
  const [ligue, setLigue] = useState('')
  const [zone, setZone] = useState('')
  const [foot, setFoot] = useState('Droit')
  const [available, setAvailable] = useState(true)
  const [phone, setPhone] = useState('')
  const [career, setCareer] = useState('')
  const [birthDay, setBirthDay] = useState('')
  const [birthMonth, setBirthMonth] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [goals, setGoals] = useState('')
  const [assists, setAssists] = useState('')
  const [matches, setMatches] = useState('')
  const [goalsPrev, setGoalsPrev] = useState('')
  const [assistsPrev, setAssistsPrev] = useState('')
  const [matchesPrev, setMatchesPrev] = useState('')
  const [selectedStrengths, setSelectedStrengths] = useState<string[]>([])
  const [video1, setVideo1] = useState('')
  const [video2, setVideo2] = useState('')
  const [video3, setVideo3] = useState('')

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 55 }, (_, i) => currentYear - 14 - i)
  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  const MONTHS = months[lang]

  useEffect(() => {
    if (authLoading) return
    if (!session) { router.push('/login'); return }

    async function load() {
      let data = authProfile

      // Auto-create profile row if missing (e.g., after Google OAuth signup)
      if (!data) {
        const meta = session!.user.user_metadata || {}
        const newProfile = {
          id: session!.user.id,
          email: session!.user.email || '',
          role: (meta.role as string) || 'player',
          first_name: meta.first_name || meta.given_name || meta.full_name?.split(' ')[0] || '',
          last_name: meta.last_name || meta.family_name || meta.full_name?.split(' ').slice(1).join(' ') || '',
          available: true,
        }
        const { data: inserted } = await supabase.from('profiles').insert(newProfile).select().single()
        data = inserted
        await refreshProfile()
      }

      if (!data) { setLoading(false); return }

      setProfile(data)
      populateForm(data)
      setLoading(false)
    }
    load()
  }, [authLoading, session, authProfile, router])

  function populateForm(data: Profile) {
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
    setGoals(data.goals != null ? String(data.goals) : '')
    setAssists(data.assists != null ? String(data.assists) : '')
    setMatches(data.matches != null ? String(data.matches) : '')
    setGoalsPrev(data.goals_prev != null ? String(data.goals_prev) : '')
    setAssistsPrev(data.assists_prev != null ? String(data.assists_prev) : '')
    setMatchesPrev(data.matches_prev != null ? String(data.matches_prev) : '')
    setSelectedStrengths(parseStrengths(data.strengths))
    setVideo1(data.video1_url || '')
    setVideo2(data.video2_url || '')
    setVideo3(data.video3_url || '')
  }

  async function handlePhotoUpload(e: ChangeEvent<HTMLInputElement>) {
    if (!profile || !e.target.files?.[0]) return
    const file = e.target.files[0]
    if (file.size > 5 * 1024 * 1024) {
      alert('Max 5 MB')
      return
    }
    setUploadingPhoto(true)
    const ext = file.name.split('.').pop()
    const path = `${profile.id}/avatar.${ext}`
    const { data: uploadData, error } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type })
    if (error) {
      alert('Erreur upload: ' + error.message)
      setUploadingPhoto(false)
      return
    }
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(uploadData.path)
    const avatar_url = urlData.publicUrl + '?t=' + Date.now()
    await supabase.from('profiles').update({ avatar_url }).eq('id', profile.id)
    setProfile({ ...profile, avatar_url })
    await refreshProfile()
    setUploadingPhoto(false)
  }

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

    const updates: Partial<Profile> = {
      bio, position, ligue, zone, foot, available,
      phone: phone || undefined,
      career: career || undefined,
      birthdate: birthdate || undefined,
      goals: goals !== '' ? parseInt(goals) : undefined,
      assists: assists !== '' ? parseInt(assists) : undefined,
      matches: matches !== '' ? parseInt(matches) : undefined,
      goals_prev: goalsPrev !== '' ? parseInt(goalsPrev) : undefined,
      assists_prev: assistsPrev !== '' ? parseInt(assistsPrev) : undefined,
      matches_prev: matchesPrev !== '' ? parseInt(matchesPrev) : undefined,
      strengths: selectedStrengths.join(',') || undefined,
      video1_url: video1 || undefined,
      video2_url: video2 || undefined,
      video3_url: video3 || undefined,
    }

    const { error } = await supabase.from('profiles').update(updates).eq('id', profile.id)
    if (!error) {
      const updated = { ...profile, ...updates }
      setProfile(updated)
      await refreshProfile()
      setSaveMsg(t.profil.saved[lang])
      setEditing(false)
      setTimeout(() => setSaveMsg(''), 3000)
    }
    setSaving(false)
  }

  function toggleStrength(key: string) {
    setSelectedStrengths(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  if (loading || authLoading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', flexDirection:'column', gap:'1rem' }}>
      <div style={{ width:40, height:40, border:'4px solid var(--gray-light)', borderTopColor:'var(--blue-bright)', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
      <div style={{ color:'var(--text-muted)', fontSize:14 }}>{t.profil.loading[lang]}</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  if (!profile) return null

  const initials = `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase()
  const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
  const roleEmoji = profile.role === 'player' ? '⚽' : profile.role === 'coach' ? '🎽' : '🏟️'
  const roleLabel = profile.role === 'player' ? t.profil.role_player[lang] : profile.role === 'coach' ? t.profil.role_coach[lang] : t.profil.role_club[lang]
  const displayAge = calcAge(profile.birthdate)
  const ageSuffix = t.general.age_suffix[lang]
  const strengthKeys = parseStrengths(profile.strengths)

  const infoRows: ([string, string] | null)[] = [
    [t.profil.role_k[lang], roleLabel],
    [t.profil.email_k[lang], profile.email],
    displayAge ? [t.profil.age_k[lang], `${displayAge}${ageSuffix}`] : null,
    profile.birthdate ? [t.profil.birth_k[lang], new Date(profile.birthdate).toLocaleDateString(lang === 'fr' ? 'fr-CH' : 'de-CH', { day: 'numeric', month: 'long', year: 'numeric' })] : null,
    profile.foot ? [t.profil.foot_k[lang], translateFoot(profile.foot, lang)] : null,
    profile.zone ? [t.profil.zone_k[lang], profile.zone] : null,
    profile.ligue ? [t.profil.ligue_k[lang], profile.ligue] : null,
    profile.position ? [t.profil.position_k[lang], profile.position] : null,
    profile.club_name ? [t.profil.club_k[lang], profile.club_name] : null,
    profile.phone ? [t.profil.phone_k[lang], profile.phone] : null,
  ]

  const videoUrls = [profile.video1_url, profile.video2_url, profile.video3_url].filter(Boolean) as string[]

  return (
    <div className="wrap">

      {saveMsg && (
        <div style={{ background:'var(--green-bg)', border:'1px solid var(--green)', borderRadius:10, padding:'10px 16px', fontSize:14, color:'var(--green)', marginBottom:'1rem' }}>
          {saveMsg}
        </div>
      )}

      {/* ── HERO ── */}
      <div style={{ background:'linear-gradient(135deg, var(--blue-dark), var(--blue-mid))', borderRadius:20, padding:'2rem', marginBottom:'1.25rem', position:'relative', overflow:'hidden' }}>

        <div style={{ display:'flex', alignItems:'flex-end', gap:'1.5rem', flexWrap:'wrap', position:'relative' }}>

          {/* AVATAR WITH UPLOAD */}
          <div style={{ position:'relative', flexShrink:0 }}>
            <div style={{ width:100, height:100, borderRadius:18, background:'linear-gradient(135deg,#3a8cff,#1a5fb4)', border:'3px solid rgba(255,255,255,.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize: profile.avatar_url ? 0 : '2.2rem', fontWeight:700, color:'#fff', overflow:'hidden', cursor:'pointer' }}
              onClick={() => fileInputRef.current?.click()}>
              {profile.avatar_url
                ? <img src={profile.avatar_url} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                : (initials || roleEmoji)
              }
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              style={{ position:'absolute', bottom:-6, right:-6, width:28, height:28, borderRadius:'50%', background:'var(--blue-bright)', border:'2px solid #fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, cursor:'pointer', color:'#fff' }}
              title={t.profil.photo_upload[lang]}
            >
              {uploadingPhoto ? '⏳' : '📷'}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handlePhotoUpload} />
          </div>

          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'2.2rem', color:'#fff', letterSpacing:1, lineHeight:1, marginBottom:6 }}>
              {fullName || profile.club_name || profile.email}
            </div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:'.75rem', alignItems:'center' }}>
              <span style={{ background:'rgba(255,255,255,.15)', padding:'4px 12px', borderRadius:100, fontSize:12, fontWeight:600, color:'rgba(255,255,255,.9)' }}>
                {roleEmoji} {profile.position || roleLabel}
              </span>
              {profile.foot && (
                <span style={{ background:'rgba(255,255,255,.15)', padding:'4px 12px', borderRadius:100, fontSize:12, fontWeight:600, color:'rgba(255,255,255,.9)' }}>
                  {footDisplay(profile.foot, lang)}
                </span>
              )}
              {displayAge && (
                <span style={{ fontSize:13, color:'rgba(255,255,255,.65)' }}>{displayAge}{ageSuffix}{profile.zone ? ` · ${profile.zone}` : ''}</span>
              )}
            </div>
            <div style={{ display:'flex', gap:'.75rem', flexWrap:'wrap' }}>
              {profile.ligue && <span style={{ background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.2)', color:'rgba(255,255,255,.85)', fontSize:12, padding:'4px 12px', borderRadius:100 }}>🏆 {profile.ligue}</span>}
              <span style={{ background: profile.available ? 'rgba(13,122,54,.3)' : 'rgba(255,255,255,.1)', border:`1px solid ${profile.available ? 'rgba(13,122,54,.5)' : 'rgba(255,255,255,.2)'}`, color:'rgba(255,255,255,.95)', fontSize:12, padding:'4px 12px', borderRadius:100 }}>
                {profile.available ? t.profil.dispo_yes[lang] : t.profil.dispo_no[lang]}
              </span>
              {profile.verified && (
                <span style={{ background:'rgba(0,200,130,.2)', border:'1px solid rgba(0,200,130,.4)', color:'#00c882', fontSize:12, padding:'4px 12px', borderRadius:100 }}>✓ Vérifié</span>
              )}
            </div>
          </div>

          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <button onClick={() => { setEditing(!editing); if (!editing) populateForm(profile) }} className="btn btn-red btn-sm">
              {editing ? t.profil.cancel[lang] : t.profil.edit[lang]}
            </button>
            <button onClick={handleLogout} className="btn btn-sm" style={{ background:'rgba(255,255,255,.15)', color:'#fff', border:'1px solid rgba(255,255,255,.3)' }}>
              {t.profil.logout[lang]}
            </button>
          </div>
        </div>
      </div>

      {/* ── STATS BANNER (current season) ── */}
      {profile.role !== 'club' && (
        <div style={{ background:'#fff', borderRadius:16, border:'1px solid var(--border)', marginBottom:'1.25rem', overflow:'hidden' }}>
          <div style={{ background:'var(--blue-dark)', padding:'.75rem 1.25rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1rem', color:'#fff', letterSpacing:1 }}>{t.profil.current_season[lang]}</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', textAlign:'center' }}>
            {[
              { v: profile.goals ?? 0, k: t.profil.goals[lang] },
              { v: profile.assists ?? 0, k: t.profil.assists[lang] },
              { v: profile.matches ?? 0, k: t.profil.matches[lang] }
            ].map((s, i) => (
              <div key={s.k} style={{ padding:'1.5rem 1rem', borderRight: i < 2 ? '1px solid var(--gray-light)' : 'none' }}>
                <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'3rem', color:'var(--blue-mid)', lineHeight:1 }}>{s.v}</div>
                <div style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:1, marginTop:4 }}>{s.k}</div>
              </div>
            ))}
          </div>
          {(profile.goals_prev != null || profile.assists_prev != null || profile.matches_prev != null) && (
            <div style={{ background:'var(--gray-bg)', padding:'.6rem 1.25rem', fontSize:12, color:'var(--text-muted)', borderTop:'1px solid var(--gray-light)' }}>
              <span style={{ fontWeight:600, color:'var(--text-dark)', marginRight:8 }}>{t.profil.prev_season[lang]}:</span>
              {profile.goals_prev != null && <span style={{ marginRight:12 }}>⚽ {profile.goals_prev} {t.profil.goals[lang].toLowerCase()}</span>}
              {profile.assists_prev != null && <span style={{ marginRight:12 }}>🅰️ {profile.assists_prev} {t.profil.assists[lang].toLowerCase()}</span>}
              {profile.matches_prev != null && <span>🎮 {profile.matches_prev} {t.profil.matches[lang].toLowerCase()}</span>}
            </div>
          )}
        </div>
      )}

      {/* ── STRENGTHS ── */}
      {(strengthKeys.length > 0 || profile.role !== 'club') && (
        <div style={{ background:'#fff', borderRadius:16, border:'1px solid var(--border)', padding:'1.25rem', marginBottom:'1.25rem' }}>
          <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.1rem', letterSpacing:1, marginBottom:'.85rem' }}>{t.profil.strengths_label[lang]}</div>
          {strengthKeys.length === 0 ? (
            <p style={{ fontSize:14, color:'var(--text-muted)', fontStyle:'italic' }}>
              {t.profil.no_strengths[lang]}{' '}
              <button onClick={() => setEditing(true)} style={{ color:'var(--blue-bright)', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:14 }}>{t.profil.add_bio[lang]}</button>
            </p>
          ) : (
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {strengthKeys.map(key => (
                <span key={key} style={{ background:'var(--blue-light)', color:'var(--blue-mid)', fontSize:13, fontWeight:600, padding:'5px 14px', borderRadius:100 }}>
                  {strengthLabel(key, lang)}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── EDIT FORM ── */}
      {editing && (
        <div className="card" style={{ marginBottom:'1.25rem', border:'2px solid var(--blue-bright)' }}>
          <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.2rem', letterSpacing:1, marginBottom:'1.25rem' }}>
            {t.profil.edit_title[lang]}
          </div>

          {/* Basic info */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:'1rem', marginBottom:'1rem' }}>
            {profile.role === 'player' && (
              <div className="field">
                <label className="field-label">{t.profil.position[lang]}</label>
                <select className="input" value={position} onChange={e => setPosition(e.target.value)}>
                  <option value="">—</option>
                  {POSITIONS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            )}
            {profile.role === 'player' && (
              <div className="field">
                <label className="field-label">{t.profil.foot[lang]}</label>
                <select className="input" value={foot} onChange={e => setFoot(e.target.value)}>
                  <option value="Droit">{t.login.right[lang]}</option>
                  <option value="Gauche">{t.login.left[lang]}</option>
                  <option value="Ambidextre">{t.login.both[lang]}</option>
                </select>
              </div>
            )}
            <div className="field">
              <label className="field-label">{t.profil.ligue[lang]}</label>
              <select className="input" value={ligue} onChange={e => setLigue(e.target.value)}>
                <option value="">—</option>
                {LIGUES.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="field-label">{t.profil.zone[lang]}</label>
              <select className="input" value={zone} onChange={e => setZone(e.target.value)}>
                <option value="">—</option>
                {ZONES.map(z => <option key={z}>{z}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="field-label">{t.profil.dispo[lang]}</label>
              <select className="input" value={available ? 'oui' : 'non'} onChange={e => setAvailable(e.target.value === 'oui')}>
                <option value="oui">{t.profil.dispo_yes[lang]}</option>
                <option value="non">{t.profil.dispo_no[lang]}</option>
              </select>
            </div>
          </div>

          {profile.role !== 'club' && (
            <div className="field">
              <label className="field-label">{t.profil.birthdate[lang]}</label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr 1fr', gap:8 }}>
                <select className="input" value={birthDay} onChange={e => setBirthDay(e.target.value)}>
                  <option value="">{t.profil.day[lang]}</option>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select className="input" value={birthMonth} onChange={e => setBirthMonth(e.target.value)}>
                  <option value="">{t.profil.month[lang]}</option>
                  {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
                <select className="input" value={birthYear} onChange={e => setBirthYear(e.target.value)}>
                  <option value="">{t.profil.year[lang]}</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          )}

          <div className="field">
            <label className="field-label">{t.profil.phone[lang]}</label>
            <input className="input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+41 79 000 00 00" />
          </div>

          {/* Stats */}
          {profile.role !== 'club' && (
            <>
              <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1rem', letterSpacing:1, margin:'1rem 0 .5rem', color:'var(--blue-mid)' }}>{t.profil.current_season[lang]}</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem' }}>
                <div className="field">
                  <label className="field-label">{t.profil.goals[lang]}</label>
                  <input className="input" type="number" min="0" value={goals} onChange={e => setGoals(e.target.value)} placeholder="0" />
                </div>
                <div className="field">
                  <label className="field-label">{t.profil.assists[lang]}</label>
                  <input className="input" type="number" min="0" value={assists} onChange={e => setAssists(e.target.value)} placeholder="0" />
                </div>
                <div className="field">
                  <label className="field-label">{t.profil.matches[lang]}</label>
                  <input className="input" type="number" min="0" value={matches} onChange={e => setMatches(e.target.value)} placeholder="0" />
                </div>
              </div>
              <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1rem', letterSpacing:1, margin:'1rem 0 .5rem', color:'var(--text-muted)' }}>{t.profil.prev_season[lang]}</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem' }}>
                <div className="field">
                  <label className="field-label">{t.profil.goals[lang]}</label>
                  <input className="input" type="number" min="0" value={goalsPrev} onChange={e => setGoalsPrev(e.target.value)} placeholder="0" />
                </div>
                <div className="field">
                  <label className="field-label">{t.profil.assists[lang]}</label>
                  <input className="input" type="number" min="0" value={assistsPrev} onChange={e => setAssistsPrev(e.target.value)} placeholder="0" />
                </div>
                <div className="field">
                  <label className="field-label">{t.profil.matches[lang]}</label>
                  <input className="input" type="number" min="0" value={matchesPrev} onChange={e => setMatchesPrev(e.target.value)} placeholder="0" />
                </div>
              </div>
            </>
          )}

          {/* Bio */}
          <div className="field" style={{ marginTop:'1rem' }}>
            <label className="field-label">{t.profil.bio_label[lang]}</label>
            <textarea className="input" rows={3} value={bio} onChange={e => setBio(e.target.value)} placeholder={t.profil.bio_ph[lang]} />
          </div>

          {/* Career */}
          <div className="field">
            <label className="field-label">{t.profil.career_label[lang]}</label>
            <textarea className="input" rows={4} value={career} onChange={e => setCareer(e.target.value)} placeholder={t.profil.career_ph[lang]} />
          </div>

          {/* Strengths */}
          {profile.role !== 'club' && (
            <div className="field">
              <label className="field-label">{t.profil.strengths_label[lang]}</label>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:4 }}>
                {STRENGTHS.map(s => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => toggleStrength(s.key)}
                    style={{
                      padding:'6px 14px', borderRadius:100, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', border:'1.5px solid',
                      background: selectedStrengths.includes(s.key) ? 'var(--blue-mid)' : 'transparent',
                      color: selectedStrengths.includes(s.key) ? '#fff' : 'var(--text-muted)',
                      borderColor: selectedStrengths.includes(s.key) ? 'var(--blue-mid)' : 'var(--border)',
                    }}
                  >
                    {s[lang]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Video highlights */}
          <div className="field">
            <label className="field-label">{t.profil.video_label[lang]}</label>
            <input className="input" style={{ marginBottom:8 }} value={video1} onChange={e => setVideo1(e.target.value)} placeholder={`${t.profil.video1[lang]} — ${t.profil.video_url_ph[lang]}`} />
            <input className="input" style={{ marginBottom:8 }} value={video2} onChange={e => setVideo2(e.target.value)} placeholder={`${t.profil.video2[lang]} — ${t.profil.video_url_ph[lang]}`} />
            <input className="input" value={video3} onChange={e => setVideo3(e.target.value)} placeholder={`${t.profil.video3[lang]} — ${t.profil.video_url_ph[lang]}`} />
          </div>

          <div style={{ display:'flex', gap:8, marginTop:'1rem' }}>
            <button onClick={handleSave} disabled={saving} className="btn btn-blue" style={{ opacity: saving ? .7 : 1 }}>
              {saving ? t.profil.saving[lang] : t.profil.save_btn[lang]}
            </button>
            <button onClick={() => setEditing(false)} className="btn btn-ghost">{t.profil.cancel[lang]}</button>
          </div>
        </div>
      )}

      {/* ── MAIN GRID ── */}
      <div className="profile-grid">
        <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

          {/* BIO */}
          <div className="card">
            <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.2rem', letterSpacing:1, marginBottom:'1rem', paddingBottom:'.75rem', borderBottom:'1px solid var(--gray-light)' }}>
              {t.profil.about[lang]}
            </div>
            {profile.bio
              ? <p style={{ fontSize:14, color:'var(--text-muted)', lineHeight:1.7 }}>{profile.bio}</p>
              : <p style={{ fontSize:14, color:'var(--text-muted)', fontStyle:'italic' }}>
                  {t.profil.no_bio[lang]}{' '}
                  <button onClick={() => setEditing(true)} style={{ color:'var(--blue-bright)', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:14 }}>{t.profil.add_bio[lang]}</button>
                </p>
            }
          </div>

          {/* CAREER HISTORY */}
          <div className="card">
            <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.2rem', letterSpacing:1, marginBottom:'1rem', paddingBottom:'.75rem', borderBottom:'1px solid var(--gray-light)' }}>
              {t.profil.career[lang]}
            </div>
            {profile.career ? (
              <div style={{ display:'flex', flexDirection:'column', gap:'.25rem' }}>
                {profile.career.split('\n').filter(Boolean).map((line, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'.6rem 0', borderBottom:'1px solid var(--gray-light)' }}>
                    <div style={{ width:10, height:10, borderRadius:'50%', background:'var(--blue-bright)', flexShrink:0, marginTop:4 }} />
                    <div style={{ fontSize:14, color:'var(--text-dark)', lineHeight:1.5 }}>{line}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize:14, color:'var(--text-muted)', fontStyle:'italic' }}>
                {t.profil.no_career[lang]}{' '}
                <button onClick={() => setEditing(true)} style={{ color:'var(--blue-bright)', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:14 }}>{t.profil.add_career[lang]}</button>
              </p>
            )}
          </div>

          {/* VIDEO HIGHLIGHTS */}
          <div className="card">
            <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.2rem', letterSpacing:1, marginBottom:'1rem', paddingBottom:'.75rem', borderBottom:'1px solid var(--gray-light)' }}>
              {t.profil.highlights[lang]}
            </div>
            {videoUrls.length === 0 ? (
              <div style={{ background:'var(--gray-bg)', borderRadius:12, padding:'2rem', textAlign:'center', border:'2px dashed var(--gray-mid)' }}>
                <div style={{ fontSize:14, color:'var(--text-muted)' }}>
                  🎬 {t.profil.video_soon[lang]}
                </div>
                <button onClick={() => setEditing(true)} style={{ marginTop:'.75rem', color:'var(--blue-bright)', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:600 }}>
                  {t.profil.edit_videos[lang]} →
                </button>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                {videoUrls.map((url, i) => {
                  const embed = getYouTubeEmbed(url)
                  return (
                    <div key={i}>
                      {embed ? (
                        <div style={{ position:'relative', paddingBottom:'56.25%', borderRadius:12, overflow:'hidden', background:'#000' }}>
                          <iframe
                            src={embed}
                            title={`Video ${i+1}`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%' }}
                          />
                        </div>
                      ) : (
                        <a href={url} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:8, padding:'.75rem', background:'var(--gray-bg)', borderRadius:10, textDecoration:'none', color:'var(--blue-mid)', fontSize:14, fontWeight:600 }}>
                          🎬 {t.profil.video_label[lang]} {i+1}
                        </a>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          <div className="card card-sm">
            {profile.available && (
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'var(--green-bg)', color:'var(--green)', fontSize:13, fontWeight:600, padding:'6px 14px', borderRadius:100, marginBottom:'1rem' }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:'var(--green)' }} />
                {t.profil.available_badge[lang]}
              </div>
            )}
            <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.1rem', letterSpacing:1, marginBottom:'1rem' }}>{t.profil.info[lang]}</div>
            {infoRows.filter((item): item is [string, string] => Array.isArray(item)).map(([k, v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--gray-light)', fontSize:14 }}>
                <span style={{ color:'var(--text-muted)' }}>{k}</span>
                <span style={{ fontWeight:600, maxWidth:'60%', textAlign:'right', wordBreak:'break-all' }}>{v}</span>
              </div>
            ))}
          </div>

          <div className="card card-sm">
            <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.1rem', letterSpacing:1, marginBottom:'1rem' }}>{t.profil.actions[lang]}</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <Link href="/recherche" className="btn btn-blue btn-sm btn-full" style={{ justifyContent:'center' }}>{t.profil.search_clubs[lang]}</Link>
              <Link href="/messages" className="btn btn-ghost btn-sm btn-full" style={{ justifyContent:'center' }}>{t.profil.my_msgs[lang]}</Link>
              <Link href="/candidatures" className="btn btn-ghost btn-sm btn-full" style={{ justifyContent:'center' }}>{t.profil.my_cands[lang]}</Link>
            </div>
          </div>

          <div className="card card-sm" style={{ background:'var(--blue-light)', border:'1px solid var(--blue-bright)' }}>
            <div style={{ fontSize:13, color:'var(--blue-mid)', fontWeight:600, marginBottom:'.5rem' }}>{t.profil.conseil[lang]}</div>
            <div style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.6 }}>
              {t.profil.conseil_text[lang]}
            </div>
            <button onClick={() => setEditing(true)} className="btn btn-blue btn-sm" style={{ marginTop:'.75rem', width:'100%', justifyContent:'center' }}>
              {t.profil.complete[lang]}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 1.25rem;
        }
        @media (max-width: 720px) {
          .profile-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}
