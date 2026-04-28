"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  Chip,
  GhostButton,
  PageHeader,
  PrimaryButton,
} from "@/components/vendor-portal/ui";
import {
  EVENT_TYPES,
  FEATURED_COUNT,
  PORTFOLIO_SEED,
  STYLE_TAGS,
  type PortfolioEventType,
  type PortfolioItem,
  type PortfolioMedia,
} from "@/lib/vendor-portal/portfolio-seed";

const STORAGE_KEY = "ananya.vendor.portfolio.v1";

// ── Page ───────────────────────────────────────────────────

export default function VendorPortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>(PORTFOLIO_SEED);
  const [hydrated, setHydrated] = useState(false);
  const [editing, setEditing] = useState<PortfolioItem | null>(null);
  const [creating, setCreating] = useState<"single" | "bulk" | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "featured" | PortfolioEventType>(
    "all",
  );

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  // Persist
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, hydrated]);

  // Global window-level drop catcher — if vendor drags images onto the page
  // (outside the bulk modal), open the bulk uploader pre-loaded with those files.
  const [pendingFiles, setPendingFiles] = useState<File[] | null>(null);
  useEffect(() => {
    const onDragOver = (e: DragEvent) => {
      if (e.dataTransfer?.types?.includes("Files")) e.preventDefault();
    };
    const onDrop = (e: DragEvent) => {
      if (!e.dataTransfer?.files?.length) return;
      const imageFiles = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/"),
      );
      if (imageFiles.length === 0) return;
      e.preventDefault();
      setPendingFiles(imageFiles);
      setCreating("bulk");
    };
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("drop", onDrop);
    };
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    if (filter === "featured") return items.slice(0, FEATURED_COUNT);
    return items.filter((i) => i.eventTypes.includes(filter));
  }, [items, filter]);

  const counts = useMemo(() => {
    const byEvent: Record<string, number> = {};
    EVENT_TYPES.forEach((e) => (byEvent[e] = 0));
    items.forEach((it) => it.eventTypes.forEach((e) => (byEvent[e] += 1)));
    return byEvent;
  }, [items]);

  // Drag-and-drop reorder within the masonry grid. Only active when
  // filter is "all" (otherwise the rendered order != storage order).
  const canReorder = filter === "all";

  const handleDragStart = (id: string) => setDragId(id);
  const handleDragEnd = () => {
    setDragId(null);
    setOverIndex(null);
  };
  const handleDragOver = (index: number) => setOverIndex(index);
  const handleDrop = (index: number) => {
    if (!dragId) return;
    setItems((prev) => {
      const from = prev.findIndex((p) => p.id === dragId);
      if (from === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      const insertAt = from < index ? index - 1 : index;
      next.splice(insertAt, 0, moved);
      return next;
    });
    setDragId(null);
    setOverIndex(null);
  };

  const upsertItem = (item: PortfolioItem) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === item.id);
      if (idx === -1) return [item, ...prev]; // new items enter at the top of the featured zone
      const next = [...prev];
      next[idx] = item;
      return next;
    });
  };

  const deleteItem = (id: string) => {
    if (!window.confirm("Remove this item from your portfolio? Couples won't see it anymore.")) return;
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  const bulkInsert = (newItems: PortfolioItem[]) => {
    setItems((prev) => [...newItems, ...prev]);
  };

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow="Portfolio"
        title="Curate your exhibition"
        description="This is how couples decide. The first four items appear above the fold on your public profile — choose them the way you'd hang a gallery, not a feed."
        actions={
          <>
            <GhostButton onClick={() => setCreating("bulk")}>
              Bulk upload
            </GhostButton>
            <PrimaryButton onClick={() => setCreating("single")}>
              + Add to portfolio
            </PrimaryButton>
          </>
        }
      />

      <div className="px-8 py-6">
        {/* Stat strip */}
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniStat label="Items" value={items.length} />
          <MiniStat label="Galleries" value={items.filter((i) => i.kind === "gallery").length} />
          <MiniStat label="Videos" value={items.filter((i) => i.kind === "video").length} />
          <MiniStat label="Total images" value={items.reduce((s, i) => s + i.media.filter((m) => m.kind === "image" || m.kind === "swatch").length, 0)} />
        </div>

        {/* Filter rail */}
        <div className="mb-5 flex flex-wrap items-center gap-2 text-[12.5px] text-stone-500">
          <span className="font-mono uppercase tracking-[0.22em]">Filter</span>
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            All · {items.length}
          </FilterChip>
          <FilterChip active={filter === "featured"} onClick={() => setFilter("featured")}>
            Featured · {Math.min(items.length, FEATURED_COUNT)}
          </FilterChip>
          {EVENT_TYPES.filter((e) => counts[e] > 0).map((e) => (
            <FilterChip key={e} active={filter === e} onClick={() => setFilter(e)}>
              {e} · {counts[e]}
            </FilterChip>
          ))}
        </div>

        {/* FEATURED SECTION */}
        {filter === "all" && items.length > 0 && (
          <>
            <SectionLabel
              eyebrow="Above the fold"
              title="These appear first on your profile"
              hint={`The first ${FEATURED_COUNT} items in this grid are what a new couple sees before they decide to scroll. Drag to reorder.`}
            />
            <MasonryGrid>
              {items.slice(0, FEATURED_COUNT).map((it, i) => (
                <ItemTile
                  key={it.id}
                  item={it}
                  index={i}
                  featured
                  draggable={canReorder}
                  isDragging={dragId === it.id}
                  isDropTarget={overIndex === i && dragId !== null}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onEdit={() => setEditing(it)}
                  onDelete={() => deleteItem(it.id)}
                />
              ))}
            </MasonryGrid>

            {items.length > FEATURED_COUNT && <FoldDivider />}
          </>
        )}

        {/* REST OF GRID */}
        <MasonryGrid>
          {(filter === "all" ? filtered.slice(FEATURED_COUNT) : filtered).map(
            (it, idx) => {
              const realIndex = filter === "all" ? idx + FEATURED_COUNT : idx;
              return (
                <ItemTile
                  key={it.id}
                  item={it}
                  index={realIndex}
                  draggable={canReorder}
                  isDragging={dragId === it.id}
                  isDropTarget={overIndex === realIndex && dragId !== null}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onEdit={() => setEditing(it)}
                  onDelete={() => deleteItem(it.id)}
                />
              );
            },
          )}

          {/* Empty tile — opens the single-item editor */}
          {filter === "all" && (
            <AddTile onClick={() => setCreating("single")} />
          )}
        </MasonryGrid>

        {filtered.length === 0 && filter !== "all" && (
          <EmptyFilterHint onReset={() => setFilter("all")} />
        )}
      </div>

      {/* Modals */}
      {editing && (
        <ItemEditorModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={(updated) => {
            upsertItem(updated);
            setEditing(null);
          }}
          onDelete={() => {
            deleteItem(editing.id);
            setEditing(null);
          }}
        />
      )}
      {creating === "single" && (
        <ItemEditorModal
          initial={blankItem()}
          onClose={() => setCreating(null)}
          onSave={(item) => {
            upsertItem(item);
            setCreating(null);
          }}
        />
      )}
      {creating === "bulk" && (
        <BulkUploadModal
          preloadedFiles={pendingFiles ?? undefined}
          onClose={() => {
            setCreating(null);
            setPendingFiles(null);
          }}
          onCommit={(newItems) => {
            bulkInsert(newItems);
            setCreating(null);
            setPendingFiles(null);
          }}
        />
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────

function MasonryGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">{children}</div>
  );
}

function SectionLabel({
  eyebrow,
  title,
  hint,
}: {
  eyebrow: string;
  title: string;
  hint?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4 border-b border-[rgba(44,44,44,0.08)] pb-3">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-[#9E8245]">
          {eyebrow}
        </p>
        <h2
          className="mt-1 text-[20px] leading-tight text-[#2C2C2C]"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
        >
          {title}
        </h2>
      </div>
      {hint && (
        <p
          className="hidden max-w-md text-right text-[12.5px] italic text-stone-500 md:block"
          style={{ fontFamily: "'EB Garamond', serif" }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

function FoldDivider() {
  return (
    <div className="my-10 flex items-center gap-4">
      <div className="h-px flex-1 bg-[rgba(184,134,11,0.3)]" />
      <div className="flex flex-col items-center gap-1 px-3 text-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#9E8245]">
          ◆ Below the fold ◆
        </span>
        <span
          className="text-[12.5px] italic text-stone-500"
          style={{ fontFamily: "'EB Garamond', serif" }}
        >
          Drag any item above this line to feature it.
        </span>
      </div>
      <div className="h-px flex-1 bg-[rgba(184,134,11,0.3)]" />
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone-500">
        {label}
      </p>
      <p
        className="mt-1 text-[22px] leading-none text-[#2C2C2C]"
        style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
      >
        {value}
      </p>
    </Card>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 transition-colors ${
        active
          ? "bg-[#2C2C2C] text-[#FAF8F5]"
          : "border border-[rgba(44,44,44,0.12)] bg-white hover:border-[#C4A265] hover:text-[#9E8245]"
      }`}
    >
      {children}
    </button>
  );
}

// ── ItemTile ───────────────────────────────────────────────

function ItemTile({
  item,
  index,
  featured = false,
  draggable,
  isDragging,
  isDropTarget,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onEdit,
  onDelete,
}: {
  item: PortfolioItem;
  index: number;
  featured?: boolean;
  draggable: boolean;
  isDragging: boolean;
  isDropTarget: boolean;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDragOver: (i: number) => void;
  onDrop: (i: number) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const coverMedia = item.media[0];
  const extraCount = item.kind === "gallery" ? Math.max(0, item.media.length - 1) : 0;

  // Vary tile aspect ratio so the masonry feels like a curated gallery wall
  // rather than a uniform grid.
  const aspect =
    item.kind === "video"
      ? "aspect-[16/10]"
      : item.kind === "gallery"
        ? index % 3 === 0
          ? "aspect-[3/4]"
          : "aspect-[4/5]"
        : index % 2 === 0
          ? "aspect-[4/5]"
          : "aspect-[1/1]";

  return (
    <div
      draggable={draggable}
      onDragStart={(e) => {
        if (!draggable) return;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", item.id);
        onDragStart(item.id);
      }}
      onDragEnd={onDragEnd}
      onDragOver={(e) => {
        if (!draggable) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        onDragOver(index);
      }}
      onDrop={(e) => {
        if (!draggable) return;
        e.preventDefault();
        onDrop(index);
      }}
      className="group relative mb-5 break-inside-avoid"
      style={{
        opacity: isDragging ? 0.35 : 1,
        transform: isDropTarget ? "translateY(-2px)" : undefined,
        transition: "opacity 120ms, transform 140ms",
      }}
    >
      {isDropTarget && (
        <div
          className="pointer-events-none absolute -top-3 left-0 right-0 h-0.5 rounded-full"
          style={{ backgroundColor: "#C4A265" }}
          aria-hidden
        />
      )}
      <Card className="overflow-hidden">
        <div className={`relative ${aspect}`}>
          <Cover media={coverMedia} kind={item.kind} />

          {/* Top-left badges */}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {featured && <Chip tone="gold">★ Featured</Chip>}
            {item.kind === "gallery" && <Chip tone="neutral">{item.media.length} images</Chip>}
            {item.kind === "video" && <Chip tone="neutral">▶ Video</Chip>}
            {item.kind === "image" && <Chip tone="neutral">Single image</Chip>}
          </div>

          {/* Top-right handle + actions */}
          <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {draggable && (
              <span
                className="flex h-7 w-7 cursor-grab items-center justify-center rounded-md bg-white/85 text-[14px] text-stone-600 backdrop-blur"
                title="Drag to reorder"
                aria-hidden
              >
                ⋮⋮
              </span>
            )}
            <button
              type="button"
              onClick={onEdit}
              className="flex h-7 items-center rounded-md bg-white/85 px-2 text-[11.5px] text-[#2C2C2C] backdrop-blur hover:bg-white"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="flex h-7 w-7 items-center justify-center rounded-md bg-white/85 text-[13px] text-[#9a4a30] backdrop-blur hover:bg-white"
              title="Delete"
            >
              ✕
            </button>
          </div>

          {/* Gallery preview strip (cover + next 3 thumbs) */}
          {extraCount > 0 && (
            <div className="absolute bottom-0 left-0 right-0 flex gap-1 p-2">
              {item.media.slice(1, 4).map((m, i) => (
                <div
                  key={i}
                  className="h-8 flex-1 rounded-sm ring-1 ring-white/40"
                  style={{ background: mediaBackground(m) }}
                />
              ))}
              {item.media.length > 4 && (
                <div
                  className="flex h-8 flex-1 items-center justify-center rounded-sm bg-black/45 text-[11px] font-medium text-white ring-1 ring-white/40"
                >
                  +{item.media.length - 4}
                </div>
              )}
            </div>
          )}

          {/* Video play glyph */}
          {item.kind === "video" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-[22px] text-[#2C2C2C] shadow-lg">
                ▶
              </div>
            </div>
          )}
        </div>

        {/* Meta row */}
        <div className="px-4 py-3.5">
          <p
            className="text-[16px] leading-tight text-[#2C2C2C]"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
          >
            {item.title}
          </p>
          {(item.venue || item.takenAt) && (
            <p
              className="mt-0.5 text-[12.5px] italic text-stone-500"
              style={{ fontFamily: "'EB Garamond', serif" }}
            >
              {[item.venue, item.takenAt].filter(Boolean).join(" · ")}
            </p>
          )}
          {item.description && (
            <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-snug text-stone-600">
              {item.description}
            </p>
          )}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {item.eventTypes.slice(0, 3).map((e) => (
              <TagPill key={e} tone="event">
                {e}
              </TagPill>
            ))}
            {item.styleTags.slice(0, 2).map((s) => (
              <TagPill key={s} tone="style">
                {s}
              </TagPill>
            ))}
            {item.eventTypes.length + item.styleTags.length > 5 && (
              <TagPill tone="mute">
                +{item.eventTypes.length + item.styleTags.length - 5}
              </TagPill>
            )}
          </div>
          {item.coupleLink && (
            <a
              href={item.coupleLink}
              className="mt-2.5 inline-flex items-center gap-1 text-[11.5px] text-[#9E8245] hover:underline"
            >
              ◈ Linked to couple's wedding
            </a>
          )}
        </div>
      </Card>
    </div>
  );
}

function TagPill({
  tone,
  children,
}: {
  tone: "event" | "style" | "mute";
  children: React.ReactNode;
}) {
  const styles = {
    event: "border-[rgba(184,134,11,0.3)] bg-[#FBF4E6] text-[#9E8245]",
    style: "border-[rgba(44,44,44,0.12)] bg-white text-stone-600",
    mute: "border-dashed border-[rgba(44,44,44,0.15)] bg-transparent text-stone-400",
  }[tone];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-[1px] text-[10.5px] ${styles}`}
    >
      {children}
    </span>
  );
}

function Cover({
  media,
  kind,
}: {
  media: PortfolioMedia | undefined;
  kind: PortfolioItem["kind"];
}) {
  if (!media) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#F5E6D0] text-stone-400">
        <span className="text-[12px] italic">No cover</span>
      </div>
    );
  }
  if (media.kind === "image") {
    return (
      // Data URL or remote. Using <img> to avoid next/image domain config.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={media.src}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }
  const bg =
    media.to
      ? `linear-gradient(135deg, ${media.from} 0%, ${media.to} 110%)`
      : `linear-gradient(135deg, ${media.from} 0%, #2C2C2C 180%)`;
  return (
    <div className="absolute inset-0" style={{ background: bg }}>
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(circle at 30% 40%, rgba(255,255,255,0.35) 0%, transparent 55%)",
        }}
      />
      {kind === "gallery" && (
        <div
          className="absolute bottom-0 left-0 right-0 h-1/2"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 100%)",
          }}
        />
      )}
    </div>
  );
}

function mediaBackground(m: PortfolioMedia): string {
  if (m.kind === "image") return `center / cover url("${m.src}")`;
  return `linear-gradient(135deg, ${m.from} 0%, ${m.to ?? "#2C2C2C"} 110%)`;
}

function AddTile({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group mb-5 flex aspect-[4/5] w-full break-inside-avoid flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[rgba(184,134,11,0.4)] bg-[#FBF4E6]/60 text-stone-500 transition-colors hover:border-[#C4A265] hover:bg-[#FBF4E6] hover:text-[#9E8245]"
    >
      <span className="text-[32px] leading-none" aria-hidden>+</span>
      <span className="text-[13px]">Add an item</span>
      <span
        className="max-w-[220px] px-4 text-center text-[12px] italic text-stone-400 group-hover:text-stone-500"
        style={{ fontFamily: "'EB Garamond', serif" }}
      >
        A single image, a wedding gallery, or a film.
      </span>
    </button>
  );
}

function EmptyFilterHint({ onReset }: { onReset: () => void }) {
  return (
    <div className="mt-12 flex flex-col items-center gap-3 py-12 text-center">
      <p
        className="text-[22px] text-[#2C2C2C]"
        style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
      >
        Nothing tagged here yet.
      </p>
      <p
        className="max-w-sm text-[13.5px] italic text-stone-500"
        style={{ fontFamily: "'EB Garamond', serif" }}
      >
        When couples filter for this, the set would come up empty. Worth adding a piece here?
      </p>
      <GhostButton onClick={onReset}>See the full portfolio</GhostButton>
    </div>
  );
}

// ── Item editor modal ──────────────────────────────────────

function ItemEditorModal({
  initial,
  onClose,
  onSave,
  onDelete,
}: {
  initial: PortfolioItem;
  onClose: () => void;
  onSave: (item: PortfolioItem) => void;
  onDelete?: () => void;
}) {
  const isNew = !PORTFOLIO_SEED.some((p) => p.id === initial.id) && initial.title === "";
  const [draft, setDraft] = useState<PortfolioItem>(initial);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const dataUrls = await Promise.all(imageFiles.map(readFileAsDataUrl));
    setDraft((d) => ({
      ...d,
      kind: d.kind === "video" ? "video" : dataUrls.length + d.media.length > 1 ? "gallery" : d.kind,
      media: [...d.media, ...dataUrls.map((src) => ({ kind: "image" as const, src }))],
    }));
  }, []);

  const removeMedia = (index: number) => {
    setDraft((d) => ({
      ...d,
      media: d.media.filter((_, i) => i !== index),
    }));
  };

  const toggleEvent = (e: PortfolioEventType) => {
    setDraft((d) => ({
      ...d,
      eventTypes: d.eventTypes.includes(e)
        ? d.eventTypes.filter((x) => x !== e)
        : [...d.eventTypes, e],
    }));
  };

  const toggleStyle = (s: string) => {
    setDraft((d) => ({
      ...d,
      styleTags: d.styleTags.includes(s)
        ? d.styleTags.filter((x) => x !== s)
        : [...d.styleTags, s],
    }));
  };

  const canSave = draft.title.trim().length > 0 && (draft.media.length > 0 || !!draft.videoUrl);

  return (
    <ModalShell title={isNew ? "Add to portfolio" : "Edit item"} onClose={onClose}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* LEFT — media */}
        <div>
          <Label>Type</Label>
          <div className="mt-1.5 flex gap-2">
            {(["image", "gallery", "video"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setDraft((d) => ({ ...d, kind: k }))}
                className={`rounded-md border px-3 py-1.5 text-[12.5px] capitalize transition-colors ${
                  draft.kind === k
                    ? "border-[#C4A265] bg-[#FBF4E6] text-[#9E8245]"
                    : "border-[rgba(44,44,44,0.12)] bg-white text-stone-600 hover:border-[#C4A265]"
                }`}
              >
                {k === "image" ? "Single image" : k === "gallery" ? "Multi-image gallery" : "Video embed"}
              </button>
            ))}
          </div>

          {draft.kind !== "video" ? (
            <>
              <Label className="mt-5">Images</Label>
              <Dropzone
                onFiles={addFiles}
                onClickPick={() => fileInputRef.current?.click()}
                multi={draft.kind === "gallery"}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple={draft.kind === "gallery"}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              {draft.media.length > 0 && (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {draft.media.map((m, i) => (
                    <div key={i} className="group relative aspect-square overflow-hidden rounded-md ring-1 ring-[rgba(44,44,44,0.1)]">
                      <div
                        className="absolute inset-0"
                        style={{ background: mediaBackground(m) }}
                      />
                      {i === 0 && (
                        <span className="absolute left-1.5 top-1.5 rounded bg-black/55 px-1.5 py-[1px] text-[9.5px] font-medium uppercase tracking-wider text-white">
                          Cover
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeMedia(i)}
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-[11px] text-[#9a4a30] opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <Label className="mt-5">Video URL</Label>
              <input
                type="url"
                placeholder="https://vimeo.com/… or https://youtube.com/…"
                value={draft.videoUrl ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, videoUrl: e.target.value }))}
                className="mt-1.5 w-full rounded-md border border-[rgba(44,44,44,0.12)] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#C4A265]"
              />
              <p className="mt-1.5 text-[11.5px] italic text-stone-500">
                We'll embed it on your public profile. A poster image below adds a thumbnail.
              </p>
              <Label className="mt-4">Poster image (optional)</Label>
              <Dropzone onFiles={addFiles} onClickPick={() => fileInputRef.current?.click()} multi={false} />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              {draft.media[0] && (
                <div className="mt-3 aspect-video overflow-hidden rounded-md ring-1 ring-[rgba(44,44,44,0.1)]">
                  <div
                    className="h-full w-full"
                    style={{ background: mediaBackground(draft.media[0]) }}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* RIGHT — metadata */}
        <div>
          <Label>Title</Label>
          <input
            type="text"
            placeholder="Sharma-Patel Wedding, May 2025"
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            className="mt-1.5 w-full rounded-md border border-[rgba(44,44,44,0.12)] bg-white px-3 py-2 text-[13.5px] outline-none focus:border-[#C4A265]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          />

          <Label className="mt-4">Short description</Label>
          <textarea
            rows={3}
            placeholder="The one line that makes a couple stop scrolling."
            value={draft.description ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            className="mt-1.5 w-full resize-none rounded-md border border-[rgba(44,44,44,0.12)] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#C4A265]"
          />

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <Label>Venue (optional)</Label>
              <input
                type="text"
                placeholder="Taj Lake Palace, Udaipur"
                value={draft.venue ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, venue: e.target.value }))}
                className="mt-1.5 w-full rounded-md border border-[rgba(44,44,44,0.12)] bg-white px-3 py-2 text-[12.5px] outline-none focus:border-[#C4A265]"
              />
            </div>
            <div>
              <Label>When</Label>
              <input
                type="text"
                placeholder="May 2025"
                value={draft.takenAt ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, takenAt: e.target.value }))}
                className="mt-1.5 w-full rounded-md border border-[rgba(44,44,44,0.12)] bg-white px-3 py-2 text-[12.5px] outline-none focus:border-[#C4A265]"
              />
            </div>
          </div>

          <Label className="mt-4">Event type</Label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {EVENT_TYPES.map((e) => (
              <TogglePill
                key={e}
                active={draft.eventTypes.includes(e)}
                onClick={() => toggleEvent(e)}
              >
                {e}
              </TogglePill>
            ))}
          </div>

          <Label className="mt-4">Style tags</Label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {STYLE_TAGS.map((s) => (
              <TogglePill
                key={s}
                active={draft.styleTags.includes(s)}
                onClick={() => toggleStyle(s)}
              >
                {s}
              </TogglePill>
            ))}
          </div>

          <Label className="mt-4">
            Linked wedding <span className="font-normal text-stone-400">(optional)</span>
          </Label>
          <input
            type="text"
            placeholder="/app/sharma-patel"
            value={draft.coupleLink ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, coupleLink: e.target.value }))}
            className="mt-1.5 w-full rounded-md border border-[rgba(44,44,44,0.12)] bg-white px-3 py-2 text-[12.5px] outline-none focus:border-[#C4A265]"
          />
          <p className="mt-1 text-[11px] italic text-stone-500">
            If the couple is on Ananya, link their workspace — we'll add a credit tag.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between border-t border-[rgba(44,44,44,0.06)] pt-4">
        <div>
          {onDelete && !isNew && (
            <button
              type="button"
              onClick={onDelete}
              className="text-[12.5px] text-[#9a4a30] hover:underline"
            >
              Delete this item
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton
            onClick={() => {
              if (!canSave) return;
              onSave({ ...draft, id: draft.id || cryptoId() });
            }}
          >
            {isNew ? "Add to portfolio" : "Save changes"}
          </PrimaryButton>
        </div>
      </div>
    </ModalShell>
  );
}

// ── Bulk upload modal ──────────────────────────────────────

type BulkDraft = {
  src: string;
  title: string;
  eventTypes: PortfolioEventType[];
  styleTags: string[];
};

function BulkUploadModal({
  preloadedFiles,
  onClose,
  onCommit,
}: {
  preloadedFiles?: File[];
  onClose: () => void;
  onCommit: (items: PortfolioItem[]) => void;
}) {
  const [drafts, setDrafts] = useState<BulkDraft[]>([]);
  const [mode, setMode] = useState<"gallery" | "separate">("gallery");
  const [galleryTitle, setGalleryTitle] = useState("");
  const [galleryVenue, setGalleryVenue] = useState("");
  const [galleryTaken, setGalleryTaken] = useState("");
  const [sharedEvents, setSharedEvents] = useState<PortfolioEventType[]>([]);
  const [sharedStyles, setSharedStyles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const urls = await Promise.all(imageFiles.map(readFileAsDataUrl));
    setDrafts((prev) => [
      ...prev,
      ...urls.map((src, i) => ({
        src,
        title: imageFiles[i].name.replace(/\.[^.]+$/, ""),
        eventTypes: [] as PortfolioEventType[],
        styleTags: [] as string[],
      })),
    ]);
  }, []);

  useEffect(() => {
    if (preloadedFiles && preloadedFiles.length > 0) {
      void addFiles(preloadedFiles);
    }
  }, [preloadedFiles, addFiles]);

  const removeDraft = (index: number) => {
    setDrafts((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleEvent = (e: PortfolioEventType) =>
    setSharedEvents((prev) => (prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]));
  const toggleStyle = (s: string) =>
    setSharedStyles((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const commit = () => {
    if (drafts.length === 0) return;
    if (mode === "gallery") {
      if (!galleryTitle.trim()) {
        window.alert("Give the gallery a title so couples know what they're looking at.");
        return;
      }
      onCommit([
        {
          id: cryptoId(),
          kind: "gallery",
          title: galleryTitle.trim(),
          eventTypes: sharedEvents,
          styleTags: sharedStyles,
          venue: galleryVenue.trim() || undefined,
          takenAt: galleryTaken.trim() || undefined,
          media: drafts.map((d) => ({ kind: "image", src: d.src })),
        },
      ]);
    } else {
      onCommit(
        drafts.map((d) => ({
          id: cryptoId(),
          kind: "image" as const,
          title: d.title || "Untitled",
          eventTypes: sharedEvents,
          styleTags: sharedStyles,
          venue: galleryVenue.trim() || undefined,
          takenAt: galleryTaken.trim() || undefined,
          media: [{ kind: "image" as const, src: d.src }],
        })),
      );
    }
  };

  return (
    <ModalShell title="Bulk upload" onClose={onClose} wide>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <Dropzone
            onFiles={addFiles}
            onClickPick={() => fileInputRef.current?.click()}
            multi
            large
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
          />

          {drafts.length > 0 && (
            <>
              <div className="mt-4 flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-stone-500">
                  {drafts.length} image{drafts.length === 1 ? "" : "s"} queued
                </p>
                <button
                  type="button"
                  onClick={() => setDrafts([])}
                  className="text-[11.5px] text-stone-500 hover:text-[#9a4a30] hover:underline"
                >
                  Clear all
                </button>
              </div>
              <div className="mt-2 grid grid-cols-4 gap-2 md:grid-cols-5">
                {drafts.map((d, i) => (
                  <div key={i} className="group relative aspect-square overflow-hidden rounded-md ring-1 ring-[rgba(44,44,44,0.1)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={d.src} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeDraft(i)}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-[11px] text-[#9a4a30] opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div>
          <Label>What should these become?</Label>
          <div className="mt-1.5 flex gap-2">
            <ModeCard
              active={mode === "gallery"}
              title="One gallery"
              hint="Best for a single wedding shot across events."
              onClick={() => setMode("gallery")}
            />
            <ModeCard
              active={mode === "separate"}
              title="Separate items"
              hint="Each image becomes its own portfolio piece."
              onClick={() => setMode("separate")}
            />
          </div>

          {mode === "gallery" && (
            <>
              <Label className="mt-4">Gallery title</Label>
              <input
                type="text"
                placeholder="Sharma-Patel Wedding, May 2025"
                value={galleryTitle}
                onChange={(e) => setGalleryTitle(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-[rgba(44,44,44,0.12)] bg-white px-3 py-2 text-[13.5px] outline-none focus:border-[#C4A265]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              />
            </>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <Label>Venue</Label>
              <input
                type="text"
                placeholder="Taj Lake Palace"
                value={galleryVenue}
                onChange={(e) => setGalleryVenue(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-[rgba(44,44,44,0.12)] bg-white px-3 py-2 text-[12.5px] outline-none focus:border-[#C4A265]"
              />
            </div>
            <div>
              <Label>When</Label>
              <input
                type="text"
                placeholder="May 2025"
                value={galleryTaken}
                onChange={(e) => setGalleryTaken(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-[rgba(44,44,44,0.12)] bg-white px-3 py-2 text-[12.5px] outline-none focus:border-[#C4A265]"
              />
            </div>
          </div>

          <Label className="mt-4">Tag every image with</Label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {EVENT_TYPES.map((e) => (
              <TogglePill
                key={e}
                active={sharedEvents.includes(e)}
                onClick={() => toggleEvent(e)}
              >
                {e}
              </TogglePill>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {STYLE_TAGS.map((s) => (
              <TogglePill
                key={s}
                active={sharedStyles.includes(s)}
                onClick={() => toggleStyle(s)}
              >
                {s}
              </TogglePill>
            ))}
          </div>
          <p className="mt-2 text-[11.5px] italic text-stone-500">
            You can refine individual pieces after the batch lands.
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-[rgba(44,44,44,0.06)] pt-4">
        <p className="text-[12px] italic text-stone-500">
          {drafts.length === 0
            ? "Drop images anywhere on this page, or pick files to begin."
            : mode === "gallery"
              ? `${drafts.length} images will become one gallery.`
              : `${drafts.length} separate portfolio items will be added.`}
        </p>
        <div className="flex gap-2">
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton onClick={commit}>
            {mode === "gallery"
              ? "Create gallery"
              : `Add ${drafts.length || ""} item${drafts.length === 1 ? "" : "s"}`.trim()}
          </PrimaryButton>
        </div>
      </div>
    </ModalShell>
  );
}

// ── Primitives used by modals ──────────────────────────────

function ModalShell({
  title,
  children,
  onClose,
  wide,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className={`relative w-full ${wide ? "max-w-5xl" : "max-w-3xl"} rounded-xl bg-[#FAF8F5] shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
        style={{ borderColor: "rgba(44,44,44,0.08)" }}
      >
        <div className="flex items-center justify-between border-b border-[rgba(44,44,44,0.08)] px-6 py-4">
          <h2
            className="text-[22px] leading-tight text-[#2C2C2C]"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-stone-500 hover:bg-white hover:text-[#2C2C2C]"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Label({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      className={`block font-mono text-[10px] uppercase tracking-[0.22em] text-stone-500 ${className}`}
    >
      {children}
    </label>
  );
}

function TogglePill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-2.5 py-1 text-[11.5px] transition-colors ${
        active
          ? "border-[#C4A265] bg-[#FBF4E6] text-[#9E8245]"
          : "border-[rgba(44,44,44,0.12)] bg-white text-stone-600 hover:border-[#C4A265] hover:text-[#9E8245]"
      }`}
    >
      {children}
    </button>
  );
}

function Dropzone({
  onFiles,
  onClickPick,
  multi,
  large,
}: {
  onFiles: (files: FileList | File[]) => void;
  onClickPick: () => void;
  multi: boolean;
  large?: boolean;
}) {
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setOver(false);
        if (e.dataTransfer.files.length > 0) onFiles(e.dataTransfer.files);
      }}
      onClick={onClickPick}
      className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed text-center transition-colors ${
        large ? "py-14" : "py-8"
      } ${
        over
          ? "border-[#C4A265] bg-[#FBF4E6]"
          : "border-[rgba(44,44,44,0.15)] bg-white hover:border-[#C4A265]"
      }`}
    >
      <span className="text-[22px] text-[#C4A265]" aria-hidden>
        ↑
      </span>
      <p className="text-[13px] font-medium text-[#2C2C2C]">
        {over ? "Release to upload" : `Drop ${multi ? "images" : "an image"} here`}
      </p>
      <p
        className="text-[12px] italic text-stone-500"
        style={{ fontFamily: "'EB Garamond', serif" }}
      >
        or click to pick from your computer
      </p>
    </div>
  );
}

function ModeCard({
  active,
  title,
  hint,
  onClick,
}: {
  active: boolean;
  title: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 flex-col items-start gap-1 rounded-lg border px-3 py-2.5 text-left transition-colors ${
        active
          ? "border-[#C4A265] bg-[#FBF4E6]"
          : "border-[rgba(44,44,44,0.12)] bg-white hover:border-[#C4A265]"
      }`}
    >
      <span className="text-[13px] font-medium text-[#2C2C2C]">{title}</span>
      <span className="text-[11.5px] italic text-stone-500" style={{ fontFamily: "'EB Garamond', serif" }}>
        {hint}
      </span>
    </button>
  );
}

// ── Helpers ────────────────────────────────────────────────

function blankItem(): PortfolioItem {
  return {
    id: "",
    kind: "image",
    title: "",
    description: "",
    eventTypes: [],
    styleTags: [],
    media: [],
  };
}

function cryptoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
