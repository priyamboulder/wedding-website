"use client";

// ── Documents table ────────────────────────────────────────────────────────
// Main right-pane grid for the Documents canvas. Supports bulk select via
// checkboxes, per-row action menu, 50-row pagination, and a grid-view toggle.
// Click anywhere on a row (except checkbox or actions) to open the drawer.

import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  File,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocumentRecord } from "@/types/documents";
import {
  DOCUMENT_TYPE_BADGE,
  DOCUMENT_TYPE_LABEL,
  VENDOR_CATEGORY_LABEL,
  prettyBytes,
  relativeUploadedAt,
  statusChipFor,
} from "@/types/documents";
import { formatAmount, formatDate } from "@/lib/documents/helpers";
import type { GroupByKey, ViewMode } from "./DocumentsToolbar";

interface DocumentGroup {
  key: string;
  label: string;
  docs: DocumentRecord[];
  totalAmount: number | null;
  currency: string | null;
}

const STATUS_LABEL: Record<string, string> = {
  signed: "Signed",
  unsigned: "Unsigned",
  paid: "Paid",
  unpaid: "Unpaid",
  expired: "Expired",
  needs_review: "Needs review",
  none: "No status",
};

const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function groupKeyFor(doc: DocumentRecord, by: GroupByKey): { key: string; label: string; sortKey: string } {
  switch (by) {
    case "vendor": {
      const name = doc.vendor_name?.trim() || "— No vendor —";
      return { key: `vendor::${name}`, label: name, sortKey: name.toLowerCase() };
    }
    case "category":
      return {
        key: `cat::${doc.vendor_category}`,
        label: VENDOR_CATEGORY_LABEL[doc.vendor_category],
        sortKey: VENDOR_CATEGORY_LABEL[doc.vendor_category].toLowerCase(),
      };
    case "type":
      return {
        key: `type::${doc.document_type}`,
        label: DOCUMENT_TYPE_LABEL[doc.document_type],
        sortKey: DOCUMENT_TYPE_LABEL[doc.document_type].toLowerCase(),
      };
    case "status": {
      const chip = statusChipFor(doc);
      const kind = chip?.kind ?? "none";
      return { key: `status::${kind}`, label: STATUS_LABEL[kind] ?? kind, sortKey: kind };
    }
    case "month": {
      const iso = doc.uploaded_at;
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) {
        return { key: "month::unknown", label: "Unknown", sortKey: "0000-00" };
      }
      const y = d.getFullYear();
      const m = d.getMonth();
      const sortKey = `${y}-${String(m + 1).padStart(2, "0")}`;
      return { key: `month::${sortKey}`, label: `${MONTH_LABELS[m]} ${y}`, sortKey };
    }
    default:
      return { key: "all", label: "All", sortKey: "" };
  }
}

function buildGroups(docs: DocumentRecord[], by: GroupByKey): DocumentGroup[] {
  if (by === "none") return [];
  const map = new Map<string, { label: string; sortKey: string; docs: DocumentRecord[] }>();
  const order: string[] = [];
  for (const d of docs) {
    const { key, label, sortKey } = groupKeyFor(d, by);
    let entry = map.get(key);
    if (!entry) {
      entry = { label, sortKey, docs: [] };
      map.set(key, entry);
      order.push(key);
    }
    entry.docs.push(d);
  }
  const groups: DocumentGroup[] = order.map((key) => {
    const e = map.get(key)!;
    let total = 0;
    let any = false;
    let currency: string | null = null;
    for (const d of e.docs) {
      if (d.financial && d.amount != null) {
        any = true;
        total += d.amount;
        if (currency == null) currency = d.currency ?? null;
        else if (currency !== (d.currency ?? null)) currency = null;
      }
    }
    return {
      key,
      label: e.label,
      docs: e.docs,
      totalAmount: any ? total : null,
      currency,
    };
  });
  // For month groups, sort newest first; for everything else, alphabetical.
  if (by === "month") {
    groups.sort((a, b) => b.key.localeCompare(a.key));
  } else {
    groups.sort((a, b) => map.get(a.key)!.sortKey.localeCompare(map.get(b.key)!.sortKey));
  }
  return groups;
}

const PAGE_SIZE = 50;

export function DocumentsTable({
  documents,
  view,
  groupBy,
  selectedIds,
  onSelectionChange,
  onRowClick,
  onAction,
}: {
  documents: DocumentRecord[];
  view: ViewMode;
  groupBy: GroupByKey;
  selectedIds: string[];
  onSelectionChange: (next: string[]) => void;
  onRowClick: (id: string) => void;
  onAction: (action: "download" | "rename" | "move" | "delete", id: string) => void;
}) {
  const [page, setPage] = useState(0);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());

  const grouping = groupBy !== "none";
  const pageCount = Math.max(1, Math.ceil(documents.length / PAGE_SIZE));
  const visible = useMemo(
    () =>
      grouping
        ? documents
        : documents.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [documents, page, grouping],
  );

  // Reset to page 0 when the underlying list shrinks past the current page.
  if (!grouping && page > 0 && page >= pageCount) {
    setTimeout(() => setPage(0), 0);
  }

  const groups = useMemo(
    () => (grouping ? buildGroups(documents, groupBy) : []),
    [documents, grouping, groupBy],
  );

  const allSelected =
    visible.length > 0 && visible.every((d) => selectedIds.includes(d.id));
  const someSelected =
    !allSelected && visible.some((d) => selectedIds.includes(d.id));

  function toggleAll() {
    const set = new Set(selectedIds);
    if (allSelected) {
      visible.forEach((d) => set.delete(d.id));
    } else {
      visible.forEach((d) => set.add(d.id));
    }
    onSelectionChange(Array.from(set));
  }

  function toggleOne(id: string) {
    const set = new Set(selectedIds);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    onSelectionChange(Array.from(set));
  }

  function toggleGroup(key: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  if (view === "grid") {
    if (grouping) {
      return (
        <div className="flex flex-col gap-6 p-6">
          {groups.map((g) => {
            const isCollapsed = collapsed.has(g.key);
            return (
              <section key={g.key}>
                <GroupHeader
                  label={g.label}
                  count={g.docs.length}
                  totalAmount={g.totalAmount}
                  currency={g.currency}
                  collapsed={isCollapsed}
                  onToggle={() => toggleGroup(g.key)}
                />
                {!isCollapsed && (
                  <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {g.docs.map((d) => (
                      <GridCard
                        key={d.id}
                        doc={d}
                        selected={selectedIds.includes(d.id)}
                        onSelect={() => toggleOne(d.id)}
                        onOpen={() => onRowClick(d.id)}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      );
    }
    return (
      <>
        <div className="grid grid-cols-2 gap-4 p-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {visible.map((d) => (
            <GridCard
              key={d.id}
              doc={d}
              selected={selectedIds.includes(d.id)}
              onSelect={() => toggleOne(d.id)}
              onOpen={() => onRowClick(d.id)}
            />
          ))}
        </div>
        <Pagination page={page} pageCount={pageCount} onPageChange={setPage} total={documents.length} />
      </>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-border bg-ivory-warm/40">
              <th className="w-10 px-3 py-2.5 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleAll}
                  className="h-3.5 w-3.5 accent-gold"
                  aria-label="Select all on page"
                />
              </th>
              <Th>Name</Th>
              <Th className="w-[140px]">Type</Th>
              <Th className="w-[200px]">Vendor</Th>
              <Th className="w-[120px] text-right">Amount</Th>
              <Th className="w-[120px]">Date</Th>
              <Th className="w-[110px]">Status</Th>
              <Th className="w-[100px]">Uploaded</Th>
              <th className="w-[44px] px-2 py-2.5" aria-hidden />
            </tr>
          </thead>
          <tbody>
            {grouping
              ? groups.map((g) => {
                  const isCollapsed = collapsed.has(g.key);
                  return (
                    <GroupRows
                      key={g.key}
                      group={g}
                      collapsed={isCollapsed}
                      onToggle={() => toggleGroup(g.key)}
                      selectedIds={selectedIds}
                      onToggleOne={toggleOne}
                      onOpen={onRowClick}
                      onAction={onAction}
                    />
                  );
                })
              : visible.map((d) => (
                  <Row
                    key={d.id}
                    doc={d}
                    selected={selectedIds.includes(d.id)}
                    onToggleSelect={() => toggleOne(d.id)}
                    onOpen={() => onRowClick(d.id)}
                    onAction={(action) => onAction(action, d.id)}
                  />
                ))}
          </tbody>
        </table>
      </div>
      {!grouping && (
        <Pagination page={page} pageCount={pageCount} onPageChange={setPage} total={documents.length} />
      )}
    </div>
  );
}

function GroupHeader({
  label,
  count,
  totalAmount,
  currency,
  collapsed,
  onToggle,
}: {
  label: string;
  count: number;
  totalAmount: number | null;
  currency: string | null;
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="group flex w-full items-center gap-2 border-b border-gold/20 bg-ivory-warm/40 px-3 py-2 text-left transition-colors hover:bg-ivory-warm/70"
      aria-expanded={!collapsed}
    >
      <span className="flex h-5 w-5 items-center justify-center text-ink-muted">
        {collapsed ? (
          <ChevronRight size={14} strokeWidth={2} />
        ) : (
          <ChevronDown size={14} strokeWidth={2} />
        )}
      </span>
      <span className="text-[13px] font-semibold text-ink">{label}</span>
      <span
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {count} {count === 1 ? "file" : "files"}
      </span>
      {totalAmount != null && (
        <span className="ml-auto font-mono text-[11.5px] tabular-nums text-ink">
          Total {formatAmount(totalAmount, currency)}
        </span>
      )}
    </button>
  );
}

function GroupRows({
  group,
  collapsed,
  onToggle,
  selectedIds,
  onToggleOne,
  onOpen,
  onAction,
}: {
  group: DocumentGroup;
  collapsed: boolean;
  onToggle: () => void;
  selectedIds: string[];
  onToggleOne: (id: string) => void;
  onOpen: (id: string) => void;
  onAction: (action: "download" | "rename" | "move" | "delete", id: string) => void;
}) {
  return (
    <>
      <tr className="border-b border-gold/20 bg-ivory-warm/40">
        <td colSpan={9} className="px-0 py-0">
          <GroupHeader
            label={group.label}
            count={group.docs.length}
            totalAmount={group.totalAmount}
            currency={group.currency}
            collapsed={collapsed}
            onToggle={onToggle}
          />
        </td>
      </tr>
      {!collapsed &&
        group.docs.map((d) => (
          <Row
            key={d.id}
            doc={d}
            selected={selectedIds.includes(d.id)}
            onToggleSelect={() => onToggleOne(d.id)}
            onOpen={() => onOpen(d.id)}
            onAction={(action) => onAction(action, d.id)}
          />
        ))}
    </>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "px-3 py-2.5 text-left font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint",
        className,
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </th>
  );
}

function Row({
  doc,
  selected,
  onToggleSelect,
  onOpen,
  onAction,
}: {
  doc: DocumentRecord;
  selected: boolean;
  onToggleSelect: () => void;
  onOpen: () => void;
  onAction: (action: "download" | "rename" | "move" | "delete") => void;
}) {
  const chip = statusChipFor(doc);

  return (
    <tr
      className={cn(
        "group cursor-pointer border-b border-border/70 transition-colors hover:bg-ivory-warm/30",
        selected && "bg-gold-pale/20",
      )}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest("[data-no-row-click]")) return;
        onOpen();
      }}
    >
      <td className="w-10 px-3 py-2.5" data-no-row-click>
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          className="h-3.5 w-3.5 accent-gold"
          aria-label={`Select ${doc.name}`}
        />
      </td>
      <td className="max-w-[360px] px-3 py-2.5">
        <div className="flex items-center gap-2">
          <FileIcon mime={doc.mime_type} />
          <div className="min-w-0">
            <div className="truncate font-medium text-ink">{doc.name}</div>
            <div className="text-[11px] text-ink-faint">{prettyBytes(doc.size_bytes)}</div>
          </div>
          {doc.needs_review && (
            <span
              className="inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-saffron"
              aria-label="Needs review"
              title="Flagged for review"
            />
          )}
        </div>
      </td>
      <td className="px-3 py-2.5">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px]",
            DOCUMENT_TYPE_BADGE[doc.document_type],
          )}
        >
          {DOCUMENT_TYPE_LABEL[doc.document_type]}
        </span>
      </td>
      <td className="px-3 py-2.5">
        {doc.vendor_name ? (
          <div className="min-w-0">
            <div className="truncate text-ink">{doc.vendor_name}</div>
            <div className="truncate text-[11px] text-ink-faint">
              {VENDOR_CATEGORY_LABEL[doc.vendor_category]}
            </div>
          </div>
        ) : (
          <span className="text-[11px] uppercase tracking-wider text-ink-faint">
            {VENDOR_CATEGORY_LABEL[doc.vendor_category]}
          </span>
        )}
      </td>
      <td className="px-3 py-2.5 text-right font-mono tabular-nums text-ink">
        {doc.financial ? formatAmount(doc.amount, doc.currency) : <span className="text-ink-faint">—</span>}
      </td>
      <td className="px-3 py-2.5 text-ink-muted">{formatDate(doc.document_date)}</td>
      <td className="px-3 py-2.5">
        {chip && <StatusChip chip={chip} />}
      </td>
      <td className="px-3 py-2.5 text-[11.5px] text-ink-faint">{relativeUploadedAt(doc.uploaded_at)}</td>
      <td className="px-2 py-2.5" data-no-row-click>
        <RowMenu onAction={onAction} />
      </td>
    </tr>
  );
}

function RowMenu({ onAction }: { onAction: (a: "download" | "rename" | "move" | "delete") => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="flex h-7 w-7 items-center justify-center rounded-md text-ink-faint opacity-0 transition-opacity hover:bg-ivory-warm hover:text-ink group-hover:opacity-100"
        aria-label="Row actions"
      >
        <MoreHorizontal size={15} />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full z-20 mt-1 w-[140px] rounded-md border border-border bg-white py-1 text-[12.5px] shadow-lg"
          onMouseDown={(e) => e.preventDefault()}
        >
          {(["download", "rename", "move", "delete"] as const).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => {
                onAction(a);
                setOpen(false);
              }}
              className={cn(
                "block w-full px-3 py-1.5 text-left capitalize transition-colors hover:bg-ivory-warm",
                a === "delete" ? "text-rose" : "text-ink-muted",
              )}
            >
              {a}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusChip({ chip }: { chip: NonNullable<ReturnType<typeof statusChipFor>> }) {
  const map: Record<string, string> = {
    signed: "bg-sage/15 text-sage border-sage/30",
    unsigned: "bg-ink/5 text-ink-muted border-border",
    paid: "bg-sage/15 text-sage border-sage/30",
    unpaid: "bg-rose/10 text-rose border-rose/30",
    expired: "bg-rose/15 text-rose border-rose/40",
    needs_review: "bg-saffron/15 text-saffron border-saffron/30",
  };
  const label: Record<string, string> = {
    signed: "Signed",
    unsigned: "Unsigned",
    paid: "Paid",
    unpaid: "Unpaid",
    expired: "Expired",
    needs_review: "Review",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px]",
        map[chip.kind],
      )}
    >
      {label[chip.kind]}
    </span>
  );
}

function FileIcon({ mime }: { mime: string }) {
  const common = "shrink-0 text-ink-muted";
  if (mime === "application/pdf") return <FileText size={16} className={common} strokeWidth={1.6} />;
  if (mime.startsWith("image/")) return <FileImage size={16} className={common} strokeWidth={1.6} />;
  if (mime.includes("spreadsheetml") || mime.includes("ms-excel"))
    return <FileSpreadsheet size={16} className={common} strokeWidth={1.6} />;
  if (mime === "text/plain" || mime.includes("wordprocessingml") || mime.includes("msword"))
    return <FileText size={16} className={common} strokeWidth={1.6} />;
  if (mime.includes("zip")) return <FileArchive size={16} className={common} strokeWidth={1.6} />;
  return <File size={16} className={common} strokeWidth={1.6} />;
}

function Pagination({
  page,
  pageCount,
  onPageChange,
  total,
}: {
  page: number;
  pageCount: number;
  onPageChange: (p: number) => void;
  total: number;
}) {
  if (total <= PAGE_SIZE) return null;
  return (
    <div className="flex items-center justify-between border-t border-border bg-white px-6 py-3 text-[12px] text-ink-muted">
      <span>
        Page {page + 1} of {pageCount} · {total} files
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={page === 0}
          className="flex h-7 w-7 items-center justify-center rounded-md text-ink-muted hover:bg-ivory-warm disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(pageCount - 1, page + 1))}
          disabled={page >= pageCount - 1}
          className="flex h-7 w-7 items-center justify-center rounded-md text-ink-muted hover:bg-ivory-warm disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

function GridCard({
  doc,
  selected,
  onSelect,
  onOpen,
}: {
  doc: DocumentRecord;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
}) {
  const chip = statusChipFor(doc);
  const isImage = doc.mime_type.startsWith("image/");
  return (
    <div
      className={cn(
        "group flex cursor-pointer flex-col overflow-hidden rounded-lg border bg-white transition-all hover:shadow-md",
        selected ? "border-gold/60 shadow-md" : "border-border",
      )}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest("[data-no-row-click]")) return;
        onOpen();
      }}
    >
      <div className="relative aspect-[4/3] bg-ivory-warm/50">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={doc.file_url}
            alt={doc.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <FileIcon mime={doc.mime_type} />
          </div>
        )}
        <label
          data-no-row-click
          className="absolute left-2 top-2 flex h-5 w-5 cursor-pointer items-center justify-center rounded-sm bg-white/90 shadow-sm"
        >
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            className="h-3 w-3 accent-gold"
          />
        </label>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <div className="truncate text-[12.5px] font-medium text-ink">{doc.name}</div>
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "rounded-full border px-1.5 py-0.5 text-[10px]",
              DOCUMENT_TYPE_BADGE[doc.document_type],
            )}
          >
            {DOCUMENT_TYPE_LABEL[doc.document_type]}
          </span>
          {chip && <StatusChip chip={chip} />}
        </div>
        <div className="mt-auto flex items-center justify-between text-[11px] text-ink-faint">
          <span className="truncate">{doc.vendor_name ?? VENDOR_CATEGORY_LABEL[doc.vendor_category]}</span>
          <span>{relativeUploadedAt(doc.uploaded_at)}</span>
        </div>
      </div>
    </div>
  );
}
