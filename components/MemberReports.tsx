'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

type Report = { id: string; reported_id: string; reporter_id: string; reason: string; created_at: string }

export default function MemberReports() {
  const [reports, setReports] = useState<Report[] | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    supabase.from('member_reports').select('id,reported_id,reporter_id,reason,created_at')
      .is('reviewed_at', null).order('created_at', { ascending: true }).limit(50)
      .then(({ data, error }) => {
        if (!active) return
        if (error) setError('Impossible de charger les signalements.')
        else setReports(data)
      })
    return () => { active = false }
  }, [])

  async function review(id: string) {
    setBusy(id)
    const { error } = await supabase.from('member_reports').update({ reviewed_at: new Date().toISOString() })
      .eq('id', id).is('reviewed_at', null)
    if (error) setError('Impossible de clôturer le signalement.')
    else {
      setError('')
      setReports(items => items?.filter(item => item.id !== id) ?? null)
    }
    setBusy(null)
  }

  return (
    <details style={{ marginTop: 12 }}>
      <summary style={{ cursor: 'pointer' }}>Signalements à traiter{reports && ` (${reports.length})`}</summary>
      {error && <p role="alert">{error}</p>}
      {reports?.length === 0 && <p>Aucun signalement en attente.</p>}
      {reports?.map(report => (
        <article key={report.id} style={{ borderTop: '1px solid #ffffff30', marginTop: 8, paddingTop: 8 }}>
          <Link href={`/profil/${report.reported_id}`}>Profil signalé</Link>
          {' · '}
          <Link href={`/profil/${report.reporter_id}`}>Auteur du signalement</Link>
          <p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{report.reason}</p>
          <button type="button" disabled={busy !== null} onClick={() => review(report.id)}>Marquer comme traité</button>
        </article>
      ))}
    </details>
  )
}
