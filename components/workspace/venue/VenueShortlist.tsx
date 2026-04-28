"use client";

// ── Venue Shortlist tab ────────────────────────────────────────────────────
// Cards, not a table. Each venue is a card with hero image, vibe one-liner,
// key facts, editable notes, lifecycle status pill, and a compare toggle.
//
// When 2–3 venues are compare-checked a slide-up panel renders a vertical
// comparison grouped into three bands:
//   · The feel       (vibe summary, your notes, planner notes)
//   · The fit        (capacity, catering, fire, curfew, rooms, cost, in/out)
//   · The logistics  (airport, accommodation, dock, power, permits)
//
// "Suggested for you" cards render above the shortlist — the couple can
// Accept (adds to shortlist) or Dismiss. Real AI matching is out of scope;
// the suggestions slice is seeded and editable.
//
// The computed requirements checklist lives as a collapsible at the top,
// grouped by source (Events / Catering / Décor / Music / Ceremony / Guests
// / Discovery / Custom). Computed items render read-only with a source chip;
// only "Custom" items can be added or removed.

import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Heart,
  NotebookPen,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useVenueStore } from "@/stores/venue-store";
import {
  INDOOR_OUTDOOR_LABEL,
  REQUIREMENT_GROUP_LABEL,
  VENUE_STATUS_LABEL,
  type RequirementGroup,
  type ShortlistVenue,
  type VenueStatus,
} from "@/types/venue";
import {
  EmptyRow,
  Eyebrow,
  PanelCard,
} from "@/components/workspace/blocks/primitives";
import { InlineText } from "@/components/workspace/editable/InlineText";
import { VenueDetailDrawer } from "./VenueDetailDrawer";
import { suggestionsFromQuiz, summarizeQuiz } from "@/lib/venue/mock-ai";

export function VenueShortlist() {
  const [detailId, setDetailId] = useState<string | null>(null);
  return (
    <>
      <div className="space-y-6">
        <RequirementsChecklist />
        <QuizMatchBanner />
        <Suggestions />
        <ShortlistGrid onOpenDetail={setDetailId} />
        <CompareStrip />
      </div>
      <VenueDetailDrawer
        venueId={detailId}
        onClose={() => setDetailId(null)}
      />
    </>
  );
}

// ── Quiz match banner ────────────────────────────────────────────────────
// Renders ONLY when the Discovery Quiz has been completed. Shows a
// one-paragraph summary of what the couple said they want, plus a row of
// 3 venue picks drawn from the quiz vibe mapping. "Add to shortlist"
// pushes the pick into the shortlist slice directly.

function QuizMatchBanner() {
  const quiz = useVenueStore((s) => s.discovery.quiz);
  const addVenue = useVenueStore((s) => s.addShortlistVenue);

  if (!quiz.completed) return null;

  const summary = summarizeQuiz(quiz.answers);
  const picks = suggestionsFromQuiz(quiz.answers).slice(0, 3);

  if (picks.length === 0) return null;

  return (
    <PanelCard
      icon={<Sparkles size={14} strokeWidth={1.8} />}
      title="from your discovery quiz"
      badge={
        <span
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Matched to your answers
        </span>
      }
    >
      <p className="mb-3 max-w-prose text-[12.5px] leading-relaxed text-ink-muted">
        {summary}
      </p>
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {picks.map((p) => (
          <li
            key={p.name}
            className="overflow-hidden rounded-md border border-saffron/30 bg-saffron-pale/10"
          >
            <div className="relative aspect-[4/3] bg-ivory-warm">
              <img
                src={p.hero_image_url}
                alt={p.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <span
                className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-saffron shadow"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <Sparkles size={9} /> Match
              </span>
            </div>
            <div className="p-3">
              <p className="text-[13.5px] font-medium text-ink">{p.name}</p>
              <p className="mt-0.5 text-[11.5px] text-ink-muted">
                {p.location}
              </p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-ink-muted">
                {p.vibe_summary}
              </p>
              <p
                className="mt-1.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-saffron"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Why · {p.match_reason}
              </p>
              <button
                type="button"
                onClick={() =>
                  addVenue({
                    name: p.name,
                    location: p.location,
                    vibe_summary: p.vibe_summary,
                    hero_image_url: p.hero_image_url,
                  })
                }
                className="mt-2.5 flex items-center gap-1 rounded-sm border border-saffron bg-saffron px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-ivory hover:bg-saffron/90"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <Plus size={10} /> Add to shortlist
              </button>
            </div>
          </li>
        ))}
      </ul>
    </PanelCard>
  );
}

// ── Computed requirements (collapsible) ───────────────────────────────────

function RequirementsChecklist() {
  const [open, setOpen] = useState(false);
  const requirements = useVenueStore((s) => s.requirements);
  const toggle = useVenueStore((s) => s.toggleRequirement);
  const remove = useVenueStore((s) => s.removeRequirement);
  const addCustom = useVenueStore((s) => s.addCustomRequirement);
  const [draft, setDraft] = useState("");

  const met = requirements.filter((r) => r.met).length;
  const total = requirements.length;

  const grouped = useMemo(() => {
    const g = new Map<RequirementGroup, typeof requirements>();
    for (const r of requirements) {
      if (!g.has(r.group)) g.set(r.group, []);
      g.get(r.group)!.push(r);
    }
    return g;
  }, [requirements]);

  return (
    <section className="rounded-lg border border-border bg-white shadow-[0_1px_1px_rgba(26,26,26,0.03)]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-saffron-pale/60 text-saffron">
            <Check size={14} strokeWidth={1.8} />
          </span>
          <div>
            <h4 className="text-[13.5px] font-medium text-ink">
              Your venue checklist
            </h4>
            <p className="mt-0.5 text-[11.5px] text-ink-muted">
              Auto-generated from your events, vendors, and preferences —{" "}
              <span
                className="font-mono tabular-nums"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {met}/{total} met
              </span>
            </p>
          </div>
        </div>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && (
        <div className="border-t border-border/60 px-5 py-4">
          <div className="space-y-4">
            {Array.from(grouped.entries()).map(([group, items]) => (
              <div key={group}>
                <Eyebrow className="mb-2">
                  {REQUIREMENT_GROUP_LABEL[group]}
                </Eyebrow>
                <ul className="space-y-1">
                  {items.map((r) => (
                    <li
                      key={r.id}
                      className="group flex items-start gap-2 rounded-sm px-1 py-1 hover:bg-ivory-warm/40"
                    >
                      <button
                        type="button"
                        onClick={() => toggle(r.id)}
                        className={cn(
                          "mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
                          r.met
                            ? "border-saffron bg-saffron text-ivory"
                            : "border-border bg-white text-transparent hover:border-saffron",
                        )}
                        aria-label={r.met ? "Mark as not met" : "Mark as met"}
                      >
                        <Check size={10} strokeWidth={2.5} />
                      </button>
                      <div className="flex-1">
                        <p
                          className={cn(
                            "text-[12.5px] leading-snug",
                            r.met ? "text-ink" : "text-ink-muted",
                          )}
                        >
                          {r.label}
                        </p>
                        {r.source_note && (
                          <p
                            className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-ink-faint"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            {r.source_note}
                          </p>
                        )}
                      </div>
                      {!r.computed && (
                        <button
                          type="button"
                          onClick={() => remove(r.id)}
                          className="opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
                          aria-label="Remove"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
            <Plus size={12} className="text-ink-faint" />
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && draft.trim()) {
                  e.preventDefault();
                  addCustom(draft.trim());
                  setDraft("");
                }
              }}
              placeholder="Add a custom requirement…"
              className="flex-1 bg-transparent text-[12px] text-ink placeholder:text-ink-faint focus:outline-none"
            />
          </div>
        </div>
      )}
    </section>
  );
}

// ── Suggestions ───────────────────────────────────────────────────────────

function Suggestions() {
  const suggestions = useVenueStore((s) => s.suggestions);
  const accept = useVenueStore((s) => s.acceptSuggestion);
  const dismiss = useVenueStore((s) => s.setSuggestionStatus);
  const pending = suggestions.filter((s) => s.status === "pending");

  if (pending.length === 0) return null;

  return (
    <PanelCard
      icon={<Sparkles size={14} strokeWidth={1.8} />}
      title="suggested for you"
      badge={
        <span
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Based on your brief
        </span>
      }
    >
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {pending.map((s) => (
          <li
            key={s.id}
            className="overflow-hidden rounded-md border border-dashed border-saffron/40 bg-saffron-pale/10"
          >
            <div className="relative aspect-[4/3] bg-ivory-warm">
              <img
                src={s.hero_image_url}
                alt={s.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div className="p-3">
              <p className="text-[13.5px] font-medium text-ink">{s.name}</p>
              <p className="mt-0.5 text-[11.5px] text-ink-muted">
                {s.location}
              </p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-ink-muted">
                {s.vibe_summary}
              </p>
              <div className="mt-3 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => accept(s.id)}
                  className="flex items-center gap-1 rounded-sm border border-saffron bg-saffron px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-ivory transition-colors hover:bg-saffron/90"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <Plus size={10} /> Add to shortlist
                </button>
                <button
                  type="button"
                  onClick={() => dismiss(s.id, "dismissed")}
                  className="flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted transition-colors hover:border-ink hover:text-ink"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <X size={10} /> Dismiss
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </PanelCard>
  );
}

// ── Shortlist cards ───────────────────────────────────────────────────────

function ShortlistGrid({
  onOpenDetail,
}: {
  onOpenDetail: (id: string) => void;
}) {
  const shortlist = useVenueStore((s) => s.shortlist);
  const add = useVenueStore((s) => s.addShortlistVenue);
  const [addDraft, setAddDraft] = useState("");

  return (
    <PanelCard
      icon={<Heart size={14} strokeWidth={1.8} />}
      title="your shortlist"
      badge={
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={addDraft}
            onChange={(e) => setAddDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && addDraft.trim()) {
                e.preventDefault();
                add({ name: addDraft.trim() });
                setAddDraft("");
              }
            }}
            placeholder="+ Add venue by name or URL"
            className="rounded-sm border border-border bg-white px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted placeholder:text-ink-faint focus:border-saffron focus:outline-none"
            style={{ fontFamily: "var(--font-mono)", minWidth: "200px" }}
          />
        </div>
      }
    >
      {shortlist.length === 0 ? (
        <EmptyRow>
          No venues yet. Add one above, or accept a suggestion to get started.
        </EmptyRow>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {shortlist.map((v) => (
            <VenueCard
              key={v.id}
              v={v}
              onOpenDetail={() => onOpenDetail(v.id)}
            />
          ))}
        </ul>
      )}
    </PanelCard>
  );
}

function VenueCard({
  v,
  onOpenDetail,
}: {
  v: ShortlistVenue;
  onOpenDetail: () => void;
}) {
  const update = useVenueStore((s) => s.updateShortlistVenue);
  const setStatus = useVenueStore((s) => s.setVenueStatus);
  const toggleCompare = useVenueStore((s) => s.toggleCompareChecked);
  const remove = useVenueStore((s) => s.removeShortlistVenue);

  return (
    <li
      className={cn(
        "group overflow-hidden rounded-md border bg-white transition-colors",
        v.compare_checked ? "border-saffron" : "border-border",
      )}
    >
      <div className="relative aspect-[16/9] bg-ivory-warm">
        {v.hero_image_url ? (
          <img
            src={v.hero_image_url}
            alt={v.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-faint">
            <Heart size={24} strokeWidth={1.2} />
          </div>
        )}
        <StatusPill status={v.status} onChange={(s) => setStatus(v.id, s)} />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-medium text-ink">{v.name}</p>
            <p className="mt-0.5 text-[11.5px] text-ink-muted">{v.location}</p>
          </div>
          <button
            type="button"
            onClick={() => remove(v.id)}
            className="opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
            aria-label="Remove"
          >
            <Trash2 size={12} />
          </button>
        </div>

        <p className="mt-2 text-[12px] leading-relaxed italic text-ink-muted">
          {v.vibe_summary || "—"}
        </p>

        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-border/60 pt-3 text-[11.5px]">
          <Fact
            label="Capacity"
            value={v.capacity}
            onSave={(n) => update(v.id, { capacity: n })}
          />
          <Fact
            label="In / Out"
            value={INDOOR_OUTDOOR_LABEL[v.indoor_outdoor]}
            onSave={() => {}}
            readOnly
          />
          <Fact
            label="Catering"
            value={v.catering_policy}
            onSave={(n) => update(v.id, { catering_policy: n })}
          />
          <Fact
            label="Est. cost"
            value={v.cost_note}
            onSave={(n) => update(v.id, { cost_note: n })}
          />
        </dl>

        <div className="mt-3 border-t border-border/60 pt-3">
          <Eyebrow className="mb-1">Your notes</Eyebrow>
          <InlineText
            value={v.your_notes}
            onSave={(n) => update(v.id, { your_notes: n })}
            variant="block"
            allowEmpty
            multilineRows={2}
            placeholder="What stood out? What worried you?"
            emptyLabel="Click to add notes…"
            className="!p-0 text-[12px] leading-relaxed"
          />
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
          <label className="flex cursor-pointer items-center gap-2 text-[11.5px] text-ink-muted">
            <input
              type="checkbox"
              checked={v.compare_checked}
              onChange={() => toggleCompare(v.id)}
              className="h-3.5 w-3.5 rounded border-border text-saffron focus:ring-saffron"
            />
            Compare
          </label>
          <button
            type="button"
            onClick={onOpenDetail}
            className="flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted transition-colors hover:border-saffron hover:text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <NotebookPen size={10} /> Details · notes
          </button>
        </div>
      </div>
    </li>
  );
}

function Fact({
  label,
  value,
  onSave,
  readOnly,
}: {
  label: string;
  value: string;
  onSave: (next: string) => void;
  readOnly?: boolean;
}) {
  return (
    <>
      <dt
        className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </dt>
      <dd className="text-[11.5px] text-ink">
        {readOnly ? (
          <span>{value || "—"}</span>
        ) : (
          <InlineText
            value={value}
            onSave={onSave}
            allowEmpty
            placeholder="—"
            className="!p-0 text-[11.5px]"
          />
        )}
      </dd>
    </>
  );
}

// ── Status pill (pops into a tiny dropdown on click) ──────────────────────

const STATUS_TONE: Record<VenueStatus, string> = {
  researching: "border-border bg-white text-ink-muted",
  site_visit_planned: "border-amber-400 bg-amber-50 text-amber-700",
  visited: "border-sage bg-sage-pale/60 text-sage",
  shortlisted: "border-saffron bg-saffron-pale/60 text-saffron",
  booked: "border-ink bg-ink text-ivory",
  passed: "border-stone-300 bg-stone-50 text-stone-500",
};

function StatusPill({
  status,
  onChange,
}: {
  status: VenueStatus;
  onChange: (s: VenueStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="absolute left-2 top-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "rounded-full border px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em]",
          STATUS_TONE[status],
        )}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {VENUE_STATUS_LABEL[status]}
      </button>
      {open && (
        <ul className="absolute left-0 top-full z-10 mt-1 w-[180px] overflow-hidden rounded-md border border-border bg-white shadow-lg">
          {(Object.keys(VENUE_STATUS_LABEL) as VenueStatus[]).map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => {
                  onChange(s);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11.5px] text-ink hover:bg-ivory-warm/60"
              >
                <span
                  className={cn(
                    "inline-block h-1.5 w-1.5 rounded-full",
                    s === status ? "bg-saffron" : "bg-transparent border border-border",
                  )}
                />
                {VENUE_STATUS_LABEL[s]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Compare strip ────────────────────────────────────────────────────────

function CompareStrip() {
  const shortlist = useVenueStore((s) => s.shortlist);
  const update = useVenueStore((s) => s.updateShortlistVenue);
  const compared = shortlist.filter((v) => v.compare_checked);

  if (compared.length < 2) return null;

  return (
    <PanelCard
      title={`Compare · ${compared.length} venues`}
      badge={
        <span
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Feel · Fit · Logistics
        </span>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-[12.5px]">
          <thead>
            <tr className="border-b border-border">
              <th className="w-[160px] py-2 pr-3 text-left align-bottom">
                <Eyebrow>Venue</Eyebrow>
              </th>
              {compared.map((v) => (
                <th key={v.id} className="min-w-[180px] px-3 py-2 text-left">
                  <p className="text-[13px] font-medium text-ink">{v.name}</p>
                  <p className="mt-0.5 text-[11px] text-ink-muted">{v.location}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <BandHeader>the feel</BandHeader>
            <Row label="Vibe">
              {compared.map((v) => (
                <td key={v.id} className="px-3 py-2 align-top italic text-ink-muted">
                  {v.vibe_summary || "—"}
                </td>
              ))}
            </Row>
            <Row label="Your notes">
              {compared.map((v) => (
                <td key={v.id} className="px-3 py-2 align-top">
                  <InlineText
                    value={v.your_notes}
                    onSave={(n) => update(v.id, { your_notes: n })}
                    variant="block"
                    allowEmpty
                    placeholder="Your notes…"
                    className="!p-0 text-[12px]"
                  />
                </td>
              ))}
            </Row>
            <Row label="Planner">
              {compared.map((v) => (
                <td key={v.id} className="px-3 py-2 align-top">
                  <InlineText
                    value={v.planner_notes}
                    onSave={(n) => update(v.id, { planner_notes: n })}
                    variant="block"
                    allowEmpty
                    placeholder="Planner notes…"
                    className="!p-0 text-[12px]"
                  />
                </td>
              ))}
            </Row>

            <BandHeader>the fit</BandHeader>
            <Row label="Capacity">
              {compared.map((v) => (
                <CellEdit
                  key={v.id}
                  value={v.capacity}
                  onSave={(n) => update(v.id, { capacity: n })}
                />
              ))}
            </Row>
            <Row label="Indoor / outdoor">
              {compared.map((v) => (
                <td key={v.id} className="px-3 py-2 align-top">
                  {INDOOR_OUTDOOR_LABEL[v.indoor_outdoor]}
                </td>
              ))}
            </Row>
            <Row label="Catering">
              {compared.map((v) => (
                <CellEdit
                  key={v.id}
                  value={v.catering_policy}
                  onSave={(n) => update(v.id, { catering_policy: n })}
                />
              ))}
            </Row>
            <Row label="Fire policy">
              {compared.map((v) => (
                <CellEdit
                  key={v.id}
                  value={v.fire_policy}
                  onSave={(n) => update(v.id, { fire_policy: n })}
                />
              ))}
            </Row>
            <Row label="Noise curfew">
              {compared.map((v) => (
                <CellEdit
                  key={v.id}
                  value={v.noise_curfew}
                  onSave={(n) => update(v.id, { noise_curfew: n })}
                />
              ))}
            </Row>
            <Row label="Rooms">
              {compared.map((v) => (
                <CellEdit
                  key={v.id}
                  value={v.rooms}
                  onSave={(n) => update(v.id, { rooms: n })}
                />
              ))}
            </Row>
            <Row label="Cost">
              {compared.map((v) => (
                <CellEdit
                  key={v.id}
                  value={v.cost_note}
                  onSave={(n) => update(v.id, { cost_note: n })}
                />
              ))}
            </Row>

            <BandHeader>the logistics</BandHeader>
            <Row label="Airport">
              {compared.map((v) => (
                <CellEdit
                  key={v.id}
                  value={v.airport_distance}
                  onSave={(n) => update(v.id, { airport_distance: n })}
                />
              ))}
            </Row>
            <Row label="Guest stays">
              {compared.map((v) => (
                <CellEdit
                  key={v.id}
                  value={v.guest_accommodation}
                  onSave={(n) => update(v.id, { guest_accommodation: n })}
                />
              ))}
            </Row>
            <Row label="Loading dock">
              {compared.map((v) => (
                <CellEdit
                  key={v.id}
                  value={v.loading_dock}
                  onSave={(n) => update(v.id, { loading_dock: n })}
                />
              ))}
            </Row>
            <Row label="Power">
              {compared.map((v) => (
                <CellEdit
                  key={v.id}
                  value={v.power}
                  onSave={(n) => update(v.id, { power: n })}
                />
              ))}
            </Row>
            <Row label="Permits">
              {compared.map((v) => (
                <CellEdit
                  key={v.id}
                  value={v.permits}
                  onSave={(n) => update(v.id, { permits: n })}
                />
              ))}
            </Row>
          </tbody>
        </table>
      </div>
    </PanelCard>
  );
}

function BandHeader({ children }: { children: React.ReactNode }) {
  return (
    <tr className="border-y border-border/60 bg-ivory-warm/40">
      <td
        colSpan={999}
        className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-saffron"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {children}
      </td>
    </tr>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <tr className="border-b border-border/40 last:border-b-0">
      <td
        className="py-2 pr-3 align-top font-mono text-[10px] uppercase tracking-[0.08em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </td>
      {children}
    </tr>
  );
}

function CellEdit({
  value,
  onSave,
}: {
  value: string;
  onSave: (next: string) => void;
}) {
  return (
    <td className="px-3 py-2 align-top">
      <InlineText
        value={value}
        onSave={onSave}
        allowEmpty
        placeholder="—"
        className="!p-0 text-[12px]"
      />
    </td>
  );
}
