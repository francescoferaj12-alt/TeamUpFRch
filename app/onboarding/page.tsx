'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, avatarSrc } from '../../lib/supabase'
import { useLang } from '../../lib/lang-context'
import { t } from '../../lib/translations'
import { ligues, zones, positions } from '../../lib/data'

// ─── Types ───────────────────────────────────────────────────────────────────

type Role = 'player' | 'coach' | 'club'

interface CareerEntry {
  club_name: string
  league: string
  position: string   // joueur
  coach_role: string // coach
  start_date: string
  end_date: string
  is_current: boolean
}

// ─── Constants ───────────────────────────────────────────────────────────────

const LAST_STEP: Record<Role, number> = { player: 6, coach: 5, club: 4 }

const FOOT_OPTIONS = ['Droit', 'Gauche', 'Ambidextre']

const COACH_EXPERIENCE_OPTIONS = [
  "Moins d'1 an",
  '1 à 3 ans',
  '3 à 5 ans',
  '5 à 10 ans',
  'Plus de 10 ans',
]

const COACH_ROLE_OPTIONS = [
  'Coach principal',
  'Coach adjoint',
  'Coach juniors',
  'Coach des gardiens',
  'Préparateur physique',
]

const CONTACT_ROLE_OPTIONS = [
  'Président(e)',
  'Vice-président(e)',
  'Secrétaire',
  'Trésorier(e)',
  'Directeur sportif',
  'Autre',
]

const YEARS = Array.from({ length: 60 }, (_, i) => String(new Date().getFullYear() - i))

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ALL_LIGUES = ligues.flatMap(g => g.items)

function getStepTitle(role: Role, step: number, lang: 'fr' | 'de'): string {
  if (role === 'player') {
    const keys = ['j0_title', 'j1_title', 'j2_title', 'j3_title', 'j4_title', 'j5_title', 'j6_title'] as const
    return t.onboarding[keys[step]][lang]
  }
  if (role === 'coach') {
    const keys = ['c0_title', 'c1_title', 'c2_title', 'c3_title', 'c4_title', 'c5_title'] as const
    return t.onboarding[keys[step]][lang]
  }
  const keys = ['cl0_title', 'cl1_title', 'cl2_title', 'cl3_title', 'cl4_title'] as const
  return t.onboarding[keys[step]][lang]
}

function getStepDesc(role: Role, step: number, lang: 'fr' | 'de'): string {
  if (role === 'player') {
    const keys = ['j0_desc', 'j1_desc', 'j2_desc', 'j3_desc', 'j4_desc', 'j5_desc', 'j6_desc'] as const
    return t.onboarding[keys[step]][lang]
  }
  if (role === 'coach') {
    const keys = ['c0_desc', 'c1_desc', 'c2_desc', 'c3_desc', 'c4_desc', 'c5_desc'] as const
    return t.onboarding[keys[step]][lang]
  }
  const keys = ['cl0_desc', 'cl1_desc', 'cl2_desc', 'cl3_desc', 'cl4_desc'] as const
  return t.onboarding[keys[step]][lang]
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SelectField({
  label, value, onChange, options, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; options: string[]; placeholder?: string }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{ display: 'block', color: 'rgba(255,255,255,.7)', fontSize: 13, marginBottom: 6 }}>{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.06)', color: value ? '#fff' : 'rgba(255,255,255,.4)', fontSize: 15, fontFamily: 'inherit', outline: 'none' }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o} value={o} style={{ background: '#1a2a4a', color: '#fff' }}>{o}</option>)}
      </select>
    </div>
  )
}

function GroupedSelectField({
  label, value, onChange, groups, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; groups: { group: string; items: string[] }[]; placeholder?: string }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{ display: 'block', color: 'rgba(255,255,255,.7)', fontSize: 13, marginBottom: 6 }}>{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.06)', color: value ? '#fff' : 'rgba(255,255,255,.4)', fontSize: 15, fontFamily: 'inherit', outline: 'none' }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {groups.map(g => (
          <optgroup key={g.group} label={g.group} style={{ background: '#1a2a4a' }}>
            {g.items.map(item => <option key={item} value={item} style={{ background: '#1a2a4a', color: '#fff' }}>{item}</option>)}
          </optgroup>
        ))}
      </select>
    </div>
  )
}

function TextField({
  label, value, onChange, placeholder, type = 'text',
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{ display: 'block', color: 'rgba(255,255,255,.7)', fontSize: 13, marginBottom: 6 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.06)', color: '#fff', fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
      />
    </div>
  )
}

function TextareaField({
  label, value, onChange, placeholder, rows = 5,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{ display: 'block', color: 'rgba(255,255,255,.7)', fontSize: 13, marginBottom: 6 }}>{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.06)', color: '#fff', fontSize: 15, fontFamily: 'inherit', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
      />
    </div>
  )
}

// Career experience editor
function CareerEditor({
  entries, onChange, roleType, lang,
}: { entries: CareerEntry[]; onChange: (e: CareerEntry[]) => void; roleType: 'player' | 'coach'; lang: 'fr' | 'de' }) {
  const o = t.onboarding

  const addEntry = () => onChange([...entries, { club_name: '', league: '', position: '', coach_role: '', start_date: '', end_date: '', is_current: false }])
  const removeEntry = (i: number) => onChange(entries.filter((_, idx) => idx !== i))
  const update = (i: number, field: keyof CareerEntry, val: string | boolean) => {
    const next = entries.map((e, idx) => idx === i ? { ...e, [field]: val } : e)
    onChange(next)
  }

  return (
    <div>
      {entries.length === 0 && (
        <p style={{ color: 'rgba(255,255,255,.3)', fontSize: 14, marginBottom: '1rem' }}>{o.career_none[lang]}</p>
      )}
      {entries.map((entry, i) => (
        <div key={i} style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem' }}>
          <TextField label={o.career_club[lang]} value={entry.club_name} onChange={v => update(i, 'club_name', v)} />
          {roleType === 'player'
            ? <SelectField label={o.career_role[lang]} value={entry.position} onChange={v => update(i, 'position', v)} options={positions} placeholder={t.onboarding.choose[lang]} />
            : <SelectField label={o.career_role[lang]} value={entry.coach_role} onChange={v => update(i, 'coach_role', v)} options={COACH_ROLE_OPTIONS} placeholder={t.onboarding.choose[lang]} />
          }
          <GroupedSelectField label={o.career_league[lang]} value={entry.league} onChange={v => update(i, 'league', v)} groups={ligues} placeholder={t.onboarding.choose[lang]} />
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <SelectField label={o.career_start[lang]} value={entry.start_date} onChange={v => update(i, 'start_date', v)} options={YEARS} placeholder="—" />
            {!entry.is_current && (
              <SelectField label={o.career_end[lang]} value={entry.end_date} onChange={v => update(i, 'end_date', v)} options={YEARS} placeholder="—" />
            )}
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'rgba(255,255,255,.7)', fontSize: 14, marginBottom: '0.5rem' }}>
            <input type="checkbox" checked={entry.is_current} onChange={e => update(i, 'is_current', e.target.checked)} />
            {o.career_current[lang]}
          </label>
          <button onClick={() => removeEntry(i)} style={{ background: 'none', border: '1px solid rgba(255,58,58,.4)', color: '#FF3A3A', borderRadius: 8, padding: '4px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
            {o.career_remove[lang]}
          </button>
        </div>
      ))}
      <button
        onClick={addEntry}
        style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px dashed rgba(255,255,255,.25)', background: 'none', color: 'rgba(255,255,255,.6)', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}
      >
        {o.career_add[lang]}
      </button>
    </div>
  )
}

// Photo upload step
function PhotoStep({
  userId, avatarUrl, onUploaded, lang,
}: { userId: string; avatarUrl: string; onUploaded: (url: string) => void; lang: 'fr' | 'de' }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const o = t.onboarding

  const handleFile = async (file: File) => {
    setError('')
    setUploading(true)
    const blob = await new Promise<Blob>((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const size = Math.min(img.width, img.height)
        canvas.width = 400; canvas.height = 400
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, 400, 400)
        canvas.toBlob(b => b ? resolve(b) : reject(new Error('canvas error')), 'image/jpeg', 0.85)
      }
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })

    const path = `${userId}/avatar.jpg`
    const { data, error: upErr } = await supabase.storage.from('avatars').upload(path, blob, { upsert: true, contentType: 'image/jpeg' })
    if (upErr) { setError(o.photo_error[lang]); setUploading(false); return }
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(data.path)
    const url = urlData.publicUrl + '?t=' + Date.now()
    onUploaded(url)
    setUploading(false)
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        style={{ width: 120, height: 120, borderRadius: '50%', background: avatarUrl ? 'none' : 'rgba(255,255,255,.08)', border: '2px dashed rgba(255,255,255,.2)', margin: '0 auto 1rem', overflow: 'hidden', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}
      >
        {avatarUrl
          ? <img src={avatarSrc(avatarUrl)!} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : '📷'
        }
      </div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        style={{ padding: '10px 24px', borderRadius: 10, border: '1px solid rgba(255,255,255,.2)', background: 'rgba(255,255,255,.06)', color: '#fff', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}
      >
        {uploading ? o.photo_uploading[lang] : avatarUrl ? o.photo_done[lang] : o.photo_upload[lang]}
      </button>
      {error && <p style={{ color: '#FF3A3A', fontSize: 13, marginTop: 8 }}>{error}</p>}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const { lang } = useLang()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState('')
  const [role, setRole] = useState<Role>('player')
  const [step, setStep] = useState(0)

  // Joueur state
  const [jPosition, setJPosition] = useState('')
  const [jPositionSecondary, setJPositionSecondary] = useState('')
  const [jFoot, setJFoot] = useState('')
  const [jBirthdate, setJBirthdate] = useState('')
  const [jLigue, setJLigue] = useState('')
  const [jZone, setJZone] = useState('')
  const [jCareer, setJCareer] = useState<CareerEntry[]>([])
  const [jBio, setJBio] = useState('')
  const [jAvatarUrl, setJAvatarUrl] = useState('')
  const [jVideo1, setJVideo1] = useState('')
  const [jVideo2, setJVideo2] = useState('')
  const [jVideo3, setJVideo3] = useState('')

  // Coach state
  const [cExperience, setCExperience] = useState('')
  const [cDiploma, setCDiploma] = useState('')
  const [cPhilosophy, setCPhilosophy] = useState('')
  const [cCareer, setCCareer] = useState<CareerEntry[]>([])
  const [cCategories, setCCategories] = useState('')
  const [cAvatarUrl, setCAvatarUrl] = useState('')

  // Club state
  const [clAvatarUrl, setClAvatarUrl] = useState('')
  const [clLigue, setClLigue] = useState('')
  const [clZone, setClZone] = useState('')
  const [clBio, setClBio] = useState('')
  const [clFirstName, setClFirstName] = useState('')
  const [clLastName, setClLastName] = useState('')
  const [clContactRole, setClContactRole] = useState('')
  const [clEmailPublic, setClEmailPublic] = useState('')

  const o = t.onboarding

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      setUserId(session.user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, profile_completed, onboarding_skipped, onboarding_step')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        setRole((profile.role as Role) || 'player')
        if (profile.profile_completed) { router.push('/profil'); return }
        if (profile.onboarding_step && profile.onboarding_step > 0) {
          setStep(profile.onboarding_step)
        }
      }
      setLoading(false)
    }
    init()
  }, [router])

  const totalSteps = LAST_STEP[role] + 1

  const getStepData = (): Record<string, unknown> => {
    if (role === 'player') {
      if (step === 0) return { position: jPosition, position_secondary: jPositionSecondary }
      if (step === 1) return { foot: jFoot, birthdate: jBirthdate }
      if (step === 2) return { ligue: jLigue, zone: jZone }
      if (step === 3) return { career_experiences: jCareer.filter(e => e.club_name) }
      if (step === 4) return { bio: jBio }
      if (step === 5) return { avatar_url: jAvatarUrl }
      if (step === 6) return { video1_url: jVideo1, video2_url: jVideo2, video3_url: jVideo3 }
    }
    if (role === 'coach') {
      if (step === 0) return { coach_experience: cExperience }
      if (step === 1) return { coach_diploma: cDiploma }
      if (step === 2) return { coach_philosophy: cPhilosophy }
      if (step === 3) return { career_experiences: cCareer.filter(e => e.club_name) }
      if (step === 4) return { coach_categories: cCategories }
      if (step === 5) return { avatar_url: cAvatarUrl }
    }
    if (role === 'club') {
      if (step === 0) return { avatar_url: clAvatarUrl }
      if (step === 1) return { ligue: clLigue }
      if (step === 2) return { zone: clZone }
      if (step === 3) return { bio: clBio }
      if (step === 4) return { first_name: clFirstName, last_name: clLastName, club_contact_role: clContactRole, club_email_public: clEmailPublic }
    }
    return {}
  }

  const saveStep = async (targetStep: number) => {
    setSaving(true)
    setError('')
    const { data: { session } } = await supabase.auth.getSession()
    const stepData = getStepData()
    const res = await fetch('/api/onboarding/save-step', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify({ stepIndex: step, role, data: stepData }),
    })
    setSaving(false)
    if (!res.ok) { setError(o.error[lang]); return false }
    const json = await res.json()
    if (json.profile_completed) { router.push('/profil'); return false }
    setStep(targetStep)
    return true
  }

  const skipAndQuit = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    await fetch('/api/onboarding/skip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
    })
    router.push('/profil')
  }

  const handleNext = () => {
    if (step < LAST_STEP[role]) saveStep(step + 1)
    else saveStep(step) // last step → profile_completed = true → redirect
  }

  const handleSkipStep = () => {
    if (step < LAST_STEP[role]) setStep(step + 1)
    else router.push('/profil')
  }

  if (loading) {
    return (
      <div style={{ background: '#030a24', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,.1)', borderTopColor: '#3a8cff', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  const title = getStepTitle(role, step, lang)
  const desc = getStepDesc(role, step, lang)
  const isLast = step === LAST_STEP[role]

  return (
    <div style={{ background: '#030a24', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1.25rem', fontFamily: 'inherit' }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}`}</style>

      {/* Progress */}
      <div style={{ width: '100%', maxWidth: 520, marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
          <span style={{ color: 'rgba(255,255,255,.4)', fontSize: 13 }}>
            {o.step_of[lang]} {step + 1} / {totalSteps}
          </span>
          <button
            onClick={skipAndQuit}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.3)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            {o.quit[lang]}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 3, borderRadius: 100,
              background: i <= step ? '#3a8cff' : 'rgba(255,255,255,.12)',
              transition: 'background .3s',
            }} />
          ))}
        </div>
      </div>

      {/* Card */}
      <div style={{ width: '100%', maxWidth: 520, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.09)', borderRadius: 20, padding: '2rem 1.75rem', animation: 'fadeIn .35s ease both' }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontFamily: "'Russo One', sans-serif", fontSize: '1.75rem', letterSpacing: 1, color: '#fff', margin: '0 0 .5rem' }}>{title}</h1>
          <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{desc}</p>
        </div>

        {/* Step content */}
        {renderStepContent()}

        {error && <p style={{ color: '#FF3A3A', fontSize: 13, marginTop: '0.5rem', textAlign: 'center' }}>{error}</p>}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                disabled={saving}
                style={{ background: 'none', border: '1px solid rgba(255,255,255,.15)', color: 'rgba(255,255,255,.6)', borderRadius: 10, padding: '10px 18px', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                {o.back[lang]}
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              onClick={handleSkipStep}
              disabled={saving}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.35)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', padding: '10px 12px' }}
            >
              {o.skip[lang]}
            </button>
            <button
              onClick={handleNext}
              disabled={saving}
              style={{ background: '#3a8cff', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? .6 : 1 }}
            >
              {saving ? o.saving[lang] : isLast ? o.finish[lang] : o.next[lang]}
            </button>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '1.25rem', color: 'rgba(255,255,255,.15)', fontSize: 12 }}>
        TeamUpFR · {lang === 'fr' ? 'Canton de Fribourg' : 'Kanton Freiburg'}
      </div>
    </div>
  )

  function renderStepContent() {
    if (role === 'player') {
      if (step === 0) return (
        <>
          <SelectField label={o.j0_main[lang]} value={jPosition} onChange={setJPosition} options={positions} placeholder={o.choose_position[lang]} />
          <SelectField label={`${o.j0_secondary[lang]} ${o.optional[lang]}`} value={jPositionSecondary} onChange={setJPositionSecondary} options={[o.none[lang], ...positions]} placeholder={o.none[lang]} />
        </>
      )
      if (step === 1) return (
        <>
          <SelectField label={o.j1_foot[lang]} value={jFoot} onChange={setJFoot} options={FOOT_OPTIONS} placeholder={o.choose[lang]} />
          <TextField label={`${o.j1_birth[lang]} ${o.optional[lang]}`} value={jBirthdate} onChange={setJBirthdate} type="date" />
        </>
      )
      if (step === 2) return (
        <>
          <GroupedSelectField label={o.j2_ligue[lang]} value={jLigue} onChange={setJLigue} groups={ligues} placeholder={o.choose_ligue[lang]} />
          <SelectField label={o.j2_zone[lang]} value={jZone} onChange={setJZone} options={zones} placeholder={o.choose_zone[lang]} />
        </>
      )
      if (step === 3) return (
        <CareerEditor entries={jCareer} onChange={setJCareer} roleType="player" lang={lang} />
      )
      if (step === 4) return (
        <TextareaField label="Bio" value={jBio} onChange={setJBio} placeholder={o.bio_ph_joueur[lang]} rows={6} />
      )
      if (step === 5) return (
        <PhotoStep userId={userId} avatarUrl={jAvatarUrl} onUploaded={setJAvatarUrl} lang={lang} />
      )
      if (step === 6) return (
        <>
          <TextField label={`${o.video_label[lang]} 1 ${o.optional[lang]}`} value={jVideo1} onChange={setJVideo1} placeholder={o.video_ph[lang]} />
          <TextField label={`${o.video_label[lang]} 2 ${o.optional[lang]}`} value={jVideo2} onChange={setJVideo2} placeholder={o.video_ph[lang]} />
          <TextField label={`${o.video_label[lang]} 3 ${o.optional[lang]}`} value={jVideo3} onChange={setJVideo3} placeholder={o.video_ph[lang]} />
        </>
      )
    }

    if (role === 'coach') {
      if (step === 0) return (
        <SelectField label={o.c0_label[lang]} value={cExperience} onChange={setCExperience} options={COACH_EXPERIENCE_OPTIONS} placeholder={o.choose[lang]} />
      )
      if (step === 1) return (
        <TextareaField label={o.c1_label[lang]} value={cDiploma} onChange={setCDiploma} placeholder="UEFA C, UEFA B…" rows={3} />
      )
      if (step === 2) return (
        <TextareaField label="Philosophie" value={cPhilosophy} onChange={setCPhilosophy} placeholder={o.bio_ph_coach[lang]} rows={5} />
      )
      if (step === 3) return (
        <CareerEditor entries={cCareer} onChange={setCCareer} roleType="coach" lang={lang} />
      )
      if (step === 4) return (
        <TextareaField label={o.c4_title[lang]} value={cCategories} onChange={setCCategories} placeholder="Seniors, Juniors A, Juniors B…" rows={3} />
      )
      if (step === 5) return (
        <PhotoStep userId={userId} avatarUrl={cAvatarUrl} onUploaded={setCAvatarUrl} lang={lang} />
      )
    }

    if (role === 'club') {
      if (step === 0) return (
        <PhotoStep userId={userId} avatarUrl={clAvatarUrl} onUploaded={setClAvatarUrl} lang={lang} />
      )
      if (step === 1) return (
        <GroupedSelectField label={o.cl1_title[lang]} value={clLigue} onChange={setClLigue} groups={ligues} placeholder={o.choose_ligue[lang]} />
      )
      if (step === 2) return (
        <SelectField label={o.cl2_title[lang]} value={clZone} onChange={setClZone} options={zones} placeholder={o.choose_zone[lang]} />
      )
      if (step === 3) return (
        <TextareaField label="Bio" value={clBio} onChange={setClBio} placeholder={o.bio_ph_club[lang]} rows={6} />
      )
      if (step === 4) return (
        <>
          <TextField label={o.contact_firstname[lang]} value={clFirstName} onChange={setClFirstName} />
          <TextField label={o.contact_lastname[lang]} value={clLastName} onChange={setClLastName} />
          <SelectField label={o.contact_role[lang]} value={clContactRole} onChange={setClContactRole} options={CONTACT_ROLE_OPTIONS} placeholder={o.choose[lang]} />
          <TextField label={`${o.contact_email[lang]} ${o.optional[lang]}`} value={clEmailPublic} onChange={setClEmailPublic} type="email" />
        </>
      )
    }

    return null
  }
}
