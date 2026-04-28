import { notFound } from "next/navigation";
import { WEDDINGS } from "@/lib/vendor-portal/seed";
import WeddingDetailView from "./WeddingDetailView";

export default function VendorWeddingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const wedding = WEDDINGS.find((w) => w.id === params.id);
  if (!wedding) notFound();
  return <WeddingDetailView wedding={wedding} />;
}

export function generateStaticParams() {
  return WEDDINGS.map((w) => ({ id: w.id }));
}
