'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { supabase, Profile, avatarSrc } from '../../lib/supabase'
import { useLang } from '../../lib/lang-context'
import { t } from '../../lib/translations'
import { liguesHomme, liguesFemme } from '../../lib/data'
import VerifiedBadge from '../../components/VerifiedBadge'
import { useAuth } from '../../lib/auth-context'

const ALL_LIGUE_GROUPS = [...liguesHomme, ...liguesFemme]
const ALL_LIGUES_FLAT = ALL_LIGUE_GROUPS.flatMap(g => g.items)
const ZONES = ['Fribourg-Ville','Gruyère','Broye','Glâne','Sensebezirk','Veveyse','Lac']
const POSITIONS = ['Attaquant','Milieu offensif','Milieu défensif','Défenseur central','Défenseur latéral','Gardien']

type FilterType = 'all' | 'player' | 'coach' | 'club'

// ── SVG primitives ────────────────────────────────────────────────────────────
const Svg = ({ children, size = 18, color = 'currentColor', ...p }: any) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    {children}
  </svg>
)
const IcoGrid    = ({ s = 15 }: { s?: number }) => <Svg size={s}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></Svg>
const IcoPlayer  = ({ s = 15 }: { s?: number }) => <Svg size={s}><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></Svg>
const IcoCoach   = ({ s = 15 }: { s?: number }) => <Svg size={s} strokeWidth="1.8"><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v6c0 1.5 4 4 9 4s9-2.5 9-4V7"/></Svg>
const IcoStadium = ({ s = 15 }: { s?: number }) => <Svg size={s} strokeWidth="1.8"><path d="M3 21V8l9-5 9 5v13"/><path d="M9 21V12h6v9"/></Svg>
const IcoSearch  = ({ s = 20, color = 'currentColor' }: { s?: number; color?: string }) => <Svg size={s} color={color}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></Svg>
const IcoReset   = ({ s = 13 }: { s?: number }) => <Svg size={s}><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></Svg>
const IcoCheck   = ({ s = 11 }: { s?: number }) => <Svg size={s}><polyline points="20 6 9 17 4 12"/></Svg>

export default function RecherchePage() {
  const { lang } = useLang()
  const { profile: currentUser } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [filterLigue, setFilterLigue] = useState('')
  const [filterPos, setFilterPos] = useState('')
  const [filterZone, setFilterZone] = useState('')
  const [filterDispo, setFilterDispo] = useState(false)
  const [filterGenre, setFilterGenre] = useState('')
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState(false)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('profiles')
        .select('id,email,role,first_name,last_name,position,ligue,zone,foot,available,bio,club_name,avatar_url,birthdate,genre,verified,club_verification_status')
        .neq('hidden', true)
        .or('role.neq.club,club_verification_status.eq.approved')
        .order('created_at', { ascending: false })
        .limit(500)
      if (!error && data) setProfiles(data as Profile[])
      setLoading(false)
    }
    load()
  }, [])

  const [debouncedQuery, setDebouncedQuery] = useState('')
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 200)
    return () => clearTimeout(id)
  }, [query])

  const filtered = useMemo(() => {
    const q = debouncedQuery.toLowerCase()
    return profiles.filter(p => {
      if (currentUser && p.id === currentUser.id) return false
      if (filterType !== 'all' && p.role !== filterType) return false
      if (filterDispo && !p.available) return false
      if (filterGenre && p.role !== 'club' && p.genre !== filterGenre) return false
      if (filterLigue && p.ligue !== filterLigue) return false
      if (filterPos && p.position !== filterPos) return false
      if (filterZone && p.zone !== filterZone) return false
      if (filterVerifiedOnly && p.role === 'club' && p.club_verification_status !== 'approved') return false
      if (q) {
        const name = `${p.first_name || ''} ${p.last_name || ''} ${p.club_name || ''}`.toLowerCase()
        if (!name.includes(q) && !(p.position || '').toLowerCase().includes(q) && !(p.ligue || '').toLowerCase().includes(q) && !(p.zone || '').toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [profiles, filterType, filterDispo, filterLigue, filterPos, filterZone, debouncedQuery, currentUser, filterVerifiedOnly])

  const counts = {
    all: filtered.length,
    player: filtered.filter(p => p.role === 'player').length,
    coach: filtered.filter(p => p.role === 'coach').length,
    club: filtered.filter(p => p.role === 'club').length,
  }

  const tabs = [
    ['all',    t.search.all[lang],     counts.all],
    ['player', t.search.players[lang], counts.player],
    ['coach',  t.search.coaches[lang], counts.coach],
    ['club',   t.search.clubs[lang],   counts.club],
  ] as const

  function resetFilters() {
    setQuery('')
    setFilterType('all')
    setFilterLigue('')
    setFilterPos('')
    setFilterZone('')
    setFilterDispo(false)
    setFilterGenre('')
    setFilterVerifiedOnly(false)
  }
  const hasActiveFilters = !!(query || filterType !== 'all' || filterDispo || filterLigue || filterPos || filterZone || filterGenre || filterVerifiedOnly)

  const tabIcon = (type: string) => {
    if (type === 'player') return <IcoPlayer />
    if (type === 'coach')  return <IcoCoach />
    if (type === 'club')   return <IcoStadium />
    return <IcoGrid />
  }

  const optSt = { background: '#081434' }

  return (
    <div style={{ background: '#0D1F4A', minHeight: '100vh', color: '#fff' }}>
      <style>{`
        /* Search bar */
        .sr-bar { display:flex; align-items:center; background:rgba(255,255,255,.06); border:1.5px solid rgba(255,255,255,.18); border-radius:999px; padding:8px 8px 8px 24px; transition:border-color .3s,background .3s,box-shadow .3s; max-width:800px; margin:0 auto; }
        .sr-bar:focus-within { border-color:#FF3A3A !important; background:rgba(255,255,255,.09) !important; box-shadow:0 0 0 4px rgba(255,58,58,.15) !important; }
        .sr-inp { flex:1; background:transparent; border:0; outline:0; padding:13px 16px; font-size:16px; color:#fff; font-family:inherit; }
        .sr-inp::placeholder { color:rgba(255,255,255,.4); }
        .sr-sbtn { background:#FF3A3A; color:#fff; border:none; border-radius:999px; padding:12px 24px; font-size:14px; font-weight:600; font-family:inherit; cursor:pointer; letter-spacing:.3px; transition:transform .25s,box-shadow .25s; white-space:nowrap; }
        .sr-sbtn:hover { transform:translateY(-1px); box-shadow:0 10px 24px rgba(255,58,58,.4); }
        /* Type tabs */
        .sr-tab { display:inline-flex; align-items:center; gap:7px; padding:10px 20px; border-radius:999px; border:1px solid rgba(255,255,255,.15); background:transparent; font-size:14px; font-weight:500; color:rgba(255,255,255,.7); cursor:pointer; transition:border-color .3s,background .3s,color .3s; font-family:inherit; white-space:nowrap; }
        .sr-tab:hover { border-color:rgba(255,255,255,.3); }
        .sr-tab.act { background:#fff !important; color:#0D1F4A !important; border-color:#fff !important; }
        .sr-tab.act .sr-cnt { background:#FF3A3A !important; color:#fff !important; }
        .sr-cnt { font-size:11px; background:rgba(255,255,255,.1); padding:2px 8px; border-radius:999px; color:rgba(255,255,255,.5); transition:background .3s,color .3s; }
        /* Availability toggle switch */
        .sr-tog { display:inline-flex; align-items:center; gap:10px; font-size:14px; font-weight:500; color:rgba(255,255,255,.7); cursor:pointer; user-select:none; }
        .sr-tog-track { position:relative; width:44px; height:24px; background:rgba(255,255,255,.15); border-radius:999px; transition:background .3s; flex-shrink:0; }
        .sr-tog-track::after { content:''; position:absolute; top:2px; left:2px; width:20px; height:20px; background:#fff; border-radius:50%; transition:transform .3s; }
        .sr-tog.on .sr-tog-track { background:#2ED27F; }
        .sr-tog.on .sr-tog-track::after { transform:translateX(20px); }
        /* Filter selects */
        .sr-sel { width:100%; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.12); border-radius:14px; padding:13px 40px 13px 16px; font-size:14px; font-weight:500; color:rgba(255,255,255,.9); cursor:pointer; appearance:none; -webkit-appearance:none; outline:none; font-family:inherit; background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.5)' stroke-width='2' fill='none' stroke-linecap='round'/></svg>"); background-repeat:no-repeat; background-position:right 16px center; transition:border-color .3s,background-color .3s; }
        .sr-sel:hover { border-color:rgba(255,255,255,.25); }
        .sr-sel:focus { border-color:#FF3A3A !important; background-color:rgba(255,255,255,.07) !important; outline:none; }
        .sr-lbl { display:block; font-family:'Russo One',sans-serif; font-size:10px; letter-spacing:2px; color:#FF3A3A; text-transform:uppercase; margin-bottom:8px; margin-left:2px; }
        /* Filter grid — responsive */
        .sr-fgrid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
        @media (max-width:960px)  { .sr-fgrid { grid-template-columns:repeat(2,1fr) !important; } }
        @media (max-width:520px)  { .sr-fgrid { grid-template-columns:1fr !important; } }
        /* Reset button */
        .sr-reset { font-size:13px; font-weight:500; color:rgba(255,255,255,.45); display:inline-flex; align-items:center; gap:6px; padding:5px 0; background:none; border:none; cursor:pointer; font-family:inherit; transition:color .2s; letter-spacing:.3px; }
        .sr-reset:hover { color:#fff; }
        /* Profile cards */
        .sr-card { position:relative; background:linear-gradient(180deg,rgba(255,255,255,.05) 0%,rgba(255,255,255,.02) 100%); border:1px solid rgba(255,255,255,.1); border-radius:20px; padding:24px 20px 20px; transition:transform .4s cubic-bezier(.22,1,.36,1),border-color .4s,background .4s; display:flex; flex-direction:column; }
        .sr-card:hover { transform:translateY(-6px) !important; border-color:rgba(255,58,58,.45) !important; background:linear-gradient(180deg,rgba(255,255,255,.07) 0%,rgba(255,255,255,.03) 100%) !important; }
        .sr-card:hover .sr-arr { transform:translateX(4px); }
        .sr-arr { transition:transform .3s; display:inline-flex; align-items:center; }
        /* Card CTA buttons */
        .sr-btn-pri { flex:1; background:#FF3A3A; color:#fff; border:none; border-radius:10px; padding:9px 12px; font-size:12px; font-weight:600; text-align:center; cursor:pointer; text-decoration:none; display:flex; align-items:center; justify-content:center; gap:5px; transition:transform .25s,box-shadow .25s; font-family:inherit; letter-spacing:.3px; }
        .sr-btn-pri:hover { transform:translateY(-1px); box-shadow:0 8px 20px rgba(255,58,58,.35); }
        .sr-btn-sec { flex:1; background:transparent; color:rgba(255,255,255,.75); border:1px solid rgba(255,255,255,.2); border-radius:10px; padding:9px 12px; font-size:12px; font-weight:600; text-align:center; cursor:pointer; text-decoration:none; display:flex; align-items:center; justify-content:center; gap:5px; transition:border-color .25s,color .25s,background .25s; font-family:inherit; letter-spacing:.3px; }
        .sr-btn-sec:hover { border-color:rgba(255,255,255,.4); color:#fff; background:rgba(255,255,255,.06); }
        @media (max-width:480px) { .sr-btns { flex-direction:column !important; } .sr-btn-pri,.sr-btn-sec { flex:none !important; } }
        /* Meta rows */
        .sr-meta { display:flex; align-items:center; gap:8px; font-size:12px; }
        .sr-meta-lbl { color:rgba(255,255,255,.45); font-size:11px; }
        .sr-meta-val { font-weight:500; margin-left:auto; color:rgba(255,255,255,.9); }
        /* Spinner */
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>

      {/* ── PAGE HEADER ─────────────────────────────────────────────────────── */}
      <div style={{ background:'radial-gradient(ellipse at 50% 0%,rgba(26,47,107,.9) 0%,transparent 65%),radial-gradient(ellipse at 50% 100%,rgba(255,58,58,.06) 0%,transparent 60%),#0D1F4A', padding:'2.25rem 1.5rem 2.25rem', textAlign:'center' }}>
        <div style={{ maxWidth:860, margin:'0 auto' }}>
          <span style={{ fontFamily:"'Russo One',sans-serif", fontSize:11, letterSpacing:4, color:'#FF3A3A', textTransform:'uppercase', display:'block', marginBottom:14 }}>
            {lang === 'fr' ? 'Recherche avancée' : 'Erweiterte Suche'}
          </span>
          <h1 style={{ fontFamily:"'Russo One',sans-serif", fontSize:'clamp(2rem,6vw,3.25rem)', lineHeight:.95, letterSpacing:'-.5px', textTransform:'uppercase', marginBottom:14, color:'#fff' }}>
            {t.search.title[lang]} <span style={{ color:'#FF3A3A' }}>{t.search.advanced[lang]}</span>
          </h1>
          <p style={{ color:'rgba(255,255,255,.5)', fontSize:15, fontWeight:300, lineHeight:1.6, marginBottom:'2rem', maxWidth:520, margin:'0 auto 2rem' }}>
            {t.search.subtitle[lang]}
          </p>
          <div className="sr-bar">
            <IcoSearch s={20} color="rgba(255,255,255,.4)" />
            <input
              className="sr-inp"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t.search.placeholder[lang]}
            />
            <button className="sr-sbtn">{t.search.btn[lang]}</button>
          </div>
        </div>
      </div>

      {/* ── TABS + AVAILABILITY TOGGLE ───────────────────────────────────────── */}
      <div style={{ background:'rgba(8,20,52,.65)', borderBottom:'1px solid rgba(255,255,255,.07)', padding:'.9rem 1.5rem' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {tabs.map(([type, label, count]) => (
              <button key={type} className={`sr-tab${filterType === type ? ' act' : ''}`} onClick={() => setFilterType(type as FilterType)}>
                {tabIcon(type)}
                {label}
                <span className="sr-cnt">{count}</span>
              </button>
            ))}
          </div>
          <div className={`sr-tog${filterDispo ? ' on' : ''}`} onClick={() => setFilterDispo(!filterDispo)}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:'#2ED27F', display:'inline-block', boxShadow:'0 0 0 4px rgba(46,210,127,.2)', flexShrink:0 }} />
            {t.search.available[lang]}
            <span className="sr-tog-track" />
          </div>
        </div>
      </div>

      {/* ── FILTERS GRID ─────────────────────────────────────────────────────── */}
      <div style={{ background:'rgba(8,20,52,.4)', borderBottom:'1px solid rgba(255,255,255,.07)', padding:'1.25rem 1.5rem' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div className="sr-fgrid">
            <div>
              <label className="sr-lbl">{t.search.genre_filter[lang]}</label>
              <select className="sr-sel" value={filterGenre} onChange={e => setFilterGenre(e.target.value)}>
                <option value="" style={optSt}>{t.search.all_genres[lang]}</option>
                <option value="homme" style={optSt}>{lang === 'fr' ? 'Homme' : 'Mann'}</option>
                <option value="femme" style={optSt}>{lang === 'fr' ? 'Femme' : 'Frau'}</option>
              </select>
            </div>
            <div>
              <label className="sr-lbl">{lang === 'fr' ? 'Ligue' : 'Liga'}</label>
              <select className="sr-sel" value={filterLigue} onChange={e => setFilterLigue(e.target.value)}>
                <option value="" style={optSt}>{t.search.all_ligues[lang]}</option>
                {ALL_LIGUE_GROUPS.map(g => (
                  <optgroup key={g.group} label={g.group} style={{ background:'#081434' }}>
                    {g.items.map(l => <option key={l} style={optSt}>{l}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="sr-lbl">{lang === 'fr' ? 'Position' : 'Position'}</label>
              <select className="sr-sel" value={filterPos} onChange={e => setFilterPos(e.target.value)}>
                <option value="" style={optSt}>{t.search.all_positions[lang]}</option>
                {POSITIONS.map(o => <option key={o} style={optSt}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="sr-lbl">{lang === 'fr' ? 'Zone' : 'Zone'}</label>
              <select className="sr-sel" value={filterZone} onChange={e => setFilterZone(e.target.value)}>
                <option value="" style={optSt}>{t.search.all_zones[lang]}</option>
                {ZONES.map(o => <option key={o} style={optSt}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Filter actions */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:14, flexWrap:'wrap', gap:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
              <button className="sr-reset" onClick={resetFilters}>
                <IcoReset /> {lang === 'fr' ? 'Réinitialiser les filtres' : 'Filter zurücksetzen'}
              </button>
              {filterType === 'club' && (
                <button onClick={() => setFilterVerifiedOnly(!filterVerifiedOnly)} style={{
                  border:`1px solid ${filterVerifiedOnly ? '#2ED27F' : 'rgba(255,255,255,.15)'}`,
                  background: filterVerifiedOnly ? 'rgba(46,210,127,.12)' : 'transparent',
                  color: filterVerifiedOnly ? '#2ED27F' : 'rgba(255,255,255,.55)',
                  borderRadius:999, padding:'5px 14px', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
                  display:'inline-flex', alignItems:'center', gap:6, transition:'all .2s'
                }}>
                  <IcoCheck />
                  {lang === 'fr' ? 'Clubs vérifiés' : 'Verifizierte Vereine'}
                </button>
              )}
            </div>
            <span style={{ fontSize:12, color:'rgba(255,255,255,.45)', letterSpacing:.5, textTransform:'uppercase' }}>
              <span style={{ fontFamily:"'Russo One',sans-serif", color:'#fff', fontSize:15, marginRight:5 }}>{filtered.length}</span>
              {filtered.length > 1 ? t.search.results_pl[lang] : t.search.results[lang]}
            </span>
          </div>
        </div>
      </div>

      {/* ── RESULTS ─────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'2rem 1.5rem' }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:'4rem', color:'rgba(255,255,255,.4)' }}>
            <div style={{ width:36, height:36, border:'3px solid rgba(255,255,255,.1)', borderTopColor:'#FF3A3A', borderRadius:'50%', animation:'spin .8s linear infinite', margin:'0 auto 1rem' }} />
            <div style={{ fontSize:14 }}>{t.search.loading[lang]}</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'5rem 2rem' }}>
            <div style={{ width:80, height:80, borderRadius:'50%', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.1)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}>
              <IcoSearch s={36} color="rgba(255,255,255,.3)" />
            </div>
            {profiles.length === 0 ? (
              <>
                <h3 style={{ fontFamily:"'Russo One',sans-serif", fontSize:22, marginBottom:12 }}>{t.search.empty_title[lang]}</h3>
                <p style={{ color:'rgba(255,255,255,.5)', maxWidth:440, margin:'0 auto 28px', lineHeight:1.65, fontSize:15 }}>{t.search.empty_msg[lang]}</p>
                <Link href="/login" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#FF3A3A', color:'#fff', borderRadius:999, padding:'13px 28px', fontSize:14, fontWeight:600, textDecoration:'none' }}>
                  {t.search.create_profile[lang]}
                </Link>
              </>
            ) : (
              <>
                <h3 style={{ fontFamily:"'Russo One',sans-serif", fontSize:22, marginBottom:10 }}>{t.search.no_results[lang]}</h3>
                <p style={{ color:'rgba(255,255,255,.5)', fontSize:14, marginBottom:20, lineHeight:1.65 }}>{t.search.no_filter[lang]}</p>
                {hasActiveFilters && (
                  <button className="sr-reset" style={{ margin:'0 auto' }} onClick={resetFilters}>
                    <IcoReset /> {lang === 'fr' ? 'Réinitialiser les filtres' : 'Filter zurücksetzen'}
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(275px,1fr))', gap:'1.25rem' }}>
            {filtered.map(p => <ProfileCard key={p.id} profile={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function calcAge(birthdate?: string): number | null {
  if (!birthdate) return null
  const today = new Date()
  const birth = new Date(birthdate)
  let age = today.getFullYear() - birth.getFullYear()
  if (today.getMonth() - birth.getMonth() < 0 ||
      (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--
  return age
}

function ProfileCard({ profile: p }: { profile: Profile }) {
  const { lang } = useLang()

  const name = p.role === 'club'
    ? (p.club_name || 'Club')
    : `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.email

  const initials = p.role === 'club'
    ? (p.club_name?.[0]?.toUpperCase() || 'C')
    : `${p.first_name?.[0] || ''}${p.last_name?.[0] || ''}`.toUpperCase() || '?'

  const roleLabel = p.role === 'player' ? t.search.joueur[lang] : p.role === 'coach' ? t.search.coach_label[lang] : t.search.club_label[lang]

  const stripeColor = p.role === 'player'
    ? 'linear-gradient(90deg,#1a6fd4,#5b9eff)'
    : p.role === 'coach'
    ? 'linear-gradient(90deg,#FF3A3A,#FF9A3A)'
    : 'linear-gradient(90deg,#0d7a36,#2ED27F)'

  const avatarBg = p.role === 'player'
    ? 'linear-gradient(135deg,#1a3a8a 0%,#0d1f4a 100%)'
    : p.role === 'coach'
    ? 'linear-gradient(135deg,#6a4a2a 0%,#3a2a1a 100%)'
    : 'linear-gradient(135deg,#FF3A3A 0%,#c41f1f 100%)'

  const roleBadgeStyle = p.role === 'player'
    ? { background:'rgba(255,58,58,.12)', color:'#FF3A3A', border:'1px solid rgba(255,58,58,.3)' }
    : p.role === 'coach'
    ? { background:'rgba(255,154,90,.12)', color:'#FF9A3A', border:'1px solid rgba(255,154,90,.3)' }
    : { background:'rgba(91,158,255,.12)', color:'#5b9eff', border:'1px solid rgba(91,158,255,.3)' }

  const age = calcAge(p.birthdate)
  const ageSuffix = t.general.age_suffix[lang]
  const subLine = [p.role !== 'club' ? (p.position || roleLabel) : null, age ? `${age}${ageSuffix}` : null].filter(Boolean).join(' · ')

  return (
    <div className="sr-card">
      {/* Top role-color stripe */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:stripeColor, borderRadius:'20px 20px 0 0' }} />

      {/* Avatar + role badge */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
        <div style={{ width:56, height:56, borderRadius:'50%', background:avatarBg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Russo One',sans-serif", fontSize:17, color:'#fff', flexShrink:0, overflow:'hidden', position:'relative' }}>
          {p.avatar_url
            ? <img src={avatarSrc(p.avatar_url)!} alt={name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            : initials
          }
          {p.available && (
            <span style={{ position:'absolute', bottom:2, right:2, width:14, height:14, background:'#2ED27F', borderRadius:'50%', border:'3px solid #0D1F4A' }} />
          )}
        </div>
        <span style={{ ...roleBadgeStyle, fontSize:10, fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', padding:'5px 10px', borderRadius:999, whiteSpace:'nowrap' }}>
          {roleLabel}
        </span>
      </div>

      {/* Name + verified badges */}
      <div style={{ marginBottom:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:3, flexWrap:'wrap' }}>
          <span style={{ fontFamily:"'Russo One',sans-serif", fontSize:17, letterSpacing:.3, color:'#fff', lineHeight:1.2 }}>{name}</span>
          {p.role === 'club' && p.club_verification_status === 'approved'
            ? <VerifiedBadge size={15} />
            : p.verified && <VerifiedBadge size={15} />}
        </div>
        {p.role === 'club' && p.club_verification_status === 'approved' && (
          <div style={{ display:'inline-flex', alignItems:'center', gap:4, background:'rgba(46,210,127,.12)', border:'1px solid rgba(46,210,127,.3)', color:'#2ED27F', fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:999, marginBottom:4 }}>
            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            {lang === 'fr' ? 'Club Vérifié' : 'Verifizierter Verein'}
          </div>
        )}
        {subLine && <p style={{ fontSize:13, color:'rgba(255,255,255,.5)', marginTop:2 }}>{subLine}</p>}
      </div>

      {/* Meta rows: ligue / zone / foot */}
      <div style={{ borderTop:'1px solid rgba(255,255,255,.08)', paddingTop:12, marginBottom:12, display:'flex', flexDirection:'column', gap:7, flex:1 }}>
        {p.ligue && (
          <div className="sr-meta">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#FF3A3A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            <span className="sr-meta-lbl">{lang === 'fr' ? 'Ligue' : 'Liga'}</span>
            <span className="sr-meta-val">{p.ligue}</span>
          </div>
        )}
        {p.zone && (
          <div className="sr-meta">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#FF3A3A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span className="sr-meta-lbl">Zone</span>
            <span className="sr-meta-val">{p.zone}</span>
          </div>
        )}
        {p.foot && (
          <div className="sr-meta">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#FF3A3A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            <span className="sr-meta-lbl">{lang === 'fr' ? 'Pied' : 'Fuss'}</span>
            <span className="sr-meta-val">{p.foot}</span>
          </div>
        )}
      </div>

      {/* Bio */}
      {p.bio && (
        <p style={{ fontSize:12, color:'rgba(255,255,255,.5)', lineHeight:1.55, marginBottom:12, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
          {p.bio}
        </p>
      )}

      {/* Unavailable indicator (available shown as dot on avatar) */}
      {!p.available && (
        <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:'rgba(255,255,255,.05)', color:'rgba(255,255,255,.4)', borderRadius:999, padding:'3px 10px', fontSize:11, fontWeight:500, marginBottom:12, alignSelf:'flex-start' }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:'rgba(255,255,255,.2)', flexShrink:0 }} />
          {t.search.indispo[lang]}
        </div>
      )}

      {/* CTA buttons */}
      <div className="sr-btns" style={{ display:'flex', gap:8, marginTop:'auto' }}>
        <Link href="/profil" className="sr-btn-pri">
          {t.search.profile[lang]}
          <span className="sr-arr">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </span>
        </Link>
        <Link href={`/messages?partner=${p.id}`} className="sr-btn-sec">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          {t.search.contact[lang]}
        </Link>
      </div>
    </div>
  )
}
