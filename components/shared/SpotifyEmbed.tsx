"use client";

// ── SpotifyEmbed ────────────────────────────────────────────────────────────
// Tiny iframe wrapper for Spotify's embed player. Used by Music (song-list
// previews against the brief) and HMUA (optional getting-ready playlist).
//
// Accepts either a full Spotify URI (`spotify:track:abc123`) or the parts
// (`type` + `id`); converts both to the canonical embed URL. Defaults match
// Spotify's current "compact" track player; consumers can override.

import { useMemo } from "react";

// ── Props ──────────────────────────────────────────────────────────────────

export type SpotifyEntityType = "track" | "album" | "playlist" | "artist" | "show" | "episode";

interface SpotifyEmbedByUri {
  uri: string;
  type?: never;
  id?: never;
}

interface SpotifyEmbedByParts {
  type: SpotifyEntityType;
  id: string;
  uri?: never;
}

export type SpotifyEmbedProps = (SpotifyEmbedByUri | SpotifyEmbedByParts) & {
  width?: number | string;
  height?: number | string;
  // Spotify's `compact` is the smaller player; `full` matches their default.
  size?: "compact" | "full";
  // Use the dark theme variant. Default true — the rest of the app is on
  // an ivory canvas, but the player itself reads better dark inside our
  // session cards.
  theme?: "dark" | "light";
  // Forward to the iframe's `title` attribute for screen readers.
  title?: string;
};

// ── URI parsing ────────────────────────────────────────────────────────────
// Spotify URIs have shape `spotify:<type>:<id>`. The embed URL needs
// `<type>/<id>`. Open URIs (https://open.spotify.com/<type>/<id>) work too.

const URI_PATTERN = /^spotify:(track|album|playlist|artist|show|episode):([A-Za-z0-9]+)$/;
const OPEN_URL_PATTERN = /open\.spotify\.com\/(track|album|playlist|artist|show|episode)\/([A-Za-z0-9]+)/;

function parseUri(uri: string): { type: SpotifyEntityType; id: string } | null {
  const match = uri.match(URI_PATTERN) ?? uri.match(OPEN_URL_PATTERN);
  if (!match) return null;
  return { type: match[1] as SpotifyEntityType, id: match[2] };
}

// ── Component ──────────────────────────────────────────────────────────────

export function SpotifyEmbed(props: SpotifyEmbedProps) {
  const {
    width = "100%",
    height,
    size = "compact",
    theme = "dark",
    title,
  } = props;

  const parts = useMemo(() => {
    if ("uri" in props && props.uri) return parseUri(props.uri);
    if ("type" in props && props.type && props.id) {
      return { type: props.type, id: props.id };
    }
    return null;
  }, [props]);

  if (!parts) {
    // Don't render a broken iframe if the URI is malformed. Show a soft
    // placeholder instead so the surrounding layout doesn't collapse.
    return (
      <div
        style={{
          padding: "12px 16px",
          background: "rgba(26, 26, 26, 0.04)",
          border: "1px solid rgba(26, 26, 26, 0.08)",
          borderRadius: 8,
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 12,
          color: "#6B6B6B",
        }}
      >
        Couldn't load the Spotify preview — check the link.
      </div>
    );
  }

  const themeQuery = theme === "dark" ? "?theme=0" : "";
  const src = `https://open.spotify.com/embed/${parts.type}/${parts.id}${themeQuery}`;

  // Spotify's recommended minimum heights per size + entity type. Track
  // compact = 80; full = 380. Albums/playlists default taller.
  const defaultHeight = (() => {
    if (height) return height;
    if (size === "compact") return parts.type === "track" ? 80 : 152;
    return parts.type === "track" ? 380 : 380;
  })();

  return (
    <iframe
      src={src}
      width={width}
      height={defaultHeight}
      title={title ?? `Spotify ${parts.type} preview`}
      style={{ border: 0, borderRadius: 12, display: "block" }}
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
    />
  );
}
