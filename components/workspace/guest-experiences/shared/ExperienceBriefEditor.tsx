"use client";

// ── Shared Experience Brief editor ─────────────────────────────────────────
// "THE DOCUMENT YOUR PLANNER READS FIRST." Used in both the guided journey
// (Session 4) and the Discover & Dream tab. Reads/writes the store's brief
// + briefMeta fields so the document is the same regardless of mode.

import { CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGuestExperiencesStore } from "@/stores/guest-experiences-store";

export function ExperienceBriefEditor({
  variant = "section",
}: {
  variant?: "section" | "guided";
}) {
  const brief = useGuestExperiencesStore((s) => s.brief);
  const meta = useGuestExperiencesStore((s) => s.briefMeta);
  const setBrief = useGuestExperiencesStore((s) => s.setBrief);
  const setMeta = useGuestExperiencesStore((s) => s.setBriefMeta);
  const draft = useGuestExperiencesStore((s) => s.draftBriefFromState);

  return (
    <div className="space-y-3">
      {variant === "section" && (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-saffron">
            Experience brief
          </p>
          <h2 className="mt-1.5 font-serif font-bold text-[22px] leading-tight text-ink">
            The document your planner reads first
          </h2>
          <p className="mt-1.5 max-w-3xl text-[13px] text-ink-muted">
            A narrative version of everything above. Edit until it sounds like
            you, then mark it as approved.
          </p>
        </div>
      )}

      <div className="rounded-lg border border-border bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-ivory-warm/30 px-4 py-2 text-[11.5px] text-ink-muted">
          <div className="flex items-center gap-2">
            {meta.is_ai_generated && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-gold">
                <Sparkles size={9} /> AI drafted
              </span>
            )}
            {meta.couple_approved && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sage/15 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-sage">
                <CheckCircle2 size={9} /> Approved
              </span>
            )}
            {meta.last_refined_at && (
              <span className="text-ink-faint">
                Last refined {new Date(meta.last_refined_at).toLocaleString()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={draft}
              className="inline-flex items-center gap-1 rounded-md border border-gold/30 bg-ivory-warm/40 px-2.5 py-1 text-[11.5px] text-ink transition-colors hover:bg-ivory-warm/70"
            >
              <Sparkles size={10} className="text-saffron" />
              {brief.trim().length > 0 ? "Refine with AI" : "Draft with AI"}
            </button>
            <button
              type="button"
              onClick={() => setMeta({ couple_approved: !meta.couple_approved })}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11.5px] font-medium transition-colors",
                meta.couple_approved
                  ? "bg-sage/10 text-sage hover:bg-sage/15"
                  : "bg-ink text-ivory hover:opacity-90",
              )}
            >
              <CheckCircle2 size={10} />
              {meta.couple_approved ? "Approved" : "Mark approved"}
            </button>
          </div>
        </div>
        <textarea
          rows={variant === "guided" ? 12 : 10}
          value={brief}
          onChange={(e) => {
            setBrief(e.target.value);
            // User edits flip "approved" off and the AI flag off — they own
            // the document now.
            if (meta.couple_approved || meta.is_ai_generated) {
              setMeta({
                couple_approved: false,
                is_ai_generated: false,
              });
            }
          }}
          placeholder={
            "Write a sentence or two about the experience you're designing — or click Draft with AI."
          }
          className="block w-full resize-y bg-transparent px-4 py-3 text-[14px] leading-relaxed text-ink placeholder:text-ink-faint focus:outline-none"
        />
      </div>
    </div>
  );
}
