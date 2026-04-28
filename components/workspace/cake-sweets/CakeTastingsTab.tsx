"use client";

// ── Interactive Tastings & Approval tab ───────────────────────────────────
// Mobile-first tasting journal. Each session = one visit to a bakery or
// mithai shop. Inside a session, the couple logs each sample they try
// with a rating, sweetness, texture notes, would-serve decision, and an
// optional photo. Ends in an overall vendor rating + book decision.
//
// Selected flavors / samples marked "would serve" flow back as suggestions
// for the Cake Design tier flavor field via the loved lists.

import { useRef, useState } from "react";
import {
  Cake,
  Camera,
  ChevronDown,
  ChevronUp,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useCakeSweetsStore,
  type TastingSample,
  type TastingSession,
  type WouldServe,
} from "@/stores/cake-sweets-store";
import { TEXTURE_OPTIONS } from "@/lib/cake-sweets-seed";
import type { WorkspaceCategory } from "@/types/workspace";
import {
  Eyebrow,
  PanelCard,
} from "@/components/workspace/blocks/primitives";

const MONO_FAMILY = "var(--font-mono)";

const RATING_LABELS = ["Meh", "Good", "Great", "Amazing", "THIS IS THE ONE"];

const WOULD_SERVE_META: Record<
  WouldServe,
  { label: string; tone: string }
> = {
  yes: { label: "Yes", tone: "border-sage bg-sage-pale/70 text-sage" },
  maybe: {
    label: "Maybe",
    tone: "border-amber-400 bg-amber-50 text-amber-700",
  },
  no: { label: "No", tone: "border-ink bg-ivory-warm text-ink" },
};

export function CakeTastingsTab({
  category: _category,
}: {
  category: WorkspaceCategory;
}) {
  const sessions = useCakeSweetsStore((s) => s.tasting_sessions);
  const addSession = useCakeSweetsStore((s) => s.addTastingSession);
  const deleteSession = useCakeSweetsStore((s) => s.deleteTastingSession);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <p className="max-w-3xl text-[13px] leading-relaxed text-ink-muted">
          Fill this out on your phone during the tasting itself. For each
          sample: rate it, note the texture, decide if it's wedding-worthy.
          At the end, an overall vendor rating and book decision.
        </p>
        <button
          type="button"
          onClick={() => addSession()}
          className="inline-flex shrink-0 items-center gap-1 rounded-sm border border-ink bg-ink px-3 py-1.5 text-[11.5px] font-medium text-ivory transition-colors hover:bg-ink/90"
        >
          <Plus size={12} strokeWidth={2} />
          New tasting
        </button>
      </div>

      {sessions.length === 0 ? (
        <PanelCard icon={<Cake size={14} strokeWidth={1.8} />} title="No tastings logged yet">
          <p className="py-2 text-[12.5px] italic text-ink-faint">
            Start a new tasting as soon as you arrive at the bakery. The
            form is built for thumbs — no laptop required.
          </p>
        </PanelCard>
      ) : (
        <ul className="space-y-4">
          {sessions.map((s) => (
            <TastingSessionCard
              key={s.id}
              session={s}
              onDelete={() => deleteSession(s.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Session card ──────────────────────────────────────────────────────────

function TastingSessionCard({
  session,
  onDelete,
}: {
  session: TastingSession;
  onDelete: () => void;
}) {
  const updateSession = useCakeSweetsStore((s) => s.updateTastingSession);
  const addSample = useCakeSweetsStore((s) => s.addTastingSample);
  const [open, setOpen] = useState(true);

  const avgRating =
    session.samples.length > 0
      ? Math.round(
          (session.samples.reduce((a, s) => a + s.rating, 0) /
            session.samples.length) *
            10,
        ) / 10
      : 0;
  const yesCount = session.samples.filter((s) => s.would_serve === "yes").length;

  return (
    <li className="overflow-hidden rounded-lg border border-border bg-white">
      {/* Header */}
      <header className="flex flex-col gap-2 border-b border-border/60 bg-ivory-warm/20 px-4 py-3 md:flex-row md:items-start md:justify-between">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:flex-1">
          <div>
            <Eyebrow className="mb-1">Vendor / bakery</Eyebrow>
            <input
              type="text"
              value={session.vendor}
              onChange={(e) =>
                updateSession(session.id, { vendor: e.target.value })
              }
              placeholder="e.g. The Pastry Project"
              className="w-full rounded-sm border border-border bg-white px-2.5 py-1.5 text-[13px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
            />
          </div>
          <div>
            <Eyebrow className="mb-1">Date</Eyebrow>
            <input
              type="date"
              value={session.date}
              onChange={(e) =>
                updateSession(session.id, { date: e.target.value })
              }
              className="w-full rounded-sm border border-border bg-white px-2.5 py-1.5 font-mono text-[12.5px] text-ink focus:border-saffron focus:outline-none"
              style={{ fontFamily: MONO_FAMILY }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="rounded-sm border border-border bg-white px-2 py-1 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted"
            style={{ fontFamily: MONO_FAMILY }}
          >
            {session.samples.length} sample
            {session.samples.length === 1 ? "" : "s"} · {yesCount} yes · avg {avgRating}
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-sm border border-border bg-white p-1.5 text-ink-muted hover:text-ink"
            aria-label={open ? "Collapse" : "Expand"}
          >
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-sm border border-border bg-white p-1.5 text-ink-faint hover:text-rose"
            aria-label="Delete tasting"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </header>

      {open && (
        <div className="space-y-4 px-4 py-4">
          {/* Samples */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <Eyebrow>Samples tried</Eyebrow>
              <button
                type="button"
                onClick={() => addSample(session.id)}
                className="inline-flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-1 text-[11px] text-ink hover:border-saffron hover:text-saffron"
              >
                <Plus size={11} strokeWidth={1.8} />
                Add sample
              </button>
            </div>
            {session.samples.length === 0 ? (
              <p className="rounded-md border border-dashed border-border bg-ivory-warm/30 px-3 py-3 text-center text-[12px] italic text-ink-faint">
                No samples logged yet. Tap "Add sample" for each flavor you try.
              </p>
            ) : (
              <ul className="space-y-3">
                {session.samples.map((sample) => (
                  <SampleCard
                    key={sample.id}
                    sessionId={session.id}
                    sample={sample}
                  />
                ))}
              </ul>
            )}
          </section>

          {/* Overall */}
          <section className="rounded-md border border-gold/20 bg-ivory-warm/30 p-3">
            <Eyebrow className="mb-2">Overall vendor rating</Eyebrow>
            <div className="mb-3 flex items-center gap-3">
              <StarRow
                value={session.overall_rating}
                onChange={(v) =>
                  updateSession(session.id, { overall_rating: v })
                }
                max={5}
                size={16}
              />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
                {session.overall_rating || "—"} / 5
              </span>
            </div>
            <Eyebrow className="mb-1.5">Book this baker?</Eyebrow>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {(["yes", "maybe", "no"] as WouldServe[]).map((v) => {
                const active = session.would_book === v;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() =>
                      updateSession(session.id, {
                        would_book: active ? null : v,
                      })
                    }
                    className={cn(
                      "rounded-full border px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] transition-colors",
                      active
                        ? WOULD_SERVE_META[v].tone
                        : "border-border bg-white text-ink-muted hover:border-ink",
                    )}
                    style={{ fontFamily: MONO_FAMILY }}
                  >
                    {WOULD_SERVE_META[v].label}
                  </button>
                );
              })}
            </div>
            <Eyebrow className="mb-1">Overall notes</Eyebrow>
            <textarea
              value={session.notes}
              onChange={(e) =>
                updateSession(session.id, { notes: e.target.value })
              }
              placeholder="Service, space, vendor chemistry, anything that stood out."
              rows={2}
              className="w-full resize-none rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
            />
          </section>
        </div>
      )}
    </li>
  );
}

// ── Sample card ───────────────────────────────────────────────────────────

function SampleCard({
  sessionId,
  sample,
}: {
  sessionId: string;
  sample: TastingSample;
}) {
  const updateSample = useCakeSweetsStore((s) => s.updateTastingSample);
  const deleteSample = useCakeSweetsStore((s) => s.deleteTastingSample);
  const fileInput = useRef<HTMLInputElement>(null);

  const patch = (p: Partial<TastingSample>) =>
    updateSample(sessionId, sample.id, p);

  function toggleTexture(id: string) {
    const has = sample.textures.includes(id);
    patch({
      textures: has
        ? sample.textures.filter((t) => t !== id)
        : [...sample.textures, id],
    });
  }

  function handlePhoto(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    patch({ photo_url: url });
  }

  return (
    <li className="rounded-md border border-border bg-white p-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
        {/* Name + rating */}
        <div className="md:col-span-7 space-y-2">
          <div>
            <Eyebrow className="mb-1">Flavor / sample</Eyebrow>
            <input
              type="text"
              value={sample.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="Cardamom pistachio, gulab jamun, lemon elderflower…"
              className="w-full rounded-sm border border-border bg-white px-2.5 py-1.5 text-[13px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
            />
          </div>

          <div>
            <Eyebrow className="mb-1">How was it?</Eyebrow>
            <div className="flex flex-wrap items-center gap-2">
              <StarRow
                value={sample.rating}
                onChange={(v) => patch({ rating: v })}
                max={5}
                size={18}
              />
              <span
                className="font-serif text-[13px] italic text-ink"
                title={RATING_LABELS[sample.rating - 1]}
              >
                {sample.rating
                  ? RATING_LABELS[sample.rating - 1]
                  : "Rate it"}
              </span>
            </div>
          </div>

          <div>
            <Eyebrow className="mb-1">
              Sweetness{" "}
              <span className="ml-1 font-normal normal-case text-ink-faint">
                ({sample.sweetness})
              </span>
            </Eyebrow>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={sample.sweetness}
              onChange={(e) => patch({ sweetness: Number(e.target.value) })}
              className="w-full accent-saffron"
              aria-label="Sample sweetness"
            />
            <div className="mt-0.5 flex justify-between font-mono text-[9.5px] text-ink-faint">
              <span>Subtle</span>
              <span>Balanced</span>
              <span>Intense</span>
            </div>
          </div>

          <div>
            <Eyebrow className="mb-1">Texture</Eyebrow>
            <div className="flex flex-wrap gap-1">
              {TEXTURE_OPTIONS.map((t) => {
                const active = sample.textures.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTexture(t.id)}
                    className={cn(
                      "rounded-full border px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.06em] transition-colors",
                      active
                        ? "border-saffron bg-saffron-pale/60 text-saffron"
                        : "border-border bg-white text-ink-muted hover:border-saffron",
                    )}
                    style={{ fontFamily: MONO_FAMILY }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Eyebrow className="mb-1">Would you serve this?</Eyebrow>
            <div className="flex flex-wrap gap-1.5">
              {(["yes", "maybe", "no"] as WouldServe[]).map((v) => {
                const active = sample.would_serve === v;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() =>
                      patch({ would_serve: active ? null : v })
                    }
                    className={cn(
                      "rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors",
                      active
                        ? WOULD_SERVE_META[v].tone
                        : "border-border bg-white text-ink-muted hover:border-ink",
                    )}
                    style={{ fontFamily: MONO_FAMILY }}
                  >
                    {WOULD_SERVE_META[v].label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Eyebrow className="mb-1">Notes</Eyebrow>
            <textarea
              value={sample.notes}
              onChange={(e) => patch({ notes: e.target.value })}
              placeholder="What worked, what didn't, questions for the baker."
              rows={2}
              className="w-full resize-none rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
            />
          </div>
        </div>

        {/* Photo */}
        <div className="md:col-span-5">
          <Eyebrow className="mb-1">Photo</Eyebrow>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={(e) => handlePhoto(e.target.files)}
          />
          {sample.photo_url ? (
            <div className="group relative overflow-hidden rounded-md ring-1 ring-border">
              <img
                src={sample.photo_url}
                alt={sample.name || "Sample"}
                className="aspect-[4/3] w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <button
                type="button"
                onClick={() => patch({ photo_url: undefined })}
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-ink-muted opacity-0 shadow-sm ring-1 ring-border transition-opacity hover:text-rose group-hover:opacity-100"
                aria-label="Remove photo"
              >
                <Trash2 size={10} strokeWidth={1.8} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border bg-ivory-warm/30 text-ink-muted transition-colors hover:border-saffron hover:text-saffron"
            >
              <Camera size={18} strokeWidth={1.5} />
              <span
                className="font-mono text-[10px] uppercase tracking-[0.1em]"
                style={{ fontFamily: MONO_FAMILY }}
              >
                Snap a photo
              </span>
            </button>
          )}

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => deleteSample(sessionId, sample.id)}
              className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint hover:text-rose"
              style={{ fontFamily: MONO_FAMILY }}
              aria-label="Delete sample"
            >
              <Trash2 size={11} strokeWidth={1.8} />
              Remove sample
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

// ── Star row ──────────────────────────────────────────────────────────────

function StarRow({
  value,
  onChange,
  max = 5,
  size = 14,
}: {
  value: number;
  onChange: (v: number) => void;
  max?: number;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n === value ? 0 : n)}
          className="text-saffron"
          aria-label={`${n} star${n === 1 ? "" : "s"}`}
        >
          <Star
            size={size}
            strokeWidth={1.8}
            className={cn(
              n <= value ? "fill-saffron" : "fill-transparent opacity-40",
            )}
          />
        </button>
      ))}
    </div>
  );
}
