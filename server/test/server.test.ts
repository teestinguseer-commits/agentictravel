import { test } from "node:test";
import assert from "node:assert/strict";
import { connect } from "../src/harness.ts";
import { YamlStore } from "../src/store.ts";
import { fact, policyFromEnv } from "../src/facts.ts";
import { _resetRateLimits } from "../src/tools/request.ts";

const NOW = new Date("2026-10-18T06:00:00Z");
const policy = () => ({ now: NOW, minConfidence: "low" as const });

test("lists the four contract tools with self-contained schemas", async () => {
  const h = await connect(new YamlStore(), { policy });
  const { tools } = await h.client.listTools();
  assert.deepEqual(tools.map((t) => t.name).sort(), ["check_feasibility", "get_experience", "request_experience", "search_experiences"]);
  for (const t of tools) {
    assert.equal(t.inputSchema.type, "object");
    assert.ok(!JSON.stringify(t.inputSchema).includes("$ref"), `${t.name} input has a $ref`);
    assert.ok(!JSON.stringify(t.outputSchema).includes("$ref"), `${t.name} output has a $ref`);
  }
  assert.equal(tools.find((t) => t.name === "request_experience")!.annotations!.readOnlyHint, false);
  await h.close();
});

test("rejects invalid input with the offending field", async () => {
  const h = await connect(new YamlStore(), { policy });
  const res: any = await h.client.callTool({ name: "search_experiences", arguments: { month: 13 } });
  assert.equal(res.isError, true);
  const body = JSON.parse(res.content[0].text);
  assert.equal(body.error.code, "INVALID_INPUT");
  assert.equal(body.error.field, "month");
  await h.close();
});

test("search: weak matches are labelled and offer a request", async () => {
  const h = await connect(new YamlStore(), { policy });
  const out = await h.call("search_experiences", { query: "northern lights in Ladakh" });
  assert.equal(out.match_quality, "weak");
  assert.ok(out.results.length > 0 && out.results.every((r: any) => r.score < 0.5));
  assert.equal(out.suggest_request.tool, "request_experience");
  await h.close();
});

test("search: paginates without losing or repeating results", async () => {
  const h = await connect(new YamlStore(), { policy });
  const ids: string[] = [];
  let cursor: string | undefined;
  do {
    const out = await h.call("search_experiences", { limit: 7, ...(cursor ? { cursor } : {}) });
    ids.push(...out.results.map((r: any) => r.id));
    cursor = out.next_cursor ?? undefined;
  } while (cursor);
  assert.equal(ids.length, 65);
  assert.equal(new Set(ids).size, 65);
  await h.close();
});

test("get_experience validates against its contract for all 65 experiences", async () => {
  const store = new YamlStore();
  const h = await connect(store, { policy }); // the harness turns the contract guard on
  for (const d of store.all()) {
    const out = await h.call("get_experience", { id: d.id });
    assert.equal(out.id, d.id);
  }
  const missing: any = await h.client.callTool({ name: "get_experience", arguments: { id: "eclipse-2026" } });
  assert.equal(missing.isError, true);
  await h.close();
});

test("check_feasibility returns a contract-valid verdict for every experience", async () => {
  const store = new YamlStore();
  const h = await connect(store, { policy });
  for (const d of store.all()) {
    const out = await h.call("check_feasibility", { experience_id: d.id, budget_inr_max: 300000, fitness: "moderate" });
    assert.ok(["yes", "maybe", "not_yet"].includes(out.verdict), d.id);
  }
  await h.close();
});

test("check_feasibility turns visa lead times into dated deadlines", async () => {
  const h = await connect(new YamlStore(), { policy });
  const out = await h.call("check_feasibility", { experience_id: "eclipse-luxor", travel_window: { earliest: "2027-07-30", latest: "2027-08-05" } });
  assert.equal(out.target_window.value.starts_on, "2027-08-02");
  assert.equal(out.verdict, "yes");
  assert.deepEqual(out.timeline.map((t: any) => t.by), ["2027-07-19"]); // 14-day e-Visa lead time
  assert.ok(out.reasons.some((r: any) => r.code === "VISA_LEAD_TIME" && r.facts.includes("visa_IN_EG")));
  await h.close();
});

test("check_feasibility never says yes while a visa rule is missing", async () => {
  class NoEgyptRule extends YamlStore {
    visaRule(passport: string, country: string) { return country === "EG" ? undefined : super.visaRule(passport, country); }
  }
  const h = await connect(new NoEgyptRule(), { policy });
  const out = await h.call("check_feasibility", { experience_id: "eclipse-luxor" });
  assert.equal(out.verdict, "maybe");
  assert.ok(out.reasons.some((r: any) => r.code === "FACT_UNKNOWN"));
  await h.close();
});

test("visa arranged by the booking doesn't count against the traveller", async () => {
  const h = await connect(new YamlStore(), { policy });
  const exp = await h.call("get_experience", { id: "kailash", include: ["visa"] });
  assert.equal(exp.visa[0].effort.value, "none");
  const found = await h.call("search_experiences", { max_visa_effort: "none" });
  assert.ok(found.results.some((r: any) => r.id === "kailash"));
  await h.close();
});

test("request_experience is idempotent and rate limited", async () => {
  _resetRateLimits();
  const store = new YamlStore();
  const h = await connect(store, { policy });
  const args = { description: "Cherry blossom somewhere cheaper than Japan", idempotency_key: "test-key-0001" };
  const first = await h.call("request_experience", args);
  const again = await h.call("request_experience", args);
  assert.equal(first.status, "received");
  assert.equal(again.status, "duplicate_of_existing");
  assert.equal(again.request_id, first.request_id);
  assert.equal(store.requests.length, 1);
  assert.equal(first.notify, false); // anonymous callers can't be notified
  for (let i = 0; i < 18; i++) await h.call("request_experience", { ...args, idempotency_key: `test-key-${i + 2}xx` });
  const limited: any = await h.client.callTool({ name: "request_experience", arguments: { ...args, idempotency_key: "test-key-over" } });
  assert.equal(JSON.parse(limited.content[0].text).error.code, "RATE_LIMITED");
  _resetRateLimits();
  await h.close();
});

test("usage events are recorded per client channel for Pulse", async () => {
  const store = new YamlStore();
  const h = await connect(store, { policy }, "Claude Desktop");
  await h.call("search_experiences", { query: "Kumbh Mela" });
  const ev = store.events.find((e) => e.type === "search.zero_result");
  assert.ok(ev);
  assert.equal(ev!.channel, "mcp:claude-desktop");
  await h.close();
});

test("facts go unknown when stale or below the minimum confidence", () => {
  const prov = { source_url: "https://example.org", checked_at: "2026-10-16T00:00:00Z", confidence: "low" as const, record_id: "x" };
  assert.deepEqual(fact(3, prov, "seasonal", { now: NOW, minConfidence: "low" }), { value: 3, provenance: prov });
  assert.equal((fact(3, prov, "price", { now: NOW, minConfidence: "low" }) as any).reason, "stale");
  assert.equal((fact(3, prov, "seasonal", { now: NOW, minConfidence: "medium" }) as any).reason, "unverified");
  assert.equal((fact(null, prov, "fixed", { now: NOW, minConfidence: "low" }) as any).reason, "never_checked");
  assert.throws(() => policyFromEnv({ LIFELIST_MIN_CONFIDENCE: "sure" } as any));
});

test("in production, only verified facts reach travellers", async () => {
  const { mkdtempSync, cpSync, readFileSync, writeFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  const { tmpdir } = await import("node:os");
  const dir = mkdtempSync(join(tmpdir(), "graph-"));
  cpSync("graph/experiences", dir, { recursive: true });
  const file = join(dir, "eclipse-luxor.yaml");
  writeFileSync(file, readFileSync(file, "utf8") + `verified_facts:
  - field: fixed_dates
    value: "2027-08-02"
    source_url: https://example.gov/eclipse
    quote: Totality over Luxor on 2 August 2027.
    checked_at: "2026-10-18"
    verified_by: a person
    confidence: medium
`);
  const h = await connect(new YamlStore(dir), { policy: () => ({ now: NOW, minConfidence: "medium" as const }) });
  const out = await h.call("get_experience", { id: "eclipse-luxor", include: ["windows"] });
  const fixed = out.windows.find((w: any) => w.value?.starts_on === "2027-08-02");
  assert.equal(fixed.provenance.source_url, "https://example.gov/eclipse");
  assert.ok(out.windows.some((w: any) => w.reason === "unverified")); // the unverified seasonal window
  assert.equal(out.budget_band.reason, "unverified");
  await h.close();
});
