"use client";

// ── Vendor portal (vendor-facing view) ─────────────────────────────────────
// Opens from a tokenised link. Reads the same coordination store the planner
// writes to (localStorage-backed). Mobile-first layout: stacked cards, large
// tap targets, readable at 16px+, no horizontal scroll.

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Car,
  Check,
  CheckCheck,
  Clock,
  FileText,
  Flag,
  MapPin,
  MessageCircle,
  Package,
  Users as UsersIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCoordinationStore } from "@/stores/coordination-store";
import {
  COORDINATION_ROLE_ICON,
  COORDINATION_ROLE_LABEL,
  type CoordinationAssignment,
  type CoordinationUpdate,
  type CoordinationVendor,
  type UpdatePriority,
} from "@/types/coordination";
import {
  formatEventDate,
  formatRelative,
  formatTime,
  formatTimeRange,
} from "@/lib/coordination/format";

const PRIORITY_STYLES: Record<UpdatePriority, string> = {
  normal: "border-border bg-ivory-warm text-ink-muted",
  important: "border-saffron/30 bg-saffron-pale text-saffron",
  urgent: "border-rose/40 bg-rose-pale text-rose",
};

const PRIORITY_LABEL: Record<UpdatePriority, string> = {
  normal: "📋 Normal",
  important: "⚠️ Important",
  urgent: "🔴 URGENT",
};

export function VendorPortal({ token }: { token: string }) {
  const vendor = useCoordinationStore((s) => s.getVendorByToken(token));
  const assignments = useCoordinationStore((s) => s.assignments);
  const updates = useCoordinationStore((s) => s.updatesForVendor);
  const files = useCoordinationStore((s) => s.filesForVendor);
  const markPortalViewed = useCoordinationStore((s) => s.markPortalViewed);
  const confirmAssignment = useCoordinationStore((s) => s.confirmAssignment);
  const askQuestion = useCoordinationStore((s) => s.askQuestion);
  const markUpdateRead = useCoordinationStore((s) => s.markUpdateRead);
  const checkInAssignment = useCoordinationStore((s) => s.checkInAssignment);

  useEffect(() => {
    if (vendor) markPortalViewed(token);
  }, [token, vendor, markPortalViewed]);

  const vendorAssignments = useMemo(() => {
    if (!vendor) return [] as CoordinationAssignment[];
    return [...assignments.filter((a) => a.vendorId === vendor.id)].sort(
      (a, b) => {
        if (a.eventDate !== b.eventDate) {
          return a.eventDate.localeCompare(b.eventDate);
        }
        return (a.callTime ?? "99:99").localeCompare(b.callTime ?? "99:99");
      },
    );
  }, [assignments, vendor]);

  const vendorUpdates = vendor ? updates(vendor.id) : [];
  const vendorFiles = vendor ? files(vendor.id) : [];

  const [pendingQuestion, setPendingQuestion] = useState<Record<string, string>>(
    {},
  );
  const [globalQuestion, setGlobalQuestion] = useState("");
  const [globalAsked, setGlobalAsked] = useState(false);

  if (!vendor) {
    return <PortalNotFound />;
  }

  const allConfirmed =
    vendorAssignments.length > 0 &&
    vendorAssignments.every((a) => a.vendorConfirmed);

  const groupedByDate = groupByDate(vendorAssignments);

  const todayIso = new Date().toISOString().slice(0, 10);
  const todaysAssignments = vendorAssignments.filter(
    (a) => a.eventDate === todayIso,
  );

  return (
    <div className="min-h-screen bg-ivory pb-16">
      <header className="border-b border-gold/10 bg-white px-5 pb-6 pt-7 sm:px-8">
        <div className="mx-auto max-w-xl">
          <p
            className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-gold"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Your Schedule
          </p>
          <h1 className="mt-1.5 font-serif text-[30px] leading-[1.05] text-ink">
            hello, {vendor.contactName ?? vendor.name}.
          </h1>
          <p className="mt-1.5 font-serif text-[15px] italic text-ink-muted">
            everything you need for the wedding — please review and confirm.
          </p>
          <p className="mt-3 flex items-center gap-1.5 text-[12px] text-ink-muted">
            <span className="text-[16px]">
              {COORDINATION_ROLE_ICON[vendor.role]}
            </span>
            <span>{vendor.roleLabel ?? COORDINATION_ROLE_LABEL[vendor.role]}</span>
            {vendor.name !== vendor.contactName ? (
              <span className="before:mx-1.5 before:content-['·'] text-ink-faint">
                {vendor.name}
              </span>
            ) : null}
          </p>
        </div>
      </header>

      <main className="mx-auto flex max-w-xl flex-col gap-6 px-5 py-6 sm:px-8">
        <OverallStatusCard
          status={vendor.overallStatus}
          allConfirmed={allConfirmed}
          onConfirmAll={() => {
            vendorAssignments
              .filter((a) => !a.vendorConfirmed)
              .forEach((a) => confirmAssignment(a.id));
          }}
          onAskGlobal={() => {
            const text = window.prompt(
              "What would you like to ask the wedding team?",
            );
            if (text && text.trim() && vendorAssignments[0]) {
              askQuestion(vendorAssignments[0].id, text.trim());
            }
          }}
        />

        {todaysAssignments.length > 0 ? (
          <section className="rounded-xl border border-gold/20 bg-gold-pale/40 p-4">
            <h2 className="mb-2 text-[10.5px] font-medium uppercase tracking-[0.18em] text-gold">
              On the day
            </h2>
            <div className="flex flex-col gap-2">
              {todaysAssignments.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => checkInAssignment(a.id)}
                  className={cn(
                    "flex items-center justify-between rounded-lg border px-3.5 py-3 text-left transition-colors",
                    a.vendorCheckedInAt
                      ? "border-sage-pale bg-sage-pale/60 text-sage"
                      : "border-gold/25 bg-white text-ink hover:bg-ivory-warm",
                  )}
                >
                  <span className="flex items-center gap-2 text-[13.5px] font-medium">
                    <Flag size={15} strokeWidth={1.8} />
                    {a.vendorCheckedInAt
                      ? `Checked in at ${formatTime(
                          a.vendorCheckedInAt.slice(11, 16),
                        )}`
                      : `I'm here — check in for ${a.eventName}`}
                  </span>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <h2 className="mb-3 text-[10.5px] font-medium uppercase tracking-[0.18em] text-gold">
            Your schedule
          </h2>
          {groupedByDate.length === 0 ? (
            <p className="rounded-lg border border-dashed border-gold/25 bg-white px-4 py-6 text-center font-serif text-[14px] italic text-ink-muted">
              The wedding team hasn't added any assignments yet. Check back
              soon!
            </p>
          ) : (
            <div className="flex flex-col gap-5">
              {groupedByDate.map((day, dayIdx) => (
                <div key={day.date}>
                  <h3 className="mb-2 font-serif text-[17px] text-ink">
                    day {dayIdx + 1}: {formatEventDate(day.date)}
                  </h3>
                  <div className="flex flex-col gap-3">
                    {day.assignments.map((a) => (
                      <AssignmentCard
                        key={a.id}
                        vendor={vendor}
                        assignment={a}
                        pendingQuestion={pendingQuestion[a.id] ?? ""}
                        setPendingQuestion={(val) =>
                          setPendingQuestion((prev) => ({
                            ...prev,
                            [a.id]: val,
                          }))
                        }
                        onConfirm={(notes) => confirmAssignment(a.id, notes)}
                        onAskQuestion={(question) =>
                          askQuestion(a.id, question)
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-[10.5px] font-medium uppercase tracking-[0.18em] text-gold">
            Updates from the wedding team
          </h2>
          {vendorUpdates.length === 0 ? (
            <p className="rounded-lg border border-dashed border-gold/25 bg-white px-4 py-5 text-center text-[12.5px] italic text-ink-muted">
              No updates yet.
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {vendorUpdates.map((u) => (
                <UpdateCard
                  key={u.id}
                  update={u}
                  vendorId={vendor.id}
                  onRead={() => markUpdateRead(u.id, vendor.id)}
                />
              ))}
            </div>
          )}
        </section>

        {vendorFiles.length > 0 ? (
          <section>
            <h2 className="mb-3 text-[10.5px] font-medium uppercase tracking-[0.18em] text-gold">
              Shared files
            </h2>
            <ul className="flex flex-col gap-1.5">
              {vendorFiles.map((f) => (
                <li
                  key={f.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-gold/15 bg-white px-3.5 py-2.5"
                >
                  <div className="flex items-center gap-2">
                    <FileText
                      size={15}
                      strokeWidth={1.6}
                      className="text-ink-muted"
                    />
                    <a
                      href={f.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[13px] text-ink underline-offset-2 hover:underline"
                    >
                      {f.name}
                    </a>
                  </div>
                  {f.description ? (
                    <span className="text-[11px] text-ink-faint">
                      {f.description}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section>
          <h2 className="mb-3 text-[10.5px] font-medium uppercase tracking-[0.18em] text-gold">
            Questions?
          </h2>
          {globalAsked ? (
            <p className="rounded-lg border border-sage-pale bg-sage-pale/40 px-4 py-3 text-[12.5px] text-ink-soft">
              Thanks — we've sent your question to the wedding team. Their
              reply will appear on the relevant assignment above.
            </p>
          ) : (
            <div className="flex flex-col gap-2 rounded-lg border border-gold/15 bg-white px-4 py-3">
              <textarea
                value={globalQuestion}
                onChange={(e) => setGlobalQuestion(e.target.value)}
                rows={3}
                placeholder="Ask the wedding team a question…"
                className="w-full resize-y rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
              />
              <button
                type="button"
                disabled={
                  globalQuestion.trim().length === 0 ||
                  vendorAssignments.length === 0
                }
                onClick={() => {
                  const text = globalQuestion.trim();
                  const first = vendorAssignments[0];
                  if (!text || !first) return;
                  askQuestion(first.id, text);
                  setGlobalQuestion("");
                  setGlobalAsked(true);
                }}
                className="flex items-center gap-1.5 self-end rounded-md bg-ink px-4 py-2 text-[13px] font-medium text-ivory hover:opacity-90 disabled:opacity-40"
              >
                <MessageCircle size={13} strokeWidth={1.8} />
                Send question
              </button>
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-gold/10 bg-white px-5 py-4 text-center text-[11px] text-ink-faint sm:px-8">
        <p>
          Powered by{" "}
          <span className="font-serif italic text-ink-muted">Ananya</span>{" "}
          · Wedding Planning
        </p>
      </footer>
    </div>
  );
}

function PortalNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-ivory px-6 text-center">
      <AlertTriangle size={28} strokeWidth={1.4} className="text-rose" />
      <h1 className="font-serif text-[24px] text-ink">
        This portal link isn't valid.
      </h1>
      <p className="max-w-sm text-[13px] text-ink-muted">
        It may have been removed or the link may be incorrect. Please contact
        the wedding team for a new link.
      </p>
    </div>
  );
}

function OverallStatusCard({
  status,
  allConfirmed,
  onConfirmAll,
  onAskGlobal,
}: {
  status: CoordinationVendor["overallStatus"];
  allConfirmed: boolean;
  onConfirmAll: () => void;
  onAskGlobal: () => void;
}) {
  return (
    <section className="rounded-xl border border-gold/15 bg-white p-4 shadow-sm">
      <h2 className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-gold">
        Overall status
      </h2>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onConfirmAll}
          disabled={allConfirmed}
          className={cn(
            "flex h-12 items-center justify-center gap-1.5 rounded-lg text-[13px] font-medium transition-opacity",
            allConfirmed
              ? "cursor-default bg-sage-pale text-sage"
              : "bg-ink text-ivory hover:opacity-90",
          )}
        >
          <CheckCheck size={14} strokeWidth={1.8} />
          {allConfirmed ? "All confirmed" : "Confirm all"}
        </button>
        <button
          type="button"
          onClick={onAskGlobal}
          className="flex h-12 items-center justify-center gap-1.5 rounded-lg border border-border bg-white text-[13px] text-ink transition-colors hover:bg-ivory-warm"
        >
          <MessageCircle size={14} strokeWidth={1.8} />I have a question
        </button>
      </div>
    </section>
  );
}

function AssignmentCard({
  vendor,
  assignment,
  pendingQuestion,
  setPendingQuestion,
  onConfirm,
  onAskQuestion,
}: {
  vendor: CoordinationVendor;
  assignment: CoordinationAssignment;
  pendingQuestion: string;
  setPendingQuestion: (val: string) => void;
  onConfirm: (notes?: string | null) => void;
  onAskQuestion: (text: string) => void;
}) {
  const [showQuestion, setShowQuestion] = useState(false);

  return (
    <article className="rounded-xl border border-gold/15 bg-white px-4 py-4 shadow-sm">
      <header className="border-b border-border/60 pb-3">
        <p
          className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-gold"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {assignment.eventName}
        </p>
        {assignment.venueName ? (
          <p className="mt-0.5 text-[13px] text-ink-soft">
            {assignment.venueName}
            {assignment.venueAddress ? `, ${assignment.venueAddress}` : ""}
          </p>
        ) : null}
      </header>

      <dl className="mt-3 flex flex-col gap-2 text-[13px] text-ink-soft">
        {assignment.callTime ? (
          <Row
            icon={<MapPin size={14} strokeWidth={1.6} />}
            label="Call time"
            value={formatTime(assignment.callTime)}
          />
        ) : null}
        <Row
          icon={<Clock size={14} strokeWidth={1.6} />}
          label="Service"
          value={formatTimeRange(
            assignment.serviceStart,
            assignment.serviceEnd,
          )}
        />
        {assignment.setupStart || assignment.setupEnd ? (
          <Row
            icon={<Package size={14} strokeWidth={1.6} />}
            label="Setup"
            value={formatTimeRange(
              assignment.setupStart,
              assignment.setupEnd,
            )}
          />
        ) : null}
        {assignment.specificLocation ? (
          <Row
            icon={<MapPin size={14} strokeWidth={1.6} />}
            label="Enter via"
            value={assignment.specificLocation}
          />
        ) : null}
        {assignment.parkingInstructions ? (
          <Row
            icon={<Car size={14} strokeWidth={1.6} />}
            label="Parking"
            value={assignment.parkingInstructions}
          />
        ) : null}
        {assignment.loadInInstructions ? (
          <Row
            icon={<Package size={14} strokeWidth={1.6} />}
            label="Load-in"
            value={assignment.loadInInstructions}
          />
        ) : null}
        {assignment.guestCount != null ? (
          <Row
            icon={<UsersIcon size={14} strokeWidth={1.6} />}
            label="Guests"
            value={String(assignment.guestCount)}
          />
        ) : null}
      </dl>

      {assignment.description ? (
        <div className="mt-3 rounded-lg bg-ivory-warm/50 px-3 py-2.5">
          <p className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
            Your assignment
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
            {assignment.description}
          </p>
        </div>
      ) : null}

      {assignment.specialInstructions ? (
        <div className="mt-2 rounded-lg border border-saffron/30 bg-saffron-pale px-3 py-2.5 text-[12.5px] text-ink-soft">
          <AlertTriangle
            size={13}
            strokeWidth={1.8}
            className="mr-1 inline text-saffron"
          />
          <span className="font-medium text-ink">Note:</span>{" "}
          {assignment.specialInstructions}
        </div>
      ) : null}

      {assignment.vendorQuestion ? (
        <div className="mt-3 rounded-lg border border-rose/25 bg-rose-pale/60 px-3 py-2.5 text-[12.5px] text-ink-soft">
          <p>
            <span className="font-medium text-ink">Your question:</span>{" "}
            {assignment.vendorQuestion}
          </p>
          {assignment.plannerReply ? (
            <p className="mt-2 border-t border-rose/20 pt-2">
              <span className="font-medium text-ink">
                Reply from wedding team:
              </span>{" "}
              {assignment.plannerReply}
            </p>
          ) : (
            <p className="mt-1 italic text-ink-muted">Waiting for a reply…</p>
          )}
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onConfirm()}
          disabled={assignment.vendorConfirmed}
          className={cn(
            "flex h-11 flex-1 items-center justify-center gap-1.5 rounded-lg text-[13px] font-medium transition-opacity",
            assignment.vendorConfirmed
              ? "cursor-default bg-sage-pale text-sage"
              : "bg-ink text-ivory hover:opacity-90",
          )}
        >
          <Check size={14} strokeWidth={2} />
          {assignment.vendorConfirmed ? "Confirmed" : "Confirm"}
        </button>
        <button
          type="button"
          onClick={() => setShowQuestion((v) => !v)}
          className="flex h-11 items-center justify-center gap-1.5 rounded-lg border border-border bg-white px-3 text-[12.5px] text-ink-muted hover:bg-ivory-warm"
        >
          <MessageCircle size={13} strokeWidth={1.8} />
          Question
        </button>
      </div>

      {showQuestion ? (
        <div className="mt-3 flex flex-col gap-2">
          <textarea
            value={pendingQuestion}
            onChange={(e) => setPendingQuestion(e.target.value)}
            rows={3}
            placeholder="e.g. Is there a power outlet near the stage?"
            className="w-full resize-y rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
          />
          <button
            type="button"
            disabled={pendingQuestion.trim().length === 0}
            onClick={() => {
              onAskQuestion(pendingQuestion.trim());
              setShowQuestion(false);
              setPendingQuestion("");
            }}
            className="self-end rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:opacity-90 disabled:opacity-40"
          >
            Send question
          </button>
        </div>
      ) : null}
    </article>
  );
}

function UpdateCard({
  update,
  vendorId,
  onRead,
}: {
  update: CoordinationUpdate;
  vendorId: string;
  onRead: () => void;
}) {
  const unread = !update.readBy.some((r) => r.vendorId === vendorId);
  const [expanded, setExpanded] = useState(unread);

  useEffect(() => {
    if (unread && expanded) {
      onRead();
    }
  }, [unread, expanded, onRead]);

  return (
    <article
      className={cn(
        "rounded-lg border px-3.5 py-3",
        PRIORITY_STYLES[update.priority],
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-start justify-between gap-3 text-left"
      >
        <div>
          <p className="flex items-center gap-2 text-[10.5px] font-medium uppercase tracking-[0.14em]">
            {PRIORITY_LABEL[update.priority]}
            <span className="text-ink-faint">
              · {formatRelative(update.createdAt)}
            </span>
            {unread ? (
              <span className="rounded-full bg-ink px-1.5 py-[1px] text-[9px] text-ivory">
                NEW
              </span>
            ) : null}
          </p>
          <h3 className="mt-1 font-serif text-[15px] text-ink">
            {update.subject}
          </h3>
        </div>
      </button>
      {expanded ? (
        <p className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-ink-soft">
          {update.body}
        </p>
      ) : null}
    </article>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-ink-muted">{icon}</span>
      <div>
        <p className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-faint">
          {label}
        </p>
        <p className="text-[13px] text-ink-soft">{value}</p>
      </div>
    </div>
  );
}

function groupByDate(
  assignments: CoordinationAssignment[],
): { date: string; assignments: CoordinationAssignment[] }[] {
  const map = new Map<string, CoordinationAssignment[]>();
  for (const a of assignments) {
    const list = map.get(a.eventDate) ?? [];
    list.push(a);
    map.set(a.eventDate, list);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, assignments]) => ({ date, assignments }));
}
