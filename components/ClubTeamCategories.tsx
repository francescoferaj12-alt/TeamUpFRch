'use client'

import { useState } from 'react'
import { CLUB_TEAM_GROUPS, clubCategoryLabel, clubTeamLevels, clubLevelLabel, parseClubTeams, setClubTeamLevel, clubTeamIdentity, clubTeamTitle, addClubTeam, removeClubTeam, updateClubTeam, type ClubTeam } from '../lib/club-team-categories'

type Lang = 'fr' | 'de'
export function ClubTeamCategoryPicker({ value, onChange, lang }: { value: ClubTeam[]; onChange: (value: ClubTeam[]) => void; lang: Lang }) {
  const [customModes, setCustomModes] = useState<string[]>([])
  const has = (key: string) => value.some(team => team.category === key)
  function toggle(key: string) { onChange(has(key) ? value.filter(team => team.category !== key) : addClubTeam(value, key)) }
  const known = new Set(CLUB_TEAM_GROUPS.flatMap(group => group.items.map(item => item.key)))
  const others = value.filter((team, index) => !known.has(team.category) && value.findIndex(item => item.category === team.category) === index)
  return <div style={{ display: 'grid', gap: 18 }}>
    <p className="field-help" style={{ margin: 0 }}>{lang === 'fr' ? 'Ajoute tes équipes et indique leur niveau. Une même catégorie peut contenir plusieurs équipes.' : 'Ergänze deine Teams und ihre Spielklasse. Mehrere Teams derselben Kategorie sind möglich.'}</p>
    {value.length > 0 && <div style={{ display: 'grid', gap: 12 }}>
      {value.map(team => {
        const identity = clubTeamIdentity(team)
        const options = clubTeamLevels(team.category)
        const custom = customModes.includes(identity) || (!!team.level && !options.some(item => item.key === team.level))
        const label = clubTeamTitle(team, value, lang)
        return <div key={identity} style={{ padding: 14, border: '1px solid rgba(255,255,255,.14)', borderRadius: 12, display: 'grid', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}><strong style={{minWidth:0,overflowWrap:'anywhere'}}>{label}</strong><button type="button" className="pe-multi-chip" style={{ minHeight: 44 }} aria-label={`${lang === 'fr' ? 'Retirer' : 'Entfernen'} ${label}`} onClick={() => { setCustomModes(keys => keys.filter(key => key !== identity)); onChange(removeClubTeam(value, identity)) }}>{lang === 'fr' ? 'Retirer' : 'Entfernen'}</button></div>
          <label style={{ display: 'grid', gap: 6 }}>{lang === 'fr' ? 'Nom de l’équipe (facultatif)' : 'Teamname (optional)'}<input aria-label={`${lang === 'fr' ? 'Nom de l’équipe' : 'Teamname'} — ${label}`} placeholder={label} maxLength={64} value={team.name || ''} onChange={event => onChange(updateClubTeam(value, identity, { name: event.target.value }))} /></label>
          <label style={{ display: 'grid', gap: 6 }}>{lang === 'fr' ? 'Niveau' : 'Spielklasse'}
            <select aria-label={`${lang === 'fr' ? 'Niveau' : 'Spielklasse'} — ${label}`} value={custom ? '__other' : team.level} onChange={event => { const other = event.target.value === '__other'; setCustomModes(keys => other ? [...keys.filter(key => key !== identity), identity] : keys.filter(key => key !== identity)); onChange(setClubTeamLevel(value, identity, other ? '' : event.target.value)) }}>
              <option value="">{lang === 'fr' ? 'À préciser' : 'Noch offen'}</option>
              {options.map(item => <option key={item.key} value={item.key}>{item[lang]}</option>)}
              <option value="__other">{lang === 'fr' ? 'Autre niveau…' : 'Andere Spielklasse…'}</option>
            </select>
          </label>
          <button type="button" className="pe-multi-chip" style={{ minHeight: 44, justifySelf: 'start' }} aria-label={`${lang === 'fr' ? 'Ajouter une autre équipe' : 'Weiteres Team hinzufügen'} — ${label}`} onClick={() => onChange(addClubTeam(value, team.category))}>+ {lang === 'fr' ? 'Une autre équipe dans cette catégorie' : 'Weiteres Team in dieser Kategorie'}</button>
          {custom && <input aria-label={`${lang === 'fr' ? 'Autre niveau' : 'Andere Spielklasse'} — ${label}`} maxLength={80} value={team.level} onChange={event => onChange(setClubTeamLevel(value, identity, event.target.value))} />}
        </div>
      })}
    </div>}
    {CLUB_TEAM_GROUPS.map(group => <fieldset key={group.key} style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
      <legend style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>{group[lang]}</legend>
      <div className="pe-multi" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {group.items.map(item => <label key={item.key} className={`pe-multi-chip ${has(item.key) ? 'active' : ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, cursor: 'pointer', margin: 0 }}>
          <input type="checkbox" disabled={value.filter(team => team.category === item.key).length > 1} checked={has(item.key)} onChange={() => toggle(item.key)} style={{ width: 16, minHeight: 16, height: 16, margin: 0, accentColor: '#ff3b48' }} />{item[lang]}
        </label>)}
      </div>
    </fieldset>)}
    {others.map(team => <label key={team.category} className="pe-multi-chip active"><input type="checkbox" disabled={value.filter(item => item.category === team.category).length > 1} checked onChange={() => toggle(team.category)} />{clubCategoryLabel(team.category, lang)}</label>)}
  </div>
}

export default function ClubTeamCategories({ value, lang }: { value?: string | null; lang: Lang }) {
  const selected = parseClubTeams(value)
  if (!selected.length) return null
  return <section aria-label={lang === 'fr' ? 'Équipes du club' : 'Teams des Vereins'} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, marginBottom: '1.25rem', padding: '1.25rem' }}>
    <h2 style={{ fontFamily: "'Russo One', sans-serif", fontSize: '1rem', margin: '0 0 16px', color: '#fff' }}>{lang === 'fr' ? 'Équipes du club' : 'Teams des Vereins'}</h2>
    <div style={{ display: 'grid', gap: 8 }}>{selected.map(team => <div key={clubTeamIdentity(team)} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, background: 'rgba(255,255,255,.04)', borderRadius: 10, padding: '10px 12px', fontSize: 13 }}><strong style={{minWidth:0,overflowWrap:'anywhere'}}>{clubTeamTitle(team, selected, lang)}{team.name?.trim() && <small style={{ display: 'block', fontWeight: 400, color: '#c7d1e3', marginTop: 3 }}>{clubCategoryLabel(team.category, lang)}</small>}</strong><span style={{ color: '#c7d1e3',minWidth:0,overflowWrap:'anywhere' }}>{team.level ? clubLevelLabel(team.level, lang) : (lang === 'fr' ? 'Niveau à préciser' : 'Spielklasse noch offen')}</span></div>)}</div>
  </section>
}
