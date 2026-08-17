// On the Radar — shows + responses
// Plain script (see supabase/client.js for why — no ES modules).
// Only 'curious' counts toward overlap — 'out' never does, and
// 'going' was cut entirely (see decision log: response states are
// two-way now, curious/out).

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
      .select('show_id, person_id, status, people(display_name, avatar_color)')
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

  // Overlap = distinct people marked curious. 'out' never counts — and
  // 'going' doesn't exist anymore (see decision log: cut down to two
  // response states, curious/out).
  OTR.overlapCount = function (responses) {
    return responses.filter((r) => r.status === 'curious').length;
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
        source_url: fields.source_url || null,
        price_min: fields.price_min ?? null,
        price_max: fields.price_max ?? null,
        price_currency: fields.price_currency || null,
        spotify_url: fields.spotify_url || null,
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

  // Venue-name autocomplete for the Add Show form — looks up
  // Ticketmaster's venue directory so a venue link gets attached
  // automatically, without ever showing a link field.
  OTR.searchVenues = async function (keyword) {
    const { data, error } = await OTR.db.functions.invoke('search-venues', {
      body: { keyword },
    });
    if (error) {
      console.error('Venue search failed:', error);
      return [];
    }
    return data?.venues || [];
  };

  // Only the person who added a show can remove it (index.html only
  // renders the delete button when show.created_by === person.id, but
  // 'open access' RLS means the check has to actually be enforced
  // client-side rather than assumed from a hidden button).
  OTR.deleteShow = async function (showId) {
    const { error } = await OTR.db
      .from('shows')
      .delete()
      .eq('id', showId);

    if (error) {
      console.error('Failed to delete show:', error);
      return false;
    }
    return true;
  };

  // Best-effort duplicate detection for the Add Show flow — same date
  // and same (normalized) title always counts as a match; venue name
  // only has to agree when both sides actually have one set, so a
  // manually-typed show with no venue can still match a search result
  // that has one. Deliberately not fuzzy beyond trim/lowercase (e.g.
  // "Paradise Rock Club" vs "...presented by Citizens" won't match) —
  // catches the common case (two people independently adding the same
  // Ticketmaster result, or both typing the same show by hand) without
  // false-positiving on two different shows that share a date. See
  // decision log, "Duplicate shows join instead of splitting."
  OTR.findMatchingShow = function (shows, fields) {
    const norm = (s) => (s || '').trim().toLowerCase();
    const title = norm(fields.title);
    const venue = norm(fields.venue_name);
    return shows.find((s) => {
      if (s.show_date !== fields.show_date) return false;
      if (norm(s.title) !== title) return false;
      const sVenue = norm(s.venue_name);
      if (venue && sVenue) return venue === sVenue;
      return true; // no venue on one or both sides — title + date is enough
    }) || null;
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
