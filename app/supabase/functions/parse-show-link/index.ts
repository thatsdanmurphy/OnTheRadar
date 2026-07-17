// On the Radar — parse-show-link
// Deploy via Supabase Dashboard: Edge Functions → Deploy a new function
// → Via Editor → paste this file's contents → Deploy function.
//
// Fetches a show URL server-side and pulls out whatever structured
// data is available — JSON-LD Event schema first (richest source),
// Open Graph meta tags as a fallback. This has to run server-side
// because browsers block cross-origin fetches of arbitrary pages
// (CORS); a server has no such restriction.
//
// Known limitation, not a bug: sites with active bot protection
// (Ticketmaster, AXS, and similar) will return nothing useful here —
// tested directly, both come back empty. There's no fix for that
// within this project's scope; it's deliberate on their end. This
// works best for venue sites and smaller ticketing pages without
// that kind of protection. The Add Show form always falls back to
// manual entry when this comes back empty.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ error: 'Missing url' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        Accept: 'text/html',
      },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: `Fetch failed (${res.status})`, source_url: url }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const html = await res.text();
    const parsed = parseEventFromHtml(html, url);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function parseEventFromHtml(html: string, sourceUrl: string) {
  const result: Record<string, unknown> = { source_url: sourceUrl };

  // 1. JSON-LD Event schema — most reliable when present.
  const ldJsonBlocks = [
    ...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  ];

  for (const match of ldJsonBlocks) {
    try {
      const json = JSON.parse(match[1].trim());
      const candidates = Array.isArray(json) ? json : json['@graph'] || [json];
      const event = candidates.find((item: any) => {
        const type = item?.['@type'];
        if (!type) return false;
        if (Array.isArray(type)) return type.some((t) => String(t).toLowerCase().includes('event'));
        return String(type).toLowerCase().includes('event');
      });

      if (event) {
        if (event.name) result.title = event.name;

        if (event.startDate) {
          const d = new Date(event.startDate);
          if (!isNaN(d.getTime())) {
            result.show_date = d.toISOString().slice(0, 10);
            result.show_time = d.toISOString().slice(11, 16);
          }
        }

        if (event.location) {
          const location = Array.isArray(event.location) ? event.location[0] : event.location;
          if (location?.name) result.venue_name = location.name;
          if (location?.url) result.venue_url = location.url;
        }

        if (event.performer && !result.title) {
          const performers = Array.isArray(event.performer) ? event.performer : [event.performer];
          const names = performers.map((p: any) => (typeof p === 'string' ? p : p?.name)).filter(Boolean);
          if (names.length) result.title = names.join(', ');
        }

        break;
      }
    } catch {
      // Malformed JSON-LD block on this page — skip it, try the next one.
    }
  }

  // 2. Open Graph fallback for whatever JSON-LD didn't cover.
  const og = (prop: string): string | null => {
    const patterns = [
      new RegExp(`<meta[^>]+property=["']og:${prop}["'][^>]+content=["']([^"']*)["']`, 'i'),
      new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:${prop}["']`, 'i'),
    ];
    for (const p of patterns) {
      const m = html.match(p);
      if (m) return m[1];
    }
    return null;
  };

  if (!result.title) {
    const t = og('title');
    if (t) result.title = t;
  }

  return result;
}
