// Loads graph/experiences/*.yaml into a Map keyed by id.
import { readFileSync, readdirSync } from "node:fs";
import { parse } from "yaml";

export function loadGraph(dir = "graph/experiences") {
  const defs = new Map();
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".yaml"))) {
    const d = parse(readFileSync(`${dir}/${f}`, "utf8"));
    defs.set(d.id, d);
  }
  return defs;
}
