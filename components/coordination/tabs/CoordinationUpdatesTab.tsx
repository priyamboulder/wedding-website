"use client";

// ── Updates tab — broadcast messages ────────────────────────────────────────

import { useMemo, useState } from "react";
import { AlertTriangle, Megaphone, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCoordinationStore } from "@/stores/coordination-store";
import {
  COORDINATION_ROLE_LABEL,
  type CoordinationRole,
  type UpdatePriority,
  type UpdateTargetType,
} from "@/types/coordination";
import { formatRelative } from "@/lib/coordination/format";

const PRIORITY_BADGE: Record<UpdatePriority, string> = {
  normal: "bg-ivory-warm text-ink-muted",
  important: "bg-saffron-pale text-saffron",
  urgent: "bg-rose-pale text-rose",
};

const PRIORITY_ICON: Record<UpdatePriority, string> = {
  normal: "📋",
  important: "⚠️",
  urgent: "🔴",
};

export function CoordinationUpdatesTab() {
  const updates = useCoordinationStore((s) => s.updates);
  const vendors = useCoordinationStore((s) => s.vendors);
  const removeUpdate = useCoordinationStore((s) => s.removeUpdate);
  const [composeOpen, setComposeOpen] = useState(false);

  const vendorById = useMemo(
    () => new Map(vendors.map((v) => [v.id, v])),
    [vendors],
  );

  const recipientsCount = (u: (typeof updates)[number]) => {
    if (u.targetType === "all") return vendors.length;
    if (u.targetType === "specific") return u.targetVendorIds.length;
    if (u.targetType === "event") {
      return vendors.filter(
        (v) => u.targetEvent && v.events.includes(u.targetEvent),
      ).length;
    }
    if (u.targetType === "role") {
      return vendors.filter((v) => v.role === u.targetRole).length;
    }
    return 0;
  };

  return (
    <section>
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[12px] font-medium uppercase tracking-[0.14em] text-ink-muted">
          Updates
        </h2>
        <button
          type="button"
          onClick={() => setComposeOpen(true)}
          disabled={vendors.length === 0}
          className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[11.5px] font-medium text-ivory hover:opacity-90 disabled:opacity-40"
        >
          <Plus size={12} strokeWidth={1.8} />
          New update
        </button>
      </header>

      {updates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gold/25 bg-gold-pale/10 px-6 py-12 text-center">
          <Megaphone
            size={24}
            strokeWidth={1.2}
            className="mx-auto text-gold"
          />
          <h2 className="mt-3 font-serif text-[20px] text-ink">
            No updates sent yet
          </h2>
          <p className="mt-1 text-[12.5px] text-ink-muted">
            Broadcast timeline changes, venue updates, or reminders to all
            vendors or specific ones in a single click.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {updates.map((u) => {
            const total = recipientsCount(u);
            const read = u.readBy.length;
            const unreadVendors = vendors
              .filter((v) => {
                const isRecipient =
                  u.targetType === "all" ||
                  (u.targetType === "specific" &&
                    u.targetVendorIds.includes(v.id)) ||
                  (u.targetType === "event" &&
                    u.targetEvent &&
                    v.events.includes(u.targetEvent)) ||
                  (u.targetType === "role" && v.role === u.targetRole);
                return (
                  isRecipient && !u.readBy.some((r) => r.vendorId === v.id)
                );
              })
              .map((v) => v.name);

            return (
              <article
                key={u.id}
                className="rounded-lg border border-gold/15 bg-white px-5 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em]",
                          PRIORITY_BADGE[u.priority],
                        )}
                      >
                        {PRIORITY_ICON[u.priority]} {u.priority}
                      </span>
                      <span className="text-[11px] text-ink-faint">
                        sent {formatRelative(u.createdAt)}
                      </span>
                    </div>
                    <h3 className="mt-2 font-serif text-[17px] text-ink">
                      {u.subject}
                    </h3>
                    <p className="mt-1.5 whitespace-pre-wrap text-[12.5px] leading-relaxed text-ink-soft">
                      {u.body}
                    </p>

                    {u.attachments.length > 0 ? (
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {u.attachments.map((att, i) => (
                          <li
                            key={i}
                            className="rounded-md bg-ivory-warm px-2 py-0.5 text-[11px] text-ink-muted"
                          >
                            📎 {att.name}
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    <p className="mt-3 text-[11.5px] text-ink-muted">
                      Sent to: {describeTarget(u, vendorById)} ({total})
                      {total > 0 ? (
                        <>
                          {" · "}
                          Read by {read} of {total}
                        </>
                      ) : null}
                    </p>
                    {unreadVendors.length > 0 && unreadVendors.length <= 5 ? (
                      <p className="mt-0.5 text-[11px] italic text-ink-faint">
                        Unread: {unreadVendors.join(", ")}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const ok = window.confirm("Remove this update?");
                      if (ok) removeUpdate(u.id);
                    }}
                    className="rounded-md p-1.5 text-ink-muted hover:bg-rose-pale/60 hover:text-rose"
                    title="Remove update"
                  >
                    <Trash2 size={12} strokeWidth={1.8} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {composeOpen ? (
        <ComposeUpdateModal onClose={() => setComposeOpen(false)} />
      ) : null}
    </section>
  );
}

function describeTarget(
  u: ReturnType<typeof useCoordinationStore.getState>["updates"][number],
  vendorById: Map<string, ReturnType<typeof useCoordinationStore.getState>["vendors"][number]>,
): string {
  if (u.targetType === "all") return "All vendors";
  if (u.targetType === "specific") {
    const names = u.targetVendorIds
      .map((id) => vendorById.get(id)?.name)
      .filter(Boolean);
    return names.join(", ") || "Specific vendors";
  }
  if (u.targetType === "event") {
    return `All vendors for ${u.targetEvent ?? "this event"}`;
  }
  if (u.targetType === "role") {
    return `All ${u.targetRole ? COORDINATION_ROLE_LABEL[u.targetRole] : "role"}s`;
  }
  return "";
}

function ComposeUpdateModal({ onClose }: { onClose: () => void }) {
  const vendors = useCoordinationStore((s) => s.vendors);
  const sendUpdate = useCoordinationStore((s) => s.sendUpdate);

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState<UpdatePriority>("normal");
  const [targetType, setTargetType] = useState<UpdateTargetType>("all");
  const [targetVendorIds, setTargetVendorIds] = useState<string[]>([]);
  const [targetEvent, setTargetEvent] = useState<string>("");
  const [targetRole, setTargetRole] = useState<CoordinationRole>("photographer");

  const eventOptions = useMemo(() => {
    const set = new Set<string>();
    vendors.forEach((v) => v.events.forEach((e) => set.add(e)));
    return Array.from(set);
  }, [vendors]);

  const roleOptions = useMemo(() => {
    const set = new Set<CoordinationRole>();
    vendors.forEach((v) => set.add(v.role));
    return Array.from(set);
  }, [vendors]);

  const canSubmit = subject.trim().length > 0 && body.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    sendUpdate({
      subject,
      body,
      priority,
      targetType,
      targetVendorIds: targetType === "specific" ? targetVendorIds : undefined,
      targetEvent: targetType === "event" ? targetEvent || null : null,
      targetRole: targetType === "role" ? targetRole : null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 px-4">
      <div className="max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-xl border border-gold/15 bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-gold/10 bg-white px-6 py-4">
          <h2 className="font-serif text-[22px] text-ink">send an update.</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-[12px] text-ink-muted hover:text-ink"
          >
            Cancel
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          <Field label="Subject" required>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Sangeet venue changed — please read"
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
            />
          </Field>

          <Field label="Message" required>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              placeholder="Share the update with vendors in plain language. Markdown is supported."
              className="w-full resize-y rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
            />
          </Field>

          <Field label="Priority">
            <div className="flex gap-2">
              {(["normal", "important", "urgent"] as UpdatePriority[]).map(
                (p) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPriority(p)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11.5px] capitalize transition-colors",
                      priority === p
                        ? "border-ink bg-ink text-ivory"
                        : "border-border bg-white text-ink-muted hover:border-ink/25",
                    )}
                  >
                    {p === "urgent" ? (
                      <AlertTriangle size={11} strokeWidth={1.8} />
                    ) : null}
                    {p}
                  </button>
                ),
              )}
            </div>
          </Field>

          <Field label="Send to">
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-[12.5px]">
                <input
                  type="radio"
                  checked={targetType === "all"}
                  onChange={() => setTargetType("all")}
                />
                All vendors ({vendors.length})
              </label>
              <label className="flex items-center gap-2 text-[12.5px]">
                <input
                  type="radio"
                  checked={targetType === "specific"}
                  onChange={() => setTargetType("specific")}
                />
                Specific vendors
              </label>
              {targetType === "specific" ? (
                <div className="ml-6 flex flex-wrap gap-1.5">
                  {vendors.map((v) => {
                    const picked = targetVendorIds.includes(v.id);
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setTargetVendorIds((prev) =>
                            prev.includes(v.id)
                              ? prev.filter((id) => id !== v.id)
                              : [...prev, v.id],
                          );
                        }}
                        className={cn(
                          "rounded-full border px-2.5 py-0.5 text-[11px] transition-colors",
                          picked
                            ? "border-gold bg-gold-pale/40 text-gold"
                            : "border-border bg-white text-ink-muted hover:border-ink/25",
                        )}
                      >
                        {v.name}
                      </button>
                    );
                  })}
                </div>
              ) : null}

              <label className="flex items-center gap-2 text-[12.5px]">
                <input
                  type="radio"
                  checked={targetType === "event"}
                  onChange={() => setTargetType("event")}
                />
                Vendors for a specific event
              </label>
              {targetType === "event" ? (
                <select
                  value={targetEvent}
                  onChange={(e) => setTargetEvent(e.target.value)}
                  className="ml-6 w-fit rounded-md border border-border bg-white px-3 py-1.5 text-[12.5px] text-ink outline-none focus:border-gold"
                >
                  <option value="">(pick an event)</option>
                  {eventOptions.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              ) : null}

              <label className="flex items-center gap-2 text-[12.5px]">
                <input
                  type="radio"
                  checked={targetType === "role"}
                  onChange={() => setTargetType("role")}
                />
                All vendors of a specific role
              </label>
              {targetType === "role" ? (
                <select
                  value={targetRole}
                  onChange={(e) =>
                    setTargetRole(e.target.value as CoordinationRole)
                  }
                  className="ml-6 w-fit rounded-md border border-border bg-white px-3 py-1.5 text-[12.5px] text-ink outline-none focus:border-gold"
                >
                  {roleOptions.map((r) => (
                    <option key={r} value={r}>
                      {COORDINATION_ROLE_LABEL[r]}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>
          </Field>
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-gold/10 bg-white px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-[12px] text-ink-muted hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="rounded-md bg-ink px-4 py-1.5 text-[12px] font-medium text-ivory hover:opacity-90 disabled:opacity-40"
          >
            Send update →
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
        {label} {required ? <span className="text-rose">*</span> : null}
      </span>
      {children}
    </label>
  );
}
