"use client";

// ── My Vendors view ─────────────────────────────────────────────────────────
// The original /vendors page body, extracted into a dedicated component so
// that /vendors can host a top-level tab shell (My Vendors / Coordination).
// Behaviour unchanged — still manages the global vendor directory, shortlist,
// task links, CSV export, and vendor profile drawer.

import { useCallback, useMemo, useState } from "react";
import {
  Download,
  LayoutGrid,
  Plane,
  Plus,
  Rows,
  Upload,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TopNav } from "@/components/shell/TopNav";
import { useChecklistStore } from "@/stores/checklist-store";
import { useVendorsStore } from "@/stores/vendors-store";
import { useVenueStore } from "@/stores/venue-store";
import type { ChecklistItem } from "@/types/checklist";
import type { Vendor, VendorFilters } from "@/types/vendor";
import { EMPTY_FILTERS, SHORTLIST_STATUS_LABEL } from "@/types/vendor";
import { CATEGORY_LABELS } from "@/lib/vendor-categories";
import { formatPriceShort } from "@/lib/vendors/price-display";
import {
  applyVendorFilters,
  filtersAreEmpty,
  groupVendors,
  sortVendors,
  type VendorFilterContext,
  type VendorGroupKey,
  type VendorSortKey,
} from "@/lib/vendors/filters";
import { parseNaturalLanguageQuery } from "@/lib/vendors/ai-search";
import { VendorCard } from "@/components/vendors/VendorCard";
import { VendorTable } from "@/components/vendors/VendorTable";
import { VendorProfilePanel } from "@/components/vendors/VendorProfilePanel";
import { InquiryDialog } from "@/components/vendors/InquiryDialog";
import { VendorFilterRail } from "@/components/vendors/VendorFilterRail";
import { ExcelImportModal } from "@/components/vendors/ExcelImportModal";
import { AddVendorModal } from "@/components/vendors/AddVendorModal";
import { AISearchInput } from "@/components/vendors/AISearchInput";
import { AIRecommendationSection } from "@/components/vendors/AIRecommendationSection";
import type { VendorCategory } from "@/types/vendor";
import { VendorsTabBar } from "@/components/vendors/VendorsTabBar";
import { RouletteBanner } from "@/components/vendors/RouletteBanner";

const DEFAULT_GROUP: VendorGroupKey = "category";

const PRICE_TIER_LABEL: Record<string, string> = {
  budget: "Budget",
  mid: "Mid",
  premium: "Premium",
  luxe: "Luxe",
  unknown: "Price unknown",
};

export function MyVendorsView({
  coordinationBadge,
  favoritesBadge,
}: {
  coordinationBadge?: string | null;
  favoritesBadge?: string | null;
}) {
  const vendors = useVendorsStore((s) => s.vendors);
  const shortlist = useVendorsStore((s) => s.shortlist);
  const taskLinks = useVendorsStore((s) => s.taskLinks);
  const isShortlisted = useVendorsStore((s) => s.isShortlisted);
  const toggleShortlist = useVendorsStore((s) => s.toggleShortlist);
  const removeFromShortlist = useVendorsStore((s) => s.removeFromShortlist);

  const tasks = useChecklistStore((s) => s.items);
  const venueProfileName = useVenueStore((s) => s.profile.name);

  const [filters, setFilters] = useState<VendorFilters>(EMPTY_FILTERS);
  const [view, setView] = useState<"grid" | "table">("grid");
  const [group, setGroup] = useState<VendorGroupKey>(DEFAULT_GROUP);
  const [sort, setSort] = useState<VendorSortKey>("relevance");
  const [importOpen, setImportOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [drawerVendorId, setDrawerVendorId] = useState<string | null>(null);
  const [inquiryVendorId, setInquiryVendorId] = useState<string | null>(null);
  const [inquirySource, setInquirySource] =
    useState<"marketplace" | "profile_panel">("marketplace");

  const ctx: VendorFilterContext = useMemo(() => {
    const shortlistIds = new Set(shortlist.map((e) => e.vendor_id));
    const linkedVendorIds = new Set(taskLinks.map((l) => l.vendor_id));
    const statusByVendorId = new Map(
      shortlist.map((e) => [e.vendor_id, e.status]),
    );
    return { shortlistIds, linkedVendorIds, statusByVendorId };
  }, [shortlist, taskLinks]);

  const tasksById = useMemo(() => {
    const m = new Map<string, ChecklistItem>();
    for (const t of tasks) m.set(t.id, t);
    return m;
  }, [tasks]);

  const handleQueryChange = useCallback(
    (q: string) => {
      if (filters.aiMode) {
        const parsed = parseNaturalLanguageQuery(q);
        setFilters({ ...parsed, aiMode: true });
      } else {
        setFilters((f) => ({ ...f, query: q }));
      }
    },
    [filters.aiMode],
  );

  const handleToggleAiMode = useCallback(() => {
    setFilters((f) => {
      if (f.aiMode) return { ...EMPTY_FILTERS, query: f.query };
      return { ...parseNaturalLanguageQuery(f.query), aiMode: true };
    });
  }, []);

  const filtered = useMemo(
    () => applyVendorFilters(vendors, filters, ctx),
    [vendors, filters, ctx],
  );
  const sorted = useMemo(() => sortVendors(filtered, sort), [filtered, sort]);
  const grouped = useMemo(
    () => groupVendors(sorted, group, ctx),
    [sorted, group, ctx],
  );

  const firstLinkedTaskTitle = useCallback(
    (vendorId: string): { title: string | null; count: number } => {
      const links = taskLinks.filter((l) => l.vendor_id === vendorId);
      if (links.length === 0) return { title: null, count: 0 };
      const t = tasksById.get(links[0].task_id);
      return { title: t?.title ?? null, count: links.length };
    },
    [taskLinks, tasksById],
  );

  const handleHeart = useCallback(
    (vendorId: string) => {
      const saved = isShortlisted(vendorId);
      if (saved) {
        const linkedCount = taskLinks.filter(
          (l) => l.vendor_id === vendorId,
        ).length;
        if (linkedCount > 0) {
          const ok = window.confirm(
            `This vendor is linked to ${linkedCount} task${linkedCount === 1 ? "" : "s"}. Unsaving will unlink them. Continue?`,
          );
          if (!ok) return;
          removeFromShortlist(vendorId);
          return;
        }
      }
      toggleShortlist(vendorId);
    },
    [isShortlisted, taskLinks, toggleShortlist, removeFromShortlist],
  );

  const drawerVendor = useMemo(
    () => vendors.find((v) => v.id === drawerVendorId) ?? null,
    [vendors, drawerVendorId],
  );

  const inquiryVendor = useMemo(
    () => vendors.find((v) => v.id === inquiryVendorId) ?? null,
    [vendors, inquiryVendorId],
  );

  const openInquiryFromCard = useCallback((id: string) => {
    setInquirySource("marketplace");
    setInquiryVendorId(id);
  }, []);

  const openInquiryFromPanel = useCallback((id: string) => {
    setInquirySource("profile_panel");
    setInquiryVendorId(id);
  }, []);

  const hasAny = vendors.length > 0;
  const hasMatches = sorted.length > 0;

  const exportCsv = useCallback(() => {
    if (!hasAny) return;
    const header = [
      "name",
      "category",
      "location",
      "price_range",
      "rating",
      "review_count",
      "status",
      "linked_task_count",
      "shortlisted_at",
    ];
    const rows = sorted.map((v) => {
      const status = ctx.statusByVendorId.get(v.id) ?? "";
      const linked = taskLinks.filter((l) => l.vendor_id === v.id).length;
      const entry = shortlist.find((e) => e.vendor_id === v.id);
      return [
        v.name,
        CATEGORY_LABELS[v.category],
        v.location,
        formatPriceShort(v.price_display),
        v.rating != null ? v.rating.toFixed(1) : "",
        String(v.review_count),
        status ? SHORTLIST_STATUS_LABEL[status] : "",
        String(linked),
        entry?.saved_at ?? "",
      ];
    });
    const csv = [header, ...rows]
      .map((r) =>
        r
          .map((cell) => {
            const s = String(cell ?? "");
            return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
          })
          .join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vendors-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sorted, ctx, taskLinks, shortlist, hasAny]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <TopNav>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory transition-opacity hover:opacity-90"
          >
            <Plus size={13} strokeWidth={1.8} />
            Add Vendor
          </button>
          <button
            onClick={() => setImportOpen(true)}
            className="flex items-center gap-1.5 rounded-md border border-gold/25 bg-gold-pale/30 px-3 py-1.5 text-[12px] font-medium text-gold transition-colors hover:border-gold/40 hover:bg-gold-pale/50"
          >
            <Upload size={13} strokeWidth={1.6} />
            Import from Excel
          </button>
          <button
            onClick={exportCsv}
            disabled={!hasAny}
            title="Export visible vendors to CSV"
            className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-ink/20 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={13} strokeWidth={1.6} />
            CSV
          </button>
        </div>
      </TopNav>

      <VendorsTabBar
        activeTab="my-vendors"
        coordinationBadge={coordinationBadge}
        favoritesBadge={favoritesBadge}
      />

      <div className="flex flex-1 overflow-hidden">
        <VendorFilterRail
          vendors={vendors}
          filters={filters}
          ctx={ctx}
          onChange={setFilters}
        />

        <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-8">
          {!hasAny ? (
            <EmptyDirectoryState
              onImport={() => setImportOpen(true)}
              onAdd={() => setAddOpen(true)}
            />
          ) : (
            <>
              <RouletteBanner />

              <AIRecommendationSection
                onOpenVendor={(id) => setDrawerVendorId(id)}
                onToggleShortlist={handleHeart}
                onJumpToCategory={(category: VendorCategory) => {
                  setFilters((f) => ({ ...f, category }));
                  setGroup("category");
                }}
              />

              <ControlsBar
                query={filters.query}
                onQuery={handleQueryChange}
                aiMode={filters.aiMode}
                onToggleAiMode={handleToggleAiMode}
                view={view}
                onView={setView}
                group={group}
                onGroup={setGroup}
                sort={sort}
                onSort={setSort}
                resultCount={sorted.length}
                totalCount={vendors.length}
              />

              <DestinationBanner
                vendors={vendors}
                filters={filters}
                onApply={(next) => setFilters(next)}
              />

              {!hasMatches ? (
                <EmptyMatchesState
                  onClear={() =>
                    setFilters({ ...EMPTY_FILTERS, query: "", aiMode: false })
                  }
                  filtersDirty={!filtersAreEmpty(filters)}
                />
              ) : view === "grid" ? (
                <VendorGrid
                  groups={grouped}
                  group={group}
                  ctx={ctx}
                  taskLinkLookup={firstLinkedTaskTitle}
                  onOpen={(id) => setDrawerVendorId(id)}
                  onHeart={handleHeart}
                  onInquire={openInquiryFromCard}
                />
              ) : (
                <VendorTable
                  vendors={sorted}
                  shortlistIds={ctx.shortlistIds}
                  statusByVendorId={ctx.statusByVendorId}
                  taskLinks={taskLinks}
                  tasksById={tasksById}
                  onOpen={(id) => setDrawerVendorId(id)}
                  onToggleShortlist={handleHeart}
                />
              )}
            </>
          )}
        </main>
      </div>

      <VendorProfilePanel
        vendor={drawerVendor}
        onClose={() => setDrawerVendorId(null)}
        onOpenVendor={(id) => setDrawerVendorId(id)}
        onInquire={openInquiryFromPanel}
        coupleVenueName={venueProfileName || null}
      />

      <InquiryDialog
        vendor={inquiryVendor}
        source={inquirySource}
        onClose={() => setInquiryVendorId(null)}
      />

      <ExcelImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
      />

      <AddVendorModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
      />
    </div>
  );
}

// ── Controls bar ────────────────────────────────────────────────────────────

function ControlsBar({
  query,
  onQuery,
  aiMode,
  onToggleAiMode,
  view,
  onView,
  group,
  onGroup,
  sort,
  onSort,
  resultCount,
  totalCount,
}: {
  query: string;
  onQuery: (q: string) => void;
  aiMode: boolean;
  onToggleAiMode: () => void;
  view: "grid" | "table";
  onView: (v: "grid" | "table") => void;
  group: VendorGroupKey;
  onGroup: (g: VendorGroupKey) => void;
  sort: VendorSortKey;
  onSort: (s: VendorSortKey) => void;
  resultCount: number;
  totalCount: number;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <AISearchInput
        value={query}
        onChange={onQuery}
        aiMode={aiMode}
        onToggleAiMode={onToggleAiMode}
        resultCount={resultCount}
        totalCount={totalCount}
      />

      <div className="flex items-center gap-3">
        <DropdownLabel label="Group">
          <select
            value={group}
            onChange={(e) => onGroup(e.target.value as VendorGroupKey)}
            className="rounded-md border border-border bg-white py-1 pl-2 pr-6 text-[11.5px] text-ink outline-none focus:border-gold"
          >
            <option value="category">Category</option>
            <option value="status">Status</option>
            <option value="location">Location</option>
            <option value="price_tier">Price Tier</option>
            <option value="none">None</option>
          </select>
        </DropdownLabel>

        <DropdownLabel label="Sort">
          <select
            value={sort}
            onChange={(e) => onSort(e.target.value as VendorSortKey)}
            className="rounded-md border border-border bg-white py-1 pl-2 pr-6 text-[11.5px] text-ink outline-none focus:border-gold"
          >
            <option value="relevance">Relevance</option>
            <option value="rating">Rating</option>
            <option value="name">A → Z</option>
            <option value="priceAsc">Price ↑</option>
            <option value="priceDesc">Price ↓</option>
          </select>
        </DropdownLabel>

        <div className="flex overflow-hidden rounded-md border border-border">
          <ViewButton
            active={view === "grid"}
            onClick={() => onView("grid")}
            icon={LayoutGrid}
            label="Grid"
          />
          <ViewButton
            active={view === "table"}
            onClick={() => onView("table")}
            icon={Rows}
            label="Table"
          />
        </div>
      </div>
    </div>
  );
}

function DropdownLabel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] uppercase tracking-wider text-ink-faint">
        {label}
      </span>
      {children}
    </div>
  );
}

function ViewButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1 text-[11.5px] transition-colors",
        active ? "bg-ink text-ivory" : "bg-white text-ink-muted hover:bg-ivory-warm",
      )}
    >
      <Icon size={12} strokeWidth={1.8} />
      {label}
    </button>
  );
}

// ── Grouped grid ────────────────────────────────────────────────────────────

function VendorGrid({
  groups,
  group,
  ctx,
  taskLinkLookup,
  onOpen,
  onHeart,
  onInquire,
}: {
  groups: { key: string; vendors: Vendor[] }[];
  group: VendorGroupKey;
  ctx: VendorFilterContext;
  taskLinkLookup: (vendorId: string) => { title: string | null; count: number };
  onOpen: (id: string) => void;
  onHeart: (id: string) => void;
  onInquire: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      {groups.map((g) => (
        <section key={g.key}>
          {group !== "none" && (
            <header className="mb-3 flex items-baseline justify-between border-b border-border/60 pb-2">
              <h2 className="text-[14px] font-medium text-ink">
                {groupLabel(g.key, group)}
              </h2>
              <span
                className="font-mono text-[10px] uppercase tracking-wider text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {g.vendors.length} vendor{g.vendors.length === 1 ? "" : "s"}
              </span>
            </header>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {g.vendors.map((v) => {
              const link = taskLinkLookup(v.id);
              return (
                <VendorCard
                  key={v.id}
                  vendor={v}
                  shortlisted={ctx.shortlistIds.has(v.id)}
                  status={ctx.statusByVendorId.get(v.id)}
                  linkedTaskCount={link.count}
                  linkedTaskTitle={link.title}
                  onOpen={() => onOpen(v.id)}
                  onToggleShortlist={() => onHeart(v.id)}
                  onChooseTask={() => onOpen(v.id)}
                  onInquire={() => onInquire(v.id)}
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function groupLabel(key: string, group: VendorGroupKey): string {
  if (group === "category") {
    return CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS] ?? key;
  }
  if (group === "status") {
    if (key === "unsaved") return "Not yet shortlisted";
    return (
      SHORTLIST_STATUS_LABEL[key as keyof typeof SHORTLIST_STATUS_LABEL] ?? key
    );
  }
  if (group === "price_tier") return PRICE_TIER_LABEL[key] ?? key;
  if (group === "location") return key === "unknown" ? "Location unknown" : key;
  return key;
}

// ── Destination recommendation banner ──────────────────────────────────────

function DestinationBanner({
  vendors,
  filters,
  onApply,
}: {
  vendors: Vendor[];
  filters: VendorFilters;
  onApply: (next: VendorFilters) => void;
}) {
  const destinationVendorCount = useMemo(
    () => vendors.filter((v) => v.travel_level === "destination").length,
    [vendors],
  );

  const query = filters.willing_to_travel_to.trim();

  if (query) {
    return (
      <section className="mb-5 flex items-center gap-3 rounded-lg border border-teal/30 bg-teal-pale/40 px-4 py-3">
        <Plane size={16} strokeWidth={1.8} className="shrink-0 text-teal" />
        <p className="flex-1 text-[12.5px] text-ink-soft">
          <span className="font-medium text-ink">
            Showing vendors available for {query}.
          </span>{" "}
          Proven destination experience appears first.
        </p>
        <button
          type="button"
          onClick={() =>
            onApply({
              ...filters,
              willing_to_travel_to: "",
              travel_levels: [],
              preferred_regions: [],
            })
          }
          className="flex items-center gap-1 rounded-md border border-teal/30 bg-white px-2 py-1 text-[10.5px] uppercase tracking-[0.12em] text-teal transition-colors hover:bg-teal-pale"
          aria-label="Clear destination filter"
        >
          <X size={10} strokeWidth={1.8} />
          Clear
        </button>
      </section>
    );
  }

  const hasTravelFilter =
    filters.travel_levels.length > 0 || filters.preferred_regions.length > 0;
  if (hasTravelFilter || destinationVendorCount === 0) return null;

  return (
    <section className="mb-5 flex items-center gap-3 rounded-lg border border-teal/25 bg-teal-pale/30 px-4 py-3">
      <Plane size={16} strokeWidth={1.8} className="shrink-0 text-teal" />
      <p className="flex-1 text-[12.5px] text-ink-soft">
        <span className="font-medium text-ink">
          Planning a destination wedding?
        </span>{" "}
        {destinationVendorCount} vendor
        {destinationVendorCount === 1 ? "" : "s"} in our marketplace{" "}
        {destinationVendorCount === 1 ? "has" : "have"} proven destination
        experience.
      </p>
      <button
        type="button"
        onClick={() => onApply({ ...filters, travel_levels: ["destination"] })}
        className="flex items-center gap-1.5 rounded-md bg-teal px-3 py-1.5 text-[11.5px] font-medium text-ivory transition-opacity hover:opacity-90"
      >
        <Plane size={11} strokeWidth={2} />
        Show destination-ready vendors
      </button>
    </section>
  );
}

// ── Empty states ────────────────────────────────────────────────────────────

function EmptyDirectoryState({
  onImport,
  onAdd,
}: {
  onImport: () => void;
  onAdd: () => void;
}) {
  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gold-pale/40 text-gold">
        <Users size={32} strokeWidth={1.3} />
      </div>
      <div className="flex flex-col gap-1.5">
        <h2 className="font-serif text-[22px] text-ink">No vendors yet</h2>
        <p className="max-w-md text-[13px] text-ink-muted">
          Import a spreadsheet, or add vendors one at a time as you discover
          them. Hearted vendors will sync into the relevant checklist tasks.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory transition-opacity hover:opacity-90"
        >
          <Plus size={13} strokeWidth={1.8} />
          Add Vendor
        </button>
        <button
          onClick={onImport}
          className="flex items-center gap-1.5 rounded-md border border-gold/25 bg-gold-pale/30 px-3 py-1.5 text-[12px] font-medium text-gold transition-colors hover:bg-gold-pale/50"
        >
          <Upload size={13} strokeWidth={1.6} />
          Import from Excel
        </button>
      </div>
    </div>
  );
}

function EmptyMatchesState({
  onClear,
  filtersDirty,
}: {
  onClear: () => void;
  filtersDirty: boolean;
}) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <h2 className="font-serif text-[18px] text-ink">
        No vendors match these filters
      </h2>
      <p className="max-w-sm text-[12.5px] text-ink-muted">
        Try removing a filter or broadening your search.
      </p>
      {filtersDirty && (
        <button
          onClick={onClear}
          className="mt-1 rounded-md border border-gold/30 bg-gold-pale/30 px-4 py-1.5 text-[11.5px] font-medium text-gold transition-colors hover:bg-gold-pale/50"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
