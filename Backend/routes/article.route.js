const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Article = require('../models/article');
const requireAuth = require('../middleware/auth');

// Créer un nouvel article (protégé)
router.post('/', requireAuth, async (req, res) => {
  const { reference, designation, prix, marque, qtestock, imageart, scategorieID } = req.body;
  try {
    const newArticle = new Article({ reference, designation, prix, marque, qtestock, imageart, scategorieID });
    await newArticle.save();
    res.status(201).json(newArticle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// liste des marques sans doublons
// (doit être placée AVANT la route '/:articleId', sinon "marques" serait pris pour un id)
router.get('/marques', async (req, res) => {
  try {
      const marques = await Article.distinct("marque");
      res.status(200).json(marques.sort());
} catch (error) {
      res.status(404).json({ message: error.message });
}
});
// chercher un article par sa référence
router.get('/ref/:reference', async (req, res) => {
  try {
      const art = await Article.findOne({ reference: req.params.reference }).populate("scategorieID").exec();
  if (!art) return res.status(404).json({ message: "Aucun article avec cette référence" });
      res.status(200).json(art);
} catch (error) {
      res.status(404).json({ message: error.message });
}
});

// Liste des articles (les plus récents d'abord)
router.get('/', async (req, res) => {
  try {
    const articles = await Article.find({}, null, { sort: { _id: -1 }, limit: 200 }).populate('scategorieID');
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Impossible de charger les articles' });
  }
});

// Un article par id
router.get('/:articleId', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.articleId)) {
    return res.status(400).json({ message: 'Identifiant invalide' });
  }
  try {
    const art = await Article.findById(req.params.articleId).populate('scategorieID');
    if (!art) return res.status(404).json({ message: 'Article introuvable' });
    res.status(200).json(art);
  } catch (error) {
    res.status(400).json({ message: 'Requête invalide' });
  }
});

// Modifier un article (protégé)
router.put('/:articleId', requireAuth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.articleId)) {
    return res.status(400).json({ message: 'Identifiant invalide' });
  }
  try {
    // Liste blanche des champs modifiables (évite le mass assignment)
    const { reference, designation, prix, marque, qtestock, imageart, scategorieID } = req.body;
    const update = { reference, designation, prix, marque, qtestock, imageart, scategorieID };
    Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);

    const art = await Article.findByIdAndUpdate(req.params.articleId, { $set: update }, {
      new: true,
      runValidators: true,
    });
    if (!art) return res.status(404).json({ message: 'Article introuvable' });
    res.status(200).json(art);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer un article (protégé)
router.delete('/:articleId', requireAuth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.articleId)) {
    return res.status(400).json({ message: 'Identifiant invalide' });
  }
  try {
    const art = await Article.findByIdAndDelete(req.params.articleId);
    if (!art) return res.status(404).json({ message: 'Article introuvable' });
    res.status(200).json({ message: 'article deleted successfully.' });
  } catch (error) {
    res.status(400).json({ message: 'Requête invalide' });
  }
});

module.exports = router;
