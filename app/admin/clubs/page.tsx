'use client'

import { useEffect, useState } from 'react'
import { supabase, avatarSrc } from '../../../lib/supabase'
import VerifiedBadge from '../../../components/VerifiedBadge'

const ADMIN_EMAIL = 'teamupfr.ch@gmail.com'

type ClubRow = {
  id: string
  email: string
  club_name: string | null
  avatar_url: string | null
  zone: string | null
  ligue: string | null
  verified: boolean
  club_verification_status: 'pending' | 'approved' | 'rejected' | null
  club_verified_at: string | null
  club_rejection_reason: string | null
  club_email_is_professional: boolean | null
  aff_club_id: number | null
  created_at: string
  aff_clubs: { id: number; name: string; aff_number: number } | null
}

export default function AdminClubsPage() {
  const [authChecked, setAuthChecked] = useState(false)
  const [authorized, setAuthorized] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [clubs, setClubs] = useState<ClubRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user.email === ADMIN_EMAIL) {
        setAuthorized(true)
        setToken(data.session.access_token)
        loadClubs(data.session.access_token)
      }
      setAuthChecked(true)
    })
  }, [])

  async function loadClubs(accessToken: string) {
    setLoading(true)
    const res = await fetch('/api/admin/clubs', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (res.ok) {
      const json = await res.json()
      setClubs(json.clubs || [])
    }
    setLoading(false)
  }

  async function approve(id: string) {
    if (!token) return
    setBusy(id)
    const res = await fetch(`/api/admin/clubs/${id}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      setClubs(prev => prev.map(c => c.id === id
        ? { ...c, club_verification_status: 'approved', verified: true, club_verified_at: new Date().toISOString() }
        : c))
    } else {
      alert('Erreur lors de l\'approbation')
    }
    setBusy(null)
  }

  async function reject(id: string) {
    if (!token || !rejectReason.trim()) return
    setBusy(id)
    const res = await fetch(`/api/admin/clubs/${id}/reject`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: rejectReason.trim() }),
    })
    if (res.ok) {
      setClubs(prev => prev.map(c => c.id === id
        ? { ...c, club_verification_status: 'rejected', verified: false, club_rejection_reason: rejectReason.trim() }
        : c))
      setRejectTarget(null)
      setRejectReason('')
    } else {
      alert('Erreur lors du refus')
    }
    setBusy(null)
  }

  async function deleteClub(id: string) {
    if (!token) return
    if (!confirm('Supprimer ce compte définitivement ?')) return
    setBusy(id)
    const res = await fetch(`/api/admin/clubs/${id}/delete`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      setClubs(prev => prev.filter(c => c.id !== id))
    } else {
      alert('Erreur lors de la suppression')
    }
    setBusy(null)
  }

  if (!authChecked) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#030a24' }}>
      <div style={{ width: 36, height: 36, border: '4px solid rgba(255,255,255,.1)', borderTopColor: '#e63946', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  if (!authorized) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#030a24', color: '#fff', gap: 16 }}>
      <div style={{ fontSize: '3rem' }}>🔒</div>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem' }}>Accès refusé</div>
    </div>
  )

  const pending = clubs.filter(c => c.club_verification_status === 'pending' || c.club_verification_status === null)
  const approved = clubs.filter(c => c.club_verification_status === 'approved')
  const rejected = clubs.filter(c => c.club_verification_status === 'rejected')

  return (
    <div style={{ background: '#030a24', minHeight: '100vh', color: '#fff', padding: '2rem' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>

      {/* Reject modal */}
      {rejectTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => { setRejectTarget(null); setRejectReason('') }}>
          <div style={{ background: '#061540', border: '1px solid rgba(255,255,255,.1)', borderRadius: 20, padding: '1.75rem', maxWidth: 480, width: '100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', letterSpacing: 1, marginBottom: '1rem', color: '#e63946' }}>MOTIF DU REFUS</div>
            <textarea
              autoFocus
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Ex: Email non officiel du club, informations insuffisantes…"
              rows={4}
              style={{ width: '100%', background: 'rgba(255,255,255,.07)', border: '1.5px solid rgba(255,255,255,.12)', color: '#fff', borderRadius: 9, padding: '10px 14px', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: '1rem' }}>
              <button
                onClick={() => reject(rejectTarget)}
                disabled={!rejectReason.trim() || busy === rejectTarget}
                style={{ flex: 1, background: '#e63946', color: '#fff', border: 'none', borderRadius: 9, padding: '11px', fontSize: 14, fontWeight: 700, cursor: !rejectReason.trim() ? 'not-allowed' : 'pointer', opacity: !rejectReason.trim() ? .5 : 1, fontFamily: 'inherit' }}
              >
                {busy === rejectTarget ? '…' : '✕ Confirmer le refus'}
              </button>
              <button onClick={() => { setRejectTarget(null); setRejectReason('') }} style={{ background: 'rgba(255,255,255,.07)', color: 'rgba(255,255,255,.7)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 9, padding: '11px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a href="/admin" style={{ color: 'rgba(255,255,255,.4)', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>← Admin</a>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: 2 }}>CLUBS</div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'En attente', value: pending.length, color: '#ffa500' },
            { label: 'Approuvés', value: approved.length, color: '#4cdb7a' },
            { label: 'Refusés', value: rejected.length, color: '#ff6b6b' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,.4)' }}>
            <div style={{ width: 36, height: 36, border: '4px solid rgba(255,255,255,.1)', borderTopColor: '#e63946', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 1rem' }} />
            Chargement…
          </div>
        ) : (
          <>
            <ClubSection title="EN ATTENTE" color="#ffa500" clubs={pending} busy={busy}
              onApprove={approve} onReject={id => { setRejectTarget(id); setRejectReason('') }} onDelete={deleteClub} />
            <ClubSection title="REFUSÉS" color="#ff6b6b" clubs={rejected} busy={busy}
              onApprove={approve} onReject={id => { setRejectTarget(id); setRejectReason('') }} onDelete={deleteClub} />
            <ClubSection title="APPROUVÉS" color="#4cdb7a" clubs={approved} busy={busy}
              onApprove={null} onReject={id => { setRejectTarget(id); setRejectReason('') }} onDelete={deleteClub} />
          </>
        )}
      </div>
    </div>
  )
}

function ClubSection({ title, color, clubs, busy, onApprove, onReject, onDelete }: {
  title: string
  color: string
  clubs: ClubRow[]
  busy: string | null
  onApprove: ((id: string) => void) | null
  onReject: (id: string) => void
  onDelete: (id: string) => void
}) {
  if (clubs.length === 0) return null
  return (
    <section style={{ marginBottom: '2rem' }}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', letterSpacing: 1, marginBottom: '1rem', color }}>
        {title} ({clubs.length})
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
        {clubs.map(club => <ClubRow key={club.id} club={club} busy={busy} onApprove={onApprove} onReject={onReject} onDelete={onDelete} />)}
      </div>
    </section>
  )
}

function ClubRow({ club, busy, onApprove, onReject, onDelete }: {
  club: ClubRow
  busy: string | null
  onApprove: ((id: string) => void) | null
  onReject: (id: string) => void
  onDelete: (id: string) => void
}) {
  const isBusy = busy === club.id
  const name = club.club_name || club.email
  const statusColor = club.club_verification_status === 'approved' ? '#4cdb7a'
    : club.club_verification_status === 'rejected' ? '#ff6b6b'
    : '#ffa500'
  const statusLabel = club.club_verification_status === 'approved' ? 'Approuvé'
    : club.club_verification_status === 'rejected' ? 'Refusé'
    : 'En attente'

  return (
    <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, padding: '1rem 1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        {/* Avatar */}
        <div style={{ width: 48, height: 48, borderRadius: 10, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', overflow: 'hidden', flexShrink: 0 }}>
          {club.avatar_url
            ? <img src={avatarSrc(club.avatar_url)!} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 9 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            : '🏟️'}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>{name}</span>
            {club.club_verification_status === 'approved' && <VerifiedBadge size={16} />}
            <span style={{ fontSize: 11, color: statusColor, background: `${statusColor}22`, borderRadius: 100, padding: '2px 8px', fontWeight: 600 }}>{statusLabel}</span>
            {club.club_email_is_professional
              ? <span style={{ fontSize: 11, color: '#4cdb7a', background: 'rgba(76,219,122,.12)', borderRadius: 100, padding: '2px 8px', fontWeight: 600 }}>Email pro</span>
              : <span style={{ fontSize: 11, color: '#ffa500', background: 'rgba(255,165,0,.12)', borderRadius: 100, padding: '2px 8px', fontWeight: 600 }}>Email perso</span>}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,.4)' }}>{club.email}</span>
            {club.zone && <span style={{ fontSize: 12, color: 'rgba(255,255,255,.4)' }}>📍 {club.zone}</span>}
            {club.aff_clubs && <span style={{ fontSize: 12, color: 'rgba(255,255,255,.4)' }}>🏟️ AFF #{club.aff_clubs.aff_number} — {club.aff_clubs.name}</span>}
          </div>
          {club.club_rejection_reason && (
            <div style={{ fontSize: 12, color: '#ff8888', marginTop: 4, fontStyle: 'italic' }}>Refus : {club.club_rejection_reason}</div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
          {onApprove && (
            <button onClick={() => onApprove(club.id)} disabled={isBusy} style={{ background: '#4cdb7a22', color: '#4cdb7a', border: '1px solid #4cdb7a44', borderRadius: 8, padding: '7px 16px', fontWeight: 700, fontSize: 13, cursor: isBusy ? 'not-allowed' : 'pointer', opacity: isBusy ? .6 : 1, fontFamily: 'inherit' }}>
              {isBusy ? '…' : '✓ Approuver'}
            </button>
          )}
          <button onClick={() => onReject(club.id)} disabled={isBusy} style={{ background: 'rgba(230,57,70,.15)', color: '#e63946', border: '1px solid rgba(230,57,70,.3)', borderRadius: 8, padding: '7px 16px', fontWeight: 700, fontSize: 13, cursor: isBusy ? 'not-allowed' : 'pointer', opacity: isBusy ? .6 : 1, fontFamily: 'inherit' }}>
            {isBusy ? '…' : '✕ Refuser'}
          </button>
          <button onClick={() => onDelete(club.id)} disabled={isBusy} style={{ background: 'rgba(255,255,255,.05)', color: 'rgba(255,255,255,.4)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '7px 12px', fontWeight: 600, fontSize: 12, cursor: isBusy ? 'not-allowed' : 'pointer', opacity: isBusy ? .6 : 1, fontFamily: 'inherit' }}>
            🗑️
          </button>
        </div>
      </div>
    </div>
  )
}
