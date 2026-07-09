import type { TripTemplate } from "@/lib/types/database";

export function getUnitPriceAud(
  template: TripTemplate,
  subPackage?: string | null,
): number {
  if (subPackage && template.subPackages?.length) {
    const pkg = template.subPackages.find(
      (p) =>
        (p as { id?: string; name?: string }).id === subPackage ||
        (p as { id?: string; name?: string }).name === subPackage,
    ) as { priceAUD?: number; pricing?: { standard?: { amountAUD?: number } } } | undefined;
    if (pkg?.priceAUD) return pkg.priceAUD;
    if (pkg?.pricing?.standard?.amountAUD) return pkg.pricing.standard.amountAUD;
  }
  if (template.pricing?.standard?.amountAUD) {
    return template.pricing.standard.amountAUD;
  }
  return template.basePriceAUD;
}

export function getTotalPriceAud(
  template: TripTemplate,
  seats: number,
  subPackage?: string | null,
): number {
  return getUnitPriceAud(template, subPackage) * seats;
}

export function formatThaiDate(isoDate: string): string {
  const d = new Date(isoDate + "T12:00:00");
  return d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export const CATEGORY_FILTERS = [
  { key: "multiDay", label: "ทริปหลายวัน", match: (c: string) =>
    c.includes("multi") || c.includes("Multi") },
  { key: "oneDay", label: "ทริปวันเดียว", match: (c: string) =>
    c.includes("oneDay") || c.includes("OneDay") || c.includes("1DAY") },
  { key: "private", label: "ทริปส่วนตัว", match: (c: string) =>
    c.includes("private") || c.includes("Private") },
] as const;
