'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, Profile, CareerExperience, CoachCertificate, avatarSrc } from '../../../lib/supabase'
import VerifiedBadge from '../../../components/VerifiedBadge'
import CareerSection from '../../../components/CareerSection'
import { strengthIcon } from '../../../lib/strength-icons'
import { useLang } from '../../../lib/lang-context'

const CATEGORY_LABELS: Record<string, { fr: string; de: string }> = {
  cat_seniors_h:  { fr: 'Seniors hommes', de: 'Senioren Männer' },
  cat_seniors_f:  { fr: 'Seniors femmes', de: 'Senioren Frauen' },
  cat_youth:      { fr: 'Youth League',   de: 'Youth League' },
  cat_juniors_a:  { fr: 'Juniors A',      de: 'Junioren A' },
  cat_juniors_b:  { fr: 'Juniors B',      de: 'Junioren B' },
  cat_juniors_c:  { fr: 'Juniors C',      de: 'Junioren C' },
  cat_juniors_d:  { fr: 'Juniors D',      de: 'Junioren D' },
  cat_juniores_f: { fr: 'Juniors filles', de: 'Juniorinnen' },
  cat_veterans:   { fr: 'Vétérans',       de: 'Veteranen' },
}

function strengthLabel(key: string) {
  const map: Record<string, string> = {
    fast:'Rapide', technical:'Technique', physical:'Physique', dribbling:'Dribble',
    shooting:'Frappe puissante', finishing:'Finition', passing:'Passes précises',
    vision:'Vision du jeu', aerial:'Jeu aérien', onevsone:'1 contre 1',
    sprint:'Vitesse de pointe', pressing:'Pressing', defensive:'Défensif',
    offensive:'Offensif', leadership:'Leadership', hardworking:'Travailleur',
    composed:'Calme', precise:'Précis', tactical:'Tactique', motivator:'Motivateur',
    communication:'Communication', experienced:'Expérimenté', video:'Analyse vidéo',
    youth:'Formation des jeunes', defense:'Défense organisée', counter:'Contre-attaque',
    possession:'Jeu de possession', innovative:'Innovateur', fitness:'Préparation physique',
    infrastructure:'Infrastructure de qualité', family:'Esprit familial',
    ambition:'Ambition sportive', competitive:'Équipe compétitive',
    atmosphere:'Bonne ambiance', professional:'Structure sérieuse',
    social:'Vie sociale active', equipment:'Bons équipements',
    local:'Ancrage local', growing:'Club en développement', welcoming:'Accueil ouvert',
  }
  return map[key] || key
}

function getYouTubeEmbed(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be') return `https://www.youtube.com/embed/${u.pathname.slice(1)}`
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v')
      if (v) return `https://www.youtube.com/embed/${v}`
    }
    return null
  } catch { return null }
}

export default function PublicProfilPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { lang } = useLang()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [experiences, setExperiences] = useState<CareerExperience[]>([])
  const [certificates, setCertificates] = useState<CoachCertificate[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [showAllStrengths, setShowAllStrengths] = useState(false)

  useEffect(() => {
    Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase.from('career_experiences').select('*').eq('user_id', id).order('start_date', { ascending: false }),
      supabase.from('coach_certificates').select('*').eq('coach_id', id).order('created_at', { ascending: true }),
    ]).then(([{ data, error }, { data: exps }, { data: certs }]) => {
      if (error || !data) { setNotFound(true); setLoading(false); return }
      setProfile(data)
      setExperiences(exps || [])
      setCertificates(certs || [])
      setLoading(false)
    })
  }, [id])

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', background:'#030a24' }}>
      <div style={{ width:36, height:36, border:'4px solid rgba(255,255,255,.1)', borderTopColor:'#e63946', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  if (notFound || !profile) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', background:'#030a24', color:'#fff', gap:16 }}>
      <div style={{ fontSize:'3rem' }}>😔</div>
      <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'2rem' }}>Profil introuvable</div>
      <Link href="/recherche" style={{ color:'#e63946', textDecoration:'none', fontWeight:700 }}>← Voir tous les profils</Link>
    </div>
  )

  const initials = `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase()
  const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
  const displayName = profile.role === 'club' ? profile.club_name : fullName
  const roleEmoji = profile.role === 'player' ? '⚽' : profile.role === 'coach' ? '🎽' : '🏟️'
  const coachBadge = profile.role === 'coach' ? (profile.coach_specialty || null) : null
  const roleLabel = profile.role === 'player'
    ? (profile.genre === 'femme' ? 'Joueuse' : 'Joueur')
    : profile.role === 'coach'
    ? (profile.genre === 'femme' ? 'Coache' : 'Coach')
    : 'Club'
  const strengths = (profile.strengths || '').split(',').map(s => s.trim()).filter(Boolean)
  const videoUrls = [profile.video1_url, profile.video2_url, profile.video3_url].filter(Boolean) as string[]

  const darkCard: React.CSSProperties = { background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:16, padding:'1.25rem' }

  return (
    <div style={{ background:'#030a24', minHeight:'100vh', color:'#fff' }}>
      <div style={{ maxWidth:860, margin:'0 auto', padding:'1.5rem' }}>

        {/* Back */}
        <Link href="/annonces" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'rgba(255,255,255,.5)', textDecoration:'none', fontSize:13, marginBottom:'1.25rem' }}>
          ← Retour aux annonces
        </Link>

        {/* Hero */}
        <div style={{ background:'linear-gradient(135deg,#061540,#0a1f5c)', borderRadius:20, padding:'2rem', marginBottom:'1.25rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'1.5rem', flexWrap:'wrap' }}>
            <div style={{ width:90, height:90, borderRadius:'50%', background:'linear-gradient(135deg,#3a8cff,#1a5fb4)', border:'3px solid rgba(255,255,255,.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize: profile.avatar_url ? 0 : '2rem', fontWeight:700, overflow:'hidden', flexShrink:0 }}>
              {profile.avatar_url
                ? <img src={avatarSrc(profile.avatar_url)!} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
                : (initials || roleEmoji)
              }
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'2rem', color:'#fff', letterSpacing:1, lineHeight:1, marginBottom:6, display:'flex', alignItems:'center', gap:4 }}>
                {displayName || profile.email}
                {profile.verified && <VerifiedBadge size={22} />}
              </div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
                <span style={{ background:'rgba(255,255,255,.15)', padding:'4px 12px', borderRadius:100, fontSize:12, fontWeight:600 }}>
                  {roleEmoji} {coachBadge || profile.position || roleLabel}
                </span>
                {profile.ligue && <span style={{ background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.2)', fontSize:12, padding:'4px 12px', borderRadius:100 }}>🏆 {profile.ligue}</span>}
                {profile.zone && <span style={{ fontSize:13, color:'rgba(255,255,255,.6)' }}>📍 {profile.zone}</span>}

                {/* Player extras */}
                {profile.role === 'player' && profile.foot && (
                  <span style={{ background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.2)', fontSize:12, padding:'4px 12px', borderRadius:100 }}>🦶 {profile.foot}</span>
                )}
                {profile.role === 'player' && (profile as any).jersey_number != null && (
                  <span style={{ background:'rgba(230,57,70,.18)', border:'1px solid rgba(230,57,70,.4)', color:'#ffb3bb', fontSize:12, padding:'4px 12px', borderRadius:100, fontWeight:700 }}>#{(profile as any).jersey_number}</span>
                )}

                {/* Coach extras */}
                {profile.role === 'coach' && profile.coach_diploma && (
                  <span style={{ background:'rgba(58,140,255,.15)', border:'1px solid rgba(58,140,255,.35)', color:'#7eb6ff', fontSize:12, padding:'4px 12px', borderRadius:100, fontWeight:700 }}>🎓 {profile.coach_diploma}</span>
                )}

                {/* Club extras */}
                {profile.role === 'club' && (profile as any).club_founded_year != null && (
                  <span style={{ background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.2)', fontSize:12, padding:'4px 12px', borderRadius:100 }}>📅 Fondé en {(profile as any).club_founded_year}</span>
                )}
                {profile.role === 'club' && (profile as any).club_teams_count != null && (
                  <span style={{ background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.2)', fontSize:12, padding:'4px 12px', borderRadius:100 }}>👥 {(profile as any).club_teams_count} équipes</span>
                )}

                <span style={{ background: profile.available ? 'rgba(13,122,54,.3)' : 'rgba(255,255,255,.1)', border:`1px solid ${profile.available ? 'rgba(13,122,54,.5)' : 'rgba(255,255,255,.2)'}`, color:'rgba(255,255,255,.95)', fontSize:12, padding:'4px 12px', borderRadius:100 }}>
                  {profile.available ? '🟢 Disponible' : '🔴 Non disponible'}
                </span>
              </div>

              {strengths.length > 0 && (
                <div className="strengths-row">
                  {(showAllStrengths ? strengths : strengths.slice(0, 5)).map(k => (
                    <span key={k} className="strength-tag">
                      <span className="strength-icon">{strengthIcon(k)}</span>
                      {strengthLabel(k)}
                    </span>
                  ))}
                  {strengths.length > 5 && !showAllStrengths && (
                    <button
                      onClick={() => setShowAllStrengths(true)}
                      className="strength-tag strength-more"
                      style={{ cursor:'pointer', border:'none', fontFamily:'inherit' }}
                    >
                      +{strengths.length - 5} de plus
                    </button>
                  )}
                </div>
              )}
            </div>
            <Link href={`/messages?partner=${id}`} style={{ background:'#e63946', color:'#fff', borderRadius:10, padding:'10px 20px', fontWeight:700, fontSize:13, textDecoration:'none', flexShrink:0 }}>
              💬 Envoyer un message
            </Link>
          </div>
        </div>

        {/* Career section — player & coach only */}
        {profile.role !== 'club' && (
          <CareerSection experiences={experiences} role={profile.role as 'player'|'coach'} lang={lang} />
        )}

        {/* Stats (player only) */}
        {profile.role === 'player' && (() => {
          const now = new Date()
          const sy = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1
          const seasonNow  = `${sy} – ${String(sy + 1).slice(2)}`
          const seasonPrev = `${sy - 1} – ${String(sy).slice(2)}`
          const hasCurrent = profile.goals || profile.assists || profile.matches
          const hasPrev    = profile.goals_prev != null || profile.assists_prev != null || profile.matches_prev != null
          if (!hasCurrent && !hasPrev) return null
          const currentStats = [
            { v: profile.goals ?? 0,   k: 'Buts',   color:'#e02020' },
            { v: profile.assists ?? 0, k: 'Assists', color:'#1a6fd4' },
            { v: profile.matches ?? 0, k: 'Matchs',  color:'#0a7c3e' },
          ]
          const prevStats = [
            { v: profile.goals_prev,   k: 'Buts',   color:'#e02020' },
            { v: profile.assists_prev, k: 'Assists', color:'#1a6fd4' },
            { v: profile.matches_prev, k: 'Matchs',  color:'#0a7c3e' },
          ]
          return (
            <div style={{ ...darkCard, marginBottom:'1.25rem', overflow:'hidden', padding:0 }}>
              {/* Current season */}
              <div style={{ background:'linear-gradient(135deg,#0d1f3c,#1a3a6b)', padding:'.75rem 1.25rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1rem', color:'#fff', letterSpacing:2 }}>Saison actuelle</span>
                <span style={{ fontSize:11, color:'rgba(255,255,255,.5)', fontWeight:600 }}>{seasonNow}</span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', textAlign:'center' }}>
                {currentStats.map((s, i) => {
                  const prev = prevStats[i].v
                  const delta = prev != null ? s.v - prev : null
                  return (
                    <div key={s.k} style={{ padding:'1.2rem .5rem', borderRight: i < 2 ? '1px solid rgba(255,255,255,.07)' : 'none' }}>
                      <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'2.8rem', color:s.color, lineHeight:1 }}>{s.v}</div>
                      <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:1.5, marginTop:4, fontWeight:700 }}>{s.k}</div>
                      {delta !== null && (
                        <div style={{ marginTop:6, fontSize:11, fontWeight:700, color: delta > 0 ? '#4cdb7a' : delta < 0 ? '#ff6b6b' : 'rgba(255,255,255,.4)', background: delta > 0 ? 'rgba(76,219,122,.12)' : delta < 0 ? 'rgba(255,107,107,.12)' : 'rgba(255,255,255,.06)', borderRadius:100, padding:'2px 8px', display:'inline-block' }}>
                          {delta > 0 ? '▲' : delta < 0 ? '▼' : '–'} {Math.abs(delta)}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              {/* Previous season */}
              {hasPrev && (
                <>
                  <div style={{ background:'linear-gradient(135deg,#3a4a66,#5a6c8a)', padding:'.75rem 1.25rem', display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid rgba(255,255,255,.07)' }}>
                    <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1rem', color:'#fff', letterSpacing:2 }}>Saison précédente</span>
                    <span style={{ fontSize:11, color:'rgba(255,255,255,.55)', fontWeight:600 }}>{seasonPrev}</span>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', textAlign:'center' }}>
                    {prevStats.map((s, i) => (
                      <div key={s.k} style={{ padding:'1rem .5rem .9rem', borderRight: i < 2 ? '1px solid rgba(255,255,255,.07)' : 'none', background:'rgba(255,255,255,.02)' }}>
                        <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'2rem', color:s.color, opacity:.85, lineHeight:1 }}>{s.v ?? '—'}</div>
                        <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:1.5, marginTop:4, fontWeight:700 }}>{s.k}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )
        })()}

        {/* Club info card */}
        {profile.role === 'club' && (
          <div style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:16, marginBottom:'1.25rem', overflow:'hidden' }}>
            <div style={{ background:'linear-gradient(135deg,#0d1f3c,#1a3a6b)', padding:'.85rem 1.25rem' }}>
              <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1rem', color:'#fff', letterSpacing:2 }}>Profil Club</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))' }}>
              {[
                { label:'Ligue',       value: profile.ligue,  color:'#e02020' },
                { label:'Zone',        value: profile.zone,   color:'#1a6fd4' },
                { label:'Recrutement', value: profile.available ? 'Ouvert' : 'Complet', color: profile.available ? '#0a7c3e' : '#888' },
                { label:'Vérifié',     value: profile.verified ? 'Oui ✓' : null, color:'#1d9bf0' },
              ].filter(s => s.value).map((s, i, arr) => (
                <div key={s.label} style={{ padding:'1.2rem 1rem', borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,.07)' : 'none', textAlign:'center', position:'relative' }}>
                  <div style={{ position:'absolute', top:0, left:'20%', right:'20%', height:3, background:s.color, borderRadius:'0 0 4px 4px' }} />
                  <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.3rem', color:s.color, lineHeight:1.2, marginBottom:4 }}>{s.value}</div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:1.5, fontWeight:700 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coach info card */}
        {profile.role === 'coach' && (profile.coach_experience || profile.coach_diploma || profile.coach_specialty || profile.coach_availability) && (
          <div style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:16, marginBottom:'1.25rem', overflow:'hidden' }}>
            <div style={{ background:'linear-gradient(135deg,#0d1f3c,#1a3a6b)', padding:'.85rem 1.25rem' }}>
              <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1rem', color:'#fff', letterSpacing:2 }}>Profil Entraîneur</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))' }}>
              {[
                { label:'Expérience', value:profile.coach_experience, color:'#e02020' },
                { label:'Diplôme',    value:profile.coach_diploma,    color:'#1a6fd4' },
                { label:'Spécialité', value:profile.coach_specialty,  color:'#0a7c3e' },
                { label:'Statut',     value:profile.coach_availability, color:'#b56cf0' },
              ].filter(s => s.value).map((s, i, arr) => (
                <div key={s.label} style={{ padding:'1.2rem 1rem', borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,.07)' : 'none', textAlign:'center', position:'relative' }}>
                  <div style={{ position:'absolute', top:0, left:'20%', right:'20%', height:3, background:s.color, borderRadius:'0 0 4px 4px' }} />
                  <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.3rem', color:s.color, lineHeight:1.2, marginBottom:4 }}>{s.value}</div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:1.5, fontWeight:700 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coach certificates */}
        {profile.role === 'coach' && certificates.length > 0 && (
          <div style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:16, marginBottom:'1.25rem', overflow:'hidden' }}>
            <div style={{ background:'linear-gradient(135deg,#0d1f3c,#1a3a6b)', padding:'.85rem 1.25rem' }}>
              <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1rem', color:'#fff', letterSpacing:2 }}>
                🎓 {lang === 'fr' ? 'Certificats & Diplômes' : 'Zertifikate & Diplome'}
              </span>
            </div>
            <div style={{ padding:'1rem 1.25rem', display:'flex', flexWrap:'wrap', gap:10 }}>
              {certificates.map(c => (
                <div key={c.id} style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(58,140,255,.1)', border:'1px solid rgba(58,140,255,.25)', borderRadius:10, padding:'8px 16px' }}>
                  <span style={{ fontSize:16 }}>🎓</span>
                  <span style={{ fontWeight:700, fontSize:14, color:'#fff' }}>{c.name}</span>
                  {c.year && <span style={{ fontSize:12, color:'rgba(255,255,255,.4)', fontWeight:600 }}>{c.year}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:'1.25rem' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

            {/* Bio */}
            {profile.bio && (
              <div style={darkCard}>
                <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.1rem', letterSpacing:1, marginBottom:'.75rem' }}>À propos</div>
                <p style={{ fontSize:14, color:'rgba(255,255,255,.65)', lineHeight:1.7 }}>{profile.bio}</p>
              </div>
            )}

            {/* Club categories */}
            {profile.role === 'club' && (profile as any).club_categories && (
              <div style={darkCard}>
                <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.1rem', letterSpacing:1, marginBottom:'1rem', paddingBottom:'.75rem', borderBottom:'1px solid rgba(255,255,255,.08)' }}>
                  ⚽ {lang === 'fr' ? 'Catégories proposées' : 'Angebotene Kategorien'}
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {((profile as any).club_categories as string)
                    .split(',').map((s: string) => s.trim()).filter(Boolean)
                    .map((key: string) => {
                      const label = CATEGORY_LABELS[key]?.[lang] || key
                      return (
                        <span key={key} style={{ background:'rgba(255,255,255,.07)', border:'1.5px solid rgba(255,255,255,.2)', color:'rgba(255,255,255,.85)', borderRadius:100, padding:'5px 16px', fontSize:13, fontWeight:600 }}>
                          {label}
                        </span>
                      )
                    })}
                </div>
              </div>
            )}

            {/* Videos — hidden for clubs */}
            {profile.role !== 'club' && videoUrls.length > 0 && (
              <div style={darkCard}>
                <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.1rem', letterSpacing:1, marginBottom:'.75rem' }}>Highlights</div>
                <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                  {videoUrls.map((url, i) => {
                    const embed = getYouTubeEmbed(url)
                    const isNative = !embed && /\.(mp4|mov|webm)(\?|$)/i.test(url)
                    if (embed) return (
                      <div key={i} style={{ position:'relative', paddingBottom:'56.25%', borderRadius:12, overflow:'hidden', background:'#000' }}>
                        <iframe src={embed} title={`Video ${i+1}`} frameBorder="0" allowFullScreen
                          style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%' }} />
                      </div>
                    )
                    if (isNative) return (
                      <div key={i} style={{ borderRadius:12, overflow:'hidden', background:'#000' }}>
                        <video src={url} controls playsInline style={{ width:'100%', maxHeight:320, display:'block', objectFit:'cover' }} />
                      </div>
                    )
                    return null
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
            <div style={darkCard}>
              <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.1rem', letterSpacing:1, marginBottom:'1rem' }}>Informations</div>
              {[
                profile.role === 'player' && profile.foot ? ['Pied', profile.foot] : null,
                profile.role === 'player' && (profile as any).position_secondary ? ['Position 2', (profile as any).position_secondary] : null,
                profile.role === 'player' && (profile as any).height_cm ? ['Taille', `${(profile as any).height_cm} cm`] : null,
                profile.role === 'player' && (profile as any).level ? ['Niveau', (profile as any).level] : null,
                profile.zone ? ['Zone', profile.zone] : null,
                profile.role !== 'coach' && profile.ligue ? ['Ligue', profile.ligue] : null,
                profile.role === 'player' && profile.position ? ['Position', profile.position] : null,
                profile.club_name && profile.role !== 'club' ? ['Club', profile.club_name] : null,
                profile.role === 'coach' && profile.coach_experience ? ['Expérience', profile.coach_experience] : null,
                profile.role === 'coach' && profile.coach_diploma ? ['Diplôme', profile.coach_diploma] : null,
                profile.role === 'coach' && profile.coach_specialty ? ['Spécialité', profile.coach_specialty] : null,
                profile.role === 'coach' && profile.coach_availability ? ['Disponibilité', profile.coach_availability] : null,
                profile.role === 'club' && (profile as any).club_stadium_name ? ['Stade', (profile as any).club_stadium_name] : null,
                profile.role === 'club' && (profile as any).club_stadium_address ? ['Adresse', (profile as any).club_stadium_address] : null,
              ].filter((r): r is [string, string] => Array.isArray(r)).map(([k, v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,.07)', fontSize:14 }}>
                  <span style={{ color:'rgba(255,255,255,.5)' }}>{k}</span>
                  <span style={{ fontWeight:600, color:'#fff' }}>{v}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        <style>{`
          @media (max-width: 640px) {
            .pub-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </div>
  )
}
