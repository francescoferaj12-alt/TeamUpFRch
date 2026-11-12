'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../lib/auth-context'
import { useLang } from '../lib/lang-context'
import LandingPage from '../components/LandingPage'

export default function HomePage() {
  const { session, authLoading } = useAuth()
  const { lang } = useLang()
  const router = useRouter()
  useEffect(() => {
    if (!authLoading && session) router.replace('/annonces')
  }, [authLoading, session, router])
  if (authLoading || session) return <div className="home-session-loading" role="status">{lang === 'de' ? 'Wird geladen…' : 'Chargement…'}</div>
  return <LandingPage />
}

