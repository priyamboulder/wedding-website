"use client";

// ── /share/review ───────────────────────────────────────────────────────────
// Step 4: Review & Submit. Shows the story rendered as it would appear
// published on The Marigold. The couple can go back to edit any block.

import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Pencil } from "lucide-react";
import { ShareShell } from "@/components/share/ShareShell";
import { StoryRenderer } from "@/components/share/StoryRenderer";
import { useShareShaadiStore } from "@/stores/share-shaadi-store";

export default function ReviewPage() {
  const router = useRouter();
  const draft = useShareShaadiStore((s) => s.draft);
  const submit = useShareShaadiStore((s) => s.submit);

  const canSubmit =
    draft.brideName.trim().length > 0 &&
    draft.groomName.trim().length > 0 &&
    draft.blocks.length >= 3;

  function handleSubmit() {
    submit();
    router.push("/share/submitted");
  }

  return (
    <ShareShell
      eyebrow="step four"
      title={
        <>
          Here&rsquo;s your <em className="italic text-gold">story so far.</em>
        </>
      }
      subtitle="Read it through. Edit anything. Add photos. When it feels right, hit submit."
      step="review"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/share/new")}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-gold/40 hover:text-ink"
          >
            <Pencil size={12} strokeWidth={1.8} />
            Edit basics
          </button>
          <button
            type="button"
            onClick={() => router.push("/share/new/angle")}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-gold/40 hover:text-ink"
          >
            <Pencil size={12} strokeWidth={1.8} />
            Change angle
          </button>
          <button
            type="button"
            onClick={() => router.push("/share/new/build")}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-gold/40 hover:text-ink"
          >
            <Pencil size={12} strokeWidth={1.8} />
            Edit blocks
          </button>
        </div>
      </div>

      <StoryRenderer submission={draft} />

      <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => router.push("/share/new/build")}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-5 py-2.5 text-[12.5px] font-medium text-ink-muted transition-colors hover:border-gold/40 hover:text-ink"
        >
          <ArrowLeft size={14} strokeWidth={1.8} />
          Back to your blocks
        </button>
        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleSubmit}
          className="group inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-[13px] font-semibold uppercase tracking-[0.2em] text-ivory shadow-[0_2px_24px_-12px_rgba(184,134,11,0.6)] transition-colors disabled:cursor-not-allowed disabled:opacity-40 hover:bg-[#9C720A]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Submit for review
          <ArrowRight
            size={15}
            strokeWidth={2}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </button>
      </div>
    </ShareShell>
  );
}
