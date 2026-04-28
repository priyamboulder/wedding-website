"use client";

// ── Celebration workspace page ──────────────────────────────────────────────
// One component, three configurations: Bachelorette, Bachelor, Welcome Events.
// All three share the same tab layout — only the copy, icon, and seeded values
// differ. Data is static/mock for the prototype; wire to a store later if the
// user decides to persist these.

import {
  CalendarDays,
  CalendarHeart,
  CheckCircle2,
  DollarSign,
  FileText,
  Heart,
  ImageIcon,
  Palette,
  Plus,
  Send,
  ShieldAlert,
  Sparkles,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ExtraActionButton,
  ExtraCanvasShell,
  type ExtraTabDef,
} from "./ExtraCanvasShell";
import { SectionHeader } from "@/components/workspace/blocks/primitives";

// ── Public config — caller picks which celebration to render ───────────────

export type CelebrationType = "bachelorette" | "bachelor" | "welcome";

export interface CelebrationConfig {
  type: CelebrationType;
  eyebrow: string;                 // e.g. "WORKSPACE · CELEBRATIONS"
  icon: LucideIcon;                // title icon
  title: string;                   // e.g. "Bachelorette"
  subtitle: string;                // e.g. "Planning — Scottsdale weekend, 14 guests"
  honoree: string;                 // e.g. "Priya", "Arjun", or "Priya & Arjun"
  organizerRole: string;           // e.g. "Maid of Honor" | "Best Man" | "Host"
  partyRole: string;               // e.g. "Bridesmaid" | "Groomsman" | "Host team"
  partnerName?: string;            // opposite-side partner, for "Priya will love…" copy
  headlineQuestion: string;        // Fraunces hero, e.g. "What's the weekend looking like?"
  headlineParagraph: string;       // supporting paragraph
  statusLine: string;              // sage-accented summary sentence
  metrics: {
    guestsConfirmed: number;
    guestsInvited: number;
    nights: number;
    activities: number;
    budgetTotal: number;
    budgetCollected: number;
  };
  vibeOptions: VibeOption[];
  selectedVibeId: string;
  themeNote: string;
  dressCode: DressCodeRow[];
  preferences: { loves: string[]; avoids: string[] };
  itinerary: ItineraryBlock[];
  guests: GuestRow[];
  inspiration: InspirationTile[];
  documents: DocumentRow[];
}

type VibeOption = { id: string; label: string };

type DressCodeRow = { label: string; detail: string };

type ItineraryBlock = {
  day: string;                     // e.g. "Fri · Jun 14"
  label: string;                   // e.g. "Arrivals & welcome"
  items: { time: string; title: string; note?: string }[];
};

type GuestRow = {
  name: string;
  status: "confirmed" | "invited" | "declined";
  note?: string;                   // "Rooming with Priya", etc.
};

type InspirationTile = {
  id: string;
  label: string;
  tag: string;
};

type DocumentRow = {
  id: string;
  title: string;
  kind: string;                    // "Contract", "Quote", "Receipt", etc.
  status: "signed" | "held" | "review" | "draft";
  note?: string;
};

// ── Tabs ────────────────────────────────────────────────────────────────────

type CelebrationTabId =
  | "plan_vibe"
  | "guest_list"
  | "itinerary"
  | "budget"
  | "documents";

const TABS: ExtraTabDef<CelebrationTabId>[] = [
  { id: "plan_vibe", label: "Plan & Vibe", icon: Sparkles },
  { id: "guest_list", label: "Guest List & RSVP", icon: Users },
  { id: "itinerary", label: "Itinerary", icon: CalendarDays },
  { id: "budget", label: "Budget & Splits", icon: DollarSign },
  { id: "documents", label: "Documents", icon: FileText },
];

// ── Root ────────────────────────────────────────────────────────────────────

export function CelebrationCanvas({ config }: { config: CelebrationConfig }) {
  const inviteLabel =
    config.type === "welcome" ? "Invite co-host" : "Invite co-planner";
  return (
    <ExtraCanvasShell<CelebrationTabId>
      eyebrow={config.eyebrow}
      icon={config.icon}
      title={config.title}
      subtitle={config.subtitle}
      actions={
        <>
          <ExtraActionButton
            icon={<UserPlus size={13} strokeWidth={1.8} />}
            label={inviteLabel}
          />
          <ExtraActionButton
            icon={<Send size={13} strokeWidth={1.8} />}
            label="Send update"
            primary
          />
        </>
      }
      tabs={TABS}
      renderTab={(tab) => <CelebrationTab tab={tab} config={config} />}
    />
  );
}

function CelebrationTab({
  tab,
  config,
}: {
  tab: CelebrationTabId;
  config: CelebrationConfig;
}) {
  switch (tab) {
    case "plan_vibe":
      return <PlanVibeTab config={config} />;
    case "guest_list":
      return <GuestListTab guests={config.guests} />;
    case "itinerary":
      return <ItineraryTab itinerary={config.itinerary} />;
    case "budget":
      return <BudgetTab config={config} />;
    case "documents":
      return <DocumentsTab documents={config.documents} />;
  }
}

// ── Plan & Vibe ─────────────────────────────────────────────────────────────

function PlanVibeTab({ config }: { config: CelebrationConfig }) {
  const { metrics } = config;
  const remaining = metrics.budgetTotal - metrics.budgetCollected;
  const perPerson =
    metrics.guestsInvited > 0
      ? Math.round(metrics.budgetTotal / metrics.guestsInvited)
      : 0;

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow={config.eyebrow.replace(/^WORKSPACE · /, "")}
        title={config.headlineQuestion}
        description={config.headlineParagraph}
      />

      {/* Status card — sage-accented summary */}
      <section className="flex items-start gap-3 rounded-lg border border-sage/40 bg-sage/5 px-5 py-4">
        <Sparkles
          size={16}
          strokeWidth={1.8}
          className="mt-[2px] shrink-0 text-sage"
        />
        <div className="flex-1">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Status
          </p>
          <p className="mt-1 font-serif text-[17px] leading-snug text-ink">
            {config.statusLine}
          </p>
        </div>
      </section>

      {/* Metric strip */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard
          label="Guests"
          value={`${metrics.guestsConfirmed} of ${metrics.guestsInvited}`}
          hint="RSVPs in"
          tone="sage"
        />
        <MetricCard
          label="Nights"
          value={String(metrics.nights)}
          hint="Booked"
          tone="ink"
        />
        <MetricCard
          label="Activities"
          value={String(metrics.activities)}
          hint="Planned"
          tone="ink"
        />
        <MetricCard
          label="Budget"
          value={
            metrics.budgetCollected > 0
              ? `${formatMoney(metrics.budgetCollected)} of ${formatMoney(
                  metrics.budgetTotal,
                )}`
              : `— of ${formatMoney(metrics.budgetTotal)}`
          }
          hint={
            metrics.budgetCollected > 0
              ? `${formatMoney(remaining)} left`
              : `${formatMoney(perPerson)} per person`
          }
          tone={metrics.budgetCollected > 0 ? "gold" : "ink"}
        />
      </section>

      {/* Vibe & theme */}
      <VibePanel config={config} />

      {/* Preferences — loves + avoids */}
      <PreferencesPanel config={config} />

      {/* Dress code */}
      <DressCodePanel dressCode={config.dressCode} />

      {/* Inspiration gallery */}
      <InspirationPanel tiles={config.inspiration} />
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
  tone = "ink",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "ink" | "sage" | "gold" | "rose";
}) {
  const valueTone =
    tone === "sage"
      ? "text-sage"
      : tone === "gold"
        ? "text-gold"
        : tone === "rose"
          ? "text-rose"
          : "text-ink";
  return (
    <div className="rounded-lg border border-border bg-white px-4 py-3">
      <p
        className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
      <p className={cn("mt-1.5 font-serif text-[18px] leading-tight", valueTone)}>
        {value}
      </p>
      {hint && <p className="mt-0.5 text-[11.5px] text-ink-muted">{hint}</p>}
    </div>
  );
}

function VibePanel({ config }: { config: CelebrationConfig }) {
  return (
    <section className="rounded-lg border border-border bg-white p-5">
      <header className="mb-3 flex items-baseline justify-between gap-3">
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Vibe & theme
          </p>
          <h3 className="mt-1 font-serif text-[18px] text-ink">
            {config.themeNote}
          </h3>
        </div>
        <Palette size={16} strokeWidth={1.6} className="text-ink-faint" />
      </header>
      <div className="flex flex-wrap gap-2">
        {config.vibeOptions.map((v) => {
          const selected = v.id === config.selectedVibeId;
          return (
            <span
              key={v.id}
              className={cn(
                "inline-flex items-center rounded-full border px-3 py-1 text-[12px] transition-colors",
                selected
                  ? "border-saffron/60 bg-gold-pale/40 text-ink"
                  : "border-border bg-ivory-warm text-ink-muted hover:text-ink",
              )}
            >
              {v.label}
            </span>
          );
        })}
      </div>
    </section>
  );
}

function PreferencesPanel({ config }: { config: CelebrationConfig }) {
  const prefix =
    config.type === "welcome"
      ? `${config.honoree} would love`
      : `${config.honoree} would love`;
  const avoidsPrefix =
    config.type === "welcome" ? "Please avoid" : "Please avoid";
  return (
    <section className="rounded-lg border border-border bg-white p-5">
      <header className="mb-3">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Honoree preferences
        </p>
        <h3 className="mt-1 font-serif text-[18px] text-ink">
          Little things that matter
        </h3>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <PreferenceColumn
          icon={<Heart size={13} strokeWidth={1.8} className="text-sage" />}
          eyebrow={prefix}
          tone="sage"
          items={config.preferences.loves}
        />
        <PreferenceColumn
          icon={
            <ShieldAlert size={13} strokeWidth={1.8} className="text-rose" />
          }
          eyebrow={avoidsPrefix}
          tone="rose"
          items={config.preferences.avoids}
        />
      </div>
    </section>
  );
}

function PreferenceColumn({
  icon,
  eyebrow,
  tone,
  items,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  tone: "sage" | "rose";
  items: string[];
}) {
  const bg = tone === "sage" ? "bg-sage/5" : "bg-rose/5";
  const border = tone === "sage" ? "border-sage/25" : "border-rose/25";
  return (
    <div className={cn("rounded-md border px-4 py-3", bg, border)}>
      <p
        className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {icon}
        {eyebrow}
      </p>
      <ul className="mt-2 space-y-1.5">
        {items.map((item) => (
          <li key={item} className="text-[13px] leading-snug text-ink">
            · {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DressCodePanel({ dressCode }: { dressCode: DressCodeRow[] }) {
  if (!dressCode.length) return null;
  return (
    <section className="rounded-lg border border-border bg-white p-5">
      <header className="mb-3">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Dress code
        </p>
        <h3 className="mt-1 font-serif text-[18px] text-ink">
          What to pack, day by day
        </h3>
      </header>
      <ul className="divide-y divide-border/40">
        {dressCode.map((row) => (
          <li
            key={row.label}
            className="flex items-baseline gap-4 py-2 first:pt-0 last:pb-0"
          >
            <span
              className="w-32 shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {row.label}
            </span>
            <span className="flex-1 text-[13px] text-ink">{row.detail}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function InspirationPanel({ tiles }: { tiles: InspirationTile[] }) {
  if (!tiles.length) return null;
  return (
    <section className="rounded-lg border border-border bg-white p-5">
      <header className="mb-3 flex items-baseline justify-between">
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Inspiration
          </p>
          <h3 className="mt-1 font-serif text-[18px] text-ink">
            Mood & references
          </h3>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-saffron/40 hover:text-saffron"
        >
          <Plus size={13} strokeWidth={1.8} /> Add reference
        </button>
      </header>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {tiles.map((t) => (
          <figure
            key={t.id}
            className="group overflow-hidden rounded-md border border-border bg-ivory-warm"
          >
            <div className="relative aspect-[4/5] bg-gradient-to-br from-ivory-warm via-ivory-deep to-gold-pale/40">
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon
                  size={28}
                  strokeWidth={1.3}
                  className="text-ink-faint/60"
                />
              </div>
            </div>
            <figcaption className="flex items-center justify-between gap-2 border-t border-border/60 px-3 py-2">
              <span className="truncate text-[12px] text-ink">{t.label}</span>
              <span
                className="shrink-0 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {t.tag}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

// ── Guest list ──────────────────────────────────────────────────────────────

function GuestListTab({ guests }: { guests: GuestRow[] }) {
  const confirmed = guests.filter((g) => g.status === "confirmed").length;
  const invited = guests.length;
  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Guest list & RSVP"
        title={`${confirmed} of ${invited} confirmed`}
        description="Track RSVPs, rooming, and any last-minute swaps. Status flips automatically once a guest responds."
        right={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-saffron/40 hover:text-saffron"
          >
            <Plus size={13} strokeWidth={1.8} /> Add guest
          </button>
        }
      />
      <section className="rounded-lg border border-border bg-white">
        <ul className="divide-y divide-border/60">
          {guests.map((g) => (
            <li
              key={g.name}
              className="flex items-center justify-between gap-3 px-5 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] text-ink">{g.name}</p>
                {g.note && (
                  <p className="mt-0.5 text-[11.5px] text-ink-muted">
                    {g.note}
                  </p>
                )}
              </div>
              <GuestStatusPill status={g.status} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function GuestStatusPill({ status }: { status: GuestRow["status"] }) {
  const cls =
    status === "confirmed"
      ? "bg-sage-pale/60 text-sage"
      : status === "declined"
        ? "bg-rose-pale/60 text-rose"
        : "bg-ivory-warm text-ink-muted";
  const label =
    status === "confirmed" ? "Confirmed" : status === "declined" ? "Declined" : "Invited";
  return (
    <span
      className={cn(
        "rounded-sm px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]",
        cls,
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {label}
    </span>
  );
}

// ── Itinerary ──────────────────────────────────────────────────────────────

function ItineraryTab({ itinerary }: { itinerary: ItineraryBlock[] }) {
  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Itinerary"
        title="Day by day"
        description="A rough plan for the weekend. Drag rows between days once the store is live; for now edits happen in the mock data."
      />
      <div className="space-y-4">
        {itinerary.map((day) => (
          <section
            key={day.day}
            className="rounded-lg border border-border bg-white"
          >
            <header className="flex items-baseline justify-between border-b border-border/60 px-5 py-3">
              <div>
                <p
                  className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-saffron"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {day.day}
                </p>
                <h3 className="mt-1 font-serif text-[16px] text-ink">
                  {day.label}
                </h3>
              </div>
              <CalendarHeart
                size={16}
                strokeWidth={1.6}
                className="text-ink-faint"
              />
            </header>
            <ul className="divide-y divide-border/40">
              {day.items.map((item, i) => (
                <li
                  key={i}
                  className="flex items-baseline gap-4 px-5 py-3"
                >
                  <span
                    className="w-16 shrink-0 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-muted"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {item.time}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] text-ink">{item.title}</p>
                    {item.note && (
                      <p className="mt-0.5 text-[11.5px] text-ink-muted">
                        {item.note}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

// ── Budget & splits ─────────────────────────────────────────────────────────

function BudgetTab({ config }: { config: CelebrationConfig }) {
  const { metrics } = config;
  const remaining = metrics.budgetTotal - metrics.budgetCollected;
  const perPerson =
    metrics.guestsInvited > 0
      ? Math.round(metrics.budgetTotal / metrics.guestsInvited)
      : 0;
  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Budget"
        title="Per-person splits"
        description="Keep the math transparent — every guest sees what they owe and whether they've paid."
      />
      <BudgetPanel
        perPerson={perPerson}
        collected={metrics.budgetCollected}
        remaining={remaining}
        total={metrics.budgetTotal}
        guestsInvited={metrics.guestsInvited}
      />
      <section className="rounded-lg border border-border bg-white">
        <header className="border-b border-border/60 px-5 py-3">
          <h3 className="font-serif text-[15px] text-ink">Splits by guest</h3>
        </header>
        <ul className="divide-y divide-border/40">
          {config.guests.slice(0, 8).map((g) => (
            <li
              key={g.name}
              className="flex items-center justify-between gap-3 px-5 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] text-ink">{g.name}</p>
                <p
                  className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-muted"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Share · {formatMoney(perPerson)}
                </p>
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.12em]",
                  g.status === "confirmed"
                    ? "text-sage"
                    : "text-ink-faint",
                )}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {g.status === "confirmed" && (
                  <CheckCircle2 size={11} strokeWidth={2} />
                )}
                {g.status === "confirmed" ? "Paid" : "Pending"}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function BudgetPanel({
  perPerson,
  collected,
  remaining,
  total,
  guestsInvited,
}: {
  perPerson: number;
  collected: number;
  remaining: number;
  total: number;
  guestsInvited: number;
}) {
  const collectedPct = total > 0 ? Math.min(100, (collected / total) * 100) : 0;
  return (
    <section className="rounded-lg border border-border bg-white p-5">
      <header className="mb-3 flex items-baseline justify-between gap-3">
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Budget
          </p>
          <h3 className="mt-1 font-serif text-[18px] text-ink">
            {formatMoney(collected)} collected of {formatMoney(total)}
          </h3>
        </div>
        <p
          className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Split across {guestsInvited}
        </p>
      </header>

      <div className="relative mb-4 h-[22px] w-full overflow-hidden rounded-md bg-ivory/60">
        <div
          className="absolute inset-y-0 left-0 bg-gold-light/40"
          style={{ width: `100%` }}
        />
        <div
          className="absolute inset-y-0 left-0 bg-ink"
          style={{ width: `${collectedPct}%` }}
        />
      </div>

      <dl className="grid grid-cols-3 gap-3 text-[12px]">
        <Metric
          label="Per-person"
          value={formatMoney(perPerson)}
          hint={`${guestsInvited} guests`}
        />
        <Metric
          label="Collected"
          value={formatMoney(collected)}
          hint={collected > 0 ? "Venmo in" : "Awaiting"}
        />
        <Metric
          label="Remaining"
          value={formatMoney(remaining)}
          hint={remaining > 0 ? "Still to raise" : "Fully funded"}
        />
      </dl>
    </section>
  );
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div>
      <dt
        className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </dt>
      <dd className="mt-1 font-serif text-[16px] leading-tight text-ink">
        {value}
      </dd>
      {hint && (
        <p
          className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

// ── Documents ───────────────────────────────────────────────────────────────

function DocumentsTab({ documents }: { documents: DocumentRow[] }) {
  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Documents"
        title="Contracts, quotes, and receipts"
        description="Everything paper-adjacent — rental agreements, vendor quotes, itineraries you printed for the group."
        right={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-saffron/40 hover:text-saffron"
          >
            <Plus size={13} strokeWidth={1.8} /> Upload
          </button>
        }
      />
      <section className="rounded-lg border border-border bg-white">
        <ul className="divide-y divide-border/60">
          {documents.map((d) => (
            <li
              key={d.id}
              className="flex items-center gap-4 px-5 py-3.5"
            >
              <FileText
                size={16}
                strokeWidth={1.5}
                className="shrink-0 text-ink-faint"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] text-ink">{d.title}</p>
                <p
                  className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-muted"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {d.kind}
                  {d.note ? ` · ${d.note}` : ""}
                </p>
              </div>
              <DocumentStatusPill status={d.status} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function DocumentStatusPill({ status }: { status: DocumentRow["status"] }) {
  const map: Record<
    DocumentRow["status"],
    { cls: string; label: string }
  > = {
    signed: { cls: "bg-sage-pale/60 text-sage", label: "Signed" },
    held: { cls: "bg-gold-pale/60 text-gold", label: "On hold" },
    review: { cls: "bg-rose-pale/60 text-rose", label: "Review" },
    draft: { cls: "bg-ivory-warm text-ink-muted", label: "Draft" },
  };
  const { cls, label } = map[status];
  return (
    <span
      className={cn(
        "shrink-0 rounded-sm px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]",
        cls,
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {label}
    </span>
  );
}

// ── Utilities ──────────────────────────────────────────────────────────────

function formatMoney(dollars: number): string {
  if (dollars === 0) return "$0";
  if (dollars >= 1000) {
    const k = dollars / 1000;
    return k >= 10
      ? `$${Math.round(k)}k`
      : `$${k.toFixed(k % 1 === 0 ? 0 : 1)}k`;
  }
  return `$${dollars.toLocaleString("en-US")}`;
}
