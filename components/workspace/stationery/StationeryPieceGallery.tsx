"use client";

// ── Stationery · Reference gallery by piece + by event ────────────────────
// Mirrors Photography's "Reference gallery by event" — but scoped to
// STATIONERY PIECES first (save-the-date, main invite, envelope, menu…)
// and then an optional secondary chip row for weddings where the
// aesthetic shifts event-to-event (playful Sangeet vs. formal Wedding).
//
// Love / Not-for-us reactions persist via stationery-store.refReactions
// and "Love it" also seeds the moodboard so the designer sees the pin.

import { useMemo, useState } from "react";
import { Heart, Layers, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStationeryStore } from "@/stores/stationery-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { WorkspaceCategory } from "@/types/workspace";
import {
  Eyebrow,
  PanelCard,
} from "@/components/workspace/blocks/primitives";

type PieceScope =
  | "save_the_date"
  | "main_invite"
  | "rsvp"
  | "details_card"
  | "envelope"
  | "menu"
  | "program"
  | "signage";

type EventScope =
  | "haldi"
  | "mehendi"
  | "sangeet"
  | "baraat"
  | "wedding"
  | "reception";

const PIECE_LABEL: Record<PieceScope, string> = {
  save_the_date: "Save-the-date",
  main_invite: "Main invite",
  rsvp: "RSVP",
  details_card: "Details card",
  envelope: "Envelope",
  menu: "Menu",
  program: "Program",
  signage: "Signage",
};

const PIECE_PROMPT: Record<PieceScope, string> = {
  save_the_date:
    "What should your save-the-date feel like when it arrives in the mailbox?",
  main_invite:
    "What should the main invite feel like in-hand — heft, finish, first glance?",
  rsvp:
    "RSVP cards are small but carry the suite's rhythm. What should they be?",
  details_card:
    "Details cards get re-read. Should they be functional or feel like part of the art?",
  envelope:
    "The envelope is the first thing anyone touches. How should it read before they open it?",
  menu:
    "Menu cards carry the table aesthetic — quiet and legible, or a whole mood?",
  program:
    "Programs are the only piece guests hold during the ceremony. What do they need?",
  signage:
    "Signage lives large — welcome boards, seating chart, bar menu. What voice?",
};

const EVENT_LABEL: Record<EventScope, string> = {
  haldi: "Haldi",
  mehendi: "Mehendi",
  sangeet: "Sangeet",
  baraat: "Baraat",
  wedding: "Wedding",
  reception: "Reception",
};

const PIECE_REFS: Record<PieceScope, { url: string; caption: string }[]> = {
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
  rsvp: [
    {
      url: "https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=480&q=70",
      caption: "Type-only reply card with QR",
    },
    {
      url: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=480&q=70",
      caption: "Letterpress RSVP on blush cotton",
    },
    {
      url: "https://images.unsplash.com/photo-1519657337289-077653f724ed?w=480&q=70",
      caption: "Watercolour tab with check-boxes",
    },
  ],
  details_card: [
    {
      url: "https://images.unsplash.com/photo-1528825871115-3581a5387919?w=480&q=70",
      caption: "Vellum overlay details insert",
    },
    {
      url: "https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=480&q=70",
      caption: "Tall ivory details card, serif",
    },
    {
      url: "https://images.unsplash.com/photo-1567002260557-eec64317e6e4?w=480&q=70",
      caption: "Architectural motif details card",
    },
  ],
  envelope: [
    {
      url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=480&q=70",
      caption: "Wax-sealed envelope with paisley liner",
    },
    {
      url: "https://images.unsplash.com/photo-1528825871115-3581a5387919?w=480&q=70",
      caption: "Calligraphed envelope, hand-addressed",
    },
    {
      url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=480&q=70",
      caption: "Silk-band belly-wrapped envelope",
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
  signage: [
    {
      url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=480&q=70",
      caption: "Welcome board in foil on dark wood",
    },
    {
      url: "https://images.unsplash.com/photo-1487700160041-babef9c3cb55?w=480&q=70",
      caption: "Watercolour seating chart framed",
    },
    {
      url: "https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=480&q=70",
      caption: "Acrylic modern bar menu sign",
    },
  ],
};

// Event-level references — curated so each event has its own aesthetic
// direction for couples whose events shift tone.
const EVENT_REFS: Record<EventScope, { url: string; caption: string }[]> = {
  haldi: [
    {
      url: "https://images.unsplash.com/photo-1600721391776-b5cd0e0048a9?w=480&q=70",
      caption: "Turmeric-washed Haldi invite with marigold border",
    },
    {
      url: "https://images.unsplash.com/photo-1487700160041-babef9c3cb55?w=480&q=70",
      caption: "Watercolour turmeric yellow save-the-date",
    },
  ],
  mehendi: [
    {
      url: "https://images.unsplash.com/photo-1604608672516-f1b9b1d1e9b5?w=480&q=70",
      caption: "Hand-lettered Mehendi insert in olive and rose",
    },
    {
      url: "https://images.unsplash.com/photo-1595940293613-19d8d97f7a4f?w=480&q=70",
      caption: "Paisley-drenched Mehendi card",
    },
  ],
  sangeet: [
    {
      url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=480&q=70",
      caption: "Indigo Sangeet card with gold foil",
    },
    {
      url: "https://images.unsplash.com/photo-1583939411023-14783179e581?w=480&q=70",
      caption: "Playful Sangeet insert, bright saturated",
    },
  ],
  baraat: [
    {
      url: "https://images.unsplash.com/photo-1532377611767-e6d7c7d90b54?w=480&q=70",
      caption: "Procession-themed Baraat card, horse + dhol motif",
    },
  ],
  wedding: [
    {
      url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=480&q=70",
      caption: "Foil-stamped lotus wedding main invite",
    },
    {
      url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=480&q=70",
      caption: "Letterpress wedding card, traditional ornate",
    },
  ],
  reception: [
    {
      url: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=480&q=70",
      caption: "Modern reception invite, art-deco",
    },
    {
      url: "https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=480&q=70",
      caption: "Minimal ivory reception card",
    },
  ],
};

// ── Gallery ───────────────────────────────────────────────────────────────

export function StationeryPieceGallery({
  category,
}: {
  category: WorkspaceCategory;
}) {
  const [mode, setMode] = useState<"piece" | "event">("piece");
  const [piece, setPiece] = useState<PieceScope>("save_the_date");
  const [event, setEvent] = useState<EventScope>("wedding");

  return (
    <PanelCard
      icon={<Layers size={14} strokeWidth={1.8} />}
      title="Reference gallery"
      badge={
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMode("piece")}
            className={cn(
              "rounded-sm border px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] transition-colors",
              mode === "piece"
                ? "border-ink bg-ink text-ivory"
                : "border-border bg-white text-ink-muted hover:border-ink",
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            By piece
          </button>
          <button
            type="button"
            onClick={() => setMode("event")}
            className={cn(
              "rounded-sm border px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] transition-colors",
              mode === "event"
                ? "border-ink bg-ink text-ivory"
                : "border-border bg-white text-ink-muted hover:border-ink",
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            By event
          </button>
        </div>
      }
    >
      {mode === "piece" ? (
        <PieceMode
          category={category}
          piece={piece}
          setPiece={setPiece}
        />
      ) : (
        <EventMode
          category={category}
          event={event}
          setEvent={setEvent}
        />
      )}

      <Eyebrow className="mt-4">
        Saved picks land on your moodboard above
      </Eyebrow>
    </PanelCard>
  );
}

function PieceMode({
  category,
  piece,
  setPiece,
}: {
  category: WorkspaceCategory;
  piece: PieceScope;
  setPiece: (p: PieceScope) => void;
}) {
  const items = PIECE_REFS[piece];
  return (
    <div>
      <p className="-mt-1 mb-3 font-serif text-[13.5px] italic text-ink-muted">
        {PIECE_PROMPT[piece]}
      </p>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {(Object.keys(PIECE_LABEL) as PieceScope[]).map((p) => (
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
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {PIECE_LABEL[p]}
          </button>
        ))}
      </div>

      <RefGrid
        scope={`piece:${piece}`}
        scopeLabel={PIECE_LABEL[piece]}
        category={category}
        items={items}
      />
    </div>
  );
}

function EventMode({
  category,
  event,
  setEvent,
}: {
  category: WorkspaceCategory;
  event: EventScope;
  setEvent: (e: EventScope) => void;
}) {
  const items = EVENT_REFS[event];
  return (
    <div>
      <p className="-mt-1 mb-3 font-serif text-[13.5px] italic text-ink-muted">
        Does the stationery style shift by event? For weddings where the
        Sangeet invite should feel playful and the Wedding formal, tell your
        designer here.
      </p>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {(Object.keys(EVENT_LABEL) as EventScope[]).map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => setEvent(e)}
            className={cn(
              "rounded-full px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.12em] transition-colors",
              event === e
                ? "bg-ink text-ivory"
                : "border border-border bg-white text-ink-muted hover:text-ink",
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {EVENT_LABEL[e]}
          </button>
        ))}
      </div>

      <RefGrid
        scope={`event:${event}`}
        scopeLabel={EVENT_LABEL[event]}
        category={category}
        items={items}
      />
    </div>
  );
}

function RefGrid({
  scope,
  scopeLabel,
  category,
  items,
}: {
  scope: string;
  scopeLabel: string;
  category: WorkspaceCategory;
  items: { url: string; caption: string }[];
}) {
  const refReactions = useStationeryStore((s) => s.refReactions);
  const setRefReaction = useStationeryStore((s) => s.setRefReaction);
  const addMoodboardItem = useWorkspaceStore((s) => s.addMoodboardItem);
  const [customUrl, setCustomUrl] = useState("");

  const visible = useMemo(
    () => items.filter((i) => refReactions[`${scope}:${i.url}`] !== "not"),
    [items, refReactions, scope],
  );

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((item) => {
          const key = `${scope}:${item.url}`;
          const reaction = refReactions[key];
          return (
            <figure
              key={key}
              className={cn(
                "group overflow-hidden rounded-md border bg-white",
                reaction === "love"
                  ? "border-rose ring-1 ring-rose/30"
                  : "border-border",
              )}
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
                      if (reaction === "love") {
                        setRefReaction(key, null);
                      } else {
                        setRefReaction(key, "love");
                        addMoodboardItem(
                          category.id,
                          item.url,
                          `${scopeLabel} · ${item.caption}`,
                        );
                      }
                    }}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-sm px-2 py-1 text-[10.5px] font-medium transition-colors",
                      reaction === "love"
                        ? "bg-rose text-ivory"
                        : "bg-rose-pale/60 text-rose hover:bg-rose-pale",
                    )}
                  >
                    <Heart
                      size={10}
                      strokeWidth={1.8}
                      className={reaction === "love" ? "fill-ivory" : ""}
                    />
                    {reaction === "love" ? "Loved" : "Love it"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRefReaction(key, "not")}
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

      {visible.length === 0 && (
        <div className="rounded-md border border-dashed border-border bg-ivory-warm/30 p-3">
          <p className="font-serif text-[13.5px] italic text-ink-muted">
            You&apos;ve dismissed every reference for {scopeLabel}. Add your
            own below.
          </p>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        <input
          type="url"
          value={customUrl}
          onChange={(e) => setCustomUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && customUrl.trim()) {
              addMoodboardItem(
                category.id,
                customUrl.trim(),
                `${scopeLabel} · added reference`,
              );
              setCustomUrl("");
            }
          }}
          placeholder={`Add your own reference for ${scopeLabel.toLowerCase()}…`}
          className="flex-1 rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
        />
        <button
          type="button"
          onClick={() => {
            if (!customUrl.trim()) return;
            addMoodboardItem(
              category.id,
              customUrl.trim(),
              `${scopeLabel} · added reference`,
            );
            setCustomUrl("");
          }}
          className="flex items-center gap-1 rounded-sm border border-border px-2.5 py-1.5 text-[11.5px] text-ink-muted transition-colors hover:border-saffron hover:text-saffron"
        >
          <Plus size={11} /> Add
        </button>
      </div>
    </>
  );
}
