import levelGroups from './club-team-levels.json'
import groups from './club-team-categories.json'
// Legacy A categories remain readable but are no longer offered for new teams.
export const CLUB_TEAM_GROUPS = groups.map(group => ({ ...group, items: group.items.filter(item => item.key !== 'cat_juniors_a') }))
const labels = new Map(groups.flatMap(group => group.items.map(item => [item.key, item] as const)))
export function parseClubCategories(raw?: string | null): string[] {
  if (raw?.trim().startsWith('{')) return [...new Set(parseClubTeams(raw).map(team => team.category))]
  return [...new Set((raw || '').split(',').map(value => value.trim()).filter(Boolean))]
}
export function clubCategoryLabel(key: string, lang: 'fr' | 'de'): string {
  return labels.get(key)?.[lang] || key
}
// Keep older/custom values so editing a profile never silently drops a category.
export function toggleClubCategory(selected: string[], key: string): string[] {
  return selected.includes(key) ? selected.filter(value => value !== key) : [...selected, key]
}

export type ClubTeam = { id?: string; name?: string; category: string; level: string }
export function clubTeamLevels(category: string) {
  if (category === 'cat_juniors_a') return levelGroups.find(item => item.key === 'youth')!.items
  const group = ['cat_juniors_g','cat_ff11'].includes(category) ? 'children' : category === 'cat_seniors_h' ? 'men' : category === 'cat_seniors_f' ? 'women' : category.startsWith('cat_youth') ? 'youth' : category.startsWith('cat_juniors_') || category.startsWith('cat_ff') || category === 'cat_juniores_f' ? 'juniors' : 'regional'
  const options = levelGroups.find(item => item.key === group)!.items
  if (['cat_juniors_e','cat_juniors_f','cat_juniors_d','cat_juniors_d7','cat_juniors_d9'].includes(category)) return options.filter(item => item.key !== 'promotion')
  if (['cat_juniors_b','cat_juniors_c'].includes(category)) return [...levelGroups.find(item => item.key === 'youth')!.items, ...options.filter(item => item.key !== 'degree3')]
  if (group === 'juniors') return options.filter(item => item.key !== 'degree3')
  return options
}
export function clubLevelLabel(level: string, lang: 'fr' | 'de'): string {
  return levelGroups.flatMap(group => group.items).find(item => item.key === level)?.[lang] || level
}
export function clubTeamIdentity(team: ClubTeam): string { return team.id || team.category }
export function clubTeamTitle(team: ClubTeam, teams: ClubTeam[], lang: 'fr' | 'de'): string {
  if (team.name?.trim()) return team.name.trim()
  const siblings = teams.filter(item => item.category === team.category)
  const label = clubCategoryLabel(team.category, lang)
  return siblings.length > 1 ? `${label} ${siblings.findIndex(item => clubTeamIdentity(item) === clubTeamIdentity(team)) + 1}` : label
}
export function addClubTeam(teams: ClubTeam[], category: string): ClubTeam[] {
  const used = new Set(teams.map(clubTeamIdentity))
  let number = 1
  let id = `${category}#${number}`
  while (used.has(id)) id = `${category}#${++number}`
  return [...teams, { id, category, level: '' }]
}
export function removeClubTeam(teams: ClubTeam[], identity: string): ClubTeam[] {
  return teams.filter(team => clubTeamIdentity(team) !== identity)
}
export function updateClubTeam(teams: ClubTeam[], identity: string, patch: Partial<Pick<ClubTeam, 'name' | 'level'>>): ClubTeam[] {
  return teams.map(team => clubTeamIdentity(team) === identity ? { ...team, ...patch } : team)
}
export function parseClubTeams(raw?: string | null): ClubTeam[] {
  if (!raw) return []
  if (raw.trim().startsWith('{')) {
    try {
      const value = JSON.parse(raw)
      if (![1, 2].includes(value.version) || !Array.isArray(value.teams)) return []
      const used = new Set<string>()
      const teams: ClubTeam[] = []
      value.teams.forEach((item: unknown, index: number) => {
        if (!item || typeof item !== 'object') return
        const team = item as ClubTeam
        if (typeof team.category !== 'string' || !team.category.trim() || typeof team.level !== 'string') return
        if (team.id !== undefined && (typeof team.id !== 'string' || !team.id.trim())) return
        if (team.name !== undefined && typeof team.name !== 'string') return
        const next: ClubTeam = { category: team.category, level: team.level }
        if (team.name !== undefined) next.name = team.name
        if (team.id !== undefined) next.id = team.id
        let key = clubTeamIdentity(next)
        // Never discard a second team just because it has the same category.
        if (used.has(key)) { next.id = `${key}#restored-${index}`; key = next.id }
        used.add(key)
        teams.push(next)
      })
      return teams
    } catch { return [] }
  }
  return parseClubCategories(raw).map(category => ({ category, level: '' }))
}
export function serializeClubTeams(teams: ClubTeam[]): string {
  const hasIndividualTeams = teams.some(team => team.id || team.name) || new Set(teams.map(team => team.category)).size !== teams.length
  if (hasIndividualTeams) return JSON.stringify({ version: 2, teams })
  if (!teams.some(team => team.level)) return teams.map(team => team.category).join(',')
  return JSON.stringify({ version: 1, teams })
}
export function setClubTeamLevel(teams: ClubTeam[], identity: string, level: string): ClubTeam[] {
  return updateClubTeam(teams, identity, { level })
}
