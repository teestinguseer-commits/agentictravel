// Compiles the tool contracts and validates every example in contracts/examples/.
// <tool>/<name>.input.json is checked against $defs/Input, <name>.output.json against $defs/Output.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { loadSchemas, formatErrors } from "./lib-schemas.mjs";

const { ajv, BASE } = loadSchemas();
let failures = 0;
let checked = 0;

for (const tool of readdirSync("contracts/tools").map((f) => f.replace(".schema.json", ""))) {
  for (const def of ["Input", "Output"]) {
    if (!ajv.getSchema(`${BASE}tools/${tool}.schema.json#/$defs/${def}`)) {
      console.error(`✗ ${tool}: missing $defs/${def}`);
      failures++;
    }
  }
}

for (const tool of readdirSync("contracts/examples")) {
  for (const file of readdirSync(join("contracts/examples", tool))) {
    const kind = file.endsWith(".input.json") ? "Input" : file.endsWith(".output.json") ? "Output" : null;
    if (!kind) continue;
    const validate = ajv.getSchema(`${BASE}tools/${tool}.schema.json#/$defs/${kind}`);
    if (!validate) {
      console.error(`✗ ${tool}/${file}: no contract for tool '${tool}'`);
      failures++;
      continue;
    }
    checked++;
    const data = JSON.parse(readFileSync(join("contracts/examples", tool, file), "utf8"));
    if (!validate(data)) {
      console.error(`✗ ${tool}/${file}\n${formatErrors(validate.errors)}`);
      failures++;
    }
  }
}

if (failures) {
  console.error(`\n${failures} contract problem(s)`);
  process.exit(1);
}
console.log(`✓ ${checked} examples valid against the tool contracts`);
