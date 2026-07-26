import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Tu URL real de Supabase
const SUPABASE_URL = "https://fevvtbbyzxvnanzeedzp.supabase.co";

// Tu clave pública (publishable) de Supabase
const SUPABASE_ANON_KEY = "Sb_publishable_l8Hb4ydFb7uGcjODFG8sBg_jY-jEFrF";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
