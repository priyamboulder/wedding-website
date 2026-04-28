"use client";

import type { ShopProfile, Toggle } from "@/lib/seller/shop-profile-seed";
import {
  Field,
  FileDropBox,
  FormSection,
  NumberInput,
  SwitchRow,
  TagRow,
  TextArea,
  TextInput,
  TogglePill,
} from "./FormPrimitives";

type Props = {
  profile: ShopProfile;
  setProfile: (updater: (prev: ShopProfile) => ShopProfile) => void;
};

export default function ProfileEditor({ profile, setProfile }: Props) {
  // ── Identity ──
  const identity = profile.identity;

  // ── Toggle helpers for specialty groups ──
  const toggleIn = (
    group: "productTypes" | "culturalFocus" | "styleTags" | "materials",
    key: string,
  ) => {
    setProfile((prev) => ({
      ...prev,
      specialties: {
        ...prev.specialties,
        [group]: prev.specialties[group].map((t: Toggle) =>
          t.key === key ? { ...t, on: !t.on } : t,
        ),
      },
    }));
  };

  const featuredCount = profile.products.filter((p) => p.isPinned).length;

  return (
    <div className="space-y-5">
      {/* Page heading inside the left column */}
      <div>
        <p className="font-mono text-[10.5px] uppercase tracking-[0.26em] text-[#7a5a16]">
          Shop Profile Editor
        </p>
        <h1
          className="mt-1 text-[28px] leading-tight text-[#2C2C2C]"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, letterSpacing: "-0.015em" }}
        >
          Your storefront on Ananya
        </h1>
        <p className="mt-1 text-[13px] text-stone-600">
          Edit on the left, watch the preview update on the right. Couples see the preview
          when they visit{" "}
          <span className="font-mono text-[12px] text-[#7a5a16]">
            ananya.com/shop/divya-creations
          </span>
          .
        </p>
      </div>

      {/* ── Shop Identity ── */}
      <FormSection title="Shop Identity">
        <Field label="Shop name">
          <TextInput
            value={identity.shopName}
            onChange={(v) =>
              setProfile((p) => ({ ...p, identity: { ...p.identity, shopName: v } }))
            }
          />
        </Field>
        <Field label="Shop tagline" hint="One sentence under your shop name in the header.">
          <TextInput
            value={identity.tagline}
            onChange={(v) =>
              setProfile((p) => ({ ...p, identity: { ...p.identity, tagline: v } }))
            }
          />
        </Field>
        <Field label="Shop logo">
          <FileDropBox
            label="Upload logo (PNG or SVG, square, 512×512 recommended)"
            current={identity.logoUrl}
          />
        </Field>
        <Field label="Shop banner" hint="Wide banner image across the top of your storefront (1600×480).">
          <FileDropBox label="Upload banner image" current={identity.bannerUrl} />
        </Field>
        <Field label="Instagram handle" hint="We auto-sync your latest nine posts into the storefront.">
          <TextInput
            value={identity.instagramHandle}
            onChange={(v) =>
              setProfile((p) => ({
                ...p,
                identity: { ...p.identity, instagramHandle: v },
              }))
            }
          />
        </Field>
      </FormSection>

      {/* ── About / Story ── */}
      <FormSection
        title="About / Story"
        hint="Couples love knowing the artisan behind their stationery."
      >
        <Field label="Your shop's story">
          <TextArea
            value={profile.about.story}
            onChange={(v) => setProfile((p) => ({ ...p, about: { story: v } }))}
            rows={8}
          />
          <p className="mt-1.5 font-mono text-[10.5px] text-stone-400">
            {profile.about.story.length} chars · 200 min recommended
          </p>
        </Field>
      </FormSection>

      {/* ── Seller Details ── */}
      <FormSection title="Seller Details">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Seller name">
            <TextInput
              value={profile.seller.ownerName}
              onChange={(v) =>
                setProfile((p) => ({
                  ...p,
                  seller: { ...p.seller, ownerName: v },
                }))
              }
            />
          </Field>
          <Field label="Location">
            <TextInput
              value={profile.seller.location}
              onChange={(v) =>
                setProfile((p) => ({
                  ...p,
                  seller: { ...p.seller, location: v },
                }))
              }
            />
          </Field>
          <Field label="Years in business">
            <NumberInput
              value={profile.seller.yearsInBusiness}
              min={0}
              max={99}
              onChange={(n) =>
                setProfile((p) => ({
                  ...p,
                  seller: { ...p.seller, yearsInBusiness: n },
                }))
              }
            />
          </Field>
          <Field label="Response time">
            <TextInput
              value={profile.seller.responseTime}
              onChange={(v) =>
                setProfile((p) => ({
                  ...p,
                  seller: { ...p.seller, responseTime: v },
                }))
              }
            />
          </Field>
        </div>
        <Field label="Languages" hint="Press Enter to add each language.">
          <TagRow
            values={profile.seller.languages}
            onRemove={(idx) =>
              setProfile((p) => ({
                ...p,
                seller: {
                  ...p.seller,
                  languages: p.seller.languages.filter((_, i) => i !== idx),
                },
              }))
            }
            onAdd={(v) =>
              setProfile((p) => ({
                ...p,
                seller: { ...p.seller, languages: [...p.seller.languages, v] },
              }))
            }
            placeholder="Add a language"
          />
        </Field>
      </FormSection>

      {/* ── Shop Specialties ── */}
      <FormSection title="Shop Specialties" hint="Couples filter and search by these.">
        <ToggleGroup
          label="Product types"
          items={profile.specialties.productTypes}
          onToggle={(k) => toggleIn("productTypes", k)}
        />
        <ToggleGroup
          label="Cultural focus"
          items={profile.specialties.culturalFocus}
          onToggle={(k) => toggleIn("culturalFocus", k)}
        />
        <ToggleGroup
          label="Style tags"
          items={profile.specialties.styleTags}
          onToggle={(k) => toggleIn("styleTags", k)}
        />
        <ToggleGroup
          label="Materials"
          items={profile.specialties.materials}
          onToggle={(k) => toggleIn("materials", k)}
        />
      </FormSection>

      {/* ── Shop Policies ── */}
      <FormSection title="Shop Policies">
        <Field label="Processing time">
          <TextInput
            value={profile.policies.processingTime}
            onChange={(v) =>
              setProfile((p) => ({
                ...p,
                policies: { ...p.policies, processingTime: v },
              }))
            }
          />
        </Field>
        <Field label="Shipping policy">
          <TextArea
            value={profile.policies.shippingPolicy}
            onChange={(v) =>
              setProfile((p) => ({
                ...p,
                policies: { ...p.policies, shippingPolicy: v },
              }))
            }
            rows={4}
          />
        </Field>
        <Field label="Return / exchange policy">
          <TextArea
            value={profile.policies.returnPolicy}
            onChange={(v) =>
              setProfile((p) => ({
                ...p,
                policies: { ...p.policies, returnPolicy: v },
              }))
            }
            rows={3}
          />
        </Field>
        <Field label="Custom order policy">
          <TextArea
            value={profile.policies.customOrderPolicy}
            onChange={(v) =>
              setProfile((p) => ({
                ...p,
                policies: { ...p.policies, customOrderPolicy: v },
              }))
            }
            rows={3}
          />
        </Field>
        <SwitchRow
          label="Rush orders available"
          hint="Couples can request rush production for an additional fee."
          on={profile.policies.rushOrdersAvailable}
          onToggle={() =>
            setProfile((p) => ({
              ...p,
              policies: {
                ...p.policies,
                rushOrdersAvailable: !p.policies.rushOrdersAvailable,
              },
            }))
          }
        />
      </FormSection>

      {/* ── Payment & Tax ── */}
      <FormSection title="Payment & Tax">
        <Field label="Accepted payment methods" hint="Managed by Ananya — contact support to change.">
          <div className="flex flex-wrap gap-1.5">
            {profile.payment.paymentMethods.map((m) => (
              <span
                key={m}
                className="rounded-md border bg-[#FFFFFA] px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-wider text-stone-600"
                style={{ borderColor: "rgba(44,44,44,0.12)" }}
              >
                {m}
              </span>
            ))}
          </div>
        </Field>
        <SwitchRow
          label="Collect sales tax on US orders"
          on={profile.payment.collectSalesTax}
          onToggle={() =>
            setProfile((p) => ({
              ...p,
              payment: { ...p.payment, collectSalesTax: !p.payment.collectSalesTax },
            }))
          }
        />
        <SwitchRow
          label="Wholesale orders are tax-exempt"
          hint="Applies when a buyer provides a resale certificate at checkout."
          on={profile.payment.wholesaleTaxExempt}
          onToggle={() =>
            setProfile((p) => ({
              ...p,
              payment: {
                ...p.payment,
                wholesaleTaxExempt: !p.payment.wholesaleTaxExempt,
              },
            }))
          }
        />
      </FormSection>

      {/* ── Product Display Controls ── */}
      <FormSection
        title="Product Display Controls"
        hint="Pin up to 6 products to feature and drag to reorder."
      >
        <div>
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#7a5a16]">
              Featured products
            </p>
            <p className="font-mono text-[10.5px] text-stone-500">
              {featuredCount} / 6 pinned
            </p>
          </div>
          <ul className="mt-3 space-y-2">
            {profile.products.map((prod, idx) => (
              <li
                key={prod.id}
                className="flex items-center gap-3 rounded-md border bg-[#FFFFFA] px-3 py-2.5"
                style={{ borderColor: "rgba(44,44,44,0.08)" }}
              >
                <span className="font-mono text-[10px] text-stone-400 select-none" aria-hidden>
                  ⋮⋮
                </span>
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[15px] text-white"
                  style={{ backgroundColor: prod.swatch }}
                  aria-hidden
                >
                  {prod.glyph}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] text-[#2C2C2C]">{prod.title}</p>
                  <p className="font-mono text-[10.5px] text-stone-500">
                    ${prod.price} · {prod.salesCount} sold
                  </p>
                </div>
                <ReorderButtons
                  canUp={idx > 0}
                  canDown={idx < profile.products.length - 1}
                  onUp={() =>
                    setProfile((p) => moveProduct(p, idx, idx - 1))
                  }
                  onDown={() =>
                    setProfile((p) => moveProduct(p, idx, idx + 1))
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    setProfile((p) => ({
                      ...p,
                      products: p.products.map((q) =>
                        q.id === prod.id
                          ? { ...q, isPinned: !q.isPinned }
                          : q,
                      ),
                    }))
                  }
                  disabled={!prod.isPinned && featuredCount >= 6}
                  className="flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-[11.5px] transition-colors disabled:opacity-40"
                  style={{
                    color: prod.isPinned ? "#7a5a16" : "#2C2C2C",
                    backgroundColor: prod.isPinned ? "#F5E6D0" : "#FFFFFA",
                    borderColor: prod.isPinned
                      ? "rgba(196,162,101,0.5)"
                      : "rgba(44,44,44,0.12)",
                  }}
                >
                  <span aria-hidden>{prod.isPinned ? "★" : "☆"}</span>
                  {prod.isPinned ? "Featured" : "Pin"}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#7a5a16]">
            Seasonal collections
          </p>
          <ul className="mt-3 space-y-2">
            {profile.collections.map((col) => (
              <li
                key={col.id}
                className="rounded-md border bg-[#FFFFFA] px-3 py-2.5"
                style={{ borderColor: "rgba(44,44,44,0.08)" }}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[13px] text-[#2C2C2C]">{col.name}</p>
                  <p className="font-mono text-[10.5px] text-stone-500">
                    {col.productIds.length} product
                    {col.productIds.length === 1 ? "" : "s"}
                  </p>
                </div>
                <p className="mt-1 text-[11.5px] text-stone-500">
                  {col.productIds
                    .map(
                      (id) =>
                        profile.products.find((p) => p.id === id)?.title ?? "",
                    )
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </li>
            ))}
            <li>
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed py-2.5 text-[12px] text-[#7a5a16] hover:bg-[#FBF3E4]"
                style={{ borderColor: "rgba(196,162,101,0.5)" }}
              >
                <span aria-hidden>＋</span> New collection
              </button>
            </li>
          </ul>
        </div>
      </FormSection>
    </div>
  );
}

function ToggleGroup({
  label,
  items,
  onToggle,
}: {
  label: string;
  items: Toggle[];
  onToggle: (key: string) => void;
}) {
  return (
    <div>
      <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#7a5a16]">
        {label}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.map((t) => (
          <TogglePill
            key={t.key}
            label={t.label}
            on={t.on}
            onToggle={() => onToggle(t.key)}
          />
        ))}
      </div>
    </div>
  );
}

function ReorderButtons({
  canUp,
  canDown,
  onUp,
  onDown,
}: {
  canUp: boolean;
  canDown: boolean;
  onUp: () => void;
  onDown: () => void;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <button
        type="button"
        onClick={onUp}
        disabled={!canUp}
        aria-label="Move up"
        className="flex h-3.5 w-5 items-center justify-center rounded text-[10px] text-stone-500 hover:bg-[#F5E6D0] hover:text-[#7a5a16] disabled:opacity-20"
      >
        ▲
      </button>
      <button
        type="button"
        onClick={onDown}
        disabled={!canDown}
        aria-label="Move down"
        className="flex h-3.5 w-5 items-center justify-center rounded text-[10px] text-stone-500 hover:bg-[#F5E6D0] hover:text-[#7a5a16] disabled:opacity-20"
      >
        ▼
      </button>
    </div>
  );
}

function moveProduct(p: ShopProfile, from: number, to: number): ShopProfile {
  if (to < 0 || to >= p.products.length) return p;
  const next = [...p.products];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return { ...p, products: next };
}
