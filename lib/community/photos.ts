// ── Photo helpers ───────────────────────────────────────────────────────────
// Resolves a profile's cover / photo strip / gallery items into a renderable
// shape the UI can treat uniformly — whether the source is a user-uploaded
// data URL or a seed-only gradient placeholder.
//
// We use gradient placeholders for seeded brides so six sample profiles with
// 4-ish photos each don't blow past the localStorage quota. Real users get
// real uploads stored as data URLs.

import type { CommunityProfile, ProfilePhoto } from "@/types/community";

export type RenderablePhoto =
  | { kind: "url"; url: string; caption?: string }
  | {
      kind: "gradient";
      colors: [string, string];
      label?: string;
      caption?: string;
    };

export function renderableFromPhoto(photo: ProfilePhoto): RenderablePhoto {
  if (photo.data_url) {
    return { kind: "url", url: photo.data_url, caption: photo.caption };
  }
  if (photo.seed_gradient) {
    return {
      kind: "gradient",
      colors: photo.seed_gradient,
      label: photo.seed_label,
      caption: photo.caption,
    };
  }
  return { kind: "gradient", colors: ["#D9C4AE", "#B8755D"] };
}

export function renderableCover(
  profile: CommunityProfile,
): RenderablePhoto | null {
  if (profile.cover_photo_data_url) {
    return { kind: "url", url: profile.cover_photo_data_url };
  }
  if (profile.cover_seed_gradient) {
    return {
      kind: "gradient",
      colors: profile.cover_seed_gradient,
      label: profile.cover_seed_label,
    };
  }
  return null;
}

// Deterministic pair of warm palette colors seeded from a string. Used as a
// last-resort fallback so every bride always has *some* cover.
const PALETTE: [string, string][] = [
  ["#F0D9C7", "#B8755D"],
  ["#E5D4C0", "#8A5444"],
  ["#EBDFCA", "#6E6354"],
  ["#F2E4CF", "#9C6F5D"],
  ["#DDD4C1", "#5C463A"],
  ["#E9D4B4", "#B8860B"],
];

export function fallbackGradientFor(seed: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

// Read a file to a data URL. Wrapped in a promise for easy use in event
// handlers. Returns null on failure.
export function readFileAsDataUrl(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve(typeof reader.result === "string" ? reader.result : null);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}
