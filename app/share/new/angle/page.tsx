"use client";

// ── /share/new/angle ────────────────────────────────────────────────────────
// Step 2: Choose Your Angle. Four large editorial cards — Timeline, People,
// Details, Unfiltered — with badge, prompts, and a small angle illustration.
// Selecting one sets the angle on the draft and unlocks "Build your story".

import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { ShareShell } from "@/components/share/ShareShell";
import { Badge } from "@/components/share/Badge";
import { GradientCard } from "@/components/share/GradientCard";
import { useShareShaadiStore } from "@/stores/share-shaadi-store";
import { ANGLES, type StorytellingAngle } from "@/types/share-shaadi";

export default function AnglePage() {
  const router = useRouter();
  const angle = useShareShaadiStore((s) => s.draft.angle);
  const setAngle = useShareShaadiStore((s) => s.setAngle);

  return (
    <ShareShell
      eyebrow="step two"
      title={
        <>
          How do you want to tell your <em className="italic text-gold">story?</em>
        </>
      }
      subtitle="Pick the lens that feels truest to your wedding. We'll suggest blocks based on your choice — but you can always swap them later."
      step="angle"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
        {ANGLES.map((a, i) => (
          <AngleCard
            key={a.id}
            index={i}
            id={a.id}
            label={a.label}
            badge={a.badge}
            subtitle={a.subtitle}
            description={a.description}
            prompts={a.prompts}
            selected={angle === a.id}
            onSelect={() => setAngle(a.id)}
          />
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => router.push("/share/new")}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-5 py-2.5 text-[12.5px] font-medium text-ink-muted transition-colors hover:border-gold/40 hover:text-ink"
        >
          <ArrowLeft size={14} strokeWidth={1.8} />
          The basics
        </button>
        <button
          type="button"
          disabled={!angle}
          onClick={() => router.push("/share/new/build")}
          className="group inline-flex items-center gap-2 rounded-full border border-ink bg-ink px-6 py-3 text-[12.5px] font-semibold uppercase tracking-[0.18em] text-ivory transition-colors disabled:cursor-not-allowed disabled:opacity-40 hover:bg-ink/90"
        >
          Build your story
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

function AngleCard({
  id,
  index,
  label,
  badge,
  subtitle,
  description,
  prompts,
  selected,
  onSelect,
}: {
  id: StorytellingAngle;
  index: number;
  label: string;
  badge: string;
  subtitle: string;
  description: string;
  prompts: string[];
  selected: boolean;
  onSelect: () => void;
}) {
  const tone = ["rose", "wine", "saffron", "gold"][index % 4] as
    | "rose"
    | "wine"
    | "saffron"
    | "gold";
  const variant = (
    ["rose-saffron", "gold-pink", "rose-saffron", "gold-pink"] as const
  )[index % 4];

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className="block w-full text-left"
    >
      <GradientCard
        variant={variant}
        selected={selected}
        className="p-7 md:p-9"
      >
        <div className="flex items-start justify-between gap-3">
          <Badge tone={tone}>{badge}</Badge>
          {selected ? (
            <span
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold text-ivory"
            >
              <Check size={16} strokeWidth={2.4} />
            </span>
          ) : (
            <AngleGlyph id={id} />
          )}
        </div>
        <h3
          className="mt-7 text-[28px] font-medium leading-tight text-ink md:text-[34px]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {label}
        </h3>
        <p
          className="mt-2 text-[15.5px] italic text-ink-soft"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {subtitle}
        </p>
        <p className="mt-3 text-[14px] leading-[1.65] text-ink-muted">
          {description}
        </p>
        <div className="mt-6 space-y-1.5 border-t border-gold/25 pt-4">
          {prompts.map((p) => (
            <p
              key={p}
              className="text-[13.5px] italic text-ink-soft"
              style={{ fontFamily: "var(--font-display)" }}
            >
              &ldquo;{p}&rdquo;
            </p>
          ))}
        </div>
      </GradientCard>
    </button>
  );
}

function AngleGlyph({ id }: { id: StorytellingAngle }) {
  const className = "h-10 w-10 text-ink/70";
  if (id === "timeline") {
    return (
      <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
        <line x1="6" y1="20" x2="34" y2="20" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8" cy="20" r="3" fill="currentColor" />
        <circle cx="20" cy="20" r="3" fill="currentColor" />
        <circle cx="32" cy="20" r="3" fill="currentColor" />
      </svg>
    );
  }
  if (id === "people") {
    return (
      <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
        <circle cx="15" cy="20" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <circle cx="25" cy="20" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
    );
  }
  if (id === "details") {
    return (
      <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
        <g stroke="currentColor" strokeWidth="1.5" fill="none">
          <rect x="6" y="22" width="6" height="14" />
          <rect x="14" y="18" width="6" height="18" />
          <rect x="22" y="14" width="6" height="22" />
          <rect x="30" y="10" width="6" height="26" />
        </g>
      </svg>
    );
  }
  // unfiltered
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <path
        d="M8 12c0-2 2-4 4-4h16c2 0 4 2 4 4v12c0 2-2 4-4 4h-9l-6 5v-5h-1c-2 0-4-2-4-4V12z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <circle cx="16" cy="18" r="1.2" fill="currentColor" />
      <circle cx="20" cy="18" r="1.2" fill="currentColor" />
      <circle cx="24" cy="18" r="1.2" fill="currentColor" />
    </svg>
  );
}
