"use client";

// ── Destinations tab ───────────────────────────────────────────────────────
// Research and compare destinations. Cards expand to show why-it-fits and
// considerations. A comparison strip appears when 2+ destinations are pinned.

import { Heart, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useHoneymoonStore } from "@/stores/honeymoon-store";
import type { Destination, DestinationStatus } from "@/types/honeymoon";
import { cn } from "@/lib/utils";
import {
  InlineAdd,
  Label,
  Section,
  StatusPill,
  TextArea,
  TextInput,
  formatMoney,
} from "../../bachelorette/ui";
import { InspirationWall } from "../InspirationWall";
import { DESTINATION_CONCEPTS } from "@/lib/honeymoon/destination-catalog";
import { scoreConcept } from "@/lib/honeymoon/scoring";

export function DestinationsTab() {
  const destinations = useHoneymoonStore((s) => s.destinations);
  const addDestination = useHoneymoonStore((s) => s.addDestination);

  const comparing = useMemo(
    () => destinations.filter((d) => d.inComparison && d.status !== "passed"),
    [destinations],
  );

  return (
    <div className="space-y-5">
      <InspirationWall />
      <Section
        eyebrow="DESTINATIONS"
        title="Destinations you're considering"
        description="Narrow it down to 2 or 3. Each card carries its own why-it-fits and trade-offs so you can compare without opening ten tabs."
      >
        {destinations.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-ivory-warm/40 px-6 py-10 text-center">
            <p className="text-[13px] text-ink-muted">
              No destinations yet — add one you're curious about.
            </p>
            <InlineAdd
              placeholder="Destination name (e.g. Bali)"
              onAdd={addDestination}
              buttonLabel="Add destination"
            />
          </div>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {destinations.map((d) => (
                <DestinationCard key={d.id} destination={d} />
              ))}
            </div>
            <div className="mt-4">
              <InlineAdd
                placeholder="Add another destination"
                onAdd={addDestination}
                buttonLabel="Add"
              />
            </div>
          </>
        )}
      </Section>

      {comparing.length >= 2 && <ComparisonSection destinations={comparing} />}
    </div>
  );
}

// ── Destination card ───────────────────────────────────────────────────────

function DestinationCard({ destination }: { destination: Destination }) {
  const updateDestination = useHoneymoonStore((s) => s.updateDestination);
  const updateConsiderations = useHoneymoonStore(
    (s) => s.updateDestinationConsiderations,
  );
  const setStatus = useHoneymoonStore((s) => s.setDestinationStatus);
  const toggleFavorite = useHoneymoonStore((s) => s.toggleDestinationFavorite);
  const toggleCompare = useHoneymoonStore((s) => s.toggleDestinationComparison);
  const removeDestination = useHoneymoonStore((s) => s.removeDestination);

  const [expanded, setExpanded] = useState(destination.status === "leading");

  const borderTone =
    destination.status === "leading"
      ? "border-gold/50 bg-gold-light/5"
      : destination.status === "passed"
        ? "border-border/40 bg-ivory-warm/30 opacity-60"
        : "border-border bg-white";

  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-lg border p-5 transition-colors",
        borderTone,
      )}
    >
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[18px]" aria-hidden>
              {destination.emoji}
            </span>
            <input
              value={destination.name}
              onChange={(e) =>
                updateDestination(destination.id, { name: e.target.value })
              }
              className="min-w-0 flex-1 border-none bg-transparent font-serif text-[20px] leading-tight text-ink focus:outline-none"
              aria-label="Destination name"
            />
          </div>
          <input
            value={destination.region}
            onChange={(e) =>
              updateDestination(destination.id, { region: e.target.value })
            }
            placeholder="Region / country"
            className="mt-0.5 w-full border-none bg-transparent text-[12.5px] text-ink-muted placeholder:text-ink-faint focus:outline-none"
            aria-label="Region"
          />
        </div>
        <button
          type="button"
          onClick={() => toggleFavorite(destination.id)}
          className="shrink-0 text-ink-faint hover:text-rose"
          aria-label={destination.favorite ? "Remove favourite" : "Favourite"}
        >
          <Heart
            size={16}
            strokeWidth={1.6}
            fill={destination.favorite ? "currentColor" : "none"}
            className={destination.favorite ? "text-rose" : ""}
          />
        </button>
      </header>

      <div className="flex items-center gap-2">
        <select
          value={destination.status}
          onChange={(e) =>
            setStatus(destination.id, e.target.value as DestinationStatus)
          }
          className="rounded-sm border border-border bg-white px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted focus:border-saffron/60 focus:outline-none"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <option value="leading">Leading</option>
          <option value="considering">Considering</option>
          <option value="passed">Passed</option>
        </select>
        <label className="inline-flex items-center gap-1.5 text-[11.5px] text-ink-muted">
          <input
            type="checkbox"
            checked={destination.inComparison}
            onChange={() => toggleCompare(destination.id)}
            className="accent-ink"
          />
          Compare
        </label>
      </div>

      <div>
        <Label>Why it fits</Label>
        <TextArea
          value={destination.whyItFits}
          onChange={(v) => updateDestination(destination.id, { whyItFits: v })}
          rows={2}
          placeholder="What draws you to this destination?"
          className="mt-1"
        />
      </div>

      {expanded && (
        <div className="space-y-3">
          <div>
            <Label>Considerations</Label>
            <div className="mt-2 space-y-1.5">
              <ConsiderationRow
                placeholder="Flight length"
                value={destination.considerations.flight}
                onChange={(v) =>
                  updateConsiderations(destination.id, { flight: v })
                }
              />
              <ConsiderationRow
                placeholder="Visa requirements"
                value={destination.considerations.visa}
                onChange={(v) =>
                  updateConsiderations(destination.id, { visa: v })
                }
              />
              <ConsiderationRow
                placeholder="Best time to visit"
                value={destination.considerations.bestTime}
                onChange={(v) =>
                  updateConsiderations(destination.id, { bestTime: v })
                }
              />
              <ConsiderationRow
                placeholder="Budget range"
                value={destination.considerations.budgetRange}
                onChange={(v) =>
                  updateConsiderations(destination.id, { budgetRange: v })
                }
              />
              <ConsiderationRow
                placeholder="Jet lag"
                value={destination.considerations.jetLag}
                onChange={(v) =>
                  updateConsiderations(destination.id, { jetLag: v })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <TextInput
              value={destination.duration}
              onChange={(v) =>
                updateDestination(destination.id, { duration: v })
              }
              placeholder="Duration"
            />
            <TextInput
              value={destination.flightLength}
              onChange={(v) =>
                updateDestination(destination.id, { flightLength: v })
              }
              placeholder="Flight"
            />
            <TextInput
              value={destination.seasonOk}
              onChange={(v) =>
                updateDestination(destination.id, { seasonOk: v })
              }
              placeholder="Season"
            />
          </div>

          <div>
            <Label>Budget estimate</Label>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-mono text-[13px] text-ink-muted">$</span>
              <input
                type="number"
                value={Math.round(destination.budgetSingleCents / 100)}
                onChange={(e) =>
                  updateDestination(destination.id, {
                    budgetSingleCents:
                      Math.max(0, Number(e.target.value) || 0) * 100,
                  })
                }
                className="w-32 rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-ink focus:border-saffron/60 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <TextArea
              value={destination.notes}
              onChange={(v) => updateDestination(destination.id, { notes: v })}
              rows={3}
              placeholder="Hesitations, must-dos, who we'd travel with…"
              className="mt-1"
            />
          </div>
        </div>
      )}

      <footer className="mt-auto flex items-center justify-between gap-2 border-t border-border/60 pt-3">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted transition-colors hover:text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {expanded ? "Show less" : "Research more ▸"}
        </button>
        <button
          type="button"
          onClick={() => removeDestination(destination.id)}
          className="text-ink-faint hover:text-rose"
          aria-label="Remove destination"
        >
          <X size={13} strokeWidth={2} />
        </button>
      </footer>
    </article>
  );
}

function ConsiderationRow({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ink-faint" aria-hidden />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border-none bg-transparent text-[12.5px] text-ink placeholder:text-ink-faint focus:outline-none"
      />
    </div>
  );
}

// ── Comparison section ─────────────────────────────────────────────────────

function ComparisonSection({ destinations }: { destinations: Destination[] }) {
  const vibeProfile = useHoneymoonStore((s) => s.vibeProfile);
  const hasProfile =
    vibeProfile.vibes.length > 0 ||
    vibeProfile.duration !== null ||
    vibeProfile.budgetTier !== null;

  // Resolve each compared destination to a catalog concept (if any) and
  // score it against the live vibeProfile. Gives the comparison a
  // Match row without the couple needing to manually weigh anything.
  const matches = destinations.map((d) => {
    const n = d.name.trim().toLowerCase();
    const concept =
      DESTINATION_CONCEPTS.find((c) => c.title.trim().toLowerCase() === n) ??
      DESTINATION_CONCEPTS.find((c) =>
        c.stops.some((s) => s.trim().toLowerCase() === n),
      ) ??
      null;
    return concept && hasProfile ? scoreConcept(concept, vibeProfile) : null;
  });

  return (
    <Section
      eyebrow="SIDE BY SIDE"
      title="Comparing destinations"
      right={
        <button
          type="button"
          onClick={() => adviseDecision(destinations)}
          className="inline-flex items-center gap-1.5 rounded-md border border-gold/40 bg-gold-light/20 px-3 py-1.5 text-[12px] font-medium text-gold transition-colors hover:bg-gold-light/40"
        >
          <Sparkles size={12} strokeWidth={1.8} /> Help me decide
        </button>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="border-b border-border/60">
              <th className="pr-4 pb-2 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                {" "}
              </th>
              {destinations.map((d) => (
                <th
                  key={d.id}
                  className="px-3 pb-2 text-left font-serif text-[15px] text-ink"
                >
                  {d.emoji} {d.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            <ComparisonRow
              label="Duration"
              values={destinations.map((d) => d.duration || "—")}
            />
            <ComparisonRow
              label="Budget"
              values={destinations.map((d) =>
                d.budgetSingleCents > 0
                  ? formatMoney(d.budgetSingleCents)
                  : "—",
              )}
            />
            <ComparisonRow
              label="Flight"
              values={destinations.map((d) => d.flightLength || "—")}
            />
            <ComparisonRow
              label="Season"
              values={destinations.map((d) => d.seasonOk || "—")}
            />
            <ComparisonRow
              label="Status"
              values={destinations.map((d) => (
                <StatusPill
                  tone={
                    d.status === "leading"
                      ? "gold"
                      : d.status === "passed"
                        ? "muted"
                        : "sage"
                  }
                  label={d.status}
                />
              ))}
            />
            {matches.some(Boolean) && (
              <ComparisonRow
                label="Match"
                values={matches.map((m) =>
                  m ? <MatchCell score={m.score} label={matchLabelText(m.matchLabel)} /> : "—",
                )}
              />
            )}
            {matches.some(Boolean) && (
              <ComparisonRow
                label="Budget fit"
                values={matches.map((m) =>
                  m ? (
                    <span className="text-[12px]">
                      {m.budgetLine}
                    </span>
                  ) : (
                    "—"
                  ),
                )}
              />
            )}
            {matches.some(Boolean) && (
              <ComparisonRow
                label="Season"
                values={matches.map((m) =>
                  m ? <span className="text-[12px]">{m.seasonLine}</span> : "—",
                )}
              />
            )}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function MatchCell({ score, label }: { score: number; label: string }) {
  const tone =
    score >= 80
      ? "text-gold"
      : score >= 60
        ? "text-sage"
        : score >= 40
          ? "text-saffron"
          : "text-ink-muted";
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className={cn("font-mono text-[11px] font-medium", tone)}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {score}/100
      </span>
      <span className="text-[11px] italic text-ink-muted">{label}</span>
    </div>
  );
}

function matchLabelText(l: string): string {
  switch (l) {
    case "perfect":
      return "Perfect fit";
    case "good":
      return "Good match";
    case "stretch":
      return "Stretch";
    case "poor":
      return "Poor fit";
    default:
      return l;
  }
}

function ComparisonRow({
  label,
  values,
}: {
  label: string;
  values: React.ReactNode[];
}) {
  return (
    <tr>
      <td
        className="py-2.5 pr-4 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </td>
      {values.map((v, i) => (
        <td key={i} className="py-2.5 px-3 text-ink">
          {v}
        </td>
      ))}
    </tr>
  );
}

function adviseDecision(destinations: Destination[]): void {
  if (typeof window === "undefined") return;
  const top = destinations.find((d) => d.status === "leading") ?? destinations[0];
  const cheapest = [...destinations].sort(
    (a, b) => a.budgetSingleCents - b.budgetSingleCents,
  )[0];
  const shortest = [...destinations].sort((a, b) =>
    (a.flightLength || "").localeCompare(b.flightLength || ""),
  )[0];
  window.alert(
    `Leaning: ${top.name}\nCheapest: ${cheapest.name} (${formatMoney(cheapest.budgetSingleCents)})\nShortest flight: ${shortest.name}\n\nIf you want the story to start right away, ${top.name} wins. If you want money left for the wedding, ${cheapest.name}.`,
  );
}
