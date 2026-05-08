'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import HeroMap from '../components/HeroMap'
import { liguesHomme, liguesFemme } from '../lib/data'
import { supabase } from '../lib/supabase'
import { useLang } from '../lib/lang-context'
import { t, tagsByRole } from '../lib/translations'

function useCounters() {
  const [counts, setCounts] = useState({ players: 0, clubs: 0, coaches: 0 })
  const real = useRef({ players: 0, clubs: 0, coaches: 0 })
  const displayed = useRef({ players: 0, clubs: 0, coaches: 0 })
  const ref = useRef<HTMLDivElement>(null)
  const visible = useRef(false)

  // Load real counts from DB and subscribe to changes
  useEffect(() => {
    async function loadCounts() {
      const [rp, rc, rco] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'player'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'club'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'coach'),
      ])
      real.current = {
        players: rp.count ?? 0,
        clubs: rc.count ?? 0,
        coaches: rco.count ?? 0,
      }
      if (visible.current) animateToReal()
    }

    function animateToReal() {
      const from = { ...displayed.current }
      const to = { ...real.current }
      const start = performance.now()
      const dur = 1500
      function frame(now: number) {
        const progress = Math.min((now - start) / dur, 1)
        const ease = 1 - Math.pow(1 - progress, 3)
        const next = {
          players: Math.round(from.players + (to.players - from.players) * ease),
          clubs: Math.round(from.clubs + (to.clubs - from.clubs) * ease),
          coaches: Math.round(from.coaches + (to.coaches - from.coaches) * ease),
        }
        displayed.current = next
        setCounts({ ...next })
        if (progress < 1) requestAnimationFrame(frame)
      }
      requestAnimationFrame(frame)
    }

    loadCounts()

    // Realtime: re-fetch counts on any profile insert/delete
    const channel = supabase
      .channel('hp-stats')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, loadCounts)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'profiles' }, loadCounts)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  // Trigger animation when section enters viewport
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || visible.current) return
      visible.current = true
      observer.disconnect()
      // animate from 0 to whatever real.current is
      const to = { ...real.current }
      const start = performance.now()
      const dur = 1500
      function frame(now: number) {
        const progress = Math.min((now - start) / dur, 1)
        const ease = 1 - Math.pow(1 - progress, 3)
        const next = {
          players: Math.round(to.players * ease),
          clubs: Math.round(to.clubs * ease),
          coaches: Math.round(to.coaches * ease),
        }
        displayed.current = next
        setCounts({ ...next })
        if (progress < 1) requestAnimationFrame(frame)
      }
      requestAnimationFrame(frame)
    }, { threshold: 0.2 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return [counts, ref] as const
}


type LigueTab = 'all' | 'homme' | 'femme'

const allLigueItems = [
  ...liguesHomme.flatMap(g => g.items.map(item => ({ item, cat: 'homme' as LigueTab, group: g.group }))),
  ...liguesFemme.flatMap(g => g.items.map(item => ({ item, cat: 'femme' as LigueTab, group: g.group }))),
]


export default function HomePage() {
  const { lang } = useLang()
  const [activeTab, setActiveTab] = useState<LigueTab>('all')
  const [counts, statsRef] = useCounters()

  const filteredLigues = activeTab === 'all'
    ? allLigueItems
    : allLigueItems.filter(l => l.cat === activeTab)

  const profileCards = [
    {
      href: '/login',
      title: t.types.player_title[lang],
      desc: t.types.player_desc[lang],
      tags: tagsByRole.player[lang],
      cta: t.types.player_cta[lang],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} width={32} height={32}>
          <path d="M12 12c2.5 0 4.5-2 4.5-4.5S14.5 3 12 3 7.5 5 7.5 7.5 9.5 12 12 12z"/>
          <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>
        </svg>
      ),
    },
    {
      href: '/login',
      title: t.types.coach_title[lang],
      desc: t.types.coach_desc[lang],
      tags: tagsByRole.coach[lang],
      cta: t.types.coach_cta[lang],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} width={32} height={32}>
          <path d="M3 8l9-5 9 5-9 5-9-5z"/>
          <path d="M3 8v6l9 5 9-5V8"/>
        </svg>
      ),
    },
    {
      href: '/clubs',
      title: t.types.club_title[lang],
      desc: t.types.club_desc[lang],
      tags: tagsByRole.club[lang],
      cta: t.types.club_cta[lang],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} width={32} height={32}>
          <path d="M3 21h18M5 21V8l7-5 7 5v13M9 9h6M9 13h6M9 17h6"/>
        </svg>
      ),
    },
  ]

  const steps = [
    { num: '01', title: t.how.step1_title[lang], desc: t.how.step1_desc[lang] },
    { num: '02', title: t.how.step2_title[lang], desc: t.how.step2_desc[lang] },
    { num: '03', title: t.how.step3_title[lang], desc: t.how.step3_desc[lang] },
    { num: '04', title: t.how.step4_title[lang], desc: t.how.step4_desc[lang] },
  ]

  const ligueTabs: { key: LigueTab; label: string }[] = [
    { key: 'all',   label: t.home.ligues_all[lang] },
    { key: 'homme', label: t.home.ligues_homme[lang] },
    { key: 'femme', label: t.home.ligues_femme[lang] },
  ]

  return (
    <>
      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section style={{ position: 'relative', minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', overflow: 'hidden', padding: '60px 0 80px' }}>
        {/* Background */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 20% 30%, rgba(230,57,70,0.22), transparent 50%), radial-gradient(circle at 80% 70%, rgba(10,31,92,0.55), transparent 50%), linear-gradient(180deg, #030a24 0%, #061540 100%)' }} />
        {/* Grid overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '60px 60px', maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)' }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 1280, margin: '0 auto', padding: '0 24px', width: '100%' }}>
          <div className="hp-hero-grid">
            {/* ── Left ── */}
            <div>
              {/* Badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', padding: '8px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: 28 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#e63946', flexShrink: 0, animation: 'hp-pulse 2s infinite' }} />
                {t.home.badge[lang]}
              </div>

              {/* Title */}
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(56px, 8.5vw, 124px)', lineHeight: 0.92, marginBottom: 24, letterSpacing: '0.01em', color: '#fff' }}>
                IT&apos;S TIME<br />TO <span style={{ color: '#e63946' }}>{t.home.title2[lang]}</span>
              </h1>

              {/* Description */}
              <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.75)', maxWidth: 520, marginBottom: 36, lineHeight: 1.6 }}>
                {t.home.desc[lang]}
              </p>

              {/* CTAs */}
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 52 }}>
                <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none', background: '#e63946', color: '#fff', boxShadow: '0 8px 24px rgba(230,57,70,0.4)' }}>
                  ⚽ {t.home.cta_primary[lang]}
                </Link>
                <Link href="/recherche" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none', background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}>
                  🔍 {t.home.cta_secondary[lang]}
                </Link>
              </div>

              {/* Stat counters */}
              <div ref={statsRef} className="hp-stats-grid">
                {[
                  { value: String(counts.players), label: t.home.stats_players[lang] },
                  { value: String(counts.clubs),   label: t.home.stats_clubs[lang] },
                  { value: String(counts.coaches), label: t.home.stats_coaches[lang] },
                  { value: '100%',                 label: t.home.stats_free[lang] },
                ].map((s, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '18px 14px', textAlign: 'center', transition: 'all 0.3s' }}>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: '#fff', lineHeight: 1, marginBottom: 6 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right — Hero Map ── */}
            <div className="hp-hero-card-wrap">
              <HeroMap />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.5)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 2 }}>
          {t.home.scroll[lang]}
          <div style={{ width: 1, height: 28, background: 'linear-gradient(180deg, rgba(255,255,255,0.5), transparent)', animation: 'hp-scrolldown 2s infinite' }} />
        </div>
      </section>

      {/* ═══════════════════════ PROFILES ═══════════════════════ */}
      <section style={{ background: 'linear-gradient(180deg, #061540 0%, #030a24 100%)', padding: '100px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <span className="hp-section-label">{t.home.section_who[lang]}</span>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 1, marginBottom: 20, color: '#fff' }}>
            {t.home.section_who_title[lang]}
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.65)', maxWidth: 600, marginBottom: 60 }}>
            {t.home.section_who_desc[lang]}
          </p>

          <div className="hp-3col-grid">
            {profileCards.map(card => (
              <Link key={card.title} href={card.href} className="hp-profile-card">
                <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #e63946, #0a1f5c)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, boxShadow: '0 12px 32px rgba(230,57,70,0.3)' }}>
                  {card.icon}
                </div>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, marginBottom: 12, color: '#fff' }}>{card.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: 24, fontSize: 15, lineHeight: 1.6 }}>{card.desc}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
                  {card.tags.map(tag => (
                    <span key={tag} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{tag}</span>
                  ))}
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#e63946', fontWeight: 700, fontSize: 14 }}>
                  {card.cta} →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ HOW IT WORKS ═══════════════════════ */}
      <section style={{ background: 'linear-gradient(180deg, #030a24 0%, #061540 100%)', padding: '100px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <span className="hp-section-label">{t.home.how_badge[lang]}</span>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 1, marginBottom: 20, color: '#fff' }}>
            {t.home.how_title[lang]}
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.65)', maxWidth: 600, marginBottom: 60 }}>
            {t.home.how_subtitle[lang]}
          </p>

          <div className="hp-timeline">
            <div className="hp-timeline-line" />
            {steps.map(step => (
              <div key={step.num} className="hp-step">
                <div className="hp-step-circle">{step.num}</div>
                <h4 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, marginBottom: 10, color: '#fff' }}>{step.title}</h4>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.55 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ LIGUES ═══════════════════════ */}
      <section style={{ background: '#030a24', padding: '100px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <span className="hp-section-label">{t.home.ligues_badge[lang]}</span>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 1, marginBottom: 20, color: '#fff' }}>
            {t.home.ligues_title[lang]}
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.65)', maxWidth: 600, marginBottom: 40 }}>
            {t.home.ligues_subtitle[lang]}
          </p>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
            {ligueTabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{ padding: '10px 20px', background: activeTab === key ? '#e63946' : 'rgba(255,255,255,0.04)', border: activeTab === key ? '1px solid #e63946' : '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: activeTab === key ? '#fff' : 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}
              >
                {label}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {filteredLigues.map(l => (
              <div key={l.item} className="hp-ligue-item">
                <div style={{ width: 8, height: 8, background: l.cat === 'femme' ? '#e63946' : '#4ade80', borderRadius: '50%', flexShrink: 0 }} />
                <span style={{ fontWeight: 600, fontSize: 14, color: 'rgba(255,255,255,0.85)' }}>{l.item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ CTA FINAL ═══════════════════════ */}
      <section style={{ background: 'linear-gradient(135deg, #0a1f5c 0%, #061540 100%)', textAlign: 'center', padding: '120px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 30%, rgba(230,57,70,0.22), transparent 50%), radial-gradient(circle at 70% 70%, rgba(230,57,70,0.14), transparent 50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(48px, 8vw, 110px)', lineHeight: 0.95, marginBottom: 24, color: '#fff' }}>
            PRÊT À<br /><span style={{ color: '#e63946' }}>JOUER ?</span>
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.75)', maxWidth: 580, margin: '0 auto 40px' }}>
            {t.home.cta_final_desc[lang]}
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 30px', borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none', background: '#e63946', color: '#fff', boxShadow: '0 8px 24px rgba(230,57,70,0.4)' }}>
              ⚽ {t.home.signup[lang]}
            </Link>
            <Link href="/recherche" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 30px', borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none', background: '#fff', color: '#0a1f5c' }}>
              {t.home.explore[lang]}
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .hp-hero-grid {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 60px;
          align-items: center;
        }
        .hp-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          max-width: 600px;
        }
        .hp-3col-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .hp-timeline {
          position: relative;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        .hp-timeline-line {
          position: absolute;
          top: 32px;
          left: 8%;
          right: 8%;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(230,57,70,0.5), rgba(230,57,70,0.5), transparent);
          z-index: 0;
        }
        .hp-annonces-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 960px) {
          .hp-hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .hp-3col-grid { grid-template-columns: 1fr !important; }
          .hp-annonces-grid { grid-template-columns: 1fr !important; }
          .hp-timeline { grid-template-columns: repeat(2, 1fr) !important; }
          .hp-timeline-line { display: none !important; }
          .hp-stats-grid { grid-template-columns: repeat(2, 1fr) !important; max-width: 100% !important; }
        }
        @media (max-width: 900px) {
          .hero-map { max-width: 360px; margin: 0 auto; }
        }

        /* ── Hero map ── */
        .hero-map {
          position: relative;
          aspect-ratio: 4/5;
          border-radius: 24px;
          overflow: hidden;
          background: linear-gradient(135deg, #0a1f5c 0%, #061540 100%);
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 30px 80px rgba(0,0,0,0.5);
        }
        .hero-map-svg { width: 100%; height: 100%; display: block; }
        .hero-map-glow {
          position: absolute;
          top: -20%; right: -20%;
          width: 60%; height: 60%;
          background: radial-gradient(circle, rgba(230,57,70,0.28), transparent 70%);
          pointer-events: none;
          z-index: 0;
        }
        .map-dot {
          filter: drop-shadow(0 0 5px rgba(230,57,70,0.85));
          animation: mapPulseDot 3s ease-in-out infinite;
        }
        .map-dot.major { filter: drop-shadow(0 0 9px rgba(230,57,70,1)); }
        .map-pulse-ring {
          animation: mapPulseRing 2.8s ease-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        .map-label {
          fill: rgba(255,255,255,0.92);
          font-family: 'Bebas Neue', sans-serif;
          font-size: 10px;
          letter-spacing: 0.06em;
          pointer-events: none;
        }
        .map-connection {
          stroke-dasharray: 5 5;
          animation: mapDash 10s linear infinite;
          opacity: 0.45;
        }
        @keyframes mapPulseDot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }
        @keyframes mapPulseRing {
          0%   { transform: scale(1); opacity: 0.65; }
          100% { transform: scale(2.8); opacity: 0; }
        }
        @keyframes mapDash { to { stroke-dashoffset: -120; } }

        .floating-badge {
          position: absolute;
          z-index: 2;
          background: rgba(3,10,36,0.85);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.15);
          padding: 10px 16px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          animation: floatBadge 4s ease-in-out infinite;
        }
        .badge-top { top: 24px; left: 24px; }
        .badge-bottom { bottom: 24px; right: 24px; animation-delay: 2s; }
        .badge-dot {
          width: 8px; height: 8px;
          background: #4ade80;
          border-radius: 50%;
          flex-shrink: 0;
          animation: pulse-green 2s infinite;
        }
        @keyframes floatBadge {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulse-green {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </>
  )
}
