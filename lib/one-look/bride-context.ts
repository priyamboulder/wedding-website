// ── Bride context helper ──────────────────────────────────────────────────
// Pulls the current user's first name, wedding city, and wedding month/year
// from the community profile (if they've set one up) — otherwise returns a
// generic "You" fallback. Used to stamp One Look reviews at publish time so
// the public display cards have proper attribution.

import type { CommunityProfile } from "@/types/community";
import type { OneLookBrideContext } from "@/stores/one-look-store";

export function brideContextFromProfile(
  profile: CommunityProfile | null | undefined,
): OneLookBrideContext {
  if (!profile) {
    return { firstName: "You", city: "", weddingMonthYear: "" };
  }
  const firstName = (profile.display_name ?? "").trim().split(/\s+/)[0] || "You";
  const city = profile.wedding_city?.trim() || profile.hometown?.trim() || "";
  const weddingMonthYear = formatMonthYear(profile.wedding_date);
  return { firstName, city, weddingMonthYear };
}

function formatMonthYear(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d
    .toLocaleDateString("en-US", { month: "short", year: "numeric" })
    .toLowerCase();
}
