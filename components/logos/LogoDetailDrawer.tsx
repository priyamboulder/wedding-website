"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Check, Download, Loader2, X } from "lucide-react";
import type { LogoConnector, LogoTemplate } from "@/types/logo";
import { LOGO_SELECTED_RING, LOGO_TILE } from "@/types/logo";
import { LOGO_COMPONENTS } from "./templates";
import { EditableField } from "@/components/monograms/EditableField";
import { ColorPicker } from "@/components/monograms/ColorPicker";
import { useBrandOverridesStore } from "@/stores/brand-overrides-store";
import {
  useBrandRenderData,
  type BrandProfile,
} from "@/lib/useBrandRenderData";
import {
  buildLogoFilename,
  exportLogo,
  slugify,
  type LogoExportFormat,
} from "@/lib/logo-export";
import { cn } from "@/lib/utils";

export interface LogoDetailDrawerProps {
  template: LogoTemplate;
  profile: BrandProfile;
  selected: boolean;
  onApply: () => void;
  onUnapply: () => void;
  onClose: () => void;
  coupleSlug?: string;
  onToast?: (message: string) => void;
}

const CONNECTOR_LABELS: Record<LogoConnector, string> = {
  and: "and",
  "&": "ampersand (&)",
  "|": "vertical bar (|)",
  "*": "asterisk (∗)",
  "•": "bullet (•)",
};

export function LogoDetailDrawer({
  template,
  profile,
  selected,
  onApply,
  onUnapply,
  onClose,
  coupleSlug,
  onToast,
}: LogoDetailDrawerProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const Component = LOGO_COMPONENTS[template.componentKey];
  const { logo: rendered } = useBrandRenderData(profile, {
    logoTemplateDefaultConnector: template.defaultConnector,
  });
  const setNames = useBrandOverridesStore((s) => s.setNames);
  const setConnector = useBrandOverridesStore((s) => s.setConnector);
  const setColor = useBrandOverridesStore((s) => s.setColor);
  const resetAll = useBrandOverridesStore((s) => s.resetAll);

  const effectiveConnector: LogoConnector = template.compatibleConnectors.includes(
    rendered.connector,
  )
    ? rendered.connector
    : template.defaultConnector;

  const previewRef = useRef<HTMLDivElement>(null);

  const resolvedCoupleSlug = useMemo(() => {
    if (coupleSlug) return coupleSlug;
    const [a, b] = rendered.names;
    return slugify(`${a} ${b}`.trim());
  }, [coupleSlug, rendered.names]);

  const commitNames = (next: [string, string]) => {
    const cleaned: [string, string] = [
      next[0].trim().slice(0, 30),
      next[1].trim().slice(0, 30),
    ];
    const matchesProfile =
      cleaned[0] === profile.names[0] && cleaned[1] === profile.names[1];
    setNames(matchesProfile ? null : cleaned);
  };

  const commitColor = (next: string) => {
    const cleaned = next.toLowerCase();
    const profileColor = (profile.color ?? "#1a1a1a").toLowerCase();
    if (cleaned === profileColor) setColor(null);
    else setColor(next);
  };

  const commitConnector = (next: LogoConnector) => {
    // If the chosen connector matches the template default, clear the
    // surface-wide override so the template's own preference stays intact
    // when the couple browses other templates.
    if (next === template.defaultConnector) {
      setConnector(null);
    } else {
      setConnector(next);
    }
  };

  const handleDownload = async (format: LogoExportFormat) => {
    const svg = previewRef.current?.querySelector("svg");
    try {
      await exportLogo({
        svgNode: svg as SVGElement | null,
        format,
        coupleSlug: resolvedCoupleSlug,
        templateSlug: template.slug,
      });
      const filename = buildLogoFilename({
        coupleSlug: resolvedCoupleSlug,
        templateSlug: template.slug,
        ext: format === "svg" ? "svg" : format === "pdf" ? "pdf" : "png",
      });
      onToast?.(`Downloaded ${filename}`);
    } catch (err) {
      console.error("Logo export failed", err);
      onToast?.("Download failed. Please try again.");
    }
  };

  const handleApplyClick = () => {
    if (selected) {
      onUnapply();
      onToast?.("Logo removed. No logo is currently applied.");
    } else {
      onApply();
      onToast?.(
        `${template.name.replace(/\s+logo$/i, "")} logo applied across website, email signatures, and print.`,
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
              Wedding Logo
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
            style={{ background: LOGO_TILE, aspectRatio: "16 / 10" }}
          >
            <div className="flex h-full w-full items-center justify-center p-10">
              <Component
                names={rendered.names}
                connector={effectiveConnector}
                color={rendered.color}
              />
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-ink/10 pt-5">
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
                Category
              </dt>
              <dd className="mt-1 text-sm capitalize text-ink">{template.category}</dd>
            </div>

            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
                Default connector
              </dt>
              <dd className="mt-1 text-sm capitalize text-ink">
                {CONNECTOR_LABELS[template.defaultConnector]}
              </dd>
            </div>

            <div className="col-span-2">
              <EditableField
                label="Names"
                edited={rendered.editedFields.names}
                display={
                  <span>
                    {rendered.names[0]} &amp; {rendered.names[1]}
                  </span>
                }
              >
                {({ finish }) => (
                  <NamesEditor
                    value={rendered.names}
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
                  Connector style
                </dt>
                {rendered.editedFields.connector && (
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
                <ConnectorDropdown
                  value={effectiveConnector}
                  options={template.compatibleConnectors}
                  onChange={commitConnector}
                />
              </dd>
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
                <ColorPicker value={rendered.color} onChange={commitColor} />
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
            Your names are injected live into this wordmark and cascade to your
            website header, email signatures, and print once applied.
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-3 border-t border-ink/10 bg-card p-6">
          <LogoDownloadMenu onDownload={handleDownload} />
          <button
            type="button"
            onClick={handleApplyClick}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md px-5 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ivory transition-colors"
            style={{ background: selected ? LOGO_SELECTED_RING : "#1a1a1a" }}
            aria-pressed={selected}
          >
            {selected ? (
              <>
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                Applied
              </>
            ) : (
              "Apply Logo"
            )}
          </button>
        </div>
      </div>
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

function ConnectorDropdown({
  value,
  options,
  onChange,
}: {
  value: LogoConnector;
  options: LogoConnector[];
  onChange: (next: LogoConnector) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex w-full items-center justify-between rounded-sm border border-ink/30 bg-ivory px-3 py-2 text-sm text-ink transition-colors hover:border-ink"
      >
        <span className="capitalize">{CONNECTOR_LABELS[value]}</span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
          strokeWidth={2}
        />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-sm border border-ink/20 bg-ivory shadow-xl"
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              role="option"
              aria-selected={opt === value}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between border-b border-ink/5 px-3 py-2 text-left text-sm text-ink transition-colors last:border-b-0 hover:bg-gold-pale/30",
                opt === value && "bg-gold-pale/20",
              )}
            >
              <span className="capitalize">{CONNECTOR_LABELS[opt]}</span>
              {opt === value && <Check className="h-3.5 w-3.5" strokeWidth={2} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const DOWNLOAD_OPTIONS: { key: LogoExportFormat; label: string; hint: string }[] = [
  { key: "svg", label: "SVG", hint: "Vector, scalable — best for designers" },
  { key: "png-transparent", label: "PNG", hint: "2048×2048 · transparent background" },
  { key: "png-ivory", label: "PNG", hint: "2048×2048 · ivory background (#F5F1EA)" },
  { key: "pdf", label: "PDF", hint: "Letter-size landscape, centered, print-ready" },
];

function LogoDownloadMenu({
  onDownload,
}: {
  onDownload: (format: LogoExportFormat) => Promise<void> | void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<LogoExportFormat | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const run = async (format: LogoExportFormat) => {
    if (busy) return;
    setBusy(format);
    try {
      await onDownload(format);
    } finally {
      setBusy(null);
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-ink px-5 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink transition-colors hover:bg-ink hover:text-ivory"
      >
        <Download className="h-3.5 w-3.5" strokeWidth={2} />
        Download
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
          strokeWidth={2}
        />
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Download format"
          className="absolute bottom-full left-0 right-0 z-10 mb-2 overflow-hidden rounded-md border border-ink/15 bg-ivory shadow-xl"
        >
          {DOWNLOAD_OPTIONS.map((opt) => {
            const isBusy = busy === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                role="menuitem"
                onClick={() => run(opt.key)}
                disabled={busy !== null}
                className={cn(
                  "flex w-full items-center gap-3 border-b border-ink/5 px-4 py-3 text-left transition-colors last:border-b-0 focus:bg-gold-pale/30 focus:outline-none hover:bg-gold-pale/30",
                  busy !== null && !isBusy && "opacity-40",
                )}
              >
                <div className="w-10 font-mono text-[11px] uppercase tracking-[0.18em] text-ink">
                  {opt.label}
                </div>
                <div className="flex-1 text-[12px] leading-snug text-ink-muted">
                  {opt.hint}
                </div>
                {isBusy && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-ink-muted" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LogoDetailDrawer;
