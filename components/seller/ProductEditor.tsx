"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import {
  CATEGORIES,
  TRADITION_LABELS,
  WEDDING_EVENT_LABELS,
  type CulturalTradition,
  type CustomField,
  type CustomFieldType,
  type PricingModel,
  type PricingTier,
  type Product,
  type ProductCategory,
  type WeddingEvent,
} from "@/lib/seller/products-seed";

type EditorProps = {
  mode: "new" | "edit";
  initial?: Product;
};

export default function ProductEditor({ mode, initial }: EditorProps) {
  // Local editor state — non-persistent; this is a build-only editor.
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState<ProductCategory>(
    initial?.category ?? "invitations-stationery",
  );
  const [subcategory, setSubcategory] = useState(initial?.subcategory ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [tagDraft, setTagDraft] = useState("");

  const [pricingModel, setPricingModel] = useState<PricingModel>(
    initial?.pricingModel ?? "per-unit",
  );
  const [price, setPrice] = useState<string>(
    initial ? String(initial.price) : "",
  );
  const [minOrder, setMinOrder] = useState<string>(
    initial?.minOrder ? String(initial.minOrder) : "",
  );
  const [compareAtPrice, setCompareAtPrice] = useState<string>(
    initial?.compareAtPrice ? String(initial.compareAtPrice) : "",
  );
  const [tiers, setTiers] = useState<PricingTier[]>(initial?.tiers ?? []);

  const [customizable, setCustomizable] = useState(initial?.customizable ?? true);
  const [customFields, setCustomFields] = useState<CustomField[]>(
    initial?.customFields ?? [],
  );
  const [proofRequired, setProofRequired] = useState(initial?.proofRequired ?? true);
  const [proofTurnaroundDays, setProofTurnaroundDays] = useState(
    initial?.proofTurnaroundDays ?? "3-5",
  );

  const [productType, setProductType] = useState(initial?.productType ?? "physical");
  const [shipsFrom, setShipsFrom] = useState(initial?.shipsFrom ?? "India");
  const [processingTimeDays, setProcessingTimeDays] = useState(
    initial?.processingTimeDays ?? "7-10",
  );
  const [shippingMode, setShippingMode] = useState(initial?.shippingMode ?? "calculated");
  const [flatShippingRate, setFlatShippingRate] = useState(
    initial?.flatShippingRate ? String(initial.flatShippingRate) : "",
  );
  const [internationalShipping, setInternationalShipping] = useState(
    initial?.internationalShipping ?? true,
  );
  const [weightOz, setWeightOz] = useState(
    initial?.weightOz != null ? String(initial.weightOz) : "",
  );
  const [dimL, setDimL] = useState(initial?.dimensions ? String(initial.dimensions.l) : "");
  const [dimW, setDimW] = useState(initial?.dimensions ? String(initial.dimensions.w) : "");
  const [dimH, setDimH] = useState(initial?.dimensions ? String(initial.dimensions.h) : "");

  const [trackInventory, setTrackInventory] = useState(initial?.trackInventory ?? false);
  const [stockQuantity, setStockQuantity] = useState(
    initial?.stockQuantity != null ? String(initial.stockQuantity) : "",
  );
  const [lowStockThreshold, setLowStockThreshold] = useState(
    initial?.lowStockThreshold != null ? String(initial.lowStockThreshold) : "",
  );

  const [weddingEvents, setWeddingEvents] = useState<WeddingEvent[]>(
    initial?.weddingEvents ?? [],
  );
  const [traditions, setTraditions] = useState<CulturalTradition[]>(
    initial?.traditions ?? [],
  );

  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(initial?.metaDescription ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");

  const currentCategory = CATEGORIES.find((c) => c.value === category);
  const isDigital = productType === "digital";

  function addTag() {
    const t = tagDraft.trim().toLowerCase();
    if (!t || tags.includes(t)) return;
    setTags([...tags, t]);
    setTagDraft("");
  }
  function removeTag(t: string) {
    setTags(tags.filter((x) => x !== t));
  }

  function toggleEvent(e: WeddingEvent) {
    setWeddingEvents((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e],
    );
  }
  function toggleTradition(t: CulturalTradition) {
    setTraditions((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );
  }

  function addCustomField() {
    setCustomFields([
      ...customFields,
      {
        id: `f-${Date.now()}`,
        label: "",
        type: "text",
        required: false,
      },
    ]);
  }
  function updateCustomField(id: string, patch: Partial<CustomField>) {
    setCustomFields(customFields.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }
  function removeCustomField(id: string) {
    setCustomFields(customFields.filter((f) => f.id !== id));
  }

  function addTier() {
    setTiers([...tiers, { minQty: 1, pricePerUnit: 0 }]);
  }
  function updateTier(idx: number, patch: Partial<PricingTier>) {
    setTiers(tiers.map((t, i) => (i === idx ? { ...t, ...patch } : t)));
  }
  function removeTier(idx: number) {
    setTiers(tiers.filter((_, i) => i !== idx));
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b px-8 py-4 backdrop-blur"
        style={{
          borderColor: "rgba(44,44,44,0.08)",
          backgroundColor: "rgba(250,248,245,0.95)",
        }}
      >
        <div className="flex items-center gap-4 min-w-0">
          <Link
            href="/seller/products"
            className="inline-flex items-center gap-1.5 text-[13px] text-stone-600 transition-colors hover:text-[#7a5a16]"
          >
            <span aria-hidden>←</span> Back to Products
          </Link>
          <span className="text-stone-300" aria-hidden>·</span>
          <h1
            className="truncate text-[22px] leading-none text-[#2C2C2C]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            {mode === "new" ? "New Product" : title || "Edit Product"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-9 items-center rounded-md border bg-white px-3.5 text-[13px] text-[#2C2C2C] transition-colors hover:bg-[#FBF3E4]"
            style={{ borderColor: "rgba(44,44,44,0.12)" }}
          >
            Save Draft
          </button>
          <button
            type="button"
            className="inline-flex h-9 items-center rounded-md border bg-white px-3.5 text-[13px] text-[#2C2C2C] transition-colors hover:bg-[#FBF3E4]"
            style={{ borderColor: "rgba(44,44,44,0.12)" }}
          >
            Preview
          </button>
          <button
            type="button"
            className="inline-flex h-9 items-center rounded-md px-4 text-[13px] font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: "#C4A265" }}
          >
            {mode === "new" ? "Publish" : "Save Changes"}
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-8 px-8 py-8">
        {/* ── PHOTOS ── */}
        <Panel title="Photos" hint="Up to 10 photos. First photo is the cover image. Show the product in a wedding context when possible.">
          <PhotoUploader initial={initial} />
        </Panel>

        {/* ── BASIC DETAILS ── */}
        <Panel title="Basic details">
          <Field label="Product title" required>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Gold Foil Ganesh Wedding Invitation Suite"
              className="h-10 w-full rounded-md border bg-white px-3 text-[14px] outline-none focus:border-[#C4A265]"
              style={{ borderColor: "rgba(44,44,44,0.12)" }}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Category" required>
              <SelectNative
                value={category}
                onChange={(v) => {
                  setCategory(v as ProductCategory);
                  setSubcategory("");
                }}
                options={CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
              />
            </Field>
            <Field label="Sub-category" required>
              <SelectNative
                value={subcategory}
                onChange={setSubcategory}
                options={[
                  { value: "", label: "— Select —" },
                  ...(currentCategory?.subcategories ?? []).map((s) => ({
                    value: s,
                    label: s,
                  })),
                ]}
              />
            </Field>
          </div>

          <Field label="Description" required>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Describe the product, materials, craftsmanship, and what makes it special..."
              className="w-full rounded-md border bg-white p-3 text-[13.5px] leading-relaxed outline-none focus:border-[#C4A265]"
              style={{ borderColor: "rgba(44,44,44,0.12)" }}
            />
            <p className="mt-1 text-[11px] text-stone-500">
              Rich text formatting available on publish. {description.length} characters.
            </p>
          </Field>

          <Field label="Tags" hint="Help buyers find this product in search.">
            <div
              className="flex flex-wrap items-center gap-1.5 rounded-md border bg-white px-2 py-2"
              style={{ borderColor: "rgba(44,44,44,0.12)" }}
            >
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11.5px]"
                  style={{
                    borderColor: "rgba(196,162,101,0.4)",
                    backgroundColor: "#F5E6D0",
                    color: "#7a5a16",
                  }}
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => removeTag(t)}
                    className="ml-0.5 text-[11px] opacity-70 hover:opacity-100"
                    aria-label={`Remove ${t}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTag();
                  }
                  if (e.key === "Backspace" && !tagDraft && tags.length) {
                    removeTag(tags[tags.length - 1]);
                  }
                }}
                placeholder={tags.length ? "" : "Type and press Enter..."}
                className="min-w-[120px] flex-1 bg-transparent px-1 py-0.5 text-[13px] outline-none"
              />
            </div>
          </Field>
        </Panel>

        {/* ── PRICING ── */}
        <Panel title="Pricing">
          <Field label="Pricing model">
            <div className="flex flex-wrap gap-2">
              <RadioPill
                label="Fixed price"
                checked={pricingModel === "fixed"}
                onChange={() => setPricingModel("fixed")}
              />
              <RadioPill
                label="Per unit"
                checked={pricingModel === "per-unit"}
                onChange={() => setPricingModel("per-unit")}
              />
              <RadioPill
                label="Tiered"
                checked={pricingModel === "tiered"}
                onChange={() => setPricingModel("tiered")}
              />
            </div>
          </Field>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field
              label={
                pricingModel === "per-unit" || pricingModel === "tiered"
                  ? "Price per unit"
                  : "Price"
              }
              required
            >
              <PrefixInput prefix="$" value={price} onChange={setPrice} placeholder="0.00" />
            </Field>

            {(pricingModel === "per-unit" || pricingModel === "tiered") && (
              <Field label="Minimum order quantity">
                <input
                  type="number"
                  value={minOrder}
                  onChange={(e) => setMinOrder(e.target.value)}
                  placeholder="100"
                  className="h-10 w-full rounded-md border bg-white px-3 text-[14px] outline-none focus:border-[#C4A265]"
                  style={{ borderColor: "rgba(44,44,44,0.12)" }}
                />
              </Field>
            )}

            <Field label="Compare-at price" hint="Shown as strikethrough.">
              <PrefixInput
                prefix="$"
                value={compareAtPrice}
                onChange={setCompareAtPrice}
                placeholder="—"
              />
            </Field>
          </div>

          {pricingModel === "tiered" && (
            <div
              className="rounded-md border p-4"
              style={{
                borderColor: "rgba(196,162,101,0.25)",
                backgroundColor: "#FBF3E4",
              }}
            >
              <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#7a5a16]">
                Tiered pricing
              </p>
              <div className="mt-3 space-y-2.5">
                {tiers.length === 0 && (
                  <p className="text-[12.5px] italic text-stone-500">
                    No tiers added yet.
                  </p>
                )}
                {tiers.map((t, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-2">
                    <input
                      type="number"
                      value={t.minQty}
                      onChange={(e) =>
                        updateTier(idx, { minQty: Number(e.target.value) })
                      }
                      placeholder="Min"
                      className="h-9 w-20 rounded-md border bg-white px-2.5 text-[13px] outline-none focus:border-[#C4A265]"
                      style={{ borderColor: "rgba(44,44,44,0.12)" }}
                    />
                    <span className="text-[12px] text-stone-500">–</span>
                    <input
                      type="number"
                      value={t.maxQty ?? ""}
                      onChange={(e) =>
                        updateTier(idx, {
                          maxQty: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      placeholder="Max (∞)"
                      className="h-9 w-24 rounded-md border bg-white px-2.5 text-[13px] outline-none focus:border-[#C4A265]"
                      style={{ borderColor: "rgba(44,44,44,0.12)" }}
                    />
                    <span className="mx-1 text-[12px] text-stone-500">units</span>
                    <PrefixInput
                      prefix="$"
                      value={String(t.pricePerUnit)}
                      onChange={(v) => updateTier(idx, { pricePerUnit: Number(v) })}
                      placeholder="0.00"
                      compact
                    />
                    <span className="text-[12px] text-stone-500">/ea</span>
                    <button
                      type="button"
                      onClick={() => removeTier(idx)}
                      className="ml-auto text-[12px] text-stone-500 hover:text-[#B23A2A]"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addTier}
                className="mt-3 inline-flex h-8 items-center gap-1 rounded-md border bg-white px-3 text-[12.5px] text-[#7a5a16] hover:bg-[#F5E6D0]"
                style={{ borderColor: "rgba(196,162,101,0.4)" }}
              >
                + Add tier
              </button>
            </div>
          )}
        </Panel>

        {/* ── CUSTOMIZATION ── */}
        <Panel title="Customization options">
          <label className="flex items-center gap-2 text-[13.5px] text-[#2C2C2C]">
            <input
              type="checkbox"
              checked={customizable}
              onChange={(e) => setCustomizable(e.target.checked)}
            />
            This product is customizable
          </label>

          {customizable && (
            <>
              <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#7a5a16]">
                Custom fields
              </p>
              <p className="text-[11.5px] text-stone-500">
                What the buyer fills in at checkout.
              </p>

              <div className="space-y-2.5">
                {customFields.map((f, idx) => (
                  <CustomFieldRow
                    key={f.id}
                    index={idx + 1}
                    field={f}
                    onChange={(patch) => updateCustomField(f.id, patch)}
                    onRemove={() => removeCustomField(f.id)}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={addCustomField}
                className="inline-flex h-8 items-center gap-1 rounded-md border bg-white px-3 text-[12.5px] text-[#7a5a16] hover:bg-[#F5E6D0]"
                style={{ borderColor: "rgba(196,162,101,0.4)" }}
              >
                + Add custom field
              </button>

              <div className="pt-2">
                <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#7a5a16]">
                  Proof process
                </p>
                <div className="mt-2 flex flex-col gap-2">
                  <RadioRow
                    checked={proofRequired === true}
                    onChange={() => setProofRequired(true)}
                    label="Send digital proof for approval before production"
                  />
                  <RadioRow
                    checked={proofRequired === false}
                    onChange={() => setProofRequired(false)}
                    label="No proof needed — produce and ship directly"
                  />
                </div>
                {proofRequired && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[12.5px] text-stone-600">
                      Estimated proof turnaround:
                    </span>
                    <input
                      type="text"
                      value={proofTurnaroundDays}
                      onChange={(e) => setProofTurnaroundDays(e.target.value)}
                      placeholder="3-5"
                      className="h-8 w-20 rounded-md border bg-white px-2 text-center text-[13px] outline-none focus:border-[#C4A265]"
                      style={{ borderColor: "rgba(44,44,44,0.12)" }}
                    />
                    <span className="text-[12.5px] text-stone-600">business days</span>
                  </div>
                )}
              </div>
            </>
          )}
        </Panel>

        {/* ── SHIPPING & FULFILLMENT ── */}
        <Panel title="Shipping & fulfillment">
          <Field label="Product type">
            <div className="flex gap-2">
              <RadioPill
                label="Physical"
                checked={productType === "physical"}
                onChange={() => setProductType("physical")}
              />
              <RadioPill
                label="Digital download"
                checked={productType === "digital"}
                onChange={() => setProductType("digital")}
              />
            </div>
          </Field>

          {!isDigital && (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Ships from">
                  <SelectNative
                    value={shipsFrom}
                    onChange={(v) => setShipsFrom(v as "India" | "United States")}
                    options={[
                      { value: "India", label: "India" },
                      { value: "United States", label: "United States" },
                    ]}
                  />
                </Field>
                <Field label="Processing time" hint="Business days after proof approval.">
                  <input
                    type="text"
                    value={processingTimeDays}
                    onChange={(e) => setProcessingTimeDays(e.target.value)}
                    placeholder="7-10"
                    className="h-10 w-full rounded-md border bg-white px-3 text-[14px] outline-none focus:border-[#C4A265]"
                    style={{ borderColor: "rgba(44,44,44,0.12)" }}
                  />
                </Field>
              </div>

              <Field label="Shipping">
                <div className="flex flex-wrap gap-2">
                  <RadioPill
                    label="Free shipping"
                    checked={shippingMode === "free"}
                    onChange={() => setShippingMode("free")}
                  />
                  <RadioPill
                    label="Calculated"
                    checked={shippingMode === "calculated"}
                    onChange={() => setShippingMode("calculated")}
                  />
                  <RadioPill
                    label="Flat rate"
                    checked={shippingMode === "flat"}
                    onChange={() => setShippingMode("flat")}
                  />
                </div>
              </Field>

              {shippingMode === "flat" && (
                <Field label="Flat rate">
                  <PrefixInput
                    prefix="$"
                    value={flatShippingRate}
                    onChange={setFlatShippingRate}
                    placeholder="0.00"
                  />
                </Field>
              )}

              <label className="flex items-center gap-2 text-[13.5px] text-[#2C2C2C]">
                <input
                  type="checkbox"
                  checked={internationalShipping}
                  onChange={(e) => setInternationalShipping(e.target.checked)}
                />
                International shipping available
              </label>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Weight per unit (oz)">
                  <input
                    type="number"
                    step="0.1"
                    value={weightOz}
                    onChange={(e) => setWeightOz(e.target.value)}
                    placeholder="0.0"
                    className="h-10 w-full rounded-md border bg-white px-3 text-[14px] outline-none focus:border-[#C4A265]"
                    style={{ borderColor: "rgba(44,44,44,0.12)" }}
                  />
                </Field>
                <Field label="Package dimensions (L × W × H, inches)">
                  <div className="flex items-center gap-2">
                    <DimInput value={dimL} onChange={setDimL} />
                    <span className="text-stone-400" aria-hidden>×</span>
                    <DimInput value={dimW} onChange={setDimW} />
                    <span className="text-stone-400" aria-hidden>×</span>
                    <DimInput value={dimH} onChange={setDimH} />
                  </div>
                </Field>
              </div>
            </>
          )}

          {isDigital && (
            <p
              className="rounded-md border px-3 py-2.5 text-[12.5px] text-stone-600"
              style={{
                borderColor: "rgba(107,91,168,0.3)",
                backgroundColor: "rgba(232,222,245,0.4)",
              }}
            >
              Digital products are delivered via download link after purchase. No physical shipping required.
            </p>
          )}
        </Panel>

        {/* ── INVENTORY ── */}
        {!isDigital && (
          <Panel title="Inventory">
            <Field label="Track inventory">
              <div className="flex gap-2">
                <RadioPill
                  label="Yes"
                  checked={trackInventory}
                  onChange={() => setTrackInventory(true)}
                />
                <RadioPill
                  label="No (made to order)"
                  checked={!trackInventory}
                  onChange={() => setTrackInventory(false)}
                />
              </div>
            </Field>

            {trackInventory && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Quantity in stock">
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    placeholder="0"
                    className="h-10 w-full rounded-md border bg-white px-3 text-[14px] outline-none focus:border-[#C4A265]"
                    style={{ borderColor: "rgba(44,44,44,0.12)" }}
                  />
                </Field>
                <Field label="Low stock alert at">
                  <input
                    type="number"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                    placeholder="5"
                    className="h-10 w-full rounded-md border bg-white px-3 text-[14px] outline-none focus:border-[#C4A265]"
                    style={{ borderColor: "rgba(44,44,44,0.12)" }}
                  />
                </Field>
              </div>
            )}
          </Panel>
        )}

        {/* ── WEDDING EVENT TAGS ── */}
        <Panel title="Wedding event tags">
          <Field label="Which events is this product for?">
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(WEDDING_EVENT_LABELS) as WeddingEvent[]).map((e) => (
                <CheckPill
                  key={e}
                  checked={weddingEvents.includes(e)}
                  onChange={() => toggleEvent(e)}
                  label={WEDDING_EVENT_LABELS[e]}
                />
              ))}
            </div>
          </Field>

          <Field label="Which cultural traditions?">
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(TRADITION_LABELS) as CulturalTradition[]).map((t) => (
                <CheckPill
                  key={t}
                  checked={traditions.includes(t)}
                  onChange={() => toggleTradition(t)}
                  label={TRADITION_LABELS[t]}
                />
              ))}
            </div>
          </Field>
        </Panel>

        {/* ── SEO ── */}
        <Panel title="SEO & visibility">
          <Field label="SEO title">
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="How this product appears in Google search"
              className="h-10 w-full rounded-md border bg-white px-3 text-[14px] outline-none focus:border-[#C4A265]"
              style={{ borderColor: "rgba(44,44,44,0.12)" }}
            />
            <p className="mt-1 text-[11px] text-stone-500">
              {seoTitle.length}/70 characters recommended
            </p>
          </Field>
          <Field label="Meta description">
            <textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              rows={3}
              placeholder="Short summary for search engine results."
              className="w-full rounded-md border bg-white p-3 text-[13.5px] leading-relaxed outline-none focus:border-[#C4A265]"
              style={{ borderColor: "rgba(44,44,44,0.12)" }}
            />
            <p className="mt-1 text-[11px] text-stone-500">
              {metaDescription.length}/160 characters recommended
            </p>
          </Field>
          <Field label="URL slug">
            <div
              className="flex items-center overflow-hidden rounded-md border bg-white"
              style={{ borderColor: "rgba(44,44,44,0.12)" }}
            >
              <span
                className="bg-[#FBF3E4] px-3 py-2 font-mono text-[12px] text-stone-600"
                aria-hidden
              >
                ananya.com/shop/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="product-slug"
                className="h-10 flex-1 bg-transparent px-3 font-mono text-[13px] outline-none"
              />
            </div>
          </Field>
        </Panel>

        {/* Footer actions */}
        <div
          className="flex flex-wrap items-center justify-end gap-2 border-t pt-6"
          style={{ borderColor: "rgba(44,44,44,0.08)" }}
        >
          <button
            type="button"
            className="inline-flex h-10 items-center rounded-md border bg-white px-4 text-[13.5px] text-[#2C2C2C] transition-colors hover:bg-[#FBF3E4]"
            style={{ borderColor: "rgba(44,44,44,0.12)" }}
          >
            Save Draft
          </button>
          <button
            type="button"
            className="inline-flex h-10 items-center rounded-md border bg-white px-4 text-[13.5px] text-[#2C2C2C] transition-colors hover:bg-[#FBF3E4]"
            style={{ borderColor: "rgba(44,44,44,0.12)" }}
          >
            Preview
          </button>
          <button
            type="button"
            className="inline-flex h-10 items-center rounded-md px-5 text-[13.5px] font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: "#C4A265" }}
          >
            {mode === "new" ? "Publish" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Building blocks ────────────────────────────────────────

function Panel({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section
      className="overflow-hidden rounded-xl border"
      style={{
        borderColor: "rgba(196,162,101,0.25)",
        backgroundColor: "#FFFFFA",
      }}
    >
      <header
        className="border-b px-6 py-4"
        style={{
          borderColor: "rgba(44,44,44,0.06)",
          backgroundColor: "#FBF3E4",
        }}
      >
        <h2
          className="text-[18px] leading-none text-[#2C2C2C]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 500,
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </h2>
        {hint && <p className="mt-1 text-[12px] text-stone-600">{hint}</p>}
      </header>
      <div className="space-y-4 px-6 py-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1 text-[12.5px] font-medium text-[#2C2C2C]">
        {label}
        {required && <span className="text-[#B23A2A]">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11.5px] text-stone-500">{hint}</p>}
    </div>
  );
}

function SelectNative({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full cursor-pointer appearance-none rounded-md border bg-white pl-3 pr-9 text-[13.5px] text-[#2C2C2C] outline-none focus:border-[#C4A265]"
        style={{ borderColor: "rgba(44,44,44,0.12)" }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-stone-500"
        aria-hidden
      >
        ▾
      </span>
    </div>
  );
}

function PrefixInput({
  prefix,
  value,
  onChange,
  placeholder,
  compact = false,
}: {
  prefix: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex items-center overflow-hidden rounded-md border bg-white ${
        compact ? "h-9 w-28" : "h-10 w-full"
      }`}
      style={{ borderColor: "rgba(44,44,44,0.12)" }}
    >
      <span className="bg-[#FBF3E4] px-2.5 font-mono text-[13px] text-stone-600 h-full flex items-center" aria-hidden>
        {prefix}
      </span>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent px-3 text-[13.5px] font-mono outline-none"
      />
    </div>
  );
}

function DimInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="number"
      step="0.1"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-20 rounded-md border bg-white px-2.5 text-center text-[14px] outline-none focus:border-[#C4A265]"
      style={{ borderColor: "rgba(44,44,44,0.12)" }}
    />
  );
}

function RadioPill({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      className="inline-flex h-9 items-center gap-2 rounded-md border px-3 text-[13px] transition-colors"
      style={{
        borderColor: checked ? "rgba(196,162,101,0.5)" : "rgba(44,44,44,0.12)",
        backgroundColor: checked ? "#F5E6D0" : "white",
        color: checked ? "#7a5a16" : "#2C2C2C",
      }}
    >
      <span
        className="flex h-3.5 w-3.5 items-center justify-center rounded-full border"
        style={{
          borderColor: checked ? "#C4A265" : "rgba(44,44,44,0.3)",
          backgroundColor: "white",
        }}
        aria-hidden
      >
        {checked && (
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "#C4A265" }} />
        )}
      </span>
      {label}
    </button>
  );
}

function RadioRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-[13px] text-[#2C2C2C]">
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="accent-[#C4A265]"
      />
      {label}
    </label>
  );
}

function CheckPill({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      className="inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-[12.5px] transition-colors"
      style={{
        borderColor: checked ? "rgba(196,162,101,0.5)" : "rgba(44,44,44,0.12)",
        backgroundColor: checked ? "#F5E6D0" : "white",
        color: checked ? "#7a5a16" : "#2C2C2C",
      }}
    >
      <span aria-hidden>{checked ? "✓" : ""}</span>
      {label}
    </button>
  );
}

// ── Custom field row ──────────────────────────────────────

function CustomFieldRow({
  index,
  field,
  onChange,
  onRemove,
}: {
  index: number;
  field: CustomField;
  onChange: (patch: Partial<CustomField>) => void;
  onRemove: () => void;
}) {
  const showOptions = field.type === "dropdown";
  return (
    <div
      className="rounded-md border p-3"
      style={{ borderColor: "rgba(44,44,44,0.1)", backgroundColor: "#FAF8F5" }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10.5px] uppercase tracking-wider text-stone-500">
          Field {index}
        </span>
        <input
          type="text"
          value={field.label}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder="Field label (e.g. Couple Names)"
          className="h-9 flex-1 min-w-[200px] rounded-md border bg-white px-3 text-[13px] outline-none focus:border-[#C4A265]"
          style={{ borderColor: "rgba(44,44,44,0.12)" }}
        />
        <SelectNative
          value={field.type}
          onChange={(v) => onChange({ type: v as CustomFieldType })}
          options={[
            { value: "text", label: "Text" },
            { value: "long-text", label: "Long text" },
            { value: "date", label: "Date" },
            { value: "dropdown", label: "Dropdown" },
            { value: "number", label: "Number" },
          ]}
        />
        <label className="flex items-center gap-1.5 whitespace-nowrap text-[12.5px] text-[#2C2C2C]">
          <input
            type="checkbox"
            checked={field.required}
            onChange={(e) => onChange({ required: e.target.checked })}
          />
          Required
        </label>
        <button
          type="button"
          onClick={onRemove}
          className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-[13px] text-stone-500 hover:bg-[#E8D5D0] hover:text-[#B23A2A]"
          aria-label="Remove field"
        >
          ×
        </button>
      </div>
      {showOptions && (
        <div className="mt-2">
          <label className="text-[11.5px] text-stone-600">Options (one per line)</label>
          <textarea
            value={(field.options ?? []).join("\n")}
            onChange={(e) =>
              onChange({
                options: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
              })
            }
            rows={3}
            placeholder={"Gold & Red\nGold & Ivory\nRose Gold"}
            className="mt-1 w-full rounded-md border bg-white p-2.5 font-mono text-[12.5px] outline-none focus:border-[#C4A265]"
            style={{ borderColor: "rgba(44,44,44,0.12)" }}
          />
        </div>
      )}
    </div>
  );
}

// ── Photo uploader (mock) ─────────────────────────────────

function PhotoUploader({ initial }: { initial?: Product }) {
  const count = initial?.photoCount ?? 0;
  const tint = initial?.photoTint ?? "#F5E6D0";
  const glyph = initial?.photoGlyph ?? "✦";

  return (
    <div>
      <div
        className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 text-center"
        style={{
          borderColor: "rgba(196,162,101,0.5)",
          backgroundColor: "#FBF3E4",
        }}
      >
        <span
          className="mb-2 text-[36px] text-[#C4A265]"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
          aria-hidden
        >
          ⬆
        </span>
        <p
          className="text-[15px] text-[#2C2C2C]"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
        >
          Drag & drop, or click to upload
        </p>
        <p className="mt-1 text-[12px] text-stone-600">
          JPEG or PNG · 2000×2000px recommended · Up to 10 photos
        </p>
      </div>

      {count > 0 && (
        <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6">
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className="relative aspect-square overflow-hidden rounded-md border"
              style={{
                borderColor: "rgba(196,162,101,0.25)",
                background: `linear-gradient(135deg, ${tint}, #FFFFFA)`,
              }}
            >
              <span
                className="absolute inset-0 flex items-center justify-center text-[28px] text-[#7a5a16]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
                aria-hidden
              >
                {glyph}
              </span>
              {i === 0 && (
                <span
                  className="absolute left-1 top-1 rounded px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-wider"
                  style={{ backgroundColor: "#C4A265", color: "white" }}
                >
                  ★ Cover
                </span>
              )}
            </div>
          ))}
          <button
            type="button"
            className="flex aspect-square items-center justify-center rounded-md border-2 border-dashed text-[24px] text-stone-400 transition-colors hover:border-[#C4A265] hover:text-[#7a5a16]"
            style={{ borderColor: "rgba(44,44,44,0.15)" }}
            aria-label="Add more photos"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}
