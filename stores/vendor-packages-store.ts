import { create } from "zustand";
import type { VendorPackage } from "@/types/vendor-unified";
import { useVendorsStore } from "./vendors-store";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";

// ── Vendor packages (portal tenant view) ────────────────────────────────────
// Packages are the single source of truth on the vendor record in
// vendors-store (vendor.packages[]). This store is a thin facade over that
// nested array for the vendor-portal pages: mutations write back through
// `updateVendor`, and `packages` stays reactive by subscribing to the
// vendors-store and mirroring the current tenant's package list.
//
// `portal-aurora-studios` is the hard-coded logged-in-vendor id for the
// portal demo. When the portal grows beyond a single tenant, flip this to
// a session-scoped value.

const PORTAL_VENDOR_ID = "vendor-aurora-studios";

type NewPackageInput = Omit<VendorPackage, "id" | "order">;

interface VendorPackagesState {
  packages: VendorPackage[];
  addPackage: (input: NewPackageInput) => string;
  updatePackage: (id: string, patch: Partial<VendorPackage>) => void;
  deletePackage: (id: string) => void;
  toggleFeatured: (id: string) => void;
  movePackage: (id: string, dir: "up" | "down") => void;
  resetToSeed: () => void;
}

function readPortalPackages(): VendorPackage[] {
  const vendor = useVendorsStore
    .getState()
    .vendors.find((v) => v.id === PORTAL_VENDOR_ID);
  return vendor?.packages ?? [];
}

function writePortalPackages(packages: VendorPackage[]): void {
  useVendorsStore.getState().updateVendor(PORTAL_VENDOR_ID, { packages });
}

function reorderWithin(
  packages: VendorPackage[],
  id: string,
  dir: "up" | "down",
): VendorPackage[] {
  const target = packages.find((p) => p.id === id);
  if (!target) return packages;
  const group = packages
    .filter((p) => Boolean(p.seasonal) === Boolean(target.seasonal))
    .sort((a, b) => a.order - b.order);
  const idx = group.findIndex((p) => p.id === id);
  const swapIdx = dir === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= group.length) return packages;
  const swapId = group[swapIdx].id;
  return packages.map((p) => {
    if (p.id === id) return { ...p, order: group[swapIdx].order };
    if (p.id === swapId) return { ...p, order: group[idx].order };
    return p;
  });
}

export const useVendorPackagesStore = create<VendorPackagesState>()(
  (set) => {
    // Mirror the portal tenant's packages into this store so selectors
    // (e.g. `useVendorPackagesStore((s) => s.packages)`) stay reactive
    // whenever vendors-store mutates. The seed data itself lives on the
    // vendor record, not here — hydration flows in one direction.
    useVendorsStore.subscribe((state) => {
      const vendor = state.vendors.find((v) => v.id === PORTAL_VENDOR_ID);
      set({ packages: vendor?.packages ?? [] });
    });

    return {
      packages: readPortalPackages(),

      addPackage: (input) => {
        const id = `pkg-${Date.now().toString(36)}-${Math.random()
          .toString(36)
          .slice(2, 7)}`;
        const current = readPortalPackages();
        const peers = current.filter(
          (p) => Boolean(p.seasonal) === Boolean(input.seasonal),
        );
        const order = peers.length
          ? Math.max(...peers.map((p) => p.order)) + 1
          : 0;
        writePortalPackages([...current, { ...input, id, order }]);
        return id;
      },

      updatePackage: (id, patch) => {
        const current = readPortalPackages();
        writePortalPackages(
          current.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        );
      },

      deletePackage: (id) => {
        const current = readPortalPackages();
        writePortalPackages(current.filter((p) => p.id !== id));
      },

      toggleFeatured: (id) => {
        const current = readPortalPackages();
        writePortalPackages(
          current.map((p) =>
            p.id === id ? { ...p, featured: !p.featured } : p,
          ),
        );
      },

      movePackage: (id, dir) => {
        const current = readPortalPackages();
        writePortalPackages(reorderWithin(current, id, dir));
      },

      resetToSeed: () => {
        import("@/lib/vendor-unified-seed").then(({ UNIFIED_VENDORS }) => {
          const seedVendor = UNIFIED_VENDORS.find((v) => v.id === PORTAL_VENDOR_ID);
          writePortalPackages(seedVendor?.packages ?? []);
        });
      },
    };
  },
);

let _vendorPackagesSyncTimer: ReturnType<typeof setTimeout> | null = null;
useVendorPackagesStore.subscribe((state) => {
  if (_vendorPackagesSyncTimer) clearTimeout(_vendorPackagesSyncTimer);
  _vendorPackagesSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("vendor_packages_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});
