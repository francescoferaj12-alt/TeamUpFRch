'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { useLang } from '../../lib/lang-context'
import { t, months } from '../../lib/translations'
import { useAuth } from '../../lib/auth-context'

const LIGUES = ['2ème Ligue','3ème Ligue','4ème Ligue','5ème Ligue','Junior A','Junior B','Junior C']
const ZONES = ['Fribourg-Ville','Gruyère','Broye','Glâne','Sensebezirk','Veveyse','Lac']
const POSITIONS = ['Attaquant','Milieu offensif','Milieu défensif','Défenseur central','Défenseur latéral','Gardien']

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
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/profil'
  const loginTriggered = useRef(false)

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
  const [ligue, setLigue] = useState('')
  const [zone, setZone] = useState('')
  const [foot, setFoot] = useState('Droit')
  const [birthDay, setBirthDay] = useState('')
  const [birthMonth, setBirthMonth] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [clubName, setClubName] = useState('')
  const [bio, setBio] = useState('')

  const regYear = new Date().getFullYear()
  const regYears = Array.from({ length: 55 }, (_, i) => regYear - 14 - i)
  const regDays = Array.from({ length: 31 }, (_, i) => i + 1)
  const MONTHS = months[lang]

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(t.login.error_login[lang]); setLoading(false); return }
    loginTriggered.current = true
    // useEffect will redirect once authLoading is false and session is set
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { first_name: firstName, last_name: lastName, role },
        emailRedirectTo: 'https://team-up-f-rch.vercel.app/profil'
      }
    })

    if (signUpError) { setError(signUpError.message); setLoading(false); return }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id, email, role,
        first_name: firstName, last_name: lastName,
        position: role === 'player' ? position : null,
        ligue, zone,
        foot: role === 'player' ? foot : null,
        birthdate: (birthDay && birthMonth && birthYear)
          ? `${birthYear}-${birthMonth.padStart(2,'0')}-${birthDay.padStart(2,'0')}`
          : null,
        club_name: role === 'club' ? clubName : null,
        bio, available: true
      })
      if (profileError) { setError('Erreur profil: ' + profileError.message); setLoading(false); return }
    }

    setSuccess(t.login.success_register[lang])
    setLoading(false)
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://team-up-f-rch.vercel.app/reset-password'
    })
    if (error) { setError(error.message); setLoading(false); return }
    setSuccess(t.login.success_forgot[lang])
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', background: 'var(--gray-bg)', border: '1.5px solid var(--border)',
    borderRadius: 9, padding: '10px 14px', fontSize: 14, fontFamily: 'inherit',
    outline: 'none', color: 'var(--text-dark)'
  }

  const features = [
    { i: '👤', t: t.login.feat_players[lang] },
    { i: '🏟️', t: t.login.feat_clubs[lang] },
    { i: '💬', t: t.login.feat_msg[lang] },
    { i: '📢', t: t.login.feat_annonces[lang] },
    { i: '🔍', t: t.login.feat_search[lang] },
  ]

  return (
    <div style={{ minHeight: 'calc(100vh - 60px - 100px)', display: 'flex' }}>

      {/* LEFT — branding */}
      <div className="login-left" style={{ flex: 1, background: 'linear-gradient(135deg, var(--blue-dark), var(--blue-mid))', padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 12, letterSpacing: 3, color: 'rgba(255,255,255,.4)', marginBottom: '.5rem' }}>{t.login.canton[lang]}</div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2.5rem,5vw,4rem)', color: '#fff', letterSpacing: 2, lineHeight: 1 }}>
          TeamUp<span style={{ color: 'var(--red-light)' }}>FR</span>
        </h1>
        <p style={{ fontStyle: 'italic', color: 'rgba(255,255,255,.5)', margin: '.5rem 0 2rem' }}>{t.login.motto[lang]}</p>
        {features.map(f => (
          <div key={f.t} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '.65rem', color: 'rgba(255,255,255,.75)', fontSize: 14 }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{f.i}</div>
            {f.t}
          </div>
        ))}
      </div>

      {/* RIGHT — form */}
      <div style={{ width: 460, flexShrink: 0, background: '#fff', padding: '2rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflowY: 'auto' }}>

        {/* FORGOT PASSWORD MODE */}
        {mode === 'forgot' ? (
          <>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', letterSpacing: 1, marginBottom: '.25rem' }}>{t.login.forgot_title[lang]}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              {t.login.forgot_desc[lang]}
            </div>

            {error && <div style={{ background: '#fce8e8', border: '1px solid var(--red)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--red)', marginBottom: '1rem' }}>⚠️ {error}</div>}
            {success && <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--green)', marginBottom: '1rem' }}>✅ {success}</div>}

            {!success && (
              <form onSubmit={handleForgot}>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{t.login.email[lang]}</div>
                  <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ton@email.ch" required />
                </div>
                <button type="submit" disabled={loading} style={{ width: '100%', background: 'var(--blue-bright)', color: '#fff', border: 'none', borderRadius: 9, padding: 12, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, fontFamily: 'inherit' }}>
                  {loading ? t.login.sending[lang] : t.login.forgot_send[lang]}
                </button>
              </form>
            )}

            <button onClick={() => { setMode('login'); setError(''); setSuccess('') }} style={{ marginTop: '1.5rem', background: 'none', border: 'none', color: 'var(--blue-bright)', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
              {t.login.back_login[lang]}
            </button>
          </>
        ) : (
          <>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', letterSpacing: 1, marginBottom: '.25rem' }}>
              {mode === 'login' ? t.login.welcome[lang] : t.login.create[lang]}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              {mode === 'login' ? t.login.connect[lang] : t.login.join[lang]}
            </div>

            {/* SWITCHER */}
            <div style={{ display: 'flex', background: 'var(--gray-bg)', borderRadius: 10, padding: 4, marginBottom: '1.25rem' }}>
              {(['login','register'] as const).map(m => (
                <button key={m} type="button" onClick={() => { setMode(m); setError(''); setSuccess('') }} style={{
                  flex: 1, background: mode === m ? '#fff' : 'transparent',
                  color: mode === m ? 'var(--blue-mid)' : 'var(--text-muted)',
                  border: 'none', padding: 8, borderRadius: 7, fontSize: 14, fontWeight: 600,
                  boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,.1)' : 'none', cursor: 'pointer', fontFamily: 'inherit'
                }}>{m === 'login' ? t.login.connexion[lang] : t.login.inscription[lang]}</button>
              ))}
            </div>

            {error && <div style={{ background: '#fce8e8', border: '1px solid var(--red)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--red)', marginBottom: '1rem' }}>⚠️ {error}</div>}
            {success && <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--green)', marginBottom: '1rem' }}>✅ {success}</div>}

            {/* GOOGLE OAUTH — hidden until enabled in Supabase Dashboard */}

            <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>

              {mode === 'register' && <>
                {/* ROLE */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{t.login.you_are[lang]}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    {(['player','coach','club'] as const).map(r => (
                      <button key={r} type="button" onClick={() => setRole(r)} style={{
                        background: role === r ? 'var(--blue-light)' : 'var(--gray-bg)',
                        border: `1.5px solid ${role === r ? 'var(--blue-bright)' : 'var(--border)'}`,
                        color: role === r ? 'var(--blue-mid)' : 'var(--text-muted)',
                        borderRadius: 10, padding: '10px 4px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                      }}>{{ player: t.login.player[lang], coach: t.login.coach[lang], club: t.login.club[lang] }[r]}</button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{t.login.firstname[lang]}</div>
                    <input style={inputStyle} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Lucas" required />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{t.login.lastname[lang]}</div>
                    <input style={inputStyle} value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Martin" required />
                  </div>
                </div>

                {role === 'club' && <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{t.login.clubname[lang]}</div>
                  <input style={inputStyle} value={clubName} onChange={e => setClubName(e.target.value)} placeholder="FC Bulle" required />
                </div>}

                {role === 'player' && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{t.login.position[lang]}</div>
                    <select style={inputStyle} value={position} onChange={e => setPosition(e.target.value)} required>
                      <option value="">{t.login.choose[lang]}</option>
                      {POSITIONS.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{t.login.foot[lang]}</div>
                    <select style={inputStyle} value={foot} onChange={e => setFoot(e.target.value)}>
                      <option value="Droit">{t.login.right[lang]}</option>
                      <option value="Gauche">{t.login.left[lang]}</option>
                      <option value="Ambidextre">{t.login.both[lang]}</option>
                    </select>
                  </div>
                </div>}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{t.login.ligue[lang]}</div>
                    <select style={inputStyle} value={ligue} onChange={e => setLigue(e.target.value)} required>
                      <option value="">{t.login.choose[lang]}</option>
                      {LIGUES.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{t.login.zone[lang]}</div>
                    <select style={inputStyle} value={zone} onChange={e => setZone(e.target.value)} required>
                      <option value="">{t.login.choose[lang]}</option>
                      {ZONES.map(z => <option key={z}>{z}</option>)}
                    </select>
                  </div>
                </div>

                {role !== 'club' && <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{t.login.birthdate[lang]}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 6 }}>
                    <select style={inputStyle} value={birthDay} onChange={e => setBirthDay(e.target.value)} required>
                      <option value="">{t.login.day[lang]}</option>
                      {regDays.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select style={inputStyle} value={birthMonth} onChange={e => setBirthMonth(e.target.value)} required>
                      <option value="">{t.login.month[lang]}</option>
                      {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                    </select>
                    <select style={inputStyle} value={birthYear} onChange={e => setBirthYear(e.target.value)} required>
                      <option value="">{t.login.year[lang]}</option>
                      {regYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>}

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{t.login.bio[lang]}</div>
                  <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 64 }} value={bio} onChange={e => setBio(e.target.value)} placeholder={t.login.bio_ph[lang]} />
                </div>
              </>}

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{t.login.email[lang]}</div>
                <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ton@email.ch" required />
              </div>

              <div style={{ marginBottom: mode === 'login' ? 0 : '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{t.login.password[lang]}</div>
                  {mode === 'login' && (
                    <button type="button" onClick={() => { setMode('forgot'); setError(''); setSuccess('') }} style={{ background: 'none', border: 'none', color: 'var(--blue-bright)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
                      {t.login.forgot[lang]}
                    </button>
                  )}
                </div>
                <input style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={mode === 'register' ? t.login.min_pwd[lang] : '••••••••'} required minLength={6} />
              </div>

              <button type="submit" disabled={loading} style={{
                width: '100%', marginTop: '1.25rem',
                background: 'var(--blue-bright)', color: '#fff', border: 'none', borderRadius: 9,
                padding: 12, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? .7 : 1, fontFamily: 'inherit'
              }}>
                {loading ? t.login.loading_btn[lang] : mode === 'login' ? t.login.btn_login[lang] : t.login.btn_register[lang]}
              </button>
            </form>
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .login-left { display: none !important; }
        }
      `}</style>
    </div>
  )
}
