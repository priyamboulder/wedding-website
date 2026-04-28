import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ORDER_DETAILS,
  STATUS_META,
  type OrderDetail,
  type ProofRound,
  type TimelineEntry,
} from "@/lib/seller/orders-seed";

export default async function SellerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = ORDER_DETAILS[id];
  if (!order) return notFound();

  const meta = STATUS_META[order.status];

  return (
    <div className="pb-16">
      {/* Breadcrumb + header */}
      <section
        className="border-b px-8 py-7"
        style={{ borderColor: "rgba(44,44,44,0.08)" }}
      >
        <Link
          href="/seller/orders"
          className="inline-flex items-center gap-1.5 text-[12px] text-stone-500 transition-colors hover:text-[#7a5a16]"
        >
          <span aria-hidden>←</span> Orders
        </Link>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1
              className="text-[34px] leading-tight text-[#2C2C2C]"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 500,
                letterSpacing: "-0.015em",
              }}
            >
              Order #{order.number}
            </h1>
            <p className="mt-1.5 text-[13.5px] text-stone-600">
              <span
                className="text-[#2C2C2C]"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16 }}
              >
                {order.coupleName}
              </span>
              <span className="mx-2 text-stone-300">·</span>
              <span>{order.productName}</span>
              <span className="mx-2 text-stone-300">·</span>
              <span className="font-mono text-[11.5px]">
                ${order.total.toLocaleString("en-US")}
              </span>
            </p>
          </div>

          <span
            className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider"
            style={{
              color: meta.tone,
              backgroundColor: meta.bg,
              borderColor: meta.border,
            }}
          >
            <span aria-hidden>{meta.glyph}</span>
            Status: {meta.label}
          </span>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 px-8 py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Main column */}
        <div className="min-w-0 space-y-8">
          <OrderInfo order={order} />
          <ProductBlock order={order} />
          <CustomizationBlock order={order} />
          <ProofWorkflow proofs={order.proofs} />
          <ProductionShipping order={order} />
          <MessagesBlock order={order} />
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <TimelineCard timeline={order.timeline} />
          <ActionsCard status={order.status} />
        </aside>
      </div>
    </div>
  );
}

// ─── Section primitive ──────────────────────────────────────

function Section({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2
          className="font-mono text-[10.5px] uppercase tracking-[0.26em] text-[#7a5a16]"
        >
          {title}
        </h2>
        {action}
      </div>
      <div
        className="rounded-xl border p-6"
        style={{
          borderColor: "rgba(196,162,101,0.25)",
          backgroundColor: "#FFFFFA",
        }}
      >
        {children}
      </div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-baseline gap-4 py-1.5">
      <dt className="text-[12px] text-stone-500">{label}</dt>
      <dd className="text-[13.5px] text-[#2C2C2C]">{value}</dd>
    </div>
  );
}

// ─── Order info ─────────────────────────────────────────────

function OrderInfo({ order }: { order: OrderDetail }) {
  return (
    <Section title="Order info">
      <dl>
        <InfoRow
          label="Buyer"
          value={
            <span
              className="text-[15px]"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
            >
              {order.coupleName}
            </span>
          }
        />
        <InfoRow
          label="Email"
          value={<span className="font-mono text-[12.5px]">{order.buyerEmail}</span>}
        />
        {order.buyerPhone && (
          <InfoRow
            label="Phone"
            value={
              <span className="font-mono text-[12.5px]">{order.buyerPhone}</span>
            }
          />
        )}
        <InfoRow label="Wedding date" value={order.weddingDate} />
        <InfoRow label="Ordered" value={order.orderedFullDate} />
        <InfoRow
          label="Payment"
          value={
            <span className="inline-flex items-center gap-2">
              <span className="font-mono text-[12.5px]">
                ${order.total.toLocaleString("en-US")}
              </span>
              {order.paid && (
                <span
                  className="inline-flex items-center gap-1 rounded px-1.5 font-mono text-[9.5px] font-bold uppercase tracking-wider"
                  style={{
                    color: "#2C6E6A",
                    backgroundColor: "rgba(217,232,228,0.6)",
                  }}
                >
                  ✓ Paid
                </span>
              )}
              <span className="text-[11.5px] text-stone-500">
                · {order.paymentMethod}
              </span>
            </span>
          }
        />
      </dl>
    </Section>
  );
}

// ─── Product ────────────────────────────────────────────────

function ProductBlock({ order }: { order: OrderDetail }) {
  return (
    <Section title="Product">
      <div className="flex gap-5">
        <ProductThumb />
        <div className="min-w-0 flex-1">
          <h3
            className="text-[20px] leading-tight text-[#2C2C2C]"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
          >
            {order.productName}
          </h3>
          {order.productSubtitle && (
            <p
              className="mt-1 text-[13px] italic text-stone-600"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {order.productSubtitle}
            </p>
          )}
          <dl className="mt-4">
            <InfoRow
              label="Quantity"
              value={
                <span className="font-mono text-[12.5px]">
                  {order.quantity} cards
                </span>
              }
            />
            <InfoRow
              label="Price"
              value={
                <span className="font-mono text-[12.5px]">
                  ${order.pricePerUnit.toFixed(2)}/card
                  <span className="mx-1.5 text-stone-300">=</span>$
                  {order.total.toLocaleString("en-US")}
                </span>
              }
            />
          </dl>
        </div>
      </div>
    </Section>
  );
}

function ProductThumb() {
  return (
    <div
      className="flex h-28 w-28 shrink-0 items-center justify-center rounded-lg border"
      style={{
        backgroundColor: "#FBF3E4",
        borderColor: "rgba(196,162,101,0.35)",
      }}
    >
      <div className="text-center">
        <div
          className="text-[32px]"
          style={{ color: "#C4A265" }}
          aria-hidden
        >
          ॐ
        </div>
        <div
          className="mt-1 font-mono text-[8.5px] uppercase tracking-wider text-stone-500"
        >
          Gold foil
        </div>
      </div>
    </div>
  );
}

// ─── Customization ──────────────────────────────────────────

function CustomizationBlock({ order }: { order: OrderDetail }) {
  const c = order.customization;
  return (
    <Section title="Customization details">
      <dl>
        <InfoRow
          label="Couple names"
          value={
            <span
              className="text-[15px]"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
            >
              {c.coupleNames}
            </span>
          }
        />
        {c.bilingualScript && (
          <InfoRow
            label="Script / bilingual"
            value={
              <span
                className="text-[15px]"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
              >
                {c.bilingualScript}
              </span>
            }
          />
        )}
        <InfoRow label="Wedding date" value={c.weddingDate} />
        <InfoRow label="Venue" value={c.venue} />
        <InfoRow
          label="Color preference"
          value={
            <span className="inline-flex items-center gap-2">
              <SwatchGroup label={c.colorPreference} />
              <span>{c.colorPreference}</span>
            </span>
          }
        />
        <InfoRow label="RSVP" value={<span className="italic">"{c.rsvp}"</span>} />
      </dl>

      <div className="mt-4 border-t pt-4" style={{ borderColor: "rgba(44,44,44,0.06)" }}>
        <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-stone-500">
          Invitation wording
        </p>
        <div
          className="mt-3 rounded-md px-5 py-4 text-center"
          style={{ backgroundColor: "#FBF3E4" }}
        >
          {c.wording.map((line, i) => (
            <p
              key={i}
              className="text-[14px] leading-relaxed text-[#2C2C2C]"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: i === 3 || i === 5 ? 600 : 400,
                fontSize: i === 3 || i === 5 ? 18 : 14,
              }}
            >
              {line}
            </p>
          ))}
        </div>
      </div>

      {c.buyerNotes && (
        <div
          className="mt-4 border-t pt-4"
          style={{ borderColor: "rgba(44,44,44,0.06)" }}
        >
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-stone-500">
            Buyer notes
          </p>
          <div
            className="mt-2 rounded-md border-l-2 px-4 py-3 text-[13.5px] italic text-stone-700"
            style={{
              borderColor: "#C4A265",
              backgroundColor: "rgba(251,243,228,0.5)",
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 15,
            }}
          >
            "{c.buyerNotes}"
          </div>
        </div>
      )}
    </Section>
  );
}

function SwatchGroup({ label }: { label: string }) {
  // Parse simple color words from the label. Falls back to gold/ivory.
  const lower = label.toLowerCase();
  const swatches: string[] = [];
  if (lower.includes("gold")) swatches.push("#C4A265");
  if (lower.includes("ivory")) swatches.push("#F5EFE0");
  if (lower.includes("rose gold")) swatches.push("#C08878");
  if (lower.includes("emerald")) swatches.push("#2C6E6A");
  if (lower.includes("maroon")) swatches.push("#7A3A3A");
  if (swatches.length === 0) swatches.push("#C4A265", "#F5EFE0");

  return (
    <span className="inline-flex items-center">
      {swatches.map((c, i) => (
        <span
          key={i}
          className="inline-block h-4 w-4 -ml-1 first:ml-0 rounded-full border border-white shadow-sm"
          style={{ backgroundColor: c }}
          aria-hidden
        />
      ))}
    </span>
  );
}

// ─── Proof workflow ─────────────────────────────────────────

function ProofWorkflow({ proofs }: { proofs: ProofRound[] }) {
  const latest = proofs[proofs.length - 1];
  const history = proofs.slice(0, -1);

  return (
    <Section
      title="Proof workflow"
      action={
        <span className="font-mono text-[10.5px] text-stone-500">
          {proofs.length} round{proofs.length === 1 ? "" : "s"}
        </span>
      }
    >
      <ProofCard proof={latest} isLatest />

      <div className="mt-5">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-stone-500">
          Proof history
        </p>
        {history.length === 0 ? (
          <p className="mt-2 text-[13px] italic text-stone-500">
            (No previous rounds — this is the first proof)
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {history.map((p) => (
              <ProofCard key={p.round} proof={p} />
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}

function ProofCard({ proof, isLatest = false }: { proof: ProofRound; isLatest?: boolean }) {
  const statusMap: Record<
    ProofRound["status"],
    { label: string; tone: string; bg: string; border: string; glyph: string }
  > = {
    awaiting: {
      label: "Awaiting buyer approval",
      glyph: "⏳",
      tone: "#6B5BA8",
      bg: "rgba(232,222,245,0.55)",
      border: "rgba(107,91,168,0.28)",
    },
    approved: {
      label: "Approved",
      glyph: "✓",
      tone: "#2C6E6A",
      bg: "rgba(217,232,228,0.55)",
      border: "rgba(44,110,106,0.28)",
    },
    "revision-requested": {
      label: "Revision requested",
      glyph: "↻",
      tone: "#A8612F",
      bg: "rgba(245,223,200,0.55)",
      border: "rgba(168,97,47,0.30)",
    },
  };
  const s = statusMap[proof.status];

  return (
    <div
      className="rounded-lg border p-4"
      style={{
        backgroundColor: isLatest ? "#FBF3E4" : "#FFFFFA",
        borderColor: isLatest ? "rgba(196,162,101,0.35)" : "rgba(44,44,44,0.08)",
      }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3
          className="text-[17px] text-[#2C2C2C]"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
        >
          Proof Round {proof.round}
        </h3>
        <p className="font-mono text-[11px] text-stone-500">
          Sent {proof.sentDate}
          {proof.approvedDate && ` · Approved ${proof.approvedDate}`}
          {proof.revisionDate && ` · Revision ${proof.revisionDate}`}
        </p>
      </div>

      {/* Pretend proof preview */}
      <div
        className="mt-3 flex h-32 items-center justify-center rounded-md border text-center"
        style={{
          backgroundColor: "#FFFFFA",
          borderColor: "rgba(196,162,101,0.35)",
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(196,162,101,0.04) 0 8px, transparent 8px 16px)",
        }}
      >
        <div>
          <div className="text-[22px]" style={{ color: "#C4A265" }} aria-hidden>
            ▨
          </div>
          <p
            className="mt-1 px-4 text-[12px] italic text-stone-600"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {proof.previewLabel}
          </p>
          <p className="mt-1 font-mono text-[9.5px] uppercase tracking-wider text-stone-400">
            Proof preview · PDF + PNG
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <span
          className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[10.5px] font-semibold uppercase tracking-wider"
          style={{
            color: s.tone,
            backgroundColor: s.bg,
            borderColor: s.border,
          }}
        >
          <span aria-hidden>{s.glyph}</span>
          {s.label}
          {proof.status === "awaiting" && proof.waitingDays != null && (
            <span className="opacity-70"> · {proof.waitingDays} days</span>
          )}
        </span>

        {isLatest && proof.status === "awaiting" && (
          <div className="flex gap-2">
            <SecondaryBtn>Resend Proof</SecondaryBtn>
            <PrimaryBtn>Upload Revised Proof</PrimaryBtn>
          </div>
        )}
      </div>

      {proof.buyerFeedback && (
        <div
          className="mt-3 rounded-md border-l-2 px-4 py-2.5 text-[13px] italic text-stone-700"
          style={{
            borderColor: proof.status === "approved" ? "#2C6E6A" : "#A8612F",
            backgroundColor: "rgba(251,243,228,0.35)",
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 14.5,
          }}
        >
          <span className="font-mono text-[9.5px] uppercase tracking-wider not-italic text-stone-500">
            Buyer feedback
          </span>
          <p className="mt-1">"{proof.buyerFeedback}"</p>
        </div>
      )}
    </div>
  );
}

// ─── Production + shipping ──────────────────────────────────

function ProductionShipping({ order }: { order: OrderDetail }) {
  const p = order.production;
  return (
    <Section title="Production & shipping">
      <dl>
        <InfoRow label="Production status" value={p.status} />
        <InfoRow label="Estimated time" value={p.estimatedDays} />
        {p.shipByDate && <InfoRow label="Ship by date" value={p.shipByDate} />}
        <InfoRow
          label="Shipping method"
          value={
            <span className="inline-flex items-center gap-2">
              <span>{p.shippingMethod}</span>
              {p.carrier && (
                <span className="font-mono text-[11px] text-stone-500">
                  · {p.carrier}
                </span>
              )}
            </span>
          }
        />
        <InfoRow
          label="Tracking"
          value={
            p.tracking ? (
              <span className="font-mono text-[12px]">{p.tracking}</span>
            ) : (
              <span className="italic text-stone-500">Not yet available</span>
            )
          }
        />
      </dl>

      <div className="mt-4 border-t pt-4" style={{ borderColor: "rgba(44,44,44,0.06)" }}>
        <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-stone-500">
          Shipping address
        </p>
        <address
          className="mt-2 not-italic text-[13.5px] leading-relaxed text-[#2C2C2C]"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15 }}
        >
          {p.shippingAddress.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </address>
      </div>
    </Section>
  );
}

// ─── Messages ───────────────────────────────────────────────

function MessagesBlock({ order }: { order: OrderDetail }) {
  return (
    <Section title="Messages">
      <div className="space-y-4">
        {order.messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 ${m.from === "seller" ? "flex-row-reverse" : ""}`}
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-semibold"
              style={{
                backgroundColor: m.from === "seller" ? "#C4A265" : "#F5E6D0",
                color: m.from === "seller" ? "#FFFFFA" : "#7a5a16",
              }}
            >
              {m.name.charAt(0)}
            </div>
            <div
              className={`max-w-[72%] rounded-lg px-4 py-3 ${
                m.from === "seller" ? "text-right" : ""
              }`}
              style={{
                backgroundColor:
                  m.from === "seller" ? "#FBF3E4" : "rgba(255,255,250,1)",
                border: "1px solid rgba(196,162,101,0.25)",
              }}
            >
              <p className="font-mono text-[10.5px] uppercase tracking-wider text-stone-500">
                {m.name} · {m.timeAgo}
              </p>
              <p
                className="mt-1 text-[13.5px] leading-relaxed text-[#2C2C2C]"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15 }}
              >
                {m.body}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div
        className="mt-5 flex items-center gap-2 rounded-md border bg-white px-3 py-2"
        style={{ borderColor: "rgba(44,44,44,0.12)" }}
      >
        <input
          type="text"
          placeholder="Send a message to the buyer…"
          className="flex-1 bg-transparent py-1 text-[13px] text-[#2C2C2C] outline-none placeholder:text-stone-400"
        />
        <PrimaryBtn>Send</PrimaryBtn>
      </div>
    </Section>
  );
}

// ─── Timeline (sidebar) ─────────────────────────────────────

function TimelineCard({ timeline }: { timeline: TimelineEntry[] }) {
  return (
    <div
      className="rounded-xl border p-5"
      style={{
        borderColor: "rgba(196,162,101,0.25)",
        backgroundColor: "#FFFFFA",
      }}
    >
      <h2 className="font-mono text-[10.5px] uppercase tracking-[0.26em] text-[#7a5a16]">
        Timeline
      </h2>

      <ol className="relative mt-4 space-y-3 pl-6">
        <div
          className="absolute bottom-1.5 left-[9px] top-1.5 w-px"
          style={{ backgroundColor: "rgba(196,162,101,0.35)" }}
          aria-hidden
        />
        {timeline.map((t, i) => (
          <TimelineStep key={i} entry={t} />
        ))}
      </ol>
    </div>
  );
}

function TimelineStep({ entry }: { entry: TimelineEntry }) {
  const isDone = entry.status === "done";
  const isCurrent = entry.status === "current";

  const dot = isDone ? "#2C6E6A" : isCurrent ? "#C4A265" : "#E8D5D0";
  const ring = isCurrent
    ? "0 0 0 4px rgba(196,162,101,0.18)"
    : "0 0 0 0 transparent";

  return (
    <li className="relative">
      <span
        className="absolute -left-6 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white"
        style={{ backgroundColor: dot, boxShadow: ring }}
        aria-hidden
      >
        {isDone && (
          <span
            className="block h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: "#FFFFFA" }}
          />
        )}
      </span>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p
          className={`text-[13px] ${
            isDone ? "text-[#2C2C2C]" : isCurrent ? "text-[#7a5a16]" : "text-stone-400"
          }`}
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 15,
            fontWeight: isCurrent ? 600 : 500,
          }}
        >
          {entry.label}
          {isDone && <span className="ml-1.5 text-[11px]">✓</span>}
        </p>
        <span
          className={`font-mono text-[10.5px] ${
            isDone ? "text-stone-500" : "text-stone-400"
          }`}
        >
          {entry.date}
        </span>
      </div>
    </li>
  );
}

// ─── Actions (sidebar) ──────────────────────────────────────

function ActionsCard({ status }: { status: OrderDetail["status"] }) {
  // Context-aware action set based on the current status.
  const actions = ACTIONS_BY_STATUS[status] ?? DEFAULT_ACTIONS;

  return (
    <div
      className="rounded-xl border p-5"
      style={{
        borderColor: "rgba(196,162,101,0.25)",
        backgroundColor: "#FFFFFA",
      }}
    >
      <h2 className="font-mono text-[10.5px] uppercase tracking-[0.26em] text-[#7a5a16]">
        Actions
      </h2>
      <div className="mt-3 flex flex-col gap-2">
        {actions.map((a, i) => (
          <ActionBtn
            key={a.label}
            primary={i === 0}
            danger={a.danger}
            glyph={a.glyph}
          >
            {a.label}
          </ActionBtn>
        ))}
      </div>
    </div>
  );
}

type ActionDef = { label: string; glyph: string; danger?: boolean };

const DEFAULT_ACTIONS: ActionDef[] = [
  { label: "Upload Proof", glyph: "⊕" },
  { label: "Mark as In Production", glyph: "🔧" },
  { label: "Print Label", glyph: "🖨" },
  { label: "Add Tracking", glyph: "📮" },
  { label: "Mark as Shipped", glyph: "🚚" },
  { label: "Issue Refund", glyph: "↩", danger: true },
  { label: "Cancel Order", glyph: "✕", danger: true },
];

const ACTIONS_BY_STATUS: Partial<Record<OrderDetail["status"], ActionDef[]>> = {
  "proof-sent": [
    { label: "Upload Revised Proof", glyph: "⊕" },
    { label: "Resend Proof", glyph: "↻" },
    { label: "Mark as In Production", glyph: "🔧" },
    { label: "Message Buyer", glyph: "✉" },
    { label: "Issue Refund", glyph: "↩", danger: true },
    { label: "Cancel Order", glyph: "✕", danger: true },
  ],
  "in-production": [
    { label: "Mark Production Complete", glyph: "✓" },
    { label: "Print Shipping Label", glyph: "🖨" },
    { label: "Add Tracking", glyph: "📮" },
    { label: "Message Buyer", glyph: "✉" },
    { label: "Put On Hold", glyph: "⏸" },
    { label: "Issue Refund", glyph: "↩", danger: true },
  ],
  new: [
    { label: "Upload Proof", glyph: "⊕" },
    { label: "Message Buyer", glyph: "✉" },
    { label: "Put On Hold", glyph: "⏸" },
    { label: "Cancel Order", glyph: "✕", danger: true },
  ],
};

// ─── Buttons ────────────────────────────────────────────────

function PrimaryBtn({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="inline-flex h-8 items-center gap-1.5 rounded-md px-3.5 text-[12.5px] font-medium text-white transition-opacity hover:opacity-90"
      style={{ backgroundColor: "#C4A265" }}
    >
      {children}
    </button>
  );
}

function SecondaryBtn({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="inline-flex h-8 items-center gap-1.5 rounded-md border bg-white px-3 text-[12.5px] text-[#2C2C2C] transition-colors hover:bg-[#FBF3E4]"
      style={{ borderColor: "rgba(44,44,44,0.14)" }}
    >
      {children}
    </button>
  );
}

function ActionBtn({
  children,
  primary,
  danger,
  glyph,
}: {
  children: React.ReactNode;
  primary?: boolean;
  danger?: boolean;
  glyph: string;
}) {
  const style = primary
    ? {
        backgroundColor: "#C4A265",
        color: "#FFFFFA",
        borderColor: "#C4A265",
      }
    : danger
      ? {
          backgroundColor: "#FFFFFA",
          color: "#B23A2A",
          borderColor: "rgba(178,58,42,0.25)",
        }
      : {
          backgroundColor: "#FFFFFA",
          color: "#2C2C2C",
          borderColor: "rgba(44,44,44,0.12)",
        };
  return (
    <button
      type="button"
      className="inline-flex h-9 items-center justify-between gap-2 rounded-md border px-3 text-[12.5px] transition-opacity hover:opacity-90"
      style={style}
    >
      <span className="inline-flex items-center gap-2">
        <span aria-hidden>{glyph}</span>
        {children}
      </span>
      <span aria-hidden className="text-[11px] opacity-60">
        →
      </span>
    </button>
  );
}
