# 🚀 Guide de déploiement — TeamUpFR

Ce guide t'accompagne pas-à-pas pour mettre ton projet en ligne sur Vercel en moins de 5 minutes.

---

## 📋 Pré-requis

- **Node.js 18+** installé ([télécharger](https://nodejs.org))
- Un compte **GitHub** (gratuit)
- Un compte **Vercel** (gratuit) — connecté à GitHub

---

## 🏠 Étape 1 — Tester en local

Décompresse le ZIP, puis dans le terminal :

```bash
cd teamupfr
npm install
npm run dev
```

Ouvre http://localhost:3000 — le site doit fonctionner ✅

---

## ☁️ Étape 2 — Pousser sur GitHub

```bash
# Initialiser git
git init
git add .
git commit -m "🚀 Initial commit — TeamUpFR"

# Créer un repo sur github.com (vide, sans README)
# Puis lier le repo local
git branch -M main
git remote add origin https://github.com/TON_USERNAME/teamupfr.git
git push -u origin main
```

---

## ⚡ Étape 3 — Déployer sur Vercel

1. Connecte-toi sur **[vercel.com](https://vercel.com)** avec ton compte GitHub
2. Clique **"Add New… → Project"**
3. Sélectionne ton repo `teamupfr`
4. Vercel détecte automatiquement **Next.js** — laisse les paramètres par défaut
5. Clique **"Deploy"**

⏱️ Build : ~60 secondes.

🌐 Ton site est en ligne sur `https://teamupfr-xxx.vercel.app`

---

## 🌍 Étape 4 (optionnel) — Domaine personnalisé

Dans le dashboard Vercel : **Settings → Domains** → ajoute ton domaine (ex. `teamupfr.ch`).
Vercel te donne les DNS à configurer chez ton registrar.

---

## 🔄 Mises à jour automatiques

Chaque `git push` sur la branche `main` redéploie automatiquement le site.
Pas besoin de redéployer manuellement.

```bash
# Modifier un fichier
git add .
git commit -m "✨ Nouvelle fonctionnalité"
git push
# → Vercel redéploie automatiquement en ~30 secondes
```

---

## 🆘 Problèmes courants

**Build échoue ?** Vérifie les logs sur Vercel — souvent une erreur TypeScript.
Lance `npm run build` en local pour reproduire et corriger.

**Page 404 ?** Vérifie que les noms de fichiers `page.tsx` sont en minuscules.

**Polices Google bloquées ?** Aucun action requise — Next.js gère ça automatiquement.

---

## 🎯 Prochaines étapes

1. **Authentification réelle** — intègre [NextAuth.js](https://next-auth.js.org/)
2. **Backend** — connecte [Supabase](https://supabase.com) (gratuit, PostgreSQL + auth + storage)
3. **Upload vidéos** — utilise [Cloudinary](https://cloudinary.com) ou [Mux](https://mux.com)
4. **Analytics** — active [Vercel Analytics](https://vercel.com/analytics) en 1 clic

---

Bon déploiement ! ⚽
