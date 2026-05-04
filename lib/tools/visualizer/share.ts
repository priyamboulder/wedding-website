// ──────────────────────────────────────────────────────────────────────────
// Share-link encoder / decoder.
//
// Serializes the visualizer config into a URL-safe base64 token. No backend
// in v1 — the entire config rides in the URL so links work statically.
// ──────────────────────────────────────────────────────────────────────────

import type { VisualizerInputs } from "@/types/visualizer";

import { ALL_EVENT_SLUGS } from "./events";

export function encodeConfig(inputs: VisualizerInputs): string {
  const json = JSON.stringify(inputs);
  if (typeof window === "undefined") {
    return Buffer.from(json, "utf-8").toString("base64url");
  }
  // Browser path: btoa expects latin1; use TextEncoder for safety.
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function decodeConfig(token: string): VisualizerInputs | null {
  try {
    let json: string;
    if (typeof window === "undefined") {
      json = Buffer.from(token, "base64url").toString("utf-8");
    } else {
      const padded = token.replace(/-/g, "+").replace(/_/g, "/");
      const padLen = (4 - (padded.length % 4)) % 4;
      const binary = atob(padded + "=".repeat(padLen));
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      json = new TextDecoder().decode(bytes);
    }
    const parsed = JSON.parse(json) as VisualizerInputs;
    return validateInputs(parsed);
  } catch {
    return null;
  }
}

function validateInputs(raw: unknown): VisualizerInputs | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  const formats = ["intimate", "classic", "grand", "royal"];
  const styles = [
    "hindu_north",
    "hindu_south",
    "sikh",
    "muslim",
    "fusion",
    "modern",
  ];
  const prefs = ["morning_muhurat", "afternoon", "evening", "unsure"];

  if (typeof r.format !== "string" || !formats.includes(r.format)) return null;
  if (typeof r.style !== "string" || !styles.includes(r.style)) return null;
  if (
    typeof r.ceremonyTimePref !== "string" ||
    !prefs.includes(r.ceremonyTimePref)
  )
    return null;
  if (typeof r.days !== "number" || r.days < 1 || r.days > 7) return null;
  if (!Array.isArray(r.events)) return null;
  const events = r.events.filter(
    (e): e is (typeof ALL_EVENT_SLUGS)[number] =>
      typeof e === "string" &&
      (ALL_EVENT_SLUGS as readonly string[]).includes(e),
  );
  if (events.length === 0) return null;

  return {
    format: r.format as VisualizerInputs["format"],
    style: r.style as VisualizerInputs["style"],
    ceremonyTimePref: r.ceremonyTimePref as VisualizerInputs["ceremonyTimePref"],
    days: r.days,
    events,
  };
}
