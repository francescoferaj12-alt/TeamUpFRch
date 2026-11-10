# 🚀 Guide de déploiement — TeamUpFR

## État réel — 10 novembre 2026

Le site utilise déjà Supabase (Auth, base de données et stockage), Resend et Sentry.
Les « prochaines étapes » historiques ci-dessous ne décrivent plus l'état actuel.

- Dernière publication directe vérifiée : `dpl_AvZHFZgWx8svjkDuPzQRNwUwVyPH`, projet `team-up-f-rch` (`prj_1sTKe47g53VCfpomVNDOWNJYeivM`), domaines `teamupfr.ch` et `www.teamupfr.ch`. Une publication GitHub ultérieure peut remplacer cet identifiant ; consulter le déploiement de production actuel dans Vercel.
- Prévisualisation contrôlée : `dpl_7KLpWrmSdg6ZNPchJKAm9obn7q1B`.
- Les corrections ont d'abord été publiées depuis les fichiers de ce dossier, puis préparées pour synchronisation GitHub depuis la base `ebd9529ca8eb14f0b36e477372870b2c8aebbb3f`. **Conserver les lectures via `public_profiles` dans les prochaines versions.** Un retour au code précédent casserait les lectures publiques après la restriction de confidentialité.
- Exécution Vercel : Node 24. Dépendances : Next 15.5.29, React 19.3.1, PostCSS 8.5.32 via override de sécurité.

### Migrations appliquées à Supabase

Projet `iupcllegqqpmhxadcxqd`, dans cet ordre :

1. `20261110_public_profiles_privacy.sql` : projection publique en lecture seule, sans email privé, téléphone privé, date de naissance ni préférences de notification.
2. `20261110_profile_verification_guard.sql` : empêche l'auto-vérification ; autorise le serveur et l'administrateur à vérifier les clubs.
3. Après publication du frontend compatible, `20261111_private_profile_access.sql` : lecture des profils privés réservée au propriétaire et à l'administrateur.
4. `20261110155134_media_and_message_access.sql` : remplacement des médias du propriétaire, pièces jointes privées de 20 Mo maximum, contenu des messages et identité des candidats non modifiables par le destinataire.
5. `20261110155834_prevent_self_accepted_applications.sql` : candidature initialement en attente et message initialement non lu, même via un appel direct à l'API.

`public_profiles` est volontairement une vue SECURITY DEFINER : elle expose seulement les colonnes publiques des profils visibles (clubs approuvés uniquement). L'[avertissement Supabase correspondant](https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view) est attendu. Ne pas passer cette vue à SECURITY INVOKER sans repenser la lecture publique. INSERT/UPDATE/DELETE sont révoqués pour anon et authenticated.

### Contrôles effectués

- `npm run build`, `npx tsc --noEmit` et `git diff --check` réussis ; avertissements de lint encore présents.
- `node --test tests/security.test.cjs` : 11 tests réussis, avec adaptateurs de base, de stockage et d'email simulés, sans envoi réel.
- `tests/database-permissions.sql` : 11 vérifications réussies sous les rôles des participants et d'un tiers ; fixtures intégralement annulées par ROLLBACK, aucune communication envoyée ni donnée de test conservée.
- Après migration : anon voit 0 profil privé et 11 profils publics ; un membre voit son seul profil privé et 0 profil privé tiers ; l'administrateur voit les 12 profils.
- Écriture via la vue publique interdite. Tests transactionnels de vérification administrateur et de refus d'auto-vérification réussis, sans modifications conservées des comptes.
- Production : `/api/health` répond 200 avec base connectée ; `/api/clubs` retourne les 3 clubs approuvés ; les notifications et créations de candidatures anonymes répondent 401.
- Vérification dans le navigateur intégré : recherche avec 11 profils, profil public d'un joueur accessible, 5 annonces chargées et lien de messagerie redirigeant un visiteur non connecté vers la connexion.
- Les pièces jointes stockent un chemin privé et obtiennent un lien temporaire d'une heure, renouvelé lorsque la page redevient visible et toutes les 45 minutes. Un envoi de message refusé conserve le brouillon. La page générale d'administration renvoie les clubs vers leur procédure dédiée pour garder badge et approbation cohérents.

### Points restant à vérifier ou corriger

- `npm audit` : 0 critique, 0 élevée, 10 modérées dans les dépendances de construction/lint (glob, minimatch et dépendants).
- Sentry : le build aboutit, mais l'envoi des source maps affiche « Project not found ». Vérifier la correspondance organisation/projet et les droits du jeton ; la réception réelle des erreurs n'est pas validée.
- Supabase signale la [protection contre les mots de passe compromis](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) comme désactivée. Aucun abonnement n'a été modifié.
- Livraison réelle des emails, parcours complets avec deux comptes connectés et revue mobile exhaustive non validés par ces tests. Les tests ne constituent pas une garantie de fonctionnement à 100 %.

---

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
