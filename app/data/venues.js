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
      'Pixies and A Tribe Called Quest are both on the club’s own Wall of Fame',
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
    allAges: 'all ages (varies by event)', // corrected — venue's own policy is all-ages by default, restrictions only on select events
    address: '2 Lansdowne St, Boston, MA 02215',
    capacity: 5009,
    transit: 'Green Line – Hynes Convention Center (~6 min walk)',
    established: 2022,
  },

  // Batch 1 addendum — the big/iconic Boston-area venues everyone
  // actually asks about, added after direct follow-up feedback ("do
  // you have Sinclair? and comcast center? and cohasset music circus
  // and cape cod melody tent and gillette and fenway?"). The original
  // 7-venue Batch 1 undersold Boston/Cambridge relative to how deep
  // this market actually goes — this fills that gap with the venues
  // a Boston-area friend group would expect to see. South Shore Music
  // Circus (Cohasset) and Cape Cod Melody Tent (Hyannis) are both a
  // real drive from Boston proper, but both are run by the same
  // operator, share a single site, and are functionally part of the
  // same greater-Boston touring circuit (an artist often plays both
  // tents back-to-back) — same "hub metro, real venues further out"
  // pattern already used for Cambridge/Allston here and Derry/Concord/
  // Nashua under Manchester, NH.
  {
    name: 'The Sinclair',
    url: 'https://www.sinclaircambridge.com/',
    categories: ['Small venues'],
    state: 'MA',
    city: 'Cambridge',
    metro: 'Boston/Cambridge',
    allAges: '18+ (varies by event)',
    address: '52 Church St, Cambridge, MA 02138',
    capacity: null, // not published on the venue's own site; no independent source found either
    transit: 'Red Line – Harvard Square (~2 min walk)',
    established: null, // opening year not confirmed from a reliable source
  },
  {
    name: 'Xfinity Center',
    url: 'https://www.livenation.com/venue/KovZpaFEZ7/xfinity-center-events',
    categories: ['Arenas & Stadiums', 'Outdoor', 'Legendary'],
    state: 'MA',
    city: 'Mansfield',
    metro: 'Boston/Cambridge',
    allAges: 'all ages',
    address: '885 S Main St, Mansfield, MA 02048',
    capacity: 19900, // 7,000 reserved pavilion seats + 7,000 lawn + 5,900 general admission, per Wikipedia
    transit: null,
    established: '1986 // opened as Great Woods Center for the Performing Arts; renamed Tweeter Center (1999), Comcast Center (2008), Xfinity Center (2014)',
    notableShows: [
      'Opened June 13, 1986 with a performance by Yo-Yo Ma and the Pittsburgh Symphony Orchestra',
      'The Eagles played five consecutive nights here during their 1994 Hell Freezes Over tour',
      'Jimmy Buffett is the venue’s most-performed artist, with 63 shows',
    ],
  },
  {
    name: 'South Shore Music Circus',
    url: 'https://themusiccircus.org/',
    categories: ['Outdoor', 'Legendary'],
    state: 'MA',
    city: 'Cohasset',
    metro: 'Boston/Cambridge',
    allAges: 'all ages',
    address: '130 Sohier St, Cohasset, MA 02025',
    capacity: 2300, // expanded from an original 1,000 seats
    transit: null,
    established: 1951, // opened June 25, 1951 with a production of Show Boat; one of the country's few surviving tent theatres-in-the-round
  },
  {
    name: 'Cape Cod Melody Tent',
    url: 'https://www.melodytent.org/',
    categories: ['Outdoor', 'Legendary'],
    state: 'MA',
    city: 'Hyannis',
    metro: 'Boston/Cambridge',
    allAges: 'all ages',
    address: '41 West Main St, Hyannis, MA 02601',
    capacity: 2300,
    transit: null,
    established: 1950, // opened as the Cape Cod Music Circus, sister venue to South Shore Music Circus (same operator, same tent-theatre-in-the-round format)
  },
  {
    name: 'Gillette Stadium',
    url: 'https://www.gillettestadium.com/',
    categories: ['Arenas & Stadiums', 'Outdoor'],
    state: 'MA',
    city: 'Foxborough',
    metro: 'Boston/Cambridge',
    allAges: 'all ages',
    address: '1 Patriot Place, Foxborough, MA 02035',
    capacity: 71723, // the stadium's own record concert attendance (Ed Sheeran, July 1, 2023); typical concert configuration runs lower depending on staging
    transit: null,
    established: 2002,
    notableShows: [
      'Bruce Springsteen and the E Street Band played a landmark show here in 2003',
      'Taylor Swift became the first woman to headline the stadium, in 2010, and has returned for multiple record-breaking runs since',
      'One Direction became the first act to headline three consecutive nights here, in August 2014',
    ],
  },
  {
    name: 'Fenway Park',
    url: 'https://www.mlb.com/redsox/ballpark',
    categories: ['Arenas & Stadiums', 'Outdoor', 'Legendary'],
    state: 'MA',
    city: 'Boston',
    metro: 'Boston/Cambridge',
    allAges: 'all ages',
    address: '4 Jersey St, Boston, MA 02215',
    capacity: 37200, // concert-configuration attendance record, set by Lady Gaga in August 2022 (baseball-game capacity is a separate, slightly different figure)
    transit: 'Green Line B/C/D – Kenmore (~5 min walk)',
    established: 1912,
    notableShows: [
      'Stevie Wonder and Ray Charles played the first Fenway concerts in 1973',
      'Bruce Springsteen and the E Street Band returned concerts to the ballpark in 2003 after a long gap',
      'Lady Gaga became the first woman to headline a Fenway concert in 2017, then set the venue’s concert attendance record in 2022',
    ],
  },

  // Batch 1, second addendum — a deeper sweep for the rest of the
  // well-known Boston/Cambridge venues, per direct follow-up ("but
  // there are more" / "did you get royale? and bull run? and tupelo
  // music hall up in nh? and shalin liu?"). Tupelo Music Hall and
  // Somerville Theatre were checked against this list too — Tupelo is
  // already in the Manchester, NH batch (it's in Derry, NH, not MA);
  // Somerville Theatre is new here.
  {
    name: 'TD Garden',
    url: 'https://www.tdgarden.com/',
    categories: ['Arenas & Stadiums'],
    state: 'MA',
    city: 'Boston',
    metro: 'Boston/Cambridge',
    allAges: 'all ages',
    address: '100 Legends Way, Boston, MA 02114',
    capacity: 19600, // concert configuration; basketball config is 19,156
    transit: 'Green/Orange Line – North Station (adjoins the arena)',
    established: 1995,
  },
  {
    name: 'Leader Bank Pavilion',
    url: 'https://www.leaderbankpavilion.com/',
    categories: ['Outdoor'],
    state: 'MA',
    city: 'Boston',
    metro: 'Boston/Cambridge',
    allAges: 'all ages',
    address: '290 Northern Ave, Boston, MA 02210',
    capacity: 5000,
    transit: 'Silver Line – Courthouse (~10 min walk)',
    established: '1994 // opened as Harbor Lights Pavilion; renamed several times since (BankBoston, FleetBoston, Bank of America, Blue Hills Bank, Rockland Trust) before becoming Leader Bank Pavilion in 2021',
  },
  {
    name: 'The Stage at Suffolk Downs',
    url: 'https://atsuffolkdowns.com/events/the-stage-at-suffolk-downs/',
    categories: ['Outdoor'],
    state: 'MA',
    city: 'East Boston',
    metro: 'Boston/Cambridge',
    allAges: 'all ages',
    address: '525 William F McClellan Hwy, East Boston, MA 02128',
    capacity: 8500,
    transit: 'Blue Line – Suffolk Downs (adjacent)',
    established: 2023,
  },
  {
    name: 'Wang Theatre',
    url: 'https://www.bochcenter.org/wang-theatre',
    categories: ['Classic theatres'],
    state: 'MA',
    city: 'Boston',
    metro: 'Boston/Cambridge',
    allAges: 'all ages',
    address: '270 Tremont St, Boston, MA 02116',
    capacity: 3600,
    transit: 'Green/Orange Line – Boylston / NE Medical Center (~5-8 min walk)',
    established: '1925 // opened as the Metropolitan Theatre; part of the Boch Center since 2013',
  },
  {
    // "(Boston)" added to disambiguate from the separate Shubert
    // Theatre in New Haven, CT, also in this file — venue favorites
    // are keyed by display name (see decision log), so two venues
    // sharing an exact name would silently collide there.
    name: 'Shubert Theatre (Boston)',
    url: 'https://www.bochcenter.org/shubert-theatre',
    categories: ['Classic theatres'],
    state: 'MA',
    city: 'Boston',
    metro: 'Boston/Cambridge',
    allAges: 'all ages',
    address: '265 Tremont St, Boston, MA 02116',
    capacity: 1600,
    transit: 'Green/Orange Line – Boylston / NE Medical Center (~5-8 min walk)',
    established: 1910, // part of the Boch Center, same as the Wang Theatre across the street
  },
  {
    name: 'Orpheum Theatre',
    url: 'https://www.orpheumtheatremaboston.com/',
    categories: ['Classic theatres'],
    state: 'MA',
    city: 'Boston',
    metro: 'Boston/Cambridge',
    allAges: 'all ages',
    address: '1 Hamilton Pl, Boston, MA 02108',
    capacity: null, // not confirmed from a reliable source
    transit: 'Green/Red Line – Park Street (adjacent)',
    established: '1852 // one of the oldest theatres in the country still in use; reopened after a major renovation in late 2009',
  },
  {
    name: 'Symphony Hall',
    url: 'https://www.bso.org/symphony-hall',
    categories: ['Classic theatres'],
    state: 'MA',
    city: 'Boston',
    metro: 'Boston/Cambridge',
    allAges: 'all ages',
    address: '301 Massachusetts Ave, Boston, MA 02115',
    capacity: 2625, // BSO season configuration; Boston Pops shows use cabaret-style seating for 2,371
    transit: 'Green Line – Symphony (adjacent)',
    established: 1900,
  },
  {
    name: 'Berklee Performance Center',
    url: 'https://college.berklee.edu/BPC',
    categories: ['Classic theatres'],
    state: 'MA',
    city: 'Boston',
    metro: 'Boston/Cambridge',
    allAges: 'all ages',
    address: '136 Massachusetts Ave, Boston, MA 02115',
    capacity: 1215,
    transit: 'Green Line – Hynes Convention Center (~5-8 min walk)',
    established: '1976 // building originally opened as the Fenway Theatre in 1915',
  },
  {
    name: 'The Wilbur',
    url: 'https://www.thewilbur.com/',
    categories: ['Classic theatres'],
    state: 'MA',
    city: 'Boston',
    metro: 'Boston/Cambridge',
    allAges: 'all ages',
    address: '246 Tremont St, Boston, MA 02116',
    capacity: 1200,
    transit: 'Green/Orange Line – Boylston / NE Medical Center (~5-8 min walk)',
    established: 1914,
  },
  {
    name: 'Somerville Theatre',
    url: 'https://www.somervilletheatre.com/',
    categories: ['Classic theatres'],
    state: 'MA',
    city: 'Somerville',
    metro: 'Boston/Cambridge',
    allAges: 'all ages',
    address: '55 Davis Square, Somerville, MA 02144',
    capacity: null, // multiple screens/rooms of differing size; no single reliable figure found
    transit: 'Red Line – Davis Square (adjacent)',
    established: 1914,
  },
  {
    name: 'Chevalier Theatre',
    url: 'https://chevaliertheatre.com/',
    categories: ['Classic theatres'],
    state: 'MA',
    city: 'Medford',
    metro: 'Boston/Cambridge',
    allAges: 'all ages',
    address: '30 Forest St, Medford, MA 02155',
    capacity: 1900,
    transit: null,
    established: null,
  },
  {
    name: 'Regent Theatre',
    url: 'https://regenttheatre.com/',
    categories: ['Small venues'],
    state: 'MA',
    city: 'Arlington',
    metro: 'Boston/Cambridge',
    allAges: 'all ages',
    address: '7 Medford St, Arlington, MA 02474',
    capacity: null,
    transit: null,
    established: null,
  },
  {
    name: 'House of Blues Boston',
    url: 'https://boston.houseofblues.com/',
    categories: ['Small venues'],
    state: 'MA',
    city: 'Boston',
    metro: 'Boston/Cambridge',
    allAges: 'all ages',
    address: '15 Lansdowne St, Boston, MA 02215',
    capacity: 2500,
    transit: 'Green Line – Kenmore (~5-8 min walk)',
    established: null, // this Lansdowne St location's opening year not reliably confirmed; unrelated to the original Cambridge House of Blues, which closed in 2003
  },
  {
    name: 'Roadrunner',
    url: 'https://roadrunnerboston.com/',
    categories: ['Small venues'],
    state: 'MA',
    city: 'Boston (Brighton)',
    metro: 'Boston/Cambridge',
    allAges: '18+ (varies by event)',
    address: '89 Guest St, Brighton, MA 02135',
    capacity: 3500,
    transit: null, // nearest is Boston Landing commuter rail or a genuine ~15 min walk from the Green Line B — not close enough to tag
    established: 2022,
  },
  {
    name: 'The Middle East',
    url: 'https://mideastclub.com/',
    categories: ['Tiny venues', 'Small venues'],
    state: 'MA',
    city: 'Cambridge',
    metro: 'Boston/Cambridge',
    allAges: '18+ (varies by event)',
    address: '472-480 Massachusetts Ave, Cambridge, MA 02139',
    capacity: 575, // Downstairs, the largest room; Sonia holds 350, Upstairs 194, Corner 60
    transit: 'Red Line – Central Square (adjacent)',
    established: '1970 // opened as a restaurant; began hosting rock shows in 1987',
  },
  {
    name: 'Royale',
    url: 'https://royaleboston.com/',
    categories: ['Small venues'],
    state: 'MA',
    city: 'Boston',
    metro: 'Boston/Cambridge',
    allAges: '18+ (varies by event)',
    address: '279 Tremont St, Boston, MA 02116',
    capacity: 1000,
    transit: 'Green/Orange Line – Boylston / NE Medical Center (~5 min walk)',
    established: null,
  },
  {
    name: 'City Winery Boston',
    url: 'https://citywinery.com/boston',
    categories: ['Small venues'],
    state: 'MA',
    city: 'Boston',
    metro: 'Boston/Cambridge',
    allAges: 'all ages',
    address: '80 Beverly St, Boston, MA 02114',
    capacity: null, // not confirmed from a reliable source
    transit: 'Green/Orange Line – North Station (~5 min walk)',
    established: null,
  },
  {
    name: 'Bull Run',
    url: 'https://www.bullrunrestaurant.com/',
    categories: ['Tiny venues', 'Legendary'],
    state: 'MA',
    city: 'Shirley',
    metro: 'Boston/Cambridge',
    allAges: 'all ages',
    address: '215 Great Road, Shirley, MA 01464',
    capacity: 300, // Sawtelle Supper Room, the largest of its three performance spaces; the Ballroom and Tap Room are smaller
    transit: null,
    established: '1741 // building opened as Sawtelle\'s Tavern; renamed The Bull Run in 1861, live music since the 1970s',
    notableShows: [
      'A 50-plus-year run of touring acts across genres, including The Yardbirds, John Mayall, Johnny Winter, Blue Öyster Cult, Jefferson Starship, Los Lobos, 10,000 Maniacs, and Richard Thompson',
    ],
  },
  {
    name: 'Shalin Liu Performance Center',
    url: 'https://rockportmusic.org/shalin-liu-performance-center/',
    categories: ['Small venues'],
    state: 'MA',
    city: 'Rockport',
    metro: 'Boston/Cambridge',
    allAges: 'all ages',
    address: '37 Main St, Rockport, MA 01966',
    capacity: 330,
    transit: null,
    established: 2010,
  },

  // Batch 2: Providence, RI — no MBTA transit tags below (out of the T's
  // service area entirely; `transit` left null throughout, not just
  // omitted, so its absence reads as "not applicable here" rather than
  // "forgot to check").
  {
    name: 'AS220',
    url: 'https://as220.org/perform',
    categories: ['Tiny venues'],
    state: 'RI',
    city: 'Providence',
    metro: 'Providence',
    allAges: 'all ages',
    address: '115 Empire St, Providence, RI 02903',
    capacity: 200, // Main Stage, standing; seated is 120. Two smaller in-house rooms (Black Box: 90, Psychic Readings: 40) not separately listed. Source: venue's own site only — no independent second source found for this figure.
    transit: null,
    established: 1985,
  },
  {
    // Renamed from "Columbus Theatre" — the venue under that name closed
    // permanently in June 2024; new ownership reopened the same building
    // in 2025 as "Uptown Theater." Caught during a triangulation pass
    // (see decision log) — columbustheatre.com still resolves and shows
    // listings but appears to be a stale, unmaintained page; the real
    // current booking site is uptownpvd.com.
    name: 'Uptown Theater',
    url: 'https://www.uptownpvd.com/',
    categories: ['Small venues', 'Classic theatres'],
    state: 'RI',
    city: 'Providence',
    metro: 'Providence',
    allAges: '18+ (varies by event)',
    address: '270 Broadway, Providence, RI 02903',
    capacity: 800, // large theater; a separate small theater in the same building seats 200
    transit: null,
    established: '1926 // opened as Columbus Theatre; renamed Uptown Theatre 1929–1962, reverted to Columbus Theatre 1962–2024, now Uptown Theater again since 2025',
  },
  {
    name: 'Fete Music Hall',
    url: 'https://fetemusichall.com/',
    categories: ['Small venues'],
    state: 'RI',
    city: 'Providence',
    metro: 'Providence',
    allAges: '18+ (varies by event)',
    address: '103 Dike St, Providence, RI 02909',
    capacity: null, // sources disagree (one cites ~900); not confident enough to publish a number
    transit: null,
    established: null,
  },
  {
    name: 'The Met',
    url: 'https://themetri.com/',
    categories: ['Small venues', 'Legendary'],
    state: 'RI',
    city: 'Pawtucket',
    metro: 'Providence',
    allAges: '18+ (varies by event)',
    address: '1005 Main St, Pawtucket, RI 02860',
    capacity: null, // not published anywhere citable
    transit: null,
    established: null,
    notableShows: [
      'Self-described (on its own site) as a continuation of two of Providence’s iconic clubs, Lupo’s Heartbreak Hotel and The Met Cafe — not the same building either operated in, but the acknowledged successor to both',
    ],
  },
  {
    name: 'Providence Performing Arts Center',
    url: 'https://www.ppacri.org/',
    categories: ['Classic theatres'],
    state: 'RI',
    city: 'Providence',
    metro: 'Providence',
    allAges: 'all ages',
    address: '220 Weybosset St, Providence, RI 02903',
    capacity: 3100,
    transit: null,
    established: 1928, // opened as Loew's State Theatre
    notableShows: [
      'King Crimson recorded a 1974 concert here, released as the track "Providence" on the album Red',
      'Hosted the Bee Gees, The Doors, Queen, and Fleetwood Mac during 1973–74 alone',
    ],
  },
  {
    name: 'Amica Mutual Pavilion',
    url: 'https://www.amicamutualpavilion.com/',
    categories: ['Arenas & Stadiums', 'Legendary'],
    state: 'RI',
    city: 'Providence',
    metro: 'Providence',
    allAges: 'all ages',
    address: '1 La Salle Square, Providence, RI 02903',
    capacity: 14000,
    transit: null,
    established: 1972, // opened as the Providence Civic Center; later Dunkin' Donuts Center
    notableShows: [
      'Led Zeppelin played here in 1973, on a night Jimmy Page later called one of the best of the whole Houses of the Holy tour',
      'Frank Sinatra performed here ten times between 1972 and 1992',
      'The Grateful Dead played nineteen shows here between 1973 and 1987',
      'Elvis Presley performed three times, in 1974, 1976, and 1977',
    ],
  },
  {
    name: 'Strand Ballroom & Theatre',
    url: 'https://thestrandri.com/',
    categories: ['Small venues', 'Classic theatres', 'Legendary'],
    state: 'RI',
    city: 'Providence',
    metro: 'Providence',
    allAges: '18+ (varies by event)',
    address: '79 Washington St, Providence, RI 02903',
    capacity: 1700, // after the balcony reopened in a 2003 renovation
    transit: null,
    established: 1915, // opened as a vaudeville theatre; operated as Lupo's Heartbreak Hotel (live music) 2003–2017 before its current name
  },

  // Batch 3: Portland, ME — no rail/subway system, transit left null
  // throughout. Excluded from consideration: Port City Music Hall
  // (closed 2020), Empire (rebranded to a comedy club in 2019), and the
  // planned Live Nation "Portland Music Hall" (not open yet, targeting
  // 2027) — see decision log.
  {
    name: 'State Theatre',
    url: 'https://statetheatreportland.com/',
    categories: ['Classic theatres', 'Legendary'],
    state: 'ME',
    city: 'Portland',
    metro: 'Portland',
    allAges: '18+ (varies by event)',
    address: '609 Congress St, Portland, ME 04101',
    capacity: 1870,
    transit: null,
    established: 1929,
    notableShows: [
      "Opened Nov. 8, 1929 as a movie palace with the premiere of Gloria Swanson's first talkie, The Trespasser",
      'Restored as a concert hall in the 1990s–2000s; since 2010 has hosted the Avett Brothers, Elvis Costello, Pixies, Arctic Monkeys, Queens of the Stone Age and Lucinda Williams',
    ],
  },
  {
    name: 'Merrill Auditorium',
    url: 'https://www.portlandmaine.gov/1144/Merrill-Auditorium',
    categories: ['Classic theatres'],
    state: 'ME',
    city: 'Portland',
    metro: 'Portland',
    allAges: 'all ages',
    address: '20 Myrtle St, Portland, ME 04101',
    capacity: 1908,
    transit: null,
    established: 1912,
    notableShows: ['Deep Purple and Tony Bennett both performed here in fall 2019'],
  },
  {
    name: 'Cross Insurance Arena',
    url: 'https://www.crossarenaportland.com/',
    categories: ['Arenas & Stadiums', 'Legendary'],
    state: 'ME',
    city: 'Portland',
    metro: 'Portland',
    allAges: 'all ages',
    address: '1 Civic Center Square, Portland, ME 04101',
    capacity: 6206,
    transit: null,
    established: '1977 // opened as Cumberland County Civic Center; renamed Cross Insurance Arena in 2014 after a $33M renovation',
    notableShows: [
      "ZZ Top played the arena's inaugural concert on March 3, 1977",
      'Elvis Presley was booked to play Aug. 17, 1977 but died the day of the scheduled show',
    ],
  },
  {
    name: "Thompson's Point",
    url: 'https://statetheatreportland.com/thompsons-point-info/',
    categories: ['Outdoor'],
    state: 'ME',
    city: 'Portland',
    metro: 'Portland',
    allAges: 'all ages',
    address: '207 Thompsons Point, Portland, ME 04102',
    capacity: 5000,
    transit: null,
    established: 2015,
  },
  {
    name: 'One Longfellow Square',
    url: 'https://onelongfellowsquare.com/',
    categories: ['Small venues'],
    state: 'ME',
    city: 'Portland',
    metro: 'Portland',
    allAges: 'all ages',
    address: '181 State St, Portland, ME 04101',
    capacity: 200,
    transit: null,
    established: 1999,
  },
  {
    name: 'SPACE',
    url: 'https://space538.org/',
    categories: ['Small venues'],
    state: 'ME',
    city: 'Portland',
    metro: 'Portland',
    allAges: 'all ages',
    address: '538 Congress St, Portland, ME 04101',
    capacity: 300,
    transit: null,
    established: 2002,
  },
  {
    name: 'Aura',
    url: 'https://auramaine.com/',
    categories: ['Small venues'],
    state: 'ME',
    city: 'Portland',
    metro: 'Portland',
    allAges: '18+ (varies by event)',
    address: '121 Center St, Portland, ME 04101',
    capacity: 1000,
    transit: null,
    established: '1997 // opened as Asylum nightclub; renamed and expanded to Aura in 2017 after a $9.1M renovation',
  },
  {
    name: 'Bayside Bowl',
    url: 'https://www.baysidebowl.com/music-events',
    categories: ['Tiny venues', 'Outdoor'],
    state: 'ME',
    city: 'Portland',
    metro: 'Portland',
    allAges: 'all ages',
    address: '58 Alder St, Portland, ME 04101',
    capacity: null,
    transit: null,
    established: null,
  },
  {
    name: "Geno's Rock Club",
    url: 'https://www.genosrockclub.com/',
    categories: ['Tiny venues'],
    state: 'ME',
    city: 'Portland',
    metro: 'Portland',
    allAges: '21+',
    address: '625 Congress St, Portland, ME 04101',
    capacity: null,
    transit: null,
    established: 1983,
  },
  {
    name: 'Blue',
    url: 'https://www.blueportlandmaine.org/',
    categories: ['Tiny venues'],
    state: 'ME',
    city: 'Portland',
    metro: 'Portland',
    allAges: '18+ (varies by event)',
    address: '650A Congress St, Portland, ME 04101',
    capacity: null,
    transit: null,
    established: 2005,
  },
  {
    name: 'Portland House of Music and Events',
    url: 'https://www.portlandhouseofmusic.com/',
    categories: ['Small venues'],
    state: 'ME',
    city: 'Portland',
    metro: 'Portland',
    allAges: '21+',
    address: '25 Temple St, Portland, ME 04101',
    capacity: null,
    transit: null,
    established: 2015,
  },

  // Batch 4: Burlington, VT — no rail/subway system, transit left null
  // throughout. Excluded from consideration: 242 Main (effectively
  // closed ~2016, Memorial Auditorium itself closed for renovation),
  // Club Metronome (closed with Nectar's), ArtsRiot (closed permanently
  // after a rebrand attempt), and the city-run Battery Park summer
  // concert series (no single site of record) — see decision log.
  {
    name: 'Higher Ground',
    url: 'https://highergroundmusic.com/',
    categories: ['Small venues', 'Legendary'],
    state: 'VT',
    city: 'South Burlington',
    metro: 'Burlington',
    allAges: 'all ages', // venue FAQ: shows are typically all ages unless otherwise noted
    address: '1214 Williston Road, South Burlington, VT 05403',
    capacity: 1100, // per a Vermont Supreme Court filing on the venue's zoning case, reported by VTDigger
    transit: null,
    established: '1998', // opened in Winooski in 1998; later moved to its current South Burlington location
    notableShows: [
      "Opening night, April 17, 1998 (at the original Winooski location), was the live debut of Trey Anastasio's solo band 8 Foot Fluorescent Tubes, including the first-ever performance of 'First Tube'",
      'Long-running home base for Higher Ground Presents, which also produces the Grand Point North festival at Waterfront Park',
    ],
  },
  {
    name: 'Flynn Center for the Performing Arts',
    url: 'https://www.flynnvt.org/',
    categories: ['Classic theatres', 'Legendary'],
    state: 'VT',
    city: 'Burlington',
    metro: 'Burlington',
    allAges: 'all ages',
    address: '153 Main Street, Burlington, VT 05401',
    capacity: 1439, // Main Stage seating capacity, per flynnvt.org
    transit: null,
    established: '1930 // built as an Art Deco movie palace; became the nonprofit Flynn Center in 1981, fully restored to its Art Deco appearance by 2000',
    notableShows: [
      'Home of the Burlington Discover Jazz Festival since it was founded in 1984, hosting acts like Sarah Vaughan and the Modern Jazz Quartet in its early years',
    ],
  },
  {
    name: "Nectar's",
    url: 'https://liveatnectars.com/',
    categories: ['Small venues', 'Legendary'],
    state: 'VT',
    city: 'Burlington',
    metro: 'Burlington',
    allAges: '18+ (varies by event)',
    address: '188 Main Street, Burlington, VT 05401',
    capacity: null, // no reliably-sourced capacity figure found
    transit: null,
    established: 1975, // permanently closed in 2025 after a 50-year run; kept here for its well-documented historical significance
    notableShows: [
      "Phish's first documented show here was December 1, 1984; the band played Nectar's roughly 47 times through 1989 and dedicated their 1992 album A Picture of Nectar to owner Nectar Rorris",
      "Trey Anastasio, on the club's closing: \"There would be no Phish without Nectar's.\"",
    ],
  },
  {
    name: 'Radio Bean',
    url: 'https://www.radiobean.com/',
    categories: ['Tiny venues'],
    state: 'VT',
    city: 'Burlington',
    metro: 'Burlington',
    allAges: '21+',
    address: '8 North Winooski Avenue, Burlington, VT 05401',
    capacity: null, // not published by the venue or a reliable independent source
    transit: null,
    established: 2000, // opened November 2000
  },
  {
    name: 'The Monkey House',
    url: 'https://www.monkeyhousevt.com/',
    categories: ['Tiny venues'],
    state: 'VT',
    city: 'Winooski',
    metro: 'Burlington',
    allAges: '21+ (varies by event)',
    address: '30 Main Street, Winooski, VT 05404',
    capacity: null, // only found on a low-reliability aggregator, not independently confirmed
    transit: null,
    established: null,
  },
  {
    name: 'Waterfront Park',
    url: 'https://ourwaterfront.org/waterfront-park/',
    categories: ['Outdoor'],
    state: 'VT',
    city: 'Burlington',
    metro: 'Burlington',
    allAges: 'all ages',
    address: '1 Lake Street, Burlington, VT 05401',
    capacity: null, // the park's own capacities document varies considerably by event/lawn layout — no single confirmed number
    transit: null,
    established: null,
  },
  {
    name: 'Grand Point North',
    url: 'https://grandpointnorth.com/',
    categories: ['Festivals', 'Outdoor'],
    state: 'VT',
    city: 'Burlington',
    metro: 'Burlington',
    allAges: 'all ages',
    address: '1 Lake Street, Burlington, VT 05401', // held at Waterfront Park
    capacity: null,
    transit: null,
    established: 2011, // founded by Grace Potter, produced with Higher Ground Presents; annual (with pandemic-era gaps)
    notableShows: [
      "2017 edition co-headlined by Trey Anastasio Band, with Mike Gordon and Page McConnell (Phish) joining Grace Potter's set",
    ],
  },
  {
    name: 'Waking Windows',
    url: 'https://www.wakingwindows.com/',
    categories: ['Festivals'],
    state: 'VT',
    city: 'Winooski',
    metro: 'Burlington',
    allAges: 'all ages',
    address: 'Downtown Winooski, VT 05404', // multi-venue festival across ~18 downtown Winooski venues
    capacity: null,
    transit: null,
    established: 2011, // began as a small, multi-day event based at The Monkey House
  },
  {
    name: 'Burlington Discover Jazz Festival',
    url: 'https://www.flynnvt.org/bdjf',
    categories: ['Festivals'],
    state: 'VT',
    city: 'Burlington',
    metro: 'Burlington',
    allAges: 'all ages',
    address: 'Multiple downtown Burlington venues (Flynn Center, Church Street Marketplace, Waterfront Park, City Hall Park)',
    capacity: null,
    transit: null,
    established: 1984, // founded by Mayor Bernie Sanders's Arts Council
  },
  {
    name: 'Champlain Valley Exposition',
    url: 'https://cvexpo.org/',
    categories: ['Arenas & Stadiums', 'Outdoor'],
    state: 'VT',
    city: 'Essex Junction',
    metro: 'Burlington',
    allAges: 'all ages',
    address: '105 Pearl Street, Essex Junction, VT 05452',
    capacity: null, // no independently-confirmed grandstand seating figure found
    transit: null,
    established: null, // exposition's founding year not confirmed from a reliable source in this pass
  },

  // Batch 5: New Haven / Hartford, CT — no subway/light rail in either
  // city (Metro-North/CTrail is commuter rail, not applicable here),
  // transit left null throughout. Excluded from consideration: The
  // State House, New Haven (closed permanently May 2023, building being
  // converted to apartments); Fairfield Theatre Company/StageOne
  // (Fairfield County, not really this metro) — see decision log.
  {
    name: "Toad's Place",
    url: 'https://www.toadsplace.com/',
    categories: ['Small venues', 'Legendary'],
    state: 'CT',
    city: 'New Haven',
    metro: 'New Haven/Hartford',
    allAges: '18+ (varies by event)',
    address: '300 York St, New Haven, CT 06511',
    capacity: null, // no confirmed figure from a reliable source
    transit: null,
    established: 1975,
    notableShows: [
      'The Rolling Stones played a surprise 700-person club show on August 12, 1989 while rehearsing nearby, described as a thank-you to Connecticut for its hospitality',
      'Bob Dylan played his first club show in 25 years here on January 12, 1990, with four sets over five hours',
      'U2 played Toad’s Place multiple times during their early tours (Dec 14, 1980; May 27, 1981; Nov 15, 1981)',
    ],
  },
  {
    name: 'College Street Music Hall',
    url: 'https://collegestreetmusichall.com/calendar/',
    categories: ['Classic theatres'],
    state: 'CT',
    city: 'New Haven',
    metro: 'New Haven/Hartford',
    allAges: 'all ages',
    address: '238 College St, New Haven, CT 06510',
    capacity: 2000,
    transit: null,
    established: '1926 // building opened as the Roger Sherman Theatre (later the Palace Theatre); reopened under the current name as College Street Music Hall in 2015',
  },
  {
    // "(New Haven)" added to disambiguate from Boston's Shubert
    // Theatre, also in this file — see the note on that entry.
    name: 'Shubert Theatre (New Haven)',
    url: 'https://www.shubert.com/',
    categories: ['Classic theatres', 'Legendary'],
    state: 'CT',
    city: 'New Haven',
    metro: 'New Haven/Hartford',
    allAges: 'all ages',
    address: '247 College St, New Haven, CT 06510',
    capacity: 1600,
    transit: null,
    established: 1914,
    notableShows: [
      'Long-running Broadway tryout house — hosted more than 300 world premieres, including Oklahoma! (1943), South Pacific (1949), The King and I (1951), My Fair Lady (1956), and The Sound of Music (1959)',
      'Its role testing shows before Broadway runs gave rise to the phrase "bombed in New Haven"',
    ],
  },
  {
    name: 'Space Ballroom',
    url: 'https://spaceballroom.com/calendar/',
    categories: ['Small venues'],
    state: 'CT',
    city: 'Hamden',
    metro: 'New Haven/Hartford',
    allAges: 'all ages',
    address: '295 Treadwell St, Hamden, CT 06514',
    capacity: null, // could not confirm from a reliable source
    transit: null,
    established: null,
  },
  {
    name: 'Cafe Nine',
    url: 'https://cafenine.com/',
    categories: ['Tiny venues'],
    state: 'CT',
    city: 'New Haven',
    metro: 'New Haven/Hartford',
    allAges: '21+',
    address: '250 State St, New Haven, CT 06510',
    capacity: null,
    transit: null,
    established: null,
  },
  {
    name: 'Best Video Film & Cultural Center',
    url: 'https://www.bestvideo.com/events',
    categories: ['Tiny venues'],
    state: 'CT',
    city: 'Hamden',
    metro: 'New Haven/Hartford',
    allAges: 'all ages',
    address: '1842 Whitney Ave, Hamden, CT 06517',
    capacity: null,
    transit: null,
    established: null,
  },
  {
    name: 'The Webster',
    url: 'https://thewebsterct.com/',
    categories: ['Small venues'],
    state: 'CT',
    city: 'Hartford',
    metro: 'New Haven/Hartford',
    allAges: 'all ages',
    address: '31 Webster St, Hartford, CT 06114',
    capacity: 1200, // Main Room; a separate Underground room within the venue holds ~350
    transit: null,
    established: 1992, // former art-deco movie theater restored/converted to a music venue in 1992
  },
  {
    name: 'Infinity Music Hall Hartford',
    url: 'https://www.infinityhall.com/Venues/Infinity-Hartford/',
    categories: ['Small venues'],
    state: 'CT',
    city: 'Hartford',
    metro: 'New Haven/Hartford',
    allAges: '18+ (varies by event)',
    address: '32 Front St, Hartford, CT 06103',
    capacity: null, // sources gave a 500–650 range, not a single confirmed figure
    transit: null,
    established: null,
  },
  {
    name: 'The Bushnell (Mortensen Hall)',
    url: 'https://www.bushnell.org/',
    categories: ['Classic theatres', 'Legendary'],
    state: 'CT',
    city: 'Hartford',
    metro: 'New Haven/Hartford',
    allAges: 'all ages',
    address: '166 Capitol Ave, Hartford, CT 06106',
    capacity: 2800,
    transit: null,
    established: 1930,
    notableShows: [
      "Bob Dylan performed at Bushnell Memorial Auditorium on October 30, 1965, documented on his official site's tour archive",
    ],
  },
  {
    name: 'The Meadows Music Theatre',
    url: 'https://www.meadowsmusictheatre.com/',
    categories: ['Arenas & Stadiums', 'Outdoor'],
    state: 'CT',
    city: 'Hartford',
    metro: 'New Haven/Hartford',
    allAges: 'all ages',
    address: '61 Savitt Way, Hartford, CT 06106',
    capacity: 30000, // roughly 7,500 indoor pavilion seats + 22,500 outdoor lawn
    transit: null,
    established: '1994 // opened as the New England Dodge Music Center; operated under several names (Meadows Music Theatre, Chevrolet Theatre, Comcast Theatre, Xfinity Theatre 2013–2025) before reverting to The Meadows Music Theatre in 2026',
  },
  {
    name: 'PeoplesBank Arena',
    url: 'https://www.peoplesbankarena.com/',
    categories: ['Arenas & Stadiums'],
    state: 'CT',
    city: 'Hartford',
    metro: 'New Haven/Hartford',
    allAges: 'all ages',
    address: '1 Civic Center Plaza, Hartford, CT 06103',
    capacity: 16000, // varies by configuration; up to ~16,600 in a center-stage concert layout
    transit: null,
    established: '1975 // opened as the Hartford Civic Center; later renamed XL Center, then PeoplesBank Arena',
  },
  {
    name: 'Arch Street Tavern',
    url: 'https://www.archstreettavern.com/',
    categories: ['Tiny venues'],
    state: 'CT',
    city: 'Hartford',
    metro: 'New Haven/Hartford',
    allAges: '21+',
    address: '85 Arch St, Hartford, CT 06103',
    capacity: null,
    transit: null,
    established: null,
  },

  // Batch 6: Manchester, NH — no rail/subway system, transit left null
  // throughout. Includes nearby Derry, Concord, and Nashua (same
  // "hub metro, real nearby towns" pattern as Cambridge under
  // Boston). Excluded from consideration: Anheuser-Busch Merrimack
  // Biergarten (occasional concerts, but primarily a corporate beer
  // garden) and Stark Brewing Co. (restaurant with occasional live
  // music); BankNH Pavilion in Gilford was also excluded as its own
  // separate Lakes Region market, not really "Manchester metro" — see
  // decision log.
  {
    name: 'SNHU Arena',
    url: 'https://www.snhuarena.com/',
    categories: ['Arenas & Stadiums', 'Legendary'],
    state: 'NH',
    city: 'Manchester',
    metro: 'Manchester',
    allAges: 'all ages',
    address: '555 Elm Street, Manchester, NH 03101',
    capacity: 11770, // hockey configuration, per Wikipedia; end-stage concert figures run higher but vary by setup
    transit: null,
    established: '2001', // opened as Manchester Civic Arena/Verizon Wireless Arena in 2001; renamed SNHU Arena in 2016
    notableShows: [
      'Trans-Siberian Orchestra has performed recurring holiday-season concerts here for many years',
      'Barack Obama and Oprah Winfrey held a campaign rally here in December 2007',
      'Journey and Toto played a co-headlining show on March 6, 2022',
    ],
  },
  {
    name: 'Palace Theatre',
    url: 'https://palacetheatre.org/',
    categories: ['Classic theatres', 'Legendary'],
    state: 'NH',
    city: 'Manchester',
    metro: 'Manchester',
    allAges: 'all ages',
    address: '80 Hanover Street, Manchester, NH 03101',
    capacity: 834,
    transit: null,
    established: 1915,
    notableShows: [
      'Regularly hosted touring vaudeville acts through 1930, including Harry Houdini, Bob Hope, and the Marx Brothers',
    ],
  },
  {
    name: 'The Rex Theatre',
    url: 'https://palacetheatre.org/venues/rex-theatre/',
    categories: ['Small venues'],
    state: 'NH',
    city: 'Manchester',
    metro: 'Manchester',
    allAges: '18+ (varies by event)',
    address: '23 Amherst Street, Manchester, NH 03101',
    capacity: 300,
    transit: null,
    established: '1940', // building opened as a movie theatre in 1940; reopened by the Palace Theatre Trust as a live-performance venue in 2019
  },
  {
    name: 'Angel City Music Hall',
    url: 'https://www.livenation.com/venue/rZ7HnEZ17fFbg/angel-city-music-hall-events',
    categories: ['Small venues'],
    state: 'NH',
    city: 'Manchester',
    metro: 'Manchester',
    allAges: '18+ (varies by event)',
    address: '179 Elm Street, Manchester, NH 03101',
    capacity: null, // no capacity figure found from a reliable source
    transit: null,
    established: null,
  },
  {
    name: 'The Shaskeen Pub',
    url: 'https://www.facebook.com/theshaskeenpub/',
    categories: ['Tiny venues'],
    state: 'NH',
    city: 'Manchester',
    metro: 'Manchester',
    allAges: '21+',
    address: '909 Elm Street, Manchester, NH 03101',
    capacity: 260,
    transit: null,
    established: null,
  },
  {
    name: 'Strange Brew Tavern',
    url: 'https://strangebrewtavern.net/',
    categories: ['Tiny venues'],
    state: 'NH',
    city: 'Manchester',
    metro: 'Manchester',
    allAges: '21+',
    address: '88 Market Street, Manchester, NH 03101',
    capacity: null,
    transit: null,
    established: 1989, // per a BBB business-registration record
  },
  {
    name: 'Tupelo Music Hall',
    url: 'https://www.tupelomusichall.com/',
    categories: ['Small venues'],
    state: 'NH',
    city: 'Derry',
    metro: 'Manchester',
    allAges: 'all ages',
    address: '10 A Street, Derry, NH 03038',
    capacity: 700,
    transit: null,
    established: '2004', // opened 2004 in a converted farmhouse in Londonderry, NH; relocated to the current Derry building in 2017
  },
  {
    name: 'Bank of New Hampshire Stage',
    url: 'https://www.ccanh.com/bank-of-nh-stage-seating-chart',
    categories: ['Small venues'],
    state: 'NH',
    city: 'Concord',
    metro: 'Manchester',
    allAges: 'all ages',
    address: '16 South Main Street, Concord, NH 03301',
    capacity: 424, // open-floor/standing configuration; ~296 when fully seated
    transit: null,
    established: '2019', // opened in the renovated former Concord Theatre building
  },
  {
    name: 'Capitol Center for the Arts (Chubb Theatre)',
    url: 'https://www.ccanh.com/',
    categories: ['Classic theatres'],
    state: 'NH',
    city: 'Concord',
    metro: 'Manchester',
    allAges: 'all ages',
    address: '44 South Main Street, Concord, NH 03301',
    capacity: 1304,
    transit: null,
    established: '1927', // opened as the Capitol Theatre in 1927; restored and reopened as Capitol Center for the Arts in 1995
  },
  {
    name: 'Nashua Center for the Arts',
    url: 'https://nashuacenterforthearts.com/',
    categories: ['Classic theatres'],
    state: 'NH',
    city: 'Nashua',
    metro: 'Manchester',
    allAges: 'all ages',
    address: '201 Main Street, Nashua, NH 03060',
    capacity: 750, // fully seated; standing-room configuration can reach ~1,000
    transit: null,
    established: 2023,
  },
];
