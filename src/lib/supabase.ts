import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (rawUrl === undefined || rawUrl.trim() === '') {
  throw new Error(
    '[supabase] VITE_SUPABASE_URL is undefined or empty at runtime. Set it in .env (local) or Vercel Environment Variables (Production / Preview / Development) and redeploy.',
  )
}

if (rawAnonKey === undefined || rawAnonKey.trim() === '') {
  throw new Error(
    '[supabase] VITE_SUPABASE_ANON_KEY is undefined or empty at runtime. Set it in .env (local) or Vercel Environment Variables (Production / Preview / Development) and redeploy.',
  )
}

const url = rawUrl.trim()
const anonKey = rawAnonKey.trim()

/** Single Supabase client — import this everywhere; do not call createClient elsewhere. */
export const supabase: SupabaseClient = createClient(url, anonKey)

export const supabaseConfig = {
  url,
  anonKey,
} as const
