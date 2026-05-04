// ──────────────────────────────────────────────────────────────────────────
// /tools/budget/build — the Shaadi Budget builder.
//
// Server component. Loads the full reference catalog (locations, cultures,
// vendor categories, tier templates, add-ons) and hands it to a single
// client orchestrator. Vendor previews stream in client-side via
// /api/tools/budget/vendors.
//
// Anonymous-friendly: state is held in the client and mirrored to
// localStorage keyed by an anonymous_token. Auth gates appear only when
// the user clicks Save / Share / AI recommendations.
// ──────────────────────────────────────────────────────────────────────────

import { Suspense } from "react";

import { BudgetBuilder } from "@/components/marigold-tools/budget/BudgetBuilder";
import {
  listBudgetAddons,
  listBudgetCultures,
  listBudgetLocations,
  listBudgetVendorTiers,
} from "@/lib/budget";
import { getBudgetCulture } from "@/lib/budget/cultures";
import { listVendorCategories } from "@/lib/vendors/tools-queries";
import { createAnonClient } from "@/lib/supabase/server-client";
import { pageMetadata } from "@/lib/marigold/seo";

export const metadata = pageMetadata({
  title: "Build your Shaadi Budget — The Marigold Tool",
  description:
    "The budget tool that actually gets Indian weddings. Mehndi to vidaai, $50K to $5M. No signup required.",
});

export const revalidate = 300;

type SearchParams = Promise<{ location?: string; from?: string }>;

export default async function BudgetBuilderPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const supabase = createAnonClient();

  // Load everything the builder needs in parallel. Cultures-with-events is
  // resolved lazily on the client when the user picks a culture, but we
  // pre-fetch the full event lists for all cultures here so the picker is
  // instant once they choose.
  const [locations, cultures, vendorCategories, vendorTiers, addons] = await Promise.all([
    listBudgetLocations(supabase).catch(() => []),
    listBudgetCultures(supabase).catch(() => []),
    listVendorCategories(supabase).catch(() => []),
    listBudgetVendorTiers(supabase).catch(() => []),
    listBudgetAddons(supabase).catch(() => []),
  ]);

  const cultureEventLists = await Promise.all(
    cultures.map((c) =>
      getBudgetCulture(supabase, c.slug).catch(() => null),
    ),
  );
  const culturesWithEvents = cultureEventLists.filter(
    (c): c is NonNullable<typeof c> => c != null,
  );

  return (
    <Suspense fallback={null}>
      <BudgetBuilder
        locations={locations}
        cultures={culturesWithEvents}
        vendorCategories={vendorCategories}
        vendorTiers={vendorTiers}
        addons={addons}
        initialLocationSlug={params.location ?? null}
        sourceLabel={params.from ?? null}
      />
    </Suspense>
  );
}
