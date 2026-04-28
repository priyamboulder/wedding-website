"use client";

// ── Bride-look AI panels (Bride Looks tab) ────────────────────────────────
//   1. EventLookComposer — for each wedding event card, a "Compose AI look"
//      button that calls EVENT_LOOK with the bride's brief + liked styles
//      + outfit + duration + weather, and renders the fully-produced look.
//   2. AccessoryRecommender — given a chosen hair_style + event + outfit,
//      calls ACCESSORY_RECOMMEND and renders ranked accessory picks.
//
// Each panel is self-contained and scoped to a single event (one card in
// the Bride Looks grid). They sit alongside the existing manual look card.

import { useMemo, useState } from "react";
import {
  Check,
  Gem,
  Loader2,
  RotateCcw,
  Sparkles,
  Wand2,
} from "lucide-react";
import {
  EmptyRow,
  Eyebrow,
  PanelCard,
  Tag,
} from "@/components/workspace/blocks/primitives";
import { useHmuaStore } from "@/stores/hmua-store";
import type {
  WeddingEvent,
  WorkspaceCategory,
} from "@/types/workspace";
import type {
  AccessoryRecommendation,
  EventLook,
} from "@/types/hmua-ai";
import {
  composeEventLook,
  recommendAccessories,
  AiError,
} from "@/lib/hmua-ai/client";
import { cn } from "@/lib/utils";

// ── Event Look Composer (AI look card per event) ─────────────────────────

export function EventLookComposer({
  category,
  event,
  eventLabel,
  outfit,
  weather,
  eventDurationHours,
  likedStyles,
}: {
  category: WorkspaceCategory;
  event: WeddingEvent;
  eventLabel: string;
  outfit?: string;
  weather?: string;
  eventDurationHours?: number;
  likedStyles?: { hair?: string[]; makeup?: string[]; accessories?: string[] };
}) {
  const ai = useHmuaStore((s) => s.ai[category.id]);
  const setEventLook = useHmuaStore((s) => s.setEventLook);
  const clearEventLook = useHmuaStore((s) => s.clearEventLook);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const look = ai?.eventLooks?.[event];
  const brief = ai?.beautyBrief ?? null;

  const handleCompose = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await composeEventLook({
        event,
        beauty_brief: brief,
        liked_styles: likedStyles,
        outfit: outfit || undefined,
        event_duration_hours: eventDurationHours,
        weather,
      });
      setEventLook(category.id, event, result);
    } catch (err) {
      setError(err instanceof AiError ? err.message : "Couldn't compose look.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PanelCard
      icon={<Wand2 size={14} strokeWidth={1.8} />}
      title={`AI look — ${eventLabel}`}
      badge={
        look ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCompose}
              disabled={loading}
              className="flex items-center gap-1 text-[11px] text-ink-muted hover:text-saffron disabled:opacity-60"
            >
              {loading ? <Loader2 size={10} className="animate-spin" /> : <RotateCcw size={10} />}
              Recompose
            </button>
            <button
              type="button"
              onClick={() => clearEventLook(category.id, event)}
              className="text-[11px] text-ink-faint hover:text-rose"
            >
              Clear
            </button>
          </div>
        ) : null
      }
    >
      {!look ? (
        <ComposePrompt
          onCompose={handleCompose}
          loading={loading}
          brief={!!brief}
          outfit={outfit}
          error={error}
        />
      ) : (
        <LookBody look={look} />
      )}
    </PanelCard>
  );
}

function ComposePrompt({
  onCompose,
  loading,
  brief,
  outfit,
  error,
}: {
  onCompose: () => void;
  loading: boolean;
  brief: boolean;
  outfit?: string;
  error: string | null;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[13px] text-ink-muted">
        Compose a complete look — hair style, makeup breakdown, accessories,
        and timeline — tailored to your brief, this event's outfit, and the
        weather.
      </p>
      <div className="flex flex-wrap gap-1.5">
        <Tag tone={brief ? "sage" : "stone"}>
          {brief ? "✓ Beauty brief ready" : "No brief yet"}
        </Tag>
        <Tag tone={outfit ? "sage" : "stone"}>
          {outfit ? "✓ Outfit set" : "No outfit yet"}
        </Tag>
      </div>
      <button
        type="button"
        onClick={onCompose}
        disabled={loading}
        className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12.5px] font-medium text-ivory hover:opacity-90 disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 size={13} className="animate-spin" />
            Composing…
          </>
        ) : (
          <>
            <Sparkles size={13} strokeWidth={1.8} />
            Compose AI look
          </>
        )}
      </button>
      {error && (
        <div className="rounded-md border border-rose/40 bg-rose-pale/30 px-3 py-2 text-[12px] text-rose">
          {error}
        </div>
      )}
    </div>
  );
}

function LookBody({ look }: { look: EventLook }) {
  return (
    <div className="space-y-4">
      <div>
        <Eyebrow>Title</Eyebrow>
        <p className="mt-1 font-serif text-[18px] italic leading-snug text-ink">
          "{look.title}"
        </p>
      </div>

      <LookSection title="Hair">
        <p className="font-medium text-ink">{look.hair.style}</p>
        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
          {look.hair.details}
        </p>
        {look.hair.prep_notes && (
          <DetailRow label="Prep" body={look.hair.prep_notes} />
        )}
        {look.hair.hold_strategy && (
          <DetailRow label="Hold" body={look.hair.hold_strategy} />
        )}
      </LookSection>

      <LookSection title="Makeup">
        <p className="font-medium text-ink">{look.makeup.style}</p>
        <div className="mt-1.5 grid grid-cols-1 gap-1.5">
          {look.makeup.base && <DetailRow label="Base" body={look.makeup.base} />}
          {look.makeup.eyes && <DetailRow label="Eyes" body={look.makeup.eyes} />}
          {look.makeup.brows && <DetailRow label="Brows" body={look.makeup.brows} />}
          {look.makeup.lips && <DetailRow label="Lips" body={look.makeup.lips} />}
          {look.makeup.cheeks && <DetailRow label="Cheeks" body={look.makeup.cheeks} />}
          {look.makeup.durability_notes && (
            <DetailRow label="Durability" body={look.makeup.durability_notes} />
          )}
        </div>
      </LookSection>

      <LookSection title="Accessories">
        {look.accessories.head && <DetailRow label="Head" body={look.accessories.head} />}
        {look.accessories.hair && <DetailRow label="Hair" body={look.accessories.hair} />}
        {look.accessories.face && <DetailRow label="Face" body={look.accessories.face} />}
        {look.accessories.notes && <DetailRow label="Notes" body={look.accessories.notes} />}
      </LookSection>

      {look.timeline_minutes && (
        <LookSection title="Timeline">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
            <TimelineStat label="Hair" minutes={look.timeline_minutes.hair} />
            <TimelineStat label="Makeup" minutes={look.timeline_minutes.makeup} />
            <TimelineStat label="Dressing" minutes={look.timeline_minutes.accessories_and_draping} />
            <TimelineStat label="Photos" minutes={look.timeline_minutes.photos_of_finished_look} />
            <TimelineStat label="Total" minutes={look.timeline_minutes.total} highlight />
          </div>
        </LookSection>
      )}
    </div>
  );
}

function LookSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-border/60 bg-ivory-warm/30 p-3">
      <Eyebrow>{title}</Eyebrow>
      <div className="mt-1.5 space-y-1">{children}</div>
    </section>
  );
}

function DetailRow({ label, body }: { label: string; body: string }) {
  return (
    <div className="text-[12.5px] leading-relaxed">
      <span
        className="mr-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </span>
      <span className="text-ink">{body}</span>
    </div>
  );
}

function TimelineStat({
  label,
  minutes,
  highlight,
}: {
  label: string;
  minutes?: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-sm bg-white px-2 py-1.5 text-center",
        highlight ? "border border-saffron/40" : "border border-border",
      )}
    >
      <p
        className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 font-serif text-[16px] leading-none",
          highlight ? "text-saffron" : "text-ink",
        )}
      >
        {minutes ?? "—"}
        {minutes !== undefined && (
          <span
            className="ml-0.5 font-mono text-[9px] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            m
          </span>
        )}
      </p>
    </div>
  );
}

// ── Accessory Recommender (scoped to a specific look) ────────────────────

export function AccessoryRecommender({
  category,
  event,
  eventLabel,
  hairStyle,
  outfit,
  jewelrySelected,
  brideVibe,
}: {
  category: WorkspaceCategory;
  event: WeddingEvent;
  eventLabel: string;
  hairStyle?: string;
  outfit?: string;
  jewelrySelected?: string[];
  brideVibe?: string;
}) {
  const ai = useHmuaStore((s) => s.ai[category.id]);
  const setAccessoryRecs = useHmuaStore((s) => s.setAccessoryRecs);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recs = ai?.accessoryRecs?.[event] ?? [];
  const canRun = !!hairStyle?.trim() && !!outfit?.trim();

  const handleRecommend = async () => {
    if (!canRun) return;
    setLoading(true);
    setError(null);
    try {
      const result = await recommendAccessories({
        hair_style: hairStyle!,
        event,
        outfit: outfit!,
        jewelry_already_selected: jewelrySelected,
        bride_vibe: brideVibe,
      });
      setAccessoryRecs(category.id, event, result);
    } catch (err) {
      setError(err instanceof AiError ? err.message : "Couldn't recommend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PanelCard
      icon={<Gem size={14} strokeWidth={1.8} />}
      title={`Accessory picks — ${eventLabel}`}
      badge={
        recs.length > 0 ? (
          <button
            type="button"
            onClick={handleRecommend}
            disabled={loading || !canRun}
            className="flex items-center gap-1 text-[11px] text-ink-muted hover:text-saffron disabled:opacity-60"
          >
            {loading ? <Loader2 size={10} className="animate-spin" /> : <RotateCcw size={10} />}
            Refresh
          </button>
        ) : null
      }
    >
      {recs.length === 0 ? (
        <div className="space-y-3">
          <p className="text-[12.5px] text-ink-muted">
            Given your hair style and outfit, the AI will propose specific
            accessory placements — where each piece goes, why it pairs, and
            practical sourcing notes.
          </p>
          {!canRun ? (
            <EmptyRow>
              Set a hair style and outfit on this look first.
            </EmptyRow>
          ) : (
            <button
              type="button"
              onClick={handleRecommend}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12.5px] font-medium text-ivory hover:opacity-90 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Thinking…
                </>
              ) : (
                <>
                  <Sparkles size={13} strokeWidth={1.8} />
                  Recommend accessories
                </>
              )}
            </button>
          )}
          {error && (
            <div className="rounded-md border border-rose/40 bg-rose-pale/30 px-3 py-2 text-[12px] text-rose">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {recs.map((r, i) => (
            <AccessoryRecCard key={`${r.accessory}-${i}`} rec={r} />
          ))}
        </div>
      )}
    </PanelCard>
  );
}

const CONFIDENCE_TONE: Record<
  AccessoryRecommendation["confidence"],
  { tone: "sage" | "amber" | "stone"; label: string }
> = {
  strong_match: { tone: "sage", label: "Strong match" },
  possible: { tone: "amber", label: "Possible" },
  stretch: { tone: "stone", label: "Stretch" },
};

function AccessoryRecCard({ rec }: { rec: AccessoryRecommendation }) {
  const { tone, label } = CONFIDENCE_TONE[rec.confidence] ?? CONFIDENCE_TONE.possible;
  return (
    <article className="rounded-md border border-border bg-white p-3">
      <header className="flex items-start justify-between gap-2">
        <div>
          <h5 className="font-serif text-[16px] leading-tight text-ink">
            {rec.accessory}
          </h5>
          <p className="mt-0.5 text-[12px] italic text-ink-muted">
            {rec.placement}
          </p>
        </div>
        <Tag tone={tone}>{label}</Tag>
      </header>

      <p className="mt-2 text-[12.5px] leading-relaxed text-ink">{rec.why}</p>

      {rec.pairs_with && (
        <p className="mt-1.5 text-[12px] text-ink-muted">
          <span
            className="mr-1 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Pairs with
          </span>
          {rec.pairs_with}
        </p>
      )}

      {rec.practical_notes && (
        <div className="mt-2 rounded-sm border-l-2 border-saffron/60 bg-saffron-pale/20 px-2.5 py-1.5 text-[11.5px] text-ink">
          {rec.practical_notes}
        </div>
      )}

      {rec.alternatives && rec.alternatives.length > 0 && (
        <div className="mt-2">
          <Eyebrow>Alternatives</Eyebrow>
          <ul className="mt-1 space-y-0.5">
            {rec.alternatives.map((alt, i) => (
              <li key={i} className="text-[11.5px] text-ink-muted">
                — {alt}
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

// ── Helper ────────────────────────────────────────────────────────────────

export function eventIdFromLabel(label: string | undefined): WeddingEvent | null {
  if (!label) return null;
  const normalized = label.toLowerCase();
  if (["haldi", "mehendi", "sangeet", "wedding", "reception"].includes(normalized)) {
    return normalized as WeddingEvent;
  }
  return null;
}

// Suppress the unused-Check warning — kept available in case callers want
// to render a confidence tick in the future.
void Check;
