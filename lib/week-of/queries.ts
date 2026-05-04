import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  DiaryDay,
  WeekOfDiary,
  WeekOfDiarySummary,
} from "@/types/week-of";

const SUMMARY_COLUMNS =
  "id, title, author_persona, cover_image, tags, wedding_date, location, guest_count, status, published_at, created_at, days";

const FULL_COLUMNS =
  "id, title, author_persona, intro_text, cover_image, days, tags, wedding_date, location, guest_count, status, published_at, created_at";

type RawRow = Record<string, unknown>;

function asDays(value: unknown): DiaryDay[] {
  return Array.isArray(value) ? (value as DiaryDay[]) : [];
}

function asTags(value: unknown): string[] {
  return Array.isArray(value) ? (value as string[]) : [];
}

function toSummary(row: RawRow): WeekOfDiarySummary {
  const days = asDays(row.days);
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    author_persona: String(row.author_persona ?? ""),
    cover_image: (row.cover_image as string | null) ?? null,
    tags: asTags(row.tags),
    wedding_date: (row.wedding_date as string | null) ?? null,
    location: (row.location as string | null) ?? null,
    guest_count: (row.guest_count as number | null) ?? null,
    status: (row.status as WeekOfDiarySummary["status"]) ?? "draft",
    published_at: (row.published_at as string | null) ?? null,
    created_at: String(row.created_at ?? ""),
    day_count: days.length,
  };
}

function toFull(row: RawRow): WeekOfDiary {
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    author_persona: String(row.author_persona ?? ""),
    intro_text: (row.intro_text as string | null) ?? null,
    cover_image: (row.cover_image as string | null) ?? null,
    days: asDays(row.days),
    tags: asTags(row.tags),
    wedding_date: (row.wedding_date as string | null) ?? null,
    location: (row.location as string | null) ?? null,
    guest_count: (row.guest_count as number | null) ?? null,
    status: (row.status as WeekOfDiary["status"]) ?? "draft",
    published_at: (row.published_at as string | null) ?? null,
    created_at: String(row.created_at ?? ""),
  };
}

export async function listPublishedDiaries(
  client: SupabaseClient,
): Promise<WeekOfDiarySummary[]> {
  const { data, error } = await client
    .from("week_of_diaries")
    .select(SUMMARY_COLUMNS)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error || !data) return [];
  return (data as RawRow[]).map(toSummary);
}

export async function getDiaryById(
  client: SupabaseClient,
  id: string,
): Promise<WeekOfDiary | null> {
  const { data, error } = await client
    .from("week_of_diaries")
    .select(FULL_COLUMNS)
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) return null;
  return toFull(data as RawRow);
}
