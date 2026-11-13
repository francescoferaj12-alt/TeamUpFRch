'use client'

import { useState } from 'react'
import { CLUB_TEAM_GROUPS, clubCategoryLabel, clubTeamLevels, clubLevelLabel, parseClubTeams, setClubTeamLevel, type ClubTeam } from '../lib/club-team-categories'

type Lang = 'fr' | 'de'
export function ClubTeamCategoryPicker({ value, onChange, lang }: { value: ClubTeam[]; onChange: (value: ClubTeam[]) => void; lang: Lang }) {
  const [customModes, setCustomModes] = useState<string[]>([])
  const has = (key: string) => value.some(team => team.category === key)
  function toggle(key: string) { onChange(has(key) ? value.filter(team => team.category !== key) : [...value, { category: key, level: '' }]) }
  const known = new Set(CLUB_TEAM_GROUPS.flatMap(group => group.items.map(item => item.key)))
  const others = value.filter(team => !known.has(team.category))
  return <div style={{ display: 'grid', gap: 18 }}>
    <p className="field-help" style={{ margin: 0 }}>{lang === 'fr' ? 'Sélectionne les catégories du club et indique le niveau de chacune.' : 'Wähle die Kategorien des Vereins und ergänze die jeweilige Spielklasse.'}</p>
    {value.length > 0 && <div style={{ display: 'grid', gap: 12 }}>
      {value.map(team => {
        const options = clubTeamLevels(team.category)
        const custom = customModes.includes(team.category) || (!!team.level && !options.some(item => item.key === team.level))
        const label = clubCategoryLabel(team.category, lang)
        return <div key={team.category} style={{ padding: 14, border: '1px solid rgba(255,255,255,.14)', borderRadius: 12, display: 'grid', gap: 8 }}>
          <strong>{label}</strong>
          <label style={{ display: 'grid', gap: 6 }}>{lang === 'fr' ? 'Niveau' : 'Spielklasse'}
            <select aria-label={`${lang === 'fr' ? 'Niveau' : 'Spielklasse'} — ${label}`} value={custom ? '__other' : team.level} onChange={event => { const other = event.target.value === '__other'; setCustomModes(keys => other ? [...keys.filter(key => key !== team.category), team.category] : keys.filter(key => key !== team.category)); onChange(setClubTeamLevel(value, team.category, other ? '' : event.target.value)) }}>
              <option value="">{lang === 'fr' ? 'À préciser' : 'Noch offen'}</option>
              {options.map(item => <option key={item.key} value={item.key}>{item[lang]}</option>)}
              <option value="__other">{lang === 'fr' ? 'Autre niveau…' : 'Andere Spielklasse…'}</option>
            </select>
          </label>
          {custom && <input aria-label={`${lang === 'fr' ? 'Autre niveau' : 'Andere Spielklasse'} — ${label}`} maxLength={80} value={team.level} onChange={event => onChange(setClubTeamLevel(value, team.category, event.target.value))} />}
        </div>
      })}
    </div>}
    {CLUB_TEAM_GROUPS.map(group => <fieldset key={group.key} style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
      <legend style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>{group[lang]}</legend>
      <div className="pe-multi" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {group.items.map(item => <label key={item.key} className={`pe-multi-chip ${has(item.key) ? 'active' : ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, cursor: 'pointer', margin: 0 }}>
          <input type="checkbox" checked={has(item.key)} onChange={() => toggle(item.key)} style={{ width: 16, minHeight: 16, height: 16, margin: 0, accentColor: '#ff3b48' }} />{item[lang]}
        </label>)}
      </div>
    </fieldset>)}
    {others.map(team => <label key={team.category} className="pe-multi-chip active"><input type="checkbox" checked onChange={() => toggle(team.category)} />{clubCategoryLabel(team.category, lang)}</label>)}
  </div>
}

export default function ClubTeamCategories({ value, lang }: { value?: string | null; lang: Lang }) {
  const selected = parseClubTeams(value)
  if (!selected.length) return null
  return <section aria-label={lang === 'fr' ? 'Équipes du club' : 'Teams des Vereins'} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, marginBottom: '1.25rem', padding: '1.25rem' }}>
    <h2 style={{ fontFamily: "'Russo One', sans-serif", fontSize: '1rem', margin: '0 0 16px', color: '#fff' }}>{lang === 'fr' ? 'Équipes du club' : 'Teams des Vereins'}</h2>
    <div style={{ display: 'grid', gap: 8 }}>{selected.map(team => <div key={team.category} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, background: 'rgba(255,255,255,.04)', borderRadius: 10, padding: '10px 12px', fontSize: 13 }}><strong>{clubCategoryLabel(team.category, lang)}</strong><span style={{ color: '#c7d1e3' }}>{team.level ? clubLevelLabel(team.level, lang) : (lang === 'fr' ? 'Niveau à préciser' : 'Spielklasse noch offen')}</span></div>)}</div>
  </section>
}
