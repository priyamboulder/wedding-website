// ──────────────────────────────────────────────────────────────────────────
// Budget tool — pure calculation engine.
//
// Given the seeded `budget_vendor_tiers` (base USD at 1.0 multiplier), the
// chosen location (multiplier), per-event guest counts, per-row tier
// overrides, and selected add-ons, derive a fully itemized plan total.
//
// The functions here are pure — no React, no Supabase, no DOM. They take
// the reference catalog (categories + tier templates + addons + culture
// events) plus the user's selections and return numbers + line items.
// ──────────────────────────────────────────────────────────────────────────

import type {
  BudgetAddonRow,
  BudgetCultureEventRow,
  BudgetTier,
  BudgetVendorTierRow,
} from "@/types/budget";
import type { VendorCategoryRow } from "@/types/vendors";

// ── Inputs ────────────────────────────────────────────────────────────────

export interface CalculatorInputs {
  // Reference catalog — comes from the server.
  events: BudgetCultureEventRow[];
  categories: VendorCategoryRow[];
  tiers: BudgetVendorTierRow[];
  addons: BudgetAddonRow[];

  // The user's choices.
  multiplier: number;
  guestCounts: Record<string, number>;          // event_slug -> count
  vendorTiers: Record<string, BudgetTier>;       // selectionKey -> tier
  selectedAddons: Record<string, true>;          // selectionKey -> selected
  globalTier: BudgetTier;
}

// ── Output line items ─────────────────────────────────────────────────────

export interface VendorLineItem {
  key: string;                       // selectionKey
  scope: "per_event" | "wedding_wide";
  eventSlug: string | null;          // null = wedding-wide
  eventName: string | null;
  categorySlug: string;
  categoryName: string;
  categoryIcon: string;
  groupName: string;
  tier: BudgetTier;
  guestCount: number | null;         // for per_guest items, the count used
  perGuest: boolean;
  baseCost: number;                  // base × multiplier (× 1)
  cost: number;                      // final dollar amount
}

export interface AddonLineItem {
  key: string;
  scope: "per_event" | "wedding_wide";
  eventSlug: string | null;
  eventName: string | null;
  addonSlug: string;
  addonName: string;
  addonIcon: string;
  category: string;
  perGuest: boolean;
  guestCount: number | null;
  cost: number;
}

export interface EventBreakdown {
  event: BudgetCultureEventRow;
  guestCount: number;
  vendors: VendorLineItem[];
  addons: AddonLineItem[];
  subtotal: number;
}

export interface BudgetSummary {
  events: EventBreakdown[];
  weddingWideVendors: VendorLineItem[];
  weddingWideAddons: AddonLineItem[];
  totals: {
    events: number;
    weddingWide: number;
    addons: number;
    grand: number;
  };
}

// ── Selection key helpers ─────────────────────────────────────────────────

export const WEDDING_WIDE_KEY = "__ww__";

export function vendorSelectionKey(
  eventSlug: string | null,
  categorySlug: string,
): string {
  return `v:${eventSlug ?? WEDDING_WIDE_KEY}|${categorySlug}`;
}

export function addonSelectionKey(
  eventSlug: string | null,
  addonSlug: string,
): string {
  return `a:${eventSlug ?? WEDDING_WIDE_KEY}|${addonSlug}`;
}

// ── Tier resolution ──────────────────────────────────────────────────────

function tierFor(
  inputs: CalculatorInputs,
  eventSlug: string | null,
  categorySlug: string,
): BudgetTier {
  const key = vendorSelectionKey(eventSlug, categorySlug);
  return inputs.vendorTiers[key] ?? inputs.globalTier;
}

function findTierTemplate(
  inputs: CalculatorInputs,
  categoryId: string,
  tier: BudgetTier,
): BudgetVendorTierRow | undefined {
  return inputs.tiers.find(
    (t) => t.vendor_category_id === categoryId && t.tier === tier,
  );
}

// ── Core math ────────────────────────────────────────────────────────────

function round(value: number): number {
  return Math.round(value);
}

function maxGuestCount(
  events: BudgetCultureEventRow[],
  guestCounts: Record<string, number>,
): number {
  let max = 0;
  for (const e of events) {
    const g = guestCounts[e.slug] ?? e.default_guests;
    if (g > max) max = g;
  }
  return max;
}

function computeVendorLine(
  inputs: CalculatorInputs,
  category: VendorCategoryRow,
  eventSlug: string | null,
  eventName: string | null,
  guestCount: number | null,
): VendorLineItem | null {
  const tier = tierFor(inputs, eventSlug, category.slug);
  const template = findTierTemplate(inputs, category.id, tier);
  if (!template) return null;

  const base = template.base_cost_usd * inputs.multiplier;
  const cost = round(category.per_guest && guestCount != null ? base * guestCount : base);

  return {
    key: vendorSelectionKey(eventSlug, category.slug),
    scope: category.scope,
    eventSlug,
    eventName,
    categorySlug: category.slug,
    categoryName: category.name,
    categoryIcon: category.icon,
    groupName: category.group_name,
    tier,
    guestCount: category.per_guest ? guestCount : null,
    perGuest: category.per_guest,
    baseCost: round(base),
    cost,
  };
}

function computeAddonLine(
  inputs: CalculatorInputs,
  addon: BudgetAddonRow,
  eventSlug: string | null,
  eventName: string | null,
  guestCount: number | null,
): AddonLineItem {
  const base = addon.base_cost_usd * inputs.multiplier;
  const cost = round(addon.per_guest && guestCount != null ? base * guestCount : base);
  return {
    key: addonSelectionKey(eventSlug, addon.slug),
    scope: addon.scope,
    eventSlug,
    eventName,
    addonSlug: addon.slug,
    addonName: addon.name,
    addonIcon: addon.icon,
    category: addon.category,
    perGuest: addon.per_guest,
    guestCount: addon.per_guest ? guestCount : null,
    cost,
  };
}

// ── Public: derive the full summary ──────────────────────────────────────

export function computeBudget(inputs: CalculatorInputs): BudgetSummary {
  const maxGuests = maxGuestCount(inputs.events, inputs.guestCounts);

  const perEventCategories = inputs.categories.filter((c) => c.scope === "per_event");
  const weddingWideCategories = inputs.categories.filter((c) => c.scope === "wedding_wide");

  // ── Per-event breakdowns ──────────────────────────────────────────────
  const events: EventBreakdown[] = [];
  for (const event of inputs.events) {
    const guestCount = inputs.guestCounts[event.slug] ?? event.default_guests;

    const vendors: VendorLineItem[] = [];
    for (const cat of perEventCategories) {
      // Skip ceremony-only categories on non-ceremony events.
      if (cat.ceremony_only && !event.ceremony) continue;
      const line = computeVendorLine(inputs, cat, event.slug, event.name, guestCount);
      if (line) vendors.push(line);
    }

    const addons: AddonLineItem[] = [];
    for (const addon of inputs.addons) {
      if (addon.scope !== "per_event") continue;
      const key = addonSelectionKey(event.slug, addon.slug);
      if (!inputs.selectedAddons[key]) continue;
      addons.push(computeAddonLine(inputs, addon, event.slug, event.name, guestCount));
    }

    const subtotal =
      vendors.reduce((sum, v) => sum + v.cost, 0) +
      addons.reduce((sum, a) => sum + a.cost, 0);

    events.push({ event, guestCount, vendors, addons, subtotal });
  }

  // ── Wedding-wide vendors ──────────────────────────────────────────────
  const weddingWideVendors: VendorLineItem[] = [];
  for (const cat of weddingWideCategories) {
    const guestCount = cat.per_guest ? maxGuests : null;
    const line = computeVendorLine(inputs, cat, null, null, guestCount);
    if (line) weddingWideVendors.push(line);
  }

  // ── Wedding-wide add-ons ──────────────────────────────────────────────
  const weddingWideAddons: AddonLineItem[] = [];
  for (const addon of inputs.addons) {
    if (addon.scope !== "wedding_wide") continue;
    const key = addonSelectionKey(null, addon.slug);
    if (!inputs.selectedAddons[key]) continue;
    const guestCount = addon.per_guest ? maxGuests : null;
    weddingWideAddons.push(computeAddonLine(inputs, addon, null, null, guestCount));
  }

  // ── Totals ─────────────────────────────────────────────────────────────
  const eventsTotal = events.reduce((sum, e) => sum + e.subtotal, 0);
  const weddingWideTotal = weddingWideVendors.reduce((sum, v) => sum + v.cost, 0);
  const addonsTotal = weddingWideAddons.reduce((sum, a) => sum + a.cost, 0);
  // Per-event addons are folded into their event subtotal already, so
  // expose them separately here for the chip row that says "Add-Ons $X".
  const perEventAddonsTotal = events.reduce(
    (sum, e) => sum + e.addons.reduce((s, a) => s + a.cost, 0),
    0,
  );

  return {
    events,
    weddingWideVendors,
    weddingWideAddons,
    totals: {
      events: eventsTotal - perEventAddonsTotal,
      weddingWide: weddingWideTotal,
      addons: addonsTotal + perEventAddonsTotal,
      grand: eventsTotal + weddingWideTotal + addonsTotal,
    },
  };
}

// ── Per-tier cost preview (used by the tier selector buttons) ────────────

export function tierCostFor(
  inputs: Pick<CalculatorInputs, "tiers" | "multiplier">,
  category: Pick<VendorCategoryRow, "id" | "per_guest">,
  tier: BudgetTier,
  guestCount: number | null,
): number {
  const template = inputs.tiers.find(
    (t) => t.vendor_category_id === category.id && t.tier === tier,
  );
  if (!template) return 0;
  const base = template.base_cost_usd * inputs.multiplier;
  if (category.per_guest && guestCount != null) return Math.round(base * guestCount);
  return Math.round(base);
}
