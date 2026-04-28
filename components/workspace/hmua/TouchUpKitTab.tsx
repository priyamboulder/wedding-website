"use client";

// ── Hair & Makeup → Touch-up Kit tab ──────────────────────────────────────
// The detail nobody else includes. When the bride's lipstick fades at the
// reception and nobody knows the shade, that's a real problem. This tab
// records the kit, who carries it, where it lives, and when touch-ups
// happen across the day and between events.

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Briefcase,
  Check,
  HandHeart,
  MapPin,
  Plus,
  Sparkles,
  Sun,
  Trash2,
  Umbrella,
  Wand2,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useHmuaStore } from "@/stores/hmua-store";
import type { WorkspaceCategory, WorkspaceItem } from "@/types/workspace";
import { WEDDING_EVENTS } from "@/types/workspace";
import {
  EmptyRow,
  Eyebrow,
  PanelCard,
  Tag,
} from "@/components/workspace/blocks/primitives";

// ── Default kit contents, grouped per spec ────────────────────────────────
// Each item stores its group on meta.group so the list renders as
// Lip / Face / Eyes / Hair / Emergency sections. `source` gates whether
// a default is auto-seeded (trial-derived, lens-specific, etc.).

type KitGroup = "Lip" | "Face" | "Eyes" | "Hair" | "Emergency";

const KIT_GROUPS_ORDER: KitGroup[] = ["Lip", "Face", "Eyes", "Hair", "Emergency"];

interface KitDefault {
  label: string;
  group: KitGroup;
  source: "trial" | "default" | "lenses";
}

const KIT_DEFAULTS: KitDefault[] = [
  // LIP
  { label: "Bridal lipstick (exact shade from approved trial)", group: "Lip", source: "trial" },
  { label: "Lip liner (approved shade)", group: "Lip", source: "trial" },
  { label: "Lip balm — Laneige / similar", group: "Lip", source: "default" },
  // FACE
  { label: "Setting spray", group: "Face", source: "default" },
  { label: "Blotting papers", group: "Face", source: "default" },
  { label: "Setting powder (bride's shade)", group: "Face", source: "trial" },
  { label: "Concealer for under-eye touch-ups", group: "Face", source: "trial" },
  // EYES
  { label: "Waterproof mascara (ceremony tears)", group: "Eyes", source: "default" },
  { label: "Q-tips for smudge fixes", group: "Eyes", source: "default" },
  { label: "Eye drops", group: "Eyes", source: "lenses" },
  // HAIR
  { label: "Bobby pins (matching hair color)", group: "Hair", source: "default" },
  { label: "Hair spray — travel size", group: "Hair", source: "default" },
  { label: "Extra gajra / fresh flowers (sealed in damp cloth)", group: "Hair", source: "default" },
  { label: "Spare maang tikka hook", group: "Hair", source: "default" },
  { label: "Hair ties matching hair color", group: "Hair", source: "default" },
  // EMERGENCY
  { label: "Safety pins (assorted)", group: "Emergency", source: "default" },
  { label: "Fashion tape — double sided", group: "Emergency", source: "default" },
  { label: "Stain remover pen (Tide-to-go)", group: "Emergency", source: "default" },
  { label: "Deodorant wipes", group: "Emergency", source: "default" },
  { label: "Mini sewing kit", group: "Emergency", source: "default" },
  { label: "Advil / Tylenol", group: "Emergency", source: "default" },
  { label: "Band-aids (blister block for heels)", group: "Emergency", source: "default" },
  { label: "Tissues — travel pack", group: "Emergency", source: "default" },
  { label: "Breath mints", group: "Emergency", source: "default" },
];

// ── Touch-up window seeds ─────────────────────────────────────────────────

const TOUCHUP_WINDOWS = [
  {
    label: "Between ceremony and reception",
    duration: "15 min",
    actions: "Lip reapplication, powder pass, hair pin check",
  },
  {
    label: "Before cake cutting",
    duration: "5 min",
    actions: "Quick blot and lip refresh",
  },
  {
    label: "Before send-off / last dance",
    duration: "10 min",
    actions: "Final touch-up — photo-ready",
  },
];

// ── Root ─────────────────────────────────────────────────────────────────

export function HmuaTouchUpKitTab({ category }: { category: WorkspaceCategory }) {
  const items = useWorkspaceStore((s) => s.items);
  const addItem = useWorkspaceStore((s) => s.addItem);
  const updateItem = useWorkspaceStore((s) => s.updateItem);
  const deleteItem = useWorkspaceStore((s) => s.deleteItem);
  const currentRole = useWorkspaceStore((s) => s.currentRole);
  const canEdit = currentRole !== "vendor";

  const profile = useHmuaStore((s) => s.profiles[category.id]);
  const wearsContacts = profile?.contact_lenses ?? false;

  const kitItems = useMemo(
    () =>
      items
        .filter(
          (i) =>
            i.category_id === category.id &&
            i.tab === "touch_up" &&
            i.block_type === "touch_up_kit",
        )
        .sort((a, b) => a.sort_order - b.sort_order),
    [items, category.id],
  );

  const transitionItems = useMemo(
    () =>
      items
        .filter(
          (i) =>
            i.category_id === category.id &&
            i.tab === "touch_up" &&
            i.block_type === "schedule_slot",
        )
        .sort((a, b) => a.sort_order - b.sort_order),
    [items, category.id],
  );

  const seedKit = () => {
    const existingTitles = new Set(kitItems.map((k) => k.title));
    KIT_DEFAULTS.filter((d) => d.source !== "lenses" || wearsContacts).forEach(
      (d, idx) => {
        if (existingTitles.has(d.label)) return;
        addItem({
          category_id: category.id,
          tab: "touch_up",
          block_type: "touch_up_kit",
          title: d.label,
          meta: { checked: false, source: d.source, group: d.group },
          sort_order: kitItems.length + idx + 1,
        });
      },
    );
  };

  const handleAddKitItem = (title: string, group?: KitGroup) => {
    if (!title.trim()) return;
    addItem({
      category_id: category.id,
      tab: "touch_up",
      block_type: "touch_up_kit",
      title: title.trim(),
      meta: { checked: false, group: group ?? "Emergency" },
      sort_order: kitItems.length + 1,
    });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            The detail nobody else includes
          </p>
          <h2 className="mt-1 font-serif font-bold text-[22px] leading-tight text-ink">
            Touch-up kit & schedule
          </h2>
          <p className="mt-1.5 max-w-2xl text-[12.5px] text-ink-muted">
            What's in the kit, who carries it, where it lives at each venue,
            and the windows where touch-ups happen across the day.
          </p>
        </div>
      </header>

      <KitAssignmentCard categoryId={category.id} canEdit={canEdit} />

      <SmartSuggestionsCard
        categoryId={category.id}
        canEdit={canEdit}
        existingTitles={new Set(kitItems.map((k) => k.title))}
        onAdd={handleAddKitItem}
      />

      <KitContentsCard
        kitItems={kitItems}
        canEdit={canEdit}
        seedDefaults={seedKit}
        onAdd={handleAddKitItem}
        onToggle={(item) =>
          updateItem(item.id, {
            meta: { ...(item.meta ?? {}), checked: !item.meta?.checked },
          })
        }
        onDelete={(id) => deleteItem(id)}
        wearsContacts={wearsContacts}
      />

      <TouchUpWindowsCard
        categoryId={category.id}
        items={transitionItems}
        canEdit={canEdit}
      />

      <GroomGroomingTimeline categoryId={category.id} canEdit={canEdit} />
    </div>
  );
}

// ── Smart suggestions ────────────────────────────────────────────────────
// Context-aware extras: ceremony environment, season, and venue type each
// unlock a short list of additions to the default kit. Lightweight rules —
// the point is that an outdoor summer ceremony should never be missing SPF
// and blotting papers, regardless of how careful the default packing was.

type KitContextKey = "outdoor" | "indoor" | "summer" | "winter" | "monsoon" | "beach" | "garden" | "banquet";

const KIT_CONTEXT_OPTIONS: {
  value: KitContextKey;
  label: string;
  emoji: string;
  group: "environment" | "season" | "venue";
}[] = [
  { value: "outdoor", label: "Outdoor ceremony", emoji: "🌿", group: "environment" },
  { value: "indoor", label: "Indoor ceremony", emoji: "🏛", group: "environment" },
  { value: "summer", label: "Summer", emoji: "☀️", group: "season" },
  { value: "winter", label: "Winter", emoji: "❄️", group: "season" },
  { value: "monsoon", label: "Monsoon", emoji: "🌧", group: "season" },
  { value: "beach", label: "Beach / destination", emoji: "🌊", group: "venue" },
  { value: "garden", label: "Garden / farm", emoji: "🌾", group: "venue" },
  { value: "banquet", label: "Banquet / hotel", emoji: "🏨", group: "venue" },
];

const CONTEXT_SUGGESTIONS: Record<KitContextKey, { label: string; group: KitGroup; reason: string }[]> = {
  outdoor: [
    { label: "Extra SPF — reapply under makeup", group: "Face", reason: "Outdoor light + long day = reapplication risk" },
    { label: "Blotting papers (double pack)", group: "Face", reason: "Heat brings shine; papers outperform powder mid-day" },
    { label: "Facial mist (refreshing)", group: "Face", reason: "Soft reset between outdoor segments" },
    { label: "Heavy-duty hair spray", group: "Hair", reason: "Breeze + loose pieces fighting back" },
    { label: "Extra bobby pins (dark + light)", group: "Hair", reason: "Wind = pin loss" },
  ],
  indoor: [
    { label: "Extra setting powder — photo flash", group: "Face", reason: "Indoor flash catches shine twice as hard" },
  ],
  summer: [
    { label: "Sweat-proof setting spray", group: "Face", reason: "Heat breaks standard sprays" },
    { label: "Electrolyte sachets", group: "Emergency", reason: "Dehydration shows on skin before the dress zip" },
    { label: "Mini hand fan / folding fan", group: "Emergency", reason: "One minute cooling = no makeup melt-down" },
  ],
  winter: [
    { label: "Intensive lip balm — Laneige overnight", group: "Lip", reason: "Cold splits the lips under matte lipstick" },
    { label: "Rich moisturizer travel size", group: "Face", reason: "Dry indoor heat ages skin within an hour" },
  ],
  monsoon: [
    { label: "Waterproof primer", group: "Face", reason: "Humidity is the stealth enemy of foundation" },
    { label: "Anti-humidity hair serum", group: "Hair", reason: "Frizz is a monsoon-wedding tax" },
    { label: "Water-resistant base mascara", group: "Eyes", reason: "Humidity alone re-activates regular mascara" },
  ],
  beach: [
    { label: "Mineral SPF — reef-safe", group: "Face", reason: "Beach photos near reef-protected venues" },
    { label: "Beach hair kit (leave-in + clip)", group: "Hair", reason: "Salt + wind will change hair behavior" },
    { label: "Sand-free face cloth", group: "Face", reason: "Sand finds every surface" },
  ],
  garden: [
    { label: "Bug repellent wipes", group: "Emergency", reason: "Outdoor farm weddings attract gnats at sunset" },
    { label: "Pollen-safe eye drops", group: "Eyes", reason: "Garden pollen during vows is the classic stinger" },
  ],
  banquet: [
    { label: "Static-control hair spray", group: "Hair", reason: "Banquet carpets statically charge long hair" },
    { label: "Travel-size stain pen (for mandap tea/chai)", group: "Emergency", reason: "Banquet = tea service near the outfit" },
  ],
};

function SmartSuggestionsCard({
  categoryId,
  canEdit,
  existingTitles,
  onAdd,
}: {
  categoryId: string;
  canEdit: boolean;
  existingTitles: Set<string>;
  onAdd: (title: string, group?: KitGroup) => void;
}) {
  const [context, setContext] = useState<Set<KitContextKey>>(new Set());
  const storageKey = `ananya:hmua-kit-context:${categoryId}`;

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setContext(new Set(parsed));
    } catch {
      // ignore
    }
  }, [storageKey]);

  function toggleContext(v: KitContextKey) {
    const next = new Set(context);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    // Environment + season are mutually exclusive within their group.
    const opt = KIT_CONTEXT_OPTIONS.find((o) => o.value === v);
    if (opt && next.has(v)) {
      for (const other of KIT_CONTEXT_OPTIONS) {
        if (other.group === opt.group && other.value !== v) next.delete(other.value);
      }
    }
    setContext(next);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify([...next]));
      } catch {
        // ignore
      }
    }
  }

  // Aggregate suggestions from all active contexts.
  const suggestions = useMemo(() => {
    const seen = new Set<string>();
    const out: { label: string; group: KitGroup; reason: string }[] = [];
    for (const key of context) {
      for (const s of CONTEXT_SUGGESTIONS[key] ?? []) {
        if (!seen.has(s.label) && !existingTitles.has(s.label)) {
          out.push(s);
          seen.add(s.label);
        }
      }
    }
    return out;
  }, [context, existingTitles]);

  return (
    <PanelCard
      icon={<Sparkles size={14} strokeWidth={1.8} />}
      title="Smart suggestions"
      badge={
        <span
          className="font-mono text-[10px] uppercase tracking-[0.12em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          ✦ Tuned to your day
        </span>
      }
    >
      <p className="-mt-2 mb-3 max-w-2xl text-[12px] italic text-ink-faint">
        Toggle what's true about your ceremony. Suggestions below are
        specific extras beyond the default kit — pick what's useful.
      </p>

      <div className="space-y-2">
        {(["environment", "season", "venue"] as const).map((group) => (
          <div key={group} className="flex flex-wrap items-center gap-1.5">
            <span
              className="w-24 shrink-0 font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {group}
            </span>
            {KIT_CONTEXT_OPTIONS.filter((o) => o.group === group).map((o) => {
              const active = context.has(o.value);
              return (
                <button
                  key={o.value}
                  type="button"
                  disabled={!canEdit}
                  onClick={() => toggleContext(o.value)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11.5px] transition-colors",
                    active
                      ? "border-saffron bg-saffron-pale/60 text-saffron"
                      : "border-border bg-white text-ink-muted hover:border-saffron/40",
                    !canEdit && "cursor-not-allowed opacity-60",
                  )}
                >
                  <span>{o.emoji}</span>
                  {o.label}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {context.size > 0 && (
        <div className="mt-4 rounded-md border border-saffron/30 bg-saffron-pale/15 p-3">
          <Eyebrow className="mb-2">
            {suggestions.length === 0
              ? "All suggestions for this context are already in your kit"
              : `Add these for your context (${suggestions.length})`}
          </Eyebrow>
          {suggestions.length > 0 && (
            <ul className="space-y-1.5">
              {suggestions.map((s) => (
                <li
                  key={s.label}
                  className="flex items-start gap-2 rounded-sm border border-dashed border-saffron/30 bg-white px-2.5 py-1.5"
                >
                  <span className="mt-0.5 text-saffron">
                    <Sparkles size={11} strokeWidth={1.8} />
                  </span>
                  <div className="flex-1">
                    <p className="text-[12.5px] text-ink">{s.label}</p>
                    <p className="text-[10.5px] italic text-ink-muted">{s.reason}</p>
                  </div>
                  <span
                    className="shrink-0 rounded-full border border-border bg-ivory-warm/50 px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.08em] text-ink-muted"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {s.group}
                  </span>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => onAdd(s.label, s.group)}
                      className="inline-flex items-center gap-1 rounded-sm bg-ink px-2 py-1 text-[11px] font-medium text-ivory hover:opacity-90"
                    >
                      <Plus size={10} strokeWidth={2} />
                      Add
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </PanelCard>
  );
}

// Silence unused icon imports.
void Sun;
void Umbrella;

// ── Kit assignment ───────────────────────────────────────────────────────
// Three kits so one missing bag doesn't break the morning: Primary lives
// with a bridesmaid, Backup lives with the planner, and the Artist keeps
// a pro kit stocked with the bride's exact shades.

type KitRole = "primary" | "backup" | "artist";

interface KitCopy {
  role: KitRole;
  title: string;
  subtitle: string;
  carrier_key: "carrier" | "backup_carrier" | "artist_carrier";
  location_key: "storage_locations" | "backup_location" | "artist_location";
  notes_key: "backup_notes" | "artist_notes" | null;
  carrier_placeholder: string;
  location_placeholder: string;
  notes_placeholder?: string;
  accent: string;
}

const KIT_ROLES: KitCopy[] = [
  {
    role: "primary",
    title: "Primary kit",
    subtitle: "Travels with the bride. Never set down.",
    carrier_key: "carrier",
    location_key: "storage_locations",
    notes_key: null,
    carrier_placeholder: "Maid of honor — Aanya",
    location_placeholder:
      "Getting-ready room → bridal room at venue → bridal suite at reception",
    accent: "border-saffron/40 bg-saffron-pale/10",
  },
  {
    role: "backup",
    title: "Backup kit",
    subtitle: "Full backup of emergency items + products.",
    carrier_key: "backup_carrier",
    location_key: "backup_location",
    notes_key: "backup_notes",
    carrier_placeholder: "Planner — Urvashi",
    location_placeholder: "Planner's tote bag — within arm's reach all day",
    notes_placeholder:
      "Safety pins, sewing kit, stain remover, backup lipstick, Advil, extra gajra…",
    accent: "border-rose/30 bg-rose-pale/10",
  },
  {
    role: "artist",
    title: "Artist kit",
    subtitle: "Lead HMUA carries her own pro kit.",
    carrier_key: "artist_carrier",
    location_key: "artist_location",
    notes_key: "artist_notes",
    carrier_placeholder: "Lead HMUA — Anaya Kapoor",
    location_placeholder: "With artist — she arrives with her own kit",
    notes_placeholder:
      "Bride's exact shades + formulas for between-event touch-ups",
    accent: "border-sage/40 bg-sage-pale/20",
  },
];

function KitAssignmentCard({
  categoryId,
  canEdit,
}: {
  categoryId: string;
  canEdit: boolean;
}) {
  const touchUp = useHmuaStore((s) => s.getTouchUp(categoryId));
  const set = useHmuaStore((s) => s.setTouchUp);

  return (
    <PanelCard
      icon={<User size={14} strokeWidth={1.8} />}
      title="Who carries the kit"
      badge={
        <span
          className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          3 kits · redundancy on purpose
        </span>
      }
    >
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {KIT_ROLES.map((kit) => (
          <div
            key={kit.role}
            className={cn(
              "rounded-md border p-3",
              kit.accent,
            )}
          >
            <div className="flex items-center gap-1.5">
              <Briefcase size={12} strokeWidth={1.8} className="text-ink-muted" />
              <p className="font-serif text-[14px] leading-tight text-ink">
                {kit.title}
              </p>
            </div>
            <p className="mt-0.5 text-[11px] italic text-ink-faint">
              {kit.subtitle}
            </p>

            <div className="mt-2 space-y-2">
              <div>
                <Eyebrow>Assigned to</Eyebrow>
                <input
                  value={touchUp[kit.carrier_key]}
                  disabled={!canEdit}
                  onChange={(e) =>
                    set(categoryId, { [kit.carrier_key]: e.target.value })
                  }
                  placeholder={kit.carrier_placeholder}
                  className="mt-1 w-full rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
                />
              </div>
              <div>
                <Eyebrow>Location</Eyebrow>
                <textarea
                  value={touchUp[kit.location_key]}
                  disabled={!canEdit}
                  onChange={(e) =>
                    set(categoryId, { [kit.location_key]: e.target.value })
                  }
                  placeholder={kit.location_placeholder}
                  rows={2}
                  className="mt-1 w-full resize-none rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
                />
              </div>
              {kit.notes_key && (
                <div>
                  <Eyebrow>Contains</Eyebrow>
                  <textarea
                    value={touchUp[kit.notes_key]}
                    disabled={!canEdit}
                    onChange={(e) =>
                      set(categoryId, {
                        [kit.notes_key as string]: e.target.value,
                      })
                    }
                    placeholder={kit.notes_placeholder}
                    rows={2}
                    className="mt-1 w-full resize-none rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </PanelCard>
  );
}

// ── Kit contents ─────────────────────────────────────────────────────────

function KitContentsCard({
  kitItems,
  canEdit,
  seedDefaults,
  onAdd,
  onToggle,
  onDelete,
  wearsContacts,
}: {
  kitItems: WorkspaceItem[];
  canEdit: boolean;
  seedDefaults: () => void;
  onAdd: (title: string, group?: KitGroup) => void;
  onToggle: (item: WorkspaceItem) => void;
  onDelete: (id: string) => void;
  wearsContacts: boolean;
}) {
  const checkedCount = kitItems.filter((i) => i.meta?.checked).length;

  // Bucket items by group. Items with no group land in Emergency.
  const buckets: Record<KitGroup, WorkspaceItem[]> = {
    Lip: [],
    Face: [],
    Eyes: [],
    Hair: [],
    Emergency: [],
  };
  for (const item of kitItems) {
    const g = (item.meta?.group as KitGroup | undefined) ?? "Emergency";
    if (buckets[g]) {
      buckets[g].push(item);
    } else {
      buckets.Emergency.push(item);
    }
  }

  return (
    <PanelCard
      icon={<Briefcase size={14} strokeWidth={1.8} />}
      title="Kit contents"
      badge={
        <div className="flex items-center gap-2">
          {kitItems.length > 0 && (
            <span
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {checkedCount}/{kitItems.length} packed
            </span>
          )}
          {canEdit && kitItems.length < KIT_DEFAULTS.length && (
            <button
              type="button"
              onClick={seedDefaults}
              className="inline-flex items-center gap-1 text-[11px] text-saffron hover:underline"
            >
              <span aria-hidden>✦</span>
              {kitItems.length === 0 ? "Build from trial" : "Add missing defaults"}
            </button>
          )}
        </div>
      }
    >
      {kitItems.length === 0 ? (
        <div>
          <EmptyRow>
            Your trial logs the exact lipstick shade — that becomes the most
            important kit item. Tap "Build from trial" above to seed the kit.
          </EmptyRow>
          {!wearsContacts && (
            <p className="mt-2 flex items-start gap-1.5 text-[11px] text-ink-faint">
              <AlertCircle size={11} strokeWidth={1.8} className="mt-0.5" />
              Eye drops will be skipped because you didn't mark contact lenses
              in your skin profile.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {KIT_GROUPS_ORDER.map((group) => {
            const groupItems = buckets[group];
            if (groupItems.length === 0) return null;
            const packed = groupItems.filter((i) => i.meta?.checked).length;
            return (
              <KitGroupSection
                key={group}
                group={group}
                items={groupItems}
                packed={packed}
                canEdit={canEdit}
                onToggle={onToggle}
                onDelete={onDelete}
                onAdd={(title) => onAdd(title, group)}
              />
            );
          })}
        </div>
      )}
    </PanelCard>
  );
}

function KitGroupSection({
  group,
  items,
  packed,
  canEdit,
  onToggle,
  onDelete,
  onAdd,
}: {
  group: KitGroup;
  items: WorkspaceItem[];
  packed: number;
  canEdit: boolean;
  onToggle: (item: WorkspaceItem) => void;
  onDelete: (id: string) => void;
  onAdd: (title: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const submit = () => {
    if (!draft.trim()) return;
    onAdd(draft);
    setDraft("");
  };
  return (
    <section className="rounded-md border border-border bg-ivory-warm/20 p-3">
      <header className="flex items-center justify-between">
        <Eyebrow>{group}</Eyebrow>
        <span
          className="font-mono text-[10px] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {packed}/{items.length} packed
        </span>
      </header>
      <ul className="mt-2 grid grid-cols-1 gap-1 md:grid-cols-2">
        {items.map((i) => {
          const checked = Boolean(i.meta?.checked);
          const fromTrial = i.meta?.source === "trial";
          return (
            <li
              key={i.id}
              className="group flex items-start gap-2 rounded-sm border border-transparent bg-white/40 px-2 py-1.5 hover:border-border hover:bg-white"
            >
              <button
                type="button"
                disabled={!canEdit}
                onClick={() => onToggle(i)}
                className={cn(
                  "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
                  checked
                    ? "border-sage bg-sage text-white"
                    : "border-ink-faint bg-white",
                )}
                aria-label={checked ? "Mark not packed" : "Mark packed"}
              >
                {checked && <Check size={11} strokeWidth={2.5} />}
              </button>
              <div className="flex-1">
                <span
                  className={cn(
                    "text-[12.5px]",
                    checked ? "text-ink-faint line-through" : "text-ink",
                  )}
                >
                  {i.title}
                </span>
                {fromTrial && <Tag tone="saffron">From trial</Tag>}
              </div>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => onDelete(i.id)}
                  className="text-ink-faint opacity-0 hover:text-rose group-hover:opacity-100"
                  aria-label="Remove"
                >
                  <Trash2 size={11} strokeWidth={1.8} />
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {canEdit && (
        <div className="mt-2 flex items-center gap-1.5">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), submit())
            }
            placeholder={`Add to ${group.toLowerCase()}…`}
            className="flex-1 rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!draft.trim()}
            className={cn(
              "inline-flex items-center gap-1 rounded-sm px-2 py-1 text-[11px] font-medium",
              draft.trim()
                ? "bg-ink text-ivory hover:opacity-90"
                : "bg-ivory-warm text-ink-faint",
            )}
          >
            <Plus size={11} strokeWidth={2} />
            Add
          </button>
        </div>
      )}
    </section>
  );
}

// ── Touch-up windows + between-event transitions ──────────────────────────

function TouchUpWindowsCard({
  categoryId,
  items,
  canEdit,
}: {
  categoryId: string;
  items: WorkspaceItem[];
  canEdit: boolean;
}) {
  const addItem = useWorkspaceStore((s) => s.addItem);
  const updateItem = useWorkspaceStore((s) => s.updateItem);
  const deleteItem = useWorkspaceStore((s) => s.deleteItem);

  const seedDefaults = () => {
    TOUCHUP_WINDOWS.forEach((w, idx) => {
      addItem({
        category_id: categoryId,
        tab: "touch_up",
        block_type: "schedule_slot",
        title: w.label,
        meta: {
          duration: w.duration,
          actions: w.actions,
          window_type: "intra-event",
        },
        sort_order: idx + 1,
      });
    });
  };

  const addTransition = (fromEv: string, toEv: string) => {
    addItem({
      category_id: categoryId,
      tab: "touch_up",
      block_type: "schedule_slot",
      title: `${fromEv} → ${toEv}`,
      meta: {
        duration: "90 min",
        actions: "Remove previous look, fresh application for next event",
        window_type: "between-event",
        from_event: fromEv,
        to_event: toEv,
      },
      sort_order: items.length + 1,
    });
  };

  return (
    <PanelCard
      icon={<HandHeart size={14} strokeWidth={1.8} />}
      title="Touch-up windows"
      badge={
        canEdit && items.length === 0 ? (
          <button
            type="button"
            onClick={seedDefaults}
            className="text-[11px] text-saffron hover:underline"
          >
            Seed standard windows
          </button>
        ) : null
      }
    >
      {items.length === 0 ? (
        <EmptyRow>
          Standard windows: between ceremony + reception, before cake cutting,
          before send-off. Plus one per event-to-event transition where the
          bride changes her look entirely.
        </EmptyRow>
      ) : (
        <ul className="space-y-2">
          {items.map((it) => {
            const meta = it.meta ?? {};
            const isTransition = meta.window_type === "between-event";
            return (
              <li
                key={it.id}
                className={cn(
                  "rounded-md border bg-white p-3",
                  isTransition
                    ? "border-saffron/30 bg-saffron-pale/10"
                    : "border-border",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Wand2
                        size={12}
                        strokeWidth={1.8}
                        className={
                          isTransition ? "text-saffron" : "text-ink-muted"
                        }
                      />
                      <input
                        value={it.title}
                        disabled={!canEdit}
                        onChange={(e) =>
                          updateItem(it.id, { title: e.target.value })
                        }
                        className="flex-1 bg-transparent text-[13px] font-medium text-ink focus:outline-none disabled:opacity-60"
                      />
                      {isTransition && <Tag tone="saffron">Transition</Tag>}
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <input
                        value={(meta.duration as string) ?? ""}
                        disabled={!canEdit}
                        onChange={(e) =>
                          updateItem(it.id, {
                            meta: { ...meta, duration: e.target.value },
                          })
                        }
                        placeholder="duration"
                        className="w-24 rounded-sm border border-border bg-white px-1.5 py-0.5 font-mono text-[11px] text-ink focus:border-saffron focus:outline-none disabled:opacity-60"
                        style={{ fontFamily: "var(--font-mono)" }}
                      />
                      <input
                        value={(meta.actions as string) ?? ""}
                        disabled={!canEdit}
                        onChange={(e) =>
                          updateItem(it.id, {
                            meta: { ...meta, actions: e.target.value },
                          })
                        }
                        placeholder="What happens here"
                        className="flex-1 min-w-[200px] rounded-sm border border-border bg-white px-1.5 py-0.5 text-[12px] text-ink focus:border-saffron focus:outline-none disabled:opacity-60"
                      />
                    </div>
                    {(meta.location as string | undefined) && (
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-ink-muted">
                        <MapPin size={10} strokeWidth={1.8} />
                        {String(meta.location)}
                      </div>
                    )}
                  </div>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => deleteItem(it.id)}
                      className="text-ink-faint hover:text-rose"
                      aria-label="Remove window"
                    >
                      <Trash2 size={12} strokeWidth={1.8} />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {canEdit && (
        <div className="mt-4 rounded-md border border-dashed border-border bg-ivory-warm/30 p-3">
          <Eyebrow>Add a between-event transition</Eyebrow>
          <p className="mt-1 text-[11.5px] text-ink-muted">
            For multi-day weddings where the bride changes looks entirely
            between events.
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {WEDDING_EVENTS.flatMap((from, i) =>
              WEDDING_EVENTS.slice(i + 1).map((to) => ({
                from: from.label,
                to: to.label,
              })),
            )
              .slice(0, 6)
              .map(({ from, to }) => (
                <button
                  key={`${from}-${to}`}
                  type="button"
                  onClick={() => addTransition(from, to)}
                  className="rounded-full border border-border bg-white px-2.5 py-1 text-[11px] text-ink-muted hover:border-saffron hover:text-saffron"
                >
                  + {from} → {to}
                </button>
              ))}
          </div>
        </div>
      )}
    </PanelCard>
  );
}

// ── Groom grooming timeline ──────────────────────────────────────────────
// Not afterthought — a plan. Stored as a single note item keyed by title
// with meta.checklist holding boolean checks per milestone.

const GROOM_GROOMING_PHASES: {
  phase: string;
  eyebrow: string;
  items: { key: string; label: string }[];
}[] = [
  {
    phase: "2 months before",
    eyebrow: "Groundwork",
    items: [
      { key: "skincare_start", label: "Start skincare routine (cleanser, moisturizer, SPF)" },
      { key: "barber_relationship", label: "Establish barber relationship (if not existing)" },
    ],
  },
  {
    phase: "1 month before",
    eyebrow: "Trial pass",
    items: [
      { key: "haircut_trial", label: "Haircut — the \"trial\" cut (find the length/style)" },
      { key: "facial_deep", label: "Facial — deep clean" },
      { key: "teeth_whitening", label: "Teeth whitening (if desired)" },
    ],
  },
  {
    phase: "1 week before",
    eyebrow: "Finalize",
    items: [
      { key: "haircut_final", label: "Final haircut" },
      { key: "beard_shape", label: "Beard trim / shave — establish the exact shape" },
      { key: "facial_light", label: "Facial — gentle, no extractions" },
    ],
  },
  {
    phase: "3 days before",
    eyebrow: "Lockdown",
    items: [
      { key: "no_new_products", label: "No new products (allergy risk)" },
      { key: "light_facial", label: "Light facial if skin is clear" },
      { key: "confirm_barber", label: "Confirm barber / grooming day-of time" },
    ],
  },
  {
    phase: "Day of",
    eyebrow: "Execute",
    items: [
      { key: "barber_arrives", label: "Barber arrives on time" },
      { key: "shave_trim", label: "Fresh shave / trim" },
      { key: "concealer_check", label: "Light concealer if needed (under-eye, blemishes)" },
      { key: "setting_spray", label: "Setting spray — he'll be under lights too" },
    ],
  },
];

const GROOM_GROOMING_TITLE = "__groom_grooming_timeline__";

function GroomGroomingTimeline({
  categoryId,
  canEdit,
}: {
  categoryId: string;
  canEdit: boolean;
}) {
  const items = useWorkspaceStore((s) => s.items);
  const addItem = useWorkspaceStore((s) => s.addItem);
  const updateItem = useWorkspaceStore((s) => s.updateItem);

  const slot = useMemo(
    () =>
      items.find(
        (i) =>
          i.category_id === categoryId &&
          i.tab === "touch_up" &&
          i.block_type === "note" &&
          i.title === GROOM_GROOMING_TITLE,
      ),
    [items, categoryId],
  );

  const checklist = (slot?.meta?.checklist ?? {}) as Record<string, boolean>;
  const groomName = (slot?.meta?.groom_name as string | undefined) ?? "";

  const updateChecklist = (key: string) => {
    if (!canEdit) return;
    const next = { ...checklist, [key]: !checklist[key] };
    if (slot) {
      updateItem(slot.id, { meta: { ...slot.meta, checklist: next } });
    } else {
      addItem({
        category_id: categoryId,
        tab: "touch_up",
        block_type: "note",
        title: GROOM_GROOMING_TITLE,
        meta: { checklist: next, groom_name: "" },
        sort_order: 999,
      });
    }
  };

  const setGroomName = (name: string) => {
    if (!canEdit) return;
    if (slot) {
      updateItem(slot.id, { meta: { ...slot.meta, groom_name: name } });
    } else {
      addItem({
        category_id: categoryId,
        tab: "touch_up",
        block_type: "note",
        title: GROOM_GROOMING_TITLE,
        meta: { checklist: {}, groom_name: name },
        sort_order: 999,
      });
    }
  };

  const totalItems = GROOM_GROOMING_PHASES.reduce(
    (sum, p) => sum + p.items.length,
    0,
  );
  const completedItems = GROOM_GROOMING_PHASES.reduce(
    (sum, p) => sum + p.items.filter((i) => checklist[i.key]).length,
    0,
  );

  return (
    <PanelCard
      icon={<User size={14} strokeWidth={1.8} />}
      title="Groom's grooming timeline"
      badge={
        <span
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {completedItems}/{totalItems}
        </span>
      }
    >
      <p className="-mt-2 mb-3 text-[11.5px] italic text-ink-faint">
        Not afterthought — a plan. Skin, shave, haircut, and the day-of
        touches that make him photograph as well as the bride.
      </p>

      <div className="mb-3">
        <Eyebrow>Groom</Eyebrow>
        <input
          value={groomName}
          disabled={!canEdit}
          onChange={(e) => setGroomName(e.target.value)}
          placeholder="e.g. Raj Malhotra"
          className="mt-1 w-full rounded-sm border border-border bg-white px-2 py-1 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        {GROOM_GROOMING_PHASES.map((phase) => {
          const done = phase.items.filter((i) => checklist[i.key]).length;
          return (
            <section
              key={phase.phase}
              className="rounded-md border border-border bg-ivory-warm/25 p-3"
            >
              <header>
                <p
                  className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-saffron"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {phase.eyebrow}
                </p>
                <p className="mt-0.5 font-serif text-[14px] leading-tight text-ink">
                  {phase.phase}
                </p>
                <span
                  className="mt-0.5 block font-mono text-[9.5px] text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {done}/{phase.items.length}
                </span>
              </header>
              <ul className="mt-2 space-y-1">
                {phase.items.map((item) => {
                  const checked = Boolean(checklist[item.key]);
                  return (
                    <li key={item.key}>
                      <button
                        type="button"
                        disabled={!canEdit}
                        onClick={() => updateChecklist(item.key)}
                        className="group flex w-full items-start gap-2 text-left disabled:cursor-not-allowed"
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border transition-colors",
                            checked
                              ? "border-sage bg-sage text-white"
                              : "border-ink-faint bg-white group-hover:border-saffron",
                          )}
                        >
                          {checked && <Check size={9} strokeWidth={2.5} />}
                        </span>
                        <span
                          className={cn(
                            "text-[12px] leading-snug",
                            checked
                              ? "text-ink-faint line-through"
                              : "text-ink",
                          )}
                        >
                          {item.label}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </PanelCard>
  );
}
