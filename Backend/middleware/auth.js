const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Comparaison à temps constant (évite les attaques temporelles)
function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// Clé de service : permet au serveur MCP (appel interne) de passer requireAuth.
// Désactivée si MCP_API_KEY n'est pas définie.
function isValidServiceKey(req) {
  const expected = process.env.MCP_API_KEY;
  const provided = req.headers['x-mcp-key'];
  if (!expected || !provided) return false;
  return safeEqual(provided, expected);
}

// Vérifie le header Authorization: Bearer <token>
function requireAuth(req, res, next) {
  if (isValidServiceKey(req)) {
    req.user = { id: 'mcp-service', service: true };
    return next();
  }

  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Authentification requise' });
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET manquant dans les variables d\'environnement');
    return res.status(500).json({ message: 'Configuration serveur invalide' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id };
    return next();
  } catch {
    return res.status(401).json({ message: 'Session invalide ou expirée' });
  }
}

module.exports = requireAuth;
