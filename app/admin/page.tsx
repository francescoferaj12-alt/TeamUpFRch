'use client'

import { useEffect, useState } from 'react'
import { supabase, Profile, avatarSrc } from '../../lib/supabase'
import VerifiedBadge from '../../components/VerifiedBadge'

const ADMIN_EMAIL = 'teamupfr.ch@gmail.com'

export default function AdminPage() {
  const [authChecked, setAuthChecked] = useState(false)
  const [authorized, setAuthorized] = useState(false)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email === ADMIN_EMAIL) {
        setAuthorized(true)
        loadProfiles()
      }
      setAuthChecked(true)
    })
  }, [])

  async function loadProfiles() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['club', 'coach', 'player'])
      .order('created_at', { ascending: false })
    if (data) setProfiles(data)
    setLoading(false)
  }

  async function setVerified(profileId: string, value: boolean) {
    setBusy(profileId)
    const profile = profiles.find(c => c.id === profileId)
    const { error } = await supabase
      .from('profiles')
      .update({ verified: value })
      .eq('id', profileId)
    if (error) {
      alert('Erreur: ' + error.message)
    } else {
      setProfiles(prev => prev.map(c => c.id === profileId ? { ...c, verified: value } : c))
      const displayName = profile?.role === 'club'
        ? profile.club_name
        : `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim()
      if (profile?.email) {
        await fetch('/api/send-verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clubName: displayName, clubEmail: profile.email, verified: value }),
        })
      }
    }
    setBusy(null)
  }

  if (!authChecked) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#030a24' }}>
      <div style={{ width:36, height:36, border:'4px solid rgba(255,255,255,.1)', borderTopColor:'#e63946', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  if (!authorized) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#030a24', color:'#fff', gap:16 }}>
      <div style={{ fontSize:'3rem' }}>🔒</div>
      <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'2rem' }}>Accès refusé</div>
      <p style={{ color:'rgba(255,255,255,.5)', fontSize:14 }}>Cette page est réservée aux administrateurs.</p>
    </div>
  )

  const verified = profiles.filter(c => c.verified)
  const pending = profiles.filter(c => !c.verified)

  return (
    <div style={{ background:'#030a24', minHeight:'100vh', color:'#fff', padding:'2rem' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      <div style={{ maxWidth:900, margin:'0 auto' }}>
        <div style={{ marginBottom:'2rem' }}>
          <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'2.5rem', letterSpacing:2, marginBottom:'.25rem' }}>
            ADMINISTRATION
          </div>
          <p style={{ color:'rgba(255,255,255,.4)', fontSize:14 }}>Gestion des profils — vérification des badges</p>
          <a href="/admin/clubs" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', borderRadius:10, padding:'8px 16px', color:'rgba(255,255,255,.7)', fontSize:13, fontWeight:600, textDecoration:'none', marginTop:8 }}>
            🏟️ Valider les clubs →
          </a>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginBottom:'2rem' }}>
          {[
            { label:'Total profils', value:profiles.length, color:'#3a8cff' },
            { label:'Vérifiés', value:verified.length, color:'#e63946' },
            { label:'En attente', value:pending.length, color:'rgba(255,255,255,.4)' },
          ].map(s => (
            <div key={s.label} style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:16, padding:'1.25rem', textAlign:'center' }}>
              <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'2.5rem', color:s.color }}>{s.value}</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,.4)', fontWeight:600, textTransform:'uppercase', letterSpacing:1 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'4rem', color:'rgba(255,255,255,.4)' }}>
            <div style={{ width:36, height:36, border:'4px solid rgba(255,255,255,.1)', borderTopColor:'#e63946', borderRadius:'50%', animation:'spin .8s linear infinite', margin:'0 auto 1rem' }} />
            Chargement…
          </div>
        ) : (
          <>
            {/* Pending */}
            {pending.length > 0 && (
              <section style={{ marginBottom:'2rem' }}>
                <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.3rem', letterSpacing:1, marginBottom:'1rem', color:'#e63946' }}>
                  EN ATTENTE ({pending.length})
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
                  {pending.map(profile => (
                    <ProfileRow key={profile.id} profile={profile} busy={busy} onVerify={() => setVerified(profile.id, true)} onRefuse={null} />
                  ))}
                </div>
              </section>
            )}

            {/* Verified */}
            {verified.length > 0 && (
              <section>
                <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.3rem', letterSpacing:1, marginBottom:'1rem', color:'#e63946' }}>
                  VÉRIFIÉS ({verified.length})
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
                  {verified.map(profile => (
                    <ProfileRow key={profile.id} profile={profile} busy={busy} onVerify={null} onRefuse={() => setVerified(profile.id, false)} />
                  ))}
                </div>
              </section>
            )}

            {profiles.length === 0 && (
              <div style={{ textAlign:'center', padding:'4rem', color:'rgba(255,255,255,.4)' }}>
                Aucun profil inscrit.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function ProfileRow({ profile, busy, onVerify, onRefuse }: {
  profile: Profile
  busy: string | null
  onVerify: (() => void) | null
  onRefuse: (() => void) | null
}) {
  const isBusy = busy === profile.id
  const roleEmoji = profile.role === 'player' ? '⚽' : profile.role === 'coach' ? '🎽' : '🏟️'
  const displayName = profile.role === 'club'
    ? (profile.club_name || 'Club sans nom')
    : `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || (profile.role === 'coach' ? 'Coach sans nom' : 'Joueur sans nom')
  const roleLabel = profile.role === 'club' ? 'Club' : profile.role === 'coach' ? 'Coach' : 'Joueur'

  return (
    <div style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:14, padding:'1rem 1.25rem', display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
      <div style={{ width:48, height:48, borderRadius:10, background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', overflow:'hidden', flexShrink:0 }}>
        {profile.avatar_url
          ? <img src={avatarSrc(profile.avatar_url)!} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:9 }} onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
          : roleEmoji
        }
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
          <span style={{ fontWeight:700, fontSize:15 }}>{displayName}</span>
          {profile.verified && <VerifiedBadge size={16} />}
          <span style={{ fontSize:11, color:'rgba(255,255,255,.4)', background:'rgba(255,255,255,.08)', borderRadius:100, padding:'2px 8px', fontWeight:600 }}>{roleLabel}</span>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {profile.zone && <span style={{ fontSize:12, color:'rgba(255,255,255,.4)' }}>📍 {profile.zone}</span>}
          {profile.ligue && <span style={{ fontSize:12, color:'rgba(255,255,255,.4)' }}>🏆 {profile.ligue}</span>}
          {profile.email && <span style={{ fontSize:12, color:'rgba(255,255,255,.4)' }}>{profile.email}</span>}
        </div>
      </div>
      <div style={{ display:'flex', gap:8, flexShrink:0 }}>
        {onVerify && (
          <button
            onClick={onVerify}
            disabled={isBusy}
            style={{ background:'#e63946', color:'#fff', border:'none', borderRadius:8, padding:'8px 18px', fontWeight:700, fontSize:13, cursor:isBusy ? 'not-allowed' : 'pointer', opacity:isBusy ? .6 : 1, fontFamily:'inherit' }}
          >
            {isBusy ? '…' : '✓ Vérifier'}
          </button>
        )}
        {onRefuse && (
          <button
            onClick={onRefuse}
            disabled={isBusy}
            style={{ background:'rgba(230,57,70,.15)', color:'#e63946', border:'1px solid rgba(230,57,70,.3)', borderRadius:8, padding:'8px 18px', fontWeight:700, fontSize:13, cursor:isBusy ? 'not-allowed' : 'pointer', opacity:isBusy ? .6 : 1, fontFamily:'inherit' }}
          >
            {isBusy ? '…' : '✕ Révoquer'}
          </button>
        )}
      </div>
    </div>
  )
}
