'use client'

import Link from 'next/link';
import { annonces, ligues } from '../lib/data';
import { useLang } from '../lib/lang-context';
import { t, tagsByRole } from '../lib/translations';

export default function HomePage() {
  const { lang } = useLang()

  const cards = [
    {
      href: '/login', icon: '👤', title: t.types.player_title[lang], color: '#1a6fd4',
      bg: 'linear-gradient(135deg, #0a1f5c, #1a6fd4)',
      desc: t.types.player_desc[lang],
      tags: tagsByRole.player[lang],
      cta: t.types.player_cta[lang],
    },
    {
      href: '/login', icon: '🧑‍🏫', title: t.types.coach_title[lang], color: '#e02020',
      bg: 'linear-gradient(135deg, #6b0000, #e02020)',
      desc: t.types.coach_desc[lang],
      tags: tagsByRole.coach[lang],
      cta: t.types.coach_cta[lang],
    },
    {
      href: '/clubs', icon: '🏟️', title: t.types.club_title[lang], color: '#0d7a36',
      bg: 'linear-gradient(135deg, #063a1a, #0d7a36)',
      desc: t.types.club_desc[lang],
      tags: tagsByRole.club[lang],
      cta: t.types.club_cta[lang],
    },
  ]

  const steps = [
    { num: '01', icon: '👤', title: t.how.step1_title[lang], desc: t.how.step1_desc[lang] },
    { num: '02', icon: '🔍', title: t.how.step2_title[lang], desc: t.how.step2_desc[lang] },
    { num: '03', icon: '📋', title: t.how.step3_title[lang], desc: t.how.step3_desc[lang] },
    { num: '04', icon: '🏆', title: t.how.step4_title[lang], desc: t.how.step4_desc[lang] },
  ]

  const stats = [
    { num: '340+', label: t.home.stats_players[lang], icon: '👤' },
    { num: '52', label: t.home.stats_clubs[lang], icon: '🏟️' },
    { num: '18', label: t.home.stats_coaches[lang], icon: '🧑‍🏫' },
    { num: '100%', label: t.home.stats_free[lang], icon: '🆓' },
  ]

  return (
    <>
      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 650, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        <img
          src="/images/banner.png"
          alt="TeamUpFR hero"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center', zIndex: 0 }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(10,31,92,.92) 0%, rgba(10,31,92,.75) 40%, rgba(10,31,92,.4) 100%)', zIndex: 1 }} />

        <div style={{ position: 'relative', zIndex: 3, maxWidth: 1100, margin: '0 auto', padding: '0 2rem', width: '100%' }}>
          <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', alignItems: 'center', gap: '2rem' }}>
            <div>
              {/* BADGE */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 100, padding: '6px 16px', marginBottom: '1.5rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 8px #00ff88' }} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'rgba(255,255,255,.9)', textTransform: 'uppercase' }}>{t.home.badge[lang]}</span>
              </div>

              {/* TITLE */}
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(4rem, 10vw, 8rem)', color: '#fff', letterSpacing: 3, lineHeight: .95, marginBottom: '1rem' }}>
                {t.home.title1[lang]}<br />
                <span style={{ color: '#ff3333', textShadow: '0 0 40px rgba(255,51,51,.5)' }}>{t.home.title2[lang]}</span>
              </h1>

              {/* LOGO + MOTTO */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
                <img src="/images/logo-official.jpeg" alt="TeamUpFR" style={{ height: 52, width: 52, objectFit: 'cover', borderRadius: 10, border: '2px solid rgba(255,255,255,.25)' }} />
                <div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: '#fff', letterSpacing: 2, lineHeight: 1 }}>TeamUp<span style={{ color: '#ff3333' }}>FR</span></div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', fontStyle: 'italic' }}>{t.home.motto[lang]}</div>
                </div>
              </div>

              <p style={{ fontSize: 'clamp(15px, 2vw, 17px)', color: 'rgba(255,255,255,.75)', lineHeight: 1.7, maxWidth: 500, marginBottom: '2rem' }}>
                {t.home.desc[lang]}
              </p>

              {/* BUTTONS */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link href="/login" style={{ background: '#e02020', color: '#fff', padding: '16px 36px', borderRadius: 10, fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', letterSpacing: 2, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 32px rgba(224,32,32,.4)' }}>
                  ⚽ {t.home.cta_primary[lang]}
                </Link>
                <Link href="/recherche" style={{ background: 'rgba(255,255,255,.12)', color: '#fff', padding: '16px 36px', borderRadius: 10, fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', letterSpacing: 2, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid rgba(255,255,255,.25)', backdropFilter: 'blur(10px)' }}>
                  🔍 {t.home.cta_secondary[lang]}
                </Link>
              </div>
            </div>

            {/* STATS CARD */}
            <div style={{ background: 'rgba(255,255,255,.08)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 20, padding: '1.75rem' }}>
              {stats.map(s => (
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
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', letterSpacing: 2, textTransform: 'uppercase' }}>{t.home.scroll[lang]}</span>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, rgba(255,255,255,.4), transparent)' }} />
        </div>
      </section>

      {/* ══════════════════════════════════════
          BANNER
      ══════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(135deg, #0a1f5c, #1a6fd4)', padding: '5rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 620, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,.45)', marginBottom: '1rem' }}>TeamUpFR</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', color: '#fff', letterSpacing: 2, lineHeight: 1.05, marginBottom: '1rem' }}>
            {t.home.banner_title[lang]}
          </div>
          <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 16, lineHeight: 1.7, marginBottom: '2rem' }}>
            {t.home.banner_desc[lang]}
          </p>
          <Link href="/login" style={{ background: '#e02020', color: '#fff', padding: '13px 32px', borderRadius: 9, fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: 2, textDecoration: 'none', display: 'inline-block', boxShadow: '0 8px 24px rgba(224,32,32,.35)' }}>
            {t.home.banner_join[lang]}
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════
          3 USER TYPES
      ══════════════════════════════════════ */}
      <section style={{ background: '#fff', padding: '5rem 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--blue-bright)', marginBottom: '.5rem' }}>{t.home.section_who[lang]}</div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: 1, marginBottom: '.75rem' }}>{t.home.section_who_title[lang]}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>{t.home.section_who_desc[lang]}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {cards.map(card => (
              <Link key={card.title} href={card.href} style={{ textDecoration: 'none', display: 'block', borderRadius: 20, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div style={{ background: card.bg, padding: '2.5rem 2rem', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: -20, right: -20, fontSize: '6rem', opacity: .1 }}>{card.icon}</div>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{card.icon}</div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#fff', letterSpacing: 1, marginBottom: '.5rem' }}>{card.title}</div>
                  <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 14, lineHeight: 1.6 }}>{card.desc}</p>
                </div>
                <div style={{ background: '#f8faff', padding: '1.5rem 2rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '1.25rem' }}>
                    {card.tags.map(tag => (
                      <span key={tag} style={{ background: '#fff', border: `1px solid ${card.color}22`, color: card.color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100 }}>{tag}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: card.color, fontWeight: 700, fontSize: 14 }}>
                    {card.cta} <span>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          ANNONCES
      ══════════════════════════════════════ */}
      <section style={{ background: 'var(--gray-bg)', padding: '5rem 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--blue-bright)', marginBottom: '.5rem' }}>{t.home.annonces_badge[lang]}</div>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: 1 }}>{t.home.annonces_title[lang]}</h2>
            </div>
            <Link href="/recherche" style={{ color: 'var(--blue-bright)', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              {t.home.annonces_link[lang]}
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
                  <span style={{ marginLeft: 'auto', background: 'var(--green-bg)', color: 'var(--green)', fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 100 }}>{t.home.annonce_active[lang]}</span>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: '1rem', color: 'var(--text-dark)' }}>{a.body}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '1.25rem' }}>
                  <span style={{ background: 'var(--blue-light)', color: 'var(--blue-mid)', fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 100 }}>{a.ligue}</span>
                  {a.position && <span style={{ background: '#fef3e2', color: '#a05a00', fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 100 }}>{a.position}</span>}
                  <span style={{ background: 'var(--green-bg)', color: 'var(--green)', fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 100 }}>{a.zone}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link href="/login" style={{ flex: 1, background: 'var(--blue-bright)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px', fontSize: 13, fontWeight: 700, textAlign: 'center', textDecoration: 'none', display: 'block' }}>
                    {t.home.postuler[lang]}
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
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--blue-bright)', marginBottom: '.5rem' }}>{t.home.how_badge[lang]}</div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: 1 }}>{t.home.how_title[lang]}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
            {steps.map(step => (
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

      {/* ══════════════════════════════════════
          LIGUES
      ══════════════════════════════════════ */}
      <section style={{ background: 'var(--blue-dark)', padding: '5rem 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,.5)', marginBottom: '.5rem' }}>{t.home.ligues_badge[lang]}</div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: 1, color: '#fff' }}>{t.home.ligues_title[lang]}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {ligues.map(g => (
              <div key={g.group} style={{ background: 'rgba(255,255,255,.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 14, padding: '1.25rem' }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', letterSpacing: 1, color: '#7eb8ff', marginBottom: '.75rem', paddingBottom: '.5rem', borderBottom: '1px solid rgba(255,255,255,.1)' }}>
                  {g.group}
                </div>
                {g.items.map(item => (
                  <div key={item} style={{ fontSize: 13, color: 'rgba(255,255,255,.75)', padding: '4px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#7eb8ff', flexShrink: 0 }} />
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
            {t.home.cta_final[lang]}
          </h2>
          <p style={{ color: 'rgba(255,255,255,.85)', fontSize: 17, marginBottom: '2.5rem', lineHeight: 1.7 }}>
            {t.home.cta_final_desc[lang]}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" style={{ background: '#fff', color: '#e02020', padding: '16px 40px', borderRadius: 10, fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', letterSpacing: 2, textDecoration: 'none', boxShadow: '0 8px 32px rgba(0,0,0,.2)' }}>
              {t.home.signup[lang]}
            </Link>
            <Link href="/recherche" style={{ background: 'transparent', color: '#fff', padding: '16px 40px', borderRadius: 10, fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', letterSpacing: 2, textDecoration: 'none', border: '2px solid rgba(255,255,255,.5)' }}>
              {t.home.explore[lang]}
            </Link>
          </div>
        </div>
      </section>
      <style>{`
        @media (max-width: 640px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-grid > div:last-child { display: none; }
        }
      `}</style>
    </>
  );
}
