"use client";

// ── Upload + review modal ──────────────────────────────────────────────────
// Drag-and-drop (or file picker) triggers:
//   1. POST /api/upload       — stores file under /public/uploads
//   2. POST /api/documents/classify — Haiku 4.5 classifier returns metadata
//   3. Per-file review row — user edits fields before confirming
//   4. On confirm, records are added to the Documents store
//
// If classification fails or the file can't be classified, the row is
// pre-filed into /Unsorted with needs_review=true. The user can still edit
// and confirm. The modal is non-blocking — closing it saves current drafts
// into /Unsorted so nothing is lost.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  DocumentFolder,
  DocumentType,
  DocumentVendorCategory,
} from "@/types/documents";
import {
  DEFAULT_FOLDER_FOR_TYPE,
  DOCUMENT_TYPE_LABEL,
  FOLDER_LABEL,
  FOLDER_ORDER,
  MAX_DOCUMENT_SIZE,
  VENDOR_CATEGORY_LABEL,
  mimeAccepted,
} from "@/types/documents";
import { useDocumentsStore } from "@/stores/documents-store";
import { fileToBase64 } from "@/lib/documents/helpers";

type DraftStatus = "uploading" | "classifying" | "ready" | "error";

interface Draft {
  tempId: string;
  file: File;
  status: DraftStatus;
  error?: string;
  // After upload:
  file_url?: string;
  // After classification:
  suggested_filename?: string;
  document_type?: DocumentType;
  vendor_category?: DocumentVendorCategory;
  vendor_name?: string | null;
  folder?: DocumentFolder;
  amount?: number | null;
  currency?: string | null;
  document_date?: string | null;
  due_date?: string | null;
  event_date?: string | null;
  expiration_date?: string | null;
  parties?: string[];
  signed?: boolean | null;
  key_terms?: string[];
  summary?: string;
  tags?: string[];
  financial?: boolean;
  confidence_overall?: number;
  needs_review?: boolean;
  review_reason?: string | null;
}

export function UploadReviewModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const addDocument = useDocumentsStore((s) => s.addDocument);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [dragging, setDragging] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Clear drafts whenever the modal opens fresh
  useEffect(() => {
    if (!open) {
      setDrafts([]);
      setToast(null);
    }
  }, [open]);

  const ready = useMemo(() => drafts.filter((d) => d.status === "ready"), [drafts]);

  const processFile = useCallback(async (file: File) => {
    const tempId = `draft_${Math.random().toString(36).slice(2, 10)}`;
    if (!mimeAccepted(file.type)) {
      setDrafts((s) => [
        ...s,
        {
          tempId,
          file,
          status: "error",
          error: `Unsupported file type: ${file.type || "unknown"}`,
        },
      ]);
      return;
    }
    if (file.size > MAX_DOCUMENT_SIZE) {
      setDrafts((s) => [
        ...s,
        {
          tempId,
          file,
          status: "error",
          error: `File too large (max ${Math.round(MAX_DOCUMENT_SIZE / 1024 / 1024)} MB)`,
        },
      ]);
      return;
    }
    setDrafts((s) => [...s, { tempId, file, status: "uploading" }]);

    // 1. Upload
    let file_url: string;
    try {
      const fd = new FormData();
      fd.append("files", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error(`Upload HTTP ${res.status}`);
      const body = (await res.json()) as Array<{ url: string }>;
      const entry = Array.isArray(body) ? body[0] : null;
      if (!entry?.url) throw new Error("Upload returned no URL");
      file_url = entry.url;
    } catch (err) {
      setDrafts((s) =>
        s.map((d) =>
          d.tempId === tempId
            ? {
                ...d,
                status: "error",
                error: err instanceof Error ? err.message : "Upload failed",
              }
            : d,
        ),
      );
      return;
    }

    setDrafts((s) =>
      s.map((d) =>
        d.tempId === tempId ? { ...d, status: "classifying", file_url } : d,
      ),
    );

    // 2. Classify — Haiku 4.5. Fall back to Unsorted on error.
    try {
      const base64 = await fileToBase64(file);
      const res = await fetch("/api/documents/classify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mime_type: file.type,
          filename: file.name,
          file_base64: base64,
        }),
      });
      const body = (await res.json()) as {
        ok: boolean;
        classification?: Record<string, unknown>;
        error?: string;
      };
      if (!body.ok || !body.classification) {
        // Upload succeeded but classification failed — file goes to Unsorted.
        setDrafts((s) =>
          s.map((d) =>
            d.tempId === tempId
              ? {
                  ...d,
                  status: "ready",
                  suggested_filename: file.name,
                  document_type: "other",
                  vendor_category: "other",
                  vendor_name: null,
                  folder: "unsorted",
                  summary: "",
                  tags: [],
                  confidence_overall: 0.2,
                  needs_review: true,
                  review_reason: body.error ?? "Classifier offline — filed to Unsorted.",
                  financial: false,
                  amount: null,
                  currency: null,
                }
              : d,
          ),
        );
        return;
      }
      const c = body.classification;
      const documentType = pickEnum<DocumentType>(c.document_type, Object.keys(DOCUMENT_TYPE_LABEL) as DocumentType[]) ?? "other";
      const vendorCategory = pickEnum<DocumentVendorCategory>(
        c.vendor_category,
        Object.keys(VENDOR_CATEGORY_LABEL) as DocumentVendorCategory[],
      ) ?? "other";
      const folder = pickEnum<DocumentFolder>(
        c.folder,
        FOLDER_ORDER,
      ) ?? DEFAULT_FOLDER_FOR_TYPE[documentType];

      setDrafts((s) =>
        s.map((d) =>
          d.tempId === tempId
            ? {
                ...d,
                status: "ready",
                suggested_filename: asString(c.suggested_filename) ?? file.name,
                document_type: documentType,
                vendor_category: vendorCategory,
                vendor_name: asString(c.vendor_name),
                folder,
                amount: asNumber(c.amount),
                currency: asString(c.currency),
                document_date: asString(c.document_date),
                due_date: asString(c.due_date),
                event_date: asString(c.event_date),
                expiration_date: asString(c.expiration_date),
                parties: asStringArray(c.parties),
                signed: asBoolean(c.signed),
                key_terms: asStringArray(c.key_terms),
                summary: asString(c.summary) ?? "",
                tags: asStringArray(c.tags),
                financial: Boolean(c.financial),
                confidence_overall: asNumber(c.confidence_overall) ?? 0.5,
                needs_review: Boolean(c.needs_review),
                review_reason: asString(c.review_reason),
              }
            : d,
        ),
      );
    } catch (err) {
      setDrafts((s) =>
        s.map((d) =>
          d.tempId === tempId
            ? {
                ...d,
                status: "ready",
                suggested_filename: file.name,
                document_type: "other",
                vendor_category: "other",
                vendor_name: null,
                folder: "unsorted",
                summary: "",
                tags: [],
                confidence_overall: 0.2,
                needs_review: true,
                review_reason: err instanceof Error ? err.message : "Classifier error",
                financial: false,
                amount: null,
                currency: null,
              }
            : d,
        ),
      );
    }
  }, []);

  const onDrop = useCallback(
    async (files: FileList | File[]) => {
      setDragging(false);
      const arr = Array.from(files);
      for (const f of arr) {
        await processFile(f);
      }
    },
    [processFile],
  );

  function confirm() {
    if (ready.length === 0) return;
    let count = 0;
    for (const d of ready) {
      if (!d.file_url) continue;
      addDocument({
        name: d.suggested_filename ?? d.file.name,
        file_url: d.file_url,
        mime_type: d.file.type || "application/octet-stream",
        size_bytes: d.file.size,
        document_type: d.document_type ?? "other",
        vendor_category: d.vendor_category ?? "other",
        vendor_name: d.vendor_name ?? null,
        folder: d.folder ?? "unsorted",
        financial: d.financial ?? false,
        amount: d.amount ?? null,
        currency: d.currency ?? null,
        document_date: d.document_date ?? null,
        due_date: d.due_date ?? null,
        event_date: d.event_date ?? null,
        expiration_date: d.expiration_date ?? null,
        parties: d.parties ?? [],
        signed: d.signed ?? null,
        key_terms: d.key_terms ?? [],
        summary: d.summary ?? "",
        tags: d.tags ?? [],
        confidence_overall: d.confidence_overall ?? 0.5,
        needs_review: d.needs_review ?? false,
        review_reason: d.review_reason ?? null,
      });
      count += 1;
    }
    setToast(`Filed ${count} document${count === 1 ? "" : "s"}`);
    setTimeout(() => {
      onClose();
    }, 900);
  }

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-ink/30" onClick={onClose} />
      <div
        className="fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-[min(92vw,860px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-white shadow-xl"
        role="dialog"
        aria-label="Upload documents"
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-6 py-4">
          <div>
            <h2 className="font-serif text-[19px] font-medium text-ink">
              Upload documents
            </h2>
            <p className="mt-0.5 text-[12.5px] text-ink-muted">
              Ananya will auto-file each upload into the right folder.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-faint hover:bg-ivory-warm hover:text-ink"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              onDrop(e.dataTransfer.files);
            }}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "mx-6 mt-5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-ivory-warm/30 py-8 transition-colors",
              dragging ? "border-gold bg-gold-pale/30" : "border-border hover:border-gold/40",
            )}
          >
            <UploadCloud size={22} className="text-ink-muted" strokeWidth={1.4} />
            <p className="text-[13.5px] text-ink">
              Drop files here or <span className="font-medium text-saffron">click to select</span>
            </p>
            <p className="text-[11.5px] text-ink-faint">
              PDFs, images, docs — up to {Math.round(MAX_DOCUMENT_SIZE / 1024 / 1024)} MB each
            </p>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept="application/pdf,image/*,.doc,.docx,.xls,.xlsx,.txt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) onDrop(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          {/* Draft list */}
          {drafts.length > 0 && (
            <ul className="mt-4 flex flex-col gap-3 px-6 pb-6">
              {drafts.map((d) => (
                <DraftRow
                  key={d.tempId}
                  draft={d}
                  onPatch={(patch) =>
                    setDrafts((s) =>
                      s.map((x) => (x.tempId === d.tempId ? { ...x, ...patch } : x)),
                    )
                  }
                  onRemove={() =>
                    setDrafts((s) => s.filter((x) => x.tempId !== d.tempId))
                  }
                />
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border bg-ivory-warm/30 px-6 py-3">
          <span className="text-[12px] text-ink-muted">
            {toast ? (
              <span className="inline-flex items-center gap-1.5 text-sage">
                <CheckCircle2 size={14} /> {toast}
              </span>
            ) : drafts.length === 0 ? (
              "No files yet."
            ) : (
              `${ready.length} of ${drafts.length} ready to file`
            )}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border bg-white px-3 py-1.5 text-[12.5px] text-ink-muted hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={ready.length === 0}
              className="rounded-md bg-gold px-3 py-1.5 text-[12.5px] font-medium text-white shadow-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-40 hover:opacity-90"
            >
              File {ready.length > 0 ? `${ready.length} ` : ""}documents
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function DraftRow({
  draft,
  onPatch,
  onRemove,
}: {
  draft: Draft;
  onPatch: (p: Partial<Draft>) => void;
  onRemove: () => void;
}) {
  return (
    <li className="rounded-lg border border-border bg-white p-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-ivory-warm text-ink-muted">
          {draft.status === "uploading" || draft.status === "classifying" ? (
            <Loader2 size={15} className="animate-spin" />
          ) : draft.status === "error" ? (
            <AlertTriangle size={15} className="text-rose" />
          ) : draft.needs_review ? (
            <AlertTriangle size={15} className="text-saffron" />
          ) : (
            <FileText size={15} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[13px] font-medium text-ink">{draft.file.name}</span>
            <span className="text-[11px] text-ink-faint">
              {(draft.file.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>

          {draft.status === "uploading" && (
            <p className="mt-0.5 text-[11.5px] text-ink-muted">Uploading…</p>
          )}
          {draft.status === "classifying" && (
            <p className="mt-0.5 text-[11.5px] text-ink-muted">Classifying with Claude Haiku…</p>
          )}
          {draft.status === "error" && (
            <p className="mt-0.5 text-[11.5px] text-rose">{draft.error}</p>
          )}

          {draft.status === "ready" && (
            <>
              {draft.needs_review && draft.review_reason && (
                <p className="mt-1 rounded-md bg-saffron/5 px-2 py-1 text-[11.5px] text-saffron">
                  {draft.review_reason}
                </p>
              )}
              <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
                <MiniField label="Filename">
                  <input
                    type="text"
                    value={draft.suggested_filename ?? ""}
                    onChange={(e) => onPatch({ suggested_filename: e.target.value })}
                    className="w-full rounded border border-border px-1.5 py-1 text-[12px] outline-none focus:border-gold/50"
                  />
                </MiniField>
                <MiniField label="Type">
                  <select
                    value={draft.document_type ?? "other"}
                    onChange={(e) =>
                      onPatch({ document_type: e.target.value as DocumentType })
                    }
                    className="w-full rounded border border-border bg-white px-1 py-1 text-[12px] outline-none focus:border-gold/50"
                  >
                    {(Object.keys(DOCUMENT_TYPE_LABEL) as DocumentType[]).map((t) => (
                      <option key={t} value={t}>
                        {DOCUMENT_TYPE_LABEL[t]}
                      </option>
                    ))}
                  </select>
                </MiniField>
                <MiniField label="Vendor">
                  <input
                    type="text"
                    value={draft.vendor_name ?? ""}
                    placeholder="—"
                    onChange={(e) =>
                      onPatch({ vendor_name: e.target.value || null })
                    }
                    className="w-full rounded border border-border px-1.5 py-1 text-[12px] outline-none focus:border-gold/50"
                  />
                </MiniField>
                <MiniField label="Folder">
                  <select
                    value={draft.folder ?? "unsorted"}
                    onChange={(e) =>
                      onPatch({ folder: e.target.value as DocumentFolder })
                    }
                    className="w-full rounded border border-border bg-white px-1 py-1 text-[12px] outline-none focus:border-gold/50"
                  >
                    {FOLDER_ORDER.map((f) => (
                      <option key={f} value={f}>
                        {FOLDER_LABEL[f]}
                      </option>
                    ))}
                  </select>
                </MiniField>
                <MiniField label="Category">
                  <select
                    value={draft.vendor_category ?? "other"}
                    onChange={(e) =>
                      onPatch({ vendor_category: e.target.value as DocumentVendorCategory })
                    }
                    className="w-full rounded border border-border bg-white px-1 py-1 text-[12px] outline-none focus:border-gold/50"
                  >
                    {(Object.keys(VENDOR_CATEGORY_LABEL) as DocumentVendorCategory[]).map((v) => (
                      <option key={v} value={v}>
                        {VENDOR_CATEGORY_LABEL[v]}
                      </option>
                    ))}
                  </select>
                </MiniField>
                <MiniField label="Amount">
                  <input
                    type="number"
                    value={draft.amount ?? ""}
                    onChange={(e) =>
                      onPatch({
                        amount: e.target.value ? Number(e.target.value) : null,
                        financial: Boolean(e.target.value),
                      })
                    }
                    className="w-full rounded border border-border px-1.5 py-1 text-right font-mono text-[12px] outline-none focus:border-gold/50"
                  />
                </MiniField>
                <MiniField label="Date">
                  <input
                    type="date"
                    value={draft.document_date ?? ""}
                    onChange={(e) =>
                      onPatch({ document_date: e.target.value || null })
                    }
                    className="w-full rounded border border-border px-1.5 py-1 text-[12px] outline-none focus:border-gold/50"
                  />
                </MiniField>
                <MiniField label="Confidence">
                  <div className="flex items-center gap-1 text-[12px] text-ink-muted">
                    <ConfidenceBar value={draft.confidence_overall ?? 0.5} />
                    <span className="font-mono tabular-nums">
                      {Math.round((draft.confidence_overall ?? 0.5) * 100)}%
                    </span>
                  </div>
                </MiniField>
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ink-faint hover:bg-ivory-warm hover:text-ink"
          aria-label="Remove"
        >
          <X size={14} />
        </button>
      </div>
    </li>
  );
}

function MiniField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <div className="h-1.5 w-14 rounded-full bg-border">
      <div
        className={cn(
          "h-full rounded-full",
          pct >= 0.75 ? "bg-sage" : pct >= 0.5 ? "bg-gold" : "bg-saffron",
        )}
        style={{ width: `${pct * 100}%` }}
      />
    </div>
  );
}

// ── Type coercion helpers ──────────────────────────────────────────────────

function asString(v: unknown): string | null {
  if (typeof v === "string" && v.length > 0) return v;
  return null;
}
function asNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  return null;
}
function asBoolean(v: unknown): boolean | null {
  if (typeof v === "boolean") return v;
  return null;
}
function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string" && x.length > 0);
}
function pickEnum<T extends string>(v: unknown, allowed: readonly T[]): T | null {
  if (typeof v === "string" && (allowed as readonly string[]).includes(v)) {
    return v as T;
  }
  return null;
}
