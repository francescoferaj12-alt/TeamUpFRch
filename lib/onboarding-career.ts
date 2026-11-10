function careerDate(value: unknown, required: boolean): string | null {
  if (value === '' || value == null) {
    if (required) throw new Error('Start year is required')
    return null
  }
  if (typeof value !== 'string') throw new Error('Invalid career date')
  // Onboarding asks for years; PostgreSQL date columns need a full date.
  const date = /^\d{4}$/.test(value) ? `${value}-01-01` : value
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date.startsWith('0000')) throw new Error('Invalid career date')
  const parsed = new Date(`${date}T00:00:00Z`)
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) throw new Error('Invalid career date')
  return date
}

export function normalizeOnboardingCareer(value: unknown) {
  if (!Array.isArray(value) || value.length > 50) throw new Error('Invalid career entries')
  return value.map(entry => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) throw new Error('Invalid career entry')
    const text = (field: string, required = false) => {
      const raw = entry[field]
      if (raw != null && typeof raw !== 'string') throw new Error('Invalid career field')
      const trimmed = (raw || '').trim()
      if ((required && !trimmed) || trimmed.length > 200) throw new Error('Invalid career field')
      return trimmed || null
    }
    if (entry.is_current != null && typeof entry.is_current !== 'boolean') throw new Error('Invalid current club')
    const isCurrent = entry.is_current === true
    const start = careerDate(entry.start_date, true)!
    const end = isCurrent ? null : careerDate(entry.end_date, false)
    if (end && end < start) throw new Error('End date precedes start date')
    return {
      club_name: text('club_name', true), league: text('league'),
      position: text('position'), coach_role: text('coach_role'),
      start_date: start, end_date: end, is_current: isCurrent,
    }
  })
}
