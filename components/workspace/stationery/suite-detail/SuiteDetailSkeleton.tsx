// ── Loading skeleton ─────────────────────────────────────────────────────
// Mirrors the real panel layout so the transition to loaded content feels
// like the same page coming into focus rather than a layout shift. Uses
// the existing .skeleton utility from globals.css.

export function SuiteDetailSkeleton() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="skeleton h-7 w-7 shrink-0 rounded-md" />
          <div className="flex-1 space-y-2.5">
            <div className="skeleton h-3 w-24 rounded-full" />
            <div className="skeleton h-8 w-4/5 rounded" />
            <div className="skeleton h-4 w-3/5 rounded" />
          </div>
        </div>
        <div className="flex gap-2 pl-10">
          <div className="skeleton h-6 w-44 rounded-full" />
          <div className="skeleton h-6 w-20 rounded-full" />
        </div>
      </div>

      {/* Editorial */}
      <div className="space-y-3">
        <div className="skeleton h-3 w-20 rounded-full" />
        <div className="skeleton h-5 w-1/2 rounded" />
        <div className="space-y-2 pt-2">
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-[92%] rounded" />
          <div className="skeleton h-4 w-[88%] rounded" />
          <div className="skeleton h-4 w-[70%] rounded" />
        </div>
      </div>

      {/* Tips */}
      <div className="space-y-3">
        <div className="skeleton h-3 w-28 rounded-full" />
        <div className="skeleton h-5 w-2/5 rounded" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="skeleton h-4 w-5 rounded" />
            <div className="flex-1 space-y-1.5">
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-[80%] rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Inspiration row */}
      <div className="space-y-3">
        <div className="skeleton h-3 w-24 rounded-full" />
        <div className="skeleton h-5 w-2/5 rounded" />
        <div className="flex gap-4 pt-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-[220px] shrink-0 space-y-2">
              <div className="skeleton aspect-[4/3] w-full rounded-md" />
              <div className="skeleton h-3.5 w-full rounded" />
              <div className="skeleton h-3 w-1/2 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
