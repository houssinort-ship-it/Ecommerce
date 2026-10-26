var express = require('express');
var router = express.Router();
const Scategorie = require('../models/scategorie');

// Afficher la liste des sous-catégories
router.get('/', async (req, res) => {
  try {
    const scat = await Scategorie.find({}, null, { sort: { '_id': -1 } });
    res.status(200).json(scat);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Créer une nouvelle sous-catégorie
router.post('/', async (req, res) => {
  const { nomscategorie, imagescat, categorieID } = req.body;
  const newScategorie = new Scategorie({ nomscategorie, imagescat, categorieID });
  try {
    await newScategorie.save();
    res.status(200).json(newScategorie);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Chercher une sous-catégorie par id
router.get('/:scategorieId', async (req, res) => {
  try {
    const scat = await Scategorie.findById(req.params.scategorieId);
    res.status(200).json(scat);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Modifier une sous-catégorie
router.put('/:scategorieId', async (req, res) => {
  try {
    const scat1 = await Scategorie.findByIdAndUpdate(
      req.params.scategorieId,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(scat1);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Supprimer une sous-catégorie
router.delete('/:scategorieId', async (req, res) => {
  try {
    await Scategorie.findByIdAndDelete(req.params.scategorieId);
    res.json({ message: 'scategorie deleted successfully.' });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

module.exports = router;