'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, Profile, Annonce, Application, avatarSrc } from '../../lib/supabase'
import { ligues, zones, positions } from '../../lib/data'
import { useLang } from '../../lib/lang-context'
import { t, Lang } from '../../lib/translations'
import { useAuth } from '../../lib/auth-context'
import ClubCrest from '../../components/ClubCrest'
import { relativeTime } from '../../lib/utils/time'
import PostModal from '../../components/PostModal'

type AppWithAnnonce = Application & { annonce_title?: string; annonce_author_name?: string }
type FeedItem = { id: string; dotColor: 'green'|'red'|'blue'|'orange'; text: JSX.Element|string; timestamp: string }

// ——— SVG helpers ————————————————————————————
const Svg = ({ children, size=18, color='currentColor', ...p }: any) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    {children}
  </svg>
)
const IcoCheck    = ({s=16}:{s?:number}) => <Svg size={s}><polyline points="20 6 9 17 4 12"/></Svg>
const IcoX        = ({s=16}:{s?:number}) => <Svg size={s}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Svg>
const IcoPlus     = ({s=16}:{s?:number}) => <Svg size={s}><path d="M12 5v14M5 12h14"/></Svg>
const IcoArrow    = ({s=14}:{s?:number}) => <Svg size={s}><path d="M5 12h14M12 5l7 7-7 7"/></Svg>
const IcoBack     = ({s=16}:{s?:number}) => <Svg size={s}><path d="M19 12H5M12 19l-7-7 7-7"/></Svg>
const IcoSearch   = ({s=14}:{s?:number}) => <Svg size={s}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></Svg>
const IcoPencil   = ({s=14}:{s?:number}) => <Svg size={s}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></Svg>
const IcoMsg      = ({s=16}:{s?:number}) => <Svg size={s}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></Svg>
const IcoBuilding = ({s=18}:{s?:number}) => <Svg size={s}><path d="M3 21V8l9-5 9 5v13"/><path d="M9 21V12h6v9"/></Svg>
const IcoCoach    = ({s=18}:{s?:number}) => <Svg size={s}><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v6c0 1.5 4 4 9 4s9-2.5 9-4V7"/></Svg>
const IcoPlayer   = ({s=18}:{s?:number}) => <Svg size={s}><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></Svg>
const IcoClock    = ({s=12}:{s?:number}) => <Svg size={s}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></Svg>
const IcoPin      = ({s=12}:{s?:number}) => <Svg size={s}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></Svg>
const IcoActivity = ({s=28}:{s?:number}) => <Svg size={s} strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></Svg>
const IcoEmpty    = ({s=28}:{s?:number}) => <Svg size={s} strokeWidth="1.5"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 9h16M9 4v16"/></Svg>
const IcoSettings = ({s=16}:{s?:number}) => (
  <Svg size={s}>
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </Svg>
)

// ——— Completion % ————————————————————————————
function computeCompletion(profile: Profile): number {
  const fields: (keyof Profile)[] = profile.role === 'club'
    ? ['club_name','ligue','zone','bio','avatar_url','club_website','club_email_public','club_instagram']
    : profile.role === 'coach'
    ? ['first_name','last_name','ligue','zone','bio','avatar_url','coach_experience','coach_diploma','coach_specialty']
    : ['first_name','last_name','position','ligue','zone','bio','avatar_url','age','foot']
  const filled = fields.filter(f => { const v = profile[f]; return v !== null && v !== undefined && v !== '' }).length
  return Math.round((filled / fields.length) * 100)
}

// ——— Avatar gradients ———————————————————————
const GRADS = [
  'linear-gradient(135deg,#FF3A3A 0%,#c41f1f 100%)',
  'linear-gradient(135deg,#1a3a8a 0%,#0d1f4a 100%)',
  'linear-gradient(135deg,#2ED27F 0%,#1a8a52 100%)',
  'linear-gradient(135deg,#ff9a3a 0%,#c4651f 100%)',
  'linear-gradient(135deg,#3a7aff 0%,#1f4ac4 100%)',
]

// ======================================================
// MAIN PAGE
// ======================================================
export default function DashboardPage() {
  const { lang } = useLang()
  const router = useRouter()
  const { session, profile: authProfile, authLoading } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(authProfile)
  const [loading, setLoading] = useState(!authProfile)
  const [section, setSection] = useState<'overview'|'settings'>('overview')

  useEffect(() => {
    if (authLoading) return
    if (!session) { router.push('/login'); return }
    if (authProfile) { setProfile(authProfile); setLoading(false) }
  }, [authLoading, session, authProfile, router])

  if (loading || authLoading) return (
    <div className="db-loading-page">
      <div className="db-spinner" />
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        .db-loading-page{display:flex;align-items:center;justify-content:center;min-height:60vh;
          background:radial-gradient(ellipse at top,#1a2f6b 0%,transparent 60%),#0D1F4A}
        .db-spinner{width:40px;height:40px;border:4px solid rgba(255,255,255,.1);
          border-top-color:#FF3A3A;border-radius:50%;animation:spin .8s linear infinite}
      `}</style>
    </div>
  )

  if (!profile) return null

  return (
    <>
      {section === 'overview' && (
        <DashboardOverview
          profile={profile}
          onShowSettings={() => setSection('settings')}
          onProfileUpdate={setProfile}
        />
      )}
      {section === 'settings' && (
        <SettingsWrapper
          profile={profile}
          onBack={() => setSection('overview')}
          onSaved={setProfile}
          lang={lang}
        />
      )}
    </>
  )
}

// ======================================================
// DASHBOARD OVERVIEW
// ======================================================
function DashboardOverview({ profile, onShowSettings, onProfileUpdate }: {
  profile: Profile
  onShowSettings: () => void
  onProfileUpdate: (p: Profile) => void
}) {
  const { lang } = useLang()
  const [showPostModal, setShowPostModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const displayName = profile.role === 'club'
    ? (profile.club_name || profile.email)
    : (profile.first_name || profile.email.split('@')[0])

  return (
    <div className="db-page">
      {/* Welcome */}
      <header className="db-welcome">
        <div className="db-container">
          <div className="db-welcome-head">
            <div>
              <div className="db-eyebrow">Dashboard</div>
              <h1 className="db-welcome-title">
                Bonjour, <span className="db-em">{displayName}.</span>
              </h1>
              <p className="db-welcome-sub">
                {profile.role === 'club'
                  ? 'Gérez votre club et vos recrutements.'
                  : "Voici ce qui s'est passé pour toi cette semaine."}
              </p>
            </div>
            <div className="db-welcome-actions">
              <Link href="/annonces" className="db-btn-sec">
                <IcoSearch s={14} />Explorer
              </Link>
              <button className="db-btn-pri" onClick={() => setShowPostModal(true)}>
                <IcoPlus s={14} />Publier une annonce
              </button>
            </div>
          </div>
          <StatCards profile={profile} refreshKey={refreshKey} />
        </div>
      </header>

      {/* Main grid */}
      <div className="db-container">
        <div className="db-main-grid">
          <div className="db-left">
            {profile.role === 'club' ? (
              <>
                <CandidaturesPending profile={profile} />
                <MesAnnonces profile={profile} refreshKey={refreshKey} onOpenPublish={() => setShowPostModal(true)} />
              </>
            ) : (
              <>
                <RecommendedSection profile={profile} />
                <CandidaturesPreview profile={profile} />
              </>
            )}
            <ActivityFeed profile={profile} refreshKey={refreshKey} />
          </div>
          <aside>
            <ProfileSidebar profile={profile} onShowSettings={onShowSettings} lang={lang} />
          </aside>
        </div>
      </div>

      {showPostModal && (
        <PostModal
          profile={profile}
          onClose={() => setShowPostModal(false)}
          onSuccess={() => { setRefreshKey(k => k + 1); setShowPostModal(false) }}
        />
      )}

      <style>{DB_CSS}</style>
    </div>
  )
}

// ======================================================
// STAT CARDS
// ======================================================
function StatCards({ profile, refreshKey }: { profile: Profile; refreshKey: number }) {
  const [annoncesCount, setAnnoncesCount] = useState<number|null>(null)
  const [appsCount,     setAppsCount]     = useState<number|null>(null)
  const [pendingCount,  setPendingCount]  = useState<number|null>(null)
  const [msgsCount,     setMsgsCount]     = useState<number|null>(null)

  useEffect(() => {
    supabase.from('annonces').select('id', { count:'exact' })
      .eq('author_id', profile.id)
      .then(({ count }) => setAnnoncesCount(count ?? 0))

    if (profile.role === 'club') {
      supabase.from('applications').select('id, annonces!inner(author_id)', { count:'exact' })
        .eq('annonces.author_id', profile.id)
        .then(({ count }) => setAppsCount(count ?? 0))
      supabase.from('applications').select('id, annonces!inner(author_id)', { count:'exact' })
        .eq('annonces.author_id', profile.id).eq('status', 'pending')
        .then(({ count }) => setPendingCount(count ?? 0))
    } else {
      supabase.from('applications').select('id', { count:'exact' })
        .eq('applicant_id', profile.id)
        .then(({ count }) => setAppsCount(count ?? 0))
      supabase.from('applications').select('id', { count:'exact' })
        .eq('applicant_id', profile.id).eq('status', 'pending')
        .then(({ count }) => setPendingCount(count ?? 0))
    }

    supabase.from('messages').select('id', { count:'exact' })
      .eq('receiver_id', profile.id).eq('read', false)
      .then(({ count }) => setMsgsCount(count ?? 0))
  }, [profile.id, profile.role, refreshKey])

  const cards = [
    { value: annoncesCount, label: 'Mes annonces',
      color:'#3A7AFF', bg:'rgba(58,122,255,.12)', border:'rgba(58,122,255,.3)',
      icon: <IcoBuilding s={18} /> },
    { value: appsCount,
      label: profile.role === 'club' ? 'Candidatures reçues' : 'Candidatures envoyées',
      color:'#FF3A3A', bg:'rgba(255,58,58,.12)', border:'rgba(255,58,58,.3)',
      icon: <IcoCheck s={18} /> },
    { value: pendingCount, label: 'En attente',
      color:'#FF9A3A', bg:'rgba(255,154,58,.12)', border:'rgba(255,154,58,.3)',
      icon: <IcoClock s={18} /> },
    { value: msgsCount, label: 'Messages non lus',
      color:'#2ED27F', bg:'rgba(46,210,127,.12)', border:'rgba(46,210,127,.3)',
      icon: <IcoMsg s={18} /> },
  ]

  return (
    <div className="db-stats-grid">
      {cards.map((c, i) => (
        <div key={i} className="db-stat-card">
          <div className="db-stat-icon" style={{ background:c.bg, border:`1px solid ${c.border}`, color:c.color }}>
            {c.icon}
          </div>
          <div className="db-stat-num" style={{ color:c.color }}>{c.value === null ? '—' : c.value}</div>
          <div className="db-stat-label">{c.label}</div>
        </div>
      ))}
    </div>
  )
}

// ======================================================
// RECOMMENDED SECTION (joueur / coach)
// ======================================================
function RecommendedSection({ profile }: { profile: Profile }) {
  const [annonces, setAnnonces] = useState<Annonce[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    const targetType = 'club'
    const base = () => supabase.from('annonces').select('*')
      .eq('status','active').eq('author_type', targetType)
      .neq('author_id', profile.id)
      .order('created_at', { ascending: false }).limit(4)

    const q = profile.zone ? base().eq('zone', profile.zone) : base()
    q.then(({ data }) => {
      if ((data?.length ?? 0) < 2 && profile.zone) {
        base().then(({ data: d2 }) => { setAnnonces(d2 || []); setLoading(false) })
      } else {
        setAnnonces(data || [])
        setLoading(false)
      }
    })
  }, [profile.id, profile.zone])

  const isNew = (d: string) => Date.now() - new Date(d).getTime() < 86_400_000

  return (
    <div className="db-section-card">
      <div className="db-section-head">
        <h2 className="db-section-title">Recommandé pour <span className="db-em">toi</span></h2>
        <Link href="/annonces" className="db-section-link">Voir tout <IcoArrow s={12}/></Link>
      </div>
      {loading ? <Loading /> : annonces.length === 0 ? (
        <Empty icon={<IcoEmpty s={28}/>} msg="Aucune annonce dans ta zone pour l'instant.">
          <Link href="/annonces" className="db-empty-link">Explorer toutes les annonces <IcoArrow s={12}/></Link>
        </Empty>
      ) : (
        <div className="db-recos-list">
          {annonces.map(a => {
            const initials = a.author_name.slice(0, 2).toUpperCase()
            const grad = GRADS[a.author_name.charCodeAt(0) % GRADS.length]
            return (
              <Link key={a.id} href="/annonces" className="db-reco-row">
                <ClubCrest size={40} fallback={initials} />
                <div className="db-reco-content">
                  <div className="db-reco-club">{a.author_name}</div>
                  <div className="db-reco-title">{a.title}</div>
                  <div className="db-reco-meta">
                    {a.zone   && <span><IcoPin s={10}/>{a.zone}</span>}
                    {a.ligue  && <span><IcoClock s={10}/>{a.ligue}</span>}
                    <span>{relativeTime(a.created_at)}</span>
                  </div>
                </div>
                {isNew(a.created_at) && <span className="db-badge-new">Nouveau</span>}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ======================================================
// CANDIDATURES PREVIEW (joueur / coach — sent)
// ======================================================
function CandidaturesPreview({ profile }: { profile: Profile }) {
  const [apps,    setApps]    = useState<AppWithAnnonce[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('applications')
      .select('*, annonces!inner(title, author_name)')
      .eq('applicant_id', profile.id)
      .order('created_at', { ascending: false }).limit(4)
      .then(({ data }) => {
        setApps((data || []).map((a: any) => ({
          ...a, annonce_title: a.annonces?.title, annonce_author_name: a.annonces?.author_name,
        })))
        setLoading(false)
      })
  }, [profile.id])

  return (
    <div className="db-section-card">
      <div className="db-section-head">
        <h2 className="db-section-title">Mes <span className="db-em">candidatures</span></h2>
        <Link href="/candidatures" className="db-section-link">Voir tout <IcoArrow s={12}/></Link>
      </div>
      {loading ? <Loading /> : apps.length === 0 ? (
        <Empty icon={<IcoEmpty s={28}/>} msg="Aucune candidature envoyée pour l'instant.">
          <Link href="/annonces" className="db-empty-link">Explorer les annonces <IcoArrow s={12}/></Link>
        </Empty>
      ) : (
        <div className="db-cands-list">
          {apps.map(a => (
            <div key={a.id} className="db-cand-row">
              <div className="db-cand-icon"><IcoCheck s={16}/></div>
              <div className="db-cand-content">
                <div className="db-cand-title">
                  {a.annonce_title || 'Annonce'}
                  {a.annonce_author_name && <span className="db-cand-sub2"> — {a.annonce_author_name}</span>}
                </div>
                <div className="db-cand-date">Envoyée {relativeTime(a.created_at)}</div>
              </div>
              <StatusBadge status={a.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ======================================================
// CANDIDATURES PENDING (club — received, with accept/refuse)
// ======================================================
function CandidaturesPending({ profile }: { profile: Profile }) {
  const [apps,    setApps]    = useState<AppWithAnnonce[]>([])
  const [loading, setLoading] = useState(true)
  const [toast,   setToast]   = useState<{ text: string; ok: boolean } | null>(null)

  useEffect(() => {
    supabase.from('applications')
      .select('*, annonces!inner(title, author_id)')
      .eq('annonces.author_id', profile.id)
      .eq('status','pending')
      .order('created_at', { ascending: false }).limit(4)
      .then(({ data }) => {
        setApps((data || []).map((a: any) => ({ ...a, annonce_title: a.annonces?.title })))
        setLoading(false)
      })
  }, [profile.id])

  function popToast(text: string, ok = true) {
    setToast({ text, ok })
    setTimeout(() => setToast(null), 2500)
  }

  async function handleStatus(id: string, status: 'accepted'|'rejected') {
    setApps(prev => prev.filter(a => a.id !== id))
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/applications/${id}/status`, {
        method:'PATCH',
        headers:{ 'Content-Type':'application/json', ...(session?.access_token ? { Authorization:`Bearer ${session.access_token}` } : {}) },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) { popToast('Erreur, réessayez.', false) }
      else { popToast(status === 'accepted' ? 'Candidature acceptée !' : 'Candidature refusée.') }
    } catch {
      popToast('Erreur réseau.', false)
    }
  }

  return (
    <div className="db-section-card" style={{ position:'relative' }}>
      {toast && (
        <div className={`db-toast ${toast.ok ? 'ok' : 'err'}`}>
          {toast.ok ? <IcoCheck s={14}/> : <IcoX s={14}/>}{toast.text}
        </div>
      )}
      <div className="db-section-head">
        <h2 className="db-section-title">Candidatures <span className="db-em">en attente</span></h2>
        <Link href="/candidatures" className="db-section-link">Voir tout <IcoArrow s={12}/></Link>
      </div>
      {loading ? <Loading /> : apps.length === 0 ? (
        <Empty icon={<IcoEmpty s={28}/>} msg="Aucune candidature en attente." />
      ) : (
        <div className="db-cands-list">
          {apps.map(a => (
            <div key={a.id} className="db-cand-row">
              <Link href={`/profil/${a.applicant_id}`} className="db-cand-avatar">
                <IcoPlayer s={16}/>
              </Link>
              <div className="db-cand-content">
                <Link href={`/profil/${a.applicant_id}`} className="db-cand-name">{a.applicant_name}</Link>
                <div className="db-cand-date">{a.annonce_title} · {relativeTime(a.created_at)}</div>
              </div>
              <div className="db-cand-btns">
                <button className="db-btn-accept" onClick={() => handleStatus(a.id, 'accepted')}>
                  <IcoCheck s={12}/>Accepter
                </button>
                <button className="db-btn-refuse" onClick={() => handleStatus(a.id, 'rejected')}>
                  <IcoX s={12}/>Refuser
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ======================================================
// MES ANNONCES (club — preview + close)
// ======================================================
function MesAnnonces({ profile, refreshKey, onOpenPublish }: {
  profile: Profile; refreshKey: number; onOpenPublish: () => void
}) {
  const { lang } = useLang()
  const [annonces, setAnnonces] = useState<Annonce[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    supabase.from('annonces').select('*')
      .eq('author_id', profile.id)
      .order('created_at', { ascending: false }).limit(4)
      .then(({ data }) => { setAnnonces(data || []); setLoading(false) })
  }, [profile.id, refreshKey])

  async function closeAnnonce(id: string) {
    await supabase.from('annonces').update({ status:'closed' }).eq('id', id)
    setAnnonces(prev => prev.map(a => a.id === id ? { ...a, status:'closed' } : a))
  }

  return (
    <div className="db-section-card">
      <div className="db-section-head">
        <h2 className="db-section-title">Mes <span className="db-em">annonces</span></h2>
        <button className="db-section-link" onClick={onOpenPublish}><IcoPlus s={12}/>Publier</button>
      </div>
      {loading ? <Loading /> : annonces.length === 0 ? (
        <Empty icon={<IcoEmpty s={28}/>} msg="Aucune annonce publiée pour l'instant.">
          <button className="db-empty-link" onClick={onOpenPublish}>Publier ta première annonce <IcoArrow s={12}/></button>
        </Empty>
      ) : (
        <div className="db-annonces-list">
          {annonces.map(a => (
            <div key={a.id} className="db-annonce-row">
              <div className="db-annonce-content">
                <div className="db-annonce-title">{a.title}</div>
                <div className="db-annonce-meta">
                  {a.ligue && <span>{a.ligue}</span>}
                  {a.zone  && <span>{a.zone}</span>}
                  <span>{relativeTime(a.created_at)}</span>
                </div>
              </div>
              <div className="db-annonce-right">
                <span className={`db-annonce-status ${a.status}`}>
                  {a.status === 'active' ? t.dash.annonce_active[lang] : t.dash.annonce_closed[lang]}
                </span>
                {a.status === 'active' && (
                  <button className="db-btn-close-ann" onClick={() => closeAnnonce(a.id)}>
                    {t.dash.close_btn[lang]}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ======================================================
// ACTIVITY FEED
// ======================================================
function ActivityFeed({ profile, refreshKey }: { profile: Profile; refreshKey: number }) {
  const [items,   setItems]   = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const feed: FeedItem[] = []
    const ps: PromiseLike<void>[] = []

    if (profile.role === 'club') {
      ps.push(
        supabase.from('applications')
          .select('id, applicant_name, status, created_at, annonces!inner(title, author_id)')
          .eq('annonces.author_id', profile.id)
          .order('created_at', { ascending: false }).limit(5)
          .then(({ data }) => {
            for (const a of (data || []) as any[]) {
              feed.push({ id:`app_${a.id}`, dotColor:'orange',
                text: <><strong>{a.applicant_name}</strong> a postulé à <strong>{a.annonces?.title || 'une annonce'}</strong></>,
                timestamp: a.created_at })
            }
          })
      )
    } else {
      ps.push(
        supabase.from('applications')
          .select('id, status, created_at, annonces!inner(title, author_name)')
          .eq('applicant_id', profile.id)
          .order('created_at', { ascending: false }).limit(5)
          .then(({ data }) => {
            for (const a of (data || []) as any[]) {
              const title  = a.annonces?.title      || 'annonce'
              const author = a.annonces?.author_name || 'un club'
              const dotColor: FeedItem['dotColor'] = a.status === 'accepted' ? 'green' : a.status === 'rejected' ? 'red' : 'blue'
              const text = a.status === 'accepted'
                ? <><strong>{author}</strong> a accepté ta candidature pour <strong>{title}</strong></>
                : a.status === 'rejected'
                ? <><strong>{author}</strong> a refusé ta candidature pour <strong>{title}</strong></>
                : <>Candidature envoyée à <strong>{author}</strong> pour <strong>{title}</strong></>
              feed.push({ id:`app_${a.id}`, dotColor, text, timestamp: a.created_at })
            }
          })
      )
    }

    ps.push(
      supabase.from('messages').select('id, created_at')
        .eq('receiver_id', profile.id).eq('read', false)
        .order('created_at', { ascending: false }).limit(3)
        .then(({ data }) => {
          for (const m of (data || [])) {
            feed.push({ id:`msg_${m.id}`, dotColor:'blue',
              text: 'Nouveau message reçu', timestamp: m.created_at })
          }
        })
    )

    Promise.all(ps).then(() => {
      feed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setItems(feed.slice(0, 5))
      setLoading(false)
    })
  }, [profile.id, profile.role, refreshKey])

  const emptyHint = profile.role === 'club'
    ? 'Publie ta première annonce pour commencer.'
    : 'Explore les annonces pour trouver ton prochain club.'

  return (
    <div className="db-section-card">
      <div className="db-section-head">
        <h2 className="db-section-title">Activité <span className="db-em">récente</span></h2>
      </div>
      {loading ? <Loading /> : items.length === 0 ? (
        <Empty icon={<IcoActivity s={28}/>} msg="Pas encore d'activité.">
          <span style={{ fontSize:13, color:'rgba(255,255,255,.4)' }}>{emptyHint}</span>
        </Empty>
      ) : (
        <div className="db-activity-list">
          {items.map(item => (
            <div key={item.id} className="db-activity-row">
              <div className={`db-activity-dot ${item.dotColor}`} />
              <div>
                <div className="db-activity-text">{item.text}</div>
                <div className="db-activity-time">{relativeTime(item.timestamp)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ======================================================
// PROFILE SIDEBAR
// ======================================================
function ProfileSidebar({ profile, onShowSettings, lang }: {
  profile: Profile; onShowSettings: () => void; lang: Lang
}) {
  const completion = computeCompletion(profile)
  const isClub = profile.role === 'club'
  const displayName = isClub
    ? (profile.club_name || profile.email)
    : `${profile.first_name||''} ${profile.last_name||''}`.trim() || profile.email
  const initials    = displayName.slice(0, 2).toUpperCase()
  const avatarGrad  = isClub
    ? 'linear-gradient(135deg,#1a3a8a 0%,#0d1f4a 100%)'
    : profile.role === 'coach'
    ? 'linear-gradient(135deg,#FF9A3A 0%,#c4651f 100%)'
    : 'linear-gradient(135deg,#FF3A3A 0%,#c41f1f 100%)'
  const roleLabel = isClub ? t.dash.role_club[lang] : profile.role === 'coach' ? t.dash.role_coach[lang] : t.dash.role_player[lang]

  const attrs = isClub
    ? [{ num: profile.ligue||'—', label:'Ligue' }, { num: profile.zone||'—', label:'Zone' }]
    : [{ num: profile.age ? `${profile.age}` : '—', label:'Âge' },
       { num: profile.height_cm ? `${profile.height_cm}cm` : (profile.position||'—'), label: profile.height_cm ? 'Taille' : 'Position' }]

  const infoRows = isClub
    ? [{ label:'Ligue', value: profile.ligue||'—' },
       { label:'Zone',  value: profile.zone||'—'  },
       { label:'Statut', value: profile.club_verification_status === 'approved' ? 'Vérifié' : 'Non vérifié' }]
    : profile.role === 'coach'
    ? [{ label:'Spécialité', value: profile.coach_specialty||'—' },
       { label:'Ligue',      value: profile.ligue||'—'            },
       { label:'Zone',       value: profile.zone||'—'             },
       { label:'Disponibilité', value: profile.available ? 'Disponible' : 'Non disponible' }]
    : [{ label:'Position',    value: profile.position||'—' },
       { label:'Ligue',       value: profile.ligue||'—'    },
       { label:'Zone',        value: profile.zone||'—'     },
       { label:'Disponibilité', value: profile.available ? 'Immédiate' : 'Non disponible' }]

  return (
    <div className="db-profile-card">
      {isClub
        ? <div style={{ margin:'0 auto 16px', display:'flex', justifyContent:'center' }}>
            <ClubCrest src={avatarSrc(profile.avatar_url)} size={96} fallback={initials} />
          </div>
        : <div className="db-profile-avatar" style={{ background: profile.avatar_url ? 'transparent' : avatarGrad }}>
            {profile.avatar_url
              ? <img src={avatarSrc(profile.avatar_url)!} alt=""
                  onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
              : <span className="db-profile-initials">{initials}</span>}
            <div className="db-online-dot" />
          </div>
      }
      <h3 className="db-profile-name">{displayName}</h3>
      <p className="db-profile-role">{roleLabel}{profile.position ? ` · ${profile.position}` : ''}</p>

      <div className="db-profile-attrs">
        {attrs.map((a, i) => (
          <div key={i} className="db-profile-attr">
            <div className="db-attr-num">{a.num}</div>
            <div className="db-attr-label">{a.label}</div>
          </div>
        ))}
      </div>

      <div className="db-profile-info">
        {infoRows.map((r, i) => (
          <div key={i} className="db-info-row">
            <span className="db-info-label">{r.label}</span>
            <span className="db-info-value">{r.value}</span>
          </div>
        ))}
      </div>

      <div className="db-completion">
        <div className="db-completion-head">
          <span>Profil complété</span>
          <span className="db-completion-pct">{completion}%</span>
        </div>
        <div className="db-completion-track">
          <div className="db-completion-fill" style={{ width:`${completion}%` }} />
        </div>
        {completion < 90 && (
          <p className="db-completion-hint">Complétez votre profil pour être mieux vu</p>
        )}
      </div>

      <div className="db-profile-actions">
        <Link href="/profil" className="db-btn-profile-edit">
          <IcoPencil s={14}/>{t.dash.see_profile[lang]}
        </Link>
        <button className="db-btn-settings-link" onClick={onShowSettings}>
          <IcoSettings s={14}/>Paramètres
        </button>
      </div>
    </div>
  )
}

// ======================================================
// SETTINGS WRAPPER
// ======================================================
function SettingsWrapper({ profile, onBack, onSaved, lang }: {
  profile: Profile; onBack: () => void; onSaved: (p: Profile) => void; lang: Lang
}) {
  return (
    <div className="db-settings-page">
      <div className="db-container" style={{ paddingTop:120, paddingBottom:80 }}>
        <button className="db-back-btn" onClick={onBack}>
          <IcoBack s={16}/>Retour au dashboard
        </button>
        <SettingsSection profile={profile} onSaved={onSaved} />
      </div>
      <style>{DB_CSS}</style>
    </div>
  )
}

// ======================================================
// SETTINGS SECTION (logic unchanged, restyled)
// ======================================================
function SettingsSection({ profile, onSaved }: { profile: Profile; onSaved: (p: Profile) => void }) {
  const { lang } = useLang()
  const [clubName, setClubName] = useState(profile.club_name || '')
  const [bio,      setBio]      = useState(profile.bio || '')
  const [ligue,    setLigue]    = useState(profile.ligue || '')
  const [zone,     setZone]     = useState(profile.zone || '')
  const [saving,   setSaving]   = useState(false)
  const [msg,      setMsg]      = useState('')

  const defaultNotif = { newMessage:true, newApplication:true, applicationStatus:true }
  const [notif,        setNotif]        = useState({ ...defaultNotif, ...(profile.notification_settings || {}) })
  const [savingNotif,  setSavingNotif]  = useState(false)
  const [notifMsg,     setNotifMsg]     = useState('')

  async function handleSave() {
    setSaving(true)
    const updates: Partial<Profile> = { bio, ligue, zone }
    if (profile.role === 'club') updates.club_name = clubName
    const { error } = await supabase.from('profiles').update(updates).eq('id', profile.id)
    setSaving(false)
    if (!error) { onSaved({ ...profile, ...updates }); setMsg(t.dash.saved_ok[lang]); setTimeout(() => setMsg(''), 3000) }
  }

  async function handleSaveNotif() {
    setSavingNotif(true)
    await supabase.from('profiles').update({ notification_settings: notif }).eq('id', profile.id)
    setSavingNotif(false)
    setNotifMsg(t.dash.notif_saved[lang])
    setTimeout(() => setNotifMsg(''), 3000)
  }

  const inp: React.CSSProperties = {
    width:'100%', background:'rgba(255,255,255,.04)',
    border:'1.5px solid rgba(255,255,255,.12)', color:'#fff',
    borderRadius:10, padding:'11px 14px', fontSize:14,
    outline:'none', fontFamily:'inherit', boxSizing:'border-box',
  }
  const lbl: React.CSSProperties = {
    display:'block', fontSize:11, fontWeight:600, textTransform:'uppercase',
    letterSpacing:1, color:'rgba(255,255,255,.55)', marginBottom:8,
  }
  const optSt = { background:'#0d1f4a' }
  const card: React.CSSProperties = {
    background:'linear-gradient(180deg,rgba(255,255,255,.04) 0%,rgba(255,255,255,.01) 100%)',
    border:'1px solid rgba(255,255,255,.12)', borderRadius:16, padding:'1.5rem',
  }

  return (
    <>
      <div style={{ marginBottom:'2rem' }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, color:'rgba(255,255,255,.35)', textTransform:'uppercase', marginBottom:4 }}>
          {t.dash.settings_title[lang]}
        </div>
        <div style={{ fontFamily:"'Russo One',sans-serif", fontSize:'2rem', letterSpacing:.5 }}>
          {t.dash.settings_profile_title[lang]}
        </div>
      </div>

      <div style={{ ...card, marginBottom:'1.5rem' }}>
        {msg && (
          <div style={{ background:'rgba(46,210,127,.12)', border:'1px solid rgba(46,210,127,.25)', color:'#2ED27F', borderRadius:10, padding:'10px 14px', fontSize:14, marginBottom:'1rem' }}>
            {msg}
          </div>
        )}
        {profile.role === 'club' && (
          <div style={{ marginBottom:'1rem' }}>
            <label style={lbl}>{t.dash.club_name[lang]}</label>
            <input style={inp} value={clubName} onChange={e => setClubName(e.target.value)} />
          </div>
        )}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
          <div>
            <label style={lbl}>{t.dash.ligue_req[lang].replace(' *','')}</label>
            <select style={inp} value={ligue} onChange={e => setLigue(e.target.value)}>
              <option value="" style={optSt}>—</option>
              {ligues.flatMap(g => g.items).map(l => <option key={l} value={l} style={optSt}>{l}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>{t.dash.zone_label[lang]}</label>
            <select style={inp} value={zone} onChange={e => setZone(e.target.value)}>
              <option value="" style={optSt}>—</option>
              {zones.map(z => <option key={z} value={z} style={optSt}>{z}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom:'1rem' }}>
          <label style={lbl}>{t.dash.bio_desc[lang]}</label>
          <textarea style={{ ...inp, resize:'vertical' }} rows={4} value={bio}
            onChange={e => setBio(e.target.value)} placeholder={t.dash.bio_ph[lang]} />
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={handleSave} disabled={saving} style={{
            background:'rgba(255,255,255,.06)', color:'rgba(255,255,255,.8)',
            border:'1px solid rgba(255,255,255,.15)', borderRadius:9, padding:'10px 22px',
            fontSize:13, fontWeight:600, cursor:saving?'not-allowed':'pointer',
            opacity:saving?.7:1, fontFamily:'inherit',
          }}>
            {saving ? t.dash.saving_btn[lang] : t.dash.save_btn[lang]}
          </button>
          <Link href="/profil" style={{
            display:'inline-flex', alignItems:'center', background:'transparent',
            color:'rgba(255,255,255,.45)', border:'1px solid rgba(255,255,255,.1)',
            borderRadius:9, padding:'10px 22px', fontSize:13, fontWeight:600, textDecoration:'none',
          }}>
            {t.dash.see_profile[lang]}
          </Link>
        </div>
      </div>

      <div>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, color:'rgba(255,255,255,.35)', textTransform:'uppercase', marginBottom:4 }}>
          {t.dash.settings_title[lang]}
        </div>
        <div style={{ fontFamily:"'Russo One',sans-serif", fontSize:'1.8rem', letterSpacing:.5, marginBottom:'.25rem' }}>
          {t.dash.notif_title[lang]}
        </div>
        <p style={{ color:'rgba(255,255,255,.4)', fontSize:13, marginBottom:'1rem' }}>{t.dash.notif_desc[lang]}</p>
        <div style={{ ...card, display:'flex', flexDirection:'column', gap:'.85rem' }}>
          {notifMsg && (
            <div style={{ background:'rgba(46,210,127,.12)', border:'1px solid rgba(46,210,127,.25)', color:'#2ED27F', borderRadius:10, padding:'9px 14px', fontSize:13 }}>
              {notifMsg}
            </div>
          )}
          {[
            { key:'newMessage',      label:t.dash.notif_new_message[lang],  desc:t.dash.notif_new_message_desc[lang]  },
            ...(profile.role === 'club' ? [{ key:'newApplication', label:t.dash.notif_new_app[lang], desc:t.dash.notif_new_app_desc[lang] }] : []),
            ...(profile.role !== 'club' ? [{ key:'applicationStatus', label:t.dash.notif_app_status[lang], desc:t.dash.notif_app_status_desc[lang] }] : []),
          ].map(({ key, label, desc }) => (
            <label key={key} style={{ display:'flex', alignItems:'flex-start', gap:12, cursor:'pointer' }}>
              <input
                type="checkbox"
                checked={notif[key as keyof typeof notif] !== false}
                onChange={e => setNotif(prev => ({ ...prev, [key]: e.target.checked }))}
                style={{ width:18, height:18, accentColor:'#FF3A3A', cursor:'pointer', marginTop:2, flexShrink:0 }}
              />
              <div>
                <div style={{ fontWeight:700, fontSize:14, color:'rgba(255,255,255,.85)', marginBottom:2 }}>{label}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,.4)' }}>{desc}</div>
              </div>
            </label>
          ))}
          <button onClick={handleSaveNotif} disabled={savingNotif} style={{
            alignSelf:'flex-start', background:'#FF3A3A', color:'#fff',
            border:'none', borderRadius:9, padding:'10px 22px', fontSize:13, fontWeight:700,
            cursor:savingNotif?'not-allowed':'pointer', opacity:savingNotif?.7:1, fontFamily:'inherit', marginTop:4,
          }}>
            {savingNotif ? t.dash.notif_saving[lang] : t.dash.notif_save[lang]}
          </button>
        </div>
      </div>
    </>
  )
}

// ======================================================
// STATUS BADGE
// ======================================================
function StatusBadge({ status }: { status: string }) {
  const { lang } = useLang()
  const cfg: Record<string, { bg:string; color:string; border:string; label:string }> = {
    pending:  { bg:'rgba(255,154,58,.12)', color:'#FF9A3A', border:'rgba(255,154,58,.3)', label: t.general.pending[lang]  },
    accepted: { bg:'rgba(46,210,127,.12)', color:'#2ED27F', border:'rgba(46,210,127,.3)', label: t.general.accepted[lang] },
    rejected: { bg:'rgba(255,58,58,.12)',  color:'#FF3A3A', border:'rgba(255,58,58,.3)',  label: t.general.rejected[lang] },
  }
  const m = cfg[status] || cfg.pending
  return (
    <span style={{
      background:m.bg, color:m.color, border:`1px solid ${m.border}`,
      borderRadius:999, padding:'4px 10px', fontSize:10,
      fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase',
      whiteSpace:'nowrap',
    }}>{m.label}</span>
  )
}

// ——— Shared micro-components ———————————————
function Loading() {
  return <div className="db-section-loading"><div className="db-mini-spinner"/></div>
}
function Empty({ icon, msg, children }: { icon: JSX.Element; msg: string; children?: React.ReactNode }) {
  return (
    <div className="db-section-empty">
      {icon}
      <p>{msg}</p>
      {children}
    </div>
  )
}

// ======================================================
// CSS
// ======================================================
const DB_CSS = `
@keyframes spin     { to { transform:rotate(360deg) } }
@keyframes dbFadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
@keyframes dbToast  { from{opacity:0;transform:translateX(12px)} to{opacity:1;transform:translateX(0)} }

.db-page {
  background:
    radial-gradient(ellipse at top,#1a2f6b 0%,transparent 60%),
    radial-gradient(ellipse at bottom,rgba(255,58,58,.04) 0%,transparent 60%),
    #0D1F4A;
  min-height:100vh; color:#fff;
  font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;
  -webkit-font-smoothing:antialiased;
}
.db-settings-page {
  background:radial-gradient(ellipse at top,#1a2f6b 0%,transparent 60%),#0D1F4A;
  min-height:100vh; color:#fff;
  font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;
  -webkit-font-smoothing:antialiased;
}
.db-container { max-width:1200px; margin:0 auto; padding:0 32px; }

/* Welcome */
.db-welcome { padding:120px 0 0; position:relative; }
.db-welcome::before {
  content:''; position:absolute; top:0; left:0; right:0; height:360px;
  background:radial-gradient(ellipse at 30% 50%,rgba(255,58,58,.08) 0%,transparent 50%);
  pointer-events:none;
}
.db-welcome .db-container { position:relative; z-index:1; }
.db-eyebrow {
  font-family:'Russo One',sans-serif; font-size:11px; letter-spacing:4px;
  color:#FF3A3A; text-transform:uppercase; margin-bottom:16px;
}
.db-welcome-head {
  display:flex; justify-content:space-between; align-items:flex-end;
  flex-wrap:wrap; gap:20px; margin-bottom:40px;
}
.db-welcome-title {
  font-family:'Russo One',sans-serif;
  font-size:clamp(32px,5vw,52px); line-height:1;
  letter-spacing:-.5px; text-transform:uppercase;
}
.db-em { color:#FF3A3A; }
.db-welcome-sub { font-size:15px; color:rgba(255,255,255,.6); margin-top:10px; font-weight:300; }
.db-welcome-actions { display:flex; gap:12px; flex-wrap:wrap; }
.db-btn-pri {
  background:#FF3A3A; color:#fff;
  padding:11px 20px; border-radius:10px;
  font-size:13px; font-weight:600; letter-spacing:.3px;
  display:inline-flex; align-items:center; gap:8px;
  border:none; cursor:pointer; font-family:inherit;
  transition:transform .3s,box-shadow .3s;
}
.db-btn-pri:hover { transform:translateY(-1px); box-shadow:0 10px 24px rgba(255,58,58,.4); }
.db-btn-sec {
  background:transparent; color:#fff;
  padding:11px 20px; border-radius:10px;
  border:1px solid rgba(255,255,255,.22);
  font-size:13px; font-weight:600;
  display:inline-flex; align-items:center; gap:8px;
  text-decoration:none;
  transition:border-color .3s,background .3s;
}
.db-btn-sec:hover { border-color:#fff; background:rgba(255,255,255,.04); }

/* Stats */
.db-stats-grid {
  display:grid; grid-template-columns:repeat(4,1fr);
  gap:16px; padding-bottom:40px;
}
.db-stat-card {
  background:linear-gradient(180deg,rgba(255,255,255,.04) 0%,rgba(255,255,255,.01) 100%);
  border:1px solid rgba(255,255,255,.12); border-radius:16px; padding:22px;
  transition:transform .4s cubic-bezier(.22,1,.36,1),border-color .4s;
}
.db-stat-card:hover { transform:translateY(-2px); border-color:rgba(255,255,255,.22); }
.db-stat-icon {
  width:40px; height:40px; border-radius:10px;
  display:flex; align-items:center; justify-content:center; margin-bottom:16px;
}
.db-stat-num { font-family:'Russo One',sans-serif; font-size:36px; line-height:1; margin-bottom:6px; }
.db-stat-label { font-size:11px; letter-spacing:1.5px; color:rgba(255,255,255,.55); text-transform:uppercase; }

/* Main grid */
.db-main-grid {
  display:grid; grid-template-columns:1fr 380px;
  gap:24px; padding:40px 0 80px; align-items:start;
}
.db-left { display:flex; flex-direction:column; gap:24px; }

/* Section card */
.db-section-card {
  background:linear-gradient(180deg,rgba(255,255,255,.04) 0%,rgba(255,255,255,.01) 100%);
  border:1px solid rgba(255,255,255,.12); border-radius:20px; padding:28px;
  animation:dbFadeIn .4s ease;
}
.db-section-head {
  display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;
}
.db-section-title { font-family:'Russo One',sans-serif; font-size:18px; letter-spacing:.3px; text-transform:uppercase; }
.db-section-link {
  font-size:12px; font-weight:600; color:#FF3A3A; letter-spacing:.5px; text-transform:uppercase;
  display:inline-flex; align-items:center; gap:6px;
  text-decoration:none; background:none; border:none; cursor:pointer; font-family:inherit;
  transition:gap .3s;
}
.db-section-link:hover { gap:10px; }
.db-section-loading { display:flex; justify-content:center; padding:32px 0; }
.db-mini-spinner {
  width:28px; height:28px; border:3px solid rgba(255,255,255,.1);
  border-top-color:#FF3A3A; border-radius:50%; animation:spin .8s linear infinite;
}
.db-section-empty {
  text-align:center; padding:28px 16px; color:rgba(255,255,255,.4); font-size:14px;
  display:flex; flex-direction:column; align-items:center; gap:10px;
}
.db-empty-link {
  display:inline-flex; align-items:center; gap:5px;
  font-size:13px; font-weight:600; color:#FF3A3A;
  text-decoration:none; background:none; border:none; cursor:pointer; font-family:inherit;
  transition:gap .3s;
}
.db-empty-link:hover { gap:8px; }

/* Recommended */
.db-recos-list { display:flex; flex-direction:column; gap:10px; }
.db-reco-row {
  display:grid; grid-template-columns:auto 1fr auto;
  gap:14px; align-items:center; padding:14px 16px;
  background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.1); border-radius:12px;
  text-decoration:none; color:inherit;
  transition:border-color .3s,transform .3s cubic-bezier(.22,1,.36,1);
}
.db-reco-row:hover { border-color:rgba(255,58,58,.4); transform:translateX(4px); }
.db-reco-club { font-size:11px; letter-spacing:1.5px; color:#FF3A3A; text-transform:uppercase; font-weight:600; margin-bottom:2px; }
.db-reco-title { font-weight:600; font-size:14px; margin-bottom:4px; }
.db-reco-meta { font-size:11px; color:rgba(255,255,255,.55); display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
.db-badge-new {
  font-size:10px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; white-space:nowrap;
  padding:4px 10px; border-radius:999px;
  background:rgba(46,210,127,.12); border:1px solid rgba(46,210,127,.3); color:#2ED27F;
}

/* Candidatures list */
.db-cands-list { display:flex; flex-direction:column; gap:10px; }
.db-cand-row {
  display:flex; align-items:center; gap:12px; padding:13px 16px;
  background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.1); border-radius:12px;
  transition:border-color .3s;
}
.db-cand-row:hover { border-color:rgba(255,255,255,.2); }
.db-cand-icon {
  width:36px; height:36px; border-radius:10px; flex-shrink:0;
  background:rgba(58,122,255,.12); border:1px solid rgba(58,122,255,.3); color:#3A7AFF;
  display:flex; align-items:center; justify-content:center;
}
.db-cand-avatar {
  width:36px; height:36px; border-radius:10px; flex-shrink:0;
  background:rgba(255,58,58,.1); border:1px solid rgba(255,58,58,.2); color:rgba(255,255,255,.5);
  display:flex; align-items:center; justify-content:center;
  text-decoration:none; transition:background .2s;
}
.db-cand-avatar:hover { background:rgba(255,58,58,.2); }
.db-cand-content { flex:1; min-width:0; }
.db-cand-name { font-weight:700; font-size:14px; color:#3A7AFF; text-decoration:none; display:block; }
.db-cand-name:hover { color:#fff; }
.db-cand-title { font-weight:500; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.db-cand-sub2 { color:rgba(255,255,255,.5); font-weight:400; }
.db-cand-date { font-size:11px; color:rgba(255,255,255,.5); margin-top:2px; }
.db-cand-btns { display:flex; gap:6px; flex-shrink:0; }
.db-btn-accept {
  display:inline-flex; align-items:center; gap:5px;
  font-size:11px; font-weight:600; color:#2ED27F;
  background:rgba(46,210,127,.08); border:1px solid rgba(46,210,127,.2);
  border-radius:7px; padding:5px 10px; cursor:pointer; font-family:inherit; white-space:nowrap;
  transition:background .2s;
}
.db-btn-accept:hover { background:rgba(46,210,127,.16); }
.db-btn-refuse {
  display:inline-flex; align-items:center; gap:5px;
  font-size:11px; font-weight:600; color:rgba(255,255,255,.45);
  background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1);
  border-radius:7px; padding:5px 10px; cursor:pointer; font-family:inherit; white-space:nowrap;
  transition:background .2s,color .2s,border-color .2s;
}
.db-btn-refuse:hover { background:rgba(255,58,58,.1); color:#FF3A3A; border-color:rgba(255,58,58,.25); }

/* Toast */
.db-toast {
  position:absolute; top:18px; right:18px; z-index:10;
  display:inline-flex; align-items:center; gap:8px;
  padding:9px 14px; border-radius:10px; font-size:13px; font-weight:600;
  animation:dbToast .2s ease; pointer-events:none;
}
.db-toast.ok  { background:rgba(46,210,127,.15); border:1px solid rgba(46,210,127,.3); color:#2ED27F; }
.db-toast.err { background:rgba(255,58,58,.12);  border:1px solid rgba(255,58,58,.3);  color:#FF3A3A; }

/* Annonces list */
.db-annonces-list { display:flex; flex-direction:column; gap:8px; }
.db-annonce-row {
  display:flex; align-items:center; gap:12px; padding:12px 16px;
  background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.1); border-radius:12px;
  transition:border-color .3s;
}
.db-annonce-row:hover { border-color:rgba(255,255,255,.2); }
.db-annonce-content { flex:1; min-width:0; }
.db-annonce-title { font-weight:600; font-size:14px; }
.db-annonce-meta { font-size:11px; color:rgba(255,255,255,.5); display:flex; gap:8px; margin-top:2px; }
.db-annonce-right { display:flex; align-items:center; gap:8px; flex-shrink:0; }
.db-annonce-status { font-size:10px; font-weight:700; letter-spacing:1px; text-transform:uppercase; padding:3px 9px; border-radius:999px; }
.db-annonce-status.active { background:rgba(46,210,127,.12); color:#2ED27F; border:1px solid rgba(46,210,127,.25); }
.db-annonce-status.closed { background:rgba(255,255,255,.06); color:rgba(255,255,255,.4); border:1px solid rgba(255,255,255,.1); }
.db-btn-close-ann {
  font-size:11px; font-weight:600; color:rgba(255,255,255,.5);
  background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1);
  border-radius:6px; padding:4px 10px; cursor:pointer; font-family:inherit;
  transition:background .2s,color .2s,border-color .2s;
}
.db-btn-close-ann:hover { background:rgba(255,58,58,.1); color:#FF3A3A; border-color:rgba(255,58,58,.2); }

/* Activity */
.db-activity-list { display:flex; flex-direction:column; }
.db-activity-row {
  display:flex; gap:14px; font-size:13px;
  padding:12px 0; border-bottom:1px solid rgba(255,255,255,.08);
}
.db-activity-row:last-child { border-bottom:0; padding-bottom:0; }
.db-activity-dot { width:8px; height:8px; border-radius:50%; background:#FF3A3A; margin-top:5px; flex-shrink:0; }
.db-activity-dot.green  { background:#2ED27F; }
.db-activity-dot.blue   { background:#3A7AFF; }
.db-activity-dot.orange { background:#FF9A3A; }
.db-activity-text { color:rgba(255,255,255,.85); line-height:1.5; }
.db-activity-text strong { color:#fff; font-weight:600; }
.db-activity-time { font-size:11px; color:rgba(255,255,255,.4); margin-top:3px; }

/* Profile sidebar */
.db-profile-card {
  background:linear-gradient(180deg,rgba(255,255,255,.05) 0%,rgba(255,255,255,.01) 100%);
  border:1px solid rgba(255,255,255,.12); border-radius:20px; padding:28px; text-align:center;
  position:sticky; top:84px;
}
.db-profile-avatar {
  width:96px; height:96px; border-radius:50%;
  margin:0 auto 16px; position:relative;
  display:flex; align-items:center; justify-content:center; overflow:hidden;
}
.db-profile-avatar img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
.db-profile-initials { font-family:'Russo One',sans-serif; font-size:30px; color:#fff; position:relative; z-index:1; }
.db-online-dot {
  position:absolute; bottom:6px; right:6px; width:16px; height:16px;
  border-radius:50%; background:#2ED27F; border:3px solid #0D1F4A;
}
.db-profile-name { font-family:'Russo One',sans-serif; font-size:20px; letter-spacing:.3px; margin-bottom:4px; }
.db-profile-role { font-size:11px; color:#FF3A3A; font-weight:600; letter-spacing:1px; text-transform:uppercase; margin-bottom:20px; }
.db-profile-attrs {
  display:grid; grid-template-columns:1fr 1fr;
  border-top:1px solid rgba(255,255,255,.1); border-bottom:1px solid rgba(255,255,255,.1);
  padding:14px 0; margin-bottom:18px;
}
.db-profile-attr { text-align:center; position:relative; }
.db-profile-attr:first-child::after {
  content:''; position:absolute; right:0; top:20%; bottom:20%; width:1px; background:rgba(255,255,255,.1);
}
.db-attr-num { font-family:'Russo One',sans-serif; font-size:20px; }
.db-attr-label { font-size:10px; letter-spacing:1.5px; color:rgba(255,255,255,.5); text-transform:uppercase; margin-top:4px; }
.db-profile-info { text-align:left; margin-bottom:18px; }
.db-info-row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid rgba(255,255,255,.08); font-size:13px; }
.db-info-row:last-child { border-bottom:0; }
.db-info-label { color:rgba(255,255,255,.5); }
.db-info-value { color:#fff; font-weight:500; }

/* Completion */
.db-completion { text-align:left; margin-bottom:18px; }
.db-completion-head { display:flex; justify-content:space-between; font-size:11px; letter-spacing:1px; color:rgba(255,255,255,.5); text-transform:uppercase; margin-bottom:8px; }
.db-completion-pct { font-family:'Russo One',sans-serif; color:#2ED27F; font-size:13px; }
.db-completion-track { height:6px; background:rgba(255,255,255,.06); border-radius:999px; overflow:hidden; }
.db-completion-fill { height:100%; background:linear-gradient(90deg,#FF3A3A 0%,#2ED27F 100%); border-radius:999px; transition:width 1s cubic-bezier(.22,1,.36,1); }
.db-completion-hint { font-size:11px; color:rgba(255,255,255,.4); margin-top:6px; line-height:1.4; }
.db-profile-actions { display:flex; flex-direction:column; gap:8px; }
.db-btn-profile-edit {
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  padding:11px 20px; border-radius:10px;
  background:rgba(255,255,255,.06); color:rgba(255,255,255,.8);
  border:1px solid rgba(255,255,255,.15); font-size:13px; font-weight:600;
  text-decoration:none; transition:background .2s,border-color .2s;
}
.db-btn-profile-edit:hover { background:rgba(255,255,255,.1); border-color:rgba(255,255,255,.25); }
.db-btn-settings-link {
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  padding:11px 20px; border-radius:10px;
  background:transparent; color:rgba(255,255,255,.5);
  border:1px solid rgba(255,255,255,.1); font-size:13px; font-weight:600;
  cursor:pointer; font-family:inherit; transition:background .2s,color .2s;
}
.db-btn-settings-link:hover { background:rgba(255,255,255,.05); color:rgba(255,255,255,.8); }

/* Settings back */
.db-back-btn {
  display:inline-flex; align-items:center; gap:8px;
  font-size:14px; font-weight:600; color:rgba(255,255,255,.6);
  background:none; border:none; cursor:pointer; font-family:inherit;
  margin-bottom:32px; padding:0; transition:color .2s;
}
.db-back-btn:hover { color:#fff; }

/* Responsive */
@media(max-width:1100px) {
  .db-main-grid { grid-template-columns:1fr; }
  .db-profile-card { position:static; }
}
@media(max-width:900px) { .db-stats-grid { grid-template-columns:repeat(2,1fr); } }
@media(max-width:600px) {
  .db-container { padding:0 16px; }
  .db-welcome { padding-top:96px; }
  .db-welcome-head { flex-direction:column; align-items:flex-start; }
  .db-stats-grid { grid-template-columns:repeat(2,1fr); gap:10px; }
  .db-section-card { padding:20px 16px; }
  .db-cand-btns { flex-direction:column; }
}
`
