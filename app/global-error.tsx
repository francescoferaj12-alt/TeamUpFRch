'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <div style={{
          background: '#030a24',
          color: 'white',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          textAlign: 'center',
          fontFamily: 'sans-serif',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '12px', fontWeight: 700 }}>
            Une erreur s'est produite
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', marginBottom: '32px', maxWidth: 400 }}>
            Notre équipe a été notifiée automatiquement.
          </p>
          <button
            onClick={reset}
            style={{
              background: '#e63946',
              color: 'white',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 700,
            }}
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  )
}
