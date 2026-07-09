import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Trip2Talk V6 — Supabase STORAGE ONLY.
 *
 * Reuses the existing V5 Supabase project (xwdtjwzjkqunewxjpimm) for file buckets.
 * Do NOT use Supabase Postgres, Auth, or Realtime — Postgres tables are retired.
 *
 * Service role key is server-only — never expose via NEXT_PUBLIC_*.
 */

let storageClient: SupabaseClient | null = null;

export function getSupabaseStorageAdmin(): SupabaseClient {
  if (storageClient) return storageClient;

  const url = process.env.SUPABASE_URL ?? process.env.OLD_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL (or OLD_SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  storageClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return storageClient;
}

/** Bucket names — extend V5 buckets where they already exist. */
export const STORAGE_BUCKETS = {
  /** Public read — gallery + promo photos (V5 bucket: trip-photos) */
  tripPhotos: "trip-photos",
  /** Private — bank transfer / PromptPay slips (V5 bucket: payment-slips) */
  paymentSlips: "payment-slips",
  /** Private — passport/ID uploads per booking */
  passportDocuments: "passport-documents",
  /** Private — expense receipt photos (extends V5 `receipts` pattern) */
  expenseReceipts: "expense-receipts",
} as const;

export type StorageBucket =
  (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

const PRIVATE_BUCKETS = new Set<StorageBucket>([
  STORAGE_BUCKETS.passportDocuments,
  STORAGE_BUCKETS.paymentSlips,
  STORAGE_BUCKETS.expenseReceipts,
]);

export function isPrivateBucket(bucket: StorageBucket): boolean {
  return PRIVATE_BUCKETS.has(bucket);
}

export const SIGNED_URL_TTL_SECONDS = 300;

/** Admin view/download — 5-minute signed URL (private buckets only). */
export async function createSignedDownloadUrl(
  bucket: StorageBucket,
  path: string,
  expiresInSeconds = SIGNED_URL_TTL_SECONDS,
): Promise<string> {
  const supabase = getSupabaseStorageAdmin();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data?.signedUrl) {
    throw new Error(
      `Failed to create signed download URL: ${error?.message ?? "unknown"}`,
    );
  }

  return data.signedUrl;
}

/**
 * Step 1 of upload pattern — client uploads directly to Supabase using returned token
 * (bypasses Vercel ~4.5MB body limit).
 */
export async function createSignedUploadUrl(
  bucket: StorageBucket,
  path: string,
): Promise<{ signedUrl: string; token: string; path: string }> {
  const supabase = getSupabaseStorageAdmin();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(path, { upsert: false });

  if (error || !data) {
    throw new Error(
      `Failed to create signed upload URL: ${error?.message ?? "unknown"}`,
    );
  }

  return { signedUrl: data.signedUrl, token: data.token, path };
}

/** Compliance Cron — delete all files under a booking folder prefix. */
export async function deleteStorageFolder(
  bucket: StorageBucket,
  folderPrefix: string,
): Promise<string[]> {
  const supabase = getSupabaseStorageAdmin();
  const deleted: string[] = [];

  const { data: files, error: listError } = await supabase.storage
    .from(bucket)
    .list(folderPrefix, { limit: 100 });

  if (listError) {
    throw new Error(`Failed to list storage files: ${listError.message}`);
  }

  if (!files?.length) return deleted;

  const paths = files.map(
    (f) => `${folderPrefix}/${f.name}`.replace(/\/+/g, "/"),
  );
  const { error: removeError } = await supabase.storage
    .from(bucket)
    .remove(paths);

  if (removeError) {
    throw new Error(`Failed to delete storage files: ${removeError.message}`);
  }

  deleted.push(...paths);
  return deleted;
}

/** Public URL for trip-photos bucket — no signing required. */
export function publicTripPhotoUrl(path: string): string {
  const base =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL ??
    process.env.OLD_SUPABASE_URL;
  if (!base) {
    throw new Error("Supabase URL is not configured");
  }
  return `${base}/storage/v1/object/public/${STORAGE_BUCKETS.tripPhotos}/${path}`;
}
