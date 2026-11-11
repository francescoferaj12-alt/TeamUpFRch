import type { Lang } from './translations'

const STRENGTHS_PLAYER = [
  { key: 'fast',        fr: 'Rapide',             de: 'Schnell' },
  { key: 'technical',   fr: 'Technique',          de: 'Technisch' },
  { key: 'physical',    fr: 'Physique',           de: 'Körperlich' },
  { key: 'dribbling',   fr: 'Dribble',            de: 'Dribbling' },
  { key: 'shooting',    fr: 'Frappe puissante',   de: 'Schussstärke' },
  { key: 'finishing',   fr: 'Finition',           de: 'Abschluss' },
  { key: 'passing',     fr: 'Passes précises',    de: 'Genaue Pässe' },
  { key: 'vision',      fr: 'Vision du jeu',      de: 'Spielübersicht' },
  { key: 'aerial',      fr: 'Jeu aérien',         de: 'Kopfballspiel' },
  { key: 'onevsone',    fr: '1 contre 1',         de: '1 gegen 1' },
  { key: 'sprint',      fr: 'Vitesse de pointe',  de: 'Sprintschnelligkeit' },
  { key: 'pressing',    fr: 'Pressing',           de: 'Pressing' },
  { key: 'defensive',   fr: 'Défensif',           de: 'Defensiv' },
  { key: 'offensive',   fr: 'Offensif',           de: 'Offensiv' },
  { key: 'leadership',  fr: 'Leadership',         de: 'Führungsstärke' },
  { key: 'hardworking', fr: 'Travailleur',        de: 'Fleissig' },
  { key: 'composed',    fr: 'Calme',              de: 'Ruhig' },
  { key: 'precise',     fr: 'Précis',             de: 'Präzise' },
]

const STRENGTHS_COACH = [
  { key: 'tactical',    fr: 'Tactique',              de: 'Taktisch' },
  { key: 'motivator',   fr: 'Motivateur',            de: 'Motivator' },
  { key: 'communication', fr: 'Communication',       de: 'Kommunikation' },
  { key: 'experienced', fr: 'Expérimenté',           de: 'Erfahren' },
  { key: 'video',       fr: 'Analyse vidéo',         de: 'Videoanalyse' },
  { key: 'youth',       fr: 'Formation des jeunes',  de: 'Jugendausbildung' },
  { key: 'defense',     fr: 'Défense organisée',     de: 'Organisierte Abwehr' },
  { key: 'counter',     fr: 'Contre-attaque',        de: 'Konterspiel' },
  { key: 'possession',  fr: 'Jeu de possession',     de: 'Ballbesitzspiel' },
  { key: 'pressing',    fr: 'Jeu de pression',       de: 'Pressing-Spiel' },
  { key: 'leadership',  fr: 'Leadership',            de: 'Führungsstärke' },
  { key: 'passionate',  fr: 'Passionné',             de: 'Leidenschaftlich' },
  { key: 'innovative',  fr: 'Innovateur',            de: 'Innovativ' },
  { key: 'composed',    fr: 'Calme',                 de: 'Ruhig' },
  { key: 'fitness',     fr: 'Préparation physique',  de: 'Fitness-Training' },
]

const STRENGTHS_CLUB = [
  { key: 'infrastructure', fr: 'Infrastructure de qualité', de: 'Gute Infrastruktur' },
  { key: 'family',         fr: 'Esprit familial',           de: 'Familiäre Atmosphäre' },
  { key: 'ambition',       fr: 'Ambition sportive',         de: 'Sportlicher Ehrgeiz' },
  { key: 'youth',          fr: 'Formation jeunes',          de: 'Jugendförderung' },
  { key: 'competitive',    fr: 'Équipe compétitive',        de: 'Wettbewerbsfähig' },
  { key: 'atmosphere',     fr: 'Bonne ambiance',            de: 'Gute Stimmung' },
  { key: 'professional',   fr: 'Structure sérieuse',        de: 'Seriöse Struktur' },
  { key: 'social',         fr: 'Vie sociale active',        de: 'Aktives Sozialleben' },
  { key: 'equipment',      fr: 'Bons équipements',          de: 'Gute Ausrüstung' },
  { key: 'local',          fr: 'Ancrage local',             de: 'Lokale Verankerung' },
  { key: 'growing',        fr: 'Club en développement',     de: 'Wachsender Verein' },
  { key: 'welcoming',      fr: 'Accueil de nouveaux joueurs', de: 'Offene Aufnahme' },
]

export function strengthLabel(key: string, lang: Lang, role = 'player'): string {
  const preferred = role === 'club' ? STRENGTHS_CLUB : role === 'coach' ? STRENGTHS_COACH : STRENGTHS_PLAYER
  const label = preferred.find(value => value.key === key)
    ?? [...STRENGTHS_PLAYER, ...STRENGTHS_COACH, ...STRENGTHS_CLUB].find(value => value.key === key)
  return label ? label[lang] : key
}
