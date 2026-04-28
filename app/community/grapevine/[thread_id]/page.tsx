"use client";

"use client";

// ── /community/grapevine/[thread_id] ────────────────────────────────────────
// Standalone, shareable thread page. Wraps the same Community shell so the
// top nav stays consistent, then renders the thread detail component.
// "use client" is required here so <RealtimeProvider /> can activate
// Supabase subscriptions when users navigate directly to a thread URL.

import { use } from "react";
import { TopNav } from "@/components/shell/TopNav";
import { GrapevineThreadDetail } from "@/components/community/grapevine/GrapevineThreadDetail";
import { RealtimeProvider } from "@/app/community/_components/RealtimeProvider";

export default function GrapevineThreadPage({
  params,
}: {
  params: Promise<{ thread_id: string }>;
}) {
  const { thread_id } = use(params);
  return (
    <div className="min-h-screen bg-white">
      <RealtimeProvider />
      <TopNav />
      <main>
        <GrapevineThreadDetail threadId={thread_id} />
      </main>
    </div>
  );
}
