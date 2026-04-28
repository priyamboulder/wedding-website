"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ChevronRight, MoreHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ───────────────────────────────────────────────────────────────────

interface BreadcrumbSegment {
  label: string;
  onClick?: () => void;
}

interface HeaderAction {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

interface PopOutShellProps {
  /** Breadcrumb segments, last is current page */
  breadcrumbs: BreadcrumbSegment[];
  /** Status badge rendered beside breadcrumbs */
  status?: ReactNode;
  /** Action buttons in the header (e.g. export, AI assist) */
  actions?: HeaderAction[];
  /** Footer: last-edited timestamp */
  lastEdited?: string;
  /** Footer: save-state indicator */
  saveState?: "saved" | "saving" | "unsaved";
  /** Close handler — also triggered by Escape */
  onClose: () => void;
  /** Extra keyboard shortcuts: key → handler */
  shortcuts?: Record<string, (e: KeyboardEvent) => void>;
  className?: string;
  children: ReactNode;
}

// ── Component ───────────────────────────────────────────────────────────────

export function PopOutShell({
  breadcrumbs,
  status,
  actions = [],
  lastEdited,
  saveState,
  onClose,
  shortcuts = {},
  className,
  children,
}: PopOutShellProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // ── Keyboard: Escape + custom shortcuts ────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      const key = [
        e.ctrlKey || e.metaKey ? "mod" : "",
        e.shiftKey ? "shift" : "",
        e.key.toLowerCase(),
      ]
        .filter(Boolean)
        .join("+");

      if (shortcuts[key]) {
        e.preventDefault();
        shortcuts[key](e);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, shortcuts]);

  // ── Focus trap ─────────────────────────────────────────────────────────
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = panel.querySelectorAll(focusableSelector);
      if (focusable.length === 0) return;

      const first = focusable[0] as HTMLElement;
      const last = focusable[focusable.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    panel.addEventListener("keydown", handleTab);
    const firstFocusable = panel.querySelector(focusableSelector) as HTMLElement;
    firstFocusable?.focus();

    return () => panel.removeEventListener("keydown", handleTab);
  }, []);

  // ── Save state label ───────────────────────────────────────────────────
  const saveLabel =
    saveState === "saving"
      ? "Saving…"
      : saveState === "saved"
        ? "Saved"
        : saveState === "unsaved"
          ? "Unsaved changes"
          : null;

  return (
    <div
      ref={panelRef}
      className={cn("flex h-full flex-col", className)}
      role="dialog"
      aria-label={breadcrumbs[breadcrumbs.length - 1]?.label}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-border px-6 py-3.5">
        <div className="flex items-center gap-1.5 text-[12px] text-ink-faint">
          {breadcrumbs.map((seg, i) => {
            const isLast = i === breadcrumbs.length - 1;
            return (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && (
                  <ChevronRight size={11} className="text-ink-faint/50" />
                )}
                <span
                  className={cn(
                    isLast
                      ? "text-ink-muted font-medium truncate max-w-[180px]"
                      : "hover:text-ink-muted transition-colors cursor-pointer",
                  )}
                  onClick={seg.onClick}
                >
                  {seg.label}
                </span>
              </span>
            );
          })}
          {status && <span className="ml-2">{status}</span>}
        </div>

        <div className="flex items-center gap-1">
          {/* Inline actions (up to 2) */}
          {actions.slice(0, 2).map((action, i) => (
            <button
              key={i}
              type="button"
              onClick={action.onClick}
              className="flex h-7 w-7 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-ivory-warm hover:text-ink-muted"
              aria-label={action.label}
            >
              {action.icon}
            </button>
          ))}

          {/* Overflow menu for extra actions */}
          {actions.length > 2 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-ivory-warm hover:text-ink-muted"
                aria-label="More options"
                aria-expanded={showMoreMenu}
              >
                <MoreHorizontal size={15} strokeWidth={1.5} />
              </button>
              {showMoreMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMoreMenu(false)}
                  />
                  <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-lg border border-border bg-white py-1 shadow-lg popover-enter">
                    {actions.slice(2).map((action, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          action.onClick();
                          setShowMoreMenu(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-[12px] text-ink-muted hover:bg-ivory-warm transition-colors"
                      >
                        {action.icon}
                        {action.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-ivory-warm hover:text-ink-muted"
            aria-label="Close"
          >
            <X size={15} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto panel-scroll editorial-padding">
        {children}
      </div>

      {/* ── Footer ── */}
      {(lastEdited || saveState) && (
        <div className="flex items-center justify-between border-t border-border px-6 py-2.5">
          {lastEdited && (
            <span className="text-[11px] text-ink-faint">
              Last edited {lastEdited}
            </span>
          )}
          {saveLabel && (
            <span
              className={cn(
                "text-[11px] font-medium",
                saveState === "saved" && "text-sage saved-indicator",
                saveState === "saving" && "text-ink-faint",
                saveState === "unsaved" && "text-gold",
              )}
            >
              {saveLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
