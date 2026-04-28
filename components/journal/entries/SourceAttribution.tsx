"use client";

// ── SourceAttribution ──────────────────────────────────────────────────────
// Small italic "From Journal: [title]" line. Renders nothing for
// `manual` / absent sources. Clicking the title fires onOpenEntry if
// provided — workspaces typically open the entry in a drawer rather
// than navigate.

import { BookOpenText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SourceRef } from "@/types/journal-entries";

export function SourceAttribution({
  source,
  onOpenEntry,
  className,
}: {
  source?: SourceRef;
  onOpenEntry?: (entryId: string) => void;
  className?: string;
}) {
  if (!source || source.kind === "manual") return null;

  if (source.kind === "editorial") {
    return (
      <p
        className={cn(
          "inline-flex items-center gap-1 text-[10.5px] italic text-ink-faint",
          className,
        )}
      >
        <BookOpenText size={10} strokeWidth={1.8} />
        From editorial: {source.articleTitle}
      </p>
    );
  }

  // kind: "journal"
  return (
    <p
      className={cn(
        "inline-flex items-center gap-1 text-[10.5px] italic text-ink-faint",
        className,
      )}
    >
      <BookOpenText size={10} strokeWidth={1.8} />
      From Journal:{" "}
      {onOpenEntry ? (
        <button
          type="button"
          onClick={() => onOpenEntry(source.entryId)}
          className="underline decoration-saffron/40 decoration-dotted underline-offset-2 hover:text-saffron"
        >
          {source.entryTitle}
        </button>
      ) : (
        <span className="text-ink-muted">{source.entryTitle}</span>
      )}
    </p>
  );
}
