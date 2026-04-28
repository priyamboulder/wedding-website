"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  Vendor,
  VendorCategory,
  PriceDisplay,
} from "@/types/vendor";
import { useVendorsStore } from "@/stores/vendors-store";
import { CATEGORY_LABELS } from "@/lib/vendor-categories";

interface Props {
  open: boolean;
  onClose: () => void;
}

const CATEGORIES = Object.keys(CATEGORY_LABELS) as VendorCategory[];

// Parse a free-text price the couple types in to a structured PriceDisplay.
// Empty / unparseable input becomes "contact" so the card renders cleanly.
function parsePriceDisplay(raw: string): PriceDisplay {
  const s = raw.trim();
  if (!s) return { type: "contact" };

  const parseAmount = (piece: string): number | null => {
    const m = piece.match(/([\d.,]+)\s*(L|Cr|K)?/i);
    if (!m) return null;
    const n = Number.parseFloat(m[1].replace(/,/g, ""));
    if (!Number.isFinite(n)) return null;
    const unit = (m[2] ?? "").toUpperCase();
    if (unit === "CR") return n * 1_00_00_000;
    if (unit === "L") return n * 1_00_000;
    if (unit === "K") return n * 1_000;
    return n;
  };

  const rangeMatch = s.split(/\s*[–-]\s*/);
  if (rangeMatch.length === 2) {
    const min = parseAmount(rangeMatch[0]);
    const max = parseAmount(rangeMatch[1]);
    if (min != null && max != null) return { type: "range", min, max };
  }
  const fromMatch = s.match(/^(?:from|starting\s*from)\s+(.+)$/i);
  if (fromMatch) {
    const amt = parseAmount(fromMatch[1]);
    if (amt != null) return { type: "starting_from", amount: amt };
  }
  const single = parseAmount(s);
  if (single != null) return { type: "exact", amount: single };
  return { type: "contact" };
}

export function AddVendorModal({ open, onClose }: Props) {
  const addVendors = useVendorsStore((s) => s.addVendors);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<VendorCategory>("photography");
  const [location, setLocation] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [rating, setRating] = useState("");
  const [styleTags, setStyleTags] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function reset() {
    setName("");
    setCategory("photography");
    setLocation("");
    setPriceInput("");
    setRating("");
    setStyleTags("");
    setBio("");
  }

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const now = new Date().toISOString();
    const vendor: Vendor = {
      id: `ven-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      slug: `ven-${Date.now().toString(36)}`,
      name: trimmed,
      owner_name: "",
      category,
      tier: "free",
      is_verified: false,
      bio: bio.trim(),
      tagline: "",
      location: location.trim(),
      travel_level: "local",
      years_active: 0,
      team_size: 0,
      style_tags: styleTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      contact: {
        email: "",
        phone: "",
        website: "",
        instagram: "",
      },
      cover_image: "",
      portfolio_images: [],
      price_display: parsePriceDisplay(priceInput),
      currency: "INR",
      rating: rating ? Math.max(0, Math.min(5, Number(rating))) : null,
      review_count: 0,
      wedding_count: 0,
      response_time_hours: null,
      profile_completeness: 0,
      created_at: now,
      updated_at: now,
      planner_connections: [],
      venue_connections: [],
      packages: [],
    };
    addVendors([vendor]);
    reset();
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm"
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            role="dialog"
            aria-label="Add vendor"
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-white p-6 shadow-[0_24px_60px_-20px_rgba(26,26,26,0.35)]"
          >
            <div className="flex items-center justify-between pb-4">
              <h2 className="text-[14px] font-medium text-ink">Add Vendor</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded p-1 text-ink-faint hover:text-ink"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <Field label="Name">
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Studio or artist name"
                  className={fieldClass}
                />
              </Field>
              <Field label="Category">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as VendorCategory)}
                  className={fieldClass}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_LABELS[c]}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Location">
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City"
                    className={fieldClass}
                  />
                </Field>
                <Field label="Price">
                  <input
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    placeholder="₹6L – ₹14L"
                    className={fieldClass}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Rating">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    placeholder="4.7"
                    className={fieldClass}
                  />
                </Field>
                <Field label="Style Tags">
                  <input
                    value={styleTags}
                    onChange={(e) => setStyleTags(e.target.value)}
                    placeholder="editorial, candid"
                    className={fieldClass}
                  />
                </Field>
              </div>
              <Field label="Bio">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="One line about the vendor"
                  rows={3}
                  className={cn(fieldClass, "resize-none py-2")}
                />
              </Field>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md px-3 py-1.5 text-[12px] text-ink-muted transition-colors hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={!name.trim()}
                className="rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Add Vendor
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const fieldClass =
  "w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink outline-none focus:border-gold";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
        {label}
      </span>
      {children}
    </label>
  );
}
