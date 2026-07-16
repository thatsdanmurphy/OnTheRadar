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
| 24 | 32 | Anton (display) | section headings |
| 40 | 48 | Anton (display) | hero numbers, page title |

**Measure rule:** body copy targets 60–75 characters per line. On desktop, full-width (12 columns) runs too long — `.col-half` lands closer to the right measure. Use `.prose` (max-width: 65ch) alongside it for any real paragraph so the cap holds regardless of column width.

**Discipline:** every color, spacing, and type value in a component should reference a token from `tokens.css` (`var(--...)`). If a value doesn't exist as a token and needs to be reusable, add it to `tokens.css` first rather than hardcoding — flag it here when that happens so the scale stays intentional, not sprawling.

## Pages
- **On the Radar — real app shell** (`app/index.html`) — the page being built up component by component on the frame. Currently: header nav only. Body container and footer are next.
- On the Radar — original prototype (`app/on-the-radar.html`) — kept as reference; the mocked interactivity (list/calendar views, response states) it demonstrates gets rebuilt as real components on the frame rather than ported as-is.

## Components
- **Header nav** (`app/index.html`, styles in `app/styles/components.css`) — wordmark, group switcher, crew avatar stack. Built, static/mock data.
  - Wordmark: links home, Anton, head size.
  - Group switcher: button showing current group name, click opens a menu listing the person's groups + "New group." Mocked — no backend behind it yet, but this is the intended real shape once slugs/cookies land (see decision log).
  - Avatar stack: overlapping initials dots for the current group's crew, click-to-expand into a plain name list. Same pattern reused from the original prototype's header avatar stack.
  - Key props (once wired to data): current group, list of the person's groups, list of crew in the current group.
- Show card — renders a single show: title, date/time, venue (linked out), openers, per-person response controls, overlap indicator.
  - Renders inside: List view (Upcoming, Most overlap) — not yet built
  - Key props: show data, current responses, click handler for expanding avatars
- Calendar grid — month view, fixed-height uniform cells, overflow collapses to "+N more."
  - Renders inside: Calendar view — not yet built
  - Key props: month/year, shows-by-date map
- Avatar stack (click-to-expand) — dots that expand to a plain name list. Now implemented once, in the header; show-card usage (who's interested per show) is the same component reused, not rebuilt.
  - Renders inside: header (built) and show card (not yet built)
  - Key props: list of people, expanded/collapsed state
- Link autofill input (mocked) — paste a link, fields populate. Currently simulated for two sample URLs; a real version needs a backend fetch + Open Graph/JSON-LD parse (CORS blocks this from a static page).
  - Renders inside: Add show flow — not yet built
  - Key props: URL string, autofill result

## Data Flow
Show data and per-person responses live in a single in-memory store on the page. View components (List, Calendar) read from that store and re-render on filter/sort changes. Response changes (curious / going / out) write back to the store and recompute each show's overlap count, which drives sort order in "Most overlap" and the indicator badge on every card.

Once the backend lands (see decision log — slugs + cookie, no accounts), this shifts to: a shared datastore for groups/memberships/shows/responses, with the person's own cookie only tracking which group-slugs they've joined (used to populate the group switcher and profile screen without a server-side "who is logged in" lookup).

## State
- View mode (Upcoming / Most overlap / Calendar): local state — not yet built
- Show list + per-person responses: local state (in-memory; no persistence layer yet)
- Expanded/collapsed avatar lists and group menu: local state, per-instance (built, in header nav)
- Current group, list of joined groups: currently hardcoded mock data in header nav; real version reads from cookie + shared datastore once the backend exists
- Open question resolved: multiple non-overlapping friend groups are supported (see profile/group-switcher decision) — a person can belong to more than one group.
- Still open: where the board lives (standalone vs. bot-in-chat), and the shared datastore implementation itself.
