"use client";

// ── Site Visits tab ────────────────────────────────────────────────────────
// Per-visit cards with:
//   · date, attendees, weather, photos, notes
//   · structured checklist of things to verify on a visit (kitchen, dock,
//     bridal suite, outdoor backup, sound test, parking, guest rooms)
//   · "Questions to ask" — AI-generated from events + Dream & Discover +
//     unresolved logistics fields. Placeholder today, derived heuristic
//     (no network) as a stand-in.
//   · voice-memo upload slot (transcription wiring out of scope)
//   · heart rating 1–5 (emotional, not stars)
//   · follow-up checklist

import { useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Compass,
  FileText,
  Heart,
  Info,
  Mic,
  Plus,
  Sparkles,
  Tag as TagIcon,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useVenueStore } from "@/stores/venue-store";
import type { SiteVisit, SiteVisitPhoto, VisitRating } from "@/types/venue";
import {
  EmptyRow,
  Eyebrow,
  PanelCard,
} from "@/components/workspace/blocks/primitives";
import { InlineText } from "@/components/workspace/editable/InlineText";
import {
  PRE_VISIT_ALL_ITEM_IDS,
  PRE_VISIT_QUIZ,
} from "@/lib/venue/pre-visit-quiz";
import { analyzePhoto } from "@/lib/venue/mock-ai";

export function VenueSiteVisits() {
  const visits = useVenueStore((s) => s.site_visits);
  const addVisit = useVenueStore((s) => s.addSiteVisit);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-serif text-[18px] leading-tight text-ink">
            site visits
          </h3>
          <p className="mt-1 max-w-xl text-[12.5px] text-ink-muted">
            Every visit leaves a card — photos, notes, checklist, and a
            gut-check rating. Your planner and future-you will thank you.
          </p>
        </div>
        <button
          type="button"
          onClick={() => addVisit()}
          className="flex items-center gap-1 rounded-sm border border-saffron bg-saffron px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-ivory hover:bg-saffron/90"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <Plus size={11} /> New visit
        </button>
      </div>

      {visits.length === 0 ? (
        <PanelCard title="">
          <EmptyRow>
            No visits logged yet — add one before or after your first walk-through.
          </EmptyRow>
        </PanelCard>
      ) : (
        <ul className="space-y-4">
          {visits
            .slice()
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((v) => (
              <VisitCard key={v.id} visit={v} />
            ))}
        </ul>
      )}
    </div>
  );
}

// ── Visit card ────────────────────────────────────────────────────────────

function VisitCard({ visit }: { visit: SiteVisit }) {
  const shortlist = useVenueStore((s) => s.shortlist);
  const update = useVenueStore((s) => s.updateSiteVisit);
  const remove = useVenueStore((s) => s.removeSiteVisit);
  const venue = shortlist.find((v) => v.id === visit.venue_id) ?? null;

  return (
    <li className="overflow-hidden rounded-lg border border-border bg-white shadow-[0_1px_1px_rgba(26,26,26,0.03)]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-ivory-warm/40 px-5 py-3">
        <div className="flex items-center gap-3">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-white font-mono text-[10px] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {visit.visit_index}
          </span>
          <div>
            <p className="text-[13px] font-medium text-ink">
              {venue?.name || "Visit"}
            </p>
            <InlineText
              value={visit.date}
              onSave={(n) => update(visit.id, { date: n })}
              allowEmpty
              placeholder="2026-02-15"
              emptyLabel="Click to set date…"
              className="!p-0 font-mono text-[11px] text-ink-muted"
              editClassName="font-mono text-[11px]"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <HeartRating
            rating={visit.rating}
            onChange={(r) => update(visit.id, { rating: r })}
          />
          <button
            type="button"
            onClick={() => remove(visit.id)}
            className="rounded-sm border border-border bg-white p-1 text-ink-faint hover:border-rose hover:text-rose"
            aria-label="Remove visit"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </header>

      <PreVisitQuiz visit={visit} />

      <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-2">
        <div className="space-y-4">
          <Meta visit={visit} />
          <Photos visit={visit} />
          <Notes visit={visit} />
          <VoiceMemo visit={visit} />
        </div>
        <div className="space-y-4">
          <Checklist visit={visit} />
          <QuestionsToAsk venueId={visit.venue_id} />
          <FollowUps visit={visit} />
        </div>
      </div>

      <VisitSummary visit={visit} />
    </li>
  );
}

// ── Pre-visit quiz (educational prep before the walk-through) ─────────────
// Collapsible, expands by default when the visit has no pre-visit answers yet.
// Each item has a tip that expands inline — "when you visit, look at and ask
// about these things." Progress pill in the header shows X/Y covered.

function PreVisitQuiz({ visit }: { visit: SiteVisit }) {
  const toggle = useVenueStore((s) => s.togglePreVisitQuizItem);
  const completedCount = PRE_VISIT_ALL_ITEM_IDS.filter(
    (id) => visit.pre_visit_quiz[id],
  ).length;
  const total = PRE_VISIT_ALL_ITEM_IDS.length;
  const defaultOpen = completedCount === 0 && !visit.date;
  const [open, setOpen] = useState(defaultOpen);
  const [expandedTip, setExpandedTip] = useState<string | null>(null);

  return (
    <section className="border-b border-border/60 bg-saffron-pale/10">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-saffron text-ivory">
            <Compass size={12} strokeWidth={1.8} />
          </span>
          <div>
            <p className="text-[12.5px] font-medium text-ink">
              Pre-visit prep · when you walk in, look at these things
            </p>
            <p className="mt-0.5 text-[11px] text-ink-muted">
              <span
                className="font-mono tabular-nums"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {completedCount}/{total} covered
              </span>{" "}
              · tap any row for a tip
            </p>
          </div>
        </div>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && (
        <div className="border-t border-saffron/15 px-5 py-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {PRE_VISIT_QUIZ.map((group) => (
              <div key={group.id}>
                <Eyebrow className="mb-2">{group.title}</Eyebrow>
                <ul className="space-y-1.5">
                  {group.items.map((item) => {
                    const checked = !!visit.pre_visit_quiz[item.id];
                    const expanded = expandedTip === item.id;
                    return (
                      <li
                        key={item.id}
                        className="rounded-md border border-border/60 bg-white"
                      >
                        <div className="flex items-start gap-2 p-2">
                          <button
                            type="button"
                            onClick={() => toggle(visit.id, item.id)}
                            className={cn(
                              "mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
                              checked
                                ? "border-saffron bg-saffron text-ivory"
                                : "border-border bg-white text-transparent hover:border-saffron",
                            )}
                            aria-label={checked ? "Uncheck" : "Check"}
                          >
                            <Check size={10} strokeWidth={2.5} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedTip(expanded ? null : item.id)
                            }
                            className="flex-1 text-left text-[12.5px] leading-snug text-ink hover:text-saffron"
                          >
                            {item.label}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedTip(expanded ? null : item.id)
                            }
                            className="shrink-0 text-ink-faint hover:text-saffron"
                            aria-label="Show tip"
                          >
                            <Info size={11} />
                          </button>
                        </div>
                        {expanded && (
                          <div className="border-t border-border/60 bg-ivory-warm/40 px-8 py-2 text-[11.5px] italic leading-relaxed text-ink-muted">
                            {item.tip}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// ── Visit summary (AI-generated key takeaways) ───────────────────────────

function VisitSummary({ visit }: { visit: SiteVisit }) {
  const shortlist = useVenueStore((s) => s.shortlist);
  const discovery = useVenueStore((s) => s.discovery);
  const setSummary = useVenueStore((s) => s.setVisitSummary);

  const venue = shortlist.find((v) => v.id === visit.venue_id) ?? null;

  function generate() {
    const parts: string[] = [];
    if (venue) parts.push(`${venue.name} visit summary`);

    const prepCovered = PRE_VISIT_ALL_ITEM_IDS.filter(
      (id) => visit.pre_visit_quiz[id],
    ).length;
    const prepTotal = PRE_VISIT_ALL_ITEM_IDS.length;
    const checklistDone = visit.checklist.filter((c) => c.checked).length;
    const followUps = visit.follow_ups.filter((f) => !f.done).length;
    const photosTagged = visit.photos.filter((p) => p.space_tag).length;
    const rating = visit.rating ?? 0;

    parts.push(
      `Covered ${prepCovered}/${prepTotal} pre-visit prep items and ${checklistDone}/${visit.checklist.length} on-site checks.`,
    );
    if (photosTagged > 0) {
      parts.push(
        `Captured ${photosTagged} tagged photo${photosTagged === 1 ? "" : "s"} of key spaces.`,
      );
    }
    if (followUps > 0) {
      parts.push(
        `${followUps} open follow-up${followUps === 1 ? "" : "s"} to close before committing.`,
      );
    }
    if (rating > 0) {
      parts.push(
        `Heart-rating ${rating}/5 — ${rating >= 4 ? "strong contender" : rating >= 3 ? "solid, worth a second look" : "soft match at best"}.`,
      );
    }
    if (discovery.quiz.completed && discovery.quiz.answers.vibes.length > 0) {
      parts.push(
        `Holds ${discovery.quiz.answers.vibes.length} of your loved vibes from the Discovery quiz.`,
      );
    }
    if (visit.notes.trim()) {
      const first = visit.notes.trim().split(/\.\s/)[0];
      parts.push(`Your note: "${first}${first.endsWith(".") ? "" : "."}"`);
    }
    setSummary(visit.id, parts.join(" "));
  }

  return (
    <section className="border-t border-border/60 bg-ivory-warm/30 px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-saffron" strokeWidth={1.8} />
          <Eyebrow>Visit summary</Eyebrow>
        </div>
        <button
          type="button"
          onClick={generate}
          className="flex items-center gap-1 rounded-sm border border-border bg-white px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted transition-colors hover:border-saffron hover:text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <Wand2 size={10} /> {visit.visit_summary ? "Re-summarize" : "Summarize visit"}
        </button>
      </div>
      {visit.visit_summary ? (
        <p className="mt-2 max-w-prose font-serif text-[14px] italic leading-relaxed text-ink">
          {visit.visit_summary}
        </p>
      ) : (
        <p className="mt-2 text-[12px] italic text-ink-faint">
          Once you fill in the prep checklist, photos, and follow-ups, tap
          Summarize visit — we'll stitch the signals into one paragraph for
          future-you.
        </p>
      )}
    </section>
  );
}

// ── Meta (attendees, weather, venue) ──────────────────────────────────────

function Meta({ visit }: { visit: SiteVisit }) {
  const shortlist = useVenueStore((s) => s.shortlist);
  const update = useVenueStore((s) => s.updateSiteVisit);
  return (
    <div className="rounded-md border border-border/60 bg-white p-3">
      <MetaRow label="Venue">
        <select
          value={visit.venue_id ?? ""}
          onChange={(e) =>
            update(visit.id, { venue_id: e.target.value || null })
          }
          className="w-full rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink focus:border-saffron focus:outline-none"
        >
          <option value="">—</option>
          {shortlist.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      </MetaRow>
      <MetaRow label="Attendees">
        <InlineText
          value={visit.attendees}
          onSave={(n) => update(visit.id, { attendees: n })}
          allowEmpty
          placeholder="Priya, Raj, planner, parents"
          className="!p-0 text-[12px]"
        />
      </MetaRow>
      <MetaRow label="Weather">
        <InlineText
          value={visit.weather}
          onSave={(n) => update(visit.id, { weather: n })}
          allowEmpty
          placeholder="55°F, overcast (stress-tested outdoor)"
          className="!p-0 text-[12px]"
        />
      </MetaRow>
    </div>
  );
}

function MetaRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[88px_1fr] items-start gap-2 py-1">
      <Eyebrow className="pt-1">{label}</Eyebrow>
      <div>{children}</div>
    </div>
  );
}

// ── Photos ────────────────────────────────────────────────────────────────

const SPACE_TAG_SUGGESTIONS = [
  "Ballroom",
  "Garden",
  "Courtyard",
  "Terrace",
  "Bridal Suite",
  "Kitchen",
  "Parking",
  "Entrance",
  "Ceremony Lawn",
];

function Photos({ visit }: { visit: SiteVisit }) {
  const add = useVenueStore((s) => s.addVisitPhoto);
  const remove = useVenueStore((s) => s.removeVisitPhoto);
  const fileInput = useRef<HTMLInputElement>(null);
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between">
        <Eyebrow className="mb-1.5">Photos · tap to tag + analyze</Eyebrow>
        <span
          className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {visit.photos.length} photo{visit.photos.length === 1 ? "" : "s"}
        </span>
      </div>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {visit.photos.map((p) => (
          <PhotoTile
            key={p.id}
            visitId={visit.id}
            photo={p}
            expanded={expandedPhoto === p.id}
            onToggle={() =>
              setExpandedPhoto(expandedPhoto === p.id ? null : p.id)
            }
            onRemove={() => remove(visit.id, p.id)}
          />
        ))}
        <li>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="flex h-full min-h-[96px] w-full flex-col items-center justify-center gap-1 rounded-sm border border-dashed border-border bg-ivory-warm/40 text-ink-muted hover:border-saffron hover:text-saffron"
          >
            <Plus size={14} />
            <span
              className="font-mono text-[9.5px] uppercase tracking-[0.08em]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Add photos
            </span>
          </button>
        </li>
      </ul>
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          for (const f of Array.from(e.target.files ?? [])) {
            add(
              visit.id,
              URL.createObjectURL(f),
              f.name.replace(/\.[^.]+$/, ""),
            );
          }
          e.target.value = "";
        }}
      />
    </div>
  );
}

function PhotoTile({
  visitId,
  photo,
  expanded,
  onToggle,
  onRemove,
}: {
  visitId: string;
  photo: SiteVisitPhoto;
  expanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const updatePhoto = useVenueStore((s) => s.updateVisitPhoto);
  const discovery = useVenueStore((s) => s.discovery);

  function runAnalysis() {
    const result = analyzePhoto(photo.space_tag, photo.caption, {
      guestCount: 300,
      primaryVibe: discovery.quiz.answers.vibes[0] ?? null,
      eventScope: discovery.quiz.answers.event_scope,
    });
    updatePhoto(visitId, photo.id, { ai_analysis: result });
  }

  return (
    <li
      className={cn(
        "group relative overflow-hidden rounded-sm ring-1 transition-[grid-column] duration-200",
        photo.space_tag ? "ring-saffron/40" : "ring-border",
        expanded && "col-span-2 sm:col-span-3",
      )}
    >
      <div className={cn("relative", expanded ? "aspect-[16/9]" : "aspect-[4/3]")}>
        <img
          src={photo.url}
          alt={photo.caption}
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        {photo.space_tag && (
          <span
            className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-saffron shadow"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <TagIcon size={9} /> {photo.space_tag}
          </span>
        )}
        <div className="absolute right-1.5 top-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={onToggle}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-ink-muted shadow ring-1 ring-border hover:text-saffron"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-ink-muted shadow ring-1 ring-border hover:text-rose"
            aria-label="Remove"
          >
            <X size={11} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-2 border-t border-border bg-white p-3">
          <div>
            <Eyebrow>Space tag</Eyebrow>
            <div className="mt-1 flex flex-wrap gap-1">
              {SPACE_TAG_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() =>
                    updatePhoto(visitId, photo.id, {
                      space_tag: photo.space_tag === s ? "" : s,
                    })
                  }
                  className={cn(
                    "rounded-full border px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.06em] transition-colors",
                    photo.space_tag === s
                      ? "border-saffron bg-saffron text-ivory"
                      : "border-border bg-white text-ink-muted hover:border-saffron/50",
                  )}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {s}
                </button>
              ))}
              <input
                type="text"
                value={
                  photo.space_tag &&
                  !SPACE_TAG_SUGGESTIONS.includes(photo.space_tag)
                    ? photo.space_tag
                    : ""
                }
                onChange={(e) =>
                  updatePhoto(visitId, photo.id, { space_tag: e.target.value })
                }
                placeholder="+ Custom"
                className="rounded-full border border-border bg-white px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.06em] text-ink-muted placeholder:text-ink-faint focus:border-saffron focus:outline-none"
                style={{ fontFamily: "var(--font-mono)", minWidth: 90 }}
              />
            </div>
          </div>

          <div>
            <Eyebrow>Caption</Eyebrow>
            <input
              type="text"
              value={photo.caption}
              onChange={(e) =>
                updatePhoto(visitId, photo.id, { caption: e.target.value })
              }
              placeholder="Your one-liner for this photo…"
              className="mt-1 w-full rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink focus:border-saffron focus:outline-none"
            />
          </div>

          <div className="rounded-md border border-gold/30 bg-gold-pale/10 p-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles size={11} className="text-saffron" />
                <Eyebrow>AI read of this space</Eyebrow>
              </div>
              <button
                type="button"
                onClick={runAnalysis}
                disabled={!photo.space_tag.trim()}
                className={cn(
                  "flex items-center gap-1 rounded-sm border px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] transition-colors",
                  photo.space_tag.trim()
                    ? "border-saffron bg-saffron text-ivory hover:bg-saffron/90"
                    : "cursor-not-allowed border-border bg-transparent text-ink-faint",
                )}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <Wand2 size={9} /> {photo.ai_analysis ? "Re-analyze" : "Analyze"}
              </button>
            </div>
            {photo.ai_analysis ? (
              <p className="mt-2 text-[12px] leading-relaxed text-ink">
                {photo.ai_analysis}
              </p>
            ) : (
              <p className="mt-2 text-[11.5px] italic text-ink-faint">
                {photo.space_tag.trim()
                  ? "Tap Analyze to estimate capacity, suggested uses, and décor directions for this space."
                  : "Tag the space first (above), then we can analyze it."}
              </p>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

// ── Notes ─────────────────────────────────────────────────────────────────

function Notes({ visit }: { visit: SiteVisit }) {
  const update = useVenueStore((s) => s.updateSiteVisit);
  return (
    <div>
      <Eyebrow className="mb-1.5">Notes</Eyebrow>
      <InlineText
        value={visit.notes}
        onSave={(n) => update(visit.id, { notes: n })}
        variant="block"
        allowEmpty
        multilineRows={4}
        placeholder="What surprised you? What made you pause?"
        emptyLabel="Click to write visit notes…"
        className="!p-0 text-[12.5px] leading-relaxed"
      />
    </div>
  );
}

// ── Voice memo (upload only; transcription out of scope) ──────────────────

function VoiceMemo({ visit }: { visit: SiteVisit }) {
  const set = useVenueStore((s) => s.setVisitVoiceMemo);
  const fileInput = useRef<HTMLInputElement>(null);

  return (
    <div>
      <Eyebrow className="mb-1.5">Voice memo</Eyebrow>
      {visit.voice_memo_url ? (
        <div className="flex items-center gap-2 rounded-sm border border-border bg-ivory-warm/40 p-2 text-[12px] text-ink-muted">
          <Mic size={12} />
          <span className="flex-1 truncate italic">
            {visit.voice_memo_caption || "Voice memo uploaded"}
          </span>
          <button
            type="button"
            onClick={() => set(visit.id, null, "")}
            className="hover:text-rose"
          >
            <X size={11} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="flex items-center gap-1.5 rounded-sm border border-dashed border-border bg-ivory-warm/40 px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted hover:border-saffron hover:text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <Mic size={11} /> Upload voice memo
        </button>
      )}
      <input
        ref={fileInput}
        type="file"
        accept="audio/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) set(visit.id, URL.createObjectURL(f), f.name);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ── Checklist ─────────────────────────────────────────────────────────────

function Checklist({ visit }: { visit: SiteVisit }) {
  const toggle = useVenueStore((s) => s.toggleVisitChecklistItem);
  const add = useVenueStore((s) => s.addVisitChecklistItem);
  const remove = useVenueStore((s) => s.removeVisitChecklistItem);
  const [draft, setDraft] = useState("");

  return (
    <div className="rounded-md border border-border/60 bg-white p-3">
      <Eyebrow className="mb-1.5">Did you check…</Eyebrow>
      <ul className="space-y-1">
        {visit.checklist.map((c) => (
          <li key={c.id} className="group flex items-start gap-2">
            <button
              type="button"
              onClick={() => toggle(visit.id, c.id)}
              className={cn(
                "mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
                c.checked
                  ? "border-saffron bg-saffron text-ivory"
                  : "border-border bg-white text-transparent hover:border-saffron",
              )}
            >
              <Check size={10} strokeWidth={2.5} />
            </button>
            <span
              className={cn(
                "flex-1 text-[12.5px]",
                c.checked ? "text-ink" : "text-ink-muted",
              )}
            >
              {c.label}
            </span>
            <button
              type="button"
              onClick={() => remove(visit.id, c.id)}
              className="opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
            >
              <Trash2 size={11} />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex items-center gap-2 border-t border-border pt-2">
        <Plus size={12} className="text-ink-faint" />
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) {
              e.preventDefault();
              add(visit.id, draft.trim());
              setDraft("");
            }
          }}
          placeholder="Add a checklist item…"
          className="flex-1 bg-transparent text-[12px] text-ink placeholder:text-ink-faint focus:outline-none"
        />
      </div>
    </div>
  );
}

// ── Questions to ask (derived placeholder) ────────────────────────────────

function QuestionsToAsk({ venueId }: { venueId: string | null }) {
  const logistics = useVenueStore((s) => s.logistics);
  const requirements = useVenueStore((s) => s.requirements);
  const discoveryWants = useVenueStore((s) => s.discovery.definitely_want);

  // Heuristic: surface unresolved requirements + any logistics field that
  // looks empty-ish. Real AI wiring replaces this later.
  const questions = useMemo(() => {
    const list: string[] = [];
    for (const r of requirements) {
      if (!r.met) list.push(`How does this venue handle: ${r.label}?`);
    }
    if (!logistics.fire_ceremony_policy)
      list.push("What is your fire / havan policy in practice?");
    if (!logistics.power_circuits)
      list.push("Confirm dedicated power circuits for sound and lighting.");
    if (!logistics.wet_weather_backup)
      list.push("Walk me through your rain backup for outdoor events.");
    for (const w of discoveryWants.slice(0, 2)) {
      list.push(`Can you accommodate: ${w}?`);
    }
    return list.slice(0, 6);
  }, [logistics, requirements, discoveryWants]);

  if (!venueId || questions.length === 0) return null;

  return (
    <div className="rounded-md border border-gold/30 bg-gold-pale/10 p-3">
      <div className="flex items-center gap-1.5">
        <Sparkles size={12} className="text-saffron" />
        <Eyebrow>Questions to ask on this visit</Eyebrow>
      </div>
      <ul className="mt-2 space-y-1 text-[12px] text-ink">
        {questions.map((q, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-saffron" />
            {q}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] italic text-ink-faint">
        Pulled from your events, discovery brief, and unresolved logistics.
      </p>
    </div>
  );
}

// ── Follow-ups ────────────────────────────────────────────────────────────

function FollowUps({ visit }: { visit: SiteVisit }) {
  const add = useVenueStore((s) => s.addVisitFollowUp);
  const toggle = useVenueStore((s) => s.toggleVisitFollowUp);
  const remove = useVenueStore((s) => s.removeVisitFollowUp);
  const [draft, setDraft] = useState("");

  return (
    <div>
      <Eyebrow className="mb-1.5">Follow-ups</Eyebrow>
      <ul className="space-y-1">
        {visit.follow_ups.map((f) => (
          <li key={f.id} className="group flex items-start gap-2">
            <button
              type="button"
              onClick={() => toggle(visit.id, f.id)}
              className={cn(
                "mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
                f.done
                  ? "border-saffron bg-saffron text-ivory"
                  : "border-border bg-white text-transparent hover:border-saffron",
              )}
            >
              <Check size={10} strokeWidth={2.5} />
            </button>
            <span
              className={cn(
                "flex-1 text-[12.5px]",
                f.done ? "text-ink-muted line-through" : "text-ink",
              )}
            >
              {f.text}
            </span>
            <button
              type="button"
              onClick={() => remove(visit.id, f.id)}
              className="opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
            >
              <Trash2 size={11} />
            </button>
          </li>
        ))}
        {visit.follow_ups.length === 0 && (
          <li className="text-[12px] italic text-ink-faint">Nothing yet.</li>
        )}
      </ul>
      <div className="mt-2 flex items-center gap-2">
        <Plus size={12} className="text-ink-faint" />
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) {
              e.preventDefault();
              add(visit.id, draft.trim());
              setDraft("");
            }
          }}
          placeholder="Add a follow-up…"
          className="flex-1 bg-transparent text-[12px] text-ink placeholder:text-ink-faint focus:outline-none"
        />
      </div>
    </div>
  );
}

// ── Heart rating (1–5, emotional not stars) ───────────────────────────────

function HeartRating({
  rating,
  onChange,
}: {
  rating: VisitRating;
  onChange: (r: VisitRating) => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const on = rating !== null && rating >= n;
        return (
          <button
            key={n}
            type="button"
            onClick={() =>
              onChange(rating === n ? null : (n as VisitRating))
            }
            className="p-0.5 transition-colors"
            aria-label={`Rate ${n} of 5`}
          >
            <Heart
              size={13}
              strokeWidth={1.6}
              className={on ? "fill-saffron text-saffron" : "text-ink-faint"}
            />
          </button>
        );
      })}
    </div>
  );
}
