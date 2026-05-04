import { Suspense } from "react";

import { VendorChecklistTool } from "@/components/marigold-tools/vendor-checklist/VendorChecklistTool";
import { pageMetadata } from "@/lib/marigold/seo";

export const metadata = pageMetadata({
  title: "Vendor Checklist by Event Count — The Marigold Tool",
  description:
    "Who do you actually need to hire? Pick your events and we'll hand back a complete vendor checklist — required, recommended, and optional — with booking windows.",
});

export default function VendorChecklistPage() {
  return (
    <Suspense fallback={null}>
      <VendorChecklistTool />
    </Suspense>
  );
}
