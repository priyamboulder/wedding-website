import { create } from "zustand";
import { dbUpsert, dbDelete, dbLoadAll, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  Phase,
  ChecklistItem,
  ItemStatus,
  Priority,
  AssignedTo,
  DecisionField,
  Member,
  MemberRole,
  WorkspaceCategoryTag,
  WorkspaceTabTag,
} from "@/types/checklist";
import {
  PHASES,
  CHECKLIST_ITEMS,
  getOriginalTemplate,
  buildCustomItemId,
} from "@/lib/checklist-seed";
import { SEED_MEMBERS } from "@/components/collaboration/seed";
import { colorForName } from "@/components/collaboration/palette";
import {
  filterItemsForCategory,
  computeCategoryProgress,
  getUpcomingForCategory,
  type CategoryFilterOpts,
  type CategoryProgress,
  type UpcomingOpts,
  type UpcomingTask,
} from "@/lib/workspace/category-queries";
import { computeDeadline } from "@/lib/deadlines";

export interface NewCustomItemInput {
  phase_id: string;
  subsection: string;
  title: string;
  description?: string;
  priority?: Priority;
  assigned_to?: AssignedTo;
  due_date?: string | null;
  assignee_ids?: string[];
  visible_to_ids?: string[];
  dependencies?: string[];
  attachments?: string[];
  notes?: string;
  created_by?: string;
  category_tags?: WorkspaceCategoryTag[];
  workspace_tab_tags?: WorkspaceTabTag[];
}

interface ChecklistState {
  phases: Phase[];
  items: ChecklistItem[];
  members: Member[];
  weddingDate: Date | null;

  getPhases: () => Phase[];
  getItemsByPhase: (phaseId: string) => ChecklistItem[];
  getItemById: (id: string) => ChecklistItem | undefined;
  addItem: (item: ChecklistItem) => void;
  addCustomItem: (input: NewCustomItemInput) => ChecklistItem;
  deleteItem: (id: string) => void;
  resetTemplateItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<ChecklistItem>) => void;
  toggleItemStatus: (id: string) => void;
  setItemStatus: (id: string, status: ItemStatus) => void;
  snoozeItem: (id: string, days: number) => void;
  updateDecisionField: (
    itemId: string,
    fieldId: string,
    value: DecisionField["value"],
  ) => void;
  setWeddingDate: (date: Date | null) => void;

  // Workspace integration — thin wrappers over lib/workspace/category-queries.
  getItemsForCategory: (
    category: WorkspaceCategoryTag,
    opts?: CategoryFilterOpts,
  ) => ChecklistItem[];
  getUpcomingForCategory: (
    category: WorkspaceCategoryTag,
    opts?: UpcomingOpts,
  ) => UpcomingTask[];
  getCategoryProgress: (
    category: WorkspaceCategoryTag,
    now?: Date,
  ) => CategoryProgress;

  // Collaboration
  inviteMembers: (emails: string[], role: MemberRole) => void;
  updateMemberRole: (id: string, role: MemberRole) => void;
  removeMember: (id: string) => void;
  resendInvite: (id: string) => void;
  toggleAssignee: (itemId: string, memberId: string) => void;

  // DB sync
  loadFromDB: () => Promise<void>;
}

const STATUS_CYCLE: ItemStatus[] = [
  "not_started",
  "in_progress",
  "done",
  "blocked",
  "not_applicable",
];

function deriveNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export const useChecklistStore = create<ChecklistState>((set, get) => ({
  phases: PHASES,
  items: CHECKLIST_ITEMS,
  members: SEED_MEMBERS,
  weddingDate: new Date(2026, 11, 12),

  setWeddingDate: (date) => set({ weddingDate: date }),

  getPhases: () => get().phases,

  getItemsByPhase: (phaseId) =>
    get().items.filter((item) => item.phase_id === phaseId),

  getItemById: (id) => get().items.find((item) => item.id === id),

  addItem: (item) =>
    set((state) => ({ items: [...state.items, item] })),

  addCustomItem: (input) => {
    const now = new Date().toISOString();
    const item: ChecklistItem = {
      id: buildCustomItemId(input.phase_id, input.subsection),
      phase_id: input.phase_id,
      title: input.title.trim(),
      description: input.description?.trim() ?? "",
      status: "not_started",
      priority: input.priority ?? "medium",
      due_date: input.due_date ?? null,
      assigned_to: input.assigned_to ?? "both",
      module_link: null,
      decision_template: "generic",
      decision_fields: [],
      dependencies: input.dependencies ?? [],
      tradition_profile_tags: ["all"],
      notes: input.notes ?? "",
      source: "custom",
      created_at: now,
      updated_at: now,
      ...(input.assignee_ids?.length && { assignee_ids: input.assignee_ids }),
      ...(input.visible_to_ids && { visible_to_ids: input.visible_to_ids }),
      ...(input.attachments?.length && { attachments: input.attachments }),
      ...(input.created_by && { created_by: input.created_by }),
      ...(input.category_tags?.length && { category_tags: input.category_tags }),
      ...(input.workspace_tab_tags?.length && {
        workspace_tab_tags: input.workspace_tab_tags,
      }),
    };
    set((state) => ({ items: [...state.items, item] }));
    const coupleId = getCurrentCoupleId();
    if (coupleId) dbUpsert("checklist_items", { ...item, couple_id: coupleId, decision_fields: item.decision_fields ?? [] });
    return item;
  },

  deleteItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
    const coupleId = getCurrentCoupleId();
    if (coupleId) dbDelete("checklist_items", { id, couple_id: coupleId });
  },

  resetTemplateItem: (id) => {
    const original = getOriginalTemplate(id);
    if (!original) return;
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? {
              ...original,
              // Preserve collaboration state users have accumulated around
              // the template (who they assigned, status progress, notes).
              status: item.status,
              assignee_ids: item.assignee_ids,
              template_modified: false,
              updated_at: new Date().toISOString(),
            }
          : item,
      ),
    }));
  },

  updateItem: (id, updates) => {
    set((state) => ({
      items: state.items.map((item) => {
        if (item.id !== id) return item;
        const trackModified =
          item.source === "template" &&
          ("title" in updates ||
            "description" in updates ||
            "priority" in updates ||
            "due_date" in updates ||
            "notes" in updates);
        return {
          ...item,
          ...updates,
          ...(trackModified && { template_modified: true }),
          updated_at: new Date().toISOString(),
        };
      }),
    }));
    const coupleId = getCurrentCoupleId();
    if (coupleId) dbUpsert("checklist_items", { id, couple_id: coupleId, ...updates, updated_at: new Date().toISOString() });
  },

  toggleItemStatus: (id) => {
    const item = get().items.find((i) => i.id === id);
    if (!item) return;
    const currentIndex = STATUS_CYCLE.indexOf(item.status);
    const nextStatus = STATUS_CYCLE[(currentIndex + 1) % STATUS_CYCLE.length];
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, status: nextStatus, updated_at: new Date().toISOString() } : i,
      ),
    }));
    const coupleId = getCurrentCoupleId();
    if (coupleId) dbUpsert("checklist_items", { id, couple_id: coupleId, status: nextStatus, updated_at: new Date().toISOString() });
  },

  // Direct-set variant used by the workspace checkbox (optimistic complete/uncomplete).
  setItemStatus: (id, status) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? { ...item, status, updated_at: new Date().toISOString() }
          : item,
      ),
    }));
    const coupleId = getCurrentCoupleId();
    if (coupleId) dbUpsert("checklist_items", { id, couple_id: coupleId, status, updated_at: new Date().toISOString() });
  },

  // Snooze by N days. If there's a manual due_date already, shift it; otherwise
  // derive from computed deadline and set as an override. Preserves provenance
  // of prior snoozes/overrides since every snooze is a due_date write.
  snoozeItem: (id, days) =>
    set((state) => {
      const item = state.items.find((it) => it.id === id);
      if (!item) return {};
      const base = item.due_date
        ? new Date(item.due_date)
        : computeDeadline(item, state.weddingDate).date;
      if (!base) return {};
      const shifted = new Date(base);
      shifted.setDate(shifted.getDate() + days);
      const iso = shifted.toISOString().slice(0, 10);
      return {
        items: state.items.map((it) =>
          it.id === id
            ? { ...it, due_date: iso, updated_at: new Date().toISOString() }
            : it,
        ),
      };
    }),

  // ── Workspace integration selectors ─────────────────────────────────────
  getItemsForCategory: (category, opts) =>
    filterItemsForCategory(get().items, category, opts),

  getUpcomingForCategory: (category, opts) =>
    getUpcomingForCategory(get().items, category, get().weddingDate, opts),

  getCategoryProgress: (category, now) =>
    computeCategoryProgress(get().items, category, get().weddingDate, now),

  updateDecisionField: (itemId, fieldId, value) =>
    set((state) => ({
      items: state.items.map((item) => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          decision_fields: item.decision_fields.map((field) =>
            field.id === fieldId ? { ...field, value } : field,
          ),
          updated_at: new Date().toISOString(),
        };
      }),
    })),

  inviteMembers: (emails, role) =>
    set((state) => {
      const existing = new Set(
        state.members.map((m) => m.email.toLowerCase()),
      );
      const fresh: Member[] = [];
      for (const raw of emails) {
        const email = raw.trim();
        if (!email || existing.has(email.toLowerCase())) continue;
        existing.add(email.toLowerCase());
        const name = deriveNameFromEmail(email);
        fresh.push({
          id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name,
          email,
          role,
          status: "Invited",
          avatarColor: colorForName(name),
        });
      }
      return fresh.length
        ? { members: [...state.members, ...fresh] }
        : {};
    }),

  updateMemberRole: (id, role) =>
    set((state) => ({
      members: state.members.map((m) =>
        m.id === id ? { ...m, role } : m,
      ),
    })),

  removeMember: (id) =>
    set((state) => ({
      members: state.members.filter((m) => m.id !== id),
      items: state.items.map((item) =>
        item.assignee_ids && item.assignee_ids.includes(id)
          ? {
              ...item,
              assignee_ids: item.assignee_ids.filter((a) => a !== id),
              updated_at: new Date().toISOString(),
            }
          : item,
      ),
    })),

  resendInvite: (id) =>
    set((state) => ({
      members: state.members.map((m) =>
        m.id === id ? { ...m, status: "Invited" } : m,
      ),
    })),

  toggleAssignee: (itemId, memberId) =>
    set((state) => ({
      items: state.items.map((item) => {
        if (item.id !== itemId) return item;
        const current = item.assignee_ids ?? [];
        const next = current.includes(memberId)
          ? current.filter((a) => a !== memberId)
          : [...current, memberId];
        return {
          ...item,
          assignee_ids: next,
          updated_at: new Date().toISOString(),
        };
      }),
    })),

  loadFromDB: async () => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    const rows = await dbLoadAll("checklist_items", coupleId);
    if (rows.length === 0) return;
    const dbItems = rows as unknown as ChecklistItem[];
    set((s) => {
      const dbIds = new Set(dbItems.map((i) => i.id));
      // Keep seed template items not overridden in DB; merge custom DB items on top
      const baseItems = s.items.map((i) => {
        const dbRow = dbItems.find((d) => d.id === i.id);
        return dbRow ? { ...i, ...dbRow } : i;
      });
      const newCustom = dbItems.filter((i) => !s.items.some((si) => si.id === i.id));
      return { items: [...baseItems, ...newCustom] };
    });
  },
}));
