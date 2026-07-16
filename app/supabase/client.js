// On the Radar — Supabase client
// Plain script, not an ES module. Module-to-module imports (import/export)
// are blocked by CORS when a file is opened directly (file://) rather
// than served — that was the "stuck on loading" bug. Plain <script src>
// tags don't have that restriction, so everything hangs off one shared
// window.OTR namespace instead. Load order in index.html:
//   1. Supabase UMD build (CDN, defines window.supabase)
//   2. this file (defines OTR.db)
//   3. identity.js, shows.js (define the rest of OTR)
//
// The anon key below is meant to be public — see decision log
// ("Backend is Supabase, called directly from vanilla JS"). Never put
// the service_role/secret key here or anywhere that ships to the browser.

window.OTR = window.OTR || {};

(function () {
  const SUPABASE_URL = 'https://wbhmcfgdhajzvainhnxj.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiaG1jZmdkaGFqenZhaW5obnhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyNDAzMDcsImV4cCI6MjA5OTgxNjMwN30.wFkrcvrOl_0VuGFKTxFYxL5lEVZ4a2FjWkF8dCAOTso';

  OTR.db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
})();
