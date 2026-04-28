"use client";

import { PageHeader } from "@/components/vendor-portal/ui";
import { BrideDiscoveryFeed } from "@/components/vendor-portal/discover/BrideDiscoveryFeed";
import { usePortalVendor } from "@/lib/vendor-portal/current-vendor";

export default function BrowseBridesPage() {
  const vendor = usePortalVendor();

  return (
    <>
      <PageHeader
        eyebrow="Discover"
        title="Browse brides"
        description="brides who are actively looking for a vendor in your category. introduce yourself — they decide whether to connect."
      />
      <BrideDiscoveryFeed vendor={vendor} />
    </>
  );
}
