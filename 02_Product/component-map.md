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
- **Header nav** (`app/index.html`, logic in `app/scripts/identity.js`, styles in `app/styles/components.css`) — wordmark, group switcher, crew avatar stack. Built and wired to Supabase — no more mock data.
  - Wordmark: links home, Archivo Black, head size.
  - Person identity: `getOrCreatePerson()` reads the `otr_person_id` cookie, or creates a new `people` row and cookie on first visit (name entry is currently a placeholder `prompt()`, not final UI).
  - Group switcher: shows the person's current group, click opens a menu listing all their groups (`getMyGroups`) + "New group" (`createGroup`, inserts a group + membership). Empty state: "No groups yet" when the person has none.
  - Avatar stack: overlapping initials dots for the current group's members (`getGroupMembers`), click-to-expand into a plain name list. Same pattern reused from the original prototype's header avatar stack.
  - Not yet built: switching which group is "current" doesn't persist (always defaults to the first group returned); joining an existing group via invite link isn't wired yet, only creating a new one.
- **Show card** (`app/index.html`, logic in `app/scripts/shows.js`, styles in `app/styles/components.css`) — vertical card: date + overlap badge, title, venue (linked out), openers, who's-in avatar stack, response segmented control. Built and wired to Supabase.
  - Renders inside: show list (built) — Calendar view and "Most overlap" sort not yet built, this is the "Upcoming" list only, sorted by `show_date` ascending.
  - Response control: three buttons (Curious / Got tickets / I'm out) in one bordered segmented group, not floating pills. Click writes straight to `responses` via `setResponse` (upsert on `show_id, person_id`), then the whole list re-renders. Active button (filled black) reflects the current person's own response — all three states look the same when active, no special-casing "out."
  - **Card state:** when the current person's own response is "out," the whole card drops to 50% opacity (`.is-out`) rather than styling the button differently — the dimming itself is the "you've deprioritized this" signal.
  - Overlap badge: filled block (accent bg, not just colored text) so it reads as a marker, not a label. Only shows when 2+ people are curious or going (`overlapCount` — out never counts), per the response-states decision.
  - Who's-in avatar stack: reuses the same click-to-expand pattern as the header's crew avatars, built via a shared `buildAvatarStack(people)` helper — one closure-scoped instance per card, so multiple stacks on the page don't collide. Only shows people marked curious or going; hidden entirely if nobody's in yet.
  - Not yet built: editing/deleting a show.
- **Add show panel** (`app/index.html`, logic in `app/scripts/shows.js`, Edge Functions in `app/supabase/functions/`) — three entry methods, all funneling into one manual form for review before submit. "+ Add show" opens the panel; the manual form (title + date required, time/venue name/venue URL/openers optional) is the common final step no matter which method got you there.
  - **Method 1 — artist search** (default/primary): `OTR.searchShows(keyword)` calls the `search-tickets` Edge Function, which queries Ticketmaster's Discovery API across New England (MA/CT/RI/NH/VT/ME — six requests, one per state, rather than gambling on undocumented multi-state syntax) and returns a clickable results list. Clicking a result prefills the manual form. Requires a `TICKETMASTER_API_KEY` Edge Function secret (not hardcoded — this repo is public, and unlike Supabase's anon key, Ticketmaster's key isn't meant to be exposed).
  - **Method 2 — paste a link**: `OTR.parseShowLink(url)` calls the `parse-show-link` Edge Function, which fetches the URL server-side (sidesteps the browser's CORS wall) and parses JSON-LD `Event` schema first, Open Graph tags as fallback. Known dead end: Ticketmaster and AXS both block this outright (tested directly against real event URLs, confirmed empty) — works best for venue sites without bot protection. Comes back empty gracefully rather than erroring, and still reveals the (blank) manual form so nothing's a dead end.
  - **Method 3 — add manually**: skips straight to the blank form.
  - Coverage tradeoff, worth remembering: Ticketmaster/Live Nation controls ~80% of *major* concert venues' primary ticketing, but that skews toward arenas/amphitheaters — small clubs and dive bars (the venues this app is actually about) are much less likely to be covered by either method, which is why manual entry stays a first-class path, not an apology.
  - Plain bordered inputs, no styling framework — `.form-row`/`.form-row-split`/`.btn-solid`/`.btn-outline`/`.inline-input-row`/`.link-btn`/`.search-results` are reusable primitives in `components.css` now, not one-offs.
  - Not yet built: editing/deleting a show; joining an *existing* group via invite link (mirrors the header nav gap).
- Calendar grid — month view, fixed-height uniform cells, overflow collapses to "+N more."
  - Renders inside: Calendar view — not yet built
  - Key props: month/year, shows-by-date map
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
