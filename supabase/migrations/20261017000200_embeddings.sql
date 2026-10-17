-- Semantic search for search_experiences (hybrid with keyword search).
-- Kept separate because pgvector is available on Supabase but not in every local Postgres.
-- Set the dimension to the chosen embedding model before the first deploy.

create extension if not exists vector;

alter table experiences add column embedding vector(1024);
alter table experiences add column search_text tsvector
  generated always as (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(place_label, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(hook, '')), 'C')
  ) stored;

create index experiences_embedding_idx on experiences using hnsw (embedding vector_cosine_ops);
create index experiences_search_idx on experiences using gin (search_text);
