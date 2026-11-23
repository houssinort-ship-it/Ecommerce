// Service qui appelle le serveur MCP depuis React
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

// URL du serveur MCP.
// Par défaut : on déduit /mcp depuis VITE_API_URL (http://localhost:4000/api -> http://localhost:4000/mcp)
function resolveMcpUrl() {
  if (import.meta.env.VITE_MCP_URL) return import.meta.env.VITE_MCP_URL;
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
  return `${apiUrl.replace(/\/+$/, "").replace(/\/api$/, "")}/mcp`;
}

const MCP_URL = resolveMcpUrl();

// Appelle une tool et renvoie le résultat sous forme d'objet JavaScript
export async function callTool(name, args = {}) {
  const client = new Client({ name: "frontend-ecommerce", version: "1.0.0" });
  try {
    await client.connect(new StreamableHTTPClientTransport(new URL(MCP_URL)));
    const result = await client.callTool({ name: name, arguments: args });

    if (result.isError) {
      throw new Error(result.content?.[0]?.text || `La tool ${name} a échoué`);
    }

    const text = result.content?.[0]?.text;
    if (text === undefined) return null;
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } finally {
    await client.close().catch(() => {});
  }
}
