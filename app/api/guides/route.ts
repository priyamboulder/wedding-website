import { NextResponse } from "next/server";
import { listPublishedGuides, GUIDE_CATEGORY_LABEL } from "@/lib/guides/seed";
import { getCreator } from "@/lib/creators/seed";
import type { GuideCategory } from "@/types/guide";

// GET /api/guides
// Supports ?category=&creatorId=&sort=trending|newest|most_saved
// Reads from Supabase when available, falls back to seed data.

type Sort = "trending" | "newest" | "most_saved";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") as GuideCategory | null;
  const creatorId = searchParams.get("creatorId");
  const sort = (searchParams.get("sort") ?? "trending") as Sort;
  const limit = Number(searchParams.get("limit") ?? "50");
  const offset = Number(searchParams.get("offset") ?? "0");

  try {
    const { supabase } = await import("@/lib/supabase/client");
    let query = supabase.from("guides").select("*").eq("is_published", true);

    if (category && category in GUIDE_CATEGORY_LABEL) {
      query = query.eq("category", category);
    }
    if (creatorId) {
      query = query.eq("creator_id", creatorId);
    }

    if (sort === "newest") {
      query = query.order("published_at", { ascending: false });
    } else if (sort === "most_saved") {
      query = query.order("base_save_count", { ascending: false });
    } else {
      // trending: highest view count as simple proxy
      query = query.order("base_view_count", { ascending: false });
    }

    const { data, error } = await query.range(offset, offset + limit - 1);

    if (!error && data && data.length > 0) {
      // Enrich with creator info from seed (creators not in DB yet)
      const enriched = data.map((g) => {
        const creator = getCreator(g.creator_id);
        return {
          ...g,
          creator: creator
            ? { id: creator.id, displayName: creator.displayName, handle: creator.handle, avatarGradient: creator.avatarGradient, isVerified: creator.isVerified }
            : null,
        };
      });
      return NextResponse.json({ guides: enriched, total: enriched.length, limit, offset });
    }
  } catch {
    // Fall through to seed data
  }

  // Seed fallback
  let filtered = listPublishedGuides();
  if (category && category in GUIDE_CATEGORY_LABEL) filtered = filtered.filter((g) => g.category === category);
  if (creatorId) filtered = filtered.filter((g) => g.creatorId === creatorId);

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "newest") return (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt);
    if (sort === "most_saved") return b.baseSaveCount - a.baseSaveCount;
    const aScore = a.baseViewCount + a.baseSaveCount * 4 - daysSince(a.publishedAt) * 50;
    const bScore = b.baseViewCount + b.baseSaveCount * 4 - daysSince(b.publishedAt) * 50;
    return bScore - aScore;
  });

  const paged = sorted.slice(offset, offset + limit);
  const enriched = paged.map((g) => {
    const creator = getCreator(g.creatorId);
    return {
      ...g,
      creator: creator
        ? { id: creator.id, displayName: creator.displayName, handle: creator.handle, avatarGradient: creator.avatarGradient, isVerified: creator.isVerified }
        : null,
    };
  });

  return NextResponse.json({ guides: enriched, total: filtered.length, limit, offset });
}

function daysSince(iso: string | null): number {
  if (!iso) return 365;
  return (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24);
}
