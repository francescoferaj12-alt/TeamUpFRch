# ⚽ TeamUpFR

> **Ton équipe, ton avenir** — La plateforme du football amateur du canton de Fribourg.

TeamUpFR connecte joueurs, coachs et clubs amateurs du canton de Fribourg en Suisse. Pensez-le comme un LinkedIn dédié au football local : profils détaillés, annonces de recrutement, messagerie intégrée, candidatures avec workflow complet.

---

## 🚀 Stack technique

- **Next.js 14** (App Router)
- **React 18** + **TypeScript**
- **CSS Modules** (zero dépendances UI lourdes — performance maximale)
- Police : **Outfit** (corps) + **Bebas Neue** (titres)
- Déploiement : **Vercel** (zero-config)

---

## 📂 Structure du projet

```
teamupfr/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Layout racine + navbar + footer
│   ├── page.tsx              # 🏠 Page d'accueil
│   ├── login/page.tsx        # 🔐 Connexion / Inscription
│   ├── profil/page.tsx       # 👤 Profil joueur (stats + highlights)
│   ├── recherche/page.tsx    # 🔍 Recherche avancée avec filtres
│   ├── messages/page.tsx     # 💬 Messagerie temps réel
│   ├── club/[slug]/page.tsx  # 🏟️ Page club dynamique
│   ├── dashboard/page.tsx    # ⚙️ Dashboard admin du club
│   ├── candidatures/page.tsx # 📋 Gestion des candidatures
│   └── annonces/page.tsx     # 📢 Redirection vers le dashboard
├── components/
│   ├── Navbar.tsx            # Navigation principale
│   └── Logo.tsx              # Logo TeamUpFR
├── lib/
│   └── data.ts               # Mock data (joueurs, clubs, annonces…)
├── styles/
│   └── globals.css           # Design system complet
├── package.json
├── next.config.js
├── tsconfig.json
└── vercel.json
```

---

## 🎨 Design System

Variables CSS centralisées dans `styles/globals.css` :

| Token | Valeur |
|---|---|
| `--blue-dark` | `#0a1f5c` (logo principal) |
| `--blue-bright` | `#1a6fd4` |
| `--red` | `#e02020` (accents, CTAs) |
| `--green` | `#0d7a36` |
| `--font-display` | Bebas Neue |
| `--font-body` | Outfit |

---

## ⚡ Démarrage local

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer le serveur de développement
npm run dev

# 3. Ouvrir http://localhost:3000
```

---

## 🌍 Déploiement sur Vercel

### Option A — Via l'interface web (le plus simple)

1. Crée un compte sur [vercel.com](https://vercel.com)
2. Pousse ce projet sur GitHub :
   ```bash
   git init
   git add .
   git commit -m "Initial commit — TeamUpFR"
   git branch -M main
   git remote add origin https://github.com/TON_USERNAME/teamupfr.git
   git push -u origin main
   ```
3. Sur Vercel : **New Project** → importe ton repo GitHub
4. Vercel détecte automatiquement Next.js → clique **Deploy**
5. Ton site est en ligne en ~60 secondes 🎉

### Option B — Via la CLI Vercel

```bash
# Installer la CLI
npm i -g vercel

# Déployer (depuis le dossier teamupfr/)
vercel

# Production deploy
vercel --prod
```

### Configuration Vercel

Aucune variable d'environnement requise (mock data en local). Build command par défaut : `next build`.

---

## 📱 Fonctionnalités

### ✅ Implémenté

- [x] Page d'accueil avec hero, annonces et ligues
- [x] Connexion / Inscription avec sélecteur de rôle (Joueur / Coach / Club)
- [x] Profil joueur complet (stats, attributs, highlights vidéo, parcours, ratings)
- [x] Recherche avancée avec filtres dynamiques (type, ligue, position, zone, âge)
- [x] Messagerie temps réel avec 4+ conversations et réponse simulée
- [x] Page club dynamique (FC Bulle, SC Düdingen, FC Fribourg) avec roster et annonces
- [x] Dashboard admin avec KPIs, activité, formulaire de publication d'annonce
- [x] Gestion complète des candidatures (En attente / Accepter / Refuser)
- [x] Design responsive (mobile-first)
- [x] Multilingue prêt (FR / IT / DE)

### 🛣️ Roadmap

- [ ] Backend réel (Supabase ou Firebase)
- [ ] Authentification (NextAuth.js + Google OAuth)
- [ ] Upload de vidéos (Cloudinary / Vimeo)
- [ ] Notifications push (Web Push API + Service Worker)
- [ ] App mobile (React Native ou Capacitor)
- [ ] Système de notation post-match
- [ ] Intégration calendrier des matchs

---

## 🏆 Ligues couvertes

- **Seniors** : 2ème, 3ème, 4ème, 5ème Ligue
- **Youth League** : A, B, C
- **Juniors A** : Promotion + Standard
- **Juniors B** : Promotion + Standard
- **Juniors C** : Promotion + Standard

---

## 📄 Licence

© 2025 TeamUpFR — Tous droits réservés.
Projet créé pour le canton de Fribourg, Suisse 🇨🇭

---

**Questions ?** Ouvre une issue ou contacte-nous via la plateforme.

⚽ Bon foot à tous !
