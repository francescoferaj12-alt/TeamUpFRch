'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { useLang } from '../../lib/lang-context'
import { t } from '../../lib/translations'

function strengthScore(pwd: string): 0 | 1 | 2 {
  if (pwd.length < 6) return 0
  if (pwd.length < 8 || !/[0-9]/.test(pwd)) return 1
  return 2
}

const Svg = ({ children, size = 18, ...p }: any) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    {children}
  </svg>
)
const IcoCheck   = ({ s = 40 }: { s?: number }) => <Svg size={s} stroke="#2ED27F" strokeWidth="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></Svg>
const IcoWarn    = ({ s = 40 }: { s?: number }) => <Svg size={s} stroke="#FF3A3A" strokeWidth="1.8"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></Svg>
const IcoEye     = ({ s = 14 }: { s?: number }) => <Svg size={s}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></Svg>
const IcoEyeOff  = ({ s = 14 }: { s?: number }) => <Svg size={s}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></Svg>

export default function ResetPasswordPage() {
  const { lang } = useLang()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [ready, setReady] = useState(false)
  const [expired, setExpired] = useState(false)
  const router = useRouter()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // 1. Check URL hash immediately for Supabase error (e.g. token already consumed by email scanner)
    const hashParams = new URLSearchParams(window.location.hash.slice(1))
    if (hashParams.get('error')) {
      setExpired(true)
      return
    }

    // 2. Start timeout — only triggered if no valid session is found
    timeoutRef.current = setTimeout(() => setExpired(true), 10000)

    const markReady = () => {
      setReady(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }

    // 3. Subscribe to future auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') && session) {
        markReady()
      }
    })

    // 4. Fallback: check if Supabase already processed the token before we subscribed
    //    (PASSWORD_RECOVERY event fires on Supabase init, before React's useEffect runs)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) markReady()
    })
    return () => {
      subscription.unsubscribe()
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError(t.login.pwd_min_chars[lang]); return }
    if (!/[0-9]/.test(password)) { setError(t.login.pwd_need_number[lang]); return }
    if (password !== confirm) { setError(t.login.error_pwd_match[lang]); return }
    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) { setError(t.login.reset_error[lang]); setLoading(false); return }
    setSuccess(true)
    setTimeout(() => router.push('/login?reset=1'), 2500)
  }

  const strength = strengthScore(password)
  const strengthColors = ['#FF3A3A', '#FF9A3A', '#2ED27F']
  const strengthLabels = [t.login.pwd_strength_weak[lang], t.login.pwd_strength_ok[lang], t.login.pwd_strength_strong[lang]]

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,.07)', border: '1.5px solid rgba(255,255,255,.12)',
    borderRadius: 9, padding: '10px 42px 10px 14px', fontSize: 14, fontFamily: 'inherit',
    outline: 'none', color: '#fff', boxSizing: 'border-box',
  }
  const lblSt: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.45)',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, display: 'block',
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 60px - 100px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#081434', padding: '2rem 1rem', position: 'relative', overflow: 'hidden' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>

      {/* Background glow */}
      <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,58,58,.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 440, background: 'rgba(13,31,74,.97)', borderRadius: 20, border: '1px solid rgba(255,255,255,.1)', padding: '2.5rem 2rem', boxShadow: '0 8px 48px rgba(0,0,0,.6)', position: 'relative', color: '#fff' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <img src="/images/logo-official.jpeg" alt="TeamUpFR" style={{ width: 38, height: 38, borderRadius: 9, border: '2px solid rgba(255,255,255,.15)', objectFit: 'cover' }} />
            <span style={{ fontFamily: "'Russo One', sans-serif", fontSize: '1.5rem', letterSpacing: 1 }}>
              <span className="brand-teamup">TeamUp</span>
              <span className="brand-f">F</span>
              <span className="brand-r">R</span>
            </span>
          </Link>
        </div>

        {success ? (
          /* ── Success state ── */
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(46,210,127,.1)', border: '2px solid rgba(46,210,127,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}><IcoCheck s={36} /></div>
            <div style={{ fontFamily: "'Russo One', sans-serif", fontSize: '1.8rem', letterSpacing: 1, marginBottom: '.5rem', color: '#2ED27F' }}>
              {t.login.reset_success_title[lang]}
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,.55)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {t.login.reset_success_desc[lang]}
            </div>
            <div style={{ width: 28, height: 28, border: '3px solid rgba(255,255,255,.1)', borderTopColor: '#FF3A3A', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto' }} />
          </div>

        ) : expired && !ready ? (
          /* ── Link invalid / expired state ── */
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,58,58,.1)', border: '2px solid rgba(255,58,58,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}><IcoWarn s={36} /></div>
            <div style={{ fontFamily: "'Russo One', sans-serif", fontSize: '1.6rem', letterSpacing: 1, marginBottom: '.75rem', color: '#FF3A3A' }}>
              Lien invalide
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,.5)', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              {t.login.reset_invalid_desc[lang]}
            </div>
            <Link href="/login" style={{ background: '#FF3A3A', color: '#fff', borderRadius: 999, padding: '11px 28px', fontWeight: 700, fontSize: 14, textDecoration: 'none', display: 'inline-block', boxShadow: '0 4px 14px rgba(255,58,58,.35)' }}>
              {t.login.reset_request_new[lang]}
            </Link>
          </div>

        ) : !ready ? (
          /* ── Waiting for Supabase session ── */
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'rgba(255,255,255,.5)' }}>
            <div style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,.1)', borderTopColor: '#FF3A3A', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 1rem' }} />
            <div style={{ fontSize: 14 }}>{t.login.reset_verifying[lang]}</div>
            <div style={{ fontSize: 12, marginTop: '.5rem', color: 'rgba(255,255,255,.3)' }}>{t.login.reset_expired_hint[lang]}</div>
          </div>

        ) : (
          /* ── Password form ── */
          <>
            <div style={{ fontFamily: "'Russo One', sans-serif", fontSize: '1.8rem', letterSpacing: 1, marginBottom: '.25rem', textAlign: 'center' }}>
              {t.login.reset_title[lang]}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', marginBottom: '1.5rem', textAlign: 'center', lineHeight: 1.5 }}>
              {t.login.reset_subtitle[lang]}
            </div>

            {error && (
              <div style={{ background: 'rgba(255,58,58,.1)', border: '1px solid rgba(255,58,58,.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#FF3A3A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <IcoWarn s={14} />{error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* New password */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={lblSt}>{t.login.reset_new_pwd[lang]}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    style={inputStyle}
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 car. + 1 chiffre"
                    required
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowPwd(v => !v)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
                    {showPwd ? <IcoEyeOff s={14} /> : <IcoEye s={14} />}
                  </button>
                </div>
                {/* Strength bar */}
                {password.length > 0 && (
                  <div style={{ marginTop: 7 }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? strengthColors[strength] : 'rgba(255,255,255,.1)', transition: 'background .2s' }} />
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: strengthColors[strength], fontWeight: 600 }}>
                      {strengthLabels[strength]} · {password.length} car.
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={lblSt}>{t.login.reset_confirm_pwd[lang]}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    style={{ ...inputStyle, borderColor: confirm && confirm !== password ? '#FF3A3A' : undefined }}
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder={t.login.reset_confirm_pwd_ph[lang]}
                    required
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
                    {showConfirm ? <IcoEyeOff s={14} /> : <IcoEye s={14} />}
                  </button>
                </div>
                {confirm && confirm !== password && (
                  <div style={{ fontSize: 12, color: '#FF3A3A', marginTop: 5 }}>
                    {t.login.error_pwd_match[lang]}
                  </div>
                )}
              </div>

              <button type="submit" disabled={loading} style={{ width: '100%', background: '#FF3A3A', color: '#fff', border: 'none', borderRadius: 999, padding: 12, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(255,58,58,.35)' }}>
                {loading ? t.login.reset_updating[lang] : t.login.reset_btn[lang]}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
              <Link href="/login" style={{ color: 'rgba(255,255,255,.35)', fontSize: 13, textDecoration: 'none' }}>
                {t.login.back_login[lang]}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
