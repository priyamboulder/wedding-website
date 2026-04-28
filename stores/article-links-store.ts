import { create } from "zustand";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";

export interface ArticleLink {
  id: string;
  url: string;
  title: string;
  description: string | null;
  image: string | null;
  domain: string;
  favicon: string | null;
  added_at: string;
}

interface ArticleLinksState {
  linksByEntity: Record<string, ArticleLink[]>;

  getLinks: (entityId: string) => ArticleLink[];
  addLink: (entityId: string, link: ArticleLink) => void;
  removeLink: (entityId: string, linkId: string) => void;
}

export const useArticleLinksStore = create<ArticleLinksState>((set, get) => ({
  linksByEntity: {},

  getLinks: (entityId) => get().linksByEntity[entityId] ?? [],

  addLink: (entityId, link) =>
    set((state) => ({
      linksByEntity: {
        ...state.linksByEntity,
        [entityId]: [...(state.linksByEntity[entityId] ?? []), link],
      },
    })),

  removeLink: (entityId, linkId) =>
    set((state) => ({
      linksByEntity: {
        ...state.linksByEntity,
        [entityId]: (state.linksByEntity[entityId] ?? []).filter(
          (l) => l.id !== linkId,
        ),
      },
    })),
}));

let _articleLinksSyncTimer: ReturnType<typeof setTimeout> | null = null;
useArticleLinksStore.subscribe((state) => {
  if (_articleLinksSyncTimer) clearTimeout(_articleLinksSyncTimer);
  _articleLinksSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("article_links_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});
