"use client";

// ── Photos & Videos keepsake page ───────────────────────────────────────────
// The memory vault — where the couple collects planning photos, guest uploads,
// and professional deliverables, then turns them into albums, keepsakes, and
// shareable galleries. Not a vendor workspace — there's no shortlist/contract
// lifecycle. Six tabs cover the full lifecycle from capture → organize →
// create → share.

import { Fragment, useMemo, useState } from "react";
import {
  Album,
  Aperture,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  Cloud,
  Copy,
  Download,
  FileText,
  Film,
  Filter,
  Flag,
  Grid2x2,
  Heart,
  ImageIcon,
  Images,
  Layers,
  LayoutList,
  Link2,
  Mail,
  MessageCircle,
  Plus,
  Printer,
  QrCode,
  Send,
  Share2,
  Sparkles,
  Upload,
  Users,
  Wand2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ExtraActionButton,
  ExtraCanvasShell,
  type ExtraTabDef,
} from "./ExtraCanvasShell";
import { SectionHeader } from "@/components/workspace/blocks/primitives";

// ── Tabs ────────────────────────────────────────────────────────────────────

type PhotosTabId =
  | "all_media"
  | "guest_wall"
  | "albums"
  | "keepsake"
  | "sharing"
  | "documents";

const TABS: ExtraTabDef<PhotosTabId>[] = [
  { id: "all_media", label: "All Media", icon: Images },
  { id: "guest_wall", label: "Guest Photo Wall", icon: QrCode },
  { id: "albums", label: "Albums & Events", icon: Album },
  { id: "keepsake", label: "AI Keepsake", icon: BookOpen },
  { id: "sharing", label: "Sharing", icon: Share2 },
  { id: "documents", label: "Documents", icon: FileText },
];

// ── Shared mock data (same tile taxonomy as the old single-tab gallery) ────

type FilterId =
  | "all"
  | "planning"
  | "events"
  | "guest_uploads"
  | "professional";

const FILTERS: { id: FilterId; label: string; count: number }[] = [
  { id: "all", label: "All", count: 870 },
  { id: "planning", label: "Planning", count: 124 },
  { id: "events", label: "Events", count: 523 },
  { id: "guest_uploads", label: "Guest uploads", count: 164 },
  { id: "professional", label: "Professional", count: 59 },
];

type Tile = {
  id: string;
  label: string;
  date: string;
  filter: FilterId;
  ratio: "tall" | "square" | "wide";
  tint: "ivory" | "gold" | "sage" | "rose";
  favourite?: boolean;
};

const TILES: Tile[] = [
  { id: "t1", label: "Foodlink tasting", date: "MAY 24", filter: "planning", ratio: "tall", tint: "gold" },
  { id: "t2", label: "Venue walk-through", date: "MAY 18", filter: "planning", ratio: "square", tint: "ivory" },
  { id: "t3", label: "Engagement dinner", date: "APR 12", filter: "planning", ratio: "wide", tint: "rose", favourite: true },
  { id: "t4", label: "Mehendi — cousins", date: "JUN 10", filter: "guest_uploads", ratio: "square", tint: "sage" },
  { id: "t5", label: "Haldi dress fitting", date: "JUN 04", filter: "planning", ratio: "tall", tint: "gold" },
  { id: "t6", label: "Sangeet stage", date: "JUN 12", filter: "events", ratio: "square", tint: "rose", favourite: true },
  { id: "t7", label: "Sangeet dance floor", date: "JUN 12", filter: "guest_uploads", ratio: "wide", tint: "ivory" },
  { id: "t8", label: "Baraat procession", date: "JUN 13", filter: "events", ratio: "square", tint: "sage" },
  { id: "t9", label: "Mandap, mid-ceremony", date: "JUN 13", filter: "professional", ratio: "tall", tint: "gold", favourite: true },
  { id: "t10", label: "Varmala exchange", date: "JUN 13", filter: "professional", ratio: "square", tint: "rose" },
  { id: "t11", label: "Reception first dance", date: "JUN 14", filter: "professional", ratio: "wide", tint: "ivory" },
  { id: "t12", label: "Cousins after-party", date: "JUN 14", filter: "guest_uploads", ratio: "square", tint: "sage" },
];

// ── Root ────────────────────────────────────────────────────────────────────

export function PhotosKeepsakeCanvas() {
  return (
    <ExtraCanvasShell<PhotosTabId>
      eyebrow="WORKSPACE · KEEPSAKES"
      icon={Images}
      title="Photos & Videos"
      subtitle="Your wedding memory vault — capture, organize, and create keepsakes"
      actions={
        <>
          <ExtraActionButton
            icon={<QrCode size={13} strokeWidth={1.8} />}
            label="Guest QR"
          />
          <ExtraActionButton
            icon={<Upload size={13} strokeWidth={1.8} />}
            label="Upload"
            primary
          />
        </>
      }
      tabs={TABS}
      renderTab={(tab) => <PhotosTab tab={tab} />}
    />
  );
}

function PhotosTab({ tab }: { tab: PhotosTabId }) {
  switch (tab) {
    case "all_media":
      return <AllMediaTab />;
    case "guest_wall":
      return <GuestWallTab />;
    case "albums":
      return <AlbumsTab />;
    case "keepsake":
      return <KeepsakeTab />;
    case "sharing":
      return <SharingTab />;
    case "documents":
      return <DocumentsTab />;
  }
}

// ── 1 · All Media ───────────────────────────────────────────────────────────

type ViewMode = "grid" | "timeline";
type SortMode = "newest" | "oldest" | "favourites";

function AllMediaTab() {
  const [filter, setFilter] = useState<FilterId>("all");
  const [view, setView] = useState<ViewMode>("grid");
  const [sort, setSort] = useState<SortMode>("newest");

  const filtered = useMemo(() => {
    const base =
      filter === "all" ? TILES : TILES.filter((t) => t.filter === filter);
    if (sort === "favourites") {
      return [...base].sort(
        (a, b) => Number(Boolean(b.favourite)) - Number(Boolean(a.favourite)),
      );
    }
    if (sort === "oldest") return [...base].reverse();
    return base;
  }, [filter, sort]);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Your photos & videos"
        title="Everything in one place"
        description="Upload from your camera roll, collect from guests, and pull in professional deliverables. We'll auto-tag by event, person, and moment."
      />

      <UploadHub />

      <AutoOrgGroups />

      <div className="flex flex-col gap-4 border-t border-border/60 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p
              className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Library · 847 photos · 23 videos
            </p>
            <h3 className="mt-1 font-serif text-[18px] text-ink">
              Browse everything
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <SortSelect sort={sort} onChange={setSort} />
            <ViewToggle view={view} onChange={setView} />
          </div>
        </div>

        <div className="flex gap-6">
          <aside className="w-44 shrink-0">
            <p
              className="mb-3 flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <Filter size={11} strokeWidth={1.8} />
              Filter
            </p>
            <ul className="space-y-0.5">
              {FILTERS.map((f) => (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={() => setFilter(f.id)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-[12.5px] transition-colors",
                      filter === f.id
                        ? "bg-ivory-warm text-ink"
                        : "text-ink-muted hover:bg-ivory-warm/50 hover:text-ink-soft",
                    )}
                  >
                    <span>{f.label}</span>
                    <span
                      className="font-mono text-[10px] tabular-nums text-ink-faint"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {f.count}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <div className="min-w-0 flex-1">
            {view === "grid" ? (
              <MasonryGrid tiles={filtered} />
            ) : (
              <TimelineView tiles={filtered} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function UploadHub() {
  return (
    <section className="rounded-lg border border-border bg-white p-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <UploadAction
          icon={<Upload size={14} strokeWidth={1.8} />}
          label="Upload photos/videos"
          hint="Drag & drop or browse"
          primary
        />
        <UploadAction
          icon={<Cloud size={14} strokeWidth={1.8} />}
          label="Import from Google Photos"
          hint="Connect your account"
        />
        <UploadAction
          icon={<Aperture size={14} strokeWidth={1.8} />}
          label="Import from iCloud"
          hint="Shared album link"
        />
        <UploadAction
          icon={<Link2 size={14} strokeWidth={1.8} />}
          label="Paste a link"
          hint="Dropbox, WeTransfer…"
        />
      </div>
    </section>
  );
}

function UploadAction({
  icon,
  label,
  hint,
  primary = false,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex flex-col items-start gap-1.5 rounded-md border px-4 py-3 text-left transition-colors",
        primary
          ? "border-ink bg-ink text-ivory hover:bg-ink-soft"
          : "border-dashed border-border bg-ivory-warm/40 text-ink-muted hover:border-saffron/50 hover:text-ink",
      )}
    >
      <span
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-md",
          primary ? "bg-white/10" : "bg-white",
        )}
      >
        {icon}
      </span>
      <span className="text-[12.5px] font-medium">{label}</span>
      <span
        className={cn(
          "font-mono text-[9.5px] uppercase tracking-[0.12em]",
          primary ? "text-ivory/70" : "text-ink-faint",
        )}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {hint}
      </span>
    </button>
  );
}

type AutoGroup = { id: string; label: string; count: number; tint: Tile["tint"] };

const AUTO_GROUPS: AutoGroup[] = [
  { id: "mehendi", label: "Mehendi", count: 142, tint: "sage" },
  { id: "sangeet", label: "Sangeet", count: 287, tint: "rose" },
  { id: "wedding", label: "Wedding", count: 310, tint: "gold" },
  { id: "reception", label: "Reception", count: 94, tint: "rose" },
  { id: "getting_ready", label: "Getting Ready", count: 14, tint: "ivory" },
  { id: "planning", label: "Planning memories", count: 23, tint: "sage" },
];

function AutoOrgGroups() {
  return (
    <section className="rounded-lg border border-border bg-white p-5">
      <header className="mb-4 flex items-baseline justify-between gap-3">
        <div>
          <p
            className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <Sparkles size={11} strokeWidth={1.8} />
            Smart organization
          </p>
          <h3 className="mt-1 font-serif text-[18px] text-ink">
            Auto-tagged by event, person, and moment
          </h3>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-saffron/40 hover:text-saffron"
        >
          <Wand2 size={13} strokeWidth={1.8} />
          Re-scan
        </button>
      </header>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {AUTO_GROUPS.map((g) => (
          <AutoGroupCard key={g.id} group={g} />
        ))}
      </div>
    </section>
  );
}

function AutoGroupCard({ group }: { group: AutoGroup }) {
  const gradient = tintToGradient(group.tint);
  return (
    <button
      type="button"
      className="group flex items-center gap-3 overflow-hidden rounded-md border border-border bg-white p-3 text-left transition-colors hover:border-saffron/40"
    >
      <div
        className={cn(
          "flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-gradient-to-br",
          gradient,
        )}
      >
        <ImageIcon size={20} strokeWidth={1.3} className="text-ink-faint/70" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-serif text-[15px] text-ink">{group.label}</p>
        <p
          className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {group.count} photos
        </p>
      </div>
      <span className="text-[11px] text-ink-muted transition-colors group-hover:text-saffron">
        View →
      </span>
    </button>
  );
}

function SortSelect({
  sort,
  onChange,
}: {
  sort: SortMode;
  onChange: (v: SortMode) => void;
}) {
  const options: { id: SortMode; label: string }[] = [
    { id: "newest", label: "Newest first" },
    { id: "oldest", label: "Oldest first" },
    { id: "favourites", label: "Favourites" },
  ];
  return (
    <label className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-2.5 py-1.5 text-[11.5px] text-ink-muted">
      <span
        className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Sort
      </span>
      <select
        value={sort}
        onChange={(e) => onChange(e.target.value as SortMode)}
        className="border-0 bg-transparent text-[11.5px] text-ink focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ViewToggle({
  view,
  onChange,
}: {
  view: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  return (
    <div className="inline-flex overflow-hidden rounded-md border border-border">
      <ViewToggleButton
        icon={Grid2x2}
        label="Grid"
        active={view === "grid"}
        onClick={() => onChange("grid")}
      />
      <ViewToggleButton
        icon={LayoutList}
        label="Timeline"
        active={view === "timeline"}
        onClick={() => onChange("timeline")}
      />
    </div>
  );
}

function ViewToggleButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 border-l border-border px-3 py-1.5 text-[11.5px] font-medium first:border-l-0 transition-colors",
        active ? "bg-ink text-ivory" : "bg-white text-ink-muted hover:text-ink",
      )}
      aria-pressed={active}
    >
      <Icon size={13} strokeWidth={1.8} />
      {label}
    </button>
  );
}

function MasonryGrid({ tiles }: { tiles: Tile[] }) {
  if (tiles.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-ivory-warm/40 px-6 py-12 text-center">
        <ImageIcon
          size={28}
          strokeWidth={1.3}
          className="mx-auto text-ink-faint"
        />
        <p className="mt-3 font-serif text-[15px] italic text-ink-muted">
          Nothing here yet.
        </p>
      </div>
    );
  }
  return (
    <div className="columns-1 gap-3 sm:columns-2 lg:columns-3">
      {tiles.map((t) => (
        <PhotoTile key={t.id} tile={t} />
      ))}
    </div>
  );
}

function PhotoTile({ tile }: { tile: Tile }) {
  const aspect =
    tile.ratio === "tall"
      ? "aspect-[3/4]"
      : tile.ratio === "wide"
        ? "aspect-[4/3]"
        : "aspect-square";
  const gradient = tintToGradient(tile.tint);

  return (
    <figure className="group relative mb-3 break-inside-avoid overflow-hidden rounded-md border border-border bg-white">
      <div className={cn("relative", aspect)}>
        <div
          className={cn("absolute inset-0 bg-gradient-to-br", gradient)}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon size={24} strokeWidth={1.3} className="text-ink-faint/50" />
        </div>
        {tile.favourite && (
          <span className="absolute left-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/85 text-rose shadow-sm">
            <Heart size={11} strokeWidth={2} fill="currentColor" />
          </span>
        )}
      </div>
      <figcaption className="flex items-center justify-between gap-2 border-t border-border/60 px-3 py-2">
        <span className="truncate text-[12px] text-ink">{tile.label}</span>
        <span
          className="shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {tile.date}
        </span>
      </figcaption>
    </figure>
  );
}

function TimelineView({ tiles }: { tiles: Tile[] }) {
  const groups = useMemo(() => {
    const map = new Map<string, Tile[]>();
    for (const t of tiles) {
      const month = t.date.split(" ")[0] ?? "—";
      if (!map.has(month)) map.set(month, []);
      map.get(month)!.push(t);
    }
    return Array.from(map.entries());
  }, [tiles]);

  if (tiles.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-ivory-warm/40 px-6 py-12 text-center">
        <Calendar size={24} strokeWidth={1.3} className="mx-auto text-ink-faint" />
        <p className="mt-3 font-serif text-[15px] italic text-ink-muted">
          Nothing on the timeline yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map(([month, group]) => (
        <section key={month}>
          <h3
            className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {month} 2026
          </h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {group.map((t) => (
              <PhotoTile key={t.id} tile={t} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function tintToGradient(tint: Tile["tint"]): string {
  return {
    ivory: "from-ivory-warm via-ivory-deep to-gold-pale/40",
    gold: "from-gold-pale/60 via-ivory-deep to-ivory-warm",
    sage: "from-sage-pale via-ivory-warm to-ivory-deep",
    rose: "from-rose-pale/70 via-ivory-deep to-ivory-warm",
  }[tint];
}

// ── 2 · Guest Photo Wall ────────────────────────────────────────────────────

type QrEventStatus = "active" | "pending";

type QrEventRow = {
  id: string;
  event: string;
  status: QrEventStatus;
  uploads: number;
  date: string;
};

const QR_EVENTS: QrEventRow[] = [
  { id: "mehendi", event: "Mehendi", status: "active", uploads: 142, date: "Jun 10" },
  { id: "sangeet", event: "Sangeet", status: "active", uploads: 287, date: "Jun 12" },
  { id: "wedding", event: "Wedding", status: "pending", uploads: 0, date: "Jun 13" },
  { id: "reception", event: "Reception", status: "pending", uploads: 0, date: "Jun 14" },
];

type Contributor = { name: string; count: number };

const SANGEET_CONTRIBUTORS: Contributor[] = [
  { name: "Kavya", count: 23 },
  { name: "Aanya", count: 18 },
  { name: "Uncle Raj", count: 7 },
  { name: "Mira", count: 12 },
  { name: "Rohan", count: 9 },
  { name: "Unknown", count: 15 },
];

function GuestWallTab() {
  const [activeQr, setActiveQr] = useState<string>("sangeet");
  const [autoPublish, setAutoPublish] = useState(true);
  const [flagBlurry, setFlagBlurry] = useState(true);
  const active = QR_EVENTS.find((q) => q.id === activeQr) ?? QR_EVENTS[0]!;

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Guest photo wall"
        title="Let your guests be the photographers too"
        description="Generate a QR code for each event — guests scan, upload from their phone, and their photos flow into your album organized by event. No app download needed."
      />

      <section className="rounded-lg border border-border bg-white">
        <header className="flex items-baseline justify-between border-b border-border/60 px-5 py-3">
          <h3 className="font-serif text-[15px] text-ink">
            QR codes by event
          </h3>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-saffron/40 hover:text-saffron"
          >
            <Plus size={13} strokeWidth={1.8} /> Generate for new event
          </button>
        </header>
        <ul className="divide-y divide-border/40">
          {QR_EVENTS.map((q) => (
            <li
              key={q.id}
              className={cn(
                "grid items-center gap-4 px-5 py-4 sm:grid-cols-[auto_1fr_auto_auto]",
                q.id === activeQr && "bg-ivory-warm/40",
              )}
            >
              <QrThumb active={q.status === "active"} />
              <div className="min-w-0">
                <p className="font-serif text-[15px] text-ink">{q.event}</p>
                <p
                  className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-muted"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {q.date} · {q.status === "active"
                    ? `${q.uploads} uploads`
                    : "Not yet active"}
                </p>
              </div>
              <QrStatusPill status={q.status} />
              <div className="flex flex-wrap items-center gap-1.5">
                <QrMiniButton
                  icon={<Download size={12} strokeWidth={1.8} />}
                  label="Download QR"
                />
                <QrMiniButton
                  icon={<Printer size={12} strokeWidth={1.8} />}
                  label="Print cards"
                />
                {q.status === "active" ? (
                  <QrMiniButton
                    icon={<Images size={12} strokeWidth={1.8} />}
                    label="View uploads"
                    onClick={() => setActiveQr(q.id)}
                    active={q.id === activeQr}
                  />
                ) : (
                  <QrMiniButton
                    icon={<Send size={12} strokeWidth={1.8} />}
                    label="Activate"
                    primary
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <PrintableCardPreview />

      <UploadStream event={active} contributors={SANGEET_CONTRIBUTORS} />

      <section className="rounded-lg border border-border bg-white p-5">
        <header className="mb-3">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Moderation
          </p>
          <h3 className="mt-1 font-serif text-[18px] text-ink">
            How uploads reach your album
          </h3>
        </header>
        <div className="space-y-2">
          <RadioRow
            label="Auto-publish all uploads"
            hint="Fastest — photos appear instantly."
            checked={autoPublish}
            onClick={() => setAutoPublish(true)}
          />
          <RadioRow
            label="Review before publishing"
            hint="Planner or couple approves each batch."
            checked={!autoPublish}
            onClick={() => setAutoPublish(false)}
          />
          <CheckRow
            label="Flag duplicates and blurry images"
            hint="We'll set them aside — you can un-flag any time."
            checked={flagBlurry}
            onChange={setFlagBlurry}
          />
        </div>
      </section>
    </div>
  );
}

function QrThumb({ active }: { active: boolean }) {
  return (
    <div
      className={cn(
        "flex h-14 w-14 items-center justify-center rounded-md border",
        active
          ? "border-ink bg-white text-ink"
          : "border-dashed border-border bg-ivory-warm/40 text-ink-faint",
      )}
    >
      <QrCode size={26} strokeWidth={1.3} />
    </div>
  );
}

function QrStatusPill({ status }: { status: QrEventStatus }) {
  const cls =
    status === "active"
      ? "bg-sage-pale/60 text-sage"
      : "bg-ivory-warm text-ink-muted";
  const label = status === "active" ? "Active" : "Not yet active";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]",
        cls,
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {label}
    </span>
  );
}

function QrMiniButton({
  icon,
  label,
  onClick,
  active = false,
  primary = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] transition-colors",
        primary
          ? "border-ink bg-ink text-ivory hover:bg-ink-soft"
          : active
            ? "border-saffron/40 bg-gold-pale/30 text-ink"
            : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-saffron",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function PrintableCardPreview() {
  return (
    <section className="rounded-lg border border-border bg-white p-5">
      <header className="mb-4 flex items-baseline justify-between gap-3">
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Printable card preview
          </p>
          <h3 className="mt-1 font-serif text-[18px] text-ink">
            Matches your stationery visual identity
          </h3>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-saffron/40 hover:text-saffron"
        >
          <Printer size={13} strokeWidth={1.8} /> Download PDF
        </button>
      </header>

      <div className="mx-auto grid w-full max-w-sm gap-4 rounded-md border border-dashed border-gold/40 bg-ivory-warm/60 px-6 py-7 text-center">
        <p className="font-serif text-[17px] italic text-ink">
          Share your photos with us!
        </p>
        <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-md border border-ink bg-white">
          <QrCode size={88} strokeWidth={1.2} className="text-ink" />
        </div>
        <p
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Scan · Upload · We'll love you forever
        </p>
        <p className="font-serif text-[13px] text-saffron">#PriyaAndRaj</p>
      </div>
    </section>
  );
}

function UploadStream({
  event,
  contributors,
}: {
  event: QrEventRow;
  contributors: Contributor[];
}) {
  const sampleTiles = TILES.filter((t) => t.filter === "guest_uploads").slice(0, 6);
  return (
    <section className="rounded-lg border border-border bg-white p-5">
      <header className="mb-4 flex items-baseline justify-between gap-3">
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Guest uploads · {event.event}
          </p>
          <h3 className="mt-1 font-serif text-[18px] text-ink">
            {event.uploads} photos, {contributors.length} contributors
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <QrMiniButton icon={<Heart size={12} strokeWidth={1.8} />} label="Favourite" />
          <QrMiniButton icon={<Flag size={12} strokeWidth={1.8} />} label="Hide" />
        </div>
      </header>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {sampleTiles.concat(sampleTiles).slice(0, 6).map((t, i) => (
          <figure
            key={`${t.id}-${i}`}
            className="relative overflow-hidden rounded-md border border-border"
          >
            <div
              className={cn(
                "relative aspect-square bg-gradient-to-br",
                tintToGradient(t.tint),
              )}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon size={18} strokeWidth={1.3} className="text-ink-faint/50" />
              </div>
              {i % 3 === 0 && (
                <span className="absolute left-1.5 top-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/85 text-rose">
                  <Heart size={10} strokeWidth={2} fill="currentColor" />
                </span>
              )}
            </div>
          </figure>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border/60 pt-3">
        <span
          className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Uploaded by
        </span>
        {contributors.map((c, i) => (
          <Fragment key={c.name}>
            <span className="text-[11.5px] text-ink-muted">
              {c.name}{" "}
              <span
                className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                ({c.count})
              </span>
            </span>
            {i < contributors.length - 1 && (
              <span className="text-ink-faint">·</span>
            )}
          </Fragment>
        ))}
      </div>
    </section>
  );
}

function RadioRow({
  label,
  hint,
  checked,
  onClick,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-md border px-4 py-3 text-left transition-colors",
        checked
          ? "border-saffron/40 bg-gold-pale/20"
          : "border-border bg-white hover:border-saffron/30",
      )}
      aria-pressed={checked}
    >
      <span
        className={cn(
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
          checked
            ? "border-ink bg-ink text-ivory"
            : "border-border bg-white",
        )}
      >
        {checked && <span className="h-1.5 w-1.5 rounded-full bg-ivory" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-ink">{label}</p>
        {hint && (
          <p className="mt-0.5 text-[11.5px] text-ink-muted">{hint}</p>
        )}
      </div>
    </button>
  );
}

function CheckRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full items-start gap-3 rounded-md border px-4 py-3 text-left transition-colors",
        checked
          ? "border-saffron/40 bg-gold-pale/20"
          : "border-border bg-white hover:border-saffron/30",
      )}
      aria-pressed={checked}
    >
      <span
        className={cn(
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
          checked ? "border-ink bg-ink text-ivory" : "border-border bg-white",
        )}
      >
        {checked && <Check size={11} strokeWidth={3} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-ink">{label}</p>
        {hint && <p className="mt-0.5 text-[11.5px] text-ink-muted">{hint}</p>}
      </div>
    </button>
  );
}

// ── 3 · Albums & Events ─────────────────────────────────────────────────────

type AlbumStatus = "not_started" | "in_progress" | "awaiting" | "complete";

type Album = {
  id: string;
  title: string;
  description: string;
  status: AlbumStatus;
  progress?: { selected: number; total: number };
  autoBuild?: boolean;
  tint: Tile["tint"];
  actionLabel: string;
};

const ALBUMS: Album[] = [
  {
    id: "full",
    title: "The full wedding album",
    description: "All events, chronological — our best photos in a story arc.",
    status: "not_started",
    autoBuild: true,
    tint: "gold",
    actionLabel: "Start building",
  },
  {
    id: "mehendi",
    title: "Mehendi highlights",
    description: "Henna, laughter, flower petals. 32 of 142 selected.",
    status: "in_progress",
    progress: { selected: 32, total: 142 },
    tint: "sage",
    actionLabel: "Continue editing",
  },
  {
    id: "family",
    title: "Family portraits",
    description: "Every formal family combination from the shot list.",
    status: "awaiting",
    tint: "ivory",
    actionLabel: "Awaiting photographer",
  },
  {
    id: "sangeet",
    title: "Sangeet dance floor",
    description: "Guest uploads + professional. The energy of the night.",
    status: "in_progress",
    progress: { selected: 48, total: 287 },
    tint: "rose",
    actionLabel: "Continue editing",
  },
];

function AlbumsTab() {
  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Albums & events"
        title="Your albums"
        description="Build albums from your collection — for printing, sharing, or just remembering. AI can auto-build a starting draft that you review and edit."
        right={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-saffron/40 hover:text-saffron"
          >
            <Plus size={13} strokeWidth={1.8} /> New album
          </button>
        }
      />

      <section className="rounded-lg border border-border bg-white">
        <ul className="divide-y divide-border/60">
          {ALBUMS.map((a) => (
            <AlbumRow key={a.id} album={a} />
          ))}
        </ul>
      </section>

      <AutoBuildCallout />
    </div>
  );
}

function AlbumRow({ album }: { album: Album }) {
  const gradient = tintToGradient(album.tint);
  return (
    <li className="flex items-center gap-5 px-5 py-4">
      <div
        className={cn(
          "flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-gradient-to-br",
          gradient,
        )}
      >
        <Images size={22} strokeWidth={1.3} className="text-ink-faint/70" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <p className="truncate font-serif text-[16px] text-ink">{album.title}</p>
          {album.autoBuild && (
            <span className="inline-flex items-center gap-1 rounded-full border border-saffron/40 bg-gold-pale/30 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <Sparkles size={10} strokeWidth={1.8} />
              Auto-build
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-[12.5px] text-ink-muted">
          {album.description}
        </p>
        {album.progress && (
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1 w-40 overflow-hidden rounded-full bg-ivory">
              <div
                className="h-full bg-ink"
                style={{
                  width: `${
                    album.progress.total > 0
                      ? Math.round((album.progress.selected / album.progress.total) * 100)
                      : 0
                  }%`,
                }}
              />
            </div>
            <span
              className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {album.progress.selected} / {album.progress.total}
            </span>
          </div>
        )}
      </div>
      <AlbumStatusPill status={album.status} />
      <button
        type="button"
        className="shrink-0 text-[12px] text-ink-muted transition-colors hover:text-saffron"
      >
        {album.actionLabel} →
      </button>
    </li>
  );
}

function AlbumStatusPill({ status }: { status: AlbumStatus }) {
  const map: Record<AlbumStatus, { cls: string; label: string; dot: string }> = {
    not_started: {
      cls: "bg-ivory-warm text-ink-muted",
      label: "Not started",
      dot: "bg-ink-faint",
    },
    in_progress: {
      cls: "bg-gold-pale/60 text-gold",
      label: "In progress",
      dot: "bg-gold",
    },
    awaiting: {
      cls: "bg-rose-pale/60 text-rose",
      label: "Awaiting",
      dot: "bg-rose",
    },
    complete: {
      cls: "bg-sage-pale/60 text-sage",
      label: "Complete",
      dot: "bg-sage",
    },
  };
  const { cls, label, dot } = map[status];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-sm px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]",
        cls,
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} aria-hidden />
      {label}
    </span>
  );
}

function AutoBuildCallout() {
  return (
    <section className="flex items-start gap-3 rounded-lg border border-sage/40 bg-sage/5 px-5 py-4">
      <Sparkles size={16} strokeWidth={1.8} className="mt-[2px] shrink-0 text-sage" />
      <div className="flex-1">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          How auto-build works
        </p>
        <p className="mt-1 font-serif text-[15px] leading-snug text-ink">
          We select your best photos by quality, variety, and emotional arc — then arrange them into a narrative. You review, swap in favourites, and reorder.
        </p>
      </div>
    </section>
  );
}

// ── 4 · AI Keepsake ─────────────────────────────────────────────────────────

type Inclusion = { id: string; label: string; done: boolean };

const INCLUSIONS: Inclusion[] = [
  { id: "cover", label: "Cover with your names and wedding date", done: true },
  { id: "story", label: "\"How we met\" story (written by you or AI-assisted)", done: false },
  { id: "journey", label: "Planning journey highlights", done: false },
  { id: "events", label: "Event-by-event narrative with your best photos", done: false },
  { id: "rituals", label: "Ritual explanations (from Officiant workspace)", done: true },
  { id: "guests", label: "Guest messages and well-wishes", done: false },
  { id: "family", label: "Family tree visualization", done: false },
  { id: "thanks", label: "Thank-you note from the couple", done: false },
];

type KeepsakeFormat = {
  id: string;
  label: string;
  hint: string;
  price: string;
  selected: boolean;
};

const FORMATS: KeepsakeFormat[] = [
  { id: "pdf", label: "Digital PDF", hint: "Free with Ananya", price: "Included", selected: true },
  { id: "hardcover", label: "Printed hardcover book", hint: "Partner print service", price: "$75–$150", selected: false },
  { id: "flipbook", label: "Digital flipbook", hint: "Shareable web link", price: "$15", selected: false },
];

function KeepsakeTab() {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="AI keepsake"
        title="Your wedding story, written by us"
        description="A narrative keepsake that combines your photos, your planning journey, ritual meanings, and guest messages into something your family will treasure for generations."
      />

      <section className="flex items-start gap-3 rounded-lg border border-rose/30 bg-rose/5 px-5 py-4">
        <BookOpen size={16} strokeWidth={1.8} className="mt-[2px] shrink-0 text-rose" />
        <div className="flex-1">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Status
          </p>
          <p className="mt-1 font-serif text-[16px] leading-snug text-ink">
            Available after your wedding. We need enough photos and completed events to generate something meaningful.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-ivory-warm px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <Calendar size={11} strokeWidth={1.8} /> Unlocks Jun 15, 2026
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-ivory-warm px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <Layers size={11} strokeWidth={1.8} /> 2 of 8 sections ready
            </span>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-white p-5">
        <header className="mb-4">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            What it includes
          </p>
          <h3 className="mt-1 font-serif text-[18px] text-ink">
            Every keepsake covers these chapters
          </h3>
        </header>
        <ul className="grid gap-2 sm:grid-cols-2">
          {INCLUSIONS.map((i) => (
            <li
              key={i.id}
              className={cn(
                "flex items-start gap-2.5 rounded-md border px-3 py-2.5",
                i.done
                  ? "border-sage/40 bg-sage/5"
                  : "border-border bg-ivory-warm/40",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm",
                  i.done ? "bg-sage text-ivory" : "border border-border bg-white",
                )}
              >
                {i.done && <Check size={11} strokeWidth={3} />}
              </span>
              <span
                className={cn(
                  "text-[12.5px] leading-snug",
                  i.done ? "text-ink" : "text-ink-muted",
                )}
              >
                {i.label}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <KeepsakePreview />

      <section className="rounded-lg border border-border bg-white p-5">
        <header className="mb-3">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Format options
          </p>
          <h3 className="mt-1 font-serif text-[18px] text-ink">
            How you'll hold it
          </h3>
        </header>
        <div className="grid gap-3 sm:grid-cols-3">
          {FORMATS.map((f) => (
            <FormatCard key={f.id} format={f} />
          ))}
        </div>
      </section>
    </div>
  );
}

function KeepsakePreview() {
  return (
    <section className="rounded-lg border border-border bg-white p-5">
      <header className="mb-4">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Preview
        </p>
        <h3 className="mt-1 font-serif text-[18px] text-ink">
          A glimpse of the finished book
        </h3>
      </header>
      <div className="relative mx-auto flex max-w-lg items-center justify-center rounded-md border border-dashed border-gold/40 bg-gradient-to-br from-ivory-warm via-ivory-deep to-gold-pale/40 px-6 py-12">
        <div className="text-center">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Priya & Raj
          </p>
          <p className="mt-3 font-serif text-[28px] italic text-ink">
            The way we love
          </p>
          <p
            className="mt-4 font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Jun 13, 2026 · Udaipur
          </p>
        </div>
      </div>
      <p className="mt-3 text-center text-[11.5px] italic text-ink-muted">
        Full preview will appear here once you have enough photos and completed events.
      </p>
    </section>
  );
}

function FormatCard({ format }: { format: KeepsakeFormat }) {
  return (
    <label
      className={cn(
        "flex cursor-pointer flex-col gap-1 rounded-md border px-4 py-3 transition-colors",
        format.selected
          ? "border-saffron/50 bg-gold-pale/20"
          : "border-border bg-white hover:border-saffron/30",
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
            format.selected
              ? "border-ink bg-ink text-ivory"
              : "border-border bg-white",
          )}
        >
          {format.selected && <Check size={11} strokeWidth={3} />}
        </span>
        <span className="text-[13px] font-medium text-ink">{format.label}</span>
      </div>
      <p className="ml-6 text-[11.5px] text-ink-muted">{format.hint}</p>
      <p
        className="ml-6 mt-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-saffron"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {format.price}
      </p>
    </label>
  );
}

// ── 5 · Sharing ─────────────────────────────────────────────────────────────

function SharingTab() {
  const [gallery, setGallery] = useState({
    password: "",
    downloads: true,
  });

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Sharing"
        title="Share your photos"
        description="Send a curated gallery to your guests, or a personalized thank-you page with a photo of them from the wedding."
      />

      <section className="rounded-lg border border-border bg-white p-5">
        <header className="mb-4 flex items-baseline justify-between gap-3">
          <div>
            <p
              className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Shareable gallery
            </p>
            <h3 className="mt-1 font-serif text-[18px] text-ink">
              A beautiful, read-only gallery of your selected photos
            </h3>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-sm bg-sage-pale/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-sage"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-sage" aria-hidden />
            Live
          </span>
        </header>

        <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-ivory-warm/40 px-4 py-2.5">
          <Link2 size={14} strokeWidth={1.8} className="text-ink-faint" />
          <code className="flex-1 truncate font-mono text-[12px] text-ink"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ananya.co/priya-and-raj/gallery
          </code>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-2 py-1 text-[11px] text-ink-muted transition-colors hover:text-saffron"
          >
            <Copy size={12} strokeWidth={1.8} /> Copy
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span
              className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Password (optional)
            </span>
            <input
              type="text"
              value={gallery.password}
              onChange={(e) =>
                setGallery((g) => ({ ...g, password: e.target.value }))
              }
              placeholder="Leave blank for no password"
              className="rounded-md border border-border bg-white px-3 py-1.5 text-[12.5px] text-ink focus:border-saffron focus:outline-none"
            />
          </label>
          <CheckRow
            label="Allow guests to download"
            hint="Uncheck to keep downloads off; guests can still view."
            checked={gallery.downloads}
            onChange={(v) => setGallery((g) => ({ ...g, downloads: v }))}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <QrMiniButton icon={<Mail size={12} strokeWidth={1.8} />} label="Share via email" />
          <QrMiniButton icon={<MessageCircle size={12} strokeWidth={1.8} />} label="Share via WhatsApp" />
          <QrMiniButton icon={<Send size={12} strokeWidth={1.8} />} label="Announce to guests" primary />
        </div>
      </section>

      <section className="rounded-lg border border-rose/30 bg-rose/5 p-5">
        <header className="mb-3 flex items-baseline justify-between gap-3">
          <div>
            <p
              className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-rose"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <Users size={11} strokeWidth={1.8} />
              Thank-you gallery
            </p>
            <h3 className="mt-1 font-serif text-[18px] text-ink">
              Personalized photo + thank-you page for every guest
            </h3>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-sm bg-ivory-warm px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-ink-faint" aria-hidden />
            Not started
          </span>
        </header>
        <p className="text-[13px] leading-relaxed text-ink-muted">
          We'll match face-tagged photos to your guest list and generate a personal thank-you page for each person — their photo at the wedding + a note from the two of you.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <QrMiniButton
            icon={<Sparkles size={12} strokeWidth={1.8} />}
            label="Set up face tagging"
            primary
          />
          <span className="text-[11.5px] italic text-ink-muted">
            Available once face recognition has run on your wedding gallery.
          </span>
        </div>
      </section>
    </div>
  );
}

// ── 6 · Documents ───────────────────────────────────────────────────────────

type DeliverableStatus = "delivered" | "in_progress" | "awaiting";

type Deliverable = {
  id: string;
  label: string;
  kind: string;
  vendor: string;
  status: DeliverableStatus;
  link?: string;
  note?: string;
  icon: LucideIcon;
};

const DELIVERABLES: Deliverable[] = [
  {
    id: "raw",
    label: "Raw wedding gallery",
    kind: "Photography",
    vendor: "Saaj Photo & Co.",
    status: "in_progress",
    note: "Estimated delivery Jun 27",
    icon: Images,
  },
  {
    id: "edited",
    label: "Edited album — 200 favourites",
    kind: "Photography",
    vendor: "Saaj Photo & Co.",
    status: "awaiting",
    note: "6 weeks after raw delivery",
    icon: Album,
  },
  {
    id: "highlight",
    label: "Highlight reel (3–5 min)",
    kind: "Videography",
    vendor: "Lilac Films",
    status: "in_progress",
    note: "First draft Jul 10",
    icon: Film,
  },
  {
    id: "social",
    label: "Social media edits (15s + 60s)",
    kind: "Videography",
    vendor: "Lilac Films",
    status: "delivered",
    link: "lilacfilms.co/pr-instagram",
    icon: Share2,
  },
  {
    id: "raw_footage",
    label: "Raw footage archive",
    kind: "Videography",
    vendor: "Lilac Films",
    status: "awaiting",
    note: "Optional add-on — decide by Jul 1",
    icon: Film,
  },
];

function DocumentsTab() {
  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Documents"
        title="Professional deliverables"
        description="Links and status for everything your photographer and videographer will send. Gallery links and raw footage live here — not in the main Documents module."
        right={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-saffron/40 hover:text-saffron"
          >
            <Plus size={13} strokeWidth={1.8} /> Add deliverable
          </button>
        }
      />

      <section className="rounded-lg border border-border bg-white">
        <ul className="divide-y divide-border/60">
          {DELIVERABLES.map((d) => (
            <DeliverableRow key={d.id} deliverable={d} />
          ))}
        </ul>
      </section>
    </div>
  );
}

function DeliverableRow({ deliverable: d }: { deliverable: Deliverable }) {
  const Icon = d.icon;
  return (
    <li className="flex items-center gap-4 px-5 py-3.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-ivory-warm text-ink-muted">
        <Icon size={15} strokeWidth={1.5} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] text-ink">{d.label}</p>
        <p
          className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {d.kind} · {d.vendor}
          {d.note ? ` · ${d.note}` : ""}
        </p>
      </div>
      {d.link && (
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="inline-flex shrink-0 items-center gap-1 text-[12px] text-saffron hover:underline"
        >
          <Link2 size={12} strokeWidth={1.8} />
          Open
        </a>
      )}
      <DeliverableStatusPill status={d.status} />
    </li>
  );
}

function DeliverableStatusPill({ status }: { status: DeliverableStatus }) {
  const map: Record<DeliverableStatus, { cls: string; label: string; icon?: React.ReactNode }> = {
    delivered: {
      cls: "bg-sage-pale/60 text-sage",
      label: "Delivered",
      icon: <CheckCircle2 size={11} strokeWidth={2} />,
    },
    in_progress: {
      cls: "bg-gold-pale/60 text-gold",
      label: "In progress",
    },
    awaiting: {
      cls: "bg-ivory-warm text-ink-muted",
      label: "Awaiting",
    },
  };
  const { cls, label, icon } = map[status];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-sm px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]",
        cls,
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {icon}
      {label}
    </span>
  );
}
