// lib/supabase/use-realtime.ts
// React hook that wraps subscribeToTable with automatic cleanup on unmount.

"use client";

import { useEffect, useRef } from "react";
import { subscribeToTable } from "./realtime";
import type { SubscriptionOptions } from "./realtime";

// Re-export so consumers only need one import
export type { SubscriptionOptions };

/**
 * React hook for Supabase Realtime subscriptions.
 * Automatically subscribes on mount and unsubscribes on unmount.
 * Re-subscribes if coupleId or table changes.
 *
 * @example
 * useRealtime({
 *   table: "confessional_posts",
 *   coupleId: user?.id,
 *   onChange: (event, row) => {
 *     if (event === "INSERT") addPost(row as Post);
 *     if (event === "DELETE") removePost(row.id as string);
 *   },
 * });
 */
export function useRealtime(opts: SubscriptionOptions & { enabled?: boolean }) {
  const optsRef = useRef(opts);
  optsRef.current = opts;

  useEffect(() => {
    if (opts.enabled === false) return;
    if (!opts.table) return;

    const unsub = subscribeToTable({
      table: optsRef.current.table,
      coupleId: optsRef.current.coupleId,
      onChange: (event, row, oldRow) =>
        optsRef.current.onChange(event, row, oldRow),
    });

    return unsub;
  }, [opts.table, opts.coupleId, opts.enabled]);
}
