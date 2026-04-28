"use client";

import { useEffect } from "react";
import Link from "next/link";
import { PLANNER_PALETTE } from "@/components/planner/ui";
import { type CoupleCard, fullName } from "@/lib/planner/clients-seed";

type CommLogItem = {
  day: string;
  kind: "email" | "call" | "meeting" | "note";
  text: string;
};

// Demo communication history — same for all couples to keep seed lean.
function commLog(card: CoupleCard): CommLogItem[] {
  if (card.stage === "inquiry") {
    return [
      {
        day: "Today",
        kind: "note",
        text: "Received inquiry via " + card.source.toLowerCase() + " — awaiting response.",
      },
    ];
  }
  if (card.stage === "consultation") {
    return [
      {
        day: "Today",
        kind: "email",
        text: "Sent consultation confirmation with venue decks.",
      },
      {
        day: card.consultDone ? "Sep 28" : "3 days ago",
        kind: card.consultDone ? "meeting" : "email",
        text: card.consultDone
          ? "60-min consult — covered aesthetic, guest split, budget allocation."
          : "Booked consult slot for " + (card.consultDate ?? "TBD") + ".",
      },
      {
        day: "1 week ago",
        kind: "email",
        text: "Initial intake — sent questionnaire and sample moodboard.",
      },
    ];
  }
  if (card.stage === "proposal") {
    return [
      {
        day: "4 days ago",
        kind: "email",
        text: "Sent full-service proposal: 3-event coverage, vendor sourcing, design.",
      },
      {
        day: "1 week ago",
        kind: "meeting",
        text: "2-hour consult at our studio — went over vendor shortlist.",
      },
      {
        day: "2 weeks ago",
        kind: "call",
        text: "Discovery call — aligned on aesthetic direction.",
      },
    ];
  }
  if (card.stage === "active") {
    return [
      {
        day: "Today",
        kind: "email",
        text: "Confirmed photography booking and forwarded contract.",
      },
      {
        day: "Yesterday",
        kind: "meeting",
        text: "Weekly check-in — reviewed outstanding vendor slots.",
      },
      { day: "3 days ago", kind: "note", text: "Couple approved decor moodboard." },
    ];
  }
  return [
    {
      day: card.completedDateDisplay ?? "Recently",
      kind: "note",
      text: "Wedding completed. Final gallery delivered from Stories by Joseph Radhik.",
    },
    {
      day: "2 weeks before wedding",
      kind: "meeting",
      text: "Final walkthrough at venue.",
    },
  ];
}

const COMM_GLYPH: Record<CommLogItem["kind"], string> = {
  email: "✉",
  call: "☎",
  meeting: "⌘",
  note: "✎",
};

export default function CoupleDetailPanel({
  card,
  onClose,
  onInviteToAnanya,
}: {
  card: CoupleCard;
  onClose: () => void;
  onInviteToAnanya: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const log = commLog(card);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-end"
      style={{ backgroundColor: "rgba(44,44,44,0.35)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <aside
        className="flex h-full w-full max-w-[540px] flex-col overflow-y-auto bg-white shadow-2xl"
        style={{ borderLeft: `1px solid ${PLANNER_PALETTE.hairline}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between border-b px-7 py-6"
          style={{ borderColor: PLANNER_PALETTE.hairline }}
        >
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-[#C4A265]">
              {card.stage.toUpperCase()}
            </p>
            <h2
              className="mt-1.5 text-[30px] leading-tight text-[#2C2C2C]"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 500,
                letterSpacing: "-0.005em",
              }}
            >
              {fullName(card)}
            </h2>
            <p className="mt-1 text-[12.5px] text-[#6a6a6a]">
              {card.partnerOne} &nbsp;&amp;&nbsp; {card.partnerTwo}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-full text-[#5a5a5a] transition-colors hover:bg-[#F5E6D0]"
          >
            <span className="text-[16px]" aria-hidden>
              ×
            </span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-6 px-7 py-6">
          {/* Contact */}
          <Section label="Contact">
            <KV k="Email" v={card.email ?? "—"} />
            <KV k="Phone" v={card.phone ?? "—"} />
          </Section>

          {/* Wedding details */}
          <Section label="Wedding details">
            <KV k="Date" v={card.weddingDateDisplay} />
            <KV k="Venue" v={card.venue ?? "Not selected"} />
            <KV
              k="Location"
              v={
                <>
                  {card.destination && <span className="mr-1">✈</span>}
                  {card.location}
                </>
              }
            />
            <KV k="Guests" v={`${card.guestCount}`} />
            <KV k="Type" v={`${card.weddingType} · ${card.eventDays}-day`} />
            <KV k="Events" v={card.events.join(", ")} />
            <KV k="Budget" v={card.budget} />
          </Section>

          {/* Source */}
          <Section label="How they found us">
            <KV
              k="Source"
              v={
                <>
                  {card.source}
                  {card.sourceNote && (
                    <span className="italic text-[#8a8a8a]"> ({card.sourceNote})</span>
                  )}
                </>
              }
            />
          </Section>

          {/* Notes */}
          {card.notes && (
            <Section label="Consultation notes">
              <p
                className="rounded-lg bg-[#FBF4E6] px-4 py-3 text-[13px] leading-relaxed text-[#3a3a3a]"
                style={{
                  fontFamily: "'EB Garamond', serif",
                  fontStyle: "italic",
                  border: "1px solid rgba(196,162,101,0.25)",
                }}
              >
                {card.notes}
              </p>
            </Section>
          )}

          {/* Documents */}
          <Section label="Proposal & documents">
            <DocRow
              label={
                card.stage === "active" || card.stage === "completed"
                  ? "Signed service agreement.pdf"
                  : card.stage === "proposal"
                    ? "Full-service proposal.pdf"
                    : "No documents yet"
              }
              meta={
                card.stage === "active" || card.stage === "completed"
                  ? "Signed · " + (card.completedDateDisplay ?? "Jun 2026")
                  : card.stage === "proposal"
                    ? "Sent 4 days ago"
                    : undefined
              }
            />
          </Section>

          {/* Comm history */}
          <Section label="Communication history">
            <ul
              className="divide-y rounded-lg bg-[#FAF8F5]"
              style={{ borderColor: PLANNER_PALETTE.hairlineSoft }}
            >
              {log.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 px-4 py-3"
                  style={
                    i === 0
                      ? undefined
                      : { borderTop: `1px solid ${PLANNER_PALETTE.hairlineSoft}` }
                  }
                >
                  <span
                    className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[12px]"
                    style={{
                      backgroundColor: "#F5E6D0",
                      color: "#9E8245",
                      boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.35)",
                    }}
                    aria-hidden
                  >
                    {COMM_GLYPH[item.kind]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] leading-snug text-[#2C2C2C]">
                      {item.text}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#8a8a8a]">
                      {item.day}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        </div>

        {/* Footer actions */}
        <div
          className="flex flex-wrap items-center justify-between gap-2 border-t px-7 py-5"
          style={{
            borderColor: PLANNER_PALETTE.hairline,
            backgroundColor: "#FAF8F5",
          }}
        >
          <div className="flex items-center gap-2">
            {!card.onAnanyaPlatform && (
              <button
                type="button"
                onClick={onInviteToAnanya}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12.5px] font-medium text-[#FAF8F5]"
                style={{ backgroundColor: PLANNER_PALETTE.charcoal }}
              >
                <span className="text-[#C4A265]" aria-hidden>
                  ✉
                </span>
                Invite to Ananya
              </button>
            )}
            {card.onAnanyaPlatform && card.stage === "active" && (
              <Link
                href={`/planner/weddings/${card.id}`}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12.5px] font-medium text-[#FAF8F5]"
                style={{ backgroundColor: PLANNER_PALETTE.charcoal }}
              >
                Open Wedding <span aria-hidden>→</span>
              </Link>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-[12.5px] text-[#5a5a5a] hover:bg-[#F5E6D0]"
          >
            Close
          </button>
        </div>
      </aside>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#8a8a8a]">
        {label}
      </p>
      <div className="mt-2 space-y-1.5">{children}</div>
    </div>
  );
}

function KV({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3 text-[13px]">
      <p className="text-[#8a8a8a]">{k}</p>
      <p className="text-[#2C2C2C]">{v}</p>
    </div>
  );
}

function DocRow({ label, meta }: { label: string; meta?: string }) {
  return (
    <div
      className="flex items-center justify-between rounded-lg bg-[#FAF8F5] px-4 py-3"
      style={{ border: `1px solid ${PLANNER_PALETTE.hairlineSoft}` }}
    >
      <div className="flex items-center gap-3">
        <span
          className="grid h-8 w-8 place-items-center rounded-md text-[13px] text-[#9E8245]"
          style={{
            backgroundColor: "#F5E6D0",
            boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.35)",
          }}
          aria-hidden
        >
          📄
        </span>
        <div>
          <p className="text-[12.5px] text-[#2C2C2C]">{label}</p>
          {meta && (
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8a8a8a]">
              {meta}
            </p>
          )}
        </div>
      </div>
      <button
        type="button"
        className="rounded-full px-3 py-1 text-[11.5px] font-medium text-[#2C2C2C] hover:bg-[#F5E6D0]"
      >
        View
      </button>
    </div>
  );
}
