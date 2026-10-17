# Lifelist (agentic travel)

An agent-first platform for rare travel experiences: eclipses, ballots, permit-capped treks, once-a-decade fixtures. Agents work around the clock to discover, verify and suggest new experiences from what people search, save and book, and from outside trends, then hand the booking to the operator who owns the inventory.

Start with [docs/README.md](docs/README.md).

## Repository

| Path | What it holds |
| --- | --- |
| `docs/` | The build plan, agent specs, architecture, decisions and the learning track |
| `graph/experiences/` | One reviewed YAML definition per experience (the stable half of the graph) |
| `graph/seed/` | The Atlas export the definitions were first imported from |
| `contracts/` | JSON Schema contracts for the public tools, with validated examples |
| `evals/` | The 100-question golden set, a reference oracle over the graph, and check operators |
| `supabase/` | Postgres migrations and the generated seed |
| `scripts/` | Import, validation, seed generation and migration tests |

## Checks

Requires Node 22 and, for the database test, a local Postgres (or `DATABASE_URL`).

```
npm ci
npm run check        # experience definitions, tool contracts and the golden set
npm run graph:seed-sql
npm run db:test      # migrations, seed and smoke checks on a throwaway database
```

To add or change an experience, edit its YAML file, run `npm run graph:seed-sql`, and open a pull request; CI runs all three checks.
