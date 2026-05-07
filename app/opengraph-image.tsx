import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'TeamUpFR — Ton équipe, ton avenir'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%',
        background: 'linear-gradient(135deg, #0a1f5c 0%, #1040a0 50%, #1a6fd4 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: .05,
          background: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
          backgroundSize: '20px 20px'
        }} />

        {/* Logo icon */}
        <div style={{
          width: 100, height: 100, borderRadius: 24,
          background: 'rgba(255,255,255,.15)',
          border: '3px solid rgba(255,255,255,.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 50, marginBottom: 32
        }}>
          ⚽
        </div>

        {/* Title */}
        <div style={{
          fontSize: 88, fontWeight: 900, color: '#fff',
          letterSpacing: 4, lineHeight: 1, marginBottom: 8,
          textTransform: 'uppercase'
        }}>
          TeamUp<span style={{ color: '#ff4444' }}>FR</span>
        </div>

        {/* Motto */}
        <div style={{ fontSize: 28, color: 'rgba(255,255,255,.7)', fontStyle: 'italic', marginBottom: 48 }}>
          Ton équipe, ton avenir · Dein Team, deine Zukunft
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 48 }}>
          {[['340+', 'Joueurs'], ['52', 'Clubs'], ['100%', 'Gratuit']].map(([num, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 42, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{num}</div>
              <div style={{ fontSize: 16, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: 2, marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Bottom badge */}
        <div style={{
          position: 'absolute', bottom: 32,
          background: 'rgba(255,255,255,.1)',
          border: '1px solid rgba(255,255,255,.2)',
          borderRadius: 100, padding: '8px 24px',
          fontSize: 16, color: 'rgba(255,255,255,.7)', letterSpacing: 2
        }}>
          🇨🇭 CANTON DE FRIBOURG · SUISSE
        </div>

        {/* Red accent */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 6, background: '#e02020'
        }} />
      </div>
    ),
    { ...size }
  )
}
