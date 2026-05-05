"use client";

// ── Vision & Ceremony Brief ───────────────────────────────────────────────
// A guided brief (not a quiz) — the couple answers a handful of thoughtful
// questions that together form the ceremony spec. Meant to be worked through
// with family, over coffee, in one sitting. Every answer is free to change
// later; the brief is not a pass-gate.

import { useMemo, useState } from "react";
import {
  BookOpen,
  Clock,
  Flame,
  Info,
  PenLine,
  Plus,
  Printer,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  Users,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { computeCeremonySnapshot, usePanditStore } from "@/stores/pandit-store";
import type {
  CeremonyLanguageBalance,
  CeremonyTradition,
  GuestParticipation,
  TraditionCategory,
} from "@/types/pandit";
import {
  CEREMONY_TRADITION_LABEL,
  GUEST_PARTICIPATION_LABEL,
  LANGUAGE_BALANCE_LABEL,
  TRADITION_CATEGORY_BY_TRADITION,
  TRADITION_CATEGORY_LABEL,
  TRADITIONS_BY_CATEGORY,
} from "@/types/pandit";
import { traditionRitualCount } from "@/lib/pandit-traditions";
import {
  Eyebrow,
  MiniStat,
  PanelCard,
  SectionHeader,
} from "@/components/workspace/blocks/primitives";
import {
  BuildJourneyDualCTA,
  SmartResumeNudge,
} from "@/components/guided-journeys/officiant-build/BuildJourneyDualCTA";

const DURATION_OPTIONS: Array<{ value: number; label: string; hint: string }> = [
  { value: 30, label: "30 min", hint: "Bare-essentials express" },
  { value: 45, label: "45 min", hint: "Streamlined core rituals" },
  { value: 60, label: "60 min", hint: "Typical simplified ceremony" },
  { value: 90, label: "90 min", hint: "Most Vedic ceremonies" },
  { value: 120, label: "2 hrs", hint: "Full traditional length" },
  { value: 180, label: "As long as it takes", hint: "No time pressure" },
];

export function CeremonyBrief() {
  const brief = usePanditStore((s) => s.brief);
  const rituals = usePanditStore((s) => s.rituals);
  const additions = usePanditStore((s) => s.additions);
  const snapshot = useMemo(
    () => computeCeremonySnapshot(rituals, brief, additions),
    [rituals, brief, additions],
  );
  const updateBrief = usePanditStore((s) => s.updateBrief);
  const updateProgramContent = usePanditStore((s) => s.updateProgramContent);
  const addAddition = usePanditStore((s) => s.addAddition);
  const updateAddition = usePanditStore((s) => s.updateAddition);
  const deleteAddition = usePanditStore((s) => s.deleteAddition);
  const applyTraditionLibrary = usePanditStore((s) => s.applyTraditionLibrary);

  const [newAddition, setNewAddition] = useState("");
  const [traditionCategory, setTraditionCategory] = useState<TraditionCategory>(
    TRADITION_CATEGORY_BY_TRADITION[brief.tradition] ?? "hindu",
  );
  const ritualStats = traditionRitualCount(brief.tradition);

  return (
    <div className="space-y-6">
      <SmartResumeNudge />
      <SectionHeader
        eyebrow="Ceremony Brief"
        title="This ceremony is yours to design. Let's begin."
        description="A set of thoughtful questions to answer together — ideally with both families at the table. Every choice is changeable later. There are no wrong answers, only your answers."
      />

      {/* ── Snapshot strip ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MiniStat
          label="Tradition"
          value={CEREMONY_TRADITION_LABEL[brief.tradition].split(" ")[0]!}
          hint={CEREMONY_TRADITION_LABEL[brief.tradition]}
        />
        <MiniStat
          label="Estimated runtime"
          value={`${snapshot.estimated_duration_min} min`}
          hint={`Target: ${
            brief.duration_target_min >= 180
              ? "open"
              : `${brief.duration_target_min} min`
          }`}
          tone={
            brief.duration_target_min >= 180 ||
            snapshot.estimated_duration_min <= brief.duration_target_min + 10
              ? "ink"
              : "saffron"
          }
        />
        <MiniStat
          label="Rituals"
          value={`${snapshot.included_rituals}/${snapshot.total_rituals}`}
          hint={
            snapshot.discussed_rituals > 0
              ? `${snapshot.discussed_rituals} flagged to discuss`
              : "All decided"
          }
        />
        <MiniStat
          label="Personal additions"
          value={additions.length}
          hint="Your voice in the ceremony"
        />
      </div>

      {/* ── Ceremony Snapshot card ─────────────────────────────────────── */}
      <CeremonySnapshotCard />

      {/* ── 1. Tradition ───────────────────────────────────────────────── */}
      <PanelCard
        icon={<BookOpen size={14} strokeWidth={1.6} />}
        title="1. Ceremony tradition"
      >
        <p className="mb-3 text-[12.5px] text-ink-muted">
          Two-step selection: first the broad tradition, then the specific
          regional or denominational variant. Your ritual list below will
          regenerate to match — personal customizations are preserved when
          you reapply the library.
        </p>

        <div className="mb-3">
          <Eyebrow className="mb-1.5">First — broad tradition</Eyebrow>
          <div className="flex flex-wrap gap-2">
            {(
              Object.keys(TRADITION_CATEGORY_LABEL) as TraditionCategory[]
            ).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setTraditionCategory(cat)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors",
                  traditionCategory === cat
                    ? "border-saffron bg-saffron-pale/40 text-saffron"
                    : "border-border bg-white text-ink-muted hover:border-saffron/40",
                )}
              >
                {TRADITION_CATEGORY_LABEL[cat]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Eyebrow className="mb-1.5">
            Then — specific tradition within{" "}
            {TRADITION_CATEGORY_LABEL[traditionCategory]}
          </Eyebrow>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {TRADITIONS_BY_CATEGORY[traditionCategory].map((t) => (
              <RadioRow
                key={t}
                selected={brief.tradition === t}
                onClick={() => updateBrief({ tradition: t })}
                label={CEREMONY_TRADITION_LABEL[t]}
              />
            ))}
          </div>
        </div>

        {/* Custom interfaith free-text */}
        {brief.tradition === "interfaith_custom" && (
          <div className="mt-4 space-y-2 rounded-md bg-ivory-warm/40 p-3">
            <Eyebrow>Your custom interfaith combination</Eyebrow>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <input
                type="text"
                value={brief.interfaith_primary ?? ""}
                onChange={(e) =>
                  updateBrief({ interfaith_primary: e.target.value })
                }
                placeholder="Tradition 1 (e.g. 'Bengali Hindu')"
                className="rounded-md border border-border bg-white px-3 py-2 text-[12.5px] text-ink focus:border-saffron focus:outline-none"
              />
              <input
                type="text"
                value={brief.interfaith_secondary ?? ""}
                onChange={(e) =>
                  updateBrief({ interfaith_secondary: e.target.value })
                }
                placeholder="Tradition 2 (e.g. 'Italian Catholic')"
                className="rounded-md border border-border bg-white px-3 py-2 text-[12.5px] text-ink focus:border-saffron focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-ink-muted">
              The starter ritual list uses a merged interfaith base — edit
              it freely to reflect your specific blend.
            </p>
          </div>
        )}

        {/* Regenerate CTA */}
        <div className="mt-4 flex flex-wrap items-start gap-3 rounded-md border border-gold/40 bg-ivory-warm/40 p-3">
          <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-md bg-saffron/15 text-saffron">
            <Sparkles size={12} strokeWidth={1.6} />
          </span>
          <div className="flex-1 min-w-[200px]">
            <div className="text-[12.5px] font-medium text-ink">
              Generate ritual list for{" "}
              {CEREMONY_TRADITION_LABEL[brief.tradition]}
            </div>
            <p className="mt-0.5 text-[11.5px] text-ink-muted">
              Loads {ritualStats.count} rituals
              {ritualStats.curated
                ? " — hand-curated for this tradition"
                : " — based on the closest tradition we support"}
              . Your personal notes and include/skip toggles carry over where
              rituals match.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  `Replace the current ritual list and samagri starter list with the ${CEREMONY_TRADITION_LABEL[brief.tradition]} defaults? Your personal notes and include/skip choices are preserved where rituals match.`,
                )
              ) {
                applyTraditionLibrary(brief.tradition, {
                  preserveCoupleNotes: true,
                });
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-2 text-[12px] font-medium text-ivory hover:bg-ink-soft"
          >
            <Wand2 size={12} strokeWidth={1.8} />
            Apply ritual library
          </button>
        </div>
      </PanelCard>

      {/* ── 2. Duration ────────────────────────────────────────────────── */}
      <PanelCard
        icon={<Clock size={14} strokeWidth={1.6} />}
        title="2. Duration target"
      >
        <p className="mb-3 text-[12.5px] text-ink-muted">
          A simplified ceremony runs 45–60 min. A full Vedic runs 90–120 min.
          Most guests are comfortable for 60–75 min. Choose your target —
          you'll see the running total update as you decide on rituals below.
        </p>
        <div className="flex flex-wrap gap-2">
          {DURATION_OPTIONS.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => updateBrief({ duration_target_min: d.value })}
              className={cn(
                "rounded-md border px-3 py-2 text-left transition-colors",
                brief.duration_target_min === d.value
                  ? "border-saffron bg-saffron-pale/40 text-ink"
                  : "border-border bg-white text-ink-muted hover:border-saffron/40",
              )}
            >
              <div className="font-medium text-[13px] text-ink">{d.label}</div>
              <div
                className="font-mono text-[10px] text-ink-muted"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {d.hint}
              </div>
            </button>
          ))}
        </div>
      </PanelCard>

      {/* ── 3. Language balance ────────────────────────────────────────── */}
      <PanelCard
        icon={<BookOpen size={14} strokeWidth={1.6} />}
        title="3. Language balance"
      >
        <p className="mb-3 text-[12.5px] text-ink-muted">
          How should Sanskrit, English, and Hindi blend?
        </p>
        <div className="space-y-1.5">
          {(
            Object.keys(LANGUAGE_BALANCE_LABEL) as CeremonyLanguageBalance[]
          ).map((l) => (
            <RadioRow
              key={l}
              selected={brief.language_balance === l}
              onClick={() => updateBrief({ language_balance: l })}
              label={LANGUAGE_BALANCE_LABEL[l]}
            />
          ))}
        </div>
        <div className="mt-4 rounded-md bg-saffron-pale/30 p-3 text-[12px] leading-relaxed text-ink">
          <div className="flex items-start gap-2">
            <Info
              size={13}
              strokeWidth={1.8}
              className="mt-0.5 shrink-0 text-saffron"
            />
            <p>
              English explanations add 10–15 minutes to the ceremony but
              dramatically increase guest engagement. Consider a printed
              program as an alternative — guests follow along without adding
              ceremony time.
            </p>
          </div>
        </div>
      </PanelCard>

      {/* ── 4. Participation ───────────────────────────────────────────── */}
      <PanelCard
        icon={<Users size={14} strokeWidth={1.6} />}
        title="4. Guest participation"
      >
        <p className="mb-3 text-[12.5px] text-ink-muted">
          How involved should your guests be during the ceremony?
        </p>
        <div className="space-y-1.5">
          {(
            Object.keys(GUEST_PARTICIPATION_LABEL) as GuestParticipation[]
          ).map((g) => (
            <RadioRow
              key={g}
              selected={brief.guest_participation === g}
              onClick={() => updateBrief({ guest_participation: g })}
              label={GUEST_PARTICIPATION_LABEL[g]}
            />
          ))}
        </div>
      </PanelCard>

      {/* ── 5. Rituals — handed off to the Build journey ───────────────── */}
      <PanelCard
        icon={<BookOpen size={14} strokeWidth={1.6} />}
        title="5. Rituals — the big conversation"
        badge={
          <span
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {snapshot.included_rituals} including · {snapshot.discussed_rituals}{" "}
            to discuss
          </span>
        }
      >
        <p className="mb-3 text-[12.5px] text-ink-muted">
          Decide for each ritual: include, skip, or discuss with your
          officiant. Some — like Kanyadaan — carry complicated feelings for
          some couples. The Build journey walks you through every ritual one
          by one and surfaces flagged decisions in your pandit conversation.
        </p>
        <BuildJourneyDualCTA
          startAtSession="rituals_walkthrough"
          guidedHeading="Build the ritual list with us"
        />
      </PanelCard>

      {/* ── 6. Personal additions ──────────────────────────────────────── */}
      <PanelCard
        icon={<PenLine size={14} strokeWidth={1.6} />}
        title="6. Personal additions"
      >
        <p className="mb-3 text-[12.5px] text-ink-muted">
          Moments you want to add that aren't part of the traditional script —
          your own vows, a tribute to a late grandparent, a song that means
          something to you. Your officiant can often weave these in.
        </p>
        <div className="space-y-2">
          {additions.map((a) => (
            <div
              key={a.id}
              className="group flex gap-2 rounded-md border border-border bg-white p-2.5"
            >
              <textarea
                value={a.body}
                onChange={(e) => updateAddition(a.id, e.target.value)}
                rows={2}
                className="flex-1 resize-none border-0 bg-transparent text-[12.5px] leading-relaxed text-ink focus:outline-none"
              />
              <button
                type="button"
                onClick={() => deleteAddition(a.id)}
                className="opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Delete addition"
              >
                <Trash2
                  size={13}
                  strokeWidth={1.8}
                  className="text-ink-muted hover:text-rose"
                />
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newAddition}
              onChange={(e) => setNewAddition(e.target.value)}
              placeholder="Add a personal moment…"
              className="flex-1 rounded-md border border-border bg-white px-3 py-2 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newAddition.trim()) {
                  addAddition(newAddition.trim());
                  setNewAddition("");
                }
              }}
            />
            <button
              type="button"
              disabled={!newAddition.trim()}
              onClick={() => {
                if (newAddition.trim()) {
                  addAddition(newAddition.trim());
                  setNewAddition("");
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-2 text-[12px] font-medium text-ivory transition-colors hover:bg-ink-soft disabled:opacity-40"
            >
              <Plus size={12} strokeWidth={2} />
              Add
            </button>
          </div>
        </div>
      </PanelCard>

      {/* ── 7. Program ─────────────────────────────────────────────────── */}
      <PanelCard
        icon={<Send size={14} strokeWidth={1.6} />}
        title="7. Printed ceremony program"
      >
        <label className="flex items-center gap-2 text-[13px] text-ink">
          <input
            type="checkbox"
            checked={brief.wants_printed_program}
            onChange={(e) =>
              updateBrief({ wants_printed_program: e.target.checked })
            }
            className="h-4 w-4 rounded border-border text-saffron focus:ring-saffron"
          />
          We'd like a printed program for our guests.
        </label>
        {brief.wants_printed_program && (
          <>
            <div className="mt-3 space-y-1.5 rounded-md bg-ivory-warm/40 p-3">
              <Eyebrow className="text-stone-500">Include in program</Eyebrow>
              {(
                [
                  ["include_ritual_meanings", "Ritual names and meanings"],
                  ["include_family_roles", "Family roles"],
                  ["include_love_story", "Our love story"],
                  ["include_dress_code", "Dress code reminder"],
                  ["include_unplugged_reminder", "Unplugged ceremony reminder"],
                ] as const
              ).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 text-[12.5px] text-ink"
                >
                  <input
                    type="checkbox"
                    checked={brief.program_content[key]}
                    onChange={(e) =>
                      updateProgramContent({ [key]: e.target.checked })
                    }
                    className="h-3.5 w-3.5 rounded border-border text-saffron focus:ring-saffron"
                  />
                  {label}
                </label>
              ))}
            </div>
            <ProgramStudioUpsell />
          </>
        )}
      </PanelCard>

      {/* ── Cultural context ───────────────────────────────────────────── */}
      <PanelCard
        icon={<Info size={14} strokeWidth={1.6} />}
        title="Cultural context"
      >
        <p className="mb-2 text-[12px] text-ink-muted">
          An at-a-glance summary that ties your choices together. Share this
          with your officiant candidates — it sets expectations better than a
          list of rituals does.
        </p>
        <textarea
          value={brief.cultural_context}
          onChange={(e) => updateBrief({ cultural_context: e.target.value })}
          rows={4}
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-[12.5px] leading-relaxed text-ink focus:border-saffron focus:outline-none"
        />
      </PanelCard>
    </div>
  );
}

// ── Ceremony snapshot — one readable card couples can share with candidates

function CeremonySnapshotCard() {
  const brief = usePanditStore((s) => s.brief);
  const rituals = usePanditStore((s) => s.rituals);
  const additions = usePanditStore((s) => s.additions);
  const logistics = usePanditStore((s) => s.logistics);
  const snapshot = useMemo(
    () => computeCeremonySnapshot(rituals, brief, additions),
    [rituals, brief, additions],
  );

  const fireRitualIncluded = rituals.some(
    (r) => r.id === "rit-havan" && r.inclusion === "yes",
  );

  const rows: Array<{ label: string; value: string }> = [
    { label: "Tradition", value: CEREMONY_TRADITION_LABEL[brief.tradition] },
    {
      label: "Duration",
      value:
        brief.duration_target_min >= 180
          ? `~${snapshot.estimated_duration_min} min (no time cap)`
          : `~${snapshot.estimated_duration_min} min · target ${brief.duration_target_min} min`,
    },
    { label: "Language", value: LANGUAGE_BALANCE_LABEL[brief.language_balance] },
    {
      label: "Rituals",
      value: `${snapshot.included_rituals} of ${snapshot.total_rituals} selected${
        snapshot.discussed_rituals > 0
          ? ` · ${snapshot.discussed_rituals} to discuss`
          : ""
      }`,
    },
    {
      label: "Fire ceremony",
      value: fireRitualIncluded
        ? logistics.fire_permit_needed
          ? `Yes — havan kund · permit ${logistics.fire_permit_status || "pending"}`
          : "Yes — havan kund"
        : "No — flame-free ceremony",
    },
    {
      label: "Guest program",
      value: brief.wants_printed_program
        ? "Yes — printed, bilingual"
        : "No printed program",
    },
    {
      label: "Guest engagement",
      value: GUEST_PARTICIPATION_LABEL[brief.guest_participation],
    },
  ];

  return (
    <section className="rounded-lg border border-gold/40 bg-ivory-warm/40 p-5 shadow-[0_1px_1px_rgba(26,26,26,0.03)]">
      <header className="mb-4 flex items-start justify-between gap-3 border-b border-gold/25 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-saffron/15 text-saffron">
            <Flame size={14} strokeWidth={1.6} />
          </span>
          <div>
            <Eyebrow>Ceremony at a glance</Eyebrow>
            <h4 className="mt-0.5 font-serif text-[16px] leading-tight text-ink">
              Share this with officiant candidates.
            </h4>
          </div>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-2.5 py-1.5 text-[11.5px] font-medium text-ink-muted hover:border-saffron/40 hover:text-saffron"
        >
          <Printer size={11} strokeWidth={1.8} />
          Print
        </button>
      </header>
      <dl className="divide-y divide-gold/20">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[120px_1fr] items-start gap-3 py-2"
          >
            <dt
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {row.label}
            </dt>
            <dd className="text-[12.5px] leading-relaxed text-ink">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-[10.5px] italic text-ink-muted">
        Updates live as you design the ceremony below.
      </p>
    </section>
  );
}

// ── Primitives ───────────────────────────────────────────────────────────

function RadioRow({
  selected,
  onClick,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md border px-3 py-2 text-left transition-colors",
        selected
          ? "border-saffron bg-saffron-pale/30 text-ink"
          : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-ink",
      )}
    >
      <span
        className={cn(
          "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border",
          selected ? "border-saffron bg-saffron" : "border-border bg-white",
        )}
      >
        {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
      </span>
      <span className="text-[13px]">{label}</span>
    </button>
  );
}

// ── Printed program → Studio upsell ──────────────────────────────────────
function ProgramStudioUpsell() {
  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-gold/40 bg-gradient-to-br from-ivory-warm/60 to-white">
      <div className="grid grid-cols-1 gap-0 md:grid-cols-[1fr_160px]">
        <div className="p-4">
          <Eyebrow className="text-saffron">Design it in Studio</Eyebrow>
          <h4 className="mt-1 font-serif text-[16px] leading-tight text-ink">
            Turn this checklist into a printed program.
          </h4>
          <p className="mt-1.5 text-[12px] leading-relaxed text-ink-muted">
            Studio pre-populates a ceremony program template with the rituals
            and roles you've chosen — add photos, vows, and a cover, then
            we'll print it for you. Design here, delivered to your venue.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Link
              href="/studio"
              className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-2 text-[12px] font-medium text-ivory hover:bg-ink-soft"
            >
              <PenLine size={12} strokeWidth={1.8} />
              Design your program in Studio
            </Link>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
              printing included
            </span>
          </div>
        </div>
        {/* Visual mock — stylized bi-fold program */}
        <div className="hidden items-center justify-center border-l border-gold/30 bg-ivory-warm/40 p-4 md:flex">
          <div className="flex h-[140px] w-[140px] items-center gap-1 rounded-sm bg-white p-2 shadow-[0_2px_6px_rgba(26,26,26,0.08)]">
            <div className="flex h-full w-1/2 flex-col items-center justify-center border-r border-dashed border-gold/40 px-1 text-center">
              <div className="font-serif text-[9px] leading-tight text-ink">
                Priya & Arjun
              </div>
              <div
                className="mt-0.5 font-mono text-[6px] uppercase tracking-[0.12em] text-ink-muted"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                our ceremony
              </div>
              <div className="mt-1 h-[1px] w-6 bg-saffron" />
              <div className="mt-1 text-[6px] italic text-ink-muted">
                a printed guide for our guests
              </div>
            </div>
            <div className="flex h-full w-1/2 flex-col justify-start px-1 text-left">
              <div
                className="font-mono text-[6px] uppercase tracking-[0.12em] text-saffron"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                order of service
              </div>
              <div className="mt-0.5 space-y-[1.5px] text-[6.5px] leading-tight text-ink">
                <div>1. Ganesh Puja</div>
                <div>2. Jaimala</div>
                <div>3. Vivah Havan</div>
                <div>4. Mangal Pheras</div>
                <div>5. Saptapadi</div>
                <div>6. Aashirvad</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

