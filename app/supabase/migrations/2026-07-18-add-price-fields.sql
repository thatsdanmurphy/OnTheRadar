-- Run this once in the Supabase SQL Editor against the live project.
-- Adds price fields to shows, for the detail-page price + Buy tickets
-- button — see 01_Strategy/decisions.md.
alter table shows add column if not exists price_min numeric;
alter table shows add column if not exists price_max numeric;
alter table shows add column if not exists price_currency text;
