"use client";

// ── Events / The Brief tab ───────────────────────────────────────────────
// The master document for this event. Assembles every signal the couple
// has left elsewhere — vibe keywords, loved inspiration, attire direction,
// guest journey, sensory design, wants / don't-wants — into a single,
// vendor-ready brief. "Refine with AI" replaces the draft; edits to the
// brief are preserved.
//
// Also surfaces a "What other workspaces need" panel that makes explicit
// which downstream tabs pull from this event record.

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight, Camera, Copy, Download, Music,
  Paintbrush, Send, Sparkles, Utensils,
} from "lucide-react";
import { useEventsStore } from "@/stores/events-store";
import { EVENT_TYPE_OPTIONS, PALETTE_LIBRARY } from "@/lib/events-seed";
import type { EventRecord } from "@/types/events";
import {
  SectionHead,
  SectionShell,
} from "@/components/workspace/shared/SectionHead";
import { displayNameFor } from "../event-display";

export function TheBriefTab({ event }: { event: EventRecord }) {
  const setBriefText = useEventsStore((s) => s.setEventBriefText);
  const setBriefAiDraft = useEventsStore((s) => s.setEventBriefAiDraft);

  const assembled = useMemo(() => assembleBrief(event), [event]);

  function refineWithAI() {
    // Deterministic stub for now — swap in real Claude call. The assembly
    // helper already composes a tight narrative from the record, so we
    // store it as the AI draft and promote it into briefText if the couple
    // hasn't edited manually yet.
    setBriefAiDraft(event.id, assembled);
    if (!event.briefText.trim()) {
      setBriefText(event.id, assembled);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(event.briefText || assembled);
    } catch {
      // swallow
    }
  }

  const workspaceFlows = useMemo(() => computeWorkspaceFlows(event), [event]);

  return (
    <div className="space-y-11">
      <SectionShell>
        <SectionHead
          eyebrow="The document every vendor reads first"
          title={`${displayNameFor(event)} brief`}
          titleSize={24}
          hint="Assembled from everything you've shared across Vibe, Attire, and Guest feel. Polish it with AI, export as PDF, or copy straight into a vendor email."
          right={
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={refineWithAI}
                className="inline-flex items-center gap-1.5 rounded-md border border-gold/40 bg-ivory-warm px-3 py-2 text-[12px] font-medium text-ink-soft transition-colors hover:border-gold hover:text-saffron"
              >
                <Sparkles size={12} strokeWidth={1.8} />
                Refine with AI
              </button>
              <button
                type="button"
                onClick={copy}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-2 text-[12px] text-ink-muted transition-colors hover:border-gold/60 hover:text-ink"
              >
                <Copy size={12} strokeWidth={1.8} />
                Copy
              </button>
              <button
                type="button"
                disabled
                title="Export as PDF — coming soon"
                className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-md border border-border bg-white px-3 py-2 text-[12px] text-ink-faint"
              >
                <Download size={12} strokeWidth={1.8} />
                Export as PDF
              </button>
            </div>
          }
        />
      </SectionShell>

      <SectionShell>
        <SectionHead
          eyebrow="The brief"
          title="Polish and ship"
          hint="Edit freely — your changes stay; AI drafts are offered as replacements you can accept."
        />
        <textarea
          value={event.briefText || assembled}
          onChange={(e) => setBriefText(event.id, e.target.value)}
          rows={20}
          spellCheck
          className="w-full resize-y rounded-md border border-border bg-white p-4 font-serif text-[15px] leading-relaxed text-ink outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/15"
          style={{
            fontFamily:
              "var(--font-display), 'Cormorant Garamond', Georgia, serif",
          }}
        />
        {event.briefAiDraft && event.briefAiDraft !== event.briefText && (
          <p className="mt-2 text-[11.5px] text-ink-faint">
            AI draft available — click "Refine with AI" to refresh and replace.
          </p>
        )}
      </SectionShell>

      <SectionShell>
        <SectionHead
          eyebrow="Where this flows"
          title="Every workspace sees this event"
          hint="When you update this event, the other workspaces see it. No duplicate forms, no copy-pasting."
        />
        <ul className="grid gap-3 md:grid-cols-2">
          {workspaceFlows.map((flow) => (
            <li
              key={flow.name}
              className="flex items-start gap-3 rounded-md border border-border bg-ivory-warm/30 px-4 py-3"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-white text-ink-muted">
                <flow.icon size={14} strokeWidth={1.8} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-ink">
                  → {flow.name}
                </p>
                <p className="mt-0.5 text-[12px] text-ink-muted">{flow.line}</p>
              </div>
              <Link
                href={flow.href}
                className="flex shrink-0 items-center gap-1 text-[11.5px] text-ink-muted hover:text-saffron"
              >
                Open <ArrowRight size={11} strokeWidth={1.8} />
              </Link>
            </li>
          ))}
        </ul>
      </SectionShell>

      <section className="rounded-lg border border-dashed border-border bg-ivory-warm/30 p-5 text-center">
        <div className="mx-auto max-w-xl">
          <Send size={14} strokeWidth={1.8} className="mx-auto text-ink-muted" />
          <p className="mt-2 text-[12.5px] text-ink-muted">
            Ready to hand this off? Exporting and sharing direct-to-vendor is
            coming soon — until then, use Copy to paste into an email.
          </p>
        </div>
      </section>
    </div>
  );
}

// ── Brief assembly ──────────────────────────────────────────────────────

function assembleBrief(e: EventRecord): string {
  const lines: string[] = [];
  const name = displayNameFor(e);
  const typeName =
    EVENT_TYPE_OPTIONS.find((o) => o.id === e.type)?.name ?? "Event";
  const paletteName = describePalette(e);
  const themeLine = e.customTheme ?? e.vibeTheme;

  lines.push(`${name.toUpperCase()} — ${typeName}`);
  if (themeLine) lines.push(themeLine);
  lines.push("");

  // Quick facts
  const facts: string[] = [];
  if (e.eventDate) facts.push(`Date: ${e.eventDate}`);
  if (e.venueName) facts.push(`Venue: ${e.venueName}`);
  if (e.guestCount) facts.push(`Guests: ${e.guestCount}`);
  facts.push(`Energy: ${e.energyLevel}/100`);
  if (paletteName) facts.push(`Palette: ${paletteName}`);
  if (facts.length) lines.push(facts.join(" · "), "");

  // All string/array reads use nullish defaults — persisted records from
  // older versions may still have `undefined` fields until migration runs.
  const asText = (v: string | null | undefined) => (v ?? "").trim();
  const asList = (v: string[] | null | undefined) => (Array.isArray(v) ? v : []);

  // Vibe
  const vibeLines: string[] = [];
  if (asText(e.vibeIntro)) vibeLines.push(asText(e.vibeIntro));
  const vibeKeywords = asList(e.vibeKeywords);
  if (vibeKeywords.length)
    vibeLines.push(`Style keywords: ${vibeKeywords.join(" · ")}`);
  if (asText(e.movieReference))
    vibeLines.push(`Reference: ${asText(e.movieReference)}`);
  if (vibeLines.length) {
    lines.push("VIBE & PALETTE", ...vibeLines, "");
  }

  // Attire
  const attireLines: string[] = [];
  if (asText(e.guestAttireCardText)) attireLines.push(asText(e.guestAttireCardText));
  const attireKeywords = asList(e.attireKeywords);
  if (attireKeywords.length)
    attireLines.push(`Silhouette: ${attireKeywords.join(" · ")}`);
  if (asText(e.brideLookDirection))
    attireLines.push(`Partner 1 look: ${asText(e.brideLookDirection)}`);
  if (asText(e.groomLookDirection))
    attireLines.push(`Partner 2 look: ${asText(e.groomLookDirection)}`);
  if (asText(e.attireIntro))
    attireLines.push(`Stylist notes: ${asText(e.attireIntro)}`);
  if (attireLines.length) {
    lines.push("ATTIRE", ...attireLines, "");
  }

  // Guest journey
  const guestLines: string[] = [];
  if (asText(e.arrivalFeel)) guestLines.push(`Arrival: ${asText(e.arrivalFeel)}`);
  if (asText(e.peakMoment)) guestLines.push(`Peak moment: ${asText(e.peakMoment)}`);
  if (asText(e.departureFeel))
    guestLines.push(`Departure: ${asText(e.departureFeel)}`);
  const sensoryBits: string[] = [];
  if (asText(e.sensorySmell)) sensoryBits.push(`smell: ${asText(e.sensorySmell)}`);
  if (asText(e.sensorySound)) sensoryBits.push(`sound: ${asText(e.sensorySound)}`);
  if (asText(e.sensoryLighting))
    sensoryBits.push(`light: ${asText(e.sensoryLighting)}`);
  if (asText(e.sensoryTemperature))
    sensoryBits.push(`comfort: ${asText(e.sensoryTemperature)}`);
  if (sensoryBits.length)
    guestLines.push(`Sensory: ${sensoryBits.join(" · ")}`);
  if (asText(e.culturalNotes))
    guestLines.push(`Cultural notes: ${asText(e.culturalNotes)}`);
  if (asText(e.guestFeelBrief)) guestLines.push(asText(e.guestFeelBrief));
  if (guestLines.length) {
    lines.push("GUEST EXPERIENCE", ...guestLines, "");
  }

  // Wants / don't wants (union across tabs)
  const wants = [...asList(e.vibeWants), ...asList(e.attireWants)];
  const avoids = [...asList(e.vibeAvoids), ...asList(e.attireAvoids)];
  if (wants.length) {
    lines.push("WE DEFINITELY WANT");
    wants.forEach((w) => lines.push(`· ${w}`));
    lines.push("");
  }
  if (avoids.length) {
    lines.push("NOT FOR US");
    avoids.forEach((w) => lines.push(`· ${w}`));
    lines.push("");
  }

  return lines.join("\n").trim();
}

function describePalette(e: EventRecord): string | null {
  if (e.paletteCustomName) return e.paletteCustomName;
  if (e.customPalette) return "Custom";
  if (e.paletteId)
    return PALETTE_LIBRARY.find((p) => p.id === e.paletteId)?.name ?? null;
  return null;
}

function computeWorkspaceFlows(e: EventRecord) {
  const name = displayNameFor(e);
  return [
    {
      href: "/workspace",
      name: "Photography",
      line: `Moments to capture at ${name}`,
      icon: Camera,
    },
    {
      href: "/workspace",
      name: "Décor & Florals",
      line: `Vibe & palette for ${name}`,
      icon: Paintbrush,
    },
    {
      href: "/workspace",
      name: "Catering",
      line: `Food & drink direction for ${name}`,
      icon: Utensils,
    },
    {
      href: "/workspace",
      name: "Music & Entertainment",
      line: `Energy ${e.energyLevel}/100 — drives set pacing`,
      icon: Music,
    },
  ];
}
