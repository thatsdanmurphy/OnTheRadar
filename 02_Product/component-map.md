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
- **Show card** (`app/index.html`, logic in `app/scripts/shows.js`, styles in `app/styles/components.css`) — renders a single show: date/time, title, venue (linked out), openers, curious/going/out buttons, overlap badge. Built and wired to Supabase.
  - Renders inside: show list (built) — Calendar view and "Most overlap" sort not yet built, this is the "Upcoming" list only, sorted by `show_date` ascending.
  - Response buttons: click writes straight to `responses` via `setResponse` (upsert on `show_id, person_id`), then the whole list re-renders. Active button reflects the current person's own response.
  - Overlap badge: only shows when 2+ people are curious or going (`overlapCount` — out never counts), per the response-states decision.
  - Not yet built: editing/deleting a show, and any UI to add one — right now shows have to be inserted directly in Supabase's Table Editor.
- Calendar grid — month view, fixed-height uniform cells, overflow collapses to "+N more."
  - Renders inside: Calendar view — not yet built
  - Key props: month/year, shows-by-date map
- Avatar stack (click-to-expand) — dots that expand to a plain name list. Implemented once, in the header; show-card usage (who's interested per show) would reuse the same component, not yet added to the card itself.
  - Renders inside: header (built), show card (not yet built)
  - Key props: list of people, expanded/collapsed state
- Link autofill input (mocked) — paste a link, fields populate. Currently simulated for two sample URLs; a real version needs a backend fetch + Open Graph/JSON-LD parse (CORS blocks this from a static page).
  - Renders inside: Add show flow — not yet built
  - Key props: URL string, autofill result

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
