import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  fetchSessionBySlug,
  fetchSessionQA,
} from "@/lib/grapevine-ama/queries";
import { SessionPage } from "@/components/grapevine-ama/SessionPage";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Per-session SEO. Live and upcoming sessions share the same shape — we
// always inject the session title + expert name + tags into meta tags so
// archived sessions become evergreen SEO landing pages.
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const session = await fetchSessionBySlug(supabase, slug);
  if (!session) return {};
  const tags = (session.tags ?? []).join(", ");
  return {
    title: `${session.title} | The Grapevine — The Marigold`,
    description:
      `${session.expert_name}${session.expert_title ? `, ${session.expert_title},` : ""} answers ${session.total_answered} questions from real couples${tags ? ` about ${tags}` : ""}. Browse the full AMA.`,
    openGraph: {
      title: `${session.title} | The Grapevine`,
      description: session.description ?? undefined,
      type: "article",
    },
  };
}

export default async function GrapevineSessionPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await fetchSessionBySlug(supabase, slug);
  if (!session) notFound();

  // Pre-render the QA so the page is content-rich at first paint and
  // search-indexable. The client component takes over for live updates,
  // upvotes, and reactions once it mounts.
  await fetchSessionQA(supabase, session.id);

  return <SessionPage slug={slug} />;
}
