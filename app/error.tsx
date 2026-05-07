'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div style={{ minHeight: 'calc(100vh - 60px - 100px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'linear-gradient(135deg, var(--blue-dark), var(--blue-mid))', textAlign: 'center' }}>
      <div style={{ maxWidth: 480 }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚨</div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '4rem', color: '#fff', letterSpacing: 3, lineHeight: 1 }}>
          Oups<span style={{ color: 'var(--red-light)' }}>!</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 16, margin: '1rem 0 2rem' }}>
          Une erreur inattendue s&apos;est produite.<br />
          Essaie de recharger la page ou reviens à l&apos;accueil.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={reset} style={{ background: 'var(--red)', color: '#fff', padding: '12px 28px', borderRadius: 9, fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            Réessayer
          </button>
          <Link href="/" style={{ display: 'inline-block', background: 'rgba(255,255,255,.15)', color: '#fff', padding: '12px 28px', borderRadius: 9, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            ← Accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
