// ── Content Studio store ───────────────────────────────────────────────────
// Backs Studio > Content Studio. Holds the analysed photo library and
// auto-generated packages. Persists to localStorage under
// `ananya:content-studio` (matches the other Ananya stores — no backend).
//
// Note on images: only the `thumbnail_url` (resized data URI) persists.
// The session-only object URL in `photo_url` is discarded on reload; the
// app falls back to the thumbnail when full-size isn't available.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  ContentPackage,
  ContentPhoto,
  LookbookShare,
  PackageAspect,
  PackageStatus,
} from "@/types/content-studio";
import { PACKAGE_RECIPES } from "@/lib/content-studio-templates";
import {
  analyzePhoto,
  captionForTone,
  defaultHashtags,
  generateCaptions,
  pickPhotosForRecipe,
  type CaptionContext,
} from "@/lib/content-studio-ai";
import { prepareUpload } from "@/lib/content-studio-image";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";

function rid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
function now(): string {
  return new Date().toISOString();
}

type AnalysisStatus = "idle" | "analyzing" | "done" | "error";
type UploadStatus = "idle" | "uploading";
type GenerationStatus = "idle" | "generating";

interface ContentStudioState {
  photos: ContentPhoto[];
  packages: ContentPackage[];
  lookbook: LookbookShare | null;

  // progress
  uploadStatus: UploadStatus;
  uploadTotal: number;
  uploadDone: number;
  analysisStatus: AnalysisStatus;
  analysisTotal: number;
  analysisDone: number;
  generationStatus: GenerationStatus;

  // Uploads ------------------------------------------------------------
  uploadFiles: (files: File[]) => Promise<void>;
  removePhoto: (id: string) => void;
  clearLibrary: () => void;

  // Photo overrides ----------------------------------------------------
  toggleFavorite: (id: string) => void;
  toggleExcluded: (id: string) => void;
  setEvent: (id: string, event: ContentPhoto["ai_event"]) => void;
  setCustomCaption: (id: string, caption: string) => void;

  // Analysis -----------------------------------------------------------
  runAnalysis: () => Promise<void>;

  // Packages -----------------------------------------------------------
  generateAllPackages: (ctx: CaptionContext) => void;
  regenerateCaption: (packageId: string, ctx: CaptionContext) => void;
  setPackageTone: (packageId: string, tone: ContentPackage["caption_tone"]) => void;
  setPackageCaption: (packageId: string, caption: string) => void;
  setPackageAspect: (packageId: string, aspect: PackageAspect) => void;
  setPackagePhotoIds: (packageId: string, ids: string[]) => void;
  addPhotoToPackage: (packageId: string, photoId: string) => void;
  removePhotoFromPackage: (packageId: string, photoId: string) => void;
  reorderPhotoInPackage: (packageId: string, photoId: string, newIndex: number) => void;
  setPackageHashtags: (packageId: string, tags: string[]) => void;
  setPackageStatus: (packageId: string, status: PackageStatus) => void;
  deletePackage: (packageId: string) => void;
  createCustomPackage: (input: { title: string; photo_ids: string[]; aspect_ratio: PackageAspect }) => ContentPackage;

  // Lookbook -----------------------------------------------------------
  generateLookbook: (title: string, subtitle: string) => LookbookShare;
  updateLookbookSection: (event: string, photo_ids: string[]) => void;
  deleteLookbook: () => void;
}

export const useContentStudioStore = create<ContentStudioState>()(
  persist(
    (set, get) => ({
      photos: [],
      packages: [],
      lookbook: null,

      uploadStatus: "idle",
      uploadTotal: 0,
      uploadDone: 0,
      analysisStatus: "idle",
      analysisTotal: 0,
      analysisDone: 0,
      generationStatus: "idle",

      uploadFiles: async (files) => {
        set({ uploadStatus: "uploading", uploadTotal: files.length, uploadDone: 0 });
        const existingCount = get().photos.length;
        for (let i = 0; i < files.length; i++) {
          try {
            const prepared = await prepareUpload(files[i]);
            const photo: ContentPhoto = {
              id: prepared.id,
              thumbnail_url: prepared.thumbnail_url,
              photo_url: prepared.photo_url,
              width: prepared.width,
              height: prepared.height,
              file_name: prepared.file_name,
              file_size: prepared.file_size,
              ai_event: null,
              ai_moment: null,
              ai_quality_score: 0,
              ai_emotion: null,
              ai_subjects: [],
              ai_description: "",
              ai_colors: [],
              is_favorite: false,
              is_excluded: false,
              custom_caption: "",
              source: "upload",
              sort_order: existingCount + i,
              created_at: now(),
              analyzed_at: null,
            };
            set((s) => ({ photos: [...s.photos, photo], uploadDone: s.uploadDone + 1 }));
          } catch {
            set((s) => ({ uploadDone: s.uploadDone + 1 }));
          }
        }
        set({ uploadStatus: "idle" });
      },

      removePhoto: (id) =>
        set((s) => ({
          photos: s.photos.filter((p) => p.id !== id),
          packages: s.packages.map((pkg) => ({
            ...pkg,
            photo_ids: pkg.photo_ids.filter((pid) => pid !== id),
            updated_at: now(),
          })),
        })),

      clearLibrary: () => set({ photos: [], packages: [], lookbook: null }),

      toggleFavorite: (id) =>
        set((s) => ({
          photos: s.photos.map((p) => (p.id === id ? { ...p, is_favorite: !p.is_favorite } : p)),
        })),

      toggleExcluded: (id) =>
        set((s) => ({
          photos: s.photos.map((p) => (p.id === id ? { ...p, is_excluded: !p.is_excluded } : p)),
        })),

      setEvent: (id, event) =>
        set((s) => ({
          photos: s.photos.map((p) => (p.id === id ? { ...p, ai_event: event } : p)),
        })),

      setCustomCaption: (id, caption) =>
        set((s) => ({
          photos: s.photos.map((p) => (p.id === id ? { ...p, custom_caption: caption } : p)),
        })),

      runAnalysis: async () => {
        const toAnalyse = get().photos.filter((p) => !p.analyzed_at);
        if (toAnalyse.length === 0) {
          set({ analysisStatus: "done", analysisTotal: 0, analysisDone: 0 });
          return;
        }
        set({ analysisStatus: "analyzing", analysisTotal: toAnalyse.length, analysisDone: 0 });
        for (let i = 0; i < toAnalyse.length; i++) {
          const photo = toAnalyse[i];
          try {
            const result = await analyzePhoto(photo, i);
            set((s) => ({
              photos: s.photos.map((p) =>
                p.id === photo.id ? { ...p, ...result, analyzed_at: now() } : p,
              ),
              analysisDone: s.analysisDone + 1,
            }));
          } catch {
            set((s) => ({ analysisDone: s.analysisDone + 1 }));
          }
          // Yield so the progress UI actually ticks.
          await new Promise((r) => setTimeout(r, 10));
        }
        set({ analysisStatus: "done" });
      },

      generateAllPackages: (ctx) => {
        set({ generationStatus: "generating" });
        const pool = get().photos.filter((p) => p.analyzed_at && !p.is_excluded);
        if (pool.length === 0) {
          set({ generationStatus: "idle" });
          return;
        }
        const fresh: ContentPackage[] = [];
        for (const recipe of PACKAGE_RECIPES) {
          const photo_ids = pickPhotosForRecipe(pool, recipe);
          if (photo_ids.length === 0) continue;
          const events = Array.from(
            new Set(photo_ids.map((id) => pool.find((p) => p.id === id)?.ai_event).filter(Boolean) as string[]),
          );
          const captionCtx: CaptionContext = { ...ctx, theme: recipe.theme, eventsRepresented: events, photoCount: photo_ids.length };
          const options = generateCaptions(captionCtx);
          const hashtags = defaultHashtags(captionCtx);
          fresh.push({
            id: rid("pkg"),
            title: recipe.title,
            package_type: recipe.type,
            photo_ids,
            caption: options.romantic,
            caption_tone: "romantic",
            caption_options: options,
            hashtags,
            aspect_ratio: recipe.aspect_ratio,
            ai_generated: true,
            ai_theme: recipe.theme,
            status: "draft",
            max_photos: recipe.max_photos,
            created_at: now(),
            updated_at: now(),
          });
        }
        set({ packages: fresh, generationStatus: "idle" });
      },

      regenerateCaption: (packageId, ctx) =>
        set((s) => ({
          packages: s.packages.map((pkg) => {
            if (pkg.id !== packageId) return pkg;
            const events = Array.from(
              new Set(
                pkg.photo_ids
                  .map((id) => s.photos.find((p) => p.id === id)?.ai_event)
                  .filter(Boolean) as string[],
              ),
            );
            const options = generateCaptions({
              ...ctx,
              theme: pkg.ai_theme,
              eventsRepresented: events,
              photoCount: pkg.photo_ids.length,
            });
            const caption = pkg.caption_tone === "custom" ? pkg.caption : options[pkg.caption_tone === "fun" ? "fun" : pkg.caption_tone === "minimal" ? "minimal" : "romantic"];
            return { ...pkg, caption_options: options, caption, updated_at: now() };
          }),
        })),

      setPackageTone: (packageId, tone) =>
        set((s) => ({
          packages: s.packages.map((pkg) =>
            pkg.id === packageId
              ? { ...pkg, caption_tone: tone, caption: captionForTone(pkg, tone), updated_at: now(), status: pkg.status === "draft" ? "edited" : pkg.status }
              : pkg,
          ),
        })),

      setPackageCaption: (packageId, caption) =>
        set((s) => ({
          packages: s.packages.map((pkg) =>
            pkg.id === packageId
              ? { ...pkg, caption, caption_tone: "custom", updated_at: now(), status: "edited" }
              : pkg,
          ),
        })),

      setPackageAspect: (packageId, aspect) =>
        set((s) => ({
          packages: s.packages.map((pkg) =>
            pkg.id === packageId ? { ...pkg, aspect_ratio: aspect, updated_at: now() } : pkg,
          ),
        })),

      setPackagePhotoIds: (packageId, ids) =>
        set((s) => ({
          packages: s.packages.map((pkg) =>
            pkg.id === packageId
              ? { ...pkg, photo_ids: ids.slice(0, pkg.max_photos), updated_at: now(), status: "edited" }
              : pkg,
          ),
        })),

      addPhotoToPackage: (packageId, photoId) =>
        set((s) => ({
          packages: s.packages.map((pkg) => {
            if (pkg.id !== packageId) return pkg;
            if (pkg.photo_ids.includes(photoId)) return pkg;
            if (pkg.photo_ids.length >= pkg.max_photos) return pkg;
            return { ...pkg, photo_ids: [...pkg.photo_ids, photoId], updated_at: now(), status: "edited" };
          }),
        })),

      removePhotoFromPackage: (packageId, photoId) =>
        set((s) => ({
          packages: s.packages.map((pkg) =>
            pkg.id === packageId
              ? { ...pkg, photo_ids: pkg.photo_ids.filter((id) => id !== photoId), updated_at: now(), status: "edited" }
              : pkg,
          ),
        })),

      reorderPhotoInPackage: (packageId, photoId, newIndex) =>
        set((s) => ({
          packages: s.packages.map((pkg) => {
            if (pkg.id !== packageId) return pkg;
            const without = pkg.photo_ids.filter((id) => id !== photoId);
            const clamped = Math.max(0, Math.min(newIndex, without.length));
            const rebuilt = [...without.slice(0, clamped), photoId, ...without.slice(clamped)];
            return { ...pkg, photo_ids: rebuilt, updated_at: now(), status: "edited" };
          }),
        })),

      setPackageHashtags: (packageId, tags) =>
        set((s) => ({
          packages: s.packages.map((pkg) =>
            pkg.id === packageId ? { ...pkg, hashtags: tags, updated_at: now() } : pkg,
          ),
        })),

      setPackageStatus: (packageId, status) =>
        set((s) => ({
          packages: s.packages.map((pkg) =>
            pkg.id === packageId ? { ...pkg, status, updated_at: now() } : pkg,
          ),
        })),

      deletePackage: (packageId) =>
        set((s) => ({ packages: s.packages.filter((pkg) => pkg.id !== packageId) })),

      createCustomPackage: (input) => {
        const pkg: ContentPackage = {
          id: rid("pkg"),
          title: input.title,
          package_type: "custom",
          photo_ids: input.photo_ids,
          caption: "",
          caption_tone: "custom",
          caption_options: { romantic: "", minimal: "", fun: "" },
          hashtags: [],
          aspect_ratio: input.aspect_ratio,
          ai_generated: false,
          ai_theme: "custom",
          status: "edited",
          max_photos: Math.max(input.photo_ids.length, 30),
          created_at: now(),
          updated_at: now(),
        };
        set((s) => ({ packages: [pkg, ...s.packages] }));
        return pkg;
      },

      generateLookbook: (title, subtitle) => {
        const pool = get().photos.filter((p) => p.analyzed_at && !p.is_excluded);
        const byEvent = new Map<string, ContentPhoto[]>();
        for (const p of pool) {
          const key = p.ai_event ?? "other";
          if (!byEvent.has(key)) byEvent.set(key, []);
          byEvent.get(key)!.push(p);
        }
        const order = ["getting_ready", "haldi", "mehendi", "sangeet", "baraat", "ceremony", "reception", "portraits", "details", "other"];
        const sections = order
          .filter((e) => byEvent.has(e))
          .map((e) => ({
            event: e as LookbookShare["sections"][number]["event"],
            label: e.replace("_", " "),
            photo_ids: [...byEvent.get(e)!]
              .sort((a, b) => b.ai_quality_score - a.ai_quality_score)
              .slice(0, 10)
              .map((p) => p.id),
          }));
        const lookbook: LookbookShare = {
          token: `lb_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`,
          title,
          subtitle,
          generated_at: now(),
          sections,
        };
        set({ lookbook });
        return lookbook;
      },

      updateLookbookSection: (event, photo_ids) =>
        set((s) => {
          if (!s.lookbook) return s;
          return {
            lookbook: {
              ...s.lookbook,
              sections: s.lookbook.sections.map((sec) =>
                sec.event === event ? { ...sec, photo_ids } : sec,
              ),
            },
          };
        }),

      deleteLookbook: () => set({ lookbook: null }),
    }),
    {
      name: "ananya:content-studio",
      version: 1,
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return { getItem: () => null, setItem: () => undefined, removeItem: () => undefined };
        }
        return window.localStorage;
      }),
      // Don't persist the transient photo_url (object URL) — it won't be
      // valid after a reload anyway.
      partialize: (s) => ({
        photos: s.photos.map((p) => ({ ...p, photo_url: p.thumbnail_url })),
        packages: s.packages,
        lookbook: s.lookbook,
      }),
    },
  ),
);

let _contentStudioSyncTimer: ReturnType<typeof setTimeout> | null = null;
useContentStudioStore.subscribe((state) => {
  if (_contentStudioSyncTimer) clearTimeout(_contentStudioSyncTimer);
  _contentStudioSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("content_studio_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});
