"use client";

// ── Documents shell ────────────────────────────────────────────────────────
// Mirrors WorkspaceShell's layout (TopNav + CategoryRail + canvas) but hosts
// the Documents vault canvas. Sidebar selections to vendor / extras / finance
// route back to the workspace surface.

import { useRouter } from "next/navigation";
import { TopNav } from "@/components/shell/TopNav";
import { CategoryRail } from "@/components/workspace/CategoryRail";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type {
  DocumentTabId,
} from "@/types/documents";
import type { WorkspaceSelection } from "@/types/workspace";
import { DocumentsCanvas } from "./DocumentsCanvas";

const DOCUMENTS_SELECTION: WorkspaceSelection = { type: "documents" };

export function DocumentsShell({ initialTab }: { initialTab: DocumentTabId }) {
  const router = useRouter();
  const categories = useWorkspaceStore((s) => s.categories);

  function handleSelect(sel: WorkspaceSelection) {
    if (sel.type === "documents") return;
    if (sel.type === "finance") {
      router.push("/workspace/finance");
      return;
    }
    if (sel.type === "events") {
      router.push("/workspace/events");
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
          selection={DOCUMENTS_SELECTION}
          onSelect={handleSelect}
        />
        <DocumentsCanvas initialTab={initialTab} />
      </div>
    </div>
  );
}
