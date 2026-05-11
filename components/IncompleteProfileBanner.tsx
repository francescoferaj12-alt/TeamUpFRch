'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { useLang } from '../lib/lang-context'
import { t } from '../lib/translations'

export default function IncompleteProfileBanner() {
  const { lang } = useLang()
  const pathname = usePathname()
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Don't show on onboarding page itself
    if (pathname === '/onboarding') { setShow(false); return }
    if (dismissed) { setShow(false); return }

    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setShow(false); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('profile_completed, hidden')
        .eq('id', session.user.id)
        .single()

      // Only show if email is verified (hidden=false) and profile not completed
      if (profile && profile.hidden === false && profile.profile_completed === false) {
        setShow(true)
      } else {
        setShow(false)
      }
    }
    check()
  }, [pathname, dismissed])

  if (!show) return null

  return (
    <div style={{
      background: 'linear-gradient(90deg, #b45309, #d97706)',
      color: '#fff',
      padding: '10px 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      flexWrap: 'wrap',
      fontSize: 14,
      fontWeight: 500,
    }}>
      <span>{t.onboarding.banner_text[lang]}</span>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <button
          onClick={() => router.push('/onboarding')}
          style={{
            background: '#fff',
            color: '#b45309',
            border: 'none',
            borderRadius: 8,
            padding: '6px 14px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
          }}
        >
          {t.onboarding.banner_btn[lang]}
        </button>
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,.7)',
            fontSize: 13,
            cursor: 'pointer',
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
          }}
        >
          {t.onboarding.banner_dismiss[lang]}
        </button>
      </div>
    </div>
  )
}
