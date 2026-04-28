"use client";

// ── Vision & Mood tab (Videography) ───────────────────────────────────────
// The cold-start surface. A 5-question quiz seeds the four things a
// videographer actually reads: film brief, style keywords, reference films,
// inspiration moodboard. This tab is where "what story do we want our film
// to tell" becomes a document — not a vibe.

import { useMemo, useRef, useState } from "react";
import {
  ExternalLink,
  Image as ImageIcon,
  Play,
  Plus,
  Sparkles,
  Trash2,
  Video,
} from "lucide-react";
import { useVideographyStore } from "@/stores/videography-store";
import { useVisionStore } from "@/stores/vision-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { WorkspaceCategory } from "@/types/workspace";
import type { VideoReferenceFilm } from "@/types/videography";
import {
  EmptyRow,
  PanelCard,
} from "@/components/workspace/blocks/primitives";
import { InlineText } from "@/components/workspace/editable/InlineText";
import { HoverRow, IconButton } from "@/components/workspace/editable/HoverActions";
import { ChipInput } from "@/components/workspace/editable/ChipInput";
import { pushUndo } from "@/components/workspace/editable/UndoToast";
import { QuizEntryCard, QuizRetakeLink } from "@/components/quiz/QuizEntryCard";
import { getQuizSchema } from "@/lib/quiz/registry";

const CATEGORY = "videography" as const;
const VISION_QUIZ = getQuizSchema(CATEGORY, "vision_mood");

export function VisionMoodTab({ category }: { category: WorkspaceCategory }) {
  return (
    <div className="space-y-6">
      {VISION_QUIZ && (
        <QuizEntryCard schema={VISION_QUIZ} categoryId={category.id} />
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ReferenceFilmGallery category={category} />
        <StyleKeywordsSection />
      </div>

      <MoodboardSection category={category} />

      <FilmBriefSection category={category} />

      {VISION_QUIZ && (
        <div className="flex justify-end">
          <QuizRetakeLink schema={VISION_QUIZ} categoryId={category.id} />
        </div>
      )}
    </div>
  );
}

// ── Film brief ──────────────────────────────────────────────────────────

function FilmBriefSection({ category }: { category: WorkspaceCategory }) {
  const filmBrief = useVideographyStore((s) => s.film_brief);
  const setFilmBrief = useVideographyStore((s) => s.setFilmBrief);

  const bodyForThisCategory =
    filmBrief && filmBrief.category_id === category.id ? filmBrief.body : "";

  return (
    <PanelCard
      icon={<Sparkles size={14} strokeWidth={1.8} />}
      title="Your film brief"
      badge={
        filmBrief && filmBrief.category_id === category.id ? (
          <span
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Updated{" "}
            {new Date(filmBrief.updated_at).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
        ) : undefined
      }
    >
      {bodyForThisCategory ? (
        <InlineText
          value={bodyForThisCategory}
          onSave={(v) => setFilmBrief(category.id, v)}
          variant="block"
          multilineRows={4}
          className="!p-0 text-[13.5px] leading-relaxed text-ink"
          allowEmpty
        />
      ) : (
        <div className="space-y-3">
          <EmptyRow>
            Take the 3-minute quiz above and we'll write the first draft.
            You can edit any line afterwards.
          </EmptyRow>
          <InlineText
            value=""
            onSave={(v) => setFilmBrief(category.id, v)}
            variant="block"
            multilineRows={3}
            placeholder="Or start from scratch — what story do you want your film to tell?"
            emptyLabel="Click to write a brief…"
            className="!p-0 text-[13px] leading-relaxed text-ink"
            allowEmpty
          />
        </div>
      )}
    </PanelCard>
  );
}

// ── Reference film gallery ──────────────────────────────────────────────

function ReferenceFilmGallery({ category }: { category: WorkspaceCategory }) {
  const refs = useVideographyStore((s) => s.reference_films);
  const addRef = useVideographyStore((s) => s.addReferenceFilm);
  const updateRef = useVideographyStore((s) => s.updateReferenceFilm);
  const deleteRef = useVideographyStore((s) => s.deleteReferenceFilm);
  const [draft, setDraft] = useState("");

  const items = useMemo(
    () =>
      refs
        .filter((r) => r.category_id === category.id)
        .sort((a, b) => a.sort_order - b.sort_order),
    [refs, category.id],
  );

  function addFromDraft() {
    const url = draft.trim();
    if (!url) return;
    addRef({ category_id: category.id, url });
    setDraft("");
  }

  function remove(r: VideoReferenceFilm) {
    deleteRef(r.id);
    pushUndo({
      message: "Reference removed",
      undo: () =>
        addRef({
          category_id: r.category_id,
          url: r.url,
          title: r.title,
          note: r.note,
          sort_order: r.sort_order,
        }),
    });
  }

  return (
    <PanelCard
      icon={<Video size={14} strokeWidth={1.8} />}
      title="Reference films"
      className="lg:col-span-2"
      badge={
        <span
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {items.length} pinned
        </span>
      }
    >
      <p className="mb-3 text-[12px] text-ink-muted">
        Wedding films you love. Paste a YouTube / Vimeo / Instagram link —
        this is the single most useful input for your videographer.
      </p>

      {items.length === 0 ? (
        <EmptyRow>
          No references yet. Paste a link below — even one changes the
          whole conversation with a vendor.
        </EmptyRow>
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {items.map((r) => (
            <ReferenceCard
              key={r.id}
              item={r}
              onUpdate={(patch) => updateRef(r.id, patch)}
              onDelete={() => remove(r)}
            />
          ))}
        </ul>
      )}

      <div className="mt-3 flex items-center gap-2">
        <input
          type="url"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addFromDraft();
          }}
          placeholder="https://vimeo.com/… or https://youtu.be/…"
          className="flex-1 rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
        />
        <button
          type="button"
          onClick={addFromDraft}
          className="flex items-center gap-1 rounded-sm border border-border px-2.5 py-1.5 text-[11.5px] text-ink-muted transition-colors hover:border-saffron hover:text-saffron"
        >
          <Plus size={11} /> Add
        </button>
      </div>
    </PanelCard>
  );
}

function ReferenceCard({
  item,
  onUpdate,
  onDelete,
}: {
  item: VideoReferenceFilm;
  onUpdate: (patch: Partial<VideoReferenceFilm>) => void;
  onDelete: () => void;
}) {
  const hostname = useMemo(() => {
    try {
      return new URL(item.url).hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  }, [item.url]);

  return (
    <li className="rounded-md border border-border bg-white">
      <a
        href={item.url}
        target="_blank"
        rel="noreferrer"
        className="group relative block aspect-video overflow-hidden rounded-t-md bg-ink"
      >
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-ink via-ink-soft to-ink-muted">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-ink shadow-md ring-1 ring-white/40 transition-transform group-hover:scale-105">
            <Play size={18} strokeWidth={2} className="translate-x-[1px]" />
          </div>
        </div>
        <div className="absolute bottom-1.5 left-2 flex items-center gap-1 rounded-sm bg-black/40 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-white backdrop-blur-sm">
          <ExternalLink size={9} /> {hostname || "link"}
        </div>
      </a>
      <div className="p-3">
        <HoverRow>
          <HoverRow.Main>
            <InlineText
              value={item.title ?? ""}
              onSave={(v) => onUpdate({ title: v })}
              placeholder="Add a title (e.g. Maysoon by Zaid Abuhamdeh)"
              emptyLabel="Click to title…"
              allowEmpty
              className="!p-0 font-serif text-[14px] text-ink"
            />
            <div className="mt-1">
              <InlineText
                value={item.note ?? ""}
                onSave={(v) => onUpdate({ note: v })}
                variant="block"
                placeholder="Why this film?"
                emptyLabel="Add a note…"
                allowEmpty
                className="!p-0 text-[12px] leading-relaxed text-ink-muted"
              />
            </div>
          </HoverRow.Main>
          <HoverRow.Actions>
            <IconButton label="Remove" tone="rose" onClick={onDelete}>
              <Trash2 size={11} />
            </IconButton>
          </HoverRow.Actions>
        </HoverRow>
      </div>
    </li>
  );
}

// ── Style keywords ──────────────────────────────────────────────────────

function StyleKeywordsSection() {
  const keywordsMap = useVisionStore((s) => s.style_keywords);
  const keywords = useMemo(() => keywordsMap[CATEGORY] ?? [], [keywordsMap]);
  const setKeywords = useVisionStore((s) => s.setKeywords);

  return (
    <PanelCard
      icon={<Sparkles size={14} strokeWidth={1.8} />}
      title="Style keywords"
    >
      <p className="mb-3 text-[12px] text-ink-muted">
        The look in words — these are what we show vendors up front.
      </p>
      <ChipInput
        values={keywords}
        onChange={(n) => setKeywords(CATEGORY, n)}
        placeholder="cinematic, audio-forward…"
        tone="saffron"
      />
    </PanelCard>
  );
}

// ── Moodboard ───────────────────────────────────────────────────────────

function MoodboardSection({ category }: { category: WorkspaceCategory }) {
  const moodboard = useWorkspaceStore((s) => s.moodboard);
  const addMoodboardItem = useWorkspaceStore((s) => s.addMoodboardItem);
  const deleteMoodboardItem = useWorkspaceStore((s) => s.deleteMoodboardItem);
  const [urlDraft, setUrlDraft] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const items = useMemo(
    () =>
      moodboard
        .filter((m) => m.category_id === category.id)
        .sort((a, b) => a.sort_order - b.sort_order),
    [moodboard, category.id],
  );

  function handleFiles(files: File[]) {
    for (const file of files) {
      const url = URL.createObjectURL(file);
      addMoodboardItem(category.id, url, file.name.replace(/\.[^.]+$/, ""));
    }
  }

  return (
    <PanelCard
      icon={<ImageIcon size={14} strokeWidth={1.8} />}
      title="Inspiration moodboard"
      badge={
        <span
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Lighting · framing · color grade
        </span>
      }
    >
      <p className="mb-3 text-[12px] text-ink-muted">
        Visual references for the cinematographic look — stills that capture
        the grade and light you want the film to hold.
      </p>

      {items.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-ivory/40 px-4 py-6 text-center text-[12px] text-ink-muted">
          Drop images or paste URLs below. Any still that captures the look
          counts — wedding photos, film frames, music videos.
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {items.map((m) => (
            <li key={m.id} className="group relative overflow-hidden rounded-md ring-1 ring-border">
              <div className="aspect-[4/3] bg-ivory-warm">
                <img
                  src={m.image_url}
                  alt={m.caption}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              {m.caption && (
                <p className="truncate bg-white px-2 py-1 text-[11px] text-ink-muted">
                  {m.caption}
                </p>
              )}
              <button
                type="button"
                onClick={() => {
                  const snap = { id: m.id, image_url: m.image_url, caption: m.caption };
                  deleteMoodboardItem(m.id);
                  pushUndo({
                    message: "Image removed",
                    undo: () =>
                      addMoodboardItem(category.id, snap.image_url, snap.caption),
                  });
                }}
                aria-label="Remove image"
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-ink-muted opacity-0 shadow-sm ring-1 ring-border transition-opacity hover:text-rose group-hover:opacity-100"
              >
                <Trash2 size={10} strokeWidth={1.8} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex items-center gap-2">
        <input
          type="url"
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && urlDraft.trim()) {
              addMoodboardItem(category.id, urlDraft.trim(), "");
              setUrlDraft("");
            }
          }}
          placeholder="Paste an image URL…"
          className="flex-1 rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
        />
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            const list = Array.from(e.target.files ?? []);
            if (list.length) handleFiles(list);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="flex items-center gap-1 rounded-sm border border-border px-2.5 py-1.5 text-[11.5px] text-ink-muted transition-colors hover:border-saffron hover:text-saffron"
        >
          <ImageIcon size={11} /> Upload
        </button>
      </div>
    </PanelCard>
  );
}
