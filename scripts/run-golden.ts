// Runs the golden set against the real MCP server (in-process, over the MCP protocol)
// and applies each item's checks. Fact accuracy = share of checks passing across items
// that are runnable today (no `requires_data`). Exits non-zero on any failure.
//   node scripts/run-golden.ts            (uses the real clock)
//   LIFELIST_NOW=2026-10-18 node scripts/run-golden.ts   (pinned clock, as in CI)
import { readFileSync } from "node:fs";
import { parse } from "yaml";
import { check, normalize } from "../evals/lib/assert.mjs";
import { connect } from "../server/src/harness.ts";

const golden = parse(readFileSync("evals/golden/golden.yaml", "utf8")).items;
const h = await connect();

let checksRun = 0, checksPassed = 0;
const failures: string[] = [];
const byCategory: Record<string, { run: number; passed: number; awaiting_data: number; judge_only: number }> = {};

for (const item of golden) {
  const cat = (byCategory[item.category] ??= { run: 0, passed: 0, awaiting_data: 0, judge_only: 0 });
  if (!item.checks) { cat.judge_only++; continue; }
  if (item.requires_data?.length) { cat.awaiting_data++; continue; }

  let out = await h.call(item.tool.name, item.tool.args);
  // Follow pagination so set checks see every result.
  while (item.tool.name === "search_experiences" && out.next_cursor) {
    const more = await h.call(item.tool.name, { ...item.tool.args, cursor: out.next_cursor });
    out = { ...more, results: [...out.results, ...more.results] };
  }
  const normalized = normalize(out);
  cat.run++;
  let ok = true;
  for (const c of item.checks) {
    checksRun++;
    const r = check(normalized, c);
    if (r.ok) checksPassed++;
    else { ok = false; failures.push(`${item.id} ${item.question}\n    ${c.path} ${c.op} ${JSON.stringify(c.value)} — server gave ${JSON.stringify(r.actual)}`); }
  }
  if (ok) cat.passed++;
}
await h.close();

console.table(byCategory);
const accuracy = checksRun ? (100 * checksPassed) / checksRun : 0;
console.log(`Fact accuracy: ${checksPassed}/${checksRun} checks (${accuracy.toFixed(1)}%), target ≥ 98%`);
if (failures.length) {
  console.error(`\n${failures.length} item(s) failed:\n` + failures.map((f) => `✗ ${f}`).join("\n"));
  process.exit(1);
}
