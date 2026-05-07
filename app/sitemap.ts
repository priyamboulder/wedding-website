import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/marketing/data";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ananya.wedding";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,             lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/marketplace`,  lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/stationery`,   lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/platform`,     lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/community`,    lastModified: now, changeFrequency: "daily",   priority: 0.8 },
    { url: `${BASE}/for-vendors`,  lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/studio`,       lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${BASE}/marketplace/${cat.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes];
}
