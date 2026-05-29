'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth-context'
import { useLang } from '../lib/lang-context'
import { t } from '../lib/translations'

export default function EmailVerificationBanner() {
  const { session, authLoading } = useAuth()
  const { lang } = useLang()
  const [dismissed, setDismissed] = useState(false)
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  if (authLoading || !session || session.user.email_confirmed_at || dismissed) return null

  async function handleResend() {
    if (sending || sent) return
    setSending(true)
    await supabase.auth.resend({
      type: 'signup',
      email: session!.user.email!,
      options: { emailRedirectTo: 'https://teamupfr.ch/verify-email' }
    })
    setSent(true)
    setSending(false)
  }

  return (
    <div style={{
      background: 'rgba(255,58,58,.12)',
      borderBottom: '1px solid rgba(255,58,58,.25)',
      padding: '10px 1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      flexWrap: 'wrap',
      fontSize: 13,
      color: 'rgba(255,255,255,.85)',
      fontFamily: 'inherit',
    }}>
      <span style={{ flex: 1, minWidth: 200 }}>
        ✉️ {t.login.verify_banner_text[lang]}
      </span>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button
          onClick={handleResend}
          disabled={sending || sent}
          style={{
            background: sent ? 'rgba(76,219,122,.15)' : '#FF3A3A',
            color: sent ? '#4cdb7a' : '#fff',
            border: sent ? '1px solid rgba(76,219,122,.4)' : 'none',
            borderRadius: 8,
            padding: '6px 14px',
            fontWeight: 700,
            fontSize: 12,
            cursor: sending || sent ? 'default' : 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {sent ? t.login.verify_banner_sent[lang] : sending ? '⏳' : t.login.verify_banner_btn[lang]}
        </button>
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'transparent',
            color: 'rgba(255,255,255,.4)',
            border: '1px solid rgba(255,255,255,.15)',
            borderRadius: 8,
            padding: '6px 12px',
            fontWeight: 600,
            fontSize: 12,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {t.login.verify_banner_dismiss[lang]}
        </button>
      </div>
    </div>
  )
}
