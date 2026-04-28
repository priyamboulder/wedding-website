"use client";

// ── The Grapevine tab ───────────────────────────────────────────────────────
// Header (eyebrow + serif headline + subline) → start-thread CTA → two-column
// layout (feed left, sidebar right). Mirrors the Community page editorial
// shell so it sits naturally next to Blog / Real Weddings / The Confessional.
//
// Sub-navigation pills (topic filter) live inside the feed component.
// Filtering by ?vendor=ID limits the feed to threads tagged to a specific
// vendor — used by the amber alert and storefront indicators.

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Grape, X } from "lucide-react";
import { useGrapevineStore } from "@/stores/grapevine-store";
import { useVendorsStore } from "@/stores/vendors-store";
import type { GrapevineSortKey } from "@/types/grapevine";
import { GrapevineFeed } from "./GrapevineFeed";
import { GrapevineStartThread } from "./GrapevineStartThread";
import { GrapevineThreadForm } from "./GrapevineThreadForm";
import { GrapevineThreadCard } from "./GrapevineThreadCard";
import { GrapevineHowItWorks } from "./sidebar/GrapevineHowItWorks";
import { GrapevineTrending } from "./sidebar/GrapevineTrending";
import { GrapevineMostHelpful } from "./sidebar/GrapevineMostHelpful";
import { GrapevineVendorAlert } from "./sidebar/GrapevineVendorAlert";
import type { TopicFilter } from "./GrapevineTopicPills";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";

export function GrapevineTab() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ensureSeeded = useGrapevineStore((s) => s.ensureSeeded);

  useEffect(() => {
    ensureSeeded();
  }, [ensureSeeded]);

  const [topic, setTopic] = useState<TopicFilter>("all");
  const [sort, setSort] = useState<GrapevineSortKey>("newest");
  const [creating, setCreating] = useState(false);

  // Vendor filter is URL-driven so the amber alerts deep-link in.
  const vendorFilterId = searchParams?.get("vendor") ?? null;
  const vendors = useVendorsStore((s) => s.vendors);
  const vendorFilterName = useMemo(
    () =>
      vendorFilterId
        ? vendors.find((v) => v.id === vendorFilterId)?.name ?? "this vendor"
        : null,
    [vendors, vendorFilterId],
  );

  const clearVendorFilter = () => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.delete("vendor");
    params.set("tab", "the-grapevine");
    router.replace(`/community?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="bg-white px-6 py-10 md:px-10">
      <div className="mx-auto max-w-6xl">
        <Header />

        {vendorFilterId && (
          <VendorFilterBanner
            vendorId={vendorFilterId}
            vendorName={vendorFilterName ?? "this vendor"}
            onClear={clearVendorFilter}
          />
        )}

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-6">
            <GrapevineStartThread onStart={() => setCreating(true)} />
            {vendorFilterId ? (
              <VendorFilteredFeed vendorId={vendorFilterId} />
            ) : (
              <GrapevineFeed
                topic={topic}
                sort={sort}
                onTopicChange={setTopic}
                onSortChange={setSort}
                onStart={() => setCreating(true)}
              />
            )}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
            <GrapevineHowItWorks />
            <GrapevineVendorAlert />
            <GrapevineTrending />
            <GrapevineMostHelpful />
          </aside>
        </div>
      </div>

      {creating && <GrapevineThreadForm onClose={() => setCreating(false)} />}
    </div>
  );
}

function Header() {
  return (
    <header>
      <p
        className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-gold"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        Community
      </p>
      <h2 className="mt-2 flex items-center gap-3 font-serif text-[40px] font-bold leading-[1.05] tracking-[-0.005em] text-ink">
        <Grape size={32} strokeWidth={1.5} className="text-saffron" />
        the grapevine.
      </h2>
      <p className="mt-1.5 max-w-[620px] font-serif text-[16px] italic text-ink-muted">
        the honest conversations brides have when vendors aren't listening.
      </p>
    </header>
  );
}

function VendorFilterBanner({
  vendorId,
  vendorName,
  onClear,
}: {
  vendorId: string;
  vendorName: string;
  onClear: () => void;
}) {
  void vendorId;
  return (
    <div className="mt-6 flex items-center justify-between gap-3 rounded-xl border border-saffron/40 bg-saffron/8 px-4 py-3">
      <p className="text-[12.5px] text-ink">
        showing every grapevine thread tagged to{" "}
        <span className="font-medium">{vendorName}</span>.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="inline-flex items-center gap-1 rounded-full border border-saffron/40 bg-white px-3 py-1 text-[11.5px] font-medium text-ink hover:bg-ivory-warm/60"
      >
        clear filter
        <X size={11} strokeWidth={2} />
      </button>
    </div>
  );
}

function VendorFilteredFeed({ vendorId }: { vendorId: string }) {
  const threads = useGrapevineStore((s) => s.threads);
  const myProfileId = useCommunityProfilesStore((s) => s.myProfileId);
  const list = useMemo(
    () =>
      useGrapevineStore.getState().listThreads({
        vendorId,
        sort: "newest",
        topic: "all",
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [threads, vendorId],
  );

  if (list.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-gold/25 bg-ivory-warm/30 px-6 py-12 text-center">
        <p className="font-serif text-[18px] italic text-ink">
          no threads tagged to this vendor yet.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      {list.map((t) => (
        <GrapevineThreadCard
          key={t.id}
          thread={t}
          currentUserId={myProfileId ?? undefined}
        />
      ))}
    </section>
  );
}
