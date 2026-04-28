"use client";

// ── Guest sign-up surface ─────────────────────────────────────────────────
// Rendered both as a live preview inside the couple's Who Gets Mehendi tab
// and as the public page guests land on via the shareable link. The preview
// panel passes `framed` to scale it down inside a card; the public page
// renders it full-width. State is read from the same Mehendi store so the
// preview is always in sync with what a guest would actually see.

import { useMemo, useState } from "react";
import { Check, Clock, Heart, Sparkles, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { defaultSetup, useMehndiStore } from "@/stores/mehndi-store";
import {
  DESIGN_TIER_DESCRIPTION,
  DESIGN_TIER_LABEL,
  DESIGN_TIER_MINUTES,
  type DesignTier,
  type EventSetup,
} from "@/types/mehndi";

// Representative tile imagery per tier so guests can see what they're
// signing up for without a separate asset drop.
const TIER_IMAGERY: Record<DesignTier, string> = {
  quick:
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=520&q=75",
  classic:
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=520&q=75",
  detailed:
    "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=520&q=75",
};

export interface GuestSignupPreviewProps {
  categoryId: string;
  // Preview mode — the couple sees a banner noting it's a preview. The
  // public page passes false.
  previewMode?: boolean;
  // Couple names shown in the hero. Defaults to generic text when absent.
  coupleNames?: string;
}

export function GuestSignupPreview({
  categoryId,
  previewMode = false,
  coupleNames,
}: GuestSignupPreviewProps) {
  const storedSetup = useMehndiStore((s) =>
    s.setups.find((x) => x.category_id === categoryId),
  );
  const setup = storedSetup ?? defaultSetup(categoryId);
  const allSlots = useMehndiStore((s) => s.guestSlots);
  const addSlot = useMehndiStore((s) => s.addGuestSlot);

  const claimedByTier = useMemo(() => {
    const counts: Record<DesignTier, number> = {
      quick: 0,
      classic: 0,
      detailed: 0,
    };
    for (const slot of allSlots) {
      if (slot.category_id !== categoryId) continue;
      const tier = slot.requested_tier ?? slot.tier;
      counts[tier] = (counts[tier] ?? 0) + 1;
    }
    return counts;
  }, [allSlots, categoryId]);

  const [selectedTier, setSelectedTier] = useState<DesignTier | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestNote, setGuestNote] = useState("");
  const [confirmed, setConfirmed] = useState<{
    tier: DesignTier;
    time: string | null;
    name: string;
  } | null>(null);

  const slotsForTier = useMemo(() => {
    if (!selectedTier) return [] as string[];
    return generateSlotTimes(setup, selectedTier, allSlots, categoryId);
  }, [selectedTier, setup, allSlots, categoryId]);

  const tiers: DesignTier[] = ["quick", "classic", "detailed"];

  function handleConfirm() {
    if (!selectedTier || !guestName.trim()) return;
    if (!setup.signup_open) return;
    addSlot({
      category_id: categoryId,
      guest_name: guestName.trim(),
      guest_id: null,
      station: null,
      start_time: selectedSlot,
      tier: selectedTier,
      requested_tier: selectedTier,
      status: "pending",
      notes: guestNote.trim(),
    });
    setConfirmed({
      tier: selectedTier,
      time: selectedSlot,
      name: guestName.trim(),
    });
    setGuestName("");
    setGuestNote("");
    setSelectedSlot(null);
    setSelectedTier(null);
  }

  if (confirmed) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-md border border-sage/40 bg-sage-pale/30 px-5 py-6 text-center">
          <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-sage/20 text-sage">
            <Check size={18} strokeWidth={2} />
          </span>
          <p
            className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-sage"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            You&apos;re on the list
          </p>
          <h2 className="font-serif text-[22px] text-ink">
            See you at the mehendi, {confirmed.name.split(" ")[0]}
          </h2>
          <p className="mt-2 text-[13px] text-ink-muted">
            {DESIGN_TIER_LABEL[confirmed.tier]} · ~
            {DESIGN_TIER_MINUTES[confirmed.tier]} min
            {confirmed.time ? ` · ${formatTime(confirmed.time)}` : ""}
          </p>
          <button
            type="button"
            onClick={() => setConfirmed(null)}
            className="mt-4 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink hover:border-saffron/40 hover:text-saffron"
          >
            Add another guest
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {previewMode && (
        <div className="mb-4 rounded-md border border-dashed border-gold/40 bg-gold-pale/20 px-3 py-2 text-center">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Preview · this is what guests will see
          </p>
        </div>
      )}

      {/* Hero */}
      <div className="mb-6 rounded-md border border-gold/20 bg-ivory-warm/50 px-5 py-6 text-center">
        <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-saffron-pale/70 text-saffron">
          <Sparkles size={16} strokeWidth={1.8} />
        </span>
        <p
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          You&apos;re invited
        </p>
        <h1 className="mt-1 font-serif text-[26px] font-bold leading-tight text-ink">
          {coupleNames ? `${coupleNames}'s` : "The"} mehendi sign-up
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-[13px] leading-relaxed text-ink-muted">
          Pick the level of mehendi you&apos;d like and claim a time slot.
          Sign-ups help us keep the line moving and make sure every guest
          gets the design they want.
        </p>
        {(setup.event_date || setup.event_start_time) && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 font-mono text-[11px] text-ink">
            <Clock size={11} strokeWidth={1.8} />
            {formatEventWhen(setup.event_date, setup.event_start_time)}
          </div>
        )}
      </div>

      {!setup.signup_open && (
        <div className="mb-5 rounded-md border border-rose/30 bg-rose-pale/30 px-3 py-2.5 text-center text-[12.5px] text-ink">
          Sign-ups are closed right now. Check back soon!
        </div>
      )}

      {/* Step 1 — pick tier */}
      <Step number="01" title="Pick your design">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {tiers.map((tier) => {
            const cap = setup.tier_capacity?.[tier] ?? 0;
            const claimed = claimedByTier[tier] ?? 0;
            const remaining = Math.max(0, cap - claimed);
            const full = cap > 0 && remaining === 0;
            const isSelected = selectedTier === tier;

            return (
              <button
                key={tier}
                type="button"
                disabled={full || !setup.signup_open}
                onClick={() => {
                  setSelectedTier(tier);
                  setSelectedSlot(null);
                }}
                className={cn(
                  "group overflow-hidden rounded-md border text-left transition-colors",
                  isSelected
                    ? "border-saffron ring-2 ring-saffron/30"
                    : "border-border hover:border-saffron/50",
                  (full || !setup.signup_open) &&
                    "cursor-not-allowed opacity-50 hover:border-border",
                )}
              >
                <div className="relative aspect-[5/3] overflow-hidden bg-ivory-warm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={TIER_IMAGERY[tier]}
                    alt={DESIGN_TIER_LABEL[tier]}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  {full && (
                    <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-rose/95 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ivory">
                      Full
                    </span>
                  )}
                  {isSelected && !full && (
                    <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-saffron/95 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ivory">
                      <Check size={10} strokeWidth={2.5} /> Picked
                    </span>
                  )}
                </div>
                <div className="space-y-1 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-[16px] text-ink">
                      {DESIGN_TIER_LABEL[tier]}
                    </span>
                    <span className="font-mono text-[10.5px] tabular-nums text-saffron">
                      {DESIGN_TIER_MINUTES[tier]} min
                    </span>
                  </div>
                  <p className="text-[11.5px] leading-snug text-ink-muted">
                    {DESIGN_TIER_DESCRIPTION[tier]}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] text-ink-muted">
                    <Users size={10} strokeWidth={1.8} />
                    <span className="font-mono tabular-nums">
                      {remaining} of {cap} spots left
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Step>

      {/* Step 2 — pick time */}
      {selectedTier && (
        <Step number="02" title="Pick a time">
          {slotsForTier.length === 0 ? (
            <p className="rounded-md border border-dashed border-border/80 bg-ivory-warm/30 px-3 py-3 text-center text-[12.5px] italic text-ink-muted">
              No slots left for {DESIGN_TIER_LABEL[selectedTier]}. Try a
              different tier.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {slotsForTier.map((slot) => {
                const active = selectedSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={cn(
                      "rounded-full border px-3 py-1 font-mono text-[11.5px] tabular-nums transition-colors",
                      active
                        ? "border-saffron bg-saffron text-ivory"
                        : "border-border bg-white text-ink hover:border-saffron/50 hover:text-saffron",
                    )}
                  >
                    {formatTime(slot)}
                  </button>
                );
              })}
            </div>
          )}
        </Step>
      )}

      {/* Step 3 — confirm */}
      {selectedTier && (
        <Step number="03" title="Your info">
          <div className="space-y-2.5">
            <input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] focus:border-saffron/50 focus:outline-none"
            />
            <input
              value={guestNote}
              onChange={(e) => setGuestNote(e.target.value)}
              placeholder="Anything the artist should know? (e.g. henna allergy, left-handed)"
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] focus:border-saffron/50 focus:outline-none"
            />

            <div className="rounded-md border border-border bg-ivory-warm/30 px-3 py-2.5 text-[12.5px] text-ink">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron">
                You&apos;re booking
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="font-serif text-[14px]">
                  {DESIGN_TIER_LABEL[selectedTier]}
                </span>
                <span className="text-ink-muted">·</span>
                <span className="font-mono text-[11.5px] tabular-nums text-ink-muted">
                  ~{DESIGN_TIER_MINUTES[selectedTier]} min
                </span>
                {selectedSlot && (
                  <>
                    <span className="text-ink-muted">·</span>
                    <span className="font-mono text-[11.5px] tabular-nums text-ink">
                      {formatTime(selectedSlot)}
                    </span>
                  </>
                )}
              </div>
            </div>

            <button
              type="button"
              disabled={!guestName.trim() || !setup.signup_open}
              onClick={handleConfirm}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-gold/40 bg-gold px-4 py-2.5 text-[13px] font-medium text-white shadow-[0_1px_3px_rgba(184,134,11,0.2)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Heart size={13} strokeWidth={2} fill="currentColor" />
              Confirm my spot
            </button>
          </div>
        </Step>
      )}
    </div>
  );
}

function Step({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <div className="mb-3 flex items-baseline gap-2">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {number}
        </span>
        <h3 className="font-serif text-[18px] font-bold text-ink">{title}</h3>
      </div>
      {children}
    </section>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────

// Generate time slot options for the selected tier. Treats each artist
// station as parallel — we return distinct start times across the event
// window spaced by the shortest tier duration so slots don't visually
// collide. Slots already taken for this tier at this exact time are
// filtered out.
function generateSlotTimes(
  setup: EventSetup,
  tier: DesignTier,
  allSlots: { category_id: string; tier: DesignTier; start_time: string | null; requested_tier: DesignTier | null }[],
  categoryId: string,
): string[] {
  const start = parseTime(setup.event_start_time || "14:00");
  if (start === null) return [];
  const totalMinutes = setup.event_duration_hours * 60;
  const tierMinutes = DESIGN_TIER_MINUTES[tier];
  // Step at 15-min granularity so guests have plenty of options, but
  // cap so we don't exceed available artist-minutes for this tier.
  const step = 15;
  const maxOffset = Math.max(0, totalMinutes - tierMinutes);

  const takenAtTime = new Map<string, number>();
  for (const s of allSlots) {
    if (s.category_id !== categoryId) continue;
    const effectiveTier = s.requested_tier ?? s.tier;
    if (effectiveTier !== tier) continue;
    if (!s.start_time) continue;
    takenAtTime.set(s.start_time, (takenAtTime.get(s.start_time) ?? 0) + 1);
  }

  const options: string[] = [];
  for (let off = 0; off <= maxOffset; off += step) {
    const mins = start + off;
    const hh = Math.floor(mins / 60) % 24;
    const mm = mins % 60;
    const t = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
    const takenCount = takenAtTime.get(t) ?? 0;
    if (takenCount < setup.stations) options.push(t);
  }
  return options;
}

function parseTime(hhmm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!m) return null;
  const h = Number(m[1]);
  const mm = Number(m[2]);
  if (Number.isNaN(h) || Number.isNaN(mm)) return null;
  return h * 60 + mm;
}

function formatTime(hhmm: string): string {
  const parsed = parseTime(hhmm);
  if (parsed === null) return hhmm;
  const h = Math.floor(parsed / 60);
  const mm = parsed % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(mm).padStart(2, "0")} ${ampm}`;
}

function formatEventWhen(date: string, time: string): string {
  const parts: string[] = [];
  if (date) {
    try {
      const d = new Date(date + "T00:00:00");
      if (!Number.isNaN(d.getTime())) {
        parts.push(
          d.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          }),
        );
      } else {
        parts.push(date);
      }
    } catch {
      parts.push(date);
    }
  }
  if (time) parts.push(formatTime(time));
  return parts.join(" · ");
}
