const jwt = require('jsonwebtoken');

// Vérifie le header Authorization: Bearer <token>
function requireAuth(req, res, next) {
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
