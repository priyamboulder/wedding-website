"use client";

import { Calendar, DollarSign, Lock, MessageCircle, UserCircle2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeader } from "./WorkspaceContent";
import type {
  BudgetVisibility,
  CommunicationsAccess,
  GuestVisibility,
  RunOfShowVisibility,
  VendorListVisibility,
  VendorWorkspacePermissions,
} from "@/types/vendor-workspace";

type PermissionKey = keyof VendorWorkspacePermissions;

interface RowDef<K extends PermissionKey> {
  key: K;
  label: string;
  description: string;
  icon: React.ReactNode;
  options: Array<{
    value: VendorWorkspacePermissions[K];
    label: string;
    detail: string;
    tone?: "sage" | "saffron" | "rose" | "ink";
  }>;
}

const GUEST_ROW: RowDef<"guests"> = {
  key: "guests",
  label: "Guest list",
  description: "How much the vendor can see about your guest list.",
  icon: <Users size={14} strokeWidth={1.8} />,
  options: [
    { value: "full_contact" as GuestVisibility, label: "Full list with contact", detail: "Names, dietary, phone, email — appropriate for caterers managing RSVPs.", tone: "rose" },
    { value: "names_and_dietary" as GuestVisibility, label: "Names + dietary", detail: "Names and dietary tags only. No contact details.", tone: "saffron" },
    { value: "counts_only" as GuestVisibility, label: "Counts only", detail: "Totals and splits (veg/non-veg/kids) — no individual names.", tone: "sage" },
    { value: "none" as GuestVisibility, label: "Hidden", detail: "Vendor sees nothing about guests.", tone: "ink" },
  ],
};

const VENDOR_ROW: RowDef<"other_vendors"> = {
  key: "other_vendors",
  label: "Other vendors",
  description: "Whether the vendor can see who else is working the wedding.",
  icon: <UserCircle2 size={14} strokeWidth={1.8} />,
  options: [
    { value: "all_vendors" as VendorListVisibility, label: "Can see all vendors", detail: "Useful for teams that coordinate directly (photo + florals, caterer + planner).", tone: "rose" },
    { value: "schedule_only" as VendorListVisibility, label: "Schedule adjacencies only", detail: "Sees vendors with overlapping call times. No full directory.", tone: "saffron" },
    { value: "none" as VendorListVisibility, label: "None", detail: "Vendor only sees themselves.", tone: "sage" },
  ],
};

const BUDGET_ROW: RowDef<"budget"> = {
  key: "budget",
  label: "Budget",
  description: "What line items the vendor can see in the budget.",
  icon: <DollarSign size={14} strokeWidth={1.8} />,
  options: [
    { value: "full_budget" as BudgetVisibility, label: "Full budget", detail: "Unusual — typically reserved for planners, not vendors.", tone: "rose" },
    { value: "their_line_item" as BudgetVisibility, label: "Their line item only", detail: "Vendor sees their own contracted amount and invoice state.", tone: "saffron" },
    { value: "none" as BudgetVisibility, label: "Hidden", detail: "Budget handled outside Ananya.", tone: "ink" },
  ],
};

const ROS_ROW: RowDef<"run_of_show"> = {
  key: "run_of_show",
  label: "Run of Show",
  description: "How much of the event timeline the vendor can see.",
  icon: <Calendar size={14} strokeWidth={1.8} />,
  options: [
    { value: "full_schedule" as RunOfShowVisibility, label: "Full schedule", detail: "Complete multi-day run-of-show.", tone: "rose" },
    { value: "their_plus_adjacent" as RunOfShowVisibility, label: "Their entries + adjacent", detail: "Their blocks plus the entries 30 min before and after — enough to hand off cleanly.", tone: "saffron" },
    { value: "their_entries" as RunOfShowVisibility, label: "Their entries only", detail: "Just the blocks on their own call sheet.", tone: "sage" },
  ],
};

const COMMS_ROW: RowDef<"communications"> = {
  key: "communications",
  label: "Communications",
  description: "How the vendor reaches you and the planner.",
  icon: <MessageCircle size={14} strokeWidth={1.8} />,
  options: [
    { value: "direct_with_couple" as CommunicationsAccess, label: "Direct with couple", detail: "Vendor messages the couple directly — planner CC'd.", tone: "rose" },
    { value: "couple_and_planner" as CommunicationsAccess, label: "Couple + planner", detail: "Either can respond; planner steers.", tone: "saffron" },
    { value: "planner_only" as CommunicationsAccess, label: "Planner only", detail: "Planner is the single point of contact — couple not in threads.", tone: "sage" },
  ],
};

// Tuple of rows, each row's `key` narrows the allowed `options[].value` at the
// call site. We erase to `RowDef<PermissionKey>` only for iteration.
const ROWS: Array<RowDef<PermissionKey>> = [
  GUEST_ROW,
  VENDOR_ROW,
  BUDGET_ROW,
  ROS_ROW,
  COMMS_ROW,
] as Array<RowDef<PermissionKey>>;

interface PermissionsPanelProps {
  permissions: VendorWorkspacePermissions;
  onChange: <K extends PermissionKey>(
    key: K,
    value: VendorWorkspacePermissions[K],
  ) => void;
}

export function PermissionsPanel({
  permissions,
  onChange,
}: PermissionsPanelProps) {
  return (
    <section className="space-y-5">
      <SectionHeader
        eyebrow="Permissions & Visibility"
        title="What this vendor can see"
        description="Scope the vendor's view before sending the invitation. You can adjust these at any time — changes apply on their next load."
      />

      <div className="rounded-lg border border-border bg-white">
        {ROWS.map((row, i) => (
          <PermissionRow
            key={row.key}
            row={row}
            current={permissions[row.key]}
            onChange={(v) => onChange(row.key, v)}
            last={i === ROWS.length - 1}
          />
        ))}
      </div>

      <div className="flex items-start gap-2 rounded-md border border-gold/20 bg-gold-pale/30 px-4 py-3">
        <Lock size={14} strokeWidth={1.8} className="mt-0.5 shrink-0 text-gold" />
        <p className="text-[12px] leading-relaxed text-ink-soft">
          <span className="font-medium text-ink">Row-level security.</span>{" "}
          Permissions enforce at the database level — even if a vendor bookmarks
          a link, Supabase RLS prevents them reading anything outside their
          scope.
        </p>
      </div>
    </section>
  );
}

function PermissionRow<K extends PermissionKey>({
  row,
  current,
  onChange,
  last,
}: {
  row: RowDef<K>;
  current: VendorWorkspacePermissions[K];
  onChange: (v: VendorWorkspacePermissions[K]) => void;
  last: boolean;
}) {
  return (
    <div
      className={cn(
        "grid gap-4 p-5 md:grid-cols-[240px_1fr]",
        !last && "border-b border-border",
      )}
    >
      <div>
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ivory-warm text-ink-muted">
            {row.icon}
          </span>
          <h5 className="text-[13.5px] font-medium text-ink">{row.label}</h5>
        </div>
        <p className="mt-2 text-[11.5px] leading-relaxed text-ink-muted">
          {row.description}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {row.options.map((opt) => {
          const active = opt.value === current;
          return (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "flex items-start gap-3 rounded-md border px-3.5 py-2.5 text-left transition-all",
                active
                  ? "border-saffron bg-saffron-pale/30"
                  : "border-border bg-white hover:border-ink/20 hover:bg-ivory-warm/30",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
                  active ? "border-saffron" : "border-ink/25",
                )}
              >
                {active && (
                  <span className="h-1.5 w-1.5 rounded-full bg-saffron" />
                )}
              </span>
              <div className="flex-1">
                <p className="text-[13px] font-medium text-ink">{opt.label}</p>
                <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-muted">
                  {opt.detail}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
