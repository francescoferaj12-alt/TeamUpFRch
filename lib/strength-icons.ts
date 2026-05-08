// Icon mapping for strength keys used across player, coach and club profiles.
// Keys must match those in STRENGTHS_PLAYER / STRENGTHS_COACH / STRENGTHS_CLUB
// defined in app/profil/page.tsx.

export const STRENGTH_ICONS: Record<string, string> = {
  // Player
  fast: '⚡',
  technical: '✨',
  physical: '💪',
  dribbling: '🌀',
  shooting: '🦵',
  finishing: '🎯',
  passing: '🎯',
  vision: '👁️',
  aerial: '🧠',
  onevsone: '⚔️',
  sprint: '🏃',
  pressing: '🔥',
  defensive: '🛡️',
  offensive: '⚽',
  leadership: '👑',
  hardworking: '🔨',
  composed: '🧊',
  precise: '🎯',

  // Coach
  tactical: '🧠',
  motivator: '🔥',
  communication: '💬',
  experienced: '🎓',
  video: '📊',
  youth: '🌱',
  defense: '🛡️',
  counter: '⚡',
  possession: '🎯',
  passionate: '❤️',
  innovative: '💡',
  fitness: '🏋️',

  // Club
  infrastructure: '🏟️',
  family: '👨‍👩‍👧',
  ambition: '🚀',
  competitive: '🏆',
  atmosphere: '🎉',
  professional: '🎓',
  social: '🤝',
  equipment: '🎽',
  local: '📍',
  growing: '📈',
  welcoming: '🚪',
}

export function strengthIcon(key: string): string {
  return STRENGTH_ICONS[key] || '⭐'
}
