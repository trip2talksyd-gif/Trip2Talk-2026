import { publicTripPhotoUrl } from "@/lib/supabase-storage";

export function tripImageUrl(promoImageRef: string | null): string {
  if (!promoImageRef) return "/images/cta-horizon-placeholder.png";
  try {
    return publicTripPhotoUrl(promoImageRef);
  } catch {
    return "/images/cta-horizon-placeholder.png";
  }
}
