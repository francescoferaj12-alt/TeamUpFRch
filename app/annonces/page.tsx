'use client'

import { directoryQueries } from '../../lib/directory-search'
import { footballLabel } from '../../lib/football-labels'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, Annonce, Profile, avatarSrc } from '../../lib/supabase'
import { ligues, zones, positions } from '../../lib/data'
import { useLang } from '../../lib/lang-context'
import { useAuth } from '../../lib/auth-context'
import VerifiedBadge from '../../components/VerifiedBadge'
import ClubCrest from '../../components/ClubCrest'
import { relativeTime } from '../../lib/utils/time'
import SavedAnnonceSearches from '../../components/SavedAnnonceSearches'
import PostModal from '../../components/PostModal'

// ——— SVG helpers ————————————————————————————
const Svg = ({ children, size = 18, color = 'currentColor', ...p }: any) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    {children}
  </svg>
)
const IcoGrid    = ({ s = 16 }: { s?: number }) => (
  <Svg size={s}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></Svg>
)
const IcoBuilding = ({ s = 16 }: { s?: number }) => (
  <Svg size={s}><path d="M3 21V8l9-5 9 5v13"/><path d="M9 21V12h6v9"/></Svg>
)
const IcoCoach   = ({ s = 16 }: { s?: number }) => (
  <Svg size={s}><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v6c0 1.5 4 4 9 4s9-2.5 9-4V7"/></Svg>
)
const IcoPlayer  = ({ s = 16 }: { s?: number }) => (
  <Svg size={s}><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></Svg>
)
const IcoSearch  = ({ s = 18 }: { s?: number }) => (
  <Svg size={s}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></Svg>
)
const IcoPlus    = ({ s = 16 }: { s?: number }) => <Svg size={s}><path d="M12 5v14M5 12h14"/></Svg>
const IcoStar    = ({ s = 10, color = 'currentColor' }: { s?: number; color?: string }) => (
  <Svg size={s} color={color}><polygon points="12 2 15 8 22 9 17 14 18 21 12 18 6 21 7 14 2 9 9 8 12 2"/></Svg>
)
const IcoClock   = ({ s = 10, color = 'currentColor' }: { s?: number; color?: string }) => (
  <Svg size={s} color={color}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></Svg>
)
const IcoPin     = ({ s = 10, color = 'currentColor' }: { s?: number; color?: string }) => (
  <Svg size={s} color={color}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></Svg>
)
const IcoArrow   = ({ s = 14 }: { s?: number }) => <Svg size={s}><path d="M5 12h14M12 5l7 7-7 7"/></Svg>
const IcoMsg     = ({ s = 14 }: { s?: number }) => (
  <Svg size={s}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></Svg>
)
const IcoSend    = ({ s = 16 }: { s?: number }) => (
  <Svg size={s}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></Svg>
)
const IcoCheck   = ({ s = 32 }: { s?: number }) => (
  <Svg size={s}><polyline points="20 6 9 17 4 12"/></Svg>
)
const IcoEmpty   = ({ s = 36 }: { s?: number }) => (
  <Svg size={s} strokeWidth="1.5"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 9h16M9 4v16"/></Svg>
)

// ——— Avatar gradients ————————————————————————
const GRADS = [
  'linear-gradient(135deg,#FF3A3A 0%,#c41f1f 100%)',
  'linear-gradient(135deg,#1a3a8a 0%,#0d1f4a 100%)',
  'linear-gradient(135deg,#2ED27F 0%,#1a8a52 100%)',
  'linear-gradient(135deg,#ff9a3a 0%,#c4651f 100%)',
  'linear-gradient(135deg,#3a7aff 0%,#1f4ac4 100%)',
  'linear-gradient(135deg,#FFC93A 0%,#c4951f 100%)',
]

// ——— Type badge config ————————————————————————
const TYPE_CFG: Record<string, { label: { fr: string; de: string }; color: string; bg: string; border: string }> = {
  club:   { label: { fr: 'Club recrute', de: 'Verein sucht Verstärkung' },  color: '#3A7AFF', bg: 'rgba(58,122,255,.12)',  border: 'rgba(58,122,255,.3)'  },
  coach:  { label: { fr: 'Coach dispo', de: 'Trainer verfügbar' },   color: '#FF9A3A', bg: 'rgba(255,154,58,.12)',  border: 'rgba(255,154,58,.3)'  },
  player: { label: { fr: 'Joueur dispo', de: 'Spieler verfügbar' },  color: '#2ED27F', bg: 'rgba(46,210,127,.12)', border: 'rgba(46,210,127,.3)' },
}

// ——— Tab config ——————————————————————————————
const TABS = [
  { key: '',       label: { fr: 'Tous', de: 'Alle' },     Icon: IcoGrid    },
  { key: 'club',   label: { fr: 'Clubs', de: 'Vereine' },    Icon: IcoBuilding },
  { key: 'coach',  label: { fr: 'Coachs', de: 'Trainer' },   Icon: IcoCoach   },
  { key: 'player', label: { fr: 'Joueurs', de: 'Spieler' },  Icon: IcoPlayer  },
] as const

// ——— Main page ————————————————————————————————
export default function AnnoncesPage() {
  const { lang } = useLang()
  const [directory,setDirectory]=useState<{items:Annonce[];total:number;counts:Record<string,number>}>({items:[],total:0,counts:{'':0,club:0,coach:0,player:0}})
  const [pageState,setPageState]=useState({key:'',page:0})
  const [loadError,setLoadError]=useState(false)
  const [retry,setRetry]=useState(0)
  const [debouncedQuery,setDebouncedQuery]=useState('')
  const [loading, setLoading]       = useState(true)
  const [filterLigue, setFilterLigue] = useState('')
  const [filterZone, setFilterZone]   = useState('')
  const [filterPos, setFilterPos]     = useState('')
  const [filterType, setFilterType]   = useState('')
  const [query, setQuery]             = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [postulerModal, setPostulerModal] = useState<Annonce | null>(null)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const router = useRouter()
  const { profile: currentUser } = useAuth()

  useEffect(()=>{const timer=setTimeout(()=>setDebouncedQuery(query),250);return()=>clearTimeout(timer)},[query])
  const filterKey=JSON.stringify({queries:directoryQueries(debouncedQuery,lang,[...ligues.flatMap(group=>group.items),...positions,...zones]),ligue:filterLigue,zone:filterZone,position:filterPos,author_type:filterType})
  const page=pageState.key===filterKey?pageState.page:0
  useEffect(()=>{
    let active=true;setLoading(true);setLoadError(false)
    supabase.rpc('browse_annonces',{p_filters:JSON.parse(filterKey),p_page:page,p_size:24}).then(({data,error})=>{
      if(!active)return
      setLoading(false);setLoadError(!!error)
      if(!error&&data)setDirectory(data)
    })
    return()=>{active=false}
  },[filterKey,page,retry])
  const annonces=directory.items
  const filtered=annonces
  const total=directory.total
  const typeCounts=directory.counts

  const hasFilters = !!(filterLigue || filterZone || filterPos || filterType || query)

  function resetFilters() {
    setFilterLigue(''); setFilterZone(''); setFilterPos(''); setFilterType(''); setQuery('')
  }

  // ——— Render —————————————————————————————————
  return (
    <div className={`an-page${currentUser ? ' an-feed' : ''}`}>

      {/* PAGE HEADER */}
      <header className="an-header">
        <div className="an-container">
          <div className="an-eyebrow">
            <IcoGrid s={14} />
            {lang === 'de' ? 'Anzeigenübersicht' : "Fil d'annonces"}
          </div>
          <span className="an-live-pulse">{lang === 'de' ? 'Aktuell' : 'En direct'}</span>
          <h1 className="an-title">
            {currentUser
              ? (lang === 'de' ? <>Fussball <span className="em">aktuell.</span></> : <>Le fil <span className="em">du foot.</span></>)
              : <>{lang === 'de' ? 'Angebote &' : 'Offres &'}<br /><span className="em">{lang === 'de' ? 'Gesuche.' : 'Recherches.'}</span></>}
          </h1>
          <p className="an-sub">
            {lang === 'de' ? 'Vereine, Spieler und Trainer: alle Angebote und Gesuche an einem Ort.' : 'Clubs, joueurs et coachs : toutes les opportunités, au même endroit.'}
          </p>
          {currentUser && <div className="an-feed-shortcuts">
            <Link href="/clubs" className="an-shortcut-clubs">{lang === 'de' ? 'Vereine' : 'Clubs'}</Link>
            <Link href="/candidatures">{lang === 'de' ? 'Bewerbungen' : 'Candidatures'}</Link>
            <Link href="/dashboard">{lang === 'de' ? 'Mein Überblick' : 'Mon tableau de bord'}</Link>
            <Link href="/publier" className="an-feed-post"><IcoPlus />{lang === 'de' ? 'Anzeige erstellen' : 'Publier une annonce'}</Link>
          </div>}
          <div className="an-search-wrap">
            <IcoSearch s={18} />
            <input
              className="an-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              maxLength={120}
              placeholder={lang === 'de' ? 'Anzeige, Verein oder Position suchen…' : 'Chercher une annonce, un club, une position…'}
            />
          </div>
        </div>
      </header>

      {/* FILTERS */}
      <div className="an-filters">
        <div className="an-container">

          {/* Type tabs */}
          <div className="an-tabs-row" role="tablist">
            {TABS.map(({ key, label, Icon }) => (
              <button
                key={key}
                role="tab"
                aria-selected={filterType === key}
                onClick={() => setFilterType(key)}
                className={`an-tab${filterType === key ? ' act' : ''}`}
              >
                <Icon s={16} />
                {label[lang]}
                <span className="an-tab-count">{typeCounts[key as keyof typeof typeCounts] ?? 0}</span>
              </button>
            ))}
          </div>

          <button className="an-filter-toggle" type="button" aria-expanded={filtersOpen} aria-controls="annonce-filters" onClick={() => setFiltersOpen(open => !open)}>
            {lang === 'de' ? 'Filter & Suchaufträge' : 'Filtres et alertes'} {filtersOpen ? '−' : '+'}
          </button>
          <div id="annonce-filters" hidden={!filtersOpen}>
          {/* Dropdowns + Publish */}
          <div className="an-filters-grid">
            <select className="an-select" value={filterLigue} onChange={(e) => setFilterLigue(e.target.value)} aria-label={lang === 'de' ? 'Liga' : 'Ligue'}>
              <option value="">{lang === 'de' ? 'Alle Ligen' : 'Toutes les ligues'}</option>
              {ligues.flatMap((g) => g.items).map((l) => <option key={l} value={l}>{footballLabel(l, lang)}</option>)}
            </select>
            <select className="an-select" value={filterPos} onChange={(e) => setFilterPos(e.target.value)} aria-label="Position">
              <option value="">{lang === 'de' ? 'Alle Positionen' : 'Toutes positions'}</option>
              {positions.map((p) => <option key={p} value={p}>{footballLabel(p, lang)}</option>)}
            </select>
            <select className="an-select" value={filterZone} onChange={(e) => setFilterZone(e.target.value)} aria-label={lang === 'de' ? 'Region' : 'Zone'}>
              <option value="">{lang === 'de' ? 'Alle Regionen' : 'Toute la zone'}</option>
              {zones.map((z) => <option key={z} value={z}>{footballLabel(z, lang)}</option>)}
            </select>
            {currentUser ? (
              <button className="an-publish-btn" onClick={() => setShowPublishModal(true)}>
                <IcoPlus s={16} />{lang === 'de' ? 'Anzeige veröffentlichen' : 'Publier une annonce'}
              </button>
            ) : (
              <Link href="/login" className="an-publish-btn">
                <IcoPlus s={16} />{lang === 'de' ? 'Anzeige veröffentlichen' : 'Publier une annonce'}
              </Link>
            )}
          </div>

          {currentUser && (
            <SavedAnnonceSearches
              key={currentUser.id}
              userId={currentUser.id}
              filters={{ query, ligue: filterLigue, zone: filterZone, position: filterPos, author_type: filterType }}
              apply={search => {
                setQuery(search.query)
                setFilterLigue(search.ligue)
                setFilterZone(search.zone)
                setFilterPos(search.position)
                setFilterType(search.author_type)
              }}
            />
          )}

          </div>

          {/* Results bar */}
          <div className="an-results-bar">
            <span>
              <span className="an-results-num">{loading ? '—' : total}</span>
              {' '}{lang === 'de' ? (total === 1 ? 'Anzeige gefunden' : 'Anzeigen gefunden') : (total === 1 ? 'annonce affichée' : 'annonces affichées')}
            </span>
            {hasFilters && (
              <button className="an-reset" onClick={resetFilters}>
                {lang === 'de' ? 'Filter zurücksetzen' : 'Réinitialiser les filtres'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* GRID */}
      <section className="an-grid-section">
        <div className="an-container">
          {loadError ? <div className="an-empty" role="alert"><p>{lang==='de'?'Anzeigen konnten nicht geladen werden.':'Impossible de charger les annonces.'}</p><button onClick={()=>setRetry(n=>n+1)}>{lang==='de'?'Erneut versuchen':'Réessayer'}</button></div> : loading ? (
            <div className="an-loading">
              <div className="an-spinner" />
              {lang === 'de' ? 'Anzeigen werden geladen…' : 'Chargement des annonces…'}
            </div>
          ) : filtered.length === 0 ? (
            <div className="an-empty">
              <div className="an-empty-icon"><IcoEmpty s={36} /></div>
              {!hasFilters ? (
                <>
                  <h3 className="an-empty-title">{lang === 'de' ? 'Noch keine Anzeigen' : 'Aucune annonce publiée'}</h3>
                  <p className="an-empty-sub">{lang === 'de' ? 'Veröffentliche die erste Anzeige.' : 'Sois le premier à publier une annonce.'}</p>
                </>
              ) : (
                <>
                  <h3 className="an-empty-title">{lang === 'de' ? 'Keine Treffer' : 'Aucun résultat'}</h3>
                  <p className="an-empty-sub">{lang === 'de' ? 'Keine Anzeige passt zu diesen Kriterien. Erweitere deine Suche.' : 'Aucune annonce ne correspond à ces critères. Élargis ta recherche.'}</p>
                </>
              )}
            </div>
          ) : (
            <div className="an-grid">
              {filtered.map((a) => (
                <AnnonceCard
                  key={a.id}
                  annonce={a}
                  currentUser={currentUser}
                  onPostuler={() => {
                    if (!currentUser) { router.push('/login'); return }
                    setPostulerModal(a)
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {!loading&&!loadError&&total>24&&<nav aria-label={lang==='de'?'Anzeigenseiten':'Pages des annonces'} style={{display:'flex',justifyContent:'center',alignItems:'center',gap:20,padding:'0 16px 32px'}}>
        <button disabled={page===0} onClick={()=>setPageState({key:filterKey,page:page-1})}>{lang==='de'?'Zurück':'Précédent'}</button>
        <span>{page+1} / {Math.ceil(total/24)}</span>
        <button disabled={(page+1)*24>=total} onClick={()=>setPageState({key:filterKey,page:page+1})}>{lang==='de'?'Weiter':'Suivant'}</button>
      </nav>}
      {/* POSTULER MODAL */}
      {postulerModal && (
        <PostulerModal
          annonce={postulerModal}
          currentUser={currentUser!}
          onClose={() => setPostulerModal(null)}
          onSuccess={() => setPostulerModal(null)}
        />
      )}

      {/* PUBLISH MODAL */}
      {showPublishModal && currentUser && (
        <PostModal
          profile={currentUser}
          onClose={() => setShowPublishModal(false)}
          onSuccess={() => { setPageState({key:filterKey,page:0});setRetry(n=>n+1);setShowPublishModal(false) }}
        />
      )}

      <style>{`
        @keyframes spin        { to { transform:rotate(360deg); } }
        @keyframes anPulse     { 0%,100%{opacity:1;box-shadow:0 0 0 4px rgba(46,210,127,.2)} 50%{opacity:.6;box-shadow:0 0 0 8px rgba(46,210,127,.04)} }
        @keyframes anCardGlow  { 0%,100%{opacity:0} 50%{opacity:1} }

        .an-page {
          background:
            radial-gradient(ellipse at top,#1a2f6b 0%,transparent 60%),
            radial-gradient(ellipse at bottom,rgba(255,58,58,.06) 0%,transparent 60%),
            #0D1F4A;
          min-height:100vh; color:#fff;
          font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;
          -webkit-font-smoothing:antialiased;
        }
        .an-container { max-width:1200px; margin:0 auto; padding:0 32px; }

        /* ——— Header ——— */
        .an-header {
          padding:140px 0 56px;
          text-align:center; position:relative;
        }
        .an-feed .an-header { padding:32px 0 24px; }
        .an-feed .an-title { font-size:clamp(30px,4.5vw,52px); line-height:1.15; margin-bottom:12px; }
        .an-feed .an-eyebrow, .an-feed .an-live-pulse { margin-bottom:14px; }
        .an-feed .an-sub { margin-bottom:16px; font-weight:400; color:#c7d1e3; }
        .an-feed-shortcuts { display:flex; flex-wrap:wrap; justify-content:center; align-items:center; gap:10px 18px; margin-bottom:20px; }
        .an-feed-shortcuts a { color:#c7d1e3; font-size:13px; text-decoration:none; padding:6px 0; }
        .an-feed-shortcuts .an-feed-post { display:inline-flex; align-items:center; gap:6px; background:#FF3A3A; padding:9px 14px; color:white; border-radius:9px; font-weight:700; }
        .an-filter-toggle { display:flex; align-items:center; justify-content:space-between; width:100%; background:transparent; border:1px solid rgba(255,255,255,.15); border-radius:10px; padding:10px 14px; margin-bottom:12px; color:#c7d1e3; font:inherit; font-size:13px; cursor:pointer; }
        .an-header::before {
          content:''; position:absolute;
          top:0; left:50%; transform:translateX(-50%);
          width:80%; max-width:900px; height:380px;
          background:radial-gradient(ellipse at center,rgba(255,58,58,.12) 0%,transparent 60%);
          pointer-events:none;
        }
        .an-header .an-container { position:relative; z-index:1; }

        .an-eyebrow {
          display:inline-flex; align-items:center; gap:8px;
          font-family:'Russo One',sans-serif;
          font-size:11px; letter-spacing:4px; color:#FF3A3A; text-transform:uppercase;
          margin-bottom:20px;
        }

        .an-live-pulse {
          display:inline-flex; align-items:center; gap:6px;
          font-size:11px; font-weight:600; letter-spacing:2px; text-transform:uppercase;
          padding:4px 12px; border-radius:999px;
          background:rgba(46,210,127,.12); border:1px solid rgba(46,210,127,.3); color:#2ED27F;
          margin-bottom:20px; margin-left:12px;
        }
        .an-live-pulse::before {
          content:''; width:6px; height:6px; border-radius:50%;
          background:#2ED27F; box-shadow:0 0 0 4px rgba(46,210,127,.2);
          animation:anPulse 2s ease-in-out infinite;
        }

        .an-title {
          font-family:'Russo One',sans-serif;
          font-size:clamp(48px,8vw,96px); line-height:.9;
          letter-spacing:-1px; text-transform:uppercase;
          margin:0 0 20px;
        }
        .an-title .em { color:#FF3A3A; }

        .an-sub {
          font-size:clamp(15px,1.4vw,18px); font-weight:300; color:rgba(255,255,255,.6);
          max-width:560px; margin:0 auto 40px; line-height:1.6;
        }

        .an-search-wrap {
          position:relative; max-width:600px; margin:0 auto;
          display:flex; align-items:center;
        }
        .an-search-wrap svg {
          position:absolute; left:18px; color:rgba(255,255,255,.4); pointer-events:none;
        }
        .an-search {
          width:100%; background:rgba(255,255,255,.07);
          border:1.5px solid rgba(255,255,255,.12); border-radius:12px;
          color:#fff; padding:14px 20px 14px 50px;
          font-size:15px; outline:none; font-family:inherit;
          transition:border-color .3s,background .3s;
        }
        .an-search:focus { border-color:rgba(255,58,58,.5); background:rgba(255,255,255,.09); }
        .an-search::placeholder { color:rgba(255,255,255,.35); }

        /* ——— Filters ——— */
        .an-filters {
          background:rgba(13,31,74,.6); border-bottom:1px solid rgba(255,255,255,.1);
          padding:24px 0;
          backdrop-filter:blur(10px);
        }

        .an-tabs-row {
          display:flex; flex-wrap:wrap; gap:8px; margin-bottom:16px;
        }
        .an-tab {
          display:inline-flex; align-items:center; gap:8px;
          padding:10px 20px; border-radius:999px;
          border:1px solid rgba(255,255,255,.12); background:transparent;
          font-size:14px; font-weight:500; color:rgba(255,255,255,.92);
          cursor:pointer; transition:border-color .3s,background .3s,color .3s;
          font-family:inherit;
        }
        .an-tab:hover { border-color:rgba(255,255,255,.3); }
        .an-tab.act { background:#fff; color:#0D1F4A; border-color:#fff; }
        .an-tab-count {
          font-family:'Russo One',sans-serif;
          font-size:11px; background:rgba(255,255,255,.1); padding:2px 8px;
          border-radius:999px; color:rgba(255,255,255,.7);
          transition:background .3s,color .3s;
        }
        .an-tab.act .an-tab-count { background:#FF3A3A; color:#fff; }

        .an-filters-grid {
          display:grid; grid-template-columns:repeat(3,1fr) auto;
          gap:12px; align-items:center;
        }
        .an-select {
          width:100%; background:rgba(255,255,255,.05);
          border:1px solid rgba(255,255,255,.12); border-radius:12px;
          padding:13px 42px 13px 18px;
          font-size:14px; font-weight:500; color:rgba(255,255,255,.92);
          cursor:pointer; outline:none; font-family:inherit;
          appearance:none; -webkit-appearance:none;
          background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.5)' stroke-width='1.8' fill='none' stroke-linecap='round'/></svg>");
          background-repeat:no-repeat; background-position:right 16px center;
          transition:border-color .3s,background .3s;
        }
        .an-select:hover  { border-color:rgba(255,255,255,.25); }
        .an-select:focus  { border-color:#FF3A3A; background-color:rgba(255,255,255,.07); }
        .an-select option { background:#081434; color:#fff; }

        .an-publish-btn {
          display:inline-flex; align-items:center; gap:8px;
          background:#FF3A3A; color:#fff;
          padding:13px 22px; border-radius:12px;
          font-size:14px; font-weight:600; letter-spacing:.3px;
          text-decoration:none; white-space:nowrap; border:none; cursor:pointer;
          font-family:inherit;
          transition:transform .3s,box-shadow .3s;
        }
        .an-publish-btn:hover { transform:translateY(-1px); box-shadow:0 10px 24px rgba(255,58,58,.4); }

        .an-results-bar {
          display:flex; justify-content:space-between; align-items:center;
          margin-top:20px; padding-top:16px; border-top:1px solid rgba(255,255,255,.08);
          font-size:13px; letter-spacing:.5px; color:rgba(255,255,255,.6);
        }
        .an-results-num { font-family:'Russo One',sans-serif; color:#fff; font-size:16px; margin-right:4px; }
        .an-reset {
          background:none; border:none; cursor:pointer;
          color:#FF3A3A; font-size:12px; font-weight:600;
          font-family:inherit; padding:4px 10px; border-radius:6px;
          transition:background .3s;
        }
        .an-reset:hover { background:rgba(255,58,58,.1); }

        /* ——— Grid section ——— */
        .an-grid-section { padding:40px 0 80px; }
        .an-grid {
          display:grid; grid-template-columns:repeat(3,1fr); gap:20px;
        }

        /* ——— Loading ——— */
        .an-loading {
          display:flex; flex-direction:column; align-items:center; gap:16px;
          padding:80px 0; color:rgba(255,255,255,.4); font-size:15px;
        }
        .an-spinner {
          width:40px; height:40px;
          border:4px solid rgba(255,255,255,.1); border-top-color:#FF3A3A;
          border-radius:50%; animation:spin .8s linear infinite;
        }

        /* ——— Empty state ——— */
        .an-empty {
          text-align:center; padding:80px 32px;
          border:1px dashed rgba(255,255,255,.12); border-radius:20px; margin-top:8px;
        }
        .an-empty-icon {
          width:80px; height:80px; border-radius:50%;
          background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1);
          display:flex; align-items:center; justify-content:center;
          margin:0 auto 24px; color:rgba(255,255,255,.4);
        }
        .an-empty-title {
          font-family:'Russo One',sans-serif; font-size:22px; margin-bottom:10px;
        }
        .an-empty-sub { color:rgba(255,255,255,.5); max-width:400px; margin:0 auto; font-size:14px; }

        /* ——— Ann Card ——— */
        .an-card {
          position:relative;
          background:linear-gradient(180deg,rgba(255,255,255,.04) 0%,rgba(255,255,255,.01) 100%);
          border:1px solid rgba(255,255,255,.12); border-radius:20px;
          padding:24px; display:flex; flex-direction:column;
          transition:transform .5s cubic-bezier(.22,1,.36,1),border-color .5s,background .5s;
        }
        .an-card:hover {
          transform:translateY(-4px);
          border-color:rgba(255,58,58,.4);
          background:linear-gradient(180deg,rgba(255,255,255,.06) 0%,rgba(255,255,255,.02) 100%);
        }

        .an-card-header {
          display:flex; align-items:center; justify-content:space-between;
          margin-bottom:18px;
        }
        .an-type-badge {
          display:inline-flex; align-items:center; gap:6px;
          font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase;
          padding:5px 10px; border-radius:999px;
        }
        .an-timestamp {
          font-size:11px; color:rgba(255,255,255,.6); letter-spacing:.5px;
          display:inline-flex; align-items:center; gap:5px;
        }
        .an-timestamp::before {
          content:''; width:4px; height:4px; background:rgba(255,255,255,.6); border-radius:50%;
        }
        .an-timestamp.recent::before { background:#2ED27F; }

        .an-author {
          display:flex; align-items:center; gap:12px;
          margin-bottom:16px; text-decoration:none; color:inherit;
        }
        .an-avatar {
          width:40px; height:40px; border-radius:8px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
          font-family:'Russo One',sans-serif; font-size:13px; color:#fff;
          overflow:hidden; position:relative;
        }
        .an-avatar img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
        .an-avatar span { position:relative; z-index:1; }
        .an-author-info { flex:1; min-width:0; }
        .an-author-name {
          font-weight:600; font-size:14px; color:#fff;
          display:flex; align-items:center; gap:5px;
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .an-author-sub {
          font-size:12px; color:rgba(255,255,255,.6);
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
          margin-top:2px;
        }

        .an-card-title {
          font-family:'Russo One',sans-serif;
          font-size:17px; line-height:1.25; letter-spacing:.2px;
          margin-bottom:10px;
        }
        .an-card-body {
          font-size:13px; color:rgba(255,255,255,.75); line-height:1.55;
          margin-bottom:18px; flex:1;
          display:-webkit-box; -webkit-line-clamp:3;
          -webkit-box-orient:vertical; overflow:hidden;
        }

        .an-tags { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:18px; }
        .an-tag {
          display:inline-flex; align-items:center; gap:5px;
          font-size:11px; font-weight:500; color:rgba(255,255,255,.85);
          padding:5px 10px; border-radius:999px;
          background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1);
        }

        .an-card-actions {
          display:flex; align-items:center; justify-content:space-between;
          padding-top:16px; border-top:1px solid rgba(255,255,255,.1);
          gap:8px;
        }
        .an-card-btns { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
        .an-btn-pri {
          display:inline-flex; align-items:center; gap:6px;
          background:#FF3A3A; color:#fff;
          padding:8px 16px; border-radius:8px;
          font-size:13px; font-weight:700; letter-spacing:.3px;
          text-decoration:none; border:none; cursor:pointer; font-family:inherit;
          transition:transform .3s,box-shadow .3s;
          white-space:nowrap;
        }
        .an-btn-pri:hover { transform:translateY(-1px); box-shadow:0 8px 20px rgba(255,58,58,.4); }
        .an-btn-author {
          display:inline-flex; align-items:center; gap:5px;
          font-size:12px; font-weight:600; color:rgba(255,255,255,.45);
          text-decoration:none; transition:color .3s;
        }
        .an-btn-author:hover { color:rgba(255,255,255,.8); }
        .an-btn-msg {
          display:inline-flex; align-items:center; gap:5px;
          font-size:12px; font-weight:600;
          color:rgba(255,255,255,.6); text-decoration:none;
          padding:5px 12px; border-radius:8px;
          background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1);
          transition:color .3s,background .3s;
        }
        .an-btn-msg:hover { color:#fff; background:rgba(255,255,255,.1); }
        .an-view-profile {
          font-size:11px; font-weight:600; color:rgba(255,255,255,.4);
          text-decoration:none; letter-spacing:.5px;
          transition:color .3s;
        }
        .an-view-profile:hover { color:#fff; }

        /* ——— Modal ——— */
        .an-modal-overlay {
          position:fixed; inset:0; background:rgba(0,0,0,.75);
          backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);
          z-index:1000; display:flex; align-items:center;
          justify-content:center; padding:1rem;
        }
        .an-modal {
          background:linear-gradient(180deg,#142659 0%,#0d1f4a 100%);
          border:1px solid rgba(255,255,255,.12); border-radius:20px;
          padding:2rem; max-width:500px; width:100%;
          box-shadow:0 20px 60px rgba(0,0,0,.5); color:#fff;
        }
        .an-modal-title {
          font-family:'Russo One',sans-serif; font-size:1.4rem;
          letter-spacing:.5px; margin-bottom:.25rem;
        }
        .an-modal-ann {
          font-size:13px; color:rgba(255,255,255,.45); margin-bottom:1.5rem;
        }
        .an-modal-label {
          display:block; font-size:13px; font-weight:600;
          color:rgba(255,255,255,.6); margin-bottom:8px; letter-spacing:.3px;
        }
        .an-modal-textarea {
          width:100%; background:rgba(255,255,255,.07);
          border:1.5px solid rgba(255,255,255,.12); border-radius:10px;
          color:#fff; padding:12px 16px; font-size:14px; outline:none;
          font-family:inherit; resize:vertical; box-sizing:border-box;
          margin-bottom:1rem; transition:border-color .3s;
        }
        .an-modal-textarea:focus { border-color:rgba(255,58,58,.5); }
        .an-modal-textarea::placeholder { color:rgba(255,255,255,.3); }
        .an-modal-error { color:#FF3A3A; font-size:13px; margin-bottom:.75rem; }
        .an-modal-btns { display:flex; gap:8px; }
        .an-modal-submit {
          flex:1; background:#FF3A3A; color:#fff; border:none; border-radius:10px;
          padding:12px; font-size:14px; font-weight:700; cursor:pointer;
          font-family:inherit; display:inline-flex; align-items:center; justify-content:center; gap:8px;
          transition:opacity .3s,transform .3s;
        }
        .an-modal-submit:disabled { opacity:.6; cursor:not-allowed; }
        .an-modal-submit:not(:disabled):hover { transform:translateY(-1px); }
        .an-modal-cancel {
          background:rgba(255,255,255,.07); color:rgba(255,255,255,.7);
          border:1px solid rgba(255,255,255,.12); border-radius:10px;
          padding:12px 20px; font-size:14px; font-weight:600;
          cursor:pointer; font-family:inherit; transition:background .3s;
        }
        .an-modal-cancel:hover { background:rgba(255,255,255,.1); }
        .an-modal-done {
          text-align:center; padding:1.5rem 0;
        }
        .an-modal-check {
          width:72px; height:72px; border-radius:50%;
          background:rgba(46,210,127,.15); border:1px solid rgba(46,210,127,.3);
          display:flex; align-items:center; justify-content:center;
          margin:0 auto 1rem; color:#2ED27F;
        }
        .an-modal-done-title {
          font-family:'Russo One',sans-serif; font-size:1.5rem;
          margin-bottom:.5rem;
        }
        .an-modal-done-sub { color:rgba(255,255,255,.5); font-size:14px; }
        .an-modal-done-sub strong { color:#fff; }

        /* ——— Responsive ——— */
        @media (max-width:1100px) { .an-grid { grid-template-columns:repeat(2,1fr); } }
        @media (max-width:960px) {
          .an-filters-grid { grid-template-columns:1fr 1fr; }
          .an-publish-btn  { grid-column:span 2; justify-content:center; }
        }
        @media (max-width:720px) {
          .an-grid { grid-template-columns:1fr; }
          .an-feed .an-header { padding:16px 0; }
          .an-feed .an-eyebrow, .an-feed .an-live-pulse { display:none; }
          .an-feed .an-eyebrow { font-size:10px; letter-spacing:2px; }
          .an-feed .an-sub { font-size:14px; line-height:1.5; }
          .an-feed-shortcuts { gap:4px 14px; margin-bottom:16px; }
          .an-feed-post { display:none !important; }
          .an-feed .an-filters { padding:14px 0; }
          .an-tabs-row { flex-wrap:nowrap; overflow-x:auto; padding-bottom:4px; margin-bottom:10px; }
          .an-tab { flex-shrink:0; padding:9px 12px; gap:6px; }
          .an-feed .an-grid-section { padding-top:20px; }
        }
        @media (max-width:600px)  { .an-container { padding:0 16px; } }
        @media (max-width:520px) {
          .an-filters-grid { grid-template-columns:1fr; }
          .an-publish-btn  { grid-column:1; }
        }
      `}</style>
    </div>
  )
}

// ——— Annonce Card ——————————————————————————————
function AnnonceCard({ annonce, currentUser, onPostuler }: {
  annonce: Annonce & { profiles?: { id: string; avatar_url?: string; verified?: boolean } }
  currentUser: Profile | null
  onPostuler: () => void
}) {
  const { lang } = useLang()
  const type = TYPE_CFG[annonce.author_type] ?? TYPE_CFG.player
  const isClub   = annonce.author_type === 'club'
  const isAuthor = currentUser?.id === annonce.author_id
  const avatarUrl = annonce.profiles?.avatar_url
  const authorId  = annonce.profiles?.id || annonce.author_id
  const initials  = annonce.author_name.slice(0, 2).toUpperCase()
  const grad      = GRADS[annonce.author_name.charCodeAt(0) % GRADS.length]
  const isRecent  = Date.now() - new Date(annonce.created_at).getTime() < 24 * 3_600_000
  const canApply  = !isAuthor && currentUser != null && currentUser.role !== 'club'

  const authorSub = isClub
    ? [annonce.ligue, annonce.zone].filter((value): value is string => Boolean(value)).map(value => footballLabel(value, lang)).join(' · ')
    : annonce.author_type === 'coach'
      ? [annonce.position, annonce.zone].filter((value): value is string => Boolean(value)).map(value => footballLabel(value, lang)).join(' · ')
      : footballLabel(annonce.position || annonce.zone || '', lang)

  const TypeIcon = isClub ? IcoBuilding : annonce.author_type === 'coach' ? IcoCoach : IcoPlayer

  return (
    <article className="an-card">
      {/* Header */}
      <div className="an-card-header">
        <span className="an-type-badge" style={{ background: type.bg, border: `1px solid ${type.border}`, color: type.color }}>
          <TypeIcon s={12} />{type.label[lang]}
        </span>
        <span className={`an-timestamp${isRecent ? ' recent' : ''}`}>
          {relativeTime(annonce.created_at, lang)}
        </span>
      </div>

      {/* Author */}
      <Link href={`/profil/${authorId}`} className="an-author">
        {isClub
          ? <ClubCrest src={avatarSrc(avatarUrl)} size={40} fallback={initials} />
          : <div className="an-avatar" style={{ background: avatarUrl ? 'transparent' : grad }}>
              {avatarUrl
                ? <img src={avatarSrc(avatarUrl)!} alt="" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                : <span>{initials}</span>
              }
            </div>
        }
        <div className="an-author-info">
          <div className="an-author-name">
            {annonce.author_name}
            {annonce.profiles?.verified && <VerifiedBadge size={14} />}
          </div>
          {authorSub && <div className="an-author-sub">{authorSub}</div>}
        </div>
      </Link>

      {/* Content */}
      <h3 className="an-card-title">{annonce.title}</h3>
      <p className="an-card-body">{annonce.body}</p>

      {/* Tags */}
      {(annonce.position || annonce.ligue || annonce.zone) && (
        <div className="an-tags">
          {annonce.position && <span className="an-tag"><IcoStar s={10} color="#FF3A3A" />{footballLabel(annonce.position, lang)}</span>}
          {annonce.ligue    && <span className="an-tag"><IcoClock s={10} color="#FF3A3A" />{footballLabel(annonce.ligue, lang)}</span>}
          {annonce.zone     && <span className="an-tag"><IcoPin s={10} color="#FF3A3A" />{footballLabel(annonce.zone, lang)}</span>}
        </div>
      )}

      {/* Actions */}
      <div className="an-card-actions">
        <div className="an-card-btns">
          {/* 1. Postuler — primary red button */}
          {canApply ? (
            <button className="an-btn-pri" onClick={onPostuler}>
              {lang === 'de' ? 'Bewerben' : 'Postuler'} <IcoArrow s={14} />
            </button>
          ) : !currentUser ? (
            <Link href="/login" className="an-btn-pri">
              {lang === 'de' ? 'Bewerben' : 'Postuler'} <IcoArrow s={14} />
            </Link>
          ) : isAuthor ? (
            <Link href="/candidatures" className="an-btn-author">
              {lang === 'de' ? 'Bewerbungen' : 'Candidatures'} <IcoArrow s={12} />
            </Link>
          ) : null}
          {/* 2. Message — ghost button (hidden for author) */}
          {(!currentUser || !isAuthor) && (
            <Link href={`/messages?partner=${annonce.author_id}`} className="an-btn-msg">
              <IcoMsg s={14} /> {lang === 'de' ? 'Nachricht' : 'Message'}
            </Link>
          )}
        </div>
        {/* 3. Voir profil — always visible */}
        <Link href={`/profil/${authorId}`} className="an-view-profile">
          {lang === 'de' ? 'Profil ansehen →' : 'Voir profil →'}
        </Link>
      </div>
    </article>
  )
}

// ——— Postuler Modal ————————————————————————————
function PostulerModal({ annonce, currentUser, onClose, onSuccess }: {
  annonce: Annonce
  currentUser: Profile
  onClose: () => void
  onSuccess: () => void
}) {
  const { lang } = useLang()
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone]       = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit() {
    if (!message.trim()) { setError(lang === 'de' ? 'Bitte schreibe eine kurze Motivation.' : 'Merci d\'écrire un message de motivation.'); return }
    setSending(true)
    setError('')
    const applicantName = currentUser.role === 'club'
      ? currentUser.club_name
      : `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || currentUser.email

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/applications/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          annonce_id:     annonce.id,
          message:        message.trim(),
          applicant_name: applicantName,
          applicant_role: currentUser.role,
        }),
      })
      setSending(false)
      if (!res.ok) { setError(lang === 'de' ? 'Die Bewerbung konnte nicht gesendet werden. Versuche es erneut.' : 'Erreur lors de la candidature. Réessaie.'); return }
      setDone(true)
      setTimeout(onSuccess, 2000)
    } catch (e) {
      console.error('Application submit network error:', e)
      setSending(false)
      setError(lang === 'de' ? 'Netzwerkfehler. Versuche es erneut.' : 'Erreur réseau. Réessaie.')
    }
  }

  return (
    <div className="an-modal-overlay" onClick={onClose}>
      <div className="an-modal" onClick={(e) => e.stopPropagation()}>
        {done ? (
          <div className="an-modal-done">
            <div className="an-modal-check"><IcoCheck s={32} /></div>
            <div className="an-modal-done-title">{lang === 'de' ? 'Bewerbung gesendet!' : 'Candidature envoyée !'}</div>
            <div className="an-modal-done-sub">
              {lang === 'de' ? <>Den Status findest du unter <strong>Meine Bewerbungen</strong>.</> : <>Tu peux suivre l&apos;état dans <strong>Mes candidatures</strong>.</>}
            </div>
          </div>
        ) : (
          <>
            <div className="an-modal-title">{lang === 'de' ? 'Für diese Anzeige bewerben' : 'Postuler à cette annonce'}</div>
            <div className="an-modal-ann">{annonce.title} — {annonce.author_name}</div>
            <label className="an-modal-label">{lang === 'de' ? 'Motivationsschreiben' : 'Message de motivation'}</label>
            <textarea
              className="an-modal-textarea"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={lang === 'de' ? 'Stell dich kurz vor und beschreibe, warum dich die Anzeige interessiert und was du mitbringst.' : 'Présente-toi brièvement, explique pourquoi tu es intéressé(e) et ce que tu peux apporter…'}
            />
            {error && <div className="an-modal-error">{error}</div>}
            <div className="an-modal-btns">
              <button className="an-modal-submit" onClick={handleSubmit} disabled={sending}>
                {sending
                  ? (lang === 'de' ? 'Wird gesendet…' : 'Envoi en cours…')
                  : <><IcoSend s={16} />{lang === 'de' ? 'Bewerbung senden' : 'Envoyer la candidature'}</>
                }
              </button>
              <button className="an-modal-cancel" onClick={onClose}>{lang === 'de' ? 'Abbrechen' : 'Annuler'}</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
