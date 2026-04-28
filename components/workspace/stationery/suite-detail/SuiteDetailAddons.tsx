// ── Pairs well with ──────────────────────────────────────────────────────
// Compact cross-sell row. Each addon card shows the target piece's icon,
// name, the recommendation copy, and a small "Add to suite" action that
// flips its selection to want. Clicking the card body navigates the panel
// to that item instead (handled by the parent via onNavigate).

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  StationerySuiteAddon,
  StationerySuiteItem,
  StationerySuitePreference,
} from "@/types/stationery";
import { STATIONERY_ADDON_RELATIONSHIP_LABEL } from "@/types/stationery";
import { iconForSuiteKind } from "./icons";

export function SuiteDetailAddons({
  addons,
  itemsById,
  preferences,
  onAddToSuite,
  onNavigate,
}: {
  addons: StationerySuiteAddon[];
  itemsById: Map<string, StationerySuiteItem>;
  preferences: Record<string, StationerySuitePreference>;
  onAddToSuite: (itemId: string) => void;
  onNavigate?: (itemId: string) => void;
}) {
  const resolved = addons
    .map((a) => ({ addon: a, target: itemsById.get(a.addon_item_id) }))
    .filter(
      (r): r is { addon: StationerySuiteAddon; target: StationerySuiteItem } =>
        r.target !== undefined,
    );

  if (resolved.length === 0) return null;

  return (
    <section aria-labelledby="suite-addons-heading" className="space-y-4">
      <div className="space-y-1">
        <p
          id="suite-addons-heading"
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Pairs well with
        </p>
        <h3 className="font-serif text-[18px] text-ink">
          What couples often add alongside
        </h3>
      </div>

      <ul className="space-y-2.5">
        {resolved.map(({ addon, target }) => {
          const pref = preferences[target.id];
          const alreadyWanted = pref === "want";
          const Icon = iconForSuiteKind(target.kind);

          return (
            <li
              key={addon.id}
              className="group flex items-start gap-3 rounded-lg border border-border bg-white px-4 py-3.5 transition-colors hover:border-gold/40 hover:bg-ivory-warm/40"
            >
              <button
                type="button"
                onClick={() => onNavigate?.(target.id)}
                className="flex min-w-0 flex-1 items-start gap-3 text-left"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-ivory-warm text-ink-muted">
                  <Icon size={13} strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-[14.5px] font-medium text-ink">
                      {target.name}
                    </span>
                    <span
                      className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-faint"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {STATIONERY_ADDON_RELATIONSHIP_LABEL[addon.relationship]}
                    </span>
                  </div>
                  <p className="text-[12.5px] leading-relaxed text-ink-muted">
                    {addon.recommendation_copy}
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => onAddToSuite(target.id)}
                disabled={alreadyWanted}
                className={cn(
                  "inline-flex h-7 shrink-0 items-center gap-1 rounded-md border px-2.5 text-[11.5px] font-medium transition-colors",
                  alreadyWanted
                    ? "border-sage/30 bg-sage-pale text-sage cursor-default"
                    : "border-border bg-white text-ink-muted hover:border-gold hover:bg-ivory-warm hover:text-ink",
                )}
                aria-label={
                  alreadyWanted
                    ? `${target.name} already added`
                    : `Add ${target.name} to suite`
                }
              >
                {alreadyWanted ? (
                  "Added"
                ) : (
                  <>
                    <Plus size={11} strokeWidth={2.25} />
                    Add
                  </>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
