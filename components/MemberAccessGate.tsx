'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '../lib/auth-context'
import { useLang } from '../lib/lang-context'
import { isPublicPage, memberLoginHref } from '../lib/member-access'

export default function MemberAccessGate({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { session, authLoading, mediaReady, mediaError } = useAuth()
  const { lang } = useLang()
  if (isPublicPage(pathname)) return <>{children}</>
  if (session && !mediaReady && mediaError) return <section style={{padding:'140px 24px',textAlign:'center'}} role="alert">
    <p>{lang==='de'?'Die sichere Verbindung konnte nicht hergestellt werden. Prüfe deine Verbindung und versuche es erneut.':'La connexion sécurisée n’a pas pu être établie. Vérifie ta connexion puis réessaie.'}</p>
    <button className="btn btn-red" onClick={()=>window.location.reload()}>{lang==='de'?'Erneut versuchen':'Réessayer'}</button>
  </section>
  // Never mount member pages (or run their data effects) before authentication.
  if (authLoading || (session && !mediaReady)) return <div className="home-session-loading" role="status">{lang === 'de' ? 'Wird geladen…' : 'Chargement…'}</div>
  if (session) return <>{children}</>

  return <section className="member-access-gate" aria-labelledby="member-access-title">
    <div className="member-access-preview" aria-hidden="true">
      <div className="member-preview-heading" />
      <div className="member-preview-filters"><i /><i /><i /></div>
      <div className="member-preview-grid">{Array.from({ length: 6 }, (_, i) => <div className="member-preview-card" key={i}><i /><b /><span /><span /></div>)}</div>
    </div>
    <div className="member-access-shade" />
    <div className="member-access-card">
      <span className="member-access-lock" aria-hidden="true"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="5" y="10" width="14" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /><path d="M12 14v3" /></svg></span>
      <p className="member-access-eyebrow">{lang === 'de' ? 'DEIN TEAM WARTET AUF DICH' : 'TON ÉQUIPE T’ATTEND'}</p>
      <h1 id="member-access-title">{lang === 'de' ? 'Entdecke die TeamUpFR-Community' : 'Découvre la communauté TeamUpFR'}</h1>
      <p>{lang === 'de' ? 'Erstelle ein Konto oder melde dich an, um Anzeigen, Profile und Vereine zu entdecken und dich mit anderen auszutauschen.' : 'Crée un compte ou connecte-toi pour découvrir les annonces, les profils et les clubs, et échanger avec la communauté.'}</p>
      <div className="member-access-actions">
        <Link className="btn btn-red" href={memberLoginHref(pathname, true)}>{lang === 'de' ? 'Konto erstellen' : 'Créer un compte'}</Link>
        <Link className="btn btn-outline" href={memberLoginHref(pathname)}>{lang === 'de' ? 'Anmelden' : 'Se connecter'}</Link>
      </div>
      <Link className="member-access-back" href="/accueil">{lang === 'de' ? '← Zurück zum Video' : '← Revenir à la vidéo'}</Link>
    </div>
  </section>
}
