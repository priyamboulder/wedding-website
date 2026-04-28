"use client";

// ── Events shell ───────────────────────────────────────────────────────────
// TopNav + sidebar + canvas layout, matching WorkspaceFinancePage. Canvas
// branches between the 5-question quiz and the completion dashboard based
// on events-store quiz state.

import { useRouter } from "next/navigation";
import { TopNav } from "@/components/shell/TopNav";
import { CategoryRail } from "@/components/workspace/CategoryRail";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useEventsStore } from "@/stores/events-store";
import type { WorkspaceSelection } from "@/types/workspace";
import { EventsQuizFlow } from "./quiz/EventsQuizFlow";
import { EventsDashboard } from "./dashboard/EventsDashboard";

const EVENTS_SELECTION: WorkspaceSelection = { type: "events" };

export function EventsShell() {
  const router = useRouter();
  const categories = useWorkspaceStore((s) => s.categories);
  const completedAt = useEventsStore((s) => s.quiz.completedAt);

  function handleSelect(sel: WorkspaceSelection) {
    if (sel.type === "events") return;
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
        <main className="flex-1 overflow-y-auto bg-white">
          {completedAt ? <EventsDashboard /> : <EventsQuizFlow />}
        </main>
      </div>
    </div>
  );
}
