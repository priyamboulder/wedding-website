"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TopNav } from "@/components/shell/TopNav";
import { PartnershipDetail } from "@/components/partnerships/PartnershipDetail";

export default function CreatorPartnershipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <TopNav>
        <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-faint">
          Creator · Partnership
        </div>
      </TopNav>
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <Link
          href="/dashboard/creator/partnerships"
          className="mb-4 inline-flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-faint hover:text-ink"
        >
          <ArrowLeft size={11} strokeWidth={1.6} />
          Back to partnerships
        </Link>
        <PartnershipDetail proposalId={id} perspective="creator" />
      </div>
    </div>
  );
}
