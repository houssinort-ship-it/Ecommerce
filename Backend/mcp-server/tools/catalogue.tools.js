// ============================================================
// Tools supplémentaires pour l'application e-commerce
// ------------------------------------------------------------
// Ces tools utilisent les services web existants (/api/articles,
// /api/categories, /api/scategories) puis filtrent ou calculent
// le résultat en JavaScript.
// ============================================================
const { z } = require("zod");
const { apiFetch } = require("../lib/api");

// Réponse MCP : texte JSON
const json = (data) => ({ content: [{ type: "text", text: JSON.stringify(data) }] });

function catalogueTools(server) {
  // ----------------------------------------------------------
  // 1. Rechercher des articles (mot-clé + prix minimum / maximum)
  // ----------------------------------------------------------
  server.registerTool(
    "search_articles",
    {
      description: "Rechercher des articles par mot-clé (désignation, marque, référence) et par prix",
      inputSchema: {
        keyword: z.string().optional(),
        prixMin: z.number().optional(),
        prixMax: z.number().optional(),
      },
    },
    async ({ keyword, prixMin, prixMax }) => {
      let articles = await apiFetch("/articles");
      // Filtre par mot-clé
      if (keyword) {
        const mot = keyword.toLowerCase();
        articles = articles.filter(
          (a) =>
            (a.designation || "").toLowerCase().includes(mot) ||
            (a.marque || "").toLowerCase().includes(mot) ||
            (a.reference || "").toLowerCase().includes(mot)
        );
      }
      // Filtre par prix
      if (prixMin !== undefined) {
        articles = articles.filter((a) => (a.prix || 0) >= prixMin);
      }
      if (prixMax !== undefined) {
        articles = articles.filter((a) => (a.prix || 0) <= prixMax);
      }
      return json(articles);
    }
  );

  // ----------------------------------------------------------
  // 2. Afficher les articles d'une sous-catégorie
  // ----------------------------------------------------------
  server.registerTool(
    "list_articles_by_scategorie",
    {
      description: "Afficher les articles d'une sous-catégorie",
      inputSchema: { scategorieID: z.string() },
    },
    async ({ scategorieID }) => {
      const articles = await apiFetch("/articles");
      // scategorieID est un objet (populate) : on compare son _id
      const resultat = articles.filter(
        (a) => a.scategorieID && String(a.scategorieID._id) === scategorieID
      );
      return json(resultat);
    }
  );

  // ----------------------------------------------------------
  // 3. Chercher un article par sa référence
  // ----------------------------------------------------------
  server.registerTool(
    "get_article_by_reference",
    {
      description: "Chercher un article par sa référence",
      inputSchema: { reference: z.string() },
    },
    async ({ reference }) => {
      // La recherche est faite par MongoDB (route GET /api/articles/ref/:reference)
      // encodeURIComponent protège les références qui contiennent des espaces ou des "/"
      return json(await apiFetch(`/articles/ref/${encodeURIComponent(reference)}`));
    }
  );

  // ----------------------------------------------------------
  // 4. Liste des marques (sans doublons)
  // ----------------------------------------------------------
  server.registerTool(
    "list_marques",
    {
      description: "Afficher la liste des marques disponibles",
      inputSchema: {},
    },
    async () => {
      // MongoDB renvoie directement les marques sans doublons (route GET /api/articles/marques)
      return json(await apiFetch("/articles/marques"));
    }
  );

  // ----------------------------------------------------------
  // 5. Articles avec un stock faible
  // ----------------------------------------------------------
  server.registerTool(
    "low_stock_articles",
    {
      description: "Afficher les articles dont le stock est inférieur ou égal au seuil",
      inputSchema: { seuil: z.number().default(5) },
    },
    async ({ seuil = 5 }) => {
      const articles = await apiFetch("/articles");
      const resultat = articles.filter((a) => (a.qtestock || 0) <= seuil);
      return json(resultat);
    }
  );

  // ----------------------------------------------------------
  // 6. Ajouter ou retirer une quantité du stock d'un article
  // ----------------------------------------------------------
  server.registerTool(
    "update_stock",
    {
      description: "Modifier le stock d'un article (quantité positive = ajout, négative = retrait)",
      inputSchema: {
        id: z.string(),
        quantite: z.number(),
      },
    },
    async ({ id, quantite }) => {
      // On récupère l'article pour connaître son stock actuel
      const article = await apiFetch(`/articles/${encodeURIComponent(id)}`);
      const nouveauStock = (article.qtestock || 0) + quantite;
      if (nouveauStock < 0) {
        return json({ message: "Stock insuffisant", stockActuel: article.qtestock || 0 });
      }
      // On enregistre le nouveau stock avec le service PUT
      const data = await apiFetch(`/articles/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify({ qtestock: nouveauStock }),
      });
      return json(data);
    }
  );

  // ----------------------------------------------------------
  // 7. Calculer le total d'un panier
  // ----------------------------------------------------------
  server.registerTool(
    "check_cart",
    {
      description: "Calculer le total d'un panier et vérifier la disponibilité des articles",
      inputSchema: {
        items: z.array(
          z.object({
            id: z.string(),
            quantite: z.number(),
          })
        ),
      },
    },
    async ({ items }) => {
      const articles = await apiFetch("/articles");
      let total = 0;
      const lignes = [];
      for (const item of items) {
        const article = articles.find((a) => a._id === item.id);
        if (!article) {
          lignes.push({ id: item.id, message: "Article introuvable" });
          continue;
        }
        const prix = article.prix || 0;
        const sousTotal = prix * item.quantite;
        total = total + sousTotal;
        lignes.push({
          designation: article.designation,
          prix: prix,
          quantite: item.quantite,
          sousTotal: sousTotal,
          disponible: (article.qtestock || 0) >= item.quantite,
        });
      }
      return json({ lignes, total });
    }
  );

  // ----------------------------------------------------------
  // 8. Catégories avec leurs sous-catégories (pour un menu)
  // ----------------------------------------------------------
  server.registerTool(
    "get_catalogue_tree",
    {
      description: "Afficher chaque catégorie avec la liste de ses sous-catégories",
      inputSchema: {},
    },
    async () => {
      const [categories, scategories] = await Promise.all([
        apiFetch("/categories"),
        apiFetch("/scategories"),
      ]);
      const menu = categories.map((cat) => ({
        nomcategorie: cat.nomcategorie,
        // categorieID est un objet (populate) : on compare son _id
        scategories: scategories
          .filter((s) => s.categorieID && String(s.categorieID._id) === String(cat._id))
          .map((s) => s.nomscategorie),
      }));
      return json(menu);
    }
  );

  // ----------------------------------------------------------
  // 9. Statistiques du catalogue (tableau de bord)
  // ----------------------------------------------------------
  server.registerTool(
    "get_catalogue_stats",
    {
      description: "Afficher des statistiques : nombre d'articles, valeur du stock, prix moyen...",
      inputSchema: {},
    },
    async () => {
      const [articles, categories] = await Promise.all([
        apiFetch("/articles"),
        apiFetch("/categories"),
      ]);
      let valeurStock = 0;
      let sommePrix = 0;
      let nbRuptures = 0;
      for (const article of articles) {
        // prix et qtestock ne sont pas obligatoires : 0 s'ils sont absents
        const prix = article.prix || 0;
        const stock = article.qtestock || 0;
        valeurStock = valeurStock + prix * stock;
        sommePrix = sommePrix + prix;
        if (stock === 0) nbRuptures++;
      }
      return json({
        nbArticles: articles.length,
        nbCategories: categories.length,
        nbRuptures: nbRuptures,
        valeurStock: valeurStock,
        prixMoyen: articles.length > 0 ? (sommePrix / articles.length).toFixed(2) : 0,
      });
    }
  );
}

module.exports = catalogueTools;
