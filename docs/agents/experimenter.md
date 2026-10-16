# Experimenter

**Desk:** Curation · **Phase:** 2 · **Model tier:** code for statistics, mid for the readout · **Budget:** ₹10/day

## Mission

Give every newly approved experience a fair, small audience, then decide whether it stays. The Experimenter is the section editor who runs a story on page 12 first, and moves it to the front only if readers bite.

## Triggers

- Event `experience.published` from an approved Candidate: start an exposure.
- Nightly: update exposure shares and read out results.

## Reads

Demand events for exposed experiences (views, saves, feasibility checks, hand-off clicks), split by channel.

## Writes

- Exposure allocations (a bandit across new experiences, starting at 10% of "New on Lifelist" and recommendation slots).
- After 30 days or 300 exposures, whichever comes first: a **keep**, **extend** or **retire** recommendation with numbers.
- Event `experiment.readout`.

## Tools

`experiments.assign`, `demand.query`, `stats.beta_binomial`, `propose_retirement`.

## Autonomy

L0 for retirements: you approve before anything is retired. Keep and extend apply automatically.

## Guardrails

- Exposure is never 0% for an approved experience inside its first 30 days.
- Rare, long-lead experiences (lead time over 6 months) are judged on saves and feasibility checks, not hand-off clicks.
- Retired experiences stay in the graph as `retired` with the readout, so the Prospector learns from them.

## Measures

- Discovery stickiness (approved with at least 3 saves in 30 days).
- Share of retirements later reversed.

## Escalates when

An experience gets strong saves but zero hand-off clicks for 30 days (a likely supply or link problem). Goes to Partner Ops.
