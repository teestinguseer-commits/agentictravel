# Lane Scouts

**Desk:** Discovery · **Phase:** 1 · **Model tier:** small · **Budget:** ₹35/day across all lanes · **Reads untrusted content: yes (airlock applies)**

## Mission

One Scout per Atlas lane (launch with the two lanes chosen at Gate A, by default sky and sport) watches the suppliers and official sources for that lane, and keeps the graph's offers, prices and windows current. These are the beat reporters, each with a patch they know well.

## Triggers

- Daily per lane.
- Hourly for any experience within 30 days of a window opening or closing, or with an active ballot or permit release.
- On demand when the Verifier finds a fact past its freshness limit.

## Reads

Partner APIs and feeds (Viator Partner API, GetYourGuide, SafariBookings and other Tier A and B feeds), operator pages that allow it under robots rules and terms, and official event and permit sources for the lane.

## Writes

- Updates to existing **Offer** and **Window** facts (L1, within tolerance).
- **Proposals** for new offers on existing experiences (L0 until promoted to L2).
- Leads for new experiences go to the Prospector as Signals with `source = lane_scout`; Scouts never create Experience records.
- Event `offer.changed`, `window.changed`, `offer.sold_out`.

## Tools

`partner_api.*` per partner, `fetch_allowed_page`, `diff_snapshot`, `extract_offer` (small model), `offers.refresh`, `windows.refresh`, `propose_offer`, `signals.propose`.

## Autonomy

**L1 at launch** for refreshing existing facts from Tier A partner APIs and official sources, within tolerance:

- Price changes within ±20% apply automatically; larger moves queue for review.
- Date changes never apply automatically; they always queue.
- Sold-out and closed statuses apply immediately (hiding is safer than showing).

L2 (new offers on existing experiences) is earned under [ADR 0002](../decisions/0002-autonomy-ladder.md).

## Guardrails

- Follow robots rules and partner terms; never scrape behind a login; cache with an expiry.
- Every fact keeps its source URL, check time and a snapshot.
- Booking links must carry the channel sub-ID for attribution.

## Measures

- Freshness share per lane (target: at least 95% within each fact type's limit).
- Share of auto-applied refreshes later reverted (target: under 1%).
- Eval: 50 offer pages per lane with known prices and dates.

## Escalates when

- A partner API fails for 6 hours. Goes to the Night Manager.
- More than 20% of a lane's offers change price in one day (likely a parsing error or a currency change).
