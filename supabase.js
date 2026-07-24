import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://fevvtbbyzxvnanzeedzp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_l8Hb4ydFb7uGcjODFG8sBg_jY-jEFrF';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ID del DJ dueño de esta página web (LEITMIX DJ)
export const DJ_USER_ID = "62502e8f-f8c2-4341-9674-698ac6953efd";
