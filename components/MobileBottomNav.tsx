'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Lang } from '../lib/translations'

const labels = {
  fr: { navigation: 'Navigation principale', feed: 'Annonces', search: 'Chercher', publish: 'Publier', messages: 'Messages', profile: 'Mon espace', clubs: 'Clubs', unread: 'messages non lus' },
  de: { navigation: 'Hauptnavigation', feed: 'Anzeigen', search: 'Suchen', publish: 'Erstellen', messages: 'Nachrichten', profile: 'Mein Bereich', clubs: 'Vereine', unread: 'ungelesene Nachrichten' },
}

export default function MobileBottomNav({ lang, signedIn, unread }: { lang: Lang; signedIn: boolean; unread: number }) {
  const pathname = usePathname()
  const copy = labels[lang]
  const items = [
    { href: '/annonces', label: copy.feed, icon: <><rect x="4" y="3" width="16" height="18" rx="3" /><path d="M8 8h8M8 12h8M8 16h5" /></> },
    { href: '/recherche', label: copy.search, icon: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></> },
    { href: '/clubs', label: copy.clubs, icon: <><path d="M3 21V8l9-5 9 5v13" /><path d="M9 21V12h6v9" /></> },
    { href: '/publier', label: copy.publish, icon: <path d="M12 5v14M5 12h14" />, publish: true },
    { href: '/messages', label: copy.messages, icon: <path d="M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5Z" /> },
    { href: '/profil', label: copy.profile, icon: <><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a8 8 0 0 1 16 0v1" /></> },
  ]

  return <nav className="mobile-bottom-nav mobile-bottom-nav-six" aria-label={copy.navigation}>
    {items.map(item => {
      const active = pathname === item.href || (item.href === '/clubs' && pathname?.startsWith('/club/')) || (item.href === '/profil' && pathname === '/dashboard')
      const needsLogin = !signedIn && ['/publier', '/messages', '/dashboard', '/profil'].includes(item.href)
      return <Link key={item.href} href={needsLogin ? `/login?redirect=${encodeURIComponent(item.href)}` : item.href}
        className={`mobile-nav-item${active ? ' active' : ''}${item.publish ? ' mobile-nav-publish' : ''}`}
        aria-label={item.label} aria-current={active ? 'page' : undefined}>
        <span className="mobile-nav-icon">
          <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{item.icon}</svg>
          {item.href === '/messages' && unread > 0 && <span className="mobile-nav-badge" aria-label={`${unread} ${copy.unread}`}>{unread > 9 ? '9+' : unread}</span>}
        </span>
        <span>{item.href === '/profil' ? (lang === 'de' ? 'Bereich' : 'Espace') : item.label}</span>
      </Link>
    })}
  </nav>
}
