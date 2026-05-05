"use client";

// ── BlockEditors ────────────────────────────────────────────────────────────
// One editor component per block type. Each consumes a typed block from the
// store and emits patches via onPatch. Kept dense — these are the working
// surfaces of the block builder, not the published render.

import { Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useShareShaadiStore } from "@/stores/share-shaadi-store";
import { Badge } from "@/components/share/Badge";
import { EventTagPill } from "@/components/share/EventTagPill";
import {
  EditorialInput,
  EditorialLabel,
  EditorialTextarea,
} from "@/components/share/EditorialInput";
import {
  BUDGET_RANGE_LABEL,
  EVENT_TAG_LABEL,
  VENDOR_CATEGORY_LABEL,
  type BudgetRange,
  type EventTag,
  type FamilyBlock,
  type FamilySide,
  type FreeWriteBlock,
  type MomentBlock,
  type NarrativeBlock,
  type NumbersBlock,
  type OutfitBlock,
  type PhotoGalleryBlock,
  type PlaylistBlock,
  type StoryBlock,
  type VendorCategory,
  type VendorShoutoutBlock,
  type AdviceBlock,
} from "@/types/share-shaadi";

type EditorProps<T extends StoryBlock> = {
  block: T;
  onPatch: (patch: Partial<T>) => void;
};

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

// ── Photo Gallery ───────────────────────────────────────────────────────────

export function PhotoGalleryEditor({
  block,
  onPatch,
}: EditorProps<PhotoGalleryBlock>) {
  return (
    <div className="space-y-5">
      <div>
        <EditorialLabel>Which event are these from?</EditorialLabel>
        <div className="mt-2 flex flex-wrap gap-2">
          {ALL_EVENTS.map((e) => (
            <EventTagPill
              key={e}
              event={e}
              size="sm"
              active={block.eventTag === e}
              onClick={() => onPatch({ eventTag: block.eventTag === e ? null : e })}
            />
          ))}
        </div>
      </div>
      <div>
        <EditorialLabel hint="3 to 8 photos.">Photos</EditorialLabel>
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {block.photos.map((p, i) => (
            <div key={i} className="relative">
              <PhotoTile
                url={p.url}
                onRemove={() =>
                  onPatch({
                    photos: block.photos.filter((_, idx) => idx !== i),
                  })
                }
              />
              <input
                type="text"
                placeholder="caption"
                value={p.caption ?? ""}
                onChange={(e) => {
                  const next = block.photos.slice();
                  next[i] = { ...p, caption: e.target.value };
                  onPatch({ photos: next });
                }}
                className="mt-1.5 w-full border-b border-warm-border bg-transparent pb-1 text-[12px] italic text-ink outline-none placeholder:text-ink-faint focus:border-gold"
                style={{ fontFamily: "var(--font-display)" }}
              />
            </div>
          ))}
          {block.photos.length < 8 && (
            <PhotoUploadTile
              onAdd={(url) =>
                onPatch({ photos: [...block.photos, { url }] })
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

function PhotoTile({
  url,
  onRemove,
}: {
  url: string;
  onRemove?: () => void;
}) {
  return (
    <div className="group relative aspect-[4/5] overflow-hidden rounded-lg border border-gold/25">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-1.5 top-1.5 hidden h-6 w-6 items-center justify-center rounded-full bg-ink/80 text-ivory transition-colors hover:bg-ink group-hover:flex"
          aria-label="Remove photo"
        >
          <X size={12} strokeWidth={2.4} />
        </button>
      )}
    </div>
  );
}

function PhotoUploadTile({ onAdd }: { onAdd: (url: string) => void }) {
  // Touching the upload session getter ensures the per-browser session UUID
  // is materialized the first time a couple drops a photo. The actual upload
  // pipeline (Supabase Storage write under `share/{uploadSessionId}/...`)
  // hooks in here once the API is wired — for now we keep the local-preview
  // behavior so the gallery feels real during the rest of the flow.
  const getUploadSessionId = useShareShaadiStore((s) => s.getUploadSessionId);
  return (
    <label
      className={cn(
        "flex aspect-[4/5] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-gold/40 bg-ivory-warm/40 text-ink-muted transition-colors hover:border-gold hover:bg-ivory-warm",
      )}
    >
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          // Reserve the upload session id so future uploads under this
          // browser tab share a stable namespace. Read but unused locally.
          void getUploadSessionId();
          const url = URL.createObjectURL(file);
          onAdd(url);
        }}
      />
      <Plus size={18} strokeWidth={1.6} />
      <span
        className="text-[10px] uppercase tracking-[0.22em]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Add photo
      </span>
    </label>
  );
}

// ── The Moment ──────────────────────────────────────────────────────────────

export function MomentEditor({ block, onPatch }: EditorProps<MomentBlock>) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-[200px_1fr]">
      <div>
        <EditorialLabel>Hero photo</EditorialLabel>
        {block.photoUrl ? (
          <PhotoTile url={block.photoUrl} onRemove={() => onPatch({ photoUrl: undefined })} />
        ) : (
          <PhotoUploadTile onAdd={(url) => onPatch({ photoUrl: url })} />
        )}
      </div>
      <div>
        <EditorialLabel>Event</EditorialLabel>
        <div className="mt-2 flex flex-wrap gap-2">
          {ALL_EVENTS.map((e) => (
            <EventTagPill
              key={e}
              event={e}
              size="sm"
              active={block.eventTag === e}
              onClick={() => onPatch({ eventTag: block.eventTag === e ? null : e })}
            />
          ))}
        </div>
        <div className="mt-5">
          <EditorialLabel hint="what were you feeling? what were people doing?">
            The moment
          </EditorialLabel>
          <EditorialTextarea
            rows={5}
            placeholder="Describe this moment. Don't write for an audience — write like you're texting a friend."
            value={block.body}
            onChange={(e) => onPatch({ body: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

// ── Vendor Shoutout ─────────────────────────────────────────────────────────

export function VendorShoutoutEditor({
  block,
  onPatch,
}: EditorProps<VendorShoutoutBlock>) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <EditorialLabel>Vendor name</EditorialLabel>
          <EditorialInput
            placeholder="Studio Marigold"
            value={block.vendorName}
            onChange={(e) => onPatch({ vendorName: e.target.value })}
          />
        </div>
        <div>
          <EditorialLabel>Category</EditorialLabel>
          <SelectInput
            value={block.category}
            onChange={(v) => onPatch({ category: v as VendorCategory })}
            options={Object.entries(VENDOR_CATEGORY_LABEL).map(
              ([value, label]) => ({ value, label }),
            )}
          />
        </div>
      </div>
      <div>
        <EditorialLabel>Why were they special?</EditorialLabel>
        <EditorialTextarea
          rows={4}
          placeholder="The thing they did that you keep telling everyone about."
          value={block.body}
          onChange={(e) => onPatch({ body: e.target.value })}
        />
      </div>
    </div>
  );
}

// ── Advice ─────────────────────────────────────────────────────────────────

export function AdviceEditor({ block, onPatch }: EditorProps<AdviceBlock>) {
  return (
    <div>
      <EditorialLabel hint="if a friend just got engaged, what's the first thing you'd say?">
        Your one piece of advice
      </EditorialLabel>
      <EditorialTextarea
        rows={4}
        placeholder="Don't budget for the wedding. Budget for the chaos around the wedding."
        value={block.body}
        onChange={(e) => onPatch({ body: e.target.value })}
      />
    </div>
  );
}

// ── Numbers ────────────────────────────────────────────────────────────────

export function NumbersEditor({ block, onPatch }: EditorProps<NumbersBlock>) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <div>
        <EditorialLabel>Budget range</EditorialLabel>
        <SelectInput
          value={block.budgetRange ?? ""}
          onChange={(v) =>
            onPatch({ budgetRange: (v || null) as BudgetRange | null })
          }
          options={[
            { value: "", label: "Skip" },
            ...Object.entries(BUDGET_RANGE_LABEL).map(([value, label]) => ({
              value,
              label,
            })),
          ]}
        />
      </div>
      <div>
        <EditorialLabel>Months of planning</EditorialLabel>
        <EditorialInput
          type="number"
          min={0}
          placeholder="14"
          value={block.planningMonths ?? ""}
          onChange={(e) =>
            onPatch({
              planningMonths: e.target.value ? Number(e.target.value) : null,
            })
          }
        />
      </div>
      <div>
        <EditorialLabel>Outfit changes</EditorialLabel>
        <EditorialInput
          type="number"
          min={0}
          placeholder="6"
          value={block.outfitChanges ?? ""}
          onChange={(e) =>
            onPatch({
              outfitChanges: e.target.value ? Number(e.target.value) : null,
            })
          }
        />
      </div>
      <div>
        <EditorialLabel>Vendors hired</EditorialLabel>
        <EditorialInput
          type="number"
          min={0}
          placeholder="22"
          value={block.vendorCount ?? ""}
          onChange={(e) =>
            onPatch({
              vendorCount: e.target.value ? Number(e.target.value) : null,
            })
          }
        />
      </div>
    </div>
  );
}

// ── Family ─────────────────────────────────────────────────────────────────

export function FamilyEditor({ block, onPatch }: EditorProps<FamilyBlock>) {
  const SIDES: { id: FamilySide; label: string }[] = [
    { id: "bride", label: "Bride's side" },
    { id: "groom", label: "Groom's side" },
    { id: "both", label: "Both" },
  ];
  return (
    <div className="space-y-5">
      <div>
        <EditorialLabel>Whose family?</EditorialLabel>
        <div className="mt-2 flex flex-wrap gap-2">
          {SIDES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onPatch({ side: s.id })}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-colors",
                block.side === s.id
                  ? "border-ink bg-ink text-ivory"
                  : "border-border bg-white text-ink-muted hover:border-gold/40 hover:text-ink",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <EditorialLabel hint="what traditions mattered? did you blend cultures or customs?">
          How were your families involved?
        </EditorialLabel>
        <EditorialTextarea
          rows={5}
          placeholder="My nani performed the gauri puja in a saree she hadn't worn in 40 years…"
          value={block.body}
          onChange={(e) => onPatch({ body: e.target.value })}
        />
      </div>
    </div>
  );
}

// ── Playlist ───────────────────────────────────────────────────────────────

export function PlaylistEditor({ block, onPatch }: EditorProps<PlaylistBlock>) {
  return (
    <div className="space-y-3">
      <EditorialLabel hint="up to 10 songs.">What was playing?</EditorialLabel>
      <div className="space-y-2">
        {block.songs.map((s, i) => (
          <div
            key={i}
            className="grid grid-cols-1 items-end gap-2 md:grid-cols-[1fr_1fr_1fr_auto]"
          >
            <EditorialInput
              placeholder="Song"
              value={s.title}
              onChange={(e) => {
                const next = block.songs.slice();
                next[i] = { ...s, title: e.target.value };
                onPatch({ songs: next });
              }}
            />
            <EditorialInput
              placeholder="Artist"
              value={s.artist}
              onChange={(e) => {
                const next = block.songs.slice();
                next[i] = { ...s, artist: e.target.value };
                onPatch({ songs: next });
              }}
            />
            <EditorialInput
              placeholder="Moment (e.g. baraat entry)"
              value={s.moment ?? ""}
              onChange={(e) => {
                const next = block.songs.slice();
                next[i] = { ...s, moment: e.target.value };
                onPatch({ songs: next });
              }}
            />
            <button
              type="button"
              onClick={() =>
                onPatch({ songs: block.songs.filter((_, idx) => idx !== i) })
              }
              className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:bg-rose-pale/40 hover:text-rose"
              aria-label="Remove song"
            >
              <Trash2 size={14} strokeWidth={1.8} />
            </button>
          </div>
        ))}
      </div>
      {block.songs.length < 10 && (
        <button
          type="button"
          onClick={() =>
            onPatch({
              songs: [...block.songs, { title: "", artist: "", moment: "" }],
            })
          }
          className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-gold/40 bg-ivory-warm/40 px-3.5 py-1.5 text-[12px] font-medium text-ink-muted hover:border-gold hover:text-ink"
        >
          <Plus size={13} strokeWidth={1.8} />
          Add song
        </button>
      )}
    </div>
  );
}

// ── Outfit ─────────────────────────────────────────────────────────────────

export function OutfitEditor({ block, onPatch }: EditorProps<OutfitBlock>) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-[200px_1fr]">
      <div>
        <EditorialLabel>Photo</EditorialLabel>
        {block.photoUrl ? (
          <PhotoTile url={block.photoUrl} onRemove={() => onPatch({ photoUrl: undefined })} />
        ) : (
          <PhotoUploadTile onAdd={(url) => onPatch({ photoUrl: url })} />
        )}
      </div>
      <div className="space-y-5">
        <div>
          <EditorialLabel>Event</EditorialLabel>
          <div className="mt-2 flex flex-wrap gap-2">
            {ALL_EVENTS.map((e) => (
              <EventTagPill
                key={e}
                event={e}
                size="sm"
                active={block.eventTag === e}
                onClick={() => onPatch({ eventTag: block.eventTag === e ? null : e })}
              />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <EditorialLabel>Designer / brand</EditorialLabel>
            <EditorialInput
              placeholder="Sabyasachi"
              value={block.designer}
              onChange={(e) => onPatch({ designer: e.target.value })}
            />
          </div>
          <div>
            <EditorialLabel>What was it?</EditorialLabel>
            <EditorialInput
              placeholder="Burgundy organza saree, hand-embroidered"
              value={block.description}
              onChange={(e) => onPatch({ description: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Free Write ─────────────────────────────────────────────────────────────

export function FreeWriteEditor({ block, onPatch }: EditorProps<FreeWriteBlock>) {
  return (
    <div>
      <EditorialLabel hint="this is your space — no rules.">Write</EditorialLabel>
      <EditorialTextarea
        rows={8}
        placeholder="Write as much or as little as you want."
        value={block.body}
        onChange={(e) => onPatch({ body: e.target.value })}
      />
    </div>
  );
}

// ── Narrative (AI-generated paragraphs, editable) ──────────────────────────

export function NarrativeEditor({
  block,
  onPatch,
}: EditorProps<NarrativeBlock>) {
  return (
    <div className="space-y-5">
      <div>
        <EditorialLabel>Event</EditorialLabel>
        <div className="mt-2 flex flex-wrap gap-2">
          {ALL_EVENTS.map((e) => (
            <EventTagPill
              key={e}
              event={e}
              size="sm"
              active={block.eventTag === e}
              onClick={() => onPatch({ eventTag: block.eventTag === e ? null : e })}
            />
          ))}
        </div>
      </div>
      <div>
        <EditorialLabel>Editorial paragraph</EditorialLabel>
        <EditorialTextarea
          rows={6}
          value={block.body}
          onChange={(e) => onPatch({ body: e.target.value })}
        />
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border-b border-warm-border bg-transparent pb-1.5 pt-2 text-[15px] text-ink outline-none transition-colors focus:border-gold"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

// ── Block-type → editor router ─────────────────────────────────────────────

export function BlockEditor({
  block,
  onPatch,
}: {
  block: StoryBlock;
  onPatch: (patch: Partial<StoryBlock>) => void;
}) {
  switch (block.type) {
    case "photo_gallery":
      return (
        <PhotoGalleryEditor
          block={block}
          onPatch={onPatch as (p: Partial<PhotoGalleryBlock>) => void}
        />
      );
    case "moment":
      return (
        <MomentEditor block={block} onPatch={onPatch as (p: Partial<MomentBlock>) => void} />
      );
    case "vendor_shoutout":
      return (
        <VendorShoutoutEditor
          block={block}
          onPatch={onPatch as (p: Partial<VendorShoutoutBlock>) => void}
        />
      );
    case "advice":
      return (
        <AdviceEditor block={block} onPatch={onPatch as (p: Partial<AdviceBlock>) => void} />
      );
    case "numbers":
      return (
        <NumbersEditor block={block} onPatch={onPatch as (p: Partial<NumbersBlock>) => void} />
      );
    case "family":
      return (
        <FamilyEditor block={block} onPatch={onPatch as (p: Partial<FamilyBlock>) => void} />
      );
    case "playlist":
      return (
        <PlaylistEditor
          block={block}
          onPatch={onPatch as (p: Partial<PlaylistBlock>) => void}
        />
      );
    case "outfit":
      return (
        <OutfitEditor block={block} onPatch={onPatch as (p: Partial<OutfitBlock>) => void} />
      );
    case "freewrite":
      return (
        <FreeWriteEditor
          block={block}
          onPatch={onPatch as (p: Partial<FreeWriteBlock>) => void}
        />
      );
    case "narrative":
      return (
        <NarrativeEditor
          block={block}
          onPatch={onPatch as (p: Partial<NarrativeBlock>) => void}
        />
      );
  }
}

// ── Block summary chip used in the collapsed view ──────────────────────────

export function blockSummary(block: StoryBlock): string {
  switch (block.type) {
    case "photo_gallery":
      return `${block.photos.length} photo${block.photos.length === 1 ? "" : "s"}${
        block.eventTag ? ` · ${EVENT_TAG_LABEL[block.eventTag]}` : ""
      }`;
    case "moment":
      return block.body
        ? truncate(block.body, 90)
        : "An untitled moment, waiting.";
    case "vendor_shoutout":
      return block.vendorName
        ? `${block.vendorName} · ${VENDOR_CATEGORY_LABEL[block.category]}`
        : "Tag a vendor that mattered.";
    case "advice":
      return block.body ? truncate(block.body, 90) : "Your one piece of advice.";
    case "numbers": {
      const parts: string[] = [];
      if (block.budgetRange) parts.push(BUDGET_RANGE_LABEL[block.budgetRange]);
      if (block.planningMonths) parts.push(`${block.planningMonths} months`);
      if (block.outfitChanges) parts.push(`${block.outfitChanges} outfits`);
      if (block.vendorCount) parts.push(`${block.vendorCount} vendors`);
      return parts.length ? parts.join(" · ") : "Tap to fill in your numbers.";
    }
    case "family":
      return block.body ? truncate(block.body, 90) : "How your families showed up.";
    case "playlist":
      return `${block.songs.length} song${block.songs.length === 1 ? "" : "s"}`;
    case "outfit":
      return block.designer
        ? `${block.designer}${
            block.eventTag ? ` · ${EVENT_TAG_LABEL[block.eventTag]}` : ""
          }`
        : "Your look for the day.";
    case "freewrite":
      return block.body ? truncate(block.body, 90) : "Open canvas.";
    case "narrative":
      return block.body
        ? truncate(block.body, 90)
        : "An editorial paragraph.";
  }
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s;
}

// Block-type meta surfaced into the picker UI on the side of the builder.

export function blockTypeBadgeTone(type: StoryBlock["type"]):
  | "wine"
  | "rose"
  | "gold"
  | "saffron"
  | "sage"
  | "ink" {
  switch (type) {
    case "photo_gallery":
      return "rose";
    case "moment":
      return "wine";
    case "vendor_shoutout":
      return "gold";
    case "advice":
      return "saffron";
    case "numbers":
      return "ink";
    case "family":
      return "sage";
    case "playlist":
      return "rose";
    case "outfit":
      return "gold";
    case "freewrite":
      return "ink";
    case "narrative":
      return "wine";
  }
}

export function blockTypeLabel(type: StoryBlock["type"]): string {
  switch (type) {
    case "photo_gallery":
      return "PHOTO GALLERY";
    case "moment":
      return "THE MOMENT";
    case "vendor_shoutout":
      return "VENDOR SHOUTOUT";
    case "advice":
      return "WHAT WE'D TELL YOU";
    case "numbers":
      return "THE NUMBERS";
    case "family":
      return "FAMILY";
    case "playlist":
      return "PLAYLIST";
    case "outfit":
      return "THE OUTFIT";
    case "freewrite":
      return "FREE WRITE";
    case "narrative":
      return "NARRATIVE";
  }
}

// Tiny block-type icon for the picker rail.
export function BlockTypeIcon({ type }: { type: StoryBlock["type"] }) {
  const className = "h-4 w-4 text-current";
  switch (type) {
    case "photo_gallery":
      return (
        <svg viewBox="0 0 16 16" className={className}>
          <rect x="2" y="3" width="12" height="9" rx="1" stroke="currentColor" fill="none" />
          <circle cx="6" cy="7" r="1.2" fill="currentColor" />
          <path d="M3 11l3-3 3 2 4-3" stroke="currentColor" fill="none" strokeWidth="1" />
        </svg>
      );
    case "moment":
      return (
        <svg viewBox="0 0 16 16" className={className}>
          <rect x="2" y="3" width="6" height="10" rx="1" stroke="currentColor" fill="none" />
          <line x1="9" y1="5" x2="14" y2="5" stroke="currentColor" />
          <line x1="9" y1="8" x2="14" y2="8" stroke="currentColor" />
          <line x1="9" y1="11" x2="13" y2="11" stroke="currentColor" />
        </svg>
      );
    case "vendor_shoutout":
      return (
        <svg viewBox="0 0 16 16" className={className}>
          <path d="M3 6h10l-1 7H4L3 6z" stroke="currentColor" fill="none" />
          <path d="M6 6V4a2 2 0 014 0v2" stroke="currentColor" fill="none" />
        </svg>
      );
    case "advice":
      return (
        <svg viewBox="0 0 16 16" className={className}>
          <path
            d="M4 4h2v3l-1 2H4l1-2V4zm6 0h2v3l-1 2h-1l1-2V4z"
            fill="currentColor"
          />
        </svg>
      );
    case "numbers":
      return (
        <svg viewBox="0 0 16 16" className={className}>
          <rect x="3" y="9" width="2" height="4" fill="currentColor" />
          <rect x="7" y="6" width="2" height="7" fill="currentColor" />
          <rect x="11" y="3" width="2" height="10" fill="currentColor" />
        </svg>
      );
    case "family":
      return (
        <svg viewBox="0 0 16 16" className={className}>
          <circle cx="5" cy="6" r="2" stroke="currentColor" fill="none" />
          <circle cx="11" cy="6" r="2" stroke="currentColor" fill="none" />
          <path d="M2 13c0-2 1.5-3 3-3s3 1 3 3" stroke="currentColor" fill="none" />
          <path d="M8 13c0-2 1.5-3 3-3s3 1 3 3" stroke="currentColor" fill="none" />
        </svg>
      );
    case "playlist":
      return (
        <svg viewBox="0 0 16 16" className={className}>
          <line x1="3" y1="5" x2="13" y2="5" stroke="currentColor" />
          <line x1="3" y1="9" x2="13" y2="9" stroke="currentColor" />
          <line x1="3" y1="13" x2="9" y2="13" stroke="currentColor" />
          <circle cx="12" cy="13" r="1.5" stroke="currentColor" fill="none" />
        </svg>
      );
    case "outfit":
      return (
        <svg viewBox="0 0 16 16" className={className}>
          <path
            d="M5 3l3 2 3-2 3 3-2 1v6H4V7L2 6l3-3z"
            stroke="currentColor"
            fill="none"
          />
        </svg>
      );
    case "freewrite":
      return (
        <svg viewBox="0 0 16 16" className={className}>
          <path d="M3 12l8-8 2 2-8 8H3v-2z" stroke="currentColor" fill="none" />
        </svg>
      );
    case "narrative":
      return (
        <svg viewBox="0 0 16 16" className={className}>
          <line x1="3" y1="4" x2="13" y2="4" stroke="currentColor" />
          <line x1="3" y1="7" x2="13" y2="7" stroke="currentColor" />
          <line x1="3" y1="10" x2="13" y2="10" stroke="currentColor" />
          <line x1="3" y1="13" x2="9" y2="13" stroke="currentColor" />
        </svg>
      );
  }
}

export function blockShoutoutBadge(block: StoryBlock) {
  return (
    <Badge tone={blockTypeBadgeTone(block.type)}>{blockTypeLabel(block.type)}</Badge>
  );
}
