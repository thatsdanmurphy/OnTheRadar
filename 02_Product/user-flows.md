# Key User Flows

What the app actually does today, task by task — for sizing up how big this thing is, not as a spec. See `component-map.md` for where each piece lives in code, `MISSION.md` for why any of it exists.

## Getting in (once, per person per browser)

1. Open the link → name gate (a form in front of the page, not a separate screen).
2. **Cold start** (no invite link): enter your name, optionally a group name in the same form → creates your person and, if a group name was given, that first group → straight into the normal app (the separate "you're in, share the link" interstitial that used to sit here was cut — invite/share is always one tap away from the group heading row or drawer anyway).
3. **Invite link** (`?g=<slug>`): enter your name, sees the actual group name named on the gate itself → joins that group directly, no extra step, no group-name field shown at all.

Identity is a cookie, not an account — no email, no password, nothing to recover if the cookie's cleared except reopening an invite link.

## The everyday loop (the actual point of the app)

1. Open the app → land on your current group's shows, one chronological list.
2. See each show's date, title linked to the ticket/event page, venue name linked to the venue's page, and two labeled groups — "Heck yeah!" and "Can't make it" — showing who's in each. There's no separate overlap badge or count; two or more people showing up in "Heck yeah!" *is* the signal.
3. Mark **Curious** or **I'm out** — one tap, writes immediately.
4. Anyone else opening the app sees the same overlap, next load. No push notification — the loop is "open it and look," not "get pinged."

## Adding a show — two ways in, one result

1. **Search by artist** (Ticketmaster, scoped to New England) → tap a result → added immediately, no review step.
2. **Manual entry** — title, date, venue (with autocomplete that silently attaches the venue's page) → Add show. This is the fallback for anything search doesn't cover — small/DIY venues especially — not an apology path.

("Paste a link" — a third method that server-side-scraped a pasted show URL — was cut; Ticketmaster and AXS both blocked the scrape outright, so it only ever worked against venue sites with no bot protection.)

Both write to the same table; nothing distinguishes a manually-entered show from a search-added one afterward.

## Browsing what's there

- **One list**, chronological — the List/Calendar toggle and the separate show-detail page from earlier builds were both cut; everything worth seeing (title, venue, openers, who's curious, who's out) lives right on the card now, tap either avatar group to see the full name list.
- **My Shows** (cross-group, from the drawer): every show, across every group you're in, that you've personally marked curious — not scoped to whichever group is currently open.

## Group management

- Switch groups from the drawer's group list.
- Start a new group from the same drawer (`+ Add a herd`).
- Invite a friend — Share icon in the group heading row, or Invite inside the group modal, or a per-group share icon in the drawer — all three copy the same link.
- Open the group modal (View) to see the member list, rename the herd (pencil next to the name), or leave it.

## Deleting a show

- Only the person who added a show can remove it — a trash icon in the top-right corner of the card, shown only to them.
- Confirms via a native browser prompt before deleting; no undo.

## What's not built (worth naming honestly, for sizing this up)

- No editing a show once it's added (deleting is now possible — see above — but not correcting a typo or wrong date).
- No removing a *different* member from a group (only leaving yourself is possible), and no confirmation beyond one `window.confirm()` if leaving leaves you with zero groups.
- No account recovery beyond "still have the invite link."
- No notifications of any kind — overlap is only visible to someone who opens the app.
- No profile or settings screen for a person (name/color live in the drawer, not a dedicated screen).
- No history of past shows the group's actually gone to (raised as a later idea in `MISSION.md`).

That's the whole surface area right now: one loop (add → mark curious/out → see overlap), two ways into it, one view of it, plus light group and identity management. Small on purpose — worth checking this list before adding anything new, since most of what would make it "bigger" (editing a show's details, notifications, history, member removal) is a deliberate absence, not an oversight.
