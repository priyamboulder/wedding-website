"use client";

// ── Document drawer ────────────────────────────────────────────────────────
// 400px right-side drawer showing full preview + editable metadata. Fields
// are persisted to the Documents store on blur (single updateDocument call)
// — no "save" button, matches the inline-edit pattern used in Finance.

import { useEffect, useState } from "react";
import { Download, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  DocumentFolder,
  DocumentRecord,
  DocumentType,
  DocumentVendorCategory,
} from "@/types/documents";
import {
  DOCUMENT_TYPE_BADGE,
  DOCUMENT_TYPE_LABEL,
  FOLDER_LABEL,
  FOLDER_ORDER,
  VENDOR_CATEGORY_LABEL,
  folderPathFor,
  prettyBytes,
  relativeUploadedAt,
} from "@/types/documents";
import { useDocumentsStore } from "@/stores/documents-store";
import { formatAmount, formatDate } from "@/lib/documents/helpers";

export function DocumentDrawer({
  doc,
  onClose,
}: {
  doc: DocumentRecord | null;
  onClose: () => void;
}) {
  const updateDocument = useDocumentsStore((s) => s.updateDocument);
  const renameDocument = useDocumentsStore((s) => s.renameDocument);

  const [name, setName] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [summary, setSummary] = useState("");
  const [tagsStr, setTagsStr] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [documentDate, setDocumentDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [expirationDate, setExpirationDate] = useState("");

  useEffect(() => {
    if (!doc) return;
    setName(doc.name);
    setVendorName(doc.vendor_name ?? "");
    setSummary(doc.summary);
    setTagsStr(doc.tags.join(", "));
    setAmountStr(doc.amount != null ? String(doc.amount) : "");
    setDocumentDate(doc.document_date ?? "");
    setDueDate(doc.due_date ?? "");
    setEventDate(doc.event_date ?? "");
    setExpirationDate(doc.expiration_date ?? "");
  }, [doc?.id]);

  // Close on Escape
  useEffect(() => {
    if (!doc) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doc, onClose]);

  if (!doc) return null;

  function commitName() {
    if (name !== doc!.name && name.trim()) renameDocument(doc!.id, name.trim());
  }
  function commitVendorName() {
    updateDocument(doc!.id, { vendor_name: vendorName.trim() || null });
  }
  function commitSummary() {
    updateDocument(doc!.id, { summary });
  }
  function commitTags() {
    const tags = tagsStr.split(",").map((t) => t.trim()).filter(Boolean);
    updateDocument(doc!.id, { tags });
  }
  function commitAmount() {
    const num = amountStr.trim() === "" ? null : Number(amountStr);
    if (num != null && !Number.isFinite(num)) return;
    updateDocument(doc!.id, { amount: num, financial: num != null });
  }
  function commitDate(field: "document_date" | "due_date" | "event_date" | "expiration_date", value: string) {
    updateDocument(doc!.id, { [field]: value || null } as Record<string, string | null>);
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-ink/10 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className="fixed right-0 top-0 z-50 flex h-screen w-[400px] flex-col border-l border-border bg-white shadow-xl"
        role="dialog"
        aria-label="Document details"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 border-b border-border px-5 py-4">
          <div className="min-w-0 flex-1">
            <p
              className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {FOLDER_LABEL[doc.folder]}
              {doc.vendor_category !== "other" && doc.vendor_category !== "legal_admin" &&
                ` · ${VENDOR_CATEGORY_LABEL[doc.vendor_category]}`}
            </p>
            <h2 className="mt-1 truncate font-serif text-[17px] font-medium text-ink">
              {doc.name}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <a
              href={doc.file_url}
              download={doc.name}
              className="flex h-7 w-7 items-center justify-center rounded-md text-ink-faint hover:bg-ivory-warm hover:text-ink"
              aria-label="Download"
            >
              <Download size={14} strokeWidth={1.8} />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-md text-ink-faint hover:bg-ivory-warm hover:text-ink"
              aria-label="Close drawer"
            >
              <X size={15} strokeWidth={1.8} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Preview */}
          <div className="flex aspect-[4/3] items-center justify-center border-b border-border bg-ivory-warm/40">
            {doc.mime_type.startsWith("image/") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={doc.file_url} alt={doc.name} className="h-full w-full object-contain" />
            ) : doc.mime_type === "application/pdf" ? (
              <iframe src={doc.file_url} className="h-full w-full" title={doc.name} />
            ) : (
              <div className="flex flex-col items-center gap-2 text-ink-faint">
                <FileText size={32} strokeWidth={1.4} />
                <span className="text-[11px] uppercase tracking-wider">{doc.mime_type}</span>
              </div>
            )}
          </div>

          {/* Meta badges */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-border px-5 py-3">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px]",
                DOCUMENT_TYPE_BADGE[doc.document_type],
              )}
            >
              {DOCUMENT_TYPE_LABEL[doc.document_type]}
            </span>
            {doc.needs_review && (
              <span className="rounded-full border border-saffron/30 bg-saffron/15 px-2 py-0.5 text-[11px] text-saffron">
                Needs review
              </span>
            )}
            <span className="ml-auto text-[11px] text-ink-faint">
              {prettyBytes(doc.size_bytes)} · {relativeUploadedAt(doc.uploaded_at)}
            </span>
          </div>

          {/* Review reason */}
          {doc.needs_review && doc.review_reason && (
            <div className="border-b border-border bg-saffron/5 px-5 py-3 text-[12px] text-ink-muted">
              <span className="font-medium text-saffron">Why flagged: </span>
              {doc.review_reason}
            </div>
          )}

          {/* Editable fields */}
          <div className="flex flex-col gap-3 px-5 py-4">
            <Field label="Name">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={commitName}
                className="w-full rounded-md border border-border px-2.5 py-1.5 text-[13px] text-ink outline-none focus:border-gold/50"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Type">
                <select
                  value={doc.document_type}
                  onChange={(e) =>
                    updateDocument(doc.id, { document_type: e.target.value as DocumentType })
                  }
                  className="w-full rounded-md border border-border bg-white px-2 py-1.5 text-[13px] text-ink outline-none focus:border-gold/50"
                >
                  {(Object.keys(DOCUMENT_TYPE_LABEL) as DocumentType[]).map((t) => (
                    <option key={t} value={t}>
                      {DOCUMENT_TYPE_LABEL[t]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Folder">
                <select
                  value={doc.folder}
                  onChange={(e) => {
                    const folder = e.target.value as DocumentFolder;
                    updateDocument(doc.id, {
                      folder,
                      folder_path: folderPathFor(folder, doc.vendor_category),
                    });
                  }}
                  className="w-full rounded-md border border-border bg-white px-2 py-1.5 text-[13px] text-ink outline-none focus:border-gold/50"
                >
                  {FOLDER_ORDER.map((f) => (
                    <option key={f} value={f}>
                      {FOLDER_LABEL[f]}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Vendor category">
              <select
                value={doc.vendor_category}
                onChange={(e) => {
                  const vc = e.target.value as DocumentVendorCategory;
                  updateDocument(doc.id, {
                    vendor_category: vc,
                    folder_path: folderPathFor(doc.folder, vc),
                  });
                }}
                className="w-full rounded-md border border-border bg-white px-2 py-1.5 text-[13px] text-ink outline-none focus:border-gold/50"
              >
                {(Object.keys(VENDOR_CATEGORY_LABEL) as DocumentVendorCategory[]).map((v) => (
                  <option key={v} value={v}>
                    {VENDOR_CATEGORY_LABEL[v]}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Vendor name">
              <input
                type="text"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                onBlur={commitVendorName}
                placeholder="e.g. Moksha Studios"
                className="w-full rounded-md border border-border px-2.5 py-1.5 text-[13px] text-ink placeholder:text-ink-faint outline-none focus:border-gold/50"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Amount">
                <input
                  type="text"
                  inputMode="decimal"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  onBlur={commitAmount}
                  placeholder="0"
                  className="w-full rounded-md border border-border px-2.5 py-1.5 text-right font-mono text-[13px] tabular-nums text-ink outline-none focus:border-gold/50"
                />
              </Field>
              <Field label="Currency">
                <select
                  value={doc.currency ?? ""}
                  onChange={(e) =>
                    updateDocument(doc.id, { currency: e.target.value || null })
                  }
                  className="w-full rounded-md border border-border bg-white px-2 py-1.5 text-[13px] text-ink outline-none focus:border-gold/50"
                >
                  <option value="">—</option>
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                  <option value="EUR">EUR</option>
                  <option value="AED">AED</option>
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Document date">
                <input
                  type="date"
                  value={documentDate}
                  onChange={(e) => {
                    setDocumentDate(e.target.value);
                    commitDate("document_date", e.target.value);
                  }}
                  className="w-full rounded-md border border-border px-2.5 py-1.5 text-[13px] text-ink outline-none focus:border-gold/50"
                />
              </Field>
              <Field label="Due date">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value);
                    commitDate("due_date", e.target.value);
                  }}
                  className="w-full rounded-md border border-border px-2.5 py-1.5 text-[13px] text-ink outline-none focus:border-gold/50"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Event date">
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => {
                    setEventDate(e.target.value);
                    commitDate("event_date", e.target.value);
                  }}
                  className="w-full rounded-md border border-border px-2.5 py-1.5 text-[13px] text-ink outline-none focus:border-gold/50"
                />
              </Field>
              <Field label="Expires">
                <input
                  type="date"
                  value={expirationDate}
                  onChange={(e) => {
                    setExpirationDate(e.target.value);
                    commitDate("expiration_date", e.target.value);
                  }}
                  className="w-full rounded-md border border-border px-2.5 py-1.5 text-[13px] text-ink outline-none focus:border-gold/50"
                />
              </Field>
            </div>

            {doc.document_type === "contract" && (
              <Field label="Signed">
                <label className="flex items-center gap-2 text-[13px] text-ink-muted">
                  <input
                    type="checkbox"
                    checked={doc.signed ?? false}
                    onChange={(e) => updateDocument(doc.id, { signed: e.target.checked })}
                    className="h-3.5 w-3.5 accent-gold"
                  />
                  Fully executed
                </label>
              </Field>
            )}

            <Field label="AI summary">
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                onBlur={commitSummary}
                rows={3}
                className="w-full resize-none rounded-md border border-border px-2.5 py-1.5 text-[13px] text-ink outline-none focus:border-gold/50"
              />
            </Field>

            {doc.key_terms.length > 0 && (
              <Field label="Key terms">
                <div className="flex flex-wrap gap-1.5">
                  {doc.key_terms.map((k, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-border bg-ivory-warm/40 px-2 py-0.5 text-[11px] text-ink-muted"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </Field>
            )}

            <Field label="Tags (comma-separated)">
              <input
                type="text"
                value={tagsStr}
                onChange={(e) => setTagsStr(e.target.value)}
                onBlur={commitTags}
                placeholder="signed, deposit paid, florals"
                className="w-full rounded-md border border-border px-2.5 py-1.5 text-[13px] text-ink placeholder:text-ink-faint outline-none focus:border-gold/50"
              />
            </Field>

            {doc.needs_review && (
              <button
                type="button"
                onClick={() => updateDocument(doc.id, { needs_review: false, review_reason: null })}
                className="mt-2 rounded-md bg-ink px-3 py-2 text-[12.5px] font-medium text-ivory hover:opacity-90"
              >
                Clear review flag
              </button>
            )}
          </div>

          {/* Footer meta */}
          <div className="border-t border-border bg-ivory-warm/30 px-5 py-3 text-[11px] text-ink-faint">
            <div>Filed to: {doc.folder_path}</div>
            <div>Confidence: {Math.round(doc.confidence_overall * 100)}%</div>
            <div>Uploaded by: {doc.uploaded_by}</div>
          </div>
        </div>
      </aside>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
