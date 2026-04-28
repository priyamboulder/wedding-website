"use client";

// ── /workspace/schedule route ──────────────────────────────────────────────
// Pinned directly below Events in the left sidebar. Mirrors the shell used
// by /workspace/events (TopNav + CategoryRail + canvas) so the couple can
// flip between the two without the page feeling different.

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/shell/TopNav";
import { CategoryRail } from "@/components/workspace/CategoryRail";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { ScheduleWorkspaceCanvas } from "@/components/workspace/schedule/ScheduleWorkspaceCanvas";
import type { WorkspaceSelection } from "@/types/workspace";

const SCHEDULE_SELECTION: WorkspaceSelection = { type: "schedule" };

export default function WorkspaceSchedulePage() {
  const router = useRouter();
  const categories = useWorkspaceStore((s) => s.categories);

  function handleSelect(sel: WorkspaceSelection) {
    if (sel.type === "schedule") return;
    if (sel.type === "events") {
      router.push("/workspace/events");
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
          selection={SCHEDULE_SELECTION}
          onSelect={handleSelect}
        />
        <Suspense fallback={<div className="flex-1 animate-pulse bg-ivory-warm/40" />}>
          <ScheduleWorkspaceCanvas />
        </Suspense>
      </div>
    </div>
  );
}
