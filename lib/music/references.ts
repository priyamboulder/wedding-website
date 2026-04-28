// ── URL → MusicReference classifier ───────────────────────────────────────
// Pure, synchronous. No fetches here — ReferenceEmbed handles async
// metadata (og:image, og:title) through the existing /api/link-preview
// endpoint. This file just maps a URL to its embed strategy.

import type { MusicReference, MusicReferenceKind } from "@/types/music";

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i;

export function classifyUrl(raw: string): MusicReference {
  const url = raw.trim();
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { kind: "link", url };
  }
  const host = parsed.hostname.replace(/^www\./, "");

  // ── Spotify ───────────────────────────────────────────────────────────
  // open.spotify.com/{kind}/{id}  — kind ∈ track|album|playlist|episode|show
  if (host === "open.spotify.com" || host === "spotify.com") {
    const parts = parsed.pathname.split("/").filter(Boolean);
    const spotifyKind = parts[0] as MusicReference["spotify_kind"] | undefined;
    const spotifyId = parts[1];
    if (
      spotifyId &&
      spotifyKind &&
      (["track", "album", "playlist", "episode", "show"] as const).includes(
        spotifyKind,
      )
    ) {
      return {
        kind: "spotify",
        url,
        spotify_kind: spotifyKind,
        spotify_id: spotifyId,
      };
    }
    return { kind: "link", url };
  }

  // ── YouTube ───────────────────────────────────────────────────────────
  // Supports: youtube.com/watch?v=..., youtu.be/..., youtube.com/shorts/...,
  // youtube.com/embed/...
  if (host === "youtube.com" || host === "m.youtube.com") {
    const v = parsed.searchParams.get("v");
    if (v) return { kind: "youtube", url, youtube_id: v };
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts[0] === "shorts" && parts[1]) {
      return { kind: "youtube", url, youtube_id: parts[1] };
    }
    if (parts[0] === "embed" && parts[1]) {
      return { kind: "youtube", url, youtube_id: parts[1] };
    }
    return { kind: "link", url };
  }
  if (host === "youtu.be") {
    const id = parsed.pathname.split("/").filter(Boolean)[0];
    if (id) return { kind: "youtube", url, youtube_id: id };
    return { kind: "link", url };
  }

  // ── Instagram ─────────────────────────────────────────────────────────
  // instagram.com/p/{id}, /reel/{id}, /tv/{id}
  if (host === "instagram.com") {
    const parts = parsed.pathname.split("/").filter(Boolean);
    const iKind = parts[0] as MusicReference["instagram_kind"] | undefined;
    const iId = parts[1];
    if (iId && iKind && (iKind === "p" || iKind === "reel" || iKind === "tv")) {
      return { kind: "instagram", url, instagram_kind: iKind, instagram_id: iId };
    }
    return { kind: "link", url };
  }

  // ── SoundCloud ────────────────────────────────────────────────────────
  // The SoundCloud widget accepts the original URL as its `url` param.
  if (host === "soundcloud.com" || host === "m.soundcloud.com") {
    return { kind: "soundcloud", url, soundcloud_url: url };
  }

  // ── Apple Music ───────────────────────────────────────────────────────
  // music.apple.com/* → embed.music.apple.com/* (same path)
  if (host === "music.apple.com") {
    const embed = `https://embed.music.apple.com${parsed.pathname}${parsed.search}`;
    return { kind: "apple_music", url, apple_embed: embed };
  }

  // ── Plain image ───────────────────────────────────────────────────────
  if (IMAGE_EXT.test(parsed.pathname)) {
    return { kind: "image", url };
  }

  return { kind: "link", url };
}

// Heuristic — is the URL one we know how to embed richly (vs. fall back
// to a link card)? Used by callers that want to decide card size ahead
// of mount.
export function isEmbeddable(kind: MusicReferenceKind): boolean {
  return kind !== "link";
}

// Extract the first http(s) URL from a string. Callers paste into any
// text field — the attached ReferenceEmbed picks up the first link.
const URL_RE = /https?:\/\/[^\s)]+/i;

export function firstUrl(text: string): string | null {
  const m = text.match(URL_RE);
  return m ? m[0] : null;
}
