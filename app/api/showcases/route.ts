import { NextResponse } from "next/server";
import { listPublishedShowcases } from "@/lib/showcases/seed";
import type { ShowcaseStyleTag, ShowcaseTraditionTag, ShowcaseBudgetRange } from "@/types/showcase";
import { SHOWCASE_STYLE_LABEL, SHOWCASE_TRADITION_LABEL, SHOWCASE_BUDGET_LABEL } from "@/types/showcase";

// GET /api/showcases
// Filters: ?style=&tradition=&budget=&location=
// Sort:    ?sort=newest | most_saved | most_viewed
// Paging:  ?limit=50&offset=0
// Reads from Supabase when available, falls back to seed data.

type Sort = "newest" | "most_saved" | "most_viewed";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const style = searchParams.get("style") as ShowcaseStyleTag | null;
  const tradition = searchParams.get("tradition") as ShowcaseTraditionTag | null;
  const budget = searchParams.get("budget") as ShowcaseBudgetRange | null;
  const location = searchParams.get("location")?.toLowerCase() ?? null;
  const sort = (searchParams.get("sort") ?? "newest") as Sort;
  const limit = Number(searchParams.get("limit") ?? "50");
  const offset = Number(searchParams.get("offset") ?? "0");

  try {
    const { supabase } = await import("@/lib/supabase/client");
    let query = supabase
      .from("showcases")
      .select("*")
      .eq("is_published", true);

    if (style && style in SHOWCASE_STYLE_LABEL) {
      query = query.contains("style_tags", [style]);
    }
    if (tradition && tradition in SHOWCASE_TRADITION_LABEL) {
      query = query.contains("tradition_tags", [tradition]);
    }
    if (budget && budget in SHOWCASE_BUDGET_LABEL) {
      query = query.eq("budget_range", budget);
    }
    if (location) {
      query = query.ilike("location_city", `%${location}%`);
    }

    if (sort === "most_saved") {
      query = query.order("base_save_count", { ascending: false });
    } else if (sort === "most_viewed") {
      query = query.order("base_view_count", { ascending: false });
    } else {
      query = query.order("published_at", { ascending: false });
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    // If DB has data, return it
    if (!error && data && data.length > 0) {
      return NextResponse.json({ showcases: data, total: count ?? data.length, limit, offset });
    }
  } catch {
    // Fall through to seed data
  }

  // Seed fallback
  let filtered = listPublishedShowcases();
  if (style && style in SHOWCASE_STYLE_LABEL) filtered = filtered.filter((s) => s.styleTags.includes(style));
  if (tradition && tradition in SHOWCASE_TRADITION_LABEL) filtered = filtered.filter((s) => s.traditionTags.includes(tradition));
  if (budget && budget in SHOWCASE_BUDGET_LABEL) filtered = filtered.filter((s) => s.budgetRange === budget);
  if (location) filtered = filtered.filter((s) => s.locationCity.toLowerCase().includes(location));

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "most_saved") return b.baseSaveCount - a.baseSaveCount;
    if (sort === "most_viewed") return b.baseViewCount - a.baseViewCount;
    return (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt);
  });

  const paged = sorted.slice(offset, offset + limit);
  return NextResponse.json({ showcases: paged, total: filtered.length, limit, offset });
}
