# Refonte du site CECT Togo

Présentation de la coopérative, inventaire des fonctionnalités existantes et recommandations d'amélioration

Site analysé : **scoopcectogo.com** (pages accueil, inscription, connexion, mot de passe oublié)

Date de l'analyse : 4 octobre 2026

> **Périmètre de l'analyse.** Seules les pages publiques ont été examinées. L'espace membre (accessible après connexion) n'a pas pu être consulté : ses fonctionnalités actuelles ne sont donc pas décrites ici. Les fonctions proposées pour cet espace (section 5) sont des recommandations, à confronter avec ce qui existe déjà.

## Sommaire

- [1. Présentation de la CECT](#1-présentation-de-la-cect)
- [2. Technologie actuelle](#2-technologie-actuelle)
- [3. Inventaire des fonctionnalités existantes](#3-inventaire-des-fonctionnalités-existantes)
- [4. Points faibles constatés](#4-points-faibles-constatés)
- [5. Recommandations pour le nouveau site](#5-recommandations-pour-le-nouveau-site)
- [6. Feuille de route proposée](#6-feuille-de-route-proposée)
- [7. Brief de développement (pour Claude)](#7-brief-de-développement-pour-claude)

## 1. Présentation de la CECT

### Qui est la CECT ?

La **Coopérative d'Entraide Communautaire du Togo (CECT)** est une coopérative basée à Lomé, créée il y a environ un an. Elle revendique plus de 100 membres actifs. Sa devise est « Un Togo plus fort ensemble ! ».

Sa mission déclarée est de bâtir une **économie sociale et solidaire** fondée sur quatre valeurs : l'entraide, l'échange, la responsabilité et la création de valeur au bénéfice de la communauté. Comme toute coopérative, elle fonctionne avec des membres qui achètent une part sociale et s'engagent à respecter les statuts et le règlement intérieur.

### Qui peut devenir membre ?

L'adhésion est ouverte à deux catégories :

- **Les personnes physiques** (particuliers), pour 25 000 FCFA (part sociale et frais d'adhésion).

- **Les personnes morales** (entreprises, associations, GIE, coopératives, auto-entrepreneurs), pour 50 000 FCFA.

Après l'inscription en ligne, le membre imprime une fiche d'adhésion de deux pages, la signe et la remet à la coopérative, qui valide ensuite l'adhésion.

### Le YEM, cœur du modèle

L'activité principale mise en avant est le **YEM**, présenté comme une monnaie numérique interne au réseau CECT. Son fonctionnement, tel que décrit sur le site :

- Le membre **achète** des YEM à la coopérative, au prix de 650 FCFA l'unité (ou via des packs), par T-Money, Flooz, virement ou espèces.

- Il **dépense** ses YEM chez les commerçants et prestataires partenaires, notamment au « Marché CECT », avec une **réduction de 15 %** sur ses achats.

- Il peut **revendre** ses YEM à la coopérative, qui annonce les racheter à 520 FCFA l'unité.

Le site précise que le YEM **n'a pas cours légal** au Togo, contrairement au franc CFA, et que son usage doit être encadré par les règles applicables aux actifs.

### Les autres services annoncés

En plus du YEM, la CECT présente cinq services, décrits brièvement sur le site :

- **Épargne et consommation** : solutions d'épargne et d'achat à conditions avantageuses.

- **Assistance et conseil** : accompagnement personnalisé des projets des membres.

- **Investissement** : participation à des projets solidaires.

- **Formation** : programmes pour les entrepreneurs.

- **Entraide** : réseau de solidarité entre membres.

### Les packs

La coopérative propose six packs, de C1 (100 000 FCFA pour 1 500 YEM) à C6 (1 500 000 FCFA pour 26 000 YEM). Le détail et l'analyse de ces packs figurent dans les sections 3 et 4.

### En résumé

La CECT se présente comme une coopérative qui réunit des membres et des commerçants autour d'une monnaie interne, le YEM, afin de faciliter la consommation à prix réduit et l'entraide. Le site actuel sert à présenter cette offre, à recruter de nouveaux membres et à leur donner accès à un espace personnel.

## 2. Technologie actuelle

| **Élément**      | **Constat**                                                                                                                                              |
|------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| Langage serveur  | PHP : chaque page est un script .php (acceuil.php, inscription.php, login.php, mot_de_passe_oublie.php). Développement sur mesure, pas de CMS identifié. |
| Base de données  | Probable (comptes membres, mots de passe, paiements), type non visible depuis l'extérieur.                                                               |
| Interface        | Page d'accueil « one-page » avec ancres (#services, #yem, #tarifs, #contact), design responsive, bouton mode sombre.                                  |
| Sécurité visible | Google reCAPTCHA sur l'inscription, champ « pot de miel » anti-robot (« Site web, ne pas remplir »), HTTPS.                                              |
| Langue           | Français uniquement.                                                                                                                                     |

## 3. Inventaire des fonctionnalités existantes

### 3.1 Page d'accueil (acceuil.php)

| **Section**        | **Contenu / fonction**                                                                                                                                                                                |
|--------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| En-tête & menu     | Logo CECT, menu Accueil / Services / Le YEM / Tarifs / Contact, lien Connexion, bascule mode clair / sombre.                                                                                          |
| Bannière (héros)   | Slogan « Un Togo plus fort ensemble », deux boutons d'action : « Adhérer maintenant » (vers l'inscription) et « Découvrir le YEM ».                                                                   |
| Chiffres clés      | 100+ membres actifs, 1 année d'existence, 6 packs, 100 % engagement solidaire (valeurs écrites en dur dans la page).                                                                                  |
| Nos services       | Six cartes : Épargne & consommation, YEM, Assistance & conseil, Investissement, Formation, Entraide. Texte descriptif uniquement, aucune page de détail.                                              |
| Notre mission      | Texte de valeurs : entraide, échange, responsabilité, création de valeur.                                                                                                                             |
| Le YEM             | Trois visuels (flyers) : présentation, rachat (1 YEM = 520 FCFA), consommation (15 % de réduction). Description, avertissement « pas de cours légal », avantages, prix de vente 650 F / rachat 520 F. |
| Comment ça marche  | Trois étapes : adhérer (25 000 FCFA), acheter des YEM (650 FCFA, mobile money / virement / espèces), consommer avec 15 % de réduction.                                                                |
| Nos packs (tarifs) | Six packs C1 à C6 (voir tableau ci-dessous). Affichage seul, pas d'achat en ligne.                                                                                                                    |
| Contact            | Deux numéros (+228 90 14 42 04, +228 90 04 15 17), e-mail cect@proton.me, adresse « Lomé, Togo ». Pas de formulaire de contact, pas de carte.                                                         |
| Pied de page       | Liens rapides, liens services, icônes Facebook / WhatsApp / Instagram / LinkedIn (liens vides « # »), copyright 2026.                                                                                |

### Packs affichés

| **Pack** | **Prix**    | **YEM reçus** | **Prix implicite par YEM** |
|----------|-------------|---------------|----------------------------|
| C1       | 100 000 F   | 1 500         | ≈ 67 F                     |
| C2       | 250 000 F   | 4 000         | ≈ 63 F                     |
| C3       | 400 000 F   | 6 000         | ≈ 67 F                     |
| C4       | 600 000 F   | 9 000         | ≈ 67 F                     |
| C5       | 800 000 F   | 15 000        | ≈ 53 F                     |
| C6       | 1 500 000 F | 26 000        | ≈ 58 F                     |

### 3.2 Inscription (inscription.php)

| **Étape**          | **Champs et règles**                                                                                                                                                                                                                                                                                                                                                                                             |
|--------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1. Identification | Type de personne : physique (25 000 FCFA) ou morale (50 000 FCFA). Personne morale : dénomination / raison sociale, statut juridique (SARL, SA, SAS, SASU, EURL, GIE, Association, Coopérative, Auto-entrepreneur, Autre). Nom\*, prénom\*, Pernum \* (identifiant numérique choisi par le membre, sert à la connexion), téléphone\*, e-mail (facultatif), mot de passe\* (8 caractères min.) et confirmation\*. |
| 2. Paiement       | Choix du mode : T-Money (Togocom), Flooz (Moov Africa), espèces en main propre. Aucun paiement intégré : le choix est seulement déclaratif.                                                                                                                                                                                                                                                                      |
| 3. Engagement     | Texte d'engagement à respecter les statuts et le règlement intérieur, case « J'accepte et m'engage pleinement » obligatoire.                                                                                                                                                                                                                                                                                     |
| 4. Lieu et date   | Champs « Fait à » et « Le ».                                                                                                                                                                                                                                                                                                                                                                                     |
| Après envoi        | Génération d'une fiche d'adhésion de 2 pages à imprimer et signer ; la page 1 signée est obligatoire pour valider l'adhésion (validation manuelle).                                                                                                                                                                                                                                                              |
| Protection         | reCAPTCHA Google + champ pot de miel.                                                                                                                                                                                                                                                                                                                                                                            |

### 3.3 Connexion et mot de passe

| **Page**              | **Fonction**                                                                                                                                                    |
|-----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Connexion (login.php) | Pernum + mot de passe, lien « Mot de passe oublié ? », lien vers l'inscription.                                                                                 |
| Mot de passe oublié   | Saisie du Pernum + e-mail associé, envoi d'un lien de réinitialisation par e-mail. Les membres inscrits sans e-mail ne peuvent pas récupérer leur compte seuls. |

## 4. Points faibles constatés

| **Domaine**            | **Problème**                                                                                                                                                                                                    | **Impact**                                                                                                      |
|------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------|
| Cohérence des chiffres | Les packs donnent le YEM à 53–67 F, alors que le site annonce un prix de vente de 650 F et un rachat garanti à 520 F. Exemple : C1 = 100 000 F pour 1 500 YEM, revendables 780 000 F au prix de rachat affiché. | Critique : incohérence qui fait douter du modèle et expose la coopérative à un risque juridique (voir encadré). |
| Transparence           | Aucun numéro d'agrément, de registre ou d'immatriculation, pas de statuts ni de règlement intérieur téléchargeables, pas de noms des dirigeants.                                                                | Faible confiance, impossible à vérifier pour un futur membre.                                                   |
| Contact                | E-mail ProtonMail au lieu d'une adresse @scoopcectogo.com, adresse limitée à « Lomé », liens réseaux sociaux vides.                                                                                             | Image peu professionnelle.                                                                                      |
| Paiement               | Mode de paiement seulement déclaré, rapprochement manuel.                                                                                                                                                       | Erreurs, délais, risque de fraude.                                                                              |
| Adhésion               | Fiche papier à imprimer, signer et déposer.                                                                                                                                                                     | Frein important à l'inscription.                                                                                |
| Compte                 | E-mail facultatif mais nécessaire pour réinitialiser le mot de passe ; Pernum choisi librement (collisions, devinable).                                                                                         | Comptes bloqués, support débordé.                                                                               |
| Contenu                | Services décrits en une phrase, chiffres clés en dur, nom de fichier mal orthographié (« acceuil »).                                                                                                            | Faible crédibilité et mauvais référencement.                                                                    |
| Référencement          | Pas de pages dédiées, peu de balises méta, une seule langue.                                                                                                                                                    | Faible visibilité sur Google.                                                                                   |

> **Point de vigilance juridique — à traiter avant la refonte.** Promettre un rachat en FCFA d'un actif vendu sous forme de packs, avec une valeur de rachat très supérieure au prix payé, correspond aux critères que les autorités de l'UEMOA associent aux schémas d'investissement non autorisés. Un nouveau site plus attractif ne corrige pas ce risque et peut même l'aggraver. Recommandations : faire valider le modèle économique (prix des packs, rachat, origine des fonds qui financent le rachat) par un juriste ; vérifier l'agrément de la coopérative auprès des services compétents du Ministère des Finances du Togo et de la BCEAO, notamment pour toute activité d'épargne ou de monnaie électronique ; n'afficher que des chiffres cohérents et justifiés.

## 5. Recommandations pour le nouveau site

### 5.1 Confiance et transparence (priorité 1)

- Page « Qui sommes-nous » : historique, organes (conseil d'administration, comité de surveillance), photos et noms des responsables.

- Page « Documents officiels » : statuts, règlement intérieur, numéro d'immatriculation, agrément, rapports annuels et comptes approuvés en PDF.

- Page YEM réécrite avec des règles claires et cohérentes : prix d'achat, conditions et limites de rachat, frais, délais, risques. Une FAQ « Le YEM est-il sûr ? ».

- Conditions générales, politique de confidentialité (loi togolaise n° 2019-014 sur la protection des données personnelles), mentions légales.

- Adresse e-mail sur le domaine (contact@scoopcectogo.com), adresse physique précise avec carte, horaires d'ouverture, liens réseaux sociaux actifs.

### 5.2 Site public

- Une page par service (épargne, formation, investissement, entraide) avec conditions, exemples et bouton d'action.

- Annuaire des **commerçants partenaires** acceptant le YEM : recherche par ville / catégorie, carte, fiche partenaire.

- Chiffres clés calculés automatiquement depuis la base (membres, partenaires).

- Formulaire de contact avec accusé de réception, bouton WhatsApp flottant.

- Actualités / blog (assemblées générales, nouveaux partenaires, formations).

- Simulateur clair et honnête (par exemple, économies réalisées grâce à la réduction de 15 %).

- Témoignages vérifiés de vrais membres, avec leur accord.

- Version bilingue français / anglais (et éventuellement éwé).

### 5.3 Inscription et paiement

- Formulaire en plusieurs étapes avec barre de progression et enregistrement du brouillon.

- Vérification du numéro de téléphone par code SMS (OTP) ; e-mail fortement recommandé.

- Pernum attribué automatiquement par le système (au lieu d'être choisi), connexion possible aussi par téléphone.

- Paiement intégré T-Money / Flooz via un agrégateur agréé (par exemple CinetPay, PayDunya, FedaPay) avec confirmation automatique.

- Téléversement de la pièce d'identité (KYC) et signature électronique de la fiche d'adhésion, pour supprimer l'étape papier.

- E-mail / SMS de bienvenue avec reçu et carte de membre numérique (QR code).

### 5.4 Espace membre (à comparer avec l'existant)

- Tableau de bord : statut d'adhésion, part sociale, solde YEM, historique des transactions.

- Achat de YEM et demande de rachat avec suivi du statut (en attente, validé, payé) et reçus PDF.

- Paiement chez un commerçant par QR code.

- Profil : modification des coordonnées, changement de mot de passe, double authentification.

- Documents personnels : fiche d'adhésion, attestations, relevés mensuels.

- Inscription aux formations, notifications, messagerie avec le support.

### 5.5 Espace commerçant partenaire

- Inscription et validation des commerçants.

- Encaissement YEM par QR code, historique des ventes, demandes de conversion.

- Gestion de la fiche affichée dans l'annuaire public.

### 5.6 Back-office (administration)

- Validation des adhésions (avec pièces jointes), gestion des membres et partenaires.

- Rapprochement automatique des paiements mobile money, validation des rachats à deux personnes.

- Rôles et permissions (administrateur, trésorier, agent), journal d'audit de toutes les actions.

- Tableaux de bord et exports Excel / PDF pour la comptabilité et les assemblées générales.

- Envoi de SMS / e-mails groupés, gestion du contenu du site (actualités, FAQ) sans développeur.

### 5.7 Sécurité et technique

- Mots de passe hachés (bcrypt / Argon2), requêtes SQL préparées, protection CSRF et XSS, limitation des tentatives de connexion.

- Double authentification pour les administrateurs et pour les opérations financières.

- Sauvegardes quotidiennes chiffrées, hébergement fiable, certificat HTTPS renouvelé automatiquement.

- Audit de sécurité avant la mise en ligne et mises à jour régulières.

- Performance : images compressées (WebP), chargement rapide sur réseau mobile 3G/4G.

- Référencement : URLs propres (/accueil, /le-yem), balises méta, sitemap, fiche Google Business Profile.

- Accessibilité : contrastes suffisants, tailles de texte lisibles, navigation au clavier.

- Application mobile ou PWA (installable sur le téléphone) dans un second temps.

### 5.8 Stack technique retenue

L'équipe a choisi **React + TypeScript**. Le détail des outils figure dans la section 7 (brief de développement).

## 6. Feuille de route proposée

| **Phase**                       | **Contenu**                                                                                                                                 | **Durée indicative** |
|---------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|----------------------|
| 0. Cadrage                     | Validation juridique du modèle YEM et des packs, collecte des documents officiels, inventaire de l'espace membre actuel, choix de la stack. | 2–4 semaines         |
| 1. Site public                 | Nouvelle charte graphique, pages services, YEM, à propos, documents, partenaires, FAQ, contact, pages légales.                              | 4–6 semaines         |
| 2. Inscription & paiement      | Formulaire en étapes, OTP SMS, paiement mobile money intégré, KYC, signature électronique.                                                  | 4–6 semaines         |
| 3. Espace membre & back-office | Tableau de bord, transactions, rachats, rôles, audit, exports.                                                                              | 6–8 semaines         |
| 4. Commerçants & mobile        | Espace partenaire, paiement QR, PWA.                                                                                                        | 4–6 semaines         |
| 5. Lancement                   | Migration des comptes existants, tests, audit de sécurité, formation de l'équipe, mise en ligne.                                            | 2–3 semaines         |

### Priorités

- **Indispensable :** cohérence et validation juridique des chiffres, transparence, sécurité, paiement fiable.

- **Important :** inscription 100 % en ligne, espace membre complet, back-office.

- **Souhaitable :** annuaire de partenaires, blog, bilinguisme, application mobile.

## 7. Brief de développement (pour Claude)

Cette section est destinée à l'assistant ou au développeur qui va construire le nouveau site. Elle prime sur les sections précédentes en cas de contradiction.

### 7.1 Périmètre de cette phase

**À construire maintenant : le site client (public) uniquement.**

| Page | Route | Contenu |
|---|---|---|
| Accueil | `/` | Héros, chiffres clés, aperçu des services, aperçu du YEM, comment ça marche, aperçu des packs, appel à l'adhésion |
| Services | `/services` et `/services/:slug` | Une page par service : épargne & consommation, YEM, assistance & conseil, investissement, formation, entraide |
| Le YEM | `/le-yem` | Description, fonctionnement, règles d'achat et de rachat, avertissement « pas de cours légal », FAQ |
| Packs / Tarifs | `/packs` | Adhésion (personne physique 25 000 F, personne morale 50 000 F) et packs C1 à C6 |
| Qui sommes-nous | `/a-propos` | Mission, valeurs, organes, équipe |
| Documents officiels | `/documents` | Statuts, règlement intérieur, agrément, rapports (liens PDF) |
| Partenaires | `/partenaires` | Annuaire des commerçants acceptant le YEM (données fictives / JSON en attendant l'API) |
| Actualités | `/actualites` | Liste d'articles (contenu statique en attendant l'API) |
| FAQ | `/faq` | Questions fréquentes en accordéon |
| Contact | `/contact` | Formulaire, téléphones, e-mail, adresse, carte, bouton WhatsApp |
| Inscription | `/inscription` | Formulaire en étapes reprenant tous les champs de la section 3.2 |
| Connexion | `/connexion` | Pernum (ou téléphone) + mot de passe |
| Mot de passe oublié | `/mot-de-passe-oublie` | Pernum + e-mail ou téléphone |
| Pages légales | `/mentions-legales`, `/confidentialite`, `/conditions` | Textes juridiques |
| 404 | `*` | Page introuvable avec retour à l'accueil |

**Hors périmètre pour l'instant (phases suivantes) :**

- **Tableau de bord client** (après connexion) : prévoir seulement la route protégée `/espace-membre` avec une page provisoire, un contexte d'authentification et un garde de route (`ProtectedRoute`), pour brancher le tableau de bord plus tard sans refonte.
- **Tableau de bord administrateur** : prévoir l'emplacement `/admin` (même principe, rôle `admin`), sans le construire.
- Les formulaires d'inscription, de connexion et de contact appellent une **couche de service API** (`src/services/`) avec des fonctions typées et des réponses simulées (mock) tant que le back-end n'existe pas.

### 7.2 Stack technique (production)

| Domaine | Outil |
|---|---|
| Base | React 18+ avec TypeScript (mode `strict`), Vite |
| Routage | React Router (routes chargées en lazy loading) |
| Styles | Tailwind CSS, variables CSS pour les couleurs (thème clair / sombre) |
| Composants accessibles | Radix UI ou shadcn/ui (accordéon, dialogue, menu, onglets) |
| Icônes | **lucide-react** (aucun emoji, voir 7.4) |
| Formulaires | React Hook Form + Zod (validation typée, messages en français) |
| Données serveur | TanStack Query + Axios ou fetch, couche `src/services/` |
| Animations | Framer Motion (discrètes, respect de `prefers-reduced-motion`) |
| Internationalisation | i18next / react-i18next (français par défaut, anglais prévu) |
| SEO | react-helmet-async (titre, description, Open Graph par page), sitemap.xml, robots.txt. Si le référencement devient prioritaire, envisager un pré-rendu (vite-plugin-ssg) ou une migration vers Next.js |
| Qualité | ESLint, Prettier, Husky + lint-staged |
| Tests | Vitest + React Testing Library (unitaires), Playwright (parcours inscription, connexion, contact) |
| Performance | Images WebP/AVIF, chargement différé, objectif Lighthouse ≥ 90 sur mobile |
| Configuration | Variables d'environnement `.env` (`VITE_API_URL`, `VITE_RECAPTCHA_SITE_KEY`, `VITE_WHATSAPP_NUMBER`) |
| Déploiement | Build statique (Vercel, Netlify ou serveur Nginx), HTTPS |

Arborescence suggérée :

```
src/
  app/            # routeur, providers (Query, Theme, Auth, i18n)
  components/
    layout/       # Navbar (verre), Footer, Layout
    ui/           # Button, Card, Input, Badge, Section...
  features/
    home/ services/ yem/ packs/ contact/ auth/
  pages/
  services/       # appels API typés + mocks
  hooks/
  lib/            # utilitaires, schémas Zod
  data/           # contenus statiques (services, packs, FAQ) en TS
  styles/         # globals.css, tokens.css
  types/
```

Les contenus métier (packs, prix du YEM, taux de réduction, chiffres clés) doivent être dans **`src/data/` ou fournis par l'API**, jamais écrits en dur dans les composants, car ils doivent être revalidés (voir section 4).

### 7.3 Design : barre de navigation en verre (« water glass »)

La barre de navigation (et le menu mobile, ainsi que les éventuelles barres flottantes) utilise un effet **verre dépoli / liquid glass** :

- Barre fixe en haut (`position: sticky` ou `fixed`), légèrement détachée du bord (marges et coins arrondis, type « pilule ») sur ordinateur.
- Fond translucide : `background: rgba(255, 255, 255, 0.55)` en mode clair, `rgba(15, 23, 20, 0.45)` en mode sombre (à ajuster aux couleurs de la charte).
- Flou d'arrière-plan : `backdrop-filter: blur(16px) saturate(180%)` avec le préfixe `-webkit-backdrop-filter`.
- Bordure fine lumineuse : `1px solid rgba(255, 255, 255, 0.35)` et reflet interne `box-shadow: inset 0 1px 0 rgba(255,255,255,0.4), 0 8px 32px rgba(0,0,0,0.12)`.
- L'opacité et l'ombre augmentent légèrement au défilement.
- Repli si `backdrop-filter` n'est pas supporté : fond plus opaque (`@supports not (backdrop-filter: blur(1px))`).
- Menu mobile : panneau plein écran ou tiroir avec le même effet verre, fermeture au clic extérieur et à la touche Échap.
- Contraste du texte sur le verre conforme WCAG AA (4,5:1).

Exemple de classe Tailwind de départ :

```
bg-white/55 dark:bg-neutral-900/45 backdrop-blur-xl backdrop-saturate-150
border border-white/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_8px_32px_rgba(0,0,0,0.12)]
rounded-2xl
```

### 7.4 Icônes : aucun emoji

Le site actuel utilise des emojis. Le nouveau site **n'en utilise aucun** et les remplace par des icônes **lucide-react** (taille et épaisseur de trait cohérentes, `aria-hidden` si décoratives, libellé accessible sinon).

| Emploi actuel | Emoji actuel | Icône lucide-react |
|---|---|---|
| Bascule mode sombre | 🌙 | `Moon` / `Sun` |
| Valeur : Entraide | 🤝 | `Handshake` |
| Valeur : Échange | 🔄 | `ArrowLeftRight` |
| Valeur : Responsabilité | 🛡️ | `ShieldCheck` |
| Valeur : Création de valeur | 💎 | `Gem` |
| YEM, monnaie numérique | 💚 | `Coins` ou `Wallet` |
| Rachat du YEM | 💰 | `BadgeDollarSign` ou `Banknote` |
| Consommer avec le YEM | 🛒 | `ShoppingCart` |
| Avertissement | ⚠️ | `TriangleAlert` |
| Personne physique | 👤 | `User` |
| Personne morale | 🏢 | `Building2` |
| T-Money / Flooz | 📱 | `Smartphone` (ou logos officiels des opérateurs, avec autorisation) |
| Espèces | 💵 | `Banknote` |
| Connexion (Pernum) | 🔑 | `KeyRound` |
| Services : épargne, conseil, investissement, formation, entraide | — | `PiggyBank`, `MessageCircleQuestion`, `TrendingUp`, `GraduationCap`, `Users` |
| Contact : téléphone, e-mail, adresse | — | `Phone`, `Mail`, `MapPin` |
| Réseaux sociaux | — | Icônes de marque (par exemple `react-icons/si` ou `simple-icons`), lucide n'ayant plus les logos de marque |

### 7.5 Couleurs

> **À compléter avant de lancer le développement.** Les couleurs exactes du site actuel n'ont pas pu être extraites automatiquement : le code CSS n'est pas accessible depuis l'outil d'analyse. Remplir le tableau ci-dessous avec les valeurs du site (méthode juste après), puis les reporter dans `src/styles/tokens.css`.

| Jeton (token) | Emploi | Mode clair | Mode sombre |
|---|---|---|---|
| `--color-primary` | Couleur principale (boutons, liens, titres) | `#______` | `#______` |
| `--color-primary-hover` | Survol des boutons principaux | `#______` | `#______` |
| `--color-secondary` | Couleur secondaire / accent | `#______` | `#______` |
| `--color-accent` | Mises en avant (badges, chiffres clés) | `#______` | `#______` |
| `--color-bg` | Fond de page | `#______` | `#______` |
| `--color-surface` | Fond des cartes et sections | `#______` | `#______` |
| `--color-text` | Texte principal | `#______` | `#______` |
| `--color-text-muted` | Texte secondaire | `#______` | `#______` |
| `--color-border` | Bordures | `#______` | `#______` |
| `--color-hero-gradient` | Dégradé du héros (si présent) | `linear-gradient(...)` | `linear-gradient(...)` |
| `--color-footer-bg` | Fond du pied de page | `#______` | `#______` |
| `--color-success` | Messages de succès | `#______` | `#______` |
| `--color-warning` | Avertissements (encadré YEM) | `#______` | `#______` |
| `--color-danger` | Erreurs de formulaire | `#______` | `#______` |

**Comment récupérer les couleurs du site actuel :**

1. Ouvrir `https://scoopcectogo.com/acceuil.php` dans Chrome.
2. Clic droit sur la page, puis « Inspecter » (ou F12).
3. Onglet **Sources** ou **Elements** : chercher le bloc `<style>` ou le fichier CSS, et repérer les variables `:root { --... }` et les valeurs `#xxxxxx`.
4. Autre méthode : dans DevTools, panneau **CSS Overview** (menu ⋮ > More tools > CSS Overview > Capture overview), qui liste toutes les couleurs de la page.
5. Faire de même pour le mode sombre (cliquer sur la lune) et pour `inscription.php` / `login.php`.

Règles pour l'implémentation :

- Toutes les couleurs passent par des **variables CSS** (`tokens.css`) mappées dans `tailwind.config` ; aucune couleur codée en dur dans les composants.
- Mode sombre via la classe `dark` sur `<html>`, choix mémorisé et valeur par défaut selon `prefers-color-scheme`.
- Vérifier le contraste AA de chaque couple texte / fond, y compris sur la barre en verre.

### 7.6 Exigences générales

- Responsive mobile d'abord (320 px à 1440 px+), testé sur réseau 3G.
- Accessibilité : HTML sémantique, navigation au clavier, focus visible, attributs `alt` et `aria`.
- Formulaires : validation côté client avec Zod, messages d'erreur en français, protection reCAPTCHA v3 et champ pot de miel conservés sur l'inscription et le contact.
- Champs d'inscription à reprendre fidèlement : type de personne, dénomination et statut juridique (personne morale), nom, prénom, Pernum, téléphone, e-mail, mot de passe et confirmation, mode de paiement (T-Money, Flooz, espèces), engagement, lieu et date.
- Aucun secret dans le code front ; clés publiques uniquement via `.env`.
- Code typé sans `any`, composants réutilisables, README d'installation et de déploiement.

*Document établi à partir des pages publiques du site au 4 octobre 2026.*