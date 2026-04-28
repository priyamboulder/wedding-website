"use client";

// ── Notes & Ideas canvas ──────────────────────────────────────────────────
// Memories & Keepsakes → Notes & Ideas. Four tabs: All Notes, Quick Capture,
// Inspiration Clips, Reflections. Replaces the earlier single-tab keepsake
// placeholder (NotesKeepsakeCanvas) with a fully store-backed surface.

import {
  BookOpen,
  Images,
  NotebookPen,
  Plus,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  ExtraActionButton,
  ExtraCanvasShell,
  type ExtraTabDef,
} from "../ExtraCanvasShell";
import { AllNotesTab } from "./tabs/AllNotesTab";
import { QuickCaptureTab } from "./tabs/QuickCaptureTab";
import { InspirationClipsTab } from "./tabs/InspirationClipsTab";
import { ReflectionsTab } from "./tabs/ReflectionsTab";
import { useNotesIdeasStore } from "@/stores/notes-ideas-store";

type NotesIdeasTabId =
  | "all_notes"
  | "quick_capture"
  | "inspiration_clips"
  | "reflections";

const TABS: ExtraTabDef<NotesIdeasTabId>[] = [
  { id: "all_notes", label: "All Notes", icon: NotebookPen },
  { id: "quick_capture", label: "Quick Capture", icon: Zap },
  { id: "inspiration_clips", label: "Inspiration Clips", icon: Images },
  { id: "reflections", label: "Reflections", icon: Sparkles },
];

export function NotesIdeasCanvas() {
  const noteCount = useNotesIdeasStore((s) => s.notes.length);
  const captureCount = useNotesIdeasStore((s) => s.captures.length);
  const clipCount = useNotesIdeasStore((s) => s.clips.length);
  const reflectionCount = useNotesIdeasStore((s) => s.reflections.length);

  const subtitle = `${noteCount} notes · ${captureCount} quick captures · ${clipCount} clips · ${reflectionCount} reflections`;

  return (
    <ExtraCanvasShell<NotesIdeasTabId>
      eyebrow="WORKSPACE · KEEPSAKES"
      icon={BookOpen}
      title="Notes & Ideas"
      subtitle={subtitle}
      actions={
        <ExtraActionButton
          icon={<Plus size={13} strokeWidth={1.8} />}
          label="New note"
          primary
        />
      }
      tabs={TABS}
      renderTab={(tab) => {
        switch (tab) {
          case "all_notes":
            return <AllNotesTab />;
          case "quick_capture":
            return <QuickCaptureTab />;
          case "inspiration_clips":
            return <InspirationClipsTab />;
          case "reflections":
            return <ReflectionsTab />;
        }
      }}
    />
  );
}
