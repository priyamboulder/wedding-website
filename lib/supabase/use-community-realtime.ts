// lib/supabase/use-community-realtime.ts
// Convenience hook that subscribes to all community tables at once.
// Drop this into the community layout to get live updates everywhere.

"use client";

import { useEffect } from "react";
import { subscribeToTables } from "./realtime";
import { useConfessionalStore } from "@/stores/confessional-store";
import { useGrapevineStore } from "@/stores/grapevine-store";
import type { ConfessionalPost } from "@/types/confessional";

interface UseCommunityRealtimeOptions {
  coupleId?: string;
  enabled?: boolean;
}

export function useCommunityRealtime({
  coupleId,
  enabled = true,
}: UseCommunityRealtimeOptions) {
  useEffect(() => {
    if (!enabled || !coupleId) return;

    const unsub = subscribeToTables([
      // ── Confessional posts ─────────────────────────────────────────────────
      // The confessional store has no addPost() helper — its submitPost()
      // generates a new id and resets counters, which is wrong for a row
      // already persisted by another device. We splice the full DB row
      // directly into the posts array instead.
      {
        table: "confessional_posts",
        coupleId,
        onChange: (event, row) => {
          if (!row.id) {
            // Row is incomplete — can't merge safely.
            // TODO: trigger a full refetch from Supabase when this happens.
            console.warn("[community-realtime] confessional_posts row missing id", row);
            return;
          }

          if (event === "INSERT") {
            useConfessionalStore.setState((state) => {
              // Deduplicate: skip if the post was already written by this tab.
              const exists = state.posts.some((p) => p.id === row.id);
              if (exists) return state;
              // Cast the DB row to ConfessionalPost. Fields that may be absent
              // in the payload get safe defaults so the UI never breaks.
              const incoming: ConfessionalPost = {
                id: row.id as string,
                created_at: (row.created_at as string) ?? new Date().toISOString(),
                updated_at: (row.updated_at as string) ?? new Date().toISOString(),
                author_id: (row.author_id as string) ?? "",
                display_name: (row.display_name as string) ?? "Anonymous",
                title: (row.title as string) ?? "",
                body: (row.body as string) ?? "",
                category: (row.category as ConfessionalPost["category"]) ?? "general",
                tags: (row.tags as string[]) ?? [],
                status: (row.status as ConfessionalPost["status"]) ?? "pending",
                is_featured: (row.is_featured as boolean) ?? false,
                featured_month: (row.featured_month as string) ?? undefined,
                save_count: (row.save_count as number) ?? 0,
                vote_up_count: (row.vote_up_count as number) ?? 0,
                vote_down_count: (row.vote_down_count as number) ?? 0,
                view_count: (row.view_count as number) ?? 0,
                report_count: (row.report_count as number) ?? 0,
              };
              return { posts: [incoming, ...state.posts] };
            });
          }

          if (event === "UPDATE") {
            useConfessionalStore.setState((state) => ({
              posts: state.posts.map((p) =>
                p.id === row.id
                  ? {
                      ...p,
                      status: (row.status as ConfessionalPost["status"]) ?? p.status,
                      is_featured: (row.is_featured as boolean) ?? p.is_featured,
                      featured_month: (row.featured_month as string) ?? p.featured_month,
                      save_count: (row.save_count as number) ?? p.save_count,
                      vote_up_count: (row.vote_up_count as number) ?? p.vote_up_count,
                      vote_down_count: (row.vote_down_count as number) ?? p.vote_down_count,
                      view_count: (row.view_count as number) ?? p.view_count,
                      report_count: (row.report_count as number) ?? p.report_count,
                      updated_at: (row.updated_at as string) ?? p.updated_at,
                    }
                  : p,
              ),
            }));
          }

          if (event === "DELETE") {
            useConfessionalStore.setState((state) => ({
              posts: state.posts.filter((p) => p.id !== row.id),
            }));
          }
        },
      },

      // ── Grapevine state ────────────────────────────────────────────────────
      // Grapevine is a single-row JSONB store — any change on another device
      // means our local snapshot is stale. We log it here; a full reload
      // strategy (e.g. calling a dedicated fetch action on the store) can be
      // wired in once the store exposes a hydrate() method.
      //
      // TODO: add a hydrate() / reload() action to useGrapevineStore and call
      //   it here instead of the console.info below.
      {
        table: "grapevine_state",
        coupleId,
        onChange: (_event, _row) => {
          // Access store state without subscribing — just to signal awareness.
          void useGrapevineStore.getState();
          console.info(
            "[community-realtime] grapevine_state changed on another device — " +
              "TODO: call useGrapevineStore hydrate() when available.",
          );
        },
      },
    ]);

    return unsub;
  }, [coupleId, enabled]);
}
