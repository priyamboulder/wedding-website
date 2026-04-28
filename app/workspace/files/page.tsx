"use client";

// Category-level files view — all files for one category, filterable by tab,
// tag, vendor, or date. Linked from the category workspace "See all files"
// preview.

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Filter } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { TopNav } from "@/components/shell/TopNav";
import { useFilesStore } from "@/stores/files-store";
import { FilesPanel } from "@/components/workspace/shared/FilesPanel";
import { UndoToastHost } from "@/components/workspace/editable/UndoToast";
import {
  SectionHeader,
  Tag,
} from "@/components/workspace/blocks/primitives";
import type {
  WorkspaceCategoryTag,
  WorkspaceTabTag,
} from "@/types/checklist";

const TABS: Array<{ id: WorkspaceTabTag; label: string }> = [
  { id: "vision", label: "Vision" },
  { id: "shortlist", label: "Shortlist" },
  { id: "plan", label: "Plan" },
  { id: "decisions", label: "Decisions" },
  { id: "timeline", label: "Timeline" },
];

// useSearchParams() requires a Suspense boundary in Next.js 16 App Router.
function WorkspaceFilesPageInner() {
  const params = useSearchParams();
  const category = (params?.get("category") ?? "photography") as WorkspaceCategoryTag;
  const [tab, setTab] = useState<WorkspaceTabTag | "all">("all");
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  const files = useFilesStore((s) => s.files);
  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const f of files) {
      if (f.deleted_at) continue;
      if (f.category !== category) continue;
      for (const t of f.tags) set.add(t);
    }
    return Array.from(set).sort();
  }, [files, category]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <TopNav />
      <main className="flex-1 bg-white px-10 py-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex items-center gap-3 text-[12px] text-ink-muted">
            <Link
              href="/workspace"
              className="flex items-center gap-1 hover:text-saffron"
            >
              <ArrowLeft size={12} /> Workspace
            </Link>
            <span className="text-ink-faint">/</span>
            <span className="text-ink">Files · {category}</span>
          </div>

          <SectionHeader
            eyebrow={`All files · ${category}`}
            title="Files"
            description="Every file shared across this vendor workspace. Filter by tab, tag, or vendor."
          />

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              <Filter size={10} /> tab
            </span>
            <FilterChip
              label="All"
              active={tab === "all"}
              onClick={() => setTab("all")}
            />
            {TABS.map((t) => (
              <FilterChip
                key={t.id}
                label={t.label}
                active={tab === t.id}
                onClick={() => setTab(t.id)}
              />
            ))}
            {allTags.length > 0 && (
              <>
                <span className="ml-4 flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                  tag
                </span>
                <FilterChip
                  label="Any"
                  active={tagFilter === null}
                  onClick={() => setTagFilter(null)}
                />
                {allTags.map((t) => (
                  <FilterChip
                    key={t}
                    label={t}
                    active={tagFilter === t}
                    onClick={() => setTagFilter(t)}
                  />
                ))}
              </>
            )}
          </div>

          <FilesPanel
            category={category}
            tab={tab === "all" ? undefined : tab}
          />

          {tagFilter && (
            <p className="text-[11px] italic text-ink-muted">
              Filtering by tag:{" "}
              <Tag tone="saffron">{tagFilter}</Tag>
            </p>
          )}
        </div>
      </main>
      <UndoToastHost />
    </div>
  );
}

export default function WorkspaceFilesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen animate-pulse bg-ivory-warm/40" />}>
      <WorkspaceFilesPageInner />
    </Suspense>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-sm border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] transition-colors ${
        active
          ? "border-ink bg-ink text-ivory"
          : "border-border bg-white text-ink-muted hover:border-ink hover:text-ink"
      }`}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {label}
    </button>
  );
}
