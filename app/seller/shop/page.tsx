"use client";

import { useState } from "react";
import ProductEditor from "@/components/seller/ProductEditor";
import { SectionHeading } from "@/components/seller/ui";
import { PRODUCTS } from "@/lib/seller/products-seed";
import type { Product } from "@/lib/seller/products-seed";

export default function SellerShopPage() {
  const [products] = useState<Product[]>(PRODUCTS);
  const [editing, setEditing] = useState<Product | null>(null);
  const [mode, setMode] = useState<"new" | "edit">("new");

  if (editing) {
    return (
      <div className="pb-16">
        <div className="border-b px-8 py-4 flex items-center gap-3" style={{ borderColor: "rgba(44,44,44,0.08)" }}>
          <button
            onClick={() => setEditing(null)}
            className="text-[13px] text-stone-500 hover:text-[#2C2C2C] transition"
          >
            ← Back to products
          </button>
        </div>
        <div className="px-8 py-6">
          <ProductEditor mode={mode} initial={editing} />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <div className="border-b px-8 py-6 flex items-end justify-between" style={{ borderColor: "rgba(44,44,44,0.08)" }}>
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.26em] text-stone-500">
            Shop
          </p>
          <h1
            className="mt-1 text-[28px] leading-tight text-[#2C2C2C]"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
          >
            Your products
          </h1>
          <p className="mt-1 text-[13px] text-stone-500">
            {products.length} product{products.length !== 1 ? "s" : ""} in your shop.
          </p>
        </div>
        <button
          onClick={() => { setMode("new"); setEditing({} as Product); }}
          className="rounded-lg bg-[#2C2C2C] px-4 py-2 text-[13px] text-white hover:bg-[#1a1a1a] transition"
        >
          + Add product
        </button>
      </div>

      <div className="px-8 py-8">
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "rgba(44,44,44,0.08)" }}>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b text-left font-mono text-[10.5px] uppercase tracking-[0.2em] text-stone-500" style={{ borderColor: "rgba(44,44,44,0.06)" }}>
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-[#FAF8F5]" style={{ borderColor: "rgba(44,44,44,0.04)" }}>
                  <td className="px-5 py-3">
                    <p className="font-medium text-[#2C2C2C]">{p.title}</p>
                  </td>
                  <td className="px-4 py-3 text-stone-600">{p.category}</td>
                  <td className="px-4 py-3 font-mono text-[#2C2C2C]">
                    {typeof p.price === "number" ? `$${p.price.toFixed(2)}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-stone-600">{p.stockQuantity ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                      p.status === "active" || p.status === "low-stock" ? "bg-emerald-50 text-emerald-700" :
                      p.status === "draft" ? "bg-stone-100 text-stone-600" :
                      "bg-amber-50 text-amber-700"
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => { setMode("edit"); setEditing(p); }}
                      className="text-[12px] text-[#9E8245] hover:underline"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
