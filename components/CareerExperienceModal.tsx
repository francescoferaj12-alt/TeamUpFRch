'use client'

import { useState, useEffect } from 'react'
import { supabase, CareerExperience } from '../lib/supabase'
import { t } from '../lib/translations'
import type { Lang } from '../lib/translations'

const POSITIONS = ['Attaquant','Milieu offensif','Milieu défensif','Défenseur central','Défenseur latéral','Gardien']
const COACH_ROLES = ['Entraîneur principal','Entraîneur adjoint','Préparateur physique','Entraîneur des gardiens','Responsable technique']
const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const MONTHS_DE = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']

type Props = {
  userId: string
  role: 'player' | 'coach'
  lang: Lang
  experience?: CareerExperience | null
  onClose: () => void
  onSaved: (exp: CareerExperience) => void
  onDeleted?: (id: string) => void
}

export default function CareerExperienceModal({ userId, role, lang, experience, onClose, onSaved, onDeleted }: Props) {
  const tc = t.career_section
  const inpSt: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,.07)', border: '1.5px solid rgba(255,255,255,.12)',
    color: '#fff', borderRadius: 9, padding: '10px 14px', fontSize: 14, outline: 'none', fontFamily: 'inherit'
  }
  const lblSt: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.55)', marginBottom: 5 }
  const optSt = { background: '#061540' }
  const MONTHS = lang === 'fr' ? MONTHS_FR : MONTHS_DE
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 40 }, (_, i) => currentYear - i)

  const [clubName, setClubName] = useState('')
  const [clubLogoUrl, setClubLogoUrl] = useState('')
  const [league, setLeague] = useState('')
  const [position, setPosition] = useState('')
  const [jerseyNumber, setJerseyNumber] = useState('')
  const [coachRole, setCoachRole] = useState('')
  const [startMonth, setStartMonth] = useState('')
  const [startYear, setStartYear] = useState(String(currentYear))
  const [endMonth, setEndMonth] = useState('')
  const [endYear, setEndYear] = useState('')
  const [isCurrent, setIsCurrent] = useState(false)
  const [matches, setMatches] = useState('')
  const [goals, setGoals] = useState('')
  const [assists, setAssists] = useState('')
  const [wins, setWins] = useState('')
  const [winRate, setWinRate] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!experience) return
    setClubName(experience.club_name || '')
    setClubLogoUrl(experience.club_logo_url || '')
    setLeague(experience.league || '')
    setPosition(experience.position || '')
    setJerseyNumber(experience.jersey_number != null ? String(experience.jersey_number) : '')
    setCoachRole(experience.coach_role || '')
    setIsCurrent(experience.is_current)
    setMatches(experience.matches != null ? String(experience.matches) : '')
    setGoals(experience.goals != null ? String(experience.goals) : '')
    setAssists(experience.assists != null ? String(experience.assists) : '')
    setWins(experience.wins != null ? String(experience.wins) : '')
    setWinRate(experience.win_rate != null ? String(experience.win_rate) : '')
    setDescription(experience.description || '')
    if (experience.start_date) {
      const d = new Date(experience.start_date + 'T00:00:00')
      setStartMonth(String(d.getMonth() + 1).padStart(2, '0'))
      setStartYear(String(d.getFullYear()))
    }
    if (experience.end_date) {
      const d = new Date(experience.end_date + 'T00:00:00')
      setEndMonth(String(d.getMonth() + 1).padStart(2, '0'))
      setEndYear(String(d.getFullYear()))
    }
  }, [experience])

  async function handleSave() {
    if (!clubName.trim()) { setError('Le nom du club est requis.'); return }
    if (!startMonth || !startYear) { setError('La date de début est requise.'); return }
    setSaving(true); setError('')

    const startDate = `${startYear}-${startMonth}-01`
    const endDate = (!isCurrent && endMonth && endYear) ? `${endYear}-${endMonth}-01` : null

    const payload: Record<string, unknown> = {
      user_id: userId,
      club_name: clubName.trim(),
      club_logo_url: clubLogoUrl.trim() || null,
      league: league.trim() || null,
      position: role === 'player' ? (position || null) : null,
      jersey_number: role === 'player' && jerseyNumber ? parseInt(jerseyNumber) : null,
      coach_role: role === 'coach' ? (coachRole || null) : null,
      start_date: startDate,
      end_date: endDate,
      is_current: isCurrent,
      matches: matches !== '' ? parseInt(matches) : null,
      goals: role === 'player' && goals !== '' ? parseInt(goals) : null,
      assists: role === 'player' && assists !== '' ? parseInt(assists) : null,
      wins: role === 'coach' && wins !== '' ? parseInt(wins) : null,
      win_rate: role === 'coach' && winRate !== '' ? parseInt(winRate) : null,
      description: description.trim() || null,
    }

    let result
    if (experience) {
      result = await supabase.from('career_experiences').update(payload).eq('id', experience.id).select().single()
    } else {
      result = await supabase.from('career_experiences').insert(payload).select().single()
    }

    if (result.error) { setError(result.error.message); setSaving(false); return }
    onSaved(result.data as CareerExperience)
    setSaving(false)
  }

  async function handleDelete() {
    if (!experience || !onDeleted) return
    if (!confirm(tc.delete_confirm[lang])) return
    await supabase.from('career_experiences').delete().eq('id', experience.id)
    onDeleted(experience.id)
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.75)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background:'#061540', border:'1px solid rgba(255,255,255,.12)', borderRadius:20, padding:'1.75rem', width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
          <div style={{ fontFamily:"'Russo One', sans-serif", fontSize:'1.3rem', letterSpacing:1, color:'#fff' }}>
            {experience ? tc.edit_title[lang] : tc.add_title[lang]}
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,.5)', fontSize:20, cursor:'pointer', lineHeight:1 }}>✕</button>
        </div>

        {error && <div style={{ background:'rgba(255,58,58,.12)', border:'1px solid rgba(255,58,58,.3)', borderRadius:8, padding:'8px 12px', fontSize:13, color:'#FF3A3A', marginBottom:'1rem' }}>{error}</div>}

        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div>
            <label style={lblSt}>{tc.club_name[lang]}</label>
            <input style={inpSt} value={clubName} onChange={e => setClubName(e.target.value)} placeholder="FC Bulle" />
          </div>

          <div>
            <label style={lblSt}>{tc.ligue[lang]}</label>
            <input style={inpSt} value={league} onChange={e => setLeague(e.target.value)} placeholder="3ème Ligue" />
          </div>

          {role === 'player' && (
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'1rem' }}>
              <div>
                <label style={lblSt}>{tc.position[lang]}</label>
                <select style={inpSt} value={position} onChange={e => setPosition(e.target.value)}>
                  <option value="" style={optSt}>—</option>
                  {POSITIONS.map(p => <option key={p} style={optSt}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={lblSt}>{tc.jersey[lang]}</label>
                <input style={inpSt} type="number" min={1} max={99} value={jerseyNumber} onChange={e => setJerseyNumber(e.target.value)} placeholder="10" />
              </div>
            </div>
          )}

          {role === 'coach' && (
            <div>
              <label style={lblSt}>{tc.coach_role[lang]}</label>
              <select style={inpSt} value={coachRole} onChange={e => setCoachRole(e.target.value)}>
                <option value="" style={optSt}>—</option>
                {COACH_ROLES.map(r => <option key={r} style={optSt}>{r}</option>)}
              </select>
            </div>
          )}

          {/* Start date */}
          <div>
            <label style={lblSt}>{tc.start[lang]}</label>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              <select style={inpSt} value={startMonth} onChange={e => setStartMonth(e.target.value)}>
                <option value="" style={optSt}>— Mois</option>
                {MONTHS.map((m, i) => <option key={i} value={String(i+1).padStart(2,'0')} style={optSt}>{m}</option>)}
              </select>
              <select style={inpSt} value={startYear} onChange={e => setStartYear(e.target.value)}>
                {years.map(y => <option key={y} style={optSt}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* Current toggle */}
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <input type="checkbox" id="is-current" checked={isCurrent} onChange={e => setIsCurrent(e.target.checked)}
              style={{ width:16, height:16, accentColor:'#FF3A3A', cursor:'pointer' }} />
            <label htmlFor="is-current" style={{ fontSize:13, color:'rgba(255,255,255,.75)', cursor:'pointer', userSelect:'none' }}>
              {tc.is_current[lang]}
            </label>
          </div>

          {/* End date */}
          {!isCurrent && (
            <div>
              <label style={lblSt}>{tc.end[lang]}</label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                <select style={inpSt} value={endMonth} onChange={e => setEndMonth(e.target.value)}>
                  <option value="" style={optSt}>— Mois</option>
                  {MONTHS.map((m, i) => <option key={i} value={String(i+1).padStart(2,'0')} style={optSt}>{m}</option>)}
                </select>
                <select style={inpSt} value={endYear} onChange={e => setEndYear(e.target.value)}>
                  <option value="" style={optSt}>— Année</option>
                  {years.map(y => <option key={y} style={optSt}>{y}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Stats */}
          <div>
            <label style={{ ...lblSt, marginBottom:8 }}>Statistiques (optionnel)</label>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
              <div>
                <label style={{ ...lblSt, fontSize:11 }}>{tc.matches[lang]}</label>
                <input style={inpSt} type="number" min={0} value={matches} onChange={e => setMatches(e.target.value)} placeholder="0" />
              </div>
              {role === 'player' ? (
                <>
                  <div>
                    <label style={{ ...lblSt, fontSize:11 }}>{tc.goals[lang]}</label>
                    <input style={inpSt} type="number" min={0} value={goals} onChange={e => setGoals(e.target.value)} placeholder="0" />
                  </div>
                  <div>
                    <label style={{ ...lblSt, fontSize:11 }}>{tc.assists[lang]}</label>
                    <input style={inpSt} type="number" min={0} value={assists} onChange={e => setAssists(e.target.value)} placeholder="0" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label style={{ ...lblSt, fontSize:11 }}>{tc.wins[lang]}</label>
                    <input style={inpSt} type="number" min={0} value={wins} onChange={e => setWins(e.target.value)} placeholder="0" />
                  </div>
                  <div>
                    <label style={{ ...lblSt, fontSize:11 }}>{tc.win_rate[lang]} %</label>
                    <input style={inpSt} type="number" min={0} max={100} value={winRate} onChange={e => setWinRate(e.target.value)} placeholder="0" />
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <label style={lblSt}>{tc.description[lang]}</label>
            <textarea style={{ ...inpSt, resize:'vertical' }} rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Notes sur cette expérience…" />
          </div>
        </div>

        <div style={{ display:'flex', gap:8, marginTop:'1.25rem' }}>
          <button onClick={handleSave} disabled={saving}
            style={{ flex:1, background:'#FF3A3A', color:'#fff', border:'none', borderRadius:9, padding:'11px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit', opacity:saving?.7:1 }}>
            {saving ? tc.saving[lang] : tc.save[lang]}
          </button>
          {experience && onDeleted && (
            <button onClick={handleDelete}
              style={{ background:'rgba(255,58,58,.12)', color:'#FF3A3A', border:'1px solid rgba(255,58,58,.3)', borderRadius:9, padding:'11px 14px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'inline-flex', alignItems:'center' }}>
              <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </button>
          )}
          <button onClick={onClose}
            style={{ background:'rgba(255,255,255,.08)', color:'rgba(255,255,255,.7)', border:'1px solid rgba(255,255,255,.12)', borderRadius:9, padding:'11px 14px', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}
