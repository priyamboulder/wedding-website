"use client";

// ── ReferenceEmbed ────────────────────────────────────────────────────────
// Auto-detects a URL's source and renders the appropriate embed:
//   • Spotify track / playlist / album / episode / show → iframe embed
//   • YouTube (any shape) → thumbnail-with-play that opens in a new tab
//   • Instagram (p / reel / tv) → link-preview card (IG blocks third-party
//     embeds without their script, so we degrade to a metadata card)
//   • SoundCloud → widget iframe
//   • Apple Music → embed.music.apple.com iframe
//   • Plain image URL → inline <img>
//   • Anything else → link-preview card with og:image + title, fetched
//     through POST /api/link-preview

import { useEffect, useState } from "react";
import { ExternalLink, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LinkMetadata } from "@/lib/link-preview/types";
import type { MusicReference, MusicReferenceKind } from "@/types/music";
import { classifyUrl } from "@/lib/music/references";

export interface ReferenceEmbedProps {
  url: string;
  // "card"  → full embed (default). "inline" → compact link chip only.
  variant?: "card" | "inline";
  className?: string;
  // Caller can observe the final classified kind if it needs to adjust
  // layout around the embed (e.g. widen for Spotify).
  onClassify?: (kind: MusicReferenceKind) => void;
}

export function ReferenceEmbed({
  url,
  variant = "card",
  className,
  onClassify,
}: ReferenceEmbedProps) {
  const ref = classifyUrl(url);

  useEffect(() => {
    onClassify?.(ref.kind);
  }, [ref.kind, onClassify]);

  if (variant === "inline") {
    return <InlineLink reference={ref} className={className} />;
  }

  return (
    <div className={cn("w-full", className)}>
      {renderCard(ref)}
    </div>
  );
}

// ── Card dispatch ────────────────────────────────────────────────────────

function renderCard(ref: MusicReference) {
  switch (ref.kind) {
    case "spotify":
      return <SpotifyEmbed reference={ref} />;
    case "youtube":
      return <YouTubeEmbed reference={ref} />;
    case "soundcloud":
      return <SoundcloudEmbed reference={ref} />;
    case "apple_music":
      return <AppleMusicEmbed reference={ref} />;
    case "image":
      return <ImageEmbed reference={ref} />;
    case "instagram":
    case "link":
      return <LinkCard reference={ref} />;
  }
}

// ── Spotify ──────────────────────────────────────────────────────────────

function SpotifyEmbed({ reference }: { reference: MusicReference }) {
  if (!reference.spotify_id || !reference.spotify_kind) {
    return <LinkCard reference={reference} />;
  }
  const height =
    reference.spotify_kind === "track" || reference.spotify_kind === "episode"
      ? 152
      : 352;
  const src = `https://open.spotify.com/embed/${reference.spotify_kind}/${reference.spotify_id}?utm_source=ananya`;
  return (
    <iframe
      src={src}
      height={height}
      width="100%"
      frameBorder={0}
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      className="rounded-md border border-border"
      title="Spotify embed"
    />
  );
}

// ── YouTube ──────────────────────────────────────────────────────────────
// Thumbnail + play glyph per the spec. Opens in a new tab — we don't
// autoload the heavier iframe until the user taps.

function YouTubeEmbed({ reference }: { reference: MusicReference }) {
  const id = reference.youtube_id;
  if (!id) return <LinkCard reference={reference} />;
  // hqdefault is the reliable-size thumbnail for any video age.
  const thumb = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  return (
    <a
      href={reference.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block overflow-hidden rounded-md border border-border bg-black/5"
      style={{ aspectRatio: "16 / 9" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumb}
        alt=""
        className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
        loading="lazy"
      />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-ink shadow-[0_4px_14px_rgba(0,0,0,0.25)] transition-transform group-hover:scale-110">
          <Play size={20} strokeWidth={2} fill="currentColor" />
        </span>
      </span>
      <span
        className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-sm bg-black/60 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-white"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        YouTube
      </span>
    </a>
  );
}

// ── SoundCloud ───────────────────────────────────────────────────────────

function SoundcloudEmbed({ reference }: { reference: MusicReference }) {
  const src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(
    reference.soundcloud_url ?? reference.url,
  )}&color=%23B8860B&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;
  return (
    <iframe
      src={src}
      width="100%"
      height={166}
      scrolling="no"
      frameBorder={0}
      allow="autoplay"
      loading="lazy"
      className="rounded-md border border-border"
      title="SoundCloud embed"
    />
  );
}

// ── Apple Music ──────────────────────────────────────────────────────────

function AppleMusicEmbed({ reference }: { reference: MusicReference }) {
  if (!reference.apple_embed) return <LinkCard reference={reference} />;
  return (
    <iframe
      src={reference.apple_embed}
      height={175}
      width="100%"
      frameBorder={0}
      allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
      sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
      loading="lazy"
      className="rounded-md border border-border"
      title="Apple Music embed"
    />
  );
}

// ── Plain image ──────────────────────────────────────────────────────────

function ImageEmbed({ reference }: { reference: MusicReference }) {
  return (
    <a
      href={reference.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block overflow-hidden rounded-md border border-border bg-ivory-warm"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={reference.url}
        alt=""
        className="block max-h-[320px] w-full object-cover"
        loading="lazy"
      />
    </a>
  );
}

// ── Link / Instagram card ────────────────────────────────────────────────
// Fetches og:image + title through /api/link-preview. Instagram is
// handled by the same card because IG's public embed requires their
// script and blocks cross-origin iframes.

function LinkCard({ reference }: { reference: MusicReference }) {
  const [meta, setMeta] = useState<LinkMetadata | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/link-preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: reference.url }),
        });
        if (!res.ok) throw new Error(`link-preview ${res.status}`);
        const data = (await res.json()) as LinkMetadata;
        if (!cancelled) setMeta(data);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reference.url]);

  const host = safeHost(reference.url);
  const brand =
    reference.kind === "instagram" ? "Instagram" : meta?.siteName ?? host;

  return (
    <a
      href={reference.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-stretch overflow-hidden rounded-md border border-border bg-white transition-colors hover:border-gold/40"
    >
      {(meta?.image || failed) && meta?.image && (
        <div className="relative w-[128px] flex-none bg-ivory-warm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={meta.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="min-w-0 flex-1 p-3">
        <div
          className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <span>{brand}</span>
          <ExternalLink size={10} strokeWidth={1.8} />
        </div>
        <p className="mt-1 line-clamp-2 text-[12.5px] font-medium leading-snug text-ink">
          {meta?.title ?? (failed ? reference.url : "Loading…")}
        </p>
        {meta?.description && (
          <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-ink-muted">
            {meta.description}
          </p>
        )}
      </div>
    </a>
  );
}

// ── Inline mini chip ─────────────────────────────────────────────────────

function InlineLink({
  reference,
  className,
}: {
  reference: MusicReference;
  className?: string;
}) {
  return (
    <a
      href={reference.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border border-border bg-white px-1.5 py-0.5 text-[10px] text-ink-muted transition-colors hover:border-gold/40",
        className,
      )}
    >
      <span
        className="font-mono uppercase tracking-[0.1em]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {LABEL[reference.kind]}
      </span>
      <ExternalLink size={9} strokeWidth={1.8} />
    </a>
  );
}

const LABEL: Record<MusicReferenceKind, string> = {
  spotify: "Spotify",
  youtube: "YouTube",
  instagram: "Instagram",
  soundcloud: "SoundCloud",
  apple_music: "Apple Music",
  image: "Image",
  link: "Link",
};

function safeHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
