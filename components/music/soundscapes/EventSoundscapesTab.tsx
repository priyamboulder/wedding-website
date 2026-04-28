"use client";

// ── Event Soundscapes tab ─────────────────────────────────────────────────
// One section per canonical wedding event. Each section captures:
//   • Energy arc — opening / build / peak / wind-down moods (free-text)
//   • Cultural music requirements (pre-populated, editable list)
//   • Three playlists — Must Play / Request / Do Not Play
//
// Tracks accept Spotify / YouTube / Apple Music / SoundCloud links — the
// shared ReferenceEmbed primitive previews them inline so couples can
// hear the song before adding it.
//
// AI cross-check: any title that appears in both Must AND Do-Not-Play
// across any event surfaces as a banner at the top.

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ListMusic,
  Music2,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Eyebrow,
  PanelCard,
  SectionHeader,
  Tag,
} from "@/components/workspace/blocks/primitives";
import { ReferenceEmbed } from "@/components/music/primitives";
import {
  ENERGY_EVENTS,
  PLAYLIST_KIND_LABEL,
  useMusicSoundscapeStore,
} from "@/stores/music-soundscape-store";
import { DEMO_MUSIC_WEDDING_ID } from "@/lib/music-soundscape-seed";
import type {
  EnergyEventId,
  PlaylistKind,
  PlaylistTrack,
  Soundscape,
} from "@/types/music";
import { useMusicStore } from "@/stores/music-store";

function placeholderSoundscape(event: EnergyEventId): Soundscape {
  return {
    id: `placeholder-${event}`,
    wedding_id: DEMO_MUSIC_WEDDING_ID,
    event,
    cultural_requirements: [],
    playlists: {
      must: { kind: "must", tracks: [] },
      request: { kind: "request", tracks: [] },
      dnp: { kind: "dnp", tracks: [] },
    },
    updated_at: "",
  };
}

export function EventSoundscapesTab() {
  const soundscapes = useMusicSoundscapeStore((s) => s.soundscapes);
  const conflicts = useMemo(() => {
    const seenMust = new Set<string>();
    const seenDnp = new Set<string>();
    for (const ss of soundscapes) {
      for (const t of ss.playlists.must.tracks) {
        seenMust.add(t.title.trim().toLowerCase());
      }
      for (const t of ss.playlists.dnp.tracks) {
        seenDnp.add(t.title.trim().toLowerCase());
      }
    }
    const result: string[] = [];
    for (const t of seenMust) if (seenDnp.has(t)) result.push(t);
    return result;
  }, [soundscapes]);
  const [expanded, setExpanded] = useState<EnergyEventId>("sangeet");

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Event Soundscapes"
        title="Design how every event feels"
        description="Sketch the emotional arc — what guests hear when they arrive, when the energy builds, peaks, and winds down. Build three playlists per event: must-play, request, do-not-play."
      />

      {conflicts.length > 0 && <ConflictBanner conflicts={conflicts} />}

      <div className="space-y-3">
        {ENERGY_EVENTS.map((evt) => (
          <SoundscapeSection
            key={evt.id}
            event={evt.id}
            label={evt.label}
            isExpanded={expanded === evt.id}
            onToggle={() =>
              setExpanded((prev) => (prev === evt.id ? evt.id : evt.id))
            }
            onCollapse={() =>
              setExpanded((prev) => (prev === evt.id ? "haldi" : prev))
            }
            forceCollapse={() => setExpanded("haldi")}
            setExpanded={setExpanded}
          />
        ))}
      </div>
    </div>
  );
}

// ── Conflict banner ──────────────────────────────────────────────────────

function ConflictBanner({ conflicts }: { conflicts: string[] }) {
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50/60 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle
          size={16}
          strokeWidth={1.7}
          className="mt-0.5 text-amber-600"
        />
        <div className="space-y-1">
          <p className="text-[13px] font-medium text-amber-900">
            Cross-list conflict — {conflicts.length} title
            {conflicts.length === 1 ? "" : "s"} on both Must Play and Do Not
            Play
          </p>
          <p className="text-[12px] text-amber-800">
            {conflicts
              .map((c) => `"${c.replace(/\b\w/g, (m) => m.toUpperCase())}"`)
              .join(", ")}{" "}
            — pick one before sharing the lists with your DJ.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Soundscape section per event ─────────────────────────────────────────

function SoundscapeSection({
  event,
  label,
  isExpanded,
  setExpanded,
}: {
  event: EnergyEventId;
  label: string;
  isExpanded: boolean;
  onToggle: () => void;
  onCollapse: () => void;
  forceCollapse: () => void;
  setExpanded: (e: EnergyEventId) => void;
}) {
  const stored = useMusicSoundscapeStore((s) =>
    s.soundscapes.find((x) => x.event === event),
  );
  const ss = useMemo(
    () => stored ?? placeholderSoundscape(event),
    [stored, event],
  );
  const energy =
    useMusicSoundscapeStore((s) =>
      s.energy_arc.find((p) => p.event === event),
    )?.energy ?? 50;
  const updateSoundscape = useMusicSoundscapeStore((s) => s.updateSoundscape);

  const totalTracks =
    ss.playlists.must.tracks.length +
    ss.playlists.request.tracks.length +
    ss.playlists.dnp.tracks.length;

  return (
    <div className="rounded-lg border border-border bg-white">
      <button
        type="button"
        onClick={() => setExpanded(isExpanded ? ("haldi" as EnergyEventId) : event)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex h-8 w-8 items-center justify-center rounded-md bg-saffron-pale/60 text-saffron"
          >
            <Music2 size={15} strokeWidth={1.6} />
          </span>
          <div>
            <p className="font-serif text-[16px] text-ink">{label}</p>
            <p
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {totalTracks} tracks · energy {energy}/100
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <EnergyBadge value={energy} />
          {isExpanded ? (
            <ChevronUp size={15} className="text-ink-muted" />
          ) : (
            <ChevronDown size={15} className="text-ink-muted" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="space-y-5 border-t border-border/60 px-5 pb-5 pt-5">
          <EnergyArcEditor
            event={event}
            soundscape={ss}
            onChange={(patch) => updateSoundscape(event, patch)}
          />

          <CulturalRequirements event={event} requirements={ss.cultural_requirements} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <PlaylistColumn event={event} kind="must" tone="saffron" />
            <PlaylistColumn event={event} kind="request" tone="sage" />
            <PlaylistColumn event={event} kind="dnp" tone="rose" />
          </div>
        </div>
      )}
    </div>
  );
}

function EnergyBadge({ value }: { value: number }) {
  const tone =
    value < 35 ? "sage" : value < 65 ? "saffron" : "rose";
  const label = value < 35 ? "Intimate" : value < 65 ? "Festive" : "High";
  return <Tag tone={tone}>{label}</Tag>;
}

// ── Energy arc editor ────────────────────────────────────────────────────

function EnergyArcEditor({
  event,
  soundscape,
  onChange,
}: {
  event: EnergyEventId;
  soundscape: Soundscape;
  onChange: (
    patch: Partial<Pick<Soundscape, "opening_mood" | "build_mood" | "peak_mood" | "wind_down_mood">>,
  ) => void;
}) {
  return (
    <PanelCard
      icon={<Sparkles size={13} strokeWidth={1.7} />}
      title="Energy arc — what does this event sound like?"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <ArcField
          label="Opening mood"
          hint="What's playing as guests arrive?"
          value={soundscape.opening_mood ?? ""}
          onChange={(v) => onChange({ opening_mood: v })}
        />
        <ArcField
          label="Build"
          hint="How does the energy escalate?"
          value={soundscape.build_mood ?? ""}
          onChange={(v) => onChange({ build_mood: v })}
        />
        <ArcField
          label="Peak"
          hint="The biggest moment"
          value={soundscape.peak_mood ?? ""}
          onChange={(v) => onChange({ peak_mood: v })}
        />
        <ArcField
          label="Wind-down"
          hint="How does the night end?"
          value={soundscape.wind_down_mood ?? ""}
          onChange={(v) => onChange({ wind_down_mood: v })}
        />
      </div>
      <p className="mt-3 text-[11px] text-ink-faint">
        These notes brief your DJ and emcee on the emotional design of {labelFor(event).toLowerCase()}.
      </p>
    </PanelCard>
  );
}

function ArcField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between">
        <Eyebrow>{label}</Eyebrow>
        <span className="text-[10px] text-ink-faint">{hint}</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        placeholder={`e.g., ${defaultArcPlaceholder(label)}`}
        className="mt-1 w-full resize-none rounded-md border border-border bg-white px-3 py-2 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron/50 focus:outline-none"
      />
    </label>
  );
}

function defaultArcPlaceholder(label: string): string {
  switch (label) {
    case "Opening mood":
      return "Soft Bollywood instrumental as guests settle";
    case "Build":
      return "After dinner — transition to upbeat dance";
    case "Peak":
      return "Punjabi MC — full dance floor — 11pm";
    case "Wind-down":
      return "Slow couple's song, then send-off";
    default:
      return "";
  }
}

function labelFor(event: EnergyEventId): string {
  return ENERGY_EVENTS.find((e) => e.id === event)?.label ?? event;
}

// ── Cultural requirements ────────────────────────────────────────────────

function CulturalRequirements({
  event,
  requirements,
}: {
  event: EnergyEventId;
  requirements: string[];
}) {
  const add = useMusicSoundscapeStore((s) => s.addCulturalRequirement);
  const remove = useMusicSoundscapeStore((s) => s.removeCulturalRequirement);
  const [draft, setDraft] = useState("");

  return (
    <PanelCard
      icon={<ListMusic size={13} strokeWidth={1.7} />}
      title="Cultural music requirements"
    >
      {requirements.length === 0 ? (
        <p className="text-[12px] italic text-ink-faint">
          None pre-populated. Add the moments families will expect.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {requirements.map((req) => (
            <li
              key={req}
              className="flex items-start justify-between gap-3 rounded-md bg-ivory-warm/40 px-3 py-2"
            >
              <span className="text-[12.5px] text-ink">{req}</span>
              <button
                type="button"
                onClick={() => remove(event, req)}
                aria-label="Remove requirement"
                className="text-ink-faint hover:text-rose"
              >
                <X size={13} strokeWidth={1.8} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const v = draft.trim();
          if (!v) return;
          add(event, v);
          setDraft("");
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a cultural requirement…"
          className="flex-1 rounded-md border border-border bg-white px-3 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron/50 focus:outline-none"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[11.5px] font-medium text-ivory hover:bg-ink-soft"
        >
          <Plus size={12} strokeWidth={2} /> Add
        </button>
      </form>
    </PanelCard>
  );
}

// ── Playlist column (Must / Request / DNP) ───────────────────────────────

function PlaylistColumn({
  event,
  kind,
  tone,
}: {
  event: EnergyEventId;
  kind: PlaylistKind;
  tone: "saffron" | "sage" | "rose";
}) {
  const stored = useMusicSoundscapeStore((s) =>
    s.soundscapes.find((x) => x.event === event),
  );
  const ss = useMemo(
    () => stored ?? placeholderSoundscape(event),
    [stored, event],
  );
  const tracks = ss.playlists[kind].tracks;

  return (
    <PanelCard
      title={PLAYLIST_KIND_LABEL[kind]}
      badge={<Tag tone={tone}>{tracks.length}</Tag>}
    >
      <div className="space-y-3">
        {tracks.length === 0 ? (
          <p className="text-[12px] italic text-ink-faint">
            {kind === "must"
              ? "Add the songs your DJ must play."
              : kind === "request"
                ? "Songs you'd love if they fit the vibe."
                : "Songs your DJ should never play."}
          </p>
        ) : (
          tracks.map((t) => (
            <TrackRow key={t.id} event={event} kind={kind} track={t} />
          ))
        )}
        <AddTrackForm event={event} kind={kind} />
      </div>
    </PanelCard>
  );
}

// ── Track row ────────────────────────────────────────────────────────────

function TrackRow({
  event,
  kind,
  track,
}: {
  event: EnergyEventId;
  kind: PlaylistKind;
  track: PlaylistTrack;
}) {
  const remove = useMusicSoundscapeStore((s) => s.deleteTrack);
  const move = useMusicSoundscapeStore((s) => s.moveTrack);
  const vendorNames = useMusicStore((s) => s.vendor_names);
  const addedBy = useMemo(() => attribution(track.added_by, vendorNames), [
    track.added_by,
    vendorNames,
  ]);

  return (
    <div className="space-y-1.5 rounded-md border border-border/70 p-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[12.5px] font-medium text-ink">{track.title}</p>
          {track.artist && (
            <p className="text-[11px] text-ink-muted">{track.artist}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => remove(event, kind, track.id)}
          aria-label="Remove track"
          className="text-ink-faint transition-colors hover:text-rose"
        >
          <Trash2 size={12} strokeWidth={1.8} />
        </button>
      </div>
      {track.moment && (
        <Tag tone="ink">{track.moment}</Tag>
      )}
      {track.notes && (
        <p className="text-[11px] italic text-ink-muted">{track.notes}</p>
      )}
      {track.url && (
        <div className="overflow-hidden rounded-md">
          <ReferenceEmbed url={track.url} variant="card" />
        </div>
      )}
      <div className="flex items-center justify-between text-[10px]">
        <span
          className="font-mono uppercase tracking-[0.12em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {addedBy}
        </span>
        <PlaylistMoveControls
          current={kind}
          onMove={(target) => move(event, kind, target, track.id)}
        />
      </div>
    </div>
  );
}

function PlaylistMoveControls({
  current,
  onMove,
}: {
  current: PlaylistKind;
  onMove: (target: PlaylistKind) => void;
}) {
  const all: PlaylistKind[] = ["must", "request", "dnp"];
  const others = all.filter((k) => k !== current);
  return (
    <div className="flex items-center gap-1">
      {others.map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => onMove(k)}
          className="rounded-sm border border-border px-1.5 py-0.5 text-[9.5px] font-mono uppercase tracking-[0.08em] text-ink-muted hover:border-saffron/50 hover:text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          → {PLAYLIST_KIND_LABEL[k]}
        </button>
      ))}
    </div>
  );
}

// ── Inline track form ────────────────────────────────────────────────────

function AddTrackForm({
  event,
  kind,
}: {
  event: EnergyEventId;
  kind: PlaylistKind;
}) {
  const add = useMusicSoundscapeStore((s) => s.addTrack);
  const currentParty = useMusicStore((s) => s.current_party_id);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [url, setUrl] = useState("");
  const [moment, setMoment] = useState("");

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-[11.5px] font-medium text-saffron hover:underline"
      >
        <Plus size={11} strokeWidth={2} /> Add a track
      </button>
    );
  }

  return (
    <form
      className="space-y-2 rounded-md border border-saffron/30 bg-ivory-warm/30 p-2"
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = title.trim();
        if (!trimmed) return;
        add(event, kind, {
          title: trimmed,
          artist: artist.trim() || undefined,
          url: url.trim() || undefined,
          moment: moment.trim() || undefined,
          added_by: currentParty,
        });
        setTitle("");
        setArtist("");
        setUrl("");
        setMoment("");
        setOpen(false);
      }}
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Song title"
        autoFocus
        className="w-full rounded border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron/50 focus:outline-none"
      />
      <input
        value={artist}
        onChange={(e) => setArtist(e.target.value)}
        placeholder="Artist (optional)"
        className="w-full rounded border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron/50 focus:outline-none"
      />
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Spotify / YouTube / Apple Music link (optional)"
        className="w-full rounded border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron/50 focus:outline-none"
      />
      <input
        value={moment}
        onChange={(e) => setMoment(e.target.value)}
        placeholder="Moment (entrance, first dance…)"
        className="w-full rounded border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron/50 focus:outline-none"
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          className={cn(
            "inline-flex items-center gap-1 rounded-md bg-ink px-2.5 py-1 text-[11px] font-medium text-ivory hover:bg-ink-soft",
          )}
        >
          <Plus size={11} strokeWidth={2} /> Add
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-[11px] text-ink-muted hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────

function attribution(
  party: string,
  vendorNames: Record<string, string>,
): string {
  if (party === "priya") return "Priya";
  if (party === "arjun") return "Arjun";
  if (party === "urvashi") return "Urvashi";
  return vendorNames[party] ?? "—";
}
