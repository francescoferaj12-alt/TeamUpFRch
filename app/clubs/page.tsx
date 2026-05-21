'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase, Profile, avatarSrc } from '../../lib/supabase'
import { useLang } from '../../lib/lang-context'
import { useAuth } from '../../lib/auth-context'
import { t } from '../../lib/translations'
import VerifiedBadge from '../../components/VerifiedBadge'

// ── SVG primitives ────────────────────────────────────────────────────────────
const Svg = ({ children, size = 18, color = 'currentColor', ...p }: any) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    {children}
  </svg>
)
const IcoStadium = ({ s = 14, color = 'currentColor' }: { s?: number; color?: string }) => <Svg size={s} color={color}><path d="M3 21V8l9-5 9 5v13"/><path d="M9 21V12h6v9"/></Svg>
const IcoSearch  = ({ s = 20, color = 'currentColor' }: { s?: number; color?: string }) => <Svg size={s} color={color}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></Svg>
const IcoArrow   = ({ s = 14 }: { s?: number }) => <Svg size={s}><path d="M5 12h14M12 5l7 7-7 7"/></Svg>
const IcoMail    = ({ s = 13 }: { s?: number }) => <Svg size={s}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></Svg>
const IcoPin     = ({ s = 13, color = 'currentColor' }: { s?: number; color?: string }) => <Svg size={s} color={color}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></Svg>
const IcoClock   = ({ s = 13, color = 'currentColor' }: { s?: number; color?: string }) => <Svg size={s} color={color}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></Svg>
const IcoCheck   = ({ s = 11, color = 'currentColor' }: { s?: number; color?: string }) => <Svg size={s} color={color}><polyline points="20 6 9 17 4 12"/></Svg>
const IcoSort    = ({ s = 13 }: { s?: number }) => <Svg size={s}><path d="M3 6h18M6 12h12M9 18h6"/></Svg>

// 8 blason gradient variants — cycled by club index
const CREST_GRADS = [
  'linear-gradient(135deg,#FF3A3A 0%,#c41f1f 100%)',
  'linear-gradient(135deg,#1a3a8a 0%,#0d1f4a 100%)',
  'linear-gradient(135deg,#2ED27F 0%,#1a8a52 100%)',
  'linear-gradient(135deg,#FF9A3A 0%,#c4651f 100%)',
  'linear-gradient(135deg,#3a7aff 0%,#1f4ac4 100%)',
  'linear-gradient(135deg,#FF3A3A 0%,#0d1f4a 100%)',
  'linear-gradient(135deg,#FFC93A 0%,#c4951f 100%)',
  'linear-gradient(135deg,#1a3a8a 0%,#FF3A3A 100%)',
]

const ZONES = ['Fribourg-Ville','Gruyère','Broye','Glâne','Sensebezirk','Veveyse','Lac']

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterZone, setFilterZone] = useState('')
  const [sortAsc, setSortAsc] = useState(true)
  const { lang } = useLang()
  const { profile: currentUser } = useAuth()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'club')
        .neq('hidden', true)
        .eq('club_verification_status', 'approved')
        .order('created_at', { ascending: false })
      if (data) setClubs(data)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = clubs.filter(c => {
    if (currentUser && c.id === currentUser.id) return false
    if (filterZone && c.zone !== filterZone) return false
    if (search) {
      const q = search.toLowerCase()
      if (!(c.club_name || '').toLowerCase().includes(q) && !(c.zone || '').toLowerCase().includes(q)) return false
    }
    return true
  })

  const sortedFiltered = [...filtered].sort((a, b) => {
    const na = (a.club_name || '').toLowerCase()
    const nb = (b.club_name || '').toLowerCase()
    return sortAsc ? na.localeCompare(nb) : nb.localeCompare(na)
  })

  // Stats derived from loaded clubs (no extra query)
  const statsRecruiting = clubs.filter(c => c.available).length
  const statsZones = new Set(clubs.map(c => c.zone).filter(Boolean)).size

  const optSt = { background: '#081434' }

  return (
    <div style={{ background: '#0D1F4A', minHeight: '100vh', color: '#fff' }}>
      <style>{`
        /* Search bar */
        .cb-bar { display:flex; align-items:center; background:rgba(255,255,255,.06); border:1.5px solid rgba(255,255,255,.18); border-radius:999px; padding:6px 6px 6px 22px; transition:border-color .3s,background .3s,box-shadow .3s; flex:1; min-width:260px; }
        .cb-bar:focus-within { border-color:#FF3A3A !important; background:rgba(255,255,255,.09) !important; box-shadow:0 0 0 4px rgba(255,58,58,.15) !important; }
        .cb-inp { flex:1; background:transparent; border:0; outline:0; padding:11px 14px; font-size:15px; color:#fff; font-family:inherit; }
        .cb-inp::placeholder { color:rgba(255,255,255,.4); }
        .cb-sbtn { background:#FF3A3A; color:#fff; border:none; border-radius:999px; padding:10px 20px; font-size:13px; font-weight:600; font-family:inherit; cursor:pointer; letter-spacing:.3px; transition:transform .25s,box-shadow .25s; white-space:nowrap; }
        .cb-sbtn:hover { transform:translateY(-1px); box-shadow:0 10px 24px rgba(255,58,58,.4); }
        /* Zone select */
        .cb-zsel { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.15); border-radius:999px; padding:12px 44px 12px 20px; font-size:14px; font-weight:500; color:rgba(255,255,255,.9); cursor:pointer; appearance:none; -webkit-appearance:none; outline:none; font-family:inherit; background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.5)' stroke-width='2' fill='none' stroke-linecap='round'/></svg>"); background-repeat:no-repeat; background-position:right 18px center; transition:border-color .3s; min-width:200px; }
        .cb-zsel:hover { border-color:rgba(255,255,255,.3); }
        .cb-zsel:focus { border-color:#FF3A3A !important; outline:none; }
        /* Stats strip */
        .cb-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; max-width:900px; margin:0 auto; }
        @media (max-width:640px) { .cb-stats { grid-template-columns:1fr; } }
        .stat-item { border:1px solid rgba(255,255,255,.1); border-radius:16px; padding:22px 20px; text-align:center; background:rgba(255,255,255,.02); transition:border-color .3s,background .3s; }
        .stat-item:hover { border-color:rgba(255,58,58,.3); background:rgba(255,255,255,.04); }
        /* Sort toggle */
        .cb-sort { display:inline-flex; align-items:center; gap:7px; color:rgba(255,255,255,.6); cursor:pointer; font-size:13px; font-weight:500; transition:color .2s; background:none; border:none; font-family:inherit; padding:0; }
        .cb-sort:hover { color:#fff; }
        /* Club cards */
        .cb-card { position:relative; background:linear-gradient(180deg,rgba(255,255,255,.05) 0%,rgba(255,255,255,.02) 100%); border:1px solid rgba(255,255,255,.1); border-radius:20px; padding:24px 20px 20px; transition:transform .5s cubic-bezier(.22,1,.36,1),border-color .5s,background .5s; display:flex; flex-direction:column; overflow:hidden; }
        .cb-card::before { content:''; position:absolute; top:-50%; right:-50%; width:200px; height:200px; background:radial-gradient(circle,rgba(255,58,58,.09) 0%,transparent 70%); opacity:0; transition:opacity .5s; pointer-events:none; }
        .cb-card:hover { transform:translateY(-6px) !important; border-color:rgba(255,58,58,.4) !important; background:linear-gradient(180deg,rgba(255,255,255,.07) 0%,rgba(255,255,255,.03) 100%) !important; }
        .cb-card:hover::before { opacity:1; }
        .cb-card:hover .cb-arr { transform:translateX(4px); }
        .cb-arr { transition:transform .3s; display:inline-flex; align-items:center; }
        /* Blason crest */
        .cb-crest { width:68px; height:68px; clip-path:polygon(50% 0%,100% 14%,100% 60%,50% 100%,0% 60%,0% 14%); display:flex; align-items:center; justify-content:center; position:relative; font-family:'Russo One',sans-serif; font-size:15px; letter-spacing:.5px; color:#fff; flex-shrink:0; margin-bottom:18px; }
        .cb-crest-inner { position:absolute; inset:3px; clip-path:polygon(50% 0%,100% 14%,100% 60%,50% 100%,0% 60%,0% 14%); background:#0D1F4A; }
        .cb-crest-txt { position:relative; z-index:1; }
        .cb-crest img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
        /* Card buttons */
        .cb-btn-pri { flex:1; background:#FF3A3A; color:#fff; border:none; border-radius:10px; padding:9px 12px; font-size:12px; font-weight:600; text-align:center; cursor:pointer; text-decoration:none; display:flex; align-items:center; justify-content:center; gap:5px; transition:transform .25s,box-shadow .25s; font-family:inherit; letter-spacing:.3px; }
        .cb-btn-pri:hover { transform:translateY(-1px); box-shadow:0 8px 20px rgba(255,58,58,.35); }
        .cb-btn-sec { flex:1; background:transparent; color:rgba(255,255,255,.75); border:1px solid rgba(255,255,255,.2); border-radius:10px; padding:9px 12px; font-size:12px; font-weight:600; text-align:center; cursor:pointer; text-decoration:none; display:flex; align-items:center; justify-content:center; gap:5px; transition:border-color .25s,color .25s,background .25s; font-family:inherit; letter-spacing:.3px; }
        .cb-btn-sec:hover { border-color:rgba(255,255,255,.4); color:#fff; background:rgba(255,255,255,.06); }
        @media (max-width:480px) { .cb-btns { flex-direction:column !important; } .cb-btn-pri,.cb-btn-sec { flex:none !important; } }
        /* Meta rows */
        .cb-meta { display:flex; align-items:center; gap:8px; font-size:12px; }
        .cb-meta-lbl { color:rgba(255,255,255,.45); font-size:11px; }
        .cb-meta-val { font-weight:500; margin-left:auto; color:rgba(255,255,255,.9); }
        /* CTA band */
        .cb-ctaband { border:1px solid rgba(255,255,255,.12); border-radius:24px; background:linear-gradient(135deg,rgba(255,58,58,.08) 0%,rgba(13,31,74,.4) 100%); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:24px; padding:48px 44px; }
        .cb-ctabtn { background:#FF3A3A; color:#fff; padding:16px 32px; border-radius:999px; font-size:14px; font-weight:600; letter-spacing:.5px; display:inline-flex; align-items:center; gap:10px; text-decoration:none; transition:transform .3s,box-shadow .3s; white-space:nowrap; }
        .cb-ctabtn:hover { transform:translateY(-2px); box-shadow:0 16px 40px rgba(255,58,58,.4); }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>

      {/* ── PAGE HEADER ─────────────────────────────────────────────────────── */}
      <div style={{ background:'radial-gradient(ellipse at 50% 0%,rgba(26,47,107,.9) 0%,transparent 65%),radial-gradient(ellipse at 50% 100%,rgba(255,58,58,.06) 0%,transparent 60%),#0D1F4A', padding:'2.5rem 1.5rem 0', textAlign:'center' }}>
        <div style={{ maxWidth:860, margin:'0 auto' }}>
          <span style={{ display:'inline-flex', alignItems:'center', gap:8, fontFamily:"'Russo One',sans-serif", fontSize:11, letterSpacing:4, color:'#FF3A3A', textTransform:'uppercase', marginBottom:20 }}>
            <IcoStadium s={14} />
            {t.clubs.directory[lang]}
          </span>
          <h1 style={{ fontFamily:"'Russo One',sans-serif", fontSize:'clamp(2rem,7vw,4rem)', lineHeight:.92, letterSpacing:'-1px', textTransform:'uppercase', marginBottom:16, color:'#fff' }}>
            {lang === 'fr' ? <>Les clubs de <span style={{ color:'#FF3A3A' }}>Fribourg.</span></> : <>Die Vereine <span style={{ color:'#FF3A3A' }}>Freiburgs.</span></>}
          </h1>
          <p style={{ color:'rgba(255,255,255,.5)', fontSize:16, fontWeight:300, lineHeight:1.65, maxWidth:580, margin:'0 auto' }}>
            {t.clubs.subtitle[lang]}
          </p>

          {/* Stats strip */}
          <div className="cb-stats" style={{ marginTop:44, paddingBottom:'2.5rem' }}>
            <div className="stat-item">
              <div style={{ fontFamily:"'Russo One',sans-serif", fontSize:'clamp(28px,3vw,40px)', lineHeight:1, letterSpacing:'-1px', marginBottom:6 }}>
                {loading ? '—' : clubs.length}
              </div>
              <div style={{ fontSize:11, letterSpacing:2, color:'rgba(255,255,255,.55)', textTransform:'uppercase' }}>
                {t.clubs.count_plural[lang]}
              </div>
            </div>
            <div className="stat-item">
              <div style={{ fontFamily:"'Russo One',sans-serif", fontSize:'clamp(28px,3vw,40px)', lineHeight:1, letterSpacing:'-1px', marginBottom:6 }}>
                {loading ? '—' : statsRecruiting}
              </div>
              <div style={{ fontSize:11, letterSpacing:2, color:'rgba(255,255,255,.55)', textTransform:'uppercase' }}>
                {lang === 'fr' ? 'Clubs qui recrutent' : 'Vereine rekrutieren'}
              </div>
            </div>
            <div className="stat-item">
              <div style={{ fontFamily:"'Russo One',sans-serif", fontSize:'clamp(28px,3vw,40px)', lineHeight:1, letterSpacing:'-1px', marginBottom:6 }}>
                {loading ? '—' : statsZones}
              </div>
              <div style={{ fontSize:11, letterSpacing:2, color:'rgba(255,255,255,.55)', textTransform:'uppercase' }}>
                {lang === 'fr' ? 'Zones représentées' : 'Vertretene Zonen'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TOOLS (search + zone) ────────────────────────────────────────────── */}
      <div style={{ background:'rgba(8,20,52,.5)', borderTop:'1px solid rgba(255,255,255,.07)', borderBottom:'1px solid rgba(255,255,255,.07)', padding:'1.25rem 1.5rem' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
          <div className="cb-bar">
            <IcoSearch s={18} color="rgba(255,255,255,.4)" />
            <input
              className="cb-inp"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t.clubs.search_ph[lang]}
            />
            <button className="cb-sbtn">{lang === 'fr' ? 'Rechercher' : 'Suchen'}</button>
          </div>
          <select className="cb-zsel" value={filterZone} onChange={e => setFilterZone(e.target.value)}>
            <option value="" style={optSt}>{t.clubs.all_zones[lang]}</option>
            {ZONES.map(z => <option key={z} style={optSt}>{z}</option>)}
          </select>
        </div>
      </div>

      {/* ── CLUBS SECTION ───────────────────────────────────────────────────── */}
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'2rem 1.5rem' }}>

        {/* Results summary + sort */}
        {!loading && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem', flexWrap:'wrap', gap:10 }}>
            <span style={{ fontSize:13, color:'rgba(255,255,255,.5)', letterSpacing:.5, textTransform:'uppercase' }}>
              <span style={{ fontFamily:"'Russo One',sans-serif", color:'#fff', fontSize:16, marginRight:6 }}>{filtered.length}</span>
              {filtered.length > 1 ? t.clubs.count_plural[lang] : t.clubs.count_single[lang]}
            </span>
            <button className="cb-sort" onClick={() => setSortAsc(p => !p)}>
              <IcoSort s={13} />
              {lang === 'fr' ? `Trier : ${sortAsc ? 'A — Z' : 'Z — A'}` : `Sortieren : ${sortAsc ? 'A — Z' : 'Z — A'}`}
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign:'center', padding:'4rem', color:'rgba(255,255,255,.4)' }}>
            <div style={{ width:36, height:36, border:'3px solid rgba(255,255,255,.1)', borderTopColor:'#FF3A3A', borderRadius:'50%', animation:'spin .8s linear infinite', margin:'0 auto 1rem' }} />
            <div style={{ fontSize:14 }}>{t.clubs.loading[lang]}</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'5rem 2rem' }}>
            <div style={{ width:80, height:80, borderRadius:'50%', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.1)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}>
              <IcoStadium s={36} color="rgba(255,255,255,.3)" />
            </div>
            <h3 style={{ fontFamily:"'Russo One',sans-serif", fontSize:22, marginBottom:12 }}>{t.clubs.none_found[lang]}</h3>
            <p style={{ color:'rgba(255,255,255,.5)', maxWidth:440, margin:'0 auto 28px', lineHeight:1.65, fontSize:15 }}>{t.clubs.none_desc[lang]}</p>
            <Link href="/login" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#FF3A3A', color:'#fff', borderRadius:999, padding:'13px 28px', fontSize:14, fontWeight:600, textDecoration:'none' }}>
              {t.clubs.register[lang]}
            </Link>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'1.25rem' }}>
            {sortedFiltered.map((club, idx) => {
              const initials = club.club_name
                ? club.club_name.split(' ').map((w: string) => w[0]).join('').slice(0, 3).toUpperCase()
                : 'FC'
              const crestBg = CREST_GRADS[idx % CREST_GRADS.length]

              return (
                <div key={club.id} className="cb-card">

                  {/* Available / Recrute badge — top right */}
                  {club.available && (
                    <div style={{ position:'absolute', top:18, right:18, display:'inline-flex', alignItems:'center', gap:5, background:'#FF3A3A', color:'#fff', fontSize:10, fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', padding:'4px 10px', borderRadius:999, boxShadow:'0 4px 12px rgba(255,58,58,.4)', zIndex:1 }}>
                      <span style={{ width:5, height:5, borderRadius:'50%', background:'rgba(255,255,255,.8)', flexShrink:0 }} />
                      {t.clubs.recruits[lang]}
                    </div>
                  )}

                  {/* Blason crest */}
                  <div className="cb-crest" style={{ background: crestBg }}>
                    {club.avatar_url ? (
                      <img src={avatarSrc(club.avatar_url)!} alt={club.club_name || ''} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    ) : (
                      <>
                        <span className="cb-crest-inner" />
                        <span className="cb-crest-txt">{initials}</span>
                      </>
                    )}
                  </div>

                  {/* Name + verified */}
                  <div style={{ marginBottom:14 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:4, flexWrap:'wrap' }}>
                      <span style={{ fontFamily:"'Russo One',sans-serif", fontSize:19, letterSpacing:.3, color:'#fff', lineHeight:1.1 }}>
                        {club.club_name || 'Club'}
                      </span>
                      {(club as any).club_verification_status === 'approved' && <VerifiedBadge size={15} />}
                    </div>
                    {(club as any).club_verification_status === 'approved' && (
                      <div style={{ display:'inline-flex', alignItems:'center', gap:4, background:'rgba(46,210,127,.12)', border:'1px solid rgba(46,210,127,.3)', color:'#2ED27F', fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:999 }}>
                        <IcoCheck s={10} />
                        {lang === 'fr' ? 'Club Vérifié' : 'Verifizierter Verein'}
                      </div>
                    )}
                  </div>

                  {/* Meta rows */}
                  <div style={{ borderTop:'1px solid rgba(255,255,255,.08)', paddingTop:14, display:'flex', flexDirection:'column', gap:8, flex:1, marginBottom:12 }}>
                    {club.zone && (
                      <div className="cb-meta">
                        <IcoPin s={13} color="#FF3A3A" />
                        <span className="cb-meta-lbl">Zone</span>
                        <span className="cb-meta-val">{club.zone}</span>
                      </div>
                    )}
                    {club.ligue && (
                      <div className="cb-meta">
                        <IcoClock s={13} color="#FF3A3A" />
                        <span className="cb-meta-lbl">{lang === 'fr' ? 'Ligue' : 'Liga'}</span>
                        <span className="cb-meta-val">{club.ligue}</span>
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  {club.bio && (
                    <p style={{ fontSize:12, color:'rgba(255,255,255,.5)', lineHeight:1.55, marginBottom:14, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                      {club.bio}
                    </p>
                  )}

                  {/* CTA buttons */}
                  <div className="cb-btns" style={{ display:'flex', gap:8, marginTop:'auto' }}>
                    <Link href={`/club/${club.id}`} className="cb-btn-pri">
                      {t.clubs.view_club[lang]}
                      <span className="cb-arr"><IcoArrow s={13} /></span>
                    </Link>
                    <Link href={`/messages?partner=${club.id}`} className="cb-btn-sec">
                      <IcoMail s={13} />
                      {lang === 'fr' ? 'Contacter' : 'Kontakt'}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── CTA BAND ────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 1.5rem 5rem' }}>
        <div className="cb-ctaband">
          <div style={{ maxWidth:600 }}>
            <h2 style={{ fontFamily:"'Russo One',sans-serif", fontSize:'clamp(20px,2.5vw,30px)', lineHeight:1.1, marginBottom:10, letterSpacing:.5, textTransform:'uppercase' }}>
              {lang === 'fr' ? <>Votre club n'est pas <span style={{ color:'#FF3A3A' }}>listé ?</span></> : <>Ihr Verein ist nicht <span style={{ color:'#FF3A3A' }}>aufgeführt?</span></>}
            </h2>
            <p style={{ fontSize:15, color:'rgba(255,255,255,.6)', lineHeight:1.55 }}>
              {lang === 'fr'
                ? 'Rejoignez les clubs déjà sur TeamUpFR. Page officielle créée en quelques minutes — annonces, candidatures, visibilité maximale.'
                : 'Treten Sie den Vereinen bei, die bereits auf TeamUpFR sind. Offizielle Seite in wenigen Minuten erstellt — Inserate, Bewerbungen, maximale Sichtbarkeit.'}
            </p>
          </div>
          <Link href="/login" className="cb-ctabtn">
            {t.clubs.register[lang]}
            <IcoArrow s={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}
