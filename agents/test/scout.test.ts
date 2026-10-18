import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { parse } from "yaml";
import { runScout, type Extractor } from "../world-change-scout/scout.ts";
import { FetchError, htmlToText, type Page } from "../shared/fetch.ts";
import { quoteIsGrounded } from "../shared/llm.ts";

const RULES = `passport: IN
updated: "2026-10-01"
rules:
  - country: EG
    name: Egypt
    effort: low
    visa_type: e-Visa
    lead_time_days: 14
    official_sources: [https://visa.example.eg/]
    checked_at: "2026-10-01"
    verified_by: test
    confidence: low
  - country: SCHENGEN
    name: Schengen area
    covers: [ES, FR]
    effort: high
    visa_type: Schengen visa
    lead_time_days: 60
    official_sources: [https://schengen.example.eu/]
    checked_at: "2026-10-01"
    verified_by: a person
    confidence: medium
  - country: TO
    name: Tonga
    effort: medium
    visa_type: unclear
    lead_time_days: 30
    official_sources: []
    checked_at: "2026-10-01"
    verified_by: test
    confidence: low
`;

function setup() {
  const dir = mkdtempSync(join(tmpdir(), "scout-"));
  writeFileSync(join(dir, "IN.yaml"), RULES);
  const pages: Record<string, string | Error> = {
    "https://visa.example.eg/": "Indian nationals can apply for an e-Visa online before travel.",
    "https://schengen.example.eu/": "Short-stay Schengen visas for India are processed by the visa centres.",
  };
  const fetchPage = async (url: string): Promise<Page> => {
    const p = pages[url];
    if (p instanceof Error) throw p;
    return { url, status: 200, text: p, sha256: createHash("sha256").update(p).digest("hex") };
  };
  const rules = () => parse(readFileSync(join(dir, "IN.yaml"), "utf8")).rules;
  return { dir, pages, fetchPage, rules };
}

test("records baselines, re-confirms only verified rules, and flags changed pages", async () => {
  const s = setup();
  let r = await runScout({ dir: s.dir, today: "2026-10-18", fetchPage: s.fetchPage });
  assert.deepEqual(r.lines.map((l) => [l.country, l.outcome]), [["EG", "baseline"], ["SCHENGEN", "baseline"], ["TO", "escalated"]]);

  r = await runScout({ dir: s.dir, today: "2026-10-19", fetchPage: s.fetchPage });
  assert.equal(r.lines.find((l) => l.country === "EG")!.outcome, "unchanged");
  assert.equal(r.lines.find((l) => l.country === "SCHENGEN")!.outcome, "reconfirmed");
  assert.equal(s.rules()[0].checked_at, "2026-10-01");   // low confidence: not re-confirmed
  assert.equal(s.rules()[1].checked_at, "2026-10-19");   // verified by a person: re-confirmed

  s.pages["https://visa.example.eg/"] = "Indian nationals now need a consular visa with an appointment at the embassy.";
  r = await runScout({ dir: s.dir, today: "2026-10-20", fetchPage: s.fetchPage });
  assert.equal(r.lines.find((l) => l.country === "EG")!.outcome, "changed_needs_reader");
  assert.equal(s.rules()[0].effort, "low");              // no model: no edit, only a flag
  assert.match(r.report, /## Needs you/);
});

test("turns a grounded model reading into a proposal, and discards an ungrounded one", async () => {
  const s = setup();
  await runScout({ dir: s.dir, today: "2026-10-18", fetchPage: s.fetchPage });
  s.pages["https://visa.example.eg/"] = "Indian nationals now need a consular visa with an appointment at the embassy.";

  const ungrounded: Extractor = async () => ({
    page_is_about_this_country: true, applies_to_indian_tourists: true, effort: "high", visa_type: "Consular visa",
    exemption: null, differs_from_current_rule: true, summary: "Now consular.", evidence_quote: "Visas are abolished for everyone",
  });
  let r = await runScout({ dir: s.dir, today: "2026-10-19", fetchPage: s.fetchPage, extract: ungrounded, modelName: "fake" });
  assert.equal(r.lines[0].outcome, "rejected");
  assert.equal(s.rules()[0].effort, "low");

  s.pages["https://visa.example.eg/"] += " Applications open 90 days before travel.";
  const grounded: Extractor = async () => ({
    page_is_about_this_country: true, applies_to_indian_tourists: true, effort: "high", visa_type: "Consular visa",
    exemption: null, differs_from_current_rule: true, summary: "Now consular.",
    evidence_quote: "Indian nationals now need a consular visa with an appointment",
  });
  r = await runScout({ dir: s.dir, today: "2026-10-20", fetchPage: s.fetchPage, extract: grounded, modelName: "fake" });
  assert.equal(r.lines[0].outcome, "changed_proposed");
  const eg = s.rules()[0];
  assert.equal(eg.effort, "high");
  assert.equal(eg.confidence, "low");
  assert.equal(eg.verified_by, "world-change-scout (fake)");
  assert.equal(eg.evidence.url, "https://visa.example.eg/");
});

test("escalates a source that fails three runs in a row", async () => {
  const s = setup();
  s.pages["https://visa.example.eg/"] = new FetchError("HTTP 503", "http");
  const outcomes: string[] = [];
  for (const day of ["2026-10-18", "2026-10-19", "2026-10-20"]) {
    const r = await runScout({ dir: s.dir, only: "EG", today: day, fetchPage: s.fetchPage });
    outcomes.push(r.lines[0].outcome);
  }
  assert.deepEqual(outcomes, ["unreachable", "unreachable", "escalated"]);
});

test("page text and quote grounding", () => {
  const text = htmlToText("<html><head><style>p{}</style><script>alert(1)</script></head><body><p>Indian  nationals&nbsp;need an <b>e-Visa</b>.</p></body></html>");
  assert.equal(text, "Indian nationals need an e-Visa .");
  assert.ok(quoteIsGrounded("indian nationals need an", text));
  assert.ok(!quoteIsGrounded("visa free", text));
  assert.ok(!quoteIsGrounded("need", text)); // too short to count as evidence
});
