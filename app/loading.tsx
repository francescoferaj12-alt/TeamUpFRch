export default function Loading() {
  return (
    <div
      style={{
        minHeight: 'calc(100vh - 60px - 100px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem'
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          border: '4px solid var(--gray-light)',
          borderTopColor: 'var(--blue-bright)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}
      />
      <div
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '1.2rem',
          letterSpacing: 2,
          color: 'var(--text-muted)'
        }}
      >
        Chargement…
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
