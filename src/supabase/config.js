// Inicialización de Supabase con degradación elegante.
// Si faltan las variables de entorno, la app sigue funcionando en "modo local"
// (sin login ni sincronización) en lugar de romperse.

import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true, // procesa el enlace mágico al volver del correo
      },
    })
  : null

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.info(
    '[Supabase] Sin configurar: la app funciona en modo local. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env para activar login y sincronización.',
  )
}
