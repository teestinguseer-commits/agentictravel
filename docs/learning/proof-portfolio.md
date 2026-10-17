# Proof portfolio

The case log you leave the residency with. Each artifact is public (a page, a repo folder or a post), comes out of real Lifelist work, and is timed to the field guide's six-month plan: narrative in month 1, applications in waves from month 4.

## Positioning line

The field guide's line was: *"I build configurable platforms where people and AI agents work on enterprise records safely."* Lifelist lets you extend it with shipped proof:

> **I build agent platforms where people and AI agents work together safely, and I have shipped one: 19 agents running a live travel product around the clock, with evals, guardrails and money moving through it.**

## The artifacts, in order

| When | Artifact | Rotation | Roles it serves first |
| --- | --- | --- | --- |
| Dec 2026 | Public MCP server, listed in the Claude and ChatGPT directories, with API docs | R1 | #14, #1, #11, #13, #21 |
| Dec 2026 | "Tool design decisions" memo | R1 | #2, #24, #21 |
| Dec 2026 | Eval report: per-agent pass rates, one regression caught, release criteria | R2 | #5, #7, #13, #14 |
| Jan 2027 | Harm eval suite with precision/recall table and threshold memo | R3 | #5, #1 |
| Jan 2027 | Data architecture page: schema, dbt lineage, "where data breaks" map | R4 | #19, #4, #18 |
| Jan 2027 | "CI for agents" brief from 8 weeks of your own CI logs | R6 | #14 |
| Feb 2027 | Cost per moment booked: routing, caching and batching before/after | R5 | #9, #14 |
| Feb 2027 | Partner integration scorecard on three partners, plus one demand brief | R7 | #11, #4 |
| Mar 2027 | Voice and chat concierge with simulated-conversation evals and the escalation design | R8 | #13, #25 |
| Mar 2027 | Nudge experiment readout with SQL, plus the lifelist growth model | R10 | #25, #18, #23 |
| Mar 2027 | Billing edge-case memo from the metered Graph API in Stripe test mode | R11 | #24, #6 |
| Mar 2027 | Agentic payments protocol comparison: AP2, x402, UPI | R12 | #21, #2 |
| Apr 2027 | Agent demotion spec ("policy set once, enforced everywhere") and the Slack ops agent permissions memo | R13 | #12, #1 |
| Apr 2027 | Fine-tune with before/after eval and the "what is uncertain" narrative | R9 | #7, #8, #19 |
| Monthly | Investor-style update, decision log, ADRs | R14 | All |
| Phase 3 | Live agent checkout with mandate; quote-to-cash map; principal vs agent memo | R11, R12 | #21, #24, #6, #2 |

**Application waves.** Tier A roles (Sierra, Anthropic BizTech, ClickHouse, Airwallex AI Growth, Databricks, Rippling) have their key proofs by March 2027, so the first wave can go out then. Tier B roles need the money artifacts (March, then Phase 3).

## Field note template

Write one at the end of each rotation (30–60 minutes). It becomes an interview story.

```markdown
# Field note: R<n> <rotation name>

**Date:** · **Rotation:** · **Roles this serves:** #

## The situation
One paragraph: what Lifelist needed, and why it was hard.

## The decision
What you chose, what you rejected, and why. Link the ADR or memo.

## The outcome
The metric that moved, by how much, and how you know it was this decision ("X moved by Y because of Z").

## What I would do differently

## Vocabulary I can now use with confidence
Five to ten terms from the JDs, each with one sentence on how Lifelist used it.

## Proof
Link to the public artifact.
```
