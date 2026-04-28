"use client";

// ── Ritual Moments tab ────────────────────────────────────────────────────
// Brief the photographer on each ceremony: what happens, the key moment to
// capture, typical duration, and where to stand. Every ritual has an
// applies-to-this-couple toggle so regional variations don't clutter the
// list (e.g. Sikh weddings skip pheras, South Indian weddings add thali).

import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Heart,
  Image as ImageIcon,
  MapPin,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePhotographyStore } from "@/stores/photography-store";
import type { PhotoRitual } from "@/types/photography";
import type { WorkspaceCategory } from "@/types/workspace";
import {
  EmptyRow,
  Eyebrow,
  Tag,
} from "@/components/workspace/blocks/primitives";
import { InlineText } from "@/components/workspace/editable/InlineText";
import { HoverRow, IconButton } from "@/components/workspace/editable/HoverActions";
import { pushUndo } from "@/components/workspace/editable/UndoToast";

export function RitualMomentsTab({ category }: { category: WorkspaceCategory }) {
  const allRituals = usePhotographyStore((s) => s.rituals);
  const addRitual = usePhotographyStore((s) => s.addRitual);

  const rituals = useMemo(
    () =>
      allRituals
        .filter((r) => r.category_id === category.id)
        .sort((a, b) => a.sort_order - b.sort_order),
    [allRituals, category.id],
  );

  const [showSkipped, setShowSkipped] = useState(false);
  const applied = rituals.filter((r) => r.applies);
  const skipped = rituals.filter((r) => !r.applies);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Ritual guidance
          </p>
          <h2 className="mt-1 font-serif text-[22px] leading-tight text-ink">
            What happens — and how to photograph it
          </h2>
          <p className="mt-1.5 max-w-2xl text-[12.5px] text-ink-muted">
            Turn on the rituals that apply to your ceremony. Each card is a
            brief the photographer can read on the day — what it is, when to
            click the shutter, and where to stand. Edit freely; these are
            your notes to them.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tag tone="sage">{applied.length} applied</Tag>
          <Tag>{skipped.length} skipped</Tag>
          <button
            type="button"
            onClick={() =>
              addRitual({
                category_id: category.id,
                name: "New ritual",
                description: "",
                key_moment: "",
                applies: true,
              })
            }
            className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory transition-opacity hover:opacity-90"
          >
            <Plus size={13} strokeWidth={1.8} />
            Add ritual
          </button>
        </div>
      </div>

      {applied.length === 0 ? (
        <EmptyRow>
          No rituals applied yet. Toggle one below to include it, or add a
          custom one.
        </EmptyRow>
      ) : (
        <ul className="space-y-3">
          {applied.map((r) => (
            <li key={r.id}>
              <RitualCard ritual={r} />
            </li>
          ))}
        </ul>
      )}

      {skipped.length > 0 && (
        <div className="border-t border-gold/15 pt-4">
          <button
            type="button"
            onClick={() => setShowSkipped((v) => !v)}
            className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted hover:text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {showSkipped ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {showSkipped ? "Hide" : "Show"} {skipped.length} skipped ritual
            {skipped.length === 1 ? "" : "s"}
          </button>
          {showSkipped && (
            <ul className="mt-3 space-y-3">
              {skipped.map((r) => (
                <li key={r.id}>
                  <RitualCard ritual={r} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ── Ritual card ──────────────────────────────────────────────────────────

function RitualCard({ ritual }: { ritual: PhotoRitual }) {
  const updateRitual = usePhotographyStore((s) => s.updateRitual);
  const deleteRitual = usePhotographyStore((s) => s.deleteRitual);
  const addRitual = usePhotographyStore((s) => s.addRitual);
  const toggleApplies = usePhotographyStore((s) => s.toggleRitualApplies);

  function handleDelete() {
    const snap: PhotoRitual = { ...ritual };
    deleteRitual(ritual.id);
    pushUndo({
      message: `Removed ${snap.name}`,
      undo: () =>
        addRitual({
          category_id: snap.category_id,
          name: snap.name,
          alt_name: snap.alt_name,
          description: snap.description,
          key_moment: snap.key_moment,
          duration: snap.duration,
          position: snap.position,
          emotional_note: snap.emotional_note,
          reference_image_url: snap.reference_image_url,
          applies: snap.applies,
          sort_order: snap.sort_order,
        }),
    });
  }

  return (
    <div
      className={cn(
        "rounded-md border bg-white p-5 transition-opacity",
        ritual.applies ? "border-border" : "border-border/60 opacity-60",
      )}
    >
      <HoverRow className="items-start gap-3">
        <button
          type="button"
          onClick={() => toggleApplies(ritual.id)}
          className={cn(
            "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
            ritual.applies
              ? "border-sage bg-sage text-ivory"
              : "border-ink-faint bg-white text-ink-faint hover:border-saffron",
          )}
          aria-label={
            ritual.applies
              ? "Mark as not applicable"
              : "Mark as applicable to this wedding"
          }
          title={ritual.applies ? "Applies" : "Does not apply — click to include"}
        >
          {ritual.applies && <Check size={11} strokeWidth={2.4} />}
        </button>

        <HoverRow.Main>
          <div className="flex flex-wrap items-baseline gap-x-2">
            <InlineText
              value={ritual.alt_name ?? ""}
              onSave={(n) => updateRitual(ritual.id, { alt_name: n })}
              placeholder="Sanskrit / Hindi name"
              emptyLabel="Add Sanskrit name…"
              allowEmpty
              className="!p-0 font-serif text-[17px] italic text-ink"
            />
            {ritual.alt_name && (
              <span className="text-ink-faint">—</span>
            )}
            <InlineText
              value={ritual.name}
              onSave={(n) => updateRitual(ritual.id, { name: n })}
              className="!p-0 font-serif text-[17px] text-ink"
              placeholder="English name"
            />
          </div>
          <div className="mt-1.5">
            <InlineText
              value={ritual.description}
              onSave={(n) => updateRitual(ritual.id, { description: n })}
              variant="block"
              placeholder="What happens during this ritual?"
              emptyLabel="Add a one-line description…"
              allowEmpty
              className="!p-0 text-[12.5px] leading-relaxed text-ink-muted"
            />
          </div>
        </HoverRow.Main>

        <HoverRow.Actions>
          <IconButton label="Delete ritual" tone="rose" onClick={handleDelete}>
            <Trash2 size={11} />
          </IconButton>
        </HoverRow.Actions>
      </HoverRow>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Field
          icon={<Sparkles size={11} strokeWidth={1.8} />}
          label="Key moment"
          value={ritual.key_moment}
          placeholder="The shot that has to land…"
          onSave={(v) => updateRitual(ritual.id, { key_moment: v })}
        />
        <Field
          icon={<Clock size={11} strokeWidth={1.8} />}
          label="Timing"
          value={ritual.duration ?? ""}
          placeholder="e.g. Happens fast — be in position 5 min before"
          onSave={(v) => updateRitual(ritual.id, { duration: v })}
        />
        <Field
          icon={<MapPin size={11} strokeWidth={1.8} />}
          label="Camera position"
          value={ritual.position ?? ""}
          placeholder="e.g. Right of mandap, fire visible in frame"
          onSave={(v) => updateRitual(ritual.id, { position: v })}
        />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[1fr_160px]">
        <Field
          icon={<Heart size={11} strokeWidth={1.8} />}
          label="Emotional note"
          value={ritual.emotional_note ?? ""}
          placeholder="e.g. Mom cries here. Stay on her face."
          onSave={(v) => updateRitual(ritual.id, { emotional_note: v })}
        />
        <ReferenceImageSlot
          url={ritual.reference_image_url ?? ""}
          onSave={(v) =>
            updateRitual(ritual.id, { reference_image_url: v || undefined })
          }
        />
      </div>
    </div>
  );
}

function ReferenceImageSlot({
  url,
  onSave,
}: {
  url: string;
  onSave: (v: string) => void;
}) {
  const [draft, setDraft] = useState(url);
  return (
    <div className="rounded-sm bg-ivory/40 p-3">
      <div className="mb-1 flex items-center gap-1 text-ink-muted">
        <span className="text-saffron">
          <ImageIcon size={11} strokeWidth={1.8} />
        </span>
        <Eyebrow className="!text-[10px]">Reference photo</Eyebrow>
      </div>
      {url ? (
        <div className="relative aspect-[4/3] overflow-hidden rounded-sm ring-1 ring-border">
          <img
            src={url}
            alt="Reference"
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <button
            type="button"
            onClick={() => onSave("")}
            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-ink-muted shadow-sm ring-1 ring-border hover:text-rose"
            aria-label="Remove reference"
          >
            <X size={10} />
          </button>
        </div>
      ) : (
        <input
          type="url"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => onSave(draft.trim())}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSave(draft.trim());
          }}
          placeholder="Paste an image URL…"
          className="mt-1 w-full rounded-sm border border-border bg-white px-2 py-1 text-[11.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
        />
      )}
    </div>
  );
}

function Field({
  icon,
  label,
  value,
  placeholder,
  onSave,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  placeholder: string;
  onSave: (v: string) => void;
}) {
  return (
    <div className="rounded-sm bg-ivory/40 p-3">
      <div className="mb-1 flex items-center gap-1 text-ink-muted">
        <span className="text-saffron">{icon}</span>
        <Eyebrow className="!text-[10px]">{label}</Eyebrow>
      </div>
      <InlineText
        value={value}
        onSave={onSave}
        variant="block"
        placeholder={placeholder}
        emptyLabel="—"
        allowEmpty
        className="!p-0 text-[12.5px] leading-relaxed text-ink"
      />
    </div>
  );
}
