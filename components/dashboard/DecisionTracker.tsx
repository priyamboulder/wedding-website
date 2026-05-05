"use client";

// ── DecisionTracker ────────────────────────────────────────────────────
// "We decided" — captures identity-defining choices the couple makes.
// Distinct from the checklist: tasks complete, decisions *define*.
//
// Two creation paths:
//   • auto: detected from platform state (vendor bookings, brief edits,
//     palette/date selection) and inserted via the upsertAuto guard.
//   • manual: a thin one-line input the couple types into directly.
//
// The dashboard shows the four most recent decisions as compact gold-
// rule cards. "View all" expands to the full reverse-chronological list.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Trash2, Plus } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useChecklistStore } from "@/stores/checklist-store";
import { useDecisionsStore, type Decision } from "@/stores/decisions-store";
import { useEventsStore } from "@/stores/events-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { detectAutoDecisions } from "@/lib/dashboard/decision-triggers";
import { PALETTE_LIBRARY, EVENT_TYPE_OPTIONS } from "@/lib/events-seed";

const DASHBOARD_LIMIT = 4;

function parseDate(raw: string | undefined | null): Date | null {
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function timeLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

interface DecisionRowProps {
  decision: Decision;
  eventLabel: string | null;
  onDelete: () => void;
}

function DecisionRow({ decision, eventLabel, onDelete }: DecisionRowProps) {
  return (
    <li
      className="group relative rounded-[6px] bg-[color:var(--dash-canvas)] px-4 py-3 shadow-[0_1px_3px_rgba(45,45,45,0.04)]"
      style={{ borderLeft: "3px solid var(--dash-gold)" }}
    >
      <div className="flex items-start gap-3 pr-6">
        <p
          className="min-w-0 flex-1 text-[14px] leading-snug text-[color:var(--dash-text)]"
          style={{ fontFamily: "Outfit, var(--font-sans), sans-serif" }}
        >
          {decision.content}
        </p>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete decision"
          className="shrink-0 text-[color:var(--dash-text-faint)] opacity-0 transition-opacity hover:text-[color:var(--color-terracotta)] group-hover:opacity-100"
        >
          <Trash2 size={12} strokeWidth={1.8} />
        </button>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <span
          className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--dash-text-faint)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {timeLabel(decision.createdAt)}
        </span>
        {eventLabel && (
          <span
            className="rounded-full bg-[color:var(--dash-blush-soft)] px-2 py-[1px] text-[10px] font-medium text-[color:var(--dash-blush-deep)]"
            style={{ fontFamily: "Inter, var(--font-sans), sans-serif" }}
          >
            {eventLabel}
          </span>
        )}
      </div>
    </li>
  );
}

export function DecisionTracker() {
  const decisions = useDecisionsStore((s) => s.decisions);
  const addDecision = useDecisionsStore((s) => s.addDecision);
  const upsertAuto = useDecisionsStore((s) => s.upsertAuto);
  const deleteDecision = useDecisionsStore((s) => s.deleteDecision);

  const user = useAuthStore((s) => s.user);
  const checklistDate = useChecklistStore((s) => s.weddingDate);
  const events = useEventsStore((s) => s.events);
  const heroPaletteId = useEventsStore(
    (s) => s.coupleContext.heroPaletteId,
  );
  const categories = useWorkspaceStore((s) => s.categories);

  const weddingDate = useMemo(
    () => parseDate(user?.wedding?.weddingDate) ?? checklistDate ?? null,
    [user?.wedding?.weddingDate, checklistDate],
  );

  const heroPaletteName = useMemo(() => {
    if (!heroPaletteId) return null;
    return PALETTE_LIBRARY.find((p) => p.id === heroPaletteId)?.name ?? null;
  }, [heroPaletteId]);

  const eventLabelById = useMemo(() => {
    const m = new Map<string, string>();
    for (const e of events) {
      const opt = EVENT_TYPE_OPTIONS.find((o) => o.id === e.type);
      const label =
        e.vibeEventName ||
        e.customEventName ||
        e.customName ||
        opt?.name ||
        e.type;
      m.set(e.id, label);
    }
    return m;
  }, [events]);

  // Run detection on every input change. The store enforces uniqueness
  // via stable autoKeys, so re-runs don't double-insert.
  useEffect(() => {
    const candidates = detectAutoDecisions({
      weddingDate,
      events,
      workspaceCategories: categories,
      heroPaletteName,
    });
    candidates.forEach((c) =>
      upsertAuto({
        autoKey: c.autoKey,
        content: c.content,
        sourceType: c.sourceType,
        eventId: c.eventId,
      }),
    );
  }, [weddingDate, events, categories, heroPaletteName, upsertAuto]);

  const sorted = useMemo(
    () =>
      decisions
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime(),
        ),
    [decisions],
  );

  const visible = sorted.slice(0, DASHBOARD_LIMIT);

  const [draft, setDraft] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    const text = draft.trim();
    if (!text) return;
    addDecision({ content: text, source: "manual", sourceType: "manual" });
    setDraft("");
    setIsAdding(false);
  };

  return (
    <section id="decisions">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="dash-spread-title">
            We <em>decided</em>
          </h2>
          <p className="dash-spread-sub">
            The choices that are shaping your wedding.
          </p>
        </div>
        {sorted.length > DASHBOARD_LIMIT && (
          <Link
            href="/dashboard/decisions"
            className="inline-flex shrink-0 items-center gap-1 text-[12px] font-medium text-[color:var(--dash-blush-deep)] hover:text-[color:var(--dash-text)]"
          >
            View all decisions →
          </Link>
        )}
      </div>

      <div className="mb-4">
        {isAdding ? (
          <div
            className="flex items-center gap-2 rounded-[6px] bg-[color:var(--dash-canvas)] px-3 py-2 shadow-[0_1px_3px_rgba(45,45,45,0.04)]"
            style={{ borderLeft: "3px solid var(--dash-gold)" }}
          >
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdd();
                }
                if (e.key === "Escape") {
                  setDraft("");
                  setIsAdding(false);
                }
              }}
              placeholder="No first look. Live dhol for the baraat. Mom's jewelry for the ceremony…"
              className="flex-1 border-0 bg-transparent px-0 py-1 text-[14px] text-[color:var(--dash-text)] placeholder:italic placeholder:text-[color:var(--dash-text-faint)] focus:outline-none"
              style={{ fontFamily: "Outfit, var(--font-sans), sans-serif" }}
            />
            <button
              type="button"
              onClick={() => {
                setDraft("");
                setIsAdding(false);
              }}
              className="text-[11px] text-[color:var(--dash-text-muted)] hover:text-[color:var(--dash-text)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!draft.trim()}
              className="dash-btn dash-btn--sm"
            >
              Log
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[color:var(--dash-blush-deep)] hover:text-[color:var(--dash-text)]"
          >
            <Plus size={12} strokeWidth={2} />
            Log a decision
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <p
          className="font-serif text-[15px] italic text-[color:var(--dash-text-muted)]"
          style={{
            fontFamily:
              "var(--font-display), 'Cormorant Garamond', Georgia, serif",
          }}
        >
          The first call you make becomes the first thing on this list.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((d) => (
            <DecisionRow
              key={d.id}
              decision={d}
              eventLabel={d.eventId ? eventLabelById.get(d.eventId) ?? null : null}
              onDelete={() => deleteDecision(d.id)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
