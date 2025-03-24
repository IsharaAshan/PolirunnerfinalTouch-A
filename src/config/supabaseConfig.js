// Supabase configuration
export const SUPABASE_URL = 'https://ijeyfeezkawiclxdevyn.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqZXlmZWV6a2F3aWNseGRldnluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0OTM3MDgsImV4cCI6MjA1NzA2OTcwOH0.4pAKsUjss2R82XA3FaKaZvh836EfIkOIojzk3Uv7wCY';

// Create a single Supabase client instance using the global object
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export default supabaseClient;
