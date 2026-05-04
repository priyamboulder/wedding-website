// Server-side query helpers for The Confessional feed.

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  MarigoldConfessionPostWithCounts,
  MarigoldConfessionType,
} from "@/types/marigold-confessional";

export interface FeedPage {
  posts: MarigoldConfessionPostWithCounts[];
  hasMore: boolean;
}

export const PAGE_SIZE = 20;

export async function listPosts(
  supabase: SupabaseClient,
  opts: { type?: MarigoldConfessionType; offset?: number; limit?: number } = {},
): Promise<FeedPage> {
  const limit = opts.limit ?? PAGE_SIZE;
  const offset = opts.offset ?? 0;

  let q = supabase
    .from("marigold_confessions_with_counts")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit); // fetch one extra to detect hasMore

  if (opts.type) q = q.eq("post_type", opts.type);

  const { data, error } = await q;
  if (error || !data) return { posts: [], hasMore: false };

  const rows = data as MarigoldConfessionPostWithCounts[];
  const hasMore = rows.length > limit;
  return { posts: hasMore ? rows.slice(0, limit) : rows, hasMore };
}

export async function countPosts(
  supabase: SupabaseClient,
): Promise<number> {
  const { count, error } = await supabase
    .from("marigold_confessions_with_counts")
    .select("id", { count: "exact", head: true });
  if (error) return 0;
  return count ?? 0;
}

export async function listComments(
  supabase: SupabaseClient,
  postId: string,
) {
  const { data, error } = await supabase
    .from("marigold_confession_comments")
    .select("id, post_id, persona_tag, content, created_at")
    .eq("post_id", postId)
    .eq("is_hidden", false)
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return data;
}

// Auto-moderation — block content that looks like it identifies a real
// person or contains contact info. Runs on both client (before submit) and
// server (defence in depth).
//
// Heuristics:
//   - Phone-like digit runs (10+ digits with optional separators).
//   - Email-shaped substrings.
//   - Two adjacent capitalised words that aren't from the safe-list (greetings,
//     post-type labels, common Indian wedding terms, place modifiers, etc.).
//
// Capital-word detection is intentionally lenient — we strip wedding /
// venue / cultural terms and a small English stop-set so the false-positive
// rate stays low. The signal is "looks like a name", not "definitely a
// name", and the user message ("please remove any names or contact info")
// is gentle on purpose.
const SAFE_CAPITAL_WORDS = new Set<string>([
  // Pronouns / starters
  "I", "I'm", "I've", "I'll", "My", "Mine", "We", "Our", "Ours", "You",
  "Your", "She", "Her", "He", "His", "They", "Them", "Their",
  // Days / months
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
  "January", "February", "March", "April", "May", "June", "July", "August",
  "September", "October", "November", "December",
  // Wedding / cultural vocab that's frequently capitalised in posts
  "Indian", "Hindu", "Sikh", "Muslim", "Christian", "Jewish", "Punjabi",
  "Tamil", "Gujarati", "Bengali", "Marwari", "South", "North", "East", "West",
  "MIL", "FIL", "BIL", "SIL", "MOH", "MOG", "MUA", "DJ", "DM", "AM", "PM",
  "MARIGOLDS", "MARIGOLD",
  // Aunty / family
  "Aunty", "Auntie", "Mom", "Dad", "Mum", "Mother", "Father", "Sister",
  "Brother", "Cousin", "Bride", "Groom", "Bridesmaid", "Bridesmaids",
  "Groomsman", "Groomsmen", "Mommy", "Daddy",
  // Events
  "Mehndi", "Mehendi", "Sangeet", "Haldi", "Pheras", "Baraat", "Reception",
  "Pre", "Post", "Sufi", "Sufiana", "Cocktail", "Wedding", "Engagement",
  // Misc common
  "Instagram", "Facebook", "WhatsApp", "TikTok", "Pinterest", "YouTube",
  "Google", "iPhone", "Android",
]);

export interface ModerationResult {
  ok: boolean;
  reason?: string;
}

export function moderate(content: string): ModerationResult {
  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return { ok: false, reason: "Post can't be empty." };
  }

  // Email
  if (/[\w.+-]+@[\w-]+\.[\w.-]+/.test(trimmed)) {
    return {
      ok: false,
      reason:
        "We keep it anonymous here — please remove any names or contact info.",
    };
  }

  // Phone-like — sequence with 10+ digits ignoring separators.
  const digitRun = trimmed.match(/(?:\+?\d[\s\-().]?){10,}/);
  if (digitRun) {
    return {
      ok: false,
      reason:
        "We keep it anonymous here — please remove any names or contact info.",
    };
  }

  // Two adjacent capitalised words that aren't in the safe-list. Splits on
  // whitespace so we count "Priya Sharma" but skip "I'm exhausted".
  const tokens = trimmed
    .split(/[\s.,!?;:"'()\[\]{}—–\-]+/)
    .filter((t) => t.length > 0);
  for (let i = 0; i < tokens.length - 1; i++) {
    const a = tokens[i];
    const b = tokens[i + 1];
    if (looksLikeName(a) && looksLikeName(b)) {
      return {
        ok: false,
        reason:
          "We keep it anonymous here — please remove any names or contact info.",
      };
    }
  }

  return { ok: true };
}

function looksLikeName(word: string): boolean {
  if (word.length < 2) return false;
  // First letter uppercase A-Z, rest lowercase letters.
  if (!/^[A-Z][a-z]+$/.test(word)) return false;
  if (SAFE_CAPITAL_WORDS.has(word)) return false;
  return true;
}
