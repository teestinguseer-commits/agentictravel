// Run the Verifier from the command line (the scheduled workflow does this).
//   node agents/verifier/run.ts [--max 10] [--report out.md] [--dry-run]
import { writeFileSync } from "node:fs";
import { fetchPage } from "../shared/fetch.ts";
import { checkVisaRule, findOfficialSource, llmAvailable, MODEL } from "../shared/llm.ts";
import { runVerifier } from "./verifier.ts";

const arg = (name: string) => { const i = process.argv.indexOf(`--${name}`); return i > -1 ? process.argv[i + 1] : undefined; };
const { report } = await runVerifier({
  today: (process.env.LIFELIST_NOW ? new Date(process.env.LIFELIST_NOW) : new Date()).toISOString().slice(0, 10),
  maxTasks: Number(arg("max") ?? 10),
  dryRun: process.argv.includes("--dry-run"),
  fetchPage,
  ...(llmAvailable() ? { checkRule: checkVisaRule, findSource: findOfficialSource, modelName: MODEL } : {}),
});
const out = arg("report");
if (out) writeFileSync(out, report + "\n");
console.log(report);
