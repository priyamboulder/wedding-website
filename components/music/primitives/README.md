# Music & Entertainment primitives

Shared building blocks for the Music workspace tabs. Import from the
barrel:

```ts
import {
  AttributionChip,
  ReactionCluster,
  StatePill,
  ReferenceEmbed,
  CommentThread,
  WorkInProgressStrip,
  EventFilterBar,
  PresenceIndicator,
  // helpers
  buildMusicPartyMap,
  resolveMusicParty,
  classifyUrl,
  firstUrl,
  matchesEventFilter,
  MUSIC_EVENTS,
  // identity constants
  PRIYA_ID, ARJUN_ID, URVASHI_ID,
} from "@/components/music/primitives";
```

Party colors (locked to the Ananya palette — no new tokens):

- **Priya** → rose (`--color-rose`)
- **Arjun** → sage (closest cool tone; the spec asked for "muted blue"
  which isn't in the palette)
- **Urvashi** → ink
- **Vendors** → gold

All primitives are `"use client"` components.

---

## `<AttributionChip>`

Who added / owns / last-edited an item. Vendors render as a named chip
("DJ Pranav"); internal parties render as an initial circle.

```ts
interface AttributionChipProps {
  partyIds: MusicPartyId[];                 // 1–3 ids; extra collapses to +N
  partyMap: Record<MusicPartyId, MusicParty>;
  timestamp?: string | null;                // ISO; shown on hover
  verb?: "added by" | "owned by" | "last edited" | null;
  size?: "sm" | "md";
  className?: string;
  max?: number;                             // default 3
}
```

## `<StatePill>`

```ts
interface StatePillProps {
  state: MusicEntityState;                  // draft | waiting | in_debate | resolved | blocked | parked
  waitingOn?: MusicPartyId;                 // only used for state="waiting"
  partyMap?: Record<MusicPartyId, MusicParty>;
  labelOverride?: string;                   // e.g. "Booked" in place of "Resolved"
  size?: "sm" | "md";
  onClick?: () => void;
  className?: string;
}
```

## `<ReactionCluster>`

Three chips (Priya / Arjun / Urvashi). Click your own to cycle
`love → yes → unsure → no → idle → love`. Click someone else's to open
a detail popover.

```ts
interface ReactionClusterProps {
  reactions: MusicReaction[];
  partyMap: Record<MusicPartyId, MusicParty>;
  currentPartyId: MusicPartyId;
  partyOrder?: MusicPartyId[];              // default [PRIYA, ARJUN, URVASHI]
  onCycle: (next: MusicReactionKind) => void;
  onShowDetail?: (partyId: MusicPartyId, reaction: MusicReaction | null) => void;
  size?: "sm" | "md";
  className?: string;
}
```

Also exported: `<ReactionDetail party reaction onClose />` — a plain
popover body the tab can mount next to the chip it clicked.

## `<ReferenceEmbed>`

Given any URL, picks the right embed:

| URL source    | Rendering                               |
| ------------- | --------------------------------------- |
| Spotify       | official iframe embed                   |
| YouTube       | thumbnail with play glyph (opens tab)   |
| SoundCloud    | widget iframe                           |
| Apple Music   | `embed.music.apple.com` iframe          |
| Instagram     | link-preview card (OG fallback)         |
| Plain image   | inline `<img>`                          |
| Anything else | link-preview card via `/api/link-preview` |

```ts
interface ReferenceEmbedProps {
  url: string;
  variant?: "card" | "inline";              // default "card"
  className?: string;
  onClassify?: (kind: MusicReferenceKind) => void;
}
```

`classifyUrl(url)` and `firstUrl(text)` are re-exported for callers that
want to test a URL before rendering.

## `<CommentThread>`

2 levels of nesting max. Auto-detects the first URL in the draft and
shows a `ReferenceEmbed` preview under the composer and posted body.
Mentions like `@priya` are highlighted when the handle matches a party
id or display name.

```ts
interface CommentThreadProps {
  comments: MusicComment[];
  partyMap: Record<MusicPartyId, MusicParty>;
  currentPartyId: MusicPartyId;
  onPost: (body: string, parentId: string | undefined, referenceUrl: string | undefined) => void;
  mentionablePartyIds?: MusicPartyId[];
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
}
```

## `<WorkInProgressStrip>`

Horizontally-scrolling strip of 3–6 cards. Caller decides what counts as
in-flight (the primitive is dumb).

```ts
interface WorkInProgressStripProps {
  items: MusicWipItem[];
  partyMap: Record<MusicPartyId, MusicParty>;
  emptyMessage?: string;
  title?: string;                           // default "In flight"
  className?: string;
}

interface MusicWipItem {
  id: string;
  title: string;
  hint?: string;
  state: MusicEntityState;
  waiting_on?: MusicPartyId;
  attribution: MusicPartyId[];
  onJump?: () => void;
}
```

## `<EventFilterBar>`

Sticky filter row: `All · Haldi · Mehendi · Sangeet · Ceremony & Lunch ·
Reception`. `selected: []` means All.

```ts
interface EventFilterBarProps {
  selected: MusicEventId[];
  onChange: (next: MusicEventId[]) => void;
  counts?: Partial<Record<MusicEventId, number>>;
  sticky?: boolean;                         // default true
  className?: string;
}
```

`matchesEventFilter(itemEvents, selected)` is the convenience predicate
for tabs whose items carry an `events: MusicEventId[]` field.

## `<PresenceIndicator>`

One-line "who viewed / replied recently." Sorted freshest-first.

```ts
interface PresenceIndicatorProps {
  signals: MusicPresenceSignal[];
  partyMap: Record<MusicPartyId, MusicParty>;
  limit?: number;                           // default 5
  className?: string;
}
```

---

## Building the party map

Every primitive takes `partyMap: Record<MusicPartyId, MusicParty>`. The
tab owns this: combine the three internal parties with whatever vendor
names are currently in play.

```ts
import { buildMusicPartyMap } from "@/components/music/primitives";

const partyMap = buildMusicPartyMap({
  dj_pranav: "DJ Pranav",
  dhol_ensemble: "Mumbai Dhol Ensemble",
});
```

## Current user

Primitives never read auth state. Tabs pass `currentPartyId` — the
existing `WorkspaceRole` from `stores/workspace-store` maps directly
(`"planner" | "priya" | "arjun"`, with `"urvashi"` as the music alias
for the planner — the music parties file uses `URVASHI_ID = "urvashi"`,
so tabs that read the workspace role should translate `planner →
urvashi` before passing in).
