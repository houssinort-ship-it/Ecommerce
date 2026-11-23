// ============================================================
// Tools des catégories
// Service web utilisé : /api/categories (routes/categorie.route.js)
// ============================================================
const { z } = require("zod");
const { apiFetch } = require("../lib/api");

// Réponse MCP : texte JSON
const json = (data) => ({ content: [{ type: "text", text: JSON.stringify(data) }] });

function categorieTools(server) {
  // 1. Afficher la liste des catégories
  server.registerTool(
    "list_categories",
    {
      description: "Afficher la liste de toutes les catégories",
      inputSchema: {},
    },
    async () => json(await apiFetch("/categories"))
  );

  // 2. Chercher une catégorie par son id
  server.registerTool(
    "get_categorie",
    {
      description: "Chercher une catégorie par son id",
      inputSchema: { id: z.string() },
    },
    async ({ id }) => json(await apiFetch(`/categories/${encodeURIComponent(id)}`))
  );

  // 3. Créer une nouvelle catégorie
  server.registerTool(
    "create_categorie",
    {
      description: "Créer une nouvelle catégorie",
      inputSchema: {
        nomcategorie: z.string(),
        imagecategorie: z.string().optional(),
      },
    },
    async (categorie) =>
      json(await apiFetch("/categories", { method: "POST", body: JSON.stringify(categorie) }))
  );

  // 4. Modifier une catégorie
  server.registerTool(
    "update_categorie",
    {
      description: "Modifier une catégorie",
      inputSchema: {
        id: z.string(),
        nomcategorie: z.string().optional(),
        imagecategorie: z.string().optional(),
      },
    },
    async ({ id, nomcategorie, imagecategorie }) =>
      json(
        await apiFetch(`/categories/${encodeURIComponent(id)}`, {
          method: "PUT",
          // On n'envoie que les champs réellement fournis
          body: JSON.stringify(
            Object.fromEntries(
              Object.entries({ nomcategorie, imagecategorie }).filter(([, v]) => v !== undefined)
            )
          ),
        })
      )
  );

  // 5. Supprimer une catégorie
  server.registerTool(
    "delete_categorie",
    {
      description: "Supprimer une catégorie",
      inputSchema: { id: z.string() },
    },
    async ({ id }) =>
      json(await apiFetch(`/categories/${encodeURIComponent(id)}`, { method: "DELETE" }))
  );
}

module.exports = categorieTools;
