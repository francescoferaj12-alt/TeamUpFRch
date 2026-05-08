'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, Profile, Annonce, avatarSrc } from '../../../lib/supabase'
import VerifiedBadge from '../../../components/VerifiedBadge'

export default function ClubPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [club, setClub] = useState<Profile | null>(null)
  const [annonces, setAnnonces] = useState<Annonce[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      // slug is a profile UUID
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', slug)
        .eq('role', 'club')
        .single()

      if (error || !data) { setNotFound(true); setLoading(false); return }
      setClub(data)

      const { data: ann } = await supabase
        .from('annonces')
        .select('*')
        .eq('author_id', slug)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      setAnnonces(ann || [])
      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', background:'#030a24' }}>
      <div style={{ width:36, height:36, border:'4px solid rgba(255,255,255,.1)', borderTopColor:'#e63946', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  if (notFound || !club) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', background:'#030a24', color:'#fff', gap:16 }}>
      <div style={{ fontSize:'3rem' }}>🏟️</div>
      <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'2rem' }}>Club introuvable</div>
      <Link href="/clubs" style={{ color:'#e63946', textDecoration:'none', fontWeight:700 }}>← Voir tous les clubs</Link>
    </div>
  )

  const strengths = (club.strengths || '').split(',').map(s => s.trim()).filter(Boolean)
  const strengthLabels: Record<string, string> = {
    infrastructure:'Infrastructure de qualité', family:'Esprit familial', ambition:'Ambition sportive',
    youth:'Formation jeunes', competitive:'Équipe compétitive', atmosphere:'Bonne ambiance',
    professional:'Structure sérieuse', social:'Vie sociale active', equipment:'Bons équipements',
    local:'Ancrage local', growing:'Club en développement', welcoming:'Accueil de nouveaux joueurs',
  }

  const darkCard: React.CSSProperties = { background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:16, padding:'1.25rem' }

  return (
    <div style={{ background:'#030a24', minHeight:'100vh', color:'#fff' }}>
      <div style={{ maxWidth:900, margin:'0 auto', padding:'1.5rem' }}>

        <Link href="/clubs" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'rgba(255,255,255,.5)', textDecoration:'none', fontSize:13, marginBottom:'1.25rem' }}>
          ← Retour aux clubs
        </Link>

        {/* HERO */}
        <div style={{ background:'linear-gradient(135deg,#061540,#0a1f5c)', borderRadius:20, padding:'2rem', marginBottom:'1.25rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'1.5rem', flexWrap:'wrap' }}>
            <div style={{ width:80, height:80, borderRadius:16, background:'rgba(255,255,255,.1)', border:'2px solid rgba(255,255,255,.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize: club.avatar_url ? 0 : '2.5rem', overflow:'hidden', flexShrink:0 }}>
              {club.avatar_url
                ? <img src={avatarSrc(club.avatar_url)!} alt={club.club_name || ''} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:14 }} onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
                : '🏟️'
              }
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'2rem', color:'#fff', letterSpacing:1, lineHeight:1 }}>
                  {club.club_name || 'Club'}
                </div>
                {club.verified && <VerifiedBadge size={22} />}
              </div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
                {club.ligue && <span style={{ background:'rgba(255,255,255,.12)', border:'1px solid rgba(255,255,255,.2)', color:'rgba(255,255,255,.85)', fontSize:12, padding:'4px 12px', borderRadius:100 }}>🏆 {club.ligue}</span>}
                {club.zone && <span style={{ fontSize:13, color:'rgba(255,255,255,.6)' }}>📍 {club.zone}</span>}
                <span style={{ background: club.available ? 'rgba(13,122,54,.3)' : 'rgba(255,255,255,.1)', border:`1px solid ${club.available ? 'rgba(13,122,54,.5)' : 'rgba(255,255,255,.2)'}`, color:'rgba(255,255,255,.9)', fontSize:12, padding:'4px 12px', borderRadius:100 }}>
                  {club.available ? '🟢 Recrute' : '⚪ Complet'}
                </span>
              </div>
            </div>
            <Link href="/messages" style={{ background:'#e63946', color:'#fff', borderRadius:10, padding:'10px 20px', fontWeight:700, fontSize:13, textDecoration:'none', flexShrink:0 }}>
              💬 Contacter
            </Link>
          </div>
        </div>

        {/* INFO CARD */}
        <div style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:16, marginBottom:'1.25rem', overflow:'hidden' }}>
          <div style={{ background:'linear-gradient(135deg,#0d1f3c,#1a3a6b)', padding:'.85rem 1.25rem' }}>
            <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1rem', color:'#fff', letterSpacing:2 }}>Profil Club</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))' }}>
            {[
              { label:'Ligue',       value: club.ligue,  color:'#e02020' },
              { label:'Zone',        value: club.zone,   color:'#1a6fd4' },
              { label:'Recrutement', value: club.available ? 'Ouvert' : 'Complet', color: club.available ? '#0a7c3e' : '#888' },
              { label:'Vérifié',     value: club.verified ? 'Oui ✓' : null, color:'#1d9bf0' },
            ].filter(s => s.value).map((s, i, arr) => (
              <div key={s.label} style={{ padding:'1.2rem 1rem', borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,.07)' : 'none', textAlign:'center', position:'relative' }}>
                <div style={{ position:'absolute', top:0, left:'20%', right:'20%', height:3, background:s.color, borderRadius:'0 0 4px 4px' }} />
                <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.3rem', color:s.color, lineHeight:1.2, marginBottom:4 }}>{s.value}</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:1.5, fontWeight:700 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:'1.25rem' }} className="club-pg-grid">
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

            {/* BIO */}
            {club.bio && (
              <div style={darkCard}>
                <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.1rem', letterSpacing:1, marginBottom:'.75rem' }}>À propos</div>
                <p style={{ fontSize:14, color:'rgba(255,255,255,.65)', lineHeight:1.7 }}>{club.bio}</p>
              </div>
            )}

            {/* ANNONCES */}
            <div style={darkCard}>
              <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.1rem', letterSpacing:1, marginBottom:'1rem' }}>
                Annonces actives ({annonces.length})
              </div>
              {annonces.length === 0 ? (
                <p style={{ fontSize:14, color:'rgba(255,255,255,.4)', fontStyle:'italic' }}>Aucune annonce active pour le moment.</p>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
                  {annonces.map(a => (
                    <div key={a.id} style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)', borderRadius:12, padding:'1rem', borderLeft:'3px solid #e63946' }}>
                      <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>{a.title}</div>
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:8 }}>
                        {a.ligue && <span style={{ background:'rgba(255,255,255,.08)', color:'rgba(255,255,255,.7)', fontSize:11, fontWeight:600, padding:'2px 9px', borderRadius:100 }}>{a.ligue}</span>}
                        {a.position && <span style={{ background:'rgba(230,57,70,.12)', color:'#e67a80', fontSize:11, fontWeight:600, padding:'2px 9px', borderRadius:100 }}>{a.position}</span>}
                        {a.zone && <span style={{ background:'rgba(76,219,122,.1)', color:'#4cdb7a', fontSize:11, fontWeight:600, padding:'2px 9px', borderRadius:100 }}>{a.zone}</span>}
                      </div>
                      <p style={{ fontSize:13, color:'rgba(255,255,255,.55)', lineHeight:1.55, marginBottom:8 }}>{a.body}</p>
                      <Link href={`/annonces`} style={{ fontSize:12, color:'#3a8cff', fontWeight:600, textDecoration:'none' }}>Voir l'annonce →</Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* STRENGTHS */}
            {strengths.length > 0 && (
              <div style={darkCard}>
                <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.1rem', letterSpacing:1, marginBottom:'.75rem' }}>Points forts</div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {strengths.map(k => (
                    <span key={k} style={{ background:'rgba(255,255,255,.08)', color:'rgba(255,255,255,.8)', fontSize:13, fontWeight:600, padding:'5px 14px', borderRadius:100 }}>
                      {strengthLabels[k] || k}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
            <div style={darkCard}>
              <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.1rem', letterSpacing:1, marginBottom:'1rem' }}>Informations</div>
              {[
                club.zone ? ['Zone', club.zone] : null,
                club.ligue ? ['Ligue', club.ligue] : null,
                club.email ? ['Contact', club.email] : null,
              ].filter((r): r is [string, string] => Array.isArray(r)).map(([k, v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,.07)', fontSize:14 }}>
                  <span style={{ color:'rgba(255,255,255,.5)' }}>{k}</span>
                  <span style={{ fontWeight:600, color:k === 'Contact' ? '#3a8cff' : '#fff', wordBreak:'break-all', textAlign:'right', maxWidth:'60%' }}>{v}</span>
                </div>
              ))}
            </div>

            <Link href="/messages" style={{ background:'#e63946', color:'#fff', borderRadius:12, padding:'12px 16px', fontWeight:700, fontSize:14, textDecoration:'none', textAlign:'center', display:'block' }}>
              💬 Envoyer un message
            </Link>

            <Link href="/annonces" style={{ background:'rgba(255,255,255,.07)', color:'rgba(255,255,255,.7)', border:'1px solid rgba(255,255,255,.12)', borderRadius:12, padding:'12px 16px', fontWeight:600, fontSize:14, textDecoration:'none', textAlign:'center', display:'block' }}>
              📢 Voir toutes les annonces
            </Link>
          </div>
        </div>

        <style>{`
          @keyframes spin{to{transform:rotate(360deg);}}
          @media (max-width:640px) { .club-pg-grid { grid-template-columns: 1fr !important; } }
        `}</style>
      </div>
    </div>
  )
}
