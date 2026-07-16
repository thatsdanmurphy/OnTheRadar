// On the Radar — shows + responses
// Only 'curious' and 'going' count toward overlap (see decision log:
// "Response states are three-way: curious / going / out").

import { supabase } from '../supabase/client.js';

export async function getShowsForGroup(groupId) {
  const { data, error } = await supabase
    .from('shows')
    .select('*')
    .eq('group_id', groupId)
    .order('show_date', { ascending: true });

  if (error) {
    console.error('Failed to fetch shows:', error);
    return [];
  }
  return data;
}

// One query for every show's responses, keyed by show_id, rather
// than one query per card.
export async function getResponsesForShows(showIds) {
  if (showIds.length === 0) return {};

  const { data, error } = await supabase
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
}

// Overlap = distinct people marked curious or going. 'out' never counts.
export function overlapCount(responses) {
  return responses.filter((r) => r.status === 'curious' || r.status === 'going').length;
}

export async function setResponse(showId, personId, status) {
  const { error } = await supabase
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
}
