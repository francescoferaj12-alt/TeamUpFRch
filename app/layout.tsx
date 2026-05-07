import type { Metadata } from 'next'
import '../styles/globals.css'
import Navbar from '../components/Navbar'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'TeamUpFR — Ton équipe, ton avenir',
  description: 'La plateforme qui connecte joueurs, coachs et clubs de football amateurs du canton de Fribourg.',
  keywords: ['football', 'Fribourg', 'amateur', 'club', 'recrutement', 'coach', 'joueur'],
  authors: [{ name: 'TeamUpFR' }],
  openGraph: {
    title: 'TeamUpFR — Ton équipe, ton avenir',
    description: 'La plateforme du football amateur fribourgeois.',
    locale: 'fr_CH',
    type: 'website'
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a1f5c'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Navbar />
        <main>{children}</main>

        <footer style={{ background: 'var(--blue-dark)', color: 'rgba(255,255,255,.5)', padding: '3rem 1.5rem 2rem' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            {/* TOP */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
              {/* Brand */}
              <div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', letterSpacing: 2, color: '#fff', marginBottom: '.5rem' }}>
                  TeamUp<span style={{ color: '#e02020' }}>FR</span>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,.45)', maxWidth: 220 }}>
                  La plateforme du football amateur fribourgeois.
                </p>
                <div style={{ marginTop: '1rem', fontSize: 13 }}>
                  <a href="mailto:teamupfr.ch@gmail.com" style={{ color: 'rgba(255,255,255,.5)', textDecoration: 'none' }}>
                    teamupfr.ch@gmail.com
                  </a>
                </div>
              </div>

              {/* Plateforme */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginBottom: '1rem' }}>Plateforme</div>
                {[
                  { href: '/recherche', label: 'Recherche' },
                  { href: '/annonces', label: 'Annonces' },
                  { href: '/clubs', label: 'Clubs' },
                  { href: '/login', label: 'Inscription' }
                ].map((l) => (
                  <Link key={l.href} href={l.href} style={{ display: 'block', color: 'rgba(255,255,255,.45)', fontSize: 14, marginBottom: '.5rem', textDecoration: 'none' }}>
                    {l.label}
                  </Link>
                ))}
              </div>

              {/* Informations */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginBottom: '1rem' }}>Informations</div>
                {[
                  { href: '/a-propos', label: 'À propos' },
                  { href: '/faq', label: 'FAQ' },
                  { href: '/privacy', label: 'Confidentialité' },
                  { href: '/cgu', label: 'CGU' }
                ].map((l) => (
                  <Link key={l.href} href={l.href} style={{ display: 'block', color: 'rgba(255,255,255,.45)', fontSize: 14, marginBottom: '.5rem', textDecoration: 'none' }}>
                    {l.label}
                  </Link>
                ))}
              </div>

              {/* Zones */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginBottom: '1rem' }}>Zones couvertes</div>
                {['Fribourg-Ville', 'Gruyère', 'Broye', 'Glâne', 'Sensebezirk', 'Veveyse', 'Lac'].map((z) => (
                  <div key={z} style={{ color: 'rgba(255,255,255,.4)', fontSize: 13, marginBottom: '.35rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#e02020', flexShrink: 0 }} />
                    {z}
                  </div>
                ))}
              </div>
            </div>

            {/* BOTTOM */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ fontSize: 13 }}>
                © {new Date().getFullYear()} <strong style={{ color: 'rgba(255,255,255,.7)' }}>TeamUpFR</strong> · Canton de Fribourg, Suisse
              </div>
              <div style={{ display: 'flex', gap: '1.25rem', fontSize: 13 }}>
                <span>🇨🇭 Schweiz</span>
                <span style={{ color: 'rgba(255,255,255,.25)' }}>·</span>
                <span>Français · Deutsch</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
