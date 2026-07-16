# Component Map

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
