"use client";

// ── Vendor tag typeahead ────────────────────────────────────────────────────
// Search the unified vendor catalog by name and pick one to tag a thread
// with. Tagging stores both the id (for alert lookups) and the name (so a
// later vendor delete doesn't orphan the tag). The component never links
// to vendor profiles — vendors must not be able to monitor the feed.

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVendorsStore } from "@/stores/vendors-store";

export function GrapevineVendorTag({
  selectedId,
  selectedName,
  onSelect,
  onClear,
}: {
  selectedId?: string;
  selectedName?: string;
  onSelect: (id: string, name: string) => void;
  onClear: () => void;
}) {
  const vendors = useVendorsStore((s) => s.vendors);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return vendors
      .filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          (v.location ?? "").toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [vendors, query]);

  if (selectedId && selectedName) {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-ivory-warm/60 px-3 py-1.5 text-[12.5px] font-medium text-ink">
          <span className="font-serif italic">tagged:</span>
          <span>{selectedName}</span>
          <button
            type="button"
            onClick={onClear}
            className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-ink/10 text-ink-muted hover:bg-ink/20 hover:text-ink"
            aria-label="remove vendor tag"
          >
            <X size={10} strokeWidth={2} />
          </button>
        </span>
        <span className="text-[11.5px] italic text-ink-faint">
          the vendor will not be notified and cannot see who posted this.
        </span>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2 focus-within:border-saffron/60 focus-within:ring-2 focus-within:ring-saffron/15">
        <Search size={14} strokeWidth={1.8} className="text-ink-faint" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="search a vendor by name (optional)"
          className="flex-1 border-0 bg-transparent text-[13.5px] text-ink placeholder:text-ink-faint focus:outline-none"
        />
      </div>
      {open && matches.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border border-border bg-white shadow-lg">
          {matches.map((v) => (
            <li key={v.id}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(v.id, v.name);
                  setQuery("");
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-[13px] hover:bg-ivory-warm/50",
                )}
              >
                <span className="font-medium text-ink">{v.name}</span>
                {v.location && (
                  <span className="text-[11px] text-ink-faint">
                    {v.location} · {v.category}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-[11.5px] italic text-ink-faint">
        the vendor will not be notified and cannot see who posted this.
      </p>
    </div>
  );
}
