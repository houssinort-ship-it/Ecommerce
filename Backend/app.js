const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const crypto = require('crypto');
const cors = require('cors');
const helmet = require('helmet');

dotenv.config();

const app = express();

// Derrière un proxy (Vercel, Render, etc.)
app.set('trust proxy', 1);

// En-têtes de sécurité (désactive x-powered-by, CSP, no-sniff, etc.)
app.use(helmet());

// CORS restreint aux origines déclarées dans CORS_ORIGINS
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Une origine refusée renvoie `false` (pas d'en-têtes CORS) et NON une
      // erreur : lever une exception ici produisait un HTTP 500 sur le
      // preflight OPTIONS envoyé par les clients distants (ChatGPT, etc.).
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    // Le client MCP envoie ses propres en-têtes et lit mcp-session-id dans la réponse
    allowedHeaders: ['Content-Type', 'Authorization', 'x-mcp-key', 'x-mcp-token', 'mcp-protocol-version', 'mcp-session-id', 'last-event-id'],
    exposedHeaders: ['mcp-session-id'],
    maxAge: 86400,
    optionsSuccessStatus: 204,
  })
);

app.use(express.json({ limit: '100kb' }));

// Connexion MongoDB mise en cache (adaptée à Vercel)
let cached = global.mongooseConn;
if (!cached) cached = global.mongooseConn = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    if (!process.env.DATABASE_CLOUD) {
      throw new Error('DATABASE_CLOUD is not set');
    }
    cached.promise = mongoose.connect(process.env.DATABASE_CLOUD, {
      serverSelectionTimeoutMS: 8000,
    });
  }
  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
  return cached.conn;
}

// Attendre la connexion avant chaque requête API
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    // Les détails restent dans les logs serveur, pas dans la réponse HTTP.
    // Le type d'erreur est exposé (aide au diagnostic sans fuite) et le
    // message complet uniquement avec la clé de service.
    console.error('Unable to connect to database:', err.message);
    const debug =
      process.env.MCP_API_KEY &&
      req.headers['x-debug-key'] === process.env.MCP_API_KEY;
    res.status(500).json({
      message: 'Database connection failed',
      reason: err.name,
      ...(debug ? { detail: err.message } : {}),
    });
  }
});

// Routes
const categorieRouter = require('./routes/categorie.route');
const scategorieRouter = require('./routes/scategorie.route');
const articleRouter = require('./routes/article.route');
const authRouter = require('./routes/auth.route');

app.use('/api/categories', categorieRouter);
app.use('/api/scategories', scategorieRouter);
app.use('/api/articles', articleRouter);
app.use('/api/auth', authRouter);
// ============================================================
// Serveur MCP : expose les services web sous forme de "tools"
// adresse : http://localhost:PORT/mcp
// ============================================================
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StreamableHTTPServerTransport } = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
// Import des fichiers qui contiennent les tools
const categorieTools = require("./mcp-server/tools/categorie.tools");
const scategorieTools = require("./mcp-server/tools/scategorie.tools");
const articleTools = require("./mcp-server/tools/article.tools");
const catalogueTools = require("./mcp-server/tools/catalogue.tools");
// Création du serveur MCP et ajout de toutes les tools
function createMcpServer() {
  const server = new McpServer({ name: "ecommerce-mcp-server", version: "1.0.0" });
  categorieTools(server); // tools des catégories
  scategorieTools(server); // tools des sous-catégories
  articleTools(server); // tools des articles
  catalogueTools(server); // tools supplémentaires (recherche, stock, panier...)
  return server;
}
// ------------------------------------------------------------
// Protection optionnelle de /mcp
// ------------------------------------------------------------
// ChatGPT, Claude et les autres connecteurs distants doivent pouvoir
// atteindre /mcp depuis Internet. Si MCP_ACCESS_TOKEN est défini, l'appel
// doit fournir le jeton : Authorization: Bearer <token>, en-tête
// x-mcp-token, ou paramètre d'URL ?token=<token> (utile pour les
// connecteurs dont l'UI n'accepte qu'une URL).
function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function isMcpAuthorized(req) {
  const expected = process.env.MCP_ACCESS_TOKEN;
  if (!expected) return true; // protection désactivée

  const auth = req.headers.authorization || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const candidates = [bearer, req.headers["x-mcp-token"], req.query?.token];
  return candidates.some((value) => value && safeEqual(value, expected));
}

// Toutes les requêtes MCP arrivent sur POST /mcp
app.post("/mcp", async (req, res) => {
  if (!isMcpAuthorized(req)) {
    return res.status(401).json({
      jsonrpc: "2.0",
      error: { code: -32001, message: "Jeton MCP manquant ou invalide" },
      id: null,
    });
  }

  // Un nouveau serveur pour chaque requête (mode simple, sans session)
  const server = createMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // mode sans état (adapté au serverless)
    // Réponses JSON plutôt que flux SSE : indispensable derrière Vercel et
    // beaucoup plus fiable pour les connecteurs distants (ChatGPT).
    enableJsonResponse: true,
  });
  // Quand la réponse est envoyée, on ferme le serveur et le transport
  res.on("close", () => {
    transport.close();
    server.close();
  });
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("Erreur MCP:", error.message);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Erreur interne du serveur MCP" },
        id: null,
      });
    }
  }
});

// Sonde de disponibilité : permet de vérifier qu'un tunnel (ngrok,
// cloudflared, Vercel) atteint bien le serveur MCP depuis Internet.
app.get("/mcp/health", (req, res) => {
  res.json({ status: "ok", service: "ecommerce-mcp-server" });
});

// Ce serveur n'expose pas de flux SSE (GET) ni de sessions (DELETE) :
// la spécification MCP demande alors une réponse 405 explicite.
const methodNotAllowed = (req, res) => {
  res.set("Allow", "POST, OPTIONS");
  res.status(405).json({
    jsonrpc: "2.0",
    error: { code: -32000, message: "Method Not Allowed : utilisez POST /mcp" },
    id: null,
  });
};
app.get("/mcp", methodNotAllowed);
app.delete("/mcp", methodNotAllowed);

// Route de test
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'ecommerce-api' });
});

// 404 JSON
app.use((req, res) => {
  res.status(404).json({ message: 'Route introuvable' });
});

// Gestionnaire d'erreurs (ne divulgue pas les détails internes)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({ message: 'Erreur interne du serveur' });
});

// listen uniquement en local
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
}

module.exports = app;
