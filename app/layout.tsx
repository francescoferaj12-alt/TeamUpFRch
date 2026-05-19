import type { Metadata } from 'next';
import '../styles/globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { LangProvider } from '../lib/lang-context';
import { AuthProvider } from '../lib/auth-context'
import EmailVerificationBanner from '../components/EmailVerificationBanner';
import IncompleteProfileBanner from '../components/IncompleteProfileBanner';
import ClubPendingBanner from '../components/ClubPendingBanner';

export const metadata: Metadata = {
  metadataBase: new URL('https://teamupfr.ch'),
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
          <AuthProvider>
            <Navbar />
            <EmailVerificationBanner />
            <IncompleteProfileBanner />
            <ClubPendingBanner />
            <main>{children}</main>
            <Footer />
          </AuthProvider>
        </LangProvider>
      </body>
    </html>
  );
}
