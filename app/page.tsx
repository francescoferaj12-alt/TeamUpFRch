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
      {/* ═══ 1. HERO — image stadio + slogan ═══ */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 600, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        {/* BG IMAGE */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero-stadium.jpg"
          alt=""
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }}
        />

        {/* GRADIENT OVERLAY */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,31,92,.55) 0%, rgba(10,31,92,.82) 55%, rgba(10,31,92,.97) 100%)' }} />

        {/* CONTENT */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 1.5rem', maxWidth: 860, width: '100%' }}>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', backdropFilter: 'blur(8px)', padding: '7px 18px', borderRadius: 100, marginBottom: '1.75rem' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#e02020', boxShadow: '0 0 8px #e02020' }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: 'rgba(255,255,255,.85)', textTransform: 'uppercase' }}>Canton de Fribourg · Suisse</span>
          </div>

          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(4rem, 13vw, 10rem)', color: '#fff', letterSpacing: 4, lineHeight: .88, marginBottom: '1.5rem', textShadow: '0 4px 32px rgba(0,0,0,.45)' }}>
            TON ÉQUIPE<br />
            <span style={{ color: '#e02020' }}>TON AVENIR</span>
          </h1>

          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 'clamp(14px, 2vw, 18px)', lineHeight: 1.6, marginBottom: '2.5rem', maxWidth: 520, margin: '0 auto 2.5rem' }}>
            La plateforme qui connecte joueurs, coachs et clubs de football amateur du canton de Fribourg.
          </p>

          <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#e02020', color: '#fff', padding: '18px 42px', borderRadius: 12, fontWeight: 800, fontSize: 17, boxShadow: '0 10px 32px rgba(224,32,32,.5)', letterSpacing: .3 }}>
            ⚽ Créer mon profil gratuitement
          </Link>

          {/* STATS — glassmorphism */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '4rem' }}>
            {[
              { num: '340+', label: 'Joueurs inscrits' },
              { num: '52', label: 'Clubs actifs' },
              { num: '18', label: 'Coachs disponibles' },
              { num: '9', label: 'Ligues couvertes' }
            ].map((s) => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,.1)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,.16)', borderRadius: 14, padding: '.85rem 1.4rem', textAlign: 'center', minWidth: 100 }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#fff', lineHeight: 1 }}>{s.num}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.55)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, rgba(255,255,255,.4), transparent)' }} />
        </div>
      </section>

      {/* ═══ 2. BANNER ═══ */}
      <section style={{ position: 'relative', width: '100%', height: 300, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/banner.png"
          alt="TeamUpFR — Le football fribourgeois"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,31,92,.92) 0%, rgba(10,31,92,.65) 55%, rgba(10,31,92,.1) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '0 max(2rem, 5vw)', maxWidth: 700 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', color: '#e02020', marginBottom: '.75rem' }}>
            Plateforme officielle
          </div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: '#fff', letterSpacing: 2, lineHeight: 1.05, marginBottom: '1rem' }}>
            La plateforme du football fribourgeois
          </h2>
          <p style={{ color: 'rgba(255,255,255,.72)', fontSize: 15, lineHeight: 1.65, maxWidth: 420 }}>
            Inscription gratuite · Profils joueurs, coachs et clubs · Canton de Fribourg
          </p>
        </div>
      </section>

      {/* ═══ 3. PROFILS (Joueur / Coach / Club) ═══ */}
      <section style={{ background: 'var(--gray-bg)', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label" style={{ textAlign: 'center' }}>Qui peut rejoindre ?</div>
          <h2 className="section-title" style={{ textAlign: 'center', margin: '0 auto .75rem' }}>Une plateforme pour tous</h2>
          <p className="section-desc" style={{ textAlign: 'center', margin: '0 auto 3rem', maxWidth: 520 }}>
            Que tu sois joueur, entraîneur ou responsable de club, TeamUpFR est fait pour toi.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <ProfileCard
              href="/login"
              gradient="linear-gradient(135deg,#1a6fd4,#0a1f5c)"
              icon="👤"
              title="Joueur"
              desc="Crée ton profil avec stats et historique de clubs. Postule aux annonces de recrutement en un clic."
              tags={['Statistiques', 'Candidature', 'Historique']}
              tagColor="#e6f0fb" tagTextColor="#1040a0"
              cta="Créer mon profil joueur" ctaColor="#1a6fd4"
            />
            <ProfileCard
              href="/login"
              gradient="linear-gradient(135deg,#e02020,#7a0a0a)"
              icon="🧑‍🏫"
              title="Coach"
              desc="Publie ton CV et tes licences UEFA. Trouve un club ou recrute des joueurs pour ta prochaine saison."
              tags={['Licences UEFA', 'Recrutement', 'CV digital']}
              tagColor="#fce8e8" tagTextColor="#a01010"
              cta="Créer mon profil coach" ctaColor="#e02020"
            />
            <ProfileCard
              href="/login"
              gradient="linear-gradient(135deg,#0d7a36,#064020)"
              icon="🏟️"
              title="Club"
              desc="Page officielle avec roster, annonces et gestion des candidatures. Badge Vérifié pour les clubs reconnus."
              tags={['Page officielle', 'Annonces', 'Badge Vérifié']}
              tagColor="#e2f5ea" tagTextColor="#0d5c28"
              cta="Créer la page du club" ctaColor="#0d7a36"
            />
          </div>
        </div>
      </section>

      {/* ═══ 4. ANNONCES RÉELLES ═══ */}
      <section style={{ background: '#fff', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
            <div>
              <div className="section-label">Fil d'annonces</div>
              <h2 className="section-title" style={{ marginBottom: '.5rem' }}>Dernières offres & recherches</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 15, maxWidth: 480, lineHeight: 1.6 }}>
                Les clubs et coachs publient leurs besoins en temps réel.
              </p>
            </div>
            <Link href="/annonces" style={{ color: 'var(--blue-bright)', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
              Voir toutes les annonces →
            </Link>
          </div>

          {annonces.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)', border: '2px dashed var(--border)', borderRadius: 16 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📢</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: '.5rem' }}>Aucune annonce pour l'instant</div>
              <p style={{ fontSize: 14, marginBottom: '1.25rem' }}>Sois le premier à publier une annonce sur TeamUpFR !</p>
              <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#e02020', color: '#fff', padding: '11px 22px', borderRadius: 9, fontWeight: 700, fontSize: 14 }}>
                Rejoindre gratuitement →
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {annonces.map((a) => <AnnonceCard key={a.id} annonce={a} />)}
            </div>
          )}
        </div>
      </section>

      {/* ═══ 5. TÉMOIGNAGES ═══ */}
      <section style={{ background: 'var(--gray-bg)', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label" style={{ textAlign: 'center' }}>Ils nous font confiance</div>
          <h2 className="section-title" style={{ textAlign: 'center', margin: '0 auto 3rem' }}>Ce qu'ils en disent</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {[
              { quote: "Grâce à TeamUpFR, j'ai trouvé mon club en 3 jours. La plateforme est simple et efficace.", name: 'Marco', info: '22 ans · Attaquant · Gruyère', initials: 'MA', color: '#1a6fd4' },
              { quote: "En tant que coach, j'ai reçu 5 candidatures en une semaine. Je recommande à tous les clubs du canton.", name: 'Patrick', info: 'Coach UEFA B · Bulle', initials: 'PA', color: '#e02020' },
              { quote: "Notre club a trouvé 2 joueurs grâce à TeamUpFR. Un outil indispensable pour le recrutement local.", name: 'FC Marly', info: 'Club · 4ème Ligue · Broye', initials: 'FM', color: '#0d7a36' }
            ].map((t) => (
              <div key={t.name} style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ fontSize: '2rem', color: t.color, lineHeight: 1 }}>"</div>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-dark)', fontStyle: 'italic', flex: 1 }}>
                  {t.quote}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, color: '#fff', letterSpacing: 1, flexShrink: 0 }}>
                    {t.initials}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.info}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 6. COMMENT ÇA MARCHE — 3 ÉTAPES ═══ */}
      <section style={{ background: '#fff', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label" style={{ textAlign: 'center' }}>Simple & rapide</div>
          <h2 className="section-title" style={{ textAlign: 'center', margin: '0 auto 1rem' }}>Comment ça marche ?</h2>
          <p className="section-desc" style={{ textAlign: 'center', margin: '0 auto 3.5rem', maxWidth: 450 }}>
            Trois étapes suffisent pour trouver ton équipe dans le canton de Fribourg.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', position: 'relative' }}>
            {[
              { step: '01', icon: '👤', title: 'Crée ton profil', desc: 'Inscription gratuite en 2 minutes. Remplis tes informations, stats et disponibilités.' },
              { step: '02', icon: '🔍', title: 'Trouve ton équipe', desc: 'Filtre par ligue, zone et position. Explore les annonces et les profils de tout le canton.' },
              { step: '03', icon: '⚽', title: 'Joue !', desc: 'Contacte directement et rejoins ton nouveau club. Simple, rapide, 100% fribourgeois.' }
            ].map((s, i) => (
              <div key={s.step} style={{ background: 'var(--gray-bg)', borderRadius: 16, border: '1px solid var(--border)', padding: '2rem 1.75rem', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '5rem', color: 'var(--border)', lineHeight: 1, position: 'absolute', top: '-.5rem', right: '1rem', userSelect: 'none' }}>
                  {s.step}
                </div>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem', position: 'relative' }}>{s.icon}</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', letterSpacing: 1, marginBottom: '.65rem', position: 'relative' }}>{s.title}</div>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.65, position: 'relative' }}>{s.desc}</p>
                {i < 2 && (
                  <div style={{ position: 'absolute', right: -16, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, background: '#e02020', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700, zIndex: 2, boxShadow: '0 2px 10px rgba(224,32,32,.35)' }}>
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--blue-dark)', color: '#fff', padding: '14px 32px', borderRadius: 10, fontWeight: 700, fontSize: 15 }}>
              Commencer maintenant →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ 7. LIGUES — fond bleu foncé ═══ */}
      <section style={{ background: 'var(--blue-dark)', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '3rem' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginBottom: '.5rem' }}>Compétitions</div>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(1.8rem,4vw,2.8rem)', color: '#fff', letterSpacing: 1, lineHeight: 1.05 }}>
                Ligues du Canton de Fribourg
              </h2>
            </div>
            <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 14, maxWidth: 320, lineHeight: 1.6 }}>
              TeamUpFR couvre l'ensemble des compétitions officielles du football fribourgeois.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {ligues.map((g) => (
              <div key={g.group} style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 14, padding: '1.25rem' }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', letterSpacing: 1, color: 'var(--blue-bright)', marginBottom: '.85rem', paddingBottom: '.6rem', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                  {g.group}
                </div>
                {g.items.map((item) => (
                  <div key={item} style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', padding: '4px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#e02020', flexShrink: 0 }} />
                    {item}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 8. CTA FINALE — rosso ═══ */}
      <section style={{ background: '#e02020', padding: '6rem 1.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='80' height='80' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='40' cy='40' r='35' fill='none' stroke='%23fff' stroke-width='.5' stroke-opacity='.07'/%3E%3C/svg%3E\")", backgroundSize: '80px 80px' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto' }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 11, letterSpacing: 4, color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            Rejoins la communauté
          </div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2.5rem,7vw,5rem)', color: '#fff', letterSpacing: 2, lineHeight: .95, marginBottom: '1.5rem' }}>
            Prêt à trouver<br />ton équipe ?
          </h2>
          <p style={{ color: 'rgba(255,255,255,.85)', fontSize: 17, marginBottom: '2.5rem', lineHeight: 1.7 }}>
            Gratuit pour tous. Inscription en 2 minutes.<br />Ton équipe t'attend sur TeamUpFR.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" style={{ background: '#fff', color: '#e02020', padding: '15px 36px', borderRadius: 10, fontWeight: 800, fontSize: 15, boxShadow: '0 8px 24px rgba(0,0,0,.2)' }}>
              S'inscrire gratuitement →
            </Link>
            <Link href="/recherche" style={{ background: 'rgba(255,255,255,.15)', color: '#fff', padding: '15px 36px', borderRadius: 10, fontWeight: 600, fontSize: 15, border: '1.5px solid rgba(255,255,255,.35)', backdropFilter: 'blur(8px)' }}>
              Explorer la plateforme
            </Link>
          </div>
          <div style={{ marginTop: '2.5rem', display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['100% gratuit', 'Canton de Fribourg', 'Données sécurisées'].map((t) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,.75)', fontSize: 13 }}>
                <span style={{ fontWeight: 700, color: '#fff' }}>✓</span> {t}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

/* ── COMPONENTS ── */

function ProfileCard({ href, gradient, icon, title, desc, tags, tagColor, tagTextColor, cta, ctaColor }: {
  href: string; gradient: string; icon: string; title: string; desc: string
  tags: string[]; tagColor: string; tagTextColor: string; cta: string; ctaColor: string
}) {
  return (
    <Link href={href} style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: gradient, padding: '2rem 1.75rem 1.75rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,.07)' }} />
        <div style={{ fontSize: '3rem', marginBottom: '.75rem' }}>{icon}</div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#fff', letterSpacing: 2, lineHeight: 1 }}>{title}</div>
      </div>
      <div style={{ padding: '1.5rem 1.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{desc}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {tags.map((t) => (
            <span key={t} style={{ background: tagColor, color: tagTextColor, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 100 }}>{t}</span>
          ))}
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 6, color: ctaColor, fontWeight: 700, fontSize: 14 }}>
          {cta} →
        </div>
      </div>
    </Link>
  )
}

function AnnonceCard({ annonce }: { annonce: Annonce }) {
  const typeColors: Record<string, { bg: string; text: string; bar: string }> = {
    club: { bg: '#e2f5ea', text: '#0d5c28', bar: '#0d7a36' },
    coach: { bg: '#fce8e8', text: '#a01010', bar: '#e02020' },
    player: { bg: '#e6f0fb', text: '#1040a0', bar: '#1a6fd4' }
  }
  const c = typeColors[annonce.author_type] || typeColors.club
  const emoji = annonce.author_type === 'club' ? '🏟️' : annonce.author_type === 'coach' ? '🧑‍🏫' : '👤'
  const dateStr = new Date(annonce.created_at).toLocaleDateString('fr-CH', { day: 'numeric', month: 'short' })

  return (
    <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '.85rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: c.bar }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
          {emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.3, marginBottom: 2 }}>{annonce.title}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{annonce.author_name} · {dateStr}</div>
        </div>
      </div>
      <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--text-muted)', margin: 0 }}>{annonce.body}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {annonce.ligue && <span style={{ background: '#e6f0fb', color: '#1040a0', fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 100 }}>{annonce.ligue}</span>}
        {annonce.position && <span style={{ background: '#fef3e2', color: '#a05a00', fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 100 }}>{annonce.position}</span>}
        {annonce.zone && <span style={{ background: '#e2f5ea', color: '#0d5c28', fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 100 }}>📍 {annonce.zone}</span>}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
        <Link href="/annonces" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e02020', color: '#fff', padding: '9px 16px', borderRadius: 8, fontWeight: 700, fontSize: 13 }}>
          Postuler
        </Link>
        <Link href="/messages" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-bg)', color: 'var(--text-muted)', padding: '9px 16px', borderRadius: 8, fontWeight: 600, fontSize: 13 }}>
          Message
        </Link>
      </div>
    </div>
  )
}
