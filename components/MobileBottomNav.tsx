'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Lang } from '../lib/translations'
import { navigationItems, navigationHref, navigationActive, NavigationIcon } from './navigation-items'

export default function MobileBottomNav({ lang, signedIn, unread, unreadApplications = 0 }: { lang: Lang; signedIn: boolean; unread: number; unreadApplications?: number }) {
  const pathname = usePathname()
  return <nav className="mobile-bottom-nav mobile-bottom-nav-six" aria-label={lang === 'de' ? 'Hauptnavigation' : 'Navigation principale'}>
    {navigationItems(lang).map(item => {
      const active = navigationActive(item, pathname)
      const badge = item.key === 'messages' ? unread : item.key === 'account' ? unreadApplications : 0
      const badgeLabel = item.key === 'messages'
        ? (lang === 'de' ? 'ungelesene Nachrichten' : 'messages non lus')
        : (lang === 'de' ? 'neue Bewerbungen' : 'nouvelles candidatures')
      return <Link key={item.key} href={navigationHref(item, signedIn)}
        className={`mobile-nav-item${active ? ' active' : ''}${item.key === 'publish' ? ' mobile-nav-publish' : ''}`}
        aria-label={item.label} aria-current={active ? 'page' : undefined}>
        <span className="mobile-nav-icon">
          <NavigationIcon name={item.key} />
          {badge > 0 && <span className="mobile-nav-badge" aria-label={`${badge} ${badgeLabel}`}>{badge > 9 ? '9+' : badge}</span>}
        </span>
        <span>{item.shortLabel}</span>
      </Link>
    })}
  </nav>
}
