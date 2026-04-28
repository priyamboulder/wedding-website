"use client";

// ── Family Roles ──────────────────────────────────────────────────────────
// Who does what — and quietly who doesn't. Indian ceremonies are logistically
// heavy AND politically sensitive. The planner-private note captures the
// latter without surfacing it to pandit or family.

import { useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Eye,
  EyeOff,
  HeartHandshake,
  Link2,
  Lock,
  Plus,
  Trash2,
  Users2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePanditStore } from "@/stores/pandit-store";
import type { CeremonyFamilyRole, RoleSide } from "@/types/pandit";
import {
  Eyebrow,
  MiniStat,
  PanelCard,
  SectionHeader,
} from "@/components/workspace/blocks/primitives";
import {
  useGuestRosterStore,
  type GuestRosterEntry,
} from "@/stores/guest-roster-store";

const SIDE_LABELS: Record<RoleSide, string> = {
  brides: "Bride's side",
  grooms: "Groom's side",
  shared: "Shared",
};

export function FamilyRoles() {
  const roles = usePanditStore((s) => s.roles);
  const rituals = usePanditStore((s) => s.rituals);
  const updateRole = usePanditStore((s) => s.updateRole);
  const addRole = usePanditStore((s) => s.addRole);
  const deleteRole = usePanditStore((s) => s.deleteRole);

  const [plannerMode, setPlannerMode] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [addingSide, setAddingSide] = useState<RoleSide | null>(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [hideSkippedRituals, setHideSkippedRituals] = useState(true);

  // Included-ritual → list of roles (or null if no role covers it yet).
  // Surfaces rituals the couple has included but haven't assigned anyone to.
  const includedRitualsWithoutRoles = useMemo(() => {
    const assignedRitualIds = new Set(
      roles
        .filter((r) => r.linked_ritual_id && r.primary_name.trim())
        .map((r) => r.linked_ritual_id!),
    );
    return rituals
      .filter((r) => r.inclusion === "yes")
      .filter((r) => !assignedRitualIds.has(r.id));
  }, [roles, rituals]);

  const { unassigned, practiceNeeded } = useMemo(() => {
    const unassigned = roles.filter((r) => !r.primary_name.trim()).length;
    const practiceNeeded = roles.filter((r) => r.practice_needed).length;
    return { unassigned, practiceNeeded };
  }, [roles]);

  const grouped: Record<RoleSide, CeremonyFamilyRole[]> = {
    brides: roles.filter((r) => r.side === "brides"),
    grooms: roles.filter((r) => r.side === "grooms"),
    shared: roles.filter((r) => r.side === "shared"),
  };

  const privateNoteCount = roles.filter((r) =>
    r.planner_private_note.trim(),
  ).length;

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Family Roles"
        title="Who does what — and quietly, who doesn't"
        description="Role assignments are logistical and emotional. Capture accommodations (grandpa can't sit on the floor), practice needs (knots need practice), and — visible only in planner mode — the family sensitivities that shape who does what."
        right={
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
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MiniStat
          label="Total roles"
          value={roles.length}
          hint="Across both sides"
        />
        <MiniStat
          label="Unassigned"
          value={unassigned}
          hint={unassigned === 0 ? "All assigned" : "Needs attention"}
          tone={unassigned === 0 ? "sage" : "saffron"}
        />
        <MiniStat
          label="Need practice"
          value={practiceNeeded}
          hint="Run-throughs before ceremony"
        />
        <MiniStat
          label="Private notes"
          value={plannerMode ? privateNoteCount : "—"}
          hint={plannerMode ? "Planner-only" : "Hidden — turn on planner view"}
          tone="rose"
        />
      </div>

      {/* ── Rituals with no assigned roles ──────────────────────────────── */}
      {includedRitualsWithoutRoles.length > 0 && (
        <div className="flex flex-wrap items-start gap-3 rounded-md border border-amber-400/60 bg-amber-50/50 p-3">
          <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-md bg-amber-100 text-amber-700">
            <AlertCircle size={12} strokeWidth={1.8} />
          </span>
          <div className="flex-1 min-w-[220px]">
            <div className="text-[12.5px] font-medium text-ink">
              Included rituals without assigned roles
            </div>
            <p className="mt-0.5 text-[11.5px] text-ink-muted">
              These rituals are in your ceremony — assign family members so
              your officiant knows who's doing what.
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {includedRitualsWithoutRoles.map((r) => (
                <span
                  key={r.id}
                  className="inline-flex items-center gap-1 rounded-sm bg-white px-2 py-0.5 text-[11px] text-ink"
                >
                  <span className="font-medium">{r.name_english}</span>
                  <span
                    className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-muted"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {r.traditional_participants || "no participants noted"}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Toggle: hide roles whose ritual was skipped ────────────────── */}
      <div className="flex items-center gap-2 text-[11.5px] text-ink-muted">
        <label className="inline-flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={hideSkippedRituals}
            onChange={(e) => setHideSkippedRituals(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-border text-saffron focus:ring-saffron"
          />
          Hide roles tied to skipped rituals
        </label>
        <span className="text-ink-faint">·</span>
        <span>
          Role visibility follows your Vision & Ceremony Brief decisions.
        </span>
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
              <Plus size={10} strokeWidth={2} />
              Add role
            </button>
          }
        >
          {addingSide === side && (
            <div className="mb-3 flex items-center gap-2">
              <input
                type="text"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="Role name — e.g. 'Kalash holder'"
                className="flex-1 rounded-md border border-border bg-white px-3 py-2 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
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
              <button
                type="button"
                onClick={() => {
                  setAddingSide(null);
                  setNewRoleName("");
                }}
                className="rounded-md border border-border px-3 py-2 text-[12px] text-ink-muted hover:border-saffron/40"
              >
                Cancel
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
                if (!hideSkippedRituals) return true;
                if (!role.linked_ritual_id) return true;
                const linked = rituals.find(
                  (r) => r.id === role.linked_ritual_id,
                );
                return !linked || linked.inclusion !== "no";
              })
              .map((role) => {
              const linkedRitual = rituals.find(
                (r) => r.id === role.linked_ritual_id,
              );
              const ritualSkipped =
                linkedRitual && linkedRitual.inclusion === "no";
              const ritualDiscussed =
                linkedRitual && linkedRitual.inclusion === "discuss";
              const open = expanded === role.id;
              const assigned = role.primary_name.trim().length > 0;
              return (
                <div
                  key={role.id}
                  className={cn(
                    "rounded-md border transition-colors",
                    ritualSkipped
                      ? "border-dashed border-stone-300 bg-ivory-warm/20 opacity-60"
                      : assigned
                        ? "border-border bg-white"
                        : "border-amber-400/60 bg-amber-50/40",
                  )}
                >
                  <header className="flex items-center gap-3 px-3 py-2.5">
                    <button
                      type="button"
                      onClick={() => setExpanded(open ? null : role.id)}
                      className="flex-1 text-left"
                      aria-expanded={open}
                    >
                      <div className="font-serif text-[14.5px] leading-tight text-ink">
                        {role.role_name}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-ink-muted">
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
                        {linkedRitual && (
                          <span
                            className={cn(
                              "ml-2 rounded-sm px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em]",
                              ritualSkipped
                                ? "bg-stone-200 text-stone-600"
                                : ritualDiscussed
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-ivory-warm text-ink-muted",
                            )}
                          >
                            {linkedRitual.name_english}
                            {ritualSkipped ? " — skipped" : ""}
                            {ritualDiscussed ? " — discuss" : ""}
                          </span>
                        )}
                        {role.practice_needed && (
                          <span className="rounded-sm bg-saffron-pale/60 px-1.5 py-0.5 text-[10px] text-saffron">
                            practice
                          </span>
                        )}
                        {plannerMode &&
                          role.planner_private_note.trim() && (
                            <span className="inline-flex items-center gap-1 rounded-sm bg-rose-pale/60 px-1.5 py-0.5 text-[10px] text-rose">
                              <Lock size={8} strokeWidth={2} />
                              private note
                            </span>
                          )}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          confirm(
                            "Delete this role? This cannot be undone without re-adding it.",
                          )
                        ) {
                          deleteRole(role.id);
                        }
                      }}
                      className="p-1 text-ink-muted hover:text-rose"
                      aria-label="Delete role"
                    >
                      <Trash2 size={12} strokeWidth={1.8} />
                    </button>
                  </header>

                  {open && (
                    <div className="space-y-3 border-t border-border/60 px-3 py-3">
                      <Field
                        label="Tradition / default"
                        value={role.tradition_text}
                        onChange={(v) =>
                          updateRole(role.id, { tradition_text: v })
                        }
                        rows={2}
                      />
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <GuestAutocompleteField
                          label="Assigned to"
                          rosterSide={side === "shared" ? undefined : side}
                          linkedGuestId={role.linked_guest_id}
                          displayName={role.primary_name}
                          displayRelationship={role.primary_relationship}
                          onLink={(entry) =>
                            updateRole(role.id, {
                              linked_guest_id: entry.id,
                              primary_name:
                                `${entry.first_name} ${entry.last_name}`.trim(),
                              primary_relationship: entry.relationship,
                            })
                          }
                          onUnlink={() =>
                            updateRole(role.id, {
                              linked_guest_id: undefined,
                            })
                          }
                          onEditName={(v) =>
                            updateRole(role.id, { primary_name: v })
                          }
                          onEditRelationship={(v) =>
                            updateRole(role.id, { primary_relationship: v })
                          }
                        />
                        <GuestAutocompleteField
                          label="Backup"
                          rosterSide={side === "shared" ? undefined : side}
                          linkedGuestId={role.backup_guest_id}
                          displayName={role.backup_name}
                          displayRelationship=""
                          showRelationship={false}
                          onLink={(entry) =>
                            updateRole(role.id, {
                              backup_guest_id: entry.id,
                              backup_name:
                                `${entry.first_name} ${entry.last_name}`.trim(),
                            })
                          }
                          onUnlink={() =>
                            updateRole(role.id, {
                              backup_guest_id: undefined,
                            })
                          }
                          onEditName={(v) =>
                            updateRole(role.id, { backup_name: v })
                          }
                        />
                        <Field
                          label="Linked ritual"
                          value={role.linked_ritual_id ?? ""}
                          onChange={(v) =>
                            updateRole(role.id, {
                              linked_ritual_id: v || undefined,
                            })
                          }
                          rows={1}
                          select={rituals.map((r) => ({
                            value: r.id,
                            label: r.name_english,
                          }))}
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <Field
                          label="Physical requirements"
                          value={role.physical_requirements}
                          onChange={(v) =>
                            updateRole(role.id, {
                              physical_requirements: v,
                            })
                          }
                          rows={2}
                        />
                        <Field
                          label="Accommodations"
                          value={role.accommodation_notes}
                          onChange={(v) =>
                            updateRole(role.id, { accommodation_notes: v })
                          }
                          rows={2}
                        />
                      </div>
                      <div className="rounded-md bg-ivory-warm/50 p-3">
                        <label className="flex items-center gap-2 text-[12.5px] text-ink">
                          <input
                            type="checkbox"
                            checked={role.practice_needed}
                            onChange={(e) =>
                              updateRole(role.id, {
                                practice_needed: e.target.checked,
                              })
                            }
                            className="h-3.5 w-3.5 rounded border-border text-saffron focus:ring-saffron"
                          />
                          This person needs practice before the ceremony.
                        </label>
                        {role.practice_needed && (
                          <div className="mt-2">
                            <Field
                              label="Practice note"
                              value={role.practice_note}
                              onChange={(v) =>
                                updateRole(role.id, { practice_note: v })
                              }
                              rows={2}
                            />
                          </div>
                        )}
                      </div>
                      {plannerMode && (
                        <div className="rounded-md border border-rose/40 bg-rose-pale/20 p-3">
                          <div className="mb-1.5 flex items-center gap-1.5">
                            <Lock
                              size={11}
                              strokeWidth={1.8}
                              className="text-rose"
                            />
                            <Eyebrow className="text-rose">
                              Planner-only note
                            </Eyebrow>
                          </div>
                          <textarea
                            value={role.planner_private_note}
                            onChange={(e) =>
                              updateRole(role.id, {
                                planner_private_note: e.target.value,
                              })
                            }
                            rows={2}
                            placeholder="Family sensitivity, backup plan, sequencing concern — hidden from officiant and family views."
                            className="w-full resize-y rounded-md border border-rose/30 bg-white px-3 py-2 text-[12.5px] leading-relaxed text-ink placeholder:text-rose/50 focus:border-rose focus:outline-none"
                          />
                        </div>
                      )}
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

// ── Guest autocomplete field ─────────────────────────────────────────────
// Searches the shared Guest Roster by name or relationship. Once linked,
// the guest's current name/relationship is shown as a chip — unlinking
// reverts to a free-text field.

function GuestAutocompleteField({
  label,
  rosterSide,
  linkedGuestId,
  displayName,
  displayRelationship,
  showRelationship = true,
  onLink,
  onUnlink,
  onEditName,
  onEditRelationship,
}: {
  label: string;
  rosterSide?: "brides" | "grooms";
  linkedGuestId?: string;
  displayName: string;
  displayRelationship: string;
  showRelationship?: boolean;
  onLink: (entry: GuestRosterEntry) => void;
  onUnlink: () => void;
  onEditName: (v: string) => void;
  onEditRelationship?: (v: string) => void;
}) {
  const entries = useGuestRosterStore((s) => s.entries);
  const linkedEntry = linkedGuestId
    ? entries.find((e) => e.id === linkedGuestId)
    : undefined;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const scoped = rosterSide
      ? entries.filter((e) => e.side === rosterSide || e.side === "shared")
      : entries;
    if (!q) return scoped.slice(0, 8);
    return scoped
      .filter((e) =>
        `${e.first_name} ${e.last_name} ${e.relationship}`
          .toLowerCase()
          .includes(q),
      )
      .slice(0, 8);
  }, [entries, query, rosterSide]);

  if (linkedEntry) {
    return (
      <div>
        <Eyebrow className="mb-1">{label}</Eyebrow>
        <div className="flex items-center gap-2 rounded-md border border-sage/50 bg-sage-pale/20 px-3 py-2">
          <Link2 size={12} strokeWidth={1.8} className="shrink-0 text-sage" />
          <div className="flex-1 min-w-0">
            <div className="truncate text-[12.5px] font-medium text-ink">
              {linkedEntry.first_name} {linkedEntry.last_name}
            </div>
            {showRelationship && (
              <div className="truncate text-[11px] text-ink-muted">
                {linkedEntry.relationship}
                {linkedEntry.phone ? ` · ${linkedEntry.phone}` : ""}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onUnlink}
            aria-label="Unlink guest"
            className="p-1 text-ink-muted hover:text-rose"
          >
            <X size={12} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <Eyebrow className="mb-1">{label}</Eyebrow>
      <input
        type="text"
        value={query || displayName}
        onChange={(e) => {
          setQuery(e.target.value);
          onEditName(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Search guest list or type a name"
        className="w-full rounded-md border border-border bg-white px-3 py-2 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
      />
      {showRelationship && onEditRelationship && displayName && (
        <input
          type="text"
          value={displayRelationship}
          onChange={(e) => onEditRelationship(e.target.value)}
          placeholder="Relationship"
          className="mt-1 w-full rounded-md border border-border bg-white px-3 py-1.5 text-[11.5px] text-ink-muted placeholder:text-ink-faint focus:border-saffron focus:outline-none"
        />
      )}
      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-[220px] overflow-y-auto rounded-md border border-border bg-white shadow-lg">
          <div
            className="border-b border-border/60 bg-ivory-warm/40 px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            From your guest list
          </div>
          {results.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onLink(entry);
                setQuery("");
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 border-b border-border/40 px-3 py-2 text-left last:border-0 hover:bg-saffron-pale/20"
            >
              <Users2
                size={12}
                strokeWidth={1.8}
                className="shrink-0 text-ink-muted"
              />
              <div className="flex-1 min-w-0">
                <div className="truncate text-[12.5px] text-ink">
                  {entry.first_name} {entry.last_name}
                </div>
                <div className="truncate text-[11px] text-ink-muted">
                  {entry.relationship}
                </div>
              </div>
              <Link2
                size={10}
                strokeWidth={1.8}
                className="text-ink-faint"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  rows = 1,
  select,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  select?: Array<{ value: string; label: string }>;
}) {
  return (
    <div>
      <Eyebrow className="mb-1">{label}</Eyebrow>
      {select ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-[12.5px] text-ink focus:border-saffron focus:outline-none"
        >
          <option value="">—</option>
          {select.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : rows === 1 ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-[12.5px] text-ink focus:border-saffron focus:outline-none"
        />
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="w-full resize-y rounded-md border border-border bg-white px-3 py-2 text-[12.5px] leading-relaxed text-ink focus:border-saffron focus:outline-none"
        />
      )}
    </div>
  );
}
