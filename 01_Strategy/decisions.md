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
