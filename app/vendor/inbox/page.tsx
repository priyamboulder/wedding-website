"use client";

import { useMemo, useState } from "react";
import {
  Card,
  Chip,
  GhostButton,
  PageHeader,
  PrimaryButton,
} from "@/components/vendor-portal/ui";
import { INTERESTED_COUPLES } from "@/lib/vendor-portal/seed";
import { SEED_PACKAGES } from "@/lib/vendor-portal/packages-seed";
import {
  PORTAL_VENDOR_ID,
  usePortalVendor,
} from "@/lib/vendor-portal/current-vendor";
import { useInquiryStore } from "@/stores/inquiry-store";
import type {
  Inquiry,
  InquiryMessage,
  InquiryStatus,
  MessageAttachment,
} from "@/types/inquiry";

type TabKey = "inbox" | "interested";
type FilterKey =
  | "all"
  | "submitted"
  | "viewed"
  | "responded"
  | "booked"
  | "declined";

const FILTER_LABEL: Record<FilterKey, string> = {
  all: "All",
  submitted: "New",
  viewed: "Viewed",
  responded: "Responded",
  booked: "Booked",
  declined: "Declined",
};

const STATUS_LABEL: Record<
  InquiryStatus,
  { label: string; tone: "neutral" | "gold" | "sage" | "rose" | "teal" }
> = {
  submitted: { label: "New", tone: "rose" },
  viewed: { label: "Viewed", tone: "teal" },
  responded: { label: "Responded", tone: "gold" },
  booked: { label: "Booked", tone: "sage" },
  declined: { label: "Declined", tone: "neutral" },
  expired: { label: "Expired", tone: "neutral" },
};

const PACKAGE_LOOKUP: Record<string, string> = Object.fromEntries(
  SEED_PACKAGES.map((p) => [p.id, p.name]),
);

function resolvePackageName(id: string): string {
  return PACKAGE_LOOKUP[id] ?? id;
}

function formatWeddingDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
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

function timeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const diff = Date.now() - t;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function VendorInboxPage() {
  const vendor = usePortalVendor();
  const senderName = vendor.owner_name || vendor.name;

  // Subscribe to the full inquiries array so this page re-renders on any
  // store mutation, then delegate the vendor filter to getInquiriesByVendor.
  const allInquiries = useInquiryStore((s) => s.inquiries);
  const getInquiriesByVendor = useInquiryStore((s) => s.getInquiriesByVendor);
  const inquiries = useMemo(
    () => getInquiriesByVendor(PORTAL_VENDOR_ID),
    // `allInquiries` drives re-evaluation; the getter reads fresh state.
    [allInquiries, getInquiriesByVendor],
  );

  const viewInquiry = useInquiryStore((s) => s.viewInquiry);
  const sendMessage = useInquiryStore((s) => s.sendMessage);
  const declineInquiry = useInquiryStore((s) => s.declineInquiry);
  const bookFromInquiry = useInquiryStore((s) => s.bookFromInquiry);

  const [tab, setTab] = useState<TabKey>("inbox");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>(inquiries[0]?.id ?? "");
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [confirmDecline, setConfirmDecline] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return inquiries.filter((inq) => {
      if (filter !== "all" && inq.status !== filter) return false;
      if (!q) return true;
      const haystack =
        `${inq.couple_name} ${inq.wedding_date} ${inq.venue_name ?? ""}`.toLowerCase();
      const allMessages = inq.messages.map((m) => m.body).join(" ").toLowerCase();
      return haystack.includes(q) || allMessages.includes(q);
    });
  }, [filter, search, inquiries]);

  const counts = useMemo(() => {
    const c: Record<FilterKey, number> = {
      all: inquiries.length,
      submitted: 0,
      viewed: 0,
      responded: 0,
      booked: 0,
      declined: 0,
    };
    inquiries.forEach((inq) => {
      if (inq.status in c) c[inq.status as FilterKey] += 1;
    });
    return c;
  }, [inquiries]);

  const selected = filtered.find((i) => i.id === selectedId) ?? filtered[0] ?? null;

  const selectAndView = (id: string) => {
    setSelectedId(id);
    const inq = inquiries.find((i) => i.id === id);
    if (inq && inq.status === "submitted") viewInquiry(id);
  };

  const toAttachments = (names: string[]): MessageAttachment[] =>
    names.map((name, i) => ({
      id: `a-${Date.now()}-${i}`,
      name,
      kind: name.toLowerCase().endsWith(".pdf") ? "pdf" : "image",
      size: "—",
    }));

  const sendReply = () => {
    if (!selected || !draft.trim()) return;
    sendMessage(selected.id, {
      sender: "vendor",
      sender_name: senderName,
      body: draft.trim(),
      attachments: attachments.length ? toAttachments(attachments) : [],
    });
    setDraft("");
    setAttachments([]);
  };

  const markBooked = () => {
    if (!selected) return;
    bookFromInquiry(selected.id);
  };

  const confirmDeclineFor = (id: string) => setConfirmDecline(id);
  const doDecline = () => {
    if (!confirmDecline) return;
    declineInquiry(confirmDecline);
    setConfirmDecline(null);
  };

  const unreadCount = inquiries.filter((i) => i.status === "submitted").length;

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow="Messages"
        title="Couple inquiries"
        description="Every thread with a couple — from first hello to signed contract. Respond within 24 hours to stay in the top tier of Ananya's discovery."
        actions={
          <>
            <GhostButton>Templates</GhostButton>
            <PrimaryButton>Compose message</PrimaryButton>
          </>
        }
      />

      <div className="px-4 pb-6 pt-5 sm:px-8">
        <div className="mb-4 flex gap-5 border-b border-[rgba(26,26,26,0.08)]">
          <TabButton
            active={tab === "inbox"}
            onClick={() => setTab("inbox")}
            label="Inbox"
            count={unreadCount > 0 ? unreadCount : undefined}
          />
          <TabButton
            active={tab === "interested"}
            onClick={() => setTab("interested")}
            label="Interested couples"
            count={INTERESTED_COUPLES.length}
          />
        </div>

        {tab === "inbox" ? (
          <>
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(FILTER_LABEL) as FilterKey[]).map((key) => {
                  const isActive = filter === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[12.5px] transition-colors ${
                        isActive
                          ? "bg-[#1a1a1a] text-[#FBF9F4]"
                          : "border border-[rgba(26,26,26,0.12)] bg-white text-stone-600 hover:text-[#1a1a1a]"
                      }`}
                    >
                      <span>{FILTER_LABEL[key]}</span>
                      <span
                        className={`rounded-full px-1.5 text-[10.5px] ${
                          isActive ? "bg-[#FBF9F4]/20 text-[#FBF9F4]" : "text-stone-400"
                        }`}
                      >
                        {counts[key]}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="relative w-full lg:w-80">
                <span
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-stone-400"
                  aria-hidden
                >
                  ⌕
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search couples, dates, messages…"
                  className="h-9 w-full rounded-md border bg-white pl-8 pr-3 text-[13px] text-[#1a1a1a] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#B8860B]/40"
                  style={{ borderColor: "rgba(26,26,26,0.12)" }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
              <Card
                className={`overflow-hidden ${selected ? "hidden lg:block" : ""}`}
              >
                {filtered.length === 0 ? (
                  <EmptyList
                    message={
                      search
                        ? "No conversations match that search."
                        : "No conversations in this filter."
                    }
                  />
                ) : (
                  <ul className="max-h-[72vh] overflow-y-auto">
                    {filtered.map((inq) => (
                      <li key={inq.id}>
                        <InquiryRow
                          inquiry={inq}
                          active={selected?.id === inq.id}
                          onClick={() => selectAndView(inq.id)}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <Card className={`overflow-hidden ${selected ? "" : "hidden lg:block"}`}>
                {selected ? (
                  <ConversationPane
                    inquiry={selected}
                    draft={draft}
                    setDraft={setDraft}
                    attachments={attachments}
                    setAttachments={setAttachments}
                    onSend={sendReply}
                    onMarkBooked={markBooked}
                    onDecline={() => confirmDeclineFor(selected.id)}
                    onBackToList={() => setSelectedId("")}
                  />
                ) : (
                  <div className="flex min-h-[400px] items-center justify-center px-6 py-12 text-center">
                    <div>
                      <p
                        className="text-[18px] text-[#1a1a1a]"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        Select a conversation
                      </p>
                      <p
                        className="mt-1 text-[14px] italic text-stone-500"
                        style={{ fontFamily: "'EB Garamond', serif" }}
                      >
                        Choose a couple from the list to see their full thread.
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </>
        ) : (
          <InterestedCouplesPanel />
        )}
      </div>

      {confirmDecline && (
        <DeclineConfirmDialog
          coupleName={
            inquiries.find((i) => i.id === confirmDecline)?.couple_name ?? ""
          }
          onCancel={() => setConfirmDecline(null)}
          onConfirm={doDecline}
        />
      )}
    </div>
  );
}

// ─── Inquiry row ───────────────────────────────────────────────

function InquiryRow({
  inquiry,
  active,
  onClick,
}: {
  inquiry: Inquiry;
  active: boolean;
  onClick: () => void;
}) {
  const stat = STATUS_LABEL[inquiry.status];
  const isUnread = inquiry.status === "submitted";
  const last = inquiry.messages[inquiry.messages.length - 1];
  const preview = last?.body ?? "";

  return (
    <button
      onClick={onClick}
      className={`block w-full border-b border-[rgba(26,26,26,0.05)] px-4 py-3.5 text-left transition-colors last:border-b-0 ${
        active
          ? "bg-[#FBF7EC]"
          : isUnread
            ? "bg-[#FBF7EC]/40 hover:bg-[#FBF7EC]/70"
            : "hover:bg-[#F5F1E8]/50"
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {isUnread && (
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#C97B63]"
              aria-label="New"
            />
          )}
          <p
            className={`truncate text-[14px] ${
              isUnread ? "font-semibold" : "font-medium"
            } text-[#1a1a1a]`}
          >
            {inquiry.couple_name}
          </p>
        </div>
        <span className="shrink-0 font-mono text-[10.5px] uppercase tracking-wider text-stone-400">
          {timeAgo(inquiry.updated_at)}
        </span>
      </div>

      <dl className="mt-1.5 flex flex-wrap gap-x-2.5 gap-y-0.5 text-[11.5px] text-stone-600">
        <RowMeta label="Date" value={formatWeddingDate(inquiry.wedding_date)} />
        <RowMeta label="Guests" value={`${inquiry.guest_count}`} />
        {inquiry.venue_name && (
          <RowMeta label="Venue" value={inquiry.venue_name} />
        )}
        {inquiry.events.length > 0 && (
          <RowMeta label="Events" value={inquiry.events.join(" + ")} />
        )}
        <RowMeta
          label="Budget"
          value={formatBudget(inquiry.budget_min, inquiry.budget_max)}
        />
      </dl>

      <p
        className="mt-1.5 line-clamp-2 text-[13.5px] leading-snug text-stone-600"
        style={{ fontFamily: "'EB Garamond', serif", fontSize: "14px" }}
      >
        {preview}
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Chip tone={stat.tone}>{stat.label}</Chip>
        {inquiry.package_ids.length > 0 && (
          <span className="text-[11px] text-stone-500">
            {inquiry.package_ids.length === 1
              ? resolvePackageName(inquiry.package_ids[0])
              : `${inquiry.package_ids.length} packages requested`}
          </span>
        )}
      </div>
    </button>
  );
}

function RowMeta({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="font-mono text-[9.5px] uppercase tracking-wider text-stone-400">
        {label}
      </span>
      <span>{value}</span>
    </span>
  );
}

// ─── Conversation pane ─────────────────────────────────────────

function ConversationPane({
  inquiry,
  draft,
  setDraft,
  attachments,
  setAttachments,
  onSend,
  onMarkBooked,
  onDecline,
  onBackToList,
}: {
  inquiry: Inquiry;
  draft: string;
  setDraft: (s: string) => void;
  attachments: string[];
  setAttachments: React.Dispatch<React.SetStateAction<string[]>>;
  onSend: () => void;
  onMarkBooked: () => void;
  onDecline: () => void;
  onBackToList: () => void;
}) {
  const stat = STATUS_LABEL[inquiry.status];
  const isBooked = inquiry.status === "booked";
  const isArchived = inquiry.status === "declined" || inquiry.status === "expired";

  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-10 border-b border-[rgba(26,26,26,0.08)] bg-white/95 px-5 py-4 backdrop-blur sm:px-6">
        <div className="mb-2 flex items-center gap-2 lg:hidden">
          <button
            onClick={onBackToList}
            className="text-[12px] text-stone-500 hover:text-[#1a1a1a]"
          >
            ← Back to inbox
          </button>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Chip tone={stat.tone}>{stat.label}</Chip>
              <span className="font-mono text-[10.5px] uppercase tracking-wider text-stone-400">
                Inquiry {inquiry.id}
              </span>
              <span className="font-mono text-[10.5px] uppercase tracking-wider text-stone-400">
                via {inquiry.source.replace("_", " ")}
              </span>
            </div>
            <h2
              className="mt-2 text-[22px] leading-tight text-[#1a1a1a] sm:text-[24px]"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}
            >
              {inquiry.couple_name}
            </h2>
            <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-stone-600">
              <ContextPair label="Date" value={formatWeddingDate(inquiry.wedding_date)} />
              <ContextPair label="Guests" value={`${inquiry.guest_count}`} />
              {inquiry.venue_name && (
                <ContextPair label="Location" value={inquiry.venue_name} />
              )}
              {inquiry.events.length > 0 && (
                <ContextPair label="Events" value={inquiry.events.join(" + ")} />
              )}
              <ContextPair
                label="Budget"
                value={formatBudget(inquiry.budget_min, inquiry.budget_max)}
              />
              <ContextPair
                label="Submitted"
                value={formatWeddingDate(inquiry.created_at)}
              />
            </dl>
          </div>

          <div className="flex flex-wrap gap-2">
            {!isBooked && !isArchived && (
              <>
                <GhostButton onClick={onDecline}>Decline</GhostButton>
                <PrimaryButton onClick={onMarkBooked}>Mark as booked</PrimaryButton>
              </>
            )}
            {isBooked && (
              <Chip tone="sage">Contract locked · moved to active weddings</Chip>
            )}
            {isArchived && <Chip tone="neutral">Declined</Chip>}
          </div>
        </div>

        {inquiry.package_ids.length > 0 && (
          <div className="mt-3">
            <p className="font-mono text-[9.5px] uppercase tracking-wider text-stone-400">
              Packages the couple is interested in
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {inquiry.package_ids.map((pid) => (
                <span
                  key={pid}
                  className="rounded-full border border-[rgba(196,162,101,0.35)] bg-[#FBF4E6] px-2.5 py-0.5 text-[11.5px] text-[#8a5a20]"
                >
                  {resolvePackageName(pid)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto bg-[#FAF7EF]/40 px-4 py-5 sm:px-6">
        <ul className="flex flex-col gap-4">
          {inquiry.messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} viewerSide="vendor" />
          ))}
        </ul>
      </div>

      {!isBooked && !isArchived && (
        <div className="border-t border-[rgba(26,26,26,0.08)] bg-white px-4 pb-4 pt-3 sm:px-6">
          <div className="mb-1.5 flex items-center gap-1 text-stone-500">
            <ToolbarBtn
              label="Attach file"
              glyph="📎"
              onClick={() => setAttachments((a) => [...a, "attachment.pdf"])}
            />
            <ToolbarBtn
              label="Attach image"
              glyph="◩"
              onClick={() => setAttachments((a) => [...a, "moment.jpg"])}
            />
          </div>

          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Type a warm, personal reply to ${inquiry.couple_name.split(" & ")[0]}…`}
            rows={4}
            className="w-full resize-none rounded-lg border bg-white p-3 text-[14px] text-[#1a1a1a] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#B8860B]/40"
            style={{ borderColor: "rgba(26,26,26,0.12)" }}
          />

          {attachments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {attachments.map((name, i) => (
                <span
                  key={`${name}-${i}`}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[rgba(26,26,26,0.1)] bg-[#F5F1E8] px-2 py-1 text-[11.5px] text-stone-700"
                >
                  <span aria-hidden>
                    {name.toLowerCase().endsWith(".pdf") ? "📄" : "🖼"}
                  </span>
                  {name}
                  <button
                    onClick={() =>
                      setAttachments((a) => a.filter((_, idx) => idx !== i))
                    }
                    aria-label={`Remove ${name}`}
                    className="text-stone-400 hover:text-[#C97B63]"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11.5px] italic text-stone-500">
              Aurora replies to every new inquiry within 3 hours.
            </p>
            <div className="flex gap-2">
              <GhostButton onClick={() => setDraft("")}>Clear</GhostButton>
              <PrimaryButton onClick={onSend}>Respond</PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ContextPair({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="font-mono text-[10px] uppercase tracking-wider text-stone-400">
        {label}
      </span>
      <span className="text-[12.5px] text-stone-700">{value}</span>
    </span>
  );
}

function MessageBubble({
  msg,
  viewerSide,
}: {
  msg: InquiryMessage;
  viewerSide: "couple" | "vendor";
}) {
  const isOwn = msg.sender === viewerSide;
  const timestamp = new Date(msg.created_at).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  return (
    <li className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[84%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className={`flex items-baseline gap-2 px-1 text-[11.5px] text-stone-500 ${
            isOwn ? "flex-row-reverse" : ""
          }`}
        >
          <span className="font-medium text-stone-700">
            {isOwn ? "You" : msg.sender_name}
          </span>
          <span className="font-mono text-[10.5px] uppercase tracking-wider text-stone-400">
            {timestamp}
          </span>
        </div>
        <div
          className={`mt-1 rounded-2xl px-4 py-3 text-[14.5px] leading-relaxed shadow-[0_1px_0_rgba(26,26,26,0.03)] ${
            isOwn
              ? "rounded-br-md bg-[#FBF9F4] text-[#1a1a1a]"
              : "rounded-bl-md bg-[#F5EBD6] text-[#2a2218]"
          }`}
          style={{
            fontFamily: "'EB Garamond', serif",
            border: "1px solid rgba(26,26,26,0.06)",
          }}
        >
          <p className="whitespace-pre-wrap">{msg.body}</p>

          {msg.attachments.length > 0 && (
            <div className="mt-3 flex flex-col gap-1.5">
              {msg.attachments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-2 rounded-md border border-[rgba(26,26,26,0.12)] bg-white/70 px-2.5 py-1.5"
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
                  <button className="font-sans text-[11.5px] text-[#7a5a16] hover:underline">
                    Download
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

function ToolbarBtn({
  label,
  glyph,
  onClick,
}: {
  label: string;
  glyph: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-7 w-7 items-center justify-center rounded-md text-[13px] text-stone-500 transition-colors hover:bg-[#F5F1E8] hover:text-[#1a1a1a]"
    >
      <span>{glyph}</span>
    </button>
  );
}

function InterestedCouplesPanel() {
  return (
    <div>
      <div className="mb-4 rounded-lg border border-[rgba(184,134,11,0.25)] bg-[#FBF7EC] px-4 py-3">
        <p
          className="text-[13.5px] italic text-stone-700"
          style={{ fontFamily: "'EB Garamond', serif" }}
        >
          Couples who've added Aurora Studios to their photography shortlist — but
          haven't reached out yet. A warm first message can turn a saved favorite into
          a signed contract.
        </p>
      </div>
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {INTERESTED_COUPLES.map((c) => (
          <li key={c.id}>
            <Card className="flex h-full flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3
                    className="truncate text-[17px] text-[#1a1a1a]"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontWeight: 500,
                    }}
                  >
                    {c.coupleName}
                  </h3>
                  <p className="mt-0.5 text-[12.5px] text-stone-500">
                    {c.weddingDate} · {c.city}
                  </p>
                </div>
                <Chip tone="gold">Shortlisted</Chip>
              </div>

              <dl className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-stone-600">
                <ContextPair label="Events" value={c.events.join(" + ")} />
                <ContextPair label="Guests" value={`${c.headcount}`} />
                <ContextPair label="Added" value={c.addedAt} />
              </dl>

              {c.note && (
                <p
                  className="mt-3 text-[13.5px] italic leading-relaxed text-stone-600"
                  style={{ fontFamily: "'EB Garamond', serif" }}
                >
                  {c.note}
                </p>
              )}

              <div className="mt-4 flex items-center justify-end gap-2">
                <GhostButton>View profile</GhostButton>
                <PrimaryButton>Start conversation</PrimaryButton>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DeclineConfirmDialog({
  coupleName,
  onCancel,
  onConfirm,
}: {
  coupleName: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-8"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-xl border bg-white shadow-[0_30px_80px_-20px_rgba(26,26,26,0.35)]"
        style={{ borderColor: "rgba(26,26,26,0.1)" }}
      >
        <div className="px-5 py-4">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-stone-500">
            Confirm decline
          </p>
          <h3
            className="mt-1 text-[20px] text-[#1a1a1a]"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}
          >
            Decline {coupleName}?
          </h3>
          <p
            className="mt-2 text-[13.5px] italic leading-relaxed text-stone-600"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            This will archive the inquiry and let the couple know Aurora Studios
            isn't available. You can't undo this.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[rgba(26,26,26,0.08)] bg-[#FAF7EF]/50 px-5 py-3">
          <GhostButton onClick={onCancel}>Cancel</GhostButton>
          <PrimaryButton onClick={onConfirm}>Decline inquiry</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 pb-2.5 text-[14px] transition-colors ${
        active ? "text-[#1a1a1a]" : "text-stone-500 hover:text-[#1a1a1a]"
      }`}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`rounded-full px-1.5 text-[10.5px] ${
            active ? "bg-[#B8860B] text-[#FBF9F4]" : "bg-stone-200 text-stone-600"
          }`}
        >
          {count}
        </span>
      )}
      {active && (
        <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#1a1a1a]" />
      )}
    </button>
  );
}

function EmptyList({ message }: { message: string }) {
  return (
    <div className="flex min-h-[200px] items-center justify-center px-6 py-12 text-center">
      <p
        className="text-[14px] italic text-stone-500"
        style={{ fontFamily: "'EB Garamond', serif" }}
      >
        {message}
      </p>
    </div>
  );
}
