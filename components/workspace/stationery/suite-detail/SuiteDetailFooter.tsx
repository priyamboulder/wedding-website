// ── Sticky footer action bar ─────────────────────────────────────────────
// Same want/maybe/skip/star controls from the card, larger scale here.
// Source of truth is the store — this component is presentational and
// delegates state transitions upward.

import { Check, Minus, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StationerySuitePreference } from "@/types/stationery";

type Option = {
  value: StationerySuitePreference;
  label: string;
  icon: typeof Check;
  activeClasses: string;
};

const OPTIONS: Option[] = [
  {
    value: "want",
    label: "Want this",
    icon: Check,
    activeClasses: "border-sage bg-sage-pale text-sage",
  },
  {
    value: "maybe",
    label: "Maybe",
    icon: Minus,
    activeClasses: "border-gold bg-gold-pale text-gold",
  },
  {
    value: "skip",
    label: "Skip",
    icon: X,
    activeClasses: "border-rose/50 bg-rose-pale text-rose",
  },
];

export function SuiteDetailFooter({
  preference,
  starred,
  onPreferenceChange,
  onToggleStar,
  onClose,
}: {
  preference: StationerySuitePreference | undefined;
  starred: boolean;
  onPreferenceChange: (pref: StationerySuitePreference) => void;
  onToggleStar: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between gap-4 border-t border-border bg-ivory/90 px-8 py-3.5 backdrop-blur supports-[backdrop-filter]:bg-ivory/80"
      role="group"
      aria-label="Selection controls"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {OPTIONS.map((opt) => {
          const active = preference === opt.value;
          const Icon = opt.icon;
          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => onPreferenceChange(opt.value)}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12px] font-medium transition-colors",
                active
                  ? opt.activeClasses
                  : "border-border bg-white text-ink-muted hover:border-ink-muted hover:text-ink",
              )}
              aria-pressed={active}
            >
              <Icon size={12} strokeWidth={2.25} />
              {opt.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={onToggleStar}
          className={cn(
            "ml-1 inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12px] font-medium transition-colors",
            starred
              ? "border-saffron bg-saffron-pale text-saffron"
              : "border-border bg-white text-ink-muted hover:border-saffron hover:text-saffron",
          )}
          aria-pressed={starred}
          aria-label={starred ? "Remove star" : "Star as top priority"}
        >
          <Star
            size={12}
            strokeWidth={2}
            fill={starred ? "currentColor" : "none"}
          />
          {starred ? "Starred" : "Star"}
        </button>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="text-[12px] font-medium text-ink-faint transition-colors hover:text-ink-muted"
      >
        Close
      </button>
    </div>
  );
}
