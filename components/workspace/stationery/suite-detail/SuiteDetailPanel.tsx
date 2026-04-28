"use client";

// ── Suite detail panel (slide-over) ──────────────────────────────────────
// Editorial slide-over that opens when a couple clicks a Suite Builder
// card. Orchestrates the full layout — hero, editorial, tips, mistakes,
// inspiration, blog link, upsell, addons — plus a sticky selection footer.
//
// State: fully controlled from the outside via `itemId` and `onClose`. The
// panel reads the suite item, editorial detail, inspirations, and addons
// from the Stationery store based on the id. Prompt 3 wires click handling
// + URL sync into the parent; Prompt 4 polishes mobile behavior.

import { useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  addonsForItem,
  inspirationsForItem,
  suiteDetailFor,
  useStationeryStore,
} from "@/stores/stationery-store";
import type { StationerySuitePreference } from "@/types/stationery";
import { SuiteDetailHero } from "./SuiteDetailHero";
import { SuiteDetailEditorial } from "./SuiteDetailEditorial";
import { SuiteDetailTips } from "./SuiteDetailTips";
import { SuiteDetailMistakes } from "./SuiteDetailMistakes";
import { SuiteDetailInspiration } from "./SuiteDetailInspiration";
import { SuiteDetailBlogLink } from "./SuiteDetailBlogLink";
import { SuiteDetailUpsell } from "./SuiteDetailUpsell";
import { SuiteDetailAddons } from "./SuiteDetailAddons";
import { SuiteDetailFooter } from "./SuiteDetailFooter";
import { SuiteDetailSkeleton } from "./SuiteDetailSkeleton";

export function SuiteDetailPanel({
  itemId,
  onClose,
  onNavigate,
}: {
  itemId: string | null;
  onClose: () => void;
  /** Navigate the panel to a different suite item without closing it. */
  onNavigate?: (itemId: string) => void;
}) {
  const open = itemId !== null;

  return (
    <AnimatePresence>
      {open && itemId && (
        <SuiteDetailPanelMount
          itemId={itemId}
          onClose={onClose}
          onNavigate={onNavigate}
        />
      )}
    </AnimatePresence>
  );
}

// ── Mounted body (kept separate so AnimatePresence sees a clean unmount) ─

function SuiteDetailPanelMount({
  itemId,
  onClose,
  onNavigate,
}: {
  itemId: string;
  onClose: () => void;
  onNavigate?: (itemId: string) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const suite = useStationeryStore((s) => s.suite);
  const details = useStationeryStore((s) => s.suiteDetails);
  const inspirations = useStationeryStore((s) => s.suiteInspirations);
  const addons = useStationeryStore((s) => s.suiteAddons);
  const preferences = useStationeryStore((s) => s.piecePreferences);
  const priority = useStationeryStore((s) => s.piecePriority);

  const setPreference = useStationeryStore((s) => s.setPiecePreference);
  const togglePriority = useStationeryStore((s) => s.togglePiecePriority);
  const setEnabled = useStationeryStore((s) => s.setSuiteItemEnabled);

  const item = useMemo(
    () => suite.find((i) => i.id === itemId),
    [suite, itemId],
  );
  const detail = useMemo(
    () => suiteDetailFor(details, itemId),
    [details, itemId],
  );
  const itemInspirations = useMemo(
    () => inspirationsForItem(inspirations, itemId),
    [inspirations, itemId],
  );
  const itemAddons = useMemo(
    () => addonsForItem(addons, itemId),
    [addons, itemId],
  );
  const itemsById = useMemo(
    () => new Map(suite.map((i) => [i.id, i])),
    [suite],
  );

  const preference = preferences[itemId];
  const starred = priority.includes(itemId);

  // ── Escape to close + body scroll lock ─────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  // ── Focus trap within the panel ────────────────────────────────────────
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const selector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    const onTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(selector),
      ).filter((el) => !el.hasAttribute("disabled"));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    panel.addEventListener("keydown", onTab);
    // Focus the close button on open so keyboard users start at a known anchor.
    const firstFocusable = panel.querySelector<HTMLElement>(selector);
    firstFocusable?.focus();
    return () => panel.removeEventListener("keydown", onTab);
  }, [itemId]);

  // ── Scroll to top when switching items ─────────────────────────────────
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [itemId]);

  // ── Selection handlers ─────────────────────────────────────────────────
  // Keep the Suite Builder's `enabled` flag in sync with want/skip so the
  // production totals reflect the couple's discovery-state decisions. Maybe
  // leaves enabled as-is — it's a deliberate suspension of judgment, not a
  // commitment either way.
  const handlePreferenceChange = (next: StationerySuitePreference) => {
    setPreference(itemId, next);
    if (next === "want") setEnabled(itemId, true);
    if (next === "skip") setEnabled(itemId, false);
  };

  const handleAddAddonToSuite = (addonItemId: string) => {
    setPreference(addonItemId, "want");
    setEnabled(addonItemId, true);
  };

  // ── Render ─────────────────────────────────────────────────────────────

  const missing = !item || !detail;

  return (
    <>
      {/* Overlay */}
      <motion.div
        key="suite-detail-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/15"
        aria-hidden
      />

      {/* Panel */}
      <motion.aside
        key="suite-detail-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={item ? `${item.name} details` : "Suite item details"}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 34, mass: 0.9 }}
        className={cn(
          "workspace-editorial",
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-[520px] flex-col bg-ivory shadow-2xl",
          "md:w-[520px]",
        )}
      >
        {/* Close (absolute so it floats over the editorial padding) */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-md bg-white/70 text-ink-faint backdrop-blur transition-colors hover:bg-white hover:text-ink-muted"
          aria-label="Close panel"
        >
          <X size={16} strokeWidth={1.75} />
        </button>

        {/* Scrolling body */}
        <div
          ref={contentRef}
          className="panel-scroll flex-1 overflow-y-auto px-8 pt-10 pb-10"
        >
          {missing ? (
            <SuiteDetailSkeleton />
          ) : (
            <div className="space-y-10">
              <StaggerIn order={0}>
                <SuiteDetailHero
                  item={item}
                  detail={detail}
                  preference={preference}
                  starred={starred}
                />
              </StaggerIn>
              <StaggerIn order={1}>
                <SuiteDetailEditorial detail={detail} />
              </StaggerIn>
              <StaggerIn order={2}>
                <SuiteDetailTips detail={detail} />
              </StaggerIn>
              <StaggerIn order={3}>
                <SuiteDetailMistakes detail={detail} />
              </StaggerIn>
              <StaggerIn order={4}>
                <SuiteDetailInspiration
                  detail={detail}
                  inspirations={itemInspirations}
                />
              </StaggerIn>
              {detail.blog_post_url && (
                <StaggerIn order={5}>
                  <SuiteDetailBlogLink detail={detail} />
                </StaggerIn>
              )}
              <StaggerIn order={6}>
                <SuiteDetailUpsell detail={detail} />
              </StaggerIn>
              {itemAddons.length > 0 && (
                <StaggerIn order={7}>
                  <SuiteDetailAddons
                    addons={itemAddons}
                    itemsById={itemsById}
                    preferences={preferences}
                    onAddToSuite={handleAddAddonToSuite}
                    onNavigate={onNavigate}
                  />
                </StaggerIn>
              )}
            </div>
          )}
        </div>

        {/* Sticky footer */}
        {item && (
          <SuiteDetailFooter
            preference={preference}
            starred={starred}
            onPreferenceChange={handlePreferenceChange}
            onToggleStar={() => togglePriority(itemId)}
            onClose={onClose}
          />
        )}
      </motion.aside>
    </>
  );
}

// ── Cascading section fade-in ────────────────────────────────────────────
// Small local component so every section shares the same enter animation
// without per-section motion config. Order is the visual index from top.

function StaggerIn({
  order,
  children,
}: {
  order: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: 0.04 + order * 0.05,
        ease: [0.2, 0.6, 0.2, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
