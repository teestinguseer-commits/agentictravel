# Lifelist Build Plan, v2

16 Oct 2026 · @Amandeep · supersedes [v1](archive/build-plan-v1-2026-10-16.md)

## What changed from v1

v1 described a **library**: Scouts catalogue supply, a Verifier checks facts, a Curator answers whoever asks. Every agent waited for a request or watched suppliers. v2 turns Lifelist into a **newsroom** that runs around the clock: reporters on beats, a desk that reads what the audience wants, fact-checkers, an editor-in-chief (you) and a morning edition.

| # | Change | Why |
| --- | --- | --- |
| 1 | Agents run the platform: discovery, curation and operations, organised into five desks ([agents/README.md](agents/README.md)) | Your hours go to judgement, not upkeep |
| 2 | A **demand loop**: Signal → Candidate → Verify → Expose → Learn | New experiences come from what people search, save, book, and what the world is talking about |
| 3 | **Outside signals** are a first-class input: Google Trends, Meta (Instagram + Meta AI), YouTube, Wikipedia pageviews, Reddit, news and event calendars ([ADR 0003](decisions/0003-outside-signals-and-meta.md)) | Solves cold start before you have users, and catches trends earlier |
| 4 | Three new graph records: **Signal**, **Candidate**, **Demand** ([architecture/graph.md](architecture/graph.md)) | Intent becomes data the agents can reason over |
| 5 | Four new MCP tools: `request_experience`, `whats_new`, `report_outcome`, `subscribe` ([architecture/mcp-tools.md](architecture/mcp-tools.md)) | Agents bring you demand and booking outcomes, and get a reason to come back |
| 6 | An **autonomy ladder** (L0–L3) with promotion and demotion rules, and a capped daily review queue ([ADR 0002](decisions/0002-autonomy-ladder.md)) | Agents propose more than one person can review; trust is earned per agent, per category |
| 7 | **Event-driven backbone** and **freshness limits per fact type** instead of a blanket 7 days ([architecture/events.md](architecture/events.md)) | Around-the-clock work without polling every user; eclipse dates don't expire, prices do |
| 8 | **Rarity floor** and no commission in ranking | A "what people book" engine drifts to Bali and Dubai; your brand is rare moments |
| 9 | **Airlock** between agents that read outside content and agents that write | Outside signals widen the prompt-injection surface |
| 10 | Per-agent **budgets**, model tiers, nightly batch runs and a kill switch | 24/7 agents can quietly blow the ₹10–25k a month budget |
| 11 | Fix for **Path 1 booking blindness**: partner postbacks, self-reported Booked/Done, `report_outcome` | You can't learn from bookings you can't see |
| 12 | The web app is **just another client** of the same API the MCP server uses | Agent-first in the architecture, not only in the pitch |
| 13 | A **learning track**: 14 rotations that make the build double as training for the 25 PM roles in your field guide ([learning/](learning/README.md)) | Every learnable JD requirement gets built and proven on Lifelist, not studied alongside it |

## The bet

Lifelist is the specialist layer between rare experiences and the people, and personal AIs, who plan them. It knows every eclipse path, permit cap, ballot date and visa wait, and hands the booking to the operator who owns the inventory. A sommelier, not a supermarket.

**New in v2:** the sommelier never sleeps. A mesh of agents tastes the market around the clock. It reads what Indians search, save and book on Lifelist, what is trending on Instagram, YouTube and Google, and what changed in the world (a visa rule, a new direct route, a newly announced fixture). It turns that into new experiences, pairings and nudges, each verified before anyone sees it.

**Recommendation (unchanged).** Start agent-first and hand-off only: an Experience Graph, a public MCP server, a bucket-list web app and affiliate hand-offs to niche operators. Become a full agency (merchant of record) for two lanes only after demand gates are met, timed for the 2 Aug 2027 eclipse and the Oct–Nov 2027 Cricket World Cup.

**90-day goal.** 300 people with a saved lifelist, 50 weekly planners, the MCP server submitted to the Claude and ChatGPT app directories, the first 10 tracked bookings through partner links, **and 20 agent-discovered experiences live in the Atlas, of which at least 10 have earned saves.**

*Assumptions: Lifelist is a working name. 12–15 hours a week, with you as editor-in-chief over the agents that run the platform, coding agents that build it, and one part-time contractor for security review.*

## Why now

Unchanged from v1; the evidence table and sources are in [v1 § Why now](archive/build-plan-v1-2026-10-16.md#why-now). In short: Indian outbound demand is large and growing, the TCS cut to 2% eases the full-agency path, MCP Apps render partner UI inside Claude and ChatGPT, and UPI agentic payments exist. Generalist OTAs are already inside ChatGPT, so a newcomer wins on depth, not breadth.

**Added in v2:** trend data is now reachable through official rails. Google opened an alpha Trends API in July 2025 ([PPC Land](https://ppc.land/google-opens-alpha-testing-for-new-trends-api-targeting-developers-and-journalists/)), and Instagram's Hashtag Search API gives business accounts 30 hashtags a week ([Meta for Developers](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-facebook-login/hashtag-search)). TikTok has been banned in India since 2020, so Instagram Reels and YouTube Shorts are where Indian travel trends surface first.

## Who it serves

Unchanged: affluent and time-poor travellers, young people saving up, NRI and diaspora travellers, and **personal AI agents** as the fourth user. See [v1 § Who it serves](archive/build-plan-v1-2026-10-16.md#who-it-serves).

**Added in v2:** a fifth "user" is internal. These are **Lifelist's own agents**, which consume the same API as everyone else. If an internal agent needs a capability, it becomes a tool that external agents can also use (where safe). That keeps the platform agent-first by construction.

## The product

One Experience Graph powers three surfaces, **Dream, Plan and Book**, each shipped as a page for people and as a tool for agents from the same code. The design rule stays **anchor and orbit**: model the scarce moment deeply; fetch flights, hotels and transfers live.

v1 features remain (Atlas, Lifelist stages, Trip storyboard, Fit check, Feasibility engine, Itinerary composer, Watchers, hand-off and post-booking checklist). v2 adds:

- **"New on Lifelist" shelf.** Agent-discovered experiences, labelled with why they were added ("rising among Bengaluru planners this month", "visa just got easier for Indian passports").
- **Because-you-saved suggestions.** Pairings mined from what people save together, each with a stated reason.
- **Ask for it.** When search comes up short, one tap (or one `request_experience` call from an agent) files the request. The person is told when it lands in the Atlas.
- **Booked / Done check-ins.** A light post-trip prompt that feeds the booking signal and earns a "Done" badge and a short review.

## Agents run the platform

The platform is operated by agents grouped into five desks. You are the editor-in-chief. You set policy, approve what the autonomy ladder still reserves for you, and read one digest a day. Full specs are in [docs/agents/](agents/README.md).

| Desk | Newsroom analogy | Agents | Runs |
| --- | --- | --- | --- |
| **Discovery** | Reporters and the assignment desk | Pulse, Trend Scout, World-change Scout, Lane Scouts, Prospector, Pairing Miner | Continuous, hourly, nightly |
| **Curation** | Fact-check and editing | Verifier, Editor, Curator, Experimenter | Before anything is shown, nightly |
| **Service** | The front desk for live requests | Orchestrator, Feasibility, Composer, Booker | On request |
| **Engagement** | Push alerts and the reader-mail desk | Watcher, Nudge, Concierge Desk | Event-driven |
| **Operations** | Night-shift manager and partnerships | Night Manager, Partner Ops | Continuous, daily digest at 06:30 IST |

### The demand loop

```
 outside world ──► Trend Scout ─┐
 world changes ──► World-change ├─► Signal ─► Prospector ─► Candidate ─► Verifier ─► Review queue (you, or auto at L3)
 Lifelist usage ─► Pulse ───────┘                │                                          │
                                         Pairing Miner                                      ▼
                                                                     Experimenter (show to a small share) ─► keep / retire
                                                                                                    │
                                                              Nudge ◄── Watcher ◄── graph events ◄──┘
```

Rules that make the loop trustworthy:

1. **Two-source rule.** A trend from a single source never creates a Candidate on its own. It needs either two independent outside sources, or one outside source plus first-party demand.
2. **Nothing unverified is shown.** Candidates reach people or agents only after the Verifier passes them and they are approved (by you, or automatically once the agent has earned L3).
3. **Every suggestion says why.** Signals are stored with their evidence, and the reason travels with the experience to the UI and the MCP response.
4. **Rarity floor.** Ranking boosts scarcity type and novelty. At least 30% of "New on Lifelist" slots go to experiences outside the top-demand decile. Commission never enters ranking.
5. **Anonymous by default.** Pulse surfaces a signal only when at least 10 distinct people or agent sessions are behind it.

### Autonomy ladder

Decided in [ADR 0002](decisions/0002-autonomy-ladder.md).

| Level | Agents may | Starts at launch for |
| --- | --- | --- |
| L0 Propose | Queue a change for your approval | Everything not listed below |
| L1 Refresh | Update an existing fact from an official source or a Tier A partner API, within tolerance | Verifier, Lane Scouts; Editor for page refreshes after a verified change |
| L2 Extend | Add offers and windows to existing experiences | Nobody; earned after 30 days |
| L3 Create | Publish new experiences | Nobody; earned no earlier than Phase 3, never for safety-critical categories |

**Promotion:** at least 100 proposals at the current level with at least 95% approved unchanged, no critical error in 30 days, and golden-set accuracy of at least 98%. **Demotion:** any critical error (a wrong date, visa rule or price shown to a person) drops that agent one level for that category, automatically.

**Daily review budget:** at most 20 items, ranked by expected value. Whatever doesn't fit waits and ages, and the Night Manager reports the backlog.

## Agent-first architecture

The five layers from v1 remain, from sources up to interfaces, and every answer traces back to a timestamped source. v2 changes:

- **The web app is a client of the public API.** Web, MCP server, WhatsApp and internal agents all call one tool layer. Anything a page can do, a permitted agent can do.
- **An event bus sits at the centre** ([architecture/events.md](architecture/events.md)). Scouts and the Verifier emit graph events. Watcher and Nudge subscribe. Agents react instead of polling.
- **Durable workflows** (Inngest or Trigger.dev) run schedules, retries and the review queue.
- **The airlock:** agents that read untrusted outside content can only call `propose_*` tools that take structured fields. They never write to the graph and never message users or partners. Outside text reaches write-capable agents only as quoted data, never as instructions.

### The Experience Graph

v1 records: **Experience, Offer, Constraint, Window, Pairing**, each carrying a source URL, check time, verifier and confidence. v2 adds:

- **Signal:** an aggregated demand observation (source, query or topic, geography, velocity, sample size, evidence links, expiry).
- **Candidate:** a proposed experience, offer, pairing or twin, with its supporting Signals, status (proposed → verified → approved → live → retired) and the agent that proposed it.
- **Demand:** per-experience counters by day and channel (views, saves, feasibility checks, compositions, hand-off clicks, booked, done).

It also adds **freshness limits per fact type** (for example, an eclipse date never expires, a price lasts 24 hours, and permit availability is checked hourly within 30 days of the window). Details are in [architecture/graph.md](architecture/graph.md). Stable experience definitions live as reviewed files in git; volatile facts live in Postgres ([ADR 0004](decisions/0004-graph-storage-split.md)).

### MCP server: the front door for personal AIs

v1's seven tools stay. v2 adds four, so agents bring demand in and take outcomes back. Contracts are in [architecture/mcp-tools.md](architecture/mcp-tools.md).

| Tool | What it does | Why it matters |
| --- | --- | --- |
| `request_experience(description, constraints)` | Files a structured request when search falls short | Zero-result queries become Prospector input |
| `whats_new(since, interests, passport)` | Returns verified additions and window changes | Gives assistants a reason to call back; assistants rarely accept pushes |
| `report_outcome(lifelist_item, booked \| done, consent)` | The user's AI reports a booking or completion | Closes the Path 1 booking blind spot |
| `subscribe(triggers, webhook \| a2a_push)` | Push notifications for agents that support them | Works with the A2A push model |

### Protocol choices

Unchanged from v1 (MCP and MCP Apps in Phase 1, A2A Agent Card in Phase 2, schema.org and llms.txt from day one, UCP and ACP watch-only, UPI agentic payments in Phase 3 for Path 3). **Added:** A2A push notifications in Phase 2 for `subscribe`.

### Trust rules for agents

v1 rules stay (OAuth scopes, no spend without human confirmation, idempotency keys and an audit log, source and confidence on every response, partner terms on cached content). Added:

- No agent sends anything to a **partner** without your approval. Partner Ops drafts; you send.
- Nudge messages to people use templates you approved and frequency caps the person set.
- Every agent has a daily budget and a kill switch. The Night Manager can pause any agent and must tell you why.
- Outside-signal content is stored as derived signals with links, not copies of posts.

## Booking: hand-off vs full agency

Unchanged from v1: launch on **Path 1** (hand-off) and move individual lanes to **Path 3** (full agency) only when they pass the triggers. See [v1 § Booking](archive/build-plan-v1-2026-10-16.md#booking-hand-off-vs-full-agency).

**Added in v2:**

- **Booking signal coverage** is tracked: the share of hand-off clicks for which you eventually learn the outcome, via partner postback, `report_outcome` or a self-reported Booked/Done stage. Below 40%, the demand loop is learning from browsing, not booking. That becomes a fifth trigger to move a lane to Path 3.
- On Path 3, the v1 Ops and Support agents become **Partner Ops** (supplier messages) and **Concierge Desk** (in-trip triage), already specced here for Path 1 duties.

## Roadmap and gates

*The v1 roadmap diagram's gate figures were not in the exported file. The gates below use v1's 90-day goals and should be reconciled with the diagram.*

| Phase | Window | Builds | Agents switched on | Gate to exit |
| --- | --- | --- | --- | --- |
| **0 Evidence** | 16 Oct – 30 Oct 2026 | Interviews, concierge trips, graph schema, tool contracts, golden set, **event and Signal schema** | None. Log every concierge lookup in the Signal format | Gate A: two lanes chosen from interview data; at least 10 of 15 interviewees would let an AI plan a rare trip |
| **1 Graph + read tools** | Nov 2026 – Jan 2027 | Atlas and lifelist web app, read MCP tools, `request_experience`, event bus, freshness limits, review queue | Verifier (L1), Lane Scouts (L1), World-change Scout, Trend Scout, Pulse, Editor, Night Manager, Concierge Desk (answers only) | Gate B: 300 saved lifelists, 50 weekly planners, MCP submitted, freshness ≥ 95% |
| **2 Loop + watchers** | Feb – Apr 2027 | Write tools behind OAuth, `whats_new`, `report_outcome`, `subscribe`, WhatsApp alerts, A2A card | Prospector, Pairing Miner, Experimenter, Watcher, Nudge, Partner Ops, Curator, Composer | Gate C: first paid moment by March 2027; 20 agent-discovered experiences live; booking signal coverage ≥ 40% |
| **3 Path 3 lanes** | May – Oct 2027 | Checkout for the eclipse and CWC lanes, UPI mandate, invoicing | Booker (Path 3), L2–L3 promotions where earned | Path 3 triggers met per lane |

**Gates, not dates** (unchanged): if a gate is missed, cut scope inside the phase rather than moving on.

**Weekly rhythm at 12–15 hours.** About a third on supply and partners, a third directing coding agents against acceptance tests, and a third on users. **The daily review queue (about 10 minutes a day, roughly 1.5 hours a week) comes out of the users third:** it is user research, delivered by agents.

## Learning track

Lifelist is also your residency. Each phase moves you through rotations (agents and MCP, evals, safety, data, voice, growth, billing, payments, identity, CI) that the 25 roles in [Cracking Lenny's 25 PM Roles](https://claude.ai/artifact/3D2fKmaBEPgvoXgaQHSXLh) screen for. Details: [learning/README.md](learning/README.md), with the requirement-by-requirement map in [learning/jd-coverage.md](learning/jd-coverage.md).

| Phase | Rotations | Build additions the learning track introduces |
| --- | --- | --- |
| 0–1 | R1 tools and MCP, R2 evals, R3 safety, R4 data, R6 CI, R14 craft | CI run logging from the first commit; signed container and SBOM for the MCP server; dbt over the events table; unsafe-advice eval |
| 1–2 | R5 orchestration and economics, R7 partners | Cost-per-moment dashboard; partner integration scorecard |
| 2 | R8 voice, R9 post-training, R10 growth, R11 billing sandbox, R12 payments memo, R13 identity | Concierge Desk on WhatsApp voice notes; fine-tuned small extractor; metered B2B Graph API billed in Stripe test mode; review queue and digest in Slack via MCP; agent lifecycle and access reviews |
| 3 | R11 and R12 live | Path 3 quote-to-cash, double-entry ledger with landed cost, UPI mandate checkout, operator payouts |

**What it can't do.** Years of experience, managing PMs, location and work authorisation, required degrees and prior scale are hard filters that no project meets. The coverage map lists them role by role. Two offsets are written into the plan: a part-time product intern in Phase 2–3 who owns one lane (real, if small, PM management), and a three-person advisory board with quarterly updates.

**Time.** Rotations sit inside build work. Writing each rotation's proof artifact and field note adds 1–2 hours at its end. Side quests run only in slack weeks between gates, at most one a month.

## Stack and running cost

v1 picks stand (Supabase Postgres with pgvector, the TypeScript MCP SDK with MCP Apps, Next.js, WhatsApp Business API, Viator Partner API, Duffel on Path 3, PostHog, golden-set evals). Added:

| Layer | Pick | Why |
| --- | --- | --- |
| Workflows and schedules | Inngest or Trigger.dev | Durable runs, retries, cron and fan-out without running servers |
| Event bus | Postgres `LISTEN/NOTIFY` plus an outbox table at first; a managed queue later if volume needs it | Boring, one fewer service |
| Model tiers | A **small** model for extraction and classification, a **mid** model for proposals and messages, a **large** model for the weekly Prospector synthesis only | Cost follows difficulty |
| Batch and cache | Nightly jobs through the provider's batch API, with prompt caching for shared system prompts | Roughly halves the cost of non-urgent work |
| Agent tracing | OpenTelemetry traces per agent run, stored next to PostHog events | The Night Manager and you can see why an agent did something |
| Outside signals | Google Trends API (alpha; apply now) or a paid fallback, Instagram Graph API, YouTube Data API, Wikipedia Pageviews API, Reddit Data API, GDELT and RSS | See [ADR 0003](decisions/0003-outside-signals-and-meta.md) |

**Running cost.** Keep the v1 envelope of ₹10,000–25,000 a month for Phases 1–2, with a starting allocation of a ₹15,000 monthly model budget (about ₹500 a day): discovery 35%, curation 20%, service 20% (scales with usage), engagement 10%, operations 5%, reserve 10%. Each agent's daily cap is in its spec. Any agent at 80% of its cap by midday is throttled to essential runs, and the Night Manager flags it.

## Supply and partnerships

Unchanged tiers A–D and first ten conversations from v1. **Added:** Partner Ops turns Demand records into a monthly one-page **demand brief per partner** ("47 Indians with a cleared feasibility check saved Ponant Antarctica this quarter; 60% from Mumbai and Bengaluru"). This is the currency for earning feeds from Tier C operators, and later a possible B2B product.

**Data rules** (v1 rules stay; added): outside-signal sources are accessed only through official APIs or licensed data providers. No scraping of social platforms, and no automation of consumer AI assistants.

## Competition and moat

Unchanged competitor map. v2 adds a sixth compounding asset:

6. **The demand ledger.** Structured, India-specific intent (passport, city, budget, month) captured from agents and people, joined to outside trends and outcomes. Generalist assistants answer questions; Lifelist learns which rare moments Indians are moving toward, before operators do.

## Metrics

The north star stays **moments booked**. v1 metrics stay. Added (90-day targets are starting points):

| Metric | Definition | 90-day target |
| --- | --- | --- |
| Discovery yield | Agent-proposed Candidates you approve | 40% or more |
| Discovery stickiness | Approved discoveries with at least 3 saves within 30 days | 50% or more |
| Signal-to-live time | Median days from first Signal to a live experience | 10 days or fewer |
| Zero-result rate | Searches and `search_experiences` calls with no good match | Falling month on month |
| Booking signal coverage | Hand-off clicks with a known outcome | 40% or more by Gate C |
| Tool success rate | MCP calls that return a valid, non-error result | 99% or more |
| Agent cost per moment booked | Model and infrastructure spend ÷ moments booked | Baseline in Phase 2 |
| Review backlog | Items waiting more than 3 days in your queue | Under 10 |

## Risks

v1 risks stand. Added:

| Risk | Why it matters | Mitigation | Early signal |
| --- | --- | --- | --- |
| Runaway agent cost | Agents loop or over-fetch around the clock | Daily caps, midday throttle, model tiers, batch runs, kill switch | Any agent above 80% of its cap two days running |
| Drift to the mainstream | The demand loop recommends what is already popular | Rarity floor, exploration quota, no commission in ranking | Median scarcity score of new additions falling |
| Trend hype and manipulation | Influencer spikes or coordinated posts create fake demand | Two-source rule, velocity over volume, first-party confirmation before L3 | Candidates retired within 30 days above 50% |
| Review overload | Agents propose more than you can approve | 20-item daily budget, ranking by expected value, autonomy promotions | Backlog above 10 for a week |
| Prompt injection via outside content | Social and web text reaches agents at scale | Airlock: readers only propose structured fields; writers never see raw outside text as instructions | Proposals containing instructions or URLs outside allow-lists |
| Platform terms on outside signals | Losing API access, or legal exposure | Official APIs and licensed providers only; no scraping; store derived signals, not posts | Any access-denied or policy warning |
| Meta AI has no public API for trend queries | The assistant you want to use may not be automatable | A human-run weekly prompt pack, treated as leads, never as facts (ADR 0003) | Not applicable |

## Next 14 days

v1's list stands. Added or changed items are in **bold**.

- [ ] Read your employer's outside-work and IP policy; check the name for trademark and domain conflicts.
- [ ] Share the Atlas with 30 people across the three segments and add a waitlist form.
- [ ] Run 15 interviews, five per segment. **Add one question: "Which Instagram or YouTube account made you want your last rare trip?"** (This seeds the Trend Scout's watch list.)
- [ ] Concierge test: plan three real trips by hand over WhatsApp and log every lookup. **Log each one in the Signal format ([architecture/graph.md](architecture/graph.md)).**
- [ ] Sign up for Viator's affiliate programme and two other open programmes. **Ask each about booking postbacks.**
- [x] Draft the graph schema, **including Signal, Candidate and Demand**, and load the 65 Atlas entries. *(Done 17 Oct: `supabase/migrations/`, `graph/experiences/`.)*
- [x] Write the MCP contract for `search_experiences`, `get_experience`, `check_feasibility` **and `request_experience`**. *(Done 17 Oct: [architecture/contracts.md](architecture/contracts.md).)*
- [ ] Build the 100-question golden set for evals.
- [ ] Choose the two launch lanes from interview data; default to sky and sport.
- [ ] Email the first five partners on the list.
- [ ] **Apply for the Google Trends API alpha; create an Instagram Business account and a Meta developer app, and start App Review for Public Content Access.**
- [ ] **Get a YouTube Data API key; list 30 Indian travel creators and 30 hashtags for the first Trend Scout watch list.**
- [ ] **Write the first Meta AI prompt pack and run it once by hand to judge usefulness ([agents/trend-scout.md](agents/trend-scout.md)).**
- [ ] **Turn on CI run logging from the first commit (R6 needs 8 weeks of data), and start the decision log ([learning/rotations.md](learning/rotations.md)).** *(CI is live in `.github/workflows/ci.yml`; GitHub keeps run timings, so the log starts now.)*
- [ ] **Check visa sponsorship for each Tier A role in the field guide before planning which proofs to prioritise.**

## Sources

v1 sources: [v1 § Sources](archive/build-plan-v1-2026-10-16.md#sources). Added in v2:

- [PPC Land: Google opens alpha testing for the Trends API](https://ppc.land/google-opens-alpha-testing-for-new-trends-api-targeting-developers-and-journalists/)
- [Meta for Developers: Instagram Hashtag Search](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-facebook-login/hashtag-search)
- [TechCrunch: Meta previews an API for its Llama models](https://techcrunch.com/2025/04/29/meta-previews-an-api-for-its-llama-ai-models/)
