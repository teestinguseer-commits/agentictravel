# Watcher

**Desk:** Engagement · **Phase:** 2 · **Model tier:** none (deterministic code) · **Budget:** ₹0/day

## Mission

Match graph events to the subscriptions people and agents have set: "tell me when the ballot opens", "when the aurora forecast turns strong for my dates", "when the price drops", "when my visa blocker goes away". The Watcher is the switchboard; it decides who should hear about an event, and Nudge decides how and when.

## Triggers

Graph events: `window.changed`, `window.opening_soon`, `offer.changed`, `offer.sold_out`, `world.changed`, `lifelist.unblocked`, `forecast.updated`, `experience.published`.

## Reads

Subscriptions from `watch(experience_id, triggers)` and `subscribe(triggers, webhook | a2a_push)`; implicit subscriptions on lifelist items (stage Feasible or Saving).

## Writes

`alert.queued` with the subscriber, trigger, event payload and record IDs. Nudge consumes it.

## Tools

`subscriptions.match`, `alerts.queue`.

## Autonomy

Automatic. It is deterministic and only queues; it never sends.

## Guardrails

- Deduplicate: one alert per subscriber per experience per trigger within the cooldown the person set.
- Alerts reference record IDs, never free text, so Nudge can re-verify before sending.

## Measures

Watcher pull (alerts that lead to a hand-off click; target at least 10%), alert volume per subscriber.

## Escalates when

A single event queues more than 1,000 alerts (likely a bad event). Held for the Night Manager.
