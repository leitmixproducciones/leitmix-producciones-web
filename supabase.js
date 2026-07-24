import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://tu-proyecto.supabase.co'; // Cambiá por tu URL de Supabase
const SUPABASE_ANON_KEY = 'tu-clave-anonima-aqui'; // Cambiá por tu clave anon de Supabase

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ID del DJ dueño de esta página web
export const DJ_USER_ID = "TU_ID_DE_SUPABASE_AQUI";
