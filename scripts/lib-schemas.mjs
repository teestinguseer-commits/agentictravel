// Loads every JSON Schema under contracts/ into one Ajv instance (draft 2020-12).
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const BASE = "https://schemas.lifelist.invalid/contracts/";

export function loadSchemas(dir = "contracts") {
  const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: false });
  addFormats(ajv);
  const files = [
    ...readdirSync(dir).filter((f) => f.endsWith(".schema.json")).map((f) => join(dir, f)),
    ...readdirSync(join(dir, "tools")).map((f) => join(dir, "tools", f)),
  ];
  for (const f of files) ajv.addSchema(JSON.parse(readFileSync(f, "utf8")));
  return { ajv, BASE };
}

export const formatErrors = (errors) =>
  errors.map((e) => `  ${e.instancePath || "/"} ${e.message}${e.params ? " " + JSON.stringify(e.params) : ""}`).join("\n");
