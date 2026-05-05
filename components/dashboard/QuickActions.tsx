"use client";

// ── QuickActions ───────────────────────────────────────────────────────
// Bottom of the sidebar pocket. Routes the couple to surfaces that
// AREN'T already a button on the main column — main-column primaries
// (add note, add event, add photo) are reachable inline, so listing
// them here would be duplication. Instead we surface "next-step"
// shortcuts that are buried deeper: setting a budget, importing the
// guest list, exploring the vendor catalog. Each one is hidden once
// its underlying state is non-empty so the section keeps shrinking
// as the couple moves through planning.

import Link from "next/link";
import {
  PiggyBank,
  Search,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useFinanceStore } from "@/stores/finance-store";
import { useGuestRosterStore } from "@/stores/guest-roster-store";

interface ActionEntry {
  href: string;
  label: string;
  Icon: LucideIcon;
  hint?: string;
}

export function QuickActions() {
  const totalBudgetCents = useFinanceStore((s) => s.settings.total_budget_cents);
  const roster = useGuestRosterStore((s) => s.entries);

  const actions: ActionEntry[] = [];
  if (totalBudgetCents <= 0) {
    actions.push({
      href: "/finance",
      label: "Set your budget",
      Icon: PiggyBank,
      hint: "Anchors every estimate",
    });
  }
  if (roster.length === 0) {
    actions.push({
      href: "/guests",
      label: "Import your guest list",
      Icon: Users,
      hint: "Paste a sheet or upload CSV",
    });
  }
  actions.push({
    href: "/vendors",
    label: "Explore vendors",
    Icon: Search,
    hint: "Browse the catalog",
  });

  if (actions.length === 0) return null;

  return (
    <section>
      <h2 className="dash-section-title mb-2">Quick actions</h2>
      <ul className="flex flex-col gap-1.5">
        {actions.map((a) => (
          <ActionRow key={a.href} action={a} />
        ))}
      </ul>
    </section>
  );
}

function ActionRow({ action }: { action: ActionEntry }) {
  const { Icon, href, label, hint } = action;
  return (
    <li>
      <Link
        href={href}
        className="group flex items-start gap-2.5 rounded-[3px] px-1.5 py-1.5 transition-colors hover:bg-[color:var(--dash-blush-light)]"
      >
        <Icon
          size={13}
          strokeWidth={1.8}
          className="mt-0.5 shrink-0 text-[color:var(--dash-blush-deep)]"
        />
        <div className="min-w-0 flex-1">
          <p
            className="truncate text-[13px] text-[color:var(--dash-text)]"
            style={{ fontFamily: "Outfit, var(--font-sans), sans-serif" }}
          >
            {label}
          </p>
          {hint && (
            <p
              className="truncate text-[11px] italic text-[color:var(--dash-text-faint)]"
              style={{
                fontFamily:
                  "var(--font-display), 'Cormorant Garamond', Georgia, serif",
              }}
            >
              {hint}
            </p>
          )}
        </div>
      </Link>
    </li>
  );
}
