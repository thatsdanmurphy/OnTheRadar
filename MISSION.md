# Gig Herd — Mission & Principles

This is the "why" document — bigger-picture than the brand brief (voice/visual identity) and the decision log (chronological build history). Start here for the pitch; go to `00_Brand/brand-brief.md` for tone and color; go to `01_Strategy/decisions.md` for the reasoning behind any specific feature.

## Mission

Concert buddies are concert buddies for a reason — everyone in the group has their own eye on different venues and artists, and someone's always finding out about a show first. That's exactly how the group stays close to the music scene together. Gig Herd doesn't try to manage that process or replace it: it just gives it one place to land. Everyone adds what they're curious about, and when two or more people land on the same show, it surfaces automatically. That's the whole product. It doesn't track attendance, it doesn't manage tickets, it doesn't try to be a music-discovery engine on its own — it's a single, honest signal (who's curious about what), fed by everyone in the group, not just whoever's paying closest attention that week.

## Vision

Realistic version, not a hockey-stick version: this stays a tool a friend group actually opens without being reminded, because it answers a question they were already going to ask each other in a group chat anyway ("wait, are you going to this?"). If it's good, the way it spreads is the way word-of-mouth actually spreads among friend groups — someone gets invited into one group, likes it, starts one for their other friend group. No network effect required for that to happen; it just requires the core loop being worth opening. Anything past that (multiple unrelated friend groups worth of usage, real infrastructure needs, an actual business) is a problem worth having later, not one worth designing for now.

**Later, maybe:** a running record of past shows the group's actually gone to — not scoped now, but a natural next layer once the current-shows loop is solid.

## Principles

What the product itself stands for — not build process, not visual style, just what it owes the people using it:

- **Overlap is the signal, not attendance or taste-matching.** The app doesn't say what's good and doesn't track who went — it just tells the group what it already, independently, cares about.
- **Everyone's eyes count equally.** A show only surfaces because two or more people noticed it on their own. No algorithm ranks taste, and no one person's radar counts for more than anyone else's.
- **A signal, not a replacement for the group.** The app's job ends at "hey, you're both into this." The actual "let's go," buying tickets together or separately, all of that stays exactly where it already happens — off-platform, between people.
- **No manufactured urgency.** The excitement is real friends being into the same show — not countdowns, not "X people are viewing this."
- **As low a bar to join as a group chat.** If adding a show or joining a group ever asks for more than a name, it's already asking for too much.

## Practical call: sticking with Ticketmaster

Ticketmaster's Discovery API is the fastest, and honestly the only realistic, free way to get artist search working right now — no comparable self-serve API exists for AXS, StubHub, or small venues directly. It sits oddly next to a CBGB/dive-bar brand reference (Ticketmaster is the company a jury found liable for monopolizing live-event ticketing, DOJ v. Live Nation, April 2026), and that mismatch is worth naming honestly rather than pretending it isn't there. But the practical call, made deliberately, is to keep using it: this needs a working artist-search path now, and there's no realistic alternative data source at this stage. No commitment either way about replacing it later — that's not a roadmap item, just an open possibility if something better ever turns up.

## Advisors (informal, not a board)

Not a governance structure — a short list of lenses worth checking a big decision against before committing to it, the same way the three-perspective review (indie-founder, business-model-skeptic, brand-consistency) got used once already and worked. Reuse that pattern for future big calls (pricing, a real launch, adding a second friend group's worth of complexity) rather than building a standing board for a project this size.

## Cost & limits (lean ops)

Current spend: $0. What's free right now, and what would actually trigger real cost:

- **Supabase**: free tier gives 500 MB database, 500,000 Edge Function invocations/month, 5 GB egress, 50,000 monthly active users. A single friend group is nowhere near any of these. The one real gotcha: free-tier projects auto-pause after 7 days with no API requests — meaning if the group goes quiet for a week, the app itself will go offline until manually resumed. That's actually a useful, free signal (see Usage check, below), not just a risk.
- **Ticketmaster Discovery API**: free, 5,000 calls/day. Artist search + venue autocomplete together are nowhere close to that for one group.
- Nothing else costs anything. No paid domain, no analytics platform, no email service.

Real cost only shows up if this spans many unrelated friend groups at once (Supabase usage climbing toward paid tiers) — worth checking usage numbers before that ever becomes urgent, not reacting to a surprise bill.

## Usage check (lean, not a dashboard)

The real question isn't a metrics dashboard, it's simpler: is the test group opening this without being told to. Cheap ways to check periodically, straight from Supabase's table view — no analytics tool needed:

- Rows in `responses` with `created_at` in the last week — any real activity, or silence?
- Distinct `person_id`s active in that window — is it one person (Dan) or the whole group?
- The free auto-pause signal above: if the project pauses itself, that's the honest answer already.

## Money, if it ever needs to

Affiliate revenue on ticket click-throughs is viable now, not a "someday" — the product side is trivial. Ticketmaster runs a real affiliate program (through the Impact network, via Ticketmaster's own developer/distribution-partner sign-up) that pays a share of ticket sales made through a tagged link, roughly a 30-day attribution window. The app already has a "Buy tickets" button pointing at `source_url` — turning this on would just mean appending an affiliate tracking parameter to that link. Nothing about the product or the experience changes.

The actual gate isn't the app, it's signing up. Ticketmaster's affiliate program runs through Impact and expects the applicant to register as a real publisher (name, tax info, payout details) — that's a real account-creation step, something Dan would need to do himself, not something to build around in code. Approval also isn't guaranteed for a brand-new site with one friend group's worth of traffic; worth applying whenever there's appetite for it, but not something to count on.

If it does get switched on: no legal requirement to tell friends specifically (FTC disclosure rules target public advertising/influencer content, not a private app like this), but the brand's own "no dark patterns" rule points the same way anyway — a plain one-liner ("ticket links may earn a small commission, goes toward keeping this running") costs nothing and fits the voice better than staying quiet about it.

Freemium (small fee for multiple groups or extra features) and a tip jar remain on the table if this ever needs more than affiliate revenue — those genuinely are "someday," since freemium needs real accounts/billing that don't exist yet. Affiliate is the one piece of this that isn't gated on scale, only on Dan applying.
