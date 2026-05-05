"use client";

// ── Shared "Things you can't stop thinking about" ─────────────────────────
// Freeform list of things the couple has seen and loved (a cousin's chaat
// cart, a reel, a real-wedding moment). Used in the guided journey
// (Session 4) and on Tab 3 of the workspace. Reads/writes the same
// inspirationEntries slice of the guest experiences store.

import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { useGuestExperiencesStore } from "@/stores/guest-experiences-store";
import { EXPERIENCE_CATALOG } from "@/lib/guest-experiences/experience-catalog";

export function CantStopThinkingAbout({
  variant = "section",
}: {
  variant?: "section" | "guided";
}) {
  const entries = useGuestExperiencesStore((s) => s.inspirationEntries);
  const addEntry = useGuestExperiencesStore((s) => s.addInspirationEntry);
  const deleteEntry = useGuestExperiencesStore((s) => s.deleteInspirationEntry);
  const setReaction = useGuestExperiencesStore((s) => s.setReaction);
  const setEventAssignments = useGuestExperiencesStore(
    (s) => s.setEventAssignments,
  );
  const [draft, setDraft] = useState("");
  const [lastMatches, setLastMatches] = useState<{ id: string; name: string }[]>(
    [],
  );

  function add() {
    if (!draft.trim()) return;
    addEntry(draft.trim());
    setDraft("");
  }

  function suggest() {
    const haystack = entries.map((e) => e.text.toLowerCase()).join(" ");
    if (!haystack) return;
    const matched: { id: string; name: string }[] = [];
    for (const card of EXPERIENCE_CATALOG) {
      const keywords = card.name
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 3);
      const hit = keywords.some((k) => haystack.includes(k));
      if (hit) {
        setReaction(card.id, "love");
        setEventAssignments(card.id, card.suggested_events);
        matched.push({ id: card.id, name: card.name });
      }
    }
    setLastMatches(matched);
  }

  return (
    <div>
      {variant === "section" && (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-saffron">
            I've seen this and loved it
          </p>
          <h2 className="mt-1.5 font-serif font-bold text-[22px] leading-tight text-ink">
            Things you can't stop thinking about
          </h2>
          <p className="mt-1.5 max-w-3xl text-[13px] text-ink-muted">
            Drop anything — something from a cousin's sangeet, a reel you saved,
            an idea from a friend's reception. We'll map them to the catalog.
          </p>
        </div>
      )}

      <div className={variant === "section" ? "mt-4 space-y-2" : "space-y-2"}>
        {entries.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-ivory-warm/30 px-4 py-6 text-center text-[13px] text-ink-muted">
            Nothing noted yet. Start with a single line — your planner will take
            it from there.
          </div>
        ) : (
          <ul className="space-y-1.5">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex items-start justify-between gap-2 rounded-md border border-border bg-white px-3 py-2"
              >
                <p className="flex-1 text-[13px] text-ink">{entry.text}</p>
                <button
                  type="button"
                  onClick={() => deleteEntry(entry.id)}
                  aria-label="Delete entry"
                  className="shrink-0 text-ink-faint transition-colors hover:text-rose"
                >
                  <X size={12} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-start gap-2">
          <input
            type="text"
            placeholder="e.g. The cotton candy cart at Priya's wedding…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") add();
            }}
            className="flex-1 rounded-md border border-border bg-white px-3 py-2 text-[13px] focus:border-saffron focus:outline-none"
          />
          <button
            type="button"
            onClick={add}
            className="shrink-0 rounded-md bg-ink px-3 py-2 text-[12px] font-medium text-ivory hover:opacity-90"
          >
            Add
          </button>
        </div>

        {entries.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <button
              type="button"
              onClick={suggest}
              className="inline-flex items-center gap-1.5 rounded-md border border-gold/30 bg-ivory-warm/40 px-3 py-1.5 text-[12px] text-ink transition-colors hover:bg-ivory-warm/70"
            >
              <Sparkles size={12} className="text-saffron" />
              Suggest experiences
            </button>
            {lastMatches.length > 0 && (
              <p className="text-[11.5px] text-ink-muted">
                Loved {lastMatches.length} matching card
                {lastMatches.length === 1 ? "" : "s"} on the Discover tab:{" "}
                <span className="text-ink">
                  {lastMatches
                    .slice(0, 3)
                    .map((m) => m.name)
                    .join(" · ")}
                  {lastMatches.length > 3 && ` · +${lastMatches.length - 3}`}
                </span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
