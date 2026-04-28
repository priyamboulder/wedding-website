"use client";

// ── VendorTagPicker ────────────────────────────────────────────────────────
// Search + select a vendor from the couple's Vendors store, with a fallback
// "Add as free text" affordance for vendors that aren't in the directory
// yet (useful while the couple is still building their vendor list).

import { useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Vendor } from "@/types/vendor-unified";

interface Props {
  vendors: Vendor[];
  assignedIds: string[];
  onAssign: (vendorId: string) => void;
  onAddCustom: (name: string) => void;
}

export function VendorTagPicker({
  vendors,
  assignedIds,
  onAssign,
  onAddCustom,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const available = vendors.filter((v) => !assignedIds.includes(v.id));
    if (q.length === 0) return available.slice(0, 12);
    return available
      .filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q),
      )
      .slice(0, 12);
  }, [vendors, assignedIds, query]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border bg-white px-2.5 py-1.5 text-[12px] text-ink-muted hover:border-ink-faint hover:text-ink"
      >
        <Plus size={12} strokeWidth={1.6} />
        Assign vendor
      </button>
    );
  }

  return (
    <div className="rounded-md border border-border bg-white shadow-[0_8px_24px_-12px_rgba(26,26,26,0.15)]">
      <div className="flex items-center gap-2 border-b border-border px-2.5 py-1.5">
        <Search size={12} strokeWidth={1.6} className="text-ink-faint" />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search vendors…"
          className="flex-1 bg-transparent text-[12.5px] text-ink outline-none placeholder:text-ink-faint"
        />
        <button
          type="button"
          aria-label="Close"
          onClick={() => {
            setOpen(false);
            setQuery("");
          }}
          className="flex h-5 w-5 items-center justify-center text-ink-faint hover:text-ink"
        >
          <X size={12} strokeWidth={1.6} />
        </button>
      </div>
      <ul className="max-h-48 overflow-y-auto py-1">
        {results.length === 0 && query.trim().length === 0 && (
          <li className="px-3 py-2 text-[12px] italic text-ink-faint">
            No vendors yet — add them from the Vendors workspace.
          </li>
        )}
        {results.map((v) => (
          <li key={v.id}>
            <button
              type="button"
              onClick={() => {
                onAssign(v.id);
                setOpen(false);
                setQuery("");
              }}
              className={cn(
                "flex w-full items-start gap-2 px-3 py-1.5 text-left",
                "hover:bg-ivory-warm",
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-medium text-ink">
                  {v.name}
                </p>
                <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-muted">
                  {v.category.replace(/_/g, " ")}
                </p>
              </div>
            </button>
          </li>
        ))}
        {query.trim().length > 0 && (
          <li className="border-t border-border">
            <button
              type="button"
              onClick={() => {
                onAddCustom(query.trim());
                setOpen(false);
                setQuery("");
              }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] text-ink-muted hover:bg-ivory-warm hover:text-ink"
            >
              <Plus size={11} strokeWidth={1.7} />
              Add "{query.trim()}" as free-text vendor
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}
