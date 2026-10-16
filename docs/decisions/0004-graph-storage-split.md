# ADR 0004: Graph storage split

**Status:** Proposed · **Date:** 16 Oct 2026

## Context

Agents will propose changes to the graph around the clock. Every change must be auditable, reviewable and reversible. Some facts change hourly (prices, availability, forecasts); others rarely (what an experience is, its lane, its anchor moment, its scarcity type).

## Decision

- **Stable experience definitions** (Experience core fields, knowledge-based Pairings, safety category) live as **YAML files in git**, one per experience. Agent proposals for new experiences become pull requests. CI validates the schema and runs the golden-set evals. Merging is the approval, and the merge loads the record into Postgres.
- **Volatile facts** (Offers, Windows, availability, forecasts, Constraints) and **Signals, Candidates and Demand** live in **Postgres** (Supabase), with the audit log and snapshots.

Analogy: the git repo is the encyclopaedia, edited carefully with a full history. Postgres is the live ticker.

## Consequences

- A free, familiar review interface and history for the most important records.
- Two stores to keep in sync; a loader job and a CI check prevent drift.
- Revisit if the review queue moves entirely into a custom admin UI, or if experiences exceed a few thousand.
