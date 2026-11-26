'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLang } from '../lib/lang-context'
import { useAuth } from '../lib/auth-context'

type Member = { id:string; role:string; first_name:string|null; last_name:string|null; club_name:string|null }
type Report = { id: string; reported_id: string; reporter_id: string; reason: string; created_at: string; reviewed_at:string|null; reported:Member|null; reporter:Member|null; blocked:boolean; canModerate:boolean }
const memberName = (member:Member|null, de:boolean) => member ? (member.role==='club' ? member.club_name : [member.first_name,member.last_name].filter(Boolean).join(' ')) || (de?'Name nicht angegeben':'Nom non renseigné') : (de?'Profil nicht verfügbar':'Profil indisponible')

export default function MemberReports({ onChanged }: { onChanged?: () => void }) {
  const { lang } = useLang()
  const { session } = useAuth()
  const token = session?.access_token
  const de = lang === 'de'
  const [reports, setReports] = useState<Report[] | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [showAll, setShowAll] = useState(false)
  const [feedback, setFeedback] = useState<'block'|'unblock'|'audit'|null>(null)
  const [revision, setRevision] = useState(0)
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) { setReports(null); return }
    const abort = new AbortController()
    setLoading(true); setError(false); setReports(null)
    async function load() {
      try {
        const response = await fetch(`/api/admin/reports?page=${page}&state=${showAll ? 'all' : 'open'}`, {
          headers: { Authorization: `Bearer ${token}` }, cache: 'no-store', signal: abort.signal,
        })
        if (!response.ok) throw new Error()
        const data = await response.json()
        if (abort.signal.aborted) return
        if (page > 0 && data.items.length === 0) { setPage(p => p - 1); return }
        setReports(data.items); setTotal(data.total)
      } catch { if (!abort.signal.aborted) setError(true) }
      finally { if (!abort.signal.aborted) setLoading(false) }
    }
    void load()
    return () => abort.abort()
  }, [page, token, revision, showAll])

  async function review(id: string) {
    if (!token || busy) return
    setBusy(id); setError(false); setFeedback(null)
    try {
      const response = await fetch(`/api/admin/reports/${id}/review`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'review' }),
      })
      if (!response.ok) throw new Error()
      const data = await response.json()
      if (data.id !== id || !data.reviewed_at) throw new Error()
      setRevision(n => n + 1); onChanged?.()
    } catch { setError(true) }
    finally { setBusy(null) }
  }

  async function moderate(report:Report) {
    if (!token || busy || !report.canModerate) return
    const action = report.blocked ? 'unblock' : 'block'
    const name = memberName(report.reported, de)
    const question = de
      ? action==='block' ? `Konto von ${name} sperren? Die Sitzungen werden beendet und Profil und Anzeigen ausgeblendet. Die Daten bleiben erhalten.` : `Konto von ${name} entsperren? Die Person muss sich erneut anmelden.`
      : action==='block' ? `Bloquer le compte de ${name} ? Ses sessions seront fermées, son profil et ses annonces masqués. Ses données seront conservées.` : `Débloquer le compte de ${name} ? La personne devra se reconnecter.`
    if (!window.confirm(question)) return
    setBusy(report.id); setError(false); setFeedback(null)
    try {
      const response = await fetch(`/api/admin/reports/${report.id}/moderate`, {
        method:'POST', headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({action}),
      })
      if (!response.ok) throw new Error()
      const result = await response.json()
      if (result.id!==report.reported_id || result.blocked!==(action==='block')) throw new Error()
      setFeedback(result.auditPending ? 'audit' : action)
      onChanged?.()
    } catch { setError(true) }
    finally { setBusy(null); setRevision(n=>n+1) }
  }

  if (!token) return null
  return (
    <div style={{ marginTop: 12 }}>
      <p>{de ? 'Prüfe die Meldung und sperre das Konto bei Bedarf. Als bearbeitet markieren schliesst nur die Meldung.' : 'Examine le signalement et bloque le compte si nécessaire. Marquer comme traité clôture uniquement le signalement.'}</p>
      <label style={{display:'flex',alignItems:'center',gap:8,minHeight:44}}><input type="checkbox" checked={showAll} onChange={event=>{setShowAll(event.target.checked);setPage(0)}} />{de?'Auch bearbeitete Meldungen anzeigen':'Afficher aussi les signalements traités'}</label>
      {feedback && <p role="status">{feedback==='audit' ? (de?'Aktion ausgeführt. Die Protokollierung muss geprüft werden.':'Action appliquée. La journalisation doit être vérifiée.') : feedback==='block' ? (de?'Konto gesperrt.':'Compte bloqué.') : (de?'Konto entsperrt.':'Compte débloqué.')}</p>}
      {error && <p role="alert">{de ? 'Die Aktion ist fehlgeschlagen.' : 'L’action a échoué.'} <button type="button" disabled={busy !== null} onClick={() => setRevision(n => n + 1)}>{de ? 'Erneut laden' : 'Recharger'}</button></p>}
      {loading && <p role="status">{de ? 'Meldungen werden geladen…' : 'Chargement des signalements…'}</p>}
      {!loading && reports?.length === 0 && <p>{de ? 'Keine offenen Meldungen.' : 'Aucun signalement en attente.'}</p>}
      {reports?.map(report => (
        <article key={report.id} style={{ borderTop: '1px solid #ffffff30', marginTop: 8, paddingTop: 12 }}>
          <h3 style={{margin:'0 0 8px',overflowWrap:'anywhere'}}>{memberName(report.reported,de)}</h3>
          <p>{report.reported?.role==='club' ? (de?'Verein':'Club') : report.reported?.role==='coach' ? (de?'Trainer':'Entraîneur') : (de?'Spieler':'Joueur')}
            {' · '}<strong>{report.blocked ? (de?'Konto gesperrt':'Compte bloqué') : (de?'Konto aktiv':'Compte actif')}</strong></p>
          {report.reported?.role==='club' && [report.reported.first_name,report.reported.last_name].filter(Boolean).join(' ') && <p>{de?'Kontakt':'Contact'} : {[report.reported.first_name,report.reported.last_name].filter(Boolean).join(' ')}</p>}
          <p>{de?'Gemeldet am':'Signalé le'} {new Date(report.created_at).toLocaleString(de ? 'de-CH' : 'fr-CH')}</p>
          <p>{de?'Gemeldet von':'Signalé par'} : <Link href={`/profil/${report.reporter_id}`}>{memberName(report.reporter,de)}</Link></p>
          <p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere',padding:'12px',background:'#ffffff08',borderRadius:8 }}>{report.reason}</p>
          {report.reviewed_at && <p>{de?'Bearbeitet am':'Traité le'} {new Date(report.reviewed_at).toLocaleString(de?'de-CH':'fr-CH')}</p>}
          <div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'center',marginBottom:16}}>
            <Link href={`/profil/${report.reported_id}`} className="btn btn-outline">{de?'Profil prüfen':'Examiner le profil'}</Link>
            {report.canModerate ? <button className="btn btn-outline" style={{minHeight:44,color:report.blocked?'#baf3d0':'#ffb4b4'}} type="button" disabled={busy!==null || loading} onClick={()=>void moderate(report)}>
              {busy===report.id?'…':report.blocked?(de?'Konto entsperren':'Débloquer le compte'):(de?'Konto sperren':'Bloquer le compte')}
            </button> : <span>{de?'Administratorkonto geschützt':'Compte administrateur protégé'}</span>}
            {!report.reviewed_at && <button className="btn btn-outline" style={{minHeight:44}} type="button" disabled={busy!==null || loading} onClick={()=>void review(report.id)}>
              {busy===report.id?'…':de?'Als bearbeitet markieren':'Marquer comme traité'}
            </button>}
          </div>
        </article>
      ))}
      {!!reports?.length && <nav className="admin-pagination" aria-label={de ? 'Seiten der Meldungen' : 'Pages des signalements'}>
        <button type="button" disabled={page === 0 || loading || busy !== null} onClick={() => setPage(p => p - 1)}>{de ? 'Zurück' : 'Précédent'}</button>
        <span>{page + 1} / {Math.max(1, Math.ceil(total / 25))}</span>
        <button type="button" disabled={(page + 1) * 25 >= total || loading || busy !== null} onClick={() => setPage(p => p + 1)}>{de ? 'Weiter' : 'Suivant'}</button>
      </nav>}
    </div>
  )
}
