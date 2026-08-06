-- Run this once in the Supabase SQL Editor against the live project.
-- Companion to the dark-mode retheme — see 02_Product/component-map.md
-- and 00_Brand/brand-brief.md. The avatar palette's default color used
-- to be charcoal (#211f1a), which matched the old uniform dot on a
-- light page. Now that the page itself is charcoal, that default is
-- invisible — swapping it for paper (#ebe8e1), which is what
-- AVATAR_COLORS[0] in app/index.html now points to.
alter table people alter column avatar_color set default '#ebe8e1';

-- Backfills anyone who's still sitting on the old default so they
-- don't stay invisible until they happen to open the color picker.
-- Safe to run more than once — only touches rows still at the old
-- value, so it won't clobber anyone who deliberately picked charcoal
-- back when it was still an option (it no longer is).
update people set avatar_color = '#ebe8e1' where avatar_color = '#211f1a';
