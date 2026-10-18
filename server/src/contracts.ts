// The JSON Schema contracts in contracts/ are the single source of truth: inputs are
// validated against them, outputs are checked in tests (and in dev with
// LIFELIST_CONTRACT_GUARD=1), and the MCP tool list is generated from them.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { loadSchemas } from "../../scripts/lib-schemas.mjs";

const { ajv, BASE } = loadSchemas();
export const TOOL_NAMES = ["search_experiences", "get_experience", "check_feasibility", "request_experience"] as const;
export type ToolName = (typeof TOOL_NAMES)[number];

const validator = (tool: ToolName, def: "Input" | "Output") => {
  const v = ajv.getSchema(`${BASE}tools/${tool}.schema.json#/$defs/${def}`);
  if (!v) throw new Error(`No contract for ${tool} ${def}`);
  return v;
};

export function validateInput(tool: ToolName, args: unknown): { field?: string; message: string } | null {
  const v = validator(tool, "Input");
  if (v(args)) return null;
  const e = v.errors![0];
  const field = (e.instancePath || "/" + (e.params as { additionalProperty?: string }).additionalProperty || "").replace(/^\//, "").replaceAll("/", ".") || undefined;
  return { field, message: `${e.instancePath || "input"} ${e.message}` };
}

export function outputErrors(tool: ToolName, output: unknown): string | null {
  const v = validator(tool, "Output");
  return v(output) ? null : JSON.stringify(v.errors, null, 2);
}

// Inline every $ref so MCP clients get self-contained schemas.
const files = new Map<string, any>();
const load = (path: string) => {
  if (!files.has(path)) files.set(path, JSON.parse(readFileSync(path, "utf8")));
  return files.get(path);
};

function resolvePointer(doc: any, pointer: string) {
  return pointer.split("/").filter(Boolean).reduce((node, key) => node[key.replaceAll("~1", "/").replaceAll("~0", "~")], doc);
}

function inline(node: any, file: string, depth = 0): any {
  if (depth > 40) throw new Error("Schema $ref nesting too deep");
  if (Array.isArray(node)) return node.map((n) => inline(n, file, depth));
  if (!node || typeof node !== "object") return node;
  if (typeof node.$ref === "string") {
    const [path, pointer = ""] = node.$ref.split("#");
    const targetFile = path ? join(dirname(file), path) : file;
    const target = inline(resolvePointer(load(targetFile), pointer), targetFile, depth + 1);
    const { $ref, ...siblings } = node;
    return { ...target, ...inline(siblings, file, depth) };
  }
  const out: any = {};
  for (const [k, v] of Object.entries(node)) {
    if (k === "$schema" || k === "$id" || k === "$defs") continue;
    out[k] = inline(v, file, depth);
  }
  return out;
}

export function bundled(tool: ToolName, def: "Input" | "Result" | "Experience") {
  const file = `contracts/tools/${tool}.schema.json`;
  return inline({ $ref: `#/$defs/${def}` }, file);
}

export function describe(tool: ToolName): { title: string; description: string } {
  const s = load(`contracts/tools/${tool}.schema.json`);
  return { title: s.title, description: s.description };
}
