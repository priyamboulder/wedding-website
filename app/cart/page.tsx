"use client";

// ── My Selections ──────────────────────────────────────────────
// A mood board of vendors and stationery the couple has saved while
// browsing. No prices, no checkout language — "Send Inquiries" starts
// a batch conversation, "Save for Later" persists beyond the browser.
// Both prompt account creation; this is the only place we ever ask.

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SiteLayout } from "@/components/marketing/SiteLayout";
import { useCartStore, type CartItem } from "@/stores/cart-store";

const DISPLAY = "'Playfair Display', Georgia, serif";
const BODY = "'DM Sans', system-ui, sans-serif";

type Bucket = "vendor" | "stationery";

function bucketFor(item: CartItem): Bucket {
  return item.kind === "stationery" ? "stationery" : "vendor";
}

// Extract vendor slug from id so two packages from the same studio
// still count as one vendor in the summary line.
function vendorKey(item: CartItem): string {
  if (item.id.startsWith("pkg:")) return item.id.split(":")[1] ?? item.id;
  if (item.id.startsWith("inquiry:")) return item.id.split(":")[1] ?? item.id;
  return item.id;
}

function pluralize(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export default function SelectionsPage() {
  const items = useCartStore((s) => s.items);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);

  const [authOpen, setAuthOpen] = useState<null | "save" | "inquiries">(null);

  const { vendorItems, stationeryItems, vendorCount, stationeryCount } =
    useMemo(() => {
      const vItems = items.filter((i) => bucketFor(i) === "vendor");
      const sItems = items.filter((i) => bucketFor(i) === "stationery");
      const uniqueVendors = new Set(vItems.map(vendorKey));
      return {
        vendorItems: vItems,
        stationeryItems: sItems,
        vendorCount: uniqueVendors.size,
        stationeryCount: sItems.length,
      };
    }, [items]);

  const summaryLine = buildSummaryLine(vendorCount, stationeryCount);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-[1400px] px-6 pb-10 pt-8 md:px-12 md:pb-14 md:pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-end justify-between gap-8"
        >
          <div>
            <span
              className="text-[11px] uppercase text-[#A8998A]"
              style={{ fontFamily: BODY, letterSpacing: "0.3em" }}
            >
              My Selections
            </span>
            <h1
              className="mt-6 text-[#1C1917]"
              style={{
                fontFamily: DISPLAY,
                fontSize: "clamp(38px, 5vw, 72px)",
                lineHeight: 1.04,
                letterSpacing: "-0.02em",
                fontWeight: 400,
              }}
            >
              {items.length === 0 ? (
                <>
                  Your mood board is
                  <br />
                  <span style={{ fontStyle: "italic" }}>waiting.</span>
                </>
              ) : (
                <>
                  The pieces you&apos;re
                  <br />
                  <span style={{ fontStyle: "italic" }}>curating.</span>
                </>
              )}
            </h1>
            {items.length > 0 && (
              <p
                className="mt-7 max-w-[640px] text-[#1C1917]/75"
                style={{ fontFamily: BODY, fontSize: 17, lineHeight: 1.7 }}
              >
                {summaryLine}
              </p>
            )}
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={clear}
              className="shrink-0 text-[12.5px] text-[#A8998A] transition-colors hover:text-[#B8755D]"
              style={{ fontFamily: BODY, letterSpacing: "0.04em" }}
            >
              Clear all
            </button>
          )}
        </motion.div>
      </section>

      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <section className="mx-auto max-w-[1400px] px-6 pb-28 md:px-12">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
            <div className="flex flex-col gap-14">
              {vendorItems.length > 0 && (
                <SelectionGroup
                  eyebrow="Vendors"
                  count={vendorItems.length}
                  items={vendorItems}
                  onRemove={remove}
                />
              )}
              {stationeryItems.length > 0 && (
                <SelectionGroup
                  eyebrow="Stationery"
                  count={stationeryItems.length}
                  items={stationeryItems}
                  onRemove={remove}
                />
              )}
            </div>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-[20px] border border-[#1C1917]/10 bg-[#F7F5F0] p-8 md:p-10">
                <span
                  className="text-[11px] uppercase text-[#A8998A]"
                  style={{ fontFamily: BODY, letterSpacing: "0.3em" }}
                >
                  What&apos;s next
                </span>
                <h2
                  className="mt-5 text-[#1C1917]"
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: 26,
                    lineHeight: 1.2,
                    letterSpacing: "-0.005em",
                    fontWeight: 500,
                  }}
                >
                  Turn this into a conversation.
                </h2>
                <p
                  className="mt-4 text-[#1C1917]/70"
                  style={{ fontFamily: BODY, fontSize: 14.5, lineHeight: 1.7 }}
                >
                  Reach out to every studio at once, or tuck this away and come
                  back when you&apos;re ready.
                </p>

                <div className="mt-8 flex flex-col gap-4">
                  <button
                    type="button"
                    onClick={() => setAuthOpen("inquiries")}
                    className="inline-flex items-center justify-center gap-3 bg-[#1C1917] px-7 py-4 text-[13px] tracking-[0.08em] text-[#F7F5F0] transition-colors hover:bg-[#B8755D]"
                    style={{ fontFamily: BODY, fontWeight: 500 }}
                  >
                    Send Inquiries →
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthOpen("save")}
                    className="inline-flex items-center justify-center gap-2 border border-[#1C1917]/20 px-7 py-4 text-[13px] tracking-[0.08em] text-[#1C1917] transition-colors hover:border-[#B8755D] hover:text-[#B8755D]"
                    style={{ fontFamily: BODY, fontWeight: 500 }}
                  >
                    Save for Later
                  </button>
                </div>

                <div className="mt-8 flex items-start gap-3 border-t border-[#1C1917]/10 pt-6">
                  <span
                    aria-hidden
                    className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#B8755D]"
                  />
                  <p
                    className="text-[#1C1917]/70"
                    style={{ fontFamily: BODY, fontSize: 12.5, lineHeight: 1.7 }}
                  >
                    Your selections are saved in this browser. Create a free
                    account to access them anywhere.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>
      )}

      <AnimatePresence>
        {authOpen && (
          <AuthPrompt mode={authOpen} onClose={() => setAuthOpen(null)} />
        )}
      </AnimatePresence>
    </SiteLayout>
  );
}

function buildSummaryLine(vendorCount: number, stationeryCount: number) {
  const parts: string[] = [];
  if (vendorCount > 0) parts.push(pluralize(vendorCount, "vendor", "vendors"));
  if (stationeryCount > 0)
    parts.push(
      pluralize(stationeryCount, "invitation suite", "invitation suites"),
    );
  if (parts.length === 0) return "You haven't selected anything yet.";
  const joined =
    parts.length === 1 ? parts[0] : `${parts[0]} and ${parts[1]}`;
  return `You've selected ${joined}.`;
}

function SelectionGroup({
  eyebrow,
  count,
  items,
  onRemove,
}: {
  eyebrow: string;
  count: number;
  items: CartItem[];
  onRemove: (id: string) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span
          className="text-[11px] uppercase text-[#A8998A]"
          style={{ fontFamily: BODY, letterSpacing: "0.3em" }}
        >
          {eyebrow}
        </span>
        <span
          className="text-[11px] text-[#A8998A]"
          style={{ fontFamily: BODY, letterSpacing: "0.2em" }}
        >
          {String(count).padStart(2, "0")}
        </span>
      </div>
      <ul className="mt-5 flex flex-col">
        <AnimatePresence initial={false}>
          {items.map((i) => (
            <SelectionRow key={i.id} item={i} onRemove={onRemove} />
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

function SelectionRow({
  item,
  onRemove,
}: {
  item: CartItem;
  onRemove: (id: string) => void;
}) {
  const { category, packageLabel } = splitSubtitle(item);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-5 border-b border-[#1C1917]/10 py-6 md:gap-8"
    >
      <div
        className="h-24 w-24 shrink-0 md:h-28 md:w-28"
        style={{ backgroundColor: item.imageBg ?? "#A8998A" }}
      />
      <div className="min-w-0 flex-1">
        {category && (
          <span
            className="block text-[10.5px] uppercase text-[#A8998A]"
            style={{ fontFamily: BODY, letterSpacing: "0.28em" }}
          >
            {category}
          </span>
        )}
        <h3
          className="mt-2 truncate text-[#1C1917]"
          style={{
            fontFamily: DISPLAY,
            fontSize: 22,
            lineHeight: 1.2,
            letterSpacing: "-0.005em",
            fontWeight: 500,
          }}
        >
          {item.title}
        </h3>
        {packageLabel && (
          <p
            className="mt-1.5 text-[#1C1917]/60"
            style={{ fontFamily: BODY, fontSize: 13.5, letterSpacing: "0.01em" }}
          >
            {packageLabel}
          </p>
        )}
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="mt-4 text-[12px] text-[#A8998A] transition-colors hover:text-[#B8755D]"
          style={{ fontFamily: BODY, letterSpacing: "0.04em" }}
        >
          Remove
        </button>
      </div>
    </motion.li>
  );
}

// Vendor packages arrive as "{vendor name} · {category}" and the package
// name lives in `title`. Stationery has "style" in the subtitle. This
// separates the two so the row can surface category and package cleanly.
function splitSubtitle(item: CartItem): {
  category: string | null;
  packageLabel: string | null;
} {
  if (item.kind === "stationery") {
    return {
      category: "Invitation Suite",
      packageLabel: item.subtitle ?? null,
    };
  }
  if (item.kind === "vendor-package") {
    const parts = (item.subtitle ?? "").split("·").map((p) => p.trim());
    const category = parts[1] ?? parts[0] ?? null;
    const vendorName = parts[0] ?? null;
    return {
      category,
      packageLabel: vendorName
        ? `${vendorName} — ${item.title}`
        : item.title,
    };
  }
  return {
    category: item.subtitle ?? null,
    packageLabel: null,
  };
}

function EmptyState() {
  return (
    <section className="mx-auto max-w-[1100px] px-6 pb-28 md:px-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-start gap-8"
      >
        <p
          className="max-w-[560px] text-[#1C1917]/75"
          style={{ fontFamily: BODY, fontSize: 17, lineHeight: 1.75 }}
        >
          Pin vendors you love and invitation suites that feel right — they
          all land here. No checkout, no pressure. Just a quiet place to see
          your wedding take shape.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-3 bg-[#1C1917] px-7 py-4 text-[13px] tracking-[0.08em] text-[#F7F5F0] transition-colors hover:bg-[#B8755D]"
            style={{ fontFamily: BODY, fontWeight: 500 }}
          >
            Browse the Marketplace →
          </Link>
          <Link
            href="/stationery"
            className="text-[13px] tracking-[0.04em] text-[#1C1917] transition-colors hover:text-[#B8755D]"
            style={{ fontFamily: BODY, fontWeight: 500 }}
          >
            Preview Stationery →
          </Link>
        </div>
        <p
          className="max-w-[520px] border-t border-[#1C1917]/10 pt-6 text-[#A8998A]"
          style={{ fontFamily: BODY, fontSize: 12.5, lineHeight: 1.7 }}
        >
          Your selections are saved in this browser. Create a free account to
          access them anywhere.
        </p>
      </motion.div>
    </section>
  );
}

function AuthPrompt({
  mode,
  onClose,
}: {
  mode: "save" | "inquiries";
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const title =
    mode === "save"
      ? "Save your selections."
      : "Send these to the studios.";
  const subtitle =
    mode === "save"
      ? "Create a free account and we'll keep your selections synced across every device — pick up exactly where you left off."
      : "A free account lets the studios know how to reach you — and keeps everyone's replies in one place. No commitment beyond the conversation.";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-[#1C1917]/50 p-4 md:items-center md:p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 48, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 32, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[520px] bg-[#F7F5F0] p-8 md:p-12"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 text-[18px] text-[#A8998A] transition-colors hover:text-[#1C1917]"
        >
          ×
        </button>
        {!submitted ? (
          <>
            <span
              className="text-[11px] uppercase text-[#A8998A]"
              style={{ fontFamily: BODY, letterSpacing: "0.3em" }}
            >
              Create a free account
            </span>
            <h2
              className="mt-5 text-[#1C1917]"
              style={{
                fontFamily: DISPLAY,
                fontSize: 32,
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
                fontWeight: 400,
              }}
            >
              {title}
            </h2>
            <p
              className="mt-4 max-w-[440px] text-[#1C1917]/75"
              style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.7 }}
            >
              {subtitle}
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
              className="mt-8 flex flex-col gap-5"
            >
              <label className="flex flex-col gap-2">
                <span
                  className="text-[11px] uppercase text-[#A8998A]"
                  style={{ fontFamily: BODY, letterSpacing: "0.28em" }}
                >
                  Email
                </span>
                <input
                  type="email"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-b border-[#1C1917]/25 bg-transparent py-2 text-[15px] text-[#1C1917] outline-none transition-colors focus:border-[#B8755D]"
                  style={{ fontFamily: BODY }}
                  placeholder="you@home.com"
                />
              </label>
              <button
                type="submit"
                className="mt-2 inline-flex items-center justify-center gap-3 bg-[#1C1917] px-7 py-4 text-[13px] tracking-[0.08em] text-[#F7F5F0] transition-colors hover:bg-[#B8755D]"
                style={{ fontFamily: BODY, fontWeight: 500 }}
              >
                {mode === "save" ? "Save my selections →" : "Send inquiries →"}
              </button>
              <p
                className="text-[#A8998A]"
                style={{ fontFamily: BODY, fontSize: 11.5, lineHeight: 1.7 }}
              >
                We&apos;ll email you a magic link. No password.
              </p>
            </form>
          </>
        ) : (
          <div className="py-6">
            <span className="h-[3px] w-8 bg-[#B8755D]" />
            <h2
              className="mt-6 text-[#1C1917]"
              style={{
                fontFamily: DISPLAY,
                fontSize: 30,
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
                fontWeight: 400,
              }}
            >
              Check your inbox.
            </h2>
            <p
              className="mt-4 max-w-[420px] text-[#1C1917]/75"
              style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.7 }}
            >
              A magic link is on its way to <strong>{email}</strong>. Open it
              on the same browser to finish.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-8 text-[13px] tracking-[0.04em] text-[#1C1917] transition-colors hover:text-[#B8755D]"
              style={{ fontFamily: BODY, fontWeight: 500 }}
            >
              ← Back to My Selections
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
