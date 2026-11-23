// ============================================================
// Test de fumée du backend + serveur MCP
// Usage : npm test        (le serveur doit déjà tourner : npm start)
//         base : MCP_URL=http://localhost:4000/mcp
// ============================================================
const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { StreamableHTTPClientTransport } = require("@modelcontextprotocol/sdk/client/streamableHttp.js");

const MCP_URL = process.env.MCP_URL || "http://localhost:4000/mcp";
const API_URL = process.env.API_URL || "http://localhost:4000/api";

let echecs = 0;
function ok(nom, condition, detail = "") {
  if (condition) {
    console.log(`  OK   ${nom}`);
  } else {
    echecs++;
    console.log(`  ECHEC ${nom} ${detail}`);
  }
}

async function testRest() {
  console.log("\nREST API");
  const health = await fetch(new URL("/", API_URL).toString());
  ok("GET / (santé)", health.status === 200, `status=${health.status}`);

  const articles = await fetch(`${API_URL}/articles`);
  ok("GET /articles", articles.status === 200, `status=${articles.status}`);
  const liste = await articles.json();
  ok("GET /articles renvoie un tableau", Array.isArray(liste));

  const marques = await fetch(`${API_URL}/articles/marques`);
  ok("GET /articles/marques", marques.status === 200, `status=${marques.status}`);

  const categories = await fetch(`${API_URL}/categories`);
  ok("GET /categories", categories.status === 200, `status=${categories.status}`);
}

async function testMcp() {
  console.log("\nServeur MCP");
  const client = new Client({ name: "smoke-test", version: "1.0.0" });
  await client.connect(new StreamableHTTPClientTransport(new URL(MCP_URL)));
  ok("connexion + initialize", true);

  const { tools } = await client.listTools();
  ok("liste des tools (>= 20)", tools.length >= 20, `tools=${tools.length}`);
  const noms = new Set(tools.map((t) => t.name));
  for (const attendu of [
    "list_articles",
    "list_categories",
    "list_scategories",
    "search_articles",
    "list_marques",
    "check_cart",
    "get_catalogue_stats",
  ]) {
    ok(`tool ${attendu} présente`, noms.has(attendu));
  }

  // Tools de lecture uniquement (pas de données modifiées)
  const lectures = [
    ["list_articles", {}],
    ["list_categories", {}],
    ["list_scategories", {}],
    ["list_marques", {}],
    ["search_articles", { keyword: "a" }],
    ["low_stock_articles", { seuil: 5 }],
    ["get_catalogue_tree", {}],
    ["get_catalogue_stats", {}],
  ];

  for (const [nom, args] of lectures) {
    const res = await client.callTool({ name: nom, arguments: args });
    const texte = res.content?.[0]?.text ?? "";
    let valide = !res.isError;
    if (valide) {
      try {
        JSON.parse(texte);
      } catch {
        valide = false;
      }
    }
    ok(`appel ${nom}`, valide, res.isError ? texte.slice(0, 120) : "JSON invalide");
  }

  // Une tool avec un id inexistant doit renvoyer une erreur propre, pas un crash
  const resErr = await client.callTool({
    name: "get_article",
    arguments: { id: "000000000000000000000000" },
  });
  ok("erreur propre sur article inexistant", resErr.isError === true);

  await client.close();
}

async function main() {
  console.log(`MCP : ${MCP_URL}`);
  console.log(`API : ${API_URL}`);
  try {
    await testRest();
  } catch (err) {
    echecs++;
    console.log(`  ECHEC REST API injoignable : ${err.message}`);
  }
  try {
    await testMcp();
  } catch (err) {
    echecs++;
    console.log(`  ECHEC serveur MCP injoignable : ${err.message}`);
  }

  console.log(
    echecs === 0 ? "\nTous les tests sont passés." : `\n${echecs} test(s) en échec.`
  );
  process.exit(echecs === 0 ? 0 : 1);
}

main();
