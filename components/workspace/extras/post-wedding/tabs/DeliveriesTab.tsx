"use client";

// ── Deliveries tab ────────────────────────────────────────────────────────
// Track photographer / videographer / album / print deliveries. Auto-resolve
// status (waiting / due_soon / overdue) based on promisedDate vs today.
// Offer a one-click import from the Coordination Hub roster.

import {
  Check,
  CheckCircle2,
  ExternalLink,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { COORDINATION_ROLE_ICON } from "@/types/coordination";
import { useCoordinationStore } from "@/stores/coordination-store";
import { usePostWeddingStore } from "@/stores/post-wedding-store";
import type {
  Delivery,
  DeliverableType,
  DeliveryStatus,
} from "@/types/post-wedding";
import {
  EmptyState,
  PrimaryButton,
  SecondaryButton,
  Section,
  Select,
  TextArea,
  TextInput,
  formatDate,
  relativeDateLabel,
} from "../ui";

const DELIVERABLE_OPTIONS: { value: DeliverableType; label: string }[] = [
  { value: "edited_photos", label: "Edited Photos" },
  { value: "highlight_reel", label: "Highlight Reel" },
  { value: "full_film", label: "Full Wedding Film" },
  { value: "ceremony_film", label: "Ceremony Film" },
  { value: "album_design", label: "Album Design" },
  { value: "printed_album", label: "Printed Album" },
  { value: "raw_files", label: "Raw Files" },
  { value: "engagement_photos", label: "Engagement Photos" },
  { value: "photo_prints", label: "Photo Prints" },
  { value: "save_the_date_video", label: "Save the Date Video" },
  { value: "other", label: "Other" },
];

// Roles most likely to be a deliverable source. Others can still type
// their own role string manually.
const DEFAULT_ROLE_GUESSES: Record<string, DeliverableType> = {
  photographer: "edited_photos",
  videographer: "highlight_reel",
  cake: "other",
};

type EditState =
  | { mode: "idle" }
  | { mode: "new" }
  | { mode: "edit"; id: string }
  | { mode: "receive"; id: string };

export function DeliveriesTab() {
  const deliveries = usePostWeddingStore((s) => s.deliveries);
  const refreshDeliveryStatuses = usePostWeddingStore(
    (s) => s.refreshDeliveryStatuses,
  );
  const [edit, setEdit] = useState<EditState>({ mode: "idle" });

  // Refresh status windows each time the tab mounts so overdue flags are
  // correct even for deliveries created weeks ago.
  useEffect(() => {
    refreshDeliveryStatuses();
  }, [refreshDeliveryStatuses]);

  const pending = deliveries.filter(
    (d) =>
      d.status === "waiting" ||
      d.status === "due_soon" ||
      d.status === "overdue",
  );
  const delivered = deliveries.filter(
    (d) =>
      d.status === "delivered" ||
      d.status === "in_review" ||
      d.status === "complete",
  );

  return (
    <div className="space-y-5">
      <Section
        eyebrow="PHOTO & VIDEO DELIVERIES"
        title="track what's coming and when"
        description="— so you can stop refreshing your inbox every ten minutes. we'll flag anything overdue."
        right={
          <PrimaryButton
            icon={<Plus size={13} strokeWidth={1.8} />}
            onClick={() => setEdit({ mode: "new" })}
          >
            Add delivery
          </PrimaryButton>
        }
      >
        <CoordinationImportPrompt />
      </Section>

      {edit.mode === "new" && (
        <DeliveryEditor
          onSave={() => setEdit({ mode: "idle" })}
          onCancel={() => setEdit({ mode: "idle" })}
        />
      )}

      {deliveries.length === 0 && edit.mode !== "new" && (
        <EmptyState
          title="No deliveries tracked yet"
          body="Add expected photo, video, and album deliveries so you can see them all in one place."
          action={
            <PrimaryButton
              icon={<Plus size={13} strokeWidth={1.8} />}
              onClick={() => setEdit({ mode: "new" })}
            >
              Add your first delivery
            </PrimaryButton>
          }
        />
      )}

      {pending.length > 0 && (
        <div className="space-y-3">
          <SectionLabel>Waiting — {pending.length}</SectionLabel>
          <ul className="space-y-3" role="list">
            {pending.map((d) => (
              <li key={d.id}>
                <DeliveryCard
                  delivery={d}
                  isEditing={edit.mode === "edit" && edit.id === d.id}
                  isReceiving={edit.mode === "receive" && edit.id === d.id}
                  onEdit={() => setEdit({ mode: "edit", id: d.id })}
                  onReceive={() => setEdit({ mode: "receive", id: d.id })}
                  onClose={() => setEdit({ mode: "idle" })}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {delivered.length > 0 && (
        <div className="space-y-3">
          <SectionLabel>Delivered — {delivered.length}</SectionLabel>
          <ul className="space-y-3" role="list">
            {delivered.map((d) => (
              <li key={d.id}>
                <DeliveryCard
                  delivery={d}
                  isEditing={edit.mode === "edit" && edit.id === d.id}
                  isReceiving={false}
                  onEdit={() => setEdit({ mode: "edit", id: d.id })}
                  onReceive={() => {}}
                  onClose={() => setEdit({ mode: "idle" })}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </p>
  );
}

// ── Delivery card ─────────────────────────────────────────────────────────

function DeliveryCard({
  delivery,
  isEditing,
  isReceiving,
  onEdit,
  onReceive,
  onClose,
}: {
  delivery: Delivery;
  isEditing: boolean;
  isReceiving: boolean;
  onEdit: () => void;
  onReceive: () => void;
  onClose: () => void;
}) {
  const deleteDelivery = usePostWeddingStore((s) => s.deleteDelivery);

  if (isEditing) {
    return (
      <DeliveryEditor
        delivery={delivery}
        onSave={onClose}
        onCancel={onClose}
      />
    );
  }

  if (isReceiving) {
    return <ReceiveDeliveryForm delivery={delivery} onClose={onClose} />;
  }

  const iconEmoji = deliveryRoleIcon(delivery.vendorRole);
  const label =
    DELIVERABLE_OPTIONS.find((o) => o.value === delivery.deliverableType)
      ?.label ?? delivery.deliverableType;
  const status = STATUS_BADGE[delivery.status];
  const isDelivered =
    delivery.status === "delivered" ||
    delivery.status === "in_review" ||
    delivery.status === "complete";

  return (
    <div
      className={cn(
        "rounded-lg border bg-white p-4",
        delivery.status === "overdue"
          ? "border-rose/40 bg-rose/5"
          : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-serif text-[16px] leading-snug text-ink">
            {iconEmoji} {delivery.vendorName}
          </p>
          <p
            className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {label}
            {delivery.deliverableDescription
              ? ` · ${delivery.deliverableDescription}`
              : ""}
          </p>

          {!isDelivered && (
            <p className="mt-2 text-[13px] text-ink-muted">
              Promised by:{" "}
              <span className="text-ink">
                {formatDate(delivery.promisedDate) || "no date set"}
              </span>
              {delivery.promisedDate && (
                <>
                  {" "}
                  ·{" "}
                  <span
                    className={cn(
                      delivery.status === "overdue" && "font-medium text-rose",
                    )}
                  >
                    {relativeDateLabel(delivery.promisedDate)}
                  </span>
                </>
              )}
            </p>
          )}

          {isDelivered && (
            <>
              <p className="mt-2 text-[13px] text-ink-muted">
                Delivered: {formatDate(delivery.actualDeliveryDate) || "—"}
                {delivery.fileCount
                  ? ` · ${delivery.fileCount} ${delivery.fileCount === 1 ? "file" : "files"}`
                  : ""}
              </p>
              {delivery.deliveryLink && (
                <p className="mt-1 flex items-center gap-1.5 text-[12.5px]">
                  <ExternalLink size={11} className="text-saffron" />
                  <a
                    href={safeHref(delivery.deliveryLink)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-saffron underline-offset-2 hover:underline"
                  >
                    {delivery.deliveryLink}
                  </a>
                </p>
              )}
              {delivery.deliveryPassword && (
                <p
                  className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  🔑 Password: {delivery.deliveryPassword}
                </p>
              )}
            </>
          )}
          {delivery.notes && (
            <p className="mt-1.5 text-[12.5px] italic text-ink-muted">
              {delivery.notes}
            </p>
          )}

          {!isDelivered && delivery.promisedDate && (
            <TimelineBar
              createdAt={delivery.createdAt}
              promised={delivery.promisedDate}
              overdue={delivery.status === "overdue"}
            />
          )}
        </div>

        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em]",
            status.tone,
          )}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {status.label}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!isDelivered && (
          <PrimaryButton
            size="sm"
            icon={<Check size={12} strokeWidth={1.8} />}
            onClick={onReceive}
          >
            Mark as delivered
          </PrimaryButton>
        )}
        <SecondaryButton size="sm" onClick={onEdit}>
          Edit
        </SecondaryButton>
        <SecondaryButton
          size="sm"
          tone="danger"
          icon={<Trash2 size={12} strokeWidth={1.8} />}
          onClick={() => {
            if (confirm(`Remove delivery from ${delivery.vendorName}?`)) {
              deleteDelivery(delivery.id);
            }
          }}
        >
          Delete
        </SecondaryButton>
      </div>
    </div>
  );
}

const STATUS_BADGE: Record<DeliveryStatus, { label: string; tone: string }> = {
  waiting: { label: "Waiting", tone: "bg-ivory-warm text-ink-muted" },
  due_soon: { label: "Due soon", tone: "bg-gold-pale/60 text-ink" },
  overdue: { label: "Overdue", tone: "bg-rose/15 text-rose" },
  delivered: { label: "Delivered", tone: "bg-sage/20 text-sage" },
  in_review: { label: "In review", tone: "bg-gold-pale/40 text-ink" },
  complete: { label: "Complete", tone: "bg-sage/25 text-sage" },
};

function TimelineBar({
  createdAt,
  promised,
  overdue,
}: {
  createdAt: string;
  promised: string;
  overdue: boolean;
}) {
  const start = new Date(createdAt).getTime();
  const end = new Date(promised).getTime();
  const now = Date.now();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return null;
  }
  const pct = Math.max(0, Math.min(1, (now - start) / (end - start))) * 100;

  return (
    <div className="mt-2.5 h-1 w-full max-w-sm overflow-hidden rounded-full bg-ivory-warm">
      <div
        className={cn(
          "h-full transition-all",
          overdue ? "bg-rose" : "bg-saffron",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function safeHref(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function deliveryRoleIcon(role: string): string {
  return (
    (COORDINATION_ROLE_ICON as Record<string, string>)[role] ?? "📦"
  );
}

// ── Delivery editor ───────────────────────────────────────────────────────

function DeliveryEditor({
  delivery,
  onSave,
  onCancel,
}: {
  delivery?: Delivery;
  onSave: () => void;
  onCancel: () => void;
}) {
  const addDelivery = usePostWeddingStore((s) => s.addDelivery);
  const updateDelivery = usePostWeddingStore((s) => s.updateDelivery);

  const [vendorName, setVendorName] = useState(delivery?.vendorName ?? "");
  const [vendorRole, setVendorRole] = useState(
    delivery?.vendorRole ?? "photographer",
  );
  const [vendorContact, setVendorContact] = useState(
    delivery?.vendorContact ?? "",
  );
  const [deliverableType, setDeliverableType] = useState<DeliverableType>(
    delivery?.deliverableType ??
      DEFAULT_ROLE_GUESSES[vendorRole] ??
      "edited_photos",
  );
  const [description, setDescription] = useState(
    delivery?.deliverableDescription ?? "",
  );
  const [promisedDate, setPromisedDate] = useState(
    delivery?.promisedDate ?? "",
  );
  const [notes, setNotes] = useState(delivery?.notes ?? "");

  function save() {
    if (!vendorName.trim()) return;
    const payload = {
      vendorName: vendorName.trim(),
      vendorRole,
      vendorContact: vendorContact.trim(),
      deliverableType,
      deliverableDescription: description.trim(),
      promisedDate: promisedDate || null,
      notes: notes.trim(),
    };
    if (delivery) {
      updateDelivery(delivery.id, payload);
    } else {
      addDelivery(payload);
    }
    onSave();
  }

  return (
    <div className="rounded-lg border border-saffron/30 bg-ivory-warm/30 p-5">
      <h4 className="mb-4 font-serif text-[16px] leading-snug text-ink">
        {delivery ? "Edit delivery" : "New delivery"}
      </h4>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Vendor / studio">
          <TextInput
            value={vendorName}
            onChange={setVendorName}
            placeholder="Raj Photography Studio"
            autoFocus
          />
        </Field>
        <Field label="Role">
          <TextInput
            value={vendorRole}
            onChange={setVendorRole}
            placeholder="photographer / videographer / album_designer"
          />
        </Field>
        <Field label="Contact">
          <TextInput
            value={vendorContact}
            onChange={setVendorContact}
            placeholder="raj@rajphoto.com"
          />
        </Field>
        <Field label="Promised by">
          <TextInput
            type="date"
            value={promisedDate}
            onChange={setPromisedDate}
          />
        </Field>
        <Field label="Deliverable">
          <Select<DeliverableType>
            value={deliverableType}
            onChange={setDeliverableType}
            options={DELIVERABLE_OPTIONS}
          />
        </Field>
        <Field label="Description">
          <TextInput
            value={description}
            onChange={setDescription}
            placeholder="300+ edited photos from all 4 events"
          />
        </Field>
        <Field label="Notes" full>
          <TextArea
            value={notes}
            onChange={setNotes}
            placeholder="requested extra edits on ceremony portraits"
            rows={2}
          />
        </Field>
      </div>
      <div className="mt-4 flex items-center justify-end gap-2">
        <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
        <PrimaryButton onClick={save} disabled={!vendorName.trim()}>
          {delivery ? "Save changes" : "Add delivery"}
        </PrimaryButton>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={cn("space-y-1", full && "md:col-span-2")}>
      <span
        className="block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

// ── Mark delivered inline form ────────────────────────────────────────────

function ReceiveDeliveryForm({
  delivery,
  onClose,
}: {
  delivery: Delivery;
  onClose: () => void;
}) {
  const markDeliveryReceived = usePostWeddingStore(
    (s) => s.markDeliveryReceived,
  );
  const [link, setLink] = useState(delivery.deliveryLink);
  const [password, setPassword] = useState(delivery.deliveryPassword);
  const [fileCount, setFileCount] = useState<string>(
    delivery.fileCount ? String(delivery.fileCount) : "",
  );
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );

  function save() {
    markDeliveryReceived(delivery.id, {
      link,
      password,
      fileCount: fileCount ? Number(fileCount) : null,
      date: date || undefined,
    });
    onClose();
  }

  return (
    <div className="rounded-lg border border-sage/30 bg-sage/5 p-5">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-sage"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        MARK AS DELIVERED
      </p>
      <h4 className="mt-1 font-serif text-[16px] leading-snug text-ink">
        {delivery.vendorName}
      </h4>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Field label="Delivered on">
          <TextInput type="date" value={date} onChange={setDate} />
        </Field>
        <Field label="File count">
          <TextInput
            type="number"
            value={fileCount}
            onChange={setFileCount}
            placeholder="324"
          />
        </Field>
        <Field label="Gallery link" full>
          <TextInput
            value={link}
            onChange={setLink}
            placeholder="photos.rajphoto.com/priya-aarav"
          />
        </Field>
        <Field label="Gallery password" full>
          <TextInput
            value={password}
            onChange={setPassword}
            placeholder="love2026"
          />
        </Field>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
        <PrimaryButton
          onClick={save}
          icon={<CheckCircle2 size={13} strokeWidth={1.8} />}
        >
          Save & mark delivered
        </PrimaryButton>
      </div>
    </div>
  );
}

// ── Coordination import prompt ────────────────────────────────────────────

function CoordinationImportPrompt() {
  const vendors = useCoordinationStore((s) => s.vendors);
  const deliveries = usePostWeddingStore((s) => s.deliveries);
  const addDelivery = usePostWeddingStore((s) => s.addDelivery);
  const [dismissed, setDismissed] = useState(false);

  const photoVideoVendors = useMemo(
    () =>
      vendors.filter(
        (v) => v.role === "photographer" || v.role === "videographer",
      ),
    [vendors],
  );

  const tracked = new Set(
    deliveries
      .map((d) => d.coordinationVendorId)
      .filter((id): id is string => Boolean(id)),
  );
  const untracked = photoVideoVendors.filter((v) => !tracked.has(v.id));

  if (dismissed || untracked.length === 0) return null;

  function importAll() {
    untracked.forEach((v) => {
      const defaultType: DeliverableType =
        v.role === "videographer" ? "highlight_reel" : "edited_photos";
      addDelivery({
        vendorName: v.name,
        vendorRole: v.role,
        vendorContact: v.email ?? v.phone ?? "",
        coordinationVendorId: v.id,
        deliverableType: defaultType,
        deliverableDescription: "",
        promisedDate: null,
      });
    });
    setDismissed(true);
  }

  return (
    <div className="mt-4 flex items-start gap-3 rounded-lg border border-saffron/30 bg-saffron/5 px-4 py-3">
      <Users
        size={15}
        strokeWidth={1.6}
        className="mt-0.5 shrink-0 text-saffron"
      />
      <div className="flex-1">
        <p className="text-[13px] text-ink">
          we found{" "}
          <strong>
            {untracked.length} photo/video{" "}
            {untracked.length === 1 ? "vendor" : "vendors"}
          </strong>{" "}
          from your coordination hub —{" "}
          {untracked
            .slice(0, 2)
            .map((v) => v.name)
            .join(", ")}
          {untracked.length > 2 ? `, and ${untracked.length - 2} more` : ""}.
          want to set up delivery tracking for them?
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <SecondaryButton size="sm" onClick={() => setDismissed(true)}>
          Skip
        </SecondaryButton>
        <PrimaryButton size="sm" onClick={importAll}>
          Set up tracking
        </PrimaryButton>
      </div>
    </div>
  );
}

