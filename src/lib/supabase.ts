import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

const url = supabaseUrl?.trim() ?? ''
const anonKey = supabaseAnonKey?.trim() ?? ''

if (!url) {
  throw new Error(
    '[supabase] VITE_SUPABASE_URL is missing or empty. Set it in .env (local) or Vercel Environment Variables before deploying.',
  )
}

if (!anonKey) {
  throw new Error(
    '[supabase] VITE_SUPABASE_ANON_KEY is missing or empty. Set it in .env (local) or Vercel Environment Variables before deploying.',
  )
}

/** Single Supabase client — import this everywhere; do not call createClient elsewhere. */
export const supabase: SupabaseClient = createClient(url, anonKey)

export const supabaseConfig = {
  url,
  anonKey,
} as const
