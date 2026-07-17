// On the Radar — shows + responses
// Plain script (see supabase/client.js for why — no ES modules).
// Only 'curious' and 'going' count toward overlap (see decision log:
// "Response states are three-way: curious / going / out").

window.OTR = window.OTR || {};

(function () {
  OTR.getShowsForGroup = async function (groupId) {
    const { data, error } = await OTR.db
      .from('shows')
      .select('*')
      .eq('group_id', groupId)
      .order('show_date', { ascending: true });

    if (error) {
      console.error('Failed to fetch shows:', error);
      return [];
    }
    return data;
  };

  // One query for every show's responses, keyed by show_id, rather
  // than one query per card.
  OTR.getResponsesForShows = async function (showIds) {
    if (showIds.length === 0) return {};

    const { data, error } = await OTR.db
      .from('responses')
      .select('show_id, person_id, status, people(display_name)')
      .in('show_id', showIds);

    if (error) {
      console.error('Failed to fetch responses:', error);
      return {};
    }

    const byShow = {};
    showIds.forEach((id) => { byShow[id] = []; });
    data.forEach((row) => {
      byShow[row.show_id].push(row);
    });
    return byShow;
  };

  // Overlap = distinct people marked curious or going. 'out' never counts.
  OTR.overlapCount = function (responses) {
    return responses.filter((r) => r.status === 'curious' || r.status === 'going').length;
  };

  OTR.createShow = async function (groupId, personId, fields) {
    const { data, error } = await OTR.db
      .from('shows')
      .insert({
        group_id: groupId,
        created_by: personId,
        title: fields.title,
        show_date: fields.show_date,
        show_time: fields.show_time || null,
        venue_name: fields.venue_name || null,
        venue_url: fields.venue_url || null,
        openers: fields.openers || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create show:', error);
      return null;
    }
    return data;
  };

  // Link autofill — fetches a show URL server-side (Edge Function
  // avoids the browser CORS wall) and parses JSON-LD/Open Graph data.
  // Returns {} on failure so the caller can fall back to manual entry.
  OTR.parseShowLink = async function (url) {
    const { data, error } = await OTR.db.functions.invoke('parse-show-link', {
      body: { url },
    });
    if (error) {
      console.error('Link autofill failed:', error);
      return {};
    }
    return data || {};
  };

  // Artist/show name search via Ticketmaster's Discovery API, scoped
  // to New England. Returns a list of candidate shows to pick from.
  OTR.searchShows = async function (keyword) {
    const { data, error } = await OTR.db.functions.invoke('search-tickets', {
      body: { keyword },
    });
    if (error) {
      console.error('Show search failed:', error);
      return [];
    }
    return data?.shows || [];
  };

  OTR.setResponse = async function (showId, personId, status) {
    const { error } = await OTR.db
      .from('responses')
      .upsert(
        { show_id: showId, person_id: personId, status, updated_at: new Date().toISOString() },
        { onConflict: 'show_id,person_id' }
      );

    if (error) {
      console.error('Failed to set response:', error);
      return false;
    }
    return true;
  };
})();
