"use client";

// ── PlanningToolkit ─────────────────────────────────────────────────────
// Slim row list of doorways into the deeper modules. Each row: small
// dusty-blush icon + tool name + optional stat in gray Inter.
// Hover lifts the row to a light blush tint. No cards.

import Link from "next/link";
import {
  CalendarRange,
  ClipboardList,
  Gift,
  Heart,
  Mail,
  ScrollText,
  Sparkles,
  UsersRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useChecklistStore } from "@/stores/checklist-store";
import { useGuestRosterStore } from "@/stores/guest-roster-store";
import { useFinanceStore } from "@/stores/finance-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

interface ToolEntry {
  href: string;
  label: string;
  Icon: LucideIcon;
  stat?: string | null;
}

export function PlanningToolkit() {
  const items = useChecklistStore((s) => s.items);
  const roster = useGuestRosterStore((s) => s.entries);
  const totalBudgetCents = useFinanceStore(
    (s) => s.settings.total_budget_cents,
  );
  const categories = useWorkspaceStore((s) => s.categories);

  const checklistOpen = items.filter(
    (i) => i.status !== "done" && i.status !== "not_applicable",
  ).length;
  const bookedVendors = categories.filter((c) => c.status === "assigned").length;

  const tools: ToolEntry[] = [
    {
      href: "/checklist",
      label: "Checklist",
      Icon: ClipboardList,
      stat: checklistOpen > 0 ? `${checklistOpen} open` : "all done",
    },
    {
      href: "/guests",
      label: "Guest Manager",
      Icon: UsersRound,
      stat: roster.length > 0 ? `${roster.length} listed` : null,
    },
    {
      href: "/vendors",
      label: "Vendor Hub",
      Icon: Heart,
      stat: bookedVendors > 0 ? `${bookedVendors} booked` : null,
    },
    {
      href: "/workspace/finance",
      label: "Finance",
      Icon: Wallet,
      stat:
        totalBudgetCents > 0
          ? `$${Math.round(totalBudgetCents / 100).toLocaleString()}`
          : null,
    },
    { href: "/registry", label: "Registry", Icon: Gift },
    { href: "/studio", label: "Studio", Icon: Sparkles },
    { href: "/stationery", label: "Stationery", Icon: Mail },
    { href: "/guests/seating-chart", label: "Seating", Icon: ScrollText },
    { href: "/app/timeline", label: "Timeline", Icon: CalendarRange },
  ];

  return (
    <section>
      <h2 className="dash-section-title mb-2">Planning toolkit</h2>
      <ul className="flex flex-col">
        {tools.map((tool) => (
          <ToolRow key={tool.href} tool={tool} />
        ))}
      </ul>
    </section>
  );
}

function ToolRow({ tool }: { tool: ToolEntry }) {
  const { Icon } = tool;
  return (
    <li>
      <Link
        href={tool.href}
        className="group flex items-center gap-2.5 rounded-[3px] px-1.5 py-1.5 transition-colors hover:bg-[color:var(--dash-blush-light)]"
      >
        <Icon
          size={13}
          strokeWidth={1.8}
          className="shrink-0 text-[color:var(--dash-blush-deep)]"
        />
        <span
          className="min-w-0 flex-1 truncate text-[13px] text-[color:var(--dash-text)]"
          style={{ fontFamily: "Outfit, var(--font-sans), sans-serif" }}
        >
          {tool.label}
        </span>
        {tool.stat && (
          <span
            className="shrink-0 text-[10px] tabular-nums text-[color:var(--dash-text-faint)]"
            style={{ fontFamily: "Inter, var(--font-sans), sans-serif" }}
          >
            {tool.stat}
          </span>
        )}
      </Link>
    </li>
  );
}
