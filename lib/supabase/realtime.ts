// lib/supabase/realtime.ts
// Supabase Realtime subscription manager.
// Call subscribeToTable() to get live updates pushed into a Zustand store setter.

import { supabaseBrowser } from "./browser-client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type ChangeHandler<T> = (
  event: "INSERT" | "UPDATE" | "DELETE",
  row: T,
  oldRow?: Partial<T>,
) => void;

export interface SubscriptionOptions {
  /** Supabase table name */
  table: string;
  /** Filter rows by couple_id (most tables are couple-scoped) */
  coupleId?: string;
  /** Called when a row changes */
  onChange: ChangeHandler<Record<string, unknown>>;
}

/**
 * Subscribe to real-time changes on a Supabase table.
 * Returns an unsubscribe function — call it on component unmount.
 *
 * Usage:
 *   const unsub = subscribeToTable({
 *     table: "confessional_posts",
 *     coupleId: "...",
 *     onChange: (event, row) => { ... update Zustand store ... }
 *   });
 *   return () => unsub();
 */
export function subscribeToTable(opts: SubscriptionOptions): () => void {
  const channelName = opts.coupleId
    ? `${opts.table}:${opts.coupleId}`
    : `${opts.table}:public`;

  const filter = opts.coupleId
    ? `couple_id=eq.${opts.coupleId}`
    : undefined;

  const existing = supabaseBrowser.getChannels().find(
    (c) => c.topic === `realtime:${channelName}`,
  );
  if (existing) supabaseBrowser.removeChannel(existing);

  const channel = supabaseBrowser
    .channel(channelName)
    .on(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      "postgres_changes" as any,
      {
        event: "*",
        schema: "public",
        table: opts.table,
        ...(filter ? { filter } : {}),
      },
      (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
        const event = payload.eventType as "INSERT" | "UPDATE" | "DELETE";
        const row = (payload.new ?? {}) as Record<string, unknown>;
        const oldRow = (payload.old ?? {}) as Partial<Record<string, unknown>>;
        opts.onChange(event, row, oldRow);
      },
    )
    .subscribe();

  return () => {
    supabaseBrowser.removeChannel(channel);
  };
}

/**
 * Subscribe to multiple tables at once.
 * Returns a single unsubscribe function that cleans up all subscriptions.
 */
export function subscribeToTables(
  subscriptions: SubscriptionOptions[],
): () => void {
  const unsubs = subscriptions.map(subscribeToTable);
  return () => unsubs.forEach((fn) => fn());
}
