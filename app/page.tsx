'use client'

import Link from 'next/link';
import { annonces, ligues } from '../lib/data';

export default function HomePage() {
  return (
    <>
      {/* ══════════════════════════════════════
          HERO — VIDEO BACKGROUND
      ══════════════════════════════════════ */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 600, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        {/* VIDEO */}
        <video
          autoPlay muted loop playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
        >
          <source src="/video/hero.mp4" type="video/mp4" />
        </video>

        {/* DARK OVERLAY */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(10,31,92,.92) 0%, rgba(10,31,92,.7) 50%, rgba(0,0,0,.5) 100%)', zIndex: 1 }} />

        {/* PATTERN OVERLAY */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2, opacity: .04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L0 30h30V0zm0 60L60 30H30v30z' fill='%23fff'/%3E%3C/svg%3E")`
        }} />

        {/* CONTENT */}
        <div style={{ position: 'relative', zIndex: 3, maxWidth: 1100, margin: '0 auto', padding: '0 2rem', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '2rem' }}>

            <div>
              {/* BADGE */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 100, padding: '6px 16px', marginBottom: '1.5rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 8px #00ff88' }} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'rgba(255,255,255,.9)', textTransform: 'uppercase' }}>Canton de Fribourg · Suisse 🇨🇭</span>
              </div>

              {/* TITLE */}
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(4rem, 10vw, 8rem)', color: '#fff', letterSpacing: 3, lineHeight: .95, marginBottom: '1rem' }}>
                IT'S TIME<br />
                TO <span style={{ color: '#ff3333', textShadow: '0 0 40px rgba(255,51,51,.5)' }}>PLAY</span>
              </h1>

              {/* LOGO */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
                <img src="/images/logo.png" alt="TeamUpFR" style={{ height: 48, objectFit: 'contain' }} />
                <div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: '#fff', letterSpacing: 2, lineHeight: 1 }}>TeamUp<span style={{ color: '#ff3333' }}>FR</span></div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', fontStyle: 'italic' }}>Ton équipe, ton avenir</div>
                </div>
              </div>

              <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'rgba(255,255,255,.75)', lineHeight: 1.7, maxWidth: 520, marginBottom: '2rem' }}>
                La première plateforme qui connecte <strong style={{ color: '#fff' }}>joueurs</strong>, <strong style={{ color: '#fff' }}>coachs</strong> et <strong style={{ color: '#fff' }}>clubs</strong> de football amateurs du canton de Fribourg.
              </p>

              {/* BUTTONS */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link href="/login" style={{
                  background: '#e02020', color: '#fff',
                  padding: '16px 36px', borderRadius: 10,
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: '1.2rem', letterSpacing: 2,
                  textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
                  boxShadow: '0 8px 32px rgba(224,32,32,.4)',
                  transition: 'all .2s'
                }}>
                  ⚽ Créer mon profil
                </Link>
                <Link href="/recherche" style={{
                  background: 'rgba(255,255,255,.12)', color: '#fff',
                  padding: '16px 36px', borderRadius: 10,
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: '1.2rem', letterSpacing: 2,
                  textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
                  border: '1px solid rgba(255,255,255,.25)',
                  backdropFilter: 'blur(10px)'
                }}>
                  🔍 Découvrir
                </Link>
              </div>
            </div>

            {/* STATS CARD */}
            <div style={{ background: 'rgba(255,255,255,.08)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 20, padding: '2rem', minWidth: 220 }}>
              {[
                { num: '340+', label: 'Joueurs inscrits', icon: '👤' },
                { num: '52', label: 'Clubs actifs', icon: '🏟️' },
                { num: '18', label: 'Coachs disponibles', icon: '🧑‍🏫' },
                { num: '100%', label: 'Gratuit', icon: '🆓' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '.75rem 0', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                  <span style={{ fontSize: 20 }}>{s.icon}</span>
                  <div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', color: '#fff', lineHeight: 1 }}>{s.num}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SCROLL INDICATOR */}
        <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', letterSpacing: 2, textTransform: 'uppercase' }}>Scroll</span>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, rgba(255,255,255,.4), transparent)' }} />
        </div>
      </section>

      {/* ══════════════════════════════════════
          BANNER IMAGE
      ══════════════════════════════════════ */}
      <section style={{ position: 'relative', height: 400, overflow: 'hidden' }}>
        <img
          src="/images/banner.png"
          alt="TeamUpFR"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }}

        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,31,92,.85) 0%, rgba(10,31,92,.3) 60%, transparent 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 4rem' }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2rem, 5vw, 4rem)', color: '#fff', letterSpacing: 2, lineHeight: 1, marginBottom: '.5rem' }}>
              La plateforme du<br />
              <span style={{ color: '#ff3333' }}>football fribourgeois</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 16, maxWidth: 400, lineHeight: 1.6 }}>
              Rejoins des centaines de joueurs et clubs qui font confiance à TeamUpFR pour leur carrière amateur.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          3 USER TYPES
      ══════════════════════════════════════ */}
      <section style={{ background: '#fff', padding: '5rem 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--blue-bright)', marginBottom: '.5rem' }}>Pour tout le monde</div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: 1, marginBottom: '.75rem' }}>Une plateforme, trois profils</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>Que tu sois joueur, entraîneur ou responsable de club, TeamUpFR est fait pour toi.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {[
              {
                href: '/login', icon: '👤', title: 'Joueur', color: '#1a6fd4',
                bg: 'linear-gradient(135deg, #0a1f5c, #1a6fd4)',
                desc: 'Crée ton profil, montre tes stats et highlights vidéo. Postule directement aux annonces des clubs.',
                tags: ['Stats & Highlights', 'Candidatures', 'Messagerie'],
                cta: 'Créer mon profil joueur'
              },
              {
                href: '/login', icon: '🧑‍🏫', title: 'Coach', color: '#e02020',
                bg: 'linear-gradient(135deg, #6b0000, #e02020)',
                desc: 'Publie tes certifications UEFA, ta philosophie de jeu. Trouve le club qui correspond à ta vision.',
                tags: ['Licences UEFA', 'Philosophie', 'Recrutement'],
                cta: 'Créer mon profil coach'
              },
              {
                href: '/club/bulle', icon: '🏟️', title: 'Club', color: '#0d7a36',
                bg: 'linear-gradient(135deg, #063a1a, #0d7a36)',
                desc: 'Page officielle avec roster complet, annonces de recrutement et gestion des candidatures.',
                tags: ['Page officielle', 'Roster', 'Annonces'],
                cta: 'Créer la page du club'
              }
            ].map(card => (
              <Link key={card.title} href={card.href} style={{ textDecoration: 'none', display: 'block', borderRadius: 20, overflow: 'hidden', position: 'relative', cursor: 'pointer' }}>
                {/* TOP GRADIENT */}
                <div style={{ background: card.bg, padding: '2.5rem 2rem', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: -20, right: -20, fontSize: '6rem', opacity: .1 }}>{card.icon}</div>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{card.icon}</div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#fff', letterSpacing: 1, marginBottom: '.5rem' }}>{card.title}</div>
                  <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 14, lineHeight: 1.6 }}>{card.desc}</p>
                </div>
                {/* BOTTOM */}
                <div style={{ background: '#f8faff', border: '1px solid var(--border)', borderTop: 'none', padding: '1.5rem 2rem', borderRadius: '0 0 20px 20px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '1.25rem' }}>
                    {card.tags.map(t => (
                      <span key={t} style={{ background: '#fff', border: `1px solid ${card.color}22`, color: card.color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100 }}>{t}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: card.color, fontWeight: 700, fontSize: 14 }}>
                    {card.cta}
                    <span>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          ANNONCES LIVE
      ══════════════════════════════════════ */}
      <section style={{ background: 'var(--gray-bg)', padding: '5rem 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--blue-bright)', marginBottom: '.5rem' }}>En temps réel</div>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: 1 }}>Dernières annonces</h2>
            </div>
            <Link href="/recherche" style={{ color: 'var(--blue-bright)', fontWeight: 700, fontSize: 14, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              Voir toutes les annonces →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {annonces.map(a => (
              <div key={a.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: a.authorType === 'club' ? 'linear-gradient(90deg,#0d7a36,#1db954)' : a.authorType === 'coach' ? 'linear-gradient(90deg,#e02020,#ff8c42)' : 'linear-gradient(90deg,#1a6fd4,#5b9eff)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    {a.authorEmoji}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{a.authorName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.createdAt}</div>
                  </div>
                  <span style={{ marginLeft: 'auto', background: 'var(--green-bg)', color: 'var(--green)', fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 100 }}>🟢 Active</span>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: '1rem', color: 'var(--text-dark)' }}>{a.body}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '1.25rem' }}>
                  <span style={{ background: 'var(--blue-light)', color: 'var(--blue-mid)', fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 100 }}>{a.ligue}</span>
                  {a.position && <span style={{ background: '#fef3e2', color: '#a05a00', fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 100 }}>{a.position}</span>}
                  <span style={{ background: 'var(--green-bg)', color: 'var(--green)', fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 100 }}>📍 {a.zone}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link href="/login" style={{ flex: 1, background: 'var(--blue-bright)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px', fontSize: 13, fontWeight: 700, textAlign: 'center', textDecoration: 'none', display: 'block' }}>
                    Postuler
                  </Link>
                  <Link href="/messages" style={{ background: 'var(--gray-light)', color: 'var(--text-muted)', border: 'none', borderRadius: 8, padding: '9px 14px', fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'block' }}>
                    💬
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════ */}
      <section style={{ background: '#fff', padding: '5rem 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--blue-bright)', marginBottom: '.5rem' }}>Simple et rapide</div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: 1 }}>Comment ça marche ?</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
            {[
              { num: '01', icon: '👤', title: 'Crée ton profil', desc: 'Inscris-toi gratuitement en 2 minutes. Ajoute tes stats, ta position et ta disponibilité.' },
              { num: '02', icon: '🔍', title: 'Explore & cherche', desc: 'Recherche des clubs, joueurs ou coachs avec nos filtres avancés par ligue et zone.' },
              { num: '03', icon: '📋', title: 'Postule ou recrute', desc: 'Envoie ta candidature ou publie une annonce. Gère tout depuis ton dashboard.' },
              { num: '04', icon: '🏆', title: 'Joue !', desc: 'Trouve ton équipe, ton joueur ou ton coach idéal. C\'est parti !' },
            ].map(step => (
              <div key={step.num} style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '4rem', color: 'var(--gray-light)', letterSpacing: 2, lineHeight: 1, marginBottom: '.5rem' }}>{step.num}</div>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem', marginTop: '-1.5rem' }}>{step.icon}</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', letterSpacing: 1, marginBottom: '.5rem' }}>{step.title}</div>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LIGUES — Stade St-Léonard */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '5rem 0' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <img src="/images/stade-st-leonard.jpeg" alt="Stade St-Léonard Fribourg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(10,31,92,.92), rgba(10,31,92,.85))' }} />
        </div>
        <div style={{ position: 'relative', maxWidth: 1100, margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginBottom: '.5rem' }}>Compétitions</div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: 1, color: '#fff' }}>Ligues couvertes</h2>
            <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 14, marginTop: '.5rem' }}>📍 Stade St-Léonard · Fribourg, Suisse</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {ligues.map(g => (
              <div key={g.group} style={{ background: 'rgba(255,255,255,.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 14, padding: '1.25rem' }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', letterSpacing: 1, color: 'var(--blue-bright)', marginBottom: '.75rem', paddingBottom: '.5rem', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                  {g.group}
                </div>
                {g.items.map(item => (
                  <div key={item} style={{ fontSize: 13, color: 'rgba(255,255,255,.65)', padding: '4px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--blue-bright)', flexShrink: 0 }} />
                    {item}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA FINAL
      ══════════════════════════════════════ */}
      <section style={{ position: 'relative', overflow: 'hidden', background: '#e02020', padding: '6rem 0', textAlign: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='40' cy='40' r='30' fill='none' stroke='%23fff' stroke-width='1' stroke-opacity='.05'/%3E%3C/svg%3E")` }} />
        <div style={{ position: 'relative', maxWidth: 700, margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚽</div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2.5rem, 7vw, 5rem)', color: '#fff', letterSpacing: 3, lineHeight: 1, marginBottom: '1rem' }}>
            PRÊT À JOUER ?
          </h2>
          <p style={{ color: 'rgba(255,255,255,.85)', fontSize: 17, marginBottom: '2.5rem', lineHeight: 1.7 }}>
            Inscris-toi gratuitement et rejoins la communauté du football fribourgeois. Ton équipe t'attend.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" style={{
              background: '#fff', color: '#e02020',
              padding: '16px 40px', borderRadius: 10,
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '1.3rem', letterSpacing: 2,
              textDecoration: 'none',
              boxShadow: '0 8px 32px rgba(0,0,0,.2)'
            }}>
              S'inscrire gratuitement
            </Link>
            <Link href="/recherche" style={{
              background: 'transparent', color: '#fff',
              padding: '16px 40px', borderRadius: 10,
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '1.3rem', letterSpacing: 2,
              textDecoration: 'none',
              border: '2px solid rgba(255,255,255,.5)'
            }}>
              Explorer
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
