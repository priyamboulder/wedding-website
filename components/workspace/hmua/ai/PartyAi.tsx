"use client";

// ── Party AI panels (Bridal Party tab) ────────────────────────────────────
//   1. ChairScheduleOptimizer — takes the existing deterministic roster +
//      schedule settings, sends them through CHAIR_SCHEDULE for a narrative
//      review: non-obvious conflicts, artist utilization, and a recommended
//      touch-up window. Does NOT replace the grid — augments it.
//   2. SmsScheduleDraft — produces per-person SMS messages from the packed
//      schedule so the bride can send them in one go.
//   3. StyleQuizPanel — generates a short style quiz per party member so
//      the artist can read preferences before the chair.

import { useMemo, useState } from "react";
import {
  Check,
  Copy,
  FileText,
  Loader2,
  MessageSquare,
  RotateCcw,
  Send,
  Sparkles,
  Wand2,
} from "lucide-react";
import {
  EmptyRow,
  Eyebrow,
  PanelCard,
  Tag,
} from "@/components/workspace/blocks/primitives";
import { useHmuaStore } from "@/stores/hmua-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type {
  WeddingEvent,
  WorkspaceCategory,
  WorkspaceItem,
} from "@/types/workspace";
import type {
  ChairSchedulePerson,
  StyleQuiz,
} from "@/types/hmua-ai";
import {
  draftSmsMessages,
  generateStyleQuiz,
  reviewChairSchedule,
  AiError,
} from "@/lib/hmua-ai/client";

// ── Shared: extract the roster the same way BridalPartyTab does ──────────

interface PartyMeta {
  person?: string;
  role?: string;
  events?: string[];
  service_level?: "full" | "hair_only" | "makeup_only" | "touchup_only";
  assigned_artist?: string;
  chair_minutes?: number;
  is_bride?: boolean;
}

const SERVICES_FOR_LEVEL: Record<
  NonNullable<PartyMeta["service_level"]>,
  string[]
> = {
  full: ["hair", "makeup"],
  hair_only: ["hair"],
  makeup_only: ["makeup"],
  touchup_only: ["touchup"],
};

function useParty(categoryId: string) {
  const items = useWorkspaceStore((s) => s.items);
  return useMemo(
    () =>
      items
        .filter(
          (i) =>
            i.category_id === categoryId &&
            i.tab === "bridal_party" &&
            i.block_type === "bridal_party_look",
        )
        .sort((a, b) => a.sort_order - b.sort_order),
    [items, categoryId],
  );
}

function buildPeoplePayload(
  party: WorkspaceItem[],
  defaults: { brideMinutes: number; defaultMinutes: number },
  artistsById: Record<string, string>,
): ChairSchedulePerson[] {
  return party.map((p) => {
    const meta = (p.meta ?? {}) as PartyMeta;
    const isBride = !!meta.is_bride;
    const services = meta.service_level
      ? SERVICES_FOR_LEVEL[meta.service_level] ?? ["hair", "makeup"]
      : ["hair", "makeup"];
    return {
      name: p.title || meta.role || "Person",
      role: meta.role ?? (isBride ? "Bride" : "Other"),
      services: isBride ? [...services, "draping"] : services,
      estimated_minutes:
        meta.chair_minutes ??
        (isBride ? defaults.brideMinutes : defaults.defaultMinutes),
      priority: isBride ? 1 : meta.role?.toLowerCase().includes("mother") ? 2 : 3,
      is_bride: isBride,
      assigned_artist: meta.assigned_artist
        ? artistsById[meta.assigned_artist] ?? meta.assigned_artist
        : undefined,
    };
  });
}

// ── 1. Chair Schedule Optimizer ───────────────────────────────────────────

export function ChairScheduleOptimizer({ category }: { category: WorkspaceCategory }) {
  const settings = useHmuaStore((s) => s.getSchedule(category.id));
  const ai = useHmuaStore((s) => s.ai[category.id]);
  const setReview = useHmuaStore((s) => s.setScheduleReview);
  const party = useParty(category.id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const review = ai?.scheduleReview;
  const artistsById = useMemo(
    () => Object.fromEntries(settings.artists.map((a) => [a.id, a.name])),
    [settings.artists],
  );

  const canRun = party.length >= 1 && settings.artists.length >= 1;

  const handleReview = async () => {
    if (!canRun) return;
    setLoading(true);
    setError(null);
    try {
      const people = buildPeoplePayload(party, {
        brideMinutes: settings.bride_chair_minutes,
        defaultMinutes: settings.default_chair_minutes,
      }, artistsById);
      const result = await reviewChairSchedule({
        ceremony_time: settings.ceremony_start,
        bride_ready_by: settings.bride_ready_by,
        team_arrival: settings.team_arrival,
        artists: settings.artists.map((a, i) => ({
          name: a.name,
          specialty: i === 0 ? "bridal" : "general",
        })),
        people,
        buffer_between_people_minutes: 10,
        bride_touch_up_at_end: true,
      });
      setReview(category.id, result);
    } catch (err) {
      setError(err instanceof AiError ? err.message : "Couldn't review schedule.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PanelCard
      icon={<Wand2 size={14} strokeWidth={1.8} />}
      title="AI schedule review"
      badge={
        review ? (
          <button
            type="button"
            onClick={handleReview}
            disabled={loading || !canRun}
            className="flex items-center gap-1 text-[11px] text-ink-muted hover:text-saffron disabled:opacity-60"
          >
            {loading ? <Loader2 size={10} className="animate-spin" /> : <RotateCcw size={10} />}
            Re-review
          </button>
        ) : null
      }
    >
      {!review ? (
        <div className="space-y-3">
          <p className="text-[12.5px] text-ink-muted">
            Send the current roster through the AI to catch conflicts the
            lane-packer can't see: photo timing clashes, family protocol
            overlaps, lead-artist overruns. You'll get a narrative summary
            and a recommended bride touch-up window.
          </p>
          {!canRun ? (
            <EmptyRow>
              Add the bride and at least one artist first.
            </EmptyRow>
          ) : (
            <button
              type="button"
              onClick={handleReview}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12.5px] font-medium text-ivory hover:opacity-90 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Reviewing…
                </>
              ) : (
                <>
                  <Sparkles size={13} strokeWidth={1.8} />
                  Review schedule
                </>
              )}
            </button>
          )}
          {error && (
            <div className="rounded-md border border-rose/40 bg-rose-pale/30 px-3 py-2 text-[12px] text-rose">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <Eyebrow>Summary</Eyebrow>
            <p className="mt-1 text-[13px] leading-relaxed text-ink">
              {review.summary}
            </p>
          </div>

          {review.warnings.length > 0 ? (
            <div>
              <Eyebrow>Watch-outs</Eyebrow>
              <ul className="mt-1.5 space-y-1.5">
                {review.warnings.map((w, i) => (
                  <li
                    key={i}
                    className="rounded-md border border-amber-400 bg-amber-50 px-3 py-2 text-[12.5px] text-amber-800"
                  >
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="rounded-md border border-sage/40 bg-sage-pale/30 px-3 py-2 text-[12.5px] text-ink">
              <Check size={12} className="mr-1 inline-block text-sage" />
              No additional watch-outs beyond what the lane-packer already catches.
            </div>
          )}

          {review.artist_utilization.length > 0 && (
            <div>
              <Eyebrow>Artist utilization</Eyebrow>
              <div className="mt-1.5 grid grid-cols-1 gap-2 md:grid-cols-3">
                {review.artist_utilization.map((u) => (
                  <div key={u.artist} className="rounded-md border border-border bg-white p-2.5">
                    <p className="text-[12.5px] font-medium text-ink">{u.artist}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-ink-muted" style={{ fontFamily: "var(--font-mono)" }}>
                      {u.total_hours.toFixed(1)}h · {u.people_count} people · {u.idle_minutes}m idle
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {review.bride_touch_up && (
            <div className="rounded-md border border-saffron/40 bg-saffron-pale/20 px-3 py-2.5">
              <Eyebrow className="text-saffron">Bride touch-up</Eyebrow>
              <p className="mt-1 text-[13px] font-medium text-ink">
                {review.bride_touch_up.time} · {review.bride_touch_up.artist}
              </p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink">
                {review.bride_touch_up.notes}
              </p>
            </div>
          )}
        </div>
      )}
    </PanelCard>
  );
}

// ── 2. SMS Schedule Draft ─────────────────────────────────────────────────

interface WeddingInfo {
  brideName: string;
  eventLabel: string;
  venue: string;
  gettingReadyLocation: string;
  uploadBase: string;
  includeUploadLink: boolean;
}

const DEFAULT_WEDDING_INFO: WeddingInfo = {
  brideName: "",
  eventLabel: "Wedding Day",
  venue: "",
  gettingReadyLocation: "",
  uploadBase: "https://ananya.app/upload/",
  includeUploadLink: true,
};

export function SmsScheduleDraft({ category }: { category: WorkspaceCategory }) {
  const settings = useHmuaStore((s) => s.getSchedule(category.id));
  const ai = useHmuaStore((s) => s.ai[category.id]);
  const setDrafts = useHmuaStore((s) => s.setSmsDrafts);
  const party = useParty(category.id);

  const [info, setInfo] = useState<WeddingInfo>(DEFAULT_WEDDING_INFO);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedPerson, setCopiedPerson] = useState<string | null>(null);

  const drafts = ai?.smsDrafts ?? [];
  const artistsById = useMemo(
    () => Object.fromEntries(settings.artists.map((a) => [a.id, a.name])),
    [settings.artists],
  );

  const packed = useMemo(
    () => packSimpleSchedule(party, settings, artistsById),
    [party, settings, artistsById],
  );

  const canRun = packed.length > 0 && info.brideName.trim().length > 0;

  const handleDraft = async () => {
    if (!canRun) return;
    setLoading(true);
    setError(null);
    try {
      const result = await draftSmsMessages({
        schedule: packed.map((p) => ({
          person: p.person,
          artist: p.artist,
          start: p.start,
          services: p.services,
        })),
        wedding_details: {
          bride_name: info.brideName,
          event: info.eventLabel,
          venue: info.venue || undefined,
          getting_ready_location: info.gettingReadyLocation || undefined,
        },
        include_inspo_upload_link: info.includeUploadLink,
        upload_link_base: info.includeUploadLink ? info.uploadBase : undefined,
      });
      setDrafts(category.id, result);
    } catch (err) {
      setError(err instanceof AiError ? err.message : "Couldn't draft messages.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (person: string, message: string) => {
    try {
      await navigator.clipboard.writeText(message);
      setCopiedPerson(person);
      window.setTimeout(() => setCopiedPerson(null), 1200);
    } catch {
      // clipboard blocked — no-op
    }
  };

  return (
    <PanelCard
      icon={<MessageSquare size={14} strokeWidth={1.8} />}
      title="SMS drafts for the party"
      badge={
        drafts.length > 0 ? (
          <button
            type="button"
            onClick={handleDraft}
            disabled={loading || !canRun}
            className="flex items-center gap-1 text-[11px] text-ink-muted hover:text-saffron disabled:opacity-60"
          >
            {loading ? <Loader2 size={10} className="animate-spin" /> : <RotateCcw size={10} />}
            Redraft
          </button>
        ) : null
      }
    >
      <div className="space-y-4">
        {/* Wedding info inputs */}
        <div className="rounded-md border border-border/60 bg-ivory-warm/30 p-3">
          <Eyebrow>Wedding details for the message</Eyebrow>
          <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
            <InfoField
              label="Bride's name"
              value={info.brideName}
              placeholder="Ananya"
              onChange={(v) => setInfo({ ...info, brideName: v })}
            />
            <InfoField
              label="Event label"
              value={info.eventLabel}
              placeholder="Wedding Day"
              onChange={(v) => setInfo({ ...info, eventLabel: v })}
            />
            <InfoField
              label="Venue"
              value={info.venue}
              placeholder="The Resort at Pelican Hill"
              onChange={(v) => setInfo({ ...info, venue: v })}
            />
            <InfoField
              label="Getting-ready location"
              value={info.gettingReadyLocation}
              placeholder="Bridal Suite, Building 3"
              onChange={(v) => setInfo({ ...info, gettingReadyLocation: v })}
            />
          </div>
          <label className="mt-2 flex items-center gap-2 text-[12px] text-ink">
            <input
              type="checkbox"
              checked={info.includeUploadLink}
              onChange={(e) => setInfo({ ...info, includeUploadLink: e.target.checked })}
              className="h-3.5 w-3.5 rounded border-border text-saffron focus:ring-saffron"
            />
            Include per-person inspo upload link
          </label>
        </div>

        {/* Status / action */}
        {drafts.length === 0 ? (
          <div className="space-y-3">
            <p className="text-[12.5px] text-ink-muted">
              The AI drafts a warm, functional text for each person with
              their chair time, artist, and prep instructions. Review, copy,
              and send.
            </p>
            {packed.length === 0 ? (
              <EmptyRow>Add people and a schedule first.</EmptyRow>
            ) : !info.brideName.trim() ? (
              <EmptyRow>Set the bride's name to personalize the messages.</EmptyRow>
            ) : (
              <button
                type="button"
                onClick={handleDraft}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12.5px] font-medium text-ivory hover:opacity-90 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Drafting…
                  </>
                ) : (
                  <>
                    <Send size={13} strokeWidth={1.8} />
                    Draft messages for {packed.length} people
                  </>
                )}
              </button>
            )}
            {error && (
              <div className="rounded-md border border-rose/40 bg-rose-pale/30 px-3 py-2 text-[12px] text-rose">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {drafts.map((m) => (
              <article key={m.person} className="rounded-md border border-border bg-white p-3">
                <header className="flex items-center justify-between gap-2">
                  <h5 className="text-[13px] font-medium text-ink">{m.person}</h5>
                  <div className="flex items-center gap-2">
                    <Tag tone={m.estimated_chars > 500 ? "rose" : "stone"}>
                      {m.estimated_chars} chars
                    </Tag>
                    <button
                      type="button"
                      onClick={() => handleCopy(m.person, m.message)}
                      className="flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-0.5 text-[11px] text-ink-muted hover:text-saffron"
                    >
                      {copiedPerson === m.person ? (
                        <>
                          <Check size={10} strokeWidth={2} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={10} strokeWidth={1.8} />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </header>
                <pre className="mt-2 whitespace-pre-wrap font-sans text-[12.5px] leading-relaxed text-ink">
                  {m.message}
                </pre>
              </article>
            ))}
          </div>
        )}
      </div>
    </PanelCard>
  );
}

function InfoField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Eyebrow>{label}</Eyebrow>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
      />
    </div>
  );
}

// ── Simple scheduler — mirrors BridalPartyTab's packer, minus the grid ────

interface SimpleSlot {
  person: string;
  artist: string;
  start: string;  // HH:mm
  services: string[];
}

function parseTime(t: string): number {
  const [h, m] = t.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
}

function fmtTimeHHMM(minutes: number): string {
  const total = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function packSimpleSchedule(
  party: WorkspaceItem[],
  settings: {
    ceremony_start: string;
    bride_ready_by: string;
    team_arrival: string;
    bride_chair_minutes: number;
    default_chair_minutes: number;
    artists: { id: string; name: string }[];
  },
  artistsById: Record<string, string>,
): SimpleSlot[] {
  const slots: SimpleSlot[] = [];
  if (settings.artists.length === 0 || party.length === 0) return slots;

  const teamArrival = parseTime(settings.team_arrival);
  const brideReadyBy = parseTime(settings.bride_ready_by);

  const bride = party.find((p) => (p.meta as PartyMeta)?.is_bride);
  const others = party.filter((p) => !(p.meta as PartyMeta)?.is_bride);

  if (bride) {
    const meta = (bride.meta ?? {}) as PartyMeta;
    const dur = meta.chair_minutes ?? settings.bride_chair_minutes;
    const services = meta.service_level
      ? SERVICES_FOR_LEVEL[meta.service_level] ?? ["hair", "makeup"]
      : ["hair", "makeup"];
    slots.push({
      person: bride.title || "Bride",
      artist: settings.artists[0]?.name ?? "Lead artist",
      start: fmtTimeHHMM(brideReadyBy - dur),
      services: [...services, "draping"],
    });
  }

  // Others: pack into lanes excluding lead (if bride exists).
  const otherLanes = bride && settings.artists.length > 1 ? settings.artists.slice(1) : settings.artists;
  const nextFree: number[] = otherLanes.map(() => teamArrival);

  for (const p of others) {
    const meta = (p.meta ?? {}) as PartyMeta;
    const dur = meta.chair_minutes ?? settings.default_chair_minutes;
    const services = meta.service_level
      ? SERVICES_FOR_LEVEL[meta.service_level] ?? ["hair", "makeup"]
      : ["hair", "makeup"];

    let laneIdx = 0;
    if (meta.assigned_artist) {
      const explicit = otherLanes.findIndex((a) => a.id === meta.assigned_artist);
      if (explicit !== -1) laneIdx = explicit;
    } else {
      for (let i = 1; i < nextFree.length; i++) {
        if (nextFree[i]! < nextFree[laneIdx]!) laneIdx = i;
      }
    }
    const start = nextFree[laneIdx] ?? teamArrival;
    slots.push({
      person: p.title || meta.role || "Person",
      artist: otherLanes[laneIdx]?.name ?? "Artist",
      start: fmtTimeHHMM(start),
      services,
    });
    nextFree[laneIdx] = start + dur + 10; // 10m buffer
  }

  // Sort by start time for display.
  return slots.sort((a, b) => parseTime(a.start) - parseTime(b.start));
}

// ── 3. Style Quiz panel (per party member) ────────────────────────────────

export function StyleQuizPanel({ category }: { category: WorkspaceCategory }) {
  const party = useParty(category.id);
  const ai = useHmuaStore((s) => s.ai[category.id]);
  const setQuiz = useHmuaStore((s) => s.setPartyQuiz);

  const nonBride = party.filter((p) => !(p.meta as PartyMeta)?.is_bride);

  return (
    <PanelCard
      icon={<FileText size={14} strokeWidth={1.8} />}
      title="Party style quizzes"
    >
      {nonBride.length === 0 ? (
        <EmptyRow>Add bridesmaids, sisters, or mothers to the roster first.</EmptyRow>
      ) : (
        <div className="space-y-3">
          <p className="text-[12.5px] text-ink-muted">
            Generate a 5–6 question style quiz for each party member. Each
            quiz takes 2 minutes to complete and lets their artist understand
            preferences before the trial.
          </p>
          <ul className="space-y-2">
            {nonBride.map((p) => {
              const meta = (p.meta ?? {}) as PartyMeta;
              const event = (meta.events?.[0]?.toLowerCase() ?? "wedding") as WeddingEvent;
              const services = (meta.service_level
                ? SERVICES_FOR_LEVEL[meta.service_level] ?? ["hair", "makeup"]
                : ["hair", "makeup"]
              ).filter((s): s is "hair" | "makeup" => s === "hair" || s === "makeup");
              const name = p.title || meta.role || "Person";
              return (
                <QuizRow
                  key={p.id}
                  categoryId={category.id}
                  personName={name}
                  services={services.length ? services : ["hair", "makeup"]}
                  event={event}
                  existingQuiz={ai?.partyQuizzes?.[name]}
                  onQuiz={(quiz) => setQuiz(category.id, name, quiz)}
                />
              );
            })}
          </ul>
        </div>
      )}
    </PanelCard>
  );
}

function QuizRow({
  categoryId,
  personName,
  services,
  event,
  existingQuiz,
  onQuiz,
}: {
  categoryId: string;
  personName: string;
  services: ("hair" | "makeup")[];
  event: WeddingEvent;
  existingQuiz?: StyleQuiz;
  onQuiz: (quiz: StyleQuiz) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // categoryId is in the closure just so the row stays aware of scope; not
  // read here because the store action already takes it from the caller.
  void categoryId;

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateStyleQuiz({
        person_name: personName,
        services,
        event,
      });
      onQuiz(result);
      setExpanded(true);
    } catch (err) {
      setError(err instanceof AiError ? err.message : "Couldn't generate quiz.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <li className="rounded-md border border-border bg-white">
      <div className="flex items-center justify-between gap-3 p-3">
        <div>
          <p className="text-[13px] font-medium text-ink">{personName}</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-faint" style={{ fontFamily: "var(--font-mono)" }}>
            {services.join(" + ")} · {event}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {existingQuiz && (
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="text-[11px] text-ink-muted hover:text-saffron"
            >
              {expanded ? "Hide" : "Preview"}
            </button>
          )}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-1 text-[11.5px] text-ink-muted hover:border-saffron hover:text-saffron disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={10} className="animate-spin" />
            ) : existingQuiz ? (
              <RotateCcw size={10} />
            ) : (
              <Wand2 size={10} />
            )}
            {existingQuiz ? "Regenerate" : "Generate quiz"}
          </button>
        </div>
      </div>
      {error && (
        <div className="border-t border-border/60 bg-rose-pale/20 px-3 py-1.5 text-[11.5px] text-rose">
          {error}
        </div>
      )}
      {expanded && existingQuiz && (
        <div className="border-t border-border/60 bg-ivory-warm/20 p-3">
          <QuizPreview quiz={existingQuiz} />
        </div>
      )}
    </li>
  );
}

function QuizPreview({ quiz }: { quiz: StyleQuiz }) {
  return (
    <div className="space-y-3">
      <p className="text-[12.5px] italic text-ink">{quiz.intro}</p>
      <ol className="space-y-2">
        {quiz.questions.map((q, i) => (
          <li key={q.id} className="rounded-sm border border-border/60 bg-white p-2.5">
            <p className="text-[12.5px] font-medium text-ink">
              {i + 1}. {q.question}
            </p>
            {q.type === "free_text" ? (
              <p className="mt-1 text-[11.5px] italic text-ink-faint">
                (Free text{q.placeholder ? ` — ${q.placeholder}` : ""})
              </p>
            ) : q.options ? (
              <ul className="mt-1 space-y-0.5">
                {q.options.map((o) => (
                  <li key={o.id} className="text-[12px] text-ink">
                    <span className="mr-2 font-mono text-[10px] text-ink-faint" style={{ fontFamily: "var(--font-mono)" }}>
                      {o.id}.
                    </span>
                    {o.label}
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
