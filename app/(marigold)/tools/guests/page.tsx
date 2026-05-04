// ──────────────────────────────────────────────────────────────────────────
// /tools/guests — Guest Count Estimator.
//
// Pure client tool: counts and per-event math are deterministic, no API
// calls. This route is a thin server shell so we can pre-set metadata and
// ship the client orchestrator.
// ──────────────────────────────────────────────────────────────────────────

import { Suspense } from "react";

import { GuestTool } from "@/components/marigold-tools/guests/GuestTool";
import { pageMetadata } from "@/lib/marigold/seo";

export const metadata = pageMetadata({
  title: "Guest Count Estimator — The Marigold Tool",
  description:
    "Your parents say 400. Your fiancé says 150. Let's find the real number — built from both sides, every tier, every event.",
});

export default function GuestEstimatorPage() {
  return (
    <Suspense fallback={null}>
      <GuestTool />
    </Suspense>
  );
}
