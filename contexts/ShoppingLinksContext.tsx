"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  ShoppingLink,
  LinkMetadata,
  StoreVariantSelection,
} from "@/lib/link-preview/types";
import { normalizeUrl, getDomain, getFaviconUrl } from "@/lib/link-preview/normalize";
import {
  getStoreProduct,
  getStoreVendor,
  leadTimeWithVariant,
  priceWithVariant,
  stockWithVariant,
} from "@/lib/store-seed";

interface FetchResult {
  ok: boolean;
  data?: LinkMetadata;
  error?: string;
}

interface AddStandaloneOptions {
  module?: string | null;
  taskId?: string | null;
  note?: string;
  quantity?: number;
}

interface AddStoreItemOptions {
  productId: string;
  variantId: string | null;
  quantity?: number;
  module?: string | null;
  taskId?: string | null;
  note?: string;
}

interface ShoppingLinksContextValue {
  getLinksForTask: (taskId: string) => ShoppingLink[];
  addLink: (args: {
    taskId: string;
    module: string;
    url: string;
  }) => Promise<string>;
  addStandaloneLink: (
    url: string,
    options?: AddStandaloneOptions,
  ) => Promise<string>;
  addStoreItem: (options: AddStoreItemOptions) => string;
  updateVariant: (linkId: string, variantId: string | null) => void;
  assignToTask: (
    linkId: string,
    taskId: string | null,
    module: string | null,
  ) => void;
  detachLinksFromTask: (taskId: string) => void;
  getUnassignedLinks: () => ShoppingLink[];
  updateLink: (id: string, patch: Partial<ShoppingLink>) => void;
  deleteLink: (id: string) => void;
  reorderLinks: (taskId: string, orderedIds: string[]) => void;
  refetchLink: (id: string) => Promise<void>;
  getAllLinks: () => ShoppingLink[];
  pendingIds: Set<string>;
  // Cart (native-only checkout queue)
  cartIds: Set<string>;
  toggleCart: (id: string) => void;
  addToCart: (ids: string[]) => void;
  clearCart: () => void;
  checkoutCart: (ids: string[]) => void;
}

const ShoppingLinksContext = createContext<ShoppingLinksContextValue | null>(null);

const STORAGE_PREFIX = "ananya:shopping-links:";
const CART_STORAGE_PREFIX = "ananya:shopping-cart:";

function storageKey(weddingId: string) {
  return `${STORAGE_PREFIX}${weddingId}`;
}

function cartStorageKey(weddingId: string) {
  return `${CART_STORAGE_PREFIX}${weddingId}`;
}

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `sl-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function hydrateLink(raw: ShoppingLink): ShoppingLink {
  // Backfill fields added by later prompts so legacy localStorage records
  // still shape-match the current ShoppingLink type.
  const withDetach = {
    ...raw,
    taskId: raw.taskId ?? null,
    module: raw.module ?? null,
    detachedTaskId:
      (raw as ShoppingLink & { detachedTaskId?: string | null })
        .detachedTaskId ?? null,
  };
  return {
    ...withDetach,
    sourceType: withDetach.sourceType ?? "external",
    productId: withDetach.productId ?? null,
    vendorId: withDetach.vendorId ?? null,
    vendorName: withDetach.vendorName ?? null,
    variant: withDetach.variant ?? null,
    stockStatus: withDetach.stockStatus ?? null,
    leadTimeDays: withDetach.leadTimeDays ?? null,
    orderId: withDetach.orderId ?? null,
    orderedAt: withDetach.orderedAt ?? null,
    trackingNumber: withDetach.trackingNumber ?? null,
    etaDate: withDetach.etaDate ?? null,
  };
}

async function fetchPreview(url: string): Promise<FetchResult> {
  try {
    const res = await fetch("/api/link-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { ok: false, error: body?.error ?? `HTTP ${res.status}` };
    }
    const data = (await res.json()) as LinkMetadata;
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "network error",
    };
  }
}

export function ShoppingLinksProvider({
  weddingId = "default",
  children,
}: {
  weddingId?: string;
  children: ReactNode;
}) {
  const [links, setLinks] = useState<ShoppingLink[]>([]);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [cartIds, setCartIds] = useState<Set<string>>(new Set());
  const hydrated = useRef(false);
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(weddingId));
      if (raw) {
        const parsed = JSON.parse(raw) as ShoppingLink[];
        if (Array.isArray(parsed)) setLinks(parsed.map(hydrateLink));
      }
    } catch {
      // ignore corrupt storage
    }
    hydrated.current = true;
  }, [weddingId]);

  useEffect(() => {
    if (!hydrated.current) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      try {
        localStorage.setItem(storageKey(weddingId), JSON.stringify(links));
      } catch {
        // ignore quota issues
      }
    }, 300);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [links, weddingId]);

  // Cart hydration + persistence
  useEffect(() => {
    try {
      const raw = localStorage.getItem(cartStorageKey(weddingId));
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        if (Array.isArray(parsed)) setCartIds(new Set(parsed));
      }
    } catch {
      // ignore
    }
  }, [weddingId]);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(
        cartStorageKey(weddingId),
        JSON.stringify(Array.from(cartIds)),
      );
    } catch {
      // ignore
    }
  }, [cartIds, weddingId]);

  const setPending = useCallback((id: string, on: boolean) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const getLinksForTask = useCallback(
    (taskId: string) =>
      links
        .filter((l) => l.taskId === taskId)
        .sort((a, b) => a.position - b.position),
    [links],
  );

  const getAllLinks = useCallback(() => links, [links]);

  const getUnassignedLinks = useCallback(
    () => links.filter((l) => l.taskId == null),
    [links],
  );

  // ── Shared insert primitive ──────────────────────────────────────────────
  const insertLink = useCallback(
    async (
      url: string,
      init: {
        taskId: string | null;
        module: string | null;
        note?: string;
        quantity?: number;
      },
    ): Promise<string> => {
      const trimmed = url.trim();
      if (!trimmed) throw new Error("Empty URL");

      let valid: URL;
      try {
        valid = new URL(
          /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`,
        );
      } catch {
        throw new Error("Invalid URL");
      }

      const absoluteUrl = valid.toString();
      const normalized = normalizeUrl(absoluteUrl);

      // Dedupe only within the same task scope; standalone ↔ linked with same
      // URL are allowed (see spec — user may save as wishlist + task item).
      const existing = links.find(
        (l) => l.taskId === init.taskId && l.normalizedUrl === normalized,
      );
      if (existing) {
        const looksEmpty =
          !existing.imageUrl &&
          (!existing.title || existing.title === existing.domain);
        if (looksEmpty) {
          setPending(existing.id, true);
          const retry = await fetchPreview(absoluteUrl);
          const ts = new Date().toISOString();
          setLinks((prev) =>
            prev.map((l) => {
              if (l.id !== existing.id) return l;
              if (retry.ok && retry.data) {
                const d = retry.data;
                return {
                  ...l,
                  url: d.url || l.url,
                  imageUrl: d.image ?? null,
                  title: d.title || l.title,
                  description: d.description ?? null,
                  price: d.price ?? null,
                  currency: d.currency || l.currency,
                  siteName: d.siteName ?? null,
                  domain: d.domain || l.domain,
                  faviconUrl: d.favicon ?? l.faviconUrl,
                  adapterUsed: d.adapter_used ?? null,
                  updatedAt: ts,
                };
              }
              return { ...l, updatedAt: ts };
            }),
          );
          setPending(existing.id, false);
        }
        return existing.id;
      }

      const id = uid();
      const now = new Date().toISOString();
      const domain = getDomain(absoluteUrl);
      const favicon = getFaviconUrl(absoluteUrl);

      const siblingLinks = links.filter((l) => l.taskId === init.taskId);
      const position = siblingLinks.length;

      const skeleton: ShoppingLink = {
        id,
        taskId: init.taskId,
        module: init.module,
        detachedTaskId: null,
        url: absoluteUrl,
        normalizedUrl: normalized,
        imageUrl: null,
        title: domain || absoluteUrl,
        description: null,
        price: null,
        currency: "USD",
        quantity: init.quantity ?? 1,
        siteName: null,
        domain,
        faviconUrl: favicon,
        userNote: init.note ?? "",
        status: "considering",
        adapterUsed: null,
        position,
        createdAt: now,
        updatedAt: now,
        sourceType: "external",
        productId: null,
        vendorId: null,
        vendorName: null,
        variant: null,
        stockStatus: null,
        leadTimeDays: null,
        orderId: null,
        orderedAt: null,
        trackingNumber: null,
        etaDate: null,
      };

      setLinks((prev) => [...prev, skeleton]);
      setPending(id, true);

      const result = await fetchPreview(absoluteUrl);
      const finishedAt = new Date().toISOString();

      setLinks((prev) =>
        prev.map((l) => {
          if (l.id !== id) return l;
          if (result.ok && result.data) {
            const d = result.data;
            return {
              ...l,
              url: d.url || l.url,
              imageUrl: d.image ?? null,
              title: d.title || l.title,
              description: d.description ?? null,
              price: d.price ?? null,
              currency: d.currency || "USD",
              siteName: d.siteName ?? null,
              domain: d.domain || l.domain,
              faviconUrl: d.favicon ?? l.faviconUrl,
              adapterUsed: d.adapter_used ?? null,
              updatedAt: finishedAt,
            };
          }
          return { ...l, updatedAt: finishedAt };
        }),
      );
      setPending(id, false);
      return id;
    },
    [links, setPending],
  );

  const addLink: ShoppingLinksContextValue["addLink"] = useCallback(
    ({ taskId, module, url }) =>
      insertLink(url, { taskId, module }),
    [insertLink],
  );

  const addStandaloneLink: ShoppingLinksContextValue["addStandaloneLink"] =
    useCallback(
      (url, options) =>
        insertLink(url, {
          taskId: options?.taskId ?? null,
          module: options?.module ?? null,
          note: options?.note,
          quantity: options?.quantity,
        }),
      [insertLink],
    );

  // ── Store items ─────────────────────────────────────────────────────────
  const addStoreItem: ShoppingLinksContextValue["addStoreItem"] = useCallback(
    ({ productId, variantId, quantity = 1, module = null, taskId = null, note }) => {
      const product = getStoreProduct(productId);
      if (!product) throw new Error(`Unknown product: ${productId}`);
      const vendor = getStoreVendor(product.vendorId);
      const variantDef = variantId
        ? product.variants.find((v) => v.id === variantId) ?? null
        : null;
      const price = priceWithVariant(product, variantId);
      const stock = stockWithVariant(product, variantId);
      const leadTime = leadTimeWithVariant(product, variantId);

      const id = uid();
      const now = new Date().toISOString();
      const variantSel: StoreVariantSelection | null = variantDef
        ? {
            variantId: variantDef.id,
            label: variantDef.label,
            priceDelta: variantDef.priceDelta,
            leadTimeDeltaDays: variantDef.leadTimeDeltaDays,
          }
        : null;

      const item: ShoppingLink = {
        id,
        taskId,
        module,
        detachedTaskId: null,
        // Synthetic deep-link so "Open link" in the drawer routes back into
        // the catalog modal via ?catalog=1&product=<id>.
        url: `/shopping?catalog=1&product=${encodeURIComponent(product.id)}`,
        normalizedUrl: `ananya:product:${product.id}:${variantId ?? ""}`,
        imageUrl: product.heroImage,
        title: product.title,
        description: product.description,
        price,
        currency: product.currency,
        quantity,
        siteName: "Ananya Store",
        domain: "ananya.store",
        faviconUrl: null,
        userNote: note ?? "",
        status: "considering",
        adapterUsed: null,
        position: 0,
        createdAt: now,
        updatedAt: now,
        sourceType: "ananya_store",
        productId: product.id,
        vendorId: product.vendorId,
        vendorName: vendor?.name ?? null,
        variant: variantSel,
        stockStatus: stock,
        leadTimeDays: leadTime,
        orderId: null,
        orderedAt: null,
        trackingNumber: null,
        etaDate: null,
      };
      setLinks((prev) => [...prev, item]);
      return id;
    },
    [],
  );

  const updateVariant = useCallback(
    (linkId: string, variantId: string | null) => {
      setLinks((prev) =>
        prev.map((l) => {
          if (l.id !== linkId) return l;
          if (l.sourceType !== "ananya_store" || !l.productId) return l;
          const product = getStoreProduct(l.productId);
          if (!product) return l;
          const variantDef = variantId
            ? product.variants.find((v) => v.id === variantId) ?? null
            : null;
          return {
            ...l,
            variant: variantDef
              ? {
                  variantId: variantDef.id,
                  label: variantDef.label,
                  priceDelta: variantDef.priceDelta,
                  leadTimeDeltaDays: variantDef.leadTimeDeltaDays,
                }
              : null,
            price: priceWithVariant(product, variantId),
            stockStatus: stockWithVariant(product, variantId),
            leadTimeDays: leadTimeWithVariant(product, variantId),
            updatedAt: new Date().toISOString(),
          };
        }),
      );
    },
    [],
  );

  const assignToTask = useCallback(
    (linkId: string, taskId: string | null, module: string | null) => {
      setLinks((prev) =>
        prev.map((l) =>
          l.id === linkId
            ? {
                ...l,
                taskId,
                module,
                // Clear detached flag once the user reassigns
                detachedTaskId: taskId ? null : l.detachedTaskId,
                updatedAt: new Date().toISOString(),
              }
            : l,
        ),
      );
    },
    [],
  );

  const detachLinksFromTask = useCallback((taskId: string) => {
    const ts = new Date().toISOString();
    setLinks((prev) =>
      prev.map((l) =>
        l.taskId === taskId
          ? {
              ...l,
              taskId: null,
              // module preserved as a hint
              detachedTaskId: taskId,
              updatedAt: ts,
            }
          : l,
      ),
    );
  }, []);

  const updateLink = useCallback((id: string, patch: Partial<ShoppingLink>) => {
    setLinks((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, ...patch, updatedAt: new Date().toISOString() }
          : l,
      ),
    );
  }, []);

  const deleteLink = useCallback((id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const refetchLink = useCallback(
    async (id: string) => {
      const target = links.find((l) => l.id === id);
      if (!target) return;
      setPending(id, true);
      const result = await fetchPreview(target.url);
      const ts = new Date().toISOString();
      setLinks((prev) =>
        prev.map((l) => {
          if (l.id !== id) return l;
          if (result.ok && result.data) {
            const d = result.data;
            return {
              ...l,
              url: d.url || l.url,
              imageUrl: d.image ?? null,
              title: d.title || l.title,
              description: d.description ?? null,
              price: d.price ?? l.price,
              currency: d.currency || l.currency,
              siteName: d.siteName ?? null,
              domain: d.domain || l.domain,
              faviconUrl: d.favicon ?? l.faviconUrl,
              adapterUsed: d.adapter_used ?? null,
              updatedAt: ts,
            };
          }
          return { ...l, updatedAt: ts };
        }),
      );
      setPending(id, false);
    },
    [links, setPending],
  );

  const reorderLinks = useCallback(
    (taskId: string, orderedIds: string[]) => {
      setLinks((prev) => {
        const positionById = new Map<string, number>();
        orderedIds.forEach((id, i) => positionById.set(id, i));
        return prev.map((l) =>
          l.taskId === taskId && positionById.has(l.id)
            ? { ...l, position: positionById.get(l.id) ?? l.position }
            : l,
        );
      });
    },
    [],
  );

  // ── Cart ────────────────────────────────────────────────────────────────
  const toggleCart = useCallback((id: string) => {
    setCartIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const addToCart = useCallback((ids: string[]) => {
    setCartIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) next.add(id);
      return next;
    });
  }, []);

  const clearCart = useCallback(() => setCartIds(new Set()), []);

  const checkoutCart = useCallback((ids: string[]) => {
    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const now = new Date();
    const nowIso = now.toISOString();
    setLinks((prev) =>
      prev.map((l) => {
        if (!ids.includes(l.id)) return l;
        if (l.sourceType !== "ananya_store") return l;
        const lead = l.leadTimeDays ?? 0;
        const eta = new Date(now);
        eta.setDate(eta.getDate() + lead);
        return {
          ...l,
          status: "ordered",
          orderId,
          orderedAt: nowIso,
          trackingNumber: `TRK-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
          etaDate: eta.toISOString(),
          updatedAt: nowIso,
        };
      }),
    );
    setCartIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) next.delete(id);
      return next;
    });
  }, []);

  const value = useMemo<ShoppingLinksContextValue>(
    () => ({
      getLinksForTask,
      addLink,
      addStandaloneLink,
      addStoreItem,
      updateVariant,
      assignToTask,
      detachLinksFromTask,
      getUnassignedLinks,
      updateLink,
      deleteLink,
      reorderLinks,
      refetchLink,
      getAllLinks,
      pendingIds,
      cartIds,
      toggleCart,
      addToCart,
      clearCart,
      checkoutCart,
    }),
    [
      getLinksForTask,
      addLink,
      addStandaloneLink,
      addStoreItem,
      updateVariant,
      assignToTask,
      detachLinksFromTask,
      getUnassignedLinks,
      updateLink,
      deleteLink,
      reorderLinks,
      refetchLink,
      getAllLinks,
      pendingIds,
      cartIds,
      toggleCart,
      addToCart,
      clearCart,
      checkoutCart,
    ],
  );

  return (
    <ShoppingLinksContext.Provider value={value}>
      {children}
    </ShoppingLinksContext.Provider>
  );
}

export function useShoppingLinks(): ShoppingLinksContextValue {
  const ctx = useContext(ShoppingLinksContext);
  if (!ctx) {
    throw new Error("useShoppingLinks must be used within ShoppingLinksProvider");
  }
  return ctx;
}
