"use client";

import { useMemo, useState } from "react";
import {
  CONVERSATIONS,
  QUICK_REPLIES,
  MESSAGE_STATS,
  type Conversation,
  type Message,
  type QuoteCard,
} from "@/lib/seller/messages-seed";

const ACCENT = "#C4A265";
const INK = "#2C2C2C";
const MUTED_BORDER = "rgba(44,44,44,0.08)";
const CHAMPAGNE = "#FBF3E4";
const IVORY = "#FFFFFA";

export default function SellerMessagesPage() {
  const [selectedId, setSelectedId] = useState<string>("conv-anika-sam");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CONVERSATIONS;
    return CONVERSATIONS.filter((c) =>
      [c.coupleName, c.subject, c.preview, c.orderNumber ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [query]);

  const orderConvos = filtered.filter((c) => c.kind === "order");
  const inquiryConvos = filtered.filter((c) => c.kind === "inquiry");

  const selected = CONVERSATIONS.find((c) => c.id === selectedId) ?? CONVERSATIONS[0];

  const handleTemplate = (body: string) => {
    setDraft((prev) => (prev ? `${prev}\n\n${body}` : body));
    setTemplatesOpen(false);
  };

  return (
    <div className="flex h-[calc(100vh-100px)] flex-col">
      {/* Page header */}
      <header
        className="flex flex-wrap items-end justify-between gap-4 border-b px-8 py-6"
        style={{ borderColor: MUTED_BORDER }}
      >
        <div>
          <h1
            className="text-[32px] leading-tight text-[#2C2C2C]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              letterSpacing: "-0.015em",
            }}
          >
            Messages
          </h1>
          <p className="mt-1 text-[13px] text-stone-500">
            {MESSAGE_STATS.unreadOrder + MESSAGE_STATS.unreadInquiry > 0 ? (
              <>
                <span style={{ color: "#B23A2A" }}>
                  {MESSAGE_STATS.unreadOrder + MESSAGE_STATS.unreadInquiry} unread
                </span>
                <span className="mx-2 text-stone-300">·</span>
              </>
            ) : null}
            {MESSAGE_STATS.totalInquiries} pre-order inquir
            {MESSAGE_STATS.totalInquiries === 1 ? "y" : "ies"}
          </p>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[#7a5a16]">
          Inbox · Divya Creations
        </p>
      </header>

      {/* Two-pane layout */}
      <div className="flex min-h-0 flex-1">
        {/* ── Left sidebar ── */}
        <aside
          className="flex w-[340px] shrink-0 flex-col border-r"
          style={{ borderColor: MUTED_BORDER, backgroundColor: IVORY }}
        >
          <div className="border-b px-5 py-4" style={{ borderColor: MUTED_BORDER }}>
            <label className="relative block">
              <span
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-stone-400"
                aria-hidden
              >
                ⌕
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search messages"
                className="h-9 w-full rounded-md border bg-white pl-8 pr-3 text-[13px] placeholder:text-stone-400 focus:outline-none focus:ring-2"
                style={{
                  borderColor: "rgba(44,44,44,0.12)",
                  boxShadow: "none",
                }}
              />
            </label>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {orderConvos.length > 0 && (
              <ConvoSection
                title="Order conversations"
                count={orderConvos.length}
                convos={orderConvos}
                selectedId={selected.id}
                onSelect={setSelectedId}
              />
            )}
            {inquiryConvos.length > 0 && (
              <ConvoSection
                title="Pre-order inquiries"
                count={inquiryConvos.length}
                convos={inquiryConvos}
                selectedId={selected.id}
                onSelect={setSelectedId}
              />
            )}
            {orderConvos.length === 0 && inquiryConvos.length === 0 && (
              <p className="px-5 py-8 text-center text-[12.5px] text-stone-500">
                No conversations match &ldquo;{query}&rdquo;.
              </p>
            )}
          </div>
        </aside>

        {/* ── Right panel: active thread ── */}
        <section
          className="flex min-w-0 flex-1 flex-col"
          style={{ backgroundColor: "#FAF8F5" }}
        >
          <ThreadHeader conversation={selected} />

          <div className="flex-1 overflow-y-auto px-8 py-6">
            <div className="mx-auto flex max-w-3xl flex-col gap-5">
              {selected.messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
            </div>
          </div>

          {/* Composer */}
          <div
            className="border-t px-8 py-4"
            style={{ borderColor: MUTED_BORDER, backgroundColor: IVORY }}
          >
            <div className="mx-auto max-w-3xl">
              {/* Template picker + quote action */}
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setTemplatesOpen((v) => !v)}
                    className="inline-flex h-7 items-center gap-1.5 rounded-md border bg-white px-2.5 text-[11.5px] text-[#2C2C2C] transition-colors hover:bg-[#FBF3E4]"
                    style={{ borderColor: "rgba(44,44,44,0.12)" }}
                  >
                    <span aria-hidden>⌁</span>
                    Quick replies
                    <span className="text-[9px] text-stone-400" aria-hidden>
                      ▾
                    </span>
                  </button>
                  {templatesOpen && (
                    <div
                      className="absolute bottom-[calc(100%+6px)] left-0 w-[360px] overflow-hidden rounded-lg border bg-white shadow-[0_20px_60px_-20px_rgba(44,44,44,0.25)]"
                      style={{ borderColor: "rgba(44,44,44,0.1)" }}
                    >
                      <div
                        className="border-b px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#7a5a16]"
                        style={{ borderColor: MUTED_BORDER }}
                      >
                        Templates
                      </div>
                      <ul className="max-h-[320px] overflow-y-auto">
                        {QUICK_REPLIES.map((t) => (
                          <li key={t.id}>
                            <button
                              type="button"
                              onClick={() => handleTemplate(t.body)}
                              className="flex w-full flex-col gap-1 px-3 py-2.5 text-left transition-colors hover:bg-[#FBF3E4]"
                            >
                              <span className="text-[12.5px] font-medium text-[#2C2C2C]">
                                {t.label}
                              </span>
                              <span className="text-[11.5px] leading-snug text-stone-600">
                                {t.body}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="inline-flex h-7 items-center gap-1.5 rounded-md border bg-white px-2.5 text-[11.5px] text-[#2C2C2C] transition-colors hover:bg-[#FBF3E4]"
                  style={{ borderColor: "rgba(44,44,44,0.12)" }}
                >
                  <span aria-hidden>📎</span>
                  Attach image
                </button>
                <button
                  type="button"
                  className="inline-flex h-7 items-center gap-1.5 rounded-md border bg-white px-2.5 text-[11.5px] text-[#2C2C2C] transition-colors hover:bg-[#FBF3E4]"
                  style={{ borderColor: "rgba(44,44,44,0.12)" }}
                >
                  <span aria-hidden>📄</span>
                  Attach file
                </button>

                <div className="flex-1" />

                <button
                  type="button"
                  onClick={() => setQuoteOpen(true)}
                  className="inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-[11.5px] font-medium transition-colors"
                  style={{
                    borderColor: "rgba(196,162,101,0.5)",
                    color: "#7a5a16",
                    backgroundColor: "#FBF3E4",
                  }}
                >
                  <span aria-hidden>＋</span>
                  Create custom quote
                </button>
              </div>

              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`Reply to ${selected.coupleName}…`}
                rows={3}
                className="w-full resize-none rounded-md border bg-white px-3 py-2.5 text-[13.5px] leading-relaxed placeholder:text-stone-400 focus:outline-none"
                style={{ borderColor: "rgba(44,44,44,0.12)" }}
              />

              <div className="mt-2 flex items-center justify-between">
                <p className="text-[11px] text-stone-400">
                  Enter to add a line · press Send when ready
                </p>
                <button
                  type="button"
                  disabled={draft.trim().length === 0}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md px-4 text-[13px] font-medium text-white transition-opacity"
                  style={{
                    backgroundColor: ACCENT,
                    opacity: draft.trim().length === 0 ? 0.45 : 1,
                    cursor: draft.trim().length === 0 ? "not-allowed" : "pointer",
                  }}
                >
                  Send <span aria-hidden>→</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {quoteOpen && (
        <QuoteBuilderModal
          buyerName={selected.coupleName}
          onClose={() => setQuoteOpen(false)}
        />
      )}
    </div>
  );
}

// ── Sidebar sections ────────────────────────────────────────────

function ConvoSection({
  title,
  count,
  convos,
  selectedId,
  onSelect,
}: {
  title: string;
  count: number;
  convos: Conversation[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <div
        className="flex items-baseline justify-between px-5 pb-2 pt-4"
        style={{ backgroundColor: IVORY }}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#7a5a16]">
          {title}
        </p>
        <span className="text-[11px] text-stone-400">{count}</span>
      </div>
      <ul>
        {convos.map((c) => (
          <li key={c.id}>
            <ConvoItem
              conversation={c}
              active={c.id === selectedId}
              onClick={() => onSelect(c.id)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ConvoItem({
  conversation,
  active,
  onClick,
}: {
  conversation: Conversation;
  active: boolean;
  onClick: () => void;
}) {
  const [bg, fg] = conversation.avatarColors;
  const initials = conversation.coupleName
    .split("&")
    .map((s) => s.trim()[0] ?? "")
    .join("")
    .slice(0, 2);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-3 border-b px-5 py-3.5 text-left transition-colors ${
        active ? "" : "hover:bg-[#FBF3E4]/60"
      }`}
      style={{
        borderColor: MUTED_BORDER,
        backgroundColor: active ? CHAMPAGNE : "transparent",
        borderLeft: active ? `3px solid ${ACCENT}` : "3px solid transparent",
        paddingLeft: active ? 17 : 20,
      }}
    >
      <span
        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
        style={{ backgroundColor: bg, color: fg }}
        aria-hidden
      >
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {conversation.unread && (
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: "#B23A2A" }}
              aria-label="Unread"
            />
          )}
          <p
            className={`truncate text-[14px] ${
              conversation.unread ? "font-semibold text-[#2C2C2C]" : "text-[#2C2C2C]"
            }`}
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: conversation.unread ? 600 : 500, fontSize: 16 }}
          >
            {conversation.coupleName}
          </p>
        </div>
        <p className="mt-0.5 truncate text-[11.5px] text-stone-500">
          {conversation.subject}
        </p>
        <p
          className="mt-1 line-clamp-2 text-[12.5px] leading-snug text-stone-600"
          style={{ fontStyle: conversation.unread ? "normal" : "italic" }}
        >
          &ldquo;{conversation.preview}&rdquo;
        </p>
        <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wider text-stone-400">
          {conversation.timeAgo}
        </p>
      </div>
    </button>
  );
}

// ── Thread header ───────────────────────────────────────────────

function ThreadHeader({ conversation }: { conversation: Conversation }) {
  const [bg, fg] = conversation.avatarColors;
  const initials = conversation.coupleName
    .split("&")
    .map((s) => s.trim()[0] ?? "")
    .join("")
    .slice(0, 2);

  return (
    <header
      className="flex items-center justify-between gap-4 border-b px-8 py-4"
      style={{ borderColor: MUTED_BORDER, backgroundColor: IVORY }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[12.5px] font-semibold"
          style={{ backgroundColor: bg, color: fg }}
          aria-hidden
        >
          {initials}
        </span>
        <div className="min-w-0">
          <p
            className="truncate text-[19px] leading-tight text-[#2C2C2C]"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
          >
            {conversation.coupleName}
          </p>
          <p className="mt-0.5 truncate text-[12px] text-stone-500">
            {conversation.subject}
            {conversation.productName && (
              <>
                <span className="mx-2 text-stone-300">·</span>
                {conversation.productName}
              </>
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {conversation.orderNumber && (
          <a
            href={`/seller/orders?focus=${conversation.orderNumber.replace("#", "")}`}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border bg-white px-3 text-[12px] text-[#2C2C2C] transition-colors hover:bg-[#FBF3E4]"
            style={{ borderColor: "rgba(44,44,44,0.12)" }}
          >
            View order {conversation.orderNumber}
          </a>
        )}
        <span
          className="inline-flex h-8 items-center rounded-md border px-3 font-mono text-[10px] uppercase tracking-wider"
          style={{
            borderColor: conversation.kind === "order" ? "rgba(196,162,101,0.4)" : "rgba(107,91,168,0.35)",
            backgroundColor: conversation.kind === "order" ? "#FBF3E4" : "#EEE8F8",
            color: conversation.kind === "order" ? "#7a5a16" : "#6B5BA8",
          }}
        >
          {conversation.kind === "order" ? "Order thread" : "Pre-order inquiry"}
        </span>
      </div>
    </header>
  );
}

// ── Message bubble ───────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  const isSeller = message.author === "seller";

  return (
    <div className={`flex flex-col ${isSeller ? "items-end" : "items-start"}`}>
      <div className="mb-1 flex items-baseline gap-2 px-2">
        <p
          className="text-[13px] text-[#2C2C2C]"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
        >
          {isSeller ? `${message.authorName} (you)` : message.authorName}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-wider text-stone-400">
          {message.timestamp}
        </p>
      </div>

      <div
        className="max-w-[86%] rounded-2xl border px-4 py-3 text-[13.5px] leading-relaxed"
        style={{
          borderColor: isSeller ? "rgba(196,162,101,0.35)" : MUTED_BORDER,
          backgroundColor: isSeller ? CHAMPAGNE : IVORY,
          color: INK,
          borderTopRightRadius: isSeller ? 4 : 16,
          borderTopLeftRadius: isSeller ? 16 : 4,
        }}
      >
        {message.body && <p className="whitespace-pre-wrap">{message.body}</p>}

        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.attachments.map((a, i) => {
              if (a.kind === "image") {
                return (
                  <div
                    key={i}
                    className="flex flex-col overflow-hidden rounded-md border"
                    style={{ borderColor: "rgba(44,44,44,0.1)" }}
                  >
                    <div
                      className="flex h-28 w-40 items-center justify-center text-[10px] uppercase tracking-wider"
                      style={{
                        backgroundColor: a.tone === "proof" ? "#E8DEF5" : "#D9E8E4",
                        color: a.tone === "proof" ? "#6B5BA8" : "#2C6E6A",
                      }}
                      aria-hidden
                    >
                      {a.tone === "proof" ? "PROOF" : "REFERENCE"}
                    </div>
                    <p className="bg-white px-2 py-1.5 text-[11px] text-stone-600">
                      {a.label}
                    </p>
                  </div>
                );
              }
              if (a.kind === "file") {
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-md border bg-white px-2.5 py-1.5 text-[11.5px] text-stone-700"
                    style={{ borderColor: "rgba(44,44,44,0.1)" }}
                  >
                    <span aria-hidden>📄</span>
                    <span>{a.label}</span>
                    <span className="font-mono text-[10px] text-stone-400">{a.size}</span>
                  </div>
                );
              }
              return (
                <a
                  key={i}
                  href={a.url}
                  className="inline-flex items-center gap-1.5 rounded-md border bg-white px-2.5 py-1.5 text-[11.5px] text-[#7a5a16] hover:underline"
                  style={{ borderColor: "rgba(44,44,44,0.1)" }}
                >
                  <span aria-hidden>↗</span>
                  {a.label}
                </a>
              );
            })}
          </div>
        )}

        {message.quote && <QuoteCardView quote={message.quote} />}
      </div>
    </div>
  );
}

// ── Embedded quote card (displayed within a message) ─────────────

function QuoteCardView({ quote }: { quote: QuoteCard }) {
  return (
    <div
      className="mt-3 overflow-hidden rounded-lg border"
      style={{ borderColor: "rgba(196,162,101,0.45)", backgroundColor: IVORY }}
    >
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ backgroundColor: "rgba(196,162,101,0.18)" }}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#7a5a16]">
          Custom quote · {quote.status === "sent" ? "Sent" : quote.status}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-wider text-stone-500">
          Valid for {quote.validForDays} days
        </p>
      </div>

      <div className="px-3.5 py-3">
        <p className="text-[12.5px] leading-relaxed text-stone-700">
          {quote.description}
        </p>

        <dl className="mt-3 space-y-1.5 font-mono text-[11.5px]">
          <Line label={`Quantity × Unit (${quote.quantity} × $${quote.unitPrice.toFixed(2)})`} value={`$${(quote.quantity * quote.unitPrice).toFixed(2)}`} />
          {quote.rushFee !== undefined && (
            <Line label="Rush fee" value={`$${quote.rushFee.toFixed(2)}`} />
          )}
          <Line label="Shipping" value={`$${quote.shipping.toFixed(2)}`} />
          <div className="my-1.5 border-t" style={{ borderColor: MUTED_BORDER }} />
          <Line label="Total" value={`$${quote.total.toLocaleString("en-US")}`} bold />
        </dl>

        <p className="mt-3 text-[11.5px] text-stone-500">
          Estimated delivery: <span className="text-[#2C2C2C]">{quote.deliveryEstimate}</span>
        </p>

        {quote.note && (
          <p
            className="mt-2 rounded-md px-2.5 py-2 text-[11.5px] italic text-stone-600"
            style={{ backgroundColor: "rgba(196,162,101,0.1)" }}
          >
            &ldquo;{quote.note}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}

function Line({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-stone-500">{label}</dt>
      <dd
        className={bold ? "text-[#2C2C2C]" : "text-stone-700"}
        style={{ fontWeight: bold ? 600 : 400, fontSize: bold ? 13 : 11.5 }}
      >
        {value}
      </dd>
    </div>
  );
}

// ── Quote Builder modal ─────────────────────────────────────────

function QuoteBuilderModal({
  buyerName,
  onClose,
}: {
  buyerName: string;
  onClose: () => void;
}) {
  const [description, setDescription] = useState(
    "Rush order — 300 Sikh wedding invitations with Gurmukhi and English text, gold foil on ivory card stock, matching RSVP cards.",
  );
  const [quantity, setQuantity] = useState(300);
  const [unitPrice, setUnitPrice] = useState(9.5);
  const [rushFee, setRushFee] = useState(450);
  const [shipping, setShipping] = useState(85);
  const [delivery, setDelivery] = useState("14 business days");
  const [validFor, setValidFor] = useState(7);
  const [note, setNote] = useState(
    "Rush fee covers expedited production in Jaipur. We can have proofs to you within 48 hours of order.",
  );

  const subtotal = quantity * unitPrice;
  const total = subtotal + rushFee + shipping;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ backgroundColor: "rgba(44,44,44,0.42)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[640px] overflow-hidden rounded-xl border bg-white shadow-[0_40px_80px_-20px_rgba(44,44,44,0.4)]"
        style={{ borderColor: "rgba(196,162,101,0.45)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-6 py-4"
          style={{ borderColor: MUTED_BORDER, backgroundColor: CHAMPAGNE }}
        >
          <div>
            <h2
              className="text-[22px] leading-none text-[#2C2C2C]"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
            >
              Create Custom Quote
            </h2>
            <p className="mt-1 text-[12.5px] text-stone-600">
              For: <span className="text-[#2C2C2C]">{buyerName}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close quote builder"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[14px] text-stone-500 hover:bg-white"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          <Field label="Product description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-md border bg-white px-3 py-2 text-[13px] focus:outline-none"
              style={{ borderColor: "rgba(44,44,44,0.12)" }}
            />
          </Field>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <Field label="Quantity">
              <NumberInput value={quantity} onChange={setQuantity} min={1} />
            </Field>
            <Field label="Unit price ($)">
              <NumberInput value={unitPrice} onChange={setUnitPrice} step={0.5} min={0} />
            </Field>
            <Field label="Rush fee ($)">
              <NumberInput value={rushFee} onChange={setRushFee} min={0} />
            </Field>
            <Field label="Shipping ($)">
              <NumberInput value={shipping} onChange={setShipping} min={0} />
            </Field>
          </div>

          {/* Total summary */}
          <div
            className="mt-5 rounded-lg border px-4 py-3"
            style={{ borderColor: "rgba(196,162,101,0.45)", backgroundColor: "#FBF3E4" }}
          >
            <dl className="space-y-1 font-mono text-[12px]">
              <Line
                label={`Subtotal (${quantity} × $${unitPrice.toFixed(2)})`}
                value={`$${subtotal.toFixed(2)}`}
              />
              {rushFee > 0 && <Line label="Rush fee" value={`$${rushFee.toFixed(2)}`} />}
              <Line label="Shipping" value={`$${shipping.toFixed(2)}`} />
              <div className="my-1.5 border-t" style={{ borderColor: "rgba(44,44,44,0.15)" }} />
              <Line label="Total" value={`$${total.toLocaleString("en-US", { maximumFractionDigits: 2 })}`} bold />
            </dl>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <Field label="Estimated delivery">
              <input
                type="text"
                value={delivery}
                onChange={(e) => setDelivery(e.target.value)}
                className="h-9 w-full rounded-md border bg-white px-3 text-[13px] focus:outline-none"
                style={{ borderColor: "rgba(44,44,44,0.12)" }}
              />
            </Field>
            <Field label="Quote valid for (days)">
              <NumberInput value={validFor} onChange={setValidFor} min={1} />
            </Field>
          </div>

          <Field label="Notes to buyer" className="mt-4">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-md border bg-white px-3 py-2 text-[13px] focus:outline-none"
              style={{ borderColor: "rgba(44,44,44,0.12)" }}
            />
          </Field>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-2 border-t px-6 py-4"
          style={{ borderColor: MUTED_BORDER }}
        >
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-md border bg-white px-4 text-[13px] text-[#2C2C2C] transition-colors hover:bg-[#FBF3E4]"
            style={{ borderColor: "rgba(44,44,44,0.12)" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center gap-1.5 rounded-md px-4 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: ACCENT }}
          >
            Send quote <span aria-hidden>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.22em] text-[#7a5a16]">
        {label}
      </span>
      {children}
    </label>
  );
}

function NumberInput({
  value,
  onChange,
  step = 1,
  min,
}: {
  value: number;
  onChange: (n: number) => void;
  step?: number;
  min?: number;
}) {
  return (
    <input
      type="number"
      value={value}
      step={step}
      min={min}
      onChange={(e) => {
        const v = parseFloat(e.target.value);
        onChange(Number.isFinite(v) ? v : 0);
      }}
      className="h-9 w-full rounded-md border bg-white px-3 text-[13px] focus:outline-none"
      style={{ borderColor: "rgba(44,44,44,0.12)" }}
    />
  );
}
