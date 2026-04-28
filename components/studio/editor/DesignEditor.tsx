"use client";

// ══════════════════════════════════════════════════════════════════════════
//   DesignEditor — host that wraps CanvasEditor with load/save glue.
//
//   Resolves a user_design by id from the store, hands its canvas_data to
//   the editor, and persists saves back through the store. Also offers a
//   rename affordance + back link to the marketplace.
// ══════════════════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import { ChevronLeft, Check, Pencil } from "lucide-react";
import { CanvasEditor } from "@/components/studio/canvas-editor/CanvasEditor";
import { useUserDesignsStore } from "@/stores/user-designs-store";
import { cn } from "@/lib/utils";

interface Props {
  designId: string;
}

export function DesignEditor({ designId }: Props) {
  const router = useRouter();
  const design = useUserDesignsStore((s) => s.getById(designId));
  const updateCanvas = useUserDesignsStore((s) => s.updateCanvas);
  const rename = useUserDesignsStore((s) => s.rename);

  const [hasHydrated, setHasHydrated] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [nameEditing, setNameEditing] = useState(false);
  const [draftName, setDraftName] = useState("");

  // Give Zustand's persist middleware a tick to rehydrate before deciding the
  // design is missing — otherwise a hard refresh on the editor URL would 404.
  useEffect(() => {
    const t = setTimeout(() => setHasHydrated(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (design) setDraftName(design.name);
  }, [design?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Not found ────────────────────────────────────────────────────────

  if (!design && hasHydrated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ivory px-6 text-center">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-saffron">
          Studio · Editor
        </p>
        <h1 className="mt-3 font-serif text-[28px] text-ink">This design no longer exists</h1>
        <p className="mt-2 max-w-md font-[family-name:'DM_Sans'] text-[13px] text-ink-muted">
          The design you&apos;re looking for was deleted or belongs to a different device. Pick a
          template to start a fresh one.
        </p>
        <button
          onClick={() => router.push("/studio")}
          className="mt-5 rounded-md bg-ink px-4 py-2 text-[13px] font-medium text-ivory hover:bg-ink-soft"
        >
          Back to Studio
        </button>
      </div>
    );
  }

  if (!design) {
    return (
      <div className="flex h-screen items-center justify-center bg-ivory">
        <div className="font-[family-name:'DM_Sans'] text-[12.5px] tracking-[0.12em] text-ink-faint">
          LOADING DESIGN…
        </div>
      </div>
    );
  }

  // ── Save handler — persists JSON + thumbnail dataURL ─────────────────

  async function handleSave(canvasJSON: object, thumbBlob: Blob) {
    const thumbDataURL = await blobToDataURL(thumbBlob);
    updateCanvas(designId, canvasJSON, thumbDataURL);
    setSavedAt(new Date());
  }

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen flex-col">
      {/* Name / back strip above the editor chrome */}
      <div className="flex shrink-0 items-center justify-between border-b px-5 py-2.5" style={{ borderColor: "#E8E4DF", background: "#FDFBF7" }}>
        <div className="flex min-w-0 items-center gap-3">
          <NextLink
            href={`/studio/${design.surface_type}/templates`}
            className="inline-flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-muted hover:text-ink"
          >
            <ChevronLeft size={11} /> Templates
          </NextLink>
          <span className="text-ink-faint">·</span>

          {nameEditing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const n = draftName.trim();
                if (n && n !== design.name) rename(design.id, n);
                setNameEditing(false);
              }}
              className="flex items-center gap-2"
            >
              <input
                autoFocus
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onBlur={() => {
                  const n = draftName.trim();
                  if (n && n !== design.name) rename(design.id, n);
                  setNameEditing(false);
                }}
                className="max-w-xs rounded border px-2 py-1 font-serif text-[14px] text-ink focus:border-gold focus:outline-none"
                style={{ borderColor: "#E8E4DF", background: "#FFFFFF" }}
              />
            </form>
          ) : (
            <button
              onClick={() => {
                setDraftName(design.name);
                setNameEditing(true);
              }}
              className="group flex min-w-0 items-center gap-2"
            >
              <span className="truncate font-serif text-[14px] text-ink">{design.name}</span>
              <Pencil size={11} className="text-ink-faint opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <StatusChip status={design.status} />
          {savedAt && (
            <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">
              <Check size={11} className="text-sage" /> saved {relativeTime(savedAt)}
            </span>
          )}
        </div>
      </div>

      {/* The editor itself */}
      <div className="min-h-0 flex-1">
        <CanvasEditor
          canvasData={design.canvas_data}
          canvasWidth={design.canvas_width}
          canvasHeight={design.canvas_height}
          surfaceType={design.surface_type}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}

// ── Subcomponents ─────────────────────────────────────────────────────────

function StatusChip({ status }: { status: string }) {
  const tone = useMemo(() => {
    switch (status) {
      case "finalized": return { bg: "rgba(156,175,136,0.18)", fg: "#4A6B40", border: "rgba(156,175,136,0.5)" };
      case "in_review": return { bg: "rgba(212,162,76,0.18)", fg: "#8B6F2C", border: "rgba(212,162,76,0.5)" };
      case "ordered":   return { bg: "rgba(91,142,138,0.18)", fg: "#3E6B68", border: "rgba(91,142,138,0.5)" };
      default:          return { bg: "#EDE7D9", fg: "#6B6B6B", border: "rgba(26,26,26,0.1)" };
    }
  }, [status]);
  return (
    <span
      className={cn(
        "rounded-full border px-2.5 py-0.5 font-[family-name:'DM_Sans'] text-[10px] uppercase tracking-[0.14em]",
      )}
      style={{ background: tone.bg, color: tone.fg, borderColor: tone.border }}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function relativeTime(d: Date): string {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 10) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}
