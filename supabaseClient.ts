import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// KONFIGURATION: Intitopia Backend
// ------------------------------------------------------------------

const SUPABASE_URL = 'https://jjlocrsqjyikqbdukzir.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqbG9jcnNxanlpa3FiZHVremlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MzgyNTgsImV4cCI6MjA4MzMxNDI1OH0.9jBHxhlX2ZEh3wcISOJa-1J92pXxjfPTk4iDejMhZFU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper to check if config is valid
export const isSupabaseConfigured = () => {
    // Check against placeholder text just in case, but these are now real keys
    return !SUPABASE_URL.includes("DEINE_SUPABASE_URL") && 
           !SUPABASE_ANON_KEY.includes("DEIN_SUPABASE_ANON_KEY");
};