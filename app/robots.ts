import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ananya.wedding";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/app/", "/planner/", "/admin/", "/api/", "/seller/", "/creator/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
