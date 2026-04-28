import Link from "next/link";
import { notFound } from "next/navigation";
import { VENUE_PALETTE, VenueCard } from "@/components/venue/ui";
import {
  findLead,
  type BrowsedShowcase,
  type ConversationMessage,
  type Lead,
  type LeadStage,
} from "@/lib/venue/leads-seed";

const STAGE_LABEL: Record<LeadStage, string> = {
  new: "New",
  tour: "Tour Scheduled",
  proposal: "Proposal Sent",
  booked: "Booked",
  lost: "Lost",
};

const STAGE_ACCENT: Record<LeadStage, string> = {
  new: VENUE_PALETTE.critical,
  tour: VENUE_PALETTE.warning,
  proposal: VENUE_PALETTE.gold,
  booked: VENUE_PALETTE.ontrack,
  lost: "#8a8a8a",
};

export default function LeadDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const lead = findLead(params.id);
  if (!lead) return notFound();

  return (
    <div className="mx-auto max-w-[1100px] px-8 pt-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px] text-[#5a5a5a]">
        <Link
          href="/venue/leads"
          className="inline-flex items-center gap-1 hover:text-[#2C2C2C]"
        >
          <span aria-hidden>←</span> Leads
        </Link>
        <span aria-hidden className="text-[#cdbf9c]">/</span>
        <span className="text-[#2C2C2C]">{lead.coupleNames}</span>
      </div>

      {/* Header */}
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-[#C4A265]">
            Lead detail
          </p>
          <h1
            className="mt-2 text-[44px] leading-[1.02] text-[#2C2C2C]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            {lead.coupleNames}
          </h1>
        </div>
        <StageBadge stage={lead.stage} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column (2/3) */}
        <div className="space-y-6 lg:col-span-2">
          <WeddingDetailsCard lead={lead} />
          {(lead.source || lead.sourceReason) && <SourceCard lead={lead} />}
          {lead.browsed && lead.browsed.length > 0 && (
            <BrowsingHistoryCard lead={lead} />
          )}
          {lead.message && <MessageCard message={lead.message} />}
          <ConversationCard
            messages={
              lead.conversation && lead.conversation.length > 0
                ? lead.conversation
                : [
                    {
                      from: "couple",
                      author: lead.coupleNames.split(" & ")[0] ?? lead.coupleNames,
                      timestamp: lead.receivedLabel ?? "Just now",
                      body:
                        lead.message ??
                        "No message yet — the couple submitted their inquiry details via the form.",
                    },
                  ]
            }
            lead={lead}
          />
          <ActionsRow lead={lead} />
        </div>

        {/* Right column (1/3) */}
        <div className="space-y-6">
          <ContactCard lead={lead} />
          <StageSpecificCard lead={lead} />
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── Header ───────────────────── */

function StageBadge({ stage }: { stage: LeadStage }) {
  const accent = STAGE_ACCENT[stage];
  return (
    <span className="inline-flex items-center gap-2 text-[12px] text-[#5a5a5a]">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#9E8245]">
        Status
      </span>
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11.5px] font-medium"
        style={{
          backgroundColor: "#FFFFFF",
          color: accent,
          boxShadow: `inset 0 0 0 1px ${accent}55`,
        }}
      >
        <span
          aria-hidden
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: accent }}
        />
        {STAGE_LABEL[stage]}
      </span>
    </span>
  );
}

/* ───────────────────── Cards ───────────────────── */

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-[20px] leading-none text-[#2C2C2C]"
      style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontWeight: 500,
      }}
    >
      {children}
    </h2>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#9E8245]">
      {children}
    </p>
  );
}

function Row({
  icon,
  children,
}: {
  icon?: string;
  children: React.ReactNode;
}) {
  return (
    <p className="flex items-baseline gap-2 text-[13.5px] text-[#2C2C2C]">
      {icon && (
        <span aria-hidden className="text-[12px] text-[#9E8245]">
          {icon}
        </span>
      )}
      {children}
    </p>
  );
}

function WeddingDetailsCard({ lead }: { lead: Lead }) {
  return (
    <VenueCard className="p-6">
      <Eyebrow>Wedding details</Eyebrow>
      <div className="mt-3 space-y-1.5">
        <Row icon="📅">
          {lead.estimatedDate}
          {lead.datesFlexible && (
            <span className="text-[#5a5a5a]"> (dates flexible)</span>
          )}
        </Row>
        <Row icon="👥">
          <span className="font-mono text-[12.5px]">{lead.guestCount}</span>{" "}
          <span className="text-[#5a5a5a]">guests</span>
        </Row>
        <Row icon="🎉">
          {lead.ceremonyType} · {lead.duration}
        </Row>
        {lead.events && lead.events.length > 0 && (
          <Row icon="🎪">{lead.events.join(", ")}</Row>
        )}
        {lead.budget && (
          <Row icon="💰">
            <span>Budget: </span>
            <span className="font-mono text-[13px]">{lead.budget}</span>
            {lead.budgetVenueEst && (
              <span className="text-[#5a5a5a]">
                {" "}
                (estimated {lead.budgetVenueEst})
              </span>
            )}
          </Row>
        )}
        <Row icon="📋">
          {lead.plannerName ? (
            <>
              Planner:{" "}
              <span className="text-[#2C2C2C]">{lead.plannerName}</span>
              {lead.plannerLead && (
                <span className="text-[#5a5a5a]"> ({lead.plannerLead})</span>
              )}
            </>
          ) : (
            <span className="text-[#5a5a5a]">No planner assigned yet</span>
          )}
        </Row>
      </div>
    </VenueCard>
  );
}

function SourceCard({ lead }: { lead: Lead }) {
  return (
    <VenueCard className="p-6" tone="champagne">
      <Eyebrow>Source</Eyebrow>
      <p className="mt-2 text-[14.5px] text-[#2C2C2C]">
        {lead.source}
        {lead.sourceDetail ? ` · ${lead.sourceDetail}` : ""}
      </p>
      {lead.sourceReason && (
        <p
          className="mt-2 text-[13.5px] italic text-[#5a4a30]"
          style={{ fontFamily: "'EB Garamond', serif" }}
        >
          “{lead.sourceReason}”
        </p>
      )}
    </VenueCard>
  );
}

function BrowsingHistoryCard({ lead }: { lead: Lead }) {
  const items = lead.browsed ?? [];
  return (
    <VenueCard className="overflow-hidden">
      <div className="p-6">
        <Eyebrow>Browsing history on your profile</Eyebrow>
        <div className="mt-2 flex items-baseline gap-2">
          <CardTitle>
            <span aria-hidden className="mr-1.5">👀</span>
            Viewed {items.length} wedding showcases
          </CardTitle>
        </div>
        <ol className="mt-4 space-y-3">
          {items.map((b, i) => (
            <BrowsedRow key={b.id} index={i + 1} showcase={b} />
          ))}
        </ol>

        {/* Insight block */}
        {(lead.browsedInsight ||
          (lead.spacesViewedSummary && lead.spacesViewedSummary.length > 0)) && (
          <div
            className="mt-5 rounded-xl px-4 py-3.5"
            style={{ backgroundColor: "#FBF1DF" }}
          >
            {lead.browsedInsight && (
              <p className="text-[13px] text-[#5a4a30]">
                <span aria-hidden className="mr-1.5">📊</span>
                <span className="font-medium text-[#2C2C2C]">
                  Most interested in:
                </span>{" "}
                {lead.browsedInsight}
              </p>
            )}
            {lead.spacesViewedSummary &&
              lead.spacesViewedSummary.length > 0 && (
                <p className="mt-1.5 text-[13px] text-[#5a4a30]">
                  <span aria-hidden className="mr-1.5">🏛</span>
                  <span className="font-medium text-[#2C2C2C]">
                    Spaces viewed:
                  </span>{" "}
                  {lead.spacesViewedSummary.join(", ")}
                </p>
              )}
          </div>
        )}
      </div>
    </VenueCard>
  );
}

function BrowsedRow({
  index,
  showcase,
}: {
  index: number;
  showcase: BrowsedShowcase;
}) {
  return (
    <li className="flex items-baseline justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[13.5px] text-[#2C2C2C]">
          <span className="font-mono text-[11px] text-[#9E8245]">
            {index}.
          </span>{" "}
          <span
            className="text-[15px]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {showcase.coupleNames}
          </span>
          <span className="ml-2 text-[12px] text-[#5a5a5a]">
            ({showcase.ceremonyType}, {showcase.guestCount} guests)
          </span>
        </p>
        <p className="mt-0.5 pl-5 text-[11px] text-[#8a7a5a]">
          Spaces: {showcase.spacesViewed.join(", ")}
        </p>
      </div>
      <span className="shrink-0 font-mono text-[11.5px] text-[#9E8245]">
        {showcase.timeSpentLabel}
      </span>
    </li>
  );
}

function MessageCard({ message }: { message: string }) {
  return (
    <VenueCard className="p-6">
      <Eyebrow>Couple's message</Eyebrow>
      <p
        className="mt-3 text-[15px] leading-relaxed text-[#2C2C2C]"
        style={{ fontFamily: "'EB Garamond', serif" }}
      >
        “{message}”
      </p>
    </VenueCard>
  );
}

function ConversationCard({
  messages,
  lead,
}: {
  messages: ConversationMessage[];
  lead: Lead;
}) {
  return (
    <VenueCard className="p-6">
      <Eyebrow>Conversation</Eyebrow>
      <div className="mt-4 space-y-3">
        {messages.map((m, i) => (
          <MessageBubble key={i} msg={m} />
        ))}
      </div>

      {/* Reply composer */}
      <div
        className="mt-5 rounded-xl border p-4"
        style={{
          borderColor: VENUE_PALETTE.hairline,
          backgroundColor: "#FBF8F2",
        }}
      >
        <textarea
          rows={3}
          placeholder={`Reply to ${lead.coupleNames.split(" & ")[0] ?? "the couple"}…`}
          className="w-full resize-none bg-transparent text-[13.5px] text-[#2C2C2C] placeholder:text-[#8a8a8a] focus:outline-none"
          style={{ fontFamily: "'EB Garamond', serif" }}
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.20em] text-[#9E8245]">
            Signed as Legacy Castle sales
          </span>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors"
            style={{
              backgroundColor: VENUE_PALETTE.charcoal,
              color: "#FAF8F5",
            }}
          >
            Send →
          </button>
        </div>
      </div>
    </VenueCard>
  );
}

function MessageBubble({ msg }: { msg: ConversationMessage }) {
  const fromCouple = msg.from === "couple";
  return (
    <div className={`flex ${fromCouple ? "justify-start" : "justify-end"}`}>
      <div
        className="max-w-[78%] rounded-2xl px-4 py-3"
        style={{
          backgroundColor: fromCouple ? "#FBF1DF" : VENUE_PALETTE.charcoal,
          color: fromCouple ? "#2C2C2C" : "#FAF8F5",
        }}
      >
        <div className="mb-1 flex items-baseline gap-2">
          <span
            className="text-[12px] font-medium"
            style={{
              color: fromCouple ? "#5a4a30" : "rgba(250,248,245,0.88)",
              fontFamily: "'Cormorant Garamond', serif",
            }}
          >
            {msg.author}
          </span>
          <span
            className="font-mono text-[9.5px] uppercase tracking-[0.18em]"
            style={{
              color: fromCouple ? "#9E8245" : "rgba(250,248,245,0.55)",
            }}
          >
            {msg.timestamp}
          </span>
        </div>
        <p
          className="text-[13.5px] leading-relaxed"
          style={{ fontFamily: "'EB Garamond', serif" }}
        >
          {msg.body}
        </p>
      </div>
    </div>
  );
}

function ActionsRow({ lead }: { lead: Lead }) {
  const primary = (() => {
    switch (lead.stage) {
      case "new":
        return "Schedule Tour";
      case "tour":
        return "Send Proposal";
      case "proposal":
        return "Mark as Booked";
      case "booked":
        return "View Wedding";
      case "lost":
        return "Reopen Lead";
    }
  })();

  return (
    <div
      className="sticky bottom-4 z-10 flex flex-wrap items-center gap-2 rounded-2xl border p-3"
      style={{
        backgroundColor: "rgba(255,255,255,0.95)",
        borderColor: VENUE_PALETTE.hairline,
        backdropFilter: "saturate(140%) blur(8px)",
        boxShadow:
          "0 1px 0 rgba(44,44,44,0.02), 0 24px 48px -36px rgba(44,44,44,0.20)",
      }}
    >
      <button
        type="button"
        className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-medium transition-colors"
        style={{
          backgroundColor: VENUE_PALETTE.charcoal,
          color: "#FAF8F5",
        }}
      >
        {primary}
      </button>
      <OutlineBtn>Send Proposal</OutlineBtn>
      <OutlineBtn>Recommend Vendors</OutlineBtn>
      <OutlineBtn>Recommend Planners</OutlineBtn>
      <div className="ml-auto">
        <OutlineBtn>Move to →</OutlineBtn>
      </div>
    </div>
  );
}

function OutlineBtn({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="inline-flex items-center rounded-full border px-3.5 py-1.5 text-[12px] font-medium text-[#2C2C2C] transition-colors hover:bg-[#F5E6D0]"
      style={{ borderColor: "rgba(196,162,101,0.45)" }}
    >
      {children}
    </button>
  );
}

/* ───────────────────── Right column ───────────────────── */

function ContactCard({ lead }: { lead: Lead }) {
  return (
    <VenueCard className="p-5">
      <Eyebrow>Contact</Eyebrow>
      <div className="mt-3 space-y-1.5 text-[13px] text-[#2C2C2C]">
        {lead.email && (
          <p className="flex items-baseline gap-2">
            <span aria-hidden className="text-[11px] text-[#9E8245]">📧</span>
            <a
              href={`mailto:${lead.email}`}
              className="text-[#2C2C2C] hover:text-[#9E8245]"
            >
              {lead.email}
            </a>
          </p>
        )}
        {lead.phone && (
          <p className="flex items-baseline gap-2">
            <span aria-hidden className="text-[11px] text-[#9E8245]">📱</span>
            <a
              href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`}
              className="text-[#2C2C2C] hover:text-[#9E8245]"
            >
              {lead.phone}
            </a>
          </p>
        )}
        {!lead.email && !lead.phone && (
          <p className="text-[12.5px] italic text-[#8a8a8a]">
            No direct contact info yet — reply through the thread below.
          </p>
        )}
      </div>
    </VenueCard>
  );
}

function StageSpecificCard({ lead }: { lead: Lead }) {
  switch (lead.stage) {
    case "new":
      return (
        <VenueCard className="p-5" tone="champagne">
          <Eyebrow>Next steps</Eyebrow>
          <ul className="mt-3 space-y-2 text-[13px] text-[#5a4a30]">
            <li>• Respond within 4 hours for best close rate</li>
            <li>• Offer 2–3 tour slots in their flexible date range</li>
            <li>• Mention Priya & Arjun — they spent longest there</li>
          </ul>
        </VenueCard>
      );
    case "tour":
      return (
        <VenueCard className="p-5">
          <Eyebrow>Tour</Eyebrow>
          <div className="mt-3 space-y-1.5 text-[13px] text-[#2C2C2C]">
            <p>
              <span className="font-mono text-[10.5px] uppercase tracking-[0.20em] text-[#9E8245]">
                When
              </span>{" "}
              {lead.tourDate}
            </p>
            {typeof lead.tourDaysAway === "number" && (
              <p className="font-mono text-[11px] text-[#9E8245]">
                in {lead.tourDaysAway} days
              </p>
            )}
            {lead.tourNotes && (
              <p
                className="mt-2 text-[12.5px] italic text-[#5a5a5a]"
                style={{ fontFamily: "'EB Garamond', serif" }}
              >
                “{lead.tourNotes}”
              </p>
            )}
          </div>
          {lead.spacesToShow && (
            <div className="mt-3">
              <Eyebrow>Spaces to show</Eyebrow>
              <ul className="mt-2 space-y-1 text-[12.5px] text-[#2C2C2C]">
                {lead.spacesToShow.map((s) => (
                  <li key={s.name} className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="grid h-[14px] w-[14px] place-items-center rounded-[3px] text-[9px] font-semibold"
                      style={{
                        backgroundColor: s.checked
                          ? VENUE_PALETTE.gold
                          : "transparent",
                        color: "#FFFFFF",
                        boxShadow: `inset 0 0 0 1px ${s.checked ? VENUE_PALETTE.gold : "rgba(44,44,44,0.25)"}`,
                      }}
                    >
                      {s.checked ? "✓" : ""}
                    </span>
                    {s.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </VenueCard>
      );
    case "proposal":
      return (
        <VenueCard className="p-5">
          <Eyebrow>Proposal</Eyebrow>
          <div className="mt-3 space-y-1.5 text-[13px] text-[#2C2C2C]">
            <p>Sent: {lead.proposalDate}</p>
            <p>
              Amount:{" "}
              <span className="font-mono text-[13px]">
                {lead.proposalAmount}
              </span>
            </p>
            <p>Package: {lead.proposalPackage}</p>
          </div>
          {typeof lead.proposalFollowUpDays === "number" &&
            lead.proposalFollowUpDays >= 3 && (
              <div
                className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-[12px]"
                style={{
                  backgroundColor: "rgba(192, 57, 43, 0.08)",
                  color: VENUE_PALETTE.critical,
                }}
              >
                <span aria-hidden>⚠</span>
                No response — {lead.proposalFollowUpDays}d
              </div>
            )}
        </VenueCard>
      );
    case "booked":
      return (
        <VenueCard className="p-5">
          <Eyebrow>Booking</Eyebrow>
          <div className="mt-3 space-y-1.5 text-[13px] text-[#2C2C2C]">
            <p>
              Dates:{" "}
              <span className="text-[#2C2C2C]">{lead.bookedDates}</span>
            </p>
            <p>
              Amount:{" "}
              <span className="font-mono text-[13px]">
                {lead.bookedAmount}
              </span>
            </p>
            <p>
              Contract: {lead.contractSigned ? "Signed ✓" : "Pending"}
            </p>
            <p>Deposit: {lead.depositPaid ? "Paid ✓" : "Pending"}</p>
            {typeof lead.vendorsBooked === "number" && (
              <p className="font-mono text-[11.5px] text-[#6a6a6a]">
                {lead.vendorsBooked}/{lead.vendorsTotal} vendors booked
              </p>
            )}
          </div>
          {lead.weddingId && (
            <Link
              href={`/venue/weddings/${lead.weddingId}`}
              className="mt-4 inline-flex w-full items-center justify-center rounded-full px-4 py-2 text-[12.5px] font-medium transition-colors"
              style={{
                backgroundColor: VENUE_PALETTE.charcoal,
                color: "#FAF8F5",
              }}
            >
              View Wedding →
            </Link>
          )}
        </VenueCard>
      );
    case "lost":
      return (
        <VenueCard className="p-5">
          <Eyebrow>Lost reason</Eyebrow>
          <p
            className="mt-3 text-[13px] italic text-[#5a5a5a]"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            “{lead.lostReason}”
          </p>
        </VenueCard>
      );
  }
}
