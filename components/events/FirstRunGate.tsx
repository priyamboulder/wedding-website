"use client";

// ── First-run gate ─────────────────────────────────────────────────────────
// Wraps every route at the root layout. Until the couple has reached 6/6 on
// the brief at least once, the entire workspace is replaced with a full-
// bleed welcome → quiz flow. No top nav, no left rail, no escape hatches.
//
// Lifecycle:
//   hasCompletedOnce = false, hasStartedBrief = false → <WelcomeScreen />
//   hasCompletedOnce = false, hasStartedBrief = true  → <EventsQuizFlow />  (full-bleed)
//   hasCompletedOnce = true                           → children (normal app)
//
// hasCompletedOnce is set the first time completeQuiz() fires and never
// resets — "Start over" on the dashboard won't re-trap the couple in the
// gate. Partial completion persists via quiz.stepIndex, so a couple who
// closes the tab at question 3 lands back on question 3 next login.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useEventsStore } from "@/stores/events-store";
import { EventsQuizFlow } from "@/components/events/quiz/EventsQuizFlow";
import { WelcomeScreen } from "@/components/events/WelcomeScreen";

// Public marketing routes — always visible, never gated behind the quiz.
// Every browse / cart / read flow lives here; account creation is only
// prompted when the couple wants to save a cart or open the planner.
const MARKETING_PREFIXES = [
  "/marketplace",
  "/stationery",
  "/platform",
  "/for-vendors",
  "/journal",
  "/cart",
  // Vendor coordination portal — tokenised public route, no couple auth.
  "/coordination",
  // Community is public-read
  "/community",
  "/signup",
  "/login",
  "/auth",
];

// App routes that are accessible without completing the quiz.
// The quiz is surfaced as a guided prompt on the dashboard, not a hard block.
const APP_PREFIXES = [
  "/dashboard",
  "/studio",
  "/registry",
  "/guests",
  "/workspace",
  "/checklist",
  "/vendors",
  "/app",
  "/discovery",
  "/vendor",
];

function isMarketingPath(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname === "/") return true;
  return MARKETING_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function isAppPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return APP_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function FirstRunGate({ children }: { children: ReactNode }) {
  // Zustand + Next.js: defer the first read until after mount so server
  // markup (no access to localStorage) stays consistent with the first
  // client paint. Without this, a freshly-hydrated page briefly flashes
  // the full app before the gate snaps in.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const hasCompletedOnce = useEventsStore((s) => s.quiz.hasCompletedOnce);
  const hasStartedBrief = useEventsStore((s) => s.quiz.hasStartedBrief);

  // When the gate transitions from "gating" to "open" for the first time
  // (i.e. completion just landed), drop the couple onto the dashboard so
  // home — not the brief recap — is their first impression of the app.
  // Subsequent sessions skip this redirect — we only fire on the edge.
  const router = useRouter();
  const pathname = usePathname();
  const prevCompleted = useRef<boolean | null>(null);
  useEffect(() => {
    if (!hydrated) return;
    if (prevCompleted.current === false && hasCompletedOnce) {
      if (pathname !== "/dashboard") router.push("/dashboard");
    }
    prevCompleted.current = hasCompletedOnce;
  }, [hydrated, hasCompletedOnce, pathname, router]);

  // Marketing pages are always accessible — browse, read, add to cart, no
  // gate. We short-circuit before the hydration guard so public routes
  // render server-side without a blank flash.
  if (isMarketingPath(pathname)) {
    return <>{children}</>;
  }

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-[#F5F1EA] animate-pulse" aria-hidden="true" />
    );
  }

  // App routes (studio, registry, guests, workspace, dashboard, checklist, etc.)
  // are always accessible. The onboarding quiz is offered as a guided prompt
  // on the dashboard, not a hard block — couples can explore the app first.
  if (hasCompletedOnce || isAppPath(pathname)) {
    return <>{children}</>;
  }

  if (!hasStartedBrief) {
    return <WelcomeScreen />;
  }

  // Mid-quiz: drop straight into the quiz, full-bleed (no TopNav / rail).
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-1">
        <EventsQuizFlow />
      </main>
    </div>
  );
}
