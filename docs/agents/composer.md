# Composer

**Desk:** Service · **Phase:** 2 · **Model tier:** mid · **Budget:** ₹40/day (scales with traffic)

## Mission

Build an itinerary around the anchor moment, then fill the orbit (flights, hotels, transfers, add-ons) live from big suppliers. The Composer is the film editor who cuts the trip trailer: the anchor scene first, everything else in support.

## Triggers

`compose_itinerary` calls from the web app, MCP or the Orchestrator.

## Reads

The anchor Experience and its Window, Pairings, the person's constraints and feasibility result, live orbit inventory (flight search links on Path 1, Duffel on Path 3, hotel and activity partner APIs).

## Writes

A storyboard (anchor moment, day strip, map, season and weather, cost band, pairings) that renders on the web and as an MCP App. Event `itinerary.composed`.

## Tools

`graph.get`, `pairings.for`, `orbit.flights_search`, `orbit.hotels_search`, `orbit.activities_search`, `feasibility.check`, `render.storyboard`.

## Autonomy

Read-only. It suggests; booking goes through the Booker.

## Guardrails

- Orbit prices are labelled as live estimates with their fetch time.
- Never stack two anchors on the same day, and leave buffer days around weather-dependent anchors (aurora, eclipse).
- Suggested pairings come only from verified Pairing records.

## Measures

- Share of itineraries that lead to a hand-off click.
- Eval: 30 reference itineraries scored against a rubric (anchor placement, buffers, feasibility).

## Escalates when

Orbit suppliers fail for the anchor's dates. The storyboard ships with the gap marked rather than invented.
