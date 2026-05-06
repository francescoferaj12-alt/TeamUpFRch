import Link from 'next/link'
import { supabase, Annonce } from '../lib/supabase'
import { ligues } from '../lib/data'

async function getAnnonces(): Promise<Annonce[]> {
  const { data } = await supabase
    .from('annonces')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(6)
  return data || []
}

export default async function HomePage() {
  const annonces = await getAnnonces()

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-badge">⚽ Canton de Fribourg, Suisse</div>
          <h1>TeamUp<span>FR</span></h1>
          <p className="hero-sub">Ton équipe, ton avenir</p>
          <p className="hero-desc">
            La plateforme qui connecte joueurs, coachs et clubs de football amateurs du canton de
            Fribourg. Crée ton profil, publie tes annonces et trouve ta prochaine équipe.
          </p>
          <div className="hero-buttons">
            <Link href="/login" className="btn-hero-primary">Créer mon profil</Link>
            <Link href="/annonces" className="btn-hero-ghost">Voir les annonces</Link>
          </div>
          <div className="hero-stats">
            <div>
              <div className="hero-stat-num">340+</div>
              <div className="hero-stat-label">Joueurs inscrits</div>
            </div>
            <div>
              <div className="hero-stat-num">52</div>
              <div className="hero-stat-label">Clubs actifs</div>
            </div>
            <div>
              <div className="hero-stat-num">18</div>
              <div className="hero-stat-label">Coachs disponibles</div>
            </div>
            <div>
              <div className="hero-stat-num">9</div>
              <div className="hero-stat-label">Ligues couvertes</div>
            </div>
          </div>
        </div>
      </section>

      {/* USER TYPES */}
      <section className="wrap" style={{ paddingTop: '4rem' }}>
        <div className="section-label">Qui peut rejoindre ?</div>
        <h2 className="section-title">Une plateforme pour tous</h2>
        <p className="section-desc">
          Que tu sois joueur, entraîneur ou responsable de club, TeamUpFR est fait pour toi.
        </p>
        <div className="grid-2">
          <UserCard href="/login" color="blue" icon="👤" title="Joueur"
            desc="Crée ton profil avec stats, position, highlights vidéo et historique de clubs."
            tags={['Statistiques', 'Highlights', 'Historique', 'Candidature']} tagClass="badge-blue" />
          <UserCard href="/login" color="red" icon="🧑‍🏫" title="Coach"
            desc="Publie ton CV, tes licences et ta philosophie. Recherche un club ou recrute des joueurs."
            tags={['Licences UEFA', 'Philosophie', 'Recrutement']} tagClass="badge-red" />
          <UserCard href="/recherche" color="green" icon="🏟️" title="Club"
            desc="Page club complète : logo, roster, ligue, annonces de recrutement et contacts."
            tags={['Page officielle', 'Roster', 'Annonces']} tagClass="badge-green" />
        </div>
      </section>

      {/* ANNONCES */}
      <section style={{ background: '#fff', marginTop: '3rem' }}>
        <div className="wrap">
          <div className="section-label">Fil d'annonces</div>
          <h2 className="section-title">Dernières offres et recherches</h2>
          <p className="section-desc">
            Les clubs et coachs publient leurs besoins en temps réel. Postule directement depuis la plateforme.
          </p>

          {annonces.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', border: '2px dashed var(--border)', borderRadius: 16 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📢</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: '.5rem' }}>Aucune annonce pour l'instant</div>
              <div style={{ fontSize: 14 }}>Les clubs et coachs publieront bientôt leurs besoins ici.</div>
              <Link href="/login" className="btn btn-blue" style={{ marginTop: '1rem', display: 'inline-flex' }}>
                Rejoindre la plateforme →
              </Link>
            </div>
          ) : (
            <div className="grid-2">
              {annonces.map((a) => (
                <AnnonceCard key={a.id} annonce={a} />
              ))}
            </div>
          )}

          {annonces.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Link href="/annonces" className="btn btn-blue">
                Voir toutes les annonces →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* LIGUES */}
      <section className="wrap" style={{ marginTop: '4rem' }}>
        <div className="section-label">Compétitions</div>
        <h2 className="section-title">Ligues du Canton de Fribourg</h2>
        <p className="section-desc">
          TeamUpFR couvre l'ensemble des compétitions officielles du football fribourgeois.
        </p>
        <div className="grid-3">
          {ligues.map((g) => (
            <div key={g.group} className="card card-sm">
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: 1, color: 'var(--blue-mid)', marginBottom: '.75rem', paddingBottom: '.5rem', borderBottom: '2px solid var(--gray-light)' }}>
                {g.group}
              </div>
              {g.items.map((item) => (
                <div key={item} style={{ fontSize: 13, color: 'var(--text-muted)', padding: '5px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--blue-bright)', flexShrink: 0 }} />
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--red)', padding: '5rem 1.5rem', textAlign: 'center', marginTop: '4rem' }}>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2rem, 6vw, 4rem)', color: '#fff', letterSpacing: 2, marginBottom: '1rem' }}>
          Prêt à rejoindre la communauté ?
        </h2>
        <p style={{ color: 'rgba(255,255,255,.85)', fontSize: 16, marginBottom: '2rem' }}>
          Gratuit pour tous. Inscription en 2 minutes. Ton équipe t'attend.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/login" style={{ background: '#fff', color: 'var(--red)', padding: '14px 32px', borderRadius: 9, fontWeight: 700, fontSize: 15 }}>
            S'inscrire gratuitement
          </Link>
          <Link href="/recherche" style={{ background: 'transparent', color: '#fff', padding: '14px 32px', borderRadius: 9, fontWeight: 600, fontSize: 15, border: '2px solid rgba(255,255,255,.6)' }}>
            Découvrir
          </Link>
        </div>
      </section>
    </>
  )
}

function AnnonceCard({ annonce }: { annonce: Annonce }) {
  const typeEmoji = annonce.author_type === 'club' ? '🏟️' : annonce.author_type === 'coach' ? '🧑‍🏫' : '👤'
  const dateStr = new Date(annonce.created_at).toLocaleDateString('fr-CH', { day: 'numeric', month: 'short' })

  return (
    <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
          {typeEmoji}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{annonce.author_name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{dateStr}</div>
        </div>
        <span className="badge badge-blue" style={{ marginLeft: 'auto' }}>{annonce.status === 'active' ? '🟢 Active' : '⚪ Fermée'}</span>
      </div>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{annonce.title}</div>
      <p style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 12, color: 'var(--text-muted)' }}>{annonce.body}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {annonce.ligue && <span className="badge badge-blue">{annonce.ligue}</span>}
        {annonce.position && <span className="badge badge-amber">{annonce.position}</span>}
        {annonce.zone && <span className="badge badge-green">📍 {annonce.zone}</span>}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Link href="/annonces" className="btn btn-blue btn-sm">Postuler</Link>
        <Link href="/messages" className="btn btn-ghost btn-sm">Message</Link>
      </div>
    </div>
  )
}

function UserCard({ href, color, icon, title, desc, tags, tagClass }: { href: string; color: string; icon: string; title: string; desc: string; tags: string[]; tagClass: string }) {
  const stripeColor = color === 'blue' ? 'linear-gradient(90deg,#1a6fd4,#5b9eff)' : color === 'red' ? 'linear-gradient(90deg,#e02020,#ff8c42)' : 'linear-gradient(90deg,#1db954,#0d7a36)'
  return (
    <Link href={href} style={{ background: '#fff', borderRadius: 16, padding: '2rem', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden', display: 'block' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: stripeColor }} />
      <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{icon}</div>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', letterSpacing: 1, marginBottom: '.5rem' }}>{title}</div>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6, marginBottom: '1.25rem' }}>{desc}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {tags.map((t) => <span key={t} className={`badge ${tagClass}`}>{t}</span>)}
      </div>
    </Link>
  )
}
