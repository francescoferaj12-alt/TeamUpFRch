export const seasonStatFields = ['matches', 'goals', 'assists', 'matches_prev', 'goals_prev', 'assists_prev'] as const
export type SeasonStatField = typeof seasonStatFields[number]

// Keep missing values distinct from a genuine zero; never silently truncate decimals.
export function parseSeasonStatistics(values: Record<SeasonStatField, string>): Record<SeasonStatField, number | null> {
  return Object.fromEntries(seasonStatFields.map(field => {
    const value = values[field].trim()
    if (!value) return [field, null]
    if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) > 2147483647) throw new Error('invalid_stats')
    return [field, Number(value)]
  })) as Record<SeasonStatField, number | null>
}
