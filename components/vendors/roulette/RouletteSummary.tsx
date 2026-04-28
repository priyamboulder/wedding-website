"use client";

// ── Roulette session summary ────────────────────────────────────────────────
// End-of-session recap. Call-requested saves float above heart saves. The
// bride can jot a private note on each save inline; the note is written back
// to the shared shortlist entry so it surfaces in My Vendors too.

import { useMemo, useState } from "react";
import { Dices, Heart, Phone, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/lib/vendor-categories";
import { formatPriceShort } from "@/lib/vendors/price-display";
import { useRouletteStore } from "@/stores/roulette-store";
import { useVendorsStore } from "@/stores/vendors-store";
import type { Vendor } from "@/types/vendor";

export function RouletteSummary({
  sessionId,
  onRestart,
}: {
  sessionId: string;
  onRestart: () => void;
}) {
  const session = useRouletteStore((s) =>
    s.sessions.find((x) => x.id === sessionId),
  );
  const actions = useRouletteStore((s) => s.actions);
  const vendors = useVendorsStore((s) => s.vendors);
  const shortlist = useVendorsStore((s) => s.shortlist);
  const updateShortlistEntry = useVendorsStore((s) => s.updateShortlistEntry);

  const vendorById = useMemo(() => {
    const m = new Map<string, Vendor>();
    for (const v of vendors) m.set(v.id, v);
    return m;
  }, [vendors]);

  const sessionActions = useMemo(
    () => actions.filter((a) => a.session_id === sessionId),
    [actions, sessionId],
  );

  const savedCount = sessionActions.filter((a) => a.action === "save").length;
  const callCount = sessionActions.filter((a) => a.action === "book_call").length;
  const skipCount = sessionActions.filter((a) => a.action === "skip").length;

  // Collect one entry per vendor acted on (save or book_call), latest wins.
  const kept = useMemo(() => {
    const byVendor = new Map<
      string,
      { action: "save" | "book_call"; vendor: Vendor }
    >();
    for (const a of sessionActions) {
      if (a.action !== "save" && a.action !== "book_call") continue;
      const v = vendorById.get(a.vendor_id);
      if (!v) continue;
      byVendor.set(a.vendor_id, { action: a.action, vendor: v });
    }
    const list = Array.from(byVendor.values());
    // Calls first, then saves, then alphabetical within each group.
    list.sort((a, b) => {
      if (a.action !== b.action) return a.action === "book_call" ? -1 : 1;
      return a.vendor.name.localeCompare(b.vendor.name);
    });
    return list;
  }, [sessionActions, vendorById]);

  if (!session) {
    return (
      <div className="flex flex-1 items-center justify-center bg-ivory p-6 text-sm text-ink-muted">
        session not found
      </div>
    );
  }

  const categoryLabel = CATEGORY_LABELS[session.filters.category] ?? "vendors";

  return (
    <div className="flex-1 overflow-y-auto bg-ivory">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="mb-10 text-center">
          <div className="mb-3 text-[10px] uppercase tracking-[0.3em] text-ink-muted">
            — roulette results —
          </div>
          <h1 className="font-display text-3xl text-ink">
            you looked at {session.total_vendors}{" "}
            {categoryLabel.toLowerCase()}
            {session.filters.city ? ` in ${session.filters.city}` : ""}
          </h1>
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-center gap-6 rounded-xl border border-gold/15 bg-white px-5 py-4 text-xs">
          <Stat icon={<Heart size={14} className="text-rose" />} value={savedCount} label="saved" />
          <Stat icon={<Phone size={14} className="text-gold" />} value={callCount} label="calls" />
          <Stat icon={<X size={14} className="text-ink-muted" />} value={skipCount} label="skipped" />
        </div>

        {kept.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gold/25 bg-white px-6 py-10 text-center">
            <p className="text-sm text-ink-muted">
              you didn&rsquo;t save anyone this round.
            </p>
            <p className="mt-1 text-xs text-ink-faint">
              try widening your filters and running another round.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-[10px] uppercase tracking-[0.25em] text-ink-muted">
              — your shortlist from this round —
            </div>
            {kept.map(({ vendor, action }) => {
              const entry = shortlist.find((e) => e.vendor_id === vendor.id);
              return (
                <KeptCard
                  key={vendor.id}
                  vendor={vendor}
                  action={action}
                  note={entry?.notes ?? ""}
                  onNoteChange={(notes) =>
                    updateShortlistEntry(vendor.id, { notes })
                  }
                />
              );
            })}
          </div>
        )}

        <div className="mt-10 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-ivory hover:opacity-90"
          >
            <Dices size={14} strokeWidth={1.6} />
            start another round
          </button>
          <a
            href="/vendors"
            className="text-xs text-ink-muted underline-offset-4 hover:underline"
          >
            view full shortlist in my vendors →
          </a>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-base font-medium text-ink">{value}</span>
      <span className="uppercase tracking-wider text-ink-muted">{label}</span>
    </div>
  );
}

function KeptCard({
  vendor,
  action,
  note,
  onNoteChange,
}: {
  vendor: Vendor;
  action: "save" | "book_call";
  note: string;
  onNoteChange: (note: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note);

  const commit = () => {
    if (draft !== note) onNoteChange(draft);
    setEditing(false);
  };

  const cover = (vendor.portfolio_images ?? [])[0]?.url ?? vendor.cover_image;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border bg-white p-3",
        action === "book_call"
          ? "border-gold/40 shadow-[0_2px_8px_-2px_rgba(184,134,11,0.15)]"
          : "border-gold/15",
      )}
    >
      {cover && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={cover}
          alt={vendor.name}
          className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {action === "book_call" ? (
            <Phone size={12} className="text-gold" />
          ) : (
            <Heart size={12} className="text-rose" />
          )}
          <span className="truncate text-sm font-medium text-ink">
            {vendor.name}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-ink-muted">
          {CATEGORY_LABELS[vendor.category]}
          {vendor.location ? ` · ${vendor.location}` : ""} ·{" "}
          {formatPriceShort(vendor.price_display)}
        </p>
        {vendor.style_tags.length > 0 && (
          <p className="mt-1 text-[10px] text-ink-faint">
            {vendor.style_tags.slice(0, 3).join(" · ")}
          </p>
        )}

        {editing ? (
          <div className="mt-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoFocus
              rows={2}
              placeholder="why you saved them…"
              className="w-full rounded-md border border-gold/25 bg-ivory/60 p-2 text-xs text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
            />
            <div className="mt-1 flex gap-2 text-[11px]">
              <button
                type="button"
                onClick={commit}
                className="rounded bg-ink px-2 py-1 text-ivory hover:opacity-90"
              >
                save note
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraft(note);
                  setEditing(false);
                }}
                className="text-ink-muted hover:text-ink"
              >
                cancel
              </button>
            </div>
          </div>
        ) : note ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="mt-2 block w-full rounded-md bg-ivory-warm/60 px-2 py-1.5 text-left text-xs italic text-ink-muted hover:bg-ivory-warm"
          >
            &ldquo;{note}&rdquo;
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="mt-2 text-[11px] text-ink-muted underline-offset-4 hover:text-ink hover:underline"
          >
            + add a note
          </button>
        )}
      </div>
      <a
        href={`/vendors/${vendor.slug}`}
        className="flex-shrink-0 self-center rounded-md border border-gold/20 bg-white px-2.5 py-1 text-[11px] text-ink-muted hover:border-gold/40 hover:text-ink"
      >
        view →
      </a>
    </div>
  );
}
