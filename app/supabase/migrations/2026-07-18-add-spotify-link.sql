-- Run this once in the Supabase SQL Editor against the live project.
-- Adds the artist's Spotify link, sourced free from Ticketmaster's own
-- attraction data (no separate Spotify API integration) — see
-- 01_Strategy/decisions.md.
alter table shows add column if not exists spotify_url text;
