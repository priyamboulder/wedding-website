"use client";

// ── Shortlist & Contract tab ──────────────────────────────────────────────
// Merges the shortlist flow (search → recommendations → saved cards) with
// contract terms + signing in a single tab. Photography is sequential —
// you rarely want the shortlist separate from the contract once you're
// close to booking — so these belong together.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  FileSignature,
  Heart,
  LayoutGrid,
  Mail,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Table as TableIcon,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useVendorsStore } from "@/stores/vendors-store";
import { useRecommendationsStore } from "@/stores/recommendations-store";
import { useVisionStore } from "@/stores/vision-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type {
  ShortlistEntry,
  ShortlistStatus,
  Vendor,
  VendorPackageSpec,
} from "@/types/vendor";
import { SHORTLIST_STATUS_LABEL, SHORTLIST_STATUSES } from "@/types/vendor";
import { formatPriceShort } from "@/lib/vendors/price-display";
import type { WorkspaceCategory } from "@/types/workspace";
import type {
  RecommendationAPIResponse,
  RecommendationRequestContext,
} from "@/types/recommendations";
import {
  EmptyRow,
  Eyebrow,
  PanelCard,
  Tag,
} from "@/components/workspace/blocks/primitives";
import { InlineText } from "@/components/workspace/editable/InlineText";
import { HoverRow, IconButton } from "@/components/workspace/editable/HoverActions";
import { FilesPanel } from "@/components/workspace/shared/FilesPanel";
import { pushUndo } from "@/components/workspace/editable/UndoToast";
import { ContractChecklistBlock } from "@/components/workspace/shared/ContractChecklistBlock";
import { ContractsBlock } from "../ContractsBlock";

const CATEGORY = "photography" as const;
const WEDDING_ID = "default";

type StyleFilter = "all" | "editorial" | "documentary" | "candid" | "fine-art";

export function ShortlistContractTab({ category }: { category: WorkspaceCategory }) {
  return (
    <div className="space-y-8">
      <section className="space-y-6">
        <header className="flex items-baseline gap-3">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Step 1
          </p>
          <h2 className="font-serif text-[22px] leading-tight text-ink">
            Shortlist
          </h2>
        </header>
        <SearchBar />
        <AIRecommendations category={category} />
        <ShortlistedList />
        <CustomVendorAdd />
      </section>

      <div className="border-t border-gold/15 pt-6">
        <header className="mb-4 flex items-baseline gap-3">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Step 2
          </p>
          <h2 className="font-serif text-[22px] leading-tight text-ink">
            Contract
          </h2>
        </header>
        <ContractsBlock category={category} />
        <div className="mt-6">
          <ContractChecklistBlock category={category} />
        </div>
      </div>

      <FilesPanel category={CATEGORY} tab="shortlist" />
    </div>
  );
}

// ── Search bar ───────────────────────────────────────────────────────────

const RECENT_KEY = "ananya:photography-recent-searches";

function SearchBar() {
  const vendors = useVendorsStore((s) => s.vendors);
  const toggleShortlist = useVendorsStore((s) => s.toggleShortlist);
  const shortlist = useVendorsStore((s) => s.shortlist);
  const [query, setQuery] = useState("");
  const [styleFilter, setStyleFilter] = useState<StyleFilter>("all");
  const [location, setLocation] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  function persistRecent(next: string[]) {
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next.slice(0, 6)));
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    const q = query.trim();
    if (persistTimer.current) clearTimeout(persistTimer.current);
    if (!q || q.length < 3) return;
    persistTimer.current = setTimeout(() => {
      setRecent((prev) => {
        const next = [q, ...prev.filter((x) => x !== q)].slice(0, 6);
        persistRecent(next);
        return next;
      });
    }, 1200);
    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current);
    };
  }, [query]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vendors
      .filter((v) => v.category === "photography")
      .filter((v) => {
        if (styleFilter !== "all") {
          return v.style_tags.some((t) => t.toLowerCase().includes(styleFilter));
        }
        return true;
      })
      .filter((v) => {
        if (!location.trim()) return true;
        return v.location?.toLowerCase().includes(location.toLowerCase());
      })
      .filter((v) => {
        if (!q) return true;
        return (
          v.name.toLowerCase().includes(q) ||
          v.location?.toLowerCase().includes(q) ||
          v.style_tags.some((t) => t.toLowerCase().includes(q)) ||
          formatPriceShort(v.price_display).toLowerCase().includes(q)
        );
      })
      .slice(0, 8);
  }, [vendors, query, styleFilter, location]);

  const showResults =
    query.trim().length > 0 || styleFilter !== "all" || location.trim().length > 0;

  return (
    <PanelCard
      icon={<Search size={14} strokeWidth={1.8} />}
      title="Search photographers"
    >
      <div className="flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2 focus-within:border-saffron/60">
        <Search size={13} className="text-ink-faint" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, style, location, or price range…"
          className="flex-1 bg-transparent text-[13px] text-ink placeholder:text-ink-faint outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="text-ink-faint hover:text-ink"
            aria-label="Clear"
          >
            <X size={12} />
          </button>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Eyebrow className="!normal-case">Style</Eyebrow>
        {(["all", "editorial", "documentary", "candid", "fine-art"] as StyleFilter[]).map(
          (s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStyleFilter(s)}
              className={cn(
                "rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors",
                styleFilter === s
                  ? "border-ink bg-ink text-ivory"
                  : "border-border bg-white text-ink-muted hover:border-ink",
              )}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {s}
            </button>
          ),
        )}
        <span className="ml-4" />
        <Eyebrow className="!normal-case">Location</Eyebrow>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Any"
          className="w-32 rounded-sm border border-border bg-white px-2 py-0.5 text-[11.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
        />
      </div>

      {recent.length > 0 && !showResults && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <Eyebrow className="!normal-case">Recent</Eyebrow>
          {recent.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setQuery(r)}
              className="rounded-sm border border-border bg-white px-2 py-0.5 font-mono text-[10.5px] text-ink-muted hover:border-saffron hover:text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {r}
            </button>
          ))}
        </div>
      )}

      {showResults && (
        <ul className="mt-4 divide-y divide-border/60 border-t border-border">
          {results.length === 0 ? (
            <li className="py-3 text-[12.5px] italic text-ink-faint">
              No matches. Try a different search or relax filters.
            </li>
          ) : (
            results.map((v) => {
              const listed = shortlist.some((e) => e.vendor_id === v.id);
              return (
                <li key={v.id} className="flex items-start gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] text-ink">{v.name}</p>
                    <p className="mt-0.5 text-[11.5px] text-ink-muted">
                      {v.location || "—"} · {formatPriceShort(v.price_display)}
                    </p>
                    {v.style_tags.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {v.style_tags.slice(0, 4).map((t) => (
                          <Tag key={t}>{t}</Tag>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleShortlist(v.id)}
                    className={cn(
                      "flex items-center gap-1 rounded-sm border px-2 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] transition-colors",
                      listed
                        ? "border-saffron bg-saffron-pale/40 text-saffron"
                        : "border-border bg-white text-ink-muted hover:border-saffron hover:text-saffron",
                    )}
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    <Heart size={11} className={listed ? "fill-saffron" : ""} />
                    {listed ? "Shortlisted" : "Shortlist"}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </PanelCard>
  );
}

// ── AI recommendations ───────────────────────────────────────────────────

function AIRecommendations({ category }: { category: WorkspaceCategory }) {
  const allRecommendations = useRecommendationsStore((s) => s.recommendations);
  const allDismissals = useRecommendationsStore((s) => s.dismissals);
  const replaceBatch = useRecommendationsStore((s) => s.replaceBatch);
  const setFeedback = useRecommendationsStore((s) => s.setFeedback);
  const dismissVendor = useRecommendationsStore((s) => s.dismissVendor);

  const recommendations = useMemo(
    () =>
      allRecommendations
        .filter(
          (r) => r.wedding_id === WEDDING_ID && r.category === "photography",
        )
        .sort((a, b) => a.rank - b.rank),
    [allRecommendations],
  );
  const dismissals = useMemo(
    () =>
      allDismissals.filter(
        (d) => d.wedding_id === WEDDING_ID && d.category === "photography",
      ),
    [allDismissals],
  );
  const thumbsUp = useMemo(
    () =>
      allRecommendations
        .filter(
          (r) =>
            r.wedding_id === WEDDING_ID &&
            r.category === "photography" &&
            r.feedback === "up",
        )
        .map((r) => r.vendor_id),
    [allRecommendations],
  );
  const thumbsDown = useMemo(
    () =>
      allRecommendations
        .filter(
          (r) =>
            r.wedding_id === WEDDING_ID &&
            r.category === "photography" &&
            r.feedback === "down",
        )
        .map((r) => r.vendor_id),
    [allRecommendations],
  );

  const vendors = useVendorsStore((s) => s.vendors);
  const shortlist = useVendorsStore((s) => s.shortlist);
  const toggleShortlist = useVendorsStore((s) => s.toggleShortlist);
  const keywordsMap = useVisionStore((s) => s.style_keywords);
  const keywords = useMemo(() => keywordsMap["photography"] ?? [], [keywordsMap]);
  const moodboard = useWorkspaceStore((s) => s.moodboard);

  const [loading, setLoading] = useState(false);
  const [usedHeuristic, setUsedHeuristic] = useState(false);

  async function generate(force = false) {
    setLoading(true);
    try {
      const moodboardCount = moodboard.filter(
        (m) => m.category_id === category.id,
      ).length;
      const context: RecommendationRequestContext = {
        wedding_id: WEDDING_ID,
        category: "photography",
        style_keywords: keywords,
        moodboard_summary:
          moodboardCount > 0 ? `${moodboardCount} pinned references.` : undefined,
        color_palette: [],
        wedding_dates: { start: "2026-12-10", end: "2026-12-13" },
        primary_location: "Dallas, TX",
        guest_count: 350,
        budget_band: { min_cents: 800000, max_cents: 1500000 },
        events_needing_coverage: ["mehndi", "sangeet", "wedding", "reception"],
        thumbs_up_vendor_ids: thumbsUp,
        thumbs_down_vendor_ids: thumbsDown,
        dismissed_vendor_ids: dismissals.map((d) => d.vendor_id),
        shortlisted_vendor_ids: shortlist.map((s) => s.vendor_id),
      };
      const res = await fetch("/api/workspace/recommendations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          wedding_id: WEDDING_ID,
          category: "photography",
          limit: 5,
          force_refresh: force,
          context,
        }),
      });
      const body = (await res.json()) as RecommendationAPIResponse;
      replaceBatch(WEDDING_ID, "photography", body.recommendations);
      const allHeuristic =
        body.recommendations.length > 0 &&
        body.recommendations.every((r) => r.model === "heuristic");
      setUsedHeuristic(allHeuristic);
    } catch {
      // heuristic fallback already in API route
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (recommendations.length === 0) void generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeRecs = recommendations.filter((r) => r.feedback !== "dismissed");

  return (
    <PanelCard
      icon={<Sparkles size={14} strokeWidth={1.8} />}
      title="Recommended for you"
      badge={
        <button
          type="button"
          onClick={() => generate(true)}
          disabled={loading}
          className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint hover:text-saffron disabled:opacity-40"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <RefreshCw size={10} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      }
    >
      {usedHeuristic && (
        <p className="mb-3 rounded-sm border border-amber-400 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
          Using heuristic matching — set{" "}
          <code className="font-mono">ANTHROPIC_API_KEY</code> to get Claude-powered
          recommendations.
        </p>
      )}

      {activeRecs.length === 0 ? (
        <EmptyRow>
          {loading
            ? "Finding matches…"
            : "No recommendations yet. Add a few moodboard images + style keywords to kick things off."}
        </EmptyRow>
      ) : (
        <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {activeRecs.map((rec) => {
            const vendor = vendors.find((v) => v.id === rec.vendor_id);
            if (!vendor) return null;
            const listed = shortlist.some((e) => e.vendor_id === rec.vendor_id);
            return (
              <li
                key={rec.id}
                className="flex flex-col gap-2 rounded-md border border-border bg-white p-3"
              >
                <div>
                  <p className="text-[13.5px] font-medium text-ink">{vendor.name}</p>
                  <p className="mt-0.5 text-[11px] text-ink-muted">
                    {vendor.location || "—"} · {formatPriceShort(vendor.price_display)}
                  </p>
                </div>
                <p className="text-[12px] italic leading-relaxed text-ink-soft">
                  "{rec.reason}"
                </p>
                {rec.match_signals.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {rec.match_signals.map((s) => (
                      <Tag key={s} tone="saffron">
                        {s}
                      </Tag>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => toggleShortlist(vendor.id)}
                    className={cn(
                      "flex items-center gap-1 rounded-sm border px-2 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] transition-colors",
                      listed
                        ? "border-saffron bg-saffron-pale/40 text-saffron"
                        : "border-border bg-white text-ink-muted hover:border-saffron hover:text-saffron",
                    )}
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    <Heart size={11} className={listed ? "fill-saffron" : ""} />
                    {listed ? "Saved" : "Shortlist"}
                  </button>
                  <IconButton
                    label="Good match"
                    tone={rec.feedback === "up" ? "saffron" : "ink"}
                    onClick={() => setFeedback(rec.id, "up")}
                    className={cn(
                      rec.feedback === "up" && "!bg-sage-pale/40 !text-sage",
                    )}
                  >
                    <ThumbsUp size={11} />
                  </IconButton>
                  <IconButton
                    label="Bad match"
                    tone={rec.feedback === "down" ? "rose" : "ink"}
                    onClick={() => setFeedback(rec.id, "down")}
                    className={cn(
                      rec.feedback === "down" && "!bg-rose-pale/40 !text-rose",
                    )}
                  >
                    <ThumbsDown size={11} />
                  </IconButton>
                  <button
                    type="button"
                    onClick={() => dismissVendor(WEDDING_ID, "photography", vendor.id)}
                    className="ml-auto font-mono text-[10px] uppercase tracking-[0.08em] text-ink-faint hover:text-rose"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Dismiss
                  </button>
                </div>
                <InlineText
                  value={rec.feedback_note ?? ""}
                  onSave={(n) => setFeedback(rec.id, rec.feedback ?? "up", n)}
                  placeholder="Why this one?"
                  emptyLabel="Add a note…"
                  allowEmpty
                  className="!py-0 text-[11.5px]"
                />
              </li>
            );
          })}
        </ul>
      )}
    </PanelCard>
  );
}

// ── Shortlisted cards ────────────────────────────────────────────────────

function ShortlistedList() {
  const vendors = useVendorsStore((s) => s.vendors);
  const shortlist = useVendorsStore((s) => s.shortlist);
  const removeFromShortlist = useVendorsStore((s) => s.removeFromShortlist);
  const updateShortlistEntry = useVendorsStore((s) => s.updateShortlistEntry);
  const setShortlistStatus = useVendorsStore((s) => s.setShortlistStatus);
  const toggleShortlist = useVendorsStore((s) => s.toggleShortlist);
  const [view, setView] = useState<"cards" | "compare">("cards");

  const rows = useMemo(() => {
    const withVendor = shortlist
      .map((e) => ({ entry: e, vendor: vendors.find((v) => v.id === e.vendor_id) }))
      .filter(
        (x): x is { entry: ShortlistEntry; vendor: Vendor } =>
          !!x.vendor && x.vendor.category === "photography",
      );
    return withVendor.sort((a, b) => {
      if (a.entry.status === "ruled_out" && b.entry.status !== "ruled_out")
        return 1;
      if (b.entry.status === "ruled_out" && a.entry.status !== "ruled_out")
        return -1;
      const ao = a.entry.sort_order ?? Number.MAX_SAFE_INTEGER;
      const bo = b.entry.sort_order ?? Number.MAX_SAFE_INTEGER;
      if (ao !== bo) return ao - bo;
      return (
        new Date(b.entry.saved_at).getTime() -
        new Date(a.entry.saved_at).getTime()
      );
    });
  }, [shortlist, vendors]);

  return (
    <PanelCard
      icon={<Heart size={14} strokeWidth={1.8} />}
      title="Your shortlist"
      badge={
        <div className="flex items-center gap-2">
          <Tag>{rows.length}</Tag>
          {rows.length >= 2 && (
            <div className="flex overflow-hidden rounded-sm border border-border">
              <button
                type="button"
                onClick={() => setView("cards")}
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors",
                  view === "cards"
                    ? "bg-ink text-ivory"
                    : "bg-white text-ink-muted hover:text-ink",
                )}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <LayoutGrid size={10} /> Cards
              </button>
              <button
                type="button"
                onClick={() => setView("compare")}
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors",
                  view === "compare"
                    ? "bg-ink text-ivory"
                    : "bg-white text-ink-muted hover:text-ink",
                )}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <TableIcon size={10} /> Compare
              </button>
            </div>
          )}
        </div>
      }
    >
      {rows.length === 0 ? (
        <EmptyRow>
          Nothing shortlisted yet. Use the search above or pick a recommendation.
        </EmptyRow>
      ) : view === "compare" ? (
        <ComparisonTable
          rows={rows.filter((r) => r.entry.status !== "ruled_out")}
          onUpdatePackage={(vendorId, patch) => {
            const entry = shortlist.find((s) => s.vendor_id === vendorId);
            updateShortlistEntry(vendorId, {
              package: { ...(entry?.package ?? {}), ...patch },
            });
          }}
        />
      ) : (
        <ul className="space-y-3">
          {rows.map(({ entry, vendor }) => (
            <li key={vendor.id}>
              <ShortlistCard
                vendor={vendor}
                entry={entry}
                onStatusChange={(s) => setShortlistStatus(vendor.id, s)}
                onNotesChange={(n) =>
                  updateShortlistEntry(vendor.id, { notes: n })
                }
                onRateChange={(r) =>
                  updateShortlistEntry(vendor.id, { personal_rating: r })
                }
                onRuledOutReason={(r) =>
                  updateShortlistEntry(vendor.id, { ruled_out_reason: r })
                }
                onRemove={() => {
                  const snap = { ...entry };
                  removeFromShortlist(vendor.id);
                  pushUndo({
                    message: `Removed ${vendor.name} from shortlist`,
                    undo: () => {
                      toggleShortlist(vendor.id);
                      setTimeout(
                        () => updateShortlistEntry(vendor.id, snap),
                        0,
                      );
                    },
                  });
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </PanelCard>
  );
}

function ShortlistCard({
  vendor,
  entry,
  onStatusChange,
  onNotesChange,
  onRateChange,
  onRuledOutReason,
  onRemove,
}: {
  vendor: Vendor;
  entry: ShortlistEntry;
  onStatusChange: (s: ShortlistStatus) => void;
  onNotesChange: (n: string) => void;
  onRateChange: (r: number | null) => void;
  onRuledOutReason: (r: string) => void;
  onRemove: () => void;
}) {
  const isRuledOut = entry.status === "ruled_out";
  return (
    <div
      className={cn(
        "rounded-md border bg-white p-4",
        isRuledOut ? "border-border/60 opacity-70" : "border-border",
      )}
    >
      <HoverRow className="items-start">
        <HoverRow.Main>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
            <p className="text-[14px] font-medium text-ink">{vendor.name}</p>
            {vendor.location && (
              <span className="text-[11.5px] text-ink-muted">{vendor.location}</span>
            )}
            {vendor.rating !== null && (
              <span
                className="font-mono text-[11px] text-saffron"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                ★ {vendor.rating.toFixed(1)}
              </span>
            )}
            {entry.is_custom && <Tag tone="stone">custom</Tag>}
          </div>
          <p
            className="mt-0.5 font-mono text-[10.5px] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {formatPriceShort(vendor.price_display)}
          </p>
          {vendor.style_tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {vendor.style_tags.slice(0, 5).map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          )}
        </HoverRow.Main>
        <HoverRow.Actions>
          <IconButton label="Email vendor" tone="ink">
            <Mail size={12} />
          </IconButton>
          <IconButton label="Open in Vendors page" tone="ink">
            <MessageSquare size={12} />
          </IconButton>
          <IconButton label="Remove from shortlist" tone="rose" onClick={onRemove}>
            <Trash2 size={12} />
          </IconButton>
        </HoverRow.Actions>
      </HoverRow>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Eyebrow className="!normal-case">Status</Eyebrow>
        {SHORTLIST_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onStatusChange(s)}
            className={cn(
              "rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors",
              entry.status === s
                ? s === "booked"
                  ? "border-saffron bg-saffron text-ivory"
                  : s === "ruled_out"
                    ? "border-ink-faint bg-ink-faint/30 text-ink-muted"
                    : "border-ink bg-ink text-ivory"
                : "border-border bg-white text-ink-muted hover:border-ink",
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {SHORTLIST_STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Eyebrow className="!normal-case">Your rating</Eyebrow>
        {[1, 2, 3, 4, 5].map((n) => {
          const active = (entry.personal_rating ?? 0) >= n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onRateChange(entry.personal_rating === n ? null : n)}
              aria-label={`Rate ${n}`}
              className="transition-colors"
            >
              <Star
                size={14}
                className={active ? "fill-gold text-gold" : "text-ink-faint"}
                strokeWidth={1.5}
              />
            </button>
          );
        })}
        {entry.personal_rating && (
          <button
            type="button"
            onClick={() => onRateChange(null)}
            className="ml-1 font-mono text-[10px] text-ink-faint hover:text-rose"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            clear
          </button>
        )}
      </div>

      <div className="mt-3">
        <Eyebrow className="mb-1 !normal-case">Personal notes</Eyebrow>
        <InlineText
          value={entry.notes}
          onSave={onNotesChange}
          variant="block"
          placeholder="Jot impressions, questions, next steps…"
          emptyLabel="Click to add notes…"
          allowEmpty
        />
      </div>

      {isRuledOut && (
        <div className="mt-3">
          <Eyebrow className="mb-1 !normal-case">Why we passed</Eyebrow>
          <InlineText
            value={entry.ruled_out_reason ?? ""}
            onSave={onRuledOutReason}
            placeholder="e.g. too posed for our taste"
            emptyLabel="Click to add reason…"
            allowEmpty
          />
        </div>
      )}

      <div className="mt-3 border-t border-border pt-3">
        <FilesPanel
          category={CATEGORY}
          tab="shortlist"
          defaultVendorId={vendor.id}
          variant="preview"
          previewLimit={3}
        />
      </div>
    </div>
  );
}

// ── Comparison table ─────────────────────────────────────────────────────
// Spec: side-by-side view with rows for hours, second shooter, engagement
// shoot, album pages, delivery timeline, travel fee, overtime rate.
// Differences across vendors highlighted in rose.

interface ComparisonField {
  key: keyof VendorPackageSpec;
  label: string;
  type: "number" | "boolean" | "text";
}

const COMPARISON_FIELDS: ComparisonField[] = [
  { key: "hours", label: "Coverage hours", type: "number" },
  { key: "second_shooter", label: "Second shooter", type: "boolean" },
  { key: "engagement_shoot", label: "Engagement shoot", type: "boolean" },
  { key: "edited_image_count", label: "Edited images", type: "number" },
  { key: "album_pages", label: "Album pages", type: "number" },
  { key: "album_included", label: "Album included", type: "boolean" },
  { key: "delivery_weeks", label: "Delivery (weeks)", type: "number" },
  { key: "travel_fee", label: "Travel fee", type: "text" },
  { key: "overtime_rate", label: "Overtime rate", type: "text" },
];

function ComparisonTable({
  rows,
  onUpdatePackage,
}: {
  rows: { entry: ShortlistEntry; vendor: Vendor }[];
  onUpdatePackage: (vendorId: string, patch: Partial<VendorPackageSpec>) => void;
}) {
  if (rows.length === 0) {
    return (
      <EmptyRow>
        Only ruled-out vendors left in your shortlist — switch back to cards.
      </EmptyRow>
    );
  }

  // A cell is a "difference" when not every vendor shares the same value.
  function hasDiffs(field: ComparisonField): boolean {
    const values = rows.map((r) =>
      JSON.stringify(r.entry.package?.[field.key] ?? null),
    );
    return new Set(values).size > 1;
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="min-w-full border-collapse text-[12.5px]">
        <thead>
          <tr className="border-b border-border bg-ivory-warm/60">
            <th className="sticky left-0 z-10 bg-ivory-warm/60 px-3 py-2 text-left font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted">
              Package
            </th>
            {rows.map(({ vendor }) => (
              <th
                key={vendor.id}
                className="border-l border-border px-3 py-2 text-left"
              >
                <div className="font-serif text-[14px] text-ink">
                  {vendor.name}
                </div>
                <div className="font-mono text-[10px] text-ink-muted">
                  {formatPriceShort(vendor.price_display)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMPARISON_FIELDS.map((field) => {
            const diff = hasDiffs(field);
            return (
              <tr key={field.key} className="border-b border-border/60">
                <td className="sticky left-0 z-10 bg-white px-3 py-1.5 text-[11.5px] text-ink-muted">
                  {field.label}
                </td>
                {rows.map(({ entry, vendor }) => (
                  <td
                    key={vendor.id}
                    className={cn(
                      "border-l border-border px-3 py-1.5",
                      diff && "bg-rose-pale/20",
                    )}
                  >
                    <ComparisonCell
                      field={field}
                      value={entry.package?.[field.key] ?? null}
                      onChange={(val) =>
                        onUpdatePackage(vendor.id, { [field.key]: val })
                      }
                    />
                  </td>
                ))}
              </tr>
            );
          })}
          <tr className="border-b border-border/60">
            <td className="sticky left-0 z-10 bg-white px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted">
              Style tags
            </td>
            {rows.map(({ vendor }) => (
              <td key={vendor.id} className="border-l border-border px-3 py-1.5">
                <div className="flex flex-wrap gap-1">
                  {vendor.style_tags.slice(0, 4).map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <p className="border-t border-border bg-ivory-warm/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
        Rose-shaded rows are where the offerings differ. Fill in any blanks as
        you hear back from each photographer.
      </p>
    </div>
  );
}

function ComparisonCell({
  field,
  value,
  onChange,
}: {
  field: ComparisonField;
  value: string | number | boolean | null | undefined;
  onChange: (v: string | number | boolean | null) => void;
}) {
  if (field.type === "boolean") {
    return (
      <div className="flex gap-1">
        {(["yes", "no", "—"] as const).map((opt) => {
          const v = opt === "yes" ? true : opt === "no" ? false : null;
          const active =
            (opt === "yes" && value === true) ||
            (opt === "no" && value === false) ||
            (opt === "—" && (value === null || value === undefined));
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(v)}
              className={cn(
                "rounded-sm border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors",
                active
                  ? "border-ink bg-ink text-ivory"
                  : "border-border bg-white text-ink-muted hover:border-ink",
              )}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    );
  }

  if (field.type === "number") {
    return (
      <input
        type="number"
        value={
          value === null || value === undefined ? "" : String(value)
        }
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") onChange(null);
          else {
            const n = Number(raw);
            if (!Number.isNaN(n)) onChange(n);
          }
        }}
        placeholder="—"
        className="w-20 rounded-sm border border-border bg-white px-1.5 py-0.5 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
      />
    );
  }

  return (
    <input
      type="text"
      value={
        value === null || value === undefined ? "" : String(value)
      }
      onChange={(e) => {
        const v = e.target.value;
        onChange(v === "" ? null : v);
      }}
      placeholder="—"
      className="w-32 rounded-sm border border-border bg-white px-1.5 py-0.5 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
    />
  );
}

// ── Custom vendor add ────────────────────────────────────────────────────

function CustomVendorAdd() {
  const addCustomVendor = useVendorsStore((s) => s.addCustomVendor);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [priceRange, setPriceRange] = useState("");

  function submit() {
    if (!name.trim()) return;
    addCustomVendor({
      name,
      category: "photography",
      location,
      notes: priceRange ? `Quoted: ${priceRange}` : undefined,
    });
    setName("");
    setLocation("");
    setPriceRange("");
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md border border-dashed border-border bg-white px-4 py-2.5 text-[12.5px] text-ink-muted transition-colors hover:border-saffron hover:text-saffron"
      >
        <UserPlus size={12} />
        Add custom photographer (friend recommendation, referral, etc.)
      </button>
    );
  }

  return (
    <div className="rounded-md border border-border bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <Eyebrow>Add custom photographer</Eyebrow>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-ink-faint hover:text-ink"
          aria-label="Cancel"
        >
          <X size={12} />
        </button>
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name *"
          className="rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
        />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          className="rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
        />
        <input
          type="text"
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value)}
          placeholder="Price range (e.g. $8k–$12k)"
          className="rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
        />
      </div>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={submit}
          disabled={!name.trim()}
          className="flex items-center gap-1 rounded-sm bg-ink px-3 py-1.5 text-[11.5px] font-medium text-ivory transition-colors hover:bg-ink-soft disabled:opacity-40"
        >
          <Plus size={11} /> Add to shortlist
        </button>
      </div>
    </div>
  );
}
