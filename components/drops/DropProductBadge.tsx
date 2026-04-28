"use client";

import Link from "next/link";
import { Flame } from "lucide-react";
import { useDropsStore } from "@/stores/drops-store";

// Small badge for product cards that appear in an active drop.
// Use: <DropProductBadge productId="p-..." weddingId={weddingId} />

export function DropProductBadge({
  productId,
  weddingId,
}: {
  productId: string;
  weddingId?: string | null;
}) {
  const drop = useDropsStore((s) => s.getActiveDropForProduct(productId));
  if (!drop) return null;
  const href = weddingId
    ? `/${weddingId}/shopping/drops/${drop.slug}`
    : `/shopping/drops/${drop.slug}`;
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-white"
      style={{ backgroundColor: drop.accentColor }}
    >
      <Flame size={9} strokeWidth={2} />
      Part of {drop.title}
    </Link>
  );
}
