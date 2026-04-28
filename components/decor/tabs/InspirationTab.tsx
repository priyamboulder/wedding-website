"use client";

// ── Tab 4: Inspiration ──────────────────────────────────────────────────────
// Moodboard pointer · Broader theme galleries (Romantic / Modern / Traditional
// Indian / Bohemian / Garden / Glamorous / Rustic / Minimalist) · "Spaces that
// took my breath away" free-form list.

import { useMemo, useState } from "react";
import Link from "next/link";
import { useDecorStore } from "@/stores/decor-store";
import {
  DECOR_COLORS,
  FONT_DISPLAY,
  FONT_UI,
  FONT_MONO,
  SectionHead,
  Block,
  Paper,
  SparklePill,
  TextField,
  TextArea,
  GhostButton,
  EmptyState,
} from "../primitives";
import type { InspirationTheme } from "@/types/decor";
import { INSPIRATION_THEME_LABELS } from "@/types/decor";

const THEMES: InspirationTheme[] = [
  "romantic",
  "modern",
  "traditional",
  "bohemian",
  "garden",
  "glamorous",
  "rustic",
  "minimalist",
];

export function InspirationTab() {
  return (
    <div>
      <MoodboardPointer />
      <ThemeGallery />
      <BreathAwayList />
    </div>
  );
}

// ── Moodboard pointer ──────────────────────────────────────────────────────
function MoodboardPointer() {
  const pins = useDecorStore((s) => s.moodboard_pins);
  return (
    <Block>
      <SectionHead
        eyebrow="Your moodboard lives in Vision & Mood"
        title="Moodboard"
        body="One board for the whole workspace. Browse and add pins there."
      />
      <Paper className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div
            className="text-[13px]"
            style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoaSoft }}
          >
            {pins.length === 0
              ? "No pins yet — start your moodboard in Vision & Mood."
              : `${pins.length} pin${pins.length === 1 ? "" : "s"} on your board.`}
          </div>
          <Link
            href="#"
            className="text-[12px] underline"
            style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoaSoft }}
          >
            Open Vision & Mood →
          </Link>
        </div>
        {pins.length > 0 && (
          <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2">
            {pins.slice(0, 12).map((p) => (
              <img
                key={p.id}
                src={p.image_url}
                alt={p.caption || "Moodboard pin"}
                className="aspect-square w-full rounded-md object-cover"
                loading="lazy"
              />
            ))}
          </div>
        )}
      </Paper>
    </Block>
  );
}

// ── Theme gallery ──────────────────────────────────────────────────────────
function ThemeGallery() {
  const [active, setActive] = useState<InspirationTheme>("romantic");
  const allThemeRefs = useDecorStore((s) => s.theme_references);
  const refs = useMemo(
    () => allThemeRefs.filter((r) => r.theme === active),
    [allThemeRefs, active],
  );
  const setReaction = useDecorStore((s) => s.setThemeReaction);
  const addRef = useDecorStore((s) => s.addThemeReference);
  const removeRef = useDecorStore((s) => s.removeThemeReference);
  const [url, setUrl] = useState("");

  return (
    <Block>
      <SectionHead
        eyebrow="Décor style galleries"
        title="Broader reference gallery"
        body="Scan a direction, react to what moves you."
      />
      <div className="mb-5 flex flex-wrap gap-1.5">
        {THEMES.map((t) => {
          const selected = active === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setActive(t)}
              className="rounded-full px-3.5 py-1.5 text-[12px] transition-colors"
              style={{
                fontFamily: FONT_UI,
                backgroundColor: selected ? DECOR_COLORS.cocoa : "#FFFFFF",
                color: selected ? DECOR_COLORS.ivory : DECOR_COLORS.cocoaSoft,
                border: `1px solid ${selected ? DECOR_COLORS.cocoa : DECOR_COLORS.line}`,
              }}
            >
              {INSPIRATION_THEME_LABELS[t]}
            </button>
          );
        })}
      </div>

      {refs.length === 0 ? (
        <EmptyState>
          Nothing in this gallery yet — add references below.
        </EmptyState>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
          {refs.map((r) => (
            <Paper key={r.id} className="overflow-hidden">
              <div className="relative">
                <img
                  src={r.image_url}
                  alt={`${INSPIRATION_THEME_LABELS[active]} reference`}
                  className="aspect-square w-full object-cover"
                  loading="lazy"
                />
                {r.source === "user" ? (
                  <button
                    type="button"
                    onClick={() => removeRef(r.id)}
                    className="absolute right-2 top-2 h-6 w-6 rounded-full bg-white/90 text-[13px]"
                    style={{ color: DECOR_COLORS.cocoa }}
                    aria-label="Remove"
                  >
                    ×
                  </button>
                ) : (
                  <div
                    className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[9.5px] uppercase"
                    style={{
                      fontFamily: FONT_MONO,
                      letterSpacing: "0.18em",
                      color: DECOR_COLORS.marigold,
                    }}
                  >
                    ✦ Suggested
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 p-2">
                <ThemeReactButton
                  active={r.reaction === "love"}
                  onClick={() =>
                    setReaction(r.id, r.reaction === "love" ? null : "love")
                  }
                  tone="rose"
                >
                  ♡ Love
                </ThemeReactButton>
                <ThemeReactButton
                  active={r.reaction === "not_for_us"}
                  onClick={() =>
                    setReaction(
                      r.id,
                      r.reaction === "not_for_us" ? null : "not_for_us",
                    )
                  }
                  tone="neutral"
                >
                  ✕ Not for us
                </ThemeReactButton>
              </div>
            </Paper>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <TextField
          value={url}
          onChange={setUrl}
          placeholder={`Add a ${INSPIRATION_THEME_LABELS[active]} reference URL…`}
        />
        <GhostButton
          onClick={() => {
            if (!url.trim()) return;
            addRef(active, url.trim());
            setUrl("");
          }}
        >
          Add
        </GhostButton>
      </div>
    </Block>
  );
}

function ThemeReactButton({
  active,
  onClick,
  tone,
  children,
}: {
  active: boolean;
  onClick: () => void;
  tone: "rose" | "neutral";
  children: React.ReactNode;
}) {
  const toneColor =
    tone === "rose" ? DECOR_COLORS.rose : DECOR_COLORS.cocoaFaint;
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 rounded-full px-2.5 py-1 text-[11px] transition-colors"
      style={{
        fontFamily: FONT_UI,
        border: `1px solid ${active ? toneColor : DECOR_COLORS.line}`,
        backgroundColor: active ? toneColor : "transparent",
        color: active ? DECOR_COLORS.ivory : DECOR_COLORS.cocoaSoft,
      }}
    >
      {children}
    </button>
  );
}

// ── Spaces that took my breath away ────────────────────────────────────────
function BreathAwayList() {
  const dreams = useDecorStore((s) => s.space_dreams);
  const addDream = useDecorStore((s) => s.addSpaceDream);
  const removeDream = useDecorStore((s) => s.removeSpaceDream);
  const [draft, setDraft] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  async function findSimilar() {
    setLoadingSuggestions(true);
    try {
      const dreamText = dreams.map((d) => d.body).join("; ");
      const prompt = `Based on these wedding space inspirations: "${dreamText || draft}", suggest 3-4 similar design directions or specific elements they might love. Be specific and visual — mention real design styles, materials, and moods.`;
      const res = await fetch("/api/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, context: "You are an expert wedding décor designer helping a couple find inspiration." }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.result) setSuggestions(data.result);
      }
    } finally {
      setLoadingSuggestions(false);
    }
  }

  return (
    <Block>
      <SectionHead
        eyebrow="Memories that won't let go"
        title="Spaces that took my breath away"
        body="The single image or feeling you can't stop thinking about."
      >
        <SparklePill label={loadingSuggestions ? "Searching…" : "Find similar designs"} onClick={findSimilar} />
      </SectionHead>
      <Paper className="p-5">
        <ul className="mb-4 space-y-1.5">
          {dreams.length === 0 ? (
            <EmptyState>
              Nothing yet — write down that one ceiling, that one room, that
              one moment.
            </EmptyState>
          ) : (
            dreams.map((d) => (
              <li
                key={d.id}
                className="flex items-start justify-between gap-2 text-[13px]"
                style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoaSoft }}
              >
                <span>· {d.body}</span>
                <button
                  type="button"
                  onClick={() => removeDream(d.id)}
                  className="shrink-0 opacity-40 hover:opacity-100"
                  aria-label="Remove"
                >
                  ×
                </button>
              </li>
            ))
          )}
        </ul>
        <TextArea
          value={draft}
          onChange={setDraft}
          rows={2}
          placeholder="e.g. The ceiling at that outdoor wedding with thousands of hanging jasmine strands…"
        />
        <div className="mt-2 flex justify-end">
          <GhostButton
            onClick={() => {
              addDream(draft);
              setDraft("");
            }}
          >
            Add
          </GhostButton>
        </div>
        {suggestions && (
          <div
            className="mt-4 rounded-lg p-3 text-[12.5px]"
            style={{ backgroundColor: "rgba(196,162,101,0.08)", color: DECOR_COLORS.cocoaSoft, fontFamily: FONT_UI }}
          >
            <p className="text-[10.5px] uppercase tracking-[0.12em] mb-2" style={{ color: DECOR_COLORS.cocoaMuted }}>AI suggestions</p>
            <p style={{ whiteSpace: "pre-wrap" }}>{suggestions}</p>
            <button
              type="button"
              onClick={() => setSuggestions("")}
              className="mt-2 text-[11px] opacity-50 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        )}
      </Paper>
    </Block>
  );
}
