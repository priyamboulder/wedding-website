"use client";

// ── Workspace shell ─────────────────────────────────────────────────────────
// Shared shell used by the default /workspace route and the per-category
// routes (/workspace/jewelry, /workspace/cake-sweets, etc.). The only
// difference between them is the initial sidebar selection.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/shell/TopNav";
import { CategoryRail } from "@/components/workspace/CategoryRail";
import { getCanvasForCategory } from "@/components/workspace/canvases";
import { getExtraCanvas } from "@/components/workspace/extras";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type {
  WorkspaceCategorySlug,
  WorkspaceSelection,
} from "@/types/workspace";

export function WorkspaceShell({
  initialSlug = "photography",
  initialSelection,
}: {
  initialSlug?: WorkspaceCategorySlug;
  initialSelection?: WorkspaceSelection;
}) {
  const router = useRouter();
  const categories = useWorkspaceStore((s) => s.categories);
  const [selection, setSelection] = useState<WorkspaceSelection>(
    initialSelection ?? { type: "vendor", slug: initialSlug },
  );

  useEffect(() => {
    if (
      selection.type === "vendor" &&
      !categories.find((c) => c.slug === selection.slug) &&
      categories[0]
    ) {
      setSelection({ type: "vendor", slug: categories[0].slug });
    }
  }, [categories, selection]);

  function handleSelect(sel: WorkspaceSelection) {
    if (sel.type === "finance") {
      router.push("/workspace/finance");
      return;
    }
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
    setSelection(sel);
  }

  return (
    <div className="flex h-screen flex-col bg-white">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <CategoryRail
          categories={categories}
          selection={selection}
          onSelect={handleSelect}
        />
        <div className="workspace-editorial flex min-w-0 flex-1">
          <CanvasForSelection
            key={selectionKey(selection)}
            selection={selection}
          />
        </div>
      </div>
    </div>
  );
}

function CanvasForSelection({ selection }: { selection: WorkspaceSelection }) {
  const categories = useWorkspaceStore((s) => s.categories);

  if (selection.type === "extra") {
    const Extra = getExtraCanvas(selection.id);
    return <Extra />;
  }

  if (selection.type === "finance") return null;
  if (selection.type === "documents") return null;
  if (selection.type === "events") return null;
  if (selection.type === "schedule") return null;

  const category =
    categories.find((c) => c.slug === selection.slug) ?? categories[0];
  if (!category) return null;
  const Canvas = getCanvasForCategory(category.slug);
  return <Canvas category={category} />;
}

function selectionKey(sel: WorkspaceSelection): string {
  if (sel.type === "vendor") return `v:${sel.slug}`;
  if (sel.type === "extra") return `e:${sel.id}`;
  if (sel.type === "events") return "events";
  if (sel.type === "schedule") return "schedule";
  if (sel.type === "documents") return "documents";
  return "finance";
}
