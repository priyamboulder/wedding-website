import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import type { Comment, CommentEntityType } from "@/types/popout-infrastructure";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";

interface CommentsState {
  comments: Comment[];

  getComments: (
    entityType: CommentEntityType,
    entityId: string,
  ) => Comment[];
  getTopLevel: (
    entityType: CommentEntityType,
    entityId: string,
  ) => Comment[];
  getReplies: (parentId: string) => Comment[];
  addComment: (
    draft: Pick<Comment, "entity_type" | "entity_id" | "parent_id" | "author" | "body" | "mentions" | "attachment">,
  ) => Comment;
  updateComment: (id: string, body: string) => void;
  deleteComment: (id: string) => void;
}

export const useCommentsStore = create<CommentsState>()(
  persist(
    (set, get) => ({
      comments: [],

      getComments: (entityType, entityId) =>
        get().comments.filter(
          (c) => c.entity_type === entityType && c.entity_id === entityId,
        ),

      getTopLevel: (entityType, entityId) =>
        get()
          .comments.filter(
            (c) =>
              c.entity_type === entityType &&
              c.entity_id === entityId &&
              c.parent_id === null,
          )
          .sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime(),
          ),

      getReplies: (parentId) =>
        get()
          .comments.filter((c) => c.parent_id === parentId)
          .sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime(),
          ),

      addComment: (draft) => {
        const now = new Date().toISOString();
        const comment: Comment = {
          ...draft,
          id: uuid(),
          created_at: now,
          updated_at: now,
        };
        set((state) => ({ comments: [...state.comments, comment] }));
        return comment;
      },

      updateComment: (id, body) =>
        set((state) => ({
          comments: state.comments.map((c) =>
            c.id === id
              ? { ...c, body, updated_at: new Date().toISOString() }
              : c,
          ),
        })),

      deleteComment: (id) =>
        set((state) => ({
          comments: state.comments.filter(
            (c) => c.id !== id && c.parent_id !== id,
          ),
        })),
    }),
    {
      name: "ananya-comments",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
      version: 1,
    },
  ),
);

let _commentsSyncTimer: ReturnType<typeof setTimeout> | null = null;
useCommentsStore.subscribe((state) => {
  if (_commentsSyncTimer) clearTimeout(_commentsSyncTimer);
  _commentsSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("comments_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});
