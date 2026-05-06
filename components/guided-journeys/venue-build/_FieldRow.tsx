"use client";

// ── Shared field-row primitive for venue Build sessions ─────────────────────
// Each session renders a list of label-over-input rows. Using PanelCard +
// Eyebrow + InlineText keeps the visual language consistent with the rest
// of the venue workspace, where these primitives appear on every tab.

import type { ReactNode } from "react";
import {
  Eyebrow,
} from "@/components/workspace/blocks/primitives";
import { InlineText } from "@/components/workspace/editable/InlineText";

export function FieldRow({
  label,
  value,
  onSave,
  placeholder,
  variant = "line",
}: {
  label: string;
  value: string;
  onSave: (next: string) => void;
  placeholder?: string;
  variant?: "line" | "block";
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-start gap-2 py-1">
      <Eyebrow className="pt-1.5">{label}</Eyebrow>
      <InlineText
        value={value}
        onSave={onSave}
        variant={variant}
        allowEmpty
        placeholder={placeholder ?? "—"}
        className="!p-0 text-[12.5px] leading-relaxed"
      />
    </div>
  );
}

export function StackedField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <Eyebrow className="mb-1 block">{label}</Eyebrow>
      {children}
    </div>
  );
}
