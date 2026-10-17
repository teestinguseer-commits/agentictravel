# JD coverage map

Every requirement from the "Experience bar" of the 25 roles in [Cracking Lenny's 25 PM Roles](https://claude.ai/artifact/3D2fKmaBEPgvoXgaQHSXLh), and where Lifelist covers it. Rotation codes (R1–R14) and side quests (SQ-) are defined in [rotations.md](rotations.md).

**Buckets**

- **Build:** the core Lifelist build teaches it and produces proof.
- **Side quest:** a bounded exercise next to Lifelist, using its data or code.
- **Standalone:** learnable, but Lifelist has no honest link to it; a standalone exercise from the field guide covers it.
- **Partial:** Lifelist gives real but smaller-scale or adjacent experience; say so in interviews.
- **Hard filter:** years, managing people, location or work authorisation, degree, or prior scale. No project meets it; see [Offsets](#offsets-for-hard-filters) at the end.

## Summary

| # | Role | Learnable requirements covered | Hard filters that remain |
| --- | --- | --- | --- |
| 1 | Anthropic, PM Business Technology | All | Office in SF/Seattle/NYC (sponsorship offered) |
| 2 | Stripe, Staff PM Connect | All | 7+ years |
| 3 | Google, Director PM Photos | All, some partial | 15 years; 7 years managing PMs; C-suite influence |
| 4 | Anduril, Staff PM Growth Platform | All | 7+ years; US defence eligibility |
| 5 | Anthropic, PM Safeguards Rare Harms | All | 5+ years preferred; SF |
| 6 | Cloudflare, Director PM Fintech | All, some partial | Managed PMs; delivered at Cloudflare's scale |
| 7 | Thinking Machines, PM Post-Training | All, some partial | None stated beyond SF |
| 8 | Handshake, VP Product | All, some partial | 12+ years; 4+ leading PMs and managers; hiring PMs |
| 9 | Crusoe, VP PM Managed AI | All, some partial | Leading PM teams; VP scope |
| 10 | Stripe, Staff PM AI | All | 10+ years |
| 11 | ClickHouse, Principal PM Partner Integrations | All | Principal-level years |
| 12 | Rippling, Director of Product IT | All | Leading PM teams |
| 13 | Sierra, PM Agent Development | All | In-person SF; US work authorisation |
| 14 | Chainguard, Senior PM AI CI/CD | All | US remote only; no visa sponsorship |
| 15 | Anduril, Staff PM Manufacturing Software | Via standalone and partial only | 12+ years; leading PMs; defence eligibility |
| 16 | Crusoe, Principal PM Networking | Via standalone only | BS EE/CS; 8+ years; direct RDMA experience |
| 17 | NVIDIA, Principal PM Laptop GPU | Partial and standalone | 15+ years; 4+ leadership; on site |
| 18 | Databricks, Sr PM Free Edition | All | 5+ years (you may meet it) |
| 19 | CoreWeave, Staff PM Data Services | All, some partial | 8+ years with 3–4 in data services; prior DB or cloud vendor |
| 20 | Polymarket, Staff PM Crypto | Via standalone and partial | 5+ years consumer (you may meet it) |
| 21 | Airwallex, Staff PM Agentic Payments | All, some partial | 8+ years fintech; scaled payment infrastructure |
| 22 | Anduril, Staff PM Advanced Costing | Partial and standalone | Oracle or SAP costing years; defence eligibility |
| 23 | Google, Director PM Growth Maps | All, some partial | 15 years; billion-user scale; managing PMs |
| 24 | Stripe, Staff PM Billing | All | 10+ years |
| 25 | Airwallex, Staff PM AI Growth | All | 7–9 years; mentoring PMs |

The pattern is clear. **Tier A and B roles from the field guide are fully covered on everything learnable.** What remains for them is mostly years and location. Tier C and Skip roles are blocked by hard filters a project cannot move, and the standalone exercises exist only so you can say you have touched the domain.

---

## 1 · Anthropic: PM, Business Technology

| Requirement | Bucket | Where |
| --- | --- | --- |
| Shipped outcomes tied to a company-wide goal, with clear attribution | Build | R14: attributed outcome stories on "moments booked" |
| Drove several company-wide initiatives at once | Partial | R14: product, data, partners and agents run in parallel; small company |
| Shipped on new model capabilities; designed for where models will be in 3–12 months | Build | R1 (MCP Apps), R5; the autonomy ladder assumes agents improve |
| Slowed down or changed course for safety, privacy or data reasons | Build | R3; [ADR 0003](../decisions/0003-outside-signals-and-meta.md): declined to automate Meta AI on terms grounds |
| Raised PM craft for an org (artifacts, rituals, standards) | Partial | R14: spec template, ADRs, daily digest ritual; the "org" is you, agents and a contractor |
| Enterprise constraints: identity, permissions, data classification, auditability | Build | R13, R4, R3 |
| Consumer-grade polish | Build | Atlas, storyboard, MCP App UI |
| Hands-on building with frontier models | Build | Every rotation |
| Agent identities, permission scopes, human-in-the-loop, audit trails | Build | R13, R3 |
| Slack, Google Workspace, MCP integrations | Build | R13: review queue and digest in Slack through MCP |
| Location: SF, Seattle or NYC, 25% in office | Hard filter | Sponsorship offered per the field guide |

## 2 · Stripe: Staff PM, Connect

| Requirement | Bucket | Where |
| --- | --- | --- |
| 7+ years of PM | Hard filter | — |
| Owned platform, API or developer-facing products end to end | Build | R1: the public Lifelist API and MCP server |
| Owned an area through strategy, execution and measured outcomes | Build | R14 |
| Defines the measurement framework before shipping | Build | R10: metric tree; the plan's metrics precede each phase |
| Clear writer across functions and levels | Build | R14 |
| Preferred: payments or financial infrastructure | Build | R11, R12 |
| Preferred: productising bespoke solutions into general capabilities | Build | Concierge trips become the agent spec; requests become experiences (Prospector); B2B Graph API |
| Preferred: well-judged bets ahead of demand | Build | MCP, A2A and agent-first bets, recorded as ADRs |
| Marketplace money flows, KYC/KYB | Build + Side quest | R12; SQ-J Stripe Connect toy |

## 3 · Google: Director PM, Photos

| Requirement | Bucket | Where |
| --- | --- | --- |
| 15 years of PM, consumer mobile or cloud | Hard filter | — |
| 7 years leading and growing PM teams | Hard filter | — |
| Stakeholder work spanning Engineering, UX, Privacy and Legal | Partial | DPDP consent, partner terms, Path 3 legal; with a contractor, a CA and a lawyer |
| Preferred: MBA or MS (AI or HCI) | Hard filter | Preferred, not required |
| Preferred: retention and storage-monetization frameworks | Side quest | SQ-G Lifelist Plus |
| Preferred: influence with the C-suite | Hard filter | Partial practice through partner executive pitches (R7) |
| Preferred: computer vision, generative media or recommendations | Build + Side quest | Curator recommendations (R10); SQ-H "Done" memory card |
| Privacy-first methods, consent UX | Build + Side quest | R4 data governance; SQ-H consent for personal photos |
| Experimentation at scale (holdouts, guardrails, long-term effects) | Partial | R10 at small scale |

## 4 · Anduril: Staff PM, Growth Platform

| Requirement | Bucket | Where |
| --- | --- | --- |
| 7+ years of digital PM | Hard filter | — |
| Owned a platform spanning several systems of record, including integrations | Build | R4, R7: graph, partner feeds, analytics, WhatsApp, payments |
| Delivered on a modern data platform (warehouse, pipelines, BI) | Build | R4: dbt star schema over events |
| Partners: Growth Ops, BD, Deployment Ops, Legal, Finance | Partial | Partners, CA and legal in Phase 3 |
| Event-driven sync, idempotent upserts, reconciliation | Build | R4 event outbox; R7 affiliate reconciliation |
| US defence eligibility | Hard filter | — |

## 5 · Anthropic: PM, Safeguards Rare Harms

| Requirement | Bucket | Where |
| --- | --- | --- |
| 5+ years of PM (preferred) | Hard filter | Preferred, not required |
| Depth on data, detection, interventions, infrastructure, evals | Build | R3, R2 |
| Trade-off calls across policy, ML and engineering | Build | R3: threshold memo |
| Metrics for risk, system performance, user impact, blind spots | Build | R3: blind-spot metrics page |
| Zero-to-one launches in ambiguous spaces | Build | Lifelist itself |
| Writes safety evals; explains safety to outside audiences | Build | R3: public harm eval suite and memo |
| Location: SF | Hard filter | Sponsorship offered per the field guide |

## 6 · Cloudflare: Director PM, Fintech

| Requirement | Bucket | Where |
| --- | --- | --- |
| Non-negotiable: billing, fintech or compliance projects at Cloudflare's size | Hard filter | R11 teaches the domain at small scale only |
| Non-negotiable: managed PMs in those domains | Hard filter | — |
| Billing, invoicing, pricing and quoting | Build | R11 |
| Contracts and entitlements | Build | R11: contract → voucher as entitlement |
| Tax | Build | R11: GST and 2% TCS invoicing |
| Partners and resellers | Build | R7: affiliates and Tier D resellers |
| Credit, collections, bad debt | Partial | R11: deposits, refunds, failed payments |
| BI | Build | R4 |
| ERP | Partial | R11 Phase 3: ledger synced to an Indian SMB accounting system (Zoho Books or Tally) |
| Revenue recognition | Build | R11: principal vs agent memo (Ind AS 115 / IFRS 15) |
| Finance fluency, engineering fluency | Build | R11; directing coding agents |
| Bonus: networking layers 2–7 | Standalone | SQ-L reading pack |

## 7 · Thinking Machines: PM, Post-Training

| Requirement | Bucket | Where |
| --- | --- | --- |
| Early or first product leader where the role was not defined | Build | Lifelist founder |
| Worked closely with training, post-training, RL, evals, data, safety, inference | Partial | R9, R2, R3, R5, done hands-on at small scale rather than alongside researchers |
| Understands research without overstating expertise | Build | R9: "what is uncertain" narrative |
| Spots missing connections and unmade decisions | Build | R14: decision log |
| Preferred: technical founder, PM for eval platforms | Partial | Lifelist founder; R2 eval harness |
| Fine-tune a small model with before/after eval | Build + Side quest | R9; SQ-F RL with verifiable rewards |

## 8 · Handshake: VP Product, Handshake AI

| Requirement | Bucket | Where |
| --- | --- | --- |
| 12+ years, 4+ as a senior leader of PMs and managers | Hard filter | — |
| Owned a fast-growing business line; org design that scaled with revenue | Hard filter | — |
| Built platforms for internal users, ops teams or two-sided marketplaces | Build | Review queue as internal ops tooling; Lifelist as a two-sided marketplace (R12) |
| Hired and developed PMs | Hard filter | Partial offset: the product intern (see Offsets) |
| Board and C-suite communication | Partial | R14: monthly investor-style update; advisory board (see Offsets) |
| Bonus: human data, labelling, RLHF | Build | R9: review labels as a dataset, inter-annotator agreement |
| Bonus: marketplaces | Build | R12 |

## 9 · Crusoe: VP PM, Managed AI

| Requirement | Bucket | Where |
| --- | --- | --- |
| Track record on AI/ML services, building managed AI services from scratch | Partial | Lifelist's MCP and Graph API is a managed agent service, not inference; SQ-C |
| Built, led and mentored PM teams | Hard filter | — |
| Hands-on AI tools in the PM craft | Build | Every rotation |
| Nice: operated a managed AI service as a customer | Build | R5: you buy inference and measure latency, cost and reliability |
| Inference economics, pricing teardown | Side quest | SQ-C |

## 10 · Stripe: Staff PM, AI (Payments Intelligence)

| Requirement | Bucket | Where |
| --- | --- | --- |
| 10+ years of relevant PM | Hard filter | — |
| Business acumen; builds technical solutions to improve the business | Build | R14, R11 |
| Coaches a team on requirements and roadmap delivery | Partial | Agent specs and acceptance tests are requirements; you direct coding agents and a contractor |
| Works across a wide range of systems and technologies | Build | The full Lifelist stack |
| ML in payments: retries, routing, fraud scoring | Partial | R12: payment success and fraud sizing memo for Path 3 |
| Experimentation on revenue metrics | Build | R10 |

## 11 · ClickHouse: Principal PM, Partner Integrations

| Requirement | Bucket | Where |
| --- | --- | --- |
| Highly cross-functional, internal and external partner teams | Build | R7 |
| Owns the multi-org path to certified, listed and live | Build | R1 directory submission; R7 partner integrations |
| Principal level (roughly 8–12 years), ecosystem programmes | Hard filter | Years; the ecosystem work itself is R7 |
| OLAP basics; the modern data stack; MCP for agents | Build + Side quest | R4; SQ-B ClickHouse; R1 MCP |
| Partner integration scorecard | Build | R7 proof |

## 12 · Rippling: Director of Product, IT

| Requirement | Bucket | Where |
| --- | --- | --- |
| Deep product leadership scaling complex products | Partial | Lifelist at small scale |
| Hired, grew and led PM teams | Hard filter | Partial offset: the product intern |
| Product taste and systems thinking | Build | R13: "policy set once, enforced everywhere" spec |
| High clock speed, bias to action | Build | Gates and weekly cadence; shipping velocity tracked |
| Nice: empathy for IT admins, CIOs, CISOs | Build | R13: you administer 19 agent identities; plus your ServiceNow background |
| Identity, access, AI governance | Build | R13 |

## 13 · Sierra: PM, Agent Development (Public Sector)

| Requirement | Bucket | Where |
| --- | --- | --- |
| 5–7+ years on highly technical products, Senior PM or above | Hard filter | You may already meet it from your career |
| Works directly with customers in complex organisations | Build | Concierge trips, partner calls; plus your CCaaS background |
| Tailors messages to executives; explains AI to any audience | Build | R14; partner demand briefs |
| Ambiguous cross-functional work from discovery to measurable impact | Build | Lifelist |
| Even better: built conversational or long-horizon agents (evals, retrieval, prompts, tooling) | Build | R8, R2, R4, R1 |
| Even better: accessibility and security | Build + Side quest | SQ-E accessibility audit; R6, R13 security |
| Even better: govtech procurement, FedRAMP | Standalone | SQ-R reading pack |
| Even better: founding-team or forward-deployed experience | Build | Lifelist founder |
| Even better: some React, TypeScript or Go | Build | The stack is TypeScript and Next.js; you review agent-written code |
| In person in SF; US public sector | Hard filter | — |

## 14 · Chainguard: Senior PM, AI CI/CD

| Requirement | Bucket | Where |
| --- | --- | --- |
| 5+ years of PM on developer, infrastructure or security products | Hard filter | Partial: Lifelist's public API and MCP server are developer products |
| **Built agent tools: coding agent, harness, MCP servers, eval systems** | Build | R1, R2, R5 |
| Knows CI from the inside | Build | R6 |
| Took a technical product from idea to launch; knows what to leave out | Build | Lifelist; ADRs record what was cut |
| Writes well; decisions in documents | Build | R14 |
| Nice: coding agents in production at volume | Build | R6: Lifelist is built by coding agents, with logged CI |
| Nice: containers and Kubernetes | Partial | R6 containers; Kubernetes in SQ-R reading pack |
| Nice: developer security products | Build | R6: SBOM, Sigstore, SLSA |
| US remote; no visa sponsorship | Hard filter | — |

## 15 · Anduril: Staff PM, Manufacturing Software

| Requirement | Bucket | Where |
| --- | --- | --- |
| 12+ years; portfolio across several teams | Hard filter | — |
| Mentored PMs; set product practices | Hard filter | Partial: R14 standards; the product intern |
| Manufacturing, supply chain, warehousing or logistics domain | Standalone + Partial | SQ-K factory floor day; Path 3 fulfilment is trip logistics (allotments, vouchers, traceability) |
| Built MES, shop-floor or operational software | Standalone | SQ-K spec from the floor visit; Lifelist's ops tooling is only an analogy |
| Frontier AI tooling and AI-assisted development | Build | Every rotation |
| Plus: operations research, industrial engineering, lean | Standalone | SQ-K |
| Defence eligibility | Hard filter | — |

## 16 · Crusoe: Principal PM, AI Infrastructure (Networking)

| Requirement | Bucket | Where |
| --- | --- | --- |
| BS in EE, CS or related | Hard filter | — |
| 8+ years technical PM or infrastructure engineering | Hard filter | — |
| Networking subject-matter expertise | Standalone | SQ-L reading and decision doc; it will not make you an SME |
| Fleet-wide network architecture and failure domains | Standalone | SQ-L |
| Vendor strategy and build vs buy | Partial | Lifelist vendor ADRs (workflow engine, model providers, data stores) |
| Infrastructure economics | Partial | R5: cost per outcome |
| Direct RDMA (InfiniBand or RoCE) experience | Hard filter | Direct experience can't be simulated |

## 17 · NVIDIA: Principal PM, Laptop GPU and SoC

| Requirement | Bucket | Where |
| --- | --- | --- |
| 15+ years; 4+ years leadership | Hard filter | — |
| Enthusiast in creation, AI and gaming | Partial | AI via Lifelist; SQ-D local AI |
| Partners and ecosystem across the full lifecycle | Build | R7 |
| Analytical, marketing and programme skills; large programmes with executives | Partial | Lifelist at small scale |
| Local AI hardware and software stack | Side quest | SQ-D |
| PC OEM ecosystem | Standalone | SQ-R reading pack |
| On site in Santa Clara | Hard filter | — |

## 18 · Databricks: Senior PM, Free Edition

| Requirement | Bucket | Where |
| --- | --- | --- |
| 5+ years, preferably data, AI or developer platforms | Hard filter | You may already meet it |
| Empathy for learning and onboarding | Build | R10: the free Atlas as a learning funnel; developer onboarding for the MCP server |
| Collaboration across engineering, design and GTM | Build | Lifelist |
| Storytelling that simplifies complex concepts | Build | Storyboards; R14 |
| Technical enough for data and platform work | Build | R4 |
| Free-tier guardrails (abuse, cost) | Build | R3 rate limits for anonymous MCP; R5 budgets |
| Hands-on with Databricks Free Edition | Side quest | SQ-A |
| Academic partnerships | Standalone | Out of Lifelist's scope; mention only if asked |

## 19 · CoreWeave: Staff PM, Data Services

| Requirement | Bucket | Where |
| --- | --- | --- |
| 8+ years, 3–4 in data services | Hard filter | — |
| Relational and distributed databases | Build + Side quest | R4 Postgres in depth; SQ-A and SQ-B for warehouses |
| Managed data services on a cloud | Partial | Supabase (managed Postgres) |
| Data security and governance: encryption, IAM, masking, isolation | Build | R4, R13 |
| Staff or Director at a database vendor or cloud | Hard filter | — |
| API-first platform thinking; SLAs | Build | R1, R5: SLOs for the MCP server |
| Data pipelines for AI (datasets, versioning) | Build | R9 |

## 20 · Polymarket: Staff PM, Crypto

| Requirement | Bucket | Where |
| --- | --- | --- |
| 5+ years PM at a consumer company, senior IC | Hard filter | You may already meet it |
| Deep crypto market knowledge; retail trader behaviour | Standalone | SQ-M prediction-market teardown |
| Order books, market structure, VWAP and TWAP | Standalone | SQ-M |
| Price resolution and manipulation resistance | Partial | SQ-I aurora odds calibration and source-of-truth design |
| Fast prioritisation; data pulling and analysis | Build | R10 |
| Plus: market makers, prediction markets | Standalone | SQ-M |

## 21 · Airwallex: Staff PM, Agentic Payments

| Requirement | Bucket | Where |
| --- | --- | --- |
| 8+ years with high-growth fintech exposure | Hard filter | — |
| Built and scaled core payment infrastructure | Partial | R12: agent checkout and payouts at small scale |
| Strong technical background; CS degree preferred | Hard filter | Degree preferred, not required |
| Preferred: auth flows, ISO 8583 and 20022, card scheme rules | Side quest | SQ-J card lifecycle in Stripe test mode; R12 reading |
| Preferred: token standards (ERC-20, Solana SPL), stablecoins | Standalone | SQ-P stablecoin testnet payment |
| **Preferred: LLMs, tool-use agents, multi-agent, x402, A2A, AP2, UCP** | Build | R1, R5, R12 protocol memo |
| Reviews API contracts with principal engineers | Build | R1 |

## 22 · Anduril: Staff PM, Advanced Costing Systems

| Requirement | Bucket | Where |
| --- | --- | --- |
| Investigates stuck transactions and interface failures between systems | Partial | R11: reconciliation across Razorpay, ledger and accounting system |
| Release management with regression tests on accounting entries | Partial | R11 + R6: ledger regression tests in CI |
| Manufacturing accounting: receipt accruals, landed cost, WIP | Partial + Standalone | R11 landed cost of packages; SQ-N WIP worked example |
| Oracle Fusion or SAP costing background | Hard filter | — |
| Defence eligibility | Hard filter | — |

## 23 · Google: Director PM, Growth and Monetization, Maps

| Requirement | Bucket | Where |
| --- | --- | --- |
| 15 years of PM | Hard filter | — |
| Led growth, engagement and retention for consumer products | Partial | R10 at small scale |
| Growth for products with hundreds of millions to billions of users | Hard filter | — |
| Built and managed PM teams | Hard filter | — |
| Preferred: ads and commercial revenue models | Side quest | SQ-O sponsored placements memo |
| Growth loops, network effects; a "saved places" growth model | Build | R10 proof |

## 24 · Stripe: Staff PM, Billing

| Requirement | Bucket | Where |
| --- | --- | --- |
| 10+ years of relevant PM | Hard filter | — |
| Can build a robust Stripe API integration; joins API design, data modelling and architecture debates | Build | R11 sandbox: metered Graph API billed in Stripe test mode; R1 |
| Customer empathy, startups to enterprise, engineering and finance personas | Partial | B2B API customers; Path 3 finance with a CA |
| Product sense; concise writing for senior audiences | Build | R14 |
| Preferred: infancy to scale; multi-product platform; founded a business | Build | Lifelist: web, MCP, B2B API, Path 3 |

## 25 · Airwallex: Staff PM, AI Growth

| Requirement | Bucket | Where |
| --- | --- | --- |
| Staff level (about 7–9 years) | Hard filter | You may be close |
| Full lifecycle of AI features, ideation to optimisation | Build | Prospector, Curator, Nudge |
| Growth and PLG: nudges, rewards, cross-sell, lifecycle automation | Build | R10; "Done" badges as rewards |
| Dashboards, SQL, A/B tests on activation, adoption, retention | Build | R10 |
| Mentors PMs | Hard filter | Partial offset: the product intern |
| Technical background in AI/ML | Build | R9, R5 |

---

## Offsets for hard filters

These do not remove a hard filter. They shrink it, and give you an honest story.

| Filter | Offset | Cost |
| --- | --- | --- |
| Managing or mentoring PMs | Hire a part-time product intern in Phase 2–3 to own one lane (for example sky). You set goals, review their specs and run their 1:1s. That is real, if small, PM management. Add external mentoring (for example ADPList) for range | ₹15–30k a month for the intern; 1–2 hours a week |
| Board and C-suite communication | An advisory board of 3 (a travel operator, a fintech operator, an AI builder) with a quarterly update meeting | Time only |
| Scale (billions of users, Cloudflare-size billing) | None. Use Lifelist to show judgement and mechanics; target roles where scale is "preferred", not "required" | — |
| Years of experience | Time. Lifelist adds a founder year with shipped AI, which many JDs weigh above an extra year of tenure | — |
| Location and work authorisation | Check sponsorship before investing prep time (the field guide's advice). Anthropic and Thinking Machines sponsor; Chainguard does not | — |
| Degree requirements | None for "required"; ignore where "preferred" | — |
| Defence eligibility | None from India | — |
