"use client";

import { useEffect, useState } from "react";
import { PLANNER_PALETTE } from "@/components/planner/ui";
import { type CoupleCard, fullName } from "@/lib/planner/clients-seed";

function draftMessage(card: CoupleCard) {
  return `Hi ${card.partnerOne.split(" ")[0]} and ${card.partnerTwo.split(" ")[0]},

Just checking in on the proposal I sent over on Oct 1. No rush at all — I know this season can be a lot to take in. Happy to hop on a quick call this week if you'd like to talk through any of the line items or adjust the scope.

Warmly,
Urvashi`;
}

export default function FollowUpModal({
  card,
  onClose,
}: {
  card: CoupleCard;
  onClose: () => void;
}) {
  const [message, setMessage] = useState(() => draftMessage(card));
  const [sent, setSent] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !sent) onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, sent]);

  function send() {
    setSent(true);
    setTimeout(() => onClose(), 1400);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(44,44,44,0.4)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[540px] rounded-2xl bg-white shadow-2xl"
        style={{ border: `1px solid ${PLANNER_PALETTE.hairline}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {sent ? (
          <div className="px-8 py-12 text-center">
            <div
              className="mx-auto grid h-12 w-12 place-items-center rounded-full"
              style={{
                backgroundColor: "#FBF1DF",
                boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.55)",
              }}
            >
              <span className="text-[18px] text-[#7a5a1a]" aria-hidden>
                ✓
              </span>
            </div>
            <p
              className="mt-4 text-[20px] text-[#2C2C2C]"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 500,
              }}
            >
              Follow-up sent
            </p>
          </div>
        ) : (
          <>
            <div
              className="flex items-start justify-between border-b px-7 py-5"
              style={{ borderColor: PLANNER_PALETTE.hairline }}
            >
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#C4A265]">
                  Follow-up
                </p>
                <h2
                  className="mt-1 text-[22px] leading-tight text-[#2C2C2C]"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 500,
                  }}
                >
                  Message {fullName(card)}
                </h2>
                <p className="mt-0.5 text-[12px] text-[#8a8a8a]">
                  To: {card.email}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid h-8 w-8 place-items-center rounded-full text-[#5a5a5a] hover:bg-[#F5E6D0]"
              >
                <span className="text-[16px]" aria-hidden>
                  ×
                </span>
              </button>
            </div>
            <div className="px-7 py-5">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={10}
                className="w-full rounded-lg bg-[#FAF8F5] px-4 py-3 text-[13px] leading-relaxed text-[#2C2C2C] outline-none focus:bg-white"
                style={{
                  fontFamily: "'EB Garamond', serif",
                  border: `1px solid ${PLANNER_PALETTE.hairline}`,
                }}
              />
            </div>
            <div
              className="flex items-center justify-end gap-2 border-t px-7 py-4"
              style={{ borderColor: PLANNER_PALETTE.hairline }}
            >
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-4 py-2 text-[12.5px] text-[#5a5a5a] hover:bg-[#F5E6D0]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={send}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-[12.5px] font-medium text-[#FAF8F5]"
                style={{ backgroundColor: PLANNER_PALETTE.charcoal }}
              >
                Send follow-up
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
