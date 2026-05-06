// TeamUpFR — Translations FR / DE

export type Lang = 'fr' | 'de'

export const t = {
  // NAVBAR
  nav: {
    recherche: { fr: 'Recherche', de: 'Suche' },
    messages: { fr: 'Messages', de: 'Nachrichten' },
    clubs: { fr: 'Clubs', de: 'Vereine' },
    dashboard: { fr: 'Dashboard', de: 'Dashboard' },
    candidatures: { fr: 'Candidatures', de: 'Bewerbungen' },
    apropos: { fr: 'À propos', de: 'Über uns' },
    faq: { fr: 'FAQ', de: 'FAQ' },
    connexion: { fr: 'Connexion', de: 'Anmelden' },
  },

  // HOMEPAGE
  home: {
    badge: { fr: 'Canton de Fribourg · Suisse 🇨🇭', de: 'Kanton Freiburg · Schweiz 🇨🇭' },
    title1: { fr: "IT'S TIME TO", de: 'ES IST ZEIT ZU' },
    title2: { fr: 'PLAY', de: 'SPIELEN' },
    motto: { fr: 'Ton équipe, ton avenir', de: 'Dein Team, deine Zukunft' },
    desc: { fr: 'La première plateforme qui connecte joueurs, coachs et clubs de football amateurs du canton de Fribourg.', de: 'Die erste Plattform, die Spieler, Trainer und Vereine des Amateurfussballs im Kanton Freiburg verbindet.' },
    cta_primary: { fr: 'Créer mon profil', de: 'Profil erstellen' },
    cta_secondary: { fr: 'Découvrir', de: 'Entdecken' },
    stats_players: { fr: 'Joueurs inscrits', de: 'Eingeschriebene Spieler' },
    stats_clubs: { fr: 'Clubs actifs', de: 'Aktive Vereine' },
    stats_coaches: { fr: 'Coachs disponibles', de: 'Verfügbare Trainer' },
    stats_free: { fr: 'Gratuit', de: 'Kostenlos' },
    section_who: { fr: 'Pour tout le monde', de: 'Für alle' },
    section_who_title: { fr: 'Une plateforme, trois profils', de: 'Eine Plattform, drei Profile' },
    section_who_desc: { fr: "Que tu sois joueur, entraîneur ou responsable de club, TeamUpFR est fait pour toi.", de: 'Egal ob Spieler, Trainer oder Vereinsverantwortlicher — TeamUpFR ist für dich gemacht.' },
    annonces_title: { fr: 'Dernières annonces', de: 'Neueste Anzeigen' },
    annonces_link: { fr: 'Voir toutes les annonces →', de: 'Alle Anzeigen anzeigen →' },
    how_title: { fr: 'Comment ça marche ?', de: 'Wie funktioniert es?' },
    cta_final: { fr: 'PRÊT À JOUER ?', de: 'BEREIT ZU SPIELEN?' },
    cta_final_desc: { fr: "Inscris-toi gratuitement et rejoins la communauté du football fribourgeois. Ton équipe t'attend.", de: 'Registriere dich kostenlos und tritt der Freiburger Fussballgemeinschaft bei. Dein Team wartet auf dich.' },
    signup: { fr: "S'inscrire gratuitement", de: 'Kostenlos registrieren' },
    explore: { fr: 'Explorer', de: 'Erkunden' },
  },

  // USER TYPES
  types: {
    player_title: { fr: 'Joueur', de: 'Spieler' },
    player_desc: { fr: "Crée ton profil, montre tes stats et highlights vidéo. Postule directement aux annonces des clubs.", de: 'Erstelle dein Profil, zeige deine Statistiken und Video-Highlights. Bewirb dich direkt auf Vereinsanzeigen.' },
    player_cta: { fr: 'Créer mon profil joueur', de: 'Spielerprofil erstellen' },
    coach_title: { fr: 'Coach', de: 'Trainer' },
    coach_desc: { fr: "Publie tes certifications UEFA, ta philosophie de jeu. Trouve le club qui correspond à ta vision.", de: 'Veröffentliche deine UEFA-Zertifizierungen, deine Spielphilosophie. Finde den Verein, der deiner Vision entspricht.' },
    coach_cta: { fr: 'Créer mon profil coach', de: 'Trainerprofil erstellen' },
    club_title: { fr: 'Club', de: 'Verein' },
    club_desc: { fr: "Page officielle avec roster complet, annonces de recrutement et gestion des candidatures.", de: 'Offizielle Seite mit vollständigem Kader, Rekrutierungsanzeigen und Bewerbungsverwaltung.' },
    club_cta: { fr: 'Créer la page du club', de: 'Vereinsseite erstellen' },
  },

  // HOW IT WORKS
  how: {
    step1_title: { fr: 'Crée ton profil', de: 'Profil erstellen' },
    step1_desc: { fr: "Inscris-toi gratuitement en 2 minutes. Ajoute tes stats, ta position et ta disponibilité.", de: 'Registriere dich kostenlos in 2 Minuten. Füge deine Statistiken, Position und Verfügbarkeit hinzu.' },
    step2_title: { fr: 'Explore & cherche', de: 'Erkunden & suchen' },
    step2_desc: { fr: "Recherche des clubs, joueurs ou coachs avec nos filtres avancés par ligue et zone.", de: 'Suche Vereine, Spieler oder Trainer mit unseren erweiterten Filtern nach Liga und Zone.' },
    step3_title: { fr: 'Postule ou recrute', de: 'Bewerben oder rekrutieren' },
    step3_desc: { fr: "Envoie ta candidature ou publie une annonce. Gère tout depuis ton dashboard.", de: 'Sende deine Bewerbung oder veröffentliche eine Anzeige. Verwalte alles über dein Dashboard.' },
    step4_title: { fr: 'Joue !', de: 'Spiel!' },
    step4_desc: { fr: "Trouve ton équipe, ton joueur ou ton coach idéal. C'est parti !", de: 'Finde dein Team, deinen Spieler oder deinen idealen Trainer. Los geht\'s!' },
  },

  // LOGIN
  login: {
    welcome: { fr: 'Bienvenue !', de: 'Willkommen!' },
    create: { fr: 'Créer ton compte', de: 'Konto erstellen' },
    connect: { fr: 'Connecte-toi à ta plateforme', de: 'Melde dich bei deiner Plattform an' },
    join: { fr: 'Rejoins la communauté TeamUpFR', de: 'Tritt der TeamUpFR-Community bei' },
    connexion: { fr: 'Connexion', de: 'Anmelden' },
    inscription: { fr: 'Inscription', de: 'Registrierung' },
    email: { fr: 'Email', de: 'E-Mail' },
    password: { fr: 'Mot de passe', de: 'Passwort' },
    forgot: { fr: 'Mot de passe oublié ?', de: 'Passwort vergessen?' },
    btn_login: { fr: 'Se connecter →', de: 'Anmelden →' },
    btn_register: { fr: 'Créer mon profil →', de: 'Profil erstellen →' },
    you_are: { fr: 'Tu es…', de: 'Du bist…' },
    player: { fr: '👤 Joueur', de: '👤 Spieler' },
    coach: { fr: '🧑‍🏫 Coach', de: '🧑‍🏫 Trainer' },
    club: { fr: '🏟️ Club', de: '🏟️ Verein' },
    firstname: { fr: 'Prénom', de: 'Vorname' },
    lastname: { fr: 'Nom', de: 'Nachname' },
    clubname: { fr: 'Nom du club', de: 'Vereinsname' },
    position: { fr: 'Position', de: 'Position' },
    foot: { fr: 'Pied dominant', de: 'Starker Fuss' },
    ligue: { fr: 'Ligue', de: 'Liga' },
    zone: { fr: 'Zone', de: 'Zone' },
    age: { fr: 'Âge', de: 'Alter' },
    bio: { fr: 'Présentation courte', de: 'Kurze Vorstellung' },
    right: { fr: 'Droit', de: 'Rechts' },
    left: { fr: 'Gauche', de: 'Links' },
    both: { fr: 'Ambidextre', de: 'Beidfüssig' },
    available: { fr: '🟢 Disponible', de: '🟢 Verfügbar' },
    unavailable: { fr: '⚪ Indisponible', de: '⚪ Nicht verfügbar' },
  },

  // RECHERCHE
  search: {
    title: { fr: 'Recherche', de: 'Suche' },
    advanced: { fr: 'Avancée', de: 'Erweitert' },
    placeholder: { fr: 'Nom, position, ligue, zone…', de: 'Name, Position, Liga, Zone…' },
    btn: { fr: 'Rechercher', de: 'Suchen' },
    all: { fr: 'Tous', de: 'Alle' },
    players: { fr: '👤 Joueurs', de: '👤 Spieler' },
    coaches: { fr: '🧑‍🏫 Coachs', de: '🧑‍🏫 Trainer' },
    clubs: { fr: '🏟️ Clubs', de: '🏟️ Vereine' },
    available: { fr: '🟢 Disponible', de: '🟢 Verfügbar' },
    all_ligues: { fr: 'Toutes les ligues', de: 'Alle Ligen' },
    all_positions: { fr: 'Toutes positions', de: 'Alle Positionen' },
    all_zones: { fr: 'Toute la zone', de: 'Alle Zonen' },
    results: { fr: 'résultat', de: 'Ergebnis' },
    results_pl: { fr: 'résultats', de: 'Ergebnisse' },
    no_results: { fr: 'Aucun résultat', de: 'Keine Ergebnisse' },
    contact: { fr: '💬 Contacter', de: '💬 Kontakt' },
    profile: { fr: '👤 Profil', de: '👤 Profil' },
    dispo: { fr: 'Dispo', de: 'Verfügbar' },
    indispo: { fr: 'Indispo', de: 'Nicht verfügbar' },
  },

  // GENERAL
  general: {
    apply: { fr: 'Postuler', de: 'Bewerben' },
    message: { fr: 'Message', de: 'Nachricht' },
    save: { fr: 'Sauvegarder', de: 'Speichern' },
    cancel: { fr: 'Annuler', de: 'Abbrechen' },
    edit: { fr: '✏️ Modifier', de: '✏️ Bearbeiten' },
    logout: { fr: '🚪 Déconnexion', de: '🚪 Abmelden' },
    loading: { fr: 'Chargement…', de: 'Laden…' },
    error: { fr: 'Une erreur est survenue', de: 'Ein Fehler ist aufgetreten' },
    free: { fr: 'Gratuit', de: 'Kostenlos' },
    active: { fr: '🟢 Active', de: '🟢 Aktiv' },
    closed: { fr: '⏸ Clôturée', de: '⏸ Geschlossen' },
    pending: { fr: 'En attente', de: 'Ausstehend' },
    accepted: { fr: 'Acceptée', de: 'Akzeptiert' },
    rejected: { fr: 'Refusée', de: 'Abgelehnt' },
    accept: { fr: '✅ Accepter', de: '✅ Akzeptieren' },
    refuse: { fr: '❌ Refuser', de: '❌ Ablehnen' },
    send: { fr: 'Envoyer', de: 'Senden' },
    publish: { fr: '📢 Publier', de: '📢 Veröffentlichen' },
    see_all: { fr: 'Voir tout', de: 'Alle anzeigen' },
    back: { fr: '← Retour', de: '← Zurück' },
  },

  // FOOTER
  footer: {
    rights: { fr: 'Tous droits réservés', de: 'Alle Rechte vorbehalten' },
    languages: { fr: '🇫🇷 Français · 🇩🇪 Deutsch', de: '🇩🇪 Deutsch · 🇫🇷 Français' },
  }
}

// Helper function
export function tr(key: { fr: string; de: string }, lang: Lang): string {
  return key[lang]
}
