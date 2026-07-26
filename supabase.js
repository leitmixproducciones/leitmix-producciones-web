import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Reemplazá esto por tu URL real de Supabase (ej: https://xyz123.supabase.co)
const SUPABASE_URL = "https://TU_PROYECTO.supabase.co"; 

// Reemplazá esto por tu clave 'anon' 'public' real de Supabase
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiI..."; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
