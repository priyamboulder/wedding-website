import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  ActivityKind,
  VendorWorkspace,
  VendorWorkspaceActivity,
  VendorWorkspaceContent,
  VendorWorkspaceInvitation,
  VendorWorkspacePermissions,
  WorkspaceDiscipline,
  WorkspaceInviteStatus,
} from "@/types/vendor-workspace";
import { DEFAULT_PERMISSIONS } from "@/types/vendor-workspace";
import {
  SEED_VENDOR_WORKSPACES,
  SEED_WEDDING_ID,
} from "@/lib/vendors/workspace-seed";

// ── Store shape ─────────────────────────────────────────────────────────────
// A VendorWorkspace is the couple's pre-configured, scoped view they stage
// for each vendor before inviting them. One record per vendor per wedding.
// Persistence is localStorage; Supabase migration is schema-parallel.

interface VendorWorkspaceState {
  workspaces: VendorWorkspace[];

  // Query
  getByVendorId: (vendorId: string) => VendorWorkspace | undefined;

  // Lifecycle
  createWorkspace: (input: {
    vendor_id: string;
    wedding_id?: string;
    discipline: WorkspaceDiscipline;
  }) => VendorWorkspace;

  // Content + permissions
  updateContent: (id: string, patch: VendorWorkspaceContent) => void;
  updatePermissions: (
    id: string,
    patch: Partial<VendorWorkspacePermissions>,
  ) => void;
  setDiscipline: (id: string, discipline: WorkspaceDiscipline) => void;

  // Invitation
  sendInvitation: (
    id: string,
    payload: { invited_email: string; personal_note: string },
  ) => void;
  resendInvitation: (id: string) => void;
  revokeInvitation: (id: string) => void;
  markClaimed: (id: string) => void;

  // Activity
  logActivity: (
    id: string,
    entry: Omit<VendorWorkspaceActivity, "id" | "workspace_id" | "at"> & {
      at?: string;
    },
  ) => void;
}

function defaultContentFor(
  discipline: WorkspaceDiscipline,
): VendorWorkspaceContent {
  switch (discipline) {
    case "catering":
      return {
        kind: "catering",
        courses: [],
        guest_counts: { total: 0, veg: 0, non_veg: 0, jain: 0, vegan: 0, kids: 0 },
        service_timing: [],
        staffing: [],
        kitchen_logistics: [],
        tastings: [],
        deliverables: [],
      };
    case "hmua":
      return {
        kind: "hmua",
        timeline: [],
        looks: [],
        product_preferences: [],
        trials: [],
      };
    case "mehndi":
      return {
        kind: "mehndi",
        design_references: [],
        bridal: {
          intricacy: "intermediate",
          application_hours: 4,
          motifs: [],
          coverage: "",
        },
        guest_session: {
          guest_count: 0,
          duration_hours: 0,
          location: "",
          event: "",
        },
        timeline: [],
      };
    case "photography":
      return {
        kind: "photography",
        shot_list: [],
        must_capture: [],
        family_portraits: [],
        coverage_hours: [],
        deliverable_timeline: [],
      };
    case "florals":
      return {
        kind: "florals",
        design_direction: "",
        mood_board: [],
        coverage: [],
        color_palette: [],
        arrangements: [],
        delivery_setup: [],
      };
    default:
      return { kind: "generic", notes: "", scope_items: [] };
  }
}

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useVendorWorkspaceStore = create<VendorWorkspaceState>()(
  persist(
    (set, get) => ({
      workspaces: SEED_VENDOR_WORKSPACES,

      getByVendorId: (vendorId) =>
        get().workspaces.find((w) => w.vendor_id === vendorId),

      createWorkspace: ({ vendor_id, wedding_id, discipline }) => {
        const existing = get().workspaces.find((w) => w.vendor_id === vendor_id);
        if (existing) return existing;

        const now = new Date().toISOString();
        const id = uid("ws");
        const ws: VendorWorkspace = {
          id,
          vendor_id,
          wedding_id: wedding_id ?? SEED_WEDDING_ID,
          discipline,
          created_at: now,
          updated_at: now,
          last_vendor_activity_at: null,
          invite_status: "not_invited",
          content: defaultContentFor(discipline),
          permissions: { ...DEFAULT_PERMISSIONS },
          invitation: null,
          activity: [
            {
              id: uid("act"),
              workspace_id: id,
              at: now,
              actor: "couple",
              kind: "updated",
              summary: "Workspace created",
            },
          ],
        };
        set((state) => ({ workspaces: [...state.workspaces, ws] }));
        return ws;
      },

      updateContent: (id, patch) =>
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === id
              ? {
                  ...w,
                  content: patch,
                  updated_at: new Date().toISOString(),
                }
              : w,
          ),
        })),

      updatePermissions: (id, patch) =>
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === id
              ? {
                  ...w,
                  permissions: { ...w.permissions, ...patch },
                  updated_at: new Date().toISOString(),
                }
              : w,
          ),
        })),

      setDiscipline: (id, discipline) =>
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === id
              ? {
                  ...w,
                  discipline,
                  content: defaultContentFor(discipline),
                  updated_at: new Date().toISOString(),
                }
              : w,
          ),
        })),

      sendInvitation: (id, payload) =>
        set((state) => {
          const now = new Date().toISOString();
          return {
            workspaces: state.workspaces.map((w) => {
              if (w.id !== id) return w;
              const invitation: VendorWorkspaceInvitation = {
                id: w.invitation?.id ?? uid("inv"),
                workspace_id: w.id,
                invited_email: payload.invited_email,
                personal_note: payload.personal_note,
                sent_at: now,
                claimed_at: null,
                revoked_at: null,
                status: "invited",
              };
              const status: WorkspaceInviteStatus = "invited";
              return {
                ...w,
                invite_status: status,
                invitation,
                updated_at: now,
                activity: [
                  {
                    id: uid("act"),
                    workspace_id: w.id,
                    at: now,
                    actor: "couple",
                    kind: "updated",
                    summary: "Sent workspace invitation",
                  },
                  ...w.activity,
                ],
              };
            }),
          };
        }),

      resendInvitation: (id) =>
        set((state) => {
          const now = new Date().toISOString();
          return {
            workspaces: state.workspaces.map((w) => {
              if (w.id !== id || !w.invitation) return w;
              return {
                ...w,
                invitation: { ...w.invitation, sent_at: now },
                updated_at: now,
                activity: [
                  {
                    id: uid("act"),
                    workspace_id: w.id,
                    at: now,
                    actor: "couple",
                    kind: "updated",
                    summary: "Resent workspace invitation",
                  },
                  ...w.activity,
                ],
              };
            }),
          };
        }),

      revokeInvitation: (id) =>
        set((state) => {
          const now = new Date().toISOString();
          return {
            workspaces: state.workspaces.map((w) => {
              if (w.id !== id) return w;
              return {
                ...w,
                invite_status: "revoked",
                invitation: w.invitation
                  ? { ...w.invitation, revoked_at: now, status: "revoked" }
                  : null,
                updated_at: now,
                activity: [
                  {
                    id: uid("act"),
                    workspace_id: w.id,
                    at: now,
                    actor: "couple",
                    kind: "updated",
                    summary: "Revoked vendor access",
                  },
                  ...w.activity,
                ],
              };
            }),
          };
        }),

      markClaimed: (id) =>
        set((state) => {
          const now = new Date().toISOString();
          return {
            workspaces: state.workspaces.map((w) => {
              if (w.id !== id) return w;
              return {
                ...w,
                invite_status: "active",
                invitation: w.invitation
                  ? { ...w.invitation, claimed_at: now, status: "active" }
                  : null,
                last_vendor_activity_at: now,
                updated_at: now,
                activity: [
                  {
                    id: uid("act"),
                    workspace_id: w.id,
                    at: now,
                    actor: "vendor",
                    kind: "logged_in",
                    summary: "Claimed workspace invitation",
                  },
                  ...w.activity,
                ],
              };
            }),
          };
        }),

      logActivity: (id, entry) =>
        set((state) => {
          const now = entry.at ?? new Date().toISOString();
          return {
            workspaces: state.workspaces.map((w) => {
              if (w.id !== id) return w;
              return {
                ...w,
                last_vendor_activity_at:
                  entry.actor === "vendor" ? now : w.last_vendor_activity_at,
                activity: [
                  {
                    id: uid("act"),
                    workspace_id: w.id,
                    at: now,
                    actor: entry.actor,
                    kind: entry.kind,
                    summary: entry.summary,
                    detail: entry.detail,
                  },
                  ...w.activity,
                ],
              };
            }),
          };
        }),
    }),
    {
      name: "ananya:vendor-workspaces",
      version: 1,
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return window.localStorage;
      }),
      partialize: (state) => ({ workspaces: state.workspaces }),
    },
  ),
);

let _vendorWsSyncTimer: ReturnType<typeof setTimeout> | null = null;
useVendorWorkspaceStore.subscribe((state) => {
  if (_vendorWsSyncTimer) clearTimeout(_vendorWsSyncTimer);
  _vendorWsSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("vendor_workspaces", { couple_id: coupleId, workspaces: state.workspaces });
  }, 600);
});

export type { ActivityKind };
