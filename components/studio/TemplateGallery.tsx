"use client";

// ═══════════════════════════════════════════════════════════════════════════════════
//   TEMPLATE GALLERY — Ananya Studio → Website
// ═══════════════════════════════════════════════════════════════════════════════════
//
//   A full-screen surface that replaces the Website editor when the couple clicks
//   TEMPLATES. Lets them browse, preview, and apply a wedding-site template while
//   preserving their content and Brand Kit (colors, typography, monogram).
//
//   Design language: editorial, gallery-like, calm. Generous whitespace, hairline
//   dividers, subtle shadows — Kinfolk meets Vogue India. Template names are
//   evocative Indian locations (Jodhpur, Udaipur, Chettinad...).
//
//   Out of scope (noted inline with TODO):
//     - Actual template rendering engine (previews use palette + typography)
//     - Premium/paywall logic
//     - Custom template builder
// ═══════════════════════════════════════════════════════════════════════════════════

import { useMemo, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronDown,
  Search,
  Eye,
  X,
  Check,
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  Heart,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TemplateRenderer, hasLiveRenderer } from "@/components/studio/site-templates";
import { PRIYA_ARJUN_BRAND, PRIYA_ARJUN_CONTENT } from "@/lib/wedding-site-seed";
import type { RenderBrand, RenderDevice, SiteContent } from "@/types/wedding-site";
import {
  TEMPLATES,
  STYLE_FILTERS,
  StaffPicksRow,
  type WebsiteTemplate,
  type StyleFilter,
} from "@/components/studio/template-catalog";

export type { TemplateStyle, TemplatePage, WebsiteTemplate } from "@/components/studio/template-catalog";

// ═══════════════════════════════════════════════════════════════════════════════════
//   Types (local)
// ═══════════════════════════════════════════════════════════════════════════════════

type SortKey = "featured" | "newest" | "popular";
type DeviceKey = "desktop" | "tablet" | "mobile";

export interface TemplateGalleryProps {
  /** Template currently applied to the couple's site, if any */
  appliedTemplateId?: string | null;
  /** Called when the couple confirms a template switch */
  onApplyTemplate: (templateId: string) => void;
  /** Called when the user clicks the Back chevron to return to the editor */
  onBack?: () => void;
  /** Couple's display name, shown in live previews */
  coupleName?: { first: string; second: string };
  /** ISO wedding date, shown in live previews */
  weddingDate?: string;
  /** Couple's wedding hashtag, shown in live previews */
  hashtag?: string;
  /** Primary venue, shown in live previews */
  venue?: string;
  /** Full site content for live template renderers. Falls back to demo seed. */
  siteContent?: SiteContent;
  /** Brand cascade for live renderers. Falls back to demo brand. */
  brand?: RenderBrand;
}


function formatWeddingDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

// ═══════════════════════════════════════════════════════════════════════════════════
//   Main component
// ═══════════════════════════════════════════════════════════════════════════════════

export default function TemplateGallery({
  appliedTemplateId,
  onApplyTemplate,
  onBack,
  coupleName = { first: "Priya", second: "Arjun" },
  weddingDate = "2026-11-14",
  hashtag = "#PriyaMeetsArjun",
  venue = "Umaid Bhawan Palace, Jodhpur",
  siteContent = PRIYA_ARJUN_CONTENT,
  brand = PRIYA_ARJUN_BRAND,
}: TemplateGalleryProps) {
  const [styleFilter, setStyleFilter] = useState<StyleFilter>("All");
  const [sortKey, setSortKey] = useState<SortKey>("featured");
  const [sortOpen, setSortOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [pendingApplyId, setPendingApplyId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TEMPLATES.filter((t) => {
      if (styleFilter !== "All" && t.style !== styleFilter) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.style.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q) ||
        t.bestFor.some((b) => b.toLowerCase().includes(q))
      );
    });
  }, [styleFilter, query]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    if (sortKey === "popular") {
      copy.sort((a, b) => b.popularity - a.popularity);
    } else if (sortKey === "newest") {
      copy.sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew) || b.popularity - a.popularity);
    } else {
      // featured: applied first, then popular flag, then popularity
      copy.sort((a, b) => {
        if (a.id === appliedTemplateId) return -1;
        if (b.id === appliedTemplateId) return 1;
        const aFeatured = Number(!!a.isPopular) + Number(!!a.isNew);
        const bFeatured = Number(!!b.isPopular) + Number(!!b.isNew);
        if (bFeatured !== aFeatured) return bFeatured - aFeatured;
        return b.popularity - a.popularity;
      });
    }
    return copy;
  }, [filtered, sortKey, appliedTemplateId]);

  const previewing = previewingId ? TEMPLATES.find((t) => t.id === previewingId) : null;
  const detail = detailId ? TEMPLATES.find((t) => t.id === detailId) : null;
  const pendingApply = pendingApplyId ? TEMPLATES.find((t) => t.id === pendingApplyId) : null;

  function clearFilters() {
    setStyleFilter("All");
    setQuery("");
  }

  function handleConfirmApply() {
    if (!pendingApplyId) return;
    onApplyTemplate(pendingApplyId);
    setPendingApplyId(null);
    setPreviewingId(null);
    setDetailId(null);
  }

  return (
    <div className="min-h-screen bg-ivory text-ink">
      {/* ── Sticky header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-ivory/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] items-end justify-between gap-10 px-10 pb-6 pt-7">
          {/* Left: breadcrumb + title */}
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={onBack}
              className="group inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-muted transition-colors hover:text-ink"
            >
              <ChevronLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              Website
              <span className="mx-1 text-ink-faint">/</span>
              <span className="text-ink">Templates</span>
            </button>
            <h1 className="mt-3 font-serif text-[32px] leading-tight tracking-tight text-ink">
              Choose your template
            </h1>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-muted">
              Your content and Brand Kit carry over. Preview any template before applying.
            </p>
          </div>

          {/* Right: filter controls */}
          <div className="flex shrink-0 items-center gap-3">
            <SearchInput value={query} onChange={setQuery} />
            <SortDropdown value={sortKey} onChange={setSortKey} open={sortOpen} setOpen={setSortOpen} />
          </div>
        </div>

        {/* Style segmented control row */}
        <div className="mx-auto flex max-w-[1440px] items-center gap-2 px-10 pb-5">
          <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
            <SlidersHorizontal className="mr-1.5 inline h-3 w-3" aria-hidden />
            Style
          </span>
          {STYLE_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStyleFilter(s)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-all",
                styleFilter === s
                  ? "border-ink bg-ink text-ivory"
                  : "border-ink/10 bg-card text-ink-muted hover:border-ink/25 hover:text-ink"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </header>

      {/* ── Gallery grid ──────────────────────────────────────────── */}
      <main className="mx-auto max-w-[1440px] px-10 pb-24 pt-10">
        {styleFilter === "All" && query.trim() === "" && sorted.length > 0 && (
          <StaffPicksRow
            appliedTemplateId={appliedTemplateId}
            onPreview={(id) => setPreviewingId(id)}
            onDetails={(id) => setDetailId(id)}
          />
        )}
        {sorted.length === 0 ? (
          <EmptyState onClear={clearFilters} />
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {sorted.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                isApplied={t.id === appliedTemplateId}
                isHovered={hoveredId === t.id}
                onHoverStart={() => setHoveredId(t.id)}
                onHoverEnd={() => setHoveredId(null)}
                onPreview={() => setPreviewingId(t.id)}
                onDetails={() => setDetailId(t.id)}
                coupleName={coupleName}
                weddingDate={weddingDate}
                siteContent={siteContent}
                brand={brand}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Detail drawer ─────────────────────────────────────────── */}
      <AnimatePresence>
        {detail && (
          <DetailDrawer
            key="detail"
            template={detail}
            isApplied={detail.id === appliedTemplateId}
            onClose={() => setDetailId(null)}
            onPreview={() => {
              setPreviewingId(detail.id);
              setDetailId(null);
            }}
            onApply={() => setPendingApplyId(detail.id)}
            coupleName={coupleName}
            weddingDate={weddingDate}
            siteContent={siteContent}
            brand={brand}
          />
        )}
      </AnimatePresence>

      {/* ── Full-screen preview ───────────────────────────────────── */}
      <AnimatePresence>
        {previewing && (
          <PreviewOverlay
            key="preview"
            template={previewing}
            isApplied={previewing.id === appliedTemplateId}
            onBack={() => setPreviewingId(null)}
            onApply={() => setPendingApplyId(previewing.id)}
            coupleName={coupleName}
            weddingDate={weddingDate}
            hashtag={hashtag}
            venue={venue}
            siteContent={siteContent}
            brand={brand}
          />
        )}
      </AnimatePresence>

      {/* ── Apply confirmation modal ──────────────────────────────── */}
      <AnimatePresence>
        {pendingApply && (
          <ApplyModal
            key="confirm"
            template={pendingApply}
            onCancel={() => setPendingApplyId(null)}
            onConfirm={handleConfirmApply}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
//   Header primitives
// ═══════════════════════════════════════════════════════════════════════════════════

function SearchInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="group relative flex h-9 w-56 items-center">
      <Search className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-ink-faint transition-colors group-focus-within:text-ink" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search templates"
        className="h-full w-full rounded-full border border-ink/10 bg-card pl-9 pr-3 font-sans text-[13px] text-ink placeholder:text-ink-faint focus:border-ink/30 focus:outline-none"
      />
    </label>
  );
}

function SortDropdown({
  value,
  onChange,
  open,
  setOpen,
}: {
  value: SortKey;
  onChange: (v: SortKey) => void;
  open: boolean;
  setOpen: (o: boolean) => void;
}) {
  const options: { key: SortKey; label: string }[] = [
    { key: "featured", label: "Featured" },
    { key: "newest", label: "Newest" },
    { key: "popular", label: "Most Popular" },
  ];
  const current = options.find((o) => o.key === value) ?? options[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-full border px-4 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors",
          open
            ? "border-ink bg-ink text-ivory"
            : "border-ink/10 bg-card text-ink hover:border-ink/25"
        )}
      >
        <span className="text-ink-muted normal-case tracking-normal font-sans text-[11px]" aria-hidden>
          Sort
        </span>
        <span>{current.label}</span>
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden />
            <motion.ul
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-lg border border-ink/10 bg-card shadow-lg"
            >
              {options.map((o) => (
                <li key={o.key}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(o.key);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between px-4 py-2.5 text-left font-sans text-[13px] transition-colors hover:bg-ivory-warm",
                      o.key === value ? "text-ink" : "text-ink-muted"
                    )}
                  >
                    {o.label}
                    {o.key === value && <Check className="h-3.5 w-3.5 text-gold" />}
                  </button>
                </li>
              ))}
            </motion.ul>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
//   Template card
// ═══════════════════════════════════════════════════════════════════════════════════

function TemplateCard({
  template,
  isApplied,
  isHovered,
  onHoverStart,
  onHoverEnd,
  onPreview,
  onDetails,
  coupleName,
  weddingDate,
  siteContent,
  brand,
}: {
  template: WebsiteTemplate;
  isApplied: boolean;
  isHovered: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onPreview: () => void;
  onDetails: () => void;
  coupleName: { first: string; second: string };
  weddingDate: string;
  siteContent: SiteContent;
  brand: RenderBrand;
}) {
  const live = hasLiveRenderer(template.id);
  return (
    <motion.article
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      className={cn(
        "group relative rounded-xl bg-card p-4 transition-all duration-200",
        "border",
        isApplied
          ? "border-gold/70 shadow-[0_1px_0_0_rgba(184,134,11,0.15),0_10px_30px_-12px_rgba(26,26,26,0.18)]"
          : "border-ink/8 shadow-[0_1px_0_0_rgba(26,26,26,0.03),0_4px_14px_-8px_rgba(26,26,26,0.10)] hover:border-ink/20"
      )}
    >
      {/* APPLIED ribbon */}
      {isApplied && (
        <div className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-gold px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-ivory shadow-sm">
          <Check className="h-3 w-3" />
          Applied
        </div>
      )}

      {/* Hero preview — 16:10 */}
      <button
        type="button"
        onClick={onPreview}
        aria-label={`Preview ${template.name} template`}
        className="relative block w-full overflow-hidden rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
      >
        <motion.div
          animate={{ scale: isHovered ? 1.02 : 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative aspect-[16/10] w-full overflow-hidden"
          style={{ background: template.pagePreviews[0] }}
        >
          {live ? (
            <TemplateRenderer
              templateId={template.id}
              content={siteContent}
              brand={brand}
              device="desktop"
              mode="preview"
            />
          ) : (
            // Stand-in until this template gets a live renderer in
            // components/studio/site-templates/.
            <HeroPreview template={template} coupleName={coupleName} weddingDate={weddingDate} />
          )}

          {/* Hover overlay with eye icon */}
          <motion.div
            initial={false}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute inset-0 flex items-start justify-end bg-ink/5 p-3"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-ivory/95 text-ink shadow-md">
              <Eye className="h-4 w-4" />
            </span>
          </motion.div>

          {/* Corner tags */}
          <div className="absolute bottom-3 right-3 flex gap-1.5">
            {template.isNew && (
              <span className="inline-flex items-center gap-1 rounded-full bg-ivory/95 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-ink">
                <Sparkles className="h-2.5 w-2.5" /> New
              </span>
            )}
            {template.isPopular && (
              <span className="inline-flex items-center gap-1 rounded-full bg-ivory/95 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-ink">
                <Heart className="h-2.5 w-2.5" /> Loved
              </span>
            )}
          </div>
        </motion.div>
      </button>

      {/* Thumbnail strip — 4 squares */}
      <div className="mt-3 grid grid-cols-4 gap-2">
        <PaletteThumb palette={template.palette} />
        {[1, 2, 3].map((i) => (
          <PagePreviewThumb key={i} label={["Story", "Events", "RSVP"][i - 1]!} gradient={template.pagePreviews[i]!} />
        ))}
      </div>

      {/* Label + name */}
      <div className="mt-5">
        <div className="font-serif italic text-[13px] text-ink/60">Wedding Website Template</div>
        <h3 className="mt-0.5 font-serif text-[20px] leading-tight text-ink">{template.name}</h3>
        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">{template.tagline}</p>
      </div>

      {/* Details link */}
      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onDetails}
          className="group/det inline-flex items-center font-mono text-[10px] uppercase tracking-[0.24em] text-ink transition-colors"
        >
          <span className="border-b border-ink/40 pb-0.5 group-hover/det:border-ink">Details</span>
        </button>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">{template.style}</span>
      </div>
    </motion.article>
  );
}

function PaletteThumb({ palette }: { palette: WebsiteTemplate["palette"] }) {
  return (
    <div className="group/thumb relative aspect-square overflow-hidden rounded-md border border-ink/10">
      <div className="flex h-full w-full flex-col">
        {palette.map((c, i) => (
          <div key={i} className="flex-1" style={{ background: c }} />
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/60 to-transparent p-1 opacity-0 transition-opacity group-hover/thumb:opacity-100">
        <div className="text-center font-mono text-[8px] uppercase tracking-[0.2em] text-ivory">Palette</div>
      </div>
    </div>
  );
}

function PagePreviewThumb({ label, gradient }: { label: string; gradient: string }) {
  return (
    <div className="group/thumb relative aspect-square overflow-hidden rounded-md border border-ink/10">
      <div className="h-full w-full" style={{ background: gradient }} />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/60 to-transparent p-1 opacity-0 transition-opacity group-hover/thumb:opacity-100">
        <div className="text-center font-mono text-[8px] uppercase tracking-[0.2em] text-ivory">{label}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
//   Hero preview (used in card + overlay + drawer)
//
//   TODO: replace with live template renderer. For now we render a mini layout
//   that uses the template's palette + typography hints so the preview feels
//   specific to each template rather than a single stock gradient.
// ═══════════════════════════════════════════════════════════════════════════════════

function HeroPreview({
  template,
  coupleName,
  weddingDate,
  scale = 1,
}: {
  template: WebsiteTemplate;
  coupleName: { first: string; second: string };
  weddingDate: string;
  scale?: number;
}) {
  const [bg, , accent, , inkColor] = template.palette;
  const isDarkBg = isLight(bg) === false;
  const textColor = isDarkBg ? "#FAF7F2" : inkColor;
  const subColor = isDarkBg ? "rgba(250,247,242,0.7)" : "rgba(26,26,26,0.6)";
  const date = formatWeddingDate(weddingDate);

  const rootStyle: CSSProperties = {
    fontSize: `${scale}em`,
    color: textColor,
  };

  const commonEyebrow = (
    <div
      className="font-mono uppercase tracking-[0.28em]"
      style={{ color: subColor, fontSize: `${0.55 * scale}em` }}
    >
      {template.tagline}
    </div>
  );

  const names = (
    <div
      className={cn("tracking-tight", template.typography.displayClass ?? "font-serif")}
      style={{ fontSize: `${2.6 * scale}em`, lineHeight: 1.02 }}
    >
      {coupleName.first}
      <span style={{ color: accent, fontStyle: "italic" }}> & </span>
      {coupleName.second}
    </div>
  );

  const meta = (
    <div
      className="font-sans"
      style={{ color: subColor, fontSize: `${0.7 * scale}em`, letterSpacing: "0.02em" }}
    >
      {date}
    </div>
  );

  // Decorative hairline accent (consistent editorial mark)
  const hairline = (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        width: `${2 * scale}em`,
        height: 1,
        background: accent,
        opacity: 0.8,
      }}
    />
  );

  if (template.heroLayout === "left-aligned") {
    return (
      <div className="absolute inset-0 flex flex-col justify-end p-[6%]" style={rootStyle}>
        {commonEyebrow}
        <div className="mt-auto" />
        {names}
        <div className="mt-2 flex items-center gap-3">
          {hairline}
          {meta}
        </div>
      </div>
    );
  }

  if (template.heroLayout === "split") {
    return (
      <div className="absolute inset-0 grid grid-cols-[1fr_auto] items-center gap-[4%] p-[6%]" style={rootStyle}>
        <div>
          {commonEyebrow}
          <div className="mt-[4%]">{names}</div>
          <div className="mt-3">{meta}</div>
        </div>
        <div
          className="h-[70%] w-px"
          style={{ background: `${accent}66` }}
          aria-hidden
        />
      </div>
    );
  }

  if (template.heroLayout === "editorial-stack") {
    return (
      <div className="absolute inset-0 flex flex-col p-[6%]" style={rootStyle}>
        {commonEyebrow}
        <div className="mt-auto">{names}</div>
        <div className="mt-3 flex items-center gap-3">
          {hairline}
          {meta}
        </div>
      </div>
    );
  }

  // centered
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-[6%] text-center" style={rootStyle}>
      {commonEyebrow}
      <div className="mt-[3%]">{names}</div>
      <div className="mt-3 flex items-center gap-3">
        {hairline}
        {meta}
        {hairline}
      </div>
    </div>
  );
}

/** Simple relative-luminance check so preview text picks a legible color. */
function isLight(hex: string): boolean {
  const h = hex.replace("#", "");
  if (h.length !== 6) return true;
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return L > 0.6;
}

// ═══════════════════════════════════════════════════════════════════════════════════
//   Detail drawer (right side, 420px)
// ═══════════════════════════════════════════════════════════════════════════════════

function DetailDrawer({
  template,
  isApplied,
  onClose,
  onPreview,
  onApply,
  coupleName,
  weddingDate,
  siteContent,
  brand,
}: {
  template: WebsiteTemplate;
  isApplied: boolean;
  onClose: () => void;
  onPreview: () => void;
  onApply: () => void;
  coupleName: { first: string; second: string };
  weddingDate: string;
  siteContent: SiteContent;
  brand: RenderBrand;
}) {
  const live = hasLiveRenderer(template.id);
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-[2px]"
        aria-hidden
      />
      <motion.aside
        initial={{ x: 420 }}
        animate={{ x: 0 }}
        exit={{ x: 420 }}
        transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
        role="dialog"
        aria-label={`${template.name} details`}
        className="fixed right-0 top-0 z-50 flex h-full w-[420px] max-w-full flex-col bg-ivory shadow-2xl"
      >
        {/* Drawer header */}
        <div className="flex items-start justify-between border-b border-ink/10 px-6 py-5">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-muted">
              {template.style}
            </div>
            <div className="mt-1 font-serif italic text-[13px] text-ink/60">Wedding Website Template</div>
            <h2 className="mt-0.5 font-serif text-[24px] leading-tight text-ink">{template.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-ivory-warm hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drawer body (scrollable) */}
        <div className="panel-scroll flex-1 overflow-y-auto px-6 pb-6 pt-5">
          {/* Larger hero */}
          <div
            className="relative aspect-[16/10] w-full overflow-hidden rounded-lg"
            style={{ background: template.pagePreviews[0] }}
          >
            {live ? (
              <TemplateRenderer
                templateId={template.id}
                content={siteContent}
                brand={brand}
                device="desktop"
                mode="preview"
              />
            ) : (
              <HeroPreview template={template} coupleName={coupleName} weddingDate={weddingDate} scale={0.8} />
            )}
          </div>

          {/* Description */}
          <p className="mt-5 text-[14px] leading-relaxed text-ink/80">{template.description}</p>

          {/* Pages */}
          <Section title="Included pages">
            <div className="flex flex-wrap gap-1.5">
              {template.pages.map((p) => (
                <span
                  key={p}
                  className="rounded-sm bg-ivory-warm px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft"
                >
                  {p}
                </span>
              ))}
            </div>
          </Section>

          {/* Best for */}
          <Section title="Works best for">
            <ul className="space-y-1.5">
              {template.bestFor.map((b) => (
                <li key={b} className="flex items-start gap-2 text-[13px] text-ink/80">
                  <span className="mt-[7px] h-1 w-1 rounded-full bg-gold" />
                  {b}
                </li>
              ))}
            </ul>
          </Section>

          {/* Typography pairing */}
          <Section title="Typography pairing">
            <div className="rounded-lg border border-ink/10 bg-card p-4">
              <div className={cn("text-[28px] leading-tight text-ink", template.typography.displayClass ?? "font-serif")}>
                Aa
              </div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted">
                Display · {template.typography.display}
              </div>
              <div className="mt-4 h-px bg-ink/10" />
              <div className={cn("mt-4 text-[14px] leading-relaxed text-ink", template.typography.bodyClass ?? "font-sans")}>
                The quick marigold strung across a jharokha arch.
              </div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted">
                Body · {template.typography.body}
              </div>
            </div>
          </Section>

          {/* Palette */}
          <Section title="Palette">
            <div className="flex gap-2">
              {template.palette.map((c, i) => (
                <div key={i} className="flex-1">
                  <div
                    className="aspect-square w-full rounded-md border border-ink/10"
                    style={{ background: c }}
                  />
                  <div className="mt-1 text-center font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">
                    {c.replace("#", "")}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* Drawer footer */}
        <div className="flex gap-2 border-t border-ink/10 bg-ivory px-6 py-4">
          <button
            type="button"
            onClick={onPreview}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-ink/15 bg-card px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink transition-colors hover:border-ink/40"
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </button>
          <button
            type="button"
            onClick={onApply}
            disabled={isApplied}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] transition-colors",
              isApplied
                ? "cursor-default bg-ink/10 text-ink-muted"
                : "bg-ink text-ivory hover:bg-ink-soft"
            )}
          >
            {isApplied ? (
              <>
                <Check className="h-3.5 w-3.5" /> Applied
              </>
            ) : (
              <>Apply template</>
            )}
          </button>
        </div>
      </motion.aside>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-muted">{title}</h3>
      {children}
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
//   Full-screen preview overlay
// ═══════════════════════════════════════════════════════════════════════════════════

const DEVICE_SIZES: Record<DeviceKey, { width: number; label: string }> = {
  desktop: { width: 1280, label: "Desktop" },
  tablet: { width: 834, label: "Tablet" },
  mobile: { width: 390, label: "Mobile" },
};

function PreviewOverlay({
  template,
  isApplied,
  onBack,
  onApply,
  coupleName,
  weddingDate,
  hashtag,
  venue,
  siteContent,
  brand,
}: {
  template: WebsiteTemplate;
  isApplied: boolean;
  onBack: () => void;
  onApply: () => void;
  coupleName: { first: string; second: string };
  weddingDate: string;
  hashtag: string;
  venue: string;
  siteContent: SiteContent;
  brand: RenderBrand;
}) {
  const [device, setDevice] = useState<DeviceKey>("desktop");
  const live = hasLiveRenderer(template.id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex flex-col bg-ivory"
      role="dialog"
      aria-label={`${template.name} preview`}
    >
      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-ink/10 bg-ivory/95 px-6 py-3 backdrop-blur">
        <button
          type="button"
          onClick={onBack}
          className="group inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-muted transition-colors hover:text-ink"
        >
          <ChevronLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Back to gallery
        </button>

        {/* Device toggle */}
        <div className="flex items-center gap-1 rounded-full border border-ink/10 bg-card p-1">
          {(Object.keys(DEVICE_SIZES) as DeviceKey[]).map((k) => {
            const Icon = k === "desktop" ? Monitor : k === "tablet" ? Tablet : Smartphone;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setDevice(k)}
                aria-label={DEVICE_SIZES[k].label}
                className={cn(
                  "inline-flex h-7 items-center gap-1.5 rounded-full px-3 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors",
                  device === k ? "bg-ink text-ivory" : "text-ink-muted hover:text-ink"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{DEVICE_SIZES[k].label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden font-serif text-[15px] text-ink sm:block">
            {template.name}
          </div>
          <button
            type="button"
            onClick={onApply}
            disabled={isApplied}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-5 py-2 font-mono text-[10px] uppercase tracking-[0.22em] transition-colors",
              isApplied ? "cursor-default bg-ink/10 text-ink-muted" : "bg-ink text-ivory hover:bg-ink-soft"
            )}
          >
            {isApplied ? (
              <>
                <Check className="h-3.5 w-3.5" /> Currently applied
              </>
            ) : (
              <>Apply this template</>
            )}
          </button>
        </div>
      </div>

      {/* Device frame */}
      <div className="flex-1 overflow-y-auto bg-ivory-warm/40 px-6 py-8">
        <motion.div
          key={device}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          style={{ maxWidth: DEVICE_SIZES[device].width }}
          className="mx-auto overflow-hidden rounded-xl border border-ink/10 bg-card shadow-xl"
        >
          {live ? (
            <TemplateRenderer
              templateId={template.id}
              content={siteContent}
              brand={brand}
              device={device as RenderDevice}
              mode="showcase"
            />
          ) : (
            <PreviewSite
              template={template}
              coupleName={coupleName}
              weddingDate={weddingDate}
              hashtag={hashtag}
              venue={venue}
              device={device}
            />
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

/**
 * PreviewSite renders a fleshed-out mock of the template across its key sections
 * (hero, story, events, rsvp) using palette + typography.
 *
 * TODO: replace with live template renderer — when the real rendering engine
 * exists, swap this for <TemplateRenderer template={template} content={content}/>.
 */
function PreviewSite({
  template,
  coupleName,
  weddingDate,
  hashtag,
  venue,
  device,
}: {
  template: WebsiteTemplate;
  coupleName: { first: string; second: string };
  weddingDate: string;
  hashtag: string;
  venue: string;
  device: DeviceKey;
}) {
  const [, , accent, surface, ink] = template.palette;
  const date = formatWeddingDate(weddingDate);
  const compact = device === "mobile";

  return (
    <div className="overflow-hidden" style={{ background: surface, color: ink }}>
      {/* Hero */}
      <div className="relative" style={{ background: template.pagePreviews[0], aspectRatio: compact ? "3 / 4" : "16 / 9" }}>
        <HeroPreview template={template} coupleName={coupleName} weddingDate={weddingDate} scale={compact ? 0.9 : 1.3} />
      </div>

      {/* Nav bar */}
      <div
        className="flex items-center justify-between px-8 py-4"
        style={{ borderBottom: `1px solid ${accent}22`, background: surface }}
      >
        <div className={cn("text-[14px]", template.typography.displayClass ?? "font-serif")} style={{ color: ink }}>
          {coupleName.first[0]}
          <span style={{ color: accent }}>&</span>
          {coupleName.second[0]}
        </div>
        <div className="flex gap-5 font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: ink, opacity: 0.7 }}>
          {template.pages.slice(0, 5).map((p) => (
            <span key={p}>{p}</span>
          ))}
        </div>
      </div>

      {/* Our Story */}
      <section className={cn("px-8 py-14", compact && "px-6 py-10")} style={{ background: surface }}>
        <div
          className="font-mono uppercase tracking-[0.28em]"
          style={{ color: accent, fontSize: 11 }}
        >
          Our Story
        </div>
        <h2
          className={cn("mt-3 tracking-tight", template.typography.displayClass ?? "font-serif")}
          style={{ fontSize: compact ? 28 : 44, lineHeight: 1.1, color: ink }}
        >
          A meeting, a monsoon, a yes.
        </h2>
        <div className="mt-6 grid gap-8 md:grid-cols-2">
          <p className={cn("leading-relaxed", template.typography.bodyClass ?? "font-sans")} style={{ color: ink, opacity: 0.8, fontSize: 15 }}>
            We met at a Diwali dinner neither of us wanted to go to. {coupleName.second} was home from Bangalore for a week;
            {" "}{coupleName.first} had just finished her thesis. The conversation started with biryani and did not end
            for four years.
          </p>
          <p className={cn("leading-relaxed", template.typography.bodyClass ?? "font-sans")} style={{ color: ink, opacity: 0.8, fontSize: 15 }}>
            In the monsoon of 2025, on a rooftop in Jodhpur, {coupleName.second} asked. {coupleName.first} said yes
            before he finished the sentence. We would love for you to be there when we say it a second time — in front
            of the people we love most.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-8 h-px" style={{ background: `${accent}33` }} />

      {/* Events */}
      <section className={cn("px-8 py-14", compact && "px-6 py-10")} style={{ background: surface }}>
        <div className="font-mono uppercase tracking-[0.28em]" style={{ color: accent, fontSize: 11 }}>
          Events
        </div>
        <h2 className={cn("mt-3 tracking-tight", template.typography.displayClass ?? "font-serif")} style={{ fontSize: compact ? 26 : 40, lineHeight: 1.1, color: ink }}>
          Three days. One ceremony. A wedding.
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            { name: "Sangeet", time: "Nov 12 · Evening", place: "Zenana Mahal" },
            { name: "Mehndi", time: "Nov 13 · Afternoon", place: "Courtyard Garden" },
            { name: "Wedding", time: "Nov 14 · Sunset", place: "Umaid Bhawan" },
          ].map((ev) => (
            <div key={ev.name} className="rounded-lg p-5" style={{ background: `${accent}11`, border: `1px solid ${accent}33` }}>
              <div className={cn(template.typography.displayClass ?? "font-serif")} style={{ fontSize: 22, color: ink }}>
                {ev.name}
              </div>
              <div className="mt-1 font-mono uppercase tracking-[0.2em]" style={{ fontSize: 10, color: ink, opacity: 0.6 }}>
                {ev.time}
              </div>
              <div className={cn("mt-3", template.typography.bodyClass ?? "font-sans")} style={{ fontSize: 13, color: ink, opacity: 0.8 }}>
                {ev.place}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* RSVP band */}
      <section className="relative px-8 py-16 text-center" style={{ background: template.pagePreviews[2] }}>
        <div className="font-mono uppercase tracking-[0.28em]" style={{ color: isLight(accent) ? ink : "#FAF7F2", fontSize: 11, opacity: 0.7 }}>
          RSVP
        </div>
        <h2 className={cn("mt-3 tracking-tight", template.typography.displayClass ?? "font-serif")} style={{ fontSize: compact ? 26 : 40, color: isLight(template.palette[0]) ? ink : "#FAF7F2" }}>
          We hope you&apos;ll join us.
        </h2>
        <p className="mt-3 font-mono uppercase tracking-[0.22em]" style={{ fontSize: 11, color: isLight(template.palette[0]) ? ink : "#FAF7F2", opacity: 0.7 }}>
          {date} · {venue}
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 font-mono uppercase tracking-[0.24em]" style={{ background: accent, color: "#FAF7F2", fontSize: 11 }}>
          Reply by Oct 10
        </div>
        <div className="mt-5 font-mono uppercase tracking-[0.24em]" style={{ fontSize: 10, color: isLight(template.palette[0]) ? ink : "#FAF7F2", opacity: 0.6 }}>
          {hashtag}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-6 text-center font-mono uppercase tracking-[0.22em]" style={{ background: surface, color: ink, fontSize: 10, opacity: 0.5 }}>
        Template · {template.name} — rendered with your Brand Kit
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
//   Apply confirmation modal
// ═══════════════════════════════════════════════════════════════════════════════════

function ApplyModal({
  template,
  onCancel,
  onConfirm,
}: {
  template: WebsiteTemplate;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onCancel}
        className="fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm"
        aria-hidden
      />
      <div className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="pointer-events-auto w-full max-w-md overflow-hidden rounded-xl bg-ivory shadow-2xl"
          role="alertdialog"
          aria-labelledby="apply-title"
        >
          <div className="relative aspect-[16/7] w-full" style={{ background: template.pagePreviews[0] }}>
            <HeroPreview
              template={template}
              coupleName={{ first: "Priya", second: "Arjun" }}
              weddingDate="2026-11-14"
              scale={0.55}
            />
          </div>
          <div className="p-7">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-muted">Switch template</div>
            <h2 id="apply-title" className="mt-1 font-serif text-[22px] leading-snug text-ink">
              Switch to {template.name}?
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-ink/75">
              Your content stays, but any per-page design overrides will reset. Your Brand Kit auto-applies
              — colors, typography, and monogram carry across.
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center justify-center rounded-full border border-ink/15 bg-card px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink transition-colors hover:border-ink/35"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                autoFocus
                className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ivory transition-colors hover:bg-ink-soft"
              >
                Switch template
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
//   Empty state
// ═══════════════════════════════════════════════════════════════════════════════════

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
      {/* Subtle line-art illustration — an empty picture frame */}
      <svg
        width="96"
        height="96"
        viewBox="0 0 96 96"
        fill="none"
        aria-hidden
        className="text-ink/25"
      >
        <rect x="16" y="16" width="64" height="64" rx="4" stroke="currentColor" strokeWidth="1.25" />
        <rect x="22" y="22" width="52" height="52" rx="2" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="33" cy="33" r="3" stroke="currentColor" strokeWidth="1" />
        <path d="M22 66 L40 48 L52 58 L64 46 L74 54" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <h3 className="mt-5 font-serif text-[22px] text-ink">No templates match</h3>
      <p className="mt-1.5 text-[13.5px] text-ink-muted">
        Try a different style, or clear your filters to see everything.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-5 font-mono text-[10px] uppercase tracking-[0.24em] text-ink"
      >
        <span className="border-b border-ink/40 pb-0.5 hover:border-ink">Clear filters</span>
      </button>
    </div>
  );
}
