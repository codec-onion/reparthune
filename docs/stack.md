# Stack technique

## Monorepo

```
réparthune/
├── frontend/    # Vue 3 + Bootstrap 5 + TypeScript
├── backend/     # Node.js + Express + TypeScript
└── shared/      # Types et schémas partagés
```

Géré avec **npm workspaces**. Le `package.json` racine déclare :

```json
{
  "name": "réparthune",
  "workspaces": ["frontend", "backend", "shared"]
}
```

`frontend` et `backend` importent `shared` comme dépendance locale :
```json
{ "dependencies": { "@réparthune/shared": "*" } }
```

---

## Frontend

| Outil | Rôle | Justification |
|---|---|---|
| **Vue 3** | Framework UI | Composition API + `<script setup>` = meilleure inférence TypeScript que Vue 2 |
| **Pinia** | State management | Remplace Vuex officiellement, pas de mutations, typage natif |
| **Vue Router** | Routing SPA | Navigation + guards d'authentification |
| **Bootstrap 5** | CSS | Grille responsive, composants UI, sans jQuery depuis v5 |
| **Axios** | HTTP client | Intercepteurs pour JWT et gestion des 401 |
| **Vite** | Bundler | Build rapide, HMR instantané en dev |
| **TypeScript** | Langage | Sécurité des types, partage d'interfaces avec le backend |

---

## Backend

| Outil | Rôle | Justification |
|---|---|---|
| **Node.js** | Runtime | Même langage que le frontend, écosystème npm |
| **Express** | Framework HTTP | Minimal, pas de conventions imposées, adapté à l'architecture feature-first |
| **TypeScript** | Langage | Partage de types avec frontend via shared/ |
| **Mongoose** | ODM MongoDB | Schémas typés, hooks, validation côté base |
| **Zod** | Validation | Schémas partagés avec le frontend, inférence automatique des types TS |
| **JWT (jsonwebtoken)** | Auth | Tokens stateless, pas de session serveur |
| **bcrypt** | Hash passwords | Standard de l'industrie |
| **Winston** | Logs | Niveaux configurables, transport fichier en production |
| **Jest + Supertest** | Tests | Unitaires (core/) et intégration (routes) |
| **Nodemailer** | Emails | Notifications légères |
| **PDFKit** | Export PDF | Récapitulatifs de groupe |

---

## Base de données

| Outil | Rôle | Justification |
|---|---|---|
| **MongoDB Atlas** | BDD principale | Documents imbriqués naturels pour les dépenses (payers[], participants[]) |

MongoDB est particulièrement adapté car une dépense est un document auto-suffisant :
```typescript
// En SQL : 4 tables + jointures à chaque lecture
// En MongoDB : un seul document
{
  amount: 90,
  payers: [{ memberId, amount: 90 }],
  participants: [
    { memberId, shares: 2, amount: 45 },
    { memberId, shares: 1, amount: 22.50 },
    { memberId, shares: 1, amount: 22.50 },
  ]
}
```

---

## Déploiement

| Cible | Service | Stratégie shared/ |
|---|---|---|
| **Frontend** | Vercel | Build Command : `cd shared && npm run build && cd ../frontend && npm run build` |
| **Backend** | VPS (PM2) | Script deploy : compile shared/ puis backend, `pm2 restart` |
| **BDD** | MongoDB Atlas | Connexion depuis Vercel et VPS via URI sécurisée |

### Variables d'environnement

**Backend (`.env`)** :
```
MONGO_URI=
JWT_SECRET=
JWT_EXPIRES_IN=7d
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
PORT=3000
NODE_ENV=production
```

**Frontend (`.env`)** :
```
VITE_API_URL=https://api.réparthune.fr
```
