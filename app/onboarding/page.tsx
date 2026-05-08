'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLang } from '../../lib/lang-context'

const steps = [
  {
    icon: '👤',
    fr: { title: 'Bienvenue sur TeamUpFR !', desc: "Ton profil est créé. Maintenant, complétons-le pour que les clubs et coachs puissent te trouver facilement." },
    de: { title: 'Willkommen bei TeamUpFR!', desc: "Dein Profil wurde erstellt. Lass uns es vervollständigen, damit Vereine und Trainer dich leicht finden können." }
  },
  {
    icon: '📝',
    fr: { title: 'Complète ton profil', desc: "Ajoute ta position, ta ligue et ta zone géographique. Un profil complet reçoit 3x plus de contacts !" },
    de: { title: 'Vervollständige dein Profil', desc: "Füge deine Position, Liga und geografische Zone hinzu. Ein vollständiges Profil erhält 3x mehr Kontakte!" }
  },
  {
    icon: '🔍',
    fr: { title: 'Explore la plateforme', desc: "Recherche des clubs, des joueurs et des coachs dans ta zone. Postule directement aux annonces de recrutement." },
    de: { title: 'Erkunde die Plattform', desc: "Suche nach Vereinen, Spielern und Trainern in deiner Zone. Bewirb dich direkt auf Rekrutierungsanzeigen." }
  },
  {
    icon: '🏆',
    fr: { title: "C'est parti !", desc: "Tu es prêt à rejoindre la communauté TeamUpFR. Trouve ton équipe, ton joueur ou ton coach idéal !" },
    de: { title: 'Los geht\'s!', desc: "Du bist bereit, der TeamUpFR-Community beizutreten. Finde dein Team, deinen Spieler oder deinen idealen Trainer!" }
  }
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const router = useRouter()
  const { lang } = useLang()

  const current = steps[step]
  const isLast = step === steps.length - 1

  return (
    <div style={{
      minHeight: 'calc(100vh - 60px - 100px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--gray-bg)', padding: '2rem'
    }}>
      <div style={{ maxWidth: 520, width: '100%' }}>

        {/* Progress */}
        <div style={{ display: 'flex', gap: 8, marginBottom: '2.5rem', justifyContent: 'center' }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              height: 4, flex: 1, borderRadius: 100,
              background: i <= step ? 'var(--blue-bright)' : 'var(--gray-mid)',
              transition: 'background .3s'
            }} />
          ))}
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 24, padding: '3rem 2.5rem', textAlign: 'center', border: '1px solid var(--border)', boxShadow: '0 8px 40px rgba(10,31,92,.08)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>{current.icon}</div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: 1, marginBottom: '1rem', color: 'var(--blue-dark)' }}>
            {current[lang].title}
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2.5rem' }}>
            {current[lang].desc}
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} style={{
                background: 'var(--gray-light)', color: 'var(--text-muted)',
                border: 'none', borderRadius: 10, padding: '12px 24px',
                fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
              }}>
                {lang === 'fr' ? '← Retour' : '← Zurück'}
              </button>
            )}
            <button
              onClick={() => {
                if (isLast) {
                  localStorage.setItem('teamupfr-onboarded', 'true')
                  router.push('/profil')
                } else {
                  setStep(step + 1)
                }
              }}
              style={{
                background: isLast ? 'var(--red)' : 'var(--blue-bright)',
                color: '#fff', border: 'none', borderRadius: 10,
                padding: '12px 32px', fontSize: 15, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit', flex: 1, maxWidth: 200
              }}
            >
              {isLast
                ? (lang === 'fr' ? '🚀 Commencer !' : '🚀 Loslegen!')
                : (lang === 'fr' ? 'Suivant →' : 'Weiter →')
              }
            </button>
          </div>

          {step < steps.length - 1 && (
            <button onClick={() => { localStorage.setItem('teamupfr-onboarded', 'true'); router.push('/profil') }} style={{
              background: 'none', border: 'none', color: 'var(--text-muted)',
              fontSize: 13, cursor: 'pointer', marginTop: '1rem', fontFamily: 'inherit'
            }}>
              {lang === 'fr' ? 'Passer →' : 'Überspringen →'}
            </button>
          )}
        </div>

        {/* Step counter */}
        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: 13, color: 'var(--text-muted)' }}>
          {step + 1} / {steps.length}
        </div>
      </div>
    </div>
  )
}
