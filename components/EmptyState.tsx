import Link from 'next/link'

interface Props {
  icon: string
  title: string
  message: string
  ctaText?: string
  ctaHref?: string
}

export default function EmptyState({ icon, title, message, ctaText, ctaHref }: Props) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '80px 30px',
      background: 'rgba(255,255,255,0.02)',
      border: '2px dashed rgba(255,255,255,0.08)',
      borderRadius: 24,
      maxWidth: 600,
      margin: '60px auto',
    }}>
      <div style={{ fontSize: 64, marginBottom: 24, opacity: 0.7 }}>{icon}</div>
      <h2 style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 32,
        color: '#fff',
        marginBottom: 12,
        letterSpacing: '0.01em',
      }}>{title}</h2>
      <p style={{
        color: 'rgba(255,255,255,0.7)',
        fontSize: 16,
        lineHeight: 1.6,
        marginBottom: 28,
        maxWidth: 400,
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>{message}</p>
      {ctaText && ctaHref && (
        <Link href={ctaHref} style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: '#e63946',
          color: '#fff',
          padding: '12px 28px',
          borderRadius: 10,
          fontWeight: 700,
          fontSize: 14,
          textDecoration: 'none',
          boxShadow: '0 6px 20px rgba(230,57,70,0.35)',
        }}>
          {ctaText}
        </Link>
      )}
    </div>
  )
}
