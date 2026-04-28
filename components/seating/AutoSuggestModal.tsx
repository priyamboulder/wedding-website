"use client";

// ── Auto-suggest modal ───────────────────────────────────────────────
// Presents three strategy preset cards and an advanced constraints
// section. When the user clicks "Generate Suggestion", we call
// /api/seating/suggest and stream the response back into the canvas.

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  Heart,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import type {
  AutoStrategyId,
  AutoSuggestMode,
  SuggestResponse,
  SuggestRequestBody,
  SeatAssignment,
} from "@/types/seating-assignments";
import { DEFAULT_AUTO_CONFIG } from "@/types/seating-assignments";
import type { SeatingGuest } from "@/types/seating-guest";
import { guestFullName } from "@/types/seating-guest";
import { useSeatingStore } from "@/stores/seating-store";
import { useSeatingAssignmentsStore } from "@/stores/seating-assignments-store";

interface AppliedPayload {
  summary: string;
  newlyAssignedIds: string[];
  snapshot: SeatAssignment[];
}

interface Props {
  eventId: string;
  eventLabel: string;
  guests: SeatingGuest[];
  onClose: () => void;
  onApplied: (payload: AppliedPayload) => void;
}

type Phase = "config" | "loading" | "error";

const PRESETS: Array<{
  id: AutoStrategyId;
  title: string;
  icon: typeof Heart;
  description: string;
  detail: string;
}> = [
  {
    id: "family_first",
    title: "Family First",
    icon: Heart,
    description: "Keep families and households together; group by side.",
    detail:
      "Parents, grandparents and siblings anchor the near-stage tables. Cousins cluster by branch. Elders get quiet tables away from the dance floor.",
  },
  {
    id: "social_mixer",
    title: "Social Mixer",
    icon: Users,
    description: "Mix bride + groom sides; group by age and interest.",
    detail:
      "Intentionally mixes bride and groom side guests so new relationships form. Groups by shared category tags (College Friends, Work Colleagues, etc.).",
  },
  {
    id: "traditional",
    title: "Traditional",
    icon: Sparkles,
    description: "Strict bride / groom separation; elders near stage.",
    detail:
      "Keeps bride's side on one half of the room and groom's side on the other. Immediate family anchors the head tables; mutual friends fill the back.",
  },
];

export function AutoSuggestModal({
  eventId,
  eventLabel,
  guests,
  onClose,
  onApplied,
}: Props) {
  const tables = useSeatingStore((s) => s.tables);
  const activeEventId = useSeatingAssignmentsStore((s) => s.activeEventId);
  const autoConfigForEvent = useSeatingAssignmentsStore(
    (s) => s.autoConfig[activeEventId],
  );
  const setAutoConfig = useSeatingAssignmentsStore((s) => s.setAutoConfig);
  const replaceEventAssignments = useSeatingAssignmentsStore(
    (s) => s.replaceEventAssignments,
  );
  const assignGuest = useSeatingAssignmentsStore((s) => s.assignGuest);
  const snapshotEvent = useSeatingAssignmentsStore((s) => s.snapshotEvent);
  const assignmentForEvent = useSeatingAssignmentsStore(
    (s) => s.assignments[eventId],
  );
  const mustPairs = useSeatingAssignmentsStore((s) => s.mustPairs);
  const addMustPair = useSeatingAssignmentsStore((s) => s.addMustPair);
  const removeMustPair = useSeatingAssignmentsStore((s) => s.removeMustPair);

  const cfg = useMemo(
    () => ({
      ...(autoConfigForEvent ?? DEFAULT_AUTO_CONFIG),
      mustPairs,
    }),
    [autoConfigForEvent, mustPairs],
  );

  const [phase, setPhase] = useState<Phase>("config");
  const [error, setError] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [pairBuilder, setPairBuilder] = useState<{
    kind: "together" | "apart";
    ids: string[];
    label: string;
  }>({ kind: "together", ids: [], label: "" });
  const [pickerQuery, setPickerQuery] = useState("");

  const setStrategy = (id: AutoStrategyId) => {
    // Seed sensible defaults per strategy (user can override).
    setAutoConfig({
      strategy: id,
      balanceSides: id === "social_mixer",
      separateSides: id === "traditional",
      groupByCategory: id !== "family_first",
      keepHouseholdsTogether: true,
      vipNearStage: true,
      kidsNearParents: true,
      accessibilityNearExits: true,
    });
  };

  const setMode = (mode: AutoSuggestMode) => setAutoConfig({ mode });

  const runSuggest = async () => {
    setPhase("loading");
    setError("");
    const currentAssignments = assignmentForEvent ?? [];
    const snapshot = snapshotEvent(eventId);
    const mode: AutoSuggestMode = cfg.mode ?? "fill_empty";
    const alreadySeatedGuests = new Set(
      mode === "fill_empty" ? currentAssignments.map((a) => a.guestId) : [],
    );

    // In fill_empty mode, the model only needs to see the unassigned guests
    // (so the prompt stays tight), but we still send `alreadyAssigned` so the
    // server can lock the existing seats.
    const guestsForPrompt =
      mode === "fill_empty"
        ? guests.filter((g) => !alreadySeatedGuests.has(g.id))
        : guests;

    const body: SuggestRequestBody = {
      eventId,
      eventLabel,
      strategy: cfg.strategy,
      config: cfg,
      guests: guestsForPrompt.map((g) => ({
        id: g.id,
        name: guestFullName(g),
        side: g.side,
        householdId: g.householdId,
        categories: g.categories,
        dietary: g.dietary,
        ageCategory: g.ageCategory,
        vipTier: g.vipTier,
        preferredLanguage: g.preferredLanguage,
        needsAssistance: g.needsAssistance,
        relationship: g.relationship,
        plusOneOf: g.plusOneOf,
      })),
      tables: tables.map((t) => ({
        id: t.id,
        label: t.label?.trim() || `T${t.number}`,
        seats: t.seats,
        shape: t.shape,
      })),
      alreadyAssigned:
        mode === "fill_empty"
          ? currentAssignments.map((a) => ({
              guestId: a.guestId,
              tableId: a.tableId,
            }))
          : undefined,
    };

    try {
      const res = await fetch("/api/seating/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as SuggestResponse;
      if (!data.ok || !data.assignments) {
        setError(data.error ?? "Failed to generate suggestion.");
        setPhase("error");
        return;
      }
      const newPairs = data.assignments.map((a) => ({
        guestId: a.guestId,
        tableId: a.tableId,
      }));
      const newIds = newPairs.map((p) => p.guestId);
      if (mode === "replace_all") {
        replaceEventAssignments(newPairs);
      } else {
        // Fill-empty: layer the new assignments onto the existing state
        // (respecting capacity — handled by assignGuest).
        for (const p of newPairs) {
          if (alreadySeatedGuests.has(p.guestId)) continue;
          assignGuest(p.guestId, p.tableId);
        }
      }
      onApplied({
        summary:
          data.summary ?? `Assigned ${data.assignments.length} guests.`,
        newlyAssignedIds: newIds,
        snapshot,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
      setPhase("error");
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-ink/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[88vh] w-[640px] overflow-hidden rounded-xl border border-border bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between border-b border-border bg-ivory/40 px-6 py-4">
          <div>
            <div className="font-serif text-[20px] text-ink">
              Auto-suggest assignments
            </div>
            <div className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
              {eventLabel} · {guests.length} guests · {tables.length} tables
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded text-ink-muted hover:bg-white hover:text-ink"
            title="Close"
          >
            <X size={14} strokeWidth={1.6} />
          </button>
        </header>

        <div className="max-h-[72vh] overflow-y-auto px-6 py-5">
          {phase === "loading" ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
              <div className="font-serif text-[14px] text-ink">
                Claude is arranging your guests…
              </div>
              <div className="font-mono text-[10.5px] text-ink-faint">
                This usually takes 10–20 seconds.
              </div>
            </div>
          ) : phase === "error" ? (
            <div className="py-8 text-center">
              <div className="mb-3 font-serif text-[16px] text-rose">
                Something went wrong.
              </div>
              <div className="mb-4 text-[12px] text-ink-muted">{error}</div>
              <button
                onClick={() => setPhase("config")}
                className="rounded-md bg-ink px-4 py-2 text-[12px] text-ivory hover:opacity-90"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              {/* Mode: keep current vs reassign from scratch */}
              <div className="mb-4">
                <div className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
                  Existing assignments
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <ModeCard
                    active={(cfg.mode ?? "fill_empty") === "fill_empty"}
                    title="Keep current"
                    hint="Only fill empty seats"
                    onClick={() => setMode("fill_empty")}
                  />
                  <ModeCard
                    active={cfg.mode === "replace_all"}
                    title="Reassign everyone"
                    hint="Start from scratch"
                    onClick={() => setMode("replace_all")}
                  />
                </div>
              </div>

              {/* Strategy cards */}
              <div className="mb-5 grid grid-cols-3 gap-3">
                {PRESETS.map((p) => {
                  const Icon = p.icon;
                  const active = cfg.strategy === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setStrategy(p.id)}
                      className={cn(
                        "flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition",
                        active
                          ? "border-ink bg-gold-pale/25 shadow-sm"
                          : "border-border bg-white hover:border-ink/30",
                      )}
                    >
                      <Icon
                        size={18}
                        strokeWidth={1.6}
                        className={active ? "text-ink" : "text-ink-muted"}
                      />
                      <div className="font-serif text-[14px] text-ink">
                        {p.title}
                      </div>
                      <div className="text-[11px] leading-snug text-ink-muted">
                        {p.description}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Strategy detail text */}
              <div className="mb-5 rounded-md border border-dashed border-gold/40 bg-gold-pale/15 px-4 py-3 text-[12px] text-ink-muted">
                {PRESETS.find((p) => p.id === cfg.strategy)?.detail}
              </div>

              {/* Hard constraints */}
              <div className="mb-4">
                <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
                  Hard constraints
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <Toggle
                    label="Keep households together"
                    value={cfg.keepHouseholdsTogether}
                    onChange={(v) => setAutoConfig({ keepHouseholdsTogether: v })}
                  />
                  <Toggle
                    label="VIPs / elders near stage"
                    value={cfg.vipNearStage}
                    onChange={(v) => setAutoConfig({ vipNearStage: v })}
                  />
                  <Toggle
                    label="Kids near their parents"
                    value={cfg.kidsNearParents}
                    onChange={(v) => setAutoConfig({ kidsNearParents: v })}
                  />
                  <Toggle
                    label="Accessibility near exits"
                    value={cfg.accessibilityNearExits}
                    onChange={(v) => setAutoConfig({ accessibilityNearExits: v })}
                  />
                </div>
              </div>

              {/* Advanced */}
              <button
                onClick={() => setAdvancedOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-md border border-border bg-ivory/30 px-3 py-2 text-[12px] text-ink hover:bg-ivory"
              >
                <span>Advanced — soft preferences & must-pair rules</span>
                {advancedOpen ? (
                  <ChevronUp size={14} strokeWidth={1.6} />
                ) : (
                  <ChevronDown size={14} strokeWidth={1.6} />
                )}
              </button>

              {advancedOpen && (
                <div className="mt-3 space-y-4 rounded-md border border-border bg-ivory/10 p-4">
                  <div>
                    <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
                      Soft preferences
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <Toggle
                        label="Group by category"
                        value={cfg.groupByCategory}
                        onChange={(v) => setAutoConfig({ groupByCategory: v })}
                      />
                      <Toggle
                        label="Balance dietary per table"
                        value={cfg.balanceDietary}
                        onChange={(v) => setAutoConfig({ balanceDietary: v })}
                      />
                      <Toggle
                        label="Group by language"
                        value={cfg.groupByLanguage}
                        onChange={(v) => setAutoConfig({ groupByLanguage: v })}
                      />
                      <Toggle
                        label="Balance sides per table"
                        value={cfg.balanceSides}
                        onChange={(v) =>
                          setAutoConfig({
                            balanceSides: v,
                            separateSides: v ? false : cfg.separateSides,
                          })
                        }
                      />
                      <Toggle
                        label="Separate sides strictly"
                        value={cfg.separateSides}
                        onChange={(v) =>
                          setAutoConfig({
                            separateSides: v,
                            balanceSides: v ? false : cfg.balanceSides,
                          })
                        }
                      />
                      <Toggle
                        label="NRI near English speakers"
                        value={cfg.nriNearEnglish}
                        onChange={(v) => setAutoConfig({ nriNearEnglish: v })}
                      />
                    </div>
                  </div>

                  {/* Must-pair builder */}
                  <div>
                    <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
                      Must-pair rules ({mustPairs.length})
                    </div>
                    {mustPairs.length > 0 && (
                      <div className="mb-3 space-y-1">
                        {mustPairs.map((p) => {
                          const names = p.guestIds
                            .map((id) => guests.find((g) => g.id === id))
                            .filter(Boolean)
                            .map((g) => guestFullName(g as SeatingGuest));
                          return (
                            <div
                              key={p.id}
                              className="flex items-center justify-between rounded border border-border bg-white px-2.5 py-1.5 text-[11.5px]"
                            >
                              <div className="flex-1 min-w-0">
                                <span
                                  className={cn(
                                    "mr-2 inline-block rounded px-1.5 py-0.5 font-mono text-[9.5px] uppercase",
                                    p.kind === "together"
                                      ? "bg-sage-pale text-sage"
                                      : "bg-rose-pale text-rose",
                                  )}
                                >
                                  {p.kind === "together" ? "Together" : "Apart"}
                                </span>
                                <span className="text-ink">
                                  {names.join(" · ")}
                                </span>
                                {p.label && (
                                  <span className="ml-2 text-ink-faint">
                                    — {p.label}
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => removeMustPair(p.id)}
                                className="text-ink-faint hover:text-rose"
                              >
                                <X size={12} strokeWidth={1.7} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="rounded border border-dashed border-border bg-white p-2.5">
                      <div className="mb-1.5 flex items-center gap-2 text-[11px]">
                        <select
                          value={pairBuilder.kind}
                          onChange={(e) =>
                            setPairBuilder({
                              ...pairBuilder,
                              kind: e.target.value as "together" | "apart",
                            })
                          }
                          className="rounded border border-border bg-white px-1.5 py-0.5 text-[11px] text-ink"
                        >
                          <option value="together">Together</option>
                          <option value="apart">Apart</option>
                        </select>
                        <input
                          placeholder="Optional label (e.g., 'The exes')"
                          value={pairBuilder.label}
                          onChange={(e) =>
                            setPairBuilder({
                              ...pairBuilder,
                              label: e.target.value,
                            })
                          }
                          className="flex-1 rounded border border-border bg-white px-1.5 py-0.5 text-[11px] text-ink outline-none focus:border-ink/30"
                        />
                        <button
                          disabled={pairBuilder.ids.length < 2}
                          onClick={() => {
                            addMustPair(
                              pairBuilder.kind,
                              pairBuilder.ids,
                              pairBuilder.label.trim() || undefined,
                            );
                            setPairBuilder({
                              kind: pairBuilder.kind,
                              ids: [],
                              label: "",
                            });
                            setPickerQuery("");
                          }}
                          className="rounded bg-ink px-2.5 py-1 text-[11px] text-ivory disabled:opacity-40"
                        >
                          Add rule
                        </button>
                      </div>
                      {pairBuilder.ids.length > 0 && (
                        <div className="mb-1.5 flex flex-wrap gap-1">
                          {pairBuilder.ids.map((gid) => {
                            const g = guests.find((x) => x.id === gid);
                            if (!g) return null;
                            return (
                              <button
                                key={gid}
                                onClick={() =>
                                  setPairBuilder({
                                    ...pairBuilder,
                                    ids: pairBuilder.ids.filter((id) => id !== gid),
                                  })
                                }
                                className="rounded-full bg-ink px-2 py-0.5 text-[10px] text-ivory hover:bg-rose"
                              >
                                {guestFullName(g)} ×
                              </button>
                            );
                          })}
                        </div>
                      )}
                      <input
                        placeholder="Search guest to add…"
                        value={pickerQuery}
                        onChange={(e) => setPickerQuery(e.target.value)}
                        className="w-full rounded border border-border bg-ivory/30 px-1.5 py-0.5 text-[11px] text-ink outline-none focus:border-ink/30"
                      />
                      {pickerQuery.trim().length >= 2 && (
                        <div className="mt-1 max-h-32 overflow-y-auto rounded border border-border bg-white">
                          {guests
                            .filter((g) =>
                              guestFullName(g)
                                .toLowerCase()
                                .includes(pickerQuery.toLowerCase()),
                            )
                            .filter((g) => !pairBuilder.ids.includes(g.id))
                            .slice(0, 6)
                            .map((g) => (
                              <button
                                key={g.id}
                                onClick={() => {
                                  setPairBuilder({
                                    ...pairBuilder,
                                    ids: [...pairBuilder.ids, g.id],
                                  });
                                  setPickerQuery("");
                                }}
                                className="block w-full border-b border-border/40 px-2 py-1 text-left text-[11px] text-ink hover:bg-ivory"
                              >
                                {guestFullName(g)} · {g.side}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {phase === "config" && (
          <footer className="flex items-center justify-between gap-2 border-t border-border bg-ivory/30 px-6 py-3">
            <div className="font-mono text-[10px] text-ink-faint">
              Applying will replace any current assignments for this event.
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink-muted hover:border-ink/20 hover:text-ink"
              >
                Cancel
              </button>
              <button
                onClick={runSuggest}
                className="rounded-md bg-ink px-4 py-1.5 text-[12px] text-ivory hover:opacity-90"
              >
                Generate suggestion
              </button>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}

function ModeCard({
  active,
  title,
  hint,
  onClick,
}: {
  active: boolean;
  title: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-start rounded-md border px-3 py-2 text-left transition",
        active
          ? "border-ink bg-gold-pale/25 shadow-sm"
          : "border-border bg-white hover:border-ink/30",
      )}
    >
      <div className="text-[12px] text-ink">{title}</div>
      <div className="mt-0.5 font-mono text-[10px] text-ink-faint">{hint}</div>
    </button>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-2 rounded-md border border-border bg-white px-2.5 py-1.5 text-[11.5px] text-ink hover:border-ink/25">
      <span>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={cn(
          "relative h-4 w-7 flex-shrink-0 rounded-full transition",
          value ? "bg-ink" : "bg-ink/15",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-3 w-3 rounded-full bg-white transition",
            value ? "left-3.5" : "left-0.5",
          )}
        />
      </button>
    </label>
  );
}
