-- Run this once in the Supabase SQL Editor against the live project.
-- Adds a person-chosen avatar color — see 01_Strategy/decisions.md and
-- 02_Product/component-map.md ("Avatar color"). Lets people tell their
-- dots apart at a glance instead of everyone rendering as the same
-- charcoal chip. Defaults to the existing charcoal (#211f1a) so nobody
-- who hasn't picked a color yet changes appearance.
alter table people add column if not exists avatar_color text not null default '#211f1a';
