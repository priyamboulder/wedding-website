"use client";

// ── /community/real-weddings/new ────────────────────────────────────────────
// Showcase creation wizard host page. Thin shell — all step logic lives in
// ShowcaseWizard.

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TopNav } from "@/components/shell/TopNav";
import { ShowcaseWizard } from "@/components/community/showcases/ShowcaseWizard";

export default function NewShowcasePage() {
  return (
    <div className="min-h-screen bg-ivory-warm/30">
      <TopNav>
        <Link
          href="/community?tab=real-weddings"
          className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-gold/30 hover:text-ink"
        >
          <ArrowLeft size={12} strokeWidth={1.8} />
          Back to Real Weddings
        </Link>
      </TopNav>
      <ShowcaseWizard />
    </div>
  );
}
