'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { liguesHomme, liguesFemme } from '../lib/data'
import { supabase } from '../lib/supabase'
import { useLang } from '../lib/lang-context'
import { t, tagsByRole, Lang } from '../lib/translations'

const VIDEO_URL = 'https://videos.pexels.com/video-files/28870860/12500591_2560_1440_30fps.mp4'

// ── useCounters (unchanged logic) ────────────────────────────────────────────
function useCounters() {
  const [counts, setCounts] = useState({ players: 0, clubs: 0, coaches: 0 })
  const real = useRef({ players: 0, clubs: 0, coaches: 0 })
  const displayed = useRef({ players: 0, clubs: 0, coaches: 0 })
  const ref = useRef<HTMLDivElement>(null)
  const visible = useRef(false)

  useEffect(() => {
    async function loadCounts() {
      const [rp, rc] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'player').eq('hidden', false),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'club').eq('club_verification_status', 'approved'),
      ])
      real.current = { players: rp.count ?? 0, clubs: rc.count ?? 0, coaches: 0 }
      if (visible.current) animateToReal()
    }

    function animateToReal() {
      const from = { ...displayed.current }
      const to = { ...real.current }
      const start = performance.now()
      function frame(now: number) {
        const p = Math.min((now - start) / 1500, 1)
        const e = 1 - Math.pow(1 - p, 3)
        const next = {
          players: Math.round(from.players + (to.players - from.players) * e),
          clubs: Math.round(from.clubs + (to.clubs - from.clubs) * e),
          coaches: Math.round(from.coaches + (to.coaches - from.coaches) * e),
        }
        displayed.current = next
        setCounts({ ...next })
        if (p < 1) requestAnimationFrame(frame)
      }
      requestAnimationFrame(frame)
    }

    loadCounts()

    const channel = supabase
      .channel('hp-stats')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, loadCounts)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'profiles' }, loadCounts)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || visible.current) return
      visible.current = true
      observer.disconnect()
      const to = { ...real.current }
      const start = performance.now()
      function frame(now: number) {
        const p = Math.min((now - start) / 1500, 1)
        const e = 1 - Math.pow(1 - p, 3)
        const next = {
          players: Math.round(to.players * e),
          clubs: Math.round(to.clubs * e),
          coaches: Math.round(to.coaches * e),
        }
        displayed.current = next
        setCounts({ ...next })
        if (p < 1) requestAnimationFrame(frame)
      }
      requestAnimationFrame(frame)
    }, { threshold: 0.2 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return [counts, ref] as const
}

// ── Ligues data (unchanged) ───────────────────────────────────────────────────
type LigueTab = 'all' | 'actifs_h' | 'juniors_g' | 'actives_f' | 'juniores_f'

const allLigueItems = [
  ...liguesHomme[0].items.map(item => ({ item, cat: 'actifs_h'  as LigueTab })),
  ...liguesHomme[1].items.map(item => ({ item, cat: 'juniors_g' as LigueTab })),
  ...liguesFemme[0].items.map(item => ({ item, cat: 'actives_f' as LigueTab })),
  ...liguesFemme[1].items.map(item => ({ item, cat: 'juniores_f' as LigueTab })),
]

// ── Story section ─────────────────────────────────────────────────────────────
function StorySection({ lang }: { lang: Lang }) {
  return (
    <section className="hp-story-banner">
      <Image
        src="/images/home/story-bg.jpg"
        alt=""
        fill
        sizes="100vw"
        style={{ objectFit: 'cover', objectPosition: 'center', opacity: 0.38 }}
      />
      <div className="hp-story-vignette" />
      <div className="hp-story-content">
        <h2 className="hp-story-title">
          {lang === 'fr'
            ? <>Le football fribourgeois,<br /><span style={{ color: '#FF3A3A' }}>en un clic.</span></>
            : <>Freiburger Fussball,<br /><span style={{ color: '#FF3A3A' }}>mit einem Klick.</span></>}
        </h2>
        <p className="hp-story-desc">
          {lang === 'fr'
            ? 'Joueurs, coachs et clubs — tous connectés sur une seule plateforme pour le football amateur fribourgeois.'
            : 'Spieler, Trainer und Vereine — alle auf einer Plattform für den Freiburger Amateurfussball vernetzt.'}
        </p>
      </div>
    </section>
  )
}

// ── How it works ──────────────────────────────────────────────────────────────
function HowSection({ lang }: { lang: Lang }) {
  const [activeStep, setActiveStep] = useState(0)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])

  const steps = [
    { num: '01', title: t.how.step1_title[lang], desc: t.how.step1_desc[lang] },
    { num: '02', title: t.how.step2_title[lang], desc: t.how.step2_desc[lang] },
    { num: '03', title: t.how.step3_title[lang], desc: t.how.step3_desc[lang] },
    { num: '04', title: t.how.step4_title[lang], desc: t.how.step4_desc[lang] },
  ]

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    stepRefs.current.forEach((el, i) => {
      if (!el) return
      const obs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) setActiveStep(i)
      }, { threshold: 0.5 })
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [])

  return (
    <section id="how-it-works" className="hp-how-section">
      <div className="hp-how-inner">
        <div className="hp-how-left">
          <span className="hp-badge">{t.home.how_badge[lang]}</span>
          <h2 className="hp-section-title">{t.home.how_title[lang]}</h2>
          <p className="hp-section-sub">{t.home.how_subtitle[lang]}</p>
        </div>
        <div className="hp-how-right">
          {steps.map((step, i) => (
            <div
              key={step.num}
              ref={el => { stepRefs.current[i] = el }}
              className={`hp-step-card${activeStep === i ? ' active' : ''}`}
            >
              <div className="hp-step-num">{step.num}</div>
              <h4 className="hp-step-title">{step.title}</h4>
              <p className="hp-step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { lang } = useLang()
  const [activeTab, setActiveTab] = useState<LigueTab>('all')
  const [counts, statsRef] = useCounters()

  const filteredLigues = activeTab === 'all'
    ? allLigueItems
    : allLigueItems.filter(l => l.cat === activeTab)

  const ligueTabs: { key: LigueTab; label: string }[] = [
    { key: 'all',        label: t.home.ligues_all[lang] },
    { key: 'actifs_h',   label: t.home.ligues_actifs_h[lang] },
    { key: 'juniors_g',  label: t.home.ligues_juniors_g[lang] },
    { key: 'actives_f',  label: t.home.ligues_actives_f[lang] },
    { key: 'juniores_f', label: t.home.ligues_juniores_f[lang] },
  ]

  const profileCards = [
    {
      href: '/login',
      img: '/images/home/card-joueur.jpg',
      title: t.types.player_title[lang],
      desc: t.types.player_desc[lang],
      tags: tagsByRole.player[lang],
      cta: t.types.player_cta[lang],
      priority: true,
    },
    {
      href: '/login',
      img: '/images/home/card-coach.jpg',
      title: t.types.coach_title[lang],
      desc: t.types.coach_desc[lang],
      tags: tagsByRole.coach[lang],
      cta: t.types.coach_cta[lang],
      priority: false,
    },
    {
      href: '/clubs',
      img: '/images/home/card-club.jpg',
      title: t.types.club_title[lang],
      desc: t.types.club_desc[lang],
      tags: tagsByRole.club[lang],
      cta: t.types.club_cta[lang],
      priority: false,
    },
  ]

  const statItems = [
    { value: '24',                   label: lang === 'fr' ? 'Ligues' : 'Ligen' },
    { value: String(counts.clubs),   label: lang === 'fr' ? 'Clubs inscrits' : 'Eingetragene Vereine' },
    { value: String(counts.players), label: lang === 'fr' ? 'Joueurs visibles' : 'Sichtbare Spieler' },
    { value: '2',                    label: lang === 'fr' ? 'Langues' : 'Sprachen' },
  ]

  const statMotivation = lang === 'fr'
    ? 'Sois parmi les premiers à rejoindre la communauté du football fribourgeois.'
    : 'Sei einer der Ersten, der der Fribourg-Fußball-Community beitritt.'

  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="hp-hero">
        <video
          className="hp-hero-video"
          src={VIDEO_URL}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/home/fribourg-aerial.jpg"
        />
        <div className="hp-hero-veil" />
        <div className="hp-hero-content">
          <div className="hp-badge-pill">
            <span className="hp-badge-dot" />
            {t.home.badge[lang]}
          </div>
          <h1 className="hp-hero-h1">
            IT&apos;S TIME<br />TO{' '}
            <span style={{ color: '#FF3A3A' }}>{t.home.title2[lang]}</span>
          </h1>
          <p className="hp-hero-desc">{t.home.desc[lang]}</p>
          <div className="hp-hero-ctas">
            <Link href="/login" className="hp-btn-primary">{t.home.cta_primary[lang]}</Link>
            <Link href="#how-it-works" className="hp-btn-ghost">{t.home.cta_secondary[lang]}</Link>
          </div>
        </div>
        <div className="hp-scroll-hint">
          {t.home.scroll[lang]}
          <div className="hp-scroll-line" />
        </div>
      </section>

      {/* ── Story ───────────────────────────────────────────────────────── */}
      <StorySection lang={lang} />

      {/* ── Profile cards ───────────────────────────────────────────────── */}
      <section className="hp-cards-section">
        <div className="hp-section-header">
          <span className="hp-badge">{t.home.section_who[lang]}</span>
          <h2 className="hp-section-title">{t.home.section_who_title[lang]}</h2>
          <p className="hp-section-sub">{t.home.section_who_desc[lang]}</p>
        </div>
        <div className="hp-cards-grid">
          {profileCards.map(card => (
            <Link key={card.title} href={card.href} className="hp-card">
              <Image
                src={card.img}
                alt={card.title}
                fill
                sizes="(max-width: 900px) 100vw, 33vw"
                style={{ objectFit: 'cover' }}
                priority={card.priority}
              />
              <div className="hp-card-overlay" />
              <div className="hp-card-body">
                <h3 className="hp-card-title">{card.title}</h3>
                <div className="hp-card-tags">
                  {card.tags.map(tag => (
                    <span key={tag} className="hp-card-tag">{tag}</span>
                  ))}
                </div>
                <div className="hp-card-cta">{card.cta} &rarr;</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <HowSection lang={lang} />

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      <div ref={statsRef} className="hp-stats-section">
        <div className="hp-stats-inner">
          {statItems.map((s, i) => (
            <div key={i} className="hp-stat-item">
              <div className="hp-stat-value">{s.value}</div>
              <div className="hp-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
        <p className="hp-stats-motivation">{statMotivation}</p>
      </div>

      {/* ── Leagues ─────────────────────────────────────────────────────── */}
      <section className="hp-ligues-section">
        <div className="hp-section-header">
          <span className="hp-badge">{t.home.ligues_badge[lang]}</span>
          <h2 className="hp-section-title">{t.home.ligues_title[lang]}</h2>
          <p className="hp-section-sub">{t.home.ligues_subtitle[lang]}</p>
          <Link href="/recherche" className="hp-marquee-link">
            {lang === 'fr' ? 'Explorer la recherche' : 'Suche erkunden'} &rarr;
          </Link>
        </div>

        <div className="hp-marquee-wrap">
          <div className="hp-marquee-track">
            {[...allLigueItems, ...allLigueItems].map((l, i) => (
              <span key={i} className="hp-marquee-item">{l.item}</span>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div className="hp-ligue-tabs">
            {ligueTabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`hp-ligue-tab${activeTab === key ? ' active' : ''}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="hp-ligue-grid">
            {filteredLigues.map(l => (
              <div key={l.item} className="hp-ligue-item">
                <div className={`hp-ligue-dot${l.cat === 'actives_f' || l.cat === 'juniores_f' ? ' female' : ' male'}`} />
                <span>{l.item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ───────────────────────────────────────────────────── */}
      <section className="hp-cta-section">
        <div className="hp-cta-glow" />
        <div className="hp-cta-inner">
          <h2 className="hp-cta-title">
            {lang === 'fr'
              ? <><span>PRÊT À</span><br /><span style={{ color: '#FF3A3A' }}>JOUER ?</span></>
              : <><span>BEREIT ZU</span><br /><span style={{ color: '#FF3A3A' }}>SPIELEN?</span></>}
          </h2>
          <p className="hp-cta-desc">{t.home.cta_final_desc[lang]}</p>
          <div className="hp-cta-btns">
            <Link href="/login" className="hp-btn-primary">{t.home.signup[lang]}</Link>
            <Link href="/a-propos" className="hp-btn-white">{t.home.explore[lang]}</Link>
          </div>
        </div>
      </section>

      <style>{CSS}</style>
    </>
  )
}

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
  @keyframes hp-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
  @keyframes hp-scrolldown { 0%,100%{opacity:0.5} 50%{opacity:1;transform:scaleY(1.3)} }
  @keyframes hp-marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes hp-fade-up { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }

  /* ── Hero ── */
  .hp-hero {
    position: relative;
    height: 100vh;
    min-height: 600px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .hp-hero-video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .hp-hero-veil {
    position: absolute;
    inset: 0;
    background: linear-gradient(160deg, rgba(13,31,74,0.88) 0%, rgba(13,31,74,0.65) 50%, rgba(0,0,0,0.78) 100%);
  }
  .hp-hero-content {
    position: relative;
    z-index: 2;
    text-align: center;
    padding: 0 24px;
    max-width: 820px;
    animation: hp-fade-up 0.9s ease both;
  }
  .hp-badge-pill {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.15);
    padding: 8px 20px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
    color: rgba(255,255,255,0.85);
    margin-bottom: 28px;
  }
  .hp-badge-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #2ED27F;
    flex-shrink: 0;
    animation: hp-pulse 2s infinite;
  }
  .hp-hero-h1 {
    font-family: 'Russo One', sans-serif;
    font-size: clamp(52px, 9vw, 120px);
    line-height: 0.95;
    color: #fff;
    margin-bottom: 24px;
    letter-spacing: 0.01em;
  }
  .hp-hero-desc {
    font-size: 18px;
    color: rgba(255,255,255,0.75);
    max-width: 520px;
    margin: 0 auto 36px;
    line-height: 1.6;
  }
  .hp-hero-ctas {
    display: flex;
    gap: 14px;
    justify-content: center;
    flex-wrap: wrap;
  }
  .hp-scroll-hint {
    position: absolute;
    bottom: 28px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.45);
  }
  .hp-scroll-line {
    width: 1px;
    height: 28px;
    background: linear-gradient(180deg, rgba(255,255,255,0.5), transparent);
    animation: hp-scrolldown 2s infinite;
  }

  /* ── Buttons ── */
  .hp-btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 14px 28px;
    border-radius: 999px;
    font-weight: 700;
    font-size: 15px;
    text-decoration: none;
    background: #FF3A3A;
    color: #fff;
    box-shadow: 0 8px 24px rgba(255,58,58,0.4);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .hp-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(255,58,58,0.5); }
  .hp-btn-ghost {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 14px 28px;
    border-radius: 999px;
    font-weight: 700;
    font-size: 15px;
    text-decoration: none;
    background: rgba(255,255,255,0.08);
    color: #fff;
    border: 1px solid rgba(255,255,255,0.2);
    transition: background 0.2s;
  }
  .hp-btn-ghost:hover { background: rgba(255,255,255,0.14); }
  .hp-btn-white {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 14px 28px;
    border-radius: 999px;
    font-weight: 700;
    font-size: 15px;
    text-decoration: none;
    background: #fff;
    color: #0D1F4A;
    transition: opacity 0.2s;
  }
  .hp-btn-white:hover { opacity: 0.9; }

  /* ── Story banner ── */
  .hp-story-banner {
    position: relative;
    height: 70vh;
    min-height: 420px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: #030c20;
  }
  .hp-story-vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at center, transparent 25%, rgba(3,12,32,0.72) 75%),
                linear-gradient(180deg, rgba(13,31,74,0.72) 0%, rgba(0,0,0,0.65) 100%);
    z-index: 1;
  }
  .hp-story-content {
    position: relative;
    z-index: 2;
    text-align: center;
    padding: 0 24px;
    max-width: 700px;
  }
  .hp-story-title {
    font-family: 'Russo One', sans-serif;
    font-size: clamp(36px, 6vw, 72px);
    color: #fff;
    margin-bottom: 20px;
    line-height: 1.05;
  }
  .hp-story-desc {
    font-size: 18px;
    color: rgba(255,255,255,0.72);
    line-height: 1.65;
    max-width: 560px;
    margin: 0 auto;
  }
  /* ── Profile cards ── */
  .hp-cards-section {
    background: #0D1F4A;
    padding: 100px 0;
  }
  .hp-section-header {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 24px;
    margin-bottom: 48px;
  }
  .hp-badge {
    display: inline-block;
    background: rgba(255,58,58,0.1);
    border: 1px solid rgba(255,58,58,0.28);
    color: #FF3A3A;
    padding: 6px 16px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 16px;
  }
  .hp-section-title {
    font-family: 'Russo One', sans-serif;
    font-size: clamp(30px, 5vw, 60px);
    color: #fff;
    line-height: 1.05;
    margin-bottom: 16px;
  }
  .hp-section-sub {
    font-size: 17px;
    color: rgba(255,255,255,0.62);
    max-width: 560px;
    line-height: 1.65;
    margin: 0;
  }
  .hp-cards-grid {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 24px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  .hp-card {
    position: relative;
    height: 560px;
    border-radius: 20px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    text-decoration: none;
    transition: transform 0.3s ease;
  }
  .hp-card:hover { transform: translateY(-6px); }
  .hp-card-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 25%, rgba(13,31,74,0.45) 55%, rgba(13,31,74,0.96) 100%);
  }
  .hp-card-body {
    position: relative;
    z-index: 2;
    padding: 28px;
  }
  .hp-card-title {
    font-family: 'Russo One', sans-serif;
    font-size: 34px;
    color: #fff;
    margin-bottom: 12px;
    line-height: 1;
  }
  .hp-card-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 20px;
  }
  .hp-card-tag {
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.15);
    padding: 5px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    color: rgba(255,255,255,0.9);
  }
  .hp-card-cta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #FF3A3A;
    font-weight: 700;
    font-size: 14px;
  }

  /* ── Stats ── */
  .hp-stats-section {
    background: linear-gradient(135deg, #061333 0%, #0D1F4A 100%);
    padding: 80px 0;
    border-top: 1px solid rgba(255,255,255,0.05);
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .hp-stats-inner {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 24px;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
    text-align: center;
  }
  .hp-stat-value {
    font-family: 'Russo One', sans-serif;
    font-size: clamp(40px, 5vw, 72px);
    color: #fff;
    line-height: 1;
    margin-bottom: 10px;
  }
  .hp-stat-label {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255,255,255,0.5);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  .hp-stats-motivation {
    font-size: 14px;
    font-weight: 400;
    color: rgba(255,255,255,0.45);
    text-align: center;
    max-width: 600px;
    margin: 24px auto 0;
    line-height: 1.6;
    padding: 0 24px;
  }

  /* ── How it works ── */
  .hp-how-section {
    background: linear-gradient(180deg, #0D1F4A 0%, #061333 100%);
    padding: 100px 0;
  }
  .hp-how-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 24px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: start;
  }
  .hp-how-left {
    position: sticky;
    top: 100px;
  }
  .hp-how-right {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .hp-step-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 28px;
    transition: background 0.3s, border-color 0.3s;
  }
  .hp-step-card.active {
    background: rgba(255,58,58,0.06);
    border-color: rgba(255,58,58,0.28);
  }
  .hp-step-num {
    font-family: 'Russo One', sans-serif;
    font-size: 48px;
    color: rgba(255,255,255,0.08);
    line-height: 1;
    margin-bottom: 8px;
    transition: color 0.3s;
  }
  .hp-step-card.active .hp-step-num { color: rgba(255,58,58,0.45); }
  .hp-step-title {
    font-family: 'Russo One', sans-serif;
    font-size: 22px;
    color: #fff;
    margin-bottom: 10px;
  }
  .hp-step-desc {
    font-size: 14px;
    color: rgba(255,255,255,0.62);
    line-height: 1.65;
    margin: 0;
  }

  /* ── Leagues ── */
  .hp-ligues-section {
    background: #061333;
    padding: 100px 0;
  }
  .hp-marquee-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #3A7AFF;
    font-size: 14px;
    font-weight: 700;
    text-decoration: none;
    margin-top: 16px;
    transition: color 0.2s;
  }
  .hp-marquee-link:hover { color: #5B93FF; }
  .hp-marquee-wrap {
    overflow: hidden;
    margin: 40px 0;
    padding: 16px 0;
    border-top: 1px solid rgba(255,255,255,0.06);
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .hp-marquee-track {
    display: flex;
    gap: 32px;
    width: max-content;
    animation: hp-marquee 35s linear infinite;
  }
  .hp-marquee-item {
    font-size: 14px;
    font-weight: 600;
    color: rgba(255,255,255,0.45);
    white-space: nowrap;
    padding: 0 8px;
  }
  .hp-ligue-tabs {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 28px;
  }
  .hp-ligue-tab {
    padding: 10px 20px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.7);
  }
  .hp-ligue-tab.active {
    background: #FF3A3A;
    border-color: #FF3A3A;
    color: #fff;
  }
  .hp-ligue-tab:hover:not(.active) { background: rgba(255,255,255,0.08); }
  .hp-ligue-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 12px;
  }
  .hp-ligue-item {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 10px;
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 600;
    color: rgba(255,255,255,0.82);
  }
  .hp-ligue-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .hp-ligue-dot.male  { background: #2ED27F; }
  .hp-ligue-dot.female { background: #FF3A3A; }

  /* ── CTA final ── */
  .hp-cta-section {
    background: #0D1F4A;
    text-align: center;
    padding: 120px 0;
    position: relative;
    overflow: hidden;
  }
  .hp-cta-glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 30% 30%, rgba(255,58,58,0.14), transparent 50%),
                radial-gradient(circle at 70% 70%, rgba(255,58,58,0.09), transparent 50%);
    pointer-events: none;
  }
  .hp-cta-inner {
    position: relative;
    z-index: 1;
    max-width: 800px;
    margin: 0 auto;
    padding: 0 24px;
  }
  .hp-cta-title {
    font-family: 'Russo One', sans-serif;
    font-size: clamp(48px, 9vw, 118px);
    line-height: 0.95;
    color: #fff;
    margin-bottom: 24px;
  }
  .hp-cta-desc {
    font-size: 18px;
    color: rgba(255,255,255,0.72);
    max-width: 560px;
    margin: 0 auto 40px;
    line-height: 1.65;
  }
  .hp-cta-btns {
    display: flex;
    gap: 14px;
    justify-content: center;
    flex-wrap: wrap;
  }

  /* ── Responsive ── */
  @media (max-width: 960px) {
    .hp-cards-grid { grid-template-columns: 1fr !important; }
    .hp-how-inner { grid-template-columns: 1fr !important; gap: 40px !important; }
    .hp-how-left { position: static !important; }
    .hp-stats-inner { grid-template-columns: repeat(2, 1fr) !important; }
  }
  @media (max-width: 600px) {
    .hp-hero-h1 { font-size: clamp(40px, 14vw, 80px) !important; }
    .hp-cards-grid { padding: 0 16px !important; }
    .hp-card { height: 420px !important; }
    .hp-stats-inner { grid-template-columns: repeat(2, 1fr) !important; }
    .hp-section-header { margin-bottom: 32px !important; }
  }
`
