'use client'

import { useState } from 'react'
import Link from 'next/link'
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
        a: { fr: "TeamUpFR est une plateforme gratuite qui connecte joueurs, coachs et clubs de football amateur du canton de Fribourg. Tu crées un profil, tu indiques ta disponibilité et ta position, puis tu peux postuler aux annonces des clubs ou être contacté directement.", de: "TeamUpFR ist eine kostenlose Plattform, die Amateurfussballer, Trainer und Vereine im Kanton Freiburg verbindet. Du erstellst ein Profil, gibst deine Verfügbarkeit und Position an und kannst dich dann auf Vereinsanzeigen bewerben oder direkt kontaktiert werden." }
      },
      {
        q: { fr: 'Est-ce que TeamUpFR est gratuit ?', de: 'Ist TeamUpFR kostenlos?' },
        a: { fr: "Oui, TeamUpFR est 100% gratuit pour les joueurs, les coachs et les clubs. Il n'y a pas de frais cachés, pas d'abonnement, pas de carte bancaire requise.", de: "Ja, TeamUpFR ist 100% kostenlos für Spieler, Trainer und Vereine. Es gibt keine versteckten Kosten, kein Abonnement, keine Kreditkarte erforderlich." }
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
    ]
  },
]

export default function FAQPage() {
  const { lang } = useLang()
  const [open, setOpen] = useState<string | null>(null)

  return (
    <div style={{ background:'#030a24', minHeight:'100vh', color:'#fff' }}>
      {/* HERO */}
      <section style={{ background:'linear-gradient(180deg,#030a24 0%,#061540 100%)', padding:'5rem 2rem 4rem', textAlign:'center' }}>
        <div style={{ maxWidth:700, margin:'0 auto' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(230,57,70,.15)', border:'1px solid rgba(230,57,70,.3)', borderRadius:100, padding:'6px 18px', marginBottom:'1.5rem' }}>
            <span style={{ fontSize:14 }}>❓</span>
            <span style={{ fontSize:11, fontWeight:700, letterSpacing:2, color:'#e63946', textTransform:'uppercase' }}>
              {lang === 'fr' ? 'Centre d\'aide' : 'Hilfecenter'}
            </span>
          </div>
          <h1 style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'clamp(3rem,7vw,5rem)', color:'#fff', letterSpacing:3, lineHeight:1, marginBottom:'1rem' }}>
            {lang === 'fr' ? 'Questions fréquentes' : 'Häufig gestellte Fragen'}
          </h1>
          <p style={{ color:'rgba(255,255,255,.55)', fontSize:17, lineHeight:1.7 }}>
            {lang === 'fr'
              ? "Tu as une question ? La réponse est sûrement ici. Sinon, contacte-nous !"
              : "Du hast eine Frage? Die Antwort findest du sicher hier. Sonst kontaktiere uns!"}
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding:'4rem 2rem' }}>
        <div style={{ maxWidth:800, margin:'0 auto' }}>
          {faqs.map(cat => (
            <div key={cat.category.fr} style={{ marginBottom:'2.5rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'1rem' }}>
                <span style={{ fontSize:'1.5rem' }}>{cat.icon}</span>
                <h2 style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.5rem', letterSpacing:1 }}>
                  {cat.category[lang]}
                </h2>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {cat.items.map((faq, i) => {
                  const key = `${cat.category.fr}-${i}`
                  const isOpen = open === key
                  return (
                    <div key={key} style={{ background: isOpen ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,.03)', borderRadius:14, border:`1.5px solid ${isOpen ? 'rgba(230,57,70,.4)' : 'rgba(255,255,255,.08)'}`, overflow:'hidden', transition:'border-color .15s,background .15s' }}>
                      <button
                        onClick={() => setOpen(isOpen ? null : key)}
                        style={{ width:'100%', padding:'1.25rem 1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between', background:'none', border:'none', cursor:'pointer', textAlign:'left', gap:'1rem', fontFamily:'inherit' }}
                      >
                        <span style={{ fontWeight:600, fontSize:15, color: isOpen ? '#e63946' : '#fff', lineHeight:1.4 }}>
                          {faq.q[lang]}
                        </span>
                        <span style={{ fontSize:20, color: isOpen ? '#e63946' : 'rgba(255,255,255,.4)', flexShrink:0, transition:'transform .2s', transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}>
                          +
                        </span>
                      </button>
                      {isOpen && (
                        <div style={{ padding:'0 1.5rem 1.25rem', borderTop:'1px solid rgba(255,255,255,.07)' }}>
                          <p style={{ fontSize:15, color:'rgba(255,255,255,.55)', lineHeight:1.8, paddingTop:'1rem' }}>
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

          {/* STILL NEED HELP */}
          <div style={{ background:'linear-gradient(135deg,#0a1f5c,#061540)', borderRadius:20, padding:'2.5rem', textAlign:'center', marginTop:'2rem', border:'1px solid rgba(255,255,255,.08)' }}>
            <div style={{ fontSize:'2rem', marginBottom:'1rem' }}>💬</div>
            <h3 style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.8rem', color:'#fff', letterSpacing:1, marginBottom:'.75rem' }}>
              {lang === 'fr' ? "Tu n'as pas trouvé ta réponse ?" : 'Keine Antwort gefunden?'}
            </h3>
            <p style={{ color:'rgba(255,255,255,.55)', fontSize:15, marginBottom:'1.5rem' }}>
              {lang === 'fr'
                ? "Notre équipe est disponible pour t'aider. On répond dans les 24 heures."
                : 'Unser Team steht dir zur Verfügung. Wir antworten innerhalb von 24 Stunden.'}
            </p>
            <a href="mailto:teamupfr.ch@gmail.com" style={{ display:'inline-block', background:'#e63946', color:'#fff', padding:'12px 28px', borderRadius:9, fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.1rem', letterSpacing:1, textDecoration:'none' }}>
              {lang === 'fr' ? '📧 Contacter le support' : '📧 Support kontaktieren'}
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
