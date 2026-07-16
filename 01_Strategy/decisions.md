# Decision Log

## 2026-07-16 — Core mechanic is overlap surfacing, not artist tracking
**What:** The product's central feature is detecting when 2+ friends independently mark curiosity about the same show, and surfacing that automatically.
**Why:** Existing tools (Spotify's unbuilt "gig buddies" request, Bandsintown's friend-attendance layer, stranger-matching apps like EventBuddie/Muse) either don't build this or solve a different problem (companion-finding, not friend-group overlap). The gap is specifically "surface overlap within a group I already know."
**Revisit if:** Usage data shows people care more about tracking individual artists than seeing overlap — would suggest the product should pivot toward artist-tracking-first with overlap as a secondary layer.

## 2026-07-16 — Response states are three-way: curious / going / out
**What:** Each person can mark a show as "I'm curious," "Got tickets," or "I'm out" — only curious + going count toward the overlap indicator.
**Why:** A binary interested/not-interested loses the distinction between "I'd consider it" and "I already committed." Excluding "I'm out" from the overlap count keeps the signal meaningful — overlap should mean real shared interest, not just visibility.
**Revisit if:** Users find three states confusing or the "I'm out" state goes mostly unused — could simplify back to two states.

## 2026-07-16 — Visual identity is deliberately flat (ticket-stub / marquee)
**What:** No gradients, no glow/pulse animation, thin shadows only. Typography and color built around a printed-ticket-stub metaphor.
**Why:** Established in the working prototype (`on-the-radar.html`) and validated by feel — a concert board should feel like a corkboard of stubs, not a SaaS dashboard. Flat design also keeps the static-HTML approach lightweight if it stays framework-free.
**Revisit if:** The product grows features (real-time updates, notifications) that genuinely need motion to communicate state changes.

## 2026-07-16 — Brand reference is CBGB / dive-bar punk, rendered non-skeuomorphically
**What:** Voice and visual restraint are modeled on Strummer/Cobain/Elliott Smith — DIY, nothing overproduced, no ornament that isn't earning its place. High-contrast black/white, one ink accent (blood red or rust) for overlap only, typewriter-adjacent data type. Explicitly no literal bar/flyer objects — no staples, pushpins, torn-paper edges, or grain textures standing in for a physical space.
**Why:** The punk reference and the "keep it minimal" instinct aren't actually in tension — restraint is the aesthetic. But rendering the metaphor literally (fake staples, distressed paper) tips into skeuomorphism and reads as a theme-park version of a dive bar rather than the real thing. The brand should come from what's absent, not from illustrated props.
**Revisit if:** The flat/no-ornament rule makes overlap or state changes hard to read — may need one restrained affordance (not decorative) to carry that signal.

## 2026-07-16 — Frame: 12-column grid, fixed spacing scale, type tied to spacing rhythm
**What:** Built the layout foundation before any components: a spacing scale (0/4/8/16/24/32/40/48/56/64/72), a 12-column grid that keeps 12 columns at every breakpoint (only margin/gutter change — 16/16 mobile, 24/16 tablet, 32/24 desktop, 1200px max-width), and a 5-size type scale whose line-heights are pulled directly from the spacing scale rather than invented separately. Body copy is capped at a 60–75 character measure via a `.prose` utility rather than allowed to span full width.
**Why:** Requested as the baseline to build components on top of, one at a time (header, body container, footer next). Tying line-heights to spacing tokens means layout and type share one rhythm instead of two systems that drift apart. Keeping columns fixed at 12 and only varying margin/gutter is simpler to reason about than changing column count per breakpoint.
**Revisit if:** A component genuinely needs a type size or spacing value outside these scales — add it to the token file deliberately rather than hardcoding a one-off value in the component.
**Superseded by:** the 2026-07-16 grid entry below — column count now changes per breakpoint (4/8/12) instead of staying fixed at 12.

## 2026-07-16 — Grid moves to 4/8/12 columns, numbered col-N replaced with semantic spans
**What:** Changed the grid from "always 12 columns" to 4 columns mobile / 8 tablet / 12 desktop — Material's standard layout-grid split. Because column count now varies, the col-1…col-12 utilities were replaced with semantic classes (`.col-full`, `.col-half`, `.col-quarter`, `.col-third`) that each carry the correct span per breakpoint, so "half" always means half regardless of how many columns exist underneath it.
**Why:** Requested directly. 4/8/12 share clean common factors — half and quarter divide evenly at every breakpoint, which a flat 12-always grid doesn't guarantee once you're actually laying out narrow mobile screens (a lone "span 3" reads very differently at 375px than at 1280px). Thirds are the one span that only divides cleanly at 12, so `.col-third` is explicitly desktop-only and falls back to full width elsewhere rather than producing an uneven split.
**Revisit if:** A component needs a span these four don't cover — add a new semantic class with its own per-breakpoint values rather than reintroducing raw col-N numbers.

## 2026-07-16 — Display face changed from Oswald to Anton
**What:** Swapped the display typeface (headings, hero numbers, page title) from Oswald to Anton.
**Why:** Oswald read as clean athletic/highway-sign condensed rather than gig-poster. Anton is bolder and blunter, closer to the lettering on an actual show flyer, without introducing any texture or distress — the punk feeling comes from the letterform's weight and bluntness, not from decoration, which keeps it consistent with the no-skeuomorphism rule in the brand brief.
**Revisit if:** Anton reads as too heavy/shouty once real show titles are set in it — Staatliches and Archivo Black are the next things to try, in that order.
