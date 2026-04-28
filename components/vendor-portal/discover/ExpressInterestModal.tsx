"use client";

// ── Express interest modal ──────────────────────────────────────────────────
// Vendor's intro flow. Required pitch (≤500 chars), surfaces what's
// auto-attached to the introduction (vendor profile + portfolio link +
// review summary). Calls expressInterest() on submit which enforces the
// per-vendor 10/day rate limit and the one-per-need duplicate guard.

import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { PrimaryButton, VENDOR_PALETTE } from "@/components/vendor-portal/ui";
import { useVendorNeedsStore } from "@/stores/vendor-needs-store";
import { getVendorNeedCategory } from "@/types/vendor-needs";
import type { CommunityVendorNeed } from "@/types/vendor-needs";
import type { CommunityProfile } from "@/types/community";
import type { Vendor } from "@/types/vendor-unified";

const MAX_MESSAGE = 500;

export function ExpressInterestModal({
  open,
  onClose,
  vendor,
  target,
}: {
  open: boolean;
  onClose: () => void;
  vendor: Vendor;
  target: { profile: CommunityProfile; need: CommunityVendorNeed } | null;
}) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const expressInterest = useVendorNeedsStore((s) => s.expressInterest);

  // Reset state when the modal opens with a new target.
  useEffect(() => {
    if (open) {
      setMessage("");
      setError(null);
      setSubmitted(false);
    }
  }, [open, target?.need.id]);

  // Esc-to-close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !target) return null;

  const { profile, need } = target;
  const cat = getVendorNeedCategory(need.category_slug);
  const cityShort = profile.wedding_city?.split(",")[0] ?? "their city";

  const send = () => {
    const trimmed = message.trim();
    if (trimmed.length < 20) {
      setError("Add a sentence or two — a real intro lands better than a one-liner.");
      return;
    }
    const result = expressInterest(vendor.id, need.id, profile.id, trimmed);
    if (!result.ok) {
      if (result.reason === "rate_limit") {
        setError(
          "You've sent the daily max of 10 introductions. The cap resets in 24 hours.",
        );
      } else if (result.reason === "duplicate") {
        setError("You've already reached out about this need.");
      } else {
        setError("This bride is no longer accepting introductions.");
      }
      return;
    }
    setSubmitted(true);
    setTimeout(() => onClose(), 1400);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-[#2C2C2C]/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="fixed left-1/2 top-1/2 z-50 w-[min(560px,92vw)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white shadow-2xl"
        role="dialog"
        aria-label={`Introduce yourself to ${profile.display_name}`}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between border-b px-6 py-4"
          style={{ borderColor: VENDOR_PALETTE.hairlineSoft }}
        >
          <div>
            <p
              className="font-mono text-[10.5px] uppercase tracking-[0.26em]"
              style={{ color: VENDOR_PALETTE.goldDeep }}
            >
              — introduce yourself —
            </p>
            <h2
              className="mt-2 text-[26px] leading-tight"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 500,
                color: VENDOR_PALETTE.charcoal,
              }}
            >
              say hello to {profile.display_name.toLowerCase()}.
            </h2>
            <p
              className="mt-1 text-[13.5px] italic"
              style={{
                fontFamily: "'EB Garamond', serif",
                color: "#6a6a6a",
              }}
            >
              she's looking for a {cat?.label.toLowerCase()} in {cityShort}
              {need.budget_range ? ` · ${budgetLabel(need.budget_range)}` : ""}
              {profile.wedding_date
                ? ` · ${formatMonthYear(profile.wedding_date)}`
                : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#8a8a8a] transition-colors hover:text-[#2C2C2C]"
            aria-label="Close"
          >
            <X size={18} strokeWidth={1.6} />
          </button>
        </div>

        {/* Body */}
        {submitted ? (
          <div className="px-8 py-12 text-center">
            <p
              className="text-[28px] leading-tight"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 500,
                color: VENDOR_PALETTE.charcoal,
              }}
            >
              ✨ your introduction is on its way.
            </p>
            <p
              className="mt-2 text-[14px] italic"
              style={{
                fontFamily: "'EB Garamond', serif",
                color: "#6a6a6a",
              }}
            >
              {profile.display_name} will get a notification with your
              profile and pitch.
            </p>
          </div>
        ) : (
          <>
            <div className="px-6 py-5">
              <label className="block">
                <span className="text-[12.5px] font-medium text-[#2C2C2C]">
                  Write a short intro
                </span>
                <p className="mt-0.5 text-[12px] italic text-[#8a8a8a]">
                  what makes you a great fit for her wedding?
                </p>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value.slice(0, MAX_MESSAGE));
                    setError(null);
                  }}
                  placeholder={`Hi ${profile.display_name} — I specialize in editorial wedding photography and have shot 8 weddings at palace venues in Rajasthan. I'd love to share my portfolio with you.`}
                  className="mt-2 w-full resize-none rounded-lg border border-[rgba(196,162,101,0.35)] bg-white px-3 py-2.5 text-[13.5px] leading-[1.55] text-[#2C2C2C] placeholder:italic placeholder:text-[#b5a68e] focus:border-[#C4A265] focus:outline-none focus:ring-2 focus:ring-[#F5E6D0]"
                />
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-[11px] text-[#8a8a8a]">
                    {message.length}/{MAX_MESSAGE}
                  </span>
                </div>
              </label>

              <div
                className="mt-4 rounded-lg p-3.5 text-[12.5px] leading-[1.55]"
                style={{ backgroundColor: VENDOR_PALETTE.champagneSoft, color: "#5a4a20" }}
              >
                <p className="font-medium text-[#9E8245]">
                  what gets shared with your introduction
                </p>
                <ul className="mt-1.5 space-y-0.5 list-disc pl-5 text-[12px]">
                  <li>your profile name, photo, and one-line bio</li>
                  <li>your portfolio link and starting price</li>
                  <li>your aggregate review rating</li>
                </ul>
                <p className="mt-2 text-[11.5px] italic text-[#8a8a8a]">
                  her contact info stays private until she accepts your intro.
                </p>
              </div>

              {error && (
                <p
                  className="mt-3 rounded-md border px-3 py-2 text-[12.5px]"
                  style={{
                    borderColor: "rgba(192,57,43,0.25)",
                    backgroundColor: "#fdf2f0",
                    color: "#8a3a2a",
                  }}
                >
                  {error}
                </p>
              )}
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-end gap-2 border-t px-6 py-4"
              style={{ borderColor: VENDOR_PALETTE.hairlineSoft }}
            >
              <button
                type="button"
                onClick={onClose}
                className="text-[12.5px] text-[#6a6a6a] transition-colors hover:text-[#2C2C2C]"
              >
                cancel
              </button>
              <PrimaryButton onClick={send}>
                <Sparkles size={13} strokeWidth={1.8} />
                send introduction
              </PrimaryButton>
            </div>
          </>
        )}
      </div>
    </>
  );
}

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatMonthYear(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

function budgetLabel(id: string): string {
  const map: Record<string, string> = {
    under_1k: "Under $1K",
    "1k_3k": "$1K–$3K",
    "3k_5k": "$3K–$5K",
    "5k_10k": "$5K–$10K",
    "10k_20k": "$10K–$20K",
    "20k_50k": "$20K–$50K",
    "50k_plus": "$50K+",
    flexible: "Flexible budget",
  };
  return map[id] ?? id;
}
