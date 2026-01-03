# IFA Resto Backend API (Express + TypeScript)

Backend de l’écosystème IFA Resto, construit avec Express et TypeScript, documenté via Swagger, et utilisant Prisma pour la base de données.

## Table of Contents

- [Démarrage](#démarrage)
- [Scripts](#scripts)
- [Configuration Swagger](#configuration-swagger)
- [Variables d’environnement](#variables-denvironnement)
- [Structure des dossiers](#structure-des-dossiers)
- [Fonctionnalités](#fonctionnalités)


## Démarrage

1. Installer les dépendances

   ```sh
   npm install
   ```

2. Configurer les variables d’environnement (voir la section dédiée). Un exemple est fourni dans `.env.example`.

3. Démarrer le serveur en développement

   ```sh
   npm run dev
   ```

4. Ouvrir la documentation Swagger

   - URL: `http://localhost:8000/api-docs/`
   - Serveur d’API: `http://localhost:8000/v1`



## Scripts

Scripts principaux pour le développement et la production :

- `npm run dev`: lance le serveur de dev (hot reload via nodemon).
- `npm run start`: lance le build de production.
- `npm run test`: exécute les tests Jest.
- `npm run test-coverage`: exécute les tests avec couverture.
- `npm run lint` / `npm run lint:fix`: lint et corrections automatiques.
- `npm run build`: build TypeScript vers `dist`.
- `npm run db:*`: commandes Prisma (generate, push, migrate, studio, seed).


## Configuration Swagger

La documentation est générée via `swagger-jsdoc` et servie par `swagger-ui-express`.

- Endpoint: `GET /api-docs` (UI)
- Spécifications: construites depuis les annotations JSDoc au sein des fichiers `routes.ts`.
- Schémas: définis dans `src/common/swagger.ts`. Inclut `DeliveryPerson` et autres entités (`User`, `Restaurant`, `Order`, etc.).

Endpoints clés livrés pour les livreurs (Deliverers) :

- `GET /api/deliverers` — liste des livreurs disponibles.
- `GET /api/deliverers/{id}` — détail d’un livreur.
- `PUT /api/deliverers/location` — mise à jour de la position (auth requis).
- `PUT /api/deliverers/availability` — mise à jour de la disponibilité (auth requis).

Les réponses sont « flatten » pour inclure les champs du profil (`firstName`, `lastName`, `phone`) au niveau supérieur.

## Variables d’environnement

Exemples utiles pour le démarrage local (voir `.env`) :

- `PORT=8000` — port HTTP.
- `DATABASE_URL` — connexion PostgreSQL (Prisma).
- `JWT_SECRET`, `JWT_REFRESH_SECRET` — secrets JWT.
- `REDIS_URL` — URL Redis (optionnel en dev).
- `SKIP_DB=true` — permet de démarrer le serveur sans connexion DB (pratique pour prévisualiser Swagger).
- `USE_REDIS_RATE_LIMIT=false` — désactive le rate limiting basé sur Redis en dev.

Note: si vous activez Redis, démarrez un serveur Redis local ou ajustez `REDIS_URL`.

## Structure des dossiers

Le projet suit une structure organisée pour faciliter la maintenance :

- **src/common/**: Contains common files and utilities used across the project, such as `env.ts` for managing environment variables and `logger.ts` for logging.
- **src/resources/**: Contains resources organized by domain, with each resource folder containing `model.ts`, `interface.ts`, `controller.ts`, and `routes.ts` files for that specific resource.
- **src/middlewares/**: Contains middleware functions used in the Express application.
- **src/services/**: Contains configuration files and other service-related modules used in the project.
- **src/server.ts**: Entry point for the Express server.
- **src/app.ts**: Defines the Express application.

### Fichiers additionnels

- `.env.example`: exemple des variables d’environnement.
- `.gitignore`: règles de Git ignore.
- `jest.config.js`: configuration Jest.
- `package.json`: scripts et dépendances Node.js.
- `README.md`: documentation du projet.
- `tsconfig.json`: configuration TypeScript.

This folder structure provides a clear organization for the project's source code and resources, making it easier to navigate and maintain as the project grows.

## Fonctionnalités

- TypeScript et Express pour un backend robuste.
- Prisma (PostgreSQL) pour l’accès aux données.
- Swagger UI pour la documentation d’API (`/api-docs`).
- Pino pour le logging structuré.
- Jest pour les tests.
- Nodemon pour le rechargement à chaud en dev.
- ESLint + Prettier + Husky pour la qualité de code.


## Contribution

Les contributions sont les bienvenues. Merci de créer une branche dédiée et une PR avec une description claire. Assurez-vous que les tests passent et que le linting est propre.

## Licence

MIT
