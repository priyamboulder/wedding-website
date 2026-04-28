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
import {
  PORTAL_VENDOR_ID,
  usePortalVendor,
} from "@/lib/vendor-portal/current-vendor";
import { useInquiryStore } from "@/stores/inquiry-store";
import type { Inquiry, InquiryStatus } from "@/types/inquiry";

type TabKey = "inbox" | "interested";
type FilterKey = "all" | "submitted" | "viewed" | "responded" | "booked" | "declined";
type ChipTone = "neutral" | "gold" | "sage" | "rose" | "teal";

const STATUS_META: Record<InquiryStatus, { label: string; tone: ChipTone }> = {
  submitted:  { label: "New",      tone: "rose" },
  viewed:     { label: "Viewed",   tone: "teal" },
  responded:  { label: "Replied",  tone: "gold" },
  booked:     { label: "Booked",   tone: "sage" },
  declined:   { label: "Declined", tone: "neutral" },
  expired:    { label: "Expired",  tone: "neutral" },
};

function fmt(iso: string) {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function ReplyModal({
  inquiry,
  vendorName,
  onClose,
  onSend,
}: {
  inquiry: Inquiry;
  vendorName: string;
  onClose: () => void;
  onSend: (body: string) => void;
}) {
  const [body, setBody] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-[22px] text-[#2C2C2C]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Reply to {inquiry.couple_name}
        </h2>
        <p className="mt-1 text-[12.5px] text-stone-500">
          {fmt(inquiry.wedding_date)}{inquiry.venue_name ? ` · ${inquiry.venue_name}` : ""}
        </p>
        {inquiry.messages[0] && (
          <div className="mt-4 rounded-lg bg-stone-50 p-3 text-[13px] text-stone-600 border" style={{ borderColor: "rgba(44,44,44,0.08)" }}>
            <p className="text-[11px] text-stone-400 mb-1 uppercase tracking-wide">Their message</p>
            {inquiry.messages[0].body}
          </div>
        )}
        <div className="mt-4">
          <label className="block text-[12px] text-stone-500 mb-1">Your reply</label>
          <textarea
            rows={5}
            className="w-full rounded-lg border px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#C4A265] resize-none"
            style={{ borderColor: "rgba(44,44,44,0.15)" }}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Thank you for reaching out! I'd love to learn more about your wedding..."
          />
        </div>
        <div className="mt-4 flex gap-3">
          <PrimaryButton onClick={() => { if (body.trim()) { onSend(body.trim()); onClose(); } }}>
            Send reply
          </PrimaryButton>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
        </div>
      </div>
    </div>
  );
}

function ExpressInterestModal({ coupleName, onClose, onSend }: { coupleName: string; onClose: () => void; onSend: (msg: string) => void }) {
  const [msg, setMsg] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-[22px] text-[#2C2C2C]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Express interest
        </h2>
        <p className="mt-1 text-[12.5px] text-stone-500">Send a note to {coupleName}</p>
        <div className="mt-4">
          <label className="block text-[12px] text-stone-500 mb-1">Message (optional)</label>
          <textarea
            rows={4}
            className="w-full rounded-lg border px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#C4A265] resize-none"
            style={{ borderColor: "rgba(44,44,44,0.15)" }}
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Hi! I'd love to be a part of your special day..."
          />
        </div>
        <div className="mt-4 flex gap-3">
          <PrimaryButton onClick={() => { onSend(msg); onClose(); }}>Send</PrimaryButton>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
        </div>
      </div>
    </div>
  );
}

export default function VendorInquiriesPage() {
  const vendor = usePortalVendor();
  const [tab, setTab] = useState<TabKey>("inbox");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [replyTo, setReplyTo] = useState<Inquiry | null>(null);
  const [expressingTo, setExpressingTo] = useState<string | null>(null);
  const [sentInterest, setSentInterest] = useState<Set<string>>(new Set());

  const { inquiries, viewInquiry, sendMessage } = useInquiryStore();

  const vendorInquiries = useMemo(
    () => inquiries.filter((i) => i.vendor_id === PORTAL_VENDOR_ID),
    [inquiries],
  );

  const filtered = useMemo(() => {
    if (filter === "all") return vendorInquiries;
    return vendorInquiries.filter((i) => i.status === filter);
  }, [vendorInquiries, filter]);

  const filters: FilterKey[] = ["all", "submitted", "viewed", "responded", "booked", "declined"];

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow="Inquiries"
        title="Messages from couples"
        description="Review and respond to couples who have reached out about your services."
      />

      <div className="px-8 py-4 flex gap-2 border-b" style={{ borderColor: "rgba(44,44,44,0.08)" }}>
        {(["inbox", "interested"] as TabKey[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-[13px] transition ${
              tab === t ? "bg-[#2C2C2C] text-white" : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            {t === "inbox" ? "Inbox" : "Interested couples"}
          </button>
        ))}
      </div>

      {tab === "inbox" && (
        <div className="px-8 py-6 space-y-4">
          <div className="flex gap-2 flex-wrap">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-[12px] border transition ${
                  filter === f
                    ? "bg-[#2C2C2C] text-white border-[#2C2C2C]"
                    : "border-stone-200 text-stone-600 hover:border-stone-400"
                }`}
              >
                {f === "all" ? "All" : STATUS_META[f as InquiryStatus]?.label ?? f}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 text-center text-stone-400">
              <p className="text-[15px]">No inquiries yet</p>
              <p className="text-[13px] mt-1">When couples reach out, they&apos;ll appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((inq) => {
                const meta = STATUS_META[inq.status];
                return (
                  <Card key={inq.id} className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-[#2C2C2C] text-[14px]">{inq.couple_name}</p>
                          <Chip tone={meta.tone}>{meta.label}</Chip>
                        </div>
                        <p className="mt-0.5 text-[12.5px] text-stone-500">
                          {fmt(inq.wedding_date)}{inq.venue_name ? ` · ${inq.venue_name}` : ""}
                        </p>
                        <p className="mt-2 text-[13px] text-stone-700 line-clamp-2">
                          {inq.messages[0]?.body ?? "No message"}
                        </p>
                      </div>
                      <div className="shrink-0 flex gap-2">
                        {inq.status === "submitted" && (
                          <GhostButton onClick={() => viewInquiry(inq.id)}>
                            Mark viewed
                          </GhostButton>
                        )}
                        <PrimaryButton onClick={() => {
                          if (inq.status === "submitted") viewInquiry(inq.id);
                          setReplyTo(inq);
                        }}>
                          Reply
                        </PrimaryButton>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "interested" && (
        <div className="px-8 py-6 space-y-3">
          {INTERESTED_COUPLES.length === 0 ? (
            <div className="py-16 text-center text-stone-400">
              <p className="text-[15px]">No interested couples yet.</p>
            </div>
          ) : (
            INTERESTED_COUPLES.map((c) => (
              <Card key={c.id} className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-[#2C2C2C] text-[14px]">{c.coupleName}</p>
                    <p className="text-[12.5px] text-stone-500 mt-0.5">
                      {c.weddingDate} · {c.city}
                    </p>
                    {c.note && <p className="text-[13px] text-stone-600 mt-1">{c.note}</p>}
                  </div>
                  {sentInterest.has(c.id) ? (
                    <span className="text-[12px] text-stone-400 italic">Interest sent ✓</span>
                  ) : (
                    <PrimaryButton onClick={() => setExpressingTo(c.coupleName)}>
                      Express interest
                    </PrimaryButton>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {replyTo && (
        <ReplyModal
          inquiry={replyTo}
          vendorName={vendor.name}
          onClose={() => setReplyTo(null)}
          onSend={(body) => {
            sendMessage(replyTo.id, {
              sender: "vendor",
              sender_name: vendor.name,
              body,
            });
          }}
        />
      )}

      {expressingTo && (
        <ExpressInterestModal
          coupleName={expressingTo}
          onClose={() => setExpressingTo(null)}
          onSend={() => {
            const couple = INTERESTED_COUPLES.find((c) => c.coupleName === expressingTo);
            if (couple) setSentInterest((prev) => new Set([...prev, couple.id]));
          }}
        />
      )}
    </div>
  );
}
