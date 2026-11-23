# Serveur MCP — E-commerce

Le serveur MCP expose l'API REST de l'application sous forme de **tools** utilisables
par ChatGPT, Claude, Cursor, etc.

- Point d'entrée : `POST /mcp` (transport **Streamable HTTP**, mode sans état)
- Sonde : `GET /mcp/health`
- URL locale : `http://localhost:4000/mcp`
- 25 tools : catégories, sous-catégories, articles, recherche, stock, panier, statistiques.

## Pourquoi ChatGPT affiche « fetch failed »

ChatGPT exécute les connecteurs **dans le cloud d'OpenAI**, pas sur votre machine.
Une adresse `http://localhost:4000/mcp` (ou une IP du réseau local, ou un VPN) est donc
**injoignable** : ChatGPT ne peut pas voir le port 4000 de votre PC.

Il faut une URL **https publique**. Trois solutions :

### A. Tunnel rapide (développement)

Avec ngrok (déjà installé sur cette machine) :

```bash
# 1. Démarrer le backend
cd Backend
npm start                 # http://localhost:4000

# 2. Dans un second terminal
ngrok http 4000
```

Ngrok affiche une URL du type `https://xxxx-xx-xx-xx-xx.ngrok-free.app`.
L'URL à saisir dans ChatGPT est :

```
https://xxxx-xx-xx-xx-xx.ngrok-free.app/mcp
```

Avec cloudflared (aucun compte requis) :

```bash
cloudflared tunnel --url http://localhost:4000
# -> https://xxxx.trycloudflare.com/mcp
```

> Astuce : vérifiez d'abord depuis un navigateur ou un autre réseau :
> `https://VOTRE-URL/mcp/health` doit renvoyer `{"status":"ok",...}`.

### B. Déploiement permanent (Vercel, Render, Railway…)

Déployez `Backend/` puis utilisez `https://votre-app.vercel.app/mcp`.
Pensez à définir les variables d'environnement sur l'hébergeur :
`DATABASE_CLOUD`, `JWT_SECRET`, `CORS_ORIGINS` et — si le serveur doit appeler
sa propre API — `API_URL=https://votre-app.vercel.app/api`.

### C. Protéger l'endpoint public

Dès que `/mcp` est accessible sur Internet, n'importe qui peut lire **et modifier**
le catalogue. Définissez `MCP_ACCESS_TOKEN` dans le `.env` du backend, puis ajoutez le
jeton à l'URL du connecteur (ChatGPT n'accepte pas les en-têtes personnalisés) :

```
https://votre-url/mcp?token=VOTRE_JETON
```

Le jeton est aussi accepté via `Authorization: Bearer <jeton>` ou `x-mcp-token`.

## Brancher le connecteur ChatGPT

1. ChatGPT → **Paramètres → Connecteurs → Avancé → Mode développeur** (compte Plus/Pro).
2. **Créer un connecteur** → nom + URL `https://VOTRE-URL/mcp?token=...`.
3. L'initialisation doit réussir et les tools apparaître.

## Vérifier en local

```bash
cd Backend
npm start

# dans un autre terminal
node mcp-server/test-client.js                     # liste les 25 tools
node mcp-server/test-client.js list_marques        # appelle une tool
node mcp-server/test-client.js search_articles '{"keyword":"samsung","prixMax":500}'
```

## Dépannage « fetch failed »

| Cause | Vérification / correction |
| ----- | ------------------------- |
| URL `localhost` ou IP privée | Utiliser un tunnel https (ngrok / cloudflared) ou un déploiement |
| Backend arrêté | `curl http://localhost:4000/mcp/health` |
| Mauvais chemin | L'URL doit finir par `/mcp` (pas `/api`, pas `/`) |
| `MCP_ACCESS_TOKEN` défini | Ajouter `?token=...` à l'URL |
| Tunnel fermé / redémarré | L'URL ngrok change à chaque lancement sans domaine réservé |
| Erreur TLS / certificat | Utiliser l'URL `https://` fournie par le tunnel |
| 500 au preflight CORS | Corrigé : une origine inconnue est désormais refusée sans erreur |

## Outils disponibles

| Groupe | Tools |
| ------ | ----- |
| Catégories | `list_categories`, `get_categorie`, `create_categorie`, `update_categorie`, `delete_categorie` |
| Sous-catégories | `list_scategories`, `get_scategorie`, `list_scategories_by_categorie`, `create_scategorie`, `update_scategorie`, `delete_scategorie` |
| Articles | `list_articles`, `get_article`, `create_article`, `update_article`, `delete_article` |
| Catalogue | `search_articles`, `list_articles_by_scategorie`, `get_article_by_reference`, `list_marques`, `low_stock_articles`, `update_stock`, `check_cart`, `get_catalogue_tree`, `get_catalogue_stats` |
