// The Lifelist MCP server: the four tools from contracts/, over any MCP transport.
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import type { GraphStore } from "./store.ts";
import { policyFromEnv, type FactPolicy } from "./facts.ts";
import { toolError } from "./common.ts";
import { TOOL_NAMES, bundled, describe, outputErrors, validateInput, type ToolName } from "./contracts.ts";
import { TOOLS } from "./tools/index.ts";

export const SERVER_INFO = { name: "lifelist", version: "0.1.0" };

const RESULT_DEF: Record<ToolName, "Result" | "Experience"> = {
  search_experiences: "Result",
  get_experience: "Experience",
  check_feasibility: "Result",
  request_experience: "Result",
};

const INSTRUCTIONS = `Lifelist knows rare travel experiences (eclipses, ballots, permit-capped treks, festivals) and whether an Indian traveller can do them.
Use search_experiences to find options, get_experience for facts, check_feasibility for "can I do this, and when?", and request_experience when nothing fits.
Every fact carries its source and check date; a fact shown as unknown must be reported as unknown, never guessed.`;

export interface ServerOptions {
  policy?: () => FactPolicy;
  contractGuard?: boolean;
}

export function createServer(store: GraphStore, opts: ServerOptions = {}) {
  const policy = opts.policy ?? (() => policyFromEnv());
  const guard = opts.contractGuard ?? process.env.LIFELIST_CONTRACT_GUARD === "1";
  const server = new Server(SERVER_INFO, { capabilities: { tools: {} }, instructions: INSTRUCTIONS });

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOL_NAMES.map((name) => ({
      name,
      ...describe(name),
      inputSchema: bundled(name, "Input"),
      outputSchema: bundled(name, RESULT_DEF[name]),
      annotations: {
        readOnlyHint: name !== "request_experience",
        idempotentHint: true,
        openWorldHint: false,
      },
    })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const name = req.params.name as ToolName;
    const args = req.params.arguments ?? {};
    const client = server.getClientVersion()?.name?.toLowerCase().replace(/[^a-z0-9_.-]/g, "-") || "unknown";
    let result: any;
    if (!TOOL_NAMES.includes(name)) {
      result = toolError("NOT_FOUND", `Unknown tool '${req.params.name}'`);
    } else {
      const invalid = validateInput(name, args);
      result = invalid
        ? toolError("INVALID_INPUT", invalid.message, invalid.field ? { field: invalid.field } : {})
        : TOOLS[name](store, args, { policy: policy(), channel: `mcp:${client}` });
      if (guard) {
        const problems = outputErrors(name, result);
        if (problems) throw new Error(`Contract violation in ${name}: ${problems}`);
      }
    }
    const text = JSON.stringify(result, null, 2);
    return "error" in result
      ? { isError: true, content: [{ type: "text", text }] }
      : { content: [{ type: "text", text }], structuredContent: result };
  });

  return server;
}
