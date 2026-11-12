import type { Lang } from '../lib/translations'

export type NavigationKey = 'feed' | 'search' | 'clubs' | 'publish' | 'messages' | 'account'
export type NavigationItem = { key: NavigationKey; href: string; label: string; shortLabel: string; requiresLogin: boolean }

const labels = {
  fr: { feed: 'Accueil', search: 'Chercher', clubs: 'Clubs', publish: 'Publier', messages: 'Messages', account: 'Mon espace' },
  de: { feed: 'Startseite', search: 'Suchen', clubs: 'Vereine', publish: 'Erstellen', messages: 'Nachrichten', account: 'Mein Bereich' },
}

export function navigationItems(lang: Lang): NavigationItem[] {
  const copy = labels[lang]
  return [
    { key: 'feed', href: '/annonces', label: copy.feed, shortLabel: copy.feed, requiresLogin: false },
    { key: 'search', href: '/recherche', label: copy.search, shortLabel: copy.search, requiresLogin: false },
    { key: 'clubs', href: '/clubs', label: copy.clubs, shortLabel: copy.clubs, requiresLogin: false },
    { key: 'publish', href: '/publier', label: copy.publish, shortLabel: copy.publish, requiresLogin: true },
    { key: 'messages', href: '/messages', label: copy.messages, shortLabel: copy.messages, requiresLogin: true },
    { key: 'account', href: '/profil', label: copy.account, shortLabel: lang === 'de' ? 'Bereich' : 'Espace', requiresLogin: true },
  ]
}

export function navigationHref(item: NavigationItem, signedIn: boolean): string {
  // Guests can reach the locked preview; the gate offers login and signup.
  return item.href
}

export function navigationActive(item: NavigationItem, pathname: string | null): boolean {
  return pathname === item.href
    || (item.key === 'clubs' && !!pathname?.startsWith('/club/'))
    || (item.key === 'account' && (pathname === '/dashboard' || pathname === '/candidatures'))
}

export function NavigationIcon({ name, size = 23 }: { name: NavigationKey; size?: number }) {
  const paths = {
    feed: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" /></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
    clubs: <><path d="M3 21V8l9-5 9 5v13" /><path d="M9 21V12h6v9" /></>,
    publish: <path d="M12 5v14M5 12h14" />,
    messages: <path d="M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5Z" />,
    account: <><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a8 8 0 0 1 16 0v1" /></>,
  }
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}
