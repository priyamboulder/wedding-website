"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  GeneratedPost,
  GeneratedReel,
  PostStats,
  ReelTemplate,
  SocialContentItem,
  VendorSocialProfile,
} from "./types";
import * as data from "./data";

type SocialDataContextType = {
  // State
  profile: VendorSocialProfile | null;
  contentItems: SocialContentItem[];
  generatedPosts: GeneratedPost[];
  reelTemplates: ReelTemplate[];
  generatedReels: GeneratedReel[];
  postStats: PostStats;
  isLoaded: boolean;

  // Mutations
  saveProfile: (profile: Partial<VendorSocialProfile>) => Promise<void>;
  createContentItem: (
    item: Omit<SocialContentItem, "id" | "vendor_id" | "created_at" | "updated_at">,
  ) => Promise<SocialContentItem>;
  updateContentItem: (
    id: string,
    updates: Partial<SocialContentItem>,
  ) => Promise<void>;
  deleteContentItem: (id: string) => Promise<void>;
  createGeneratedPosts: (
    posts: Omit<GeneratedPost, "id" | "vendor_id" | "created_at" | "updated_at">[],
  ) => Promise<GeneratedPost[]>;
  updateGeneratedPost: (
    id: string,
    updates: Partial<GeneratedPost>,
  ) => Promise<void>;
  deleteGeneratedPost: (id: string) => Promise<void>;
  deleteGeneratedPosts: (ids: string[]) => Promise<void>;
  createGeneratedReel: (
    reel: Omit<GeneratedReel, "id" | "vendor_id" | "created_at" | "updated_at">,
  ) => Promise<GeneratedReel>;
  updateGeneratedReel: (
    id: string,
    updates: Partial<GeneratedReel>,
  ) => Promise<void>;
  deleteGeneratedReel: (id: string) => Promise<void>;
  refreshAll: () => Promise<void>;
};

const EMPTY_STATS: PostStats = {
  total: 0,
  drafts: 0,
  approved: 0,
  scheduled: 0,
  published: 0,
};

const SocialDataContext = createContext<SocialDataContextType | null>(null);

export function SocialDataProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<VendorSocialProfile | null>(null);
  const [contentItems, setContentItems] = useState<SocialContentItem[]>([]);
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [reelTemplates, setReelTemplates] = useState<ReelTemplate[]>([]);
  const [generatedReels, setGeneratedReels] = useState<GeneratedReel[]>([]);
  const [postStats, setPostStats] = useState<PostStats>(EMPTY_STATS);
  const [isLoaded, setIsLoaded] = useState(false);

  const refreshAll = useCallback(async () => {
    const [
      nextProfile,
      nextItems,
      nextPosts,
      nextTemplates,
      nextReels,
      nextStats,
    ] = await Promise.all([
      data.getSocialProfile(),
      data.getContentItems(),
      data.getGeneratedPosts(),
      data.getReelTemplates(),
      data.getGeneratedReels(),
      data.getPostStats(),
    ]);
    setProfile(nextProfile);
    setContentItems(nextItems);
    setGeneratedPosts(nextPosts);
    setReelTemplates(nextTemplates);
    setGeneratedReels(nextReels);
    setPostStats(nextStats);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await data.seedReelTemplatesIfNeeded();
      if (cancelled) return;
      await refreshAll();
      if (cancelled) return;
      setIsLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshAll]);

  const refreshProfile = useCallback(async () => {
    setProfile(await data.getSocialProfile());
  }, []);

  const refreshContentItems = useCallback(async () => {
    setContentItems(await data.getContentItems());
  }, []);

  const refreshPosts = useCallback(async () => {
    const [posts, stats] = await Promise.all([
      data.getGeneratedPosts(),
      data.getPostStats(),
    ]);
    setGeneratedPosts(posts);
    setPostStats(stats);
  }, []);

  const refreshReels = useCallback(async () => {
    setGeneratedReels(await data.getGeneratedReels());
  }, []);

  const saveProfile = useCallback<SocialDataContextType["saveProfile"]>(
    async (partial) => {
      await data.saveSocialProfile(partial);
      await refreshProfile();
    },
    [refreshProfile],
  );

  const createContentItem = useCallback<
    SocialDataContextType["createContentItem"]
  >(
    async (item) => {
      const created = await data.createContentItem(item);
      await refreshContentItems();
      return created;
    },
    [refreshContentItems],
  );

  const updateContentItem = useCallback<
    SocialDataContextType["updateContentItem"]
  >(
    async (id, updates) => {
      await data.updateContentItem(id, updates);
      await refreshContentItems();
    },
    [refreshContentItems],
  );

  const deleteContentItem = useCallback<
    SocialDataContextType["deleteContentItem"]
  >(
    async (id) => {
      await data.deleteContentItem(id);
      // Cascade in the data layer also removed posts — refresh both.
      await Promise.all([refreshContentItems(), refreshPosts()]);
    },
    [refreshContentItems, refreshPosts],
  );

  const createGeneratedPosts = useCallback<
    SocialDataContextType["createGeneratedPosts"]
  >(
    async (posts) => {
      const created = await data.createGeneratedPosts(posts);
      await refreshPosts();
      return created;
    },
    [refreshPosts],
  );

  const updateGeneratedPost = useCallback<
    SocialDataContextType["updateGeneratedPost"]
  >(
    async (id, updates) => {
      await data.updateGeneratedPost(id, updates);
      await refreshPosts();
    },
    [refreshPosts],
  );

  const deleteGeneratedPost = useCallback<
    SocialDataContextType["deleteGeneratedPost"]
  >(
    async (id) => {
      await data.deleteGeneratedPost(id);
      await refreshPosts();
    },
    [refreshPosts],
  );

  const deleteGeneratedPosts = useCallback<
    SocialDataContextType["deleteGeneratedPosts"]
  >(
    async (ids) => {
      await data.deleteGeneratedPosts(ids);
      await refreshPosts();
    },
    [refreshPosts],
  );

  const createGeneratedReel = useCallback<
    SocialDataContextType["createGeneratedReel"]
  >(
    async (reel) => {
      const created = await data.createGeneratedReel(reel);
      await refreshReels();
      return created;
    },
    [refreshReels],
  );

  const updateGeneratedReel = useCallback<
    SocialDataContextType["updateGeneratedReel"]
  >(
    async (id, updates) => {
      await data.updateGeneratedReel(id, updates);
      await refreshReels();
    },
    [refreshReels],
  );

  const deleteGeneratedReel = useCallback<
    SocialDataContextType["deleteGeneratedReel"]
  >(
    async (id) => {
      await data.deleteGeneratedReel(id);
      await refreshReels();
    },
    [refreshReels],
  );

  const value = useMemo<SocialDataContextType>(
    () => ({
      profile,
      contentItems,
      generatedPosts,
      reelTemplates,
      generatedReels,
      postStats,
      isLoaded,
      saveProfile,
      createContentItem,
      updateContentItem,
      deleteContentItem,
      createGeneratedPosts,
      updateGeneratedPost,
      deleteGeneratedPost,
      deleteGeneratedPosts,
      createGeneratedReel,
      updateGeneratedReel,
      deleteGeneratedReel,
      refreshAll,
    }),
    [
      profile,
      contentItems,
      generatedPosts,
      reelTemplates,
      generatedReels,
      postStats,
      isLoaded,
      saveProfile,
      createContentItem,
      updateContentItem,
      deleteContentItem,
      createGeneratedPosts,
      updateGeneratedPost,
      deleteGeneratedPost,
      deleteGeneratedPosts,
      createGeneratedReel,
      updateGeneratedReel,
      deleteGeneratedReel,
      refreshAll,
    ],
  );

  return (
    <SocialDataContext.Provider value={value}>
      {children}
    </SocialDataContext.Provider>
  );
}

export function useSocialData(): SocialDataContextType {
  const ctx = useContext(SocialDataContext);
  if (!ctx) {
    throw new Error("useSocialData must be used within a SocialDataProvider");
  }
  return ctx;
}
