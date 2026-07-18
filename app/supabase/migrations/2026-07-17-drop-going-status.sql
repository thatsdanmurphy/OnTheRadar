-- Run this once in the Supabase SQL Editor against the live project.
-- Cuts the 'going' ("Got tickets") response state down to just
-- curious/out — see 01_Strategy/decisions.md for why.
--
-- 1. Folds any existing 'going' responses into 'curious' rather than
--    dropping them — someone who'd marked "got tickets" is still
--    interested, which is exactly what 'curious' means now that
--    there's no separate purchase-status tier.
update responses set status = 'curious' where status = 'going';

-- 2. Tightens the check constraint to match. The constraint name here
--    is Postgres's default for an unnamed column-level check on this
--    table (table_column_check) — if this errors with "constraint
--    does not exist," run:
--      select conname from pg_constraint where conrelid = 'responses'::regclass;
--    and swap in whatever name it lists instead.
alter table responses drop constraint if exists responses_status_check;
alter table responses add constraint responses_status_check check (status in ('curious', 'out'));
