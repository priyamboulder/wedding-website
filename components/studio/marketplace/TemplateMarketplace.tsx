"use client";

// ══════════════════════════════════════════════════════════════════════════
//   TEMPLATE MARKETPLACE — the grid a couple lands on when they click any
//   Studio surface.
//
//   Receives the full surface catalog as a prop (the server page hydrates
//   it from `design_templates`) and filters client-side. Selecting a
//   template clones its canvas into a fresh `user_design` row via
//   useUserDesignsStore, then routes to /studio/editor/[designId].
// ══════════════════════════════════════════════════════════════════════════

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import {
  Sparkles,
  Plus,
  Search,
  X,
  Eye,
  Flame,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TopNav } from "@/components/shell/TopNav";
import { useAuthStore } from "@/stores/auth-store";
import { useUserDesignsStore } from "@/stores/user-designs-store";
import type { StarterTemplate } from "@/lib/studio/starter-templates";
import {
  CULTURAL_STYLES,
  REGIONAL_STYLES,
  SORT_OPTIONS,
  PRICE_FILTERS,
  type SortId,
  type PriceFilterId,
  type SurfaceMeta,
} from "@/lib/studio/surface-meta";
import type { SurfaceType } from "@/components/studio/canvas-editor/CanvasEditor";

interface Props {
  surfaceType: SurfaceType;
  meta: SurfaceMeta;
  templates: StarterTemplate[];
}

export function TemplateMarketplace({ surfaceType, meta, templates }: Props) {
  const router = useRouter();
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const createDesign = useUserDesignsStore((s) => s.createDesign);

  const [q, setQ] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>(meta.categories[0] ?? "All");
  const [cultural, setCultural] = useState<string>("all");
  const [regional, setRegional] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortId>("trending");
  const [priceFilter, setPriceFilter] = useState<PriceFilterId>("all");
  const [previewTemplate, setPreviewTemplate] = useState<StarterTemplate | null>(null);
  const [purchaseTemplate, setPurchaseTemplate] = useState<StarterTemplate | null>(null);
  const [visibleCount, setVisibleCount] = useState(24);

  // ── Client-side filter + sort ──────────────────────────────────────────

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    const rows = templates.filter((t) => {
      if (cultural !== "all" && t.cultural_style !== cultural) return false;
      if (regional !== "all" && t.regional_style !== regional) return false;
      if (activeCategory !== "All") {
        const tag = activeCategory.toLowerCase().replace(/\s+/g, "_");
        const hit = t.category_tags.some((c) => c.toLowerCase() === tag)
                 || t.tags.some((c) => c.toLowerCase() === tag);
        if (!hit) return false;
      }
      if (priceFilter === "free"   && t.price_cents !== 0) return false;
      if (priceFilter === "under2" && t.price_cents >= 200) return false;
      if (priceFilter === "under3" && t.price_cents >= 300) return false;
      if (qq && !t.name.toLowerCase().includes(qq) &&
         !t.description.toLowerCase().includes(qq) &&
         !t.tags.some((tg) => tg.toLowerCase().includes(qq))) return false;
      return true;
    });
    const sorted = [...rows].sort((a, b) => {
      if (sortBy === "trending")   return Number(b.is_trending) - Number(a.is_trending) || b.download_count - a.download_count;
      if (sortBy === "newest")     return (b.created_at > a.created_at ? 1 : -1);
      if (sortBy === "popular")    return b.download_count - a.download_count;
      if (sortBy === "price_asc")  return a.price_cents - b.price_cents;
      if (sortBy === "price_desc") return b.price_cents - a.price_cents;
      return 0;
    });
    return sorted;
  }, [templates, q, activeCategory, cultural, regional, sortBy, priceFilter]);

  const trending = useMemo(() => templates.filter((t) => t.is_trending).slice(0, 10), [templates]);

  // ── Actions ─────────────────────────────────────────────────────────────

  function startFromScratch() {
    const design = createDesign(
      {
        surface_type: surfaceType,
        name: `Untitled ${meta.title.slice(0, -1)}`,
        canvas_data: { version: "5.3.0", background: "#FFFFFF", objects: [] },
        canvas_width: meta.defaultWidth,
        canvas_height: meta.defaultHeight,
        template_id: null,
      },
      userId,
    );
    router.push(`/studio/editor/${design.id}`);
  }

  function startWithAI() {
    router.push(`/studio/ai-generate?surface=${surfaceType}`);
  }

  function useTemplate(t: StarterTemplate) {
    if (t.price_cents > 0) {
      setPurchaseTemplate(t);
      return;
    }
    const design = createDesign(
      {
        surface_type: t.surface_type,
        name: `${t.name} — My Version`,
        canvas_data: t.canvas_data,
        canvas_width: t.canvas_width,
        canvas_height: t.canvas_height,
        template_id: t.id,
        metadata: { source: "template", template_name: t.name },
      },
      userId,
    );
    router.push(`/studio/editor/${design.id}`);
  }

  function confirmPurchase(t: StarterTemplate) {
    // In production this would hit a Stripe checkout. For now we proceed.
    const design = createDesign(
      {
        surface_type: t.surface_type,
        name: `${t.name} — My Version`,
        canvas_data: t.canvas_data,
        canvas_width: t.canvas_width,
        canvas_height: t.canvas_height,
        template_id: t.id,
        metadata: { source: "template", template_name: t.name, paid_cents: t.price_cents },
      },
      userId,
    );
    setPurchaseTemplate(null);
    router.push(`/studio/editor/${design.id}`);
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <TopNav />

      {/* Back to Studio */}
      <div className="mx-auto w-full max-w-7xl px-8 pt-6">
        <NextLink
          href="/studio"
          className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-muted hover:text-ink"
        >
          <ChevronLeft size={12} /> Back to Studio
        </NextLink>
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-8 pt-6">
        <div className="flex flex-col gap-6 border-b border-border pb-8">
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-saffron">
              Studio · Templates
            </p>
            <h1 className="mt-1 font-serif text-[44px] leading-tight text-ink">{meta.title}</h1>
            <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-ink-muted">{meta.subtitle}</p>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={startWithAI}
              className="flex items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-[13px] font-medium text-ivory hover:bg-ink-soft"
            >
              <Sparkles size={14} /> Create with AI
            </button>
            <button
              onClick={startFromScratch}
              className="flex items-center gap-2 rounded-md border border-border bg-card px-5 py-2.5 text-[13px] text-ink hover:bg-ivory-warm"
            >
              <Plus size={14} /> Start from scratch
            </button>

            <div className="ml-auto w-full max-w-sm md:w-80">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={`Search ${meta.title.toLowerCase()}...`}
                  className="w-full rounded-md border border-border bg-card py-2.5 pl-9 pr-3 text-[13px] text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Filter bar ───────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-8 pt-5">
        {/* Category pills — horizontal scroll */}
        <div className="no-scrollbar -mx-2 flex items-center gap-2 overflow-x-auto pb-1 pl-2">
          {meta.categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 font-[family-name:'DM_Sans'] text-[12px] transition-colors",
                activeCategory === c
                  ? "border-ink bg-ink text-ivory"
                  : "border-border bg-card text-ink-muted hover:bg-ivory-warm",
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Secondary controls */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Dropdown
            label="Cultural"
            value={cultural}
            options={CULTURAL_STYLES}
            onChange={setCultural}
          />
          <Dropdown
            label="Regional"
            value={regional}
            options={REGIONAL_STYLES}
            onChange={setRegional}
          />
          <Dropdown
            label="Sort"
            value={sortBy}
            options={SORT_OPTIONS.map((s) => ({ id: s.id, label: s.label }))}
            onChange={(v) => setSortBy(v as SortId)}
          />
          <div className="mx-1 h-5 w-px bg-border" />
          {PRICE_FILTERS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPriceFilter(p.id)}
              className={cn(
                "rounded-full border px-3 py-1 font-[family-name:'DM_Sans'] text-[11.5px] transition-colors",
                priceFilter === p.id
                  ? "border-gold bg-gold-pale/50 text-ink"
                  : "border-border bg-card text-ink-muted hover:bg-ivory-warm",
              )}
            >
              {p.label}
            </button>
          ))}

          <span className="ml-auto font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">
            {filtered.length} template{filtered.length === 1 ? "" : "s"}
          </span>
        </div>
      </section>

      {/* ── Trending ─────────────────────────────────────────────────── */}
      {trending.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-8 pt-10">
          <header className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="flex items-center gap-2 font-serif text-[22px] text-ink">
                <Flame size={18} className="text-rose" /> Trending now
              </h2>
              <p className="mt-0.5 font-[family-name:'DM_Sans'] text-[12px] text-ink-muted">
                Most popular this week
              </p>
            </div>
          </header>
          <div className="no-scrollbar -mx-2 flex snap-x gap-4 overflow-x-auto px-2 pb-3">
            {trending.map((t) => (
              <div key={t.id} className="w-[280px] shrink-0 snap-start">
                <TemplateCard
                  t={t}
                  onUse={() => useTemplate(t)}
                  onPreview={() => setPreviewTemplate(t)}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── All templates grid ──────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-8 pt-12">
        <header className="mb-4">
          <h2 className="font-serif text-[22px] text-ink">All templates</h2>
          <p className="mt-0.5 font-[family-name:'DM_Sans'] text-[12px] text-ink-muted">
            Browse every design for this surface.
          </p>
        </header>

        {filtered.length === 0 ? (
          <EmptyState onReset={() => {
            setQ("");
            setActiveCategory(meta.categories[0] ?? "All");
            setCultural("all");
            setRegional("all");
            setPriceFilter("all");
          }} />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.slice(0, visibleCount).map((t) => (
              <TemplateCard
                key={t.id}
                t={t}
                onUse={() => useTemplate(t)}
                onPreview={() => setPreviewTemplate(t)}
              />
            ))}
          </div>
        )}

        {filtered.length > visibleCount && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setVisibleCount((n) => n + 24)}
              className="flex items-center gap-2 rounded-md border border-border bg-card px-5 py-2.5 text-[13px] text-ink hover:bg-ivory-warm"
            >
              Show more <ChevronRight size={14} />
            </button>
          </div>
        )}
      </section>

      {/* ── Bottom CTA banner ─────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-8 py-16">
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card px-8 py-12 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <h3 className="font-serif text-[22px] text-ink">Can&apos;t find what you&apos;re looking for?</h3>
            <p className="mt-1 font-[family-name:'DM_Sans'] text-[13px] leading-relaxed text-ink-muted">
              Describe your vibe and we&apos;ll generate a custom design from scratch — palette, type, and layout, done for you.
            </p>
          </div>
          <button
            onClick={startWithAI}
            className="flex shrink-0 items-center gap-2 rounded-md bg-ink px-5 py-3 text-[13px] font-medium text-ivory hover:bg-ink-soft"
          >
            <Sparkles size={14} /> Generate custom design
          </button>
        </div>
      </section>

      {/* ── Modals ────────────────────────────────────────────────── */}
      {previewTemplate && (
        <TemplatePreviewModal
          t={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onUse={() => {
            const t = previewTemplate;
            setPreviewTemplate(null);
            useTemplate(t);
          }}
        />
      )}
      {purchaseTemplate && (
        <PurchaseModal
          t={purchaseTemplate}
          onClose={() => setPurchaseTemplate(null)}
          onConfirm={() => confirmPurchase(purchaseTemplate)}
        />
      )}

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

// ── Template card ─────────────────────────────────────────────────────────

function TemplateCard({
  t,
  onUse,
  onPreview,
}: {
  t: StarterTemplate;
  onUse: () => void;
  onPreview: () => void;
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
    >
      <button
        onClick={onUse}
        className="block w-full text-left"
        aria-label={`Use template ${t.name}`}
      >
        <div
          className="relative aspect-[3/4] w-full overflow-hidden"
          style={{
            background: t.colors[Math.min(2, t.colors.length - 1)] ?? "#FDFBF7",
          }}
        >
          {/* Generated preview — name in the template's hero font + colors */}
          <ThumbnailPreview t={t} />

          {/* Badges */}
          {t.price_cents === 0 && (
            <span className="absolute left-3 top-3 rounded-md px-2 py-0.5 font-[family-name:'DM_Sans'] text-[10px] font-medium uppercase tracking-[0.12em] text-sage" style={{ background: "rgba(156,175,136,0.18)", border: "1px solid rgba(156,175,136,0.5)" }}>
              Free
            </span>
          )}
          {t.is_trending && (
            <span className="absolute right-3 top-3 rounded-md px-2 py-0.5 font-[family-name:'DM_Sans'] text-[10px] font-medium uppercase tracking-[0.12em] text-rose" style={{ background: "rgba(201,123,99,0.14)", border: "1px solid rgba(201,123,99,0.5)" }}>
              Trending
            </span>
          )}

          {/* Hover actions */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-2 items-center justify-center gap-2 p-3 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPreview(); }}
              className="pointer-events-auto flex items-center gap-1 rounded-md bg-ivory px-3 py-1.5 font-[family-name:'DM_Sans'] text-[11.5px] text-ink shadow-sm hover:bg-ivory-warm"
            >
              <Eye size={12} /> Preview
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onUse(); }}
              className="pointer-events-auto rounded-md bg-ink px-3 py-1.5 font-[family-name:'DM_Sans'] text-[11.5px] font-medium text-ivory hover:opacity-90"
            >
              Use template
            </button>
          </div>
        </div>
      </button>

      {/* Meta */}
      <div className="flex items-start justify-between gap-2 px-4 py-3">
        <div className="min-w-0">
          <h3 className="truncate font-serif text-[15px] text-ink">{t.name}</h3>
          <p className="mt-0.5 truncate font-[family-name:'DM_Sans'] text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">
            {[t.cultural_style?.replace(/_/g, " "), t.regional_style].filter(Boolean).join(" · ") || "Fusion"}
          </p>
        </div>
        <span className="shrink-0 font-mono text-[12px] tabular-nums text-ink-muted">
          {formatPrice(t.price_cents)}
        </span>
      </div>
    </div>
  );
}

// Canvas-free thumbnail — couple names in the template's hero font,
// backed by the template's palette. Keeps the grid fast and avoids a
// per-card fabric mount.
function ThumbnailPreview({ t }: { t: StarterTemplate }) {
  const hero = t.fonts[0] ?? "Playfair Display";
  const inkColor = t.colors[0] ?? "#1A1A1A";
  const bgColor = t.colors[2] ?? t.colors[t.colors.length - 1] ?? "#FDFBF7";
  const accent = t.colors[1] ?? "#B8860B";
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center px-4 text-center"
      style={{ background: bgColor }}
    >
      <div
        className="font-[family-name:'DM_Sans'] text-[9px] uppercase tracking-[0.28em]"
        style={{ color: accent }}
      >
        {t.name}
      </div>
      <div
        className="my-3 h-px w-16"
        style={{ background: accent, opacity: 0.5 }}
      />
      <div
        className="max-w-full truncate text-[28px] leading-tight"
        style={{ fontFamily: hero, color: inkColor }}
      >
        Your Names
      </div>
      <div
        className="mt-1 font-[family-name:'DM_Sans'] text-[10px]"
        style={{ color: inkColor, opacity: 0.6 }}
      >
        Date · Venue
      </div>
      <div className="mt-5 flex gap-1.5">
        {t.colors.slice(0, 4).map((c, i) => (
          <span key={i} className="h-2 w-2 rounded-full" style={{ background: c }} />
        ))}
      </div>
    </div>
  );
}

// ── Dropdown ─────────────────────────────────────────────────────────────

function Dropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { id: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.id === value) ?? options[0];
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 font-[family-name:'DM_Sans'] text-[12px] text-ink"
      >
        <span className="text-ink-faint">{label}:</span>
        <span>{current?.label ?? "All"}</span>
        <ChevronDown size={12} className="text-ink-faint" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 min-w-48 overflow-hidden rounded-md border border-border bg-card shadow-md">
          {options.map((o) => (
            <button
              key={o.id}
              onClick={() => { onChange(o.id); setOpen(false); }}
              className={cn(
                "block w-full px-3 py-2 text-left font-[family-name:'DM_Sans'] text-[12px] hover:bg-ivory-warm",
                value === o.id ? "bg-gold-pale/30 text-ink" : "text-ink-muted",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card px-8 py-16 text-center">
      <h3 className="font-serif text-[18px] text-ink">No templates match those filters</h3>
      <p className="mt-2 max-w-md mx-auto font-[family-name:'DM_Sans'] text-[13px] leading-relaxed text-ink-muted">
        Try broadening your cultural or regional filter, or reset and start again.
      </p>
      <button
        onClick={onReset}
        className="mt-5 rounded-md border border-border bg-ivory px-4 py-2 text-[12px] text-ink hover:bg-ivory-warm"
      >
        Reset filters
      </button>
    </div>
  );
}

// ── Preview modal ────────────────────────────────────────────────────────

function TemplatePreviewModal({
  t,
  onClose,
  onUse,
}: {
  t: StarterTemplate;
  onClose: () => void;
  onUse: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(26,26,26,0.75)" }}
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-xl bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Preview pane */}
        <div className="relative flex min-h-[500px] flex-1 items-center justify-center overflow-hidden" style={{ background: t.colors[2] ?? "#F5F1E8" }}>
          <div className="w-[300px]">
            <div className="aspect-[3/4] overflow-hidden rounded-lg shadow-xl">
              <ThumbnailPreview t={t} />
            </div>
          </div>
        </div>

        {/* Details pane */}
        <div className="flex w-[360px] shrink-0 flex-col overflow-y-auto border-l border-border bg-ivory">
          <div className="flex items-start justify-between border-b border-border px-6 py-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron">
                {t.surface_type.replace(/_/g, " ")}
              </p>
              <h2 className="mt-1 font-serif text-[22px] leading-tight text-ink">{t.name}</h2>
              <p className="mt-2 font-[family-name:'DM_Sans'] text-[12px] leading-relaxed text-ink-muted">
                {t.description}
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-ivory-warm"
              aria-label="Close preview"
            >
              <X size={14} />
            </button>
          </div>

          <div className="space-y-4 px-6 py-5">
            <DetailBlock label="Colours used">
              <div className="flex flex-wrap gap-2">
                {t.colors.map((c) => (
                  <div key={c} className="flex items-center gap-1.5">
                    <span className="h-5 w-5 rounded border border-border" style={{ background: c }} />
                    <span className="font-mono text-[10.5px] uppercase text-ink-muted">{c}</span>
                  </div>
                ))}
              </div>
            </DetailBlock>

            <DetailBlock label="Fonts used">
              <ul className="space-y-1">
                {t.fonts.map((f) => (
                  <li key={f} className="text-[14px] text-ink" style={{ fontFamily: f }}>
                    {f}
                  </li>
                ))}
              </ul>
            </DetailBlock>

            <DetailBlock label="Tags">
              <div className="flex flex-wrap gap-1.5">
                {t.tags.map((tg) => (
                  <span
                    key={tg}
                    className="rounded-full border border-border bg-card px-2 py-0.5 font-[family-name:'DM_Sans'] text-[10.5px] uppercase tracking-[0.1em] text-ink-muted"
                  >
                    {tg.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </DetailBlock>

            <DetailBlock label="Canvas">
              <p className="font-mono text-[11.5px] text-ink-muted">
                {t.canvas_width} × {t.canvas_height} px
              </p>
            </DetailBlock>
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-border px-6 py-4">
            <span className="font-mono text-[14px] tabular-nums text-ink">{formatPrice(t.price_cents)}</span>
            <button
              onClick={onUse}
              className="rounded-md bg-ink px-5 py-2 text-[13px] font-medium text-ivory hover:bg-ink-soft"
            >
              Use this template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 font-[family-name:'DM_Sans'] text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">
        {label}
      </div>
      {children}
    </div>
  );
}

// ── Purchase confirmation modal ──────────────────────────────────────────

function PurchaseModal({
  t,
  onClose,
  onConfirm,
}: {
  t: StarterTemplate;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(26,26,26,0.75)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-card p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-saffron">Premium template</p>
        <h3 className="mt-2 font-serif text-[22px] text-ink">{t.name}</h3>
        <p className="mt-2 font-[family-name:'DM_Sans'] text-[12.5px] leading-relaxed text-ink-muted">
          {t.description}
        </p>

        <div className="mt-5 flex items-center justify-between rounded-md border border-border bg-ivory-warm/40 px-4 py-3">
          <span className="font-[family-name:'DM_Sans'] text-[12px] text-ink-muted">One-time purchase</span>
          <span className="font-mono text-[18px] tabular-nums text-ink">{formatPrice(t.price_cents)}</span>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-border bg-card px-4 py-2 font-[family-name:'DM_Sans'] text-[12.5px] text-ink-muted hover:bg-ivory-warm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md bg-ink px-4 py-2 font-[family-name:'DM_Sans'] text-[12.5px] font-medium text-ivory hover:bg-ink-soft"
          >
            {formatPrice(t.price_cents)} — Use this template
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────

function formatPrice(cents: number): string {
  if (cents === 0) return "Free";
  return `$${(cents / 100).toFixed(2)}`;
}
