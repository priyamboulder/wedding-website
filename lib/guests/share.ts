// ──────────────────────────────────────────────────────────────────────────
// Shareable-link encoder for the guest count estimator.
//
// Encodes the entire state into the URL hash so partners can open the same
// breakdown without any backend. Mirrors lib/readiness/share.ts.
// ──────────────────────────────────────────────────────────────────────────

import type { GuestEstimateState } from "@/types/guests";

import { ALL_EVENT_SLUGS } from "./defaults";

const DISTRIBUTIONS = [
  "mostly-local",
  "mixed",
  "mostly-traveling",
  "international",
] as const;

export function encodeState(state: GuestEstimateState): string {
  const json = JSON.stringify(state);
  if (typeof window === "undefined") {
    return Buffer.from(json, "utf-8").toString("base64url");
  }
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function decodeState(token: string): GuestEstimateState | null {
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
    const parsed = JSON.parse(json) as GuestEstimateState;
    return validate(parsed);
  } catch {
    return null;
  }
}

function validate(raw: unknown): GuestEstimateState | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  if (!Array.isArray(r.events)) return null;
  const events = r.events.filter(
    (e): e is GuestEstimateState["events"][number] =>
      typeof e === "string" &&
      ALL_EVENT_SLUGS.includes(e as never),
  );

  if (typeof r.guestDistribution !== "string") return null;
  if (!DISTRIBUTIONS.includes(r.guestDistribution as never)) return null;

  if (!Array.isArray(r.sides) || r.sides.length !== 2) return null;
  if (!r.shared || typeof r.shared !== "object") return null;
  if (typeof r.costPerHead !== "number") return null;
  if (typeof r.weddingLocation !== "string") return null;

  // Light validation only — counts are number maps the calculator already
  // clamps. Anything malformed there falls through as 0.
  return r as unknown as GuestEstimateState;
}
