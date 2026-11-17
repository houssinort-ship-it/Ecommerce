const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
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
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Origine non autorisée par CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
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
    // Les détails restent dans les logs serveur, pas dans la réponse HTTP
    console.error('Unable to connect to database:', err.message);
    res.status(500).json({ message: 'Database connection failed' });
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
