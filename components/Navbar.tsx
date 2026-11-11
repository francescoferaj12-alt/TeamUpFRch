'use client'

import { realtimeFallback } from '../lib/realtime-fallback'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { supabase, avatarSrc } from '../lib/supabase'
import LangSwitcher from './LangSwitcher'
import MobileBottomNav from './MobileBottomNav'
import { useLang } from '../lib/lang-context'
import { t } from '../lib/translations'
import { useAuth } from '../lib/auth-context'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { lang } = useLang()
  const { session, profile } = useAuth()
  const [unread, setUnread] = useState(0)
  const [unreadApps, setUnreadApps] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const pathnameRef = useRef(pathname)
  useEffect(() => { pathnameRef.current = pathname }, [pathname])

  const user = profile
    ? {
        email: profile.email,
        initials: `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase() || '??',
        avatar_url: profile.avatar_url,
      }
    : null

  const links = [
    { href: '/recherche',   label: t.nav.recherche[lang] },
    { href: '/annonces',    label: t.nav.annonces[lang] },
    { href: '/clubs',       label: t.nav.clubs[lang] },
    { href: '/dashboard',   label: t.nav.dashboard[lang] },
    { href: '/candidatures',label: t.nav.candidatures[lang] },
    ...(user ? [{ href: '/messages', label: t.nav.messages[lang] }] : []),
  ]

  // Scroll-aware background opacity
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ── Messages badge ──────────────────────────────────────────────────────────
  // Strategy: query once on session load + Realtime for new arrivals.
  // Never re-query just because pathname changed — that races against mark-as-read.
  useEffect(() => {
    if (!session) { setUnread(0); return }
    const uid = session.user.id
    const queryUnread = () => {
      if (pathnameRef.current === '/messages') { setUnread(0); return }
      supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('receiver_id', uid)
        .eq('read', false)
        .then(({ count }) => setUnread(count || 0))
    }
    queryUnread()
    const fallback = realtimeFallback(queryUnread)
    const channel = supabase
      .channel(`nav-unread-${uid}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${uid}` }, queryUnread)
      .subscribe(fallback.status)
    return () => { fallback.stop(); supabase.removeChannel(channel) }
  }, [session?.user?.id])

  // Clear badge immediately when the user lands on /messages
  useEffect(() => {
    if (pathname === '/messages') setUnread(0)
  }, [pathname])

  // Listen for explicit "I just marked my messages as read" event from the
  // /messages page. This is the authoritative signal — clears the badge even
  // if a stale realtime/session-refresh re-query happens to race in.
  useEffect(() => {
    const handler = () => setUnread(0)
    window.addEventListener('messages-read', handler)
    return () => window.removeEventListener('messages-read', handler)
  }, [])

  // ── Candidatures badge (club / coach only) ──────────────────────────────────
  useEffect(() => {
    if (!session || !profile) return
    if (profile.role !== 'club' && profile.role !== 'coach') return
    const uid = session.user.id
    const queryApps = () => {
      if (pathnameRef.current === '/candidatures') { setUnreadApps(0); return }
      supabase
        .from('applications')
        .select('annonces!inner(author_id)', { count: 'exact', head: true })
        .eq('annonces.author_id', uid)
        .or('seen_by_owner.is.null,seen_by_owner.eq.false')
        .then(({ count }) => setUnreadApps(count || 0))
    }
    queryApps()
    const fallback = realtimeFallback(queryApps)
    const channel = supabase
      .channel(`nav-apps-${uid}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'applications' }, queryApps)
      .subscribe(fallback.status)
    return () => { fallback.stop(); supabase.removeChannel(channel) }
  }, [session?.user?.id, profile?.id, profile?.role])

  // Clear badge immediately when the user lands on /candidatures
  useEffect(() => {
    if (pathname === '/candidatures') setUnreadApps(0)
  }, [pathname])

  // Listen for explicit "I just marked candidatures as seen" event from the
  // /candidatures page. Authoritative signal that survives navigation away.
  useEffect(() => {
    const handler = () => setUnreadApps(0)
    window.addEventListener('candidatures-seen', handler)
    return () => window.removeEventListener('candidatures-seen', handler)
  }, [])

  // Unseen candidatures badge (club/coach only)
  useEffect(() => {
    if (!session || !profile) return
    if (profile.role !== 'club' && profile.role !== 'coach') return
    if (pathname === '/candidatures') { setUnreadApps(0); return }
    const uid = session.user.id
    supabase
      .from('applications')
      .select('annonces!inner(author_id)', { count: 'exact', head: true })
      .eq('annonces.author_id', uid)
      .or('seen_by_owner.is.null,seen_by_owner.eq.false')
      .then(({ count }) => setUnreadApps(count || 0))
  }, [pathname, session, profile?.role])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 8, fontWeight: 700, color: '#fff',
    width: 14, height: 14, borderRadius: '50%',
    background: '#FF3A3A', flexShrink: 0,
  }

  return (
    <>
      <nav className={`nav${scrolled ? ' nav-scrolled' : ''}`}>
        <Link href={user ? "/annonces" : "/"} className="nav-logo" aria-label="TeamUpFR" style={{ textDecoration: 'none' }}>
          <span className="official-brand-logo"><img src="/images/logo-official.jpeg" width="48" height="48" alt="" /></span>
          <span className="brand-text">
            <span className="brand-teamup">TeamUp</span>
            <span className="brand-f">F</span>
            <span className="brand-r">R</span>
          </span>
        </Link>

        <div className="nav-links nav-desktop" style={{ overflow: 'auto', maxWidth: '52vw' }}>
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`nav-link${pathname?.startsWith(l.href) ? ' active' : ''}`}
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}
            >
              {l.label}
              {l.href === '/messages' && unread > 0 && (
                <span style={badgeStyle}>{unread > 9 ? '9+' : unread}</span>
              )}
              {l.href === '/candidatures' && unreadApps > 0 && (
                <span style={badgeStyle}>{unreadApps > 9 ? '9+' : unreadApps}</span>
              )}
            </Link>
          ))}
        </div>

        <div className="nav-right">
          <LangSwitcher />
          {user ? (
            <>
              <Link
                href="/profil"
                className="nav-avatar"
                title={user.email}
                style={{ textDecoration: 'none', overflow: 'hidden', padding: user.avatar_url ? 0 : undefined }}
              >
                {user.avatar_url
                  ? <img src={avatarSrc(user.avatar_url)!} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
                  : user.initials
                }
              </Link>
              <button
                onClick={handleLogout}
                className="nav-desktop"
                style={{ background: 'none', border: 'none', color: 'rgba(255,100,100,0.9)', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: '5px 10px', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
              >
                {t.nav.deconnexion[lang]}
              </button>
            </>
          ) : (
            <Link href="/login" className="btn btn-red btn-sm nav-login">
              {t.nav.connexion[lang]}
            </Link>
          )}

        </div>
      </nav>

      <MobileBottomNav lang={lang} signedIn={!!session} unread={unread} />

    </>
  )
}
