// ============================================================
// Tools des sous-catégories
// Service web utilisé : /api/scategories (routes/scategorie.route.js)
// ============================================================
const { z } = require("zod");
const { apiFetch } = require("../lib/api");

// Réponse MCP : texte JSON
const json = (data) => ({ content: [{ type: "text", text: JSON.stringify(data) }] });

function scategorieTools(server) {
  // 1. Afficher la liste des sous-catégories
  server.registerTool(
    "list_scategories",
    {
      description: "Afficher la liste de toutes les sous-catégories",
      inputSchema: {},
    },
    async () => json(await apiFetch("/scategories"))
  );

  // 2. Chercher une sous-catégorie par son id
  server.registerTool(
    "get_scategorie",
    {
      description: "Chercher une sous-catégorie par son id",
      inputSchema: { id: z.string() },
    },
    async ({ id }) => json(await apiFetch(`/scategories/${encodeURIComponent(id)}`))
  );

  // 3. Afficher les sous-catégories d'une catégorie
  server.registerTool(
    "list_scategories_by_categorie",
    {
      description: "Afficher les sous-catégories d'une catégorie",
      inputSchema: { categorieID: z.string() },
    },
    async ({ categorieID }) =>
      json(await apiFetch(`/scategories/cat/${encodeURIComponent(categorieID)}`))
  );

  // 4. Créer une nouvelle sous-catégorie
  server.registerTool(
    "create_scategorie",
    {
      description: "Créer une nouvelle sous-catégorie",
      inputSchema: {
        nomscategorie: z.string(),
        imagescat: z.string().optional(),
        categorieID: z.string(),
      },
    },
    async (scategorie) =>
      json(await apiFetch("/scategories", { method: "POST", body: JSON.stringify(scategorie) }))
  );

  // 5. Modifier une sous-catégorie
  server.registerTool(
    "update_scategorie",
    {
      description: "Modifier une sous-catégorie",
      inputSchema: {
        id: z.string(),
        nomscategorie: z.string().optional(),
        imagescat: z.string().optional(),
        categorieID: z.string().optional(),
      },
    },
    async ({ id, nomscategorie, imagescat, categorieID }) =>
      json(
        await apiFetch(`/scategories/${encodeURIComponent(id)}`, {
          method: "PUT",
          // On n'envoie que les champs réellement fournis
          body: JSON.stringify(
            Object.fromEntries(
              Object.entries({ nomscategorie, imagescat, categorieID }).filter(
                ([, v]) => v !== undefined
              )
            )
          ),
        })
      )
  );

  // 6. Supprimer une sous-catégorie
  server.registerTool(
    "delete_scategorie",
    {
      description: "Supprimer une sous-catégorie",
      inputSchema: { id: z.string() },
    },
    async ({ id }) =>
      json(await apiFetch(`/scategories/${encodeURIComponent(id)}`, { method: "DELETE" }))
  );
}

module.exports = scategorieTools;
