# The MCP server

`server/` is Lifelist's front door for personal AIs: an MCP server with the four tools in [contracts.md](contracts.md), running over stdio (local clients) or Streamable HTTP (remote). It is written in TypeScript and runs directly on Node 22, with no build step.

## Run it

```
npm ci
npm run server:stdio                 # for local MCP clients
PORT=8787 npm run server:http        # http://localhost:8787/mcp, health at /healthz
```

**Claude Code:** from the repository root, `claude mcp add lifelist -- node server/src/stdio.ts`. Then ask, for example, "Using lifelist, what can I do in December for under ₹1.5 lakh?"

**Claude Desktop:** add to `claude_desktop_config.json` (use the absolute path to your clone):

```json
{ "mcpServers": { "lifelist": { "command": "node", "args": ["/path/to/agentictravel/server/src/stdio.ts"], "cwd": "/path/to/agentictravel" } } }
```

## How it is built

| File | Role |
| --- | --- |
| `server/src/server.ts` | Registers the tools. The tool list, input schemas and output schemas are generated from `contracts/`, so the contract is the single source of truth |
| `server/src/contracts.ts` | Validates every input against the contract and inlines `$ref`s for clients |
| `server/src/tools/` | One file per tool |
| `server/src/facts.ts` | Freshness limits and minimum confidence: stale or unverified facts become explicit unknowns ([ADR 0005](../decisions/0005-unverified-seeds.md)) |
| `server/src/store.ts` | `GraphStore` interface; `YamlStore` reads `graph/experiences/`. A Postgres store implements the same interface when the database is deployed |
| `server/src/http.ts`, `stdio.ts` | Transports |

Every call records a usage event tagged with the client (`mcp:claude-desktop`, `mcp:claude-code`), which becomes Pulse's demand input.

## What it can and can't answer yet

| Tool | Works today | Waits for |
| --- | --- | --- |
| `search_experiences` | Filters, weighted keyword search, honest `match_quality`, request suggestions, pagination | Semantic search (pgvector) |
| `get_experience` | All definition facts with provenance, windows, pairings, visa per country with lead times | Offers from Lane Scouts |
| `check_feasibility` | Season and fixed-date windows, budget band, cold, fitness, ballots and permits, and a dated visa timeline per country; any missing fact is named as `FACT_UNKNOWN`, so it never says "yes" on incomplete data | Age limits, leave and holiday bridging, verified visa lead times |
| `request_experience` | Idempotent requests, similar experiences, rate limiting | Persistence in Postgres; notifications for signed-in users |

## Tests

- `npm test`: protocol tests over in-memory, stdio and HTTP transports, contract validation of every output, pagination, idempotency, rate limiting and the freshness rules.
- `npm run golden:run`: the golden set against the server over MCP. Today 102 of 102 runnable checks pass (fact accuracy 100%); 6 items wait for data and 19 for a judge.
