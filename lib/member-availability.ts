export function coachIsAvailable(status: string | null | undefined, fallback: boolean | null | undefined): boolean {
  if (status === 'Cherche un club') return true
  if (status === 'En poste actuellement' || status === 'Pas disponible') return false
  return fallback === true
}

export function memberIsAvailable(profile: { role: string; available?: boolean | null; coach_availability?: string | null }): boolean {
  return profile.role === 'coach' ? coachIsAvailable(profile.coach_availability, profile.available) : profile.available === true
}
