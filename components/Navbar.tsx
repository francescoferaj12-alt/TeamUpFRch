'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const links = [
  { href: '/recherche', label: '🔍 Recherche' },
  { href: '/messages', label: '💬 Messages' },
  { href: '/club/bulle', label: '🏟️ Clubs' },
  { href: '/dashboard', label: '⚙️ Dashboard' },
  { href: '/candidatures', label: '📋 Candidatures' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<{ email: string; initials: string } | null>(null)

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
        <div className="nav-logo-icon">⚽</div>
        <span className="nav-brand">TeamUp<span>FR</span></span>
      </Link>

      <div className="nav-links" style={{ overflow:'auto', maxWidth:'55vw' }}>
        {links.map(l => (
          <Link key={l.href} href={l.href} className={`nav-link ${pathname?.startsWith(l.href) ? 'active' : ''}`}>
            {l.label}
          </Link>
        ))}
      </div>

      <div className="nav-right">
        {user ? (
          <>
            <Link href="/profil" style={{
              width:34, height:34, borderRadius:8,
              background:'var(--blue-bright)',
              border:'2px solid rgba(255,255,255,.25)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontWeight:700, fontSize:13, color:'#fff',
              textDecoration:'none'
            }} title={user.email}>
              {user.initials}
            </Link>
            <button onClick={handleLogout} className="nav-link" style={{ fontSize:12, padding:'5px 10px' }}>
              🚪
            </button>
          </>
        ) : (
          <Link href="/login" className="btn btn-red btn-sm">
            Connexion
          </Link>
        )}
      </div>
    </nav>
  )
}
