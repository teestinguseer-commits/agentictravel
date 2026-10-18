// get_experience: the definition plus every fact with provenance.
import { fact, unknown } from "../facts.ts";
import type { GraphStore } from "../store.ts";
import { budgetBand, provenance, ruleProvenance, toolError, windowsOf, type ToolContext, type ToolError } from "../common.ts";

export interface GetArgs {
  id: string;
  passport?: string;
  include?: ("windows" | "visa" | "offers" | "pairings")[];
}

export function getExperience(store: GraphStore, args: GetArgs, ctx: ToolContext): object | ToolError {
  const d = store.get(args.id);
  if (!d) return toolError("NOT_FOUND", `No experience with id '${args.id}'`);
  const { policy } = ctx;
  const include = new Set(args.include ?? ["windows", "visa", "offers", "pairings"]);
  const passport = args.passport ?? "IN";
  const seedVisa = d.seed?.visa_in_passport;

  const visaEntry = (country: string) => {
    if (d.visa_arranged?.countries.includes(country)) {
      return { country, effort: fact("none", provenance(d, `exp_${d.id}#visa_arranged`), "seasonal", policy), note: d.visa_arranged.note };
    }
    const rule = store.visaRule(passport, country);
    if (!rule) {
      return {
        country,
        effort: unknown("never_checked"),
        ...(passport === "IN" && seedVisa ? { note: `Atlas note for the whole trip: ${seedVisa.note ?? seedVisa.effort}` } : {}),
      };
    }
    const prov = ruleProvenance(rule, passport);
    return {
      country,
      effort: fact(rule.effort, prov, "rule", policy),
      lead_time_days: fact(rule.lead_time_days, prov, "rule", policy),
      note: [rule.visa_type, rule.exemption && `Exemption: ${rule.exemption}`, rule.note].filter(Boolean).join(". "),
    };
  };

  store.recordEvent({ type: "experience.viewed", channel: ctx.channel, record_refs: { experience_id: d.id }, occurred_at: policy.now.toISOString() });

  return {
    id: d.id,
    name: d.name,
    lane: d.lane,
    hook: d.hook,
    place: d.place.label,
    countries: d.place.countries,
    season_months: d.season_months,
    scarcity: { type: d.scarcity.type, ...(d.scarcity.note ? { note: d.scarcity.note } : {}) },
    lead_time: fact(d.lead_time_note, provenance(d, `exp_${d.id}#lead_time_note`), "seasonal", policy),
    budget_band: budgetBand(d, policy),
    ...(include.has("windows") ? { windows: windowsOf(d, policy) } : {}),
    ...(include.has("visa") ? { visa: d.place.countries.filter((c) => c !== passport).map((country) => visaEntry(country)) } : {}),
    ...(include.has("offers") ? { offers: [] } : {}),
    ...(include.has("pairings") ? { pairings: store.pairingsOf(d.id) } : {}),
    ...(d.twin_of && store.get(d.twin_of) ? { twin: { id: d.twin_of, name: store.get(d.twin_of)!.name, why: "A cheaper or easier version of the same moment." } } : {}),
    safety_flags: d.safety_flags,
    status: d.status,
    ...(d.status !== "live" ? { status_reason: d.status === "paused" ? "Paused while its facts are re-checked." : "Retired from Lifelist." } : {}),
    as_of: policy.now.toISOString(),
  };
}
