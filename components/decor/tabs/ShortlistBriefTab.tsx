"use client";

// ── Tab 3: Shortlist & Brief ────────────────────────────────────────────────
// Where discovery becomes a plan. The brief is the same brief from Vision &
// Mood (single source). Loved elements roll up by space. Floral summary
// aggregates per-event floral choices. Vendor shortlist stays here; contract
// management lives in the global Vendors module.

import { useMemo, useState } from "react";
import { useDecorStore, formatPriceRange } from "@/stores/decor-store";
import {
  DECOR_COLORS,
  FONT_DISPLAY,
  FONT_UI,
  FONT_MONO,
  SectionHead,
  Block,
  Paper,
  SparklePill,
  TextArea,
  GhostButton,
  EmptyState,
  StatusPill,
} from "../primitives";
import {
  DECOR_ELEMENTS,
  FLORAL_PALETTE_OPTIONS,
} from "../catalog";
import type { EventDayId } from "@/types/checklist";
import type { DecorSpaceCard, VendorState } from "@/types/decor";
import { VENDOR_STATE_LABELS } from "@/types/decor";

const EVENT_LABELS: Partial<Record<EventDayId, string>> = {
  haldi: "Haldi",
  mehndi: "Mehendi",
  sangeet: "Sangeet",
  wedding: "Wedding",
  reception: "Reception",
  welcome: "Welcome",
  ganesh_puja: "Ganesh Puja",
  post_brunch: "Post-wedding brunch",
};

const DECOR_BUDGET_TOTAL = 150000;

export function ShortlistBriefTab() {
  return (
    <div>
      <BriefBlock />
      <ElementShortlist />
      <FloralSummary />
      <VendorShortlist />
      <BudgetSnapshot />
    </div>
  );
}

// ── Brief (shared with Vision & Mood) ───────────────────────────────────────
function BriefBlock() {
  const brief = useDecorStore((s) => s.brief);
  const setBrief = useDecorStore((s) => s.setBrief);
  const keywords = useDecorStore((s) => s.style_keywords);
  const [loading, setLoading] = useState(false);

  async function generateBrief() {
    setLoading(true);
    try {
      const context = keywords.length > 0 ? `Style keywords: ${keywords.join(", ")}.` : "";
      const prompt = `Write a 3-4 sentence wedding décor brief. ${context} ${brief ? `Current draft: "${brief}"` : ""} Be evocative, specific, and concrete — describe textures, lighting, mood, and feeling.`;
      const res = await fetch("/api/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, context: "You are an expert wedding décor consultant writing a brief for the couple's decorator." }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.result) setBrief(data.result);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Block>
      <SectionHead
        eyebrow="The document your decorator reads first"
        title="Your Décor Brief"
        body="Captures everything you've explored across Vision & Mood and Spaces & Florals."
      >
        <SparklePill onClick={generateBrief} label={loading ? "Writing…" : undefined} />
      </SectionHead>
      <Paper className="p-5">
        <p
          className="mb-3 text-[11.5px] italic"
          style={{ fontFamily: FONT_DISPLAY, color: DECOR_COLORS.cocoaFaint }}
        >
          This is what your decorator receives. Also editable from Vision & Mood.
        </p>
        <TextArea
          value={brief}
          onChange={setBrief}
          rows={8}
          placeholder="Click to write a brief — a few sentences about what your wedding world should feel like."
        />
      </Paper>
    </Block>
  );
}

// ── Element shortlist (loved items grouped by space) ───────────────────────
function ElementShortlist() {
  const spaces = useDecorStore((s) => s.space_cards);
  return (
    <Block>
      <SectionHead
        eyebrow="Loved from the space explorer"
        title="Element shortlist"
        body="Everything you've marked ♡ Love, grouped by where it lives."
      />
      <div className="space-y-4">
        {spaces.map((space) => (
          <SpaceShortlistGroup key={space.id} space={space} />
        ))}
      </div>
    </Block>
  );
}

function SpaceShortlistGroup({ space }: { space: DecorSpaceCard }) {
  const lovedIds = Object.entries(space.element_reactions)
    .filter(([, r]) => r === "love")
    .map(([id]) => id);
  const loved = DECOR_ELEMENTS.filter((el) => lovedIds.includes(el.id));
  const eventLabels = space.event_ids
    .map((e) => EVENT_LABELS[e] ?? e)
    .join(" · ");

  return (
    <Paper className="p-5">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <div>
          <div
            className="text-[16px]"
            style={{
              fontFamily: FONT_DISPLAY,
              color: DECOR_COLORS.cocoa,
              fontWeight: 500,
            }}
          >
            {space.name}
          </div>
          {eventLabels && (
            <div
              className="mt-0.5 text-[10.5px] uppercase"
              style={{
                fontFamily: FONT_MONO,
                letterSpacing: "0.16em",
                color: DECOR_COLORS.cocoaFaint,
              }}
            >
              {eventLabels}
            </div>
          )}
        </div>
      </div>

      {loved.length === 0 ? (
        <EmptyState>
          Nothing loved yet — head to Spaces & Florals to react to elements.
        </EmptyState>
      ) : (
        <ul className="space-y-1.5">
          {loved.map((el) => (
            <li
              key={el.id}
              className="flex items-center justify-between gap-3 text-[13px]"
              style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoaSoft }}
            >
              <span>✓ {el.name}</span>
              {el.price_range_low != null && el.price_range_high != null && (
                <span
                  className="text-[11px]"
                  style={{ fontFamily: FONT_MONO, color: DECOR_COLORS.cocoaFaint }}
                >
                  {formatPriceRange(el.price_range_low, el.price_range_high)}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </Paper>
  );
}

// ── Floral summary ─────────────────────────────────────────────────────────
function FloralSummary() {
  const floral = useDecorStore((s) => s.floral_by_event);
  return (
    <Block>
      <SectionHead
        eyebrow="Florals, rolled up"
        title="Floral summary by event"
        body="Quick reference for your florist — palette, style, and scale at a glance."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {floral.map((f) => {
          const lovedPaletteIds = Object.entries(f.palette_reactions)
            .filter(([, r]) => r === "love")
            .map(([id]) => id);
          const lovedPalettes = FLORAL_PALETTE_OPTIONS.filter((p) =>
            lovedPaletteIds.includes(p.id),
          );
          return (
            <Paper key={f.event_id} className="p-4">
              <div
                className="text-[14px]"
                style={{
                  fontFamily: FONT_DISPLAY,
                  color: DECOR_COLORS.cocoa,
                  fontWeight: 500,
                }}
              >
                {EVENT_LABELS[f.event_id] ?? f.event_id}
              </div>
              <div className="mt-2">
                <div
                  className="text-[10.5px] uppercase"
                  style={{
                    fontFamily: FONT_MONO,
                    letterSpacing: "0.14em",
                    color: DECOR_COLORS.cocoaFaint,
                  }}
                >
                  Palette
                </div>
                {lovedPalettes.length === 0 ? (
                  <div
                    className="text-[12px] italic"
                    style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoaFaint }}
                  >
                    No palette loved yet
                  </div>
                ) : (
                  <div className="mt-1 space-y-1.5">
                    {lovedPalettes.map((p) => (
                      <div key={p.id} className="flex items-center gap-2">
                        <div className="flex h-4 w-16 overflow-hidden rounded-sm">
                          {p.hexes.map((h, i) => (
                            <div
                              key={`${p.id}-${i}`}
                              className="flex-1"
                              style={{ backgroundColor: h }}
                            />
                          ))}
                        </div>
                        <span
                          className="text-[12px]"
                          style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoaSoft }}
                        >
                          {p.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-3">
                <div
                  className="text-[10.5px] uppercase"
                  style={{
                    fontFamily: FONT_MONO,
                    letterSpacing: "0.14em",
                    color: DECOR_COLORS.cocoaFaint,
                  }}
                >
                  Style
                </div>
                <div
                  className="text-[12px]"
                  style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoaSoft }}
                >
                  {f.arrangement_keywords.length === 0
                    ? "—"
                    : f.arrangement_keywords.join(", ")}
                </div>
              </div>
              <div className="mt-3">
                <div
                  className="text-[10.5px] uppercase"
                  style={{
                    fontFamily: FONT_MONO,
                    letterSpacing: "0.14em",
                    color: DECOR_COLORS.cocoaFaint,
                  }}
                >
                  Scale
                </div>
                <div
                  className="text-[12px]"
                  style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoaSoft }}
                >
                  {f.scale < 34
                    ? "Intimate & detailed"
                    : f.scale < 67
                      ? "Balanced"
                      : "Grand & statement"}
                </div>
              </div>
            </Paper>
          );
        })}
      </div>
    </Block>
  );
}

// ── Vendor shortlist ───────────────────────────────────────────────────────
function VendorShortlist() {
  const vendors = useDecorStore((s) => s.vendors);
  const addVendor = useDecorStore((s) => s.addVendor);
  const setState = useDecorStore((s) => s.setVendorState);
  const removeVendor = useDecorStore((s) => s.removeVendor);

  const stateKind: Record<VendorState, "neutral" | "progress" | "review" | "approved" | "blocked"> = {
    considering: "neutral",
    shortlisted: "progress",
    deciding: "review",
    picked: "approved",
    booked: "approved",
    ruled_out: "blocked",
  };

  return (
    <Block>
      <SectionHead
        eyebrow="Who could bring this to life"
        title="Decorator & florist shortlist"
        body="Contract management and bookings live in the global Vendors module."
      >
        <GhostButton onClick={addVendor}>+ Add vendor</GhostButton>
      </SectionHead>

      {vendors.length === 0 ? (
        <EmptyState>No vendors added yet — use + Add vendor to start.</EmptyState>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {vendors.map((v) => (
            <Paper key={v.id} className="p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <input
                  type="text"
                  value={v.name}
                  onChange={(e) =>
                    useDecorStore
                      .getState()
                      .updateVendor(v.id, { name: e.target.value })
                  }
                  className="flex-1 bg-transparent text-[15px] outline-none"
                  style={{
                    fontFamily: FONT_DISPLAY,
                    color: DECOR_COLORS.cocoa,
                    fontWeight: 500,
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeVendor(v.id)}
                  className="shrink-0 text-[14px] opacity-40 hover:opacity-100"
                  style={{ color: DECOR_COLORS.cocoaMuted }}
                  aria-label="Remove vendor"
                >
                  ×
                </button>
              </div>

              {v.portfolio_images.length > 0 && (
                <div className="mb-2 grid grid-cols-4 gap-1">
                  {v.portfolio_images.slice(0, 4).map((url, i) => (
                    <img
                      key={`${v.id}-${i}`}
                      src={url}
                      alt="Portfolio"
                      className="aspect-square w-full rounded-sm object-cover"
                      loading="lazy"
                    />
                  ))}
                </div>
              )}

              {v.portfolio_highlights && (
                <div
                  className="text-[12px] leading-snug"
                  style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoaMuted }}
                >
                  {v.portfolio_highlights}
                </div>
              )}

              <div className="mt-3 flex items-center justify-between gap-2">
                <span
                  className="text-[12px]"
                  style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoa }}
                >
                  {formatPriceRange(v.price_low, v.price_high)}
                </span>
                <select
                  value={v.state}
                  onChange={(e) =>
                    setState(v.id, e.target.value as VendorState)
                  }
                  className="rounded-full border bg-white px-2 py-0.5 text-[10.5px] uppercase outline-none"
                  style={{
                    fontFamily: FONT_MONO,
                    letterSpacing: "0.12em",
                    borderColor: DECOR_COLORS.line,
                    color: DECOR_COLORS.cocoaSoft,
                  }}
                >
                  {(Object.keys(VENDOR_STATE_LABELS) as VendorState[]).map(
                    (st) => (
                      <option key={st} value={st}>
                        {VENDOR_STATE_LABELS[st]}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div className="mt-2">
                <StatusPill kind={stateKind[v.state]}>
                  {VENDOR_STATE_LABELS[v.state]}
                </StatusPill>
              </div>
            </Paper>
          ))}
        </div>
      )}
    </Block>
  );
}

// ── Budget snapshot ────────────────────────────────────────────────────────
function BudgetSnapshot() {
  const spaces = useDecorStore((s) => s.space_cards);
  const vendors = useDecorStore((s) => s.vendors);

  const shortlistedTotal = useMemo(() => {
    let low = 0;
    let high = 0;
    for (const space of spaces) {
      const lovedIds = Object.entries(space.element_reactions)
        .filter(([, r]) => r === "love")
        .map(([id]) => id);
      for (const el of DECOR_ELEMENTS.filter((e) => lovedIds.includes(e.id))) {
        low += el.price_range_low ?? 0;
        high += el.price_range_high ?? 0;
      }
    }
    return { low, high };
  }, [spaces]);

  const bookedVendorLow = vendors
    .filter((v) => v.state === "booked" || v.state === "picked")
    .reduce((sum, v) => sum + (v.price_low ?? 0), 0);

  const estimated = Math.round((shortlistedTotal.low + shortlistedTotal.high) / 2);

  return (
    <Block>
      <SectionHead
        eyebrow="Where you stand"
        title="Budget snapshot"
        body="Rough estimates from loved elements vs. your décor allocation."
      />
      <Paper className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <BudgetStat
            label="Loved elements estimate"
            value={formatPriceRange(shortlistedTotal.low, shortlistedTotal.high)}
            sub={`Midpoint ${formatUsd(estimated)}`}
          />
          <BudgetStat
            label="Vendor bookings (picked / booked)"
            value={formatUsd(bookedVendorLow)}
            sub={`${vendors.filter((v) => v.state === "booked" || v.state === "picked").length} vendors`}
          />
          <BudgetStat
            label="Décor budget"
            value={formatUsd(DECOR_BUDGET_TOTAL)}
            sub="From Finance workspace"
          />
        </div>
      </Paper>
    </Block>
  );
}

function BudgetStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div>
      <div
        className="text-[10.5px] uppercase"
        style={{
          fontFamily: FONT_MONO,
          letterSpacing: "0.16em",
          color: DECOR_COLORS.cocoaFaint,
        }}
      >
        {label}
      </div>
      <div
        className="mt-1 text-[20px]"
        style={{
          fontFamily: FONT_DISPLAY,
          color: DECOR_COLORS.cocoa,
          fontWeight: 500,
        }}
      >
        {value}
      </div>
      <div
        className="mt-0.5 text-[11.5px]"
        style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoaMuted }}
      >
        {sub}
      </div>
    </div>
  );
}

function formatUsd(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return `$${n}`;
}
