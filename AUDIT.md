# Audit — reflexdemenagement.fr

> Date : 26/11/2026 · Branche : `feat/audit-upgrade` · Base : `main` + WIP formulaire (commits `2b3b231`, `e04000d`)
> Site : vitrine one-page Angular 15 + Tailwind 3, hébergée sur Netlify, fonction serverless `devis`.
> Objectif : générer des demandes de devis (particuliers et entreprises, Paris / Île-de-France).

## Mesures réalisées

| Mesure | Résultat |
|---|---|
| `ng build --configuration=production` | ✅ OK — initial 391 kB brut / **96 kB transférés** (main 77 kB, polyfills 14 kB, CSS 5 kB) |
| Lint | ❌ Aucun linter configuré (`npm run lint` n'existe pas ; la CI l'ignore via `continue-on-error`) |
| Tests | ❌ 0 fichier `.spec.ts`, `tsconfig.spec.json` absent → `ng test` cassé |
| `npm audit` | ❌ **73 vulnérabilités** (4 critiques, 39 hautes, 26 modérées, 4 faibles) — quasi toutes dans la chaîne de build/dev-server Angular 15 |
| `npm outdated` | Angular 15.2 → **22.3** disponible (7 versions majeures de retard, v15 hors support depuis mai 2024) |
| Lighthouse 12 (site en prod) — mobile | Perf **64** · A11y **81** · Best practices **100** · SEO **100** |
| Lighthouse 12 (site en prod) — desktop | Perf **87** · A11y **89** · Best practices **100** · SEO **100** |
| Core Web Vitals (labo, mobile) | FCP 4,3 s · **LCP 9,9 s** 🔴 · CLS 0 · TBT 0 ms · Poids total 1,2 Mo |
| En-têtes HTTP (prod) | HSTS ✅, X-Frame-Options ✅, nosniff ✅, Referrer-Policy ✅ · **CSP ❌**, Permissions-Policy ❌ |

---

## 🔴 Découvertes critiques (à lire en premier)

1. **Le formulaire de devis n'envoie aucun email.** `netlify/functions/devis.js` valide puis renvoie `200` avec des liens `mailto:`/Gmail générés — rien n'est expédié. Le WIP n'utilise plus ces liens : **chaque demande serait affichée « bien reçue » au client et perdue.**
2. **En production, le WIP appelle `http://localhost:8888`.** `angular.json` n'a pas de `fileReplacements` : `environment.prod.ts` n'est jamais utilisé (vérifié : la chaîne `localhost:8888/.netlify/functions/devis` est dans `dist/main.*.js`).
3. **Contrat front/back incohérent** : le front rend `message` optionnel, le back l'exige → **400 dès que le message est vide**. Le back ignore `prenom`, `consentement` et le honeypot.
4. **Mentions légales et politique de confidentialité absentes** (liens `#` ; `/politique-de-confidentialite` renvoie la page d'accueil). Obligatoire pour une entreprise (LCEN art. 6) et pour un formulaire collectant des données personnelles (RGPD art. 13).

> Le site en ligne tourne sur `main` (sans le WIP) : les points 2 et 3 ne cassent **pas encore** la prod, mais bloquent la mise en ligne du WIP.

---

## 1. Performance

| # | Problème | Impact | Fichier(s) | Correction proposée | Effort | Prio |
|---|---|---|---|---|---|---|
| P1 | Image hero `moving-joy.png` = **781 Ko PNG**, élément LCP, sans `width/height`, sans `fetchpriority` | LCP mobile 9,9 s ; 650 Ko économisables | `hero.component.html`, `assets/` | Convertir en AVIF/WebP en 3 tailles (`srcset`/`sizes`), `width`/`height`, `fetchpriority="high"`, `<link rel="preload">` ; garder un JPEG 1200×630 ~100 Ko pour l'OG | S | 🔴 |
| P2 | Font Awesome 6.0 complet (CSS ~100 Ko + webfonts) chargé en CDN **bloquant** pour ~30 icônes | 1,1 s de rendu bloqué | `index.html` | Remplacer par des SVG inline des seules icônes utilisées (rendu identique) ou un sous-ensemble auto-hébergé | M | 🟠 |
| P3 | CSS Fontshare (Clash Display, 6 graisses) et Google Fonts (Inter, 5 graisses) bloquants, sans `preconnect` | ~0,8 s bloquant + 330 ms de connexion | `index.html` | Auto-héberger les woff2 (2–3 graisses utiles chacune), `font-display: swap`, preload de la graisse du H1 | S | 🟠 |
| P4 | Assets servis en `Cache-Control: max-age=0` (même les bundles hashés) | Revisite = tout re-télécharger | `netlify.toml` | `Cache-Control: public, max-age=31536000, immutable` sur `/*.js`, `/*.css`, `/assets/*` (renommés/hashés) | S | 🟠 |
| P5 | Texture `noise.svg` chargée depuis `grainy-gradients.vercel.app` (tiers non maîtrisé) | Requête externe, peut disparaître | `hero.component.html` | Copier le SVG en local (ou le supprimer : opacité 3 %) | S | 🟢 |
| P6 | 3 « blobs » `blur(100px)` animés en boucle + `mix-blend-multiply` | Coût GPU sur mobiles bas de gamme | `hero.component.html`, `tailwind.config.js` | Conserver le rendu, mais stopper l'animation avec `prefers-reduced-motion` et réduire le blur sur mobile | S | 🟢 |
| P7 | Pas de `browserslist` → polyfills/JS legacy (9 Ko) | Mineur | `frontend/` | Réglé de fait par l'upgrade Angular (esbuild + cibles modernes) | S | 🟢 |

## 2. SEO

| # | Problème | Impact | Fichier(s) | Correction proposée | Effort | Prio |
|---|---|---|---|---|---|---|
| S1 | `robots.txt` annonce `sitemap.xml` qui **n'existe pas** (renvoie l'index HTML en 200 = soft 404) | Signal d'erreur dans Search Console | `src/robots.txt` | Créer `src/sitemap.xml` (+ pages légales) et l'ajouter aux assets | S | 🟠 |
| S2 | Aucune donnée structurée | Pas de fiche enrichie (note, horaires, zone) | `index.html` | JSON-LD `MovingCompany` (LocalBusiness) : nom, téléphone, email, zone `areaServed`, horaires, `sameAs` (réseaux), `aggregateRating` **uniquement si conforme aux avis Google** | S | 🟠 |
| S3 | Domaine canonique = `reflexdemenagement.fr` (www → 301), mais `og:url`, `og:image`, `twitter:*` pointent vers `www.` ; pas de `<link rel="canonical">` | Signal canonique incohérent, redirection sur l'image OG | `index.html` | Ajouter `canonical` et aligner toutes les URLs sur le domaine sans www | S | 🟠 |
| S4 | Balises Twitter en `property=` au lieu de `name=` ; pas de `og:locale`, `og:site_name`, dimensions/alt de l'image OG | Aperçus de partage moins fiables | `index.html` | Corriger les attributs, ajouter `og:locale=fr_FR`, `og:image:width/height/alt` | S | 🟢 |
| S5 | Hiérarchie des titres : `h2` → `h4` (contact, témoignages, footer) | Structure sémantique faible (relevé Lighthouse) | `contact`, `testimonials`, `footer` | Passer en `h3` (style inchangé via classes) | S | 🟢 |
| S6 | Favicon = fichier texte de 38 octets (« Placeholder pour favicon.ico ») | Aucun favicon dans les onglets / résultats Google | `src/favicon.ico` | Générer favicon ICO + SVG + `apple-touch-icon` + `manifest.webmanifest` depuis le logo | S | 🟠 |
| S7 | One-page sans pages services dédiées | Peu de mots-clés positionnables (« déménagement piano Paris », « garde-meuble 92 »…) | — | **Option** : pages par service/zone (voir propositions) | L | 🟢 |

## 3. Accessibilité (WCAG 2.2 AA)

| # | Problème | Impact | Fichier(s) | Correction proposée | Effort | Prio |
|---|---|---|---|---|---|---|
| A1 | Bouton burger sans nom accessible, sans `aria-expanded`/`aria-controls` | Inutilisable au lecteur d'écran (4.1.2) | `header.component.html` | `aria-label="Ouvrir le menu"`, `aria-expanded`, `aria-controls` ; fermer avec Échap | S | 🔴 |
| A2 | Liens réseaux sociaux icône seule sans libellé | Liens vides (2.4.4, 4.1.2) | `footer.component.html` | `aria-label` + icônes `aria-hidden="true"` | S | 🟠 |
| A3 | Contrastes insuffisants : blanc sur `#E65100` (3,78:1), `gray-500` sur fond sombre (3,69:1), `gray-500` sur crème | 1.4.3 non conforme | `services`, `footer`, `contact`, bouton submit en sombre | Orange texte → `#C2410C`/`#B84000` (≥ 4,5:1) **uniquement là où il porte du texte** ; `gray-400` sur sombre. Écart visuel minime, à valider | S | 🟠 |
| A4 | Bouton « Envoyer » `disabled` tant que le formulaire est invalide : l'utilisateur ne voit jamais **pourquoi** | Blocage formulaire, échec 3.3.1 | `contact.component.html/.ts` | Bouton toujours actif ; au submit invalide : marquer les champs, focus sur le 1er champ en erreur, résumé d'erreurs | S | 🟠 |
| A5 | Messages d'erreur `role="alert"` + `aria-live="polite"` contradictoires ; `aria-invalid` absent ; messages de succès/erreur globaux non annoncés | Retours non vocalisés correctement | `contact.component.html` | `aria-invalid`, région `aria-live` unique pour succès/échec | S | 🟠 |
| A6 | Aucun lien d'évitement, pas de `<main>`, pas de landmarks | 2.4.1 | `app.component.html` | `<a class="sr-only focus:not-sr-only" href="#main">`, wrapper `<main id="main">` | S | 🟠 |
| A7 | Aucune prise en compte de `prefers-reduced-motion` (blobs, fade-in, scroll smooth, hovers translate) | 2.3.3 (AAA) / confort | `styles.scss`, `tailwind.config.js` | Media query globale qui neutralise animations et `scroll-behavior` | S | 🟠 |
| A8 | Focus visible : `outline-none` sur tous les champs (ring orange OK), mais liens/boutons sans style de focus clair, menu mobile ouvert hors écran (`left:-100%`) toujours tabulable | 2.4.7 / 2.4.11 | `header.component.scss`, `styles.scss` | Style `:focus-visible` global ; `visibility:hidden`/`inert` quand le menu est fermé | S | 🟠 |
| A9 | Icônes décoratives (`<i class="fas …">`) non masquées | Bruit au lecteur d'écran | tous les templates | `aria-hidden="true"` (fait automatiquement si passage aux SVG, cf. P2) | S | 🟢 |
| A10 | Carte flottante hero visible uniquement au survol souris | Info inaccessible clavier/tactile | `hero.component.html` | Afficher aussi sur `focus-within` / la rendre statique sur mobile (ou la retirer, cf. C4) | S | 🟢 |
| A11 | Champs sans `autocomplete` (nom, email, tel, adresses) | 1.3.5 | `contact.component.html` | `autocomplete="given-name"`, `family-name`, `email`, `tel`, `street-address` | S | 🟢 |

## 4. Responsive & compatibilité

| # | Problème | Impact | Fichier(s) | Correction proposée | Effort | Prio |
|---|---|---|---|---|---|---|
| R1 | Menu mobile positionné à `top: 80px` alors que le header fait 100 px → chevauchement | Bug visuel menu mobile | `header.component.scss` | Utiliser une variable de hauteur unique | S | 🟠 |
| R2 | `height: calc(100vh - …)` sur mobile (barre d'adresse iOS) | Menu tronqué sur Safari iOS | `header.component.scss` | `100dvh` | S | 🟢 |
| R3 | Classes `animation-delay-2000/4000` et `delay-100…500` utilisées mais **non définies** (les `delay-*` Tailwind ne s'appliquent qu'aux transitions) | Les effets « en cascade » prévus ne fonctionnent pas | `hero.component.html`, `tailwind.config.js` | Définir les utilitaires `animation-delay-*` (rendu = intention d'origine) | S | 🟢 |
| R4 | Mode sombre : logo forcé `invert + grayscale + mix-blend-screen` | Logo dénaturé en sombre | `header`, `footer` | Fournir une variante claire du logo (SVG) | S | 🟢 |
| R5 | Pas de test réel multi-navigateurs | — | — | Vérification manuelle Safari iOS / Chrome Android / Firefox (phase 3) | S | 🟢 |

## 5. Sécurité

| # | Problème | Impact | Fichier(s) | Correction proposée | Effort | Prio |
|---|---|---|---|---|---|---|
| X1 | 73 vulnérabilités npm (Angular 15 EOL, webpack, ws, websocket-driver…) | Surtout outillage de dev/build, mais plus aucun correctif de sécurité pour Angular 15 | `package.json` | **Upgrade Angular 22** (lot 1) puis `npm audit` à 0 haute/critique | L | 🔴 |
| X2 | Fonction `devis` : `console.log` du body complet (nom, email, téléphone, adresses) | Données personnelles dans les logs Netlify (RGPD) | `netlify/functions/devis.js` | Ne plus logger de PII | S | 🔴 |
| X3 | Fonction `devis` : CORS `*`, méthodes `PUT/DELETE` annoncées, pas de limite de taille, pas de vérif honeypot/consentement côté serveur, pas de rate-limit | Relais de spam / abus du futur envoi d'email | `netlify/functions/devis.js` | Origine restreinte au domaine, POST only, validation stricte + longueurs max, honeypot + délai minimal de remplissage, rate-limit simple (Netlify Blobs) ; option Cloudflare Turnstile | M | 🔴 |
| X4 | Pas de Content-Security-Policy ni Permissions-Policy ; `X-XSS-Protection` obsolète | Défense XSS / clickjacking incomplète | `netlify.toml` | CSP stricte (facile une fois fonts/icônes auto-hébergées), `Permissions-Policy`, HSTS `includeSubDomains; preload`, supprimer X-XSS-Protection | S | 🟠 |
| X5 | Lien avis Google `target="_blank"` sans `rel` + URL de 600 caractères avec paramètres de session | Mineur (noopener implicite dans les navigateurs récents), URL fragile | `testimonials.component.html` | `rel="noopener noreferrer"` + lien court officiel de la fiche (`g.page/…` ou `search.google.com/local/reviews?placeid=…`) | S | 🟢 |
| X6 | Aucun secret trouvé dans le repo ni dans l'historique ✅ | — | — | Les futures clés (API email) iront en variables d'env Netlify | — | — |
| X7 | `nginx.conf` (image Docker) sans en-têtes de sécurité | Uniquement si l'image Docker est utilisée | `frontend/nginx.conf` | Aligner sur `netlify.toml` ou supprimer Docker si inutile (à décider) | S | 🟢 |

## 6. Qualité de code

| # | Problème | Impact | Fichier(s) | Correction proposée | Effort | Prio |
|---|---|---|---|---|---|---|
| Q1 | Aucun linter/formatter | Erreurs non détectées, style incohérent | `frontend/` | `angular-eslint` + Prettier (+ `prettier-plugin-tailwindcss`), script `lint` | S | 🟠 |
| Q2 | CSS mort : `footer.component.scss` (282 lignes, ~20 sélecteurs d'un ancien template jamais utilisés), parties de `header.component.scss` (`.dark-mode`, commentaires) | Poids et confusion | `footer/`, `header/` | Supprimer | S | 🟢 |
| Q3 | Mélange SCSS composant + Tailwind avec `!important` (`!text-gray-700`) dans le header | Maintenance difficile | `header.component.*` | Migrer le header en Tailwind pur (rendu identique) | M | 🟢 |
| Q4 | Logique `scrollToSection` dupliquée (header, hero, footer) ; `FooterComponent.scrollToSection` et `currentYear` inutilisés ; `getStarArray` et `rating` inutilisés | Code mort / duplication | `header`, `hero`, `footer`, `testimonials` | Ancres natives + `scroll-margin-top` (déjà présent) ; supprimer le code mort | S | 🟢 |
| Q5 | Formulaire : `telephone` `required` **et** validateur « email OU téléphone » (contradictoire, l'email l'est aussi) ; `setErrors` dans un validateur de groupe (écrase les autres erreurs) ; `subscribe` non désabonné ; types `any` | Bugs de validation, UI qui affiche « Email » sans `*` alors qu'il est requis | `contact.component.ts` | Décider la règle (recommandé : email **et** téléphone requis — utile pour un devis), validateur de contrôle dédié, formulaire typé | S | 🟠 |
| Q6 | Libellés `typeService` différents entre front (`demenagement-particulier`, `services-complementaires`) et back (`demenagement-residentiel`, `transport-piano`…) | Email avec identifiant brut | `contact.component.html`, `devis.js` | Liste partagée unique | S | 🟠 |
| Q7 | `angular.json` : `tsconfig.spec.json` référencé mais absent, Karma/Jasmine installés sans aucun test | Dépendances inutiles | `angular.json`, `package.json` | Retirer Karma ; ajouter quelques tests ciblés (validateurs, fonction devis) avec Vitest (outil par défaut d'Angular 21+) | M | 🟢 |
| Q8 | `AppComponent.title = 'Déménagement Pro'` inutilisé ; `AppRoutingModule` vide | Code mort (le routing servira aux pages légales) | `app.*` | Nettoyer / utiliser pour les pages légales | S | 🟢 |

## 7. Contenu & UX

| # | Problème | Impact | Fichier(s) | Correction proposée | Effort | Prio |
|---|---|---|---|---|---|---|
| C1 | Mentions légales, Politique de confidentialité, CGV → liens `#` | Non-conformité légale, perte de confiance | `footer.component.html`, `contact.component.html` | Créer les pages (routes Angular) — **contenu légal à me fournir** (raison sociale, SIRET/RCS, siège, directeur de publication, hébergeur Netlify, assurance) | M | 🔴 |
| C2 | © **2023** codé en dur | Site perçu comme non entretenu | `footer.component.html` | `{{ currentYear }}` (déjà dans le composant) | S | 🟠 |
| C3 | Liens Facebook / Instagram / LinkedIn et colonne « Nos Services » du footer en `href="#"` (liens morts) | Frustration, confiance | `footer.component.html` | URLs réelles ou suppression ; services → ancre `#services` | S | 🟠 |
| C4 | Allégations à vérifier : « 500+ clients heureux », « 4.9/5 sur Google », « Disponible demain » (statique, toujours affiché), « Déménagement Premium dans toute la France » | Risque de pratique commerciale trompeuse si inexact | `hero.component.html` | Me confirmer les chiffres ; retirer ou reformuler « Disponible demain » | S | 🟠 |
| C5 | Message de succès « Nous vous contacterons dans les 24h » alors que rien n'est envoyé | Clients perdus | `contact.component.html` | Réglé par le lot formulaire ; + email d'accusé de réception au client | — | 🔴 |
| C6 | Incohérences : footer liste « Monte-Meubles » / « Emballage & Cartons » absents de la section Services ; menu déroulant du formulaire ≠ cartes services ; nom « Wasry Reflex » vs « Reflex » | Message confus | `footer`, `services`, `contact` | Une seule liste de services, utilisée partout | S | 🟠 |
| C7 | Coquilles : « Nettoyage pre/post » → « pré/post » ; « disponibilité 7j/7 » vs horaires « Lun – Sam » | Crédibilité | `services.component.ts`, `about.component.html` | Corriger / harmoniser | S | 🟢 |
| C8 | Bouton téléphone du header en **dégradé bleu** (seul élément bleu, hors charte orange/ardoise) | Incohérence visuelle | `header.component.scss` | Proposer `reflex-dark`/`reflex-orange` — **à valider (identité visuelle)** | S | 🟢 |
| C9 | Pas de CTA mobile persistant (appel / devis) | Conversion mobile | — | **Option** : barre d'action collante sur mobile | S | 🟢 |

## 8. DX & déploiement

| # | Problème | Impact | Fichier(s) | Correction proposée | Effort | Prio |
|---|---|---|---|---|---|---|
| D1 | Node incohérent : **18 sur Netlify (EOL)**, 20 en CI et Docker, 24.11 en local ; Angular 22 exige Node ≥ 22.22 ou ≥ 24.15 | Builds non reproductibles, bloquant pour l'upgrade | `netlify.toml`, `ci-cd.yml`, `Dockerfile` | `.nvmrc` = 24 partout, `engines` dans `package.json` | S | 🔴 |
| D2 | `netlify.toml` fait `npm install` (pas `npm ci`) | Lockfile non respecté | `netlify.toml` | `npm ci` | S | 🟠 |
| D3 | CI : lint factice, pas de Lighthouse CI, pas de vérif de la fonction ; build Docker inutile si l'hébergement est Netlify | Régressions non détectées | `.github/workflows/ci-cd.yml` | Jobs : `lint` + `build` + `npm audit --audit-level=high` + Lighthouse CI (budgets perf/a11y) | M | 🟠 |
| D4 | README obsolète : dossier `backend/` inexistant, `LICENSE` absent, URL `votre-username`, Angular 15/Node 18, rien sur `netlify dev` ni les variables d'env | Onboarding | `README.md` | Réécriture (phase 3) | S | 🟢 |
| D5 | Pas de config de dev pour la fonction (`netlify dev`), `.env.example` absent | Impossible de tester le formulaire en local | racine | Script `npm run dev:netlify`, `.env.example` | S | 🟠 |
| D6 | Docker + nginx maintenus en parallèle de Netlify | Double maintenance | `frontend/Dockerfile`, `nginx.conf` | À décider : garder (portabilité) ou supprimer | S | 🟢 |

---

## Envoi des emails — solution proposée

| Option | Principe | Avantages | Inconvénients |
|---|---|---|---|
| **A. Resend via la fonction Netlify** *(recommandée)* | `devis.js` valide puis envoie 1 email à l'entreprise (reply-to = client) + 1 accusé de réception au client | Contrôle total, validation/anti-spam côté serveur, emails HTML propres, gratuit jusqu'à 3 000 emails/mois | Créer un compte Resend + ajouter 3 enregistrements DNS (SPF/DKIM) sur `reflexdemenagement.fr`, clé API dans les variables Netlify |
| B. Netlify Forms | Formulaire détecté par Netlify, notification email intégrée | Zéro code serveur, filtre anti-spam Akismet | 100 envois/mois gratuits, notification brute, pas d'accusé client, intégration SPA un peu bancale, fonction `devis` à supprimer |
| C. SMTP Gmail (nodemailer) | Envoi via le compte Gmail existant | Pas de DNS | Mot de passe d'application Gmail, délivrabilité moyenne, limites Google — déconseillé |

---

## Upgrade Angular 15 → 22 — approche

- `ng update` **une version majeure à la fois** (16 → 17 → … → 22), build vérifié et commit à chaque palier.
- Migration vers le builder `application` (esbuild/Vite) : la sortie devient `dist/demenagement-site/browser` → mise à jour de `netlify.toml` et du `Dockerfile`.
- TypeScript, zone.js et rxjs montés avec Angular ; Tailwind **reste en v3** (la v4 est une refonte majeure, à décider séparément).
- Migrations automatiques proposées : control flow (`@if`/`@for`, `*ngIf` étant déprécié), `inject()`. Passage en composants **standalone** : optionnel, sans effet visuel.
- **Prérequis côté toi : mettre à jour Node en local en ≥ 24.15** (actuel : 24.11.1).

---

## Score de départ

| Catégorie | Score | Source |
|---|---|---|
| Performance | **64** mobile / 87 desktop | Lighthouse |
| Accessibilité | **81** mobile / 89 desktop (audit manuel : ~65 % WCAG 2.2 AA) | Lighthouse + revue |
| Bonnes pratiques | 100 | Lighthouse |
| SEO | 100 (technique) — estimation réelle **6/10** (pas de sitemap, schema, canonical, favicon) | Lighthouse + revue |
| Sécurité | **4/10** (73 vulns, pas de CSP, fonction ouverte, PII loguées) | Estimation |
| Qualité de code | **5/10** (pas de lint ni tests, CSS mort, validation incohérente) | Estimation |
| Contenu & UX | **6/10** (bon message, mais liens morts, légal absent, ©2023) | Estimation |
| DX & déploiement | **4/10** (Node EOL, CI factice, README obsolète) | Estimation |
| **Fonctionnel : formulaire de devis** | **0/1 — aucun email envoyé** | Revue |

---

## Plan d'upgrade priorisé

| Lot | Contenu | Points | Prio | Effort |
|---|---|---|---|---|
| **1. Fondations** | Node 24 partout (`.nvmrc`, Netlify, CI, Docker), `npm ci` ; upgrade Angular 15 → 22 palier par palier ; builder `application` ; ESLint + Prettier ; retrait Karma ; `npm audit` propre | D1, D2, X1, P7, Q1, Q7 | 🔴 | L |
| **2. Formulaire de devis fonctionnel** | `fileReplacements` ; contrat front/back unifié (liste de services partagée) ; envoi email (option A) + accusé de réception ; sécurisation de la fonction (CORS, validation, honeypot, rate-limit, plus de PII loguées) ; UX/a11y du formulaire ; `netlify dev` + `.env.example` | C5, X2, X3, Q5, Q6, A4, A5, A11, D5 | 🔴 | M |
| **3. Conformité légale** | Routes + pages Mentions légales / Confidentialité / (CGV si fournies) ; liens footer et consentement | C1 | 🔴 | M |
| **4. Performance** | Image hero responsive AVIF/WebP + preload ; fonts auto-hébergées ; icônes SVG ; cache immutable ; noise en local | P1–P6 | 🟠 | M |
| **5. Accessibilité** | Burger, landmarks, skip-link, focus-visible, reduced-motion, contrastes, titres, `aria-hidden` | A1–A3, A6–A10, S5 | 🟠 | M |
| **6. SEO** | sitemap, canonical, OG/Twitter, JSON-LD MovingCompany, favicon + manifest | S1–S4, S6 | 🟠 | S |
| **7. Sécurité HTTP** | CSP, Permissions-Policy, HSTS preload, lien Google propre | X4, X5, X7 | 🟠 | S |
| **8. Contenu & nettoyage** | ©année, liens morts, cohérence services, coquilles, allégations, CSS/code mort, bugs responsive menu | C2–C4, C6–C8, Q2–Q4, Q8, R1–R4 | 🟠/🟢 | S |
| **9. CI & doc** | CI lint/build/audit/Lighthouse CI, README | D3, D4, D6 | 🟢 | S |

**Pourquoi l'upgrade Angular en premier :** il réécrit `angular.json`, la sortie de build et les templates (control flow). Le faire après les autres lots créerait des conflits et obligerait à re-tester deux fois.

### Améliorations optionnelles (sur accord uniquement)
- Barre CTA collante sur mobile (Appeler / Devis) — fort impact conversion.
- Pages services / zones (SEO local : « déménagement Paris 17 », « garde-meuble Hauts-de-Seine »).
- Estimateur de volume (m³) intégré au formulaire.
- Analytics respectueux de la vie privée sans bannière cookies (Plausible, Umami ou Netlify Analytics).
- Widget d'avis Google réels (au lieu des avis codés en dur) ou mise à jour périodique.
- Pré-rendu (SSG) des pages via `@angular/ssr` pour un premier affichage plus rapide et un meilleur SEO.
- Tailwind 4.

### Décisions / informations attendues de ta part
1. Validation du plan et de l'ordre des lots.
2. Envoi des emails : option **A (Resend)** ? As-tu accès à la zone DNS de `reflexdemenagement.fr` ?
3. Informations légales : raison sociale, forme juridique, SIRET/RCS, adresse du siège, directeur de publication, assurance ; CGV existantes ?
4. URLs Facebook / Instagram / LinkedIn (ou suppression des icônes).
5. Confirmation des chiffres « 500+ clients », « 4.9/5 », et sort de « Disponible demain ».
6. Contrastes (A3) et bouton téléphone bleu (C8) : OK pour les petits ajustements de couleur ?
7. Docker/nginx : garder ou supprimer ?

---

# Bilan après upgrade (phase 3)

> Mesures du 26/11/2026 sur le build final de `feat/audit-upgrade`, servi localement avec compression gzip et
> les mêmes en-têtes que Netlify (CSP, cache). Le « avant » a été mesuré sur le site en production.
> Lighthouse 12, Chrome headless ; les valeurs mobile sont la moyenne de 2 passages.

## Avant / après

| Mesure | Avant | Après |
|---|---|---|
| Lighthouse mobile — Performance | 64 | **94–95** |
| Lighthouse mobile — Accessibilité | 81 | **100** |
| Lighthouse mobile — Bonnes pratiques / SEO | 100 / 100 | 100 / 100 |
| Lighthouse desktop — Perf / A11y / BP / SEO | 87 / 89 / 100 / 100 | **100 / 100 / 100 / 100** |
| LCP mobile | 9,9 s | **2,5 s** |
| FCP mobile | 4,3 s | **2,0 s** |
| CLS | 0 | 0 – 0,035 |
| Poids total de la page | 1 201 Ko | **236 Ko** (−80 %) |
| Requêtes vers des tiers (CDN, polices) | 5 domaines | **0** |
| JS initial (transféré) | 96 Ko | 105 Ko (+ routeur, pages légales, icônes ; − zone.js) |
| `npm audit` | 73 vulnérabilités (4 critiques) | **0** |
| Angular / TypeScript / Node | 15 (EOL) / 4.8 / 18 (EOL) | **22.3 / 6.0 / 24 LTS** |
| Lint / formatage / CI | inexistants (lint factice) | ESLint + Prettier + audit + Lighthouse CI |
| Formulaire de devis | **aucun email envoyé** | email entreprise + accusé client (Resend), anti-spam |
| En-têtes de sécurité | sans CSP | CSP stricte, Permissions-Policy, COOP |
| Pages légales | absentes | Mentions légales + Politique de confidentialité |

## Ce qui a été fait (par lot)

1. **Fondations** — Angular 15 → 22 palier par palier, builder esbuild, standalone + signals + zoneless, Node 24, ESLint/Prettier, Karma et Docker supprimés.
2. **Formulaire** — fonction réécrite (Resend, validation serveur, origine, honeypot + délai, limite par IP, plus de données personnelles dans les logs), formulaire typé et accessible, liste de services unique, correction de l'URL `localhost` en production.
3. **Légal** — routeur, pages Mentions légales / Confidentialité alimentées par `company.data.ts`, footer corrigé (Instagram, année dynamique, liens morts).
4. **Performance** — image hero AVIF/WebP responsive + preload, icônes SVG au lieu du CDN Font Awesome, polices auto-hébergées, cache long, zone.js retiré, logo redimensionné.
5. **Accessibilité** — burger accessible, lien d'évitement, focus visible, `prefers-reduced-motion`, contrastes AA, titres, notes lisibles.
6. **SEO** — vrai favicon + manifest, sitemap, canonical par page, OG/Twitter corrigés, JSON-LD `MovingCompany`.
7. **Sécurité HTTP** — CSP sans tiers, Permissions-Policy, COOP.
8. **Nettoyage** — CSS et code morts, coquilles, carte « Disponible demain » retirée.
9. **CI & doc** — CI complète avec Lighthouse CI, README réécrit.

Découverte en cours de route : la texture `noise.svg` chargée depuis `grainy-gradients.vercel.app` **redirige
désormais vers un domaine tiers inconnu** (`bytehavenai.com`). Elle est maintenant servie localement.

## ⚠️ À faire avant de fusionner dans `main`

1. **Compléter `frontend/src/app/data/company.data.ts`** : raison sociale, forme juridique, capital, siège, SIRET, RCS,
   TVA, n° d'inscription au registre des transporteurs, directeur de publication, assurance RC, médiateur de la
   consommation. Tant qu'ils manquent, les pages légales affichent « [À compléter] » en jaune.
2. **Configurer Resend** (voir README › « Mettre en route l'envoi des emails ») et ajouter `RESEND_API_KEY` dans
   Netlify **avant** le déploiement : sans clé, le formulaire répond « service indisponible » (au lieu de perdre
   la demande silencieusement comme avant).
3. Vérifier l'adresse de l'hébergeur Netlify dans les mentions légales (sur netlify.com › Legal).

## À vérifier à la main après déploiement

- [ ] Envoyer une vraie demande de devis depuis le site en ligne → réception dans Gmail + accusé côté client.
- [ ] Rendu réel sur iPhone (Safari) et Android (Chrome) : menu mobile, formulaire, sélecteur de date, mode sombre.
- [ ] `curl -I https://reflexdemenagement.fr/` : présence de `Content-Security-Policy` et `Permissions-Policy`.
- [ ] `curl -I https://reflexdemenagement.fr/main-XXXX.js` (nom réel dans la page) : `Cache-Control: … immutable`
      (si absent, la syntaxe `/*.js` n'est pas prise en compte par Netlify : il faudra l'adapter).
- [ ] Aperçu de partage (WhatsApp / Facebook Sharing Debugger) avec la nouvelle image OG.
- [ ] Google Search Console : soumettre `sitemap.xml`, tester les données structurées (Rich Results Test).
- [ ] Le lien « Voir tous nos avis sur Google » (URL de recherche longue, fragile) : le remplacer par le lien court
      de la fiche Google Business Profile (« Partager » › lien).

## Reste à faire / pistes (non réalisées)

| Sujet | Pourquoi | Effort |
|---|---|---|
| CGV | Document à fournir (voir recommandations ci-dessous), puis page + lien footer | M |
| « Disponibilité 7j/7 » (À propos) vs horaires « Lun – Sam » | Incohérence à trancher | S |
| Variante claire du logo pour le mode sombre (R4) | Le filtre `invert` dénature le logo | S (fichier à fournir) |
| Header en Tailwind pur (Q3) | Maintenance ; aucun effet visible | M |
| Page 404 dédiée | Les URL inconnues redirigent vers l'accueil (soft 404) | S |
| Pré-rendu (SSG) `@angular/ssr` | SEO et premier affichage encore meilleurs | M |
| Pages par service / zone | SEO local | L |
| Barre d'appel collante sur mobile, estimateur de volume, analytics sans cookies | Conversion / mesure | S–M |
| Tailwind 4 | Refonte de la config, sans gain visible | M |

## Notes sur les CGV

Pour un déménageur, les CGV encadrent le contrat conclu à partir du devis. Points habituellement couverts :
devis écrit et gratuit préalable (obligatoire pour les déménagements de particuliers), lettre de voiture,
déclaration de valeur et plafonds d'indemnisation, assurance, modalités de paiement et d'acompte,
annulation / report, droit de rétractation (contrats conclus à distance ou hors établissement), obligations du
client (accès, stationnement, objets exclus), réserves à la livraison et délai de réclamation, médiateur de la
consommation, juridiction compétente.

Recommandation : partir des **conditions générales types de la profession** (Chambre Syndicale du Déménagement /
fédération professionnelle) et les faire valider par un juriste ou l'organisation professionnelle — ce document
engage juridiquement l'entreprise et ne doit pas être rédigé « à l'aveugle ». Une fois le texte disponible, l'ajout
d'une page `/cgv` et du lien en pied de page prend quelques minutes.
