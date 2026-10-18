import { test } from "node:test";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

test("serves MCP over stdio, as Claude Desktop and Claude Code launch it", async () => {
  const client = new Client({ name: "stdio-test", version: "1.0.0" });
  await client.connect(new StdioClientTransport({ command: process.execPath, args: ["server/src/stdio.ts"], cwd: process.cwd() }));
  const res: any = await client.callTool({ name: "get_experience", arguments: { id: "cwc2027", include: ["pairings"] } });
  assert.equal(res.structuredContent.pairings[0].id, "devils-pool");
  await client.close();
});
