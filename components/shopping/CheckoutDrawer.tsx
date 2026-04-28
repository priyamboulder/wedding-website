"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  ShoppingCart,
  AlertTriangle,
  Check,
  Calendar,
  CreditCard,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShoppingLink } from "@/lib/link-preview/types";
import { useShoppingLinks } from "@/contexts/ShoppingLinksContext";

const PANEL_EASE = [0.32, 0.72, 0, 1] as const;

function money(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function CheckoutDrawer({
  open,
  onClose,
  items,
  weddingDate,
}: {
  open: boolean;
  onClose: () => void;
  items: ShoppingLink[];
  weddingDate: Date | null;
}) {
  const { toggleCart, checkoutCart } = useShoppingLinks();
  const [placed, setPlaced] = useState<string | null>(null);

  useEffect(() => {
    if (!open) setPlaced(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const nativeItems = useMemo(
    () => items.filter((i) => i.sourceType === "ananya_store"),
    [items],
  );

  const subtotal = useMemo(
    () =>
      nativeItems.reduce(
        (sum, i) => sum + (i.price ?? 0) * i.quantity,
        0,
      ),
    [nativeItems],
  );
  const currency = nativeItems[0]?.currency ?? "USD";

  const lateItems = useMemo(() => {
    if (!weddingDate) return [];
    return nativeItems.filter((i) => {
      if (!i.leadTimeDays) return false;
      const etaMs = Date.now() + i.leadTimeDays * 24 * 60 * 60 * 1000;
      return etaMs > weddingDate.getTime();
    });
  }, [nativeItems, weddingDate]);

  function placeOrder() {
    const ids = nativeItems.map((i) => i.id);
    if (ids.length === 0) return;
    const orderRef = `ORD-${Date.now().toString(36).toUpperCase()}`;
    checkoutCart(ids);
    setPlaced(orderRef);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="checkout-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-[1px]"
          />
          <motion.aside
            key="checkout-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.32, ease: PANEL_EASE }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[480px] flex-col border-l border-gold/20 bg-white shadow-[-12px_0_32px_rgba(26,26,26,0.12)]"
          >
            <div className="flex items-center justify-between border-b border-gold/15 px-5 py-3">
              <div className="flex items-center gap-2">
                <ShoppingCart size={14} strokeWidth={1.8} className="text-ink" />
                <span className="font-serif text-[16px] text-ink">
                  {placed ? "Order placed" : "Ananya Checkout"}
                </span>
                {!placed && nativeItems.length > 0 && (
                  <span
                    className="font-mono text-[10px] uppercase tracking-wider text-ink-faint"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    · {nativeItems.length} item{nativeItems.length === 1 ? "" : "s"}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                aria-label="Close checkout"
                className="rounded-md p-1 text-ink-faint hover:bg-ivory-warm hover:text-ink"
              >
                <X size={16} strokeWidth={1.6} />
              </button>
            </div>

            {placed ? (
              <OrderConfirmation orderRef={placed} onDone={onClose} />
            ) : nativeItems.length === 0 ? (
              <EmptyCart onClose={onClose} />
            ) : (
              <>
                <div className="flex-1 overflow-y-auto">
                  {lateItems.length > 0 && (
                    <div className="mx-5 mt-4 flex items-start gap-2 rounded-md border border-rose/30 bg-rose-pale/40 px-3 py-2 text-[11.5px] text-rose">
                      <AlertTriangle
                        size={13}
                        strokeWidth={1.8}
                        className="mt-0.5 shrink-0"
                      />
                      <span>
                        {lateItems.length} item{lateItems.length === 1 ? "" : "s"} won&rsquo;t arrive before
                        your wedding date based on current lead times. Consider
                        shorter-lead variants or contact the artisan.
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col divide-y divide-border/60 px-5">
                    {nativeItems.map((i) => (
                      <CartLine
                        key={i.id}
                        item={i}
                        onRemove={() => toggleCart(i.id)}
                        weddingDate={weddingDate}
                      />
                    ))}
                  </div>
                </div>

                <div
                  className="border-t border-gold/15 bg-ivory-warm/40 px-5 py-4"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <div className="flex items-baseline justify-between pb-3">
                    <span className="text-[10.5px] uppercase tracking-wider text-ink-muted">
                      Subtotal
                    </span>
                    <span className="text-[18px] font-semibold text-saffron">
                      {money(subtotal, currency)}
                    </span>
                  </div>
                  {weddingDate && (
                    <div className="flex items-center gap-1.5 pb-3 text-[10.5px] text-ink-muted">
                      <Calendar size={11} strokeWidth={1.8} />
                      <span>
                        Delivery scheduled against wedding date{" "}
                        {weddingDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={placeOrder}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-2.5 text-[13px] font-medium uppercase tracking-wider text-ivory transition-opacity hover:opacity-90"
                  >
                    <CreditCard size={13} strokeWidth={1.8} />
                    Place Order
                  </button>
                  <p className="pt-2 text-center text-[10px] text-ink-faint">
                    Simulated checkout — no card will be charged. In production
                    this integrates with Stripe.
                  </p>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function CartLine({
  item,
  onRemove,
  weddingDate,
}: {
  item: ShoppingLink;
  onRemove: () => void;
  weddingDate: Date | null;
}) {
  const total = (item.price ?? 0) * item.quantity;
  const eta = item.leadTimeDays
    ? new Date(Date.now() + item.leadTimeDays * 24 * 60 * 60 * 1000)
    : null;
  const late =
    eta && weddingDate ? eta.getTime() > weddingDate.getTime() : false;

  return (
    <div className="flex gap-3 py-3">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-ivory-warm">
        {item.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-start justify-between gap-2">
          <span className="line-clamp-2 font-serif text-[13px] text-ink">
            {item.title}
          </span>
          <button
            onClick={onRemove}
            aria-label="Remove from cart"
            className="shrink-0 rounded p-0.5 text-ink-faint hover:text-rose"
          >
            <Trash2 size={12} strokeWidth={1.6} />
          </button>
        </div>
        <div
          className="flex items-center gap-1.5 font-mono text-[10px] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <span>{item.vendorName}</span>
          {item.variant && (
            <>
              <span>·</span>
              <span>{item.variant.label}</span>
            </>
          )}
          <span>·</span>
          <span>×{item.quantity}</span>
        </div>
        <div
          className="flex items-baseline justify-between gap-2 pt-0.5"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <span
            className={cn(
              "text-[10px] uppercase tracking-wider",
              late ? "text-rose" : "text-ink-faint",
            )}
          >
            {eta
              ? `ETA ${eta.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}`
              : "—"}
            {late && " · late"}
          </span>
          <span className="text-[12px] font-semibold text-saffron">
            {money(total, item.currency)}
          </span>
        </div>
      </div>
    </div>
  );
}

function OrderConfirmation({
  orderRef,
  onDone,
}: {
  orderRef: string;
  onDone: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sage/30">
        <Check size={24} strokeWidth={2} className="text-ink" />
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="font-serif text-[22px] text-ink">Order placed</h2>
        <p className="text-[12.5px] text-ink-muted">
          Your shopping items have been moved to{" "}
          <span className="font-medium text-ink">Ordered</span> with tracking
          numbers and ETAs. You can view them in the Shopping grid.
        </p>
      </div>
      <span
        className="rounded-md bg-ivory-warm px-3 py-1 font-mono text-[11px] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {orderRef}
      </span>
      <button
        onClick={onDone}
        className="mt-2 rounded-md bg-ink px-4 py-1.5 text-[11.5px] font-medium uppercase tracking-wider text-ivory hover:opacity-90"
      >
        Back to Shopping
      </button>
    </div>
  );
}

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ivory-warm">
        <ShoppingCart size={22} strokeWidth={1.4} className="text-ink-faint" />
      </div>
      <h2 className="font-serif text-[18px] text-ink">Your cart is empty</h2>
      <p className="text-[12px] text-ink-muted">
        Add items from the catalog or hit Checkout on any Ananya item card.
      </p>
      <button
        onClick={onClose}
        className="mt-1 rounded-md border border-gold/30 bg-gold-pale/30 px-4 py-1.5 text-[11px] uppercase tracking-wider text-gold hover:bg-gold-pale/50"
      >
        Browse catalog
      </button>
    </div>
  );
}
