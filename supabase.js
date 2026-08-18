import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Si usas un archivo de configuración local separado (ej: config.local.js)
// De lo contrario, puedes mantener tus credenciales solo en tu entorno local y asegurar el repo.
import { SUPABASE_URL, SUPABASE_KEY } from './config.js'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
