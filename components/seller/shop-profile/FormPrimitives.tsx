"use client";

import type { ReactNode } from "react";

export function FormSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section
      className="rounded-xl border bg-white"
      style={{ borderColor: "rgba(196,162,101,0.25)" }}
    >
      <header
        className="flex items-baseline justify-between gap-3 border-b px-6 py-4"
        style={{ borderColor: "rgba(44,44,44,0.06)" }}
      >
        <h3
          className="text-[18px] leading-none text-[#2C2C2C]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 500,
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </h3>
        {hint && (
          <p className="text-[11.5px] italic text-stone-500">{hint}</p>
        )}
      </header>
      <div className="space-y-5 px-6 py-5">{children}</div>
    </section>
  );
}

export function Field({
  label,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <label className="block" htmlFor={htmlFor}>
      <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#7a5a16]">
        {label}
      </p>
      {hint && (
        <p className="mt-1 text-[11.5px] italic text-stone-500">{hint}</p>
      )}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputStyle =
  "w-full rounded-md border bg-[#FFFFFA] px-3 py-2 text-[13.5px] text-[#2C2C2C] outline-none transition-colors focus:border-[#C4A265] focus:bg-white";

export function TextInput({
  value,
  onChange,
  placeholder,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  id?: string;
}) {
  return (
    <input
      id={id}
      type="text"
      className={inputStyle}
      style={{ borderColor: "rgba(44,44,44,0.15)" }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <input
      type="number"
      className={`${inputStyle} w-24`}
      style={{ borderColor: "rgba(44,44,44,0.15)" }}
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
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
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      className={`${inputStyle} resize-y leading-relaxed`}
      style={{ borderColor: "rgba(44,44,44,0.15)" }}
      rows={rows}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function FileDropBox({
  label,
  current,
  onClear,
}: {
  label: string;
  current?: string | null;
  onClear?: () => void;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-md border border-dashed px-4 py-3 text-[12.5px] text-stone-500"
      style={{ borderColor: "rgba(196,162,101,0.4)", backgroundColor: "#FBF3E4" }}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-[14px] text-[#7a5a16]" aria-hidden>
        ⬆
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] text-[#2C2C2C]">{label}</p>
        <p className="text-[11px] text-stone-500">
          {current ? "Uploaded · drag a new file to replace" : "Drop file, or click to browse"}
        </p>
      </div>
      {current && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="text-[11.5px] text-[#C97B63] hover:underline"
        >
          Remove
        </button>
      )}
    </div>
  );
}

export function TogglePill({
  label,
  on,
  onToggle,
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] transition-colors ${
        on
          ? "text-[#7a5a16]"
          : "text-stone-500 hover:text-[#2C2C2C]"
      }`}
      style={{
        backgroundColor: on ? "#F5E6D0" : "#FFFFFA",
        borderColor: on ? "rgba(196,162,101,0.55)" : "rgba(44,44,44,0.12)",
      }}
    >
      <span
        className="flex h-3.5 w-3.5 items-center justify-center rounded-[3px] border text-[9px]"
        style={{
          borderColor: on ? "#7a5a16" : "rgba(44,44,44,0.3)",
          backgroundColor: on ? "#7a5a16" : "transparent",
          color: "#FFFFFA",
        }}
        aria-hidden
      >
        {on ? "✓" : ""}
      </span>
      {label}
    </button>
  );
}

export function SwitchRow({
  label,
  hint,
  on,
  onToggle,
}: {
  label: string;
  hint?: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-[13px] text-[#2C2C2C]">{label}</p>
        {hint && <p className="mt-0.5 text-[11.5px] text-stone-500">{hint}</p>}
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={on}
        className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
        style={{
          backgroundColor: on ? "#C4A265" : "rgba(44,44,44,0.2)",
        }}
      >
        <span
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
          style={{ left: on ? "calc(100% - 22px)" : "2px" }}
          aria-hidden
        />
      </button>
    </div>
  );
}

export function TagRow({
  values,
  onRemove,
  onAdd,
  placeholder,
}: {
  values: string[];
  onRemove: (idx: number) => void;
  onAdd: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-1.5 rounded-md border bg-[#FFFFFA] px-2 py-1.5"
      style={{ borderColor: "rgba(44,44,44,0.15)" }}
    >
      {values.map((v, idx) => (
        <span
          key={`${v}-${idx}`}
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] text-[#7a5a16]"
          style={{ backgroundColor: "#F5E6D0" }}
        >
          {v}
          <button
            type="button"
            onClick={() => onRemove(idx)}
            className="text-[10px] text-[#7a5a16]/70 hover:text-[#C97B63]"
            aria-label={`Remove ${v}`}
          >
            ✕
          </button>
        </span>
      ))}
      <input
        type="text"
        className="min-w-[100px] flex-1 border-0 bg-transparent px-1 py-0.5 text-[12.5px] outline-none"
        placeholder={placeholder ?? "Add, then Enter"}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.currentTarget.value.trim()) {
            e.preventDefault();
            onAdd(e.currentTarget.value.trim());
            e.currentTarget.value = "";
          }
        }}
      />
    </div>
  );
}
