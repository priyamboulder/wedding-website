"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useShoppingLinks } from "@/contexts/ShoppingLinksContext";
import { ShoppingLinks } from "./ShoppingLinks";

export function ShoppingDrawer({
  taskId,
  module,
}: {
  taskId: string;
  module: string;
}) {
  const { getLinksForTask } = useShoppingLinks();
  const links = getLinksForTask(taskId);
  const [open, setOpen] = useState(() => links.length > 0);
  const prevTaskId = useRef(taskId);

  // When task changes, reset expand state based on whether the new task has links
  useEffect(() => {
    if (prevTaskId.current !== taskId) {
      setOpen(links.length > 0);
      prevTaskId.current = taskId;
    }
  }, [taskId, links.length]);

  const totalSpend = links
    .filter((l) => l.price != null && l.status !== "returned")
    .reduce((sum, l) => sum + (l.price ?? 0) * l.quantity, 0);

  const primaryCurrency = links.find((l) => l.price != null)?.currency ?? "USD";

  return (
    <div className="shrink-0 border-t border-border bg-white/90 backdrop-blur-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className="group flex w-full items-center gap-2 px-6 py-2.5 text-left transition-colors hover:bg-ivory-warm/60"
        aria-expanded={open}
      >
        <ShoppingBag
          size={12}
          strokeWidth={1.8}
          className="text-ink-faint group-hover:text-ink-muted"
        />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint group-hover:text-ink-muted">
          Shopping
        </span>
        {links.length > 0 && (
          <span
            className="font-mono text-[10.5px] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {links.length} item{links.length === 1 ? "" : "s"}
            {totalSpend > 0 && (
              <span className="ml-1">
                ·{" "}
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: primaryCurrency,
                  maximumFractionDigits: 0,
                }).format(totalSpend)}
              </span>
            )}
          </span>
        )}
        <ChevronDown
          size={13}
          strokeWidth={1.8}
          className={cn(
            "ml-auto text-ink-faint transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="drawer-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden"
          >
            <div className="panel-scroll max-h-[45vh] overflow-y-auto px-6 pb-4 pt-1">
              <ShoppingLinks
                taskId={taskId}
                module={module}
                hideHeader
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
