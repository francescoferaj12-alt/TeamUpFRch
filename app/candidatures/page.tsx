'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, Profile, Application, Annonce } from '../../lib/supabase'
import UserAvatar from '../../components/UserAvatar'
import { useLang } from '../../lib/lang-context'
import { t } from '../../lib/translations'
import { useAuth } from '../../lib/auth-context'

type AppWithAnnonce = Application & {
  annonce_title?: string
  annonce_author?: string
  annonce_author_id?: string
  annonce_ligue?: string
}
type Status = 'all' | 'pending' | 'accepted' | 'rejected'
type MainTab = 'received' | 'sent'

const PAGE_BG = '#030a24'
const CARD_BG = 'rgba(255,255,255,.04)'
const CARD_BORDER = '1px solid rgba(255,255,255,.08)'
const TEXT_DIM = 'rgba(255,255,255,.55)'
const TEXT_MUTE = 'rgba(255,255,255,.4)'

/* ── Helpers ── */

function FilterTab({ active, count, label, onClick }: { active: boolean; count: number; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      style={{
        padding: '7px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700,
        border: `1.5px solid ${active ? 'rgba(230,57,70,.5)' : 'rgba(255,255,255,.12)'}`,
        background: active ? 'rgba(230,57,70,.18)' : 'rgba(255,255,255,.04)',
        color: active ? '#e63946' : 'rgba(255,255,255,.6)',
        cursor: 'pointer', fontFamily: 'inherit'
      }}>
      {label} ({count})
    </button>
  )
}

function StatusBadge({ status }: { status: string }) {
  const { lang } = useLang()
  const map: Record<string, { bg: string; border: string; color: string; label: string }> = {
    pending:  { bg:'rgba(245,185,66,.15)',  border:'rgba(245,185,66,.4)',  color:'#f5b942', label:`⏳ ${t.general.pending[lang]}` },
    accepted: { bg:'rgba(76,219,122,.15)',  border:'rgba(76,219,122,.4)',  color:'#4cdb7a', label:`✅ ${t.general.accepted[lang]}` },
    rejected: { bg:'rgba(230,57,70,.15)',   border:'rgba(230,57,70,.4)',   color:'#ff6b6b', label:`❌ ${t.general.rejected[lang]}` }
  }
  const m = map[status] || map.pending
  return (
    <span style={{ background:m.bg, border:`1px solid ${m.border}`, color:m.color, fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:100, whiteSpace:'nowrap' }}>
      {m.label}
    </span>
  )
}

function CountChip({ kind, count, label }: { kind:'amber'|'green'|'red'; count:number; label:string }) {
  const colors = {
    amber: { bg:'rgba(245,185,66,.12)', color:'#f5b942', border:'rgba(245,185,66,.3)' },
    green: { bg:'rgba(76,219,122,.12)', color:'#4cdb7a', border:'rgba(76,219,122,.3)' },
    red:   { bg:'rgba(230,57,70,.12)',  color:'#e63946', border:'rgba(230,57,70,.3)' }
  }[kind]
  return (
    <span style={{ background:colors.bg, color:colors.color, border:`1px solid ${colors.border}`, fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:100 }}>
      {count} {label}
    </span>
  )
}

/* ── Main page ── */

export default function CandidaturesPage() {
  const router = useRouter()
  const { lang } = useLang()
  const { session, profile: authProfile, authLoading } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(authProfile)
  const [pageLoading, setPageLoading] = useState(!authProfile)
  const [dataLoading, setDataLoading] = useState(true)

  const [receivedApps, setReceivedApps] = useState<AppWithAnnonce[]>([])
  const [sentApps, setSentApps] = useState<AppWithAnnonce[]>([])
  const [annonces, setAnnonces] = useState<Annonce[]>([])

  const [mainTab, setMainTab] = useState<MainTab>('received')
  const [receivedFilter, setReceivedFilter] = useState<Status>('all')
  const [sentFilter, setSentFilter] = useState<Status>('all')
  const [filterAnnonce, setFilterAnnonce] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!session) { router.push('/login'); return }
    if (authProfile) { setProfile(authProfile); setPageLoading(false) }
  }, [authLoading, session, authProfile, router])

  useEffect(() => {
    if (!profile) return
    let cancelled = false
    ;(async () => {
      const [annoncesResult, receivedResult, sentResult] = await Promise.all([
        supabase.from('annonces').select('*').eq('author_id', profile.id),
        supabase.from('applications')
          .select('*, annonces!inner(title, author_id, ligue)')
          .eq('annonces.author_id', profile.id)
          .order('created_at', { ascending: false }),
        supabase.from('applications')
          .select('*, annonces(id, title, author_id, author_name, ligue)')
          .eq('applicant_id', profile.id)
          .order('created_at', { ascending: false }),
      ])
      if (cancelled) return

      setAnnonces(annoncesResult.data || [])

      const received: AppWithAnnonce[] = (receivedResult.data || []).map((a: any) => ({
        ...a,
        annonce_title: a.annonces?.title,
        annonce_ligue: a.annonces?.ligue,
      }))
      setReceivedApps(received)

      const sent: AppWithAnnonce[] = (sentResult.data || []).map((a: any) => ({
        ...a,
        annonce_title: a.annonces?.title,
        annonce_author: a.annonces?.author_name,
        annonce_author_id: a.annonces?.author_id,
        annonce_ligue: a.annonces?.ligue,
      }))
      setSentApps(sent)

      setMainTab(received.length > 0 ? 'received' : 'sent')
      setDataLoading(false)

      // Mark unseen received as seen and clear navbar badge
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('candidatures-seen'))
      const unseenIds = received.filter(a => !a.seen_by_owner).map(a => a.id)
      if (unseenIds.length > 0) {
        await supabase.from('applications').update({ seen_by_owner: true }).in('id', unseenIds)
      }
    })()
    return () => { cancelled = true }
  }, [profile?.id])

  async function updateStatus(id: string, status: 'pending' | 'accepted' | 'rejected') {
    await supabase.from('applications').update({ status }).eq('id', id)
    setReceivedApps(prev => prev.map(a => a.id === id ? { ...a, status } : a))
  }

  async function cancelApplication(id: string) {
    setSentApps(prev => prev.filter(a => a.id !== id))
    await supabase.from('applications').delete().eq('id', id)
  }

  const dateLocale = lang === 'fr' ? 'fr-CH' : 'de-CH'
  const optSt = { background: '#061540', color: '#fff' }

  const rCounts = {
    all: receivedApps.length,
    pending: receivedApps.filter(a => a.status === 'pending').length,
    accepted: receivedApps.filter(a => a.status === 'accepted').length,
    rejected: receivedApps.filter(a => a.status === 'rejected').length,
  }
  const sCounts = {
    all: sentApps.length,
    pending: sentApps.filter(a => a.status === 'pending').length,
    accepted: sentApps.filter(a => a.status === 'accepted').length,
    rejected: sentApps.filter(a => a.status === 'rejected').length,
  }

  const filteredReceived = receivedApps.filter(a => {
    if (receivedFilter !== 'all' && a.status !== receivedFilter) return false
    if (filterAnnonce && a.annonce_id !== filterAnnonce) return false
    return true
  })
  const filteredSent = sentFilter === 'all' ? sentApps : sentApps.filter(a => a.status === sentFilter)

  if (pageLoading) return (
    <div style={{ background: PAGE_BG, minHeight: '100vh', display:'flex', alignItems:'center', justifyContent:'center', color: TEXT_DIM }}>
      <div style={{ width:36, height:36, border:'4px solid rgba(255,255,255,.1)', borderTopColor:'#e63946', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )
  if (!profile) return null

  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '9px 20px', borderRadius: 10, fontSize: 14, fontWeight: 700,
    border: `2px solid ${active ? 'rgba(230,57,70,.5)' : 'rgba(255,255,255,.12)'}`,
    background: active ? 'rgba(230,57,70,.18)' : 'rgba(255,255,255,.04)',
    color: active ? '#e63946' : 'rgba(255,255,255,.6)',
    cursor: 'pointer', fontFamily: 'inherit',
    display: 'flex', alignItems: 'center', gap: 8,
  })

  const badgePill = (active: boolean): React.CSSProperties => ({
    background: active ? '#e63946' : 'rgba(255,255,255,.15)',
    color: '#fff', borderRadius: 100, fontSize: 11, fontWeight: 700, padding: '1px 7px',
  })

  return (
    <div style={{ background: PAGE_BG, minHeight: '100vh', color: '#fff' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem' }}>

        {/* HEADER */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem', flexWrap:'wrap', gap:'.75rem' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#e63946', marginBottom: 6 }}>
              {t.cands.gestion[lang]}
            </div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.2rem', letterSpacing: 1, color: '#fff' }}>
              {t.cands.my_cands[lang]}
            </div>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
            <CountChip kind="amber" count={rCounts.pending + sCounts.pending} label={t.cands.pending_count[lang]} />
            <CountChip kind="green" count={rCounts.accepted + sCounts.accepted} label={t.cands.accepted_count[lang]} />
            <Link href="/annonces"
              style={{ background:'#e63946', color:'#fff', borderRadius:8, padding:'8px 16px', fontSize:13, fontWeight:700, textDecoration:'none' }}>
              {t.cands.new_cand[lang]}
            </Link>
            <Link href="/dashboard"
              style={{ background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.12)', color:'rgba(255,255,255,.7)', borderRadius:8, padding:'7px 14px', fontSize:12, fontWeight:600, textDecoration:'none' }}>
              {t.cands.back_dashboard[lang]}
            </Link>
          </div>
        </div>

        {/* MAIN TABS */}
        <div style={{ display:'flex', gap:8, marginBottom:'1.25rem' }}>
          <button onClick={() => setMainTab('received')} style={tabBtnStyle(mainTab === 'received')}>
            📥 {t.cands.tab_received[lang]}
            <span style={badgePill(mainTab === 'received')}>{rCounts.all}</span>
          </button>
          <button onClick={() => setMainTab('sent')} style={tabBtnStyle(mainTab === 'sent')}>
            📤 {t.cands.tab_sent[lang]}
            <span style={badgePill(mainTab === 'sent')}>{sCounts.all}</span>
          </button>
        </div>

        {dataLoading ? (
          <div style={{ textAlign:'center', padding:'3rem', color: TEXT_DIM }}>
            <div style={{ width:32, height:32, border:'3px solid rgba(255,255,255,.1)', borderTopColor:'#e63946', borderRadius:'50%', animation:'spin .8s linear infinite', margin:'0 auto 1rem' }} />
            {t.cands.loading[lang]}
          </div>
        ) : mainTab === 'received' ? (

          /* ══ RECEIVED TAB ══ */
          <>
            <div style={{ display:'flex', gap:6, marginBottom:'1.25rem', flexWrap:'wrap', alignItems:'center' }}>
              {(['all','pending','accepted','rejected'] as Status[]).map(f => (
                <FilterTab key={f} active={receivedFilter === f} count={rCounts[f]}
                  label={f === 'all' ? t.cands.all[lang] : f === 'pending' ? t.cands.pending[lang] : f === 'accepted' ? t.cands.accepted[lang] : t.cands.rejected[lang]}
                  onClick={() => setReceivedFilter(f)}
                />
              ))}
              {annonces.length > 0 && (
                <select value={filterAnnonce} onChange={e => setFilterAnnonce(e.target.value)}
                  style={{ background:'rgba(255,255,255,.06)', border:'1.5px solid rgba(255,255,255,.12)', color:'#fff', borderRadius:100, padding:'7px 14px', fontSize:12, fontWeight:600, fontFamily:'inherit', outline:'none', cursor:'pointer' }}>
                  <option value="" style={optSt}>{t.cands.all_annonces[lang]}</option>
                  {annonces.map(a => <option key={a.id} value={a.id} style={optSt}>{a.title}</option>)}
                </select>
              )}
            </div>

            {filteredReceived.length === 0 ? (
              <div style={{ background: CARD_BG, border: CARD_BORDER, borderRadius: 16, textAlign:'center', padding:'3rem', color: TEXT_MUTE, fontSize: 14 }}>
                {receivedApps.length === 0 ? t.cands.no_received[lang] : t.cands.no_category[lang]}
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'.85rem' }}>
                {filteredReceived.map(a => (
                  <div key={a.id} style={{ background: CARD_BG, border: CARD_BORDER, borderRadius: 16, padding:'1.25rem' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'.5rem', marginBottom:'.85rem' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <Link href={`/profil/${a.applicant_id}`} style={{ width:46, height:46, borderRadius:12, flexShrink:0, textDecoration:'none', overflow:'hidden', display:'block' }}>
                          <UserAvatar userId={a.applicant_id} size={46} radius={12}
                            fallback={<div style={{ width:46, height:46, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, background:'linear-gradient(135deg,#3a8cff,#1a5fb4)' }}>👤</div>}
                          />
                        </Link>
                        <div>
                          <Link href={`/profil/${a.applicant_id}`} style={{ fontWeight:700, fontSize:15, color:'#7eb6ff', textDecoration:'none', borderBottom:'1.5px solid rgba(126,182,255,.35)', paddingBottom:1 }}>
                            {a.applicant_name}
                          </Link>
                          <div style={{ fontSize:12, color: TEXT_DIM, marginTop:2 }}>
                            {t.cands.for_label[lang]} {a.annonce_title} {a.annonce_ligue ? `· ${a.annonce_ligue}` : ''}
                          </div>
                          <div style={{ fontSize:11, color: TEXT_MUTE, marginTop:2 }}>
                            {new Date(a.created_at).toLocaleDateString(dateLocale, { day:'numeric', month:'long', year:'numeric' })}
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={a.status} />
                    </div>

                    <div style={{ background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.06)', borderRadius:10, padding:'.7rem .9rem', fontSize:13, fontStyle:'italic', lineHeight:1.6, marginBottom:'.85rem', color:'rgba(255,255,255,.75)' }}>
                      &laquo; {a.message} &raquo;
                    </div>

                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                      {a.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus(a.id, 'accepted')}
                            style={{ background:'rgba(76,219,122,.18)', color:'#4cdb7a', border:'1px solid rgba(76,219,122,.4)', borderRadius:8, padding:'7px 14px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                            {t.cands.accept_btn[lang]}
                          </button>
                          <button onClick={() => updateStatus(a.id, 'rejected')}
                            style={{ background:'rgba(230,57,70,.18)', color:'#ff6b6b', border:'1px solid rgba(230,57,70,.4)', borderRadius:8, padding:'7px 14px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                            {t.cands.refuse_btn[lang]}
                          </button>
                          <Link href={`/messages?partner=${a.applicant_id}`}
                            style={{ background:'rgba(255,255,255,.06)', color:'rgba(255,255,255,.75)', border:'1px solid rgba(255,255,255,.12)', borderRadius:8, padding:'7px 14px', fontSize:12, fontWeight:700, textDecoration:'none' }}>
                            {t.cands.message_btn[lang]}
                          </Link>
                        </>
                      )}
                      {a.status === 'accepted' && (
                        <>
                          <Link href={`/messages?partner=${a.applicant_id}`}
                            style={{ background:'#e63946', color:'#fff', borderRadius:8, padding:'7px 14px', fontSize:12, fontWeight:700, textDecoration:'none' }}>
                            {t.cands.contact_btn[lang]}
                          </Link>
                          <button onClick={() => updateStatus(a.id, 'rejected')}
                            style={{ background:'rgba(255,255,255,.06)', color:'rgba(255,255,255,.7)', border:'1px solid rgba(255,255,255,.12)', borderRadius:8, padding:'7px 14px', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                            {t.cands.cancel_btn[lang]}
                          </button>
                        </>
                      )}
                      {a.status === 'rejected' && (
                        <button onClick={() => updateStatus(a.id, 'pending')}
                          style={{ background:'rgba(255,255,255,.06)', color:'rgba(255,255,255,.7)', border:'1px solid rgba(255,255,255,.12)', borderRadius:8, padding:'7px 14px', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                          {t.cands.reconsider_btn[lang]}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>

        ) : (

          /* ══ SENT TAB ══ */
          <>
            <div style={{ display:'flex', gap:6, marginBottom:'1.25rem', flexWrap:'wrap' }}>
              {(['all','pending','accepted','rejected'] as Status[]).map(f => (
                <FilterTab key={f} active={sentFilter === f} count={sCounts[f]}
                  label={f === 'all' ? t.cands.all[lang] : f === 'pending' ? t.cands.pending[lang] : f === 'accepted' ? t.cands.accepted[lang] : t.cands.rejected[lang]}
                  onClick={() => setSentFilter(f)}
                />
              ))}
            </div>

            {filteredSent.length === 0 ? (
              <div style={{ background: CARD_BG, border: CARD_BORDER, borderRadius: 16, textAlign:'center', padding:'3rem', color: TEXT_MUTE }}>
                {sentApps.length === 0 ? (
                  <>
                    <div style={{ fontSize:'2.5rem', marginBottom:'.85rem' }}>📋</div>
                    <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.3rem', letterSpacing:1, color:'#fff', marginBottom:'.5rem' }}>{t.cands.no_cands[lang]}</div>
                    <div style={{ fontSize:14, marginBottom:'1.5rem' }}>{t.cands.explore_msg[lang]}</div>
                    <Link href="/annonces"
                      style={{ background:'#e63946', color:'#fff', borderRadius:10, padding:'10px 24px', fontSize:14, fontWeight:700, textDecoration:'none' }}>
                      {t.cands.see_annonces[lang]}
                    </Link>
                  </>
                ) : t.cands.no_category[lang]}
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'.85rem' }}>
                {filteredSent.map(a => {
                  const accent = a.status === 'accepted' ? '#4cdb7a' : a.status === 'rejected' ? '#e63946' : '#f5b942'
                  return (
                    <div key={a.id} style={{ background: CARD_BG, border: CARD_BORDER, borderLeft: `4px solid ${accent}`, borderRadius: 16, padding: '1.25rem' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'.5rem', marginBottom:'.65rem' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                          {a.annonce_author_id && (
                            <Link href={`/profil/${a.annonce_author_id}`} style={{ width:44, height:44, borderRadius:12, flexShrink:0, textDecoration:'none', overflow:'hidden', display:'block' }}>
                              <UserAvatar userId={a.annonce_author_id} size={44} radius={12}
                                fallback={<div style={{ width:44, height:44, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, background:'linear-gradient(135deg,#3a8cff,#1a5fb4)' }}>🏟️</div>}
                              />
                            </Link>
                          )}
                          <div>
                            <div style={{ fontWeight:700, fontSize:15, color:'#fff' }}>{a.annonce_title || t.cands.annonce_label[lang]}</div>
                            <div style={{ fontSize:13, color: TEXT_DIM, marginTop:2 }}>
                              {a.annonce_author}{a.annonce_ligue ? ` · ${a.annonce_ligue}` : ''}
                            </div>
                            <div style={{ fontSize:11, color: TEXT_MUTE, marginTop:2 }}>
                              {t.cands.sent_on[lang]} {new Date(a.created_at).toLocaleDateString(dateLocale, { day:'numeric', month:'long', year:'numeric' })}
                            </div>
                          </div>
                        </div>
                        <StatusBadge status={a.status} />
                      </div>

                      <div style={{ background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.06)', borderRadius:10, padding:'.65rem .85rem', fontSize:13, fontStyle:'italic', color:'rgba(255,255,255,.7)', lineHeight:1.55, marginBottom:'.85rem' }}>
                        &laquo; {a.message} &raquo;
                      </div>

                      {a.status === 'accepted' && (
                        <div style={{ background:'rgba(76,219,122,.12)', border:'1px solid rgba(76,219,122,.3)', borderRadius:10, padding:'.65rem .85rem', fontSize:13, color:'#4cdb7a', fontWeight:600, marginBottom:'.85rem' }}>
                          {t.cands.accepted_msg[lang]}
                        </div>
                      )}

                      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                        {a.status === 'pending' && (
                          <button onClick={() => cancelApplication(a.id)}
                            style={{ background:'rgba(230,57,70,.12)', color:'#ff6b6b', border:'1px solid rgba(230,57,70,.3)', borderRadius:8, padding:'7px 14px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                            {t.cands.cancel_cand_btn[lang]}
                          </button>
                        )}
                        <Link href="/annonces"
                          style={{ background:'rgba(255,255,255,.06)', color:'rgba(255,255,255,.7)', border:'1px solid rgba(255,255,255,.12)', borderRadius:8, padding:'7px 14px', fontSize:12, fontWeight:700, textDecoration:'none' }}>
                          {t.cands.view_annonce_btn[lang]}
                        </Link>
                        {a.annonce_author_id && (
                          <Link href={`/messages?partner=${a.annonce_author_id}`}
                            style={{ background:'rgba(255,255,255,.06)', color:'rgba(255,255,255,.75)', border:'1px solid rgba(255,255,255,.12)', borderRadius:8, padding:'7px 14px', fontSize:12, fontWeight:700, textDecoration:'none' }}>
                            {t.cands.contact_btn[lang]}
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>

        )}
      </div>
    </div>
  )
}
