"use client";

// ── Guest List tab ─────────────────────────────────────────────────────────
// RSVP tracking + dietary accommodations. Keeps things simple — no room
// blocks (unlike bachelorette), no payment tracking (shower expenses are
// usually absorbed by the host/planners, not split with guests).

import { Check, Minus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBridalShowerStore } from "@/stores/bridal-shower-store";
import type { ShowerGuest, ShowerRsvp } from "@/types/bridal-shower";
import { Section, TextInput, InlineAdd } from "../../bachelorette/ui";

const RSVP_OPTIONS: { value: ShowerRsvp; label: string }[] = [
  { value: "going", label: "Going" },
  { value: "pending", label: "Pending" },
  { value: "cant_make_it", label: "Can't make it" },
];

export function GuestListTab() {
  const guests = useBridalShowerStore((s) => s.guests);
  const addGuest = useBridalShowerStore((s) => s.addGuest);
  const updateGuest = useBridalShowerStore((s) => s.updateGuest);
  const removeGuest = useBridalShowerStore((s) => s.removeGuest);
  const setGuestRsvp = useBridalShowerStore((s) => s.setGuestRsvp);

  const going = guests.filter((g) => g.rsvp === "going").length;
  const pending = guests.filter((g) => g.rsvp === "pending").length;
  const cant = guests.filter((g) => g.rsvp === "cant_make_it").length;

  return (
    <div className="space-y-5">
      <header className="grid grid-cols-3 gap-3">
        <StatCard label="GOING" value={going} tone="sage" />
        <StatCard label="PENDING" value={pending} tone="gold" />
        <StatCard label="CAN'T MAKE IT" value={cant} tone="rose" />
      </header>

      <Section
        eyebrow="GUEST LIST"
        title="Who's coming"
        description="Track RSVPs and dietary needs. Follow up on pending at the 2-weeks-out mark — not before, it's annoying."
      >
        <div className="overflow-hidden rounded-md border border-border">
          <div className="grid grid-cols-[1.5fr_1.2fr_1fr_1.2fr_1.5fr_40px] items-center gap-3 border-b border-border bg-ivory-warm/40 px-3 py-2">
            <Header>Name</Header>
            <Header>Relationship</Header>
            <Header>RSVP</Header>
            <Header>Dietary</Header>
            <Header>Notes</Header>
            <span />
          </div>
          <ul>
            {guests.map((g) => (
              <GuestRow
                key={g.id}
                guest={g}
                onUpdate={(patch) => updateGuest(g.id, patch)}
                onSetRsvp={(r) => setGuestRsvp(g.id, r)}
                onRemove={() => removeGuest(g.id)}
              />
            ))}
          </ul>
        </div>
        <div className="mt-3">
          <InlineAdd
            placeholder="Add guest (e.g. Meera Iyer · Bridesmaid)"
            buttonLabel="Add guest"
            onAdd={(v) => {
              const [name, relationship] = v.split("·").map((s) => s.trim());
              addGuest(name, relationship || "Friend");
            }}
          />
        </div>
      </Section>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "sage" | "gold" | "rose";
}) {
  const bg =
    tone === "sage"
      ? "bg-sage-pale/40"
      : tone === "gold"
        ? "bg-gold-pale/40"
        : "bg-rose-pale/30";
  const border =
    tone === "sage"
      ? "border-sage/30"
      : tone === "gold"
        ? "border-gold-light/40"
        : "border-rose/30";

  return (
    <div className={cn("rounded-md border p-4", bg, border)}>
      <p
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
      <p className="mt-1 font-serif text-[28px] leading-none text-ink">
        {value}
      </p>
    </div>
  );
}

function Header({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </span>
  );
}

function GuestRow({
  guest,
  onUpdate,
  onSetRsvp,
  onRemove,
}: {
  guest: ShowerGuest;
  onUpdate: (patch: Partial<ShowerGuest>) => void;
  onSetRsvp: (r: ShowerRsvp) => void;
  onRemove: () => void;
}) {
  return (
    <li className="grid grid-cols-[1.5fr_1.2fr_1fr_1.2fr_1.5fr_40px] items-center gap-3 border-t border-border/60 px-3 py-2 first:border-0">
      <TextInput
        value={guest.name}
        onChange={(v) => onUpdate({ name: v })}
        placeholder="Name"
      />
      <TextInput
        value={guest.relationship}
        onChange={(v) => onUpdate({ relationship: v })}
        placeholder="Role / relationship"
      />
      <div className="flex items-center gap-1">
        {RSVP_OPTIONS.map((opt) => {
          const active = guest.rsvp === opt.value;
          const icon =
            opt.value === "going" ? (
              <Check size={10} strokeWidth={2.5} />
            ) : opt.value === "cant_make_it" ? (
              <X size={10} strokeWidth={2.5} />
            ) : (
              <Minus size={10} strokeWidth={2.5} />
            );
          const tone =
            opt.value === "going"
              ? "bg-sage-pale/60 text-sage border-sage/40"
              : opt.value === "cant_make_it"
                ? "bg-rose-pale/50 text-rose border-rose/30"
                : "bg-gold-pale/40 text-ink-muted border-gold-light/40";
          return (
            <button
              key={opt.value}
              type="button"
              title={opt.label}
              onClick={() => onSetRsvp(opt.value)}
              className={cn(
                "inline-flex h-6 w-6 items-center justify-center rounded-full border",
                active
                  ? tone
                  : "border-border bg-white text-ink-faint hover:border-saffron/40",
              )}
            >
              {icon}
            </button>
          );
        })}
      </div>
      <TextInput
        value={guest.dietary}
        onChange={(v) => onUpdate({ dietary: v })}
        placeholder="Dietary needs"
      />
      <TextInput
        value={guest.notes}
        onChange={(v) => onUpdate({ notes: v })}
        placeholder="Notes"
      />
      <button
        type="button"
        aria-label="Remove guest"
        onClick={onRemove}
        className="text-ink-faint hover:text-rose"
      >
        <X size={13} strokeWidth={2} />
      </button>
    </li>
  );
}
