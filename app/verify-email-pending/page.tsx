'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { useLang } from '../../lib/lang-context'
import { t } from '../../lib/translations'

const Svg = ({ children, size = 18, ...p }: any) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    {children}
  </svg>
)
const IcoMail  = ({ s = 32 }: { s?: number }) => <Svg size={s} strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></Svg>
const IcoCheck = ({ s = 14 }: { s?: number }) => <Svg size={s} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></Svg>

export default function VerifyEmailPendingPage() {
  const { lang } = useLang()
  const [email, setEmail] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? sessionStorage.getItem('pendingVerifyEmail') : ''
    if (stored) setEmail(stored)
    return () => { if (cooldownRef.current) clearInterval(cooldownRef.current) }
  }, [])

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

  async function handleResend() {
    if (!email || cooldown > 0) return
    setError('')
    setSent(false)
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: 'https://teamupfr.ch/verify-email' }
    })
    if (resendError) {
      setError(resendError.message)
    } else {
      setSent(true)
      startCooldown()
    }
  }

  return (
    <div style={{ background: '#081434', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', fontFamily: 'inherit' }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}`}</style>

      <div style={{ width: '100%', maxWidth: 460, animation: 'fadeIn .5s ease both' }}>
        {/* Card */}
        <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 24, padding: '2.5rem 2rem', textAlign: 'center' }}>
          {/* Icon */}
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,58,58,.1)', border: '2px solid rgba(255,58,58,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#FF3A3A' }}>
            <IcoMail s={32} />
          </div>

          <div style={{ fontFamily: "'Russo One', sans-serif", fontSize: '2rem', letterSpacing: 1, color: '#fff', marginBottom: '.75rem' }}>
            {t.login.verify_pending_title[lang]}
          </div>

          <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 14, lineHeight: 1.6, marginBottom: email ? '1rem' : '1.5rem' }}>
            {t.login.verify_pending_desc[lang]}
          </p>

          {email && (
            <div style={{ background: 'rgba(255,58,58,.08)', border: '1px solid rgba(255,58,58,.2)', borderRadius: 10, padding: '10px 16px', marginBottom: '1.5rem', fontSize: 14, color: '#FF3A3A', fontWeight: 600, wordBreak: 'break-all' }}>
              {email}
            </div>
          )}

          <p style={{ color: 'rgba(255,255,255,.35)', fontSize: 12, marginBottom: '1.75rem' }}>
            {t.login.verify_check_spam[lang]}
          </p>

          {/* Sent banner */}
          {sent && (
            <div style={{ background: 'rgba(46,210,127,.1)', border: '1px solid rgba(46,210,127,.3)', borderRadius: 10, padding: '10px 16px', marginBottom: '1rem', fontSize: 13, color: '#2ED27F', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <IcoCheck s={13} />{t.login.resend_confirm_sent[lang]}
            </div>
          )}

          {error && (
            <div style={{ background: 'rgba(255,58,58,.1)', border: '1px solid rgba(255,58,58,.3)', borderRadius: 10, padding: '10px 16px', marginBottom: '1rem', fontSize: 13, color: '#FF3A3A' }}>
              {error}
            </div>
          )}

          {/* Resend button */}
          <button
            onClick={handleResend}
            disabled={cooldown > 0 || !email}
            style={{
              width: '100%', padding: '13px', borderRadius: 12, border: 'none',
              background: cooldown > 0 ? 'rgba(255,255,255,.06)' : '#FF3A3A',
              color: cooldown > 0 ? 'rgba(255,255,255,.4)' : '#fff',
              fontWeight: 700, fontSize: 15, cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', marginBottom: '1rem', transition: 'background .2s',
            }}
          >
            {cooldown > 0
              ? `${t.login.verify_resend_wait[lang]} ${cooldown}s…`
              : t.login.verify_resend[lang]}
          </button>

          <Link href="/login" style={{ color: 'rgba(255,255,255,.4)', fontSize: 13, textDecoration: 'none' }}>
            {t.login.verify_already[lang]}
          </Link>
        </div>

        {/* Branding */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'rgba(255,255,255,.2)', fontSize: 12 }}>
          TeamUpFR · {lang === 'fr' ? 'Canton de Fribourg' : 'Kanton Freiburg'}
        </div>
      </div>
    </div>
  )
}
