import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://frmtmjonzwdpdzpuhfdw.supabase.co';
const SUPABASE_ANON_KEY = 'Sb_publishable_1GqwIW44gpYMvHby2-Aw6Q_qouik6Ax';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
