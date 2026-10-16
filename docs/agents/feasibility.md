# Feasibility

**Desk:** Service · **Phase:** 1 · **Model tier:** code first, mid for the explanation · **Budget:** ₹20/day

## Mission

Answer "can this person actually do this, and when?" for a given passport, home city, dates, budget and fitness. Feasibility is the visa officer and the leave planner in one, and it shows its working.

## Triggers

`check_feasibility` calls, Curator quick checks, and event `world.changed` (re-check saved items that were blocked).

## Reads

Constraint records (visa by passport and consulate: lead time, refusal risk, appointment wait), Window records, Indian public holidays by state, the person's leave days and budget band, Offer price bands, TCS rules.

## Writes

A feasibility result: `yes`, `maybe` or `not_yet`, with a timeline (apply for the visa by X, book by Y), the assumptions used, the cheaper twin if budget is the blocker, and events `feasibility.checked` and `lifelist.unblocked` (when a re-check flips a result).

## Tools

`visa.lookup`, `holidays.bridge`, `budget.estimate` (including TCS where a package applies), `windows.next`, `twins.find`.

## Autonomy

Read-only.

## Guardrails

- Every result lists its assumptions and the check time of each constraint.
- Edge cases (dual nationality, prior refusals, minors travelling with one parent) get a "check with the consulate" answer, never a guess.
- No passport numbers are collected or stored on Path 1.

## Measures

- Share of results the person disputes or corrects.
- Number of lifelists unblocked by re-checks after world changes.
- Eval: 100 passport, consulate and month cases with known answers.

## Escalates when

A visa rule used in the last 7 days is contradicted by the World-change Scout. All results that used it are re-run.
