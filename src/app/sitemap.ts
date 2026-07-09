import type { MetadataRoute } from "next";

import { SITE_URL } from "@/config/company";
import { fetchActiveCatalog } from "@/lib/trips-server";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL.replace(/\/$/, "");
  const catalog = await fetchActiveCatalog();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/trips`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/trips/private`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/gallery`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/reviews`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/privacy-policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const tripRoutes: MetadataRoute.Sitemap = catalog.map(({ template }) => ({
    url: `${base}/trips/${template.tripCode}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...tripRoutes];
}
