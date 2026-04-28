"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  Plus,
  Download,
  Music,
  ChevronDown,
  ChevronUp,
  X,
  GripVertical,
  Mic,
  Film,
  Users as UsersIcon,
  Theater,
  Sparkles,
  CalendarDays,
  Clock,
  MapPin,
  Trash2,
  Check,
  Edit3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePerformancesStore } from "@/stores/performances-store";
import {
  PERFORMANCE_ROLES,
  PERFORMANCE_STATUSES,
  PERFORMANCE_TYPES,
  performanceDurationMinutes,
  type Performance,
  type PerformanceRole,
  type PerformanceStatus,
  type PerformanceType,
} from "@/types/performance";
import {
  downloadText,
  runOfShowMarkdown,
  songListMarkdown,
} from "@/lib/performances-export";

// ═══════════════════════════════════════════════════════════════════════════
//   Public props — receives events and minimal guest info from the host page.
// ═══════════════════════════════════════════════════════════════════════════

export interface PerformancesEvent {
  id: string;
  label: string;
  date: string;
  icon: string;
}

export interface PerformancesGuest {
  id: string;
  firstName: string;
  lastName: string;
  side?: "bride" | "groom" | "mutual";
}

// ═══════════════════════════════════════════════════════════════════════════
//   Formatting + small helpers
// ═══════════════════════════════════════════════════════════════════════════

function formatTotal(mins: number): string {
  if (mins <= 0) return "—";
  if (mins < 60) return `~${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `~${h}h` : `~${h}h ${m}m`;
}

function formatSongDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const STATUS_STYLES: Record<
  PerformanceStatus,
  { bg: string; text: string; ring: string }
> = {
  Planning: {
    bg: "bg-ivory-deep",
    text: "text-ink-muted",
    ring: "border border-border",
  },
  Rehearsing: {
    bg: "bg-gold-pale/60",
    text: "text-saffron",
    ring: "border border-gold/30",
  },
  Ready: {
    bg: "bg-sage-pale",
    text: "text-sage",
    ring: "border border-sage/40",
  },
};

const TYPE_ICON: Record<PerformanceType, typeof Music> = {
  Dance: Music,
  Speech: Mic,
  Skit: Theater,
  Musical: Music,
  Game: Sparkles,
  Other: Film,
};

function avatarInitials(first?: string, last?: string) {
  return `${(first ?? "?").charAt(0)}${(last ?? "").charAt(0)}`.toUpperCase();
}

// ═══════════════════════════════════════════════════════════════════════════
//   Top-level view
// ═══════════════════════════════════════════════════════════════════════════

export function PerformancesView({
  events,
  guests,
}: {
  events: PerformancesEvent[];
  guests: PerformancesGuest[];
}) {
  const performances = usePerformancesStore((s) => s.performances);
  const countsByEvent = useMemo(() => {
    const out: Record<string, number> = {};
    for (const p of performances) {
      out[p.eventId] = (out[p.eventId] ?? 0) + 1;
    }
    return out;
  }, [performances]);

  // Default tab: first event that has performances, else the spec's typical
  // Sangeet fallback, else the first event.
  const defaultEventId = useMemo(() => {
    const withCount = events.find((e) => countsByEvent[e.id]);
    if (withCount) return withCount.id;
    const sangeet = events.find((e) => e.id === "sangeet");
    return sangeet?.id ?? events[0]?.id;
  }, [events, countsByEvent]);

  const [activeEventId, setActiveEventId] = useState<string>(defaultEventId);
  useEffect(() => {
    if (!events.some((e) => e.id === activeEventId) && defaultEventId) {
      setActiveEventId(defaultEventId);
    }
  }, [events, activeEventId, defaultEventId]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const activeEvent = events.find((e) => e.id === activeEventId);

  const eventPerformances = useMemo(
    () =>
      performances
        .filter((p) => p.eventId === activeEventId)
        .sort((a, b) => a.order - b.order),
    [performances, activeEventId],
  );

  const totalMins = eventPerformances.reduce(
    (acc, p) => acc + performanceDurationMinutes(p),
    0,
  );

  const handleExportRunOfShow = useCallback(() => {
    if (!activeEvent) return;
    const md = runOfShowMarkdown(activeEvent, eventPerformances, guests);
    downloadText(
      `run-of-show-${activeEvent.id}.md`,
      md,
    );
  }, [activeEvent, eventPerformances, guests]);

  const handleExportSongList = useCallback(() => {
    const md = songListMarkdown(performances, events);
    downloadText("song-list.md", md);
  }, [performances, events]);

  const editingPerformance = editingId
    ? performances.find((p) => p.id === editingId) ?? null
    : null;

  const detailPerformance = detailId
    ? performances.find((p) => p.id === detailId) ?? null
    : null;

  return (
    <div className="mx-auto max-w-[1280px] px-8 py-10">
      {/* Editorial header */}
      <div className="mb-6">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-ink-faint">
          Performances
        </p>
        <div className="flex items-baseline gap-3">
          <h2 className="font-serif text-3xl font-medium tracking-tight text-ink">
            Program &amp; Rehearsals
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
            {performances.length} across {Object.keys(countsByEvent).length} events
          </span>
        </div>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink-muted">
          Dances, speeches, skits, and musical acts. Build the run of show,
          track songs &amp; AV needs, and confirm rehearsals.
        </p>
        <div className="mt-5 h-px bg-gradient-to-r from-gold/40 via-gold/20 to-transparent" />
      </div>

      {/* Action row */}
      <div className="mb-5 flex items-center justify-end gap-2">
        <button
          onClick={handleExportSongList}
          className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[11.5px] text-ink-muted hover:border-ink/20 hover:text-ink"
          title="Download song list for DJ / sound"
        >
          <Download size={12} strokeWidth={1.6} />
          Export Song List
        </button>
        <button
          onClick={handleExportRunOfShow}
          className="flex items-center gap-1.5 rounded-md border border-gold/25 bg-gold-pale/30 px-3 py-1.5 text-[11.5px] text-saffron hover:border-gold/40 hover:bg-gold-pale/50"
          title={`Download ${activeEvent?.label ?? "event"} run of show`}
        >
          <Download size={12} strokeWidth={1.6} />
          Export Run of Show
        </button>
        <button
          onClick={() => {
            setEditingId(null);
            setFormOpen(true);
          }}
          className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[11.5px] font-medium text-ivory hover:opacity-90"
        >
          <Plus size={12} strokeWidth={2} />
          Add Performance
        </button>
      </div>

      {/* Event tab strip */}
      <div className="mb-6 flex items-center gap-1.5 overflow-x-auto border-b border-border pb-1">
        {events.map((e) => {
          const count = countsByEvent[e.id] ?? 0;
          const active = e.id === activeEventId;
          return (
            <button
              key={e.id}
              onClick={() => setActiveEventId(e.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-t-md px-4 py-2.5 text-[12.5px] transition-colors",
                active
                  ? "border border-border border-b-transparent bg-white text-ink"
                  : "text-ink-muted hover:bg-ivory/50 hover:text-ink",
              )}
            >
              <span>{e.icon}</span>
              <div className="text-left">
                <div className="font-medium">{e.label}</div>
                <div className="font-mono text-[9.5px] text-ink-faint">
                  {e.date}
                </div>
              </div>
              {count > 0 && (
                <span
                  className={cn(
                    "ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-mono text-[10px] tabular-nums",
                    active
                      ? "bg-gold/10 text-gold"
                      : "bg-ivory-warm text-ink-muted",
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Program header */}
      {activeEvent && (
        <div className="mb-5 flex items-baseline justify-between rounded-lg border border-border bg-white px-6 py-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-saffron">
              {activeEvent.date}
            </div>
            <h3 className="mt-0.5 font-serif text-[22px] text-ink">
              {activeEvent.label} Program
            </h3>
          </div>
          <div className="text-right">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              {eventPerformances.length}{" "}
              {eventPerformances.length === 1 ? "performance" : "performances"}
            </div>
            <div className="font-serif text-[20px] text-saffron">
              {formatTotal(totalMins)}
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      {eventPerformances.length === 0 ? (
        <EmptyState
          eventLabel={activeEvent?.label ?? ""}
          onAdd={() => {
            setEditingId(null);
            setFormOpen(true);
          }}
        />
      ) : (
        <PerformanceTimeline
          performances={eventPerformances}
          guests={guests}
          onEdit={(id) => {
            setEditingId(id);
            setFormOpen(true);
          }}
          onOpenDetail={(id) => setDetailId(id)}
        />
      )}

      {formOpen && (
        <PerformanceForm
          events={events}
          guests={guests}
          defaultEventId={activeEventId}
          editing={editingPerformance}
          onClose={() => {
            setFormOpen(false);
            setEditingId(null);
          }}
        />
      )}

      {detailPerformance && (
        <PerformanceDetailPanel
          performance={detailPerformance}
          event={events.find((e) => e.id === detailPerformance.eventId)}
          guests={guests}
          onClose={() => setDetailId(null)}
          onEdit={() => {
            setEditingId(detailPerformance.id);
            setDetailId(null);
            setFormOpen(true);
          }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//   Empty state
// ═══════════════════════════════════════════════════════════════════════════

function EmptyState({
  eventLabel,
  onAdd,
}: {
  eventLabel: string;
  onAdd: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-gold/25 bg-ivory-deep/30 px-10 py-16 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-pale/50">
        <Music size={18} strokeWidth={1.6} className="text-gold" />
      </div>
      <div className="font-serif text-[18px] text-ink">
        No performances for {eventLabel || "this event"} yet
      </div>
      <p className="max-w-sm text-[13px] text-ink-muted">
        Add dances, speeches, skits, or musical acts. Assign performers and
        songs, and track rehearsals so everything lands on the day.
      </p>
      <button
        onClick={onAdd}
        className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-[12px] font-medium text-ivory hover:opacity-90"
      >
        <Plus size={13} strokeWidth={2} />
        Add first performance
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//   Timeline — ordered list of performance cards w/ drag-to-reorder
// ═══════════════════════════════════════════════════════════════════════════

function PerformanceTimeline({
  performances,
  guests,
  onEdit,
  onOpenDetail,
}: {
  performances: Performance[];
  guests: PerformancesGuest[];
  onEdit: (id: string) => void;
  onOpenDetail: (id: string) => void;
}) {
  const reorder = usePerformancesStore((s) => s.reorderInEvent);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  function handleDragStart(id: string) {
    setDraggingId(id);
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    if (draggingId && draggingId !== id) setDragOverId(id);
  }

  function handleDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null);
      setDragOverId(null);
      return;
    }
    const ids = performances.map((p) => p.id);
    const from = ids.indexOf(draggingId);
    const to = ids.indexOf(targetId);
    if (from === -1 || to === -1) return;
    const [moved] = ids.splice(from, 1);
    ids.splice(to, 0, moved);
    reorder(performances[0].eventId, ids);
    setDraggingId(null);
    setDragOverId(null);
  }

  function handleDragEnd() {
    setDraggingId(null);
    setDragOverId(null);
  }

  return (
    <div className="flex flex-col gap-3">
      {performances.map((p, i) => (
        <PerformanceCard
          key={p.id}
          index={i}
          performance={p}
          guests={guests}
          isDragging={draggingId === p.id}
          isDragOver={dragOverId === p.id}
          onDragStart={() => handleDragStart(p.id)}
          onDragOver={(e) => handleDragOver(e, p.id)}
          onDrop={(e) => handleDrop(e, p.id)}
          onDragEnd={handleDragEnd}
          onEdit={() => onEdit(p.id)}
          onOpenDetail={() => onOpenDetail(p.id)}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//   PerformanceCard — single timeline row
// ═══════════════════════════════════════════════════════════════════════════

function PerformanceCard({
  index,
  performance,
  guests,
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onEdit,
  onOpenDetail,
}: {
  index: number;
  performance: Performance;
  guests: PerformancesGuest[];
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onEdit: () => void;
  onOpenDetail: () => void;
}) {
  const [songsOpen, setSongsOpen] = useState(false);
  const Icon = TYPE_ICON[performance.type] ?? Music;
  const statusStyle = STATUS_STYLES[performance.status];
  const duration = performanceDurationMinutes(performance);

  const participantGuests = performance.participants
    .map((pt) => {
      const g = guests.find((x) => x.id === pt.guestId);
      return g ? { ...g, role: pt.role } : null;
    })
    .filter((x): x is PerformancesGuest & { role: PerformanceRole } => x != null);

  const maxAvatars = 6;
  const extra = Math.max(0, participantGuests.length - maxAvatars);

  return (
    <article
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={cn(
        "group overflow-hidden rounded-lg border bg-white transition-all",
        isDragging ? "opacity-50" : "opacity-100",
        isDragOver
          ? "border-gold/60 shadow-[0_4px_16px_-4px_rgba(184,134,11,0.3)]"
          : "border-gold/15 hover:border-gold/30",
      )}
    >
      <div className="flex items-start gap-3 px-5 py-4">
        {/* Drag handle + order number */}
        <div className="flex shrink-0 flex-col items-center gap-1 pt-0.5">
          <button
            className="cursor-grab text-ink-faint hover:text-ink active:cursor-grabbing"
            title="Drag to reorder"
            aria-label="Drag to reorder"
          >
            <GripVertical size={14} strokeWidth={1.6} />
          </button>
          <span className="font-mono text-[10px] tabular-nums text-ink-faint">
            {(index + 1).toString().padStart(2, "0")}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          {/* Row 1: name + type + status */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenDetail}
              className="text-left font-serif text-[17px] leading-tight text-ink hover:text-gold"
            >
              {performance.name}
            </button>
            <span className="inline-flex items-center gap-1 rounded border border-border bg-ivory-warm/50 px-1.5 py-0.5 font-mono text-[10px] text-ink-muted">
              <Icon size={10} strokeWidth={1.8} />
              {performance.type}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px]",
                statusStyle.bg,
                statusStyle.ring,
                statusStyle.text,
              )}
            >
              {performance.status}
            </span>
            <span className="font-mono text-[10.5px] text-ink-faint">
              {formatTotal(duration)}
            </span>
          </div>

          {/* Row 2: participants + songs toggle */}
          <div className="mt-2 flex items-center gap-3">
            {participantGuests.length === 0 ? (
              <span className="font-mono text-[10.5px] italic text-ink-faint">
                No performers yet
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  {participantGuests.slice(0, maxAvatars).map((g) => (
                    <div
                      key={g.id}
                      title={`${g.firstName} ${g.lastName} · ${g.role}`}
                      className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gold-pale font-serif text-[10px] text-saffron"
                    >
                      {avatarInitials(g.firstName, g.lastName)}
                    </div>
                  ))}
                  {extra > 0 && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-ivory-deep font-mono text-[9px] text-ink-muted">
                      +{extra}
                    </div>
                  )}
                </div>
                <span className="font-mono text-[10.5px] text-ink-faint">
                  {participantGuests.length}{" "}
                  {participantGuests.length === 1 ? "performer" : "performers"}
                </span>
              </div>
            )}

            {performance.songs.length > 0 && (
              <button
                onClick={() => setSongsOpen((v) => !v)}
                className="ml-auto flex items-center gap-1 font-mono text-[10.5px] text-ink-muted hover:text-ink"
              >
                {songsOpen ? (
                  <ChevronUp size={12} strokeWidth={1.6} />
                ) : (
                  <ChevronDown size={12} strokeWidth={1.6} />
                )}
                {performance.songs.length}{" "}
                {performance.songs.length === 1 ? "song" : "songs"}
              </button>
            )}
          </div>

          {/* Collapsed song list */}
          {songsOpen && performance.songs.length > 0 && (
            <ul className="mt-3 flex flex-col gap-1 rounded border border-border/60 bg-ivory/40 px-3 py-2">
              {performance.songs.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between text-[12px] text-ink"
                >
                  <span>
                    <span className="font-medium">{s.title}</span>
                    <span className="text-ink-muted"> — {s.artist}</span>
                  </span>
                  <span className="font-mono text-[10.5px] tabular-nums text-ink-faint">
                    {formatSongDuration(s.durationSeconds)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* AV requirements chips */}
          {performance.avRequirements.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {performance.avRequirements.map((av) => (
                <span
                  key={av}
                  className="rounded border border-teal/25 bg-teal-pale/40 px-1.5 py-0.5 font-mono text-[9.5px] text-teal"
                >
                  {av}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={onEdit}
            className="rounded-md p-1.5 text-ink-muted hover:bg-ivory-warm/60 hover:text-ink"
            title="Edit"
            aria-label="Edit performance"
          >
            <Edit3 size={13} strokeWidth={1.6} />
          </button>
          <button
            onClick={onOpenDetail}
            className="rounded-md border border-border px-2 py-1 font-mono text-[10.5px] text-ink-muted hover:border-ink/30 hover:text-ink"
          >
            Detail
          </button>
        </div>
      </div>
    </article>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//   PerformanceForm — add / edit modal
// ═══════════════════════════════════════════════════════════════════════════

function PerformanceForm({
  events,
  guests,
  defaultEventId,
  editing,
  onClose,
}: {
  events: PerformancesEvent[];
  guests: PerformancesGuest[];
  defaultEventId: string;
  editing: Performance | null;
  onClose: () => void;
}) {
  const addPerformance = usePerformancesStore((s) => s.addPerformance);
  const updatePerformance = usePerformancesStore((s) => s.updatePerformance);

  const [name, setName] = useState(editing?.name ?? "");
  const [eventId, setEventId] = useState(editing?.eventId ?? defaultEventId);
  const [type, setType] = useState<PerformanceType>(editing?.type ?? "Dance");
  const [status, setStatus] = useState<PerformanceStatus>(
    editing?.status ?? "Planning",
  );
  const [notes, setNotes] = useState(editing?.notes ?? "");
  const [costumes, setCostumes] = useState(editing?.costumes ?? "");
  const [avInput, setAvInput] = useState("");
  const [avRequirements, setAvRequirements] = useState<string[]>(
    editing?.avRequirements ?? [],
  );
  const [durationOverride, setDurationOverride] = useState<string>(
    editing?.durationMinutes != null ? String(editing.durationMinutes) : "",
  );

  // Participants
  const [participants, setParticipants] = useState(
    editing?.participants ?? [],
  );
  const [guestQuery, setGuestQuery] = useState("");

  // Songs
  const [songs, setSongs] = useState(
    editing?.songs.map((s) => ({
      id: s.id,
      title: s.title,
      artist: s.artist,
      durationSeconds: s.durationSeconds,
    })) ?? [],
  );
  const [newSongTitle, setNewSongTitle] = useState("");
  const [newSongArtist, setNewSongArtist] = useState("");
  const [newSongMinutes, setNewSongMinutes] = useState("");
  const [newSongSeconds, setNewSongSeconds] = useState("");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const totalSongSeconds = songs.reduce((a, s) => a + s.durationSeconds, 0);

  const computedDuration =
    durationOverride.trim() !== ""
      ? Number(durationOverride)
      : Math.round(totalSongSeconds / 60);

  const guestMatches = useMemo(() => {
    const q = guestQuery.trim().toLowerCase();
    if (!q) return [];
    const already = new Set(participants.map((p) => p.guestId));
    return guests
      .filter((g) => {
        if (already.has(g.id)) return false;
        return `${g.firstName} ${g.lastName}`.toLowerCase().includes(q);
      })
      .slice(0, 6);
  }, [guestQuery, guests, participants]);

  function addParticipantLocal(guestId: string) {
    setParticipants((prev) => [...prev, { guestId, role: "Performer" }]);
    setGuestQuery("");
  }

  function removeParticipantLocal(guestId: string) {
    setParticipants((prev) => prev.filter((p) => p.guestId !== guestId));
  }

  function setParticipantRoleLocal(guestId: string, role: PerformanceRole) {
    setParticipants((prev) =>
      prev.map((p) => (p.guestId === guestId ? { ...p, role } : p)),
    );
  }

  function addSongLocal() {
    if (!newSongTitle.trim()) return;
    const mins = Number(newSongMinutes) || 0;
    const secs = Number(newSongSeconds) || 0;
    const duration = mins * 60 + secs;
    setSongs((prev) => [
      ...prev,
      {
        id: `tmp-${Date.now()}-${prev.length}`,
        title: newSongTitle.trim(),
        artist: newSongArtist.trim(),
        durationSeconds: duration,
      },
    ]);
    setNewSongTitle("");
    setNewSongArtist("");
    setNewSongMinutes("");
    setNewSongSeconds("");
  }

  function removeSongLocal(id: string) {
    setSongs((prev) => prev.filter((s) => s.id !== id));
  }

  function addAvLocal() {
    const v = avInput.trim();
    if (!v) return;
    if (avRequirements.includes(v)) {
      setAvInput("");
      return;
    }
    setAvRequirements((prev) => [...prev, v]);
    setAvInput("");
  }

  function removeAvLocal(v: string) {
    setAvRequirements((prev) => prev.filter((x) => x !== v));
  }

  function handleSubmit() {
    if (!name.trim()) return;

    const durationVal =
      durationOverride.trim() === "" ? null : Number(durationOverride);

    if (editing) {
      updatePerformance(editing.id, {
        name: name.trim(),
        eventId,
        type,
        status,
        notes,
        costumes,
        avRequirements,
        durationMinutes: isNaN(durationVal as number) ? null : durationVal,
        participants,
        songs: songs.map((s) => ({
          id: s.id.startsWith("tmp-")
            ? `song-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
            : s.id,
          title: s.title,
          artist: s.artist,
          durationSeconds: s.durationSeconds,
        })),
      });
    } else {
      addPerformance({
        name: name.trim(),
        eventId,
        type,
        status,
        notes,
        costumes,
        avRequirements,
        durationMinutes: isNaN(durationVal as number) ? null : durationVal,
        participants,
        songs: songs.map((s) => ({
          title: s.title,
          artist: s.artist,
          durationSeconds: s.durationSeconds,
        })),
      });
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <button
        className="flex-1 bg-ink/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close form"
      />
      <aside
        className="panel-scroll flex w-[540px] flex-col overflow-y-auto border-l border-gold/15 bg-ivory"
        style={{ boxShadow: "-8px 0 32px -16px rgba(26,26,26,0.12)" }}
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-gold/15 bg-ivory/95 px-6 py-4 backdrop-blur-sm">
          <div>
            <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
              {editing ? "Edit performance" : "New performance"}
            </div>
            <h2 className="mt-0.5 font-serif text-[18px] text-ink">
              {editing ? editing.name : "Add to the program"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-ink-muted hover:bg-ivory-deep/50 hover:text-ink"
            aria-label="Close"
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </header>

        <div className="flex flex-col gap-5 px-6 py-5">
          {/* Name */}
          <FormField label="Name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Bride's Friends Bollywood Medley"
              autoFocus
              className="w-full rounded border border-border bg-white px-3 py-2 text-[13px] text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Event">
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="w-full rounded border border-border bg-white px-2 py-2 text-[13px] text-ink focus:border-gold focus:outline-none"
              >
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.icon} {e.label} · {e.date}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Type">
              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value as PerformanceType)
                }
                className="w-full rounded border border-border bg-white px-2 py-2 text-[13px] text-ink focus:border-gold focus:outline-none"
              >
                {PERFORMANCE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Status">
            <div className="flex gap-1.5">
              {PERFORMANCE_STATUSES.map((s) => {
                const active = status === s;
                const style = STATUS_STYLES[s];
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={cn(
                      "rounded-full px-3 py-1 font-mono text-[10.5px] transition-all",
                      active
                        ? cn(style.bg, style.ring, style.text)
                        : "border border-border bg-white text-ink-muted hover:border-ink/20",
                    )}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </FormField>

          {/* Participants */}
          <section>
            <FormLabel>Participants ({participants.length})</FormLabel>
            <div className="relative">
              <input
                value={guestQuery}
                onChange={(e) => setGuestQuery(e.target.value)}
                placeholder="Search guests to add…"
                className="w-full rounded border border-border bg-white px-3 py-2 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
              />
              {guestQuery.trim() && guestMatches.length > 0 && (
                <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-10 max-h-60 overflow-y-auto rounded-md border border-border bg-white shadow-[0_8px_24px_rgba(26,26,26,0.08)]">
                  {guestMatches.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => addParticipantLocal(g.id)}
                      className="flex w-full items-center gap-2 border-b border-border/50 px-3 py-2 text-left text-[12.5px] last:border-b-0 hover:bg-ivory-warm/50"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-pale font-serif text-[10px] text-saffron">
                        {avatarInitials(g.firstName, g.lastName)}
                      </div>
                      <span className="text-ink">
                        {g.firstName} {g.lastName}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {participants.length > 0 && (
              <ul className="mt-2 flex flex-col gap-1.5">
                {participants.map((p) => {
                  const g = guests.find((x) => x.id === p.guestId);
                  return (
                    <li
                      key={p.guestId}
                      className="flex items-center gap-2 rounded border border-border bg-white px-3 py-2"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-pale font-serif text-[10px] text-saffron">
                        {g
                          ? avatarInitials(g.firstName, g.lastName)
                          : "?"}
                      </div>
                      <span className="flex-1 text-[12.5px] text-ink">
                        {g ? `${g.firstName} ${g.lastName}` : p.guestId}
                      </span>
                      <select
                        value={p.role}
                        onChange={(e) =>
                          setParticipantRoleLocal(
                            p.guestId,
                            e.target.value as PerformanceRole,
                          )
                        }
                        className="rounded border border-border bg-white px-1.5 py-0.5 text-[11px] text-ink focus:border-gold focus:outline-none"
                      >
                        {PERFORMANCE_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeParticipantLocal(p.guestId)}
                        className="rounded p-1 text-ink-muted hover:bg-rose-pale/40 hover:text-rose"
                        aria-label="Remove participant"
                      >
                        <X size={12} strokeWidth={1.8} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Songs */}
          <section>
            <FormLabel>Songs ({songs.length})</FormLabel>
            {songs.length > 0 && (
              <ul className="mb-2 flex flex-col gap-1.5">
                {songs.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center gap-2 rounded border border-border bg-white px-3 py-2 text-[12.5px]"
                  >
                    <Music size={12} strokeWidth={1.6} className="text-gold" />
                    <span className="flex-1 text-ink">
                      <span className="font-medium">{s.title}</span>
                      <span className="text-ink-muted"> — {s.artist}</span>
                    </span>
                    <span className="font-mono text-[10.5px] text-ink-faint">
                      {formatSongDuration(s.durationSeconds)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSongLocal(s.id)}
                      className="rounded p-1 text-ink-muted hover:bg-rose-pale/40 hover:text-rose"
                      aria-label="Remove song"
                    >
                      <X size={12} strokeWidth={1.8} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap items-center gap-1.5 rounded border border-dashed border-border bg-white px-2 py-2">
              <input
                value={newSongTitle}
                onChange={(e) => setNewSongTitle(e.target.value)}
                placeholder="Title"
                className="min-w-[120px] flex-1 rounded border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
              />
              <input
                value={newSongArtist}
                onChange={(e) => setNewSongArtist(e.target.value)}
                placeholder="Artist"
                className="min-w-[120px] flex-1 rounded border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
              />
              <input
                value={newSongMinutes}
                onChange={(e) => setNewSongMinutes(e.target.value)}
                placeholder="m"
                type="number"
                min={0}
                className="w-12 rounded border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
              />
              <input
                value={newSongSeconds}
                onChange={(e) => setNewSongSeconds(e.target.value)}
                placeholder="s"
                type="number"
                min={0}
                max={59}
                className="w-12 rounded border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
              />
              <button
                type="button"
                onClick={addSongLocal}
                className="rounded-md bg-ink px-2.5 py-1 text-[11px] font-medium text-ivory hover:opacity-90"
              >
                Add song
              </button>
            </div>
          </section>

          {/* Duration */}
          <FormField label={`Duration (minutes) — auto: ${Math.round(totalSongSeconds / 60)}`}>
            <input
              value={durationOverride}
              onChange={(e) => setDurationOverride(e.target.value)}
              placeholder="Override or leave blank to auto-calc"
              type="number"
              min={0}
              className="w-full rounded border border-border bg-white px-3 py-2 text-[13px] text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
            />
            <div className="mt-1 font-mono text-[10px] text-ink-faint">
              Program total uses: {formatTotal(computedDuration)}
            </div>
          </FormField>

          {/* AV Requirements */}
          <section>
            <FormLabel>AV requirements</FormLabel>
            {avRequirements.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {avRequirements.map((av) => (
                  <span
                    key={av}
                    className="inline-flex items-center gap-1 rounded border border-teal/25 bg-teal-pale/40 px-2 py-0.5 font-mono text-[10.5px] text-teal"
                  >
                    {av}
                    <button
                      type="button"
                      onClick={() => removeAvLocal(av)}
                      className="rounded-full p-0.5 hover:bg-teal/20"
                      aria-label={`Remove ${av}`}
                    >
                      <X size={9} strokeWidth={2} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-1.5">
              <input
                value={avInput}
                onChange={(e) => setAvInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAvLocal();
                  }
                }}
                placeholder="e.g. wireless mic, projector"
                className="flex-1 rounded border border-border bg-white px-3 py-2 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
              />
              <button
                type="button"
                onClick={addAvLocal}
                className="rounded-md border border-border bg-white px-3 py-2 text-[11.5px] font-medium text-ink-muted hover:border-ink/20 hover:text-ink"
              >
                Add
              </button>
            </div>
          </section>

          {/* Costumes */}
          <FormField label="Costumes">
            <input
              value={costumes}
              onChange={(e) => setCostumes(e.target.value)}
              placeholder="Brief costume description"
              className="w-full rounded border border-border bg-white px-3 py-2 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
            />
          </FormField>

          {/* Notes */}
          <FormField label="Notes">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Choreographer contact, entrance cue, surprise moments…"
              rows={3}
              className="w-full resize-none rounded border border-border bg-white px-3 py-2 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
            />
          </FormField>
        </div>

        <footer className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-gold/15 bg-ivory/95 px-6 py-3 backdrop-blur-sm">
          <button
            onClick={onClose}
            className="rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink-muted hover:border-ink/20 hover:text-ink"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="rounded-md bg-ink px-4 py-1.5 text-[12px] font-medium text-ivory hover:opacity-90 disabled:opacity-40"
          >
            {editing ? "Save changes" : "Add performance"}
          </button>
        </footer>
      </aside>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <FormLabel>{label}</FormLabel>
      {children}
    </div>
  );
}

function FormLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//   PerformanceDetailPanel — full detail + rehearsal scheduling
// ═══════════════════════════════════════════════════════════════════════════

function PerformanceDetailPanel({
  performance,
  event,
  guests,
  onClose,
  onEdit,
}: {
  performance: Performance;
  event: PerformancesEvent | undefined;
  guests: PerformancesGuest[];
  onClose: () => void;
  onEdit: () => void;
}) {
  const addRehearsal = usePerformancesStore((s) => s.addRehearsal);
  const removeRehearsal = usePerformancesStore((s) => s.removeRehearsal);
  const updateRehearsal = usePerformancesStore((s) => s.updateRehearsal);
  const setAttendance = usePerformancesStore((s) => s.setAttendance);
  const updatePerformance = usePerformancesStore((s) => s.updatePerformance);
  const deletePerformance = usePerformancesStore((s) => s.deletePerformance);

  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newRehearsalNotes, setNewRehearsalNotes] = useState("");
  const [expandedRehearsalId, setExpandedRehearsalId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const statusStyle = STATUS_STYLES[performance.status];
  const duration = performanceDurationMinutes(performance);

  function handleAddRehearsal() {
    if (!newDate.trim()) return;
    addRehearsal(performance.id, {
      date: newDate,
      time: newTime || "19:00",
      location: newLocation || "TBD",
      notes: newRehearsalNotes || undefined,
    });
    setNewDate("");
    setNewTime("");
    setNewLocation("");
    setNewRehearsalNotes("");
  }

  function handleDelete() {
    if (window.confirm(`Delete "${performance.name}"? This cannot be undone.`)) {
      deletePerformance(performance.id);
      onClose();
    }
  }

  const sortedRehearsals = [...performance.rehearsals].sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  return (
    <div className="fixed inset-0 z-50 flex">
      <button
        className="flex-1 bg-ink/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close detail"
      />
      <aside
        className="panel-scroll flex w-[560px] flex-col overflow-y-auto border-l border-gold/15 bg-ivory"
        style={{ boxShadow: "-8px 0 32px -16px rgba(26,26,26,0.12)" }}
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-gold/15 bg-ivory/95 px-6 py-4 backdrop-blur-sm">
          <div className="min-w-0">
            <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
              {event?.icon} {event?.label ?? "Performance"} · Detail
            </div>
            <h2 className="mt-0.5 font-serif text-[20px] leading-tight text-ink">
              {performance.name}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className="rounded border border-border bg-white px-1.5 py-0.5 font-mono text-[10px] text-ink-muted">
                {performance.type}
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 font-mono text-[10px]",
                  statusStyle.bg,
                  statusStyle.ring,
                  statusStyle.text,
                )}
              >
                {performance.status}
              </span>
              <span className="font-mono text-[10.5px] text-ink-faint">
                {formatTotal(duration)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="rounded-md border border-border bg-white px-2.5 py-1 text-[11px] font-medium text-ink-muted hover:border-ink/20 hover:text-ink"
            >
              Edit
            </button>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-ink-muted hover:bg-ivory-deep/50 hover:text-ink"
              aria-label="Close"
            >
              <X size={16} strokeWidth={1.8} />
            </button>
          </div>
        </header>

        <div className="flex flex-col gap-5 px-6 py-5">
          {/* Quick status stepper */}
          <section>
            <FormLabel>Status</FormLabel>
            <div className="flex gap-1.5">
              {PERFORMANCE_STATUSES.map((s) => {
                const active = performance.status === s;
                const style = STATUS_STYLES[s];
                return (
                  <button
                    key={s}
                    onClick={() => updatePerformance(performance.id, { status: s })}
                    className={cn(
                      "flex-1 rounded-md px-3 py-1.5 font-mono text-[11px] transition-all",
                      active
                        ? cn(style.bg, style.ring, style.text)
                        : "border border-border bg-white text-ink-muted hover:border-ink/20",
                    )}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Participants */}
          <section>
            <FormLabel>
              Performers ({performance.participants.length})
            </FormLabel>
            {performance.participants.length === 0 ? (
              <div className="rounded border border-dashed border-border bg-ivory-deep/30 px-3 py-3 font-mono text-[11px] italic text-ink-faint">
                No performers yet. Click Edit to add.
              </div>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {performance.participants.map((pt) => {
                  const g = guests.find((x) => x.id === pt.guestId);
                  return (
                    <li
                      key={pt.guestId}
                      className="flex items-center gap-2 rounded border border-border bg-white px-3 py-2"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-pale font-serif text-[10px] text-saffron">
                        {g ? avatarInitials(g.firstName, g.lastName) : "?"}
                      </div>
                      <span className="flex-1 text-[12.5px] text-ink">
                        {g ? `${g.firstName} ${g.lastName}` : pt.guestId}
                      </span>
                      <span className="rounded-full bg-gold-pale/40 px-2 py-0.5 font-mono text-[10px] text-saffron">
                        {pt.role}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Songs */}
          {performance.songs.length > 0 && (
            <section>
              <FormLabel>Songs ({performance.songs.length})</FormLabel>
              <ul className="flex flex-col gap-1 rounded border border-border bg-white px-3 py-2">
                {performance.songs.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between border-b border-border/50 py-1.5 text-[12.5px] last:border-b-0"
                  >
                    <span>
                      <span className="font-medium text-ink">{s.title}</span>
                      <span className="text-ink-muted"> — {s.artist}</span>
                    </span>
                    <span className="font-mono text-[10.5px] text-ink-faint">
                      {formatSongDuration(s.durationSeconds)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Costumes */}
          {performance.costumes && (
            <section>
              <FormLabel>Costumes</FormLabel>
              <div className="rounded border border-border bg-white px-3 py-2 text-[12.5px] text-ink">
                {performance.costumes}
              </div>
            </section>
          )}

          {/* AV */}
          {performance.avRequirements.length > 0 && (
            <section>
              <FormLabel>AV requirements</FormLabel>
              <div className="flex flex-wrap gap-1.5">
                {performance.avRequirements.map((av) => (
                  <span
                    key={av}
                    className="rounded border border-teal/25 bg-teal-pale/40 px-2 py-0.5 font-mono text-[10.5px] text-teal"
                  >
                    {av}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Notes */}
          {performance.notes && (
            <section>
              <FormLabel>Notes</FormLabel>
              <div className="whitespace-pre-wrap rounded border border-border bg-white px-3 py-2 text-[12.5px] text-ink">
                {performance.notes}
              </div>
            </section>
          )}

          {/* Rehearsals */}
          <section>
            <FormLabel>
              Rehearsals ({performance.rehearsals.length})
            </FormLabel>

            {sortedRehearsals.length === 0 ? (
              <div className="rounded border border-dashed border-border bg-ivory-deep/30 px-3 py-3 font-mono text-[11px] italic text-ink-faint">
                No rehearsals scheduled yet.
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {sortedRehearsals.map((r) => {
                  const expanded = expandedRehearsalId === r.id;
                  const attendingCount = Object.values(r.attendance).filter(
                    Boolean,
                  ).length;
                  return (
                    <li
                      key={r.id}
                      className="overflow-hidden rounded border border-gold/15 bg-white"
                    >
                      <div className="flex items-center gap-2 px-3 py-2">
                        <CalendarDays
                          size={13}
                          strokeWidth={1.6}
                          className="text-gold"
                        />
                        <div className="flex-1 text-[12.5px] text-ink">
                          <span className="font-medium">{r.date}</span>
                          {r.time && (
                            <span className="ml-2 font-mono text-[11px] text-ink-muted">
                              <Clock
                                size={10}
                                strokeWidth={1.6}
                                className="mr-0.5 inline-block"
                              />
                              {r.time}
                            </span>
                          )}
                          <span className="ml-2 font-mono text-[11px] text-ink-muted">
                            <MapPin
                              size={10}
                              strokeWidth={1.6}
                              className="mr-0.5 inline-block"
                            />
                            {r.location}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-ink-faint">
                          {attendingCount}/{performance.participants.length}
                        </span>
                        <button
                          onClick={() =>
                            setExpandedRehearsalId(expanded ? null : r.id)
                          }
                          className="rounded p-1 text-ink-muted hover:bg-ivory-warm/60 hover:text-ink"
                          aria-label={expanded ? "Collapse" : "Expand"}
                        >
                          {expanded ? (
                            <ChevronUp size={13} strokeWidth={1.6} />
                          ) : (
                            <ChevronDown size={13} strokeWidth={1.6} />
                          )}
                        </button>
                        <button
                          onClick={() => removeRehearsal(performance.id, r.id)}
                          className="rounded p-1 text-ink-muted hover:bg-rose-pale/40 hover:text-rose"
                          aria-label="Delete rehearsal"
                        >
                          <Trash2 size={12} strokeWidth={1.6} />
                        </button>
                      </div>
                      {expanded && (
                        <div className="border-t border-border/60 bg-ivory/30 px-3 py-2">
                          {r.notes && (
                            <div className="mb-2 text-[12px] italic text-ink-muted">
                              {r.notes}
                            </div>
                          )}
                          <div className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
                            Attendance
                          </div>
                          {performance.participants.length === 0 ? (
                            <div className="font-mono text-[10.5px] italic text-ink-faint">
                              No participants to check.
                            </div>
                          ) : (
                            <ul className="flex flex-col gap-1">
                              {performance.participants.map((pt) => {
                                const g = guests.find((x) => x.id === pt.guestId);
                                const present = !!r.attendance[pt.guestId];
                                return (
                                  <li
                                    key={pt.guestId}
                                    className="flex items-center gap-2 text-[12px]"
                                  >
                                    <button
                                      onClick={() =>
                                        setAttendance(
                                          performance.id,
                                          r.id,
                                          pt.guestId,
                                          !present,
                                        )
                                      }
                                      className={cn(
                                        "flex h-4 w-4 items-center justify-center rounded border",
                                        present
                                          ? "border-sage bg-sage-pale text-sage"
                                          : "border-border bg-white text-transparent hover:border-ink/30",
                                      )}
                                      aria-label={
                                        present
                                          ? "Mark absent"
                                          : "Mark present"
                                      }
                                    >
                                      <Check size={10} strokeWidth={2} />
                                    </button>
                                    <span className="text-ink">
                                      {g
                                        ? `${g.firstName} ${g.lastName}`
                                        : pt.guestId}
                                    </span>
                                    <span className="ml-auto font-mono text-[10px] text-ink-faint">
                                      {pt.role}
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                          <div className="mt-3 flex items-center gap-2">
                            <input
                              value={r.notes ?? ""}
                              onChange={(e) =>
                                updateRehearsal(performance.id, r.id, {
                                  notes: e.target.value,
                                })
                              }
                              placeholder="Rehearsal notes…"
                              className="flex-1 rounded border border-border bg-white px-2 py-1 text-[11.5px] text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Add rehearsal */}
            <div className="mt-3 rounded border border-dashed border-border bg-white p-3">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                Schedule new rehearsal
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="rounded border border-border bg-white px-2 py-1 text-[12px] text-ink focus:border-gold focus:outline-none"
                />
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="rounded border border-border bg-white px-2 py-1 text-[12px] text-ink focus:border-gold focus:outline-none"
                />
                <input
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Location"
                  className="col-span-2 rounded border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
                />
                <input
                  value={newRehearsalNotes}
                  onChange={(e) => setNewRehearsalNotes(e.target.value)}
                  placeholder="Notes (optional)"
                  className="col-span-2 rounded border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
                />
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  onClick={handleAddRehearsal}
                  disabled={!newDate}
                  className="rounded-md bg-ink px-3 py-1 text-[11.5px] font-medium text-ivory hover:opacity-90 disabled:opacity-40"
                >
                  Schedule
                </button>
              </div>
            </div>
          </section>

          <section className="border-t border-border pt-4">
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 rounded-md border border-rose/30 bg-rose-pale/30 px-3 py-1.5 text-[11.5px] text-rose hover:bg-rose-pale/50"
            >
              <Trash2 size={12} strokeWidth={1.6} />
              Delete performance
            </button>
          </section>
        </div>
      </aside>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//   Guest-drawer sub-component — lists this guest's performances + add
// ═══════════════════════════════════════════════════════════════════════════

export function GuestPerformancesSection({
  guestId,
  events,
}: {
  guestId: string;
  events: PerformancesEvent[];
}) {
  const performances = usePerformancesStore((s) => s.performances);
  const addParticipant = usePerformancesStore((s) => s.addParticipant);
  const removeParticipant = usePerformancesStore((s) => s.removeParticipant);

  const mine = useMemo(
    () =>
      performances.filter((p) =>
        p.participants.some((pt) => pt.guestId === guestId),
      ),
    [performances, guestId],
  );

  const available = useMemo(
    () =>
      performances.filter(
        (p) => !p.participants.some((pt) => pt.guestId === guestId),
      ),
    [performances, guestId],
  );

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickId, setPickId] = useState<string>("");
  const [pickRole, setPickRole] = useState<PerformanceRole>("Performer");

  function eventFor(eventId: string) {
    return events.find((e) => e.id === eventId);
  }

  return (
    <div className="flex flex-col gap-2">
      {mine.length === 0 ? (
        <div className="font-mono text-[10.5px] italic text-ink-faint">
          Not performing in any act yet.
        </div>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {mine.map((p) => {
            const role = p.participants.find(
              (pt) => pt.guestId === guestId,
            )?.role;
            const event = eventFor(p.eventId);
            const statusStyle = STATUS_STYLES[p.status];
            return (
              <li
                key={p.id}
                className="flex items-center gap-2 rounded border border-gold/15 bg-white px-3 py-2"
              >
                <Music size={12} strokeWidth={1.6} className="text-gold" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12.5px] text-ink">{p.name}</div>
                  <div className="font-mono text-[9.5px] text-ink-faint">
                    {event?.icon} {event?.label ?? p.eventId} · {role}
                  </div>
                </div>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 font-mono text-[9.5px]",
                    statusStyle.bg,
                    statusStyle.ring,
                    statusStyle.text,
                  )}
                >
                  {p.status}
                </span>
                <button
                  onClick={() => removeParticipant(p.id, guestId)}
                  className="rounded p-1 text-ink-muted hover:bg-rose-pale/40 hover:text-rose"
                  aria-label="Remove from performance"
                  title="Remove from performance"
                >
                  <X size={11} strokeWidth={1.8} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {pickerOpen ? (
        <div className="rounded border border-dashed border-border bg-white p-3">
          <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
            Add to performance
          </div>
          {available.length === 0 ? (
            <div className="mb-2 font-mono text-[10.5px] italic text-ink-faint">
              This guest is already in every performance.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <select
                value={pickId}
                onChange={(e) => setPickId(e.target.value)}
                className="rounded border border-border bg-white px-2 py-1.5 text-[12px] text-ink focus:border-gold focus:outline-none"
              >
                <option value="">Choose performance…</option>
                {available.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {eventFor(p.eventId)?.label ?? p.eventId}
                  </option>
                ))}
              </select>
              <select
                value={pickRole}
                onChange={(e) => setPickRole(e.target.value as PerformanceRole)}
                className="rounded border border-border bg-white px-2 py-1.5 text-[12px] text-ink focus:border-gold focus:outline-none"
              >
                {PERFORMANCE_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              onClick={() => {
                setPickerOpen(false);
                setPickId("");
              }}
              className="rounded-md border border-border bg-white px-2 py-1 text-[11px] text-ink-muted hover:border-ink/20 hover:text-ink"
            >
              Cancel
            </button>
            <button
              disabled={!pickId}
              onClick={() => {
                if (!pickId) return;
                addParticipant(pickId, guestId, pickRole);
                setPickerOpen(false);
                setPickId("");
              }}
              className="rounded-md bg-ink px-2.5 py-1 text-[11px] font-medium text-ivory hover:opacity-90 disabled:opacity-40"
            >
              Add
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setPickerOpen(true)}
          className="inline-flex items-center gap-1 font-mono text-[10.5px] text-saffron hover:underline"
        >
          <Plus size={11} strokeWidth={1.8} />
          Add to performance
        </button>
      )}
    </div>
  );
}

// Tiny hook for the guest-row 🎭 icon: true if this guest performs at eventId.
export function useGuestPerformsAtEvent(guestId: string, eventId: string) {
  const performances = usePerformancesStore((s) => s.performances);
  return useMemo(
    () =>
      performances.some(
        (p) =>
          p.eventId === eventId &&
          p.participants.some((pt) => pt.guestId === guestId),
      ),
    [performances, guestId, eventId],
  );
}
