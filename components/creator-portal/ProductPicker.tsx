"use client";

import { useMemo, useState } from "react";
import { Search, X, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { STORE_PRODUCTS } from "@/lib/store-seed";
import { formatUsd } from "@/lib/creators/current-creator";

export interface PickedProduct {
  productId: string;
  creatorNote: string | null;
}

export function ProductPicker({
  picks,
  onChange,
}: {
  picks: PickedProduct[];
  onChange: (next: PickedProduct[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const pickedIds = useMemo(
    () => new Set(picks.map((p) => p.productId)),
    [picks],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = STORE_PRODUCTS.filter((p) => !pickedIds.has(p.id));
    if (!q) return all.slice(0, 12);
    return all
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.tags.join(" ").toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      )
      .slice(0, 20);
  }, [query, pickedIds]);

  const addProduct = (id: string) => {
    onChange([...picks, { productId: id, creatorNote: "" }]);
  };

  const removeProduct = (id: string) => {
    onChange(picks.filter((p) => p.productId !== id));
  };

  const updateNote = (id: string, note: string) => {
    onChange(picks.map((p) => (p.productId === id ? { ...p, creatorNote: note } : p)));
  };

  const move = (id: string, dir: -1 | 1) => {
    const idx = picks.findIndex((p) => p.productId === id);
    if (idx < 0) return;
    const j = idx + dir;
    if (j < 0 || j >= picks.length) return;
    const next = [...picks];
    [next[idx], next[j]] = [next[j], next[idx]];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-gold/10 pb-2">
        <h3 className="font-serif text-[15px] text-ink">
          Items ({picks.length})
        </h3>
        <button
          type="button"
          onClick={() => setShowSearch((v) => !v)}
          className="rounded-md border border-gold/30 bg-white px-3 py-1 text-[11.5px] text-ink hover:bg-gold-pale/30"
        >
          {showSearch ? "Close catalog" : "Add from catalog"}
        </button>
      </div>

      {showSearch && (
        <div className="rounded-lg border border-gold/20 bg-ivory-warm p-3">
          <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products by name, tag, or category…"
              className="w-full rounded-md border border-border bg-white py-2 pl-9 pr-3 text-[13px] focus:border-gold/40 focus:outline-none"
            />
          </div>
          <div className="mt-3 grid max-h-80 grid-cols-2 gap-2 overflow-y-auto md:grid-cols-3">
            {results.map((p) => (
              <button
                type="button"
                key={p.id}
                onClick={() => addProduct(p.id)}
                className="group flex flex-col rounded-md border border-border bg-white p-2 text-left transition-colors hover:border-gold/40"
              >
                <div
                  className="h-20 w-full rounded-sm bg-ivory-warm bg-cover bg-center"
                  style={{ backgroundImage: `url(${p.heroImage})` }}
                />
                <p className="mt-2 line-clamp-2 text-[11.5px] text-ink">
                  {p.title}
                </p>
                <p
                  className="mt-0.5 font-mono text-[10px] text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {formatUsd(p.basePrice / 100)}
                </p>
              </button>
            ))}
            {results.length === 0 && (
              <p className="col-span-full text-center text-[12px] italic text-ink-muted">
                No matches.
              </p>
            )}
          </div>
        </div>
      )}

      {picks.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gold/20 px-4 py-8 text-center text-[12.5px] italic text-ink-muted">
          No items yet. Click "Add from catalog" to pick products.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {picks.map((pick, i) => {
            const product = STORE_PRODUCTS.find((p) => p.id === pick.productId);
            if (!product) return null;
            return (
              <li
                key={pick.productId}
                className="flex gap-3 rounded-lg border border-border bg-white p-3"
              >
                <GripVertical
                  size={14}
                  className="mt-1 shrink-0 cursor-grab text-ink-faint"
                />
                <div
                  className="h-16 w-16 shrink-0 rounded-sm bg-ivory-warm bg-cover bg-center"
                  style={{ backgroundImage: `url(${product.heroImage})` }}
                />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-[13px] text-ink">
                    {product.title}
                  </p>
                  <p
                    className="font-mono text-[10px] text-ink-faint"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {formatUsd(product.basePrice / 100)}
                  </p>
                  <input
                    type="text"
                    value={pick.creatorNote ?? ""}
                    onChange={(e) => updateNote(pick.productId, e.target.value)}
                    placeholder="Why did you pick this?"
                    className="mt-1.5 w-full rounded border border-border bg-ivory-warm px-2 py-1 text-[12px] focus:border-gold/40 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => move(pick.productId, -1)}
                    disabled={i === 0}
                    className="rounded border border-border p-1 text-ink-faint hover:text-ink disabled:opacity-30"
                    aria-label="Move up"
                  >
                    <ArrowUp size={11} />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(pick.productId, 1)}
                    disabled={i === picks.length - 1}
                    className="rounded border border-border p-1 text-ink-faint hover:text-ink disabled:opacity-30"
                    aria-label="Move down"
                  >
                    <ArrowDown size={11} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeProduct(pick.productId)}
                    className="rounded border border-border p-1 text-rose hover:bg-rose/10"
                    aria-label="Remove"
                  >
                    <X size={11} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
