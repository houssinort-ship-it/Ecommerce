// Petit client de test du serveur MCP : node mcp-server/test-client.js
// Usage : node mcp-server/test-client.js [nomTool] [jsonArgs]
const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { StreamableHTTPClientTransport } = require("@modelcontextprotocol/sdk/client/streamableHttp.js");

const MCP_URL = process.env.MCP_URL || "http://localhost:4000/mcp";
const toolName = process.argv[2];
const toolArgs = process.argv[3] ? JSON.parse(process.argv[3]) : {};

async function main() {
  const client = new Client({ name: "mcp-test-client", version: "1.0.0" });
  await client.connect(new StreamableHTTPClientTransport(new URL(MCP_URL)));

  const { tools } = await client.listTools();
  console.log(`Tools disponibles (${tools.length}) :`);
  for (const t of tools) console.log(` - ${t.name}`);

  if (toolName) {
    console.log(`\nAppel de ${toolName} avec ${JSON.stringify(toolArgs)} ...`);
    const result = await client.callTool({ name: toolName, arguments: toolArgs });
    console.log("isError:", result.isError === true);
    const text = result.content?.[0]?.text ?? "";
    // n'affiche qu'un extrait
    console.log(text.slice(0, 800));
  }

  await client.close();
}

main().catch((err) => {
  console.error("ECHEC:", err.message);
  process.exit(1);
});
