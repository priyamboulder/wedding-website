// ──────────────────────────────────────────────────────────────────────────
// Aesthetic Studio query helpers (production target).
//
// The Aesthetic Studio currently runs on Zustand + localStorage (see
// stores/aesthetic-store.ts). This file sketches the Supabase query surface
// the app will call once the backend is wired up. Keep it in sync with that
// store's action signatures so the swap is 1:1.
//
// Mirrors the pattern in lib/supabase/vendors.ts. No Supabase client is
// imported yet — the concrete type will be wired up in lib/supabase/client.ts
// when the env is configured.
// ──────────────────────────────────────────────────────────────────────────

import type {
  InspirationImage,
  InspirationTags,
  AestheticDirection,
  AestheticDNA,
  AestheticField,
  AestheticAmendment,
} from "@/types/aesthetic";

// Placeholder for the Supabase client singleton.
type SupabaseClientLike = {
  from: (table: string) => {
    select: (cols: string) => {
      eq: (col: string, v: string) => Promise<{ data: unknown; error: unknown }>;
    };
    insert: (rows: unknown) => Promise<{ data: unknown; error: unknown }>;
    update: (row: unknown) => {
      eq: (col: string, v: string) => Promise<{ error: unknown }>;
    };
    delete: () => { eq: (col: string, v: string) => Promise<{ error: unknown }> };
  };
  storage: {
    from: (bucket: string) => {
      upload: (
        path: string,
        file: File | Blob,
      ) => Promise<{ data: { path: string } | null; error: unknown }>;
      getPublicUrl: (path: string) => { data: { publicUrl: string } };
    };
  };
};

// ── Inspiration images ──────────────────────────────────────────────────────

export async function listImages(
  supabase: SupabaseClientLike,
  weddingId: string,
): Promise<InspirationImage[]> {
  const { data } = await supabase
    .from("inspiration_images")
    .select("*")
    .eq("wedding_id", weddingId);
  return (data ?? []) as InspirationImage[];
}

export async function ingestImageFromUrl(
  supabase: SupabaseClientLike,
  input: {
    weddingId: string;
    sourceUrl: string;
    imageBlob: Blob;
    contentHash: string;
  },
): Promise<InspirationImage> {
  // 1. Upload the fetched canonical image to storage
  const path = `${input.weddingId}/${input.contentHash}.jpg`;
  await supabase.storage.from("inspiration").upload(path, input.imageBlob);
  const { data: pub } = supabase.storage
    .from("inspiration")
    .getPublicUrl(path);

  // 2. Insert row with tag_status = "pending"; a Trigger.dev job picks it up,
  //    calls Claude Haiku 4.5 for tagging, and writes tags back.
  const row: Partial<InspirationImage> = {
    source_url: input.sourceUrl,
    storage_url: pub.publicUrl,
    content_hash: input.contentHash,
    tag_status: "pending",
    ai_tags: null,
    user_notes: "",
    direction_id: null,
  };
  await supabase.from("inspiration_images").insert(row);
  return row as InspirationImage;
}

export async function setImageTags(
  supabase: SupabaseClientLike,
  imageId: string,
  tags: InspirationTags,
): Promise<void> {
  await supabase
    .from("inspiration_images")
    .update({ ai_tags: tags, tag_status: "ready" })
    .eq("id", imageId);
}

export async function assignImageToDirection(
  supabase: SupabaseClientLike,
  imageId: string,
  directionId: string | null,
): Promise<void> {
  await supabase
    .from("inspiration_images")
    .update({ direction_id: directionId })
    .eq("id", imageId);
}

// ── Directions ──────────────────────────────────────────────────────────────

export async function listDirections(
  supabase: SupabaseClientLike,
  weddingId: string,
): Promise<AestheticDirection[]> {
  const { data } = await supabase
    .from("aesthetic_directions")
    .select("*")
    .eq("wedding_id", weddingId);
  return (data ?? []) as AestheticDirection[];
}

export async function createDirection(
  supabase: SupabaseClientLike,
  input: { weddingId: string; name: string; description?: string },
): Promise<AestheticDirection> {
  const row: Partial<AestheticDirection> = {
    name: input.name,
    description: input.description,
    synthesis: null,
    is_locked: false,
    locked_at: null,
    locked_by: null,
  };
  await supabase.from("aesthetic_directions").insert(row);
  return row as AestheticDirection;
}

// ── DNA + amendments ────────────────────────────────────────────────────────

export async function getDNA(
  supabase: SupabaseClientLike,
  weddingId: string,
): Promise<AestheticDNA | null> {
  const { data } = await supabase
    .from("aesthetic_dna")
    .select("*")
    .eq("wedding_id", weddingId);
  const rows = data as AestheticDNA[] | null;
  return rows?.[0] ?? null;
}

export async function lockDirection(
  supabase: SupabaseClientLike,
  input: {
    weddingId: string;
    directionId: string;
    dna: AestheticDNA;
  },
): Promise<void> {
  await supabase.from("aesthetic_dna").insert({
    wedding_id: input.weddingId,
    ...input.dna,
  });
  await supabase
    .from("aesthetic_directions")
    .update({ is_locked: true, locked_at: input.dna.locked_at })
    .eq("id", input.directionId);
}

export async function amendDNA(
  supabase: SupabaseClientLike,
  input: {
    weddingId: string;
    field: AestheticField;
    newValue: unknown;
    reason: string;
    amendedBy: string;
  },
): Promise<void> {
  const now = new Date().toISOString();
  const amendment: Partial<AestheticAmendment> = {
    amended_at: now,
    amended_by: input.amendedBy,
    field_changed: input.field,
    new_value: input.newValue,
    reason: input.reason,
  };
  await supabase.from("aesthetic_amendments").insert(amendment);
  await supabase
    .from("aesthetic_dna")
    .update({ [input.field]: input.newValue, amended_at: now })
    .eq("wedding_id", input.weddingId);
}

export async function listAmendments(
  supabase: SupabaseClientLike,
  weddingId: string,
): Promise<AestheticAmendment[]> {
  const { data } = await supabase
    .from("aesthetic_amendments")
    .select("*")
    .eq("wedding_id", weddingId);
  return (data ?? []) as AestheticAmendment[];
}
