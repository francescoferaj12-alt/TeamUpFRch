'use client'

import { footballLabel } from '../lib/football-labels'
import { useState } from 'react'
import SeasonStats from './SeasonStats'
import type { Profile } from '../lib/supabase'
import ClubCrest from './ClubCrest'
import { CareerExperience } from '../lib/supabase'
import { t } from '../lib/translations'
import type { Lang } from '../lib/translations'

const Svg = ({ children, size = 18, color = 'currentColor', ...p }: any) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    {children}
  </svg>
)
const IcoClipboard = ({ s = 32 }: { s?: number }) => <Svg size={s} strokeWidth="1.8"><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M9 2H6a2 2 0 0 0-2 2v17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-3"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="15" y2="14"/></Svg>
const IcoPen       = ({ s = 12 }: { s?: number }) => <Svg size={s}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></Svg>
const IcoTrash     = ({ s = 12 }: { s?: number }) => <Svg size={s}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></Svg>

type Props = {
  experiences: CareerExperience[]
  role: 'player' | 'coach'
  lang: Lang
  canEdit?: boolean
  seasonProfile?: Profile
  onEditStats?: () => void
  onAdd?: () => void
  onEdit?: (exp: CareerExperience) => void
  onDelete?: (id: string) => void
}

function formatDate(date: string | undefined, lang: Lang): string {
  if (!date) return ''
  const d = new Date(date + 'T00:00:00')
  return d.toLocaleDateString(lang === 'fr' ? 'fr-CH' : 'de-CH', { month: 'long', year: 'numeric' })
}

function initials(name: string): string {
  return name.split(/\s+/).map(w => w[0] || '').join('').toUpperCase().slice(0, 3)
}

export default function CareerSection({ experiences, role, lang, canEdit, onAdd, onEdit, onDelete, seasonProfile, onEditStats }: Props) {
  const [filter, setFilter] = useState<'all' | 'current' | 'past'>('all')
  const tc = t.career_section

  const sorted = [...experiences].sort((a, b) => {
    if (a.is_current && !b.is_current) return -1
    if (!a.is_current && b.is_current) return 1
    return (b.start_date || '').localeCompare(a.start_date || '')
  })

  const filtered = sorted.filter(exp => {
    if (filter === 'current') return exp.is_current
    if (filter === 'past') return !exp.is_current
    return true
  })

  const hasStats = (exp: CareerExperience) =>
    exp.matches != null || exp.goals != null || exp.assists != null || exp.wins != null || exp.win_rate != null

  return (
    <div className="career-section">
      <div className="career-header">
        <div>
          <div className="section-label">{tc.label[lang]}</div>
          <div style={{ fontFamily:"'Russo One', sans-serif", fontSize:'1.4rem', letterSpacing:1, color:'#fff' }}>
            {role === 'player' && seasonProfile ? (lang === 'de' ? 'Werdegang & Statistiken' : 'Parcours & statistiques') : tc.title[lang]}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
          <div className="career-filters">
            {(['all','current','past'] as const).map(f => (
              <button key={f} type="button" aria-pressed={filter === f} className={`career-tab${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'all' ? tc.tab_all[lang] : f === 'current' ? tc.tab_current[lang] : tc.tab_past[lang]}
              </button>
            ))}
          </div>
          {canEdit && onAdd && (
            <button onClick={onAdd}
              style={{ background:'#FF3A3A', color:'#fff', border:'none', borderRadius:8, padding:'7px 14px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>
              {tc.add_exp[lang]}
            </button>
          )}
        </div>
      </div>

      {role === 'player' && seasonProfile && <SeasonStats profile={seasonProfile} lang={lang} onEdit={canEdit ? onEditStats : undefined} />}

      {role === 'player' && seasonProfile && <p className="career-stations-label">{lang === 'de' ? 'Vereine & Stationen' : 'Clubs & expériences'}</p>}
      {filtered.length === 0 && experiences.length === 0 ? (
        <div className="career-empty">
          <div className="career-empty-icon"><IcoClipboard s={32} /></div>
          <p>{canEdit ? tc.empty_text[lang] : lang === 'de' ? 'Noch kein Werdegang angegeben.' : 'Parcours non renseigné pour le moment.'}</p>
          {canEdit && onAdd && (
            <button onClick={onAdd}
              style={{ background:'#FF3A3A', color:'#fff', border:'none', borderRadius:10, padding:'10px 24px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
              {tc.add_exp[lang]}
            </button>
          )}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'1.5rem', color:'rgba(255,255,255,.4)', fontSize:13 }}>
          {lang === 'de' ? 'Keine Einträge für diesen Filter.' : 'Aucun résultat pour ce filtre.'}
        </div>
      ) : (
        <div className="timeline-vertical">
          {filtered.map(exp => (
            <div key={exp.id} className={`career-card${exp.is_current ? ' current' : ''}`}>
              <div className="career-dot" />

              <div className="career-card-head">
                <ClubCrest src={exp.club_logo_url} alt={exp.club_name} size={46} fallback={initials(exp.club_name)} />

                <div className="career-club-info">
                  <div className="career-club-name">
                    {exp.club_name}
                    {exp.league && <> · <span className="career-league">{footballLabel(exp.league, lang)}</span></>}
                  </div>
                  <div className="career-dates">
                    {formatDate(exp.start_date, lang)} — {exp.is_current ? tc.present[lang] : formatDate(exp.end_date, lang)}
                  </div>
                </div>

                {exp.is_current && (
                  <span className="career-badge-current">
                    <span className="career-badge-dot" />
                    {tc.badge_cur[lang]}
                  </span>
                )}
              </div>

              {(role === 'player' ? exp.position : footballLabel(exp.coach_role!, lang)) && (
                <div className="career-role-pill">
                  {role === 'player'
                    ? `${footballLabel(exp.position!, lang)}${exp.jersey_number ? ` · #${exp.jersey_number}` : ''}`
                    : footballLabel(exp.coach_role!, lang)
                  }
                </div>
              )}

              {hasStats(exp) && (
                <div className="career-stats">
                  {role === 'player' ? (
                    <>
                      {exp.matches != null && <div className="career-stat"><span className="v">{exp.matches}</span><span className="l">{tc.matches[lang]}</span></div>}
                      {exp.goals   != null && <div className="career-stat"><span className="v">{exp.goals}</span><span className="l">{tc.goals[lang]}</span></div>}
                      {exp.assists != null && <div className="career-stat"><span className="v">{exp.assists}</span><span className="l">{tc.assists[lang]}</span></div>}
                    </>
                  ) : (
                    <>
                      {exp.matches  != null && <div className="career-stat"><span className="v">{exp.matches}</span><span className="l">{tc.matches[lang]}</span></div>}
                      {exp.wins     != null && <div className="career-stat"><span className="v">{exp.wins}</span><span className="l">{tc.wins[lang]}</span></div>}
                      {exp.win_rate != null && <div className="career-stat"><span className="v">{exp.win_rate}%</span><span className="l">{tc.win_rate[lang]}</span></div>}
                    </>
                  )}
                </div>
              )}

              {exp.description && <p className="career-description">{exp.description}</p>}

              {canEdit && (onEdit || onDelete) && (
                <div className="career-card-actions">
                  {onEdit && (
                    <button onClick={() => onEdit(exp)}
                      style={{ background:'rgba(58,140,255,.15)', color:'#3a8cff', border:'1px solid rgba(58,140,255,.3)', borderRadius:7, padding:'4px 12px', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap:5 }}>
                      <IcoPen s={11} /> {lang === 'de' ? 'Bearbeiten' : 'Modifier'}
                    </button>
                  )}
                  {onDelete && (
                    <button onClick={() => { if (confirm(tc.delete_confirm[lang])) onDelete(exp.id) }}
                      style={{ background:'rgba(255,58,58,.12)', color:'#FF3A3A', border:'1px solid rgba(255,58,58,.3)', borderRadius:7, padding:'4px 12px', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap:5 }}>
                      <IcoTrash s={11} /> {lang === 'de' ? 'Löschen' : 'Supprimer'}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
