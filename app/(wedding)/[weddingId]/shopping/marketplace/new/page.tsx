"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TopNav } from "@/components/shell/TopNav";
import { ExhibitionBanner } from "@/components/exhibitions/ExhibitionBanner";
import {
  useMarketplaceStore,
  CURRENT_USER_ID,
  CURRENT_USER_NAME,
} from "@/stores/marketplace-store";
import {
  Eyebrow,
  MarketplaceTabBar,
} from "@/components/marketplace/primitives";
import { useCoupleIdentity } from "@/lib/couple-identity";
import {
  CONDITION_LABELS,
  LISTING_TYPE_LABELS,
  type ListingCondition,
  type ListingType,
  type MarketplaceCategory,
} from "@/types/marketplace";
import { CLOTHING_CATEGORIES } from "@/lib/marketplace/utils";

type Step = 1 | 2 | 3 | 4 | 5;

interface DraftState {
  category: string | null;
  subcategory?: string;
  listing_type: ListingType;

  gradients: string[];  // stand-ins for photo uploads

  title: string;
  description: string;
  condition: ListingCondition;
  size: string;
  color: string;
  brand: string;
  original_price: string;
  times_used: string;
  purchase_year: string;

  price: string;
  rental_deposit: string;
  rental_duration_days: string;
  price_is_negotiable: boolean;

  city: string;
  state: string;
  country: "India" | "USA";
  local_pickup: boolean;
  shipping_available: boolean;
  shipping_notes: string;

  tags: string[];
  share_to_community: boolean;
}

const GRADIENT_PALETTE: string[] = [
  "linear-gradient(135deg, #8B2635 0%, #C83E4D 40%, #E8A598 100%)",
  "linear-gradient(135deg, #B8860B 0%, #D4A843 50%, #F0E4C8 100%)",
  "linear-gradient(135deg, #C97B63 0%, #E8A598 50%, #F5E0D3 100%)",
  "linear-gradient(135deg, #2C5F5D 0%, #4A8D89 50%, #A8CFCC 100%)",
  "linear-gradient(135deg, #E8DCC4 0%, #F0E4C8 50%, #F8F3E8 100%)",
  "linear-gradient(135deg, #6B4C6E 0%, #A188A8 50%, #D9C8DC 100%)",
  "linear-gradient(135deg, #5B7553 0%, #8DA886 50%, #CDD9C5 100%)",
  "linear-gradient(135deg, #C9452E 0%, #D4A843 50%, #F0E4C8 100%)",
  "linear-gradient(135deg, #D2789C 0%, #E8B0C7 50%, #F6DCE8 100%)",
];

function initialDraft(): DraftState {
  return {
    category: null,
    subcategory: undefined,
    listing_type: "sell",
    gradients: [],
    title: "",
    description: "",
    condition: "like_new",
    size: "",
    color: "",
    brand: "",
    original_price: "",
    times_used: "1",
    purchase_year: String(new Date().getFullYear()),
    price: "",
    rental_deposit: "",
    rental_duration_days: "7",
    price_is_negotiable: true,
    city: "",
    state: "",
    country: "India",
    local_pickup: true,
    shipping_available: false,
    shipping_notes: "",
    tags: [],
    share_to_community: false,
  };
}

export default function NewListingPage({
  params,
}: {
  params: Promise<{ weddingId: string }>;
}) {
  const { weddingId } = use(params);
  const router = useRouter();
  const categoriesAll = useMarketplaceStore((s) => s.categories);
  const createListing = useMarketplaceStore((s) => s.createListing);
  const categories = useMemo(
    () =>
      categoriesAll
        .filter((c) => !c.parent_slug)
        .sort((a, b) => a.sort_order - b.sort_order),
    [categoriesAll],
  );
  const couple = useCoupleIdentity();

  const [step, setStep] = useState<Step>(1);
  const [draft, setDraft] = useState<DraftState>(initialDraft);

  function patch(p: Partial<DraftState>) {
    setDraft((d) => ({ ...d, ...p }));
  }

  const canNext = useMemo(() => {
    switch (step) {
      case 1:
        return draft.category != null && draft.listing_type != null;
      case 2:
        return draft.gradients.length >= 1;
      case 3:
        return draft.title.trim().length > 0 && draft.description.trim().length > 0;
      case 4:
        if (draft.listing_type === "free") {
          return draft.city.trim().length > 0;
        }
        return draft.price.trim().length > 0 && draft.city.trim().length > 0;
      case 5:
        return true;
    }
  }, [step, draft]);

  const suggestedTags = useMemo(() => {
    const src = (draft.title + " " + draft.description).toLowerCase();
    const pool = new Set<string>();
    if (draft.category) pool.add(draft.category.replace(/_/g, " "));
    if (draft.subcategory) pool.add(draft.subcategory.replace(/_/g, " "));
    if (draft.color) pool.add(draft.color.toLowerCase());
    if (draft.brand) pool.add(draft.brand.toLowerCase());
    // quick keyword extraction
    const keywords = ["bridal", "mehendi", "sangeet", "reception", "lehenga", "saree", "sherwani", "kurta", "jewelry", "centerpiece", "mandap", "welcome"];
    for (const k of keywords) if (src.includes(k)) pool.add(k);
    return Array.from(pool).slice(0, 8);
  }, [draft]);

  function commit() {
    if (!draft.category) return;
    const priceN = Number(draft.price || 0);
    const origN = Number(draft.original_price || 0);
    const depN = Number(draft.rental_deposit || 0);
    const durN = Number(draft.rental_duration_days || 0);
    const timesN = Number(draft.times_used || 0);
    const yearN = Number(draft.purchase_year || 0);

    const effectiveTags = draft.tags.length > 0 ? draft.tags : suggestedTags;

    const listing = createListing({
      seller_id: CURRENT_USER_ID,
      seller_display_name: couple.person1 || CURRENT_USER_NAME,
      seller_city: draft.city,
      seller_state: draft.state || undefined,
      seller_member_since: new Date().toISOString(),
      seller_items_listed: 1,
      seller_items_sold: 0,
      seller_typical_response: "within a day",

      title: draft.title.trim(),
      description: draft.description.trim(),

      category: draft.category,
      subcategory: draft.subcategory,
      tags: effectiveTags,

      listing_type: draft.listing_type,

      price_cents: draft.listing_type === "free" ? undefined : Math.round(priceN * 100),
      original_price_cents: origN > 0 ? Math.round(origN * 100) : undefined,
      price_is_negotiable: draft.price_is_negotiable,
      rental_deposit_cents: depN > 0 ? Math.round(depN * 100) : undefined,
      rental_duration_days: durN > 0 ? durN : undefined,

      condition: draft.condition,
      times_used: Number.isFinite(timesN) ? timesN : undefined,

      size: draft.size || undefined,
      color: draft.color || undefined,
      brand: draft.brand || undefined,
      purchase_year: Number.isFinite(yearN) && yearN > 1900 ? yearN : undefined,

      seller_location_city: draft.city.trim(),
      seller_location_state: draft.state.trim() || undefined,
      seller_location_country: draft.country,
      shipping_available: draft.shipping_available,
      local_pickup: draft.local_pickup,
      shipping_notes: draft.shipping_notes.trim() || undefined,

      images: [],
      image_gradients: draft.gradients,
    });

    router.push(`/${weddingId}/shopping/marketplace/${listing.id}`);
  }

  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <TopNav />
      <ExhibitionBanner weddingId={weddingId} />
      <MarketplaceTabBar weddingId={weddingId} active="mine" />

      <main className="mx-auto w-full max-w-[900px] flex-1 px-6 py-10 lg:px-10">
        <Link
          href={`/${weddingId}/shopping/marketplace`}
          className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted transition-colors hover:text-ink"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <ArrowLeft size={10} strokeWidth={2} /> Back to marketplace
        </Link>

        <p
          className="mt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Pre-Loved · New listing
        </p>
        <h1 className="mt-2 font-serif text-[32px] leading-[1.05] tracking-tight text-ink sm:text-[38px]">
          list an item in pre-loved.
        </h1>
        <p className="mt-3 max-w-2xl text-[13.5px] text-ink-muted">
          Five quick steps — we&rsquo;ll walk you through it. You can always
          edit later from &ldquo;my listings.&rdquo;
        </p>

        <StepIndicator step={step} />

        <div className="mt-8 rounded-xl border border-gold/15 bg-white p-6 lg:p-8">
          {step === 1 && (
            <Step1
              draft={draft}
              patch={patch}
              categories={categories}
            />
          )}
          {step === 2 && <Step2 draft={draft} patch={patch} />}
          {step === 3 && <Step3 draft={draft} patch={patch} />}
          {step === 4 && <Step4 draft={draft} patch={patch} />}
          {step === 5 && (
            <Step5
              draft={draft}
              patch={patch}
              suggestedTags={suggestedTags}
              categoryLabel={
                categories.find((c) => c.slug === draft.category)?.label ?? ""
              }
            />
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => (s > 1 ? ((s - 1) as Step) : s))}
            disabled={step === 1}
            className="flex items-center gap-1.5 rounded-md border border-border bg-white px-4 py-2 text-[12px] text-ink-muted transition-colors hover:border-gold/30 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft size={12} strokeWidth={1.8} /> Back
          </button>
          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as Step)}
              disabled={!canNext}
              className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-[12px] font-medium text-ivory transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue <ArrowRight size={12} strokeWidth={1.8} />
            </button>
          ) : (
            <button
              type="button"
              onClick={commit}
              className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-[12px] font-medium text-ivory transition-opacity hover:opacity-90"
            >
              Publish listing <ArrowRight size={12} strokeWidth={1.8} />
            </button>
          )}
        </div>

        <GuidelinesCallout />
      </main>
    </div>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const steps = [
    "What are you listing?",
    "Show it off",
    "The details",
    "Price & logistics",
    "Review & publish",
  ];
  return (
    <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2">
      {steps.map((label, i) => {
        const n = (i + 1) as Step;
        const done = n < step;
        const active = n === step;
        return (
          <div key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full font-mono text-[10px]",
                done && "bg-sage text-ivory",
                active && "bg-ink text-ivory",
                !done && !active && "border border-border bg-white text-ink-faint",
              )}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {done ? <Check size={11} strokeWidth={2} /> : n}
            </span>
            <span
              className={cn(
                "text-[11.5px]",
                active ? "font-medium text-ink" : "text-ink-muted",
              )}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <span aria-hidden className="hidden h-px w-6 bg-ink/10 sm:block" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Step 1: category + listing type ─────────────────────────────────────────

function Step1({
  draft,
  patch,
  categories,
}: {
  draft: DraftState;
  patch: (p: Partial<DraftState>) => void;
  categories: MarketplaceCategory[];
}) {
  return (
    <div className="space-y-8">
      <div>
        <Eyebrow className="mb-4">pick a category</Eyebrow>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const active = draft.category === c.slug;
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => patch({ category: c.slug })}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-all",
                  active
                    ? "border-ink bg-ink text-ivory"
                    : "border-border bg-white text-ink-muted hover:border-gold/30 hover:text-ink",
                )}
              >
                <span aria-hidden>{c.emoji}</span>
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Eyebrow className="mb-4">listing type</Eyebrow>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(Object.keys(LISTING_TYPE_LABELS) as ListingType[]).map((t) => {
            const active = draft.listing_type === t;
            const copy: Record<ListingType, string> = {
              sell: "Selling — one-time sale to the buyer.",
              rent: "Renting — for use during their wedding.",
              sell_or_rent: "Either — open to whichever works.",
              free: "Giving it away — no money changes hands.",
            };
            return (
              <button
                key={t}
                type="button"
                onClick={() => patch({ listing_type: t })}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-xl border px-4 py-3 text-left transition-all",
                  active
                    ? "border-ink bg-ink/5 ring-1 ring-ink"
                    : "border-border bg-white hover:border-gold/30",
                )}
              >
                <span className="font-serif text-[15px] text-ink">
                  {LISTING_TYPE_LABELS[t]}
                </span>
                <span className="text-[12px] text-ink-muted">{copy[t]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Step 2: photos (gradients as stand-ins) ─────────────────────────────────

function Step2({
  draft,
  patch,
}: {
  draft: DraftState;
  patch: (p: Partial<DraftState>) => void;
}) {
  const toggle = (g: string) => {
    if (draft.gradients.includes(g)) {
      patch({ gradients: draft.gradients.filter((x) => x !== g) });
    } else if (draft.gradients.length < 10) {
      patch({ gradients: [...draft.gradients, g] });
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <Eyebrow className="mb-2">show it off</Eyebrow>
        <p className="text-[13px] text-ink-muted">
          Honest photos sell faster. Pick a cover and up to 10 images total —
          we&rsquo;ll stand in with painted swatches for the prototype.
        </p>
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-gold-pale/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-gold" style={{ fontFamily: "var(--font-mono)" }}>
          <ImagePlus size={10} strokeWidth={1.8} />
          {draft.gradients.length} of 10 selected
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
        {GRADIENT_PALETTE.map((g) => {
          const active = draft.gradients.includes(g);
          const order = active ? draft.gradients.indexOf(g) + 1 : null;
          return (
            <button
              key={g}
              type="button"
              onClick={() => toggle(g)}
              aria-pressed={active}
              className={cn(
                "relative aspect-[3/4] overflow-hidden rounded-lg border-2 transition-all",
                active
                  ? "border-ink shadow-md"
                  : "border-transparent opacity-85 hover:opacity-100",
              )}
              style={{ background: g }}
            >
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.3), transparent 45%)",
                }}
              />
              {order && (
                <span
                  className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink font-mono text-[10px] text-ivory"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {order}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Step 3: details ─────────────────────────────────────────────────────────

function Step3({
  draft,
  patch,
}: {
  draft: DraftState;
  patch: (p: Partial<DraftState>) => void;
}) {
  const isClothing = draft.category
    ? CLOTHING_CATEGORIES.has(draft.category)
    : false;
  return (
    <div className="space-y-5">
      <Field label="Title">
        <input
          value={draft.title}
          onChange={(e) => patch({ title: e.target.value })}
          placeholder="Red Bridal Lehenga — Sabyasachi Inspired"
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
        />
      </Field>
      <Field label="Description">
        <textarea
          value={draft.description}
          onChange={(e) => patch({ description: e.target.value })}
          rows={6}
          placeholder="Tell the buyer about the item — when you bought it, where you wore it, its condition, any special details. The more you share, the faster it sells."
          className="w-full resize-none rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Condition">
          <select
            value={draft.condition}
            onChange={(e) =>
              patch({ condition: e.target.value as ListingCondition })
            }
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
          >
            {Object.entries(CONDITION_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Times used">
          <input
            type="number"
            min={0}
            value={draft.times_used}
            onChange={(e) => patch({ times_used: e.target.value })}
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
          />
        </Field>
        <Field label="Year purchased">
          <input
            type="number"
            min={1990}
            value={draft.purchase_year}
            onChange={(e) => patch({ purchase_year: e.target.value })}
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
          />
        </Field>
      </div>

      {isClothing && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Size">
            <input
              value={draft.size}
              onChange={(e) => patch({ size: e.target.value })}
              placeholder="S / M / L / Custom"
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
            />
          </Field>
          <Field label="Color">
            <input
              value={draft.color}
              onChange={(e) => patch({ color: e.target.value })}
              placeholder="Red / Gold"
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
            />
          </Field>
          <Field label="Brand">
            <input
              value={draft.brand}
              onChange={(e) => patch({ brand: e.target.value })}
              placeholder="Sabyasachi / Custom"
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
            />
          </Field>
        </div>
      )}

      {!isClothing && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Color">
            <input
              value={draft.color}
              onChange={(e) => patch({ color: e.target.value })}
              placeholder="Ivory / Gold"
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
            />
          </Field>
          <Field label="Brand / maker (optional)">
            <input
              value={draft.brand}
              onChange={(e) => patch({ brand: e.target.value })}
              placeholder="Custom / local artisan"
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
            />
          </Field>
        </div>
      )}

      <Field label="What did you originally pay? (optional — helps show value)">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-ink-muted">
            {draft.country === "USA" ? "$" : "₹"}
          </span>
          <input
            type="number"
            min={0}
            value={draft.original_price}
            onChange={(e) => patch({ original_price: e.target.value })}
            placeholder="2,80,000"
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
          />
        </div>
      </Field>
    </div>
  );
}

// ── Step 4: price + logistics ───────────────────────────────────────────────

function Step4({
  draft,
  patch,
}: {
  draft: DraftState;
  patch: (p: Partial<DraftState>) => void;
}) {
  const t = draft.listing_type;
  return (
    <div className="space-y-6">
      <div>
        <Eyebrow className="mb-3">price</Eyebrow>
        {t === "free" ? (
          <p className="text-[13px] text-ink-muted">
            Free listings don&rsquo;t need a price — just specify where the
            item is below. You can optionally note why you&rsquo;re giving it
            away in the description.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label={
                t === "rent" ? "Rental price per event" : "Asking price"
              }
            >
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-ink-muted">
                  {draft.country === "USA" ? "$" : "₹"}
                </span>
                <input
                  type="number"
                  min={0}
                  value={draft.price}
                  onChange={(e) => patch({ price: e.target.value })}
                  className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
                />
              </div>
            </Field>
            {(t === "rent" || t === "sell_or_rent") && (
              <>
                <Field label="Security deposit">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-ink-muted">
                      {draft.country === "USA" ? "$" : "₹"}
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={draft.rental_deposit}
                      onChange={(e) => patch({ rental_deposit: e.target.value })}
                      className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
                    />
                  </div>
                </Field>
                <Field label="Rental period (days)">
                  <input
                    type="number"
                    min={1}
                    value={draft.rental_duration_days}
                    onChange={(e) =>
                      patch({ rental_duration_days: e.target.value })
                    }
                    className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
                  />
                </Field>
              </>
            )}
            <label className="col-span-full flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-[12.5px] text-ink cursor-pointer hover:border-gold/30">
              <input
                type="checkbox"
                checked={draft.price_is_negotiable}
                onChange={(e) =>
                  patch({ price_is_negotiable: e.target.checked })
                }
                className="accent-gold"
              />
              Open to offers
            </label>
          </div>
        )}
      </div>

      <div>
        <Eyebrow className="mb-3">logistics</Eyebrow>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="City">
            <input
              value={draft.city}
              onChange={(e) => patch({ city: e.target.value })}
              placeholder="Mumbai"
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
            />
          </Field>
          <Field label="State">
            <input
              value={draft.state}
              onChange={(e) => patch({ state: e.target.value })}
              placeholder="Maharashtra"
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
            />
          </Field>
          <Field label="Country">
            <select
              value={draft.country}
              onChange={(e) =>
                patch({ country: e.target.value as "India" | "USA" })
              }
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
            >
              <option value="India">India</option>
              <option value="USA">USA</option>
            </select>
          </Field>
        </div>
        <div className="mt-3 space-y-2">
          <label className="flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-[12.5px] text-ink cursor-pointer hover:border-gold/30">
            <input
              type="checkbox"
              checked={draft.local_pickup}
              onChange={(e) => patch({ local_pickup: e.target.checked })}
              className="accent-gold"
            />
            Available for local pickup
          </label>
          <label className="flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-[12.5px] text-ink cursor-pointer hover:border-gold/30">
            <input
              type="checkbox"
              checked={draft.shipping_available}
              onChange={(e) =>
                patch({ shipping_available: e.target.checked })
              }
              className="accent-gold"
            />
            I can ship (buyer pays shipping)
          </label>
          {draft.shipping_available && (
            <Field label="Shipping notes (optional)">
              <input
                value={draft.shipping_notes}
                onChange={(e) => patch({ shipping_notes: e.target.value })}
                placeholder="e.g., Insured courier, flat $25 within India"
                className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
              />
            </Field>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Step 5: review & publish ────────────────────────────────────────────────

function Step5({
  draft,
  patch,
  suggestedTags,
  categoryLabel,
}: {
  draft: DraftState;
  patch: (p: Partial<DraftState>) => void;
  suggestedTags: string[];
  categoryLabel: string;
}) {
  const toggleTag = (tag: string) => {
    if (draft.tags.includes(tag)) {
      patch({ tags: draft.tags.filter((t) => t !== tag) });
    } else {
      patch({ tags: [...draft.tags, tag] });
    }
  };

  const priceLine = (() => {
    if (draft.listing_type === "free") return "FREE";
    const symbol = draft.country === "USA" ? "$" : "₹";
    if (draft.listing_type === "rent")
      return `${symbol}${draft.price} / event`;
    return `${symbol}${draft.price}`;
  })();

  const effectiveTags = draft.tags.length > 0 ? draft.tags : suggestedTags;

  return (
    <div className="space-y-6">
      <Eyebrow>preview</Eyebrow>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-[180px_1fr]">
        <div
          className="aspect-[3/4] overflow-hidden rounded-lg"
          style={{
            background:
              draft.gradients[0] ??
              "linear-gradient(135deg, #F0E4C8 0%, #D4A843 50%, #B8860B 100%)",
          }}
        />
        <div className="flex flex-col gap-2">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {categoryLabel} · {draft.condition.replace(/_/g, " ")}
          </span>
          <h2 className="font-serif text-[22px] text-ink">
            {draft.title || "untitled listing"}
          </h2>
          <p className="font-serif text-[18px] text-ink">{priceLine}</p>
          <p className="text-[12.5px] text-ink-muted">
            {draft.city || "—"}
            {draft.shipping_available && " · Ships"}
            {draft.local_pickup && " · Local pickup"}
          </p>
          <p className="max-w-xl text-[13px] text-ink-muted line-clamp-3">
            {draft.description || "(no description yet)"}
          </p>
        </div>
      </div>

      <div>
        <Eyebrow className="mb-3">tags</Eyebrow>
        <p className="mb-3 text-[12px] text-ink-muted">
          We&rsquo;ve suggested a few based on your title and description.
          Tap to add or remove. These help buyers find your listing.
        </p>
        <div className="flex flex-wrap gap-2">
          {suggestedTags.map((t) => {
            const active = effectiveTags.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggleTag(t)}
                className={cn(
                  "rounded-full border px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.18em] transition-all",
                  active
                    ? "border-ink bg-ink text-ivory"
                    : "border-border bg-white text-ink-muted hover:border-gold/30",
                )}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                #{t.replace(/\s+/g, "")}
              </button>
            );
          })}
        </div>
      </div>

      <label className="flex items-start gap-2 rounded-md border border-border bg-white px-3 py-3 text-[12.5px] text-ink cursor-pointer hover:border-gold/30">
        <input
          type="checkbox"
          checked={draft.share_to_community}
          onChange={(e) => patch({ share_to_community: e.target.checked })}
          className="mt-0.5 accent-gold"
        />
        <span>
          <span className="block font-medium text-ink">
            Share this listing in Community Discussions
          </span>
          <span className="block text-[11.5px] text-ink-muted">
            Other brides will see it alongside vendor recs and advice.
          </span>
        </span>
      </label>
    </div>
  );
}

// ── UI helpers ──────────────────────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span
        className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

function GuidelinesCallout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-6 rounded-xl border border-gold/15 bg-ivory-warm/50 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            — marketplace guidelines —
          </p>
          <p className="mt-2 text-[13px] text-ink-muted">
            Wedding-related items only. Honest condition descriptions. Your own
            photos, not stock.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="shrink-0 rounded-md border border-border bg-white px-3 py-1 text-[11px] text-ink-muted hover:border-gold/30 hover:text-ink"
        >
          {open ? (
            <span className="inline-flex items-center gap-1"><X size={10} /> Hide</span>
          ) : (
            "Read the full guidelines"
          )}
        </button>
      </div>
      {open && (
        <ul className="mt-4 space-y-1.5 text-[12.5px] text-ink-muted">
          <li>✓ Wedding-related items only</li>
          <li>✓ Accurate photos (your own, not stock images)</li>
          <li>✓ Honest condition descriptions</li>
          <li>✓ Reasonable pricing</li>
          <li>✗ No counterfeit designer items</li>
          <li>✗ No items that aren&rsquo;t wedding-related</li>
          <li>✗ No services (use the Vendors section for that)</li>
        </ul>
      )}
    </div>
  );
}
