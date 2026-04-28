"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PartnershipDetail } from "@/components/partnerships/PartnershipDetail";

export default function VendorPartnershipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <div className="px-8 py-8">
      <Link
        href="/vendor/partnerships"
        className="mb-4 inline-flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-faint hover:text-ink"
      >
        <ArrowLeft size={11} strokeWidth={1.6} />
        Back to partnerships
      </Link>
      <PartnershipDetail proposalId={id} perspective="vendor" />
    </div>
  );
}
