import { redirect } from "next/navigation";

export default async function MarketplaceRedirect({
  params,
}: {
  params: Promise<{ weddingId: string }>;
}) {
  const { weddingId } = await params;
  redirect(`/${weddingId}/shopping?mode=pre-loved`);
}
