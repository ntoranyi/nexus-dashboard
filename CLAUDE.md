# CLAUDE.md

Contexte projet pour Claude Code / Claude — à lire avant toute modification de ce repo.

## Le projet

**NEXUS AI** — plateforme SaaS d'automatisation marketing par IA, ciblant les entrepreneurs francophones (France, Belgique, Suisse romande), solo-founders et petites équipes. Positionnement : "L'IA Chercheur" — l'IA fait le travail de recherche/exécution pendant que le fondateur se concentre sur le revenu.

- Frontend déployé sur Vercel : **app-nexusai.com**
- Backend automation : 10 agents n8n (Manager, Leads, Email, Social Media, Ads, Shopify, Creatives, Finance, Calendar, Daily Report) hébergés sur Railway
- Base de données : Supabase (project `pgwwgwchlhmemkitrcxh`, bucket `nexus-content`)
- Paiements : Stripe (mode live)

## Mémoire de travail

Le repo [ntoranyi/nexus-ai-knowledge](https://github.com/ntoranyi/nexus-ai-knowledge) (privé) sert de vault Obsidian + journal de travail pour l'ensemble du projet NEXUS AI (dashboard, n8n, formation NAIOM...). Voir `MEMOIRE.md` à sa racine avant de redémarrer une tâche déjà entamée, pour éviter de répéter du travail ou de re-découvrir un contexte déjà établi.

## Structure du repo

| Fichier | Rôle |
|---|---|
| `landing.html` | Page d'accueil publique (marketing, tarifs, FAQ) |
| `index.html` | Doit rester identique à `landing.html` (duplication historique — toute modif de l'un doit être répercutée sur l'autre) |
| `login.html` | Connexion — auth réelle via Supabase (`sbClient.auth.signInWithPassword`), redirige vers `/dashboard.html` |
| `register.html` | Inscription — redirige vers `/dashboard.html` (ou affiche un message de confirmation email si la confirmation Supabase est requise, voir plus bas) |
| `dashboard.html` | **Le dashboard principal vu par les utilisateurs** après login/register (décision produit du 2026-09-11). Interface épurée, session Supabase réelle (`profiles.plan`), **Stripe réellement fonctionnel** (3 liens de paiement Starter/Pro/Agency), stats leads/emails branchées sur Supabase. Contient un lien "🚀 Automations & AI content" vers `Onboarding.html` |
| `Onboarding.html` | Fonctionnalités avancées (Automations, Campagnes, Analytics, générateur de contenu IA, E-commerce, Affiliation, Ads Budget) — accessible depuis `dashboard.html` mais n'est plus la page d'atterrissage par défaut. Session Supabase réelle (garde d'authentification, nom/plan réels dans la sidebar). Fichier volumineux. Attention : la plupart des stats affichées (revenu, leads, budget pub, API calls) restent des données de démonstration codées en dur, marquées "(démo)" dans l'UI |
| `vercel.json` | Config de routing Vercel |

## Vidéos (HyperFrames) — dossier `video/`

Projets vidéo verticaux 1080x1920 (Reels/TikTok) réalisés avec HyperFrames (HTML + GSAP → MP4). Exclus du déploiement Vercel via `.vercelignore`.

| Projet | Usage | Règles de montage |
|---|---|---|
| `video/nexus-ai-reels/` | Contenu NEXUS AI — style « Bureaucratic Alert » (noir/orange, motion marqué) | `video/nexus-ai-reels/nexus-ai-style.md` |
| `video/shopify-produits/` | Vidéos produits boutique NextGen AI Make — style épuré, produit héros, peu de texte | `video/shopify-produits/shopify-produits-style.md` |

- Quand l'utilisateur dit **« garde ça en mémoire »** à propos d'un montage, ajouter la règle (datée, une ligne) dans la section adéquate (sous-titres / sound design / règles de coupe / autres) du fichier de style du projet concerné, puis committer. Relire ce fichier avant tout nouveau montage.
- Setup d'une nouvelle session : `npm i -g hyperframes && hyperframes browser ensure && hyperframes skills update` (+ `ffmpeg` via apt). Prévisualisation : `hyperframes preview --background` dans le dossier du projet. Vérification : `hyperframes check`.
- Polices et GSAP sont embarqués dans `assets/` (le CDN jsdelivr est bloqué dans les conteneurs Claude Code cloud).

## Grille tarifaire (source de vérité)

- **Starter** — 27€/mois
- **Pro** — 67€/mois (mis en avant comme le plan recommandé)
- **Agency** — 147€/mois

Cette grille doit être strictement identique partout : `landing.html`, `index.html`, `Onboarding.html`, `dashboard.html`, et les produits/liens Stripe correspondants. Toute modification de prix doit être répercutée dans les 4 fichiers HTML + Stripe.

## Charte de marque (voir aussi README.md)

- Palette : fond navy `#0a0a1a`, accent violet `#7c5cfc`, accent cyan `#00d4ff`, dégradé signature violet→cyan à utiliser avec parcimonie
- Typographie : éviter Inter par défaut sur les titres, privilégier une police à caractère (display/géométrique)
- Éviter les anti-patterns IA génériques : cards dans des cards, icônes rondes au-dessus de chaque titre, dégradés violet-bleu non maîtrisés
- Dashboard → registre "Product" (clarté, densité assumée façon Linear/Stripe). Site vitrine → registre "Brand" (impact visuel, contraste fort)

## Auth & données réelles (Supabase)

- Table `profiles` (id, email, prenom, plan) créée automatiquement par le trigger Postgres `handle_new_user()` sur `auth.users`. **`plan` vaut `'free'` par défaut** (migration `default_plan_free_on_signup`, 2026-09-11) — ne jamais remettre `'starter'` par défaut, sinon un utilisateur non payant redevient indiscernable d'un abonné Starter réel.
- `dashboard.html` et `Onboarding.html` vérifient tous les deux la session Supabase au chargement et redirigent vers `/login.html` si non connecté — ne pas retirer ces gardes.
- Le webhook Stripe (`api/stripe-webhook.js`) met à jour `profiles.plan` sur `checkout.session.completed`, en mappant le montant payé à `starter`/`pro`/`agency` (`PLAN_BY_AMOUNT`). Toute modif de prix côté Stripe doit être répercutée dans ce mapping.
- **La confirmation email est activée** sur le projet Supabase. `register.html` et `login.html` gèrent ce cas (message "Vérifie ta boîte mail" / détection de l'erreur "Email not confirmed") — ne pas régresser cette UX. Le service email intégré de Supabase a un quota d'envoi bas (quelques emails/heure) ; en cas de test répété ou de pic d'inscriptions réel, prévoir un SMTP externe (Resend, SendGrid...).

## Pièges connus / dette technique

- `index.html` et `landing.html` doivent être tenus identiques manuellement (pas de build system qui les synchronise)
- Les données affichées dans `Onboarding.html` (revenu, leads, budget publicitaire, API calls) restent statiques — à ne jamais présenter comme temps réel sans vérifier le marquage "(démo)"
- `dashboard.html` ne propose que 2 états (verrouillé / débloqué complet) alors qu'il existe 4 plans (free/starter/pro/agency) — un utilisateur Starter voit la même vue verrouillée qu'un utilisateur gratuit, ce qui ne reflète pas exactement les features vendues pour Starter dans la modale de paiement

## Avant de committer

- Vérifier la cohérence des tarifs entre les 4 fichiers HTML si un prix est touché
- Vérifier que `index.html` et `landing.html` restent synchronisés
- Ne jamais reproduire une correction partielle sans relire le fichier final complet (préférer un remplacement intégral du fichier à des éditions ligne à ligne fragmentées)
