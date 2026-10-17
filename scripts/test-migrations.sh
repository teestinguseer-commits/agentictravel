#!/usr/bin/env bash
# Applies the migrations and seed to a throwaway local Postgres, then runs smoke checks.
# With DATABASE_URL set (CI), uses that database instead of starting one.
# The pgvector migration is skipped when the extension isn't installed locally.
set -euo pipefail
cd "$(dirname "$0")/.."

PGBIN="${PGBIN:-$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)}"
if [[ -z "${DATABASE_URL:-}" ]]; then
  DATA="$(mktemp -d /tmp/lifelist-pg.XXXXXX)"
  SOCK="$DATA/sock"; mkdir -p "$SOCK"
  RUN=(); [[ "$(id -u)" == "0" ]] && { chown -R postgres "$DATA"; RUN=(runuser -u postgres --); }
  "${RUN[@]}" "$PGBIN/initdb" -D "$DATA/db" -U postgres -A trust >/dev/null
  "${RUN[@]}" "$PGBIN/pg_ctl" -D "$DATA/db" -o "-k $SOCK -c listen_addresses=''" -l "$DATA/log" -w start >/dev/null
  trap '"${RUN[@]}" "$PGBIN/pg_ctl" -D "$DATA/db" -m immediate stop >/dev/null; rm -rf "$DATA"' EXIT
  DATABASE_URL="postgresql://postgres@/postgres?host=$SOCK"
fi
PSQL=(psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q -X)

# Stand-ins for what Supabase provides (auth schema and auth.uid()).
"${PSQL[@]}" <<'SQL'
create schema if not exists auth;
create table if not exists auth.users (id uuid primary key);
create or replace function auth.uid() returns uuid language sql stable as
  $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
SQL

for f in supabase/migrations/*.sql; do
  if grep -q "create extension if not exists vector" "$f" &&
     [[ "$("${PSQL[@]}" -tAc "select count(*) from pg_available_extensions where name = 'vector'")" == "0" ]]; then
    echo "• skipped $f (pgvector not installed locally)"; continue
  fi
  "${PSQL[@]}" -f "$f"; echo "✓ applied $f"
done
"${PSQL[@]}" -f supabase/seed.sql; echo "✓ applied supabase/seed.sql"

"${PSQL[@]}" <<'SQL'
do $$
declare n int;
begin
  select count(*) into n from experiences;
  if n <> 65 then raise exception 'expected 65 experiences, got %', n; end if;

  select count(*) into n from experiences where is_safety_critical(safety_flags);
  if n = 0 then raise exception 'no safety-critical experiences flagged'; end if;

  select count(*) into n from agents;
  if n <> 19 then raise exception 'expected 19 agents, got %', n; end if;

  -- Two-source rule is enforced by the database.
  begin
    insert into candidates (type, proposed_by, signal_ids, draft, reason)
    values ('experience', 'prospector', array[gen_random_uuid()], '{}', 'single-source test');
    raise exception 'two-source rule not enforced';
  exception when check_violation then null;
  end;

  -- Pairings are stored once per unordered pair.
  begin
    insert into pairings (a, b, reason, origin) values ('orcas', 'aurora', 'reversed', 'knowledge');
    raise exception 'pairing order not enforced';
  exception when check_violation then null;
  end;

  -- Events wake listeners and land in the outbox.
  insert into events (type, actor, record_refs) values ('window.changed', 'lane-scout', '{"window_id": "win_aurora_season"}');
  select count(*) into n from events where published_at is null;
  if n <> 1 then raise exception 'event outbox not written'; end if;
end $$;
SQL

# Row-level security: one user cannot see another's lifelist.
"${PSQL[@]}" <<'SQL'
insert into auth.users values ('00000000-0000-0000-0000-00000000000a'), ('00000000-0000-0000-0000-00000000000b');
insert into lifelist_items (user_id, experience_id) values ('00000000-0000-0000-0000-00000000000a', 'eclipse-luxor');
create role app_user nologin;
grant select on lifelist_items to app_user;
set role app_user;
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000b';
do $$ begin
  if (select count(*) from lifelist_items) <> 0 then raise exception 'RLS leak: user b sees user a''s lifelist'; end if;
end $$;
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
do $$ begin
  if (select count(*) from lifelist_items) <> 1 then raise exception 'RLS: user a cannot see own lifelist'; end if;
end $$;
reset role;
SQL
echo "✓ smoke checks passed (counts, two-source rule, pairing order, event outbox, row-level security)"
