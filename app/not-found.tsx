import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: 'calc(100vh - 60px - 100px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'linear-gradient(135deg, var(--blue-dark), var(--blue-mid))',
        textAlign: 'center'
      }}
    >
      <div style={{ maxWidth: 480 }}>
        <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>⚽</div>
        <div
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '5rem',
            color: '#fff',
            letterSpacing: 3,
            lineHeight: 1
          }}
        >
          4<span style={{ color: 'var(--red-light)' }}>0</span>4
        </div>
        <p
          style={{
            color: 'rgba(255,255,255,.7)',
            fontSize: 16,
            margin: '1rem 0 2rem'
          }}
        >
          Cette page a pris la balle hors du terrain.
          <br />
          Reviens à la maison pour reprendre la partie.
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            background: 'var(--red)',
            color: '#fff',
            padding: '12px 28px',
            borderRadius: 9,
            fontWeight: 700,
            fontSize: 14
          }}
        >
          ← Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
