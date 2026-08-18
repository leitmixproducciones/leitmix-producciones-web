import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://frmtmjonzwdpdzpuhfdw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZybXRtam9uendkcGR6cHVoZmR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyODQyNjgsImV4cCI6MjEwMDg2MDI2OH0.EQw6_5fBbm2Vl55cDjfgK2T0-aDzUSjecd8rlssvhxw'

export const supabase = createClient(supabaseUrl, supabaseKey)
