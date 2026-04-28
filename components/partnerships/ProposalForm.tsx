"use client";

import { useMemo, useState } from "react";
import { X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { STORE_PRODUCTS, getStoreVendor } from "@/lib/store-seed";
import {
  DELIVERABLE_LABEL,
  DELIVERABLE_DESCRIPTION,
  calculatePlatformFee,
  calculateNetPayout,
} from "@/types/partnership";
import type { DeliverableType } from "@/types/partnership";
import type { Creator } from "@/types/creator";
import { usePartnershipsStore } from "@/stores/partnerships-store";
import { useNotificationsStore } from "@/stores/notifications-store";

const DELIVERABLE_OPTIONS: DeliverableType[] = [
  "collection_feature",
  "dedicated_guide",
  "exhibition_feature",
  "social_mention",
];

function suggestedBudget(tier: Creator["tier"], type: DeliverableType): number {
  const tierMultiplier =
    tier === "top_creator" ? 1 : tier === "rising" ? 0.6 : 0.35;
  const base: Record<DeliverableType, number> = {
    collection_feature: 50000,
    dedicated_guide: 75000,
    exhibition_feature: 60000,
    social_mention: 20000,
  };
  return Math.round(base[type] * tierMultiplier);
}

export function ProposalForm({
  vendorId,
  creator,
  onClose,
  onSubmitted,
}: {
  vendorId: string;
  creator: Creator;
  onClose: () => void;
  onSubmitted?: () => void;
}) {
  const createProposal = usePartnershipsStore((s) => s.createProposal);
  const addNotification = useNotificationsStore((s) => s.addNotification);
  const vendor = getStoreVendor(vendorId);

  const [deliverableType, setDeliverableType] =
    useState<DeliverableType>("collection_feature");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [productIds, setProductIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [budget, setBudget] = useState(
    suggestedBudget(creator.tier, "collection_feature"),
  );
  const [timelineDays, setTimelineDays] = useState(21);
  const [submitting, setSubmitting] = useState(false);

  const myProducts = useMemo(
    () => STORE_PRODUCTS.filter((p) => p.vendorId === vendorId),
    [vendorId],
  );
  const filtered = useMemo(() => {
    if (!search.trim()) return myProducts;
    const q = search.toLowerCase();
    return myProducts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [myProducts, search]);

  const platformFee = calculatePlatformFee(budget);
  const netPayout = calculateNetPayout(budget);

  const valid =
    title.trim().length >= 4 &&
    description.trim().length >= 20 &&
    productIds.length > 0 &&
    budget > 0 &&
    timelineDays > 0;

  const handleSubmit = () => {
    if (!valid) return;
    setSubmitting(true);
    const proposal = createProposal({
      vendorId,
      creatorId: creator.id,
      title: title.trim(),
      description: description.trim(),
      deliverableType,
      productIds,
      proposedBudget: budget,
      timelineDays,
    });
    addNotification({
      type: "partnership_proposal",
      recipient: "couple",
      title: `New partnership proposal from ${vendor?.name ?? "a vendor"}`,
      body: `${title.trim()} — $${(budget / 100).toFixed(0)} budget, ${timelineDays}-day timeline.`,
      link: `/dashboard/creator/partnerships/${proposal.id}`,
      actor_name: vendor?.name ?? "Vendor",
    });
    setSubmitting(false);
    onSubmitted?.();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-gold/15 px-6 py-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold">
              Propose partnership
            </p>
            <h2 className="font-serif text-[20px] text-ink">
              with {creator.displayName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-ink-muted transition-colors hover:bg-ivory-warm hover:text-ink"
            aria-label="Close"
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Deliverable type */}
          <Section label="Deliverable type">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {DELIVERABLE_OPTIONS.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setDeliverableType(type);
                    setBudget(suggestedBudget(creator.tier, type));
                  }}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-colors",
                    deliverableType === type
                      ? "border-gold/50 bg-gold-pale/30"
                      : "border-border bg-white hover:border-gold/30",
                  )}
                >
                  <p className="text-[13px] font-medium text-ink">
                    {DELIVERABLE_LABEL[type]}
                  </p>
                  <p className="mt-0.5 text-[11.5px] leading-snug text-ink-muted">
                    {DELIVERABLE_DESCRIPTION[type]}
                  </p>
                </button>
              ))}
            </div>
          </Section>

          {/* Title + description */}
          <Section label="Title">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Feature our new lehenga line in your next collection"
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink placeholder:text-ink-faint focus:border-gold/40 focus:outline-none focus:ring-2 focus:ring-gold/20"
            />
          </Section>

          <Section label="Brief">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="What you'd like the creator to do, what's the angle, what they should know about the products…"
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] leading-snug text-ink placeholder:text-ink-faint focus:border-gold/40 focus:outline-none focus:ring-2 focus:ring-gold/20"
            />
          </Section>

          {/* Products */}
          <Section
            label={`Products (${productIds.length} selected)`}
            hint={`from ${vendor?.name ?? "your inventory"}`}
          >
            <div className="relative mb-2">
              <Search
                size={12}
                strokeWidth={1.6}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your products"
                className="w-full rounded-md border border-border bg-white py-1.5 pl-7 pr-3 text-[12px] text-ink placeholder:text-ink-faint focus:border-gold/40 focus:outline-none"
              />
            </div>
            <div className="max-h-44 overflow-y-auto rounded-md border border-border bg-white">
              {filtered.length === 0 ? (
                <p className="p-3 text-center text-[12px] italic text-ink-muted">
                  No products match.
                </p>
              ) : (
                <ul>
                  {filtered.map((p) => {
                    const checked = productIds.includes(p.id);
                    return (
                      <li
                        key={p.id}
                        className="border-b border-border last:border-b-0"
                      >
                        <label className="flex cursor-pointer items-center gap-2 px-3 py-2 text-[12.5px] hover:bg-ivory-warm/40">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setProductIds((prev) =>
                                checked
                                  ? prev.filter((x) => x !== p.id)
                                  : [...prev, p.id],
                              )
                            }
                            className="accent-gold"
                          />
                          <span className="truncate text-ink">{p.title}</span>
                          <span className="ml-auto font-mono text-[10.5px] text-ink-faint">
                            ${p.basePrice.toLocaleString()}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </Section>

          {/* Budget + timeline */}
          <Section label="Budget & timeline">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                  Budget (USD cents)
                </label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value) || 0)}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink focus:border-gold/40 focus:outline-none"
                />
                <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                  Suggested: ${(suggestedBudget(creator.tier, deliverableType) / 100).toFixed(0)}
                </p>
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                  Timeline (days)
                </label>
                <input
                  type="number"
                  value={timelineDays}
                  onChange={(e) =>
                    setTimelineDays(Number(e.target.value) || 0)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink focus:border-gold/40 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-3 rounded-md border border-gold/25 bg-gold-pale/20 p-3 text-[12px]">
              <div className="flex justify-between">
                <span className="text-ink-muted">Creator gross</span>
                <span className="text-ink">${(budget / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Platform fee (15%)</span>
                <span className="text-ink-muted">
                  −${(platformFee / 100).toFixed(2)}
                </span>
              </div>
              <div className="mt-1 flex justify-between border-t border-gold/20 pt-1.5 font-medium">
                <span className="text-ink">Net to creator</span>
                <span className="text-ink">${(netPayout / 100).toFixed(2)}</span>
              </div>
            </div>
          </Section>
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-gold/15 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink-muted transition-colors hover:border-gold/30 hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!valid || submitting}
            onClick={handleSubmit}
            className={cn(
              "rounded-md px-4 py-1.5 text-[12px] font-medium transition-colors",
              valid && !submitting
                ? "bg-ink text-ivory hover:bg-ink/90"
                : "cursor-not-allowed bg-ink/30 text-ivory",
            )}
          >
            {submitting ? "Sending…" : "Send proposal"}
          </button>
        </footer>
      </div>
    </div>
  );
}

function Section({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-faint">
          {label}
        </span>
        {hint && (
          <span className="font-mono text-[10px] italic text-ink-faint">
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
