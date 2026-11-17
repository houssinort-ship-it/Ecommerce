const mongoose = require("mongoose");
require("./categorie.js");

const scategorieSchema = new mongoose.Schema(
  {
    nomscategorie: { type: String, required: true },
    imagescat: { type: String, required: false },
    categorieID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "categorie",
    },
  },
  { collection: "scategories" }
);

module.exports = mongoose.model("scategorie", scategorieSchema);
