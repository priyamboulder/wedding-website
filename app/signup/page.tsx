"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

// useSearchParams() requires a Suspense boundary in Next.js 16 App Router.
function SignupInner() {
  const openSignUp = useAuthStore((s) => s.openSignUp);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check user from store snapshot — don't subscribe, just read once.
    const user = useAuthStore.getState().user;
    if (user) {
      const redirect = searchParams.get("redirect") ?? "/app";
      router.replace(redirect);
      return;
    }
    openSignUp("generic");

    // Subscribe to user changes so we redirect once they sign in.
    const unsub = useAuthStore.subscribe((state) => {
      if (state.user) {
        unsub();
        const redirect = searchParams.get("redirect") ?? "/app";
        router.replace(redirect);
      }
    });
    return unsub;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export default function SignupPage() {
  // Blank parchment background while the modal opens
  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <Suspense fallback={null}>
        <SignupInner />
      </Suspense>
    </div>
  );
}
