# ADR 0005: Showing unverified seeds outside production

**Status:** Accepted · **Date:** 18 Oct 2026

## Context

Every fact in the graph today is an Atlas seed with confidence `low`. The plan's rule is that nothing unverified reaches travellers. Applied literally, the MCP server would answer every question with "unknown", and nothing could be built or tested until the Verifier exists.

## Decision

The server takes a minimum confidence from `LIFELIST_MIN_CONFIDENCE` (default `low`). Facts below it come back as `{ unknown: true, reason: "unverified" }`, alongside the existing `stale` and `never_checked`.

| Environment | Minimum confidence | Why |
| --- | --- | --- |
| Development, tests, the preview page | `low` | Build and test against the seeds, with confidence shown on every fact |
| Public MCP server and web app | `medium` | Only Verifier-confirmed facts reach travellers and their agents |

Freshness limits always apply, whatever the minimum confidence.

## Consequences

- The public launch needs the Verifier (or your review) to raise facts to `medium` first; until then a production server says "unverified" honestly.
- CI runs the golden set with a pinned clock so results are deterministic, and a second, warning-only run at today's date shows when seeds go stale.
