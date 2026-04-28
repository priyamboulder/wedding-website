"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

// Runs once on mount: syncs the Supabase session into Zustand and
// registers the onAuthStateChange listener for OAuth redirects, token
// refreshes, and cross-tab sign-outs.
//
// useSearchParams() requires a Suspense boundary in Next.js 16 App Router.
// SessionSyncInner holds the hook; SessionSync wraps it in <Suspense>.
function SessionSyncInner() {
  const syncSession = useAuthStore((s) => s.syncSession);
  const openSignIn = useAuthStore((s) => s.openSignIn);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    syncSession();

    const authError = searchParams.get("auth_error");
    if (authError) {
      openSignIn("generic");
      // Strip the param from the URL without a reload
      const url = new URL(window.location.href);
      url.searchParams.delete("auth_error");
      router.replace(url.pathname + (url.search || ""));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export function SessionSync() {
  return (
    <Suspense fallback={null}>
      <SessionSyncInner />
    </Suspense>
  );
}
