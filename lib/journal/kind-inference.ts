// ── Kind inference for Journal entries ─────────────────────────────────────
// Given a URL (or its link-preview metadata), guess the content kind so
// the entry card can render with the right icon and layout. Heuristic —
// the user can always edit afterwards.

import type { JournalEntryKind } from "@/types/journal-entries";

const VIDEO_HOSTS = [
  "youtube.com",
  "youtu.be",
  "vimeo.com",
  "loom.com",
];

const PODCAST_HOSTS = [
  "spotify.com",
  "open.spotify.com",
  "podcasts.apple.com",
  "anchor.fm",
  "overcast.fm",
  "pocketcasts.com",
];

const SOCIAL_HOSTS = [
  "instagram.com",
  "tiktok.com",
  "twitter.com",
  "x.com",
  "pinterest.com",
  "pin.it",
  "facebook.com",
  "threads.net",
];

function hostOf(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

export function inferKind(
  url: string | undefined,
  meta?: { siteName?: string; domain?: string },
): JournalEntryKind {
  if (!url) return "note";
  const host = hostOf(url) || (meta?.domain ?? "").toLowerCase();

  if (url.toLowerCase().endsWith(".pdf")) return "pdf";
  if (VIDEO_HOSTS.some((h) => host.includes(h))) return "video";
  if (PODCAST_HOSTS.some((h) => host.includes(h))) return "podcast";
  if (SOCIAL_HOSTS.some((h) => host.includes(h))) return "social";
  return "article";
}
