import { loadVisaRules } from "./graph.mjs";

// Reference implementation of the read tools over the git-stored graph.
// It answers in the same shape as the tool contracts, with Facts already unwrapped
// (see normalize() in assert.mjs), so golden checks run unchanged against either the
// oracle (today) or the real MCP tools (Phase 1). It is deliberately simple: exact
// filters plus all-words keyword matching, no ranking.

const LANE_NAMES = {
  sky: "Sky & light", earth: "Wild earth", wild: "Wildlife", edge: "Expeditions",
  sport: "Sport", endure: "Endurance", fest: "Festivals",
};
const VISA_ORDER = ["none", "low", "medium", "high"];
let visaRules;

// Visa effort for the whole trip: the hardest rule across the countries entered, skipping
// the home country and any whose documents the booking arranges. Falls back to the
// Atlas seed when a country has no rule.
export function tripVisaEffort(d, passport = "IN") {
  visaRules ??= loadVisaRules(passport);
  const arranged = new Set(d.visa_arranged?.countries ?? []);
  const countries = d.place.countries.filter((c) => c !== passport && !arranged.has(c));
  if (countries.some((c) => !visaRules.has(c))) return d.seed?.visa_in_passport?.effort ?? null;
  return countries.reduce((hardest, c) => {
    const e = visaRules.get(c).effort;
    return VISA_ORDER.indexOf(e) > VISA_ORDER.indexOf(hardest) ? e : hardest;
  }, "none");
}
const STOPWORDS = new Set([
  "a", "an", "the", "in", "of", "to", "for", "with", "and", "or", "at", "on", "i", "my", "me",
  "we", "our", "see", "do", "can", "want", "where", "what", "which", "show", "trip", "trips",
]);

export function getExperience(graph, { id }) {
  const d = graph.get(id);
  if (!d) return { error: { code: "NOT_FOUND", message: `No experience with id '${id}'`, retryable: false } };
  const windows = [];
  if (d.season_months.length) windows.push({ months: d.season_months, note: d.window_note ?? null });
  for (const f of d.fixed_dates ?? [])
    windows.push({ months: [Number(f.start.slice(5, 7))], starts_on: f.start, ends_on: f.end ?? null, note: d.window_note ?? null });
  const pairings = [];
  for (const other of graph.values()) {
    for (const p of other.pairings ?? []) {
      if (other.id === id) pairings.push({ id: p.with, name: graph.get(p.with)?.name, reason: p.reason });
      else if (p.with === id) pairings.push({ id: other.id, name: other.name, reason: p.reason });
    }
  }
  return {
    id: d.id,
    name: d.name,
    lane: d.lane,
    hook: d.hook,
    place: d.place.label,
    countries: d.place.countries,
    season_months: d.season_months,
    scarcity: d.scarcity,
    lead_time: d.lead_time_note ?? null,
    budget_band: d.budget_band,
    windows,
    pairings,
    safety_flags: d.safety_flags,
    status: d.status,
  };
}

const tokens = (q) =>
  q.toLowerCase().split(/[^a-z0-9₹]+/).filter((t) => t && !STOPWORDS.has(t));

const haystack = (d) =>
  [d.name, d.place.label, d.hook, LANE_NAMES[d.lane], d.scarcity.note ?? ""].join(" ").toLowerCase();

export function searchExperiences(graph, args) {
  const { query, month, budget_band, max_visa_effort, lane, segment } = args;
  const words = query ? tokens(query) : [];
  const results = [];
  for (const d of graph.values()) {
    if (d.status !== "live") continue;
    if (month && !d.season_months.includes(month)) continue;
    if (budget_band && !budget_band.includes(d.budget_band)) continue;
    if (lane && !lane.includes(d.lane)) continue;
    if (segment && !d.segments.includes(segment)) continue;
    if (max_visa_effort) {
      const effort = tripVisaEffort(d);
      if (!effort || VISA_ORDER.indexOf(effort) > VISA_ORDER.indexOf(max_visa_effort)) continue;
    }
    if (words.length) {
      const hay = haystack(d);
      if (!words.every((w) => hay.includes(w))) continue;
    }
    results.push({ id: d.id, name: d.name, lane: d.lane });
  }
  results.sort((a, b) => a.id.localeCompare(b.id));
  const match_quality = results.length ? "strong" : "none";
  return {
    results,
    match_quality,
    ...(results.length ? {} : { suggest_request: { tool: "request_experience", arguments: { description: query ?? "" } } }),
  };
}

export const ORACLE_TOOLS = { get_experience: getExperience, search_experiences: searchExperiences };
