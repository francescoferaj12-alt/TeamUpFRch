'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { useLang } from '../../lib/lang-context'
import { t, months } from '../../lib/translations'
import { useAuth } from '../../lib/auth-context'
import { liguesHomme, liguesFemme } from '../../lib/data'
import AffClubSelector from '../../components/AffClubSelector'
import { isPersonalEmail } from '../../lib/personal-email-domains'

const ZONES = ['Fribourg-Ville','Gruyère','Broye','Glâne','Sensebezirk','Veveyse','Lac']
const POSITIONS = ['Attaquant','Milieu offensif','Milieu défensif','Défenseur central','Défenseur latéral','Gardien']

// ─── SVG icons ───────────────────────────────────────────────────────────────

const Svg = ({ children, size = 18, color = 'currentColor', ...p }: React.SVGProps<SVGSVGElement> & { size?: number; color?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    {children}
  </svg>
)

const IcoMail    = ({ size = 18, color = 'currentColor' }) => <Svg size={size} color={color}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></Svg>
const IcoLock    = ({ size = 18, color = 'currentColor' }) => <Svg size={size} color={color}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></Svg>
const IcoEye     = ({ size = 18 }) => <Svg size={size}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></Svg>
const IcoEyeOff  = ({ size = 18 }) => <Svg size={size}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></Svg>
const IcoArrow   = ({ size = 14 }) => <Svg size={size}><path d="M19 12H5M12 19l-7-7 7-7"/></Svg>
const IcoArrowR  = ({ size = 16 }) => <Svg size={size}><path d="M5 12h14M12 5l7 7-7 7"/></Svg>
const IcoAlert   = ({ size = 16 }) => <Svg size={size}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></Svg>
const IcoCheck   = ({ size = 16 }) => <Svg size={size}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></Svg>
const IcoWarning = ({ size = 14 }) => <Svg size={size}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></Svg>

function RoleIcon({ type }: { type: 'player' | 'coach' | 'club' }) {
  if (type === 'player') return <Svg size={18}><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></Svg>
  if (type === 'coach')  return <Svg size={18}><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v6c0 1.5 4 4 9 4s9-2.5 9-4V7"/></Svg>
  return <Svg size={18}><path d="M3 21V8l9-5 9 5v13"/><path d="M9 21V12h6v9"/></Svg>
}

function FeatIcon({ type }: { type: string }) {
  const p = { size: 16, color: '#FF3A3A' }
  if (type === 'players')  return <Svg {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></Svg>
  if (type === 'clubs')    return <Svg {...p}><path d="M3 21V8l9-5 9 5v13"/><path d="M9 21V12h6v9"/></Svg>
  if (type === 'msg')      return <Svg {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></Svg>
  if (type === 'annonces') return <Svg {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></Svg>
  return <Svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></Svg>
}

// ─── Feedback boxes ───────────────────────────────────────────────────────────

function AlertBox({ msg }: { msg: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'rgba(255,58,58,.1)', border: '1px solid rgba(255,58,58,.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: 'rgba(255,110,110,1)' }}>
      <span style={{ flexShrink: 0, marginTop: 1 }}><IcoAlert size={16} /></span>
      <span style={{ fontSize: 13, lineHeight: 1.4 }}>{msg}</span>
    </div>
  )
}

function SuccessBox({ msg }: { msg: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'rgba(46,210,127,.08)', border: '1px solid rgba(46,210,127,.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: '#2ED27F' }}>
      <span style={{ flexShrink: 0, marginTop: 1 }}><IcoCheck size={16} /></span>
      <span style={{ fontSize: 13, lineHeight: 1.4 }}>{msg}</span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const { lang } = useLang()
  const { session, authLoading } = useAuth()
  const [mode, setMode] = useState<'login'|'register'|'forgot'>('login')
  const [role, setRole] = useState<'player'|'coach'|'club'>('player')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showResend, setShowResend] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSent, setResendSent] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/profil'
  const resetSuccess = searchParams.get('reset') === '1'
  const loginTriggered = useRef(false)

  // UI-only state (no auth logic)
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)

  // Redirect once auth is ready after login
  useEffect(() => {
    if (!loginTriggered.current) return
    if (!authLoading && session) {
      router.push(redirectTo)
    }
  }, [authLoading, session, redirectTo, router])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [position, setPosition] = useState('')
  const [genre, setGenre] = useState<'homme' | 'femme'>('homme')
  const [ligue, setLigue] = useState('')
  const [zone, setZone] = useState('')
  const [foot, setFoot] = useState('Droit')
  const [birthDay, setBirthDay] = useState('')
  const [birthMonth, setBirthMonth] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [clubName, setClubName] = useState('')
  const [selectedAffClubId, setSelectedAffClubId] = useState<number | null>(null)
  const selectedAffClubIdRef = useRef<number | null>(null)
  const [affClubError, setAffClubError] = useState('')
  const [selectedAffClubName, setSelectedAffClubName] = useState('')
  const [emailIsProfessional, setEmailIsProfessional] = useState(false)
  const [bio, setBio] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [coachExperience, setCoachExperience] = useState('')
  const [coachDiploma, setCoachDiploma] = useState('')
  const [coachSpecialty, setCoachSpecialty] = useState('')
  const [coachAvailability, setCoachAvailability] = useState('')

  const regYear = new Date().getFullYear()
  const regYears = Array.from({ length: 55 }, (_, i) => regYear - 14 - i)
  const regDays = Array.from({ length: 31 }, (_, i) => i + 1)
  const MONTHS = months[lang]

  // ─── Supabase auth functions — DO NOT MODIFY ────────────────────────────────

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(''); setShowResend(false)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      const notConfirmed = error.message?.toLowerCase().includes('not confirmed') || error.message?.toLowerCase().includes('email')
      if (notConfirmed) {
        setError(t.login.error_not_confirmed[lang])
        setShowResend(true)
      } else {
        setError(t.login.error_login[lang])
      }
      setLoading(false)
      return
    }
    loginTriggered.current = true
  }

  async function handleResend() {
    if (!email) return
    setResendLoading(true)
    await supabase.auth.resend({ type: 'signup', email })
    setResendLoading(false)
    setResendSent(true)
    setTimeout(() => setResendSent(false), 5000)
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(''); setAffClubError('')
    if (password !== confirmPassword) {
      setError(t.login.error_pwd_match[lang])
      setLoading(false)
      return
    }
    const affClubId = selectedAffClubIdRef.current ?? selectedAffClubId
    if (role === 'club' && affClubId === null) {
      setAffClubError(t.login.club_selector_error_required[lang])
      setLoading(false)
      return
    }
    const { data, error: signUpError } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { first_name: firstName, last_name: lastName, role },
        emailRedirectTo: 'https://teamupfr.ch/verify-email'
      }
    })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }
    if (data.user) {
      const birthdate = (birthDay && birthMonth && birthYear)
        ? `${birthYear}-${birthMonth.toString().padStart(2,'0')}-${birthDay.toString().padStart(2,'0')}`
        : null
      const isPro = role === 'club' ? !isPersonalEmail(email) : false
      const profileData = {
        id: data.user.id, email, role,
        first_name: firstName, last_name: lastName,
        position: role === 'player' ? position : null,
        genre: role !== 'club' ? genre : null,
        ligue: role !== 'coach' ? ligue : null,
        zone,
        foot: role === 'player' ? foot : null,
        club_name: role === 'club' ? clubName : null,
        aff_club_id: role === 'club' ? affClubId : null,
        bio: role !== 'coach' ? bio : null,
        birthdate,
        available: true,
        hidden: true,
        ...(role === 'club' ? { club_verification_status: 'pending', club_email_is_professional: isPro } : {}),
        ...(role === 'coach' ? { coach_experience: coachExperience, coach_diploma: coachDiploma, coach_specialty: coachSpecialty, coach_availability: coachAvailability } : {})
      }
      const res = await fetch('/api/auth/create-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: data.user.id, profileData }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        const msg: string = json.error ?? ''
        if (msg.includes('row-level security') || msg.includes('violates')) {
          setError(t.login.club_selector_error_invalid[lang])
        } else {
          setError('Erreur profil: ' + (msg || 'réessaie.'))
        }
        setLoading(false)
        return
      }
      if (role === 'club') {
        fetch('/api/send-club-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clubName, clubEmail: email, affClubName: selectedAffClubName || null, emailIsProfessional: isPro }),
        }).catch(() => {})
      }
    }
    if (typeof window !== 'undefined') sessionStorage.setItem('pendingVerifyEmail', email)
    router.push('/verify-email-pending')
    setLoading(false)
  }

  function startCooldown() {
    if (cooldownRef.current) clearInterval(cooldownRef.current)
    setCooldown(60)
    cooldownRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { clearInterval(cooldownRef.current!); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://teamupfr.ch/reset-password'
    })
    if (error) { setError(error.message); setLoading(false); return }
    setSuccess('sent')
    startCooldown()
    setLoading(false)
  }

  async function handleResendForgot() {
    if (cooldown > 0 || !email) return
    setLoading(true)
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://teamupfr.ch/reset-password'
    })
    setLoading(false)
    startCooldown()
  }

  // ─── UI helpers ──────────────────────────────────────────────────────────────

  function pwStrength(pwd: string): number {
    if (!pwd) return 0
    let s = 0
    if (pwd.length >= 8) s++
    if (/[A-Z]/.test(pwd)) s++
    if (/[0-9]/.test(pwd)) s++
    if (/[^A-Za-z0-9]/.test(pwd)) s++
    return s
  }
  const strength = pwStrength(password)
  const strengthColor = strength <= 2 ? '#FF3A3A' : strength === 3 ? '#FF9A3A' : '#2ED27F'

  const inp: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.12)',
    borderRadius: 12, padding: '14px 16px', fontSize: 14, fontFamily: 'inherit',
    outline: 'none', color: '#fff', transition: 'border-color .3s, background .3s, box-shadow .3s',
  }
  const inpIcon: React.CSSProperties = { ...inp, paddingLeft: 44 }
  const inpIconToggle: React.CSSProperties = { ...inp, paddingLeft: 44, paddingRight: 44 }
  const lbl: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,.6)', letterSpacing: .5, marginBottom: 8 }

  const features = [
    { type: 'players',  text: t.login.feat_players[lang] },
    { type: 'clubs',    text: t.login.feat_clubs[lang] },
    { type: 'msg',      text: t.login.feat_msg[lang] },
    { type: 'annonces', text: t.login.feat_annonces[lang] },
    { type: 'search',   text: t.login.feat_search[lang] },
  ]

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        .auth-wrap {
          display: grid; grid-template-columns: 5fr 6fr;
          min-height: calc(100vh - 160px);
        }
        @media (max-width: 980px) {
          .auth-wrap { grid-template-columns: 1fr; }
          .auth-brand { padding: 32px 32px 48px; }
          .auth-feats { display: none !important; }
        }
        @media (max-width: 640px) {
          .auth-brand { display: none !important; }
        }
        .auth-brand::before {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background-image:
            radial-gradient(circle at 20% 80%, rgba(255,58,58,.06) 0%, transparent 30%),
            radial-gradient(circle at 80% 20%, rgba(255,255,255,.03) 0%, transparent 30%);
        }
        .auth-brand::after {
          content: ''; position: absolute; inset: 0; pointer-events: none; opacity: .4;
          background-image:
            linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
          background-size: 60px 60px; background-position: -1px -1px;
          mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
        }
        .ln-back:hover { color: #fff !important; border-color: rgba(255,255,255,.22) !important; background: rgba(255,255,255,.04) !important; }
        .ln-inp:hover { border-color: rgba(255,255,255,.22) !important; }
        .ln-inp:focus { border-color: #FF3A3A !important; background: rgba(255,255,255,.06) !important; box-shadow: 0 0 0 4px rgba(255,58,58,.1) !important; outline: none; }
        .ln-tab.active { background: #fff !important; color: #0D1F4A !important; }
        .ln-pt:hover:not(.sel) { border-color: rgba(255,255,255,.22) !important; background: rgba(255,255,255,.05) !important; }
        .ln-pt.sel { border-color: #FF3A3A !important; background: rgba(255,58,58,.08) !important; }
        .ln-genre:hover:not(.sel) { border-color: rgba(255,255,255,.22) !important; }
        .ln-genre.sel { border-color: #FF3A3A !important; background: rgba(255,58,58,.15) !important; color: #FF3A3A !important; }
        .ln-sub:hover { transform: translateY(-1px); box-shadow: 0 14px 32px rgba(255,58,58,.4); }
        .ln-legal a:hover { color: rgba(255,255,255,.8) !important; }
      `}</style>

      <div className="auth-wrap">

        {/* ── LEFT: brand panel ── */}
        <aside className="auth-brand" style={{
          position: 'relative', padding: 40, overflow: 'hidden',
          background: `
            radial-gradient(ellipse at top left, #1a2f6b 0%, transparent 50%),
            radial-gradient(ellipse at bottom right, rgba(255,58,58,.18) 0%, transparent 55%),
            #081434`,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          {/* Top row */}
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: "'Russo One', sans-serif", fontSize: 22, letterSpacing: .5, textTransform: 'uppercase', display: 'inline-flex', alignItems: 'baseline', gap: 1 }}>
              <span style={{ color: '#fff' }}>TeamUp</span>
              <span style={{ color: '#0a0a0a', background: '#fff', padding: '2px 4px', marginLeft: 4, borderRadius: 2 }}>F</span>
              <span style={{ color: '#fff', background: '#0a0a0a', padding: '2px 4px', borderRadius: 2 }}>R</span>
            </div>
            <a href="/" className="ln-back" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,.6)', padding: '8px 14px', borderRadius: 999, border: '1px solid rgba(255,255,255,.12)', textDecoration: 'none', transition: 'color .3s, border-color .3s, background .3s' }}>
              <IcoArrow size={14} />{lang === 'fr' ? 'Retour' : 'Zurück'}
            </a>
          </div>

          {/* Brand content */}
          <div style={{ position: 'relative', zIndex: 2, maxWidth: 540 }}>
            <div style={{ fontFamily: "'Russo One', sans-serif", fontSize: 12, letterSpacing: 4, color: '#FF3A3A', textTransform: 'uppercase', marginBottom: 24 }}>
              {t.login.canton[lang]}
            </div>
            <h1 style={{ fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(40px, 5vw, 72px)', lineHeight: .95, letterSpacing: '-1px', textTransform: 'uppercase', marginBottom: 24 }}>
              {lang === 'fr' ? <>Ton équipe,<br /><span style={{ color: '#FF3A3A' }}>ton avenir.</span></> : <>Dein Team,<br /><span style={{ color: '#FF3A3A' }}>deine Zukunft.</span></>}
            </h1>
            <p style={{ fontSize: 'clamp(15px, 1.2vw, 18px)', fontWeight: 300, color: 'rgba(255,255,255,.92)', lineHeight: 1.6, maxWidth: 460 }}>
              {lang === 'fr'
                ? 'Rejoins la communauté du football amateur fribourgeois. Joueurs, coachs et clubs réunis sur une seule plateforme.'
                : 'Tritt der Freiburger Amateurfussball-Gemeinschaft bei. Spieler, Trainer und Vereine auf einer Plattform.'}
            </p>
          </div>

          {/* Features */}
          <div className="auth-feats" style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 14, color: 'rgba(255,255,255,.92)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,58,58,.12)', border: '1px solid rgba(255,58,58,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FeatIcon type={f.type} />
                </div>
                {f.text}
              </div>
            ))}
          </div>
        </aside>

        {/* ── RIGHT: form panel ── */}
        <main style={{ background: '#0D1F4A', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflowY: 'auto' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '60%', height: '60%', background: 'radial-gradient(ellipse at top right, rgba(255,58,58,.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ width: '100%', maxWidth: 460, margin: '0 auto', position: 'relative', zIndex: 1, paddingTop: 40, paddingBottom: 40 }}>

            {/* ── FORGOT MODE ── */}
            {mode === 'forgot' ? (
              success === 'sent' ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 64, height: 64, margin: '0 auto 20px', borderRadius: '50%', background: 'rgba(255,58,58,.1)', border: '1px solid rgba(255,58,58,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IcoMail size={26} color="#FF3A3A" />
                  </div>
                  <div style={{ fontFamily: "'Russo One', sans-serif", fontSize: 28, letterSpacing: .3, textTransform: 'uppercase', marginBottom: 8 }}>
                    {t.login.forgot_check_inbox[lang]}
                  </div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,.5)', lineHeight: 1.6, marginBottom: 28 }}>
                    {t.login.forgot_check_inbox_desc[lang]}
                  </div>
                  <button onClick={handleResendForgot} disabled={cooldown > 0 || loading} style={{ width: '100%', background: 'rgba(255,58,58,.1)', color: '#FF3A3A', border: '1px solid rgba(255,58,58,.3)', borderRadius: 999, padding: 12, fontSize: 14, fontWeight: 600, cursor: cooldown > 0 ? 'not-allowed' : 'pointer', opacity: cooldown > 0 ? .6 : 1, fontFamily: 'inherit', marginBottom: 16 }}>
                    {cooldown > 0 ? `${t.login.forgot_resend_wait[lang]} ${cooldown}s…` : t.login.forgot_resend[lang]}
                  </button>
                  <button onClick={() => { setMode('login'); setError(''); setSuccess('') }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {t.login.back_login[lang]}
                  </button>
                </div>
              ) : (
                <>
                  <h2 style={{ fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(26px, 3vw, 34px)', lineHeight: 1.1, letterSpacing: '-.5px', textTransform: 'uppercase', marginBottom: 8 }}>
                    {t.login.forgot_title[lang]}
                  </h2>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,.6)', marginBottom: 24, lineHeight: 1.5 }}>
                    {t.login.forgot_desc[lang]}
                  </p>
                  {error && <AlertBox msg={error} />}
                  <form onSubmit={handleForgot}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={lbl}>{t.login.email[lang]}</label>
                      <div style={{ position: 'relative' }}>
                        <input className="ln-inp" style={inpIcon} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ton@email.ch" required />
                        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><IcoMail size={18} color="rgba(255,255,255,.35)" /></span>
                      </div>
                    </div>
                    <button type="submit" disabled={loading} className="ln-sub" style={{ width: '100%', background: '#FF3A3A', color: '#fff', border: 'none', borderRadius: 12, padding: 16, fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, fontFamily: 'inherit', transition: 'transform .3s, box-shadow .3s', letterSpacing: .3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                      {loading ? t.login.sending[lang] : t.login.forgot_send[lang]}
                      {!loading && <IcoArrowR size={16} />}
                    </button>
                  </form>
                  <button onClick={() => { setMode('login'); setError(''); setSuccess('') }} style={{ marginTop: 24, background: 'none', border: 'none', color: '#FF3A3A', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
                    {t.login.back_login[lang]}
                  </button>
                </>
              )
            ) : (
              /* ── LOGIN / REGISTER MODE ── */
              <>
                {/* Tab switcher */}
                <div style={{ display: 'flex', padding: 4, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 999, marginBottom: 36 }}>
                  {(['login','register'] as const).map(m => (
                    <button key={m} type="button" onClick={() => { setMode(m); setError(''); setSuccess('') }}
                      className={`ln-tab${mode === m ? ' active' : ''}`}
                      style={{ flex: 1, padding: '12px 24px', fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,.6)', borderRadius: 999, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', transition: 'color .3s, background .3s' }}>
                      {m === 'login' ? t.login.connexion[lang] : t.login.inscription[lang]}
                    </button>
                  ))}
                </div>

                <h2 style={{ fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(26px, 3vw, 34px)', lineHeight: 1.1, letterSpacing: '-.5px', textTransform: 'uppercase', marginBottom: 8 }}>
                  {mode === 'login' ? t.login.welcome[lang] : t.login.create[lang]}
                </h2>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,.6)', marginBottom: 28, lineHeight: 1.5 }}>
                  {mode === 'login' ? t.login.connect[lang] : t.login.join[lang]}
                </p>

                {resetSuccess && mode === 'login' && <SuccessBox msg={t.login.login_reset_success[lang]} />}
                {error && <AlertBox msg={error} />}
                {success && success !== 'sent' && <SuccessBox msg={success} />}

                {/* Resend confirmation banner */}
                {showResend && (
                  <div style={{ marginBottom: 16, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,.6)' }}>
                      <IcoMail size={15} color="rgba(255,255,255,.4)" />
                      {resendSent ? t.login.resend_confirm_sent[lang] : (lang === 'fr' ? "Tu n'as pas reçu l'email ?" : 'Keine E-Mail erhalten?')}
                    </div>
                    {!resendSent && (
                      <button type="button" onClick={handleResend} disabled={resendLoading || !email} style={{ background: 'rgba(255,58,58,.1)', color: '#FF3A3A', border: '1px solid rgba(255,58,58,.3)', borderRadius: 999, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: resendLoading || !email ? 'not-allowed' : 'pointer', opacity: resendLoading || !email ? .6 : 1, fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                        {resendLoading ? '…' : t.login.resend_confirm[lang]}
                      </button>
                    )}
                  </div>
                )}

                <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>

                  {mode === 'register' && <>

                    {/* Role selector */}
                    <div style={{ marginBottom: 20 }}>
                      <label style={lbl}>{t.login.you_are[lang]}</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                        {(['player','coach','club'] as const).map(r => (
                          <button key={r} type="button" onClick={() => setRole(r)}
                            className={`ln-pt${role === r ? ' sel' : ''}`}
                            style={{ padding: '16px 8px', border: '1px solid rgba(255,255,255,.12)', borderRadius: 14, background: 'rgba(255,255,255,.03)', textAlign: 'center', cursor: 'pointer', transition: 'border-color .3s, background .3s', fontFamily: 'inherit' }}>
                            <div style={{ width: 36, height: 36, margin: '0 auto 10px', borderRadius: '50%', background: role === r ? '#FF3A3A' : 'rgba(255,255,255,.05)', border: `1px solid ${role === r ? '#FF3A3A' : 'rgba(255,255,255,.12)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .3s, border-color .3s', color: '#fff' }}>
                              <RoleIcon type={r} />
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: .5, color: 'rgba(255,255,255,.92)' }}>
                              {{ player: t.login.player[lang], coach: t.login.coach[lang], club: t.login.club[lang] }[r]}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Genre */}
                    {role !== 'club' && (
                      <div style={{ marginBottom: 16 }}>
                        <label style={lbl}>{t.login.genre[lang]}</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          {(['homme','femme'] as const).map(g => (
                            <button key={g} type="button" onClick={() => { setGenre(g); setLigue('') }}
                              className={`ln-genre${genre === g ? ' sel' : ''}`}
                              style={{ background: 'rgba(255,255,255,.04)', border: `1px solid ${genre === g ? '#FF3A3A' : 'rgba(255,255,255,.12)'}`, color: genre === g ? '#FF3A3A' : 'rgba(255,255,255,.6)', borderRadius: 12, padding: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color .3s, color .3s, background .3s' }}>
                              {g === 'homme' ? t.login.genre_homme[lang] : t.login.genre_femme[lang]}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Name row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                      <div>
                        <label style={lbl}>{t.login.firstname[lang]}</label>
                        <input className="ln-inp" style={inp} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Prénom" required />
                      </div>
                      <div>
                        <label style={lbl}>{t.login.lastname[lang]}</label>
                        <input className="ln-inp" style={inp} value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Nom" required />
                      </div>
                    </div>

                    {/* AFF Club selector */}
                    {role === 'club' && (
                      <div style={{ marginBottom: 16 }}>
                        <label style={lbl}>{t.login.club_selector_label[lang]}</label>
                        <AffClubSelector
                          value={selectedAffClubId}
                          onChange={(clubId, name) => {
                            setSelectedAffClubId(clubId)
                            selectedAffClubIdRef.current = clubId
                            setClubName(name)
                            setSelectedAffClubName(name)
                            if (clubId !== null) setAffClubError('')
                          }}
                          required language={lang} inputStyle={inp} error={affClubError}
                        />
                      </div>
                    )}

                    {/* Position + foot (player) */}
                    {role === 'player' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                        <div>
                          <label style={lbl}>{t.login.position[lang]}</label>
                          <select className="ln-inp" style={inp} value={position} onChange={e => setPosition(e.target.value)} required>
                            <option value="">{t.login.choose[lang]}</option>
                            {POSITIONS.map(p => <option key={p}>{p}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={lbl}>{t.login.foot[lang]}</label>
                          <select className="ln-inp" style={inp} value={foot} onChange={e => setFoot(e.target.value)}>
                            <option value="Droit">{t.login.right[lang]}</option>
                            <option value="Gauche">{t.login.left[lang]}</option>
                            <option value="Ambidextre">{t.login.both[lang]}</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Ligue + Zone */}
                    {role !== 'coach' ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                        <div>
                          <label style={lbl}>{t.login.ligue[lang]}</label>
                          <select className="ln-inp" style={inp} value={ligue} onChange={e => setLigue(e.target.value)} required>
                            <option value="">{t.login.choose[lang]}</option>
                            {(role === 'club' ? [...liguesHomme, ...liguesFemme] : genre === 'homme' ? liguesHomme : liguesFemme).map(g => (
                              <optgroup key={g.group} label={g.group} style={{ background: '#0D1F4A' }}>
                                {g.items.map(l => <option key={l} style={{ background: '#0D1F4A' }}>{l}</option>)}
                              </optgroup>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={lbl}>{t.login.zone[lang]}</label>
                          <select className="ln-inp" style={inp} value={zone} onChange={e => setZone(e.target.value)} required>
                            <option value="">{t.login.choose[lang]}</option>
                            {ZONES.map(z => <option key={z}>{z}</option>)}
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div style={{ marginBottom: 16 }}>
                        <label style={lbl}>{t.login.zone[lang]}</label>
                        <select className="ln-inp" style={inp} value={zone} onChange={e => setZone(e.target.value)} required>
                          <option value="">{t.login.choose[lang]}</option>
                          {ZONES.map(z => <option key={z}>{z}</option>)}
                        </select>
                      </div>
                    )}

                    {/* Birthdate */}
                    {role !== 'club' && (
                      <div style={{ marginBottom: 16 }}>
                        <label style={lbl}>{t.login.birthdate[lang]}</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 6 }}>
                          <select className="ln-inp" style={inp} value={birthDay} onChange={e => setBirthDay(e.target.value)} required>
                            <option value="">{t.login.day[lang]}</option>
                            {regDays.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                          <select className="ln-inp" style={inp} value={birthMonth} onChange={e => setBirthMonth(e.target.value)} required>
                            <option value="">{t.login.month[lang]}</option>
                            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                          </select>
                          <select className="ln-inp" style={inp} value={birthYear} onChange={e => setBirthYear(e.target.value)} required>
                            <option value="">{t.login.year[lang]}</option>
                            {regYears.map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Coach fields */}
                    {role === 'coach' && <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                        <div>
                          <label style={lbl}>Expérience</label>
                          <select className="ln-inp" style={inp} value={coachExperience} onChange={e => setCoachExperience(e.target.value)} required>
                            <option value="">Choisir…</option>
                            {['Débutant','1-3 ans','3-5 ans','5-10 ans','10+ ans'].map(v => <option key={v}>{v}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={lbl}>Diplôme</label>
                          <select className="ln-inp" style={inp} value={coachDiploma} onChange={e => setCoachDiploma(e.target.value)} required>
                            <option value="">Choisir…</option>
                            {['Sans diplôme','UEFA C','UEFA B','UEFA A','UEFA Pro','Diplôme CFE','BBaby','BFut'].map(v => <option key={v}>{v}</option>)}
                          </select>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                        <div>
                          <label style={lbl}>Spécialité</label>
                          <select className="ln-inp" style={inp} value={coachSpecialty} onChange={e => setCoachSpecialty(e.target.value)} required>
                            <option value="">Choisir…</option>
                            {['Entraîneur principal','Entraîneur assistant','Préparateur physique','Entraîneur des gardiens'].map(v => <option key={v}>{v}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={lbl}>Disponibilité</label>
                          <select className="ln-inp" style={inp} value={coachAvailability} onChange={e => setCoachAvailability(e.target.value)} required>
                            <option value="">Choisir…</option>
                            {['Cherche un club','En poste actuellement','Pas disponible'].map(v => <option key={v}>{v}</option>)}
                          </select>
                        </div>
                      </div>
                    </>}

                    {/* Bio */}
                    {role !== 'coach' && (
                      <div style={{ marginBottom: 16 }}>
                        <label style={lbl}>{t.login.bio[lang]}</label>
                        <textarea className="ln-inp" style={{ ...inp, resize: 'none', minHeight: 72 } as React.CSSProperties} value={bio} onChange={e => setBio(e.target.value)} placeholder={t.login.bio_ph[lang]} />
                      </div>
                    )}
                  </>}

                  {/* Email */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={lbl}>{t.login.email[lang]}</label>
                    <div style={{ position: 'relative' }}>
                      <input className="ln-inp" style={inpIcon} type="email" value={email}
                        onChange={e => {
                          setEmail(e.target.value)
                          if (mode === 'register' && role === 'club') setEmailIsProfessional(!isPersonalEmail(e.target.value))
                        }}
                        placeholder="ton@email.ch" required />
                      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                        <IcoMail size={18} color="rgba(255,255,255,.35)" />
                      </span>
                    </div>
                    {mode === 'register' && role === 'club' && email && isPersonalEmail(email) && (
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'rgba(255,154,58,.08)', border: '1px solid rgba(255,154,58,.3)', borderRadius: 10, padding: '10px 12px', marginTop: 8 }}>
                        <span style={{ flexShrink: 0, marginTop: 1, color: '#FF9A3A' }}><IcoWarning size={14} /></span>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#FF9A3A', marginBottom: 2 }}>{t.clubVerif.email_warning_title[lang]}</div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', lineHeight: 1.5 }}>{t.clubVerif.email_warning_body[lang]}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Password */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <label style={{ ...lbl, marginBottom: 0 }}>{t.login.password[lang]}</label>
                      {mode === 'login' && (
                        <button type="button" onClick={() => { setMode('forgot'); setError(''); setSuccess('') }} style={{ background: 'none', border: 'none', color: '#FF3A3A', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
                          {t.login.forgot[lang]}
                        </button>
                      )}
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input className="ln-inp" style={inpIconToggle} type={showPwd ? 'text' : 'password'}
                        value={password} onChange={e => setPassword(e.target.value)}
                        placeholder={mode === 'register' ? t.login.min_pwd[lang] : '••••••••'} required minLength={6} />
                      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                        <IcoLock size={18} color="rgba(255,255,255,.35)" />
                      </span>
                      <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.4)', padding: 4, display: 'flex' }} aria-label={showPwd ? 'Masquer' : 'Afficher'}>
                        {showPwd ? <IcoEyeOff size={18} /> : <IcoEye size={18} />}
                      </button>
                    </div>
                    {mode === 'register' && password && (
                      <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                        {[1,2,3,4].map(i => (
                          <div key={i} style={{ flex: 1, height: 3, borderRadius: 999, background: i <= strength ? strengthColor : 'rgba(255,255,255,.12)', transition: 'background .3s' }} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Confirm password */}
                  {mode === 'register' && (
                    <div style={{ marginBottom: 16 }}>
                      <label style={lbl}>{t.login.confirm_pwd[lang]}</label>
                      <div style={{ position: 'relative' }}>
                        <input className="ln-inp" style={{ ...inpIconToggle, borderColor: confirmPassword && confirmPassword !== password ? '#FF3A3A' : undefined }}
                          type={showConfirmPwd ? 'text' : 'password'} value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder={t.login.confirm_pwd_ph[lang]} required minLength={6} />
                        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                          <IcoLock size={18} color="rgba(255,255,255,.35)" />
                        </span>
                        <button type="button" onClick={() => setShowConfirmPwd(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.4)', padding: 4, display: 'flex' }} aria-label={showConfirmPwd ? 'Masquer' : 'Afficher'}>
                          {showConfirmPwd ? <IcoEyeOff size={18} /> : <IcoEye size={18} />}
                        </button>
                      </div>
                      {confirmPassword && confirmPassword !== password && (
                        <div style={{ fontSize: 12, color: '#FF3A3A', marginTop: 6 }}>{t.login.error_pwd_match[lang]}</div>
                      )}
                    </div>
                  )}

                  {/* Submit */}
                  <button type="submit" disabled={loading} className="ln-sub" style={{ width: '100%', marginTop: 8, background: '#FF3A3A', color: '#fff', border: 'none', borderRadius: 12, padding: 16, fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, fontFamily: 'inherit', transition: 'transform .3s, box-shadow .3s', letterSpacing: .3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    {loading ? t.login.loading_btn[lang] : mode === 'login' ? t.login.btn_login[lang] : t.login.btn_register[lang]}
                    {!loading && <IcoArrowR size={16} />}
                  </button>
                </form>

                {/* Footer mode switch */}
                <p style={{ textAlign: 'center', marginTop: 28, fontSize: 14, color: 'rgba(255,255,255,.6)' }}>
                  {mode === 'login' ? (
                    <>{lang === 'fr' ? 'Pas encore de compte ?' : 'Noch kein Konto?'}{' '}
                      <button type="button" onClick={() => { setMode('register'); setError(''); setSuccess('') }} style={{ background: 'none', border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>
                        {lang === 'fr' ? 'Créer un compte' : 'Konto erstellen'}
                      </button>
                    </>
                  ) : (
                    <>{lang === 'fr' ? 'Déjà un compte ?' : 'Schon ein Konto?'}{' '}
                      <button type="button" onClick={() => { setMode('login'); setError(''); setSuccess('') }} style={{ background: 'none', border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>
                        {lang === 'fr' ? 'Se connecter' : 'Anmelden'}
                      </button>
                    </>
                  )}
                </p>
              </>
            )}

            {/* Legal links */}
            <div className="ln-legal" style={{ marginTop: 40, display: 'flex', justifyContent: 'center', gap: 24, fontSize: 12, color: 'rgba(255,255,255,.35)' }}>
              <a href="/cgu" style={{ textDecoration: 'none', color: 'inherit', transition: 'color .3s' }}>CGU</a>
              <a href="/privacy" style={{ textDecoration: 'none', color: 'inherit', transition: 'color .3s' }}>Confidentialité</a>
              <a href="mailto:teamupfr.ch@gmail.com" style={{ textDecoration: 'none', color: 'inherit', transition: 'color .3s' }}>Contact</a>
            </div>

          </div>
        </main>
      </div>
    </>
  )
}
