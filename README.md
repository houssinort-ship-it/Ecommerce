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

## Déploiement Vercel

Ce dépôt contient **deux projets Vercel distincts** (monorepo). Pour chacun :
**Settings → General → Root Directory**.

### 0. Base de données obligatoire

Vercel **ne peut pas** joindre un MongoDB local (`localhost:27017`). Il faut une base
cloud (MongoDB Atlas gratuit). Pour migrer vos données locales :

```bash
cd Backend
npm run db:export                              # crée db-export.json (gitignoré)
npm run db:import -- "mongodb+srv://user:pass@cluster.mongodb.net/DatabaseCommerce"
```

Sur Atlas : **Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)**
(les IP de sortie Vercel sont dynamiques).

### 1. Projet « backend »

| Réglage | Valeur |
| ------- | ------ |
| Root Directory | `Backend` |
| Framework Preset | Other |
| Build Command | (laisser vide) |

Variables d'environnement à définir :

| Variable | Valeur |
| -------- | ------ |
| `DATABASE_CLOUD` | chaîne MongoDB Atlas |
| `JWT_SECRET` | chaîne aléatoire longue |
| `CORS_ORIGINS` | URL du front, ex. `https://ecommerce-front.vercel.app` |
| `API_URL` | URL publique du backend + `/api` (recommandé) |
| `MCP_API_KEY` | chaîne aléatoire (tools d'écriture) |
| `MCP_ACCESS_TOKEN` | chaîne aléatoire (protège `/mcp`) |

> `MCP_API_KEY` et `MCP_ACCESS_TOKEN` doivent être **différents**.

### 2. Projet « frontend »

| Réglage | Valeur |
| ------- | ------ |
| Root Directory | `Frontend` |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Variable d'environnement :

| Variable | Valeur |
| -------- | ------ |
| `VITE_API_URL` | `https://<backend>.vercel.app/api` |
| `VITE_MCP_URL` | `https://<backend>.vercel.app/mcp` (optionnel) |

Si `VITE_API_URL` est absente, le front appelle `/api` sur son propre domaine
(utile seulement si un rewrite proxy est configuré).

### 3. Désactiver la protection d'accès (obligatoire)

Par défaut, Vercel peut activer **Deployment Protection → Vercel Authentication**.
Toutes les URL (y compris `/api` et `/mcp`) renvoient alors une redirection 302 vers
la page de connexion Vercel : le site public et le connecteur ChatGPT échouent.

**Project → Settings → Deployment Protection → Vercel Authentication → Disabled**
(ou « Only Preview Deployments » pour garder les previews privées).

### Vérifier après déploiement

```bash
curl https://<backend>.vercel.app/            # {"status":"ok",...}
curl https://<backend>.vercel.app/mcp/health   # {"status":"ok",...}
curl -X POST https://<backend>.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"t","version":"1"}}}'
```

## Licence

ISC
