"use client";

// ── Memories tab ──────────────────────────────────────────────────────────
// Two-phase. Pre-event: the "capture plan" — a shot list the parents can
// build out and share with the photographer. Post-event: photo/video
// upload (data URL in localStorage for now), featured-photo picks, a
// milestone reflection journal, and album settings.
//
// The phase is driven by the "Post-event" toggle — default is inferred
// from the party date. Users can flip it manually.

import {
  Camera,
  Check,
  FileText,
  Heart,
  Image as ImageIcon,
  Plus,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useFirstBirthdayStore } from "@/stores/first-birthday-store";
import type {
  FirstBirthdayMemoryCategory,
  FirstBirthdayState,
} from "@/types/first-birthday";
import {
  Label,
  Section,
  TextArea,
  TextInput,
} from "../../bachelorette/ui";

const MEMORY_CATEGORY_OPTIONS: {
  value: FirstBirthdayMemoryCategory;
  label: string;
}[] = [
  { value: "ceremony", label: "Ceremony" },
  { value: "cake_smash", label: "Cake smash" },
  { value: "family_portrait", label: "Family portrait" },
  { value: "candid", label: "Candid" },
  { value: "detail", label: "Detail" },
  { value: "guest_upload", label: "Guest upload" },
  { value: "other", label: "Other" },
];

export function MemoriesTab() {
  const memories = useFirstBirthdayStore((s) => s.memories);
  const partyDate = useFirstBirthdayStore((s) => s.plan.partyDate);
  const [postEvent, setPostEvent] = useState(() => memories.length > 0);

  const inferredPostEvent = useMemo(() => {
    const parsed = Date.parse(partyDate);
    if (Number.isNaN(parsed)) return false;
    return parsed < Date.now();
  }, [partyDate]);

  const effectivePostEvent = postEvent || inferredPostEvent;

  return (
    <div className="space-y-5">
      <PhaseToggle
        postEvent={effectivePostEvent}
        onToggle={() => setPostEvent((v) => !v)}
      />

      {!effectivePostEvent && <ShotListPlan />}

      {effectivePostEvent && (
        <>
          <UploadSection />
          <FeaturedGrid />
          <ReflectionJournal />
          <AlbumSettings />
        </>
      )}
    </div>
  );
}

// ── Phase toggle ──────────────────────────────────────────────────────────

function PhaseToggle({
  postEvent,
  onToggle,
}: {
  postEvent: boolean;
  onToggle: () => void;
}) {
  return (
    <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-gradient-to-br from-ivory-warm/60 to-white p-5">
      <div>
        <p
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <Camera
            size={10}
            strokeWidth={1.8}
            className="mr-1 inline-block align-[-1px]"
          />
          {postEvent ? "Memories — keepsake mode" : "Memories — capture plan"}
        </p>
        <h3 className="mt-1.5 font-serif text-[19px] leading-tight text-ink">
          {postEvent
            ? "The most photographed day of the year. Let's curate it."
            : "Make sure the moments that matter are the moments you get."}
        </h3>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-saffron/40 hover:text-saffron"
      >
        Switch to {postEvent ? "capture plan" : "keepsake mode"}
      </button>
    </section>
  );
}

// ── Shot list (pre-event) ─────────────────────────────────────────────────

function ShotListPlan() {
  const shotList = useFirstBirthdayStore((s) => s.shotList);
  const addShot = useFirstBirthdayStore((s) => s.addShotListItem);
  const updateShot = useFirstBirthdayStore((s) => s.updateShotListItem);
  const removeShot = useFirstBirthdayStore((s) => s.removeShotListItem);
  const [draft, setDraft] = useState("");

  function commit() {
    if (!draft.trim()) return;
    addShot(draft.trim());
    setDraft("");
  }

  function copyList() {
    const text = shotList.map((s, i) => `${i + 1}. ${s.label}${s.note ? ` (${s.note})` : ""}`).join("\n");
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  }

  return (
    <Section
      eyebrow="SHOT LIST"
      title="Photographer brief"
      description="Build a list of the moments you don't want to miss. If you've booked a photographer, share this before the day."
      right={
        <button
          type="button"
          onClick={copyList}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-saffron/40 hover:text-saffron"
        >
          <FileText size={12} strokeWidth={1.8} /> Copy list
        </button>
      }
    >
      <ul className="space-y-2">
        {shotList.map((s) => (
          <li
            key={s.id}
            className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-2 rounded-md border border-border bg-white px-3 py-2"
          >
            <button
              type="button"
              onClick={() => updateShot(s.id, { captured: !s.captured })}
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-md border transition-colors",
                s.captured
                  ? "border-sage bg-sage text-ivory"
                  : "border-border bg-white text-transparent hover:border-saffron/40",
              )}
              aria-label={s.captured ? "Mark not captured" : "Mark captured"}
            >
              <Check size={11} strokeWidth={2.5} />
            </button>
            <TextInput
              value={s.label}
              onChange={(v) => updateShot(s.id, { label: v })}
              placeholder="Shot"
            />
            <TextInput
              value={s.note}
              onChange={(v) => updateShot(s.id, { note: v })}
              placeholder="Note (angle, lighting, etc.)"
            />
            <button
              type="button"
              aria-label="Remove shot"
              onClick={() => removeShot(s.id)}
              className="text-ink-faint hover:text-rose"
            >
              <Trash2 size={13} strokeWidth={1.8} />
            </button>
          </li>
        ))}
        {shotList.length === 0 && (
          <li className="rounded-md border border-dashed border-border bg-ivory-warm/40 px-4 py-6 text-center text-[12.5px] italic text-ink-faint">
            Start with the classics — cake smash, family portrait, grandparent moments.
          </li>
        )}
      </ul>

      <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
        <TextInput
          value={draft}
          onChange={setDraft}
          placeholder="Add a shot (e.g. First bite — Annaprashan)"
        />
        <button
          type="button"
          onClick={commit}
          className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
        >
          <Plus size={12} strokeWidth={2} /> Add
        </button>
      </div>
    </Section>
  );
}

// ── Upload (post-event) ───────────────────────────────────────────────────

function UploadSection() {
  const addMemory = useFirstBirthdayStore((s) => s.addMemory);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [pending, setPending] = useState(false);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setPending(true);
    const entries = Array.from(files);
    Promise.all(
      entries.map(
        (f) =>
          new Promise<void>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              addMemory(f.type.startsWith("video") ? "video" : "photo", {
                fileDataUrl: reader.result as string,
                caption: f.name,
                uploadedBy: "parent",
              });
              resolve();
            };
            reader.onerror = () => resolve();
            reader.readAsDataURL(f);
          }),
      ),
    ).finally(() => setPending(false));
  }

  return (
    <Section
      eyebrow="MEMORIES FROM THE DAY"
      title="Upload photos & videos"
      description="Files are stored locally in your browser for now — nothing uploaded to a server."
    >
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-ivory-warm/40 px-6 py-10 text-center transition-colors hover:border-saffron/40 hover:bg-saffron-pale/10"
      >
        <Upload size={22} strokeWidth={1.4} className="text-ink-faint" />
        <p className="font-serif text-[15px] text-ink">
          {pending ? "Saving…" : "Drop photos or click to browse"}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
          JPG · PNG · HEIC · MP4 · MOV
        </p>
      </button>
      <input
        ref={fileRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
    </Section>
  );
}

// ── Featured grid (post-event) ────────────────────────────────────────────

function FeaturedGrid() {
  const memories = useFirstBirthdayStore((s) => s.memories);
  const updateMemory = useFirstBirthdayStore((s) => s.updateMemory);
  const toggleFeatured = useFirstBirthdayStore((s) => s.toggleFeatured);
  const removeMemory = useFirstBirthdayStore((s) => s.removeMemory);

  if (memories.length === 0) {
    return (
      <Section eyebrow="BEST OF" title="No photos yet">
        <div className="rounded-md border border-dashed border-border bg-ivory-warm/40 px-6 py-10 text-center">
          <ImageIcon
            size={22}
            strokeWidth={1.4}
            className="mx-auto mb-2 text-ink-faint"
          />
          <p className="text-[13px] text-ink-muted">
            Upload photos above — then tap the star to build your "Best Of" album.
          </p>
        </div>
      </Section>
    );
  }

  return (
    <Section
      eyebrow="BEST OF"
      title={`${memories.filter((m) => m.isFeatured).length} featured`}
      description="Tap the star to feature a photo in your shareable album."
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {memories
          .filter((m) => m.type !== "reflection")
          .map((m) => (
            <figure
              key={m.id}
              className="group overflow-hidden rounded-md border border-border bg-ivory-warm"
            >
              <div className="relative aspect-[4/5] bg-gradient-to-br from-ivory-warm via-ivory-deep to-gold-pale/40">
                {m.fileDataUrl && m.type === "photo" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.fileDataUrl}
                    alt={m.caption}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : m.fileDataUrl && m.type === "video" ? (
                  <video
                    src={m.fileDataUrl}
                    className="absolute inset-0 h-full w-full object-cover"
                    controls
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon
                      size={24}
                      strokeWidth={1.2}
                      className="text-ink-faint/60"
                    />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => toggleFeatured(m.id)}
                  aria-label={m.isFeatured ? "Unfeature" : "Feature"}
                  className={cn(
                    "absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full border transition-colors",
                    m.isFeatured
                      ? "border-saffron bg-saffron text-ivory"
                      : "border-white/80 bg-white/80 text-ink hover:bg-white",
                  )}
                >
                  <Star
                    size={12}
                    strokeWidth={2}
                    fill={m.isFeatured ? "currentColor" : "none"}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => removeMemory(m.id)}
                  aria-label="Remove"
                  className="absolute left-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-ink/70 text-ivory opacity-0 transition-opacity hover:bg-ink group-hover:opacity-100"
                >
                  <Trash2 size={12} strokeWidth={2} />
                </button>
              </div>
              <figcaption className="flex flex-col gap-1 border-t border-border/60 px-3 py-2">
                <TextInput
                  value={m.caption}
                  onChange={(v) => updateMemory(m.id, { caption: v })}
                  placeholder="Caption"
                  className="text-[12px]"
                />
                <select
                  value={m.category ?? ""}
                  onChange={(e) =>
                    updateMemory(m.id, {
                      category:
                        (e.target.value as FirstBirthdayMemoryCategory) || null,
                    })
                  }
                  className="rounded-md border border-border bg-white px-1.5 py-0.5 text-[11px] text-ink focus:border-saffron/60 focus:outline-none"
                  aria-label="Memory category"
                >
                  <option value="">Uncategorized</option>
                  {MEMORY_CATEGORY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </figcaption>
            </figure>
          ))}
      </div>
    </Section>
  );
}

// ── Reflection journal ────────────────────────────────────────────────────

function ReflectionJournal() {
  const reflections = useFirstBirthdayStore((s) => s.reflections);
  const updateReflection = useFirstBirthdayStore((s) => s.updateReflection);

  const prompts: { key: keyof FirstBirthdayState["reflections"]; label: string; placeholder: string }[] = [
    {
      key: "surprisedBy",
      label: "What surprised you most about this year?",
      placeholder: "The thing you didn't see coming…",
    },
    {
      key: "favoriteThing",
      label: "What's their favorite thing right now?",
      placeholder: "Food, toy, book, obsession…",
    },
    {
      key: "wantToRemember",
      label: "What do you want to remember about today?",
      placeholder: "A moment, a face, a feeling…",
    },
    {
      key: "messageToBaby",
      label: "A message for them on their first birthday",
      placeholder: "Written to read when they're older.",
    },
  ];

  return (
    <Section
      eyebrow="A YEAR IN REVIEW"
      title="For the keepsake page"
      description="Private. Export this alongside your favorite photos to make a printable page."
    >
      <div className="space-y-4">
        {prompts.map((p) => (
          <div key={p.key}>
            <Label>{p.label}</Label>
            <div className="mt-1.5">
              <TextArea
                value={reflections[p.key]}
                onChange={(v) => updateReflection(p.key, v)}
                placeholder={p.placeholder}
                rows={3}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center gap-2 rounded-md border border-saffron/30 bg-saffron-pale/20 px-4 py-3">
        <Heart size={14} strokeWidth={1.7} className="shrink-0 text-saffron" />
        <p className="text-[12px] text-ink">
          Export as printable keepsake — coming soon.
        </p>
      </div>
    </Section>
  );
}

// ── Album settings ────────────────────────────────────────────────────────

function AlbumSettings() {
  const album = useFirstBirthdayStore((s) => s.album);
  const updateAlbum = useFirstBirthdayStore((s) => s.updateAlbum);

  return (
    <Section
      eyebrow="SHAREABLE ALBUM"
      title="Share your favorites with family"
      description="Generate a link guests can visit. They can also upload their own photos."
    >
      <div className="space-y-3">
        <label className="flex items-start gap-2 rounded-md border border-border bg-white px-4 py-3">
          <input
            type="checkbox"
            checked={album.isPublic}
            onChange={(e) => updateAlbum({ isPublic: e.target.checked })}
            className="mt-0.5 accent-ink"
          />
          <div>
            <p className="text-[13px] text-ink">Make album shareable</p>
            <p className="mt-0.5 text-[11.5px] text-ink-muted">
              Toggles a generated link that anyone with the URL can view.
            </p>
          </div>
        </label>
        <label className="flex items-start gap-2 rounded-md border border-border bg-white px-4 py-3">
          <input
            type="checkbox"
            checked={album.allowGuestUploads}
            onChange={(e) =>
              updateAlbum({ allowGuestUploads: e.target.checked })
            }
            className="mt-0.5 accent-ink"
          />
          <div>
            <p className="text-[13px] text-ink">Allow guest uploads</p>
            <p className="mt-0.5 text-[11.5px] text-ink-muted">
              Guests can add their phone photos to the same album.
            </p>
          </div>
        </label>
        <div>
          <Label>Thank-you message (optional)</Label>
          <div className="mt-1.5">
            <TextArea
              value={album.thankYouMessage}
              onChange={(v) => updateAlbum({ thankYouMessage: v })}
              placeholder="Shown at the top of the album page."
              rows={2}
            />
          </div>
        </div>
      </div>
    </Section>
  );
}

