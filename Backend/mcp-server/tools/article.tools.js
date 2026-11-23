// ============================================================
// Tools des articles
// Service web utilisé : /api/articles (routes/article.route.js)
// ============================================================
const { z } = require("zod");
const { apiFetch } = require("../lib/api");

// Réponse MCP : texte JSON
const json = (data) => ({ content: [{ type: "text", text: JSON.stringify(data) }] });

function articleTools(server) {
  // 1. Afficher la liste des articles
  server.registerTool(
    "list_articles",
    {
      description: "Afficher la liste de tous les articles",
      inputSchema: {},
    },
    async () => json(await apiFetch("/articles"))
  );

  // 2. Chercher un article par son id
  server.registerTool(
    "get_article",
    {
      description: "Chercher un article par son id",
      inputSchema: { id: z.string() },
    },
    async ({ id }) => json(await apiFetch(`/articles/${encodeURIComponent(id)}`))
  );

  // 3. Créer un nouvel article
  server.registerTool(
    "create_article",
    {
      description: "Créer un nouvel article",
      inputSchema: {
        reference: z.string(),
        designation: z.string(),
        prix: z.number().optional(),
        marque: z.string(),
        qtestock: z.number().optional(),
        imageart: z.string().optional(),
        scategorieID: z.string().optional(),
      },
    },
    async (article) =>
      json(await apiFetch("/articles", { method: "POST", body: JSON.stringify(article) }))
  );

  // 4. Modifier un article
  server.registerTool(
    "update_article",
    {
      description: "Modifier un article (seuls les champs envoyés sont modifiés)",
      inputSchema: {
        id: z.string(),
        reference: z.string().optional(),
        designation: z.string().optional(),
        prix: z.number().optional(),
        marque: z.string().optional(),
        qtestock: z.number().optional(),
        imageart: z.string().optional(),
        scategorieID: z.string().optional(),
      },
    },
    async ({ id, ...article }) =>
      json(
        await apiFetch(`/articles/${encodeURIComponent(id)}`, {
          method: "PUT",
          body: JSON.stringify(article),
        })
      )
  );

  // 5. Supprimer un article
  server.registerTool(
    "delete_article",
    {
      description: "Supprimer un article",
      inputSchema: { id: z.string() },
    },
    async ({ id }) =>
      json(await apiFetch(`/articles/${encodeURIComponent(id)}`, { method: "DELETE" }))
  );
}

module.exports = articleTools;
