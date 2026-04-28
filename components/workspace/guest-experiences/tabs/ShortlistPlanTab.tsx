"use client";

// ── Guest Experiences — Shortlist & Plan tab ────────────────────────────────
// Where "Loved" items graduate. Three sections:
//   • Shortlisted experiences — grouped by category, with vendor/status/notes
//   • Budget snapshot          — est. cost vs. the category's finance budget
//   • Guest Experience Brief   — editable narrative, refined from quiz

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Send,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkspaceCategory } from "@/types/workspace";
import {
  EXPERIENCE_CATALOG,
  EXPERIENCE_CATEGORIES,
  EXPERIENCE_EVENT_CHIPS,
  type ExperienceCategory,
  type ExperienceEvent,
} from "@/lib/guest-experiences/experience-catalog";
import {
  useGuestExperiencesStore,
  type ShortlistStatus,
} from "@/stores/guest-experiences-store";
import { useFinanceStore } from "@/stores/finance-store";
import { formatDollarsShort } from "@/lib/finance/format";

// Unified row shape across catalog / custom / AI-suggested cards.
interface ShortlistRow {
  id: string;
  kind: "catalog" | "custom" | "ai";
  category: ExperienceCategory;
  name: string;
  description: string;
  image_url: string | null;
  price_low: number;
  price_high: number;
  default_events: ExperienceEvent[];
}

const STATUS_OPTIONS: { value: ShortlistStatus; label: string; icon: React.ElementType }[] = [
  { value: "not_started", label: "Not started", icon: Circle },
  { value: "researching", label: "Researching", icon: Clock },
  { value: "quoted", label: "Quoted", icon: FileText },
  { value: "booked", label: "Booked", icon: CheckCircle2 },
];

export function ShortlistPlanTab({
  category,
  onBackToExplore,
}: {
  category: WorkspaceCategory;
  onBackToExplore: () => void;
}) {
  const cards = useGuestExperiencesStore((s) => s.cards);
  const customCards = useGuestExperiencesStore((s) => s.customCards);
  const aiSuggestions = useGuestExperiencesStore((s) => s.aiSuggestions);

  const rows = useMemo<ShortlistRow[]>(() => {
    const catalogRows: ShortlistRow[] = EXPERIENCE_CATALOG.filter(
      (c) => cards[c.id]?.reaction === "love",
    ).map((c) => ({
      id: c.id,
      kind: "catalog",
      category: c.category,
      name: c.name,
      description: c.description,
      image_url: c.image_url,
      price_low: c.price_low,
      price_high: c.price_high,
      default_events: c.suggested_events,
    }));

    const aiRows: ShortlistRow[] = aiSuggestions
      .filter((s) => cards[s.id]?.reaction === "love")
      .map((s) => ({
        id: s.id,
        kind: "ai",
        category: s.category as ExperienceCategory,
        name: s.name,
        description: s.description,
        image_url: s.image_url,
        price_low: s.price_low,
        price_high: s.price_high,
        default_events: s.suggested_events,
      }));

    const customRows: ShortlistRow[] = customCards.map((c) => ({
      id: c.id,
      kind: "custom",
      category: c.category as ExperienceCategory,
      name: c.name,
      description: c.description,
      image_url: null,
      price_low: c.price_low,
      price_high: c.price_high,
      default_events: c.suggested_events,
    }));

    return [...catalogRows, ...aiRows, ...customRows];
  }, [cards, customCards, aiSuggestions]);

  const grouped = useMemo(() => {
    const map = new Map<ExperienceCategory, ShortlistRow[]>();
    for (const row of rows) {
      const arr = map.get(row.category) ?? [];
      arr.push(row);
      map.set(row.category, arr);
    }
    return map;
  }, [rows]);

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-lg border border-dashed border-border bg-ivory-warm/30 px-6 py-16 text-center">
        <Sparkles size={26} strokeWidth={1.4} className="text-saffron" />
        <h3 className="mt-4 font-serif font-bold text-[20px] text-ink">
          Nothing shortlisted yet
        </h3>
        <p className="mt-1.5 max-w-md text-[13px] text-ink-muted">
          Head back to the Explorer and react to ideas. Anything you love will
          collect here, ready to brief vendors and track through booking.
        </p>
        <button
          type="button"
          onClick={onBackToExplore}
          className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-[12.5px] font-medium text-ivory transition-opacity hover:opacity-90"
        >
          <ArrowLeft size={13} strokeWidth={2} />
          Back to Discover & Dream
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Shortlist grouped by category */}
      <section>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-saffron">
            Your shortlist
          </p>
          <h2 className="mt-1.5 font-serif font-bold text-[22px] leading-tight text-ink">
            Shortlisted experiences
          </h2>
          <p className="mt-1.5 max-w-3xl text-[13px] text-ink-muted">
            Track each one through research, quotes, and booking. Add planner
            notes as you talk with vendors.
          </p>
        </div>
        <div className="mt-5 space-y-6">
          {Array.from(grouped.entries()).map(([catId, catRows]) => {
            const catLabel =
              EXPERIENCE_CATEGORIES.find((c) => c.id === catId)?.label ?? catId;
            return (
              <div key={catId}>
                <h3 className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">
                  {catLabel}
                </h3>
                <ul className="mt-2 space-y-2">
                  {catRows.map((row) => (
                    <ShortlistRowCard key={row.id} row={row} />
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <BudgetSnapshot rows={rows} category={category} />

      <BriefSection />
    </div>
  );
}

// ── Individual shortlist row ────────────────────────────────────────────────

function ShortlistRowCard({ row }: { row: ShortlistRow }) {
  const state = useGuestExperiencesStore((s) => s.cards[row.id]);
  const setStatus = useGuestExperiencesStore((s) => s.setStatus);
  const setNotes = useGuestExperiencesStore((s) => s.setNotes);
  const toggleEvent = useGuestExperiencesStore((s) => s.toggleEventAssignment);
  const setReaction = useGuestExperiencesStore((s) => s.setReaction);
  const deleteCustom = useGuestExperiencesStore((s) => s.deleteCustomCard);
  const [notesOpen, setNotesOpen] = useState(false);

  const assignments = state?.event_assignments ?? row.default_events;
  const status: ShortlistStatus = state?.status ?? "not_started";

  function removeFromShortlist() {
    if (row.kind === "custom") {
      deleteCustom(row.id);
    } else {
      setReaction(row.id, null);
    }
  }

  return (
    <li className="rounded-md border border-border bg-white">
      <div className="flex items-start gap-3 p-3">
        {row.image_url ? (
          <div
            className="h-14 w-14 shrink-0 rounded bg-cover bg-center"
            style={{ backgroundImage: `url(${row.image_url})` }}
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded bg-ivory-warm">
            <Sparkles size={16} className="text-saffron" />
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[14px] font-medium text-ink">{row.name}</p>
              <p className="truncate text-[12px] text-ink-muted">
                {row.description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="font-mono text-[11px] tabular-nums text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {formatPrice(row.price_low)} – {formatPrice(row.price_high)}
              </span>
              <button
                type="button"
                onClick={removeFromShortlist}
                className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] text-ink-muted transition-colors hover:border-rose/40 hover:text-rose"
              >
                <X size={11} />
                Remove
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {EXPERIENCE_EVENT_CHIPS.map((chip) => {
              const active = assignments.includes(chip.id);
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => toggleEvent(row.id, chip.id)}
                  className={cn(
                    "rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors",
                    active
                      ? "border-saffron bg-saffron/10 text-saffron"
                      : "border-border text-ink-faint hover:border-saffron/40 hover:text-saffron",
                  )}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <StatusSelect
              value={status}
              onChange={(v) => setStatus(row.id, v)}
            />
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-[11.5px] text-ink-muted transition-colors hover:border-saffron/40 hover:text-saffron"
            >
              <Send size={11} strokeWidth={1.8} />
              Invite vendor
            </button>
            <button
              type="button"
              onClick={() => setNotesOpen((v) => !v)}
              className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-[11.5px] text-ink-muted transition-colors hover:border-saffron/40 hover:text-saffron"
            >
              <FileText size={11} strokeWidth={1.8} />
              {state?.notes ? "Edit notes" : "Add notes"}
            </button>
          </div>

          {notesOpen && (
            <textarea
              rows={2}
              placeholder="Planner notes — vendor contact, quote reference, logistics…"
              value={state?.notes ?? ""}
              onChange={(e) => setNotes(row.id, e.target.value)}
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[12.5px] text-ink focus:border-saffron focus:outline-none"
            />
          )}
          {!notesOpen && state?.notes && (
            <p className="rounded-md bg-ivory-warm/40 px-3 py-2 text-[12px] text-ink-muted">
              {state.notes}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}

function StatusSelect({
  value,
  onChange,
}: {
  value: ShortlistStatus;
  onChange: (v: ShortlistStatus) => void;
}) {
  const current = STATUS_OPTIONS.find((o) => o.value === value)!;
  const Icon = current.icon;
  return (
    <label className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-2.5 py-1 text-[11.5px] text-ink-muted focus-within:border-saffron">
      <Icon size={11} strokeWidth={1.8} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ShortlistStatus)}
        className="appearance-none bg-transparent pr-1 text-ink focus:outline-none"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

// ── Budget snapshot ────────────────────────────────────────────────────────

function BudgetSnapshot({
  rows,
  category,
}: {
  rows: ShortlistRow[];
  category: WorkspaceCategory;
}) {
  const budgets = useFinanceStore((s) => s.budgets);
  const budget = budgets.find((b) => b.category_id === category.slug);
  const allocated = budget?.allocated_cents ?? 0;

  const estLow = rows.reduce((s, r) => s + r.price_low, 0);
  const estHigh = rows.reduce((s, r) => s + r.price_high, 0);
  const estMid = Math.round((estLow + estHigh) / 2);
  const over = allocated > 0 && estMid > allocated;
  const pct = allocated > 0 ? Math.min(100, (estMid / allocated) * 100) : 0;

  return (
    <section>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-saffron">
          Budget snapshot
        </p>
        <h2 className="mt-1.5 font-serif font-bold text-[22px] leading-tight text-ink">
          Rough cost vs. what's allocated
        </h2>
        <p className="mt-1.5 max-w-3xl text-[13px] text-ink-muted">
          Mid-point of each card's price range. Exact costs firm up once
          vendors quote — we'll re-price then.
        </p>
      </div>
      <div className="mt-5 rounded-md border border-border bg-white p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              Estimated mid-point
            </p>
            <p className="mt-1 font-serif text-[28px] leading-none text-ink">
              {formatPrice(estMid)}
            </p>
            <p className="mt-1 text-[11.5px] text-ink-muted">
              Range: {formatPrice(estLow)} – {formatPrice(estHigh)} across{" "}
              {rows.length} item{rows.length === 1 ? "" : "s"}.
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              Allocated
            </p>
            <p className="mt-1 font-serif text-[20px] leading-none text-ink">
              {allocated > 0 ? formatDollarsShort(allocated) : "Not set"}
            </p>
          </div>
        </div>
        {allocated > 0 && (
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-ivory-warm">
            <span
              className={cn(
                "block h-full rounded-full transition-all",
                over ? "bg-rose" : "bg-gold",
              )}
              style={{ width: `${Math.max(4, pct)}%` }}
            />
          </div>
        )}
        {over && (
          <p className="mt-3 flex items-center gap-1.5 text-[12px] text-rose">
            <Wallet size={12} />
            Current shortlist is tracking over the allocated budget. Trim, trade,
            or re-allocate.
          </p>
        )}
      </div>
    </section>
  );
}

// ── Brief section ──────────────────────────────────────────────────────────

function BriefSection() {
  const brief = useGuestExperiencesStore((s) => s.brief);
  const setBrief = useGuestExperiencesStore((s) => s.setBrief);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(brief);

  function refineWithAi() {
    // Stub "Refine with AI" — in local-first mode we tighten the narrative
    // with a couple deterministic passes. Real build would call an API.
    const tightened = brief
      .replace(/\s{2,}/g, " ")
      .trim()
      .split(". ")
      .map((s) => s.trim())
      .filter(Boolean)
      .join(". ")
      .concat(brief.trim().endsWith(".") ? "" : ".");
    setBrief(tightened);
    setDraft(tightened);
  }

  return (
    <section>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-saffron">
          Your Guest Experience Brief
        </p>
        <h2 className="mt-1.5 font-serif font-bold text-[22px] leading-tight text-ink">
          The document the planner reads first
        </h2>
        <p className="mt-1.5 max-w-3xl text-[13px] text-ink-muted">
          Describe the experience you want to create for your guests — not the
          vendor list. We'll polish the structure.
        </p>
      </div>
      <div className="mt-5 rounded-md border border-border bg-white p-5">
        {editing ? (
          <>
            <textarea
              rows={8}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13.5px] leading-relaxed text-ink focus:border-saffron focus:outline-none"
              placeholder="e.g. We want guests walking in to be wrapped in surprise from the moment they arrive — dhol, a petal shower, a chai wallah on arrival…"
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setDraft(brief);
                  setEditing(false);
                }}
                className="rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setBrief(draft);
                  setEditing(false);
                }}
                className="rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory"
              >
                Save
              </button>
            </div>
          </>
        ) : brief ? (
          <>
            <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink">
              {brief}
            </p>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={refineWithAi}
                className="inline-flex items-center gap-1.5 rounded-md border border-gold/30 bg-ivory-warm/50 px-3 py-1.5 text-[12px] text-ink transition-colors hover:bg-ivory-warm"
              >
                <Sparkles size={12} className="text-saffron" />
                Refine with AI
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraft(brief);
                  setEditing(true);
                }}
                className="rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink-muted hover:text-ink"
              >
                Edit
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-6 text-center">
            <p className="text-[13px] text-ink-muted">
              Take the quiz on the Discover & Dream tab, or write your brief
              straight in.
            </p>
            <button
              type="button"
              onClick={() => {
                setDraft("");
                setEditing(true);
              }}
              className="mt-3 rounded-md bg-ink px-4 py-2 text-[12.5px] font-medium text-ivory"
            >
              Write a brief
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

// ── Format helper ──────────────────────────────────────────────────────────

function formatPrice(rupees: number): string {
  if (rupees >= 100000) return `₹${(rupees / 100000).toFixed(1).replace(/\.0$/, "")}L`;
  if (rupees >= 1000) return `₹${Math.round(rupees / 1000)}k`;
  return `₹${rupees}`;
}
