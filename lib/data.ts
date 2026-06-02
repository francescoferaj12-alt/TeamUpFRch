// Mock data for TeamUpFR demo
export interface Player {
  id: string;
  name: string;
  position: string;
  age: number;
  foot: 'Droit' | 'Gauche' | 'Ambidextre';
  zone: string;
  ligue: string;
  height?: number;
  weight?: number;
  available: boolean;
  rating: number;
  bio: string;
  stats: { goals: number; assists: number; matches: number; passAcc: number; avgRating: number; yellow: number };
  attributes: { dribble: number; pass: number; shot: number; speed: number; defense: number; physical: number };
  history: { club: string; period: string; ligue: string; matches?: number }[];
  videos: { title: string; duration: string }[];
  avatar: string;
}

export interface Coach {
  id: string;
  name: string;
  age: number;
  experience: number;
  license: string;
  zone: string;
  available: boolean;
  philosophy: string;
  bio: string;
  pastClubs: { club: string; role: string; period: string }[];
}

export interface Club {
  id: string;
  name: string;
  emoji: string;
  ligue: string;
  zone: string;
  founded: number;
  stadium: string;
  president: string;
  coach: string;
  email: string;
  rating: number;
  recruiting: boolean;
  description: string;
  season: { wins: number; draws: number; losses: number; rank: string };
  rosterCount: number;
}

export interface Annonce {
  id: string;
  authorId: string;
  authorName: string;
  authorType: 'club' | 'coach' | 'player';
  authorEmoji: string;
  title: string;
  body: string;
  ligue: string;
  position?: string;
  zone: string;
  status: 'active' | 'closed';
  candidatesCount: number;
  pendingCount: number;
  createdAt: string;
}

export interface Application {
  id: string;
  applicantName: string;
  applicantType: 'player' | 'coach';
  applicantDetail: string;
  applicantRating: number;
  tags: string[];
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  date: string;
  annonceId: string;
}

export const players: Player[] = [
  {
    id: 'p1',
    name: 'Lucas Martin',
    position: 'Milieu offensif',
    age: 24,
    foot: 'Droit',
    zone: 'Fribourg-Ville',
    ligue: '3ème Ligue',
    height: 178,
    weight: 73,
    available: true,
    rating: 4.7,
    bio: "Milieu offensif de 24 ans avec 6 ans d'expérience en ligues fribourgeoises. Technique, vision du jeu et présence dans les moments importants. Je cherche un club ambitieux pour progresser vers la 2ème Ligue. Disponible dès août 2025.",
    stats: { goals: 14, assists: 9, matches: 22, passAcc: 87, avgRating: 7.2, yellow: 3 },
    attributes: { dribble: 88, pass: 82, shot: 79, speed: 85, defense: 61, physical: 74 },
    history: [
      { club: 'FC Fribourg II', period: '2022 → Présent', ligue: '3ème Ligue', matches: 22 },
      { club: 'FC Marly', period: '2019 → 2022', ligue: '4ème Ligue', matches: 42 },
      { club: 'FC Fribourg Juniors', period: '2015 → 2019', ligue: 'Junior A' }
    ],
    videos: [
      { title: 'Best of 2024–25', duration: '3:42' },
      { title: 'Hat-trick vs FC Romont', duration: '2:15' },
      { title: 'Finale coupe FR', duration: '1:58' }
    ],
    avatar: '⚽'
  },
  {
    id: 'p2', name: 'Kevin Suter', position: 'Attaquant', age: 21, foot: 'Gauche', zone: 'Gruyère', ligue: '4ème Ligue',
    available: true, rating: 4.5, bio: "Attaquant rapide et efficace devant le but. Cherche un nouveau défi en 3ème ligue.",
    stats: { goals: 18, assists: 5, matches: 20, passAcc: 75, avgRating: 7.6, yellow: 2 },
    attributes: { dribble: 79, pass: 70, shot: 88, speed: 90, defense: 45, physical: 78 },
    history: [{ club: 'FC Gruyères', period: '2020 → Présent', ligue: '4ème Ligue' }],
    videos: [{ title: 'Compilation buts', duration: '4:12' }], avatar: '⚡'
  },
  {
    id: 'p3', name: 'Thomas Grandjean', position: 'Gardien', age: 30, foot: 'Droit', zone: 'Fribourg-Ville', ligue: '2ème Ligue',
    available: true, rating: 4.6, bio: "Gardien expérimenté, bon réflexes et bon dans le jeu au pied.",
    stats: { goals: 0, assists: 0, matches: 15, passAcc: 80, avgRating: 7.4, yellow: 0 },
    attributes: { dribble: 50, pass: 75, shot: 40, speed: 65, defense: 88, physical: 82 },
    history: [{ club: 'FC Fribourg', period: '2018 → Présent', ligue: '2ème Ligue' }],
    videos: [{ title: 'Best saves', duration: '3:00' }], avatar: '🥅'
  },
  {
    id: 'p4', name: 'Noa Berset', position: 'Milieu défensif', age: 18, foot: 'Droit', zone: 'Glâne', ligue: 'Junior A',
    available: true, rating: 4.2, bio: "Jeune milieu défensif souhaitant progresser vers les seniors.",
    stats: { goals: 3, assists: 7, matches: 18, passAcc: 84, avgRating: 7.1, yellow: 4 },
    attributes: { dribble: 70, pass: 78, shot: 65, speed: 72, defense: 80, physical: 71 },
    history: [{ club: 'FC Glâne', period: '2020 → Présent', ligue: 'Junior A' }],
    videos: [], avatar: '🎯'
  },
  {
    id: 'p5', name: 'Damien Kolly', position: 'Défenseur latéral', age: 25, foot: 'Droit', zone: 'Gruyère', ligue: '3ème Ligue',
    available: true, rating: 4.3, bio: "Défenseur latéral polyvalent, bonne lecture du jeu.",
    stats: { goals: 1, assists: 2, matches: 21, passAcc: 81, avgRating: 7.0, yellow: 5 },
    attributes: { dribble: 68, pass: 76, shot: 55, speed: 80, defense: 82, physical: 75 },
    history: [{ club: 'FC Bulle', period: '2021 → Présent', ligue: '3ème Ligue' }],
    videos: [], avatar: '🛡️'
  }
];

export const coaches: Coach[] = [
  {
    id: 'c1', name: 'Marco Rossi', age: 42, experience: 8, license: 'UEFA B', zone: 'Fribourg-Ville', available: true,
    philosophy: 'Possession et jeu collectif',
    bio: "8 ans d'expérience en juniors et seniors. Passionné par le développement des jeunes talents.",
    pastClubs: [
      { club: 'FC Marly', role: 'Coach principal', period: '2020 → 2024' },
      { club: 'FC Bulle Juniors', role: 'Coach adjoint', period: '2017 → 2020' }
    ]
  },
  {
    id: 'c2', name: 'Sophie Aebischer', age: 34, experience: 4, license: 'UEFA C', zone: 'Gruyère', available: true,
    philosophy: 'Jeu vertical et pressing',
    bio: "Coach Junior A avec un style de jeu offensif et organisé.",
    pastClubs: [{ club: 'FC Gruyères Juniors', role: 'Coach', period: '2021 → Présent' }]
  }
];

export const clubs: Club[] = [
  {
    id: 'club1', name: 'FC Bulle', emoji: '🦅', ligue: '3ème Ligue', zone: 'Gruyère',
    founded: 1965, stadium: 'Stade de la Condémine', president: 'Jean-Marc Berset', coach: 'Patrick Dupont',
    email: 'fcbulle@fr.ch', rating: 4.5, recruiting: true,
    description: "Club historique de la Gruyère, le FC Bulle évolue en 3ème Ligue avec une équipe ambitieuse et un esprit familial.",
    season: { wins: 8, draws: 3, losses: 2, rank: '3ème' },
    rosterCount: 24
  },
  {
    id: 'club2', name: 'SC Düdingen', emoji: '🛡️', ligue: '4ème Ligue', zone: 'Sensebezirk',
    founded: 1948, stadium: 'Sportplatz Birch', president: 'Hans Meier', coach: 'Stefan Aeby',
    email: 'sc.duedingen@fr.ch', rating: 4.1, recruiting: true,
    description: "Club traditionnel du Sensebezirk avec une excellente formation junior.",
    season: { wins: 6, draws: 4, losses: 3, rank: '5ème' },
    rosterCount: 18
  },
  {
    id: 'club3', name: 'FC Fribourg II', emoji: '⚽', ligue: '3ème Ligue', zone: 'Fribourg-Ville',
    founded: 1900, stadium: 'Stade Saint-Léonard', president: 'Alain Dubois', coach: 'Marc Schneider',
    email: 'fcfribourg@fr.ch', rating: 4.7, recruiting: false,
    description: "Réserve du FC Fribourg, formation d'élite pour jeunes joueurs.",
    season: { wins: 10, draws: 2, losses: 1, rank: '1er' },
    rosterCount: 22
  }
];

export const annonces: Annonce[] = [
  {
    id: 'a1', authorId: 'club1', authorName: 'FC Bulle', authorType: 'club', authorEmoji: '🦅',
    title: 'Recherche attaquant 3ème Ligue',
    body: "FC Bulle recherche un attaquant pour renforcer son effectif en 3ème Ligue pour la saison 2025–26. Profil expérimenté apprécié.",
    ligue: '3ème Ligue', position: 'Attaquant', zone: 'Gruyère',
    status: 'active', candidatesCount: 8, pendingCount: 3,
    createdAt: 'Il y a 2 heures'
  },
  {
    id: 'a2', authorId: 'c1', authorName: 'Marco Rossi', authorType: 'coach', authorEmoji: '🧑‍🏫',
    title: 'Coach UEFA B cherche club',
    body: "Coach certifié UEFA B cherche club pour saison 2026. 8 ans d'expérience en juniors et seniors.",
    ligue: '3ème–4ème Ligue', zone: 'Canton FR',
    status: 'active', candidatesCount: 2, pendingCount: 2,
    createdAt: 'Il y a 5 heures'
  },
  {
    id: 'a3', authorId: 'club2', authorName: 'SC Düdingen', authorType: 'club', authorEmoji: '🛡️',
    title: 'Urgent — Gardien Junior A',
    body: "Besoin d'un gardien de but pour compléter notre effectif en Junior A. Disponibilité immédiate souhaitée.",
    ligue: 'Junior A', position: 'Gardien', zone: 'Sensebezirk',
    status: 'active', candidatesCount: 5, pendingCount: 1,
    createdAt: 'Hier'
  }
];

export const applications: Application[] = [
  { id: 'app1', applicantName: 'Kevin Suter', applicantType: 'player', applicantDetail: 'Attaquant · 21 ans · 4ème Ligue · Gruyère', applicantRating: 4.5, tags: ['Attaquant', 'Pied gauche', '4ème Ligue'], message: "Bonjour, je suis très motivé pour rejoindre FC Bulle. J'ai marqué 18 buts cette saison.", status: 'pending', date: 'Il y a 1h', annonceId: 'a1' },
  { id: 'app2', applicantName: 'Lucas Martin', applicantType: 'player', applicantDetail: 'Milieu offensif · 24 ans · 3ème Ligue · Fribourg', applicantRating: 4.7, tags: ['Milieu', 'Polyvalent', '3ème Ligue'], message: "Joueur polyvalent avec expérience en 3ème ligue. Disponible dès août.", status: 'pending', date: 'Il y a 3h', annonceId: 'a1' },
  { id: 'app3', applicantName: 'Noa Berset', applicantType: 'player', applicantDetail: 'Milieu défensif · 18 ans · Junior A', applicantRating: 4.2, tags: ['Milieu', 'Junior A', 'Glâne'], message: "Je souhaite progresser vers les seniors.", status: 'pending', date: 'Hier', annonceId: 'a1' },
  { id: 'app4', applicantName: 'Thomas Grandjean', applicantType: 'player', applicantDetail: 'Gardien · 30 ans · 2ème Ligue', applicantRating: 4.6, tags: ['Gardien', 'Expérimenté'], message: "Je recherche un nouveau projet.", status: 'accepted', date: 'Il y a 2 jours', annonceId: 'a1' },
  { id: 'app5', applicantName: 'Damien Kolly', applicantType: 'player', applicantDetail: 'Défenseur · 25 ans · 3ème Ligue', applicantRating: 4.3, tags: ['Défenseur', 'Gruyère'], message: "Intéressé par un transfert.", status: 'accepted', date: 'Il y a 3 jours', annonceId: 'a1' },
  { id: 'app6', applicantName: 'Julien Morel', applicantType: 'player', applicantDetail: 'Attaquant · 23 ans · 4ème Ligue', applicantRating: 3.8, tags: ['Attaquant'], message: "Disponible pour test.", status: 'rejected', date: 'Il y a 5 jours', annonceId: 'a1' }
];

export interface Conversation {
  id: string;
  name: string;
  type: string;
  emoji: string;
  avatarClass: string;
  lastMessage: string;
  time: string;
  unread: number;
  messages: { fromMe: boolean; text: string; time: string }[];
}

export const conversations: Conversation[] = [
  {
    id: 'conv1', name: 'FC Bulle', type: 'Recrutement — Attaquant', emoji: '🦅', avatarClass: 'avatar-green',
    lastMessage: "Mercredi 14 mai à 18h30, ça te convient ?", time: '14:32', unread: 2,
    messages: [
      { fromMe: false, text: "Bonjour Lucas, nous avons consulté ton profil sur TeamUpFR. Nous sommes intéressés par ton parcours pour notre équipe en 3ème Ligue.", time: '14:20' },
      { fromMe: false, text: "Serais-tu disponible pour un essai la semaine prochaine ?", time: '14:21' },
      { fromMe: true, text: "Bonjour ! Merci pour votre message, je suis disponible et intéressé. Quand aurait lieu l'essai ?", time: '14:28' },
      { fromMe: false, text: "Mercredi 14 mai à 18h30 sur notre terrain à Bulle. Ça te convient ?", time: '14:32' }
    ]
  },
  {
    id: 'conv2', name: 'Marco Rossi', type: 'Coach UEFA B', emoji: '🧑‍🏫', avatarClass: 'avatar-red',
    lastMessage: "Tu serais partant pour un test ce weekend ?", time: '11:15', unread: 0,
    messages: [
      { fromMe: false, text: "Salut Lucas ! Je suis coach disponible et je cherche des joueurs motivés.", time: '11:00' },
      { fromMe: true, text: "Bonjour Marco ! Tu proposes quoi exactement ?", time: '11:08' },
      { fromMe: false, text: "Tu serais partant pour un test ce weekend ?", time: '11:15' }
    ]
  },
  {
    id: 'conv3', name: 'SC Düdingen', type: 'Recrutement — Gardien', emoji: '🛡️', avatarClass: 'avatar-blue',
    lastMessage: "Merci pour votre candidature !", time: 'Hier', unread: 0,
    messages: [
      { fromMe: true, text: "Bonjour, je postule pour le poste de gardien.", time: 'Hier 09:00' },
      { fromMe: false, text: "Merci pour votre candidature ! Nous étudions votre profil.", time: 'Hier 10:30' }
    ]
  },
  {
    id: 'conv4', name: 'FC Romont', type: 'Intérêt profil', emoji: '⚽', avatarClass: 'avatar-blue',
    lastMessage: "Bonjour, votre profil nous intéresse…", time: 'Lun.', unread: 1,
    messages: [
      { fromMe: false, text: "Bonjour, votre profil sur TeamUpFR nous intéresse pour notre secteur offensif.", time: 'Lun. 16:00' }
    ]
  }
];

export const ligues = [
  { group: 'Actifs', groupDe: 'Aktive', items: ['2ème Ligue', '3ème Ligue', '4ème Ligue', '5ème Ligue'] },
  { group: 'Youth League', groupDe: 'Youth League', items: ['Youth League A', 'Youth League B', 'Youth League C'] },
  { group: 'Juniors A & B', groupDe: 'Junioren A & B', items: ['Junior A Promotion', 'Junior A', 'Junior B Promotion', 'Junior B'] },
  { group: 'Juniors C', groupDe: 'Junioren C', items: ['Junior C Promotion', 'Junior C'] },
];

export const liguesHomme = [
  { group: 'Actifs Hommes', groupDe: 'Aktive Männer', items: ['2ème Ligue', '3ème Ligue', '4ème Ligue', '5ème Ligue'] },
  { group: 'Youth League', groupDe: 'Youth League', items: ['Youth League A', 'Youth League B', 'Youth League C'] },
  { group: 'Juniors Garçons', groupDe: 'Junioren', items: [
    'Juniors A - Promotion', 'Juniors A - 1er degré', 'Juniors A - 2ème degré',
    'Juniors B - Promotion', 'Juniors B - 1er degré', 'Juniors B - 2ème degré',
    'Juniors C - Promotion', 'Juniors C - 1er degré', 'Juniors C - 2ème degré',
    'Juniors D-9 - Promotion', 'Juniors D-9 - 1er degré', 'Juniors D-9 - 2ème degré', 'Juniors D-9 - 3ème degré',
  ]},
]

export const liguesFemme = [
  { group: 'Actives Femmes', groupDe: 'Aktive Frauen', items: ['2ème Ligue Féminine', '3ème Ligue Féminine', '4ème Ligue Féminine'] },
  { group: 'Juniores Filles', groupDe: 'Juniorinnen', items: ['FF-19', 'FF-17', 'FF-14', 'FF-11'] },
]

export const zones = ['Fribourg-Ville', 'Gruyère', 'Broye', 'Glâne', 'Sensebezirk', 'Veveyse', 'Lac'];

export const positions = ['Attaquant', 'Milieu offensif', 'Milieu défensif', 'Défenseur central', 'Défenseur latéral', 'Gardien'];

// Roster of FC Bulle (for club page)
export const fcBulleRoster = [
  { num: 9, name: 'Kevin Suter', pos: 'ATT', age: 21, rating: 8.2, available: true },
  { num: 10, name: 'Lucas Martin', pos: 'MIL', age: 24, rating: 7.8, available: true },
  { num: 6, name: 'Marc Etter', pos: 'DEF', age: 27, rating: 7.5, available: false },
  { num: 1, name: 'Thomas Grandjean', pos: 'GB', age: 30, rating: 8.0, available: true },
  { num: 8, name: 'Damien Kolly', pos: 'DEF', age: 25, rating: 7.2, available: true },
  { num: 11, name: 'Julien Morel', pos: 'ATT', age: 23, rating: 7.9, available: true },
  { num: 4, name: 'Yann Favre', pos: 'DEF', age: 26, rating: 7.1, available: false },
  { num: 7, name: 'Simon Brodard', pos: 'MIL', age: 22, rating: 7.6, available: true }
];
