import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  href?: string
  className?: string
}

const sizes = {
  sm: { font: 18, box: 24, boxFont: 14 },
  md: { font: 22, box: 28, boxFont: 17 },
  lg: { font: 28, box: 34, boxFont: 21 },
}

function LogoMark({ size = 'md', className }: LogoProps) {
  const s = sizes[size]
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 2,
        textDecoration: 'none',
      }}
    >
      <span
        style={{
          fontFamily: "'Russo One', sans-serif",
          fontSize: s.font,
          color: '#ffffff',
          letterSpacing: '0.01em',
          lineHeight: 1,
          marginRight: 2,
        }}
      >
        TeamUp
      </span>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: s.box,
          height: s.box,
          background: '#ffffff',
          color: '#0D1F4A',
          fontFamily: "'Russo One', sans-serif",
          fontSize: s.boxFont,
          borderRadius: 4,
          flexShrink: 0,
        }}
      >
        F
      </span>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: s.box,
          height: s.box,
          background: '#111111',
          color: '#ffffff',
          fontFamily: "'Russo One', sans-serif",
          fontSize: s.boxFont,
          borderRadius: 4,
          flexShrink: 0,
        }}
      >
        R
      </span>
    </span>
  )
}

export default function Logo({ href, size = 'md', className }: LogoProps) {
  if (href) {
    return (
      <Link href={href} style={{ textDecoration: 'none' }}>
        <LogoMark size={size} className={className} />
      </Link>
    )
  }
  return <LogoMark size={size} className={className} />
}
