"use client";

// ── Vendors tab — the roster ────────────────────────────────────────────────
// Master list of every vendor in the coordination hub with their status,
// portal link, and quick actions. Pivot point for everything else: clicking
// "View assignments" opens the side panel where the planner edits schedule.

import { useMemo, useState } from "react";
import {
  CheckCheck,
  ClipboardCopy,
  MessageCircle,
  Pencil,
  Plus,
  Send,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCoordinationStore, buildPortalMessage } from "@/stores/coordination-store";
import {
  COORDINATION_ROLE_ICON,
  COORDINATION_ROLE_LABEL,
  type CoordinationVendor,
  type OverallStatus,
} from "@/types/coordination";
import { formatPortalUrl, formatRelative } from "@/lib/coordination/format";
import { useEventsStore } from "@/stores/events-store";
import { AddCoordinationVendorModal } from "../modals/AddCoordinationVendorModal";
import { VendorAssignmentsPanel } from "../modals/VendorAssignmentsPanel";

const STATUS_LABEL: Record<OverallStatus, string> = {
  pending: "Hasn't opened portal yet",
  viewed: "Viewed but not confirmed",
  confirmed: "Confirmed",
  has_questions: "Has a question",
};

const STATUS_DOT: Record<OverallStatus, string> = {
  pending: "bg-ink-faint",
  viewed: "bg-gold",
  confirmed: "bg-sage",
  has_questions: "bg-rose",
};

export function CoordinationVendorsTab() {
  const vendors = useCoordinationStore((s) => s.vendors);
  const assignmentsForVendor = useCoordinationStore((s) => s.assignmentsForVendor);
  useCoordinationStore((s) => s.assignments);
  const removeVendor = useCoordinationStore((s) => s.removeVendor);
  const events = useEventsStore((s) => s.events);

  const coupleNames = useMemo(() => {
    // Couple identity isn't stored in a dedicated surface for the v1 scope;
    // fall back to "your" / first event host. The planner can re-word the
    // generated WhatsApp message before sending.
    return "the couple";
  }, []);

  const [addOpen, setAddOpen] = useState(false);
  const [editVendor, setEditVendor] = useState<CoordinationVendor | null>(null);
  const [panelVendor, setPanelVendor] = useState<CoordinationVendor | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  const handleCopyLink = async (vendor: CoordinationVendor) => {
    const url = formatPortalUrl(vendor.portalToken);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this link:", url);
    }
  };

  const handleWhatsAppShare = (vendor: CoordinationVendor) => {
    const url = formatPortalUrl(vendor.portalToken);
    const msg = buildPortalMessage(vendor, coupleNames, url);
    if (vendor.whatsapp || vendor.phone) {
      const num = (vendor.whatsapp ?? vendor.phone ?? "").replace(/[^0-9]/g, "");
      window.open(
        `https://wa.me/${num}?text=${encodeURIComponent(msg)}`,
        "_blank",
        "noreferrer",
      );
    } else {
      navigator.clipboard.writeText(msg).catch(() => {
        window.prompt("Copy this message:", msg);
      });
    }
  };

  const handleRemove = (vendor: CoordinationVendor) => {
    const ok = window.confirm(
      `Remove ${vendor.name} from the coordination hub? Their portal link will stop working.`,
    );
    if (!ok) return;
    removeVendor(vendor.id);
  };

  if (vendors.length === 0) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-gold/25 bg-gold-pale/10 px-6 py-14 text-center">
        <h2 className="font-serif text-[22px] text-ink">No vendors yet</h2>
        <p className="max-w-md text-[13px] text-ink-muted">
          Add your first vendor to generate a portal link and start
          coordinating. Each vendor gets a personalised URL you can share
          through WhatsApp, SMS, or email.
        </p>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-[12px] font-medium text-ivory hover:opacity-90"
        >
          <Plus size={13} strokeWidth={1.8} />
          Add vendor
        </button>
        <AddCoordinationVendorModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
        />
      </div>
    );
  }

  return (
    <section>
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[12px] font-medium uppercase tracking-[0.14em] text-ink-muted">
          Your vendors
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setBulkOpen(true)}
            className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[11.5px] text-ink-muted transition-colors hover:border-ink/20 hover:text-ink"
          >
            <Send size={12} strokeWidth={1.8} />
            Share all links
          </button>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[11.5px] font-medium text-ivory hover:opacity-90"
          >
            <Plus size={12} strokeWidth={1.8} />
            Add vendor
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-3">
        {vendors.map((vendor) => {
          const icon = COORDINATION_ROLE_ICON[vendor.role];
          const roleLabel =
            vendor.roleLabel ?? COORDINATION_ROLE_LABEL[vendor.role];
          const assignments = assignmentsForVendor(vendor.id);
          const confirmedCount = assignments.filter((a) => a.vendorConfirmed)
            .length;
          const questionCount = assignments.filter(
            (a) => a.vendorHasQuestions && !a.plannerReply,
          ).length;
          return (
            <article
              key={vendor.id}
              className="rounded-lg border border-gold/15 bg-white px-5 py-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-ivory-warm text-[18px]">
                    {icon}
                  </div>
                  <div>
                    <p
                      className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-gold"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {roleLabel}
                    </p>
                    <h3 className="mt-0.5 font-serif text-[18px] text-ink">
                      {vendor.name}
                    </h3>
                    <p className="mt-0.5 text-[12px] text-ink-muted">
                      {vendor.contactName ? vendor.contactName : "—"}
                      {vendor.phone ? ` · ${vendor.phone}` : ""}
                      {vendor.email ? ` · ${vendor.email}` : ""}
                    </p>
                    {vendor.events.length > 0 ? (
                      <p className="mt-1.5 text-[11.5px] text-ink-muted">
                        Events: {vendor.events.join(" · ")}
                      </p>
                    ) : null}

                    <div className="mt-2 flex items-center gap-2 text-[11.5px]">
                      <span
                        className={cn(
                          "inline-block h-1.5 w-1.5 rounded-full",
                          STATUS_DOT[vendor.overallStatus],
                        )}
                      />
                      <span className="text-ink-soft">
                        {STATUS_LABEL[vendor.overallStatus]}
                      </span>
                      {vendor.portalLastViewedAt ? (
                        <span className="text-ink-faint">
                          · viewed {formatRelative(vendor.portalLastViewedAt)}
                        </span>
                      ) : null}
                    </div>

                    {assignments.length > 0 ? (
                      <p className="mt-1 text-[11px] text-ink-faint">
                        {confirmedCount}/{assignments.length} assignments
                        confirmed
                        {questionCount > 0 ? (
                          <span className="ml-2 text-rose">
                            · {questionCount} open question
                            {questionCount === 1 ? "" : "s"}
                          </span>
                        ) : null}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyLink(vendor)}
                    className="flex items-center gap-1.5 rounded-md border border-border bg-white px-2.5 py-1 text-[11px] text-ink-muted hover:border-ink/20 hover:text-ink"
                  >
                    <ClipboardCopy size={11} strokeWidth={1.8} />
                    Copy link
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWhatsAppShare(vendor)}
                    className="flex items-center gap-1.5 rounded-md border border-sage/30 bg-sage-pale/30 px-2.5 py-1 text-[11px] text-sage hover:bg-sage-pale/60"
                  >
                    <MessageCircle size={11} strokeWidth={1.8} />
                    Send WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => setPanelVendor(vendor)}
                    className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1 text-[11px] font-medium text-ivory hover:opacity-90"
                  >
                    <CheckCheck size={11} strokeWidth={1.8} />
                    Assignments
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditVendor(vendor)}
                    className="rounded-md p-1.5 text-ink-muted hover:bg-ivory-warm hover:text-ink"
                    title="Edit"
                  >
                    <Pencil size={12} strokeWidth={1.8} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(vendor)}
                    className="rounded-md p-1.5 text-ink-muted hover:bg-rose-pale/50 hover:text-rose"
                    title="Remove"
                  >
                    <Trash2 size={12} strokeWidth={1.8} />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <AddCoordinationVendorModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
      />
      <AddCoordinationVendorModal
        open={editVendor !== null}
        onClose={() => setEditVendor(null)}
        editVendor={editVendor}
      />
      <VendorAssignmentsPanel
        vendor={panelVendor}
        onClose={() => setPanelVendor(null)}
      />
      {bulkOpen ? (
        <BulkShareModal
          coupleNames={coupleNames}
          onClose={() => setBulkOpen(false)}
        />
      ) : null}
    </section>
  );
}

function BulkShareModal({
  coupleNames,
  onClose,
}: {
  coupleNames: string;
  onClose: () => void;
}) {
  const vendors = useCoordinationStore((s) => s.vendors);
  const [copied, setCopied] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 px-4">
      <div className="max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-xl border border-gold/15 bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-gold/10 bg-white px-6 py-4">
          <div>
            <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-gold">
              Portal links
            </p>
            <h2 className="mt-0.5 font-serif text-[22px] text-ink">
              share portal links.
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-[12px] text-ink-muted hover:text-ink"
          >
            Close
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="mb-4 text-[12.5px] text-ink-muted">
            Each vendor gets a personalised message with their unique portal
            link. Tap copy, paste into WhatsApp/SMS/email, and send.
          </p>
          <div className="flex flex-col gap-3">
            {vendors.map((vendor) => {
              const icon = COORDINATION_ROLE_ICON[vendor.role];
              const url = formatPortalUrl(vendor.portalToken);
              const msg = buildPortalMessage(vendor, coupleNames, url);
              return (
                <div
                  key={vendor.id}
                  className="rounded-lg border border-gold/15 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-serif text-[14px] text-ink">
                      {icon} {vendor.name}
                      {vendor.contactName ? (
                        <span className="font-sans text-[12px] text-ink-muted italic">
                          {" "}
                          — {vendor.contactName}
                        </span>
                      ) : null}
                    </p>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(msg);
                          setCopied(vendor.id);
                          setTimeout(() => setCopied(null), 1500);
                        } catch {
                          window.prompt("Copy message:", msg);
                        }
                      }}
                      className="rounded-md border border-gold/30 bg-gold-pale/30 px-3 py-1 text-[11px] font-medium text-gold hover:bg-gold-pale/50"
                    >
                      {copied === vendor.id ? "Copied!" : "Copy message"}
                    </button>
                  </div>
                  <pre className="mt-2 whitespace-pre-wrap rounded-md bg-ivory px-3 py-2 font-sans text-[11.5px] text-ink-soft">
                    {msg}
                  </pre>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
