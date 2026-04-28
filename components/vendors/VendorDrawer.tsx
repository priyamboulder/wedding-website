"use client";

import { useEffect, useMemo, useState } from "react";
import NextLink from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Heart,
  MapPin,
  Star,
  Link2,
  Check,
  Plus,
  Search,
  Clock,
  Tag,
  Mail,
  Phone,
  Globe,
  AtSign,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Vendor } from "@/types/vendor";
import type { ChecklistItem } from "@/types/checklist";
import { CATEGORY_LABELS, TASK_KEYWORDS_TO_CATEGORY } from "@/lib/vendor-categories";
import { formatPriceShort } from "@/lib/vendors/price-display";
import { useVendorsStore } from "@/stores/vendors-store";

type DrawerTab = "about" | "portfolio" | "reviews" | "contact";

interface VendorDrawerProps {
  vendor: Vendor | null;
  onClose: () => void;
  tasks: ChecklistItem[];
}

export function VendorDrawer({ vendor, onClose, tasks }: VendorDrawerProps) {
  const [tab, setTab] = useState<DrawerTab>("about");
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [taskSearch, setTaskSearch] = useState("");

  const shortlist = useVendorsStore((s) => s.shortlist);
  const allTaskLinks = useVendorsStore((s) => s.taskLinks);
  const toggleShortlist = useVendorsStore((s) => s.toggleShortlist);
  const linkVendorToTask = useVendorsStore((s) => s.linkVendorToTask);
  const unlinkVendorFromTask = useVendorsStore((s) => s.unlinkVendorFromTask);

  const shortlisted = useMemo(
    () => (vendor ? shortlist.some((e) => e.vendor_id === vendor.id) : false),
    [shortlist, vendor],
  );
  const linkedTasks = useMemo(
    () =>
      vendor ? allTaskLinks.filter((l) => l.vendor_id === vendor.id) : [],
    [allTaskLinks, vendor],
  );

  useEffect(() => {
    setTab("about");
    setShowAllTasks(false);
    setTaskSearch("");
  }, [vendor?.id]);

  useEffect(() => {
    if (!vendor) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [vendor, onClose]);

  // Tasks relevant to this vendor's category (first pass)
  const relevantTasks = useMemo(() => {
    if (!vendor) return [] as ChecklistItem[];
    const pattern = TASK_KEYWORDS_TO_CATEGORY.find(
      ([, cat]) => cat === vendor.category,
    )?.[0];
    if (!pattern) return tasks;
    const matches = tasks.filter((t) =>
      pattern.test(`${t.title} ${t.description}`),
    );
    return matches;
  }, [tasks, vendor]);

  const searchedTasks = useMemo(() => {
    const pool = showAllTasks ? tasks : relevantTasks;
    const q = taskSearch.trim().toLowerCase();
    if (!q) return pool;
    return pool.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q),
    );
  }, [tasks, relevantTasks, showAllTasks, taskSearch]);

  const linkedTaskIds = useMemo(
    () => new Set(linkedTasks.map((l) => l.task_id)),
    [linkedTasks],
  );

  return (
    <AnimatePresence>
      {vendor && (
        <>
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm"
          />
          <motion.aside
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[560px] flex-col overflow-hidden bg-ivory shadow-[-24px_0_60px_-20px_rgba(26,26,26,0.25)]"
            role="dialog"
            aria-label={`${vendor.name} details`}
          >
            {/* Hero */}
            <div className="relative aspect-[16/9] shrink-0 overflow-hidden bg-ivory-warm">
              {vendor.cover_image || (vendor.portfolio_images ?? [])[0] ? (
                <img
                  src={vendor.cover_image || (vendor.portfolio_images ?? [])[0].url}
                  alt={vendor.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-ink-faint/40">
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em]">
                    No image yet
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-ink-soft ring-1 ring-border transition-colors hover:bg-white"
              >
                <X size={14} strokeWidth={1.8} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto panel-scroll">
              <div className="px-7 pt-6">
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.14em] text-saffron"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {CATEGORY_LABELS[vendor.category]}
                </p>
                <div className="mt-1.5 flex items-start justify-between gap-3">
                  <h2 className="text-[20px] font-medium leading-tight text-ink">
                    {vendor.name}
                  </h2>
                  <button
                    type="button"
                    onClick={() => toggleShortlist(vendor.id)}
                    aria-label={
                      shortlisted
                        ? "Remove from shortlist"
                        : "Save to shortlist"
                    }
                    aria-pressed={shortlisted}
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors",
                      shortlisted
                        ? "text-saffron"
                        : "text-ink-muted hover:text-ink",
                    )}
                  >
                    <Heart
                      size={16}
                      strokeWidth={1.8}
                      fill={shortlisted ? "currentColor" : "none"}
                    />
                  </button>
                </div>

                {/* Meta row */}
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-ink-muted">
                  {vendor.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin size={13} strokeWidth={1.6} />
                      {vendor.location}
                    </span>
                  )}
                  {vendor.rating !== null && (
                    <span className="flex items-center gap-1.5">
                      <Star
                        size={13}
                        strokeWidth={1.6}
                        className="text-saffron"
                        fill="currentColor"
                      />
                      <span className="font-mono">
                        {vendor.rating.toFixed(1)}
                      </span>
                      <span className="text-ink-faint">
                        ({vendor.review_count} reviews)
                      </span>
                    </span>
                  )}
                  <span className="font-mono text-[11px] text-ink-soft">
                    {formatPriceShort(vendor.price_display)}
                  </span>
                </div>

                {/* Open full detail / workspace */}
                <NextLink
                  href={`/vendors/${vendor.id}`}
                  className="group mt-5 flex items-center justify-between rounded-lg border border-border bg-gradient-to-r from-saffron-pale/30 via-ivory-warm/30 to-ivory px-4 py-3 transition-all hover:border-saffron/50 hover:from-saffron-pale/50"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-saffron-pale/60 text-saffron">
                      <Sparkles size={14} strokeWidth={1.8} />
                    </span>
                    <div>
                      <p className="text-[12.5px] font-medium text-ink">
                        Open vendor workspace
                      </p>
                      <p className="text-[11px] text-ink-muted">
                        Stage content, set permissions, invite the vendor.
                      </p>
                    </div>
                  </div>
                  <ArrowRight
                    size={14}
                    strokeWidth={1.8}
                    className="text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-saffron"
                  />
                </NextLink>

                {/* Link-to-task panel */}
                <TaskLinkPanel
                  tasks={searchedTasks}
                  linkedTaskIds={linkedTaskIds}
                  onToggleLink={(taskId) => {
                    if (linkedTaskIds.has(taskId)) {
                      unlinkVendorFromTask(vendor.id, taskId);
                    } else {
                      linkVendorToTask(vendor.id, taskId);
                    }
                  }}
                  showAllTasks={showAllTasks}
                  onToggleShowAll={() => setShowAllTasks((s) => !s)}
                  taskSearch={taskSearch}
                  onTaskSearchChange={setTaskSearch}
                  hasRelevantMatches={relevantTasks.length > 0}
                />

                {/* Tabs */}
                <div className="mt-6 border-b border-border">
                  <div className="flex items-center gap-5">
                    {(
                      [
                        ["about", "About"],
                        ["portfolio", "Portfolio"],
                        ["reviews", "Reviews"],
                        ["contact", "Contact"],
                      ] as Array<[DrawerTab, string]>
                    ).map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setTab(id)}
                        className={cn(
                          "relative pb-2 text-[12.5px] font-medium transition-colors",
                          tab === id
                            ? "text-ink"
                            : "text-ink-muted hover:text-ink",
                        )}
                      >
                        {label}
                        {tab === id && (
                          <motion.span
                            layoutId="vendor-drawer-tab"
                            transition={{
                              duration: 0.25,
                              ease: [0.32, 0.72, 0, 1],
                            }}
                            className="absolute inset-x-0 bottom-0 h-[1.5px] rounded-full bg-ink"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab body */}
                <div className="py-6 pb-10">
                  {tab === "about" && <AboutTab vendor={vendor} />}
                  {tab === "portfolio" && <PortfolioTab vendor={vendor} />}
                  {tab === "reviews" && <ReviewsTab vendor={vendor} />}
                  {tab === "contact" && <ContactTab vendor={vendor} />}
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Task link panel ─────────────────────────────────────────────────────────

function TaskLinkPanel({
  tasks,
  linkedTaskIds,
  onToggleLink,
  showAllTasks,
  onToggleShowAll,
  taskSearch,
  onTaskSearchChange,
  hasRelevantMatches,
}: {
  tasks: ChecklistItem[];
  linkedTaskIds: Set<string>;
  onToggleLink: (taskId: string) => void;
  showAllTasks: boolean;
  onToggleShowAll: () => void;
  taskSearch: string;
  onTaskSearchChange: (v: string) => void;
  hasRelevantMatches: boolean;
}) {
  return (
    <section className="mt-6 rounded-lg border border-border bg-ivory-warm/40 p-4">
      <div className="flex items-baseline justify-between">
        <span
          className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Linked Tasks
        </span>
        <Link2 size={11} strokeWidth={1.8} className="text-ink-faint" />
      </div>
      <p className="mt-1 text-[11.5px] leading-relaxed text-ink-muted">
        Linked vendors surface inside the task's vendor panel.
      </p>

      {/* Search for all-tasks mode */}
      {showAllTasks && (
        <div className="mt-4 flex items-center gap-2 rounded-md border border-ink/10 bg-white px-3 py-2">
          <Search size={13} strokeWidth={1.6} className="text-ink-faint" />
          <input
            type="text"
            value={taskSearch}
            onChange={(e) => onTaskSearchChange(e.target.value)}
            placeholder="Search all tasks..."
            className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-ink-faint"
          />
        </div>
      )}

      {/* Task list */}
      <ul className="mt-4 space-y-1.5">
        {tasks.length === 0 ? (
          <li className="py-4 text-center font-mono text-[11px] uppercase tracking-wider text-ink-faint">
            {showAllTasks ? "No tasks match your search" : "No relevant tasks found"}
          </li>
        ) : (
          tasks.slice(0, showAllTasks ? 50 : 6).map((task) => {
            const isLinked = linkedTaskIds.has(task.id);
            return (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => onToggleLink(task.id)}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-all",
                    isLinked
                      ? "border-saffron/50 bg-white"
                      : "border-ink/8 bg-white/70 hover:border-ink/15 hover:bg-white",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                      isLinked
                        ? "border-saffron bg-saffron text-ivory"
                        : "border-ink/20 bg-white group-hover:border-ink/40",
                    )}
                  >
                    {isLinked && <Check size={12} strokeWidth={2.4} />}
                  </span>
                  <span className="flex-1 truncate text-[13px] text-ink">
                    {task.title}
                  </span>
                  {isLinked && (
                    <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-saffron">
                      Linked
                    </span>
                  )}
                </button>
              </li>
            );
          })
        )}
      </ul>

      {/* Toggle all-tasks search */}
      <button
        type="button"
        onClick={onToggleShowAll}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-ink/15 px-3 py-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-muted transition-colors hover:border-ink/30 hover:text-ink"
      >
        <Plus size={12} strokeWidth={1.8} />
        {showAllTasks
          ? "Show only relevant tasks"
          : hasRelevantMatches
            ? "Link to another task…"
            : "Browse all tasks"}
      </button>
    </section>
  );
}

// ── Tab bodies ──────────────────────────────────────────────────────────────

function AboutTab({ vendor }: { vendor: Vendor }) {
  return (
    <div className="space-y-5">
      {vendor.tagline && (
        <p className="font-serif text-[15px] italic leading-snug text-ink">
          &ldquo;{vendor.tagline}&rdquo;
        </p>
      )}
      {vendor.bio ? (
        <p className="text-[14px] leading-[1.7] text-ink-soft">{vendor.bio}</p>
      ) : (
        <p className="text-[13px] italic text-ink-faint">No bio provided.</p>
      )}

      <div className="grid grid-cols-2 gap-4">
        {vendor.style_tags.length > 0 && (
          <InfoCell
            icon={<Tag size={12} strokeWidth={1.6} />}
            label="Style"
            body={
              <div className="flex flex-wrap gap-1">
                {vendor.style_tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-ivory-warm px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-ink-muted"
                  >
                    {t}
                  </span>
                ))}
              </div>
            }
          />
        )}
        {vendor.response_time_hours != null && (
          <InfoCell
            icon={<Clock size={12} strokeWidth={1.6} />}
            label="Response time"
            body={
              <span className="font-mono text-[12px]">
                {vendor.response_time_hours}h
              </span>
            }
          />
        )}
      </div>
    </div>
  );
}

function PortfolioTab({ vendor }: { vendor: Vendor }) {
  if ((vendor.portfolio_images ?? []).length === 0) {
    return (
      <div className="rounded-md border border-ink/8 bg-white px-4 py-10 text-center">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">
          No portfolio images yet
        </p>
        <p className="mt-2 text-[12.5px] italic text-ink-muted">
          Vendor hasn't uploaded portfolio images yet.
        </p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-2">
      {(vendor.portfolio_images ?? []).map((img) => (
        <div
          key={img.url}
          className="aspect-[4/3] overflow-hidden rounded-md bg-ivory-warm"
        >
          <img src={img.url} alt={img.alt ?? ""} className="h-full w-full object-cover" />
        </div>
      ))}
    </div>
  );
}

function ReviewsTab({ vendor }: { vendor: Vendor }) {
  if (vendor.rating === null) {
    return (
      <p className="text-[13px] italic text-ink-faint">
        No reviews aggregated yet.
      </p>
    );
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span
          className="font-mono text-[22px] font-medium text-ink"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {vendor.rating.toFixed(1)}
        </span>
        <div className="flex flex-col">
          <div className="flex text-saffron">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={14}
                strokeWidth={1.6}
                fill={i < Math.round(vendor.rating ?? 0) ? "currentColor" : "none"}
              />
            ))}
          </div>
          <span className="mt-0.5 font-mono text-[11px] text-ink-muted">
            Based on {vendor.review_count} reviews
          </span>
        </div>
      </div>
      <p className="text-[12.5px] italic text-ink-faint">
        Individual review quotes will populate here once reviews API is wired.
      </p>
    </div>
  );
}

function ContactTab({ vendor }: { vendor: Vendor }) {
  const rows: Array<[string, string, React.ReactNode]> = [
    ["Email", vendor.contact.email, <Mail size={13} strokeWidth={1.6} key="m" />],
    ["Phone", vendor.contact.phone, <Phone size={13} strokeWidth={1.6} key="p" />],
    ["Website", vendor.contact.website, <Globe size={13} strokeWidth={1.6} key="w" />],
    [
      "Instagram",
      vendor.contact.instagram,
      <AtSign size={13} strokeWidth={1.6} key="i" />,
    ],
  ];
  const anyContact = rows.some(([, v]) => !!v);
  if (!anyContact) {
    return (
      <p className="text-[13px] italic text-ink-faint">
        No contact details on file yet. Reach out through your planner or the
        vendor's public channel.
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {rows.map(
        ([label, value, icon]) =>
          value && (
            <li
              key={label}
              className="flex items-center gap-3 rounded-md border border-ink/8 bg-white px-3 py-2.5"
            >
              <span className="text-ink-faint">{icon}</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
                {label}
              </span>
              <span className="ml-auto text-[13px] text-ink-soft">{value}</span>
            </li>
          ),
      )}
    </ul>
  );
}

function InfoCell({
  icon,
  label,
  body,
}: {
  icon: React.ReactNode;
  label: string;
  body: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-ink/8 bg-white p-3">
      <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
        {icon}
        {label}
      </div>
      <div className="mt-1.5">{body}</div>
    </div>
  );
}
