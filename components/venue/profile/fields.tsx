"use client";

import type { ReactNode } from "react";
import { VENUE_PALETTE } from "@/components/venue/ui";

/* Small primitives for the venue profile editor. Kept plain so the editor form reads
   linearly and the preview panel can stay visually dense without fighting these styles. */

export function FieldLabel({
  children,
  hint,
}: {
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-2">
      <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#9E8245]">
        {children}
      </label>
      {hint && <span className="text-[11px] italic text-[#8a8a8a]">{hint}</span>}
    </div>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full rounded-lg border bg-white px-3 py-2 text-[13.5px] text-[#2C2C2C] outline-none transition-colors focus:border-[#C4A265] ${className}`}
      style={{ borderColor: VENUE_PALETTE.hairline }}
    />
  );
}

export function TextArea({
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full resize-y rounded-lg border bg-white px-3 py-2 text-[13.5px] leading-[1.55] text-[#2C2C2C] outline-none transition-colors focus:border-[#C4A265]"
      style={{ borderColor: VENUE_PALETTE.hairline, fontFamily: "'EB Garamond', serif" }}
    />
  );
}

export function Select<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="w-full rounded-lg border bg-white px-3 py-2 text-[13.5px] text-[#2C2C2C] outline-none transition-colors focus:border-[#C4A265]"
      style={{ borderColor: VENUE_PALETTE.hairline }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function NumberInput({
  value,
  onChange,
  min = 0,
  step = 1,
  suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        min={min}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-lg border bg-white px-3 py-2 text-[13.5px] text-[#2C2C2C] outline-none transition-colors focus:border-[#C4A265]"
        style={{ borderColor: VENUE_PALETTE.hairline }}
      />
      {suffix && (
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#8a8a8a]">
          {suffix}
        </span>
      )}
    </div>
  );
}

export function EditorSection({
  id,
  eyebrow,
  title,
  description,
  action,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="rounded-2xl border bg-white p-6"
      style={{
        borderColor: VENUE_PALETTE.hairline,
        boxShadow:
          "0 1px 0 rgba(44,44,44,0.02), 0 18px 42px -36px rgba(44,44,44,0.18)",
      }}
    >
      <div className="flex flex-wrap items-end justify-between gap-3 border-b pb-4"
        style={{ borderColor: VENUE_PALETTE.hairlineSoft }}
      >
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-[#C4A265]">
            {eyebrow}
          </p>
          <h2
            className="mt-1 text-[22px] leading-none text-[#2C2C2C]"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, letterSpacing: "-0.005em" }}
          >
            {title}
          </h2>
          {description && (
            <p className="mt-1.5 max-w-[52ch] text-[12.5px] italic text-[#6a6a6a]" style={{ fontFamily: "'EB Garamond', serif" }}>
              {description}
            </p>
          )}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function TriToggle({
  value,
  onChange,
}: {
  value: "yes" | "no" | "ask";
  onChange: (v: "yes" | "no" | "ask") => void;
}) {
  const OPTIONS: Array<{ key: "yes" | "no" | "ask"; label: string; bg: string; color: string }> = [
    { key: "yes", label: "Yes", bg: "rgba(39, 174, 96, 0.14)", color: "#1e6e3d" },
    { key: "no", label: "No", bg: "rgba(192, 57, 43, 0.10)", color: "#8a2a20" },
    { key: "ask", label: "Ask us", bg: "rgba(196, 162, 101, 0.14)", color: "#6c5520" },
  ];
  return (
    <div
      className="inline-flex overflow-hidden rounded-full border"
      style={{ borderColor: VENUE_PALETTE.hairline }}
    >
      {OPTIONS.map((o) => {
        const active = value === o.key;
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            className="px-3 py-1 text-[11.5px] font-medium transition-colors"
            style={{
              backgroundColor: active ? o.bg : "transparent",
              color: active ? o.color : "#8a8a8a",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function GhostButton({
  children,
  onClick,
  type = "button",
  tone = "default",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  tone?: "default" | "danger";
}) {
  const border = tone === "danger" ? "rgba(192, 57, 43, 0.3)" : "rgba(196, 162, 101, 0.4)";
  const color = tone === "danger" ? "#8a2a20" : "#2C2C2C";
  return (
    <button
      type={type}
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border bg-white px-3.5 py-1.5 text-[12px] font-medium transition-colors hover:bg-[#F5E6D0]"
      style={{ borderColor: border, color }}
    >
      {children}
    </button>
  );
}

export function PrimaryButton({
  children,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-medium transition-colors"
      style={{ backgroundColor: VENUE_PALETTE.charcoal, color: "#FAF8F5" }}
    >
      {children}
    </button>
  );
}
