"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

async function hydrateAllStores() {
  // Fire-and-forget: load all stores from DB after login.
  try {
    const user = useAuthStore.getState().user;
    const coupleId = user?.id;

    // Core stores with their own loadFromDB methods
    const [
      { useChecklistStore },
      { useFinanceStore },
      { useGuestRosterStore },
      { useJournalEntriesStore },
      { useNotesIdeasStore },
      { useVendorsStore },
      { useInquiryStore },
      { useCateringStore },
    ] = await Promise.all([
      import("@/stores/checklist-store"),
      import("@/stores/finance-store"),
      import("@/stores/guest-roster-store"),
      import("@/stores/journal-entries-store"),
      import("@/stores/notes-ideas-store"),
      import("@/stores/vendors-store"),
      import("@/stores/inquiry-store"),
      import("@/stores/catering-store"),
    ]);

    await Promise.allSettled([
      useChecklistStore.getState().loadFromDB(),
      useFinanceStore.getState().loadFromDB(),
      useGuestRosterStore.getState().loadFromDB(),
      useJournalEntriesStore.getState().loadFromDB(),
      useNotesIdeasStore.getState().loadFromDB(),
      useVendorsStore.getState().syncShortlistFromDB(),
      useVendorsStore.getState().initFromAPI(),
      useCateringStore.getState().initFromDB(),
      user ? useInquiryStore.getState().loadFromDB(user.id, user.role) : Promise.resolve(),
    ]);

    // All remaining stores (blob-pattern + named-column)
    if (coupleId) {
      const { hydrateAllStoresFromDB } = await import("@/lib/supabase/hydrate-stores");
      hydrateAllStoresFromDB(coupleId).catch(() => {});
    }
  } catch {
    // Silently swallow — hydration is best-effort
  }
}

export type AccountRole = "couple" | "vendor";

export type WeddingProfile = {
  weddingDate?: string;
  partnerName?: string;
  location?: string;
  guestCount?: number;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: AccountRole;
  createdAt: string;
  wedding?: WeddingProfile;
  needsOnboarding?: boolean;
};

export type AuthPromptReason =
  | "save-selection"
  | "send-inquiry"
  | "planning-tool"
  | "write-review"
  | "generic";

export type AuthTab = "signin" | "signup";

type AuthState = {
  user: User | null;

  // Modal state
  isModalOpen: boolean;
  modalTab: AuthTab;
  promptReason: AuthPromptReason;

  // Onboarding state
  isOnboardingOpen: boolean;

  openSignIn: (reason?: AuthPromptReason) => void;
  openSignUp: (reason?: AuthPromptReason) => void;
  setModalTab: (tab: AuthTab) => void;
  closeModal: () => void;

  signIn: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  signInAsDemo: (persona: "priya" | "rahul" | "vendor") => void;
  signUp: (input: {
    name: string;
    email: string;
    password: string;
    role: AccountRole;
  }) => Promise<{ ok: true; needsVerification?: boolean } | { ok: false; error: string }>;
  signInWithSocial: (provider: "google" | "apple") => Promise<{ ok: true } | { ok: false; error: string }>;
  forgotPassword: (email: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  resetPassword: (newPassword: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  signOut: () => Promise<void>;

  // Called on mount to hydrate user from active Supabase session
  syncSession: () => Promise<void>;

  openOnboarding: () => void;
  closeOnboarding: () => void;
  skipOnboarding: () => void;
  saveOnboarding: (profile: WeddingProfile) => void;
  // Inline-editable fields used by the dashboard header. Patches the
  // local user object; Supabase metadata is updated best-effort and
  // failures are silently ignored — local state is the source of truth.
  updateUserName: (name: string) => void;
  updateWedding: (patch: Partial<WeddingProfile>) => void;
};

async function getSupabase() {
  if (typeof window === "undefined") return null;
  try {
    const { supabaseBrowser } = await import("@/lib/supabase/browser-client");
    return supabaseBrowser;
  } catch {
    return null;
  }
}

// Guard: onAuthStateChange must only be registered once per app lifetime.
// Calling syncSession() multiple times (e.g. in both RootLayout and
// SiteLayout) would otherwise register a new listener on every call,
// causing duplicate hydration and multiple SIGNED_OUT set({ user: null }) calls.
let _authListenerRegistered = false;

function userFromSession(session: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  created_at: string;
}): User {
  const meta = session.user_metadata ?? {};
  return {
    id: session.id,
    name: (meta.name as string) ?? (meta.full_name as string) ?? (session.email?.split("@")[0] ?? "User"),
    email: session.email ?? "",
    role: (meta.role as AccountRole) ?? "couple",
    createdAt: session.created_at,
    wedding: (meta.wedding as WeddingProfile) ?? undefined,
    needsOnboarding: meta.needsOnboarding !== false,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isModalOpen: false,
      modalTab: "signin",
      promptReason: "generic",
      isOnboardingOpen: false,

      openSignIn: (reason = "generic") =>
        set({ isModalOpen: true, modalTab: "signin", promptReason: reason }),
      openSignUp: (reason = "generic") =>
        set({ isModalOpen: true, modalTab: "signup", promptReason: reason }),
      setModalTab: (tab) => set({ modalTab: tab }),
      closeModal: () => set({ isModalOpen: false }),

      signIn: async (email, password) => {
        const supabase = await getSupabase();

        if (!supabase) {
          // Fallback: allow any non-empty credentials in dev (no Supabase config)
          if (!email.includes("@")) return { ok: false, error: "Enter a valid email." };
          if (password.length < 1) return { ok: false, error: "Password required." };
          set({
            user: {
              id: `local_${Date.now()}`,
              name: email.split("@")[0],
              email,
              role: "couple",
              createdAt: new Date().toISOString(),
              needsOnboarding: false,
            },
            isModalOpen: false,
          });
          return { ok: true };
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error || !data.user) {
          return { ok: false, error: error?.message ?? "Sign in failed." };
        }
        set({ user: userFromSession(data.user), isModalOpen: false });
        hydrateAllStores();
        return { ok: true };
      },

      signUp: async ({ name, email, password, role }) => {
        if (!name.trim()) return { ok: false, error: "Please enter your name." };
        if (!email.includes("@")) return { ok: false, error: "Please enter a valid email." };
        if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };

        const supabase = await getSupabase();

        if (!supabase) {
          set({
            user: {
              id: `local_${Date.now()}`,
              name: name.trim(),
              email,
              role,
              createdAt: new Date().toISOString(),
              needsOnboarding: role === "couple",
            },
            isModalOpen: false,
            isOnboardingOpen: role === "couple",
          });
          return { ok: true };
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name: name.trim(), role, needsOnboarding: role === "couple" } },
        });
        if (error || !data.user) {
          return { ok: false, error: error?.message ?? "Sign up failed." };
        }
        // Supabase returns a session=null when email confirmation is required
        const needsVerification = !data.session;
        if (!needsVerification) {
          const newUser = userFromSession(data.user);
          set({ user: newUser, isModalOpen: false, isOnboardingOpen: role === "couple" });
          hydrateAllStores();
        } else {
          set({ isModalOpen: false });
        }
        return { ok: true, needsVerification };
      },

      signInAsDemo: (persona) => {
        if (process.env.NODE_ENV === 'production') return;
        const DEMO_USERS: Record<typeof persona, User> = {
          priya: {
            id: "demo_priya_001",
            name: "Priya Sharma",
            email: "priya@marigold.com",
            role: "couple",
            createdAt: "2024-01-15T10:00:00.000Z",
            needsOnboarding: false,
            wedding: {
              weddingDate: "2025-11-22",
              partnerName: "Arjun Mehta",
              location: "Mumbai",
              guestCount: 350,
            },
          },
          rahul: {
            id: "demo_rahul_002",
            name: "Rahul & Sneha",
            email: "rahul@marigold.com",
            role: "couple",
            createdAt: "2024-03-08T10:00:00.000Z",
            needsOnboarding: false,
            wedding: {
              weddingDate: "2025-02-14",
              partnerName: "Sneha Kapoor",
              location: "Delhi",
              guestCount: 200,
            },
          },
          vendor: {
            id: "demo_vendor_003",
            name: "Ravi Photography",
            email: "ravi@marigold.com",
            role: "vendor",
            createdAt: "2023-06-01T10:00:00.000Z",
            needsOnboarding: false,
          },
        };
        set({ user: DEMO_USERS[persona], isModalOpen: false });
      },

      signInWithSocial: async (provider) => {
        const supabase = await getSupabase();
        if (!supabase) return { ok: false, error: "Auth not available." };
        const redirectTo =
          typeof window !== "undefined"
            ? `${window.location.origin}/auth/callback`
            : "/auth/callback";
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: { redirectTo },
        });
        if (error) return { ok: false, error: error.message };
        return { ok: true };
      },

      forgotPassword: async (email) => {
        if (!email.includes("@")) return { ok: false, error: "Enter a valid email." };
        const supabase = await getSupabase();
        if (!supabase) return { ok: false, error: "Auth not available." };
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: typeof window !== "undefined"
            ? window.location.origin + "/reset-password"
            : "/reset-password",
        });
        if (error) return { ok: false, error: error.message };
        return { ok: true };
      },

      resetPassword: async (newPassword) => {
        if (newPassword.length < 8) return { ok: false, error: "Password must be at least 8 characters." };
        const supabase = await getSupabase();
        if (!supabase) return { ok: false, error: "Auth not available." };
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) return { ok: false, error: error.message };
        return { ok: true };
      },

      signOut: async () => {
        const supabase = await getSupabase();
        if (supabase) await supabase.auth.signOut();
        set({ user: null });
      },

      syncSession: async () => {
        const supabase = await getSupabase();
        if (!supabase) return;

        // One-time check for current session
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          const hadUser = !!get().user;
          set({ user: userFromSession(data.session.user) });
          if (!hadUser) hydrateAllStores();
        } else {
          set({ user: null });
        }

        // Keep Zustand in sync with any future auth events (OAuth redirect,
        // token refresh, sign-out from another tab, etc.).
        // Guard ensures only ONE listener is ever registered, even if
        // syncSession() is called from multiple components (e.g. RootLayout
        // and SiteLayout both mount SessionSync).
        if (_authListenerRegistered) return;
        _authListenerRegistered = true;
        supabase.auth.onAuthStateChange((event, session) => {
          if (session?.user) {
            const hadUser = !!get().user;
            set({ user: userFromSession(session.user) });
            if (!hadUser) hydrateAllStores();
          } else if (event === "SIGNED_OUT") {
            set({ user: null });
          }
        });
      },

      openOnboarding: () => set({ isOnboardingOpen: true }),
      closeOnboarding: () => set({ isOnboardingOpen: false }),
      skipOnboarding: () =>
        set((s) => ({
          isOnboardingOpen: false,
          user: s.user ? { ...s.user, needsOnboarding: false } : s.user,
        })),
      saveOnboarding: (profile) =>
        set((s) => {
          if (!s.user) return {};
          const updatedUser = {
            ...s.user,
            wedding: { ...s.user.wedding, ...profile },
            needsOnboarding: false,
          };
          return { user: updatedUser, isOnboardingOpen: false };
        }),

      updateUserName: (name) =>
        set((s) => {
          if (!s.user) return {};
          const trimmed = name.trim();
          if (!trimmed) return {};
          getSupabase().then((sb) => {
            if (sb) sb.auth.updateUser({ data: { name: trimmed } }).catch(() => {});
          });
          return { user: { ...s.user, name: trimmed } };
        }),

      updateWedding: (patch) =>
        set((s) => {
          if (!s.user) return {};
          const nextWedding = { ...s.user.wedding, ...patch };
          getSupabase().then((sb) => {
            if (sb) sb.auth.updateUser({ data: { wedding: nextWedding } }).catch(() => {});
          });
          return { user: { ...s.user, wedding: nextWedding } };
        }),
    }),
    {
      name: "ananya-auth",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
      partialize: (state) => ({ user: state.user }),
    },
  ),
);

export const useCurrentUser = () => useAuthStore((s) => s.user);
export const useIsSignedIn = () => useAuthStore((s) => s.user !== null);
