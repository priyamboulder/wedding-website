"use client";

import {
  use,
  useCallback,
  useMemo,
  useState,
  Suspense,
  useEffect,
  useRef,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LayoutGrid,
  Rows,
  Search,
  ShoppingBag,
  X,
  ListChecks,
  Plus,
  Store,
  Link2,
  Layers,
  ShoppingCart,
  Sparkles,
  Tag,
  Users,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TopNav } from "@/components/shell/TopNav";
import { ShoppingLinksProvider, useShoppingLinks } from "@/contexts/ShoppingLinksContext";
import { useChecklistStore } from "@/stores/checklist-store";
import type { ChecklistItem, Phase } from "@/types/checklist";
import type { ShoppingStatus } from "@/lib/link-preview/types";
import {
  applyFilters,
  computeDuplicateCounts,
  groupLinks,
  scopeByMode,
  sortGroupsWithUnassignedLast,
  sortLinks,
  UNASSIGNED_KEY,
  type AssignmentFilter,
  type AvailabilityFilter,
  type GroupKey,
  type ShoppingFilterState,
  type ShoppingMode,
  type SortDir,
  type SortKey,
} from "@/lib/shopping/filters";
import {
  buildCsv,
  csvFilename,
  downloadCsv,
  type TaskMeta,
} from "@/lib/shopping/export-csv";
import { getStoreVendor } from "@/lib/store-seed";
import { ExhibitionBanner } from "@/components/exhibitions/ExhibitionBanner";
import { CreatorExhibitionBanner } from "@/components/creators/CreatorExhibitionBanner";
import { ShoppingBoardFilters } from "@/components/shopping/ShoppingBoardFilters";
import { ShoppingBoardGrid } from "@/components/shopping/ShoppingBoardGrid";
import { ShoppingBoardTable } from "@/components/shopping/ShoppingBoardTable";
import { ShoppingBoardDrawer } from "@/components/shopping/ShoppingBoardDrawer";
import { BulkActionBar } from "@/components/shopping/BulkActionBar";
import { AddItemModal } from "@/components/shopping/AddItemModal";
import { AssignToTaskPopover } from "@/components/shopping/AssignToTaskPopover";
import { CatalogBrowser } from "@/components/shopping/CatalogModal";
import { CheckoutDrawer } from "@/components/shopping/CheckoutDrawer";
import { VendorProfileDrawer } from "@/components/shopping/VendorProfileDrawer";
import { useCoupleIdentity } from "@/lib/couple-identity";
import {
  useMarketplaceStore,
  CURRENT_USER_ID as MARKETPLACE_USER_ID,
} from "@/stores/marketplace-store";
import { CreatorPicksBoard } from "@/components/creators/CreatorPicksBoard";
import { useCreatorsStore } from "@/stores/creators-store";
import {
  EMPTY_FILTERS as EMPTY_MARKETPLACE_FILTERS,
  type MarketplaceFilterState,
  type MarketplaceSortKey,
} from "@/types/marketplace";
import { MarketplaceBoardFilters } from "@/components/marketplace/MarketplaceBoardFilters";
import {
  MarketplaceBoard,
  type MarketplaceGroupKey,
  type MarketplaceViewKey,
} from "@/components/marketplace/MarketplaceBoard";

const DEFAULT_VIEW: "grid" | "table" = "grid";
const DEFAULT_GROUP: GroupKey = "module";
const DEFAULT_SORT: SortKey = "added";
const DEFAULT_DIR: SortDir = "desc";
const DEFAULT_MODE: ShoppingMode = "external";

const WEDDING_DATE = new Date("2026-11-14");

export default function ShoppingPageWrapper({
  params,
}: {
  params: Promise<{ weddingId: string }>;
}) {
  const { weddingId } = use(params);
  return (
    <ShoppingLinksProvider weddingId={weddingId}>
      <Suspense fallback={null}>
        <ShoppingPage weddingId={weddingId} />
      </Suspense>
    </ShoppingLinksProvider>
  );
}

function ShoppingPage({ weddingId }: { weddingId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    getAllLinks,
    updateLink,
    deleteLink,
    assignToTask,
    addStandaloneLink,
    updateVariant,
    cartIds,
    toggleCart,
    checkoutCart,
  } = useShoppingLinks();

  const phases = useChecklistStore((s) => s.phases);
  const items = useChecklistStore((s) => s.items);
  const couple = useCoupleIdentity();

  const marketplaceListings = useMarketplaceStore((s) => s.listings);
  const marketplaceCategories = useMarketplaceStore((s) => s.categories);
  const marketplaceSaves = useMarketplaceStore((s) => s.saves);
  const marketplaceCount = useMemo(
    () => marketplaceListings.filter((l) => l.status === "active").length,
    [marketplaceListings],
  );
  const marketplaceSaveCount = useMemo(() => {
    const mine = new Set<string>();
    for (const s of marketplaceSaves)
      if (s.user_id === MARKETPLACE_USER_ID) mine.add(s.listing_id);
    return marketplaceListings.filter((l) => mine.has(l.id)).length;
  }, [marketplaceListings, marketplaceSaves]);
  const marketplaceCategoriesTop = useMemo(
    () =>
      marketplaceCategories
        .filter((c) => !c.parent_slug)
        .sort((a, b) => a.sort_order - b.sort_order),
    [marketplaceCategories],
  );
  const activeMarketplaceListings = useMemo(
    () => marketplaceListings.filter((l) => l.status === "active"),
    [marketplaceListings],
  );

  const creatorPicksCount = useCreatorsStore(
    (s) =>
      s.picks.filter((p) => {
        const col = s.collections.find((c) => c.id === p.collectionId);
        return col?.status === "active";
      }).length,
  );

  const allLinks = getAllLinks();

  // ── Module + task lookups ────────────────────────────────────────────────
  const moduleTitles = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of phases) map.set(p.id, p.title);
    return map;
  }, [phases]);

  const tasksById = useMemo(() => {
    const map = new Map<string, TaskMeta>();
    for (const item of items) {
      map.set(item.id, {
        id: item.id,
        title: item.title,
        phaseTitle: moduleTitles.get(item.phase_id) ?? item.phase_id,
      });
    }
    return map;
  }, [items, moduleTitles]);

  const duplicateCounts = useMemo(
    () => computeDuplicateCounts(allLinks),
    [allLinks],
  );

  // ── URL-backed state ─────────────────────────────────────────────────────
  const filters = useMemo<ShoppingFilterState>(
    () => ({
      modules: parseList(searchParams.get("module")),
      statuses: parseList(searchParams.get("status")) as ShoppingStatus[],
      domains: parseList(searchParams.get("domain")),
      vendors: parseList(searchParams.get("vendor")),
      assignment: parseList(
        searchParams.get("assign"),
      ) as AssignmentFilter[],
      availability: parseList(
        searchParams.get("avail"),
      ) as AvailabilityFilter[],
      minPrice: parseNum(searchParams.get("minPrice")),
      maxPrice: parseNum(searchParams.get("maxPrice")),
      maxLeadTimeDays: parseNum(searchParams.get("maxLead")),
      query: searchParams.get("q") ?? "",
    }),
    [searchParams],
  );

  const view = (searchParams.get("view") as "grid" | "table") || DEFAULT_VIEW;
  const group = (searchParams.get("group") as GroupKey) || DEFAULT_GROUP;
  const sortBy = (searchParams.get("sortBy") as SortKey) || DEFAULT_SORT;
  const sortDir = (searchParams.get("sortDir") as SortDir) || DEFAULT_DIR;
  const mode = (searchParams.get("mode") as ShoppingMode) || DEFAULT_MODE;

  const updateParams = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v == null || v === "") next.delete(k);
        else next.set(k, v);
      }
      router.replace(`?${next.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const setFilters = useCallback(
    (f: ShoppingFilterState) => {
      updateParams({
        module: f.modules.length ? f.modules.join(",") : null,
        status: f.statuses.length ? f.statuses.join(",") : null,
        domain: f.domains.length ? f.domains.join(",") : null,
        vendor: f.vendors.length ? f.vendors.join(",") : null,
        assign: f.assignment.length ? f.assignment.join(",") : null,
        avail: f.availability.length ? f.availability.join(",") : null,
        minPrice: f.minPrice != null ? String(f.minPrice) : null,
        maxPrice: f.maxPrice != null ? String(f.maxPrice) : null,
        maxLead:
          f.maxLeadTimeDays != null ? String(f.maxLeadTimeDays) : null,
        q: f.query || null,
      });
    },
    [updateParams],
  );

  const setMode = useCallback(
    (m: ShoppingMode) => {
      // Clear filters that don't apply to the destination mode so the grid
      // doesn't appear empty after a switch. External = domains; native =
      // vendor/availability/lead-time.
      const patch: Record<string, string | null> = {
        mode: m === DEFAULT_MODE ? null : m,
      };
      if (m === "external") {
        patch.vendor = null;
        patch.avail = null;
        patch.maxLead = null;
      } else if (m === "ananya_store") {
        patch.domain = null;
      } else if (m === "creator_picks" || m === "pre-loved") {
        // Creator Picks and Pre-Loved own their own filter chrome; clear any
        // active shopping-board filters so returning to External/Store is clean.
        patch.domain = null;
        patch.vendor = null;
        patch.avail = null;
        patch.maxLead = null;
        patch.assign = null;
        patch.minPrice = null;
        patch.maxPrice = null;
      }
      updateParams(patch);
    },
    [updateParams],
  );

  // ── Filtered + sorted links ──────────────────────────────────────────────
  const scopedLinks = useMemo(
    () => scopeByMode(allLinks, mode),
    [allLinks, mode],
  );

  const filtered = useMemo(
    () => applyFilters(scopedLinks, filters),
    [scopedLinks, filters],
  );

  const visibleLinks = useMemo(
    () => sortLinks(filtered, sortBy, sortDir),
    [filtered, sortBy, sortDir],
  );

  const grouped = useMemo(() => {
    const gs = groupLinks(visibleLinks, group);
    if (group === "module") {
      return sortGroupsWithUnassignedLast(gs, (k) =>
        k === UNASSIGNED_KEY ? "~~unassigned" : moduleTitles.get(k) ?? k,
      );
    }
    return gs.sort((a, b) => a.key.localeCompare(b.key));
  }, [visibleLinks, group, moduleTitles]);

  const groupLabel = useCallback(
    (key: string): string => {
      if (key === UNASSIGNED_KEY) return "Unassigned";
      if (group === "module") return moduleTitles.get(key) ?? key;
      if (group === "status") return key.charAt(0).toUpperCase() + key.slice(1);
      if (group === "vendor")
        return getStoreVendor(key)?.name ?? key;
      return key;
    },
    [group, moduleTitles],
  );

  // ── Marketplace view state (local, mode="pre-loved") ───────────────────
  const [marketplaceFilters, setMarketplaceFilters] =
    useState<MarketplaceFilterState>(EMPTY_MARKETPLACE_FILTERS);
  const [marketplaceSort, setMarketplaceSort] =
    useState<MarketplaceSortKey>("recent");
  const [marketplaceGroup, setMarketplaceGroup] =
    useState<MarketplaceGroupKey>("category");
  const [marketplaceView, setMarketplaceView] =
    useState<MarketplaceViewKey>("grid");

  // ── Selection ────────────────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [vendorDrawerId, setVendorDrawerId] = useState<string | null>(null);
  const [assignTarget, setAssignTarget] = useState<
    | { kind: "single"; linkId: string; anchor: { x: number; y: number } }
    | { kind: "bulk"; anchor: { x: number; y: number } }
    | null
  >(null);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const allIds = visibleLinks.map((l) => l.id);
      const allSelected = allIds.every((id) => prev.has(id));
      if (allSelected) return new Set();
      return new Set(allIds);
    });
  }, [visibleLinks]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  // ── Bulk actions ─────────────────────────────────────────────────────────
  const bulkSetStatus = useCallback(
    (s: ShoppingStatus) => {
      for (const id of selectedIds) updateLink(id, { status: s });
    },
    [selectedIds, updateLink],
  );

  const bulkDelete = useCallback(() => {
    for (const id of selectedIds) deleteLink(id);
    clearSelection();
  }, [selectedIds, deleteLink, clearSelection]);

  const bulkAssign = useCallback(
    (taskId: string | null, module: string | null) => {
      for (const id of selectedIds) assignToTask(id, taskId, module);
    },
    [selectedIds, assignToTask],
  );

  const weddingName = `${couple.person1}-${couple.person2}`;

  const bulkExport = useCallback(() => {
    const toExport = visibleLinks.filter((l) => selectedIds.has(l.id));
    const csv = buildCsv(toExport, tasksById, moduleTitles);
    downloadCsv(csv, csvFilename(weddingName));
  }, [visibleLinks, selectedIds, tasksById, moduleTitles, weddingName]);

  // ── Sort handler for table ───────────────────────────────────────────────
  const handleSort = useCallback(
    (key: SortKey) => {
      if (sortBy === key) {
        updateParams({ sortDir: sortDir === "asc" ? "desc" : "asc" });
      } else {
        updateParams({ sortBy: key, sortDir: "asc" });
      }
    },
    [sortBy, sortDir, updateParams],
  );

  const drawerLink = drawerId
    ? allLinks.find((l) => l.id === drawerId) ?? null
    : null;
  const drawerTask =
    drawerLink && drawerLink.taskId && tasksById.has(drawerLink.taskId)
      ? tasksById.get(drawerLink.taskId)!
      : null;

  const hasAnyInMode = scopedLinks.length > 0;
  const hasFilteredMatches = visibleLinks.length > 0;

  // ── Assign handlers ──────────────────────────────────────────────────────
  const openSingleAssign = useCallback((linkId: string, e: React.MouseEvent) => {
    setAssignTarget({
      kind: "single",
      linkId,
      anchor: { x: e.clientX, y: e.clientY },
    });
  }, []);

  const openBulkAssign = useCallback(() => {
    // Anchor roughly where the bulk bar floats
    const anchor =
      typeof window !== "undefined"
        ? { x: window.innerWidth / 2 - 160, y: window.innerHeight - 120 }
        : { x: 0, y: 0 };
    setAssignTarget({ kind: "bulk", anchor });
  }, []);

  const handleAssign = useCallback(
    (taskId: string | null, module: string | null) => {
      if (!assignTarget) return;
      if (assignTarget.kind === "single") {
        assignToTask(assignTarget.linkId, taskId, module);
      } else {
        bulkAssign(taskId, module);
      }
    },
    [assignTarget, assignToTask, bulkAssign],
  );

  const assignAnchor = assignTarget?.anchor ?? null;

  const assignCurrent = useMemo(() => {
    if (assignTarget?.kind !== "single") return null;
    const l = allLinks.find((x) => x.id === assignTarget.linkId);
    return l
      ? { taskId: l.taskId, module: l.module }
      : null;
  }, [assignTarget, allLinks]);

  // Native items currently in the cart (drives CheckoutDrawer)
  const cartItems = useMemo(
    () => allLinks.filter((l) => cartIds.has(l.id)),
    [allLinks, cartIds],
  );
  const cartCount = cartItems.length;

  // Any selected native items — drives the "Checkout Selected" bulk affordance.
  const selectedNativeIds = useMemo(() => {
    const out: string[] = [];
    for (const l of allLinks) {
      if (selectedIds.has(l.id) && l.sourceType === "ananya_store") {
        out.push(l.id);
      }
    }
    return out;
  }, [allLinks, selectedIds]);

  const bulkCheckoutSelected = useCallback(() => {
    if (selectedNativeIds.length === 0) return;
    checkoutCart(selectedNativeIds);
    clearSelection();
  }, [selectedNativeIds, checkoutCart, clearSelection]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <TopNav>
        <div className="flex items-center gap-2">
          <Link
            href={`/${weddingId}/shopping/exhibitions`}
            className="flex items-center gap-1.5 rounded-md border border-gold/25 bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-gold/40 hover:bg-gold-pale/25 hover:text-ink"
          >
            <Sparkles size={13} strokeWidth={1.6} className="text-gold" />
            Exhibitions
          </Link>
          {mode === "pre-loved" ? (
            <>
              <Link
                href={`/${weddingId}/shopping/marketplace/mine`}
                className="hidden items-center gap-1.5 rounded-md border border-gold/25 bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-gold/40 hover:text-ink md:inline-flex"
              >
                My listings
              </Link>
              {marketplaceSaveCount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-rose/25 bg-rose-pale/30 px-3 py-1.5 text-[12px] font-medium text-rose">
                  <Heart size={12} strokeWidth={1.8} fill="currentColor" />
                  {marketplaceSaveCount} saved
                </span>
              )}
              <Link
                href={`/${weddingId}/shopping/marketplace/new`}
                className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory transition-opacity hover:opacity-90"
              >
                <Plus size={12} strokeWidth={1.8} />
                List an item
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={() => setCheckoutOpen(true)}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors",
                  cartCount > 0
                    ? "border-saffron bg-saffron/15 text-ink"
                    : "border-border bg-white text-ink-muted hover:border-gold/30 hover:text-ink",
                )}
                aria-label="Open cart"
              >
                <ShoppingCart size={13} strokeWidth={1.8} />
                Cart
                {cartCount > 0 && (
                  <span
                    className="rounded-full bg-ink px-1.5 py-0 font-mono text-[9.5px] text-ivory"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {cartCount}
                  </span>
                )}
              </button>
              {mode !== "ananya_store" && (
                <button
                  onClick={() => setAddOpen(true)}
                  className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory transition-opacity hover:opacity-90"
                >
                  <Plus size={13} strokeWidth={1.8} />
                  Add Item
                </button>
              )}
            </>
          )}
        </div>
      </TopNav>

      <div className="mx-6 mt-4 grid gap-3 md:grid-cols-2">
        <ExhibitionBanner weddingId={weddingId} className="h-full" />
        <CreatorExhibitionBanner weddingId={weddingId} className="h-full" />
      </div>

      <ModeToggle
        mode={mode}
        onChange={setMode}
        allLinks={allLinks}
        marketplaceCount={marketplaceCount}
        creatorPicksCount={creatorPicksCount}
      />

      <div className="flex flex-1 overflow-hidden">
        {mode === "creator_picks" ? (
          <CreatorPicksBoard
            weddingId={weddingId}
            moduleTitles={moduleTitles}
          />
        ) : mode === "ananya_store" ? (
          <CatalogBrowser
            phases={phases}
            items={items}
            onVendorClick={(vid) => setVendorDrawerId(vid)}
            weddingId={weddingId}
          />
        ) : mode === "pre-loved" ? (
          <>
            <MarketplaceBoardFilters
              listings={activeMarketplaceListings}
              categories={marketplaceCategoriesTop}
              filters={marketplaceFilters}
              onChange={setMarketplaceFilters}
            />
            <MarketplaceBoard
              weddingId={weddingId}
              filters={marketplaceFilters}
              onFiltersChange={setMarketplaceFilters}
              sort={marketplaceSort}
              onSortChange={setMarketplaceSort}
              group={marketplaceGroup}
              onGroupChange={setMarketplaceGroup}
              view={marketplaceView}
              onViewChange={setMarketplaceView}
            />
          </>
        ) : (
          <>
            <ShoppingBoardFilters
              allLinks={scopedLinks}
              filters={filters}
              onChange={setFilters}
              moduleTitles={moduleTitles}
              mode={mode}
            />

            <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-8">
              {!hasAnyInMode ? (
                <EmptyAllState
                  phases={phases}
                  onAddLink={async (url) => {
                    await addStandaloneLink(url);
                  }}
                  onOpenModal={() => setAddOpen(true)}
                />
              ) : (
                <>
                  <ControlsBar
                    query={filters.query}
                    onQuery={(q) => setFilters({ ...filters, query: q })}
                    view={view}
                    onView={(v) => updateParams({ view: v === DEFAULT_VIEW ? null : v })}
                    group={group}
                    onGroup={(g) => updateParams({ group: g === DEFAULT_GROUP ? null : g })}
                    resultCount={visibleLinks.length}
                    totalCount={allLinks.length}
                  />

                  {!hasFilteredMatches ? (
                    <EmptyFilteredState
                      onClear={() =>
                        setFilters({
                          modules: [],
                          statuses: [],
                          domains: [],
                          vendors: [],
                          assignment: [],
                          availability: [],
                          minPrice: null,
                          maxPrice: null,
                          maxLeadTimeDays: null,
                          query: "",
                        })
                      }
                    />
                  ) : view === "grid" ? (
                    <ShoppingBoardGrid
                      groups={grouped}
                      moduleTitles={moduleTitles}
                      tasksById={tasksById}
                      duplicateCounts={duplicateCounts}
                      selectedIds={selectedIds}
                      cartIds={cartIds}
                      onToggleSelect={toggleSelect}
                      onToggleCart={toggleCart}
                      onOpen={(id) => setDrawerId(id)}
                      onAssignClick={openSingleAssign}
                      onVariantChange={updateVariant}
                      onVendorClick={(vid) => setVendorDrawerId(vid)}
                      groupLabel={groupLabel}
                      weddingId={weddingId}
                      showStyledByRows={group === "module"}
                    />
                  ) : (
                    <ShoppingBoardTable
                      links={visibleLinks}
                      moduleTitles={moduleTitles}
                      tasksById={tasksById}
                      selectedIds={selectedIds}
                      onToggleSelect={toggleSelect}
                      onToggleSelectAll={toggleSelectAll}
                      onOpen={(id) => setDrawerId(id)}
                      onAssignClick={openSingleAssign}
                      sortBy={sortBy}
                      sortDir={sortDir}
                      onSort={handleSort}
                    />
                  )}
                </>
              )}
            </main>
          </>
        )}
      </div>

      <ShoppingBoardDrawer
        link={drawerLink}
        moduleTitle={
          drawerLink?.module
            ? moduleTitles.get(drawerLink.module) ?? drawerLink.module
            : null
        }
        task={drawerTask}
        checklistHref={drawerTask ? `/checklist?task=${drawerTask.id}` : "/checklist"}
        onClose={() => setDrawerId(null)}
        onAssignClick={(linkId) =>
          setAssignTarget({
            kind: "single",
            linkId,
            anchor: { x: window.innerWidth - 360, y: 140 },
          })
        }
      />

      <BulkActionBar
        count={selectedIds.size}
        onClear={clearSelection}
        onSetStatus={bulkSetStatus}
        onDelete={bulkDelete}
        onExport={bulkExport}
        onAssign={openBulkAssign}
      />

      <AddItemModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        phases={phases}
        items={items}
      />

      <CheckoutDrawer
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={cartItems}
        weddingDate={WEDDING_DATE}
      />

      <VendorProfileDrawer
        vendorId={vendorDrawerId}
        onClose={() => setVendorDrawerId(null)}
      />

      {selectedNativeIds.length > 0 && (
        <BulkCheckoutBar
          count={selectedNativeIds.length}
          onCheckout={bulkCheckoutSelected}
          onDismiss={clearSelection}
        />
      )}

      {assignTarget && assignAnchor && (
        <AnchoredAssignPopover
          anchor={assignAnchor}
          phases={phases}
          items={items}
          currentTaskId={assignCurrent?.taskId ?? null}
          currentModule={assignCurrent?.module ?? null}
          title={
            assignTarget.kind === "bulk"
              ? `Assign ${selectedIds.size} item${selectedIds.size === 1 ? "" : "s"}`
              : "Assign to task"
          }
          onClose={() => setAssignTarget(null)}
          onAssign={(t, m) => handleAssign(t, m)}
        />
      )}
    </div>
  );
}

/**
 * Portal-like positioning wrapper that clamps the popover to the viewport.
 */
function AnchoredAssignPopover({
  anchor,
  phases,
  items,
  currentTaskId,
  currentModule,
  title,
  onClose,
  onAssign,
}: {
  anchor: { x: number; y: number };
  phases: Phase[];
  items: ChecklistItem[];
  currentTaskId: string | null;
  currentModule: string | null;
  title: string;
  onClose: () => void;
  onAssign: (taskId: string | null, module: string | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: anchor.x, top: anchor.y });

  useEffect(() => {
    // Clamp to viewport after first render
    const W = 320;
    const H = 380;
    const pad = 12;
    const left = Math.max(
      pad,
      Math.min(anchor.x, window.innerWidth - W - pad),
    );
    const top = Math.max(
      pad,
      Math.min(anchor.y, window.innerHeight - H - pad),
    );
    setPos({ left, top });
  }, [anchor]);

  return (
    <div
      ref={ref}
      style={{ position: "fixed", left: pos.left, top: pos.top, zIndex: 60 }}
    >
      <AssignToTaskPopover
        phases={phases}
        items={items}
        currentTaskId={currentTaskId}
        currentModule={currentModule}
        title={title}
        onClose={onClose}
        onAssign={onAssign}
      />
    </div>
  );
}

// ── Mode toggle (primary segmentation) ──────────────────────────────────

function ModeToggle({
  mode,
  onChange,
  allLinks,
  marketplaceCount,
  creatorPicksCount,
}: {
  mode: ShoppingMode;
  onChange: (m: ShoppingMode) => void;
  allLinks: { sourceType: "external" | "ananya_store" }[];
  marketplaceCount: number;
  creatorPicksCount: number;
}) {
  const externalCount = allLinks.filter((l) => l.sourceType === "external").length;
  const storeCount = allLinks.filter((l) => l.sourceType === "ananya_store").length;

  type ModeOption = {
    value: ShoppingMode;
    label: string;
    sub: string;
    count: number;
    icon: typeof Link2;
    group: "primary" | "pre-loved";
  };

  const options: ModeOption[] = [
    {
      value: "external",
      label: "External Finds",
      sub: "Links couples track from anywhere",
      count: externalCount,
      icon: Link2,
      group: "primary",
    },
    {
      value: "ananya_store",
      label: "Our Store",
      sub: "Curated Ananya catalog",
      count: storeCount,
      icon: Store,
      group: "primary",
    },
    {
      value: "creator_picks",
      label: "Creator Picks",
      sub: "Hand-picked by stylists & editors",
      count: creatorPicksCount,
      icon: Users,
      group: "primary",
    },
    {
      value: "all",
      label: "All",
      sub: "Combined view for checklist & bulk",
      count: externalCount + storeCount,
      icon: Layers,
      group: "primary",
    },
    {
      value: "pre-loved",
      label: "Pre-Loved",
      sub: "Wedding finds from past brides",
      count: marketplaceCount,
      icon: Tag,
      group: "pre-loved",
    },
  ];

  return (
    <div className="flex items-center justify-between gap-3 border-b border-gold/10 bg-ivory-warm/30 px-8 py-3">
      <div className="flex items-center gap-1 rounded-full border border-gold/20 bg-white p-0.5 shadow-sm">
        {options.map((o, i) => {
          const Icon = o.icon;
          const active = mode === o.value;
          const showDivider =
            i > 0 && o.group === "pre-loved" && options[i - 1]!.group !== "pre-loved";
          return (
            <span key={o.value} className="flex items-center">
              {showDivider && (
                <span aria-hidden className="mx-1 h-4 w-px bg-gold/20" />
              )}
              <button
                onClick={() => onChange(o.value)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors",
                  active
                    ? "bg-ink text-ivory"
                    : "text-ink-muted hover:bg-ivory-warm hover:text-ink",
                )}
                aria-pressed={active}
              >
                <Icon size={12} strokeWidth={1.8} />
                {o.label}
                <span
                  className={cn(
                    "font-mono text-[10px]",
                    active ? "text-ivory/70" : "text-ink-faint",
                  )}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {o.count}
                </span>
              </button>
            </span>
          );
        })}
      </div>
      <span
        className="hidden font-mono text-[10.5px] uppercase tracking-wider text-ink-faint md:inline"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {options.find((o) => o.value === mode)?.sub}
      </span>
    </div>
  );
}

// ── Bulk "Checkout Selected" affordance (floats above BulkActionBar) ────

function BulkCheckoutBar({
  count,
  onCheckout,
  onDismiss,
}: {
  count: number;
  onCheckout: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-20 z-30 flex justify-center px-4">
      <div className="flex items-center gap-3 rounded-full border border-saffron/40 bg-saffron/15 px-4 py-2 text-[12px] text-ink shadow-[0_8px_24px_rgba(26,26,26,0.12)]">
        <ShoppingCart size={13} strokeWidth={1.8} />
        <span className="font-medium">
          {count} Ananya item{count === 1 ? "" : "s"} selected
        </span>
        <button
          onClick={onCheckout}
          className="rounded-full bg-ink px-3 py-1 font-medium text-ivory hover:bg-ink/90"
        >
          Checkout Selected
        </button>
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="rounded-full p-1 text-ink-muted hover:text-ink"
        >
          <X size={12} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}

function ControlsBar({
  query,
  onQuery,
  view,
  onView,
  group,
  onGroup,
  resultCount,
  totalCount,
}: {
  query: string;
  onQuery: (q: string) => void;
  view: "grid" | "table";
  onView: (v: "grid" | "table") => void;
  group: GroupKey;
  onGroup: (g: GroupKey) => void;
  resultCount: number;
  totalCount: number;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 md:w-80">
          <Search
            size={13}
            strokeWidth={1.6}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
          />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search titles, notes, domains…"
            className="w-full rounded-md border border-border bg-white py-1.5 pl-8 pr-8 text-[12.5px] text-ink outline-none focus:border-gold"
          />
          {query && (
            <button
              onClick={() => onQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-faint hover:text-ink"
            >
              <X size={12} />
            </button>
          )}
        </div>
        <span
          className="font-mono text-[10.5px] uppercase tracking-wider text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {resultCount} of {totalCount}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-ink-faint">
            Group
          </span>
          <select
            value={group}
            onChange={(e) => onGroup(e.target.value as GroupKey)}
            className="rounded-md border border-border bg-white py-1 pl-2 pr-6 text-[11.5px] text-ink outline-none focus:border-gold"
          >
            <option value="module">Module</option>
            <option value="status">Status</option>
            <option value="source">Source</option>
            <option value="vendor">Vendor</option>
            <option value="none">None</option>
          </select>
        </div>

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

function EmptyAllState({
  phases: _phases,
  onAddLink,
  onOpenModal,
}: {
  phases: Phase[];
  onAddLink: (url: string) => Promise<void>;
  onOpenModal: () => void;
}) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    const trimmed = value.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    try {
      await onAddLink(trimmed);
      setValue("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gold-pale/40 text-gold">
        <ShoppingBag size={32} strokeWidth={1.3} />
      </div>
      <div className="flex flex-col gap-1.5">
        <h2 className="font-serif text-[22px] text-ink">No shopping links yet</h2>
        <p className="max-w-md text-[13px] text-ink-muted">
          Start adding shopping links — paste a URL below, or drop links into
          any task&rsquo;s detail drawer in the Checklist.
        </p>
      </div>

      <div className="flex w-full max-w-md flex-col gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 focus-within:border-gold/40">
          <Plus size={14} strokeWidth={1.6} className="shrink-0 text-ink-faint" />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Paste product link…"
            disabled={busy}
            className="flex-1 bg-transparent text-[13px] text-ink-soft outline-none placeholder:text-ink-faint/60 disabled:opacity-60"
          />
          <button
            onClick={submit}
            disabled={!value.trim() || busy}
            className="rounded-md bg-ink px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-ivory transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add
          </button>
        </div>
        <button
          onClick={onOpenModal}
          className="text-[11.5px] text-gold underline-offset-2 transition-colors hover:text-ink hover:underline"
        >
          Or add with module + task →
        </button>
      </div>

      <Link
        href="/checklist"
        className="mt-1 flex items-center gap-1.5 rounded-md border border-border bg-white px-4 py-1.5 text-[11.5px] text-ink-muted transition-colors hover:border-gold/30 hover:text-ink"
      >
        <ListChecks size={12} strokeWidth={1.6} />
        Open Checklist
      </Link>
    </div>
  );
}

function EmptyFilteredState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <h2 className="font-serif text-[18px] text-ink">No links match these filters</h2>
      <p className="max-w-sm text-[12.5px] text-ink-muted">
        Try removing a filter or clearing your search.
      </p>
      <button
        onClick={onClear}
        className="mt-1 rounded-md border border-gold/30 bg-gold-pale/30 px-4 py-1.5 text-[11.5px] font-medium text-gold transition-colors hover:bg-gold-pale/50"
      >
        Clear filters
      </button>
    </div>
  );
}

// ── URL param parsers ───────────────────────────────────────────────────────
function parseList(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
function parseNum(raw: string | null): number | null {
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}
