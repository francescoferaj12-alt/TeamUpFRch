'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PostModal from '../../components/PostModal'
import { useAuth } from '../../lib/auth-context'
import { useLang } from '../../lib/lang-context'

export default function PublishPage() {
  const router = useRouter()
  const { session, profile, authLoading } = useAuth()
  const { lang } = useLang()

  useEffect(() => {
    if (!authLoading && !session) router.replace('/login?redirect=%2Fpublier')
  }, [authLoading, session, router])

  return <div className="publish-page">
    <h1>{lang === 'de' ? 'Deine nächste Chance.' : 'Ta prochaine opportunité.'}</h1>
    {profile && session
      ? <PostModal profile={profile} onClose={() => router.replace('/annonces')} onSuccess={() => router.replace('/annonces')} />
      : <p role="status">{lang === 'de' ? 'Wird geladen…' : 'Chargement…'}</p>}
  </div>
}
