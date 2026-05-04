// ──────────────────────────────────────────────────────────────────────────
// /tools/match — Match Me, the reverse-search destination tool.
//
// Server component. Pulls every active location (with tags + capacity from
// migration 0023) and hands the list to the client orchestrator. The
// algorithm runs entirely in the browser — there's no per-result API call.
// ──────────────────────────────────────────────────────────────────────────

import { Suspense } from "react";

import { MatchTool } from "@/components/marigold-tools/match/MatchTool";
import { listMatchableLocations } from "@/lib/match";
import { createAnonClient } from "@/lib/supabase/server-client";
import { pageMetadata } from "@/lib/marigold/seo";

export const metadata = pageMetadata({
  title: "Match Me — The Marigold Tool",
  description:
    "Tell us your budget, your guest count, and what matters. We'll show you the destinations that fit.",
});

export const revalidate = 300;

export default async function MatchToolPage() {
  const supabase = createAnonClient();
  const locations = await listMatchableLocations(supabase).catch(() => []);

  return (
    <Suspense fallback={null}>
      <MatchTool locations={locations} />
    </Suspense>
  );
}
