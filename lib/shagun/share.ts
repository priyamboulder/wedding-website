// ──────────────────────────────────────────────────────────────────────────
// Shareable-link encoder for Shagun Calculator results.
//
// Encodes either GuestInputs or CoupleInputs into a base64url token that
// rides in the URL hash, so a guest texting their friend "see what mine
// said" rehydrates straight into the result screen.
// ──────────────────────────────────────────────────────────────────────────

import type {
  CoupleInputs,
  CoupleTier,
  GuestInputs,
  Location,
  Mode,
  RelationshipTier,
  Tradition,
  WeddingScale,
  WeddingStyle,
} from "@/types/shagun";

import { COUPLE_TIERS } from "./defaults";

interface GuestPayload {
  m: "g";
  v: GuestInputs;
}

interface CouplePayload {
  m: "c";
  v: CoupleInputs;
}

type Payload = GuestPayload | CouplePayload;

const RELATIONSHIP_VALUES: RelationshipTier[] = [
  "immediate-family",
  "close-extended-family",
  "outer-extended-family",
  "close-friend",
  "good-friend",
  "acquaintance-colleague",
  "parents-friend-family-friend",
  "business-relationship",
  "non-indian-friend",
];

const WEDDING_SCALE_VALUES: WeddingScale[] = [
  "intimate",
  "standard",
  "grand",
  "mega",
];

const WEDDING_STYLE_VALUES: WeddingStyle[] = [
  "traditional-banquet",
  "upscale-hotel",
  "luxury-destination",
  "casual-backyard",
  "destination-travel",
];

const TRADITION_VALUES: Tradition[] = [
  "north-indian",
  "punjabi",
  "gujarati",
  "south-indian",
  "bengali",
  "marathi",
  "muslim",
  "sikh",
  "jain",
  "mixed-fusion",
  "general",
];

const LOCATION_VALUES: Location[] = [
  "both-us",
  "us-guest-india-wedding",
  "india-guest-us-wedding",
  "both-india",
];

function encodePayload(payload: Payload): string {
  const json = JSON.stringify(payload);
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

function decodePayload(token: string): Payload | null {
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
    const parsed = JSON.parse(json) as Payload;
    return validate(parsed);
  } catch {
    return null;
  }
}

export function encodeGuestInputs(inputs: GuestInputs): string {
  return encodePayload({ m: "g", v: inputs });
}

export function encodeCoupleInputs(inputs: CoupleInputs): string {
  return encodePayload({ m: "c", v: inputs });
}

export interface DecodedShare {
  mode: Mode;
  guest?: GuestInputs;
  couple?: CoupleInputs;
}

export function decodeShare(token: string): DecodedShare | null {
  const payload = decodePayload(token);
  if (!payload) return null;
  if (payload.m === "g") {
    return { mode: "guest", guest: payload.v };
  }
  return { mode: "couple", couple: payload.v };
}

function validate(raw: unknown): Payload | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.m === "g") {
    const v = r.v as Record<string, unknown> | undefined;
    if (!v) return null;
    if (!RELATIONSHIP_VALUES.includes(v.relationship as RelationshipTier)) return null;
    if (!WEDDING_SCALE_VALUES.includes(v.weddingScale as WeddingScale)) return null;
    if (!WEDDING_STYLE_VALUES.includes(v.weddingStyle as WeddingStyle)) return null;
    if (!TRADITION_VALUES.includes(v.tradition as Tradition)) return null;
    if (!LOCATION_VALUES.includes(v.location as Location)) return null;
    if (typeof v.eventCount !== "string") return null;
    if (typeof v.reciprocityStatus !== "string") return null;
    if (typeof v.budgetComfort !== "string") return null;
    if (typeof v.attendingAs !== "string") return null;
    return { m: "g", v: v as unknown as GuestInputs };
  }
  if (r.m === "c") {
    const v = r.v as Record<string, unknown> | undefined;
    if (!v) return null;
    if (!WEDDING_SCALE_VALUES.includes(v.weddingScale as WeddingScale)) return null;
    if (!WEDDING_STYLE_VALUES.includes(v.weddingStyle as WeddingStyle)) return null;
    if (!TRADITION_VALUES.includes(v.tradition as Tradition)) return null;
    if (!LOCATION_VALUES.includes(v.location as Location)) return null;
    const counts = v.counts as Record<string, unknown> | undefined;
    if (!counts || typeof counts !== "object") return null;
    const cleaned: Record<CoupleTier, number> = {
      "immediate-family": 0,
      "close-extended-family": 0,
      "outer-extended-family": 0,
      "close-friend": 0,
      "good-friend": 0,
      "acquaintance-colleague": 0,
      "parents-friend-family-friend": 0,
      "business-relationship": 0,
    };
    for (const tier of COUPLE_TIERS) {
      const n = Number(counts[tier]);
      if (Number.isFinite(n) && n >= 0) cleaned[tier] = Math.floor(n);
    }
    return {
      m: "c",
      v: {
        counts: cleaned,
        weddingScale: v.weddingScale as WeddingScale,
        weddingStyle: v.weddingStyle as WeddingStyle,
        tradition: v.tradition as Tradition,
        location: v.location as Location,
      },
    };
  }
  return null;
}
