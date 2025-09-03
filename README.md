# Site de Déménagement 🚚

Site vitrine moderne pour entreprise de déménagement, développé avec Angular et déployé sur Netlify.

## 🌟 Fonctionnalités

- **Interface moderne** : Design responsive et attractif
- **Demande de devis** : Formulaire intégré avec fonction serverless
- **Services détaillés** : Présentation complète des services
- **Témoignages clients** : Section dédiée aux avis clients
- **Contact** : Informations de contact et localisation

## 🛠️ Technologies utilisées

- **Frontend** : Angular 15, TypeScript, SCSS
- **Backend** : Fonctions Netlify (Serverless)
- **Déploiement** : Netlify avec déploiement automatique
- **Styling** : SCSS avec design responsive

## 🚀 Installation et développement

### Prérequis
- Node.js (version 18 ou supérieure)
- npm ou yarn
- Angular CLI

### Installation

```bash
# Cloner le projet
git clone https://github.com/votre-username/demenagement-site.git
cd demenagement-site

# Installer les dépendances
cd frontend
npm install

# Lancer le serveur de développement
npm start
```

Le site sera accessible sur `http://localhost:4200`

### Build de production

```bash
cd frontend
npm run build
```

Les fichiers de production seront générés dans `frontend/dist/demenagement-site/`

## 📦 Structure du projet

```
demenagement-site/
├── frontend/           # Application Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/    # Composants de l'interface
│   │   │   └── services/      # Services Angular
│   │   └── assets/           # Images et ressources
│   └── package.json
├── backend/            # Services backend (si applicable)
├── netlify/
│   └── functions/      # Fonctions serverless Netlify
├── netlify.toml        # Configuration Netlify
└── README.md
```

## 🌐 Déploiement

Le site est configuré pour un déploiement automatique sur Netlify :

1. Connectez votre dépôt GitHub à Netlify
2. Netlify détectera automatiquement la configuration dans `netlify.toml`
3. Le déploiement se lance automatiquement à chaque push sur la branche main

## 📧 Contact

Pour toute question ou demande de devis, contactez-nous via le formulaire sur le site.

## 📄 Licence

Ce projet est sous licence privée - voir le fichier LICENSE pour plus de détails.
