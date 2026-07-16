# On the Radar — project brief

A friend-group concert board. Everyone adds shows they're curious about, even ones nobody else has heard of. When two or more people land on the same show, it surfaces — solving the actual problem (not that concert-planning apps don't exist, but that friends with different taste never see each other's shows).

## Why this doesn't already exist
Checked Spotify (has a "find gig buddies" feature request, unbuilt), Bandsintown (friend-attendance layer, but artist-tracking first), and stranger-matching apps like EventBuddie/Muse (solve companion-finding, not friend-group overlap). Nothing does "surface overlap within a group I already know" as the core mechanic.

## What's built (prototype: `app/on-the-radar.html`)
- **List views**: Upcoming (by date) and Most overlap (by interest count)
- **Calendar view**: month grid, fixed-height uniform cells, overflow collapses to "+N more"
- **Response states per person, per show**: I'm curious / Got tickets / I'm out — only curious+going count toward the overlap indicator
- **Showtimes, openers, and double-shows**: times display next to the date, opening acts shown under the headliner, multiple set times supported
- **Real venue links**: venue names link out to the venue's actual event calendar (verified for 7 real Boston/Cambridge venues)
- **Link autofill (mocked)**: paste a link, it "reads" the page and fills in the fields — simulated for two sample URLs. A real version needs a backend to fetch the page server-side and parse Open Graph / event schema tags (same approach as iMessage/Slack link previews); a static page can't do this itself due to CORS.
- **Click-to-expand avatars**: dots expand to a plain name list, both in the header (whole crew) and per-card (who's interested)
- Visual direction: ticket-stub / marquee identity, kept deliberately flat — no gradients, no glow/animation, thin shadows only

## Open questions for the project to resolve
1. **Where does this live?** Standalone site, or a bot that posts into an existing group chat when overlap happens?
2. **Unit of the board.** One friend group, or does it need to flex to multiple non-overlapping groups (e.g. a hockey crew and a work-friends group with zero taste overlap)?
3. **Real link-autofill.** Needs a lightweight backend (fetch + parse Open Graph/JSON-LD). Worth scoping as the first real infrastructure decision.
4. **Ticketing integration?** Right now this only tracks interest — does it ever link through to actual purchase, or stay intentionally separate from ticketing?

## Suggested project instructions (paste into "Set project instructions")
> You're helping me build "On the Radar," a concert-planning app for a friend group. The core mechanic: everyone adds shows they're curious about, and when 2+ friends want the same show, it surfaces automatically — solving the problem that friends with different music taste never see each other's shows. Keep visual style flat and minimal: no gradients, no glow/pulse animation, thin shadows only, ticket-stub/marquee identity established in the prototype. Build as vanilla HTML/CSS/JS artifacts I can open directly — show working prototypes rather than describing changes, and iterate fast based on my reactions rather than asking a lot of clarifying questions upfront.
