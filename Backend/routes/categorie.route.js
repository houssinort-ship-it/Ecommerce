const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Categorie = require('../models/categorie');
const requireAuth = require('../middleware/auth');

// Afficher la liste des catégories
router.get('/', async (req, res) => {
  try {
    const cat = await Categorie.find({}, null, { sort: { _id: -1 } });
    res.status(200).json(cat);
  } catch (error) {
    res.status(500).json({ message: 'Impossible de charger les catégories' });
  }
});

// Créer une nouvelle catégorie (protégé)
router.post('/', requireAuth, async (req, res) => {
  const { nomcategorie, imagecategorie } = req.body;
  if (!nomcategorie) return res.status(400).json({ message: 'nomcategorie est obligatoire' });
  const newCategorie = new Categorie({ nomcategorie, imagecategorie });
  try {
    await newCategorie.save();
    res.status(201).json(newCategorie);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Chercher une catégorie par id
router.get('/:categorieId', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.categorieId)) {
    return res.status(400).json({ message: 'Identifiant invalide' });
  }
  try {
    const cat = await Categorie.findById(req.params.categorieId);
    if (!cat) return res.status(404).json({ message: 'Catégorie introuvable' });
    res.status(200).json(cat);
  } catch (error) {
    res.status(400).json({ message: 'Requête invalide' });
  }
});

// Modifier une catégorie (protégé)
router.put('/:categorieId', requireAuth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.categorieId)) {
    return res.status(400).json({ message: 'Identifiant invalide' });
  }
  try {
    const { nomcategorie, imagecategorie } = req.body;
    const update = { nomcategorie, imagecategorie };
    Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);

    const cat1 = await Categorie.findByIdAndUpdate(req.params.categorieId, { $set: update }, {
      new: true,
      runValidators: true,
    });
    if (!cat1) return res.status(404).json({ message: 'Catégorie introuvable' });
    res.status(200).json(cat1);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer une catégorie (protégé)
router.delete('/:categorieId', requireAuth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.categorieId)) {
    return res.status(400).json({ message: 'Identifiant invalide' });
  }
  try {
    const cat = await Categorie.findByIdAndDelete(req.params.categorieId);
    if (!cat) return res.status(404).json({ message: 'Catégorie introuvable' });
    res.json({ message: 'categorie deleted successfully.' });
  } catch (error) {
    res.status(400).json({ message: 'Requête invalide' });
  }
});

module.exports = router;
