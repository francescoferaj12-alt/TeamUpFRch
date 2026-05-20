# Prompt pour Claude Code — Intégration design TeamUpFR

## Comment utiliser ce fichier

1. Ouvre Claude Code dans le terminal, dans le dossier de ton projet `teamupfr.ch`
2. Mets tous les fichiers HTML du design (`teamupfr_*.html`) dans un dossier `/design-mockups/` à la racine du projet
3. Copie-colle le **PROMPT 1** (Phase 1) ci-dessous dans Claude Code et lance
4. Attends qu'il finisse, valide visuellement, puis passe au PROMPT 2 (Phase 2), etc.
5. **Une page à la fois.** Jamais deux en parallèle.

---

## ⚠️ Règles d'or — À TOUJOURS dire à Claude Code

À répéter au début de **chaque** prompt :

```
RÈGLES INTANGIBLES :
1. Tu ne touches PAS au backend, aux routes API, à l'authentification, à Supabase, à i18n FR/DE, ou au data fetching.
2. Tu refactores UNIQUEMENT le visuel : couleurs, typographie, layout, composants UI.
3. Tu préserves toute la logique métier existante (state, props, fonctions, hooks).
4. Tu travailles sur UNE page à la fois. Pas de refactor global.
5. Avant chaque commit, tu testes que la page charge sans erreur et que les fonctionnalités existantes marchent.
6. Si tu ne sais pas si quelque chose est de la logique ou du visuel : tu demandes.
7. Aucun emoji dans le code ou le contenu (uniquement SVG inline).
8. Aucune mention de "gratuit", "free", ou de prix dans le contenu.
```

---

## 📋 Phase 1 — Setup du design system

### PROMPT 1 (à copier dans Claude Code)

```
RÈGLES INTANGIBLES :
1. Tu ne touches PAS au backend, aux routes API, à l'authentification, à Supabase, à i18n FR/DE, ou au data fetching.
2. Tu refactores UNIQUEMENT le visuel.
3. Tu préserves toute la logique métier existante.
4. Aucun emoji (SVG inline uniquement). Aucune mention de "gratuit".

CONTEXTE :
J'ai un projet Next.js sur teamupfr.ch (plateforme football amateur Fribourg).
Je veux refactorer le design visuel selon des maquettes que j'ai placées dans /design-mockups/.

PHASE 1 — SETUP DU DESIGN SYSTEM (ne touche pas encore aux pages)

ÉTAPE 1 : Inspection
- Lis le package.json et dis-moi : (a) quelle version de Next.js, (b) si Tailwind est installé, (c) quels autres outils de style sont présents (CSS modules, styled-components, etc.), (d) si shadcn/ui ou autre lib de composants est utilisée.
- Liste la structure des dossiers (app/ ou pages/, components/, styles/, lib/, public/).
- Identifie où sont définies les couleurs et la typographie actuelles.
- Rapporte-moi tout ça en clair avant de continuer.

ÉTAPE 2 : Inspection des maquettes
- Ouvre /design-mockups/teamupfr_apple_v20.html
- Extrait depuis la balise <style> :
  * Toutes les CSS variables (--navy, --red, --green, etc.)
  * Les imports de fonts Google (Inter + Russo One)
  * Les classes utilitaires récurrentes (.btn-primary, .nav, .container, etc.)
- Présente-moi un résumé du design system.

ÉTAPE 3 : Création des tokens
- Crée un fichier de tokens adapté à mon système de style actuel :
  * Si Tailwind est présent → étends tailwind.config.js avec les couleurs custom et les fonts
  * Si pas Tailwind → crée un fichier /styles/tokens.css avec les CSS variables au niveau :root
- Ajoute les fonts Google dans le <head> (via Next/font idéalement, sinon @import dans le CSS global).
- N'applique encore RIEN sur les pages existantes. Juste les tokens.

ÉTAPE 4 : Composants de base réutilisables
Crée ces composants dans /components/ui/ (Server Components par défaut, "use client" seulement si nécessaire) :
- <Logo /> → la marque TeamUp + F (blanc bg) + R (noir bg), texte uniquement, pas d'image
- <Button variant="primary|secondary|ghost"> → boutons cohérents avec les maquettes
- <Nav /> → la navigation fixed avec backdrop-blur (en isolant les liens du contenu)
- <Footer /> → footer 4 colonnes commun à toutes les pages
- <Container /> → wrapper max-width 1400px avec padding 32px

Important : ces composants doivent accepter des `children`, des `className` overridable, et être typés en TypeScript si le projet utilise TS.

À LA FIN DE LA PHASE 1 :
- Fais un `git status` et liste les fichiers modifiés/créés.
- Lance `npm run dev` mentalement et confirme que rien n'est cassé (les pages existantes doivent toujours charger).
- Ne touche AUCUNE page existante. Si une page utilisait déjà une nav/footer, laisse-la intacte pour l'instant.
- Récapitule ce qui a été fait et attends que je valide avant de passer à la Phase 2.
```

---

## 📋 Phase 2 — Page pilote (À propos, la plus simple)

### PROMPT 2 (à copier après validation de la Phase 1)

```
RÈGLES INTANGIBLES (rappel) :
- Pas de backend touché.
- Logique métier préservée à 100%.
- i18n FR/DE préservé.
- Pas d'emoji, pas de "gratuit".

PHASE 2 — PAGE PILOTE : /a-propos

Pourquoi celle-ci en premier : c'est la plus statique, donc on valide le design system sans risquer de casser des features.

ÉTAPE 1 : Lecture
- Lis la page actuelle (app/a-propos/page.tsx ou équivalent) et tous les composants qu'elle utilise.
- Lis /design-mockups/teamupfr_apropos.html pour comprendre le design cible.
- Identifie les éléments de logique métier (s'il y en a) : appels API, useState, useEffect, i18n keys, etc.

ÉTAPE 2 : Plan
Présente-moi un plan en pseudo-code avant de coder :
- Quelle structure JSX adopter
- Quels nouveaux composants créer (ex: <PullQuote />, <ValueCard />, <TimelineItem />)
- Comment garder l'i18n (les textes en FR/DE qui doivent rester dans tes fichiers locales/)
- Liste des fichiers que tu vas modifier/créer

ATTENDS MA VALIDATION DU PLAN AVANT DE CODER.

ÉTAPE 3 : Implémentation
- Refactore /a-propos en suivant le plan validé.
- Crée les sous-composants dans /components/about/ (ou équivalent).
- Garde tous les textes dans les fichiers i18n existants (FR + DE).
- Les SVG vont inline dans le JSX, pas dans des fichiers séparés.
- Respecte les CSS variables / classes Tailwind créées en Phase 1.

ÉTAPE 4 : Validation
- Lance le projet et vérifie : la page charge, l'i18n FR/DE marche, le responsive marche (mobile/tablet/desktop), il n'y a pas d'erreur console.
- Présente-moi la liste des changements pour que je valide visuellement.

NE COMMITE PAS encore — j'inspecterai d'abord.
```

---

## 📋 Phase 3 — Pages suivantes (workflow répétable)

À partir d'ici, **même prompt à adapter pour chaque page**. Ordre recommandé :

| Ordre | Page | Maquette | Note |
|---|---|---|---|
| 1 | `/a-propos` | `teamupfr_apropos.html` | Pilote — fait en Phase 2 |
| 2 | `/faq` | `teamupfr_faq.html` | Statique + accordéons JS |
| 3 | `/privacy` | `teamupfr_privacy.html` | Statique |
| 4 | `/cgu` | `teamupfr_cgu.html` | Statique |
| 5 | `/login` | `teamupfr_login.html` | ⚠️ Garde la logique d'auth existante |
| 6 | `/recherche` | `teamupfr_recherche.html` | ⚠️ Garde les filtres et la query DB |
| 7 | `/clubs` | `teamupfr_clubs.html` | ⚠️ Garde la query DB |
| 8 | Détail club | `teamupfr_club_detail.html` | ⚠️ Route dynamique `/clubs/[slug]` |
| 9 | `/annonces` | `teamupfr_annonces.html` | ⚠️ Garde le real-time |
| 10 | `/dashboard` | `teamupfr_dashboard.html` | ⚠️ Garde l'auth-guard + queries user |
| 11 | `/candidatures` | `teamupfr_candidatures.html` | ⚠️ Garde le state des statuts |
| 12 | Home `/` | `teamupfr_apple_v20.html` | **EN DERNIER** (vidéo + images) |

### PROMPT 3 (template à dupliquer pour chaque page)

```
RÈGLES INTANGIBLES (rappel) :
- Backend, API, auth, Supabase, i18n : INTOUCHABLE
- Pas d'emoji, pas de "gratuit"

PHASE 3 — PAGE : [REMPLACE PAR LE NOM, ex: /faq]
Maquette de référence : /design-mockups/[REMPLACE PAR LE FICHIER, ex: teamupfr_faq.html]

ÉTAPE 1 : Audit
- Lis la page actuelle et liste TOUS les éléments de logique métier que tu DOIS préserver (queries, mutations, state, hooks, i18n, redirects, middleware).
- Présente-moi la liste avant de toucher au code.

ÉTAPE 2 : Plan
- Décris la nouvelle structure JSX
- Liste les nouveaux composants à créer (réutilise au max ceux des phases précédentes)
- Confirme comment l'i18n FR/DE est conservé

ATTENDS MA VALIDATION AVANT DE CODER.

ÉTAPE 3 : Code
- Refactore la page
- Préserve TOUTE la logique listée à l'étape 1
- Tests : la page doit charger, l'i18n doit marcher, le responsive doit être bon

ÉTAPE 4 : Rapport
- Liste les fichiers créés/modifiés
- Confirme que les features existantes marchent toujours
- Attends ma validation avant le prochain prompt
```

---

## 🚨 Quand DEMANDER UNE PAUSE à Claude Code

Si Claude Code commence à :
- Modifier ton schema Supabase ou tes migrations → **STOP**
- Toucher à middleware.ts ou auth.config.ts → **STOP**
- Changer des fichiers dans /api/ → **STOP**
- Modifier next.config.js de manière non-triviale → **STOP**
- Vouloir refactorer plusieurs pages d'un coup → **STOP**

Dis-lui simplement : *"Tu sors du scope. Reviens uniquement sur le visuel de la page X."*

---

## ✅ Checklist après chaque page refactorée

- [ ] La page charge sans erreur console
- [ ] L'i18n FR/DE switch fonctionne toujours
- [ ] Le responsive marche sur mobile (< 600px), tablet (< 900px), desktop
- [ ] Les liens internes pointent toujours vers les bonnes routes
- [ ] L'auth (si applicable) fonctionne toujours
- [ ] Les forms (si applicable) soumettent toujours correctement
- [ ] Aucun emoji apparu par erreur
- [ ] Aucune mention de "gratuit"
- [ ] Le build de prod passe : `npm run build`

Si tout est OK → commit avec un message clair (ex: `feat(design): refactor /faq with new design system`).

Si non → demande à Claude Code de corriger AVANT de passer à la page suivante.

---

## 🎨 Référence rapide du design system

| Élément | Valeur |
|---|---|
| Navy principal | `#0D1F4A` |
| Navy profond | `#081434` |
| Navy clair | `#1a2f6b` |
| Rouge accent | `#FF3A3A` |
| Vert (success/live) | `#2ED27F` |
| Orange (warning) | `#FF9A3A` |
| Bleu (info) | `#3A7AFF` |
| Font body | Inter (200-800) |
| Font display | Russo One |
| Easing standard | `cubic-bezier(0.22, 1, 0.36, 1)` |
| Max-width container | `1400px` (1200px pour pages légales) |
| Border radius cards | `20px` (16px pour petits éléments) |
| Border subtle | `rgba(255,255,255,0.12)` |

---

**Bonne chance ! Avance lentement, valide chaque page visuellement, et n'hésite pas à dire STOP à Claude Code si quelque chose te paraît bizarre.**
