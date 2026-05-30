'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase, Profile, Annonce, avatarSrc } from '../../../lib/supabase'
import VerifiedBadge from '../../../components/VerifiedBadge'
import ClubCrest from '../../../components/ClubCrest'

// ——— SVG helpers ————————————————————————————
const Svg = ({ children, size = 18, color = 'currentColor', ...p }: any) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    {children}
  </svg>
)
const IcoChevron  = ({ s = 12 }: { s?: number }) => <Svg size={s}><path d="M9 18l6-6-6-6"/></Svg>
const IcoStar     = ({ s = 12, color = 'currentColor' }: { s?: number; color?: string }) => (
  <Svg size={s} color={color}><polygon points="12 2 15 8 22 9 17 14 18 21 12 18 6 21 7 14 2 9 9 8 12 2"/></Svg>
)
const IcoPin      = ({ s = 12, color = 'currentColor' }: { s?: number; color?: string }) => (
  <Svg size={s} color={color}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></Svg>
)
const IcoMsg      = ({ s = 16 }: { s?: number }) => (
  <Svg size={s}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></Svg>
)
const IcoArrow    = ({ s = 14 }: { s?: number }) => <Svg size={s}><path d="M5 12h14M12 5l7 7-7 7"/></Svg>
const IcoMail     = ({ s = 16 }: { s?: number }) => (
  <Svg size={s}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></Svg>
)
const IcoShield   = ({ s = 64 }: { s?: number }) => (
  <Svg size={s}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Svg>
)
const IcoCheck    = ({ s = 10 }: { s?: number }) => <Svg size={s}><polyline points="20 6 9 17 4 12"/></Svg>

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const h = Math.floor(diff / 3_600_000)
  if (h < 1)  return 'il y a quelques min'
  if (h < 24) return `il y a ${h}h`
  const d = Math.floor(h / 24)
  if (d < 30) return `il y a ${d}j`
  return `il y a ${Math.floor(d / 30)}m`
}

export default function ClubPage() {
  const { slug } = useParams<{ slug: string }>()
  const [club, setClub]       = useState<Profile | null>(null)
  const [annonces, setAnnonces] = useState<Annonce[]>([])
  const [loading, setLoading]  = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeTab, setActiveTab] = useState('about')

  // ——— Data fetch (unchanged logic) ————————————————
  useEffect(() => {
    async function load() {
      const [{ data, error }, { data: auth }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', slug).eq('role', 'club').single(),
        supabase.auth.getUser(),
      ])
      if (error || !data) { setNotFound(true); setLoading(false); return }
      if (data.hidden && auth.user?.id !== data.id) { setNotFound(true); setLoading(false); return }
      setClub(data)
      const { data: ann } = await supabase
        .from('annonces').select('*')
        .eq('author_id', slug).eq('status', 'active')
        .order('created_at', { ascending: false })
      setAnnonces(ann || [])
      setLoading(false)
    }
    load()
  }, [slug])

  // ——— Tab scroll detection ————————————————————————
  useEffect(() => {
    const sectionIds = ['cd-about', 'cd-annonces', 'cd-contact']
    const tabKeys    = ['about',    'annonces',    'contact']
    const onScroll = () => {
      const y = window.scrollY + 220
      let active = 'about'
      sectionIds.forEach((id, i) => {
        const el = document.getElementById(id)
        if (el && el.offsetTop <= y) active = tabKeys[i]
      })
      setActiveTab(active)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ——— Loading ——————————————————————————————————————
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', background:'#0D1F4A' }}>
      <div style={{ width:36, height:36, border:'4px solid rgba(255,255,255,.1)', borderTopColor:'#FF3A3A', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  // ——— Not found ————————————————————————————————————
  if (notFound || !club) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', background:'#0D1F4A', color:'#fff', gap:16 }}>
      <div style={{ opacity:.25 }}><IcoShield s={64} /></div>
      <div style={{ fontFamily:"'Russo One',sans-serif", fontSize:'1.75rem', textTransform:'uppercase', letterSpacing:1 }}>Club introuvable</div>
      <Link href="/clubs" style={{ color:'#FF3A3A', textDecoration:'none', fontWeight:600, fontSize:14 }}>Voir tous les clubs</Link>
    </div>
  )

  // ——— Derived values ——————————————————————————————
  const strengths = (club.strengths || '').split(',').map((s: string) => s.trim()).filter(Boolean)
  const strengthLabels: Record<string, string> = {
    infrastructure: 'Infrastructure de qualité', family:      'Esprit familial',
    ambition:       'Ambition sportive',         youth:       'Formation jeunes',
    competitive:    'Équipe compétitive',         atmosphere:  'Bonne ambiance',
    professional:   'Structure sérieuse',         social:      'Vie sociale active',
    equipment:      'Bons équipements',           local:       'Ancrage local',
    growing:        'Club en développement',      welcoming:   'Accueil de nouveaux joueurs',
  }
  const initials = (club.club_name || 'C').split(' ').map((w: string) => w[0]).join('').slice(0, 3).toUpperCase()

  type FactRow = { k: string; v: string; accent?: boolean; isEmail?: boolean }
  const factRows: FactRow[] = []
  if (club.zone)    factRows.push({ k: 'Zone',         v: club.zone })
  if (club.ligue)   factRows.push({ k: 'Ligue',        v: club.ligue })
  factRows.push({ k: 'Recrutement', v: club.available ? 'Ouvert' : 'Complet', accent: !!club.available })
  if (club.verified) factRows.push({ k: 'Statut',      v: 'Vérifié' })
  if (club.email)   factRows.push({ k: 'Email',        v: club.email, isEmail: true })

  // ——— Render —————————————————————————————————————
  return (
    <div className="cd-page">

      {/* BREADCRUMB */}
      <div className="cd-breadcrumb">
        <div className="cd-container">
          <Link href="/clubs" className="cd-bc-link">Clubs</Link>
          <IcoChevron s={12} />
          <span className="cd-bc-current">{club.club_name || 'Club'}</span>
        </div>
      </div>

      {/* HERO */}
      <section className="cd-hero">
        <div className="cd-container">
          <div className="cd-hero-main">

            <ClubCrest src={avatarSrc(club.avatar_url)} alt={club.club_name || ''} size={140} fallback={initials} />

            {/* Club info */}
            <div className="cd-info">
              <div className="cd-tags">
                {club.ligue && (
                  <span className="cd-tag cd-tag-primary">
                    <IcoStar s={12} color="currentColor" />{club.ligue}
                  </span>
                )}
                {club.zone && (
                  <span className="cd-tag">
                    <IcoPin s={12} color="currentColor" />{club.zone}
                  </span>
                )}
                {club.available != null && (
                  <span className={`cd-tag${club.available ? ' cd-tag-green' : ''}`}>
                    {club.available ? 'Recrute' : 'Complet'}
                  </span>
                )}
              </div>
              <h1 className="cd-name">{club.club_name || 'Club'}</h1>
              {club.verified && (
                <div className="cd-verified">
                  <VerifiedBadge size={16} />
                  <span>Club vérifié</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="cd-hero-actions">
              <Link href={`/messages?partner=${club.id}`} className="cd-btn-pri">
                <IcoMsg s={16} />Contacter
              </Link>
            </div>
          </div>

          {/* Stats strip */}
          <div className="cd-strip">
            <div className="cd-stat">
              <div className={`cd-stat-num${annonces.length > 0 ? ' em' : ''}`}>{annonces.length}</div>
              <div className="cd-stat-label">Annonces actives</div>
            </div>
            <div className="cd-stat">
              <div className={`cd-stat-num${club.available ? ' green' : ''}`}>
                {club.available ? 'Recrute' : 'Complet'}
              </div>
              <div className="cd-stat-label">Recrutement</div>
            </div>
            {club.ligue && (
              <div className="cd-stat">
                <div className="cd-stat-num">{club.ligue}</div>
                <div className="cd-stat-label">Ligue</div>
              </div>
            )}
            {club.zone && (
              <div className="cd-stat">
                <div className="cd-stat-num">{club.zone}</div>
                <div className="cd-stat-label">Zone</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* TAB NAV */}
      <nav className="cd-tabnav" aria-label="Sections du club">
        <div className="cd-tabnav-inner">
          {(['about', 'annonces', 'contact'] as const).map(id => {
            const labels: Record<string, string> = { about: 'À propos', annonces: 'Annonces', contact: 'Contact' }
            return (
              <a key={id} href={`#cd-${id}`} className={`cd-tab${activeTab === id ? ' act' : ''}`}
                onClick={() => setActiveTab(id)}>
                {labels[id]}
              </a>
            )
          })}
        </div>
      </nav>

      {/* ABOUT */}
      <section className="cd-section" id="cd-about">
        <div className="cd-container">
          <div className="cd-eyebrow">À propos</div>
          <h2 className="cd-stitle">Le <span className="em">club.</span></h2>
          <div className="cd-about-grid">
            <div className="cd-about-text">
              {club.bio
                ? <p>{club.bio}</p>
                : <p style={{ color: 'rgba(255,255,255,.35)', fontStyle: 'italic' }}>Aucune description disponible pour ce club.</p>
              }
              {strengths.length > 0 && (
                <div className="cd-strengths">
                  <div className="cd-strengths-title">Points forts</div>
                  <div className="cd-strengths-grid">
                    {strengths.map(k => (
                      <span key={k} className="cd-strength-pill">{strengthLabels[k] || k}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="cd-facts-card">
              <div className="cd-facts-title">Infos clés</div>
              {factRows.map(({ k, v, accent, isEmail }) => (
                <div key={k} className="cd-fact-row">
                  <span className="cd-fact-label">{k}</span>
                  <span className={`cd-fact-value${accent ? ' green' : ''}`}>
                    {k === 'Statut' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        {v} <IcoCheck s={10} />
                      </span>
                    ) : isEmail ? (
                      <a href={`mailto:${v}`}>{v}</a>
                    ) : v}
                  </span>
                </div>
              ))}
            </aside>
          </div>
        </div>
      </section>

      {/* ANNONCES */}
      <section className="cd-section cd-section-alt" id="cd-annonces">
        <div className="cd-container">
          <div className="cd-eyebrow">Recrutement en cours</div>
          <h2 className="cd-stitle">
            {annonces.length > 0
              ? <>{annonces.length} poste{annonces.length !== 1 ? 's' : ''} <span className="em">ouvert{annonces.length !== 1 ? 's' : ''}.</span></>
              : <>Annonces <span className="em">actives.</span></>
            }
          </h2>
          {annonces.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,.4)', fontStyle: 'italic', fontSize: 15 }}>
              Aucune annonce active pour le moment.
            </p>
          ) : (
            <div className="cd-ann-list">
              {annonces.map(a => (
                <Link key={a.id} href="/annonces" className="cd-ann-row">
                  <div className="cd-ann-icon">
                    <IcoStar s={22} color="#FF3A3A" />
                  </div>
                  <div className="cd-ann-content">
                    <div className="cd-ann-title">{a.title}</div>
                    <div className="cd-ann-meta">
                      {a.position && <span>{a.position}</span>}
                      {a.ligue    && <span>{a.ligue}</span>}
                      {a.zone     && <span>{a.zone}</span>}
                      {a.created_at && <span>{relativeTime(a.created_at)}</span>}
                    </div>
                  </div>
                  <span className="cd-ann-action">Postuler <IcoArrow s={14} /></span>
                </Link>
              ))}
            </div>
          )}
          <Link href="/annonces" className="cd-see-all">
            Voir toutes les annonces <IcoArrow s={14} />
          </Link>
        </div>
      </section>

      {/* CONTACT */}
      <section className="cd-section" id="cd-contact">
        <div className="cd-container">
          <div className="cd-eyebrow">Contact</div>
          <h2 className="cd-stitle">Contacter <span className="em">le club.</span></h2>
          <div className="cd-contact-grid">

            <div className="cd-contact-card">
              <h3 className="cd-contact-h3">Informations</h3>
              {club.email && (
                <div className="cd-contact-line">
                  <div className="cd-contact-icon"><IcoMail s={16} /></div>
                  <div className="cd-contact-content">
                    <div className="cd-contact-label">Email</div>
                    <div className="cd-contact-value"><a href={`mailto:${club.email}`}>{club.email}</a></div>
                  </div>
                </div>
              )}
              {club.zone && (
                <div className="cd-contact-line">
                  <div className="cd-contact-icon"><IcoPin s={16} color="#FF3A3A" /></div>
                  <div className="cd-contact-content">
                    <div className="cd-contact-label">Zone</div>
                    <div className="cd-contact-value">{club.zone}</div>
                  </div>
                </div>
              )}
              <div className="cd-contact-line">
                <div className="cd-contact-icon"><IcoMsg s={16} /></div>
                <div className="cd-contact-content">
                  <div className="cd-contact-label">Messagerie</div>
                  <div className="cd-contact-value">
                    <Link href={`/messages?partner=${club.id}`} style={{ color: '#FF3A3A', textDecoration: 'none' }}>
                      Envoyer un message
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* CSS map placeholder */}
            <div className="cd-map-card">
              <div className="cd-map-bg" />
              <div className="cd-map-pin-shadow" />
              <div className="cd-map-pin">
                <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="white" strokeWidth="2.5" aria-hidden="true">
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <div className="cd-map-overlay">
                <div className="cd-map-overlay-title">{club.club_name || 'Club'}</div>
                <div className="cd-map-overlay-sub">{club.zone || 'Canton de Fribourg'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes spin        { to { transform:rotate(360deg); } }
        @keyframes mapBounce   { 0%,100%{transform:translate(-50%,-50%)} 50%{transform:translate(-50%,-60%)} }
        @keyframes shadowPulse { 0%,100%{width:30px;opacity:.4} 50%{width:22px;opacity:.25} }

        .cd-page {
          background:
            radial-gradient(ellipse at top,#1a2f6b 0%,transparent 60%),
            radial-gradient(ellipse at bottom,rgba(255,58,58,.06) 0%,transparent 60%),
            #0D1F4A;
          min-height:100vh; color:#fff;
          font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;
          -webkit-font-smoothing:antialiased;
        }
        .cd-container { max-width:1100px; margin:0 auto; padding:0 24px; }

        /* Breadcrumb */
        .cd-breadcrumb { padding:104px 0 0; font-size:13px; color:rgba(255,255,255,.6); }
        .cd-breadcrumb .cd-container { display:flex; align-items:center; gap:8px; }
        .cd-bc-link { color:rgba(255,255,255,.6); text-decoration:none; transition:color .3s; }
        .cd-bc-link:hover { color:#fff; }
        .cd-bc-current { color:#fff; font-weight:500; }

        /* Hero */
        .cd-hero { padding:32px 0 0; }
        .cd-hero-main {
          display:grid; grid-template-columns:auto 1fr auto;
          gap:32px; align-items:center;
          padding:28px 0;
          border-top:1px solid rgba(255,255,255,.12);
          border-bottom:1px solid rgba(255,255,255,.12);
        }


        /* Tags */
        .cd-tags { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:14px; }
        .cd-tag {
          display:inline-flex; align-items:center; gap:6px;
          padding:5px 12px; border-radius:999px;
          font-size:11px; font-weight:600; letter-spacing:1.5px; text-transform:uppercase;
          background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12); color:rgba(255,255,255,.92);
        }
        .cd-tag-primary { background:rgba(255,58,58,.12)!important; border-color:rgba(255,58,58,.3)!important; color:#FF3A3A!important; }
        .cd-tag-green   { background:rgba(46,210,127,.12)!important; border-color:rgba(46,210,127,.3)!important; color:#2ED27F!important; }

        /* Name + verified */
        .cd-name {
          font-family:'Russo One',sans-serif;
          font-size:clamp(32px,5vw,64px);
          line-height:.95; letter-spacing:-1px; text-transform:uppercase; margin-bottom:8px;
        }
        .cd-verified { display:flex; align-items:center; gap:6px; font-size:13px; color:rgba(255,255,255,.6); margin-top:4px; }

        /* Hero action */
        .cd-hero-actions { display:flex; flex-direction:column; gap:10px; align-items:flex-end; }
        .cd-btn-pri {
          background:#FF3A3A; color:#fff;
          padding:14px 24px; border-radius:12px;
          font-size:14px; font-weight:600; letter-spacing:.3px;
          display:inline-flex; align-items:center; gap:8px;
          text-decoration:none; white-space:nowrap;
          transition:transform .3s,box-shadow .3s;
        }
        .cd-btn-pri:hover { transform:translateY(-1px); box-shadow:0 12px 28px rgba(255,58,58,.4); }

        /* Stats strip */
        .cd-strip {
          display:grid; grid-template-columns:repeat(auto-fit,minmax(110px,1fr));
          padding:24px 0; border-bottom:1px solid rgba(255,255,255,.12);
        }
        .cd-stat { text-align:center; position:relative; padding:4px 8px; }
        .cd-stat:not(:last-child)::after {
          content:''; position:absolute; right:0; top:50%; transform:translateY(-50%);
          width:1px; height:60%; background:rgba(255,255,255,.12);
        }
        .cd-stat-num {
          font-family:'Russo One',sans-serif;
          font-size:clamp(16px,2.5vw,28px); line-height:1; color:#fff;
        }
        .cd-stat-num.em    { color:#FF3A3A; }
        .cd-stat-num.green { color:#2ED27F; }
        .cd-stat-label { font-size:10px; letter-spacing:2px; text-transform:uppercase; color:rgba(255,255,255,.6); margin-top:8px; }

        /* Tab nav */
        .cd-tabnav {
          position:sticky; top:78px; z-index:50;
          background:rgba(13,31,74,.85);
          backdrop-filter:blur(20px) saturate(180%);
          -webkit-backdrop-filter:blur(20px) saturate(180%);
          border-bottom:1px solid rgba(255,255,255,.12);
        }
        .cd-tabnav-inner {
          max-width:1100px; margin:0 auto; padding:0 24px;
          display:flex; gap:4px; overflow-x:auto; scrollbar-width:none;
        }
        .cd-tabnav-inner::-webkit-scrollbar { display:none; }
        .cd-tab {
          padding:16px 20px; font-size:13px; font-weight:600; letter-spacing:.5px;
          color:rgba(255,255,255,.6); white-space:nowrap;
          border-bottom:2px solid transparent;
          transition:color .3s,border-color .3s; text-decoration:none;
        }
        .cd-tab:hover { color:rgba(255,255,255,.92); }
        .cd-tab.act   { color:#fff; border-bottom-color:#FF3A3A; }

        /* Section common */
        .cd-section     { padding:72px 0; }
        .cd-section-alt { background:rgba(255,255,255,.02); }
        .cd-eyebrow {
          font-family:'Russo One',sans-serif;
          font-size:11px; letter-spacing:3px; color:#FF3A3A; text-transform:uppercase;
          margin-bottom:14px;
        }
        .cd-stitle {
          font-family:'Russo One',sans-serif;
          font-size:clamp(28px,3.5vw,44px);
          line-height:1; letter-spacing:-.5px; text-transform:uppercase; margin-bottom:40px;
        }
        .cd-stitle .em { color:#FF3A3A; }

        /* About grid */
        .cd-about-grid { display:grid; grid-template-columns:1.4fr 1fr; gap:48px; align-items:start; }
        .cd-about-text { font-size:16px; line-height:1.7; color:rgba(255,255,255,.85); font-weight:300; }

        /* Strengths */
        .cd-strengths { margin-top:32px; }
        .cd-strengths-title {
          font-family:'Russo One',sans-serif;
          font-size:11px; letter-spacing:2px; color:rgba(255,255,255,.45); text-transform:uppercase;
          margin-bottom:12px;
        }
        .cd-strengths-grid { display:flex; gap:8px; flex-wrap:wrap; }
        .cd-strength-pill {
          background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.12);
          color:rgba(255,255,255,.8); font-size:13px; font-weight:500;
          padding:5px 14px; border-radius:999px;
        }

        /* Facts card */
        .cd-facts-card {
          background:linear-gradient(180deg,rgba(255,255,255,.04) 0%,rgba(255,255,255,.01) 100%);
          border:1px solid rgba(255,255,255,.12); border-radius:20px; padding:28px;
        }
        .cd-facts-title {
          font-family:'Russo One',sans-serif;
          font-size:11px; letter-spacing:2px; color:#FF3A3A; text-transform:uppercase;
          margin-bottom:20px;
        }
        .cd-fact-row {
          display:flex; justify-content:space-between; align-items:center;
          padding:14px 0; border-bottom:1px solid rgba(255,255,255,.08); font-size:14px;
        }
        .cd-fact-row:last-child { border-bottom:0; }
        .cd-fact-label { color:rgba(255,255,255,.6); }
        .cd-fact-value { color:#fff; font-weight:500; text-align:right; }
        .cd-fact-value.green { color:#2ED27F; }
        .cd-fact-value a { color:#fff; text-decoration:none; transition:color .3s; }
        .cd-fact-value a:hover { color:#FF3A3A; }

        /* Annonces */
        .cd-ann-list { display:flex; flex-direction:column; gap:14px; margin-bottom:24px; }
        .cd-ann-row {
          display:grid; grid-template-columns:auto 1fr auto;
          gap:20px; align-items:center;
          padding:20px 24px;
          background:linear-gradient(180deg,rgba(255,255,255,.04) 0%,rgba(255,255,255,.01) 100%);
          border:1px solid rgba(255,255,255,.12); border-radius:16px;
          text-decoration:none; color:#fff;
          transition:border-color .3s,transform .3s;
        }
        .cd-ann-row:hover { border-color:rgba(255,58,58,.4); transform:translateX(4px); }
        .cd-ann-icon {
          width:48px; height:48px; border-radius:12px;
          background:rgba(255,58,58,.12); border:1px solid rgba(255,58,58,.3);
          display:flex; align-items:center; justify-content:center; flex-shrink:0;
        }
        .cd-ann-content { min-width:0; }
        .cd-ann-title   { font-weight:600; font-size:15px; margin-bottom:4px; }
        .cd-ann-meta    { font-size:12px; color:rgba(255,255,255,.6); display:flex; flex-wrap:wrap; gap:12px; }
        .cd-ann-action  {
          font-size:12px; font-weight:600; color:#FF3A3A;
          letter-spacing:.5px; text-transform:uppercase;
          display:inline-flex; align-items:center; gap:6px; white-space:nowrap;
          transition:gap .3s;
        }
        .cd-ann-row:hover .cd-ann-action { gap:10px; }
        .cd-see-all {
          display:inline-flex; align-items:center; gap:8px;
          font-size:13px; font-weight:600; color:#fff; letter-spacing:.5px;
          border-bottom:1px solid rgba(255,255,255,.22); padding-bottom:4px;
          text-decoration:none; transition:border-color .3s,color .3s;
        }
        .cd-see-all:hover { border-color:#FF3A3A; color:#FF3A3A; }

        /* Contact */
        .cd-contact-grid { display:grid; grid-template-columns:1fr 1fr; gap:30px; }
        .cd-contact-card {
          background:linear-gradient(180deg,rgba(255,255,255,.04) 0%,rgba(255,255,255,.01) 100%);
          border:1px solid rgba(255,255,255,.12); border-radius:20px; padding:32px;
        }
        .cd-contact-h3 { font-family:'Russo One',sans-serif; font-size:24px; margin-bottom:24px; letter-spacing:.3px; }
        .cd-contact-line {
          display:flex; align-items:flex-start; gap:14px;
          padding:14px 0; border-bottom:1px solid rgba(255,255,255,.08);
        }
        .cd-contact-line:last-child { border-bottom:0; }
        .cd-contact-icon {
          width:36px; height:36px; border-radius:10px;
          background:rgba(255,58,58,.12); border:1px solid rgba(255,58,58,.3);
          display:flex; align-items:center; justify-content:center;
          flex-shrink:0; color:#FF3A3A;
        }
        .cd-contact-content { flex:1; min-width:0; }
        .cd-contact-label { font-size:11px; letter-spacing:1.5px; color:rgba(255,255,255,.6); text-transform:uppercase; margin-bottom:4px; }
        .cd-contact-value { font-size:14px; color:#fff; font-weight:500; word-break:break-word; }
        .cd-contact-value a { color:#fff; text-decoration:none; transition:color .3s; }
        .cd-contact-value a:hover { color:#FF3A3A; }

        /* CSS Map */
        .cd-map-card {
          background:linear-gradient(180deg,rgba(255,255,255,.04) 0%,rgba(255,255,255,.01) 100%);
          border:1px solid rgba(255,255,255,.12); border-radius:20px; overflow:hidden;
          position:relative; min-height:320px;
        }
        .cd-map-bg {
          position:absolute; inset:0;
          background:
            radial-gradient(circle at 30% 40%,rgba(58,122,255,.15) 0%,transparent 40%),
            radial-gradient(circle at 70% 70%,rgba(46,210,127,.1) 0%,transparent 40%),
            linear-gradient(135deg,#081434 0%,#0D1F4A 100%);
        }
        .cd-map-bg::before {
          content:''; position:absolute; inset:0;
          background-image:
            linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),
            linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);
          background-size:40px 40px;
        }
        .cd-map-pin {
          position:absolute; top:45%; left:50%; transform:translate(-50%,-50%);
          width:48px; height:48px;
          background:#FF3A3A; border-radius:50% 50% 50% 0; rotate:-45deg;
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 12px 28px rgba(255,58,58,.4); z-index:2;
          animation:mapBounce 2s ease-in-out infinite;
        }
        .cd-map-pin svg { rotate:45deg; }
        .cd-map-pin-shadow {
          position:absolute; top:58%; left:50%; transform:translateX(-50%);
          width:30px; height:8px; background:rgba(0,0,0,.4); border-radius:50%;
          filter:blur(4px); z-index:1;
          animation:shadowPulse 2s ease-in-out infinite;
        }
        .cd-map-overlay {
          position:absolute; bottom:20px; left:20px; right:20px;
          padding:16px 20px;
          background:rgba(13,31,74,.85); backdrop-filter:blur(10px);
          border:1px solid rgba(255,255,255,.12); border-radius:12px; z-index:3;
        }
        .cd-map-overlay-title { font-family:'Russo One',sans-serif; font-size:14px; letter-spacing:.5px; margin-bottom:4px; }
        .cd-map-overlay-sub   { font-size:12px; color:rgba(255,255,255,.6); }

        /* Responsive */
        @media (max-width:860px) {
          .cd-hero-main { grid-template-columns:1fr; text-align:center; gap:24px; }
          .cd-tags  { justify-content:center; }
          .cd-hero-actions { align-items:center; flex-direction:row; justify-content:center; }
          .cd-about-grid { grid-template-columns:1fr; gap:32px; }
          .cd-contact-grid { grid-template-columns:1fr; }
        }
        @media (max-width:640px) {
          .cd-ann-row    { grid-template-columns:1fr; gap:12px; }
          .cd-ann-action { display:none; }
          .cd-strip { grid-template-columns:repeat(2,1fr); gap:24px 0; }
          .cd-stat:not(:last-child)::after { display:none; }
        }
      `}</style>
    </div>
  )
}
