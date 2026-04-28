"use client";

// ── Phase 2 · Mood Board ───────────────────────────────────────────────────
// Hero deliverable. Editable direction paragraph, photographer brief, pin grid
// by section, and shot list. This is what the couple shares with their photog.

import { Check, Plus, Trash2 } from "lucide-react";
import { useEngagementShootStore } from "@/stores/engagement-shoot-store";
import {
  MOODBOARD_SECTION_LABEL,
  SHOT_CATEGORY_LABEL,
  type MoodBoardSection,
  type ShotCategory,
  type ShotListItem,
} from "@/types/engagement-shoot";
import {
  HeartTile,
  InlineEdit,
  Label,
  PhaseStepper,
  Section,
  TextInput,
} from "../ui";

export function MoodBoardTab() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <PhaseStepper phase={2} count={6} label="The creative brief" />
        <h2 className="font-serif text-[24px] leading-tight text-ink">
          Your Mood Board
        </h2>
        <p className="max-w-2xl text-[13.5px] leading-relaxed text-ink-muted">
          The artifact you'll share with your photographer. Direction, reference
          pins organized the way a shooter thinks, and a shot list they can work
          from on the day.
        </p>
      </header>

      <DirectionPanel />
      <PhotographerBrief />
      <PinSections />
      <ShotListPanel />
    </div>
  );
}

// ── Direction paragraph ────────────────────────────────────────────────────

function DirectionPanel() {
  const mood = useEngagementShootStore((s) => s.moodBoard);
  const update = useEngagementShootStore((s) => s.updateMoodBoard);

  return (
    <Section
      eyebrow="DIRECTION"
      title="Shoot direction"
      description="The 1–2 paragraph editorial brief. This is what your photographer reads first."
    >
      <div className="space-y-4">
        <div>
          <Label>Title</Label>
          <div className="mt-1.5">
            <TextInput
              value={mood.directionTitle}
              onChange={(v) => update({ directionTitle: v })}
              placeholder="e.g. Heritage Meets Editorial"
            />
          </div>
        </div>

        <div>
          <Label>Direction paragraph</Label>
          <InlineEdit
            multiline
            value={mood.directionParagraph}
            onChange={(v) => update({ directionParagraph: v })}
            placeholder="Describe how the photos should feel — lighting, palette, pacing. Think creative director briefing a photographer."
            className="mt-1.5 min-h-[120px] border border-border bg-white px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>Color + tone palette</Label>
            <InlineEdit
              multiline
              value={mood.paletteNote}
              onChange={(v) => update({ paletteNote: v })}
              placeholder="Warm / cool, saturation, how it maps to outfits + locations."
              className="mt-1.5 min-h-[80px] border border-border bg-white px-3 py-2"
            />
          </div>
          <div>
            <Label>Avoid</Label>
            <InlineEdit
              multiline
              value={mood.avoidNote}
              onChange={(v) => update({ avoidNote: v })}
              placeholder="What to steer clear of — harsh midday sun, fluorescent interiors, logos, small patterns..."
              className="mt-1.5 min-h-[80px] border border-border bg-white px-3 py-2"
            />
          </div>
        </div>
      </div>
    </Section>
  );
}

// ── Photographer brief (technical) ─────────────────────────────────────────

function PhotographerBrief() {
  const brief = useEngagementShootStore((s) => s.moodBoard.photographerBrief);
  const update = useEngagementShootStore((s) => s.updateMoodBoard);

  return (
    <Section
      eyebrow="PHOTOGRAPHER BRIEF"
      title="For your photographer, in their language"
      description="Lens choices, light direction, pacing — the actionable version of the direction above."
      tone="muted"
    >
      <InlineEdit
        multiline
        value={brief}
        onChange={(v) => update({ photographerBrief: v })}
        placeholder="Prioritize natural-light direction: sunrise at X (warm sandstone + empty). Mix 70-200mm compression for candid movement with architectural wides. Protect the 45-min golden window."
        className="min-h-[120px] border border-border bg-white px-3 py-2"
      />
    </Section>
  );
}

// ── Pins organized by section ──────────────────────────────────────────────

const PIN_SECTIONS: { id: MoodBoardSection; blurb: string }[] = [
  { id: "lighting_mood", blurb: "The overall feeling + light quality" },
  { id: "posing_interaction", blurb: "How the couple interacts on camera" },
  { id: "setting_backdrop", blurb: "Environments — architecture, landscape, interior" },
  { id: "detail_shots", blurb: "Hands, rings, outfits — close-up moments" },
];

function PinSections() {
  const pins = useEngagementShootStore((s) => s.moodBoard.pins);
  const addPin = useEngagementShootStore((s) => s.addMoodPin);
  const removePin = useEngagementShootStore((s) => s.removeMoodPin);

  return (
    <div className="space-y-4">
      {PIN_SECTIONS.map((section) => {
        const sectionPins = pins.filter((p) => p.section === section.id);
        return (
          <Section
            key={section.id}
            eyebrow={MOODBOARD_SECTION_LABEL[section.id]}
            title={section.blurb}
            right={
              <button
                type="button"
                onClick={() =>
                  addPin({ section: section.id, caption: "New reference" })
                }
                className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-2 py-1 text-[11.5px] text-ink-muted hover:border-saffron/40 hover:text-saffron"
              >
                <Plus size={11} strokeWidth={2} />
                Add pin
              </button>
            }
          >
            {sectionPins.length === 0 ? (
              <p className="text-[12.5px] italic text-ink-faint">
                No pins yet — add references that capture this aspect.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {sectionPins.map((pin) => (
                  <div key={pin.id} className="group relative">
                    <HeartTile
                      imageUrl={pin.imageUrl}
                      caption={pin.caption}
                      hearted
                      onToggle={() => removePin(pin.id)}
                    />
                    <button
                      type="button"
                      onClick={() => removePin(pin.id)}
                      aria-label="Remove pin"
                      className="absolute left-2 top-2 hidden h-6 w-6 items-center justify-center rounded-full bg-white/80 text-rose backdrop-blur group-hover:flex"
                    >
                      <Trash2 size={12} strokeWidth={1.8} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Section>
        );
      })}
    </div>
  );
}

// ── Shot list ──────────────────────────────────────────────────────────────

const SHOT_CATEGORY_ORDER: ShotCategory[] = [
  "must_have",
  "couple",
  "detail",
  "environment",
  "cultural",
  "per_look",
  "save_the_date",
];

function ShotListPanel() {
  const shots = useEngagementShootStore((s) => s.moodBoard.shots);
  const add = useEngagementShootStore((s) => s.addShot);

  const grouped = new Map<ShotCategory, ShotListItem[]>();
  for (const cat of SHOT_CATEGORY_ORDER) grouped.set(cat, []);
  for (const shot of shots) {
    if (!grouped.has(shot.category)) grouped.set(shot.category, []);
    grouped.get(shot.category)!.push(shot);
  }

  return (
    <Section
      eyebrow="SHOT LIST"
      title="What to capture"
      description="A starter list — check off on the day, edit liberally. Share this with your photographer before the shoot."
      right={
        <button
          type="button"
          onClick={() => add({ category: "must_have", title: "New shot" })}
          className="inline-flex items-center gap-1 rounded-md bg-ink px-2.5 py-1 text-[11.5px] font-medium text-ivory hover:bg-ink-soft"
        >
          <Plus size={11} strokeWidth={2} />
          Add shot
        </button>
      }
    >
      <div className="space-y-4">
        {SHOT_CATEGORY_ORDER.map((cat) => {
          const bucket = grouped.get(cat) ?? [];
          if (bucket.length === 0) return null;
          return (
            <div key={cat}>
              <h4
                className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {SHOT_CATEGORY_LABEL[cat]}
                <span className="ml-2 text-ink-faint/70">({bucket.length})</span>
              </h4>
              <ul className="space-y-1.5">
                {bucket.map((shot) => (
                  <ShotRow key={shot.id} shot={shot} />
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function ShotRow({ shot }: { shot: ShotListItem }) {
  const toggle = useEngagementShootStore((s) => s.toggleShotDone);
  const update = useEngagementShootStore((s) => s.updateShot);
  const remove = useEngagementShootStore((s) => s.removeShot);

  const priorityBadge =
    shot.priority === "must"
      ? "bg-sindoor/15 text-sindoor"
      : shot.priority === "preferred"
        ? "bg-gold-pale/50 text-gold"
        : "bg-ivory-warm/60 text-ink-muted";

  return (
    <li className="group flex items-start gap-2.5 rounded-md border border-transparent px-2 py-1.5 hover:border-border hover:bg-ivory-warm/30">
      <button
        type="button"
        onClick={() => toggle(shot.id)}
        aria-label={shot.done ? "Mark as not done" : "Mark as done"}
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
          shot.done
            ? "border-sage bg-sage text-white"
            : "border-border bg-white text-transparent hover:border-saffron"
        }`}
      >
        <Check size={11} strokeWidth={2.5} />
      </button>
      <div className="min-w-0 flex-1">
        <InlineEdit
          value={shot.title}
          onChange={(v) => update(shot.id, { title: v })}
          className={shot.done ? "text-ink-muted line-through" : ""}
        />
        {shot.note && (
          <InlineEdit
            value={shot.note}
            onChange={(v) => update(shot.id, { note: v })}
            className="text-[12px] text-ink-muted"
          />
        )}
      </div>
      <span
        className={`shrink-0 rounded-sm px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] ${priorityBadge}`}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {shot.priority}
      </span>
      <select
        value={shot.priority}
        onChange={(e) =>
          update(shot.id, {
            priority: e.target.value as ShotListItem["priority"],
          })
        }
        className="shrink-0 rounded-md border border-transparent bg-transparent px-1 text-[11px] text-ink-muted hover:border-border"
        aria-label="Priority"
      >
        <option value="must">Must</option>
        <option value="preferred">Preferred</option>
        <option value="nice">Nice</option>
      </select>
      <button
        type="button"
        onClick={() => remove(shot.id)}
        aria-label="Remove shot"
        className="shrink-0 text-ink-faint opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
      >
        <Trash2 size={12} strokeWidth={1.8} />
      </button>
    </li>
  );
}
