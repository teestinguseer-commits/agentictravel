# Lifelist Build Plan

Oct 16, 2026 · @Amandeep

## The bet

Build Lifelist as the specialist layer between rare experiences and the people, and personal AIs, who plan them. It knows every eclipse path, permit cap, ballot date and visa wait, and hands the booking to the operator who owns the inventory.

Think of it as a sommelier, not a supermarket. Skyscanner compares flights; Lifelist compares moments. It holds no stock of its own. It knows which experience suits the traveller, when the window closes, and who can deliver it.

**Recommendation.** Start agent-first and hand-off only: an Experience Graph, a public MCP server, a bucket-list web app and affiliate hand-offs to niche operators. Become a full agency (merchant of record) for two lanes only after demand gates are met, timed for the 2 Aug 2027 eclipse and the Oct–Nov 2027 Cricket World Cup.

**90-day goal.** 300 people with a saved lifelist, 50 weekly planners, the MCP server submitted to the Claude and ChatGPT app directories, and the first 10 tracked bookings through partner links.

The directory that seeds the graph is already live: [Lifelist Atlas](https://claude.ai/artifact/FtmWwkGHiLB9zm32qzTtBh), 65 uncommon experiences with seasons, budgets, visa effort and where to book.

*Assumptions: Lifelist is a working name (birders call the species they have seen in a lifetime their life list). The plan assumes 12–15 hours a week, with you directing AI coding agents and one part-time contractor rather than hand-coding.*

## Why now

Demand, tax and agent rails all moved in the last twelve months. Indians took about 29 million outbound trips in 2025, the TCS charge on overseas packages fell to a flat 2%, and Claude and ChatGPT now render partner apps inside the chat.

| Signal | Evidence | What it means for Lifelist |
| --- | --- | --- |
| Outbound volume | 29 million outbound trips in 2025, up almost 10% year on year ([Wesgro/Euromonitor](https://www.wesgro.co.za/uploads/files/Wesgro-Research_India-Tourism-Market-Insights-2026.pdf)) | The base is large and growing fast enough for a niche to matter |
| Long-run growth | Outbound projected at 11.4% CAGR to about $55 billion by 2034 ([Angel One](https://www.angelone.in/news/taxation/overseas-travel-queries-rise-after-budget-2026-lowers-tcs-on-tour-packages-bali-krabi-and-oman-see-higher-interest)) | Room to start narrow and widen |
| Experiential spend | Indians spend ₹1–4 lakh per person on Northern Lights trips; metros make up about 90% of bookings ([Curly Tales](https://curlytales.com/trending/indians-spend-over-lakh-to-see-northern-lights-despite-cost-whats-driving-the-demand/)) | High ticket sizes, concentrated in six cities you can reach |
| Sports travel | DreamSetGo moved 30,000+ sports travellers in a year, double 2024; 72% chose premium hospitality ([Dream Sports](https://www.dreamsports.group/media-and-blog/dreamsetgo-facilitates-30000-sports-travellers-launches-set-sports-experiences-travel)) | Proven willingness to pay for packaged moments |
| Endurance quests | Indian entries at the six Marathon Majors rose from 459 in 2014 to 1,673 in 2025 ([PUMA Project3](https://www.passionateinmarketing.com/?p=762865)) | Multi-year bucket lists exist and are trackable |
| Tax tailwind | Budget 2026 cut TCS on overseas tour packages from 5% and 20% to a flat 2% with no threshold ([Outlook Business](https://www.outlookbusiness.com/budget/fm-sitharaman-lowers-tcs-to-2-for-overseas-tours-education-and-medical-remittances)) | Makes the full-agency path far less painful than a year ago |
| Agent UI | MCP Apps, the first official MCP extension, renders interactive UI inside Claude and ChatGPT since January 2026 ([WorkOS](https://workos.com/blog/2026-01-27-mcp-apps)) | One server can reach both assistants with a visual itinerary |
| Agent supply | Expedia is launching a B2B MCP server so partners' agents can reach its inventory ([AltexSoft](https://www.altexsoft.com/travel-industry-news/expedia-to-launch-mcp-as-b2b-revenue-rises-25-percent/)); Google is testing agentic hotel booking in AI Mode on its Universal Commerce Protocol ([Gourmet Marketing](https://www.gourmetmarketing.net/blog/is-your-hotel-ready-for-an-ai-agent-to-book-it-a-commerce-readiness-checklist)) | Commodity flights and hotels are becoming agent-callable; the scarce layer is not |
| Agent payments | Razorpay and NPCI put UPI agentic payments on ChatGPT (Oct 2025) and Claude (Feb 2026) ([Razorpay](https://razorpay.com/newsroom/razorpay-npci-launch-agentic-payments-on-claude-powering-zomato-swiggy-zepto-at-the-india-ai-impact-summit/)) | India has a consent-based rail for agent checkout |
| A warning | OpenAI pulled its generic in-chat Instant Checkout in March 2026; brand apps from Booking.com and Expedia stayed live ([TripProf](https://tripprof.com/uk/blog/should-ai-book-your-trip-2026/)) | Agents prefer to call a specialist's own app, not a neutral checkout box |

The opening is narrow but real. Generalist OTAs are already inside ChatGPT, so a newcomer wins on depth (scarce, niche, India-specific knowledge), not on breadth.

## Who it serves

Three human segments share one engine, and the fourth user is software: the personal AI that will increasingly do the planning on their behalf. B2B planners and concierges come later, as a separate API track.

| User | Job to be done | What they need from Lifelist | Starter lanes |
| --- | --- | --- | --- |
| Affluent, time-poor (30–50, metro) | "Give me the best version of a rare moment without weeks of research." | A short, opinionated list; premium tiers; visa and logistics handled; family-friendly options | F1 hospitality, Luxor eclipse, safaris, Antarctica |
| Young, saving up (25–35) | "Help me pick my first big one and get there." | Cost bands, a savings goal per experience, cheaper twins (Morocco instead of Luxor, Hang En instead of Son Doong), group trips, leave-day planning | Yi Peng, Komodo, Ladakh snow leopards, Singapore GP, festivals, Marathon Majors |
| NRI / diaspora | "Use my base abroad, or bring my parents, for something hard to arrange." | Departures from any city, multi-currency, US and UK lotteries, family reunion trips | Cricket World Cup 2027, LA28, US lotteries, Up Helly Aa |
| Personal AI agents | "Answer my user's question with current facts and an action I can take." | Stable tool schemas, freshness timestamps, provenance, feasibility by passport, deep links or holds, OAuth to the user's lifelist | All lanes, via MCP |

Treat agents like a visiting delegation. They arrive with credentials, speak a protocol and expect a well-run embassy: MCP is the shared language, and the Agent Card is the front desk that says what you can do for them.

The same passport problem cuts across every human segment. Schengen states refused 15.8% of Indian applications in 2025, against a 14.8% global average ([Free Press Journal](https://www.freepressjournal.in/world/over-181000-indian-schengen-visa-applications-rejected-in-2025-check-country-with-highest-refusal-rates)). Feasibility by passport is therefore a core feature, not a footnote.

## The product

One Experience Graph powers three surfaces: Dream, Plan and Book. Each surface ships twice, as a page for people and as a tool for agents, from the same code.

The design rule is **anchor and orbit**. Every trip has one anchor, the scarce moment (totality at Luxor, a Monaco terrace, a gorilla hour). Everything else orbits it: flights, hotels, transfers, add-ons. Lifelist models anchors deeply and fetches orbit items live from big suppliers, so you never compete with Booking.com on hotels.

### Dream: the lifelist

- **Atlas.** Browse by lane, month, budget band and visa effort. The prototype is live.
- **Lifelist.** Save experiences. Each one moves through Dreaming, Feasible, Saving, Booked and Done, with a countdown to its next window.
- **Trip storyboard.** A visual itinerary that works like a film trailer for the trip: the anchor moment, a day strip, a map, season and weather, and the cost band. It renders on the web and, through MCP Apps, inside Claude and ChatGPT.
- **Fit check.** "Is this for me?" against fitness, cold tolerance, leave days, budget and visa effort. It answers yes, maybe or not yet, and offers the cheaper twin.

### Plan: from wish to feasible

- **Feasibility engine.** Visa lead time by passport and consulate, leave days bridged against Indian holidays, budget including TCS where a package applies, and season or ballot windows.
- **Itinerary composer.** Puts the anchor first, then fills the orbit and suggests pairings, such as Devil's Pool with India's World Cup match at Victoria Falls.
- **Watchers.** "Tell me when": a ballot opens, the aurora forecast turns strong for your dates, permits release or a price drops. This is the retention loop, and it is where agents and WhatsApp alerts both plug in.

### Book: hand the moment over safely

- Path 1 sends a pre-filled hand-off to the operator; Path 3 runs Lifelist's own checkout (next sections).
- After booking: a document checklist with visa appointment timing, a prep plan (marathon training, cold-weather kit), and trip-day alerts.

## Agent-first architecture

Build five layers, from sources up to interfaces, so every answer a person or an agent receives traces back to a source with a timestamp. This is a data-modelling problem before it is an AI problem: get the graph right and the agents stay simple.

&#91;embedded content: Architecture · 5 interfaces, 6 agents, 1 graph\]

Facts only reach a person or an agent after passing the Verifier, and flights and hotels go straight from live suppliers to the Booker, so the graph stays small and specialist.

### The Experience Graph

The graph is the moat. Each record type carries its source URL, when it was checked, who verified it and a confidence level.

- **Experience:** lane, anchor moment, place, season months, fixed dates, scarcity type (date, lottery, permit cap, season), lead time, difficulty, group fit.
- **Offer:** operator, price band, inclusions, booking link or API, commission, last checked.
- **Constraint:** visa by passport (lead time, refusal risk), fitness, age limits (Son Doong takes 18–70 only).
- **Window:** start, end, confidence, source. Eclipse dates are certain; aurora odds are probabilistic.
- **Pairing:** links between experiences, such as India's match at Victoria Falls and Devil's Pool.

### The agent mesh

Deterministic tools sit under LLM planners. Agents decide and explain; code fetches, computes and writes.

| Agent | Job | Guardrail |
| --- | --- | --- |
| Orchestrator | Routes a request to specialists and assembles the answer | Every claim cites a graph record; no free-text facts |
| Scout (one per lane) | Watches sources and proposes graph updates | Changes queue for verification; follows robots rules and partner terms |
| Verifier | Re-checks dates, prices and sold-out status before anything is shown or booked | Blocks facts past their freshness limit |
| Curator | Matches experiences to a person's lifelist and constraints | Says why each pick fits |
| Feasibility | Visa timeline, leave days, budget, fitness | Shows assumptions; sends edge cases to the consulate |
| Composer | Builds the itinerary around the anchor | Orbit items fetched live from suppliers |
| Watcher | Fires alerts on windows, ballots, forecasts and prices | Frequency caps the user sets |
| Booker | Hand-off links (Path 1) or hold and checkout (Path 3) | A human confirms any spend; idempotent calls |

### The MCP server: the front door for personal AIs

Ship read tools first, then write tools behind OAuth.

1. `search_experiences(query, month, budget_band, passport, lane)`
2. `get_experience(id)` returns facts with sources and freshness
3. `check_feasibility(experience_id, passport, home_city, dates, budget)`
4. `compose_itinerary(experience_id, constraints)` returns a storyboard that renders as an MCP App
5. `list_offers(experience_id)` returns operators, price bands and booking links
6. `save_to_lifelist` and `watch(experience_id, triggers)`, signed in
7. `start_booking(offer_id)` returns a hand-off URL on Path 1, or a hold and payment request on Path 3

### Protocol choices

| Standard | Use it for | Adopt | Status, Oct 2026 |
| --- | --- | --- | --- |
| MCP | Tools and resources any assistant can call | Phase 1 | The common standard; Expedia is building a B2B server |
| MCP Apps | Storyboard and lifelist UI inside Claude and ChatGPT | Phase 1–2 | Stable spec since 26 Jan 2026; runs in Claude, ChatGPT, VS Code and Goose ([The New Stack](https://thenewstack.io/anthropic-extends-mcp-with-an-app-framework/)) |
| A2A Agent Card | Let other agents delegate whole tasks, such as "plan my 2027 eclipse trip" | Phase 2 | v1.0 in March 2026 with 150+ backers ([LetsDataScience](https://letsdatascience.com/news/a2a-solidifies-cross-vendor-agent-interoperability-53400ea4)), yet only 10 of 65 published cards passed every 1.0 check in July ([API Evangelist](https://apievangelist.com/2026/07/29/most-published-agent-cards-are-not-actually-a2a/)), so a valid card is a cheap way to be early |
| schema.org and llms.txt | Make public pages readable by crawlers and agents | Phase 1 | Low cost, do it from day one |
| Google UCP | Watch only | Later | Its lodging draft has no fields for agencies or commissions ([Hospitality Net](https://www.hospitalitynet.org/editorial/4134768/the-ai-booking-protocol-has-no-field-for-your-travel-agent-will-agentic-bookings-flourish-or-fizzle-inaccurate-hotel-content-costs-travelers-1900-on-average)) |
| OpenAI ACP | Watch only | Later | Instant Checkout was pulled in March 2026; ACP continues under ChatGPT Apps ([Respan](https://www.respan.ai/resources/agentic-commerce-engineering)) |
| UPI agentic payments | Agent checkout with user mandates in India | Phase 3, Path 3 only | Built on UPI Reserve Pay and UPI Circle via Razorpay |

### Trust rules for agents

- OAuth scopes per user: read lifelist, write lifelist, start booking.
- No spend without an explicit human confirmation, whoever asks.
- Idempotency keys on every write, and a full audit log.
- Every response carries its source, check time and confidence.
- Cached partner content follows each partner's terms.

## Booking: hand-off vs full agency

Launch on Path 1 (hand-off) and move individual lanes to Path 3 (full agency) only when they pass the triggers below. Path 1 is a matchmaker who makes the introduction and steps back. Path 3 is the wedding planner who signs every vendor contract and takes the 2 am call.

|  | Path 1: plan and hand off | Path 3: full agency |
| --- | --- | --- |
| Who takes the money | The partner. Viator, for example, is merchant of record and handles payment and support for link bookings ([Viator](https://partnerresources.viator.com/travel-content/links/)) | Lifelist |
| Revenue | Commission. Viator links pay 8% on bookings within 30 days of a click | Package margin you set, plus supplier commissions |
| India compliance | Company and GST on commission income | GST on packages at 5% without input credit or 18% with it; collect a flat 2% TCS on overseas packages of two or more components and deposit it under the buyer's PAN ([CalcGuru](https://calcguru.in/?p=2780)); no licence is legally required, Ministry of Tourism recognition is voluntary, and IATA matters only for ticketing on your own stock |
| Capital and risk | Close to zero; no inventory | Supplier deposits (eclipse tours often take 50% up front), refunds, cancellations, currency risk, liability insurance |
| Support | The partner handles in-trip problems | You own round-the-clock support while people travel |
| Data and relationship | You lose the customer at checkout and see only partner reports | Full funnel data and a repeat relationship |
| Agent story | Agents receive a hand-off link; the person finishes on the partner site | Agents can complete a booking end to end with a UPI mandate and a human confirmation |
| Time to first revenue | Weeks | Months |
| Fits a solo builder | Yes | For one or two lanes, with an ops partner or co-founder |

### How the plan changes

| Plan area | Path 1 | Path 3 |
| --- | --- | --- |
| Validation | Measure hand-off clicks and partner-confirmed bookings | Take small refundable deposits to test real commitment |
| Graph | An offer is a link plus a commission rate | An offer is a contract rate, an allotment and cancellation terms |
| Agents | Booker returns a URL | Booker holds, collects payment and issues vouchers; add an Ops agent for supplier messages and a Support agent |
| Stack | Affiliate tracking with sub-IDs per channel (web, MCP, WhatsApp) | Razorpay with UPI, GST and TCS invoicing, a ledger, refunds, a secure passport vault |
| Team | You plus AI agents | Add a part-time chartered accountant, an ops lead and an in-trip support partner |
| Metrics | Click-through, partner conversion, commission per booking | Gross booking value, margin, refund rate, post-trip NPS |
| Legal | Affiliate terms and disclosure | Supplier contracts, customer T&Cs, insurance, e-commerce consumer rules |

### Triggers to move a lane to Path 3

These are suggested starting thresholds; tune them after Phase 1.

- 30 or more qualified enquiries a month in the lane, two months running.
- More than half of hand-off clicks drop at the partner's checkout.
- Partners cannot serve Indian travellers well: no INR pricing, no GST or TCS-compliant invoice, no visa support letters.
- Margin per booking on Path 3 would be at least three times the Path 1 commission.

If the gap between paths feels too wide, a concierge step bridges it: a person closes bookings on the partner's checkout for the customer, which tests whether one bill and one contact are what people pay for.

## Roadmap and gates

Four phases over twelve months, each unlocked by a gate you can observe, so the first paid moment lands by March 2027, well before the August 2027 eclipse.

&#91;embedded content: Roadmap · 4 phases, 3 gates, Oct 2026 to Oct 2027\]

Phase 0 is the only one that starts now. Each later phase opens only when its gate's numbers are met, and the right-hand notes are the events to market in that window.

**Gates, not dates.** If a gate is missed, cut scope inside the phase (fewer lanes, fewer tools) rather than moving on. A missed Gate A means the lanes or segments are wrong; go back to interviews before writing code.

**Weekly rhythm at 12–15 hours.** About a third on supply and partner calls, a third directing coding agents against written acceptance tests, and a third on users: interviews, concierge trips and reading the eval and freshness reports.

## Stack and running cost

Use boring, managed parts so your hours go into the graph and the agents. A rough running cost for Phases 1 and 2 is ₹10,000–25,000 a month, most of it model calls and messaging; this is an estimate, not a quote.

| Layer | Pick | Why |
| --- | --- | --- |
| Data | Postgres on Supabase, with pgvector | Graph as tables plus edge tables, similarity search, auth included |
| Ingestion | Scheduled TypeScript or Python workers; official APIs and feeds first, headless browsing only where terms allow | Scouts stay cheap and auditable |
| Agents | An LLM with tool use; one orchestrator plus small specialist prompts | Easy to test each agent alone |
| MCP server | TypeScript MCP SDK with the MCP Apps extension, remote HTTP transport, OAuth | One server reaches Claude, ChatGPT and other clients |
| Web | Next.js, sharing storyboard components with the MCP App views | Build the itinerary UI once |
| Alerts | WhatsApp Business API through a provider, plus email | Watchers reach people where they already are |
| Experiences inventory | Viator Partner API (free affiliate access) and other partner feeds | 300,000+ products as the orbit layer |
| Flights | Search links on Path 1; Duffel on Path 3, which can ticket under its own IATA accreditation for about $3 an order plus 1% ([Geekflare](https://geekflare.com/guides/flight-booking-api/)) | Amadeus closed its self-service APIs on 17 July 2026, so do not build on them |
| Analytics | PostHog | One funnel across web, MCP and WhatsApp |
| Evals | A golden set of 100 travel questions with known answers, run on every change | Catches agents drifting from the facts |

**Build approach.** You write specs and acceptance tests; coding agents write the code; a part-time contractor reviews security at two gates (before OAuth goes live, and before any money moves). Each phase ends on observable checks, not on a feeling that it is done.

## Supply and partnerships

Start with suppliers that already have APIs or affiliate programmes, then earn feeds from exclusive operators by showing them qualified Indian demand. The pitch is the same everywhere: these travellers have chosen your experience, checked their visa timeline and budget, and are ready to book.

| Tier | Examples | How to connect | What they get |
| --- | --- | --- | --- |
| A. Open APIs and affiliates | Viator, GetYourGuide, Booking.com and Expedia affiliate programmes | Self-serve sign-up and API keys | A new channel (agents) with clean tracking |
| B. Niche marketplaces | [SafariBookings](https://www.safaribookings.com/operator-contact/p1412) (3,000+ safari operators), [Swoop Antarctica](https://www.swoop-antarctica.com/blog/?p=627) and Swoop Patagonia, Guide to Iceland | Referral agreement, then a data feed | Visa-ready Indian travellers, a segment they under-serve |
| C. Exclusive or official operators | Oxalis (Son Doong), F1 Experiences (run by QuintEvents), Quark, Ponant, Frontiers North, the ICC ticket ballot | Waitlist links first; referral deals once volume shows | Demand that has already passed a fit and visa check |
| D. India specialists | DreamSetGo, Active Holiday Company, Thomas Cook and SOTC | Referrals both ways now; a licensed API later | Lifelist's discovery traffic in lanes they own; later, the graph as a B2B tool |

**First ten conversations**, matched to the suggested launch lanes (sky and sport): Lights Over Lapland, Aurora Nights, On The Go Tours, Eclipse Travel, Guide to Iceland, F1 Experiences, DreamSetGo, Viator, SafariBookings and Swoop.

**Data rules.** Prefer partner feeds over scraping. Never scrape behind a login. Follow robots rules and site terms, credit operator content, cache with an expiry, and keep a snapshot of every fact you show, so the Verifier can prove where it came from.

## Competition and moat

The closest competitor is DreamSetGo, which launched SET in April 2026 to move beyond sport into lifestyle and cultural events. Everyone else is either a generalist or deep in a single lane, which leaves room for a cross-lane, India-aware, agent-native layer.

| Player | What they do | Where Lifelist differs |
| --- | --- | --- |
| [DreamSetGo](https://www.dreamsports.group/media-and-blog/dreamsetgo-facilitates-30000-sports-travellers-launches-set-sports-experiences-travel) | Premium sports travel, now widening into experiences; human-led | All seven lanes, every budget band, and callable by agents |
| Thomas Cook, SOTC, Pickyourtrail | Packaged tours, including Northern Lights departures for Indians | Depth on scarce moments rather than fixed group packages |
| Booking.com and Expedia in ChatGPT; Expedia's MCP server | Hotels and flights for agents | They become the orbit layer Lifelist calls, not a rival |
| [Mindtrip](https://www.oag.com/blog/march-2026-the-month-agentic-travel-gets-real) with Sabre and PayPal | Conversational planning with agentic flight booking | Generalist and US-centred; no scarcity or Indian passport model |
| SafariBookings, Swoop | Deep marketplaces for one region | Partners: Lifelist sends them Indian demand |

**What compounds over time**

1. **The graph.** Scarcity type, windows, visa effort by passport and pairings are structured nowhere else.
2. **India-specific feasibility.** Refusal risk, leave days, TCS and UPI are details a global planner ignores.
3. **Watchers.** A lifelist is a multi-year relationship; the Six Star marathon quest alone spans four or more years.
4. **Being early on agent rails.** A valid MCP server and Agent Card while the niche is empty.
5. **Trust.** Every fact shows its source and the date it was checked.

The largest threat is a general assistant answering well enough from the open web. The defence is what the web cannot give it: verified freshness, feasibility for a specific passport and an action it can take.

## Metrics

The north star is **moments booked**: lifelist experiences that reach a confirmed booking, partner-confirmed on Path 1. The targets below are suggested starting points for the first 90 days.

| Metric | Definition | 90-day target |
| --- | --- | --- |
| Moments booked | Confirmed bookings that started from a lifelist item | 10 |
| Weekly active planners | People who save, check feasibility or compose an itinerary in a week | 50 |
| Lifelist depth | Saved experiences per active user | 5 or more |
| Agent share | Share of feasibility checks and itineraries requested through MCP | 25% or more |
| Freshness | Share of dated facts verified in the last 7 days | 95% or more |
| Fact accuracy | Golden-set eval answers that match the source | 98% or more |
| Watcher pull | Alerts that lead to a hand-off click | 10% or more |
| Hand-off conversion | Hand-off clicks that partners confirm as bookings | Baseline in Phase 2 |
| Revenue per moment | Commission (Path 1) or margin (Path 3) per booking | Baseline in Phase 2 |

## Risks

The two risks that can sink this are stale facts and slow intent. Both have early signals you can watch weekly.

| Risk | Why it matters | Mitigation | Early signal |
| --- | --- | --- | --- |
| Stale or wrong facts | Agents repeat errors at scale and trust collapses | Verifier agent, a 7-day freshness limit, sources on every fact, golden-set evals | Freshness under 95% |
| Bucket lists move slowly | Saves pile up without revenue | Lead with fixed-date tentpoles and near-term lanes (aurora season, Singapore GP); watchers turn dreams into dates | Many saves, few hand-offs |
| Partners refuse feeds | The graph goes thin | Start with open APIs; show demand data; hand-verify the top 50 anchors | No reply after three approaches |
| Assistants answer directly from the web | Lifelist is bypassed | Be the tool they call: freshness, passport feasibility, an action to take | Agent share flat for two months |
| Solo bandwidth | Phases slip alongside a full-time job | Gates, not dates; cut scope before you miss a gate | Two missed weekly goals in a row |
| Visa refusals (Path 3) | Cancellations and refund losses | Keep bookings refundable until the visa is issued; steer to lower-refusal consulates | Refusals above 10% of trips |
| Personal data | DPDP obligations, passports on Path 3 | Collect the minimum, keep consent logs, no passport data on Path 1 | Any request to store documents |
| Agent misuse | Graph scraping, prompt injection through partner content | Rate limits, auth tiers, treat fetched text as data and never as instructions | Spikes in anonymous calls |
| Employment terms | Conflict with your employer's outside-work or IP policy | Read the policy and get any approval in writing before public launch | Before Phase 1 ends |

## Next 14 days

The first two weeks are about evidence, not code. By 30 October you should know your two launch lanes and have a tool contract ready for the coding agents.

- [ ] Read your employer's outside-work and IP policy, and check the working name for trademark and domain conflicts.
- [ ] Share the Atlas with 30 people across the three segments and add a waitlist form.
- [ ] Run 15 interviews, five per segment: the last rare trip they took or skipped, how they planned it, what blocked them, and whether they would let an AI book it.
- [ ] Concierge test: plan three real trips by hand over WhatsApp (an aurora trip this season, a 2027 World Cup trip, a Luxor eclipse trip) and log every lookup. The log becomes the agent spec.
- [ ] Sign up for Viator's affiliate programme and two other open programmes.
- [ ] Draft the graph schema (Experience, Offer, Constraint, Window, Pairing) and load the 65 Atlas entries.
- [ ] Write the MCP contract for `search_experiences`, `get_experience` and `check_feasibility`: inputs, outputs and error cases.
- [ ] Build the 100-question golden set for evals.
- [ ] Choose the two launch lanes from interview data; default to sky and sport.
- [ ] Email the first five partners on the list.

## Sources

- [Wesgro: India Tourism Market Insights 2026](https://www.wesgro.co.za/uploads/files/Wesgro-Research_India-Tourism-Market-Insights-2026.pdf)
- [Angel One: TCS cut and outbound projections](https://www.angelone.in/news/taxation/overseas-travel-queries-rise-after-budget-2026-lowers-tcs-on-tour-packages-bali-krabi-and-oman-see-higher-interest)
- [Outlook Business: TCS on overseas tour packages cut to 2%](https://www.outlookbusiness.com/budget/fm-sitharaman-lowers-tcs-to-2-for-overseas-tours-education-and-medical-remittances)
- [CalcGuru: starting a travel agency in India](https://calcguru.in/?p=2780)
- [Curly Tales: Indians spending on Northern Lights](https://curlytales.com/trending/indians-spend-over-lakh-to-see-northern-lights-despite-cost-whats-driving-the-demand/)
- [Dream Sports: DreamSetGo 30,000 travellers and SET](https://www.dreamsports.group/media-and-blog/dreamsetgo-facilitates-30000-sports-travellers-launches-set-sports-experiences-travel)
- [PUMA Project3: Indian entries at the Marathon Majors](https://www.passionateinmarketing.com/?p=762865)
- [Free Press Journal: Schengen refusals for Indians in 2025](https://www.freepressjournal.in/world/over-181000-indian-schengen-visa-applications-rejected-in-2025-check-country-with-highest-refusal-rates)
- [WorkOS: MCP Apps](https://workos.com/blog/2026-01-27-mcp-apps) and [The New Stack: MCP Apps in Claude](https://thenewstack.io/anthropic-extends-mcp-with-an-app-framework/)
- [AltexSoft: Expedia B2B MCP server](https://www.altexsoft.com/travel-industry-news/expedia-to-launch-mcp-as-b2b-revenue-rises-25-percent/)
- [Gourmet Marketing: Google agentic hotel booking test](https://www.gourmetmarketing.net/blog/is-your-hotel-ready-for-an-ai-agent-to-book-it-a-commerce-readiness-checklist)
- [Hospitality Net: UCP lodging draft and travel agencies](https://www.hospitalitynet.org/editorial/4134768/the-ai-booking-protocol-has-no-field-for-your-travel-agent-will-agentic-bookings-flourish-or-fizzle-inaccurate-hotel-content-costs-travelers-1900-on-average)
- [TripProf: what ChatGPT and Gemini do for travel in 2026](https://tripprof.com/uk/blog/should-ai-book-your-trip-2026/) and [Respan: agentic commerce protocols](https://www.respan.ai/resources/agentic-commerce-engineering)
- [Razorpay: agentic UPI payments on Claude](https://razorpay.com/newsroom/razorpay-npci-launch-agentic-payments-on-claude-powering-zomato-swiggy-zepto-at-the-india-ai-impact-summit/)
- [LetsDataScience: A2A at one year](https://letsdatascience.com/news/a2a-solidifies-cross-vendor-agent-interoperability-53400ea4) and [API Evangelist: published Agent Cards](https://apievangelist.com/2026/07/29/most-published-agent-cards-are-not-actually-a2a/)
- [Viator: affiliate links and commission](https://partnerresources.viator.com/travel-content/links/)
- [Geekflare: flight booking APIs in 2026](https://geekflare.com/guides/flight-booking-api/)
- [OAG: Sabre, PayPal and Mindtrip](https://www.oag.com/blog/march-2026-the-month-agentic-travel-gets-real)
- [On The Go Tours: 2027 eclipse over Luxor](https://www.onthegotours.com/Egypt/Guides/Solar-Eclipse)
- [ICC: Cricket World Cup 2027 fixtures](https://www.icc-cricket.com/news/fixture-schedule-announced-for-icc-men-s-cricket-world-cup-2027)
- [Lifelist Atlas](https://claude.ai/artifact/FtmWwkGHiLB9zm32qzTtBh), the experience directory, with its own source list
