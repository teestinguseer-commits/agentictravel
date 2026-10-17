// Validates evals/golden/golden.yaml and pins it to the graph:
//  - every item matches evals/golden.schema.json, ids are unique, there are exactly 100;
//  - every tool call's args are valid against that tool's contract Input;
//  - items the reference oracle can answer (get_experience, search_experiences, with no
//    `requires_data`) are run against the oracle and must pass, so a graph edit that
//    changes a known answer fails CI until the golden item is reviewed.
// Items needing check_feasibility or unverified data are counted, not failed.
import { readFileSync } from "node:fs";
import { parse } from "yaml";
import { loadSchemas, formatErrors } from "./lib-schemas.mjs";
import { loadGraph } from "../evals/lib/graph.mjs";
import { ORACLE_TOOLS } from "../evals/lib/oracle.mjs";
import { check, normalize } from "../evals/lib/assert.mjs";

const EXPECTED_COUNT = 100;
const { ajv, BASE } = loadSchemas();
ajv.addSchema(JSON.parse(readFileSync("evals/golden.schema.json", "utf8")));
const validateGolden = ajv.getSchema("https://schemas.lifelist.invalid/evals/golden.schema.json");

const golden = parse(readFileSync("evals/golden/golden.yaml", "utf8"));
const graph = loadGraph();
const problems = [];

if (!validateGolden(golden)) {
  console.error(`✗ evals/golden/golden.yaml does not match its schema\n${formatErrors(validateGolden.errors)}`);
  process.exit(1);
}

const ids = golden.items.map((i) => i.id);
const dupes = ids.filter((id, n) => ids.indexOf(id) !== n);
if (dupes.length) problems.push(`duplicate ids: ${[...new Set(dupes)].join(", ")}`);
if (golden.items.length !== EXPECTED_COUNT) problems.push(`expected ${EXPECTED_COUNT} items, found ${golden.items.length}`);

const summary = {};
const bump = (cat, key) => {
  summary[cat] ??= { total: 0, oracle_pass: 0, awaiting_tool: 0, awaiting_data: 0, judge: 0, reviewed: 0 };
  summary[cat][key]++;
};

for (const item of golden.items) {
  bump(item.category, "total");
  if (item.rubric) bump(item.category, "judge");
  if (item.review === "verified") bump(item.category, "reviewed");

  if (item.tool) {
    const validateArgs = ajv.getSchema(`${BASE}tools/${item.tool.name}.schema.json#/$defs/Input`);
    if (!validateArgs(item.tool.args)) problems.push(`${item.id}: args invalid for ${item.tool.name}\n${formatErrors(validateArgs.errors)}`);
    const ref = item.tool.args.id ?? item.tool.args.experience_id;
    if (ref && !graph.has(ref)) problems.push(`${item.id}: unknown experience '${ref}'`);
  }

  if (!item.checks) continue;
  if (item.requires_data?.length) { bump(item.category, "awaiting_data"); continue; }
  const oracle = ORACLE_TOOLS[item.tool.name];
  if (!oracle) { bump(item.category, "awaiting_tool"); continue; }

  const output = normalize(oracle(graph, item.tool.args));
  const failed = item.checks
    .map((c) => ({ c, r: check(output, c) }))
    .filter(({ r }) => !r.ok)
    .map(({ c, r }) => `  ${c.path} ${c.op} ${JSON.stringify(c.value)} — graph gives ${JSON.stringify(r.actual)}`);
  if (failed.length) problems.push(`${item.id} (${item.question})\n${failed.join("\n")}`);
  else bump(item.category, "oracle_pass");
}

if (problems.length) {
  console.error(problems.map((p) => `✗ ${p}`).join("\n"));
  console.error(`\n${problems.length} golden-set problem(s). If the graph change is right, update the item and set review: pending.`);
  process.exit(1);
}

console.log(`✓ golden set: ${golden.items.length} items, all checks consistent with the graph`);
console.table(summary);
