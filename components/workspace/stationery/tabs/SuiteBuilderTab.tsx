"use client";

// ── Stationery · Suite Builder tab ─────────────────────────────────────────
// Couples define what pieces they want — but framed as creative decisions,
// not a production checklist. Each piece is a card with three states:
// Want this / Maybe / Skip. Starred pieces become top priorities so the
// designer knows where to spend the most creative energy.
//
// The underlying suite-item catalogue is shared with the rest of the
// store (quantities, status, print method); this tab only surfaces
// the discovery-first preference + priority layer.

import { useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  CircleDashed,
  Mail,
  MinusCircle,
  Plus,
  Star,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStationeryStore } from "@/stores/stationery-store";
import {
  STATIONERY_EVENT_LABEL,
  type StationerySuiteItem,
  type StationerySuitePreference,
  type StationerySuiteSection,
} from "@/types/stationery";
import {
  Eyebrow,
  PanelCard,
} from "@/components/workspace/blocks/primitives";

const SECTION_LABEL: Record<StationerySuiteSection, string> = {
  pre_wedding: "Pre-wedding",
  day_of: "Day-of",
  post_wedding: "Post-wedding",
};

const SECTION_HINT: Record<StationerySuiteSection, string> = {
  pre_wedding:
    "Everything that arrives at your guests' homes before the first event.",
  day_of:
    "Every piece a guest touches or reads during the wedding itself.",
  post_wedding:
    "Thank-yous, favor tags, and the small follow-through that keeps the feeling going.",
};

const PREFERENCE_META: Record<
  StationerySuitePreference,
  { label: string; icon: React.ReactNode; tone: string }
> = {
  want: {
    label: "Want this",
    icon: <CheckCircle2 size={12} strokeWidth={1.8} />,
    tone: "border-saffron bg-saffron-pale/60 text-saffron",
  },
  maybe: {
    label: "Maybe",
    icon: <CircleDashed size={12} strokeWidth={1.8} />,
    tone: "border-amber-400 bg-amber-50 text-amber-700",
  },
  skip: {
    label: "Skip",
    icon: <MinusCircle size={12} strokeWidth={1.8} />,
    tone: "border-border bg-white text-ink-muted",
  },
};

// ── Tab entry ─────────────────────────────────────────────────────────────

export function StationerySuiteBuilderTab() {
  return (
    <div className="space-y-6">
      <DiscoveryCard />
      <PieceSelector />
      <PriorityRanking />
    </div>
  );
}

// ── Discovery card ────────────────────────────────────────────────────────

function DiscoveryCard() {
  return (
    <div className="rounded-lg border border-border bg-ivory-warm/60 p-5">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Your paper suite
      </p>
      <h3 className="mt-1.5 font-serif text-[22px] leading-tight text-ink">
        Every piece your guests will touch.
      </h3>
      <p className="mt-2 max-w-2xl font-serif text-[14px] italic leading-relaxed text-ink-muted">
        From the envelope they open at home to the menu they read at dinner —
        pick the pieces that matter to you. You can always add more; nothing
        here is final until you sign the contract.
      </p>
    </div>
  );
}

// ── Piece selector grid ───────────────────────────────────────────────────

function PieceSelector() {
  const suite = useStationeryStore((s) => s.suite);
  const piecePreferences = useStationeryStore((s) => s.piecePreferences);
  const setPiecePreference = useStationeryStore((s) => s.setPiecePreference);
  const addSuiteItem = useStationeryStore((s) => s.addSuiteItem);

  const [addOpen, setAddOpen] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftSection, setDraftSection] =
    useState<StationerySuiteSection>("pre_wedding");

  const grouped = useMemo(() => {
    const map: Record<StationerySuiteSection, StationerySuiteItem[]> = {
      pre_wedding: [],
      day_of: [],
      post_wedding: [],
    };
    for (const item of suite) {
      map[item.section].push(item);
    }
    return map;
  }, [suite]);

  function getPreference(itemId: string): StationerySuitePreference {
    // Default: items seeded as `enabled: true` start as "want" so the
    // couple's common-case picks are pre-selected.
    const explicit = piecePreferences[itemId];
    if (explicit) return explicit;
    const item = suite.find((i) => i.id === itemId);
    return item?.enabled ? "want" : "skip";
  }

  function addCustom() {
    if (!draftName.trim()) return;
    const id = addSuiteItem({
      section: draftSection,
      kind: "custom",
      name: draftName.trim(),
      enabled: true,
      quantity: 0,
      buffer_pct: 10,
      cost_unit: 0,
      status: "not_started",
      custom: true,
    });
    setPiecePreference(id, "want");
    setDraftName("");
    setAddOpen(false);
  }

  return (
    <div className="space-y-5">
      {(Object.keys(grouped) as StationerySuiteSection[]).map((section) => {
        const items = grouped[section];
        if (items.length === 0) return null;
        return (
          <section key={section}>
            <header className="mb-2 flex items-baseline justify-between">
              <div>
                <h4
                  className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {SECTION_LABEL[section]}
                </h4>
                <p className="mt-0.5 text-[11.5px] text-ink-muted">
                  {SECTION_HINT[section]}
                </p>
              </div>
              <Eyebrow>
                {items.filter((i) => getPreference(i.id) === "want").length}{" "}
                / {items.length} selected
              </Eyebrow>
            </header>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <PieceCard
                  key={item.id}
                  item={item}
                  preference={getPreference(item.id)}
                  onSet={(p) => setPiecePreference(item.id, p)}
                />
              ))}
            </div>
          </section>
        );
      })}

      <div>
        {addOpen ? (
          <div className="rounded-md border border-border bg-white p-3">
            <p className="mb-2 text-[11.5px] text-ink-muted">
              Name the piece you want and tell us when it lands.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addCustom();
                }}
                placeholder="e.g. Envelope liner · Vellum wrap · Hashtag sign…"
                className="flex-1 rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
              />
              <select
                value={draftSection}
                onChange={(e) =>
                  setDraftSection(e.target.value as StationerySuiteSection)
                }
                className="rounded-sm border border-border bg-white px-2 py-1.5 text-[11.5px] text-ink focus:border-saffron focus:outline-none"
              >
                {(Object.keys(SECTION_LABEL) as StationerySuiteSection[]).map(
                  (s) => (
                    <option key={s} value={s}>
                      {SECTION_LABEL[s]}
                    </option>
                  ),
                )}
              </select>
              <button
                type="button"
                onClick={addCustom}
                className="rounded-sm bg-saffron px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ivory hover:bg-saffron/90"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Add piece
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddOpen(false);
                  setDraftName("");
                }}
                className="rounded-sm border border-border bg-white px-2 py-1.5 text-ink-muted hover:text-ink"
                aria-label="Cancel"
              >
                <X size={12} strokeWidth={1.8} />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border bg-white px-3 py-3 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-muted transition-colors hover:border-saffron hover:text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <Plus size={12} /> Add a custom piece
          </button>
        )}
      </div>
    </div>
  );
}

function PieceCard({
  item,
  preference,
  onSet,
}: {
  item: StationerySuiteItem;
  preference: StationerySuitePreference;
  onSet: (p: StationerySuitePreference) => void;
}) {
  const priority = useStationeryStore((s) =>
    s.piecePriority.includes(item.id),
  );
  const togglePiecePriority = useStationeryStore(
    (s) => s.togglePiecePriority,
  );

  const isSkipped = preference === "skip";
  const meta = PREFERENCE_META[preference];

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-md border bg-white p-3 transition-colors",
        isSkipped && "border-dashed border-border opacity-60",
        preference === "want" && "border-saffron/40",
        preference === "maybe" && "border-amber-300/60",
      )}
    >
      {priority && preference !== "skip" && (
        <span
          className="absolute -right-1.5 -top-1.5 inline-flex h-5 items-center gap-0.5 rounded-full bg-gold px-1.5 text-[9px] font-medium text-ivory shadow-sm"
          title="Top priority for your designer"
        >
          <Star size={8} strokeWidth={0} className="fill-ivory" /> Top
        </span>
      )}

      <div className="flex items-start gap-2">
        <span
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-ivory-warm text-ink-muted"
          aria-hidden
        >
          <Mail size={12} strokeWidth={1.6} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-ink">
            {item.name}
          </p>
          {item.description && (
            <p className="mt-0.5 line-clamp-2 text-[11.5px] text-ink-muted">
              {item.description}
            </p>
          )}
          {item.event && (
            <p
              className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.08em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {STATIONERY_EVENT_LABEL[item.event]} event
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1">
        {(Object.keys(PREFERENCE_META) as StationerySuitePreference[]).map(
          (p) => (
            <button
              key={p}
              type="button"
              onClick={() => onSet(p)}
              className={cn(
                "inline-flex items-center gap-1 rounded-sm border px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.08em] transition-colors",
                preference === p
                  ? PREFERENCE_META[p].tone
                  : "border-border bg-white text-ink-muted hover:border-ink",
              )}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {PREFERENCE_META[p].icon}
              {PREFERENCE_META[p].label}
            </button>
          ),
        )}

        {preference !== "skip" && (
          <button
            type="button"
            onClick={() => togglePiecePriority(item.id)}
            className={cn(
              "ml-auto inline-flex items-center gap-1 rounded-sm border px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.08em] transition-colors",
              priority
                ? "border-gold bg-gold-pale/60 text-gold"
                : "border-border bg-white text-ink-muted hover:border-gold hover:text-gold",
            )}
            style={{ fontFamily: "var(--font-mono)" }}
            title={priority ? "Remove from priorities" : "Mark as top priority"}
          >
            <Star
              size={10}
              strokeWidth={1.8}
              className={priority ? "fill-gold" : ""}
            />
            {priority ? "Priority" : "Star"}
          </button>
        )}
      </div>
    </article>
  );
}

// ── Priority ranking summary ──────────────────────────────────────────────

function PriorityRanking() {
  const suite = useStationeryStore((s) => s.suite);
  const piecePriority = useStationeryStore((s) => s.piecePriority);
  const togglePiecePriority = useStationeryStore(
    (s) => s.togglePiecePriority,
  );
  const piecePreferences = useStationeryStore((s) => s.piecePreferences);

  const starred = useMemo(
    () =>
      piecePriority
        .map((id) => suite.find((i) => i.id === id))
        .filter((x): x is StationerySuiteItem => !!x)
        .filter((i) => piecePreferences[i.id] !== "skip"),
    [piecePriority, suite, piecePreferences],
  );

  return (
    <PanelCard
      icon={<Star size={14} strokeWidth={1.8} />}
      eyebrow="Hero pieces"
      title="Top priorities"
      description="The pieces you've flagged as essentials — your designer concentrates the craft budget here."
      badge={
        <span
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Where your designer spends the energy
        </span>
      }
    >
      <p className="mb-3 text-[12px] text-ink-muted">
        Which pieces matter most to you? Starred pieces get extra attention
        throughout the workspace and in the brief we hand the designer.
      </p>

      {starred.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-ivory-warm/30 p-3">
          <p className="font-serif text-[13.5px] italic text-ink-muted">
            No top priorities yet. Tap the ☆ on any card above to mark the
            pieces where you want the designer to pour in the most care.
          </p>
        </div>
      ) : (
        <ul className="space-y-1.5">
          {starred.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-md border border-gold/30 bg-gold-pale/30 px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-medium text-ink">
                  {item.name}
                </p>
                {item.description && (
                  <p className="truncate text-[11px] text-ink-muted">
                    {item.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => togglePiecePriority(item.id)}
                className="ml-2 inline-flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-ink-muted hover:text-rose"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <Check size={10} strokeWidth={1.8} /> Unstar
              </button>
            </li>
          ))}
        </ul>
      )}
    </PanelCard>
  );
}
