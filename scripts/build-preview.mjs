// Builds web/preview/dist/lifelist-preview.html: the template plus the repo's graph,
// golden set (with today's automatic check results) and the reference oracle inlined,
// so the page searches with exactly the code the tests use.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { parse } from "yaml";
import { loadGraph, loadVisaRules } from "../evals/lib/graph.mjs";
import { ORACLE_TOOLS } from "../evals/lib/oracle.mjs";
import { check, normalize } from "../evals/lib/assert.mjs";

const SPECIAL_CARE = ["G063", "G066", "G074", "G100"];
const git = (cmd, fallback) => { try { return execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); } catch { return fallback; } };

const graph = loadGraph();
const golden = parse(readFileSync("evals/golden/golden.yaml", "utf8")).items.map((item) => {
  let auto = "judge";
  let check_results;
  if (item.checks) {
    if (item.requires_data?.length) auto = "awaiting_data";
    else if (!ORACLE_TOOLS[item.tool.name]) auto = "awaiting_tool";
    else {
      const out = normalize(ORACLE_TOOLS[item.tool.name](graph, item.tool.args));
      check_results = item.checks.map((c) => check(out, c).ok);
      auto = check_results.every(Boolean) ? "pass" : "awaiting_tool";
    }
  }
  return { ...item, auto, ...(check_results ? { check_results } : {}) };
});

const data = {
  build: {
    date: new Date().toISOString().slice(0, 10),
    branch: git("git rev-parse --abbrev-ref HEAD", "unknown"),
    commit: git("git rev-parse --short HEAD", "unknown"),
  },
  experiences: [...graph.values()].sort((a, b) => a.id.localeCompare(b.id)),
  golden,
  visa_rules: [...loadVisaRules("IN").entries()],
  special_care: SPECIAL_CARE,
};

// In the browser the oracle reads visa rules from the embedded data instead of the file system.
const oracle = readFileSync("evals/lib/oracle.mjs", "utf8")
  .replace(/^import \{ loadVisaRules \} from "\.\/graph\.mjs";$/m, 'const loadVisaRules = () => new Map(JSON.parse(document.getElementById("data").textContent).visa_rules);')
  .replace(/^export /gm, "");
const json = JSON.stringify(data).replace(/</g, "\\u003c");
const html = readFileSync("web/preview/template.html", "utf8")
  .replace("/*__DATA__*/", () => json)
  .replace("/*__ORACLE__*/", () => oracle);

mkdirSync("web/preview/dist", { recursive: true });
writeFileSync("web/preview/dist/lifelist-preview.html", html);
console.log(`Wrote web/preview/dist/lifelist-preview.html (${(html.length / 1024).toFixed(0)} KB): ${data.experiences.length} experiences, ${golden.length} questions`);
