// Verifier. Checks unverified facts against official sources and proposes raising them
// to medium confidence, with the evidence quoted from the page. Nothing it proposes
// reaches travellers until a person merges the pull request (ADR 0002). Today it covers:
//  - visa rules in graph/visa/<passport>.yaml (finding an official source when none is
//    on file), ranked by how many experiences each rule affects;
//  - fixed event dates in graph/experiences/*.yaml;
//  - a freshness report of facts about to pass their limit.
// Every model answer is re-checked by fetching the page ourselves: the quote must be on it.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { parseDocument } from "yaml";
import type { Page } from "../shared/fetch.ts";
import { BLOCKED_SOURCE_DOMAINS, quoteIsGrounded, type RuleCheck, type SourceFinding } from "../shared/llm.ts";

export interface VerifierOptions {
  today: string;
  passport?: string;
  visaDir?: string;
  experiencesDir?: string;
  maxTasks?: number;              // model-backed checks per run (cost control)
  dryRun?: boolean;
  fetchPage: (url: string) => Promise<Page>;
  checkRule?: (country: string, rule: { effort: string; visa_type: string; exemption?: string }, url: string, text: string) => Promise<RuleCheck | { failed: string }>;
  findSource?: (claim: string, hint: string) => Promise<SourceFinding | { failed: string }>;
  modelName?: string;
}

export type Outcome = "verified" | "corrected" | "source_added" | "unclear" | "rejected" | "failed" | "expiring" | "skipped";
export interface Line { subject: string; outcome: Outcome; detail: string }

const DAY = 86_400_000;
const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / DAY);
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function isOfficialHost(url: string, knownHosts: Set<string> = new Set()): boolean {
  let host: string;
  try { host = new URL(url).hostname.toLowerCase(); } catch { return false; }
  if (BLOCKED_SOURCE_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`))) return false;
  if (knownHosts.has(host)) return true;
  return /(^|\.)(gov|gob|gouv|govt|go|gc|admin)\.[a-z]{2,3}$/.test(host)
    || /\.gov$/.test(host) || /(^|\.)europa\.eu$/.test(host)
    || /(embassy|immigration|cancilleria|consulate|evisa|mfa|mofa)/.test(host);
}

// Does the text mention this ISO date in a common written form?
export function mentionsDate(text: string, iso: string): boolean {
  const [y, m, d] = iso.split("-").map(Number);
  const month = MONTHS[m - 1], mon = month.slice(0, 3);
  const dd = String(d).padStart(2, "0"), mm = String(m).padStart(2, "0");
  const t = text.replace(/\s+/g, " ").replace(/(\d)(st|nd|rd|th)\b/g, "$1").toLowerCase();
  return [
    iso, `${d} ${month} ${y}`, `${d} ${mon} ${y}`, `${month} ${d}, ${y}`, `${month} ${d} ${y}`, `${mon} ${d}, ${y}`,
    `${dd}.${mm}.${y}`, `${dd}/${mm}/${y}`,
  ].some((v) => t.includes(v.toLowerCase()));
}

export async function runVerifier(opts: VerifierOptions): Promise<{ lines: Line[]; report: string }> {
  const { today, passport = "IN", visaDir = "graph/visa", experiencesDir = "graph/experiences", maxTasks = 10, dryRun = false, fetchPage, checkRule, findSource, modelName = "model" } = opts;
  const lines: Line[] = [];
  let budget = maxTasks;
  const verifiedBy = `verifier (${modelName})`;

  const visaPath = `${visaDir}/${passport}.yaml`;
  const visaDoc = parseDocument(readFileSync(visaPath, "utf8"));
  const rules = (visaDoc.get("rules") as any).items as any[];
  const knownHosts = new Set(rules.flatMap((r) => (r.get("official_sources")?.toJSON() ?? []).map((u: string) => new URL(u).hostname)));

  const expFiles = readdirSync(experiencesDir).filter((f) => f.endsWith(".yaml")).sort();
  const experiences = expFiles.map((f) => ({ file: `${experiencesDir}/${f}`, doc: parseDocument(readFileSync(`${experiencesDir}/${f}`, "utf8")) }));
  const changedExperiences = new Set<string>();

  // 1. Freshness: facts that pass their limit within a week (visa rules: 30 days).
  for (const r of rules) {
    const age = daysBetween(r.get("checked_at"), today);
    if (age >= 23) lines.push({ subject: `visa ${r.get("country")}`, outcome: "expiring", detail: age >= 30 ? `stale for ${age - 30} days` : `goes stale in ${30 - age} days` });
  }

  // 2. Visa rules at low confidence, most-used first.
  const usage = (r: any) => {
    const covers: string[] = r.get("covers")?.toJSON() ?? [r.get("country")];
    return experiences.filter(({ doc }) => (doc.getIn(["place", "countries"]) as any).toJSON().some((c: string) => covers.includes(c))).length;
  };
  const pending = rules.filter((r) => r.get("confidence") === "low").sort((a, b) => usage(b) - usage(a));
  for (const r of pending) {
    const country = r.get("country") as string;
    const subject = `visa ${country}`;
    if (!checkRule) { lines.push({ subject, outcome: "skipped", detail: "No model key; nothing verified." }); continue; }
    if (budget <= 0) { lines.push({ subject, outcome: "skipped", detail: "Run budget used up; next run." }); continue; }
    let sources: string[] = r.get("official_sources")?.toJSON() ?? [];

    if (!sources.length && findSource) {
      budget--;
      const found = await findSource(`The tourist visa rule for Indian passport holders visiting ${r.get("name")}`,
        "Look for the government immigration or e-visa portal, or the country's embassy or consulate in India.");
      if ("failed" in found || !found.found || !found.url || !found.quote) {
        lines.push({ subject, outcome: "unclear", detail: "failed" in found ? found.failed : `No official source found. ${found.notes}` });
        continue;
      }
      if (!isOfficialHost(found.url, knownHosts)) { lines.push({ subject, outcome: "rejected", detail: `${found.url} does not look like an official source.` }); continue; }
      let page: Page;
      try { page = await fetchPage(found.url); } catch (e) { lines.push({ subject, outcome: "failed", detail: `Found ${found.url} but could not fetch it to confirm: ${(e as Error).message}` }); continue; }
      if (!quoteIsGrounded(found.quote, page.text)) { lines.push({ subject, outcome: "rejected", detail: `The quote from ${found.url} is not on the page.` }); continue; }
      r.set("official_sources", visaDoc.createNode([found.url]));
      sources = [found.url];
      lines.push({ subject, outcome: "source_added", detail: `${found.url}: “${found.quote}”` });
    }

    for (const url of sources) {
      if (budget <= 0) break;
      let page: Page;
      try { page = await fetchPage(url); } catch (e) { lines.push({ subject, outcome: "failed", detail: `${url}: ${(e as Error).message}` }); continue; }
      budget--;
      const current = { effort: r.get("effort"), visa_type: r.get("visa_type"), ...(r.get("exemption") ? { exemption: r.get("exemption") } : {}) };
      const result = await checkRule(country, current, url, page.text);
      if ("failed" in result) { lines.push({ subject, outcome: "failed", detail: result.failed }); continue; }
      if (!quoteIsGrounded(result.evidence_quote, page.text)) { lines.push({ subject, outcome: "rejected", detail: `The model's quote is not on ${url}; its answer was discarded.` }); continue; }
      if (result.verdict === "confirmed") {
        r.set("confidence", "medium");
        r.set("verified_by", verifiedBy);
        r.set("checked_at", today);
        r.set("evidence", visaDoc.createNode({ url, quote: result.evidence_quote.slice(0, 600), content_sha256: page.sha256 }));
        lines.push({ subject, outcome: "verified", detail: `${url}: “${result.evidence_quote}”${r.get("open_questions") ? " (open questions remain; read them before merging)" : ""}` });
        break;
      }
      if (result.verdict === "contradicted" && result.effort) {
        const before = `${current.effort}: ${current.visa_type}`;
        r.set("effort", result.effort);
        if (result.visa_type) r.set("visa_type", result.visa_type);
        if (result.exemption) r.set("exemption", result.exemption);
        r.set("checked_at", today);
        r.set("verified_by", verifiedBy);
        r.set("evidence", visaDoc.createNode({ url, quote: result.evidence_quote.slice(0, 600), content_sha256: page.sha256 }));
        const questions: string[] = r.get("open_questions")?.toJSON() ?? [];
        r.set("open_questions", visaDoc.createNode([...questions, `Verifier read a different rule on ${url} (was ${before}); confirm before merging.`]));
        lines.push({ subject, outcome: "corrected", detail: `${before} → ${result.effort}: ${result.visa_type ?? current.visa_type}. “${result.evidence_quote}”` });
        break;
      }
      lines.push({ subject, outcome: "unclear", detail: `${url}: ${result.summary}` });
    }
  }

  // 3. Fixed event dates not yet verified, soonest first.
  const dated = experiences.flatMap(({ file, doc }) => ((doc.get("fixed_dates") as any)?.toJSON() ?? [])
    .map((f: { start: string }) => ({ file, doc, start: f.start })))
    .filter(({ doc, start }) => start >= today && !((doc.get("verified_facts") as any)?.toJSON() ?? []).some((v: any) => v.field === "fixed_dates" && v.value === start))
    .sort((a, b) => a.start.localeCompare(b.start));
  for (const { file, doc, start } of dated) {
    const subject = `date ${doc.get("id")} ${start}`;
    if (!findSource) { lines.push({ subject, outcome: "skipped", detail: "No model key; nothing verified." }); continue; }
    if (budget <= 0) { lines.push({ subject, outcome: "skipped", detail: "Run budget used up; next run." }); continue; }
    budget--;
    const [y, m, d] = start.split("-").map(Number);
    const found = await findSource(`${doc.get("name")} takes place on ${d} ${MONTHS[m - 1]} ${y}`,
      `Find the organiser's or the official tourism or government page that states this date. Place: ${doc.getIn(["place", "label"])}.`);
    if ("failed" in found || !found.found || !found.url || !found.quote) {
      lines.push({ subject, outcome: "unclear", detail: "failed" in found ? found.failed : `No official source found. ${found.notes}` });
      continue;
    }
    if (BLOCKED_SOURCE_DOMAINS.some((b) => new URL(found.url!).hostname.endsWith(b))) { lines.push({ subject, outcome: "rejected", detail: `${found.url} is an aggregator.` }); continue; }
    let page: Page;
    try { page = await fetchPage(found.url); } catch (e) { lines.push({ subject, outcome: "failed", detail: `Found ${found.url} but could not fetch it to confirm: ${(e as Error).message}` }); continue; }
    if (!quoteIsGrounded(found.quote, page.text)) { lines.push({ subject, outcome: "rejected", detail: `The quote from ${found.url} is not on the page.` }); continue; }
    if (!mentionsDate(found.quote, start)) { lines.push({ subject, outcome: "unclear", detail: `${found.url} does not state ${start} in the quote: “${found.quote}”. Possible date change; check it.` }); continue; }
    const facts = (doc.get("verified_facts") as any)?.toJSON() ?? [];
    doc.set("verified_facts", doc.createNode([...facts, {
      field: "fixed_dates", value: start, source_url: found.url, quote: found.quote.slice(0, 600),
      checked_at: today, verified_by: verifiedBy, confidence: "medium",
    }]));
    changedExperiences.add(file);
    lines.push({ subject, outcome: "verified", detail: `${found.url}: “${found.quote}”` });
  }

  if (!dryRun) {
    writeFileSync(visaPath, visaDoc.toString({ lineWidth: 0, flowCollectionPadding: false }));
    for (const { file, doc } of experiences) if (changedExperiences.has(file)) writeFileSync(file, doc.toString({ lineWidth: 0 }));
  }

  const count = (o: Outcome) => lines.filter((l) => l.outcome === o).length;
  const section = (title: string, outcomes: Outcome[]) => {
    const rows = lines.filter((l) => outcomes.includes(l.outcome));
    return rows.length ? [`## ${title}`, ...rows.map((l) => `- **${l.subject}** (${l.outcome}): ${l.detail}`), ""] : [];
  };
  const report = [
    `# Verifier: ${today}`,
    "",
    checkRule || findSource ? `Model: ${modelName}. Checks this run: ${maxTasks - budget} of ${maxTasks}.` : "No model key set, so only the freshness report ran.",
    "",
    `| Outcome | Count |`, `| --- | --- |`,
    ...(["verified", "corrected", "source_added", "unclear", "rejected", "failed", "expiring", "skipped"] as Outcome[]).filter((o) => count(o)).map((o) => `| ${o.replace("_", " ")} | ${count(o)} |`),
    "",
    ...section("Proposed as verified (raised to medium confidence)", ["verified"]),
    ...section("Proposed corrections", ["corrected"]),
    ...section("Official sources found", ["source_added"]),
    ...section("Needs a person", ["unclear", "rejected", "failed"]),
    ...section("Going stale soon", ["expiring"]),
    "Merging accepts these at **medium** confidence, which production shows to travellers (ADR 0005). Open each evidence link before merging.",
  ].join("\n");
  return { lines, report };
}
