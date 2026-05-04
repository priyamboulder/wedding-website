import { Suspense } from "react";

import { InviteEstimatorTool } from "@/components/marigold-tools/invite-estimator/InviteEstimatorTool";
import { pageMetadata } from "@/lib/marigold/seo";

export const metadata = pageMetadata({
  title: "Invite List Estimator — The Marigold Tool",
  description:
    "How many people is this actually? A 30-second sanity check on your guest list before you build the real one — both sides, every tier.",
});

export default function InviteEstimatorPage() {
  return (
    <Suspense fallback={null}>
      <InviteEstimatorTool />
    </Suspense>
  );
}
