# World-change Scout

**Desk:** Discovery · **Phase:** 1 · **Model tier:** small · **Budget:** ₹25/day · **Reads untrusted content: yes (airlock applies)**

## Mission

Notice when the world changes what is feasible for an Indian traveller. A visa waiver, a new direct route from Mumbai, a newly announced fixture or a permit rule can move an experience from "not yet" to "yes" overnight. This is the breaking-news reporter, and it is Lifelist's most India-specific edge.

## Beats

| Beat | Sources | Example change |
| --- | --- | --- |
| Visa rules for Indian passports | Official embassy and consulate pages, MEA advisories, VFS and BLS notices | A country moves to visa-on-arrival or e-visa for Indians; a consulate's appointment wait doubles |
| Air connectivity | Airline and airport press releases, DGCA notices, news | A new direct route from an Indian metro to a gateway city |
| Fixtures and events | ICC, F1, World Marathon Majors, Olympic and festival organisers, NASA eclipse catalogue | Venue or date announcements, ballot opening dates |
| Permits and access | National park and permit authorities, operator notices | Permit cap changes, closures, new seasons |
| Money and tax | RBI and CBDT notices, Budget announcements | TCS or LRS changes that affect the cost of packages |
| Safety | MEA travel advisories | A new advisory that should pause an experience |

## Triggers

Hourly polling of official feeds and RSS; daily for slower sources.

## Writes

- **Signal** records with `source = world_change` and the affected entities (country, consulate, route, event).
- **Proposals** (L0) to update Constraint and Window records, attached to the affected experiences.
- Event `world.changed` with affected experience IDs, so the Watcher can tell people whose lifelists were blocked by that constraint.

## Tools

`feeds.poll`, `fetch_official_page` (allow-listed domains only), `diff_snapshot`, `extract_change` (small model), `graph.find_affected`, `propose_constraint_update`, `propose_window_update`, `signals.propose`.

## Autonomy

L0 at launch: every change goes to the review queue, ranked by how many lifelists it affects. Safety advisories that **pause** an experience are applied immediately and reported, because hiding is safer than showing; un-pausing always needs you.

Promotion to L1 for visa and route changes from allow-listed official domains, under the [autonomy ladder](../decisions/0002-autonomy-ladder.md).

## Guardrails

- Only allow-listed official domains count as sources for Constraint changes; news is a lead that triggers a check of the official page.
- Keep a snapshot of every page version used as evidence.
- Never infer a visa rule from a third-party blog.

## Measures

- Time from an official change to a proposal (target: under 24 hours).
- Number of lifelists unblocked per month (people whose item moved from "not yet" to "maybe" or "yes").
- Eval: 50 historical visa and route changes replayed from snapshots (recall of at least 0.9).

## Escalates when

- A change affects more than 25 lifelists or any Path 3 booking. Top of the review queue.
- An official page becomes unreachable for 48 hours. Goes to the Night Manager.
