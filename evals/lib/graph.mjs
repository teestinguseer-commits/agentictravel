// Loads the git-stored graph: experience definitions and visa rules.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { parse } from "yaml";

export function loadGraph(dir = "graph/experiences") {
  const defs = new Map();
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".yaml"))) {
    const d = parse(readFileSync(`${dir}/${f}`, "utf8"));
    defs.set(d.id, d);
  }
  return defs;
}

// Visa rules for one passport, keyed by ISO country code. A group rule (Schengen)
// appears under each country it covers, with `group` set to the group's key.
export function loadVisaRules(passport = "IN", dir = "graph/visa") {
  const path = `${dir}/${passport}.yaml`;
  const byCountry = new Map();
  if (!existsSync(path)) return byCountry;
  const doc = parse(readFileSync(path, "utf8"));
  for (const rule of doc.rules) {
    if (rule.covers) for (const c of rule.covers) byCountry.set(c, { ...rule, group: rule.country, country: c });
    else byCountry.set(rule.country, rule);
  }
  return byCountry;
}
