import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://frmtmjonzwdpdzpuhfdw.supabase.co'
const supabaseKey = 'Sb_publishable_1GqwIW44gpYMvHby2-Aw6Q_qouik6Ax'

export const supabase = createClient(supabaseUrl, supabaseKey)
