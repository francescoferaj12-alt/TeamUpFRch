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

const IcoDoc   = () => <Svg size={14}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></Svg>
const IcoBan   = () => <Svg size={16}><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></Svg>
const IcoGlobe = () => <Svg size={26}><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10"/><path d="M12 2a15.3 15.3 0 0 0-4 10 15.3 15.3 0 0 0 4 10"/></Svg>

// ─── Types ───────────────────────────────────────────────────────────────────

type Forbidden = { header: string; items: string[] }
type Section   = { title: string; paras: string[]; forbidden?: Forbidden; afterForbidden?: string[] }

// ─── Content ─────────────────────────────────────────────────────────────────

const content: Record<'fr' | 'de', {
  badge: string; titleLine1: string; titleAccent: string
  updated: string; tocTitle: string; intro: string
  sections: Section[]
  signoff: { location: string }
}> = {
  fr: {
    badge:       "Conditions d'utilisation",
    titleLine1:  'Règles de la',
    titleAccent: 'plateforme.',
    updated:     'En vigueur · Mai 2026',
    tocTitle:    'Sommaire',
    intro:       "En utilisant TeamUpFR, vous acceptez les présentes conditions. Veuillez les lire attentivement. TeamUpFR est une plateforme dédiée au football amateur du canton de Fribourg, Suisse.",
    sections: [
      {
        title: '1. Acceptation des conditions',
        paras: ["En créant un compte sur TeamUpFR, vous acceptez les présentes Conditions Générales d'Utilisation. Si vous n'acceptez pas ces conditions, vous ne pouvez pas utiliser la plateforme."],
      },
      {
        title: '2. Eligibilité',
        paras: ["TeamUpFR est ouvert à toute personne de 14 ans ou plus. Les mineurs de moins de 18 ans doivent avoir l'accord de leurs parents ou tuteurs légaux pour s'inscrire."],
      },
      {
        title: '3. Compte utilisateur',
        paras: [
          "Vous êtes responsable de la sécurité de votre compte et de votre mot de passe. Vous devez fournir des informations exactes et à jour.",
          "Un seul compte par personne est autorisé. Tout compte créé avec de fausses informations peut être supprimé.",
        ],
      },
      {
        title: '4. Contenu autorisé',
        paras: ["Vous pouvez publier :\n— des informations sportives vous concernant (position, stats, expérience)\n— des annonces de recrutement légitimes\n— des messages respectueux entre utilisateurs\n— des photos de profil appropriées."],
      },
      {
        title: '5. Contenu interdit',
        paras: ["Il est strictement interdit de publier :"],
        forbidden: {
          header: 'Strictement interdit',
          items: [
            "du contenu offensant, discriminatoire ou haineux",
            "de fausses informations sur votre identité ou vos compétences",
            "du spam ou des publicités non autorisées",
            "du contenu portant atteinte aux droits d'autrui",
          ],
        },
      },
      {
        title: '6. Responsabilité',
        paras: ["TeamUpFR est une plateforme de mise en relation. Nous ne sommes pas responsables :\n— des accords conclus entre utilisateurs\n— des informations inexactes publiées par les utilisateurs\n— des litiges entre joueurs, coachs et clubs."],
      },
      {
        title: '7. Suspension et suppression',
        paras: [
          "TeamUpFR se réserve le droit de suspendre ou supprimer tout compte qui viole les présentes conditions, sans préavis.",
          "Les utilisateurs peuvent supprimer leur compte à tout moment depuis leur profil ou en contactant teamupfr.ch@gmail.com.",
        ],
      },
      {
        title: '8. Propriété intellectuelle',
        paras: [
          "Le nom, le logo et l'identité visuelle de TeamUpFR sont la propriété exclusive de ses fondateurs.",
          "Vous conservez les droits sur le contenu que vous publiez, mais accordez à TeamUpFR une licence d'affichage sur la plateforme.",
        ],
      },
      {
        title: '9. Modifications',
        paras: ["TeamUpFR se réserve le droit de modifier les présentes conditions à tout moment. Les utilisateurs seront informés par email en cas de modification importante."],
      },
      {
        title: '10. Droit applicable',
        paras: ["Les présentes conditions sont soumises au droit suisse. Tout litige sera soumis aux tribunaux compétents du canton de Fribourg, Suisse."],
      },
      {
        title: '11. Modération et messagerie',
        paras: ["La messagerie de TeamUpFR est destinée à la mise en relation sportive entre joueurs, coachs et clubs."],
        forbidden: {
          header: 'Sont interdits',
          items: [
            "les messages à caractère sexuel, harcelant, raciste ou discriminatoire",
            "les sollicitations commerciales non liées au football amateur",
            "l'envoi de spam ou de liens malveillants",
            "la diffusion de coordonnées d'autrui sans consentement",
          ],
        },
        afterForbidden: [
          "Tout utilisateur peut signaler un message ou un compte abusif en contactant teamupfr.ch@gmail.com. Notre équipe examine chaque signalement dans un délai de 48 heures et peut suspendre ou supprimer un compte en cas de violation.",
          "Nous nous réservons le droit de modérer ou supprimer tout contenu contraire aux présentes conditions, sans préavis.",
        ],
      },
    ],
    signoff: { location: 'Fait à Fribourg' },
  },
  de: {
    badge:       'Nutzungsbedingungen',
    titleLine1:  'Regeln der',
    titleAccent: 'Plattform.',
    updated:     'Gültig ab · Mai 2026',
    tocTitle:    'Inhaltsverzeichnis',
    intro:       "Durch die Nutzung von TeamUpFR stimmen Sie diesen Bedingungen zu. Bitte lesen Sie sie sorgfältig durch. TeamUpFR ist eine Plattform für den Amateurfussball im Kanton Freiburg, Schweiz.",
    sections: [
      {
        title: '1. Annahme der Bedingungen',
        paras: ["Durch die Erstellung eines Kontos auf TeamUpFR akzeptieren Sie diese Allgemeinen Nutzungsbedingungen. Wenn Sie diese Bedingungen nicht akzeptieren, können Sie die Plattform nicht nutzen."],
      },
      {
        title: '2. Berechtigung',
        paras: ["TeamUpFR steht allen Personen ab 14 Jahren offen. Minderjährige unter 18 Jahren benötigen die Zustimmung ihrer Eltern oder gesetzlichen Vertreter zur Registrierung."],
      },
      {
        title: '3. Benutzerkonto',
        paras: [
          "Sie sind für die Sicherheit Ihres Kontos und Passworts verantwortlich. Sie müssen genaue und aktuelle Informationen angeben.",
          "Pro Person ist nur ein Konto erlaubt. Konten mit falschen Informationen können gelöscht werden.",
        ],
      },
      {
        title: '4. Erlaubte Inhalte',
        paras: ["Sie dürfen veröffentlichen :\n— sportliche Informationen über sich selbst (Position, Statistiken, Erfahrung)\n— legitime Rekrutierungsanzeigen\n— respektvolle Nachrichten zwischen Benutzern\n— angemessene Profilfotos."],
      },
      {
        title: '5. Verbotene Inhalte',
        paras: ["Es ist streng verboten zu veröffentlichen :"],
        forbidden: {
          header: 'Streng verboten',
          items: [
            "beleidigende, diskriminierende oder hasserfüllte Inhalte",
            "falsche Informationen über Ihre Identität oder Fähigkeiten",
            "Spam oder nicht autorisierte Werbung",
            "Inhalte, die Rechte Dritter verletzen",
          ],
        },
      },
      {
        title: '6. Haftung',
        paras: ["TeamUpFR ist eine Vermittlungsplattform. Wir sind nicht verantwortlich für :\n— Vereinbarungen zwischen Benutzern\n— ungenaue Informationen von Benutzern\n— Streitigkeiten zwischen Spielern, Trainern und Vereinen."],
      },
      {
        title: '7. Sperrung und Löschung',
        paras: [
          "TeamUpFR behält sich das Recht vor, Konten, die gegen diese Bedingungen verstossen, ohne Vorankündigung zu sperren oder zu löschen.",
          "Benutzer können ihr Konto jederzeit über ihr Profil oder per E-Mail an teamupfr.ch@gmail.com löschen.",
        ],
      },
      {
        title: '8. Geistiges Eigentum',
        paras: [
          "Name, Logo und visuelle Identität von TeamUpFR sind ausschliessliches Eigentum der Gründer.",
          "Sie behalten die Rechte an den von Ihnen veröffentlichten Inhalten, gewähren TeamUpFR jedoch eine Anzeigelizenz auf der Plattform.",
        ],
      },
      {
        title: '9. Änderungen',
        paras: ["TeamUpFR behält sich das Recht vor, diese Bedingungen jederzeit zu ändern. Benutzer werden bei wesentlichen Änderungen per E-Mail informiert."],
      },
      {
        title: '10. Anwendbares Recht',
        paras: ["Diese Bedingungen unterliegen dem Schweizer Recht. Alle Streitigkeiten werden den zuständigen Gerichten des Kantons Freiburg, Schweiz, vorgelegt."],
      },
      {
        title: '11. Moderation und Messaging',
        paras: ["Das Messaging von TeamUpFR dient der sportlichen Vernetzung zwischen Spielern, Trainern und Vereinen."],
        forbidden: {
          header: 'Verboten sind',
          items: [
            "Nachrichten sexueller, belästigender, rassistischer oder diskriminierender Natur",
            "kommerzielle Werbung ohne Bezug zum Amateurfussball",
            "das Versenden von Spam oder schädlichen Links",
            "die Weitergabe personenbezogener Daten Dritter ohne Einwilligung",
          ],
        },
        afterForbidden: [
          "Jeder Nutzer kann einen missbräuchlichen Account oder eine Nachricht melden, indem er teamupfr.ch@gmail.com kontaktiert. Unser Team prüft jeden Hinweis innerhalb von 48 Stunden und kann bei einem Verstoss ein Konto sperren oder löschen.",
          "Wir behalten uns das Recht vor, Inhalte, die gegen diese Bedingungen verstossen, ohne Vorankündigung zu moderieren oder zu entfernen.",
        ],
      },
    ],
    signoff: { location: 'Gemacht in Freiburg' },
  },
}

// ─── Email link helper ────────────────────────────────────────────────────────

const EMAIL = 'teamupfr.ch@gmail.com'

function Paras({ items }: { items: string[] }) {
  return (
    <>
      {items.map((p, i) => {
        const style: React.CSSProperties = { marginBottom: i < items.length - 1 ? 16 : 0, whiteSpace: 'pre-line' }
        if (!p.includes(EMAIL)) return <p key={i} style={style}>{p}</p>
        const [before, after] = p.split(EMAIL)
        return (
          <p key={i} style={style}>
            {before}<a href={`mailto:${EMAIL}`} style={{ color: '#FF3A3A', textDecoration: 'underline' }}>{EMAIL}</a>{after}
          </p>
        )
      })}
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CGUPage() {
  const { lang } = useLang()
  const c = content[lang]

  const tocItems = c.sections.map((s, i) => ({
    id:    `s${i + 1}`,
    num:   String(i + 1).padStart(2, '0'),
    label: s.title.replace(/^\d+\.\s*/, ''),
  }))

  return (
    <div style={{ background: '#0D1F4A', minHeight: '100vh', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .cgu-fbox { padding: 20px 24px; background: rgba(255,58,58,.06); border: 1px solid rgba(255,58,58,.25); border-radius: 14px; margin: 20px 0; }
        .cgu-fbox-head { display: flex; align-items: center; gap: 10px; font-family: 'Russo One', sans-serif; font-size: 12px; letter-spacing: 2px; color: #FF3A3A; text-transform: uppercase; margin-bottom: 12px; }
        .cgu-fbox ul { list-style: none; padding: 0; margin: 0; }
        .cgu-fbox li { padding: 6px 0 6px 22px; position: relative; font-size: 14px; color: rgba(255,255,255,.85); }
        .cgu-fbox li::before { content: ''; position: absolute; left: 0; top: 14px; width: 12px; height: 1px; background: #FF3A3A; }
        .cgu-ch { display: inline-flex; align-items: center; padding: 3px 8px; border-radius: 4px; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12); font-size: 10px; font-weight: 700; letter-spacing: 1px; color: rgba(255,255,255,.92); }
      `}</style>

      {/* ── HERO ── */}
      <section style={{ padding: '160px 0 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '80%', maxWidth: 900, height: 380, background: 'radial-gradient(ellipse at center, rgba(255,58,58,.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 820, margin: '0 auto', padding: '0 32px' }}>
          <span style={{ fontFamily: "'Russo One', sans-serif", fontSize: 12, letterSpacing: '4px', color: '#FF3A3A', textTransform: 'uppercase', marginBottom: 24, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <IcoDoc />{c.badge}
          </span>
          <h1 style={{ fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: .95, letterSpacing: '-1px', textTransform: 'uppercase', marginBottom: 20 }}>
            {c.titleLine1}<br /><span style={{ color: '#FF3A3A' }}>{c.titleAccent}</span>
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
        <div style={{ padding: 28, background: 'linear-gradient(135deg, rgba(255,58,58,.06) 0%, rgba(13,31,74,.3) 100%)', border: '1px solid rgba(255,58,58,.2)', borderRadius: 16, marginBottom: 48 }}>
          <p style={{ margin: 0, fontWeight: 300, fontSize: 15, lineHeight: 1.7 }}>{c.intro}</p>
        </div>

        {/* Sections */}
        {c.sections.map((s, i) => {
          const id  = `s${i + 1}`
          const num = String(i + 1).padStart(2, '0')
          return (
            <section key={id} id={id} className="legal-section" style={{ marginBottom: 48 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: "'Russo One', sans-serif", fontSize: 11, letterSpacing: '2px', color: '#FF3A3A', textTransform: 'uppercase', marginBottom: 8 }}>
                <span style={{ width: 32, height: 1, background: '#FF3A3A', display: 'inline-block', flexShrink: 0 }} />
                {lang === 'fr' ? `Section ${num}` : `Abschnitt ${num}`}
              </div>
              <h2 style={{ fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(20px, 2.4vw, 28px)', lineHeight: 1.15, letterSpacing: '.3px', marginBottom: 20, textTransform: 'uppercase' }}>
                {s.title.replace(/^\d+\.\s*/, '')}
              </h2>
              <Paras items={s.paras} />
              {s.forbidden && (
                <div className="cgu-fbox">
                  <div className="cgu-fbox-head"><IcoBan />{s.forbidden.header}</div>
                  <ul>{s.forbidden.items.map((item, k) => <li key={k}>{item}</li>)}</ul>
                </div>
              )}
              {s.afterForbidden && <Paras items={s.afterForbidden} />}
            </section>
          )
        })}

        {/* Sign-off */}
        <div style={{ textAlign: 'center', marginTop: 56, padding: 40, borderTop: '1px solid rgba(255,255,255,.12)', borderBottom: '1px solid rgba(255,255,255,.12)' }}>
          <div style={{ width: 56, height: 56, margin: '0 auto 20px', borderRadius: '50%', background: 'linear-gradient(135deg, #FF3A3A 0%, #c41f1f 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 28px rgba(255,58,58,.4)', color: '#fff' }}>
            <IcoGlobe />
          </div>
          <div style={{ fontFamily: "'Russo One', sans-serif", fontSize: 28, letterSpacing: '.5px', marginBottom: 8, textTransform: 'uppercase' }}>
            TeamUpFR
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(255,255,255,.6)', letterSpacing: '.5px' }}>
            <span>{c.signoff.location}</span>
            <span className="cgu-ch">CH</span>
          </div>
        </div>

      </LegalLayout>
    </div>
  )
}
