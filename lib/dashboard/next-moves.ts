// ── Next moves ────────────────────────────────────────────────────────────
// Dependency-aware list of the most useful actions the couple should take
// right now. Each move names what it unblocks so the stakes are visible.
// The rail used to teach this sequencing as taxonomy ("Foundation · Book
// First"); the dashboard now teaches it contextually as concrete moves.

import type { WorkspaceCategory, WorkspaceCategorySlug } from "@/types/workspace";

export interface NextMove {
  id: string;
  title: string;
  blurb: string;
  href: string;
}

interface MoveCtx {
  briefDone: boolean;
  categories: WorkspaceCategory[];
  eventsCount: number;
  eventsMissingMood: number;
}

// Categories that block downstream work. Mirrors the legacy tier definition
// — venue locks the date and load-in shape; photography locks shot list and
// timing; catering locks per-event service; HMUA reads from these to plan
// trial sequencing.
const BLOCKERS: Array<{
  slug: WorkspaceCategorySlug;
  title: string;
  unblocks: string;
}> = [
  { slug: "venue", title: "Lock your venue", unblocks: "blocks HMUA, catering, load-in" },
  { slug: "catering", title: "Choose your caterer", unblocks: "blocks tasting, dietary, bar plans" },
  { slug: "photography", title: "Book photography", unblocks: "blocks shot list, day-of timing" },
  { slug: "decor_florals", title: "Lock décor & florals direction", unblocks: "blocks mandap design, lighting" },
  { slug: "hmua", title: "Book HMUA", unblocks: "blocks trial dates, bridal party scheduling" },
  { slug: "entertainment", title: "Lock entertainment", unblocks: "blocks Sangeet rehearsal, song list" },
  { slug: "stationery", title: "Pick stationery direction", unblocks: "ties off invitation send dates" },
];

export function computeNextMoves(ctx: MoveCtx): NextMove[] {
  const moves: NextMove[] = [];

  if (!ctx.briefDone) {
    moves.push({
      id: "finish-brief",
      title: "Finish your brief",
      blurb: "blocks every other suggestion the AI can make for you",
      href: "/events",
    });
    return moves;
  }

  if (ctx.eventsCount > 0 && ctx.eventsMissingMood > 0) {
    moves.push({
      id: "set-vibes",
      title: `Set ${ctx.eventsMissingMood === 1 ? "a vibe" : "vibes"} on your remaining ${
        ctx.eventsMissingMood === 1 ? "event" : `${ctx.eventsMissingMood} events`
      }`,
      blurb: "blocks per-event attire, palette shifts, cuisine direction",
      href: "/events",
    });
  }

  for (const blocker of BLOCKERS) {
    if (moves.length >= 3) break;
    const cat = ctx.categories.find((c) => c.slug === blocker.slug);
    if (!cat) continue;
    if (cat.status === "assigned") continue;
    moves.push({
      id: `book-${blocker.slug}`,
      title: blocker.title,
      blurb: blocker.unblocks,
      href: `/workspace/${slugToRouteSegment(blocker.slug)}`,
    });
  }

  return moves.slice(0, 3);
}

// Most workspace categories live at /workspace and use sidebar selection;
// the per-category routes that exist today are the dashes-as-slugs style.
function slugToRouteSegment(slug: WorkspaceCategorySlug): string {
  return slug.replace(/_/g, "-");
}
