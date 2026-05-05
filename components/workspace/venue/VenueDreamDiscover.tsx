"use client";

// ── Dream & Discover tab ───────────────────────────────────────────────────
// The emotional front door of the Venue workspace. No logistics, no
// capacity numbers — pure feeling. Leads the couple FROM emotion TO
// decision through five sections:
//   1. "Close your eyes" brief textarea (free-form feel + "Refine with AI")
//   2. Venue direction cards (AI-generated archetypes, Love/Not for us)
//   3. Inspiration gallery (AI + paste + upload, Love/Not for us)
//   4. "What matters most" keyword chips
//   5. "Definitely want" + "Not for us" free-text lists
//
// Style keywords, keyword chip library, and venue direction descriptions
// are data (lib/venue-seed.ts + store) — not hardcoded strings in the
// component. Swap the source for DB config later and the tab doesn't move.

import { useRef, useState } from "react";
import {
  Heart,
  Image as ImageIcon,
  Plus,
  Sparkles,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useVenueStore } from "@/stores/venue-store";
import { VENUE_KEYWORD_LIBRARY } from "@/lib/venue-seed";
import type { DirectionReaction, InspirationReaction } from "@/types/venue";
import {
  EmptyRow,
  Eyebrow,
  PanelCard,
} from "@/components/workspace/blocks/primitives";
import { InlineText } from "@/components/workspace/editable/InlineText";
import { VenueDiscoveryQuiz } from "./VenueDiscoveryQuiz";
import { refineBrief } from "@/lib/venue/mock-ai";
import {
  AccessibilityRequirements,
  AccommodationPreferenceField,
  BudgetRange,
  GuestCountRange,
  LocationPreferences,
  SingleMultiVenue,
} from "./SharedFields";

export function VenueDreamDiscover() {
  return (
    <div className="space-y-6">
      <VenueDiscoveryQuiz />
      <DreamBrief />
      <LocationPreferences />
      <DirectionsSection />
      <InspirationSection />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <WhatMattersSection />
        <KeywordChipsSection />
      </div>
      <SingleMultiVenue />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <BudgetRange />
        <GuestCountRange />
      </div>
      <AccessibilityRequirements />
      <AccommodationPreferenceField />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <DefinitelyWantList />
        <NotForUsList />
      </div>
    </div>
  );
}

// ── 1 · Brief ─────────────────────────────────────────────────────────────

function DreamBrief() {
  const brief = useVenueStore((s) => s.discovery.brief_body);
  const setBrief = useVenueStore((s) => s.setBrief);

  return (
    <PanelCard
      icon={<Sparkles size={14} strokeWidth={1.8} />}
      title="close your eyes — what do you see?"
      badge={
        <button
          type="button"
          className="flex items-center gap-1 rounded-sm border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted transition-colors hover:border-saffron hover:text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
          onClick={() => {
            if (!brief.trim()) return;
            setBrief(refineBrief(brief));
          }}
        >
          <Wand2 size={10} /> Refine with AI
        </button>
      }
    >
      <p className="mb-3 text-[12.5px] leading-relaxed text-ink-muted">
        Describe the feeling you want your venue to create — not logistics.
        Are your guests walking through a candlelit courtyard? Standing at
        the edge of a lake at sunset? Dancing under a tent in your backyard?
        Write freely — your planner and AI will translate this into a real
        search.
      </p>
      <div className="rounded-md border border-gold/15 bg-ivory-warm/40 p-4">
        <InlineText
          value={brief}
          onSave={setBrief}
          variant="block"
          allowEmpty
          multilineRows={5}
          className="!p-0 font-serif text-[15px] italic leading-relaxed text-ink"
          placeholder="We want our families to feel like they've stepped into another world…"
          emptyLabel="Click to start writing — no wrong answers."
        />
      </div>
    </PanelCard>
  );
}

// ── 2 · Venue direction cards ─────────────────────────────────────────────

function DirectionsSection() {
  const directions = useVenueStore((s) => s.discovery.directions);
  const react = useVenueStore((s) => s.setDirectionReaction);

  return (
    <PanelCard
      icon={<Heart size={14} strokeWidth={1.8} />}
      title="the places that pulled you in"
      badge={
        <span
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Tap Love or Not for us
        </span>
      }
    >
      <p className="mb-4 text-[12.5px] leading-relaxed text-ink-muted">
        Six directions your brief could go. React to each — the ones you love
        shape the AI suggestions on the Shortlist tab.
      </p>
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {directions.map((d) => (
          <li
            key={d.id}
            className={cn(
              "group overflow-hidden rounded-md border bg-white transition-colors",
              d.reaction === "love"
                ? "border-saffron"
                : d.reaction === "not_for_us"
                  ? "border-ink opacity-60"
                  : "border-border hover:border-saffron/40",
            )}
          >
            <div className="relative aspect-[4/3] bg-ivory-warm">
              <img
                src={d.imageUrl}
                alt={d.label}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              {d.reaction === "love" && (
                <span
                  className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full border border-saffron bg-saffron px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-ivory"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <Heart size={9} /> Love
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="text-[13.5px] font-medium text-ink">{d.label}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
                {d.description}
              </p>
              <div className="mt-3 flex items-center gap-1.5">
                <ReactionButton
                  active={d.reaction === "love"}
                  onClick={() => react(d.id, "love")}
                  tone="love"
                >
                  <Heart size={9} /> Love
                </ReactionButton>
                <ReactionButton
                  active={d.reaction === "not_for_us"}
                  onClick={() => react(d.id, "not_for_us")}
                  tone="not"
                >
                  <X size={9} /> Not for us
                </ReactionButton>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </PanelCard>
  );
}

// ── 3 · Inspiration gallery ───────────────────────────────────────────────

function InspirationSection() {
  const images = useVenueStore((s) => s.discovery.inspiration);
  const add = useVenueStore((s) => s.addInspiration);
  const react = useVenueStore((s) => s.setInspirationReaction);
  const remove = useVenueStore((s) => s.removeInspiration);
  const [urlDraft, setUrlDraft] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  function onPaste() {
    if (!urlDraft.trim()) return;
    add(urlDraft.trim());
    setUrlDraft("");
  }

  function onUpload(files: FileList | null) {
    if (!files) return;
    for (const f of Array.from(files)) {
      add(URL.createObjectURL(f), f.name.replace(/\.[^.]+$/, ""));
    }
  }

  return (
    <PanelCard
      icon={<ImageIcon size={14} strokeWidth={1.8} />}
      title="inspiration gallery"
      badge={
        <span
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Organized by vibe, not venue
        </span>
      }
    >
      {images.length === 0 ? (
        <EmptyRow>
          Drop inspiration here. Paste a Pinterest link, upload a photo, or
          react to what we've suggested below.
        </EmptyRow>
      ) : (
        <ul className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-5">
          {images.map((img) => (
            <li
              key={img.id}
              className={cn(
                "group relative overflow-hidden rounded-md ring-1 transition-colors",
                img.reaction === "love"
                  ? "ring-saffron"
                  : img.reaction === "not_for_us"
                    ? "opacity-40 ring-border"
                    : "ring-border",
              )}
            >
              <div className="relative aspect-[4/3] bg-ivory-warm">
                <img
                  src={img.url}
                  alt={img.caption}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                {img.reaction === "love" && (
                  <span
                    className="absolute left-1.5 top-1.5 inline-flex items-center gap-0.5 rounded-full border border-saffron bg-saffron px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-ivory"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    <Heart size={8} />
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => remove(img.id)}
                  className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-ink-muted opacity-0 shadow-sm ring-1 ring-border transition-opacity hover:text-rose group-hover:opacity-100"
                  aria-label="Remove image"
                >
                  <Trash2 size={10} strokeWidth={1.8} />
                </button>
              </div>
              <div className="flex items-center gap-1 border-t border-border bg-white px-1.5 py-1.5">
                <ReactionButton
                  active={img.reaction === "love"}
                  onClick={() => react(img.id, "love")}
                  tone="love"
                  size="sm"
                >
                  <Heart size={9} /> Love
                </ReactionButton>
                <ReactionButton
                  active={img.reaction === "not_for_us"}
                  onClick={() => react(img.id, "not_for_us")}
                  tone="not"
                  size="sm"
                >
                  <X size={9} />
                </ReactionButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex items-center gap-2">
        <input
          type="url"
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onPaste();
            }
          }}
          placeholder="Paste a Pinterest or image URL…"
          className="flex-1 rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
        />
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            onUpload(e.target.files);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="flex items-center gap-1 rounded-sm border border-border px-2.5 py-1.5 text-[11.5px] text-ink-muted transition-colors hover:border-saffron hover:text-saffron"
        >
          <Plus size={11} /> Add your own
        </button>
      </div>
    </PanelCard>
  );
}

// ── 4 · Keyword chips — "what matters most" ───────────────────────────────

function KeywordChipsSection() {
  const selected = useVenueStore((s) => s.discovery.keyword_chips);
  const toggle = useVenueStore((s) => s.toggleKeywordChip);

  const selectedLower = new Set(selected.map((c) => c.toLowerCase()));
  const [draft, setDraft] = useState("");

  const libraryOrdered = [...VENUE_KEYWORD_LIBRARY];
  // Couple-added chips that aren't in the library
  const extras = selected.filter(
    (c) => !VENUE_KEYWORD_LIBRARY.some((k) => k.toLowerCase() === c.toLowerCase()),
  );

  return (
    <PanelCard
      icon={<Sparkles size={14} strokeWidth={1.8} />}
      title="what matters most to you?"
    >
      <p className="mb-3 text-[12.5px] leading-relaxed text-ink-muted">
        Tap the ones that feel right. Add your own at the bottom — this helps
        us separate must-haves from nice-to-haves when we match venues.
      </p>
      <ul className="flex flex-wrap gap-1.5">
        {libraryOrdered.map((chip) => {
          const on = selectedLower.has(chip.toLowerCase());
          return (
            <li key={chip}>
              <button
                type="button"
                onClick={() => toggle(chip)}
                className={cn(
                  "rounded-full border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.06em] transition-colors",
                  on
                    ? "border-saffron bg-saffron-pale/50 text-saffron"
                    : "border-border bg-white text-ink-muted hover:border-saffron/50",
                )}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {chip}
              </button>
            </li>
          );
        })}
        {extras.map((chip) => (
          <li key={`extra-${chip}`}>
            <button
              type="button"
              onClick={() => toggle(chip)}
              className="rounded-full border border-saffron bg-saffron-pale/50 px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.06em] text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {chip} <X size={9} className="inline align-text-top" />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) {
              e.preventDefault();
              toggle(draft.trim());
              setDraft("");
            }
          }}
          placeholder="+ Add your own…"
          className="flex-1 rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
        />
      </div>
    </PanelCard>
  );
}

// ── 5 · "What matters most" summary (selected chips overview) ─────────────

function WhatMattersSection() {
  const selected = useVenueStore((s) => s.discovery.keyword_chips);
  const brief = useVenueStore((s) => s.discovery.brief_body);
  const directions = useVenueStore((s) => s.discovery.directions);
  const loveDirections = directions
    .filter((d) => d.reaction === "love")
    .map((d) => d.label);

  const hasBrief = brief.trim().length > 0;
  const hasAny = hasBrief || selected.length > 0 || loveDirections.length > 0;

  return (
    <PanelCard title="what we've heard so far">
      {!hasAny ? (
        <EmptyRow>
          Once you've written a bit, picked a direction, or tapped some chips,
          we'll summarize the signal here.
        </EmptyRow>
      ) : (
        <dl className="space-y-3 text-[12.5px]">
          {loveDirections.length > 0 && (
            <div>
              <Eyebrow className="mb-1">Directions you love</Eyebrow>
              <dd className="text-ink">{loveDirections.join(" · ")}</dd>
            </div>
          )}
          {selected.length > 0 && (
            <div>
              <Eyebrow className="mb-1">Priorities</Eyebrow>
              <dd className="text-ink">{selected.slice(0, 6).join(" · ")}</dd>
            </div>
          )}
          {hasBrief && (
            <div>
              <Eyebrow className="mb-1">Brief</Eyebrow>
              <dd className="line-clamp-3 font-serif italic text-ink">
                {brief}
              </dd>
            </div>
          )}
        </dl>
      )}
    </PanelCard>
  );
}

// ── 6 · Free-text lists ───────────────────────────────────────────────────

function DefinitelyWantList() {
  const items = useVenueStore((s) => s.discovery.definitely_want);
  const set = useVenueStore((s) => s.setDefinitelyWant);
  return (
    <TextList
      title="I definitely want …"
      items={items}
      onChange={set}
      placeholder="Lakeside view at ceremony · Mandap on stone platform · Rooms on-site"
      tone="saffron"
    />
  );
}

function NotForUsList() {
  const items = useVenueStore((s) => s.discovery.not_for_us);
  const set = useVenueStore((s) => s.setNotForUs);
  return (
    <TextList
      title="Not for us …"
      items={items}
      onChange={set}
      placeholder="Hotel ballroom with no view · In-house caterer only · Anything generic"
      tone="ink"
    />
  );
}

function TextList({
  title,
  items,
  onChange,
  placeholder,
  tone,
}: {
  title: string;
  items: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  tone: "saffron" | "ink";
}) {
  const [draft, setDraft] = useState("");
  const dotClass = tone === "saffron" ? "bg-saffron" : "bg-ink";
  return (
    <PanelCard title={title}>
      <ul className="space-y-1.5">
        {items.length === 0 ? (
          <EmptyRow>Nothing yet — write freely.</EmptyRow>
        ) : (
          items.map((item, i) => (
            <li
              key={`${item}-${i}`}
              className="group flex items-start gap-2 text-[13px] leading-relaxed text-ink"
            >
              <span className={cn("mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full", dotClass)} />
              <span className="flex-1">
                <InlineText
                  value={item}
                  onSave={(next) =>
                    onChange(items.map((x, j) => (j === i ? next : x)))
                  }
                  className="!p-0 text-[13px]"
                />
              </span>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
                className="opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
                aria-label="Remove"
              >
                <X size={11} />
              </button>
            </li>
          ))
        )}
      </ul>
      <div className="mt-3 flex items-center gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) {
              e.preventDefault();
              onChange([...items, draft.trim()]);
              setDraft("");
            }
          }}
          placeholder={placeholder}
          className="flex-1 rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
        />
      </div>
    </PanelCard>
  );
}

// ── Shared UI atoms ───────────────────────────────────────────────────────

function ReactionButton({
  active,
  onClick,
  tone,
  children,
  size = "md",
}: {
  active: boolean;
  onClick: () => void;
  tone: "love" | "not";
  children: React.ReactNode;
  size?: "sm" | "md";
}) {
  const activeClass =
    tone === "love"
      ? "border-saffron bg-saffron text-ivory"
      : "border-ink bg-ink text-ivory";
  const inactiveClass = "border-border bg-white text-ink-muted hover:border-ink";
  const sizeClass = size === "sm" ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]";
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border font-mono uppercase tracking-[0.06em] transition-colors",
        sizeClass,
        active ? activeClass : inactiveClass,
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </button>
  );
}

// Re-export reaction type so we can accept typed reactions above if needed.
export type { DirectionReaction, InspirationReaction };
