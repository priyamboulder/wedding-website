"use client";

// Order flow modal. Runs pre-flight on mount, blocks ordering until blocking
// findings are resolved (or disappear after edits), then collects quantity,
// shipping address(es), mock payment, and places the order.
//
// Prototype-only: localStorage drives everything; the Stripe step simulates a
// successful payment.

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { X, CheckCircle2, AlertTriangle, AlertOctagon, ArrowRight, MapPin, ChevronLeft } from "lucide-react";
import type { AlbumOrderAddress, AlbumProject } from "@/types/album";
import { ALBUM_COVERS, ALBUM_PAPERS, ALBUM_SIZES, priceFor } from "@/lib/album-layouts";
import { preflightBlockers, preflightWarnings, runPreflight } from "@/lib/album-preflight";
import { useAlbumStore } from "@/stores/album-store";

type Step = "preflight" | "summary" | "shipping" | "payment" | "confirm";

interface OrderFlowModalProps {
  album: AlbumProject;
  onClose: () => void;
  onJumpToSpread?: (spreadId: string) => void;
}

const EMPTY_ADDRESS: AlbumOrderAddress = {
  recipient: "",
  line1: "",
  line2: "",
  city: "",
  region: "",
  postal: "",
  country: "USA",
};

const SHIPPING_FLAT = 18;

export function OrderFlowModal({ album, onClose, onJumpToSpread }: OrderFlowModalProps) {
  const placeOrder = useAlbumStore((s) => s.placeOrder);

  const findings = useMemo(() => runPreflight(album), [album]);
  const blockers = preflightBlockers(findings);
  const warnings = preflightWarnings(findings);

  const [step, setStep] = useState<Step>(blockers.length > 0 ? "preflight" : "summary");
  const [quantity, setQuantity] = useState(1);
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [addresses, setAddresses] = useState<AlbumOrderAddress[]>([{ ...EMPTY_ADDRESS }]);

  const pageCount = album.spreads.length * 2;
  const price = priceFor(album.size, album.cover_type, pageCount);
  const unitPrice = price.total;
  const shipping = SHIPPING_FLAT * quantity;
  const totalPrice = unitPrice * quantity + shipping;

  const sizeMeta = ALBUM_SIZES.find((s) => s.id === album.size);
  const coverMeta = ALBUM_COVERS.find((c) => c.id === album.cover_type);
  const paperMeta = ALBUM_PAPERS.find((p) => p.id === album.paper_type);

  // Keep addresses array length synced with quantity.
  function ensureAddresses(qty: number, same: boolean) {
    if (same) {
      setAddresses((prev) => [prev[0] ?? { ...EMPTY_ADDRESS }]);
    } else {
      setAddresses((prev) => {
        const next = [...prev];
        while (next.length < qty) next.push({ ...EMPTY_ADDRESS });
        return next.slice(0, qty);
      });
    }
  }

  function updateAddress(idx: number, patch: Partial<AlbumOrderAddress>) {
    setAddresses((prev) => prev.map((a, i) => (i === idx ? { ...a, ...patch } : a)));
  }

  const canProceedShipping = (useSameAddress ? [addresses[0]] : addresses).every(
    (a) => a?.recipient && a.line1 && a.city && a.region && a.postal,
  );

  function handlePlaceOrder() {
    const finalAddresses = useSameAddress
      ? Array.from({ length: quantity }, () => ({ ...addresses[0] }))
      : addresses;
    placeOrder(album.id, {
      quantity,
      unit_price: unitPrice,
      total_price: totalPrice,
      shipping_addresses: finalAddresses,
    });
    setStep("confirm");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4 py-8" onClick={onClose}>
      <div
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-ivory shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            {step !== "preflight" && step !== "confirm" && (
              <button
                onClick={() => {
                  if (step === "summary") setStep(blockers.length > 0 ? "preflight" : "summary");
                  if (step === "shipping") setStep("summary");
                  if (step === "payment") setStep("shipping");
                }}
                className="rounded p-1 text-ink-muted hover:bg-ivory-warm"
                aria-label="Back"
              >
                <ChevronLeft size={16} />
              </button>
            )}
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron">
                {step === "preflight" && "Pre-flight checks"}
                {step === "summary" && "Order summary"}
                {step === "shipping" && "Shipping"}
                {step === "payment" && "Payment"}
                {step === "confirm" && "Order placed"}
              </p>
              <h2 className="mt-1 font-serif text-[22px] leading-tight text-ink">
                {step === "preflight" && "Make sure everything's ready"}
                {step === "summary" && album.title}
                {step === "shipping" && "Where should we send it?"}
                {step === "payment" && "Secure checkout"}
                {step === "confirm" && "You're all set"}
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="rounded p-1.5 text-ink-muted hover:bg-ivory-warm" aria-label="Close">
            <X size={16} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === "preflight" && (
            <PreflightPanel
              blockers={blockers}
              warnings={warnings}
              onJumpToSpread={(id) => {
                onJumpToSpread?.(id);
                onClose();
              }}
            />
          )}

          {step === "summary" && (
            <SummaryPanel
              album={album}
              sizeLabel={sizeMeta?.label ?? album.size}
              coverLabel={coverMeta?.label ?? album.cover_type}
              paperLabel={paperMeta?.label ?? album.paper_type}
              pageCount={pageCount}
              unitPrice={unitPrice}
              quantity={quantity}
              onQuantityChange={(q) => {
                setQuantity(q);
                ensureAddresses(q, useSameAddress);
              }}
              shipping={shipping}
              totalPrice={totalPrice}
              warningCount={warnings.length}
            />
          )}

          {step === "shipping" && (
            <ShippingPanel
              quantity={quantity}
              addresses={addresses}
              useSameAddress={useSameAddress}
              onToggleSameAddress={(v) => {
                setUseSameAddress(v);
                ensureAddresses(quantity, v);
              }}
              onUpdate={updateAddress}
            />
          )}

          {step === "payment" && (
            <PaymentPanel totalPrice={totalPrice} onPlaceOrder={handlePlaceOrder} />
          )}

          {step === "confirm" && (
            <ConfirmPanel
              totalPrice={totalPrice}
              quantity={quantity}
              addressCount={useSameAddress ? 1 : addresses.length}
              estimatedDelivery={new Date(Date.now() + 1000 * 60 * 60 * 24 * 21).toLocaleDateString()}
              onClose={onClose}
            />
          )}
        </div>

        {/* Footer — step-aware CTAs */}
        {step !== "confirm" && (
          <footer className="flex items-center justify-between gap-4 border-t border-border bg-white px-6 py-4">
            <div>
              <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
                {step === "preflight" ? "Blockers" : "Total"}
              </p>
              <p className="font-serif text-[20px] text-ink">
                {step === "preflight" ? `${blockers.length} to fix` : `$${totalPrice.toFixed(2)}`}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="rounded-md border border-border bg-white px-4 py-2 text-[12.5px] font-medium text-ink-muted hover:bg-ivory-warm"
              >
                Cancel
              </button>
              {step === "preflight" && (
                <button
                  onClick={() => setStep("summary")}
                  disabled={blockers.length > 0}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-[12.5px] font-medium",
                    blockers.length > 0
                      ? "bg-ink/30 text-ivory cursor-not-allowed"
                      : "bg-ink text-ivory hover:bg-ink-soft",
                  )}
                >
                  Continue <ArrowRight size={12} />
                </button>
              )}
              {step === "summary" && (
                <button
                  onClick={() => setStep("shipping")}
                  className="inline-flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-[12.5px] font-medium text-ivory hover:bg-ink-soft"
                >
                  Continue to shipping <ArrowRight size={12} />
                </button>
              )}
              {step === "shipping" && (
                <button
                  onClick={() => setStep("payment")}
                  disabled={!canProceedShipping}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-[12.5px] font-medium",
                    canProceedShipping
                      ? "bg-ink text-ivory hover:bg-ink-soft"
                      : "bg-ink/30 text-ivory cursor-not-allowed",
                  )}
                >
                  Continue to payment <ArrowRight size={12} />
                </button>
              )}
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}

// ── Step panels ────────────────────────────────────────────────────────────

function PreflightPanel({
  blockers,
  warnings,
  onJumpToSpread,
}: {
  blockers: ReturnType<typeof runPreflight>;
  warnings: ReturnType<typeof runPreflight>;
  onJumpToSpread: (spreadId: string) => void;
}) {
  if (blockers.length === 0 && warnings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="mb-4 rounded-full bg-sage-pale/60 p-4 text-sage">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="font-serif text-[20px] text-ink">All checks passed</h3>
        <p className="mt-2 max-w-md text-[13px] text-ink-muted">
          Your album is ready to print. Proceed to review the summary.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-5">
      {blockers.length > 0 && (
        <Section
          icon={<AlertOctagon size={16} />}
          title={`${blockers.length} issue${blockers.length === 1 ? "" : "s"} to fix before ordering`}
          tone="block"
        >
          {blockers.map((f) => (
            <Finding key={f.id} finding={f} onJump={onJumpToSpread} />
          ))}
        </Section>
      )}
      {warnings.length > 0 && (
        <Section
          icon={<AlertTriangle size={16} />}
          title={`${warnings.length} warning${warnings.length === 1 ? "" : "s"} — you can still proceed`}
          tone="warn"
        >
          {warnings.map((f) => (
            <Finding key={f.id} finding={f} onJump={onJumpToSpread} />
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({
  icon,
  title,
  tone,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  tone: "block" | "warn";
  children: React.ReactNode;
}) {
  const toneCls =
    tone === "block"
      ? "border-rose/40 bg-rose-pale/30 text-rose"
      : "border-saffron/40 bg-saffron-pale/30 text-saffron";
  return (
    <div className={cn("rounded-lg border p-4", toneCls)}>
      <div className="flex items-center gap-2">
        {icon}
        <h4 className="font-serif text-[14.5px]">{title}</h4>
      </div>
      <div className="mt-3 space-y-2">{children}</div>
    </div>
  );
}

function Finding({
  finding,
  onJump,
}: {
  finding: ReturnType<typeof runPreflight>[number];
  onJump: (spreadId: string) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md bg-white px-3 py-2.5">
      <div>
        <p className="font-serif text-[13px] text-ink">{finding.title}</p>
        <p className="mt-0.5 text-[11.5px] leading-snug text-ink-muted">{finding.detail}</p>
      </div>
      {finding.spreadId && finding.action === "jump" && (
        <button
          onClick={() => onJump(finding.spreadId!)}
          className="shrink-0 rounded-md border border-border bg-white px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-ink hover:bg-ivory-warm"
        >
          Jump to spread
        </button>
      )}
    </div>
  );
}

function SummaryPanel({
  album,
  sizeLabel,
  coverLabel,
  paperLabel,
  pageCount,
  unitPrice,
  quantity,
  onQuantityChange,
  shipping,
  totalPrice,
  warningCount,
}: {
  album: AlbumProject;
  sizeLabel: string;
  coverLabel: string;
  paperLabel: string;
  pageCount: number;
  unitPrice: number;
  quantity: number;
  onQuantityChange: (q: number) => void;
  shipping: number;
  totalPrice: number;
  warningCount: number;
}) {
  const coverMeta = ALBUM_COVERS.find((c) => c.id === album.cover_type);
  const coverPhoto = album.photo_pool.find((p) => p.id === album.cover_photo_id) ?? album.photo_pool[0];
  return (
    <div className="grid gap-6 md:grid-cols-[200px_1fr]">
      <div
        className="relative flex aspect-square w-full items-end overflow-hidden rounded-md border border-border shadow-md"
        style={{ background: coverMeta?.swatch }}
      >
        {coverPhoto && album.cover_type === "photo-wrap" && (
          <img src={coverPhoto.url} className="absolute inset-0 h-full w-full object-cover" alt="" />
        )}
        <div className="relative p-3">
          {album.spine_text && (
            <p className="font-serif text-[10px] uppercase tracking-[0.18em] text-ink/80">
              {album.spine_text}
            </p>
          )}
        </div>
      </div>
      <div>
        <dl className="space-y-2 text-[13px]">
          <Row label="Size" value={sizeLabel} />
          <Row label="Cover" value={coverLabel} />
          <Row label="Paper" value={paperLabel} />
          <Row label="Pages" value={`${pageCount} (${album.spreads.length} spreads)`} />
          <Row label="Photos in album" value={`${album.photo_pool.length}`} />
        </dl>

        {warningCount > 0 && (
          <p className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-saffron-pale/40 px-3 py-1.5 text-[11.5px] text-saffron">
            <AlertTriangle size={12} /> {warningCount} non-blocking warning{warningCount === 1 ? "" : "s"} — see pre-flight.
          </p>
        )}

        <div className="mt-5 rounded-md border border-border bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">Quantity</p>
              <p className="mt-0.5 text-[11px] text-ink-muted">Extra copies make great gifts for parents.</p>
            </div>
            <div className="flex items-center gap-0.5 rounded border border-border">
              <button
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                className="px-3 py-1.5 text-ink hover:bg-ivory-warm"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="min-w-[2.5rem] px-2 text-center font-mono text-[12px] tabular-nums">{quantity}</span>
              <button
                onClick={() => onQuantityChange(Math.min(10, quantity + 1))}
                className="px-3 py-1.5 text-ink hover:bg-ivory-warm"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>
          <div className="mt-4 space-y-1 border-t border-border pt-4 text-[12.5px]">
            <Row label={`${quantity} × ${sizeLabel}`} value={`$${(unitPrice * quantity).toFixed(2)}`} />
            <Row label="Shipping" value={`$${shipping.toFixed(2)}`} />
            <div className="flex justify-between border-t border-border pt-2 font-serif text-[16px] text-ink">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border/40 pb-1.5">
      <dt className="font-mono text-[10.5px] uppercase tracking-wider text-ink-muted">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}

function ShippingPanel({
  quantity,
  addresses,
  useSameAddress,
  onToggleSameAddress,
  onUpdate,
}: {
  quantity: number;
  addresses: AlbumOrderAddress[];
  useSameAddress: boolean;
  onToggleSameAddress: (v: boolean) => void;
  onUpdate: (idx: number, patch: Partial<AlbumOrderAddress>) => void;
}) {
  return (
    <div className="space-y-4">
      {quantity > 1 && (
        <label className="flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2.5 text-[12.5px]">
          <input
            type="checkbox"
            checked={useSameAddress}
            onChange={(e) => onToggleSameAddress(e.target.checked)}
            className="h-3.5 w-3.5 accent-[var(--color-gold)]"
          />
          <span className="text-ink">Ship all {quantity} copies to the same address</span>
        </label>
      )}
      <div className="space-y-4">
        {(useSameAddress ? [addresses[0]] : addresses).map((addr, idx) => (
          <AddressForm
            key={idx}
            label={useSameAddress ? "Shipping address" : `Copy ${idx + 1}`}
            address={addr}
            onChange={(patch) => onUpdate(idx, patch)}
          />
        ))}
      </div>
    </div>
  );
}

function AddressForm({
  label,
  address,
  onChange,
}: {
  label: string;
  address: AlbumOrderAddress;
  onChange: (patch: Partial<AlbumOrderAddress>) => void;
}) {
  return (
    <fieldset className="rounded-md border border-border bg-white p-4">
      <legend className="flex items-center gap-1.5 px-1 font-mono text-[10px] uppercase tracking-[0.14em] text-saffron">
        <MapPin size={11} /> {label}
      </legend>
      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input label="Recipient" value={address.recipient} onChange={(v) => onChange({ recipient: v })} />
        <Input label="Country" value={address.country} onChange={(v) => onChange({ country: v })} />
        <Input label="Address line 1" span2 value={address.line1} onChange={(v) => onChange({ line1: v })} />
        <Input label="Address line 2 (optional)" span2 value={address.line2 ?? ""} onChange={(v) => onChange({ line2: v })} />
        <Input label="City" value={address.city} onChange={(v) => onChange({ city: v })} />
        <Input label="State / region" value={address.region} onChange={(v) => onChange({ region: v })} />
        <Input label="Postal code" value={address.postal} onChange={(v) => onChange({ postal: v })} />
      </div>
    </fieldset>
  );
}

function Input({
  label,
  value,
  onChange,
  span2,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  span2?: boolean;
}) {
  return (
    <label className={cn("flex flex-col gap-1", span2 && "sm:col-span-2")}>
      <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30"
      />
    </label>
  );
}

function PaymentPanel({ totalPrice, onPlaceOrder }: { totalPrice: number; onPlaceOrder: () => void }) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-white p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-saffron">Mock checkout</p>
        <p className="mt-2 text-[12.5px] text-ink-muted">
          Real checkout will use Stripe Elements. This is a prototype — click the button to simulate a
          successful payment.
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <span className="font-serif text-[15px] text-ink">Amount due</span>
          <span className="font-serif text-[22px] text-ink">${totalPrice.toFixed(2)}</span>
        </div>
        <button
          onClick={onPlaceOrder}
          className="mt-4 w-full rounded-md bg-gold px-4 py-2.5 text-[13px] font-medium text-ink hover:brightness-95"
        >
          Pay ${totalPrice.toFixed(2)} & place order
        </button>
      </div>
    </div>
  );
}

function ConfirmPanel({
  totalPrice,
  quantity,
  addressCount,
  estimatedDelivery,
  onClose,
}: {
  totalPrice: number;
  quantity: number;
  addressCount: number;
  estimatedDelivery: string;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="mb-4 rounded-full bg-sage-pale/60 p-4 text-sage">
        <CheckCircle2 size={36} />
      </div>
      <h3 className="font-serif text-[22px] text-ink">Thank you — your album is in production</h3>
      <p className="mt-2 max-w-md text-[13px] leading-relaxed text-ink-muted">
        You'll get a confirmation email shortly. We'll ping you when your {quantity}
        {quantity === 1 ? " copy ships" : ` copies ship`} to
        {` ${addressCount}`} address{addressCount === 1 ? "" : "es"}.
      </p>
      <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 text-left">
        <Row label="Paid" value={`$${totalPrice.toFixed(2)}`} />
        <Row label="Estimated delivery" value={estimatedDelivery} />
      </dl>
      <button
        onClick={onClose}
        className="mt-6 rounded-md bg-ink px-4 py-2 text-[12.5px] font-medium text-ivory hover:bg-ink-soft"
      >
        Back to album
      </button>
    </div>
  );
}
