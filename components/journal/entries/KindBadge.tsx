"use client";

import {
  FileText,
  Headphones,
  AtSign,
  Film,
  StickyNote,
  Newspaper,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { JournalEntryKind } from "@/types/journal-entries";

const META: Record<
  JournalEntryKind,
  { label: string; Icon: React.ElementType }
> = {
  article: { label: "Article", Icon: Newspaper },
  podcast: { label: "Podcast", Icon: Headphones },
  video: { label: "Video", Icon: Film },
  social: { label: "Social", Icon: AtSign },
  pdf: { label: "PDF", Icon: FileText },
  note: { label: "Note", Icon: StickyNote },
};

export function KindBadge({
  kind,
  className,
}: {
  kind: JournalEntryKind;
  className?: string;
}) {
  const { label, Icon } = META[kind];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border border-gold/25 bg-white px-1.5 py-[1px] font-mono text-[9px] uppercase tracking-[0.1em] text-ink-muted",
        className,
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <Icon size={9} strokeWidth={1.8} />
      {label}
    </span>
  );
}
