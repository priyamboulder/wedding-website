"use client";

// ── Hair & Makeup → Bride Looks tab ───────────────────────────────────────
// One event at a time, in full detail. The bride picks an event from the
// top row of tabs and the page below becomes her design board for that
// event alone: cross-workspace context at the top (outfit, jewelry, photo
// style), face + eyes + lips + hair sections, notes to artist, touch-up
// priorities, and a rotating guidance hint for the event.
//
// Beneath, a horizontal Beauty Arc summary tells the narrative of how the
// looks evolve across the celebration. AI composer + accessory recs sit at
// the bottom, unchanged.

import { useMemo, useState } from "react";
import {
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  Crown,
  Gem,
  Lightbulb,
  Palette,
  Shirt,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type {
  WeddingEvent,
  WorkspaceCategory,
  WorkspaceItem,
} from "@/types/workspace";
import { WEDDING_EVENTS } from "@/types/workspace";
import {
  EmptyRow,
  Eyebrow,
  PanelCard,
} from "@/components/workspace/blocks/primitives";
import {
  AccessoryRecommender,
  EventLookComposer,
  eventIdFromLabel,
} from "@/components/workspace/hmua/ai/LookPanels";
import { useHmuaStore } from "@/stores/hmua-store";
import { PhotoLookDiscoveryPanel } from "@/components/workspace/hmua/PhotoLookDiscovery";

// ── Types on look.meta ───────────────────────────────────────────────────

type LookIntensity = "light" | "medium" | "full";

interface TouchUpPriority {
  id: string;
  label: string;
  done: boolean;
}

interface LookMeta {
  event?: string;
  person?: string;
  approved?: boolean;
  // Face
  foundation?: string;
  skin_finish?: string;
  contour?: string;
  blush?: string;
  highlight?: string;
  // Eyes
  eye_look?: string;
  eye_liner?: string;
  eye_lashes?: string;
  eye_brows?: string;
  // Lips
  lip_color?: string;
  lip_liner?: string;
  lip_finish?: string;
  lip_product?: string;
  // Hair
  hair_style?: string;
  hair_accessories?: string;
  dupatta_drape?: string;
  // Legacy fields kept for back-compat with earlier writes
  bindi_tikka?: string;
  intensity?: LookIntensity;
  // Cross-workspace refs
  outfit_ref?: string;
  jewelry_ref?: string;
  photo_style_ref?: string;
  // Copy
  coordination_notes?: string;
  notes_to_artist?: string;
  reference_image_url?: string;
  // Touch-up priorities between this event and the next
  touch_up_priorities?: TouchUpPriority[];
  // One-word feel for the Beauty Arc summary
  arc_mood?: string;
}

const DEFAULT_TOUCH_UP_PRIORITIES = [
  "Blot T-zone and re-set",
  "Reapply lip colour",
  "Check dupatta pins",
  "Refresh setting spray",
  "Touch up under-eye concealer",
] as const;

const EVENT_MOOD_HINT: Record<string, string> = {
  Haldi: "Fresh & dewy",
  Mehendi: "Playful & fun",
  Sangeet: "Bold & glam",
  Baraat: "Regal & radiant",
  Wedding: "Bridal & regal",
  Reception: "Modern & chic",
};

// Per-event guidance shown above the look builder — a subtle hint of
// what each event typically calls for.
const EVENT_GUIDANCE: Record<string, string> = {
  Haldi:
    "Usually the lightest look — fresh, dewy, minimal. Turmeric will stain, so many brides skip heavy makeup and lean into skincare + SPF + lip tint.",
  Mehendi:
    "Fun, colourful, relaxed. A good time to experiment with a bolder lip or eye. Hair stays practical (one hand is drying).",
  Sangeet:
    "Party mode — this is where bold glam lives. Smokey eyes, statement lips, hair down or dramatic updo.",
  Baraat:
    "Sunlit, festive, moving — finish should photograph matte under daylight. Hair pinned so it stays put through the procession.",
  Wedding:
    "The signature look. Most detailed, most layered, longest-wearing. This is what you'll see in every photo for the rest of your life.",
  Reception:
    "The second impression. Many brides go more modern, change hair (down if it was up, or vice versa), shift the lip colour. A deliberate evolution.",
};

// ── Root ─────────────────────────────────────────────────────────────────

export function HmuaBrideLooksTab({ category }: { category: WorkspaceCategory }) {
  const items = useWorkspaceStore((s) => s.items);
  const addItem = useWorkspaceStore((s) => s.addItem);
  const updateItem = useWorkspaceStore((s) => s.updateItem);
  const deleteItem = useWorkspaceStore((s) => s.deleteItem);
  const currentRole = useWorkspaceStore((s) => s.currentRole);
  const canEdit = currentRole !== "vendor";

  // Look items for this workspace, sorted by wedding event order.
  const looks = useMemo(
    () =>
      items
        .filter(
          (i) =>
            i.category_id === category.id &&
            i.tab === "bride_looks" &&
            i.block_type === "look",
        )
        .sort((a, b) => {
          const ea = WEDDING_EVENTS.findIndex(
            (e) => e.label === ((a.meta?.event as string) ?? ""),
          );
          const eb = WEDDING_EVENTS.findIndex(
            (e) => e.label === ((b.meta?.event as string) ?? ""),
          );
          if (ea === eb) return a.sort_order - b.sort_order;
          if (ea === -1) return 1;
          if (eb === -1) return -1;
          return ea - eb;
        }),
    [items, category.id],
  );

  // Map each event → the (first) look item for that event.
  const looksByEvent = useMemo(() => {
    const map = new Map<string, WorkspaceItem>();
    for (const l of looks) {
      const ev = (l.meta?.event as string | undefined) ?? "";
      if (!ev) continue;
      if (!map.has(ev)) map.set(ev, l);
    }
    return map;
  }, [looks]);

  // Active event tab.
  const [activeEvent, setActiveEvent] = useState<WeddingEvent>(
    // Default to Wedding if it has a look; otherwise the first event with a
    // look; otherwise Wedding.
    () => {
      const wedding = WEDDING_EVENTS.find((e) => e.label === "Wedding");
      if (wedding && looksByEvent.has(wedding.label)) return wedding.id;
      const firstWithLook = WEDDING_EVENTS.find((e) => looksByEvent.has(e.label));
      return firstWithLook?.id ?? wedding?.id ?? WEDDING_EVENTS[0].id;
    },
  );

  const activeEventDef = WEDDING_EVENTS.find((e) => e.id === activeEvent);
  const activeEventLabel = activeEventDef?.label ?? "Wedding";
  const activeLook = looksByEvent.get(activeEventLabel) ?? null;

  // Outfit lookups from Wardrobe workspace for the "Connected to" block.
  const wardrobeCategory = useWorkspaceStore((s) =>
    s.categories.find((c) => c.slug === "wardrobe"),
  );
  const wardrobeOutfits = useMemo(() => {
    if (!wardrobeCategory) return new Map<string, WorkspaceItem[]>();
    const map = new Map<string, WorkspaceItem[]>();
    for (const i of items) {
      if (i.category_id !== wardrobeCategory.id) continue;
      if (i.tab !== "wardrobe_looks") continue;
      if (i.block_type !== "outfit") continue;
      if ((i.meta?.person as string | undefined) !== "Bride") continue;
      const ev = (i.meta?.event as string | undefined) ?? "";
      if (!ev) continue;
      if (!map.has(ev)) map.set(ev, []);
      map.get(ev)!.push(i);
    }
    return map;
  }, [items, wardrobeCategory]);

  // Photography style reference (a single brief carries across all events).
  const photographyCategory = useWorkspaceStore((s) =>
    s.categories.find((c) => c.slug === "photography"),
  );
  const photoStyleHint = useMemo(() => {
    if (!photographyCategory) return "";
    if (typeof window === "undefined") return "";
    try {
      const raw = window.localStorage.getItem(
        `ananya:photo-brief:${photographyCategory.id}`,
      );
      if (!raw) return "";
      // Best-effort: pull the first line of the persisted brief.
      const trimmed = raw.trim().replace(/^"|"$/g, "");
      const firstLine = trimmed.split(/\n|\r/).find((l) => l.trim());
      return firstLine?.slice(0, 140) ?? "";
    } catch {
      return "";
    }
  }, [photographyCategory]);

  const startLookForEvent = (ev: WeddingEvent) => {
    const label = WEDDING_EVENTS.find((e) => e.id === ev)?.label;
    if (!label) return;
    addItem({
      category_id: category.id,
      tab: "bride_looks",
      block_type: "look",
      title: `${label} look`,
      meta: {
        event: label,
        person: "Bride",
      },
      sort_order: looks.length + 1,
    });
  };

  return (
    <div className="space-y-6">
      <header>
        <p
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Your looks across the celebration
        </p>
        <h2 className="mt-1 font-serif font-bold text-[22px] leading-tight text-ink">
          Build each event's look — Wedding is the centerpiece
        </h2>
        <p className="mt-1.5 max-w-2xl text-[12.5px] text-ink-muted">
          One event at a time. Every look is tied to the outfit, the
          jewelry, and the photo style for that day — so the artist reads
          the full picture, not a floating mood.
        </p>
      </header>

      <PhotoLookDiscoveryPanel category={category} />

      <EventTabStrip
        active={activeEvent}
        onChange={setActiveEvent}
        looksByEvent={looksByEvent}
      />

      {activeLook ? (
        <LookBuilder
          look={activeLook}
          eventLabel={activeEventLabel}
          canEdit={canEdit}
          wardrobeOutfits={wardrobeOutfits}
          photoStyleHint={photoStyleHint}
          onUpdate={updateItem}
          onDelete={deleteItem}
        />
      ) : (
        <EmptyLookState
          eventLabel={activeEventLabel}
          canEdit={canEdit}
          onStart={() => startLookForEvent(activeEvent)}
        />
      )}

      {looks.length >= 2 && <BeautyArcSummary looks={looks} />}

      {looks.length > 0 && <AiLooksSection category={category} looks={looks} />}
    </div>
  );
}

// ── Event tab strip ──────────────────────────────────────────────────────

function EventTabStrip({
  active,
  onChange,
  looksByEvent,
}: {
  active: WeddingEvent;
  onChange: (ev: WeddingEvent) => void;
  looksByEvent: Map<string, WorkspaceItem>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-border bg-ivory-warm/30 p-1.5">
      {WEDDING_EVENTS.map((ev) => {
        const look = looksByEvent.get(ev.label);
        const approved = Boolean(look?.meta?.approved);
        const started = Boolean(look);
        const isActive = ev.id === active;
        return (
          <button
            key={ev.id}
            type="button"
            onClick={() => onChange(ev.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] transition-colors",
              isActive
                ? "bg-ink text-ivory"
                : "bg-white text-ink-muted hover:bg-saffron-pale/30 hover:text-ink",
              ev.label === "Wedding" && !isActive && "border border-saffron/50",
            )}
          >
            {ev.label === "Wedding" && (
              <Crown
                size={11}
                strokeWidth={1.8}
                className={isActive ? "text-saffron" : "text-saffron"}
              />
            )}
            <span>{ev.label}</span>
            {approved ? (
              <Check
                size={12}
                strokeWidth={2}
                className={isActive ? "text-sage-pale" : "text-sage"}
              />
            ) : started ? (
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  isActive ? "bg-saffron" : "bg-saffron/60",
                )}
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

// ── Empty state for an event with no look ─────────────────────────────────

function EmptyLookState({
  eventLabel,
  canEdit,
  onStart,
}: {
  eventLabel: string;
  canEdit: boolean;
  onStart: () => void;
}) {
  const guidance = EVENT_GUIDANCE[eventLabel];
  return (
    <div className="rounded-lg border border-dashed border-border bg-ivory-warm/30 p-8 text-center">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {eventLabel}
      </p>
      <h3 className="mt-2 font-serif font-bold text-[18px] text-ink">
        No look yet for {eventLabel}
      </h3>
      {guidance && (
        <p className="mx-auto mt-2 max-w-xl text-[12.5px] italic text-ink-muted">
          {guidance}
        </p>
      )}
      {canEdit && (
        <button
          type="button"
          onClick={onStart}
          className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:opacity-90"
        >
          <Sparkles size={12} strokeWidth={1.8} />
          Start the {eventLabel} look
        </button>
      )}
    </div>
  );
}

// ── Look builder — the full design board for the selected event ──────────

function LookBuilder({
  look,
  eventLabel,
  canEdit,
  wardrobeOutfits,
  photoStyleHint,
  onUpdate,
  onDelete,
}: {
  look: WorkspaceItem;
  eventLabel: string;
  canEdit: boolean;
  wardrobeOutfits: Map<string, WorkspaceItem[]>;
  photoStyleHint: string;
  onUpdate: (id: string, patch: Partial<WorkspaceItem>) => void;
  onDelete: (id: string) => void;
}) {
  const meta = (look.meta ?? {}) as LookMeta;
  const approved = Boolean(meta.approved);

  const patchMeta = (patch: Partial<LookMeta>) => {
    onUpdate(look.id, { meta: { ...(look.meta ?? {}), ...patch } });
  };

  const matchingOutfits = wardrobeOutfits.get(eventLabel) ?? [];
  const isWedding = eventLabel === "Wedding";

  return (
    <article
      className={cn(
        "space-y-5 rounded-lg border bg-white p-6 shadow-[0_1px_1px_rgba(26,26,26,0.03)]",
        isWedding ? "border-saffron/40" : "border-border",
        approved && "ring-1 ring-sage/40",
      )}
    >
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 pb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {isWedding && (
              <Crown size={13} strokeWidth={1.8} className="text-saffron" />
            )}
            <Eyebrow>{eventLabel} look</Eyebrow>
          </div>
          <input
            value={look.title}
            disabled={!canEdit}
            onChange={(e) => onUpdate(look.id, { title: e.target.value })}
            placeholder={`Name this look (e.g. "Outdoor ceremony — soft gold")`}
            className="mt-1 w-full bg-transparent font-serif text-[20px] leading-tight text-ink focus:outline-none disabled:opacity-60"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => patchMeta({ approved: !approved })}
            disabled={!canEdit}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors",
              approved
                ? "border border-sage bg-sage-pale/60 text-sage"
                : "border border-border bg-white text-ink-muted hover:border-sage/50 hover:text-sage",
              !canEdit && "cursor-not-allowed opacity-60",
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <Check size={11} strokeWidth={2} />
            {approved ? "Approved" : "Mark approved"}
          </button>
          {canEdit && (
            <button
              type="button"
              onClick={() => onDelete(look.id)}
              className="text-ink-faint hover:text-rose"
              aria-label="Delete look"
            >
              <Trash2 size={13} strokeWidth={1.8} />
            </button>
          )}
        </div>
      </header>

      <EventGuidance eventLabel={eventLabel} />

      <CrossWorkspaceContext
        eventLabel={eventLabel}
        outfit={meta.outfit_ref}
        outfitSuggestions={matchingOutfits.map((o) => o.title)}
        jewelry={meta.jewelry_ref}
        photoStyle={meta.photo_style_ref || photoStyleHint}
        canEdit={canEdit}
        onPatch={patchMeta}
      />

      <FaceSection meta={meta} canEdit={canEdit} onPatch={patchMeta} />
      <EyesSection meta={meta} canEdit={canEdit} onPatch={patchMeta} />
      <LipsSection meta={meta} canEdit={canEdit} onPatch={patchMeta} />
      <HairSection meta={meta} canEdit={canEdit} onPatch={patchMeta} />

      <ReferenceImageField
        meta={meta}
        canEdit={canEdit}
        eventLabel={eventLabel}
        onPatch={patchMeta}
      />

      <NotesToArtist meta={meta} canEdit={canEdit} onPatch={patchMeta} />

      <TouchUpPrioritiesSection
        priorities={meta.touch_up_priorities}
        canEdit={canEdit}
        onChange={(touch_up_priorities) => patchMeta({ touch_up_priorities })}
      />
    </article>
  );
}

// ── Event guidance (collapsible) ──────────────────────────────────────────

function EventGuidance({ eventLabel }: { eventLabel: string }) {
  const hint = EVENT_GUIDANCE[eventLabel];
  const [open, setOpen] = useState(true);
  if (!hint) return null;
  return (
    <button
      type="button"
      onClick={() => setOpen((o) => !o)}
      className="group flex w-full items-start gap-2 rounded-md border border-saffron/20 bg-saffron-pale/20 px-3 py-2 text-left"
    >
      <Sparkles
        size={12}
        strokeWidth={1.8}
        className="mt-0.5 shrink-0 text-saffron"
      />
      <div className="flex-1">
        <div className="flex items-center gap-1.5">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.1em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            What {eventLabel} usually wants
          </span>
          <span className="text-ink-faint">
            {open ? (
              <ChevronDown size={11} strokeWidth={1.8} />
            ) : (
              <ChevronRight size={11} strokeWidth={1.8} />
            )}
          </span>
        </div>
        {open && (
          <p className="mt-1 text-[12.5px] italic leading-relaxed text-ink-muted">
            {hint}
          </p>
        )}
      </div>
    </button>
  );
}

// ── Cross-workspace context block ─────────────────────────────────────────

function CrossWorkspaceContext({
  eventLabel,
  outfit,
  outfitSuggestions,
  jewelry,
  photoStyle,
  canEdit,
  onPatch,
}: {
  eventLabel: string;
  outfit: string | undefined;
  outfitSuggestions: string[];
  jewelry: string | undefined;
  photoStyle: string | undefined;
  canEdit: boolean;
  onPatch: (patch: Partial<LookMeta>) => void;
}) {
  return (
    <section className="rounded-md border border-border bg-ivory-warm/40 p-3">
      <div className="flex items-center gap-2">
        <Eyebrow>Connected to</Eyebrow>
        <span
          className="font-mono text-[10px] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          from Wardrobe · Jewelry · Photography
        </span>
      </div>
      <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
        <ContextField
          icon={<Shirt size={11} strokeWidth={1.8} />}
          label="Outfit"
          value={outfit ?? ""}
          suggestions={outfitSuggestions}
          placeholder={
            outfitSuggestions[0] ?? `Lehenga / sharara for ${eventLabel}`
          }
          canEdit={canEdit}
          onChange={(v) => onPatch({ outfit_ref: v })}
        />
        <ContextField
          icon={<Gem size={11} strokeWidth={1.8} />}
          label="Jewelry"
          value={jewelry ?? ""}
          suggestions={[]}
          placeholder="Polki choker + maang tikka"
          canEdit={canEdit}
          onChange={(v) => onPatch({ jewelry_ref: v })}
        />
        <ContextField
          icon={<Camera size={11} strokeWidth={1.8} />}
          label="Photo style"
          value={photoStyle ?? ""}
          suggestions={[]}
          placeholder="Warm, editorial, golden hour"
          canEdit={canEdit}
          onChange={(v) => onPatch({ photo_style_ref: v })}
        />
      </div>
    </section>
  );
}

function ContextField({
  icon,
  label,
  value,
  suggestions,
  placeholder,
  canEdit,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  suggestions: string[];
  placeholder: string;
  canEdit: boolean;
  onChange: (v: string) => void;
}) {
  const listId = `hmua-ctx-${label}-${suggestions.length}`;
  return (
    <div className="rounded-sm border border-border bg-white px-2.5 py-2">
      <div className="flex items-center gap-1.5 text-ink-muted">
        {icon}
        <span
          className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {label}
        </span>
      </div>
      <input
        value={value}
        disabled={!canEdit}
        list={listId}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full bg-transparent text-[12.5px] text-ink placeholder:text-ink-faint focus:outline-none disabled:opacity-60"
      />
      {suggestions.length > 0 && (
        <datalist id={listId}>
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      )}
    </div>
  );
}

// ── Face / Eyes / Lips / Hair sections ────────────────────────────────────

function FaceSection({
  meta,
  canEdit,
  onPatch,
}: {
  meta: LookMeta;
  canEdit: boolean;
  onPatch: (patch: Partial<LookMeta>) => void;
}) {
  return (
    <section>
      <SectionTitle>Face</SectionTitle>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <FieldRow
          label="Foundation shade"
          value={meta.foundation ?? ""}
          placeholder="CT Beautiful Skin, shade 7 Warm"
          canEdit={canEdit}
          onChange={(v) => onPatch({ foundation: v })}
        />
        <FieldRow
          label="Skin finish"
          value={meta.skin_finish ?? ""}
          placeholder="Dewy with matte T-zone"
          canEdit={canEdit}
          onChange={(v) => onPatch({ skin_finish: v })}
        />
        <FieldRow
          label="Contour"
          value={meta.contour ?? ""}
          placeholder="Light, cheekbones only"
          canEdit={canEdit}
          onChange={(v) => onPatch({ contour: v })}
        />
        <FieldRow
          label="Blush"
          value={meta.blush ?? ""}
          placeholder="Soft peach, apple of cheeks"
          canEdit={canEdit}
          onChange={(v) => onPatch({ blush: v })}
        />
        <FieldRow
          label="Highlight"
          value={meta.highlight ?? ""}
          placeholder="Inner corners + cupid's bow"
          canEdit={canEdit}
          onChange={(v) => onPatch({ highlight: v })}
        />
        <FieldRow
          label="Bindi / tikka placement"
          value={meta.bindi_tikka ?? ""}
          placeholder="Centered, heirloom gold"
          canEdit={canEdit}
          onChange={(v) => onPatch({ bindi_tikka: v })}
        />
      </div>
    </section>
  );
}

function EyesSection({
  meta,
  canEdit,
  onPatch,
}: {
  meta: LookMeta;
  canEdit: boolean;
  onPatch: (patch: Partial<LookMeta>) => void;
}) {
  return (
    <section>
      <SectionTitle>Eyes</SectionTitle>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <FieldRow
          label="Look"
          value={meta.eye_look ?? ""}
          placeholder="Soft gold shimmer, blended crease"
          canEdit={canEdit}
          onChange={(v) => onPatch({ eye_look: v })}
        />
        <FieldRow
          label="Liner"
          value={meta.eye_liner ?? ""}
          placeholder="Thin wing, espresso gel"
          canEdit={canEdit}
          onChange={(v) => onPatch({ eye_liner: v })}
        />
        <FieldRow
          label="Lashes"
          value={meta.eye_lashes ?? ""}
          placeholder="None / Ardell Demi Wispies"
          canEdit={canEdit}
          onChange={(v) => onPatch({ eye_lashes: v })}
        />
        <FieldRow
          label="Brows"
          value={meta.eye_brows ?? ""}
          placeholder="Natural shape, filled + set"
          canEdit={canEdit}
          onChange={(v) => onPatch({ eye_brows: v })}
        />
      </div>
    </section>
  );
}

function LipsSection({
  meta,
  canEdit,
  onPatch,
}: {
  meta: LookMeta;
  canEdit: boolean;
  onPatch: (patch: Partial<LookMeta>) => void;
}) {
  return (
    <section>
      <SectionTitle>Lips</SectionTitle>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <FieldRow
          label="Colour"
          value={meta.lip_color ?? ""}
          placeholder="Warm brick / terracotta"
          canEdit={canEdit}
          onChange={(v) => onPatch({ lip_color: v })}
        />
        <FieldRow
          label="Liner"
          value={meta.lip_liner ?? ""}
          placeholder="MAC Spice"
          canEdit={canEdit}
          onChange={(v) => onPatch({ lip_liner: v })}
        />
        <FieldRow
          label="Product"
          value={meta.lip_product ?? ""}
          placeholder="CT Supermodel"
          canEdit={canEdit}
          onChange={(v) => onPatch({ lip_product: v })}
        />
        <FieldRow
          label="Finish"
          value={meta.lip_finish ?? ""}
          placeholder="Satin / matte / gloss"
          canEdit={canEdit}
          onChange={(v) => onPatch({ lip_finish: v })}
        />
      </div>
    </section>
  );
}

function HairSection({
  meta,
  canEdit,
  onPatch,
}: {
  meta: LookMeta;
  canEdit: boolean;
  onPatch: (patch: Partial<LookMeta>) => void;
}) {
  return (
    <section>
      <SectionTitle>Hair</SectionTitle>
      <div className="space-y-2">
        <FieldRow
          label="Style"
          value={meta.hair_style ?? ""}
          placeholder="Low bun with loose face-framing pieces"
          canEdit={canEdit}
          onChange={(v) => onPatch({ hair_style: v })}
        />
        <FieldRow
          label="Accessories"
          value={meta.hair_accessories ?? ""}
          placeholder="Jasmine gajra, heirloom maang tikka, hidden gold pins"
          canEdit={canEdit}
          onChange={(v) => onPatch({ hair_accessories: v })}
        />
        <FieldRow
          label="Dupatta / veil draping"
          value={meta.dupatta_drape ?? ""}
          placeholder="Over head, pinned at crown, draped over left shoulder"
          canEdit={canEdit}
          onChange={(v) => onPatch({ dupatta_drape: v })}
        />
      </div>
    </section>
  );
}

function NotesToArtist({
  meta,
  canEdit,
  onPatch,
}: {
  meta: LookMeta;
  canEdit: boolean;
  onPatch: (patch: Partial<LookMeta>) => void;
}) {
  return (
    <section>
      <SectionTitle>Notes to artist</SectionTitle>
      <textarea
        value={meta.notes_to_artist ?? meta.coordination_notes ?? ""}
        disabled={!canEdit}
        onChange={(e) => onPatch({ notes_to_artist: e.target.value })}
        rows={3}
        placeholder="No heavy contour. Long-wear formula — outdoor ceremony expected to run 2+ hours. Waterproof mascara (she will cry during the pheras). Dupatta will be adjusted by mom during ceremony — pin securely but allow repositioning."
        className="w-full resize-none rounded-md border border-border bg-white px-2.5 py-2 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
      />
    </section>
  );
}

function ReferenceImageField({
  meta,
  canEdit,
  eventLabel,
  onPatch,
}: {
  meta: LookMeta;
  canEdit: boolean;
  eventLabel: string;
  onPatch: (patch: Partial<LookMeta>) => void;
}) {
  return (
    <section>
      <SectionTitle>Reference image</SectionTitle>
      {meta.reference_image_url ? (
        <figure className="overflow-hidden rounded-md border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={meta.reference_image_url}
            alt={`${eventLabel} reference`}
            className="h-56 w-full object-cover"
          />
        </figure>
      ) : (
        <div className="rounded-md border border-dashed border-border bg-ivory-warm/30 px-3 py-6 text-center text-[11.5px] italic text-ink-faint">
          Paste a reference image URL below — becomes the artist's printed
          day-of guide.
        </div>
      )}
      {canEdit && (
        <input
          value={meta.reference_image_url ?? ""}
          onChange={(e) => onPatch({ reference_image_url: e.target.value })}
          placeholder="https://…"
          className="mt-2 w-full rounded-sm border border-border bg-white px-2 py-1 text-[11.5px] text-ink-muted focus:border-saffron focus:outline-none"
        />
      )}
    </section>
  );
}

// ── Touch-up priorities ──────────────────────────────────────────────────

function TouchUpPrioritiesSection({
  priorities,
  canEdit,
  onChange,
}: {
  priorities: TouchUpPriority[] | undefined;
  canEdit: boolean;
  onChange: (next: TouchUpPriority[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const list: TouchUpPriority[] = priorities ?? [];

  const seed = () => {
    if (!canEdit || list.length > 0) return;
    onChange(
      DEFAULT_TOUCH_UP_PRIORITIES.map((label, i) => ({
        id: `tup-${Date.now().toString(36)}-${i}`,
        label,
        done: false,
      })),
    );
  };

  const toggle = (id: string) =>
    onChange(list.map((p) => (p.id === id ? { ...p, done: !p.done } : p)));

  const remove = (id: string) => onChange(list.filter((p) => p.id !== id));

  const add = () => {
    const label = draft.trim();
    if (!label) return;
    onChange([
      ...list,
      {
        id: `tup-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
        label,
        done: false,
      },
    ]);
    setDraft("");
  };

  return (
    <section>
      <div className="flex items-center justify-between">
        <SectionTitle>Touch-up priorities</SectionTitle>
        {canEdit && list.length === 0 && (
          <button
            type="button"
            onClick={seed}
            className="font-mono text-[10px] uppercase tracking-[0.08em] text-saffron hover:underline"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Use defaults
          </button>
        )}
      </div>
      <p className="mt-0.5 text-[11px] italic text-ink-faint">
        What the touch-up artist runs between this event and the next.
      </p>

      {list.length === 0 ? (
        <EmptyRow>No priorities yet — tap "Use defaults" or add your own.</EmptyRow>
      ) : (
        <ul className="mt-2 space-y-1">
          {list.map((p) => (
            <li key={p.id} className="group flex items-center gap-2">
              <input
                type="checkbox"
                checked={p.done}
                disabled={!canEdit}
                onChange={() => toggle(p.id)}
                className="h-3.5 w-3.5 rounded-sm border-border text-saffron focus:ring-saffron disabled:opacity-60"
              />
              <span
                className={cn(
                  "flex-1 text-[12.5px]",
                  p.done ? "text-ink-faint line-through" : "text-ink",
                )}
              >
                {p.label}
              </span>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  className="text-ink-faint opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
                  aria-label="Remove priority"
                >
                  <Trash2 size={11} strokeWidth={1.8} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {canEdit && (
        <div className="mt-1.5 flex gap-1.5">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
            placeholder="Add a touch-up priority…"
            className="flex-1 rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
          />
          <button
            type="button"
            onClick={add}
            disabled={!draft.trim()}
            className={cn(
              "rounded-sm px-2 py-1 text-[11px] font-medium",
              draft.trim()
                ? "bg-ink text-ivory hover:opacity-90"
                : "bg-ivory-warm text-ink-faint",
            )}
          >
            Add
          </button>
        </div>
      )}
    </section>
  );
}

// ── Beauty Arc summary ───────────────────────────────────────────────────

function BeautyArcSummary({ looks }: { looks: WorkspaceItem[] }) {
  const updateItem = useWorkspaceStore((s) => s.updateItem);
  const currentRole = useWorkspaceStore((s) => s.currentRole);
  const canEdit = currentRole !== "vendor";

  const ordered = [...looks].sort((a, b) => {
    const ai = WEDDING_EVENTS.findIndex(
      (e) => e.label === ((a.meta?.event as string) ?? ""),
    );
    const bi = WEDDING_EVENTS.findIndex(
      (e) => e.label === ((b.meta?.event as string) ?? ""),
    );
    if (ai === bi) return a.sort_order - b.sort_order;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  return (
    <section className="rounded-lg border border-border bg-ivory-warm/30 p-4">
      <Eyebrow>Your beauty arc</Eyebrow>
      <p className="mt-0.5 text-[11.5px] italic text-ink-faint">
        A story across the celebration — each event should feel
        intentionally different.
      </p>

      <div className="mt-3 flex flex-wrap items-stretch gap-2 overflow-x-auto pb-1">
        {ordered.map((look, idx) => {
          const meta = (look.meta ?? {}) as LookMeta;
          const eventLabel = meta.event ?? "Unscheduled";
          const mood =
            meta.arc_mood ?? (meta.event ? EVENT_MOOD_HINT[meta.event] : "") ?? "";
          return (
            <div key={look.id} className="flex items-stretch gap-2">
              <div className="flex w-[140px] flex-shrink-0 flex-col rounded-md border border-border bg-white p-2">
                <span
                  className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {eventLabel}
                </span>
                {meta.reference_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={meta.reference_image_url}
                    alt={`${eventLabel} reference`}
                    className="mt-1 h-20 w-full rounded-sm object-cover"
                  />
                ) : (
                  <div className="mt-1 flex h-20 w-full items-center justify-center rounded-sm bg-ivory-warm text-[10px] italic text-ink-faint">
                    No ref image
                  </div>
                )}
                <input
                  value={mood}
                  disabled={!canEdit}
                  onChange={(e) =>
                    updateItem(look.id, {
                      meta: { ...(look.meta ?? {}), arc_mood: e.target.value },
                    })
                  }
                  placeholder="Fresh & dewy"
                  className="mt-1 w-full bg-transparent text-center text-[11px] italic text-ink placeholder:text-ink-faint focus:outline-none disabled:opacity-60"
                />
              </div>
              {idx < ordered.length - 1 && (
                <div className="flex items-center text-ink-faint">→</div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── AI composer section (preserved) ──────────────────────────────────────

function AiLooksSection({
  category,
  looks,
}: {
  category: WorkspaceCategory;
  looks: WorkspaceItem[];
}) {
  const aiMap = useHmuaStore((s) => s.ai);
  const brief = useMemo(
    () => aiMap[category.id]?.beautyBrief ?? null,
    [aiMap, category.id],
  );
  const liked = useMemo(
    () => aiMap[category.id]?.likedCards ?? {},
    [aiMap, category.id],
  );

  const pairs = looks
    .map((l) => {
      const meta = (l.meta ?? {}) as LookMeta;
      const event = eventIdFromLabel(meta.event);
      if (!event) return null;
      return { look: l, meta, event };
    })
    .filter((p): p is { look: WorkspaceItem; meta: LookMeta; event: NonNullable<ReturnType<typeof eventIdFromLabel>> } => p !== null);

  if (pairs.length === 0) return null;

  return (
    <section className="space-y-3">
      <header>
        <p
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          AI composer
        </p>
        <h3 className="mt-1 font-serif font-bold text-[18px] leading-tight text-ink">
          Compose looks + pick accessories
        </h3>
        <p className="mt-1 max-w-2xl text-[12.5px] text-ink-muted">
          For each event above, the AI pulls your brief + outfit + hair
          style into a fully-built artist brief. The accessory picks are
          specific to the hair style you've chosen for that event.
        </p>
      </header>

      {pairs.map(({ look, meta, event }) => {
        const eventLabel =
          WEDDING_EVENTS.find((e) => e.id === event)?.label ?? (meta.event ?? event);
        const durationByEvent: Record<string, number> = {
          haldi: 3,
          mehendi: 4,
          sangeet: 6,
          wedding: 6,
          reception: 5,
        };
        const jewelrySelected = meta.jewelry_ref
          ? meta.jewelry_ref.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined;
        return (
          <div key={look.id} className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <EventLookComposer
              category={category}
              event={event}
              eventLabel={eventLabel}
              outfit={meta.outfit_ref}
              eventDurationHours={durationByEvent[event]}
              likedStyles={{
                hair: liked.hair ?? [],
                makeup: liked.makeup ?? [],
                accessories: liked.accessories ?? [],
              }}
            />
            <AccessoryRecommender
              category={category}
              event={event}
              eventLabel={eventLabel}
              hairStyle={meta.hair_style}
              outfit={meta.outfit_ref}
              jewelrySelected={jewelrySelected}
              brideVibe={brief?.headline ?? brief?.overall_vibe}
            />
          </div>
        );
      })}
    </section>
  );
}

// ── Primitives ───────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mb-2 font-serif text-[15px] leading-tight text-ink">
      {children}
    </h4>
  );
}

function FieldRow({
  label,
  value,
  placeholder,
  canEdit,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  canEdit: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col">
      <span
        className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </span>
      <input
        value={value}
        disabled={!canEdit}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-0.5 w-full rounded-sm border border-border bg-white px-2 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
      />
    </label>
  );
}
