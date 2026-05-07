'use client'

import { useLang } from '../../lib/lang-context'

export default function PrivacyPage() {
  const { lang } = useLang()

  const content = {
    fr: {
      badge: 'Politique de confidentialité',
      title: 'Vos données, votre vie privée',
      updated: 'Dernière mise à jour : Mai 2025',
      intro: "TeamUpFR s'engage à protéger vos données personnelles conformément à la Loi fédérale sur la protection des données (LPD) suisse. Cette politique explique quelles données nous collectons, pourquoi, et comment vous pouvez les contrôler.",
      sections: [
        {
          title: '1. Responsable du traitement',
          content: "TeamUpFR est responsable du traitement de vos données personnelles. Contact : teamupfr.ch@gmail.com"
        },
        {
          title: '2. Données collectées',
          content: "Nous collectons les données que vous nous fournissez lors de l'inscription : prénom, nom, adresse email, mot de passe (chiffré), rôle (joueur/coach/club), position, ligue, zone géographique, disponibilité, biographie et photo de profil (optionnelle). Nous collectons également des données techniques : adresse IP, type de navigateur, pages visitées et durée des sessions."
        },
        {
          title: '3. Finalité du traitement',
          content: "Vos données sont utilisées pour : créer et gérer votre compte, afficher votre profil aux autres utilisateurs, vous mettre en relation avec des clubs, joueurs et coachs, envoyer des notifications relatives à vos candidatures et messages, améliorer nos services."
        },
        {
          title: '4. Conservation des données',
          content: "Vos données sont conservées tant que votre compte est actif. En cas de suppression de compte, vos données sont effacées dans les 48 heures. Les données de connexion sont conservées 12 mois maximum."
        },
        {
          title: '5. Partage des données',
          content: "Nous ne vendons jamais vos données à des tiers. Votre profil public (nom, position, ligue, zone, disponibilité, bio) est visible par les autres utilisateurs inscrits sur TeamUpFR. Votre adresse email et votre mot de passe ne sont jamais partagés."
        },
        {
          title: '6. Sécurité',
          content: "Vos données sont stockées sur des serveurs sécurisés en Europe (Frankfurt, Allemagne) via Supabase. Toutes les communications sont chiffrées via HTTPS. Les mots de passe sont stockés sous forme de hash bcrypt."
        },
        {
          title: '7. Vos droits',
          content: "Conformément à la LPD suisse, vous disposez des droits suivants : accès à vos données, rectification, suppression, portabilité, opposition au traitement. Pour exercer ces droits, contactez-nous à teamupfr.ch@gmail.com. Nous répondons dans les 30 jours."
        },
        {
          title: '8. Cookies',
          content: "TeamUpFR utilise uniquement des cookies techniques nécessaires au fonctionnement du service (session d'authentification, préférence de langue). Nous n'utilisons pas de cookies publicitaires ou de tracking tiers."
        },
        {
          title: '9. Modifications',
          content: "Nous pouvons modifier cette politique à tout moment. En cas de modification importante, nous vous en informerons par email. La version en vigueur est toujours disponible sur cette page."
        },
        {
          title: '10. Contact',
          content: "Pour toute question relative à vos données personnelles : teamupfr.ch@gmail.com"
        }
      ]
    },
    de: {
      badge: 'Datenschutzrichtlinie',
      title: 'Ihre Daten, Ihre Privatsphäre',
      updated: 'Letzte Aktualisierung: Mai 2025',
      intro: "TeamUpFR verpflichtet sich, Ihre personenbezogenen Daten gemäss dem Schweizer Datenschutzgesetz (DSG) zu schützen. Diese Richtlinie erklärt, welche Daten wir erheben, warum und wie Sie diese kontrollieren können.",
      sections: [
        {
          title: '1. Verantwortlicher für die Datenverarbeitung',
          content: "TeamUpFR ist für die Verarbeitung Ihrer personenbezogenen Daten verantwortlich. Kontakt: teamupfr.ch@gmail.com"
        },
        {
          title: '2. Erhobene Daten',
          content: "Wir erheben die Daten, die Sie uns bei der Registrierung mitteilen: Vorname, Nachname, E-Mail-Adresse, Passwort (verschlüsselt), Rolle (Spieler/Trainer/Verein), Position, Liga, geografische Zone, Verfügbarkeit, Biografie und Profilfoto (optional). Wir erheben auch technische Daten: IP-Adresse, Browsertyp, besuchte Seiten und Sitzungsdauer."
        },
        {
          title: '3. Zweck der Verarbeitung',
          content: "Ihre Daten werden verwendet für: Erstellung und Verwaltung Ihres Kontos, Anzeige Ihres Profils für andere Benutzer, Kontaktaufnahme mit Vereinen, Spielern und Trainern, Versand von Benachrichtigungen zu Ihren Bewerbungen und Nachrichten, Verbesserung unserer Dienste."
        },
        {
          title: '4. Datenspeicherung',
          content: "Ihre Daten werden gespeichert, solange Ihr Konto aktiv ist. Bei Kontolöschung werden Ihre Daten innerhalb von 48 Stunden gelöscht. Verbindungsdaten werden maximal 12 Monate aufbewahrt."
        },
        {
          title: '5. Datenweitergabe',
          content: "Wir verkaufen Ihre Daten niemals an Dritte. Ihr öffentliches Profil (Name, Position, Liga, Zone, Verfügbarkeit, Bio) ist für andere registrierte TeamUpFR-Benutzer sichtbar. Ihre E-Mail-Adresse und Ihr Passwort werden niemals weitergegeben."
        },
        {
          title: '6. Sicherheit',
          content: "Ihre Daten werden auf sicheren Servern in Europa (Frankfurt, Deutschland) über Supabase gespeichert. Alle Kommunikationen sind über HTTPS verschlüsselt. Passwörter werden als bcrypt-Hash gespeichert."
        },
        {
          title: '7. Ihre Rechte',
          content: "Gemäss dem Schweizer DSG haben Sie folgende Rechte: Auskunft, Berichtigung, Löschung, Datenportabilität, Widerspruch gegen die Verarbeitung. Um diese Rechte auszuüben, kontaktieren Sie uns unter teamupfr.ch@gmail.com. Wir antworten innerhalb von 30 Tagen."
        },
        {
          title: '8. Cookies',
          content: "TeamUpFR verwendet nur technisch notwendige Cookies für den Betrieb des Dienstes (Authentifizierungssession, Spracheinstellung). Wir verwenden keine Werbe- oder Drittanbieter-Tracking-Cookies."
        },
        {
          title: '9. Änderungen',
          content: "Wir können diese Richtlinie jederzeit ändern. Bei wesentlichen Änderungen informieren wir Sie per E-Mail. Die gültige Version ist immer auf dieser Seite verfügbar."
        },
        {
          title: '10. Kontakt',
          content: "Bei Fragen zu Ihren personenbezogenen Daten: teamupfr.ch@gmail.com"
        }
      ]
    }
  }

  const c = content[lang]

  return (
    <>
      <section style={{ background: 'linear-gradient(135deg, var(--blue-dark), var(--blue-mid))', padding: '4rem 2rem 3rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 100, padding: '6px 18px', marginBottom: '1.25rem' }}>
            <span>🔒</span>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'rgba(255,255,255,.85)', textTransform: 'uppercase' }}>{c.badge}</span>
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: '#fff', letterSpacing: 2, lineHeight: 1, marginBottom: '.75rem' }}>{c.title}</h1>
          <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 13 }}>{c.updated}</p>
        </div>
      </section>

      <section style={{ background: '#fff', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <div style={{ background: 'var(--blue-light)', border: '1px solid var(--blue-bright)', borderRadius: 12, padding: '1.25rem 1.5rem', marginBottom: '2.5rem', fontSize: 15, color: 'var(--blue-mid)', lineHeight: 1.7 }}>
            {c.intro}
          </div>

          {c.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: i < c.sections.length - 1 ? '1px solid var(--gray-light)' : 'none' }}>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', letterSpacing: 1, color: 'var(--blue-dark)', marginBottom: '.75rem' }}>{s.title}</h2>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.8 }}>{s.content}</p>
            </div>
          ))}

          <div style={{ background: 'var(--gray-bg)', borderRadius: 14, padding: '1.5rem', textAlign: 'center', marginTop: '1rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '.5rem' }}>📧</div>
            <div style={{ fontWeight: 600, marginBottom: '.25rem' }}>
              {lang === 'fr' ? 'Des questions sur vos données ?' : 'Fragen zu Ihren Daten?'}
            </div>
            <a href="mailto:teamupfr.ch@gmail.com" style={{ color: 'var(--blue-bright)', fontWeight: 700 }}>teamupfr.ch@gmail.com</a>
          </div>
        </div>
      </section>
    </>
  )
}
