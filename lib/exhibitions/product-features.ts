// Maps StoreProduct.id → the exhibitions it was featured in. Persists beyond
// the live window so a bride who missed the Bridal Asia Spring 2026 expo can
// still see that this lehenga was featured there. Keeps "social proof" alive.
//
// Stored as a tiny static map so we can tag a handful of catalog products
// without plumbing through a database table. As the real product⇄exhibition
// linkage lands in Supabase, move this to a proper join table.

import { useExhibitionsStore } from "@/stores/exhibitions-store";
import type { Exhibition } from "@/types/exhibition";

const PRODUCT_EXHIBITION_MAP: Record<string, string[]> = {
  // Bridal Asia Spring 2026 (live)
  "p-lehenga-anarkali": ["ex-bridal-asia-spring-2026"],
  "p-saree-benares-red": ["ex-bridal-asia-spring-2026"],
  "p-sherwani-ivory": ["ex-bridal-asia-spring-2026"],
  // Jewelry Week Virtual (past — persistence matters most here)
  "p-kundan-choker": ["ex-jewelry-week-2026"],
  "p-polki-bridal": ["ex-jewelry-week-2026"],
  "p-maang-tikka": ["ex-jewelry-week-2026"],
  "p-chudi-set": ["ex-jewelry-week-2026"],
  // Delhi Designer Trunk Show (upcoming — preview provenance)
  "p-dupatta-gota": ["ex-delhi-designer-trunk"],
};

export function getExhibitionsFeaturingProduct(
  productId: string | null | undefined,
): Exhibition[] {
  if (!productId) return [];
  const exhibitionIds = PRODUCT_EXHIBITION_MAP[productId];
  if (!exhibitionIds || exhibitionIds.length === 0) return [];
  const all = useExhibitionsStore.getState().exhibitions;
  return exhibitionIds
    .map((id) => all.find((e) => e.id === id))
    .filter((e): e is Exhibition => Boolean(e));
}
