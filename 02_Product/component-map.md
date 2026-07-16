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
- On the Radar (single page, `on-the-radar.html`) — holds all show data, all per-person response states, and the current view mode (Upcoming / Most overlap / Calendar) in local state.

## Components
- Show card — renders a single show: title, date/time, venue (linked out), openers, per-person response controls, overlap indicator.
  - Renders inside: List view (Upcoming, Most overlap)
  - Key props: show data, current responses, click handler for expanding avatars
- Calendar grid — month view, fixed-height uniform cells, overflow collapses to "+N more."
  - Renders inside: Calendar view
  - Key props: month/year, shows-by-date map
- Avatar stack (click-to-expand) — dots that expand to a plain name list.
  - Renders inside: header (whole crew) and show card (who's interested)
  - Key props: list of people, expanded/collapsed state
- Link autofill input (mocked) — paste a link, fields populate. Currently simulated for two sample URLs; a real version needs a backend fetch + Open Graph/JSON-LD parse (CORS blocks this from a static page).
  - Renders inside: Add show flow
  - Key props: URL string, autofill result

## Data Flow
Show data and per-person responses live in a single in-memory store on the page. View components (List, Calendar) read from that store and re-render on filter/sort changes. Response changes (curious / going / out) write back to the store and recompute each show's overlap count, which drives sort order in "Most overlap" and the indicator badge on every card.

## State
- View mode (Upcoming / Most overlap / Calendar): local state
- Show list + per-person responses: local state (in-memory; no persistence layer yet)
- Expanded/collapsed avatar lists: local state, per-instance
- Open questions before this needs real state: where the board lives (standalone vs. bot-in-chat) and whether multiple non-overlapping friend groups need to be supported — see brand-brief-adjacent open questions in the project brief.
