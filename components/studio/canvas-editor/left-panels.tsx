"use client";

// ──────────────────────────────────────────────────────────────────────────
// Canvas editor — left toolbar + active panel
//
// Seven panels, one at a time. Vertical toolbar on the far left switches
// between them; panel body is 280 px wide.
// ──────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Shapes,
  Type as TypeIcon,
  Sparkles,
  Palette,
  CaseSensitive,
  UploadCloud,
  Wand2,
  Search,
  Circle,
  Square,
  Minus as LineIcon,
  Image as ImageIcon,
  AlignCenter,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  AISuggestion,
  FontEntry,
  LeftPanel,
  MotifRow,
  SurfaceType,
  TrendingPalette,
  UploadedAsset,
} from "./types";
import {
  FONT_CATALOG,
  FONT_CATEGORY_LABEL,
  TEXT_PRESETS,
  TRENDING_PALETTES,
  AI_QUICK_PROMPTS,
  ensureGoogleFont,
} from "./data";

// ── Toolbar (icon strip) ─────────────────────────────────────────────────

const TABS: { id: LeftPanel; label: string; icon: typeof Shapes }[] = [
  { id: "elements", label: "Elements", icon: Shapes },
  { id: "text",     label: "Text",     icon: TypeIcon },
  { id: "motifs",   label: "Motifs",   icon: Sparkles },
  { id: "colors",   label: "Colours",  icon: Palette },
  { id: "fonts",    label: "Fonts",    icon: CaseSensitive },
  { id: "upload",   label: "Upload",   icon: UploadCloud },
  { id: "ai",       label: "AI Magic", icon: Wand2 },
];

export function LeftToolbar({
  active,
  onChange,
}: {
  active: LeftPanel;
  onChange: (p: LeftPanel) => void;
}) {
  return (
    <nav
      className="flex w-14 shrink-0 flex-col items-center gap-1 border-r py-3"
      style={{ borderColor: "#E8E4DF", background: "#FDFBF7" }}
      aria-label="Editor tools"
    >
      {TABS.map((t) => {
        const Icon = t.icon;
        const on = active === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            title={t.label}
            aria-current={on ? "page" : undefined}
            className={cn(
              "flex h-10 w-10 flex-col items-center justify-center rounded-md transition-colors",
              on ? "bg-gold-pale/50 text-ink" : "text-ink-muted hover:bg-ivory-warm/70 hover:text-ink",
            )}
          >
            <Icon size={16} strokeWidth={1.7} />
            <span className="mt-0.5 font-[family-name:'DM_Sans'] text-[8.5px] uppercase tracking-[0.08em]">
              {t.label.split(" ")[0]}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

// ── Panel frame ──────────────────────────────────────────────────────────

function PanelHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="border-b px-4 pb-3 pt-4" style={{ borderColor: "#E8E4DF" }}>
      <h3 className="font-serif text-[15px] text-ink">{title}</h3>
      {subtitle && (
        <p className="mt-0.5 font-[family-name:'DM_Sans'] text-[11.5px] leading-relaxed text-ink-muted">
          {subtitle}
        </p>
      )}
    </div>
  );
}

interface LeftPanelHostProps {
  active: LeftPanel;
  surfaceType: SurfaceType;
  selectedObject: Record<string, any> | null;
  onAddText: (preset: typeof TEXT_PRESETS[number]) => void;
  onAddShape: (kind: "rect" | "circle" | "line" | "divider") => void;
  onAddPhotoPlaceholder: () => void;
  onAddMotif: (svg: string) => void;
  onSetBackground: (color: string) => void;
  onApplyPalette: (p: TrendingPalette) => void;
  onApplyFont: (family: string, stack: string) => void;
  onUpdateSelected: (patch: Record<string, any>) => void;
  onAddImage: (url: string) => void;
  onRequestAI: (prompt: string) => Promise<AISuggestion[]>;
  motifs?: MotifRow[];
  onLoadMotifs?: () => Promise<MotifRow[]>;
  uploadedAssets: UploadedAsset[];
  onUpload: (files: File[]) => Promise<void>;
}

export function LeftPanelHost(props: LeftPanelHostProps) {
  return (
    <aside
      className="flex w-[280px] shrink-0 flex-col overflow-y-auto border-r"
      style={{ borderColor: "#E8E4DF", background: "#FDFBF7" }}
    >
      {props.active === "elements" && <ElementsPanel {...props} />}
      {props.active === "text"     && <TextPanel     {...props} />}
      {props.active === "motifs"   && <MotifsPanel   {...props} />}
      {props.active === "colors"   && <ColorsPanel   {...props} />}
      {props.active === "fonts"    && <FontsPanel    {...props} />}
      {props.active === "upload"   && <UploadPanel   {...props} />}
      {props.active === "ai"       && <AIPanel       {...props} />}
    </aside>
  );
}

// ── 1. Elements panel ────────────────────────────────────────────────────

function ElementsPanel({ onAddText, onAddShape, onAddPhotoPlaceholder }: LeftPanelHostProps) {
  return (
    <>
      <PanelHeader title="Elements" subtitle="Add text, shapes, and photo frames to your canvas." />
      <section className="px-4 py-3">
        <SubHeader>Text</SubHeader>
        <div className="grid grid-cols-2 gap-2">
          {TEXT_PRESETS.map((p) => (
            <button
              key={p.kind}
              onClick={() => {
                ensureGoogleFont(p.fontFamily);
                onAddText(p);
              }}
              className="flex flex-col items-start gap-1 rounded-md border px-2.5 py-2 text-left hover:bg-ivory-warm/60"
              style={{ borderColor: "#E8E4DF", background: "#FFFFFF" }}
            >
              <span
                className="max-w-full truncate text-ink"
                style={{ fontFamily: p.fontFamily, fontSize: 15 }}
              >
                {p.sample}
              </span>
              <span className="font-[family-name:'DM_Sans'] text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                {p.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="border-t px-4 py-3" style={{ borderColor: "#E8E4DF" }}>
        <SubHeader>Shapes</SubHeader>
        <div className="grid grid-cols-4 gap-2">
          <ShapeBtn icon={Square}   label="Rect"    onClick={() => onAddShape("rect")} />
          <ShapeBtn icon={Circle}   label="Circle"  onClick={() => onAddShape("circle")} />
          <ShapeBtn icon={LineIcon} label="Line"    onClick={() => onAddShape("line")} />
          <ShapeBtn icon={AlignCenter} label="Divider" onClick={() => onAddShape("divider")} />
        </div>
      </section>

      <section className="border-t px-4 py-3" style={{ borderColor: "#E8E4DF" }}>
        <SubHeader>Photo</SubHeader>
        <button
          onClick={onAddPhotoPlaceholder}
          className="flex w-full flex-col items-center justify-center gap-1.5 rounded-md border border-dashed py-5 hover:bg-ivory-warm/60"
          style={{ borderColor: "#D4CFC6" }}
        >
          <ImageIcon size={18} className="text-ink-faint" />
          <span className="font-[family-name:'DM_Sans'] text-[11px] text-ink-muted">
            Add photo placeholder
          </span>
          <span className="font-[family-name:'DM_Sans'] text-[10px] text-ink-faint">
            Upload or drop a file later
          </span>
        </button>
      </section>
    </>
  );
}

function ShapeBtn({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Circle;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border hover:bg-ivory-warm/60"
      style={{ borderColor: "#E8E4DF", background: "#FFFFFF" }}
    >
      <Icon size={16} className="text-ink-muted" />
      <span className="font-[family-name:'DM_Sans'] text-[9.5px] uppercase tracking-[0.08em] text-ink-faint">
        {label}
      </span>
    </button>
  );
}

// ── 2. Text panel ────────────────────────────────────────────────────────

function TextPanel({ selectedObject, onUpdateSelected, onApplyFont }: LeftPanelHostProps) {
  const isText =
    selectedObject && ["textbox", "i-text", "text"].includes(selectedObject.type);

  if (!isText) {
    return (
      <>
        <PanelHeader title="Text" subtitle="Select a text element to edit its content and style." />
        <div className="px-4 py-10 text-center font-[family-name:'DM_Sans'] text-[12px] text-ink-faint">
          Click a text layer on the canvas.
        </div>
      </>
    );
  }

  const obj = selectedObject!;
  return (
    <>
      <PanelHeader title="Text" subtitle="Edit content and typography." />
      <section className="space-y-3 px-4 py-3">
        <textarea
          value={String(obj.text ?? "")}
          onChange={(e) => onUpdateSelected({ text: e.target.value })}
          rows={3}
          className="w-full resize-none rounded-md border px-2.5 py-2 font-[family-name:'DM_Sans'] text-[13px] text-ink focus:border-gold focus:outline-none"
          style={{ borderColor: "#E8E4DF", background: "#FFFFFF" }}
        />

        <FontPicker
          currentFamily={String(obj.fontFamily ?? "Playfair Display")}
          onPick={(f) => {
            ensureGoogleFont(f.family);
            onApplyFont(f.family, f.stack);
          }}
        />

        <div>
          <Label>Font size</Label>
          <input
            type="range"
            min={8}
            max={220}
            value={Number(obj.fontSize ?? 16)}
            onChange={(e) => onUpdateSelected({ fontSize: Number(e.target.value) })}
            className="w-full accent-[#B8860B]"
          />
          <div className="mt-0.5 font-[family-name:'DM_Sans'] text-[10.5px] tabular-nums text-ink-faint">
            {Math.round(Number(obj.fontSize ?? 16))} pt
          </div>
        </div>

        <div>
          <Label>Colour</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={typeof obj.fill === "string" && obj.fill.startsWith("#") ? obj.fill : "#1A1A1A"}
              onChange={(e) => onUpdateSelected({ fill: e.target.value })}
              className="h-7 w-9 cursor-pointer rounded border p-0"
              style={{ borderColor: "#E8E4DF" }}
            />
            <input
              type="text"
              value={String(obj.fill ?? "")}
              onChange={(e) => onUpdateSelected({ fill: e.target.value })}
              className="flex-1 rounded border px-2 py-1 font-mono text-[11px] uppercase text-ink focus:border-gold focus:outline-none"
              style={{ borderColor: "#E8E4DF", background: "#FFFFFF" }}
            />
          </div>
        </div>

        <div>
          <Label>Letter spacing</Label>
          <input
            type="range"
            min={-100}
            max={1000}
            value={Number(obj.charSpacing ?? 0)}
            onChange={(e) => onUpdateSelected({ charSpacing: Number(e.target.value) })}
            className="w-full accent-[#B8860B]"
          />
          <div className="mt-0.5 font-[family-name:'DM_Sans'] text-[10.5px] tabular-nums text-ink-faint">
            {Math.round(Number(obj.charSpacing ?? 0))}
          </div>
        </div>

        <div>
          <Label>Line height</Label>
          <input
            type="range"
            min={0.8}
            max={3}
            step={0.05}
            value={Number(obj.lineHeight ?? 1.16)}
            onChange={(e) => onUpdateSelected({ lineHeight: Number(e.target.value) })}
            className="w-full accent-[#B8860B]"
          />
          <div className="mt-0.5 font-[family-name:'DM_Sans'] text-[10.5px] tabular-nums text-ink-faint">
            {Number(obj.lineHeight ?? 1.16).toFixed(2)}
          </div>
        </div>

        <div>
          <Label>Align</Label>
          <div className="flex gap-1">
            {(["left", "center", "right"] as const).map((a) => (
              <button
                key={a}
                onClick={() => onUpdateSelected({ textAlign: a })}
                className={cn(
                  "flex-1 rounded border py-1.5 font-[family-name:'DM_Sans'] text-[11px] capitalize",
                  obj.textAlign === a ? "border-gold bg-gold-pale/40 text-ink" : "text-ink-muted hover:bg-ivory-warm/60",
                )}
                style={{ borderColor: obj.textAlign === a ? "#B8860B" : "#E8E4DF" }}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>Style</Label>
          <div className="flex gap-1">
            <StyleToggle
              active={String(obj.fontWeight ?? "").toString().toLowerCase() === "bold" || Number(obj.fontWeight) >= 600}
              label="B"
              onClick={() =>
                onUpdateSelected({
                  fontWeight:
                    String(obj.fontWeight ?? "").toString().toLowerCase() === "bold" ? "normal" : "bold",
                })
              }
            />
            <StyleToggle
              active={obj.fontStyle === "italic"}
              label="I"
              italic
              onClick={() =>
                onUpdateSelected({ fontStyle: obj.fontStyle === "italic" ? "normal" : "italic" })
              }
            />
            <StyleToggle
              active={!!obj.underline}
              label="U"
              underline
              onClick={() => onUpdateSelected({ underline: !obj.underline })}
            />
          </div>
        </div>
      </section>
    </>
  );
}

function FontPicker({
  currentFamily,
  onPick,
}: {
  currentFamily: string;
  onPick: (f: FontEntry) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <Label>Font</Label>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-md border px-2.5 py-2 text-left"
        style={{ borderColor: "#E8E4DF", background: "#FFFFFF" }}
      >
        <span className="text-[13px] text-ink" style={{ fontFamily: currentFamily }}>
          {currentFamily}
        </span>
        <span className="font-[family-name:'DM_Sans'] text-[10.5px] uppercase tracking-[0.1em] text-ink-faint">
          change
        </span>
      </button>
      {open && (
        <div
          className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-md border shadow-md"
          style={{ borderColor: "#E8E4DF", background: "#FFFFFF" }}
        >
          {FONT_CATALOG.map((f) => (
            <button
              key={f.family}
              onClick={() => {
                onPick(f);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-ivory-warm/60"
            >
              <span style={{ fontFamily: f.stack, fontSize: 15 }} className="truncate text-ink">
                {f.family}
              </span>
              <span className="font-[family-name:'DM_Sans'] text-[9.5px] uppercase tracking-[0.1em] text-ink-faint">
                {FONT_CATEGORY_LABEL[f.category]}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StyleToggle({
  active,
  label,
  italic,
  underline,
  onClick,
}: {
  active: boolean;
  label: string;
  italic?: boolean;
  underline?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 rounded border py-1.5 font-serif text-[13px]",
        active ? "border-gold bg-gold-pale/40 text-ink" : "text-ink-muted hover:bg-ivory-warm/60",
      )}
      style={{
        borderColor: active ? "#B8860B" : "#E8E4DF",
        fontWeight: label === "B" ? 700 : 400,
        fontStyle: italic ? "italic" : undefined,
        textDecoration: underline ? "underline" : undefined,
      }}
    >
      {label}
    </button>
  );
}

// ── 3. Motifs panel ──────────────────────────────────────────────────────

const MOTIF_CATEGORIES = ["all", "border", "corner", "divider", "icon", "frame", "pattern"] as const;
const CULTURAL_FILTERS = [
  { id: "any", label: "All" },
  { id: "hindu_north", label: "Hindu • North" },
  { id: "hindu_south", label: "Hindu • South" },
  { id: "sikh", label: "Sikh" },
  { id: "muslim", label: "Muslim" },
  { id: "christian", label: "Christian" },
  { id: "fusion", label: "Fusion" },
];

function MotifsPanel({ motifs, onLoadMotifs, onAddMotif }: LeftPanelHostProps) {
  const [loaded, setLoaded] = useState<MotifRow[] | null>(motifs ?? null);
  const [loading, setLoading] = useState(false);
  const [cat, setCat] = useState<(typeof MOTIF_CATEGORIES)[number]>("all");
  const [culture, setCulture] = useState<string>("any");
  const [q, setQ] = useState("");

  useEffect(() => {
    if (loaded || !onLoadMotifs) return;
    setLoading(true);
    onLoadMotifs()
      .then((rows) => setLoaded(rows))
      .finally(() => setLoading(false));
  }, [loaded, onLoadMotifs]);

  const filtered = useMemo(() => {
    const rows = loaded ?? [];
    return rows.filter((m) => {
      if (cat !== "all" && m.category !== cat) return false;
      if (culture !== "any" && m.cultural_style !== culture) return false;
      if (q && !m.name.toLowerCase().includes(q.toLowerCase()) && !m.tags.some((t) => t.toLowerCase().includes(q.toLowerCase()))) return false;
      return true;
    });
  }, [loaded, cat, culture, q]);

  return (
    <>
      <PanelHeader title="Motifs" subtitle="Cultural SVG decorations. Click to place on the canvas." />
      <section className="space-y-2 border-b px-4 py-3" style={{ borderColor: "#E8E4DF" }}>
        <div className="relative">
          <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search paisley, peacock, jali..."
            className="w-full rounded border py-1.5 pl-7 pr-2 font-[family-name:'DM_Sans'] text-[12px] focus:border-gold focus:outline-none"
            style={{ borderColor: "#E8E4DF", background: "#FFFFFF" }}
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {CULTURAL_FILTERS.map((c) => (
            <Chip key={c.id} active={culture === c.id} onClick={() => setCulture(c.id)}>
              {c.label}
            </Chip>
          ))}
        </div>
      </section>

      <div className="flex gap-1 border-b px-4 py-2 text-[10.5px]" style={{ borderColor: "#E8E4DF" }}>
        {MOTIF_CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={cn(
              "rounded-full px-2.5 py-1 font-[family-name:'DM_Sans'] uppercase tracking-[0.1em]",
              cat === c ? "bg-ink text-ivory" : "text-ink-muted hover:bg-ivory-warm/60",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <section className="px-4 py-3">
        {loading ? (
          <div className="flex items-center justify-center py-10 text-ink-faint">
            <Loader2 size={16} className="animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center font-[family-name:'DM_Sans'] text-[11.5px] text-ink-faint">
            No motifs match.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {filtered.map((m) => (
              <button
                key={m.id}
                onClick={() => onAddMotif(m.svg_data)}
                title={m.name}
                className="group relative flex aspect-square items-center justify-center rounded-md border hover:bg-ivory-warm/60"
                style={{ borderColor: "#E8E4DF", background: "#FFFFFF", color: "#1A1A1A" }}
              >
                <div
                  className="h-[70%] w-[70%]"
                  dangerouslySetInnerHTML={{ __html: m.svg_data }}
                  style={{ color: "currentColor" }}
                />
                {m.is_premium && (
                  <span
                    className="absolute right-1 top-1 rounded-sm px-1 py-[1px] font-[family-name:'DM_Sans'] text-[8px] uppercase tracking-[0.1em]"
                    style={{ background: "#B8860B", color: "#FFFFFF" }}
                  >
                    Pro
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

// ── 4. Colours panel ─────────────────────────────────────────────────────

function ColorsPanel({ onSetBackground, onApplyPalette }: LeftPanelHostProps) {
  const [bg, setBg] = useState("#FDF8EF");
  return (
    <>
      <PanelHeader title="Colours" subtitle="Background + trending palettes that retint your canvas." />
      <section className="border-b px-4 py-3" style={{ borderColor: "#E8E4DF" }}>
        <SubHeader>Background</SubHeader>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={bg}
            onChange={(e) => {
              setBg(e.target.value);
              onSetBackground(e.target.value);
            }}
            className="h-8 w-10 cursor-pointer rounded border p-0"
            style={{ borderColor: "#E8E4DF" }}
          />
          <input
            type="text"
            value={bg}
            onChange={(e) => {
              setBg(e.target.value);
              onSetBackground(e.target.value);
            }}
            className="flex-1 rounded border px-2 py-1.5 font-mono text-[11px] uppercase text-ink focus:border-gold focus:outline-none"
            style={{ borderColor: "#E8E4DF", background: "#FFFFFF" }}
          />
        </div>
      </section>

      <section className="px-4 py-3">
        <SubHeader>Trending palettes</SubHeader>
        <div className="space-y-2">
          {TRENDING_PALETTES.map((p) => (
            <button
              key={p.id}
              onClick={() => onApplyPalette(p)}
              className="flex w-full flex-col items-start gap-1.5 rounded-md border p-2.5 text-left hover:bg-ivory-warm/40"
              style={{ borderColor: "#E8E4DF", background: "#FFFFFF" }}
            >
              <div className="flex w-full items-center justify-between">
                <span className="font-serif text-[13px] text-ink">{p.name}</span>
                <span className="font-[family-name:'DM_Sans'] text-[9.5px] uppercase tracking-[0.12em] text-ink-faint">
                  Apply
                </span>
              </div>
              <span className="font-[family-name:'DM_Sans'] text-[10.5px] text-ink-muted">{p.mood}</span>
              <div className="mt-1 flex h-5 w-full overflow-hidden rounded-sm" style={{ border: "1px solid #E8E4DF" }}>
                {p.swatches.map((s, i) => (
                  <div key={i} className="flex-1" style={{ background: s }} />
                ))}
              </div>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

// ── 5. Fonts panel ───────────────────────────────────────────────────────

function FontsPanel({ onApplyFont }: LeftPanelHostProps) {
  const [q, setQ] = useState("");
  const grouped = useMemo(() => {
    const map = new Map<string, FontEntry[]>();
    FONT_CATALOG.forEach((f) => {
      if (q && !f.family.toLowerCase().includes(q.toLowerCase())) return;
      const arr = map.get(f.category) ?? [];
      arr.push(f);
      map.set(f.category, arr);
    });
    return map;
  }, [q]);

  useEffect(() => {
    FONT_CATALOG.forEach((f) => {
      if (f.googleFont) ensureGoogleFont(f.family);
    });
  }, []);

  return (
    <>
      <PanelHeader title="Fonts" subtitle="Live-preview browser. Click to apply to the selected text." />
      <section className="border-b px-4 py-3" style={{ borderColor: "#E8E4DF" }}>
        <div className="relative">
          <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search font..."
            className="w-full rounded border py-1.5 pl-7 pr-2 font-[family-name:'DM_Sans'] text-[12px] focus:border-gold focus:outline-none"
            style={{ borderColor: "#E8E4DF", background: "#FFFFFF" }}
          />
        </div>
      </section>

      <section className="px-4 py-3">
        {Array.from(grouped.entries()).map(([cat, fonts]) => (
          <div key={cat} className="mb-4">
            <SubHeader>{FONT_CATEGORY_LABEL[cat as FontEntry["category"]]}</SubHeader>
            <div className="space-y-1.5">
              {fonts.map((f) => (
                <button
                  key={f.family}
                  onClick={() => onApplyFont(f.family, f.stack)}
                  className="flex w-full items-center justify-between gap-2 rounded-md border px-2.5 py-2 text-left hover:bg-ivory-warm/60"
                  style={{ borderColor: "#E8E4DF", background: "#FFFFFF" }}
                >
                  <span style={{ fontFamily: f.stack, fontSize: 17 }} className="truncate text-ink">
                    {f.family}
                  </span>
                  <span className="font-[family-name:'DM_Sans'] text-[9.5px] uppercase tracking-[0.1em] text-ink-faint">
                    Apply
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}

// ── 6. Upload panel ──────────────────────────────────────────────────────

function UploadPanel({ uploadedAssets, onUpload, onAddImage }: LeftPanelHostProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | File[]) {
    const arr = Array.from(files).filter((f) => /^image\//.test(f.type));
    if (!arr.length) return;
    setUploading(true);
    try {
      await onUpload(arr);
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <PanelHeader title="Upload" subtitle="Photos & logos you drop in. Click any asset to place it." />

      <section className="px-4 py-3">
        <button
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed py-6 transition-colors",
            dragging ? "border-gold bg-gold-pale/30" : "hover:bg-ivory-warm/40",
          )}
          style={{ borderColor: dragging ? "#B8860B" : "#D4CFC6" }}
        >
          {uploading ? (
            <Loader2 size={18} className="animate-spin text-ink-faint" />
          ) : (
            <UploadCloud size={20} className="text-ink-faint" />
          )}
          <span className="font-[family-name:'DM_Sans'] text-[12px] text-ink">
            {uploading ? "Uploading..." : "Drop files or click to upload"}
          </span>
          <span className="font-[family-name:'DM_Sans'] text-[10.5px] text-ink-faint">
            PNG · JPG · SVG · up to 10 MB
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
          }}
        />
      </section>

      <section className="border-t px-4 py-3" style={{ borderColor: "#E8E4DF" }}>
        <SubHeader>Your library</SubHeader>
        {uploadedAssets.length === 0 ? (
          <div className="py-6 text-center font-[family-name:'DM_Sans'] text-[11px] text-ink-faint">
            No uploads yet.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {uploadedAssets.map((a) => (
              <button
                key={a.id}
                onClick={() => onAddImage(a.url)}
                title={a.name}
                className="group aspect-square overflow-hidden rounded-md border hover:border-gold"
                style={{ borderColor: "#E8E4DF", background: "#FFFFFF" }}
              >
                <img src={a.url} alt={a.name} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

// ── 7. AI Magic panel ────────────────────────────────────────────────────

function AIPanel({ onRequestAI }: LeftPanelHostProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function submit(p: string) {
    const q = p.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    try {
      const out = await onRequestAI(q);
      setSuggestions(out);
    } catch {
      setError("Could not reach AI. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PanelHeader title="AI Magic" subtitle="Describe a vibe. We propose palette, font, and layout tweaks." />

      <section className="space-y-2 border-b px-4 py-3" style={{ borderColor: "#E8E4DF" }}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder="e.g. Make the invite feel like a Rajasthani palace at dusk"
          className="w-full resize-none rounded-md border px-2.5 py-2 font-[family-name:'DM_Sans'] text-[12px] focus:border-gold focus:outline-none"
          style={{ borderColor: "#E8E4DF", background: "#FFFFFF" }}
        />
        <button
          onClick={() => submit(prompt)}
          disabled={loading || !prompt.trim()}
          className={cn(
            "flex w-full items-center justify-center gap-1.5 rounded-md px-3 py-2 font-[family-name:'DM_Sans'] text-[12px] font-medium text-ivory",
            loading || !prompt.trim() ? "opacity-50" : "hover:opacity-90",
          )}
          style={{ background: "#1A1A1A" }}
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />}
          Generate suggestions
        </button>
      </section>

      <section className="border-b px-4 py-3" style={{ borderColor: "#E8E4DF" }}>
        <SubHeader>Quick prompts</SubHeader>
        <div className="flex flex-wrap gap-1">
          {AI_QUICK_PROMPTS.map((q) => (
            <button
              key={q}
              onClick={() => {
                setPrompt(q);
                submit(q);
              }}
              className="rounded-full border px-2.5 py-1 font-[family-name:'DM_Sans'] text-[10.5px] text-ink-muted hover:bg-ivory-warm/60"
              style={{ borderColor: "#E8E4DF" }}
            >
              {q}
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 py-3">
        <SubHeader>Suggestions</SubHeader>
        {error && (
          <div className="rounded-md border px-3 py-2 font-[family-name:'DM_Sans'] text-[11.5px] text-rose"
               style={{ borderColor: "#F5E0D6", background: "#FBF3EF" }}>
            {error}
          </div>
        )}
        {!error && suggestions.length === 0 && !loading && (
          <div className="py-6 text-center font-[family-name:'DM_Sans'] text-[11px] text-ink-faint">
            Ask for a vibe to get started.
          </div>
        )}
        <div className="space-y-2">
          {suggestions.map((s) => (
            <div
              key={s.id}
              className="rounded-md border p-2.5"
              style={{ borderColor: "#E8E4DF", background: "#FFFFFF" }}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="font-serif text-[13px] text-ink">{s.title}</span>
                <span
                  className="rounded-sm px-1.5 py-[1px] font-[family-name:'DM_Sans'] text-[9px] uppercase tracking-[0.12em]"
                  style={{ background: "#F0E4C8", color: "#5A3A20" }}
                >
                  {s.kind}
                </span>
              </div>
              <p className="font-[family-name:'DM_Sans'] text-[11.5px] leading-relaxed text-ink-muted">
                {s.description}
              </p>
              {s.apply && (
                <button
                  onClick={s.apply}
                  className="mt-2 rounded-md border px-2.5 py-1 font-[family-name:'DM_Sans'] text-[11px] text-ink hover:bg-ivory-warm/60"
                  style={{ borderColor: "#E8E4DF" }}
                >
                  Apply
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

// ── shared ───────────────────────────────────────────────────────────────

function SubHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 font-[family-name:'DM_Sans'] text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1 font-[family-name:'DM_Sans'] text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-2.5 py-1 font-[family-name:'DM_Sans'] text-[10.5px]",
        active ? "border-ink bg-ink text-ivory" : "text-ink-muted hover:bg-ivory-warm/60",
      )}
      style={{ borderColor: active ? "#1A1A1A" : "#E8E4DF" }}
    >
      {children}
    </button>
  );
}

