-- Lifelist Experience Graph, Phase 1.
-- See docs/architecture/graph.md. Stable experience definitions are loaded from
-- graph/experiences/*.yaml (ADR 0004); everything else here is volatile or operational.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type lane as enum ('sky', 'earth', 'wild', 'edge', 'sport', 'endure', 'fest');
create type scarcity_type as enum ('once', 'event', 'lottery', 'permit_cap', 'capacity', 'season', 'natural');
create type experience_status as enum ('live', 'paused', 'retired');
create type traveller_segment as enum ('affluent', 'young', 'nri');
create type visa_effort as enum ('none', 'low', 'medium', 'high');
create type confidence as enum ('certain', 'high', 'medium', 'low');
create type freshness_class as enum ('fixed', 'seasonal', 'rule', 'price', 'availability', 'forecast');
create type constraint_kind as enum ('visa', 'age', 'fitness', 'gear', 'permit');
create type offer_status as enum ('active', 'sold_out', 'paused');
create type pairing_origin as enum ('knowledge', 'mined');
create type signal_source as enum (
  'first_party', 'google_trends', 'instagram', 'meta_ai', 'youtube', 'wikipedia', 'reddit',
  'news', 'world_change', 'lane_scout', 'concierge'
);
create type evidence_strength as enum ('measured', 'lead');
create type candidate_type as enum (
  'experience', 'twin', 'offer', 'pairing', 'angle', 'constraint_update', 'window_update'
);
create type candidate_status as enum (
  'proposed', 'verified', 'failed', 'approved', 'rejected', 'live', 'retired'
);
create type lifelist_stage as enum ('dreaming', 'feasible', 'saving', 'booked', 'done');
create type autonomy_level as enum ('L0', 'L1', 'L2', 'L3');
create type desk as enum ('discovery', 'curation', 'service', 'engagement', 'operations');
create type model_tier as enum ('none', 'small', 'mid', 'large');

-- ---------------------------------------------------------------------------
-- Provenance and freshness
-- ---------------------------------------------------------------------------
create table source_snapshots (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  fetched_at timestamptz not null default now(),
  http_status int,
  content_sha256 text not null,
  storage_path text,                       -- object storage key for the stored copy
  unique (url, content_sha256)
);

create table freshness_limits (
  class freshness_class primary key,
  max_age interval,                        -- null = never expires
  near_window_max_age interval             -- tighter limit within 30 days of a window
);

insert into freshness_limits (class, max_age, near_window_max_age) values
  ('fixed', null, null),
  ('seasonal', interval '180 days', null),
  ('rule', interval '30 days', null),
  ('price', interval '24 hours', null),
  ('availability', interval '24 hours', interval '1 hour'),
  ('forecast', interval '3 hours', null);

-- ---------------------------------------------------------------------------
-- Experience Graph
-- ---------------------------------------------------------------------------
create table experiences (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  lane lane not null,
  hook text not null,
  place_label text not null,
  countries char(2)[] not null check (cardinality(countries) > 0),
  season_months smallint[] not null default '{}'
    check (season_months <@ array[1,2,3,4,5,6,7,8,9,10,11,12]::smallint[]),
  window_note text,
  scarcity scarcity_type not null,
  scarcity_note text,
  lead_time_note text,
  budget_band smallint not null check (budget_band between 1 and 4),
  segments traveller_segment[] not null default '{}',
  safety_flags text[] not null default '{}',
  twin_of text references experiences (id),
  status experience_status not null default 'live',
  rarity_score numeric(4, 3) check (rarity_score between 0 and 1),
  definition_sha256 text not null,         -- hash of the YAML file it was loaded from
  loaded_at timestamptz not null default now()
);

create index experiences_lane_idx on experiences (lane) where status = 'live';
create index experiences_months_idx on experiences using gin (season_months);

-- True when any flag puts the experience in a category the autonomy ladder never
-- lets agents publish without a human (ADR 0002).
create function is_safety_critical(flags text[]) returns boolean
language sql immutable as $$
  select flags && array['altitude', 'polar', 'open_water', 'wildlife_on_foot',
                        'extreme_heat', 'extreme_cold', 'age_or_fitness_limit']
$$;

-- Columns every volatile fact carries.
-- source_url, snapshot_id, checked_at, verified_by, confidence, freshness

create table windows (
  id text primary key,
  experience_id text not null references experiences (id) on delete cascade,
  months smallint[] not null default '{}',
  starts_on date,
  ends_on date,
  probability numeric(4, 3) check (probability between 0 and 1),
  note text,
  source_url text not null,
  snapshot_id uuid references source_snapshots (id),
  checked_at timestamptz not null,
  verified_by text not null,
  confidence confidence not null,
  freshness freshness_class not null,
  check (ends_on is null or starts_on is null or ends_on >= starts_on)
);
create index windows_experience_idx on windows (experience_id, starts_on);

create table visa_constraints (
  id text primary key,
  passport char(2) not null default 'IN',
  country char(2) not null,
  consulate text,                          -- null = any consulate
  effort visa_effort not null,
  lead_time_days int check (lead_time_days >= 0),
  refusal_rate numeric(4, 3) check (refusal_rate between 0 and 1),
  note text,
  source_url text not null,
  snapshot_id uuid references source_snapshots (id),
  checked_at timestamptz not null,
  verified_by text not null,
  confidence confidence not null,
  freshness freshness_class not null default 'rule',
  unique nulls not distinct (passport, country, consulate)
);

create table experience_constraints (
  id text primary key,
  experience_id text not null references experiences (id) on delete cascade,
  kind constraint_kind not null check (kind <> 'visa'),
  value jsonb not null,                    -- e.g. {"min_age": 18, "max_age": 70}
  note text,
  source_url text not null,
  snapshot_id uuid references source_snapshots (id),
  checked_at timestamptz not null,
  verified_by text not null,
  confidence confidence not null,
  freshness freshness_class not null default 'rule'
);

create table offers (
  id text primary key,
  experience_id text not null references experiences (id) on delete cascade,
  operator text not null,
  partner_tier char(1) check (partner_tier in ('A', 'B', 'C', 'D')),
  price_band smallint check (price_band between 1 and 4),
  price_min_inr int check (price_min_inr >= 0),
  price_max_inr int check (price_max_inr >= price_min_inr),
  inclusions text,
  booking_url text,
  commission_pct numeric(5, 2),            -- never used in ranking
  accepts_indian_travellers boolean,
  status offer_status not null default 'active',
  source_url text not null,
  snapshot_id uuid references source_snapshots (id),
  checked_at timestamptz not null,
  verified_by text not null,
  confidence confidence not null,
  freshness freshness_class not null default 'price'
);
create index offers_experience_idx on offers (experience_id) where status = 'active';

create table pairings (
  a text not null references experiences (id) on delete cascade,
  b text not null references experiences (id) on delete cascade,
  reason text not null,
  origin pairing_origin not null,
  distance_km int,
  window_gap_days int,
  lift numeric(6, 3),
  support int,
  created_at timestamptz not null default now(),
  primary key (a, b),
  check (a < b)                            -- one row per unordered pair
);

-- ---------------------------------------------------------------------------
-- Demand loop
-- ---------------------------------------------------------------------------
create table signals (
  id uuid primary key default gen_random_uuid(),
  source signal_source not null,
  evidence_strength evidence_strength not null,
  topic text not null,
  experience_ids text[] not null default '{}',
  filters jsonb not null default '{}',     -- passport, home city or state, month, budget band, language
  volume numeric,
  velocity numeric,                        -- 7-day vs 28-day baseline
  distinct_actors int,
  evidence jsonb not null default '[]',    -- links and record ids; never copies of posts
  flags text[] not null default '{}',      -- suspect, below_k
  created_at timestamptz not null default now(),
  strengthened_at timestamptz,
  expires_at timestamptz not null default now() + interval '21 days'
);
create index signals_open_idx on signals (expires_at);

-- Pulse writes first-party signals only above the k-anonymity threshold.
create function signal_visible(s signals) returns boolean
language sql stable as $$
  select s.source <> 'first_party' or coalesce(s.distinct_actors, 0) >= 10
$$;

create table candidates (
  id uuid primary key default gen_random_uuid(),
  type candidate_type not null,
  proposed_by text not null,               -- agent id
  run_id uuid,
  signal_ids uuid[] not null default '{}',
  target_id text,                          -- record changed, for updates
  draft jsonb not null,
  score numeric(5, 4),
  expected_value numeric,
  reason text not null check (length(reason) <= 280),
  safety_critical boolean not null default false,
  status candidate_status not null default 'proposed',
  verifier_notes text,
  decided_by text,
  decided_at timestamptz,
  decision_reason text,
  created_at timestamptz not null default now(),
  -- Two-source rule: new experiences and twins need at least two supporting signals.
  check (type not in ('experience', 'twin') or cardinality(signal_ids) >= 2),
  check ((status in ('approved', 'rejected')) = (decided_at is not null) or status in ('live', 'retired'))
);
create index candidates_queue_idx on candidates (status, expected_value desc);

create table demand_daily (
  experience_id text not null references experiences (id) on delete cascade,
  day date not null,
  channel text not null check (channel ~ '^(web|whatsapp|email|mcp:[a-z0-9_.-]+|a2a:[a-z0-9_.-]+)$'),
  views int not null default 0,
  saves int not null default 0,
  feasibility_checks int not null default 0,
  compositions int not null default 0,
  handoff_clicks int not null default 0,
  booked int not null default 0,
  done int not null default 0,
  requests int not null default 0,
  primary key (experience_id, day, channel)
);

create table experience_requests (
  id text primary key default 'rq_' || replace(gen_random_uuid()::text, '-', ''),
  description text not null check (length(description) between 10 and 1000),
  constraints jsonb not null default '{}',
  channel text not null,
  user_id uuid references auth.users (id) on delete set null,
  notify_when_added boolean not null default false,
  idempotency_key text not null unique,
  status text not null default 'open' check (status in ('open', 'matched', 'declined')),
  matched_experience_id text references experiences (id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- People: lifelists and watches (Supabase auth)
-- ---------------------------------------------------------------------------
create table lifelist_items (
  user_id uuid not null references auth.users (id) on delete cascade,
  experience_id text not null references experiences (id),
  stage lifelist_stage not null default 'dreaming',
  target_year smallint,
  saved_at timestamptz not null default now(),
  stage_changed_at timestamptz not null default now(),
  primary key (user_id, experience_id)
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  agent_client text,                       -- for agent subscribers (webhook or A2A push)
  experience_id text references experiences (id) on delete cascade,
  triggers text[] not null check (cardinality(triggers) > 0),
  delivery jsonb not null,                 -- {"channel": "whatsapp"} or {"webhook": "https://…"}
  cooldown interval not null default interval '7 days',
  created_at timestamptz not null default now(),
  check ((user_id is null) <> (agent_client is null))
);

alter table lifelist_items enable row level security;
alter table subscriptions enable row level security;
alter table experience_requests enable row level security;

create policy lifelist_owner on lifelist_items
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy subscriptions_owner on subscriptions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy requests_owner_read on experience_requests
  for select using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Events, audit and agents
-- ---------------------------------------------------------------------------
create table events (
  id bigint generated always as identity primary key,
  type text not null check (type ~ '^[a-z_]+\.[a-z_]+$'),
  occurred_at timestamptz not null default now(),
  actor text not null,                     -- agent id, 'user:<uuid>' or 'partner:<id>'
  run_id uuid,
  trace_id text,
  record_refs jsonb not null default '{}', -- ids only, never outside free text
  payload jsonb not null default '{}',
  published_at timestamptz                 -- null until the dispatcher hands it on
);
create index events_unpublished_idx on events (id) where published_at is null;

-- Wake consumers (Postgres LISTEN/NOTIFY) when an event is written in a transaction.
create function notify_event() returns trigger
language plpgsql as $$
begin
  perform pg_notify('lifelist_events', new.id::text);
  return new;
end
$$;
create trigger events_notify after insert on events for each row execute function notify_event();

create table audit_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  actor text not null,
  action text not null,
  table_name text not null,
  record_id text not null,
  idempotency_key text unique,
  run_id uuid,
  trace_id text,
  before jsonb,
  after jsonb
);

create table agents (
  id text primary key,
  desk desk not null,
  model_tier model_tier not null,
  daily_budget_inr numeric(8, 2) not null check (daily_budget_inr >= 0),
  reads_untrusted_content boolean not null default false,  -- airlock applies
  paused boolean not null default false,
  paused_reason text,
  check (not paused or paused_reason is not null)
);

create table agent_autonomy (
  agent_id text not null references agents (id),
  category text not null,                  -- e.g. 'lane:sky', 'pairings', 'facts:price'
  level autonomy_level not null default 'L0',
  granted_by text not null,
  granted_at timestamptz not null default now(),
  primary key (agent_id, category)
);

create table agent_spend (
  agent_id text not null references agents (id),
  day date not null,
  spend_inr numeric(10, 2) not null default 0,
  runs int not null default 0,
  primary key (agent_id, day)
);

create table escalations (
  id uuid primary key default gen_random_uuid(),
  raised_by text not null,
  kind text not null check (kind in ('concierge', 'contradiction', 'safety', 'budget', 'source_access', 'other')),
  summary text not null,
  record_refs jsonb not null default '{}',
  priority smallint not null default 2 check (priority between 1 and 3),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolution text
);

-- The editor-in-chief's daily queue: open escalations first, then contradictions,
-- then verified candidates by expected value. The digest takes the top 20.
create view review_queue as
  select 'escalation' as item_kind, e.id::text as item_id, e.summary as title,
         e.priority as priority, null::numeric as expected_value, e.created_at
  from escalations e
  where e.resolved_at is null
  union all
  select 'candidate', c.id::text, c.type || ': ' || c.reason,
         case when c.safety_critical then 2 else 3 end, c.expected_value, c.created_at
  from candidates c
  where c.status = 'verified';

-- Starting roster, desks, tiers and daily caps from docs/agents/README.md.
insert into agents (id, desk, model_tier, daily_budget_inr, reads_untrusted_content) values
  ('pulse', 'discovery', 'small', 10, false),
  ('trend-scout', 'discovery', 'small', 45, true),
  ('world-change-scout', 'discovery', 'small', 25, true),
  ('lane-scout', 'discovery', 'small', 35, true),
  ('prospector', 'discovery', 'mid', 45, false),
  ('pairing-miner', 'discovery', 'mid', 15, false),
  ('verifier', 'curation', 'small', 50, false),
  ('editor', 'curation', 'mid', 25, false),
  ('curator', 'curation', 'mid', 15, false),
  ('experimenter', 'curation', 'none', 10, false),
  ('orchestrator', 'service', 'mid', 30, false),
  ('feasibility', 'service', 'mid', 20, false),
  ('composer', 'service', 'mid', 40, false),
  ('booker', 'service', 'none', 10, false),
  ('watcher', 'engagement', 'none', 0, false),
  ('nudge', 'engagement', 'mid', 20, false),
  ('concierge-desk', 'engagement', 'small', 30, true),
  ('night-manager', 'operations', 'mid', 15, false),
  ('partner-ops', 'operations', 'mid', 10, false);

-- Launch autonomy (ADR 0002): L1 refreshes for the Verifier, Lane Scouts and Editor; L0 otherwise.
insert into agent_autonomy (agent_id, category, level, granted_by) values
  ('verifier', 'facts:refresh', 'L1', 'adr-0002'),
  ('lane-scout', 'facts:refresh', 'L1', 'adr-0002'),
  ('editor', 'pages:refresh', 'L1', 'adr-0002');
