var express = require('express');
var router = express.Router();
// Créer une instance d'article.
const Article = require('../models/article');

// créer un nouvel article
router.post('/', async (req, res) => {
    const { reference, designation, prix, marque, qtestock, imageart, scategorieID } = req.body;
    const newArticle = new Article({
        reference: reference,
        designation: designation,
        prix: prix,
        marque: marque,
        qtestock: qtestock,
        imageart: imageart,
        scategorieID: scategorieID
    });
    try {
        await newArticle.save();
        res.status(200).json(newArticle);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// afficher la liste des articles
router.get('/', async (req, res) => {
    try {
        const articles = await Article.find({}, null, { sort: { '_id': -1 } }).populate('scategorieID');
        res.status(200).json(articles);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// chercher un article
router.get('/:articleId', async (req, res) => {
    try {
        const art = await Article.findById(req.params.articleId).populate('scategorieID');
        res.status(200).json(art);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// modifier un article
router.put('/:articleId', async (req, res) => {
    try {
        const art1 = await Article.findByIdAndUpdate(
            req.params.articleId,
            { $set: req.body },
            { new: true }
        );
        res.status(200).json(art1);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Supprimer un article
router.delete('/:articleId', async (req, res) => {
    const id = req.params.articleId;
    try {
        await Article.findByIdAndDelete(id);
        res.json({ message: "article deleted successfully." });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

module.exports = router;