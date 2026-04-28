"use client";

// Floating launcher pill + orchestrator that turns wizard output into tasks
// inside the existing useChecklistStore. Nothing here touches the original
// checklist UI or its components.

import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { useChecklistStore } from "@/stores/checklist-store";
import {
  EMPTY_PROFILE,
  loadAiGeneratedIds,
  loadProfile,
  saveAiGeneratedIds,
  saveProfile,
  traditionTagsFor,
  type WeddingProfile,
} from "@/lib/ai-checklist/profile";
import { AIQuestionnaireModal } from "./AIQuestionnaireModal";
import type { GeneratedTask } from "@/app/api/ai-checklist/generate/route";
import type { WorkspaceCategoryTag } from "@/types/checklist";

export function AIQuestionnaireLauncher() {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<WeddingProfile>(EMPTY_PROFILE);
  const [aiIds, setAiIds] = useState<string[]>([]);
  const [toast, setToast] = useState<
    { kind: "success" | "error"; text: string } | null
  >(null);

  // Hydrate on mount — localStorage is client-only.
  useEffect(() => {
    setProfile(loadProfile());
    setAiIds(loadAiGeneratedIds());
  }, []);

  // Auto-dismiss toast.
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(id);
  }, [toast]);

  async function handleSubmit(next: WeddingProfile, replace: boolean) {
    saveProfile(next);
    setProfile(next);

    const res = await fetch("/api/ai-checklist/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ profile: next }),
    });
    const payload = (await res.json()) as
      | { ok: true; tasks: GeneratedTask[] }
      | { ok: false; error: string };

    if (!payload.ok) {
      throw new Error(payload.error);
    }

    const store = useChecklistStore.getState();

    // Replace path: drop the previous AI batch first.
    if (replace && aiIds.length > 0) {
      for (const id of aiIds) store.deleteItem(id);
    }

    const newIds: string[] = [];
    const traditionTags = traditionTagsFor(next);
    const weddingDateMs = new Date(next.weddingDate).getTime();

    for (const task of payload.tasks) {
      const due =
        Number.isFinite(weddingDateMs) && Number.isFinite(task.daysBeforeWedding)
          ? new Date(weddingDateMs - task.daysBeforeWedding * 86_400_000)
              .toISOString()
              .slice(0, 10)
          : null;

      const item = store.addCustomItem({
        phase_id: task.phase_id,
        subsection: task.subsection,
        title: task.title,
        description: task.description || undefined,
        priority: task.priority,
        due_date: due,
        notes: task.notes || undefined,
        created_by: "ai-generated",
        category_tags:
          task.category_tags.length > 0
            ? (task.category_tags as WorkspaceCategoryTag[])
            : undefined,
      });

      // addCustomItem seeds tradition_profile_tags to ["all"]. Overwrite with
      // the couple's traditions so filtering stays coherent.
      if (traditionTags.length > 0) {
        store.updateItem(item.id, { tradition_profile_tags: traditionTags });
      }

      newIds.push(item.id);
    }

    const finalIds = replace ? newIds : [...aiIds, ...newIds];
    saveAiGeneratedIds(finalIds);
    setAiIds(finalIds);

    setToast({
      kind: "success",
      text: `Generated ${newIds.length} task${newIds.length === 1 ? "" : "s"} from your profile.`,
    });
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-1.5 rounded-full bg-gold px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-gold/30 transition-all hover:bg-gold/90 hover:shadow-xl"
        title="Generate AI-powered checklist"
      >
        <Sparkles className="h-4 w-4" />
        Wedding AI
      </button>

      {open ? (
        <AIQuestionnaireModal
          initial={profile}
          hasExistingAiTasks={aiIds.length > 0}
          onClose={() => setOpen(false)}
          onSubmit={handleSubmit}
        />
      ) : null}

      {toast ? (
        <div
          className={
            "fixed bottom-20 right-5 z-40 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm shadow-lg " +
            (toast.kind === "success"
              ? "border-sage/40 bg-white text-ink"
              : "border-red-200 bg-white text-red-700")
          }
        >
          <span>{toast.text}</span>
          <button
            onClick={() => setToast(null)}
            className="text-ink-faint hover:text-ink"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}
    </>
  );
}
