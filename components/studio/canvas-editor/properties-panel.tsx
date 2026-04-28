"use client";

// ──────────────────────────────────────────────────────────────────────────
// Canvas editor — right properties panel
//
// Appears when an object is selected. Shows position · size · rotation ·
// opacity · fill, plus font controls when the selected object is a textbox.
// ──────────────────────────────────────────────────────────────────────────

import { useMemo } from "react";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Obj = Record<string, any>; // fabric.Object — typed loosely to avoid fabric type friction

interface PropertiesPanelProps {
  object: Obj | null;
  onUpdate: (patch: Record<string, any>) => void;
  onDelete: () => void;
}

export function PropertiesPanel({ object, onUpdate, onDelete }: PropertiesPanelProps) {
  const isTextbox = useMemo(() => {
    if (!object) return false;
    const t = object.type;
    return t === "textbox" || t === "i-text" || t === "text";
  }, [object]);

  if (!object) {
    return (
      <aside
        className="w-60 shrink-0 border-l p-4"
        style={{ borderColor: "#E8E4DF", background: "#FDFBF7" }}
      >
        <div className="mt-24 text-center font-[family-name:'DM_Sans'] text-[12px] leading-relaxed text-ink-faint">
          Select an object to
          <br />
          edit its properties.
        </div>
      </aside>
    );
  }

  const width = Math.round(((object.width ?? 0) * (object.scaleX ?? 1)));
  const height = Math.round(((object.height ?? 0) * (object.scaleY ?? 1)));

  return (
    <aside
      className="flex w-60 shrink-0 flex-col overflow-y-auto border-l"
      style={{ borderColor: "#E8E4DF", background: "#FDFBF7" }}
    >
      <div className="border-b px-4 py-3" style={{ borderColor: "#E8E4DF" }}>
        <div className="flex items-center justify-between">
          <span className="font-[family-name:'DM_Sans'] text-[11px] uppercase tracking-[0.14em] text-ink-faint">
            Properties
          </span>
          <button
            onClick={onDelete}
            className="flex h-6 w-6 items-center justify-center rounded text-ink-faint hover:bg-rose-pale/40 hover:text-rose"
            title="Delete (Del)"
          >
            <Trash2 size={13} />
          </button>
        </div>
        <div className="mt-1 font-[family-name:'DM_Sans'] text-[11px] text-ink-muted">
          {humanizeType(object.type)}
        </div>
      </div>

      {/* Position + size */}
      <Section label="Position">
        <NumRow label="X" value={Math.round(object.left ?? 0)} onChange={(v) => onUpdate({ left: v })} />
        <NumRow label="Y" value={Math.round(object.top ?? 0)}  onChange={(v) => onUpdate({ top: v })} />
      </Section>

      <Section label="Size">
        <NumRow label="W" value={width}  onChange={(v) => onUpdate({ width: v / (object.scaleX ?? 1) })} />
        <NumRow label="H" value={height} onChange={(v) => onUpdate({ height: v / (object.scaleY ?? 1) })} />
      </Section>

      {/* Rotation */}
      <Section label="Rotation">
        <SliderRow
          value={Number(object.angle ?? 0)}
          min={-180}
          max={180}
          unit="°"
          onChange={(v) => onUpdate({ angle: v })}
        />
      </Section>

      {/* Opacity */}
      <Section label="Opacity">
        <SliderRow
          value={Math.round(((object.opacity ?? 1) as number) * 100)}
          min={0}
          max={100}
          unit="%"
          onChange={(v) => onUpdate({ opacity: v / 100 })}
        />
      </Section>

      {/* Fill colour */}
      <Section label={isTextbox ? "Text colour" : "Fill"}>
        <ColorRow value={object.fill ?? "#1A1A1A"} onChange={(c) => onUpdate({ fill: c })} />
      </Section>

      {/* Stroke — for non-text */}
      {!isTextbox && (
        <Section label="Stroke">
          <ColorRow value={object.stroke ?? "#00000000"} onChange={(c) => onUpdate({ stroke: c })} />
          <NumRow
            label="W"
            value={Number(object.strokeWidth ?? 0)}
            onChange={(v) => onUpdate({ strokeWidth: v })}
          />
        </Section>
      )}

      {/* Text-specific */}
      {isTextbox && (
        <>
          <Section label="Font size">
            <NumRow
              label="pt"
              value={Math.round(Number(object.fontSize ?? 16))}
              onChange={(v) => onUpdate({ fontSize: v })}
            />
          </Section>

          <Section label="Letter spacing">
            <SliderRow
              value={Number(object.charSpacing ?? 0)}
              min={-200}
              max={1200}
              unit=""
              onChange={(v) => onUpdate({ charSpacing: v })}
            />
          </Section>

          <Section label="Line height">
            <SliderRow
              value={Math.round((Number(object.lineHeight ?? 1.16)) * 100)}
              min={80}
              max={300}
              unit="%"
              onChange={(v) => onUpdate({ lineHeight: v / 100 })}
            />
          </Section>

          <Section label="Style">
            <div className="flex items-center gap-1">
              <ToggleBtn
                active={String(object.fontWeight ?? "normal").toString().toLowerCase() === "bold" || Number(object.fontWeight) >= 600}
                onClick={() =>
                  onUpdate({
                    fontWeight:
                      String(object.fontWeight ?? "normal").toString().toLowerCase() === "bold"
                        ? "normal"
                        : "bold",
                  })
                }
                label="Bold"
              >
                <Bold size={13} />
              </ToggleBtn>
              <ToggleBtn
                active={object.fontStyle === "italic"}
                onClick={() =>
                  onUpdate({ fontStyle: object.fontStyle === "italic" ? "normal" : "italic" })
                }
                label="Italic"
              >
                <Italic size={13} />
              </ToggleBtn>
              <ToggleBtn
                active={!!object.underline}
                onClick={() => onUpdate({ underline: !object.underline })}
                label="Underline"
              >
                <Underline size={13} />
              </ToggleBtn>
            </div>
          </Section>

          <Section label="Align">
            <div className="flex items-center gap-1">
              <ToggleBtn active={object.textAlign === "left"} onClick={() => onUpdate({ textAlign: "left" })} label="Left">
                <AlignLeft size={13} />
              </ToggleBtn>
              <ToggleBtn active={object.textAlign === "center"} onClick={() => onUpdate({ textAlign: "center" })} label="Center">
                <AlignCenter size={13} />
              </ToggleBtn>
              <ToggleBtn active={object.textAlign === "right"} onClick={() => onUpdate({ textAlign: "right" })} label="Right">
                <AlignRight size={13} />
              </ToggleBtn>
            </div>
          </Section>
        </>
      )}
    </aside>
  );
}

// ── Small building blocks ────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b px-4 py-3" style={{ borderColor: "#E8E4DF" }}>
      <div className="mb-2 font-[family-name:'DM_Sans'] text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
        {label}
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function NumRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="w-5 font-[family-name:'DM_Sans'] text-[11px] text-ink-faint">{label}</span>
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="min-w-0 flex-1 rounded border px-2 py-1 font-[family-name:'DM_Sans'] text-[11.5px] tabular-nums text-ink focus:border-gold focus:outline-none"
        style={{ borderColor: "#E8E4DF", background: "#FFFFFF" }}
      />
    </label>
  );
}

function SliderRow({
  value,
  min,
  max,
  unit,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="range"
        min={min}
        max={max}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 flex-1 accent-[#B8860B]"
      />
      <span className="w-10 text-right font-[family-name:'DM_Sans'] text-[11px] tabular-nums text-ink-muted">
        {Math.round(value)}
        {unit}
      </span>
    </div>
  );
}

function ColorRow({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const hex = typeof value === "string" && value.startsWith("#") ? value : "#000000";
  return (
    <label className="flex items-center gap-2">
      <input
        type="color"
        value={hex}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-9 cursor-pointer rounded border bg-transparent p-0"
        style={{ borderColor: "#E8E4DF" }}
      />
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 rounded border px-2 py-1 font-mono text-[11px] uppercase text-ink focus:border-gold focus:outline-none"
        style={{ borderColor: "#E8E4DF", background: "#FFFFFF" }}
      />
    </label>
  );
}

function ToggleBtn({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded border transition-colors",
        active ? "border-gold bg-gold-pale/40 text-ink" : "text-ink-muted hover:bg-ivory-warm/60",
      )}
      style={{ borderColor: active ? "#B8860B" : "#E8E4DF" }}
    >
      {children}
    </button>
  );
}

function humanizeType(t?: string) {
  if (!t) return "Object";
  if (t === "textbox" || t === "i-text" || t === "text") return "Text";
  if (t === "rect") return "Rectangle";
  if (t === "circle") return "Circle";
  if (t === "line") return "Line";
  if (t === "image") return "Image";
  if (t === "group") return "Group";
  if (t === "path" || t === "polygon") return "Shape";
  return t.charAt(0).toUpperCase() + t.slice(1);
}
