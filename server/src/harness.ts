// Connects an MCP client to the server in-process, for the golden run and tests.
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer, type ServerOptions } from "./server.ts";
import { YamlStore, type GraphStore } from "./store.ts";

export async function connect(store: GraphStore = new YamlStore(), opts: ServerOptions = {}, clientName = "golden-harness") {
  const server = createServer(store, { contractGuard: true, ...opts });
  const [clientT, serverT] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: clientName, version: "1.0.0" });
  await Promise.all([server.connect(serverT), client.connect(clientT)]);
  return {
    client,
    store,
    // Calls a tool and returns its JSON payload (the error object when isError).
    async call(name: string, args: Record<string, unknown>): Promise<any> {
      const res: any = await client.callTool({ name, arguments: args });
      return res.structuredContent ?? JSON.parse(res.content[0].text);
    },
    async close() { await client.close(); await server.close(); },
  };
}
