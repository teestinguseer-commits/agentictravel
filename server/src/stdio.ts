// Run over stdio, for Claude Desktop, Claude Code and other local MCP clients:
//   node server/src/stdio.ts   (from the repository root)
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.ts";
import { YamlStore } from "./store.ts";

const server = createServer(new YamlStore());
await server.connect(new StdioServerTransport());
