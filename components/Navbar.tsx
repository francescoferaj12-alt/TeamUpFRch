'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import LangSwitcher from './LangSwitcher'
import { useLang } from '../lib/lang-context'
import { t } from '../lib/translations'
import { useAuth } from '../lib/auth-context'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { lang } = useLang()
  const { session, profile } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const [unreadApps, setUnreadApps] = useState(0)
  const [scrolled, setScrolled] = useState(false)

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

  // Unread message badge
  useEffect(() => {
    if (!session) { setUnread(0); return }
    const uid = session.user.id
    const refresh = () => {
      supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('receiver_id', uid)
        .eq('read', false)
        .then(({ count }) => setUnread(count || 0))
    }
    refresh()
    const channel = supabase
      .channel(`nav-unread-${uid}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${uid}` }, refresh)
      .subscribe()
    // Listen for direct notification from messages page when messages are marked read
    window.addEventListener('messages-read', refresh)
    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener('messages-read', refresh)
    }
  }, [session])

  useEffect(() => {
    setMenuOpen(false)
    if (!session) return
    // While on /messages the user is actively reading — hide badge immediately
    if (pathname === '/messages') { setUnread(0); return }
    // On every other page, re-query the real count from DB
    const uid = session.user.id
    supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('receiver_id', uid)
      .eq('read', false)
      .then(({ count }) => setUnread(count || 0))
  }, [pathname, session])

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
    background: '#e63946', flexShrink: 0,
  }

  return (
    <>
      <nav className={`nav${scrolled ? ' nav-scrolled' : ''}`}>
        <Link href="/" className="nav-logo" style={{ textDecoration: 'none' }}>
          <img
            src="/images/logo-official.jpeg"
            alt="TeamUpFR"
            style={{ height: 38, width: 38, objectFit: 'cover', borderRadius: 9, border: '2px solid rgba(255,255,255,.18)', flexShrink: 0 }}
          />
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
                  ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
            <Link href="/login" className="btn btn-red btn-sm">
              {t.nav.connexion[lang]}
            </Link>
          )}

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="nav-hamburger"
            aria-label="Menu"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, flexDirection: 'column', gap: 5 }}
          >
            <span style={{ width: 22, height: 2, background: 'rgba(255,255,255,.85)', borderRadius: 2, display: 'block', transition: 'all .2s', transform: menuOpen ? 'rotate(45deg) translate(0,7px)' : 'none' }} />
            <span style={{ width: 22, height: 2, background: 'rgba(255,255,255,.85)', borderRadius: 2, display: 'block', opacity: menuOpen ? 0 : 1, transition: 'all .2s' }} />
            <span style={{ width: 22, height: 2, background: 'rgba(255,255,255,.85)', borderRadius: 2, display: 'block', transition: 'all .2s', transform: menuOpen ? 'rotate(-45deg) translate(0,-7px)' : 'none' }} />
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{ position: 'fixed', top: 60, left: 0, right: 0, background: 'rgba(3,10,36,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,.08)', zIndex: 199, boxShadow: '0 8px 32px rgba(0,0,0,.5)' }}>
          <div style={{ padding: '1rem' }}>
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 10, color: pathname?.startsWith(l.href) ? '#fff' : 'rgba(255,255,255,.7)', fontWeight: pathname?.startsWith(l.href) ? 700 : 500, fontSize: 15, background: pathname?.startsWith(l.href) ? 'rgba(255,255,255,.1)' : 'transparent', marginBottom: 4, textDecoration: 'none' }}
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
            <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', marginTop: '.5rem', paddingTop: '.75rem' }}>
              {user ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link href="/profil" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a6fd4', color: '#fff', padding: '11px', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                    {t.nav.my_profile[lang]}
                  </Link>
                  <button onClick={handleLogout} style={{ flex: 1, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)', padding: '11px', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {t.nav.deconnexion[lang]}
                  </button>
                </div>
              ) : (
                <Link href="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e63946', color: '#fff', padding: '13px', borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none', boxShadow: '0 4px 14px rgba(230,57,70,0.35)' }}>
                  {t.nav.connexion[lang]}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
