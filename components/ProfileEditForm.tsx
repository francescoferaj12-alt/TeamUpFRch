'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { supabase, Profile } from '../lib/supabase'
import { t, months, Lang } from '../lib/translations'
import { liguesHomme, liguesFemme } from '../lib/data'

const VideoUploadInput = dynamic(() => import('./VideoUploadInput'), { ssr: false })

const POSITIONS = ['Attaquant','Milieu offensif','Milieu défensif','Défenseur central','Défenseur latéral','Gardien']
const ZONES = ['Fribourg-Ville','Gruyère','Broye','Glâne','Sensebezirk','Veveyse','Lac']

// ── Role-specific strength tags (mirrored from profil/page.tsx) ──────────────
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

const COACH_ROLES = ['Entraîneur principal','Entraîneur assistant','Préparateur physique','Entraîneur des gardiens']
const UEFA_LICENCES = ['Aucune','UEFA C','UEFA B','UEFA A','UEFA Pro','BBaby','BFut','Diplôme CFE']
const LEVELS = ['beginner','amateur','confirmed','experienced'] as const

const CATEGORIES = [
  'cat_seniors_h','cat_seniors_f','cat_youth','cat_juniors_a','cat_juniors_b','cat_juniors_c','cat_juniors_d','cat_juniores_f','cat_veterans',
] as const

const Svg = ({ children, size = 18, ...p }: any) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    {children}
  </svg>
)
const IcoX      = ({ s = 12 }: { s?: number }) => <Svg size={s}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Svg>
const IcoWarn   = ({ s = 13 }: { s?: number }) => <Svg size={s}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></Svg>
const IcoGlobe  = ({ s = 12 }: { s?: number }) => <Svg size={s}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></Svg>
const IcoCamera = ({ s = 12 }: { s?: number }) => <Svg size={s}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></Svg>
const IcoPhone  = ({ s = 12 }: { s?: number }) => <Svg size={s}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.59a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></Svg>
const IcoMail   = ({ s = 12 }: { s?: number }) => <Svg size={s}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></Svg>
const IcoChat   = ({ s = 12 }: { s?: number }) => <Svg size={s}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></Svg>
const IcoBook   = ({ s = 12 }: { s?: number }) => <Svg size={s}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></Svg>
const IcoVideo  = ({ s = 12 }: { s?: number }) => <Svg size={s}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></Svg>
const IcoGrad   = ({ s = 16 }: { s?: number }) => <Svg size={s} stroke="rgba(255,255,255,.6)"><path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></Svg>

function getStrengthsByRole(role: string) {
  if (role === 'coach') return STRENGTHS_COACH
  if (role === 'club') return STRENGTHS_CLUB
  return STRENGTHS_PLAYER
}

function parseList(raw?: string): string[] {
  if (!raw) return []
  return raw.split(',').map(s => s.trim()).filter(Boolean)
}

function parseBirthdate(birthdate?: string) {
  if (!birthdate) return { day: '', month: '', year: '' }
  const [y, m, d] = birthdate.split('-')
  return { day: String(parseInt(d)), month: String(parseInt(m)), year: y }
}

// ── Tiny markdown for preview ────────────────────────────────────────────────
function renderMarkdown(text: string): string {
  if (!text) return ''
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  // bold **text**
  let out = escaped.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
  // italic *text*
  out = out.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>')
  // bullets
  out = out.replace(/(^|\n)[-•] (.+)/g, '$1• $2')
  return out
}

// ── Char-counter zones ────────────────────────────────────────────────
function charZone(n: number, lang: Lang) {
  if (n < 100)  return { color: '#FF3A3A', msg: t.profil.char_too_short[lang],  pct: Math.min(n/1500,1) }
  if (n < 300)  return { color: '#FF9A3A', msg: t.profil.char_keep_going[lang], pct: Math.min(n/1500,1) }
  if (n <= 800) return { color: '#2ED27F', msg: t.profil.char_perfect[lang],    pct: Math.min(n/1500,1) }
  if (n <= 1000)return { color: '#FF9A3A', msg: t.profil.char_almost_max[lang], pct: Math.min(n/1500,1) }
  return            { color: '#FF3A3A', msg: t.profil.char_too_long[lang],  pct: Math.min(n/1500,1) }
}

// ── Completion calculation ────────────────────────────────────────────
function computeCompletion(p: Partial<Profile> & Record<string, any>): number {
  const role = p.role
  const checks: boolean[] = [
    !!p.avatar_url,
    !!(p.bio && p.bio.length > 50),
    !!p.zone,
    !!p.phone,
    !!p.strengths,
    !!p.available,
  ]
  if (role === 'club') {
    checks.push(!!p.club_name, !!p.first_name, !!p.last_name, !!p.ligue,
      !!p.club_founded_year, !!p.club_teams_count, !!p.club_stadium_name,
      !!p.club_categories, !!p.club_website)
  } else if (role === 'coach') {
    checks.push(!!p.first_name, !!p.last_name, !!p.birthdate,
      !!p.coach_specialty, !!p.coach_diploma, !!p.coach_experience,
      !!p.coach_categories, !!p.coach_philosophy, !!p.coach_certificates)
  } else {
    checks.push(!!p.first_name, !!p.last_name, !!p.birthdate, !!p.position,
      !!p.foot, !!p.ligue, !!p.level)
  }
  const done = checks.filter(Boolean).length
  return Math.round(done / checks.length * 100)
}

// ── Section wrapper with collapse ─────────────────────────────────────
type SectionProps = {
  title: string
  desc?: string
  children: React.ReactNode
  defaultOpen?: boolean
  lang: Lang
}
function Section({ title, desc, children, defaultOpen = true, lang }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="form-section">
      <div className="form-section-header">
        <div>
          <div className="form-section-label">{title}</div>
          <div className="form-section-title">{title}</div>
          {desc && <div className="form-section-desc">{desc}</div>}
        </div>
        <button
          type="button"
          className="form-section-toggle"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? t.profil.collapse[lang] : t.profil.expand[lang]}
        >
          {open ? '▲' : '▼'}
        </button>
      </div>
      {open && children}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────
type Props = {
  profile: Profile
  lang: Lang
  onSaved: (updated: Profile, silent: boolean) => void
  onCancel: () => void
}
export default function ProfileEditForm({ profile, lang, onSaved, onCancel }: Props) {
  // ── State (every existing + new field) ───────────────────────────
  const [bio, setBio] = useState(profile.bio || '')
  const [position, setPosition] = useState(profile.position || '')
  const [positionSecondary, setPositionSecondary] = useState((profile as any).position_secondary || '')
  const [genre, setGenre] = useState<'homme'|'femme'>(profile.genre || 'homme')
  const [ligue, setLigue] = useState(profile.ligue || '')
  const [zone, setZone] = useState(profile.zone || '')
  const [foot, setFoot] = useState(profile.foot || 'Droit')
  const [available, setAvailable] = useState(profile.available ?? true)
  const [phone, setPhone] = useState(profile.phone || '')
  const [career, setCareer] = useState(profile.career || '')
  const initBd = parseBirthdate(profile.birthdate)
  const [birthDay, setBirthDay] = useState(initBd.day)
  const [birthMonth, setBirthMonth] = useState(initBd.month)
  const [birthYear, setBirthYear] = useState(initBd.year)
  const [goals, setGoals] = useState(profile.goals != null ? String(profile.goals) : '')
  const [assists, setAssists] = useState(profile.assists != null ? String(profile.assists) : '')
  const [matches, setMatches] = useState(profile.matches != null ? String(profile.matches) : '')
  const [goalsPrev, setGoalsPrev] = useState(profile.goals_prev != null ? String(profile.goals_prev) : '')
  const [assistsPrev, setAssistsPrev] = useState(profile.assists_prev != null ? String(profile.assists_prev) : '')
  const [matchesPrev, setMatchesPrev] = useState(profile.matches_prev != null ? String(profile.matches_prev) : '')
  const [selectedStrengths, setSelectedStrengths] = useState<string[]>(parseList(profile.strengths))
  const [video1, setVideo1] = useState(profile.video1_url || '')
  const [video2, setVideo2] = useState(profile.video2_url || '')
  const [video3, setVideo3] = useState(profile.video3_url || '')
  const [coachExperience, setCoachExperience] = useState(profile.coach_experience || '')
  const [coachDiploma, setCoachDiploma] = useState(profile.coach_diploma || '')
  const [coachSpecialty, setCoachSpecialty] = useState(profile.coach_specialty || '')
  const [coachAvailability, setCoachAvailability] = useState(profile.coach_availability || '')
  const [coachCategories, setCoachCategories] = useState<string[]>(parseList((profile as any).coach_categories))
  const [coachPhilosophy, setCoachPhilosophy] = useState((profile as any).coach_philosophy || '')
  const [coachCertificates, setCoachCertificates] = useState<{name:string;year:string}[]>([])
  const [newCertName, setNewCertName] = useState('')
  const [newCertYear, setNewCertYear] = useState('')
  const [clubWebsite, setClubWebsite] = useState(profile.club_website || '')
  const [clubInstagram, setClubInstagram] = useState(profile.club_instagram || '')
  const [clubFacebook, setClubFacebook] = useState(profile.club_facebook || '')
  const [clubWhatsapp, setClubWhatsapp] = useState(profile.club_whatsapp || '')
  const [clubPhonePublic, setClubPhonePublic] = useState(profile.club_phone_public || '')
  const [clubEmailPublic, setClubEmailPublic] = useState(profile.club_email_public || '')
  const [clubName, setClubName] = useState(profile.club_name || '')
  const [firstName, setFirstName] = useState(profile.first_name || '')
  const [lastName, setLastName] = useState(profile.last_name || '')
  const [jerseyNumber, setJerseyNumber] = useState((profile as any).jersey_number != null ? String((profile as any).jersey_number) : '')
  const [heightCm, setHeightCm] = useState((profile as any).height_cm != null ? String((profile as any).height_cm) : '')
  const [level, setLevel] = useState((profile as any).level || '')
  const [clubFoundedYear, setClubFoundedYear] = useState((profile as any).club_founded_year != null ? String((profile as any).club_founded_year) : '')
  const [clubTeamsCount, setClubTeamsCount] = useState((profile as any).club_teams_count != null ? String((profile as any).club_teams_count) : '')
  const [clubStadiumName, setClubStadiumName] = useState((profile as any).club_stadium_name || '')
  const [clubStadiumAddress, setClubStadiumAddress] = useState((profile as any).club_stadium_address || '')
  const [clubColorPrimary, setClubColorPrimary] = useState((profile as any).club_color_primary || '#FF3A3A')
  const [clubColorSecondary, setClubColorSecondary] = useState((profile as any).club_color_secondary || '#ffffff')
  const [clubCategories, setClubCategories] = useState<string[]>(parseList((profile as any).club_categories))

  // ── About: edit/preview tab ──────────────────────────────────────
  const [bioTab, setBioTab] = useState<'edit'|'preview'>('edit')
  const bioRef = useRef<HTMLTextAreaElement>(null)

  // ── Save state (used both by manual & autosave) ──────────────────
  const [saveStatus, setSaveStatus] = useState<'idle'|'saving'|'saved'|'error'>('idle')
  const [saveError, setSaveError] = useState('')
  const [hasChanges, setHasChanges] = useState(false)
  const dirtyRef = useRef(false)
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Prevent cert load from triggering autosave
  const skipCertDirty = useRef(0)

  // Load coach certificates from the proper table on mount
  useEffect(() => {
    if (profile.role !== 'coach') return
    supabase
      .from('coach_certificates')
      .select('name,year')
      .eq('coach_id', profile.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          skipCertDirty.current++
          setCoachCertificates(data.map(c => ({ name: c.name, year: c.year || '' })))
        }
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.id])

  // Once any setter is called (excluding initial render), mark dirty
  // We do this by watching all values.
  useEffect(() => {
    if (!dirtyRef.current) { dirtyRef.current = true; return }
    if (skipCertDirty.current > 0) { skipCertDirty.current--; return }
    setHasChanges(true)
    setSaveStatus('idle')
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
    autosaveTimerRef.current = setTimeout(() => { void doSave(true) }, 2000)
    return () => { if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bio, position, positionSecondary, genre, ligue, zone, foot, available, phone, career,
      birthDay, birthMonth, birthYear, goals, assists, matches, goalsPrev, assistsPrev, matchesPrev,
      selectedStrengths, video1, video2, video3, coachExperience, coachDiploma, coachSpecialty,
      coachAvailability, coachCategories, coachPhilosophy, coachCertificates, clubWebsite, clubInstagram, clubFacebook,
      clubWhatsapp, clubPhonePublic, clubEmailPublic, clubName, firstName, lastName, jerseyNumber,
      heightCm, level, clubFoundedYear, clubTeamsCount, clubStadiumName, clubStadiumAddress,
      clubColorPrimary, clubColorSecondary, clubCategories])

  // ── Build the update payload ─────────────────────────────────────
  function buildPayload() {
    const birthdate = birthDay && birthMonth && birthYear
      ? `${birthYear}-${birthMonth.padStart(2,'0')}-${birthDay.padStart(2,'0')}`
      : null
    const base: Record<string, any> = {
      first_name: firstName || null,
      last_name: lastName || null,
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
    if (profile.role === 'club') {
      base.club_name = clubName || null
      if (clubName && clubName !== profile.club_name) {
        base.verified = false
        base.verification_requested = false
      }
    }
    const ext: Record<string, any> = {
      goals_prev: goalsPrev !== '' ? parseInt(goalsPrev) : null,
      assists_prev: assistsPrev !== '' ? parseInt(assistsPrev) : null,
      matches_prev: matchesPrev !== '' ? parseInt(matchesPrev) : null,
      strengths: selectedStrengths.join(',') || null,
      video1_url: video1 || null,
      video2_url: video2 || null,
      video3_url: video3 || null,
    }
    if (profile.role === 'player') {
      ext.position_secondary = positionSecondary || null
      ext.jersey_number = jerseyNumber !== '' ? parseInt(jerseyNumber) : null
      ext.height_cm = heightCm !== '' ? parseInt(heightCm) : null
      ext.level = level || null
    }
    if (profile.role === 'coach') {
      ext.coach_experience = coachExperience || null
      ext.coach_diploma = coachDiploma || null
      ext.coach_specialty = coachSpecialty || null
      ext.coach_availability = coachAvailability || null
      ext.coach_categories = coachCategories.join(',') || null
      ext.coach_philosophy = coachPhilosophy || null
    }
    if (profile.role === 'club') {
      ext.club_website = clubWebsite || null
      ext.club_instagram = clubInstagram || null
      ext.club_facebook = clubFacebook || null
      ext.club_whatsapp = clubWhatsapp || null
      ext.club_phone_public = clubPhonePublic || null
      ext.club_email_public = clubEmailPublic || null
      ext.club_founded_year = clubFoundedYear !== '' ? parseInt(clubFoundedYear) : null
      ext.club_teams_count = clubTeamsCount !== '' ? parseInt(clubTeamsCount) : null
      ext.club_stadium_name = clubStadiumName || null
      ext.club_stadium_address = clubStadiumAddress || null
      ext.club_color_primary = clubColorPrimary || null
      ext.club_color_secondary = clubColorSecondary || null
      ext.club_categories = clubCategories.join(',') || null
    }
    return { base, ext }
  }

  const savingRef = useRef(false)

  async function doSave(silent: boolean) {
    if (!hasChanges && silent) return
    if (savingRef.current) return
    savingRef.current = true
    setSaveStatus('saving')
    setSaveError('')
    try {
      const { base, ext } = buildPayload()
      const { error: e1 } = await supabase.from('profiles').update(base).eq('id', profile.id)
      if (e1) {
        setSaveStatus('error')
        setSaveError([e1.message, e1.details, e1.hint].filter(Boolean).join(' — '))
        return
      }
      const { error: e2 } = await supabase.from('profiles').update(ext).eq('id', profile.id)
      if (e2 && !silent) {
        setSaveStatus('error')
        setSaveError([e2.message, e2.details, e2.hint].filter(Boolean).join(' — '))
        return
      }
      // Sync coach certificates — delete all then re-insert current list
      if (profile.role === 'coach') {
        await supabase.from('coach_certificates').delete().eq('coach_id', profile.id)
        if (coachCertificates.length > 0) {
          await supabase.from('coach_certificates').insert(
            coachCertificates.map(c => ({ coach_id: profile.id, name: c.name, year: c.year || null }))
          )
        }
      }
      setHasChanges(false)
      setSaveStatus('saved')
      onSaved({ ...profile, ...base, ...ext } as Profile, silent)
      if (silent) {
        setTimeout(() => setSaveStatus(s => s === 'saved' ? 'idle' : s), 2200)
      }
    } finally {
      savingRef.current = false
    }
  }

  // ── Toggles & helpers ────────────────────────────────────────────
  function toggleStrength(key: string) {
    setSelectedStrengths(prev => prev.includes(key) ? prev.filter(k => k !== key) : (prev.length >= 5 ? prev : [...prev, key]))
  }
  function toggleInList(list: string[], setter: (v: string[]) => void, key: string) {
    setter(list.includes(key) ? list.filter(k => k !== key) : [...list, key])
  }
  function appendQuestion(q: string) {
    const insert = `**${q}**\n`
    const next = bio ? `${bio.trim()}\n\n${insert}` : insert
    setBio(next)
    setTimeout(() => bioRef.current?.focus(), 0)
  }

  // ── Derived values ───────────────────────────────────────────────
  const completion = useMemo(() => computeCompletion({
    ...profile,
    avatar_url: profile.avatar_url, bio, zone, phone, strengths: selectedStrengths.join(','), available,
    first_name: firstName, last_name: lastName, club_name: clubName, ligue, position, foot, level,
    birthdate: birthDay && birthMonth && birthYear ? `${birthYear}-${birthMonth}-${birthDay}` : '',
    coach_specialty: coachSpecialty, coach_diploma: coachDiploma, coach_experience: coachExperience,
    coach_categories: coachCategories.join(','), coach_philosophy: coachPhilosophy,
    coach_certificates: coachCertificates.length > 0 ? 'yes' : null,
    club_founded_year: clubFoundedYear as any, club_teams_count: clubTeamsCount as any,
    club_stadium_name: clubStadiumName, club_categories: clubCategories.join(','), club_website: clubWebsite,
  }), [profile, bio, zone, phone, selectedStrengths, available, firstName, lastName, clubName,
       ligue, position, foot, level, birthDay, birthMonth, birthYear, coachSpecialty, coachDiploma,
       coachExperience, coachCategories, coachPhilosophy, coachCertificates, clubFoundedYear, clubTeamsCount,
       clubStadiumName, clubCategories, clubWebsite])

  const charInfo = charZone(bio.length, lang)
  const role = profile.role
  const roleStrengths = getStrengthsByRole(role)
  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 55 }, (_, i) => currentYear - 14 - i)
  const MONTHS = months[lang]

  const guidedQuestions = role === 'coach'
    ? [t.profil.about_q_coach_1, t.profil.about_q_coach_2, t.profil.about_q_coach_3, t.profil.about_q_coach_4, t.profil.about_q_coach_5]
    : role === 'club'
    ? [t.profil.about_q_club_1, t.profil.about_q_club_2, t.profil.about_q_club_3, t.profil.about_q_club_4, t.profil.about_q_club_5]
    : [t.profil.about_q_player_1, t.profil.about_q_player_2, t.profil.about_q_player_3, t.profil.about_q_player_4, t.profil.about_q_player_5]

  // ── Sub-renders ──────────────────────────────────────────────────
  function renderIdentity() {
    if (role === 'club') {
      return (
        <Section title={t.profil.sec_identity_club[lang]} desc={t.profil.sec_identity_club_desc[lang]} lang={lang}>
          <div className="form-grid">
            <div className="form-group form-grid-full">
              <label>{t.profil.club_society_name[lang]}</label>
              <input type="text" value={clubName} onChange={e => setClubName(e.target.value)} placeholder="FC Mon Club" />
              {clubName && clubName !== profile.club_name && (
                <div className="field-help" style={{ color:'#FF9A3A', display:'flex', alignItems:'center', gap:5 }}><IcoWarn s={13} /> {lang === 'fr' ? 'Le statut « vérifié » sera réinitialisé.' : 'Der „verifiziert"-Status wird zurückgesetzt.'}</div>
              )}
            </div>
            <div className="form-group">
              <label>{t.profil.club_founded_year[lang]}</label>
              <input type="number" min="1850" max={String(currentYear)} value={clubFoundedYear} onChange={e => setClubFoundedYear(e.target.value)} placeholder="1924" />
            </div>
            <div className="form-group">
              <label>{t.profil.club_teams_count[lang]}</label>
              <input type="number" min="0" value={clubTeamsCount} onChange={e => setClubTeamsCount(e.target.value)} placeholder="6" />
            </div>
            <div className="form-group">
              <label>{t.profil.club_color_primary[lang]}</label>
              <input type="color" value={clubColorPrimary} onChange={e => setClubColorPrimary(e.target.value)} />
            </div>
            <div className="form-group">
              <label>{t.profil.club_color_secondary[lang]}</label>
              <input type="color" value={clubColorSecondary} onChange={e => setClubColorSecondary(e.target.value)} />
            </div>
          </div>
        </Section>
      )
    }
    return (
      <Section title={t.profil.sec_identity[lang]} desc={t.profil.sec_identity_desc[lang]} lang={lang}>
        <div className="form-grid">
          <div className="form-group">
            <label>{t.login.firstname[lang]}</label>
            <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Jean" />
          </div>
          <div className="form-group">
            <label>{t.login.lastname[lang]}</label>
            <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Dupont" />
          </div>
          <div className="form-group form-grid-full">
            <label>{t.profil.genre_label[lang]}</label>
            <div style={{ display:'flex', gap:8 }}>
              {(['homme','femme'] as const).map(g => (
                <button key={g} type="button" onClick={() => { setGenre(g); setLigue('') }}
                  className="pe-multi-chip" style={{ flex:1, ...(genre === g ? { borderColor:'#FF3A3A', background:'rgba(255,58,58,0.2)', color:'white' } : {}) }}>
                  {g === 'homme' ? t.profil.genre_homme[lang] : t.profil.genre_femme[lang]}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group form-grid-full">
            <label>{t.profil.birthdate[lang]}</label>
            <div className="form-grid-3">
              <select value={birthDay} onChange={e => setBirthDay(e.target.value)}>
                <option value="">{t.profil.day[lang]}</option>
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={birthMonth} onChange={e => setBirthMonth(e.target.value)}>
                <option value="">{t.profil.month[lang]}</option>
                {MONTHS.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
              </select>
              <select value={birthYear} onChange={e => setBirthYear(e.target.value)}>
                <option value="">{t.profil.year[lang]}</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </div>
      </Section>
    )
  }

  function renderResponsable() {
    if (role !== 'club') return null
    return (
      <Section title={t.profil.sec_responsable[lang]} desc={t.profil.sec_responsable_desc[lang]} defaultOpen={false} lang={lang}>
        <div className="form-grid">
          <div className="form-group">
            <label>{t.profil.club_responsible_first[lang]}</label>
            <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Jean" />
          </div>
          <div className="form-group">
            <label>{t.profil.club_responsible_last[lang]}</label>
            <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Dupont" />
          </div>
          <div className="form-group form-grid-full">
            <label>{t.profil.phone[lang]}</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+41 79 000 00 00" />
            <div className="field-help">{lang === 'fr' ? 'Numéro privé du responsable, non public.' : 'Private Nummer des Verantwortlichen, nicht öffentlich.'}</div>
          </div>
        </div>
      </Section>
    )
  }

  function renderSportProfile() {
    if (role === 'player') {
      return (
        <Section title={t.profil.sec_sport_player[lang]} desc={t.profil.sec_sport_player_desc[lang]} lang={lang}>
          <div className="form-grid">
            <div className="form-group">
              <label>{t.profil.position[lang]}</label>
              <select value={position} onChange={e => setPosition(e.target.value)}>
                <option value="">—</option>
                {POSITIONS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>{t.profil.position_secondary[lang]}</label>
              <select value={positionSecondary} onChange={e => setPositionSecondary(e.target.value)}>
                <option value="">—</option>
                {POSITIONS.map(p => <option key={p}>{p}</option>)}
              </select>
              <div className="field-help">{t.profil.position_secondary_help[lang]}</div>
            </div>
            <div className="form-group">
              <label>{t.profil.foot[lang]}</label>
              <select value={foot} onChange={e => setFoot(e.target.value)}>
                <option value="Droit">{t.login.right[lang]}</option>
                <option value="Gauche">{t.login.left[lang]}</option>
                <option value="Ambidextre">{t.login.both[lang]}</option>
              </select>
            </div>
            <div className="form-group">
              <label>{t.profil.jersey_number[lang]}</label>
              <input type="number" min="1" max="99" value={jerseyNumber} onChange={e => setJerseyNumber(e.target.value)} placeholder="9" />
            </div>
            <div className="form-group">
              <label>{t.profil.height_cm[lang]}</label>
              <input type="number" min="120" max="220" value={heightCm} onChange={e => setHeightCm(e.target.value)} placeholder="178" />
            </div>
            <div className="form-group">
              <label>{t.profil.level[lang]}</label>
              <select value={level} onChange={e => setLevel(e.target.value)}>
                <option value="">—</option>
                {LEVELS.map(lv => <option key={lv} value={lv}>{(t.profil as any)[`level_${lv}`][lang]}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>{t.profil.ligue[lang]}</label>
              <select value={ligue} onChange={e => setLigue(e.target.value)}>
                <option value="">—</option>
                {(genre === 'homme' ? liguesHomme : liguesFemme).map(g => (
                  <optgroup key={g.group} label={g.group}>
                    {g.items.map(l => <option key={l}>{l}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>{t.profil.zone[lang]}</label>
              <select value={zone} onChange={e => setZone(e.target.value)}>
                <option value="">—</option>
                {ZONES.map(z => <option key={z}>{z}</option>)}
              </select>
            </div>
          </div>
        </Section>
      )
    }
    if (role === 'coach') {
      return (
        <Section title={t.profil.sec_sport_coach[lang]} desc={t.profil.sec_sport_coach_desc[lang]} lang={lang}>
          <div className="form-grid">
            <div className="form-group">
              <label>{t.profil.coach_role[lang]}</label>
              <select value={coachSpecialty} onChange={e => setCoachSpecialty(e.target.value)}>
                <option value="">—</option>
                {COACH_ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>{t.profil.coach_licence[lang]}</label>
              <select value={coachDiploma} onChange={e => setCoachDiploma(e.target.value)}>
                <option value="">—</option>
                {UEFA_LICENCES.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>{t.profil.coach_years[lang]}</label>
              <select value={coachExperience} onChange={e => setCoachExperience(e.target.value)}>
                <option value="">—</option>
                {['Débutant','1-3 ans','3-5 ans','5-10 ans','10+ ans'].map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>{t.profil.dispo[lang]}</label>
              <select value={coachAvailability} onChange={e => setCoachAvailability(e.target.value)}>
                <option value="">—</option>
                {['Cherche un club','En poste actuellement','Pas disponible'].map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>{t.profil.zone[lang]}</label>
              <select value={zone} onChange={e => setZone(e.target.value)}>
                <option value="">—</option>
                {ZONES.map(z => <option key={z}>{z}</option>)}
              </select>
            </div>
            <div className="form-group form-grid-full">
              <label>{t.profil.coach_categories[lang]}</label>
              <div className="pe-multi">
                {CATEGORIES.map(c => (
                  <button key={c} type="button"
                    className={`pe-multi-chip ${coachCategories.includes(c) ? 'active' : ''}`}
                    onClick={() => toggleInList(coachCategories, setCoachCategories, c)}>
                    {(t.profil as any)[c][lang]}
                  </button>
                ))}
              </div>
              <div className="field-help">{t.profil.coach_categories_help[lang]}</div>
            </div>
          </div>
        </Section>
      )
    }
    // Club: ligue + zone fall here
    return (
      <Section title={t.profil.sec_infra[lang]} desc={t.profil.sec_infra_desc[lang]} lang={lang}>
        <div className="form-grid">
          <div className="form-group">
            <label>{t.profil.ligue[lang]}</label>
            <select value={ligue} onChange={e => setLigue(e.target.value)}>
              <option value="">—</option>
              {[...liguesHomme, ...liguesFemme].map(g => (
                <optgroup key={g.group} label={g.group}>
                  {g.items.map(l => <option key={l}>{l}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>{t.profil.zone[lang]}</label>
            <select value={zone} onChange={e => setZone(e.target.value)}>
              <option value="">—</option>
              {ZONES.map(z => <option key={z}>{z}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>{t.profil.club_stadium_name[lang]}</label>
            <input type="text" value={clubStadiumName} onChange={e => setClubStadiumName(e.target.value)} placeholder="Stade Saint-Léonard" />
          </div>
          <div className="form-group">
            <label>{t.profil.club_stadium_address[lang]}</label>
            <input type="text" value={clubStadiumAddress} onChange={e => setClubStadiumAddress(e.target.value)} placeholder="Route de Berne 12, 1700 Fribourg" />
          </div>
          <div className="form-group form-grid-full">
            <label>{t.profil.club_categories[lang]}</label>
            <div className="pe-multi">
              {CATEGORIES.map(c => (
                <button key={c} type="button"
                  className={`pe-multi-chip ${clubCategories.includes(c) ? 'active' : ''}`}
                  onClick={() => toggleInList(clubCategories, setClubCategories, c)}>
                  {(t.profil as any)[c][lang]}
                </button>
              ))}
            </div>
            <div className="field-help">{t.profil.club_categories_help[lang]}</div>
          </div>
        </div>
      </Section>
    )
  }

  function renderStats() {
    if (role !== 'player') return null
    return (
      <Section title={t.profil.sec_stats[lang]} desc={t.profil.sec_stats_desc[lang]} defaultOpen={false} lang={lang}>
        <div style={{ fontFamily:"'Russo One',sans-serif", fontSize:'1rem', letterSpacing:1, marginBottom:'.5rem', color:'#3A7AFF' }}>{t.profil.current_season[lang]}</div>
        <div className="form-grid-3" style={{ marginBottom:18 }}>
          {[
            { v: goals, set: setGoals, label: t.profil.goals[lang] },
            { v: assists, set: setAssists, label: t.profil.assists[lang] },
            { v: matches, set: setMatches, label: t.profil.matches[lang] },
          ].map(f => (
            <div key={f.label} className="form-group">
              <label>{f.label}</label>
              <input type="number" min="0" value={f.v} onChange={e => f.set(e.target.value)} placeholder="0" />
            </div>
          ))}
        </div>
        <div style={{ fontFamily:"'Russo One',sans-serif", fontSize:'1rem', letterSpacing:1, marginBottom:'.5rem', color:'rgba(255,255,255,0.45)' }}>{t.profil.prev_season[lang]}</div>
        <div className="form-grid-3">
          {[
            { v: goalsPrev, set: setGoalsPrev, label: t.profil.goals[lang] },
            { v: assistsPrev, set: setAssistsPrev, label: t.profil.assists[lang] },
            { v: matchesPrev, set: setMatchesPrev, label: t.profil.matches[lang] },
          ].map(f => (
            <div key={f.label} className="form-group">
              <label>{f.label}</label>
              <input type="number" min="0" value={f.v} onChange={e => f.set(e.target.value)} placeholder="0" />
            </div>
          ))}
        </div>
      </Section>
    )
  }

  function renderCertificates() {
    if (role !== 'coach') return null
    return (
      <Section
        title={lang === 'fr' ? 'Certificats & Diplômes' : 'Zertifikate & Diplome'}
        desc={lang === 'fr' ? 'Ajoute tes licences UEFA, diplômes SFV et autres certifications.' : 'Füge deine UEFA-Lizenzen, SFV-Diplome und andere Zertifikate hinzu.'}
        defaultOpen={false}
        lang={lang}
      >
        {/* Existing certificates */}
        {coachCertificates.length > 0 && (
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
            {coachCertificates.map((cert, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(58,140,255,.08)', border:'1px solid rgba(58,140,255,.2)', borderRadius:9, padding:'9px 14px' }}>
                <IcoGrad s={16} />
                <span style={{ flex:1, fontWeight:600, fontSize:14, color:'#fff' }}>{cert.name}</span>
                {cert.year && <span style={{ fontSize:12, color:'rgba(255,255,255,.45)', fontWeight:600 }}>{cert.year}</span>}
                <button
                  type="button"
                  onClick={() => setCoachCertificates(prev => prev.filter((_, j) => j !== i))}
                  style={{ background:'rgba(255,58,58,.12)', border:'1px solid rgba(255,58,58,.3)', color:'#FF3A3A', borderRadius:999, padding:'4px 10px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap:3 }}
                ><IcoX s={11} /></button>
              </div>
            ))}
          </div>
        )}

        {/* Add new certificate */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 100px auto', gap:8, alignItems:'end' }}>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label>{lang === 'fr' ? 'Nom du certificat' : 'Zertifikatname'}</label>
            <input
              value={newCertName}
              onChange={e => setNewCertName(e.target.value)}
              placeholder={lang === 'fr' ? 'Ex: UEFA B, UEFA Pro…' : 'z.B. UEFA B, UEFA Pro…'}
              onKeyDown={e => {
                if (e.key === 'Enter' && newCertName.trim()) {
                  e.preventDefault()
                  setCoachCertificates(prev => [...prev, { name: newCertName.trim(), year: newCertYear.trim() }])
                  setNewCertName(''); setNewCertYear('')
                }
              }}
            />
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label>{lang === 'fr' ? 'Année' : 'Jahr'}</label>
            <input
              value={newCertYear}
              onChange={e => setNewCertYear(e.target.value)}
              placeholder="2022"
              maxLength={4}
            />
          </div>
          <button
            type="button"
            disabled={!newCertName.trim()}
            onClick={() => {
              if (!newCertName.trim()) return
              setCoachCertificates(prev => [...prev, { name: newCertName.trim(), year: newCertYear.trim() }])
              setNewCertName(''); setNewCertYear('')
            }}
            style={{ height:42, background: newCertName.trim() ? 'rgba(58,122,255,.2)' : 'rgba(255,255,255,.05)', border:`1px solid ${newCertName.trim() ? 'rgba(58,122,255,.4)' : 'rgba(255,255,255,.1)'}`, color: newCertName.trim() ? '#7eb6ff' : 'rgba(255,255,255,.3)', borderRadius:999, padding:'0 16px', fontWeight:700, fontSize:14, cursor: newCertName.trim() ? 'pointer' : 'not-allowed', fontFamily:'inherit', whiteSpace:'nowrap', marginTop:20 }}
          >
            + {lang === 'fr' ? 'Ajouter' : 'Hinzufügen'}
          </button>
        </div>
      </Section>
    )
  }

  function renderAbout() {
    const aboutTitle = role === 'club' ? t.profil.sec_about_club[lang] : t.profil.sec_about[lang]
    const philosophyBlock = role === 'coach' && (
      <div className="form-group form-grid-full" style={{ marginBottom:18 }}>
        <label>{t.profil.coach_philosophy[lang]}</label>
        <textarea rows={2} value={coachPhilosophy} onChange={e => setCoachPhilosophy(e.target.value)} placeholder={t.profil.coach_philosophy_ph[lang]} />
      </div>
    )

    return (
      <Section
        title={role === 'coach' ? t.profil.sec_philosophy[lang] : aboutTitle}
        desc={role === 'coach' ? t.profil.sec_philosophy_desc[lang] : t.profil.sec_about_desc[lang]}
        lang={lang}
      >
        {philosophyBlock}

        {/* Edit / Preview tabs */}
        <div className="pe-tabs">
          <button type="button" className={`pe-tab ${bioTab === 'edit' ? 'active' : ''}`} onClick={() => setBioTab('edit')}>{t.profil.tab_edit[lang]}</button>
          <button type="button" className={`pe-tab ${bioTab === 'preview' ? 'active' : ''}`} onClick={() => setBioTab('preview')}>{t.profil.tab_preview[lang]}</button>
        </div>

        {bioTab === 'edit' && (
          <>
            <div className="pe-guided">
              <div className="pe-guided-label">{t.profil.about_guided_label[lang]}</div>
              <div className="pe-guided-chips">
                {guidedQuestions.map((q, i) => (
                  <button key={i} type="button" className="pe-guided-chip" onClick={() => appendQuestion(q[lang])}>
                    + {q[lang]}
                  </button>
                ))}
              </div>
            </div>

            {/* Tiny formatting toolbar */}
            <div style={{ display:'flex', gap:6, marginBottom:8 }}>
              <button type="button" className="pe-multi-chip" onMouseDown={e => { e.preventDefault(); wrapSelection('**','**') }}><strong>B</strong></button>
              <button type="button" className="pe-multi-chip" onMouseDown={e => { e.preventDefault(); wrapSelection('*','*') }}><em>I</em></button>
              <button type="button" className="pe-multi-chip" onMouseDown={e => { e.preventDefault(); prefixLine('- ') }}>•</button>
            </div>

            <div className="form-group">
              <label>{t.profil.bio_label[lang]}</label>
              <textarea
                ref={bioRef}
                rows={7}
                value={bio}
                onChange={e => setBio(e.target.value.slice(0, 1500))}
                placeholder={t.profil.bio_ph[lang]}
                maxLength={1500}
              />
              <div className="pe-charcount">
                <div className="pe-charcount-bar">
                  <div className="pe-charcount-fill" style={{ width: `${charInfo.pct * 100}%`, background: charInfo.color }} />
                </div>
                <div className="pe-charcount-msg" style={{ color: charInfo.color }}>
                  {bio.length} {t.profil.chars[lang]} · {charInfo.msg}
                </div>
              </div>
            </div>
          </>
        )}

        {bioTab === 'preview' && (
          <div className="pe-preview">
            {bio ? (
              <div dangerouslySetInnerHTML={{ __html: renderMarkdown(bio) }} />
            ) : (
              <span className="pe-preview-empty">{t.profil.preview_empty[lang]}</span>
            )}
          </div>
        )}

        {/* Strengths */}
        <div className="form-group" style={{ marginTop:18 }}>
          <label>{t.profil.strengths_label[lang]} <span style={{ color:'rgba(255,255,255,0.4)', fontWeight:500 }}>({selectedStrengths.length}/5)</span></label>
          <div className="pe-multi">
            {roleStrengths.map(s => {
              const active = selectedStrengths.includes(s.key)
              const disabled = !active && selectedStrengths.length >= 5
              return (
                <button key={s.key} type="button"
                  className={`pe-multi-chip ${active ? 'active' : ''}`}
                  onClick={() => toggleStrength(s.key)}
                  disabled={disabled}
                  style={disabled ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}>
                  {s[lang]}
                </button>
              )
            })}
          </div>
        </div>
      </Section>
    )
  }

  function wrapSelection(before: string, after: string) {
    const ta = bioRef.current
    if (!ta) return
    const start = ta.selectionStart, end = ta.selectionEnd
    const sel = bio.slice(start, end) || (lang === 'fr' ? 'texte' : 'Text')
    const next = bio.slice(0, start) + before + sel + after + bio.slice(end)
    setBio(next)
    setTimeout(() => {
      ta.focus()
      ta.setSelectionRange(start + before.length, start + before.length + sel.length)
    }, 0)
  }
  function prefixLine(prefix: string) {
    const ta = bioRef.current
    if (!ta) return
    const start = ta.selectionStart
    const before = bio.slice(0, start)
    const lineStart = before.lastIndexOf('\n') + 1
    const next = bio.slice(0, lineStart) + prefix + bio.slice(lineStart)
    setBio(next)
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + prefix.length, start + prefix.length) }, 0)
  }

  function renderContact() {
    const isClub = role === 'club'
    return (
      <Section
        title={isClub ? t.profil.sec_contact_public[lang] : t.profil.sec_contact[lang]}
        desc={t.profil.sec_contact_desc[lang]}
        defaultOpen={false}
        lang={lang}
      >
        <div className="form-grid">
          {!isClub && (
            <div className="form-group form-grid-full">
              <label>{t.profil.phone[lang]}</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+41 79 000 00 00" />
            </div>
          )}
          <div className="form-group">
            <label style={{ display:'flex', alignItems:'center', gap:5 }}><IcoGlobe s={12} /> {lang === 'fr' ? 'Site web' : 'Webseite'}</label>
            <input type="url" value={clubWebsite} onChange={e => setClubWebsite(e.target.value)} placeholder="https://monclub.ch" />
          </div>
          <div className="form-group">
            <label style={{ display:'flex', alignItems:'center', gap:5 }}><IcoCamera s={12} /> Instagram</label>
            <input value={clubInstagram} onChange={e => setClubInstagram(e.target.value)} placeholder="https://instagram.com/…" />
          </div>
          <div className="form-group">
            <label style={{ display:'flex', alignItems:'center', gap:5 }}><IcoBook s={12} /> Facebook</label>
            <input value={clubFacebook} onChange={e => setClubFacebook(e.target.value)} placeholder="https://facebook.com/…" />
          </div>
          <div className="form-group">
            <label style={{ display:'flex', alignItems:'center', gap:5 }}><IcoChat s={12} /> WhatsApp</label>
            <input type="tel" value={clubWhatsapp} onChange={e => setClubWhatsapp(e.target.value)} placeholder="+41 79 000 00 00" />
          </div>
          {isClub && (
            <>
              <div className="form-group">
                <label style={{ display:'flex', alignItems:'center', gap:5 }}><IcoPhone s={12} /> {lang === 'fr' ? 'Téléphone public' : 'Öffentliches Telefon'}</label>
                <input type="tel" value={clubPhonePublic} onChange={e => setClubPhonePublic(e.target.value)} placeholder="+41 26 000 00 00" />
              </div>
              <div className="form-group">
                <label style={{ display:'flex', alignItems:'center', gap:5 }}><IcoMail s={12} /> {lang === 'fr' ? 'Email public' : 'Öffentliche E-Mail'}</label>
                <input type="email" value={clubEmailPublic} onChange={e => setClubEmailPublic(e.target.value)} placeholder="contact@monclub.ch" />
              </div>
            </>
          )}
        </div>
      </Section>
    )
  }

  function renderDispo() {
    return (
      <Section title={t.profil.sec_dispo[lang]} desc={t.profil.sec_dispo_desc[lang]} defaultOpen={false} lang={lang}>
        <div className="form-grid">
          <div className="form-group form-grid-full">
            <label>{t.profil.dispo[lang]}</label>
            <select value={available ? 'oui' : 'non'} onChange={e => setAvailable(e.target.value === 'oui')}>
              <option value="oui">{t.profil.dispo_yes[lang]}</option>
              <option value="non">{t.profil.dispo_no[lang]}</option>
            </select>
          </div>
        </div>
      </Section>
    )
  }

  function renderVideos() {
    if (role === 'club') return null
    return (
      <Section title={t.profil.sec_videos[lang]} desc={t.profil.sec_videos_desc[lang]} defaultOpen={false} lang={lang}>
        <p style={{ fontSize:12, color:'rgba(255,255,255,0.45)', marginBottom:14, display:'flex', alignItems:'center', gap:5 }}>
          <IcoVideo s={12} /> {lang === 'fr' ? 'Choisis depuis ta galerie — ou colle un lien YouTube' : 'Aus deiner Galerie wählen — oder einen YouTube-Link einfügen'}
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[
            { v: video1, set: setVideo1, label: t.profil.video1[lang], idx: 1 },
            { v: video2, set: setVideo2, label: t.profil.video2[lang], idx: 2 },
            { v: video3, set: setVideo3, label: t.profil.video3[lang], idx: 3 },
          ].map(f => (
            <VideoUploadInput
              key={f.idx}
              value={f.v}
              onChange={f.set}
              placeholder={`${f.label} — YouTube ou vidéo`}
              profileId={profile.id}
              index={f.idx}
              inpSt={{ width:'100%', background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'11px 13px', color:'#fff', fontSize:14, fontFamily:'inherit', boxSizing:'border-box' }}
            />
          ))}
        </div>
      </Section>
    )
  }

  // ── Save bar status text ─────────────────────────────────────────
  const statusLabel =
    saveStatus === 'saving' ? t.profil.autosave_saving[lang]
    : saveStatus === 'saved' ? t.profil.autosave_saved[lang]
    : saveStatus === 'error' ? t.profil.autosave_error[lang]
    : (hasChanges ? (lang === 'fr' ? 'Modifications non enregistrées' : 'Nicht gespeicherte Änderungen') : t.profil.autosave_idle[lang])

  return (
    <div className="pe-page">
      <div className="pe-title">{t.profil.edit_title[lang]}</div>
      <div className="pe-subtitle">{t.profil.edit_subtitle[lang]}</div>

      {/* Progress */}
      <div className="pe-progress-wrap">
        <div className="pe-progress-text">{t.profil.completion[lang]} {completion}%</div>
        <div className="pe-progress-bar">
          <div className="pe-progress-fill" style={{ width: `${completion}%` }} />
        </div>
      </div>

      {saveError && (
        <div style={{ background:'rgba(255,58,58,0.12)', border:'1px solid rgba(255,58,58,0.3)', borderRadius:10, padding:'10px 14px', fontSize:13, color:'#FF3A3A', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ width:7, height:7, borderRadius:'50%', background:'#FF3A3A', flexShrink:0 }} />
          {saveError}
        </div>
      )}

      {/* Sections in order */}
      {renderIdentity()}
      {renderResponsable()}
      {renderSportProfile()}
      {renderCertificates()}
      {renderStats()}
      {renderAbout()}
      {renderContact()}
      {renderVideos()}
      {renderDispo()}

      {/* Sticky save bar */}
      <div className="pe-savebar">
        <div className={`pe-savebar-status ${saveStatus === 'saving' ? 'saving' : saveStatus === 'error' ? 'error' : ''}`}>
          <span className="dot" />
          <span>{statusLabel}</span>
        </div>
        <div className="pe-savebar-actions">
          <button type="button" className="pe-btn-cancel" onClick={onCancel}>{t.profil.cancel[lang]}</button>
          <button type="button" className="pe-btn-save" onClick={() => doSave(false)} disabled={saveStatus === 'saving'}>
            {saveStatus === 'saving' ? t.profil.saving[lang] : t.profil.save_btn[lang]}
          </button>
        </div>
      </div>
    </div>
  )
}
