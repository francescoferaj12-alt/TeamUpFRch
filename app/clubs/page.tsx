'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase, Profile } from '../../lib/supabase'
import { useLang } from '../../lib/lang-context'
import { useAuth } from '../../lib/auth-context'
import { t } from '../../lib/translations'
import VerifiedBadge from '../../components/VerifiedBadge'

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterZone, setFilterZone] = useState('')
  const { lang } = useLang()
  const { profile: currentUser } = useAuth()

  const ZONES = ['Fribourg-Ville','Gruyère','Broye','Glâne','Sensebezirk','Veveyse','Lac']

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'club')
        .neq('hidden', true)
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

  const optSt = { background:'#061540' }

  return (
    <div style={{ background:'#030a24', minHeight:'100vh', color:'#fff' }}>
      <style>{`
        .club-card:hover { border-color:rgba(230,57,70,.4) !important; transform:translateY(-2px); }
        .club-card { transition:border-color .2s,transform .2s; }
        @keyframes spin{to{transform:rotate(360deg);}}
      `}</style>

      {/* HERO */}
      <section style={{ background:'linear-gradient(180deg,#030a24 0%,#061540 100%)', padding:'4rem 2rem 3rem', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, opacity:.03, backgroundImage:`url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='15' fill='none' stroke='%23fff' stroke-width='1'/%3E%3C/svg%3E")` }} />
        <div style={{ position:'relative', maxWidth:700, margin:'0 auto' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.12)', borderRadius:100, padding:'6px 18px', marginBottom:'1.25rem' }}>
            <span>🏟️</span>
            <span style={{ fontSize:11, fontWeight:700, letterSpacing:2, color:'rgba(255,255,255,.85)', textTransform:'uppercase' }}>
              {t.clubs.directory[lang]}
            </span>
          </div>
          <h1 style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'clamp(2.5rem,7vw,5rem)', color:'#fff', letterSpacing:2, lineHeight:1, marginBottom:'.75rem' }}>
            {t.clubs.title[lang]}
          </h1>
          <p style={{ color:'rgba(255,255,255,.55)', fontSize:16, marginBottom:'1.5rem' }}>
            {t.clubs.subtitle[lang]}
          </p>

          <div style={{ display:'flex', gap:8, maxWidth:500, margin:'0 auto' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t.clubs.search_ph[lang]}
              style={{ flex:1, background:'rgba(255,255,255,.07)', border:'1.5px solid rgba(255,255,255,.12)', color:'#fff', borderRadius:10, padding:'12px 16px', fontSize:15, outline:'none', fontFamily:'inherit' }}
            />
            <select
              value={filterZone}
              onChange={e => setFilterZone(e.target.value)}
              style={{ background:'rgba(255,255,255,.07)', border:'1.5px solid rgba(255,255,255,.12)', color:'#fff', borderRadius:10, padding:'12px 14px', fontSize:14, outline:'none', fontFamily:'inherit' }}
            >
              <option value="" style={optSt}>{t.clubs.all_zones[lang]}</option>
              {ZONES.map(z => <option key={z} style={optSt}>{z}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* CLUBS GRID */}
      <section style={{ padding:'3rem 2rem' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ marginBottom:'1.25rem', fontSize:14, color:'rgba(255,255,255,.4)', fontWeight:500 }}>
            {filtered.length} {filtered.length > 1 ? t.clubs.count_plural[lang] : t.clubs.count_single[lang]}
          </div>

          {loading ? (
            <div style={{ textAlign:'center', padding:'4rem', color:'rgba(255,255,255,.4)' }}>
              <div style={{ width:36, height:36, border:'4px solid rgba(255,255,255,.1)', borderTopColor:'#e63946', borderRadius:'50%', animation:'spin .8s linear infinite', margin:'0 auto 1rem' }} />
              {t.clubs.loading[lang]}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'4rem', background:'rgba(255,255,255,.03)', borderRadius:20, border:'1px solid rgba(255,255,255,.07)' }}>
              <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🏟️</div>
              <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.5rem', letterSpacing:1, marginBottom:'.5rem', color:'#fff' }}>
                {t.clubs.none_found[lang]}
              </div>
              <p style={{ color:'rgba(255,255,255,.4)', fontSize:14, marginBottom:'1.5rem' }}>
                {t.clubs.none_desc[lang]}
              </p>
              <Link href="/login" style={{ background:'#e63946', color:'#fff', padding:'12px 28px', borderRadius:10, fontWeight:700, textDecoration:'none', fontSize:14 }}>
                {t.clubs.register[lang]}
              </Link>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'1.25rem' }}>
              {filtered.map(club => (
                <div key={club.id} className="club-card" style={{ background:'rgba(255,255,255,.04)', borderRadius:16, border:'1px solid rgba(255,255,255,.08)', overflow:'hidden' }}>
                  <div style={{ background:'linear-gradient(135deg,#061540,#0a1f5c)', padding:'1.5rem', textAlign:'center', position:'relative' }}>
                    <div style={{ width:64, height:64, borderRadius:14, background:'rgba(255,255,255,.1)', border:'2px solid rgba(255,255,255,.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', margin:'0 auto .75rem' }}>
                      {club.avatar_url
                        ? <img src={club.avatar_url} alt={club.club_name || ''} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:12 }} />
                        : '🏟️'
                      }
                    </div>
                    <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.4rem', color:'#fff', letterSpacing:1, display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
                      {club.club_name || 'Club'}
                      {club.verified && <VerifiedBadge />}
                    </div>
                    {club.available && (
                      <div style={{ position:'absolute', top:10, right:10, background:'rgba(13,122,54,.3)', border:'1px solid rgba(76,219,122,.3)', color:'#4cdb7a', fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:100 }}>
                        🟢 {t.clubs.recruits[lang]}
                      </div>
                    )}
                  </div>

                  <div style={{ padding:'1.25rem' }}>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:'1rem' }}>
                      {club.ligue && <span style={{ background:'rgba(255,255,255,.08)', color:'rgba(255,255,255,.7)', fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:100 }}>{club.ligue}</span>}
                      {club.zone && <span style={{ background:'rgba(230,57,70,.12)', color:'#e63946', fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:100 }}>{club.zone}</span>}
                    </div>

                    {club.bio && (
                      <p style={{ fontSize:13, color:'rgba(255,255,255,.5)', lineHeight:1.6, marginBottom:'1rem', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                        {club.bio}
                      </p>
                    )}

                    <div style={{ display:'flex', gap:8 }}>
                      <Link href={`/club/${club.id}`} style={{ flex:1, background:'#e63946', color:'#fff', borderRadius:8, padding:'8px', fontSize:13, fontWeight:700, textAlign:'center', textDecoration:'none' }}>
                        {t.clubs.view_club[lang]}
                      </Link>
                      <Link href={`/messages?partner=${club.id}`} style={{ background:'rgba(255,255,255,.07)', color:'rgba(255,255,255,.7)', border:'1px solid rgba(255,255,255,.1)', borderRadius:8, padding:'8px 14px', fontSize:13, fontWeight:700, textDecoration:'none' }}>
                        💬
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
