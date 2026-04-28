"use client";

/**
 * AppShell — the top-level application frame for Ananya.
 *
 * Wraps every authenticated view. Handles wedding context switching for
 * users who work across many weddings (planners, vendors) while staying
 * elegant and quiet for couples working on their single wedding.
 *
 * ──────────────────────────────────────────────────────────────────────
 *  Supabase-ready schema (for reference — tables live elsewhere)
 * ──────────────────────────────────────────────────────────────────────
 *
 *  users
 *    id              uuid pk
 *    email           text unique
 *    full_name       text
 *    avatar_url      text
 *    primary_role    text  -- 'couple' | 'planner' | 'vendor'
 *    created_at      timestamptz
 *
 *  weddings
 *    id              uuid pk
 *    couple_names    text   -- "Priya & Arjun"
 *    event_date      date
 *    city            text
 *    country         text
 *    budget_tier     text   -- 'boutique' | 'luxury' | 'ultra-luxury'
 *    cover_image_url text
 *    status          text   -- 'planning' | 'live' | 'archived'
 *
 *  roles                     -- canonical role catalogue (seeded)
 *    id              uuid pk
 *    key             text unique  -- 'lead_planner' | 'catering_partner' | ...
 *    label           text
 *    scope           text         -- 'wedding' | 'platform'
 *
 *  wedding_members           -- junction: who has access to which wedding
 *    user_id         uuid fk -> users.id
 *    wedding_id      uuid fk -> weddings.id
 *    role_id         uuid fk -> roles.id
 *    is_pinned       boolean default false
 *    joined_at       timestamptz
 *    primary key (user_id, wedding_id, role_id)
 *
 *  permissions               -- role → capability mapping
 *    role_id         uuid fk -> roles.id
 *    capability      text    -- 'edit_budget' | 'view_guests' | ...
 *    primary key (role_id, capability)
 * ──────────────────────────────────────────────────────────────────────
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Command,
  HelpCircle,
  LogOut,
  Menu,
  Pin,
  Plus,
  Search,
  Settings,
  Sparkles,
  UserCog,
  X,
} from "lucide-react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────

type PersonaRole = "couple" | "planner" | "vendor";

type WeddingStatusBucket =
  | "today"
  | "this-week"
  | "this-month"
  | "upcoming"
  | "recent"
  | "archive";

interface Wedding {
  id: string;
  coupleNames: string;
  /** ISO yyyy-mm-dd */
  date: string;
  city: string;
  country: string;
  /** Role the current user plays in THIS wedding */
  role: string;
  pinned?: boolean;
  archived?: boolean;
  budgetTier: "boutique" | "luxury" | "ultra-luxury";
  leadContact: string;
  /** Dominant decorative accent — one of two tasteful tones */
  accent: "saffron" | "rose";
  /** Role-specific progress label + value */
  metric: { label: string; value: string };
}

interface Persona {
  role: PersonaRole;
  name: string;
  email: string;
  initials: string;
  /** Short org/context line shown under name in menu */
  subtitle: string;
  weddings: Wedding[];
}

// ─────────────────────────────────────────────────────────────────────
// Sample data (replace with Supabase queries in production)
// ─────────────────────────────────────────────────────────────────────

const TODAY = new Date("2026-04-17");

const COUPLE: Persona = {
  role: "couple",
  name: "Priya Menon",
  email: "priya@example.com",
  initials: "PM",
  subtitle: "Bride · Udaipur wedding",
  weddings: [
    {
      id: "w-priya-arjun",
      coupleNames: "Priya & Arjun",
      date: "2026-05-12",
      city: "Udaipur",
      country: "India",
      role: "Couple",
      budgetTier: "luxury",
      leadContact: "Radz Events — Radhika D.",
      accent: "saffron",
      metric: { label: "Planning complete", value: "68%" },
    },
  ],
};

const PLANNER: Persona = {
  role: "planner",
  name: "Radhika Desai",
  email: "radhika@radzevents.com",
  initials: "RD",
  subtitle: "Radz Events · Lead Planner",
  weddings: [
    {
      id: "p-meera-rohan",
      coupleNames: "Meera & Rohan",
      date: "2026-04-17",
      city: "Mumbai",
      country: "India",
      role: "Lead Planner",
      pinned: true,
      budgetTier: "ultra-luxury",
      leadContact: "Meera Kapoor",
      accent: "saffron",
      metric: { label: "Day-of ready", value: "98%" },
    },
    {
      id: "p-anika-vikram",
      coupleNames: "Anika & Vikram",
      date: "2026-04-21",
      city: "Jaipur",
      country: "India",
      role: "Lead Planner",
      budgetTier: "luxury",
      leadContact: "Anika Shah",
      accent: "rose",
      metric: { label: "Tasks complete", value: "92%" },
    },
    {
      id: "p-tanvi-dev",
      coupleNames: "Tanvi & Dev",
      date: "2026-04-24",
      city: "Udaipur",
      country: "India",
      role: "Lead Planner",
      budgetTier: "luxury",
      leadContact: "Tanvi Iyer",
      accent: "saffron",
      metric: { label: "Tasks complete", value: "87%" },
    },
    {
      id: "p-shreya-karthik",
      coupleNames: "Shreya & Karthik",
      date: "2026-05-02",
      city: "Goa",
      country: "India",
      role: "Lead Planner",
      pinned: true,
      budgetTier: "ultra-luxury",
      leadContact: "Shreya Rao",
      accent: "rose",
      metric: { label: "Tasks complete", value: "74%" },
    },
    {
      id: "p-priya-arjun",
      coupleNames: "Priya & Arjun",
      date: "2026-05-12",
      city: "Udaipur",
      country: "India",
      role: "Lead Planner",
      pinned: true,
      budgetTier: "luxury",
      leadContact: "Priya Menon",
      accent: "saffron",
      metric: { label: "Tasks complete", value: "68%" },
    },
    {
      id: "p-divya-arjun",
      coupleNames: "Divya & Arjun",
      date: "2026-05-09",
      city: "Jodhpur",
      country: "India",
      role: "Associate Planner",
      budgetTier: "luxury",
      leadContact: "Divya Narayan",
      accent: "saffron",
      metric: { label: "Tasks complete", value: "71%" },
    },
    {
      id: "p-kavya-sid",
      coupleNames: "Kavya & Siddharth",
      date: "2026-05-18",
      city: "New Delhi",
      country: "India",
      role: "Lead Planner",
      budgetTier: "luxury",
      leadContact: "Kavya Bhatia",
      accent: "rose",
      metric: { label: "Tasks complete", value: "56%" },
    },
    {
      id: "p-lakshmi-aryan",
      coupleNames: "Lakshmi & Aryan",
      date: "2026-06-12",
      city: "Hyderabad",
      country: "India",
      role: "Lead Planner",
      budgetTier: "luxury",
      leadContact: "Lakshmi Reddy",
      accent: "saffron",
      metric: { label: "Tasks complete", value: "42%" },
    },
    {
      id: "p-nandini-krishna",
      coupleNames: "Nandini & Krishna",
      date: "2026-07-04",
      city: "Mumbai",
      country: "India",
      role: "Lead Planner",
      budgetTier: "boutique",
      leadContact: "Nandini Joshi",
      accent: "rose",
      metric: { label: "Tasks complete", value: "28%" },
    },
    {
      id: "p-ritu-abhinav",
      coupleNames: "Ritu & Abhinav",
      date: "2026-08-15",
      city: "Kolkata",
      country: "India",
      role: "Lead Planner",
      budgetTier: "luxury",
      leadContact: "Ritu Banerjee",
      accent: "saffron",
      metric: { label: "Tasks complete", value: "18%" },
    },
    {
      id: "p-neha-rahul",
      coupleNames: "Neha & Rahul",
      date: "2026-09-20",
      city: "Goa",
      country: "India",
      role: "Associate Planner",
      budgetTier: "luxury",
      leadContact: "Neha Gupta",
      accent: "rose",
      metric: { label: "Tasks complete", value: "9%" },
    },
    {
      id: "p-ishita-varun",
      coupleNames: "Ishita & Varun",
      date: "2026-11-08",
      city: "Jaipur",
      country: "India",
      role: "Lead Planner",
      budgetTier: "ultra-luxury",
      leadContact: "Ishita Sharma",
      accent: "saffron",
      metric: { label: "Tasks complete", value: "4%" },
    },
    {
      id: "p-meenakshi-rajiv",
      coupleNames: "Meenakshi & Rajiv",
      date: "2026-02-14",
      city: "Chennai",
      country: "India",
      role: "Lead Planner",
      budgetTier: "luxury",
      leadContact: "Meenakshi Iyer",
      accent: "rose",
      metric: { label: "Post-wedding", value: "Album pending" },
    },
    {
      id: "p-pooja-aditya",
      coupleNames: "Pooja & Aditya",
      date: "2026-03-08",
      city: "Pune",
      country: "India",
      role: "Lead Planner",
      budgetTier: "boutique",
      leadContact: "Pooja Deshmukh",
      accent: "saffron",
      metric: { label: "Post-wedding", value: "Closed" },
    },
    {
      id: "p-aparna-naveen",
      coupleNames: "Aparna & Naveen",
      date: "2024-12-02",
      city: "London",
      country: "United Kingdom",
      role: "Lead Planner",
      archived: true,
      budgetTier: "ultra-luxury",
      leadContact: "Aparna Pillai",
      accent: "rose",
      metric: { label: "Archived", value: "2024" },
    },
  ],
};

const VENDOR: Persona = {
  role: "vendor",
  name: "Imran Qureshi",
  email: "imran@lucknowcatering.co",
  initials: "IQ",
  subtitle: "Lucknow Catering Co. · Partner",
  weddings: [
    {
      id: "v-isha-rohit",
      coupleNames: "Isha & Rohit",
      date: "2026-04-21",
      city: "Mumbai",
      country: "India",
      role: "Catering Partner",
      budgetTier: "ultra-luxury",
      leadContact: "Radhika D. (Radz Events)",
      accent: "saffron",
      metric: { label: "Menu signed off", value: "Yes" },
    },
    {
      id: "v-tara-aman",
      coupleNames: "Tara & Aman",
      date: "2026-04-30",
      city: "New Delhi",
      country: "India",
      role: "Catering Partner",
      budgetTier: "luxury",
      leadContact: "Priya B. (Tilak Events)",
      accent: "rose",
      metric: { label: "Tasting", value: "Apr 23" },
    },
    {
      id: "v-anjali-kunal",
      coupleNames: "Anjali & Kunal",
      date: "2026-05-16",
      city: "Jaipur",
      country: "India",
      role: "Catering Partner",
      budgetTier: "luxury",
      leadContact: "Anjali Bhandari",
      accent: "saffron",
      metric: { label: "Menu draft", value: "v2 sent" },
    },
    {
      id: "v-radhika-sameer",
      coupleNames: "Radhika & Sameer",
      date: "2026-06-05",
      city: "Lucknow",
      country: "India",
      role: "Lead Catering",
      pinned: true,
      budgetTier: "ultra-luxury",
      leadContact: "Radhika Chopra",
      accent: "saffron",
      metric: { label: "Menu draft", value: "In review" },
    },
    {
      id: "v-preeti-nikhil",
      coupleNames: "Preeti & Nikhil",
      date: "2026-07-22",
      city: "Hyderabad",
      country: "India",
      role: "Catering Partner",
      budgetTier: "boutique",
      leadContact: "Nikhil Raman",
      accent: "rose",
      metric: { label: "Menu draft", value: "Not started" },
    },
    {
      id: "v-swati-arnav",
      coupleNames: "Swati & Arnav",
      date: "2026-08-30",
      city: "Mumbai",
      country: "India",
      role: "Catering Partner",
      budgetTier: "luxury",
      leadContact: "Swati Verma",
      accent: "saffron",
      metric: { label: "Contract", value: "Signed" },
    },
    {
      id: "v-mona-raghav",
      coupleNames: "Mona & Raghav",
      date: "2026-03-12",
      city: "Goa",
      country: "India",
      role: "Catering Partner",
      budgetTier: "luxury",
      leadContact: "Mona Kothari",
      accent: "rose",
      metric: { label: "Final invoice", value: "Due" },
    },
    {
      id: "v-ayesha-farhan",
      coupleNames: "Ayesha & Farhan",
      date: "2025-11-22",
      city: "Udaipur",
      country: "India",
      role: "Catering Partner",
      archived: true,
      budgetTier: "luxury",
      leadContact: "Ayesha Khan",
      accent: "saffron",
      metric: { label: "Archived", value: "2025" },
    },
  ],
};

const PERSONAS: Record<PersonaRole, Persona> = {
  couple: COUPLE,
  planner: PLANNER,
  vendor: VENDOR,
};

// ─────────────────────────────────────────────────────────────────────
// Date helpers
// ─────────────────────────────────────────────────────────────────────

function daysBetween(a: Date, b: Date): number {
  const ms = 24 * 60 * 60 * 1000;
  const aa = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const bb = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((bb - aa) / ms);
}

function bucketFor(wedding: Wedding): WeddingStatusBucket {
  if (wedding.archived) return "archive";
  const delta = daysBetween(TODAY, new Date(wedding.date));
  if (delta === 0) return "today";
  if (delta > 0 && delta <= 7) return "this-week";
  if (delta > 7 && delta <= 30) return "this-month";
  if (delta > 30) return "upcoming";
  if (delta < 0 && delta >= -60) return "recent";
  return "archive";
}

function relativeTime(dateStr: string): string {
  const delta = daysBetween(TODAY, new Date(dateStr));
  if (delta === 0) return "today";
  if (delta === 1) return "tomorrow";
  if (delta > 0 && delta <= 60) return `in ${delta} days`;
  if (delta > 60) {
    const months = Math.round(delta / 30);
    return `in ${months} mo`;
  }
  if (delta === -1) return "yesterday";
  if (delta < 0 && delta >= -60) return `${-delta} days ago`;
  const months = Math.round(-delta / 30);
  return `${months} mo ago`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─────────────────────────────────────────────────────────────────────
// Nav definitions
// ─────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  /** Route it navigates to — omit for not-yet-built modules */
  href?: string;
  /** Extra path prefixes that should also activate this tab */
  matchPrefixes?: string[];
}

const NAV_INSIDE_COUPLE_OR_PLANNER: readonly NavItem[] = [
  { label: "Planning", href: "/checklist", matchPrefixes: ["/checklist"] },
  { label: "Shopping" },
  { label: "Vendors", href: "/vendors", matchPrefixes: ["/vendors"] },
  { label: "Guests", href: "/guests", matchPrefixes: ["/guests"] },
  { label: "Studio", href: "/studio", matchPrefixes: ["/studio"] },
  { label: "Registry" },
  { label: "Journal", href: "/journal", matchPrefixes: ["/journal"] },
];

const NAV_INSIDE_VENDOR: readonly NavItem[] = [
  { label: "Dashboard" },
  { label: "My Scope" },
  { label: "Timeline" },
  { label: "Messages" },
  { label: "Files" },
];

const NAV_OUTSIDE_PLANNER: readonly NavItem[] = [
  { label: "My Weddings" },
  { label: "Team" },
  { label: "Business" },
  { label: "Messages" },
];

const NAV_OUTSIDE_VENDOR: readonly NavItem[] = [
  { label: "My Weddings" },
  { label: "Schedule" },
  { label: "Messages" },
  { label: "Business" },
];

function navFor(role: PersonaRole, insideWedding: boolean): readonly NavItem[] {
  if (role === "couple") return NAV_INSIDE_COUPLE_OR_PLANNER;
  if (insideWedding) {
    return role === "planner" ? NAV_INSIDE_COUPLE_OR_PLANNER : NAV_INSIDE_VENDOR;
  }
  return role === "planner" ? NAV_OUTSIDE_PLANNER : NAV_OUTSIDE_VENDOR;
}

function matchNavFromPath(
  items: readonly NavItem[],
  pathname: string
): string | null {
  for (const item of items) {
    const prefixes = item.matchPrefixes ?? (item.href ? [item.href] : []);
    if (prefixes.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
      return item.label;
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────
// Shell state (module-scoped context so sub-components stay tidy)
// ─────────────────────────────────────────────────────────────────────

interface ShellState {
  persona: Persona;
  activeWedding: Wedding | null;
  activeNav: string;
  setActiveWedding: (w: Wedding | null) => void;
  setActiveNav: (n: string) => void;
}

const ShellContext = createContext<ShellState | null>(null);
function useShell(): ShellState {
  const v = useContext(ShellContext);
  if (!v) throw new Error("useShell must be used inside AppShell");
  return v;
}

// ─────────────────────────────────────────────────────────────────────
// Click-outside helper
// ─────────────────────────────────────────────────────────────────────

function useClickOutside<T extends HTMLElement>(
  onClose: () => void,
  isOpen: boolean
) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    if (!isOpen) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function esc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", esc);
    };
  }, [isOpen, onClose]);
  return ref;
}

// ─────────────────────────────────────────────────────────────────────
// Wedding selector (the centerpiece)
// ─────────────────────────────────────────────────────────────────────

const BUCKET_LABELS: Record<WeddingStatusBucket, string> = {
  today: "Today",
  "this-week": "This week",
  "this-month": "This month",
  upcoming: "Upcoming",
  recent: "Recent",
  archive: "Archive",
};

function WeddingSelector() {
  const { persona } = useShell();
  // Couples have a single wedding — static brand mark, no dropdown.
  if (persona.role === "couple") return <CoupleBrandMark />;
  return <MultiWeddingSelector />;
}

function CoupleBrandMark() {
  const { persona } = useShell();
  const w = persona.weddings[0];
  return (
    <button
      type="button"
      className="group flex items-center gap-3 px-1 py-2 -ml-1"
      aria-label="Home"
    >
      <span className="font-serif text-lg font-medium tracking-tight text-ink">
        {w.coupleNames}
      </span>
      <span className="hidden sm:inline-block h-3 w-px bg-border" />
      <span className="hidden sm:inline-block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        {formatDate(w.date)}
      </span>
    </button>
  );
}

function MultiWeddingSelector() {
  const { persona, activeWedding, setActiveWedding } = useShell();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false), open);

  const showSearch = persona.weddings.length > 8;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return persona.weddings;
    return persona.weddings.filter(
      (w) =>
        w.coupleNames.toLowerCase().includes(q) ||
        w.city.toLowerCase().includes(q) ||
        w.role.toLowerCase().includes(q)
    );
  }, [persona.weddings, query]);

  const pinned = filtered.filter((w) => w.pinned && !w.archived);
  const grouped = useMemo(() => {
    const buckets: Record<WeddingStatusBucket, Wedding[]> = {
      today: [],
      "this-week": [],
      "this-month": [],
      upcoming: [],
      recent: [],
      archive: [],
    };
    for (const w of filtered) buckets[bucketFor(w)].push(w);
    for (const k of Object.keys(buckets) as WeddingStatusBucket[]) {
      buckets[k].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    }
    return buckets;
  }, [filtered]);

  const activeCount = persona.weddings.filter((w) => !w.archived).length;
  const selected = activeWedding ?? persona.weddings[0];

  function pick(w: Wedding) {
    setActiveWedding(w);
    setOpen(false);
    setQuery("");
    setHoverId(null);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "group flex items-center gap-3 rounded-md px-2 py-1.5 -ml-2",
          "transition-colors hover:bg-ivory-warm"
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="font-serif text-lg font-medium tracking-tight text-ink leading-none">
          {selected.coupleNames}
        </span>
        <span className="hidden md:inline-block h-3 w-px bg-border" />
        <span className="hidden md:inline-block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          {relativeTime(selected.date)}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-ink-faint transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          className={cn(
            "popover-enter absolute left-0 top-full mt-3 z-50",
            "w-[min(92vw,640px)] overflow-hidden rounded-xl bg-popover",
            "shadow-[0_24px_60px_-20px_rgba(26,26,26,0.18)] border border-border"
          )}
          role="listbox"
        >
          {/* Header */}
          <div className="flex items-baseline justify-between px-6 pt-6 pb-3">
            <div className="flex items-baseline gap-3">
              <h3 className="font-serif text-xl font-medium text-ink">
                My Weddings
              </h3>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                {activeCount} active
              </span>
            </div>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-ink-muted hover:text-ink hover:bg-ivory-warm transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New wedding</span>
            </button>
          </div>

          {showSearch && (
            <div className="px-6 pb-3">
              <div className="flex items-center gap-2 rounded-md bg-ivory-warm px-3 py-2 border border-transparent focus-within:border-gold/40 transition-colors">
                <Search className="h-3.5 w-3.5 text-ink-faint" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by couple, city, or role"
                  className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint outline-none"
                  autoFocus
                />
              </div>
            </div>
          )}

          <div className="panel-scroll max-h-[60vh] overflow-y-auto">
            {/* Pinned */}
            {pinned.length > 0 && (
              <Section label="Pinned" icon={<Pin className="h-3 w-3" />}>
                {pinned.map((w) => (
                  <WeddingRow
                    key={w.id}
                    wedding={w}
                    active={w.id === selected.id}
                    hovered={hoverId === w.id}
                    onHover={setHoverId}
                    onClick={() => pick(w)}
                    accentOnDate
                  />
                ))}
              </Section>
            )}

            {/* Buckets in priority order */}
            {(
              [
                "today",
                "this-week",
                "this-month",
                "upcoming",
                "recent",
              ] as WeddingStatusBucket[]
            ).map((bucket) => {
              const items = grouped[bucket].filter((w) => !w.pinned);
              if (items.length === 0) return null;
              return (
                <Section
                  key={bucket}
                  label={BUCKET_LABELS[bucket]}
                  highlight={bucket === "today" || bucket === "this-week"}
                >
                  {items.map((w) => (
                    <WeddingRow
                      key={w.id}
                      wedding={w}
                      active={w.id === selected.id}
                      hovered={hoverId === w.id}
                      onHover={setHoverId}
                      onClick={() => pick(w)}
                      accentOnDate={
                        bucket === "today" || bucket === "this-week"
                      }
                    />
                  ))}
                </Section>
              );
            })}

            {/* Archive — collapsed by default */}
            {grouped.archive.length > 0 && (
              <div className="border-t border-border/70">
                <button
                  type="button"
                  onClick={() => setArchiveOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-6 py-3 text-left hover:bg-ivory-warm/60 transition-colors"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                    Archive · {grouped.archive.length}
                  </span>
                  <ChevronRight
                    className={cn(
                      "h-3.5 w-3.5 text-ink-faint transition-transform",
                      archiveOpen && "rotate-90"
                    )}
                  />
                </button>
                {archiveOpen &&
                  grouped.archive.map((w) => (
                    <WeddingRow
                      key={w.id}
                      wedding={w}
                      active={w.id === selected.id}
                      hovered={hoverId === w.id}
                      onHover={setHoverId}
                      onClick={() => pick(w)}
                      muted
                    />
                  ))}
              </div>
            )}

            {filtered.length === 0 && (
              <div className="px-6 py-10 text-center">
                <p className="font-serif text-sm italic text-ink-muted">
                  No weddings match "{query}".
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border/70 bg-ivory-warm/50 px-6 py-3">
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink transition-colors"
            >
              <span>View all weddings</span>
              <ChevronRight className="h-3 w-3" />
            </button>
            <span className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              <Command className="h-3 w-3" />
              <span>K to search</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({
  label,
  icon,
  highlight,
  children,
}: {
  label: string;
  icon?: ReactNode;
  highlight?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="px-2 pb-1">
      <div
        className={cn(
          "flex items-center gap-1.5 px-4 pt-4 pb-2",
          "font-mono text-[10px] uppercase tracking-[0.16em]",
          highlight ? "text-saffron" : "text-ink-faint"
        )}
      >
        {icon}
        <span>{label}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}

function WeddingRow({
  wedding,
  active,
  hovered,
  onHover,
  onClick,
  accentOnDate,
  muted,
}: {
  wedding: Wedding;
  active: boolean;
  hovered: boolean;
  onHover: (id: string | null) => void;
  onClick: () => void;
  accentOnDate?: boolean;
  muted?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => onHover(wedding.id)}
      onMouseLeave={() => onHover(null)}
      className={cn(
        "group relative w-full flex items-center gap-4 px-4 py-3 rounded-md text-left",
        "transition-colors hover:bg-ivory-warm",
        active && "bg-ivory-warm",
        muted && "opacity-70"
      )}
      role="option"
      aria-selected={active}
    >
      {/* Active rail */}
      {active && (
        <span className="absolute left-1 top-2 bottom-2 w-[2px] bg-gold rounded-full" />
      )}

      {/* Couple + location */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-[15px] font-medium text-ink truncate">
            {wedding.coupleNames}
          </span>
          {wedding.pinned && (
            <Pin className="h-2.5 w-2.5 text-gold/70 shrink-0" />
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-muted truncate">
          <span className="truncate">{wedding.city}</span>
          <span className="h-0.5 w-0.5 rounded-full bg-ink-faint/50 shrink-0" />
          <span
            className={cn(
              "font-mono text-[10px] uppercase tracking-[0.12em] shrink-0",
              "text-ink-faint"
            )}
          >
            {wedding.role}
          </span>
        </div>
      </div>

      {/* Hover preview card */}
      {hovered && (
        <div
          className={cn(
            "hidden lg:flex flex-col items-end gap-1 pr-2 pl-6",
            "border-l border-border/60"
          )}
          style={{ minWidth: 180 }}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            Lead
          </span>
          <span className="text-xs text-ink truncate max-w-[180px]">
            {wedding.leadContact}
          </span>
          <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            Tier
          </span>
          <span className="text-xs text-ink capitalize">
            {wedding.budgetTier.replace("-", " ")}
          </span>
        </div>
      )}

      {/* Date + metric */}
      <div className="flex flex-col items-end gap-0.5 shrink-0 min-w-[90px]">
        <span
          className={cn(
            "font-mono text-[11px]",
            accentOnDate ? "text-saffron" : "text-ink"
          )}
        >
          {relativeTime(wedding.date)}
        </span>
        <span className="font-mono text-[10px] text-ink-faint">
          {wedding.metric.value}
        </span>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Nav bar (center)
// ─────────────────────────────────────────────────────────────────────

function PrimaryNav({ insideWedding }: { insideWedding: boolean }) {
  const { persona, activeNav, setActiveNav } = useShell();
  const items = navFor(persona.role, insideWedding);

  return (
    <nav
      aria-label="Primary"
      className="hidden md:flex items-center gap-1"
    >
      {items.map((item) => {
        const active = item.label === activeNav;
        const classes = cn(
          "relative px-3 py-2 text-sm transition-colors",
          "text-ink-muted hover:text-ink",
          active && "text-ink",
          !item.href && "cursor-default opacity-70"
        );
        const underline = (
          <span
            className={cn(
              "absolute left-3 right-3 -bottom-px h-[2px] rounded-full",
              "transition-all duration-200",
              active ? "bg-saffron opacity-100" : "bg-saffron opacity-0"
            )}
          />
        );
        if (item.href) {
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setActiveNav(item.label)}
              className={classes}
              aria-current={active ? "page" : undefined}
            >
              <span>{item.label}</span>
              {underline}
            </Link>
          );
        }
        return (
          <button
            key={item.label}
            type="button"
            onClick={() => setActiveNav(item.label)}
            className={classes}
            title="Coming soon"
          >
            <span>{item.label}</span>
            {underline}
          </button>
        );
      })}
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Utility area (right)
// ─────────────────────────────────────────────────────────────────────

function UtilityArea() {
  const { persona } = useShell();
  const [menu, setMenu] = useState<"none" | "notif" | "user" | "help">("none");

  const ref = useClickOutside<HTMLDivElement>(
    () => setMenu("none"),
    menu !== "none"
  );

  const notifications = [
    {
      id: 1,
      title: "Meera & Rohan — timeline updated",
      body: "Hair & makeup moved to 04:30",
      when: "12m",
      accent: true,
    },
    {
      id: 2,
      title: "Shreya & Karthik — new comment",
      body: "From the florist on the mandap renders",
      when: "1h",
    },
    {
      id: 3,
      title: "Priya & Arjun — vendor accepted",
      body: "Lucknow Catering Co. confirmed",
      when: "3h",
    },
  ];

  return (
    <div ref={ref} className="flex items-center gap-1">
      {/* Help */}
      <IconButton
        ariaLabel="Help"
        onClick={() => setMenu(menu === "help" ? "none" : "help")}
      >
        <HelpCircle className="h-4 w-4" />
      </IconButton>

      {/* Notifications */}
      <div className="relative">
        <IconButton
          ariaLabel="Notifications"
          onClick={() => setMenu(menu === "notif" ? "none" : "notif")}
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-saffron opacity-60" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-saffron" />
          </span>
        </IconButton>

        {menu === "notif" && (
          <div className="popover-enter absolute right-0 top-full mt-2 w-[340px] rounded-xl border border-border bg-popover shadow-[0_24px_60px_-20px_rgba(26,26,26,0.18)] z-50">
            <div className="flex items-baseline justify-between px-5 pt-5 pb-3">
              <h4 className="font-serif text-base font-medium text-ink">
                Notifications
              </h4>
              <button className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint hover:text-ink">
                Mark all read
              </button>
            </div>
            <ul className="max-h-[360px] overflow-y-auto panel-scroll">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className="px-5 py-3 border-t border-border/60 hover:bg-ivory-warm transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    {n.accent ? (
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-saffron shrink-0" />
                    ) : (
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-ink-faint/40 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-ink">{n.title}</p>
                      <p className="mt-0.5 text-xs text-ink-muted truncate">
                        {n.body}
                      </p>
                    </div>
                    <span className="font-mono text-[10px] text-ink-faint shrink-0">
                      {n.when}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* User */}
      <div className="relative pl-1">
        <button
          type="button"
          onClick={() => setMenu(menu === "user" ? "none" : "user")}
          className={cn(
            "flex items-center gap-2 rounded-full p-0.5 pr-1 transition-colors",
            "hover:bg-ivory-warm"
          )}
          aria-label="User menu"
        >
          <span
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full",
              "bg-gradient-to-br from-gold-pale to-saffron-pale",
              "border border-gold/30",
              "font-serif text-xs font-medium text-ink"
            )}
          >
            {persona.initials}
          </span>
          <ChevronDown className="h-3 w-3 text-ink-faint" />
        </button>

        {menu === "user" && (
          <div className="popover-enter absolute right-0 top-full mt-2 w-[260px] overflow-hidden rounded-xl border border-border bg-popover shadow-[0_24px_60px_-20px_rgba(26,26,26,0.18)] z-50">
            <div className="px-5 py-4 border-b border-border/70">
              <p className="font-serif text-[15px] font-medium text-ink">
                {persona.name}
              </p>
              <p className="mt-0.5 text-xs text-ink-muted truncate">
                {persona.email}
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                {persona.subtitle}
              </p>
            </div>
            <MenuItem icon={<UserCog className="h-3.5 w-3.5" />} label="Profile" />
            <MenuItem icon={<Settings className="h-3.5 w-3.5" />} label="Settings" />
            {persona.role !== "couple" && (
              <MenuItem
                icon={<Sparkles className="h-3.5 w-3.5" />}
                label="Switch role"
                meta="Vendor / Planner"
              />
            )}
            <div className="border-t border-border/70">
              <MenuItem
                icon={<LogOut className="h-3.5 w-3.5" />}
                label="Sign out"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function IconButton({
  children,
  onClick,
  ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "relative flex h-8 w-8 items-center justify-center rounded-md",
        "text-ink-muted transition-colors",
        "hover:bg-ivory-warm hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}

function MenuItem({
  icon,
  label,
  meta,
}: {
  icon: ReactNode;
  label: string;
  meta?: string;
}) {
  return (
    <button
      type="button"
      className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-ink-muted hover:text-ink hover:bg-ivory-warm transition-colors text-left"
    >
      <span className="text-ink-faint">{icon}</span>
      <span className="flex-1">{label}</span>
      {meta && (
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          {meta}
        </span>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Mobile nav sheet
// ─────────────────────────────────────────────────────────────────────

function MobileNav({
  open,
  onClose,
  insideWedding,
}: {
  open: boolean;
  onClose: () => void;
  insideWedding: boolean;
}) {
  const { persona, activeNav, setActiveNav } = useShell();
  const items = navFor(persona.role, insideWedding);
  if (!open) return null;
  return (
    <div className="md:hidden fixed inset-0 z-40 bg-ink/20" onClick={onClose}>
      <div
        className="absolute top-14 left-0 right-0 bg-ivory border-b border-border shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <nav className="py-2">
          {items.map((item) => {
            const active = item.label === activeNav;
            const rowClasses = cn(
              "w-full flex items-center justify-between px-5 py-3 text-left transition-colors",
              active
                ? "bg-ivory-warm text-ink"
                : "text-ink-muted hover:bg-ivory-warm hover:text-ink",
              !item.href && "opacity-70"
            );
            const content = (
              <>
                <span className="text-sm">{item.label}</span>
                {active && <span className="h-1 w-6 rounded-full bg-saffron" />}
              </>
            );
            if (item.href) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => {
                    setActiveNav(item.label);
                    onClose();
                  }}
                  className={rowClasses}
                >
                  {content}
                </Link>
              );
            }
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setActiveNav(item.label);
                  onClose();
                }}
                className={rowClasses}
              >
                {content}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Dev-only persona toggle
// ─────────────────────────────────────────────────────────────────────

function DevRoleToggle({
  role,
  onChange,
}: {
  role: PersonaRole;
  onChange: (r: PersonaRole) => void;
}) {
  const opts: { value: PersonaRole; label: string }[] = [
    { value: "couple", label: "Couple" },
    { value: "planner", label: "Planner" },
    { value: "vendor", label: "Vendor" },
  ];
  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 flex items-center gap-1 rounded-full border border-border",
        "bg-ink px-1 py-1 shadow-lg"
      )}
    >
      <span className="px-3 font-mono text-[9px] uppercase tracking-[0.18em] text-ivory/60">
        Dev · Persona
      </span>
      {opts.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs transition-colors",
            role === o.value
              ? "bg-saffron text-ink"
              : "text-ivory/70 hover:text-ivory"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Main content placeholder
// ─────────────────────────────────────────────────────────────────────

function ModulePlaceholder({
  insideWedding,
  onEnterWedding,
}: {
  insideWedding: boolean;
  onEnterWedding: () => void;
}) {
  const { persona, activeWedding, activeNav } = useShell();
  const w = activeWedding ?? persona.weddings[0];

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
      <div className="space-y-10">
        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
              {insideWedding ? "Wedding context" : "Cross-wedding"}
            </span>
            <span className="h-0.5 w-8 bg-gold/40 rounded-full" />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron">
              {activeNav}
            </span>
          </div>

          {insideWedding ? (
            <>
              <h1 className="font-serif text-5xl font-bold tracking-tight text-ink leading-[1.05]">
                {w.coupleNames}
              </h1>
              <p className="text-lg text-ink-muted max-w-prose">
                {w.city}, {w.country} · {formatDate(w.date)} ·{" "}
                <span className="font-mono text-sm text-ink-faint">
                  {relativeTime(w.date)}
                </span>
              </p>
            </>
          ) : (
            <>
              <h1 className="font-serif text-5xl font-bold tracking-tight text-ink leading-[1.05]">
                {activeNav}
              </h1>
              <p className="text-lg text-ink-muted max-w-prose">
                Cross-wedding view for {persona.name}.
              </p>
            </>
          )}
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            label={w.metric.label}
            value={w.metric.value}
            accent
          />
          <MetricCard label="Role" value={w.role} />
          <MetricCard
            label="Budget tier"
            value={w.budgetTier.replace("-", " ")}
            capitalize
          />
        </div>

        <div className="rounded-xl border border-dashed border-border bg-ivory-warm/40 p-10 text-center">
          <p className="font-serif text-lg italic text-ink-muted">
            The {activeNav} module renders here.
          </p>
          <p className="mt-2 text-sm text-ink-faint">
            This shell is a frame — each module owns its own interior.
          </p>
          {!insideWedding && persona.role !== "couple" && (
            <button
              type="button"
              onClick={onEnterWedding}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-2.5 text-sm text-ivory hover:opacity-80 transition-opacity"
            >
              <span>Open {w.coupleNames}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  accent,
  capitalize,
}: {
  label: string;
  value: string;
  accent?: boolean;
  capitalize?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-5",
        accent
          ? "border-gold/30 bg-gradient-to-br from-gold-pale/40 to-transparent"
          : "border-border bg-card"
      )}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
        {label}
      </p>
      <p
        className={cn(
          "mt-3 font-serif text-2xl font-medium text-ink",
          capitalize && "capitalize"
        )}
      >
        {value}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// AppShell — the layout wrapper
// ─────────────────────────────────────────────────────────────────────

export interface AppShellProps {
  children?: ReactNode;
  /** Initial persona — defaults to planner for a full demo */
  initialRole?: PersonaRole;
  /** Show the dev persona toggle (default on, switch off in production) */
  devToggle?: boolean;
}

export default function AppShell({
  children,
  initialRole = "planner",
  devToggle = false,
}: AppShellProps) {
  const pathname = usePathname() ?? "";
  const [role, setRole] = useState<PersonaRole>(initialRole);
  const persona = PERSONAS[role];

  // Couples are always "inside" their single wedding.
  // Planners/Vendors start inside their first wedding but can leave.
  const [insideWedding, setInsideWedding] = useState(true);
  const [activeWedding, setActiveWedding] = useState<Wedding | null>(
    persona.weddings[0] ?? null
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = navFor(role, insideWedding);
  const fromPath = matchNavFromPath(items, pathname);
  const defaultLabel = items[0]?.label ?? "";
  const [activeNavState, setActiveNavState] = useState<string>(
    fromPath ?? defaultLabel
  );
  // Pathname always wins when it matches a nav route.
  const activeNav = fromPath ?? activeNavState;
  const setActiveNav = (n: string) => setActiveNavState(n);

  // Switching persona resets the relevant shell state.
  useEffect(() => {
    const p = PERSONAS[role];
    setActiveWedding(p.weddings[0] ?? null);
    setInsideWedding(true);
    setActiveNavState(navFor(role, true)[0]?.label ?? "");
    setMobileOpen(false);
  }, [role]);

  // When nav items change shape (inside ↔ outside), snap to the first valid item.
  useEffect(() => {
    const current = navFor(role, insideWedding);
    if (!current.some((i) => i.label === activeNavState)) {
      setActiveNavState(current[0]?.label ?? "");
    }
  }, [role, insideWedding, activeNavState]);

  const handleSetActiveWedding = (w: Wedding | null) => {
    setActiveWedding(w);
    if (w) setInsideWedding(true);
  };

  const shellValue: ShellState = {
    persona,
    activeWedding,
    activeNav,
    setActiveWedding: handleSetActiveWedding,
    setActiveNav,
  };

  return (
    <ShellContext.Provider value={shellValue}>
      <div className="min-h-screen bg-ivory text-ink flex flex-col">
        {/* ── Top bar ────────────────────────────────────────────── */}
        <header
          className={cn(
            "sticky top-0 z-30 h-14 flex items-center",
            "bg-ivory/90 backdrop-blur-sm",
            "border-b border-border"
          )}
        >
          <div className="w-full px-4 md:px-6 flex items-center gap-4">
            {/* Left: hamburger (mobile) + wedding selector */}
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                className="md:hidden flex h-8 w-8 items-center justify-center rounded-md text-ink-muted hover:bg-ivory-warm"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Menu"
              >
                {mobileOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </button>
              <WeddingSelector />
              {persona.role !== "couple" && (
                <button
                  type="button"
                  onClick={() => setInsideWedding((v) => !v)}
                  className={cn(
                    "hidden lg:flex items-center gap-1 rounded-full px-2.5 py-1",
                    "font-mono text-[9px] uppercase tracking-[0.18em]",
                    "border transition-colors",
                    insideWedding
                      ? "border-gold/30 text-saffron bg-gold-pale/30"
                      : "border-border text-ink-muted hover:text-ink"
                  )}
                  title="Toggle wedding / cross-wedding context"
                >
                  <span className="h-1 w-1 rounded-full bg-current" />
                  <span>{insideWedding ? "In wedding" : "All weddings"}</span>
                </button>
              )}
            </div>

            {/* Center: primary nav */}
            <div className="flex-1 flex justify-center">
              <PrimaryNav insideWedding={insideWedding} />
            </div>

            {/* Right: utility area */}
            <div className="flex items-center gap-2 shrink-0">
              <UtilityArea />
            </div>
          </div>
        </header>

        <MobileNav
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          insideWedding={insideWedding}
        />

        {/* ── Main content ───────────────────────────────────────── */}
        <main className="flex-1">
          {children ?? (
            <ModulePlaceholder
              insideWedding={insideWedding}
              onEnterWedding={() => setInsideWedding(true)}
            />
          )}
        </main>

        {devToggle && <DevRoleToggle role={role} onChange={setRole} />}
      </div>
    </ShellContext.Provider>
  );
}
