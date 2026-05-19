'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '../lib/auth-context'
import { useLang } from '../lib/lang-context'
import { t } from '../lib/translations'

export default function ClubPendingBanner() {
  const { profile } = useAuth()
  const { lang } = useLang()
  const pathname = usePathname()

  if (!profile) return null
  if (profile.role !== 'club') return null
  if (profile.club_verification_status === 'approved') return null
  if (pathname === '/login' || pathname === '/onboarding') return null

  const isRejected = profile.club_verification_status === 'rejected'

  const bg = isRejected ? 'rgba(230,57,70,0.12)' : 'rgba(255,165,0,0.10)'
  const border = isRejected ? 'rgba(230,57,70,0.35)' : 'rgba(255,165,0,0.35)'
  const color = isRejected ? '#ff6b6b' : '#ffa500'
  const icon = isRejected ? '❌' : '⏳'

  const title = isRejected
    ? t.clubVerif.rejected_title[lang]
    : t.clubVerif.pending_title[lang]

  const body = isRejected
    ? (profile.club_rejection_reason
        ? `${t.clubVerif.rejected_reason[lang]} ${profile.club_rejection_reason}`
        : t.clubVerif.rejected_body[lang])
    : t.clubVerif.pending_body[lang]

  return (
    <div style={{ background: bg, borderBottom: `1px solid ${border}`, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ color, fontWeight: 700, fontSize: 14 }}>{title}</span>
      <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{body}</span>
    </div>
  )
}
