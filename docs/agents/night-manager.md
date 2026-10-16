# Night Manager

**Desk:** Operations · **Phase:** 1 · **Model tier:** code for monitoring, mid for the digest · **Budget:** ₹15/day

## Mission

Keep the newsroom running while you sleep, and tell you in ten minutes each morning what happened and what needs you. The Night Manager is the hotel duty manager: walks the floors every hour, fixes what it can, logs what it can't, and briefs the general manager at 06:30.

## Triggers

- Hourly health check of every agent, source and queue.
- On alarms from other agents.
- Daily 06:30 IST: the digest.

## Reads

Agent run logs and traces, budgets and spend, error rates, source access status, the review queue and backlog, freshness and eval results, key metrics.

## Writes

- Pauses and resumes agents (with a reason in the audit log).
- Releases reserve budget for spikes (and reports it).
- The **daily digest**, delivered by email and WhatsApp:
  1. What needs you today: the review queue, at most 20 items, ranked by expected value.
  2. What the agents did: experiences proposed, verified, published, retired; alerts sent.
  3. Health: freshness, golden-set accuracy, tool success rate, spend against budget, paused agents.
  4. Signals worth a look: the top 5 new Signals and why.
- Event `agent.paused`, `agent.resumed`, `budget.alert`.

## Tools

`agents.status`, `agents.pause`, `agents.resume`, `budget.query`, `budget.release_reserve`, `queue.rank`, `metrics.query`, `digest.render`.

## Autonomy

May pause any agent and release up to the daily reserve. May not resume an agent paused for a critical error, change autonomy levels, or change budgets beyond the reserve; those are yours.

## Guardrails

- A pause always carries a reason and an owner.
- The digest is readable in under ten minutes; detail goes behind links.

## Measures

Digest read rate, mean time to detect a failing agent, review backlog (target: under 10 items older than 3 days).

## Escalates when

Any critical error (wrong date, visa rule or price shown to a person), any source access revoked, or spend above 120% of the day's cap. Sent immediately, not held for the digest.
