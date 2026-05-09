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

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('profiles')
        .select('id,email,role,first_name,last_name,position,ligue,zone,foot,available,bio,club_name,avatar_url,birthdate,genre,verified')
        .neq('hidden', true)
        .order('created_at', { ascending: false })
        .limit(500)
      if (!error && data) setProfiles(data as Profile[])
      setLoading(false)
    }
    load()
  }, [])

  // Debounce the search query to avoid filtering on every keystroke
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
      if (q) {
        const name = `${p.first_name || ''} ${p.last_name || ''} ${p.club_name || ''}`.toLowerCase()
        if (!name.includes(q) && !(p.position || '').toLowerCase().includes(q) && !(p.ligue || '').toLowerCase().includes(q) && !(p.zone || '').toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [profiles, filterType, filterDispo, filterLigue, filterPos, filterZone, debouncedQuery, currentUser])

  const counts = {
    all: filtered.length,
    player: filtered.filter(p => p.role === 'player').length,
    coach: filtered.filter(p => p.role === 'coach').length,
    club: filtered.filter(p => p.role === 'club').length,
  }

  const tabs = [
    ['all', t.search.all[lang], counts.all],
    ['player', t.search.players[lang], counts.player],
    ['coach', t.search.coaches[lang], counts.coach],
    ['club', t.search.clubs[lang], counts.club],
  ] as const

  const optSt = { background:'#061540' }

  return (
    <div style={{ background:'#030a24', minHeight:'100vh', color:'#fff' }}>
      <style>{`
        .rech-card:hover { border-color:rgba(230,57,70,.4) !important; background:rgba(255,255,255,.07) !important; }
        @keyframes spin{to{transform:rotate(360deg);}}
      `}</style>

      {/* HERO */}
      <div style={{ background:'linear-gradient(180deg,#030a24 0%,#061540 100%)', padding:'2.5rem 1.5rem 1.5rem' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <h1 style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'2.5rem', color:'#fff', letterSpacing:2, marginBottom:'.25rem' }}>
            {t.search.title[lang]} <span style={{ color:'#e63946' }}>{t.search.advanced[lang]}</span>
          </h1>
          <p style={{ color:'rgba(255,255,255,.5)', fontSize:14, marginBottom:'1.25rem' }}>
            {t.search.subtitle[lang]}
          </p>
          <div style={{ display:'flex', gap:8 }}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t.search.placeholder[lang]}
              style={{ flex:1, background:'rgba(255,255,255,.07)', border:'1.5px solid rgba(255,255,255,.12)', color:'#fff', borderRadius:10, padding:'12px 16px', fontSize:15, outline:'none', fontFamily:'inherit' }}
            />
            <button style={{ background:'#e63946', color:'#fff', border:'none', borderRadius:10, padding:'12px 22px', fontSize:14, fontWeight:700, fontFamily:'inherit', cursor:'pointer' }}>
              {t.search.btn[lang]}
            </button>
          </div>
        </div>
      </div>

      {/* TYPE TABS */}
      <div style={{ background:'#061540', padding:'.85rem 1.5rem', borderBottom:'1px solid rgba(255,255,255,.06)', display:'flex', gap:6, overflowX:'auto' }}>
        {tabs.map(([type, label, count]) => (
          <button key={type} onClick={() => setFilterType(type as FilterType)} style={{
            padding:'7px 18px', borderRadius:8,
            border:`1.5px solid ${filterType === type ? '#e63946' : 'rgba(255,255,255,.12)'}`,
            background: filterType === type ? 'rgba(230,57,70,.15)' : 'rgba(255,255,255,.04)',
            color: filterType === type ? '#e63946' : 'rgba(255,255,255,.6)',
            fontSize:13, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', fontFamily:'inherit'
          }}>
            {label} <span style={{ background:'rgba(255,255,255,.1)', color:'rgba(255,255,255,.7)', borderRadius:100, padding:'1px 7px', fontSize:11, marginLeft:4 }}>{count}</span>
          </button>
        ))}
      </div>

      {/* FILTERS */}
      <div style={{ background:'#061540', borderBottom:'1px solid rgba(255,255,255,.06)', padding:'.85rem 1.5rem', display:'flex', gap:'.75rem', flexWrap:'wrap', alignItems:'center' }}>
        <button onClick={() => setFilterDispo(!filterDispo)} style={{
          border:`1.5px solid ${filterDispo ? '#e63946' : 'rgba(255,255,255,.12)'}`,
          background: filterDispo ? 'rgba(230,57,70,.15)' : 'rgba(255,255,255,.04)',
          color: filterDispo ? '#e63946' : 'rgba(255,255,255,.6)',
          borderRadius:100, padding:'6px 14px', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit'
        }}>{t.search.available[lang]}</button>

        <select value={filterGenre} onChange={e => setFilterGenre(e.target.value)} style={{
          background:'rgba(255,255,255,.07)', border:'1.5px solid rgba(255,255,255,.12)', color:'#fff', borderRadius:100,
          padding:'6px 14px', fontSize:13, fontWeight:500, cursor:'pointer', outline:'none', fontFamily:'inherit'
        }}>
          <option value="" style={optSt}>{t.search.all_genres[lang]}</option>
          <option value="homme" style={optSt}>♂ {lang === 'fr' ? 'Homme' : 'Mann'}</option>
          <option value="femme" style={optSt}>♀ {lang === 'fr' ? 'Femme' : 'Frau'}</option>
        </select>

        <select value={filterLigue} onChange={e => setFilterLigue(e.target.value)} style={{
          background:'rgba(255,255,255,.07)', border:'1.5px solid rgba(255,255,255,.12)', color:'#fff', borderRadius:100,
          padding:'6px 14px', fontSize:13, fontWeight:500, cursor:'pointer', outline:'none', fontFamily:'inherit'
        }}>
          <option value="" style={optSt}>{t.search.all_ligues[lang]}</option>
          {ALL_LIGUE_GROUPS.map(g => (
            <optgroup key={g.group} label={g.group} style={{ background:'#061540' }}>
              {g.items.map(l => <option key={l} style={optSt}>{l}</option>)}
            </optgroup>
          ))}
        </select>

        {[
          { value: filterPos, set: setFilterPos, placeholder: t.search.all_positions[lang], options: POSITIONS },
          { value: filterZone, set: setFilterZone, placeholder: t.search.all_zones[lang], options: ZONES },
        ].map((f, i) => (
          <select key={i} value={f.value} onChange={e => f.set(e.target.value)} style={{
            background:'rgba(255,255,255,.07)', border:'1.5px solid rgba(255,255,255,.12)', color:'#fff', borderRadius:100,
            padding:'6px 14px', fontSize:13, fontWeight:500, cursor:'pointer', outline:'none', fontFamily:'inherit'
          }}>
            <option value="" style={optSt}>{f.placeholder}</option>
            {f.options.map(o => <option key={o} style={optSt}>{o}</option>)}
          </select>
        ))}

        <span style={{ marginLeft:'auto', fontSize:13, color:'rgba(255,255,255,.5)', fontWeight:500 }}>
          {filtered.length} {filtered.length > 1 ? t.search.results_pl[lang] : t.search.results[lang]}
        </span>
      </div>

      {/* RESULTS */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:'1rem', padding:'1.5rem' }}>
        {loading ? (
          <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'3rem', color:'rgba(255,255,255,.4)' }}>
            <div style={{ width:36, height:36, border:'4px solid rgba(255,255,255,.1)', borderTopColor:'#e63946', borderRadius:'50%', animation:'spin .8s linear infinite', margin:'0 auto 1rem' }} />
            {t.search.loading[lang]}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'3rem', color:'rgba(255,255,255,.4)' }}>
            <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>😕</div>
            <div style={{ fontSize:16, fontWeight:500, marginBottom:'.5rem', color:'#fff' }}>{t.search.no_results[lang]}</div>
            <div style={{ fontSize:14 }}>
              {profiles.length === 0
                ? t.search.first_register[lang]
                : t.search.no_filter[lang]
              }
            </div>
            {profiles.length === 0 && (
              <Link href="/login" style={{ marginTop:'1rem', display:'inline-flex', background:'#e63946', color:'#fff', padding:'10px 22px', borderRadius:8, fontWeight:700, textDecoration:'none', fontSize:14 }}>
                {t.search.create_profile[lang]}
              </Link>
            )}
          </div>
        ) : (
          filtered.map(p => <ProfileCard key={p.id} profile={p} />)
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
    ? (p.club_name?.[0] || '🏟️')
    : `${p.first_name?.[0] || ''}${p.last_name?.[0] || ''}`.toUpperCase() || '??'

  const roleEmoji = p.role === 'player' ? '👤' : p.role === 'coach' ? '🧑‍🏫' : '🏟️'
  const roleLabel = p.role === 'player' ? t.search.joueur[lang] : p.role === 'coach' ? t.search.coach_label[lang] : t.search.club_label[lang]

  const stripeColor = p.role === 'player'
    ? 'linear-gradient(90deg,#1a6fd4,#5b9eff)'
    : p.role === 'coach'
    ? 'linear-gradient(90deg,#e02020,#ff8c42)'
    : 'linear-gradient(90deg,#0d7a36,#1db954)'

  const bgColor = p.role === 'player' ? '#deeafa' : p.role === 'coach' ? '#fde8e8' : 'var(--green-bg)'

  const ageSuffix = t.general.age_suffix[lang]

  const avatarBg = p.role === 'player' ? 'rgba(26,111,212,.25)' : p.role === 'coach' ? 'rgba(224,32,32,.2)' : 'rgba(13,122,54,.2)'

  return (
    <div className="rech-card" style={{ background:'rgba(255,255,255,.04)', borderRadius:14, border:'1px solid rgba(255,255,255,.08)', padding:'1.25rem', position:'relative', overflow:'hidden', transition:'border-color .2s,background .2s' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:stripeColor }} />

      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'.85rem' }}>
        <div style={{ width:46, height:46, borderRadius:12, background:avatarBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:p.avatar_url ? 0 : 18, fontWeight:700, flexShrink:0, overflow:'hidden' }}>
          {p.avatar_url
            ? <img src={avatarSrc(p.avatar_url)!} alt={name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            : (initials.length > 2 ? roleEmoji : initials)
          }
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:700, fontSize:15, lineHeight:1.2, color:'#fff', display:'flex', alignItems:'center', gap:2, minWidth:0 }}>
            <span style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{name}</span>
            {p.verified && <VerifiedBadge size={15} />}
          </div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,.5)' }}>{p.position || roleLabel}{calcAge(p.birthdate) ? ` · ${calcAge(p.birthdate)}${ageSuffix}` : ''}</div>
        </div>
        <span style={{ background: p.available ? 'rgba(13,122,54,.2)' : 'rgba(255,255,255,.07)', color: p.available ? '#4cdb7a' : 'rgba(255,255,255,.4)', borderRadius:100, padding:'3px 9px', fontSize:11, fontWeight:600, whiteSpace:'nowrap' }}>
          {p.available ? t.search.dispo[lang] : t.search.indispo[lang]}
        </span>
      </div>

      <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:'.85rem' }}>
        {p.ligue && <span style={{ background:'rgba(255,255,255,.08)', color:'rgba(255,255,255,.7)', borderRadius:100, padding:'2px 9px', fontSize:11, fontWeight:500 }}>{p.ligue}</span>}
        {p.zone && <span style={{ background:'rgba(255,255,255,.08)', color:'rgba(255,255,255,.7)', borderRadius:100, padding:'2px 9px', fontSize:11, fontWeight:500 }}>{p.zone}</span>}
        {p.foot && <span style={{ background:'rgba(255,255,255,.05)', color:'rgba(255,255,255,.5)', borderRadius:100, padding:'2px 9px', fontSize:11, fontWeight:500 }}>{p.foot}</span>}
      </div>

      {p.bio && (
        <p style={{ fontSize:13, color:'rgba(255,255,255,.5)', lineHeight:1.5, marginBottom:'.85rem', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
          {p.bio}
        </p>
      )}

      <div style={{ display:'flex', gap:6 }}>
        <Link href={`/messages?partner=${p.id}`} style={{ flex:1, background:'#e63946', color:'#fff', border:'none', borderRadius:7, padding:'7px', fontSize:12, fontWeight:700, textAlign:'center', cursor:'pointer', textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'center' }}>
          {t.search.contact[lang]}
        </Link>
        <Link href="/profil" style={{ flex:1, background:'rgba(255,255,255,.07)', color:'rgba(255,255,255,.7)', border:'1px solid rgba(255,255,255,.1)', borderRadius:7, padding:'7px', fontSize:12, fontWeight:700, textAlign:'center', cursor:'pointer', textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'center' }}>
          {t.search.profile[lang]}
        </Link>
      </div>
    </div>
  )
}
