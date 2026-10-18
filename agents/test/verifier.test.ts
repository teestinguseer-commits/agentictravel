import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { parse } from "yaml";
import { runVerifier, isOfficialHost, mentionsDate } from "../verifier/verifier.ts";
import type { Page } from "../shared/fetch.ts";

const VISA = `passport: IN
updated: "2026-10-01"
rules:
  - country: EG
    name: Egypt
    effort: low
    visa_type: e-Visa
    lead_time_days: 14
    official_sources: [https://visa2egypt.gov.eg/]
    checked_at: "2026-10-01"
    verified_by: desk
    confidence: low
  - country: CL
    name: Chile
    effort: high
    visa_type: Consular visa
    lead_time_days: 45
    official_sources: []
    checked_at: "2026-10-01"
    verified_by: desk
    confidence: low
  - country: GB
    name: United Kingdom
    effort: high
    visa_type: Standard Visitor visa
    lead_time_days: 45
    official_sources: [https://www.gov.uk/standard-visitor]
    checked_at: "2026-09-20"
    verified_by: a person
    confidence: medium
`;
const EXP = (id: string, countries: string, date?: string) => `id: ${id}
name: Test ${id}
lane: fest
hook: A long enough hook for the schema to accept it.
place:
  label: Somewhere
  countries: [${countries}]
season_months: [8]
${date ? `fixed_dates:\n  - start: "${date}"\n` : ""}scarcity:
  type: event
budget_band: 2
segments: [young]
safety_flags: []
status: live
provenance:
  source_url: https://example.org/atlas
  checked_at: "2026-10-16"
  verified_by: atlas-seed
  confidence: low
`;

function setup(pages: Record<string, string>) {
  const root = mkdtempSync(join(tmpdir(), "verifier-"));
  mkdirSync(join(root, "visa")); mkdirSync(join(root, "exp"));
  writeFileSync(join(root, "visa", "IN.yaml"), VISA);
  writeFileSync(join(root, "exp", "eclipse.yaml"), EXP("eclipse", "EG", "2027-08-02"));
  writeFileSync(join(root, "exp", "patagonia.yaml"), EXP("patagonia", "CL"));
  const fetchPage = async (url: string): Promise<Page> => {
    if (!(url in pages)) throw new Error("HTTP 404");
    return { url, status: 200, text: pages[url], sha256: createHash("sha256").update(pages[url]).digest("hex") };
  };
  return {
    opts: { today: "2026-10-18", visaDir: join(root, "visa"), experiencesDir: join(root, "exp"), fetchPage, modelName: "fake" },
    visa: () => parse(readFileSync(join(root, "visa", "IN.yaml"), "utf8")).rules,
    exp: (id: string) => parse(readFileSync(join(root, "exp", `${id}.yaml`), "utf8")),
  };
}

const EG_PAGE = "Citizens of India can obtain an e-Visa online before travelling to Egypt.";
const CL_PAGE = "Indian nationals require a consular tourist visa issued by the Consulate of Chile in New Delhi.";
const DATE_PAGE = "The total solar eclipse will be visible from Luxor on 2 August 2027, with totality over six minutes.";

test("verifies a rule with grounded evidence, finds a missing official source, and verifies a date", async () => {
  const s = setup({ "https://visa2egypt.gov.eg/": EG_PAGE, "https://chile.gob.cl/india/visas": CL_PAGE, "https://egypt.travel/eclipse": DATE_PAGE });
  const r = await runVerifier({
    ...s.opts,
    checkRule: async (country) => country === "EG"
      ? { verdict: "confirmed", effort: "low", visa_type: "e-Visa", exemption: null, summary: "ok", evidence_quote: "Citizens of India can obtain an e-Visa online" }
      : { verdict: "confirmed", effort: "high", visa_type: "Consular visa", exemption: null, summary: "ok", evidence_quote: "Indian nationals require a consular tourist visa" },
    findSource: async (claim) => claim.includes("Chile")
      ? { found: true, url: "https://chile.gob.cl/india/visas", quote: "Indian nationals require a consular tourist visa", notes: "" }
      : { found: true, url: "https://egypt.travel/eclipse", quote: "visible from Luxor on 2 August 2027", notes: "" },
  });
  const [eg, cl, gb] = s.visa();
  assert.equal(eg.confidence, "medium");
  assert.equal(eg.verified_by, "verifier (fake)");
  assert.equal(eg.evidence.url, "https://visa2egypt.gov.eg/");
  assert.deepEqual(cl.official_sources, ["https://chile.gob.cl/india/visas"]);
  assert.equal(cl.confidence, "medium");
  assert.equal(gb.confidence, "medium");                       // already verified: left alone
  assert.ok(r.lines.some((l) => l.subject === "visa GB" && l.outcome === "expiring"));
  const fact = s.exp("eclipse").verified_facts[0];
  assert.deepEqual([fact.field, fact.value, fact.confidence], ["fixed_dates", "2027-08-02", "medium"]);
  assert.match(r.report, /Proposed as verified/);
});

test("proposes a correction when the official page states a different rule", async () => {
  const s = setup({ "https://visa2egypt.gov.eg/": "Indian nationals must apply for a visa in person at the Embassy of Egypt." });
  const r = await runVerifier({
    ...s.opts,
    checkRule: async () => ({ verdict: "contradicted", effort: "high", visa_type: "Consular visa", exemption: null, summary: "now consular", evidence_quote: "must apply for a visa in person at the Embassy" }),
  });
  const eg = s.visa()[0];
  assert.equal(eg.effort, "high");
  assert.equal(eg.confidence, "low");                          // a correction is never verified
  assert.match(eg.open_questions.at(-1), /different rule/);
  assert.ok(r.lines.some((l) => l.outcome === "corrected"));
});

test("discards ungrounded answers, unofficial sources and mismatched dates", async () => {
  const s = setup({
    "https://visa2egypt.gov.eg/": EG_PAGE,
    "https://visago.dev/chile": CL_PAGE,
    "https://egypt.travel/eclipse": "The eclipse is on 12 August 2026.",
  });
  const r = await runVerifier({
    ...s.opts,
    checkRule: async () => ({ verdict: "confirmed", effort: "low", visa_type: "e-Visa", exemption: null, summary: "", evidence_quote: "Visa free for all nationalities" }),
    findSource: async (claim) => claim.includes("Chile")
      ? { found: true, url: "https://visago.dev/chile", quote: "Indian nationals require a consular tourist visa", notes: "" }
      : { found: true, url: "https://egypt.travel/eclipse", quote: "The eclipse is on 12 August 2026", notes: "" },
  });
  assert.equal(s.visa()[0].confidence, "low");
  assert.deepEqual(s.visa()[1].official_sources, []);
  assert.equal(s.exp("eclipse").verified_facts, undefined);
  assert.deepEqual(r.lines.filter((l) => l.subject !== "visa GB").map((l) => l.outcome).sort(), ["rejected", "rejected", "unclear"]);
});

test("respects the per-run budget", async () => {
  const s = setup({ "https://visa2egypt.gov.eg/": EG_PAGE });
  let calls = 0;
  const r = await runVerifier({
    ...s.opts, maxTasks: 1,
    checkRule: async () => { calls++; return { verdict: "unclear", effort: null, visa_type: null, exemption: null, summary: "", evidence_quote: "Citizens of India can obtain" }; },
    findSource: async () => { calls++; return { found: false, url: null, quote: null, notes: "" }; },
  });
  assert.equal(calls, 1);
  assert.ok(r.lines.some((l) => l.outcome === "skipped"));
});

test("official hosts and written dates", () => {
  assert.ok(isOfficialHost("https://www.gov.uk/standard-visitor"));
  assert.ok(isOfficialHost("https://chile.gob.cl/india"));
  assert.ok(isOfficialHost("https://eindi.cancilleria.gob.ar/en/node/75902"));
  assert.ok(!isOfficialHost("https://visago.dev/visa/chile"));
  assert.ok(!isOfficialHost("https://someblog.com/chile-visa"));
  assert.ok(mentionsDate("Totality on 2 August 2027 over Luxor", "2027-08-02"));
  assert.ok(mentionsDate("August 2nd, 2027", "2027-08-02"));
  assert.ok(mentionsDate("Date: 02.08.2027", "2027-08-02"));
  assert.ok(!mentionsDate("12 August 2026", "2027-08-02"));
});
