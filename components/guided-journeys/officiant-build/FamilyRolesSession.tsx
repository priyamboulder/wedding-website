"use client";

// ── Build Session 2 · Family roles ───────────────────────────────────────
// Reads & writes through `usePanditStore` so this session is in permanent
// two-way sync with Tab 4 of the full workspace. Roles are pre-seeded from
// the ritual library (each ritual declares which roles it needs), grouped
// by side, and each tagged with practice / sensitivity / privacy flags.
//
// `sensitivity_note` and `is_private` are planner-only — the toggle to
// reveal them only appears when a planner has been invited to the
// workspace. v1: the planner role isn't fully wired yet, so we expose the
// planner-mode toggle locally (mirroring the full Tab 4 UI).

import { useMemo, useState } from "react";
import {
  AlertCircle,
  Eye,
  EyeOff,
  HeartHandshake,
  Lock,
  Plus,
  Trash2,
  Users2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePanditStore } from "@/stores/pandit-store";
import type { CeremonyFamilyRole, RoleSide } from "@/types/pandit";
import {
  Eyebrow,
  MiniStat,
  PanelCard,
} from "@/components/workspace/blocks/primitives";

const SIDE_LABELS: Record<RoleSide, string> = {
  brides: "Bride's side",
  grooms: "Groom's side",
  shared: "Shared",
};

export function FamilyRolesSession() {
  const roles = usePanditStore((s) => s.roles);
  const rituals = usePanditStore((s) => s.rituals);
  const updateRole = usePanditStore((s) => s.updateRole);
  const addRole = usePanditStore((s) => s.addRole);
  const deleteRole = usePanditStore((s) => s.deleteRole);

  const [plannerMode, setPlannerMode] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [hideSkipped, setHideSkipped] = useState(true);
  const [addingSide, setAddingSide] = useState<RoleSide | null>(null);
  const [newRoleName, setNewRoleName] = useState("");

  const includedWithoutRole = useMemo(() => {
    const assigned = new Set(
      roles
        .filter((r) => r.linked_ritual_id && r.primary_name.trim())
        .map((r) => r.linked_ritual_id!),
    );
    return rituals
      .filter((r) => r.inclusion === "yes" && !assigned.has(r.id));
  }, [roles, rituals]);

  const stats = useMemo(() => {
    const total = roles.length;
    const unassigned = roles.filter((r) => !r.primary_name.trim()).length;
    const practice = roles.filter((r) => r.practice_needed).length;
    const privateNotes = roles.filter((r) =>
      r.planner_private_note.trim(),
    ).length;
    const skippedRoles = roles.filter((r) => {
      if (!r.linked_ritual_id) return false;
      return rituals.find((rit) => rit.id === r.linked_ritual_id)
        ?.inclusion === "no";
    }).length;
    return { total, unassigned, practice, privateNotes, skippedRoles };
  }, [roles, rituals]);

  const grouped: Record<RoleSide, CeremonyFamilyRole[]> = {
    brides: roles.filter((r) => r.side === "brides"),
    grooms: roles.filter((r) => r.side === "grooms"),
    shared: roles.filter((r) => r.side === "shared"),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12.5px] leading-relaxed text-ink-muted max-w-2xl">
          Roles are pre-seeded from the rituals you're including. Assign
          each role, flag what needs practice, and capture sensitivities
          your planner needs to know about.
        </p>
        <button
          type="button"
          onClick={() => setPlannerMode((v) => !v)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors",
            plannerMode
              ? "border-saffron bg-saffron-pale/40 text-saffron"
              : "border-border bg-white text-ink-muted hover:border-saffron/40",
          )}
        >
          {plannerMode ? (
            <Eye size={12} strokeWidth={1.8} />
          ) : (
            <EyeOff size={12} strokeWidth={1.8} />
          )}
          Planner view {plannerMode ? "on" : "off"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MiniStat
          label="Total roles"
          value={stats.total}
          hint="Across both sides"
        />
        <MiniStat
          label="Unassigned"
          value={stats.unassigned}
          hint={stats.unassigned === 0 ? "All assigned" : "Needs attention"}
          tone={stats.unassigned === 0 ? "sage" : "saffron"}
        />
        <MiniStat
          label="Need practice"
          value={stats.practice}
          hint="Run-throughs before ceremony"
        />
        <MiniStat
          label="Private notes"
          value={plannerMode ? stats.privateNotes : "—"}
          hint={plannerMode ? "Planner-only" : "Hidden — turn on planner view"}
          tone="rose"
        />
      </div>

      {includedWithoutRole.length > 0 && (
        <div className="flex flex-wrap items-start gap-3 rounded-md border border-amber-400/60 bg-amber-50/50 p-3">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-700">
            <AlertCircle size={12} strokeWidth={1.8} />
          </span>
          <div className="flex-1 min-w-[220px]">
            <div className="text-[12.5px] font-medium text-ink">
              {includedWithoutRole.length} included ritual
              {includedWithoutRole.length === 1 ? "" : "s"} without an
              assigned role
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {includedWithoutRole.map((r) => (
                <span
                  key={r.id}
                  className="inline-flex items-center gap-1 rounded-sm bg-white px-2 py-0.5 text-[11px] text-ink"
                >
                  <span className="font-medium">{r.name_english}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-[11.5px] text-ink-muted">
        <label className="inline-flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={hideSkipped}
            onChange={(e) => setHideSkipped(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-border text-saffron focus:ring-saffron"
          />
          Hide roles tied to skipped rituals
        </label>
      </div>

      {(["brides", "grooms", "shared"] as RoleSide[]).map((side) => (
        <PanelCard
          key={side}
          icon={
            side === "shared" ? (
              <HeartHandshake size={14} strokeWidth={1.6} />
            ) : (
              <Users2 size={14} strokeWidth={1.6} />
            )
          }
          title={SIDE_LABELS[side]}
          badge={
            <button
              type="button"
              onClick={() => {
                setAddingSide(addingSide === side ? null : side);
                setNewRoleName("");
              }}
              className="inline-flex items-center gap-1 rounded-sm border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted hover:border-saffron/40 hover:text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <Plus size={10} strokeWidth={2} /> Add role
            </button>
          }
        >
          {addingSide === side && (
            <div className="mb-3 flex items-center gap-2">
              <input
                type="text"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="Role name — e.g. Kalash holder"
                className="flex-1 rounded-md border border-border bg-white px-3 py-2 text-[12.5px] text-ink focus:border-saffron focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newRoleName.trim()) {
                    addRole(newRoleName.trim(), side);
                    setNewRoleName("");
                    setAddingSide(null);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (newRoleName.trim()) {
                    addRole(newRoleName.trim(), side);
                    setNewRoleName("");
                    setAddingSide(null);
                  }
                }}
                className="rounded-md bg-ink px-3 py-2 text-[12px] font-medium text-ivory hover:bg-ink-soft"
              >
                Add
              </button>
            </div>
          )}
          <div className="space-y-2">
            {grouped[side].length === 0 && (
              <p className="text-[12px] italic text-ink-faint">
                No roles on this side yet.
              </p>
            )}
            {grouped[side]
              .filter((role) => {
                if (!hideSkipped) return true;
                if (!role.linked_ritual_id) return true;
                return (
                  rituals.find((r) => r.id === role.linked_ritual_id)
                    ?.inclusion !== "no"
                );
              })
              .map((role) => {
                const linked = rituals.find(
                  (r) => r.id === role.linked_ritual_id,
                );
                const skipped = linked?.inclusion === "no";
                const open = expanded === role.id;
                const assigned = role.primary_name.trim().length > 0;
                return (
                  <div
                    key={role.id}
                    className={cn(
                      "rounded-md border transition-colors",
                      skipped
                        ? "border-dashed border-stone-300 bg-ivory-warm/20 opacity-60"
                        : assigned
                          ? "border-border bg-white"
                          : "border-amber-400/60 bg-amber-50/40",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setExpanded(open ? null : role.id)}
                      aria-expanded={open}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-serif text-[14.5px] leading-tight text-ink">
                          {role.role_name}
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11.5px] text-ink-muted">
                          {assigned ? (
                            <>
                              <span className="font-medium text-ink">
                                {role.primary_name}
                              </span>
                              {role.primary_relationship && (
                                <span>· {role.primary_relationship}</span>
                              )}
                            </>
                          ) : (
                            <span className="italic text-amber-700">
                              Unassigned
                            </span>
                          )}
                          {linked && (
                            <span
                              className="ml-1 rounded-sm bg-ivory-warm/70 px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-faint"
                              style={{ fontFamily: "var(--font-mono)" }}
                            >
                              {linked.name_english}
                              {skipped ? " · skipped" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                      {role.practice_needed && (
                        <span className="rounded-full bg-saffron-pale/40 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-saffron">
                          Practice
                        </span>
                      )}
                      {plannerMode && role.planner_private_note.trim() && (
                        <Lock
                          size={11}
                          strokeWidth={1.8}
                          className="text-rose"
                        />
                      )}
                    </button>

                    {open && (
                      <div className="space-y-3 border-t border-border/40 px-3 py-3">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <div>
                            <Eyebrow className="mb-1">Assigned to</Eyebrow>
                            <input
                              value={role.primary_name}
                              onChange={(e) =>
                                updateRole(role.id, {
                                  primary_name: e.target.value,
                                })
                              }
                              placeholder="Name"
                              className="w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] focus:border-saffron focus:outline-none"
                            />
                          </div>
                          <div>
                            <Eyebrow className="mb-1">Relationship</Eyebrow>
                            <input
                              value={role.primary_relationship}
                              onChange={(e) =>
                                updateRole(role.id, {
                                  primary_relationship: e.target.value,
                                })
                              }
                              placeholder="Bride's father · Groom's sister"
                              className="w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] focus:border-saffron focus:outline-none"
                            />
                          </div>
                          <div>
                            <Eyebrow className="mb-1">Backup</Eyebrow>
                            <input
                              value={role.backup_name}
                              onChange={(e) =>
                                updateRole(role.id, {
                                  backup_name: e.target.value,
                                })
                              }
                              placeholder="Backup name (optional)"
                              className="w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] focus:border-saffron focus:outline-none"
                            />
                          </div>
                          <div>
                            <Eyebrow className="mb-1">Accommodations</Eyebrow>
                            <input
                              value={role.accommodation_notes}
                              onChange={(e) =>
                                updateRole(role.id, {
                                  accommodation_notes: e.target.value,
                                })
                              }
                              placeholder="Knee issues, mobility, dietary…"
                              className="w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] focus:border-saffron focus:outline-none"
                            />
                          </div>
                        </div>

                        <label className="flex items-center gap-2 text-[12px] text-ink">
                          <input
                            type="checkbox"
                            checked={role.practice_needed}
                            onChange={(e) =>
                              updateRole(role.id, {
                                practice_needed: e.target.checked,
                              })
                            }
                            className="h-3.5 w-3.5 rounded border-border text-saffron"
                          />
                          Needs practice before the ceremony
                        </label>

                        {plannerMode && (
                          <div className="rounded-md border border-rose/30 bg-rose-pale/10 p-3">
                            <Eyebrow className="mb-1 text-rose">
                              <Lock
                                size={10}
                                strokeWidth={1.8}
                                className="mr-1 inline align-text-bottom"
                              />
                              Planner-only sensitivity note
                            </Eyebrow>
                            <p className="mb-2 text-[11px] text-ink-muted">
                              Hidden from couple-shared exports. Surface
                              context the planner needs to handle this role
                              gracefully.
                            </p>
                            <textarea
                              value={role.planner_private_note}
                              onChange={(e) =>
                                updateRole(role.id, {
                                  planner_private_note: e.target.value,
                                })
                              }
                              rows={2}
                              placeholder="Parents are divorced — both involved but seated separately…"
                              className="w-full rounded-md border border-rose/30 bg-white px-2.5 py-1.5 text-[12px] focus:border-rose focus:outline-none"
                            />
                          </div>
                        )}

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => deleteRole(role.id)}
                            className="inline-flex items-center gap-1 rounded text-[11px] text-ink-faint hover:text-rose"
                          >
                            <Trash2 size={11} strokeWidth={1.8} /> Remove role
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </PanelCard>
      ))}
    </div>
  );
}
