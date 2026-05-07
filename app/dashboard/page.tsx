'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, Profile, Annonce, Application } from '../../lib/supabase'
import { ligues, zones, positions } from '../../lib/data'

type Section = 'vue' | 'candidatures' | 'annonces' | 'messages' | 'settings'

type AppWithAnnonce = Application & { annonce_title?: string }

export default function DashboardPage() {
  const [section, setSection] = useState<Section>('vue')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      if (!data) { router.push('/login'); return }
      setProfile(data)
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: 40, height: 40, border: '4px solid var(--gray-light)', borderTopColor: 'var(--blue-bright)', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  if (!profile) return null

  const displayName = profile.role === 'club' ? profile.club_name : `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email
  const roleLabel = profile.role === 'club' ? 'Club · Admin' : profile.role === 'coach' ? 'Coach' : 'Joueur'

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

        <SidebarSection label="Principal" />
        <SidebarLink icon="📊" label="Vue d'ensemble" active={section === 'vue'} onClick={() => setSection('vue')} />
        {(profile.role === 'club' || profile.role === 'coach') && (
          <SidebarLink icon="📋" label="Candidatures reçues" active={section === 'candidatures'} onClick={() => setSection('candidatures')} />
        )}

        <SidebarSection label="Contenu" />
        <SidebarLink icon="📢" label="Mes annonces" active={section === 'annonces'} onClick={() => setSection('annonces')} />
        <SidebarLink icon="💬" label="Messages" active={section === 'messages'} onClick={() => setSection('messages')} />

        <SidebarSection label="Paramètres" />
        <SidebarLink icon="⚙️" label="Réglages profil" active={section === 'settings'} onClick={() => setSection('settings')} />
      </aside>

      {/* MAIN */}
      <div className="dash-main">
        {section === 'vue' && <VueSection profile={profile} />}
        {section === 'candidatures' && <CandidaturesSection profile={profile} />}
        {section === 'annonces' && <AnnoncesSection profile={profile} />}
        {section === 'messages' && <MessagesSection />}
        {section === 'settings' && <SettingsSection profile={profile} onSaved={setProfile} />}
      </div>

      <style>{`
        .dash-grid { display: grid; grid-template-columns: 240px 1fr; min-height: calc(100vh - 60px - 100px); }
        @media (max-width: 700px) { .dash-grid { grid-template-columns: 1fr; } }
        .dash-sidebar { background: var(--blue-dark); padding: 1.25rem; display: flex; flex-direction: column; gap: 4px; }
        .dash-club-badge { background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.15); border-radius: 12px; padding: .85rem; margin-bottom: 1rem; text-align: center; }
        .dash-main { padding: 1.5rem; overflow-y: auto; background: var(--gray-bg); }
      `}</style>
    </div>
  )
}

/* ── SIDEBAR COMPONENTS ── */

function SidebarSection({ label }: { label: string }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: 2, padding: '.75rem .5rem .3rem', marginTop: '.5rem' }}>
      {label}
    </div>
  )
}

function SidebarLink({ icon, label, active, onClick, badge }: { icon: string; label: string; active: boolean; onClick: () => void; badge?: number }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '.65rem .85rem', borderRadius: 9, color: active ? '#fff' : 'rgba(255,255,255,.65)', fontSize: 14, fontWeight: 500, cursor: 'pointer', border: 'none', background: active ? 'rgba(255,255,255,.15)' : 'transparent', textAlign: 'left', width: '100%', fontFamily: 'inherit' }}>
      <span style={{ width: 30, height: 30, borderRadius: 7, background: 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge !== undefined && (
        <span style={{ background: 'var(--red)', color: '#fff', borderRadius: 100, fontSize: 10, padding: '1px 7px', fontWeight: 700 }}>{badge}</span>
      )}
    </button>
  )
}

/* ── SECTIONS ── */

function VueSection({ profile }: { profile: Profile }) {
  const [annonces, setAnnonces] = useState<Annonce[]>([])
  const [apps, setApps] = useState<AppWithAnnonce[]>([])

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
        })
    }
  }, [profile.id, profile.role])

  return (
    <>
      <div style={{ marginBottom: '1.25rem' }}>
        <div className="section-label">Dashboard</div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: 1 }}>Vue d'ensemble</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <KPI value={String(annonces.length)} label="Annonces publiées" color="var(--blue-mid)" />
        <KPI value={String(apps.length)} label="Candidatures en attente" color="var(--red)" />
        <KPI value={String(annonces.filter(a => a.status === 'active').length)} label="Annonces actives" color="var(--green)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div className="card">
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: 1, marginBottom: '1rem' }}>📢 Mes dernières annonces</div>
          {annonces.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Aucune annonce publiée. <button onClick={() => {}} style={{ color: 'var(--blue-bright)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Publier →</button></p>
          ) : annonces.slice(0, 3).map((a) => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '.65rem 0', borderBottom: '1px solid var(--gray-light)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{a.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.ligue} · {new Date(a.created_at).toLocaleDateString('fr-CH')}</div>
              </div>
              <span className={`badge ${a.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{a.status === 'active' ? 'Active' : 'Fermée'}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: 1, marginBottom: '1rem' }}>📋 Candidatures en attente</div>
          {apps.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Aucune candidature en attente.</p>
          ) : apps.map((a) => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '.65rem 0', borderBottom: '1px solid var(--gray-light)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>👤</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{a.applicant_name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.annonce_title}</div>
              </div>
            </div>
          ))}
          {apps.length > 0 && (
            <Link href="/candidatures" className="btn btn-blue btn-full" style={{ marginTop: '.75rem', justifyContent: 'center' }}>
              Voir toutes les candidatures →
            </Link>
          )}
        </div>
      </div>
    </>
  )
}

function CandidaturesSection({ profile }: { profile: Profile }) {
  const [apps, setApps] = useState<AppWithAnnonce[]>([])
  const [loading, setLoading] = useState(true)

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
      })
  }, [profile.id])

  async function updateStatus(id: string, status: 'accepted' | 'rejected') {
    await supabase.from('applications').update({ status }).eq('id', id)
    setApps((prev) => prev.map((a) => a.id === id ? { ...a, status } : a))
  }

  return (
    <>
      <div style={{ marginBottom: '1.25rem' }}>
        <div className="section-label">Gestion</div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: 1 }}>Candidatures reçues</div>
      </div>
      {loading ? <div style={{ color: 'var(--text-muted)' }}>Chargement…</div> : apps.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Aucune candidature reçue pour l'instant.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
          {apps.map((a) => (
            <div key={a.id} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '.5rem', marginBottom: '.75rem' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{a.applicant_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Pour : {a.annonce_title} · {new Date(a.created_at).toLocaleDateString('fr-CH')}
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </div>
              <div style={{ background: 'var(--gray-bg)', borderRadius: 8, padding: '.65rem .85rem', fontSize: 13, fontStyle: 'italic', marginBottom: '.75rem', lineHeight: 1.55 }}>
                "{a.message}"
              </div>
              {a.status === 'pending' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => updateStatus(a.id, 'accepted')} className="btn btn-green btn-sm">✅ Accepter</button>
                  <button onClick={() => updateStatus(a.id, 'rejected')} className="btn btn-red btn-sm">❌ Refuser</button>
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
    if (!form.title.trim() || !form.body.trim() || !form.ligue) {
      setError('Titre, description et ligue sont obligatoires.')
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
    if (err) { setError('Erreur lors de la publication.'); return }
    setMyAnnonces((prev) => [data, ...prev])
    setForm({ title: '', body: '', ligue: '', position: '', zone: profile.zone || '' })
    setSuccessMsg('✅ Annonce publiée avec succès !')
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  async function closeAnnonce(id: string) {
    await supabase.from('annonces').update({ status: 'closed' }).eq('id', id)
    setMyAnnonces((prev) => prev.map((a) => a.id === id ? { ...a, status: 'closed' } : a))
  }

  return (
    <>
      <div style={{ marginBottom: '1.25rem' }}>
        <div className="section-label">Contenu</div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: 1 }}>Mes annonces</div>
      </div>

      {/* FORM */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', letterSpacing: 1, marginBottom: '1rem' }}>📢 Publier une nouvelle annonce</div>

        {successMsg && (
          <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green)', borderRadius: 10, padding: '10px 14px', fontSize: 14, color: 'var(--green)', marginBottom: '1rem' }}>
            {successMsg}
          </div>
        )}
        {error && (
          <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red)', borderRadius: 10, padding: '10px 14px', fontSize: 14, color: 'var(--red)', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <div className="field">
          <label className="field-label">Titre de l'annonce *</label>
          <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Recherche attaquant 3ème Ligue…" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="field">
            <label className="field-label">Ligue *</label>
            <select className="input" value={form.ligue} onChange={(e) => setForm({ ...form, ligue: e.target.value })}>
              <option value="">— Sélectionner —</option>
              {ligues.flatMap((g) => g.items).map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="field-label">Position recherchée</label>
            <select className="input" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}>
              <option value="">— Aucune —</option>
              {positions.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="field-label">Zone</label>
            <select className="input" value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })}>
              <option value="">— Sélectionner —</option>
              {zones.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>
        </div>

        <div className="field">
          <label className="field-label">Description *</label>
          <textarea className="input" rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Décris le profil recherché, les conditions, les contacts…" />
        </div>

        <button onClick={handlePublish} disabled={publishing} className="btn btn-red" style={{ opacity: publishing ? .7 : 1 }}>
          {publishing ? '⏳ Publication…' : '📢 Publier l\'annonce'}
        </button>
      </div>

      {/* MY ANNONCES LIST */}
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', letterSpacing: 1, marginBottom: '.75rem' }}>
        Annonces publiées ({myAnnonces.length})
      </div>
      {loadingList ? <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Chargement…</div> : myAnnonces.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Aucune annonce publiée.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
          {myAnnonces.map((a) => (
            <div key={a.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{a.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.ligue}{a.position ? ` · ${a.position}` : ''} · {new Date(a.created_at).toLocaleDateString('fr-CH')}</div>
              </div>
              <span className={`badge ${a.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{a.status === 'active' ? '🟢 Active' : '⚪ Fermée'}</span>
              {a.status === 'active' && (
                <button onClick={() => closeAnnonce(a.id)} className="btn btn-ghost btn-sm">Fermer</button>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function MessagesSection() {
  return (
    <div className="card">
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', letterSpacing: 1, marginBottom: '1rem' }}>💬 Messages</div>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: 14 }}>Gérer tes conversations dans la messagerie.</p>
      <Link href="/messages" className="btn btn-blue">Ouvrir la messagerie →</Link>
    </div>
  )
}

function SettingsSection({ profile, onSaved }: { profile: Profile; onSaved: (p: Profile) => void }) {
  const [clubName, setClubName] = useState(profile.club_name || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [ligue, setLigue] = useState(profile.ligue || '')
  const [zone, setZone] = useState(profile.zone || '')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  async function handleSave() {
    setSaving(true)
    const updates: Partial<Profile> = { bio, ligue, zone }
    if (profile.role === 'club') updates.club_name = clubName
    const { error } = await supabase.from('profiles').update(updates).eq('id', profile.id)
    setSaving(false)
    if (!error) { onSaved({ ...profile, ...updates }); setMsg('✅ Modifications enregistrées !'); setTimeout(() => setMsg(''), 3000) }
  }

  return (
    <>
      <div style={{ marginBottom: '1.25rem' }}>
        <div className="section-label">Paramètres</div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: 1 }}>Réglages du profil</div>
      </div>
      <div className="card">
        {msg && <div style={{ background: 'var(--green-bg)', color: 'var(--green)', borderRadius: 10, padding: '10px 14px', fontSize: 14, marginBottom: '1rem' }}>{msg}</div>}
        {profile.role === 'club' && (
          <div className="field">
            <label className="field-label">Nom du club</label>
            <input className="input" value={clubName} onChange={(e) => setClubName(e.target.value)} />
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="field">
            <label className="field-label">Ligue</label>
            <select className="input" value={ligue} onChange={(e) => setLigue(e.target.value)}>
              <option value="">—</option>
              {ligues.flatMap((g) => g.items).map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="field-label">Zone</label>
            <select className="input" value={zone} onChange={(e) => setZone(e.target.value)}>
              <option value="">—</option>
              {zones.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>
        </div>
        <div className="field">
          <label className="field-label">Bio / Description</label>
          <textarea className="input" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Présentation, philosophie, contact…" />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSave} disabled={saving} className="btn btn-blue" style={{ opacity: saving ? .7 : 1 }}>
            {saving ? '⏳ Sauvegarde…' : '💾 Enregistrer'}
          </button>
          <Link href="/profil" className="btn btn-ghost">Voir mon profil complet</Link>
        </div>
      </div>
    </>
  )
}

function KPI({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', padding: '1.25rem' }}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', color, lineHeight: 1, marginBottom: '.25rem' }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.8px' }}>{label}</div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    pending: { cls: 'badge-amber', label: '⏳ En attente' },
    accepted: { cls: 'badge-green', label: '✅ Acceptée' },
    rejected: { cls: 'badge-red', label: '❌ Refusée' }
  }
  const m = map[status] || map.pending
  return <span className={`badge ${m.cls}`}>{m.label}</span>
}
