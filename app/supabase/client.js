// On the Radar — Supabase client
// Single source of truth for project credentials. The anon key is
// meant to be public (this is how Supabase is designed to work) —
// access control comes from RLS + unguessable slugs, not from
// hiding this key. Never put the service_role/secret key here or
// anywhere else that ships to the browser.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://wbhmcfgdhajzvainhnxj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiaG1jZmdkaGFqenZhaW5obnhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyNDAzMDcsImV4cCI6MjA5OTgxNjMwN30.wFkrcvrOl_0VuGFKTxFYxL5lEVZ4a2FjWkF8dCAOTso';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
