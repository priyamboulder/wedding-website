"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  ApplicationAdminLog,
  ApplicationStatus,
  CreatorApplication,
  RejectionReasonCategory,
} from "@/types/creator-application";
import {
  SEED_APPLICATIONS,
  SEED_APPLICATION_LOGS,
} from "@/lib/creators/applications-seed";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";

// ── Creator applications store ────────────────────────────────────────────
// Gating layer — anyone who wants to use the existing creator tools must
// submit an application here and be approved. Approval auto-creates the
// creator profile via linkedCreatorId. Everything persists to localStorage
// under "ananya-creator-applications".

const REAPPLY_COOLDOWN_DAYS = 90;

const genId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `app_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const nowIso = () => new Date().toISOString();
const addDaysIso = (days: number) =>
  new Date(Date.now() + days * 86_400_000).toISOString();

export type SubmitApplicationInput = Omit<
  CreatorApplication,
  | "id"
  | "status"
  | "rejectionReasonCategory"
  | "rejectionReasonText"
  | "waitlistNote"
  | "moreInfoRequest"
  | "moreInfoResponse"
  | "adminInternalNotes"
  | "reviewedBy"
  | "reviewedAt"
  | "reapplyEligibleAt"
  | "linkedCreatorId"
  | "createdAt"
  | "updatedAt"
>;

interface CreatorApplicationsState {
  applications: CreatorApplication[];
  logs: ApplicationAdminLog[];

  // Reads
  list: () => CreatorApplication[];
  getById: (id: string) => CreatorApplication | undefined;
  getByUserId: (userId: string) => CreatorApplication | undefined;
  getByEmail: (email: string) => CreatorApplication | undefined;
  getLogsFor: (applicationId: string) => ApplicationAdminLog[];

  pendingCount: () => number;
  countsByStatus: () => Record<ApplicationStatus, number>;

  // Applicant actions
  submit: (input: SubmitApplicationInput) => CreatorApplication;
  respondToInfoRequest: (applicationId: string, response: string) => void;

  // Admin actions
  approve: (args: {
    applicationId: string;
    adminUserId: string;
    linkedCreatorId?: string;
  }) => CreatorApplication | undefined;
  reject: (args: {
    applicationId: string;
    adminUserId: string;
    reasonCategory: RejectionReasonCategory;
    reasonText: string;
  }) => CreatorApplication | undefined;
  waitlist: (args: {
    applicationId: string;
    adminUserId: string;
    note: string;
  }) => CreatorApplication | undefined;
  requestInfo: (args: {
    applicationId: string;
    adminUserId: string;
    request: string;
  }) => CreatorApplication | undefined;
  addInternalNote: (args: {
    applicationId: string;
    adminUserId: string;
    note: string;
  }) => void;
}

type PersistedSlice = Pick<CreatorApplicationsState, "applications" | "logs">;

const storage = createJSONStorage(() => {
  if (typeof window === "undefined") {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
  return window.localStorage;
});

export const useCreatorApplicationsStore = create<CreatorApplicationsState>()(
  persist(
    (set, get) => ({
      applications: SEED_APPLICATIONS,
      logs: SEED_APPLICATION_LOGS,

      list: () =>
        [...get().applications].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      getById: (id) => get().applications.find((a) => a.id === id),
      getByUserId: (userId) =>
        get().applications.find((a) => a.userId === userId),
      getByEmail: (email) => {
        const normalized = email.trim().toLowerCase();
        return get().applications.find(
          (a) => a.email.trim().toLowerCase() === normalized,
        );
      },
      getLogsFor: (applicationId) =>
        get()
          .logs.filter((l) => l.applicationId === applicationId)
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() -
              new Date(b.createdAt).getTime(),
          ),

      pendingCount: () =>
        get().applications.filter(
          (a) =>
            a.status === "pending" ||
            a.status === "under_review" ||
            a.status === "more_info_requested",
        ).length,
      countsByStatus: () => {
        const base: Record<ApplicationStatus, number> = {
          pending: 0,
          under_review: 0,
          approved: 0,
          rejected: 0,
          waitlisted: 0,
          more_info_requested: 0,
        };
        for (const a of get().applications) base[a.status]++;
        return base;
      },

      submit: (input) => {
        const now = nowIso();
        const application: CreatorApplication = {
          ...input,
          id: genId(),
          status: "pending",
          rejectionReasonCategory: null,
          rejectionReasonText: null,
          waitlistNote: null,
          moreInfoRequest: null,
          moreInfoResponse: null,
          adminInternalNotes: null,
          reviewedBy: null,
          reviewedAt: null,
          reapplyEligibleAt: null,
          linkedCreatorId: null,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ applications: [application, ...s.applications] }));
        return application;
      },

      respondToInfoRequest: (applicationId, response) => {
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === applicationId
              ? {
                  ...a,
                  moreInfoResponse: response,
                  status: "under_review",
                  updatedAt: nowIso(),
                }
              : a,
          ),
        }));
      },

      approve: ({ applicationId, adminUserId, linkedCreatorId }) => {
        const existing = get().applications.find(
          (a) => a.id === applicationId,
        );
        if (!existing) return undefined;
        const creatorId = linkedCreatorId ?? `cr-${existing.id}`;
        const now = nowIso();
        const updated: CreatorApplication = {
          ...existing,
          status: "approved",
          reviewedBy: adminUserId,
          reviewedAt: now,
          linkedCreatorId: creatorId,
          updatedAt: now,
          reapplyEligibleAt: null,
          rejectionReasonCategory: null,
          rejectionReasonText: null,
        };
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === applicationId ? updated : a,
          ),
          logs: [
            ...s.logs,
            {
              id: genId(),
              applicationId,
              adminUserId,
              action: "status_change",
              oldStatus: existing.status,
              newStatus: "approved",
              note: null,
              createdAt: now,
            },
          ],
        }));
        return updated;
      },

      reject: ({ applicationId, adminUserId, reasonCategory, reasonText }) => {
        const existing = get().applications.find(
          (a) => a.id === applicationId,
        );
        if (!existing) return undefined;
        const now = nowIso();
        const updated: CreatorApplication = {
          ...existing,
          status: "rejected",
          rejectionReasonCategory: reasonCategory,
          rejectionReasonText: reasonText,
          reviewedBy: adminUserId,
          reviewedAt: now,
          reapplyEligibleAt: addDaysIso(REAPPLY_COOLDOWN_DAYS),
          updatedAt: now,
        };
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === applicationId ? updated : a,
          ),
          logs: [
            ...s.logs,
            {
              id: genId(),
              applicationId,
              adminUserId,
              action: "status_change",
              oldStatus: existing.status,
              newStatus: "rejected",
              note: reasonText,
              createdAt: now,
            },
          ],
        }));
        return updated;
      },

      waitlist: ({ applicationId, adminUserId, note }) => {
        const existing = get().applications.find(
          (a) => a.id === applicationId,
        );
        if (!existing) return undefined;
        const now = nowIso();
        const updated: CreatorApplication = {
          ...existing,
          status: "waitlisted",
          waitlistNote: note,
          reviewedBy: adminUserId,
          reviewedAt: now,
          updatedAt: now,
        };
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === applicationId ? updated : a,
          ),
          logs: [
            ...s.logs,
            {
              id: genId(),
              applicationId,
              adminUserId,
              action: "status_change",
              oldStatus: existing.status,
              newStatus: "waitlisted",
              note,
              createdAt: now,
            },
          ],
        }));
        return updated;
      },

      requestInfo: ({ applicationId, adminUserId, request }) => {
        const existing = get().applications.find(
          (a) => a.id === applicationId,
        );
        if (!existing) return undefined;
        const now = nowIso();
        const updated: CreatorApplication = {
          ...existing,
          status: "more_info_requested",
          moreInfoRequest: request,
          moreInfoResponse: null,
          updatedAt: now,
        };
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === applicationId ? updated : a,
          ),
          logs: [
            ...s.logs,
            {
              id: genId(),
              applicationId,
              adminUserId,
              action: "info_requested",
              oldStatus: existing.status,
              newStatus: "more_info_requested",
              note: request,
              createdAt: now,
            },
          ],
        }));
        return updated;
      },

      addInternalNote: ({ applicationId, adminUserId, note }) => {
        const now = nowIso();
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === applicationId
              ? {
                  ...a,
                  adminInternalNotes: a.adminInternalNotes
                    ? `${a.adminInternalNotes}\n\n— ${now}\n${note}`
                    : note,
                  updatedAt: now,
                }
              : a,
          ),
          logs: [
            ...s.logs,
            {
              id: genId(),
              applicationId,
              adminUserId,
              action: "note_added",
              oldStatus: null,
              newStatus: null,
              note,
              createdAt: now,
            },
          ],
        }));
      },
    }),
    {
      name: "ananya-creator-applications",
      storage,
      version: 1,
      partialize: (state): PersistedSlice => ({
        applications: state.applications,
        logs: state.logs,
      }),
    },
  ),
);

let _creatorApplicationsSyncTimer: ReturnType<typeof setTimeout> | null = null;
useCreatorApplicationsStore.subscribe((state) => {
  if (_creatorApplicationsSyncTimer) clearTimeout(_creatorApplicationsSyncTimer);
  _creatorApplicationsSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("creator_applications_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});

// ── Application status helpers — selector-friendly for guards ──────────────

export function isApplicationApproved(app?: CreatorApplication | null) {
  return app?.status === "approved";
}

export function canReapply(app?: CreatorApplication | null) {
  if (!app) return true;
  if (app.status !== "rejected") return false;
  if (!app.reapplyEligibleAt) return true;
  return Date.now() >= new Date(app.reapplyEligibleAt).getTime();
}

export function daysUntilReapply(app?: CreatorApplication | null) {
  if (!app || !app.reapplyEligibleAt) return 0;
  const diff = new Date(app.reapplyEligibleAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}
