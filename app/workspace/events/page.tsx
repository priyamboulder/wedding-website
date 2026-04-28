"use client";

// ── /workspace/events route ───────────────────────────────────────────────
// Events is the first row under Wedding Workspaces. Mirrors the layout used
// by the vendor workspaces: TopNav + CategoryRail on the left, tabbed
// EventsWorkspaceCanvas on the right (with its own per-event selector rail
// inside).

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/shell/TopNav";
import { CategoryRail } from "@/components/workspace/CategoryRail";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { EventsWorkspaceCanvas } from "@/components/workspace/events/EventsWorkspaceCanvas";
import type { WorkspaceSelection } from "@/types/workspace";

const EVENTS_SELECTION: WorkspaceSelection = { type: "events" };

export default function WorkspaceEventsPage() {
  const router = useRouter();
  const categories = useWorkspaceStore((s) => s.categories);

  function handleSelect(sel: WorkspaceSelection) {
    if (sel.type === "events") return;
    if (sel.type === "schedule") {
      router.push("/workspace/schedule");
      return;
    }
    if (sel.type === "finance") {
      router.push("/workspace/finance");
      return;
    }
    if (sel.type === "documents") {
      router.push("/documents");
      return;
    }
    router.push("/workspace");
  }

  return (
    <div className="flex h-screen flex-col bg-white">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <CategoryRail
          categories={categories}
          selection={EVENTS_SELECTION}
          onSelect={handleSelect}
        />
        <Suspense fallback={<div className="flex-1 animate-pulse bg-ivory-warm/40" />}>
          <EventsWorkspaceCanvas />
        </Suspense>
      </div>
    </div>
  );
}
