'use client'

import { useState, useMemo } from 'react'
import { useLang } from '../../lib/lang-context'

type FAQ = {
  q: { fr: string; de: string }
  a: { fr: string; de: string }
}

const faqs: { category: { fr: string; de: string }; icon: string; items: FAQ[] }[] = [
  {
    category: { fr: 'Général', de: 'Allgemein' },
    icon: '⚽',
    items: [
      {
        q: { fr: 'Comment fonctionne TeamUpFR ?', de: 'Wie funktioniert TeamUpFR?' },
        a: { fr: "TeamUpFR est une plateforme qui connecte joueurs, coachs et clubs de football amateur du canton de Fribourg. Tu crées un profil, tu indiques ta disponibilité et ta position, puis tu peux postuler aux annonces des clubs ou être contacté directement.", de: "TeamUpFR ist eine Plattform, die Amateurfussballer, Trainer und Vereine im Kanton Freiburg verbindet. Du erstellst ein Profil, gibst deine Verfügbarkeit und Position an und kannst dich dann auf Vereinsanzeigen bewerben oder direkt kontaktiert werden." }
      },
      {
        q: { fr: 'Qui peut rejoindre TeamUpFR ?', de: 'Wer kann TeamUpFR beitreten?' },
        a: { fr: "TeamUpFR est ouvert à tous les joueurs, coachs et clubs du canton de Fribourg. Il suffit de créer un profil pour commencer à explorer la communauté.", de: "TeamUpFR steht allen Spielern, Trainern und Vereinen im Kanton Freiburg offen. Du musst nur ein Profil erstellen, um die Community zu erkunden." }
      },
      {
        q: { fr: 'Mes données sont-elles sécurisées ?', de: 'Sind meine Daten sicher?' },
        a: { fr: "Oui. Toutes tes données sont stockées de manière sécurisée sur des serveurs en Europe. Nous respectons la Loi fédérale sur la protection des données (LPD) suisse. Tu peux demander la suppression de tes données à tout moment.", de: "Ja. Alle deine Daten werden sicher auf europäischen Servern gespeichert. Wir halten das Schweizer Datenschutzgesetz (DSG) ein. Du kannst jederzeit die Löschung deiner Daten beantragen." }
      },
      {
        q: { fr: 'TeamUpFR fonctionne-t-il sur mobile ?', de: 'Funktioniert TeamUpFR auf dem Handy?' },
        a: { fr: "Oui, TeamUpFR est entièrement optimisé pour mobile. Tu peux l'utiliser depuis ton smartphone ou ta tablette sans télécharger d'application. Une app mobile est en développement.", de: "Ja, TeamUpFR ist vollständig für Mobilgeräte optimiert. Du kannst es von deinem Smartphone oder Tablet aus ohne App-Download nutzen. Eine mobile App ist in Entwicklung." }
      },
      {
        q: { fr: 'Comment contacter le support ?', de: 'Wie kontaktiere ich den Support?' },
        a: { fr: "Tu peux nous contacter par email à teamupfr.ch@gmail.com ou via la messagerie de la plateforme. Nous répondons dans les 24 heures.", de: "Du kannst uns per E-Mail unter teamupfr.ch@gmail.com oder über die Plattform-Messaging-Funktion kontaktieren. Wir antworten innerhalb von 24 Stunden." }
      },
    ]
  },
  {
    category: { fr: 'Joueurs', de: 'Spieler' },
    icon: '👤',
    items: [
      {
        q: { fr: 'Comment modifier mon profil ?', de: 'Wie bearbeite ich mein Profil?' },
        a: { fr: "Connecte-toi, clique sur ton avatar en haut à droite, puis sur 'Modifier'. Tu peux changer ta bio, ta position, ta zone, ta disponibilité et tes statistiques.", de: "Melde dich an, klicke auf deinen Avatar oben rechts und dann auf 'Bearbeiten'. Du kannst deine Bio, Position, Zone, Verfügbarkeit und Statistiken ändern." }
      },
      {
        q: { fr: 'Comment postuler à une annonce ?', de: 'Wie bewerbe ich mich auf eine Anzeige?' },
        a: { fr: "Sur la page d'une annonce, clique sur 'Postuler'. Écris un message de motivation et envoie ta candidature. Le club recevra une notification et pourra accepter ou refuser ta demande.", de: "Klicke auf einer Anzeigenseite auf 'Bewerben'. Schreibe eine Motivationsnachricht und sende deine Bewerbung. Der Verein erhält eine Benachrichtigung und kann deine Anfrage annehmen oder ablehnen." }
      },
      {
        q: { fr: 'Un club peut-il me contacter directement ?', de: 'Kann ein Verein mich direkt kontaktieren?' },
        a: { fr: "Oui ! Si ton profil est visible et que tu es marqué comme disponible, les clubs et coachs peuvent t'envoyer un message directement via la messagerie de la plateforme.", de: "Ja! Wenn dein Profil sichtbar ist und du als verfügbar markiert bist, können Vereine und Trainer dir direkt über die Plattform-Messaging-Funktion eine Nachricht senden." }
      },
    ]
  },
  {
    category: { fr: 'Coachs', de: 'Trainer' },
    icon: '🧑‍🏫',
    items: [
      {
        q: { fr: 'Comment ajouter mes certifications UEFA ?', de: 'Wie füge ich meine UEFA-Lizenzen hinzu?' },
        a: { fr: "Tu peux ajouter tes licences UEFA (D, C, B, A, PRO) directement depuis ton dashboard, dans la section 'Modifier mon profil'. Précise aussi tes années d'expérience et tes catégories préférées.", de: "Du kannst deine UEFA-Lizenzen (D, C, B, A, PRO) direkt in deinem Dashboard unter 'Profil bearbeiten' hinzufügen. Gib auch deine Erfahrungsjahre und bevorzugten Kategorien an." }
      },
      {
        q: { fr: 'Comment décrire ma philosophie de jeu ?', de: 'Wie beschreibe ich meine Spielphilosophie?' },
        a: { fr: "Dans la section 'À propos' de ton profil, tu trouveras des questions guides pour t'aider à structurer ta philosophie. Sois authentique : les clubs cherchent un style qui correspond à leur projet.", de: "Im Bereich 'Über mich' deines Profils findest du Leitfragen, die dir helfen, deine Philosophie zu strukturieren. Sei authentisch: Vereine suchen einen Stil, der zu ihrem Projekt passt." }
      },
      {
        q: { fr: 'Un club peut-il me contacter directement ?', de: 'Kann ein Verein mich direkt kontaktieren?' },
        a: { fr: "Oui. Tout club inscrit sur TeamUpFR peut t'envoyer un message via la messagerie ou voir ton profil complet. Tu peux toi aussi postuler aux annonces des clubs qui recrutent.", de: "Ja. Jeder bei TeamUpFR registrierte Verein kann dir eine Nachricht senden oder dein vollständiges Profil ansehen. Du kannst dich auch auf Anzeigen von Vereinen bewerben, die rekrutieren." }
      },
      {
        q: { fr: 'Puis-je avoir un profil joueur ET coach ?', de: 'Kann ich ein Spieler- UND Trainerprofil haben?' },
        a: { fr: "Pour l'instant, un seul profil par compte. Si tu joues encore, tu peux mentionner ton parcours joueur dans la section 'À propos' de ton profil coach.", de: "Derzeit ist nur ein Profil pro Konto möglich. Wenn du noch spielst, kannst du deinen Spielerwerdegang im Bereich 'Über mich' deines Trainerprofils erwähnen." }
      },
    ]
  },
  {
    category: { fr: 'Clubs', de: 'Vereine' },
    icon: '🏟️',
    items: [
      {
        q: { fr: 'Comment publier une annonce de recrutement ?', de: 'Wie veröffentliche ich eine Rekrutierungsanzeige?' },
        a: { fr: "Connecte-toi avec ton compte club, va dans ton Dashboard, puis clique sur 'Annonces' → 'Publier une annonce'. Remplis le formulaire (poste recherché, ligue, description) et publie. L'annonce sera visible immédiatement.", de: "Melde dich mit deinem Vereinskonto an, gehe in dein Dashboard und klicke auf 'Anzeigen' → 'Anzeige veröffentlichen'. Fülle das Formular aus (gesuchte Position, Liga, Beschreibung) und veröffentliche. Die Anzeige ist sofort sichtbar." }
      },
      {
        q: { fr: 'Comment gérer les candidatures reçues ?', de: 'Wie verwalte ich eingegangene Bewerbungen?' },
        a: { fr: "Dans ton Dashboard, va dans la section 'Candidatures'. Tu verras toutes les candidatures reçues pour chaque annonce. Tu peux accepter, refuser ou laisser en attente chaque candidature.", de: "Gehe in deinem Dashboard zum Bereich 'Bewerbungen'. Du siehst alle eingegangenen Bewerbungen für jede Anzeige. Du kannst jede Bewerbung annehmen, ablehnen oder in der Warteschleife lassen." }
      },
      {
        q: { fr: 'Peut-on avoir plusieurs responsables pour un club ?', de: 'Kann ein Verein mehrere Verantwortliche haben?' },
        a: { fr: "Pour l'instant, chaque club a un seul compte administrateur. La gestion multi-utilisateurs pour les clubs est prévue dans une prochaine mise à jour.", de: "Derzeit hat jeder Verein ein einziges Administratorkonto. Die Multi-User-Verwaltung für Vereine ist für ein zukünftiges Update geplant." }
      },
    ]
  },
  {
    category: { fr: 'Compte', de: 'Konto' },
    icon: '⚙️',
    items: [
      {
        q: { fr: 'Comment supprimer mon profil ?', de: 'Wie lösche ich mein Profil?' },
        a: { fr: "Pour supprimer ton compte, envoie un email à teamupfr.ch@gmail.com avec ton adresse email. Nous supprimerons toutes tes données dans les 48 heures conformément à la LPD suisse.", de: "Um dein Konto zu löschen, sende eine E-Mail an teamupfr.ch@gmail.com mit deiner E-Mail-Adresse. Wir löschen alle deine Daten innerhalb von 48 Stunden gemäss dem Schweizer DSG." }
      },
      {
        q: { fr: 'Comment changer mon mot de passe ?', de: 'Wie ändere ich mein Passwort?' },
        a: { fr: "Va dans Dashboard > Paramètres > Sécurité, et clique sur 'Changer le mot de passe'. Tu devras saisir ton ancien mot de passe et le nouveau.", de: "Gehe zu Dashboard > Einstellungen > Sicherheit und klicke auf 'Passwort ändern'. Du musst dein altes und neues Passwort eingeben." }
      },
      {
        q: { fr: 'Comment changer la langue de mon compte ?', de: 'Wie ändere ich die Sprache meines Kontos?' },
        a: { fr: "Le sélecteur de langue (FR / DE) est disponible en haut à droite de chaque page. Ton choix est mémorisé pour les prochaines visites.", de: "Der Sprachauswahl (FR / DE) ist oben rechts auf jeder Seite verfügbar. Deine Auswahl wird für zukünftige Besuche gespeichert." }
      },
    ]
  },
]

// ─── SVG icons ───────────────────────────────────────────────────────────────

const Svg = ({ children, size = 14, ...p }: React.SVGProps<SVGSVGElement> & { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width={size} height={size} aria-hidden="true" {...p}>
    {children}
  </svg>
)

const IcoHelp     = () => <Svg size={14}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></Svg>
const IcoSearch   = (p: { size?: number }) => <Svg size={p.size || 20}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></Svg>
const IcoPlus     = () => <Svg size={14}><path d="M12 5v14M5 12h14"/></Svg>
const IcoMsg      = () => <Svg size={28}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></Svg>
const IcoEmail    = () => <Svg size={16}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></Svg>
const IcoGlobe    = () => <Svg size={22}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10M12 2a15.3 15.3 0 0 0-4 10 15.3 15.3 0 0 0 4 10"/></Svg>
const IcoPerson   = () => <Svg size={22}><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></Svg>
const IcoCoach    = () => <Svg size={22}><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v6c0 1.5 4 4 9 4s9-2.5 9-4V7"/></Svg>
const IcoBuilding = () => <Svg size={22}><path d="M3 21V8l9-5 9 5v13"/><path d="M9 21V12h6v9"/></Svg>
const IcoGear     = () => <Svg size={22}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></Svg>

const categoryIcons: Record<string, React.ReactNode> = {
  'Général':  <IcoGlobe />,
  'Joueurs':  <IcoPerson />,
  'Coachs':   <IcoCoach />,
  'Clubs':    <IcoBuilding />,
  'Compte':   <IcoGear />,
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function FAQPage() {
  const { lang } = useLang()
  const [search, setSearch]   = useState('')
  const [open,   setOpen]     = useState<string | null>(null)

  const term = search.toLowerCase().trim()

  const filteredFaqs = useMemo(() => {
    if (!term) return faqs
    return faqs
      .map(cat => ({
        ...cat,
        items: cat.items.filter(faq =>
          faq.q[lang].toLowerCase().includes(term) ||
          faq.a[lang].toLowerCase().includes(term)
        ),
      }))
      .filter(cat => cat.items.length > 0)
  }, [term, lang])

  const showNoResults = term !== '' && filteredFaqs.length === 0

  return (
    <div style={{ background: '#0D1F4A', minHeight: '100vh', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .fq-search::placeholder { color: rgba(255,255,255,.3); }
        .fq-search:hover  { border-color: rgba(255,255,255,.22) !important; }
        .fq-search:focus  { outline: none; border-color: #FF3A3A !important; background: rgba(255,255,255,.06) !important; box-shadow: 0 0 0 4px rgba(255,58,58,.1) !important; }
        .fq-item          { transition: border-color .3s, background .3s; }
        .fq-item:hover    { border-color: rgba(255,255,255,.22) !important; }
        .fq-item.fq-open  { border-color: rgba(255,58,58,.3) !important; background: linear-gradient(180deg, rgba(255,58,58,.04) 0%, rgba(255,255,255,.01) 100%) !important; }
        .fq-item.fq-open:hover { border-color: rgba(255,58,58,.5) !important; }
        .fq-toggle        { transition: background .3s, transform .4s cubic-bezier(.22,1,.36,1); }
        .fq-btn-contact   { transition: transform .3s cubic-bezier(.22,1,.36,1), box-shadow .3s cubic-bezier(.22,1,.36,1); }
        .fq-btn-contact:hover { transform: translateY(-2px); box-shadow: 0 16px 36px rgba(255,58,58,.4) !important; }
        @media (max-width: 600px) {
          .fq-hero    { padding: 120px 0 40px !important; }
          .fq-content { padding: 40px 0 80px !important; }
          .fq-cta     { padding: 40px 24px !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section className="fq-hero" style={{ padding: '160px 0 56px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(255,58,58,.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 820, margin: '0 auto', padding: '0 32px' }}>
          <span style={{ fontFamily: "'Russo One', sans-serif", fontSize: 12, letterSpacing: '4px', color: '#FF3A3A', textTransform: 'uppercase', marginBottom: 24, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <IcoHelp />
            {lang === 'fr' ? "Centre d'aide" : 'Hilfecenter'}
          </span>
          <h1 style={{ fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(40px, 7vw, 80px)', lineHeight: .95, letterSpacing: '-1px', textTransform: 'uppercase', marginBottom: 20 }}>
            {lang === 'fr' ? 'Questions' : 'Häufig gestellte'}<br />
            <span style={{ color: '#FF3A3A' }}>{lang === 'fr' ? 'fréquentes.' : 'Fragen.'}</span>
          </h1>
          <p style={{ fontSize: 'clamp(15px, 1.4vw, 18px)', fontWeight: 300, color: 'rgba(255,255,255,.6)', maxWidth: 540, margin: '0 auto 40px', lineHeight: 1.6 }}>
            {lang === 'fr'
              ? "Tu as une question ? La réponse est sûrement ici. Sinon, contacte-nous directement."
              : "Du hast eine Frage? Die Antwort findest du sicher hier. Sonst kontaktiere uns direkt."}
          </p>

          {/* Search bar */}
          <div style={{ maxWidth: 580, margin: '0 auto', position: 'relative' }}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={lang === 'fr' ? 'Rechercher une question…' : 'Eine Frage suchen…'}
              className="fq-search"
              style={{ width: '100%', padding: '16px 24px 16px 56px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 999, fontSize: 15, color: '#fff', fontFamily: 'inherit' }}
            />
            <span style={{ position: 'absolute', left: 22, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,.4)', pointerEvents: 'none', display: 'flex' }}>
              <IcoSearch />
            </span>
          </div>
        </div>
      </section>

      {/* ── FAQ CONTENT ── */}
      <section className="fq-content" style={{ padding: '60px 0 100px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 32px' }}>

          {filteredFaqs.map(cat => (
            <div key={cat.category.fr} style={{ marginBottom: 56 }}>

              {/* Category header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,.12)' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,58,58,.12)', border: '1px solid rgba(255,58,58,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#FF3A3A' }}>
                  {categoryIcons[cat.category.fr]}
                </div>
                <h2 style={{ fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(22px, 3vw, 30px)', letterSpacing: '.3px', textTransform: 'uppercase' }}>
                  {cat.category[lang]}
                </h2>
                <span style={{ marginLeft: 'auto', fontFamily: "'Russo One', sans-serif", fontSize: 12, color: 'rgba(255,255,255,.5)', padding: '5px 14px', borderRadius: 999, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.12)', whiteSpace: 'nowrap' }}>
                  {cat.items.length} {lang === 'fr' ? 'questions' : 'Fragen'}
                </span>
              </div>

              {/* Accordion items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {cat.items.map((faq, i) => {
                  const key = `${cat.category.fr}-${i}`
                  const isOpen = open === key
                  return (
                    <div
                      key={key}
                      className={`fq-item${isOpen ? ' fq-open' : ''}`}
                      style={{
                        background: 'linear-gradient(180deg, rgba(255,255,255,.04) 0%, rgba(255,255,255,.01) 100%)',
                        border: '1px solid rgba(255,255,255,.12)',
                        borderRadius: 16,
                        overflow: 'hidden',
                      }}
                    >
                      <button
                        onClick={() => setOpen(isOpen ? null : key)}
                        style={{ width: '100%', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 16, fontFamily: 'inherit' }}
                      >
                        <span style={{ fontWeight: 500, fontSize: 15, color: '#fff', lineHeight: 1.4 }}>
                          {faq.q[lang]}
                        </span>
                        <span
                          className="fq-toggle"
                          style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: isOpen ? '#FF3A3A' : 'rgba(255,255,255,.06)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, color: '#fff',
                            transform: isOpen ? 'rotate(135deg)' : 'rotate(0deg)',
                          }}
                        >
                          <IcoPlus />
                        </span>
                      </button>
                      {isOpen && (
                        <div style={{ padding: '0 24px 24px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
                          <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,.92)', fontWeight: 300, paddingTop: 16 }}>
                            {faq.a[lang]}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* No results */}
          {showNoResults && (
            <div style={{ textAlign: 'center', padding: '60px 32px' }}>
              <div style={{ width: 80, height: 80, margin: '0 auto 24px', borderRadius: '50%', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.4)' }}>
                <IcoSearch size={32} />
              </div>
              <h3 style={{ fontFamily: "'Russo One', sans-serif", fontSize: 22, marginBottom: 8 }}>
                {lang === 'fr' ? 'Aucun résultat' : 'Kein Ergebnis'}
              </h3>
              <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 14 }}>
                {lang === 'fr'
                  ? "Essaie avec d'autres mots-clés ou contacte-nous directement."
                  : 'Versuche andere Suchbegriffe oder kontaktiere uns direkt.'}
              </p>
            </div>
          )}

          {/* Contact CTA */}
          <div className="fq-cta" style={{ background: 'linear-gradient(135deg, rgba(255,58,58,.06) 0%, rgba(13,31,74,.3) 100%)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 24, padding: '56px 40px', textAlign: 'center', marginTop: 40, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 100%, rgba(255,58,58,.15) 0%, transparent 50%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ width: 64, height: 64, margin: '0 auto 24px', borderRadius: '50%', background: '#FF3A3A', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 16px 40px rgba(255,58,58,.4)', color: '#fff' }}>
                <IcoMsg />
              </div>
              <h3 style={{ fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(22px, 3vw, 30px)', marginBottom: 12, letterSpacing: '.3px' }}>
                {lang === 'fr' ? "Tu n'as pas trouvé ta réponse ?" : 'Keine Antwort gefunden?'}
              </h3>
              <p style={{ color: 'rgba(255,255,255,.92)', fontWeight: 300, maxWidth: 460, margin: '0 auto 28px', lineHeight: 1.6, fontSize: 15 }}>
                {lang === 'fr'
                  ? "Notre équipe est disponible pour t'aider. Pose-nous ta question directement par email — on revient vers toi rapidement."
                  : 'Unser Team steht dir zur Verfügung. Stelle uns deine Frage direkt per E-Mail — wir melden uns schnell.'}
              </p>
              <a
                href="mailto:teamupfr.ch@gmail.com"
                className="fq-btn-contact"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#FF3A3A', color: '#fff', padding: '16px 32px', borderRadius: 999, fontSize: 14, fontWeight: 600, letterSpacing: '.3px', textDecoration: 'none' }}
              >
                <IcoEmail />
                {lang === 'fr' ? 'Contacter le support' : 'Support kontaktieren'}
              </a>
              <div style={{ marginTop: 20, fontSize: 12, letterSpacing: '1.5px', color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, background: '#2ED27F', borderRadius: '50%', boxShadow: '0 0 0 4px rgba(46,210,127,.2)', flexShrink: 0 }} />
                {lang === 'fr' ? 'Réponse sous 24h' : 'Antwort innerhalb 24h'}
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}
