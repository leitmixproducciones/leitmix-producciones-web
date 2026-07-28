import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://fevvtbbyzxvnanzeedzp.supabase.co';
const SUPABASE_ANON_KEY = 'Sb_publishable_l8Hb4ydFb7uGcjODFG8sBg_jY-jEFrF';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
