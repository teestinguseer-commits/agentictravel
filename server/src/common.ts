// Helpers shared by the tools: provenance for a definition's facts, windows, summaries.
import { fact, type Fact, type FactPolicy, type Provenance } from "./facts.ts";
import type { ExperienceDef, GraphStore, VisaEffort, VisaRule } from "./store.ts";

export const SUPPORTED_PASSPORTS = new Set(["IN"]);
export const VISA_ORDER: VisaEffort[] = ["none", "low", "medium", "high"];
export const RARITY_ORDER = ["once", "permit_cap", "lottery", "capacity", "natural", "season", "event"];
export const BAND_FLOOR_INR = [0, 0, 150_000, 400_000, 800_000];
export const BAND_LABEL = ["", "under ₹1.5 lakh", "₹1.5–4 lakh", "₹4–8 lakh", "above ₹8 lakh"];
export const MONTH_NAMES = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export interface ToolContext {
  policy: FactPolicy;
  channel: string;
}

export interface ToolError {
  error: {
    code: "INVALID_INPUT" | "NOT_FOUND" | "UNSUPPORTED_PASSPORT" | "UNAUTHORIZED" | "RATE_LIMITED" | "DUPLICATE_REQUEST" | "UNAVAILABLE" | "INTERNAL";
    message: string;
    retryable: boolean;
    retry_after_seconds?: number;
    field?: string;
  };
}

export const toolError = (code: ToolError["error"]["code"], message: string, extra: Partial<ToolError["error"]> = {}): ToolError => ({
  error: { code, message, retryable: code === "RATE_LIMITED" || code === "UNAVAILABLE", ...extra },
});

export function provenance(d: ExperienceDef, recordId: string): Provenance {
  return {
    source_url: d.provenance.source_url,
    checked_at: `${d.provenance.checked_at}T00:00:00Z`,
    confidence: d.provenance.confidence,
    record_id: recordId,
  };
}

export interface WindowValue {
  months: number[];
  starts_on?: string;
  ends_on?: string;
  note?: string;
}

// Seasonal window plus one per fixed date, with record ids matching supabase/seed.sql.
export function windowsOf(d: ExperienceDef, policy: FactPolicy): Fact<WindowValue>[] {
  const out: Fact<WindowValue>[] = [];
  if (d.season_months.length) {
    out.push(fact<WindowValue>({ months: d.season_months, ...(d.window_note ? { note: d.window_note } : {}) },
      provenance(d, `win_${d.id}_season`), "seasonal", policy));
  }
  for (const f of d.fixed_dates ?? []) {
    out.push(fact<WindowValue>({
      months: [Number(f.start.slice(5, 7))],
      starts_on: f.start,
      ...(f.end ? { ends_on: f.end } : {}),
      ...(d.window_note ? { note: d.window_note } : {}),
    }, provenance(d, `win_${d.id}_${f.start}`), "fixed", policy));
  }
  return out;
}

// The next window from `now`: an upcoming fixed date if there is one, else the season.
export function nextWindow(d: ExperienceDef, policy: FactPolicy): Fact<WindowValue> {
  const today = policy.now.toISOString().slice(0, 10);
  const all = windowsOf(d, policy);
  const upcoming = all.find((w) => "value" in w && w.value.starts_on && w.value.starts_on >= today);
  if (upcoming) return upcoming;
  const seasonal = all.find((w) => "value" in w && !w.value.starts_on);
  return seasonal ?? all[0] ?? { unknown: true, last_checked_at: null, reason: "never_checked" };
}

const VISA_FILE_URL = "https://github.com/teestinguseer-commits/agentictravel/blob/main/graph/visa/IN.yaml";

export function ruleProvenance(rule: VisaRule, passport: string): Provenance {
  return {
    source_url: rule.official_sources[0] ?? VISA_FILE_URL,
    checked_at: `${rule.checked_at}T00:00:00Z`,
    confidence: rule.confidence,
    record_id: `visa_${passport}_${rule.group ?? rule.country}`,
  };
}

// The countries whose visa rules apply to the traveller: not their own, and not any
// whose documents the booking arranges (the MEA yatra, for example).
export const visaCountries = (d: ExperienceDef, passport: string) =>
  d.place.countries.filter((c) => c !== passport && !(d.visa_arranged?.countries ?? []).includes(c));

// Visa effort for the whole trip: the hardest rule across the countries entered. Falls
// back to the Atlas seed while any country lacks a rule.
export function tripVisaEffort(d: ExperienceDef, passport: string, policy: FactPolicy, store?: GraphStore): Fact<VisaEffort> {
  if (passport !== "IN") return { unknown: true, last_checked_at: null, reason: "never_checked" };
  const countries = visaCountries(d, passport);
  if (!countries.length) return fact<VisaEffort>("none", provenance(d, `exp_${d.id}#countries`), "seasonal", policy);
  const rules = store ? countries.map((c) => store.visaRule(passport, c)) : [];
  if (!store || rules.some((r) => !r)) {
    return fact(d.seed?.visa_in_passport?.effort, provenance(d, `exp_${d.id}#visa_in_passport`), "rule", policy);
  }
  const hardest = (rules as VisaRule[]).reduce((a, b) => (VISA_ORDER.indexOf(b.effort) > VISA_ORDER.indexOf(a.effort) ? b : a));
  const prov = ruleProvenance(hardest, passport);
  // The trip is only as fresh and as certain as its weakest rule.
  const oldest = (rules as VisaRule[]).map((r) => r.checked_at).sort()[0];
  const ranks = ["low", "medium", "high", "certain"];
  const weakest = (rules as VisaRule[]).map((r) => r.confidence).sort((a, b) => ranks.indexOf(a) - ranks.indexOf(b))[0];
  return fact<VisaEffort>(hardest.effort, { ...prov, checked_at: `${oldest}T00:00:00Z`, confidence: weakest }, "rule", policy);
}

export const budgetBand = (d: ExperienceDef, policy: FactPolicy): Fact<number> =>
  fact<number>(d.budget_band, provenance(d, `exp_${d.id}#budget_band`), "seasonal", policy);
