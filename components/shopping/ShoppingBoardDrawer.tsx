"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  ExternalLink,
  ArrowRight,
  Trash2,
  RefreshCw,
  AlertTriangle,
  ImageOff,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShoppingLink, ShoppingStatus } from "@/lib/link-preview/types";
import type { TaskMeta } from "@/lib/shopping/export-csv";
import { useShoppingLinks } from "@/contexts/ShoppingLinksContext";

const STATUS_OPTIONS: { value: ShoppingStatus; label: string; dot: string }[] =
  [
    { value: "considering", label: "Considering", dot: "bg-ink/80" },
    { value: "ordered", label: "Ordered", dot: "bg-saffron" },
    { value: "received", label: "Received", dot: "bg-sage" },
    { value: "returned", label: "Returned", dot: "bg-rose" },
  ];

const PANEL_EASE = [0.32, 0.72, 0, 1] as const;

function formatPrice(price: number | null, currency: string): string {
  if (price == null) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: price % 1 === 0 ? 0 : 2,
    }).format(price);
  } catch {
    return `${currency} ${price.toFixed(2)}`;
  }
}

export function ShoppingBoardDrawer({
  link,
  moduleTitle,
  task,
  checklistHref,
  onClose,
  onAssignClick,
}: {
  link: ShoppingLink | null;
  moduleTitle: string | null;
  task: TaskMeta | null;
  checklistHref: string;
  onClose: () => void;
  onAssignClick: (linkId: string) => void;
}) {
  const { updateLink, deleteLink, refetchLink, pendingIds } = useShoppingLinks();

  useEffect(() => {
    if (!link) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [link, onClose]);

  return (
    <AnimatePresence>
      {link && (
        <>
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-[1px]"
          />
          <motion.aside
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.32, ease: PANEL_EASE }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[440px] flex-col border-l border-border bg-white shadow-[-8px_0_32px_rgba(26,26,26,0.06)]"
          >
            <DrawerHeader onClose={onClose} />
            <DrawerBody
              link={link}
              moduleTitle={moduleTitle}
              task={task}
              checklistHref={checklistHref}
              pending={pendingIds.has(link.id)}
              onUpdate={(patch) => updateLink(link.id, patch)}
              onDelete={() => {
                deleteLink(link.id);
                onClose();
              }}
              onRefetch={() => refetchLink(link.id)}
              onAssign={() => onAssignClick(link.id)}
            />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function DrawerHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-gold/15 px-5 py-3">
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
        Shopping Link
      </span>
      <button
        onClick={onClose}
        aria-label="Close"
        className="rounded-md p-1 text-ink-faint transition-colors hover:bg-ivory-warm hover:text-ink"
      >
        <X size={16} strokeWidth={1.6} />
      </button>
    </div>
  );
}

function DrawerBody({
  link,
  moduleTitle,
  task,
  checklistHref,
  pending,
  onUpdate,
  onDelete,
  onRefetch,
  onAssign,
}: {
  link: ShoppingLink;
  moduleTitle: string | null;
  task: TaskMeta | null;
  checklistHref: string;
  pending: boolean;
  onUpdate: (patch: Partial<ShoppingLink>) => void;
  onDelete: () => void;
  onRefetch: () => void;
  onAssign: () => void;
}) {
  const detached = link.detachedTaskId != null || (link.taskId != null && !task);
  const isStandalone = link.taskId == null && !detached;
  const total = link.price != null ? link.price * link.quantity : null;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      {/* Image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-ivory-warm">
        {link.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={link.imageUrl}
            alt={link.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-faint/40">
            <ImageOff size={36} strokeWidth={1.2} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-5 px-5 py-5">
        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <h2 className="font-serif text-[22px] leading-tight text-ink">
            {link.title}
          </h2>
          <div className="flex items-center gap-2">
            {link.faviconUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={link.faviconUrl}
                alt=""
                className="h-3.5 w-3.5 rounded-sm"
              />
            )}
            <span
              className="font-mono text-[11px] text-ink-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {link.domain}
            </span>
          </div>
        </div>

        {detached && (
          <div className="flex items-start gap-2 rounded-md border border-rose/30 bg-rose-pale/40 px-3 py-2 text-[11.5px] text-rose">
            <AlertTriangle size={13} strokeWidth={1.8} className="mt-0.5 shrink-0" />
            <div className="flex flex-1 items-start justify-between gap-2">
              <span>
                The task this link was attached to was deleted. It&rsquo;s now a
                standalone item.
              </span>
              <button
                onClick={onAssign}
                className="shrink-0 rounded bg-rose/90 px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wider text-ivory transition-colors hover:bg-rose"
              >
                Assign to another task
              </button>
            </div>
          </div>
        )}

        {/* Price + qty */}
        <div
          className="grid grid-cols-3 gap-3 border-y border-gold/10 py-3"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <Field label="Price">
            <input
              type="number"
              step="0.01"
              value={link.price ?? ""}
              onChange={(e) => {
                const raw = e.target.value;
                onUpdate({
                  price: raw === "" ? null : Number(raw),
                });
              }}
              placeholder="—"
              className="w-full bg-transparent font-mono text-[14px] text-ink outline-none"
              style={{ fontFamily: "var(--font-mono)" }}
            />
          </Field>
          <Field label="Qty">
            <input
              type="number"
              min={1}
              value={link.quantity}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                if (Number.isFinite(n) && n > 0) onUpdate({ quantity: n });
              }}
              className="w-full bg-transparent font-mono text-[14px] text-ink outline-none"
              style={{ fontFamily: "var(--font-mono)" }}
            />
          </Field>
          <Field label="Total">
            <span className="font-mono text-[14px] font-semibold text-saffron">
              {formatPrice(total, link.currency)}
            </span>
          </Field>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
            Status
          </span>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onUpdate({ status: opt.value })}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-colors",
                  link.status === opt.value
                    ? "border-saffron bg-saffron/15 text-ink"
                    : "border-border text-ink-muted hover:border-gold/30 hover:text-ink",
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", opt.dot)} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
            Note
          </span>
          <textarea
            value={link.userNote}
            onChange={(e) => onUpdate({ userNote: e.target.value })}
            placeholder="Add a note…"
            rows={3}
            className="w-full resize-none rounded-md border border-border bg-white p-2 text-[12px] text-ink-soft outline-none placeholder:text-ink-faint focus:border-gold"
          />
        </div>

        {/* Context: module + task */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
            Context
          </span>
          <div className="flex flex-col gap-1 rounded-md bg-ivory-warm/60 px-3 py-2.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[10.5px] uppercase tracking-wider text-ink-faint">
                Module
              </span>
              <span
                className={cn(
                  "truncate text-[12px]",
                  moduleTitle ? "text-ink-soft" : "italic text-ink-faint/70",
                )}
              >
                {moduleTitle ?? "Unassigned"}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[10.5px] uppercase tracking-wider text-ink-faint">
                Task
              </span>
              <span className="truncate text-right text-[12px] italic text-ink-soft">
                {task
                  ? task.title
                  : detached
                    ? "Task deleted"
                    : "No specific task"}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-2 flex flex-col gap-2">
          {task && (
            <Link
              href={checklistHref}
              className="flex items-center justify-between gap-2 rounded-md border border-gold/30 bg-gold-pale/30 px-3 py-2 text-[12px] font-medium text-gold transition-colors hover:bg-gold-pale/50"
            >
              <span>Go to task</span>
              <ArrowRight size={13} strokeWidth={1.8} />
            </Link>
          )}
          {(isStandalone || detached) && !task && (
            <button
              onClick={onAssign}
              className="flex items-center justify-between gap-2 rounded-md border border-gold/30 bg-gold-pale/30 px-3 py-2 text-[12px] font-medium text-gold transition-colors hover:bg-gold-pale/50"
            >
              <span className="flex items-center gap-1.5">
                <Link2 size={13} strokeWidth={1.8} />
                Assign to task
              </span>
              <ArrowRight size={13} strokeWidth={1.8} />
            </button>
          )}
          {task && (
            <button
              onClick={onAssign}
              className="flex items-center justify-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[11px] uppercase tracking-wider text-ink-muted transition-colors hover:border-gold/30 hover:text-ink"
            >
              <Link2 size={11} strokeWidth={1.8} />
              Change task
            </button>
          )}
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-2 rounded-md border border-border bg-white px-3 py-2 text-[12px] text-ink transition-colors hover:border-gold/30"
          >
            <span>Open link</span>
            <ExternalLink size={13} strokeWidth={1.6} />
          </a>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefetch}
              disabled={pending}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[11px] uppercase tracking-wider text-ink-muted transition-colors hover:border-gold/30 hover:text-ink disabled:opacity-50"
            >
              <RefreshCw
                size={11}
                strokeWidth={1.8}
                className={pending ? "animate-spin" : ""}
              />
              Refetch
            </button>
            <button
              onClick={onDelete}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-rose/30 px-3 py-1.5 text-[11px] uppercase tracking-wider text-rose transition-colors hover:bg-rose-pale/40"
            >
              <Trash2 size={11} strokeWidth={1.8} />
              Delete
            </button>
          </div>
        </div>

        {/* Metadata footer */}
        <div
          className="grid grid-cols-2 gap-x-3 gap-y-1 border-t border-border/60 pt-3 text-[10px] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <span>Added {new Date(link.createdAt).toLocaleDateString()}</span>
          <span className="text-right">
            Updated {new Date(link.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
        {label}
      </span>
      {children}
    </div>
  );
}
