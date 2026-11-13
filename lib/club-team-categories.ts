import levelGroups from './club-team-levels.json'
import groups from './club-team-categories.json'
export const CLUB_TEAM_GROUPS = groups
const labels = new Map(groups.flatMap(group => group.items.map(item => [item.key, item] as const)))
export function parseClubCategories(raw?: string | null): string[] {
  if (raw?.trim().startsWith('{')) return parseClubTeams(raw).map(team => team.category)
  return [...new Set((raw || '').split(',').map(value => value.trim()).filter(Boolean))]
}
export function clubCategoryLabel(key: string, lang: 'fr' | 'de'): string {
  return labels.get(key)?.[lang] || key
}
// Keep older/custom values so editing a profile never silently drops a category.
export function toggleClubCategory(selected: string[], key: string): string[] {
  return selected.includes(key) ? selected.filter(value => value !== key) : [...selected, key]
}

export type ClubTeam = { category: string; level: string }
export function clubTeamLevels(category: string) {
  const group = ['cat_juniors_g','cat_ff11'].includes(category) ? 'children' : category === 'cat_seniors_h' ? 'men' : category === 'cat_seniors_f' ? 'women' : category.startsWith('cat_youth') ? 'youth' : category.startsWith('cat_juniors_') || category.startsWith('cat_ff') || category === 'cat_juniores_f' ? 'juniors' : 'regional'
  const options = levelGroups.find(item => item.key === group)!.items
  if (['cat_juniors_e','cat_juniors_f','cat_juniors_d','cat_juniors_d7','cat_juniors_d9'].includes(category)) return options.filter(item => item.key !== 'promotion')
  if (group === 'juniors') return options.filter(item => item.key !== 'degree3')
  return options
}
export function clubLevelLabel(level: string, lang: 'fr' | 'de'): string {
  return levelGroups.flatMap(group => group.items).find(item => item.key === level)?.[lang] || level
}
export function parseClubTeams(raw?: string | null): ClubTeam[] {
  if (!raw) return []
  if (raw.trim().startsWith('{')) {
    try {
      const value = JSON.parse(raw)
      if (value.version !== 1 || !Array.isArray(value.teams)) return []
      const seen = new Set<string>()
      return value.teams.filter((item: unknown): item is ClubTeam => {
        if (!item || typeof item !== 'object') return false
        const team = item as ClubTeam
        if (typeof team.category !== 'string' || !team.category.trim() || typeof team.level !== 'string' || seen.has(team.category)) return false
        seen.add(team.category)
        return true
      }).map((team: ClubTeam) => ({ category: team.category, level: team.level }))
    } catch { return [] }
  }
  return parseClubCategories(raw).map(category => ({ category, level: '' }))
}
export function serializeClubTeams(teams: ClubTeam[]): string {
  // Keep the legacy representation when no levels have been entered.
  if (!teams.some(team => team.level)) return teams.map(team => team.category).join(',')
  return JSON.stringify({ version: 1, teams })
}
export function setClubTeamLevel(teams: ClubTeam[], category: string, level: string): ClubTeam[] {
  return teams.map(team => team.category === category ? { ...team, level } : team)
}
