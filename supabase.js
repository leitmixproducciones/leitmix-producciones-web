import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// IMPORTANTE: Reemplaza estos dos valores con los de tu panel de Supabase
const SUPABASE_URL = "https://TU_PROYECTO.supabase.co"; 
const SUPABASE_ANON_KEY = "TU_KEY_ANONIMA_AQUI"; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
