"use client";

// ── Magazine tab ────────────────────────────────────────────────────────────
// Editorial archive of real weddings. Third Community tab alongside Blog and
// Brides — shares the same shell (TopNav, LiveEventsBanner, CommunityHeader)
// and mirrors the BridesTab SubNav pattern (rounded-full pills on an
// ivory-warm bar). The "Submit Your Wedding" CTA docks to the right of the
// sub-nav so it reads as a primary action in the Community rail.
//
// View-state is URL-driven (?view=featured|recent) so links from elsewhere
// can deep-link into a specific slice of the archive. The submit flow still
// lives at /studio/magazine/submit; we just open it as a CTA here.

import { useMemo, useState, type ReactNode } from "react";
import NextLink from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  BookOpen,
  Bookmark,
  Clock,
  ChevronDown,
  Heart,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MagazineFlipbook, type FlipbookWedding } from "./MagazineFlipbook";

// ── Shared terracotta accent (no Tailwind token exists for it) ──────────────

const TERRACOTTA = "#C45D3E";

// ── Types ───────────────────────────────────────────────────────────────────

type Season = "winter" | "spring" | "summer" | "fall";

type Category =
  | "south-asian"
  | "multicultural"
  | "destination"
  | "intimate"
  | "grand"
  | "fusion";

type Wedding = {
  slug: string;
  coupleNames: string;
  brideFirst: string;
  fromCity: string;
  toCity: string;
  date: string;
  dateKey: string;
  season: Season;
  year: number;
  venueType: string;
  tradition: string;
  categories: Category[];
  guestCount: string;
  quote: string;
  gradient: string;
  tone: "blush" | "sage" | "gold" | "terracotta" | "cream" | "ink";
  editorsPick?: boolean;
  loves: number;
};

// ── Mock data ───────────────────────────────────────────────────────────────

const WEDDINGS: Wedding[] = [
  {
    slug: "sneha-arjun",
    coupleNames: "sneha & arjun",
    brideFirst: "sneha",
    fromCity: "Hyderabad",
    toCity: "Udaipur",
    date: "Mar 14, 2026",
    dateKey: "2026-03-14",
    season: "spring",
    year: 2026,
    venueType: "Palace",
    tradition: "Telugu · Malayali",
    categories: ["south-asian", "destination", "fusion", "grand"],
    guestCount: "500+ guests",
    quote:
      "four days, two pandits, three venues, a telugu-malayali love story.",
    gradient: "from-[#E9C8B5] via-[#D8A080] to-[#B56A4A]",
    tone: "terracotta",
    editorsPick: true,
    loves: 1_248,
  },
  {
    slug: "priya-dev",
    coupleNames: "priya & dev",
    brideFirst: "priya",
    fromCity: "Mumbai",
    toCity: "Jaipur",
    date: "Feb 02, 2026",
    dateKey: "2026-02-02",
    season: "winter",
    year: 2026,
    venueType: "Fort",
    tradition: "North Indian · Punjabi",
    categories: ["south-asian", "grand"],
    guestCount: "800+ guests",
    quote: "a pink-city baraat that started with a letter, not a swipe.",
    gradient: "from-[#F3D9C7] via-[#E8B496] to-[#C48A6A]",
    tone: "blush",
    loves: 842,
  },
  {
    slug: "meera-julian",
    coupleNames: "meera & julian",
    brideFirst: "meera",
    fromCity: "London",
    toCity: "Goa",
    date: "Jan 19, 2026",
    dateKey: "2026-01-19",
    season: "winter",
    year: 2026,
    venueType: "Beach",
    tradition: "Hindu · Catholic",
    categories: ["multicultural", "destination", "fusion"],
    guestCount: "180 guests",
    quote: "a barefoot ceremony, two priests, and a shared first dance.",
    gradient: "from-[#E4DCC8] via-[#C7BFA7] to-[#8AA38C]",
    tone: "sage",
    loves: 967,
  },
  {
    slug: "aisha-kabir",
    coupleNames: "aisha & kabir",
    brideFirst: "aisha",
    fromCity: "Karachi",
    toCity: "Lake Como",
    date: "Jun 08, 2026",
    dateKey: "2026-06-08",
    season: "summer",
    year: 2026,
    venueType: "Estate",
    tradition: "Pakistani · Muslim",
    categories: ["south-asian", "destination", "grand"],
    guestCount: "240 guests",
    quote: "mehendi at dusk, the lake turning gold under a borrowed sky.",
    gradient: "from-[#EEDCB0] via-[#D6B77A] to-[#9C7A3E]",
    tone: "gold",
    editorsPick: false,
    loves: 1_034,
  },
  {
    slug: "anya-theo",
    coupleNames: "anya & theo",
    brideFirst: "anya",
    fromCity: "Bengaluru",
    toCity: "Ooty",
    date: "May 11, 2026",
    dateKey: "2026-05-11",
    season: "spring",
    year: 2026,
    venueType: "Farm",
    tradition: "Tamil Iyengar · Secular",
    categories: ["fusion", "intimate", "multicultural"],
    guestCount: "32 guests",
    quote: "an elopement with a string quartet and their two dogs as witnesses.",
    gradient: "from-[#E2E8D4] via-[#B9C7A0] to-[#7B976A]",
    tone: "sage",
    loves: 612,
  },
  {
    slug: "rhea-ishaan",
    coupleNames: "rhea & ishaan",
    brideFirst: "rhea",
    fromCity: "Delhi",
    toCity: "Delhi",
    date: "Apr 26, 2026",
    dateKey: "2026-04-26",
    season: "spring",
    year: 2026,
    venueType: "Hotel",
    tradition: "Marwari",
    categories: ["south-asian", "grand"],
    guestCount: "1,200 guests",
    quote: "seven functions, one handwritten family tree, a grandmother's sari.",
    gradient: "from-[#F1D2C0] via-[#D99E7E] to-[#A65F47]",
    tone: "terracotta",
    loves: 758,
  },
  {
    slug: "saanvi-ethan",
    coupleNames: "saanvi & ethan",
    brideFirst: "saanvi",
    fromCity: "Austin",
    toCity: "Jaisalmer",
    date: "Nov 02, 2025",
    dateKey: "2025-11-02",
    season: "fall",
    year: 2025,
    venueType: "Desert Camp",
    tradition: "Gujarati · Jewish",
    categories: ["multicultural", "destination", "fusion"],
    guestCount: "160 guests",
    quote:
      "a chuppah under the dunes, and a garba that didn't stop until sunrise.",
    gradient: "from-[#EACBA3] via-[#C99A68] to-[#7E5A34]",
    tone: "gold",
    editorsPick: false,
    loves: 1_491,
  },
  {
    slug: "nisha-rohan",
    coupleNames: "nisha & rohan",
    brideFirst: "nisha",
    fromCity: "Kolkata",
    toCity: "Santiniketan",
    date: "Oct 18, 2025",
    dateKey: "2025-10-18",
    season: "fall",
    year: 2025,
    venueType: "Ancestral Home",
    tradition: "Bengali",
    categories: ["south-asian", "intimate"],
    guestCount: "95 guests",
    quote:
      "the shankho blew at dusk, and every aunty cried in the right order.",
    gradient: "from-[#E9D5B8] via-[#C7A478] to-[#8B6A40]",
    tone: "cream",
    loves: 523,
  },
  {
    slug: "zara-omar",
    coupleNames: "zara & omar",
    brideFirst: "zara",
    fromCity: "Lahore",
    toCity: "Istanbul",
    date: "Sep 06, 2025",
    dateKey: "2025-09-06",
    season: "fall",
    year: 2025,
    venueType: "Palace",
    tradition: "Pakistani · Turkish",
    categories: ["multicultural", "destination", "fusion", "grand"],
    guestCount: "420 guests",
    quote: "a qawwali by the bosphorus, and an ottoman nikkah in three tongues.",
    gradient: "from-[#E4C7BB] via-[#B98C7B] to-[#6B4635]",
    tone: "ink",
    loves: 1_126,
  },
  {
    slug: "tara-vikram",
    coupleNames: "tara & vikram",
    brideFirst: "tara",
    fromCity: "Chennai",
    toCity: "Mahabalipuram",
    date: "Aug 22, 2025",
    dateKey: "2025-08-22",
    season: "summer",
    year: 2025,
    venueType: "Temple",
    tradition: "Tamil Brahmin",
    categories: ["south-asian", "intimate"],
    guestCount: "120 guests",
    quote: "a dawn kalyanam by the sea, filter coffee for every guest.",
    gradient: "from-[#F0D9B8] via-[#D4B078] to-[#9B7B3F]",
    tone: "cream",
    loves: 689,
  },
  {
    slug: "leela-samuel",
    coupleNames: "leela & samuel",
    brideFirst: "leela",
    fromCity: "New York",
    toCity: "Kerala",
    date: "Jul 12, 2025",
    dateKey: "2025-07-12",
    season: "summer",
    year: 2025,
    venueType: "Backwaters",
    tradition: "Syrian Christian · Jewish",
    categories: ["multicultural", "destination", "fusion"],
    guestCount: "110 guests",
    quote:
      "a houseboat procession, two grandmothers trading recipes for a week.",
    gradient: "from-[#D9E3D0] via-[#A2B58A] to-[#5E7F5A]",
    tone: "sage",
    loves: 874,
  },
  {
    slug: "ananya-raj",
    coupleNames: "ananya & raj",
    brideFirst: "ananya",
    fromCity: "San Francisco",
    toCity: "Napa Valley",
    date: "Dec 14, 2025",
    dateKey: "2025-12-14",
    season: "winter",
    year: 2025,
    venueType: "Vineyard",
    tradition: "Gujarati · Secular",
    categories: ["south-asian", "intimate", "fusion"],
    guestCount: "60 guests",
    quote:
      "a winter phera between the vines, and a grandfather's scotch toasted twice.",
    gradient: "from-[#EED3C0] via-[#C99680] to-[#7A4E3F]",
    tone: "terracotta",
    loves: 702,
  },
];

// ── Filter taxonomies ───────────────────────────────────────────────────────

const CATEGORY_CHIPS: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "south-asian", label: "South Asian" },
  { id: "multicultural", label: "Multicultural" },
  { id: "destination", label: "Destination" },
  { id: "intimate", label: "Intimate / Elopement" },
  { id: "grand", label: "Grand Celebration" },
  { id: "fusion", label: "Cultural Fusion" },
];

const SEASON_LABEL: Record<Season, string> = {
  winter: "winter",
  spring: "spring",
  summer: "summer",
  fall: "fall",
};

const SEASON_RANGE: Record<Season, string> = {
  winter: "DEC–FEB",
  spring: "MAR–MAY",
  summer: "JUN–AUG",
  fall: "SEP–NOV",
};

const SORT_OPTIONS = [
  { id: "recent", label: "Most Recent" },
  { id: "loved", label: "Most Loved" },
  { id: "editor", label: "Editor's Picks" },
] as const;
type SortId = (typeof SORT_OPTIONS)[number]["id"];

const YEARS = ["All years", "2026", "2025", "2024"];
const REGIONS = [
  "All regions",
  "India · North",
  "India · South",
  "India · East",
  "International",
  "North America",
  "Europe",
];
const VENUES = [
  "All venues",
  "Palace / Fort",
  "Beach",
  "Estate / Vineyard",
  "Farm / Ancestral Home",
  "Temple / Ceremonial",
];
const TRADITIONS = [
  "All traditions",
  "Hindu · North Indian",
  "Hindu · South Indian",
  "Muslim / Nikkah",
  "Christian",
  "Jewish",
  "Sikh",
  "Secular / Civil",
];

// ── Sub-view state ──────────────────────────────────────────────────────────
// Featured → hero + grid with editor-pick priority.
// Recent   → hero hidden, grid sorted newest-first.

type SubView = "featured" | "recent";

const VALID_VIEWS: Record<string, SubView> = {
  featured: "featured",
  recent: "recent",
};

// ── MagazineTab ─────────────────────────────────────────────────────────────

export function MagazineTab() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewParam = searchParams?.get("view") ?? "";
  const subView: SubView = VALID_VIEWS[viewParam] ?? "featured";

  const setSubView = (id: SubView) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("tab", "magazine");
    if (id === "featured") params.delete("view");
    else params.set("view", id);
    router.replace(`/community?${params.toString()}`, { scroll: false });
  };

  const [category, setCategory] = useState<Category | "all">("all");
  const [sort, setSort] = useState<SortId>(
    subView === "recent" ? "recent" : "editor",
  );
  const [search, setSearch] = useState("");
  const [year, setYear] = useState(YEARS[0]);
  const [region, setRegion] = useState(REGIONS[0]);
  const [venue, setVenue] = useState(VENUES[0]);
  const [tradition, setTradition] = useState(TRADITIONS[0]);
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [flipbookSlug, setFlipbookSlug] = useState<string | null>(null);
  const [flipbookOpen, setFlipbookOpen] = useState(false);

  const flipbookWeddings: FlipbookWedding[] = useMemo(
    () =>
      [...WEDDINGS]
        .sort((a, b) => {
          if (a.editorsPick && !b.editorsPick) return -1;
          if (!a.editorsPick && b.editorsPick) return 1;
          return b.loves - a.loves;
        })
        .slice(0, 8)
        .map((w) => ({
          slug: w.slug,
          coupleNames: w.coupleNames,
          brideFirst: w.brideFirst,
          fromCity: w.fromCity,
          toCity: w.toCity,
          date: w.date,
          year: w.year,
          season: w.season,
          venueType: w.venueType,
          tradition: w.tradition,
          guestCount: w.guestCount,
          quote: w.quote,
          gradient: w.gradient,
          categories: w.categories,
          loves: w.loves,
        })),
    [],
  );

  const openFlipbook = (slug?: string) => {
    setFlipbookSlug(slug ?? null);
    setFlipbookOpen(true);
  };

  const toggleSave = (slug: string) =>
    setSaved((s) => ({ ...s, [slug]: !s[slug] }));

  const cover = useMemo(
    () => WEDDINGS.find((w) => w.editorsPick) ?? WEDDINGS[0],
    [],
  );

  const showHero = subView === "featured";

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = showHero
      ? WEDDINGS.filter((w) => w.slug !== cover.slug)
      : [...WEDDINGS];

    if (category !== "all") {
      list = list.filter((w) => w.categories.includes(category));
    }
    if (year !== YEARS[0]) {
      list = list.filter((w) => String(w.year) === year);
    }
    if (q) {
      list = list.filter((w) => {
        const hay = `${w.coupleNames} ${w.fromCity} ${w.toCity} ${w.venueType} ${w.tradition} ${w.quote}`.toLowerCase();
        return hay.includes(q);
      });
    }

    const effectiveSort: SortId = subView === "recent" ? "recent" : sort;
    if (effectiveSort === "recent") {
      list = [...list].sort((a, b) => b.dateKey.localeCompare(a.dateKey));
    } else if (effectiveSort === "loved") {
      list = [...list].sort((a, b) => b.loves - a.loves);
    } else if (effectiveSort === "editor") {
      list = [...list].sort((a, b) => b.loves - a.loves);
    }

    return list;
  }, [category, sort, search, year, cover.slug, showHero, subView]);

  const grouped = useMemo(() => {
    const groups = new Map<
      string,
      { season: Season; year: number; items: Wedding[] }
    >();
    for (const w of filtered) {
      const key = `${w.season}-${w.year}`;
      const bucket = groups.get(key);
      if (bucket) bucket.items.push(w);
      else groups.set(key, { season: w.season, year: w.year, items: [w] });
    }
    return Array.from(groups.values());
  }, [filtered]);

  const popular = useMemo(
    () => [...WEDDINGS].sort((a, b) => b.loves - a.loves).slice(0, 4),
    [],
  );

  return (
    <div className="bg-white">
      <SubNav
        active={subView}
        onChange={setSubView}
        onReadMagazine={() => openFlipbook()}
      />

      <div className="px-10 py-10">
        <div className="mx-auto max-w-6xl">
          {/* Editorial kicker — terracotta small-caps, sits inside the tab */}
          <div>
            <p
              className="text-[10.5px] font-medium uppercase tracking-[0.22em]"
              style={{
                fontFamily: "var(--font-sans)",
                color: TERRACOTTA,
              }}
            >
              The Magazine
            </p>
            <p className="mt-2 max-w-[620px] font-serif text-[17px] italic leading-[1.5] text-ink-muted">
              the love stories behind the planning — told through the lens, the
              details, and the couple&apos;s own words.
            </p>
          </div>

          {/* Filter bar */}
          <div className="mt-8">
            <FilterBar
              category={category}
              setCategory={setCategory}
              sort={sort}
              setSort={setSort}
              search={search}
              setSearch={setSearch}
              year={year}
              setYear={setYear}
              region={region}
              setRegion={setRegion}
              venue={venue}
              setVenue={setVenue}
              tradition={tradition}
              setTradition={setTradition}
              sortDisabled={subView === "recent"}
            />
          </div>

          {/* Hero feature (Featured view only) */}
          {showHero && (
            <section className="mt-10">
              <HeroFeature
                wedding={cover}
                saved={!!saved[cover.slug]}
                onSave={() => toggleSave(cover.slug)}
              />
            </section>
          )}

          {/* Grid + sidebar */}
          <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_280px]">
            <div>
              {grouped.length === 0 ? (
                <EmptyState
                  onReset={() => {
                    setCategory("all");
                    setSearch("");
                    setYear(YEARS[0]);
                  }}
                />
              ) : (
                grouped.map((g, i) => (
                  <SeasonBlock
                    key={`${g.season}-${g.year}`}
                    season={g.season}
                    year={g.year}
                    items={g.items}
                    saved={saved}
                    onSave={toggleSave}
                    first={i === 0}
                  />
                ))
              )}
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-8 space-y-10">
                <PopularThisMonth items={popular} />
                <BrowseByTradition />
                <MagazineStats />
              </div>
            </aside>
          </div>
        </div>
      </div>

      {flipbookOpen && (
        <MagazineFlipbook
          weddings={flipbookWeddings}
          issueTitle="Ananya Magazine"
          issueSub="Fall 2025 · Love Stories, In Print"
          initialSlug={flipbookSlug ?? undefined}
          onClose={() => setFlipbookOpen(false)}
        />
      )}
    </div>
  );
}

// ── Sub-nav ─────────────────────────────────────────────────────────────────
// Mirrors the BridesTab SubNav pattern: ivory-warm bar, rounded-full pills,
// gold-tinted bottom border. The Submit CTA docks to the right so it reads
// like a primary action alongside the Featured / Recent pills — the same
// slot the live-chats and meetups bar uses.

function SubNav({
  active,
  onChange,
  onReadMagazine,
}: {
  active: SubView;
  onChange: (v: SubView) => void;
  onReadMagazine: () => void;
}) {
  const items: { id: SubView; label: string; icon: typeof Sparkles }[] = [
    { id: "featured", label: "Featured", icon: Sparkles },
    { id: "recent", label: "Recent", icon: Clock },
  ];

  return (
    <div className="border-b border-gold/10 bg-ivory-warm/20 px-10 py-3">
      <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cn(
                "relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors",
                isActive
                  ? "bg-ink text-ivory"
                  : "text-ink-muted hover:bg-white hover:text-ink",
              )}
            >
              <Icon size={13} strokeWidth={1.8} />
              {item.label}
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onReadMagazine}
            className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border bg-transparent px-3.5 py-1.5 text-[12px] font-medium text-ink transition-colors hover:text-white"
            style={{ borderColor: TERRACOTTA }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = TERRACOTTA)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <BookOpen size={13} strokeWidth={1.8} />
            Read the Magazine
            <ArrowUpRight
              size={13}
              strokeWidth={1.8}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </button>

          <NextLink
            href="/studio/magazine/submit"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: TERRACOTTA }}
          >
            Submit Your Wedding
            <ArrowUpRight size={13} strokeWidth={1.8} />
          </NextLink>
        </div>
      </div>
    </div>
  );
}

// ── Filter bar ──────────────────────────────────────────────────────────────

type FilterProps = {
  category: Category | "all";
  setCategory: (c: Category | "all") => void;
  sort: SortId;
  setSort: (s: SortId) => void;
  search: string;
  setSearch: (s: string) => void;
  year: string;
  setYear: (s: string) => void;
  region: string;
  setRegion: (s: string) => void;
  venue: string;
  setVenue: (s: string) => void;
  tradition: string;
  setTradition: (s: string) => void;
  sortDisabled: boolean;
};

function FilterBar(p: FilterProps) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORY_CHIPS.map((c) => {
          const active = c.id === p.category;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => p.setCategory(c.id)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-[12px] font-medium transition-colors",
                active
                  ? "border-ink bg-ink text-ivory"
                  : "border-border bg-white text-ink-muted hover:text-ink",
              )}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Dropdown label="Year" value={p.year} options={YEARS} onChange={p.setYear} />
          <Dropdown label="Region" value={p.region} options={REGIONS} onChange={p.setRegion} />
          <Dropdown label="Venue" value={p.venue} options={VENUES} onChange={p.setVenue} />
          <Dropdown
            label="Tradition"
            value={p.tradition}
            options={TRADITIONS}
            onChange={p.setTradition}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              size={14}
              strokeWidth={1.8}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
            />
            <input
              value={p.search}
              onChange={(e) => p.setSearch(e.target.value)}
              placeholder="Search by couple, city, venue, or vibe..."
              className="h-9 w-[280px] rounded-full border border-border bg-white pl-8 pr-3 text-[13px] text-ink placeholder:text-ink-faint focus:outline-none"
            />
          </div>

          <Dropdown
            label="Sort"
            value={SORT_OPTIONS.find((s) => s.id === p.sort)?.label ?? ""}
            options={SORT_OPTIONS.map((s) => s.label)}
            disabled={p.sortDisabled}
            onChange={(label) => {
              const next = SORT_OPTIONS.find((s) => s.label === label);
              if (next) p.setSort(next.id);
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Dropdown ────────────────────────────────────────────────────────────────

function Dropdown({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="group relative inline-flex items-center">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-9 appearance-none rounded-full border border-border bg-white py-0 pl-4 pr-8 text-[12px] font-medium text-ink-muted transition-colors hover:text-ink focus:outline-none",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown
        size={12}
        strokeWidth={1.8}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint"
      />
    </label>
  );
}

// ── Hero feature ────────────────────────────────────────────────────────────

function HeroFeature({
  wedding,
  saved,
  onSave,
}: {
  wedding: Wedding;
  saved: boolean;
  onSave: () => void;
}) {
  return (
    <NextLink
      href={`/studio/magazine/${wedding.slug}`}
      className="group relative block overflow-hidden rounded-2xl"
    >
      <div
        className={cn(
          "relative aspect-[21/9] w-full bg-gradient-to-br",
          wedding.gradient,
        )}
      >
        <GradientGrain />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute left-6 top-6 flex items-center gap-2 md:left-10 md:top-8">
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em]"
            style={{ color: TERRACOTTA }}
          >
            <Sparkles size={11} strokeWidth={2} />
            Cover Story
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onSave();
          }}
          aria-label={saved ? "Remove from saved" : "Save feature"}
          className={cn(
            "absolute right-6 top-6 inline-flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-sm transition-colors md:right-10 md:top-8",
            saved
              ? "border-white/40 bg-white"
              : "border-white/40 bg-black/20 text-white hover:bg-black/30",
          )}
          style={saved ? { color: TERRACOTTA } : undefined}
        >
          <Heart
            size={16}
            strokeWidth={1.8}
            className={cn(saved && "fill-current")}
          />
        </button>

        <div className="absolute inset-x-0 bottom-0 px-6 pb-8 md:px-10 md:pb-10">
          <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-white/80">
            {wedding.tradition} · {wedding.venueType}
          </p>
          <h2
            className="mt-2 max-w-[780px] text-[36px] font-semibold leading-[1.02] tracking-[-0.01em] text-white md:text-[54px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {wedding.coupleNames}.
          </h2>
          <p className="mt-3 max-w-[620px] font-serif text-[17px] italic leading-[1.4] text-white/90">
            &ldquo;{wedding.quote}&rdquo;
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-[11.5px] font-medium uppercase tracking-[0.2em] text-white/80">
              {wedding.fromCity} → {wedding.toCity} · {wedding.date} ·{" "}
              {wedding.guestCount}
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[12.5px] font-medium text-ink transition-colors">
              Read Feature
              <ArrowUpRight size={14} strokeWidth={1.8} />
            </span>
          </div>
        </div>
      </div>
    </NextLink>
  );
}

// ── Season block ────────────────────────────────────────────────────────────

function SeasonBlock({
  season,
  year,
  items,
  saved,
  onSave,
  first,
}: {
  season: Season;
  year: number;
  items: Wedding[];
  saved: Record<string, boolean>;
  onSave: (slug: string) => void;
  first: boolean;
}) {
  const label = `${SEASON_LABEL[season]} ${year}`;
  const count = items.length;
  const countLabel = `${count} BRIDE${count === 1 ? "" : "S"}`;

  return (
    <section className={cn(first ? "" : "mt-16")}>
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border/70 pb-4">
        <h3
          className="text-[30px] font-semibold leading-[1] tracking-[-0.005em] text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {label}
        </h3>
        <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-ink-faint">
          {SEASON_RANGE[season]} {year} · {countLabel}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-x-7 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((w) => (
          <WeddingCard
            key={w.slug}
            wedding={w}
            saved={!!saved[w.slug]}
            onSave={() => onSave(w.slug)}
          />
        ))}
      </div>
    </section>
  );
}

// ── Wedding card ────────────────────────────────────────────────────────────

function WeddingCard({
  wedding,
  saved,
  onSave,
}: {
  wedding: Wedding;
  saved: boolean;
  onSave: () => void;
}) {
  return (
    <NextLink
      href={`/studio/magazine/${wedding.slug}`}
      className="group block"
    >
      <div
        className={cn(
          "relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-gradient-to-br",
          wedding.gradient,
        )}
      >
        <GradientGrain />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onSave();
          }}
          aria-label={saved ? "Remove from saved" : "Save wedding"}
          className={cn(
            "absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur-sm transition-colors",
            saved
              ? "border-white/50 bg-white"
              : "border-white/40 bg-black/20 text-white hover:bg-black/35",
          )}
          style={saved ? { color: TERRACOTTA } : undefined}
        >
          <Heart
            size={14}
            strokeWidth={1.8}
            className={cn(saved && "fill-current")}
          />
        </button>

        {wedding.editorsPick ? (
          <span
            className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[9.5px] font-medium uppercase tracking-[0.22em]"
            style={{ color: TERRACOTTA }}
          >
            <Sparkles size={10} strokeWidth={2} />
            Editor&apos;s Pick
          </span>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 px-5 pb-5">
          <h4
            className="text-[26px] font-semibold leading-[1.02] tracking-[-0.005em] text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {wedding.coupleNames}
          </h4>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <p
          className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {wedding.brideFirst} · {wedding.fromCity} → {wedding.toCity} ·{" "}
          {wedding.date}
        </p>
        <p className="line-clamp-2 font-serif text-[14.5px] italic leading-[1.45] text-ink">
          &ldquo;{wedding.quote}&rdquo;
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {wedding.categories.slice(0, 3).map((c) => (
            <TagChip key={c}>{categoryLabel(c)}</TagChip>
          ))}
          <TagChip>{wedding.guestCount}</TagChip>
        </div>
      </div>
    </NextLink>
  );
}

function TagChip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-[#F5F0EB] px-2.5 py-0.5 text-[10.5px] font-medium tracking-[0.04em] text-ink-soft">
      {children}
    </span>
  );
}

function categoryLabel(c: Category): string {
  switch (c) {
    case "south-asian":
      return "South Asian";
    case "multicultural":
      return "Multicultural";
    case "destination":
      return "Destination";
    case "intimate":
      return "Intimate";
    case "grand":
      return "Grand";
    case "fusion":
      return "Fusion";
  }
}

// ── Sidebar: popular / tradition / stats ────────────────────────────────────

function PopularThisMonth({ items }: { items: Wedding[] }) {
  return (
    <div>
      <SidebarHeading icon={<TrendingUp size={11} strokeWidth={2} />}>
        Popular this month
      </SidebarHeading>
      <ul className="mt-5 space-y-4">
        {items.map((w, i) => (
          <li key={w.slug}>
            <NextLink
              href={`/studio/magazine/${w.slug}`}
              className="group flex items-start gap-3"
            >
              <span
                className={cn(
                  "relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-gradient-to-br",
                  w.gradient,
                )}
              >
                <GradientGrain />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-faint">
                  #{i + 1} · {w.loves.toLocaleString()} loves
                </p>
                <p
                  className="mt-1 truncate text-[15px] font-medium leading-[1.2] text-ink transition-colors"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {w.coupleNames}
                </p>
                <p className="truncate text-[11.5px] text-ink-muted">
                  {w.toCity} · {w.tradition}
                </p>
              </div>
            </NextLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BrowseByTradition() {
  const traditions = [
    "North Indian",
    "South Indian",
    "Bengali",
    "Marathi",
    "Gujarati",
    "Pakistani / Muslim",
    "Sikh",
    "Syrian Christian",
    "Jewish Fusion",
    "Secular / Civil",
  ];
  return (
    <div>
      <SidebarHeading icon={<Bookmark size={11} strokeWidth={2} />}>
        Browse by tradition
      </SidebarHeading>
      <ul className="mt-4 space-y-2">
        {traditions.map((t) => (
          <li key={t}>
            <button
              type="button"
              className="flex w-full items-center justify-between py-1.5 text-left text-[13px] text-ink-muted transition-colors hover:text-ink"
            >
              <span>{t}</span>
              <ArrowUpRight
                size={12}
                strokeWidth={1.8}
                className="opacity-0 transition-opacity group-hover:opacity-100"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MagazineStats() {
  const stats = [
    { label: "Features", value: "184" },
    { label: "This month", value: "12" },
    { label: "Submissions open", value: "Always" },
  ];
  return (
    <div className="rounded-xl border border-border bg-ivory/60 p-5">
      <SidebarHeading>Magazine stats</SidebarHeading>
      <dl className="mt-4 space-y-3">
        {stats.map((s) => (
          <div key={s.label} className="flex items-baseline justify-between">
            <dt className="text-[12px] text-ink-muted">{s.label}</dt>
            <dd
              className="text-[17px] font-semibold tracking-[-0.01em] text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {s.value}
            </dd>
          </div>
        ))}
      </dl>
      <NextLink
        href="/studio/magazine/submit"
        className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-medium text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: TERRACOTTA }}
      >
        Submit a wedding
        <ArrowUpRight size={12} strokeWidth={2} />
      </NextLink>
    </div>
  );
}

function SidebarHeading({
  icon,
  children,
}: {
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <p
      className="flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-[0.22em]"
      style={{ color: TERRACOTTA }}
    >
      {icon}
      {children}
    </p>
  );
}

// ── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full border"
        style={{
          borderColor: `${TERRACOTTA}55`,
          backgroundColor: `${TERRACOTTA}14`,
          color: TERRACOTTA,
        }}
      >
        <Search size={20} strokeWidth={1.5} />
      </div>
      <p className="mt-5 font-serif text-[22px] italic text-ink">
        no weddings match that combination.
      </p>
      <p className="mt-2 max-w-[380px] text-[14px] leading-[1.65] text-ink-muted">
        try widening your filters — or reset to see every feature in the archive.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-ink px-4 py-2 text-[12.5px] font-medium text-ink transition-colors hover:bg-ink hover:text-ivory"
      >
        Reset filters
      </button>
    </div>
  );
}

// ── Grain overlay ──────────────────────────────────────────────────────────

function GradientGrain() {
  return (
    <span
      aria-hidden
      className="absolute inset-0 opacity-[0.18] mix-blend-overlay"
      style={{
        backgroundImage:
          "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), radial-gradient(rgba(0,0,0,0.5) 1px, transparent 1px)",
        backgroundSize: "3px 3px, 5px 5px",
        backgroundPosition: "0 0, 1px 1px",
      }}
    />
  );
}
