"use client";

import { X, Star, Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VendorWithDiscovery } from "@/types/vendor-discovery";
import { formatPriceShort } from "@/lib/vendors/price-display";
import { CATEGORY_LABELS } from "@/lib/vendor-categories";
import { matchScore, matchBand } from "@/lib/vendors/style-matching";
import { availabilityStateFor } from "@/lib/vendors/availability";
import type { StyleSignature } from "@/types/vendor-discovery";

interface ComparisonDrawerProps {
  open: boolean;
  onClose: () => void;
  vendors: VendorWithDiscovery[];
  onRemove: (vendorId: string) => void;
  coupleStyle: StyleSignature | null;
  targetDateIso: string | null;
  venueName: string | null;
  plannerCompany: string | null;
}

// Side-by-side comparison. Rows highlight the "best" value (lowest price,
// highest rating, most reviews, most matches) in gold.

export function ComparisonDrawer({
  open,
  onClose,
  vendors,
  onRemove,
  coupleStyle,
  targetDateIso,
  venueName,
  plannerCompany,
}: ComparisonDrawerProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-end bg-ink/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={cn(
          "flex h-full w-full max-w-6xl flex-col overflow-hidden bg-ivory shadow-[-16px_0_48px_-12px_rgba(26,26,26,0.2)]",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-border bg-white px-6 py-4">
          <div>
            <h2 className="font-serif text-[20px] text-ink">
              Compare {vendors.length} {vendors.length === 1 ? "vendor" : "vendors"}
            </h2>
            <p className="mt-0.5 text-[12px] text-ink-muted">
              Side-by-side on pricing, experience, and fit.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-ink-muted transition-colors hover:bg-ivory-warm hover:text-ink"
            aria-label="Close"
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </header>

        <div className="flex-1 overflow-auto p-6">
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `200px repeat(${vendors.length}, minmax(220px, 1fr))`,
            }}
          >
            {/* Header row */}
            <div />
            {vendors.map((v) => (
              <VendorHead key={v.id} vendor={v} onRemove={() => onRemove(v.id)} />
            ))}

            {/* Rows */}
            <Row
              label="Category"
              values={vendors.map((v) => ({
                id: v.id,
                text: CATEGORY_LABELS[v.category],
              }))}
            />

            <Row
              label="Rating"
              values={vendors.map((v) => ({
                id: v.id,
                text: v.rating != null ? `${v.rating.toFixed(1)} / 5` : "—",
                badge: v.rating,
              }))}
              highlightBy="max"
              highlightKey={(v) => v.rating ?? 0}
              vendors={vendors}
            />

            <Row
              label="Reviews"
              values={vendors.map((v) => ({
                id: v.id,
                text: `${v.review_count}`,
              }))}
              highlightBy="max"
              highlightKey={(v) => v.review_count}
              vendors={vendors}
            />

            <Row
              label="Weddings shot"
              values={vendors.map((v) => ({
                id: v.id,
                text: `${v.wedding_count}`,
              }))}
              highlightBy="max"
              highlightKey={(v) => v.wedding_count}
              vendors={vendors}
            />

            <Row
              label="Price"
              values={vendors.map((v) => ({
                id: v.id,
                text: formatPriceShort(v.price_display),
              }))}
            />

            <Row
              label="Response time"
              values={vendors.map((v) => ({
                id: v.id,
                text:
                  v.response_time_hours != null
                    ? `${v.response_time_hours}h`
                    : "—",
              }))}
              highlightBy="min"
              highlightKey={(v) => v.response_time_hours ?? Infinity}
              vendors={vendors}
            />

            <Row
              label="Travel"
              values={vendors.map((v) => ({
                id: v.id,
                text: v.travel_level,
              }))}
            />

            <Row
              label="Venue experience"
              values={vendors.map((v) => {
                if (!venueName) return { id: v.id, text: "—" };
                const match = v.venue_connections.find((vc) =>
                  venueName.toLowerCase().includes(vc.name.toLowerCase()),
                );
                return {
                  id: v.id,
                  text: match ? `${match.wedding_count} at your venue` : "—",
                };
              })}
            />

            <Row
              label="Planner overlap"
              values={vendors.map((v) => {
                if (!plannerCompany) return { id: v.id, text: "—" };
                const match = v.planner_connections.find(
                  (p) =>
                    p.company.toLowerCase() === plannerCompany.toLowerCase(),
                );
                return {
                  id: v.id,
                  text: match ? `${match.wedding_count} with planner` : "—",
                };
              })}
            />

            <Row
              label="Style match"
              values={vendors.map((v) => {
                if (!coupleStyle || !v.style_signature) {
                  return { id: v.id, text: "—" };
                }
                const s = matchScore(coupleStyle, v.style_signature);
                const band = matchBand(s);
                if (band === "weak") return { id: v.id, text: `${Math.round(s * 100)}%` };
                return {
                  id: v.id,
                  text: `${Math.round(s * 100)}% · ${band}`,
                };
              })}
            />

            <Row
              label="Video profile"
              values={vendors.map((v) => ({
                id: v.id,
                text: v.video_profile?.badge === "earned" ? "Yes" : "—",
                bool: v.video_profile?.badge === "earned",
              }))}
            />

            <Row
              label="Availability"
              values={vendors.map((v) => {
                if (!targetDateIso) return { id: v.id, text: "—" };
                const state = availabilityStateFor(v.availability, targetDateIso);
                const labelMap: Record<typeof state, string> = {
                  available: "Available",
                  tentative: "Tentative",
                  booked: "Booked",
                  unknown: "Unknown",
                };
                return { id: v.id, text: labelMap[state] };
              })}
            />

            <Row
              label="Style tags"
              values={vendors.map((v) => ({
                id: v.id,
                text: (v.style_tags ?? []).slice(0, 4).join(", ") || "—",
                long: true,
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface RowValue {
  id: string;
  text: string;
  badge?: number | null;
  bool?: boolean;
  long?: boolean;
}

function Row({
  label,
  values,
  highlightBy,
  highlightKey,
  vendors,
}: {
  label: string;
  values: RowValue[];
  highlightBy?: "min" | "max";
  highlightKey?: (v: VendorWithDiscovery) => number;
  vendors?: VendorWithDiscovery[];
}) {
  let bestId: string | null = null;
  if (highlightBy && highlightKey && vendors) {
    const ranked = [...vendors].sort((a, b) =>
      highlightBy === "max"
        ? highlightKey(b) - highlightKey(a)
        : highlightKey(a) - highlightKey(b),
    );
    bestId = ranked[0]?.id ?? null;
  }

  return (
    <>
      <div className="flex items-center border-t border-border py-3">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {label}
        </span>
      </div>

      {values.map((val) => (
        <div
          key={val.id}
          className={cn(
            "flex items-center border-t border-border py-3 text-[13px] text-ink",
            bestId === val.id && "text-gold",
          )}
        >
          {val.text === "—" ? (
            <Minus size={14} strokeWidth={1.5} className="text-ink-faint" />
          ) : val.bool !== undefined ? (
            val.bool ? (
              <Check size={14} strokeWidth={2} className="text-sage" />
            ) : (
              <Minus size={14} strokeWidth={1.5} className="text-ink-faint" />
            )
          ) : label === "Rating" && val.badge != null ? (
            <span className="flex items-center gap-1">
              <Star size={12} strokeWidth={1.8} fill="currentColor" className="text-saffron" />
              <span>{val.text}</span>
            </span>
          ) : (
            <span className={cn(val.long && "line-clamp-2")}>{val.text}</span>
          )}
          {bestId === val.id && (
            <span
              className="ml-2 font-mono text-[8.5px] uppercase tracking-[0.16em] text-gold/80"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Best
            </span>
          )}
        </div>
      ))}
    </>
  );
}

function VendorHead({
  vendor,
  onRemove,
}: {
  vendor: VendorWithDiscovery;
  onRemove: () => void;
}) {
  const img = vendor.cover_image || (vendor.portfolio_images ?? [])[0]?.url;
  return (
    <div className="flex flex-col gap-2">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[10px] bg-ivory-warm">
        {img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={vendor.name} className="h-full w-full object-cover" />
        )}
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove"
          className="absolute right-1.5 top-1.5 rounded-full bg-ink/70 p-1 text-ivory transition-colors hover:bg-ink"
        >
          <X size={10} strokeWidth={2} />
        </button>
      </div>
      <h4 className="line-clamp-2 font-serif text-[14px] leading-snug text-ink">
        {vendor.name}
      </h4>
      <p
        className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {vendor.location}
      </p>
    </div>
  );
}
