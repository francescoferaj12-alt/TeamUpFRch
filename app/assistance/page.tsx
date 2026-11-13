'use client'

import Link from 'next/link'
import { useLang } from '../../lib/lang-context'

export default function SupportPage() {
  const { lang } = useLang()
  const de = lang === 'de'
  return <section style={{ maxWidth: 760, margin: '0 auto', padding: '140px 24px 90px', color: '#fff', minHeight: '70vh' }}>
    <h1 style={{ fontSize: 'clamp(30px, 6vw, 46px)' }}>{de ? 'TeamUpFR-Hilfe' : 'Assistance TeamUpFR'}</h1>
    <p style={{ lineHeight: 1.7 }}>{de ? 'Hilfe zur Website und zur iPhone-/Android-App. Kontaktiere uns bei Fragen zu deinem Konto, zu Profilen, Anzeigen, Nachrichten oder Videos.' : 'Une aide pour le site et l’app iPhone/Android. Contacte-nous pour ton compte, les profils, annonces, messages ou vidéos.'}</p>
    <a className="btn btn-red" href="mailto:teamupfr.ch@gmail.com">teamupfr.ch@gmail.com</a>
    <p style={{ color: '#c7d1e3', lineHeight: 1.7 }}>{de ? 'Beschreibe das Problem und nenne dein Gerät. Sende uns niemals dein Passwort oder einen Anmeldecode.' : 'Décris le problème et indique ton appareil. Ne nous envoie jamais ton mot de passe ni un code de connexion.'}</p>
    <div style={{ display: 'grid', gap: 16, padding: 24, border: '1px solid #ffffff26', borderRadius: 18, background: '#122344', marginTop: 28 }}>
      <Link href="/login" style={{ color: '#9fc1ff' }}>{de ? 'Anmeldung oder Passwort vergessen' : 'Connexion ou mot de passe oublié'}</Link>
      <Link href="/supprimer-compte" style={{ color: '#9fc1ff' }}>{de ? 'Mein Konto und meine Daten löschen' : 'Supprimer mon compte et mes données'}</Link>
      <Link href="/privacy" style={{ color: '#9fc1ff' }}>{de ? 'Datenschutz' : 'Confidentialité'}</Link>
      <Link href="/cgu" style={{ color: '#9fc1ff' }}>{de ? 'Nutzungsbedingungen' : 'Conditions d’utilisation'}</Link>
    </div>
    <h2 style={{ marginTop: 36 }}>{de ? 'Missbrauch melden' : 'Signaler un abus'}</h2>
    <p style={{ lineHeight: 1.7 }}>{de ? 'Nutze die Melde- und Blockierfunktionen bei Mitgliedern. Du kannst unserem Support auch einen Profil- oder Anzeigenlink senden. Vermeide unnötige private Informationen.' : 'Utilise les fonctions de signalement et de blocage des membres. Tu peux aussi envoyer au support un lien vers le profil ou l’annonce concernée. Évite les informations privées inutiles.'}</p>
  </section>
}
