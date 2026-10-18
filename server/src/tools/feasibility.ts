// check_feasibility: what the graph can answer today (season, fixed dates, budget band,
// safety flags, ballots and permits), with every missing fact named as FACT_UNKNOWN so
// the verdict never claims more than the data supports. Visa lead times, age limits and
// leave-day bridging plug in as their data arrives.
import { isKnown, type Fact } from "../facts.ts";
import type { ExperienceDef, GraphStore } from "../store.ts";
import {
  BAND_FLOOR_INR, BAND_LABEL, MONTH_NAMES, SUPPORTED_PASSPORTS, budgetBand, nextWindow, ruleProvenance, toolError, visaCountries,
  windowsOf, type ToolContext, type ToolError, type WindowValue,
} from "../common.ts";

export interface FeasibilityArgs {
  experience_id: string;
  passport?: string;
  home_city?: string;
  travel_window?: { earliest: string; latest: string };
  leave_days?: number;
  budget_inr_max?: number;
  party?: { adults?: number; children_ages?: number[]; senior_ages?: number[] };
  fitness?: "low" | "moderate" | "high";
  cold_tolerance?: "low" | "moderate" | "high";
}

type Severity = "blocker" | "warning" | "info";
interface Reason { code: string; severity: Severity; message: string; facts?: string[] }

function monthsBetween(earliest: string, latest: string): number[] {
  const out = new Set<number>();
  const d = new Date(`${earliest.slice(0, 7)}-01T00:00:00Z`);
  const end = new Date(`${latest.slice(0, 7)}-01T00:00:00Z`);
  for (let i = 0; d <= end && i < 24; i++) { out.add(d.getUTCMonth() + 1); d.setUTCMonth(d.getUTCMonth() + 1); }
  return [...out];
}

const addDays = (iso: string, days: number) => new Date(Date.parse(`${iso}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);

// The date the trip starts: a fixed date, the traveller's earliest date, or the first day
// of the next season month.
function tripStart(d: ExperienceDef, args: FeasibilityArgs, target: Fact<WindowValue> | undefined, now: Date): string | null {
  if (target && isKnown(target) && target.value.starts_on) return target.value.starts_on;
  if (args.travel_window) return args.travel_window.earliest;
  if (!d.season_months.length) return null;
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  for (let i = 0; i < 12; i++) {
    if (d.season_months.includes(date.getUTCMonth() + 1)) return date.toISOString().slice(0, 10);
    date.setUTCMonth(date.getUTCMonth() + 1);
  }
  return null;
}

function pickWindow(d: ExperienceDef, args: FeasibilityArgs, ctx: ToolContext, reasons: Reason[]): Fact<WindowValue> | undefined {
  const windows = windowsOf(d, ctx.policy);
  if (!windows.length) {
    reasons.push({ code: "FACT_UNKNOWN", severity: "warning", message: "The dates are still to be announced." });
    return undefined;
  }
  if (!args.travel_window) return nextWindow(d, ctx.policy);
  const { earliest, latest } = args.travel_window;
  const fixedInside = windows.find((w) => isKnown(w) && w.value.starts_on && w.value.starts_on >= earliest && w.value.starts_on <= latest);
  if (fixedInside) return fixedInside;
  const fixedOnly = windows.every((w) => isKnown(w) && w.value.starts_on);
  const travelMonths = monthsBetween(earliest, latest);
  const seasonal = windows.find((w) => isKnown(w) && !w.value.starts_on);
  if (!fixedOnly && seasonal && isKnown(seasonal) && seasonal.value.months.some((m) => travelMonths.includes(m))) return seasonal;
  const when = d.season_months.length ? d.season_months.map((m) => MONTH_NAMES[m].slice(0, 3)).join(", ") : "dates to be announced";
  reasons.push({
    code: "WINDOW_OUTSIDE_TRAVEL_DATES",
    severity: "blocker",
    message: `Not possible between ${earliest} and ${latest}. It runs: ${when}.`,
    facts: windows.filter(isKnown).map((w) => w.provenance.record_id),
  });
  return undefined;
}

export function checkFeasibility(store: GraphStore, args: FeasibilityArgs, ctx: ToolContext): object | ToolError {
  const passport = args.passport ?? "IN";
  if (!SUPPORTED_PASSPORTS.has(passport))
    return toolError("UNSUPPORTED_PASSPORT", `Feasibility currently covers Indian passports only (IN), not ${passport}.`, { field: "passport" });
  if (args.travel_window && args.travel_window.latest < args.travel_window.earliest)
    return toolError("INVALID_INPUT", "travel_window.latest is before travel_window.earliest", { field: "travel_window" });
  const d = store.get(args.experience_id);
  if (!d) return toolError("NOT_FOUND", `No experience with id '${args.experience_id}'`, { field: "experience_id" });
  const { policy } = ctx;
  const reasons: Reason[] = [];
  const assumptions: string[] = [];
  const flags = new Set(d.safety_flags);

  const target = pickWindow(d, args, ctx, reasons);

  // Budget: the band's floor is the cheapest a trip in that band usually costs.
  const band = budgetBand(d, policy);
  if (args.budget_inr_max !== undefined && isKnown(band) && args.budget_inr_max < BAND_FLOOR_INR[band.value]) {
    reasons.push({
      code: "OVER_BUDGET",
      severity: "blocker",
      message: `Trips like this usually cost ${BAND_LABEL[band.value]} per person, all-in from India; the budget is ₹${args.budget_inr_max.toLocaleString("en-IN")}.`,
      facts: [band.provenance.record_id],
    });
  }

  // Safety flags against what the traveller told us.
  if (args.fitness === "low" && (flags.has("strenuous") || flags.has("age_or_fitness_limit"))) {
    reasons.push({ code: "FITNESS", severity: flags.has("strenuous") ? "blocker" : "warning", message: "This is physically demanding; build fitness first or pick an easier twin.", facts: [`exp_${d.id}#safety_flags`] });
  }
  if (flags.has("extreme_cold")) {
    reasons.push({
      code: "COLD",
      severity: args.cold_tolerance === "low" ? "warning" : "info",
      message: args.cold_tolerance === "low" ? "Expect deep cold, which you said you dislike; consider a warmer option." : "Expect deep cold; pack for it.",
      facts: [`exp_${d.id}#safety_flags`],
    });
  }
  const ages = [...(args.party?.children_ages ?? []), ...(args.party?.senior_ages ?? [])];
  if (flags.has("age_or_fitness_limit")) {
    reasons.push({
      code: "FACT_UNKNOWN",
      severity: "warning",
      message: ages.length ? "There are age or fitness rules for this experience, and they are not loaded yet; confirm with the operator before booking." : "There are age or fitness rules; they are not loaded yet.",
    });
  }

  if (d.scarcity.type === "lottery" || d.scarcity.type === "permit_cap") {
    reasons.push({ code: "BALLOT_OR_PERMIT", severity: "warning", message: `${d.scarcity.note ?? "Entry is limited"}: secure your place before booking travel.`, facts: [`exp_${d.id}#scarcity`] });
  }

  // Visas: each country's lead time becomes a dated deadline before the trip starts.
  const abroad = d.place.countries.filter((c) => c !== passport);
  const timeline: { step: string; by: string; facts?: string[] }[] = [];
  const start = tripStart(d, args, target, policy.now);
  const today = policy.now.toISOString().slice(0, 10);
  const seenGroups = new Set<string>();
  let estimates = false;
  for (const country of visaCountries(d, passport)) {
    const rule = store.visaRule(passport, country);
    if (!rule) {
      reasons.push({ code: "FACT_UNKNOWN", severity: "warning", message: `The visa rule for ${country} is not loaded yet.` });
      continue;
    }
    const key = rule.group ?? rule.country;
    if (seenGroups.has(key)) continue;
    seenGroups.add(key);
    const ref = ruleProvenance(rule, passport).record_id;
    if (rule.confidence === "low") estimates = true;
    if (rule.effort === "none" || rule.lead_time_days === 0) continue;
    const exemption = rule.exemption ? ` (${rule.exemption})` : "";
    if (!start) {
      reasons.push({ code: "VISA_LEAD_TIME", severity: "info", message: `${rule.name}: ${rule.visa_type}; start about ${rule.lead_time_days} days before you travel${exemption}.`, facts: [ref] });
      continue;
    }
    const deadline = addDays(start, -rule.lead_time_days);
    const daysLeft = Math.round((Date.parse(deadline) - Date.parse(today)) / 86_400_000);
    const severity: Severity = daysLeft < 30 ? "warning" : "info";
    reasons.push({
      code: "VISA_LEAD_TIME",
      severity,
      message: daysLeft < 0
        ? `${rule.name}: ${rule.visa_type} usually needs about ${rule.lead_time_days} days, so the safe date has passed. Apply now and keep bookings refundable${exemption}.`
        : `${rule.name}: apply for the ${rule.visa_type} by ${deadline}${exemption}.`,
      facts: [ref],
    });
    timeline.push({ step: `Apply for the ${rule.name} visa (${rule.visa_type})`, by: daysLeft < 0 ? today : deadline, facts: [ref] });
    if ((rule.refusal_rate ?? 0) >= 0.1) {
      reasons.push({ code: "VISA_REFUSAL_RISK", severity: "info", message: `${rule.name} refused about ${Math.round(rule.refusal_rate! * 100)}% of Indian applications recently; keep bookings refundable until the visa is issued.`, facts: [ref] });
    }
  }
  if (d.visa_arranged) assumptions.push(d.visa_arranged.note);
  if (estimates) assumptions.push("Visa lead times are planning estimates that have not been verified yet.");
  timeline.sort((a, b) => a.by.localeCompare(b.by));
  if (args.leave_days !== undefined) assumptions.push("Leave days and holiday bridging are not checked yet.");
  if (args.home_city) assumptions.push(`Departing ${args.home_city}.`);

  const verdict = reasons.some((r) => r.severity === "blocker") ? "not_yet" : reasons.some((r) => r.severity === "warning") ? "maybe" : "yes";
  const party = args.party ?? {};
  const consult = (party.adults ?? 1) === 1 && (party.children_ages?.length ?? 0) > 0;

  store.recordEvent({ type: "feasibility.checked", channel: ctx.channel, record_refs: { experience_id: d.id, verdict, passport, home_city: args.home_city ?? null }, occurred_at: policy.now.toISOString() });

  return {
    experience_id: d.id,
    verdict,
    ...(target ? { target_window: target } : {}),
    reasons,
    timeline,
    budget: {
      band,
      includes_tcs: abroad.length > 0,
      ...(abroad.length ? { note: "Overseas packages carry 2% TCS, included in the band." } : {}),
    },
    assumptions,
    consult_consulate: consult,
    as_of: policy.now.toISOString(),
  };
}
