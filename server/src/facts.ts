// Facts carry provenance; a fact past its freshness limit, or below the server's
// minimum confidence, comes back as an explicit unknown, never as a stale value.
// See docs/architecture/graph.md (freshness limits) and contracts/common.schema.json.

export type Confidence = "certain" | "high" | "medium" | "low";
export type FreshnessClass = "fixed" | "seasonal" | "rule" | "price" | "availability" | "forecast";
export type UnknownReason = "stale" | "never_checked" | "source_unavailable" | "contradicted" | "unverified";

export interface Provenance {
  source_url: string;
  checked_at: string;
  confidence: Confidence;
  record_id: string;
}

export type Fact<T> =
  | { value: T; provenance: Provenance }
  | { unknown: true; last_checked_at: string | null; reason: UnknownReason };

export interface FactPolicy {
  now: Date;
  minConfidence: Confidence;
}

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

// Mirrors the freshness_limits table in supabase/migrations.
export const MAX_AGE_MS: Record<FreshnessClass, number | null> = {
  fixed: null,
  seasonal: 180 * DAY,
  rule: 30 * DAY,
  price: 24 * HOUR,
  availability: 24 * HOUR,
  forecast: 3 * HOUR,
};

const RANK: Record<Confidence, number> = { low: 0, medium: 1, high: 2, certain: 3 };

export function unknown<T>(reason: UnknownReason, lastCheckedAt: string | null = null): Fact<T> {
  return { unknown: true, last_checked_at: lastCheckedAt, reason };
}

export function fact<T>(
  value: T | null | undefined,
  provenance: Provenance,
  freshness: FreshnessClass,
  policy: FactPolicy,
): Fact<T> {
  if (value === null || value === undefined) return unknown("never_checked", provenance.checked_at);
  const limit = MAX_AGE_MS[freshness];
  if (limit !== null && policy.now.getTime() - Date.parse(provenance.checked_at) > limit) {
    return unknown("stale", provenance.checked_at);
  }
  if (RANK[provenance.confidence] < RANK[policy.minConfidence]) return unknown("unverified", provenance.checked_at);
  return { value, provenance };
}

export const isKnown = <T>(f: Fact<T>): f is { value: T; provenance: Provenance } => "value" in f;

export function policyFromEnv(env: NodeJS.ProcessEnv = process.env): FactPolicy {
  const minConfidence = (env.LIFELIST_MIN_CONFIDENCE ?? "low") as Confidence;
  if (!(minConfidence in RANK)) throw new Error(`LIFELIST_MIN_CONFIDENCE must be one of ${Object.keys(RANK).join(", ")}`);
  return { now: env.LIFELIST_NOW ? new Date(env.LIFELIST_NOW) : new Date(), minConfidence };
}
