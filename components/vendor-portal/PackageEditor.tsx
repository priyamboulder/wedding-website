"use client";

import { useEffect, useState, type FormEvent } from "react";
import type {
  EventCategory,
  PriceDisplay,
  VendorPackage,
} from "@/types/vendor-unified";
import { PRICE_DISPLAY_LABEL } from "@/lib/vendors/price-display";

// Modal form to create or edit a vendor package. Seasonal mode surfaces the
// date range inputs and makes them required; otherwise they stay hidden.

type Mode = "create" | "edit";

export type PackageDraft = Omit<VendorPackage, "id" | "order">;

const EVENT_CATEGORIES: EventCategory[] = [
  "mehndi",
  "sangeet",
  "ceremony",
  "reception",
  "full_wedding",
];

const EVENT_CATEGORY_LABEL: Record<EventCategory, string> = {
  sangeet: "Sangeet",
  mehndi: "Mehndi",
  ceremony: "Ceremony",
  reception: "Reception",
  full_wedding: "Full Wedding",
};

type Props = {
  open: boolean;
  mode: Mode;
  initial?: VendorPackage;
  defaultSeasonal?: boolean;
  onClose: () => void;
  onSave: (draft: PackageDraft) => void;
  onDelete?: () => void;
};

function blankDraft(seasonal: boolean): PackageDraft {
  return {
    name: "",
    description: "",
    price_display: { type: "exact", amount: 0 },
    currency: "INR",
    inclusions: [],
    event_categories: [],
    lead_time: "",
    capacity_notes: "",
    featured: false,
    ...(seasonal
      ? { seasonal: { start_date: isoToday(), end_date: isoToday(90) } }
      : {}),
  };
}

function isoToday(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function draftFromPackage(p: VendorPackage): PackageDraft {
  const { id: _id, order: _o, ...rest } = p;
  return rest;
}

export function PackageEditor({
  open,
  mode,
  initial,
  defaultSeasonal = false,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [draft, setDraft] = useState<PackageDraft>(() =>
    initial ? draftFromPackage(initial) : blankDraft(defaultSeasonal),
  );
  const [inclusionsText, setInclusionsText] = useState<string>(() =>
    (initial?.inclusions ?? []).join("\n"),
  );

  useEffect(() => {
    if (!open) return;
    setDraft(initial ? draftFromPackage(initial) : blankDraft(defaultSeasonal));
    setInclusionsText((initial?.inclusions ?? []).join("\n"));
  }, [open, initial, defaultSeasonal]);

  if (!open) return null;

  const isSeasonal = Boolean(draft.seasonal);
  const priceKind: PriceDisplay["type"] = draft.price_display.type;

  function setPriceKind(kind: PriceDisplay["type"]) {
    let next: PriceDisplay;
    switch (kind) {
      case "exact":
      case "starting_from":
        next = {
          type: kind,
          amount:
            draft.price_display.type === "exact" ||
            draft.price_display.type === "starting_from"
              ? draft.price_display.amount
              : 0,
        };
        break;
      case "range":
        next = {
          type: kind,
          min:
            draft.price_display.type === "range" ? draft.price_display.min : 0,
          max:
            draft.price_display.type === "range" ? draft.price_display.max : 0,
        };
        break;
      case "contact":
        next = { type: kind };
        break;
    }
    setDraft((d) => ({ ...d, price_display: next }));
  }

  function toggleCategory(cat: EventCategory) {
    setDraft((d) => {
      const has = d.event_categories.includes(cat);
      return {
        ...d,
        event_categories: has
          ? d.event_categories.filter((c) => c !== cat)
          : [...d.event_categories, cat],
      };
    });
  }

  function setSeasonal(on: boolean) {
    setDraft((d) => ({
      ...d,
      seasonal: on
        ? d.seasonal ?? { start_date: isoToday(), end_date: isoToday(90) }
        : undefined,
    }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!draft.name.trim()) return;
    const inclusions = inclusionsText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    onSave({ ...draft, inclusions });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-10"
      style={{ backgroundColor: "rgba(26,26,26,0.48)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[680px] rounded-xl border bg-[#FBF9F4]"
        style={{ borderColor: "rgba(26,26,26,0.08)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-[rgba(26,26,26,0.08)] px-6 py-4">
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.26em] text-stone-500">
              {mode === "create" ? "New package" : "Edit package"}
            </p>
            <h2
              className="mt-0.5 text-[22px] text-[#1a1a1a]"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}
            >
              {mode === "create" ? "Add a new offering" : draft.name || "Package"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md px-2 py-1 text-stone-500 hover:bg-white hover:text-[#1a1a1a]"
          >
            ✕
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          <Field label="Package name" required>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="e.g. Full Wedding Decor — Indoor"
              className={inputClass}
              required
            />
          </Field>

          <Field
            label="What's included"
            hint="Describe the experience and deliverables."
          >
            <textarea
              value={draft.description}
              onChange={(e) =>
                setDraft((d) => ({ ...d, description: e.target.value }))
              }
              rows={4}
              className={inputClass + " resize-y"}
              placeholder="Candid + posed coverage, two photographers, 400+ edited images…"
            />
          </Field>

          <Field
            label="Inclusions"
            hint="One per line. These render as a bulleted list on the public profile."
          >
            <textarea
              value={inclusionsText}
              onChange={(e) => setInclusionsText(e.target.value)}
              rows={5}
              className={inputClass + " resize-y"}
              placeholder={"Second shooter\n3-day coverage\nPrivate online gallery"}
            />
          </Field>

          <Field label="Price display">
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(PRICE_DISPLAY_LABEL) as PriceDisplay["type"][]).map(
                (k) => {
                  const active = priceKind === k;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setPriceKind(k)}
                      className={`rounded-full border px-3 py-1 text-[12px] transition-colors ${
                        active
                          ? "border-[#1a1a1a] bg-[#1a1a1a] text-[#FBF9F4]"
                          : "border-[rgba(26,26,26,0.16)] bg-white text-stone-600 hover:border-[#1a1a1a]/40"
                      }`}
                    >
                      {PRICE_DISPLAY_LABEL[k]}
                    </button>
                  );
                },
              )}
            </div>
            <div className="mt-3">
              <PriceInputs
                value={draft.price_display}
                currency={draft.currency}
                onChange={(pd) =>
                  setDraft((d) => ({ ...d, price_display: pd }))
                }
              />
            </div>
          </Field>

          <Field
            label="Event categories"
            hint="Which events this package applies to."
          >
            <div className="flex flex-wrap gap-1.5">
              {EVENT_CATEGORIES.map((cat) => {
                const active = draft.event_categories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`rounded-full border px-3 py-1 text-[12px] transition-colors ${
                      active
                        ? "border-[#B8860B] bg-[#F0E4C8] text-[#7a5a16]"
                        : "border-[rgba(26,26,26,0.16)] bg-white text-stone-600 hover:border-[#B8860B]/40"
                    }`}
                  >
                    {EVENT_CATEGORY_LABEL[cat]}
                  </button>
                );
              })}
            </div>
          </Field>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Estimated lead time">
              <input
                type="text"
                value={draft.lead_time}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, lead_time: e.target.value }))
                }
                placeholder="e.g. 3–6 months"
                className={inputClass}
              />
            </Field>
            <Field label="Capacity / availability">
              <input
                type="text"
                value={draft.capacity_notes}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, capacity_notes: e.target.value }))
                }
                placeholder="Up to 400 guests · destinations welcome"
                className={inputClass}
              />
            </Field>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-[rgba(26,26,26,0.08)] bg-white px-4 py-3">
            <div>
              <p className="text-[13.5px] font-medium text-[#1a1a1a]">
                Feature this package
              </p>
              <p className="mt-0.5 text-[12px] text-stone-500">
                Featured packages appear first on your public profile.
              </p>
            </div>
            <Toggle
              checked={draft.featured}
              onChange={(v) => setDraft((d) => ({ ...d, featured: v }))}
            />
          </div>

          <div className="rounded-lg border border-[rgba(26,26,26,0.08)] bg-white">
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-[13.5px] font-medium text-[#1a1a1a]">
                  Seasonal package
                </p>
                <p className="mt-0.5 text-[12px] text-stone-500">
                  Time-limited offering. Auto-hides on the public profile after
                  the end date.
                </p>
              </div>
              <Toggle checked={isSeasonal} onChange={setSeasonal} />
            </div>
            {isSeasonal && draft.seasonal && (
              <div className="grid grid-cols-2 gap-3 border-t border-[rgba(26,26,26,0.06)] px-4 py-3">
                <Field label="Starts">
                  <input
                    type="date"
                    value={draft.seasonal.start_date}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        seasonal: d.seasonal
                          ? { ...d.seasonal, start_date: e.target.value }
                          : undefined,
                      }))
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Ends">
                  <input
                    type="date"
                    value={draft.seasonal.end_date}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        seasonal: d.seasonal
                          ? { ...d.seasonal, end_date: e.target.value }
                          : undefined,
                      }))
                    }
                    className={inputClass}
                  />
                </Field>
              </div>
            )}
          </div>

          <footer className="flex items-center justify-between border-t border-[rgba(26,26,26,0.08)] pt-4">
            <div>
              {mode === "edit" && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (
                      typeof window !== "undefined" &&
                      window.confirm("Delete this package? This cannot be undone.")
                    ) {
                      onDelete();
                      onClose();
                    }
                  }}
                  className="text-[12.5px] text-[#C97B63] hover:underline"
                >
                  Delete package
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 items-center rounded-md border border-[rgba(26,26,26,0.12)] bg-white px-3.5 text-[13px] hover:bg-[#F7F5F0]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex h-9 items-center rounded-md bg-[#1a1a1a] px-4 text-[13px] font-medium text-[#FBF9F4] hover:bg-[#2e2e2e]"
              >
                {mode === "create" ? "Add package" : "Save changes"}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
}

const inputClass =
  "block w-full rounded-md border border-[rgba(26,26,26,0.14)] bg-white px-3 py-2 text-[14px] text-[#1a1a1a] placeholder:text-stone-400 focus:border-[#B8860B] focus:outline-none focus:ring-1 focus:ring-[#B8860B]";

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-1 text-[12px] font-medium text-stone-600">
        {label}
        {required && <span className="text-[#C97B63]">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11.5px] text-stone-500">{hint}</span>}
    </label>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-[#B8860B]" : "bg-stone-300"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function PriceInputs({
  value,
  currency,
  onChange,
}: {
  value: PriceDisplay;
  currency: string;
  onChange: (pd: PriceDisplay) => void;
}) {
  const symbol = currency === "INR" ? "₹" : "$";
  if (value.type === "contact") {
    return (
      <p className="text-[12.5px] italic text-stone-500">
        Couples will see "Contact for pricing" — no amount is shown until you
        reply to an inquiry.
      </p>
    );
  }
  if (value.type === "range") {
    return (
      <div className="grid grid-cols-2 gap-3">
        <AmountInput
          label={`Min (${symbol})`}
          value={value.min}
          onChange={(n) => onChange({ ...value, min: n })}
        />
        <AmountInput
          label={`Max (${symbol})`}
          value={value.max}
          onChange={(n) => onChange({ ...value, max: n })}
        />
      </div>
    );
  }
  return (
    <AmountInput
      label={`Amount (${symbol})`}
      value={value.amount}
      onChange={(n) => onChange({ ...value, amount: n })}
    />
  );
}

function AmountInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11.5px] text-stone-500">{label}</span>
      <input
        type="number"
        min={0}
        step={1000}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className={inputClass}
      />
    </label>
  );
}
