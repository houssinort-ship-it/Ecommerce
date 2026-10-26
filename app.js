const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const categorieRouter = require('./routes/categorie.route');
const scategorieRouter = require('./routes/scategorie.route');
const articleRouter = require('./routes/article.route');

app.use('/api/categories', categorieRouter);
app.use('/api/scategories', scategorieRouter);
app.use('/api/articles', articleRouter);

// Connexion à la base de données
mongoose
  .connect(process.env.DATABASE_CLOUD)
  .then(() => console.log('DataBase Successfully Connected'))
  .catch((err) => console.log('Unable to connect to database', err));

// Route de test
app.get('/', (req, res) => {
  res.send('bonjour');
});

// listen uniquement en local
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
}

module.exports = app;