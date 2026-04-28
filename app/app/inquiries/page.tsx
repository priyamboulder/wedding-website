"use client";

import { useMemo, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useInquiryStore } from "@/stores/inquiry-store";
import { CATEGORY_LABELS } from "@/lib/vendor-categories";
import type {
  Inquiry,
  InquiryMessage,
  InquiryStatus,
} from "@/types/inquiry";

const DEMO_COUPLE_ID = "couple-priya-arjun";
const DEMO_COUPLE_NAME = "Priya Menon";

function useCoupleIdentity() {
  const user = useAuthStore((s) => s.user);
  return {
    id: user?.id ?? DEMO_COUPLE_ID,
    name: user?.name ?? DEMO_COUPLE_NAME,
  };
}

type GroupKey = "active" | "booked" | "closed";

const GROUP_ORDER: GroupKey[] = ["active", "booked", "closed"];

const GROUP_META: Record<
  GroupKey,
  { label: string; description: string }
> = {
  active: {
    label: "Active conversations",
    description: "Inquiries you've sent that are still in motion.",
  },
  booked: {
    label: "Booked",
    description: "Vendors you've locked in for the wedding.",
  },
  closed: {
    label: "Closed",
    description: "Threads that have been declined or have expired.",
  },
};

function bucketFor(status: InquiryStatus): GroupKey {
  if (status === "booked") return "booked";
  if (status === "declined" || status === "expired") return "closed";
  return "active";
}

const STATUS_META: Record<
  InquiryStatus,
  { label: string; chipBg: string; chipText: string; chipRing: string }
> = {
  submitted: {
    label: "Awaiting reply",
    chipBg: "#FBE9E2",
    chipText: "#8C4A3A",
    chipRing: "rgba(140, 74, 58, 0.25)",
  },
  viewed: {
    label: "Vendor viewed",
    chipBg: "#E4EEEC",
    chipText: "#3C6B63",
    chipRing: "rgba(60, 107, 99, 0.25)",
  },
  responded: {
    label: "Vendor replied",
    chipBg: "#F7E7CE",
    chipText: "#7a5a16",
    chipRing: "rgba(212, 175, 55, 0.4)",
  },
  booked: {
    label: "Booked",
    chipBg: "#E2EEDF",
    chipText: "#3F6A3A",
    chipRing: "rgba(63, 106, 58, 0.3)",
  },
  declined: {
    label: "Declined",
    chipBg: "#EDEAE5",
    chipText: "#6B6458",
    chipRing: "rgba(107, 100, 88, 0.25)",
  },
  expired: {
    label: "Expired",
    chipBg: "#EDEAE5",
    chipText: "#6B6458",
    chipRing: "rgba(107, 100, 88, 0.25)",
  },
};

const SOURCE_LABEL: Record<Inquiry["source"], string> = {
  marketplace: "via Marketplace",
  profile_panel: "via Vendor profile",
  recommendation: "via Recommendation",
  planner_referral: "via Planner referral",
};

function formatLongDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatBudget(min: number | null, max: number | null): string {
  if (min == null && max == null) return "Flexible";
  const fmt = (n: number) =>
    n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n.toLocaleString()}`;
  if (min != null && max != null) return `${fmt(min)}–${fmt(max)}`;
  if (min != null) return `from ${fmt(min)}`;
  return `up to ${fmt(max!)}`;
}

function categoryLabel(cat: Inquiry["vendor_category"]): string {
  return (CATEGORY_LABELS as Record<string, string>)[cat] ?? cat;
}

function firstCoupleMessage(inq: Inquiry): InquiryMessage | undefined {
  return inq.messages.find((m) => m.sender === "couple");
}

function latestVendorMessage(inq: Inquiry): InquiryMessage | undefined {
  for (let i = inq.messages.length - 1; i >= 0; i--) {
    if (inq.messages[i].sender === "vendor") return inq.messages[i];
  }
  return undefined;
}

export default function CoupleInquiriesPage() {
  const couple = useCoupleIdentity();
  const allInquiries = useInquiryStore((s) => s.inquiries);

  const inquiries = useMemo(
    () =>
      allInquiries
        .filter((i) => i.couple_id === couple.id)
        .sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
        ),
    [allInquiries, couple.id],
  );

  const grouped = useMemo(() => {
    const result: Record<GroupKey, Inquiry[]> = {
      active: [],
      booked: [],
      closed: [],
    };
    for (const inq of inquiries) {
      result[bucketFor(inq.status)].push(inq);
    }
    return result;
  }, [inquiries]);

  const counts = {
    total: inquiries.length,
    active: grouped.active.length,
    booked: grouped.booked.length,
    closed: grouped.closed.length,
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "#FFFFF0",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        color: "#2a2a2a",
      }}
    >
      <div className="mx-auto max-w-5xl px-8 py-14 sm:px-10">
        <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-stone-500">
          <span>Couple Portal</span>
          <span aria-hidden>/</span>
          <span className="text-[#7a5a16]">Inquiries</span>
        </nav>

        <header className="mt-6">
          <p
            className="font-mono text-[10.5px] uppercase tracking-[0.28em]"
            style={{ color: "#7a5a16" }}
          >
            Your vendor conversations
          </p>
          <h1
            className="mt-3 text-[44px] leading-[1.05] text-[#1a1a1a] sm:text-[48px]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            Inquiries
          </h1>
          <p
            className="mt-3 max-w-2xl text-[15.5px] italic leading-relaxed text-stone-600"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            Every vendor you've reached out to, from first hello to signed
            contract. Click a card to read the full thread.
          </p>

          <dl className="mt-6 flex flex-wrap gap-2 text-[11.5px]">
            <SummaryPill label="Total" value={counts.total} />
            <SummaryPill label="Active" value={counts.active} />
            <SummaryPill label="Booked" value={counts.booked} />
            <SummaryPill label="Closed" value={counts.closed} />
          </dl>
        </header>

        <div className="mt-10 space-y-12">
          {inquiries.length === 0 ? (
            <EmptyState />
          ) : (
            GROUP_ORDER.map((key) => {
              const items = grouped[key];
              if (items.length === 0) return null;
              const meta = GROUP_META[key];
              return (
                <section key={key}>
                  <div className="flex items-baseline justify-between gap-3 border-b border-[#D4AF37]/25 pb-3">
                    <div>
                      <h2
                        className="text-[26px] text-[#1a1a1a]"
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontWeight: 500,
                        }}
                      >
                        {meta.label}
                      </h2>
                      <p
                        className="mt-1 text-[13.5px] italic text-stone-500"
                        style={{ fontFamily: "'EB Garamond', serif" }}
                      >
                        {meta.description}
                      </p>
                    </div>
                    <span
                      className="shrink-0 rounded-full px-3 py-1 font-mono text-[10.5px] uppercase tracking-wider"
                      style={{
                        backgroundColor: "#F7E7CE",
                        color: "#7a5a16",
                      }}
                    >
                      {items.length} {items.length === 1 ? "inquiry" : "inquiries"}
                    </span>
                  </div>

                  <ul className="mt-6 flex flex-col gap-4">
                    {items.map((inq) => (
                      <li key={inq.id}>
                        <InquiryCard inquiry={inq} />
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryPill({ label, value }: { label: string; value: number }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border bg-white px-3 py-1 text-stone-600"
      style={{ borderColor: "rgba(212, 175, 55, 0.35)" }}
    >
      <span className="font-mono text-[10px] uppercase tracking-wider text-stone-400">
        {label}
      </span>
      <span className="font-medium text-[#1a1a1a]">{value}</span>
    </span>
  );
}

function InquiryCard({ inquiry }: { inquiry: Inquiry }) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_META[inquiry.status];
  const firstMsg = firstCoupleMessage(inquiry);
  const vendorReply = latestVendorMessage(inquiry);

  return (
    <article
      className="overflow-hidden rounded-2xl border bg-white shadow-[0_1px_0_rgba(212,175,55,0.08),0_20px_60px_-40px_rgba(26,26,26,0.18)] transition-shadow hover:shadow-[0_1px_0_rgba(212,175,55,0.12),0_24px_70px_-40px_rgba(26,26,26,0.25)]"
      style={{ borderColor: "rgba(212, 175, 55, 0.3)" }}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="block w-full px-6 py-5 text-left sm:px-7"
        aria-expanded={expanded}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-stone-400">
              {categoryLabel(inquiry.vendor_category)} · {SOURCE_LABEL[inquiry.source]}
            </p>
            <h3
              className="mt-1.5 truncate text-[24px] text-[#1a1a1a]"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 500,
              }}
            >
              {inquiry.vendor_name}
            </h3>
          </div>
          <StatusChip status={inquiry.status} />
        </div>

        <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[12.5px] text-stone-600">
          <MetaPair label="Wedding" value={formatLongDate(inquiry.wedding_date)} />
          <MetaPair label="Sent" value={formatShortDate(inquiry.created_at)} />
          {inquiry.venue_name && (
            <MetaPair label="Venue" value={inquiry.venue_name} />
          )}
        </dl>

        {firstMsg && (
          <p
            className="mt-4 line-clamp-2 text-[14.5px] leading-relaxed text-stone-700"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            "{firstMsg.body}"
          </p>
        )}

        {inquiry.status === "viewed" && inquiry.viewed_at && (
          <p className="mt-3 text-[12.5px] italic text-stone-500">
            Vendor viewed on {formatShortDate(inquiry.viewed_at)} — awaiting a
            reply.
          </p>
        )}

        {inquiry.status === "responded" && vendorReply && (
          <div
            className="mt-4 rounded-xl border px-4 py-3"
            style={{
              backgroundColor: "#FBF4E6",
              borderColor: "rgba(196, 162, 101, 0.35)",
            }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7a5a16]">
              {vendorReply.sender_name} replied ·{" "}
              {formatShortDate(vendorReply.created_at)}
            </p>
            <p
              className="mt-1.5 line-clamp-2 text-[14px] leading-relaxed text-stone-700"
              style={{ fontFamily: "'EB Garamond', serif" }}
            >
              {vendorReply.body}
            </p>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-[11.5px] text-stone-400">
          <span>
            {inquiry.messages.length}{" "}
            {inquiry.messages.length === 1 ? "message" : "messages"} in thread
          </span>
          <span className="inline-flex items-center gap-1 font-mono uppercase tracking-wider text-[#7a5a16]">
            {expanded ? "Hide details" : "View full detail"}
            <span aria-hidden className="text-[13px]">
              {expanded ? "▴" : "▾"}
            </span>
          </span>
        </div>
      </button>

      {expanded && <InquiryDetail inquiry={inquiry} />}
    </article>
  );
}

function StatusChip({ status }: { status: InquiryStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className="shrink-0 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wider ring-1"
      style={{
        backgroundColor: meta.chipBg,
        color: meta.chipText,
        borderColor: meta.chipRing,
      }}
    >
      {meta.label}
    </span>
  );
}

function MetaPair({ label, value }: { label: string; value: string }) {
  return (
    <div className="inline-flex items-baseline gap-1.5">
      <dt className="font-mono text-[10px] uppercase tracking-wider text-stone-400">
        {label}
      </dt>
      <dd className="text-[12.5px] text-stone-700">{value}</dd>
    </div>
  );
}

function InquiryDetail({ inquiry }: { inquiry: Inquiry }) {
  return (
    <div
      className="border-t bg-[#FAF7EF]/60 px-6 pb-6 pt-5 sm:px-7"
      style={{ borderColor: "rgba(212, 175, 55, 0.25)" }}
    >
      <section>
        <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#7a5a16]">
          Inquiry details
        </p>
        <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DetailRow label="Guest count" value={`${inquiry.guest_count}`} />
          <DetailRow
            label="Budget range"
            value={formatBudget(inquiry.budget_min, inquiry.budget_max)}
          />
          <DetailRow label="Venue" value={inquiry.venue_name ?? "Not specified"} />
          <DetailRow
            label="Packages of interest"
            value={
              inquiry.package_ids.length > 0
                ? `${inquiry.package_ids.length} requested`
                : "None specified"
            }
          />
        </dl>

        {inquiry.events.length > 0 && (
          <div className="mt-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-stone-400">
              Events
            </p>
            <ul className="mt-1.5 flex flex-wrap gap-1.5">
              {inquiry.events.map((e) => (
                <li
                  key={e}
                  className="rounded-full border px-2.5 py-0.5 text-[11.5px] text-stone-700"
                  style={{
                    backgroundColor: "#F7E7CE",
                    borderColor: "rgba(212, 175, 55, 0.4)",
                  }}
                >
                  {e}
                </li>
              ))}
            </ul>
          </div>
        )}

        {inquiry.package_ids.length > 0 && (
          <div className="mt-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-stone-400">
              Package IDs
            </p>
            <ul className="mt-1.5 flex flex-wrap gap-1.5">
              {inquiry.package_ids.map((pkg) => (
                <li
                  key={pkg}
                  className="rounded-md border border-stone-200 bg-white px-2 py-0.5 font-mono text-[11px] text-stone-600"
                >
                  {pkg}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="mt-6">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#7a5a16]">
          Full message thread
        </p>
        <ul className="mt-3 flex flex-col gap-3">
          {inquiry.messages.map((msg) => (
            <MessageRow key={msg.id} msg={msg} />
          ))}
        </ul>
      </section>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-lg border bg-white px-3.5 py-2.5"
      style={{ borderColor: "rgba(212, 175, 55, 0.25)" }}
    >
      <dt className="font-mono text-[10px] uppercase tracking-wider text-stone-400">
        {label}
      </dt>
      <dd className="mt-1 text-[13.5px] text-[#1a1a1a]">{value}</dd>
    </div>
  );
}

function MessageRow({ msg }: { msg: InquiryMessage }) {
  const isCouple = msg.sender === "couple";
  const timestamp = new Date(msg.created_at).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  return (
    <li className={`flex ${isCouple ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex max-w-[86%] flex-col ${
          isCouple ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`flex items-baseline gap-2 px-1 text-[11.5px] text-stone-500 ${
            isCouple ? "flex-row-reverse" : ""
          }`}
        >
          <span className="font-medium text-stone-700">
            {isCouple ? `${msg.sender_name} (you)` : msg.sender_name}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-stone-400">
            {timestamp}
          </span>
        </div>
        <div
          className={`mt-1 rounded-2xl px-4 py-3 text-[14.5px] leading-relaxed ${
            isCouple ? "rounded-br-md" : "rounded-bl-md"
          }`}
          style={{
            fontFamily: "'EB Garamond', serif",
            backgroundColor: isCouple ? "#FBF9F4" : "#F5EBD6",
            color: isCouple ? "#1a1a1a" : "#2a2218",
            border: "1px solid rgba(26,26,26,0.06)",
          }}
        >
          <p className="whitespace-pre-wrap">{msg.body}</p>

          {msg.attachments.length > 0 && (
            <ul className="mt-3 flex flex-col gap-1.5">
              {msg.attachments.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center gap-2 rounded-md border bg-white/70 px-2.5 py-1.5"
                  style={{ borderColor: "rgba(26,26,26,0.12)" }}
                >
                  <span aria-hidden className="text-[13px]">
                    {a.kind === "pdf" ? "📄" : "🖼"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-sans text-[12.5px] text-[#1a1a1a]">
                      {a.name}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-stone-400">
                      {a.kind} · {a.size}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </li>
  );
}

function EmptyState() {
  return (
    <div
      className="rounded-2xl border bg-white px-8 py-12 text-center"
      style={{ borderColor: "rgba(212, 175, 55, 0.3)" }}
    >
      <p
        className="text-[22px] text-[#1a1a1a]"
        style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
      >
        No inquiries yet
      </p>
      <p
        className="mt-2 text-[14.5px] italic text-stone-600"
        style={{ fontFamily: "'EB Garamond', serif" }}
      >
        Reach out to a vendor from the marketplace and your conversation will
        appear here.
      </p>
    </div>
  );
}
