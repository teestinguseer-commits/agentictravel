// World-change Scout (visa beat). Re-reads the official source of every visa rule in
// graph/visa/<passport>.yaml and notices when a page changes. On a change it asks the
// model what the page now says (when a model is available), checks that the answer
// quotes the page verbatim, and edits the rule as a proposal; the pull request the
// workflow opens is the review step (ADR 0002, L0). It never merges anything itself.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { parseDocument } from "yaml";
import { FetchError, type Page } from "../shared/fetch.ts";
import { quoteIsGrounded, type VisaExtraction } from "../shared/llm.ts";

export type Extractor = (country: string, current: { effort: string; visa_type: string; exemption?: string }, url: string, text: string)
  => Promise<VisaExtraction | { refused: true } | { failed: string }>;

export interface ScoutOptions {
  dir?: string;
  passport?: string;
  only?: string;
  today: string;
  dryRun?: boolean;
  fetchPage: (url: string) => Promise<Page>;
  extract?: Extractor;          // absent: changed pages are flagged for a person
  modelName?: string;
}

export type Outcome = "baseline" | "unchanged" | "reconfirmed" | "changed_proposed" | "changed_no_change" | "changed_needs_reader" | "rejected" | "unreachable" | "escalated";
export interface Line { country: string; url: string; outcome: Outcome; detail: string }

const FAILURES_BEFORE_ESCALATION = 3;
interface Snapshot { sha256: string; first_seen: string; last_checked: string; last_changed: string; failures: number; last_error?: string }

export async function runScout(opts: ScoutOptions): Promise<{ lines: Line[]; report: string }> {
  const { dir = "graph/visa", passport = "IN", only, today, dryRun = false, fetchPage, extract, modelName = "model" } = opts;
  const RULES = `${dir}/${passport}.yaml`;
  const SNAPSHOTS = `${dir}/${passport}.snapshots.json`;

  const snapshots: Record<string, Snapshot> = existsSync(SNAPSHOTS) ? JSON.parse(readFileSync(SNAPSHOTS, "utf8")) : {};
  const doc = parseDocument(readFileSync(RULES, "utf8"));
  const rules = doc.get("rules") as any;

  const lines: Line[] = [];
  const useModel = Boolean(extract);

  for (const rule of rules.items) {
    const country = rule.get("country") as string;
    if (only && country !== only) continue;
    const sources = (rule.get("official_sources")?.toJSON() ?? []) as string[];
    if (!sources.length) {
      lines.push({ country, url: "—", outcome: "escalated", detail: "No official source on file; a person needs to find one." });
      continue;
    }
    let allUnchanged = true;
    for (const url of sources) {
      const snap = snapshots[url];
      let page: Page;
      try {
        page = await fetchPage(url);
      } catch (err) {
        allUnchanged = false;
        const message = err instanceof FetchError ? `${err.kind}: ${err.message}` : String(err);
        const failures = (snap?.failures ?? 0) + 1;
        snapshots[url] = { ...(snap ?? { sha256: "", first_seen: today, last_changed: today }), last_checked: today, failures, last_error: message };
        lines.push({ country, url, outcome: failures >= FAILURES_BEFORE_ESCALATION ? "escalated" : "unreachable", detail: `${message} (${failures} run${failures === 1 ? "" : "s"} in a row)` });
        continue;
      }
      if (!snap?.sha256) {
        snapshots[url] = { sha256: page.sha256, first_seen: today, last_checked: today, last_changed: today, failures: 0 };
        lines.push({ country, url, outcome: "baseline", detail: `Recorded ${page.text.length.toLocaleString()} characters.` });
        allUnchanged = false;
        continue;
      }
      if (snap.sha256 === page.sha256) {
        snapshots[url] = { ...snap, last_checked: today, failures: 0, last_error: undefined };
        lines.push({ country, url, outcome: "unchanged", detail: "" });
        continue;
      }
      allUnchanged = false;
      snapshots[url] = { ...snap, sha256: page.sha256, last_checked: today, last_changed: today, failures: 0, last_error: undefined };
      if (!useModel) {
        lines.push({ country, url, outcome: "changed_needs_reader", detail: "The page changed. No model key is set, so a person needs to re-read it." });
        continue;
      }
      const current = { effort: rule.get("effort"), visa_type: rule.get("visa_type"), ...(rule.get("exemption") ? { exemption: rule.get("exemption") } : {}) };
      const result = await extract!(country, current, url, page.text);
      if ("refused" in result || "failed" in result) {
        lines.push({ country, url, outcome: "changed_needs_reader", detail: "refused" in result ? "The model declined; a person needs to re-read it." : `Extraction failed: ${result.failed}` });
        continue;
      }
      if (!quoteIsGrounded(result.evidence_quote, page.text)) {
        lines.push({ country, url, outcome: "rejected", detail: "The model's evidence quote is not on the page, so its answer was discarded." });
        continue;
      }
      if (!result.page_is_about_this_country || !result.applies_to_indian_tourists || result.effort === "unclear" || !result.differs_from_current_rule) {
        lines.push({ country, url, outcome: "changed_no_change", detail: result.summary });
        continue;
      }
      // A proposal: the rule changes in this branch at low confidence, with its evidence.
      rule.set("effort", result.effort);
      rule.set("visa_type", result.visa_type);
      if (result.exemption) rule.set("exemption", result.exemption); else rule.delete("exemption");
      rule.set("evidence", doc.createNode({ url, quote: result.evidence_quote.slice(0, 600), content_sha256: page.sha256 }));
      rule.set("checked_at", today);
      rule.set("verified_by", `world-change-scout (${modelName})`);
      rule.set("confidence", "low");
      lines.push({ country, url, outcome: "changed_proposed", detail: `${current.effort} → ${result.effort}. ${result.summary} Evidence: “${result.evidence_quote}”` });
    }
    // Unchanged pages re-confirm a rule a person already verified (an L1 refresh); they
    // never raise a rule that was never verified.
    if (allUnchanged && sources.length && ["medium", "high", "certain"].includes(rule.get("confidence"))) {
      rule.set("checked_at", today);
      const last = lines.at(-1)!;
      last.outcome = "reconfirmed";
    }
  }

  if (!dryRun) {
    doc.set("updated", today);
    writeFileSync(RULES, doc.toString({ lineWidth: 0, flowCollectionPadding: false }));
    writeFileSync(SNAPSHOTS, JSON.stringify(Object.fromEntries(Object.entries(snapshots).sort()), null, 2) + "\n");
  }

  const count = (o: Outcome) => lines.filter((l) => l.outcome === o).length;
  const needsYou = lines.filter((l) => ["changed_proposed", "changed_needs_reader", "rejected", "escalated"].includes(l.outcome));
  const report = [
    `# World-change Scout: visa rules for ${passport} passports, ${today}`,
    "",
    `Checked ${lines.length} sources${useModel ? ` with ${modelName} reading changed pages` : " (no model key set, so changed pages are flagged for a person)"}.`,
    "",
    `| Outcome | Sources |`,
    `| --- | --- |`,
    ...(["changed_proposed", "changed_needs_reader", "rejected", "escalated", "unreachable", "changed_no_change", "reconfirmed", "unchanged", "baseline"] as Outcome[])
      .filter((o) => count(o)).map((o) => `| ${o.replaceAll("_", " ")} | ${count(o)} |`),
    "",
    needsYou.length ? "## Needs you" : "## Nothing needs you",
    ...needsYou.map((l) => `- **${l.country}** (${l.outcome.replaceAll("_", " ")}) ${l.url}: ${l.detail}`),
    "",
    "## Every source",
    ...lines.map((l) => `- ${l.country}: ${l.outcome.replaceAll("_", " ")} — ${l.url}${l.detail ? ` — ${l.detail}` : ""}`),
    "",
    "Merging this pull request accepts the proposed rules at low confidence. Raise a rule's confidence only after checking its official source yourself.",
  ].join("\n");

  return { lines, report };
}
