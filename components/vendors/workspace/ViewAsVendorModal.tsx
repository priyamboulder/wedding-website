"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Bell,
  Calendar,
  CheckCircle2,
  DollarSign,
  Eye,
  FileText,
  HelpCircle,
  LogOut,
  MessageCircle,
  Sparkles,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  BudgetVisibility,
  CommunicationsAccess,
  GuestVisibility,
  RunOfShowVisibility,
  VendorListVisibility,
  VendorWorkspace,
} from "@/types/vendor-workspace";
import { DISCIPLINE_LABEL } from "@/types/vendor-workspace";
import { WorkspaceContent } from "./WorkspaceContent";

interface ViewAsVendorModalProps {
  open: boolean;
  onClose: () => void;
  workspace: VendorWorkspace;
  vendorName: string;
  weddingLabel: string;
  weddingDate?: string;
}

export function ViewAsVendorModal({
  open,
  onClose,
  workspace,
  vendorName,
  weddingLabel,
  weddingDate = "Feb 14 – 16, 2026",
}: ViewAsVendorModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] bg-ink"
        >
          {/* Return bar — obsidian top rail */}
          <div className="sticky top-0 z-[61] flex items-center justify-between border-b border-ivory/10 bg-ink px-6 py-3 text-ivory">
            <button
              type="button"
              onClick={onClose}
              className="group flex items-center gap-2 rounded-md border border-ivory/15 bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory transition-colors hover:border-saffron/60 hover:bg-saffron/10"
            >
              <ArrowLeft size={13} strokeWidth={1.8} />
              Return to management view
            </button>

            <div className="flex items-center gap-2.5">
              <span
                className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <Eye size={11} strokeWidth={1.8} className="mr-1 inline" />
                Previewing as vendor
              </span>
              <span className="h-4 w-px bg-ivory/15" />
              <span className="text-[11.5px] text-ivory/70">
                {vendorName} · {DISCIPLINE_LABEL[workspace.discipline]}
              </span>
            </div>
          </div>

          {/* Body — vendor-side chrome on ivory */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.08, duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="relative h-[calc(100vh-54px)] overflow-y-auto bg-ivory"
          >
            <VendorSideApp
              workspace={workspace}
              vendorName={vendorName}
              weddingLabel={weddingLabel}
              weddingDate={weddingDate}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Vendor-side application (preview) ──────────────────────────────────────

function VendorSideApp({
  workspace,
  vendorName,
  weddingLabel,
  weddingDate,
}: {
  workspace: VendorWorkspace;
  vendorName: string;
  weddingLabel: string;
  weddingDate: string;
}) {
  return (
    <div className="min-h-full">
      {/* Vendor top nav */}
      <header className="sticky top-0 z-20 border-b border-gold/15 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-ink">
              <Sparkles size={14} strokeWidth={1.6} className="text-saffron" />
            </div>
            <div>
              <p
                className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Ananya · Vendor workspace
              </p>
              <p className="text-[12.5px] font-medium text-ink">{weddingLabel}</p>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            {[
              { label: "Workspace", icon: Sparkles, active: true },
              { label: "Timeline", icon: Calendar },
              { label: "Messages", icon: MessageCircle },
              { label: "Files", icon: FileText },
            ].map((it) => (
              <div
                key={it.label}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium",
                  it.active
                    ? "bg-ink text-ivory"
                    : "text-ink-muted",
                )}
              >
                <it.icon size={12} strokeWidth={1.8} />
                {it.label}
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              className="relative flex h-7 w-7 items-center justify-center rounded-full text-ink-muted"
              type="button"
              aria-label="Notifications"
            >
              <Bell size={13} strokeWidth={1.8} />
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-saffron" />
            </button>
            <div className="flex h-7 items-center gap-2 rounded-full border border-border bg-white px-2 pr-3">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-saffron-pale text-[10px] font-medium text-saffron">
                {vendorName.slice(0, 1)}
              </div>
              <span className="text-[11px] text-ink-muted">{vendorName}</span>
            </div>
            <button className="text-ink-faint" type="button" aria-label="Log out">
              <LogOut size={13} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-8 py-8">
        {/* Hero greeting */}
        <div className="rounded-xl border border-gold/20 bg-gradient-to-br from-saffron-pale/40 via-ivory to-ivory-warm/40 p-6">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Welcome back
          </p>
          <h1 className="mt-1.5 font-serif text-[28px] leading-tight text-ink">
            {vendorName}
          </h1>
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-ink-muted">
            You're viewing the {DISCIPLINE_LABEL[workspace.discipline].toLowerCase()} workspace for {weddingLabel}.
            Everything you need — references, timing, scope — lives here. Ask
            questions directly in Messages.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
            <div>
              <p
                className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Event dates
              </p>
              <p className="mt-0.5 text-[13px] font-medium text-ink">{weddingDate}</p>
            </div>
            <div>
              <p
                className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Venue
              </p>
              <p className="mt-0.5 text-[13px] font-medium text-ink">Taj Falaknuma, Hyderabad</p>
            </div>
            <div>
              <p
                className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Your scope
              </p>
              <p className="mt-0.5 text-[13px] font-medium text-ink">
                {DISCIPLINE_LABEL[workspace.discipline]}
              </p>
            </div>
          </div>
        </div>

        {/* Permission-scoped strip — shows vendor exactly what they can/can't see */}
        <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <PermissionChip
            icon={<Users size={12} strokeWidth={1.8} />}
            label="Guests"
            value={guestLabel(workspace.permissions.guests)}
            visible={workspace.permissions.guests !== "none"}
          />
          <PermissionChip
            icon={<Calendar size={12} strokeWidth={1.8} />}
            label="Run of show"
            value={rosLabel(workspace.permissions.run_of_show)}
            visible
          />
          <PermissionChip
            icon={<DollarSign size={12} strokeWidth={1.8} />}
            label="Budget"
            value={budgetLabel(workspace.permissions.budget)}
            visible={workspace.permissions.budget !== "none"}
          />
          <PermissionChip
            icon={<MessageCircle size={12} strokeWidth={1.8} />}
            label="Messages"
            value={commsLabel(workspace.permissions.communications)}
            visible
          />
        </section>

        {/* Content */}
        <div className="mt-8">
          <WorkspaceContent workspace={workspace} />
        </div>

        {/* Sample bottom actions — what the vendor would use */}
        <section className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-3">
          <ActionCard
            icon={<MessageCircle size={16} strokeWidth={1.8} />}
            title="Message the couple"
            detail={commsLabel(workspace.permissions.communications)}
            visible={workspace.permissions.communications !== "planner_only"}
          />
          <ActionCard
            icon={<CheckCircle2 size={16} strokeWidth={1.8} />}
            title="Confirm deliverable"
            detail="Mark your next commitment as on track or delayed."
            visible
          />
          <ActionCard
            icon={<HelpCircle size={16} strokeWidth={1.8} />}
            title="Request clarification"
            detail="Flag anything that needs the couple's sign-off."
            visible
          />
        </section>

        <footer className="mt-10 border-t border-border pt-6 pb-12">
          <p className="flex items-center gap-1.5 text-[11px] text-ink-faint">
            <Sparkles size={10} strokeWidth={1.6} className="text-saffron" />
            <span>
              Preview only — this is what {vendorName} sees when logged in.
              Content and scope sync live.
            </span>
          </p>
        </footer>
      </main>
    </div>
  );
}

// ── Small preview primitives ───────────────────────────────────────────────

function PermissionChip({
  icon,
  label,
  value,
  visible,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  visible: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-md border px-3.5 py-2.5",
        visible
          ? "border-sage/30 bg-sage-pale/20"
          : "border-dashed border-ink/15 bg-ivory-warm/30 opacity-70",
      )}
    >
      <div className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-faint">
        <span className={visible ? "text-sage" : "text-ink-faint"}>{icon}</span>
        {label}
      </div>
      <p
        className={cn(
          "mt-0.5 text-[12px]",
          visible ? "text-ink" : "italic text-ink-muted",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function ActionCard({
  icon,
  title,
  detail,
  visible,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
  visible: boolean;
}) {
  if (!visible) {
    return (
      <div className="flex items-start gap-3 rounded-md border border-dashed border-ink/15 bg-ivory-warm/30 p-4 opacity-60">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-ink-faint">
          {icon}
        </span>
        <div>
          <p className="text-[13px] font-medium text-ink-muted">{title}</p>
          <p className="mt-0.5 text-[11.5px] italic text-ink-faint">
            Unavailable at your permission level.
          </p>
        </div>
      </div>
    );
  }
  return (
    <button
      type="button"
      className="group flex items-start gap-3 rounded-md border border-border bg-white p-4 text-left transition-all hover:border-saffron hover:bg-saffron-pale/20"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-saffron-pale/60 text-saffron">
        {icon}
      </span>
      <div>
        <p className="text-[13px] font-medium text-ink">{title}</p>
        <p className="mt-0.5 text-[11.5px] text-ink-muted">{detail}</p>
      </div>
    </button>
  );
}

// ── Permission → vendor-side copy ──────────────────────────────────────────

function guestLabel(v: GuestVisibility): string {
  return {
    full_contact: "Full list + contact",
    names_and_dietary: "Names + dietary",
    counts_only: "Counts only",
    none: "Hidden",
  }[v];
}

function rosLabel(v: RunOfShowVisibility): string {
  return {
    full_schedule: "Full schedule",
    their_plus_adjacent: "Your blocks + adjacent",
    their_entries: "Your blocks only",
  }[v];
}

function budgetLabel(v: BudgetVisibility): string {
  return {
    full_budget: "Full budget",
    their_line_item: "Your line item",
    none: "Hidden",
  }[v];
}

function commsLabel(v: CommunicationsAccess): string {
  return {
    direct_with_couple: "Direct with couple",
    couple_and_planner: "Couple + planner",
    planner_only: "Via planner only",
  }[v];
}

// Export these helpers — useful if the real vendor-side app (Prompt 8) wants
// to reuse the same copy.
export { guestLabel, rosLabel, budgetLabel, commsLabel };
