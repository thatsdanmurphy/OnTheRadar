# Component Map

## Layout & Grid
Source: `app/styles/tokens.css`, `app/styles/grid.css`. Preview/vet at `app/frame.html`.

**Spacing scale** (also drives type line-height): 0, 4, 8, 16, 24, 32, 40, 48, 56, 64, 72. 4px is the only fine-adjustment step; everything above it moves in 8s.

**Grid:** 4 columns mobile, 8 tablet, 12 desktop (Material's standard layout-grid split — these three counts share clean factors, so half/quarter spans divide evenly everywhere; thirds only divide evenly at 12, so treat thirds as desktop-only).
- Mobile (< 600px): 4 columns, margin 16px, gutter 16px
- Tablet (600–1023px): 8 columns, margin 24px, gutter 16px
- Desktop (≥ 1024px): 12 columns, margin 32px, gutter 24px, content capped at 1200px max-width (centers on larger screens)

Because column count itself changes per breakpoint, spans are semantic classes, not fixed numbers: `.col-full`, `.col-half`, `.col-quarter`, `.col-third` (desktop-only, falls back to full width below 1024px). Each carries its own correct span at every breakpoint — e.g. `.col-half` is 2/4 → 4/8 → 6/12.

**Type scale:** five sizes, three faces, line-heights pulled from the spacing scale so type rhythm and layout rhythm are the same rhythm.
| Size | Line-height | Font | Use |
|---|---|---|---|
| 12 | 16 | Space Mono (data) | timestamps, counts, meta labels |
| 16 | 24 | System sans (body) | default reading size |
| 20 | 24 | System sans, semibold (body) | card titles |
| 24 | 32 | Archivo Black (display) | section headings |
| 40 | 48 | Archivo Black (display) | hero numbers, page title |

**Measure rule:** body copy targets 60–75 characters per line. On desktop, full-width (12 columns) runs too long — `.col-half` lands closer to the right measure. Use `.prose` (max-width: 65ch) alongside it for any real paragraph so the cap holds regardless of column width.

**Discipline:** every color, spacing, and type value in a component should reference a token from `tokens.css` (`var(--...)`). If a value doesn't exist as a token and needs to be reusable, add it to `tokens.css` first rather than hardcoding — flag it here when that happens so the scale stays intentional, not sprawling.

## Pages
- **On the Radar — real app shell** (`app/index.html`) — the page being built up component by component on the frame. Currently: header nav + body container (show list). Footer is next.
- On the Radar — original prototype (`app/on-the-radar.html`) — kept as reference; the mocked interactivity (list/calendar views, response states) it demonstrates gets rebuilt as real components on the frame rather than ported as-is.

## Components
- **Name gate** (`app/index.html`, logic in `app/scripts/identity.js`) — the whole "onboarding" surface, and deliberately not a splash page: when a browser has no `otr_person_id` cookie, the header and main content stay hidden and a centered box shows instead (`.name-gate-center`, flex-centered both axes, `.name-gate-box` capped at 400px — same treatment for every step below). Replaces the old `window.prompt()`.
  - **Two paths, one tagline, decided once at load** by whether `?g=<slug>` is in the URL (checked before `handleGroupJoinFromUrl` strips it): the tagline ("Line up shows with your pals") is the same either way. An invite-link visitor just enters their name and goes straight in. A cold-start visitor (no link) gets a second field in the same form — Group name — so person + first group get created together in one submit, followed by a share nudge ("Copy invite link" / "Continue") right after — the moment an invite link is most worth putting in front of someone, since the group is otherwise empty.
  - **Joining a group via invite link**: `OTR.getGroupBySlug` + `OTR.joinGroup` add the person to that group and land them in it — works both for a brand-new person (right after the name gate) and a returning one opening a friend's link for a group they're not in yet. The URL param gets cleaned up after processing so a refresh doesn't reprocess it. This is the join mechanism, full stop — no separate "invite code" concept, the slug just lives in a shareable link instead of something typed in, since sharing happens over text/iMessage where a tappable link beats a typed code.
- **Header nav** (`app/index.html`, logic in `app/scripts/identity.js`, styles in `app/styles/components.css`) — wordmark, group switcher, crew avatar stack. Built and wired to Supabase — no more mock data.
  - Wordmark: links home, Archivo Black, head size.
  - Group switcher: shows the person's current group, click opens a menu listing all their groups (`getMyGroups`) + "Copy invite link" (builds `<origin><path>?g=<slug>` for whichever group is current, copies via the Clipboard API with a `window.prompt` fallback for non-secure contexts like `file://`) + "New group" (`createGroup`, inserts a group + membership). Empty state: "No groups yet" when the person has none.
  - Avatar stack: overlapping initials dots for the current group's members (`getGroupMembers`), click-to-expand into a plain name list. Same pattern reused from the original prototype's header avatar stack.
  - Not yet built: switching which group is "current" doesn't persist across a reload (always defaults to the first group returned, or whichever group an invite link just added them to).
- **Show card** (`app/index.html`, logic in `app/scripts/shows.js`, styles in `app/styles/components.css`) — vertical card: date + overlap badge, title, venue (linked out), openers, who's-in avatar stack, response segmented control. Built and wired to Supabase.
  - Renders inside: show list (built) — Calendar view and "Most overlap" sort not yet built, this is the "Upcoming" list only, sorted by `show_date` ascending.
  - Response control: two buttons (Curious / I'm out) in one bordered segmented group, not floating pills — "Got tickets" was cut (see decision log: ticket-buying logistics are a group's own off-platform conversation, not something this app should try to model). Click writes straight to `responses` via `setResponse` (upsert on `show_id, person_id`), then the whole view re-renders (list, calendar, or detail — whichever's showing). Active button (filled black) reflects the current person's own response.
  - **Card state:** when the current person's own response is "out," the whole card drops to 50% opacity (`.is-out`) rather than styling the button differently — the dimming itself is the "you've deprioritized this" signal.
  - Overlap badge: filled block (accent bg, not just colored text) so it reads as a marker, not a label. Only shows when 2+ people are curious (`overlapCount` — out never counts), per the response-states decision.
  - Who's-in avatar stack: reuses the same click-to-expand pattern as the header's crew avatars, built via a shared `buildAvatarStack(people)` helper — one closure-scoped instance per card, so multiple stacks on the page don't collide. Only shows people marked curious; hidden entirely if nobody's in yet.
  - Not yet built: editing/deleting a show.
- **Add show panel** (`app/index.html`, logic in `app/scripts/shows.js`, Edge Functions in `app/supabase/functions/`) — three entry methods. Search and link autofill add the show directly and skip the review form entirely when they return a usable title + date; the form only appears for plain manual entry or when autofill comes back incomplete. Manual fields are trimmed to title (required), date (required), and venue name — no time, no visible venue-link field, no openers field.
  - **Method 1 — artist search** (default/primary): `OTR.searchShows(keyword)` calls the `search-tickets` Edge Function, which queries Ticketmaster's Discovery API across New England (MA/CT/RI/NH/VT/ME — six requests, one per state, rather than gambling on undocumented multi-state syntax) and returns a clickable results list. Clicking a result calls `submitShowDirectly` — creates the show immediately, no form shown.
  - **Method 2 — paste a link**: `OTR.parseShowLink(url)` calls the `parse-show-link` Edge Function, which fetches the URL server-side (sidesteps the browser's CORS wall) and parses JSON-LD `Event` schema first, Open Graph tags as fallback. Known dead end: Ticketmaster and AXS both block this outright (tested directly against real event URLs, confirmed empty) — works best for venue sites without bot protection. A result with both a title and date submits directly like search does; anything less falls back to the manual form pre-filled with whatever was found.
  - **Method 3 — add manually**: skips straight to the blank form.
  - **Venue autocomplete**: typing 3+ characters into the Venue field debounces a call to `OTR.searchVenues(keyword)` (new `search-venues` Edge Function, same Ticketmaster-venues-by-New-England-state pattern as search-tickets, reuses the same `TICKETMASTER_API_KEY` secret). Picking a suggestion sets the venue name and silently stores its venue link in a script-scoped `selectedVenueUrl` variable — there's no visible link field for it to appear in; it just rides along into `createShow`.
  - Coverage tradeoff, worth remembering: Ticketmaster/Live Nation controls ~80% of *major* concert venues' primary ticketing, but that skews toward arenas/amphitheaters — small clubs and dive bars (the venues this app is actually about) are much less likely to be covered by either method, which is why manual entry stays a first-class path, not an apology.
  - Plain bordered inputs, no styling framework — `.form-row`/`.btn-solid`/`.btn-outline`/`.inline-input-row`/`.link-btn`/`.search-results` are reusable primitives in `components.css` now, not one-offs.
  - Not yet built: editing/deleting a show; joining an *existing* group via invite link (mirrors the header nav gap).
- **List/Calendar toggle** (`app/index.html`, styles in `app/styles/components.css`) — segmented control (same visual pattern as the show-card response control) above the show list. Both views render from one shared fetch (`loadGroupData` → `renderCurrentView` dispatches to `renderListView` or `renderCalendarView`) so they can't drift out of sync with each other.
  - **List**: card-based "Upcoming" view. Each card now ends with a "View details" link opening the show detail page (see below) — title/venue links still jump straight to their external pages as before, this is a separate affordance for more detail without leaving the app.
  - **Calendar**: a month grid (single-letter weekday columns, prev/next navigation, defaults to the real current month). Fixed-height uniform cells (not min-height) so rows never stretch unevenly; shrinks further below the 600px breakpoint so 7 columns stay legible on a phone. Each show renders as a small pink dot + time (falls back to title text if no time is set) — Google/Apple-calendar style, not full title text, since a cell this size can't hold it. Bold when overlap ≥ 2. Caps at 2 visible entries per day with a plain "+N more" label beyond that (not yet interactive — fine at friend-group scale). Tapping a bubble opens the show detail page.
  - Not yet built: no "most overlap" sort on the list view; calendar doesn't jump to the month of the nearest upcoming show on first load, always starts at today's month; "+N more" doesn't do anything yet if a day is ever that crowded.
- **Show detail page** (`app/index.html`) — reached via "View details" on a list card or by tapping a calendar bubble; the door calendar cells needed since they're too small to hold a full response control. Shows the same title/venue/openers/avatars/response-control block as a list card, built from a shared `renderShowInteractiveBody()` helper used by both surfaces so they can't drift apart. A plain "‹ Back" link returns to whichever view (list or calendar) was showing before.
  - Not yet built: no direct/shareable URL for a single show (unlike the group invite link, opening a show detail doesn't change the URL) — revisit if that turns out to matter.
- Avatar stack (click-to-expand) — dots that expand to a plain name list. One shared implementation (`buildAvatarStack`) used in both the header (whole crew) and every show card (who's interested) — built in both places now.

## Data Flow
Real data end to end now. `renderShowList(groupId)` fetches shows for the current group, then all responses for those shows in one query (`getResponsesForShows`), grouped client-side by `show_id`. Clicking a response button writes to Supabase and re-fetches the whole list rather than patching state locally — simplest thing that works at this scale, revisit if the group's show count grows enough that a full re-fetch per click feels slow.

## State
- View mode (Upcoming / Most overlap / Calendar): local state — only "Upcoming" exists so far, no toggle yet
- Show list + per-person responses: real data from Supabase, re-fetched on every response click (built)
- Expanded/collapsed avatar lists and group menu: local state, per-instance (built, in header nav)
- Person identity: `otr_person_id` cookie, backed by a real `people` row in Supabase (built)
- Current group, list of joined groups: real data from Supabase (`memberships` joined to `groups`/`people`) — no more mock data
- Open question resolved: multiple non-overlapping friend groups are supported — a person can belong to more than one group, switcher lists all of them.
- Still open: where the board lives (standalone vs. bot-in-chat), invite-link join flow, adding shows through the UI (Table Editor only for now), replacing the placeholder `prompt()` name entry with real onboarding UI.
