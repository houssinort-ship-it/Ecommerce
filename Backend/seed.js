// Données de test : npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const Categorie = require('./models/categorie');
const Scategorie = require('./models/scategorie');
const Article = require('./models/article');

(async () => {
  await mongoose.connect(process.env.DATABASE_CLOUD);
  await Article.deleteMany({});
  await Scategorie.deleteMany({});
  await Categorie.deleteMany({});

  const cat = await Categorie.create({ nomcategorie: 'Informatique & Mobile' });
  const [phones, tabs, pcs] = await Scategorie.insertMany([
    { nomscategorie: 'Smartphones', categorieID: cat._id },
    { nomscategorie: 'Tablettes', categorieID: cat._id },
    { nomscategorie: 'PC Portables', categorieID: cat._id },
  ]);

  await Article.insertMany([
    { reference: 'SM001', designation: 'Samsung Galaxy A12 - 6.5" - 4 Go - 128 Go', marque: 'Samsung', prix: 549, qtestock: 20, imageart: 'https://placehold.co/300x300?text=Galaxy+A12', scategorieID: phones._id },
    { reference: 'SM002', designation: 'Tecno Spark 6 - 6.8" - 4 Go - 128 Go', marque: 'Tecno', prix: 469, qtestock: 35, imageart: 'https://placehold.co/300x300?text=Tecno+Spark+6', scategorieID: phones._id },
    { reference: 'TB001', designation: 'Lenovo Tab M7 7.0 - 16GB', marque: 'Lenovo', prix: 299, qtestock: 12, imageart: 'https://placehold.co/300x300?text=Lenovo+Tab+M7', scategorieID: tabs._id },
    { reference: 'PC001', designation: 'Hp PC Portable - 13.3" - Intel Core i5', marque: 'HP', prix: 2199, qtestock: 8, imageart: 'https://placehold.co/300x300?text=HP+Portable', scategorieID: pcs._id },
  ]);

  console.log('Base remplie');
  await mongoose.disconnect();
})();
