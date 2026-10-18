// Polite fetching for agents that read outside sources: identifies itself, honours
// robots.txt, caps size and time, and reduces a page to normalized text with a hash.
import { createHash } from "node:crypto";

export const USER_AGENT = "LifelistScout/0.1 (+https://github.com/teestinguseer-commits/agentictravel)";
const MAX_BYTES = 3_000_000;
const TIMEOUT_MS = 20_000;

export interface Page {
  url: string;
  status: number;
  text: string;
  sha256: string;
}

export class FetchError extends Error {
  kind: "robots" | "http" | "network" | "too_large";
  constructor(message: string, kind: FetchError["kind"]) {
    super(message);
    this.kind = kind;
  }
}

const robotsCache = new Map<string, string[]>();

async function disallowed(url: URL): Promise<string[]> {
  if (robotsCache.has(url.origin)) return robotsCache.get(url.origin)!;
  let rules: string[] = [];
  try {
    const res = await fetch(`${url.origin}/robots.txt`, { headers: { "user-agent": USER_AGENT }, signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (res.ok) {
      let applies = false;
      for (const raw of (await res.text()).split(/\r?\n/)) {
        const line = raw.replace(/#.*/, "").trim();
        const [key, ...rest] = line.split(":");
        const value = rest.join(":").trim();
        if (/^user-agent$/i.test(key)) applies = value === "*" || USER_AGENT.toLowerCase().includes(value.toLowerCase());
        else if (applies && /^disallow$/i.test(key) && value) rules.push(value);
      }
    }
  } catch { rules = []; } // no robots.txt reachable: nothing disallowed
  robotsCache.set(url.origin, rules);
  return rules;
}

export function htmlToText(html: string): string {
  return html
    .replace(/<(script|style|noscript|svg|template)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/tr)\b[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim();
}

export async function fetchPage(rawUrl: string): Promise<Page> {
  const url = new URL(rawUrl);
  const blocked = await disallowed(url);
  if (blocked.some((prefix) => url.pathname.startsWith(prefix))) throw new FetchError(`robots.txt disallows ${url.pathname}`, "robots");
  let res: Response;
  try {
    res = await fetch(url, { headers: { "user-agent": USER_AGENT, accept: "text/html,application/xhtml+xml" }, redirect: "follow", signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (err) {
    throw new FetchError(`network error: ${(err as Error).message}`, "network");
  }
  if (!res.ok) throw new FetchError(`HTTP ${res.status}`, "http");
  const body = await res.arrayBuffer();
  if (body.byteLength > MAX_BYTES) throw new FetchError(`page is ${body.byteLength} bytes`, "too_large");
  const text = htmlToText(new TextDecoder().decode(body));
  return { url: rawUrl, status: res.status, text, sha256: createHash("sha256").update(text).digest("hex") };
}
