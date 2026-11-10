import type { Lang } from './translations'

const germanLabels: Record<string, string> = {
  Attaquant: 'Sturm',
  'Milieu offensif': 'Offensives Mittelfeld',
  'Milieu défensif': 'Defensives Mittelfeld',
  'Défenseur central': 'Innenverteidigung',
  'Défenseur latéral': 'Aussenverteidigung',
  Gardien: 'Tor',
  'Fribourg-Ville': 'Stadt Freiburg',
  Droit: 'Rechts',
  Gauche: 'Links',
  'Les deux': 'Beide',
}

export function footballLabel(value: string, lang: Lang): string {
  if (lang === 'fr') return value
  return germanLabels[value] ?? value
    .replace(/^(\d+)ème Ligue( Féminine)?$/, (_, number, women) => `${number}. Liga${women ? ' Frauen' : ''}`)
    .replace(/^Juniors (.+) - (\d+)(?:er|ème) degré$/, 'Junioren $1 - $2. Stärkeklasse')
    .replace(/^Juniors /, 'Junioren ')
}
