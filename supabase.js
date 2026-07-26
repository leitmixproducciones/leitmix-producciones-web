import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Reemplazá este link por la URL de tu proyecto en Supabase
const SUPABASE_URL = "https://TU_PROYECTO.supabase.co";

const SUPABASE_ANON_KEY = "Sb_publishable_l8Hb4ydFb7uGcjODFG8sBg_jY-jEFrF";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
