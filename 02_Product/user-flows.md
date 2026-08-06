# Key User Flows

What the app actually does today, task by task — for sizing up how big this thing is, not as a spec. See `component-map.md` for where each piece lives in code, `MISSION.md` for why any of it exists.

## Getting in (once, per person per browser)

1. Open the link → name gate (a form in front of the page, not a separate screen).
2. **Cold start** (no invite link): enter your name, optionally a group name in the same form → creates your person and, if a group name was given, that first group → lands on a share screen with two real actions, "Copy invite link" and "+ Add first show" (skipping is there too, just quieter).
3. **Invite link** (`?g=<slug>`): enter your name → joins that group directly, no extra step, no group-name field shown at all.

Identity is a cookie, not an account — no email, no password, nothing to recover if the cookie's cleared except reopening an invite link.

## The everyday loop (the actual point of the app)

1. Open the app → land on your current group's shows, List or Calendar.
2. See each show's date, an overlap badge once 2+ people are curious, title linked to the ticket/event page, venue name linked to the venue's page, who else is curious.
3. Mark **Curious** or **I'm out** — one tap, writes immediately.
4. Anyone else opening the app sees the same overlap, next load. No push notification — the loop is "open it and look," not "get pinged."

## Adding a show — three ways in, one result

1. **Search by artist** (Ticketmaster, scoped to New England) → tap a result → added immediately, no review step.
2. **Paste a link** → server-side scrape (title/date/venue/price if the page has structured data) → added immediately if it found a title + date, otherwise drops into the manual form with whatever it did find pre-filled.
3. **Manual entry** — title, date, venue (with autocomplete that silently attaches the venue's page) → Add show.

All three write to the same table; nothing distinguishes a manually-entered show from an auto-filled one afterward.

## Browsing what's there

- **List**: chronological, overlap badge on anything with 2+ curious.
- **Calendar**: month grid, days with a show tinted pink, a colored dot + time per show (title doesn't fit the cell), tap a day's show to open its detail page.
- **Show detail**: the full card — title, venue, openers if known, who's curious, price if Ticketmaster or the linked page had it, a Buy tickets button, a Spotify link if the artist has one on Ticketmaster.

## Group management

- Switch groups from the header dropdown.
- Start a new group from the same dropdown (`+ New group`).
- Invite a friend — a quiet link on the main page itself (not buried in the group menu), always scoped to whichever group is on screen.

## What's not built (worth naming honestly, for sizing this up)

- No editing or deleting a show once it's added.
- No leaving a group, no removing a member, no group settings at all.
- No account recovery beyond "still have the invite link."
- No notifications of any kind — overlap is only visible to someone who opens the app.
- No profile or settings screen for a person.
- No history of past shows the group's actually gone to (raised as a later idea in `MISSION.md`).

That's the whole surface area right now: one loop (add → mark curious/out → see overlap), three ways into it, two views of it, and almost nothing else. Small on purpose — worth checking this list before adding anything new, since most of what would make it "bigger" (editing, notifications, history, group settings) is a deliberate absence, not an oversight.
