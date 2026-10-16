# ADR 0003: Outside signals, including Meta

**Status:** Accepted · **Date:** 16 Oct 2026 · **Decider:** Amandeep

## Context

First-party usage alone is too thin at launch (hundreds of users) to drive discovery, and it only shows demand Lifelist already serves. The founder wants outside signals as a required input, including Meta AI.

## Decision

Outside signals are a first-class input to the demand loop, accessed **only through official APIs or licensed data providers**.

| Source | Access route | Notes |
| --- | --- | --- |
| Google Trends | Official Trends API (alpha since July 2025; apply now). Fallback: a licensed provider such as DataForSEO or SerpApi | pytrends was archived in 2025; do not use unofficial scrapers |
| Instagram | Instagram Graph API Hashtag Search, from a Lifelist business account | 30 unique hashtags per rolling 7 days per account; needs App Review for Public Content Access; `recent_media` covers the last 24 hours |
| Meta AI | Human-run weekly prompt pack (see [Trend Scout](../agents/trend-scout.md)) | No public API for the consumer assistant is known; automating the consumer app would breach Meta's terms |
| Llama API | Model provider only | Carries no trend data |
| YouTube | YouTube Data API v3 | Indian travel creators and keyword search |
| Wikipedia | Wikimedia Pageviews API | Free; strong proxy for event interest |
| Reddit | Reddit Data API under commercial terms | Lane subreddits and r/IndiaTravel |
| News | GDELT and RSS | Coverage spikes in Indian media |
| Official sources | Embassies, MEA, airlines, event organisers | World-change Scout beats |

**Excluded:** X (cost), TikTok (banned in India since 2020; Research API is researcher-only), any scraping of social platforms, any automation of consumer AI assistants.

### Meta AI answers are leads, not facts

Meta AI output is stored as `evidence_strength = lead`. It can start an investigation, but it counts toward the **two-source rule** only after an independent source confirms it. If Meta later publishes an official API with this capability, the human step is replaced by an adapter; nothing else changes.

### Storage

Store derived metrics and links, never copies of posts, captions, images or comments.

## Consequences

- Phase 0 tasks: apply for the Trends API alpha, create the Instagram business account and Meta app, start App Review, get a YouTube API key, write the first prompt pack.
- The weekly Meta AI pack costs about 20 minutes of human time. Keep it only if its leads produce approved Candidates; review after 8 weeks.
- Platform access can be withdrawn; every source sits behind an adapter so it can be paused without code changes.

## Sources

- [PPC Land: Google opens alpha testing for the Trends API](https://ppc.land/google-opens-alpha-testing-for-new-trends-api-targeting-developers-and-journalists/)
- [Meta for Developers: Instagram Hashtag Search](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-facebook-login/hashtag-search)
- [TechCrunch: Meta previews an API for its Llama models](https://techcrunch.com/2025/04/29/meta-previews-an-api-for-its-llama-ai-models/)
