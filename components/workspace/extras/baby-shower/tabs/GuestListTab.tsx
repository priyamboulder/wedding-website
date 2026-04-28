"use client";

// ── Guest List & RSVP tab ─────────────────────────────────────────────────
// Richer than bridal shower: tracks plus-ones, kid count, side (yours/
// partners/shared), contribution status (when the funding model is
// group_fund). Surfaces a surprise-mode banner when isSurprise is on.

import { Link2, Minus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBabyShowerStore } from "@/stores/baby-shower-store";
import type {
  BabyShowerGuest,
  BabyShowerGuestSide,
  BabyShowerRsvp,
} from "@/types/baby-shower";
import {
  InlineAdd,
  Section,
  StatusPill,
  TextInput,
} from "../../bachelorette/ui";

const RSVP_OPTIONS: { value: BabyShowerRsvp; label: string }[] = [
  { value: "not_sent", label: "Not sent" },
  { value: "invited", label: "Invited" },
  { value: "going", label: "Going" },
  { value: "maybe", label: "Maybe" },
  { value: "declined", label: "Declined" },
];

const SIDE_OPTIONS: { value: BabyShowerGuestSide; label: string }[] = [
  { value: "yours", label: "Yours" },
  { value: "partners", label: "Partner's" },
  { value: "shared", label: "Shared" },
];

export function GuestListTab() {
  const guests = useBabyShowerStore((s) => s.guests);
  const plan = useBabyShowerStore((s) => s.plan);
  const funding = useBabyShowerStore((s) => s.funding);
  const parentName = useBabyShowerStore((s) => s.parentName);
  const addGuest = useBabyShowerStore((s) => s.addGuest);
  const updateGuest = useBabyShowerStore((s) => s.updateGuest);
  const removeGuest = useBabyShowerStore((s) => s.removeGuest);
  const setGuestRsvp = useBabyShowerStore((s) => s.setGuestRsvp);

  const invited = guests.length;
  const going = guests.filter((g) => g.rsvp === "going").length;
  const maybe = guests.filter((g) => g.rsvp === "maybe").length;
  const declined = guests.filter((g) => g.rsvp === "declined").length;
  const notYet = guests.filter((g) =>
    g.rsvp === "not_sent" || g.rsvp === "invited",
  ).length;
  const totalHeads =
    guests
      .filter((g) => g.rsvp === "going")
      .reduce((s, g) => s + 1 + g.plusOnes + g.kidsCount, 0);

  const showContributions = funding === "group_fund";

  return (
    <div className="space-y-5">
      <header className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard label="INVITED" value={invited} />
        <StatCard label="GOING" value={going} tone="sage" />
        <StatCard label="NOT YET" value={notYet} tone="gold" />
        <StatCard label="MAYBE" value={maybe} tone="muted" />
        <StatCard label="DECLINED" value={declined} tone="rose" />
      </header>

      <div className="rounded-md border border-border bg-ivory-warm/40 px-4 py-3 text-[12.5px] text-ink-muted">
        Total expected heads (going + plus-ones + kids):{" "}
        <span className="font-medium text-ink">{totalHeads}</span>
      </div>

      {plan.isSurprise && (
        <div className="rounded-md border border-rose/40 bg-rose-pale/30 px-4 py-3 text-[13px] text-ink">
          🤫 This is a surprise shower for {parentName}. Invites include a
          confidentiality banner — please don't mention it to them.
        </div>
      )}

      <Section
        eyebrow="GUEST LIST"
        title="Who's coming"
        description="Email, dietary needs, accessibility — all inline. Use the share link button to collect RSVPs without chasing."
        right={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted hover:border-saffron/40 hover:text-ink"
          >
            <Link2 size={12} strokeWidth={1.8} />
            Share RSVP link
          </button>
        }
      >
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-border bg-ivory-warm/40 text-left">
                <Th>Name</Th>
                <Th>Group</Th>
                <Th>Side</Th>
                <Th>RSVP</Th>
                <Th>+1 / Kids</Th>
                <Th>Dietary</Th>
                {showContributions && <Th>Contribution</Th>}
                <Th aria-label="row actions" />
              </tr>
            </thead>
            <tbody>
              {guests.map((g) => (
                <GuestRow
                  key={g.id}
                  guest={g}
                  showContributions={showContributions}
                  onUpdate={(patch) => updateGuest(g.id, patch)}
                  onSetRsvp={(r) => setGuestRsvp(g.id, r)}
                  onRemove={() => removeGuest(g.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3">
          <InlineAdd
            placeholder="Add guest (e.g. Aanya Mehta · Friends)"
            buttonLabel="Add guest"
            onAdd={(v) => {
              const [name, tag] = v.split("·").map((s) => s.trim());
              addGuest(name, tag || "Friends");
            }}
          />
        </div>
      </Section>
    </div>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────

function GuestRow({
  guest,
  showContributions,
  onUpdate,
  onSetRsvp,
  onRemove,
}: {
  guest: BabyShowerGuest;
  showContributions: boolean;
  onUpdate: (patch: Partial<BabyShowerGuest>) => void;
  onSetRsvp: (rsvp: BabyShowerRsvp) => void;
  onRemove: () => void;
}) {
  return (
    <tr className="border-b border-border/60 last:border-b-0">
      <Td>
        <TextInput
          value={guest.name}
          onChange={(v) => onUpdate({ name: v })}
          placeholder="Name"
        />
      </Td>
      <Td>
        <TextInput
          value={guest.groupTag}
          onChange={(v) => onUpdate({ groupTag: v })}
          placeholder="Family · Friends · Coworkers"
        />
      </Td>
      <Td>
        <select
          value={guest.side}
          onChange={(e) =>
            onUpdate({ side: e.target.value as BabyShowerGuestSide })
          }
          className="rounded-md border border-border bg-white px-2 py-1 text-[12.5px] text-ink focus:border-saffron/60 focus:outline-none"
        >
          {SIDE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Td>
      <Td>
        <select
          value={guest.rsvp}
          onChange={(e) => onSetRsvp(e.target.value as BabyShowerRsvp)}
          className={cn(
            "rounded-md border px-2 py-1 text-[12.5px] focus:outline-none",
            guest.rsvp === "going"
              ? "border-sage/40 bg-sage-pale/40 text-sage"
              : guest.rsvp === "declined"
                ? "border-rose/40 bg-rose-pale/40 text-rose"
                : guest.rsvp === "maybe"
                  ? "border-gold/40 bg-gold-pale/40 text-gold"
                  : "border-border bg-white text-ink",
          )}
        >
          {RSVP_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Td>
      <Td>
        <div className="flex items-center gap-1.5">
          <CountStepper
            value={guest.plusOnes}
            onChange={(n) => onUpdate({ plusOnes: n })}
            label="+1"
          />
          <CountStepper
            value={guest.kidsCount}
            onChange={(n) => onUpdate({ kidsCount: n })}
            label="kids"
          />
        </div>
      </Td>
      <Td>
        <TextInput
          value={guest.dietary}
          onChange={(v) => onUpdate({ dietary: v })}
          placeholder="Veg · GF · Vegan"
        />
      </Td>
      {showContributions && (
        <Td>
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-ink-faint">$</span>
            <TextInput
              type="number"
              value={String(guest.contributionCents / 100)}
              onChange={(v) =>
                onUpdate({
                  contributionCents: Math.round(Number(v) * 100 || 0),
                  contributionStatus:
                    Number(v) > 0 ? "pledged" : "none",
                })
              }
              className="max-w-[90px]"
            />
            {guest.contributionStatus === "paid" && (
              <StatusPill tone="sage" label="Paid" />
            )}
            {guest.contributionStatus === "pledged" && (
              <StatusPill tone="gold" label="Pledged" />
            )}
          </div>
        </Td>
      )}
      <Td>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove guest"
          className="text-ink-faint hover:text-rose"
        >
          <Trash2 size={13} strokeWidth={1.6} />
        </button>
      </Td>
    </tr>
  );
}

function CountStepper({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-1.5 py-0.5 text-[11.5px]">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="text-ink-faint hover:text-ink"
        aria-label={`decrease ${label}`}
      >
        <Minus size={10} strokeWidth={2} />
      </button>
      <span className="min-w-[14px] text-center text-ink">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="text-ink-faint hover:text-ink"
        aria-label={`increase ${label}`}
      >
        +
      </button>
      <span className="pl-0.5 text-[10px] text-ink-faint">{label}</span>
    </div>
  );
}

// ── Header stat card + table atoms ────────────────────────────────────────

function StatCard({
  label,
  value,
  tone = "ink",
}: {
  label: string;
  value: number;
  tone?: "sage" | "gold" | "rose" | "muted" | "ink";
}) {
  const accent =
    tone === "sage"
      ? "text-sage"
      : tone === "gold"
        ? "text-gold"
        : tone === "rose"
          ? "text-rose"
          : tone === "muted"
            ? "text-ink-muted"
            : "text-ink";
  return (
    <div className="rounded-md border border-border bg-white p-4">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
      <p className={cn("mt-1 font-serif text-[26px] leading-none", accent)}>
        {value}
      </p>
    </div>
  );
}

function Th({
  children,
  ...rest
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      {...rest}
      className="whitespace-nowrap px-3 py-2 text-left font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2 align-middle text-[13px] text-ink">{children}</td>;
}
