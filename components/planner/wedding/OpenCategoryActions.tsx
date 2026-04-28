"use client";

import { PLANNER_PALETTE } from "@/components/planner/ui";
import type {
  AiRecommendation,
  RosterVendor,
  WeddingVendorRow,
} from "@/lib/planner/wedding-detail-seed";

export type FillPath = "ai" | "roster" | "marketplace";

export function OpenCategoryActions({
  row,
  rosterCount,
  onPick,
}: {
  row: WeddingVendorRow;
  rosterCount: number;
  onPick: (path: FillPath) => void;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        backgroundColor: "#FBF4E6",
        boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.32)",
      }}
    >
      <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#9E8245]">
        Fill this category
      </p>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <OptionButton
          glyph="✧"
          title="AI Recommendations"
          subtitle={`Get 3 AI-picked ${row.category.toLowerCase()} vendors tailored to this wedding`}
          onClick={() => onPick("ai")}
        />
        <OptionButton
          glyph="◆"
          title="From My Roster"
          subtitle={`Choose from your ${rosterCount} ${row.category.toLowerCase()} ${
            rosterCount === 1 ? "artist" : "artists"
          } in your vendor network`}
          onClick={() => onPick("roster")}
        />
        <OptionButton
          glyph="⌕"
          title="Browse Marketplace"
          subtitle={`Search all ${row.category.toLowerCase()} vendors on Ananya`}
          onClick={() => onPick("marketplace")}
        />
      </div>
    </div>
  );
}

function OptionButton({
  glyph,
  title,
  subtitle,
  onClick,
}: {
  glyph: string;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col rounded-lg border p-4 text-left transition-colors hover:bg-white"
      style={{
        backgroundColor: "rgba(255,255,255,0.75)",
        borderColor: "rgba(196,162,101,0.32)",
      }}
    >
      <span className="flex items-center gap-2">
        <span
          className="grid h-6 w-6 place-items-center rounded-full text-[12px]"
          style={{
            backgroundColor: "#F5E6D0",
            color: PLANNER_PALETTE.goldDeep,
            boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.5)",
          }}
          aria-hidden
        >
          {glyph}
        </span>
        <span className="text-[13px] font-medium text-[#2C2C2C]">{title}</span>
      </span>
      <span className="mt-2 text-[11.5px] leading-snug text-[#5a5a5a]">
        {subtitle}
      </span>
    </button>
  );
}

// ── AI panel ────────────────────────────────────────────────────────────────

export function AiRecommendationsPanel({
  category,
  recs,
  onSelect,
}: {
  category: string;
  recs: AiRecommendation[];
  onSelect: (vendor: { name: string; priceRange: string; location: string }) => void;
}) {
  if (recs.length === 0) {
    return <EmptyPanel kind="ai" category={category} />;
  }
  return (
    <div
      className="rounded-xl p-4"
      style={{
        backgroundColor: "#FBF4E6",
        boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.32)",
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#9E8245]"
        >
          ✧ AI Recommendations
        </span>
        <span className="text-[11.5px] italic text-[#6a6a6a]"
          style={{ fontFamily: "'EB Garamond', serif" }}
        >
          — picked for Priya & Arjun's wedding
        </span>
      </div>
      <ul className="mt-3 space-y-3">
        {recs.map((r) => (
          <li
            key={r.name}
            className="rounded-lg border bg-white p-4"
            style={{ borderColor: "rgba(196,162,101,0.32)" }}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[14px] font-medium text-[#2C2C2C]">{r.name}</p>
                <p className="mt-0.5 text-[12px] text-[#6a6a6a]">
                  {r.location}
                  <span className="mx-1.5 text-[#b5a68e]">·</span>
                  <span style={{ color: "#8a5a20" }}>★ {r.rating.toFixed(1)}</span>
                  <span className="mx-1.5 text-[#b5a68e]">·</span>
                  <span className="font-mono text-[11.5px]">{r.priceRange}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => onSelect({ name: r.name, priceRange: r.priceRange, location: r.location })}
                className="shrink-0 rounded-full px-3.5 py-1.5 text-[11.5px] font-medium transition-colors"
                style={{
                  backgroundColor: "#2C2C2C",
                  color: "#FAF8F5",
                }}
              >
                Recommend to Couple
              </button>
            </div>
            <p className="mt-3 text-[12.5px] leading-relaxed text-[#4a4a4a]"
              style={{ fontFamily: "'EB Garamond', serif", fontStyle: "italic" }}
            >
              <span className="font-mono not-italic text-[10px] uppercase tracking-[0.22em] text-[#9E8245]">
                Why ·{" "}
              </span>
              {r.why}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Roster panel ────────────────────────────────────────────────────────────

export function RosterPanel({
  category,
  vendors,
  onSelect,
}: {
  category: string;
  vendors: RosterVendor[];
  onSelect: (vendor: { name: string; priceRange: string; location: string }) => void;
}) {
  if (vendors.length === 0) {
    return <EmptyPanel kind="roster" category={category} />;
  }
  return (
    <div
      className="rounded-xl p-4"
      style={{
        backgroundColor: "#FBF4E6",
        boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.32)",
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#9E8245]"
        >
          ◆ From My Roster
        </span>
        <span className="text-[11.5px] italic text-[#6a6a6a]"
          style={{ fontFamily: "'EB Garamond', serif" }}
        >
          — your vetted {category.toLowerCase()} vendors
        </span>
      </div>
      <ul className="mt-3 space-y-2.5">
        {vendors.map((v) => (
          <li
            key={v.name}
            className="rounded-lg border bg-white p-3.5"
            style={{ borderColor: "rgba(196,162,101,0.32)" }}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[14px] font-medium text-[#2C2C2C]">{v.name}</p>
                <p className="mt-0.5 text-[12px] text-[#6a6a6a]">
                  {v.location}
                  <span className="mx-1.5 text-[#b5a68e]">·</span>
                  <span style={{ color: "#8a5a20" }}>★ {v.rating.toFixed(1)}</span>
                  <span className="mx-1.5 text-[#b5a68e]">·</span>
                  <span className="font-mono text-[11.5px]">{v.priceRange}</span>
                  <span className="mx-1.5 text-[#b5a68e]">·</span>
                  <span className="text-[#2C2C2C]">
                    {v.timesWorkedTogether}× together
                  </span>
                </p>
                {v.note && (
                  <p
                    className="mt-1.5 text-[12px] italic text-[#5a5a5a]"
                    style={{ fontFamily: "'EB Garamond', serif" }}
                  >
                    "{v.note}"
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onSelect({ name: v.name, priceRange: v.priceRange, location: v.location })}
                className="shrink-0 rounded-full px-3.5 py-1.5 text-[11.5px] font-medium transition-colors"
                style={{
                  backgroundColor: "#2C2C2C",
                  color: "#FAF8F5",
                }}
              >
                Recommend to Couple
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Marketplace placeholder ─────────────────────────────────────────────────

export function MarketplacePanel({ category }: { category: string }) {
  return (
    <div
      className="flex items-center justify-between gap-4 rounded-xl p-5"
      style={{
        backgroundColor: "#FBF4E6",
        boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.32)",
      }}
    >
      <div>
        <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#9E8245]">
          ⌕ Browse Marketplace
        </p>
        <p className="mt-2 text-[13px] text-[#2C2C2C]">
          Search all {category.toLowerCase()} vendors on Ananya, filtered to Pompton Plains, NJ.
        </p>
        <p
          className="mt-1 text-[12px] italic text-[#6a6a6a]"
          style={{ fontFamily: "'EB Garamond', serif" }}
        >
          Opens the full vendor grid in a new workspace.
        </p>
      </div>
      <a
        href="/marketplace"
        className="shrink-0 rounded-full px-4 py-2 text-[12px] font-medium transition-colors"
        style={{
          backgroundColor: "#2C2C2C",
          color: "#FAF8F5",
        }}
      >
        Open Marketplace →
      </a>
    </div>
  );
}

function EmptyPanel({
  kind,
  category,
}: {
  kind: "ai" | "roster";
  category: string;
}) {
  const copy =
    kind === "ai"
      ? `No AI recommendations yet for ${category.toLowerCase()} — we'll generate 3 picks tailored to this wedding.`
      : `You haven't added any ${category.toLowerCase()} vendors to your roster yet.`;
  return (
    <div
      className="rounded-xl p-5 text-center"
      style={{
        backgroundColor: "#FBF4E6",
        boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.32)",
      }}
    >
      <p className="text-[12.5px] italic text-[#6a6a6a]"
        style={{ fontFamily: "'EB Garamond', serif" }}
      >
        {copy}
      </p>
    </div>
  );
}
