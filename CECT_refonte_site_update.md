# Refonte du site CECT Togo — Brief de développement

Version 2.0 — 8 octobre 2026 — aligné sur le **Cahier des charges + Dossier de conception CECT / YEM v4.0 (7 octobre 2026)**

## Sommaire

- [0. À lire en premier](#0-à-lire-en-premier)
- [1. Présentation de la CECT](#1-présentation-de-la-cect)
- [2. Ce que le cahier v4.0 change](#2-ce-que-le-cahier-v40-change)
- [3. L'ancien site (pour mémoire)](#3-lancien-site-pour-mémoire)
- [4. Mission de cette phase : le site public](#4-mission-de-cette-phase--le-site-public)
- [5. Architecture et stack technique](#5-architecture-et-stack-technique)
- [6. Design : logo, couleurs, verre, icônes](#6-design--logo-couleurs-verre-icônes)
- [7. Langues : français (principal) et anglais](#7-langues--français-principal-et-anglais)
- [8. Règles de contenu et de vocabulaire](#8-règles-de-contenu-et-de-vocabulaire)
- [9. Responsive et accessibilité](#9-responsive-et-accessibilité)
- [10. Sécurité côté frontend](#10-sécurité-côté-frontend)
- [11. Tests et critères d'acceptation de la phase](#11-tests-et-critères-dacceptation-de-la-phase)
- [12. Ordre de travail et livrables](#12-ordre-de-travail-et-livrables)
- [13. Points encore ouverts](#13-points-encore-ouverts)
- [14. Prompt de démarrage pour Claude](#14-prompt-de-démarrage-pour-claude)

## 0. À lire en premier

Ce fichier est destiné à **Claude (ou tout développeur)** chargé de construire le nouveau site. Il doit être lu avec trois fichiers :

| Fichier | Rôle |
|---|---|
| `Cahier_des_charges_CECT_YEM_final_v4.0.docx` | **Référence fonctionnelle et technique.** Il fait foi sur les règles métier, les rôles, les API, la sécurité et les tests. |
| `CECT_refonte_site.md` (ce fichier) | Traduit le cahier en consignes concrètes pour **la phase en cours : le site public**. Il ajoute les choix de l'équipe : React + TypeScript, barre en verre, icônes sans emoji, bilingue FR/EN. |
| `logo-officiel-cect.jpeg` | Logo officiel de la coopérative (voir section 6). |

**Ordre de priorité en cas de contradiction :**

1. Le cahier des charges v4.0.
2. Ce brief.
3. L'ancien site scoopcectogo.com, qui sert seulement de référence de contenu.

Exception : les choix de l'équipe listés ci-dessus (React + TypeScript, verre, icônes, FR/EN) s'appliquent même si le cahier ne les mentionne pas. Ils ne le contredisent pas.

**Principe directeur repris du cahier :** la plateforme impose l'intégrité et la traçabilité ; la coopérative configure les prix, taux, quotas et règles. **Aucun chiffre économique n'est écrit en dur dans le code.**

## 1. Présentation de la CECT

La **Coopérative d'Entraide Communautaire du Togo (CECT)** est une coopérative basée à Lomé. Sa devise est « Un Togo plus fort ensemble ». Sa mission est de bâtir une **économie sociale et solidaire** fondée sur l'entraide, l'échange, la responsabilité et la création de valeur au bénéfice de la communauté.

### Le YEM

Le **YEM** est une monnaie numérique **externe** à la CECT, gérée dans l'écosystème **YEMPay / YEM Foundation**. Chaque utilisateur y est identifié par son **Pernum**, et chaque entreprise par un **Pernum Business**. Le YEM n'a pas cours légal au Togo.

La plateforme CECT **n'est ni un portefeuille ni une blockchain YEM**. Les transferts réels de YEM se font hors de la plateforme. La plateforme sert à organiser et à tracer :

- les adhésions et les packs ;
- les quotas et les droits d'usage ;
- les intentions de transaction ;
- les validations ;
- les contre-valeurs en FCFA ;
- les preuves.

### Qui peut adhérer

| Type | Données principales | Adhésion initiale |
|---|---|---|
| Personne physique | Nom, prénoms, Pernum, téléphone, e-mail, mot de passe | 25 000 FCFA |
| Personne morale | Raison sociale, statut juridique, gérant / représentant, Pernum Business, téléphone, e-mail, mot de passe | 200 000 FCFA |

Ces montants sont configurables et historisés.

### Les quatre familles de packs

| Famille | À quoi elle sert |
|---|---|
| **Vendeur** | Vendre des YEM à la CECT dans une limite périodique (quota). Formules V1 à V12. |
| **Consommateur** | Disposer d'un volume de YEM utilisable chez les marchands du réseau, avec une remise (2 à 5 % envisagés, à confirmer). Formules C1 à C8. |
| **Personnel** | Acheter et consommer des YEM au besoin, sans quota ni durée fixe. |
| **Marchand** | Pour une personne morale : accepter les YEM des clients (QR marchand) et les rééchanger auprès de la CECT. Formules M1 à M10. |

Un compte peut détenir au maximum **deux packs structurés actifs**, le Pack Personnel ne comptant pas dans cette limite. Ce plafond est lui-même un paramètre.

### Cours de travail (à confirmer par le CA, toujours configurables)

| Opération | Valeur |
|---|---|
| Achat | 500 F / YEM |
| Vente | 650 F / YEM |
| Cession | 610 F / YEM |

### Les acteurs

Rôles internes :

- **Utilisateur**
- **Administrateur**
- **Superadmin**
- **Validateur** : confirme l'arrivée réelle des YEM sur le Pernum CECT.
- **Comptabilité** : suit les paiements en FCFA.

Système externe : **YEMPay / YEM Foundation**.

## 2. Ce que le cahier v4.0 change

| Sujet | Ancien site | Cahier v4.0 (fait foi) |
|---|---|---|
| Adhésion personne morale | 50 000 FCFA | **200 000 FCFA** |
| Personne morale | Dénomination, statut juridique | + **gérant / représentant**, **Pernum Business** (RCCM / NIF à confirmer) |
| E-mail | Facultatif | **Obligatoire**, vérifié par **code à usage unique (OTP)** |
| Activation du compte | Fiche papier signée + validation manuelle | Paiement via un **prestataire de paiement (PSP, FedaPay envisagé)** ; le compte devient `ACTIVE` **uniquement** après confirmation serveur (webhook) |
| Cours du YEM | 650 F vente / 520 F rachat | **Achat 500 F, vente 650 F, cession 610 F** (à confirmer) |
| Remise consommateur | 15 % | **2 à 5 %** envisagés, à confirmer |
| Packs | 6 packs C1 à C6 (prix → YEM) | **4 familles** : Vendeur V1–V12, Consommateur C1–C8, Personnel, Marchand M1–M10, versionnées et configurables |
| Back-end | PHP sur mesure | **Laravel / PHP + MySQL**, API versionnée `/api/v1` |
| Rôles | Membre, admin | Utilisateur, Administrateur, Superadmin, Validateur, Comptabilité |

Conséquence pour le site public : **ne reprendre aucun chiffre de l'ancien site** (15 %, 520 F, packs C1–C6 à 100 000 F…). Les valeurs viennent de l'API ou de fichiers de données provisoires, marqués comme tels.

## 3. L'ancien site (pour mémoire)

- **Technologie :** PHP sur mesure, page d'accueil en une seule page avec ancres, mode sombre, reCAPTCHA et champ pot de miel sur l'inscription.
- **Pages :** `acceuil.php`, `inscription.php`, `login.php` (connexion par Pernum), `mot_de_passe_oublie.php` (Pernum + e-mail).
- **Contenus à reprendre et réécrire :** mission et valeurs, présentation du YEM, « comment ça marche », services (épargne et consommation, assistance et conseil, investissement, formation, entraide), contact (+228 90 14 42 04, +228 90 04 15 17, Lomé).
- **Défauts à ne pas reproduire :**
  - chiffres incohérents et écrits en dur ;
  - aucun document officiel ni aucune identité juridique ;
  - e-mail ProtonMail ;
  - liens réseaux sociaux vides ;
  - emojis à la place d'icônes ;
  - une seule langue ;
  - mauvais référencement.

## 4. Mission de cette phase : le site public

### 4.1 À construire maintenant

Le cahier (section 1) définit trois espaces : **site public**, **espace Utilisateur**, **back-office**. Cette phase couvre **le site public uniquement**, avec les écrans d'inscription et de connexion.

| Page | Route FR | Route EN | Contenu |
|---|---|---|---|
| Accueil | `/` | `/en` | Héros, mission, aperçu du YEM, des 4 familles de packs et des services, appel à l'adhésion |
| Le YEM | `/le-yem` | `/en/yem` | Ce qu'est le YEM, rôle de YEMPay, Pernum, ce que fait (et ne fait pas) la plateforme, mention « pas de cours légal », FAQ |
| Packs | `/packs` et `/packs/:famille` | `/en/packs`… | Les 4 familles, leurs formules, la limite de 2 packs structurés. Données issues de `GET /api/v1/packs` |
| Adhésion | `/adhesion` | `/en/membership` | Conditions, montants (personne physique / morale), étapes, documents nécessaires |
| Comment ça marche | `/comment-ca-marche` | `/en/how-it-works` | Parcours simplifiés : vendre à la CECT, payer un marchand, rééchange marchand (sans détail interne) |
| Services | `/services` | `/en/services` | Épargne et consommation, assistance et conseil, investissement, formation, entraide |
| Marchands partenaires | `/partenaires` | `/en/partners` | Annuaire des marchands acceptant le YEM (données provisoires) |
| Qui sommes-nous | `/a-propos` | `/en/about` | Mission, valeurs, gouvernance (CA), équipe |
| Documents officiels | `/documents` | `/en/documents` | Statuts, règlement intérieur, références juridiques (liens PDF) |
| Actualités | `/actualites` | `/en/news` | Articles (contenu provisoire) |
| FAQ | `/faq` | `/en/faq` | Accordéon |
| Contact | `/contact` | `/en/contact` | Formulaire, téléphones, e-mail, adresse, carte, WhatsApp |
| Inscription | `/inscription` | `/en/register` | Parcours en étapes (voir 4.2) |
| Connexion | `/connexion` | `/en/login` | Identifiant + mot de passe (voir 4.3) |
| Mot de passe oublié | `/mot-de-passe-oublie` | `/en/forgot-password` | Demande de réinitialisation |
| Pages légales | `/mentions-legales`, `/confidentialite`, `/conditions` | `/en/legal-notice`, `/en/privacy`, `/en/terms` | Textes juridiques |
| 404 | `*` | `*` | Page introuvable |

### 4.2 Parcours d'inscription (cahier, section 3)

1. **Type de personne :** physique ou morale.
2. **Informations :**
   - Personne physique : nom, prénoms, Pernum, téléphone, e-mail, mot de passe et confirmation.
   - Personne morale : raison sociale, statut juridique (liste à confirmer), gérant / représentant, Pernum Business, téléphone, e-mail, mot de passe et confirmation.
   - Prévoir des champs optionnels désactivables RCCM / NIF / pièces (PO-10).
3. **Engagement :** case à cocher obligatoire (texte d'engagement à respecter les statuts et le règlement intérieur, repris de l'ancien site), acceptation des conditions et de la politique de confidentialité.
4. **Vérification de l'e-mail :** saisie d'un code OTP à durée courte, avec un bouton « renvoyer le code » soumis à un délai.
5. **Paiement de l'adhésion :** le statut devient `PENDING_PAYMENT`. Le montant **affiché vient du serveur** (`POST /api/v1/auth/register` renvoie le montant et les frais). L'utilisateur est redirigé vers le PSP. Le navigateur **n'active jamais** le compte.
6. **Retour du paiement :** page d'attente qui interroge le statut (« Paiement en cours de confirmation »). Elle affiche `ACTIVE`, `échec` ou `en attente` selon la réponse serveur. Plusieurs tentatives de paiement possibles sans recréer le compte.

Pendant cette phase, le back-end n'existe pas encore : toutes ces étapes fonctionnent avec des **réponses simulées** (MSW, voir section 5). Le mode démo doit être clairement signalé (bandeau « Environnement de démonstration ») et impossible à activer en production (cahier : `DEMO_GATEWAY_BYPASS`).

### 4.3 Connexion

- Champ « identifiant » acceptant **e-mail ou Pernum**. La règle exacte est à confirmer ; prévoir les deux.
- Message d'erreur générique qui ne révèle jamais si un compte existe.
- Écran **MFA** prévu (`POST /api/v1/auth/mfa/verify`), obligatoire pour les rôles internes en phase suivante.
- Après connexion : redirection vers `/espace` (page provisoire) pour un Utilisateur, ou `/admin` (page provisoire) pour un rôle interne.

### 4.4 Hors périmètre (phases suivantes)

Ne pas construire maintenant, mais **préparer la structure** (routes protégées, contexte d'authentification, gestion des rôles, mise en page vide) :

| Espace | Route réservée | Contenu futur (cahier) |
|---|---|---|
| Tableau de bord Utilisateur | `/espace/*` | Section 5 : identité, packs, quota / solde, actions (vendre, payer un marchand, scanner un QR, rééchanger), transactions, paiements, documents, notifications |
| Validateur | `/admin/validations/*` | Section 7.1 |
| Comptabilité | `/admin/finance/*` | Sections 7.2 et 8 |
| Administrateur / Superadmin | `/admin/*` | Sections 9, 10 et 22 |

## 5. Architecture et stack technique

### 5.1 Architecture

- **Frontend (ce projet) :** application React + TypeScript. Elle ne fait **qu'afficher et collecter**. Elle ne prend aucune décision de sécurité ni de montant (cahier, section 13).
- **Backend (projet séparé, phase suivante) :** Laravel / PHP + MySQL. Il est la source de toutes les décisions et expose l'API `/api/v1`.
- **Authentification :** **sessions par cookies HttpOnly + Secure + SameSite**, via Laravel Sanctum en mode SPA, avec un jeton CSRF (`/sanctum/csrf-cookie`). **Aucun jeton d'accès stocké dans localStorage ou sessionStorage.**
- **Domaines :** frontend et API sur le même domaine ou un sous-domaine (par exemple `scoopcectogo.com` et `api.scoopcectogo.com`), pour que les cookies SameSite fonctionnent.

### 5.2 Outils

| Domaine | Outil |
|---|---|
| Base | React 18+, TypeScript `strict`, Vite |
| Routage | React Router (lazy loading par route, routes protégées par rôle) |
| Styles | Tailwind CSS + variables CSS (`tokens.css`), thème clair / sombre |
| Composants accessibles | Radix UI ou shadcn/ui |
| Icônes | lucide-react ; icônes de marque via simple-icons. **Aucun emoji** |
| Formulaires | React Hook Form + Zod (messages FR / EN) |
| Données serveur | TanStack Query + client HTTP unique (`src/services/http.ts`) |
| API simulée | **MSW (Mock Service Worker)** reproduisant les endpoints du cahier (section 23.2) |
| Montants | XOF en **entiers** ; quantités YEM en **chaînes décimales** + decimal.js. **Jamais de `number` flottant pour un montant ou une quantité** |
| i18n | i18next + react-i18next + détection de langue (voir section 7) |
| SEO | react-helmet-async, sitemap.xml, robots.txt, hreflang. Pré-rendu des pages publiques (vite-plugin-ssg ou équivalent) recommandé |
| Animations | Framer Motion, discrètes, respect de `prefers-reduced-motion` |
| QR (phase suivante) | Prévoir une bibliothèque de scan caméra + saisie manuelle de secours (cahier, section 21.2) |
| Qualité | ESLint, Prettier, Husky + lint-staged, `tsc --noEmit` en CI |
| Tests | Vitest + Testing Library, Playwright (E2E + responsive), axe-core (accessibilité) |
| CI/CD | Pipeline : lint → tests → scan des dépendances et des secrets → build → staging → production (cahier, section 28) |
| Environnements | DEV / STAGING / PRODUCTION séparés ; variables `.env` publiques uniquement (`VITE_API_URL`, `VITE_RECAPTCHA_SITE_KEY`, `VITE_WHATSAPP_NUMBER`, `VITE_ENV`) |

### 5.3 Conventions API à respecter dès maintenant (cahier, section 23)

- Préfixe `/api/v1`, JSON UTF-8, dates ISO-8601 (stockées en UTC, affichées en heure de Lomé).
- Format d'erreur : `{ code, message, correlation_id }`. Afficher `message`, journaliser `correlation_id`, et proposer de le communiquer au support.
- En-tête **`Idempotency-Key`** (UUID généré côté client) sur les créations sensibles (inscription, initiation de paiement). Le **réutiliser** si l'utilisateur relance après une erreur réseau, pour ne jamais créer de doublon.
- Listes paginées côté serveur.
- Endpoints utilisés dans cette phase :
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/mfa/verify`
  - `GET /api/v1/packs`
  - endpoints OTP, réinitialisation du mot de passe, contact et statut de paiement : **noms à confirmer avec l'équipe back-end**. Les isoler dans `src/services/`.

Tous les types de réponses sont dans `src/types/api.ts`, avec des schémas Zod pour valider les réponses.

### 5.4 Arborescence suggérée

```
src/
  app/            # routeur, providers (Query, Theme, Auth, i18n), garde de rôles
  components/
    layout/       # GlassNavbar, Footer, PublicLayout, DashboardLayout (vide)
    ui/           # Button, Card, Input, Badge, Section, Stepper, Alert...
  features/
    home/ yem/ packs/ membership/ contact/ auth/ partners/ news/ legal/
  pages/
  services/       # http.ts, auth.ts, packs.ts, contact.ts (+ types)
  mocks/          # handlers MSW alignés sur le cahier
  data/           # contenus éditoriaux provisoires (FR/EN), JAMAIS de valeurs économiques ratifiées en dur
  locales/fr/ locales/en/
  lib/            # money.ts (XOF, decimal), format.ts (Intl), schemas/
  styles/         # tokens.css, globals.css
  types/
public/
  logo/           # logo officiel (SVG à produire), favicon, icônes PWA
```

## 6. Design : logo, couleurs, verre, icônes

### 6.1 Logo officiel

Le cahier v4.0 contient le **logo officiel** : un écusson rond avec un anneau or, le texte « COOPÉRATIVE D'ENTRAIDE COMMUNAUTAIRE DU TOGO » en vert, trois personnages (deux verts, un jaune), une pousse et une poignée de main vert et or.

- Utiliser le fichier `logo-officiel-cect.jpeg` (1254 × 1254 px) en attendant une **version vectorielle SVG**, à demander à un graphiste.
- Prévoir deux formats :
  - **logo complet** (écusson) : pied de page, pages « À propos » et documents ;
  - **version compacte** pour la barre de navigation et le favicon, car le texte circulaire est illisible en petit. Utiliser par exemple le symbole central seul, ou le symbole + « CECT ».
- Les concepts de logo générés précédemment (union des personnes, cercle d'échange, mains solidaires) sont **abandonnés** au profit du logo officiel.

### 6.2 Couleurs (relevées sur le logo officiel)

| Jeton | Valeur | Origine dans le logo | Emploi conseillé |
|---|---|---|---|
| `--brand-green-900` | `#004B24` | Texte circulaire, points | Titres, texte de marque, pied de page, mode sombre (fond) |
| `--brand-green-700` | `#015A24` | Personnage gauche | Couleur principale : boutons, liens, survols |
| `--brand-green-600` | `#026921` | Personnage droit | Variante de survol, états actifs |
| `--brand-green-500` | `#118C14` | Main verte | Accents, icônes, grands titres, succès (sans être la seule indication). Contraste 4,4:1 sur blanc : **pas pour du texte courant** |
| `--brand-gold-500` | `#EFB303` | Personnage central (jaune) | Accent principal : badges, mises en avant, focus visible sur fond vert |
| `--brand-gold-600` | `#C89E25` | Anneau or | Bordures décoratives, séparateurs, détails premium |
| `--brand-gold-700` | `#CC9D13` | Main or | Variante d'accent foncée |

Couleurs neutres et d'état à définir autour de la marque :

- `--color-bg` : `#FFFFFF` en clair, `#0B1A12` en sombre.
- `--color-surface` : `#F6F8F5` en clair, `#11241A` en sombre.
- `--color-text` : `#0F1A14` en clair, `#E9F1EC` en sombre.
- `--color-text-muted` : `#4B5B52` en clair, `#A7B8AE` en sombre.
- `--color-border` : `#DCE5DF` en clair, `#24382C` en sombre.
- `--color-danger` : `#B42318`.
- `--color-warning` : réutiliser l'or `#C89E25` avec texte foncé.

Les neutres sont des propositions à ajuster. **Vérifier chaque couple texte / fond au contraste AA (4,5:1).** Contrastes déjà vérifiés : `#015A24` sur blanc 8,4:1 (OK) ; `#004B24` sur `#EFB303` 5,5:1 (OK) ; `#EFB303` sur fond sombre `#0B1A12` 9,5:1 (OK). Attention : l'or `#EFB303` sur blanc (1,9:1) et `#C89E25` sur blanc (2,5:1) **ne passent pas** pour du texte ; le réserver aux fonds, aux bordures et aux icônes, ou l'utiliser avec un texte vert foncé `#004B24` par-dessus. Le cahier le rappelle : « le vert / or de la marque ne doit pas compromettre la lisibilité ».

Toutes les couleurs passent par `tokens.css` et sont mappées dans la configuration Tailwind ; **aucune couleur codée en dur dans les composants**.

### 6.3 Barre de navigation en verre (« water glass »)

S'applique à la barre de navigation, au menu mobile et aux barres flottantes.

- Barre fixe en haut, en forme de **pilule** détachée des bords sur ordinateur, pleine largeur sur mobile.
- **Fond translucide :** `rgba(255,255,255,0.55)` en clair ; `rgba(0,75,36,0.35)` (vert de marque) ou `rgba(11,26,18,0.45)` en sombre.
- **Flou d'arrière-plan :** `backdrop-filter: blur(16px) saturate(180%)`, avec le préfixe `-webkit-`.
- **Bordure et ombre :** bordure `1px solid rgba(255,255,255,0.35)` ; reflet `inset 0 1px 0 rgba(255,255,255,0.4)` ; ombre `0 8px 32px rgba(0,0,0,0.12)`.
- **Au défilement :** opacité et ombre légèrement renforcées.
- **Repli** sans `backdrop-filter` : fond quasi opaque, via `@supports not (backdrop-filter: blur(1px))`.
- **Contenu :**
  - à gauche : logo compact ;
  - au centre : liens principaux ;
  - à droite : sélecteur FR / EN, bouton mode sombre, « Connexion » et « Adhérer » (bouton or ou vert).
- **Menu mobile :** tiroir ou plein écran en verre, fermeture avec Échap et au clic extérieur, focus piégé dans le menu ouvert.
- Contraste AA du texte sur le verre, vérifié sur les fonds clairs **et** sur les images du héros.

Classe Tailwind de départ :

```
bg-white/55 dark:bg-[#0B1A12]/45 backdrop-blur-xl backdrop-saturate-150
border border-white/35 rounded-2xl
shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_8px_32px_rgba(0,0,0,0.12)]
```

### 6.4 Icônes : aucun emoji

| Emploi | Icône lucide-react |
|---|---|
| Mode sombre / clair | `Moon` / `Sun` |
| Langue | `Languages` |
| Entraide | `Handshake` |
| Échange | `ArrowLeftRight` |
| Responsabilité | `ShieldCheck` |
| Création de valeur | `Sprout` (rappelle la pousse du logo) |
| YEM | `Coins` |
| Pack Vendeur | `ArrowUpRight` ou `HandCoins` |
| Pack Consommateur | `ShoppingCart` |
| Pack Personnel | `Wallet` |
| Pack Marchand | `Store` |
| QR marchand | `QrCode` / `ScanLine` |
| Personne physique / morale | `User` / `Building2` |
| T-Money / Flooz | `Smartphone` (ou logos officiels avec autorisation) |
| Virement / espèces | `Landmark` / `Banknote` |
| Avertissement | `TriangleAlert` |
| Sécurité / connexion | `LockKeyhole` / `KeyRound` |
| Statut en attente / validé / échec | `Clock` / `CircleCheck` / `CircleX`, **toujours accompagnés d'un libellé texte** |
| Contact | `Phone`, `Mail`, `MapPin`, `MessageCircle` (WhatsApp) |
| Services | `PiggyBank`, `MessageCircleQuestion`, `TrendingUp`, `GraduationCap`, `Users` |

Les icônes décoratives ont `aria-hidden="true"` ; les boutons composés d'une seule icône ont un `aria-label` traduit.

## 7. Langues : français (principal) et anglais

- **Français :** langue par défaut, langue source des contenus et langue de repli (`fallbackLng: 'fr'`). **Anglais :** seconde langue, disponible dès la première version.
- **URL :** français sans préfixe, anglais avec `/en` et des slugs traduits (voir 4.1). La table de correspondance des routes (`src/app/routes.ts`) permet au sélecteur de langue de rester sur la même page.
- **Première visite :** français. Si le navigateur est en anglais, proposer l'anglais par un bandeau discret, sans redirection forcée. Le choix est mémorisé et prioritaire.
- **Sélecteur FR / EN** dans la barre en verre, avec l'icône `Languages`. Pas de drapeaux.
- **Aucun texte en dur** : tout passe par `t('cle')`, avec des espaces de noms (`common`, `home`, `yem`, `packs`, `membership`, `forms`, `auth`, `legal`). Les clés sont typées avec TypeScript.
- **Formats `Intl` :**
  - montants : `25 000 FCFA` en français, `XOF 25,000` ou `FCFA 25,000` en anglais ;
  - dates : `7 octobre 2026` / `October 7, 2026` ;
  - fuseau d'affichage : `Africa/Lome` ;
  - téléphones : `+228 90 00 00 00`.
- **Document HTML :** `<html lang>` mis à jour à chaque changement de langue.
- **SEO :** balises `hreflang="fr"`, `hreflang="en"` et `x-default` (pointant vers le français) ; sitemap bilingue.
- **Documents officiels :** la version française fait foi (mention « French version prevails » en anglais). Les textes juridiques anglais sont à faire relire.
- Les **codes d'erreur** de l'API sont traduits côté frontend à partir du `code` ; le `message` serveur ne sert qu'en dernier recours.

## 8. Règles de contenu et de vocabulaire

Ces règles viennent du cahier et sont **obligatoires** :

- Le site **ne présente jamais** la CECT comme émettrice de YEM ni comme portefeuille. Le quota ou solde affiché est un **droit suivi**, pas une « seconde monnaie » ni des « YEM virtuels ».
- Ne jamais écrire qu'un transfert est réussi parce que l'utilisateur a cliqué sur « J'ai envoyé ». Un **scan de QR n'est pas une preuve de paiement**.
- Mentionner clairement que le YEM **n'a pas cours légal** au Togo.
- **Aucune promesse de gain ou de rendement.** Les cours et les remises sont présentés comme « conditions en vigueur, susceptibles d'évoluer sur décision du Conseil d'administration », jamais comme des garanties.
- **Les valeurs économiques ne sont pas encore ratifiées** (section 13). Tant que l'API n'existe pas, elles sont dans `src/data/` ou dans les mocks, marquées `// PROVISOIRE — à ratifier par le CA (PO-01, PO-02)`. Afficher un bandeau « Valeurs indicatives » sur la page Packs en environnement de démonstration.
- **Ne pas recopier** la grille V1–V12 « contre-valeur mois » de l'annexe A.1 du cahier : elle est calculée à 520 F/YEM et doit être recalculée.
- Moyens de paiement présentés : T-Money, Flooz, virement bancaire, espèces (cahier, AC-17).
- **Coordonnées :** e-mail sur le domaine (par exemple `contact@scoopcectogo.com`, à créer) plutôt que ProtonMail. Liens réseaux sociaux uniquement s'ils existent.

## 9. Responsive et accessibilité

Le site est **mobile-first** (cahier, section 21).

| Plage | Largeur | Comportement |
|---|---|---|
| Mobile compact | 320–479 px | 1 colonne, navigation compacte, formulaires plein écran |
| Mobile | 480–767 px | 1 colonne, cartes, boutons tactiles |
| Tablette | 768–1023 px | 1–2 colonnes, panneaux repliables |
| Desktop | 1024–1439 px | Grilles 2–3 colonnes |
| Grand écran | ≥ 1440 px | Largeur de contenu maîtrisée, sans étirer le texte |

- Aucun défilement horizontal global à 320 px.
- Aucune fonction dépendant uniquement du survol.
- Cibles tactiles **≥ 44 × 44 px**.
- Formulaires sur une colonne en mobile.
- Modales transactionnelles en plein écran sur mobile.
- Portrait et paysage supportés.
- **Objectif WCAG 2.2 AA :**
  - navigation complète au clavier, focus visible ;
  - labels explicites et erreurs reliées aux champs ;
  - annonces ARIA pour les statuts asynchrones ;
  - zoom 200 % sans perte ;
  - contraste suffisant ;
  - `prefers-reduced-motion` respecté.
- **Les statuts et erreurs ne sont jamais indiqués par la seule couleur** (icône + texte).
- **Réseau instable :**
  - état de chargement explicite ;
  - aucun double envoi : bouton désactivé pendant l'envoi, même `Idempotency-Key` en cas de nouvel essai.
- **PWA éventuelle :** cache de l'interface et des pages publiques uniquement, **jamais** de confirmation financière hors ligne.
- **Navigateurs cibles :** versions récentes de Chrome, Firefox, Edge, Safari, Chrome Android et Safari iOS.

## 10. Sécurité côté frontend

- Aucun secret dans le code ni dans le bundle ; seules des clés publiques en `.env`.
- Cookies de session gérés par le serveur (HttpOnly) ; aucun jeton dans le stockage du navigateur.
- CSRF via Sanctum ; `credentials: 'include'` sur les appels API.
- Code compatible avec une **CSP stricte** :
  - aucun script inline ni `eval` ;
  - aucun `dangerouslySetInnerHTML` sur du contenu non assaini ;
  - les en-têtes de sécurité (CSP, HSTS, X-Frame-Options, Referrer-Policy) sont posés par le serveur ou l'hébergeur.
- reCAPTCHA v3 + champ pot de miel conservés sur l'inscription et le contact.
- **Messages d'authentification génériques** : ne jamais révéler l'existence d'un compte, ni d'un e-mail ou Pernum déjà utilisés, au moment de la connexion ou de la réinitialisation.
- Aucune donnée personnelle (e-mail, téléphone, Pernum) dans les logs console ni dans les outils d'analyse.
- Dépendances : `npm audit` / Dependabot, verrouillage des versions, scan des secrets en CI.

## 11. Tests et critères d'acceptation de la phase

Critères du cahier applicables au frontend de cette phase :

| ID | Critère |
|---|---|
| AC-01 | Une personne physique ou morale peut s'inscrire, vérifier son e-mail et arriver en `PENDING_PAYMENT` (sur API simulée). |
| AC-03 | Le compte n'apparaît `ACTIVE` qu'après confirmation serveur du paiement ; le mode démo est explicitement signalé. |
| AC-04 | Les montants d'adhésion affichés (25 000 / 200 000 FCFA) viennent de l'API ou des données provisoires, jamais d'une constante dans un composant. |
| AC-17 | Les moyens de paiement distinguent T-Money, Flooz, virement bancaire et espèces. |
| AC-RWD-01 | Aucun scroll horizontal global à 320 px. |
| AC-RWD-02 | Actions utilisables au tactile sans zoom. |
| AC-RWD-03 | À 200 % de zoom, aucune information essentielle masquée. |
| AC-RWD-06 | Toutes les fonctions réalisables au clavier. |

Critères ajoutés pour cette phase :

| ID | Critère |
|---|---|
| FR-EN-01 | Chaque page existe en FR et en EN ; aucune clé de traduction manquante en FR ; repli FR si une clé EN manque. |
| UI-01 | Aucun emoji dans l'interface ni dans les contenus ; uniquement des icônes. |
| UI-02 | Barre de navigation en verre fonctionnelle, avec repli sans `backdrop-filter`. |
| UI-03 | Contraste AA vérifié (axe-core) en mode clair et sombre. |
| PERF-01 | Lighthouse mobile ≥ 90 (performance, accessibilité, bonnes pratiques, SEO) sur Accueil, Packs et Inscription. |

Tests attendus :

- unitaires : formatage des montants, schémas Zod, garde de rôles ;
- E2E Playwright : inscription physique, inscription morale, OTP, retour de paiement réussi / échoué / en attente, connexion, changement de langue ;
- responsive : 320, 768, 1024 et 1440 px ;
- accessibilité : axe-core.

## 12. Ordre de travail et livrables

1. **Initialisation** :
   - projet Vite + React + TypeScript strict, Tailwind, ESLint / Prettier / Husky ;
   - i18n FR / EN ;
   - React Router avec la table de routes FR / EN ;
   - MSW ;
   - `tokens.css` avec les couleurs de la section 6.2.
2. **Socle UI** :
   - composants de base, `GlassNavbar`, `Footer`, `PublicLayout` ;
   - mode sombre ;
   - sélecteur de langue.
3. **Pages éditoriales** : Accueil, Le YEM, Comment ça marche, Services, À propos, Documents, FAQ, Actualités, Partenaires, Contact, pages légales, 404.
4. **Packs et adhésion** : données via `GET /api/v1/packs` (simulé), les 4 familles, la limite de 2 packs, la page Adhésion.
5. **Authentification** : inscription en étapes + OTP + paiement simulé + page de statut, connexion, mot de passe oublié, MFA (écran), contexte d'authentification, routes `/espace` et `/admin` protégées avec pages provisoires.
6. **SEO et performance** : meta par page FR / EN, hreflang, sitemap, pré-rendu, optimisation des images (WebP / AVIF), logo.
7. **Tests et CI** : Vitest, Playwright, axe-core, pipeline CI.
8. **Livrables** :
   - dépôt Git propre ;
   - `README.md` (installation, scripts, variables d'environnement, déploiement) ;
   - `docs/api-contract.md` : liste des endpoints utilisés, format des requêtes et réponses attendues, à valider par l'équipe back-end ;
   - `docs/decisions.md` : choix faits et points en attente.

À chaque étape, livrer une version qui compile, sans erreur TypeScript ni avertissement ESLint.

## 13. Points encore ouverts

Ces points viennent de la section 20 du cahier. Ils ne doivent **jamais** devenir des constantes cachées dans le code.

| ID | Sujet | Impact sur le site public |
|---|---|---|
| PO-01 | Cours achat 500 / vente 650 / cession 610 F/YEM | Page YEM, page Packs |
| PO-02 | Remises Consommateur (2–5 %) | Page Packs |
| PO-03 / PO-04 | Périodicité et niveaux M1–M10 du Pack Marchand | Page Packs |
| PO-05 | Quota Vendeur restant après 12 périodes | FAQ |
| PO-07 | Capacités réelles de FedaPay (T-Money / Flooz, limites, frais) | Parcours de paiement |
| PO-09 | Qui paie les frais de versement | FAQ, conditions |
| PO-10 | Statuts juridiques, RCCM / NIF, documents exigés pour les personnes morales | Formulaire d'inscription |
| — | Identifiant de connexion (e-mail, Pernum ou les deux) | Page Connexion |
| — | Noms exacts des endpoints OTP, mot de passe oublié, contact, statut de paiement | Couche `src/services/` |
| — | Version SVG du logo et logo compact | Barre de navigation, favicon |

## 14. Prompt de démarrage pour Claude

À copier tel quel, avec ce fichier, le cahier des charges v4.0 et le logo officiel joints :

```
Tu es développeur frontend senior. Tu vas construire le nouveau site public de la CECT
(Coopérative d'Entraide Communautaire du Togo).

Fichiers joints :
1. CECT_refonte_site.md — le brief de développement. Suis-le à la lettre.
2. Cahier_des_charges_CECT_YEM_final_v4.0.docx — la référence fonctionnelle et technique.
   En cas de contradiction, le cahier fait foi, sauf pour les choix d'équipe du brief
   (React + TypeScript, barre de navigation en verre, icônes sans emoji, FR/EN).
3. logo-officiel-cect.jpeg — le logo officiel.

Ta mission dans cette phase : le site public uniquement (section 4 du brief), avec
inscription, connexion et mot de passe oublié branchés sur une API simulée (MSW) qui
respecte les conventions /api/v1 du cahier. Les tableaux de bord Utilisateur, Validateur,
Comptabilité, Admin et Superadmin ne sont PAS à construire maintenant : prépare seulement
les routes protégées /espace et /admin avec des pages provisoires.

Règles non négociables :
- React 18 + TypeScript strict + Vite + Tailwind, code de qualité production.
- Français langue principale, anglais seconde langue, dès la première version (section 7).
- Barre de navigation en verre (section 6.3), couleurs du logo officiel (section 6.2),
  aucun emoji, icônes lucide-react (section 6.4).
- Aucun chiffre économique en dur : les montants viennent de l'API simulée ou de
  src/data/ marqués PROVISOIRE. Montants XOF en entiers, quantités YEM en décimal, jamais
  de float.
- Le frontend ne décide jamais d'un montant ni d'une activation de compte.
- Sessions par cookies HttpOnly (Laravel Sanctum SPA), aucun jeton dans localStorage.
- Mobile-first, WCAG 2.2 AA, aucun scroll horizontal à 320 px.
- Respecte le vocabulaire de la section 8 (pas de « YEM virtuels », pas de promesse
  de gain, le YEM n'a pas cours légal).

Méthode :
1. Lis entièrement le brief et le cahier. Résume-moi en 10 lignes ce que tu as compris
   et liste tes questions bloquantes, s'il y en a.
2. Propose l'arborescence du projet et la liste des pages, puis attends ma validation.
3. Construis ensuite étape par étape selon la section 12 du brief, en me livrant à
   chaque étape un code qui compile, avec les commandes pour le lancer.
4. Tiens à jour docs/decisions.md et docs/api-contract.md.
```

*Brief établi le 8 octobre 2026 à partir du cahier des charges v4.0 et de l'analyse des pages publiques de l'ancien site.*
