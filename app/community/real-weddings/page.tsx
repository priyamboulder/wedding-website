"use client";

// ── /community/real-weddings ────────────────────────────────────────────────
// Direct entry to the Real Weddings listing. The canonical home is
// /community?tab=real-weddings (tabbed with Blog / Guides / Brides / Magazine),
// so this route bounces users to the community page with the right tab
// selected. Keeps deep links like email shares from 404ing.

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RealWeddingsIndexPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/community?tab=real-weddings");
  }, [router]);
  return null;
}
