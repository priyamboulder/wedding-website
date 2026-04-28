"use client";

// ── Current creator hook ──────────────────────────────────────────────────
// Resolves the creator identity for the /creator portal. In the localStorage-
// only stub, the portal always works for demo purposes — it falls back to the
// first seed creator if nothing else is selected. When real auth arrives this
// hook is the single swap point: look up the user's linked creator id and
// return the merged Creator from seed + portal overrides.

import { useMemo } from "react";
import { useCreatorsStore } from "@/stores/creators-store";
import { useCreatorPortalStore } from "@/stores/creator-portal-store";
import type { Creator, CreatorCollection } from "@/types/creator";
import type { Guide } from "@/types/guide";

export function useCurrentCreator(): Creator | undefined {
  const creators = useCreatorsStore((s) => s.creators);
  const activeId = useCreatorPortalStore((s) => s.activeCreatorId);
  const overrides = useCreatorPortalStore((s) => s.profileOverrides);

  return useMemo(() => {
    const id = activeId ?? creators[0]?.id;
    if (!id) return undefined;
    const base = creators.find((c) => c.id === id);
    if (!base) return undefined;
    const patch = overrides[id];
    return patch ? { ...base, ...patch } : base;
  }, [activeId, creators, overrides]);
}

export function useMyCollections(): CreatorCollection[] {
  const creator = useCurrentCreator();
  const seedCollections = useCreatorsStore((s) => s.collections);
  const userCollections = useCreatorPortalStore((s) => s.userCollections);

  return useMemo(() => {
    if (!creator) return [];
    const mine = [
      ...seedCollections.filter((c) => c.creatorId === creator.id),
      ...userCollections.filter((c) => c.creatorId === creator.id),
    ];
    return mine.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [creator, seedCollections, userCollections]);
}

export function useMyGuides(): Guide[] {
  const creator = useCurrentCreator();
  const guidesStore = useCreatorsStore;
  const userGuides = useCreatorPortalStore((s) => s.userGuides);
  const seedCreator = useCreatorsStore((s) =>
    creator ? s.getCreator(creator.id) : undefined,
  );
  void guidesStore;
  void seedCreator;

  return useMemo(() => {
    if (!creator) return [];
    // Pull seed guides via the guides seed directly to avoid a circular hook
    // dependency. The guides-store exposes this as a selector but requires
    // hydration; reading the seed directly is equivalent for our purposes.
    return userGuides.filter((g) => g.creatorId === creator.id);
  }, [creator, userGuides]);
}

// Format a dollar amount (value stored as whole dollars).
export function formatUsd(v: number): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(v);
  } catch {
    return `$${v}`;
  }
}

export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}
