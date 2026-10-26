var express = require('express');
var router = express.Router();
// Créer une instance de sous-catégorie.
const Scategorie = require('../models/scategorie');
// afficher la liste des sous-catégories.
// créer un nouvelle sous-catégorie
router.post('/', async (req, res) => {
const { nomscategorie, imagescat, categorieID } = req.body;
const newScategorie = new Scategorie({nomscategorie:nomscategorie,
imagescat:imagescat,
categorieID:categorieID})
try {
await newScategorie.save();
res.status(200).json(newScategorie );
} catch (error) {
res.status(404).json({ message: error.message });
}
});
// chercher une sous-catégorie
router.get('/:scategorieId',async(req, res)=>{
   try {
const scat = await Scategorie.find({}, null, {sort: {'_id': -1}})
res.status(200).json(scat);
} catch (error) {
res.status(404).json({ message: error.message });
}
});
// modifier une sous-catégorie
router.put('/:scategorieId', async (req, res)=> {
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
router.delete('/:scategorieId', async (req, res)=> {
    const id = req.params.scategorieId;
await Scategorie.findByIdAndDelete(id);
res.json({ message: "scategorie deleted successfully." });
});
module.exports = router;