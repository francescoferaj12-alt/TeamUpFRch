import { ReactNode } from 'react'

interface LegalLayoutProps {
  sidebar: ReactNode
  children: ReactNode
}

export default function LegalLayout({ sidebar, children }: LegalLayoutProps) {
  return (
    <>
      <style>{`
        .lg-grid {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 60px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 32px 100px;
          align-items: flex-start;
        }
        .lg-toc { position: sticky; top: 110px; }
        .legal-section { scroll-margin-top: 100px; }
        @media (max-width: 960px) {
          .lg-grid { grid-template-columns: 1fr; gap: 32px; padding: 32px 24px 80px; }
          .lg-toc { position: static; }
        }
      `}</style>
      <div className="lg-grid">
        <div className="lg-toc">{sidebar}</div>
        <main style={{ fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,.92)', fontWeight: 300 }}>
          {children}
        </main>
      </div>
    </>
  )
}
