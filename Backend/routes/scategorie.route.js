const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Scategorie = require('../models/scategorie');
const requireAuth = require('../middleware/auth');

// Afficher la liste des sous-catégories
router.get('/', async (req, res) => {
  try {
    const scat = await Scategorie.find({}, null, { sort: { _id: -1 } }).populate('categorieID');
    res.status(200).json(scat);
  } catch (error) {
    res.status(500).json({ message: 'Impossible de charger les sous-catégories' });
  }
});

// Créer une nouvelle sous-catégorie (protégé)
router.post('/', requireAuth, async (req, res) => {
  const { nomscategorie, imagescat, categorieID } = req.body;
  if (!nomscategorie || !categorieID) {
    return res.status(400).json({ message: 'nomscategorie et categorieID sont obligatoires' });
  }
  const newScategorie = new Scategorie({ nomscategorie, imagescat, categorieID });
  try {
    await newScategorie.save();
    res.status(201).json(newScategorie);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Chercher une sous-catégorie par id
router.get('/:scategorieId', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.scategorieId)) {
    return res.status(400).json({ message: 'Identifiant invalide' });
  }
  try {
    const scat = await Scategorie.findById(req.params.scategorieId);
    if (!scat) return res.status(404).json({ message: 'Sous-catégorie introuvable' });
    res.status(200).json(scat);
  } catch (error) {
    res.status(400).json({ message: 'Requête invalide' });
  }
});

// Modifier une sous-catégorie (protégé)
router.put('/:scategorieId', requireAuth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.scategorieId)) {
    return res.status(400).json({ message: 'Identifiant invalide' });
  }
  try {
    const { nomscategorie, imagescat, categorieID } = req.body;
    const update = { nomscategorie, imagescat, categorieID };
    Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);

    const scat1 = await Scategorie.findByIdAndUpdate(req.params.scategorieId, { $set: update }, {
      new: true,
      runValidators: true,
    });
    if (!scat1) return res.status(404).json({ message: 'Sous-catégorie introuvable' });
    res.status(200).json(scat1);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer une sous-catégorie (protégé)
router.delete('/:scategorieId', requireAuth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.scategorieId)) {
    return res.status(400).json({ message: 'Identifiant invalide' });
  }
  try {
    const scat = await Scategorie.findByIdAndDelete(req.params.scategorieId);
    if (!scat) return res.status(404).json({ message: 'Sous-catégorie introuvable' });
    res.json({ message: 'scategorie deleted successfully.' });
  } catch (error) {
    res.status(400).json({ message: 'Requête invalide' });
  }
});

module.exports = router;
