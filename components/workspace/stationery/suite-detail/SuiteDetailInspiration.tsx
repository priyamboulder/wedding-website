// ── Inspiration gallery ──────────────────────────────────────────────────
// Horizontal scroll row of curated reference images. Each card carries a
// caption, credit, and style tags. Empty state is a quiet placeholder, not
// an error — the planner may not have curated this piece yet.

import type {
  StationerySuiteDetail,
  StationerySuiteInspiration,
} from "@/types/stationery";

export function SuiteDetailInspiration({
  detail,
  inspirations,
}: {
  detail: StationerySuiteDetail;
  inspirations: StationerySuiteInspiration[];
}) {
  return (
    <section aria-labelledby="suite-inspiration-heading" className="space-y-4">
      <div className="space-y-1">
        <p
          id="suite-inspiration-heading"
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Inspiration
        </p>
        <h3 className="font-serif text-[18px] text-ink">References we keep on file</h3>
        <p className="max-w-prose pt-1 text-[13.5px] leading-relaxed text-ink-muted">
          {detail.inspiration_notes}
        </p>
      </div>

      {inspirations.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-ivory-warm/40 px-5 py-8 text-center">
          <p className="font-serif text-[14px] italic text-ink-muted">
            Inspiration coming soon — we&rsquo;re curating the perfect examples for you.
          </p>
        </div>
      ) : (
        <div className="-mx-8 overflow-x-auto workspace-event-chip-scroll px-8">
          <div className="flex gap-4 pb-2">
            {inspirations.map((ins) => (
              <InspirationCard key={ins.id} inspiration={ins} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function InspirationCard({
  inspiration,
}: {
  inspiration: StationerySuiteInspiration;
}) {
  return (
    <figure className="flex w-[220px] shrink-0 flex-col gap-2">
      <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-border bg-ivory-warm">
        {inspiration.image_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={inspiration.image_url}
            alt={inspiration.caption ?? "Inspiration reference"}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[11px] text-ink-faint">
            No image
          </div>
        )}
      </div>
      {inspiration.caption && (
        <figcaption className="text-[12.5px] leading-snug text-ink-muted">
          {inspiration.caption}
        </figcaption>
      )}
      {inspiration.credit && (
        <span
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {inspiration.credit}
        </span>
      )}
      {inspiration.style_tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {inspiration.style_tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-ivory-warm px-2 py-0.5 text-[10px] text-ink-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </figure>
  );
}

