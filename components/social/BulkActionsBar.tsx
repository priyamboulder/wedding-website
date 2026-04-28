"use client";

import { useState } from "react";
import type { GeneratedPost } from "@/lib/social/types";
import { PLATFORM_OPTIONS } from "./PlatformSelector";

type Props = {
  selectedPosts: GeneratedPost[];
  onApproveAll: () => Promise<void> | void;
  onDeleteAll: () => Promise<void> | void;
  onClear: () => void;
};

function platformLabel(p: GeneratedPost["platform"]) {
  return (
    PLATFORM_OPTIONS.find((o) => o.id === p)?.label ?? p
  )
    .toString()
    .toUpperCase();
}

function formatExport(posts: GeneratedPost[]): string {
  return posts
    .map((p) => {
      const header = `=== ${platformLabel(p.platform)} ===`;
      const tagLine = p.hashtags.length
        ? p.hashtags.map((h) => `#${h}`).join(" ")
        : "";
      return [header, p.caption, tagLine, p.call_to_action]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
}

export default function BulkActionsBar({
  selectedPosts,
  onApproveAll,
  onDeleteAll,
  onClear,
}: Props) {
  const [busy, setBusy] = useState<null | "approve" | "delete" | "export">(
    null,
  );
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [exported, setExported] = useState(false);

  if (selectedPosts.length === 0) return null;

  const count = selectedPosts.length;

  const handleApprove = async () => {
    setBusy("approve");
    try {
      await onApproveAll();
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async () => {
    setBusy("delete");
    try {
      await onDeleteAll();
      setConfirmingDelete(false);
    } finally {
      setBusy(null);
    }
  };

  const handleExport = async () => {
    setBusy("export");
    try {
      const text = formatExport(selectedPosts);
      await navigator.clipboard.writeText(text);
      setExported(true);
      setTimeout(() => setExported(false), 1800);
    } catch {
      // ignore
    } finally {
      setBusy(null);
    }
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 pointer-events-none px-4 pb-4 transition-transform duration-200"
      style={{ transform: "translateY(0%)" }}
    >
      <div className="pointer-events-auto mx-auto flex max-w-4xl flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-lg shadow-neutral-900/10">
        <span className="text-sm font-semibold text-neutral-900">
          {count} post{count === 1 ? "" : "s"} selected
        </span>

        {confirmingDelete ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-rose-900">Delete {count}?</span>
            <button
              type="button"
              onClick={handleDelete}
              disabled={busy === "delete"}
              className="rounded-md bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700 disabled:bg-rose-300"
            >
              {busy === "delete" ? "Deleting…" : "Confirm"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              disabled={busy === "delete"}
              className="rounded-md border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-700 hover:border-neutral-500"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleApprove}
              disabled={busy === "approve"}
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:bg-emerald-300"
            >
              {busy === "approve" ? "Approving…" : "Approve All"}
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={busy === "export"}
              className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 hover:border-neutral-500"
            >
              {exported ? "Copied!" : busy === "export" ? "Copying…" : "Export"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="rounded-md border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:border-rose-500 hover:bg-rose-50"
            >
              Delete All
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onClear}
          className="ml-auto text-xs font-medium text-neutral-600 underline underline-offset-2 hover:text-neutral-900"
        >
          Clear Selection
        </button>
      </div>
    </div>
  );
}
