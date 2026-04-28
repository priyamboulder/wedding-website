// Social Media Content Generator — data access layer.
//
// This is the ONLY file in the module that touches localStorage. Every
// component goes through these async functions, which means the eventual
// Supabase migration is a single-file rewrite: replace the bodies here with
// Supabase calls and nothing else changes.

import type {
  GeneratedPost,
  GeneratedReel,
  Platform,
  PostStats,
  PostStatus,
  ReelTemplate,
  ReelTemplateCategory,
  SocialContentItem,
  VendorSocialProfile,
} from "./types";
import { DEFAULT_REEL_TEMPLATES } from "./seed";

const VENDOR_ID = "vendor_aurora_studios";

const KEYS = {
  profile: "ananya_social_profile",
  contentItems: "ananya_content_items",
  generatedPosts: "ananya_generated_posts",
  reelTemplates: "ananya_reel_templates",
  generatedReels: "ananya_generated_reels",
} as const;

// ── Storage primitives ─────────────────────────────────────────────────────

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota / serialization failures silently ignored
  }
}

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function now(): string {
  return new Date().toISOString();
}

// ── Vendor Social Profile ──────────────────────────────────────────────────

export async function getSocialProfile(): Promise<VendorSocialProfile | null> {
  return readJson<VendorSocialProfile | null>(KEYS.profile, null);
}

export async function saveSocialProfile(
  profile: Partial<VendorSocialProfile>,
): Promise<VendorSocialProfile> {
  const existing = readJson<VendorSocialProfile | null>(KEYS.profile, null);
  const ts = now();
  const next: VendorSocialProfile = existing
    ? {
        ...existing,
        ...profile,
        id: existing.id,
        vendor_id: existing.vendor_id,
        created_at: existing.created_at,
        updated_at: ts,
      }
    : {
        id: uid(),
        vendor_id: VENDOR_ID,
        brand_voice: profile.brand_voice ?? "",
        target_audience: profile.target_audience ?? "",
        default_hashtags: profile.default_hashtags ?? [],
        instagram_handle: profile.instagram_handle ?? "",
        preferred_platforms: profile.preferred_platforms ?? [],
        brand_colors: profile.brand_colors ?? {
          primary: "#000000",
          secondary: "#FFFFFF",
          accent: "#C9A961",
        },
        logo_url: profile.logo_url ?? "",
        created_at: ts,
        updated_at: ts,
      };
  writeJson(KEYS.profile, next);
  return next;
}

// ── Content Items ──────────────────────────────────────────────────────────

export async function getContentItems(): Promise<SocialContentItem[]> {
  return readJson<SocialContentItem[]>(KEYS.contentItems, []);
}

export async function getContentItem(id: string): Promise<SocialContentItem | null> {
  const items = readJson<SocialContentItem[]>(KEYS.contentItems, []);
  return items.find((i) => i.id === id) ?? null;
}

export async function createContentItem(
  item: Omit<SocialContentItem, "id" | "vendor_id" | "created_at" | "updated_at">,
): Promise<SocialContentItem> {
  const items = readJson<SocialContentItem[]>(KEYS.contentItems, []);
  const ts = now();
  const created: SocialContentItem = {
    ...item,
    id: uid(),
    vendor_id: VENDOR_ID,
    created_at: ts,
    updated_at: ts,
  };
  writeJson(KEYS.contentItems, [...items, created]);
  return created;
}

export async function updateContentItem(
  id: string,
  updates: Partial<SocialContentItem>,
): Promise<SocialContentItem> {
  const items = readJson<SocialContentItem[]>(KEYS.contentItems, []);
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) throw new Error(`Content item not found: ${id}`);
  const current = items[idx];
  const updated: SocialContentItem = {
    ...current,
    ...updates,
    id: current.id,
    vendor_id: current.vendor_id,
    created_at: current.created_at,
    updated_at: now(),
  };
  const next = [...items];
  next[idx] = updated;
  writeJson(KEYS.contentItems, next);
  return updated;
}

export async function deleteContentItem(id: string): Promise<void> {
  const items = readJson<SocialContentItem[]>(KEYS.contentItems, []);
  writeJson(
    KEYS.contentItems,
    items.filter((i) => i.id !== id),
  );
  // Cascade: remove associated generated posts
  const posts = readJson<GeneratedPost[]>(KEYS.generatedPosts, []);
  writeJson(
    KEYS.generatedPosts,
    posts.filter((p) => p.content_item_id !== id),
  );
}

// ── Generated Posts ────────────────────────────────────────────────────────

export async function getGeneratedPosts(filters?: {
  platform?: Platform;
  status?: PostStatus;
  content_item_id?: string;
}): Promise<GeneratedPost[]> {
  let posts = readJson<GeneratedPost[]>(KEYS.generatedPosts, []);
  if (filters?.platform) {
    posts = posts.filter((p) => p.platform === filters.platform);
  }
  if (filters?.status) {
    posts = posts.filter((p) => p.status === filters.status);
  }
  if (filters?.content_item_id) {
    posts = posts.filter((p) => p.content_item_id === filters.content_item_id);
  }
  return posts;
}

export async function getGeneratedPost(id: string): Promise<GeneratedPost | null> {
  const posts = readJson<GeneratedPost[]>(KEYS.generatedPosts, []);
  return posts.find((p) => p.id === id) ?? null;
}

export async function createGeneratedPost(
  post: Omit<GeneratedPost, "id" | "vendor_id" | "created_at" | "updated_at">,
): Promise<GeneratedPost> {
  const posts = readJson<GeneratedPost[]>(KEYS.generatedPosts, []);
  const ts = now();
  const created: GeneratedPost = {
    ...post,
    id: uid(),
    vendor_id: VENDOR_ID,
    created_at: ts,
    updated_at: ts,
  };
  writeJson(KEYS.generatedPosts, [...posts, created]);
  return created;
}

export async function createGeneratedPosts(
  posts: Omit<GeneratedPost, "id" | "vendor_id" | "created_at" | "updated_at">[],
): Promise<GeneratedPost[]> {
  const existing = readJson<GeneratedPost[]>(KEYS.generatedPosts, []);
  const ts = now();
  const created: GeneratedPost[] = posts.map((p) => ({
    ...p,
    id: uid(),
    vendor_id: VENDOR_ID,
    created_at: ts,
    updated_at: ts,
  }));
  writeJson(KEYS.generatedPosts, [...existing, ...created]);
  return created;
}

export async function updateGeneratedPost(
  id: string,
  updates: Partial<GeneratedPost>,
): Promise<GeneratedPost> {
  const posts = readJson<GeneratedPost[]>(KEYS.generatedPosts, []);
  const idx = posts.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error(`Generated post not found: ${id}`);
  const current = posts[idx];
  const updated: GeneratedPost = {
    ...current,
    ...updates,
    id: current.id,
    vendor_id: current.vendor_id,
    created_at: current.created_at,
    updated_at: now(),
  };
  const next = [...posts];
  next[idx] = updated;
  writeJson(KEYS.generatedPosts, next);
  return updated;
}

export async function deleteGeneratedPost(id: string): Promise<void> {
  const posts = readJson<GeneratedPost[]>(KEYS.generatedPosts, []);
  writeJson(
    KEYS.generatedPosts,
    posts.filter((p) => p.id !== id),
  );
}

export async function deleteGeneratedPosts(ids: string[]): Promise<void> {
  const idSet = new Set(ids);
  const posts = readJson<GeneratedPost[]>(KEYS.generatedPosts, []);
  writeJson(
    KEYS.generatedPosts,
    posts.filter((p) => !idSet.has(p.id)),
  );
}

export async function getPostCountForContentItem(
  content_item_id: string,
): Promise<number> {
  const posts = readJson<GeneratedPost[]>(KEYS.generatedPosts, []);
  return posts.filter((p) => p.content_item_id === content_item_id).length;
}

export async function getPostStats(): Promise<PostStats> {
  const posts = readJson<GeneratedPost[]>(KEYS.generatedPosts, []);
  const stats: PostStats = {
    total: posts.length,
    drafts: 0,
    approved: 0,
    scheduled: 0,
    published: 0,
  };
  for (const p of posts) {
    if (p.status === "draft") stats.drafts++;
    else if (p.status === "approved") stats.approved++;
    else if (p.status === "scheduled") stats.scheduled++;
    else if (p.status === "published") stats.published++;
  }
  return stats;
}

// ── Reel Templates ─────────────────────────────────────────────────────────

export async function getReelTemplates(filters?: {
  category?: ReelTemplateCategory;
}): Promise<ReelTemplate[]> {
  let templates = readJson<ReelTemplate[]>(KEYS.reelTemplates, []);
  if (filters?.category) {
    templates = templates.filter((t) => t.category === filters.category);
  }
  return templates.sort((a, b) => a.sort_order - b.sort_order);
}

export async function getReelTemplate(id: string): Promise<ReelTemplate | null> {
  const templates = readJson<ReelTemplate[]>(KEYS.reelTemplates, []);
  return templates.find((t) => t.id === id) ?? null;
}

export async function seedReelTemplatesIfNeeded(): Promise<void> {
  if (!isBrowser()) return;
  const existing = readJson<ReelTemplate[]>(KEYS.reelTemplates, []);
  if (existing.length > 0) return;
  writeJson(KEYS.reelTemplates, DEFAULT_REEL_TEMPLATES);
}

// ── Generated Reels ────────────────────────────────────────────────────────

export async function getGeneratedReels(): Promise<GeneratedReel[]> {
  return readJson<GeneratedReel[]>(KEYS.generatedReels, []);
}

export async function getGeneratedReel(id: string): Promise<GeneratedReel | null> {
  const reels = readJson<GeneratedReel[]>(KEYS.generatedReels, []);
  return reels.find((r) => r.id === id) ?? null;
}

export async function createGeneratedReel(
  reel: Omit<GeneratedReel, "id" | "vendor_id" | "created_at" | "updated_at">,
): Promise<GeneratedReel> {
  const reels = readJson<GeneratedReel[]>(KEYS.generatedReels, []);
  const ts = now();
  const created: GeneratedReel = {
    ...reel,
    id: uid(),
    vendor_id: VENDOR_ID,
    created_at: ts,
    updated_at: ts,
  };
  writeJson(KEYS.generatedReels, [...reels, created]);
  return created;
}

export async function updateGeneratedReel(
  id: string,
  updates: Partial<GeneratedReel>,
): Promise<GeneratedReel> {
  const reels = readJson<GeneratedReel[]>(KEYS.generatedReels, []);
  const idx = reels.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error(`Generated reel not found: ${id}`);
  const current = reels[idx];
  const updated: GeneratedReel = {
    ...current,
    ...updates,
    id: current.id,
    vendor_id: current.vendor_id,
    created_at: current.created_at,
    updated_at: now(),
  };
  const next = [...reels];
  next[idx] = updated;
  writeJson(KEYS.generatedReels, next);
  return updated;
}

export async function deleteGeneratedReel(id: string): Promise<void> {
  const reels = readJson<GeneratedReel[]>(KEYS.generatedReels, []);
  writeJson(
    KEYS.generatedReels,
    reels.filter((r) => r.id !== id),
  );
}
