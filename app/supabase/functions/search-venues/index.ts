// On the Radar — search-venues
// Deploy via Supabase Dashboard: Edge Functions → Deploy a new function
// → Via Editor → name it EXACTLY "search-venues" (the name field sets
// the callable URL — it can't be fixed later by renaming) → paste this
// file's contents → uncheck "Verify JWT" if the dialog offers it →
// Deploy. Reuses the TICKETMASTER_API_KEY secret already set for
// search-tickets — no new secret needed.
//
// Venue-name autocomplete for the Add Show form: as someone types a
// venue name, this looks it up against Ticketmaster's venue directory
// (scoped to New England) so a venue link gets attached automatically,
// without ever showing a link field to fill in by hand.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const NEW_ENGLAND_STATES = ['MA', 'CT', 'RI', 'NH', 'VT', 'ME'];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { keyword } = await req.json();
    if (!keyword) {
      return new Response(JSON.stringify({ error: 'Missing keyword' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('TICKETMASTER_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'TICKETMASTER_API_KEY secret not set' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const allVenues: any[] = [];

    for (const stateCode of NEW_ENGLAND_STATES) {
      const url =
        `https://app.ticketmaster.com/discovery/v2/venues.json` +
        `?keyword=${encodeURIComponent(keyword)}` +
        `&stateCode=${stateCode}&countryCode=US&size=5&apikey=${apiKey}`;

      const res = await fetch(url);
      if (!res.ok) continue;

      const json = await res.json();
      const venues = json._embedded?.venues || [];
      allVenues.push(...venues);
    }

    const results = allVenues.slice(0, 8).map((v: any) => ({
      name: v.name || null,
      url: v.url || null,
      city: v.city?.name || null,
    }));

    return new Response(JSON.stringify({ venues: results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
