// Helpers shared by the tools: provenance for a definition's facts, windows, summaries.
import { fact, type Fact, type FactPolicy, type Provenance } from "./facts.ts";
import type { ExperienceDef, VisaEffort } from "./store.ts";

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

// Visa effort for the whole trip (the hardest across its countries). Today only the
// Atlas seed exists, for Indian passports; per-country rules arrive with the
// World-change Scout.
export function tripVisaEffort(d: ExperienceDef, passport: string, policy: FactPolicy): Fact<VisaEffort> {
  if (passport !== "IN") return { unknown: true, last_checked_at: null, reason: "never_checked" };
  return fact(d.seed?.visa_in_passport?.effort, provenance(d, `exp_${d.id}#visa_in_passport`), "rule", policy);
}

export const budgetBand = (d: ExperienceDef, policy: FactPolicy): Fact<number> =>
  fact<number>(d.budget_band, provenance(d, `exp_${d.id}#budget_band`), "seasonal", policy);
