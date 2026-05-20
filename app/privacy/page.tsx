'use client'

import { useLang } from '../../lib/lang-context'
import LegalLayout from '../../components/legal/LegalLayout'
import Toc from '../../components/legal/Toc'

// ─── SVG icons ───────────────────────────────────────────────────────────────

const Svg = ({ children, size = 14, ...p }: React.SVGProps<SVGSVGElement> & { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width={size} height={size} aria-hidden="true" {...p}>
    {children}
  </svg>
)

const IcoLock    = () => <Svg size={14}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></Svg>
const IcoWarning = () => <Svg size={16}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></Svg>
const IcoEmail   = () => <Svg size={16}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></Svg>

// ─── Content ─────────────────────────────────────────────────────────────────

type Section = { title: string; content: string; callout?: string }

const content: Record<'fr' | 'de', { badge: string; title: string; updated: string; intro: string; sections: Section[]; tocTitle: string; contactQ: string; contactSub: string }> = {
  fr: {
    badge:    'Politique de confidentialité',
    title:    'Vos données, votre vie privée',
    updated:  'Mise à jour · Mai 2026',
    tocTitle: 'Sommaire',
    intro:    "TeamUpFR s'engage à protéger vos données personnelles conformément à la Loi fédérale sur la protection des données (LPD) suisse. Cette politique explique quelles données nous collectons, pourquoi, et comment vous pouvez les contrôler.",
    contactQ:   'Des questions sur vos données ?',
    contactSub: 'Notre équipe est à votre disposition pour répondre à toute question.',
    sections: [
      { title: '1. Responsable du traitement',  content: "TeamUpFR est responsable du traitement de vos données personnelles. Contact : teamupfr.ch@gmail.com" },
      { title: '2. Données collectées',          content: "Nous collectons les données que vous nous fournissez lors de l'inscription : prénom, nom, adresse email, mot de passe (chiffré), rôle (joueur/coach/club), position, ligue, zone géographique, disponibilité, biographie et photo de profil (optionnelle). Nous collectons également des données techniques : adresse IP, type de navigateur, pages visitées et durée des sessions." },
      { title: '3. Finalité du traitement',      content: "Vos données sont utilisées pour : créer et gérer votre compte, afficher votre profil aux autres utilisateurs, vous mettre en relation avec des clubs, joueurs et coachs, envoyer des notifications relatives à vos candidatures et messages, améliorer nos services." },
      { title: '4. Conservation des données',    content: "Vos données sont conservées tant que votre compte est actif. En cas de suppression de compte, vos données sont effacées dans les 48 heures. Les données de connexion sont conservées 12 mois maximum." },
      { title: '5. Partage des données',         content: "Nous ne vendons jamais vos données à des tiers. Votre profil public (nom, position, ligue, zone, disponibilité, bio) est visible par les autres utilisateurs inscrits sur TeamUpFR. Votre adresse email et votre mot de passe ne sont jamais partagés." },
      { title: '6. Sécurité',                    content: "Vos données sont stockées sur des serveurs sécurisés en Europe (Frankfurt, Allemagne) via Supabase. Toutes les communications sont chiffrées via HTTPS. Les mots de passe sont stockés sous forme de hash bcrypt." },
      { title: '7. Vos droits',                  content: "Conformément à la LPD suisse, vous disposez des droits suivants : accès à vos données, rectification, suppression, portabilité, opposition au traitement. Pour exercer ces droits, contactez-nous à teamupfr.ch@gmail.com. Nous répondons dans les 30 jours." },
      { title: '8. Cookies',                     content: "TeamUpFR utilise uniquement des cookies techniques nécessaires au fonctionnement du service (session d'authentification, préférence de langue). Nous n'utilisons pas de cookies publicitaires ou de tracking tiers." },
      { title: '9. Modifications',               content: "Nous pouvons modifier cette politique à tout moment. En cas de modification importante, nous vous en informerons par email. La version en vigueur est toujours disponible sur cette page." },
      { title: '10. Contact',                    content: "Pour toute question relative à vos données personnelles : teamupfr.ch@gmail.com" },
      {
        title:   '11. Protection des mineurs',
        content: "TeamUpFR est ouvert dès 14 ans. Les mineurs de moins de 18 ans doivent obtenir l'accord de leurs parents ou tuteurs légaux pour s'inscrire.\n\nPour les utilisateurs de 14 à 17 ans, les parents/tuteurs peuvent demander à tout moment l'accès aux données de leur enfant ou la suppression du compte en nous écrivant.",
        callout: "Nous ne collectons sciemment aucune donnée d'enfant de moins de 14 ans. Si vous pensez qu'un mineur de moins de 14 ans s'est inscrit, contactez-nous immédiatement à teamupfr.ch@gmail.com et nous supprimerons le compte.",
      },
    ],
  },
  de: {
    badge:    'Datenschutzrichtlinie',
    title:    'Ihre Daten, Ihre Privatsphäre',
    updated:  'Aktualisierung · Mai 2026',
    tocTitle: 'Inhalt',
    intro:    "TeamUpFR verpflichtet sich, Ihre personenbezogenen Daten gemäss dem Schweizer Datenschutzgesetz (DSG) zu schützen. Diese Richtlinie erklärt, welche Daten wir erheben, warum und wie Sie diese kontrollieren können.",
    contactQ:   'Fragen zu Ihren Daten?',
    contactSub: 'Unser Team steht Ihnen für alle Fragen zur Verfügung.',
    sections: [
      { title: '1. Verantwortlicher für die Datenverarbeitung', content: "TeamUpFR ist für die Verarbeitung Ihrer personenbezogenen Daten verantwortlich. Kontakt: teamupfr.ch@gmail.com" },
      { title: '2. Erhobene Daten',          content: "Wir erheben die Daten, die Sie uns bei der Registrierung mitteilen: Vorname, Nachname, E-Mail-Adresse, Passwort (verschlüsselt), Rolle (Spieler/Trainer/Verein), Position, Liga, geografische Zone, Verfügbarkeit, Biografie und Profilfoto (optional). Wir erheben auch technische Daten: IP-Adresse, Browsertyp, besuchte Seiten und Sitzungsdauer." },
      { title: '3. Zweck der Verarbeitung',  content: "Ihre Daten werden verwendet für: Erstellung und Verwaltung Ihres Kontos, Anzeige Ihres Profils für andere Benutzer, Kontaktaufnahme mit Vereinen, Spielern und Trainern, Versand von Benachrichtigungen zu Ihren Bewerbungen und Nachrichten, Verbesserung unserer Dienste." },
      { title: '4. Datenspeicherung',        content: "Ihre Daten werden gespeichert, solange Ihr Konto aktiv ist. Bei Kontolöschung werden Ihre Daten innerhalb von 48 Stunden gelöscht. Verbindungsdaten werden maximal 12 Monate aufbewahrt." },
      { title: '5. Datenweitergabe',         content: "Wir verkaufen Ihre Daten niemals an Dritte. Ihr öffentliches Profil (Name, Position, Liga, Zone, Verfügbarkeit, Bio) ist für andere registrierte TeamUpFR-Benutzer sichtbar. Ihre E-Mail-Adresse und Ihr Passwort werden niemals weitergegeben." },
      { title: '6. Sicherheit',              content: "Ihre Daten werden auf sicheren Servern in Europa (Frankfurt, Deutschland) über Supabase gespeichert. Alle Kommunikationen sind über HTTPS verschlüsselt. Passwörter werden als bcrypt-Hash gespeichert." },
      { title: '7. Ihre Rechte',             content: "Gemäss dem Schweizer DSG haben Sie folgende Rechte: Auskunft, Berichtigung, Löschung, Datenportabilität, Widerspruch gegen die Verarbeitung. Um diese Rechte auszuüben, kontaktieren Sie uns unter teamupfr.ch@gmail.com. Wir antworten innerhalb von 30 Tagen." },
      { title: '8. Cookies',                 content: "TeamUpFR verwendet nur technisch notwendige Cookies für den Betrieb des Dienstes (Authentifizierungssession, Spracheinstellung). Wir verwenden keine Werbe- oder Drittanbieter-Tracking-Cookies." },
      { title: '9. Änderungen',              content: "Wir können diese Richtlinie jederzeit ändern. Bei wesentlichen Änderungen informieren wir Sie per E-Mail. Die gültige Version ist immer auf dieser Seite verfügbar." },
      { title: '10. Kontakt',                content: "Bei Fragen zu Ihren personenbezogenen Daten: teamupfr.ch@gmail.com" },
      {
        title:   '11. Schutz Minderjähriger',
        content: "TeamUpFR steht ab 14 Jahren offen. Minderjährige unter 18 Jahren müssen die Zustimmung ihrer Eltern oder gesetzlichen Vormund einholen, um sich zu registrieren.\n\nFür Nutzer zwischen 14 und 17 Jahren können Eltern/Erziehungsberechtigte jederzeit den Zugang zu den Daten ihres Kindes oder die Kontolöschung anfordern, indem sie uns schreiben.",
        callout: "Wir erheben wissentlich keine Daten von Kindern unter 14 Jahren. Wenn Sie glauben, dass sich ein Kind unter 14 Jahren registriert hat, kontaktieren Sie uns umgehend unter teamupfr.ch@gmail.com und wir löschen das Konto.",
      },
    ],
  },
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PrivacyPage() {
  const { lang } = useLang()
  const c = content[lang]

  const [titlePart1, titlePart2] = c.title.split(', ')

  const tocItems = c.sections.map((s, i) => ({
    id:    `s${i + 1}`,
    num:   String(i + 1).padStart(2, '0'),
    label: s.title.replace(/^\d+\.\s*/, ''),
  }))

  return (
    <div style={{ background: '#0D1F4A', minHeight: '100vh', color: '#fff', fontFamily: "'Inter', sans-serif" }}>

      {/* ── HERO ── */}
      <section style={{ padding: '160px 0 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '80%', maxWidth: 900, height: 380, background: 'radial-gradient(ellipse at center, rgba(58,122,255,.1) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 820, margin: '0 auto', padding: '0 32px' }}>
          <span style={{ fontFamily: "'Russo One', sans-serif", fontSize: 12, letterSpacing: '4px', color: '#FF3A3A', textTransform: 'uppercase', marginBottom: 24, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <IcoLock />{c.badge}
          </span>
          <h1 style={{ fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: .95, letterSpacing: '-1px', textTransform: 'uppercase', marginBottom: 20 }}>
            {titlePart1},<br /><span style={{ color: '#FF3A3A' }}>{titlePart2}.</span>
          </h1>
          <p style={{ fontSize: 'clamp(15px, 1.3vw, 17px)', fontWeight: 300, color: 'rgba(255,255,255,.92)', maxWidth: 680, margin: '0 auto 32px', lineHeight: 1.6 }}>
            {c.intro}
          </p>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 999, background: 'rgba(46,210,127,.1)', border: '1px solid rgba(46,210,127,.3)', fontSize: 12, letterSpacing: '1.5px', color: '#2ED27F', textTransform: 'uppercase', fontWeight: 600 }}>
            <span style={{ width: 6, height: 6, background: '#2ED27F', borderRadius: '50%', boxShadow: '0 0 0 4px rgba(46,210,127,.2)', flexShrink: 0 }} />
            {c.updated}
          </span>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <LegalLayout sidebar={<Toc title={c.tocTitle} items={tocItems} />}>

        {/* Intro block */}
        <div style={{ padding: 28, background: 'linear-gradient(135deg, rgba(58,122,255,.06) 0%, rgba(13,31,74,.3) 100%)', border: '1px solid rgba(58,122,255,.2)', borderRadius: 16, marginBottom: 48 }}>
          <p style={{ margin: 0, fontWeight: 300, fontSize: 15, lineHeight: 1.7 }}>{c.intro}</p>
        </div>

        {/* Sections */}
        {c.sections.map((s, i) => {
          const id  = `s${i + 1}`
          const num = String(i + 1).padStart(2, '0')
          const paras = s.content.split('\n\n')

          return (
            <section key={id} id={id} className="legal-section" style={{ marginBottom: 48 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: "'Russo One', sans-serif", fontSize: 11, letterSpacing: '2px', color: '#FF3A3A', textTransform: 'uppercase', marginBottom: 8 }}>
                <span style={{ width: 32, height: 1, background: '#FF3A3A', display: 'inline-block', flexShrink: 0 }} />
                {lang === 'fr' ? `Section ${num}` : `Abschnitt ${num}`}
              </div>
              <h2 style={{ fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(20px, 2.4vw, 28px)', lineHeight: 1.15, letterSpacing: '.3px', marginBottom: 20, textTransform: 'uppercase' }}>
                {s.title.replace(/^\d+\.\s*/, '')}
              </h2>

              {s.callout ? (
                <>
                  <p style={{ marginBottom: 20 }}>{paras[0]}</p>
                  <div style={{ display: 'flex', gap: 16, padding: '20px 24px', background: 'rgba(255,154,58,.08)', border: '1px solid rgba(255,154,58,.25)', borderRadius: 14, margin: '0 0 20px' }}>
                    <div style={{ width: 32, height: 32, flexShrink: 0, borderRadius: '50%', background: 'rgba(255,154,58,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF9A3A' }}>
                      <IcoWarning />
                    </div>
                    <p style={{ fontSize: 14, margin: 0 }}>{s.callout}</p>
                  </div>
                  {paras[1] && <p>{paras[1]}</p>}
                </>
              ) : (
                paras.map((p, j) => (
                  <p key={j} style={{ marginBottom: j < paras.length - 1 ? 16 : 0 }}>{p}</p>
                ))
              )}
            </section>
          )
        })}

        {/* Contact card */}
        <div style={{ padding: 40, background: 'linear-gradient(135deg, rgba(255,58,58,.06) 0%, rgba(13,31,74,.3) 100%)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 24, textAlign: 'center', marginTop: 56, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 100%, rgba(255,58,58,.12) 0%, transparent 50%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ width: 56, height: 56, margin: '0 auto 20px', borderRadius: '50%', background: '#FF3A3A', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 28px rgba(255,58,58,.4)', color: '#fff' }}>
              <IcoEmail />
            </div>
            <h3 style={{ fontFamily: "'Russo One', sans-serif", fontSize: 22, marginBottom: 8, letterSpacing: '.3px' }}>
              {c.contactQ}
            </h3>
            <p style={{ color: 'rgba(255,255,255,.6)', marginBottom: 20, fontSize: 14 }}>
              {c.contactSub}
            </p>
            <a
              href="mailto:teamupfr.ch@gmail.com"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, color: '#fff', padding: '12px 24px', borderRadius: 999, border: '1px solid rgba(255,255,255,.22)', background: 'rgba(255,255,255,.04)', textDecoration: 'none', transition: 'border-color .3s, background .3s' }}
            >
              <IcoEmail />
              teamupfr.ch@gmail.com
            </a>
          </div>
        </div>

      </LegalLayout>
    </div>
  )
}
