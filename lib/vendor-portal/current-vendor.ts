// ── Portal tenant helpers ───────────────────────────────────────────────────
// The vendor portal is single-tenant demo — Aurora Studios. Pages read the
// tenant's data from the unified vendors-store; this file provides the id
// and a static fallback (from UNIFIED_VENDORS) for server-rendered surfaces.

import type { Vendor } from "@/types/vendor-unified";
import { UNIFIED_VENDORS } from "@/lib/vendor-unified-seed";
import { useVendorsStore } from "@/stores/vendors-store";

export const PORTAL_VENDOR_ID = "vendor-aurora-studios";

// Static seed snapshot — safe to use in server components where the reactive
// store isn't available. Kept in sync with UNIFIED_VENDORS at build time.
export const PORTAL_VENDOR_SEED: Vendor = (() => {
  const found = UNIFIED_VENDORS.find((v) => v.id === PORTAL_VENDOR_ID);
  if (!found) {
    throw new Error(`Portal vendor ${PORTAL_VENDOR_ID} missing from seed`);
  }
  return found;
})();

// Client hook: reactive read of the current portal vendor. Falls back to the
// seed snapshot if the store hasn't hydrated the tenant yet (should never
// happen since the seed seeds the store directly).
export function usePortalVendor(): Vendor {
  return useVendorsStore((s) => {
    const v = s.vendors.find((x) => x.id === PORTAL_VENDOR_ID);
    return v ?? PORTAL_VENDOR_SEED;
  });
}
