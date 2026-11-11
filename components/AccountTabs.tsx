'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLang } from '../lib/lang-context'

export default function AccountTabs() {
  const pathname = usePathname()
  const { lang } = useLang()
  const copy = lang === 'de'
    ? { title: 'Mein Bereich', navigation: 'Bereiche meines Kontos', profile: 'Mein Profil', dashboard: 'Übersicht' }
    : { title: 'Mon espace', navigation: 'Rubriques de mon espace', profile: 'Mon profil', dashboard: 'Tableau de bord' }

  return <section className="account-space-header">
    <div className="account-space-inner">
      <span className="account-space-title">{copy.title}</span>
      <nav className="account-space-tabs" aria-label={copy.navigation}>
        <Link href="/profil" aria-current={pathname === '/profil' ? 'page' : undefined}>{copy.profile}</Link>
        <Link href="/dashboard" aria-current={pathname === '/dashboard' ? 'page' : undefined}>{copy.dashboard}</Link>
      </nav>
    </div>
  </section>
}
