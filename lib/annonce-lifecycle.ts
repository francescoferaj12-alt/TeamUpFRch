export const ANNONCE_VALID_DAYS = 30
export const ANNONCE_VALID_MS = ANNONCE_VALID_DAYS * 24 * 60 * 60 * 1000
type ListingDates = { status: string; created_at: string; last_confirmed_at?: string | null }

export function annonceIsCurrent(annonce: ListingDates, now = Date.now()): boolean {
  const confirmed = Date.parse(annonce.last_confirmed_at || annonce.created_at)
  return annonce.status === 'active' && Number.isFinite(confirmed) && confirmed > now - ANNONCE_VALID_MS
}

export function currentAnnonceFilter(now = Date.now()): string {
  const cutoff = new Date(now - ANNONCE_VALID_MS).toISOString()
  return `last_confirmed_at.gt.${cutoff},and(last_confirmed_at.is.null,created_at.gt.${cutoff})`
}
