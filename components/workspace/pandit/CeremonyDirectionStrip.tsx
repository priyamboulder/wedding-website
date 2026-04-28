"use client";

// ── Ceremony direction strip ──────────────────────────────────────────────
// Persistent strip that sits above Script/Roles/Samagri/Logistics. Summarises
// the ceremony brief — tradition, estimated duration, language — and flashes
// the top bottleneck (unassigned roles, open samagri, pending fire permit).

import { useMemo } from "react";
import { AlertTriangle, Clock, Globe, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { computeCeremonySnapshot, usePanditStore } from "@/stores/pandit-store";
import { Eyebrow } from "@/components/workspace/blocks/primitives";

export function CeremonyDirectionStrip() {
  const rituals = usePanditStore((s) => s.rituals);
  const brief = usePanditStore((s) => s.brief);
  const additions = usePanditStore((s) => s.additions);
  const snapshot = useMemo(
    () => computeCeremonySnapshot(rituals, brief, additions),
    [rituals, brief, additions],
  );
  const unassignedRoles = usePanditStore((s) => s.unassignedRolesCount());
  const openSamagri = usePanditStore((s) => s.samagriOpenCount());
  const firePermitStatus = usePanditStore(
    (s) => s.logistics.fire_permit_status,
  );
  const firePermitNeeded = usePanditStore((s) => s.logistics.fire_permit_needed);

  const flags: { label: string; severity: "warn" | "urgent" }[] = [];
  if (unassignedRoles > 0) {
    flags.push({
      label: `${unassignedRoles} role${unassignedRoles === 1 ? "" : "s"} unassigned`,
      severity: unassignedRoles > 3 ? "urgent" : "warn",
    });
  }
  if (openSamagri > 0) {
    flags.push({
      label: `${openSamagri} samagri not yet confirmed`,
      severity: openSamagri > 15 ? "urgent" : "warn",
    });
  }
  if (
    firePermitNeeded &&
    !/(secured|approved|not applicable)/i.test(firePermitStatus)
  ) {
    flags.push({ label: "Fire permit pending", severity: "warn" });
  }
  const top = flags[0];

  return (
    <section className="mb-5 rounded-lg border border-gold/30 bg-ivory-warm/40 px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <DirectionChip
          icon={<Sparkles size={12} strokeWidth={1.8} />}
          label="Tradition"
        >
          <span className="text-[12px] font-medium text-ink">
            {snapshot.tradition_label}
          </span>
        </DirectionChip>

        <DirectionChip
          icon={<Clock size={12} strokeWidth={1.8} />}
          label="Estimated runtime"
        >
          <span className="text-[12px] font-medium text-ink">
            ~{snapshot.estimated_duration_min} min
          </span>
          <span
            className="ml-1.5 font-mono text-[10px] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {snapshot.included_rituals}/{snapshot.total_rituals} rituals
          </span>
        </DirectionChip>

        <DirectionChip
          icon={<Globe size={12} strokeWidth={1.8} />}
          label="Language"
        >
          <span className="text-[12px] font-medium text-ink">
            {snapshot.language_label}
          </span>
        </DirectionChip>

        {top && (
          <DirectionChip
            icon={<AlertTriangle size={12} strokeWidth={1.8} />}
            label="Needs attention"
            tone={top.severity === "urgent" ? "rose" : "saffron"}
          >
            <span
              className={cn(
                "text-[12px] font-medium",
                top.severity === "urgent" ? "text-rose" : "text-saffron",
              )}
            >
              {top.label}
            </span>
            {flags.length > 1 && (
              <span
                className="ml-1.5 font-mono text-[10px] text-ink-muted"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                +{flags.length - 1} more
              </span>
            )}
          </DirectionChip>
        )}
      </div>
    </section>
  );
}

function DirectionChip({
  icon,
  label,
  children,
  tone = "ink",
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  tone?: "ink" | "saffron" | "rose";
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border bg-white px-2.5 py-1.5",
        tone === "saffron"
          ? "border-saffron/40"
          : tone === "rose"
            ? "border-rose/40"
            : "border-border",
      )}
    >
      <span
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-sm",
          tone === "saffron"
            ? "bg-saffron-pale/60 text-saffron"
            : tone === "rose"
              ? "bg-rose-pale/60 text-rose"
              : "bg-ivory-warm text-ink-muted",
        )}
      >
        {icon}
      </span>
      <div className="flex flex-col leading-tight">
        <Eyebrow>{label}</Eyebrow>
        <div className="mt-0.5 flex items-baseline">{children}</div>
      </div>
    </div>
  );
}
