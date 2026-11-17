# Sécurité

## Ce qui est en place

- **Aucun secret dans le dépôt** : `.env` est ignoré par Git, seuls les `.env.example` sont versionnés (valeurs factices).
- **Mots de passe** hashés avec bcrypt (coût 10), jamais renvoyés par l'API (`select: false` sur le champ).
- **JWT** signé avec `JWT_SECRET`, expiration 7 jours, vérifié par `Backend/middleware/auth.js` sur toutes les routes d'écriture.
- **Rate limiting** (20 requêtes / 15 min) sur `/api/auth/login` et `/api/auth/register` pour limiter le bruteforce.
- **CORS restreint** aux origines listées dans `CORS_ORIGINS`.
- **Helmet** activé (en-têtes de sécurité, `x-powered-by` désactivé).
- **Corps de requête limité** à 100 kb (`express.json({ limit: '100kb' })`).
- **Mass assignment bloqué** : les `PUT` n'acceptent qu'une liste blanche de champs.
- **Identifiants validés** (`mongoose.isValidObjectId`) avant tout accès base.
- **Erreurs génériques** vers le client, détails uniquement dans les logs serveur.
- **Dépendances** : `npm audit` ne remonte aucune vulnérabilité connue (backend et frontend).

## Limites connues (projet d'apprentissage)

- Pas de gestion de rôles : tout utilisateur inscrit peut créer/modifier/supprimer des articles. Une boutique réelle séparerait `customer` et `admin`.
- Le JWT est stocké dans `localStorage` (accessible en cas de XSS). Un cookie `HttpOnly` + `SameSite` serait préférable en production.
- Pas de vérification d'email, pas de réinitialisation de mot de passe, pas de politique de complexité au-delà de 8 caractères.
- `imageart` / `imagescat` acceptent une URL arbitraire (pas de validation de schéma ni d'upload contrôlé).
- Listes non paginées (limite fixe de 200 articles) : à paginer avant un vrai catalogue.
- Rate limiting en mémoire : suffisant pour une instance unique, à remplacer par un store Redis si le service est répliqué.

## Si vous forkez ce projet

1. Générez votre propre `JWT_SECRET` (`openssl rand -hex 32`).
2. Utilisez un utilisateur MongoDB dédié avec des droits limités à votre base.
3. Renseignez `CORS_ORIGINS` avec l'URL exacte de votre frontend.

## Signaler un problème

Ouvrez une issue en décrivant le problème sans publier de secret ni de données personnelles.
