"use client";

// ── Vendor checklist editor ────────────────────────────────────────────────
// The bride manages her vendor checklist + per-row visibility + master
// privacy toggle. Lives in the Settings sub-tab. Each category row expands
// inline to set status, budget, notes, style, urgency. "Looking" rows
// appear on the vendor-side discovery feed (filtered by category) along
// with the bride's wedding context — vendors can express interest, which
// surfaces in the Vendor Interest inbox section below.

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Eye, EyeOff, Lock, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";
import { useVendorNeedsStore } from "@/stores/vendor-needs-store";
import {
  BUDGET_RANGES,
  URGENCY_OPTIONS,
  VENDOR_NEED_CATEGORIES,
  getVendorNeedCategory,
} from "@/types/vendor-needs";
import type {
  BudgetRange,
  CommunityVendorNeed,
  VendorNeedCategorySlug,
  VendorNeedStatus,
  VendorNeedUrgency,
} from "@/types/vendor-needs";

const STATUS_LABEL: Record<VendorNeedStatus, { label: string; emoji: string }> = {
  looking:    { label: "Looking",    emoji: "🟡" },
  booked:     { label: "Booked",     emoji: "✅" },
  not_needed: { label: "Not needed", emoji: "⚪" },
};

export function VendorChecklistEditor() {
  const myProfileId = useCommunityProfilesStore((s) => s.myProfileId);
  const allNeeds = useVendorNeedsStore((s) => s.needs);
  const ensureChecklistFor = useVendorNeedsStore((s) => s.ensureChecklistFor);
  const upsertNeed = useVendorNeedsStore((s) => s.upsertNeed);
  const removeNeed = useVendorNeedsStore((s) => s.removeNeed);
  const setNeedVisibility = useVendorNeedsStore((s) => s.setNeedVisibility);
  const setDiscoverable = useVendorNeedsStore((s) => s.setDiscoverable);
  const isDiscoverable = useVendorNeedsStore((s) => s.isDiscoverable);

  // Pre-populate the top-10 categories on first mount.
  useEffect(() => {
    if (myProfileId) ensureChecklistFor(myProfileId);
  }, [myProfileId, ensureChecklistFor]);

  const myNeeds = useMemo(
    () =>
      myProfileId
        ? allNeeds
            .filter((n) => n.profile_id === myProfileId)
            .sort((a, b) => {
              const ca = getVendorNeedCategory(a.category_slug)?.sort_order ?? 99;
              const cb = getVendorNeedCategory(b.category_slug)?.sort_order ?? 99;
              return ca - cb;
            })
        : [],
    [allNeeds, myProfileId],
  );

  const usedSlugs = useMemo(
    () => new Set(myNeeds.map((n) => n.category_slug)),
    [myNeeds],
  );

  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAddPicker, setShowAddPicker] = useState(false);

  if (!myProfileId) return null;

  const discoverable = isDiscoverable(myProfileId);

  return (
    <div className="space-y-4">
      <ul className="divide-y divide-gold/10 overflow-hidden rounded-xl border border-gold/15 bg-white">
        {myNeeds.map((need) => {
          const cat = getVendorNeedCategory(need.category_slug);
          if (!cat) return null;
          const isOpen = expanded === need.id;
          return (
            <li key={need.id}>
              <NeedRow
                need={need}
                isOpen={isOpen}
                onToggle={() => setExpanded(isOpen ? null : need.id)}
              />
              {isOpen && (
                <NeedEditor
                  need={need}
                  onSave={(draft) => upsertNeed(myProfileId, need.category_slug, draft)}
                  onRemove={() => {
                    if (confirm(`Remove ${cat.label} from your checklist?`)) {
                      removeNeed(need.id);
                      setExpanded(null);
                    }
                  }}
                  onToggleVisibility={() =>
                    setNeedVisibility(need.id, !need.is_visible_to_vendors)
                  }
                  onClose={() => setExpanded(null)}
                />
              )}
            </li>
          );
        })}
      </ul>

      {/* Add categories */}
      {!showAddPicker ? (
        <button
          type="button"
          onClick={() => setShowAddPicker(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-gold/30 bg-white px-4 py-1.5 text-[12.5px] font-medium text-ink-muted transition-colors hover:border-saffron/40 hover:text-ink"
        >
          <Plus size={13} strokeWidth={1.8} />
          Add more categories
        </button>
      ) : (
        <CategoryPicker
          excludedSlugs={usedSlugs}
          onAdd={(slug) => {
            upsertNeed(myProfileId, slug, { status: "looking" });
            setShowAddPicker(false);
          }}
          onClose={() => setShowAddPicker(false)}
        />
      )}

      {/* Master privacy */}
      <div className="mt-6 rounded-xl border border-gold/20 bg-ivory-warm/30 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-serif text-[16px] font-medium text-ink">
              Let vendors discover me
            </p>
            <p className="mt-1.5 max-w-md text-[12.5px] leading-[1.55] text-ink-muted">
              {discoverable
                ? "vendors can see your 'looking' categories, wedding city, date, and guest count. they cannot see your full profile or contact info unless you respond to their interest."
                : "you're hidden from vendor discovery. vendors can't see what you're looking for or reach out."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDiscoverable(myProfileId, !discoverable)}
            className={cn(
              "shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[12.5px] font-medium transition-colors",
              discoverable
                ? "border border-border bg-white text-ink-muted hover:border-rose/40 hover:text-rose"
                : "bg-ink text-ivory hover:bg-ink-soft",
            )}
          >
            {discoverable ? (
              <>
                <Lock size={13} strokeWidth={1.8} />
                Turn off
              </>
            ) : (
              <>
                <Eye size={13} strokeWidth={1.8} />
                Turn on
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Single row (collapsed view) ────────────────────────────────────────────

function NeedRow({
  need,
  isOpen,
  onToggle,
}: {
  need: CommunityVendorNeed;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const cat = getVendorNeedCategory(need.category_slug);
  if (!cat) return null;
  const status = STATUS_LABEL[need.status];

  const summary: string | null = (() => {
    if (need.status === "looking") {
      const bits: string[] = [];
      if (need.budget_range) {
        const b = BUDGET_RANGES.find((r) => r.id === need.budget_range);
        if (b) bits.push(b.label);
      }
      if (need.preferred_style) bits.push(need.preferred_style);
      if (bits.length === 0 && need.notes) {
        return need.notes.length > 60
          ? need.notes.slice(0, 60) + "…"
          : need.notes;
      }
      return bits.length ? bits.join(" · ") : null;
    }
    if (need.status === "booked") {
      return need.booked_vendor_name
        ? `${need.booked_vendor_name} (booked)`
        : "Booked";
    }
    return "not needed";
  })();

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-ivory-warm/30",
        isOpen && "bg-ivory-warm/40",
      )}
    >
      <span className="text-[18px]" aria-hidden>
        {cat.emoji}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-medium text-ink">{cat.label}</p>
        {summary && (
          <p className="mt-0.5 truncate text-[12px] text-ink-muted">{summary}</p>
        )}
      </div>
      {need.status === "looking" && (
        <span
          className={cn(
            "inline-flex items-center gap-1 text-[10.5px] font-medium",
            need.is_visible_to_vendors ? "text-saffron" : "text-ink-faint",
          )}
          aria-label={
            need.is_visible_to_vendors ? "Visible to vendors" : "Hidden"
          }
        >
          {need.is_visible_to_vendors ? (
            <Eye size={11} strokeWidth={1.8} />
          ) : (
            <EyeOff size={11} strokeWidth={1.8} />
          )}
        </span>
      )}
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-0.5 text-[10.5px] font-medium text-ink-muted ring-1 ring-gold/15">
        <span aria-hidden>{status.emoji}</span>
        {status.label}
      </span>
      <ChevronDown
        size={14}
        strokeWidth={1.6}
        className={cn(
          "text-ink-faint transition-transform",
          isOpen && "rotate-180",
        )}
      />
    </button>
  );
}

// ── Expanded editor ─────────────────────────────────────────────────────────

function NeedEditor({
  need,
  onSave,
  onRemove,
  onToggleVisibility,
  onClose,
}: {
  need: CommunityVendorNeed;
  onSave: (draft: {
    status?: VendorNeedStatus;
    budget_range?: BudgetRange;
    notes?: string;
    preferred_style?: string;
    urgency?: VendorNeedUrgency;
    booked_vendor_name?: string;
    is_visible_to_vendors?: boolean;
  }) => void;
  onRemove: () => void;
  onToggleVisibility: () => void;
  onClose: () => void;
}) {
  return (
    <div className="border-t border-gold/10 bg-ivory-warm/20 px-4 py-5">
      {/* Status */}
      <Field label="Status">
        <div className="flex flex-wrap gap-2">
          {(["looking", "booked", "not_needed"] as VendorNeedStatus[]).map(
            (s) => {
              const selected = need.status === s;
              const meta = STATUS_LABEL[s];
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSave({ status: s })}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-medium transition-colors",
                    selected
                      ? "border-ink bg-ink text-ivory"
                      : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-ink",
                  )}
                >
                  <span aria-hidden>{meta.emoji}</span>
                  {meta.label}
                </button>
              );
            },
          )}
        </div>
      </Field>

      {need.status === "looking" && (
        <>
          <Field label="Budget">
            <div className="flex flex-wrap gap-2">
              {BUDGET_RANGES.map((b) => {
                const selected = need.budget_range === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() =>
                      onSave({ budget_range: selected ? undefined : b.id })
                    }
                    className={cn(
                      "rounded-full border px-3 py-1 text-[12px] font-medium transition-colors",
                      selected
                        ? "border-ink bg-ink text-ivory"
                        : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-ink",
                    )}
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Style preferences">
            <input
              type="text"
              defaultValue={need.preferred_style ?? ""}
              onBlur={(e) =>
                onSave({ preferred_style: e.target.value || undefined })
              }
              placeholder="editorial, candid, cinematic…"
              className={inputClass}
            />
          </Field>

          <Field label="Notes for vendors">
            <textarea
              rows={3}
              defaultValue={need.notes ?? ""}
              onBlur={(e) => onSave({ notes: e.target.value || undefined })}
              placeholder="anything specific you're hoping for — venue, language, scope…"
              maxLength={400}
              className={cn(inputClass, "resize-none leading-[1.5]")}
            />
          </Field>

          <Field label="Urgency">
            <div className="flex flex-wrap gap-2">
              {URGENCY_OPTIONS.map((u) => {
                const selected = need.urgency === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => onSave({ urgency: u.id })}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-medium transition-colors",
                      selected
                        ? "border-ink bg-ink text-ivory"
                        : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-ink",
                    )}
                    title={u.helper}
                  >
                    <span aria-hidden>{u.emoji}</span>
                    {u.label}
                  </button>
                );
              })}
            </div>
          </Field>

          <div className="mt-4 flex items-center justify-between rounded-lg bg-white px-3 py-2.5 ring-1 ring-gold/15">
            <div>
              <p className="text-[12.5px] font-medium text-ink">
                Visible to vendors
              </p>
              <p className="mt-0.5 text-[11.5px] text-ink-muted">
                {need.is_visible_to_vendors
                  ? "vendors in this category can see this need."
                  : "hidden — vendors can't see this row."}
              </p>
            </div>
            <button
              type="button"
              onClick={onToggleVisibility}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11.5px] font-medium transition-colors",
                need.is_visible_to_vendors
                  ? "border-saffron/30 bg-saffron/10 text-saffron"
                  : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-ink",
              )}
            >
              {need.is_visible_to_vendors ? (
                <>
                  <Eye size={11} strokeWidth={1.8} />
                  Visible
                </>
              ) : (
                <>
                  <EyeOff size={11} strokeWidth={1.8} />
                  Hidden
                </>
              )}
            </button>
          </div>
        </>
      )}

      {need.status === "booked" && (
        <Field label="Vendor name (optional)">
          <input
            type="text"
            defaultValue={need.booked_vendor_name ?? ""}
            onBlur={(e) =>
              onSave({ booked_vendor_name: e.target.value || undefined })
            }
            placeholder="who'd you book?"
            className={inputClass}
          />
        </Field>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-gold/10 pt-4">
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-1.5 text-[11.5px] text-ink-faint transition-colors hover:text-rose"
        >
          <Trash2 size={11} strokeWidth={1.8} />
          remove from checklist
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-[12.5px] font-medium text-ink-muted transition-colors hover:text-ink"
        >
          Done
        </button>
      </div>
    </div>
  );
}

// ── Add-category picker ─────────────────────────────────────────────────────

function CategoryPicker({
  excludedSlugs,
  onAdd,
  onClose,
}: {
  excludedSlugs: Set<VendorNeedCategorySlug>;
  onAdd: (slug: VendorNeedCategorySlug) => void;
  onClose: () => void;
}) {
  const available = VENDOR_NEED_CATEGORIES.filter(
    (c) => !excludedSlugs.has(c.slug),
  );
  return (
    <div className="rounded-xl border border-gold/20 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="font-serif text-[15px] italic text-ink">
          add a category
        </p>
        <button
          type="button"
          onClick={onClose}
          className="text-ink-muted transition-colors hover:text-ink"
          aria-label="Close"
        >
          <X size={14} strokeWidth={1.8} />
        </button>
      </div>
      {available.length === 0 ? (
        <p className="mt-4 text-[12.5px] italic text-ink-muted">
          you've added every category. nice work.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {available.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => onAdd(c.slug)}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-left text-[12.5px] text-ink transition-colors hover:border-saffron/40 hover:bg-ivory-warm/40"
            >
              <span className="text-[15px]" aria-hidden>
                {c.emoji}
              </span>
              <span className="truncate">{c.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Primitives ─────────────────────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <p className="mb-1.5 text-[11.5px] font-medium uppercase tracking-[0.12em] text-ink-faint">
        {label}
      </p>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink placeholder:text-ink-faint focus:border-saffron/60 focus:outline-none focus:ring-2 focus:ring-saffron/15";
