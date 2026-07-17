import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://fevvtbbyzxvnanzeedzp.supabase.co";

const supabaseKey = "sb_publishable_l8Hb4ydFb7uGcjODFG8sBg_jY-jEFrF";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);
