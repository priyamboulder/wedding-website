// ══════════════════════════════════════════════════════════════════════════
//   /studio/editor/[designId] — Canvas editor for a single user_design.
//
//   The DesignEditor client component resolves the design from the Zustand
//   store (localStorage-backed) and wires saves back through it. Once the
//   Supabase client is configured this page becomes a server component that
//   fetches the `user_designs` row and hands it to DesignEditor as a prop.
// ══════════════════════════════════════════════════════════════════════════

import type { Metadata } from "next";
import { DesignEditor } from "@/components/studio/editor/DesignEditor";

export const metadata: Metadata = {
  title: "Ananya Studio · Editor",
};

// Client-state backed today; switch to `export const dynamic = 'force-dynamic'`
// + a server fetch when Supabase lands. generateStaticParams is intentionally
// omitted — every design id is user-created at runtime.

export default async function EditorPage({
  params,
}: {
  params: Promise<{ designId: string }>;
}) {
  const { designId } = await params;
  return <DesignEditor designId={designId} />;
}
