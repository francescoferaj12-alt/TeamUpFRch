'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import LangSwitcher from './LangSwitcher'
import { useLang } from '../lib/lang-context'
import { t } from '../lib/translations'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { lang } = useLang()
  const [user, setUser] = useState<{ email: string; initials: string } | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { href: '/recherche', label: t.nav.recherche[lang] },
    { href: '/messages', label: t.nav.messages[lang] },
    { href: '/club/bulle', label: t.nav.clubs[lang] },
    { href: '/dashboard', label: t.nav.dashboard[lang] },
    { href: '/candidatures', label: t.nav.candidatures[lang] },
    { href: '/faq', label: t.nav.faq[lang] },
    { href: '/a-propos', label: t.nav.apropos[lang] },
  ]

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      const { data } = await supabase.from('profiles').select('first_name,last_name,email').eq('id', session.user.id).single()
      if (data) {
        const initials = `${data.first_name?.[0] || ''}${data.last_name?.[0] || ''}`.toUpperCase() || '??'
        setUser({ email: data.email, initials })
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) setUser(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

  return (
    <nav className="nav">
      <Link href="/" className="nav-logo">
        <img src="/images/logo-official.jpeg" alt="TeamUpFR" style={{ height: 34, width: 34, objectFit: "cover", borderRadius: 8, border: "2px solid rgba(255,255,255,.2)" }} />
        <span className="nav-brand">TeamUp<span>FR</span></span>
      </Link>

      <div className="nav-links" style={{ overflow: 'auto', maxWidth: '50vw' }}>
        {links.map(l => (
          <Link key={l.href} href={l.href} className={`nav-link ${pathname?.startsWith(l.href) ? 'active' : ''}`}>
            {l.label}
          </Link>
        ))}
      </div>

      <div className="nav-right">
        <LangSwitcher />
        {user ? (
          <>
            <Link href="/profil" style={{
              width: 34, height: 34, borderRadius: 8,
              background: 'var(--blue-bright)',
              border: '2px solid rgba(255,255,255,.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 13, color: '#fff', textDecoration: 'none'
            }} title={user.email}>
              {user.initials}
            </Link>
            <button onClick={handleLogout} className="nav-link" style={{ fontSize: 12, padding: '5px 10px' }}>
              🚪
            </button>
          </>
        ) : (
          <Link href="/login" className="btn btn-red btn-sm">
            {t.nav.connexion[lang]}
          </Link>
        )}
      </div>
    </nav>
  )
}
