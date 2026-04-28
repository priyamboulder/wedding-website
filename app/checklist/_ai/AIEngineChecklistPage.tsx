"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { TopNav } from "@/components/shell/TopNav";
import { cn } from "@/lib/utils";
import {
  CATEGORIES,
  EMPTY_PROFILE,
  PROGRESSIVE_QUESTIONS,
  deadlineFor,
  formatDeadline,
  generateBaseItems,
  generateUnlockedItems,
  isAtRisk,
  isFoundationComplete,
  isThisWeek,
  makeManualItem,
  urgencyFor,
  type CategoryId,
  type ChecklistItem,
  type GeneratedItem,
  type Priority,
  type ProgressiveQuestion,
  type UrgencyDot,
  type WeddingProfile,
} from "./engine";
import { FoundationInterview } from "./FoundationInterview";
import {
  AlertTriangle,
  Building2,
  Calendar,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  Gem,
  Gift,
  Heart,
  Lightbulb,
  ListChecks,
  Plus,
  RefreshCw,
  Search,
  Shirt,
  Sparkles,
  UserPlus,
  Users,
  UsersRound,
  UtensilsCrossed,
  X,
} from "lucide-react";

const STORAGE_KEY = "ai-checklist:v2";
const OLD_STORAGE_KEY = "ai-checklist:v1";

interface EngineState {
  profile: WeddingProfile;
  items: GeneratedItem[];
  answered: string[];
}

const EMPTY_STATE: EngineState = {
  profile: EMPTY_PROFILE,
  items: [],
  answered: [],
};

// Rebuild items from a profile + list of answered question ids, re-applying
// each answer's unlock drafts on top of the base library. Used on v1→v2
// migration and on explicit "Regenerate" actions.
function rebuildFromProfile(
  profile: WeddingProfile,
  answered: string[],
): GeneratedItem[] {
  const base = generateBaseItems(profile);
  const merged = [...base];
  for (const qid of answered) {
    const answer = profile.answers?.[qid];
    if (answer === undefined) continue;
    const unlocked = generateUnlockedItems(profile, qid, answer, merged.length);
    merged.push(...unlocked);
  }
  return merged;
}

function loadState(): EngineState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as EngineState;
      return {
        profile: { ...EMPTY_PROFILE, ...parsed.profile },
        items: (parsed.items ?? []).map((it) => ({
          ...it,
          source: it.source ?? "ai",
        })),
        answered: parsed.answered ?? [],
      };
    }
    // Migrate from v1: keep profile + answers, regenerate items from the new
    // dense library. v1 state had the sparse ~41-task output — if we kept it,
    // the rebuild wouldn't be visible to returning users.
    const oldRaw = window.localStorage.getItem(OLD_STORAGE_KEY);
    if (oldRaw) {
      const parsed = JSON.parse(oldRaw) as EngineState;
      const profile: WeddingProfile = { ...EMPTY_PROFILE, ...parsed.profile };
      const answered = parsed.answered ?? [];
      if (isFoundationComplete(profile)) {
        return { profile, answered, items: rebuildFromProfile(profile, answered) };
      }
      return { profile, answered, items: [] };
    }
    return EMPTY_STATE;
  } catch {
    return EMPTY_STATE;
  }
}

function saveState(s: EngineState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

const PHASE_ICONS: Record<CategoryId, React.ElementType> = {
  foundation_vision: Gem,
  branding_identity: Sparkles,
  core_bookings: Building2,
  attire_styling: Shirt,
  experience_layer: UtensilsCrossed,
  paper_stationery: FileText,
  guest_management: Users,
  ceremony_specifics: Heart,
  gifts_favors: Gift,
  legal_admin: FileText,
};

type QuickFilter = "all" | "thisWeek" | "atRisk" | "members" | null;
type StatusFilter = "all" | "not_started" | "done";
type PriorityFilter = "all" | Priority;
type AssigneeFilter = "all" | "partner1" | "partner2" | "both";

export default function AIEngineChecklistPage({
  onSwitchToClassic,
}: {
  onSwitchToClassic: () => void;
}) {
  const [state, setState] = useState<EngineState>(EMPTY_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [showInterview, setShowInterview] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryId>("foundation_vision");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>(null);

  // Toolbar state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<AssigneeFilter>("all");
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>("all");
  const [showSource, setShowSource] = useState(false);

  // Modals
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    const s = loadState();
    setState(s);
    setHydrated(true);
    if (!isFoundationComplete(s.profile)) setShowInterview(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  const { profile, items, answered } = state;

  function handleFoundationComplete(p: WeddingProfile) {
    const base = generateBaseItems(p);
    setState({ profile: p, items: base, answered: [] });
    setShowInterview(false);
  }

  function toggleItem(id: string) {
    setState((s) => ({
      ...s,
      items: s.items.map((it) =>
        it.id === id ? { ...it, done: !it.done } : it,
      ),
    }));
  }

  function answerQuestion(q: ProgressiveQuestion, answer: unknown) {
    setState((s) => {
      const nextProfile: WeddingProfile = {
        ...s.profile,
        answers: { ...s.profile.answers, [q.id]: answer },
      };
      const newItems = generateUnlockedItems(
        nextProfile,
        q.id,
        answer,
        s.items.length,
      );
      return {
        profile: nextProfile,
        items: [...s.items, ...newItems],
        answered: s.answered.includes(q.id) ? s.answered : [...s.answered, q.id],
      };
    });
  }

  function addManualItem(args: {
    title: string;
    category: CategoryId;
    subcategory: string;
    monthsBeforeWedding: number;
    priority: Priority;
  }) {
    setState((s) => {
      const item = makeManualItem({ ...args, existingCount: s.items.length });
      return { ...s, items: [...s.items, item] };
    });
  }

  function resetEverything() {
    if (typeof window === "undefined") return;
    const ok = window.confirm(
      "Reset the AI checklist? This clears your profile, answers, and all generated items.",
    );
    if (!ok) return;
    setState(EMPTY_STATE);
    setShowInterview(true);
  }

  function regenerateFromProfile() {
    if (typeof window === "undefined") return;
    if (!isFoundationComplete(state.profile)) {
      setShowInterview(true);
      return;
    }
    const ok = window.confirm(
      "Regenerate the checklist from your profile + answers? " +
        "Manual tasks and completed status will be preserved where titles match.",
    );
    if (!ok) return;
    setState((s) => {
      const fresh = rebuildFromProfile(s.profile, s.answered);
      const manual = s.items.filter((it) => it.source === "manual");
      const doneByTitle = new Set(
        s.items.filter((it) => it.done).map((it) => it.title),
      );
      const freshWithDone = fresh.map((it) => ({
        ...it,
        done: doneByTitle.has(it.title),
      }));
      // Re-ID manual items so they stay unique against the fresh list
      const manualRescued = manual.map((it, idx) => ({
        ...it,
        id: `manual__${freshWithDone.length + idx}`,
      }));
      return { ...s, items: [...freshWithDone, ...manualRescued] };
    });
  }

  // ─── Derived data ────────────────────────────────────────────────────────

  const counts = useMemo(() => {
    const totals: Record<CategoryId, { total: number; done: number }> = {
      foundation_vision: { total: 0, done: 0 },
      branding_identity: { total: 0, done: 0 },
      core_bookings: { total: 0, done: 0 },
      attire_styling: { total: 0, done: 0 },
      experience_layer: { total: 0, done: 0 },
      paper_stationery: { total: 0, done: 0 },
      guest_management: { total: 0, done: 0 },
      ceremony_specifics: { total: 0, done: 0 },
      gifts_favors: { total: 0, done: 0 },
      legal_admin: { total: 0, done: 0 },
    };
    for (const it of items) {
      totals[it.category].total += 1;
      if (it.done) totals[it.category].done += 1;
    }
    return totals;
  }, [items]);

  const totalItems = items.length;
  const totalDone = items.filter((it) => it.done).length;
  const totalPct = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0;

  const thisWeekCount = useMemo(
    () =>
      items.filter((it) => !it.done && isThisWeek(it, profile.weddingDate))
        .length,
    [items, profile.weddingDate],
  );
  const atRiskCount = useMemo(
    () => items.filter((it) => isAtRisk(it, profile.weddingDate)).length,
    [items, profile.weddingDate],
  );

  // Source view (AI/manual): just a visual toggle — badges on rows
  // Quick filter selects the slice of items we render
  const viewItems = useMemo(() => {
    if (quickFilter === "all") return items;
    if (quickFilter === "thisWeek")
      return items.filter(
        (it) => !it.done && isThisWeek(it, profile.weddingDate),
      );
    if (quickFilter === "atRisk")
      return items.filter((it) => isAtRisk(it, profile.weddingDate));
    // phase view
    return items.filter((it) => it.category === activeCategory);
  }, [quickFilter, items, activeCategory, profile.weddingDate]);

  // Available subcategories in the current view (for the category dropdown)
  const subcategoryOptions = useMemo(() => {
    const set = new Set<string>();
    for (const it of viewItems) set.add(it.subcategory);
    return Array.from(set).sort();
  }, [viewItems]);

  // Apply toolbar filters
  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return viewItems.filter((it) => {
      if (q && !it.title.toLowerCase().includes(q)) return false;
      if (statusFilter === "done" && !it.done) return false;
      if (statusFilter === "not_started" && it.done) return false;
      if (priorityFilter !== "all" && it.priority !== priorityFilter)
        return false;
      if (assigneeFilter !== "all" && it.assignedTo !== assigneeFilter)
        return false;
      if (subcategoryFilter !== "all" && it.subcategory !== subcategoryFilter)
        return false;
      return true;
    });
  }, [
    viewItems,
    search,
    statusFilter,
    priorityFilter,
    assigneeFilter,
    subcategoryFilter,
  ]);

  // Group filtered items by subcategory
  const grouped = useMemo(() => {
    const map = new Map<string, GeneratedItem[]>();
    for (const it of filteredItems) {
      if (!map.has(it.subcategory)) map.set(it.subcategory, []);
      map.get(it.subcategory)!.push(it);
    }
    // sort items within each group by monthsBeforeWedding desc (earliest deadlines first)
    for (const arr of map.values()) {
      arr.sort((a, b) => b.monthsBeforeWedding - a.monthsBeforeWedding);
    }
    return Array.from(map.entries());
  }, [filteredItems]);

  const pendingQuestions = useMemo(
    () =>
      PROGRESSIVE_QUESTIONS.filter((q) => !answered.includes(q.id)).filter(
        (q) => (q.showIf ? q.showIf(profile) : true),
      ),
    [answered, profile],
  );

  const activeMeta = CATEGORIES.find((c) => c.id === activeCategory)!;

  // Header title + blurb depend on quick filter
  const headerLabel =
    quickFilter === "all"
      ? "All Tasks"
      : quickFilter === "thisWeek"
        ? "Due This Week"
        : quickFilter === "atRisk"
          ? "At Risk"
          : quickFilter === "members"
            ? "Members"
            : activeMeta.label;
  const headerBlurb =
    quickFilter === "all"
      ? "Every task across every planning phase."
      : quickFilter === "thisWeek"
        ? "Tasks with a deadline in the next 7 days."
        : quickFilter === "atRisk"
          ? "Tasks that are overdue or due within 2 weeks."
          : quickFilter === "members"
            ? "People collaborating on this wedding."
            : activeMeta.blurb;

  // Active phase counts for header progress
  const headerCounts = !quickFilter
    ? counts[activeCategory]
    : {
        total: filteredItems.length,
        done: filteredItems.filter((i) => i.done).length,
      };
  const headerPct =
    headerCounts.total > 0
      ? Math.round((headerCounts.done / headerCounts.total) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-ivory">
      <TopNav>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1 text-xs">
            <span className="text-ink">
              <span className="tabular-nums font-medium">{totalDone}</span>
              <span className="text-ink-faint">/</span>
              <span className="tabular-nums">{totalItems}</span>{" "}
              <span className="text-ink-faint">tasks</span>
            </span>
            <span className="rounded-full bg-ivory-warm px-1.5 py-0.5 text-[10px] tabular-nums text-ink-faint">
              {totalPct}%
            </span>
          </div>
          <button
            onClick={() => setNewTaskOpen(true)}
            className="flex items-center gap-1 rounded-full bg-gold px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gold/90"
          >
            <Plus className="h-3.5 w-3.5" />
            New Task
          </button>
          <button
            onClick={() => setInviteOpen(true)}
            className="flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1.5 text-xs text-ink transition-colors hover:border-ink-faint/50"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Invite
          </button>
          <button
            onClick={regenerateFromProfile}
            className="flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1.5 text-xs text-ink-faint transition-colors hover:border-ink-faint/50 hover:text-ink"
            title="Regenerate tasks from your current profile + answers"
          >
            <RefreshCw className="h-3 w-3" />
            Regenerate
          </button>
          <button
            onClick={resetEverything}
            className="rounded-full border border-border bg-white px-3 py-1.5 text-xs text-ink-faint transition-colors hover:border-ink-faint/50 hover:text-ink"
            title="Reset AI checklist (clears profile + answers)"
          >
            Reset
          </button>
          <button
            onClick={onSwitchToClassic}
            className="rounded-full border border-border bg-white px-3 py-1.5 text-xs text-ink-faint transition-colors hover:border-ink-faint/50 hover:text-ink"
          >
            Classic view
          </button>
        </div>
      </TopNav>

      <div className="mx-auto flex max-w-[1400px] gap-6 px-6 py-6">
        {/* ─── Sidebar ─────────────────────────────────────────────── */}
        <aside className="w-64 shrink-0">
          <div className="mb-4 space-y-1">
            <QuickFilterRow
              icon={ListChecks}
              label="All Tasks"
              count={totalItems}
              active={quickFilter === "all"}
              onClick={() => {
                setQuickFilter("all");
                setSubcategoryFilter("all");
              }}
            />
            <QuickFilterRow
              icon={Calendar}
              label="This Week"
              count={thisWeekCount}
              active={quickFilter === "thisWeek"}
              onClick={() => {
                setQuickFilter("thisWeek");
                setSubcategoryFilter("all");
              }}
            />
            <QuickFilterRow
              icon={AlertTriangle}
              label="At Risk"
              count={atRiskCount}
              active={quickFilter === "atRisk"}
              onClick={() => {
                setQuickFilter("atRisk");
                setSubcategoryFilter("all");
              }}
            />
            <QuickFilterRow
              icon={UsersRound}
              label="Members"
              count={1}
              active={quickFilter === "members"}
              onClick={() => setQuickFilter("members")}
            />
          </div>

          <div className="mb-2 mt-6 px-2 text-[11px] font-medium uppercase tracking-wider text-ink-faint">
            Planning Phases
          </div>
          <div className="space-y-0.5">
            {CATEGORIES.map((c) => {
              const Icon = PHASE_ICONS[c.id];
              const ct = counts[c.id];
              const isActive = !quickFilter && c.id === activeCategory;
              const pct = ct.total > 0 ? (ct.done / ct.total) * 100 : 0;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveCategory(c.id);
                    setQuickFilter(null);
                    setSubcategoryFilter("all");
                  }}
                  className={cn(
                    "group flex w-full items-center gap-2.5 rounded-lg border-l-2 px-3 py-2 text-left transition-colors",
                    isActive
                      ? "border-gold bg-gold-pale/30"
                      : "border-transparent hover:bg-white",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isActive ? "text-gold" : "text-ink-faint",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium text-ink">
                        {c.label}
                      </span>
                      <span className="text-[11px] tabular-nums text-ink-faint">
                        {ct.done}/{ct.total}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-border">
                      <div
                        className={cn(
                          "h-full transition-all",
                          isActive ? "bg-gold" : "bg-ink-faint/40",
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {pendingQuestions.length > 0 ? (
            <div className="mt-5 rounded-lg border border-gold/30 bg-gold-pale/20 p-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-gold" />
                <div className="text-xs font-medium uppercase tracking-wide text-gold">
                  {pendingQuestions.length} unlock{" "}
                  {pendingQuestions.length === 1 ? "question" : "questions"}
                </div>
              </div>
              <div className="mt-1 text-xs text-ink-faint">
                Answer below to generate more items.
              </div>
            </div>
          ) : null}
        </aside>

        {/* ─── Main ─────────────────────────────────────────────── */}
        <main className="min-w-0 flex-1">
          <div className="mb-5">
            <div className="text-[11px] uppercase tracking-wider text-ink-faint">
              {quickFilter ? "Filter" : `Phase · ${activeMeta.label}`}
            </div>
            <h1 className="mt-1 font-serif text-3xl text-ink">{headerLabel}</h1>
            <div className="mt-1 text-sm text-ink-faint">{headerBlurb}</div>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full bg-gold transition-all"
                style={{ width: `${headerPct}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-ink-faint">
              <span className="tabular-nums">
                {headerCounts.done} / {headerCounts.total}
              </span>
              <span>
                Wedding:{" "}
                <span className="text-ink">{profile.weddingDate ?? "—"}</span>{" "}
                ·{" "}
                <span className="text-ink">
                  {profile.partner1Name} & {profile.partner2Name}
                </span>
              </span>
            </div>
          </div>

          {/* Toolbar */}
          {quickFilter !== "members" ? (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <div className="relative min-w-[240px] flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search items..."
                  className="h-9 w-full rounded-lg border border-border bg-white pl-8 pr-3 text-sm text-ink placeholder:text-ink-faint/70 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/20"
                />
              </div>
              <Select
                value={statusFilter}
                onChange={(v) => setStatusFilter(v as StatusFilter)}
                options={[
                  { value: "all", label: "All statuses" },
                  { value: "not_started", label: "Not started" },
                  { value: "done", label: "Complete" },
                ]}
              />
              <Select
                value={priorityFilter}
                onChange={(v) => setPriorityFilter(v as PriorityFilter)}
                options={[
                  { value: "all", label: "All priorities" },
                  { value: "critical", label: "Critical" },
                  { value: "high", label: "High" },
                  { value: "medium", label: "Medium" },
                  { value: "low", label: "Low" },
                ]}
              />
              <Select
                value={assigneeFilter}
                onChange={(v) => setAssigneeFilter(v as AssigneeFilter)}
                options={[
                  { value: "all", label: "Everyone" },
                  { value: "partner1", label: "Partner 1" },
                  { value: "partner2", label: "Partner 2" },
                  { value: "both", label: "Both" },
                ]}
                icon={<Users className="h-3.5 w-3.5 text-ink-faint" />}
              />
              <Select
                value={subcategoryFilter}
                onChange={(v) => setSubcategoryFilter(v)}
                options={[
                  { value: "all", label: "All categories" },
                  ...subcategoryOptions.map((s) => ({ value: s, label: s })),
                ]}
              />
              <button
                onClick={() => setShowSource((v) => !v)}
                className={cn(
                  "flex h-9 items-center gap-1 rounded-lg border px-3 text-xs transition-colors",
                  showSource
                    ? "border-gold/50 bg-gold-pale/30 text-gold"
                    : "border-border bg-white text-ink-faint hover:text-ink",
                )}
              >
                <Camera className="h-3.5 w-3.5" />
                Source
              </button>
              <button
                onClick={() => setNewTaskOpen(true)}
                className="flex h-9 items-center gap-1 rounded-lg bg-ink px-3 text-xs font-medium text-white hover:bg-ink/90"
              >
                <Plus className="h-3.5 w-3.5" />
                New Task
              </button>
            </div>
          ) : null}

          {/* Content */}
          {quickFilter === "members" ? (
            <MembersPanel
              profile={profile}
              onInvite={() => setInviteOpen(true)}
            />
          ) : grouped.length === 0 ? (
            <div className="rounded-xl border border-border bg-white p-8 text-center text-sm text-ink-faint">
              {items.length === 0
                ? "No items yet. Complete the foundation interview to generate your checklist."
                : "No items match your filters."}
            </div>
          ) : (
            <div className="space-y-3">
              {grouped.map(([sub, subItems]) => (
                <SubGroup
                  key={sub}
                  title={sub}
                  items={subItems}
                  weddingDate={profile.weddingDate}
                  showSource={showSource}
                  onToggle={toggleItem}
                />
              ))}
            </div>
          )}

          {/* Progressive question queue */}
          {pendingQuestions.length > 0 && quickFilter !== "members" ? (
            <div className="mt-10">
              <div className="mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-gold" />
                <h2 className="font-serif text-xl text-ink">
                  Unlock more items
                </h2>
              </div>
              <div className="mb-4 text-sm text-ink-faint">
                Answer any of these when you're ready. Each answer appends new
                tasks tailored to your wedding.
              </div>
              <div className="space-y-3">
                {pendingQuestions.slice(0, 5).map((q) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    onAnswer={(a) => answerQuestion(q, a)}
                  />
                ))}
              </div>
              {pendingQuestions.length > 5 ? (
                <div className="mt-3 text-xs text-ink-faint">
                  +{pendingQuestions.length - 5} more questions will appear
                  after these.
                </div>
              ) : null}
            </div>
          ) : null}
        </main>
      </div>

      {showInterview ? (
        <FoundationInterview
          initial={isFoundationComplete(profile) ? profile : undefined}
          onComplete={handleFoundationComplete}
          onCancel={
            isFoundationComplete(profile)
              ? () => setShowInterview(false)
              : undefined
          }
        />
      ) : null}

      {newTaskOpen ? (
        <NewTaskModal
          onClose={() => setNewTaskOpen(false)}
          onCreate={(args) => {
            addManualItem(args);
            setNewTaskOpen(false);
          }}
        />
      ) : null}

      {inviteOpen ? (
        <InviteModal
          profile={profile}
          onClose={() => setInviteOpen(false)}
        />
      ) : null}
    </div>
  );
}

// ─── Sub components ─────────────────────────────────────────────────────────

function QuickFilterRow({
  icon: Icon,
  label,
  count,
  active,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
        active ? "bg-ink text-white" : "text-ink hover:bg-white",
      )}
    >
      <span className="flex items-center gap-2">
        <Icon
          className={cn(
            "h-4 w-4",
            active ? "text-white" : "text-ink-faint",
          )}
        />
        {label}
      </span>
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-[10px] tabular-nums",
          active ? "bg-white/15" : "bg-border text-ink-faint",
        )}
      >
        {count}
      </span>
    </button>
  );
}

function Select({
  value,
  onChange,
  options,
  icon,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  icon?: ReactNode;
}) {
  return (
    <div className="relative">
      {icon ? (
        <div className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2">
          {icon}
        </div>
      ) : null}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-9 appearance-none rounded-lg border border-border bg-white pr-8 text-xs text-ink hover:border-ink-faint/40 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/20",
          icon ? "pl-7" : "pl-3",
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
    </div>
  );
}

function SubGroup({
  title,
  items,
  weddingDate,
  showSource,
  onToggle,
}: {
  title: string;
  items: GeneratedItem[];
  weddingDate: string | null;
  showSource: boolean;
  onToggle: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const done = items.filter((it) => it.done).length;
  return (
    <div className="rounded-xl border border-border bg-white">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left"
      >
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 text-ink-faint" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-ink-faint" />
        )}
        <span className="text-xs font-medium uppercase tracking-wider text-ink">
          {title}
        </span>
        <span className="text-[11px] tabular-nums text-ink-faint">
          {done}/{items.length}
        </span>
      </button>
      {open ? (
        <div className="border-t border-border">
          {items.map((it) => (
            <ItemRow
              key={it.id}
              item={it}
              weddingDate={weddingDate}
              showSource={showSource}
              onToggle={() => onToggle(it.id)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

const URGENCY_DOT: Record<UrgencyDot, string> = {
  overdue: "bg-red-500",
  soon: "bg-amber-500",
  ontrack: "bg-emerald-500",
  future: "bg-blue-400",
  none: "bg-ink-faint/40",
};

function ItemRow({
  item,
  weddingDate,
  showSource,
  onToggle,
}: {
  item: ChecklistItem;
  weddingDate: string | null;
  showSource: boolean;
  onToggle: () => void;
}) {
  const dl = deadlineFor(weddingDate, item.monthsBeforeWedding);
  const u = urgencyFor(item, weddingDate);
  const tag = item.tags[0] ?? item.subcategory.toUpperCase();

  return (
    <div className="group flex items-center gap-3 border-b border-border px-4 py-2 last:border-b-0 hover:bg-ivory-warm/40">
      <button
        onClick={onToggle}
        className={cn(
          "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition-colors",
          item.done
            ? "border-sage bg-sage text-white"
            : "border-ink-faint/40 hover:border-sage/60",
        )}
        aria-label={item.done ? "Mark as not done" : "Mark as done"}
      >
        {item.done ? <Check className="h-2.5 w-2.5" /> : null}
      </button>

      <span
        className={cn(
          "min-w-0 flex-1 truncate text-sm",
          item.done ? "text-ink-faint line-through" : "text-ink",
        )}
        title={item.title}
      >
        {item.title}
      </span>

      <span className="hidden shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-ink-faint sm:inline">
        {tag}
      </span>

      {showSource ? (
        <span
          className={cn(
            "hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider sm:inline",
            item.source === "manual"
              ? "bg-sage-pale text-sage"
              : "bg-gold-pale/50 text-gold",
          )}
        >
          {item.source}
        </span>
      ) : null}

      <div className="flex w-20 shrink-0 items-center justify-end gap-1.5 text-xs tabular-nums text-ink-faint">
        <span className={cn("h-1.5 w-1.5 rounded-full", URGENCY_DOT[u])} />
        <span>{formatDeadline(dl)}</span>
      </div>

      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-faint/50 opacity-0 group-hover:opacity-100" />
    </div>
  );
}

function QuestionCard({
  question,
  onAnswer,
}: {
  question: ProgressiveQuestion;
  onAnswer: (answer: unknown) => void;
}) {
  const [multi, setMulti] = useState<string[]>([]);

  if (question.kind === "yesno") {
    return (
      <div className="rounded-xl border border-border bg-white p-4">
        <div className="mb-3 text-sm text-ink">{question.prompt}</div>
        <div className="flex gap-2">
          <button
            onClick={() => onAnswer(true)}
            className="rounded-full border border-border bg-white px-4 py-1.5 text-sm text-ink hover:border-gold/50 hover:bg-gold-pale/30"
          >
            Yes
          </button>
          <button
            onClick={() => onAnswer(false)}
            className="rounded-full border border-border bg-white px-4 py-1.5 text-sm text-ink hover:border-gold/50 hover:bg-gold-pale/30"
          >
            No
          </button>
        </div>
      </div>
    );
  }

  if (question.kind === "single" && question.options) {
    return (
      <div className="rounded-xl border border-border bg-white p-4">
        <div className="mb-3 text-sm text-ink">{question.prompt}</div>
        <div className="flex flex-wrap gap-2">
          {question.options.map((o) => (
            <button
              key={o.value}
              onClick={() => onAnswer(o.value)}
              className="rounded-full border border-border bg-white px-3 py-1.5 text-sm text-ink-soft hover:border-gold/50 hover:bg-gold-pale/30 hover:text-ink"
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (question.kind === "multiselect" && question.options) {
    return (
      <div className="rounded-xl border border-border bg-white p-4">
        <div className="mb-3 text-sm text-ink">{question.prompt}</div>
        <div className="mb-3 flex flex-wrap gap-2">
          {question.options.map((o) => {
            const on = multi.includes(o.value);
            return (
              <button
                key={o.value}
                onClick={() =>
                  setMulti((arr) =>
                    on ? arr.filter((v) => v !== o.value) : [...arr, o.value],
                  )
                }
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors",
                  on
                    ? "border-gold bg-gold-pale/50 text-ink"
                    : "border-border bg-white text-ink-soft hover:border-gold/50 hover:text-ink",
                )}
              >
                {o.label}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => onAnswer(multi)}
          disabled={multi.length === 0}
          className="rounded-lg bg-ink px-4 py-1.5 text-sm font-medium text-white hover:bg-ink/90 disabled:opacity-40"
        >
          Save answer
        </button>
      </div>
    );
  }

  return null;
}

function MembersPanel({
  profile,
  onInvite,
}: {
  profile: WeddingProfile;
  onInvite: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-serif text-xl text-ink">People</div>
          <div className="mt-1 text-sm text-ink-faint">
            Who's collaborating on this wedding.
          </div>
        </div>
        <button
          onClick={onInvite}
          className="flex items-center gap-1 rounded-full bg-gold px-3 py-1.5 text-xs font-medium text-white hover:bg-gold/90"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Invite
        </button>
      </div>
      <div className="mt-4 space-y-2">
        <MemberRow name={profile.partner1Name || "Partner 1"} role="Owner" />
        <MemberRow name={profile.partner2Name || "Partner 2"} role="Owner" />
      </div>
    </div>
  );
}

function MemberRow({ name, role }: { name: string; role: string }) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase())
    .filter(Boolean)
    .slice(0, 2)
    .join("");
  return (
    <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-pale text-xs font-medium text-gold">
          {initials || "?"}
        </div>
        <div>
          <div className="text-sm text-ink">{name}</div>
          <div className="text-[11px] uppercase tracking-wider text-ink-faint">
            {role}
          </div>
        </div>
      </div>
    </div>
  );
}

function InviteModal({
  profile: _profile,
  onClose,
}: {
  profile: WeddingProfile;
  onClose: () => void;
}) {
  return (
    <Modal title="Invite collaborators" onClose={onClose}>
      <div className="space-y-3 text-sm text-ink-soft">
        <p>
          Invite your partner, family, or planner to help manage the checklist.
        </p>
        <input
          type="email"
          placeholder="email@example.com"
          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs text-ink-faint hover:text-ink"
          >
            Cancel
          </button>
          <button
            disabled
            className="rounded-lg bg-ink/80 px-3 py-1.5 text-xs font-medium text-white opacity-60"
          >
            Send invite
          </button>
        </div>
        <div className="text-[11px] text-ink-faint">
          Collaborative sharing is available on Pro. Upgrade to invite others to your checklist.
        </div>
      </div>
    </Modal>
  );
}

function NewTaskModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (args: {
    title: string;
    category: CategoryId;
    subcategory: string;
    monthsBeforeWedding: number;
    priority: Priority;
  }) => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<CategoryId>("foundation_vision");
  const [subcategory, setSubcategory] = useState("Custom");
  const [months, setMonths] = useState(3);
  const [priority, setPriority] = useState<Priority>("medium");

  const canSave = title.trim().length > 0;

  return (
    <Modal title="New task" onClose={onClose}>
      <div className="space-y-3">
        <Labeled label="Title">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to happen?"
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
        </Labeled>
        <div className="grid grid-cols-2 gap-3">
          <Labeled label="Phase">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryId)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </Labeled>
          <Labeled label="Section">
            <input
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            />
          </Labeled>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Labeled label="Months before wedding">
            <input
              type="number"
              value={months}
              onChange={(e) => setMonths(parseFloat(e.target.value))}
              step={0.5}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            />
          </Labeled>
          <Labeled label="Priority">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            >
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </Labeled>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs text-ink-faint hover:text-ink"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              onCreate({
                title: title.trim(),
                category,
                subcategory: subcategory.trim() || "Custom",
                monthsBeforeWedding: months,
                priority,
              })
            }
            disabled={!canSave}
            className="rounded-lg bg-gold px-3 py-1.5 text-xs font-medium text-white hover:bg-gold/90 disabled:opacity-40"
          >
            Add task
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Labeled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-ink-faint">
        {label}
      </div>
      {children}
    </label>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="text-sm font-medium text-ink">{title}</div>
          <button
            onClick={onClose}
            className="text-ink-faint hover:text-ink"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
