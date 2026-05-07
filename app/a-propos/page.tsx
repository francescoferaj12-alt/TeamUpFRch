import Link from 'next/link'

const TEAM = [
  {
    name: 'Francesco',
    role: 'Co-fondateur & Développement',
    desc: 'Passionné de football et de technologie, Francesco a imaginé TeamUpFR pour connecter les acteurs du football amateur fribourgeois.',
    initials: 'F'
  },
  {
    name: 'Hugo',
    role: 'Co-fondateur & Design',
    desc: "Hugo s'occupe de l'expérience utilisateur et du design de la plateforme pour que chaque joueur trouve facilement ce qu'il cherche.",
    initials: 'H'
  },
  {
    name: 'Tiago',
    role: 'Co-fondateur & Communication',
    desc: 'Tiago gère les relations avec les clubs et la communauté, assurant que TeamUpFR répond aux besoins réels du terrain.',
    initials: 'T'
  }
]

const TIMELINE = [
  { date: 'Fin 2025', label: 'Idée & conception', desc: 'Naissance du projet TeamUpFR, analyse des besoins du football amateur fribourgeois.' },
  { date: '2025 – 2026', label: 'Développement', desc: 'Création de la plateforme, intégration des profils, annonces et messagerie.' },
  { date: '2026', label: 'Lancement officiel', desc: 'Ouverture au public, partenariats avec les clubs du canton de Fribourg.' },
  { date: 'Bientôt', label: 'Expansion', desc: "Nouvelles fonctionnalités, application mobile, extension à d'autres cantons romands." }
]

export default function AProposPage() {
  return (
    <div>
      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg, var(--blue-dark), var(--blue-mid))', padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginBottom: '1rem' }}>À propos</div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(3rem,8vw,5rem)', color: '#fff', letterSpacing: 2, lineHeight: 1, marginBottom: '1.5rem' }}>
            Notre mission
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,.75)', lineHeight: 1.8, maxWidth: 560, margin: '0 auto' }}>
            TeamUpFR connecte joueurs, coachs et clubs du football amateur dans le canton de Fribourg. Notre objectif : rendre le recrutement local simple, rapide et accessible à tous.
          </p>
        </div>
      </div>

      <div className="wrap" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>

        {/* MISSION */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
          {[
            { icon: '⚽', title: 'Pour les joueurs', desc: 'Crée ton profil, mets en avant tes stats et trouve le club qui correspond à ton niveau et ta zone géographique.' },
            { icon: '🏟️', title: 'Pour les clubs', desc: 'Publie des annonces, découvre les joueurs disponibles dans ta ligue et gère les candidatures depuis ton dashboard.' },
            { icon: '🧑‍🏫', title: 'Pour les coachs', desc: "Mets ta disponibilité en avant, connecte-toi avec des clubs à la recherche d'un entraîneur qualifié." }
          ].map(v => (
            <div key={v.title} style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--border)', padding: '2rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{v.icon}</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', letterSpacing: 1, marginBottom: '.75rem' }}>{v.title}</div>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>{v.desc}</p>
            </div>
          ))}
        </div>

        {/* TEAM */}
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div className="section-label">L'équipe</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2rem,5vw,3rem)', letterSpacing: 1 }}>
              Derrière TeamUpFR
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {TEAM.map(m => (
              <div key={m.name} style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--border)', padding: '2rem', textAlign: 'center' }}>
                <div style={{ width: 72, height: 72, borderRadius: 16, background: 'linear-gradient(135deg, var(--blue-dark), var(--blue-bright))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#fff', margin: '0 auto 1rem' }}>
                  {m.initials}
                </div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', letterSpacing: 1, marginBottom: '.25rem' }}>{m.name}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--blue-bright)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '1rem' }}>{m.role}</div>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* TIMELINE */}
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div className="section-label">Histoire</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2rem,5vw,3rem)', letterSpacing: 1 }}>
              Notre parcours
            </div>
          </div>
          <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 20, top: 0, bottom: 0, width: 2, background: 'var(--gray-light)' }} />
            {TIMELINE.map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', position: 'relative' }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--blue-bright)', border: '3px solid #fff', boxShadow: '0 0 0 2px var(--blue-bright)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1, fontSize: 14, fontWeight: 700, color: '#fff' }}>
                  {i + 1}
                </div>
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', padding: '1.25rem 1.5rem', flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue-bright)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '.25rem' }}>{t.date}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: '.4rem' }}>{t.label}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: 'linear-gradient(135deg, var(--blue-dark), var(--blue-mid))', borderRadius: 24, padding: '3rem 2rem', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2rem,5vw,3rem)', color: '#fff', letterSpacing: 1, marginBottom: '1rem' }}>
            Rejoins la communauté
          </div>
          <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 15, marginBottom: '2rem', maxWidth: 400, margin: '0 auto 2rem' }}>
            Des centaines de joueurs et clubs du canton de Fribourg t&apos;attendent.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" style={{ display: 'inline-block', background: '#e02020', color: '#fff', padding: '13px 32px', borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
              Créer mon profil →
            </Link>
            <Link href="/recherche" style={{ display: 'inline-block', background: 'rgba(255,255,255,.15)', color: '#fff', padding: '13px 32px', borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none', border: '1px solid rgba(255,255,255,.2)' }}>
              Explorer la plateforme
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
