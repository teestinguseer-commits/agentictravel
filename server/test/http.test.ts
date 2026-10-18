import { test } from "node:test";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { startHttp } from "../src/http.ts";

test("serves MCP over Streamable HTTP", async () => {
  const http = await startHttp(undefined, 0);
  const port = (http.address() as { port: number }).port;
  try {
    const health = await fetch(`http://127.0.0.1:${port}/healthz`).then((r) => r.json());
    assert.equal(health.experiences, 65);

    const client = new Client({ name: "http-test", version: "1.0.0" });
    await client.connect(new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${port}/mcp`)));
    const { tools } = await client.listTools();
    assert.equal(tools.length, 4);
    const res: any = await client.callTool({ name: "search_experiences", arguments: { query: "eclipse" } });
    assert.deepEqual(res.structuredContent.results.map((r: any) => r.id).sort(), ["eclipse-2028", "eclipse-luxor", "eclipse-maroc"]);
    await client.close();

    assert.equal((await fetch(`http://127.0.0.1:${port}/mcp`)).status, 405);
  } finally {
    await new Promise((r) => http.close(r));
  }
});
