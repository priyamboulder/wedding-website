"use client";

// Role switcher — local-first simulation of the planner/couple/vendor
// permission model. Swaps the `currentRole` in workspace-store; downstream
// UI gates editability and attribution off that single field. This stands
// in for Supabase auth until the migration is scoped.

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { type WorkspaceRole } from "@/types/workspace";
import { useWorkspaceRoles } from "@/lib/couple-identity";

export function RoleSwitcher() {
  const currentRole = useWorkspaceStore((s) => s.currentRole);
  const setCurrentRole = useWorkspaceStore((s) => s.setCurrentRole);
  const workspaceRoles = useWorkspaceRoles();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const active = workspaceRoles.find((r) => r.id === currentRole) ?? workspaceRoles[0];
  const isVendor = currentRole === "vendor";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "inline-flex items-center gap-2 rounded-md border px-2 py-1.5 text-[12px] transition-colors",
          isVendor
            ? "border-gold/60 bg-gold-light/20 text-ink"
            : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-ink",
        )}
      >
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full font-mono text-[9px] font-semibold uppercase tracking-[0.04em]",
            active.tint,
          )}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {isVendor ? <Eye size={12} strokeWidth={1.8} /> : active.initials}
        </span>
        <span className="flex flex-col items-start leading-tight">
          <span className="text-[11px] font-medium text-ink">{active.name}</span>
          <span
            className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {labelFor(currentRole)}
          </span>
        </span>
        <ChevronDown size={12} strokeWidth={1.8} className="text-ink-muted" />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-[calc(100%+6px)] z-20 w-[260px] rounded-lg border border-border bg-white py-1.5 shadow-[0_6px_24px_-10px_rgba(26,26,26,0.25)]"
        >
          <p
            className="px-3 pb-1 pt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Acting as
          </p>
          {workspaceRoles.map((r) => {
            const selected = r.id === currentRole;
            return (
              <button
                key={r.id}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  setCurrentRole(r.id as WorkspaceRole);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors",
                  selected ? "bg-ivory/60" : "hover:bg-ivory/40",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[9px] font-semibold uppercase tracking-[0.04em]",
                    r.tint,
                  )}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {r.id === "vendor" ? <Eye size={13} strokeWidth={1.8} /> : r.initials}
                </span>
                <div className="flex flex-1 flex-col">
                  <span className="text-[12.5px] text-ink">{r.name}</span>
                  <span
                    className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-muted"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {r.subtitle}
                  </span>
                </div>
                {selected && (
                  <Check size={13} strokeWidth={2} className="text-saffron" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function labelFor(role: WorkspaceRole): string {
  switch (role) {
    case "planner":
      return "Planner";
    case "priya":
    case "arjun":
      return "Couple";
    case "vendor":
      return "Vendor view";
  }
}
