import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://fevvtbbyzxvnanzeedzp.supabase.co";

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZldnZ0YmJ5enh2bmFuemVlZHpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMzAwNjIsImV4cCI6MjA5OTgwNjA2Mn0.Fy8OcP0Bx9h1cK4sX3UR1pVYSk3pmOh2nrUco5-F_5k";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
