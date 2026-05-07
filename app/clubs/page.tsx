'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase, Profile } from '../../lib/supabase'
import { useLang } from '../../lib/lang-context'

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterZone, setFilterZone] = useState('')
  const { lang } = useLang()

  const ZONES = ['Fribourg-Ville','Gruyère','Broye','Glâne','Sensebezirk','Veveyse','Lac']

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'club')
        .order('created_at', { ascending: false })
      if (data) setClubs(data)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = clubs.filter(c => {
    if (filterZone && c.zone !== filterZone) return false
    if (search) {
      const q = search.toLowerCase()
      if (!(c.club_name || '').toLowerCase().includes(q) && !(c.zone || '').toLowerCase().includes(q)) return false
    }
    return true
  })

  return (
    <>
      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg, #063a1a, #0d7a36)', padding: '4rem 2rem 3rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: .05, backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='15' fill='none' stroke='%23fff' stroke-width='1'/%3E%3C/svg%3E")` }} />
        <div style={{ position: 'relative', maxWidth: 700, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 100, padding: '6px 18px', marginBottom: '1.25rem' }}>
            <span>🏟️</span>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'rgba(255,255,255,.85)', textTransform: 'uppercase' }}>
              {lang === 'fr' ? 'Annuaire officiel' : 'Offizielles Verzeichnis'}
            </span>
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2.5rem, 7vw, 5rem)', color: '#fff', letterSpacing: 2, lineHeight: 1, marginBottom: '.75rem' }}>
            {lang === 'fr' ? 'Les clubs de Fribourg' : 'Freiburger Vereine'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 16, marginBottom: '1.5rem' }}>
            {lang === 'fr'
              ? 'Tous les clubs inscrits sur TeamUpFR — rejoins-les ou contacte-les directement.'
              : 'Alle bei TeamUpFR eingetragenen Vereine — tritt ihnen bei oder kontaktiere sie direkt.'}
          </p>

          {/* Search */}
          <div style={{ display: 'flex', gap: 8, maxWidth: 500, margin: '0 auto' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={lang === 'fr' ? 'Rechercher un club…' : 'Verein suchen…'}
              style={{ flex: 1, background: 'rgba(255,255,255,.95)', border: 'none', borderRadius: 10, padding: '12px 16px', fontSize: 15, outline: 'none', fontFamily: 'inherit' }}
            />
            <select
              value={filterZone}
              onChange={e => setFilterZone(e.target.value)}
              style={{ background: 'rgba(255,255,255,.95)', border: 'none', borderRadius: 10, padding: '12px 14px', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
            >
              <option value="">{lang === 'fr' ? 'Toutes les zones' : 'Alle Zonen'}</option>
              {ZONES.map(z => <option key={z}>{z}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* CLUBS GRID */}
      <section style={{ background: 'var(--gray-bg)', padding: '3rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: '1.25rem', fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>
            {filtered.length} {lang === 'fr' ? `club${filtered.length > 1 ? 's' : ''} inscrit${filtered.length > 1 ? 's' : ''}` : `eingetragene${filtered.length > 1 ? ' Vereine' : 'r Verein'}`}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              <div style={{ width: 36, height: 36, border: '4px solid var(--gray-light)', borderTopColor: 'var(--green)', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 1rem' }} />
              {lang === 'fr' ? 'Chargement des clubs…' : 'Vereine werden geladen…'}
              <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: 20, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏟️</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', letterSpacing: 1, marginBottom: '.5rem' }}>
                {lang === 'fr' ? 'Aucun club trouvé' : 'Kein Verein gefunden'}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: '1.5rem' }}>
                {lang === 'fr' ? 'Sois le premier club de ta zone !' : 'Sei der erste Verein in deiner Zone!'}
              </p>
              <Link href="/login" style={{ background: 'var(--green)', color: '#fff', padding: '12px 28px', borderRadius: 10, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>
                {lang === 'fr' ? 'Inscrire mon club →' : 'Meinen Verein registrieren →'}
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {filtered.map(club => (
                <div key={club.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
                  {/* Banner */}
                  <div style={{ background: 'linear-gradient(135deg, #063a1a, #0d7a36)', padding: '1.5rem', textAlign: 'center', position: 'relative' }}>
                    <div style={{ width: 64, height: 64, borderRadius: 14, background: 'rgba(255,255,255,.15)', border: '2px solid rgba(255,255,255,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto .75rem' }}>
                      {club.avatar_url
                        ? <img src={club.avatar_url} alt={club.club_name || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
                        : '🏟️'
                      }
                    </div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', color: '#fff', letterSpacing: 1 }}>
                      {club.club_name || 'Club'}
                    </div>
                    {club.available && (
                      <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(13,122,54,.5)', border: '1px solid rgba(13,122,54,.6)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100 }}>
                        🟢 {lang === 'fr' ? 'Recrute' : 'Rekrutiert'}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1rem' }}>
                      {club.ligue && <span style={{ background: 'var(--blue-light)', color: 'var(--blue-mid)', fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 100 }}>{club.ligue}</span>}
                      {club.zone && <span style={{ background: 'var(--green-bg)', color: 'var(--green)', fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 100 }}>{club.zone}</span>}
                    </div>

                    {club.bio && (
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {club.bio}
                      </p>
                    )}

                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link href={`/club/${club.id}`} style={{ flex: 1, background: 'var(--green)', color: '#fff', borderRadius: 8, padding: '8px', fontSize: 13, fontWeight: 700, textAlign: 'center', textDecoration: 'none' }}>
                        {lang === 'fr' ? 'Voir le club' : 'Verein ansehen'}
                      </Link>
                      <Link href="/messages" style={{ background: 'var(--gray-light)', color: 'var(--text-muted)', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                        💬
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
