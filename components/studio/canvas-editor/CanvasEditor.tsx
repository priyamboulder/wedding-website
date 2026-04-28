"use client";

// ══════════════════════════════════════════════════════════════════════════
//   CANVAS EDITOR — the Ananya Studio's Canva-like builder.
//
//   Every Studio surface (Monogram, Wedding Logo, Invitations, Print &
//   Signage, Save-the-Dates, RSVP cards, social posts, WhatsApp invites,
//   Outfit Guides, …) renders through this single component.
//
//   Usage:
//     import { CanvasEditor, useCanvasEditor } from
//       "@/components/studio/canvas-editor/CanvasEditor";
//
//     const editor = useCanvasEditor();
//
//     <CanvasEditor
//       ref={editor.ref}
//       canvasData={template?.canvas_data ?? null}
//       canvasWidth={1500}
//       canvasHeight={2100}
//       surfaceType="invitation"
//       onSave={(json, thumbBlob) => saveToSupabase(json, thumbBlob)}
//     />
//
//   The editor is entirely client-side — fabric.js needs `window`, so we
//   dynamic-import the inner component with `ssr: false`. A lightweight
//   skeleton renders during the first paint so the page doesn't flash.
// ══════════════════════════════════════════════════════════════════════════

import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import dynamic from "next/dynamic";
import type {
  CanvasEditorHandle,
  CanvasEditorProps,
} from "./types";

// Re-export types so callers only import from CanvasEditor.tsx.
export type {
  CanvasEditorHandle,
  CanvasEditorProps,
  SurfaceType,
  CanvasSize,
  TrendingPalette,
  FontEntry,
  UploadedAsset,
  MotifRow,
  AISuggestion,
  LeftPanel,
} from "./types";

export { PHYSICAL_SURFACES } from "./types";
export { SURFACE_SIZES, TRENDING_PALETTES, FONT_CATALOG } from "./data";

// ── Dynamic inner (client-only) ─────────────────────────────────────────

const EditorInner = dynamic(() => import("./editor-inner"), {
  ssr: false,
  loading: () => <EditorSkeleton />,
});

// ── Public component ────────────────────────────────────────────────────

export const CanvasEditor = forwardRef<CanvasEditorHandle, CanvasEditorProps>(
  function CanvasEditor(props, ref) {
    // `next/dynamic` does not forward refs, so the inner component accepts
    // `handleRef` as a normal prop and calls `useImperativeHandle` against it.
    const innerRef = useRef<CanvasEditorHandle | null>(null);
    useImperativeHandle(
      ref,
      () => {
        const proxy: CanvasEditorHandle = {
          addText: (...a) => innerRef.current?.addText(...a),
          addShape: (...a) => innerRef.current?.addShape(...a),
          addSVG: (...a) => innerRef.current?.addSVG(...a),
          addImage: (...a) => innerRef.current?.addImage(...a),
          setBackground: (...a) => innerRef.current?.setBackground(...a),
          applyPalette: (...a) => innerRef.current?.applyPalette(...a),
          deleteSelected: () => innerRef.current?.deleteSelected(),
          undo: () => innerRef.current?.undo(),
          redo: () => innerRef.current?.redo(),
          zoomIn: () => innerRef.current?.zoomIn(),
          zoomOut: () => innerRef.current?.zoomOut(),
          setZoom: (z) => innerRef.current?.setZoom(z),
          exportJSON: () => innerRef.current?.exportJSON() ?? null,
          exportPNG: () => innerRef.current?.exportPNG() ?? Promise.resolve(null),
          save: () => innerRef.current?.save(),
        };
        return proxy;
      },
      [],
    );
    return <EditorInner {...props} handleRef={innerRef} />;
  },
);

// ── Hook for parents who'd rather not wire a ref ─────────────────────────

export interface UseCanvasEditor {
  ref: React.MutableRefObject<CanvasEditorHandle | null>;
  addText: CanvasEditorHandle["addText"];
  addShape: CanvasEditorHandle["addShape"];
  addSVG: CanvasEditorHandle["addSVG"];
  addImage: CanvasEditorHandle["addImage"];
  setBackground: CanvasEditorHandle["setBackground"];
  applyPalette: CanvasEditorHandle["applyPalette"];
  save: CanvasEditorHandle["save"];
  undo: CanvasEditorHandle["undo"];
  redo: CanvasEditorHandle["redo"];
  exportPNG: CanvasEditorHandle["exportPNG"];
  exportJSON: CanvasEditorHandle["exportJSON"];
}

export function useCanvasEditor(): UseCanvasEditor {
  const ref = useRef<CanvasEditorHandle | null>(null);

  const addText       = useCallback<CanvasEditorHandle["addText"]>((t, o)  => ref.current?.addText(t, o), []);
  const addShape      = useCallback<CanvasEditorHandle["addShape"]>((k)    => ref.current?.addShape(k), []);
  const addSVG        = useCallback<CanvasEditorHandle["addSVG"]>((s)      => ref.current?.addSVG(s), []);
  const addImage      = useCallback<CanvasEditorHandle["addImage"]>((u)    => ref.current?.addImage(u), []);
  const setBackground = useCallback<CanvasEditorHandle["setBackground"]>((c) => ref.current?.setBackground(c), []);
  const applyPalette  = useCallback<CanvasEditorHandle["applyPalette"]>((p) => ref.current?.applyPalette(p), []);
  const save          = useCallback<CanvasEditorHandle["save"]>(()         => ref.current?.save(), []);
  const undo          = useCallback<CanvasEditorHandle["undo"]>(()         => ref.current?.undo(), []);
  const redo          = useCallback<CanvasEditorHandle["redo"]>(()         => ref.current?.redo(), []);
  const exportPNG     = useCallback<CanvasEditorHandle["exportPNG"]>(()    => ref.current?.exportPNG() ?? Promise.resolve(null), []);
  const exportJSON    = useCallback<CanvasEditorHandle["exportJSON"]>(()   => ref.current?.exportJSON() ?? null, []);

  return { ref, addText, addShape, addSVG, addImage, setBackground, applyPalette, save, undo, redo, exportPNG, exportJSON };
}

// ── Skeleton shown while the inner chunk loads ──────────────────────────

function EditorSkeleton() {
  return (
    <div
      className="flex h-full w-full flex-col"
      style={{ background: "#FDFBF7", color: "#1A1A1A" }}
    >
      <div
        className="flex h-14 shrink-0 items-center justify-between border-b px-4"
        style={{ borderColor: "#E8E4DF" }}
      >
        <div
          className="h-7 w-48 rounded animate-pulse"
          style={{ background: "#EDE7D9" }}
        />
        <div
          className="h-7 w-32 rounded animate-pulse"
          style={{ background: "#EDE7D9" }}
        />
      </div>
      <div className="flex min-h-0 flex-1">
        <div
          className="w-14 border-r"
          style={{ borderColor: "#E8E4DF", background: "#FDFBF7" }}
        />
        <div
          className="w-[280px] border-r"
          style={{ borderColor: "#E8E4DF", background: "#FDFBF7" }}
        />
        <div
          className="flex min-h-0 flex-1 items-center justify-center"
          style={{ background: "#F5F1E8" }}
        >
          <div
            className="font-[family-name:'DM_Sans'] text-[12.5px] tracking-[0.12em] text-ink-faint"
          >
            LOADING EDITOR…
          </div>
        </div>
        <div
          className="w-60 border-l"
          style={{ borderColor: "#E8E4DF", background: "#FDFBF7" }}
        />
      </div>
    </div>
  );
}
