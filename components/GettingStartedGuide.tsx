'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Profile } from '../lib/supabase'
import { useLang } from '../lib/lang-context'

export default function GettingStartedGuide({ profile }: { profile: Profile }) {
  const { lang } = useLang()
  const [open, setOpen] = useState(false)
  const [ready, setReady] = useState(false)
  const key = `teamup-start-guide-v1:${profile.id}`
  useEffect(() => {
    try { setOpen(localStorage.getItem(key) !== 'hidden') } catch { setOpen(true) }
    setReady(true)
  }, [key])
  function toggle(value: boolean) {
    setOpen(value)
    try { if (value) localStorage.removeItem(key); else localStorage.setItem(key, 'hidden') } catch {}
  }
  if (!ready) return null
  if (!open) return <button className="start-guide-reopen" type="button" onClick={() => toggle(true)}>{lang === 'de' ? 'Starthilfe anzeigen' : 'Afficher le guide de démarrage'}</button>
  const de = lang === 'de'
  const club = profile.role === 'club'
  const approved = profile.club_verification_status === 'approved'
  const steps = [
    { title: de ? 'Dein Profil' : 'Ton profil', text: profile.profile_completed ? (de ? 'Deine Angaben sind gespeichert. Du kannst sie jederzeit ändern.' : 'Tes informations sont enregistrées. Tu peux les modifier à tout moment.') : (de ? 'Bestätige deine Angaben und ergänze die fehlenden Informationen.' : 'Confirme tes réponses et complète les informations manquantes.'), href: profile.profile_completed ? '/profil' : '/onboarding', action: de ? 'Mein Profil öffnen' : 'Ouvrir mon profil', done: !!profile.profile_completed },
    club ? { title: de ? 'Vereinsprüfung' : 'Vérification du club', text: approved ? (de ? 'Euer Verein ist freigeschaltet und kann Anzeigen veröffentlichen.' : 'Votre club est validé et peut publier des annonces.') : (de ? 'Unser Team prüft euren Verein. Bis zur Freigabe könnt ihr Profile und Anzeigen entdecken.' : 'Notre équipe vérifie votre club. En attendant, vous pouvez découvrir les profils et les annonces.'), href: '/profil', action: de ? 'Status ansehen' : 'Voir le statut', done: approved }
      : { title: de ? 'Entdecke die Vereine' : 'Découvre les clubs', text: de ? 'Finde Vereine in deiner Region und entdecke ihre Gesuche.' : 'Trouve les clubs de ta zone et découvre leurs recherches.', href: '/clubs', action: de ? 'Vereine entdecken' : 'Voir les clubs', done: false },
    club ? { title: de ? 'Erste Anzeige' : 'Première recherche', text: de ? 'Beschreibt, wen ihr sucht. Bestätigt eure Suche alle 30 Tage.' : 'Présentez le renfort recherché. Confirmez votre recherche tous les 30 jours.', href: approved ? '/publier' : '/recherche', action: approved ? (de ? 'Anzeige erstellen' : 'Publier une recherche') : (de ? 'Profile entdecken' : 'Découvrir les profils'), done: false }
      : { title: de ? 'Nimm Kontakt auf' : 'Échange avec la communauté', text: de ? 'Entdecke die Anzeigen und nutze die interne Nachrichtenfunktion für den ersten Kontakt.' : 'Consulte les annonces et utilise la messagerie interne pour un premier contact.', href: '/annonces', action: de ? 'Anzeigen entdecken' : 'Voir les annonces', done: false },
  ]
  return <section className="start-guide" aria-label={de ? 'Deine ersten Schritte' : 'Tes premiers pas'}>
    <div className="start-guide-head"><div><p>{de ? 'WILLKOMMEN BEI TEAMUPFR' : 'BIENVENUE SUR TEAMUPFR'}</p><h2>{de ? 'Deine nächsten Schritte' : 'Tes prochains pas'}</h2></div><button type="button" onClick={() => toggle(false)}>{de ? 'Ausblenden' : 'Masquer le guide'}</button></div>
    <div className="start-guide-grid">{steps.map((step, index) => <article key={step.title}><span className="start-guide-number">{step.done ? '✓' : `0${index + 1}`}</span><h3>{step.title}</h3><p>{step.text}</p><Link href={step.href}>{step.action} →</Link></article>)}</div>
  </section>
}
