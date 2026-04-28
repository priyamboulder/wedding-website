"use client";

// ── Events / Attire tab (rebuild) ────────────────────────────────────────
// Discovery-first attire: 4-question quiz → style keywords → couple look
// direction → reference gallery → guest attire card preview. The quiz
// auto-drafts the formality, colour guidance, cultural expectation, and
// coordination level; the card at the bottom is the shareable deliverable.

import { useMemo } from "react";
import { Copy, Sparkles } from "lucide-react";
import { useEventsStore } from "@/stores/events-store";
import { getAttireImagesFor } from "@/lib/events/attire-seed";
import { ATTIRE_QUIZ } from "@/lib/events/event-quizzes";
import type {
  AttireColorGuidance,
  AttireCoordinationLevel,
  AttireCulturalExpectation,
  AttireFormality,
  EventRecord,
} from "@/types/events";
import { StyleKeywordsBlock } from "@/components/workspace/shared/StyleKeywordsBlock";
import {
  ReferenceGalleryBlock,
  type ReferenceTile,
} from "@/components/workspace/shared/ReferenceGalleryBlock";
import { WantAvoidLists } from "@/components/workspace/shared/WantAvoidLists";
import {
  SectionHead,
  SectionShell,
} from "@/components/workspace/shared/SectionHead";
import { EventQuizCard } from "../EventQuizCard";
import { displayNameFor } from "../event-display";

const ATTIRE_KEYWORDS = [
  "lehenga", "saree", "sherwani", "suit", "cocktail-dress", "anarkali",
  "indo-western", "tuxedo", "gown", "kurta-pajama", "colour-blocked",
  "embroidered", "minimal", "statement-jewelry", "tailored",
];

export function AttireTab({ event }: { event: EventRecord }) {
  const setAttireIntro = useEventsStore((s) => s.setEventAttireIntro);
  const setAttireWants = useEventsStore((s) => s.setEventAttireWants);
  const setAttireAvoids = useEventsStore((s) => s.setEventAttireAvoids);
  const toggleFavoriteAttire = useEventsStore((s) => s.toggleFavoriteAttire);
  const setQuizAnswer = useEventsStore((s) => s.setEventAttireQuizAnswer);
  const setFormality = useEventsStore((s) => s.setEventFormality);
  const setColorGuidance = useEventsStore((s) => s.setEventAttireColorGuidance);
  const setCulturalExpectation = useEventsStore(
    (s) => s.setEventAttireCulturalExpectation,
  );
  const setCoordinationLevel = useEventsStore(
    (s) => s.setEventAttireCoordinationLevel,
  );
  const setAttireKeywords = useEventsStore((s) => s.setEventAttireKeywords);
  const setBrideLook = useEventsStore((s) => s.setEventBrideLookDirection);
  const setGroomLook = useEventsStore((s) => s.setEventGroomLookDirection);
  const setCardText = useEventsStore((s) => s.setEventGuestAttireCardText);
  const setDressCode = useEventsStore((s) => s.setEventDressCode);

  const tiles = useMemo<ReferenceTile[]>(() => {
    const imgs = getAttireImagesFor(event.type).slice(0, 12);
    return imgs.map((img) => ({
      id: img.id,
      paletteHex: img.paletteHex,
      url: img.url,
      label: `${cap(img.role)} · ${img.garmentType.replace(/_/g, " ")}`,
      caption: img.sourceCredit || null,
    }));
  }, [event.type]);

  function handleQuizAnswer(key: string, value: unknown) {
    setQuizAnswer(event.id, key, value);
    // Mirror canonical answers into the structured fields so downstream
    // consumers (guest attire card, Brief tab, Stationery) have one source.
    if (key === "formality" && typeof value === "string") {
      setFormality(event.id, value as AttireFormality);
    } else if (key === "color_guidance" && typeof value === "string") {
      setColorGuidance(event.id, value as AttireColorGuidance);
    } else if (key === "cultural_expectation" && typeof value === "string") {
      setCulturalExpectation(event.id, value as AttireCulturalExpectation);
    } else if (key === "coordination" && typeof value === "string") {
      setCoordinationLevel(event.id, value as AttireCoordinationLevel);
    }
  }

  function generateCard() {
    const text = assembleGuestCardText(event);
    setCardText(event.id, text);
    // Keep the legacy `dressCode` field in sync — Stationery + itineraries
    // still read it, so a shorter first line is the most useful mirror.
    setDressCode(event.id, firstLine(text));
  }

  return (
    <div className="space-y-11">
      <EventQuizCard
        eyebrow={`Dressing ${displayNameFor(event)} in ${ATTIRE_QUIZ.length} picks`}
        title="Shape the dress code"
        blurb="Four quick picks — formality, colour guidance, cultural expectation, and wedding-party coordination. We use these to draft the guest attire card."
        questions={ATTIRE_QUIZ}
        answers={event.attireQuizAnswers ?? {}}
        onAnswer={handleQuizAnswer}
        onFinish={generateCard}
      />

      <SectionShell>
        <SectionHead
          eyebrow="Silhouette"
          title="Silhouette & style"
          hint="Tap the words that describe the look you want. Add your own."
        />
        <StyleKeywordsBlock
          variant="flat"
          suggestions={ATTIRE_KEYWORDS}
          selected={event.attireKeywords ?? []}
          onChange={(v) => setAttireKeywords(event.id, v)}
        />
      </SectionShell>

      <SectionShell>
        <SectionHead
          eyebrow="Couple looks"
          title="What you're imagining wearing"
          hint="Early direction — your Wardrobe & Styling workspace will go deeper with fittings, designers, and final looks."
        />
        <div className="grid gap-4 md:grid-cols-2">
          <LookColumn
            label="Partner 1"
            value={event.brideLookDirection}
            onChange={(v) => setBrideLook(event.id, v)}
            placeholder="Bride — heavy gota patti lehenga in marigold and coral, polki jewellery, loose hair…"
          />
          <LookColumn
            label="Partner 2"
            value={event.groomLookDirection}
            onChange={(v) => setGroomLook(event.id, v)}
            placeholder="Groom — ivory sherwani with gold piping, contrast dupatta, classic mojdi…"
          />
        </div>
      </SectionShell>

      <SectionShell>
        <SectionHead
          eyebrow="References"
          title="Attire references"
          hint="Love what feels right. Mark what isn't for you."
        />
        <ReferenceGalleryBlock
          variant="flat"
          tiles={tiles}
          favoritedIds={event.favoritedAttireIds ?? []}
          onToggleLove={(id) => toggleFavoriteAttire(event.id, id)}
        />
      </SectionShell>

      <SectionShell>
        <SectionHead
          eyebrow="Attire wants & not-fors"
          title="Your attire limits, on paper"
        />
        <WantAvoidLists
          variant="flat"
          wants={event.attireWants ?? []}
          avoids={event.attireAvoids ?? []}
          onChangeWants={(v) => setAttireWants(event.id, v)}
          onChangeAvoids={(v) => setAttireAvoids(event.id, v)}
          wantPlaceholder="e.g. a lighter lehenga for sangeet so I can dance"
          avoidPlaceholder="e.g. no heavy mirror work on daytime events"
        />
      </SectionShell>

      <GuestAttireCard
        event={event}
        onGenerate={generateCard}
        onChange={(v) => setCardText(event.id, v)}
        onChangeAttireIntro={(v) => setAttireIntro(event.id, v)}
      />
    </div>
  );
}

function LookColumn({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <p
        className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={5}
        className="w-full resize-y rounded-md border border-border bg-white px-3 py-2.5 text-[13px] leading-relaxed text-ink outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/15"
      />
    </div>
  );
}

function GuestAttireCard({
  event,
  onGenerate,
  onChange,
  onChangeAttireIntro,
}: {
  event: EventRecord;
  onGenerate: () => void;
  onChange: (v: string) => void;
  onChangeAttireIntro: (v: string) => void;
}) {
  const text = event.guestAttireCardText.trim();
  async function copy() {
    try {
      await navigator.clipboard.writeText(text || "");
    } catch {
      // swallow — clipboard can be blocked in iframes
    }
  }
  return (
    <SectionShell>
      <SectionHead
        eyebrow="Guest attire card"
        title="The dress code, made shareable"
        hint="A short, shareable card that flows to the wedding website and invitation suite."
        right={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onGenerate}
              className="inline-flex items-center gap-1.5 rounded-md border border-gold/40 bg-ivory-warm px-3 py-1.5 text-[12px] font-medium text-ink-soft transition-colors hover:border-gold hover:text-saffron"
            >
              <Sparkles size={12} strokeWidth={1.8} />
              Generate
            </button>
            {text && (
              <button
                type="button"
                onClick={copy}
                title="Copy"
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink-muted transition-colors hover:border-gold/60 hover:text-ink"
              >
                <Copy size={12} strokeWidth={1.8} /> Copy
              </button>
            )}
          </div>
        }
      />

      <div className="rounded-md border border-border bg-ivory-warm/40 p-5">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {displayNameFor(event)}
        </p>
        <textarea
          value={event.guestAttireCardText}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Black tie preferred · Jewel tones encouraged · Traditional attire encouraged"
          rows={4}
          className="mt-2 w-full resize-y border-0 bg-transparent font-serif text-[17px] leading-relaxed text-ink outline-none placeholder:text-ink-faint"
          style={{
            fontFamily: "var(--font-display), 'Cormorant Garamond', Georgia, serif",
          }}
        />
      </div>

      <p className="mt-3 text-[11.5px] text-ink-faint">
        Tip: The Stationery workspace picks up the first line of this card as
        the dress-code note on invitations.
      </p>

      <div className="mt-4">
        <label
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Stylist notes (internal)
        </label>
        <textarea
          value={event.attireIntro}
          onChange={(e) => onChangeAttireIntro(e.target.value)}
          placeholder="Anything your stylist or designer should know — fabric weight, fit preferences, tailor names, dupatta styling…"
          rows={3}
          className="mt-1 w-full resize-y rounded-md border border-border bg-white px-3 py-2 text-[13px] leading-relaxed text-ink outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/15"
        />
      </div>
    </SectionShell>
  );
}

// ── Card assembly ────────────────────────────────────────────────────────
// Human-authored composer for now. Real AI calls will replace this with a
// styled paragraph; the shape (one short line per concept) stays.

function assembleGuestCardText(e: EventRecord): string {
  const lines: string[] = [];

  const formalityLine = formalityText(e.formality);
  if (formalityLine) lines.push(formalityLine);

  const colorLine = colorText(e.attireColorGuidance);
  if (colorLine) lines.push(colorLine);

  const culturalLine = culturalText(e.attireCulturalExpectation);
  if (culturalLine) lines.push(culturalLine);

  const keywords = Array.isArray(e.attireKeywords) ? e.attireKeywords : [];
  if (keywords.length) {
    lines.push(`Style: ${keywords.slice(0, 5).join(" · ")}`);
  }
  return lines.join("\n");
}

function formalityText(f: AttireFormality | null): string | null {
  switch (f) {
    case "black_tie":
      return "Black tie";
    case "formal":
      return "Festive & dressy — full formal register";
    case "semi_formal":
      return "Smart casual — dressy but not stiff";
    case "casual":
      return "Relaxed & easy";
    default:
      return null;
  }
}

function colorText(g: AttireColorGuidance | null): string | null {
  switch (g) {
    case "specific_palette":
      return "Please wear the event palette";
    case "general_vibe":
      return "Jewel tones · festive palette encouraged";
    case "code_only":
      return "No specific colour guidance";
    case "themed":
      return "Themed — see invitation for details";
    default:
      return null;
  }
}

function culturalText(c: AttireCulturalExpectation | null): string | null {
  switch (c) {
    case "traditional_required":
      return "Traditional Indian attire required";
    case "traditional_encouraged":
      return "Traditional attire encouraged";
    case "western_preferred":
      return "Western preferred";
    case "mixed":
      return "Either Indian or Western welcome";
    case "no_preference":
      return null;
    default:
      return null;
  }
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function firstLine(s: string): string {
  const i = s.indexOf("\n");
  return i === -1 ? s : s.slice(0, i);
}
