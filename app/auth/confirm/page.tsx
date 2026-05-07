"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

// Handles OAuth code exchange in the browser so the session lands in
// localStorage (where supabaseBrowser expects it), then syncs into Zustand.
//
// useSearchParams() requires a Suspense boundary in Next.js 16 App Router.
// AuthConfirmInner holds the hook; AuthConfirmPage wraps it.
function AuthConfirmInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const syncSession = useAuthStore((s) => s.syncSession);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) { router.replace("/"); return; }

    import("@/lib/supabase/browser-client").then(async ({ supabaseBrowser }) => {
      const { error } = await supabaseBrowser.auth.exchangeCodeForSession(code);
      if (error) {
        router.replace(`/?auth_error=${encodeURIComponent(error.message)}`);
        return;
      }
      await syncSession();
      router.replace("/dashboard");
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export default function AuthConfirmPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F5F0]">
      <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 14, color: "#A8998A" }}>
        Signing you in…
      </p>
      <Suspense fallback={null}>
        <AuthConfirmInner />
      </Suspense>
    </div>
  );
}
