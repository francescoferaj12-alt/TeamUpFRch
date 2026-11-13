'use client'

import { strengthLabel } from '../../../lib/strength-labels'
import { footballLabel } from '../../../lib/football-labels'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, Profile, CareerExperience, CoachCertificate, avatarSrc } from '../../../lib/supabase'
import MemberSafetyActions from '../../../components/MemberSafetyActions'
import VerifiedBadge from '../../../components/VerifiedBadge'
import CareerSection from '../../../components/CareerSection'
import { useLang } from '../../../lib/lang-context'

// ── SVG primitives (identici a /recherche, /annonces, /messages) ───────────────
const Svg = ({ children, size = 18, color = 'currentColor', ...p }: any) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    {children}
  </svg>
)
const IcoPlayer     = ({ s = 18 }: { s?: number }) => <Svg size={s}><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></Svg>
const IcoCoach      = ({ s = 18 }: { s?: number }) => <Svg size={s} strokeWidth="1.8"><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v6c0 1.5 4 4 9 4s9-2.5 9-4V7"/></Svg>
const IcoStadium    = ({ s = 18 }: { s?: number }) => <Svg size={s} strokeWidth="1.8"><path d="M3 21V8l9-5 9 5v13"/><path d="M9 21V12h6v9"/></Svg>
const IcoChatBubble = ({ s = 15 }: { s?: number }) => <Svg size={s} strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></Svg>
const IcoArrowLeft  = ({ s = 16 }: { s?: number }) => <Svg size={s}><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></Svg>
const IcoTrophy     = ({ s = 13 }: { s?: number }) => <Svg size={s}><path d="M8 21h8m-4-4v4M7 3H5a2 2 0 0 0-2 2v3a4 4 0 0 0 4 4h.5M17 3h2a2 2 0 0 1 2 2v3a4 4 0 0 1-4 4h-.5"/><path d="M7 3h10v9a5 5 0 0 1-10 0V3Z"/></Svg>
const IcoMapPin     = ({ s = 13 }: { s?: number }) => <Svg size={s}><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></Svg>
const IcoGradCap    = ({ s = 13 }: { s?: number }) => <Svg size={s}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></Svg>
const IcoCalendar   = ({ s = 13 }: { s?: number }) => <Svg size={s}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></Svg>
const IcoUsers      = ({ s = 13 }: { s?: number }) => <Svg size={s}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></Svg>
const IcoUserX      = ({ s = 52 }: { s?: number }) => <Svg size={s} strokeWidth="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" y1="11" x2="23" y2="17"/><line x1="23" y1="11" x2="17" y2="17"/></Svg>

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
    async function loadProfile() {
      const [{ data: auth }, { data: exps }, { data: certs }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from('career_experiences').select('*').eq('user_id', id).order('start_date', { ascending: false }),
        supabase.from('coach_certificates').select('*').eq('coach_id', id).order('created_at', { ascending: true }),
      ])
      const ownProfile = auth.user?.id === id
      const { data, error } = await supabase
        .from(ownProfile ? 'profiles' : 'public_profiles')
        .select('*')
        .eq('id', id)
        .single()
      if (error || !data) { setNotFound(true); setLoading(false); return }
      setProfile(data)
      setExperiences(exps || [])
      setCertificates(certs || [])
      setLoading(false)
    }
    loadProfile()
  }, [id])

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', background:'#081434' }}>
      <div style={{ width:36, height:36, border:'4px solid rgba(255,255,255,.1)', borderTopColor:'#FF3A3A', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  if (notFound || !profile) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', background:'#081434', color:'#fff', gap:16, padding:'2rem', textAlign:'center' }}>
      <div style={{ color:'rgba(255,255,255,.25)' }}><IcoUserX s={52} /></div>
      <div style={{ fontFamily:"'Russo One', sans-serif", fontSize:'1.8rem', letterSpacing:1 }}>{lang === 'de' ? 'Profil nicht gefunden' : 'Profil introuvable'}</div>
      <Link href="/recherche" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'#FF3A3A', textDecoration:'none', fontWeight:700, fontSize:14 }}>
        <IcoArrowLeft s={14} /> {lang === 'de' ? 'Alle Profile ansehen' : 'Voir tous les profils'}
      </Link>
    </div>
  )

  const initials = `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase()
  const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
  const displayName = profile.role === 'club' ? profile.club_name : fullName
  const roleIcon = (s = 18) =>
    profile.role === 'club' ? <IcoStadium s={s} /> : profile.role === 'coach' ? <IcoCoach s={s} /> : <IcoPlayer s={s} />
  const coachBadge = profile.role === 'coach' ? (profile.coach_specialty || null) : null
  const roleLabel = profile.role === 'player'
    ? (profile.genre === 'femme' ? (lang === 'de' ? 'Spielerin' : 'Joueuse') : (lang === 'de' ? 'Spieler' : 'Joueur'))
    : profile.role === 'coach'
    ? (profile.genre === 'femme' ? (lang === 'de' ? 'Trainerin' : 'Coache') : (lang === 'de' ? 'Trainer' : 'Coach'))
    : (lang === 'de' ? 'Verein' : 'Club')
  const strengths = (profile.strengths || '').split(',').map(s => s.trim()).filter(Boolean)
  const videoUrls = [profile.video1_url, profile.video2_url, profile.video3_url].filter(Boolean) as string[]

  const darkCard: React.CSSProperties = {
    background: '#0D1F4A',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: 16,
    padding: '1.25rem',
  }

  return (
    <div style={{ background:'#081434', minHeight:'100vh', color:'#fff' }}>
      <div className="pub-container" style={{ maxWidth:860, margin:'0 auto' }}>

        {/* Back */}
        <Link href="/recherche" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'#c7d1e3', textDecoration:'none', fontSize:13, marginBottom:'1.25rem' }}>
          <IcoArrowLeft s={14} /> {lang === 'de' ? 'Zurück zur Suche' : 'Retour à la recherche'}
        </Link>

        {/* Hero */}
        <div className="pub-hero" style={{ background:'#0D1F4A', border:'1px solid rgba(255,255,255,.1)', borderRadius:20, marginBottom:'1.25rem' }}>
          <div className="pub-hero-content">

            {/* Avatar */}
            <div style={{ width:90, height:90, borderRadius:'50%', background:'linear-gradient(135deg,#3a8cff,#1a5fb4)', border:'3px solid rgba(255,255,255,.2)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0 }}>
              {profile.avatar_url
                ? <img src={avatarSrc(profile.avatar_url)!} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
                : initials
                  ? <span style={{ fontSize:'2rem', fontWeight:700, color:'#fff', letterSpacing:1 }}>{initials}</span>
                  : <span style={{ color:'rgba(255,255,255,.8)' }}>{roleIcon(36)}</span>
              }
            </div>

            <div style={{ flex:1, minWidth:0 }}>
              {/* Display name */}
              <div style={{ fontFamily:"'Russo One', sans-serif", fontSize:'clamp(1.4rem, 4vw, 2rem)', color:'#fff', lineHeight:1.1, marginBottom:8, display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                {displayName || 'Profil'}
                {(profile.verified || (profile.role === 'club' && profile.club_verification_status === 'approved')) && <VerifiedBadge size={22} />}
              </div>

              {/* Badges row */}
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>

                {/* Role badge */}
                <span style={{ display:'inline-flex', alignItems:'center', gap:5, background:'rgba(255,255,255,.12)', padding:'4px 12px', borderRadius:100, fontSize:12, fontWeight:600, color:'rgba(255,255,255,.9)' }}>
                  {roleIcon(13)} {roleLabel}
                </span>


                {(coachBadge || profile.position) && (
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{footballLabel(coachBadge || profile.position!, lang)}</span>
                )}

                {/* Ligue */}
                {profile.ligue && (
                  <span style={{ display:'inline-flex', alignItems:'center', gap:5, background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.2)', fontSize:12, padding:'4px 12px', borderRadius:100, color:'rgba(255,255,255,.85)' }}>
                    <IcoTrophy s={12} /> {footballLabel(profile.ligue, lang)}
                  </span>
                )}

                {/* Zone */}
                {profile.zone && (
                  <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:13, color:'#c7d1e3' }}>
                    <IcoMapPin s={13} /> {footballLabel(profile.zone, lang)}
                  </span>
                )}

                {/* Player: foot */}
                {profile.role === 'player' && profile.foot && (
                  <span style={{ background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.2)', fontSize:12, padding:'4px 12px', borderRadius:100, color:'rgba(255,255,255,.85)' }}>
                    {footballLabel(profile.foot, lang)}
                  </span>
                )}

                {/* Player: jersey number */}
                {profile.role === 'player' && (profile as any).jersey_number != null && (
                  <span style={{ background:'rgba(255,58,58,.18)', border:'1px solid rgba(255,58,58,.4)', color:'#ffb3bb', fontSize:12, padding:'4px 12px', borderRadius:100, fontWeight:700 }}>
                    #{(profile as any).jersey_number}
                  </span>
                )}

                {/* Coach: diploma */}
                {profile.role === 'coach' && profile.coach_diploma && (
                  <span style={{ display:'inline-flex', alignItems:'center', gap:5, background:'rgba(58,122,255,.15)', border:'1px solid rgba(58,122,255,.35)', color:'#7eb6ff', fontSize:12, padding:'4px 12px', borderRadius:100, fontWeight:700 }}>
                    <IcoGradCap s={13} /> {profile.coach_diploma}
                  </span>
                )}

                {/* Club: founded year */}
                {profile.role === 'club' && (profile as any).club_founded_year != null && (
                  <span style={{ display:'inline-flex', alignItems:'center', gap:5, background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.2)', fontSize:12, padding:'4px 12px', borderRadius:100, color:'rgba(255,255,255,.85)' }}>
                    <IcoCalendar s={12} /> {lang === 'de' ? 'Gegründet' : 'Fondé en'} {(profile as any).club_founded_year}
                  </span>
                )}

                {/* Club: teams count */}
                {profile.role === 'club' && (profile as any).club_teams_count != null && (
                  <span style={{ display:'inline-flex', alignItems:'center', gap:5, background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.2)', fontSize:12, padding:'4px 12px', borderRadius:100, color:'rgba(255,255,255,.85)' }}>
                    <IcoUsers s={12} /> {(profile as any).club_teams_count} {lang === 'de' ? 'Teams' : 'équipes'}
                  </span>
                )}

                {/* Availability */}
                <span style={{ display:'inline-flex', alignItems:'center', gap:6, background: profile.available ? 'rgba(46,210,127,.12)' : 'rgba(255,58,58,.1)', border:`1px solid ${profile.available ? 'rgba(46,210,127,.3)' : 'rgba(255,58,58,.25)'}`, color:'rgba(255,255,255,.9)', fontSize:12, padding:'4px 12px', borderRadius:100 }}>
                  <span style={{ width:7, height:7, borderRadius:'50%', background: profile.available ? '#2ED27F' : '#FF3A3A', flexShrink:0 }} />
                  {profile.available ? (lang === 'de' ? 'Verfügbar' : 'Disponible') : (lang === 'de' ? 'Nicht verfügbar' : 'Non disponible')}
                </span>
              </div>

              {/* Strengths — text-only pills (Opzione A) */}
              {strengths.length > 0 && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:10 }}>
                  {(showAllStrengths ? strengths : strengths.slice(0, 5)).map(k => (
                    <span key={k} style={{ display:'inline-flex', alignItems:'center', padding:'4px 12px', borderRadius:999, background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.15)', fontSize:12, fontWeight:600, color:'rgba(255,255,255,.8)', whiteSpace:'nowrap' }}>
                      {strengthLabel(k, lang, profile.role)}
                    </span>
                  ))}
                  {strengths.length > 5 && !showAllStrengths && (
                    <button
                      onClick={() => setShowAllStrengths(true)}
                      style={{ cursor:'pointer', display:'inline-flex', alignItems:'center', padding:'4px 12px', borderRadius:999, background:'rgba(255,58,58,.12)', border:'1px solid rgba(255,58,58,.3)', fontSize:12, fontWeight:700, color:'#FF3A3A', fontFamily:'inherit' }}
                    >
                      +{strengths.length - 5} {lang === 'de' ? 'weitere' : 'de plus'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Message button */}
            <Link className="pub-contact" href={`/messages?partner=${id}`} style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#FF3A3A', color:'#fff', borderRadius:999, padding:'10px 22px', fontWeight:700, fontSize:13, textDecoration:'none', flexShrink:0, boxShadow:'0 4px 14px rgba(255,58,58,.35)' }}>
              <IcoChatBubble s={15} /> {lang === 'de' ? 'Nachricht senden' : 'Envoyer un message'}
            </Link>
          </div>
        </div>

        <div style={{ marginBottom: '1.25rem' }}><MemberSafetyActions key={id} memberId={id} /></div>

        {/* Stats (player only) */}


        {/* Club info card */}
        {profile.role === 'club' && (
          <div style={{ background:'#0D1F4A', border:'1px solid rgba(255,255,255,.1)', borderRadius:16, marginBottom:'1.25rem', overflow:'hidden' }}>
            <div style={{ background:'linear-gradient(135deg, #0D1F4A 0%, #081434 100%)', padding:'.85rem 1.25rem', borderBottom:'1px solid rgba(255,255,255,.07)' }}>
              <span style={{ fontFamily:"'Russo One', sans-serif", fontSize:'.9rem', color:'#fff', letterSpacing:2 }}>{lang === 'de' ? 'Vereinsprofil' : 'Profil Club'}</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))' }}>
              {[
                { label:(lang === 'de' ? 'Liga' : 'Ligue'),       value: profile.ligue,  color:'#FF3A3A' },
                { label:(lang === 'de' ? 'Region' : 'Zone'),        value: profile.zone,   color:'#3A7AFF' },
                { label:(lang === 'de' ? 'Spielersuche' : 'Recrutement'), value: profile.available ? (lang === 'de' ? 'Offen' : 'Ouvert') : (lang === 'de' ? 'Geschlossen' : 'Complet'), color: profile.available ? '#2ED27F' : 'rgba(255,255,255,.4)' },
                { label:(lang === 'de' ? 'Verifiziert' : 'Vérifié'),     value: profile.verified ? (lang === 'de' ? 'Ja ✓' : 'Oui ✓') : null, color:'#3A7AFF' },
              ].filter(s => s.value).map((s, i, arr) => (
                <div key={s.label} style={{ padding:'1.2rem 1rem', borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,.07)' : 'none', textAlign:'center', position:'relative' }}>
                  <div style={{ position:'absolute', top:0, left:'20%', right:'20%', height:3, background:s.color, borderRadius:'0 0 4px 4px' }} />
                  <div style={{ fontFamily:"'Russo One', sans-serif", fontSize:'1.15rem', color:s.color, lineHeight:1.2, marginBottom:4 }}>{s.value ? footballLabel(s.value, lang) : null}</div>
                  <div style={{ fontSize:10, color:'#c7d1e3', textTransform:'uppercase', letterSpacing:1.5, fontWeight:700 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coach info card */}
        {profile.role === 'coach' && (profile.coach_experience || profile.coach_diploma || profile.coach_specialty || profile.coach_availability) && (
          <div style={{ background:'#0D1F4A', border:'1px solid rgba(255,255,255,.1)', borderRadius:16, marginBottom:'1.25rem', overflow:'hidden' }}>
            <div style={{ background:'linear-gradient(135deg, #0D1F4A 0%, #081434 100%)', padding:'.85rem 1.25rem', borderBottom:'1px solid rgba(255,255,255,.07)' }}>
              <span style={{ fontFamily:"'Russo One', sans-serif", fontSize:'.9rem', color:'#fff', letterSpacing:2 }}>{lang === 'de' ? 'Trainerprofil' : 'Profil Entraîneur'}</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))' }}>
              {[
                { label:(lang === 'de' ? 'Erfahrung' : 'Expérience'), value:profile.coach_experience, color:'#FF3A3A' },
                { label:(lang === 'de' ? 'Diplom' : 'Diplôme'),    value:profile.coach_diploma,    color:'#3A7AFF' },
                { label:(lang === 'de' ? 'Spezialgebiet' : 'Spécialité'), value:profile.coach_specialty,  color:'#2ED27F' },
                { label:(lang === 'de' ? 'Status' : 'Statut'),     value:profile.coach_availability, color:'#FF9A3A' },
              ].filter(s => s.value).map((s, i, arr) => (
                <div key={s.label} style={{ padding:'1.2rem 1rem', borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,.07)' : 'none', textAlign:'center', position:'relative' }}>
                  <div style={{ position:'absolute', top:0, left:'20%', right:'20%', height:3, background:s.color, borderRadius:'0 0 4px 4px' }} />
                  <div style={{ fontFamily:"'Russo One', sans-serif", fontSize:'1.15rem', color:s.color, lineHeight:1.2, marginBottom:4 }}>{s.value ? footballLabel(s.value, lang) : null}</div>
                  <div style={{ fontSize:10, color:'#c7d1e3', textTransform:'uppercase', letterSpacing:1.5, fontWeight:700 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Videos — hidden for clubs */}
        {profile.role !== 'club' && videoUrls.length > 0 && (
          <div style={{ ...darkCard, marginBottom: '1.25rem' }}>
            <div style={{ fontFamily:"'Russo One', sans-serif", fontSize:'1rem', letterSpacing:1, marginBottom:'.75rem', color:'rgba(255,255,255,.9)' }}>Highlights</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              {videoUrls.map((url, i) => {
                const embed = getYouTubeEmbed(url)
                const isNative = !embed && /\.(mp4|mov|webm)(\?|$)/i.test(url)
                if (embed) return (
                  <div key={i} style={{ position:'relative', paddingBottom:'56.25%', borderRadius:12, overflow:'hidden', background:'#000' }}>
                    <iframe loading="lazy" src={embed} title={`Video ${i+1}`} frameBorder="0" allowFullScreen
                      style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%' }} />
                  </div>
                )
                if (isNative) return (
                  <div key={i} style={{ borderRadius:12, overflow:'hidden', background:'#000' }}>
                    <video preload="none" src={url} controls playsInline style={{ width:'100%', maxHeight:320, display:'block', objectFit:'cover' }} />
                  </div>
                )
                return null
              })}
            </div>
          </div>
        )}

        {/* Career section — player & coach only */}
        {profile.role !== 'club' && (
          <CareerSection seasonProfile={profile} experiences={experiences} role={profile.role as 'player'|'coach'} lang={lang} />
        )}

        {/* Coach certificates */}
        {profile.role === 'coach' && certificates.length > 0 && (
          <div style={{ background:'#0D1F4A', border:'1px solid rgba(255,255,255,.1)', borderRadius:16, marginBottom:'1.25rem', overflow:'hidden' }}>
            <div style={{ background:'linear-gradient(135deg, #0D1F4A 0%, #081434 100%)', padding:'.85rem 1.25rem', borderBottom:'1px solid rgba(255,255,255,.07)', display:'flex', alignItems:'center', gap:8 }}>
              <IcoGradCap s={15} />
              <span style={{ fontFamily:"'Russo One', sans-serif", fontSize:'.9rem', color:'#fff', letterSpacing:2 }}>
                {lang === 'fr' ? 'Certificats & Diplômes' : 'Zertifikate & Diplome'}
              </span>
            </div>
            <div style={{ padding:'1rem 1.25rem', display:'flex', flexWrap:'wrap', gap:10 }}>
              {certificates.map(c => (
                <div key={c.id} style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(58,122,255,.1)', border:'1px solid rgba(58,122,255,.25)', borderRadius:10, padding:'8px 16px' }}>
                  <IcoGradCap s={15} />
                  <span style={{ fontWeight:700, fontSize:14, color:'#fff' }}>{c.name}</span>
                  {c.year && <span style={{ fontSize:12, color:'#c7d1e3', fontWeight:600 }}>{c.year}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pub-grid">
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

            {/* Bio */}
            {profile.bio && (
              <div style={darkCard}>
                <div style={{ fontFamily:"'Russo One', sans-serif", fontSize:'1rem', letterSpacing:1, marginBottom:'.75rem', color:'rgba(255,255,255,.9)' }}>{lang === 'de' ? 'Über mich' : 'À propos'}</div>
                <p style={{ fontSize:15, color:'#c7d1e3', lineHeight:1.75, margin:0 }}>{profile.bio}</p>
              </div>
            )}

            {/* Club categories */}
            {profile.role === 'club' && (profile as any).club_categories && (
              <div style={darkCard}>
                <div style={{ fontFamily:"'Russo One', sans-serif", fontSize:'1rem', letterSpacing:1, marginBottom:'1rem', paddingBottom:'.75rem', borderBottom:'1px solid rgba(255,255,255,.08)', display:'flex', alignItems:'center', gap:8 }}>
                  <IcoStadium s={15} /> {lang === 'fr' ? 'Catégories proposées' : 'Angebotene Kategorien'}
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

          </div>

          {/* Sidebar */}
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
            <div style={darkCard}>
              <div style={{ fontFamily:"'Russo One', sans-serif", fontSize:'1rem', letterSpacing:1, marginBottom:'1rem', color:'rgba(255,255,255,.9)' }}>{lang === 'de' ? 'Informationen' : 'Informations'}</div>
              {[
                profile.role === 'player' && profile.foot ? [(lang === 'de' ? 'Starker Fuss' : 'Pied'), profile.foot] : null,
                profile.role === 'player' && (profile as any).position_secondary ? [(lang === 'de' ? 'Zweitposition' : 'Position 2'), (profile as any).position_secondary] : null,
                profile.role === 'player' && (profile as any).height_cm ? [(lang === 'de' ? 'Grösse' : 'Taille'), `${(profile as any).height_cm} cm`] : null,
                profile.role === 'player' && (profile as any).level ? [(lang === 'de' ? 'Niveau' : 'Niveau'), (profile as any).level] : null,
                profile.zone ? [(lang === 'de' ? 'Region' : 'Zone'), profile.zone] : null,
                profile.role !== 'coach' && profile.ligue ? [(lang === 'de' ? 'Liga' : 'Ligue'), profile.ligue] : null,
                profile.role === 'player' && profile.position ? ['Position', profile.position] : null,
                profile.club_name && profile.role !== 'club' ? [(lang === 'de' ? 'Verein' : 'Club'), profile.club_name] : null,
                profile.role === 'coach' && profile.coach_experience ? [(lang === 'de' ? 'Erfahrung' : 'Expérience'), profile.coach_experience] : null,
                profile.role === 'coach' && profile.coach_diploma ? [(lang === 'de' ? 'Diplom' : 'Diplôme'), profile.coach_diploma] : null,
                profile.role === 'coach' && profile.coach_specialty ? [(lang === 'de' ? 'Spezialgebiet' : 'Spécialité'), profile.coach_specialty] : null,
                profile.role === 'coach' && profile.coach_availability ? [(lang === 'de' ? 'Verfügbarkeit' : 'Disponibilité'), profile.coach_availability] : null,
                profile.role === 'club' && (profile as any).club_stadium_name ? [(lang === 'de' ? 'Stadion' : 'Stade'), (profile as any).club_stadium_name] : null,
                profile.role === 'club' && (profile as any).club_stadium_address ? [(lang === 'de' ? 'Adresse' : 'Adresse'), (profile as any).club_stadium_address] : null,
              ].filter((r): r is [string, string] => Array.isArray(r)).map(([k, v]) => (
                <div key={k} className="profile-info-row" style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,.07)', fontSize:14 }}>
                  <span style={{ color:'#c7d1e3' }}>{k}</span>
                  <span className="profile-info-value" style={{ fontWeight:600, color:'#fff' }}>{footballLabel(v, lang)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <style>{`
          .pub-container { padding: 1.5rem; }
          .pub-hero { padding: 2rem; }
          .pub-hero-content { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
          .pub-grid {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 280px;
            gap: 1.25rem;
          }
          @media (max-width: 720px) {
            .pub-container { padding: 1rem; }
            .pub-hero { padding: 1.25rem; }
            .pub-hero-content { gap: 1rem; }
            .pub-contact { width: 100%; min-height: 44px; justify-content: center; }
            .pub-grid { grid-template-columns: minmax(0, 1fr); }
          }
        `}</style>
      </div>
    </div>
  )
}
