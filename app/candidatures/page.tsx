'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, Profile, Application, Annonce } from '../../lib/supabase'
import UserAvatar from '../../components/UserAvatar'
import ClubCrest from '../../components/ClubCrest'
import { useLang } from '../../lib/lang-context'
import { t, Lang } from '../../lib/translations'
import { useAuth } from '../../lib/auth-context'
import { relativeTime } from '../../lib/utils/time'

type AppWithAnnonce = Application & {
  annonce_title?: string
  annonce_author?: string
  annonce_author_id?: string
  annonce_ligue?: string
}
type Status = 'all' | 'pending' | 'accepted' | 'rejected'
type MainTab = 'received' | 'sent'

// ── Shield helpers ────────────────────────────────────────────
const SHIELD_GRADS = [
  'linear-gradient(135deg,#1a3a8a 0%,#0d1f4a 100%)',
  'linear-gradient(135deg,#FF3A3A 0%,#c41f1f 100%)',
  'linear-gradient(135deg,#3A7AFF 0%,#1f4ac4 100%)',
  'linear-gradient(135deg,#FF9A3A 0%,#c4651f 100%)',
  'linear-gradient(135deg,#2ED27F 0%,#1a8a52 100%)',
  'linear-gradient(135deg,#7B68EE 0%,#4B3FA8 100%)',
]
function shieldGrad(name = ''): string {
  let c = 0; for (const ch of name) c = (c * 31 + ch.charCodeAt(0)) % SHIELD_GRADS.length
  return SHIELD_GRADS[c]
}
function shieldInit(name = ''): string {
  return name.split(/\s+/).filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 3) || '?'
}

// ── SVG icons ─────────────────────────────────────────────────
const Svg = ({ children, s = 16, ...p }: { children: React.ReactNode; s?: number; [k: string]: any }) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    {children}
  </svg>
)
const IcoCheck  = ({ s = 12 }: { s?: number }) => <Svg s={s}><polyline points="20 6 9 17 4 12" /></Svg>
const IcoX      = ({ s = 12 }: { s?: number }) => <Svg s={s}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Svg>
const IcoClock  = ({ s = 12 }: { s?: number }) => <Svg s={s}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></Svg>
const IcoStar   = ({ s = 12 }: { s?: number }) => <Svg s={s}><polygon points="12 2 15 8 22 9 17 14 18 21 12 18 6 21 7 14 2 9 9 8 12 2" /></Svg>
const IcoMsgIco = ({ s = 12 }: { s?: number }) => <Svg s={s}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></Svg>
const IcoArrow  = ({ s = 14 }: { s?: number }) => <Svg s={s}><path d="M5 12h14M12 5l7 7-7 7" /></Svg>
const IcoWarn   = ({ s = 15 }: { s?: number }) => <Svg s={s}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></Svg>
const IcoUser   = ({ s = 24 }: { s?: number }) => <Svg s={s}><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a8 8 0 0 1 16 0v1" /></Svg>
const IcoEmpty  = ({ s = 44 }: { s?: number }) => <Svg s={s} strokeWidth="1.5"><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M4 9h16M9 4v16" /></Svg>
const IcoDone   = ({ s = 44 }: { s?: number }) => <Svg s={s} strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></Svg>
const IcoIn     = ({ s = 14 }: { s?: number }) => <Svg s={s}><polyline points="21 15 21 21 3 21 3 15" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="3" x2="12" y2="15" /></Svg>
const IcoOut    = ({ s = 14 }: { s?: number }) => <Svg s={s}><polyline points="21 9 21 3 3 3 3 9" /><polyline points="7 14 12 9 17 14" /><line x1="12" y1="21" x2="12" y2="9" /></Svg>

// ── CSS ───────────────────────────────────────────────────────
const CAND_CSS = `
.ca-wrap { min-height:100vh; background:radial-gradient(ellipse at top,rgba(26,47,107,.6) 0%,transparent 50%),#0D1F4A; color:#fff; }
.ca-container { max-width:1200px; margin:0 auto; padding:0 32px; }
@media(max-width:640px){ .ca-container { padding:0 16px; } }

/* spinner */
.ca-spinner { width:36px; height:36px; border:3px solid rgba(255,255,255,.1); border-top-color:#FF3A3A; border-radius:50%; animation:ca-spin .8s linear infinite; }
@keyframes ca-spin { to{transform:rotate(360deg);} }
.ca-center { display:flex; align-items:center; justify-content:center; min-height:100vh; }
.ca-load-inner { display:flex; align-items:center; justify-content:center; padding:4rem; color:rgba(255,255,255,.55); font-size:14px; gap:14px; }

/* header */
.ca-header { padding:136px 0 0; position:relative; }
.ca-header::before { content:''; position:absolute; top:100px; left:0; right:0; height:360px; background:radial-gradient(ellipse at center,rgba(255,58,58,.08) 0%,transparent 50%); pointer-events:none; }
.ca-eyebrow { font-family:'Russo One',sans-serif; font-size:12px; letter-spacing:4px; color:#FF3A3A; text-transform:uppercase; margin-bottom:16px; display:inline-flex; align-items:center; gap:10px; }
.ca-eyebrow svg { width:14px; height:14px; stroke:#FF3A3A; fill:none; stroke-width:2; }
.ca-page-title { font-family:'Russo One',sans-serif; font-size:clamp(36px,6vw,60px); line-height:1; letter-spacing:-.5px; text-transform:uppercase; margin-bottom:8px; }
.ca-em { color:#FF3A3A; }
.ca-page-sub { font-size:16px; color:rgba(255,255,255,.6); max-width:560px; line-height:1.6; }

/* stat cards */
.ca-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin:40px 0; }
@media(max-width:900px){ .ca-stats { grid-template-columns:repeat(2,1fr); } }
.ca-stat { padding:22px; background:linear-gradient(180deg,rgba(255,255,255,.04) 0%,rgba(255,255,255,.01) 100%); border:1px solid rgba(255,255,255,.1); border-radius:16px; display:flex; flex-direction:column; gap:4px; }
.ca-stat.ca-orange { border-color:rgba(255,154,58,.3); background:linear-gradient(180deg,rgba(255,154,58,.06) 0%,rgba(255,154,58,.01) 100%); }
.ca-stat.ca-green  { border-color:rgba(46,210,127,.3);  background:linear-gradient(180deg,rgba(46,210,127,.06) 0%,rgba(46,210,127,.01) 100%); }
.ca-stat.ca-red    { border-color:rgba(255,58,58,.3);   background:linear-gradient(180deg,rgba(255,58,58,.06) 0%,rgba(255,58,58,.01) 100%); }
@keyframes ca-numfade { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }
.ca-stat-num { font-family:'Russo One',sans-serif; font-size:36px; line-height:1; animation:ca-numfade .2s ease; }
.ca-stat.ca-orange .ca-stat-num { color:#FF9A3A; }
.ca-stat.ca-green  .ca-stat-num { color:#2ED27F; }
.ca-stat.ca-red    .ca-stat-num { color:#FF3A3A; }
.ca-stat-label { font-size:11px; letter-spacing:2px; color:rgba(255,255,255,.55); text-transform:uppercase; margin-top:4px; }

/* section */
.ca-section { padding:0 0 80px; }

/* main tabs */
.ca-main-tabs { display:flex; gap:8px; margin:0 0 28px; flex-wrap:wrap; }
.ca-main-tab { display:inline-flex; align-items:center; gap:8px; padding:12px 24px; border-radius:999px; border:1px solid rgba(255,255,255,.12); font-size:14px; font-weight:500; color:rgba(255,255,255,.85); cursor:pointer; font-family:inherit; background:transparent; transition:border-color .3s,background .3s,color .3s; }
.ca-main-tab:hover { border-color:rgba(255,255,255,.3); }
.ca-main-tab.active { background:#fff; color:#0D1F4A; border-color:#fff; }
.ca-tab-count { font-family:'Russo One',sans-serif; font-size:11px; background:rgba(255,255,255,.1); padding:2px 8px; border-radius:999px; color:rgba(255,255,255,.55); transition:background .3s,color .3s; }
.ca-main-tab.active .ca-tab-count { background:#FF3A3A; color:#fff; }

/* filter tabs */
.ca-filters { display:flex; gap:8px; margin-bottom:24px; flex-wrap:wrap; align-items:center; }
.ca-filter { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:999px; border:1px solid rgba(255,255,255,.1); font-size:13px; font-weight:500; color:rgba(255,255,255,.6); cursor:pointer; font-family:inherit; background:transparent; transition:border-color .25s,background .25s,color .25s; }
.ca-filter:hover { border-color:rgba(255,255,255,.25); color:rgba(255,255,255,.9); }
.ca-filter.active { border-color:rgba(255,255,255,.45); background:rgba(255,255,255,.07); color:#fff; }
.ca-filter-c { font-family:'Russo One',sans-serif; font-size:10px; background:rgba(255,255,255,.08); padding:1px 7px; border-radius:999px; }
.ca-filter.active .ca-filter-c { background:#FF3A3A; color:#fff; }
.ca-select { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1); color:#fff; border-radius:999px; padding:8px 14px; font-size:12px; font-family:inherit; outline:none; cursor:pointer; transition:border-color .25s; }
.ca-select:hover { border-color:rgba(255,255,255,.25); }
.ca-select option { background:#061540; color:#fff; }

/* card list */
.ca-list { display:flex; flex-direction:column; gap:16px; }
.ca-card { display:grid; grid-template-columns:auto 1fr auto; gap:24px; align-items:start; padding:24px; background:linear-gradient(180deg,rgba(255,255,255,.04) 0%,rgba(255,255,255,.01) 100%); border:1px solid rgba(255,255,255,.1); border-radius:18px; transition:border-color .4s,transform .4s cubic-bezier(.22,1,.36,1); }
.ca-card:hover { border-color:rgba(255,255,255,.2); transform:translateY(-2px); }
@media(max-width:760px){ .ca-card { grid-template-columns:1fr; gap:16px; } }


/* content */
.ca-content { min-width:0; }
.ca-club-label { font-size:11px; letter-spacing:1.5px; color:#FF3A3A; text-transform:uppercase; font-weight:600; margin-bottom:4px; }
.ca-card-title { font-family:'Russo One',sans-serif; font-size:17px; letter-spacing:.2px; margin-bottom:6px; line-height:1.2; }
.ca-applicant { font-size:15px; font-weight:700; color:#7eb6ff; margin-bottom:4px; }
.ca-applicant a { color:inherit; text-decoration:none; border-bottom:1.5px solid rgba(126,182,255,.35); padding-bottom:1px; }
.ca-sub { font-size:13px; color:rgba(255,255,255,.55); margin-bottom:2px; }
.ca-meta { display:flex; flex-wrap:wrap; gap:12px; font-size:12px; color:rgba(255,255,255,.55); margin-top:6px; }
.ca-meta span { display:inline-flex; align-items:center; gap:5px; }
.ca-msg-block { margin-top:12px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.06); border-radius:10px; padding:10px 14px; font-size:13px; font-style:italic; line-height:1.6; color:rgba(255,255,255,.7); }
.ca-accepted-note { margin-top:10px; padding:10px 14px; border-radius:10px; background:rgba(46,210,127,.08); border:1px solid rgba(46,210,127,.25); font-size:13px; font-weight:600; color:#2ED27F; display:flex; align-items:center; gap:8px; }
.ca-accepted-note svg { width:14px; height:14px; stroke:#2ED27F; fill:none; stroke-width:2.5; flex-shrink:0; }

/* right */
.ca-right { display:flex; flex-direction:column; align-items:flex-end; gap:12px; flex-shrink:0; }
@media(max-width:760px){ .ca-right { align-items:flex-start; } }

/* status pill */
.ca-pill { display:inline-flex; align-items:center; gap:6px; font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; padding:6px 12px; border-radius:999px; white-space:nowrap; }
.ca-pill svg { width:12px; height:12px; stroke:currentColor; fill:none; stroke-width:2.5; }
.ca-pill.pending  { background:rgba(255,154,58,.12); color:#FF9A3A; border:1px solid rgba(255,154,58,.3); }
.ca-pill.accepted { background:rgba(46,210,127,.12); color:#2ED27F; border:1px solid rgba(46,210,127,.3); }
.ca-pill.rejected { background:rgba(255,58,58,.12);  color:#FF3A3A; border:1px solid rgba(255,58,58,.3); }

/* action buttons */
.ca-actions { display:flex; gap:8px; flex-wrap:wrap; }
.ca-btn { padding:8px 14px; border-radius:8px; font-size:12px; font-weight:600; border:1px solid rgba(255,255,255,.2); color:rgba(255,255,255,.8); cursor:pointer; font-family:inherit; background:transparent; text-decoration:none; display:inline-flex; align-items:center; gap:6px; transition:border-color .25s,background .25s,color .25s,transform .25s; }
.ca-btn:hover { border-color:rgba(255,255,255,.4); color:#fff; background:rgba(255,255,255,.04); }
.ca-btn.primary { background:#FF3A3A; color:#fff; border-color:#FF3A3A; }
.ca-btn.primary:hover { background:#e62e2e; border-color:#e62e2e; transform:translateY(-1px); }
.ca-btn.ca-green { background:rgba(46,210,127,.12); color:#2ED27F; border-color:rgba(46,210,127,.3); }
.ca-btn.ca-green:hover { background:rgba(46,210,127,.2); }
.ca-btn.ca-danger { background:rgba(255,58,58,.06); color:#FF3A3A; border-color:rgba(255,58,58,.22); }
.ca-btn.ca-danger:hover { background:rgba(255,58,58,.15); border-color:rgba(255,58,58,.4); }
.ca-btn.muted { color:rgba(255,255,255,.45); border-color:rgba(255,255,255,.1); }
.ca-btn.muted:hover { color:rgba(255,255,255,.75); border-color:rgba(255,255,255,.28); }

/* empty state */
.ca-empty { text-align:center; padding:80px 32px; display:flex; flex-direction:column; align-items:center; }
.ca-empty-icon { width:100px; height:100px; margin:0 auto 28px; border-radius:50%; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1); display:flex; align-items:center; justify-content:center; color:rgba(255,255,255,.3); }
.ca-empty h3 { font-family:'Russo One',sans-serif; font-size:26px; margin-bottom:12px; }
.ca-empty p { color:rgba(255,255,255,.55); max-width:420px; margin:0 auto 28px; font-size:15px; line-height:1.6; }
.ca-empty-link { display:inline-flex; align-items:center; gap:8px; background:#FF3A3A; color:#fff; padding:12px 24px; border-radius:12px; font-size:14px; font-weight:600; text-decoration:none; transition:transform .3s,box-shadow .3s; }
.ca-empty-link:hover { transform:translateY(-1px); box-shadow:0 12px 28px rgba(255,58,58,.4); }

/* confirm dialog */
.ca-overlay { position:fixed; inset:0; background:rgba(13,31,74,.85); backdrop-filter:blur(12px); display:flex; align-items:center; justify-content:center; z-index:1000; animation:ca-fadein .2s ease; }
@keyframes ca-fadein { from{opacity:0} to{opacity:1} }
.ca-dialog { background:linear-gradient(180deg,#142659 0%,#0d1f4a 100%); border:1px solid rgba(255,255,255,.12); border-radius:20px; padding:32px; max-width:400px; width:100%; margin:16px; animation:ca-slideup .25s cubic-bezier(.22,1,.36,1); }
@keyframes ca-slideup { from{transform:translateY(20px);opacity:0} to{transform:none;opacity:1} }
.ca-dialog h3 { font-family:'Russo One',sans-serif; font-size:20px; margin-bottom:10px; }
.ca-dialog p { color:rgba(255,255,255,.6); font-size:14px; line-height:1.6; margin-bottom:0; }
.ca-dialog-warn { display:flex; align-items:flex-start; gap:10px; background:rgba(255,154,58,.08); border:1px solid rgba(255,154,58,.25); border-radius:10px; padding:12px; margin:16px 0 24px; font-size:13px; color:rgba(255,255,255,.7); line-height:1.5; }
.ca-dialog-warn svg { flex-shrink:0; margin-top:1px; }
.ca-dialog-btns { display:flex; gap:10px; justify-content:flex-end; }

/* toast */
.ca-toast { position:fixed; bottom:28px; left:50%; transform:translateX(-50%); background:#142659; border:1px solid rgba(255,255,255,.15); border-radius:999px; padding:12px 24px; font-size:14px; font-weight:500; color:#fff; box-shadow:0 8px 32px rgba(0,0,0,.4); z-index:2000; animation:ca-fadein .3s ease; display:flex; align-items:center; gap:10px; white-space:nowrap; }
.ca-toast.ok { border-color:rgba(46,210,127,.35); }
.ca-toast.ok svg { color:#2ED27F; }
.ca-toast.err { border-color:rgba(255,58,58,.35); }
.ca-toast.err svg { color:#FF3A3A; }
`

// ── Status pill component ─────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  if (status === 'accepted') return (
    <span className="ca-pill accepted"><IcoCheck s={12} />Acceptée</span>
  )
  if (status === 'rejected') return (
    <span className="ca-pill rejected"><IcoX s={12} />Refusée</span>
  )
  return <span className="ca-pill pending"><IcoClock s={12} />En attente</span>
}

// ── Main page ─────────────────────────────────────────────────
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
  const [statsVersion, setStatsVersion] = useState(0)
  const [receivedFilter, setReceivedFilter] = useState<Status>('all')
  const [sentFilter, setSentFilter] = useState<Status>('all')
  const [filterAnnonce, setFilterAnnonce] = useState('')

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [confirmWithdrawId, setConfirmWithdrawId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null)

  function popToast(text: string, ok = true) {
    setToast({ text, ok })
    setTimeout(() => setToast(null), 3000)
  }

  function toggleExpand(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function switchMainTab(tab: MainTab) {
    if (tab === mainTab) return
    setStatsVersion(v => v + 1)
    setMainTab(tab)
    setReceivedFilter('all')
    setSentFilter('all')
  }

  // ── Auth guard ────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return
    if (!session) { router.push('/login'); return }
    if (!session.user.email_confirmed_at) { router.push('/verify-email-pending'); return }
    if (authProfile) { setProfile(authProfile); setPageLoading(false) }
  }, [authLoading, session, authProfile, router])

  // ── Data fetch ────────────────────────────────────────────
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

      if (typeof window !== 'undefined') window.dispatchEvent(new Event('candidatures-seen'))
      const unseenIds = received.filter(a => !a.seen_by_owner).map(a => a.id)
      if (unseenIds.length > 0) {
        await supabase.from('applications').update({ seen_by_owner: true }).in('id', unseenIds)
      }
    })()
    return () => { cancelled = true }
  }, [profile?.id])

  // ── Mutations ─────────────────────────────────────────────
  async function updateStatus(id: string, status: 'pending' | 'accepted' | 'rejected') {
    setReceivedApps(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/applications/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        setReceivedApps(prev => prev.map(a => a.id === id ? { ...a, status: 'pending' } : a))
        popToast('Erreur, réessayez.', false)
      } else {
        if (status === 'accepted') popToast('Candidature acceptée !')
        else if (status === 'rejected') popToast('Candidature refusée.')
        else popToast('Statut mis à jour.')
      }
    } catch (e) {
      console.error('Application status network error:', e)
      setReceivedApps(prev => prev.map(a => a.id === id ? { ...a, status: 'pending' } : a))
      popToast('Erreur réseau, réessayez.', false)
    }
  }

  async function cancelApplication(id: string) {
    setSentApps(prev => prev.filter(a => a.id !== id))
    await supabase.from('applications').delete().eq('id', id)
    popToast('Candidature retirée.')
    setConfirmWithdrawId(null)
  }

  // ── Counts ────────────────────────────────────────────────
  const rCounts = {
    all: receivedApps.length,
    pending:  receivedApps.filter(a => a.status === 'pending').length,
    accepted: receivedApps.filter(a => a.status === 'accepted').length,
    rejected: receivedApps.filter(a => a.status === 'rejected').length,
  }
  const sCounts = {
    all: sentApps.length,
    pending:  sentApps.filter(a => a.status === 'pending').length,
    accepted: sentApps.filter(a => a.status === 'accepted').length,
    rejected: sentApps.filter(a => a.status === 'rejected').length,
  }
  const activeCounts = mainTab === 'received' ? rCounts : sCounts

  // ── Filtered lists ────────────────────────────────────────
  const filteredReceived = receivedApps.filter(a => {
    if (receivedFilter !== 'all' && a.status !== receivedFilter) return false
    if (filterAnnonce && a.annonce_id !== filterAnnonce) return false
    return true
  })
  const filteredSent = sentFilter === 'all' ? sentApps : sentApps.filter(a => a.status === sentFilter)

  // ── Labels ────────────────────────────────────────────────
  const filterLabels: Record<Status, string> = {
    all:      lang === 'fr' ? 'Toutes' : 'Alle',
    pending:  lang === 'fr' ? 'En attente' : 'Ausstehend',
    accepted: lang === 'fr' ? 'Acceptées' : 'Akzeptiert',
    rejected: lang === 'fr' ? 'Refusées' : 'Abgelehnt',
  }
  const statLabels = {
    total:    lang === 'fr' ? 'Total envoyées' : 'Total gesendet',
    totalRec: lang === 'fr' ? 'Total reçues' : 'Total erhalten',
    pending:  lang === 'fr' ? 'En attente' : 'Ausstehend',
    accepted: lang === 'fr' ? 'Acceptées' : 'Akzeptiert',
    rejected: lang === 'fr' ? 'Refusées' : 'Abgelehnt',
  }

  // ── Page loading ──────────────────────────────────────────
  if (pageLoading) return (
    <div className="ca-wrap ca-center">
      <style>{CAND_CSS}</style>
      <div className="ca-spinner" />
    </div>
  )
  if (!profile) return null

  return (
    <div className="ca-wrap">
      <style>{CAND_CSS}</style>

      {/* ── PAGE HEADER ── */}
      <header className="ca-header">
        <div className="ca-container" style={{ position:'relative', zIndex:1 }}>
          <p className="ca-eyebrow">
            <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>
            {lang === 'fr' ? 'Mes postulations' : 'Meine Bewerbungen'}
          </p>
          <h1 className="ca-page-title">
            {lang === 'fr' ? <>Mes <span className="ca-em">candidatures.</span></> : <>Meine <span className="ca-em">Bewerbungen.</span></>}
          </h1>
          <p className="ca-page-sub">
            {lang === 'fr'
              ? 'Suis l\'état de toutes tes postulations. Les clubs répondent généralement sous 48-72h.'
              : 'Verfolge den Stand all deiner Bewerbungen. Vereine antworten in der Regel innerhalb von 48-72 Stunden.'}
          </p>

          {/* 4 stat cards — dynamic per active tab */}
          <div className="ca-stats">
            <div className="ca-stat">
              <span className="ca-stat-num" key={`total-${statsVersion}`}>{activeCounts.all}</span>
              <span className="ca-stat-label">{mainTab === 'received' ? statLabels.totalRec : statLabels.total}</span>
            </div>
            <div className="ca-stat ca-orange">
              <span className="ca-stat-num" key={`pend-${statsVersion}`}>{activeCounts.pending}</span>
              <span className="ca-stat-label">{statLabels.pending}</span>
            </div>
            <div className="ca-stat ca-green">
              <span className="ca-stat-num" key={`acc-${statsVersion}`}>{activeCounts.accepted}</span>
              <span className="ca-stat-label">{statLabels.accepted}</span>
            </div>
            <div className="ca-stat ca-red">
              <span className="ca-stat-num" key={`rej-${statsVersion}`}>{activeCounts.rejected}</span>
              <span className="ca-stat-label">{statLabels.rejected}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── CONTENT SECTION ── */}
      <section className="ca-section" style={{ marginTop: 40 }}>
        <div className="ca-container">

          {/* Main tabs */}
          <div className="ca-main-tabs">
            <button className={`ca-main-tab${mainTab === 'received' ? ' active' : ''}`}
              onClick={() => switchMainTab('received')}>
              <IcoIn s={14} />
              {t.cands.tab_received[lang]}
              <span className="ca-tab-count">{rCounts.all}</span>
            </button>
            <button className={`ca-main-tab${mainTab === 'sent' ? ' active' : ''}`}
              onClick={() => switchMainTab('sent')}>
              <IcoOut s={14} />
              {t.cands.tab_sent[lang]}
              <span className="ca-tab-count">{sCounts.all}</span>
            </button>
          </div>

          {dataLoading ? (
            <div className="ca-load-inner">
              <div className="ca-spinner" style={{ width:28, height:28, borderWidth:3 }} />
              {t.cands.loading[lang]}
            </div>
          ) : mainTab === 'received' ? (

            /* ══ RECEIVED TAB ══ */
            <>
              <div className="ca-filters">
                {(['all', 'pending', 'accepted', 'rejected'] as Status[]).map(f => (
                  <button key={f} className={`ca-filter${receivedFilter === f ? ' active' : ''}`}
                    onClick={() => setReceivedFilter(f)}>
                    {filterLabels[f]}
                    <span className="ca-filter-c">{rCounts[f]}</span>
                  </button>
                ))}
                {annonces.length > 0 && (
                  <select className="ca-select" value={filterAnnonce}
                    onChange={e => setFilterAnnonce(e.target.value)}>
                    <option value="">{t.cands.all_annonces[lang]}</option>
                    {annonces.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                  </select>
                )}
              </div>

              {filteredReceived.length === 0 ? (
                <div className="ca-empty">
                  <div className="ca-empty-icon">
                    {receivedApps.length === 0 ? <IcoEmpty s={44} /> : <IcoDone s={44} />}
                  </div>
                  <h3>{receivedApps.length === 0
                    ? (lang === 'fr' ? 'Aucune candidature reçue' : 'Keine Bewerbungen erhalten')
                    : (lang === 'fr' ? 'Aucune dans cette catégorie' : 'Keine in dieser Kategorie')}</h3>
                  <p>{receivedApps.length === 0
                    ? t.cands.no_received[lang]
                    : t.cands.no_category[lang]}</p>
                </div>
              ) : (
                <div className="ca-list">
                  {filteredReceived.map(a => {
                    const isExpanded = expandedIds.has(a.id)
                    return (
                      <article key={a.id} className="ca-card">
                        {/* Avatar (round — person) */}
                        <div style={{ width:52, height:52, borderRadius:'50%', overflow:'hidden', flexShrink:0, background:'linear-gradient(135deg,#1a3a8a 0%,#0d1f4a 100%)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <UserAvatar userId={a.applicant_id} size={52} radius={0}
                            fallback={<IcoUser s={24} />} />
                        </div>

                        {/* Content */}
                        <div className="ca-content">
                          <div className="ca-applicant">
                            <Link href={`/profil/${a.applicant_id}`}>{a.applicant_name}</Link>
                          </div>
                          <div className="ca-sub">
                            {t.cands.for_label[lang]} <strong>{a.annonce_title}</strong>
                            {a.annonce_ligue ? ` · ${a.annonce_ligue}` : ''}
                          </div>
                          <div className="ca-meta">
                            <span><IcoClock />{relativeTime(a.created_at, lang)}</span>
                            {a.message && <span><IcoMsgIco />{lang === 'fr' ? 'Avec message' : 'Mit Nachricht'}</span>}
                          </div>
                          {a.message && isExpanded && (
                            <div className="ca-msg-block">«{a.message}»</div>
                          )}
                        </div>

                        {/* Right */}
                        <div className="ca-right">
                          <StatusPill status={a.status} />
                          <div className="ca-actions">
                            {a.message && (
                              <button className="ca-btn muted" onClick={() => toggleExpand(a.id)}>
                                {isExpanded
                                  ? (lang === 'fr' ? 'Masquer' : 'Verbergen')
                                  : (lang === 'fr' ? 'Voir message' : 'Nachricht')}
                              </button>
                            )}
                            {a.status === 'pending' && (
                              <>
                                <button className="ca-btn ca-green"
                                  onClick={() => updateStatus(a.id, 'accepted')}>
                                  <IcoCheck s={12} />{t.cands.accept_btn[lang].replace('✅ ', '')}
                                </button>
                                <button className="ca-btn ca-danger"
                                  onClick={() => updateStatus(a.id, 'rejected')}>
                                  <IcoX s={12} />{t.cands.refuse_btn[lang].replace('❌ ', '')}
                                </button>
                                <Link href={`/messages?partner=${a.applicant_id}`} className="ca-btn muted">
                                  <IcoMsgIco s={12} />{lang === 'fr' ? 'Message' : 'Nachricht'}
                                </Link>
                              </>
                            )}
                            {a.status === 'accepted' && (
                              <>
                                <Link href={`/messages?partner=${a.applicant_id}`} className="ca-btn primary">
                                  <IcoMsgIco s={12} />{lang === 'fr' ? 'Contacter' : 'Kontaktieren'}
                                </Link>
                                <button className="ca-btn muted"
                                  onClick={() => updateStatus(a.id, 'rejected')}>
                                  {t.cands.cancel_btn[lang].replace('↩ ', '')}
                                </button>
                              </>
                            )}
                            {a.status === 'rejected' && (
                              <button className="ca-btn muted"
                                onClick={() => updateStatus(a.id, 'pending')}>
                                {t.cands.reconsider_btn[lang].replace('↩ ', '')}
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </>

          ) : (

            /* ══ SENT TAB ══ */
            <>
              <div className="ca-filters">
                {(['all', 'pending', 'accepted', 'rejected'] as Status[]).map(f => (
                  <button key={f} className={`ca-filter${sentFilter === f ? ' active' : ''}`}
                    onClick={() => setSentFilter(f)}>
                    {filterLabels[f]}
                    <span className="ca-filter-c">{sCounts[f]}</span>
                  </button>
                ))}
              </div>

              {filteredSent.length === 0 ? (
                <div className="ca-empty">
                  <div className="ca-empty-icon">
                    {sentApps.length === 0 ? <IcoEmpty s={44} /> : <IcoDone s={44} />}
                  </div>
                  <h3>{sentApps.length === 0
                    ? t.cands.no_cands[lang]
                    : (lang === 'fr' ? 'Aucune dans cette catégorie' : 'Keine in dieser Kategorie')}</h3>
                  <p>{sentApps.length === 0 ? t.cands.explore_msg[lang] : t.cands.no_category[lang]}</p>
                  {sentApps.length === 0 && (
                    <Link href="/annonces" className="ca-empty-link">
                      <IcoArrow s={16} />{t.cands.see_annonces[lang]}
                    </Link>
                  )}
                </div>
              ) : (
                <div className="ca-list">
                  {filteredSent.map(a => {
                    const clubName = a.annonce_author || ''
                    const isExpanded = expandedIds.has(a.id)
                    return (
                      <article key={a.id} className="ca-card">
                        <ClubCrest size={56} fallback={shieldInit(clubName)} />

                        {/* Content */}
                        <div className="ca-content">
                          <p className="ca-club-label">
                            {clubName}{a.annonce_ligue ? ` · ${a.annonce_ligue}` : ''}
                          </p>
                          <h3 className="ca-card-title">{a.annonce_title || t.cands.annonce_label[lang]}</h3>
                          <div className="ca-meta">
                            <span><IcoClock />{relativeTime(a.created_at, lang)}</span>
                            {a.message && <span><IcoMsgIco />{lang === 'fr' ? 'Avec message' : 'Mit Nachricht'}</span>}
                          </div>
                          {a.message && isExpanded && (
                            <div className="ca-msg-block">«{a.message}»</div>
                          )}
                          {a.status === 'accepted' && (
                            <div className="ca-accepted-note">
                              <IcoCheck s={14} />
                              {lang === 'fr'
                                ? 'Ta candidature a été acceptée. Contacte le club pour la suite.'
                                : 'Deine Bewerbung wurde akzeptiert. Kontaktiere den Verein für das Weitere.'}
                            </div>
                          )}
                        </div>

                        {/* Right */}
                        <div className="ca-right">
                          <StatusPill status={a.status} />
                          <div className="ca-actions">
                            {a.message && (
                              <button className="ca-btn muted" onClick={() => toggleExpand(a.id)}>
                                {isExpanded
                                  ? (lang === 'fr' ? 'Masquer' : 'Verbergen')
                                  : (lang === 'fr' ? 'Voir détails' : 'Details')}
                              </button>
                            )}
                            {a.status === 'pending' && (
                              <button className="ca-btn ca-danger"
                                onClick={() => setConfirmWithdrawId(a.id)}>
                                <IcoX s={12} />{lang === 'fr' ? 'Retirer' : 'Zurückziehen'}
                              </button>
                            )}
                            {a.status === 'accepted' && a.annonce_author_id && (
                              <Link href={`/messages?partner=${a.annonce_author_id}`} className="ca-btn primary">
                                <IcoMsgIco s={12} />{lang === 'fr' ? 'Répondre au club' : 'Verein kontaktieren'}
                              </Link>
                            )}
                            {a.annonce_author_id && (
                              <Link href={`/messages?partner=${a.annonce_author_id}`} className="ca-btn muted">
                                {lang === 'fr' ? 'Voir l\'annonce' : 'Anzeige ansehen'}
                              </Link>
                            )}
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── CONFIRM WITHDRAW DIALOG ── */}
      {confirmWithdrawId && (
        <div className="ca-overlay" onClick={() => setConfirmWithdrawId(null)}>
          <div className="ca-dialog" onClick={e => e.stopPropagation()}>
            <h3>{lang === 'fr' ? 'Retirer ta candidature ?' : 'Bewerbung zurückziehen?'}</h3>
            <p>{lang === 'fr'
              ? 'Es-tu sûr de vouloir retirer cette candidature ?'
              : 'Bist du sicher, dass du diese Bewerbung zurückziehen möchtest?'}</p>
            <div className="ca-dialog-warn">
              <IcoWarn s={15} />
              {lang === 'fr'
                ? 'Cette action est irréversible. Le club ne pourra plus voir ta candidature.'
                : 'Diese Aktion ist unwiderruflich. Der Verein kann deine Bewerbung nicht mehr sehen.'}
            </div>
            <div className="ca-dialog-btns">
              <button className="ca-btn muted" onClick={() => setConfirmWithdrawId(null)}>
                {lang === 'fr' ? 'Annuler' : 'Abbrechen'}
              </button>
              <button className="ca-btn ca-danger"
                onClick={() => cancelApplication(confirmWithdrawId)}>
                <IcoX s={12} />{lang === 'fr' ? 'Retirer' : 'Zurückziehen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div className={`ca-toast ${toast.ok ? 'ok' : 'err'}`}>
          {toast.ok ? <IcoCheck s={16} /> : <IcoX s={16} />}
          {toast.text}
        </div>
      )}
    </div>
  )
}
