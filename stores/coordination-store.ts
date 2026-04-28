// â”€â”€ Coordination store â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Vendor Coordination Hub â€” roster, assignments, updates, and shared files.
// Single global Zustand store persisted to localStorage. The Hub lives under
// /vendors?tab=coordination; the vendor-facing portal at /coordination/[token]
// reads the same state through getters keyed off `portalToken`.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  CoordinationAssignment,
  CoordinationFile,
  CoordinationRole,
  CoordinationUpdate,
  CoordinationUpdateAttachment,
  CoordinationVendor,
  OverallStatus,
  UpdatePriority,
  UpdateTargetType,
  VendorRosterStats,
} from "@/types/coordination";

// â”€â”€ Token generation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 32-char random hex; treat like a signed link. Anyone with the URL can read
// the vendor's portal (v1 has no auth â€” the spec explicitly allows this).

function generatePortalToken(): string {
  // Prefer the Web Crypto API when available; fall back to Math.random so
  // the store still works in SSR / tests where `crypto` isn't wired up.
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const buf = new Uint8Array(16);
    crypto.getRandomValues(buf);
    return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  let out = "";
  for (let i = 0; i < 32; i++) {
    out += Math.floor(Math.random() * 16).toString(16);
  }
  return out;
}

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

// â”€â”€ Store shape â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface NewVendorInput {
  name: string;
  contactName?: string;
  role: CoordinationRole;
  roleLabel?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  platformVendorId?: string;
  events?: string[];
  internalNotes?: string;
}

export interface NewAssignmentInput {
  vendorId: string;
  eventName: string;
  eventDate: string;
  callTime?: string | null;
  setupStart?: string | null;
  setupEnd?: string | null;
  serviceStart?: string | null;
  serviceEnd?: string | null;
  breakdownStart?: string | null;
  venueName?: string | null;
  venueAddress?: string | null;
  specificLocation?: string | null;
  parkingInstructions?: string | null;
  loadInInstructions?: string | null;
  description?: string | null;
  specialInstructions?: string | null;
  guestCount?: number | null;
  scheduleItemIds?: string[];
}

export interface NewUpdateInput {
  senderName?: string;
  subject: string;
  body: string;
  priority?: UpdatePriority;
  targetType: UpdateTargetType;
  targetVendorIds?: string[];
  targetEvent?: string | null;
  targetRole?: CoordinationRole | null;
  attachments?: CoordinationUpdateAttachment[];
}

interface CoordinationState {
  vendors: CoordinationVendor[];
  assignments: CoordinationAssignment[];
  updates: CoordinationUpdate[];
  files: CoordinationFile[];

  // â”€â”€ Vendors â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  addVendor: (input: NewVendorInput) => CoordinationVendor;
  updateVendor: (id: string, patch: Partial<CoordinationVendor>) => void;
  removeVendor: (id: string) => void;
  getVendorByToken: (token: string) => CoordinationVendor | undefined;
  markPortalViewed: (token: string) => void;

  // â”€â”€ Assignments â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  addAssignment: (input: NewAssignmentInput) => CoordinationAssignment;
  updateAssignment: (
    id: string,
    patch: Partial<CoordinationAssignment>,
  ) => void;
  removeAssignment: (id: string) => void;
  assignmentsForVendor: (vendorId: string) => CoordinationAssignment[];
  confirmAssignment: (id: string, vendorNotes?: string | null) => void;
  unconfirmAssignment: (id: string) => void;
  askQuestion: (id: string, question: string) => void;
  replyToQuestion: (id: string, reply: string) => void;
  checkInAssignment: (id: string) => void;

  // â”€â”€ Updates â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  sendUpdate: (input: NewUpdateInput) => CoordinationUpdate;
  markUpdateRead: (updateId: string, vendorId: string) => void;
  updatesForVendor: (vendorId: string) => CoordinationUpdate[];
  removeUpdate: (id: string) => void;

  // â”€â”€ Files â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  addFile: (
    input: Omit<CoordinationFile, "id" | "uploadedAt">,
  ) => CoordinationFile;
  removeFile: (id: string) => void;
  filesForVendor: (vendorId: string) => CoordinationFile[];

  // â”€â”€ Schedule import â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  hasImportedFromSchedule: boolean;
  setHasImportedFromSchedule: (value: boolean) => void;

  // â”€â”€ Derived â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  rosterStats: () => VendorRosterStats;
  recomputeVendorStatus: (vendorId: string) => void;
}

function computeStatus(
  vendor: CoordinationVendor,
  assignments: CoordinationAssignment[],
): OverallStatus {
  const mine = assignments.filter((a) => a.vendorId === vendor.id);
  const hasQuestion = mine.some((a) => a.vendorHasQuestions && !a.plannerReply);
  if (hasQuestion) return "has_questions";
  if (mine.length > 0 && mine.every((a) => a.vendorConfirmed)) {
    return "confirmed";
  }
  if (vendor.portalLastViewedAt) return "viewed";
  return "pending";
}

export const useCoordinationStore = create<CoordinationState>()(
  persist(
    (set, get) => ({
      vendors: [],
      assignments: [],
      updates: [],
      files: [],
      hasImportedFromSchedule: false,

      // â”€â”€ Vendors â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      addVendor: (input) => {
        const now = nowIso();
        const vendor: CoordinationVendor = {
          id: uid("cvnd"),
          name: input.name.trim(),
          contactName: input.contactName?.trim() || null,
          role: input.role,
          roleLabel: input.roleLabel?.trim() || null,
          phone: input.phone?.trim() || null,
          email: input.email?.trim() || null,
          whatsapp: input.whatsapp?.trim() || null,
          platformVendorId: input.platformVendorId ?? null,
          portalToken: generatePortalToken(),
          events: input.events ?? [],
          portalLastViewedAt: null,
          overallStatus: "pending",
          internalNotes: input.internalNotes?.trim() || null,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ vendors: [...s.vendors, vendor] }));
        return vendor;
      },
      updateVendor: (id, patch) =>
        set((s) => ({
          vendors: s.vendors.map((v) =>
            v.id === id ? { ...v, ...patch, updatedAt: nowIso() } : v,
          ),
        })),
      removeVendor: (id) =>
        set((s) => ({
          vendors: s.vendors.filter((v) => v.id !== id),
          assignments: s.assignments.filter((a) => a.vendorId !== id),
          files: s.files
            .map((f) => ({
              ...f,
              visibleToVendorIds: f.visibleToVendorIds.filter(
                (vid) => vid !== id,
              ),
            }))
            .filter((f) => f.visibleToAll || f.visibleToVendorIds.length > 0),
        })),
      getVendorByToken: (token) =>
        get().vendors.find((v) => v.portalToken === token),
      markPortalViewed: (token) =>
        set((s) => {
          const vendor = s.vendors.find((v) => v.portalToken === token);
          if (!vendor) return s;
          const updated: CoordinationVendor = {
            ...vendor,
            portalLastViewedAt: nowIso(),
            overallStatus:
              vendor.overallStatus === "pending" ? "viewed" : vendor.overallStatus,
            updatedAt: nowIso(),
          };
          return {
            vendors: s.vendors.map((v) => (v.id === vendor.id ? updated : v)),
          };
        }),

      // â”€â”€ Assignments â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      addAssignment: (input) => {
        const now = nowIso();
        const assignment: CoordinationAssignment = {
          id: uid("cas"),
          vendorId: input.vendorId,
          eventName: input.eventName,
          eventDate: input.eventDate,
          callTime: input.callTime ?? null,
          setupStart: input.setupStart ?? null,
          setupEnd: input.setupEnd ?? null,
          serviceStart: input.serviceStart ?? null,
          serviceEnd: input.serviceEnd ?? null,
          breakdownStart: input.breakdownStart ?? null,
          venueName: input.venueName ?? null,
          venueAddress: input.venueAddress ?? null,
          specificLocation: input.specificLocation ?? null,
          parkingInstructions: input.parkingInstructions ?? null,
          loadInInstructions: input.loadInInstructions ?? null,
          description: input.description ?? null,
          specialInstructions: input.specialInstructions ?? null,
          guestCount: input.guestCount ?? null,
          scheduleItemIds: input.scheduleItemIds ?? [],
          vendorConfirmed: false,
          vendorConfirmedAt: null,
          vendorNotes: null,
          vendorHasQuestions: false,
          vendorQuestion: null,
          plannerReply: null,
          plannerRepliedAt: null,
          vendorCheckedInAt: null,
          sortOrder: get().assignments.filter((a) => a.vendorId === input.vendorId)
            .length,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ assignments: [...s.assignments, assignment] }));
        get().recomputeVendorStatus(input.vendorId);
        return assignment;
      },
      updateAssignment: (id, patch) => {
        set((s) => ({
          assignments: s.assignments.map((a) =>
            a.id === id ? { ...a, ...patch, updatedAt: nowIso() } : a,
          ),
        }));
        const assignment = get().assignments.find((a) => a.id === id);
        if (assignment) get().recomputeVendorStatus(assignment.vendorId);
      },
      removeAssignment: (id) => {
        const assignment = get().assignments.find((a) => a.id === id);
        set((s) => ({ assignments: s.assignments.filter((a) => a.id !== id) }));
        if (assignment) get().recomputeVendorStatus(assignment.vendorId);
      },
      assignmentsForVendor: (vendorId) =>
        get()
          .assignments.filter((a) => a.vendorId === vendorId)
          .sort((a, b) => {
            if (a.eventDate !== b.eventDate) {
              return a.eventDate.localeCompare(b.eventDate);
            }
            return (a.callTime ?? "").localeCompare(b.callTime ?? "");
          }),
      confirmAssignment: (id, vendorNotes) => {
        set((s) => ({
          assignments: s.assignments.map((a) =>
            a.id === id
              ? {
                  ...a,
                  vendorConfirmed: true,
                  vendorConfirmedAt: nowIso(),
                  vendorNotes: vendorNotes ?? a.vendorNotes,
                  updatedAt: nowIso(),
                }
              : a,
          ),
        }));
        const assignment = get().assignments.find((a) => a.id === id);
        if (assignment) get().recomputeVendorStatus(assignment.vendorId);
      },
      unconfirmAssignment: (id) => {
        set((s) => ({
          assignments: s.assignments.map((a) =>
            a.id === id
              ? {
                  ...a,
                  vendorConfirmed: false,
                  vendorConfirmedAt: null,
                  updatedAt: nowIso(),
                }
              : a,
          ),
        }));
        const assignment = get().assignments.find((a) => a.id === id);
        if (assignment) get().recomputeVendorStatus(assignment.vendorId);
      },
      askQuestion: (id, question) => {
        set((s) => ({
          assignments: s.assignments.map((a) =>
            a.id === id
              ? {
                  ...a,
                  vendorHasQuestions: true,
                  vendorQuestion: question,
                  plannerReply: null,
                  plannerRepliedAt: null,
                  updatedAt: nowIso(),
                }
              : a,
          ),
        }));
        const assignment = get().assignments.find((a) => a.id === id);
        if (assignment) get().recomputeVendorStatus(assignment.vendorId);
      },
      replyToQuestion: (id, reply) => {
        set((s) => ({
          assignments: s.assignments.map((a) =>
            a.id === id
              ? {
                  ...a,
                  plannerReply: reply,
                  plannerRepliedAt: nowIso(),
                  vendorHasQuestions: false,
                  updatedAt: nowIso(),
                }
              : a,
          ),
        }));
        const assignment = get().assignments.find((a) => a.id === id);
        if (assignment) get().recomputeVendorStatus(assignment.vendorId);
      },
      checkInAssignment: (id) => {
        set((s) => ({
          assignments: s.assignments.map((a) =>
            a.id === id
              ? { ...a, vendorCheckedInAt: nowIso(), updatedAt: nowIso() }
              : a,
          ),
        }));
      },

      // â”€â”€ Updates â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      sendUpdate: (input) => {
        const update: CoordinationUpdate = {
          id: uid("cup"),
          senderName: input.senderName ?? "Wedding Team",
          subject: input.subject.trim(),
          body: input.body.trim(),
          priority: input.priority ?? "normal",
          targetType: input.targetType,
          targetVendorIds: input.targetVendorIds ?? [],
          targetEvent: input.targetEvent ?? null,
          targetRole: input.targetRole ?? null,
          readBy: [],
          attachments: input.attachments ?? [],
          createdAt: nowIso(),
        };
        set((s) => ({ updates: [update, ...s.updates] }));
        return update;
      },
      markUpdateRead: (updateId, vendorId) =>
        set((s) => ({
          updates: s.updates.map((u) =>
            u.id === updateId && !u.readBy.some((r) => r.vendorId === vendorId)
              ? { ...u, readBy: [...u.readBy, { vendorId, readAt: nowIso() }] }
              : u,
          ),
        })),
      updatesForVendor: (vendorId) => {
        const { updates, vendors } = get();
        const vendor = vendors.find((v) => v.id === vendorId);
        if (!vendor) return [];
        return updates.filter((u) => {
          if (u.targetType === "all") return true;
          if (u.targetType === "specific") {
            return u.targetVendorIds.includes(vendorId);
          }
          if (u.targetType === "event") {
            return u.targetEvent !== null && vendor.events.includes(u.targetEvent);
          }
          if (u.targetType === "role") {
            return u.targetRole === vendor.role;
          }
          return false;
        });
      },
      removeUpdate: (id) =>
        set((s) => ({ updates: s.updates.filter((u) => u.id !== id) })),

      // â”€â”€ Files â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      addFile: (input) => {
        const file: CoordinationFile = {
          id: uid("cfile"),
          name: input.name,
          fileUrl: input.fileUrl,
          fileType: input.fileType,
          description: input.description,
          visibleToAll: input.visibleToAll,
          visibleToVendorIds: input.visibleToVendorIds,
          uploadedAt: nowIso(),
        };
        set((s) => ({ files: [file, ...s.files] }));
        return file;
      },
      removeFile: (id) =>
        set((s) => ({ files: s.files.filter((f) => f.id !== id) })),
      filesForVendor: (vendorId) =>
        get().files.filter(
          (f) => f.visibleToAll || f.visibleToVendorIds.includes(vendorId),
        ),

      // â”€â”€ Schedule import flag â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      setHasImportedFromSchedule: (value) =>
        set({ hasImportedFromSchedule: value }),

      // â”€â”€ Derived â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      rosterStats: () => {
        const vendors = get().vendors;
        const stats: VendorRosterStats = {
          total: vendors.length,
          confirmed: 0,
          viewed: 0,
          pending: 0,
          hasQuestions: 0,
        };
        for (const v of vendors) {
          if (v.overallStatus === "confirmed") stats.confirmed++;
          else if (v.overallStatus === "viewed") stats.viewed++;
          else if (v.overallStatus === "has_questions") stats.hasQuestions++;
          else stats.pending++;
        }
        return stats;
      },
      recomputeVendorStatus: (vendorId) =>
        set((s) => {
          const vendor = s.vendors.find((v) => v.id === vendorId);
          if (!vendor) return s;
          const next = computeStatus(vendor, s.assignments);
          if (next === vendor.overallStatus) return s;
          return {
            vendors: s.vendors.map((v) =>
              v.id === vendorId
                ? { ...v, overallStatus: next, updatedAt: nowIso() }
                : v,
            ),
          };
        }),
    }),
    {
      name: "ananya:coordination",
      version: 1,
      storage: createJSONStorage(() => { if (typeof window === "undefined") { return { getItem: () => null, setItem: () => undefined, removeItem: () => undefined }; } return window.localStorage; }),
      partialize: (state) => ({
        vendors: state.vendors,
        assignments: state.assignments,
        updates: state.updates,
        files: state.files,
        hasImportedFromSchedule: state.hasImportedFromSchedule,
      }),
    },
  ),
);

let _coordinationSyncTimer: ReturnType<typeof setTimeout> | null = null;
useCoordinationStore.subscribe((state) => {
  if (_coordinationSyncTimer) clearTimeout(_coordinationSyncTimer);
  _coordinationSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("coordination_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});

// â”€â”€ Pre-formatted WhatsApp message helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function buildPortalMessage(
  vendor: CoordinationVendor,
  coupleNames: string,
  portalUrl: string,
): string {
  const greeting = vendor.contactName ? `Hi ${vendor.contactName}!` : "Hi!";
  return `${greeting} Here's your coordination portal for ${coupleNames}'s wedding. Your schedule, venue details, and any updates will be here: ${portalUrl} â€” please review and confirm when you get a chance. Thank you! ðŸ™`;
}
