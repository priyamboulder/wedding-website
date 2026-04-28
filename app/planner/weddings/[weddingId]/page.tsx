"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { WeddingHeader, type WeddingSubTab } from "@/components/planner/wedding/WeddingHeader";
import { VendorMatrix } from "@/components/planner/wedding/VendorMatrix";
import { getWeddingDetail } from "@/lib/planner/wedding-detail-seed";
import { PLANNER_PALETTE } from "@/components/planner/ui";

export default function WeddingDetailPage({
  params,
}: {
  params: Promise<{ weddingId: string }>;
}) {
  const { weddingId } = use(params);
  const wedding = useMemo(() => getWeddingDetail(weddingId), [weddingId]);
  const [activeTab, setActiveTab] = useState<WeddingSubTab>("vendors");

  if (!wedding) return <NotFoundState id={weddingId} />;

  const bookedCount = wedding.vendors.filter(
    (v) => v.status === "booked" || v.status === "contracted" || v.status === "ordered"
  ).length;

  return (
    <div>
      <WeddingHeader
        wedding={wedding}
        bookedCount={bookedCount}
        totalCount={wedding.vendors.length}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      {activeTab === "vendors" ? (
        <VendorMatrix wedding={wedding} />
      ) : (
        <ComingSoon tab={activeTab} />
      )}
    </div>
  );
}

function ComingSoon({ tab }: { tab: WeddingSubTab }) {
  const LABELS: Record<WeddingSubTab, string> = {
    vendors: "Vendors",
    timeline: "Timeline",
    budget: "Budget",
    guests: "Guests",
    tasks: "Tasks",
    messages: "Messages",
  };
  return (
    <section className="mx-auto max-w-[1280px] px-8 py-20 text-center">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.26em] text-[#9E8245]">
        {LABELS[tab]}
      </p>
      <h2
        className="mt-2 text-[28px] text-[#2C2C2C]"
        style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
      >
        This tab is coming next.
      </h2>
      <p
        className="mt-2 text-[13.5px] italic text-[#6a6a6a]"
        style={{ fontFamily: "'EB Garamond', serif" }}
      >
        The Vendor Matrix is the screen planners live in day-to-day — other tabs join soon.
      </p>
    </section>
  );
}

function NotFoundState({ id }: { id: string }) {
  return (
    <section className="mx-auto max-w-[720px] px-8 py-24 text-center">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.26em] text-[#C0392B]">
        Wedding not found
      </p>
      <h2
        className="mt-2 text-[32px] text-[#2C2C2C]"
        style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
      >
        No wedding matches "{id}"
      </h2>
      <p
        className="mt-3 text-[13.5px] italic text-[#6a6a6a]"
        style={{ fontFamily: "'EB Garamond', serif" }}
      >
        Double-check the link, or return to the weddings list.
      </p>
      <Link
        href="/planner"
        className="mt-6 inline-block rounded-full px-4 py-2 text-[12.5px] font-medium"
        style={{ backgroundColor: PLANNER_PALETTE.charcoal, color: "#FAF8F5" }}
      >
        ← Back to Dashboard
      </Link>
    </section>
  );
}
