'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const NAV_LINKS = [
  { href: '/recherche', label: 'Recherche' },
  { href: '/annonces', label: 'Annonces' },
  { href: '/clubs', label: 'Clubs' },
  { href: '/dashboard', label: 'Dashboard' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<{ email: string; initials: string } | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      const { data } = await supabase
        .from('profiles')
        .select('first_name,last_name,email')
        .eq('id', session.user.id)
        .single()
      if (data) {
        const initials = `${data.first_name?.[0] || ''}${data.last_name?.[0] || ''}`.toUpperCase() || '??'
        setUser({ email: data.email, initials })
      }
      // Count unread messages
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('receiver_id', session.user.id)
        .eq('read', false)
      setUnread(count || 0)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) { setUser(null); setUnread(0) }
    })
    return () => subscription.unsubscribe()
  }, [])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

  return (
    <>
      <nav style={{ background: 'var(--blue-dark)', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.25rem', position: 'sticky', top: 0, zIndex: 200, boxShadow: '0 2px 20px rgba(0,0,0,.3)' }}>

        {/* LOGO */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,.1)' }}>
            <Image
              src="/images/logo-official.jpeg"
              alt="TeamUpFR"
              width={34}
              height={34}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={() => {/* fallback handled by CSS */}}
            />
          </div>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 1, color: '#fff' }}>
            TeamUp<span style={{ color: '#ff4444' }}>FR</span>
          </span>
        </Link>

        {/* DESKTOP LINKS */}
        <div className="nav-desktop-links" style={{ display: 'flex', gap: 2, overflow: 'auto' }}>
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                background: pathname?.startsWith(l.href) ? 'rgba(255,255,255,.15)' : 'transparent',
                color: pathname?.startsWith(l.href) ? '#fff' : 'rgba(255,255,255,.65)',
                padding: '7px 13px', borderRadius: 7, fontSize: 13, fontWeight: 500,
                whiteSpace: 'nowrap', textDecoration: 'none', transition: 'all .15s'
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {user ? (
            <>
              {/* Messages badge */}
              <Link href="/messages" style={{ position: 'relative', width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, textDecoration: 'none' }}>
                💬
                {unread > 0 && (
                  <span style={{ position: 'absolute', top: -2, right: -2, width: 16, height: 16, background: '#e02020', borderRadius: '50%', fontSize: 9, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--blue-dark)' }}>
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </Link>
              {/* Avatar */}
              <Link href="/profil" title={user.email} style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--blue-bright)', border: '2px solid rgba(255,255,255,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff', textDecoration: 'none' }}>
                {user.initials}
              </Link>
              {/* Logout — desktop only */}
              <button onClick={handleLogout} className="nav-desktop-links" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', fontSize: 18, cursor: 'pointer', padding: '6px 4px', lineHeight: 1 }}>
                🚪
              </button>
            </>
          ) : (
            <Link href="/login" style={{ background: '#e02020', color: '#fff', padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
              Connexion
            </Link>
          )}

          {/* HAMBURGER */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="nav-hamburger"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0 }}
            aria-label="Menu"
          >
            <span style={{ width: 22, height: 2, background: menuOpen ? 'transparent' : 'rgba(255,255,255,.8)', borderRadius: 2, transition: 'all .2s', display: 'block' }} />
            <span style={{ width: 22, height: 2, background: 'rgba(255,255,255,.8)', borderRadius: 2, transition: 'all .2s', display: 'block', transform: menuOpen ? 'rotate(45deg) translateY(-3.5px)' : 'none', position: menuOpen ? 'relative' : 'static', top: menuOpen ? 7 : 0 }} />
            <span style={{ width: 22, height: 2, background: 'rgba(255,255,255,.8)', borderRadius: 2, transition: 'all .2s', display: 'block', transform: menuOpen ? 'rotate(-45deg) translateY(3.5px)' : 'none', position: menuOpen ? 'relative' : 'static', top: menuOpen ? -7 : 0 }} />
          </button>
        </div>
      </nav>

      {/* MOBILE DROPDOWN MENU */}
      {menuOpen && (
        <div style={{ position: 'fixed', top: 60, left: 0, right: 0, background: 'var(--blue-dark)', borderBottom: '1px solid rgba(255,255,255,.1)', zIndex: 199, boxShadow: '0 8px 24px rgba(0,0,0,.4)' }}>
          <div style={{ padding: '1rem' }}>
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderRadius: 10, color: pathname?.startsWith(l.href) ? '#fff' : 'rgba(255,255,255,.7)', fontWeight: pathname?.startsWith(l.href) ? 700 : 500, fontSize: 15, background: pathname?.startsWith(l.href) ? 'rgba(255,255,255,.12)' : 'transparent', marginBottom: 4, textDecoration: 'none' }}
              >
                {l.label}
              </Link>
            ))}
            <div style={{ borderTop: '1px solid rgba(255,255,255,.1)', marginTop: '.5rem', paddingTop: '.75rem' }}>
              {user ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link href="/profil" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--blue-bright)', color: '#fff', padding: '11px', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                    Mon profil
                  </Link>
                  <button onClick={handleLogout} style={{ flex: 1, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)', color: 'rgba(255,255,255,.7)', padding: '11px', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Déconnexion
                  </button>
                </div>
              ) : (
                <Link href="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e02020', color: '#fff', padding: '13px', borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
                  Connexion / Inscription
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .nav-hamburger { display: none !important; }
        .nav-desktop-links { display: flex !important; }
        @media (max-width: 768px) {
          .nav-hamburger { display: flex !important; }
          .nav-desktop-links { display: none !important; }
        }
      `}</style>
    </>
  )
}
