"use client";

import { useRouter } from "next/navigation";
import { TopNav } from "@/components/shell/TopNav";
import { CategoryRail } from "@/components/workspace/CategoryRail";
import { FinanceCanvas } from "@/components/workspace/canvases/FinanceCanvas";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { WorkspaceSelection } from "@/types/workspace";

const FINANCE_SELECTION: WorkspaceSelection = { type: "finance" };

export default function WorkspaceFinancePage() {
  const router = useRouter();
  const categories = useWorkspaceStore((s) => s.categories);

  function handleSelect(sel: WorkspaceSelection) {
    if (sel.type === "finance") return;
    if (sel.type === "documents") {
      router.push("/documents");
      return;
    }
    if (sel.type === "events") {
      router.push("/workspace/events");
      return;
    }
    if (sel.type === "schedule") {
      router.push("/workspace/schedule");
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
          selection={FINANCE_SELECTION}
          onSelect={handleSelect}
        />
        <FinanceCanvas />
      </div>
    </div>
  );
}
