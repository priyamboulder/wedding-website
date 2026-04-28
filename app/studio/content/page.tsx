"use client";

// ═══════════════════════════════════════════════════════════════════════════════════
//   STUDIO > CONTENT STUDIO — AI-curated social from the wedding photo gallery
// ═══════════════════════════════════════════════════════════════════════════════════
//
//   Couples upload their delivered wedding photos; the app analyses them,
//   groups them by event, and builds share-ready packages (Instagram carousel,
//   story set, Facebook album, WhatsApp status, digital lookbook) with AI-
//   generated captions they can tone-switch between.
//
//   All persistence is localStorage via stores/content-studio-store.ts.
//   Image analysis + caption generation run client-side (heuristic) — when
//   a backend is wired up the shapes match the Claude Vision / caption
//   prompts described in the spec.
// ═══════════════════════════════════════════════════════════════════════════════════

import { useEffect, useMemo, useRef, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import JSZip from "jszip";
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  Sparkles,
  Heart,
  X,
  Check,
  Copy,
  Download,
  Image as ImageIcon,
  Wand2,
  RefreshCw,
  Share2,
  Trash2,
  Link2,
  Plus,
  Eye,
  EyeOff,
  Camera,
  Users,
  MessageCircle,
  BookOpen,
  GripVertical,
} from "lucide-react";
import { TopNav } from "@/components/shell/TopNav";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { deriveCoupleIdentity } from "@/lib/couple-identity";
import { useContentStudioStore } from "@/stores/content-studio-store";
import { EVENT_ORDER, EVENT_LABEL, ASPECT_DIMS } from "@/lib/content-studio-templates";
import type {
  CaptionTone,
  ContentEvent,
  ContentPackage,
  ContentPhoto,
  PackageAspect,
  PackageType,
} from "@/types/content-studio";
import { cropToAspect, downloadBlob } from "@/lib/content-studio-image";
import type { CaptionContext } from "@/lib/content-studio-ai";

type LibraryView = "all" | "by_event" | "top_picks" | "favorites";

const PLATFORM_GROUPS: { id: string; label: string; icon: typeof Camera; types: PackageType[] }[] = [
  { id: "instagram", label: "Instagram", icon: Camera, types: ["instagram_carousel", "instagram_single", "announcement", "instagram_story_set", "highlight_grid"] },
  { id: "facebook", label: "Facebook", icon: Users, types: ["facebook_album"] },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, types: ["whatsapp_status"] },
  { id: "other", label: "Other", icon: Share2, types: ["thank_you_post", "custom"] },
];

export default function ContentStudioPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const identity = deriveCoupleIdentity(user?.name, user?.wedding?.partnerName);

  const photos = useContentStudioStore((s) => s.photos);
  const packages = useContentStudioStore((s) => s.packages);
  const lookbook = useContentStudioStore((s) => s.lookbook);

  const uploadStatus = useContentStudioStore((s) => s.uploadStatus);
  const uploadTotal = useContentStudioStore((s) => s.uploadTotal);
  const uploadDone = useContentStudioStore((s) => s.uploadDone);
  const analysisStatus = useContentStudioStore((s) => s.analysisStatus);
  const analysisTotal = useContentStudioStore((s) => s.analysisTotal);
  const analysisDone = useContentStudioStore((s) => s.analysisDone);

  const uploadFiles = useContentStudioStore((s) => s.uploadFiles);
  const runAnalysis = useContentStudioStore((s) => s.runAnalysis);
  const generateAllPackages = useContentStudioStore((s) => s.generateAllPackages);
  const generateLookbook = useContentStudioStore((s) => s.generateLookbook);
  const clearLibrary = useContentStudioStore((s) => s.clearLibrary);

  const [libraryView, setLibraryView] = useState<LibraryView>("by_event");
  const [editing, setEditing] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [customOpen, setCustomOpen] = useState(false);

  const analyzedCount = photos.filter((p) => p.analyzed_at).length;
  const allAnalysed = photos.length > 0 && analyzedCount === photos.length;

  // Auto-run analysis after upload finishes.
  useEffect(() => {
    if (uploadStatus === "idle" && photos.length > 0 && photos.some((p) => !p.analyzed_at) && analysisStatus !== "analyzing") {
      runAnalysis();
    }
  }, [uploadStatus, photos, analysisStatus, runAnalysis]);

  const captionCtx: CaptionContext = useMemo(() => {
    const weddingDate = user?.wedding?.weddingDate;
    const formattedDate = weddingDate
      ? new Date(weddingDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
      : "Our wedding day";
    return {
      coupleNames: identity.fullNames,
      partnerName: identity.person2,
      date: formattedDate,
      city: user?.wedding?.location ?? null,
      eventsRepresented: [],
      theme: "chronological",
      photoCount: 0,
    };
  }, [identity, user?.wedding?.weddingDate, user?.wedding?.location]);

  const editingPkg = packages.find((p) => p.id === editing) ?? null;
  const lightboxPhoto = photos.find((p) => p.id === lightbox) ?? null;

  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <TopNav />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-8 lg:px-8">
        <NextLink
          href="/studio"
          className="mb-4 inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-muted hover:text-ink"
        >
          <ChevronLeft size={12} /> Back to Studio
        </NextLink>

        <Header
          photoCount={photos.length}
          analyzedCount={analyzedCount}
          hasPackages={packages.length > 0}
          onClear={() => {
            if (confirm("Clear the entire library and all packages? This can't be undone.")) {
              clearLibrary();
            }
          }}
        />

        {photos.length === 0 ? (
          <UploadZone onFiles={uploadFiles} uploading={uploadStatus === "uploading"} />
        ) : (
          <>
            <ProgressRow
              uploading={uploadStatus === "uploading"}
              uploadDone={uploadDone}
              uploadTotal={uploadTotal}
              analysing={analysisStatus === "analyzing"}
              analysisDone={analysisDone}
              analysisTotal={analysisTotal}
            />

            <Library
              photos={photos}
              view={libraryView}
              onViewChange={setLibraryView}
              onOpen={(id) => setLightbox(id)}
              onAddMore={uploadFiles}
              uploading={uploadStatus === "uploading"}
            />

            {allAnalysed && (
              <PackagesSection
                packages={packages}
                photos={photos}
                onGenerate={() => generateAllPackages(captionCtx)}
                onEdit={(id) => setEditing(id)}
                onOpenCustom={() => setCustomOpen(true)}
              />
            )}

            {allAnalysed && (
              <LookbookSection
                lookbook={lookbook}
                photos={photos}
                coupleNames={identity.fullNames}
                weddingDate={captionCtx.date}
                onGenerate={() => generateLookbook(identity.fullNames, captionCtx.date)}
                onOpen={(token) => router.push(`/lookbook/${token}`)}
              />
            )}
          </>
        )}
      </div>

      {editingPkg && (
        <PackageEditor
          pkg={editingPkg}
          photos={photos}
          onClose={() => setEditing(null)}
          captionCtx={captionCtx}
        />
      )}
      {lightboxPhoto && <Lightbox photo={lightboxPhoto} onClose={() => setLightbox(null)} />}
      {customOpen && (
        <CustomPackageModal
          photos={photos.filter((p) => p.analyzed_at && !p.is_excluded)}
          onClose={() => setCustomOpen(false)}
        />
      )}
    </div>
  );
}

// ── Header ─────────────────────────────────────────────────────────────────

function Header({
  photoCount,
  analyzedCount,
  hasPackages,
  onClear,
}: {
  photoCount: number;
  analyzedCount: number;
  hasPackages: boolean;
  onClear: () => void;
}) {
  return (
    <header className="flex items-start justify-between gap-4 border-b border-border pb-6">
      <div>
        <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-saffron">Studio · Content Studio</p>
        <h1 className="mt-1 font-serif text-[32px] leading-tight text-ink">your wedding, ready to share</h1>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-ink-muted">
          Turn your wedding photos into share-ready moments — carousels, stories, a Facebook album,
          and a beautiful digital lookbook, all with captions written for you.
        </p>
      </div>
      {photoCount > 0 && (
        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="flex items-center gap-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-muted">
            <span>{photoCount} photos</span>
            <span className="text-ink-faint">·</span>
            <span>{analyzedCount} analyzed</span>
            {hasPackages && (
              <>
                <span className="text-ink-faint">·</span>
                <span className="text-gold">packages ready</span>
              </>
            )}
          </div>
          <button
            onClick={onClear}
            className="inline-flex items-center gap-1.5 text-[11px] text-ink-faint hover:text-rose"
          >
            <Trash2 size={12} /> clear library
          </button>
        </div>
      )}
    </header>
  );
}

// ── Upload zone (first-time) ───────────────────────────────────────────────

function UploadZone({ onFiles, uploading }: { onFiles: (f: File[]) => void; uploading: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  return (
    <div className="mt-10">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-muted">step 1 · add your photos</p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
          if (files.length) onFiles(files);
        }}
        className={cn(
          "mt-4 rounded-xl border-2 border-dashed px-8 py-16 text-center transition-colors",
          dragOver ? "border-gold bg-gold-pale/30" : "border-border bg-white",
        )}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-saffron-pale/60 text-saffron">
          <ImageIcon size={24} />
        </div>
        <h2 className="mt-6 font-serif text-[22px] text-ink">upload your wedding photos</h2>
        <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-ink-muted">
          drag &amp; drop or tap to select. we'll organise them by event and pick the best ones for you.
          <br />
          <span className="text-ink-faint">up to 500 photos · jpg, png, webp · 10&thinsp;mb each</span>
        </p>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-[12.5px] font-medium text-ivory hover:bg-ink-soft disabled:opacity-60"
        >
          <Upload size={14} /> {uploading ? "uploading…" : "upload photos"}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length) onFiles(files);
            e.target.value = "";
          }}
        />

        <div className="my-8 flex items-center gap-4 text-ink-faint">
          <div className="h-px flex-1 bg-border" />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em]">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="mx-auto max-w-md">
          <p className="text-[13px] text-ink-muted">paste your gallery link</p>
          <div className="mt-2 flex items-center gap-2">
            <Link2 size={14} className="text-ink-faint" />
            <input
              disabled
              placeholder="https://gallery.picture.link/your-wedding"
              className="flex-1 rounded-md border border-border bg-ivory-warm/40 px-3 py-2 text-[13px] text-ink-faint outline-none"
            />
          </div>
          <p className="mt-2 text-[11.5px] leading-relaxed text-ink-faint">
            connect a gallery link so clients can access photos directly from your studio. supported platforms: Pic-Time, Pixieset, Google Drive.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Progress row ───────────────────────────────────────────────────────────

function ProgressRow({
  uploading,
  uploadDone,
  uploadTotal,
  analysing,
  analysisDone,
  analysisTotal,
}: {
  uploading: boolean;
  uploadDone: number;
  uploadTotal: number;
  analysing: boolean;
  analysisDone: number;
  analysisTotal: number;
}) {
  if (!uploading && !analysing) return null;
  const active = uploading
    ? { label: "uploading", done: uploadDone, total: uploadTotal }
    : { label: "analysing your photos", done: analysisDone, total: analysisTotal };
  const pct = active.total > 0 ? Math.round((active.done / active.total) * 100) : 0;
  return (
    <div className="mt-6 rounded-lg border border-border bg-white px-5 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-gold">
          <Sparkles size={12} /> {active.label}
        </div>
        <span className="font-mono text-[11px] tabular-nums text-ink-muted">
          {active.done} of {active.total}
        </span>
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full bg-gold transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Photo library ──────────────────────────────────────────────────────────

function Library({
  photos,
  view,
  onViewChange,
  onOpen,
  onAddMore,
  uploading,
}: {
  photos: ContentPhoto[];
  view: LibraryView;
  onViewChange: (v: LibraryView) => void;
  onOpen: (id: string) => void;
  onAddMore: (f: File[]) => void;
  uploading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const filtered = useMemo(() => {
    if (view === "top_picks") {
      return [...photos].filter((p) => p.ai_quality_score > 0.7).sort((a, b) => b.ai_quality_score - a.ai_quality_score);
    }
    if (view === "favorites") return photos.filter((p) => p.is_favorite);
    return photos;
  }, [photos, view]);

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-muted">your photo library</p>
          <h2 className="mt-0.5 font-serif text-[22px] text-ink">{photos.length} photos</h2>
        </div>
        <div className="flex items-center gap-1">
          {(["all", "by_event", "top_picks", "favorites"] as const).map((v) => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={cn(
                "rounded-md px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] transition-colors",
                view === v ? "bg-ink text-ivory" : "text-ink-muted hover:bg-ivory-warm",
              )}
            >
              {v.replace("_", " ")}
            </button>
          ))}
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="ml-2 inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-muted hover:bg-ivory-warm disabled:opacity-60"
          >
            <Plus size={12} /> add more
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              if (files.length) onAddMore(files);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {view === "by_event" ? <ByEventView photos={photos} onOpen={onOpen} /> : <PhotoGrid photos={filtered} onOpen={onOpen} />}
    </section>
  );
}

function ByEventView({ photos, onOpen }: { photos: ContentPhoto[]; onOpen: (id: string) => void }) {
  const groups = useMemo(() => {
    const byEvent = new Map<string, ContentPhoto[]>();
    for (const p of photos) {
      const key = (p.ai_event ?? "other") as string;
      if (!byEvent.has(key)) byEvent.set(key, []);
      byEvent.get(key)!.push(p);
    }
    return EVENT_ORDER.map((e) => ({ id: e.id, label: e.label, photos: byEvent.get(e.id) ?? [] })).filter((g) => g.photos.length > 0);
  }, [photos]);

  if (groups.length === 0) {
    return (
      <div className="mt-8 rounded-lg border border-dashed border-border bg-white px-6 py-12 text-center">
        <p className="text-[13px] text-ink-muted">photos haven't been analysed yet.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-8">
      {groups.map((g) => (
        <div key={g.id}>
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="font-serif text-[18px] text-ink">{g.label}</h3>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">{g.photos.length}</span>
          </div>
          <PhotoGrid photos={g.photos.slice(0, 12)} onOpen={onOpen} />
          {g.photos.length > 12 && (
            <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
              +{g.photos.length - 12} more
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function PhotoGrid({ photos, onOpen }: { photos: ContentPhoto[]; onOpen: (id: string) => void }) {
  if (photos.length === 0) {
    return (
      <div className="mt-6 rounded-lg border border-dashed border-border bg-white px-6 py-12 text-center">
        <p className="text-[13px] text-ink-muted">nothing here yet.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
      {photos.map((p) => (
        <PhotoTile key={p.id} photo={p} onOpen={onOpen} />
      ))}
    </div>
  );
}

function PhotoTile({ photo, onOpen }: { photo: ContentPhoto; onOpen: (id: string) => void }) {
  const toggleFavorite = useContentStudioStore((s) => s.toggleFavorite);
  return (
    <button
      onClick={() => onOpen(photo.id)}
      className={cn(
        "group relative aspect-square overflow-hidden rounded-md bg-ivory-warm",
        photo.is_excluded && "opacity-40",
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.thumbnail_url} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
      {photo.ai_quality_score > 0.75 && (
        <span className="absolute left-1.5 top-1.5 rounded-sm bg-gold/90 px-1 py-0.5 font-mono text-[8.5px] uppercase tracking-wider text-white">
          top
        </span>
      )}
      <span
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(photo.id);
        }}
        className={cn(
          "absolute right-1.5 top-1.5 rounded-full p-1 transition-opacity",
          photo.is_favorite ? "bg-rose text-white opacity-100" : "bg-ink/40 text-white opacity-0 group-hover:opacity-100",
        )}
        role="button"
        aria-label={photo.is_favorite ? "unfavorite" : "favorite"}
      >
        <Heart size={11} fill={photo.is_favorite ? "currentColor" : "none"} />
      </span>
    </button>
  );
}

// ── Lightbox ───────────────────────────────────────────────────────────────

function Lightbox({ photo, onClose }: { photo: ContentPhoto; onClose: () => void }) {
  const toggleFavorite = useContentStudioStore((s) => s.toggleFavorite);
  const toggleExcluded = useContentStudioStore((s) => s.toggleExcluded);
  const removePhoto = useContentStudioStore((s) => s.removePhoto);
  const setEvent = useContentStudioStore((s) => s.setEvent);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-6" onClick={onClose}>
      <div
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex max-h-[50vh] items-center justify-center bg-ink-soft md:max-h-full md:w-2/3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.photo_url || photo.thumbnail_url} alt="" className="max-h-full max-w-full object-contain" />
        </div>
        <div className="flex flex-col gap-3 p-5 md:w-1/3">
          <div className="flex items-start justify-between">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-gold">photo details</p>
            <button onClick={onClose} className="rounded-md p-1 text-ink-muted hover:bg-ivory-warm">
              <X size={14} />
            </button>
          </div>
          <p className="text-[13px] leading-relaxed text-ink">{photo.ai_description || "Not yet analysed."}</p>
          <dl className="space-y-2 text-[12px]">
            <Field label="event" value={
              <select
                value={photo.ai_event ?? "other"}
                onChange={(e) => setEvent(photo.id, e.target.value as ContentEvent)}
                className="rounded-md border border-border bg-white px-2 py-1 text-[12px]"
              >
                {EVENT_ORDER.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.label}
                  </option>
                ))}
              </select>
            } />
            <Field label="moment" value={photo.ai_moment?.replace("_", " ") ?? "—"} />
            <Field label="emotion" value={photo.ai_emotion ?? "—"} />
            <Field
              label="quality"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-14 overflow-hidden rounded-full bg-border">
                    <span className="block h-full bg-gold" style={{ width: `${Math.round(photo.ai_quality_score * 100)}%` }} />
                  </span>
                  <span className="font-mono text-[11px] tabular-nums">{Math.round(photo.ai_quality_score * 100)}</span>
                </span>
              }
            />
            <Field label="subjects" value={photo.ai_subjects.join(", ") || "—"} />
            {photo.ai_colors.length > 0 && (
              <Field
                label="palette"
                value={
                  <span className="inline-flex gap-1">
                    {photo.ai_colors.map((c) => (
                      <span key={c} className="inline-block h-4 w-4 rounded-sm border border-border" style={{ background: c }} />
                    ))}
                  </span>
                }
              />
            )}
          </dl>

          <div className="mt-auto flex flex-wrap gap-2 pt-3">
            <button
              onClick={() => toggleFavorite(photo.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[11.5px]",
                photo.is_favorite ? "border-rose bg-rose-pale text-rose" : "border-border text-ink-muted hover:bg-ivory-warm",
              )}
            >
              <Heart size={12} fill={photo.is_favorite ? "currentColor" : "none"} />
              {photo.is_favorite ? "favorited" : "favorite"}
            </button>
            <button
              onClick={() => toggleExcluded(photo.id)}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[11.5px] text-ink-muted hover:bg-ivory-warm"
            >
              {photo.is_excluded ? <Eye size={12} /> : <EyeOff size={12} />}
              {photo.is_excluded ? "include" : "exclude"}
            </button>
            <button
              onClick={() => {
                if (confirm("Remove this photo from the library?")) {
                  removePhoto(photo.id);
                  onClose();
                }
              }}
              className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[11.5px] text-rose hover:bg-rose-pale/50"
            >
              <Trash2 size={12} /> delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">{label}</dt>
      <dd className="text-[12px] text-ink">{value}</dd>
    </div>
  );
}

// ── Packages section ───────────────────────────────────────────────────────

function PackagesSection({
  packages,
  photos,
  onGenerate,
  onEdit,
  onOpenCustom,
}: {
  packages: ContentPackage[];
  photos: ContentPhoto[];
  onGenerate: () => void;
  onEdit: (id: string) => void;
  onOpenCustom: () => void;
}) {
  return (
    <section className="mt-14">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-gold">step 3 · packages</p>
          <h2 className="mt-0.5 font-serif text-[22px] text-ink">your content, ready to share</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
            we picked your best moments and put them together into packages you can post right away.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onGenerate}
            className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-[12.5px] font-medium text-ivory hover:bg-ink-soft"
          >
            <Wand2 size={14} /> {packages.length === 0 ? "generate packages" : "regenerate"}
          </button>
          {packages.length > 0 && (
            <button
              onClick={onOpenCustom}
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-[12.5px] text-ink-muted hover:bg-ivory-warm"
            >
              <Plus size={14} /> custom
            </button>
          )}
        </div>
      </div>

      {packages.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-border bg-white px-6 py-14 text-center">
          <Sparkles size={24} className="mx-auto text-gold" />
          <p className="mt-3 font-serif text-[18px] text-ink">ready when you are</p>
          <p className="mx-auto mt-1 max-w-md text-[13px] leading-relaxed text-ink-muted">
            tap "generate packages" and we'll build you an instagram carousel, a story set, a facebook album, a whatsapp
            status set, and an announcement post — all from your analysed photos, with captions written in three tones.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {PLATFORM_GROUPS.map((group) => {
            const pkgs = packages.filter((p) => group.types.includes(p.package_type));
            if (pkgs.length === 0) return null;
            const GroupIcon = group.icon;
            return (
              <div key={group.id}>
                <div className="mb-3 flex items-center gap-2">
                  <GroupIcon size={14} className="text-ink-muted" />
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-muted">{group.label}</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {pkgs.map((pkg) => (
                    <PackageCard key={pkg.id} pkg={pkg} photos={photos} onEdit={() => onEdit(pkg.id)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function PackageCard({ pkg, photos, onEdit }: { pkg: ContentPackage; photos: ContentPhoto[]; onEdit: () => void }) {
  const byId = useMemo(() => new Map(photos.map((p) => [p.id, p])), [photos]);
  const selected = pkg.photo_ids.map((id) => byId.get(id)).filter(Boolean) as ContentPhoto[];
  const typeLabel = PACKAGE_LABELS[pkg.package_type] ?? pkg.package_type;

  return (
    <article className="rounded-xl border border-border bg-white p-5 shadow-[0_1px_3px_rgba(26,26,26,0.04)]">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-faint">{typeLabel}</p>
          <h3 className="mt-0.5 font-serif text-[17px] text-ink">{pkg.title}</h3>
          <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-muted">
            {selected.length} photo{selected.length === 1 ? "" : "s"} · {ASPECT_DIMS[pkg.aspect_ratio].label}
          </p>
        </div>
        <StatusPill status={pkg.status} />
      </div>

      <div className="mt-3 flex gap-1 overflow-x-auto pb-1">
        {selected.slice(0, 12).map((p, idx) => (
          <div key={p.id} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-ivory-warm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.thumbnail_url} alt="" className="h-full w-full object-cover" />
            <span className="absolute bottom-0 left-0 bg-ink/70 px-1 font-mono text-[8.5px] text-white">{idx + 1}</span>
          </div>
        ))}
        {selected.length > 12 && (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-sm border border-dashed border-border font-mono text-[10px] text-ink-faint">
            +{selected.length - 12}
          </div>
        )}
      </div>

      <p className="mt-3 line-clamp-3 text-[12.5px] leading-relaxed text-ink-soft">
        {pkg.caption || "(no caption yet)"}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-muted hover:bg-ivory-warm"
        >
          <Wand2 size={11} /> edit & customize
        </button>
        <button
          onClick={() => {
            const text = pkg.caption + (pkg.hashtags.length ? "\n\n" + pkg.hashtags.join(" ") : "");
            navigator.clipboard?.writeText(text);
          }}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-muted hover:bg-ivory-warm"
        >
          <Copy size={11} /> copy caption
        </button>
        <button
          onClick={() => exportPackage(pkg, selected)}
          className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ivory hover:bg-ink-soft"
        >
          <Download size={11} /> download
        </button>
      </div>
    </article>
  );
}

const PACKAGE_LABELS: Record<PackageType, string> = {
  instagram_carousel: "Instagram Carousel",
  instagram_single: "Instagram Single",
  instagram_story_set: "Instagram Stories",
  facebook_album: "Facebook Album",
  whatsapp_status: "WhatsApp Status",
  digital_lookbook: "Digital Lookbook",
  highlight_grid: "Highlight Grid",
  announcement: "Announcement",
  thank_you_post: "Thank You Post",
  custom: "Custom Collection",
};

function StatusPill({ status }: { status: ContentPackage["status"] }) {
  const tone: Record<ContentPackage["status"], string> = {
    draft: "bg-ivory-warm text-ink-muted",
    edited: "bg-saffron-pale/60 text-saffron",
    exported: "bg-sage-pale/60 text-sage",
    posted: "bg-gold-pale text-gold",
  };
  return (
    <span className={cn("rounded-full px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em]", tone[status])}>
      {status}
    </span>
  );
}

// ── Export logic (client-side cropping + zip) ──────────────────────────────

async function exportPackage(pkg: ContentPackage, photos: ContentPhoto[]): Promise<void> {
  const setStatus = useContentStudioStore.getState().setPackageStatus;
  if (photos.length === 0) return;
  try {
    if (photos.length === 1) {
      const blob = await cropToAspect(photos[0].photo_url || photos[0].thumbnail_url, pkg.aspect_ratio);
      if (blob) {
        downloadBlob(blob, `${slug(pkg.title)}.jpg`);
        setStatus(pkg.id, "exported");
      }
      return;
    }
    const zip = new JSZip();
    const padWidth = String(photos.length).length;
    for (let i = 0; i < photos.length; i++) {
      const ph = photos[i];
      const blob = await cropToAspect(ph.photo_url || ph.thumbnail_url, pkg.aspect_ratio);
      if (!blob) continue;
      const num = String(i + 1).padStart(padWidth, "0");
      const tag = (ph.ai_event ?? "photo").replace(/_/g, "-");
      zip.file(`${num}-${tag}.jpg`, blob);
    }
    if (pkg.caption || pkg.hashtags.length) {
      zip.file("caption.txt", pkg.caption + (pkg.hashtags.length ? "\n\n" + pkg.hashtags.join(" ") : ""));
    }
    const out = await zip.generateAsync({ type: "blob" });
    downloadBlob(out, `${slug(pkg.title)}.zip`);
    setStatus(pkg.id, "exported");
  } catch (err) {
    console.error("export failed", err);
    alert("export failed — please try again.");
  }
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ── Lookbook section ───────────────────────────────────────────────────────

function LookbookSection({
  lookbook,
  photos,
  coupleNames,
  weddingDate,
  onGenerate,
  onOpen,
}: {
  lookbook: ReturnType<typeof useContentStudioStore.getState>["lookbook"];
  photos: ContentPhoto[];
  coupleNames: string;
  weddingDate: string;
  onGenerate: () => void;
  onOpen: (token: string) => void;
}) {
  return (
    <section className="mt-14 mb-10">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-gold">digital lookbook</p>
          <h2 className="mt-0.5 font-serif text-[22px] text-ink">a keepsake page you can share</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
            auto-built from your best photos, organised by event. share the link with family or drop it into your thank-you note.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onGenerate}
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-[12.5px] text-ink-muted hover:bg-ivory-warm"
          >
            <RefreshCw size={13} /> {lookbook ? "rebuild" : "generate"}
          </button>
        </div>
      </div>

      {!lookbook ? (
        <div className="mt-6 rounded-lg border border-dashed border-border bg-white px-6 py-12 text-center">
          <BookOpen size={22} className="mx-auto text-gold" />
          <p className="mt-3 text-[13px] text-ink-muted">no lookbook yet — tap "generate" to build one from your library.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-border bg-white">
          <div className="grid gap-0.5 bg-border md:grid-cols-4">
            {lookbook.sections.slice(0, 4).flatMap((sec) =>
              sec.photo_ids.slice(0, 1).map((pid) => {
                const p = photos.find((ph) => ph.id === pid);
                if (!p) return null;
                return (
                  <div key={pid} className="relative aspect-[4/5] overflow-hidden bg-ivory-warm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.thumbnail_url} alt="" className="h-full w-full object-cover" />
                    <span className="absolute bottom-2 left-2 rounded-sm bg-ink/70 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white">
                      {sec.label}
                    </span>
                  </div>
                );
              }),
            )}
          </div>
          <div className="flex items-center justify-between gap-3 p-5">
            <div>
              <p className="font-serif text-[17px] text-ink">{coupleNames}</p>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-muted">
                {weddingDate} · {lookbook.sections.length} sections · {lookbook.sections.reduce((a, s) => a + s.photo_ids.length, 0)} photos
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const url = `${window.location.origin}/lookbook/${lookbook.token}`;
                  navigator.clipboard?.writeText(url);
                }}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-muted hover:bg-ivory-warm"
              >
                <Copy size={11} /> copy link
              </button>
              <button
                onClick={() => onOpen(lookbook.token)}
                className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ivory hover:bg-ink-soft"
              >
                <Eye size={11} /> preview
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ── Package editor ─────────────────────────────────────────────────────────

function PackageEditor({
  pkg,
  photos,
  onClose,
  captionCtx,
}: {
  pkg: ContentPackage;
  photos: ContentPhoto[];
  onClose: () => void;
  captionCtx: CaptionContext;
}) {
  const setPackageTone = useContentStudioStore((s) => s.setPackageTone);
  const setPackageCaption = useContentStudioStore((s) => s.setPackageCaption);
  const setPackageAspect = useContentStudioStore((s) => s.setPackageAspect);
  const removePhotoFromPackage = useContentStudioStore((s) => s.removePhotoFromPackage);
  const addPhotoToPackage = useContentStudioStore((s) => s.addPhotoToPackage);
  const reorderPhotoInPackage = useContentStudioStore((s) => s.reorderPhotoInPackage);
  const regenerateCaption = useContentStudioStore((s) => s.regenerateCaption);
  const setPackageHashtags = useContentStudioStore((s) => s.setPackageHashtags);
  const deletePackage = useContentStudioStore((s) => s.deletePackage);

  const byId = useMemo(() => new Map(photos.map((p) => [p.id, p])), [photos]);
  const selected = pkg.photo_ids.map((id) => byId.get(id)).filter(Boolean) as ContentPhoto[];
  const available = photos.filter((p) => p.analyzed_at && !p.is_excluded && !pkg.photo_ids.includes(p.id));
  const [dragFrom, setDragFrom] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-40 flex items-stretch justify-end bg-ink/50" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-3xl flex-col overflow-y-auto bg-ivory shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-ivory/95 px-6 py-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="rounded-md p-1.5 text-ink-muted hover:bg-ivory-warm">
              <ChevronLeft size={16} />
            </button>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">{PACKAGE_LABELS[pkg.package_type]}</p>
              <h2 className="font-serif text-[20px] text-ink">{pkg.title}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm("delete this package?")) {
                  deletePackage(pkg.id);
                  onClose();
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-rose hover:bg-rose-pale/40"
            >
              <Trash2 size={11} /> delete
            </button>
            <button
              onClick={() => exportPackage(pkg, selected)}
              className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ivory hover:bg-ink-soft"
            >
              <Download size={11} /> download
            </button>
          </div>
        </header>

        <div className="space-y-8 px-6 py-6">
          <section>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">photo order</p>
            <p className="mt-1 text-[12.5px] text-ink-muted">
              drag to reorder · tap <X className="inline h-2.5 w-2.5" /> to remove · {selected.length}/{pkg.max_photos} photos
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {selected.map((p, idx) => (
                <div
                  key={p.id}
                  draggable
                  onDragStart={() => setDragFrom(p.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (!dragFrom || dragFrom === p.id) return;
                    reorderPhotoInPackage(pkg.id, dragFrom, idx);
                    setDragFrom(null);
                  }}
                  onDragEnd={() => setDragFrom(null)}
                  className="group relative h-24 w-24 cursor-grab overflow-hidden rounded-md bg-ivory-warm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.thumbnail_url} alt="" className="h-full w-full object-cover" />
                  <span className="absolute bottom-0 left-0 bg-ink/70 px-1 font-mono text-[8.5px] text-white">{idx + 1}</span>
                  <GripVertical size={10} className="absolute right-1 top-1 text-white/80" />
                  <button
                    onClick={() => removePhotoFromPackage(pkg.id, p.id)}
                    className="absolute right-1 bottom-1 rounded-full bg-ink/70 p-0.5 text-white opacity-0 transition-opacity hover:bg-rose group-hover:opacity-100"
                    aria-label="remove"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
              {selected.length < pkg.max_photos && (
                <AddPhotoPicker
                  available={available}
                  onPick={(id) => addPhotoToPackage(pkg.id, id)}
                />
              )}
            </div>
          </section>

          <section>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">caption</p>
            <div className="mt-2 flex items-center gap-2">
              {(["romantic", "minimal", "fun", "custom"] as CaptionTone[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setPackageTone(pkg.id, t)}
                  className={cn(
                    "rounded-full px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.14em] transition-colors",
                    pkg.caption_tone === t ? "bg-ink text-ivory" : "border border-border text-ink-muted hover:bg-ivory-warm",
                  )}
                >
                  {t}
                </button>
              ))}
              <button
                onClick={() => regenerateCaption(pkg.id, captionCtx)}
                className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-muted hover:bg-ivory-warm"
              >
                <RefreshCw size={11} /> regenerate
              </button>
            </div>
            <textarea
              value={pkg.caption}
              onChange={(e) => setPackageCaption(pkg.id, e.target.value)}
              rows={4}
              className="mt-3 w-full resize-y rounded-md border border-border bg-white px-3 py-2 text-[13px] leading-relaxed text-ink outline-none focus:border-gold"
            />
          </section>

          <section>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">hashtags</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {pkg.hashtags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 font-mono text-[11px] text-ink">
                  {tag}
                  <button
                    onClick={() => setPackageHashtags(pkg.id, pkg.hashtags.filter((t) => t !== tag))}
                    className="text-ink-faint hover:text-rose"
                    aria-label={`remove ${tag}`}
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
              <AddHashtagInput onAdd={(t) => setPackageHashtags(pkg.id, [...pkg.hashtags, t])} />
            </div>
          </section>

          <section>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">format</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["1:1", "4:5", "9:16", "16:9", "original"] as PackageAspect[]).map((a) => (
                <button
                  key={a}
                  onClick={() => setPackageAspect(pkg.id, a)}
                  className={cn(
                    "rounded-md border px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] transition-colors",
                    pkg.aspect_ratio === a ? "border-ink bg-ink text-ivory" : "border-border text-ink-muted hover:bg-ivory-warm",
                  )}
                >
                  {ASPECT_DIMS[a].label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">preview</p>
            <PhonePreview pkg={pkg} photos={selected} />
          </section>
        </div>
      </div>
    </div>
  );
}

function AddPhotoPicker({ available, onPick }: { available: ContentPhoto[]; onPick: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-24 w-24 items-center justify-center rounded-md border border-dashed border-border bg-white text-ink-muted hover:bg-ivory-warm"
      >
        <Plus size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-[320px] max-h-96 overflow-y-auto rounded-lg border border-border bg-white p-3 shadow-xl">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">pick a photo</p>
          <div className="grid grid-cols-4 gap-1.5">
            {available.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onPick(p.id);
                  setOpen(false);
                }}
                className="aspect-square overflow-hidden rounded-sm bg-ivory-warm hover:ring-2 hover:ring-gold"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.thumbnail_url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          {available.length === 0 && <p className="text-[12px] text-ink-muted">no available photos.</p>}
        </div>
      )}
    </div>
  );
}

function AddHashtagInput({ onAdd }: { onAdd: (tag: string) => void }) {
  const [v, setV] = useState("");
  const submit = () => {
    const clean = v.trim().replace(/^#*/, "");
    if (clean) onAdd("#" + clean);
    setV("");
  };
  return (
    <input
      value={v}
      onChange={(e) => setV(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") submit();
      }}
      onBlur={submit}
      placeholder="+ add hashtag"
      className="w-32 rounded-full border border-dashed border-border bg-white px-3 py-1 font-mono text-[11px] outline-none focus:border-gold"
    />
  );
}

function PhonePreview({ pkg, photos }: { pkg: ContentPackage; photos: ContentPhoto[] }) {
  const dims = ASPECT_DIMS[pkg.aspect_ratio];
  const aspect = dims.w && dims.h ? dims.w / dims.h : 1;
  const showCount = Math.min(photos.length, 5);
  return (
    <div className="mt-2 overflow-hidden rounded-2xl border border-border bg-white">
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-rose to-gold" />
          <div className="flex-1">
            <p className="font-mono text-[10.5px] text-ink">@ananyawedding</p>
            <p className="font-mono text-[9.5px] text-ink-faint">now</p>
          </div>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto bg-ivory-warm p-3">
        {photos.slice(0, showCount).map((p) => (
          <div
            key={p.id}
            className="shrink-0 overflow-hidden rounded-md bg-ink-soft"
            style={{ width: 220, height: 220 / aspect }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.thumbnail_url} alt="" className="h-full w-full object-cover" />
          </div>
        ))}
      </div>
      <div className="space-y-2 px-4 py-3">
        <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-ink">{pkg.caption}</p>
        {pkg.hashtags.length > 0 && (
          <p className="font-mono text-[11px] leading-relaxed text-sage">{pkg.hashtags.join(" ")}</p>
        )}
      </div>
    </div>
  );
}

// ── Custom package modal ───────────────────────────────────────────────────

function CustomPackageModal({ photos, onClose }: { photos: ContentPhoto[]; onClose: () => void }) {
  const createCustomPackage = useContentStudioStore((s) => s.createCustomPackage);
  const [title, setTitle] = useState("");
  const [picks, setPicks] = useState<string[]>([]);
  const [aspect, setAspect] = useState<PackageAspect>("4:5");
  const togglePick = (id: string) => {
    setPicks((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-gold">custom collection</p>
            <h2 className="font-serif text-[18px] text-ink">pick your own photos</h2>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-ink-muted hover:bg-ivory-warm">
            <X size={14} />
          </button>
        </div>
        <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden p-5 md:grid-cols-[2fr_1fr]">
          <div className="overflow-y-auto">
            <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5 md:grid-cols-6">
              {photos.map((p) => {
                const isPicked = picks.includes(p.id);
                const pickedIdx = picks.indexOf(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePick(p.id)}
                    className={cn(
                      "relative aspect-square overflow-hidden rounded-sm transition-all",
                      isPicked ? "ring-2 ring-gold" : "hover:opacity-80",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.thumbnail_url} alt="" className="h-full w-full object-cover" />
                    {isPicked && (
                      <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold font-mono text-[9.5px] text-white">
                        {pickedIdx + 1}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-muted">title</p>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My favourites"
                className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] outline-none focus:border-gold"
              />
            </div>
            <div>
              <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-muted">format</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(["1:1", "4:5", "9:16", "16:9"] as PackageAspect[]).map((a) => (
                  <button
                    key={a}
                    onClick={() => setAspect(a)}
                    className={cn(
                      "rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em]",
                      aspect === a ? "border-ink bg-ink text-ivory" : "border-border text-ink-muted",
                    )}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-muted">
              {picks.length} selected
            </p>
            <button
              onClick={() => {
                if (!title.trim() || picks.length === 0) return;
                createCustomPackage({ title: title.trim(), photo_ids: picks, aspect_ratio: aspect });
                onClose();
              }}
              disabled={!title.trim() || picks.length === 0}
              className="mt-auto inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-2 text-[12.5px] font-medium text-ivory hover:bg-ink-soft disabled:opacity-50"
            >
              <Check size={13} /> create collection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
