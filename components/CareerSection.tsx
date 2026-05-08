'use client'

import { useState } from 'react'
import { CareerExperience } from '../lib/supabase'
import { t } from '../lib/translations'
import type { Lang } from '../lib/translations'

type Props = {
  experiences: CareerExperience[]
  role: 'player' | 'coach'
  lang: Lang
  canEdit?: boolean
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

export default function CareerSection({ experiences, role, lang, canEdit, onAdd, onEdit, onDelete }: Props) {
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
          <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.4rem', letterSpacing:1, color:'#fff' }}>
            {tc.title[lang]}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
          <div className="career-filters">
            {(['all','current','past'] as const).map(f => (
              <button key={f} className={`career-tab${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'all' ? tc.tab_all[lang] : f === 'current' ? tc.tab_current[lang] : tc.tab_past[lang]}
              </button>
            ))}
          </div>
          {canEdit && onAdd && (
            <button onClick={onAdd}
              style={{ background:'#e63946', color:'#fff', border:'none', borderRadius:8, padding:'7px 14px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>
              {tc.add_exp[lang]}
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 && experiences.length === 0 ? (
        <div className="career-empty">
          <div className="career-empty-icon">📋</div>
          <p>{tc.empty_text[lang]}</p>
          {canEdit && onAdd && (
            <button onClick={onAdd}
              style={{ background:'#e63946', color:'#fff', border:'none', borderRadius:10, padding:'10px 24px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
              {tc.add_exp[lang]}
            </button>
          )}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'1.5rem', color:'rgba(255,255,255,.4)', fontSize:13 }}>
          Aucun résultat pour ce filtre.
        </div>
      ) : (
        <div className="timeline-vertical">
          {filtered.map(exp => (
            <div key={exp.id} className={`career-card${exp.is_current ? ' current' : ''}`}>
              <div className="career-dot" />

              <div className="career-card-head">
                <div className="career-shield">
                  {exp.club_logo_url
                    ? <img src={exp.club_logo_url} alt={exp.club_name} />
                    : initials(exp.club_name)
                  }
                </div>

                <div className="career-club-info">
                  <div className="career-club-name">
                    {exp.club_name}
                    {exp.league && <> · <span className="career-league">{exp.league}</span></>}
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

              {(role === 'player' ? exp.position : exp.coach_role) && (
                <div className="career-role-pill">
                  {role === 'player'
                    ? `${exp.position}${exp.jersey_number ? ` · #${exp.jersey_number}` : ''}`
                    : exp.coach_role
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
                      style={{ background:'rgba(58,140,255,.15)', color:'#3a8cff', border:'1px solid rgba(58,140,255,.3)', borderRadius:7, padding:'4px 12px', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                      ✏️ Modifier
                    </button>
                  )}
                  {onDelete && (
                    <button onClick={() => { if (confirm(tc.delete_confirm[lang])) onDelete(exp.id) }}
                      style={{ background:'rgba(230,57,70,.12)', color:'#e63946', border:'1px solid rgba(230,57,70,.3)', borderRadius:7, padding:'4px 12px', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                      🗑️ Supprimer
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
