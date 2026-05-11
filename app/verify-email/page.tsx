'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { useLang } from '../../lib/lang-context'
import { t } from '../../lib/translations'

type State = 'loading' | 'success' | 'invalid'

export default function VerifyEmailPage() {
  const { lang } = useLang()
  const router = useRouter()
  const [state, setState] = useState<State>('loading')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const redirectTarget = useRef<string>('/profil')

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.slice(1))
    if (hashParams.get('error')) {
      setState('invalid')
      return
    }

    timeoutRef.current = setTimeout(() => setState('invalid'), 10000)

    const markVerified = async (userId: string) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      await supabase.from('profiles').update({ hidden: false }).eq('id', userId)
      setState('success')
      sessionStorage.removeItem('pendingVerifyEmail')
      // Check onboarding status to decide redirect target
      const { data: profile } = await supabase
        .from('profiles')
        .select('profile_completed, onboarding_skipped')
        .eq('id', userId)
        .single()
      if (profile && profile.profile_completed === false && profile.onboarding_skipped !== true) {
        redirectTarget.current = '/onboarding'
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user?.email_confirmed_at) {
        markVerified(session.user.id)
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email_confirmed_at) markVerified(session.user.id)
    })

    return () => {
      subscription.unsubscribe()
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (state === 'success') {
      const timer = setTimeout(() => router.push(redirectTarget.current), 3000)
      return () => clearTimeout(timer)
    }
  }, [state, router])

  return (
    <div style={{ background: '#030a24', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', fontFamily: 'inherit' }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{ width: '100%', maxWidth: 460, animation: 'fadeIn .5s ease both' }}>
        <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 24, padding: '2.5rem 2rem', textAlign: 'center' }}>

          {state === 'loading' && (
            <>
              <div style={{ width: 44, height: 44, border: '4px solid rgba(255,255,255,.1)', borderTopColor: '#e63946', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 1.5rem' }} />
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', letterSpacing: 1, color: '#fff', marginBottom: '.5rem' }}>
                {t.login.verify_loading[lang]}
              </div>
              <p style={{ color: 'rgba(255,255,255,.35)', fontSize: 12 }}>
                {t.login.reset_expired_hint[lang]}
              </p>
            </>
          )}

          {state === 'success' && (
            <>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(76,219,122,.12)', border: '2px solid rgba(76,219,122,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2rem' }}>
                ✓
              </div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: 1, color: '#4cdb7a', marginBottom: '.75rem' }}>
                {t.login.verify_success_title[lang]}
              </div>
              <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 14, lineHeight: 1.6, marginBottom: '1.75rem' }}>
                {t.login.verify_success_desc[lang]}
              </p>
              <button
                onClick={() => router.push(redirectTarget.current)}
                style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: '#e63946', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                {t.login.verify_success_btn[lang]}
              </button>
            </>
          )}

          {state === 'invalid' && (
            <>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(230,57,70,.12)', border: '2px solid rgba(230,57,70,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2rem' }}>
                ✕
              </div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: 1, color: '#e63946', marginBottom: '.75rem' }}>
                {t.login.verify_invalid_title[lang]}
              </div>
              <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 14, lineHeight: 1.6, marginBottom: '1.75rem' }}>
                {t.login.verify_invalid_desc[lang]}
              </p>
              <Link
                href="/verify-email-pending"
                style={{ display: 'block', width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: '#e63946', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none', marginBottom: '1rem' }}
              >
                {t.login.verify_resend[lang]}
              </Link>
              <Link href="/login" style={{ color: 'rgba(255,255,255,.4)', fontSize: 13, textDecoration: 'none' }}>
                {t.login.verify_back_login[lang]}
              </Link>
            </>
          )}

        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'rgba(255,255,255,.2)', fontSize: 12 }}>
          TeamUpFR · {lang === 'fr' ? 'Canton de Fribourg' : 'Kanton Freiburg'}
        </div>
      </div>
    </div>
  )
}
