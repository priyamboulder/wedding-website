"use client";

// ── Stationery Reference Gallery ─────────────────────────────────────────
// Browse by piece type, not by event — because stationery inspiration is
// about the physical object. The couple hits ♥ or ✕ and the choices seed
// the moodboard with a caption that ties back to the piece.

import { useMemo, useState } from "react";
import { Heart, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { WorkspaceCategory } from "@/types/workspace";
import {
  Eyebrow,
  PanelCard,
} from "@/components/workspace/blocks/primitives";
import { Layers } from "lucide-react";

type PieceType =
  | "save_the_date"
  | "main_invite"
  | "event_cards"
  | "menu"
  | "program";

const PIECE_LABEL: Record<PieceType, string> = {
  save_the_date: "Save the Date",
  main_invite: "Main Invite",
  event_cards: "Event Cards",
  menu: "Menu",
  program: "Program",
};

const PIECE_PROMPT: Record<PieceType, string> = {
  save_the_date:
    "What should guests feel when they open the mailbox the first time?",
  main_invite:
    "What should your main invite feel like in-hand — heft, finish, first glance?",
  event_cards: "Should each event card feel its own — or like one suite?",
  menu:
    "Menu cards carry the table aesthetic — quiet and legible, or a whole mood?",
  program:
    "Programs are the only piece guests hold during the ceremony. What do they need?",
};

const REFERENCES: Record<PieceType, { url: string; caption: string }[]> = {
  save_the_date: [
    {
      url: "https://images.unsplash.com/photo-1521791055366-0d553872125f?w=480&q=70",
      caption: "Gold-framed save-the-date with Devanagari subtitle",
    },
    {
      url: "https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=480&q=70",
      caption: "Art-deco save-the-date in cream and black",
    },
    {
      url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=480&q=70",
      caption: "Minimal terracotta save-the-date, no motif",
    },
    {
      url: "https://images.unsplash.com/photo-1519657337289-077653f724ed?w=480&q=70",
      caption: "Hand-painted botanical save-the-date",
    },
  ],
  main_invite: [
    {
      url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=480&q=70",
      caption: "Lotus-cornered letterpress main invite",
    },
    {
      url: "https://images.unsplash.com/photo-1520512236001-f7edd6b32b8d?w=480&q=70",
      caption: "Calligraphic script with muted ivory",
    },
    {
      url: "https://images.unsplash.com/photo-1513436539083-9d2127e742f1?w=480&q=70",
      caption: "Monogram-forward crest invite",
    },
    {
      url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=480&q=70",
      caption: "Foil-stamped lotus with ornate border",
    },
  ],
  event_cards: [
    {
      url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=480&q=70",
      caption: "Indigo Sangeet card with gold foil accent",
    },
    {
      url: "https://images.unsplash.com/photo-1567002260557-eec64317e6e4?w=480&q=70",
      caption: "Architectural arch motif for ceremony card",
    },
    {
      url: "https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=480&q=70",
      caption: "Type-only event card, modernist",
    },
    {
      url: "https://images.unsplash.com/photo-1487700160041-babef9c3cb55?w=480&q=70",
      caption: "Watercolour Haldi card in turmeric",
    },
  ],
  menu: [
    {
      url: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=480&q=70",
      caption: "Letterpress menu on handmade paper",
    },
    {
      url: "https://images.unsplash.com/photo-1528825871115-3581a5387919?w=480&q=70",
      caption: "Menu with vellum overlay and wax seal",
    },
    {
      url: "https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=480&q=70",
      caption: "Tall ivory menu card, simple serif",
    },
  ],
  program: [
    {
      url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=480&q=70",
      caption: "Booklet program with ritual translations",
    },
    {
      url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=480&q=70",
      caption: "Fan-style ceremony program for outdoor mandap",
    },
    {
      url: "https://images.unsplash.com/photo-1464047736614-af63643285bf?w=480&q=70",
      caption: "Folded program tied with silk ribbon",
    },
  ],
};

export function StationeryReferenceGallery({
  category,
}: {
  category: WorkspaceCategory;
}) {
  const addMoodboardItem = useWorkspaceStore((s) => s.addMoodboardItem);
  const [piece, setPiece] = useState<PieceType>("main_invite");
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const items = useMemo(() => REFERENCES[piece], [piece]);

  return (
    <PanelCard
      icon={<Layers size={14} strokeWidth={1.8} />}
      title="Reference pieces"
      className="lg:col-span-3"
      badge={
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
          Browse by piece, not by event
        </span>
      }
    >
      <p className="-mt-1 mb-3 font-serif text-[13px] italic text-ink-muted">
        {PIECE_PROMPT[piece]}
      </p>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {(Object.keys(PIECE_LABEL) as PieceType[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPiece(p)}
            className={cn(
              "rounded-full px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.12em] transition-colors",
              piece === p
                ? "bg-ink text-ivory"
                : "border border-border bg-white text-ink-muted hover:text-ink",
            )}
          >
            {PIECE_LABEL[p]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const key = `${piece}:${item.url}`;
          if (dismissed.has(key)) return null;
          return (
            <figure
              key={key}
              className="group overflow-hidden rounded-md border border-border bg-white"
            >
              <div className="aspect-[4/5] bg-ivory-warm">
                <img
                  src={item.url}
                  alt={item.caption}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              <figcaption className="px-2 py-1.5">
                <p className="line-clamp-2 text-[11px] text-ink-muted">
                  {item.caption}
                </p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      addMoodboardItem(
                        category.id,
                        item.url,
                        `${PIECE_LABEL[piece]} · ${item.caption}`,
                      );
                      setDismissed((prev) => new Set(prev).add(key));
                    }}
                    className="inline-flex items-center gap-1 rounded-sm bg-rose-pale/60 px-2 py-1 text-[10.5px] font-medium text-rose hover:bg-rose-pale"
                  >
                    <Heart size={10} strokeWidth={1.8} />
                    Love it
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDismissed((prev) => new Set(prev).add(key))
                    }
                    className="inline-flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-1 text-[10.5px] text-ink-muted hover:text-ink"
                  >
                    <X size={10} strokeWidth={1.8} />
                    Not for us
                  </button>
                </div>
              </figcaption>
            </figure>
          );
        })}
      </div>

      {items.every((i) => dismissed.has(`${piece}:${i.url}`)) && (
        <div className="mt-3 flex items-center justify-between rounded-md border border-dashed border-border bg-ivory-warm/30 p-3">
          <p className="font-serif text-[14px] italic text-ink-muted">
            You&apos;ve seen every reference for {PIECE_LABEL[piece]}.
          </p>
          <button
            type="button"
            onClick={() => setDismissed(new Set())}
            className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-muted hover:text-saffron"
          >
            Show all again
          </button>
        </div>
      )}

      <Eyebrow className="mt-4">Saved picks land on your moodboard above</Eyebrow>
    </PanelCard>
  );
}
