# CLAUDE.md

Contexte projet pour Claude Code / Claude — à lire avant toute modification de ce repo.

## Le projet

**NEXUS AI** — plateforme SaaS d'automatisation marketing par IA, ciblant les entrepreneurs francophones (France, Belgique, Suisse romande), solo-founders et petites équipes. Positionnement : "L'IA Chercheur" — l'IA fait le travail de recherche/exécution pendant que le fondateur se concentre sur le revenu.

- Frontend déployé sur Vercel : **app-nexusai.com**
- Backend automation : 10 agents n8n (Manager, Leads, Email, Social Media, Ads, Shopify, Creatives, Finance, Calendar, Daily Report) hébergés sur Railway
- Base de données : Supabase (project `pgwwgwchlhmemkitrcxh`, bucket `nexus-content`)
- Paiements : Stripe (mode live)

## Structure du repo

| Fichier | Rôle |
|---|---|
| `landing.html` | Page d'accueil publique (marketing, tarifs, FAQ) |
| `index.html` | Doit rester identique à `landing.html` (duplication historique — toute modif de l'un doit être répercutée sur l'autre) |
| `login.html` | Connexion — auth réelle via Supabase (`sbClient.auth.signInWithPassword`) |
| `register.html` | Inscription — redirige vers `/Onboarding.html` après création de compte |
| `Onboarding.html` | **Le vrai dashboard vu par les utilisateurs** après login/register. Fichier volumineux, interface riche. Attention : la plupart des stats affichées (revenu, leads, budget pub, API calls) sont des données de démonstration codées en dur, marquées "(démo)" dans l'UI |
| `dashboard.html` | Dashboard alternatif, plus simple, avec **Stripe réellement fonctionnel** (3 liens de paiement Starter/Pro/Agency) et quelques stats branchées sur Supabase. **N'est actuellement lié depuis aucune autre page** — orphelin dans le parcours utilisateur |
| `vercel.json` | Config de routing Vercel |

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

## Pièges connus / dette technique

- `index.html` et `landing.html` doivent être tenus identiques manuellement (pas de build system qui les synchronise)
- `Onboarding.html` contient un badge de plan ("✦ Pro Plan") figé en dur, sans sélecteur de plan fonctionnel — aucun lien vers un vrai paiement Stripe
- `dashboard.html` a le seul flow Stripe réel du repo, mais n'est accessible par aucun lien depuis les autres pages
- Les données affichées dans `Onboarding.html` (revenu, leads, budget publicitaire, API calls) sont statiques — à ne jamais présenter comme temps réel sans vérifier le marquage "(démo)"

## Avant de committer

- Vérifier la cohérence des tarifs entre les 4 fichiers HTML si un prix est touché
- Vérifier que `index.html` et `landing.html` restent synchronisés
- Ne jamais reproduire une correction partielle sans relire le fichier final complet (préférer un remplacement intégral du fichier à des éditions ligne à ligne fragmentées)
