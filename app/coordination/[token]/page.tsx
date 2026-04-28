"use client";

// ── Vendor portal — /coordination/[token] ───────────────────────────────────
// Public, unauthenticated, mobile-optimized. The portalToken in the URL IS the
// access token — anyone with the link can view this vendor's schedule.
// Client-rendered so it reads from the same localStorage store the planner
// side writes to. Minimal dependencies, large tap targets, readable on 3G.

import { use } from "react";
import { VendorPortal } from "@/components/coordination/portal/VendorPortal";

export default function VendorPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  return <VendorPortal token={token} />;
}
