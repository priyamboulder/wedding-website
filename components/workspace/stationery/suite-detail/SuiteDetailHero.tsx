// ── Detail panel hero ─────────────────────────────────────────────────────
// Opening register of the slide-over: icon, name, event badge, tagline,
// timeline pill, quantity note, and the current want/maybe/skip/star
// indicator so the couple sees their own decision reflected up top.

import { CalendarClock, Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  StationerySuiteDetail,
  StationerySuiteItem,
  StationerySuitePreference,
} from "@/types/stationery";
import { iconForSuiteKind } from "./icons";

const PREFERENCE_LABEL: Record<StationerySuitePreference, string> = {
  want: "Want this",
  maybe: "Maybe",
  skip: "Skipped",
};

const EVENT_GROUP_LABEL: Record<string, string> = {
  pre_wedding: "Pre-wedding",
  wedding_day: "Wedding day",
  post_wedding: "Post-wedding",
};

export function SuiteDetailHero({
  item,
  detail,
  preference,
  starred,
}: {
  item: StationerySuiteItem;
  detail: StationerySuiteDetail;
  preference: StationerySuitePreference | undefined;
  starred: boolean;
}) {
  const Icon = iconForSuiteKind(item.kind);
  const eventLabel = EVENT_GROUP_LABEL[detail.event_group];

  return (
    <header className="space-y-4 pb-2">
      <div className="flex items-start gap-3">
        <span
          className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-saffron-pale/60 text-saffron"
          aria-hidden
        >
          <Icon size={14} strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          {eventLabel && (
            <span
              className="inline-block font-mono text-[10px] uppercase tracking-[0.2em] text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {eventLabel}
            </span>
          )}
          <h2 className="font-serif text-[32px] leading-[1.1] tracking-tight text-ink">
            {item.name}
          </h2>
          <p className="font-serif text-[17px] italic leading-relaxed text-ink-muted">
            {detail.tagline}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pl-10">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-ivory-warm px-3 py-1 text-[11px] text-ink-muted">
          <CalendarClock size={11} strokeWidth={1.75} />
          {detail.timeline_guidance}
        </span>
        {(preference || starred) && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium",
              preference === "want" && "bg-sage-pale text-sage",
              preference === "maybe" &&
                "bg-gold-pale text-gold border border-gold/30",
              preference === "skip" &&
                "bg-ivory-deep text-ink-faint line-through",
              !preference && starred && "bg-saffron-pale text-saffron",
            )}
          >
            {starred && <Star size={11} strokeWidth={2} fill="currentColor" />}
            {preference === "want" && (
              <Check size={11} strokeWidth={2.5} className="text-sage" />
            )}
            {preference && PREFERENCE_LABEL[preference]}
            {starred && !preference && "Starred"}
          </span>
        )}
      </div>

      {detail.typical_quantity_note && (
        <p className="pl-10 text-[12px] leading-relaxed text-ink-faint">
          {detail.typical_quantity_note}
        </p>
      )}
    </header>
  );
}
