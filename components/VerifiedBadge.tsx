'use client'

import { useLang } from '../lib/lang-context'

export default function VerifiedBadge({ size = 20 }: { size?: number }) {
  const { lang } = useLang()
  return (
    <svg
      width={size} height={size} viewBox="0 0 20 20"
      style={{ verticalAlign: 'middle', flexShrink: 0, display: 'inline-block' }}
      role="img" aria-label={lang === 'de' ? 'Verifiziert' : 'Vérifié'}
    >
      <circle cx="10" cy="10" r="10" fill="#3A7AFF" />
      <path d="M6 10.5L8.5 13L14 7.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}
