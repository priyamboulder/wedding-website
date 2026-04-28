"use client";

// ── Phase 1 · Vision Session ───────────────────────────────────────────────
// Visual-first discovery flow. Seven sections the couple can scroll through.
// Every answer persists immediately so nothing is lost between tabs.

import { useMemo } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useEngagementShootStore } from "@/stores/engagement-shoot-store";
import {
  BUDGET_OPTIONS,
  CULTURAL_OPTIONS,
  ENERGY_OPTIONS,
  OUTFIT_COUNT_OPTIONS,
  PHOTOGRAPHER_STATUS_OPTIONS,
  TRIP_SCOPE_OPTIONS,
  type BudgetTier,
  type CulturalAttire,
  type OutfitCount,
  type PhotographerStatus,
  type ShootEnergy,
  type TripScope,
} from "@/types/engagement-shoot";
import {
  ChoiceTile,
  HeartTile,
  InlineEdit,
  Label,
  PhaseStepper,
  Section,
  SummaryRow,
  TextInput,
} from "../ui";

export function VisionSessionTab({ onAdvance }: { onAdvance: () => void }) {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <PhaseStepper phase={1} count={6} label="Visual discovery" />
        <h2 className="font-serif text-[24px] leading-tight text-ink">
          The Vision Session
        </h2>
        <p className="max-w-2xl text-[13.5px] leading-relaxed text-ink-muted">
          Pure inspiration — no logistics yet. Tap what resonates, skip what
          doesn't. Your answers here become the creative brief your photographer,
          stylist, and trip planner all work from.
        </p>
      </header>

      <EnergyQuestion />
      <ReferenceGrid />
      <OutfitCountQuestion />
      <CulturalAttireQuestion />
      <TripScopeQuestion />
      <TimingBudgetQuestion />
      <PhotographerQuestion />
      <CompleteStrip onAdvance={onAdvance} />
    </div>
  );
}

// ── 1 · Couple energy ──────────────────────────────────────────────────────

function EnergyQuestion() {
  const energies = useEngagementShootStore((s) => s.vision.energies);
  const toggle = useEngagementShootStore((s) => s.toggleEnergy);

  return (
    <Section
      eyebrow="1 · ENERGY"
      title="What's your couple energy?"
      description="Pick up to two — most couples are a blend of moods."
    >
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-4">
        {ENERGY_OPTIONS.map((e) => (
          <ChoiceTile
            key={e.id}
            emoji={e.emoji}
            label={e.label}
            blurb={e.blurb}
            selected={energies.includes(e.id)}
            onClick={() => toggle(e.id as ShootEnergy)}
            disabled={!energies.includes(e.id) && energies.length >= 2}
          />
        ))}
      </div>
    </Section>
  );
}

// ── 2 · Visual reference grid ──────────────────────────────────────────────

function ReferenceGrid() {
  const references = useEngagementShootStore((s) => s.references);
  const toggle = useEngagementShootStore((s) => s.toggleReferenceHeart);

  const heartedCount = references.filter((r) => r.hearted).length;
  const pattern = useMemo(() => summariseHearts(references), [references]);

  return (
    <Section
      eyebrow="2 · VISUAL IDENTITY"
      title="Show us what you love."
      description="Tap to heart any image that resonates. We'll read your picks for lighting, setting, pose, and palette tendencies."
      right={
        <span
          className="rounded-full bg-ivory-warm/60 px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {heartedCount} hearted
        </span>
      }
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {references.map((ref) => (
          <HeartTile
            key={ref.id}
            imageUrl={ref.imageUrl}
            caption={ref.caption}
            hearted={ref.hearted}
            onToggle={() => toggle(ref.id)}
          />
        ))}
      </div>
      {heartedCount >= 3 && (
        <div className="mt-4 rounded-md border border-saffron/30 bg-saffron/5 p-3.5">
          <p
            className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Pattern we're reading
          </p>
          <p className="text-[13px] leading-relaxed text-ink">{pattern}</p>
        </div>
      )}
    </Section>
  );
}

function summariseHearts(
  refs: { hearted: boolean; tags: string[] }[],
): string {
  const hearted = refs.filter((r) => r.hearted);
  if (hearted.length === 0)
    return "Heart a few images to see a read on your taste.";
  const count = new Map<string, number>();
  for (const r of hearted) {
    for (const t of r.tags) count.set(t, (count.get(t) ?? 0) + 1);
  }
  const top = [...count.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag]) => TAG_LABEL[tag] ?? tag);
  if (top.length === 0) {
    return "You're still exploring — keep hearting what catches your eye.";
  }
  return `You keep gravitating to ${top.join(" · ")}. Your shoot direction will lean into these.`;
}

const TAG_LABEL: Record<string, string> = {
  golden_hour: "golden-hour warmth",
  warm: "warm tones",
  cultural: "cultural heritage",
  heritage: "heritage architecture",
  editorial: "editorial framing",
  urban: "urban edge",
  moody: "moody low light",
  candid: "candid movement",
  movement: "fabric + body in motion",
  intimate: "intimate close-ups",
  soft_light: "soft light",
  architecture: "architectural symmetry",
  color: "saturated color",
  detail: "tight detail frames",
  adventure: "landscape scale",
  landscape: "landscape backdrops",
  city: "city backdrops",
  traditional: "traditional attire",
  jewelry: "jewelry + close detail",
  soft: "painterly softness",
  romantic: "romantic staging",
  florals: "florals",
  effortless: "effortless candid energy",
  formal: "formal tailoring",
  posed: "composed editorial frames",
  clean: "clean minimalism",
  vintage: "vintage feel",
  film: "film-grain aesthetic",
  timeless: "timeless styling",
};

// ── 3 · Outfit count ───────────────────────────────────────────────────────

function OutfitCountQuestion() {
  const count = useEngagementShootStore((s) => s.vision.outfitCount);
  const update = useEngagementShootStore((s) => s.updateVision);

  return (
    <Section
      eyebrow="3 · LOOKS"
      title="How many looks are you thinking?"
      description="Shapes your timeline, location count, and how the trip gets structured."
    >
      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-5">
        {OUTFIT_COUNT_OPTIONS.map((opt) => (
          <ChoiceTile
            key={opt.id}
            label={opt.label}
            blurb={opt.blurb}
            selected={count === opt.id}
            onClick={() => update({ outfitCount: opt.id as OutfitCount })}
          />
        ))}
      </div>
    </Section>
  );
}

// ── 4 · Cultural attire ────────────────────────────────────────────────────

function CulturalAttireQuestion() {
  const selected = useEngagementShootStore((s) => s.vision.culturalAttire);
  const toggle = useEngagementShootStore((s) => s.toggleCultural);

  return (
    <Section
      eyebrow="4 · CULTURAL ATTIRE"
      title="Any traditional or cultural outfits?"
      description="Unlocks culturally specific styling guidance, location suggestions, and coordination advice."
    >
      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-3">
        {CULTURAL_OPTIONS.map((opt) => (
          <ChoiceTile
            key={opt.id}
            label={opt.label}
            selected={selected.includes(opt.id)}
            onClick={() => toggle(opt.id as CulturalAttire)}
          />
        ))}
      </div>
    </Section>
  );
}

// ── 5 · Trip scope ─────────────────────────────────────────────────────────

function TripScopeQuestion() {
  const scope = useEngagementShootStore((s) => s.vision.tripScope);
  const destination = useEngagementShootStore((s) => s.vision.destinationIdea);
  const city = useEngagementShootStore((s) => s.vision.localCity);
  const update = useEngagementShootStore((s) => s.updateVision);

  return (
    <Section
      eyebrow="5 · TRIP"
      title="Are you making a trip out of this?"
      description="The shoot might be 3 hours. The trip is 2–3 days. Let's plan both."
    >
      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
        {TRIP_SCOPE_OPTIONS.map((opt) => (
          <ChoiceTile
            key={opt.id}
            label={opt.label}
            blurb={opt.blurb}
            selected={scope === opt.id}
            onClick={() => update({ tripScope: opt.id as TripScope })}
          />
        ))}
      </div>

      {scope === "destination" && (
        <div className="mt-4">
          <Label>Where are you thinking?</Label>
          <div className="mt-1.5">
            <TextInput
              value={destination}
              onChange={(v) => update({ destinationIdea: v })}
              placeholder="Jaipur · Santorini · Joshua Tree — or 'open to suggestions'"
            />
          </div>
        </div>
      )}

      {scope === "local_day" && (
        <div className="mt-4">
          <Label>What city or area?</Label>
          <div className="mt-1.5">
            <TextInput
              value={city}
              onChange={(v) => update({ localCity: v })}
              placeholder="Austin, TX"
            />
          </div>
        </div>
      )}
    </Section>
  );
}

// ── 6 · Timing + budget ────────────────────────────────────────────────────

function TimingBudgetQuestion() {
  const vision = useEngagementShootStore((s) => s.vision);
  const update = useEngagementShootStore((s) => s.updateVision);

  return (
    <Section
      eyebrow="6 · TIMING & BUDGET"
      title="When is the shoot — and what's the budget?"
      description="Season changes everything — golden-hour timing, foliage, what you can wear. Budget shapes how ambitious we get."
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <Label>Shoot date / window</Label>
            <InlineEdit
              value={vision.shootDate}
              onChange={(v) => update({ shootDate: v })}
              placeholder="Oct 10 2026 · or 'late September'"
              className="mt-1 border border-border bg-white px-3 py-2"
            />
          </div>
          <div>
            <Label>Months before wedding</Label>
            <InlineEdit
              value={
                vision.monthsBeforeWedding === null
                  ? ""
                  : String(vision.monthsBeforeWedding)
              }
              onChange={(v) => {
                const n = Number(v);
                update({
                  monthsBeforeWedding:
                    Number.isFinite(n) && v !== "" ? n : null,
                });
              }}
              placeholder="6–10 months is typical for save-the-dates"
              className="mt-1 border border-border bg-white px-3 py-2"
            />
          </div>
          <label className="flex items-center gap-2 text-[13px] text-ink">
            <input
              type="checkbox"
              checked={vision.usedForSaveTheDates}
              onChange={(e) =>
                update({ usedForSaveTheDates: e.target.checked })
              }
              className="h-3.5 w-3.5 rounded border-border text-saffron focus:ring-saffron/40"
            />
            Using these for save-the-dates
          </label>
        </div>

        <div className="space-y-3">
          <BudgetRow
            label="Photography"
            value={vision.photographyBudget}
            onChange={(v) => update({ photographyBudget: v })}
          />
          <BudgetRow
            label="Travel (if trip)"
            value={vision.travelBudget}
            onChange={(v) => update({ travelBudget: v })}
          />
          <BudgetRow
            label="Outfits"
            value={vision.outfitBudget}
            onChange={(v) => update({ outfitBudget: v })}
          />
          <BudgetRow
            label="Hair & makeup"
            value={vision.hmuaBudget}
            onChange={(v) => update({ hmuaBudget: v })}
          />
        </div>
      </div>
    </Section>
  );
}

function BudgetRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: BudgetTier | null;
  onChange: (v: BudgetTier | null) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <select
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value ? (e.target.value as BudgetTier) : null)
        }
        className="mt-1 w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-ink focus:border-saffron/60 focus:outline-none"
      >
        <option value="">Not set</option>
        {BUDGET_OPTIONS.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── 7 · Photographer ───────────────────────────────────────────────────────

function PhotographerQuestion() {
  const vision = useEngagementShootStore((s) => s.vision);
  const update = useEngagementShootStore((s) => s.updateVision);

  return (
    <Section
      eyebrow="7 · PHOTOGRAPHER"
      title="Do you have a photographer yet?"
      description="If not, we'll suggest what to look for once your vision is in place."
    >
      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
        {PHOTOGRAPHER_STATUS_OPTIONS.map((opt) => (
          <ChoiceTile
            key={opt.id}
            label={opt.label}
            blurb={opt.blurb}
            selected={vision.photographerStatus === opt.id}
            onClick={() =>
              update({ photographerStatus: opt.id as PhotographerStatus })
            }
          />
        ))}
      </div>

      {vision.photographerStatus === "booked" && (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>Photographer name</Label>
            <div className="mt-1.5">
              <TextInput
                value={vision.photographerName}
                onChange={(v) => update({ photographerName: v })}
                placeholder="e.g. Studio Kelpie"
              />
            </div>
          </div>
          <div>
            <Label>Portfolio link</Label>
            <div className="mt-1.5">
              <TextInput
                value={vision.photographerPortfolio}
                onChange={(v) => update({ photographerPortfolio: v })}
                placeholder="https://..."
              />
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}

// ── Complete + move to Phase 2 ─────────────────────────────────────────────

function CompleteStrip({ onAdvance }: { onAdvance: () => void }) {
  const vision = useEngagementShootStore((s) => s.vision);
  const complete = useEngagementShootStore((s) => s.completeVision);
  const references = useEngagementShootStore((s) => s.references);
  const hearted = useMemo(
    () => references.filter((r) => r.hearted).length,
    [references],
  );

  const answered = [
    vision.energies.length > 0,
    hearted >= 3,
    vision.outfitCount !== null,
    vision.tripScope !== null,
    vision.shootDate.trim().length > 0,
    vision.photographerStatus !== null,
  ];
  const filled = answered.filter(Boolean).length;

  const summary: { label: string; value: string }[] = [
    { label: "Energies", value: String(vision.energies.length) },
    { label: "Hearted images", value: String(hearted) },
    {
      label: "Looks",
      value:
        OUTFIT_COUNT_OPTIONS.find((o) => o.id === vision.outfitCount)?.label ??
        "—",
    },
    {
      label: "Trip",
      value:
        TRIP_SCOPE_OPTIONS.find((o) => o.id === vision.tripScope)?.label ??
        "—",
    },
    { label: "Date", value: vision.shootDate || "—" },
    {
      label: "Photographer",
      value:
        PHOTOGRAPHER_STATUS_OPTIONS.find(
          (o) => o.id === vision.photographerStatus,
        )?.label ?? "—",
    },
  ];

  return (
    <section className="rounded-lg border border-saffron/40 bg-gradient-to-br from-ivory to-gold-pale/15 p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Vision summary
          </p>
          <h3 className="mt-1 font-serif text-[18px] leading-snug text-ink">
            {filled === 6
              ? "You've got a full vision. Let's build the mood board."
              : `${filled} of 6 sections answered — keep going.`}
          </h3>
          {vision.completedAt && (
            <p className="mt-1.5 inline-flex items-center gap-1.5 text-[12px] text-sage">
              <CheckCircle2 size={13} strokeWidth={1.8} />
              Vision saved · your photographer will see this
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            complete();
            onAdvance();
          }}
          disabled={filled < 4}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-[12.5px] font-medium text-ivory transition-colors hover:bg-ink-soft disabled:cursor-not-allowed disabled:bg-ink-faint"
        >
          Generate mood board
          <ArrowRight size={13} strokeWidth={1.8} />
        </button>
      </div>
      <SummaryRow items={summary} />
    </section>
  );
}
