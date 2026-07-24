import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://tu-proyecto.supabase.co'; // Cambiá por tu URL de Supabase
const SUPABASE_ANON_KEY = 'tu-clave-anonima-aqui'; // Cambiá por tu clave anon de Supabase

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ID del DJ dueño de esta página web

export const DJ_USER_ID = "62502e8f-f8c2-4341-9674-698ac6953efd";
