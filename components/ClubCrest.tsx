interface ClubCrestProps {
  src?: string | null
  alt?: string
  size?: number
  fallback?: string
}

export default function ClubCrest({ src, alt = '', size = 48, fallback }: ClubCrestProps) {
  const radius = Math.round(size * 0.22)
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: radius,
      overflow: 'hidden',
      flexShrink: 0,
      background: '#0D1F4A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {src
        ? <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
        : <span style={{ fontFamily: "'Russo One', sans-serif", fontSize: Math.round(size * 0.35), color: 'rgba(255,255,255,0.5)', lineHeight: 1 }}>{fallback ?? '?'}</span>
      }
    </div>
  )
}
