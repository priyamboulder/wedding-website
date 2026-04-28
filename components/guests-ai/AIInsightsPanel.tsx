"use client";

// AIInsightsPanel — inline insights panel rendered below the Summary button
// on the All Guests view. Fetches from /api/ai/guest-summary with aggregate
// data and renders three sections:
//   1. At a Glance — key metrics (computed client-side from guest data).
//   2. Needs Attention — AI-generated insights (3–6).
//   3. Quick Actions — buttons the parent wires up.
//
// The panel pushes the guest list down rather than overlaying it, so users
// can cross-reference insights against the list below.

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  MessageSquare,
  Armchair,
  Users,
  Copy,
  X,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { GuestInsight } from "./types";

interface EventSummary {
  id: string;
  label: string;
  date: string;
  invitedCount: number;
  confirmedCount: number;
  pendingCount: number;
  capacity?: number;
}

interface HouseholdSummary {
  id: string;
  displayName: string;
  side: "bride" | "groom" | "mutual";
  city: string;
  outOfTown: boolean;
  hasHotel: boolean;
  memberCount: number;
  lastName: string;
  allConfirmed: boolean;
  allPending: boolean;
}

export interface AIInsightsPanelProps {
  totals: {
    guests: number;
    households: number;
    confirmed: number;
    pending: number;
    declined: number;
    outOfTown: number;
    travelPending: number;
  };
  sides: { bride: number; groom: number; mutual: number };
  pendingBySide: { bride: number; groom: number; mutual: number };
  events: EventSummary[];
  households: HouseholdSummary[];
  dietary: Record<string, number>;
  deadlineDaysAway: number;
  estimatedAttendance: number;
  onDraftRsvp: () => void;
  onClose: () => void;
  onOpenSeating?: () => void;
  onCheckDuplicates?: () => void;
}

export function AIInsightsPanel(props: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<GuestInsight[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/guest-summary", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          totals: props.totals,
          sides: props.sides,
          pendingBySide: props.pendingBySide,
          events: props.events,
          households: props.households,
          dietary: props.dietary,
          deadlineDaysAway: props.deadlineDaysAway,
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        insights?: GuestInsight[];
        error?: string;
      };
      if (!data.ok) throw new Error(data.error ?? "Summary failed");
      setInsights(data.insights ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Summary failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const atGlance = useMemo(
    () => [
      {
        label: "Confirmed",
        value: `${props.totals.confirmed} / ${props.totals.guests}`,
        sublabel: "guests with a yes",
      },
      {
        label: "Expected",
        value: `${props.estimatedAttendance}`,
        sublabel: "AI projection",
      },
      {
        label: "Needs lodging",
        value: `${props.totals.travelPending}`,
        sublabel: `of ${props.totals.outOfTown} OOT guests`,
      },
      {
        label: "Pending",
        value: `${props.totals.pending}`,
        sublabel: `${props.pendingBySide.bride} bride · ${props.pendingBySide.groom} groom`,
      },
    ],
    [props],
  );

  return (
    <section className="mb-6 overflow-hidden rounded-lg border border-gold/25 bg-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gold/15 bg-gold-pale/20 px-5 py-3">
        <div className="flex items-center gap-2">
          <Sparkles size={14} strokeWidth={1.7} className="text-gold" />
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink">
            AI Summary
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={fetchInsights}
            disabled={loading}
            className="rounded p-1 text-ink-faint hover:bg-ivory-warm hover:text-ink disabled:opacity-40"
            aria-label="Refresh insights"
            title="Refresh"
          >
            <RefreshCw
              size={12}
              strokeWidth={1.7}
              className={loading ? "animate-spin" : ""}
            />
          </button>
          <button
            onClick={props.onClose}
            className="rounded p-1 text-ink-faint hover:bg-ivory-warm hover:text-ink"
            aria-label="Close summary"
          >
            <X size={13} strokeWidth={1.7} />
          </button>
        </div>
      </header>

      {/* At a glance */}
      <div className="border-b border-gold/10 px-5 py-4">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          At a glance
        </p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {atGlance.map((m) => (
            <div key={m.label} className="flex flex-col">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">
                {m.label}
              </span>
              <span className="mt-0.5 font-serif text-xl font-bold tracking-tight text-ink">
                {m.value}
              </span>
              <span className="text-[11.5px] text-ink-muted">{m.sublabel}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Needs attention */}
      <div className="border-b border-gold/10 px-5 py-4">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          Needs attention
        </p>
        {loading && !insights && (
          <div className="flex items-center gap-2 text-[12.5px] text-ink-muted">
            <Loader2 size={13} strokeWidth={1.7} className="animate-spin" />
            Reading your guest list…
          </div>
        )}
        {error && (
          <div className="text-[12.5px] text-rose">Couldn't generate insights: {error}</div>
        )}
        {insights && insights.length === 0 && (
          <div className="text-[12.5px] text-ink-muted">
            Nothing urgent came up. Check back after RSVPs arrive.
          </div>
        )}
        {insights && insights.length > 0 && (
          <ul className="flex flex-col gap-2">
            {insights.map((i) => (
              <InsightRow key={i.id} insight={i} />
            ))}
          </ul>
        )}
      </div>

      {/* Quick actions */}
      <div className="px-5 py-4">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          Quick actions
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={props.onDraftRsvp}
            className="flex items-center gap-1.5 rounded-md bg-gold px-3 py-1.5 text-[12px] font-medium text-white hover:opacity-90"
          >
            <MessageSquare size={12} strokeWidth={1.8} />
            Draft RSVP follow-ups
          </button>
          {props.onOpenSeating && (
            <button
              onClick={props.onOpenSeating}
              className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted hover:border-ink/20 hover:text-ink"
            >
              <Armchair size={12} strokeWidth={1.7} />
              Auto-assign seating
            </button>
          )}
          {props.onCheckDuplicates && (
            <button
              onClick={props.onCheckDuplicates}
              className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted hover:border-ink/20 hover:text-ink"
            >
              <Copy size={12} strokeWidth={1.7} />
              Check for duplicates
            </button>
          )}
          <button
            onClick={() => {
              const summary = estimateCatering(props);
              alert(summary);
            }}
            className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted hover:border-ink/20 hover:text-ink"
          >
            <Users size={12} strokeWidth={1.7} />
            Estimate catering
          </button>
        </div>
      </div>
    </section>
  );
}

function InsightRow({ insight }: { insight: GuestInsight }) {
  const Icon =
    insight.severity === "blocker"
      ? AlertTriangle
      : insight.severity === "warning"
        ? Info
        : CheckCircle2;
  const iconColor =
    insight.severity === "blocker"
      ? "text-rose"
      : insight.severity === "warning"
        ? "text-saffron"
        : "text-sage";
  const bg =
    insight.severity === "blocker"
      ? "bg-rose-pale/40"
      : insight.severity === "warning"
        ? "bg-gold-pale/30"
        : "bg-sage-pale/40";
  return (
    <li className={cn("flex items-start gap-3 rounded-md px-3 py-2", bg)}>
      <Icon
        size={14}
        strokeWidth={1.7}
        className={cn("mt-0.5 shrink-0", iconColor)}
      />
      <div className="flex-1">
        <p className="text-[12.5px] font-medium text-ink">{insight.title}</p>
        <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-muted">
          {insight.detail}
        </p>
      </div>
    </li>
  );
}

function estimateCatering(p: AIInsightsPanelProps): string {
  const veg = (p.dietary.vegetarian ?? 0) + (p.dietary.jain ?? 0) + (p.dietary.vegan ?? 0);
  const nonVeg = p.dietary.non_vegetarian ?? 0;
  const glutenFree = p.dietary.gluten_free ?? 0;
  const allergy = p.dietary.nut_allergy ?? 0;
  return [
    `Catering estimate (based on ${p.estimatedAttendance} expected):`,
    ``,
    `• Vegetarian / Jain / Vegan: ${veg}`,
    `• Non-vegetarian: ${nonVeg}`,
    `• Gluten-free: ${glutenFree}`,
    `• Nut-allergy: ${allergy}`,
    ``,
    `Reception (${p.events.find((e) => e.id === "reception")?.invitedCount ?? 0} invited) is the largest meal service.`,
  ].join("\n");
}
