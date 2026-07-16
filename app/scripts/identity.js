// On the Radar — person identity
// Plain script (see supabase/client.js for why — no ES modules).
// No accounts, no login. First visit issues a person row in Supabase
// and stores its id in a cookie on this browser. That's the whole
// auth model — see 01_Strategy/decisions.md ("Identity model: slugs
// + cookie, not accounts"). Switching browsers/clearing cookies means
// starting over as a new person; that's an accepted v1 limitation.

window.OTR = window.OTR || {};

(function () {
  const COOKIE_NAME = 'otr_person_id';
  const COOKIE_MAX_AGE_DAYS = 365;

  function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }

  function setCookie(name, value) {
    const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
    document.cookie = `${name}=${value}; max-age=${maxAge}; path=/; samesite=lax`;
  }

  // Returns the current person's row, creating one if this browser
  // has never visited before. Prompts for a display name only on
  // first visit — this is a placeholder prompt() for now, not the
  // final onboarding UI.
  OTR.getOrCreatePerson = async function () {
    const existingId = getCookie(COOKIE_NAME);

    if (existingId) {
      const { data, error } = await OTR.db
        .from('people')
        .select('*')
        .eq('id', existingId)
        .single();
      if (data && !error) return data;
      // Cookie pointed at a person that no longer exists — fall through
      // and create a new one rather than failing silently.
    }

    const name = window.prompt("What's your name?", '')?.trim() || 'Anonymous';

    const { data, error } = await OTR.db
      .from('people')
      .insert({ display_name: name })
      .select()
      .single();

    if (error) {
      console.error('Failed to create person:', error);
      return null;
    }

    setCookie(COOKIE_NAME, data.id);
    return data;
  };

  // Groups the current person belongs to, via memberships.
  OTR.getMyGroups = async function (personId) {
    const { data, error } = await OTR.db
      .from('memberships')
      .select('group_id, groups(id, name, slug)')
      .eq('person_id', personId);

    if (error) {
      console.error('Failed to fetch groups:', error);
      return [];
    }
    return data.map((row) => row.groups);
  };

  // People in a given group, via memberships.
  OTR.getGroupMembers = async function (groupId) {
    const { data, error } = await OTR.db
      .from('memberships')
      .select('person_id, people(id, display_name)')
      .eq('group_id', groupId);

    if (error) {
      console.error('Failed to fetch group members:', error);
      return [];
    }
    return data.map((row) => row.people);
  };

  // Creates a new group and makes the current person its first member.
  OTR.createGroup = async function (personId, name) {
    const { data: group, error: groupError } = await OTR.db
      .from('groups')
      .insert({ name })
      .select()
      .single();

    if (groupError) {
      console.error('Failed to create group:', groupError);
      return null;
    }

    const { error: membershipError } = await OTR.db
      .from('memberships')
      .insert({ group_id: group.id, person_id: personId });

    if (membershipError) {
      console.error('Failed to create membership:', membershipError);
      return null;
    }

    return group;
  };
})();
