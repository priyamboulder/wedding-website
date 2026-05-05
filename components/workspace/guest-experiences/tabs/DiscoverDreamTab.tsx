"use client";

// ── Guest Experiences — Discover & Dream tab ────────────────────────────────
// Full-workspace mode of the discovery surface. Same data and same shared
// React components as the guided journey — guided just walks them one at a
// time. Order on this tab:
//
//   1. Quiz entry card (legacy seed for vibe/brief)
//   2. Reaction counter strip
//   3. Experience Vibe form     ← NEW (above the Explorer)
//   4. Experience Explorer       (full catalog)
//   5. Experience Map
//   6. Experience Brief          ← NEW (below the Map)
//
// Reactions, vibe edits, and brief edits all read/write the same store
// slices the guided journey writes to, so flipping modes never loses data.

import type { WorkspaceCategory } from "@/types/workspace";
import { getQuizSchema } from "@/lib/quiz/registry";
import { QuizEntryCard, QuizRetakeLink } from "@/components/quiz/QuizEntryCard";
import {
  ExperienceExplorer,
  ReactionCounter,
} from "@/components/workspace/guest-experiences/shared/ExperienceExplorer";
import { ExperienceMap } from "@/components/workspace/guest-experiences/shared/ExperienceMap";
import { ExperienceVibeForm } from "@/components/workspace/guest-experiences/shared/ExperienceVibeForm";
import { ExperienceBriefEditor } from "@/components/workspace/guest-experiences/shared/ExperienceBriefEditor";

export function DiscoverDreamTab({
  category,
  onViewShortlist,
}: {
  category: WorkspaceCategory;
  onViewShortlist: () => void;
}) {
  const quiz = getQuizSchema(category.slug, "vision");

  return (
    <div className="space-y-10">
      {quiz && <QuizEntryCard schema={quiz} categoryId={category.id} />}

      <ReactionCounter onViewShortlist={onViewShortlist} />

      <section>
        <ExperienceVibeForm variant="section" />
      </section>

      <section>
        <SectionHeader
          eyebrow="Experience Explorer"
          title="Browse, react, and surface what fits"
          blurb="Walk the catalog. Tap the heart on anything you love — it flows to the shortlist. Skip what doesn't."
        />
        <ExperienceExplorer mode="full" />
      </section>

      <section>
        <SectionHeader
          eyebrow="Experience Map"
          title="What happens at each event"
          blurb="Loved items show up here under the events they'd fit. Toggle assignments on or off per event."
        />
        <div className="mt-5">
          <ExperienceMap />
        </div>
      </section>

      <section>
        <ExperienceBriefEditor variant="section" />
      </section>

      {quiz && (
        <div className="flex justify-end">
          <QuizRetakeLink schema={quiz} categoryId={category.id} />
        </div>
      )}
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  blurb,
}: {
  eyebrow: string;
  title: string;
  blurb: string;
}) {
  return (
    <div>
      <p
        className="font-mono text-[10px] uppercase tracking-[0.2em] text-saffron"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {eyebrow}
      </p>
      <h2 className="mt-1.5 font-serif font-bold text-[22px] leading-tight text-ink">
        {title}
      </h2>
      <p className="mt-1.5 max-w-3xl text-[13px] text-ink-muted">{blurb}</p>
    </div>
  );
}
