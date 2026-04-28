"use client";

// ── Hair & Makeup → Trial Notes tab ───────────────────────────────────────
// Trials are where the look gets developed. This tab is the recipe book —
// every product, every photo angle, every longevity test — so the artist
// can replicate the approved look exactly on wedding day, three months
// later, at 6 AM, without guessing.
//
// Each trial is a WorkspaceItem with block_type "trial". The structured
// product list, photos, feedback, and decision live on item.meta.

import { useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
  ListChecks,
  Plus,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { WorkspaceCategory, WorkspaceItem } from "@/types/workspace";
import { WEDDING_EVENTS } from "@/types/workspace";
import {
  EmptyRow,
  Eyebrow,
  PanelCard,
} from "@/components/workspace/blocks/primitives";

// ── Types on item.meta ────────────────────────────────────────────────────

type TrialDecision = "approved" | "close" | "wrong" | "pending";

interface TrialProductRow {
  id: string;
  category: string; // "Foundation", "Eyes", etc.
  brand: string;
  shade: string;
  notes: string;
}

interface TrialPhotoRow {
  id: string;
  url: string;
  angle: string;
  lighting: string;
}

type LightingCondition = "daylight" | "indoor" | "flash" | "golden_hour";

interface LightingTestRow {
  checked: boolean;
  notes: string;
}

type LightingTest = Record<LightingCondition, LightingTestRow>;

interface TrialMeta {
  // Trial log header
  date?: string;
  event_target?: string;
  artist?: string;
  location?: string;
  duration?: string; // e.g. "2h 30m"
  look_type?: string; // e.g. "Wedding ceremony look"
  decision?: TrialDecision;
  rating?: number;
  // Structured feedback (3-way split per spec)
  loved?: string;
  changed?: string;
  kept?: string; // "What to keep exactly the same"
  longevity?: string;
  hair_notes?: string;
  pin_count?: number;
  allergies?: string;
  products?: TrialProductRow[];
  photos?: TrialPhotoRow[];
  lighting_test?: LightingTest;
}

const LIGHTING_TEST_ROWS: { key: LightingCondition; label: string; hint: string }[] = [
  { key: "daylight", label: "Natural daylight", hint: "Morning photos, outdoor ceremony" },
  { key: "indoor", label: "Indoor venue lighting", hint: "Warm tungsten, mandap lamps" },
  { key: "flash", label: "Flash photography", hint: "On-camera flash, reception dance floor" },
  { key: "golden_hour", label: "Golden hour / outdoor", hint: "Evening portraits, sendoff" },
];

const PRE_TRIAL_CHECKLIST: { key: string; label: string }[] = [
  { key: "outfit_photos", label: "Photos of your wedding outfit(s)" },
  { key: "wedding_jewelry", label: "Wedding jewelry — for tikka + earring placement" },
  { key: "dupatta_swatch", label: "Dupatta fabric swatch for draping practice" },
  { key: "moodboard_refs", label: "Reference images from your moodboard" },
  { key: "skincare_routine", label: "Your current skincare routine list" },
  { key: "allergy_list", label: "Anything you're allergic to" },
];

// Product categories grouped per spec: Face / Eyes / Lips / Skin prep.
// Ordered so the rendered table reads top-to-bottom in application order.
const PRODUCT_CATEGORY_GROUPS: {
  group: string;
  members: string[];
}[] = [
  { group: "Skin prep", members: ["Primer", "Skin prep", "Setting spray"] },
  {
    group: "Face",
    members: ["Foundation", "Concealer", "Blush", "Contour", "Highlight", "Setting powder"],
  },
  {
    group: "Eyes",
    members: ["Eye primer", "Eye shadow", "Liner", "Mascara", "Lashes", "Brows"],
  },
  { group: "Lips", members: ["Lip liner", "Lipstick", "Lip gloss", "Lip balm"] },
];

const DEFAULT_PRODUCT_CATEGORIES: string[] = PRODUCT_CATEGORY_GROUPS.flatMap(
  (g) => g.members,
);

const CATEGORY_TO_GROUP: Record<string, string> = Object.fromEntries(
  PRODUCT_CATEGORY_GROUPS.flatMap((g) =>
    g.members.map((m) => [m, g.group] as const),
  ),
);

function groupLabelFor(category: string): string {
  return CATEGORY_TO_GROUP[category] ?? "Other";
}

// Seed rows the artist is likely to fill in — matches the spec's Face /
// Eyes / Lips / Skin prep structure so the couple has something to edit
// instead of a blank table.
const ARTIST_SEED_ROWS: { category: string; brand: string; shade: string }[] = [
  { category: "Primer", brand: "", shade: "" },
  { category: "Foundation", brand: "", shade: "" },
  { category: "Concealer", brand: "", shade: "" },
  { category: "Setting powder", brand: "", shade: "" },
  { category: "Blush", brand: "", shade: "" },
  { category: "Eye shadow", brand: "", shade: "" },
  { category: "Liner", brand: "", shade: "" },
  { category: "Mascara", brand: "", shade: "" },
  { category: "Brows", brand: "", shade: "" },
  { category: "Lip liner", brand: "", shade: "" },
  { category: "Lipstick", brand: "", shade: "" },
  { category: "Setting spray", brand: "", shade: "" },
];

const DECISION_LABEL: Record<TrialDecision, string> = {
  approved: "Approved — this is the look",
  close: "Close — needs another trial",
  wrong: "Wrong direction — rethink",
  pending: "Decision pending",
};

const DECISION_TONE: Record<TrialDecision, string> = {
  approved: "border border-sage bg-sage-pale/40 text-sage",
  close: "border border-amber-300 bg-amber-50 text-amber-700",
  wrong: "border border-rose/50 bg-rose-pale/40 text-rose",
  pending: "border border-stone-200 bg-stone-50 text-stone-600",
};

// ── Root ─────────────────────────────────────────────────────────────────

export function HmuaTrialNotesTab({ category }: { category: WorkspaceCategory }) {
  const items = useWorkspaceStore((s) => s.items);
  const addItem = useWorkspaceStore((s) => s.addItem);
  const currentRole = useWorkspaceStore((s) => s.currentRole);
  const canEdit = currentRole !== "vendor";

  const trials = useMemo(
    () =>
      items
        .filter(
          (i) =>
            i.category_id === category.id &&
            i.tab === "trial_notes" &&
            i.block_type === "trial",
        )
        .sort((a, b) => a.sort_order - b.sort_order),
    [items, category.id],
  );

  const approved = trials.filter(
    (t) => (t.meta as TrialMeta | undefined)?.decision === "approved",
  );

  const handleAdd = () => {
    addItem({
      category_id: category.id,
      tab: "trial_notes",
      block_type: "trial",
      title: `Trial #${trials.length + 1}`,
      meta: {
        decision: "pending",
        products: [],
        photos: [],
      },
      sort_order: trials.length + 1,
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
            The recipe book
          </p>
          <h2 className="mt-1 font-serif font-bold text-[22px] leading-tight text-ink">
            Trials — every product, every angle, locked in
          </h2>
          <p className="mt-1.5 max-w-2xl text-[12.5px] text-ink-muted">
            Each trial captures the exact products, photos in 4 angles + 3
            lightings, and a longevity test so the artist can replicate the
            approved look at 6 AM on wedding day.
          </p>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory transition-opacity hover:opacity-90"
          >
            <Plus size={13} strokeWidth={1.8} />
            Add trial
          </button>
        )}
      </header>

      <PreTrialChecklist categoryId={category.id} canEdit={canEdit} />

      {approved.length > 0 && (
        <ApprovedLookBanner approved={approved} />
      )}

      {trials.length > 1 && <TrialHistoryTable trials={trials} />}

      {trials.length === 0 ? (
        <PanelCard
          icon={<Wand2 size={14} strokeWidth={1.8} />}
          title="No trials logged yet"
        >
          <EmptyRow>
            Most brides do 2–3 trials per look. Add your first when you book
            your trial appointment.
          </EmptyRow>
        </PanelCard>
      ) : (
        <ul className="space-y-3">
          {trials.map((t, idx) => (
            <li key={t.id}>
              <TrialCard trial={t} index={idx} canEdit={canEdit} />
            </li>
          ))}
        </ul>
      )}

    </div>
  );
}

// ── Pre-trial checklist ──────────────────────────────────────────────────
// Stored as a single item (block_type "trial", title "__pre_trial__") with
// meta.checklist = { [key]: boolean }. Hidden from the trial card list.

function PreTrialChecklist({
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
          i.tab === "trial_notes" &&
          i.block_type === "note" &&
          i.title === "__pre_trial_checklist__",
      ),
    [items, categoryId],
  );

  const checklist = (slot?.meta?.checklist ?? {}) as Record<string, boolean>;

  const toggle = (key: string) => {
    if (!canEdit) return;
    const next = { ...checklist, [key]: !checklist[key] };
    if (slot) {
      updateItem(slot.id, { meta: { ...slot.meta, checklist: next } });
    } else {
      addItem({
        category_id: categoryId,
        tab: "trial_notes",
        block_type: "note",
        title: "__pre_trial_checklist__",
        meta: { checklist: next },
        sort_order: -1,
      });
    }
  };

  const checkedCount = PRE_TRIAL_CHECKLIST.filter((c) => checklist[c.key]).length;

  return (
    <PanelCard
      icon={<ListChecks size={14} strokeWidth={1.8} />}
      title="Bring to your trial"
      badge={
        <span
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {checkedCount}/{PRE_TRIAL_CHECKLIST.length}
        </span>
      }
    >
      <ul className="grid grid-cols-1 gap-1.5 md:grid-cols-2">
        {PRE_TRIAL_CHECKLIST.map((c) => {
          const checked = Boolean(checklist[c.key]);
          return (
            <li key={c.key}>
              <button
                type="button"
                onClick={() => toggle(c.key)}
                disabled={!canEdit}
                className="group flex w-full items-center gap-2.5 rounded-md border border-transparent px-2 py-1.5 text-left hover:border-border hover:bg-ivory-warm/30 disabled:cursor-not-allowed"
              >
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
                    checked
                      ? "border-sage bg-sage text-white"
                      : "border-ink-faint bg-white group-hover:border-saffron",
                  )}
                >
                  {checked && <Check size={11} strokeWidth={2.5} />}
                </span>
                <span
                  className={cn(
                    "text-[12.5px]",
                    checked ? "text-ink-faint line-through" : "text-ink",
                  )}
                >
                  {c.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </PanelCard>
  );
}

// ── Approved-look banner ─────────────────────────────────────────────────

function ApprovedLookBanner({ approved }: { approved: WorkspaceItem[] }) {
  return (
    <div className="rounded-lg border-2 border-sage bg-sage-pale/30 p-4">
      <div className="flex items-center gap-2">
        <CheckCircle2 size={16} strokeWidth={1.8} className="text-sage" />
        <Eyebrow>Locked in</Eyebrow>
      </div>
      <p className="mt-1 text-[13px] text-ink">
        {approved.length} look{approved.length === 1 ? " is" : "s are"} approved.
        These are the recipes the artist works from on wedding day.
      </p>
      <ul className="mt-2 space-y-1">
        {approved.map((a) => {
          const meta = (a.meta ?? {}) as TrialMeta;
          return (
            <li key={a.id} className="text-[12.5px] text-ink-muted">
              <span className="text-ink">{a.title}</span>
              {meta.event_target ? (
                <span className="ml-2 italic">→ {meta.event_target}</span>
              ) : null}
              {meta.products && meta.products.length > 0 ? (
                <span
                  className="ml-2 font-mono text-[10px] text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  · {meta.products.length} products
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ── Trial history summary ────────────────────────────────────────────────
// At-a-glance list when the couple logs more than one trial. Each row is
// a small card showing what the trial was for and where it landed.

function TrialHistoryTable({ trials }: { trials: WorkspaceItem[] }) {
  return (
    <PanelCard
      icon={<ListChecks size={14} strokeWidth={1.8} />}
      title="Trial history"
      badge={
        <span
          className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {trials.length} trials logged
        </span>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-[12px]">
          <thead className="bg-ivory-warm/40 text-left">
            <tr>
              <Th>Date</Th>
              <Th>Look type</Th>
              <Th>Artist</Th>
              <Th>Decision</Th>
            </tr>
          </thead>
          <tbody>
            {trials.map((t, i) => {
              const meta = (t.meta ?? {}) as TrialMeta;
              const decision = meta.decision ?? "pending";
              return (
                <tr key={t.id} className="border-t border-border/60">
                  <td className="px-2 py-1.5">
                    <span
                      className="font-mono text-[11px] text-ink-muted"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {meta.date || `Trial #${i + 1}`}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-[12px] text-ink">
                    {meta.event_target
                      ? `${meta.event_target} look`
                      : t.title || "—"}
                  </td>
                  <td className="px-2 py-1.5 text-[12px] text-ink-muted">
                    {meta.artist || "—"}
                  </td>
                  <td className="px-2 py-1.5">
                    <span
                      className={cn(
                        "inline-flex rounded-sm px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em]",
                        DECISION_TONE[decision],
                      )}
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {DECISION_LABEL[decision]}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PanelCard>
  );
}

// ── Trial card ───────────────────────────────────────────────────────────

function TrialCard({
  trial,
  index,
  canEdit,
}: {
  trial: WorkspaceItem;
  index: number;
  canEdit: boolean;
}) {
  const updateItem = useWorkspaceStore((s) => s.updateItem);
  const deleteItem = useWorkspaceStore((s) => s.deleteItem);
  const meta = (trial.meta ?? {}) as TrialMeta;
  const decision = meta.decision ?? "pending";

  const [open, setOpen] = useState(decision === "pending" || index === 0);

  const patchMeta = (patch: Partial<TrialMeta>) => {
    updateItem(trial.id, { meta: { ...(trial.meta ?? {}), ...patch } });
  };

  return (
    <article
      className={cn(
        "rounded-lg border bg-white shadow-[0_1px_1px_rgba(26,26,26,0.03)]",
        decision === "approved"
          ? "border-sage/60"
          : decision === "wrong"
            ? "border-rose/30"
            : "border-border",
      )}
    >
      {/* Header */}
      <header className="border-b border-border/60 px-5 py-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex-1 min-w-[220px]">
            <input
              value={trial.title}
              disabled={!canEdit}
              onChange={(e) => updateItem(trial.id, { title: e.target.value })}
              className="w-full bg-transparent font-serif text-[18px] leading-tight text-ink focus:outline-none disabled:opacity-60"
              placeholder={`Trial #${index + 1}`}
            />
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-sm px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em]",
                DECISION_TONE[decision],
              )}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {DECISION_LABEL[decision]}
            </span>
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="text-ink-muted hover:text-ink"
              aria-label={open ? "Collapse trial" : "Expand trial"}
            >
              {open ? (
                <ChevronDown size={16} strokeWidth={1.8} />
              ) : (
                <ChevronRight size={16} strokeWidth={1.8} />
              )}
            </button>
            {canEdit && (
              <button
                type="button"
                onClick={() => deleteItem(trial.id)}
                className="text-ink-faint hover:text-rose"
                aria-label="Delete trial"
              >
                <Trash2 size={13} strokeWidth={1.8} />
              </button>
            )}
          </div>
        </div>

        {/* Trial log header grid */}
        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-5">
          <HeaderField label="Date">
            <input
              type="date"
              value={meta.date ?? ""}
              disabled={!canEdit}
              onChange={(e) => patchMeta({ date: e.target.value })}
              className="w-full rounded-sm border border-border bg-white px-1.5 py-1 font-mono text-[11px] text-ink-muted focus:border-saffron focus:outline-none disabled:opacity-60"
              style={{ fontFamily: "var(--font-mono)" }}
            />
          </HeaderField>
          <HeaderField label="Artist">
            <input
              value={meta.artist ?? ""}
              disabled={!canEdit}
              onChange={(e) => patchMeta({ artist: e.target.value })}
              placeholder="Anaya Kapoor"
              className="w-full rounded-sm border border-border bg-white px-1.5 py-1 text-[11.5px] text-ink focus:border-saffron focus:outline-none disabled:opacity-60"
            />
          </HeaderField>
          <HeaderField label="Location">
            <input
              value={meta.location ?? ""}
              disabled={!canEdit}
              onChange={(e) => patchMeta({ location: e.target.value })}
              placeholder="Artist studio, Frisco"
              className="w-full rounded-sm border border-border bg-white px-1.5 py-1 text-[11.5px] text-ink focus:border-saffron focus:outline-none disabled:opacity-60"
            />
          </HeaderField>
          <HeaderField label="Duration">
            <input
              value={meta.duration ?? ""}
              disabled={!canEdit}
              onChange={(e) => patchMeta({ duration: e.target.value })}
              placeholder="2h 30m"
              className="w-full rounded-sm border border-border bg-white px-1.5 py-1 text-[11.5px] text-ink focus:border-saffron focus:outline-none disabled:opacity-60"
            />
          </HeaderField>
          <HeaderField label="Look type">
            <select
              value={meta.event_target ?? ""}
              disabled={!canEdit}
              onChange={(e) => patchMeta({ event_target: e.target.value })}
              className="w-full rounded-sm border border-border bg-white px-1.5 py-1 text-[11.5px] text-ink focus:border-saffron focus:outline-none disabled:opacity-60"
            >
              <option value="">—</option>
              {WEDDING_EVENTS.map((ev) => (
                <option key={ev.id} value={ev.label}>
                  {ev.label} look
                </option>
              ))}
            </select>
          </HeaderField>
        </div>
      </header>

      {open && (
        <div className="space-y-5 px-5 py-4">
          {/* Decision toggles */}
          <DecisionToggles
            value={decision}
            onChange={(d) => patchMeta({ decision: d })}
            canEdit={canEdit}
          />

          {/* Photos */}
          <PhotoGrid
            photos={meta.photos ?? []}
            canEdit={canEdit}
            onChange={(photos) => patchMeta({ photos })}
          />

          {/* Lighting test */}
          <LightingTestSection
            test={meta.lighting_test}
            canEdit={canEdit}
            onChange={(lighting_test) => patchMeta({ lighting_test })}
          />

          {/* Product recipe */}
          <ProductTable
            products={meta.products ?? []}
            canEdit={canEdit}
            onChange={(products) => patchMeta({ products })}
          />

          {/* Hair notes */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Hair notes (style, products, pin placement)">
              <textarea
                value={meta.hair_notes ?? ""}
                disabled={!canEdit}
                onChange={(e) => patchMeta({ hair_notes: e.target.value })}
                rows={3}
                placeholder="Side French braid into low bun, hidden U-pins along braid, dupatta pinned at crown with 6 large pins…"
                className="w-full resize-none rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
              />
            </Field>
            <Field label="Pin count (yes — really)">
              <input
                type="number"
                min={0}
                value={meta.pin_count ?? ""}
                disabled={!canEdit}
                onChange={(e) =>
                  patchMeta({
                    pin_count: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                placeholder="e.g. 28"
                className="w-32 rounded-md border border-border bg-white px-2.5 py-1.5 font-mono text-[12.5px] text-ink focus:border-saffron focus:outline-none disabled:opacity-60"
                style={{ fontFamily: "var(--font-mono)" }}
              />
              <p className="mt-1 text-[10.5px] italic text-ink-faint">
                Running out of pins on the morning is a real problem.
              </p>
            </Field>
          </div>

          {/* Feedback — 3-way split per spec */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Field label="What worked">
              <textarea
                value={meta.loved ?? ""}
                disabled={!canEdit}
                onChange={(e) => patchMeta({ loved: e.target.value })}
                rows={3}
                placeholder="Loved the eye look — the soft gold shimmer was exactly right. Skin looked flawless in natural light."
                className="w-full resize-none rounded-md border border-sage/30 bg-sage-pale/20 px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-sage focus:outline-none disabled:opacity-60"
              />
            </Field>
            <Field label="What to change">
              <textarea
                value={meta.changed ?? ""}
                disabled={!canEdit}
                onChange={(e) => patchMeta({ changed: e.target.value })}
                rows={3}
                placeholder="Lip too pink — want something warmer, more brick/terracotta. Contour a touch heavy on cheekbones."
                className="w-full resize-none rounded-md border border-rose/30 bg-rose-pale/20 px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-rose focus:outline-none disabled:opacity-60"
              />
            </Field>
            <Field label="What to keep exactly the same">
              <textarea
                value={meta.kept ?? ""}
                disabled={!canEdit}
                onChange={(e) => patchMeta({ kept: e.target.value })}
                rows={3}
                placeholder="Base/foundation shade was perfect. Brow shape. The way she draped the dupatta — don't change that."
                className="w-full resize-none rounded-md border border-saffron/30 bg-saffron-pale/20 px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
              />
            </Field>
          </div>

          {/* Allergies / sensitivities noted during trial */}
          <Field label="Allergies / sensitivities noticed">
            <input
              value={meta.allergies ?? ""}
              disabled={!canEdit}
              onChange={(e) => patchMeta({ allergies: e.target.value })}
              placeholder="None / mild reaction to [product] — swap for…"
              className="w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
            />
          </Field>

          <Field label="Longevity test — how did the look hold up?">
            <textarea
              value={meta.longevity ?? ""}
              disabled={!canEdit}
              onChange={(e) => patchMeta({ longevity: e.target.value })}
              rows={2}
              placeholder="Wore for 6 hrs. By hour 3, lip faded in the center. By hour 5, eye started transferring."
              className="w-full resize-none rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
            />
          </Field>

          <RatingBar
            value={meta.rating ?? 0}
            canEdit={canEdit}
            onChange={(r) => patchMeta({ rating: r })}
          />
        </div>
      )}
    </article>
  );
}

// ── Decision toggles ─────────────────────────────────────────────────────

function DecisionToggles({
  value,
  onChange,
  canEdit,
}: {
  value: TrialDecision;
  onChange: (d: TrialDecision) => void;
  canEdit: boolean;
}) {
  const decisions: TrialDecision[] = ["pending", "close", "wrong", "approved"];
  return (
    <div>
      <Eyebrow>Decision</Eyebrow>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {decisions.map((d) => {
          const active = value === d;
          return (
            <button
              key={d}
              type="button"
              disabled={!canEdit}
              onClick={() => onChange(d)}
              className={cn(
                "rounded-md px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors",
                active
                  ? DECISION_TONE[d]
                  : "border border-border bg-white text-ink-faint hover:border-saffron/40 hover:text-saffron",
                !canEdit && "cursor-not-allowed opacity-60",
              )}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {DECISION_LABEL[d]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Rating bar ────────────────────────────────────────────────────────────

function RatingBar({
  value,
  canEdit,
  onChange,
}: {
  value: number;
  canEdit: boolean;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Eyebrow>Rating</Eyebrow>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => {
          const active = n <= value;
          return (
            <button
              key={n}
              type="button"
              disabled={!canEdit}
              onClick={() => onChange(active && value === n ? n - 1 : n)}
              className={cn(
                "h-5 w-5 rounded-sm transition-colors",
                active ? "bg-saffron" : "bg-ivory-warm hover:bg-saffron-pale/60",
                !canEdit && "cursor-not-allowed opacity-60",
              )}
              aria-label={`${n} of 5`}
            />
          );
        })}
      </div>
      <span
        className="font-mono text-[10.5px] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {value > 0 ? `${value}/5` : "—"}
      </span>
    </div>
  );
}

// ── Photo grid ────────────────────────────────────────────────────────────
// 4 angle slots + 3 lighting slots = 7 conceptual slots. We keep it simple:
// a list of {url, angle, lighting} rows the user can add to. URL paste only —
// no actual upload pipeline yet.

const PHOTO_ANGLES = ["Front", "Left side", "Right side", "Back", "Eyes", "Lips", "Hair detail"];
const PHOTO_LIGHTING = ["Natural light", "With flash", "Warm indoor", "Outdoor shade"];

function PhotoGrid({
  photos,
  canEdit,
  onChange,
}: {
  photos: TrialPhotoRow[];
  canEdit: boolean;
  onChange: (next: TrialPhotoRow[]) => void;
}) {
  const [draft, setDraft] = useState({ url: "", angle: PHOTO_ANGLES[0]!, lighting: PHOTO_LIGHTING[0]! });

  const add = () => {
    if (!draft.url.trim()) return;
    onChange([
      ...photos,
      {
        id: `photo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
        url: draft.url.trim(),
        angle: draft.angle,
        lighting: draft.lighting,
      },
    ]);
    setDraft({ url: "", angle: PHOTO_ANGLES[0]!, lighting: PHOTO_LIGHTING[0]! });
  };

  const remove = (id: string) => onChange(photos.filter((p) => p.id !== id));

  return (
    <div>
      <div className="flex items-center gap-2">
        <Eyebrow>Photos</Eyebrow>
        <span className="font-mono text-[10px] text-ink-faint" style={{ fontFamily: "var(--font-mono)" }}>
          aim for 4 angles + 3 lightings
        </span>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
        {photos.map((p) => (
          <figure
            key={p.id}
            className="group relative overflow-hidden rounded-md border border-border bg-ivory-warm"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt={p.angle} className="h-28 w-full object-cover" />
            <figcaption className="px-1.5 py-1 text-[10px] text-ink-muted">
              <span className="font-medium text-ink">{p.angle}</span>
              <span className="mx-1 text-ink-faint">·</span>
              {p.lighting}
            </figcaption>
            {canEdit && (
              <button
                type="button"
                onClick={() => remove(p.id)}
                className="absolute right-1 top-1 rounded-full bg-white/85 p-0.5 text-ink-muted opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
                aria-label="Remove photo"
              >
                <X size={11} strokeWidth={2} />
              </button>
            )}
          </figure>
        ))}

        {photos.length === 0 && (
          <div className="col-span-full">
            <EmptyRow>No photos yet — paste image URLs from the trial.</EmptyRow>
          </div>
        )}
      </div>

      {canEdit && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5 rounded-md border border-dashed border-border bg-ivory-warm/30 p-2">
          <ImageIcon size={12} strokeWidth={1.8} className="text-ink-faint" />
          <input
            value={draft.url}
            onChange={(e) => setDraft({ ...draft, url: e.target.value })}
            placeholder="Paste image URL"
            className="flex-1 min-w-[180px] rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink focus:border-saffron focus:outline-none"
          />
          <select
            value={draft.angle}
            onChange={(e) => setDraft({ ...draft, angle: e.target.value })}
            className="rounded-sm border border-border bg-white px-1.5 py-1 text-[11px] text-ink focus:border-saffron focus:outline-none"
          >
            {PHOTO_ANGLES.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
          <select
            value={draft.lighting}
            onChange={(e) => setDraft({ ...draft, lighting: e.target.value })}
            className="rounded-sm border border-border bg-white px-1.5 py-1 text-[11px] text-ink focus:border-saffron focus:outline-none"
          >
            {PHOTO_LIGHTING.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={add}
            disabled={!draft.url.trim()}
            className={cn(
              "inline-flex items-center gap-1 rounded-sm px-2.5 py-1 text-[11px] font-medium",
              draft.url.trim()
                ? "bg-ink text-ivory hover:opacity-90"
                : "bg-ivory-warm text-ink-faint",
            )}
          >
            <Plus size={11} strokeWidth={2} />
            Add
          </button>
        </div>
      )}
    </div>
  );
}

// ── Lighting test ─────────────────────────────────────────────────────────
// How did the makeup read in each lighting condition? Artists re-check the
// base and powder against these notes so the wedding-day look holds up in
// every environment — morning ceremony, indoor mandap, flash photos, sendoff.

function LightingTestSection({
  test,
  canEdit,
  onChange,
}: {
  test: LightingTest | undefined;
  canEdit: boolean;
  onChange: (next: LightingTest) => void;
}) {
  const current: LightingTest = {
    daylight: test?.daylight ?? { checked: false, notes: "" },
    indoor: test?.indoor ?? { checked: false, notes: "" },
    flash: test?.flash ?? { checked: false, notes: "" },
    golden_hour: test?.golden_hour ?? { checked: false, notes: "" },
  };

  const patch = (key: LightingCondition, patch: Partial<LightingTestRow>) =>
    onChange({ ...current, [key]: { ...current[key], ...patch } });

  return (
    <div>
      <div className="flex items-center gap-2">
        <Eyebrow>Lighting test</Eyebrow>
        <span
          className="font-mono text-[10px] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          does the look hold up everywhere?
        </span>
      </div>

      <div className="mt-2 space-y-1.5">
        {LIGHTING_TEST_ROWS.map((row) => {
          const value = current[row.key];
          return (
            <div
              key={row.key}
              className="flex flex-wrap items-start gap-2 rounded-md border border-border bg-white px-3 py-2"
            >
              <label className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  checked={value.checked}
                  disabled={!canEdit}
                  onChange={(e) => patch(row.key, { checked: e.target.checked })}
                  className="h-3.5 w-3.5 rounded-sm border-border text-saffron focus:ring-saffron disabled:opacity-60"
                />
                <span className="min-w-[170px] text-[12.5px] font-medium text-ink">
                  {row.label}
                </span>
                <span
                  className="hidden font-mono text-[10px] text-ink-faint md:inline"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {row.hint}
                </span>
              </label>
              <input
                value={value.notes}
                disabled={!canEdit}
                onChange={(e) => patch(row.key, { notes: e.target.value })}
                placeholder="e.g. base read slightly warm — try a half-shade cooler"
                className="flex-1 min-w-[220px] rounded-sm border border-border bg-ivory-warm/40 px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:bg-white focus:outline-none disabled:opacity-60"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Product table ────────────────────────────────────────────────────────

function ProductTable({
  products,
  canEdit,
  onChange,
}: {
  products: TrialProductRow[];
  canEdit: boolean;
  onChange: (next: TrialProductRow[]) => void;
}) {
  const [draft, setDraft] = useState({
    category: DEFAULT_PRODUCT_CATEGORIES[0]!,
    brand: "",
    shade: "",
    notes: "",
  });

  const add = () => {
    if (!draft.brand.trim() && !draft.shade.trim()) return;
    onChange([
      ...products,
      {
        id: `prod-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
        ...draft,
        brand: draft.brand.trim(),
        shade: draft.shade.trim(),
        notes: draft.notes.trim(),
      },
    ]);
    setDraft({
      category: DEFAULT_PRODUCT_CATEGORIES[0]!,
      brand: "",
      shade: "",
      notes: "",
    });
  };

  const update = (id: string, patch: Partial<TrialProductRow>) =>
    onChange(products.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const remove = (id: string) => onChange(products.filter((p) => p.id !== id));

  const autoFillFromArtist = () => {
    if (!canEdit) return;
    const existingCategories = new Set(products.map((p) => p.category));
    const toAdd = ARTIST_SEED_ROWS.filter(
      (r) => !existingCategories.has(r.category),
    ).map((r) => ({
      id: `prod-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      category: r.category,
      brand: r.brand,
      shade: r.shade,
      notes: "",
    }));
    if (toAdd.length === 0) return;
    onChange([...products, ...toAdd]);
  };

  // Group products by display group in spec order, with Other last.
  const groupOrder = [...PRODUCT_CATEGORY_GROUPS.map((g) => g.group), "Other"];
  const grouped = groupOrder.map((group) => ({
    group,
    rows: products.filter((p) => groupLabelFor(p.category) === group),
  }));

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Eyebrow>Product recipe</Eyebrow>
          <span
            className="font-mono text-[10px] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            this is what the artist replicates exactly
          </span>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={autoFillFromArtist}
            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.08em] text-saffron hover:underline"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <span aria-hidden>✦</span>
            Auto-fill from artist
          </button>
        )}
      </div>

      <div className="mt-2 overflow-x-auto rounded-md border border-border">
        <table className="w-full min-w-[640px] text-[12px]">
          <thead className="bg-ivory-warm/50 text-left">
            <tr>
              <Th>Category</Th>
              <Th>Brand</Th>
              <Th>Shade / detail</Th>
              <Th>Application notes</Th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-3 text-[12px] italic text-ink-faint">
                  No products yet — tap "Auto-fill from artist" to seed
                  rows, or add your own below.
                </td>
              </tr>
            ) : (
              grouped.flatMap(({ group, rows }) =>
                rows.length === 0
                  ? []
                  : [
                      <tr key={`group-${group}`} className="bg-saffron-pale/20">
                        <td
                          colSpan={5}
                          className="px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-saffron"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {group}
                        </td>
                      </tr>,
                      ...rows.map((p) => (
                <tr key={p.id} className="border-t border-border/60">
                  <td className="px-2 py-1.5">
                    <input
                      value={p.category}
                      disabled={!canEdit}
                      onChange={(e) => update(p.id, { category: e.target.value })}
                      list="hmua-product-categories"
                      className="w-full bg-transparent text-[12px] text-ink focus:outline-none disabled:opacity-60"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      value={p.brand}
                      disabled={!canEdit}
                      onChange={(e) => update(p.id, { brand: e.target.value })}
                      placeholder="e.g. Charlotte Tilbury"
                      className="w-full bg-transparent text-[12px] text-ink focus:outline-none disabled:opacity-60"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      value={p.shade}
                      disabled={!canEdit}
                      onChange={(e) => update(p.id, { shade: e.target.value })}
                      placeholder="e.g. Pillow Talk Original"
                      className="w-full bg-transparent text-[12px] text-ink focus:outline-none disabled:opacity-60"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      value={p.notes}
                      disabled={!canEdit}
                      onChange={(e) => update(p.id, { notes: e.target.value })}
                      placeholder="e.g. brush, blended out"
                      className="w-full bg-transparent text-[11.5px] italic text-ink-muted focus:outline-none disabled:opacity-60"
                    />
                  </td>
                  <td className="px-1 py-1.5 text-right">
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => remove(p.id)}
                        className="text-ink-faint hover:text-rose"
                        aria-label="Remove product"
                      >
                        <Trash2 size={11} strokeWidth={1.8} />
                      </button>
                    )}
                  </td>
                </tr>
              )),
                    ],
              )
            )}
          </tbody>
        </table>
      </div>

      <datalist id="hmua-product-categories">
        {DEFAULT_PRODUCT_CATEGORIES.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      {canEdit && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5 rounded-md border border-dashed border-border bg-ivory-warm/30 p-2">
          <select
            value={draft.category}
            onChange={(e) => setDraft({ ...draft, category: e.target.value })}
            className="rounded-sm border border-border bg-white px-1.5 py-1 text-[11px] text-ink focus:border-saffron focus:outline-none"
          >
            {DEFAULT_PRODUCT_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <input
            value={draft.brand}
            onChange={(e) => setDraft({ ...draft, brand: e.target.value })}
            placeholder="Brand"
            className="w-32 rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink focus:border-saffron focus:outline-none"
          />
          <input
            value={draft.shade}
            onChange={(e) => setDraft({ ...draft, shade: e.target.value })}
            placeholder="Shade"
            className="flex-1 min-w-[140px] rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink focus:border-saffron focus:outline-none"
          />
          <input
            value={draft.notes}
            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            placeholder="Notes (optional)"
            className="flex-1 min-w-[160px] rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink focus:border-saffron focus:outline-none"
          />
          <button
            type="button"
            onClick={add}
            className="inline-flex items-center gap-1 rounded-sm bg-ink px-2.5 py-1 text-[11px] font-medium text-ivory hover:opacity-90"
          >
            <Plus size={11} strokeWidth={2} />
            Add
          </button>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="px-2 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-ink-faint"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </th>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Eyebrow>{label}</Eyebrow>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function HeaderField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <span
        className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </span>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}
