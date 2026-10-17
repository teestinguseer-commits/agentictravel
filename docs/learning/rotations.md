# Rotations

Fourteen rotations, each one a part of the Lifelist build that doubles as training for specific roles. Role numbers (#1–#25) refer to the [field guide](https://claude.ai/artifact/3D2fKmaBEPgvoXgaQHSXLh) and to [jd-coverage.md](jd-coverage.md).

| # | Rotation | When | Main roles served |
| --- | --- | --- | --- |
| R1 | Tools, MCP and agent interfaces | Phase 1 (Nov–Dec 2026) | #1, #14, #11, #13, #21 |
| R2 | Evals | Phase 0–1 (Oct 2026 – Jan 2027) | #5, #7, #13, #14 |
| R3 | Safety and guardrails | Phase 1 (Dec 2026 – Jan 2027) | #5, #1, #13 |
| R4 | Data platform and retrieval | Phase 1 (Nov 2026 – Jan 2027) | #19, #4, #18, #11 |
| R5 | Orchestration, observability and inference economics | Phase 1–2 (Jan – Feb 2027) | #9, #14, #1 |
| R6 | CI for agents and the software supply chain | Phase 1, continuous | #14 |
| R7 | Integrations and partner ecosystem | Phase 1–2 | #11, #4, #2, #17 |
| R8 | Conversational and voice agents | Phase 2 (Feb – Mar 2027) | #13, #25 |
| R9 | Post-training and human data | Phase 2 (Mar – Apr 2027) | #7, #8, #19 |
| R10 | Growth and experimentation | Phase 2 (Feb – Apr 2027) | #25, #18, #3, #23, #10 |
| R11 | Money I: billing, quote-to-cash and costing | Phase 2 sandbox (Mar 2027); Phase 3 live | #24, #6, #22 |
| R12 | Money II: marketplaces and agentic payments | Phase 2 memo; Phase 3 live | #2, #21, #10 |
| R13 | Agent identity and governance | Phase 2 (Feb – Apr 2027) | #12, #1 |
| R14 | Product leadership craft | Continuous | All |

Each rotation lists: **Learn** (concepts), **Build** (the Lifelist work), **Proof** (the public artifact), **Side quests** (only where a JD asks for more than Lifelist needs).

---

## R1 · Tools, MCP and agent interfaces

**Learn.** Tool schema design (names, inputs, error contracts, pagination), structured outputs, idempotency keys, API versioning and webhooks, MCP transports and OAuth, MCP Apps, A2A Agent Cards. Read Stripe's API reference as a design text.

**Build.** The public tool layer in [mcp-tools.md](../architecture/mcp-tools.md): `search_experiences`, `get_experience`, `check_feasibility`, `request_experience`, then the write tools behind OAuth. Remote MCP server with an MCP App storyboard. Submit to the Claude and ChatGPT app directories (a real certification and listing process).

**Proof.** A public MCP server listed in the directories, with versioned API docs and a two-page "tool design decisions" memo (resource modelling, idempotency, error contract, what you deliberately left out).

**Serves.** #1 (MCP servers, agent-as-participant), #14 (top requirement: you built agent tools and MCP servers), #11 (certified, listed and live integrations), #13 (agent tooling), #21 (reviewing API contracts), #2 (API design craft).

## R2 · Evals

**Learn.** Golden sets, regression suites, trajectory evals for multi-step agents, LLM-as-judge and how to calibrate it against human labels, simulated users, release criteria, eval-driven development.

**Build.** The 100-question golden set (Phase 0), a per-agent eval for each of the 19 agents (each spec names one), eval gates in CI, nightly production sampling. A simulated-traveller harness: synthetic personas (passport, city, budget) that run multi-turn planning sessions through the Orchestrator.

**Proof.** A public eval report: pass rates per agent, one regression you caught before launch and how, and the release criteria you set.

**Serves.** #5 (writes evals), #7 (evals as a product, release criteria), #13 (agent evals, simulated conversations), #14 (eval systems), #10 (online evaluation, drift).

## R3 · Safety and guardrails

**Learn.** Prompt injection and the dual-LLM "airlock" pattern, red-teaming, classifier thresholds and precision/recall trade-offs, enforcement ladders, layered defences, human-in-the-loop design, measuring blind spots.

**Build.** The airlock (readers propose, writers never see raw outside text), the [autonomy ladder](../decisions/0002-autonomy-ladder.md), a misuse classifier for MCP traffic (scraping, injection attempts, fraudulent booking patterns), and an **unsafe-advice eval**: 100 prompts where the right answer is to refuse or escalate (e.g. "Son Doong with my 75-year-old father", "Antarctica crossing with no cold-weather experience").

**Proof.** The harm eval suite with a precision/recall table and a memo on where you set the threshold and why (the field guide's exact proof for #5), plus a blind-spot metrics page.

**Serves.** #5 (all requirements that are learnable), #1 (slowing down for safety, privacy or data reasons), #13 (guardrails, escalation), #3 (trust signals).

## R4 · Data platform and retrieval

**Learn.** Relational modelling for a graph, pgvector and hybrid search, the event outbox pattern, master data and deduplication, warehouse modelling (dbt, star schemas, slowly changing dimensions), lakehouse formats at a concept level, data governance (classification, masking, retention, RBAC).

**Build.** The [Experience Graph](../architecture/graph.md) in Postgres plus the git-reviewed definitions ([ADR 0004](../decisions/0004-graph-storage-split.md)), the event bus, Pulse's aggregation jobs, a dbt project over the events table (star schema: fact events, dimensions for experience, channel and client), data classification and DPDP retention rules.

**Proof.** A data architecture page with the schema, the dbt lineage graph, and a "where data breaks between systems" map (partner feeds → graph → web/MCP → partner postbacks), marking the metric each break costs.

**Side quests.**
- **SQ-A Databricks Free Edition** (one weekend): load a Demand export, build a notebook and a Genie space, log every friction point, rank fixes by the activation metric each moves. Serves #18 directly.
- **SQ-B ClickHouse for analytics** (one weekend): mirror the events table into ClickHouse and compare query latency against Postgres for the Night Manager's dashboards. Serves #11 (OLAP basics) and #19.

**Serves.** #19 (managed data services, governance, API-first platform), #4 (warehouse modelling, cross-system ownership), #18, #11, #1 (data governance).

## R5 · Orchestration, observability and inference economics

**Learn.** Orchestrator–specialist patterns, durable execution, retries and compensation, tracing (OpenTelemetry), cost per outcome, model routing, prompt caching, batch inference, tokens per second, cold starts, reserved vs on-demand pricing.

**Build.** The agent mesh on Inngest or Trigger.dev, per-agent traces, the Night Manager's dashboards, the budget system (daily caps, midday throttle, reserve), model tiers and nightly batch runs.

**Proof.** A "cost per moment booked" analysis: spend by agent and tier before and after routing, caching and batching, with the decision you made.

**Side quests.**
- **SQ-C Inference provider teardown** (one weekend): price Lifelist's actual nightly workload on three managed inference providers and recommend one. This is the field guide's proof for #9.
- **SQ-D Local inference** (one weekend): run a quantized small model for Trend Scout extraction on a laptop GPU, compare quality, latency and cost with the API, and write a one-page brief on which local-AI workloads justify a discrete GPU. A partial proof for #17.

**Serves.** #9, #14, #1, #17 (partial).

## R6 · CI for agents and the software supply chain

**Learn.** Build caching, test sharding, ephemeral runners, flaky-test economics, hermetic builds (Bazel concepts), SBOMs, Sigstore signing, SLSA levels.

**Build.** Lifelist is built by coding agents, so its CI *is* CI for agents. Instrument every CI run (wait time, failure cause, retries, cost) from day one. Ship the MCP server as a signed container image with an SBOM and SLSA provenance.

**Proof.** After 8 weeks, a "CI for agents" product brief written from your own logs: where agent loops wait, which failures are flakes vs real, what an agent-native CI would change. This is the field guide's proof for #14, made with real data.

**Serves.** #14 (CI from the inside, supply-chain security, decisions in documents).

## R7 · Integrations and partner ecosystem

**Learn.** Partner tiers and certification criteria, connector SLAs and versioning contracts, deprecation policy, co-marketing, marketplace listings, ecosystem economics, building through partners whose brand the customer sees.

**Build.** Partner Ops: Viator and the Tier A–D partners, link health, affiliate reconciliation, postbacks; the A2A Agent Card; MCP directory listings.

**Proof.** A partner integration scorecard (certification checklist plus health metrics) applied to three real Lifelist partners, and one partner demand brief.

**Serves.** #11 (all learnable requirements), #4 (the seams between systems), #2 (bets ahead of demand), #17 (partner and ecosystem lifecycle, partial).

## R8 · Conversational and voice agents

**Learn.** Dialogue design for service, escalation to humans, policy grounding, multilingual voice (Hindi, English, Hinglish), containment vs resolution quality, latency budgets for voice, accessibility (WCAG 2.2 AA, which is what US Section 508 points to).

**Build.** The [Concierge Desk](../agents/concierge-desk.md) on WhatsApp text **and voice notes**, then a phone line for one flow: "Is my aurora trip still on?" A simulated-conversation eval set (task completion, escalation rate, latency). An accessibility pass on the web app.

**Proof.** A working voice and chat agent with its eval results and a one-page "how this escalates to a human" design. This is the field guide's proof for #13, on your home turf (CCaaS, voice, bots).

**Side quest.**
- **SQ-E Accessibility audit** (one weekend): a WCAG 2.2 AA audit of the Atlas and storyboard, with fixes shipped.

**Serves.** #13 (the best-fit role), #25 (AI features from ideation to optimisation), #1.

## R9 · Post-training and human data

**Learn.** SFT, LoRA, preference data, reward models, RL with verifiable rewards, before/after evals, human labelling, gold sets, inter-annotator agreement, dataset versioning.

**Build.** Your review queue already produces human labels: every approve or reject decision on a Candidate. Version them as a dataset. Recruit a second reviewer for 200 items to measure inter-annotator agreement. Fine-tune a small open model for one narrow Lifelist task (Signal extraction or zero-result query classification) and compare it with prompting a hosted model on quality, cost and latency.

**Proof.** A fine-tune with a before/after eval and a one-page "what I learned, what is uncertain, what decision is next" narrative. This is the field guide's proof for #7, with a real production reason to exist.

**Side quest.**
- **SQ-F RL with verifiable rewards** (one weekend): Composer itineraries have checkable constraints (anchor placement, buffer days, visa timing, budget), so they make a natural RL environment. Train a small model against that checker (Tinker or an open-source trainer) and report what improved.

**Serves.** #7, #8 (human-data quality, operator tooling, as a contributor), #19 (data pipelines for fine-tuning).

## R10 · Growth and experimentation

**Learn.** Activation and aha moments, growth loops, retention curves, nudges and lifecycle automation, holdouts, guardrail metrics, novelty effects, sample sizing, variance reduction (CUPED, concept level), bandits, metric trees, SQL and a product analytics tool.

**Build.** The [Experimenter](../agents/experimenter.md) (bandits for new experiences), [Nudge](../agents/nudge.md) (lifecycle messages with holdouts), the free Atlas as a learning funnel, PostHog funnels across web, MCP and WhatsApp, a metric tree from "moments booked" down to agent actions.

**Proof.** One cross-sell or nudge experiment, from trigger to holdout to readout, with the SQL. Plus a growth model for the lifelist as a "saved places" loop (the field guide's Maps proof, on your own product).

**Side quests.**
- **SQ-G Lifelist Plus** (memo plus a fake-door test): a paid tier (unlimited watchers, priority ballot alerts) to learn subscription economics: free-to-paid conversion, churn, win-back.
- **SQ-H "Done" memory card** (one weekend): when someone marks an experience Done, they can upload a photo and get a generated memory card. Teaches vision models, generative media failure modes, and consent UX for personal photos. Serves #3.
- **SQ-I Aurora odds calibration** (one weekend): score the sky lane's probabilistic windows with a Brier score, and write how you pick the "source of truth" that resolves a forecast. Teaches resolution design and manipulation resistance (a partial proof for #20).
- **SQ-O Sponsored placements memo** (one evening): how Lifelist could sell labelled placements to operators without breaking "no commission in ranking", with the attribution model from a view to a booking. Teaches ad and commercial revenue models (#23) and shows the trust trade-off explicitly.

**Serves.** #25, #18, #3, #23, #10 (experimentation on revenue metrics), #20 (partial).

## R11 · Money I: billing, quote-to-cash and costing

**Learn.** Billing models (flat, seat, tiered, usage, credits, prepaid commits), the subscription lifecycle (proration, trials, dunning), quote-to-cash end to end, revenue recognition (IFRS 15, Ind AS 115 in India, ASC 606 in the US), **principal vs agent** accounting, GST and TCS invoicing, landed cost, ledgers and reconciliation.

**Build.**
- **Sandbox (Phase 2):** a B2B **Graph API** for partners and planners (the plan's later B2B track), metered per call and billed with usage-based pricing in Stripe's test mode. Write the "five edge cases that broke my model" memo.
- **Live (Phase 3):** Path 3 quote-to-cash: itinerary quote → customer contract → supplier holds → invoice with GST and 2% TCS → voucher (entitlement) → refunds. The **landed cost** of each package (supplier cost, FX, payment fees, GST, TCS, insurance) as journal entries in a double-entry ledger.

**Proof.** A quote-to-cash map of Lifelist Path 3, and a memo on why Path 1 commission is recognised **net** (agent) while Path 3 packages are recognised **gross** (principal). This is the cleanest revenue-recognition story a PM can tell.

**Serves.** #24 (all learnable requirements), #6 (quote-to-cash, revenue recognition, usage billing), #22 (landed cost, cost flows, reconciliation; partial, as there is no Oracle Fusion or manufacturing accounting).

## R12 · Money II: marketplaces and agentic payments

**Learn.** Marketplace money flows (platform vs connected account, destination charges, transfers, payouts, application fees), KYB onboarding and capability gating, the card lifecycle (auth, capture, clearing, settlement, chargebacks), ISO 8583 vs ISO 20022, UPI Reserve Pay and mandates, agent identity and spend control, and the protocols: AP2, x402, ACP, UCP.

**Build.**
- **Phase 2 memo:** compare AP2, x402 and UPI agentic payments for one Lifelist case, "the user's AI books an eclipse deposit". Cover the trust model, spend limits, consent receipt, and the fraud and identity gaps each leaves open.
- **Phase 3 live:** agent checkout with a UPI mandate and human confirmation; operator payouts with split payments (Razorpay Route in production); operator KYB.

**Side quest.**
- **SQ-J Stripe Connect toy** (one afternoon to one weekend): model Lifelist as a two-sided marketplace in Stripe test mode (operators as connected accounts, Lifelist taking an application fee), then write "what I would change in the account model". This is the field guide's proof for #2.

**Proof.** The protocol comparison memo, a working agent checkout with mandate and confirmation, and the Connect memo.

**Serves.** #21 (agentic-commerce protocols, agent spend control, API contracts), #2 (marketplace flows, KYB, productising bespoke solutions), #10 (payment success and fraud scoring at small scale, via a sizing memo).

## R13 · Agent identity and governance

**Learn.** SSO (SAML, OIDC), SCIM provisioning, RBAC vs ABAC, access reviews, joiner–mover–leaver flows, AI governance (shadow AI, agent identities, policy enforcement), audit trails.

**Build.** 19 agents, each with its own identity and scopes: an **agent lifecycle** (provision, rotate keys, change scopes on promotion, retire) mirroring joiner–mover–leaver. Monthly access reviews generated by the Night Manager. The review queue and digest delivered into Slack through MCP, making Lifelist's ops an internal agent platform where people and agents work side by side.

**Proof.** A "policy set once, enforced everywhere" spec for one lifecycle event: **demoting an agent** after a critical error, tracing what changes in identity, scopes, queues and audit. Plus a one-page permissions memo for the Slack-connected ops agent (the field guide's proof for #1).

**Serves.** #12 (identity, AI governance, systems thinking), #1 (agent identities, permission scopes, human-in-the-loop handoffs, audit trails, Slack and MCP).

## R14 · Product leadership craft

**Learn.** Decision documents, narratives, metric trees, operating rituals, attribution of outcomes, writing for executives, leading through others.

**Build.** It is already happening: the ADRs in [decisions/](../decisions/) are decision docs; the build plan is a strategy narrative; the daily digest is an operating ritual. Add a monthly one-page **investor-style update** (metrics, decisions, what would change your mind) and keep a decision log.

**Proof.** Two published decision memos (one AI, one platform), a monthly update archive, and three attributed outcome stories in the form "X moved by Y because of decision Z".

**Leadership proxy.** Directing coding agents, a security contractor and (in Phase 3) an ops partner is real leadership of delivery. It is **not** managing PMs, and the coverage map treats it honestly as a partial offset only.

**Serves.** Every role. These are the generic requirements: writing, cross-functional work, measured outcomes, zero-to-one, velocity with craft.

---

## Standalone side quests (outside Lifelist)

Some JD domains have no honest link to Lifelist. These exercises come from the field guide's "proof to build" lines. Do them only if you decide to pursue that role. They let you speak the vocabulary; they do not make you a specialist.

| Code | Exercise | Role | Effort |
| --- | --- | --- | --- |
| SQ-K | Spend a day on a real production line (an auto-parts or electronics plant near NCR), then write a shop-floor app spec from what you saw | #15 | One day plus a weekend |
| SQ-L | Reading pack on GPU cluster networking, then a decision doc: InfiniBand vs RoCE for a 10,000-GPU cluster | #16, #6 bonus | Two weekends; recommended only for a deliberate infra pivot |
| SQ-M | Compare one Polymarket crypto market format with Kalshi's equivalent: order book, fees, resolution source, VWAP/TWAP window. Add an experiment proposal | #20 | One weekend |
| SQ-N | Trace one purchased part from receipt to finished-goods cost, with every journal entry and where an integration error would distort it | #22 | One weekend |
| SQ-P | Accept a stablecoin payment on a public testnet, and write how settlement finality and on/off-ramps would work for an NRI paying a Path 3 deposit (no live crypto: Indian rules restrict it) | #21 | One weekend |
| SQ-R | Domain reading packs, one evening each: US govtech (FedRAMP levels, procurement vehicles), the PC OEM cycle, defence acquisition basics, Kubernetes fundamentals | #13, #17, #4, #14 | Evenings |
