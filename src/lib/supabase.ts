import { createClient } from '@supabase/supabase-js';

/**
 * Supabase browser client.
 *
 * The URL and the publishable (anon) key are safe to ship in client code; env
 * vars take precedence so the project can be pointed at another backend.
 */
const FALLBACK_URL = 'https://qsknznlwvatnfpmowvbk.supabase.co';
const FALLBACK_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFza256bmx3dmF0bmZwbW93dmJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5OTE3MjUsImV4cCI6MjEwMDU2NzcyNX0.azRlTgcL17zmplIcbBnjuqeDKDuq1VBtKo8A9Mombkc';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  FALLBACK_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
