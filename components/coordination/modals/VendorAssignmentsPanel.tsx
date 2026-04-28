"use client";

import { useState } from "react";
import { Plus, Reply, X } from "lucide-react";
import { useCoordinationStore } from "@/stores/coordination-store";
import type {
  CoordinationAssignment,
  CoordinationVendor,
} from "@/types/coordination";
import {
  formatEventDate,
  formatTime,
  formatTimeRange,
} from "@/lib/coordination/format";
import { AssignmentEditorModal } from "./AssignmentEditorModal";

export function VendorAssignmentsPanel({
  vendor,
  onClose,
}: {
  vendor: CoordinationVendor | null;
  onClose: () => void;
}) {
  const assignmentsForVendor = useCoordinationStore((s) => s.assignmentsForVendor);
  const replyToQuestion = useCoordinationStore((s) => s.replyToQuestion);
  // Subscribe so the panel updates live when assignments change.
  useCoordinationStore((s) => s.assignments);

  const [editing, setEditing] = useState<CoordinationAssignment | null>(null);
  const [creating, setCreating] = useState(false);
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});

  if (!vendor) return null;

  const assignments = assignmentsForVendor(vendor.id);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-ink/25" onClick={onClose} />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-gold/10 px-6 py-5">
          <div>
            <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-gold">
              {vendor.roleLabel ?? vendor.role}
            </p>
            <h2 className="mt-1 font-serif text-[24px] text-ink">
              {vendor.name}
            </h2>
            {vendor.contactName ? (
              <p className="mt-0.5 text-[13px] text-ink-muted">
                {vendor.contactName}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-ink-muted transition-colors hover:bg-ivory-warm hover:text-ink"
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-[12px] font-medium uppercase tracking-[0.14em] text-ink-muted">
              Assignments ({assignments.length})
            </h3>
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[11.5px] font-medium text-ivory hover:opacity-90"
            >
              <Plus size={12} strokeWidth={1.8} />
              Add assignment
            </button>
          </div>

          {assignments.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gold/25 bg-gold-pale/10 px-5 py-10 text-center">
              <p className="font-serif text-[14px] italic text-ink-muted">
                No assignments yet — add the first one to start building this
                vendor's schedule.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {assignments.map((a) => (
                <article
                  key={a.id}
                  className="rounded-lg border border-gold/15 bg-white px-4 py-3.5"
                >
                  <header className="flex items-start justify-between gap-3">
                    <div>
                      <p
                        className="text-[10px] font-medium uppercase tracking-[0.14em] text-gold"
                        style={{ fontFamily: "var(--font-sans)" }}
                      >
                        {formatEventDate(a.eventDate)}
                      </p>
                      <h4 className="mt-0.5 font-serif text-[16px] text-ink">
                        {a.eventName}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      {a.vendorConfirmed ? (
                        <span className="rounded-full bg-sage-pale/70 px-2 py-0.5 text-[10px] font-medium text-sage">
                          confirmed
                        </span>
                      ) : a.vendorHasQuestions && !a.plannerReply ? (
                        <span className="rounded-full bg-rose-pale px-2 py-0.5 text-[10px] font-medium text-rose">
                          question
                        </span>
                      ) : (
                        <span className="rounded-full bg-ivory-warm px-2 py-0.5 text-[10px] font-medium text-ink-muted">
                          pending
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setEditing(a)}
                        className="text-[11px] text-ink-muted underline-offset-2 hover:text-ink hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                  </header>

                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[12px]">
                    <InfoLine label="Call" value={formatTime(a.callTime)} />
                    <InfoLine
                      label="Service"
                      value={formatTimeRange(a.serviceStart, a.serviceEnd)}
                    />
                    {a.setupStart || a.setupEnd ? (
                      <InfoLine
                        label="Setup"
                        value={formatTimeRange(a.setupStart, a.setupEnd)}
                      />
                    ) : null}
                    {a.breakdownStart ? (
                      <InfoLine
                        label="Breakdown"
                        value={formatTime(a.breakdownStart)}
                      />
                    ) : null}
                    {a.venueName ? (
                      <InfoLine
                        label="Venue"
                        value={a.venueName}
                        wide
                      />
                    ) : null}
                    {a.specificLocation ? (
                      <InfoLine
                        label="Location"
                        value={a.specificLocation}
                        wide
                      />
                    ) : null}
                    {a.guestCount != null ? (
                      <InfoLine
                        label="Guests"
                        value={String(a.guestCount)}
                      />
                    ) : null}
                  </dl>

                  {a.description ? (
                    <p className="mt-3 border-t border-border/70 pt-3 text-[12.5px] leading-relaxed text-ink-soft">
                      {a.description}
                    </p>
                  ) : null}

                  {a.specialInstructions ? (
                    <div className="mt-3 rounded-md border border-saffron-pale bg-saffron-pale/40 px-3 py-2 text-[11.5px] text-ink-soft">
                      <span className="font-medium text-ink">Note:</span>{" "}
                      {a.specialInstructions}
                    </div>
                  ) : null}

                  {a.vendorNotes ? (
                    <div className="mt-3 rounded-md border border-sage-pale bg-sage-pale/40 px-3 py-2 text-[11.5px] text-ink-soft">
                      <span className="font-medium text-ink">
                        Vendor left a note:
                      </span>{" "}
                      {a.vendorNotes}
                    </div>
                  ) : null}

                  {a.vendorQuestion ? (
                    <div className="mt-3 flex flex-col gap-2 rounded-md border border-rose-pale bg-rose-pale/50 px-3 py-2.5 text-[12px]">
                      <p>
                        <span className="font-medium text-ink">Question:</span>{" "}
                        {a.vendorQuestion}
                      </p>
                      {a.plannerReply ? (
                        <p className="text-ink-soft">
                          <span className="font-medium text-ink">
                            Your reply:
                          </span>{" "}
                          {a.plannerReply}
                        </p>
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          <textarea
                            value={replyDraft[a.id] ?? ""}
                            onChange={(e) =>
                              setReplyDraft((prev) => ({
                                ...prev,
                                [a.id]: e.target.value,
                              }))
                            }
                            rows={2}
                            placeholder="Type a reply…"
                            className="w-full resize-y rounded-md border border-border bg-white px-2.5 py-1.5 text-[12px] text-ink outline-none focus:border-gold"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const text = replyDraft[a.id]?.trim();
                              if (!text) return;
                              replyToQuestion(a.id, text);
                              setReplyDraft((prev) => ({
                                ...prev,
                                [a.id]: "",
                              }));
                            }}
                            className="flex items-center gap-1.5 self-end rounded-md bg-ink px-2.5 py-1 text-[11px] font-medium text-ivory hover:opacity-90"
                          >
                            <Reply size={11} strokeWidth={1.8} />
                            Send reply
                          </button>
                        </div>
                      )}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </div>
      </aside>

      <AssignmentEditorModal
        open={creating || editing !== null}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        vendor={vendor}
        assignment={editing}
      />
    </>
  );
}

function InfoLine({
  label,
  value,
  wide,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <dt className="text-[9.5px] font-medium uppercase tracking-[0.14em] text-ink-faint">
        {label}
      </dt>
      <dd className="text-[12px] text-ink-soft">{value}</dd>
    </div>
  );
}
