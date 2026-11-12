// Only the landing, account entry/recovery and legal pages are public.
const publicPages = new Set(['/', '/accueil', '/login', '/verify-email', '/verify-email-pending', '/reset-password', '/privacy', '/cgu'])

export function isPublicPage(pathname: string | null): boolean {
  if (!pathname) return false
  return publicPages.has(pathname?.replace(/\/+$/, '') || '/')
}

export function memberLoginHref(pathname: string | null, register = false): string {
  const destination = pathname?.startsWith('/') && !pathname.startsWith('//') ? pathname : '/annonces'
  return `/login?${register ? 'mode=register&' : ''}redirect=${encodeURIComponent(destination)}`
}
