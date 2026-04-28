"use client";

// ── Timeline tab — cross-event, cross-vendor production call sheet ─────────

import { useMemo, useState } from "react";
import { useCoordinationStore } from "@/stores/coordination-store";
import {
  COORDINATION_ROLE_ICON,
  type CoordinationAssignment,
  type CoordinationVendor,
} from "@/types/coordination";
import { formatEventDate, formatTime } from "@/lib/coordination/format";
import { AssignmentEditorModal } from "../modals/AssignmentEditorModal";

interface TimelineRow {
  assignment: CoordinationAssignment;
  vendor: CoordinationVendor;
}

interface EventGroup {
  eventName: string;
  rows: TimelineRow[];
}

interface DayGroup {
  date: string;
  events: EventGroup[];
}

function statusDot(assignment: CoordinationAssignment): string {
  if (assignment.vendorConfirmed) return "✅";
  if (assignment.vendorHasQuestions && !assignment.plannerReply) return "❓";
  if (assignment.vendorCheckedInAt) return "🏁";
  return "○";
}

export function CoordinationTimelineTab() {
  const vendors = useCoordinationStore((s) => s.vendors);
  const assignments = useCoordinationStore((s) => s.assignments);

  const [editAssignment, setEditAssignment] =
    useState<CoordinationAssignment | null>(null);

  const vendorById = useMemo(
    () => new Map(vendors.map((v) => [v.id, v])),
    [vendors],
  );

  const days: DayGroup[] = useMemo(() => {
    const byDay = new Map<string, Map<string, TimelineRow[]>>();
    for (const a of assignments) {
      const vendor = vendorById.get(a.vendorId);
      if (!vendor) continue;
      const row: TimelineRow = { assignment: a, vendor };
      const eventMap = byDay.get(a.eventDate) ?? new Map<string, TimelineRow[]>();
      const list = eventMap.get(a.eventName) ?? [];
      list.push(row);
      eventMap.set(a.eventName, list);
      byDay.set(a.eventDate, eventMap);
    }
    return Array.from(byDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, eventMap]) => ({
        date,
        events: Array.from(eventMap.entries()).map(([eventName, rows]) => ({
          eventName,
          rows: rows.sort((x, y) => {
            return (x.assignment.callTime ?? "99:99").localeCompare(
              y.assignment.callTime ?? "99:99",
            );
          }),
        })),
      }));
  }, [assignments, vendorById]);

  if (days.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gold/25 bg-gold-pale/10 px-6 py-14 text-center">
        <h2 className="font-serif text-[22px] text-ink">Nothing scheduled yet</h2>
        <p className="mt-2 text-[13px] text-ink-muted">
          Add assignments to vendors in the Vendors tab and they'll show up
          here as a unified cross-event timeline.
        </p>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-8">
      {days.map((day) => (
        <div key={day.date}>
          <h2 className="mb-3 font-serif text-[22px] text-ink">
            <span className="text-[10.5px] uppercase tracking-[0.18em] text-gold">
              ── {formatEventDate(day.date)} ──
            </span>
          </h2>
          <div className="flex flex-col gap-5">
            {day.events.map((ev) => (
              <article
                key={ev.eventName}
                className="rounded-lg border border-gold/15 bg-white"
              >
                <header className="border-b border-gold/10 bg-ivory-warm/40 px-4 py-2.5">
                  <h3
                    className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-ink-soft"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {ev.eventName}
                  </h3>
                </header>
                <ul className="divide-y divide-border/60">
                  {ev.rows.map(({ assignment, vendor }) => (
                    <li
                      key={assignment.id}
                      className="flex items-start gap-3 px-4 py-2.5 transition-colors hover:bg-ivory-warm/40"
                      onClick={() => setEditAssignment(assignment)}
                      role="button"
                    >
                      <span className="w-[72px] flex-none font-mono text-[12px] text-ink">
                        {formatTime(assignment.callTime)}
                      </span>
                      <span className="w-5 text-[14px]">
                        {COORDINATION_ROLE_ICON[vendor.role]}
                      </span>
                      <div className="flex-1">
                        <p className="text-[12.5px] text-ink">
                          {assignment.description ??
                            `${vendor.roleLabel ?? vendor.name} — call time`}
                        </p>
                        <p className="text-[11px] text-ink-muted">
                          {vendor.name}
                          {assignment.specificLocation ? (
                            <>
                              {" · "}
                              <span>{assignment.specificLocation}</span>
                            </>
                          ) : null}
                        </p>
                      </div>
                      <span
                        className="flex-none text-[13px]"
                        title={
                          assignment.vendorConfirmed
                            ? "Confirmed"
                            : assignment.vendorHasQuestions
                              ? "Has a question"
                              : "Pending"
                        }
                      >
                        {statusDot(assignment)}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      ))}

      <AssignmentEditorModal
        open={editAssignment !== null}
        onClose={() => setEditAssignment(null)}
        vendor={
          editAssignment
            ? (vendorById.get(editAssignment.vendorId) ?? null)
            : null
        }
        assignment={editAssignment}
      />
    </section>
  );
}
