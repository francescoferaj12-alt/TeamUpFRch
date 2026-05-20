'use client'

import Link from 'next/link'
import { useLang } from '../../lib/lang-context'
import { t } from '../../lib/translations'

// ─── SVG icons (stroke-based, monochrome) ───────────────────────────────────

const Svg = ({ children, size = 14, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round"
    width={size} height={size} aria-hidden="true" {...props}>
    {children}
  </svg>
)

const IcoGlobe    = () => <Svg><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10M12 2a15.3 15.3 0 0 0-4 10 15.3 15.3 0 0 0 4 10"/></Svg>
const IcoOrigin   = () => <Svg><circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18"/></Svg>

const IcoTarget   = () => <Svg><polygon points="3 11 22 2 13 21 11 13 3 11"/></Svg>
const IcoPulse    = () => <Svg><path d="M3 12h4l3-9 4 18 3-9h4"/></Svg>
const IcoEye      = (p: {size?:number}) => <Svg size={p.size||26}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></Svg>
const IcoNetwork  = (p: {size?:number}) => <Svg size={p.size||26}><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="12" cy="18" r="3"/><path d="M8 8l3 8M16 8l-3 8"/></Svg>
const IcoShield   = (p: {size?:number}) => <Svg size={p.size||26}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Svg>
const IcoMapPin   = (p: {size?:number}) => <Svg size={p.size||26}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></Svg>
const IcoBulb     = () => <Svg size={12}><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26A7 7 0 0 0 12 2z"/></Svg>
const IcoTool     = () => <Svg size={12}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></Svg>
const IcoRocket   = () => <Svg size={12}><path d="M4.5 16.5l-1-4 5.5-5.5 4-1a10 10 0 0 1 5.5 5.5l-1 4-5.5 5.5-4 1a10 10 0 0 1-3.5-5.5z"/><path d="M8 8l-1.5-3.5L3 3l1.5 3.5L8 8zM16 16l3.5 1.5L21 21l-3.5-1.5L16 16z"/></Svg>
const IcoStar     = () => <Svg size={12}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></Svg>
const IcoQuote    = () => <Svg size={22}><path d="M7 7h4v8H3V11a4 4 0 0 1 4-4zM17 7h4v8h-8V11a4 4 0 0 1 4-4z" fill="white" stroke="none"/></Svg>
const IcoArrow    = () => <Svg size={16}><path d="M5 12h14M12 5l7 7-7 7"/></Svg>

// ─── Page ───────────────────────────────────────────────────────────────────

export default function AProposPage() {
  const { lang } = useLang()

  const missions = [
    { icon: <IcoEye />,     title: t.apropos.val_visibility[lang], desc: t.apropos.val_visibility_desc[lang] },
    { icon: <IcoNetwork />, title: t.apropos.val_connection[lang],  desc: t.apropos.val_connection_desc[lang] },
    { icon: <IcoShield />,  title: t.apropos.val_free[lang],        desc: t.apropos.val_free_desc[lang] },
    { icon: <IcoMapPin />,  title: t.apropos.val_local[lang],       desc: t.apropos.val_local_desc[lang] },
  ]

  const timeline = [
    { date: lang === 'fr' ? 'Fin 2025'    : 'Ende 2025',    icon: <IcoBulb />,   title: t.apropos.tl1_title[lang], desc: t.apropos.tl1_desc[lang] },
    { date: lang === 'fr' ? 'Début 2026'  : 'Anfang 2026',  icon: <IcoTool />,   title: t.apropos.tl2_title[lang], desc: t.apropos.tl2_desc[lang] },
    { date: lang === 'fr' ? 'Juin 2026'   : 'Juni 2026',    icon: <IcoRocket />, title: t.apropos.tl3_title[lang], desc: t.apropos.tl3_desc[lang] },
    { date: t.apropos.tl4_date[lang],                        icon: <IcoStar />,   title: t.apropos.tl4_title[lang], desc: t.apropos.tl4_desc[lang] },
  ]

  return (
    <div style={{ background: '#0D1F4A', minHeight: '100vh', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .ap-card { transition: transform .5s cubic-bezier(.22,1,.36,1), border-color .5s, background .5s; }
        .ap-card:hover { transform: translateY(-6px); border-color: rgba(255,58,58,.4) !important; }
.ap-value-card { transition: transform .4s cubic-bezier(.22,1,.36,1), border-color .4s; }
        .ap-value-card:hover { transform: translateY(-4px); border-color: rgba(255,58,58,.3) !important; }
        .ap-btn-primary { transition: transform .3s cubic-bezier(.22,1,.36,1), box-shadow .3s cubic-bezier(.22,1,.36,1); }
        .ap-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(255,58,58,.4); }
        .ap-btn-secondary { transition: border-color .3s, background .3s; }
        .ap-btn-secondary:hover { border-color: #fff !important; background: rgba(255,255,255,.05) !important; }
        @media (max-width: 860px) {
          .ap-mission-grid { grid-template-columns: 1fr 1fr !important; }
          .ap-section { padding: 60px 0 !important; }
          .ap-hero { padding: 120px 0 60px !important; }
        }
        @media (max-width: 520px) {
          .ap-mission-grid { grid-template-columns: 1fr !important; }
          .ap-pull-quote { padding: 40px 24px 32px !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section className="ap-hero" style={{ padding: '160px 0 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(255,58,58,.14) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 820, margin: '0 auto', padding: '0 32px' }}>
          <span style={{ fontFamily: "'Russo One', sans-serif", fontSize: 12, letterSpacing: '4px', color: '#FF3A3A', textTransform: 'uppercase', marginBottom: 24, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <IcoGlobe />{t.apropos.hero_badge[lang]}
          </span>
          <h1 style={{ fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(48px, 8vw, 104px)', lineHeight: .95, letterSpacing: '-1.5px', textTransform: 'uppercase', marginBottom: 32, color: '#fff' }}>
            {t.apropos.hero_title1[lang]}<br />
            <span style={{ color: '#FF3A3A' }}>{t.apropos.hero_title2[lang]}</span>
          </h1>
          <p style={{ fontSize: 'clamp(17px, 1.5vw, 21px)', fontWeight: 300, color: 'rgba(255,255,255,.92)', lineHeight: 1.6, maxWidth: 680, margin: '0 auto' }}>
            {t.apropos.hero_desc[lang]}
          </p>
        </div>
      </section>

      {/* ── ORIGINE (colonne singola) ── */}
      <section className="ap-section" style={{ padding: '80px 0' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 32px' }}>
          <span style={{ fontFamily: "'Russo One', sans-serif", fontSize: 12, letterSpacing: '4px', color: '#FF3A3A', textTransform: 'uppercase', marginBottom: 24, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <IcoOrigin />{t.apropos.origin_badge[lang]}
          </span>
          <h2 style={{ fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(36px, 4vw, 56px)', lineHeight: 1.05, letterSpacing: '-.5px', textTransform: 'uppercase', marginBottom: 32 }}>
            {t.apropos.origin_title[lang]}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 22, marginBottom: 56 }}>
            {([
              t.apropos.origin_p1[lang],
              t.apropos.origin_p2[lang],
              t.apropos.origin_p3[lang],
              t.apropos.origin_p4[lang],
              t.apropos.origin_p5[lang],
            ] as string[]).map((p, i) => (
              <p key={i} style={{ fontSize: 'clamp(15px, 1.2vw, 17px)', lineHeight: 1.7, color: 'rgba(255,255,255,.92)', fontWeight: 300 }}>{p}</p>
            ))}
          </div>

          {/* Pull Quote */}
          <blockquote className="ap-pull-quote" style={{ margin: 0, padding: '48px 40px 36px', border: '1px solid rgba(255,255,255,.12)', borderRadius: 24, background: 'linear-gradient(135deg, rgba(255,58,58,.06) 0%, rgba(13,31,74,.3) 100%)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: -22, left: 40, width: 44, height: 44, background: '#FF3A3A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 28px rgba(255,58,58,.4)' }}>
              <IcoQuote />
            </div>
            <p style={{ fontSize: 'clamp(18px, 1.8vw, 24px)', fontWeight: 300, fontStyle: 'italic', lineHeight: 1.4, color: '#fff', marginBottom: 28 }}>
              {t.apropos.quote[lang]}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,.12)' }}>
              <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #ff9a3a 0%, #c4651f 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Russo One', sans-serif", fontSize: 16, color: '#fff', flexShrink: 0 }}>T</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>Tiago</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', marginTop: 2 }}>{t.apropos.quote_sub[lang]}</div>
              </div>
            </div>
          </blockquote>
        </div>
      </section>

      {/* ── MISSION / VALEURS ── */}
      <section className="ap-section" style={{ padding: '100px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
          <span style={{ fontFamily: "'Russo One', sans-serif", fontSize: 12, letterSpacing: '4px', color: '#FF3A3A', textTransform: 'uppercase', marginBottom: 24, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <IcoTarget />{t.apropos.mission_badge[lang]}
          </span>
          <h2 style={{ fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 1.05, letterSpacing: '-.5px', textTransform: 'uppercase', marginBottom: 16 }}>
            {t.apropos.mission_title1[lang]}<br />
            <span style={{ color: '#FF3A3A' }}>{t.apropos.mission_title2[lang]}</span>
          </h2>
          <p style={{ fontSize: 'clamp(16px, 1.4vw, 19px)', fontWeight: 300, color: 'rgba(255,255,255,.92)', lineHeight: 1.6, maxWidth: 720, marginBottom: 60 }}>
            {t.apropos.mission_desc[lang]}
          </p>

          <div className="ap-mission-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {missions.map((v, i) => (
              <div key={i} className="ap-value-card" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,.04) 0%, rgba(255,255,255,.01) 100%)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 20, padding: '32px 24px' }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(255,58,58,.12)', border: '1px solid rgba(255,58,58,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, color: '#FF3A3A' }}>
                  {v.icon}
                </div>
                <h3 style={{ fontFamily: "'Russo One', sans-serif", fontSize: 20, lineHeight: 1.1, letterSpacing: '.5px', marginBottom: 10 }}>{v.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.55, color: 'rgba(255,255,255,.6)', fontWeight: 300 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section className="ap-section" style={{ padding: '100px 0', background: 'rgba(255,255,255,.02)' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 32px' }}>
          <span style={{ fontFamily: "'Russo One', sans-serif", fontSize: 12, letterSpacing: '4px', color: '#FF3A3A', textTransform: 'uppercase', marginBottom: 24, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <IcoPulse />{t.apropos.timeline_badge[lang]}
          </span>
          <h2 style={{ fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(36px, 4vw, 56px)', lineHeight: 1.05, letterSpacing: '-.5px', textTransform: 'uppercase', marginBottom: 60 }}>
            {t.apropos.timeline_title[lang]}
          </h2>

          <div style={{ position: 'relative', paddingLeft: 32 }}>
            <div style={{ position: 'absolute', left: 11, top: 0, bottom: 0, width: 2, background: 'linear-gradient(180deg, #FF3A3A 0%, rgba(255,255,255,.12) 100%)' }} />
            {timeline.map((item, i) => (
              <div key={i} style={{ position: 'relative', paddingBottom: i < timeline.length - 1 ? 48 : 0, paddingLeft: 32 }}>
                <div style={{ position: 'absolute', left: -32, top: 4, width: 24, height: 24, borderRadius: '50%', background: '#0D1F4A', border: '2px solid #FF3A3A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF3A3A' }}>
                  {item.icon}
                </div>
                <div style={{ fontFamily: "'Russo One', sans-serif", fontSize: 13, letterSpacing: '2px', color: '#FF3A3A', textTransform: 'uppercase', marginBottom: 8 }}>{item.date}</div>
                <h3 style={{ fontFamily: "'Russo One', sans-serif", fontSize: 24, lineHeight: 1.15, letterSpacing: '.3px', marginBottom: 12 }}>{item.title}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: 'rgba(255,255,255,.92)', fontWeight: 300, maxWidth: 680 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '120px 0 100px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 60%, rgba(255,58,58,.15) 0%, transparent 55%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 820, margin: '0 auto', padding: '0 32px' }}>
          <h2 style={{ fontFamily: "'Russo One', sans-serif", fontSize: 'clamp(40px, 6vw, 80px)', lineHeight: 1, letterSpacing: '-1px', textTransform: 'uppercase', marginBottom: 24 }}>
            {t.apropos.cta_title[lang]}
          </h2>
          <p style={{ fontSize: 'clamp(16px, 1.4vw, 19px)', fontWeight: 300, color: 'rgba(255,255,255,.92)', maxWidth: 620, margin: '0 auto 40px', lineHeight: 1.6 }}>
            {t.apropos.cta_desc[lang]}
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" className="ap-btn-primary" style={{ background: '#FF3A3A', color: '#fff', padding: '18px 36px', borderRadius: 999, fontSize: 15, fontWeight: 600, letterSpacing: '.5px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              {t.apropos.cta_btn1[lang]}
              <IcoArrow />
            </Link>
            <Link href="/recherche" className="ap-btn-secondary" style={{ background: 'transparent', color: '#fff', padding: '18px 36px', borderRadius: 999, border: '1px solid rgba(255,255,255,.22)', fontSize: 15, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              {t.apropos.cta_btn2[lang]}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
