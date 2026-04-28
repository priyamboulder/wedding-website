"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketplaceStore, CURRENT_USER_ID } from "@/stores/marketplace-store";
import { GradientImage } from "@/components/marketplace/primitives";
import { formatPrice, relativeTime } from "@/lib/marketplace/utils";

interface InquiryThreadProps {
  listingId: string;
  weddingId: string;
  open: boolean;
  onClose: () => void;
}

export function InquiryThread({
  listingId,
  weddingId,
  open,
  onClose,
}: InquiryThreadProps) {
  const listing = useMarketplaceStore((s) => s.getListing(listingId));
  const getOrCreate = useMarketplaceStore((s) => s.getOrCreateInquiry);
  const sendMessage = useMarketplaceStore((s) => s.sendMessage);
  const markRead = useMarketplaceStore((s) => s.markInquiryRead);

  // Subscribe to the inquiries slice so message additions trigger re-renders.
  const inquiries = useMarketplaceStore((s) => s.inquiries);

  const [inquiryId, setInquiryId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [autoReplied, setAutoReplied] = useState(false);

  const inquiry = useMemo(
    () => inquiries.find((i) => i.id === inquiryId) ?? null,
    [inquiries, inquiryId],
  );

  // Open → ensure an inquiry exists and mark it read.
  useEffect(() => {
    if (!open || !listing) return;
    try {
      const inq = getOrCreate(listing.id);
      setInquiryId(inq.id);
      markRead(inq.id);
    } catch {
      // listing missing — nothing we can do here.
    }
  }, [open, listing, getOrCreate, markRead]);

  // Fake a seller reply the first time the buyer writes into a fresh thread.
  // Gives the demo a feeling of two-way conversation without a backend.
  useEffect(() => {
    if (!inquiry || !listing || autoReplied) return;
    const buyerMsgs = inquiry.messages.filter(
      (m) => m.sender_id === CURRENT_USER_ID,
    );
    const sellerMsgs = inquiry.messages.filter(
      (m) => m.sender_id !== CURRENT_USER_ID,
    );
    if (buyerMsgs.length === 1 && sellerMsgs.length === 0) {
      setAutoReplied(true);
      const id = setTimeout(() => {
        sendMessage(
          inquiry.id,
          `Hi! Yes, it's still available. Happy to answer any questions — I can send more photos or hop on a video call to show it.`,
          listing.seller_id,
          listing.seller_display_name,
        );
      }, 1600);
      return () => clearTimeout(id);
    }
  }, [inquiry, listing, sendMessage, autoReplied]);

  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!inquiry) return;
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [inquiry?.messages.length, inquiry]);

  if (!open || !listing) return null;

  function handleSend() {
    if (!inquiry) return;
    const body = draft.trim();
    if (!body) return;
    sendMessage(inquiry.id, body);
    setDraft("");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-end bg-ink/40 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Conversation about ${listing.title}`}
    >
      <div
        className="flex h-full w-full max-w-[440px] flex-col bg-ivory shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gold/15 px-5 py-4">
          <div className="flex min-w-0 flex-col">
            <span
              className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              — conversation about —
            </span>
            <span className="truncate font-serif text-[15px] text-ink">
              {listing.title}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-ink-muted hover:bg-ivory-warm hover:text-ink"
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>

        {/* Listing mini-card */}
        <Link
          href={`/${weddingId}/shopping/marketplace/${listing.id}`}
          className="group flex items-center gap-3 border-b border-gold/10 bg-white px-5 py-3 transition-colors hover:bg-ivory-warm"
        >
          <div className="h-14 w-14 overflow-hidden rounded-md">
            <GradientImage
              gradient={listing.image_gradients?.[0]}
              ratio="1/1"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[12.5px] text-ink">
              {listing.title}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-gold" style={{ fontFamily: "var(--font-mono)" }}>
              {listing.listing_type === "free"
                ? "Free"
                : formatPrice(
                    listing.price_cents,
                    listing.seller_location_country,
                  )}
              {listing.listing_type === "rent" && " / event"}
            </span>
          </div>
          <ArrowRight
            size={12}
            strokeWidth={1.8}
            className="text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-ink"
          />
        </Link>

        {/* Messages */}
        <div
          ref={listRef}
          className="flex-1 space-y-4 overflow-y-auto px-5 py-5"
        >
          {inquiry && inquiry.messages.length === 0 && (
            <div className="rounded-lg border border-dashed border-gold/25 bg-white p-4 text-center">
              <p className="font-serif text-[15px] text-ink">
                Say hi to {listing.seller_display_name}
              </p>
              <p className="mt-1.5 text-[12px] text-ink-muted">
                Ask about condition, sizing, or if they'd consider a lower
                offer. Keep it friendly.
              </p>
              <p
                className="mt-3 font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                typically responds {listing.seller_typical_response ?? "soon"}
              </p>
            </div>
          )}

          {inquiry?.messages.map((m) => {
            const mine = m.sender_id === CURRENT_USER_ID;
            return (
              <div
                key={m.id}
                className={cn(
                  "flex flex-col gap-1",
                  mine ? "items-end" : "items-start",
                )}
              >
                <span
                  className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {mine ? "You" : m.sender_display_name} · {relativeTime(m.sent_at)}
                </span>
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
                    mine
                      ? "rounded-br-md bg-ink text-ivory"
                      : "rounded-bl-md border border-gold/15 bg-white text-ink",
                  )}
                >
                  {m.body}
                </div>
              </div>
            );
          })}
        </div>

        {/* Composer */}
        <div className="border-t border-gold/15 bg-white px-5 py-3">
          <div className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={2}
              placeholder="type a message…"
              className="flex-1 resize-none rounded-md border border-border bg-white px-3 py-2 text-[12.5px] text-ink outline-none focus:border-gold"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!draft.trim()}
              aria-label="Send"
              className="flex h-9 w-9 items-center justify-center rounded-md bg-ink text-ivory transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              <Send size={14} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
