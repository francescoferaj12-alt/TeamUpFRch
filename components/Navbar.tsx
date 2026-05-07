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

  const user = profile
    ? {
        email: profile.email,
        initials: `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase() || '??',
        avatar_url: profile.avatar_url,
      }
    : null

  const links = [
    { href: '/recherche', label: t.nav.recherche[lang] },
    { href: '/annonces', label: t.nav.annonces[lang] },
    { href: '/clubs', label: t.nav.clubs[lang] },
    { href: '/dashboard', label: t.nav.dashboard[lang] },
    { href: '/candidatures', label: t.nav.candidatures[lang] },
    ...(user ? [{ href: '/messages', label: t.nav.messages[lang] }] : []),
  ]

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
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${uid}`,
      }, refresh)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [session])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <>
      <nav className="nav">
        <Link href="/" className="nav-logo" style={{ textDecoration: 'none' }}>
          <img src="/images/logo-official.jpeg" alt="TeamUpFR" style={{ height: 34, width: 34, objectFit: 'cover', borderRadius: 8, border: '2px solid rgba(255,255,255,.2)' }} />
          <span className="nav-brand">TeamUp<span>FR</span></span>
        </Link>

        <div className="nav-links nav-desktop" style={{ overflow: 'auto', maxWidth: '50vw' }}>
          {links.map(l => (
            <Link key={l.href} href={l.href} className={`nav-link ${pathname?.startsWith(l.href) ? 'active' : ''}`} style={{ textDecoration: 'none', position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              {l.label}
              {l.href === '/messages' && unread > 0 && (
                <span className="nav-dot" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#fff', width: 14, height: 14, borderRadius: '50%', background: '#e02020', flexShrink: 0 }}>
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>
          ))}
        </div>

        <div className="nav-right">
          <LangSwitcher />
          {user ? (
            <>
              <Link href="/profil" className="nav-avatar" title={user.email} style={{ textDecoration: 'none', overflow: 'hidden', padding: user.avatar_url ? 0 : undefined }}>
                {user.avatar_url
                  ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : user.initials
                }
              </Link>
              <button onClick={handleLogout} className="nav-desktop" style={{ background: 'none', border: 'none', color: '#ff6b6b', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: '5px 10px', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
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
            onClick={() => setMenuOpen(!menuOpen)}
            className="nav-hamburger"
            aria-label="Menu"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, flexDirection: 'column', gap: 5 }}
          >
            <span style={{ width: 22, height: 2, background: 'rgba(255,255,255,.8)', borderRadius: 2, display: 'block', transition: 'all .2s', transform: menuOpen ? 'rotate(45deg) translate(0,7px)' : 'none' }} />
            <span style={{ width: 22, height: 2, background: 'rgba(255,255,255,.8)', borderRadius: 2, display: 'block', opacity: menuOpen ? 0 : 1, transition: 'all .2s' }} />
            <span style={{ width: 22, height: 2, background: 'rgba(255,255,255,.8)', borderRadius: 2, display: 'block', transition: 'all .2s', transform: menuOpen ? 'rotate(-45deg) translate(0,-7px)' : 'none' }} />
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{ position: 'fixed', top: 60, left: 0, right: 0, background: 'var(--blue-dark)', borderBottom: '1px solid rgba(255,255,255,.1)', zIndex: 199, boxShadow: '0 8px 24px rgba(0,0,0,.4)' }}>
          <div style={{ padding: '1rem' }}>
            {links.map(l => (
              <Link key={l.href} href={l.href} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 10, color: pathname?.startsWith(l.href) ? '#fff' : 'rgba(255,255,255,.7)', fontWeight: pathname?.startsWith(l.href) ? 700 : 500, fontSize: 15, background: pathname?.startsWith(l.href) ? 'rgba(255,255,255,.12)' : 'transparent', marginBottom: 4, textDecoration: 'none' }}>
                {l.label}
                {l.href === '/messages' && unread > 0 && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#fff', width: 14, height: 14, borderRadius: '50%', background: '#e02020', flexShrink: 0 }}>
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </Link>
            ))}
            <div style={{ borderTop: '1px solid rgba(255,255,255,.1)', marginTop: '.5rem', paddingTop: '.75rem' }}>
              {user ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link href="/profil" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--blue-bright)', color: '#fff', padding: '11px', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                    {t.nav.my_profile[lang]}
                  </Link>
                  <button onClick={handleLogout} style={{ flex: 1, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)', color: 'rgba(255,255,255,.7)', padding: '11px', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {t.nav.deconnexion[lang]}
                  </button>
                </div>
              ) : (
                <Link href="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e02020', color: '#fff', padding: '13px', borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
                  {t.nav.connexion[lang]}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .nav-hamburger { display: none; }
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  )
}
