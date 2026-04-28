import { notFound } from "next/navigation";
import { DocumentsShell } from "@/components/documents/DocumentsShell";
import { DOCUMENT_TABS, type DocumentTabId } from "@/types/documents";

// Support /documents/contracts, /documents/invoices, etc. The "slug" used in
// the URL doesn't always match the internal tab id (e.g. "legal" ↔ "legal_admin").
const SLUG_TO_TAB: Record<string, DocumentTabId> = Object.fromEntries(
  DOCUMENT_TABS.filter((t) => t.slug).map((t) => [t.slug, t.id]),
) as Record<string, DocumentTabId>;

export default async function DocumentsTabPage({
  params,
}: {
  params: Promise<{ tab: string }>;
}) {
  const { tab } = await params;
  const mapped = SLUG_TO_TAB[tab];
  if (!mapped) notFound();
  return <DocumentsShell initialTab={mapped} />;
}
