// Run the World-change Scout from the command line (the scheduled workflow does this).
//   node agents/world-change-scout/run.ts [--passport IN] [--only SCHENGEN] [--report out.md] [--dry-run]
import { writeFileSync } from "node:fs";
import { fetchPage } from "../shared/fetch.ts";
import { extractVisaRule, llmAvailable, MODEL } from "../shared/llm.ts";
import { runScout } from "./scout.ts";

const arg = (name: string) => { const i = process.argv.indexOf(`--${name}`); return i > -1 ? process.argv[i + 1] : undefined; };
const reportPath = arg("report");
const { report } = await runScout({
  passport: arg("passport") ?? "IN",
  only: arg("only"),
  dryRun: process.argv.includes("--dry-run"),
  today: (process.env.LIFELIST_NOW ? new Date(process.env.LIFELIST_NOW) : new Date()).toISOString().slice(0, 10),
  fetchPage,
  ...(llmAvailable() ? { extract: extractVisaRule, modelName: MODEL } : {}),
});
if (reportPath) writeFileSync(reportPath, report + "\n");
console.log(report);
