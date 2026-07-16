-- ============================================================
-- On the Radar — Supabase schema
-- Paste this whole file into the Supabase SQL Editor and run it.
-- Creates 5 tables matching the identity decision in
-- 01_Strategy/decisions.md: no accounts, unguessable slugs + cookie.
-- ============================================================

create extension if not exists pgcrypto;

-- One row per person, identified by an unguessable slug.
-- No password, no email. A cookie on the person's browser stores
-- this slug so they don't have to re-enter a name every visit.
create table people (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null default encode(gen_random_bytes(12), 'hex'),
  display_name text not null,
  created_at timestamptz not null default now()
);

-- One row per friend group, identified by an unguessable invite slug.
-- Sharing the slug (as a link) is how someone gets added to a group.
create table groups (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null default encode(gen_random_bytes(12), 'hex'),
  name text not null,
  created_at timestamptz not null default now()
);

-- Links a person to a group. A person can belong to more than one
-- (see the multi-group open question, resolved in the decision log).
create table memberships (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  person_id uuid not null references people(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (group_id, person_id)
);

-- One row per show, scoped to a group.
create table shows (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  title text not null,
  venue_name text,
  venue_url text,
  show_date date not null,
  show_time time,
  openers text,
  source_url text,
  created_by uuid references people(id),
  created_at timestamptz not null default now()
);

-- One row per person per show: curious / going / out.
-- Only curious + going count toward the overlap indicator (app logic,
-- not enforced here) — see the response-states decision.
create table responses (
  id uuid primary key default gen_random_uuid(),
  show_id uuid not null references shows(id) on delete cascade,
  person_id uuid not null references people(id) on delete cascade,
  status text not null check (status in ('curious', 'going', 'out')),
  updated_at timestamptz not null default now(),
  unique (show_id, person_id)
);

-- Indexes for the actual query patterns the app will run.
create index idx_memberships_person on memberships(person_id);
create index idx_memberships_group on memberships(group_id);
create index idx_shows_group on shows(group_id);
create index idx_responses_show on responses(show_id);
create index idx_responses_person on responses(person_id);

-- ============================================================
-- Row Level Security
-- No Supabase Auth session exists (identity is the slug/cookie
-- model, not auth.uid()), so these policies are intentionally
-- open: anyone holding the anon public key can read/write any row.
-- Real access control comes from slugs being unguessable, the same
-- way a shared Google Doc link works — not from RLS row checks.
-- Fine for a v1 friend-group tool; revisit if this ever needs to
-- resist a determined stranger, not just casual guessing.
-- ============================================================

alter table people enable row level security;
alter table groups enable row level security;
alter table memberships enable row level security;
alter table shows enable row level security;
alter table responses enable row level security;

create policy "open access" on people for all using (true) with check (true);
create policy "open access" on groups for all using (true) with check (true);
create policy "open access" on memberships for all using (true) with check (true);
create policy "open access" on shows for all using (true) with check (true);
create policy "open access" on responses for all using (true) with check (true);
