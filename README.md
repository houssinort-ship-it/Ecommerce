# E-commerce MERN

Petit catalogue e-commerce en **MongoDB / Express / React / Node** : gestion des articles, catégories et sous-catégories avec authentification JWT.

> Projet d'apprentissage — pas encore prêt pour une boutique en production (voir [SECURITY.md](./SECURITY.md)).

## Structure

```
.
├── Backend/            # API REST Express + Mongoose
│   ├── app.js          # Application Express (CORS, helmet, connexion Mongo mise en cache)
│   ├── middleware/     # Vérification du token JWT
│   ├── models/         # Schémas Mongoose (article, categorie, scategorie, user)
│   ├── routes/         # /api/articles, /api/categories, /api/scategories, /api/auth
│   ├── mcp-server/     # Serveur MCP (tools + client de test) exposé sur /mcp
│   ├── seed.js         # Jeu de données de démonstration
│   └── vercel.json     # Déploiement serverless
└── Frontend/           # Application React (Vite + Bootstrap)
    └── src/
        ├── api.js      # Instance axios (baseURL + token JWT)
        ├── components/ # ListArticles, AddArticle, EditArticle, Login, Signup
        └── context/    # AuthContext (login / logout)
```

## Fonctionnalités

- Liste des articles (lecture publique)
- Ajout / modification / suppression d'articles (authentifié)
- Catégories et sous-catégories (CRUD, écriture authentifiée)
- Inscription / connexion avec mots de passe hashés (bcrypt) et JWT (7 jours)
- **Serveur MCP** exposant 25 tools (articles, catégories, recherche, stock, panier) pour ChatGPT / Claude / Cursor

## Démarrage

### 1. Backend

```bash
cd Backend
npm install
cp .env.example .env      # puis renseignez DATABASE_CLOUD et JWT_SECRET
npm run seed              # (optionnel) données de démonstration
npm start                 # http://localhost:4000
```

Variables d'environnement attendues (voir `Backend/.env.example`) :

| Variable         | Rôle                                                        |
| ---------------- | ----------------------------------------------------------- |
| `PORT`           | Port local (4000 par défaut)                                |
| `DATABASE_CLOUD` | Chaîne de connexion MongoDB                                 |
| `JWT_SECRET`     | Secret de signature des tokens (`openssl rand -hex 32`)     |
| `CORS_ORIGINS`   | Origines autorisées, séparées par des virgules              |

### 2. Frontend

```bash
cd Frontend
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:4000/api
npm run dev               # http://localhost:5173
```

## API

| Méthode | Route                  | Accès        |
| ------- | ---------------------- | ------------ |
| GET     | `/api/articles`        | public       |
| GET     | `/api/articles/:id`    | public       |
| POST    | `/api/articles`        | JWT          |
| PUT     | `/api/articles/:id`    | JWT          |
| DELETE  | `/api/articles/:id`    | JWT          |
| GET     | `/api/categories`      | public       |
| POST/PUT/DELETE | `/api/categories…` | JWT        |
| GET     | `/api/scategories`     | public       |
| POST/PUT/DELETE | `/api/scategories…` | JWT        |
| POST    | `/api/auth/register`   | public (rate limité) |
| POST    | `/api/auth/login`      | public (rate limité) |

Les routes protégées attendent l'en-tête `Authorization: Bearer <token>`.

## Serveur MCP (ChatGPT, Claude, Cursor)

Le backend expose aussi un serveur MCP sur `POST /mcp` (Streamable HTTP).

```bash
cd Backend
npm start                        # http://localhost:4000
node mcp-server/test-client.js   # liste les tools disponibles
npm test                         # tests de fumée REST + MCP
```

**ChatGPT ne peut pas joindre `localhost`.** Le connecteur s'exécute dans le cloud
d'OpenAI : il faut une URL **https publique**. En local, utilisez un tunnel :

```bash
ngrok http 4000                  # -> https://xxxx.ngrok-free.dev/mcp
# ou : cloudflared tunnel --url http://localhost:4000
```

Puis dans ChatGPT : Paramètres → Connecteurs → Avancé → Mode développeur →
Ajouter un serveur, avec l'URL `https://VOTRE-URL/mcp`.

Pour un déploiement permanent, utilisez `https://votre-app.vercel.app/mcp` et
définissez `API_URL=https://votre-app.vercel.app/api`. Si l'endpoint est public,
protégez-le avec `MCP_ACCESS_TOKEN` et l'URL `https://.../mcp?token=...`.

Guide complet et dépannage « fetch failed » : [`Backend/mcp-server/README.md`](./Backend/mcp-server/README.md).

## Déploiement

- **Backend** : prévu pour Vercel (`Backend/vercel.json`). Définissez `DATABASE_CLOUD`, `JWT_SECRET` et `CORS_ORIGINS` dans les variables d'environnement du projet Vercel.
- **Frontend** : `npm run build` puis hébergement statique (Vercel, Netlify…). Renseignez `VITE_API_URL` avec l'URL publique de l'API.

## Licence

ISC
