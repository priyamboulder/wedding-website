"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import type { MonogramProps, MonogramTemplate } from "@/types/monogram";
import { MONOGRAM_SELECTED_RING, MONOGRAM_TILE } from "@/types/monogram";
import { MONOGRAM_COMPONENTS } from "./templates";
import { EditableField } from "./EditableField";
import { DownloadMenu } from "./DownloadMenu";
import { ColorPicker } from "./ColorPicker";
import { useMonogramOverridesStore } from "@/stores/monogram-overrides-store";
import { useMonogramRenderData } from "@/lib/useMonogramRenderData";
import {
  buildFilename,
  exportMonogram,
  slugify,
  type MonogramExportFormat,
} from "@/lib/monogram-export";

export interface MonogramDetailDrawerProps {
  template: MonogramTemplate;
  profile: MonogramProps;
  selected: boolean;
  onApply: () => void;
  onUnapply: () => void;
  onClose: () => void;
  coupleSlug?: string;
  onToast?: (message: string) => void;
}

function formatDateLong(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function toDateInputValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fromDateInputValue(v: string): Date {
  const [y, m, d] = v.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function MonogramDetailDrawer({
  template,
  profile,
  selected,
  onApply,
  onUnapply,
  onClose,
  coupleSlug,
  onToast,
}: MonogramDetailDrawerProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const Component = MONOGRAM_COMPONENTS[template.componentKey];
  const rendered = useMonogramRenderData(profile);
  const overrides = useMonogramOverridesStore((s) => s.overrides);
  const setInitials = useMonogramOverridesStore((s) => s.setInitials);
  const setNames = useMonogramOverridesStore((s) => s.setNames);
  const setDate = useMonogramOverridesStore((s) => s.setDate);
  const setLocation = useMonogramOverridesStore((s) => s.setLocation);
  const setColor = useMonogramOverridesStore((s) => s.setColor);
  const setUseLongInitials = useMonogramOverridesStore((s) => s.setUseLongInitials);
  const resetAll = useMonogramOverridesStore((s) => s.resetAll);

  const previewRef = useRef<HTMLDivElement>(null);

  const initialsSlot: [string, string] = rendered.initials;
  const namesSlot: [string, string] = rendered.names;

  const useLong = overrides.useLongInitials;
  const initialsMax = useLong ? 4 : 1;

  const resolvedCoupleSlug = useMemo(() => {
    if (coupleSlug) return coupleSlug;
    const first = rendered.names[0] || rendered.initials[0] || "couple";
    const second = rendered.names[1] || rendered.initials[1] || "";
    return slugify(`${first} ${second}`.trim());
  }, [coupleSlug, rendered.names, rendered.initials]);

  const commitInitials = (next: [string, string]) => {
    const cleaned: [string, string] = [
      next[0].toUpperCase().slice(0, initialsMax),
      next[1].toUpperCase().slice(0, initialsMax),
    ];
    const matchesProfile =
      cleaned[0] === profile.initials[0] && cleaned[1] === profile.initials[1];
    setInitials(matchesProfile ? null : cleaned);
  };

  const commitNames = (next: [string, string]) => {
    const cleaned: [string, string] = [
      next[0].trim().slice(0, 30),
      next[1].trim().slice(0, 30),
    ];
    const matchesProfile =
      cleaned[0] === profile.names[0] && cleaned[1] === profile.names[1];
    setNames(matchesProfile ? null : cleaned);
  };

  const commitDate = (next: Date) => {
    const sameDay =
      next.getFullYear() === profile.date.getFullYear() &&
      next.getMonth() === profile.date.getMonth() &&
      next.getDate() === profile.date.getDate();
    if (sameDay) setDate(null);
    else setDate(next.toISOString());
  };

  const commitLocation = (next: string) => {
    const cleaned = next.slice(0, 40);
    if (cleaned === (profile.location ?? "")) setLocation(null);
    else setLocation(cleaned);
  };

  const commitColor = (next: string) => {
    const cleaned = next.toLowerCase();
    const profileColor = (profile.color ?? "#1a1a1a").toLowerCase();
    if (cleaned === profileColor) setColor(null);
    else setColor(next);
  };

  const handleDownload = async (format: MonogramExportFormat) => {
    const svg = previewRef.current?.querySelector("svg");
    try {
      await exportMonogram({
        svgNode: svg as SVGElement | null,
        format,
        coupleSlug: resolvedCoupleSlug,
        templateSlug: template.slug,
      });
      const filename = buildFilename({
        coupleSlug: resolvedCoupleSlug,
        templateSlug: template.slug,
        ext:
          format === "svg" ? "svg" : format === "pdf" ? "pdf" : "png",
      });
      onToast?.(`Downloaded ${filename}`);
    } catch (err) {
      console.error("Monogram export failed", err);
      onToast?.("Download failed. Please try again.");
    }
  };

  const handleApplyClick = () => {
    if (selected) {
      onUnapply();
      onToast?.("Monogram removed. No monogram is currently applied.");
    } else {
      onApply();
      onToast?.(
        `${template.name.replace(/\s+monogram$/i, "")} monogram applied across website, invitations, and print.`,
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-ink/30 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${template.name} details`}
    >
      <div
        className="flex h-full w-full max-w-[540px] flex-col overflow-y-auto bg-ivory shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-ink/10 p-6">
          <div>
            <div
              className="text-xs italic text-ink-muted"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              Wedding Monogram
            </div>
            <h2
              className="mt-1 text-2xl text-ink"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              {template.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="rounded-md p-1.5 text-ink-muted hover:bg-ivory-deep hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          <div
            ref={previewRef}
            className="overflow-hidden rounded-xl"
            style={{ background: MONOGRAM_TILE, aspectRatio: "16 / 10" }}
          >
            <div className="flex h-full w-full items-center justify-center p-10">
              <Component {...rendered} />
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-ink/10 pt-5">
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
                Category
              </dt>
              <dd className="mt-1 text-sm capitalize text-ink">{template.category}</dd>
            </div>

            <EditableField
              label="Initials"
              edited={rendered.editedFields.initials}
              display={
                <span>
                  {initialsSlot[0]} &amp; {initialsSlot[1]}
                </span>
              }
            >
              {({ finish }) => (
                <InitialsEditor
                  value={initialsSlot}
                  max={initialsMax}
                  useLong={useLong}
                  onToggleLong={(v) => {
                    setUseLongInitials(v);
                    if (!v) {
                      commitInitials([
                        initialsSlot[0].slice(0, 1),
                        initialsSlot[1].slice(0, 1),
                      ]);
                    }
                  }}
                  onCommit={(next) => {
                    commitInitials(next);
                    finish();
                  }}
                />
              )}
            </EditableField>

            <EditableField
              label="Date"
              edited={rendered.editedFields.date}
              display={<span>{formatDateLong(rendered.date)}</span>}
            >
              {({ finish }) => (
                <input
                  type="date"
                  autoFocus
                  defaultValue={toDateInputValue(rendered.date)}
                  onBlur={(e) => {
                    if (e.currentTarget.value) {
                      commitDate(fromDateInputValue(e.currentTarget.value));
                    }
                    finish();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (e.currentTarget.value) {
                        commitDate(fromDateInputValue(e.currentTarget.value));
                      }
                      finish();
                    } else if (e.key === "Escape") {
                      finish();
                    }
                  }}
                  className="w-full rounded-sm border border-ink bg-ivory px-2 py-1 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-ink"
                />
              )}
            </EditableField>

            <EditableField
              label="Location"
              edited={rendered.editedFields.location}
              display={<span>{rendered.location || "—"}</span>}
            >
              {({ finish }) => (
                <input
                  type="text"
                  autoFocus
                  maxLength={40}
                  defaultValue={rendered.location ?? ""}
                  onBlur={(e) => {
                    commitLocation(e.currentTarget.value);
                    finish();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      commitLocation(e.currentTarget.value);
                      finish();
                    } else if (e.key === "Escape") {
                      finish();
                    }
                  }}
                  className="w-full rounded-sm border border-ink bg-ivory px-2 py-1 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-ink"
                />
              )}
            </EditableField>

            <div className="col-span-2">
              <EditableField
                label="Names"
                edited={rendered.editedFields.names}
                display={
                  <span>
                    {namesSlot[0]} &amp; {namesSlot[1]}
                  </span>
                }
              >
                {({ finish }) => (
                  <NamesEditor
                    value={namesSlot}
                    onCommit={(next) => {
                      commitNames(next);
                      finish();
                    }}
                  />
                )}
              </EditableField>
            </div>

            <div className="col-span-2">
              <div className="flex items-center gap-2">
                <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
                  Color
                </dt>
                {rendered.editedFields.color && (
                  <span
                    className="rounded-sm px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em]"
                    style={{
                      fontFamily: "'Fraunces', Georgia, serif",
                      fontStyle: "italic",
                      background: "rgba(184, 134, 11, 0.12)",
                      color: "#8a6609",
                    }}
                  >
                    Edited
                  </span>
                )}
              </div>
              <dd className="mt-1.5">
                <ColorPicker
                  value={rendered.color ?? "#1a1a1a"}
                  onChange={commitColor}
                />
              </dd>
            </div>
          </dl>

          {rendered.hasAnyOverride && (
            <div className="mt-3 flex items-center justify-end">
              <button
                type="button"
                onClick={resetAll}
                className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink underline decoration-ink/50 underline-offset-4 hover:decoration-ink"
              >
                Reset to wedding profile
              </button>
            </div>
          )}

          <p className="mt-6 text-sm leading-relaxed text-ink-muted">
            Your initials, wedding date, and location are injected live into this
            template and cascade to your website, invitations, and print once
            applied.
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-3 border-t border-ink/10 bg-card p-6">
          <DownloadMenu onDownload={handleDownload} />
          <button
            type="button"
            onClick={handleApplyClick}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md px-5 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ivory transition-colors"
            style={{ background: selected ? MONOGRAM_SELECTED_RING : "#1a1a1a" }}
            aria-pressed={selected}
          >
            {selected ? (
              <>
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                Applied
              </>
            ) : (
              "Apply Monogram"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function InitialsEditor({
  value,
  max,
  useLong,
  onToggleLong,
  onCommit,
}: {
  value: [string, string];
  max: number;
  useLong: boolean;
  onToggleLong: (v: boolean) => void;
  onCommit: (next: [string, string]) => void;
}) {
  const [a, setA] = useState(value[0]);
  const [b, setB] = useState(value[1]);
  const wrapRef = useRef<HTMLDivElement>(null);

  const commit = () => onCommit([a, b]);
  const onInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const next = e.relatedTarget as Node | null;
    if (next && wrapRef.current?.contains(next)) return;
    commit();
  };

  const widthClass = max > 1 ? "w-14" : "w-8";

  return (
    <div ref={wrapRef} className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <input
          autoFocus
          type="text"
          value={a}
          maxLength={max}
          onChange={(e) => setA(e.target.value.toUpperCase())}
          onFocus={(e) => e.currentTarget.select()}
          onBlur={onInputBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
          }}
          className={`${widthClass} rounded-sm border border-ink bg-ivory px-2 py-1 text-center text-sm uppercase text-ink focus:outline-none focus:ring-1 focus:ring-ink`}
        />
        <span className="text-sm text-ink">&amp;</span>
        <input
          type="text"
          value={b}
          maxLength={max}
          onChange={(e) => setB(e.target.value.toUpperCase())}
          onFocus={(e) => e.currentTarget.select()}
          onBlur={onInputBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
          }}
          className={`${widthClass} rounded-sm border border-ink bg-ivory px-2 py-1 text-center text-sm uppercase text-ink focus:outline-none focus:ring-1 focus:ring-ink`}
        />
      </div>
      <label className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
        <input
          type="checkbox"
          checked={useLong}
          onChange={(e) => onToggleLong(e.target.checked)}
          className="h-3 w-3 accent-gold"
        />
        Use longer initials
      </label>
    </div>
  );
}

function NamesEditor({
  value,
  onCommit,
}: {
  value: [string, string];
  onCommit: (next: [string, string]) => void;
}) {
  const [a, setA] = useState(value[0]);
  const [b, setB] = useState(value[1]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const commit = () => onCommit([a, b]);
  const onInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const next = e.relatedTarget as Node | null;
    if (next && wrapRef.current?.contains(next)) return;
    commit();
  };

  return (
    <div ref={wrapRef} className="flex items-center gap-2">
      <input
        autoFocus
        type="text"
        value={a}
        maxLength={30}
        onChange={(e) => setA(e.target.value)}
        onBlur={onInputBlur}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
        }}
        className="flex-1 rounded-sm border border-ink bg-ivory px-2 py-1 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-ink"
      />
      <span className="text-sm text-ink">&amp;</span>
      <input
        type="text"
        value={b}
        maxLength={30}
        onChange={(e) => setB(e.target.value)}
        onBlur={onInputBlur}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
        }}
        className="flex-1 rounded-sm border border-ink bg-ivory px-2 py-1 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-ink"
      />
    </div>
  );
}

export default MonogramDetailDrawer;
