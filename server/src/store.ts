// The graph store the tools read from. YamlStore serves the git-reviewed definitions
// (development, tests, the preview); a Postgres store implements the same interface
// once the database is deployed.
import { loadGraph } from "../../evals/lib/graph.mjs";

export type Lane = "sky" | "earth" | "wild" | "edge" | "sport" | "endure" | "fest";
export type ScarcityType = "once" | "event" | "lottery" | "permit_cap" | "capacity" | "season" | "natural";
export type VisaEffort = "none" | "low" | "medium" | "high";

export interface ExperienceDef {
  id: string;
  name: string;
  lane: Lane;
  hook: string;
  place: { label: string; countries: string[] };
  season_months: number[];
  window_note?: string;
  fixed_dates?: { start: string; end?: string }[];
  scarcity: { type: ScarcityType; note?: string };
  lead_time_note?: string;
  budget_band: 1 | 2 | 3 | 4;
  segments: ("affluent" | "young" | "nri")[];
  safety_flags: string[];
  pairings?: { with: string; reason: string }[];
  twin_of?: string;
  status: "live" | "paused" | "retired";
  seed?: { visa_in_passport?: { effort: VisaEffort; note?: string }; where_to_book?: string };
  provenance: { source_url: string; checked_at: string; verified_by: string; confidence: "certain" | "high" | "medium" | "low" };
}

export interface ExperienceRequest {
  description: string;
  constraints: Record<string, unknown>;
  channel: string;
  notify: boolean;
  idempotency_key: string;
}

export interface UsageEvent {
  type: string;
  channel: string;
  record_refs: Record<string, unknown>;
  occurred_at: string;
}

export interface GraphStore {
  all(): ExperienceDef[];
  get(id: string): ExperienceDef | undefined;
  pairingsOf(id: string): { id: string; name: string; reason: string }[];
  saveRequest(req: ExperienceRequest): { request_id: string; duplicate: boolean };
  recordEvent(event: UsageEvent): void;
}

export class YamlStore implements GraphStore {
  #defs: Map<string, ExperienceDef>;
  #requests = new Map<string, string>(); // idempotency key -> request id
  readonly requests: (ExperienceRequest & { request_id: string })[] = [];
  readonly events: UsageEvent[] = [];

  constructor(dir = "graph/experiences") {
    this.#defs = loadGraph(dir) as Map<string, ExperienceDef>;
  }

  all() {
    return [...this.#defs.values()];
  }

  get(id: string) {
    return this.#defs.get(id);
  }

  pairingsOf(id: string) {
    const out: { id: string; name: string; reason: string }[] = [];
    for (const d of this.#defs.values()) {
      for (const p of d.pairings ?? []) {
        const other = d.id === id ? p.with : p.with === id ? d.id : null;
        const def = other ? this.#defs.get(other) : undefined;
        if (def && def.status === "live") out.push({ id: def.id, name: def.name, reason: p.reason });
      }
    }
    return out;
  }

  saveRequest(req: ExperienceRequest) {
    const existing = this.#requests.get(req.idempotency_key);
    if (existing) return { request_id: existing, duplicate: true };
    const request_id = `rq_${crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`;
    this.#requests.set(req.idempotency_key, request_id);
    this.requests.push({ ...req, request_id });
    return { request_id, duplicate: false };
  }

  recordEvent(event: UsageEvent) {
    this.events.push(event);
    if (this.events.length > 10_000) this.events.splice(0, this.events.length - 10_000);
  }
}
