import type { MetadataRoute } from "next";

import { SITE_URL } from "@/config/company";

export default function robots(): MetadataRoute.Robots {
  const base = SITE_URL.replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/booking/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
