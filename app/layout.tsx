import type { Metadata } from 'next';
import '../styles/globals.css';
import Navbar from '../components/Navbar';
import { LangProvider } from '../lib/lang-context';

export const metadata: Metadata = {
  title: 'TeamUpFR — Ton équipe, ton avenir',
  description: 'La plateforme qui connecte joueurs, coachs et clubs de football amateurs du canton de Fribourg.',
  keywords: ['football', 'Fribourg', 'amateur', 'club', 'recrutement', 'coach', 'joueur', 'Freiburg', 'Fussball'],
  authors: [{ name: 'TeamUpFR' }],
  openGraph: {
    title: 'TeamUpFR — Ton équipe, ton avenir',
    description: 'La plateforme du football amateur fribourgeois.',
    locale: 'fr_CH',
    type: 'website',
    siteName: 'TeamUpFR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TeamUpFR — Ton équipe, ton avenir',
    description: 'La plateforme du football amateur fribourgeois.',
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a1f5c'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <LangProvider>
          <Navbar />
          <main>{children}</main>
          <footer style={{
            background: 'var(--blue-dark)',
            color: 'rgba(255,255,255,.5)',
            padding: '3rem 2rem 2rem',
            fontSize: 13
          }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                {/* Brand */}
                <div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', letterSpacing: 2, color: '#fff', marginBottom: '.5rem' }}>
                    TeamUp<span style={{ color: '#ff4444' }}>FR</span>
                  </div>
                  <div style={{ fontStyle: 'italic', marginBottom: '1rem', color: 'rgba(255,255,255,.4)', fontSize: 12 }}>
                    Ton équipe, ton avenir<br />Dein Team, deine Zukunft
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>🇨🇭 Canton de Fribourg · Suisse</div>
                </div>

                {/* Plateforme */}
                <div>
                  <div style={{ color: '#fff', fontWeight: 600, marginBottom: '.75rem', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Plateforme</div>
                  {[
                    ['/recherche', 'Recherche'],
                    ['/clubs', 'Les clubs'],
                    ['/candidatures', 'Candidatures'],
                    ['/messages', 'Messages'],
                    ['/dashboard', 'Dashboard'],
                  ].map(([href, label]) => (
                    <a key={href} href={href} style={{ display: 'block', color: 'rgba(255,255,255,.45)', marginBottom: '.4rem', textDecoration: 'none', transition: 'color .15s' }}>
                      {label}
                    </a>
                  ))}
                </div>

                {/* À propos */}
                <div>
                  <div style={{ color: '#fff', fontWeight: 600, marginBottom: '.75rem', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>TeamUpFR</div>
                  {[
                    ['/a-propos', 'À propos / Über uns'],
                    ['/faq', 'FAQ'],
                    ['/privacy', 'Confidentialité / Datenschutz'],
                    ['/cgu', "CGU / Nutzungsbedingungen"],
                  ].map(([href, label]) => (
                    <a key={href} href={href} style={{ display: 'block', color: 'rgba(255,255,255,.45)', marginBottom: '.4rem', textDecoration: 'none' }}>
                      {label}
                    </a>
                  ))}
                </div>

                {/* Contact */}
                <div>
                  <div style={{ color: '#fff', fontWeight: 600, marginBottom: '.75rem', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Contact</div>
                  <a href="mailto:teamupfr.ch@gmail.com" style={{ color: 'rgba(255,255,255,.45)', textDecoration: 'none', display: 'block', marginBottom: '.4rem' }}>
                    📧 teamupfr.ch@gmail.com
                  </a>
                  <div style={{ color: 'rgba(255,255,255,.3)', marginTop: '1rem', fontSize: 12 }}>
                    Fondé par Francesco, Hugo & Tiago<br />
                    🇮🇹🇦🇱🇵🇹 Fribourg, Suisse
                  </div>
                </div>
              </div>

              {/* Bottom */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>© 2025 TeamUpFR — Tous droits réservés · Alle Rechte vorbehalten</div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <span>🇫🇷 Français</span>
                  <span>🇩🇪 Deutsch</span>
                </div>
              </div>
            </div>
          </footer>
        </LangProvider>
      </body>
    </html>
  );
}
