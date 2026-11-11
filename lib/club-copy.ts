import type { Lang } from './translations'

export const clubCopy = {
  fr: {
    notFound: 'Club introuvable', allClubs: 'Voir tous les clubs', clubs: 'Clubs',
    zone: 'Zone', league: 'Ligue', recruitment: 'Recrutement', open: 'Ouvert', closed: 'Complet',
    recruits: 'Recrute', status: 'Statut', verified: 'Vérifié', verifiedClub: 'Club vérifié', email: 'Email',
    contact: 'Contact', contactAction: 'Contacter', adsTitleStart: 'Annonces', adsTitleAccent: 'actives', activeAds: 'Annonces actives', sections: 'Sections du club',
    about: 'À propos', ads: 'Annonces', the: 'Le', club: 'club',
    noDescription: 'Aucune description disponible pour ce club.', strengths: 'Points forts', keyInfo: 'Infos clés',
    recruitmentNow: 'Recrutement en cours', position: 'poste', positions: 'postes',
    openPosition: 'ouvert', openPositions: 'ouverts', active: 'actives', noAds: 'Aucune annonce active pour le moment.',
    apply: 'Postuler', allAds: 'Voir toutes les annonces', contactHeading: 'Contacter', contactAccent: 'le club',
    information: 'Informations', messaging: 'Messagerie', sendMessage: 'Envoyer un message',
  },
  de: {
    notFound: 'Verein nicht gefunden', allClubs: 'Alle Vereine ansehen', clubs: 'Vereine',
    zone: 'Region', league: 'Liga', recruitment: 'Spielersuche', open: 'Offen', closed: 'Abgeschlossen',
    recruits: 'Rekrutiert', status: 'Status', verified: 'Verifiziert', verifiedClub: 'Verifizierter Verein', email: 'E-Mail',
    contact: 'Kontakt', contactAction: 'Kontakt', adsTitleStart: 'Aktive', adsTitleAccent: 'Anzeigen', activeAds: 'Aktive Anzeigen', sections: 'Vereinsbereiche',
    about: 'Über uns', ads: 'Anzeigen', the: 'Der', club: 'Verein',
    noDescription: 'Für diesen Verein ist noch keine Beschreibung vorhanden.', strengths: 'Stärken', keyInfo: 'Informationen',
    recruitmentNow: 'Aktuelle Spielersuche', position: 'Position', positions: 'Positionen',
    openPosition: 'offen', openPositions: 'offen', active: 'aktiv', noAds: 'Zurzeit gibt es keine aktiven Anzeigen.',
    apply: 'Bewerben', allAds: 'Alle Anzeigen ansehen', contactHeading: 'Kontakt zum', contactAccent: 'Verein',
    information: 'Informationen', messaging: 'Nachrichten', sendMessage: 'Nachricht senden',
  },
}

export function relativeTime(date: string, lang: Lang, now = Date.now()): string {
  const elapsed = now - new Date(date).getTime()
  if (!Number.isFinite(elapsed)) return ''
  const minutes = Math.max(0, Math.floor(elapsed / 60_000))
  const formatter = new Intl.RelativeTimeFormat(lang === 'de' ? 'de-CH' : 'fr-CH', { numeric: 'auto' })
  if (minutes < 60) return formatter.format(-minutes, 'minute')
  if (minutes < 1440) return formatter.format(-Math.floor(minutes / 60), 'hour')
  if (minutes < 43200) return formatter.format(-Math.floor(minutes / 1440), 'day')
  return formatter.format(-Math.floor(minutes / 43200), 'month')
}
