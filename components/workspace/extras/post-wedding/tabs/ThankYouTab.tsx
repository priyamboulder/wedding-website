"use client";

// ── Thank-You Tracker tab ─────────────────────────────────────────────────
// Gift list CRUD, status filters, bulk guest import, AI-assisted drafting of
// a thank-you note via POST /api/post-wedding/thank-you.

import { Check, Edit3, Plus, Sparkles, Trash2, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { usePostWeddingStore } from "@/stores/post-wedding-store";
import { useGuestRosterStore } from "@/stores/guest-roster-store";
import type {
  Gift,
  GiftType,
  ThankYouMethod,
  ThankYouStatus,
} from "@/types/post-wedding";
import {
  EmptyState,
  PillButton,
  PrimaryButton,
  ProgressBar,
  SecondaryButton,
  Section,
  Select,
  TextArea,
  TextInput,
  formatDate,
  formatRupees,
} from "../ui";

const GIFT_TYPE_OPTIONS: { value: GiftType; label: string; icon: string }[] = [
  { value: "cash", label: "Cash", icon: "💰" },
  { value: "check", label: "Check", icon: "📝" },
  { value: "bank_transfer", label: "Bank Transfer", icon: "🏦" },
  { value: "registry_item", label: "Registry Item", icon: "🎁" },
  { value: "physical_gift", label: "Physical Gift", icon: "🎀" },
  { value: "gift_card", label: "Gift Card", icon: "💳" },
  { value: "other", label: "Other", icon: "✨" },
];

const THANK_YOU_METHODS: { value: ThankYouMethod; label: string }[] = [
  { value: "handwritten_card", label: "Handwritten card" },
  { value: "email", label: "Email" },
  { value: "text", label: "Text" },
  { value: "phone_call", label: "Phone call" },
  { value: "in_person", label: "In person" },
];

const STATUS_FILTERS: { value: ThankYouStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "drafted", label: "Drafted" },
  { value: "sent", label: "Sent" },
  { value: "not_needed", label: "Not Needed" },
];

type EditState =
  | { mode: "idle" }
  | { mode: "new" }
  | { mode: "edit"; id: string }
  | { mode: "draft"; id: string };

export function ThankYouTab() {
  const gifts = usePostWeddingStore((s) => s.gifts);
  const [filter, setFilter] = useState<ThankYouStatus | "all">("all");
  const [edit, setEdit] = useState<EditState>({ mode: "idle" });

  const sent = gifts.filter((g) => g.thankYouStatus === "sent").length;
  const pending = gifts.filter((g) => g.thankYouStatus === "pending").length;
  const drafted = gifts.filter((g) => g.thankYouStatus === "drafted").length;

  const filtered = useMemo(() => {
    if (filter === "all") return gifts;
    return gifts.filter((g) => g.thankYouStatus === filter);
  }, [gifts, filter]);

  const cashLike = gifts.filter(
    (g) =>
      (g.giftType === "cash" ||
        g.giftType === "check" ||
        g.giftType === "bank_transfer" ||
        g.giftType === "gift_card") &&
      g.amountRupees,
  );
  const cashTotal = cashLike.reduce((n, g) => n + (g.amountRupees ?? 0), 0);

  return (
    <div className="space-y-5">
      <Section
        eyebrow="THANK-YOU TRACKER"
        title="the sooner you send them, the less guilt you carry."
        description="(we won't judge — it took us three months too.) add every gift as it arrives, draft the note while the moment is fresh, and mark it sent when the card's in the mail."
        right={
          <PrimaryButton
            icon={<Plus size={13} strokeWidth={1.8} />}
            onClick={() => setEdit({ mode: "new" })}
          >
            Add gift
          </PrimaryButton>
        }
      >
        <div className="space-y-4">
          <ProgressBar
            done={sent}
            total={gifts.length}
            label="Progress"
          />
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="mr-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Filter —
            </span>
            {STATUS_FILTERS.map((f) => (
              <PillButton
                key={f.value}
                active={filter === f.value}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </PillButton>
            ))}
          </div>
        </div>
      </Section>

      {edit.mode === "new" && (
        <GiftEditor
          onSave={() => setEdit({ mode: "idle" })}
          onCancel={() => setEdit({ mode: "idle" })}
        />
      )}

      {gifts.length === 0 && edit.mode !== "new" && (
        <>
          <GuestImportPrompt />
          <EmptyState
            title="No gifts tracked yet"
            body="Start adding gifts as they arrive — we'll keep track of who you've thanked and who's still waiting."
            action={
              <PrimaryButton
                icon={<Plus size={13} strokeWidth={1.8} />}
                onClick={() => setEdit({ mode: "new" })}
              >
                Add your first gift
              </PrimaryButton>
            }
          />
        </>
      )}

      {gifts.length > 0 && (
        <ul className="space-y-3" role="list">
          {filtered.map((g) => (
            <li key={g.id}>
              <GiftCard
                gift={g}
                isEditing={edit.mode === "edit" && edit.id === g.id}
                isDrafting={edit.mode === "draft" && edit.id === g.id}
                onEdit={() => setEdit({ mode: "edit", id: g.id })}
                onDraft={() => setEdit({ mode: "draft", id: g.id })}
                onClose={() => setEdit({ mode: "idle" })}
              />
            </li>
          ))}
        </ul>
      )}

      {gifts.length > 0 && (
        <Section eyebrow="SUMMARY" tone="muted">
          <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <SummaryStat label="Total gifts" value={String(gifts.length)} />
            <SummaryStat
              label="Cash-equivalent"
              value={cashTotal > 0 ? formatRupees(cashTotal) : "—"}
            />
            <SummaryStat
              label="Registry items"
              value={String(
                gifts.filter((g) => g.giftType === "registry_item").length,
              )}
            />
            <SummaryStat
              label="Thanked"
              value={`${sent} of ${gifts.length}`}
            />
            <SummaryStat
              label="Drafted, not sent"
              value={String(drafted)}
            />
            <SummaryStat label="Pending" value={String(pending)} />
          </dl>
        </Section>
      )}
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </dt>
      <dd className="mt-0.5 font-serif text-[18px] leading-snug text-ink">
        {value}
      </dd>
    </div>
  );
}

// ── Gift card ─────────────────────────────────────────────────────────────

function GiftCard({
  gift,
  isEditing,
  isDrafting,
  onEdit,
  onDraft,
  onClose,
}: {
  gift: Gift;
  isEditing: boolean;
  isDrafting: boolean;
  onEdit: () => void;
  onDraft: () => void;
  onClose: () => void;
}) {
  const setGiftStatus = usePostWeddingStore((s) => s.setGiftStatus);
  const deleteGift = usePostWeddingStore((s) => s.deleteGift);

  if (isEditing) {
    return <GiftEditor gift={gift} onSave={onClose} onCancel={onClose} />;
  }

  if (isDrafting) {
    return <ThankYouDrafter gift={gift} onClose={onClose} />;
  }

  const typeOption = GIFT_TYPE_OPTIONS.find((o) => o.value === gift.giftType);
  const statusBadge = STATUS_BADGE[gift.thankYouStatus];

  const primaryDescription =
    gift.giftType === "cash" ||
    gift.giftType === "check" ||
    gift.giftType === "bank_transfer" ||
    gift.giftType === "gift_card"
      ? `${typeOption?.icon ?? ""} ${typeOption?.label ?? ""}${gift.amountRupees ? ` · ${formatRupees(gift.amountRupees)}` : ""}`
      : `${typeOption?.icon ?? ""} ${gift.giftDescription || typeOption?.label || ""}`;

  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-serif text-[16px] leading-snug text-ink">
            {gift.guestName}
          </p>
          <p
            className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {[gift.relationship, gift.eventName].filter(Boolean).join(" · ") ||
              "no details"}
          </p>
          <p className="mt-2 text-[13px] text-ink-muted">{primaryDescription}</p>
          {gift.thankYouStatus === "sent" && gift.thankYouSentAt && (
            <p
              className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-sage"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {THANK_YOU_METHODS.find((m) => m.value === gift.thankYouMethod)
                ?.label ?? "Thanked"}{" "}
              · {formatDate(gift.thankYouSentAt)}
            </p>
          )}
          {gift.notes && (
            <p className="mt-1.5 text-[12.5px] italic text-ink-muted">
              {gift.notes}
            </p>
          )}
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em]",
            statusBadge.tone,
          )}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {statusBadge.label}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {gift.thankYouStatus !== "sent" && (
          <>
            <SecondaryButton
              size="sm"
              icon={<Sparkles size={12} strokeWidth={1.8} />}
              onClick={onDraft}
            >
              Draft thank-you
            </SecondaryButton>
            <PrimaryButton
              size="sm"
              icon={<Check size={12} strokeWidth={1.8} />}
              onClick={() => setGiftStatus(gift.id, "sent")}
            >
              Mark sent
            </PrimaryButton>
          </>
        )}
        {gift.thankYouStatus === "sent" && (
          <SecondaryButton
            size="sm"
            onClick={() => setGiftStatus(gift.id, "pending")}
          >
            Mark pending
          </SecondaryButton>
        )}
        <SecondaryButton
          size="sm"
          icon={<Edit3 size={12} strokeWidth={1.8} />}
          onClick={onEdit}
        >
          Edit
        </SecondaryButton>
        <SecondaryButton
          size="sm"
          tone="danger"
          icon={<Trash2 size={12} strokeWidth={1.8} />}
          onClick={() => {
            if (confirm(`Delete the gift from ${gift.guestName}?`)) {
              deleteGift(gift.id);
            }
          }}
        >
          Delete
        </SecondaryButton>
      </div>
    </div>
  );
}

const STATUS_BADGE: Record<ThankYouStatus, { label: string; tone: string }> = {
  pending: { label: "Pending", tone: "bg-ivory-warm text-ink-muted" },
  drafted: { label: "Drafted", tone: "bg-gold-pale/60 text-ink" },
  sent: { label: "Sent", tone: "bg-sage/20 text-sage" },
  not_needed: { label: "Not needed", tone: "bg-stone-100 text-ink-muted" },
};

// ── Gift editor ───────────────────────────────────────────────────────────

function GiftEditor({
  gift,
  onSave,
  onCancel,
}: {
  gift?: Gift;
  onSave: () => void;
  onCancel: () => void;
}) {
  const addGift = usePostWeddingStore((s) => s.addGift);
  const updateGift = usePostWeddingStore((s) => s.updateGift);

  const [guestName, setGuestName] = useState(gift?.guestName ?? "");
  const [relationship, setRelationship] = useState(gift?.relationship ?? "");
  const [giftType, setGiftType] = useState<GiftType>(
    gift?.giftType ?? "physical_gift",
  );
  const [giftDescription, setGiftDescription] = useState(
    gift?.giftDescription ?? "",
  );
  const [amountText, setAmountText] = useState(
    gift?.amountRupees != null ? String(gift.amountRupees) : "",
  );
  const [eventName, setEventName] = useState(gift?.eventName ?? "");
  const [notes, setNotes] = useState(gift?.notes ?? "");

  const isCashLike =
    giftType === "cash" ||
    giftType === "check" ||
    giftType === "bank_transfer" ||
    giftType === "gift_card";

  function save() {
    if (!guestName.trim()) return;
    const amount = amountText ? Number(amountText) : null;
    const payload = {
      guestName: guestName.trim(),
      relationship: relationship.trim(),
      giftType,
      giftDescription: giftDescription.trim(),
      amountRupees: Number.isFinite(amount) ? amount : null,
      eventName: eventName.trim(),
      notes: notes.trim(),
    };
    if (gift) {
      updateGift(gift.id, payload);
    } else {
      addGift(payload);
    }
    onSave();
  }

  return (
    <div className="rounded-lg border border-saffron/30 bg-ivory-warm/30 p-5">
      <h4 className="mb-4 font-serif text-[16px] leading-snug text-ink">
        {gift ? "Edit gift" : "New gift"}
      </h4>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="From">
          <TextInput
            value={guestName}
            onChange={setGuestName}
            placeholder="Auntie Shalini & Uncle Raj"
            autoFocus
          />
        </Field>
        <Field label="Relationship">
          <TextInput
            value={relationship}
            onChange={setRelationship}
            placeholder="Bride's maternal aunt"
          />
        </Field>
        <Field label="Gift type">
          <Select<GiftType>
            value={giftType}
            onChange={setGiftType}
            options={GIFT_TYPE_OPTIONS.map((o) => ({
              value: o.value,
              label: `${o.icon} ${o.label}`,
            }))}
          />
        </Field>
        {isCashLike ? (
          <Field label="Amount (₹)">
            <TextInput
              type="number"
              value={amountText}
              onChange={setAmountText}
              placeholder="51000"
            />
          </Field>
        ) : (
          <Field label="Gift description">
            <TextInput
              value={giftDescription}
              onChange={setGiftDescription}
              placeholder="Gold bangles, KitchenAid mixer, etc."
            />
          </Field>
        )}
        <Field label="Event">
          <TextInput
            value={eventName}
            onChange={setEventName}
            placeholder="Wedding, Reception, Sangeet…"
          />
        </Field>
        <Field label="Notes" full>
          <TextArea
            value={notes}
            onChange={setNotes}
            placeholder="brought it at the reception, gold wrapping"
            rows={2}
          />
        </Field>
      </div>
      <div className="mt-4 flex items-center justify-end gap-2">
        <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
        <PrimaryButton onClick={save} disabled={!guestName.trim()}>
          {gift ? "Save changes" : "Add gift"}
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

// ── Thank-you note drafter with AI assist ────────────────────────────────

function ThankYouDrafter({
  gift,
  onClose,
}: {
  gift: Gift;
  onClose: () => void;
}) {
  const setThankYouNote = usePostWeddingStore((s) => s.setThankYouNote);
  const updateGift = usePostWeddingStore((s) => s.updateGift);
  const setGiftStatus = usePostWeddingStore((s) => s.setGiftStatus);

  const [note, setNote] = useState(gift.thankYouNote);
  const [method, setMethod] = useState<ThankYouMethod>(
    gift.thankYouMethod ?? "handwritten_card",
  );
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/post-wedding/thank-you", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: gift.guestName,
          relationship: gift.relationship,
          giftType: gift.giftType,
          giftDescription: gift.giftDescription,
          amountRupees: gift.amountRupees,
          eventName: gift.eventName,
        }),
      });
      if (!res.ok) throw new Error("Draft failed");
      const data = (await res.json()) as { content: string };
      setNote(data.content);
    } catch (e) {
      setError("Couldn't generate — try again, or just write your own.");
    } finally {
      setGenerating(false);
    }
  }

  function saveDraft() {
    setThankYouNote(gift.id, note);
    updateGift(gift.id, { thankYouMethod: method });
    onClose();
  }

  function markSent() {
    setThankYouNote(gift.id, note);
    updateGift(gift.id, { thankYouMethod: method });
    setGiftStatus(gift.id, "sent");
    onClose();
  }

  return (
    <div className="rounded-lg border border-saffron/30 bg-ivory-warm/30 p-5">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-saffron"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        THANK-YOU NOTE FOR
      </p>
      <h4 className="mt-1 font-serif text-[16px] leading-snug text-ink">
        {gift.guestName}
      </h4>

      <div className="mt-4 flex items-center justify-between gap-2">
        <p className="text-[12.5px] text-ink-muted">
          Write it yourself, or let us draft one you can edit.
        </p>
        <SecondaryButton
          size="sm"
          icon={<Sparkles size={12} strokeWidth={1.8} />}
          onClick={generate}
          disabled={generating}
        >
          {generating ? "Drafting…" : "Help me write this"}
        </SecondaryButton>
      </div>

      <div className="mt-3">
        <TextArea
          value={note}
          onChange={setNote}
          rows={6}
          placeholder="Dear Auntie Shalini & Uncle Raj, …"
        />
        {error && (
          <p className="mt-1 text-[12px] text-rose">{error}</p>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <span
          className="block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Send method
        </span>
        <div className="flex flex-wrap gap-2">
          {THANK_YOU_METHODS.map((m) => (
            <PillButton
              key={m.value}
              active={method === m.value}
              onClick={() => setMethod(m.value)}
            >
              {m.label}
            </PillButton>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
        <SecondaryButton onClick={saveDraft} disabled={!note.trim()}>
          Save draft
        </SecondaryButton>
        <PrimaryButton onClick={markSent} disabled={!note.trim()}>
          Mark as sent
        </PrimaryButton>
      </div>
    </div>
  );
}

// ── Guest import prompt ──────────────────────────────────────────────────

function GuestImportPrompt() {
  const entries = useGuestRosterStore((s) => s.entries);
  const importGuestsAsGifts = usePostWeddingStore((s) => s.importGuestsAsGifts);
  const [imported, setImported] = useState(false);

  if (entries.length === 0 || imported) return null;

  function doImport() {
    const count = importGuestsAsGifts(
      entries.map((g) => ({
        id: g.id,
        name: `${g.first_name} ${g.last_name}`.trim(),
        relationship: g.relationship,
      })),
    );
    setImported(true);
    if (count === 0) {
      alert("Looks like these guests are already on your gift list.");
    }
  }

  return (
    <div className="flex items-start gap-3 rounded-lg border border-saffron/30 bg-saffron/5 px-5 py-4">
      <Users
        size={16}
        strokeWidth={1.6}
        className="mt-0.5 shrink-0 text-saffron"
      />
      <div className="flex-1">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Import from your guest list?
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
          we found {entries.length} {entries.length === 1 ? "guest" : "guests"}{" "}
          on your roster. pre-populate the tracker with their names — you'll
          just fill in what each person gave.
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <SecondaryButton size="sm" onClick={() => setImported(true)}>
          Skip
        </SecondaryButton>
        <PrimaryButton size="sm" onClick={doImport}>
          Import guests
        </PrimaryButton>
      </div>
    </div>
  );
}
