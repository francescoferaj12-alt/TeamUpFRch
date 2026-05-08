'use client'

import { useEffect, useState } from 'react'
import { supabase, Profile } from '../../lib/supabase'
import VerifiedBadge from '../../components/VerifiedBadge'

const ADMIN_EMAIL = 'teamupfr.ch@gmail.com'

export default function AdminPage() {
  const [authChecked, setAuthChecked] = useState(false)
  const [authorized, setAuthorized] = useState(false)
  const [clubs, setClubs] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email === ADMIN_EMAIL) {
        setAuthorized(true)
        loadClubs()
      }
      setAuthChecked(true)
    })
  }, [])

  async function loadClubs() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'club')
      .order('created_at', { ascending: false })
    if (data) setClubs(data)
    setLoading(false)
  }

  async function setVerified(clubId: string, value: boolean) {
    setBusy(clubId)
    const { data: clubData, error } = await supabase
      .from('profiles')
      .update({ verified: value })
      .eq('id', clubId)
      .select('club_name, email')
      .single()
    if (error) {
      alert('Erreur: ' + error.message)
    } else {
      setClubs(prev => prev.map(c => c.id === clubId ? { ...c, verified: value } : c))
      if (clubData?.email) {
        await fetch('/api/send-verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clubName: clubData.club_name, clubEmail: clubData.email, verified: value }),
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

  const verified = clubs.filter(c => c.verified)
  const pending = clubs.filter(c => !c.verified)

  return (
    <div style={{ background:'#030a24', minHeight:'100vh', color:'#fff', padding:'2rem' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      <div style={{ maxWidth:900, margin:'0 auto' }}>
        <div style={{ marginBottom:'2rem' }}>
          <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'2.5rem', letterSpacing:2, marginBottom:'.25rem' }}>
            ADMINISTRATION
          </div>
          <p style={{ color:'rgba(255,255,255,.4)', fontSize:14 }}>Gestion des clubs — vérification des badges</p>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginBottom:'2rem' }}>
          {[
            { label:'Total clubs', value:clubs.length, color:'#3a8cff' },
            { label:'Vérifiés', value:verified.length, color:'#1d9bf0' },
            { label:'En attente', value:pending.length, color:'#e63946' },
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
                  {pending.map(club => (
                    <ClubRow key={club.id} club={club} busy={busy} onVerify={() => setVerified(club.id, true)} onRefuse={null} />
                  ))}
                </div>
              </section>
            )}

            {/* Verified */}
            {verified.length > 0 && (
              <section>
                <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.3rem', letterSpacing:1, marginBottom:'1rem', color:'#1d9bf0' }}>
                  VÉRIFIÉS ({verified.length})
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
                  {verified.map(club => (
                    <ClubRow key={club.id} club={club} busy={busy} onVerify={null} onRefuse={() => setVerified(club.id, false)} />
                  ))}
                </div>
              </section>
            )}

            {clubs.length === 0 && (
              <div style={{ textAlign:'center', padding:'4rem', color:'rgba(255,255,255,.4)' }}>
                Aucun club inscrit.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function ClubRow({ club, busy, onVerify, onRefuse }: {
  club: Profile
  busy: string | null
  onVerify: (() => void) | null
  onRefuse: (() => void) | null
}) {
  const isBusy = busy === club.id
  return (
    <div style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:14, padding:'1rem 1.25rem', display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
      <div style={{ width:48, height:48, borderRadius:10, background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', overflow:'hidden', flexShrink:0 }}>
        {club.avatar_url
          ? <img src={club.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:9 }} />
          : '🏟️'
        }
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
          <span style={{ fontWeight:700, fontSize:15 }}>{club.club_name || 'Club sans nom'}</span>
          {club.verified && <VerifiedBadge size={16} />}
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {club.zone && <span style={{ fontSize:12, color:'rgba(255,255,255,.4)' }}>📍 {club.zone}</span>}
          {club.ligue && <span style={{ fontSize:12, color:'rgba(255,255,255,.4)' }}>🏆 {club.ligue}</span>}
          {club.email && <span style={{ fontSize:12, color:'rgba(255,255,255,.4)' }}>{club.email}</span>}
        </div>
      </div>
      <div style={{ display:'flex', gap:8, flexShrink:0 }}>
        {onVerify && (
          <button
            onClick={onVerify}
            disabled={isBusy}
            style={{ background:'#1d9bf0', color:'#fff', border:'none', borderRadius:8, padding:'8px 18px', fontWeight:700, fontSize:13, cursor:isBusy ? 'not-allowed' : 'pointer', opacity:isBusy ? .6 : 1, fontFamily:'inherit' }}
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
