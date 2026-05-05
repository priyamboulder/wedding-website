// ── stores/share-shaadi-store.ts ────────────────────────────────────────────
// In-progress submission for the "Share Your Shaadi" flow at /share/*. Drafts
// are persisted to localStorage so couples can close the tab and resume.
// Submitted stories are pushed to /api/share/submissions (Supabase) when that
// API is wired up — for now the submitted list also lives in localStorage so
// the confirmation + preview screens have something to render.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  AIDraft,
  EventTag,
  InterviewMessage,
  ShareSubmission,
  StorytellingAngle,
  StoryBlock,
  SubmissionPath,
} from "@/types/share-shaadi";

function emptyDraft(): ShareSubmission {
  const now = new Date().toISOString();
  return {
    id: `share_${Date.now().toString(36)}`,
    brideName: "",
    groomName: "",
    contactEmail: "",
    weddingMonth: null,
    venue: "",
    city: "",
    guestCount: null,
    events: [],
    hashtag: "",
    angle: null,
    path: "diy",
    blocks: [],
    interviewTranscript: [],
    aiDraft: null,
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };
}

// RFC 4122 v4-ish UUID. We don't need cryptographic strength for an upload
// session ID — Supabase Storage paths are random-looking, scoped per
// session, and effectively unguessable for a few hours.
function makeUploadSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "ses-xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface ShareShaadiState {
  draft: ShareSubmission;
  submitted: ShareSubmission[];

  // Per-browser upload session token. Used to namespace photo uploads on
  // Supabase Storage for unauthenticated couples — the submit handler links
  // any uploads under this prefix to the submission row when it's written.
  // Generated lazily on first read via `getUploadSessionId()`.
  uploadSessionId: string | null;
  getUploadSessionId: () => string;

  // Reset draft (e.g. starting over after submission).
  resetDraft: (path?: SubmissionPath) => void;

  // Patch arbitrary top-level fields on the draft. Bumps updatedAt.
  patch: (patch: Partial<ShareSubmission>) => void;

  // Events multi-select toggle helper.
  toggleEvent: (event: EventTag) => void;

  // Angle picker.
  setAngle: (angle: StorytellingAngle) => void;

  // Block builder.
  addBlock: (block: StoryBlock) => void;
  updateBlock: (id: string, patch: Partial<StoryBlock>) => void;
  removeBlock: (id: string) => void;
  reorderBlocks: (orderedIds: string[]) => void;
  setBlocks: (blocks: StoryBlock[]) => void;

  // AI interview.
  appendInterviewMessage: (msg: InterviewMessage) => void;
  setInterviewTranscript: (transcript: InterviewMessage[]) => void;
  setAIDraft: (draft: AIDraft | null) => void;

  // Submission lifecycle.
  submit: () => ShareSubmission;
}

export const useShareShaadiStore = create<ShareShaadiState>()(
  persist(
    (set, get) => ({
      draft: emptyDraft(),
      submitted: [],
      uploadSessionId: null,

      getUploadSessionId: () => {
        const existing = get().uploadSessionId;
        if (existing) return existing;
        const next = makeUploadSessionId();
        set({ uploadSessionId: next });
        return next;
      },

      resetDraft: (path = "diy") => {
        const fresh = emptyDraft();
        fresh.path = path;
        set({ draft: fresh });
      },

      patch: (patch) => {
        set((s) => ({
          draft: { ...s.draft, ...patch, updatedAt: new Date().toISOString() },
        }));
      },

      toggleEvent: (event) => {
        set((s) => {
          const has = s.draft.events.includes(event);
          const events = has
            ? s.draft.events.filter((e) => e !== event)
            : [...s.draft.events, event];
          return {
            draft: { ...s.draft, events, updatedAt: new Date().toISOString() },
          };
        });
      },

      setAngle: (angle) => {
        set((s) => ({
          draft: { ...s.draft, angle, updatedAt: new Date().toISOString() },
        }));
      },

      addBlock: (block) => {
        set((s) => ({
          draft: {
            ...s.draft,
            blocks: [...s.draft.blocks, block],
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      updateBlock: (id, patch) => {
        set((s) => ({
          draft: {
            ...s.draft,
            blocks: s.draft.blocks.map((b) =>
              b.id === id ? ({ ...b, ...patch } as StoryBlock) : b,
            ),
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      removeBlock: (id) => {
        set((s) => ({
          draft: {
            ...s.draft,
            blocks: s.draft.blocks.filter((b) => b.id !== id),
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      reorderBlocks: (orderedIds) => {
        set((s) => {
          const map = new Map(s.draft.blocks.map((b) => [b.id, b]));
          const next = orderedIds
            .map((id) => map.get(id))
            .filter((b): b is StoryBlock => Boolean(b));
          return {
            draft: {
              ...s.draft,
              blocks: next,
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      setBlocks: (blocks) => {
        set((s) => ({
          draft: {
            ...s.draft,
            blocks,
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      appendInterviewMessage: (msg) => {
        set((s) => ({
          draft: {
            ...s.draft,
            interviewTranscript: [...s.draft.interviewTranscript, msg],
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      setInterviewTranscript: (transcript) => {
        set((s) => ({
          draft: {
            ...s.draft,
            interviewTranscript: transcript,
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      setAIDraft: (aiDraft) => {
        set((s) => ({
          draft: {
            ...s.draft,
            aiDraft,
            blocks: aiDraft ? aiDraft.blocks : s.draft.blocks,
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      submit: () => {
        const now = new Date().toISOString();
        const submitted: ShareSubmission = {
          ...get().draft,
          status: "submitted",
          updatedAt: now,
        };
        set((s) => ({
          submitted: [submitted, ...s.submitted],
          draft: emptyDraft(),
        }));
        return submitted;
      },
    }),
    {
      name: "marigold:share-shaadi:v1",
      storage: createJSONStorage(() =>
        typeof window === "undefined"
          ? {
              getItem: () => null,
              setItem: () => undefined,
              removeItem: () => undefined,
            }
          : window.localStorage,
      ),
      // Persisted drafts created before a schema field was added will be
      // missing it after rehydration. Bump the version whenever a required
      // string field lands and backfill defaults here so old drafts don't
      // crash code that calls `.trim()` on `undefined`.
      version: 2,
      migrate: (persisted: any, _version: number) => {
        if (!persisted || typeof persisted !== "object") return persisted;
        const next = { ...persisted };
        if (next.draft && typeof next.draft === "object") {
          if (typeof next.draft.contactEmail !== "string") {
            next.draft.contactEmail = "";
          }
        }
        if (Array.isArray(next.submitted)) {
          next.submitted = next.submitted.map((s: any) => ({
            ...s,
            contactEmail: typeof s?.contactEmail === "string" ? s.contactEmail : "",
          }));
        }
        return next;
      },
    },
  ),
);
