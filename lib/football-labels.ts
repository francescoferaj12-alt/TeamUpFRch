import type { Lang } from './translations'

const germanLabels: Record<string, string> = {
  'Président(e)': 'Präsident/in',
  'Vice-président(e)': 'Vizepräsident/in',
  Secrétaire: 'Sekretariat',
  'Trésorier(e)': 'Kassier/in',
  'Directeur sportif': 'Sportliche Leitung',
  Autre: 'Andere',
  'Coach principal': 'Cheftrainer',
  'Coach adjoint': 'Assistenztrainer',
  'Coach juniors': 'Juniorentrainer',
  'Coach des gardiens': 'Torwarttrainer',
  "Moins d'1 an": 'Weniger als ein Jahr',
  '1 à 3 ans': '1–3 Jahre',
  '3 à 5 ans': '3–5 Jahre',
  '5 à 10 ans': '5–10 Jahre',
  'Plus de 10 ans': 'Über 10 Jahre',
  Attaquant: 'Sturm',
  'Milieu offensif': 'Offensives Mittelfeld',
  'Milieu défensif': 'Defensives Mittelfeld',
  'Défenseur central': 'Innenverteidigung',
  'Défenseur latéral': 'Aussenverteidigung',
  Gardien: 'Torwart',
  beginner: 'Anfänger',
  amateur: 'Amateur',
  confirmed: 'Fortgeschritten',
  experienced: 'Erfahren',
  'Fribourg-Ville': 'Stadt Freiburg',
  Droit: 'Rechts',
  Gauche: 'Links',
  'Les deux': 'Beide',
  Ambidextre: 'Beidfüssig',
  'Entraîneur principal': 'Cheftrainer',
  'Entraîneur assistant': 'Assistenztrainer',
  'Entraîneur adjoint': 'Assistenztrainer',
  'Responsable technique': 'Technischer Leiter',
  'Préparateur physique': 'Athletiktrainer',
  'Entraîneur des gardiens': 'Torwarttrainer',
  Aucune: 'Keine',
  'Diplôme CFE': 'CFE-Diplom',
  Débutant: 'Anfänger',
  '1-3 ans': '1–3 Jahre',
  '3-5 ans': '3–5 Jahre',
  '5-10 ans': '5–10 Jahre',
  '10+ ans': 'Über 10 Jahre',
  'Cherche un club': 'Suche einen Verein',
  'En poste actuellement': 'Aktuell im Amt',
  'Pas disponible': 'Nicht verfügbar',
}

export function footballLabel(value: string, lang: Lang): string {
  if (lang === 'fr') return value
  return germanLabels[value] ?? value
    .replace(/^(\d+)ème Ligue( Féminine)?$/, (_, number, women) => `${number}. Liga${women ? ' Frauen' : ''}`)
    .replace(/^Juniors (.+) - (\d+)(?:er|ème) degré$/, 'Junioren $1 - $2. Stärkeklasse')
    .replace(/^Juniors /, 'Junioren ')
    .replace(/^Junior ([A-D])$/, 'Junioren $1')
}
