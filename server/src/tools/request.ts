// request_experience: turns a miss into demand data for the Prospector.
import type { GraphStore } from "../store.ts";
import { toolError, type ToolContext, type ToolError } from "../common.ts";
import { searchExperiences } from "./search.ts";

export interface RequestArgs {
  description: string;
  constraints?: Record<string, unknown>;
  notify_when_added?: boolean;
  idempotency_key: string;
}

// Anonymous callers: at most 20 requests per 10 minutes per channel.
const WINDOW_MS = 10 * 60_000;
const LIMIT = 20;
const recent = new Map<string, number[]>();

export function requestExperience(store: GraphStore, args: RequestArgs, ctx: ToolContext & { signedIn?: boolean }): object | ToolError {
  const now = Date.now();
  const hits = (recent.get(ctx.channel) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= LIMIT) {
    return toolError("RATE_LIMITED", "Too many requests from this client.", { retry_after_seconds: Math.ceil((WINDOW_MS - (now - hits[0])) / 1000) });
  }
  hits.push(now);
  recent.set(ctx.channel, hits);

  const notify = Boolean(args.notify_when_added && ctx.signedIn);
  const { request_id, duplicate } = store.saveRequest({
    description: args.description,
    constraints: args.constraints ?? {},
    channel: ctx.channel,
    notify,
    idempotency_key: args.idempotency_key,
  });
  if (!duplicate) {
    store.recordEvent({ type: "experience.requested", channel: ctx.channel, record_refs: { request_id }, occurred_at: ctx.policy.now.toISOString() });
  }

  const near = searchExperiences(store, { query: args.description, limit: 3 }, { ...ctx, channel: "internal" });
  const similar = "results" in near
    ? (near.results as { id: string; name: string; why: string }[]).map(({ id, name, why }) => ({ id, name, why }))
    : [];

  return {
    request_id,
    status: duplicate ? "duplicate_of_existing" : "received",
    notify,
    similar,
    message: notify
      ? "Thanks. We don't have this yet; we'll tell you when a verified match is added."
      : "Thanks. We don't have this yet; your request helps decide what Lifelist adds next.",
  };
}

export const _resetRateLimits = () => recent.clear();
