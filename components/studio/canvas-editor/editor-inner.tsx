"use client";

// ──────────────────────────────────────────────────────────────────────────
// Canvas editor — inner client component
//
// Client-only (uses the window-bound fabric runtime). Loaded from the entry
// via dynamic(..., { ssr: false }). Owns the fabric.Canvas instance and the
// undo/redo stack; chrome components (top bar, panels) are stateless props
// consumers.
// ──────────────────────────────────────────────────────────────────────────

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { fabric } from "fabric";
import { X as CloseIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TopBar } from "./top-bar";
import { LeftToolbar, LeftPanelHost } from "./left-panels";
import { PropertiesPanel } from "./properties-panel";
import {
  SURFACE_SIZES,
  ensureGoogleFont,
  TRENDING_PALETTES,
} from "./data";
import type {
  AISuggestion,
  CanvasEditorHandle,
  CanvasEditorProps,
  CanvasSize,
  LeftPanel,
  MotifRow,
  TrendingPalette,
  UploadedAsset,
} from "./types";

// Bleed = 0.125" at 300 DPI = 37.5 px. Rounded to 38 in layout.
const BLEED_PX = 38;
const SNAP_TOLERANCE = 6;        // snap within 6 px of centre
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.1;

const UPLOADS_LS_KEY = "ananya:studio:uploaded-assets";

export default function EditorInner({
  canvasData,
  canvasWidth,
  canvasHeight,
  surfaceType,
  onSave,
  readOnly,
  handleRef,
}: CanvasEditorProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const isLoadingRef = useRef(false);           // suppress history pushes during loadFromJSON
  const clipboardRef = useRef<fabric.Object | null>(null);

  const [zoom, setZoom] = useState(1);
  const [activePanel, setActivePanel] = useState<LeftPanel>("elements");
  const [selectedSnapshot, setSelectedSnapshot] = useState<Record<string, any> | null>(null);
  const [bumpVersion, setBumpVersion] = useState(0); // force rerender after mutate
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [showGrid, setShowGrid] = useState(false);
  const [showVGuide, setShowVGuide] = useState(false);
  const [showHGuide, setShowHGuide] = useState(false);
  const [previewDataURL, setPreviewDataURL] = useState<string | null>(null);
  const [motifs, setMotifs] = useState<MotifRow[] | undefined>(undefined);
  const [uploads, setUploads] = useState<UploadedAsset[]>([]);
  const [activeSize, setActiveSizeState] = useState<CanvasSize>({
    id: "initial",
    label: `${canvasWidth} × ${canvasHeight}`,
    width: canvasWidth,
    height: canvasHeight,
  });

  // ── Canvas setup ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!canvasElRef.current || fabricRef.current) return;
    const canvas = new fabric.Canvas(canvasElRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: "#FFFFFF",
      preserveObjectStacking: true,
      selection: !readOnly,
      enableRetinaScaling: true,
    });
    fabricRef.current = canvas;

    const sync = () => {
      const obj = canvas.getActiveObject();
      setSelectedSnapshot(obj ? snapshotOf(obj) : null);
      setBumpVersion((b) => b + 1);
    };

    canvas.on("selection:created", sync);
    canvas.on("selection:updated", sync);
    canvas.on("selection:cleared", () => {
      setSelectedSnapshot(null);
      setBumpVersion((b) => b + 1);
    });

    // History — only push after user-driven changes, not during loadFromJSON.
    const pushHistory = () => {
      if (isLoadingRef.current) return;
      const snap = JSON.stringify(canvas.toJSON());
      setUndoStack((s) => [...s, snap].slice(-50));
      setRedoStack([]);
    };

    canvas.on("object:added", pushHistory);
    canvas.on("object:removed", pushHistory);
    canvas.on("object:modified", () => {
      pushHistory();
      sync();
    });

    // Snap-to-centre while dragging.
    canvas.on("object:moving", (e: any) => {
      const obj = e.target;
      if (!obj) return;
      const cw = canvas.getWidth() / canvas.getZoom();
      const ch = canvas.getHeight() / canvas.getZoom();
      const objCx = (obj.left ?? 0) + ((obj.width ?? 0) * (obj.scaleX ?? 1)) / 2;
      const objCy = (obj.top ?? 0) + ((obj.height ?? 0) * (obj.scaleY ?? 1)) / 2;
      const dx = Math.abs(objCx - cw / 2);
      const dy = Math.abs(objCy - ch / 2);
      const nearV = dx < SNAP_TOLERANCE;
      const nearH = dy < SNAP_TOLERANCE;
      if (nearV) obj.set({ left: cw / 2 - ((obj.width ?? 0) * (obj.scaleX ?? 1)) / 2 });
      if (nearH) obj.set({ top: ch / 2 - ((obj.height ?? 0) * (obj.scaleY ?? 1)) / 2 });
      setShowVGuide(nearV);
      setShowHGuide(nearH);
    });
    canvas.on("mouse:up", () => {
      setShowVGuide(false);
      setShowHGuide(false);
    });

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
    // Initial mount only — width/height changes handled by a separate effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Load JSON when canvasData prop changes ────────────────────────────

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    if (!canvasData) {
      canvas.clear();
      canvas.backgroundColor = "#FFFFFF";
      canvas.renderAll();
      setUndoStack([]);
      setRedoStack([]);
      return;
    }
    isLoadingRef.current = true;
    canvas.loadFromJSON(canvasData, () => {
      // Pre-load Google Fonts referenced in the template so text renders correctly.
      canvas.getObjects().forEach((o: any) => {
        if (o.fontFamily) ensureGoogleFont(String(o.fontFamily));
      });
      canvas.renderAll();
      isLoadingRef.current = false;
      setUndoStack([]);
      setRedoStack([]);
    });
  }, [canvasData]);

  // ── Resize canvas when prop dimensions change ─────────────────────────

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.setWidth(canvasWidth * zoom);
    canvas.setHeight(canvasHeight * zoom);
    canvas.setZoom(zoom);
    canvas.renderAll();
  }, [canvasWidth, canvasHeight, zoom]);

  // ── Keyboard handlers ─────────────────────────────────────────────────

  useEffect(() => {
    if (readOnly) return;
    function onKey(e: KeyboardEvent) {
      // Ignore while typing inside inputs / contenteditable.
      const target = e.target as HTMLElement | null;
      const editable =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (editable) return;

      const canvas = fabricRef.current;
      if (!canvas) return;

      const cmd = e.ctrlKey || e.metaKey;
      if (cmd && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (cmd && (e.key.toLowerCase() === "y" || (e.shiftKey && e.key.toLowerCase() === "z"))) {
        e.preventDefault();
        redo();
      } else if (cmd && e.key.toLowerCase() === "c") {
        const obj = canvas.getActiveObject();
        if (obj) {
          (obj as any).clone((c: fabric.Object) => {
            clipboardRef.current = c;
          });
        }
      } else if (cmd && e.key.toLowerCase() === "v") {
        const c = clipboardRef.current;
        if (c) {
          (c as any).clone((cloned: fabric.Object) => {
            cloned.set({
              left: (cloned.left ?? 0) + 20,
              top: (cloned.top ?? 0) + 20,
              evented: true,
            });
            canvas.add(cloned);
            canvas.setActiveObject(cloned);
            canvas.requestRenderAll();
          });
        }
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteSelected();
      } else if (cmd && e.key === "=") {
        e.preventDefault();
        zoomIn();
      } else if (cmd && e.key === "-") {
        e.preventDefault();
        zoomOut();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readOnly, undoStack, redoStack]);

  // ── Wheel zoom on the canvas wrapper ──────────────────────────────────

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    function onWheel(e: WheelEvent) {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const dir = e.deltaY > 0 ? -1 : 1;
      setZoom((z) => clamp(z + dir * ZOOM_STEP, ZOOM_MIN, ZOOM_MAX));
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // ── Uploads persistence ───────────────────────────────────────────────

  useEffect(() => {
    try {
      const raw = localStorage.getItem(UPLOADS_LS_KEY);
      if (raw) setUploads(JSON.parse(raw) as UploadedAsset[]);
    } catch {}
  }, []);

  const persistUploads = useCallback((next: UploadedAsset[]) => {
    setUploads(next);
    try {
      localStorage.setItem(UPLOADS_LS_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  // ── History ops ───────────────────────────────────────────────────────

  function applySnapshot(snap: string) {
    const canvas = fabricRef.current;
    if (!canvas) return;
    isLoadingRef.current = true;
    canvas.loadFromJSON(JSON.parse(snap), () => {
      canvas.renderAll();
      isLoadingRef.current = false;
    });
  }

  function undo() {
    const canvas = fabricRef.current;
    if (!canvas || undoStack.length === 0) return;
    const current = JSON.stringify(canvas.toJSON());
    const prev = undoStack[undoStack.length - 1];
    setRedoStack((r) => [...r, current]);
    setUndoStack((s) => s.slice(0, -1));
    applySnapshot(prev);
  }

  function redo() {
    const canvas = fabricRef.current;
    if (!canvas || redoStack.length === 0) return;
    const current = JSON.stringify(canvas.toJSON());
    const next = redoStack[redoStack.length - 1];
    setUndoStack((s) => [...s, current]);
    setRedoStack((r) => r.slice(0, -1));
    applySnapshot(next);
  }

  // ── Object ops ────────────────────────────────────────────────────────

  function deleteSelected() {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const objs = canvas.getActiveObjects();
    objs.forEach((o) => canvas.remove(o));
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  }

  function onUpdateSelected(patch: Record<string, any>) {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const obj = canvas.getActiveObject() as any;
    if (!obj) return;
    obj.set(patch);
    obj.setCoords();
    canvas.requestRenderAll();
    setSelectedSnapshot(snapshotOf(obj));
    setBumpVersion((b) => b + 1);
  }

  function addText(preset: { sample: string; fontSize: number; fontFamily: string; fontWeight?: string }) {
    const canvas = fabricRef.current;
    if (!canvas) return;
    ensureGoogleFont(preset.fontFamily);
    const cw = canvas.getWidth() / canvas.getZoom();
    const ch = canvas.getHeight() / canvas.getZoom();
    const tb = new fabric.Textbox(preset.sample, {
      left: cw / 2,
      top: ch / 2,
      width: Math.min(800, cw * 0.75),
      fontSize: preset.fontSize,
      fontFamily: preset.fontFamily,
      fontWeight: preset.fontWeight ?? "normal",
      textAlign: "center",
      originX: "center",
      originY: "center",
      fill: "#1A1A1A",
    });
    canvas.add(tb);
    canvas.setActiveObject(tb);
    canvas.requestRenderAll();
  }

  function addShape(kind: "rect" | "circle" | "line" | "divider") {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const cw = canvas.getWidth() / canvas.getZoom();
    const ch = canvas.getHeight() / canvas.getZoom();
    let obj: fabric.Object;
    if (kind === "rect") {
      obj = new fabric.Rect({
        left: cw / 2 - 150,
        top: ch / 2 - 100,
        width: 300,
        height: 200,
        fill: "",
        stroke: "#1A1A1A",
        strokeWidth: 2,
      });
    } else if (kind === "circle") {
      obj = new fabric.Circle({
        left: cw / 2 - 100,
        top: ch / 2 - 100,
        radius: 100,
        fill: "",
        stroke: "#1A1A1A",
        strokeWidth: 2,
      });
    } else if (kind === "line") {
      obj = new fabric.Line([cw / 2 - 200, ch / 2, cw / 2 + 200, ch / 2], {
        stroke: "#1A1A1A",
        strokeWidth: 2,
      });
    } else {
      // Divider — styled horizontal line with a centre dot.
      const line = new fabric.Line([-180, 0, 180, 0], { stroke: "#B8860B", strokeWidth: 1.2 });
      const dot = new fabric.Circle({ left: -6, top: -6, radius: 6, fill: "#B8860B" });
      obj = new fabric.Group([line, dot], {
        left: cw / 2,
        top: ch / 2,
        originX: "center",
        originY: "center",
      });
    }
    canvas.add(obj);
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
  }

  function addPhotoPlaceholder() {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const cw = canvas.getWidth() / canvas.getZoom();
    const ch = canvas.getHeight() / canvas.getZoom();
    const frame = new fabric.Rect({
      left: cw / 2 - 200,
      top: ch / 2 - 260,
      width: 400,
      height: 520,
      fill: "#F5F1E8",
      stroke: "#B8860B",
      strokeDashArray: [6, 4],
      strokeWidth: 1.5,
    });
    const label = new fabric.Textbox("Photo", {
      left: cw / 2,
      top: ch / 2,
      width: 300,
      fontSize: 22,
      fontFamily: "DM Sans",
      fill: "#6B6B6B",
      originX: "center",
      originY: "center",
      textAlign: "center",
    });
    const group = new fabric.Group([frame, label], {
      left: cw / 2,
      top: ch / 2,
      originX: "center",
      originY: "center",
    });
    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.requestRenderAll();
  }

  function addMotif(svg: string) {
    const canvas = fabricRef.current;
    if (!canvas) return;
    (fabric as any).loadSVGFromString(svg, (objects: fabric.Object[], options: any) => {
      const grouped = (fabric.util as any).groupSVGElements(objects, options);
      const cw = canvas.getWidth() / canvas.getZoom();
      const ch = canvas.getHeight() / canvas.getZoom();
      const desired = Math.min(cw, ch) * 0.25;
      const current = Math.max(grouped.width ?? 100, grouped.height ?? 100);
      const scale = desired / current;
      grouped.set({
        left: cw / 2,
        top: ch / 2,
        originX: "center",
        originY: "center",
        scaleX: scale,
        scaleY: scale,
      });
      canvas.add(grouped);
      canvas.setActiveObject(grouped);
      canvas.requestRenderAll();
    });
  }

  function addImage(url: string) {
    const canvas = fabricRef.current;
    if (!canvas) return;
    (fabric as any).Image.fromURL(
      url,
      (img: fabric.Image) => {
        const cw = canvas.getWidth() / canvas.getZoom();
        const ch = canvas.getHeight() / canvas.getZoom();
        const desired = Math.min(cw, ch) * 0.4;
        const current = Math.max((img.width ?? 1), (img.height ?? 1));
        const scale = desired / current;
        img.set({
          left: cw / 2,
          top: ch / 2,
          originX: "center",
          originY: "center",
          scaleX: scale,
          scaleY: scale,
        });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.requestRenderAll();
      },
      { crossOrigin: "anonymous" },
    );
  }

  function setBackground(color: string) {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.backgroundColor = color;
    canvas.renderAll();
    // Log history via a synthetic snapshot so Undo restores previous bg.
    setUndoStack((s) => [...s, JSON.stringify(canvas.toJSON())].slice(-50));
    setRedoStack([]);
  }

  function applyPalette(p: TrendingPalette) {
    const canvas = fabricRef.current;
    if (!canvas) return;
    // Apply background, then re-map object fills: ink → swatch 0, gold → swatch 1,
    // any other hex → swatch 2, staying faithful to the canvas's existing mood.
    canvas.backgroundColor = p.background;
    canvas.getObjects().forEach((o: any) => {
      if (o.fill && typeof o.fill === "string" && o.fill !== "") {
        const mapped = mapPaletteColor(o.fill, p);
        o.set({ fill: mapped });
      }
      if (o.stroke && typeof o.stroke === "string" && o.stroke !== "") {
        o.set({ stroke: mapPaletteColor(o.stroke, p) });
      }
    });
    canvas.requestRenderAll();
    setUndoStack((s) => [...s, JSON.stringify(canvas.toJSON())].slice(-50));
    setRedoStack([]);
  }

  function applyFont(family: string, stack: string) {
    onUpdateSelected({ fontFamily: family });
  }

  // ── Zoom ──────────────────────────────────────────────────────────────

  const zoomIn  = () => setZoom((z) => clamp(z + ZOOM_STEP, ZOOM_MIN, ZOOM_MAX));
  const zoomOut = () => setZoom((z) => clamp(z - ZOOM_STEP, ZOOM_MIN, ZOOM_MAX));

  // ── Export / save ─────────────────────────────────────────────────────

  async function exportPNG(multiplier = 1): Promise<Blob | null> {
    const canvas = fabricRef.current;
    if (!canvas) return null;
    canvas.discardActiveObject();
    canvas.renderAll();
    const dataURL = canvas.toDataURL({ format: "png", multiplier });
    const res = await fetch(dataURL);
    return await res.blob();
  }

  async function doSave() {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const json = canvas.toJSON();
    const thumb = (await exportPNG(0.2)) ?? new Blob([]);
    onSave(json, thumb);
  }

  async function downloadPNG() {
    const blob = await exportPNG(1);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ananya-${surfaceType}-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function doPreview() {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.discardActiveObject();
    canvas.renderAll();
    setPreviewDataURL(canvas.toDataURL({ format: "png", multiplier: 1 }));
  }

  // ── Upload handler (local object URLs, persisted in localStorage) ─────

  async function handleUpload(files: File[]) {
    const next: UploadedAsset[] = [...uploads];
    for (const f of files) {
      const url = URL.createObjectURL(f);
      const dims = await imageDimensions(url);
      next.unshift({
        id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: f.name,
        url,
        width: dims?.w,
        height: dims?.h,
        createdAt: new Date().toISOString(),
      });
    }
    persistUploads(next.slice(0, 60));
  }

  // ── Motif loader — reads seeded SVGs from /api/motifs endpoint ────────
  // Falls back to an empty array if the endpoint isn't wired yet. The UI
  // treats `undefined` as "loading" and `[]` as "no motifs in this filter".

  async function loadMotifs(): Promise<MotifRow[]> {
    try {
      const res = await fetch("/api/motifs");
      if (!res.ok) throw new Error(String(res.status));
      const rows = (await res.json()) as MotifRow[];
      setMotifs(rows);
      return rows;
    } catch {
      setMotifs([]);
      return [];
    }
  }

  // ── AI suggestion stub ────────────────────────────────────────────────
  // Real endpoint is wired in a later prompt; until then we return a
  // curated client-side set so the panel has working affordances.

  async function requestAI(prompt: string): Promise<AISuggestion[]> {
    try {
      const res = await fetch("/api/ai/design-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, surfaceType }),
      });
      if (res.ok) return (await res.json()) as AISuggestion[];
    } catch {}
    // Client-side fallback so the panel still feels alive.
    const lowered = prompt.toLowerCase();
    const p = TRENDING_PALETTES.find((x) => lowered.includes(x.name.split(" ")[0].toLowerCase()))
      ?? TRENDING_PALETTES[0];
    return [
      {
        id: "sg-palette",
        kind: "palette",
        title: `Try the ${p.name} palette`,
        description: `${p.mood}. Retints backgrounds and accent colours across the canvas.`,
        apply: () => applyPalette(p),
      },
      {
        id: "sg-font",
        kind: "font",
        title: "Pair Playfair Display with Inter",
        description: "Editorial serif hero with a neutral supporting sans — reads as modern luxury.",
      },
      {
        id: "sg-layout",
        kind: "layout",
        title: "Centre-stack your names",
        description: "Move the couple names to the optical centre and add ~40 px of breathing room above and below.",
      },
      {
        id: "sg-tip",
        kind: "tip",
        title: "Match your motif to your palette",
        description: "Cultural motifs look most intentional when their fill colour matches the palette's gold/accent swatch.",
      },
    ];
  }

  // ── Sizes for this surface ────────────────────────────────────────────

  const sizes = useMemo<CanvasSize[]>(() => {
    const list = SURFACE_SIZES[surfaceType] ?? [];
    const exists = list.some((s) => s.width === canvasWidth && s.height === canvasHeight);
    return exists
      ? list
      : [{ id: "initial", label: "Current", width: canvasWidth, height: canvasHeight }, ...list];
  }, [surfaceType, canvasWidth, canvasHeight]);

  useEffect(() => {
    const match =
      sizes.find((s) => s.width === canvasWidth && s.height === canvasHeight) ?? sizes[0];
    if (match) setActiveSizeState(match);
  }, [sizes, canvasWidth, canvasHeight]);

  function setActiveSize(s: CanvasSize) {
    setActiveSizeState(s);
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.setWidth(s.width * zoom);
    canvas.setHeight(s.height * zoom);
    canvas.renderAll();
  }

  // ── Imperative handle ─────────────────────────────────────────────────

  useImperativeHandle(
    handleRef,
    (): CanvasEditorHandle => ({
      addText: (text, options) => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const tb = new fabric.Textbox(text, {
          left: canvas.getWidth() / canvas.getZoom() / 2,
          top: canvas.getHeight() / canvas.getZoom() / 2,
          width: 600,
          originX: "center",
          originY: "center",
          fontFamily: "Playfair Display",
          fontSize: 48,
          textAlign: "center",
          fill: "#1A1A1A",
          ...options,
        });
        canvas.add(tb);
        canvas.setActiveObject(tb);
        canvas.requestRenderAll();
      },
      addShape,
      addSVG: addMotif,
      addImage,
      setBackground,
      applyPalette,
      deleteSelected,
      undo,
      redo,
      zoomIn,
      zoomOut,
      setZoom: (z) => setZoom(clamp(z, ZOOM_MIN, ZOOM_MAX)),
      exportJSON: () => fabricRef.current?.toJSON() ?? null,
      exportPNG: () => exportPNG(1),
      save: doSave,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [uploads, undoStack, redoStack],
  );

  // ── Render ────────────────────────────────────────────────────────────

  void bumpVersion; // referenced so rerenders are triggered when we bump it

  return (
    <div
      className="flex h-full w-full flex-col font-[family-name:'DM_Sans']"
      style={{ background: "#FDFBF7", color: "#1A1A1A" }}
    >
      <TopBar
        surfaceType={surfaceType}
        sizes={sizes}
        activeSizeId={activeSize.id}
        onSizeChange={setActiveSize}
        zoom={zoom}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        onUndo={undo}
        onRedo={redo}
        onPreview={doPreview}
        onSave={doSave}
        onOrderPrint={() => {
          // Navigation hook — wire to a print-flow route in a later prompt.
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("ananya:studio:order-print", { detail: { surfaceType } }));
          }
        }}
        onDownload={downloadPNG}
        readOnly={readOnly}
      />

      <div className="flex min-h-0 flex-1">
        <LeftToolbar active={activePanel} onChange={setActivePanel} />
        <LeftPanelHost
          active={activePanel}
          surfaceType={surfaceType}
          selectedObject={selectedSnapshot}
          onAddText={addText}
          onAddShape={addShape}
          onAddPhotoPlaceholder={addPhotoPlaceholder}
          onAddMotif={addMotif}
          onSetBackground={setBackground}
          onApplyPalette={applyPalette}
          onApplyFont={applyFont}
          onUpdateSelected={onUpdateSelected}
          onAddImage={addImage}
          onRequestAI={requestAI}
          motifs={motifs}
          onLoadMotifs={loadMotifs}
          uploadedAssets={uploads}
          onUpload={handleUpload}
        />

        {/* Canvas stage */}
        <div
          ref={wrapperRef}
          className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto"
          style={{ background: "#F5F1E8" }}
        >
          <div className="flex items-center gap-3">
            <GridToggle on={showGrid} onToggle={() => setShowGrid((g) => !g)} />
          </div>

          <div
            className="relative my-10"
            style={{
              width: activeSize.width * zoom,
              height: activeSize.height * zoom,
              boxShadow: "0 20px 40px rgba(26,26,26,0.08)",
              background: "#FFFFFF",
            }}
          >
            <canvas ref={canvasElRef} />

            {/* Bleed line */}
            <div
              className="pointer-events-none absolute"
              style={{
                top: BLEED_PX * zoom,
                left: BLEED_PX * zoom,
                right: BLEED_PX * zoom,
                bottom: BLEED_PX * zoom,
                border: "1px dashed rgba(184,134,11,0.35)",
              }}
            />

            {/* Grid overlay */}
            {showGrid && (
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgba(26,26,26,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(26,26,26,0.05) 1px, transparent 1px)",
                  backgroundSize: `${50 * zoom}px ${50 * zoom}px`,
                }}
              />
            )}

            {/* Snap-to-centre guides */}
            {showVGuide && (
              <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px" style={{ background: "#C97B63" }} />
            )}
            {showHGuide && (
              <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px" style={{ background: "#C97B63" }} />
            )}
          </div>
        </div>

        {/* Right properties panel */}
        {!readOnly && (
          <PropertiesPanel
            object={selectedSnapshot}
            onUpdate={onUpdateSelected}
            onDelete={deleteSelected}
          />
        )}
      </div>

      {/* Preview modal */}
      {previewDataURL && (
        <PreviewModal src={previewDataURL} onClose={() => setPreviewDataURL(null)} />
      )}
    </div>
  );
}

// ── helpers ───────────────────────────────────────────────────────────────

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

function snapshotOf(obj: any): Record<string, any> {
  // Direct reference + spread so Reacts sees a new object each time we update.
  // We copy the handful of fields the right-panel + text-panel read — cheaper
  // than obj.toObject() and avoids serializing heavy paths.
  return {
    type: obj.type,
    left: obj.left,
    top: obj.top,
    width: obj.width,
    height: obj.height,
    scaleX: obj.scaleX,
    scaleY: obj.scaleY,
    angle: obj.angle,
    opacity: obj.opacity,
    fill: obj.fill,
    stroke: obj.stroke,
    strokeWidth: obj.strokeWidth,
    text: obj.text,
    fontSize: obj.fontSize,
    fontFamily: obj.fontFamily,
    fontWeight: obj.fontWeight,
    fontStyle: obj.fontStyle,
    underline: obj.underline,
    textAlign: obj.textAlign,
    charSpacing: obj.charSpacing,
    lineHeight: obj.lineHeight,
  };
}

function mapPaletteColor(hex: string, p: TrendingPalette): string {
  const h = hex.toLowerCase();
  // Treat very-dark as ink (swatch[0]); gold-range as swatch[1]; everything
  // else as swatch[2]. Palette's background is already applied separately.
  const lum = hexLuminance(h);
  if (lum < 0.15) return p.swatches[0];
  if (h.includes("d4af") || h.includes("b886") || h.includes("c9a6")) return p.swatches[1];
  if (lum > 0.85) return hex;           // leave near-whites alone
  return p.swatches[2];
}

function hexLuminance(hex: string): number {
  const h = hex.replace("#", "");
  if (h.length < 6) return 0.5;
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function imageDimensions(url: string): Promise<{ w: number; h: number } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

// ── Subcomponents ─────────────────────────────────────────────────────────

function GridToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "absolute right-4 top-4 rounded-md border px-2.5 py-1 font-[family-name:'DM_Sans'] text-[11px]",
        on ? "border-gold bg-gold-pale/60 text-ink" : "text-ink-muted hover:bg-ivory-warm",
      )}
      style={{ borderColor: on ? "#B8860B" : "#E8E4DF", background: on ? "rgba(240,228,200,0.6)" : "#FFFFFF" }}
    >
      {on ? "Hide grid" : "Show grid"}
    </button>
  );
}

function PreviewModal({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-10"
      style={{ background: "rgba(26,26,26,0.8)" }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Close preview"
        className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full"
        style={{ background: "rgba(255,255,255,0.12)", color: "#FFFFFF" }}
      >
        <CloseIcon size={16} />
      </button>
      <img
        src={src}
        alt="Design preview"
        className="max-h-full max-w-full object-contain"
        style={{ boxShadow: "0 30px 80px rgba(0,0,0,0.45)" }}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
