import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Trip2Talk v7 — Supabase admin client (Postgres + Storage).
 * Service role key is server-only — never expose via NEXT_PUBLIC_*.
 */

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (adminClient) return adminClient;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  adminClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return adminClient;
}

/** @deprecated Use getSupabaseAdmin — kept for gradual migration of imports */
export const getSupabaseStorageAdmin = getSupabaseAdmin;
