'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth-context'
import { useLang } from '../lib/lang-context'
import { supabase } from '../lib/supabase'

export default function MemberSafetyActions({ memberId }: { memberId: string }) {
  const { profile } = useAuth()
  const { lang } = useLang()
  const [blocked, setBlocked] = useState<boolean | null>(null)
  const [busy, setBusy] = useState(false)
  const [reason, setReason] = useState('')
  const [feedback, setFeedback] = useState('')
  const member = profile?.id

  useEffect(() => {
    setBlocked(null)
    if (!member || member === memberId) return
    let active = true
    supabase.from('member_blocks').select('blocked_id')
      .eq('blocker_id', member).eq('blocked_id', memberId).maybeSingle()
      .then(({ data, error }) => { if (active && !error) setBlocked(Boolean(data)) })
    return () => { active = false }
  }, [member, memberId])

  if (!member || member === memberId) return null
  const de = lang === 'de'

  async function toggleBlock() {
    setBusy(true)
    const result = blocked
      ? await supabase.from('member_blocks').delete().eq('blocker_id', member!).eq('blocked_id', memberId)
      : await supabase.from('member_blocks').insert({ blocked_id: memberId })
    if (!result.error) setBlocked(!blocked)
    setFeedback(result.error
      ? (de ? 'Änderung fehlgeschlagen.' : 'Impossible de modifier le blocage.')
      : blocked
      ? (de ? 'Blockierung aufgehoben.' : 'Blocage levé.')
      : (de ? 'Mitglied blockiert. Neue Nachrichten sind gesperrt.' : 'Membre bloqué. Les nouveaux messages sont bloqués.'))
    setBusy(false)
  }

  async function report(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (reason.trim().length < 5 || busy) return
    setBusy(true)
    const { error } = await supabase.from('member_reports').insert({ reported_id: memberId, reason: reason.trim() })
    if (!error) setReason('')
    setFeedback(error?.code === '23505'
      ? (de ? 'Eine Meldung wird bereits geprüft.' : 'Un signalement est déjà en cours.')
      : error
      ? (de ? 'Meldung konnte nicht gesendet werden.' : 'Impossible d’envoyer le signalement.')
      : (de ? 'Meldung wurde gesendet.' : 'Signalement envoyé.'))
    setBusy(false)
  }

  return (
    <details style={{ fontSize: 13, color: 'inherit' }}>
      <summary style={{ cursor: 'pointer' }}>{de ? 'Melden oder blockieren' : 'Signaler ou bloquer'}</summary>
      <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
        {blocked !== null && (
          <button type="button" disabled={busy} onClick={toggleBlock}>
            {blocked ? (de ? 'Entblocken' : 'Débloquer') : (de ? 'Blockieren' : 'Bloquer')}
          </button>
        )}
        <form onSubmit={report} style={{ display: 'grid', gap: 8 }}>
          <label>
            {de ? 'Grund der Meldung' : 'Motif du signalement'}
            <textarea style={{ display: 'block', width: '100%' }} value={reason} minLength={5} maxLength={1000} required onChange={event => setReason(event.target.value)} />
          </label>
          <button type="submit" disabled={busy}>{de ? 'Meldung senden' : 'Envoyer le signalement'}</button>
        </form>
        {feedback && <p role="status">{feedback}</p>}
      </div>
    </details>
  )
}
