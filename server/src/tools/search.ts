// search_experiences: filters plus weighted keyword matching. Reports match_quality
// honestly and turns weak or empty searches into a prefilled request_experience.
import { isKnown } from "../facts.ts";
import type { ExperienceDef, GraphStore } from "../store.ts";
import {
  BAND_LABEL, MONTH_NAMES, RARITY_ORDER, SUPPORTED_PASSPORTS, VISA_ORDER, budgetBand, nextWindow, toolError,
  tripVisaEffort, type ToolContext, type ToolError,
} from "../common.ts";

export interface SearchArgs {
  query?: string;
  month?: number;
  budget_band?: number[];
  passport?: string;
  max_visa_effort?: "none" | "low" | "medium" | "high";
  lane?: string[];
  segment?: string;
  limit?: number;
  cursor?: string;
}

const LANE_NAMES: Record<string, string> = {
  sky: "Sky & light", earth: "Wild earth", wild: "Wildlife", edge: "Expeditions", sport: "Sport", endure: "Endurance", fest: "Festivals",
};
const STOPWORDS = new Set([
  "a", "an", "the", "in", "of", "to", "for", "with", "and", "or", "at", "on", "i", "my", "me", "we", "our", "see", "do", "can",
  "want", "where", "what", "which", "show", "trip", "trips",
]);
const tokenize = (q: string) => q.toLowerCase().split(/[^a-z0-9₹]+/).filter((t) => t && !STOPWORDS.has(t));

interface Scored { d: ExperienceDef; matched: number; score: number }

function scoreText(d: ExperienceDef, words: string[]): Scored {
  const fields: [string, number][] = [
    [d.name.toLowerCase(), 3],
    [d.place.label.toLowerCase(), 2],
    [[d.hook, LANE_NAMES[d.lane], d.scarcity.note ?? ""].join(" ").toLowerCase(), 1],
  ];
  let matched = 0;
  let weight = 0;
  for (const w of words) {
    const best = Math.max(0, ...fields.filter(([text]) => text.includes(w)).map(([, wt]) => wt));
    if (best) { matched++; weight += best; }
  }
  return { d, matched, score: words.length ? Math.min(1, weight / (3 * words.length)) : 1 };
}

const byRarityThenName = (a: ExperienceDef, b: ExperienceDef) =>
  RARITY_ORDER.indexOf(a.scarcity.type) - RARITY_ORDER.indexOf(b.scarcity.type) || a.name.localeCompare(b.name);

function why(d: ExperienceDef, args: SearchArgs, words: string[]): string {
  const parts: string[] = [];
  if (words.length) parts.push(`matches "${words.join(" ")}"`);
  if (args.month) parts.push(`possible in ${MONTH_NAMES[args.month]}`);
  if (args.budget_band) parts.push(`budget ${BAND_LABEL[d.budget_band]}`);
  parts.push(d.scarcity.note ? d.scarcity.note.toLowerCase() : d.scarcity.type.replace("_", " "));
  const text = parts.join("; ");
  return (text.charAt(0).toUpperCase() + text.slice(1) + ".").slice(0, 280);
}

const encodeCursor = (offset: number) => Buffer.from(JSON.stringify({ o: offset })).toString("base64url");
function decodeCursor(cursor?: string): number | null {
  if (!cursor) return 0;
  try {
    const o = JSON.parse(Buffer.from(cursor, "base64url").toString()).o;
    return Number.isInteger(o) && o >= 0 ? o : null;
  } catch { return null; }
}

export function searchExperiences(store: GraphStore, args: SearchArgs, ctx: ToolContext): object | ToolError {
  const passport = args.passport ?? "IN";
  if (args.max_visa_effort && !SUPPORTED_PASSPORTS.has(passport))
    return toolError("UNSUPPORTED_PASSPORT", `Visa filtering covers Indian passports only (IN), not ${passport}.`, { field: "passport" });
  const offset = decodeCursor(args.cursor);
  if (offset === null) return toolError("INVALID_INPUT", "cursor is not one this server issued", { field: "cursor" });
  const limit = args.limit ?? 10;
  const { policy } = ctx;

  const filtered = store.all().filter((d) => {
    if (d.status !== "live") return false;
    if (args.month && !d.season_months.includes(args.month)) return false;
    if (args.budget_band && !args.budget_band.includes(d.budget_band)) return false;
    if (args.lane && !args.lane.includes(d.lane)) return false;
    if (args.segment && !d.segments.includes(args.segment as never)) return false;
    if (args.max_visa_effort) {
      const v = tripVisaEffort(d, passport, policy, store);
      // An unknown visa rule can't be promised to fit the filter.
      if (!isKnown(v) || VISA_ORDER.indexOf(v.value) > VISA_ORDER.indexOf(args.max_visa_effort)) return false;
    }
    return true;
  });

  const words = args.query ? tokenize(args.query) : [];
  let ranked: Scored[];
  let match_quality: "strong" | "weak" | "none";
  if (!words.length) {
    ranked = filtered.sort(byRarityThenName).map((d) => ({ d, matched: 0, score: 1 }));
    match_quality = ranked.length ? "strong" : "none";
  } else {
    const scored = filtered.map((d) => scoreText(d, words));
    const full = scored.filter((s) => s.matched === words.length);
    if (full.length) {
      ranked = full.sort((a, b) => b.score - a.score || byRarityThenName(a.d, b.d));
      match_quality = "strong";
    } else {
      // Partial matches only count on substantive words, and are labelled weak.
      const strongWords = words.filter((w) => w.length >= 4);
      ranked = filtered.map((d) => scoreText(d, strongWords)).filter((s) => s.matched > 0)
        .sort((a, b) => b.score - a.score || byRarityThenName(a.d, b.d)).slice(0, 5)
        .map((s) => ({ ...s, score: Math.min(s.score, 0.49) }));
      match_quality = ranked.length ? "weak" : "none";
    }
  }

  const page = ranked.slice(offset, offset + limit);
  const results = page.map(({ d, score }) => ({
    id: d.id,
    name: d.name,
    lane: d.lane,
    place: d.place.label,
    season_months: d.season_months,
    scarcity: d.scarcity.type,
    budget_band: budgetBand(d, policy),
    visa_effort: tripVisaEffort(d, passport, policy, store),
    next_window: nextWindow(d, policy),
    why: why(d, args, words),
    score: Math.round(score * 100) / 100,
  }));

  for (const r of results) store.recordEvent({ type: "experience.listed", channel: ctx.channel, record_refs: { experience_id: r.id }, occurred_at: policy.now.toISOString() });
  store.recordEvent({
    type: match_quality === "strong" ? "search.performed" : "search.zero_result",
    channel: ctx.channel,
    record_refs: { args, match_quality, results: ranked.length },
    occurred_at: policy.now.toISOString(),
  });

  const description = args.query ?? describeFilters(args);
  return {
    results,
    match_quality,
    ...(match_quality !== "strong" ? {
      suggest_request: {
        tool: "request_experience",
        arguments: {
          description,
          constraints: {
            ...(args.month ? { month: args.month } : {}),
            ...(args.budget_band ? { budget_band: Math.max(...args.budget_band) } : {}),
            passport,
            ...(args.lane?.length === 1 ? { lane: args.lane[0] } : {}),
          },
        },
      },
    } : {}),
    next_cursor: offset + limit < ranked.length ? encodeCursor(offset + limit) : null,
    as_of: policy.now.toISOString(),
  };
}

function describeFilters(a: SearchArgs): string {
  const bits = ["A rare experience"];
  if (a.lane) bits.push(`in ${a.lane.map((l) => LANE_NAMES[l]).join(" or ")}`);
  if (a.month) bits.push(`in ${MONTH_NAMES[a.month]}`);
  if (a.budget_band) bits.push(`for ${BAND_LABEL[Math.max(...a.budget_band)]}`);
  if (a.max_visa_effort) bits.push(`with ${a.max_visa_effort === "none" ? "no visa" : `${a.max_visa_effort} visa effort or less`}`);
  return bits.join(" ");
}
