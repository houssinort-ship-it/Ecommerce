var express = require('express');
var router = express.Router();
const Categorie = require('../models/categorie');

// Afficher la liste des catégories
router.get('/', async (req, res) => {
  try {
    const cat = await Categorie.find({}, null, { sort: { '_id': -1 } });
    res.status(200).json(cat);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Créer une nouvelle catégorie
router.post('/', async (req, res) => {
  const { nomcategorie, imagecategorie } = req.body;
  const newCategorie = new Categorie({ nomcategorie, imagecategorie });
  try {
    await newCategorie.save();
    res.status(200).json(newCategorie);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Chercher une catégorie par id
router.get('/:categorieId', async (req, res) => {
  try {
    const cat = await Categorie.findById(req.params.categorieId);
    res.status(200).json(cat);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Modifier une catégorie
router.put('/:categorieId', async (req, res) => {
  try {
    const cat1 = await Categorie.findByIdAndUpdate(
      req.params.categorieId,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(cat1);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Supprimer une catégorie
router.delete('/:categorieId', async (req, res) => {
  try {
    await Categorie.findByIdAndDelete(req.params.categorieId);
    res.json({ message: "categorie deleted successfully." });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

module.exports = router;