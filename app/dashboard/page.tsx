'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, Profile, Annonce, Application, avatarSrc } from '../../lib/supabase'
import { ligues, zones, positions } from '../../lib/data'
import { useLang } from '../../lib/lang-context'
import { t } from '../../lib/translations'
import { useAuth } from '../../lib/auth-context'

type Section = 'vue' | 'candidatures' | 'annonces' | 'messages' | 'settings'
type AppWithAnnonce = Application & { annonce_title?: string }

export default function DashboardPage() {
  const { lang } = useLang()
  const [section, setSection] = useState<Section>('vue')
  const router = useRouter()
  const { session, profile: authProfile, authLoading } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(authProfile)
  const [loading, setLoading] = useState(!authProfile)

  useEffect(() => {
    if (authLoading) return
    if (!session) { router.push('/login'); return }
    if (authProfile) { setProfile(authProfile); setLoading(false) }
  }, [authLoading, session, authProfile, router])

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', flexDirection:'column', gap:'1rem', background:'#030a24' }}>
      <div style={{ width:40, height:40, border:'4px solid rgba(255,255,255,.1)', borderTopColor:'#e63946', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  if (!profile) return null

  const displayName = profile.role === 'club' ? profile.club_name : `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email
  const roleLabel = profile.role === 'club' ? t.dash.role_club[lang] : profile.role === 'coach' ? t.dash.role_coach[lang] : t.dash.role_player[lang]

  return (
    <div className="dash-grid">
      {/* SIDEBAR */}
      <aside className="dash-sidebar">
        <div className="dash-club-badge">
          <div style={{ fontSize: '2rem', marginBottom: '.4rem' }}>
            {profile.role === 'club' ? '🏟️' : profile.role === 'coach' ? '🧑‍🏫' : '⚽'}
          </div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: 1, color: '#fff' }}>
            {displayName}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>{profile.ligue || ''} · {roleLabel}</div>
        </div>

        <SidebarSection label={t.dash.principal[lang]} />
        <SidebarLink icon="📊" label={t.dash.overview_link[lang]} active={section === 'vue'} onClick={() => setSection('vue')} />
        {(profile.role === 'club' || profile.role === 'coach') && (
          <SidebarLink icon="📋" label={t.dash.received_apps_link[lang]} active={section === 'candidatures'} onClick={() => setSection('candidatures')} />
        )}

        <SidebarSection label={t.dash.content[lang]} />
        <SidebarLink icon="📢" label={t.dash.my_annonces_link[lang]} active={section === 'annonces'} onClick={() => setSection('annonces')} />
        <SidebarLink icon="💬" label={t.dash.messages_link[lang]} active={section === 'messages'} onClick={() => setSection('messages')} />

        <SidebarSection label={t.dash.settings_section[lang]} />
        <SidebarLink icon="⚙️" label={t.dash.settings_link[lang]} active={section === 'settings'} onClick={() => setSection('settings')} />
      </aside>

      {/* MAIN */}
      <div className="dash-main">
        {section === 'vue' && <VueSection profile={profile} onPublish={() => setSection('annonces')} />}
        {section === 'candidatures' && <CandidaturesSection profile={profile} />}
        {section === 'annonces' && <AnnoncesSection profile={profile} />}
        {section === 'messages' && <MessagesSection />}
        {section === 'settings' && <SettingsSection profile={profile} onSaved={setProfile} />}
      </div>

      <style>{`
        .dash-grid { display: grid; grid-template-columns: 240px 1fr; min-height: calc(100vh - 60px - 100px); }
        @media (max-width: 700px) { .dash-grid { grid-template-columns: 1fr; } }
        .dash-sidebar { background: #061540; border-right: 1px solid rgba(255,255,255,.06); padding: 1.25rem; display: flex; flex-direction: column; gap: 4px; }
        .dash-club-badge { background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1); border-radius: 12px; padding: .85rem; margin-bottom: 1rem; text-align: center; }
        .dash-main { padding: 1.5rem; overflow-y: auto; background: #030a24; color: #fff; }
        .dash-card { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); border-radius: 14px; padding: 1.25rem; }
        @keyframes spin{to{transform:rotate(360deg);}}
      `}</style>
    </div>
  )
}

function SidebarSection({ label }: { label: string }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: 2, padding: '.75rem .5rem .3rem', marginTop: '.5rem' }}>
      {label}
    </div>
  )
}

function SidebarLink({ icon, label, active, onClick, badge }: { icon: string; label: string; active: boolean; onClick: () => void; badge?: number }) {
  return (
    <button onClick={onClick} style={{ display:'flex', alignItems:'center', gap:10, padding:'.65rem .85rem', borderRadius:9, color: active ? '#fff' : 'rgba(255,255,255,.55)', fontSize:14, fontWeight:500, cursor:'pointer', border: active ? '1px solid rgba(230,57,70,.3)' : '1px solid transparent', background: active ? 'rgba(230,57,70,.12)' : 'transparent', textAlign:'left', width:'100%', fontFamily:'inherit' }}>
      <span style={{ width:30, height:30, borderRadius:7, background:'rgba(255,255,255,.07)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, flexShrink:0 }}>{icon}</span>
      <span style={{ flex:1 }}>{label}</span>
      {badge !== undefined && (
        <span style={{ background:'#e63946', color:'#fff', borderRadius:100, fontSize:10, padding:'1px 7px', fontWeight:700 }}>{badge}</span>
      )}
    </button>
  )
}

function VueSection({ profile, onPublish }: { profile: Profile; onPublish: () => void }) {
  const { lang } = useLang()
  const [annonces, setAnnonces] = useState<Annonce[]>([])
  const [apps, setApps] = useState<AppWithAnnonce[]>([])
  const [avatarMap, setAvatarMap] = useState<Record<string, string | null>>({})

  useEffect(() => {
    supabase.from('annonces').select('*').eq('author_id', profile.id).order('created_at', { ascending: false })
      .then(({ data }) => setAnnonces(data || []))

    if (profile.role === 'club' || profile.role === 'coach') {
      supabase.from('applications')
        .select('*, annonces!inner(title, author_id)')
        .eq('annonces.author_id', profile.id)
        .eq('status', 'pending')
        .limit(3)
        .then(({ data }) => {
          const mapped = (data || []).map((a: Application & { annonces: { title: string } }) => ({
            ...a,
            annonce_title: a.annonces?.title
          }))
          setApps(mapped)
          if (mapped.length > 0) {
            const ids = [...new Set(mapped.map(a => a.applicant_id))]
            supabase.from('profiles').select('id,avatar_url').in('id', ids)
              .then(({ data: pdata }) => {
                const map: Record<string, string | null> = {}
                for (const p of (pdata || [])) map[p.id] = p.avatar_url || null
                setAvatarMap(map)
              })
          }
        })
    }
  }, [profile.id, profile.role])

  const darkCard = { background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:14, padding:'1.25rem' }

  return (
    <>
      <div style={{ marginBottom:'1.25rem', display:'flex', justifyContent:'space-between', alignItems:'flex-end', gap:'1rem', flexWrap:'wrap' }}>
        <div>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, color:'rgba(255,255,255,.35)', textTransform:'uppercase', marginBottom:4 }}>{t.dash.dashboard_label[lang]}</div>
          <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'2rem', letterSpacing:1 }}>{t.dash.overview_title[lang]}</div>
        </div>
        <button onClick={onPublish}
          style={{ background:'#e63946', color:'#fff', border:'none', borderRadius:10, padding:'10px 20px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>
          + {t.dash.publish_new[lang]}
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
        <KPI value={String(annonces.length)} label={t.dash.kpi_published[lang]} color="#5b9eff" />
        <KPI value={String(apps.length)} label={t.dash.kpi_pending[lang]} color="#e63946" />
        <KPI value={String(annonces.filter(a => a.status === 'active').length)} label={t.dash.kpi_active[lang]} color="#4cdb7a" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem' }}>
        <div style={darkCard}>
          <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.1rem', letterSpacing:1, marginBottom:'1rem' }}>{t.dash.last_annonces[lang]}</div>
          {annonces.length === 0 ? (
            <p style={{ color:'rgba(255,255,255,.4)', fontSize:14 }}>
              {t.dash.no_annonce[lang]} <button onClick={onPublish} style={{ color:'#5b9eff', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>{t.dash.publish_link[lang]}</button>
            </p>
          ) : annonces.slice(0, 3).map((a) => (
            <div key={a.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'.65rem 0', borderBottom:'1px solid rgba(255,255,255,.06)' }}>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:14 }}>{a.title}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,.4)' }}>{a.ligue} · {new Date(a.created_at).toLocaleDateString(lang === 'fr' ? 'fr-CH' : 'de-CH')}</div>
              </div>
              <span style={{ background: a.status === 'active' ? 'rgba(13,122,54,.2)' : 'rgba(255,255,255,.07)', color: a.status === 'active' ? '#4cdb7a' : 'rgba(255,255,255,.4)', borderRadius:100, padding:'2px 9px', fontSize:11, fontWeight:600 }}>{a.status === 'active' ? t.dash.annonce_active[lang] : t.dash.annonce_closed[lang]}</span>
            </div>
          ))}
        </div>

        <div style={darkCard}>
          <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.1rem', letterSpacing:1, marginBottom:'1rem' }}>{t.dash.pending_apps_title[lang]}</div>
          {apps.length === 0 ? (
            <p style={{ color:'rgba(255,255,255,.4)', fontSize:14 }}>{t.dash.no_apps[lang]}</p>
          ) : apps.map((a) => (
            <div key={a.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'.65rem 0', borderBottom:'1px solid rgba(255,255,255,.06)' }}>
              <Link href={`/profil/${a.applicant_id}`} style={{ width:36, height:36, borderRadius:9, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, textDecoration:'none', background: avatarMap[a.applicant_id] ? 'transparent' : 'rgba(26,111,212,.2)', fontSize:16 }}>
                {avatarMap[a.applicant_id]
                  ? <img src={avatarSrc(avatarMap[a.applicant_id])!} alt="" style={{ width:36, height:36, objectFit:'cover' }} onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
                  : '👤'
                }
              </Link>
              <div style={{ flex:1 }}>
                <Link href={`/profil/${a.applicant_id}`} style={{ fontWeight:600, fontSize:14, color:'#7eb6ff', textDecoration:'none' }}>{a.applicant_name}</Link>
                <div style={{ fontSize:12, color:'rgba(255,255,255,.4)' }}>{a.annonce_title}</div>
              </div>
            </div>
          ))}
          {apps.length > 0 && (
            <Link href="/candidatures" style={{ display:'block', marginTop:'.75rem', background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', color:'rgba(255,255,255,.7)', borderRadius:9, padding:'9px', fontSize:13, fontWeight:600, textAlign:'center', textDecoration:'none' }}>
              {t.dash.see_all_apps[lang]}
            </Link>
          )}
        </div>
      </div>
    </>
  )
}

function CandidaturesSection({ profile }: { profile: Profile }) {
  const { lang } = useLang()
  const [apps, setApps] = useState<AppWithAnnonce[]>([])
  const [loading, setLoading] = useState(true)
  const [avatarMap, setAvatarMap] = useState<Record<string, string | null>>({})

  useEffect(() => {
    supabase.from('applications')
      .select('*, annonces!inner(title, author_id)')
      .eq('annonces.author_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const mapped = (data || []).map((a: Application & { annonces: { title: string } }) => ({
          ...a,
          annonce_title: a.annonces?.title
        }))
        setApps(mapped)
        setLoading(false)
        if (mapped.length > 0) {
          const ids = [...new Set(mapped.map(a => a.applicant_id))]
          supabase.from('profiles').select('id,avatar_url').in('id', ids)
            .then(({ data: pdata }) => {
              const map: Record<string, string | null> = {}
              for (const p of (pdata || [])) map[p.id] = p.avatar_url || null
              setAvatarMap(map)
            })
        }
      })
  }, [profile.id])

  async function updateStatus(id: string, status: 'accepted' | 'rejected') {
    console.log('🟢 [DASH/STATUS] updateStatus called:', id, status)
    setApps((prev) => prev.map((a) => a.id === id ? { ...a, status } : a))
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
      const json = await res.json()
      console.log('🟢 [DASH/STATUS] API response:', res.status, json)
      if (!res.ok) {
        setApps((prev) => prev.map((a) => a.id === id ? { ...a, status: 'pending' } : a))
      }
    } catch (e) {
      console.error('🔴 [DASH/STATUS] Network error:', e)
      setApps((prev) => prev.map((a) => a.id === id ? { ...a, status: 'pending' } : a))
    }
  }

  const darkCard = { background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:14, padding:'1.25rem' }

  return (
    <>
      <div style={{ marginBottom:'1.25rem' }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, color:'rgba(255,255,255,.35)', textTransform:'uppercase' as const, marginBottom:4 }}>{t.dash.management[lang]}</div>
        <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'2rem', letterSpacing:1 }}>{t.dash.received_title[lang]}</div>
      </div>
      {loading ? <div style={{ color:'rgba(255,255,255,.4)' }}>{t.dash.loading[lang]}</div> : apps.length === 0 ? (
        <div style={{ ...darkCard, textAlign:'center', padding:'3rem', color:'rgba(255,255,255,.4)' }}>
          {t.dash.no_received[lang]}
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'.85rem' }}>
          {apps.map((a) => (
            <div key={a.id} style={darkCard}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'.5rem', marginBottom:'.75rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <Link href={`/profil/${a.applicant_id}`} style={{ width:40, height:40, borderRadius:10, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, textDecoration:'none', background: avatarMap[a.applicant_id] ? 'transparent' : 'rgba(26,111,212,.2)', fontSize:18 }}>
                    {avatarMap[a.applicant_id]
                      ? <img src={avatarSrc(avatarMap[a.applicant_id])!} alt="" style={{ width:40, height:40, objectFit:'cover' }} onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
                      : '👤'
                    }
                  </Link>
                  <div>
                    <Link href={`/profil/${a.applicant_id}`} style={{ fontWeight:700, fontSize:15, color:'#7eb6ff', textDecoration:'none' }}>{a.applicant_name}</Link>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,.4)' }}>
                      {t.dash.for_annonce[lang]} {a.annonce_title} · {new Date(a.created_at).toLocaleDateString(lang === 'fr' ? 'fr-CH' : 'de-CH')}
                    </div>
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </div>
              <div style={{ background:'rgba(255,255,255,.05)', borderRadius:8, padding:'.65rem .85rem', fontSize:13, fontStyle:'italic', marginBottom:'.75rem', lineHeight:1.55, color:'rgba(255,255,255,.6)' }}>
                &ldquo;{a.message}&rdquo;
              </div>
              {a.status === 'pending' && (
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => updateStatus(a.id, 'accepted')} style={{ background:'rgba(13,122,54,.2)', color:'#4cdb7a', border:'1px solid rgba(76,219,122,.25)', borderRadius:8, padding:'6px 14px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>{t.dash.accept[lang]}</button>
                  <button onClick={() => updateStatus(a.id, 'rejected')} style={{ background:'rgba(230,57,70,.15)', color:'#ff6b6b', border:'1px solid rgba(230,57,70,.25)', borderRadius:8, padding:'6px 14px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>{t.dash.refuse[lang]}</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function AnnoncesSection({ profile }: { profile: Profile }) {
  const { lang } = useLang()
  const [myAnnonces, setMyAnnonces] = useState<Annonce[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [form, setForm] = useState({ title: '', body: '', ligue: '', position: '', zone: profile.zone || '' })
  const [publishing, setPublishing] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('annonces').select('*').eq('author_id', profile.id).order('created_at', { ascending: false })
      .then(({ data }) => { setMyAnnonces(data || []); setLoadingList(false) })
  }, [profile.id])

  async function handlePublish() {
    if (!form.body.trim()) {
      setError(t.dash.error_required[lang])
      return
    }
    setPublishing(true)
    setError('')
    const authorName = profile.role === 'club' ? profile.club_name : `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email
    const { data, error: err } = await supabase.from('annonces').insert({
      author_id: profile.id,
      author_name: authorName,
      author_type: profile.role,
      title: form.title.trim(),
      body: form.body.trim(),
      ligue: form.ligue,
      position: form.position || null,
      zone: form.zone || profile.zone || '',
      status: 'active'
    }).select().single()

    setPublishing(false)
    if (err) { setError(t.dash.error_publish[lang]); return }
    setMyAnnonces((prev) => [data, ...prev])
    setForm({ title: '', body: '', ligue: '', position: '', zone: profile.zone || '' })
    setSuccessMsg(t.dash.published_ok[lang])
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  async function closeAnnonce(id: string) {
    await supabase.from('annonces').update({ status: 'closed' }).eq('id', id)
    setMyAnnonces((prev) => prev.map((a) => a.id === id ? { ...a, status: 'closed' } : a))
  }

  const optSt = { background:'#061540' }
  const inpSt: React.CSSProperties = { width:'100%', background:'rgba(255,255,255,.07)', border:'1.5px solid rgba(255,255,255,.12)', color:'#fff', borderRadius:9, padding:'10px 14px', fontSize:14, outline:'none', fontFamily:'inherit' }
  const lblSt: React.CSSProperties = { display:'block', fontSize:13, fontWeight:600, color:'rgba(255,255,255,.55)', marginBottom:6 }
  const darkCard: React.CSSProperties = { background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:14, padding:'1.25rem' }

  return (
    <>
      <div style={{ marginBottom:'1.25rem' }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, color:'rgba(255,255,255,.35)', textTransform:'uppercase', marginBottom:4 }}>{t.dash.content[lang]}</div>
        <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'2rem', letterSpacing:1 }}>{t.dash.annonces_title[lang]}</div>
      </div>

      {/* FORM */}
      <div style={{ ...darkCard, marginBottom:'1.5rem' }}>
        <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.3rem', letterSpacing:1, marginBottom:'1rem' }}>{t.dash.publish_new[lang]}</div>

        {successMsg && (
          <div style={{ background:'rgba(13,122,54,.15)', border:'1px solid rgba(76,219,122,.25)', borderRadius:10, padding:'10px 14px', fontSize:14, color:'#4cdb7a', marginBottom:'1rem' }}>
            {successMsg}
          </div>
        )}
        {error && (
          <div style={{ background:'rgba(230,57,70,.12)', border:'1px solid rgba(230,57,70,.3)', borderRadius:10, padding:'10px 14px', fontSize:14, color:'#ff6b6b', marginBottom:'1rem' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom:'1rem' }}>
          <label style={lblSt}>{t.dash.annonce_title_label[lang]}</label>
          <input style={inpSt} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t.dash.annonce_title_ph[lang]} />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
          <div>
            <label style={lblSt}>{t.dash.ligue_req[lang]}</label>
            <select style={inpSt} value={form.ligue} onChange={(e) => setForm({ ...form, ligue: e.target.value })}>
              <option value="" style={optSt}>{t.dash.select[lang]}</option>
              {ligues.flatMap((g) => g.items).map((l) => <option key={l} value={l} style={optSt}>{l}</option>)}
            </select>
          </div>
          <div>
            <label style={lblSt}>{t.dash.pos_sought[lang]}</label>
            <select style={inpSt} value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}>
              <option value="" style={optSt}>{t.dash.none[lang]}</option>
              {positions.map((p) => <option key={p} value={p} style={optSt}>{p}</option>)}
            </select>
          </div>
          <div>
            <label style={lblSt}>{t.dash.zone_label[lang]}</label>
            <select style={inpSt} value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })}>
              <option value="" style={optSt}>{t.dash.select[lang]}</option>
              {zones.map((z) => <option key={z} value={z} style={optSt}>{z}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom:'1rem' }}>
          <label style={lblSt}>{t.dash.desc_req[lang]}</label>
          <textarea style={{ ...inpSt, resize:'vertical' }} rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder={t.dash.desc_ph[lang]} />
        </div>

        <button onClick={handlePublish} disabled={publishing} style={{ background:'#e63946', color:'#fff', border:'none', borderRadius:9, padding:'11px 22px', fontSize:14, fontWeight:700, cursor:'pointer', opacity: publishing ? .7 : 1, fontFamily:'inherit' }}>
          {publishing ? t.dash.publishing[lang] : t.dash.publish_btn[lang]}
        </button>
      </div>

      {/* MY ANNONCES LIST */}
      <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.2rem', letterSpacing:1, marginBottom:'.75rem' }}>
        {t.dash.published_count[lang]} ({myAnnonces.length})
      </div>
      {loadingList ? <div style={{ color:'rgba(255,255,255,.4)', fontSize:14 }}>{t.dash.loading[lang]}</div> : myAnnonces.length === 0 ? (
        <div style={{ color:'rgba(255,255,255,.4)', fontSize:14 }}>{t.dash.no_annonces[lang]}</div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'.6rem' }}>
          {myAnnonces.map((a) => (
            <div key={a.id} style={{ background:'rgba(255,255,255,.04)', borderRadius:12, border:'1px solid rgba(255,255,255,.08)', padding:'1rem 1.25rem', display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:14 }}>{a.title}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,.4)' }}>{a.ligue}{a.position ? ` · ${a.position}` : ''} · {new Date(a.created_at).toLocaleDateString(lang === 'fr' ? 'fr-CH' : 'de-CH')}</div>
              </div>
              <span style={{ background: a.status === 'active' ? 'rgba(13,122,54,.2)' : 'rgba(255,255,255,.07)', color: a.status === 'active' ? '#4cdb7a' : 'rgba(255,255,255,.4)', borderRadius:100, padding:'2px 9px', fontSize:11, fontWeight:600 }}>{a.status === 'active' ? t.dash.annonce_active[lang] : t.dash.annonce_closed[lang]}</span>
              {a.status === 'active' && (
                <button onClick={() => closeAnnonce(a.id)} style={{ background:'rgba(255,255,255,.07)', color:'rgba(255,255,255,.6)', border:'1px solid rgba(255,255,255,.1)', borderRadius:8, padding:'5px 12px', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>{t.dash.close_btn[lang]}</button>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function MessagesSection() {
  const { lang } = useLang()
  return (
    <div style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:14, padding:'1.25rem' }}>
      <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.5rem', letterSpacing:1, marginBottom:'1rem' }}>{t.dash.msgs_section_title[lang]}</div>
      <p style={{ color:'rgba(255,255,255,.45)', marginBottom:'1rem', fontSize:14 }}>{t.dash.msgs_section_desc[lang]}</p>
      <Link href="/messages" style={{ display:'inline-flex', background:'rgba(255,255,255,.07)', color:'rgba(255,255,255,.7)', border:'1px solid rgba(255,255,255,.1)', borderRadius:9, padding:'9px 20px', fontSize:13, fontWeight:600, textDecoration:'none' }}>{t.dash.open_msgs[lang]}</Link>
    </div>
  )
}

function SettingsSection({ profile, onSaved }: { profile: Profile; onSaved: (p: Profile) => void }) {
  const { lang } = useLang()
  const [clubName, setClubName] = useState(profile.club_name || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [ligue, setLigue] = useState(profile.ligue || '')
  const [zone, setZone] = useState(profile.zone || '')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const defaultNotif = { newMessage: true, newApplication: true, applicationStatus: true }
  const [notif, setNotif] = useState({ ...defaultNotif, ...(profile.notification_settings || {}) })
  const [savingNotif, setSavingNotif] = useState(false)
  const [notifMsg, setNotifMsg] = useState('')

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

  const optSt = { background:'#061540' }
  const inpSt: React.CSSProperties = { width:'100%', background:'rgba(255,255,255,.07)', border:'1.5px solid rgba(255,255,255,.12)', color:'#fff', borderRadius:9, padding:'10px 14px', fontSize:14, outline:'none', fontFamily:'inherit' }
  const lblSt: React.CSSProperties = { display:'block', fontSize:13, fontWeight:600, color:'rgba(255,255,255,.55)', marginBottom:6 }

  return (
    <>
      <div style={{ marginBottom:'1.25rem' }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, color:'rgba(255,255,255,.35)', textTransform:'uppercase' as const, marginBottom:4 }}>{t.dash.settings_title[lang]}</div>
        <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'2rem', letterSpacing:1 }}>{t.dash.settings_profile_title[lang]}</div>
      </div>
      <div style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:14, padding:'1.25rem' }}>
        {msg && <div style={{ background:'rgba(13,122,54,.15)', border:'1px solid rgba(76,219,122,.25)', color:'#4cdb7a', borderRadius:10, padding:'10px 14px', fontSize:14, marginBottom:'1rem' }}>{msg}</div>}
        {profile.role === 'club' && (
          <div style={{ marginBottom:'1rem' }}>
            <label style={lblSt}>{t.dash.club_name[lang]}</label>
            <input style={inpSt} value={clubName} onChange={(e) => setClubName(e.target.value)} />
          </div>
        )}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
          <div>
            <label style={lblSt}>{t.dash.ligue_req[lang].replace(' *','')}</label>
            <select style={inpSt} value={ligue} onChange={(e) => setLigue(e.target.value)}>
              <option value="" style={optSt}>—</option>
              {ligues.flatMap((g) => g.items).map((l) => <option key={l} value={l} style={optSt}>{l}</option>)}
            </select>
          </div>
          <div>
            <label style={lblSt}>{t.dash.zone_label[lang]}</label>
            <select style={inpSt} value={zone} onChange={(e) => setZone(e.target.value)}>
              <option value="" style={optSt}>—</option>
              {zones.map((z) => <option key={z} value={z} style={optSt}>{z}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom:'1rem' }}>
          <label style={lblSt}>{t.dash.bio_desc[lang]}</label>
          <textarea style={{ ...inpSt, resize:'vertical' }} rows={4} value={bio} onChange={(e) => setBio(e.target.value)} placeholder={t.dash.bio_ph[lang]} />
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={handleSave} disabled={saving} style={{ background:'rgba(255,255,255,.07)', color:'rgba(255,255,255,.7)', border:'1px solid rgba(255,255,255,.1)', borderRadius:9, padding:'9px 20px', fontSize:13, fontWeight:600, cursor:'pointer', opacity: saving ? .7 : 1, fontFamily:'inherit' }}>
            {saving ? t.dash.saving_btn[lang] : t.dash.save_btn[lang]}
          </button>
          <Link href="/profil" style={{ display:'inline-flex', background:'transparent', color:'rgba(255,255,255,.5)', border:'1px solid rgba(255,255,255,.1)', borderRadius:9, padding:'9px 20px', fontSize:13, fontWeight:600, textDecoration:'none', alignItems:'center' }}>{t.dash.see_profile[lang]}</Link>
        </div>
      </div>

      {/* Notification settings */}
      <div style={{ marginTop:'1.5rem' }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, color:'rgba(255,255,255,.35)', textTransform:'uppercase' as const, marginBottom:4 }}>{t.dash.settings_title[lang]}</div>
        <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.8rem', letterSpacing:1, marginBottom:'.25rem' }}>{t.dash.notif_title[lang]}</div>
        <p style={{ color:'rgba(255,255,255,.4)', fontSize:13, marginBottom:'1rem' }}>{t.dash.notif_desc[lang]}</p>
        <div style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:14, padding:'1.25rem', display:'flex', flexDirection:'column' as const, gap:'.85rem' }}>
          {notifMsg && <div style={{ background:'rgba(13,122,54,.15)', border:'1px solid rgba(76,219,122,.25)', color:'#4cdb7a', borderRadius:10, padding:'9px 14px', fontSize:13 }}>{notifMsg}</div>}
          {[
            { key:'newMessage', label:t.dash.notif_new_message[lang], desc:t.dash.notif_new_message_desc[lang] },
            ...(profile.role === 'club' ? [{ key:'newApplication', label:t.dash.notif_new_app[lang], desc:t.dash.notif_new_app_desc[lang] }] : []),
            ...(profile.role !== 'club' ? [{ key:'applicationStatus', label:t.dash.notif_app_status[lang], desc:t.dash.notif_app_status_desc[lang] }] : []),
          ].map(({ key, label, desc }) => (
            <label key={key} style={{ display:'flex', alignItems:'flex-start', gap:12, cursor:'pointer' }}>
              <div style={{ position:'relative' as const, flexShrink:0, marginTop:2 }}>
                <input
                  type="checkbox"
                  checked={notif[key as keyof typeof notif] !== false}
                  onChange={e => setNotif(prev => ({ ...prev, [key]: e.target.checked }))}
                  style={{ width:18, height:18, accentColor:'#e63946', cursor:'pointer' }}
                />
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:14, color:'rgba(255,255,255,.85)', marginBottom:2 }}>{label}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,.4)' }}>{desc}</div>
              </div>
            </label>
          ))}
          <button onClick={handleSaveNotif} disabled={savingNotif} style={{ alignSelf:'flex-start', background:'#e63946', color:'#fff', border:'none', borderRadius:9, padding:'9px 20px', fontSize:13, fontWeight:700, cursor:savingNotif ? 'not-allowed' : 'pointer', opacity:savingNotif ? .7 : 1, fontFamily:'inherit', marginTop:4 }}>
            {savingNotif ? t.dash.notif_saving[lang] : t.dash.notif_save[lang]}
          </button>
        </div>
      </div>
    </>
  )
}

function KPI({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div style={{ background:'rgba(255,255,255,.04)', borderRadius:14, border:'1px solid rgba(255,255,255,.08)', padding:'1.25rem' }}>
      <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'2.5rem', color, lineHeight:1, marginBottom:'.25rem' }}>{value}</div>
      <div style={{ fontSize:12, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.8px' }}>{label}</div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const { lang } = useLang()
  const map: Record<string, { bg: string; color: string; label: string }> = {
    pending: { bg:'rgba(255,171,0,.15)', color:'#ffab00', label:`⏳ ${t.general.pending[lang]}` },
    accepted: { bg:'rgba(13,122,54,.2)', color:'#4cdb7a', label:`✅ ${t.general.accepted[lang]}` },
    rejected: { bg:'rgba(230,57,70,.15)', color:'#ff6b6b', label:`❌ ${t.general.rejected[lang]}` },
  }
  const m = map[status] || map.pending
  return <span style={{ background:m.bg, color:m.color, borderRadius:100, padding:'3px 9px', fontSize:11, fontWeight:600 }}>{m.label}</span>
}
