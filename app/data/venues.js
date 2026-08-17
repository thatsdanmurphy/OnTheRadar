// On the Radar — Browse feature venue directory
// Plain script (see supabase/client.js for why — no ES modules).
// Hand-curated, not scraped — see decision log, 2026-08-15 entries
// ("Browse feature," "Browse scoped to full New England," "Browse
// secondary facets," "Browse venue identifiers," "Browse: est. year
// + notable shows") for the reasoning behind this shape.
//
// Each entry:
//   name       — venue name
//   url        — official calendar/events page (verified, not a
//                Ticketmaster/AXS mirror unless that IS the venue's
//                own primary listing)
//   categories — one or more of: "Tiny venues", "Small venues",
//                "Classic theatres", "Arenas & Stadiums", "Outdoor",
//                "Legendary", "Festivals" — "Legendary" is a cross-cut
//                tag, not exclusive of a size category. Rough capacity
//                bands: Tiny ≲250, Small ~250–1,500, Arenas & Stadiums
//                5,000+ — Classic theatres and Outdoor are defined by
//                physical character, not a strict capacity band.
//   state      — 2-letter code (ME/NH/VT/MA/RI/CT)
//   city       — city/town name
//   metro      — metro-area grouping (Boston/Cambridge, Providence,
//                Portland, Burlington, New Haven/Hartford, Manchester)
//   allAges    — "all ages" | "18+ (varies by event)" | "21+"
//                — reflects the venue's typical/default policy;
//                individual shows can differ, this is not a
//                per-event guarantee
//   address    — full street address
//   capacity   — number, or null if no capacity is published anywhere
//                citable (don't guess a plausible-sounding number)
//   transit    — nearest MBTA line + station, only set when it's a
//                genuine walk (~10 min or less) — left null for
//                venues that aren't realistically transit-accessible
//                (e.g. suburban amphitheaters), rather than naming
//                the technically-closest stop miles away
//   established — year opened, number (or a string when the "opened
//                as this name" year differs meaningfully from the
//                space's older history)
//   notableShows — optional array of short, press-sourced historical
//                notes ("X played here in Y") — NOT a ranked "best
//                shows" list, just documented history. Only added for
//                venues where this is genuinely well-documented in
//                press (mostly Legendary-tagged ones) rather than
//                forced onto every entry.
//
// Batch 1: Boston/Cambridge, MA — carried forward from the original
// prototype's 7 verified venues, re-tagged with the new facets.

window.OTR = window.OTR || {};

OTR.VENUES = [
  {
    name: 'Club Passim',
    url: 'https://www.passim.org/live-music/',
    categories: ['Tiny venues', 'Legendary'],
    state: 'MA',
    city: 'Cambridge',
    metro: 'Boston/Cambridge',
    allAges: 'all ages',
    address: '47 Palmer St, Cambridge, MA 02138',
    capacity: null, // not published anywhere citable
    transit: 'Red Line – Harvard Square (~5 min walk)',
    established: 1958, // opened as Club 47
    notableShows: [
      'Joan Baez started playing here in 1958 as an unknown BU student',
      'Bob Dylan played between sets in 1961, hoping to get noticed',
      'Bonnie Raitt chose Radcliffe College specifically to be near this club',
    ],
  },
  {
    name: 'Scullers Jazz Club',
    url: 'https://scullersjazz.com/calendar/',
    categories: ['Tiny venues'],
    state: 'MA',
    city: 'Boston',
    metro: 'Boston/Cambridge',
    allAges: 'all ages',
    address: '400 Soldiers Field Rd, Boston, MA 02134',
    capacity: 175,
    transit: 'Green Line B – Packard’s Corner (~10 min walk)',
    established: 1989,
  },
  {
    name: 'Lizard Lounge',
    url: 'https://lizardloungeclub.com/calendar',
    categories: ['Tiny venues'],
    state: 'MA',
    city: 'Cambridge',
    metro: 'Boston/Cambridge',
    allAges: '21+',
    address: '1667 Massachusetts Ave, Cambridge, MA 02138',
    capacity: null, // not published anywhere citable
    transit: 'Red Line – Porter Square or Harvard Square (both an easy walk)',
    established: 1996,
  },
  {
    name: 'Brighton Music Hall',
    url: 'https://crossroadspresents.com/pages/brighton-music-hall',
    categories: ['Small venues'],
    state: 'MA',
    city: 'Boston (Allston)',
    metro: 'Boston/Cambridge',
    allAges: '18+ (varies by event)',
    address: '158 Brighton Ave, Boston, MA 02134',
    capacity: 476,
    transit: 'Green Line B – Allston St (~6 min walk)',
    established: 2011, // as Brighton Music Hall; the room itself is older (formerly Harpers Ferry)
  },
  {
    name: 'Paradise Rock Club',
    url: 'https://crossroadspresents.com/pages/paradise-rock-club',
    categories: ['Small venues', 'Legendary'],
    state: 'MA',
    city: 'Boston',
    metro: 'Boston/Cambridge',
    allAges: '18+ (varies by event)',
    address: '967 Commonwealth Ave, Boston, MA 02215',
    capacity: 933,
    transit: 'Green Line B – Babcock St (~2 min walk)',
    established: 1977,
    notableShows: [
      'U2 played one of their earliest US gigs here in December 1980, before they were well known',
      'James Taylor and Carly Simon played a photographed show here April 18, 1978',
      'Pixies are on the club’s own Wall of Fame, alongside Tom Waits and A Tribe Called Quest',
    ],
  },
  {
    name: 'Big Night Live',
    url: 'https://bignightlive.com/',
    categories: ['Small venues'],
    state: 'MA',
    city: 'Boston',
    metro: 'Boston/Cambridge',
    allAges: '18+ (varies by event; VIP tables 21+)',
    address: '110 Causeway St, Boston, MA 02114',
    capacity: 1400, // Live Hall; Studio B adds 440, full-venue max ~2,000
    transit: 'Green/Orange Line – North Station (adjacent)',
    established: 2019,
  },
  {
    name: 'MGM Music Hall at Fenway',
    url: 'https://crossroadspresents.com/pages/mgm-fenway-music-hall',
    categories: ['Arenas & Stadiums'],
    state: 'MA',
    city: 'Boston',
    metro: 'Boston/Cambridge',
    allAges: '18+ (varies by event)',
    address: '2 Lansdowne St, Boston, MA 02215',
    capacity: 5009,
    transit: 'Green Line – Hynes Convention Center (~6 min walk)',
    established: 2022,
  },
];
