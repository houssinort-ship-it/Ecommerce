// ============================================================
// Accès à l'API Express depuis les tools MCP
// ------------------------------------------------------------
// Les tools n'appellent pas MongoDB directement : ils appellent
// les services web /api/... comme un client externe.
// ============================================================

// Adresse de base de l'API.
// Ordre de priorité :
//   1. API_URL déclarée dans .env
//   2. VERCEL_URL (déploiement Vercel)
//   3. le serveur lui-même (localhost + PORT)
function resolveApiUrl() {
  const declared = (process.env.API_URL || '').trim().replace(/\/+$/, '');
  if (declared) {
    // On accepte API_URL=http://host:port ET http://host:port/api
    return declared.endsWith('/api') ? declared : `${declared}/api`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api`;
  }
  return `http://localhost:${process.env.PORT || 4000}/api`;
}

const API_URL = resolveApiUrl();

// En-têtes ajoutés à chaque appel.
// x-mcp-key permet aux tools d'écrire (POST/PUT/DELETE) alors que
// ces routes exigent requireAuth. La clé est comparée côté backend.
function headers(extra = {}) {
  const h = { Accept: 'application/json', ...extra };
  if (process.env.MCP_API_KEY) h['x-mcp-key'] = process.env.MCP_API_KEY;
  return h;
}

// fetch + gestion d'erreurs lisible.
// Une erreur réseau (port fermé, DNS, ngrok coupé) devient un message clair
// au lieu du "fetch failed" brut de Node.
async function apiFetch(path = '', options = {}) {
  const url = `${API_URL}${path}`;
  const method = options.method || 'GET';

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers: headers({
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {}),
      }),
      signal: AbortSignal.timeout(15000),
    });
  } catch (err) {
    const raison =
      err.name === 'TimeoutError'
        ? 'délai dépassé (15 s)'
        : err.cause?.code || err.message;
    throw new Error(
      `API injoignable : ${method} ${url} → ${raison}. ` +
        `Vérifiez que le backend tourne et que API_URL est correct.`
    );
  }

  const raw = await response.text();
  let data = null;
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = raw;
    }
  }

  if (!response.ok) {
    const message =
      (data && typeof data === 'object' && data.message) || raw || response.statusText;
    throw new Error(`API ${response.status} sur ${method} ${url} : ${message}`);
  }

  return data;
}

module.exports = { apiFetch, API_URL };
