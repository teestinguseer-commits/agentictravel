// Run as a remote MCP server over Streamable HTTP (stateless):
//   PORT=8787 node server/src/http.ts   then point a client at http://localhost:8787/mcp
// OAuth for the signed-in tools arrives with them; the four tools here need no sign-in.
import { createServer as createHttpServer, type IncomingMessage, type ServerResponse } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "./server.ts";
import { YamlStore, type GraphStore } from "./store.ts";

async function readBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > 1_000_000) throw new Error("Request body too large");
    chunks.push(c);
  }
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : undefined;
}

export function startHttp(store: GraphStore = new YamlStore(), port = Number(process.env.PORT ?? 8787)) {
  const http = createHttpServer(async (req: IncomingMessage, res: ServerResponse) => {
    const path = new URL(req.url ?? "/", "http://localhost").pathname;
    if (path === "/healthz") {
      res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ ok: true, experiences: store.all().length }));
      return;
    }
    if (path !== "/mcp") { res.writeHead(404).end(); return; }
    if (req.method !== "POST") {
      // Stateless server: no standalone SSE stream or session to delete.
      res.writeHead(405, { allow: "POST" }).end();
      return;
    }
    try {
      const body = await readBody(req);
      const server = createServer(store);
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
      res.on("close", () => { transport.close(); server.close(); });
      await server.connect(transport);
      await transport.handleRequest(req, res, body);
    } catch (err) {
      if (!res.headersSent) {
        res.writeHead(400, { "content-type": "application/json" })
          .end(JSON.stringify({ jsonrpc: "2.0", error: { code: -32700, message: "Invalid request" }, id: null }));
      }
    }
  });
  return new Promise<typeof http>((resolve) => http.listen(port, () => resolve(http)));
}

if (import.meta.main ?? process.argv[1]?.endsWith("http.ts")) {
  const http = await startHttp();
  const addr = http.address();
  console.log(`Lifelist MCP server on http://localhost:${typeof addr === "object" && addr ? addr.port : ""}/mcp`);
}
