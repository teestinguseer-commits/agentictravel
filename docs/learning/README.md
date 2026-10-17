# Lifelist as a teaching hospital

Lifelist is a product, and it is also your residency. A teaching hospital treats real patients while residents rotate through departments: cardiology, surgery, paediatrics. They leave with skills, a case log and references. Lifelist works the same way. You ship a real agent platform to real users, and each phase moves you through a different "department" that the 25 PM roles in [Cracking Lenny's 25 PM Roles](https://claude.ai/artifact/3D2fKmaBEPgvoXgaQHSXLh) screen for: agents and MCP, evals and safety, data platforms, voice, growth, payments, billing, identity, CI.

The rule: **learn by building, not alongside it.** Every rotation is a task Lifelist needs anyway, chosen and scoped so that the work also produces the proof a hiring manager asks for. Side quests exist only where a JD asks for something Lifelist would not otherwise need, and each is capped at one weekend.

## What this gets you, and what it can't

A residency gives you skills and a case log. It does not give you twenty years as an attending physician. Every requirement in the 25 JDs falls into one of these buckets:

| Bucket | What it means | How Lifelist handles it |
| --- | --- | --- |
| **Build** | A skill or proof point the core Lifelist build teaches and demonstrates | Built into a rotation; produces a public proof artifact |
| **Partial** | Lifelist gives real experience, but at a smaller scale or in an adjacent form | Built in; [jd-coverage.md](jd-coverage.md) says exactly how to describe it in an interview |
| **Side quest** | A skill Lifelist touches only lightly, or a domain next door to it | A bounded exercise (one weekend at most), using Lifelist data or code |
| **Standalone** | Learnable, but Lifelist has no honest link to it (factory floors, GPU networking, crypto trading) | A standalone exercise from the field guide, done only if you pursue that role |
| **Hard filter** | Years of experience, managing PMs or leaders, location or work authorisation, a required degree, prior employment at a given scale | **No project can satisfy these.** The coverage map lists them role by role, with offsets that shrink some of them |

So the honest promise is this: **every learnable requirement in all 25 JDs is covered by a rotation, a side quest or a standalone exercise.** For 15 of the 25 roles, everything learnable is covered by Lifelist itself. For 4 more (#6, #13, #14, #18), only a bonus or nice-to-have item needs a reading pack. The hard filters are listed role by role in [jd-coverage.md](jd-coverage.md), so you can see exactly which doors still need time, a title or a visa rather than a project.

## The files

- [rotations.md](rotations.md): the 14 rotations. For each one: what you learn, what you build in Lifelist, the proof artifact, which JDs it serves and when it happens.
- [jd-coverage.md](jd-coverage.md): all 25 roles, every requirement from the field guide, and where it is covered (or why it can't be).
- [proof-portfolio.md](proof-portfolio.md): the case log, meaning the public artifacts you will have at the end, in the order hiring managers will want to see them.

## The agent builder's checklist

"Everything there is to building an agent" breaks down into the layers below. Lifelist exercises every one of them in production, and the rotation that teaches each layer is listed alongside it.

| Layer | What you must be able to do | Rotation |
| --- | --- | --- |
| Tools | Design tool schemas, structured outputs, idempotent writes, error contracts | R1 |
| Protocols | Ship an MCP server (remote HTTP, OAuth), MCP Apps UI, an A2A Agent Card | R1, R7 |
| Context and retrieval | Hybrid search (pgvector plus keyword), grounding every claim in a record, context budgets | R4 |
| Memory and state | Per-user state (the lifelist), durable workflow state, event sourcing | R4, R5 |
| Planning and orchestration | Orchestrator–specialist patterns, routing, fan-out, retries, durable execution | R5 |
| Evals | Golden sets, trajectory evals, LLM-as-judge with calibration, simulated users, regression gates in CI | R2 |
| Safety | Prompt-injection defence (the airlock), red-teaming, precision/recall on a harm classifier, human-in-the-loop, autonomy levels | R3 |
| Identity and permissions | Agent identities, OAuth scopes, least privilege, access reviews, audit logs | R13 |
| Observability | Traces per agent run, cost and latency dashboards, alerting | R5 |
| Economics | Model routing, prompt caching, batch jobs, cost per outcome, inference provider choice | R5 |
| Conversation and voice | Chat and voice agents with escalation, containment vs resolution metrics | R8 |
| Post-training | Fine-tune a small model, before/after evals, human labels and agreement | R9 |
| Agent commerce | Agent checkout with mandates, spend limits, consent receipts, protocol comparison (AP2, x402, ACP, UCP) | R12 |
| Shipping | CI for agent-written code, supply-chain signing, release gates | R6 |

## How it fits your week

The 12–15 hours a week from the build plan stay the same. Rotations are embedded in build work, so most weeks add nothing. Writing the proof artifact adds about 1–2 hours at the end of each rotation. Side quests run only in the slack weeks between gates, never more than one a month.

A field note per rotation (template in [proof-portfolio.md](proof-portfolio.md)) turns each piece of work into an interview story: the decision, the metric it moved, what you would do differently.
