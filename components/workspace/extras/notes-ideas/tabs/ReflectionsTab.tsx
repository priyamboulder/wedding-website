"use client";

// ── Reflections tab ────────────────────────────────────────────────────────
// Prompted weekly journaling. The current week's prompt sits in a highlighted
// card with a live textarea. Past reflections show below, expanded or
// collapsed. "New prompt" rotates through the library; "New reflection" lets
// you write to a custom prompt.

import { ChevronDown, Sparkles, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useNotesIdeasStore } from "@/stores/notes-ideas-store";
import type { Reflection } from "@/types/notes-ideas";
import { cn } from "@/lib/utils";
import { Section, TextArea, formatWeekOf } from "../ui";

export function ReflectionsTab() {
  const currentPrompt = useNotesIdeasStore((s) => s.currentPrompt);
  const reflectionsSorted = useNotesIdeasStore((s) => s.reflectionsSorted);
  const addReflection = useNotesIdeasStore((s) => s.addReflection);
  const updateReflection = useNotesIdeasStore((s) => s.updateReflection);
  const deleteReflection = useNotesIdeasStore((s) => s.deleteReflection);
  const rotateCurrentPrompt = useNotesIdeasStore(
    (s) => s.rotateCurrentPrompt,
  );
  const promptLibrary = useNotesIdeasStore((s) => s.promptLibrary);

  const reflections = useMemo(
    () => reflectionsSorted(),
    [reflectionsSorted],
  );

  const currentReflection = reflections.find(
    (r) => r.weekOf === currentPrompt.weekOf && r.prompt === currentPrompt.prompt,
  );
  const pastReflections = reflections.filter(
    (r) => r.id !== currentReflection?.id,
  );

  const [draft, setDraft] = useState(currentReflection?.body ?? "");

  function save() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (currentReflection) {
      updateReflection(currentReflection.id, trimmed);
    } else {
      addReflection({
        weekOf: currentPrompt.weekOf,
        prompt: currentPrompt.prompt,
        body: trimmed,
      });
    }
  }

  return (
    <div className="space-y-5">
      <Section
        eyebrow="REFLECTIONS"
        title="The wedding will fly by. These pages are for you."
        description="A prompted journaling space — not for anyone else, not even the AI, unless you say so. A new prompt surfaces each week."
        right={
          <button
            type="button"
            onClick={() => rotateCurrentPrompt()}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted hover:border-saffron/40 hover:text-saffron"
          >
            <Sparkles size={12} strokeWidth={1.8} /> New prompt
          </button>
        }
      >
        <article className="rounded-lg border border-saffron/30 bg-ivory-warm/40 p-5">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {formatWeekOf(currentPrompt.weekOf)}
          </p>
          <h4 className="mt-2 font-serif text-[20px] italic leading-snug text-ink">
            "{currentPrompt.prompt}"
          </h4>
          <div className="mt-4">
            <TextArea
              value={draft}
              onChange={setDraft}
              placeholder="Write your reflection…"
              rows={6}
            />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p
              className="flex items-center gap-1.5 text-[11.5px] italic text-ink-faint"
            >
              <Sparkles size={11} strokeWidth={1.8} className="text-saffron" />
              These reflections can be woven into your AI Keepsake — only if
              you choose.
            </p>
            <button
              type="button"
              onClick={save}
              disabled={!draft.trim()}
              className="rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-40"
            >
              {currentReflection ? "Save edits" : "Save reflection"}
            </button>
          </div>
        </article>
      </Section>

      <Section
        eyebrow="PAST REFLECTIONS"
        title="What you've kept so far"
        tone="muted"
      >
        {pastReflections.length === 0 ? (
          <p className="py-6 text-center text-[13px] italic text-ink-faint">
            Past reflections will collect here as the weeks go by.
          </p>
        ) : (
          <ul className="space-y-3">
            {pastReflections.map((r) => (
              <li key={r.id}>
                <PastReflectionCard
                  reflection={r}
                  onDelete={() => deleteReflection(r.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        eyebrow="PROMPT LIBRARY"
        title="A few more questions, for whenever you want them"
        tone="muted"
      >
        <ul className="grid gap-2 md:grid-cols-2">
          {promptLibrary.map((p) => (
            <li
              key={p}
              className="rounded-md border border-border/60 bg-white px-3 py-2 font-serif text-[13.5px] italic leading-snug text-ink"
            >
              "{p}"
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function PastReflectionCard({
  reflection,
  onDelete,
}: {
  reflection: Reflection;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <article className="group rounded-lg border border-border bg-white p-5">
      <header className="flex items-baseline justify-between gap-3">
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {formatWeekOf(reflection.weekOf)}
          </p>
          <h5 className="mt-1 font-serif text-[16px] italic text-ink">
            "{reflection.prompt}"
          </h5>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 text-ink-faint hover:text-ink"
          aria-label={open ? "Collapse" : "Expand"}
        >
          <ChevronDown
            size={16}
            strokeWidth={1.8}
            className={cn(
              "transition-transform",
              open ? "rotate-180" : "rotate-0",
            )}
          />
        </button>
      </header>
      <p
        className={cn(
          "mt-3 text-[13.5px] leading-relaxed text-ink-muted",
          !open && "line-clamp-3",
        )}
      >
        <span className="font-medium text-ink">{reflection.author} wrote: </span>
        {reflection.body}
      </p>
      <footer className="mt-3 flex items-center justify-end opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1 text-[11.5px] text-ink-faint hover:text-rose"
        >
          <Trash2 size={11} strokeWidth={1.8} /> Delete
        </button>
      </footer>
    </article>
  );
}
