'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

const STEPS = [
  {
    icon: '✅',
    title: 'Compte créé !',
    desc: 'Ton compte TeamUpFR est prêt. Tu fais maintenant partie de la communauté du football fribourgeois.',
    tip: null
  },
  {
    icon: '👤',
    title: 'Complete ton profil',
    desc: 'Un profil complet reçoit 3x plus de contacts. Ajoute ta bio, ta disponibilité et tes infos de jeu.',
    tip: { label: 'Aller sur mon profil', href: '/profil' }
  },
  {
    icon: '🔍',
    title: 'Explore la plateforme',
    desc: 'Recherche des clubs, joueurs et coachs. Consulte les annonces de recrutement et postule en un clic.',
    tip: { label: 'Voir les annonces', href: '/annonces' }
  },
  {
    icon: '💬',
    title: 'Entre en contact',
    desc: 'La messagerie intégrée te permet de contacter directement clubs et joueurs. Bonne chance !',
    tip: { label: 'Commencer', href: '/profil' }
  }
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [userName, setUserName] = useState('')
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      const { data } = await supabase.from('profiles').select('first_name').eq('id', session.user.id).single()
      if (data?.first_name) setUserName(data.first_name)
    })
  }, [router])

  function finish() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_done', '1')
    }
    router.push('/profil')
  }

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: 'var(--gray-bg)' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>

        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: '2rem' }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 100, background: i <= step ? 'var(--blue-bright)' : 'var(--gray-mid)', transition: 'all .3s' }} />
          ))}
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 24, border: '1px solid var(--border)', padding: '3rem 2.5rem', textAlign: 'center', boxShadow: '0 4px 32px rgba(0,0,0,.07)' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>{current.icon}</div>

          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: 1, marginBottom: '.75rem' }}>
            {step === 0 && userName ? `Bienvenue, ${userName} !` : current.title}
          </div>

          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 380, margin: '0 auto 2rem' }}>
            {current.desc}
          </p>

          {current.tip && (
            <Link href={current.tip.href} style={{ display: 'inline-block', background: 'var(--blue-light)', color: 'var(--blue-mid)', borderRadius: 10, padding: '8px 20px', fontSize: 13, fontWeight: 600, textDecoration: 'none', marginBottom: '1.5rem' }}>
              {current.tip.label} →
            </Link>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} style={{ background: 'var(--gray-bg)', border: '1.5px solid var(--border)', color: 'var(--text-muted)', borderRadius: 10, padding: '11px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                ← Précédent
              </button>
            )}
            {!isLast ? (
              <button onClick={() => setStep(s => s + 1)} style={{ background: 'var(--blue-bright)', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Suivant →
              </button>
            ) : (
              <button onClick={finish} style={{ background: '#e02020', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Commencer l'aventure !
              </button>
            )}
          </div>

          {step < STEPS.length - 1 && (
            <button onClick={finish} style={{ marginTop: '1.25rem', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', display: 'block', width: '100%' }}>
              Passer l'introduction
            </button>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 12, color: 'var(--text-muted)' }}>
          Étape {step + 1} sur {STEPS.length}
        </div>
      </div>
    </div>
  )
}
