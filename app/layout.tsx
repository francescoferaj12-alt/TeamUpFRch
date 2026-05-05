import type { Metadata } from 'next';
import '../styles/globals.css';
import Navbar from '../components/Navbar';

export const metadata: Metadata = {
  title: 'TeamUpFR — Ton équipe, ton avenir',
  description:
    'La plateforme qui connecte joueurs, coachs et clubs de football amateurs du canton de Fribourg.',
  keywords: ['football', 'Fribourg', 'amateur', 'club', 'recrutement', 'coach', 'joueur'],
  authors: [{ name: 'TeamUpFR' }],
  openGraph: {
    title: 'TeamUpFR — Ton équipe, ton avenir',
    description: 'La plateforme du football amateur fribourgeois.',
    locale: 'fr_CH',
    type: 'website'
  }
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
        <Navbar />
        <main>{children}</main>
        <footer className="footer">
          <strong>TeamUpFR</strong> — Ton équipe, ton avenir &nbsp;|&nbsp; Canton de Fribourg, Suisse
          &nbsp;|&nbsp; © 2025
          <br />
          <span style={{ marginTop: 8, display: 'inline-block' }}>
            🇫🇷 Français · 🇮🇹 Italiano · 🇩🇪 Deutsch
          </span>
        </footer>
      </body>
    </html>
  );
}
