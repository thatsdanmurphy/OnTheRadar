// On the Radar — search-tickets
// Deploy via Supabase Dashboard: Edge Functions → Deploy a new function
// → Via Editor → paste this file's contents → Deploy function.
//
// Before it'll work, also set the secret it depends on:
// Edge Functions → Secrets → add TICKETMASTER_API_KEY = <your Consumer Key>.
// The key is deliberately NOT hardcoded here — this file gets committed
// to a public GitHub repo, and unlike Supabase's anon key, Ticketmaster's
// key isn't meant to be public (someone could burn your daily quota).
//
// Searches Ticketmaster's Discovery API by artist/show keyword, scoped
// to New England (MA, CT, RI, NH, VT, ME). Read-only search — simple
// API key auth, no OAuth. Loops one request per state rather than
// gambling on undocumented comma-separated stateCode support; six
// sequential requests is nowhere near the 5 req/sec rate limit.

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

    const allEvents: any[] = [];

    for (const stateCode of NEW_ENGLAND_STATES) {
      const url =
        `https://app.ticketmaster.com/discovery/v2/events.json` +
        `?keyword=${encodeURIComponent(keyword)}` +
        `&stateCode=${stateCode}&countryCode=US&size=10&apikey=${apiKey}`;

      const res = await fetch(url);
      if (!res.ok) continue;

      const json = await res.json();
      const events = json._embedded?.events || [];
      allEvents.push(...events);
    }

    const shows = allEvents.map((e: any) => {
      const venue = e._embedded?.venues?.[0];
      return {
        title: e.name || null,
        show_date: e.dates?.start?.localDate || null,
        show_time: e.dates?.start?.localTime || null,
        venue_name: venue?.name || null,
        venue_url: venue?.url || null,
        source_url: e.url || null,
        image: e.images?.[0]?.url || null,
      };
    });

    return new Response(JSON.stringify({ shows }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
