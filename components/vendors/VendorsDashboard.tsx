"use client";

// ── Vendors dashboard ──────────────────────────────────────────────────────
// Two-tier landing for /vendors:
//   1. Essentials  — 8 collapsed category rows, the core team every wedding needs
//   2. Experiences — 4-col grid of moment-specific add-ons (boba cart, dhol, …)
// Replaces the old MyVendorsView grid as the default landing. The wedding
// context strip up top mirrors AIWeddingContextBar's data sources but renders
// as a single horizontal row so the page reads lighter.

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Calendar, MapPin, Users, Wallet, Sparkles } from "lucide-react";
import { TopNav } from "@/components/shell/TopNav";
import { useVenueStore } from "@/stores/venue-store";
import { useEventsStore } from "@/stores/events-store";
import { useChecklistStore } from "@/stores/checklist-store";
import {
  deriveWeddingContext,
  formatBudgetHeadline,
} from "@/lib/vendors/ai-recommendations";
import {
  ESSENTIAL_CATEGORIES,
  EXPERIENCES,
  EXPERIENCES_TOTAL,
  EXPERIENCES_HIDDEN_HINT,
  type ExperienceCategory,
} from "@/lib/vendors/data";
import { EssentialRow } from "./EssentialRow";
import { ExperienceTile } from "./ExperienceTile";

const EXPERIENCE_FILTERS: Array<{
  id: "all" | ExperienceCategory;
  label: string;
}> = [
  { id: "all", label: "All" },
  { id: "food-drink", label: "Food & drink" },
  { id: "entertainment", label: "Entertainment" },
  { id: "decor-moments", label: "Décor moments" },
];

export function VendorsDashboard() {
  const router = useRouter();
  const venueProfile = useVenueStore((s) => s.profile);
  const coupleContext = useEventsStore((s) => s.coupleContext);
  const events = useEventsStore((s) => s.events);
  const weddingDate = useChecklistStore((s) => s.weddingDate);

  const ctx = useMemo(
    () => deriveWeddingContext({ venueProfile, coupleContext, events }),
    [venueProfile, coupleContext, events],
  );

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | ExperienceCategory>("all");

  const filteredEssentials = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ESSENTIAL_CATEGORIES;
    return ESSENTIAL_CATEGORIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.topPick.name.toLowerCase().includes(q),
    );
  }, [search]);

  const filteredExperiences = useMemo(
    () =>
      filter === "all"
        ? EXPERIENCES
        : EXPERIENCES.filter((e) => e.category === filter),
    [filter],
  );

  const openEssentials = ESSENTIAL_CATEGORIES.filter(
    (c) => c.status === "open",
  ).length;
  const addedExperiences = EXPERIENCES.filter((e) => e.added).length;

  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <TopNav />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 lg:px-8">
        <ContextStrip
          ctx={ctx}
          weddingDate={weddingDate}
          onSpinRoulette={() => router.push("/vendors?tab=roulette")}
        />

        <Section
          title="The essentials"
          subtitle="The core team every wedding needs"
          right={<SearchInput value={search} onChange={setSearch} />}
        >
          <div className="flex flex-col gap-2">
            {filteredEssentials.map((c) => (
              <EssentialRow key={c.slug} category={c} />
            ))}
          </div>
        </Section>

        <Section
          title="Experiences & moments"
          subtitle="The little touches that make guests remember the night"
          right={
            <FilterChips
              filters={EXPERIENCE_FILTERS}
              value={filter}
              onChange={setFilter}
            />
          }
        >
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {filteredExperiences.map((e) => (
              <ExperienceTile key={e.slug} experience={e} />
            ))}
          </div>

          <p className="mt-3 text-[12px] text-ink-muted">
            {EXPERIENCES_TOTAL - EXPERIENCES.length} more experiences ·{" "}
            {EXPERIENCES_HIDDEN_HINT}{" "}
            <Link
              href="/vendors/experiences"
              className="text-ink underline-offset-2 hover:underline"
            >
              See all →
            </Link>
          </p>
        </Section>

        <SummaryStrip
          openEssentials={openEssentials}
          addedExperiences={addedExperiences}
          committed="₹0"
        />
      </main>
    </div>
  );
}

// ── Wedding context strip ──────────────────────────────────────────────────

function ContextStrip({
  ctx,
  weddingDate,
  onSpinRoulette,
}: {
  ctx: ReturnType<typeof deriveWeddingContext>;
  weddingDate: Date | null;
  onSpinRoulette: () => void;
}) {
  const dateLabel = weddingDate
    ? weddingDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Date tbd";
  const budget = formatBudgetHeadline(ctx.budgetMinCents, ctx.budgetMaxCents);
  const venue = ctx.venueName
    ? ctx.venueState
      ? `${ctx.venueName}, ${ctx.venueState}`
      : ctx.venueName
    : "Venue tbd";

  return (
    <section className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-[color:var(--color-border)] bg-white px-4 py-3">
      <Chip icon={Calendar} label={dateLabel} />
      <Chip icon={MapPin} label={venue} />
      {ctx.guestCount > 0 && (
        <Chip icon={Users} label={`${ctx.guestCount} guests`} />
      )}
      {budget && <Chip icon={Wallet} label={`${budget} budget`} />}
      {ctx.eventNames.length > 0 && (
        <span className="text-[12px] text-ink-muted">
          {ctx.eventNames.join(" · ")}
        </span>
      )}
      <button
        type="button"
        onClick={onSpinRoulette}
        className="ml-auto flex items-center gap-1.5 rounded-md border border-gold/30 bg-gold-pale/40 px-3 py-1.5 text-[12px] font-medium text-gold transition-colors hover:bg-gold-pale/60"
      >
        <Sparkles size={12} strokeWidth={1.6} />
        Spin roulette
      </button>
    </section>
  );
}

function Chip({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12.5px] text-ink">
      <Icon size={13} strokeWidth={1.6} className="text-gold" />
      {label}
    </span>
  );
}

// ── Section wrapper ────────────────────────────────────────────────────────

function Section({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <header className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-medium text-ink">{title}</h2>
          <p className="text-[12.5px] text-ink-muted">{subtitle}</p>
        </div>
        {right}
      </header>
      {children}
    </section>
  );
}

// ── Search input ───────────────────────────────────────────────────────────

function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative" style={{ width: 180 }}>
      <Search
        size={12}
        strokeWidth={1.6}
        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search essentials"
        className="w-full rounded-md border border-[color:var(--color-border)] bg-white py-1.5 pl-7 pr-2.5 text-[12px] text-ink outline-none placeholder:text-ink-faint focus:border-gold/60"
      />
    </div>
  );
}

// ── Filter chips ───────────────────────────────────────────────────────────

function FilterChips<T extends string>({
  filters,
  value,
  onChange,
}: {
  filters: Array<{ id: T; label: string }>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {filters.map((f) => {
        const active = f.id === value;
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => onChange(f.id)}
            className={`rounded-full px-3 py-1 text-[11.5px] font-normal transition-colors ${
              active
                ? "bg-ink text-ivory"
                : "border border-[color:var(--color-border)] bg-white text-ink-muted hover:border-ink/15 hover:text-ink"
            }`}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Summary strip ──────────────────────────────────────────────────────────

function SummaryStrip({
  openEssentials,
  addedExperiences,
  committed,
}: {
  openEssentials: number;
  addedExperiences: number;
  committed: string;
}) {
  return (
    <section className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-ivory-warm px-4 py-3">
      <span className="text-[12.5px] text-ink">
        {openEssentials} essentials open · {addedExperiences} experiences added ·{" "}
        {committed} committed
      </span>
      <Link
        href="/vendors/checklist"
        className="text-[12px] font-medium text-ink underline-offset-2 hover:underline"
      >
        Print checklist →
      </Link>
    </section>
  );
}
