// Validates graph/experiences/*.yaml: schema, file name matches id, pairings point at
// live experiences, twins exist, fixed dates fall inside season months.
import { readFileSync, readdirSync } from "node:fs";
import { parse } from "yaml";
import { loadSchemas, formatErrors } from "./lib-schemas.mjs";

const DIR = "graph/experiences";
const { ajv, BASE } = loadSchemas();
const validate = ajv.getSchema(`${BASE}experience.schema.json`);

const defs = new Map();
const problems = [];

for (const file of readdirSync(DIR).filter((f) => f.endsWith(".yaml")).sort()) {
  const doc = parse(readFileSync(`${DIR}/${file}`, "utf8"));
  if (!validate(doc)) {
    problems.push(`${file}\n${formatErrors(validate.errors)}`);
    continue;
  }
  if (file !== `${doc.id}.yaml`) problems.push(`${file}: file name must be ${doc.id}.yaml`);
  if (defs.has(doc.id)) problems.push(`${file}: duplicate id ${doc.id}`);
  defs.set(doc.id, doc);
}

for (const d of defs.values()) {
  for (const p of d.pairings ?? []) {
    const other = defs.get(p.with);
    if (!other) problems.push(`${d.id}: pairing with unknown experience '${p.with}'`);
    else if (p.with === d.id) problems.push(`${d.id}: pairs with itself`);
    else if (other.status !== "live") problems.push(`${d.id}: pairing with non-live '${p.with}'`);
  }
  if (d.twin_of && !defs.has(d.twin_of)) problems.push(`${d.id}: twin_of unknown '${d.twin_of}'`);
  for (const f of d.fixed_dates ?? []) {
    const month = Number(f.start.slice(5, 7));
    if (d.season_months.length && !d.season_months.includes(month))
      problems.push(`${d.id}: fixed date ${f.start} is outside season_months ${d.season_months}`);
  }
}

if (problems.length) {
  console.error(problems.map((p) => `✗ ${p}`).join("\n"));
  console.error(`\n${problems.length} problem(s) in ${DIR}`);
  process.exit(1);
}
const lanes = [...defs.values()].reduce((m, d) => ((m[d.lane] = (m[d.lane] ?? 0) + 1), m), {});
console.log(`✓ ${defs.size} experience definitions valid`, lanes);
