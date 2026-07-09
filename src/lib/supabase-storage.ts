import { getSupabaseAdmin } from "@/lib/supabase";

/** Bucket names — extend V5 buckets where they already exist. */
export const STORAGE_BUCKETS = {
  tripPhotos: "trip-photos",
  paymentSlips: "payment-slips",
  passportDocuments: "passport-documents",
  expenseReceipts: "expense-receipts",
  bookingConfirmations: "booking-confirmations",
} as const;

export type StorageBucket =
  (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

const PRIVATE_BUCKETS = new Set<StorageBucket>([
  STORAGE_BUCKETS.passportDocuments,
  STORAGE_BUCKETS.paymentSlips,
  STORAGE_BUCKETS.expenseReceipts,
  STORAGE_BUCKETS.bookingConfirmations,
]);

export function isPrivateBucket(bucket: StorageBucket): boolean {
  return PRIVATE_BUCKETS.has(bucket);
}

export const SIGNED_URL_TTL_SECONDS = 300;

/** @deprecated Use getSupabaseAdmin from @/lib/supabase */
export const getSupabaseStorageAdmin = getSupabaseAdmin;

export async function createSignedDownloadUrl(
  bucket: StorageBucket,
  path: string,
  expiresInSeconds = SIGNED_URL_TTL_SECONDS,
): Promise<string> {
  const supabase = getSupabaseAdmin();
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

export async function createSignedUploadUrl(
  bucket: StorageBucket,
  path: string,
): Promise<{ signedUrl: string; token: string; path: string }> {
  const supabase = getSupabaseAdmin();
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

export async function deleteStorageFolder(
  bucket: StorageBucket,
  folderPrefix: string,
): Promise<string[]> {
  const supabase = getSupabaseAdmin();
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

export function publicTripPhotoUrl(path: string): string {
  const base =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  if (!base) {
    throw new Error("Supabase URL is not configured");
  }
  return `${base}/storage/v1/object/public/${STORAGE_BUCKETS.tripPhotos}/${path}`;
}
