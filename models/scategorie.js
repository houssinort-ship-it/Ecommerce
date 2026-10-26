const mongoose = require("mongoose");
const Categorie = require("./categorie.js");

const scategorieSchema = new mongoose.Schema(
  {
    nomscategorie: { type: String, required: true },
    imagescat: { type: String, required: false },
    categorieID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Categorie,
    },
  },
  { collection: "scategorie" }
);

module.exports = mongoose.model("scategorie", scategorieSchema);