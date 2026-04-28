"use client";

// ── Documents canvas ───────────────────────────────────────────────────────
// Main right-pane canvas for /documents. Composes header, tab bar, the
// file table, upload modal, and the details drawer.

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Download,
  FolderArchive,
  Loader2,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  DocumentFolder,
  DocumentTabId,
} from "@/types/documents";
import {
  DOCUMENT_TABS,
  FOLDER_LABEL,
  VENDOR_CATEGORY_LABEL,
} from "@/types/documents";
import { useDocumentsStore } from "@/stores/documents-store";
import {
  compareDocs,
  totalStorageGB,
  type DocumentSortKey,
} from "@/lib/documents/helpers";
import {
  downloadDocumentsAsZip,
  downloadSingleDocument,
  zipNameFor,
} from "@/lib/documents/download";
import {
  DocumentsToolbar,
  EMPTY_FILTERS,
  type GroupByKey,
  type ToolbarFilters,
  type ViewMode,
} from "./DocumentsToolbar";
import { DocumentsTable } from "./DocumentsTable";
import { DocumentDrawer } from "./DocumentDrawer";
import { UploadReviewModal } from "./UploadReviewModal";

export function DocumentsCanvas({ initialTab }: { initialTab: DocumentTabId }) {
  const router = useRouter();
  const documents = useDocumentsStore((s) => s.documents);
  const deleteDocument = useDocumentsStore((s) => s.deleteDocument);
  const renameDocument = useDocumentsStore((s) => s.renameDocument);
  const moveDocument = useDocumentsStore((s) => s.moveDocument);

  const [activeTab, setActiveTab] = useState<DocumentTabId>(initialTab);
  useEffect(() => setActiveTab(initialTab), [initialTab]);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<ToolbarFilters>(EMPTY_FILTERS);
  const [view, setView] = useState<ViewMode>("table");
  const [sort, setSort] = useState<DocumentSortKey>("recent");
  const [groupBy, setGroupBy] = useState<GroupByKey>("none");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [drawerDocId, setDrawerDocId] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; tone: "ok" | "err" } | null>(null);

  const unsortedCount = useMemo(
    () => documents.filter((d) => d.folder === "unsorted").length,
    [documents],
  );

  // Build filtered + sorted list
  const filtered = useMemo(() => {
    const today = new Date();
    const q = search.trim().toLowerCase();
    const out = documents.filter((d) => {
      // Tab filter
      if (activeTab !== "all" && d.folder !== activeTab) return false;

      // Toolbar filters
      if (filters.types.length > 0 && !filters.types.includes(d.document_type)) return false;
      if (filters.vendors.length > 0 && !filters.vendors.includes(d.vendor_category)) return false;
      if (filters.needsReview && !d.needs_review) return false;
      if (filters.amountMin != null && (d.amount ?? 0) < filters.amountMin) return false;
      if (filters.amountMax != null && (d.amount ?? 0) > filters.amountMax) return false;
      if (filters.dateFrom && (d.document_date ?? "") < filters.dateFrom) return false;
      if (filters.dateTo && (d.document_date ?? "9999") > filters.dateTo) return false;
      if (filters.status) {
        if (filters.status === "signed" && d.signed !== true) return false;
        if (filters.status === "unsigned" && d.signed === true) return false;
        if (filters.status === "paid" && !d.tags.includes("paid") && d.document_type !== "receipt")
          return false;
        if (
          filters.status === "unpaid" &&
          (d.tags.includes("paid") || d.document_type !== "invoice")
        ) {
          return false;
        }
        if (filters.status === "expired") {
          if (!d.expiration_date) return false;
          if (new Date(d.expiration_date) >= today) return false;
        }
      }

      // Search
      if (q) {
        const hay =
          `${d.name} ${d.vendor_name ?? ""} ${VENDOR_CATEGORY_LABEL[d.vendor_category]} ${d.summary} ${d.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    out.sort((a, b) => compareDocs(a, b, sort));
    return out;
  }, [documents, activeTab, filters, search, sort]);

  const drawerDoc = useMemo(
    () => documents.find((d) => d.id === drawerDocId) ?? null,
    [documents, drawerDocId],
  );

  function setTabAndUrl(tab: DocumentTabId) {
    setActiveTab(tab);
    setSelectedIds([]);
    const def = DOCUMENT_TABS.find((t) => t.id === tab);
    router.replace(tab === "all" ? "/documents" : `/documents/${def?.slug}`, { scroll: false });
  }

  const handleAction = useCallback(
    (action: "download" | "rename" | "move" | "delete", id: string) => {
      const doc = documents.find((d) => d.id === id);
      if (!doc) return;
      if (action === "download") {
        const a = document.createElement("a");
        a.href = doc.file_url;
        a.download = doc.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        return;
      }
      if (action === "rename") {
        const next = typeof window !== "undefined" ? window.prompt("Rename document", doc.name) : null;
        if (next && next.trim()) renameDocument(id, next.trim());
        return;
      }
      if (action === "move") {
        const folders = ["contracts", "invoices_receipts", "deliverables", "planning", "legal_admin", "unsorted"] as DocumentFolder[];
        const labels = folders.map((f, i) => `${i + 1}. ${FOLDER_LABEL[f]}`).join("\n");
        const pick = typeof window !== "undefined"
          ? window.prompt(`Move to which folder?\n\n${labels}\n\nEnter 1–${folders.length}:`)
          : null;
        const idx = Number(pick) - 1;
        if (Number.isInteger(idx) && idx >= 0 && idx < folders.length) {
          moveDocument(id, folders[idx]!);
        }
        return;
      }
      if (action === "delete") {
        const ok = typeof window !== "undefined"
          ? window.confirm(`Delete "${doc.name}"? This cannot be undone.`)
          : false;
        if (ok) {
          deleteDocument(id);
          if (drawerDocId === id) setDrawerDocId(null);
        }
      }
    },
    [documents, renameDocument, moveDocument, deleteDocument, drawerDocId],
  );

  // Which docs should a bulk download cover?
  // Priority: manual checkbox selection > current filtered view.
  const selectionSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const downloadDocs = useMemo(() => {
    if (selectedIds.length > 0) return filtered.filter((d) => selectionSet.has(d.id));
    return filtered;
  }, [filtered, selectedIds, selectionSet]);

  const filtersActive =
    search.trim() !== "" || !isEmptyFilters(filters);

  const downloadLabel = useMemo(() => {
    if (selectedIds.length > 0) return "selected documents";
    const tabDef = DOCUMENT_TABS.find((t) => t.id === activeTab);
    if (filtersActive) return "filtered documents";
    if (activeTab === "all") return "all documents";
    return (tabDef?.label ?? "documents").toLowerCase();
  }, [selectedIds.length, activeTab, filtersActive]);

  const showToast = useCallback((msg: string, tone: "ok" | "err") => {
    setToast({ msg, tone });
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  const handleDownload = useCallback(async () => {
    if (downloadDocs.length === 0 || downloading) return;
    setDownloading(true);
    try {
      if (downloadDocs.length === 1) {
        await downloadSingleDocument(downloadDocs[0]!);
        showToast(`Downloaded “${downloadDocs[0]!.name}”.`, "ok");
      } else {
        const tabDef = DOCUMENT_TABS.find((t) => t.id === activeTab);
        const zipName = zipNameFor({
          isManualSelection: selectedIds.length > 0,
          tabSlug: activeTab === "all" ? "" : (tabDef?.slug ?? ""),
          tabLabel: tabDef?.label ?? "documents",
          hasExtraFilters: filtersActive,
        });
        const { ok, failed } = await downloadDocumentsAsZip(downloadDocs, zipName);
        if (failed.length === 0) {
          showToast(`Downloaded ${ok} document${ok === 1 ? "" : "s"}.`, "ok");
        } else {
          showToast(
            `Downloaded ${ok} of ${downloadDocs.length}. ${failed.length} failed.`,
            "err",
          );
        }
      }
    } catch (err) {
      console.error("Download failed", err);
      showToast("Download failed. Please try again.", "err");
    } finally {
      setDownloading(false);
    }
  }, [downloadDocs, downloading, activeTab, selectedIds.length, filtersActive, showToast]);

  return (
    <main className="workspace-editorial flex flex-1 flex-col overflow-hidden">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="border-b border-gold/15 bg-white px-10 pb-4 pt-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <p
              className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Workspace · Documents
            </p>
            <h1 className="mt-1.5 flex items-center gap-2.5 font-serif text-[30px] leading-[1.1] text-ink">
              <FolderArchive size={26} strokeWidth={1.5} className="text-ink-muted" />
              Documents
            </h1>
            <p className="mt-1.5 text-[13px] text-ink-muted">
              {documents.length} file{documents.length === 1 ? "" : "s"} · {totalStorageGB(documents)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloadDocs.length === 0 || downloading}
              title={
                downloadDocs.length === 0
                  ? "No documents to download."
                  : `Download ${downloadLabel}`
              }
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] font-medium shadow-sm transition-colors",
                downloadDocs.length === 0 || downloading
                  ? "cursor-not-allowed border-border bg-white text-ink-faint opacity-70"
                  : "border-gold/50 bg-white text-gold hover:bg-gold-pale/40",
              )}
            >
              {downloading ? (
                <Loader2 size={13} strokeWidth={1.8} className="animate-spin" />
              ) : (
                <Download size={13} strokeWidth={1.8} />
              )}
              Download
              <span
                className={cn(
                  "ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-mono text-[10px] tabular-nums",
                  downloadDocs.length === 0 || downloading
                    ? "bg-ink/5 text-ink-faint"
                    : "bg-gold-pale/70 text-ink",
                )}
              >
                {downloadDocs.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setUploadOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md bg-gold px-3 py-1.5 text-[12px] font-medium text-white shadow-sm transition-opacity hover:opacity-90"
            >
              <Upload size={13} strokeWidth={1.8} />
              Upload
            </button>
          </div>
        </div>

        {/* Tabs */}
        <nav
          className="-mb-px mt-7 flex items-center gap-0 overflow-x-auto"
          aria-label="Documents tabs"
        >
          {DOCUMENT_TABS.map((t) => {
            const active = t.id === activeTab;
            const badge = t.id === "unsorted" ? unsortedCount : 0;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTabAndUrl(t.id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-1.5 whitespace-nowrap px-5 pb-3 pt-2 text-[12.5px] font-medium transition-colors",
                  active ? "text-ink" : "text-ink-muted hover:text-ink",
                )}
              >
                {t.label}
                {badge > 0 && (
                  <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-saffron/15 px-1.5 font-mono text-[10px] tabular-nums text-saffron">
                    {badge}
                  </span>
                )}
                {active && (
                  <span className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-ink" />
                )}
              </button>
            );
          })}
        </nav>
      </header>

      {/* ── Body: file table fills the available space ────────────────── */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-white">
        <DocumentsToolbar
          search={search}
          onSearchChange={setSearch}
          filters={filters}
          onFiltersChange={setFilters}
          view={view}
          onViewChange={setView}
          sort={sort}
          onSortChange={setSort}
          groupBy={groupBy}
          onGroupByChange={setGroupBy}
          totalCount={documents.length}
          filteredCount={filtered.length}
        />

        {/* Bulk action bar */}
        {selectedIds.length > 0 && (
          <BulkBar
            count={selectedIds.length}
            onClear={() => setSelectedIds([])}
            onDelete={() => {
              const ok =
                typeof window !== "undefined"
                  ? window.confirm(`Delete ${selectedIds.length} document(s)?`)
                  : false;
              if (!ok) return;
              for (const id of selectedIds) deleteDocument(id);
              setSelectedIds([]);
            }}
          />
        )}

        {/* Content */}
        {filtered.length === 0 ? (
          <EmptyState
            activeTab={activeTab}
            totalDocs={documents.length}
            hasFilters={search !== "" || !isEmptyFilters(filters)}
            onClearFilters={() => {
              setSearch("");
              setFilters(EMPTY_FILTERS);
            }}
            onUpload={() => setUploadOpen(true)}
          />
        ) : (
          <DocumentsTable
            documents={filtered}
            view={view}
            groupBy={groupBy}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onRowClick={setDrawerDocId}
            onAction={handleAction}
          />
        )}
      </div>

      <DocumentDrawer doc={drawerDoc} onClose={() => setDrawerDocId(null)} />
      <UploadReviewModal open={uploadOpen} onClose={() => setUploadOpen(false)} />

      {toast && (
        <div
          role="status"
          className={cn(
            "pointer-events-none fixed bottom-6 right-6 z-50 rounded-md border px-4 py-2.5 text-[12.5px] shadow-lg",
            toast.tone === "ok"
              ? "border-sage/40 bg-white text-ink"
              : "border-rose/40 bg-white text-rose",
          )}
        >
          {toast.msg}
        </div>
      )}
    </main>
  );
}

function isEmptyFilters(f: ToolbarFilters): boolean {
  return (
    f.types.length === 0 &&
    f.vendors.length === 0 &&
    f.status === null &&
    !f.needsReview &&
    f.amountMin == null &&
    f.amountMax == null &&
    f.dateFrom == null &&
    f.dateTo == null
  );
}

function BulkBar({
  count,
  onClear,
  onDelete,
}: {
  count: number;
  onClear: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="sticky top-[60px] z-10 flex items-center gap-3 border-b border-gold/20 bg-gold-pale/40 px-10 py-2">
      <span className="text-[12.5px] text-ink">
        {count} selected
      </span>
      <button
        type="button"
        onClick={onDelete}
        className="rounded-md border border-rose/40 bg-white px-2.5 py-1 text-[11.5px] text-rose hover:bg-rose/5"
      >
        Delete
      </button>
      <button
        type="button"
        onClick={onClear}
        className="ml-auto rounded-md px-2.5 py-1 text-[11.5px] text-ink-muted hover:text-ink"
      >
        Clear
      </button>
    </div>
  );
}

function EmptyState({
  activeTab,
  totalDocs,
  hasFilters,
  onClearFilters,
  onUpload,
}: {
  activeTab: DocumentTabId;
  totalDocs: number;
  hasFilters: boolean;
  onClearFilters: () => void;
  onUpload: () => void;
}) {
  if (hasFilters) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center">
        <p className="font-serif text-[17px] italic text-ink-muted">
          No documents match these filters.
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className="rounded-md border border-border bg-white px-3 py-1.5 text-[12.5px] text-ink-muted hover:text-ink"
        >
          Clear filters
        </button>
      </div>
    );
  }
  if (activeTab === "unsorted") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center">
        <div className="rounded-full bg-sage/10 p-4 text-sage">
          <AlertTriangle size={22} strokeWidth={1.4} />
        </div>
        <p className="font-serif text-[17px] italic text-ink-muted">
          Nothing flagged for review.
        </p>
        <p className="max-w-sm text-[12.5px] text-ink-faint">
          Ananya auto-filed everything cleanly.
        </p>
      </div>
    );
  }
  if (totalDocs === 0) {
    return (
      <div
        className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onUpload();
        }}
      >
        <div className="rounded-full bg-gold-pale/50 p-5 text-gold">
          <FolderArchive size={28} strokeWidth={1.3} />
        </div>
        <p className="font-serif text-[19px] text-ink">
          Drop files here or click Upload to get started.
        </p>
        <p className="max-w-md text-[13px] text-ink-muted">
          Ananya will auto-file each document into the right folder.
        </p>
        <button
          type="button"
          onClick={onUpload}
          className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-gold px-4 py-2 text-[12.5px] font-medium text-white shadow-sm hover:opacity-90"
        >
          <Upload size={13} strokeWidth={1.8} />
          Upload documents
        </button>
      </div>
    );
  }
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center">
      <p className="font-serif text-[16px] italic text-ink-muted">
        No documents in this tab yet.
      </p>
      <button
        type="button"
        onClick={onUpload}
        className="rounded-md bg-gold px-3 py-1.5 text-[12.5px] font-medium text-white hover:opacity-90"
      >
        Upload
      </button>
    </div>
  );
}
