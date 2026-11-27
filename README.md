# REFLEX DÉMÉNAGEMENT — site vitrine

Site de [reflexdemenagement.fr](https://reflexdemenagement.fr) : présentation des services et formulaire de demande de devis.

- **Frontend** : Angular 22 (composants standalone, signals, sans zone.js), Tailwind CSS 3
- **Backend** : une fonction Netlify (`netlify/functions/devis.mjs`) qui envoie les demandes de devis par email via [Resend](https://resend.com)
- **Hébergement** : Netlify (déploiement automatique à chaque push sur `main`)

## Prérequis

- **Node.js ≥ 24.15** (ou ≥ 22.22) — version fixée dans [`.nvmrc`](.nvmrc). Angular 22 refuse les versions plus anciennes.
- npm (fourni avec Node)

## Démarrer en local

```bash
cd frontend
npm ci
npm start              # site seul sur http://localhost:4200 (le formulaire ne peut pas envoyer)
```

Pour tester **le site et le formulaire ensemble** (fonction Netlify comprise) :

```bash
# à la racine du dépôt
cp .env.example .env   # facultatif : sans clé Resend, l'email est simplement affiché dans le terminal
npx netlify-cli dev    # http://localhost:8888
```

## Scripts (`frontend/`)

| Commande               | Rôle                                                     |
| ---------------------- | -------------------------------------------------------- |
| `npm start`            | serveur de développement (accessible sur le réseau local) |
| `npm run build`        | build de production dans `dist/demenagement-site/browser` |
| `npm run lint`         | ESLint (TypeScript + templates, règles d'accessibilité)   |
| `npm run format`       | formate le code avec Prettier                             |
| `npm run format:check` | vérifie le formatage (utilisé par la CI)                  |

## Déploiement (Netlify)

La configuration est dans [`netlify.toml`](netlify.toml) : build, Node 24, redirection SPA, fonctions, en-têtes de sécurité (CSP…) et de cache.
Chaque push sur `main` déclenche un déploiement ; chaque pull request obtient une prévisualisation.

### Variables d'environnement (Netlify › Site configuration › Environment variables)

| Variable         | Obligatoire | Description                                                                 |
| ---------------- | ----------- | --------------------------------------------------------------------------- |
| `RESEND_API_KEY` | **oui**     | clé API Resend. Sans elle, le formulaire répond « service indisponible ».    |
| `DEVIS_TO`       | non         | destinataire des demandes (défaut : `reflexdemenagement@gmail.com`)          |
| `DEVIS_FROM`     | non         | expéditeur, sur le domaine vérifié (ex. `Reflex Déménagement <devis@reflexdemenagement.fr>`) |

### Mettre en route l'envoi des emails (une seule fois)

1. Créer un compte sur [resend.com](https://resend.com) **avec l'adresse `reflexdemenagement@gmail.com`**.
2. Créer une clé API (« API Keys » › « Create ») et la copier dans la variable Netlify `RESEND_API_KEY`, puis redéployer.
   → À ce stade, les demandes arrivent déjà dans la boîte Gmail (expéditeur `onboarding@resend.dev`).
3. Pour envoyer aussi l'**accusé de réception au client**, vérifier le domaine : Resend › « Domains » › « Add domain » › `reflexdemenagement.fr`.
   Resend affiche 3 ou 4 enregistrements DNS (TXT / MX) à recopier chez le gestionnaire du nom de domaine
   (là où le domaine a été acheté : OVH, Gandi, Netlify DNS…, rubrique « Zone DNS »).
4. Une fois le domaine « Verified », définir `DEVIS_FROM=Reflex Déménagement <devis@reflexdemenagement.fr>` et redéployer.

## Où modifier le contenu

| Contenu                                             | Fichier                                              |
| --------------------------------------------------- | ---------------------------------------------------- |
| Infos société (SIRET, adresse, réseaux sociaux…)    | `frontend/src/app/data/company.data.ts`              |
| Liste des services (cartes, formulaire, footer)     | `frontend/src/app/data/services.data.ts` (+ `SERVICE_LABELS` dans la fonction) |
| Avis clients                                        | `frontend/src/app/components/testimonials/testimonials.component.ts` |
| Textes des pages légales                            | `frontend/src/app/pages/legal/`                      |
| Titre, description, Open Graph, données structurées | `frontend/src/index.html`                            |
| Icônes disponibles                                  | `frontend/src/app/components/icon/icon.component.ts` |

## Structure

```
.
├── frontend/                 Application Angular
│   └── src/
│       ├── app/
│       │   ├── components/   Sections de la page (header, hero, services, contact…) + <app-icon>
│       │   ├── pages/        Accueil et pages légales (routes)
│       │   ├── data/         Données partagées (société, services)
│       │   └── services/     Envoi du devis, thème, SEO, navigation
│       ├── assets/           Images optimisées, polices, icônes
│       ├── index.html        Métadonnées SEO
│       ├── sitemap.xml, robots.txt, manifest.webmanifest
├── netlify/functions/        Fonction serverless d'envoi des devis
├── netlify.toml              Configuration Netlify
├── AUDIT.md                  Audit initial et bilan des améliorations
└── .github/workflows/        CI : lint, formatage, audit npm, build, Lighthouse
```

## Intégration continue

À chaque push / pull request sur `main`, GitHub Actions exécute : `npm ci`, lint, vérification du formatage,
`npm audit` (échec si vulnérabilité haute), build de production et Lighthouse CI
(échec si accessibilité, SEO ou bonnes pratiques < 95 ; alerte si performance < 85).

## Licence

Code propriétaire — tous droits réservés. Les icônes proviennent de Font Awesome Free (CC BY 4.0 / MIT),
la police Clash Display de Fontshare (ITF Free Font License) et Inter de Rasmus Andersson (SIL OFL).
