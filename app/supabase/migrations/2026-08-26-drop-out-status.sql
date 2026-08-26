-- Run this once in the Supabase SQL Editor against the live project.
-- Removes the 'out' ("Can't make it") response status entirely — see
-- 01_Strategy/decisions.md: the shared herd list is being replaced by
-- personal per-member show lists, and with it goes the explicit
-- decline. A responses row now only ever means "I'm in"; there's
-- nothing to fold an 'out' row *into* the way 'going' got folded into
-- 'curious' in the prior migration — per direct decision, existing
-- 'out' rows are just dropped, not preserved anywhere.
--
-- 1. Drop every existing 'out' row outright.
delete from responses where status = 'out';

-- 2. Tighten the check constraint to match. Constraint name is
--    Postgres's default for an unnamed column-level check on this
--    table (table_column_check) — if this errors with "constraint
--    does not exist," run:
--      select conname from pg_constraint where conrelid = 'responses'::regclass;
--    and swap in whatever name it lists instead.
alter table responses drop constraint if exists responses_status_check;
alter table responses add constraint responses_status_check check (status in ('curious'));
