import Link from 'next/link'
import { ReactNode } from 'react'

interface LogoProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** If provided, wraps in a Link */
  href?: string
  className?: string
}

const sizes = {
  sm: { img: 30, font: 18 },
  md: { img: 36, font: 22 },
  lg: { img: 44, font: 28 },
}

function LogoMark({ size = 'md', className }: LogoProps) {
  const s = sizes[size]
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        textDecoration: 'none',
      }}
    >
      <img
        src="/images/logo-official.jpeg"
        alt=""
        aria-hidden="true"
        style={{
          height: s.img,
          width: s.img,
          objectFit: 'cover',
          borderRadius: 8,
          border: '2px solid rgba(255,255,255,.18)',
          flexShrink: 0,
        }}
      />
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: s.font,
          letterSpacing: '0.02em',
          lineHeight: 1,
        }}
      >
        <span style={{ color: '#e63946' }}>TeamUp</span>
        <span
          style={{
            color: '#000',
            background: '#fff',
            padding: '1px 5px 2px',
            margin: '0 2px',
            borderRadius: 3,
            display: 'inline-block',
            lineHeight: 1.1,
          }}
        >
          F
        </span>
        <span style={{ color: '#fff' }}>R</span>
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
