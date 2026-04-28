"use client";

// ── Décor & Florals route ───────────────────────────────────────────────────
// Mounts the 6-tab Décor workspace under the app's TopNav chrome.

import { use } from "react";
import { TopNav } from "@/components/shell/TopNav";
import { DecorWorkspace } from "@/components/decor/DecorWorkspace";

export default function DecorPage({
  params,
}: {
  params: Promise<{ weddingId: string }>;
}) {
  use(params);
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <TopNav>
        <span
          className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Décor & Florals
        </span>
      </TopNav>
      <DecorWorkspace />
    </div>
  );
}
