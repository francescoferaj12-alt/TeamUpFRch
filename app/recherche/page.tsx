'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { supabase, Profile } from '../../lib/supabase'

const LIGUES = ['2ème Ligue','3ème Ligue','4ème Ligue','5ème Ligue','Junior A','Junior B','Junior C']
const ZONES = ['Fribourg-Ville','Gruyère','Broye','Glâne','Sensebezirk','Veveyse','Lac']
const POSITIONS = ['Attaquant','Milieu offensif','Milieu défensif','Défenseur central','Défenseur latéral','Gardien']

type FilterType = 'all' | 'player' | 'coach' | 'club'

export default function RecherchePage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [filterLigue, setFilterLigue] = useState('')
  const [filterPos, setFilterPos] = useState('')
  const [filterZone, setFilterZone] = useState('')
  const [filterDispo, setFilterDispo] = useState(false)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) setProfiles(data)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    return profiles.filter(p => {
      if (filterType !== 'all' && p.role !== filterType) return false
      if (filterDispo && !p.available) return false
      if (filterLigue && p.ligue !== filterLigue) return false
      if (filterPos && p.position !== filterPos) return false
      if (filterZone && p.zone !== filterZone) return false
      if (query) {
        const q = query.toLowerCase()
        const name = `${p.first_name || ''} ${p.last_name || ''} ${p.club_name || ''}`.toLowerCase()
        if (!name.includes(q) && !(p.position || '').toLowerCase().includes(q) && !(p.ligue || '').toLowerCase().includes(q) && !(p.zone || '').toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [profiles, filterType, filterDispo, filterLigue, filterPos, filterZone, query])

  const counts = {
    all: filtered.length,
    player: filtered.filter(p => p.role === 'player').length,
    coach: filtered.filter(p => p.role === 'coach').length,
    club: filtered.filter(p => p.role === 'club').length,
  }

  return (
    <>
      {/* HERO */}
      <div style={{ background:'linear-gradient(135deg, var(--blue-dark), var(--blue-mid))', padding:'2.5rem 1.5rem 1.5rem' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <h1 style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'2.5rem', color:'#fff', letterSpacing:2, marginBottom:'.25rem' }}>
            Recherche <span style={{ color:'var(--red-light)' }}>Avancée</span>
          </h1>
          <p style={{ color:'rgba(255,255,255,.6)', fontSize:14, marginBottom:'1.25rem' }}>
            Trouve joueurs, coachs et clubs dans le canton de Fribourg
          </p>
          <div style={{ display:'flex', gap:8 }}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Nom, position, ligue, zone…"
              style={{ flex:1, background:'rgba(255,255,255,.95)', border:'none', borderRadius:10, padding:'12px 16px', fontSize:15, outline:'none', fontFamily:'inherit' }}
            />
            <button style={{ background:'var(--red)', color:'#fff', border:'none', borderRadius:10, padding:'12px 22px', fontSize:14, fontWeight:700, fontFamily:'inherit', cursor:'pointer' }}>
              Rechercher
            </button>
          </div>
        </div>
      </div>

      {/* TYPE TABS */}
      <div style={{ background:'#fff', padding:'.85rem 1.5rem', borderBottom:'1px solid var(--border)', display:'flex', gap:6, overflowX:'auto' }}>
        {([
          ['all', 'Tous', counts.all],
          ['player', '👤 Joueurs', counts.player],
          ['coach', '🧑‍🏫 Coachs', counts.coach],
          ['club', '🏟️ Clubs', counts.club],
        ] as const).map(([t, label, count]) => (
          <button key={t} onClick={() => setFilterType(t as FilterType)} style={{
            padding:'7px 18px', borderRadius:8,
            border:`1.5px solid ${filterType === t ? 'var(--blue-bright)' : 'var(--border)'}`,
            background: filterType === t ? 'var(--blue-light)' : '#fff',
            color: filterType === t ? 'var(--blue-mid)' : 'var(--text-muted)',
            fontSize:13, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', fontFamily:'inherit'
          }}>
            {label} <span style={{ background:'var(--blue-light)', color:'var(--blue-mid)', borderRadius:100, padding:'1px 7px', fontSize:11, marginLeft:4 }}>{count}</span>
          </button>
        ))}
      </div>

      {/* FILTERS */}
      <div style={{ background:'#fff', borderBottom:'1px solid var(--border)', padding:'.85rem 1.5rem', display:'flex', gap:'.75rem', flexWrap:'wrap', alignItems:'center' }}>
        <button onClick={() => setFilterDispo(!filterDispo)} style={{
          border:`1.5px solid ${filterDispo ? 'var(--blue-bright)' : 'var(--border)'}`,
          background: filterDispo ? 'var(--blue-light)' : 'var(--gray-bg)',
          color: filterDispo ? 'var(--blue-mid)' : 'inherit',
          borderRadius:100, padding:'6px 14px', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit'
        }}>🟢 Disponible</button>

        {[
          { value: filterLigue, set: setFilterLigue, placeholder: 'Toutes les ligues', options: LIGUES },
          { value: filterPos, set: setFilterPos, placeholder: 'Toutes positions', options: POSITIONS },
          { value: filterZone, set: setFilterZone, placeholder: 'Toute la zone', options: ZONES },
        ].map((f, i) => (
          <select key={i} value={f.value} onChange={e => f.set(e.target.value)} style={{
            background:'var(--gray-bg)', border:'1.5px solid var(--border)', borderRadius:100,
            padding:'6px 14px', fontSize:13, fontWeight:500, cursor:'pointer', outline:'none', fontFamily:'inherit'
          }}>
            <option value="">{f.placeholder}</option>
            {f.options.map(o => <option key={o}>{o}</option>)}
          </select>
        ))}

        <span style={{ marginLeft:'auto', fontSize:13, color:'var(--text-muted)', fontWeight:500 }}>
          {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* RESULTS */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:'1rem', padding:'1.5rem' }}>
        {loading ? (
          <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'3rem', color:'var(--text-muted)' }}>
            <div style={{ width:36, height:36, border:'4px solid var(--gray-light)', borderTopColor:'var(--blue-bright)', borderRadius:'50%', animation:'spin .8s linear infinite', margin:'0 auto 1rem' }} />
            Chargement des profils…
            <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'3rem', color:'var(--text-muted)' }}>
            <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>😕</div>
            <div style={{ fontSize:16, fontWeight:500, marginBottom:'.5rem' }}>Aucun résultat</div>
            <div style={{ fontSize:14 }}>
              {profiles.length === 0
                ? "Sois le premier à t'inscrire sur TeamUpFR !"
                : "Modifie tes filtres pour trouver ce que tu cherches."
              }
            </div>
            {profiles.length === 0 && (
              <Link href="/login" className="btn btn-blue" style={{ marginTop:'1rem', display:'inline-flex' }}>
                Créer mon profil →
              </Link>
            )}
          </div>
        ) : (
          filtered.map(p => <ProfileCard key={p.id} profile={p} />)
        )}
      </div>
    </>
  )
}

function ProfileCard({ profile: p }: { profile: Profile }) {
  const name = p.role === 'club'
    ? (p.club_name || 'Club')
    : `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.email

  const initials = p.role === 'club'
    ? (p.club_name?.[0] || '🏟️')
    : `${p.first_name?.[0] || ''}${p.last_name?.[0] || ''}`.toUpperCase() || '??'

  const roleEmoji = p.role === 'player' ? '👤' : p.role === 'coach' ? '🧑‍🏫' : '🏟️'
  const roleLabel = p.role === 'player' ? 'Joueur' : p.role === 'coach' ? 'Coach' : 'Club'

  const stripeColor = p.role === 'player'
    ? 'linear-gradient(90deg,#1a6fd4,#5b9eff)'
    : p.role === 'coach'
    ? 'linear-gradient(90deg,#e02020,#ff8c42)'
    : 'linear-gradient(90deg,#0d7a36,#1db954)'

  const bgColor = p.role === 'player' ? '#deeafa' : p.role === 'coach' ? '#fde8e8' : 'var(--green-bg)'

  return (
    <div style={{ background:'#fff', borderRadius:14, border:'1px solid var(--border)', padding:'1.25rem', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:stripeColor }} />

      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'.85rem' }}>
        <div style={{ width:46, height:46, borderRadius:12, background:bgColor, display:'flex', alignItems:'center', justifyContent:'center', fontSize:p.avatar_url ? 0 : 18, fontWeight:700, flexShrink:0, overflow:'hidden' }}>
          {p.avatar_url
            ? <img src={p.avatar_url} alt={name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            : (initials.length > 2 ? roleEmoji : initials)
          }
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:700, fontSize:15, lineHeight:1.2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{name}</div>
          <div style={{ fontSize:12, color:'var(--text-muted)' }}>{p.position || roleLabel}{p.age ? ` · ${p.age} ans` : ''}</div>
        </div>
        <span className={`badge ${p.available ? 'badge-green' : 'badge-gray'}`}>
          {p.available ? 'Dispo' : 'Indispo'}
        </span>
      </div>

      <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:'.85rem' }}>
        {p.ligue && <span className="badge badge-blue">{p.ligue}</span>}
        {p.zone && <span className="badge badge-blue">{p.zone}</span>}
        {p.foot && <span className="badge badge-gray">{p.foot}</span>}
      </div>

      {p.bio && (
        <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.5, marginBottom:'.85rem', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
          {p.bio}
        </p>
      )}

      <div style={{ display:'flex', gap:6 }}>
        <Link href="/messages" style={{ flex:1, background:'var(--blue-bright)', color:'#fff', border:'none', borderRadius:7, padding:'7px', fontSize:12, fontWeight:700, textAlign:'center', cursor:'pointer', textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'center' }}>
          💬 Contacter
        </Link>
        <Link href="/profil" style={{ flex:1, background:'var(--gray-light)', color:'var(--text-muted)', border:'none', borderRadius:7, padding:'7px', fontSize:12, fontWeight:700, textAlign:'center', cursor:'pointer', textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'center' }}>
          👤 Profil
        </Link>
      </div>
    </div>
  )
}
