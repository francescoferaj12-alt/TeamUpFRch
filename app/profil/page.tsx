'use client'

import { useEffect, useState, useRef, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import VerifiedBadge from '../../components/VerifiedBadge'
import { strengthIcon } from '../../lib/strength-icons'
import { supabase, Profile, CareerExperience } from '../../lib/supabase'
import { useLang } from '../../lib/lang-context'
import { useAuth } from '../../lib/auth-context'
import { t, months, footDisplay, translateFoot, Lang } from '../../lib/translations'
import { liguesHomme, liguesFemme } from '../../lib/data'

const AvatarCropModal = dynamic(() => import('../../components/AvatarCropModal'), { ssr: false })
const PostModal = dynamic(() => import('../../components/PostModal'), { ssr: false })
const CareerSection = dynamic(() => import('../../components/CareerSection'), { ssr: false })
const CareerExperienceModal = dynamic(() => import('../../components/CareerExperienceModal'), { ssr: false })
const ProfileEditForm = dynamic(() => import('../../components/ProfileEditForm'), { ssr: false })

const POSITIONS = ['Attaquant','Milieu offensif','Milieu défensif','Défenseur central','Défenseur latéral','Gardien']
const ZONES = ['Fribourg-Ville','Gruyère','Broye','Glâne','Sensebezirk','Veveyse','Lac']

// ── Role-specific strength tags ──────────────────────────────────────────────
const STRENGTHS_PLAYER = [
  { key: 'fast',        fr: 'Rapide',             de: 'Schnell' },
  { key: 'technical',   fr: 'Technique',          de: 'Technisch' },
  { key: 'physical',    fr: 'Physique',           de: 'Körperlich' },
  { key: 'dribbling',   fr: 'Dribble',            de: 'Dribbling' },
  { key: 'shooting',    fr: 'Frappe puissante',   de: 'Schussstärke' },
  { key: 'finishing',   fr: 'Finition',           de: 'Abschluss' },
  { key: 'passing',     fr: 'Passes précises',    de: 'Genaue Pässe' },
  { key: 'vision',      fr: 'Vision du jeu',      de: 'Spielübersicht' },
  { key: 'aerial',      fr: 'Jeu aérien',         de: 'Kopfballspiel' },
  { key: 'onevsone',    fr: '1 contre 1',         de: '1 gegen 1' },
  { key: 'sprint',      fr: 'Vitesse de pointe',  de: 'Sprintschnelligkeit' },
  { key: 'pressing',    fr: 'Pressing',           de: 'Pressing' },
  { key: 'defensive',   fr: 'Défensif',           de: 'Defensiv' },
  { key: 'offensive',   fr: 'Offensif',           de: 'Offensiv' },
  { key: 'leadership',  fr: 'Leadership',         de: 'Führungsstärke' },
  { key: 'hardworking', fr: 'Travailleur',        de: 'Fleissig' },
  { key: 'composed',    fr: 'Calme',              de: 'Ruhig' },
  { key: 'precise',     fr: 'Précis',             de: 'Präzise' },
]

const STRENGTHS_COACH = [
  { key: 'tactical',    fr: 'Tactique',              de: 'Taktisch' },
  { key: 'motivator',   fr: 'Motivateur',            de: 'Motivator' },
  { key: 'communication', fr: 'Communication',       de: 'Kommunikation' },
  { key: 'experienced', fr: 'Expérimenté',           de: 'Erfahren' },
  { key: 'video',       fr: 'Analyse vidéo',         de: 'Videoanalyse' },
  { key: 'youth',       fr: 'Formation des jeunes',  de: 'Jugendausbildung' },
  { key: 'defense',     fr: 'Défense organisée',     de: 'Organisierte Abwehr' },
  { key: 'counter',     fr: 'Contre-attaque',        de: 'Konterspiel' },
  { key: 'possession',  fr: 'Jeu de possession',     de: 'Ballbesitzspiel' },
  { key: 'pressing',    fr: 'Jeu de pression',       de: 'Pressing-Spiel' },
  { key: 'leadership',  fr: 'Leadership',            de: 'Führungsstärke' },
  { key: 'passionate',  fr: 'Passionné',             de: 'Leidenschaftlich' },
  { key: 'innovative',  fr: 'Innovateur',            de: 'Innovativ' },
  { key: 'composed',    fr: 'Calme',                 de: 'Ruhig' },
  { key: 'fitness',     fr: 'Préparation physique',  de: 'Fitness-Training' },
]

const STRENGTHS_CLUB = [
  { key: 'infrastructure', fr: 'Infrastructure de qualité', de: 'Gute Infrastruktur' },
  { key: 'family',         fr: 'Esprit familial',           de: 'Familiäre Atmosphäre' },
  { key: 'ambition',       fr: 'Ambition sportive',         de: 'Sportlicher Ehrgeiz' },
  { key: 'youth',          fr: 'Formation jeunes',          de: 'Jugendförderung' },
  { key: 'competitive',    fr: 'Équipe compétitive',        de: 'Wettbewerbsfähig' },
  { key: 'atmosphere',     fr: 'Bonne ambiance',            de: 'Gute Stimmung' },
  { key: 'professional',   fr: 'Structure sérieuse',        de: 'Seriöse Struktur' },
  { key: 'social',         fr: 'Vie sociale active',        de: 'Aktives Sozialleben' },
  { key: 'equipment',      fr: 'Bons équipements',          de: 'Gute Ausrüstung' },
  { key: 'local',          fr: 'Ancrage local',             de: 'Lokale Verankerung' },
  { key: 'growing',        fr: 'Club en développement',     de: 'Wachsender Verein' },
  { key: 'welcoming',      fr: 'Accueil de nouveaux joueurs', de: 'Offene Aufnahme' },
]

const ALL_STRENGTHS = [...STRENGTHS_PLAYER, ...STRENGTHS_COACH, ...STRENGTHS_CLUB]

function getStrengthsByRole(role: string) {
  if (role === 'coach') return STRENGTHS_COACH
  if (role === 'club') return STRENGTHS_CLUB
  return STRENGTHS_PLAYER
}

function strengthLabel(key: string, lang: Lang) {
  const s = ALL_STRENGTHS.find(x => x.key === key)
  return s ? s[lang] : key
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
  const [profile, setProfile] = useState<Profile | null>(authProfile)
  const [loading, setLoading] = useState(!authProfile)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [saveError, setSaveError] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [showPostModal, setShowPostModal] = useState(false)
  const [postSuccess, setPostSuccess] = useState(false)
  const [myPosts, setMyPosts] = useState<any[]>([])
  const [editingPost, setEditingPost] = useState<any | null>(null)
  const [experiences, setExperiences] = useState<CareerExperience[]>([])
  const [showCareerModal, setShowCareerModal] = useState(false)
  const [editingExp, setEditingExp] = useState<CareerExperience | null>(null)
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [bio, setBio] = useState('')
  const [position, setPosition] = useState('')
  const [genre, setGenre] = useState<'homme' | 'femme'>('homme')
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
  const [coachExperience, setCoachExperience] = useState('')
  const [coachDiploma, setCoachDiploma] = useState('')
  const [coachSpecialty, setCoachSpecialty] = useState('')
  const [coachAvailability, setCoachAvailability] = useState('')
  const [clubWebsite, setClubWebsite] = useState('')
  const [clubInstagram, setClubInstagram] = useState('')
  const [clubFacebook, setClubFacebook] = useState('')
  const [clubWhatsapp, setClubWhatsapp] = useState('')
  const [clubPhonePublic, setClubPhonePublic] = useState('')
  const [clubEmailPublic, setClubEmailPublic] = useState('')
  const [clubName, setClubName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 55 }, (_, i) => currentYear - 14 - i)
  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  const MONTHS = months[lang]

  useEffect(() => {
    if (authLoading) return
    if (!session) { router.push('/login'); return }

    async function load() {
      let data = authProfile

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
        const { data: inserted } = await supabase.from('profiles').upsert(newProfile, { onConflict: 'id' }).select().single()
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

  useEffect(() => {
    if (!profile) return
    supabase.from('annonces').select('*').eq('author_id', profile.id).order('created_at', { ascending: false })
      .then(({ data }) => setMyPosts(data || []))
    supabase.from('career_experiences').select('*').eq('user_id', profile.id).order('start_date', { ascending: false })
      .then(({ data }) => setExperiences(data || []))
  }, [profile?.id])

  function populateForm(data: Profile) {
    setBio(data.bio || '')
    setPosition(data.position || '')
    setGenre(data.genre || 'homme')
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
    setCoachExperience(data.coach_experience || '')
    setCoachDiploma(data.coach_diploma || '')
    setCoachSpecialty(data.coach_specialty || '')
    setCoachAvailability(data.coach_availability || '')
    setClubWebsite(data.club_website || '')
    setClubInstagram(data.club_instagram || '')
    setClubFacebook(data.club_facebook || '')
    setClubWhatsapp(data.club_whatsapp || '')
    setClubPhonePublic(data.club_phone_public || '')
    setClubEmailPublic(data.club_email_public || '')
    setClubName(data.club_name || '')
    setFirstName(data.first_name || '')
    setLastName(data.last_name || '')
  }

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('Seules les images sont acceptées'); return }
    if (file.size > 15 * 1024 * 1024) { alert('Max 15 MB'); return }
    const url = URL.createObjectURL(file)
    setCropSrc(url)
    // reset so same file can be reselected
    e.target.value = ''
  }

  async function handleCropConfirm(blob: Blob) {
    if (!profile) return
    setUploadingPhoto(true)
    const path = `${profile.id}/avatar.jpg`
    const { data: uploadData, error } = await supabase.storage
      .from('avatars')
      .upload(path, blob, { upsert: true, contentType: 'image/jpeg' })
    if (error) { alert('Erreur upload: ' + error.message); setUploadingPhoto(false); return }
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(uploadData.path)
    const avatar_url = urlData.publicUrl + '?t=' + Date.now()
    await supabase.from('profiles').update({ avatar_url }).eq('id', profile.id)
    setProfile({ ...profile, avatar_url })
    await refreshProfile()
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
    setUploadingPhoto(false)
  }

  function handleCropCancel() {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  async function handleSave() {
    if (!profile) return
    setSaving(true)
    setSaveError('')

    const birthdate = birthDay && birthMonth && birthYear
      ? `${birthYear}-${birthMonth.padStart(2,'0')}-${birthDay.padStart(2,'0')}`
      : null

    // Base fields that always exist in the DB
    const baseUpdates = {
      first_name: firstName || null,
      last_name: lastName || null,
      ...(profile.role === 'club' ? {
        club_name: clubName || null,
        // reset verification if the club name changed
        ...(clubName && clubName !== profile.club_name ? { verified: false, verification_requested: false } : {}),
      } : {}),
      bio: bio || null,
      position: position || null,
      genre: profile.role !== 'club' ? genre : null,
      ligue: ligue || null,
      zone: zone || null,
      foot: foot || null,
      available,
      phone: phone || null,
      career: career || null,
      birthdate,
      goals: goals !== '' ? parseInt(goals) : null,
      assists: assists !== '' ? parseInt(assists) : null,
      matches: matches !== '' ? parseInt(matches) : null,
    }

    // Try saving base fields first
    const { error: baseError } = await supabase
      .from('profiles')
      .update(baseUpdates)
      .eq('id', profile.id)

    if (baseError) {
      setSaveError(baseError.message)
      setSaving(false)
      return
    }

    // Try saving new fields (may not exist if SQL migration wasn't run)
    const newFields = {
      goals_prev: goalsPrev !== '' ? parseInt(goalsPrev) : null,
      assists_prev: assistsPrev !== '' ? parseInt(assistsPrev) : null,
      matches_prev: matchesPrev !== '' ? parseInt(matchesPrev) : null,
      strengths: selectedStrengths.join(',') || null,
      video1_url: video1 || null,
      video2_url: video2 || null,
      video3_url: video3 || null,
      ...(profile.role === 'coach' ? {
        coach_experience: coachExperience || null,
        coach_diploma: coachDiploma || null,
        coach_specialty: coachSpecialty || null,
        coach_availability: coachAvailability || null,
      } : {}),
      ...(profile.role === 'club' ? {
        club_website: clubWebsite || null,
        club_instagram: clubInstagram || null,
        club_facebook: clubFacebook || null,
        club_whatsapp: clubWhatsapp || null,
        club_phone_public: clubPhonePublic || null,
        club_email_public: clubEmailPublic || null,
      } : {}),
    }
    await supabase.from('profiles').update(newFields).eq('id', profile.id)

    const updated = { ...profile, ...baseUpdates, ...newFields }
    setProfile(updated as Profile)
    await refreshProfile()
    setSaveMsg(t.profil.saved[lang])
    setEditing(false)
    setTimeout(() => setSaveMsg(''), 3000)
    setSaving(false)
  }

  function toggleStrength(key: string) {
    setSelectedStrengths(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  if (loading || authLoading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', flexDirection:'column', gap:'1rem', background:'#030a24' }}>
      <div style={{ width:40, height:40, border:'4px solid rgba(255,255,255,.1)', borderTopColor:'#e63946', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
      <div style={{ color:'rgba(255,255,255,.4)', fontSize:14 }}>{t.profil.loading[lang]}</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  if (!profile) return null

  const initials = profile.role === 'club'
    ? (profile.club_name?.slice(0, 2).toUpperCase() || '🏟️')
    : `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase()
  const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
  const displayName = profile.role === 'club'
    ? (profile.club_name || profile.email)
    : (fullName || profile.email)
  const roleEmoji = profile.role === 'player' ? '⚽' : profile.role === 'coach' ? '🎽' : '🏟️'
  const roleLabel = profile.role === 'player'
    ? (profile.genre === 'femme' ? t.profil.joueur_f[lang] : t.profil.role_player[lang])
    : profile.role === 'coach'
    ? (profile.genre === 'femme' ? t.profil.coach_f[lang] : t.profil.role_coach[lang])
    : t.profil.role_club[lang]
  const displayAge = calcAge(profile.birthdate)
  const ageSuffix = t.general.age_suffix[lang]
  const strengthKeys = parseStrengths(profile.strengths)
  const roleStrengths = getStrengthsByRole(profile.role)

  const infoRows: ([string, string] | null)[] = [
    [t.profil.role_k[lang], roleLabel],
    [t.profil.email_k[lang], profile.email],
    displayAge ? [t.profil.age_k[lang], `${displayAge}${ageSuffix}`] : null,
    profile.birthdate ? [t.profil.birth_k[lang], new Date(profile.birthdate).toLocaleDateString(lang === 'fr' ? 'fr-CH' : 'de-CH', { day: 'numeric', month: 'long', year: 'numeric' })] : null,
    profile.role === 'player' && profile.foot ? [t.profil.foot_k[lang], translateFoot(profile.foot, lang)] : null,
    profile.zone ? [t.profil.zone_k[lang], profile.zone] : null,
    profile.role !== 'coach' && profile.ligue ? [t.profil.ligue_k[lang], profile.ligue] : null,
    profile.role === 'player' && profile.position ? [t.profil.position_k[lang], profile.position] : null,
    profile.club_name ? [t.profil.club_k[lang], profile.club_name] : null,
    profile.phone ? [t.profil.phone_k[lang], profile.phone] : null,
    profile.role === 'coach' && profile.coach_experience ? ['Expérience', profile.coach_experience] : null,
    profile.role === 'coach' && profile.coach_diploma ? ['Diplôme', profile.coach_diploma] : null,
    profile.role === 'coach' && profile.coach_specialty ? ['Spécialité', profile.coach_specialty] : null,
    profile.role === 'coach' && profile.coach_availability ? ['Disponibilité', profile.coach_availability] : null,
  ]

  const videoUrls = [profile.video1_url, profile.video2_url, profile.video3_url].filter(Boolean) as string[]

  const darkCard: React.CSSProperties = { background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:16, padding:'1.25rem' }
  const inpSt: React.CSSProperties = { width:'100%', background:'rgba(255,255,255,.07)', border:'1.5px solid rgba(255,255,255,.12)', color:'#fff', borderRadius:9, padding:'10px 14px', fontSize:14, outline:'none', fontFamily:'inherit' }
  const lblSt: React.CSSProperties = { display:'block', fontSize:13, fontWeight:600, color:'rgba(255,255,255,.55)', marginBottom:6 }
  const optSt = { background:'#061540' }

  return (
    <div style={{ background:'#030a24', minHeight:'100vh', color:'#fff' }}>
      {cropSrc && (
        <AvatarCropModal
          src={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
          uploading={uploadingPhoto}
        />
      )}
      {(showPostModal || editingPost) && (
        <PostModal
          profile={profile}
          annonce={editingPost || undefined}
          onClose={() => { setShowPostModal(false); setEditingPost(null) }}
          onSuccess={(a) => {
            if (editingPost) {
              setMyPosts(prev => prev.map(p => p.id === a.id ? a : p))
              setEditingPost(null)
            } else {
              setMyPosts(prev => [a, ...prev])
              setShowPostModal(false)
              setPostSuccess(true)
              setTimeout(() => setPostSuccess(false), 4000)
            }
          }}
        />
      )}
      <div style={{ maxWidth:900, margin:'0 auto', padding:'1.5rem' }}>

      {saveMsg && (
        <div style={{ background:'rgba(13,122,54,.15)', border:'1px solid rgba(76,219,122,.25)', borderRadius:10, padding:'10px 16px', fontSize:14, color:'#4cdb7a', marginBottom:'1rem' }}>
          ✅ {saveMsg}
        </div>
      )}
      {postSuccess && (
        <div style={{ background:'rgba(13,122,54,.15)', border:'1px solid rgba(76,219,122,.25)', borderRadius:10, padding:'10px 16px', fontSize:14, color:'#4cdb7a', marginBottom:'1rem' }}>
          ✅ Post publié ! Visible dans <a href="/annonces" style={{ color:'#4cdb7a', fontWeight:700 }}>le fil d'annonces</a>.
        </div>
      )}

      {/* ── HERO ── */}
      <div style={{ background:'linear-gradient(135deg,#061540,#0a1f5c)', borderRadius:20, padding:'2rem', marginBottom:'1.25rem', position:'relative', overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'flex-end', gap:'1.5rem', flexWrap:'wrap', position:'relative' }}>

          {/* AVATAR */}
          <div style={{ position:'relative', flexShrink:0 }}>
            <div
              style={{ width:100, height:100, borderRadius:'50%', background:'linear-gradient(135deg,#3a8cff,#1a5fb4)', border:'3px solid rgba(255,255,255,.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize: profile.avatar_url ? 0 : '2.2rem', fontWeight:700, color:'#fff', overflow:'hidden', cursor:'pointer' }}
              onClick={() => fileInputRef.current?.click()}
            >
              {profile.avatar_url
                ? <img src={profile.avatar_url} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                : (initials || roleEmoji)
              }
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              style={{ position:'absolute', bottom:-6, right:-6, width:28, height:28, borderRadius:'50%', background:'#e63946', border:'2px solid #030a24', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, cursor:'pointer', color:'#fff' }}
              title={t.profil.photo_upload[lang]}
            >
              {uploadingPhoto ? '⏳' : '📷'}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFileSelect} />
          </div>

          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'2.2rem', color:'#fff', letterSpacing:1, lineHeight:1, marginBottom:6 }}>
              {displayName}
            </div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:'.75rem', alignItems:'center' }}>
              <span style={{ background:'rgba(255,255,255,.15)', padding:'4px 12px', borderRadius:100, fontSize:12, fontWeight:600, color:'rgba(255,255,255,.9)' }}>
                {roleEmoji} {profile.role === 'coach' ? (profile.coach_specialty || roleLabel) : (profile.position || roleLabel)}
              </span>
              {profile.role !== 'coach' && profile.foot && (
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
              {profile.verified && <VerifiedBadge />}
            </div>

            {strengthKeys.length > 0 && (
              <div className="strengths-row">
                {strengthKeys.slice(0, 5).map(key => (
                  <span key={key} className="strength-tag">
                    <span className="strength-icon">{strengthIcon(key)}</span>
                    {strengthLabel(key, lang)}
                  </span>
                ))}
                {strengthKeys.length > 5 && (
                  <span className="strength-tag strength-more">+{strengthKeys.length - 5}</span>
                )}
              </div>
            )}
          </div>

          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <button
              onClick={() => setShowPostModal(true)}
              style={{ background:'rgba(230,57,70,.15)', color:'#e63946', border:'1.5px solid rgba(230,57,70,.4)', borderRadius:8, padding:'7px 16px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}
            >
              📢 Publier un post
            </button>
            <button onClick={() => { setEditing(!editing); if (!editing) populateForm(profile) }} style={{ background:'rgba(255,255,255,.12)', color:'rgba(255,255,255,.8)', border:'1px solid rgba(255,255,255,.2)', borderRadius:8, padding:'7px 16px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
              {editing ? t.profil.cancel[lang] : t.profil.edit[lang]}
            </button>
            <button onClick={handleLogout} style={{ background:'rgba(255,255,255,.08)', color:'rgba(255,255,255,.6)', border:'1px solid rgba(255,255,255,.12)', borderRadius:8, padding:'7px 16px', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
              {t.profil.logout[lang]}
            </button>
          </div>
        </div>
      </div>

      {/* ── STATS (joueur uniquement) ── */}
      {profile.role === 'player' && (() => {
        const now = new Date()
        const sy = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1
        const seasonNow  = `${sy} – ${String(sy + 1).slice(2)}`
        const seasonPrev = `${sy - 1} – ${String(sy).slice(2)}`
        const hasPrev = profile.goals_prev != null || profile.assists_prev != null || profile.matches_prev != null
        const stats = [
          { v: profile.goals   ?? 0, k: t.profil.goals[lang],   prev: profile.goals_prev,   color:'#e02020' },
          { v: profile.assists ?? 0, k: t.profil.assists[lang], prev: profile.assists_prev, color:'#1a6fd4' },
          { v: profile.matches ?? 0, k: t.profil.matches[lang], prev: profile.matches_prev, color:'#0a7c3e' },
        ]
        return (
          <div style={{ background:'rgba(255,255,255,.04)', borderRadius:16, border:'1px solid rgba(255,255,255,.08)', marginBottom:'1.25rem', overflow:'hidden' }}>
            {/* CURRENT SEASON header */}
            <div style={{ background:'linear-gradient(135deg,#0d1f3c,#1a3a6b)', padding:'.85rem 1.25rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1rem', color:'#fff', letterSpacing:2 }}>{t.profil.current_season[lang]}</span>
              <span style={{ fontSize:11, color:'rgba(255,255,255,.5)', letterSpacing:1, fontWeight:600 }}>{seasonNow}</span>
            </div>

            {/* Current big numbers */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)' }}>
              {stats.map((s, i) => {
                const delta = s.prev != null ? s.v - s.prev : null
                return (
                  <div key={s.k} style={{ padding:'1.4rem .5rem 1.1rem', borderRight: i < 2 ? '1px solid rgba(255,255,255,.07)' : 'none', textAlign:'center', position:'relative' }}>
                    <div style={{ position:'absolute', top:0, left:'25%', right:'25%', height:3, background:s.color, borderRadius:'0 0 4px 4px' }} />
                    <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'3rem', color:s.color, lineHeight:1 }}>{s.v}</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:1.5, marginTop:3, fontWeight:700 }}>{s.k}</div>
                    {delta !== null && (
                      <div style={{ marginTop:7, fontSize:11, fontWeight:700, color: delta > 0 ? '#4cdb7a' : delta < 0 ? '#ff6b6b' : 'rgba(255,255,255,.4)', background: delta > 0 ? 'rgba(76,219,122,.12)' : delta < 0 ? 'rgba(255,107,107,.12)' : 'rgba(255,255,255,.06)', borderRadius:100, padding:'2px 9px', display:'inline-block', letterSpacing:.3 }}>
                        {delta > 0 ? '▲' : delta < 0 ? '▼' : '–'} {Math.abs(delta)}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {hasPrev && (
              <>
                {/* PREVIOUS SEASON header — same style as current but lighter */}
                <div style={{ background:'linear-gradient(135deg,#3a4a66,#5a6c8a)', padding:'.85rem 1.25rem', display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid rgba(255,255,255,.07)' }}>
                  <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1rem', color:'#fff', letterSpacing:2 }}>{t.profil.prev_season[lang]}</span>
                  <span style={{ fontSize:11, color:'rgba(255,255,255,.55)', letterSpacing:1, fontWeight:600 }}>{seasonPrev}</span>
                </div>

                {/* Previous numbers — smaller */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)' }}>
                  {[
                    { v: profile.goals_prev,   k: t.profil.goals[lang],   color:'#e02020' },
                    { v: profile.assists_prev, k: t.profil.assists[lang], color:'#1a6fd4' },
                    { v: profile.matches_prev, k: t.profil.matches[lang], color:'#0a7c3e' },
                  ].map((s, i) => (
                    <div key={s.k} style={{ padding:'1rem .5rem .9rem', borderRight: i < 2 ? '1px solid rgba(255,255,255,.07)' : 'none', textAlign:'center', background:'rgba(255,255,255,.02)' }}>
                      <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.9rem', color: s.color, opacity:.85, lineHeight:1 }}>{s.v ?? '—'}</div>
                      <div style={{ fontSize:10, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:1.5, marginTop:3, fontWeight:700 }}>{s.k}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )
      })()}

      {/* ── COACH INFO CARD ── */}
      {profile.role === 'coach' && (profile.coach_experience || profile.coach_diploma || profile.coach_specialty || profile.coach_availability) && (
        <div style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:16, marginBottom:'1.25rem', overflow:'hidden' }}>
          <div style={{ background:'linear-gradient(135deg,#0d1f3c,#1a3a6b)', padding:'.85rem 1.25rem' }}>
            <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1rem', color:'#fff', letterSpacing:2 }}>Profil Entraîneur</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))' }}>
            {[
              { label:'Expérience', value:profile.coach_experience, color:'#e02020' },
              { label:'Diplôme',    value:profile.coach_diploma,    color:'#1a6fd4' },
              { label:'Spécialité', value:profile.coach_specialty,  color:'#0a7c3e' },
              { label:'Statut',     value:profile.coach_availability, color:'#b56cf0' },
            ].filter(s => s.value).map((s, i, arr) => (
              <div key={s.label} style={{ padding:'1.2rem 1rem', borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,.07)' : 'none', textAlign:'center', position:'relative' }}>
                <div style={{ position:'absolute', top:0, left:'20%', right:'20%', height:3, background:s.color, borderRadius:'0 0 4px 4px' }} />
                <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.3rem', color:s.color, lineHeight:1.2, marginBottom:4 }}>{s.value}</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:1.5, fontWeight:700 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CLUB INFO CARD ── */}
      {profile.role === 'club' && (
        <div style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:16, marginBottom:'1.25rem', overflow:'hidden' }}>
          <div style={{ background:'linear-gradient(135deg,#0d1f3c,#1a3a6b)', padding:'.85rem 1.25rem' }}>
            <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1rem', color:'#fff', letterSpacing:2 }}>Profil Club</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))' }}>
            {[
              { label:'Ligue',       value: profile.ligue,  color:'#e02020' },
              { label:'Zone',        value: profile.zone,   color:'#1a6fd4' },
              { label:'Recrutement', value: profile.available ? 'Ouvert' : 'Complet', color: profile.available ? '#0a7c3e' : '#888' },
              { label:'Vérifié',     value: profile.verified ? 'Oui ✓' : null, color:'#1d9bf0' },
            ].filter(s => s.value).map((s, i, arr) => (
              <div key={s.label} style={{ padding:'1.2rem 1rem', borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,.07)' : 'none', textAlign:'center', position:'relative' }}>
                <div style={{ position:'absolute', top:0, left:'20%', right:'20%', height:3, background:s.color, borderRadius:'0 0 4px 4px' }} />
                <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.3rem', color:s.color, lineHeight:1.2, marginBottom:4 }}>{s.value}</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:1.5, fontWeight:700 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CLUB CATEGORIES ── */}
      {profile.role === 'club' && profile.club_categories && (
        <div style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:16, marginBottom:'1.25rem', padding:'1.25rem' }}>
          <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1rem', letterSpacing:2, color:'#fff', marginBottom:'1rem' }}>
            ⚽ {lang === 'fr' ? 'Catégories proposées' : 'Angebotene Kategorien'}
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {profile.club_categories.split(',').map(s => s.trim()).filter(Boolean).map(key => {
              const labels: Record<string, { fr: string; de: string }> = {
                cat_seniors_h:  { fr:'Seniors hommes', de:'Senioren Männer' },
                cat_seniors_f:  { fr:'Seniors femmes', de:'Senioren Frauen' },
                cat_youth:      { fr:'Youth League',   de:'Youth League' },
                cat_juniors_a:  { fr:'Juniors A',      de:'Junioren A' },
                cat_juniors_b:  { fr:'Juniors B',      de:'Junioren B' },
                cat_juniors_c:  { fr:'Juniors C',      de:'Junioren C' },
                cat_juniors_d:  { fr:'Juniors D',      de:'Junioren D' },
                cat_juniores_f: { fr:'Juniors filles', de:'Juniorinnen' },
                cat_veterans:   { fr:'Vétérans',       de:'Veteranen' },
              }
              const color = key.includes('seniors') ? '#3a8cff' : key === 'cat_veterans' ? '#b56cf0' : key === 'cat_juniores_f' ? '#ff8fab' : key === 'cat_youth' ? '#ffb84a' : '#4cdb7a'
              return (
                <span key={key} style={{ background:`${color}1a`, border:`1.5px solid ${color}55`, color, borderRadius:100, padding:'5px 16px', fontSize:13, fontWeight:700 }}>
                  {labels[key]?.[lang] || key}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* ── CAREER SECTION ── */}
      {profile.role !== 'club' && (
        <>
          {(showCareerModal || editingExp) && (
            <CareerExperienceModal
              userId={profile.id}
              role={profile.role as 'player'|'coach'}
              lang={lang}
              experience={editingExp}
              onClose={() => { setShowCareerModal(false); setEditingExp(null) }}
              onSaved={(exp) => {
                setExperiences(prev => editingExp ? prev.map(e => e.id === exp.id ? exp : e) : [exp, ...prev])
                setShowCareerModal(false); setEditingExp(null)
              }}
              onDeleted={(id) => { setExperiences(prev => prev.filter(e => e.id !== id)); setEditingExp(null) }}
            />
          )}
          <CareerSection
            experiences={experiences}
            role={profile.role as 'player'|'coach'}
            lang={lang}
            canEdit
            onAdd={() => setShowCareerModal(true)}
            onEdit={(exp) => setEditingExp(exp)}
            onDelete={async (id) => {
              await supabase.from('career_experiences').delete().eq('id', id)
              setExperiences(prev => prev.filter(e => e.id !== id))
            }}
          />
        </>
      )}

      {/* ── MES ANNONCES ── */}
      <div style={{ ...darkCard, marginBottom:'1.25rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
          <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.1rem', letterSpacing:1 }}>
            📢 Mes annonces ({myPosts.length})
          </div>
          <button
            onClick={() => setShowPostModal(true)}
            style={{ background:'rgba(230,57,70,.15)', color:'#e63946', border:'1.5px solid rgba(230,57,70,.4)', borderRadius:8, padding:'5px 12px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}
          >
            + Nouveau
          </button>
        </div>
        {myPosts.length === 0 ? (
          <div style={{ textAlign:'center', padding:'1rem', color:'rgba(255,255,255,.35)', fontSize:14 }}>
            Aucun post publié.{' '}
            <button onClick={() => setShowPostModal(true)} style={{ color:'#e63946', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:14, fontWeight:700 }}>
              Publier →
            </button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'.6rem' }}>
            {myPosts.map(post => (
              <div key={post.id} style={{ background:'rgba(255,255,255,.03)', borderRadius:10, padding:'.75rem 1rem', borderLeft:`3px solid ${post.status === 'active' ? '#e63946' : 'rgba(255,255,255,.15)'}`, display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, flexWrap:'wrap' }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:14, marginBottom:2, color: post.status === 'active' ? '#fff' : 'rgba(255,255,255,.4)' }}>{post.title}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,.35)' }}>
                    {new Date(post.created_at).toLocaleDateString('fr-CH', { day:'numeric', month:'short', year:'numeric' })}
                    {post.ligue ? ` · ${post.ligue}` : ''}{post.zone ? ` · ${post.zone}` : ''}
                  </div>
                </div>
                <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                  {post.status === 'active' && (
                    <button onClick={() => setEditingPost(post)} style={{ background:'rgba(58,140,255,.15)', color:'#3a8cff', border:'1px solid rgba(58,140,255,.3)', borderRadius:7, padding:'4px 9px', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>✏️</button>
                  )}
                  <button
                    onClick={async () => {
                      if (!confirm('Supprimer ce post ?')) return
                      const { error } = await supabase.from('annonces').delete().eq('id', post.id).eq('author_id', profile.id)
                      if (error) { alert('Erreur: ' + error.message); return }
                      setMyPosts(prev => prev.filter(p => p.id !== post.id))
                    }}
                    style={{ background:'rgba(230,57,70,.12)', color:'#e63946', border:'1px solid rgba(230,57,70,.3)', borderRadius:7, padding:'4px 9px', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}
                  >🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PUNTI FORTI — moved to header, edit via Modifier */}

      {/* ── EDIT FORM (new layout) ── */}
      {editing && (
        <div style={{ marginBottom:'1.25rem' }}>
          <ProfileEditForm
            profile={profile}
            lang={lang}
            onSaved={async (updated, silent) => {
              setProfile(updated)
              if (!silent) {
                setEditing(false)
                setSaveMsg(t.profil.saved[lang])
                setTimeout(() => setSaveMsg(''), 3000)
              }
              await refreshProfile()
            }}
            onCancel={() => setEditing(false)}
          />
        </div>
      )}

      {/* ── MAIN GRID ── */}
      <div className="profile-grid">

        {/* LEFT — Bio + Videos */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

          <div style={darkCard}>
            <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.2rem', letterSpacing:1, marginBottom:'1rem', paddingBottom:'.75rem', borderBottom:'1px solid rgba(255,255,255,.08)' }}>
              {t.profil.about[lang]}
            </div>
            {profile.bio
              ? <p style={{ fontSize:14, color:'rgba(255,255,255,.65)', lineHeight:1.7 }}>{profile.bio}</p>
              : <p style={{ fontSize:14, color:'rgba(255,255,255,.4)', fontStyle:'italic' }}>
                  {t.profil.no_bio[lang]}{' '}
                  <button onClick={() => setEditing(true)} style={{ color:'#3a8cff', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:14 }}>{t.profil.add_bio[lang]}</button>
                </p>
            }
          </div>

          {profile.role !== 'club' && (
            <div style={darkCard}>
            <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.2rem', letterSpacing:1, marginBottom:'1rem', paddingBottom:'.75rem', borderBottom:'1px solid rgba(255,255,255,.08)' }}>
              {t.profil.highlights[lang]}
            </div>
            {videoUrls.length === 0 ? (
              <div style={{ background:'rgba(255,255,255,.03)', borderRadius:12, padding:'2rem', textAlign:'center', border:'2px dashed rgba(255,255,255,.12)' }}>
                <div style={{ fontSize:14, color:'rgba(255,255,255,.4)' }}>🎬 {t.profil.video_soon[lang]}</div>
                <button onClick={() => setEditing(true)} style={{ marginTop:'.75rem', color:'#3a8cff', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:600 }}>
                  {t.profil.edit_videos[lang]} →
                </button>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                {videoUrls.map((url, i) => {
                  const embed = getYouTubeEmbed(url)
                  const isNativeVideo = !embed && /\.(mp4|mov|webm|mkv|avi)(\?|$)/i.test(url)
                  if (embed) return (
                    <div key={i} style={{ position:'relative', paddingBottom:'56.25%', borderRadius:12, overflow:'hidden', background:'#000' }}>
                      <iframe src={embed} title={`Video ${i+1}`} frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%' }} />
                    </div>
                  )
                  if (isNativeVideo) return (
                    <div key={i} style={{ borderRadius:12, overflow:'hidden', background:'#000' }}>
                      <video src={url} controls playsInline style={{ width:'100%', maxHeight:360, display:'block', objectFit:'cover' }} />
                    </div>
                  )
                  return (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                      style={{ display:'flex', alignItems:'center', gap:8, padding:'.75rem', background:'rgba(255,255,255,.05)', borderRadius:10, textDecoration:'none', color:'#3a8cff', fontSize:14, fontWeight:600 }}>
                      🎬 {t.profil.video_label[lang]} {i+1}
                    </a>
                  )
                })}
              </div>
            )}
          </div>
          )}

        </div>

        {/* RIGHT SIDEBAR — Info · Career · Actions · Tip */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

          {/* Informations */}
          <div style={darkCard}>
            {profile.available && (
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(13,122,54,.2)', color:'#4cdb7a', fontSize:13, fontWeight:600, padding:'6px 14px', borderRadius:100, marginBottom:'1rem' }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:'#4cdb7a' }} />
                {t.profil.available_badge[lang]}
              </div>
            )}
            <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.1rem', letterSpacing:1, marginBottom:'1rem' }}>{t.profil.info[lang]}</div>
            {infoRows.filter((item): item is [string, string] => Array.isArray(item)).map(([k, v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,.07)', fontSize:14 }}>
                <span style={{ color:'rgba(255,255,255,.5)' }}>{k}</span>
                <span style={{ fontWeight:600, maxWidth:'60%', textAlign:'right', wordBreak:'break-all', color:'#fff' }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Actions rapides */}
          <div style={darkCard}>
            <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.1rem', letterSpacing:1, marginBottom:'1rem' }}>{t.profil.actions[lang]}</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <Link href="/recherche" style={{ background:'#e63946', color:'#fff', border:'none', borderRadius:8, padding:'9px 16px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', textDecoration:'none', textAlign:'center', display:'block' }}>{t.profil.search_clubs[lang]}</Link>
              <Link href="/messages" style={{ background:'rgba(255,255,255,.08)', color:'rgba(255,255,255,.75)', border:'1px solid rgba(255,255,255,.15)', borderRadius:8, padding:'9px 16px', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', textDecoration:'none', textAlign:'center', display:'block' }}>{t.profil.my_msgs[lang]}</Link>
              <Link href="/candidatures" style={{ background:'rgba(255,255,255,.08)', color:'rgba(255,255,255,.75)', border:'1px solid rgba(255,255,255,.15)', borderRadius:8, padding:'9px 16px', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', textDecoration:'none', textAlign:'center', display:'block' }}>{t.profil.my_cands[lang]}</Link>
            </div>
          </div>

          {/* Conseil */}
          <div style={{ ...darkCard, background:'rgba(58,140,255,.08)', border:'1px solid rgba(58,140,255,.25)' }}>
            <div style={{ fontSize:13, color:'#3a8cff', fontWeight:600, marginBottom:'.5rem' }}>{t.profil.conseil[lang]}</div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,.55)', lineHeight:1.6 }}>{t.profil.conseil_text[lang]}</div>
            <button onClick={() => setEditing(true)} style={{ marginTop:'.75rem', width:'100%', background:'#e63946', color:'#fff', border:'none', borderRadius:8, padding:'9px 16px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
              {t.profil.complete[lang]}
            </button>
          </div>
        </div>
      </div>


      <style>{`
        .profile-grid { display: grid; grid-template-columns: 1fr 300px; gap: 1.25rem; }
        @media (max-width: 720px) { .profile-grid { grid-template-columns: 1fr; } }
      `}</style>
      </div>
    </div>
  )
}
