"use client";

// ── /share/new ──────────────────────────────────────────────────────────────
// Step 1: The Basics. A warm, editorial-feeling form (not a SaaS form).
// Names side-by-side with an `&` between them, bottom-border-only inputs,
// gold underline on focus, and the same event tag pill style used by the
// Real Wedding cards.

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { ShareShell } from "@/components/share/ShareShell";
import {
  EditorialInput,
  EditorialLabel,
} from "@/components/share/EditorialInput";
import { EventTagPill } from "@/components/share/EventTagPill";
import { useShareShaadiStore } from "@/stores/share-shaadi-store";
import type { EventTag, SubmissionPath } from "@/types/share-shaadi";

const ALL_EVENTS: EventTag[] = [
  "ROKA",
  "ENGAGEMENT",
  "HALDI",
  "MEHENDI",
  "SANGEET",
  "CEREMONY",
  "RECEPTION",
  "AFTER_PARTY",
  "OTHER",
];

export default function ShareNewPage() {
  return (
    <Suspense fallback={null}>
      <ShareNewInner />
    </Suspense>
  );
}

function ShareNewInner() {
  const router = useRouter();
  const params = useSearchParams();
  const draft = useShareShaadiStore((s) => s.draft);
  const patch = useShareShaadiStore((s) => s.patch);
  const toggleEvent = useShareShaadiStore((s) => s.toggleEvent);
  const resetDraft = useShareShaadiStore((s) => s.resetDraft);

  // If a path query param is present and the current draft is fresh-ish
  // (no name yet), set the path on the draft. Lets users land here from
  // /share?path=diy and start clean.
  useEffect(() => {
    const p = params?.get("path") as SubmissionPath | null;
    if (p === "diy" || p === "ai_interview") {
      if (!draft.brideName && !draft.groomName && draft.path !== p) {
        resetDraft(p);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canContinue =
    (draft.brideName ?? "").trim().length > 0 &&
    (draft.groomName ?? "").trim().length > 0 &&
    /.+@.+\..+/.test((draft.contactEmail ?? "").trim());

  return (
    <ShareShell
      eyebrow="step one"
      title={
        <>
          Tell us the <em className="italic text-gold">basics.</em>
        </>
      }
      subtitle="No pressure on the prose yet — we just need the headline facts. Everything below shows up in the published feature header."
      step="basics"
    >
      <div className="rounded-2xl border border-gold/15 bg-white/70 p-7 shadow-[0_1px_0_0_rgba(184,134,11,0.06)] md:p-10">
        {/* Couple names */}
        <div>
          <EditorialLabel hint="like a wedding invitation, not a form.">
            The Couple
          </EditorialLabel>
          <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-[1fr_auto_1fr] md:gap-5">
            <EditorialInput
              display
              placeholder="Bride / Partner"
              value={draft.brideName}
              onChange={(e) => patch({ brideName: e.target.value })}
            />
            <span
              className="hidden text-center text-[34px] italic text-gold md:block"
              style={{ fontFamily: "var(--font-display)" }}
            >
              &amp;
            </span>
            <EditorialInput
              display
              placeholder="Partner / Groom"
              value={draft.groomName}
              onChange={(e) => patch({ groomName: e.target.value })}
            />
          </div>
        </div>

        {/* Date + venue + city */}
        <div className="mt-10 grid grid-cols-1 gap-x-10 gap-y-7 md:grid-cols-2">
          <div>
            <EditorialLabel>Wedding date</EditorialLabel>
            <EditorialInput
              type="month"
              placeholder="YYYY-MM"
              value={draft.weddingMonth ?? ""}
              onChange={(e) => patch({ weddingMonth: e.target.value || null })}
            />
          </div>
          <div>
            <EditorialLabel>How many in the room?</EditorialLabel>
            <EditorialInput
              type="number"
              min={2}
              placeholder="e.g. 320"
              value={draft.guestCount ?? ""}
              onChange={(e) =>
                patch({
                  guestCount: e.target.value
                    ? Number(e.target.value)
                    : null,
                })
              }
            />
          </div>
          <div>
            <EditorialLabel>Where did you celebrate?</EditorialLabel>
            <EditorialInput
              placeholder="Umaid Bhawan Palace"
              value={draft.venue}
              onChange={(e) => patch({ venue: e.target.value })}
            />
          </div>
          <div>
            <EditorialLabel>City</EditorialLabel>
            <EditorialInput
              placeholder="Jodhpur"
              value={draft.city}
              onChange={(e) => patch({ city: e.target.value })}
            />
          </div>
        </div>

        {/* Contact email — required so editors can follow up. The /share
            flow is fully public, so the only contact info we need from
            anonymous couples is this. Pre-filled from auth profile when
            the user is already signed in. */}
        <div className="mt-10">
          <EditorialLabel hint="we'll use this to follow up about your feature.">
            Best email to reach you
          </EditorialLabel>
          <EditorialInput
            type="email"
            placeholder="you@gmail.com"
            value={draft.contactEmail ?? ""}
            onChange={(e) => patch({ contactEmail: e.target.value })}
          />
        </div>

        {/* Events */}
        <div className="mt-10">
          <EditorialLabel hint="select all that you held.">
            Events held
          </EditorialLabel>
          <div className="mt-3 flex flex-wrap gap-2">
            {ALL_EVENTS.map((e) => (
              <EventTagPill
                key={e}
                event={e}
                active={draft.events.includes(e)}
                onClick={() => toggleEvent(e)}
              />
            ))}
          </div>
        </div>

        {/* Hashtag */}
        <div className="mt-10">
          <EditorialLabel hint="optional.">Wedding hashtag</EditorialLabel>
          <div className="flex items-end gap-1">
            <span
              className="pb-1.5 text-[18px] text-gold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              #
            </span>
            <EditorialInput
              placeholder="MeeraMeetsKabir"
              value={draft.hashtag}
              onChange={(e) =>
                patch({ hashtag: e.target.value.replace(/\s+/g, "") })
              }
            />
          </div>
        </div>
      </div>

      {/* Footer nav */}
      <div className="mt-10 flex items-center justify-between gap-4">
        <p
          className="text-[12.5px] italic text-ink-muted"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Saved as you go.
        </p>
        <button
          type="button"
          disabled={!canContinue}
          onClick={() =>
            draft.path === "ai_interview"
              ? router.push("/share/interview")
              : router.push("/share/new/angle")
          }
          className="group inline-flex items-center gap-2 rounded-full border border-ink bg-ink px-6 py-3 text-[12.5px] font-semibold uppercase tracking-[0.18em] text-ivory transition-colors disabled:cursor-not-allowed disabled:opacity-40 hover:bg-ink/90"
        >
          Choose your angle
          <ArrowRight
            size={14}
            strokeWidth={2}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </button>
      </div>
    </ShareShell>
  );
}
