"use client";

// ── Phase 3 · Outfit Curation ──────────────────────────────────────────────
// One card per look. Style direction for each partner, coordination notes,
// hair/makeup guidance, and a linked item list per look. The sticky feature.

import { useMemo } from "react";
import { Plus, Trash2, Shirt } from "lucide-react";
import { useEngagementShootStore } from "@/stores/engagement-shoot-store";
import {
  ITEM_CATEGORY_LABEL,
  ITEM_STATUS_LABEL,
  STYLE_LABEL,
  type Look,
  type LookOwner,
  type OutfitItem,
  type OutfitItemCategory,
  type OutfitItemStatus,
  type OutfitStyle,
} from "@/types/engagement-shoot";
import {
  InlineEdit,
  Label,
  PhaseStepper,
  Section,
  formatMoney,
} from "../ui";

export function OutfitBoardTab() {
  const looks = useEngagementShootStore((s) => s.looks);
  const addLook = useEngagementShootStore((s) => s.addLook);

  const sorted = [...looks].sort((a, b) => a.index - b.index);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <PhaseStepper phase={3} count={6} label="Style & wardrobe" />
        <h2 className="font-serif text-[24px] leading-tight text-ink">
          The Outfit Board
        </h2>
        <p className="max-w-2xl text-[13.5px] leading-relaxed text-ink-muted">
          One card per look. Style direction, coordination between partners,
          hair + makeup, and the items you've pinned, shopped, or ordered. This
          becomes your packing list on shoot day.
        </p>
      </header>

      <CoordinationTips />

      <div className="space-y-5">
        {sorted.map((look) => (
          <LookCard key={look.id} look={look} />
        ))}
      </div>

      <button
        type="button"
        onClick={() => addLook()}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border bg-ivory-warm/30 py-4 text-[12.5px] font-medium text-ink-muted transition-colors hover:border-saffron/40 hover:text-saffron"
      >
        <Plus size={13} strokeWidth={2} />
        Add another look
      </button>
    </div>
  );
}

// ── Coordination tips ──────────────────────────────────────────────────────

function CoordinationTips() {
  return (
    <Section
      eyebrow="STYLING NOTES"
      title="Coordinating without matching"
      tone="muted"
    >
      <ul className="grid gap-2.5 text-[13px] leading-relaxed text-ink md:grid-cols-2">
        <li className="rounded-md bg-white p-3">
          <strong className="text-ink">Color:</strong> coordinate, don't match.
          Emerald + ivory reads intentional; emerald + emerald looks costumed.
        </li>
        <li className="rounded-md bg-white p-3">
          <strong className="text-ink">Formality:</strong> both partners should be
          at the same level — a tux with jeans reads like a mismatch. A saree
          next to shorts doesn't work.
        </li>
        <li className="rounded-md bg-white p-3">
          <strong className="text-ink">Photographs well:</strong> solids and rich
          textures over small patterns. Big prints are fine — especially in
          traditional attire, where the pattern IS the point.
        </li>
        <li className="rounded-md bg-white p-3">
          <strong className="text-ink">Heavy = hot:</strong> plan traditional
          looks with zardozi and heavy jewelry for the coolest shooting window.
          60–90 minutes max per heavy look.
        </li>
      </ul>
    </Section>
  );
}

// ── Look card ──────────────────────────────────────────────────────────────

function LookCard({ look }: { look: Look }) {
  const update = useEngagementShootStore((s) => s.updateLook);
  const remove = useEngagementShootStore((s) => s.removeLook);
  const locations = useEngagementShootStore((s) => s.locations);
  const allOutfitItems = useEngagementShootStore((s) => s.outfitItems);
  const items = useMemo(
    () => allOutfitItems.filter((i) => i.lookId === look.id),
    [allOutfitItems, look.id],
  );
  const addItem = useEngagementShootStore((s) => s.addOutfitItem);

  const spend = items.reduce((sum, item) => sum + item.priceCents, 0);

  return (
    <section className="rounded-lg border border-border bg-white">
      <header className="flex items-start justify-between gap-4 border-b border-border/70 p-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="rounded-full border border-saffron/50 bg-saffron/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Look {look.index}
            </span>
            <select
              value={look.style}
              onChange={(e) =>
                update(look.id, { style: e.target.value as OutfitStyle })
              }
              className="rounded-md border border-transparent bg-transparent px-1 py-0.5 text-[11.5px] text-ink-muted hover:border-border"
            >
              {Object.entries(STYLE_LABEL).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <InlineEdit
            value={look.name}
            onChange={(v) => update(look.id, { name: v })}
            className="mt-1.5 font-serif text-[19px] leading-tight text-ink"
          />
          <InlineEdit
            multiline
            value={look.concept}
            onChange={(v) => update(look.id, { concept: v })}
            placeholder="What is this look for? How does it feel?"
            className="mt-1 text-[13px] leading-relaxed text-ink-muted"
          />
        </div>
        <button
          type="button"
          onClick={() => remove(look.id)}
          aria-label="Remove look"
          className="shrink-0 text-ink-faint hover:text-rose"
        >
          <Trash2 size={13} strokeWidth={1.8} />
        </button>
      </header>

      <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
        <div>
          <Label>Partner 1 direction</Label>
          <InlineEdit
            multiline
            value={look.partner1Direction}
            onChange={(v) => update(look.id, { partner1Direction: v })}
            placeholder="Silhouette, color, fabric, accessories..."
            className="mt-1 min-h-[90px] border border-border bg-white px-3 py-2"
          />
        </div>
        <div>
          <Label>Partner 2 direction</Label>
          <InlineEdit
            multiline
            value={look.partner2Direction}
            onChange={(v) => update(look.id, { partner2Direction: v })}
            placeholder="Tailoring, color, shoes, accessories..."
            className="mt-1 min-h-[90px] border border-border bg-white px-3 py-2"
          />
        </div>

        <div>
          <Label>Coordination notes</Label>
          <InlineEdit
            multiline
            value={look.coordination.notes}
            onChange={(v) =>
              update(look.id, {
                coordination: { ...look.coordination, notes: v },
              })
            }
            placeholder="How the two outfits work together on camera."
            className="mt-1 min-h-[60px] border border-border bg-white px-3 py-2"
          />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <input
              type="text"
              value={look.coordination.colorP1}
              onChange={(e) =>
                update(look.id, {
                  coordination: {
                    ...look.coordination,
                    colorP1: e.target.value,
                  },
                })
              }
              placeholder="P1 color"
              className="rounded-md border border-border bg-white px-2 py-1 text-[12px] text-ink focus:border-saffron/60 focus:outline-none"
            />
            <input
              type="text"
              value={look.coordination.colorP2}
              onChange={(e) =>
                update(look.id, {
                  coordination: {
                    ...look.coordination,
                    colorP2: e.target.value,
                  },
                })
              }
              placeholder="P2 color"
              className="rounded-md border border-border bg-white px-2 py-1 text-[12px] text-ink focus:border-saffron/60 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <Label>Hair & makeup</Label>
          <InlineEdit
            multiline
            value={look.hairMakeupNote}
            onChange={(v) => update(look.id, { hairMakeupNote: v })}
            placeholder="How this look wants to be styled — hair, makeup, timing."
            className="mt-1 min-h-[60px] border border-border bg-white px-3 py-2"
          />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <select
              value={look.locationSlotId ?? ""}
              onChange={(e) =>
                update(look.id, {
                  locationSlotId: e.target.value || null,
                })
              }
              className="rounded-md border border-border bg-white px-2 py-1 text-[12px] text-ink focus:border-saffron/60 focus:outline-none"
            >
              <option value="">Location — unassigned</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={0}
              step={5}
              value={look.estimatedMinutes}
              onChange={(e) =>
                update(look.id, {
                  estimatedMinutes: Number(e.target.value) || 0,
                })
              }
              placeholder="Minutes"
              className="rounded-md border border-border bg-white px-2 py-1 text-[12px] text-ink focus:border-saffron/60 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-border/70 p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shirt size={13} strokeWidth={1.8} className="text-ink-muted" />
            <h4
              className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Items for this look
            </h4>
            {items.length > 0 && (
              <span className="text-[11.5px] text-ink-faint">
                {items.length} · {formatMoney(spend)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => addItem(look.id, { owner: "p1" })}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-2 py-1 text-[11.5px] text-ink-muted hover:border-saffron/40 hover:text-saffron"
          >
            <Plus size={11} strokeWidth={2} />
            Add item
          </button>
        </div>

        {items.length === 0 ? (
          <p className="text-[12.5px] italic text-ink-faint">
            No items yet — paste a link, upload a screenshot, or just sketch it
            in words.
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <OutfitItemRow key={item.id} item={item} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

// ── Outfit item row ────────────────────────────────────────────────────────

function OutfitItemRow({ item }: { item: OutfitItem }) {
  const update = useEngagementShootStore((s) => s.updateOutfitItem);
  const remove = useEngagementShootStore((s) => s.removeOutfitItem);

  const statusTone =
    item.status === "ready" || item.status === "altered"
      ? "bg-sage/15 text-sage"
      : item.status === "ordered" || item.status === "arrived"
        ? "bg-gold-pale/60 text-gold"
        : "bg-ivory-warm/60 text-ink-muted";

  return (
    <li className="group grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-2 rounded-md border border-border/70 bg-ivory-warm/20 px-3 py-2">
      <select
        value={item.owner}
        onChange={(e) => update(item.id, { owner: e.target.value as LookOwner })}
        className="shrink-0 rounded-sm border border-border bg-white px-1.5 py-0.5 text-[10.5px] text-ink-muted focus:border-saffron/60 focus:outline-none"
        aria-label="Owner"
      >
        <option value="p1">P1</option>
        <option value="p2">P2</option>
        <option value="both">Both</option>
      </select>

      <div className="min-w-0">
        <InlineEdit
          value={item.title}
          onChange={(v) => update(item.id, { title: v })}
          placeholder="Item name"
        />
        {item.note !== undefined && (
          <InlineEdit
            value={item.note ?? ""}
            onChange={(v) => update(item.id, { note: v })}
            placeholder="Note — arrival date, alteration needed..."
            className="text-[11.5px] text-ink-muted"
          />
        )}
      </div>

      <select
        value={item.category}
        onChange={(e) =>
          update(item.id, { category: e.target.value as OutfitItemCategory })
        }
        className="shrink-0 rounded-md border border-transparent bg-transparent px-1 text-[11px] text-ink-muted hover:border-border"
        aria-label="Category"
      >
        {Object.entries(ITEM_CATEGORY_LABEL).map(([k, label]) => (
          <option key={k} value={k}>
            {label}
          </option>
        ))}
      </select>

      <input
        type="number"
        min={0}
        value={item.priceCents ? Math.round(item.priceCents / 100) : ""}
        onChange={(e) =>
          update(item.id, {
            priceCents: Number(e.target.value) * 100 || 0,
          })
        }
        placeholder="$"
        className="w-20 shrink-0 rounded-md border border-border bg-white px-2 py-0.5 text-right text-[11.5px] text-ink tabular-nums focus:border-saffron/60 focus:outline-none"
      />

      <select
        value={item.status}
        onChange={(e) =>
          update(item.id, { status: e.target.value as OutfitItemStatus })
        }
        className={`shrink-0 rounded-sm px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${statusTone}`}
        style={{ fontFamily: "var(--font-mono)" }}
        aria-label="Status"
      >
        {Object.entries(ITEM_STATUS_LABEL).map(([k, label]) => (
          <option key={k} value={k}>
            {label}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => remove(item.id)}
        aria-label="Remove item"
        className="shrink-0 text-ink-faint opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
      >
        <Trash2 size={12} strokeWidth={1.8} />
      </button>
    </li>
  );
}
