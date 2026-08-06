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

  // Returns the current person's row if this browser has visited
  // before, or null if not — creation is a separate step now
  // (see createPerson) so the caller can show a real on-page name
  // gate instead of a prompt() before anything gets created.
  OTR.getPerson = async function () {
    const existingId = getCookie(COOKIE_NAME);
    if (!existingId) return null;

    const { data, error } = await OTR.db
      .from('people')
      .select('*')
      .eq('id', existingId)
      .single();

    if (data && !error) return data;
    // Cookie pointed at a person that no longer exists — treat as
    // no person yet rather than failing silently.
    return null;
  };

  // Creates a new person with the given display name and stores the
  // cookie. Called once, from the name-gate form's submit handler.
  OTR.createPerson = async function (name) {
    const { data, error } = await OTR.db
      .from('people')
      .insert({ display_name: name || 'Anonymous' })
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
      .select('person_id, people(id, display_name, avatar_color)')
      .eq('group_id', groupId);

    if (error) {
      console.error('Failed to fetch group members:', error);
      return [];
    }
    return data.map((row) => row.people);
  };

  // Member counts for a set of groups, keyed by group_id — powers the
  // small "N members" subtitle under each row in the group switcher
  // dropdown. One query for every group's count rather than one query
  // per group, same reasoning as getResponsesForShows.
  OTR.getGroupMemberCounts = async function (groupIds) {
    if (!groupIds || groupIds.length === 0) return {};

    const { data, error } = await OTR.db
      .from('memberships')
      .select('group_id')
      .in('group_id', groupIds);

    if (error) {
      console.error('Failed to fetch group member counts:', error);
      return {};
    }

    const counts = {};
    data.forEach((row) => {
      counts[row.group_id] = (counts[row.group_id] || 0) + 1;
    });
    return counts;
  };

  // Updates the current person's chosen avatar color — see
  // supabase/migrations/2026-07-21-add-avatar-color.sql. Picked from a
  // fixed palette (AVATAR_COLORS in index.html), not a free color
  // picker, so every choice stays legible against both the light card
  // surface and the drawer's charcoal.
  OTR.updatePersonColor = async function (personId, color) {
    const { error } = await OTR.db
      .from('people')
      .update({ avatar_color: color })
      .eq('id', personId);

    if (error) {
      console.error('Failed to update avatar color:', error);
      return false;
    }
    return true;
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

  // Looks up a group by its invite slug — the ?g=<slug> in a shared
  // link. Returns null if the slug doesn't match anything rather than
  // throwing, since a bad/stale link is an expected case, not a bug.
  OTR.getGroupBySlug = async function (slug) {
    const { data, error } = await OTR.db
      .from('groups')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('No group found for slug:', slug, error);
      return null;
    }
    return data;
  };

  // Adds a person to a group. Safe to call even if they're already a
  // member (ignoreDuplicates on the group_id+person_id unique
  // constraint) — opening the same invite link twice is a no-op.
  OTR.joinGroup = async function (personId, groupId) {
    const { error } = await OTR.db
      .from('memberships')
      .upsert(
        { group_id: groupId, person_id: personId },
        { onConflict: 'group_id,person_id', ignoreDuplicates: true }
      );

    if (error) {
      console.error('Failed to join group:', error);
      return false;
    }
    return true;
  };

  // Removes the current person from a group — the inverse of
  // joinGroup, wired to the group modal's "Leave group" button.
  // Memberships have no id of their own surfaced to the client, just
  // the group_id+person_id pair, so a plain delete keyed on both is
  // enough.
  OTR.leaveGroup = async function (personId, groupId) {
    const { error } = await OTR.db
      .from('memberships')
      .delete()
      .eq('group_id', groupId)
      .eq('person_id', personId);

    if (error) {
      console.error('Failed to leave group:', error);
      return false;
    }
    return true;
  };
})();
