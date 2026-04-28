"use client";

// ── Menu & Flow tab ────────────────────────────────────────────────────────
// Mirrors the concept detail's menu + timeline + activities sections, but
// scoped to the *selected* concept so the planner can execute without
// re-navigating. Falls back to a "pick a concept first" card when no
// selection exists.

import { ArrowRight, CalendarDays, Flower2, Sparkles, Utensils } from "lucide-react";
import { useBridalShowerStore } from "@/stores/bridal-shower-store";
import { getConceptById } from "@/lib/bridal-shower-concepts";

export function MenuFlowTab() {
  const selectionId = useBridalShowerStore((s) => s.selection.conceptId);
  const concept = selectionId ? getConceptById(selectionId) : null;
  const guestCount = useBridalShowerStore((s) => s.guests.length);

  if (!concept) {
    return <EmptyConcept />;
  }

  return (
    <div className="space-y-6">
      <header>
        <p
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {concept.name.toUpperCase()}
        </p>
        <h2 className="mt-1 font-serif text-[22px] leading-tight text-ink">
          The execution blueprint
        </h2>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ink-muted">
          Scaled for {guestCount} guests. Food, drinks, activities, and the
          minute-by-minute run — the document you'd hand your co-planner on
          the morning of.
        </p>
      </header>

      {/* Menu */}
      <section className="rounded-lg border border-border bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <Utensils size={16} strokeWidth={1.6} className="text-saffron" />
          <h3 className="font-serif text-[17px] text-ink">The menu</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-md border border-border/60 bg-ivory-warm/20 p-4">
            <Eyebrow>SIGNATURE — {concept.menu.welcomeDrink}</Eyebrow>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink">
              {concept.menu.welcomeDrinkRecipe}
            </p>
          </div>
          <div className="rounded-md border border-border/60 bg-ivory-warm/20 p-4">
            <Eyebrow>NON-ALC — {concept.menu.mocktail}</Eyebrow>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink">
              {concept.menu.mocktailRecipe}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <Eyebrow>APPETIZERS</Eyebrow>
            <ul className="mt-1.5 list-inside list-disc space-y-1 text-[13px] text-ink">
              {concept.menu.appetizers.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
          <div>
            <Eyebrow>MAIN · {concept.menu.mainStyle.replace("_", "-")}</Eyebrow>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink">
              {concept.menu.mainCourse}
            </p>
            {concept.menu.sides.length > 0 && (
              <>
                <Eyebrow>SIDES</Eyebrow>
                <ul className="mt-1.5 list-inside list-disc space-y-1 text-[13px] text-ink">
                  {concept.menu.sides.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <Eyebrow>DESSERT</Eyebrow>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink">
              {concept.menu.dessert}
            </p>
          </div>
          <div>
            <Eyebrow>DRINKS STRATEGY</Eyebrow>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink">
              {concept.menu.drinksGuidance}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-md border border-sage/30 bg-sage-pale/30 p-4">
          <Eyebrow>DIETARY ACCOMMODATIONS</Eyebrow>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink">
            {concept.menu.dietaryNotes}
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="rounded-lg border border-border bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays size={16} strokeWidth={1.6} className="text-saffron" />
          <h3 className="font-serif text-[17px] text-ink">The timeline</h3>
        </div>
        <ol className="space-y-4">
          {concept.timeline.map((beat, i) => (
            <li
              key={i}
              className="grid grid-cols-[90px_1fr] gap-4 border-l-2 border-gold-pale pl-4"
            >
              <span
                className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-saffron"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {beat.time}
              </span>
              <div>
                <p className="text-[13.5px] font-medium text-ink">
                  {beat.title}
                </p>
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-muted">
                  {beat.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Activities */}
      <section className="rounded-lg border border-border bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles size={16} strokeWidth={1.6} className="text-saffron" />
          <h3 className="font-serif text-[17px] text-ink">Activities</h3>
        </div>
        <ul className="space-y-3">
          {concept.activities.map((a) => (
            <li
              key={a.id}
              className="rounded-md border border-border/60 bg-ivory-warm/30 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-serif text-[15px] leading-tight text-ink">
                    {a.title}
                  </h4>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
                    {a.description}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span
                    className="block font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {a.timeMinutes > 0 ? `${a.timeMinutes} min` : "Passive"}
                  </span>
                  <span
                    className={
                      a.multiGenerationalFriendly
                        ? "mt-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-sage"
                        : "mt-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-rose"
                    }
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {a.multiGenerationalFriendly
                      ? "Multi-gen ok"
                      : "Skip for elders"}
                  </span>
                </div>
              </div>
              {a.skipIf && (
                <p className="mt-2 border-t border-border/60 pt-2 text-[11.5px] italic text-ink-muted">
                  <strong className="text-ink">Skip if:</strong> {a.skipIf}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Décor direction reminder */}
      <section className="rounded-lg border border-border bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <Flower2 size={16} strokeWidth={1.6} className="text-saffron" />
          <h3 className="font-serif text-[17px] text-ink">Décor direction</h3>
        </div>
        <ul className="flex flex-wrap gap-3">
          {concept.decor.palette.map((c) => (
            <li
              key={c.hex}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1"
            >
              <span
                className="h-4 w-4 rounded-full border border-border/60"
                style={{ backgroundColor: c.hex }}
              />
              <span className="text-[11.5px] text-ink">{c.label}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-3">
          <div>
            <Eyebrow>FLORALS</Eyebrow>
            <dd className="mt-1 text-[13px] leading-relaxed text-ink">
              {concept.decor.florals}
            </dd>
          </div>
          <div>
            <Eyebrow>STATEMENT MOMENT</Eyebrow>
            <dd className="mt-1 text-[13px] leading-relaxed text-ink">
              {concept.decor.statementMoment}
            </dd>
          </div>
          <div className="rounded-md border border-rose/30 bg-rose-pale/25 p-3">
            <Eyebrow>SKIP THESE</Eyebrow>
            <dd className="mt-1 text-[12.5px] leading-relaxed text-ink">
              {concept.decor.skipThese}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </p>
  );
}

function EmptyConcept() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-ivory-warm/40 p-10 text-center">
      <Flower2
        size={24}
        strokeWidth={1.4}
        className="mx-auto mb-3 text-ink-faint"
      />
      <h3 className="font-serif text-[17px] text-ink">
        Pick a concept first
      </h3>
      <p className="mx-auto mt-1.5 max-w-md text-[13px] leading-relaxed text-ink-muted">
        The menu, timeline, and activities are all tied to a specific concept.
        Head to the Concepts tab, select the one that feels like her, then
        come back here for the full run sheet.
      </p>
      <p
        className="mt-3 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.14em] text-saffron"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Concepts tab <ArrowRight size={11} strokeWidth={2} />
      </p>
    </div>
  );
}
