// On the Radar — Browse Venues
// Merged in from app/browse-prototype.html (see decision log, "Browse
// merged into the live app"). Loaded as a plain <script> after the
// main inline script in index.html, so it can reference that script's
// top-level consts/functions directly (mainContent, trackEvent,
// showToast, openDrawer, closeDrawer) the same way every classic
// <script> tag in this app shares one global scope — no window.OTR
// wiring needed for those, only for OTR.VENUES (data/venues.js).
//
// Curated link-out directory, not Supabase-backed — venues are static
// data (see data/venues.js), the same "why" as the original prototype:
// this is a hand-picked list of real venues, not scraped/hosted show
// data. Nothing here talks to the database except favorites (see
// below), and even that's local to the browser, not a table.

(function () {
  const VENUES = (window.OTR && window.OTR.VENUES) || [];

  const SIZES = ['Tiny venues', 'Small venues', 'Arenas & Stadiums'];
  const SIZE_ICONS = { 'Tiny venues': 'mic-2', 'Small venues': 'music', 'Arenas & Stadiums': 'building-2' };

  // Outdoor first, per direct feedback — no strong signal on the rest
  // of the order, kept in the order they were originally decided in.
  const TYPES = ['Outdoor', 'Classic theatres', 'Legendary', 'Festivals'];
  const TYPE_ICONS = { 'Outdoor': 'trees', 'Classic theatres': 'landmark', 'Legendary': 'star', 'Festivals': 'tent' };

  const REGIONS = [...new Set(VENUES.map((v) => v.metro))].sort();

  // ---- Favorites ----
  // Persisted to localStorage, per-browser — not per-person via
  // Supabase. Deliberate scope call for this first merge: favoriting
  // is inherently per-person (unlike responses, which already has
  // person_id), so real per-person sync would need a new table and a
  // stable venue id (venues are currently keyed loosely by display
  // name — see data/venues.js). localStorage gets favorites working
  // and surviving a reload today without either of those; revisit if
  // cross-device sync turns out to matter. See decision log.
  const FAVORITES_KEY = 'gigherd_favorite_venues';

  function loadFavorites() {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch (e) {
      return new Set(); // private-browsing / storage disabled — favorites just won't persist this session
    }
  }
  function saveFavorites() {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
    } catch (e) {
      // storage unavailable — nothing to do, favorites still work in-memory for this session
    }
  }

  const favorites = loadFavorites();
  const isFavorited = (v) => favorites.has(v.name);

  function updateFavoritesLandingSub() {
    const el = document.getElementById('landing-favorites-sub');
    if (!el) return;
    const n = favorites.size;
    el.textContent = n ? `${n} venue${n === 1 ? '' : 's'} saved` : "Venues you've saved";
  }

  // Re-renders whichever view is currently on screen — a favorite
  // toggle can change what's visible (the Favorites list itself) or
  // just which cards show a filled heart, depending on where you are.
  function refreshCurrentView() {
    const visible = ['favorites', 'size', 'region', 'type'].find(
      (mode) => document.getElementById(`browse-${mode}-view`).style.display !== 'none'
    );
    if (visible === 'favorites') renderFavoritesResults();
    if (visible === 'size') renderSizeResults();
    if (visible === 'region') renderRegionResults();
    if (visible === 'type') renderTypeResults();
    updateFavoritesLandingSub();
  }

  function venueCard(v) {
    const legendaryMark = v.categories.includes('Legendary')
      ? '<i data-lucide="star" class="venue-legendary-icon" title="Legendary venue"></i>'
      : '';

    const favBtn = `
      <button type="button" class="venue-fav-btn${isFavorited(v) ? ' is-favorited' : ''}"
        data-fav-toggle="${v.name}" aria-pressed="${isFavorited(v)}"
        aria-label="${isFavorited(v) ? 'Remove from favorites' : 'Add to favorites'}">
        <i data-lucide="heart"></i>
      </button>`;

    const metaBits = [];
    if (v.capacity) metaBits.push(`Cap. ${v.capacity.toLocaleString()}`);
    if (v.established) metaBits.push(`Est. ${v.established}`);
    if (v.allAges) metaBits.push(v.allAges);
    const meta = metaBits.length
      ? `<div class="venue-meta">${metaBits.map((b) => `<span>${b}</span>`).join('')}</div>`
      : '';

    const transit = v.transit
      ? `<div class="venue-transit"><i data-lucide="train-front"></i>${v.transit}</div>`
      : '';

    // Only the first notable show surfaces on the card — a running
    // bulleted list read as clutter; anyone curious enough for the
    // rest can follow the calendar link.
    let notable = '';
    if (v.notableShows && v.notableShows.length) {
      const more = v.notableShows.length > 1
        ? ` <span style="opacity:.7;">+${v.notableShows.length - 1} more</span>`
        : '';
      notable = `<div class="venue-notable">${v.notableShows[0]}${more}</div>`;
    }

    return `
      <div class="show-card">
        <div class="venue-card-top">
          <div class="venue-name">${v.name}${legendaryMark}</div>
          ${favBtn}
        </div>
        <div class="venue-location">${v.address}</div>
        ${meta}
        ${transit}
        ${notable}
        <div class="venue-card-actions">
          <a href="${v.url}" target="_blank" rel="noopener" class="btn-outline" data-venue-calendar-link="${v.name}">
            View calendar <i data-lucide="arrow-up-right" style="width:16px;height:16px;"></i>
          </a>
        </div>
      </div>
    `;
  }

  function renderResults(list, containerId, countId, emptyMessage) {
    document.getElementById(countId).textContent = `${list.length} venue${list.length === 1 ? '' : 's'}`;
    const el = document.getElementById(containerId);
    el.innerHTML = list.length
      ? list.map(venueCard).join('')
      : `<div class="show-card"><p style="opacity:.6;font-size:14px;">${emptyMessage || 'Nothing here yet — more venues coming as future batches (Providence, Portland, Burlington, New Haven/Hartford, Manchester) get built out.'}</p></div>`;
    lucide.createIcons({ root: el });

    el.querySelectorAll('[data-fav-toggle]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const name = btn.dataset.favToggle;
        const nowFavorited = !favorites.has(name);
        nowFavorited ? favorites.add(name) : favorites.delete(name);
        saveFavorites();
        if (typeof trackEvent === 'function') {
          trackEvent(nowFavorited ? 'venue_favorited' : 'venue_unfavorited', { venue: name });
        }
        refreshCurrentView();
      });
    });

    el.querySelectorAll('[data-venue-calendar-link]').forEach((a) => {
      a.addEventListener('click', () => {
        if (typeof trackEvent === 'function') {
          trackEvent('venue_calendar_clicked', { venue: a.dataset.venueCalendarLink });
        }
      });
    });
  }

  // ---- View plumbing ----
  const VIEW_IDS = ['browse-landing-view', 'browse-favorites-view', 'browse-size-view', 'browse-region-view', 'browse-type-view'];

  function hideAllBrowseViews() {
    VIEW_IDS.forEach((id) => { document.getElementById(id).style.display = 'none'; });
  }

  // Entry point — called by the drawer's "Browse Venues" click handler
  // in index.html. Hides the shows UI entirely and shows Browse in its
  // place; the only way back is the drawer (My Shows or a herd), same
  // as the original prototype's design.
  function showBrowseLanding() {
    if (typeof trackEvent === 'function') trackEvent('browse_viewed', {});
    mainContent.style.display = 'none';
    document.getElementById('browse-view').style.display = '';
    hideAllBrowseViews();
    document.getElementById('browse-landing-view').style.display = '';
    updateFavoritesLandingSub();
    // Same active-highlight language as drawerMyShowsBtn.active — shows
    // which of the two top-level drawer destinations you're currently on.
    const myShowsBtn = document.getElementById('drawer-my-shows-btn');
    if (myShowsBtn) myShowsBtn.classList.remove('active');
    const browseBtn = document.getElementById('drawer-browse-btn');
    if (browseBtn) browseBtn.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Leaving Browse for the regular shows UI (My Shows / a herd) is
  // handled directly in index.html's selectGroup()/renderMyShowsView()
  // — they hide #browse-view and clear #drawer-browse-btn's active
  // class themselves, the same direct-DOM style already used there
  // for drawerMyShowsBtn, rather than this file exporting an API for
  // it.

  function showLanding() {
    hideAllBrowseViews();
    document.getElementById('browse-landing-view').style.display = '';
    updateFavoritesLandingSub();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.getElementById('landing-region-sub').textContent =
    REGIONS.length ? REGIONS.join(', ') : 'By area';
  updateFavoritesLandingSub();

  document.querySelectorAll('.landing-row').forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      document.getElementById('browse-landing-view').style.display = 'none';
      if (mode === 'favorites') showFavoritesView();
      if (mode === 'size') showSizeView();
      if (mode === 'region') showRegionView();
      if (mode === 'type') showTypeView();
    });
  });

  document.querySelectorAll('[back-to="landing"]').forEach((btn) => {
    btn.addEventListener('click', showLanding);
  });

  // ---- Favorites view ----
  function renderFavoritesResults() {
    const list = VENUES.filter(isFavorited);
    renderResults(list, 'favorites-results', 'favorites-count',
      'No favorites yet — tap the heart on any venue to save it here.');
  }
  function showFavoritesView() {
    document.getElementById('browse-favorites-view').style.display = '';
    renderFavoritesResults();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---- By Size (single-select strip) ----
  let selectedSize = null;

  function renderSizeStrip() {
    const strip = document.getElementById('size-strip');
    strip.innerHTML = SIZES.map((s) => `
      <button type="button" class="chip-strip-item${s === selectedSize ? ' is-selected' : ''}" data-size="${s}">
        <i data-lucide="${SIZE_ICONS[s]}"></i>${s}
      </button>
    `).join('');
    lucide.createIcons({ root: strip });
    strip.querySelectorAll('[data-size]').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedSize = (selectedSize === btn.dataset.size) ? null : btn.dataset.size;
        renderSizeStrip();
        renderSizeResults();
      });
    });
  }
  function renderSizeResults() {
    const list = selectedSize ? VENUES.filter((v) => v.categories.includes(selectedSize)) : VENUES;
    renderResults(list, 'size-results', 'size-count');
  }
  function showSizeView() {
    document.getElementById('browse-size-view').style.display = '';
    if (!selectedSize) selectedSize = SIZES[0]; // starts on Tiny, per direct feedback
    renderSizeStrip();
    renderSizeResults();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---- By State/Region (single-select strip, alphabetical) ----
  let selectedRegion = null;

  function renderRegionStrip() {
    const strip = document.getElementById('region-strip');
    strip.innerHTML = REGIONS.map((r) => `
      <button type="button" class="chip-strip-item${r === selectedRegion ? ' is-selected' : ''}" data-region="${r}">${r}</button>
    `).join('');
    strip.querySelectorAll('[data-region]').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedRegion = (selectedRegion === btn.dataset.region) ? null : btn.dataset.region;
        renderRegionStrip();
        renderRegionResults();
      });
    });
  }
  function renderRegionResults() {
    const list = selectedRegion ? VENUES.filter((v) => v.metro === selectedRegion) : VENUES;
    renderResults(list, 'region-results', 'region-count');
  }
  function showRegionView() {
    document.getElementById('browse-region-view').style.display = '';
    renderRegionStrip();
    renderRegionResults();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---- By Type (horizontal chip strip, multi-select) ----
  const selectedTypes = new Set();

  function renderTypeStrip() {
    const strip = document.getElementById('type-strip');
    strip.innerHTML = TYPES.map((t) => `
      <button type="button" class="chip-strip-item${selectedTypes.has(t) ? ' is-selected' : ''}" data-type="${t}">
        <i data-lucide="${TYPE_ICONS[t]}"></i>${t}
      </button>
    `).join('');
    lucide.createIcons({ root: strip });
    strip.querySelectorAll('[data-type]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const t = btn.dataset.type;
        selectedTypes.has(t) ? selectedTypes.delete(t) : selectedTypes.add(t);
        renderTypeStrip();
        renderTypeResults();
      });
    });
  }
  function renderTypeResults() {
    let list = VENUES;
    if (selectedTypes.size) {
      list = list.filter((v) => v.categories.some((c) => selectedTypes.has(c)));
    }
    renderResults(list, 'type-results', 'type-count');
  }
  function showTypeView() {
    document.getElementById('browse-type-view').style.display = '';
    renderTypeStrip();
    renderTypeResults();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---- Drawer entry point ----
  const drawerBrowseBtn = document.getElementById('drawer-browse-btn');
  if (drawerBrowseBtn) {
    drawerBrowseBtn.addEventListener('click', () => {
      showBrowseLanding();
      closeDrawer();
    });
  }
})();
