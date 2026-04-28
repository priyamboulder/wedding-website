"use client";

// ── Public guest sign-up page ─────────────────────────────────────────────
// Route: /signup/mehendi/[slug] — the shareable link destination for the
// couple's mehendi guests. Resolves the slug back to a mehndi workspace
// by prefix-matching the stored EventSetup category_id, then renders the
// same GuestSignupPreview component the couple previews in-app.
//
// Note: persistence is localStorage-only by design. In production this
// page would talk to a backend; for now, it works when a guest visits
// on the same device as the couple's browser (preview link sharing).

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { GuestSignupPreview } from "@/components/workspace/mehndi/GuestSignupPreview";
import { useMehndiStore } from "@/stores/mehndi-store";

export default function PublicMehendiSignupPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";
  const setups = useMehndiStore((s) => s.setups);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const matched = hydrated
    ? setups.find((x) => x.category_id.slice(0, 12) === slug)
    : null;

  if (!hydrated) {
    return (
      <main className="min-h-screen bg-ivory px-4 py-10">
        <div className="mx-auto max-w-3xl text-center text-[13px] text-ink-muted">
          Loading…
        </div>
      </main>
    );
  }

  if (!matched) {
    return (
      <main className="min-h-screen bg-ivory px-4 py-12">
        <div className="mx-auto max-w-lg rounded-md border border-border bg-white px-5 py-8 text-center">
          <p
            className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-rose"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Sign-up not found
          </p>
          <h1 className="font-serif text-[22px] text-ink">
            This link isn&apos;t active yet
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
            Ask the couple for a fresh link, or check back closer to the
            event — they may not have opened sign-ups yet.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ivory px-4 py-10 md:py-14">
      <GuestSignupPreview categoryId={matched.category_id} />
    </main>
  );
}
