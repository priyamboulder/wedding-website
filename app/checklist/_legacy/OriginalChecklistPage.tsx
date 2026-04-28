"use client";

import {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
  Suspense,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  getTemplateComponent,
  TEMPLATE_NAMES,
  type BespokePopOutProps,
} from "@/components/popout/registry";
import { cn } from "@/lib/utils";
import { useChecklistStore } from "@/stores/checklist-store";
import {
  SUBSECTION_LABELS,
  subsectionsForPhase,
  shortPhaseKey,
} from "@/lib/checklist-seed";
import {
  computeDeadline,
  computeAutoDeadline,
  isDueThisWeek as isDeadlineThisWeek,
  isAtRisk as isDeadlineAtRisk,
  isWeddingInPast,
  toDateInputValue,
} from "@/lib/deadlines";
import type {
  ChecklistItem,
  ItemStatus,
  Priority,
  AssignedTo,
  Phase,
  DecisionField,
  DecisionTemplateName,
  Member,
  MemberRole,
  WorkspaceCategoryTag,
} from "@/types/checklist";
import {
  CATEGORY_TAG_META,
  CATEGORY_LABEL,
} from "@/lib/journal/category-vocab";
import { Avatar, AvatarStack } from "@/components/collaboration/Avatar";
import { InviteModal } from "@/components/collaboration/InviteModal";
import { MembersPanel } from "@/components/collaboration/MembersPanel";
import { AssignPopover } from "@/components/collaboration/AssignPopover";
import { AssigneeFilter } from "@/components/collaboration/AssigneeFilter";
import { ShoppingDrawer } from "@/components/checklist/ShoppingDrawer";
import { RelatedJournalPosts } from "@/components/checklist/RelatedJournalPosts";
import {
  SmartTaskInputBar,
  type ParsedTask,
  type ParsedTaskSuggestion,
} from "@/components/checklist/SmartTaskInputBar";
import {
  buildSmartTaskContext,
  parsedTaskToCustomInput,
} from "@/lib/checklist/smart-context";
import { ShoppingLinksProvider } from "@/contexts/ShoppingLinksContext";
import { CommentThread, FileUploader, FileGallery } from "@/components/popout";
import { useArticleLinksStore, type ArticleLink } from "@/stores/article-links-store";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronDown,
  Calendar,
  Gem,
  Building2,
  Camera,
  Music,
  Flower2,
  UtensilsCrossed,
  Plane,
  Shirt,
  Sparkles,
  Heart,
  PartyPopper,
  Gift,
  FileText,
  Users,
  Check,
  Circle,
  Clock,
  Ban,
  Minus,
  User,
  Link as LinkIcon,
  Search,
  X,
  MoreHorizontal,
  ArrowRight,
  ExternalLink,
  AlertTriangle,
  MessageSquare,
  CalendarClock,
  ShieldAlert,
  Plus,
  Flame,
  UserPlus,
  UsersRound,
  ListChecks,
  ShoppingBag,
  Eye,
  Paperclip,
  RotateCcw,
  Trash2,
  BookOpen,
  Loader2,
} from "lucide-react";
import { TopNav } from "@/components/shell/TopNav";
import { useCoupleIdentity } from "@/lib/couple-identity";

// ── Phase icon mapping ──────────────────────────────────────────────────────
const PHASE_ICONS: Record<string, React.ElementType> = {
  "phase-0": Gem,
  "phase-1": Sparkles,
  "phase-2": Building2,
  "phase-3": Shirt,
  "phase-4": UtensilsCrossed,
  "phase-5": FileText,
  "phase-6": Users,
  "phase-7": Heart,
  "phase-8": Gift,
  "phase-9": FileText,
  "phase-10": Calendar,
  "phase-11": PartyPopper,
  "phase-12": Sparkles,
};

// ── Status config ───────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  ItemStatus,
  { icon: React.ElementType; label: string; color: string; bg: string }
> = {
  not_started: {
    icon: Circle,
    label: "To do",
    color: "text-ink-faint",
    bg: "bg-transparent",
  },
  in_progress: {
    icon: Clock,
    label: "In progress",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  done: {
    icon: Check,
    label: "Done",
    color: "text-sage",
    bg: "bg-sage-pale",
  },
  blocked: {
    icon: Ban,
    label: "Blocked",
    color: "text-rose",
    bg: "bg-rose-pale",
  },
  not_applicable: {
    icon: Minus,
    label: "N/A",
    color: "text-ink-faint",
    bg: "bg-ivory-warm",
  },
};

const PRIORITY_DOT: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-amber-500",
  medium: "bg-blue-400",
  low: "bg-ink-faint",
};

const PRIORITY_LABELS: Record<string, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const ASSIGNED_LABEL: Record<string, string> = {
  bride: "Bride",
  groom: "Groom",
  both: "Both",
  family: "Family",
  planner: "Planner",
};

// ── Panel easing ────────────────────────────────────────────────────────────
const PANEL_EASE = [0.32, 0.72, 0, 1] as const;

// ── View modes ──────────────────────────────────────────────────────────────
type ViewMode = "phase" | "today" | "at-risk" | "members" | "all";

// ── Helpers ─────────────────────────────────────────────────────────────────

function daysUntil(date: Date): number {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function itemDeadline(
  item: ChecklistItem,
  weddingDate: Date | null,
): Date | null {
  return computeDeadline(item, weddingDate).date;
}

function isItemOverdue(
  item: ChecklistItem,
  weddingDate: Date | null,
): boolean {
  return isDeadlineAtRisk(item, weddingDate);
}

function isItemThisWeek(
  item: ChecklistItem,
  weddingDate: Date | null,
): boolean {
  return isDeadlineThisWeek(item, weddingDate);
}

function hasUnmetDeps(item: ChecklistItem, allItems: ChecklistItem[]): boolean {
  if (item.dependencies.length === 0) return false;
  return item.dependencies.some((depId) => {
    const dep = allItems.find((i) => i.id === depId);
    return dep && dep.status !== "done" && dep.status !== "not_applicable";
  });
}

function isAtRisk(
  item: ChecklistItem,
  allItems: ChecklistItem[],
  weddingDate: Date | null,
): boolean {
  if (item.status === "done" || item.status === "not_applicable") return false;
  return (
    item.status === "blocked" ||
    isItemOverdue(item, weddingDate) ||
    hasUnmetDeps(item, allItems)
  );
}

// ── Deadline Field ──────────────────────────────────────────────────────────

function DeadlineField({ item }: { item: ChecklistItem }) {
  const weddingDate = useChecklistStore((s) => s.weddingDate);
  const updateItem = useChecklistStore((s) => s.updateItem);
  const { date, isOverride } = computeDeadline(item, weddingDate);

  if (!weddingDate) {
    return (
      <span className="flex items-center gap-1.5 text-[12px] italic text-ink-faint">
        <Calendar size={12} strokeWidth={1.5} />
        Set wedding date to enable deadlines
      </span>
    );
  }

  const inputValue = date ? toDateInputValue(date) : "";

  return (
    <div className="flex items-center gap-1.5">
      <Calendar size={12} strokeWidth={1.5} className="text-ink-faint" />
      <input
        type="date"
        value={inputValue}
        onChange={(e) =>
          updateItem(item.id, { due_date: e.target.value || null })
        }
        className="bg-transparent text-[12px] font-medium text-ink-muted outline-none cursor-pointer hover:text-ink transition-colors"
        aria-label="Deadline"
      />
      {isOverride ? (
        <>
          <span className="rounded-sm border border-saffron/40 bg-saffron-pale/40 px-1 py-px text-[9px] font-medium uppercase tracking-wider text-saffron">
            Override
          </span>
          <button
            onClick={() => updateItem(item.id, { due_date: null })}
            className="text-[10px] text-ink-faint hover:text-saffron transition-colors"
            aria-label="Reset to auto-computed deadline"
            title="Reset to auto-computed deadline"
          >
            ↺ Reset to auto
          </button>
        </>
      ) : date ? (
        <span className="rounded-sm bg-saffron/10 px-1 py-px text-[9px] font-medium uppercase tracking-wider text-saffron">
          Auto
        </span>
      ) : null}
    </div>
  );
}

// ── Skeleton Loader ─────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3.5 px-4 py-3.5" aria-hidden="true">
      <div className="skeleton h-[22px] w-[22px] rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3.5 w-3/4 rounded" />
        <div className="skeleton h-2.5 w-1/2 rounded" />
      </div>
      <div className="skeleton h-5 w-16 rounded-full" />
    </div>
  );
}

function SkeletonSection() {
  return (
    <div className="mb-6" aria-hidden="true">
      <div className="flex items-center gap-2 px-2 py-2 mb-1">
        <div className="skeleton h-2.5 w-24 rounded" />
        <div className="skeleton h-2.5 w-8 rounded" />
      </div>
      <SkeletonRow />
      <SkeletonRow />
      <SkeletonRow />
    </div>
  );
}

function SkeletonContent() {
  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <div className="mb-8 space-y-3">
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton h-8 w-64 rounded" />
        <div className="skeleton h-4 w-96 rounded" />
        <div className="mt-5 h-px bg-gradient-to-r from-gold/20 to-transparent" />
      </div>
      <SkeletonSection />
      <SkeletonSection />
    </div>
  );
}

// ── Empty States ────────────────────────────────────────────────────────────

function EmptyPhase({ phaseName }: { phaseName: string }) {
  return (
    <div className="flex flex-col items-center py-24 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-ivory-warm">
        <Sparkles size={28} strokeWidth={1} className="text-gold-light" />
      </div>
      <h3 className="font-serif text-lg font-bold text-ink-soft">
        No items yet
      </h3>
      <p className="mt-2 max-w-[280px] text-[14px] leading-relaxed text-ink-muted">
        {phaseName} is a blank canvas.
        <br />
        Add your first item to begin planning.
      </p>
      <button className="mt-6 flex items-center gap-2 rounded-lg border border-gold/30 bg-gold-pale/20 px-5 py-2.5 text-[13px] font-medium text-gold transition-colors hover:bg-gold-pale/40">
        <Plus size={14} strokeWidth={2} />
        Add item
      </button>
    </div>
  );
}

function EmptySearch() {
  return (
    <div className="flex flex-col items-center py-24 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-ivory-warm">
        <Search size={24} strokeWidth={1} className="text-ink-faint" />
      </div>
      <p className="font-serif text-lg italic text-ink-muted">
        No items match
      </p>
      <p className="mt-2 text-[13px] text-ink-faint">
        Try adjusting your search or filters
      </p>
    </div>
  );
}

function EmptyToday() {
  return (
    <div className="flex flex-col items-center py-24 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-sage-pale">
        <CalendarClock size={28} strokeWidth={1} className="text-sage" />
      </div>
      <h3 className="font-serif text-lg font-bold text-ink-soft">
        Nothing due this week
      </h3>
      <p className="mt-2 max-w-[260px] text-[14px] leading-relaxed text-ink-muted">
        Your week is clear. A rare gift in wedding planning — savour it.
      </p>
    </div>
  );
}

function EmptyAtRisk() {
  return (
    <div className="flex flex-col items-center py-24 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-sage-pale">
        <ShieldAlert size={28} strokeWidth={1} className="text-sage" />
      </div>
      <h3 className="font-serif text-lg font-bold text-ink-soft">
        Nothing at risk
      </h3>
      <p className="mt-2 max-w-[260px] text-[14px] leading-relaxed text-ink-muted">
        Everything is on track. The planning gods smile upon you.
      </p>
    </div>
  );
}

// ── Progress Ring ───────────────────────────────────────────────────────────

function ProgressRing({
  percent,
  size = 44,
  strokeWidth = 3.5,
  onClick,
  interactive = false,
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
  onClick?: () => void;
  interactive?: boolean;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  const ring = (
    <svg width={size} height={size} className="shrink-0" aria-hidden="true">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-border"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="progress-ring-circle text-gold"
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-ink text-[10px] font-mono font-medium"
      >
        {percent}%
      </text>
    </svg>
  );

  if (interactive && onClick) {
    return (
      <button
        onClick={onClick}
        className="rounded-full transition-transform hover:scale-105 active:scale-95"
        aria-label={`${percent}% complete. Click for details.`}
      >
        {ring}
      </button>
    );
  }

  return ring;
}

// ── Progress Popover ────────────────────────────────────────────────────────

function ProgressPopover({
  phases,
  itemsByPhase,
  totalItems,
  completedItems,
  onClose,
}: {
  phases: Phase[];
  itemsByPhase: Record<string, ChecklistItem[]>;
  totalItems: number;
  completedItems: number;
  onClose: () => void;
}) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", keyHandler);
    };
  }, [onClose]);

  const overallPct =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="Planning progress"
      className="popover-enter absolute right-6 top-14 z-50 w-80 rounded-xl border border-border bg-white shadow-xl"
    >
      {/* Header */}
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-sm font-medium text-ink">
            Planning Progress
          </h3>
          <span className="font-mono text-xs tabular-nums text-gold font-medium">
            {overallPct}%
          </span>
        </div>
        <div className="mt-2.5 h-2 rounded-full bg-ivory-deep">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-gold to-gold-light"
            initial={{ width: 0 }}
            animate={{ width: `${overallPct}%` }}
            transition={{ duration: 0.6, ease: PANEL_EASE }}
          />
        </div>
        <p className="mt-2 text-[11px] text-ink-faint">
          {completedItems} of {totalItems} tasks complete
        </p>
      </div>

      {/* Phase list */}
      <div className="max-h-[320px] overflow-y-auto px-2 py-2 sidebar-scroll">
        {phases.map((phase) => {
          const items = itemsByPhase[phase.id] || [];
          const done = items.filter((i) => i.status === "done").length;
          const total = items.length;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          const Icon = PHASE_ICONS[phase.id] || Sparkles;

          return (
            <div
              key={phase.id}
              className="flex items-center gap-3 rounded-lg px-3 py-2"
            >
              <Icon
                size={14}
                strokeWidth={1.5}
                className="shrink-0 text-ink-faint"
              />
              <div className="min-w-0 flex-1">
                <span className="block truncate text-[12px] font-medium text-ink-soft">
                  {phase.title}
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-[3px] flex-1 rounded-full bg-ivory-deep">
                    <div
                      className="h-full rounded-full bg-sage transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="font-mono text-[9px] tabular-nums text-ink-faint">
                    {done}/{total}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Custom Checkbox ─────────────────────────────────────────────────────────

function ItemCheckbox({
  checked,
  status,
  onToggle,
}: {
  checked: boolean;
  status: ItemStatus;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className="group/check relative flex h-[22px] w-[22px] shrink-0 items-center justify-center"
      aria-label={`Status: ${STATUS_CONFIG[status].label}. Click to change.`}
      aria-pressed={checked}
    >
      <motion.div
        className={cn(
          "flex h-[22px] w-[22px] items-center justify-center rounded-full border-[1.5px] transition-colors",
          checked
            ? "border-sage bg-sage"
            : status === "in_progress"
              ? "border-amber-400 bg-amber-50"
              : status === "blocked"
                ? "border-rose bg-rose-pale"
                : status === "not_applicable"
                  ? "border-ink-faint/30 bg-ivory-warm"
                  : "border-ink-faint/30 group-hover/check:border-sage/50",
        )}
        whileTap={{ scale: 0.85 }}
        animate={
          checked
            ? { scale: [1, 1.2, 0.95, 1] }
            : { scale: 1 }
        }
        transition={{
          duration: 0.35,
          ease: [0.34, 1.56, 0.64, 1], // spring-like
        }}
      >
        <AnimatePresence mode="wait">
          {checked ? (
            <motion.div
              key="check"
              initial={{ scale: 0, opacity: 0, rotate: -45 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <Check size={12} strokeWidth={3} className="text-white" />
            </motion.div>
          ) : status === "in_progress" ? (
            <Clock size={12} strokeWidth={1.5} className="text-amber-600" />
          ) : status === "blocked" ? (
            <Ban size={12} strokeWidth={1.5} className="text-rose" />
          ) : status === "not_applicable" ? (
            <Minus size={12} strokeWidth={1.5} className="text-ink-faint" />
          ) : null}
        </AnimatePresence>
      </motion.div>
    </button>
  );
}

// ── Decision field preview ──────────────────────────────────────────────────

function decisionPreview(item: ChecklistItem): string | null {
  const filled = item.decision_fields
    .filter((f) => f.value !== undefined && f.value !== null && f.value !== "")
    .map((f) => {
      if (f.type === "currency" && f.value)
        return `₹${Number(f.value).toLocaleString("en-IN")}`;
      if (f.type === "date" && f.value) {
        const d = new Date(f.value as string);
        return d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }
      const str = String(f.value);
      // Skip serialized JSON blobs (bespoke template data)
      if (str.startsWith("[") || str.startsWith("{")) return null;
      return str;
    })
    .filter(Boolean)
    .slice(0, 3);

  return filled.length > 0 ? filled.join(" · ") : null;
}

// ── Checklist Item Row ──────────────────────────────────────────────────────

function ChecklistItemRow({
  item,
  onToggle,
  onSelect,
  isSelected,
  showPhase,
  showPhaseInline,
  phaseName,
  members,
  onToggleAssignee,
  showSourceTag,
}: {
  item: ChecklistItem;
  onToggle: () => void;
  onSelect: () => void;
  isSelected: boolean;
  showPhase?: boolean;
  showPhaseInline?: boolean;
  phaseName?: string;
  members: Member[];
  onToggleAssignee: (itemId: string, memberId: string) => void;
  showSourceTag?: boolean;
}) {
  const isDone = item.status === "done";
  const isNA = item.status === "not_applicable";
  const preview = decisionPreview(item);
  const statusCfg = STATUS_CONFIG[item.status];
  const weddingDate = useChecklistStore((s) => s.weddingDate);
  const deadline = computeDeadline(item, weddingDate);
  const overdue = !isDone && !isNA && isItemOverdue(item, weddingDate);
  const atRisk = !isDone && !isNA && (item.status === "blocked" || overdue);

  const assigneeIds = item.assignee_ids ?? [];
  const memberMap = useMemo(() => {
    const m: Record<string, Member> = {};
    for (const mem of members ?? []) m[mem.id] = mem;
    return m;
  }, [members]);
  const assignees = assigneeIds
    .map((id) => memberMap[id])
    .filter(Boolean) as Member[];

  const assignAnchorRef = useRef<HTMLSpanElement>(null);
  const [assignOpen, setAssignOpen] = useState(false);

  const openAssign = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAssignOpen(true);
  };

  return (
    <div
      onClick={onSelect}
      className={cn(
        "group flex cursor-pointer items-center gap-3.5 rounded-lg px-4 py-3.5 transition-all duration-200 border-l-2",
        atRisk ? "border-l-saffron" : "border-l-transparent",
        "hover:bg-gold-pale/25 hover:shadow-[0_1px_3px_rgba(184,134,11,0.06)]",
        isSelected && "bg-gold-pale/30 ring-1 ring-gold/15",
        isDone && "opacity-60",
        isNA && "opacity-40",
      )}
      role="button"
      tabIndex={0}
      aria-label={`${item.title}. ${statusCfg.label}. ${item.priority} priority.`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {/* Custom checkbox */}
      <div className="pt-0.5">
        <ItemCheckbox
          checked={isDone}
          status={item.status}
          onToggle={onToggle}
        />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Phase badge for cross-phase views */}
        {showPhase && phaseName && (
          <span className="mb-0.5 block text-[10px] font-medium uppercase tracking-wider text-ink-faint">
            {phaseName}
          </span>
        )}
        {/* Title row */}
        <div className="flex items-baseline gap-2">
          <h4
            className={cn(
              "font-serif text-[14.5px] font-medium leading-snug tracking-tight",
              isDone
                ? "text-ink-muted line-through decoration-ink-faint/40"
                : "text-ink",
            )}
          >
            {item.title}
          </h4>
          {showSourceTag && item.source === "custom" && (
            <span className="rounded-sm bg-gold-pale/50 px-1 font-mono text-[9px] uppercase tracking-wider text-gold">
              custom
            </span>
          )}
          {item.template_modified && (
            <span
              className="font-mono text-[9px] uppercase tracking-wider text-ink-faint/70 italic"
              title="This template task has been modified"
            >
              modified
            </span>
          )}
          {item.category_tags && item.category_tags.length > 0 && (
            <span
              className="rounded-full border border-saffron/30 bg-saffron/5 px-2 py-[1px] font-mono text-[9px] uppercase tracking-[0.08em] text-saffron"
              title={item.category_tags.map((t) => CATEGORY_LABEL[t]).join(", ")}
            >
              {CATEGORY_TAG_META.find((m) => m.slug === item.category_tags![0])
                ?.shortLabel ?? item.category_tags[0]}
              {item.category_tags.length > 1 && ` +${item.category_tags.length - 1}`}
            </span>
          )}
        </div>

        {/* Decision preview */}
        {preview && (
          <p className="mt-0.5 text-[12px] text-ink-muted/80 italic">
            {preview}
          </p>
        )}
      </div>

      {/* Right-side indicators */}
      <div className="flex shrink-0 items-center gap-2">
        {/* Inline phase tag (All Tasks view) */}
        {showPhaseInline && phaseName && (
          <span className="max-w-[160px] truncate text-[11px] font-normal text-ink/40">
            {phaseName}
          </span>
        )}

        {/* Status pill */}
        {item.status !== "not_started" && (
          <span
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
              statusCfg.bg,
              statusCfg.color,
            )}
          >
            {statusCfg.label}
          </span>
        )}

        {/* Assignees */}
        {assignees.length > 0 ? (
          <span
            ref={assignAnchorRef}
            onClick={openAssign}
            className="cursor-pointer"
          >
            <AvatarStack members={assignees} max={3} size={22} />
          </span>
        ) : (
          <span ref={assignAnchorRef} className="inline-flex">
            <button
              onClick={openAssign}
              className="flex items-center gap-1 rounded-full border border-dashed border-ink-faint/30 px-2 py-0.5 text-[10px] text-ink-faint opacity-0 transition-all duration-200 hover:border-gold/40 hover:bg-gold-pale/20 hover:text-gold group-hover:opacity-100"
              aria-label="Assign members"
              tabIndex={-1}
            >
              <Plus size={9} strokeWidth={2} />
              Assign
            </button>
          </span>
        )}

        {assignOpen && (
          <AssignPopover
            members={members}
            assigneeIds={assigneeIds}
            onToggle={(memberId) => onToggleAssignee(item.id, memberId)}
            onClose={() => setAssignOpen(false)}
            anchorRef={assignAnchorRef}
          />
        )}

        {/* Priority */}
        <span
          className={cn(
            "h-1.5 w-1.5 shrink-0 rounded-full",
            PRIORITY_DOT[item.priority],
          )}
          title={PRIORITY_LABELS[item.priority]}
        />

        {/* Deadline (auto-computed or override) */}
        {deadline.date && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-[10px]",
              overdue ? "font-medium text-rose" : "text-ink-faint",
            )}
          >
            <Calendar size={10} strokeWidth={1.5} />
            {deadline.date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}

        {/* Chevron */}
        <ChevronRight
          size={14}
          className="shrink-0 text-ink-faint/40 transition-all duration-200 group-hover:text-ink-faint group-hover:translate-x-0.5"
        />
      </div>
    </div>
  );
}

// ── Top Bar ─────────────────────────────────────────────────────────────────

function ChecklistTopBarActions({
  totalItems,
  completedItems,
  phases,
  itemsByPhase,
  onInviteClick,
  onNewTaskClick,
}: {
  totalItems: number;
  completedItems: number;
  phases: Phase[];
  itemsByPhase: Record<string, ChecklistItem[]>;
  onInviteClick: () => void;
  onNewTaskClick: () => void;
}) {
  const percent =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const [showPopover, setShowPopover] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-[12px] text-ink-muted sm:block">
        {completedItems}/{totalItems} tasks
      </span>
      <ProgressRing
        percent={percent}
        size={28}
        strokeWidth={2.5}
        interactive
        onClick={() => setShowPopover(!showPopover)}
      />
      <button
        onClick={onNewTaskClick}
        className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory transition-opacity hover:opacity-90"
        aria-label="New task"
        title="New task (N)"
      >
        <Plus size={13} strokeWidth={2} />
        <span>New Task</span>
      </button>
      <button
        onClick={onInviteClick}
        className="flex items-center gap-1.5 rounded-md border border-gold/25 bg-gold-pale/30 px-3 py-1.5 text-[12px] font-medium text-gold transition-colors hover:bg-gold-pale/50 hover:border-gold/40"
        aria-label="Invite to planning space"
      >
        <UserPlus size={13} strokeWidth={1.5} />
        <span>Invite</span>
      </button>

      {showPopover && (
        <ProgressPopover
          phases={phases}
          itemsByPhase={itemsByPhase}
          totalItems={totalItems}
          completedItems={completedItems}
          onClose={() => setShowPopover(false)}
        />
      )}
    </div>
  );
}

// ── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar({
  phases,
  activePhase,
  onPhaseSelect,
  itemsByPhase,
  viewMode,
  onViewModeChange,
  allTasksCount,
  todayCount,
  atRiskCount,
  memberCount,
}: {
  phases: Phase[];
  activePhase: string;
  onPhaseSelect: (id: string) => void;
  itemsByPhase: Record<string, ChecklistItem[]>;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  allTasksCount: number;
  todayCount: number;
  atRiskCount: number;
  memberCount: number;
}) {
  return (
    <aside
      className="hidden w-72 shrink-0 border-r border-border lg:block"
      role="navigation"
      aria-label="Checklist navigation"
    >
      <div className="flex h-full flex-col">
        {/* Smart views */}
        <div className="border-b border-border px-3 pb-3 pt-6">
          <button
            onClick={() => onViewModeChange("all")}
            className={cn(
              "group flex w-full items-center gap-3 rounded-lg py-2.5 pr-3 text-left transition-all duration-200 border-l-2",
              viewMode === "all"
                ? "bg-gold-pale/20 text-ink border-gold pl-2.5"
                : "border-transparent pl-2.5 text-ink-muted hover:bg-ivory-warm/50 hover:text-ink-soft",
            )}
            aria-current={viewMode === "all" ? "page" : undefined}
          >
            <ListChecks
              size={18}
              strokeWidth={1.5}
              className={cn(
                "shrink-0 transition-colors",
                viewMode === "all"
                  ? "text-gold"
                  : "text-ink-faint group-hover:text-ink-muted",
              )}
            />
            <span className="flex-1 text-[13px] font-medium">All Tasks</span>
            {allTasksCount > 0 && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 font-mono text-[10px] tabular-nums",
                  viewMode === "all"
                    ? "bg-gold/10 text-gold"
                    : "bg-ivory-warm text-ink-faint",
                )}
              >
                {allTasksCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onViewModeChange("today")}
            className={cn(
              "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200",
              viewMode === "today"
                ? "bg-gold-pale/30 text-ink"
                : "text-ink-muted hover:bg-ivory-warm/50 hover:text-ink-soft",
            )}
            aria-current={viewMode === "today" ? "page" : undefined}
          >
            <CalendarClock
              size={18}
              strokeWidth={1.5}
              className={cn(
                "shrink-0 transition-colors",
                viewMode === "today"
                  ? "text-gold"
                  : "text-ink-faint group-hover:text-ink-muted",
              )}
            />
            <span className="flex-1 text-[13px] font-medium">This Week</span>
            {todayCount > 0 && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 font-mono text-[10px] tabular-nums",
                  viewMode === "today"
                    ? "bg-gold/10 text-gold"
                    : "bg-ivory-warm text-ink-faint",
                )}
              >
                {todayCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onViewModeChange("at-risk")}
            className={cn(
              "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200",
              viewMode === "at-risk"
                ? "bg-rose-pale/40 text-ink"
                : "text-ink-muted hover:bg-ivory-warm/50 hover:text-ink-soft",
            )}
            aria-current={viewMode === "at-risk" ? "page" : undefined}
          >
            <ShieldAlert
              size={18}
              strokeWidth={1.5}
              className={cn(
                "shrink-0 transition-colors",
                viewMode === "at-risk"
                  ? "text-rose"
                  : "text-ink-faint group-hover:text-ink-muted",
              )}
            />
            <span className="flex-1 text-[13px] font-medium">At Risk</span>
            {atRiskCount > 0 && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 font-mono text-[10px] tabular-nums",
                  viewMode === "at-risk"
                    ? "bg-rose/10 text-rose"
                    : "bg-ivory-warm text-ink-faint",
                )}
              >
                {atRiskCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onViewModeChange("members")}
            className={cn(
              "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200",
              viewMode === "members"
                ? "bg-gold-pale/30 text-ink"
                : "text-ink-muted hover:bg-ivory-warm/50 hover:text-ink-soft",
            )}
            aria-current={viewMode === "members" ? "page" : undefined}
          >
            <UsersRound
              size={18}
              strokeWidth={1.5}
              className={cn(
                "shrink-0 transition-colors",
                viewMode === "members"
                  ? "text-gold"
                  : "text-ink-faint group-hover:text-ink-muted",
              )}
            />
            <span className="flex-1 text-[13px] font-medium">Members</span>
            {memberCount > 0 && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 font-mono text-[10px] tabular-nums",
                  viewMode === "members"
                    ? "bg-gold/10 text-gold"
                    : "bg-ivory-warm text-ink-faint",
                )}
              >
                {memberCount}
              </span>
            )}
          </button>
        </div>

        {/* Phases heading */}
        <div className="px-6 pb-4 pt-6">
          <h2 className="font-serif text-sm font-medium uppercase tracking-widest text-ink-muted">
            Planning Phases
          </h2>
        </div>

        <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 pb-8">
          <ul className="space-y-0.5" role="list">
            {phases.map((phase) => {
              const Icon = PHASE_ICONS[phase.id] || Sparkles;
              const isActive =
                viewMode === "phase" && phase.id === activePhase;
              const items = itemsByPhase[phase.id] || [];
              const done = items.filter((i) => i.status === "done").length;
              const total = items.length;
              const phasePct =
                total > 0 ? Math.round((done / total) * 100) : 0;

              return (
                <li key={phase.id}>
                  <button
                    onClick={() => {
                      onViewModeChange("phase");
                      onPhaseSelect(phase.id);
                    }}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200",
                      isActive
                        ? "bg-gold-pale/20 text-ink border-l-2 border-gold pl-2.5"
                        : "text-ink-muted hover:bg-ivory-warm/50 hover:text-ink-soft border-l-2 border-transparent pl-2.5",
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon
                      size={18}
                      strokeWidth={1.5}
                      className={cn(
                        "shrink-0 transition-colors",
                        isActive
                          ? "text-gold"
                          : "text-ink-faint group-hover:text-ink-muted",
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium leading-tight">
                        {phase.title}
                      </span>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-[2px] flex-1 rounded-full bg-border">
                          <div
                            className="h-full rounded-full bg-sage transition-all duration-500"
                            style={{ width: `${phasePct}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] tabular-nums text-ink-faint">
                          {done}/{total}
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      size={14}
                      className={cn(
                        "shrink-0 transition-opacity",
                        isActive
                          ? "opacity-50"
                          : "opacity-0 group-hover:opacity-30",
                      )}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}

// ── Section grouping helper ─────────────────────────────────────────────────

function groupItemsBySection(
  items: ChecklistItem[],
): { section: string; key: string; items: ChecklistItem[] }[] {
  const groups: Record<string, ChecklistItem[]> = {};
  const order: string[] = [];

  for (const item of items) {
    const parts = item.id.split("-");
    const section = parts.length >= 3 ? parts[1] : "general";
    if (!groups[section]) {
      groups[section] = [];
      order.push(section);
    }
    groups[section].push(item);
  }

  const sectionLabels: Record<string, string> = {
    couple: "Couple Alignment",
    family: "Family Coordination",
    budget: "Budget Architecture",
    date: "Date & Muhurat",
    brand: "Wedding Brand",
    digital: "Digital Presence",
    venue: "Venue Selection",
    accom: "Accommodation",
    priest: "Officiant",
    photo: "Photography & Videography",
    bwar: "Bride's Wardrobe",
    bjew: "Bride's Jewelry",
    beau: "Bride's Beauty",
    gwar: "Groom's Wardrobe",
    gjew: "Groom's Accessories",
    fam: "Family & Party Attire",
    style: "Guest Style Guide",
    cater: "Catering",
    bar: "Bar & Beverage",
    decor: "Decor & Florals",
    light: "Lighting & Production",
    music: "Music & Entertainment",
    trans: "Transportation",
    std: "Save-the-Dates",
    inv: "Invitations",
    dop: "Day-Of Paper",
    wb: "Welcome Bags",
    guest: "Guest List",
    rsvp: "RSVP Tracking",
    seat: "Seating",
    comm: "Guest Communication",
    cer: "Wedding Ceremony",
    mehndi: "Mehndi Ceremony",
    sang: "Sangeet",
    haldi: "Haldi",
    recep: "Reception",
    gift: "Gifts to Give",
    favor: "Guest Favors",
    reg: "Registry",
    legal: "Legal & Documents",
    honey: "Honeymoon",
    w4: "Week 4",
    w3: "Week 3",
    w2: "Week 2",
    w1: "Week 1",
    welcome: "Welcome Day",
    puja: "Ganesh Puja",
    wed: "Wedding Day",
    post: "Post-Wedding",
  };

  return order.map((section) => ({
    section:
      sectionLabels[section] ||
      SUBSECTION_LABELS[section] ||
      section.charAt(0).toUpperCase() + section.slice(1),
    key: section,
    items: groups[section],
  }));
}

// ── Inline Task Composer ────────────────────────────────────────────────────
// The fast path for "+ Add task". Lives at the bottom of a subsection and
// stays open after a save so couples can rattle off several tasks back-to-back
// — pressing Enter commits, the row collapses into a real task, and a fresh
// composer re-opens below. Esc or a blank title closes it.

const PRIORITY_CYCLE: Priority[] = ["medium", "high", "critical", "low"];

function InlineTaskComposer({
  phaseId,
  subsectionKey,
  members,
  onCancel,
  onCreated,
  autoFocus = true,
}: {
  phaseId: string;
  subsectionKey: string;
  members: Member[];
  onCancel: () => void;
  onCreated: (item: ChecklistItem) => void;
  autoFocus?: boolean;
}) {
  const addCustomItem = useChecklistStore((s) => s.addCustomItem);

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState<string>("");
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [assignOpen, setAssignOpen] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const assignAnchorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (autoFocus) titleRef.current?.focus();
  }, [autoFocus]);

  const commit = useCallback(() => {
    const trimmed = title.trim();
    if (!trimmed) return false;
    const created = addCustomItem({
      phase_id: phaseId,
      subsection: subsectionKey,
      title: trimmed,
      priority,
      due_date: dueDate || null,
      assignee_ids: assigneeIds,
    });
    onCreated(created);
    setTitle("");
    setPriority("medium");
    setDueDate("");
    setAssigneeIds([]);
    titleRef.current?.focus();
    return true;
  }, [
    title,
    priority,
    dueDate,
    assigneeIds,
    phaseId,
    subsectionKey,
    addCustomItem,
    onCreated,
  ]);

  const assignees = assigneeIds
    .map((id) => members.find((m) => m.id === id))
    .filter(Boolean) as Member[];

  return (
    <div
      className="mx-1 mt-1 flex items-center gap-3 rounded-lg border border-gold/20 bg-ivory-warm/40 px-4 py-2.5 shadow-[0_1px_3px_rgba(184,134,11,0.06)]"
      role="form"
      aria-label="Add task"
    >
      {/* Leading dot echoing the checkbox spacing */}
      <div className="h-4 w-4 shrink-0 rounded-full border border-dashed border-ink-faint/40" />

      <input
        ref={titleRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          } else if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
          }
        }}
        placeholder="What needs to get done?"
        className="flex-1 bg-transparent font-serif text-[14.5px] leading-snug tracking-tight text-ink outline-none placeholder:text-ink-faint/60"
        aria-label="Task title"
      />

      {/* Priority dot selector — click to cycle */}
      <button
        type="button"
        onClick={() =>
          setPriority(
            PRIORITY_CYCLE[
              (PRIORITY_CYCLE.indexOf(priority) + 1) % PRIORITY_CYCLE.length
            ],
          )
        }
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-ivory-warm"
        title={`Priority: ${PRIORITY_LABELS[priority]} — click to cycle`}
        aria-label={`Priority ${PRIORITY_LABELS[priority]}`}
      >
        <span
          className={cn("h-2 w-2 rounded-full", PRIORITY_DOT[priority])}
        />
      </button>

      {/* Inline due date */}
      <label
        className={cn(
          "flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-[11px] transition-colors hover:bg-ivory-warm",
          dueDate ? "text-ink-muted" : "text-ink-faint",
        )}
        title="Due date"
      >
        <Calendar size={11} strokeWidth={1.6} />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="bg-transparent outline-none font-mono text-[11px] tabular-nums"
          aria-label="Due date"
        />
      </label>

      {/* Assignees */}
      <span ref={assignAnchorRef} className="shrink-0">
        {assignees.length > 0 ? (
          <button
            type="button"
            onClick={() => setAssignOpen(true)}
            aria-label="Change assignees"
            className="rounded-full"
          >
            <AvatarStack members={assignees} max={3} size={20} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setAssignOpen(true)}
            className="flex items-center gap-1 rounded-full border border-dashed border-ink-faint/30 px-2 py-0.5 text-[10px] text-ink-faint transition-colors hover:border-gold/40 hover:bg-gold-pale/20 hover:text-gold"
            aria-label="Assign members"
          >
            <Plus size={9} strokeWidth={2} />
            Assign
          </button>
        )}
      </span>

      {assignOpen && (
        <AssignPopover
          members={members}
          assigneeIds={assigneeIds}
          onToggle={(memberId) =>
            setAssigneeIds((current) =>
              current.includes(memberId)
                ? current.filter((a) => a !== memberId)
                : [...current, memberId],
            )
          }
          onClose={() => setAssignOpen(false)}
          anchorRef={assignAnchorRef}
        />
      )}

      {/* Confirm */}
      <button
        type="button"
        onClick={commit}
        disabled={!title.trim()}
        className="flex shrink-0 items-center gap-1 rounded-md bg-ink px-2.5 py-1 text-[11px] font-medium text-ivory transition-opacity hover:opacity-90 disabled:opacity-30"
        aria-label="Add task"
      >
        <Check size={11} strokeWidth={2} /> Add
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="flex shrink-0 items-center justify-center rounded-md p-1 text-ink-faint transition-colors hover:bg-ivory-warm hover:text-ink-muted"
        aria-label="Cancel"
      >
        <X size={14} strokeWidth={1.5} />
      </button>
    </div>
  );
}

// ── New Task Slide-Over (detailed path) ────────────────────────────────────
// Opens from the right for users who want more than a one-liner: phase /
// subsection placement, description, assignees, visibility, dependencies,
// attachments. Mirrors the existing DetailPanel's right-edge aesthetic so it
// feels like the same surface the checklist already uses.

const NEW_SUBSECTION_KEY = "__new__";

interface NewTaskPanelDefaults {
  phaseId?: string;
  subsection?: string;
}

function NewTaskSlideOver({
  open,
  onClose,
  defaults,
  phases,
  items,
  members,
}: {
  open: boolean;
  onClose: () => void;
  defaults: NewTaskPanelDefaults;
  phases: Phase[];
  items: ChecklistItem[];
  members: Member[];
}) {
  const addCustomItem = useChecklistStore((s) => s.addCustomItem);

  const [phaseId, setPhaseId] = useState<string>(
    defaults.phaseId ?? phases[0]?.id ?? "phase-0",
  );
  const [subsectionKey, setSubsectionKey] = useState<string>(
    defaults.subsection ?? "",
  );
  const [newSubsectionLabel, setNewSubsectionLabel] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState<string>("");
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [visibilityScope, setVisibilityScope] = useState<
    "everyone" | "selected"
  >("everyone");
  const [visibleIds, setVisibleIds] = useState<string[]>([]);
  const [dependencies, setDependencies] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [attachmentDraft, setAttachmentDraft] = useState("");
  const [vendorCategory, setVendorCategory] = useState<
    WorkspaceCategoryTag | ""
  >("");

  const titleInputRef = useRef<HTMLInputElement>(null);

  // Reset when panel opens
  useEffect(() => {
    if (!open) return;
    setPhaseId(defaults.phaseId ?? phases[0]?.id ?? "phase-0");
    setSubsectionKey(defaults.subsection ?? "");
    setNewSubsectionLabel("");
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate("");
    setAssigneeIds([]);
    setVisibilityScope("everyone");
    setVisibleIds([]);
    setDependencies([]);
    setAttachments([]);
    setAttachmentDraft("");
    setVendorCategory("");
    requestAnimationFrame(() => titleInputRef.current?.focus());
  }, [open, defaults.phaseId, defaults.subsection, phases]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const phaseSubsections = useMemo(
    () => subsectionsForPhase(phaseId, items),
    [phaseId, items],
  );

  const phaseItems = useMemo(
    () => items.filter((i) => i.phase_id === phaseId),
    [items, phaseId],
  );

  const effectiveSubsection = useMemo(() => {
    if (subsectionKey === NEW_SUBSECTION_KEY) {
      const trimmed = newSubsectionLabel.trim();
      if (!trimmed) return "";
      // Section key derivation: lowercase, alphanumeric, first 12 chars.
      return trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 12);
    }
    return subsectionKey;
  }, [subsectionKey, newSubsectionLabel]);

  const canSave =
    title.trim().length > 0 &&
    phaseId.length > 0 &&
    (subsectionKey === NEW_SUBSECTION_KEY
      ? newSubsectionLabel.trim().length > 0
      : subsectionKey.length > 0);

  const submit = useCallback(
    (addAnother: boolean) => {
      if (!canSave) return;
      addCustomItem({
        phase_id: phaseId,
        subsection: effectiveSubsection,
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_date: dueDate || null,
        assignee_ids: assigneeIds,
        visible_to_ids:
          visibilityScope === "selected" ? visibleIds : undefined,
        dependencies,
        attachments,
        category_tags: vendorCategory ? [vendorCategory] : undefined,
      });
      if (addAnother) {
        setTitle("");
        setDescription("");
        setDueDate("");
        setAttachments([]);
        setAttachmentDraft("");
        setDependencies([]);
        requestAnimationFrame(() => titleInputRef.current?.focus());
      } else {
        onClose();
      }
    },
    [
      canSave,
      addCustomItem,
      phaseId,
      effectiveSubsection,
      title,
      description,
      priority,
      dueDate,
      assigneeIds,
      visibilityScope,
      visibleIds,
      dependencies,
      attachments,
      vendorCategory,
      onClose,
    ],
  );

  const toggleId = (list: string[], id: string) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-ink/20"
            aria-hidden="true"
          />
          {/* Panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.32, ease: PANEL_EASE }}
            className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-md flex-col border-l border-border bg-white shadow-xl"
            role="dialog"
            aria-label="New task"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                  New task
                </p>
                <h2 className="font-serif text-xl font-bold tracking-tight text-ink">
                  Add to checklist
                </h2>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-ivory-warm hover:text-ink-muted"
                aria-label="Close"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
                  Task <span className="text-rose">*</span>
                </label>
                <input
                  ref={titleInputRef}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to get done?"
                  className="w-full rounded-md border border-border bg-ivory px-3 py-2 font-serif text-[15px] leading-snug text-ink outline-none placeholder:text-ink-faint/50 transition-colors hover:border-ink-faint/40 focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/20"
                  aria-label="Task title"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
                  Notes
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Any context or detail…"
                  className="w-full resize-none rounded-md border border-border bg-ivory px-3 py-2 text-[13px] leading-relaxed text-ink-soft outline-none placeholder:text-ink-faint/50 transition-colors hover:border-ink-faint/40 focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/20"
                />
              </div>

              {/* Phase + Subsection */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
                    Phase
                  </label>
                  <select
                    value={phaseId}
                    onChange={(e) => {
                      setPhaseId(e.target.value);
                      setSubsectionKey("");
                    }}
                    className="w-full appearance-none rounded-md border border-border bg-ivory px-3 py-2 text-[13px] text-ink-muted outline-none transition-colors hover:border-ink-faint/50 focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/20"
                  >
                    {phases.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
                    Subsection <span className="text-rose">*</span>
                  </label>
                  <select
                    value={subsectionKey}
                    onChange={(e) => setSubsectionKey(e.target.value)}
                    className="w-full appearance-none rounded-md border border-border bg-ivory px-3 py-2 text-[13px] text-ink-muted outline-none transition-colors hover:border-ink-faint/50 focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/20"
                  >
                    <option value="">Choose…</option>
                    {phaseSubsections.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.label}
                      </option>
                    ))}
                    <option value={NEW_SUBSECTION_KEY}>+ Create new subsection</option>
                  </select>
                </div>
              </div>

              {subsectionKey === NEW_SUBSECTION_KEY && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
                    New subsection name <span className="text-rose">*</span>
                  </label>
                  <input
                    value={newSubsectionLabel}
                    onChange={(e) => setNewSubsectionLabel(e.target.value)}
                    placeholder="e.g. Family Logistics"
                    className="w-full rounded-md border border-border bg-ivory px-3 py-2 text-[13px] text-ink outline-none placeholder:text-ink-faint/50 transition-colors hover:border-ink-faint/40 focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/20"
                  />
                  <p className="text-[10px] text-ink-faint">
                    Appears in {phases.find((p) => p.id === phaseId)?.title}
                  </p>
                </div>
              )}

              {/* Due + Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
                    Due date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-md border border-border bg-ivory px-3 py-2 font-mono text-[12px] tabular-nums text-ink-muted outline-none transition-colors hover:border-ink-faint/50 focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
                    Priority
                  </label>
                  <div className="flex items-center gap-1.5">
                    {(
                      [
                        { v: "critical" as Priority, label: "Critical" },
                        { v: "high" as Priority, label: "High" },
                        { v: "medium" as Priority, label: "Medium" },
                        { v: "low" as Priority, label: "Low" },
                      ] as const
                    ).map(({ v, label }) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setPriority(v)}
                        className={cn(
                          "flex flex-1 items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-[11px] font-medium transition-colors",
                          priority === v
                            ? "border-gold/50 bg-gold-pale/40 text-ink"
                            : "border-border bg-ivory text-ink-faint hover:border-ink-faint/50 hover:text-ink-muted",
                        )}
                        aria-pressed={priority === v}
                      >
                        <span
                          className={cn("h-1.5 w-1.5 rounded-full", PRIORITY_DOT[v])}
                        />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Vendor category */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
                  Vendor category
                </label>
                <select
                  value={vendorCategory}
                  onChange={(e) =>
                    setVendorCategory(
                      e.target.value as WorkspaceCategoryTag | "",
                    )
                  }
                  className="w-full appearance-none rounded-md border border-border bg-ivory px-3 py-2 text-[13px] text-ink-muted outline-none transition-colors hover:border-ink-faint/50 focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/20"
                  aria-label="Vendor category"
                >
                  <option value="">None</option>
                  {CATEGORY_TAG_META.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignees */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
                  Assignees
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {members.map((m) => {
                    const active = assigneeIds.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() =>
                          setAssigneeIds((cur) => toggleId(cur, m.id))
                        }
                        className={cn(
                          "flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] transition-colors",
                          active
                            ? "border-gold/40 bg-gold-pale/40 text-ink"
                            : "border-border text-ink-faint hover:border-ink-faint/50 hover:text-ink-muted",
                        )}
                        aria-pressed={active}
                      >
                        <Avatar member={m} size={16} />
                        {m.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Visibility */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
                  Visibility
                </label>
                <div className="flex gap-1.5">
                  {(
                    [
                      { v: "everyone", label: "Everyone on the team" },
                      { v: "selected", label: "Selected people" },
                    ] as const
                  ).map(({ v, label }) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setVisibilityScope(v)}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-[11px] font-medium transition-colors",
                        visibilityScope === v
                          ? "border-gold/50 bg-gold-pale/40 text-ink"
                          : "border-border bg-ivory text-ink-faint hover:border-ink-faint/50 hover:text-ink-muted",
                      )}
                      aria-pressed={visibilityScope === v}
                    >
                      <Eye size={11} strokeWidth={1.6} />
                      {label}
                    </button>
                  ))}
                </div>
                {visibilityScope === "selected" && (
                  <div className="flex flex-wrap gap-1.5 rounded-md border border-dashed border-border p-2">
                    {members.map((m) => {
                      const active = visibleIds.includes(m.id);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() =>
                            setVisibleIds((cur) => toggleId(cur, m.id))
                          }
                          className={cn(
                            "flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] transition-colors",
                            active
                              ? "border-gold/40 bg-gold-pale/40 text-ink"
                              : "border-border text-ink-faint hover:border-ink-faint/50 hover:text-ink-muted",
                          )}
                          aria-pressed={active}
                        >
                          <Avatar member={m} size={16} />
                          {m.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Dependencies */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
                  Blocked by
                </label>
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      setDependencies((cur) =>
                        cur.includes(e.target.value) ? cur : [...cur, e.target.value],
                      );
                    }
                  }}
                  className="w-full appearance-none rounded-md border border-border bg-ivory px-3 py-2 text-[12px] text-ink-muted outline-none transition-colors hover:border-ink-faint/50 focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/20"
                >
                  <option value="">Link a blocker…</option>
                  {phaseItems.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.title}
                    </option>
                  ))}
                </select>
                {dependencies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {dependencies.map((depId) => {
                      const dep = items.find((x) => x.id === depId);
                      return (
                        <span
                          key={depId}
                          className="flex items-center gap-1 rounded-md border border-border bg-ivory px-2 py-0.5 text-[11px] text-ink-muted"
                        >
                          {dep?.title ?? depId}
                          <button
                            type="button"
                            onClick={() =>
                              setDependencies((cur) =>
                                cur.filter((x) => x !== depId),
                              )
                            }
                            className="text-ink-faint hover:text-ink-muted"
                            aria-label={`Remove ${dep?.title ?? depId}`}
                          >
                            <X size={10} strokeWidth={2} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Attachments (link-based, no upload backend wired) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
                  Attachments
                </label>
                <div className="flex gap-2">
                  <input
                    value={attachmentDraft}
                    onChange={(e) => setAttachmentDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && attachmentDraft.trim()) {
                        e.preventDefault();
                        setAttachments((cur) => [...cur, attachmentDraft.trim()]);
                        setAttachmentDraft("");
                      }
                    }}
                    placeholder="Paste a link to a doc, image, or file"
                    className="flex-1 rounded-md border border-border bg-ivory px-3 py-1.5 text-[12px] text-ink outline-none placeholder:text-ink-faint/50 transition-colors hover:border-ink-faint/40 focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/20"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!attachmentDraft.trim()) return;
                      setAttachments((cur) => [...cur, attachmentDraft.trim()]);
                      setAttachmentDraft("");
                    }}
                    className="rounded-md border border-border bg-ivory px-2 py-1.5 text-[11px] text-ink-muted transition-colors hover:border-ink-faint/50"
                    aria-label="Add attachment"
                  >
                    <Paperclip size={12} strokeWidth={1.6} />
                  </button>
                </div>
                {attachments.length > 0 && (
                  <ul className="space-y-1">
                    {attachments.map((url, i) => (
                      <li
                        key={`${url}-${i}`}
                        className="flex items-center justify-between gap-2 rounded-md border border-border bg-ivory px-2 py-1 text-[11px] text-ink-muted"
                      >
                        <span className="truncate">{url}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setAttachments((cur) =>
                              cur.filter((_, idx) => idx !== i),
                            )
                          }
                          className="text-ink-faint hover:text-ink-muted"
                          aria-label="Remove attachment"
                        >
                          <X size={10} strokeWidth={2} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-2 border-t border-border px-6 py-3.5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md px-3 py-1.5 text-[12px] text-ink-faint transition-colors hover:text-ink-muted"
              >
                Cancel
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => submit(true)}
                  disabled={!canSave}
                  className="rounded-md border border-gold/40 px-3 py-1.5 text-[12px] font-medium text-gold transition-colors hover:bg-gold-pale/30 disabled:opacity-40"
                >
                  Save & add another
                </button>
                <button
                  type="button"
                  onClick={() => submit(false)}
                  disabled={!canSave}
                  className="rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  Save
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Section Component ───────────────────────────────────────────────────────

function Section({
  title,
  subsectionKey,
  phaseId,
  items,
  selectedItemId,
  onToggle,
  onSelect,
  members,
  onToggleAssignee,
  showSourceTag,
  composerOpen,
  onOpenComposer,
  onCloseComposer,
}: {
  title: string;
  subsectionKey: string;
  phaseId: string;
  items: ChecklistItem[];
  selectedItemId: string | null;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  members: Member[];
  onToggleAssignee: (itemId: string, memberId: string) => void;
  showSourceTag: boolean;
  composerOpen: boolean;
  onOpenComposer: () => void;
  onCloseComposer: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const done = items.filter((i) => i.status === "done").length;
  const total = items.length;

  return (
    <div className="mb-2" data-subsection-key={subsectionKey}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="group flex w-full items-center gap-2 rounded-md px-2 py-2 text-left transition-colors hover:bg-ivory-warm/40"
        aria-expanded={expanded}
      >
        {expanded ? (
          <ChevronDown
            size={14}
            className="shrink-0 text-ink-faint transition-transform"
          />
        ) : (
          <ChevronRight
            size={14}
            className="shrink-0 text-ink-faint transition-transform"
          />
        )}
        <span className="text-[11px] font-semibold uppercase tracking-widest text-ink-muted">
          {title}
        </span>
        <span className="font-mono text-[10px] tabular-nums text-ink-faint">
          {done}/{total}
        </span>
        {done === total && total > 0 && (
          <Check size={12} className="text-sage" strokeWidth={2.5} />
        )}
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: PANEL_EASE }}
            className="ml-1 overflow-hidden"
          >
            {items.map((item) => (
              <ChecklistItemRow
                key={item.id}
                item={item}
                isSelected={item.id === selectedItemId}
                onToggle={() => onToggle(item.id)}
                onSelect={() => onSelect(item.id)}
                members={members}
                onToggleAssignee={onToggleAssignee}
                showSourceTag={showSourceTag}
              />
            ))}

            {composerOpen ? (
              <InlineTaskComposer
                phaseId={phaseId}
                subsectionKey={subsectionKey}
                members={members}
                onCancel={onCloseComposer}
                onCreated={() => {
                  /* composer stays open for rapid entry */
                }}
              />
            ) : (
              <button
                type="button"
                onClick={onOpenComposer}
                className="mx-1 mt-1 flex w-[calc(100%-0.5rem)] items-center gap-2 rounded-md px-4 py-2 text-[12px] font-medium text-ink-faint/70 transition-all duration-200 hover:bg-gold-pale/20 hover:text-gold"
                aria-label={`Add task to ${title}`}
              >
                <Plus
                  size={12}
                  strokeWidth={1.8}
                  className="opacity-60 transition-opacity group-hover:opacity-100"
                />
                <span>Add task</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Filter Bar ──────────────────────────────────────────────────────────────

interface Filters {
  status: ItemStatus | "all";
  priority: Priority | "all";
  assigned: string | "all"; // member id or "all"
  search: string;
  vendorCategory: WorkspaceCategoryTag | "all";
}

const DEFAULT_FILTERS: Filters = {
  status: "all",
  priority: "all",
  assigned: "all",
  search: "",
  vendorCategory: "all",
};

function FilterBar({
  filters,
  members,
  onChange,
}: {
  filters: Filters;
  members: Member[];
  onChange: (f: Filters) => void;
}) {
  const selectClass =
    "appearance-none rounded-md border border-border bg-ivory px-2.5 py-1.5 text-[12px] text-ink-muted outline-none transition-colors hover:border-ink-faint/50 focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/20";

  return (
    <div className="flex flex-wrap items-center gap-2.5" role="search">
      {/* Search */}
      <div className="relative flex-1 min-w-[180px] max-w-xs">
        <Search
          size={13}
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint"
          aria-hidden="true"
        />
        <input
          type="text"
          placeholder="Search items..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full rounded-md border border-border bg-ivory py-1.5 pl-8 pr-3 text-[12px] text-ink placeholder:text-ink-faint/60 outline-none transition-colors hover:border-ink-faint/50 focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/20"
          aria-label="Search checklist items"
        />
      </div>

      {/* Status */}
      <select
        value={filters.status}
        onChange={(e) =>
          onChange({ ...filters, status: e.target.value as Filters["status"] })
        }
        className={selectClass}
        aria-label="Filter by status"
      >
        <option value="all">All statuses</option>
        <option value="not_started">To do</option>
        <option value="in_progress">In progress</option>
        <option value="done">Done</option>
        <option value="blocked">Blocked</option>
        <option value="not_applicable">N/A</option>
      </select>

      {/* Priority */}
      <select
        value={filters.priority}
        onChange={(e) =>
          onChange({
            ...filters,
            priority: e.target.value as Filters["priority"],
          })
        }
        className={selectClass}
        aria-label="Filter by priority"
      >
        <option value="all">All priorities</option>
        <option value="critical">Critical</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      {/* Assigned */}
      <AssigneeFilter
        value={filters.assigned}
        members={members}
        onChange={(assigned) => onChange({ ...filters, assigned })}
      />

      {/* Vendor category */}
      <select
        value={filters.vendorCategory}
        onChange={(e) =>
          onChange({
            ...filters,
            vendorCategory: e.target.value as Filters["vendorCategory"],
          })
        }
        className={selectClass}
        aria-label="Filter by vendor category"
      >
        <option value="all">All categories</option>
        {CATEGORY_TAG_META.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.label}
          </option>
        ))}
      </select>

      {/* Clear filters */}
      {(filters.status !== "all" ||
        filters.priority !== "all" ||
        filters.assigned !== "all" ||
        filters.vendorCategory !== "all" ||
        filters.search !== "") && (
        <button
          onClick={() => onChange(DEFAULT_FILTERS)}
          className="flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px] text-ink-faint transition-colors hover:text-ink-muted"
          aria-label="Clear all filters"
        >
          <X size={11} />
          Clear
        </button>
      )}
    </div>
  );
}

function applyFilters(
  items: ChecklistItem[],
  filters: Filters,
): ChecklistItem[] {
  let result = items;

  if (filters.status !== "all") {
    result = result.filter((i) => i.status === filters.status);
  }
  if (filters.priority !== "all") {
    result = result.filter((i) => i.priority === filters.priority);
  }
  if (filters.assigned !== "all") {
    result = result.filter((i) =>
      (i.assignee_ids ?? []).includes(filters.assigned),
    );
  }
  if (filters.vendorCategory !== "all") {
    result = result.filter((i) =>
      (i.category_tags ?? []).includes(filters.vendorCategory as WorkspaceCategoryTag),
    );
  }
  if (filters.search.trim()) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q),
    );
  }

  return result;
}

// ── Saved Indicator ────────────────────────────────────────────────────────

function SavedIndicator({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="saved-indicator ml-2 text-[10px] font-medium text-sage">
      Saved
    </span>
  );
}

// ── Inline Editable Title ──────────────────────────────────────────────────

function EditableTitle({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onChange(trimmed);
    else setDraft(value);
  };

  if (!editing) {
    return (
      <h2
        onClick={() => setEditing(true)}
        className="cursor-text font-serif text-2xl font-medium leading-tight tracking-tight text-ink hover:text-ink-soft"
        title="Click to edit"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setEditing(true);
          }
        }}
      >
        {value}
      </h2>
    );
  }

  return (
    <input
      ref={inputRef}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") {
          setDraft(value);
          setEditing(false);
        }
      }}
      className="w-full bg-transparent font-serif text-2xl font-medium leading-tight tracking-tight text-ink outline-none border-b border-gold/30 focus:border-gold/60 pb-0.5"
      aria-label="Edit title"
    />
  );
}

// ── Inline Selector ────────────────────────────────────────────────────────

function InlineSelect<T extends string>({
  value,
  options,
  labels,
  onChange,
  icon: Icon,
  colors,
}: {
  value: T;
  options: T[];
  labels: Record<T, string>;
  onChange: (v: T) => void;
  icon?: React.ElementType;
  colors?: Record<T, string>;
}) {
  return (
    <div className="relative inline-flex items-center gap-1">
      {Icon && (
        <Icon
          size={12}
          strokeWidth={1.5}
          className={cn("shrink-0", colors?.[value] || "text-ink-faint")}
        />
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={cn(
          "appearance-none bg-transparent text-[12px] font-medium outline-none cursor-pointer pr-3",
          "hover:text-ink transition-colors",
          colors?.[value] || "text-ink-muted",
        )}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {labels[opt]}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Decision Field Renderer ────────────────────────────────────────────────

function DecisionFieldInput({
  field,
  onSave,
}: {
  field: DecisionField;
  onSave: (value: DecisionField["value"]) => void;
}) {
  const [saved, setSaved] = useState(false);

  const handleSave = (value: DecisionField["value"]) => {
    onSave(value);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const baseInputClass =
    "w-full rounded-md border border-border bg-ivory px-3 py-2 text-[13px] text-ink outline-none transition-colors hover:border-ink-faint/40 focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/20";

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <label className="text-[12px] font-medium text-ink-muted">
          {field.label}
          {field.required && <span className="ml-0.5 text-rose">*</span>}
        </label>
        <SavedIndicator show={saved} />
      </div>
      {field.helper_text && (
        <p className="text-[11px] text-ink-faint italic">{field.helper_text}</p>
      )}

      {/* Text */}
      {field.type === "text" && (
        <input
          type="text"
          defaultValue={(field.value as string) ?? ""}
          onBlur={(e) => handleSave(e.target.value)}
          className={baseInputClass}
          placeholder={`Enter ${field.label.toLowerCase()}…`}
        />
      )}

      {/* URL */}
      {field.type === "url" && (
        <input
          type="url"
          defaultValue={(field.value as string) ?? ""}
          onBlur={(e) => handleSave(e.target.value)}
          className={baseInputClass}
          placeholder="https://…"
        />
      )}

      {/* Textarea */}
      {field.type === "textarea" && (
        <textarea
          defaultValue={(field.value as string) ?? ""}
          onBlur={(e) => handleSave(e.target.value)}
          rows={3}
          className={cn(baseInputClass, "resize-none")}
          placeholder={`Enter ${field.label.toLowerCase()}…`}
        />
      )}

      {/* Select */}
      {field.type === "select" && (
        <select
          defaultValue={(field.value as string) ?? ""}
          onChange={(e) => handleSave(e.target.value)}
          className={cn(baseInputClass, "cursor-pointer")}
        >
          <option value="">Select…</option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}

      {/* Multiselect (checkboxes) */}
      {field.type === "multiselect" && (
        <div className="flex flex-wrap gap-1.5">
          {field.options?.map((opt) => {
            const selected =
              Array.isArray(field.value) && field.value.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  const current = Array.isArray(field.value)
                    ? field.value
                    : [];
                  const next = selected
                    ? current.filter((v) => v !== opt)
                    : [...current, opt];
                  handleSave(next);
                }}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all duration-200",
                  selected
                    ? "border-gold/40 bg-gold-pale/50 text-gold shadow-[0_0_0_1px_rgba(184,134,11,0.1)]"
                    : "border-border text-ink-faint hover:border-ink-faint/40 hover:text-ink-muted",
                )}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {/* Date */}
      {field.type === "date" && (
        <input
          type="date"
          defaultValue={(field.value as string) ?? ""}
          onChange={(e) => handleSave(e.target.value)}
          className={cn(baseInputClass, "cursor-pointer")}
        />
      )}

      {/* Currency */}
      {field.type === "currency" && (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-ink-faint">
            ₹
          </span>
          <input
            type="number"
            defaultValue={(field.value as number) ?? ""}
            onBlur={(e) =>
              handleSave(e.target.value ? Number(e.target.value) : null)
            }
            className={cn(baseInputClass, "pl-7")}
            placeholder="0"
          />
        </div>
      )}

      {/* File upload / Image upload */}
      {(field.type === "file_upload" || field.type === "image_upload") && (
        <div className="flex items-center justify-center rounded-md border border-dashed border-border py-6 text-[12px] text-ink-faint italic">
          {field.type === "image_upload" ? "Image" : "File"} upload available on Pro
        </div>
      )}

      {/* Vendor picker */}
      {field.type === "vendor_picker" && (
        <div className="flex items-center justify-center rounded-md border border-dashed border-border py-6 text-[12px] text-ink-faint italic">
          Link a vendor from your Marketplace bookmarks
        </div>
      )}
    </div>
  );
}

// ── Generic Pop-Out Panel ──────────────────────────────────────────────────

function GenericPopOut({
  item,
  phase,
  onClose,
  onNavigate,
}: {
  item: ChecklistItem;
  phase: Phase;
  onClose: () => void;
  onNavigate: (itemId: string) => void;
}) {
  const updateItem = useChecklistStore((s) => s.updateItem);
  const updateDecisionField = useChecklistStore((s) => s.updateDecisionField);
  const toggleItemStatus = useChecklistStore((s) => s.toggleItemStatus);
  const getItemById = useChecklistStore((s) => s.getItemById);
  const deleteItem = useChecklistStore((s) => s.deleteItem);
  const resetTemplateItem = useChecklistStore((s) => s.resetTemplateItem);
  const items = useChecklistStore((s) => s.items);
  const members = useChecklistStore((s) => s.members);
  const toggleAssignee = useChecklistStore((s) => s.toggleAssignee);

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [shimmer, setShimmer] = useState(false);
  const [descSaved, setDescSaved] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Member assignment
  const assignAnchorRef = useRef<HTMLSpanElement>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const assigneeIds = item.assignee_ids ?? [];
  const assignees = useMemo(() => {
    const memberMap: Record<string, Member> = {};
    for (const m of members) memberMap[m.id] = m;
    return assigneeIds.map((id) => memberMap[id]).filter(Boolean) as Member[];
  }, [members, assigneeIds]);

  // Mark done with shimmer
  const markDone = useCallback(() => {
    if (item.status !== "done") {
      updateItem(item.id, { status: "done" });
      setShimmer(true);
      setTimeout(() => setShimmer(false), 1200);
    }
  }, [item.id, item.status, updateItem]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "Enter") {
        e.preventDefault();
        markDone();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, markDone]);

  // Focus trap
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusable = panel.querySelectorAll(focusableSelector);
      if (focusable.length === 0) return;

      const first = focusable[0] as HTMLElement;
      const last = focusable[focusable.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    panel.addEventListener("keydown", handleTab);

    // Focus first focusable element on mount
    const firstFocusable = panel.querySelector(
      focusableSelector,
    ) as HTMLElement;
    firstFocusable?.focus();

    return () => panel.removeEventListener("keydown", handleTab);
  }, [item.id]);

  // Dependency items
  const dependsOn = item.dependencies
    .map((depId) => getItemById(depId))
    .filter(Boolean) as ChecklistItem[];
  const dependedBy = items.filter((i) => i.dependencies.includes(item.id));

  const statusColors: Record<ItemStatus, string> = {
    not_started: "text-ink-faint",
    in_progress: "text-amber-600",
    done: "text-sage",
    blocked: "text-rose",
    not_applicable: "text-ink-faint",
  };

  return (
    <div ref={panelRef} className="flex h-full flex-col" role="dialog" aria-label={item.title}>
      {/* ── Header: breadcrumb, close, more ── */}
      <div className="flex items-center justify-between border-b border-border px-6 py-3.5">
        <div className="flex items-center gap-1.5 text-[12px] text-ink-faint">
          <span className="hover:text-ink-muted transition-colors">
            {phase.title}
          </span>
          <ChevronRight size={11} className="text-ink-faint/50" />
          <span className="text-ink-muted font-medium truncate max-w-[180px]">
            {item.title}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {/* More menu */}
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-ivory-warm hover:text-ink-muted"
              aria-label="More options"
              aria-expanded={showMoreMenu}
            >
              <MoreHorizontal size={15} strokeWidth={1.5} />
            </button>
            {showMoreMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMoreMenu(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-border bg-white py-1 shadow-lg popover-enter">
                  <button
                    onClick={() => {
                      toggleItemStatus(item.id);
                      setShowMoreMenu(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-[12px] text-ink-muted hover:bg-ivory-warm transition-colors"
                  >
                    <Circle size={13} /> Cycle status
                  </button>
                  <button
                    onClick={() => {
                      updateItem(item.id, { status: "not_applicable" });
                      setShowMoreMenu(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-[12px] text-ink-muted hover:bg-ivory-warm transition-colors"
                  >
                    <Minus size={13} /> Mark N/A
                  </button>
                  {item.source === "template" && item.template_modified && (
                    <button
                      onClick={() => {
                        resetTemplateItem(item.id);
                        setShowMoreMenu(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-[12px] text-ink-muted hover:bg-ivory-warm transition-colors"
                    >
                      <RotateCcw size={13} /> Reset to default
                    </button>
                  )}
                  {item.source === "custom" && (
                    <button
                      onClick={() => {
                        deleteItem(item.id);
                        setShowMoreMenu(false);
                        onClose();
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-[12px] text-rose hover:bg-rose-pale/40 transition-colors"
                    >
                      <Trash2 size={13} /> Delete task
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
          {/* Close */}
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-ivory-warm hover:text-ink-muted"
            aria-label="Close panel"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div
        className={cn(
          "panel-scroll flex-1 overflow-y-auto",
          shimmer && "gold-shimmer",
        )}
      >
        <div className="px-8 py-8 space-y-7">
          {/* Title */}
          <EditableTitle
            value={item.title}
            onChange={(title) => updateItem(item.id, { title })}
          />

          {/* Inline meta row */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {/* Status */}
            <InlineSelect
              value={item.status}
              options={
                [
                  "not_started",
                  "in_progress",
                  "done",
                  "blocked",
                  "not_applicable",
                ] as ItemStatus[]
              }
              labels={{
                not_started: "To do",
                in_progress: "In progress",
                done: "Done",
                blocked: "Blocked",
                not_applicable: "N/A",
              }}
              onChange={(status) => {
                updateItem(item.id, { status });
                if (status === "done") {
                  setShimmer(true);
                  setTimeout(() => setShimmer(false), 1200);
                }
              }}
              icon={STATUS_CONFIG[item.status].icon}
              colors={statusColors}
            />

            {/* Priority */}
            <InlineSelect
              value={item.priority}
              options={["critical", "high", "medium", "low"] as Priority[]}
              labels={{
                critical: "Critical",
                high: "High",
                medium: "Medium",
                low: "Low",
              }}
              onChange={(priority) => updateItem(item.id, { priority })}
            />

            {/* Deadline — auto-computed from wedding date, or manual override */}
            <DeadlineField item={item} />

            {/* Assigned — member picker */}
            {assignees.length > 0 ? (
              <span
                ref={assignAnchorRef}
                onClick={() => setAssignOpen(true)}
                className="cursor-pointer"
              >
                <AvatarStack members={assignees} max={3} size={22} />
              </span>
            ) : (
              <span ref={assignAnchorRef} className="inline-flex">
                <button
                  onClick={() => setAssignOpen(true)}
                  className="flex items-center gap-1 rounded-full border border-dashed border-ink-faint/30 px-2 py-0.5 text-[10px] text-ink-faint transition-all duration-200 hover:border-gold/40 hover:bg-gold-pale/20 hover:text-gold"
                  aria-label="Assign members"
                >
                  <Plus size={9} strokeWidth={2} />
                  Assign
                </button>
              </span>
            )}

            {assignOpen && (
              <AssignPopover
                members={members}
                assigneeIds={assigneeIds}
                onToggle={(memberId) => toggleAssignee(item.id, memberId)}
                onClose={() => setAssignOpen(false)}
                anchorRef={assignAnchorRef}
              />
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
                Description
              </span>
              <SavedIndicator show={descSaved} />
            </div>
            <textarea
              defaultValue={item.description}
              key={item.id + "-desc"}
              onBlur={(e) => {
                if (e.target.value !== item.description) {
                  updateItem(item.id, { description: e.target.value });
                  setDescSaved(true);
                  setTimeout(() => setDescSaved(false), 1800);
                }
              }}
              rows={3}
              className="w-full resize-none rounded-md bg-transparent text-[14px] leading-relaxed text-ink-soft outline-none placeholder:text-ink-faint/50 focus:bg-ivory-warm/30 transition-colors p-2 -ml-2"
              placeholder="Add a description…"
              aria-label="Description"
            />
          </div>

          {/* ── Gold rule ── */}
          <div className="h-px bg-gradient-to-r from-gold/40 via-gold/25 to-transparent" />

          {/* ── Decisions section ── */}
          {item.decision_fields.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
                Decisions
              </h3>
              <div className="space-y-5">
                {item.decision_fields.map((field) => (
                  <DecisionFieldInput
                    key={field.id}
                    field={field}
                    onSave={(value) =>
                      updateDecisionField(item.id, field.id, value)
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Dependencies section ── */}
          {(dependsOn.length > 0 || dependedBy.length > 0) && (
            <div className="space-y-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
                Dependencies
              </h3>

              {dependsOn.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[11px] text-ink-faint">Depends on:</p>
                  {dependsOn.map((dep) => (
                    <button
                      key={dep.id}
                      onClick={() => onNavigate(dep.id)}
                      className="group flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left transition-colors hover:bg-ivory-warm"
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full shrink-0",
                          dep.status === "done"
                            ? "bg-sage"
                            : "bg-ink-faint/30",
                        )}
                      />
                      <span
                        className={cn(
                          "text-[13px] group-hover:text-ink transition-colors",
                          dep.status === "done"
                            ? "text-ink-faint line-through"
                            : "text-ink-muted",
                        )}
                      >
                        {dep.title}
                      </span>
                      <ArrowRight
                        size={11}
                        className="ml-auto shrink-0 text-ink-faint/40 group-hover:text-ink-faint"
                      />
                    </button>
                  ))}
                </div>
              )}

              {dependedBy.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[11px] text-ink-faint">Blocks:</p>
                  {dependedBy.map((dep) => (
                    <button
                      key={dep.id}
                      onClick={() => onNavigate(dep.id)}
                      className="group flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left transition-colors hover:bg-ivory-warm"
                    >
                      <AlertTriangle
                        size={11}
                        className="shrink-0 text-amber-400"
                      />
                      <span className="text-[13px] text-ink-muted group-hover:text-ink transition-colors">
                        {dep.title}
                      </span>
                      <ArrowRight
                        size={11}
                        className="ml-auto shrink-0 text-ink-faint/40 group-hover:text-ink-faint"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}



          {/* ── Linked Module section ── */}
          {item.module_link && (
            <div className="space-y-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
                Linked Module
              </h3>
              <button className="flex items-center gap-2 rounded-lg border border-border px-4 py-3 text-[13px] font-medium text-ink-muted transition-all duration-200 hover:border-gold/30 hover:text-gold hover:shadow-[0_1px_4px_rgba(184,134,11,0.08)]">
                <ExternalLink size={14} strokeWidth={1.5} />
                Open in{" "}
                {item.module_link
                  .replace("/", "")
                  .replace(/^\w/, (c) => c.toUpperCase())}{" "}
                →
              </button>
            </div>
          )}

          {/* ── Notes section ── */}
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
                Notes
              </h3>
              <SavedIndicator show={notesSaved} />
            </div>
            <textarea
              defaultValue={item.notes}
              key={item.id + "-notes"}
              onBlur={(e) => {
                if (e.target.value !== item.notes) {
                  updateItem(item.id, { notes: e.target.value });
                  setNotesSaved(true);
                  setTimeout(() => setNotesSaved(false), 1800);
                }
              }}
              rows={4}
              className="w-full resize-none rounded-md border border-border bg-ivory px-3 py-2.5 text-[13px] leading-relaxed text-ink-soft outline-none placeholder:text-ink-faint/50 transition-colors hover:border-ink-faint/40 focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/20"
              placeholder="Add notes, thoughts, or context…"
              aria-label="Notes"
            />
          </div>

          {/* ── Attachments section ── */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
              Attachments
            </h3>
            <FileUploader entityId={item.id} />
            <FileGallery entityId={item.id} className="mt-3" />
          </div>

          {/* ── Activity section ── */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
              Activity
            </h3>

            {/* Journal — linked articles */}
            <JournalLinks itemId={item.id} />

            {/* Comments */}
            <CommentThread entityType="item" entityId={item.id} />
          </div>
        </div>

        {/* Keyboard hint */}
        <div className="border-t border-border px-8 py-3 flex items-center gap-4 text-[10px] text-ink-faint/60">
          <span>
            <kbd className="font-mono rounded border border-border bg-ivory-warm px-1 py-0.5">
              Esc
            </kbd>{" "}
            close
          </span>
          <span>
            <kbd className="font-mono rounded border border-border bg-ivory-warm px-1 py-0.5">
              ⌘↵
            </kbd>{" "}
            mark done
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Journal Links (article URL previews) ───────────────────────────────────

const EMPTY_LINKS: ArticleLink[] = [];

function JournalLinks({ itemId }: { itemId: string }) {
  const links = useArticleLinksStore(
    (s) => s.linksByEntity[itemId] ?? EMPTY_LINKS,
  );
  const addLink = useArticleLinksStore((s) => s.addLink);
  const removeLink = useArticleLinksStore((s) => s.removeLink);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/link-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Could not fetch preview");
      }
      const link: ArticleLink = {
        id: `al-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        url: data.url,
        title: data.title,
        description: data.description,
        image: data.image,
        domain: data.domain,
        favicon: data.favicon,
        added_at: new Date().toISOString(),
      };
      addLink(itemId, link);
      setUrl("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not fetch preview");
    } finally {
      setLoading(false);
    }
  }, [url, itemId, addLink]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-ink-muted" />
        <h4 className="font-serif text-sm font-semibold text-ink-soft tracking-wide">
          Journal
        </h4>
        {links.length > 0 && (
          <span className="text-[10px] text-ink-faint bg-ivory-deep rounded-full px-1.5 py-0.5">
            {links.length}
          </span>
        )}
      </div>

      {/* URL composer */}
      <div className="flex items-stretch gap-2">
        <div className="flex-1 flex items-center gap-2 rounded-md border border-border bg-ivory-warm/50 px-3 py-1.5 focus-within:border-gold/40 transition-colors">
          <LinkIcon size={12} className="shrink-0 text-ink-faint" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
            placeholder="Paste an article URL…"
            className="flex-1 bg-transparent text-[12.5px] text-ink-soft outline-none placeholder:text-ink-faint/60"
            disabled={loading}
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={loading || !url.trim()}
          className={cn(
            "text-xs font-medium px-3 rounded-md transition-colors",
            loading || !url.trim()
              ? "bg-ivory-deep text-ink-faint cursor-not-allowed"
              : "bg-gold text-ivory hover:bg-gold-light",
          )}
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : "Add"}
        </button>
      </div>
      {error && <p className="text-xs text-rose px-1">{error}</p>}

      {/* Links list */}
      {links.length > 0 ? (
        <div className="space-y-2">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 rounded-md border border-border bg-white px-3 py-2.5 transition-colors hover:border-gold/30 hover:bg-ivory-warm/40"
            >
              {link.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={link.image}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded object-cover"
                />
              ) : (
                <div className="h-12 w-12 shrink-0 rounded bg-ivory-warm flex items-center justify-center">
                  <BookOpen size={16} className="text-ink-faint/50" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="line-clamp-2 font-serif text-[13px] leading-snug text-ink">
                  {link.title}
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  {link.favicon && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={link.favicon}
                      alt=""
                      className="h-3 w-3 shrink-0 rounded-sm"
                    />
                  )}
                  <span className="truncate font-mono text-[10px] text-ink-muted">
                    {link.domain}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeLink(itemId, link.id);
                }}
                className="shrink-0 rounded-md p-1 text-ink-faint opacity-0 transition-colors group-hover:opacity-100 hover:bg-rose-pale hover:text-rose"
                aria-label="Remove article"
              >
                <Trash2 size={12} />
              </button>
            </a>
          ))}
        </div>
      ) : (
        <p className="text-xs text-ink-faint italic pl-6">
          No articles linked yet. Paste a URL above to save one.
        </p>
      )}
    </div>
  );
}

// ── Pop-Out Router ─────────────────────────────────────────────────────────

function PopOutRouter({
  item,
  phase,
  onClose,
  onNavigate,
}: {
  item: ChecklistItem;
  phase: Phase;
  onClose: () => void;
  onNavigate: (itemId: string) => void;
}) {
  const updateItem = useChecklistStore((s) => s.updateItem);
  const [devOverride, setDevOverride] = useState<DecisionTemplateName | null>(
    null,
  );

  const activeTemplate = devOverride ?? item.decision_template;
  const BespokeComponent = getTemplateComponent(activeTemplate);

  const handleUpdate = useCallback(
    (updates: Partial<ChecklistItem>) => updateItem(item.id, updates),
    [updateItem, item.id],
  );

  const isDev = process.env.NODE_ENV === "development";

  return (
    <>
      {/* Dev-mode template switcher */}
      {isDev && (
        <div className="absolute right-12 top-2.5 z-50">
          <select
            value={activeTemplate}
            onChange={(e) => {
              const val = e.target.value as DecisionTemplateName;
              setDevOverride(val === item.decision_template ? null : val);
            }}
            className="rounded border border-[var(--border)] bg-[var(--bg)] px-1.5 py-0.5 font-sans text-xs text-[var(--ink)]/60 outline-none hover:border-[var(--gold)] focus:border-[var(--gold)]"
            title="Dev: switch pop-out template"
          >
            <option value="generic">generic</option>
            {TEMPLATE_NAMES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex h-full flex-col">
        <div className="min-h-0 flex-1">
          {BespokeComponent ? (
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center text-sm text-[var(--ink)]/40">
                  Loading template&hellip;
                </div>
              }
            >
              <BespokeComponent
                item={item}
                onUpdate={handleUpdate}
                onClose={onClose}
              />
            </Suspense>
          ) : (
            <GenericPopOut
              item={item}
              phase={phase}
              onClose={onClose}
              onNavigate={onNavigate}
            />
          )}
        </div>
        <RelatedJournalPosts taskId={item.id} />
        <ShoppingDrawer taskId={item.id} module={phase.id} />
      </div>
    </>
  );
}

// ── Detail Panel (animated shell wrapping the router) ──────────────────────

function DetailPanel({
  item,
  phase,
  onClose,
  onNavigate,
}: {
  item: ChecklistItem;
  phase: Phase;
  onClose: () => void;
  onNavigate: (itemId: string) => void;
}) {
  return (
    <motion.aside
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.4, ease: PANEL_EASE }}
      className="flex w-[45vw] min-w-[360px] max-w-[600px] shrink-0 flex-col border-l border-border bg-white"
    >
      <PopOutRouter
        item={item}
        phase={phase}
        onClose={onClose}
        onNavigate={onNavigate}
      />
    </motion.aside>
  );
}

// ── Content Area (Phase view) ──────────────────────────────────────────────

function ContentArea({
  phase,
  phaseIndex,
  totalPhases,
  items,
  selectedItemId,
  onToggle,
  onSelect,
  members,
  onToggleAssignee,
  onOpenNewTaskPanel,
  openComposerSignal,
  onComposerHandled,
}: {
  phase: Phase;
  phaseIndex: number;
  totalPhases: number;
  items: ChecklistItem[];
  selectedItemId: string | null;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  members: Member[];
  onToggleAssignee: (itemId: string, memberId: string) => void;
  onOpenNewTaskPanel: (opts?: { phaseId?: string; subsection?: string }) => void;
  openComposerSignal: number;
  onComposerHandled: () => void;
}) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [showSource, setShowSource] = useState(false);
  const [activeComposer, setActiveComposer] = useState<string | null>(null);

  const filteredItems = useMemo(
    () => applyFilters(items, filters),
    [items, filters],
  );
  const sections = useMemo(
    () => groupItemsBySection(filteredItems),
    [filteredItems],
  );

  const done = items.filter((i) => i.status === "done").length;
  const total = items.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const hasActiveFilters =
    filters.status !== "all" ||
    filters.priority !== "all" ||
    filters.assigned !== "all" ||
    filters.search !== "";

  const weddingDate = useChecklistStore((s) => s.weddingDate);
  const allItems = useChecklistStore((s) => s.items);
  const allPhases = useChecklistStore((s) => s.phases);
  const addCustomItem = useChecklistStore((s) => s.addCustomItem);

  const smartContext = useMemo(
    () => buildSmartTaskContext(allPhases, allItems, members, weddingDate),
    [allPhases, allItems, members, weddingDate],
  );

  const handleSmartAdd = useCallback(
    (parsed: ParsedTask | ParsedTaskSuggestion) => {
      const payload = parsedTaskToCustomInput(parsed, phase.id);
      if (!payload) return;
      const created = addCustomItem(payload);
      onSelect(created.id);
    },
    [addCustomItem, onSelect, phase.id],
  );

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of items) {
      counts[item.status] = (counts[item.status] || 0) + 1;
    }
    return counts;
  }, [items]);

  const dueThisWeekCount = useMemo(
    () =>
      items.filter(
        (i) =>
          i.status !== "done" &&
          i.status !== "not_applicable" &&
          isItemThisWeek(i, weddingDate),
      ).length,
    [items, weddingDate],
  );

  useOpenVisibleComposer(
    openComposerSignal,
    sections,
    setActiveComposer,
    onComposerHandled,
    () => onOpenNewTaskPanel({ phaseId: phase.id }),
  );

  return (
    <main className="flex-1 overflow-y-auto" aria-label={`${phase.title} items`}>
      <div className="mx-auto max-w-3xl px-8 py-10">
        {/* Phase header */}
        <div className="mb-8">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-ink-faint">
            Phase {phaseIndex + 1} of {totalPhases}
          </p>
          <div className="flex items-baseline gap-3">
            <h2 className="font-serif text-3xl font-bold tracking-tight text-ink">
              {phase.title}
            </h2>
            {dueThisWeekCount > 0 && (
              <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                {dueThisWeekCount} due this week
              </span>
            )}
          </div>
          <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-ink-muted">
            {phase.description}
          </p>

          {/* Gold separator */}
          <div className="mt-5 h-px bg-gradient-to-r from-gold/40 via-gold/20 to-transparent" />

          {/* Stats bar */}
          <div className="mt-5 flex items-center gap-6">
            <div className="flex flex-1 items-center gap-3">
              <div className="h-1.5 flex-1 rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-sage transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="font-mono text-xs tabular-nums text-ink-muted">
                {pct}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              {(
                [
                  "not_started",
                  "in_progress",
                  "done",
                  "blocked",
                ] as ItemStatus[]
              ).map((status) => {
                const count = statusCounts[status] || 0;
                if (count === 0) return null;
                const cfg = STATUS_CONFIG[status];
                const Icon = cfg.icon;
                return (
                  <span
                    key={status}
                    className={cn(
                      "flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                      cfg.bg,
                      cfg.color,
                    )}
                  >
                    <Icon size={10} strokeWidth={1.5} />
                    {count}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Smart Task Input Bar — natural-language task creation */}
          <div className="mt-5">
            <SmartTaskInputBar
              context={smartContext}
              onAdd={handleSmartAdd}
              fallbackPhaseId={phase.id}
            />
          </div>

          {/* Filter bar + "+ New Task" / show-source toggle */}
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <div className="flex-1 min-w-0">
              <FilterBar
                filters={filters}
                members={members}
                onChange={setFilters}
              />
            </div>
            <button
              type="button"
              onClick={() =>
                setShowSource((v) => {
                  const next = !v;
                  return next;
                })
              }
              className={cn(
                "flex shrink-0 items-center gap-1 rounded-md border px-2 py-1.5 text-[11px] font-medium transition-colors",
                showSource
                  ? "border-gold/40 bg-gold-pale/40 text-gold"
                  : "border-border text-ink-faint hover:border-ink-faint/50 hover:text-ink-muted",
              )}
              aria-pressed={showSource}
              aria-label="Show task source tags"
              title="Show source (template / custom)"
            >
              <Eye size={11} strokeWidth={1.6} />
              Source
            </button>
            <button
              type="button"
              onClick={() =>
                onOpenNewTaskPanel({ phaseId: phase.id })
              }
              className="flex shrink-0 items-center gap-1.5 rounded-md border border-gold/40 bg-gold-pale/50 px-2.5 py-1.5 text-[12px] font-medium text-gold transition-colors hover:bg-gold-pale/70"
              aria-label="Create new task with full options"
            >
              <Plus size={12} strokeWidth={2} />
              New Task
            </button>
          </div>
        </div>

        {/* Sections */}
        {total === 0 ? (
          <EmptyPhase phaseName={phase.title} />
        ) : sections.length > 0 ? (
          <div
            className="divide-y divide-border/50"
            data-phase-id={phase.id}
            data-sections-root
          >
            {sections.map(({ section, key, items: sectionItems }) => (
              <Section
                key={key}
                title={section}
                subsectionKey={key}
                phaseId={phase.id}
                items={sectionItems}
                selectedItemId={selectedItemId}
                onToggle={onToggle}
                onSelect={onSelect}
                members={members}
                onToggleAssignee={onToggleAssignee}
                showSourceTag={showSource}
                composerOpen={activeComposer === key}
                onOpenComposer={() => setActiveComposer(key)}
                onCloseComposer={() => setActiveComposer(null)}
              />
            ))}
          </div>
        ) : hasActiveFilters ? (
          <EmptySearch />
        ) : (
          <EmptyPhase phaseName={phase.title} />
        )}
      </div>
    </main>
  );
}

// Keyboard shortcut: when the page fires an "open composer" signal, pick the
// first subsection currently in view (or fall back to the first rendered one)
// and open its inline composer. If no subsection is visible, the page-level
// handler opens the slide-over instead.
function useOpenVisibleComposer(
  signal: number,
  sections: { key: string }[],
  setActiveComposer: (key: string | null) => void,
  onHandled: () => void,
  onNoSubsection: () => void,
) {
  useEffect(() => {
    if (signal === 0) return;
    const nodes = document.querySelectorAll<HTMLElement>(
      "[data-subsection-key]",
    );
    if (nodes.length === 0) {
      onNoSubsection();
      onHandled();
      return;
    }
    let chosen: string | null = null;
    for (const node of Array.from(nodes)) {
      const rect = node.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        chosen = node.dataset.subsectionKey ?? null;
        break;
      }
    }
    if (!chosen) chosen = sections[0]?.key ?? null;
    if (chosen) {
      setActiveComposer(chosen);
      requestAnimationFrame(() => {
        const target = document.querySelector<HTMLElement>(
          `[data-subsection-key="${chosen}"] input[aria-label="Task title"]`,
        );
        target?.focus();
      });
    } else {
      onNoSubsection();
    }
    onHandled();
  }, [signal]); // eslint-disable-line react-hooks/exhaustive-deps
}

// ── Today View ──────────────────────────────────────────────────────────────

function TodayView({
  items,
  allItems,
  phases,
  selectedItemId,
  onToggle,
  onSelect,
  members,
  onToggleAssignee,
}: {
  items: ChecklistItem[];
  allItems: ChecklistItem[];
  phases: Phase[];
  selectedItemId: string | null;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  members: Member[];
  onToggleAssignee: (itemId: string, memberId: string) => void;
}) {
  const phaseMap = useMemo(() => {
    const m: Record<string, Phase> = {};
    for (const p of phases) m[p.id] = p;
    return m;
  }, [phases]);

  const weddingDate = useChecklistStore((s) => s.weddingDate);

  // Sort by computed deadline (auto or override)
  const sorted = useMemo(
    () =>
      [...items].sort((a, b) => {
        const da = itemDeadline(a, weddingDate);
        const db = itemDeadline(b, weddingDate);
        if (!da) return 1;
        if (!db) return -1;
        return da.getTime() - db.getTime();
      }),
    [items, weddingDate],
  );

  // Group: overdue vs upcoming (using deadline-aware overdue)
  const overdue = sorted.filter((i) => isItemOverdue(i, weddingDate));
  const upcoming = sorted.filter(
    (i) => itemDeadline(i, weddingDate) && !isItemOverdue(i, weddingDate),
  );

  return (
    <main className="flex-1 overflow-y-auto" aria-label="This week's items">
      <div className="mx-auto max-w-3xl px-8 py-10">
        <div className="mb-8">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-ink-faint">
            Smart View
          </p>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-ink">
            This Week
          </h2>
          <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-ink-muted">
            Items due in the next seven days, across all phases.
          </p>
          <div className="mt-5 h-px bg-gradient-to-r from-gold/40 via-gold/20 to-transparent" />
        </div>

        {items.length === 0 ? (
          <EmptyToday />
        ) : (
          <div className="space-y-6">
            {overdue.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3 px-2">
                  <Flame size={13} strokeWidth={1.5} className="text-rose" />
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-rose">
                    Overdue
                  </span>
                  <span className="font-mono text-[10px] tabular-nums text-rose/60">
                    {overdue.length}
                  </span>
                </div>
                {overdue.map((item) => (
                  <ChecklistItemRow
                    key={item.id}
                    item={item}
                    isSelected={item.id === selectedItemId}
                    onToggle={() => onToggle(item.id)}
                    onSelect={() => onSelect(item.id)}
                    showPhase
                    phaseName={phaseMap[item.phase_id]?.title}
                    members={members}
                    onToggleAssignee={onToggleAssignee}
                  />
                ))}
              </div>
            )}

            {upcoming.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3 px-2">
                  <CalendarClock
                    size={13}
                    strokeWidth={1.5}
                    className="text-gold"
                  />
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-ink-muted">
                    Upcoming
                  </span>
                  <span className="font-mono text-[10px] tabular-nums text-ink-faint">
                    {upcoming.length}
                  </span>
                </div>
                {upcoming.map((item) => (
                  <ChecklistItemRow
                    key={item.id}
                    item={item}
                    isSelected={item.id === selectedItemId}
                    onToggle={() => onToggle(item.id)}
                    onSelect={() => onSelect(item.id)}
                    showPhase
                    phaseName={phaseMap[item.phase_id]?.title}
                    members={members}
                    onToggleAssignee={onToggleAssignee}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

// ── At Risk View ────────────────────────────────────────────────────────────

function AtRiskView({
  items,
  allItems,
  phases,
  selectedItemId,
  onToggle,
  onSelect,
  members,
  onToggleAssignee,
}: {
  items: ChecklistItem[];
  allItems: ChecklistItem[];
  phases: Phase[];
  selectedItemId: string | null;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  members: Member[];
  onToggleAssignee: (itemId: string, memberId: string) => void;
}) {
  const phaseMap = useMemo(() => {
    const m: Record<string, Phase> = {};
    for (const p of phases) m[p.id] = p;
    return m;
  }, [phases]);

  const weddingDate = useChecklistStore((s) => s.weddingDate);

  const overdueItems = items.filter(
    (i) => isItemOverdue(i, weddingDate) && i.status !== "blocked",
  );
  const blockedItems = items.filter((i) => i.status === "blocked");
  const depItems = items.filter(
    (i) =>
      hasUnmetDeps(i, allItems) &&
      i.status !== "blocked" &&
      !isItemOverdue(i, weddingDate),
  );

  return (
    <main className="flex-1 overflow-y-auto" aria-label="At risk items">
      <div className="mx-auto max-w-3xl px-8 py-10">
        <div className="mb-8">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-ink-faint">
            Smart View
          </p>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-ink">
            At Risk
          </h2>
          <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-ink-muted">
            Overdue items, blockers, and unmet dependencies that need attention.
          </p>
          <div className="mt-5 h-px bg-gradient-to-r from-rose/40 via-rose/20 to-transparent" />
        </div>

        {items.length === 0 ? (
          <EmptyAtRisk />
        ) : (
          <div className="space-y-6">
            {overdueItems.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3 px-2">
                  <Flame size={13} strokeWidth={1.5} className="text-rose" />
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-rose">
                    Overdue
                  </span>
                  <span className="font-mono text-[10px] tabular-nums text-rose/60">
                    {overdueItems.length}
                  </span>
                </div>
                {overdueItems.map((item) => (
                  <ChecklistItemRow
                    key={item.id}
                    item={item}
                    isSelected={item.id === selectedItemId}
                    onToggle={() => onToggle(item.id)}
                    onSelect={() => onSelect(item.id)}
                    showPhase
                    phaseName={phaseMap[item.phase_id]?.title}
                    members={members}
                    onToggleAssignee={onToggleAssignee}
                  />
                ))}
              </div>
            )}

            {blockedItems.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3 px-2">
                  <Ban size={13} strokeWidth={1.5} className="text-rose" />
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-rose">
                    Blocked
                  </span>
                  <span className="font-mono text-[10px] tabular-nums text-rose/60">
                    {blockedItems.length}
                  </span>
                </div>
                {blockedItems.map((item) => (
                  <ChecklistItemRow
                    key={item.id}
                    item={item}
                    isSelected={item.id === selectedItemId}
                    onToggle={() => onToggle(item.id)}
                    onSelect={() => onSelect(item.id)}
                    showPhase
                    phaseName={phaseMap[item.phase_id]?.title}
                    members={members}
                    onToggleAssignee={onToggleAssignee}
                  />
                ))}
              </div>
            )}

            {depItems.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3 px-2">
                  <AlertTriangle
                    size={13}
                    strokeWidth={1.5}
                    className="text-amber-500"
                  />
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-600">
                    Unmet Dependencies
                  </span>
                  <span className="font-mono text-[10px] tabular-nums text-amber-400">
                    {depItems.length}
                  </span>
                </div>
                {depItems.map((item) => (
                  <ChecklistItemRow
                    key={item.id}
                    item={item}
                    isSelected={item.id === selectedItemId}
                    onToggle={() => onToggle(item.id)}
                    onSelect={() => onSelect(item.id)}
                    showPhase
                    phaseName={phaseMap[item.phase_id]?.title}
                    members={members}
                    onToggleAssignee={onToggleAssignee}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

// ── All Tasks View ──────────────────────────────────────────────────────────

type GroupBy = "deadline" | "phase" | "priority" | "assignee" | "status";

const GROUP_BY_LABELS: Record<GroupBy, string> = {
  deadline: "Deadline",
  phase: "Phase",
  priority: "Priority",
  assignee: "Assignee",
  status: "Status",
};

const PRIORITY_ORDER: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const STATUS_ORDER: Record<ItemStatus, number> = {
  not_started: 0,
  in_progress: 1,
  blocked: 2,
  done: 3,
  not_applicable: 4,
};

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function deadlineBucket(
  date: Date | null,
  weddingDate: Date | null,
  now: Date,
): { key: string; label: string; order: number } {
  if (!date) {
    return { key: "no-date", label: "No deadline", order: 99999 };
  }

  const today = startOfDay(now);
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + 7);
  const nextWeekEnd = new Date(today);
  nextWeekEnd.setDate(today.getDate() + 14);

  const d = startOfDay(date);

  if (d.getTime() < today.getTime()) {
    return { key: "overdue", label: "Overdue", order: -1 };
  }
  if (d.getTime() < weekEnd.getTime()) {
    return { key: "this-week", label: "This Week", order: 0 };
  }
  if (d.getTime() < nextWeekEnd.getTime()) {
    return { key: "next-week", label: "Next Week", order: 1 };
  }

  if (weddingDate && d.getTime() > startOfDay(weddingDate).getTime()) {
    return { key: "post-wedding", label: "Post-Wedding", order: 99998 };
  }

  const dm = d.getMonth();
  const dy = d.getFullYear();
  if (dm === today.getMonth() && dy === today.getFullYear()) {
    return {
      key: `later-${dy}-${dm}`,
      label: `Later in ${date.toLocaleDateString("en-US", { month: "long" })}`,
      order: 2,
    };
  }

  return {
    key: `month-${dy}-${dm}`,
    label: date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    }),
    order: 100 + dy * 12 + dm,
  };
}

function AllTasksView({
  items,
  phases,
  selectedItemId,
  onToggle,
  onSelect,
  members,
  onToggleAssignee,
}: {
  items: ChecklistItem[];
  phases: Phase[];
  selectedItemId: string | null;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  members: Member[];
  onToggleAssignee: (itemId: string, memberId: string) => void;
}) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [groupBy, setGroupBy] = useState<GroupBy>("deadline");

  const weddingDate = useChecklistStore((s) => s.weddingDate);
  const addCustomItem = useChecklistStore((s) => s.addCustomItem);

  const smartContext = useMemo(
    () => buildSmartTaskContext(phases, items, members, weddingDate),
    [phases, items, members, weddingDate],
  );

  const handleSmartAdd = useCallback(
    (parsed: ParsedTask | ParsedTaskSuggestion) => {
      // No active phase in the All Tasks view; fall back to phase-0.
      const payload = parsedTaskToCustomInput(parsed, phases[0]?.id ?? "phase-0");
      if (!payload) return;
      const created = addCustomItem(payload);
      onSelect(created.id);
    },
    [addCustomItem, onSelect, phases],
  );

  const phaseMap = useMemo(() => {
    const m: Record<string, Phase> = {};
    for (const p of phases) m[p.id] = p;
    return m;
  }, [phases]);

  const memberMap = useMemo(() => {
    const m: Record<string, Member> = {};
    for (const mem of members) m[mem.id] = mem;
    return m;
  }, [members]);

  const filtered = useMemo(
    () => applyFilters(items, filters),
    [items, filters],
  );

  const sections = useMemo(() => {
    const now = new Date();

    // Sort globally: deadline asc (nulls last), then priority desc (critical→low)
    const sorted = [...filtered].sort((a, b) => {
      const da = itemDeadline(a, weddingDate);
      const db = itemDeadline(b, weddingDate);
      if (da && db) {
        const diff = da.getTime() - db.getTime();
        if (diff !== 0) return diff;
      } else if (da && !db) {
        return -1;
      } else if (!da && db) {
        return 1;
      }
      return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    });

    type Group = {
      key: string;
      label: string;
      order: number;
      items: ChecklistItem[];
    };
    const groups = new Map<string, Group>();

    const ensure = (key: string, label: string, order: number): Group => {
      let g = groups.get(key);
      if (!g) {
        g = { key, label, order, items: [] };
        groups.set(key, g);
      }
      return g;
    };

    for (const item of sorted) {
      switch (groupBy) {
        case "phase": {
          const phase = phaseMap[item.phase_id];
          const order = phases.findIndex((p) => p.id === item.phase_id);
          ensure(
            item.phase_id,
            phase?.title ?? "Unknown Phase",
            order < 0 ? 9999 : order,
          ).items.push(item);
          break;
        }
        case "priority": {
          ensure(
            item.priority,
            PRIORITY_LABELS[item.priority] ?? item.priority,
            PRIORITY_ORDER[item.priority],
          ).items.push(item);
          break;
        }
        case "assignee": {
          const ids = item.assignee_ids ?? [];
          if (ids.length === 0) {
            ensure("__unassigned", "Unassigned", 99999).items.push(item);
          } else {
            for (const id of ids) {
              const mem = memberMap[id];
              const order = members.findIndex((m) => m.id === id);
              ensure(
                id,
                mem?.name ?? "Unknown",
                order < 0 ? 9000 : order,
              ).items.push(item);
            }
          }
          break;
        }
        case "status": {
          const cfg = STATUS_CONFIG[item.status];
          ensure(
            item.status,
            cfg.label,
            STATUS_ORDER[item.status],
          ).items.push(item);
          break;
        }
        case "deadline":
        default: {
          const b = deadlineBucket(
            itemDeadline(item, weddingDate),
            weddingDate,
            now,
          );
          ensure(b.key, b.label, b.order).items.push(item);
          break;
        }
      }
    }

    return Array.from(groups.values()).sort((a, b) => a.order - b.order);
  }, [filtered, groupBy, weddingDate, phaseMap, memberMap, phases, members]);

  const total = items.length;
  const done = items.filter((i) => i.status === "done").length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.priority !== "all" ||
    filters.assigned !== "all" ||
    filters.search !== "";

  const selectClass =
    "appearance-none rounded-md border border-border bg-ivory px-2.5 py-1.5 text-[12px] text-ink-muted outline-none transition-colors hover:border-ink-faint/50 focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/20";

  return (
    <main className="flex-1 overflow-y-auto" aria-label="All tasks">
      <div className="mx-auto max-w-3xl px-8 py-10">
        <div className="mb-8">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-ink-faint">
            {total} Tasks · All Phases
          </p>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-ink">
            All Tasks
          </h2>
          <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-ink-muted">
            Every task across your wedding plan, sorted by deadline.
          </p>

          {/* Gold separator */}
          <div className="mt-5 h-px bg-gradient-to-r from-gold/40 via-gold/20 to-transparent" />

          {/* Stats bar */}
          <div className="mt-5 flex items-center gap-6">
            <div className="flex flex-1 items-center gap-3">
              <div className="h-1.5 flex-1 rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-sage transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="font-mono text-xs tabular-nums text-ink-muted">
                {pct}%
              </span>
              <span className="font-mono text-[11px] tabular-nums text-ink-faint">
                {done}/{total}
              </span>
            </div>
          </div>

          {/* Smart Task Input Bar — natural-language task creation */}
          <div className="mt-5">
            <SmartTaskInputBar
              context={smartContext}
              onAdd={handleSmartAdd}
              fallbackPhaseId={phases[0]?.id}
            />
          </div>

          {/* Filter bar + Group by */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <FilterBar
              filters={filters}
              members={members}
              onChange={setFilters}
            />
            <label className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                Group by
              </span>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as GroupBy)}
                className={selectClass}
                aria-label="Group tasks by"
              >
                {(Object.keys(GROUP_BY_LABELS) as GroupBy[]).map((key) => (
                  <option key={key} value={key}>
                    {GROUP_BY_LABELS[key]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Sections */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-[14px] text-ink-muted">
              No tasks match your filters
            </p>
            {hasActiveFilters && (
              <button
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="mt-3 text-[12px] text-gold underline-offset-4 transition-colors hover:text-gold-light hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {sections.map(({ key, label, items: sItems }) => (
              <div key={key}>
                <div className="mb-3 flex items-center gap-2 px-2">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-ink-muted">
                    {label}
                  </span>
                  <span className="font-mono text-[10px] tabular-nums text-gold/60">
                    {sItems.length}
                  </span>
                </div>
                {sItems.map((item) => (
                  <ChecklistItemRow
                    key={`${key}-${item.id}`}
                    item={item}
                    isSelected={item.id === selectedItemId}
                    onToggle={() => onToggle(item.id)}
                    onSelect={() => onSelect(item.id)}
                    showPhaseInline
                    phaseName={phaseMap[item.phase_id]?.title}
                    members={members}
                    onToggleAssignee={onToggleAssignee}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function OriginalChecklistPage() {
  const phases = useChecklistStore((s) => s.phases);
  const items = useChecklistStore((s) => s.items);
  const members = useChecklistStore((s) => s.members);
  const toggleItemStatus = useChecklistStore((s) => s.toggleItemStatus);
  const toggleAssignee = useChecklistStore((s) => s.toggleAssignee);
  const inviteMembers = useChecklistStore((s) => s.inviteMembers);
  const updateMemberRole = useChecklistStore((s) => s.updateMemberRole);
  const removeMember = useChecklistStore((s) => s.removeMember);
  const resendInvite = useChecklistStore((s) => s.resendInvite);
  const couple = useCoupleIdentity();

  const [activePhaseId, setActivePhaseId] = useState(
    phases[0]?.id ?? "phase-0",
  );
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("phase");

  // Deep-link: `/checklist?open=<itemId>` opens that item's detail panel
  // once per mount. Used by the "Supports your planning" CTA on journal
  // articles. Activates the item's phase so the row is visible under the
  // panel. Ref-guarded so closing the panel doesn't trigger a reopen.
  const searchParams = useSearchParams();
  const deepLinkHandled = useRef(false);
  useEffect(() => {
    if (deepLinkHandled.current) return;
    const openId = searchParams?.get("open");
    if (!openId) return;
    const target = items.find((i) => i.id === openId);
    if (!target) return;
    setSelectedItemId(openId);
    setActivePhaseId(target.phase_id);
    setViewMode("phase");
    deepLinkHandled.current = true;
  }, [searchParams, items]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [newTaskPanel, setNewTaskPanel] = useState<{
    open: boolean;
    defaults: NewTaskPanelDefaults;
  }>({ open: false, defaults: {} });
  const [openComposerSignal, setOpenComposerSignal] = useState(0);

  const openNewTaskPanel = useCallback(
    (opts?: NewTaskPanelDefaults) => {
      setNewTaskPanel({ open: true, defaults: opts ?? {} });
    },
    [],
  );

  // N: open inline composer for the visible subsection (falls back to the
  // slide-over when the checklist isn't in a phase view or no subsection is
  // on-screen). Skipped while any text field, select, or detail panel is
  // focused so it doesn't fire mid-typing.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "n" && e.key !== "N") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          tag === "SELECT" ||
          target.isContentEditable
        ) {
          return;
        }
      }
      if (newTaskPanel.open) return;
      e.preventDefault();
      if (viewMode === "phase") {
        setOpenComposerSignal((s) => s + 1);
      } else {
        openNewTaskPanel({ phaseId: activePhaseId });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [viewMode, activePhaseId, openNewTaskPanel, newTaskPanel.open]);

  const ownerId = useMemo(
    () => members.find((m) => m.role === "Owner")?.id ?? null,
    [members],
  );

  // Hydration gate for skeleton loader
  useEffect(() => {
    const timer = setTimeout(() => setIsHydrated(true), 80);
    return () => clearTimeout(timer);
  }, []);

  const itemsByPhase = useMemo(() => {
    const map: Record<string, ChecklistItem[]> = {};
    for (const phase of phases) {
      map[phase.id] = [];
    }
    for (const item of items) {
      if (map[item.phase_id]) {
        map[item.phase_id].push(item);
      }
    }
    return map;
  }, [phases, items]);

  const activePhase = phases.find((p) => p.id === activePhaseId) ?? phases[0];
  const activeItems = itemsByPhase[activePhaseId] || [];

  const totalItems = items.length;
  const completedItems = items.filter((i) => i.status === "done").length;

  const weddingDate = useChecklistStore((s) => s.weddingDate);

  // Today view: items due this week that aren't done
  const todayItems = useMemo(
    () =>
      items.filter(
        (i) =>
          i.status !== "done" &&
          i.status !== "not_applicable" &&
          (isItemThisWeek(i, weddingDate) || isItemOverdue(i, weddingDate)),
      ),
    [items, weddingDate],
  );

  // At risk view
  const atRiskItems = useMemo(
    () => items.filter((i) => isAtRisk(i, items, weddingDate)),
    [items, weddingDate],
  );

  const selectedItem = selectedItemId
    ? items.find((i) => i.id === selectedItemId) ?? null
    : null;
  const selectedPhase = selectedItem
    ? phases.find((p) => p.id === selectedItem.phase_id) ?? activePhase
    : activePhase;
  const panelOpen = selectedItem !== null;

  // Navigate within panel (for dependencies)
  const handlePanelNavigate = useCallback(
    (itemId: string) => {
      const target = items.find((i) => i.id === itemId);
      if (target) {
        setSelectedItemId(itemId);
        if (target.phase_id !== activePhaseId) {
          setActivePhaseId(target.phase_id);
        }
      }
    },
    [items, activePhaseId],
  );

  const handleSelect = useCallback(
    (id: string) => setSelectedItemId(selectedItemId === id ? null : id),
    [selectedItemId],
  );

  // Render main content based on view mode
  const renderContent = () => {
    if (!isHydrated) {
      return <SkeletonContent />;
    }

    switch (viewMode) {
      case "today":
        return (
          <TodayView
            items={todayItems}
            allItems={items}
            phases={phases}
            selectedItemId={selectedItemId}
            onToggle={toggleItemStatus}
            onSelect={handleSelect}
            members={members}
            onToggleAssignee={toggleAssignee}
          />
        );
      case "at-risk":
        return (
          <AtRiskView
            items={atRiskItems}
            allItems={items}
            phases={phases}
            selectedItemId={selectedItemId}
            onToggle={toggleItemStatus}
            onSelect={handleSelect}
            members={members}
            onToggleAssignee={toggleAssignee}
          />
        );
      case "members":
        return (
          <MembersPanel
            members={members}
            ownerId={ownerId}
            onInviteClick={() => setInviteOpen(true)}
            onRoleChange={updateMemberRole}
            onResend={resendInvite}
            onRemove={removeMember}
          />
        );
      case "all":
        return (
          <AllTasksView
            items={items}
            phases={phases}
            selectedItemId={selectedItemId}
            onToggle={toggleItemStatus}
            onSelect={handleSelect}
            members={members}
            onToggleAssignee={toggleAssignee}
          />
        );
      default:
        return (
          <ContentArea
            phase={activePhase}
            phaseIndex={phases.findIndex((p) => p.id === activePhaseId)}
            totalPhases={phases.length}
            items={activeItems}
            selectedItemId={selectedItemId}
            onToggle={toggleItemStatus}
            onSelect={handleSelect}
            members={members}
            onToggleAssignee={toggleAssignee}
            onOpenNewTaskPanel={openNewTaskPanel}
            openComposerSignal={openComposerSignal}
            onComposerHandled={() => {}}
          />
        );
    }
  };

  return (
    <ShoppingLinksProvider weddingId="default">
    <div className="flex h-screen flex-col bg-white">
      <TopNav>
        <ChecklistTopBarActions
          totalItems={totalItems}
          completedItems={completedItems}
          phases={phases}
          itemsByPhase={itemsByPhase}
          onInviteClick={() => setInviteOpen(true)}
          onNewTaskClick={() =>
            openNewTaskPanel({
              phaseId: viewMode === "phase" ? activePhaseId : undefined,
            })
          }
        />
      </TopNav>
      <div className="relative flex flex-1 overflow-hidden">
        <Sidebar
          phases={phases}
          activePhase={activePhaseId}
          onPhaseSelect={setActivePhaseId}
          itemsByPhase={itemsByPhase}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          allTasksCount={items.length}
          todayCount={todayItems.length}
          atRiskCount={atRiskItems.length}
          memberCount={members.length}
        />

        {/* Main + panel wrapper */}
        <div className="flex flex-1 overflow-hidden">
          {/* Content area — dims when panel is open */}
          <div
            className={cn(
              "flex flex-1 flex-col overflow-hidden transition-opacity duration-300",
              panelOpen && "opacity-60",
            )}
          >
            {renderContent()}
          </div>

          {/* Side panel */}
          <AnimatePresence>
            {panelOpen && selectedItem && (
              <DetailPanel
                item={selectedItem}
                phase={selectedPhase}
                onClose={() => setSelectedItemId(null)}
                onNavigate={handlePanelNavigate}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      <InviteModal
        open={inviteOpen}
        coupleNames={{ person1: couple.person1, person2: couple.person2 }}
        inviteLink={`https://ananya.app/join/${couple.person1.toLowerCase()}-${couple.person2.toLowerCase()}-2026`}
        onClose={() => setInviteOpen(false)}
        onSend={(emails, role) => inviteMembers(emails, role)}
      />

      <NewTaskSlideOver
        open={newTaskPanel.open}
        defaults={newTaskPanel.defaults}
        phases={phases}
        items={items}
        members={members}
        onClose={() =>
          setNewTaskPanel((prev) => ({ ...prev, open: false }))
        }
      />
    </div>
    </ShoppingLinksProvider>
  );
}
