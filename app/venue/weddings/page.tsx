"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  MetaPill,
  SectionHeader,
  VENUE_PALETTE,
  VenueCard,
} from "@/components/venue/ui";
import {
  SHOWCASE_WEDDINGS,
  VENDOR_CATEGORY_META,
  VENUE,
  type CeremonyType,
  type ShowcaseWedding,
  type WeddingDuration,
  type WeddingSeason,
  type WeddingSetup,
} from "@/lib/venue/seed";
import { SETUP_DISPLAY, VendorBadge } from "@/components/venue/showcase-ui";

type CeremonyFilter = "All" | CeremonyType | "Interfaith/Fusion";
type GuestsFilter = "All" | "<200" | "200-300" | "300-400" | "400+";
type SetupFilter = "All" | WeddingSetup;
type SeasonFilter = "All" | WeddingSeason;
type DurationFilter = "All" | WeddingDuration;
type SortMode = "recent" | "viewed" | "featured";

const CEREMONY_OPTS: CeremonyFilter[] = [
  "All",
  "Hindu",
  "Sikh",
  "Muslim",
  "Christian",
  "Interfaith/Fusion",
  "Jain",
];
const GUESTS_OPTS: GuestsFilter[] = ["All", "<200", "200-300", "300-400", "400+"];
const SETUP_OPTS: SetupFilter[] = ["All", "indoor", "outdoor", "both", "tent"];
const SETUP_LABEL: Record<SetupFilter, string> = {
  All: "All",
  indoor: "Indoor",
  outdoor: "Outdoor",
  both: "Both",
  tent: "Tent/Marquee",
};
const SEASON_OPTS: SeasonFilter[] = ["All", "spring", "summer", "fall", "winter"];
const SEASON_LABEL: Record<SeasonFilter, string> = {
  All: "All",
  spring: "Spring",
  summer: "Summer",
  fall: "Fall",
  winter: "Winter",
};
const DURATION_OPTS: DurationFilter[] = ["All", "1-day", "2-day", "3-day+"];

export default function VenueWeddingsShowcasePage() {
  const [ceremony, setCeremony] = useState<CeremonyFilter>("All");
  const [guests, setGuests] = useState<GuestsFilter>("All");
  const [setup, setSetup] = useState<SetupFilter>("All");
  const [season, setSeason] = useState<SeasonFilter>("All");
  const [duration, setDuration] = useState<DurationFilter>("All");
  const [sort, setSort] = useState<SortMode>("featured");

  const [venueControls, setVenueControls] = useState(false);
  const [pinned, setPinned] = useState<Record<string, boolean>>({});
  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const [edits, setEdits] = useState<Record<string, Partial<ShowcaseWedding>>>({});
  const [editing, setEditing] = useState<ShowcaseWedding | null>(null);

  const filtered = useMemo(() => {
    const list = SHOWCASE_WEDDINGS.filter((w) => {
      if (hidden[w.id]) return false;
      if (ceremony !== "All") {
        if (ceremony === "Interfaith/Fusion") {
          if (w.ceremonyType !== "Interfaith" && w.ceremonyType !== "Fusion") return false;
        } else if (w.ceremonyType !== ceremony) {
          return false;
        }
      }
      if (guests !== "All") {
        const g = w.guestCount;
        if (guests === "<200" && !(g < 200)) return false;
        if (guests === "200-300" && !(g >= 200 && g < 300)) return false;
        if (guests === "300-400" && !(g >= 300 && g < 400)) return false;
        if (guests === "400+" && !(g >= 400)) return false;
      }
      if (setup !== "All" && w.setup !== setup) return false;
      if (season !== "All" && w.season !== season) return false;
      if (duration !== "All" && w.duration !== duration) return false;
      return true;
    });

    const sorted = [...list];
    if (sort === "recent") {
      sorted.sort((a, b) => b.sortDate.localeCompare(a.sortDate));
    } else if (sort === "viewed") {
      sorted.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
    } else {
      // featured-first: pinned + featured rise to top, then by date
      sorted.sort((a, b) => {
        const aTop = (pinned[a.id] ? 2 : 0) + (a.featured ? 1 : 0);
        const bTop = (pinned[b.id] ? 2 : 0) + (b.featured ? 1 : 0);
        if (aTop !== bTop) return bTop - aTop;
        return b.sortDate.localeCompare(a.sortDate);
      });
    }
    return sorted.map((w) => (edits[w.id] ? { ...w, ...edits[w.id] } : w));
  }, [ceremony, guests, setup, season, duration, sort, pinned, hidden, edits]);

  const visibleCount = SHOWCASE_WEDDINGS.filter((w) => !hidden[w.id]).length;

  return (
    <div className="mx-auto max-w-[1320px] px-8 pt-8">
      {/* Page header */}
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-[#C4A265]">
            Venue portfolio
          </p>
          <h1
            className="mt-2 text-[44px] leading-[1.02] text-[#2C2C2C]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            Wedding Showcase
          </h1>
          <p
            className="mt-2 text-[15px] italic text-[#6a6a6a]"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            {visibleCount} celebrations at {VENUE.name}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setVenueControls((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-medium transition-colors"
          style={
            venueControls
              ? { backgroundColor: VENUE_PALETTE.charcoal, color: "#FAF8F5" }
              : {
                  backgroundColor: "#FFFFFF",
                  color: "#2C2C2C",
                  boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.45)",
                }
          }
          title="Only visible to venue team — pin, hide, or edit showcase weddings"
        >
          <span aria-hidden>🔒</span>
          Venue controls
          <span
            className="ml-1 font-mono text-[9.5px] uppercase tracking-[0.20em]"
            style={{ opacity: 0.75 }}
          >
            {venueControls ? "On" : "Off"}
          </span>
        </button>
      </section>

      {/* Filter bar */}
      <section
        className="mt-6 rounded-2xl border bg-white px-5 py-5"
        style={{ borderColor: VENUE_PALETTE.hairline }}
      >
        <FilterRow label="Ceremony">
          {CEREMONY_OPTS.map((opt) => (
            <Pill
              key={opt}
              active={ceremony === opt}
              onClick={() => setCeremony(opt)}
            >
              {opt}
            </Pill>
          ))}
        </FilterRow>
        <FilterRow label="Guests">
          {GUESTS_OPTS.map((opt) => (
            <Pill key={opt} active={guests === opt} onClick={() => setGuests(opt)}>
              {opt === "<200" ? "Under 200" : opt}
            </Pill>
          ))}
        </FilterRow>
        <FilterRow label="Setup">
          {SETUP_OPTS.map((opt) => (
            <Pill key={opt} active={setup === opt} onClick={() => setSetup(opt)}>
              {SETUP_LABEL[opt]}
            </Pill>
          ))}
        </FilterRow>
        <FilterRow label="Season">
          {SEASON_OPTS.map((opt) => (
            <Pill key={opt} active={season === opt} onClick={() => setSeason(opt)}>
              {SEASON_LABEL[opt]}
            </Pill>
          ))}
        </FilterRow>
        <FilterRow label="Duration">
          {DURATION_OPTS.map((opt) => (
            <Pill
              key={opt}
              active={duration === opt}
              onClick={() => setDuration(opt)}
            >
              {opt}
            </Pill>
          ))}
        </FilterRow>
        <FilterRow label="Sort" divider={false}>
          <Pill active={sort === "recent"} onClick={() => setSort("recent")}>
            Most Recent
          </Pill>
          <Pill active={sort === "viewed"} onClick={() => setSort("viewed")}>
            Most Viewed
          </Pill>
          <Pill active={sort === "featured"} onClick={() => setSort("featured")}>
            Featured First
          </Pill>
        </FilterRow>
      </section>

      {/* Gallery grid */}
      <section className="mt-8">
        <SectionHeader
          title={`${filtered.length} weddings`}
          eyebrow={filtered.length === visibleCount ? "Full portfolio" : "Filtered"}
        />
        {filtered.length === 0 ? (
          <VenueCard className="mt-6 p-10 text-center">
            <p className="text-[15px] text-[#6a6a6a]">
              No weddings match this combination of filters.
            </p>
          </VenueCard>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-2">
            {filtered.map((w) => (
              <ShowcaseCard
                key={w.id}
                wedding={w}
                venueControls={venueControls}
                pinned={!!pinned[w.id]}
                onPin={() =>
                  setPinned((p) => ({ ...p, [w.id]: !p[w.id] }))
                }
                onHide={() => setHidden((h) => ({ ...h, [w.id]: true }))}
                onEdit={() => setEditing(w)}
              />
            ))}
          </div>
        )}
      </section>

      {editing && (
        <EditWeddingModal
          wedding={editing}
          onClose={() => setEditing(null)}
          onSave={(patch) => setEdits((e) => ({ ...e, [editing.id]: { ...e[editing.id], ...patch } }))}
        />
      )}

      {/* Hidden weddings recovery (venue controls only) */}
      {venueControls && Object.keys(hidden).some((id) => hidden[id]) && (
        <section className="mt-10">
          <SectionHeader title="Hidden from public showcase" eyebrow="Venue-only" />
          <div className="mt-4 flex flex-wrap gap-2">
            {SHOWCASE_WEDDINGS.filter((w) => hidden[w.id]).map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() =>
                  setHidden((h) => {
                    const next = { ...h };
                    delete next[w.id];
                    return next;
                  })
                }
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] text-[#2C2C2C] transition-colors hover:bg-[#F5E6D0]"
                style={{
                  backgroundColor: "#FFFFFF",
                  boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.45)",
                }}
              >
                <span aria-hidden>↺</span>
                Unhide {w.coupleNames}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* -------------------------------- Filter bits ----------------------------- */

function FilterRow({
  label,
  children,
  divider = true,
}: {
  label: string;
  children: React.ReactNode;
  divider?: boolean;
}) {
  return (
    <div
      className={`flex flex-wrap items-center gap-3 py-2.5 ${
        divider ? "border-b" : ""
      }`}
      style={divider ? { borderColor: VENUE_PALETTE.hairlineSoft } : undefined}
    >
      <span className="w-[76px] shrink-0 font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#9E8245]">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-1.5">{children}</div>
    </div>
  );
}

function Pill({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-3 py-[5px] text-[12px] transition-colors"
      style={
        active
          ? {
              backgroundColor: VENUE_PALETTE.charcoal,
              color: "#FAF8F5",
            }
          : {
              backgroundColor: "#F5EFE3",
              color: "#2C2C2C",
              boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.25)",
            }
      }
    >
      {children}
    </button>
  );
}

/* -------------------------------- Edit modal ------------------------------ */

function EditWeddingModal({
  wedding,
  onClose,
  onSave,
}: {
  wedding: ShowcaseWedding;
  onClose: () => void;
  onSave: (patch: Partial<ShowcaseWedding>) => void;
}) {
  const [coupleNames, setCoupleNames] = useState(wedding.coupleNames);
  const [dateRange, setDateRange] = useState(wedding.dateRange);
  const [guestCount, setGuestCount] = useState(String(wedding.guestCount));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-[22px] text-[#2C2C2C]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Edit wedding details
        </h2>
        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-[12px] text-stone-500 mb-1">Couple names</label>
            <input
              className="w-full rounded-lg border px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#C4A265]"
              style={{ borderColor: "rgba(44,44,44,0.15)" }}
              value={coupleNames}
              onChange={(e) => setCoupleNames(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[12px] text-stone-500 mb-1">Date range</label>
            <input
              className="w-full rounded-lg border px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#C4A265]"
              style={{ borderColor: "rgba(44,44,44,0.15)" }}
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              placeholder="Oct 15-17, 2025"
            />
          </div>
          <div>
            <label className="block text-[12px] text-stone-500 mb-1">Guest count</label>
            <input
              type="number"
              className="w-full rounded-lg border px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#C4A265]"
              style={{ borderColor: "rgba(44,44,44,0.15)" }}
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
              min="0"
            />
          </div>
        </div>
        <div className="mt-5 flex gap-3">
          <button
            onClick={() => {
              onSave({ coupleNames, dateRange, guestCount: parseInt(guestCount) || wedding.guestCount });
              onClose();
            }}
            className="rounded-full px-5 py-2 text-[13px] font-medium text-white"
            style={{ backgroundColor: "#2C2C2C" }}
          >
            Save changes
          </button>
          <button
            onClick={onClose}
            className="rounded-full px-5 py-2 text-[13px] font-medium text-[#2C2C2C]"
            style={{ boxShadow: "inset 0 0 0 1px rgba(44,44,44,0.2)" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- Wedding card ---------------------------- */

function ShowcaseCard({
  wedding,
  venueControls,
  pinned,
  onPin,
  onHide,
  onEdit,
}: {
  wedding: ShowcaseWedding;
  venueControls: boolean;
  pinned: boolean;
  onPin: () => void;
  onHide: () => void;
  onEdit: () => void;
}) {
  const preview = wedding.vendors.slice(0, 5);
  const extra = Math.max(0, wedding.vendors.length - preview.length);
  const showFeatured = pinned || wedding.featured;

  return (
    <VenueCard className="overflow-hidden">
      {/* Hero */}
      <div className="relative">
        <div
          className="h-[260px] w-full"
          style={{
            backgroundImage: `url(${wedding.heroImageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center 40%",
          }}
          aria-hidden
        />
        {showFeatured && (
          <span
            className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.24em]"
            style={{
              backgroundColor: "rgba(255,255,240,0.94)",
              color: VENUE_PALETTE.goldDeep,
              boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.55)",
            }}
          >
            <span aria-hidden>⭐</span>
            Featured
          </span>
        )}
        {/* Photo count chip */}
        <span
          className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px]"
          style={{
            backgroundColor: "rgba(44,44,44,0.78)",
            color: "#FAF8F5",
          }}
        >
          <span aria-hidden>📸</span>
          {wedding.photoCount} photos
        </span>

        {/* Venue controls overlay */}
        {venueControls && (
          <div className="absolute right-4 top-4 flex gap-1.5">
            <ControlButton onClick={onPin} active={pinned} title={pinned ? "Unpin" : "Pin to top"}>
              {pinned ? "★" : "☆"}
            </ControlButton>
            <ControlButton onClick={onHide} title="Hide from showcase">
              ⌀
            </ControlButton>
            <ControlButton onClick={onEdit} title="Edit wedding details">
              ✎
            </ControlButton>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <h3
          className="text-[24px] leading-tight text-[#2C2C2C]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 500,
            letterSpacing: "-0.005em",
          }}
        >
          {wedding.fallbackTitle ?? wedding.coupleNames}
        </h3>
        <p className="mt-1.5 text-[12.5px] text-[#5a5a5a]">
          <span className="text-[#2C2C2C]">{wedding.month}</span>
          <Dot />
          {wedding.ceremonyType}
          {wedding.ceremonyDetail ? ` ${wedding.ceremonyDetail}` : ""}
          <Dot />
          {wedding.duration}
        </p>
        <p className="mt-1 text-[12.5px] text-[#5a5a5a]">
          <span className="font-mono text-[11.5px] text-[#2C2C2C]">
            {wedding.guestCount}
          </span>{" "}
          guests
          <Dot />
          {SETUP_DISPLAY[wedding.setup]}
        </p>

        {/* Planner pill */}
        <div className="mt-3">
          <Link
            href={wedding.plannerHref ?? "#"}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#FBF1DF] px-3 py-[5px] text-[12px] text-[#5a4220] transition-colors hover:bg-[#F5E6D0]"
            style={{ boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.30)" }}
          >
            <span aria-hidden className="text-[10px] text-[#9E8245]">
              ✦
            </span>
            Planner: {wedding.plannerName}
          </Link>
        </div>

        {/* Vendor team preview */}
        <div className="mt-4">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#8a8a8a]">
            Vendor Team
          </p>
          <ul className="mt-2 space-y-1">
            {preview.map((v, i) => (
              <li key={`${v.category}-${i}`} className="flex items-center gap-2 text-[12.5px]">
                <span aria-hidden className="w-5 text-[13px]">
                  {VENDOR_CATEGORY_META[v.category].icon}
                </span>
                <Link
                  href={v.href ?? "#"}
                  className="text-[#2C2C2C] hover:text-[#9E8245] hover:underline underline-offset-2"
                >
                  {v.name}
                </Link>
                {v.badge === "select" && <VendorBadge kind="select" />}
                {v.badge === "verified" && <VendorBadge kind="verified" />}
              </li>
            ))}
            {extra > 0 && (
              <li className="flex items-center gap-2 text-[12px] text-[#9E8245]">
                <span className="w-5" aria-hidden>
                  +
                </span>
                <Link
                  href={`/venue/weddings/${wedding.id}`}
                  className="hover:text-[#C4A265] hover:underline underline-offset-2"
                >
                  {extra} more vendor{extra === 1 ? "" : "s"}
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between gap-3">
          {wedding.views !== undefined && (
            <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#8a8a8a]">
              <span className="text-[#2C2C2C]">{wedding.views}</span> views
            </span>
          )}
          <Link
            href={`/venue/weddings/${wedding.id}`}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-medium transition-colors"
            style={{
              backgroundColor: VENUE_PALETTE.charcoal,
              color: "#FAF8F5",
            }}
          >
            View Full Wedding
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </VenueCard>
  );
}

function ControlButton({
  children,
  onClick,
  title,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="grid h-8 w-8 place-items-center rounded-full text-[14px] transition-colors"
      style={
        active
          ? {
              backgroundColor: VENUE_PALETTE.gold,
              color: "#FFFFFF",
              boxShadow: "inset 0 0 0 1px rgba(158,130,69,0.75)",
            }
          : {
              backgroundColor: "rgba(255,255,240,0.95)",
              color: "#2C2C2C",
              boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.45)",
            }
      }
    >
      {children}
    </button>
  );
}

function Dot() {
  return (
    <span className="mx-1.5 text-[#b5a68e]" aria-hidden>
      ·
    </span>
  );
}
